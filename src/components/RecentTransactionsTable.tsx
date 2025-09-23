import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PersonalTransaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentTransactionsTableProps {
  transactions: PersonalTransaction[];
}

export const RecentTransactionsTable = ({ transactions }: RecentTransactionsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {transaction.description}
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>
                <Badge 
                  variant={transaction.type === 'receita' ? 'default' : 'destructive'}
                  className={transaction.type === 'receita' ? 'bg-success hover:bg-success/80' : ''}
                >
                  {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                </Badge>
              </TableCell>
              <TableCell className={`font-semibold ${
                transaction.type === 'receita' ? 'text-success' : 'text-destructive'
              }`}>
                {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.value)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(transaction.transaction_date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};