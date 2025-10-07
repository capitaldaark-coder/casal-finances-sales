import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

interface Customer {
  id: string;
  nome: string;
  telefone: string;
}

interface Product {
  id: string;
  nome: string;
  codigo_barras: string;
  preco_venda: number;
  preco_custo: number;
  quantidade_estoque: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
}

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewSaleModal = ({ isOpen, onClose }: NewSaleModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar clientes do banco de dados
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar clientes:', error);
        return;
      }
      
      setCustomers(data || []);
    };

    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;

    setIsLoading(true);

    try {
      // Buscar produto pelo código de barras
      const { data: product, error } = await supabase
        .from('produtos')
        .select('id, nome, codigo_barras, preco_venda, preco_custo, quantidade_estoque')
        .eq('codigo_barras', barcodeInput.trim())
        .single();

      if (error || !product) {
        toast({
          title: 'Produto não encontrado',
          description: 'Código de barras não cadastrado no sistema.',
          variant: 'destructive',
        });
        setBarcodeInput('');
        setIsLoading(false);
        return;
      }

      if (product.quantidade_estoque <= 0) {
        toast({
          title: 'Produto fora de estoque',
          description: `${product.nome} não possui estoque disponível.`,
          variant: 'destructive',
        });
        setBarcodeInput('');
        setIsLoading(false);
        return;
      }

      // Verificar se o produto já está na lista
      const existingItemIndex = saleItems.findIndex(item => item.product_id === product.id);
      
      if (existingItemIndex >= 0) {
        // Incrementar quantidade se já existe
        const updatedItems = [...saleItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + 1;
        
        if (newQuantity > product.quantidade_estoque) {
          toast({
            title: 'Estoque insuficiente',
            description: `Apenas ${product.quantidade_estoque} unidades disponíveis.`,
            variant: 'destructive',
          });
          setBarcodeInput('');
          setIsLoading(false);
          return;
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity;
        setSaleItems(updatedItems);
      } else {
        // Adicionar novo item
        const newItem: SaleItem = {
          product_id: product.id,
          product_name: product.nome,
          quantity: 1,
          unit_price: product.preco_venda,
          cost_price: product.preco_custo,
        };
        setSaleItems(prev => [...prev, newItem]);
      }

      setBarcodeInput('');
      
      // Manter foco no campo de código de barras
      setTimeout(() => {
        const barcodeField = document.getElementById('barcode-input');
        barcodeField?.focus();
      }, 100);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar produto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = getProductByBarcode(''); // Precisamos encontrar o produto pelo ID
    // Aqui seria ideal ter um método getProductById
    
    setSaleItems(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleFinalizeSale = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente para a venda.',
        variant: 'destructive',
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um produto à venda.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Calcular totais
      const totalValue = saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const totalCost = saleItems.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
      const profit = totalValue - totalCost;

      // Inserir venda
      const { data: sale, error: saleError } = await supabase
        .from('vendas')
        .insert({
          cliente_id: selectedCustomer,
          valor_total: totalValue,
          lucro_total: profit,
        })
        .select()
        .single();

      if (saleError || !sale) {
        throw new Error(saleError?.message || 'Erro ao criar venda');
      }

      // Inserir itens da venda
      const itemsToInsert = saleItems.map(item => ({
        venda_id: sale.id,
        produto_id: item.product_id,
        quantidade: item.quantity,
        preco_unitario: item.unit_price,
        preco_custo: item.cost_price,
        subtotal: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('itens_venda')
        .insert(itemsToInsert);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      // Atualizar estoque dos produtos
      for (const item of saleItems) {
        const { error: stockError } = await supabase.rpc(
          'atualizar_estoque',
          { 
            produto_id: item.product_id, 
            quantidade: -item.quantity 
          }
        );

        if (stockError) {
          console.error('Erro ao atualizar estoque:', stockError);
        }
      }

      // Atualizar saldo devedor do cliente
      const { error: debtError } = await supabase.rpc(
        'atualizar_saldo_devedor',
        {
          cliente_id: selectedCustomer,
          valor: totalValue
        }
      );

      if (debtError) {
        console.error('Erro ao atualizar saldo devedor:', debtError);
      }

      // Reset form
      setSelectedCustomer('');
      setSaleItems([]);
      setBarcodeInput('');

      toast({
        title: 'Sucesso',
        description: 'Venda registrada com sucesso!',
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar venda. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCustomer('');
    setSaleItems([]);
    setBarcodeInput('');
    onClose();
  };

  const totalValue = saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Nova Venda
          </DialogTitle>
          <DialogDescription>
            Registre uma nova venda selecionando cliente e adicionando produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.nome} - {customer.telefone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Código de Barras */}
          <div className="space-y-2">
            <Label htmlFor="barcode-input">Código de Barras</Label>
            <form onSubmit={handleBarcodeSubmit}>
              <Input
                id="barcode-input"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Escaneie ou digite o código de barras"
                autoFocus
              />
            </form>
          </div>

          {/* Lista de Itens */}
          {saleItems.length > 0 && (
            <div className="space-y-2">
              <Label>Itens da Venda</Label>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-20">Qtd</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-10">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleItems.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                            className="w-16 text-center"
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product_id)}
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
            </div>
          )}

          {/* Total da Venda */}
          {saleItems.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total da Venda</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          )}

          {/* Alertas */}
          {customers.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-warning" />
              <p className="text-sm text-warning">
                Nenhum cliente cadastrado. Cadastre clientes antes de fazer vendas.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleFinalizeSale}
            disabled={!selectedCustomer || saleItems.length === 0 || isLoading}
            className="bg-gradient-primary"
          >
            {isLoading ? 'Processando...' : 'Finalizar Venda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};