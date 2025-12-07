import { useState, useEffect } from 'react';
import { Business, formatMoney, calculateCost, calculateIncome, calculateUpgradeCost } from '@/lib/gameData';
import { Progress } from '@/components/ui/progress';

interface BusinessCardProps {
  business: Business;
  money: number;
  onBuy: (business: Business) => void;
  onUpgrade: (business: Business) => void;
}

const BusinessCard = ({ business, money, onBuy, onUpgrade }: BusinessCardProps) => {
  const [progress, setProgress] = useState(0);
  const cost = calculateCost(business);
  const income = calculateIncome(business);
  const upgradeCost = calculateUpgradeCost(business);
  const canAfford = money >= cost;
  const canUpgrade = money >= upgradeCost && business.owned > 0;

  useEffect(() => {
    if (business.owned === 0) {
      setProgress(0);
      return;
    }

    const interval = 50;
    const incrementPerTick = (100 / business.incomeInterval) * interval;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + incrementPerTick;
        if (next >= 100) {
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [business.owned, business.incomeInterval]);

  return (
    <div className={`
      card-gradient rounded-xl p-4 border transition-all duration-300
      ${business.owned > 0 ? 'border-gold/40' : 'border-border'}
      ${canAfford ? 'hover:border-gold/60 hover:gold-glow' : 'opacity-70'}
    `}>
      <div className="flex items-start gap-4">
        <div className="text-4xl animate-float">{business.icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display font-semibold text-foreground truncate">
              {business.name}
            </h3>
            <span className="text-gold font-display font-bold ml-2">
              x{business.owned}
            </span>
          </div>
          
          {business.owned > 0 && (
            <>
              <Progress 
                value={progress} 
                className="h-2 mb-2 bg-muted"
              />
              <p className="text-emerald-light text-sm font-medium">
                +{formatMoney(income)} / {(business.incomeInterval / 1000).toFixed(1)}s
              </p>
            </>
          )}
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onBuy(business)}
              disabled={!canAfford}
              className={`
                flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
                ${canAfford 
                  ? 'bg-gradient-to-r from-gold to-gold-dark text-primary-foreground hover:from-gold-light hover:to-gold' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'}
              `}
            >
              Buy {formatMoney(cost)}
            </button>
            
            {business.owned > 0 && (
              <button
                onClick={() => onUpgrade(business)}
                disabled={!canUpgrade}
                className={`
                  py-2 px-3 rounded-lg font-medium text-sm transition-all
                  ${canUpgrade 
                    ? 'bg-gradient-to-r from-emerald to-emerald-light text-white hover:opacity-90' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'}
                `}
              >
                Lvl {business.level + 1}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
