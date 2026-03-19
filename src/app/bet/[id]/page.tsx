"use client";

import { use, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useBetStore } from '@/app/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Zap, Users, Clock, Share2, ShieldAlert, CheckCircle2, AlertCircle, Copy, Info, Gavel, Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { refereeDisputeResolution } from '@/ai/flows/referee-dispute-resolution';

export default function BetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bets, currentUser, updateBet } = useBetStore();
  const { toast } = useToast();
  
  const bet = bets.find(b => b.id === id);
  const [isCopied, setIsCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [refereeOutput, setRefereeOutput] = useState<{
    recommendedOutcome: string;
    reasoning: string;
    confidenceScore: number;
  } | null>(null);

  if (!bet) {
    return <div className="p-20 text-center">Bet not found.</div>;
  }

  const isParticipant = currentUser && bet.participants.some(p => p.lnAddress === currentUser.lnAddress);
  const canJoin = bet.status === 'OPEN' && !isParticipant;
  const canVote = bet.status === 'VOTING' && isParticipant && !bet.participants.find(p => p.lnAddress === currentUser.lnAddress)?.votedOutcome;
  const isReferee = isParticipant && bet.participants.find(p => p.lnAddress === currentUser?.lnAddress)?.isReferee;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast({ title: "Link Copied!", description: "Share this link with your contacts." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleJoin = (outcome: string) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Connect Wallet", description: "You must connect your Lightning wallet to join." });
      return;
    }
    const newParticipant = {
      lnAddress: currentUser.lnAddress,
      contribution: bet.betAmount,
      selectedOutcome: outcome
    };
    const updatedBet = {
      ...bet,
      participants: [...bet.participants, newParticipant]
    };
    updateBet(updatedBet);
    toast({ title: "Joined Bet!", description: "Successfully placed your wager." });
    setIsJoining(false);
  };

  const handleVote = (outcome: string) => {
    const updatedParticipants = bet.participants.map(p => 
      p.lnAddress === currentUser?.lnAddress ? { ...p, votedOutcome: outcome } : p
    );
    
    // Simple logic: if all participants voted, check consensus
    const allVoted = updatedParticipants.every(p => p.votedOutcome);
    let newStatus = bet.status;
    let finalOutcome = bet.finalOutcome;

    if (allVoted) {
      const votes = updatedParticipants.map(p => p.votedOutcome);
      const uniqueVotes = new Set(votes);
      if (uniqueVotes.size === 1) {
        newStatus = 'RESOLVED';
        finalOutcome = votes[0];
      } else {
        newStatus = 'DISPUTED';
        // Randomly pick a referee
        const refereeIdx = Math.floor(Math.random() * updatedParticipants.length);
        updatedParticipants[refereeIdx].isReferee = true;
      }
    }

    updateBet({
      ...bet,
      status: newStatus,
      participants: updatedParticipants,
      finalOutcome
    });
    
    toast({ title: "Vote Cast!", description: "Waiting for other participants to agree." });
  };

  const handleRefereeResolve = async () => {
    setIsResolving(true);
    try {
      const result = await refereeDisputeResolution({
        betEventDescription: bet.eventDescription,
        winningOutcomeProposed: bet.winningOutcomes[0],
        losingOutcomes: bet.losingOutcomes,
        conflictingClaims: bet.participants.map(p => `${p.lnAddress} claims: ${p.votedOutcome}`),
        externalEventData: "Participant consensus failed. Referee invoked."
      });
      setRefereeOutput(result);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to invoke AI Assistant." });
    } finally {
      setIsResolving(false);
    }
  };

  const finalizeRefereeDecision = (outcome: string) => {
    updateBet({
      ...bet,
      status: 'RESOLVED',
      finalOutcome: outcome
    });
    toast({ title: "Bet Resolved", description: `Official outcome set to: ${outcome}` });
  };

  const progress = (bet.participants.length / 10) * 100; // Mock max 10 for visual

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={bet.status === 'RESOLVED' ? 'outline' : 'default'} className={bet.status === 'RESOLVED' ? 'border-green-500 text-green-500' : 'bg-primary text-white'}>
                {bet.status}
              </Badge>
              <Badge variant="outline" className="border-accent/20 text-accent font-mono">
                {bet.betAmount.toLocaleString()} SATS / person
              </Badge>
            </div>
            <h1 className="text-4xl font-bold font-headline">{bet.eventName}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{bet.eventDescription}</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button onClick={handleShare} variant="outline" className="border-white/10 w-full flex items-center justify-center gap-2">
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              Share Bet Link
            </Button>
            {bet.status === 'OPEN' && new Date() < new Date(bet.deadline) && (
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-accent font-medium uppercase tracking-wider">Pot Size</span>
                  <Zap className="w-4 h-4 text-accent fill-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">
                  {(bet.participants.length * bet.betAmount).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">SATS</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            {/* Resolution Progress */}
            {bet.status === 'VOTING' && (
              <Card className="bg-violet-500/5 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-violet-500" />
                    Agreement Phase
                  </CardTitle>
                  <CardDescription>
                    The deadline has passed. Please vote on what the official outcome was.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {[...bet.winningOutcomes, ...bet.losingOutcomes].map((outcome) => (
                      <Button 
                        key={outcome} 
                        variant={canVote ? "default" : "outline"}
                        disabled={!canVote}
                        onClick={() => handleVote(outcome)}
                        className="flex-grow md:flex-grow-0"
                      >
                        {outcome}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dispute Resolution UI */}
            {bet.status === 'DISPUTED' && (
              <Card className="bg-destructive/5 border-destructive/20 animate-pulse-glow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Consensus Failed: Dispute
                  </CardTitle>
                  <CardDescription>
                    Participants do not agree on the outcome. A referee has been selected.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isReferee ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-background/50 rounded-lg border border-white/5">
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                          <Gavel className="w-4 h-4 text-accent" />
                          You are the Referee
                        </h4>
                        <p className="text-sm text-muted-foreground">As a randomly selected participant, you have the final say. You can use the AI Assistant to analyze the data.</p>
                      </div>
                      <Button 
                        onClick={handleRefereeResolve} 
                        className="w-full bg-accent text-accent-foreground"
                        disabled={isResolving}
                      >
                        {isResolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Get AI Referee Analysis
                      </Button>

                      {refereeOutput && (
                        <div className="space-y-4 mt-6 p-6 bg-card border border-accent/20 rounded-xl">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold">AI Recommendation</h3>
                            <Badge variant="secondary" className="bg-accent/20 text-accent">{refereeOutput.confidenceScore}% Confidence</Badge>
                          </div>
                          <div className="p-3 bg-accent/10 text-accent font-bold rounded-lg border border-accent/20">
                            Recommended Outcome: {refereeOutput.recommendedOutcome}
                          </div>
                          <p className="text-sm italic">{refereeOutput.reasoning}</p>
                          <div className="flex gap-2 pt-4 border-t border-white/5">
                            <Button onClick={() => finalizeRefereeDecision(refereeOutput.recommendedOutcome)} className="flex-1">
                              Accept & Resolve
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setRefereeOutput(null)}>
                              Discard
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">Waiting for the referee to make a final decision.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Participation List */}
            <Card className="bg-card border-white/10 overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  Participants ({bet.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {bet.participants.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {p.lnAddress.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.lnAddress}</p>
                          <p className="text-xs text-muted-foreground">Betting on: <span className="text-accent">{p.selectedOutcome}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold">{p.contribution.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">SATS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            {/* Countdown / Stats */}
            <Card className="bg-card border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {bet.status === 'RESOLVED' ? 'Finished' : 'Deadline'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-2xl font-bold">
                  <Clock className="w-6 h-6 text-accent" />
                  {bet.status === 'RESOLVED' ? 'Event Settled' : new Date(bet.deadline).toLocaleDateString()}
                </div>
                
                {bet.status === 'RESOLVED' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-xs text-green-500 font-bold uppercase mb-1">Winning Outcome</p>
                    <p className="text-xl font-bold text-white">{bet.finalOutcome}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Rewards distributed to {bet.participants.filter(p => p.selectedOutcome === bet.finalOutcome).length} winners.
                    </p>
                  </div>
                )}

                {canJoin && (
                  <Dialog open={isJoining} onOpenChange={setIsJoining}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-6 text-lg font-bold">
                        Join Bet for {bet.betAmount.toLocaleString()} SATS
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/10">
                      <DialogHeader>
                        <DialogTitle>Select Your Outcome</DialogTitle>
                        <CardDescription>Choose carefully. Your sats will be locked in the contract until resolution.</CardDescription>
                      </DialogHeader>
                      <div className="grid gap-3 py-4">
                        {[...bet.winningOutcomes, ...bet.losingOutcomes].map((outcome) => (
                          <Button 
                            key={outcome} 
                            variant={selectedOutcome === outcome ? 'default' : 'outline'}
                            onClick={() => setSelectedOutcome(outcome)}
                            className="justify-start h-12 text-left"
                          >
                            {outcome}
                          </Button>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => handleJoin(selectedOutcome)} 
                          disabled={!selectedOutcome}
                          className="w-full bg-primary"
                        >
                          Confirm & Pay Invoice
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Bet Protocol Details</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                      <span>Agreement Type</span>
                      <span>Consensus + Referee</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase text-muted-foreground">
                      <span>Network</span>
                      <span>Lightning Network</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
