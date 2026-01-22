# Panduan Pengembangan & Arsitektur TaxManager (MVP)

Halo! Saya adalah instruktur Senior Tech Lead Anda hari ini. Dokumen ini adalah "peta jalan" kita sebelum masuk ke kode. Jangan di-skip ya, karena coding tanpa desain itu seperti membangun rumah tanpa denah.

## 1. Gambaran Besar Sistem (Konsep)

Kita akan membuat "Buku Catatan Digital" pintar. 
- **Frontend (Wajah):** Tempat user mengisi form ("Saya bayar jasa konsultan 10 juta").
- **Backend (Otak):** Menerima data, memastikan hitungan pajaknya benar sesuai rumus PPh/PPN, lalu menyimpannya.
- **Database (Ingatan):** File sederhana (`tax.db`) yang menyimpan semua riwayat transaksi.

## 2. Arsitektur Sistem

Kita menggunakan pola **Client-Server** sederhana:

```
[User Browser (React)]  <-->  [API Server (FastAPI)]  <-->  [Database (SQLite)]
     (Frontend)                    (Backend)                   (Storage)
```

**Kenapa desain ini?**
- **Separation of Concerns:** Urusan tampilan pisah dengan urusan logika berat.
- **Scalability:** Kalau nanti butuh Mobile App, backend-nya tetap sama.
- **FastAPI:** Sangat cepat dan otomatis membuat dokumentasi API.
- **SQLite:** Tidak butuh install server database berat. Cukup satu file.

## 3. Desain Database

Kita butuh 2 tabel utama.

### Tabel A: `users`
Untuk menyimpan siapa yang boleh masuk.
- `id` (Integer, Primary Key): ID unik.
- `username` (String): Nama login.
- `password_hash` (String): Password yang sudah diacak (jangan simpan plain text!).

### Tabel B: `transactions`
Untuk menyimpan data pajak.
- `id` (Integer, PK): ID unik transaksi.
- `date` (Date): Tanggal transaksi.
- `tax_type` (String): 'ppn', 'pph21', 'pph23'.
- `dpp` (Integer): Dasar Pengenaan Pajak (Nominal asli).
- `tax_rate` (Float): Tarif pajak (misal 0.11 untuk 11%).
- `tax_amount` (Integer): Hasil hitungan pajak.
- `description` (String): Catatan transaksi.
- `created_at` (DateTime): Kapan data diinput.

## 4. Daftar Endpoint API

Backend kita akan menyediakan "pintu" (endpoint) berikut:

1.  `POST /token`: Untuk login (tukar username/password jadi token akses).
2.  `GET /transactions`: Ambil semua data pajak.
3.  `POST /transactions`: Simpan data pajak baru (hitung otomatis di sini).
4.  `DELETE /transactions/{id}`: Hapus data salah.
5.  `GET /dashboard`: Ambil ringkasan total pajak untuk grafik.

## 5. Cara Menjalankan Aplikasi

### Persiapan Backend (Python)
Pastikan Python sudah terinstall.
1.  Buka terminal, masuk ke folder `backend`.
2.  Install library: `pip install fastapi uvicorn sqlalchemy pydantic passlib[bcrypt] python-jose python-multipart`
3.  Jalankan server: `uvicorn main:app --reload`
4.  Server jalan di `http://127.0.0.1:8000`.

### Persiapan Frontend (React)
1.  Kode React ada di folder utama.
2.  Pastikan backend jalan agar fitur bisa berfungsi (Login, Simpan Data).
3.  (Di lingkungan preview ini, frontend akan mencoba konek ke localhost, jika gagal akan muncul error network).

---

**Tips Senior Engineer:**
Selalu validasi data di dua tempat. Frontend validasi untuk UX (biar user tau salah ngetik), Backend validasi untuk Keamanan (biar hacker gak bisa tembus).