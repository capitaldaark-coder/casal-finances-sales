import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BarChart } from '@/components/BarChart';
import { SalesTable } from '@/components/SalesTable';
import { NewSaleModal } from '@/components/NewSaleModal';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, TrendingUp, Package, DollarSign, Plus, AlertCircle, Users, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Sale {
  id: string;
  cliente_id: string;
  valor_total: number;
  lucro_total: number;
  data_venda: string;
  forma_pagamento: string;
  numero_parcelas: number;
}

interface Customer {
  id: string;
  nome: string;
}

export const Vendas = () => {
  const { signOut } = useSupabase();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do Supabase
  useEffect(() => {
    fetchData();
  }, []);

  // Recarregar dados quando o modal fechar
  useEffect(() => {
    if (!isModalOpen) {
      fetchData();
    }
  }, [isModalOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesResult, customersResult, productsResult] = await Promise.all([
        supabase.from('vendas').select('*').order('data_venda', { ascending: false }),
        supabase.from('clientes').select('id, nome'),
        supabase.from('produtos').select('id', { count: 'exact', head: true })
      ]);

      if (salesResult.data) setSales(salesResult.data);
      if (customersResult.data) {
        setCustomers(customersResult.data);
        setCustomersCount(customersResult.data.length);
      }
      if (productsResult.count !== null) setProductsCount(productsResult.count);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase.from('vendas').delete().eq('id', id);
      if (!error) {
        setSales(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
    }
  };

  const chartData = useMemo(() => {
    const customerTotals = sales.reduce((acc, sale) => {
      const customer = customers.find(c => c.id === sale.cliente_id);
      const customerName = customer?.nome || 'Cliente não encontrado';
      acc[customerName] = (acc[customerName] || 0) + sale.lucro_total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sales, customers]);

  const summary = useMemo(() => {
    const totalVendas = sales.reduce((sum, s) => sum + s.valor_total, 0);
    const totalLucro = sales.reduce((sum, s) => sum + s.lucro_total, 0);
    const totalTransacoes = sales.length;

    return {
      vendas: totalVendas,
      lucro: totalLucro,
      transacoes: totalTransacoes,
    };
  }, [sales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={signOut} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Controle de Vendas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas vendas e analise o desempenho por marca
          </p>
        </div>

        {/* Alertas de Sistema Vazio */}
        {(customersCount === 0 || productsCount === 0) && (
          <Alert className="mb-6 border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              <p className="font-semibold mb-2">Atenção! Sistema precisa de dados para funcionar:</p>
              <div className="flex flex-wrap gap-3">
                {customersCount === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/clientes')}
                    className="border-warning text-warning hover:bg-warning/20"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Cadastrar Clientes
                  </Button>
                )}
                {productsCount === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/produtos')}
                    className="border-warning text-warning hover:bg-warning/20"
                  >
                    <Box className="h-4 w-4 mr-2" />
                    Cadastrar Produtos
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(summary.vendas)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(summary.lucro)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {summary.transacoes}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Lucro por Cliente</CardTitle>
              <CardDescription>
                Desempenho de lucro por cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <BarChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhuma venda registrada ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Vendas Recentes</CardTitle>
              <CardDescription>
                Suas últimas vendas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesTable 
                sales={sales.slice(0, 8)} 
                customers={customers}
                onDelete={deleteSale} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            size="lg"
            disabled={customersCount === 0 || productsCount === 0}
            className="bg-gradient-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Venda
          </Button>
          {(customersCount === 0 || productsCount === 0) && (
            <p className="text-sm text-muted-foreground">
              Cadastre clientes e produtos antes de registrar vendas
            </p>
          )}
        </div>
        
        <NewSaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
};