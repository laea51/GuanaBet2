'use server';
/**
 * @fileOverview An AI assistant that helps users formulate clear and unambiguous bet events, winning/losing outcomes, and timeframes.
 *
 * - betCreationAssistant - A function that handles the bet creation assistance process.
 * - BetCreationAssistantInput - The input type for the betCreationAssistant function.
 * - BetCreationAssistantOutput - The return type for the betCreationAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BetCreationAssistantInputSchema = z.object({
  naturalLanguageBetDescription: z
    .string()
    .describe(
      'A natural language description of the bet the user wants to create, including event details, desired winning outcomes, alternate losing outcomes, and a timeframe.'
    ),
});
export type BetCreationAssistantInput = z.infer<typeof BetCreationAssistantInputSchema>;

const BetCreationAssistantOutputSchema = z.object({
  eventName: z
    .string()
    .describe('A clear, concise, and unambiguous name for the betting event.'),
  eventDescription: z
    .string()
    .describe('A detailed description of the event, providing all necessary context.'),
  winningOutcomes: z
    .array(z.string())
    .describe('An array of clearly defined winning outcomes. Each outcome should be unambiguous.'),
  losingOutcomes: z
    .array(z.string())
    .describe(
      'An array of clearly defined losing outcomes. These should cover all scenarios where the bet is lost.'
    ),
  betDuration: z
    .string()
    .describe(
      'A natural language description of the bet\'s duration or deadline (e.g., "by end of day tomorrow", "until the match starts", "24 hours from now").'
    ),
});
export type BetCreationAssistantOutput = z.infer<typeof BetCreationAssistantOutputSchema>;

export async function betCreationAssistant(
  input: BetCreationAssistantInput
): Promise<BetCreationAssistantOutput> {
  return betCreationAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'betCreationAssistantPrompt',
  input: { schema: BetCreationAssistantInputSchema },
  output: { schema: BetCreationAssistantOutputSchema },
  prompt: `You are an AI assistant for GuanaBet, a peer-to-peer betting application. Your task is to help users formulate clear, unambiguous, and dispute-minimized bet events, winning outcomes, losing outcomes, and timeframes based on their natural language descriptions.

Analyze the provided natural language bet description and extract the following structured information:
- eventName: A concise and clear name for the event.
- eventDescription: A detailed explanation of the event, ensuring all necessary context is provided.
- winningOutcomes: A list of specific and unambiguous conditions under which the bet is considered won.
- losingOutcomes: A list of specific and unambiguous conditions under which the bet is considered lost. Ensure these cover all alternative scenarios to the winning outcomes.
- betDuration: A clear description of the timeframe or deadline for the bet, in natural language.

If any information is ambiguous or missing, make a reasonable assumption and state it clearly, or indicate that more information is needed. Ensure the output is formatted as a JSON object.

Natural Language Bet Description: {{{naturalLanguageBetDescription}}}`,
});

const betCreationAssistantFlow = ai.defineFlow(
  {
    name: 'betCreationAssistantFlow',
    inputSchema: BetCreationAssistantInputSchema,
    outputSchema: BetCreationAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
