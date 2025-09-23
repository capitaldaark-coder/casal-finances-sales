import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PersonalTransaction } from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<PersonalTransaction, 'id'>) => void;
}

const categories = [
  'Salário',
  'Renda Extra',
  'Alimentação',
  'Casa',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Outros'
];

export const TransactionModal = ({ isOpen, onClose, onSave }: TransactionModalProps) => {
  const [formData, setFormData] = useState({
    type: '' as 'receita' | 'despesa' | '',
    description: '',
    value: '',
    category: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description || !formData.value || !formData.category) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const transaction: Omit<PersonalTransaction, 'id'> = {
      type: formData.type,
      description: formData.description,
      value: parseFloat(formData.value),
      category: formData.category,
      transaction_date: new Date().toISOString(),
    };

    onSave(transaction);
    
    // Reset form
    setFormData({
      type: '',
      description: '',
      value: '',
      category: '',
    });
    
    toast({
      title: 'Sucesso',
      description: 'Transação adicionada com sucesso!',
    });
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      type: '',
      description: '',
      value: '',
      category: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Lançamento</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa ao seu controle financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa') => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Supermercado, Salário..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData({ ...formData, category: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};