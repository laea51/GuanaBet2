'use server';
/**
 * @fileOverview A translation AI agent for GuanaBet.
 *
 * - translateText - A function that handles the translation of text to Spanish.
 * - TranslateInput - The input type for the translateText function.
 * - TranslateOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The English text to translate to Spanish.'),
  context: z.string().optional().describe('Contextual information about where the text appears (e.g., "button label", "hero description").'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.object({
  translatedText: z.string().describe('The translated Spanish text.'),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translateToSpanish(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePrompt',
  input: { schema: TranslateInputSchema },
  output: { schema: TranslateOutputSchema },
  prompt: `You are a professional translator for GuanaBet, a peer-to-peer betting application powered by the Lightning Network. 
Translate the following English text into clear, natural-sounding, and culturally appropriate Spanish.

Keep the tone professional yet exciting, suitable for a betting platform. 
Maintain any specific terminology like "Sats", "Lightning Network", or "Peer-to-Peer" where appropriate for a technical audience, but translate the general interface text.

Context: {{{context}}}
Text: {{{text}}}`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
