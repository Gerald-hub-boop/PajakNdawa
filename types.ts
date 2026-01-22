// Enum untuk tipe pajak menjaga konsistensi data
export enum TaxType {
  PPN = 'ppn',
  PPH21 = 'pph21',
  PPH23 = 'pph23',
}

export interface Transaction {
  id: number;
  date: string;
  tax_type: TaxType;
  dpp: number;
  tax_rate: number;
  tax_amount: number;
  description: string;
  created_at: string;
}

export interface DashboardData {
  total_tax: number;
  total_transactions: number;
  breakdown: {
    ppn: number;
    pph21: number;
    pph23: number;
  };
}

export interface CreateTransactionPayload {
  date: string;
  tax_type: string;
  dpp: number;
  description: string;
  manual_rate_percent?: number;
}
