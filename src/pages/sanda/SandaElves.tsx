import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Home, Users, Package, MessageSquare, UserCheck } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Elves', href: '/sanda/elves', icon: <UserCheck className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

interface ElfWithCounts {
  id: string;
  full_name: string;
  email: string;
  assignedCount: number;
  completedCount: number;
}

const SandaElves = () => {
  const [elves, setElves] = useState<ElfWithCounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElves = async () => {
      // Fetch all elf profiles
      const { data: elfProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'elf')
        .order('full_name', { ascending: true });

      if (!elfProfiles) {
        setElves([]);
        setLoading(false);
        return;
      }

      // Fetch all wishes to calculate counts
      const { data: wishes } = await supabase
        .from('wishes')
        .select('assigned_elf_id, status');

      const elvesWithCounts: ElfWithCounts[] = elfProfiles.map((elf) => {
        const elfWishes = wishes?.filter((w) => w.assigned_elf_id === elf.id) || [];
        const assignedCount = elfWishes.filter((w) => w.status === 'in_progress').length;
        const completedCount = elfWishes.filter((w) => w.status === 'completed').length;

        return {
          id: elf.id,
          full_name: elf.full_name,
          email: elf.email,
          assignedCount,
          completedCount,
        };
      });

      setElves(elvesWithCounts);
      setLoading(false);
    };

    fetchElves();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Elves" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Elves" navItems={navItems}>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Elf Helpers ({elves.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {elves.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No elves registered yet.</p>
          ) : (
            <div className="space-y-3">
              {elves.map((elf) => (
                <div key={elf.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{elf.full_name}</p>
                    <p className="text-sm text-muted-foreground">{elf.email}</p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-christmas-gold">{elf.assignedCount}</p>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-christmas-green">{elf.completedCount}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
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

export default SandaElves;
