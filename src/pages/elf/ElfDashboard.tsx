import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Package, Gift, MapPin, CheckCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/elf/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'My Deliveries', href: '/elf/dashboard', icon: <Package className="w-5 h-5" /> },
];

const ElfDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [wishes, setWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
    if (!profile?.id) return;
    
    // Fetch wishes assigned to this elf
    const { data: wishData } = await supabase
      .from('wishes')
      .select('*, child:profiles!wishes_child_id_fkey(full_name, id)')
      .eq('assigned_elf_id', profile.id)
      .order('created_at', { ascending: false });
    
    // Fetch addresses separately for the assigned wishes
    if (wishData && wishData.length > 0) {
      const childIds = [...new Set(wishData.map(w => w.child_id))];
      const { data: addressData } = await supabase
        .from('addresses')
        .select('user_id, house_street, city, state, pincode, country')
        .in('user_id', childIds);
      
      const addressMap = new Map(addressData?.map(a => [a.user_id, a]) || []);
      wishData.forEach((w: any) => {
        w.address = addressMap.get(w.child_id) || null;
      });
    }
    
    setWishes(wishData || []);
    setLoading(false);
  };

  useEffect(() => { 
    if (profile?.id) {
      fetchWishes(); 
    }
  }, [profile?.id]);

  const markAsDelivered = async (wishId: string) => {
    const { error } = await supabase
      .from('wishes')
      .update({ status: 'delivered' })
      .eq('id', wishId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Delivered!', description: 'Wish marked as delivered.' });
      fetchWishes();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Deliveries" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Deliveries" navItems={navItems}>
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-secondary to-christmas-green-light text-secondary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Gift className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-display font-bold">Welcome, {profile?.full_name}!</h3>
                <p className="opacity-90">Help Santa deliver gifts to children!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Assigned Wishes ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {wishes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No wishes assigned to you yet.</p>
            ) : (
              <div className="space-y-4">
                {wishes.map((wish) => (
                  <div key={wish.id} className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{wish.wish_text}</p>
                        <p className="text-sm text-muted-foreground">For: {wish.child?.full_name}</p>
                      </div>
                      <Badge variant={wish.status === 'delivered' ? 'secondary' : 'default'}>
                        {wish.status.toUpperCase()}
                      </Badge>
                    </div>
                    {wish.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-background/50 p-3 rounded">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Delivery Address:</p>
                          <p>{wish.address.house_street}</p>
                          <p>{wish.address.city}, {wish.address.state} - {wish.address.pincode}</p>
                          {wish.address.country && <p>{wish.address.country}</p>}
                        </div>
                      </div>
                    )}
                    {wish.status !== 'delivered' && (
                      <Button 
                        size="sm" 
                        variant="christmasGreen"
                        onClick={() => markAsDelivered(wish.id)}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ElfDashboard;
