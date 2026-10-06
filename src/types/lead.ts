export type ConversationStage =
  | 'welcome'
  | 'qualification'
  | 'discovery'
  | 'capture'
  | 'recommendation'
  | 'complete';

export type Challenge =
  | 'Customer Support'
  | 'Lead Generation'
  | 'Sales Automation'
  | 'AI Assistant'
  | 'Workflow Automation'
  | 'Other';

export interface LeadData {
  businessType: string;
  industry: string;
  monthlyCustomers: string;
  challenge: Challenge | string;
  companySize: string;
  currentTools: string;
  targetAudience: string;
  goals: string;
  name: string;
  email: string;
  companyName: string;
  website: string;
  contactMethod: string;
}

export interface Message {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'options' | 'form' | 'recommendation' | 'features';
  options?: string[];
  recommendation?: Recommendation;
}

export interface Recommendation {
  leadSummary: {
    name: string;
    industry: string;
    companySize: string;
    challenge: string;
  };
  recommendation: string;
  expectedBenefits: string[];
  leadQuality: 'High Potential' | 'Medium Potential' | 'Low Potential';
}

export interface QualificationStep {
  id: string;
  question: string;
  field: keyof LeadData;
  options?: string[];
  type: 'text' | 'options' | 'email' | 'select';
  required?: boolean;
  validation?: (value: string) => string | null;
}
