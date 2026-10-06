import type { QualificationStep } from '../types/lead';

export const WELCOME_ACTIONS = [
  'Generate Leads',
  'Automate Support',
  'Increase Sales',
  'Learn More',
] as const;

export const CHALLENGE_OPTIONS = [
  'Customer Support',
  'Lead Generation',
  'Sales Automation',
  'AI Assistant',
  'Workflow Automation',
  'Other',
] as const;

export const COMPANY_SIZE_OPTIONS = [
  'Solo / Freelancer',
  'Small Business (2–20)',
  'Medium Business (21–100)',
  'Enterprise (100+)',
] as const;

export const CONTACT_METHODS = [
  'Email',
  'Phone',
  'WhatsApp',
  'LinkedIn',
] as const;

export const SUGGESTED_QUESTIONS = [
  'How does this work?',
  'Can it integrate with my CRM?',
  'How much does it cost?',
  'Can it book appointments?',
  'Can it qualify leads automatically?',
] as const;

export const FEATURES = [
  { icon: '✅', title: 'Lead Qualification', description: 'Automatically score and qualify every visitor' },
  { icon: '✅', title: 'AI Discovery Questions', description: 'Smart questions that uncover real needs' },
  { icon: '✅', title: 'CRM Ready', description: 'Export leads directly to your favorite CRM' },
  { icon: '✅', title: 'Meeting Booking Ready', description: 'Book demos and meetings automatically' },
  { icon: '✅', title: 'Automated Follow-up', description: 'Nurture leads with intelligent sequences' },
  { icon: '✅', title: 'Customer Insights', description: 'Deep analytics on visitor behavior and intent' },
] as const;

export const QUALIFICATION_STEPS: QualificationStep[] = [
  {
    id: 'businessType',
    question: 'What type of business do you run?',
    field: 'businessType',
    type: 'text',
    required: true,
  },
  {
    id: 'industry',
    question: 'Which industry are you in?',
    field: 'industry',
    type: 'text',
    required: true,
  },
  {
    id: 'monthlyCustomers',
    question: 'How many customers do you serve monthly?',
    field: 'monthlyCustomers',
    options: ['Under 50', '50–200', '200–1,000', '1,000–5,000', '5,000+'],
    type: 'options',
    required: true,
  },
  {
    id: 'challenge',
    question: 'What challenge are you trying to solve?',
    field: 'challenge',
    options: [...CHALLENGE_OPTIONS],
    type: 'options',
    required: true,
  },
];

export const DISCOVERY_STEPS: QualificationStep[] = [
  {
    id: 'companySize',
    question: 'What is your company size?',
    field: 'companySize',
    options: [...COMPANY_SIZE_OPTIONS],
    type: 'options',
    required: true,
  },
  {
    id: 'currentTools',
    question: 'What tools are you currently using for sales or support?',
    field: 'currentTools',
    type: 'text',
    required: false,
  },
  {
    id: 'targetAudience',
    question: 'Who is your primary target audience?',
    field: 'targetAudience',
    type: 'text',
    required: true,
  },
  {
    id: 'goals',
    question: 'What are your main goals for the next 3–6 months?',
    field: 'goals',
    type: 'text',
    required: true,
  },
];

export const CAPTURE_FIELDS: QualificationStep[] = [
  {
    id: 'name',
    question: 'What is your full name?',
    field: 'name',
    type: 'text',
    required: true,
  },
  {
    id: 'email',
    question: 'What is your work email?',
    field: 'email',
    type: 'email',
    required: true,
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) return 'Email is required';
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      return null;
    },
  },
  {
    id: 'companyName',
    question: 'What is your company name?',
    field: 'companyName',
    type: 'text',
    required: true,
  },
  {
    id: 'website',
    question: 'What is your website? (optional)',
    field: 'website',
    type: 'text',
    required: false,
  },
  {
    id: 'contactMethod',
    question: 'Preferred contact method?',
    field: 'contactMethod',
    options: [...CONTACT_METHODS],
    type: 'options',
    required: true,
  },
];

export const SYSTEM_PROMPT = `You are LeadFlow AI, an intelligent sales and lead qualification assistant.

Goals:
- Understand visitor needs
- Gather business information
- Qualify leads
- Recommend solutions
- Collect contact information

Guidelines:
- Be concise
- Be professional
- Be conversational
- Ask one question at a time
- Guide users naturally through the qualification process
- Never mention that you are an AI model
- Always focus on solving business problems
- Keep responses under 3 sentences when asking questions
- When generating a recommendation, structure it clearly with lead summary, recommended solution, benefits, and quality score
- Be warm and helpful, never pushy
- Use the visitor's previous answers to personalize follow-up questions`;
