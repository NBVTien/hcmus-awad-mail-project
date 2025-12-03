// import { LoginForm } from './LoginForm';
import { OAuthButton } from './OAuthButton';
// import { Separator } from '@/components/ui/separator';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your email dashboard
          </p>
        </div>

        <div className="space-y-4">
          {/* <LoginForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div> */}

          <OAuthButton provider="google" />
        </div>
      </div>
    </div>
  );
};
