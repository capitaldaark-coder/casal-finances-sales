import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { DoughnutChart } from '@/components/DoughnutChart';
import { RecentTransactionsTable } from '@/components/RecentTransactionsTable';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { TransactionModal } from '@/components/TransactionModal';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const Financas = () => {
  const { personalTransactions, logout, addTransaction } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const chartData = useMemo(() => {
    const categoryTotals = personalTransactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.value;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [personalTransactions]);

  const summary = useMemo(() => {
    const totalReceitas = personalTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);

    const totalDespesas = personalTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo: totalReceitas - totalDespesas,
    };
  }, [personalTransactions]);

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
            Finanças Pessoais
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada das suas receitas e despesas
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(summary.receitas)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(summary.despesas)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summary.saldo >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(summary.saldo)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>
                Distribuição das suas despesas por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <DoughnutChart data={chartData} />
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Nenhuma despesa registrada ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-card bg-gradient-card">
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Suas últimas movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {personalTransactions.length > 0 ? (
                <RecentTransactionsTable 
                  transactions={personalTransactions.slice(0, 8)} 
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Nenhuma transação registrada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
        
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addTransaction}
        />
      </main>
    </div>
  );
};