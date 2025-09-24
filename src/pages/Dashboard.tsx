import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SummaryCard } from '@/components/SummaryCard';
import { ToolsWidget } from '@/components/ToolsWidget';
import { useAppContext } from '@/contexts/AppContext';
import { DollarSign, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';

export const Dashboard = () => {
  const { personalTransactions, sales, products, logout, clearAllData } = useAppContext();
  const navigate = useNavigate();

  const financialSummary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = personalTransactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalReceitas = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);

    const totalDespesas = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    const saldo = totalReceitas - totalDespesas;

    return [
      { label: 'Receitas', value: totalReceitas },
      { label: 'Despesas', value: totalDespesas },
      { label: 'Saldo', value: saldo },
      { label: 'Transações', value: monthlyTransactions.length, format: 'number' as const }
    ];
  }, [personalTransactions]);

  const salesSummary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlySales = sales.filter(s => {
      const saleDate = new Date(s.sale_date);
      return saleDate.getMonth() === currentMonth && 
             saleDate.getFullYear() === currentYear;
    });

    const totalVendas = monthlySales.reduce((sum, sale) => sum + sale.total_value, 0);
    const totalLucro = monthlySales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalCusto = monthlySales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.product_id);
        return itemSum + ((product?.cost_price || 0) * item.quantity);
      }, 0);
    }, 0);

    return [
      { label: 'Vendas', value: totalVendas },
      { label: 'Lucro', value: totalLucro },
      { label: 'Custo', value: totalCusto },
      { label: 'Produtos', value: monthlySales.length, format: 'number' as const }
    ];
  }, [sales, products]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogout={logout} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard Geral
          </h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças e vendas do mês atual
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SummaryCard
            title="Finanças Pessoais"
            description="Controle de receitas e despesas"
            kpis={financialSummary}
            buttonText="Ver Detalhes"
            onClickButton={() => navigate('/financas')}
            icon={<Wallet className="h-5 w-5" />}
          />

          <SummaryCard
            title="Controle de Vendas"
            description="Acompanhamento de vendas e lucros"
            kpis={salesSummary}
            buttonText="Ver Vendas"
            onClickButton={() => navigate('/vendas')}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
        </div>

        <div className="flex justify-center">
          <ToolsWidget />
        </div>
      </main>
    </div>
  );
};