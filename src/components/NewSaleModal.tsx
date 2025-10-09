import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Search, CreditCard, Banknote, Smartphone, Plus, Minus, AlertCircle, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'debito' | 'credito' | 'pix'>('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [amountReceived, setAmountReceived] = useState('');
  const [discount, setDiscount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar clientes e produtos
  useEffect(() => {
    const fetchData = async () => {
      const [customersResult, productsResult] = await Promise.all([
        supabase.from('clientes').select('id, nome, telefone').order('nome'),
        supabase.from('produtos').select('id, nome, codigo_barras, preco_venda, preco_custo, quantidade_estoque').order('nome')
      ]);

      if (customersResult.data) setCustomers(customersResult.data);
      if (productsResult.data) setProducts(productsResult.data);
    };

    if (isOpen) {
      fetchData();
      // Reset form
      setSelectedCustomer('');
      setSaleItems([]);
      setSearchQuery('');
      setPaymentMethod('dinheiro');
      setInstallments(1);
      setAmountReceived('');
      setDiscount('0');
    }
  }, [isOpen]);

  // Filtrar produtos pela busca
  const filteredProducts = products.filter(p => 
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.codigo_barras && p.codigo_barras.includes(searchQuery))
  );

  const handleAddProduct = (product: Product) => {
    if (product.quantidade_estoque <= 0) {
      toast({
        title: 'Produto sem estoque',
        description: `${product.nome} não possui estoque disponível.`,
        variant: 'destructive',
      });
      return;
    }

    const existingItemIndex = saleItems.findIndex(item => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + 1;
      
      if (newQuantity > product.quantidade_estoque) {
        toast({
          title: 'Estoque insuficiente',
          description: `Apenas ${product.quantidade_estoque} unidades disponíveis.`,
          variant: 'destructive',
        });
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setSaleItems(updatedItems);
    } else {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.nome,
        quantity: 1,
        unit_price: product.preco_venda,
        cost_price: product.preco_custo,
      };
      setSaleItems(prev => [...prev, newItem]);
    }
    
    setSearchQuery('');
  };

  const handleRemoveItem = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setSaleItems(prev => 
      prev.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return item;
          
          const product = products.find(p => p.id === productId);
          if (product && newQuantity > product.quantidade_estoque) {
            toast({
              title: 'Estoque insuficiente',
              description: `Apenas ${product.quantidade_estoque} unidades disponíveis.`,
              variant: 'destructive',
            });
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const subtotal = saleItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountValue = parseFloat(discount) || 0;
  const totalValue = subtotal - discountValue;
  const change = paymentMethod === 'dinheiro' && amountReceived 
    ? Math.max(0, parseFloat(amountReceived) - totalValue) 
    : 0;

  const handleFinalizeSale = async () => {
    if (!selectedCustomer) {
      toast({
        title: 'Cliente não selecionado',
        description: 'Por favor, selecione um cliente para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (saleItems.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione pelo menos um produto à venda.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'dinheiro') {
      const received = parseFloat(amountReceived) || 0;
      if (received < totalValue) {
        toast({
          title: 'Valor insuficiente',
          description: 'O valor recebido é menor que o total da venda.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const totalCost = saleItems.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0);
      const profit = totalValue - totalCost;

      // Inserir venda
      const { data: sale, error: saleError } = await supabase
        .from('vendas')
        .insert({
          cliente_id: selectedCustomer,
          valor_total: totalValue,
          lucro_total: profit,
          forma_pagamento: paymentMethod,
          numero_parcelas: paymentMethod === 'credito' ? installments : 1,
          valor_recebido: paymentMethod === 'dinheiro' ? parseFloat(amountReceived) : null,
          troco: paymentMethod === 'dinheiro' ? change : null,
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

      // Atualizar estoque
      for (const item of saleItems) {
        const { data: currentProduct } = await supabase
          .from('produtos')
          .select('quantidade_estoque')
          .eq('id', item.product_id)
          .single();

        if (currentProduct) {
          await supabase
            .from('produtos')
            .update({ 
              quantidade_estoque: currentProduct.quantidade_estoque - item.quantity 
            })
            .eq('id', item.product_id);
        }
      }

      // Atualizar saldo devedor
      const { data: currentCustomer } = await supabase
        .from('clientes')
        .select('saldo_devedor')
        .eq('id', selectedCustomer)
        .single();

      if (currentCustomer) {
        await supabase
          .from('clientes')
          .update({ 
            saldo_devedor: currentCustomer.saldo_devedor + totalValue 
          })
          .eq('id', selectedCustomer);
      }

      toast({
        title: 'Venda realizada com sucesso!',
        description: `Total: ${formatCurrency(totalValue)}`,
      });

      onClose();
    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: 'Erro ao processar venda',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="h-6 w-6" />
            Ponto de Venda (PDV)
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* COLUNA ESQUERDA - Produtos e Itens */}
          <div className="space-y-4">
            {/* Busca de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buscar Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Digite o nome ou código de barras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                </div>

                {/* Resultados da Busca */}
                {searchQuery && filteredProducts.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{product.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              Estoque: {product.quantidade_estoque} un.
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            {formatCurrency(product.preco_venda)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum produto encontrado
                  </p>
                )}

                {products.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <p className="text-sm text-warning">
                      Nenhum produto cadastrado no sistema.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itens da Venda */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                {saleItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum item adicionado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {saleItems.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.unit_price)} x {item.quantity}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.product_id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.product_id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-bold text-primary">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA - Cliente, Resumo e Pagamento */}
          <div className="space-y-4">
            {/* Seleção de Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cliente</CardTitle>
              </CardHeader>
              <CardContent>
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

                {customers.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg mt-3">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <p className="text-sm text-warning">
                      Nenhum cliente cadastrado no sistema.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo da Venda */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="discount" className="text-sm text-muted-foreground">
                    Desconto:
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-32 text-right"
                  />
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totalValue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro" className="flex items-center gap-2 cursor-pointer">
                      <Banknote className="h-4 w-4" />
                      Dinheiro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debito" id="debito" />
                    <Label htmlFor="debito" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Cartão de Débito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="credito" id="credito" />
                    <Label htmlFor="credito" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      Cartão de Crédito
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-4 w-4" />
                      PIX
                    </Label>
                  </div>
                </RadioGroup>

                {/* Campo para Dinheiro */}
                {paymentMethod === 'dinheiro' && (
                  <div className="space-y-2 p-3 bg-accent rounded-lg">
                    <Label htmlFor="received">Valor Recebido</Label>
                    <Input
                      id="received"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      placeholder="0,00"
                    />
                    {change > 0 && (
                      <p className="text-sm font-medium text-success">
                        Troco: {formatCurrency(change)}
                      </p>
                    )}
                  </div>
                )}

                {/* Campo para Parcelamento */}
                {paymentMethod === 'credito' && (
                  <div className="space-y-2 p-3 bg-accent rounded-lg">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Select value={installments.toString()} onValueChange={(v) => setInstallments(parseInt(v))}>
                      <SelectTrigger id="installments">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}x de {formatCurrency(totalValue / n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão Finalizar */}
            <Button
              onClick={handleFinalizeSale}
              disabled={!selectedCustomer || saleItems.length === 0 || isLoading}
              className="w-full h-14 text-lg bg-gradient-primary"
            >
              {isLoading ? 'Processando...' : 'Finalizar Venda'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
