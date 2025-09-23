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
  'Salário', 'Renda Extra', 'Alimentação', 'Casa', 'Transporte', 'Saúde',
  'Educação', 'Lazer', 'Vestuário', 'Tecnologia', 'Investimentos', 'Seguros',
  'Impostos', 'Telefone/Internet', 'Streaming/Assinaturas', 'Pets',
  'Beleza/Cuidados Pessoais', 'Presentes/Doações', 'Farmácia/Medicamentos',
  'Combustível', 'Manutenção/Reparos', 'Outros'
];

export const TransactionModal = ({ isOpen, onClose, onSave }: TransactionModalProps) => {
  const [formData, setFormData] = useState({
    type: '' as 'receita' | 'despesa' | '',
    description: '',
    value: '',
    category: '',
    payment_method: '' as 'dinheiro' | 'debito' | 'credito' | 'pix' | 'transferencia' | '',
    credit_card: '',
    bank: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description || !formData.value || !formData.category) {
      toast({
        title: 'Erro',
        description: 'Campos obrigatórios devem ser preenchidos.',
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
      payment_method: formData.payment_method || undefined,
      credit_card: formData.credit_card || undefined,
      bank: formData.bank || undefined,
    };

    onSave(transaction);
    setFormData({ type: '', description: '', value: '', category: '', payment_method: '', credit_card: '', bank: '' });
    toast({ title: 'Sucesso', description: 'Transação adicionada!' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Adicione receita ou despesa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={formData.type} onValueChange={(value: 'receita' | 'despesa') => 
                setFormData({ ...formData, type: value })
              }>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor *</Label>
              <Input type="number" step="0.01" value={formData.value} 
                onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
            </div>
          </div>
          
          <div>
            <Label>Descrição *</Label>
            <Input value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          
          <div>
            <Label>Categoria *</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData({ ...formData, category: value })
            }>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};