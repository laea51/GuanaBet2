"use client";

import { useState, useEffect } from 'react';
import { Bet, UserSession } from './types';

const STORAGE_KEY_BETS = 'guanabet_bets';
const STORAGE_KEY_USER = 'guanabet_user';
const STORAGE_KEY_LANG = 'guanabet_lang';

export function useBetStore() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  useEffect(() => {
    const storedBets = localStorage.getItem(STORAGE_KEY_BETS);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const storedLang = localStorage.getItem(STORAGE_KEY_LANG);
    
    if (storedBets) setBets(JSON.parse(storedBets));
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    if (storedLang) setLanguage(storedLang as 'en' | 'es');
  }, []);

  const saveBets = (newBets: Bet[]) => {
    setBets(newBets);
    localStorage.setItem(STORAGE_KEY_BETS, JSON.stringify(newBets));
  };

  const login = (lnAddress: string) => {
    const user = { lnAddress };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
  };

  const addBet = (bet: Bet) => {
    saveBets([bet, ...bets]);
  };

  const updateBet = (updatedBet: Bet) => {
    saveBets(bets.map(b => b.id === updatedBet.id ? updatedBet : b));
  };

  return { bets, currentUser, language, login, logout, toggleLanguage, addBet, updateBet };
}
