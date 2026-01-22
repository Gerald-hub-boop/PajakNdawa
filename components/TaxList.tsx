import React from 'react';
import { Transaction } from '../types';
import { TAX_LABELS } from '../constants';
import { Trash2 } from 'lucide-react';

interface TaxListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export const TaxList: React.FC<TaxListProps> = ({ transactions, onDelete }) => {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Riwayat Transaksi Terakhir</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Jenis Pajak</th>
              <th className="px-6 py-3">Keterangan</th>
              <th className="px-6 py-3 text-right">Nominal (DPP)</th>
              <th className="px-6 py-3 text-right">Nilai Pajak</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Belum ada data transaksi. Silakan input data baru.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${t.tax_type === 'ppn' ? 'bg-blue-100 text-blue-800' : 
                        t.tax_type === 'pph21' ? 'bg-green-100 text-green-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {t.tax_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatRupiah(t.dpp)}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">{formatRupiah(t.tax_amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm('Yakin hapus data ini?')) onDelete(t.id);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
