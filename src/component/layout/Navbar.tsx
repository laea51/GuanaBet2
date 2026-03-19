"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useBetStore } from '@/app/lib/store';
import { Wallet, LogOut, PlusCircle, Languages } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Navbar() {
  const { currentUser, login, logout, language, toggleLanguage } = useBetStore();
  const [lnAddress, setLnAddress] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lnAddress.trim()) {
      login(lnAddress.trim());
      setIsOpen(false);
    }
  };

  const isSpanish = language === 'es';

  return (
    <nav className="border-b bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span className="text-xl font-bold font-headline gradient-text">GuanaBet</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent"
          >
            <Languages className="w-4 h-4" />
            <span className="font-medium">{isSpanish ? 'ES' : 'EN'}</span>
          </Button>

          <Link href="/create">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {isSpanish ? 'Crear Apuesta' : 'Create Bet'}
            </Button>
          </Link>
          
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-muted-foreground">
                  {isSpanish ? 'Conectado como' : 'Connected as'}
                </span>
                <span className="text-sm font-medium truncate max-w-[150px]">{currentUser.lnAddress}</span>
              </div>
              <Button variant="outline" size="icon" onClick={logout} title={isSpanish ? 'Cerrar sesión' : 'Logout'}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  <Wallet className="w-4 h-4 mr-2" />
                  {isSpanish ? 'Conectar Billetera' : 'Connect Wallet'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {isSpanish ? 'Conectar a GuanaBet' : 'Connect to GuanaBet'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLogin} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lnAddress">
                      {isSpanish ? 'Dirección Lightning' : 'Lightning Address'}
                    </Label>
                    <Input 
                      id="lnAddress" 
                      placeholder="username@getalby.com" 
                      value={lnAddress}
                      onChange={(e) => setLnAddress(e.target.value)}
                      className="bg-background border-white/10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {isSpanish 
                        ? 'Participa anónimamente usando tu identidad Lightning.' 
                        : 'Participate anonymously using your Lightning identity.'}
                    </p>
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSpanish ? 'Conectar' : 'Connect'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  );
}
