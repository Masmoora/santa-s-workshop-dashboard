import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Package, Gift, MapPin } from 'lucide-react';

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
    const { data } = await supabase
      .from('wishes')
      .select('*, child:profiles!wishes_child_id_fkey(full_name), address:addresses!inner(house_street, city, state, pincode)')
      .eq('assigned_elf_id', profile.id)
      .order('created_at', { ascending: false });
    setWishes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchWishes(); }, [profile?.id]);

  const updateStatus = async (wishId: string, status: string) => {
    const { error } = await supabase.from('wishes').update({ status }).eq('id', wishId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Delivery status updated.' });
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
                <p className="opacity-90">Help Sanda deliver gifts to children!</p>
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
                      <Badge className={wish.status === 'completed' ? 'bg-christmas-green text-christmas-snow' : ''}>
                        {wish.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {wish.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <span>{wish.address.house_street}, {wish.address.city}, {wish.address.state} - {wish.address.pincode}</span>
                      </div>
                    )}
                    <Select value={wish.status} onValueChange={(v) => updateStatus(wish.id, v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
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
