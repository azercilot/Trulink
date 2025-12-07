export interface Business {
  id: string;
  name: string;
  icon: string;
  baseCost: number;
  baseIncome: number;
  incomeInterval: number; // in milliseconds
  owned: number;
  level: number;
  multiplier: number;
}

export const initialBusinesses: Business[] = [
  {
    id: 'lemonade',
    name: 'Lemonade Stand',
    icon: '🍋',
    baseCost: 10,
    baseIncome: 1,
    incomeInterval: 1000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'newspaper',
    name: 'Newspaper Delivery',
    icon: '📰',
    baseCost: 100,
    baseIncome: 5,
    incomeInterval: 2000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'carwash',
    name: 'Car Wash',
    icon: '🚗',
    baseCost: 1000,
    baseIncome: 25,
    incomeInterval: 4000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'pizzeria',
    name: 'Pizzeria',
    icon: '🍕',
    baseCost: 10000,
    baseIncome: 100,
    incomeInterval: 6000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'donut',
    name: 'Donut Shop',
    icon: '🍩',
    baseCost: 100000,
    baseIncome: 500,
    incomeInterval: 8000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'shrimp',
    name: 'Shrimp Boat',
    icon: '🦐',
    baseCost: 1000000,
    baseIncome: 2500,
    incomeInterval: 10000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'hockey',
    name: 'Hockey Team',
    icon: '🏒',
    baseCost: 10000000,
    baseIncome: 10000,
    incomeInterval: 15000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'movie',
    name: 'Movie Studio',
    icon: '🎬',
    baseCost: 100000000,
    baseIncome: 50000,
    incomeInterval: 20000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    baseCost: 1000000000,
    baseIncome: 250000,
    incomeInterval: 30000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
  {
    id: 'oil',
    name: 'Oil Company',
    icon: '🛢️',
    baseCost: 10000000000,
    baseIncome: 1000000,
    incomeInterval: 45000,
    owned: 0,
    level: 1,
    multiplier: 1,
  },
];

export const formatMoney = (amount: number): string => {
  if (amount >= 1e15) return `$${(amount / 1e15).toFixed(2)} Qa`;
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)} T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)} B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)} M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)} K`;
  return `$${amount.toFixed(2)}`;
};

export const calculateCost = (business: Business): number => {
  return Math.floor(business.baseCost * Math.pow(1.15, business.owned));
};

export const calculateIncome = (business: Business): number => {
  return business.baseIncome * business.owned * business.multiplier * business.level;
};

export const calculateUpgradeCost = (business: Business): number => {
  return Math.floor(business.baseCost * 10 * Math.pow(2, business.level - 1));
};
