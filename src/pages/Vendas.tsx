import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { BarChart } from '@/components/BarChart';
import { SalesTable } from '@/components/SalesTable';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { SaleModal } from '@/components/SaleModal';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, Package, DollarSign } from 'lucide-react';

export const Vendas = () => {
  const { sales, logout, addSale } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = useMemo(() => {
    const brandTotals = sales.reduce((acc, sale) => {
      acc[sale.brand] = (acc[sale.brand] || 0) + sale.profit;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sales]);

  const summary = useMemo(() => {
    const totalVendas = sales.reduce((sum, s) => sum + s.sale_price, 0);
    const totalCusto = sales.reduce((sum, s) => sum + s.cost_price, 0);
    const totalLucro = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalProdutos = sales.length;

    return {
      vendas: totalVendas,
      custo: totalCusto,
      lucro: totalLucro,
      produtos: totalProdutos,
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
      <Navbar onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Controle de Vendas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas vendas e analise o desempenho por marca
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Total Custo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {formatCurrency(summary.custo)}
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
              <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {summary.produtos}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Lucro por Marca</CardTitle>
              <CardDescription>
                Desempenho de lucro por marca de produtos
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
              {sales.length > 0 ? (
                <SalesTable sales={sales.slice(0, 8)} />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhuma venda registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
        
        <SaleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addSale}
        />
      </main>
    </div>
  );
};