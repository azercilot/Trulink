import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const FloatingSupport = () => {
  return (
    <Link
      to="/support"
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      style={{ boxShadow: '0 8px 24px -4px hsl(145 100% 39% / 0.35)' }}
      aria-label="Support"
    >
      <MessageCircle className="w-6 h-6" />
    </Link>
  );
};

export default FloatingSupport;
