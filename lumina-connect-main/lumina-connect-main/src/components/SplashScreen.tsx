import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Show splash for 2.5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-background to-cyan-500/10 pointer-events-none" />
      
      <motion.div
        initial={{ y: '100vh', opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          stiffness: 100, 
          duration: 1.2 
        }}
        className="flex flex-col items-center gap-4 relative z-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-cyan-400 p-0.5 shadow-[0_0_40px_rgba(79,70,229,0.5)]">
          <div className="w-full h-full bg-card rounded-[22px] flex items-center justify-center">
            <Bot size={48} className="text-primary drop-shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-md">
            Lumina <span className="text-primary">Campus</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium tracking-wide">
            Empowering Education
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
