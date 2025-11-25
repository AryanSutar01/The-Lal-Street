import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth';

interface AdminLoginProps {
  open: boolean;
  onLoginSuccess: () => void;
}

export function AdminLogin({ open, onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple delay to prevent brute force (even though it's client-side)
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    
    if (success) {
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">Admin Login</DialogTitle>
          <DialogDescription className="text-center">
            Enter the admin password to access the admin panel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter admin password"
                className="pl-10"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </Button>
        </form>

        {import.meta.env.MODE === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Development Mode:</strong> Default password is "admin123" if not set in environment variables.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

