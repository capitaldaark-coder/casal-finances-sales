import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';

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

interface SalesTableProps {
  sales: Sale[];
  customers?: Customer[];
  onDelete?: (id: string) => void;
}

export const SalesTable = ({ sales, customers = [], onDelete }: SalesTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.nome || 'Cliente não encontrado';
  };

  const getPaymentLabel = (method: string, installments: number) => {
    const labels: Record<string, string> = {
      dinheiro: 'Dinheiro',
      debito: 'Débito',
      credito: installments > 1 ? `Crédito ${installments}x` : 'Crédito',
      pix: 'PIX'
    };
    return labels[method] || method;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Pagamento</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Lucro</TableHead>
          <TableHead>Data</TableHead>
          {onDelete && <TableHead>Ações</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={onDelete ? 6 : 5} className="text-center text-muted-foreground">
              Nenhuma venda registrada
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{getCustomerName(sale.cliente_id)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getPaymentLabel(sale.forma_pagamento, sale.numero_parcelas)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(sale.valor_total)}</TableCell>
              <TableCell className="text-success font-medium">{formatCurrency(sale.lucro_total)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(sale.data_venda)}
              </TableCell>
              {onDelete && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(sale.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
