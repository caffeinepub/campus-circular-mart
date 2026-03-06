import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, GraduationCap } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  message?: string;
}

export default function AuthGuard({ children, requiredAuth = true, message }: AuthGuardProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (requiredAuth && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mb-6">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          Students Only
        </h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          {message || 'Please log in to access this feature. Only verified students can post listings and contact sellers.'}
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6"
          size="lg"
        >
          <LogIn className="w-4 h-4" />
          {isLoggingIn ? 'Logging in…' : 'Login to Continue'}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
