import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Home, Users, Package, MessageSquare, Eye } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

interface Child {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

const SandaChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'child')
        .order('created_at', { ascending: false });
      setChildren(data || []);
      setLoading(false);
    };
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Children" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Children" navItems={navItems}>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Children ({children.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No children registered yet.</p>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">{child.full_name}</p>
                    <p className="text-sm text-muted-foreground">{child.email}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/sanda/children/${child.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SandaChildren;
