
"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useBetStore } from '@/app/lib/store';
import { useRouter } from 'next/navigation';
import { betCreationAssistant } from '@/ai/flows/bet-creation-assistant';
import { Sparkles, Loader2, Plus, X, ArrowRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function CreateBetPage() {
  const { currentUser, addBet } = useBetStore();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    winningOutcomes: [''],
    losingOutcomes: [''],
    betAmount: 1000,
    deadline: ''
  });

  const handleAiAssist = async () => {
    if (!naturalLanguage.trim()) return;
    setIsLoadingAi(true);
    try {
      const result = await betCreationAssistant({ naturalLanguageBetDescription: naturalLanguage });
      setFormData({
        eventName: result.eventName,
        eventDescription: result.eventDescription,
        winningOutcomes: result.winningOutcomes,
        losingOutcomes: result.losingOutcomes,
        betAmount: 1000,
        deadline: new Date(Date.now() + 86400000).toISOString().slice(0, 16) // Default to tomorrow
      });
      toast({
        title: "AI Assisted!",
        description: "We've formulated your bet details based on your description."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not generate bet details. Please try again or fill manually."
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAddOutcome = (type: 'winning' | 'losing') => {
    if (type === 'winning') {
      setFormData({ ...formData, winningOutcomes: [...formData.winningOutcomes, ''] });
    } else {
      setFormData({ ...formData, losingOutcomes: [...formData.losingOutcomes, ''] });
    }
  };

  const handleRemoveOutcome = (type: 'winning' | 'losing', index: number) => {
    if (type === 'winning') {
      const newOutcomes = [...formData.winningOutcomes];
      newOutcomes.splice(index, 1);
      setFormData({ ...formData, winningOutcomes: newOutcomes });
    } else {
      const newOutcomes = [...formData.losingOutcomes];
      newOutcomes.splice(index, 1);
      setFormData({ ...formData, losingOutcomes: newOutcomes });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your Lightning wallet to create a bet."
      });
      return;
    }

    const newBet = {
      id: Math.random().toString(36).substring(7),
      initiator: currentUser.lnAddress,
      eventName: formData.eventName,
      eventDescription: formData.eventDescription,
      winningOutcomes: formData.winningOutcomes.filter(o => o.trim()),
      losingOutcomes: formData.losingOutcomes.filter(o => o.trim()),
      betAmount: formData.betAmount,
      deadline: formData.deadline,
      status: 'OPEN' as const,
      participants: [{
        lnAddress: currentUser.lnAddress,
        contribution: formData.betAmount,
        selectedOutcome: formData.winningOutcomes[0] || 'Initiator'
      }],
      createdAt: new Date().toISOString()
    };

    addBet(newBet);
    toast({
      title: "Bet Created!",
      description: "Redirecting you to your shareable bet page."
    });
    router.push(`/bet/${newBet.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-4 font-headline">Create a New Bet</h1>
          <p className="text-muted-foreground">Define your terms, set the stakes, and share with your network.</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            {/* AI Assistant Tool */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Formulation Assistant
                </CardTitle>
                <CardDescription>
                  Describe your bet in natural language and we'll help you structure the rules to minimize disputes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="e.g. I bet 1000 sats that Argentina will win the next World Cup match against Brazil by more than 2 goals." 
                  value={naturalLanguage}
                  onChange={(e) => setNaturalLanguage(e.target.value)}
                  className="bg-background min-h-[100px]"
                />
                <Button 
                  onClick={handleAiAssist} 
                  disabled={isLoadingAi || !naturalLanguage.trim()}
                  className="w-full bg-primary text-white"
                >
                  {isLoadingAi ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate Structured Bet
                </Button>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-card border-white/10 shadow-xl">
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input 
                      id="eventName" 
                      placeholder="World Cup Final 2026" 
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Detailed Rules / Context</Label>
                    <Textarea 
                      id="eventDescription" 
                      placeholder="Official score at the end of 90 minutes including injury time..." 
                      value={formData.eventDescription}
                      onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-green-500">Winning Outcomes</Label>
                      {formData.winningOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            value={outcome}
                            onChange={(e) => {
                              const newOutcomes = [...formData.winningOutcomes];
                              newOutcomes[idx] = e.target.value;
                              setFormData({ ...formData, winningOutcomes: newOutcomes });
                            }}
                            placeholder="Outcome A"
                            required
                          />
                          {formData.winningOutcomes.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOutcome('winning', idx)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => handleAddOutcome('winning')} className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Win Outcome
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-red-500">Losing Outcomes</Label>
                      {formData.losingOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            value={outcome}
                            onChange={(e) => {
                              const newOutcomes = [...formData.losingOutcomes];
                              newOutcomes[idx] = e.target.value;
                              setFormData({ ...formData, losingOutcomes: newOutcomes });
                            }}
                            placeholder="Outcome B"
                            required
                          />
                          {formData.losingOutcomes.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOutcome('losing', idx)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => handleAddOutcome('losing')} className="w-full border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Loss Outcome
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg font-bold shadow-lg shadow-accent/20">
                Launch Bet & Create Link <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          <aside className="space-y-6">
            <Card className="bg-card border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle>Bet Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-muted-foreground">Bet Amount</span>
                  <div className="flex items-center gap-1 font-bold text-accent">
                    <Zap className="w-4 h-4 fill-accent" />
                    <Input 
                      type="number" 
                      className="w-20 h-8 text-right bg-background border-none p-0 focus-visible:ring-0" 
                      value={formData.betAmount}
                      onChange={(e) => setFormData({ ...formData, betAmount: parseInt(e.target.value) || 0 })}
                    />
                    SATS
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Resolution Deadline</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-background text-xs"
                    required
                  />
                </div>
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground italic">
                    Note: All participants must agree on the final outcome after the deadline. If there's a dispute, a randomly selected participant will serve as referee.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
