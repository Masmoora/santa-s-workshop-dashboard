import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, MapPin, Star, Mail, Plus, AlertCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/child/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'My Address', href: '/child/address', icon: <MapPin className="w-5 h-5" /> },
  { label: 'My Wishlist', href: '/child/wishlist', icon: <Star className="w-5 h-5" /> },
  { label: 'Letter to Santa', href: '/child/letters', icon: <Mail className="w-5 h-5" /> },
];

interface Wish {
  id: string;
  wish_text: string;
  status: string;
  created_at: string;
}

const ChildWishlist = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAddress, setHasAddress] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [newWish, setNewWish] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      const { data: address } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      setHasAddress(!!address);

      const { data: wishData } = await supabase
        .from('wishes')
        .select('*')
        .eq('child_id', profile.id)
        .order('created_at', { ascending: false });

      setWishes(wishData || []);
      setLoading(false);
    };
    fetchData();
  }, [profile?.id]);

  const handleAddWish = async () => {
    if (!newWish.trim()) return;
    setAdding(true);

    const { error } = await supabase
      .from('wishes')
      .insert({ child_id: profile?.id, wish_text: newWish.trim() });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Wish added!', description: 'Your wish has been sent to Santa.' });
      setNewWish('');
      // Refresh wishes
      const { data } = await supabase
        .from('wishes')
        .select('*')
        .eq('child_id', profile?.id)
        .order('created_at', { ascending: false });
      setWishes(data || []);
    }
    setAdding(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-muted text-muted-foreground',
      approved: 'bg-christmas-green text-christmas-snow',
      rejected: 'bg-destructive text-destructive-foreground',
      in_progress: 'bg-christmas-gold text-foreground',
      completed: 'bg-secondary text-secondary-foreground',
    };
    return <Badge className={variants[status] || variants.pending}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout title="My Wishlist" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAddress) {
    return (
      <DashboardLayout title="My Wishlist" navItems={navItems}>
        <Card className="border-2 border-accent bg-accent/10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Address Required</h3>
            <p className="text-muted-foreground mb-4">You need to add your delivery address before creating a wishlist.</p>
            <Button variant="gold" asChild>
              <Link to="/child/address">Add Address</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Wishlist" navItems={navItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Add a Wish</CardTitle>
            <CardDescription>Tell Santa what you'd like for Christmas!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={newWish}
                onChange={(e) => setNewWish(e.target.value)}
                placeholder="I wish for..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddWish()}
              />
              <Button variant="christmas" onClick={handleAddWish} disabled={adding || !newWish.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">My Wishes ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {wishes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No wishes yet. Add your first wish above!</p>
            ) : (
              <div className="space-y-3">
                {wishes.map((wish) => (
                  <div key={wish.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="font-medium">{wish.wish_text}</span>
                    {getStatusBadge(wish.status)}
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

export default ChildWishlist;
