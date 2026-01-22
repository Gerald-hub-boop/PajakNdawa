import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- KONFIGURASI DATABASE & KEAMANAN ---
# SQLite akan membuat file 'tax.db' otomatis.
SQLALCHEMY_DATABASE_URL = "sqlite:///./tax.db"
# KUNCI RAHASIA untuk token JWT (Di production, taruh di .env!)
SECRET_KEY = "rahasia_perusahaan_pajak_indonesia_sangat_aman"
ALGORITHM = "HS256"

# Setup Database
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Setup Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- DATABASE MODELS (Representasi Tabel) ---
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class TransactionDB(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    tax_type = Column(String) # 'ppn', 'pph21', 'pph23'
    dpp = Column(Integer) # Dasar Pengenaan Pajak
    tax_rate = Column(Float) # Persentase (0.11, 0.02, dll)
    tax_amount = Column(Integer) # Nominal Pajak
    description = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.now)

# Buat tabel jika belum ada
Base.metadata.create_all(bind=engine)

# --- PYDANTIC SCHEMAS (Validasi Data API) ---
class TransactionCreate(BaseModel):
    date: datetime.date
    tax_type: str
    dpp: int
    description: str
    manual_rate_percent: Optional[float] = None # Hanya untuk PPh 21

class TransactionResponse(TransactionCreate):
    id: int
    tax_rate: float
    tax_amount: int
    created_at: datetime.datetime
    
    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_tax: int
    total_transactions: int
    breakdown: dict

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

# --- UTILITIES ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- LOGIKA BISNIS PAJAK (Sangat Penting!) ---
def calculate_tax(tax_type: str, dpp: int, manual_rate: float = 0):
    """
    Pusat logika perhitungan pajak.
    Engineer yang baik memusatkan logika di satu fungsi biar mudah di-test.
    """
    rate = 0.0
    amount = 0

    if tax_type == 'ppn':
        rate = 0.11 # Tarif Tetap 11% (UU HPP)
    elif tax_type == 'pph23':
        rate = 0.02 # Tarif Umum Jasa 2%
    elif tax_type == 'pph21':
        # PPh 21 sangat kompleks (TER/Progresif).
        # Untuk MVP, kita pakai input manual dari user (persen).
        rate = manual_rate / 100
    
    amount = int(dpp * rate)
    return rate, amount

# --- INITIAL DATA SEEDER ---
# Biar pas dijalankan pertama kali, sudah ada user admin.
def init_db():
    db = SessionLocal()
    user = db.query(UserDB).filter(UserDB.username == "admin").first()
    if not user:
        admin_user = UserDB(username="admin", hashed_password=get_password_hash("admin123"))
        db.add(admin_user)
        db.commit()
    db.close()

init_db()

# --- API APP ---
app = FastAPI(title="TaxManager API")

# Mengizinkan Frontend (React) mengakses Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Di production, ganti spesifik domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS ---

@app.post("/token", response_model=Token)
async def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Username atau password salah")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(TransactionDB).order_by(TransactionDB.date.desc()).all()

@app.post("/transactions", response_model=TransactionResponse)
def create_transaction(item: TransactionCreate, db: Session = Depends(get_db)):
    # 1. Hitung Pajak (Server Side Calculation)
    rate, amount = calculate_tax(item.tax_type, item.dpp, item.manual_rate_percent or 0)
    
    # 2. Simpan ke Database
    new_trx = TransactionDB(
        date=item.date,
        tax_type=item.tax_type,
        dpp=item.dpp,
        description=item.description,
        tax_rate=rate,
        tax_amount=amount
    )
    db.add(new_trx)
    db.commit()
    db.refresh(new_trx)
    return new_trx

@app.delete("/transactions/{trx_id}")
def delete_transaction(trx_id: int, db: Session = Depends(get_db)):
    trx = db.query(TransactionDB).filter(TransactionDB.id == trx_id).first()
    if not trx:
        raise HTTPException(status_code=404, detail="Data tidak ditemukan")
    db.delete(trx)
    db.commit()
    return {"message": "Berhasil dihapus"}

@app.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)):
    txs = db.query(TransactionDB).all()
    
    total_tax = sum(t.tax_amount for t in txs)
    breakdown = {
        "ppn": sum(t.tax_amount for t in txs if t.tax_type == 'ppn'),
        "pph21": sum(t.tax_amount for t in txs if t.tax_type == 'pph21'),
        "pph23": sum(t.tax_amount for t in txs if t.tax_type == 'pph23'),
    }
    
    return {
        "total_tax": total_tax,
        "total_transactions": len(txs),
        "breakdown": breakdown
    }
