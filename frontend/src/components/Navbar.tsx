import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, ShoppingBag, LogIn, LogOut, User, PlusCircle, List } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setMobileOpen(false);
    navigate({ to: '/' });
  };

  const handleLogin = () => {
    login();
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Browse', icon: <List className="w-4 h-4" /> },
    { to: '/post', label: 'Post a Listing', icon: <PlusCircle className="w-4 h-4" /> },
    ...(isAuthenticated ? [{ to: '/my-listings', label: 'My Listings', icon: <User className="w-4 h-4" /> }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-xs">
              <img
                src="/assets/generated/campus-circular-mart-logo.dim_256x256.png"
                alt="Campus Circular Mart"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-serif font-semibold text-lg text-foreground leading-tight">
                Campus Circular
              </span>
              <span className="block text-xs font-medium text-primary leading-tight -mt-0.5">
                Mart
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: 'text-primary bg-accent' }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">
                      {(userProfile?.displayName || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {userProfile?.displayName || 'Student'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <LogIn className="w-3.5 h-3.5" />
                {isLoggingIn ? 'Logging in…' : 'Login'}
              </Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: 'text-primary bg-accent' }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border mt-2">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        {(userProfile?.displayName || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{userProfile?.displayName || 'Student'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? 'Logging in…' : 'Login'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
