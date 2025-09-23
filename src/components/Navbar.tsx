import { Button } from '@/components/ui/button';
import { LogOut, Home, DollarSign, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onLogout: () => void;
}

export const Navbar = ({ onLogout }: NavbarProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-gradient-card shadow-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Finanças & Vendas</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              
              <Link to="/financas">
                <Button 
                  variant={isActive('/financas') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Finanças</span>
                </Button>
              </Link>
              
              <Link to="/vendas">
                <Button 
                  variant={isActive('/vendas') ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Vendas</span>
                </Button>
              </Link>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};