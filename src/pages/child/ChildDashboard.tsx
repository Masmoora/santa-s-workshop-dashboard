import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Home, MapPin, Star, Mail, Gift, AlertCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/child/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'My Address', href: '/child/address', icon: <MapPin className="w-5 h-5" /> },
  { label: 'My Wishlist', href: '/child/wishlist', icon: <Star className="w-5 h-5" /> },
  { label: 'Letter to Sanda', href: '/child/letters', icon: <Mail className="w-5 h-5" /> },
];

const ChildDashboard = () => {
  const { profile } = useAuth();
  const [hasAddress, setHasAddress] = useState(false);
  const [wishCount, setWishCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      // Check if address exists
      const { data: address } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      setHasAddress(!!address);

      // Get wish count
      const { count: wishes } = await supabase
        .from('wishes')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', profile.id);

      setWishCount(wishes || 0);

      // Get letter count
      const { count: letters } = await supabase
        .from('letters')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', profile.id);

      setLetterCount(letters || 0);
      setLoading(false);
    };

    fetchData();
  }, [profile?.id]);

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
        {/* Welcome Message */}
        <Card className="bg-gradient-to-r from-primary to-christmas-red-light text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Gift className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-display font-bold">Welcome, {profile?.full_name}!</h3>
                <p className="opacity-90">Send your wishes to Sanda and make this Christmas magical!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Warning */}
        {!hasAddress && (
          <Card className="border-2 border-accent bg-accent/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-accent" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Add your delivery address first!</p>
                  <p className="text-sm text-muted-foreground">You need to add your address before creating a wishlist.</p>
                </div>
                <Button variant="gold" size="sm" asChild>
                  <Link to="/child/address">Add Address</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Address Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{hasAddress ? 'Added' : 'Pending'}</p>
                  <p className="text-xs text-muted-foreground">{hasAddress ? 'Ready for delivery' : 'Add your address'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Wishes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{wishCount}</p>
                  <p className="text-xs text-muted-foreground">Wishes submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{letterCount}</p>
                  <p className="text-xs text-muted-foreground">Letters sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="christmasOutline" className="h-auto py-4" asChild>
                <Link to="/child/address" className="flex flex-col items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  <span>{hasAddress ? 'Update Address' : 'Add Address'}</span>
                </Link>
              </Button>
              <Button 
                variant="christmasGreen" 
                className="h-auto py-4" 
                disabled={!hasAddress}
                asChild={hasAddress}
              >
                {hasAddress ? (
                  <Link to="/child/wishlist" className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6" />
                    <span>My Wishlist</span>
                  </Link>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6" />
                    <span>My Wishlist</span>
                  </div>
                )}
              </Button>
              <Button variant="christmas" className="h-auto py-4" asChild>
                <Link to="/child/letters" className="flex flex-col items-center gap-2">
                  <Mail className="w-6 h-6" />
                  <span>Write to Sanda</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ChildDashboard;
