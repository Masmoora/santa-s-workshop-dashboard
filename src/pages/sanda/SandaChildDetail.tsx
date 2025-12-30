import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Home, Users, Package, MessageSquare, ArrowLeft, MapPin, Mail } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Elves', href: '/sanda/elves', icon: <Users className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

const SandaChildDetail = () => {
  const { id } = useParams();
  const [child, setChild] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [wishes, setWishes] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: childData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      setChild(childData);

      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', id)
        .maybeSingle();
      setAddress(addressData);

      const { data: wishData } = await supabase
        .from('wishes')
        .select('*, assigned_elf:profiles!wishes_assigned_elf_id_fkey(full_name)')
        .eq('child_id', id)
        .order('created_at', { ascending: false });
      setWishes(wishData || []);

      const { data: letterData } = await supabase
        .from('letters')
        .select('*')
        .eq('child_id', id)
        .order('created_at', { ascending: false });
      setLetters(letterData || []);

      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Child Details" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Child Details" navItems={navItems}>
      <div className="space-y-6">
        <Button variant="outline" asChild>
          <Link to="/sanda/children">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Children
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Child Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{child?.full_name}</p>
              <p className="text-muted-foreground">{child?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {address ? (
                <div className="text-sm space-y-1">
                  <p>{address.house_street}</p>
                  <p>{address.city}, {address.state}</p>
                  <p>Pincode: {address.pincode}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No address added</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Wishlist ({wishes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {wishes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No wishes yet.</p>
            ) : (
              <div className="space-y-3">
                {wishes.map((wish) => (
                  <div key={wish.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{wish.wish_text}</p>
                      {wish.assigned_elf && (
                        <p className="text-sm text-muted-foreground">Assigned to: {wish.assigned_elf.full_name}</p>
                      )}
                    </div>
                    <Badge>{wish.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Letters ({letters.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {letters.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No letters yet.</p>
            ) : (
              <div className="space-y-3">
                {letters.map((letter) => (
                  <div key={letter.id} className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm line-clamp-2">{letter.letter_content}</p>
                      <Badge variant={letter.status === 'replied' ? 'default' : 'secondary'}>
                        {letter.status}
                      </Badge>
                    </div>
                    {letter.reply_content && (
                      <div className="bg-background/50 p-2 rounded text-sm">
                        <p className="text-xs text-muted-foreground mb-1">Reply:</p>
                        <p className="line-clamp-2">{letter.reply_content}</p>
                      </div>
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

export default SandaChildDetail;
