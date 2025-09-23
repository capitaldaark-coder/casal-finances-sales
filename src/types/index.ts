// Interface para transações financeiras pessoais
export interface PersonalTransaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  value: number;
  category: string;
  transaction_date: string; // Formato ISO: '2025-09-22T10:00:00Z'
}

// Interface para as vendas de produtos
export interface Sale {
  id: string;
  product_description: string;
  brand: 'Avon' | 'O Boticário' | 'Natura' | 'Eudora' | 'Outra';
  cost_price: number;
  sale_price: number;
  profit: number; // Deve ser calculado (sale_price - cost_price) no momento da criação
  sale_date: string; // Formato ISO
}

// Interface para as anotações do usuário
export interface Note {
  content: string;
  updated_at: string;
}

// Interface para o contexto da aplicação
export interface AppContextType {
  isAuthenticated: boolean;
  personalTransactions: PersonalTransaction[];
  sales: Sale[];
  notes: Note;
  login: () => void;
  logout: () => void;
  addTransaction: (transaction: Omit<PersonalTransaction, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => void;
  updateNotes: (content: string) => void;
}