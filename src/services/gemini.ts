import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LeadData, Recommendation } from '../types/lead';
import { SYSTEM_PROMPT } from '../data/qualificationQuestions';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!API_KEY) {
    console.warn('Gemini API key not found. Running in demo mode.');
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

export async function generateAssistantReply(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  stage: string,
  leadData: Partial<LeadData>
): Promise<string> {
  const client = getClient();
  if (!client) {
    return getFallbackReply(userMessage, stage, leadData);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const historyContext = conversationHistory
      .slice(-8)
      .map((m) => `${m.role === 'user' ? 'Visitor' : 'LeadFlow AI'}: ${m.content}`)
      .join('\n');

    const leadContext = Object.entries(leadData)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const prompt = `${SYSTEM_PROMPT}

Current stage: ${stage}
Known lead data so far: ${leadContext || 'None yet'}

Conversation so far:
${historyContext}

Visitor just said: "${userMessage}"

Respond as LeadFlow AI. Keep it natural and guide the conversation forward.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim() || getFallbackReply(userMessage, stage, leadData);
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackReply(userMessage, stage, leadData);
  }
}

export async function generateRecommendation(
  leadData: LeadData
): Promise<Recommendation> {
  const client = getClient();
  if (!client) {
    return getFallbackRecommendation(leadData);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}

Based on the following lead information, generate a structured recommendation.

Lead data:
${JSON.stringify(leadData, null, 2)}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "leadSummary": {
    "name": "...",
    "industry": "...",
    "companySize": "...",
    "challenge": "..."
  },
  "recommendation": "Name of the recommended solution",
  "expectedBenefits": ["benefit1", "benefit2", "benefit3", "benefit4"],
  "leadQuality": "High Potential" | "Medium Potential" | "Low Potential"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON even if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Recommendation;
      return parsed;
    }
    return getFallbackRecommendation(leadData);
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    return getFallbackRecommendation(leadData);
  }
}

function getFallbackReply(
  _userMessage: string,
  stage: string,
  leadData: Partial<LeadData>
): string {
  switch (stage) {
    case 'welcome':
      return "Great choice! Let's learn a bit about your business so I can recommend the best solution. What type of business do you run?";
    case 'qualification':
      if (!leadData.businessType) return "What type of business do you run?";
      if (!leadData.industry) return "Which industry are you in?";
      if (!leadData.monthlyCustomers) return "How many customers do you serve monthly?";
      if (!leadData.challenge) return "What challenge are you trying to solve right now?";
      return "Thanks! Let's dig a little deeper.";
    case 'discovery':
      if (!leadData.companySize) return "What is your company size?";
      if (!leadData.currentTools) return "What tools are you currently using for sales or support?";
      if (!leadData.targetAudience) return "Who is your primary target audience?";
      if (!leadData.goals) return "What are your main goals for the next 3–6 months?";
      return "Perfect. Now I'd love to stay in touch.";
    case 'capture':
      if (!leadData.name) return "What is your full name?";
      if (!leadData.email) return "What is your work email?";
      if (!leadData.companyName) return "What is your company name?";
      if (!leadData.contactMethod) return "How would you prefer we contact you?";
      return "Thank you! Generating your personalized recommendation…";
    default:
      return "How can I help you further?";
  }
}

function getFallbackRecommendation(leadData: LeadData): Recommendation {
  const challengeMap: Record<string, string> = {
    'Lead Generation': 'AI Lead Qualification Assistant',
    'Customer Support': 'AI Support Automation Suite',
    'Sales Automation': 'Intelligent Sales Workflow Engine',
    'AI Assistant': 'Custom AI Sales Assistant',
    'Workflow Automation': 'End-to-End Workflow Automation Platform',
    Other: 'Tailored LeadFlow Solution',
  };

  const recommendation =
    challengeMap[leadData.challenge] || 'AI Lead Qualification Assistant';

  return {
    leadSummary: {
      name: leadData.name || 'Valued Prospect',
      industry: leadData.industry || 'General',
      companySize: leadData.companySize || 'Not specified',
      challenge: leadData.challenge || 'Lead Generation',
    },
    recommendation,
    expectedBenefits: [
      'More qualified leads',
      'Faster response times',
      'Improved conversion rates',
      'Reduced manual workload',
    ],
    leadQuality: 'High Potential',
  };
}
