import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sale } from '@/types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Omit<Sale, 'id' | 'profit'>) => void;
}

const brands: Sale['brand'][] = ['Avon', 'O Boticário', 'Natura', 'Eudora', 'Outra'];

export const SaleModal = ({ isOpen, onClose, onSave }: SaleModalProps) => {
  const [formData, setFormData] = useState({
    product_description: '',
    brand: '' as Sale['brand'] | '',
    cost_price: '',
    sale_price: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_description || !formData.brand || !formData.cost_price || !formData.sale_price) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const costPrice = parseFloat(formData.cost_price);
    const salePrice = parseFloat(formData.sale_price);

    if (salePrice <= costPrice) {
      toast({
        title: 'Erro',
        description: 'O preço de venda deve ser maior que o preço de custo.',
        variant: 'destructive',
      });
      return;
    }

    const sale: Omit<Sale, 'id' | 'profit'> = {
      product_description: formData.product_description,
      brand: formData.brand,
      cost_price: costPrice,
      sale_price: salePrice,
      sale_date: new Date().toISOString(),
    };

    onSave(sale);
    
    // Reset form
    setFormData({
      product_description: '',
      brand: '',
      cost_price: '',
      sale_price: '',
    });
    
    toast({
      title: 'Sucesso',
      description: 'Venda registrada com sucesso!',
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      product_description: '',
      brand: '',
      cost_price: '',
      sale_price: '',
    });
    onClose();
  };

  const profit = formData.cost_price && formData.sale_price 
    ? parseFloat(formData.sale_price) - parseFloat(formData.cost_price)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Venda</DialogTitle>
          <DialogDescription>
            Registre uma nova venda em seu controle de vendas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Input
              id="product"
              value={formData.product_description}
              onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
              placeholder="Ex: Perfume Kaiak Masculino"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Select value={formData.brand} onValueChange={(value: Sale['brand']) => 
              setFormData({ ...formData, brand: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Preço de Custo</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Preço de Venda</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          {profit > 0 && (
            <div className="p-3 bg-success/10 rounded-lg">
              <p className="text-sm text-success font-semibold">
                Lucro estimado: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(profit)}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};