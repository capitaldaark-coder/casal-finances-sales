import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SalesTableProps {
  sales: Sale[];
}

export const SalesTable = ({ sales }: SalesTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getBrandColor = (brand: Sale['brand']) => {
    const colors = {
      'Avon': 'bg-purple-100 text-purple-800',
      'O Boticário': 'bg-green-100 text-green-800',
      'Natura': 'bg-orange-100 text-orange-800',
      'Eudora': 'bg-pink-100 text-pink-800',
      'Outra': 'bg-gray-100 text-gray-800',
    };
    return colors[brand];
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">
                {sale.product_description}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getBrandColor(sale.brand)}>
                  {sale.brand}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCurrency(sale.cost_price)}
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(sale.sale_price)}
              </TableCell>
              <TableCell className="font-semibold text-success">
                +{formatCurrency(sale.profit)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(sale.sale_date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};