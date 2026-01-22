import React, { useState, useEffect } from 'react';
import { TaxType } from '../types';
import { api } from '../services/api';
import { Loader2, Save } from 'lucide-react';

interface TaxFormProps {
  onSuccess: () => void;
}

export const TaxForm: React.FC<TaxFormProps> = ({ onSuccess }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxType, setTaxType] = useState<string>(TaxType.PPN);
  const [dpp, setDpp] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [manualRate, setManualRate] = useState<number>(5); // Default 5% untuk PPh 21
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewTax, setPreviewTax] = useState(0);

  // --- LOGIKA EDUKASI: Perhitungan Preview di Frontend ---
  // Kita hitung di sini supaya user langsung tahu estimasi pajaknya sebelum simpan.
  useEffect(() => {
    if (!dpp) {
      setPreviewTax(0);
      return;
    }

    const nominal = Number(dpp);
    let amount = 0;

    if (taxType === TaxType.PPN) {
      amount = nominal * 0.11; // 11%
    } else if (taxType === TaxType.PPH23) {
      amount = nominal * 0.02; // 2%
    } else if (taxType === TaxType.PPH21) {
      amount = nominal * (manualRate / 100);
    }

    setPreviewTax(amount);
  }, [dpp, taxType, manualRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpp) return;
    
    setLoading(true);
    setError('');

    try {
      await api.createTransaction({
        date,
        tax_type: taxType,
        dpp: Number(dpp),
        description,
        manual_rate_percent: taxType === TaxType.PPH21 ? manualRate : undefined
      });
      // Reset Form
      setDpp('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan transaksi. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Save size={20} className="text-blue-600"/> Input Transaksi Baru
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Jenis Pajak */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pajak</label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value={TaxType.PPN}>PPN (11%) - Pembelian Barang/Jasa</option>
              <option value={TaxType.PPH23}>PPh 23 (2%) - Sewa/Jasa</option>
              <option value={TaxType.PPH21}>PPh 21 (Manual) - Gaji/Honor</option>
            </select>
          </div>
        </div>

        {/* Input Khusus PPh 21 */}
        {taxType === TaxType.PPH21 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <label className="block text-sm font-medium text-blue-800 mb-1">Tarif Efektif PPh 21 (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={manualRate}
                onChange={(e) => setManualRate(Number(e.target.value))}
                className="w-24 p-2 border border-blue-200 rounded-lg focus:outline-none"
              />
              <span className="text-blue-600 text-sm">% (Masukkan sesuai tabel TER atau hitungan manual)</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DPP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (DPP)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">Rp</span>
              <input
                type="number"
                min="0"
                required
                value={dpp}
                onChange={(e) => setDpp(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1000000"
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview Hitungan */}
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex flex-col justify-center">
            <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Estimasi Pajak</span>
            <span className="text-xl font-bold text-gray-800">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(previewTax)}
            </span>
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Transaksi</label>
          <input
            type="text"
            required
            placeholder="Contoh: Pembayaran Jasa Konsultan IT"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
};
