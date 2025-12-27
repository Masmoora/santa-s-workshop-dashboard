import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gift, Star, Mail, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary mb-6">
          <Gift className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-4">
          SantaGifts
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Send your Christmas wishes to Sanda and make your dreams come true this holiday season!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="christmas" size="lg" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button variant="christmasGreen" size="lg" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <Star className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Make Wishes</h3>
            <p className="text-muted-foreground">Add your Christmas wishes and Sanda will review them!</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Write Letters</h3>
            <p className="text-muted-foreground">Send a personal letter to Sanda and get a reply!</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border border-border">
            <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Elf Helpers</h3>
            <p className="text-muted-foreground">Elves help deliver your gifts right to your door!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-muted-foreground">
        <p>&copy; 2024 SantaGifts. Spreading Christmas joy!</p>
      </footer>
    </div>
  );
};

export default Index;
