"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useBetStore } from '@/app/lib/store';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Zap, TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/app/lib/placeholder-images';
import { translateToSpanish } from '@/ai/flows/translate';

export default function Home() {
  const { bets, language } = useBetStore();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bet');
  const isSpanish = language === 'es';

  // AI Translated content state
  const [translatedContent, setTranslatedContent] = useState({
    heroTitle: "Bet on anything. Instant settlement.",
    heroSub: "The most transparent P2P betting platform powered by the Lightning Network. No middlemen, just pure peer-to-peer competition.",
    btnCreate: "Create a Bet",
    btnHow: "How it works",
    activeBets: "Active Bets",
    viewAll: "View all"
  });
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    async function performTranslation() {
      if (isSpanish) {
        setIsTranslating(true);
        try {
          const titles = ["Bet on anything.", "Instant settlement.", "The most transparent P2P betting platform powered by the Lightning Network. No middlemen, just pure peer-to-peer competition.", "Create a Bet", "How it works", "Active Bets", "View all"];
          const results = await Promise.all(titles.map(t => translateToSpanish({ text: t, context: "homepage content" })));
          
          setTranslatedContent({
            heroTitle: `${results[0].translatedText} ${results[1].translatedText}`,
            heroSub: results[2].translatedText,
            btnCreate: results[3].translatedText,
            btnHow: results[4].translatedText,
            activeBets: results[5].translatedText,
            viewAll: results[6].translatedText
          });
        } catch (e) {
          console.error("Translation failed", e);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setTranslatedContent({
          heroTitle: "Bet on anything. Instant settlement.",
          heroSub: "The most transparent P2P betting platform powered by the Lightning Network. No middlemen, just pure peer-to-peer competition.",
          btnCreate: "Create a Bet",
          btnHow: "How it works",
          activeBets: "Active Bets",
          viewAll: "View all"
        });
      }
    }
    performTranslation();
  }, [isSpanish]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/20 px-3 py-1">
                <Zap className="w-3 h-3 mr-1" /> Peer-to-Peer Betting
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold font-headline mb-6 tracking-tight leading-tight">
                {isTranslating ? <Loader2 className="w-8 h-8 animate-spin inline mr-4" /> : null}
                {translatedContent.heroTitle.split('. ').map((part, i) => (
                  <span key={i} className={i === 1 ? "gradient-text block" : ""}>{part}{i === 0 ? "." : ""} </span>
                ))}
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-xl">
                {translatedContent.heroSub}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/create">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 h-12 px-8">
                    {translatedContent.btnCreate}
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5">
                  {translatedContent.btnHow}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 select-none pointer-events-none">
            {heroImage && (
              <Image 
                src={heroImage.imageUrl} 
                alt={heroImage.description} 
                fill 
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background"></div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-card/20 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">{isSpanish ? 'Velocidad Lightning' : 'Lightning Speed'}</h3>
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? 'Depósitos y retiros instantáneos con tarifas de sub-centavos vía Lightning Network.' 
                    : 'Instant deposits and payouts with sub-cent fees via the Lightning Network.'}
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{isSpanish ? 'Resolución de Disputas' : 'Dispute Resolution'}</h3>
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? 'Herramientas de árbitro asistidas por IA aseguran que cada apuesta se resuelva justamente.' 
                    : 'AI-assisted referee tools ensure every bet is settled fairly even when participants disagree.'}
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold">{isSpanish ? 'Pura Anonimidad' : 'Pure Anonymous'}</h3>
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? 'Sin cuentas, sin KYC. Solo tu dirección LN y tu reputación.' 
                    : 'No accounts, no KYC. Just your LN address and your reputation.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active Bets */}
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="text-3xl font-bold">{translatedContent.activeBets}</h2>
            </div>
            <Link href="/" className="text-accent hover:underline text-sm font-medium">
              {translatedContent.viewAll}
            </Link>
          </div>

          {bets.length === 0 ? (
            <div className="text-center py-20 bg-card/10 rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground mb-6">
                {isSpanish ? 'No hay apuestas activas todavía. ¡Sé el primero!' : 'No active bets yet. Be the first to start one!'}
              </p>
              <Link href="/create">
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                  {isSpanish ? 'Empezar Primera Apuesta' : 'Start First Bet'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bets.map((bet) => (
                <Link key={bet.id} href={`/bet/${bet.id}`}>
                  <Card className="hover:border-primary/50 transition-all cursor-pointer bg-card/80 border-white/10 group">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={bet.status === 'OPEN' ? 'default' : 'secondary'}>
                          {bet.status}
                        </Badge>
                        <span className="text-xs font-mono text-accent">{bet.betAmount.toLocaleString()} SATS</span>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">{bet.eventName}</CardTitle>
                      <CardDescription className="line-clamp-2">{bet.eventDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {bet.participants.length} {isSpanish ? 'Unidos' : 'Joined'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {isSpanish ? 'Finaliza' : 'Ends'} {new Date(bet.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-white/5 pt-4">
                      <p className="text-xs truncate text-muted-foreground">
                        {isSpanish ? 'Creado por' : 'Created by'}: {bet.initiator}
                      </p>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 bg-card/20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <span className="text-muted-foreground hover:text-white cursor-pointer transition-colors">
              {isSpanish ? 'Términos' : 'Terms'}
            </span>
            <span className="text-muted-foreground hover:text-white cursor-pointer transition-colors">
              {isSpanish ? 'Privacidad' : 'Privacy'}
            </span>
            <span className="text-muted-foreground hover:text-white cursor-pointer transition-colors">FAQ</span>
            <span className="text-muted-foreground hover:text-white cursor-pointer transition-colors">
              {isSpanish ? 'Contacto' : 'Contact'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 GuanaBet. Powered by Lightning.</p>
        </div>
      </footer>
    </div>
  );
}
