import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Dashboard } from './components/Dashboard';
import { TaxForm } from './components/TaxForm';
import { TaxList } from './components/TaxList';
import { DashboardData, Transaction } from './types';
import { LayoutDashboard, PlusCircle, List, LogOut, ShieldCheck } from 'lucide-react';

/* 
  App.tsx berfungsi sebagai "Conductor" atau Pengatur.
  Dia menyimpan state global (User login, Tab aktif, Data).
  Anak-anaknya (Components) hanya menerima data dan menampilkan.
*/

const App: React.FC = () => {
  // State Autentikasi
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State Aplikasi
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'list'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- LOGIKA DATA FETCHING ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dash, trans] = await Promise.all([
        api.getDashboard(),
        api.getTransactions()
      ]);
      setDashboardData(dash);
      setTransactions(trans);
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, activeTab]);

  // --- LOGIKA AUTH ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.access_token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setAuthError('Login gagal. Coba username: admin, password: admin123 (jika backend baru dijalankan).');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setDashboardData(null);
    setTransactions([]);
  };

  // TAMPILAN LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
            <ShieldCheck className="mx-auto text-white mb-2" size={48} />
            <h1 className="text-2xl font-bold text-white">TaxManager Indonesia</h1>
            <p className="text-blue-100 mt-2">Masuk untuk mengelola pajak perusahaan</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {authError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{authError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="admin123"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Masuk Sistem
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Hint: Jalankan backend dulu. Default: admin / admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN UTAMA APLIKASI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Sederhana */}
      <aside className="bg-white w-full md:w-64 border-r border-gray-200 flex flex-col md:fixed md:h-full z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <span className="font-bold text-gray-800">TaxManager</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'input' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PlusCircle size={20} /> Input Pajak
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List size={20} /> Data Transaksi
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'dashboard' && 'Ringkasan Pajak'}
              {activeTab === 'input' && 'Input Data Baru'}
              {activeTab === 'list' && 'Daftar Transaksi'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Kelola perpajakan perusahaan dengan mudah.</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            User: {username || 'Admin'}
          </div>
        </header>

        {loading && !dashboardData ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="fade-in">
            {activeTab === 'dashboard' && <Dashboard data={dashboardData} />}
            {activeTab === 'input' && (
              <div className="max-w-3xl">
                <TaxForm onSuccess={() => {
                  setActiveTab('list');
                  fetchData();
                }} />
              </div>
            )}
            {activeTab === 'list' && (
              <TaxList 
                transactions={transactions} 
                onDelete={async (id) => {
                  try {
                    await api.deleteTransaction(id);
                    fetchData(); // Refresh data
                  } catch (e) {
                    alert('Gagal hapus data');
                  }
                }} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
