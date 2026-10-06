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

const FAQ_ANSWERS: Record<string, string> = {
  'how does this work':
    "LeadFlow AI greets every visitor, asks a few smart questions about their business, qualifies them in real time, then delivers a tailored solution recommendation and captures their contact details — all automatically so your sales team only talks to high-intent leads.",
  'can it integrate with my crm':
    "Yes. LeadFlow AI is CRM-ready. Qualified leads (name, email, company, challenge, quality score) can be exported or synced to popular CRMs like HubSpot, Salesforce, Pipedrive, and Zoho via webhook or native integrations.",
  'how much does it cost':
    "Pricing is flexible based on conversation volume and features. Most teams start with a free pilot to measure conversion lift, then choose a plan that fits their lead volume. Share your goals and we can recommend the right package.",
  'can it book appointments':
    "Absolutely. LeadFlow AI is meeting-booking ready. Once a lead is qualified, it can offer available time slots and book demos directly on your calendar (Calendly, Google Calendar, Outlook, and more).",
  'can it qualify leads automatically':
    "Yes — that's the core of LeadFlow AI. It scores every visitor based on industry, company size, challenge, and intent, then tags them as High, Medium, or Low potential so your team focuses on the best opportunities first.",
};

function matchFaq(message: string): string | null {
  const normalized = message.toLowerCase().trim().replace(/[?!.]+$/, '');
  for (const [key, answer] of Object.entries(FAQ_ANSWERS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return answer;
    }
  }
  // fuzzy: check significant words
  if (normalized.includes('crm') || normalized.includes('integrat')) {
    return FAQ_ANSWERS['can it integrate with my crm'];
  }
  if (normalized.includes('cost') || normalized.includes('price') || normalized.includes('pricing')) {
    return FAQ_ANSWERS['how much does it cost'];
  }
  if (normalized.includes('book') || normalized.includes('appointment') || normalized.includes('meeting') || normalized.includes('demo')) {
    return FAQ_ANSWERS['can it book appointments'];
  }
  if (normalized.includes('qualif') || normalized.includes('automatic')) {
    return FAQ_ANSWERS['can it qualify leads automatically'];
  }
  if (normalized.includes('how does') || normalized.includes('how it work')) {
    return FAQ_ANSWERS['how does this work'];
  }
  return null;
}

export async function generateAssistantReply(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  stage: string,
  leadData: Partial<LeadData>
): Promise<string> {
  // Always answer known product FAQs first (any stage)
  const faq = matchFaq(userMessage);
  if (faq) return faq;

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

Respond as LeadFlow AI. Keep it natural and guide the conversation forward.
If they asked a product question (pricing, CRM, booking, how it works), answer clearly and offer to continue or restart qualification.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim() || getFallbackReply(userMessage, stage, leadData);
  } catch (error) {
    console.error('Gemini API error:', error);
    const faq = matchFaq(userMessage);
    if (faq) return faq;
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
  userMessage: string,
  stage: string,
  leadData: Partial<LeadData>
): string {
  const faq = matchFaq(userMessage);
  if (faq) return faq;

  switch (stage) {
    case 'welcome':
      return "Great choice! Let's learn a bit about your business so I can recommend the best solution. What type of business do you run?";
    case 'qualification':
      if (!leadData.businessType) return 'What type of business do you run?';
      if (!leadData.industry) return 'Which industry are you in?';
      if (!leadData.monthlyCustomers) return 'How many customers do you serve monthly?';
      if (!leadData.challenge) return 'What challenge are you trying to solve right now?';
      return "Thanks! Let's dig a little deeper.";
    case 'discovery':
      if (!leadData.companySize) return 'What is your company size?';
      if (!leadData.currentTools)
        return 'What tools are you currently using for sales or support?';
      if (!leadData.targetAudience) return 'Who is your primary target audience?';
      if (!leadData.goals) return 'What are your main goals for the next 3–6 months?';
      return "Perfect. Now I'd love to stay in touch.";
    case 'capture':
      if (!leadData.name) return 'What is your full name?';
      if (!leadData.email) return 'What is your work email?';
      if (!leadData.companyName) return 'What is your company name?';
      if (!leadData.contactMethod) return 'How would you prefer we contact you?';
      return 'Thank you! Generating your personalized recommendation…';
    case 'complete':
    case 'recommendation':
      return "Happy to help. You can ask about how LeadFlow works, CRM integrations, pricing, appointment booking, or automatic lead qualification — or click Start Over to run another qualification.";
    default:
      return 'How can I help you further?';
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

  // Prefer real industry; avoid treating welcome intents as industry
  const welcomeIntents = ['Generate Leads', 'Automate Support', 'Increase Sales', 'Learn More'];
  const industry =
    leadData.industry && !welcomeIntents.includes(leadData.industry)
      ? leadData.industry
      : leadData.businessType && !welcomeIntents.includes(leadData.businessType)
        ? leadData.businessType
        : 'General';

  return {
    leadSummary: {
      name: leadData.name || 'Valued Prospect',
      industry,
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
