import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, PersonalTransaction, Sale, Customer, Note, PeriodFilter, SalePayment } from '@/types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personalTransactions, setPersonalTransactions] = useState<PersonalTransaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notes, setNotes] = useState<Note>({ content: '', updated_at: new Date().toISOString() });
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    type: 'mensal',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
  });

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addTransaction = (transaction: Omit<PersonalTransaction, 'id'>) => {
    const newTransaction: PersonalTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setPersonalTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setPersonalTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'profit' | 'payments' | 'status'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      profit: sale.sale_price - sale.cost_price,
      payments: [],
      status: 'pendente'
    };
    setSales(prev => [newSale, ...prev]);
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'created_date'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    // Remove vendas associadas ao cliente
    setSales(prev => prev.filter(s => s.customer_id !== id));
  };

  const addSalePayment = (saleId: string, payment: Omit<SalePayment, 'id' | 'sale_id'>) => {
    const newPayment: SalePayment = {
      ...payment,
      id: Date.now().toString(),
      sale_id: saleId,
    };

    setSales(prev => prev.map(sale => {
      if (sale.id === saleId) {
        const updatedPayments = [...sale.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let status: 'pendente' | 'parcial' | 'quitado' = 'pendente';
        if (totalPaid >= sale.sale_price) {
          status = 'quitado';
        } else if (totalPaid > 0) {
          status = 'parcial';
        }

        return {
          ...sale,
          payments: updatedPayments,
          status
        };
      }
      return sale;
    }));
  };

  const updateNotes = (content: string) => {
    setNotes({
      content,
      updated_at: new Date().toISOString(),
    });
  };

  const clearAllData = () => {
    setPersonalTransactions([]);
    setSales([]);
    setCustomers([]);
    setNotes({ content: '', updated_at: new Date().toISOString() });
  };

  const value: AppContextType = {
    isAuthenticated,
    personalTransactions,
    sales,
    customers,
    notes,
    periodFilter,
    login,
    logout,
    addTransaction,
    deleteTransaction,
    addSale,
    deleteSale,
    addCustomer,
    deleteCustomer,
    addSalePayment,
    updateNotes,
    setPeriodFilter,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};