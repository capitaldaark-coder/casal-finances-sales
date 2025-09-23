// Interface para transações financeiras pessoais
export interface PersonalTransaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  category: string;
  transaction_date: string;
  payment_method?: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
  credit_card?: string;
  bank?: string;
  due_date?: string;
  installments?: number;
  current_installment?: number;
}

// Interface para clientes
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_date: string;
}

// Interface para pagamentos de vendas
export interface SalePayment {
  id: string;
  sale_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
}

// Interface para as vendas de produtos
export interface Sale {
  id: string;
  product_description: string;
  brand: 'Avon' | 'O Boticário' | 'Natura' | 'Eudora' | 'Outra';
  cost_price: number;
  sale_price: number;
  profit: number;
  sale_date: string;
  customer_id: string;
  payment_type: 'vista' | 'parcelado';
  installments: number;
  installment_value: number;
  payments: SalePayment[];
  status: 'pendente' | 'parcial' | 'quitado';
}

// Interface para as anotações do usuário
export interface Note {
  content: string;
  updated_at: string;
}

// Interface para filtros de período
export interface PeriodFilter {
  type: 'diario' | 'semanal' | 'mensal';
  startDate: string;
  endDate: string;
}

// Interface para o contexto da aplicação
export interface AppContextType {
  isAuthenticated: boolean;
  personalTransactions: PersonalTransaction[];
  sales: Sale[];
  customers: Customer[];
  notes: Note;
  periodFilter: PeriodFilter;
  login: () => void;
  logout: () => void;
  addTransaction: (transaction: Omit<PersonalTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'profit' | 'payments' | 'status'>) => void;
  deleteSale: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_date'>) => void;
  deleteCustomer: (id: string) => void;
  addSalePayment: (saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>) => void;
  updateNotes: (content: string) => void;
  setPeriodFilter: (filter: PeriodFilter) => void;
  clearAllData: () => void;
}