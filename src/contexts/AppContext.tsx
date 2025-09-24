import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, PersonalTransaction, Sale, Customer, Product, CustomerPayment, Note, PeriodFilter, SalePayment, SaleItem } from '@/types';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
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

  const addSale = (saleData: { customer_id: string; items: Omit<SaleItem, 'id' | 'total_price'>[] }) => {
    // Calcular totais e criar itens da venda
    const saleItems: SaleItem[] = saleData.items.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      total_price: item.quantity * item.unit_price
    }));

    const totalValue = saleItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Calcular lucro baseado no preço de custo dos produtos
    const totalCost = saleItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + (product?.cost_price || 0) * item.quantity;
    }, 0);

    const newSale: Sale = {
      id: Date.now().toString(),
      customer_id: saleData.customer_id,
      items: saleItems,
      total_value: totalValue,
      profit: totalValue - totalCost,
      sale_date: new Date().toISOString(),
      payment_type: 'vista', // Padrão, pode ser editado depois
      installments: 1,
      installment_value: totalValue,
      payments: [],
      status: 'pendente'
    };

    setSales(prev => [newSale, ...prev]);

    // Atualizar estoque dos produtos
    saleItems.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.product_id 
          ? { ...product, stock_quantity: product.stock_quantity - item.quantity }
          : product
      ));
    });

    // Atualizar saldo devedor do cliente
    setCustomers(prev => prev.map(customer => 
      customer.id === saleData.customer_id 
        ? { ...customer, current_debt: customer.current_debt + totalValue }
        : customer
    ));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'created_date' | 'current_debt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      current_debt: 0,
      created_date: new Date().toISOString(),
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    // Remove vendas associadas ao cliente
    setSales(prev => prev.filter(s => s.customer_id !== id));
    // Remove pagamentos do cliente
    setCustomerPayments(prev => prev.filter(p => p.customer_id !== id));
  };

  const addProduct = (product: Omit<Product, 'id' | 'created_date'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updatedProduct } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode && product.status === 'ativo');
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
        if (totalPaid >= sale.total_value) {
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

  const addCustomerPayment = (payment: Omit<CustomerPayment, 'id'>) => {
    const newPayment: CustomerPayment = {
      ...payment,
      id: Date.now().toString(),
    };
    
    setCustomerPayments(prev => [newPayment, ...prev]);
    
    // Reduzir saldo devedor do cliente
    setCustomers(prev => prev.map(customer => 
      customer.id === payment.customer_id 
        ? { ...customer, current_debt: Math.max(0, customer.current_debt - payment.amount) }
        : customer
    ));
  };

  const getCustomerPurchaseHistory = (customerId: string): Sale[] => {
    return sales.filter(sale => sale.customer_id === customerId);
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
    setProducts([]);
    setCustomerPayments([]);
    setNotes({ content: '', updated_at: new Date().toISOString() });
  };

  const value: AppContextType = {
    isAuthenticated,
    personalTransactions,
    sales,
    customers,
    products,
    customerPayments,
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
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    addSalePayment,
    addCustomerPayment,
    getCustomerPurchaseHistory,
    updateNotes,
    setPeriodFilter,
    clearAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};