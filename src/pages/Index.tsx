import { useState, useEffect, useCallback } from 'react';
import { Business, initialBusinesses, calculateCost, calculateIncome, calculateUpgradeCost } from '@/lib/gameData';
import MoneyDisplay from '@/components/MoneyDisplay';
import ClickButton from '@/components/ClickButton';
import BusinessCard from '@/components/BusinessCard';

const SAVE_KEY = 'tycoon_save';

interface GameState {
  money: number;
  totalEarned: number;
  businesses: Business[];
  clickMultiplier: number;
}

const loadGame = (): GameState => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load game:', e);
  }
  return {
    money: 0,
    totalEarned: 0,
    businesses: initialBusinesses,
    clickMultiplier: 1,
  };
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(loadGame);
  
  const { money, businesses, clickMultiplier } = gameState;

  // Calculate click value
  const clickValue = 1 * clickMultiplier;

  // Calculate income per second
  const incomePerSecond = businesses.reduce((total, business) => {
    if (business.owned === 0) return total;
    const income = calculateIncome(business);
    const perSecond = income / (business.incomeInterval / 1000);
    return total + perSecond;
  }, 0);

  // Handle clicking the main button
  const handleClick = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + clickValue,
      totalEarned: prev.totalEarned + clickValue,
    }));
  }, [clickValue]);

  // Handle buying a business
  const handleBuy = useCallback((business: Business) => {
    const cost = calculateCost(business);
    if (gameState.money < cost) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money - cost,
      businesses: prev.businesses.map(b => 
        b.id === business.id 
          ? { ...b, owned: b.owned + 1 }
          : b
      ),
    }));
  }, [gameState.money]);

  // Handle upgrading a business
  const handleUpgrade = useCallback((business: Business) => {
    const cost = calculateUpgradeCost(business);
    if (gameState.money < cost || business.owned === 0) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money - cost,
      businesses: prev.businesses.map(b => 
        b.id === business.id 
          ? { ...b, level: b.level + 1, multiplier: b.multiplier * 2 }
          : b
      ),
    }));
  }, [gameState.money]);

  // Passive income generation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    businesses.forEach(business => {
      if (business.owned === 0) return;

      const timer = setInterval(() => {
        const income = calculateIncome(business);
        setGameState(prev => ({
          ...prev,
          money: prev.money + income,
          totalEarned: prev.totalEarned + income,
        }));
      }, business.incomeInterval);

      timers.push(timer);
    });

    return () => timers.forEach(timer => clearInterval(timer));
  }, [businesses]);

  // Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    }, 5000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Save on unload
  useEffect(() => {
    const handleUnload = () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4">
        <div className="container max-w-4xl mx-auto px-4">
          <MoneyDisplay money={money} perSecond={incomePerSecond} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Click Area */}
        <section className="mb-12">
          <ClickButton onClick={handleClick} clickValue={clickValue} />
        </section>

        {/* Businesses */}
        <section>
          <h2 className="font-display text-2xl font-bold gold-text mb-6 text-center">
            Your Businesses
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.map(business => (
              <BusinessCard
                key={business.id}
                business={business}
                money={money}
                onBuy={handleBuy}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border mt-12">
        <p className="font-display">Business Tycoon</p>
        <p className="text-xs mt-1">Build your empire, one click at a time</p>
      </footer>
    </div>
  );
};

export default Index;
