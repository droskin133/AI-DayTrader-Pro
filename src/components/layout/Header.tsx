import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, CreditCard, FileText, LogOut, BarChart3, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DisclaimerModal } from '@/components/legal/DisclaimerModal';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show disclaimer modal on first login or when legal terms change
    if (user) {
      const hasAcceptedKey = `legal_accepted_${user.id}_1.0`;
      const hasAcceptedBefore = localStorage.getItem(hasAcceptedKey);
      if (!hasAcceptedBefore) {
        setShowDisclaimer(true);
      }
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stock/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b backdrop-blur-sm bg-card/95">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full trading-gradient flex items-center justify-center">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          <span className="text-xl font-bold">DayTrader Pro</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate('/watchlist')}>
            Watchlist
          </Button>
          <Button variant="ghost" onClick={() => navigate('/news')}>
            News
          </Button>
          {!user && (
            <>
              <Button variant="ghost" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Enter ticker symbol (e.g., AAPL, TSLA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {user && (
            <>
              {/* Alerts Button */}
              <Button variant="ghost" size="sm" onClick={() => navigate('/alerts')}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Alerts
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
            </>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user?.email?.substring(0, 2).toUpperCase() || 'AI'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split('@')[0] || 'Trader'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="w-fit text-xs mt-1">
                    FREE
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>
      </div>
      
      <DisclaimerModal 
        isOpen={showDisclaimer} 
        onAccept={() => setShowDisclaimer(false)}
      />
    </header>
  );
};