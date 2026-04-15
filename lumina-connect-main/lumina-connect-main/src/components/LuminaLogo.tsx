import { Sun } from 'lucide-react';

export function LuminaLogo({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizes = {
    sm: { icon: 16, text: 'text-sm' },
    default: { icon: 20, text: 'text-lg' },
    lg: { icon: 28, text: 'text-2xl' },
  };
  const s = sizes[size];
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Sun size={s.icon} className="text-primary" />
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm" />
      </div>
      <span className={`font-bold tracking-tight text-foreground ${s.text}`}>
        Lumina Campus
      </span>
    </div>
  );
}
