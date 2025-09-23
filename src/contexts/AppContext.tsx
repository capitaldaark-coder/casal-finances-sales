import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, PersonalTransaction, Sale, Note } from '@/types';
import { mockPersonalTransactions, mockSales, mockNote } from '@/data/mocks';

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
  const [notes, setNotes] = useState<Note>(mockNote);

  useEffect(() => {
    // Simular carregamento de dados mockados quando usuário faz login
    if (isAuthenticated) {
      setPersonalTransactions(mockPersonalTransactions);
      setSales(mockSales);
    } else {
      setPersonalTransactions([]);
      setSales([]);
    }
  }, [isAuthenticated]);

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

  const addSale = (sale: Omit<Sale, 'id' | 'profit'>) => {
    const newSale: Sale = {
      ...sale,
      id: Date.now().toString(),
      profit: sale.sale_price - sale.cost_price,
    };
    setSales(prev => [newSale, ...prev]);
  };

  const updateNotes = (content: string) => {
    setNotes({
      content,
      updated_at: new Date().toISOString(),
    });
  };

  const value: AppContextType = {
    isAuthenticated,
    personalTransactions,
    sales,
    notes,
    login,
    logout,
    addTransaction,
    addSale,
    updateNotes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};