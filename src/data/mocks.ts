import { PersonalTransaction, Sale, Note } from '@/types';

export const mockPersonalTransactions: PersonalTransaction[] = [
  {
    id: '1',
    type: 'receita',
    description: 'Salário Alex',
    value: 3500,
    category: 'Salário',
    transaction_date: '2024-09-01T10:00:00Z'
  },
  {
    id: '2',
    type: 'receita',
    description: 'Salário Bia',
    value: 2800,
    category: 'Salário',
    transaction_date: '2024-09-01T11:00:00Z'
  },
  {
    id: '3',
    type: 'despesa',
    description: 'Supermercado',
    value: 450,
    category: 'Alimentação',
    transaction_date: '2024-09-05T15:30:00Z'
  },
  {
    id: '4',
    type: 'despesa',
    description: 'Conta de Luz',
    value: 180,
    category: 'Casa',
    transaction_date: '2024-09-10T14:00:00Z'
  },
  {
    id: '5',
    type: 'despesa',
    description: 'Gasolina',
    value: 120,
    category: 'Transporte',
    transaction_date: '2024-09-12T08:45:00Z'
  },
  {
    id: '6',
    type: 'receita',
    description: 'Freelance',
    value: 800,
    category: 'Renda Extra',
    transaction_date: '2024-09-15T16:20:00Z'
  },
  {
    id: '7',
    type: 'despesa',
    description: 'Internet',
    value: 89,
    category: 'Casa',
    transaction_date: '2024-09-18T12:00:00Z'
  },
  {
    id: '8',
    type: 'despesa',
    description: 'Farmácia',
    value: 65,
    category: 'Saúde',
    transaction_date: '2024-09-20T17:15:00Z'
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    product_description: 'Perfume Kaiak Masculino',
    brand: 'Natura',
    cost_price: 45,
    sale_price: 75,
    profit: 30,
    sale_date: '2024-09-02T14:30:00Z'
  },
  {
    id: '2',
    product_description: 'Batom Matte',
    brand: 'Avon',
    cost_price: 15,
    sale_price: 28,
    profit: 13,
    sale_date: '2024-09-05T10:15:00Z'
  },
  {
    id: '3',
    product_description: 'Hidratante Corporal',
    brand: 'O Boticário',
    cost_price: 25,
    sale_price: 42,
    profit: 17,
    sale_date: '2024-09-08T16:45:00Z'
  },
  {
    id: '4',
    product_description: 'Perfume Essencial',
    brand: 'Natura',
    cost_price: 60,
    sale_price: 95,
    profit: 35,
    sale_date: '2024-09-12T11:20:00Z'
  },
  {
    id: '5',
    product_description: 'Kit Maquiagem',
    brand: 'Eudora',
    cost_price: 80,
    sale_price: 140,
    profit: 60,
    sale_date: '2024-09-15T13:00:00Z'
  },
  {
    id: '6',
    product_description: 'Shampoo Premium',
    brand: 'O Boticário',
    cost_price: 20,
    sale_price: 35,
    profit: 15,
    sale_date: '2024-09-18T09:30:00Z'
  }
];

export const mockNote: Note = {
  content: 'Lembrar de comprar produtos para o estoque da próxima semana.',
  updated_at: '2024-09-20T15:00:00Z'
};