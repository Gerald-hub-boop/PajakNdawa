// URL Backend FastAPI. Pastikan backend berjalan di port ini.
export const API_BASE_URL = 'http://127.0.0.1:8000';

export const TAX_LABELS: Record<string, string> = {
  ppn: 'PPN (Pajak Pertambahan Nilai)',
  pph21: 'PPh 21 (Orang Pribadi)',
  pph23: 'PPh 23 (Jasa/Sewa)',
};
