import { formatMoney } from '@/lib/gameData';

interface MoneyDisplayProps {
  money: number;
  perSecond: number;
}

const MoneyDisplay = ({ money, perSecond }: MoneyDisplayProps) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-block px-8 py-4 rounded-2xl card-gradient border border-gold/30 gold-glow">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">
          Total Cash
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold gold-text">
          {formatMoney(money)}
        </h1>
        <p className="text-emerald-light text-sm mt-2 font-medium">
          +{formatMoney(perSecond)}/sec
        </p>
      </div>
    </div>
  );
};

export default MoneyDisplay;
