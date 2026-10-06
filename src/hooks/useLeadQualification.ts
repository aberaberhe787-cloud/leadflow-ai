import { useState, useCallback, useRef } from 'react';
import type {
  Message,
  LeadData,
  ConversationStage,
  Recommendation,
} from '../types/lead';
import {
  QUALIFICATION_STEPS,
  DISCOVERY_STEPS,
  CAPTURE_FIELDS,
  WELCOME_ACTIONS,
} from '../data/qualificationQuestions';
import {
  generateAssistantReply,
  generateRecommendation,
} from '../services/gemini';

const INITIAL_LEAD: LeadData = {
  businessType: '',
  industry: '',
  monthlyCustomers: '',
  challenge: '',
  companySize: '',
  currentTools: '',
  targetAudience: '',
  goals: '',
  name: '',
  email: '',
  companyName: '',
  website: '',
  contactMethod: '',
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useLeadQualification() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: createId(),
      role: 'assistant',
      content:
        "👋 Welcome to LeadFlow AI\n\nI'm an AI sales assistant that helps businesses qualify leads and identify the right solution.\n\nLet's start with a few quick questions.",
      timestamp: new Date(),
      type: 'options',
      options: [...WELCOME_ACTIONS],
    },
  ]);
  const [stage, setStage] = useState<ConversationStage>('welcome');
  const [leadData, setLeadData] = useState<LeadData>(INITIAL_LEAD);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const processingRef = useRef(false);

  const addMessage = useCallback(
    (msg: Omit<Message, 'id' | 'timestamp'>) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, id: createId(), timestamp: new Date() },
      ]);
    },
    []
  );

  const updateLead = useCallback((field: keyof LeadData, value: string) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const getCurrentSteps = useCallback(() => {
    if (stage === 'qualification') return QUALIFICATION_STEPS;
    if (stage === 'discovery') return DISCOVERY_STEPS;
    if (stage === 'capture') return CAPTURE_FIELDS;
    return [];
  }, [stage]);

  const processUserInput = useCallback(
    async (input: string) => {
      if (processingRef.current || !input.trim()) return;
      processingRef.current = true;

      addMessage({ role: 'user', content: input, type: 'text' });
      setIsTyping(true);

      try {
        // Welcome stage – treat quick actions as starting qualification
        if (stage === 'welcome') {
          // Map quick-action intent without treating it as industry/business type
          const intentMap: Record<string, string> = {
            'Generate Leads': 'Lead Generation',
            'Automate Support': 'Customer Support',
            'Increase Sales': 'Sales Automation',
            'Learn More': '',
          };
          const mappedChallenge = intentMap[input] ?? '';
          if (mappedChallenge) {
            updateLead('challenge', mappedChallenge);
          }

          addMessage({
            role: 'assistant',
            content:
              "Great choice! Let's learn a bit about your business so I can recommend the best solution.",
            type: 'text',
          });
          setStage('qualification');
          setCurrentStepIndex(0);
          setTimeout(() => {
            const first = QUALIFICATION_STEPS[0];
            addMessage({
              role: 'assistant',
              content: first.question,
              type: first.options ? 'options' : 'text',
              options: first.options,
            });
            setIsTyping(false);
            processingRef.current = false;
          }, 500);
          return;
        }

        const steps = getCurrentSteps();
        const currentStep = steps[currentStepIndex];

        if (currentStep) {
          // Validate if needed
          if (currentStep.validation) {
            const error = currentStep.validation(input);
            if (error) {
              setFormErrors((prev) => ({ ...prev, [currentStep.field]: error }));
              addMessage({
                role: 'assistant',
                content: error,
                type: 'text',
              });
              setIsTyping(false);
              processingRef.current = false;
              return;
            }
          }
          if (currentStep.required && !input.trim()) {
            addMessage({
              role: 'assistant',
              content: 'This field is required. Please provide an answer.',
              type: 'text',
            });
            setIsTyping(false);
            processingRef.current = false;
            return;
          }

          // Save answer
          updateLead(currentStep.field, input);
          setFormErrors((prev) => {
            const next = { ...prev };
            delete next[currentStep.field];
            return next;
          });

          const nextIndex = currentStepIndex + 1;
          const updatedLead = { ...leadData, [currentStep.field]: input };

          // Still more steps in current stage
          if (nextIndex < steps.length) {
            setCurrentStepIndex(nextIndex);
            const nextStep = steps[nextIndex];
            // Prefer structured next question
            addMessage({
              role: 'assistant',
              content: nextStep.question,
              type: nextStep.options ? 'options' : 'text',
              options: nextStep.options,
            });
            setIsTyping(false);
            processingRef.current = false;
            return;
          }

          // Stage complete – transition
          if (stage === 'qualification') {
            setStage('discovery');
            setCurrentStepIndex(0);
            const firstDiscovery = DISCOVERY_STEPS[0];
            addMessage({
              role: 'assistant',
              content: `Thanks for sharing that! Let's dig a little deeper so I can give you the best recommendation.\n\n${firstDiscovery.question}`,
              type: firstDiscovery.options ? 'options' : 'text',
              options: firstDiscovery.options,
            });
          } else if (stage === 'discovery') {
            setStage('capture');
            setCurrentStepIndex(0);
            const firstCapture = CAPTURE_FIELDS[0];
            addMessage({
              role: 'assistant',
              content: `Excellent. Now I'd love to prepare a personalized recommendation for you. Just a few contact details.\n\n${firstCapture.question}`,
              type: 'text',
            });
          } else if (stage === 'capture') {
            // All capture done – generate recommendation
            setStage('recommendation');
            addMessage({
              role: 'assistant',
              content: 'Thank you! Analyzing your answers and preparing a tailored recommendation…',
              type: 'text',
            });

            const finalLead = { ...updatedLead };
            const rec = await generateRecommendation(finalLead);
            setRecommendation(rec);
            setLeadData(finalLead);

            addMessage({
              role: 'assistant',
              content: 'Here is your personalized LeadFlow recommendation:',
              type: 'recommendation',
              recommendation: rec,
            });

            // Features message
            setTimeout(() => {
              addMessage({
                role: 'assistant',
                content: 'LeadFlow AI can help you with:',
                type: 'features',
              });
              setStage('complete');
              setIsTyping(false);
              processingRef.current = false;
            }, 800);
            return;
          }
        } else {
          // Free-form after complete or suggested questions
          const history = messages.map((m) => ({
            role: m.role,
            content: m.content,
          }));
          const reply = await generateAssistantReply(
            input,
            history,
            stage,
            leadData
          );
          addMessage({ role: 'assistant', content: reply, type: 'text' });
        }
      } catch (err) {
        console.error(err);
        addMessage({
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          type: 'text',
        });
      } finally {
        setIsTyping(false);
        processingRef.current = false;
      }
    },
    [
      stage,
      currentStepIndex,
      leadData,
      messages,
      addMessage,
      updateLead,
      getCurrentSteps,
    ]
  );

  const handleOptionClick = useCallback(
    (option: string) => {
      processUserInput(option);
    },
    [processUserInput]
  );

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      processUserInput(question);
    },
    [processUserInput]
  );

  const resetConversation = useCallback(() => {
    setMessages([
      {
        id: createId(),
        role: 'assistant',
        content:
          "👋 Welcome to LeadFlow AI\n\nI'm an AI sales assistant that helps businesses qualify leads and identify the right solution.\n\nLet's start with a few quick questions.",
        timestamp: new Date(),
        type: 'options',
        options: [...WELCOME_ACTIONS],
      },
    ]);
    setStage('welcome');
    setLeadData(INITIAL_LEAD);
    setCurrentStepIndex(0);
    setRecommendation(null);
    setFormErrors({});
    setIsTyping(false);
    processingRef.current = false;
  }, []);

  return {
    messages,
    stage,
    leadData,
    isTyping,
    recommendation,
    formErrors,
    processUserInput,
    handleOptionClick,
    handleSuggestedQuestion,
    resetConversation,
  };
}
