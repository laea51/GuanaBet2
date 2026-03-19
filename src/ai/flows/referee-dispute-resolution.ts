'use server';
/**
 * @fileOverview This file implements a Genkit flow for an AI referee assistant.
 * It helps human referees resolve betting disputes by analyzing conflicting claims and event data.
 *
 * - refereeDisputeResolution - A function that handles the AI-assisted dispute resolution process.
 * - RefereeDisputeResolutionInput - The input type for the refereeDisputeResolution function.
 * - RefereeDisputeResolutionOutput - The return type for the refereeDisputeResolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefereeDisputeResolutionInputSchema = z.object({
  betEventDescription: z
    .string()
    .describe('A detailed description of the event the bet was placed on.'),
  winningOutcomeProposed: z
    .string()
    .describe(
      'The specific outcome that was initially designated as the winning outcome, or proposed by one side.'
    ),
  losingOutcomes: z
    .array(z.string())
    .describe('An array of outcomes that were designated as losing outcomes.'),
  conflictingClaims: z
    .array(z.string())
    .describe(
      'An array of conflicting claims or arguments from participants regarding the bet outcome.'
    ),
  externalEventData: z
    .string()
    .optional()
    .describe(
      'Optional: Relevant external data or official results pertaining to the event, if available.'
    ),
});
export type RefereeDisputeResolutionInput = z.infer<
  typeof RefereeDisputeResolutionInputSchema
>;

const RefereeDisputeResolutionOutputSchema = z.object({
  recommendedOutcome: z
    .string()
    .describe(
      'The AI-recommended official outcome for the bet, chosen from the provided winningOutcomeProposed or losingOutcomes, or a new outcome if the evidence strongly supports it.'
    ),
  reasoning: z
    .string()
    .describe(
      'A clear and concise explanation for the recommended outcome, referencing specific details from the claims and external event data.'
    ),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "A confidence score (0-100) indicating the AI's certainty in its recommended outcome."
    ),
});
export type RefereeDisputeResolutionOutput = z.infer<
  typeof RefereeDisputeResolutionOutputSchema
>;

export async function refereeDisputeResolution(
  input: RefereeDisputeResolutionInput
): Promise<RefereeDisputeResolutionOutput> {
  return refereeDisputeResolutionFlow(input);
}

const refereeDisputeResolutionPrompt = ai.definePrompt({
  name: 'refereeDisputeResolutionPrompt',
  input: {schema: RefereeDisputeResolutionInputSchema},
  output: {schema: RefereeDisputeResolutionOutputSchema},
  prompt: `You are an impartial AI assistant tasked with helping a human referee resolve a betting dispute. Your goal is to analyze all provided information and recommend the most fair and accurate bet outcome.

Here are the details of the bet:
Bet Event Description: {{{betEventDescription}}}

Initially Proposed Winning Outcome: {{{winningOutcomeProposed}}}
Other Potential Losing Outcomes:
{{#each losingOutcomes}}
- {{{this}}}
{{/each}}

Conflicting Claims from Participants:
{{#each conflictingClaims}}
- {{{this}}}
{{/each}}

{{#if externalEventData}}
External Event Data (Official Results, News, etc.):
{{{externalEventData}}}
{{/if}}

Based on the bet event description, the proposed outcomes, the conflicting claims, and any external event data, determine the most accurate outcome.
Your recommendation should prioritize factual evidence, especially from external event data. If external data is provided, it should heavily influence your decision.
If the conflicting claims are equally plausible and no external data clarifies the situation, state this in your reasoning.
If a new outcome is strongly supported by evidence, recommend it, otherwise choose from the provided outcomes.

Provide your recommended outcome, a detailed reasoning for your choice, and a confidence score from 0 to 100 regarding your recommendation.`,
});

const refereeDisputeResolutionFlow = ai.defineFlow(
  {
    name: 'refereeDisputeResolutionFlow',
    inputSchema: RefereeDisputeResolutionInputSchema,
    outputSchema: RefereeDisputeResolutionOutputSchema,
  },
  async input => {
    const {output} = await refereeDisputeResolutionPrompt(input);
    return output!;
  }
);
