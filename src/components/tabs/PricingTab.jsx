import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X,
  Zap, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle2, 
  Star,
  Lock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  FileText,
  Headphones,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function PricingTab({ profile, onUpdateProfile, onNavigate, lang = 'en' }) {
  const { apiFetch } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('EASYPAISA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Real subscription state from backend
  const [activeSub, setActiveSub]   = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [backendPlans, setBackendPlans] = useState([]);
  const [paymentProviders, setPaymentProviders] = useState([]);
  const [paymentProvidersLoading, setPaymentProvidersLoading] = useState(true);

  const paymentMethods = [
    { id: 'EASYPAISA', label: 'Easypaisa Wallet', icon: Smartphone },
    { id: 'JAZZCASH', label: 'JazzCash Mobile', icon: Smartphone },
    { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
  ];
  const providerById = Object.fromEntries(paymentProviders.map((provider) => [provider.id, provider]));
  const selectedProvider = providerById[paymentMethod];

  // Load subscription status and plans from real backend on mount
  useEffect(() => {
    loadSubscription();
    loadPlans();
    loadPaymentProviders();
  }, []);

  useEffect(() => {
    const firstAvailable = paymentMethods.find((method) => providerById[method.id]?.enabled);
    if (!selectedProvider?.enabled) setPaymentMethod(firstAvailable?.id ?? '');
  }, [paymentProviders]);

  const loadSubscription = async () => {
    setSubLoading(true);
    try {
      const res = await apiFetch('/api/payments/subscription');
      if (res.ok) {
        const data = await res.json();
        setActiveSub(data.data);
      }
    } catch { /* not logged in or network error */ }
    finally { setSubLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/payments/plans');
      if (res.ok) {
        const data = await res.json();
        setBackendPlans(Array.isArray(data?.data) ? data.data : []);
      }
    } catch { /* use hardcoded fallback */ }
  };

  const loadPaymentProviders = async () => {
    setPaymentProvidersLoading(true);
    try {
      const res = await fetch('/api/payments/providers');
      if (!res.ok) throw new Error('Payment providers are unavailable.');
      const data = await res.json();
      setPaymentProviders(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setPaymentProviders([]);
    } finally {
      setPaymentProvidersLoading(false);
    }
  };

  // Current plan slug from real subscription (falls back to profile field for compat)
  const currentPlanSlug = activeSub?.plan_slug ?? profile?.subscriptionTier ?? 'free';

  /**
   * handleCheckout — REAL backend payment initiation.
   * NO setTimeout simulation. Payment is NOT confirmed until backend verifies.
   */
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedPlanForModal) return;
    if (!paymentMethod || !selectedProvider?.enabled) {
      setPaymentError('No payment method is available yet. Please contact support or try again later.');
      return;
    }
    setIsProcessing(true);
    setPaymentError('');

    try {
      // Step 1: Initiate payment — backend creates PENDING record
      const initRes = await apiFetch('/api/payments/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          planSlug: selectedPlanForModal.backendSlug ?? selectedPlanForModal.id,
          provider: paymentMethod,
        }),
      });

      const initData = await initRes.json().catch(() => ({}));

      if (!initRes.ok) {
        setPaymentError(initData.error ?? 'Payment initiation failed. Please try again.');
        return;
      }

      // Free plan — activated immediately by backend
      if (initData.status === 'activated') {
        setPaymentSuccess(true);
        await loadSubscription();
        if (onUpdateProfile) onUpdateProfile({ subscriptionTier: selectedPlanForModal.backendSlug ?? selectedPlanForModal.id });
        return;
      }

      // Bank transfer — show manual instructions
      if (initData.provider?.method === 'MANUAL') {
        const instr = initData.provider.instructions;
        setPaymentError(`Bank Transfer Instructions:\n\nBank: ${instr.bankName}\nAccount: ${instr.accountNumber}\nAmount: PKR ${instr.amount}\nReference: ${instr.reference}\n\n${instr.note}`);
        return;
      }

      // Step 2: Redirect to the payment provider's hosted checkout.
      // The provider will call the webhook, which activates the subscription.
      // Then redirect user back and poll /api/payments/subscription.
      if (initData.provider?.method === 'POST' && initData.provider?.actionUrl) {
        // Build and submit a hidden form to redirect to provider
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = initData.provider.actionUrl;
        Object.entries(initData.provider.fields ?? {}).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      setPaymentError('The selected payment method could not start a secure checkout. Please choose another method or try again later.');

    } catch (err) {
      setPaymentError('Network error. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'basic',
      backendSlug: 'free',
      name: 'Basic',
      badge: 'Free Forever',
      priceMonthly: 'PKR 0',
      priceAnnually: 'PKR 0',
      description: 'Essential tools for High School & Inter students exploring academic pathways.',
      highlight: false,
      buttonText: currentPlanSlug === 'free' ? 'Current Plan' : 'Downgrade to Basic',
      features: [
        'AI-driven career insights & Holland Code (RIASEC) Analysis',
        'HEC Accredited Universities Directory (180+ Institutes)',
        'Scholarship Directory & Merit Aggregate Calculators',
        'TEVTA & Free IT Skill Course Listings',
        'Standard Community Forum Access',
        'Basic AI Career Assistant (5 queries / day)'
      ]
    },
    {
      id: 'pro',
      backendSlug: 'premium',
      name: 'Pro',
      badge: 'Most Popular',
      priceMonthly: 'PKR 999',
      priceAnnually: 'PKR 2,999',
      savings: 'Save 25% Annually',
      description: 'Comprehensive AI suite for admission prep, resumes, and interview mastery.',
      highlight: true,
      buttonText: currentPlanSlug === 'premium' ? 'Active Plan' : 'Upgrade to Pro',
      features: [
        'Everything in Basic Plan',
        'Unlimited AI-driven career insights & Custom Roadmaps',
        'AI Mock Interviews with Real-time Feedback & Scoring',
        'AI Resume & Cover Letter Builder with PDF Downloads',
        'Real-time Merit Aggregate Estimator & Entry Test Prep',
        'Full Course Certificate Pathways & Skill Gap Analysis',
        'Priority Gemini AI Processing Speed'
      ]
    },
    {
      id: 'enterprise',
      backendSlug: 'pro',
      name: 'Enterprise',
      badge: 'Maximum Value',
      priceMonthly: 'PKR 1,999',
      priceAnnually: 'PKR 5,999',
      savings: 'Save 25% Annually',
      description: 'Priority mentorship access, 1-on-1 expert sessions, and institution licensing.',
      highlight: false,
      buttonText: currentPlanSlug === 'pro' ? 'Active Plan' : 'Unlock Enterprise',
      features: [
        'Everything in Pro Plan',
        'Priority Mentorship Access with 1-on-1 Certified Counselors',
        'Direct WhatsApp Admission Helpline & Portfolio Review',
        'Transnational Dual Degree & Credit Transfer Guidance',
        'Fast-Track Recruiter & Internship Referral Badge',
        'Multi-Student Family & School Institution License'
      ]
    }
  ];

  const comparisonCategories = [
    {
      category: 'AI Guidance & Tools',
      features: [
        { name: 'Daily AI Career Queries', basic: '5 / day', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'RIASEC Assessment Report', basic: 'Basic', pro: 'Detailed', enterprise: 'Comprehensive + Counseling' },
        { name: 'AI Resume & Cover Letter', basic: false, pro: true, enterprise: true },
        { name: 'AI Mock Interviews & Voice Assistant', basic: false, pro: true, enterprise: true },
        { name: 'Entry Test Merit Calculator', basic: 'Standard', pro: 'Advanced + AI Predictor', enterprise: 'Advanced + Priority Prep' },
      ]
    },
    {
      category: 'Mentorship & Human Guidance',
      features: [
        { name: 'Community Forum Access', basic: true, pro: true, enterprise: true },
        { name: '1-on-1 Counselor Call', basic: false, pro: '1 Session / mo', enterprise: 'Unlimited Priority' },
        { name: 'Direct WhatsApp Helpline', basic: false, pro: false, enterprise: true },
        { name: 'Resume & Portfolio Review by Experts', basic: false, pro: 'Standard', enterprise: 'Fast-Track 24h Review' },
      ]
    },
    {
      category: 'Academic & Institutional Access',
      features: [
        { name: 'University & Scholarship Directory', basic: true, pro: true, enterprise: true },
        { name: 'Transnational & Dual Degree Pathways', basic: 'View Only', pro: 'Full Access', enterprise: 'Direct Application Assistance' },
        { name: 'Recruiter & Internship Referrals', basic: false, pro: 'Standard', enterprise: 'Priority Fast-Track Badge' },
        { name: 'Institution / Multi-User Family License', basic: false, pro: false, enterprise: 'Up to 5 Accounts' }
      ]
    }
  ];

  const faqs = [
    {
      question: 'How does payment activation work in Pakistan?',
      answer: 'We support instant activation via Easypaisa Mobile Wallet, JazzCash, Debit/Credit Cards, and 1Link Bank Transfers. Once selected, your account upgrades immediately with zero waiting time.'
    },
    {
      question: 'Can I change or cancel my plan at any time?',
      answer: 'Yes! You can upgrade, downgrade, or switch between monthly and annual billing at any time from your account settings with no hidden fees or penalties.'
    },
    {
      question: 'What is included in the 1-on-1 Mentorship session?',
      answer: 'Enterprise and Pro members receive personalized 1-on-1 guidance calls with HEC-certified academic counselors to review university options, merit cutoffs, and essay/portfolio submissions.'
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'Yes, we offer a 7-day hassle-free refund policy. If NexStep Pro or Enterprise does not meet your expectations, contact our helpline for a full refund.'
    }
  ];

  // handleCheckout is defined above using real backend API calls.

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-8 md:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-5">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-extrabold uppercase tracking-wider shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>NexStep Premium Packages</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Invest in Your Academic & Career Future
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Unlock advanced AI career counseling, real-time merit estimators, AI resume builders, and certified 1-on-1 mentor calls tailored for Pakistani students.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center gap-4">
            <span className={`text-xs font-bold transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              className="relative w-16 h-8 rounded-full bg-slate-800 p-1 transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle billing cycle"
            >
              <div 
                className={`w-6 h-6 rounded-full bg-emerald-500 shadow-md transition-transform duration-200 ${
                  billingCycle === 'annually' ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold transition-colors ${billingCycle === 'annually' ? 'text-white' : 'text-slate-400'}`}>
                Annual Billing
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                Save up to 75%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tier Status Alert */}
      {(activeSub || currentPlanSlug !== 'free') && !subLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs font-bold flex items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
            <div>
              <span>Active plan: <strong>{activeSub?.plan_name ?? currentPlanSlug.toUpperCase()}</strong></span>
              {activeSub?.expires_at && (
                <p className="text-[11px] text-emerald-400/80 font-normal">
                  Renews: {new Date(activeSub.expires_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-800 text-white rounded-lg text-[10px] uppercase font-extrabold tracking-wider">Active</span>
        </motion.div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isCurrent = currentPlanSlug === (plan.backendSlug ?? plan.id);
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative rounded-3xl p-7 transition-all flex flex-col justify-between space-y-6 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white border-2 border-emerald-500 shadow-2xl shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl dark:hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  plan.highlight 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="space-y-5 pt-2">
                <div>
                  <h2 className="text-2xl font-black">{plan.name}</h2>
                  <p className={`text-xs mt-1.5 leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="py-3 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl md:text-4xl font-black tracking-tight">{price}</span>
                    <span className={`text-xs ${plan.highlight ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'annually' && plan.savings && (
                    <span className="text-[11px] font-bold text-emerald-400 block mt-1">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                    plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.highlight ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`} />
                        <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                disabled={isCurrent}
                onClick={() => {
                  if (plan.backendSlug === 'free') {
                    if (onUpdateProfile) onUpdateProfile({ subscriptionTier: 'free' });
                  } else {
                    setSelectedPlanForModal(plan);
                    setPaymentSuccess(false);
                    setPaymentError('');
                  }
                }}
                className={`w-full py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isCurrent
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 cursor-default'
                    : plan.highlight
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                }`}
              >
                {isCurrent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </>
                ) : (
                  <>
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Comprehensive Plan Comparison
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            Compare all features across Basic, Pro, and Enterprise tiers to find your perfect fit.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 md:p-5 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider w-1/3">Feature</th>
                <th className="p-4 md:p-5 text-xs font-black text-slate-900 dark:text-white text-center">Basic</th>
                <th className="p-4 md:p-5 text-xs font-black text-emerald-600 dark:text-emerald-400 text-center bg-emerald-50/50 dark:bg-emerald-950/20">Pro</th>
                <th className="p-4 md:p-5 text-xs font-black text-slate-900 dark:text-white text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {comparisonCategories.map((cat, idx) => (
                <React.Fragment key={idx}>
                  <tr className="bg-slate-100/60 dark:bg-slate-800/80 font-black text-slate-800 dark:text-slate-200">
                    <td colSpan={4} className="px-4 py-2.5 text-[11px] uppercase tracking-wider">
                      {cat.category}
                    </td>
                  </tr>
                  {cat.features.map((feat, fIdx) => (
                    <tr key={fIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{feat.name}</td>
                      <td className="p-4 text-center text-slate-600 dark:text-slate-400">
                        {typeof feat.basic === 'boolean' ? (
                          feat.basic ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                        ) : (
                          feat.basic
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900 dark:text-white bg-emerald-50/30 dark:bg-emerald-950/10">
                        {typeof feat.pro === 'boolean' ? (
                          feat.pro ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                        ) : (
                          feat.pro
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                        {typeof feat.enterprise === 'boolean' ? (
                          feat.enterprise ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <X className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600" />
                        ) : (
                          feat.enterprise
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">7-Day Money-Back Guarantee</h4>
            <p className="text-[11px] text-slate-500">100% full refund if you are not satisfied.</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <Lock className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">256-Bit Encrypted Payments</h4>
            <p className="text-[11px] text-slate-500">Easypaisa, JazzCash & Bank security guaranteed.</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <Users className="w-8 h-8 text-purple-500 shrink-0" />
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">15,000+ Students Guided</h4>
            <p className="text-[11px] text-slate-500">Admitted to top NUST, FAST, LUMS & GIKI programs.</p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
            Have questions about billing, payment methods, or feature activation?
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-6"
          >
            {paymentSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Successful!</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Congratulations! Your account has been upgraded to <strong>{selectedPlanForModal.name}</strong>.
                  All premium AI features and live mentor bookings are now unlocked.
                </p>
                <button
                  onClick={() => {
                    setSelectedPlanForModal(null);
                    if (onNavigate) onNavigate('dashboard');
                  }}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-md transition-all"
                >
                  Return to Dashboard & Start Exploring
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Complete Checkout</h2>
                    <p className="text-xs text-slate-500">Upgrading to {selectedPlanForModal.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPlanForModal(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Plan Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-extrabold">{selectedPlanForModal.name} ({billingCycle.toUpperCase()})</strong>
                    <span className="text-slate-500">Instant Access to All AI Tools & Mentor Calls</span>
                  </div>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                    {billingCycle === 'monthly' ? selectedPlanForModal.priceMonthly : selectedPlanForModal.priceAnnually}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Pakistani Payment Method:</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {paymentMethods.map((m) => {
                      const Icon = m.icon;
                      const provider = providerById[m.id];
                      const isAvailable = Boolean(provider?.enabled);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={!isAvailable}
                          title={provider?.reason ?? 'This payment method is not available.'}
                          onClick={() => isAvailable && setPaymentMethod(m.id)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                            !isAvailable
                              ? 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                              : paymentMethod === m.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span className="min-w-0 text-left">
                            <span className="block truncate">{m.label}</span>
                            {!isAvailable && <span className="block text-[9px] font-medium">{paymentProvidersLoading ? 'Checking…' : 'Unavailable'}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/35 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-300 mt-0.5" />
                    <span>NexStep never collects your card number, wallet PIN, or CNIC here. A configured payment provider opens its own secure checkout.</span>
                  </div>

                  {!paymentProvidersLoading && !paymentMethods.some((method) => providerById[method.id]?.enabled) && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">Online payments are not configured yet. Please contact support for access options.</p>
                  )}

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[11px] text-red-800 dark:text-red-300 whitespace-pre-wrap">
                      <div className="flex items-center gap-2 font-bold mb-1"><AlertCircle className="w-4 h-4 shrink-0" /> Payment Error</div>
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || !selectedProvider?.enabled}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Verifying Payment...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Pay {billingCycle === 'monthly' ? selectedPlanForModal.priceMonthly : selectedPlanForModal.priceAnnually} & Activate</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
