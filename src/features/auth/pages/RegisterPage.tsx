import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { OAuthButton } from '../components/OAuthButton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">
            Sign up to get started with your email dashboard
          </p>
        </div>

        <div className="space-y-4">
          <RegisterForm />

          <div className="text-center text-sm">
            <p>
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                asChild
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <OAuthButton provider="google" />
        </div>
      </div>
    </div>
  );
};
