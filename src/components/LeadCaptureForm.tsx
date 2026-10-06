import { useState, type FormEvent } from 'react';
import type { LeadData } from '../types/lead';
import { CONTACT_METHODS } from '../data/qualificationQuestions';
import { User, Mail, Building2, Globe, Phone } from 'lucide-react';

interface LeadCaptureFormProps {
  initialData?: Partial<LeadData>;
  onSubmit: (data: Partial<LeadData>) => void;
  isLoading?: boolean;
}

export function LeadCaptureForm({
  initialData = {},
  onSubmit,
  isLoading,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    companyName: initialData.companyName || '',
    website: initialData.website || '',
    contactMethod: initialData.contactMethod || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Please enter a valid email';
    }
    if (!form.companyName.trim()) next.companyName = 'Company name is required';
    if (!form.contactMethod) next.contactMethod = 'Please select a contact method';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    icon: React.ReactNode,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        <input
          type={type}
          value={form[key]}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, [key]: e.target.value }))
          }
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
            errors[key] ? 'border-red-500/60' : 'border-slate-700/60'
          }`}
        />
      </div>
      {errors[key] && (
        <p className="mt-1 text-xs text-red-400">{errors[key]}</p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-xl"
    >
      <h3 className="text-base font-semibold text-white">Contact Details</h3>
      {field('name', 'Full Name', <User className="w-4 h-4" />, 'text', 'John Smith')}
      {field('email', 'Work Email', <Mail className="w-4 h-4" />, 'email', 'john@company.com')}
      {field(
        'companyName',
        'Company Name',
        <Building2 className="w-4 h-4" />,
        'text',
        'Acme Inc.'
      )}
      {field(
        'website',
        'Website (optional)',
        <Globe className="w-4 h-4" />,
        'url',
        'https://example.com'
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Preferred Contact Method
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <Phone className="w-4 h-4" />
          </span>
          <select
            value={form.contactMethod}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, contactMethod: e.target.value }))
            }
            className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/80 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none ${
              errors.contactMethod ? 'border-red-500/60' : 'border-slate-700/60'
            }`}
          >
            <option value="">Select…</option>
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        {errors.contactMethod && (
          <p className="mt-1 text-xs text-red-400">{errors.contactMethod}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
      >
        {isLoading ? 'Submitting…' : 'Get My Recommendation'}
      </button>
    </form>
  );
}
