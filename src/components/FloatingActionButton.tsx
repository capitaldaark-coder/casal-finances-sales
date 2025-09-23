import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
}

export const FloatingActionButton = ({ onClick, icon }: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-elevated hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      {icon || <Plus className="h-6 w-6" />}
    </Button>
  );
};