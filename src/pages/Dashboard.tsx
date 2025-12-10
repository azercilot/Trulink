import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, Plus, Search, Bell, User, LogOut, 
  Clock, CheckCircle, AlertCircle, Filter,
  ChevronLeft, Home, Settings, FileSignature
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  title: string;
  contract_type: string;
  status: string;
  party_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'پیش‌نویس' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'در انتظار امضا' },
  signed: { bg: 'bg-green-100', text: 'text-green-800', label: 'امضا شده' },
  expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'منقضی شده' },
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContracts();
      fetchNotifications();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: 'خطا',
        description: 'در دریافت قراردادها مشکلی پیش آمد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contract.party_name && contract.party_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const stats = {
    total: contracts.length,
    draft: contracts.filter(c => c.status === 'draft').length,
    pending: contracts.filter(c => c.status === 'pending').length,
    signed: contracts.filter(c => c.status === 'signed').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="animate-pulse text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-background border-l border-border p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <FileText className="w-5 h-5 text-background" />
          </div>
          <span className="font-bold text-lg">قراردادینو</span>
        </div>

        <nav className="space-y-1">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground font-medium">
            <Home className="w-5 h-5" />
            داشبورد
          </Link>
          <Link to="/contracts/new" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Plus className="w-5 h-5" />
            قرارداد جدید
          </Link>
          <Link to="/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <FileSignature className="w-5 h-5" />
            قالب‌ها
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            تنظیمات
          </Link>
        </nav>

        <div className="absolute bottom-6 right-6 left-6">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-64 min-h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                  <FileText className="w-4 h-4 text-background" />
                </div>
              </div>
              <h1 className="text-xl font-bold">داشبورد</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute left-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold">اعلان‌ها</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          اعلانی وجود ندارد
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => markNotificationAsRead(notification.id)}
                            className={`w-full p-4 text-right hover:bg-muted transition-colors ${
                              !notification.is_read ? 'bg-muted/50' : ''
                            }`}
                          >
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{notification.message}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-muted-foreground text-sm">کل قراردادها</div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="text-3xl font-bold">{stats.draft}</div>
              <div className="text-muted-foreground text-sm">پیش‌نویس</div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="text-3xl font-bold">{stats.pending}</div>
              <div className="text-muted-foreground text-sm">در انتظار امضا</div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border">
              <div className="text-3xl font-bold">{stats.signed}</div>
              <div className="text-muted-foreground text-sm">امضا شده</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Link
              to="/contracts/new"
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              ایجاد قرارداد جدید
            </Link>
          </div>

          {/* Contracts List */}
          <div className="bg-background rounded-2xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-semibold text-lg">قراردادهای من</h2>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 h-10 pr-10 pl-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </div>
                  {/* Filter */}
                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-10 pr-10 pl-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm appearance-none cursor-pointer"
                    >
                      <option value="all">همه وضعیت‌ها</option>
                      <option value="draft">پیش‌نویس</option>
                      <option value="pending">در انتظار امضا</option>
                      <option value="signed">امضا شده</option>
                      <option value="expired">منقضی شده</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                در حال بارگذاری...
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">قراردادی یافت نشد</h3>
                <p className="text-muted-foreground mb-4">
                  {contracts.length === 0
                    ? 'اولین قرارداد خود را ایجاد کنید'
                    : 'نتیجه‌ای برای جستجوی شما یافت نشد'}
                </p>
                {contracts.length === 0 && (
                  <Link
                    to="/contracts/new"
                    className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    ایجاد قرارداد
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    to={`/contracts/${contract.id}`}
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{contract.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{contract.contract_type}</span>
                          {contract.party_name && (
                            <>
                              <span>•</span>
                              <span>{contract.party_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[contract.status]?.bg || 'bg-muted'
                      } ${statusColors[contract.status]?.text || 'text-muted-foreground'}`}>
                        {statusColors[contract.status]?.label || contract.status}
                      </span>
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
