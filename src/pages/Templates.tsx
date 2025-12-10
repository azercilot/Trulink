import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, ArrowRight, Search, Building, Car, Home, Users, Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'خودرو': Car,
  'ملک': Home,
  'تجاری': Building,
  'منابع انسانی': Users,
};

const Templates = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('id, name, description, category')
        .eq('is_public', true);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold">قالب‌های قرارداد</h1>
          </div>
        </div>
      </header>

      <div className="container-narrow py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در قالب‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pr-11 pl-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-foreground text-background'
                    : 'bg-background border border-border hover:bg-muted'
                }`}
              >
                {category === 'all' ? 'همه' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">در حال بارگذاری...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">قالبی یافت نشد</h3>
            <p className="text-muted-foreground">نتیجه‌ای برای جستجوی شما یافت نشد</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category] || Briefcase;
              return (
                <Link
                  key={template.id}
                  to={`/contracts/new?template=${template.id}`}
                  className="bg-background p-6 rounded-2xl border border-border hover:border-gray-400 transition-all card-hover text-right"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  )}
                  <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium">
                    {template.category}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
