import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { LuminaLogo } from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, GraduationCap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiBase } from '@/data/dataService';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    try {
      const result = await login(email, password, role);
      if (result === true) {
        // Navigate based on role returned from server (stored in localStorage)
        try {
          const stored = localStorage.getItem('lumina_faculty');
          const faculty = stored ? JSON.parse(stored) : null;
          const actualRole = faculty?.role?.toLowerCase();
          if (actualRole === 'hod') {
            navigate('/hod', { replace: true });
          } else {
            navigate('/faculty', { replace: true });
          }
        } catch {
          navigate('/faculty', { replace: true });
        }
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err: any) {
      setError(`Error: ${err.message} [API: ${getApiBase()}]`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left branded panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <circle cx="200" cy="150" r="120" fill="currentColor" className="text-primary-foreground" />
            <rect x="400" y="100" width="200" height="200" rx="32" fill="currentColor" className="text-primary-foreground" opacity="0.5" />
            <polygon points="600,400 700,550 500,550" fill="currentColor" className="text-primary-foreground" opacity="0.3" />
            <circle cx="150" cy="450" r="80" fill="currentColor" className="text-primary-foreground" opacity="0.4" />
            <rect x="350" y="380" width="150" height="150" rx="75" fill="currentColor" className="text-primary-foreground" opacity="0.2" />
          </svg>
        </div>
        <div className="relative z-10 text-center space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground">Lumina Campus</h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">Empowering Campus Intelligence</p>
          <div className="flex gap-4 justify-center mt-8">
            {['Leave Management', 'Attendance Tracking', 'Smart Reports'].map((feature) => (
              <div key={feature} className="bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-xl text-primary-foreground/90 text-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden text-center space-y-2">
            <LuminaLogo size="lg" />
            <p className="text-sm text-muted-foreground">Empowering Campus Intelligence</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Role toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex justify-between">
              <span>Select your role</span>
              <span className="text-xs text-muted-foreground opacity-70">(Optional, auto-detected)</span>
            </label>
            <div className="flex bg-muted rounded-xl p-1">
              {[
                { value: 'faculty' as UserRole, label: 'Faculty', icon: GraduationCap },
                { value: 'hod' as UserRole, label: 'HOD', icon: Shield },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    role === value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder={role === 'faculty' ? 'ananya@lumina.edu' : 'rajiv@lumina.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
            </div>

            {error && (
              <p className="text-sm text-destructive animate-fade-in">{error}</p>
            )}

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-4">
            Lumina Campus v1.0 — SDM College of Engineering and Technology, Dharwad
          </p>
          
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
