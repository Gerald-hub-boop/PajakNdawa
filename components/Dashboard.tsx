import React from 'react';
import { DashboardData } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, FileText, Wallet } from 'lucide-react';

interface DashboardProps {
  data: DashboardData | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Biru, Hijau, Kuning

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) return <div className="p-8 text-center text-gray-500">Memuat data dashboard...</div>;

  const chartData = [
    { name: 'PPN', value: data.breakdown.ppn },
    { name: 'PPh 23', value: data.breakdown.pph23 },
    { name: 'PPh 21', value: data.breakdown.pph21 },
  ].filter(d => d.value > 0);

  // Fungsi helper format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pajak Terhutang</p>
            <h3 className="text-2xl font-bold text-gray-800">{formatRupiah(data.total_tax)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-800">{data.total_transactions}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <h3 className="text-lg font-bold text-green-600">Aman</h3>
          </div>
        </div>
      </div>

      {/* Grafik Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Komposisi Jenis Pajak</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatRupiah(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Belum ada data pajak untuk ditampilkan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
