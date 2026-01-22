import { API_BASE_URL } from '../constants';
import { CreateTransactionPayload } from '../types';

/* 
  Pola Service Layer:
  Memisahkan logika pemanggilan API dari komponen UI.
  Jika URL backend berubah, kita cuma perlu ganti di satu file ini.
*/

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login Gagal. Cek username/password.');
    return res.json();
  },

  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal mengambil data transaksi');
    return res.json();
  },

  createTransaction: async (data: CreateTransactionPayload) => {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal menyimpan transaksi');
    return res.json();
  },

  deleteTransaction: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Gagal menghapus data');
    return res.json();
  },

  getDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getHeaders(),
    });
    // Fallback if backend is down during UI preview
    if (!res.ok) return { total_tax: 0, total_transactions: 0, breakdown: { ppn: 0, pph21: 0, pph23: 0 } };
    return res.json();
  },
};
