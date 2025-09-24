import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PersonalTransaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

interface RecentTransactionsTableProps {
  transactions: PersonalTransaction[];
  onDelete: (id: string) => void;
}

export const RecentTransactionsTable = ({ transactions, onDelete }: RecentTransactionsTableProps) => {
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
            <TableHead>Ações</TableHead>
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
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(transaction.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};