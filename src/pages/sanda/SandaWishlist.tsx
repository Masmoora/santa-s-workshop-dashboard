import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Users, Package, MessageSquare } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Elves', href: '/sanda/elves', icon: <Users className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

const SandaWishlist = () => {
  const { toast } = useToast();
  const [wishes, setWishes] = useState<any[]>([]);
  const [elves, setElves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: wishData } = await supabase
      .from('wishes')
      .select('*, child:profiles!wishes_child_id_fkey(full_name, id), assigned_elf:profiles!wishes_assigned_elf_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    
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

    const { data: elfData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'elf');

    setWishes(wishData || []);
    setElves(elfData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const assignElf = async (wishId: string, elfId: string) => {
    const { error } = await supabase
      .from('wishes')
      .update({ assigned_elf_id: elfId, status: 'in_progress' })
      .eq('id', wishId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Assigned', description: 'Wish assigned to elf successfully.' });
      fetchData();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'ASSIGNED';
      case 'completed': return 'DELIVERED';
      default: return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Wishlist Management" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Wishlist Management" navItems={navItems}>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Wishes ({wishes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {wishes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No wishes yet.</p>
          ) : (
            <div className="space-y-4">
              {wishes.map((wish) => (
                <div key={wish.id} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{wish.wish_text}</p>
                      <p className="text-sm text-muted-foreground">From: {wish.child?.full_name}</p>
                      {wish.address && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Address: {wish.address.house_street}, {wish.address.city}, {wish.address.state} - {wish.address.pincode}
                        </p>
                      )}
                    </div>
                    <Badge variant={getStatusBadgeVariant(wish.status)}>
                      {getStatusLabel(wish.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select 
                      value={wish.assigned_elf_id || ''} 
                      onValueChange={(v) => assignElf(wish.id, v)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Assign to Elf" />
                      </SelectTrigger>
                      <SelectContent>
                        {elves.map((elf) => (
                          <SelectItem key={elf.id} value={elf.id}>{elf.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {wish.assigned_elf?.full_name && (
                      <span className="text-sm text-muted-foreground">
                        Assigned to: {wish.assigned_elf.full_name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SandaWishlist;
