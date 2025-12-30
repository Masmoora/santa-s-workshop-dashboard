import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Users, Package, MessageSquare, Send } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/sanda/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Children', href: '/sanda/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Elves', href: '/sanda/elves', icon: <Users className="w-5 h-5" /> },
  { label: 'Wishlist', href: '/sanda/wishlist', icon: <Package className="w-5 h-5" /> },
  { label: 'Letters', href: '/sanda/letters', icon: <MessageSquare className="w-5 h-5" /> },
];

const SandaLetters = () => {
  const { toast } = useToast();
  const [letters, setLetters] = useState<any[]>([]);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchLetters = async () => {
    const { data } = await supabase
      .from('letters')
      .select('*, child:profiles!letters_child_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    setLetters(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLetters(); }, []);

  const sendReply = async (letterId: string) => {
    const reply = replies[letterId];
    if (!reply?.trim()) return;

    const { error } = await supabase
      .from('letters')
      .update({ reply_content: reply, status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', letterId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Reply sent!', description: 'Your reply has been sent to the child.' });
      setReplies({ ...replies, [letterId]: '' });
      fetchLetters();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Letters" navItems={navItems}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Letters" navItems={navItems}>
      <Card>
        <CardHeader>
          <CardTitle className="font-display">All Letters ({letters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {letters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No letters yet.</p>
          ) : (
            <div className="space-y-6">
              {letters.map((letter) => (
                <div key={letter.id} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">From: {letter.child?.full_name}</p>
                      <p className="font-medium mt-1 whitespace-pre-wrap">{letter.letter_content}</p>
                    </div>
                    <Badge className={letter.status === 'replied' ? 'bg-christmas-green text-christmas-snow' : ''}>
                      {letter.status}
                    </Badge>
                  </div>
                  {letter.reply_content ? (
                    <div className="p-3 bg-christmas-green/10 border border-christmas-green/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Your Reply:</p>
                      <p className="font-medium text-secondary">{letter.reply_content}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replies[letter.id] || ''}
                        onChange={(e) => setReplies({ ...replies, [letter.id]: e.target.value })}
                        rows={3}
                      />
                      <Button variant="christmas" size="sm" onClick={() => sendReply(letter.id)}>
                        <Send className="w-4 h-4 mr-2" /> Send Reply
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SandaLetters;
