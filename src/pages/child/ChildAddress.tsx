import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, MapPin, Star, Mail } from 'lucide-react';
import { z } from 'zod';

const navItems = [
  { label: 'Dashboard', href: '/child/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'My Address', href: '/child/address', icon: <MapPin className="w-5 h-5" /> },
  { label: 'My Wishlist', href: '/child/wishlist', icon: <Star className="w-5 h-5" /> },
  { label: 'Letter to Sanda', href: '/child/letters', icon: <Mail className="w-5 h-5" /> },
];

const addressSchema = z.object({
  house_street: z.string().min(1, 'House/Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: z.string().min(1, 'Pincode is required').max(20),
  country: z.string().min(1, 'Country is required').max(100),
});

const ChildAddress = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    house_street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAddress = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (data) {
        setAddressId(data.id);
        setFormData({
          house_street: data.house_street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || '',
        });
      }
      setLoading(false);
    };
    fetchAddress();
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    if (addressId) {
      const { error } = await supabase
        .from('addresses')
        .update(formData)
        .eq('id', addressId);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Address updated successfully!' });
      }
    } else {
      const { error } = await supabase
        .from('addresses')
        .insert({ ...formData, user_id: profile?.id });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Address saved successfully!' });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="My Address" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Address" navItems={navItems}>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="font-display">Delivery Address</CardTitle>
          <CardDescription>Add your address so Sanda knows where to deliver your gifts!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="house_street">House / Street</Label>
              <Input
                id="house_street"
                value={formData.house_street}
                onChange={(e) => setFormData({ ...formData, house_street: e.target.value })}
                placeholder="Enter your house number and street"
              />
              {errors.house_street && <p className="text-sm text-destructive">{errors.house_street}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter your city"
              />
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                />
                {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Enter your country"
              />
              {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
            </div>
            <Button type="submit" variant="christmasGreen" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : addressId ? 'Update Address' : 'Save Address'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ChildAddress;
