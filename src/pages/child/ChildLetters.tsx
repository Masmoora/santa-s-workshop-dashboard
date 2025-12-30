import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, MapPin, Star, Mail, Send } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/child/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'My Address', href: '/child/address', icon: <MapPin className="w-5 h-5" /> },
  { label: 'My Wishlist', href: '/child/wishlist', icon: <Star className="w-5 h-5" /> },
  { label: 'Letter to Santa', href: '/child/letters', icon: <Mail className="w-5 h-5" /> },
];

interface Letter {
  id: string;
  letter_content: string;
  reply_content: string | null;
  status: string;
  created_at: string;
}

const ChildLetters = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [newLetter, setNewLetter] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchLetters = async () => {
      if (!profile?.id) return;
      const { data } = await supabase
        .from('letters')
        .select('*')
        .eq('child_id', profile.id)
        .order('created_at', { ascending: false });
      setLetters(data || []);
      setLoading(false);
    };
    fetchLetters();
  }, [profile?.id]);

  const handleSendLetter = async () => {
    if (!newLetter.trim()) return;
    setSending(true);

    const { error } = await supabase
      .from('letters')
      .insert({ child_id: profile?.id, letter_content: newLetter.trim() });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Letter sent!', description: 'Your letter has been sent to Santa.' });
      setNewLetter('');
      const { data } = await supabase
        .from('letters')
        .select('*')
        .eq('child_id', profile?.id)
        .order('created_at', { ascending: false });
      setLetters(data || []);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <DashboardLayout title="Letter to Santa" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Letter to Santa" navItems={navItems}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Write a Letter</CardTitle>
            <CardDescription>Send a special letter to Santa!</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={newLetter}
              onChange={(e) => setNewLetter(e.target.value)}
              placeholder="Dear Santa..."
              rows={6}
              className="mb-4"
            />
            <Button variant="christmas" onClick={handleSendLetter} disabled={sending || !newLetter.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Letter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">My Letters ({letters.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {letters.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No letters yet. Write your first letter above!</p>
            ) : (
              <div className="space-y-4">
                {letters.map((letter) => (
                  <div key={letter.id} className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="font-medium whitespace-pre-wrap">{letter.letter_content}</p>
                      <Badge className={letter.status === 'replied' ? 'bg-christmas-green text-christmas-snow' : 'bg-muted-foreground text-background'}>
                        {letter.status}
                      </Badge>
                    </div>
                    {letter.reply_content && (
                      <div className="p-3 bg-christmas-green/10 border border-christmas-green/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Santa's Reply:</p>
                        <p className="font-medium text-secondary">{letter.reply_content}</p>
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

export default ChildLetters;
