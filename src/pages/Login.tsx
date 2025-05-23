import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Login page component
 * Provides user authentication for the TalentSol ATS application
 */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would authenticate the user here
    // For now, we'll just navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ats-blue">TalentSol</h1>
          <h2 className="mt-2 text-xl text-gray-600">Sign in to your account</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-sm font-medium text-ats-blue hover:text-ats-dark-blue"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Button type="submit" className="w-full bg-ats-blue hover:bg-ats-dark-blue">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <a
                href="#"
                className="font-medium text-ats-blue hover:text-ats-dark-blue"
              >
                Sign up
              </a>
            </div>
            <div className="text-center text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
            </div>
          </CardFooter>
        </Card>

        <div className="text-center mt-4">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-ats-blue"
            onClick={() => navigate('/')}
          >
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
