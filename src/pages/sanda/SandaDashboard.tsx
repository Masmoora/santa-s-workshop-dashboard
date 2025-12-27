import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, Users, Package, MessageSquare, Gift, Clock, CheckCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

const SandaDashboard = () => {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalWishes: 0,
    pendingWishes: 0,
    completedWishes: 0,
    pendingLetters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: childCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'child');

      const { count: wishCount } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true });

      const { count: pendingWishCount } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: completedWishCount } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: pendingLetterCount } = await supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalChildren: childCount || 0,
        totalWishes: wishCount || 0,
        pendingWishes: pendingWishCount || 0,
        completedWishes: completedWishCount || 0,
        pendingLetters: pendingLetterCount || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" navItems={navItems}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary to-christmas-red-light text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Gift className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-display font-bold">Welcome, Sanda!</h3>
                <p className="opacity-90">Manage wishes and spread Christmas joy!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Children</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-secondary" />
                <p className="text-3xl font-bold">{stats.totalChildren}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Wishes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-accent" />
                <p className="text-3xl font-bold">{stats.totalWishes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Wishes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-christmas-gold" />
                <p className="text-3xl font-bold">{stats.pendingWishes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Wishes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-christmas-green" />
                <p className="text-3xl font-bold">{stats.completedWishes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <p className="text-3xl font-bold">{stats.pendingLetters}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SandaDashboard;
