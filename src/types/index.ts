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

// Interface para produtos
export interface Product {
  id: string;
  name: string;
  barcode: string;
  description?: string;
  sale_price: number;
  cost_price?: number;
  stock_quantity: number;
  minimum_stock?: number;
  category?: string;
  status: 'ativo' | 'inativo';
  created_date: string;
}

// Interface para clientes
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  current_debt: number; // Saldo devedor atual
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

// Interface para itens de venda (produtos vendidos)
export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Interface para as vendas de produtos
export interface Sale {
  id: string;
  customer_id: string;
  items: SaleItem[];
  total_value: number;
  profit: number;
  sale_date: string;
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

// Interface para pagamentos de clientes (quitação de dívidas)
export interface CustomerPayment {
  id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia';
  description?: string;
}

// Interface para o contexto da aplicação
export interface AppContextType {
  isAuthenticated: boolean;
  personalTransactions: PersonalTransaction[];
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  customerPayments: CustomerPayment[];
  notes: Note;
  periodFilter: PeriodFilter;
  login: () => void;
  logout: () => void;
  addTransaction: (transaction: Omit<PersonalTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addSale: (saleData: { customer_id: string; items: Omit<SaleItem, 'id' | 'total_price'>[] }) => void;
  deleteSale: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_date' | 'current_debt'>) => void;
  deleteCustomer: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_date'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  addSalePayment: (saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>) => void;
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id'>) => void;
  getCustomerPurchaseHistory: (customerId: string) => Sale[];
  updateNotes: (content: string) => void;
  setPeriodFilter: (filter: PeriodFilter) => void;
  clearAllData: () => void;
}