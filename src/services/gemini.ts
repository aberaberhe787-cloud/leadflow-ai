import type { LeadData, Recommendation } from '../types/lead';

const FAQ_ANSWERS: Record<string, string> = {
  'how does this work': "LeadFlow AI guides visitors through business questions, collects answers in the current session, and displays a tailored recommendation. This demo keeps lead data in browser memory; it does not save leads to a database or send them to a sales team.",
  'can it integrate with my crm': "CRM integration is not configured in this demo. It does not currently sync or export lead details to HubSpot, Salesforce, Pipedrive, Zoho, or another CRM.",
  'how much does it cost': "Pricing depends on the solution and implementation scope. This demo has no live pricing catalogue, so I can help outline likely requirements rather than quote a fixed price.",
  'can it book appointments': "Appointment booking is not connected in this demo. It does not currently check calendars or create bookings, but a calendar integration could be added separately.",
  'can it qualify leads automatically': "This demo guides visitors through qualification questions and generates a rule-based lead-quality estimate from their answers. It does not yet send leads to a CRM or trigger automated follow-up.",
};

function matchFaq(message: string): string | null {
  const normalized = message.toLowerCase().trim().replace(/[?!.]+$/, '');
  for (const [key, answer] of Object.entries(FAQ_ANSWERS)) {
    if (normalized.includes(key) || key.includes(normalized)) return answer;
  }
  if (normalized.includes('crm') || normalized.includes('integrat')) return FAQ_ANSWERS['can it integrate with my crm'];
  if (normalized.includes('cost') || normalized.includes('price') || normalized.includes('pricing')) return FAQ_ANSWERS['how much does it cost'];
  if (normalized.includes('book') || normalized.includes('appointment') || normalized.includes('meeting') || normalized.includes('calendar')) return FAQ_ANSWERS['can it book appointments'];
  if (normalized.includes('qualif') || normalized.includes('automatic')) return FAQ_ANSWERS['can it qualify leads automatically'];
  if (normalized.includes('how does') || normalized.includes('how it work')) return FAQ_ANSWERS['how does this work'];
  return null;
}

export async function generateAssistantReply(userMessage: string, conversationHistory: { role: string; content: string }[], stage: string, leadData: Partial<LeadData>): Promise<string> {
  const faq = matchFaq(userMessage);
  if (faq) return faq;
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reply', userMessage, conversationHistory: conversationHistory.slice(-8), stage,
        leadData: {
          businessType: leadData.businessType, industry: leadData.industry,
          monthlyCustomers: leadData.monthlyCustomers, challenge: leadData.challenge,
          companySize: leadData.companySize, currentTools: leadData.currentTools,
          targetAudience: leadData.targetAudience, goals: leadData.goals,
        },
      }),
    });
    if (!response.ok) throw new Error(`Assistant API returned ${response.status}`);
    const payload = (await response.json()) as { reply?: unknown };
    if (typeof payload.reply === 'string' && payload.reply.trim()) return payload.reply.trim();
  } catch (error) {
    console.error('Assistant API error:', error);
  }
  return getFallbackReply(userMessage, stage, leadData);
}

export async function generateRecommendation(leadData: LeadData): Promise<Recommendation> {
  return getFallbackRecommendation(leadData);
}

function getFallbackReply(userMessage: string, stage: string, leadData: Partial<LeadData>): string {
  const faq = matchFaq(userMessage);
  if (faq) return faq;
  switch (stage) {
    case 'welcome': return "Let's learn a bit about your business so I can recommend a relevant solution. What type of business do you run?";
    case 'qualification':
      if (!leadData.businessType) return 'What type of business do you run?';
      if (!leadData.industry) return 'Which industry are you in?';
      if (!leadData.monthlyCustomers) return 'How many customers do you serve monthly?';
      if (!leadData.challenge) return 'What challenge are you trying to solve right now?';
      return "Thanks! Let's dig a little deeper.";
    case 'discovery':
      if (!leadData.companySize) return 'What is your company size?';
      if (!leadData.currentTools) return 'What tools are you currently using for sales or support?';
      if (!leadData.targetAudience) return 'Who is your primary target audience?';
      if (!leadData.goals) return 'What are your main goals for the next 3–6 months?';
      return "Perfect. Now let's capture your contact details.";
    case 'capture':
      if (!leadData.name) return 'What is your full name?';
      if (!leadData.email) return 'What is your work email?';
      if (!leadData.companyName) return 'What is your company name?';
      if (!leadData.contactMethod) return 'How would you prefer we contact you?';
      return 'Thank you! Preparing your recommendation…';
    case 'complete':
    case 'recommendation': return 'You can ask about how LeadFlow works, CRM integrations, pricing, appointment booking, or lead qualification — or click Start Over to run another qualification.';
    default: return 'How can I help you further?';
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
  const recommendation = challengeMap[leadData.challenge] || 'AI Lead Qualification Assistant';
  const welcomeIntents = ['Generate Leads', 'Automate Support', 'Increase Sales', 'Learn More'];
  const industry = leadData.industry && !welcomeIntents.includes(leadData.industry)
    ? leadData.industry
    : leadData.businessType && !welcomeIntents.includes(leadData.businessType)
      ? leadData.businessType : 'General';
  // Transparent heuristic: award points only for supplied business/intent signals.
  let score = 0;
  if (leadData.businessType.trim()) score += 10;
  if (leadData.industry.trim() && industry !== 'General') score += 10;
  if (leadData.challenge.trim()) score += 25;
  if (leadData.monthlyCustomers.trim()) score += 10;
  if (leadData.companySize.trim()) score += 10;
  if (leadData.currentTools.trim()) score += 5;
  if (leadData.targetAudience.trim()) score += 10;
  if (leadData.goals.trim()) score += 10;
  if (leadData.email.trim()) score += 5;
  if (leadData.contactMethod.trim()) score += 5;
  const leadQuality: Recommendation['leadQuality'] = score >= 75 ? 'High Potential' : score >= 45 ? 'Medium Potential' : 'Low Potential';
  return {
    leadSummary: {
      name: leadData.name || 'Valued Prospect', industry,
      companySize: leadData.companySize || 'Not specified',
      challenge: leadData.challenge || 'Lead Generation',
    },
    recommendation,
    expectedBenefits: [
      'A clearer view of the lead qualification process',
      'Faster initial responses to common questions',
      'More consistent collection of business requirements',
      'A starting point for a tailored automation plan',
    ],
    leadQuality,
  };
}
