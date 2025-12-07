import { useState, useCallback } from 'react';
import { formatMoney } from '@/lib/gameData';

interface ClickButtonProps {
  onClick: () => void;
  clickValue: number;
}

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: number;
}

const ClickButton = ({ onClick, clickValue }: ClickButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now() + Math.random();
    setFloatingNumbers(prev => [...prev, { id, x, y, value: clickValue }]);
    
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    }, 800);
  }, [onClick, clickValue]);

  return (
    <div className="relative flex justify-center mb-8">
      <button
        onClick={handleClick}
        className={`
          relative w-40 h-40 md:w-48 md:h-48 rounded-full 
          bg-gradient-to-br from-gold-light via-gold to-gold-dark
          border-4 border-gold-light
          gold-glow-intense
          transition-all duration-150 ease-out
          hover:scale-105
          active:scale-95
          ${isPressed ? 'scale-95' : 'animate-pulse-gold'}
          overflow-hidden
          cursor-pointer
          select-none
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl md:text-7xl">💰</span>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-full pointer-events-none" />
        
        {floatingNumbers.map(({ id, x, y, value }) => (
          <span
            key={id}
            className="absolute text-gold-light font-display font-bold text-xl animate-money-pop pointer-events-none"
            style={{ left: x, top: y }}
          >
            +{formatMoney(value)}
          </span>
        ))}
      </button>
      
      <p className="absolute -bottom-6 text-muted-foreground text-sm">
        Click to earn {formatMoney(clickValue)}
      </p>
    </div>
  );
};

export default ClickButton;
