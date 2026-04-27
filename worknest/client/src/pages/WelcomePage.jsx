import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FileSignature, FileText, Receipt, Sparkles, Users, Clock3, Wand2, Layers3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import BrandLogo from '../components/layout/BrandLogo';
import { loginAsGuest } from '../services/authService';
import toast from 'react-hot-toast';

const featureCards = [
  {
    icon: Users,
    title: 'Client Workspace',
    description: 'Keep clients, contact details, and relationship status organized in one place.',
    tint: 'bg-sky-50 text-sky-700',
  },
  {
    icon: FileText,
    title: 'Proposal Flow',
    description: 'Draft polished proposals, apply templates, and generate branded PDFs faster.',
    tint: 'bg-indigo-50 text-indigo-700',
  },
  {
    icon: FileSignature,
    title: 'Contracts',
    description: 'Move approved work into clear agreements and track progress from draft to signed.',
    tint: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Receipt,
    title: 'Invoices',
    description: 'Create invoices, track outstanding value, and prepare payment follow-ups easily.',
    tint: 'bg-amber-50 text-amber-700',
  },
];

const steps = [
  'Create your workspace and set your company branding once.',
  'Add clients and keep their details ready for every next step.',
  'Generate proposals, contracts, and invoices from one connected flow.',
  "Use WORKNEST's AI for quick drafts, help, and faster communication.",
];

const quickGuide = [
  {
    step: '01',
    title: 'Set your brand once',
    description: 'Add your logo, company details, and PDF colors so every document already feels professional.',
    icon: Layers3,
  },
  {
    step: '02',
    title: 'Run your client flow',
    description: 'Move from client records to proposals, contracts, and invoices without repeating the same work.',
    icon: Clock3,
  },
  {
    step: '03',
    title: "Use WORKNEST's AI",
    description: 'Get quick help, faster drafts, and cleaner wording when you want to move faster with less friction.',
    icon: Wand2,
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    try {
      setGuestLoading(true);
      await loginAsGuest();
      navigate('/dashboard');
    } catch (error) {
      const isProviderDisabled = error?.code === 'auth/operation-not-allowed';
      toast.error(isProviderDisabled
        ? 'Guest login is not enabled in Firebase yet. Enable Anonymous sign-in in Firebase Authentication.'
        : error.message || 'Unable to start guest mode.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo imageClassName="h-12 rounded-2xl" />
          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto">Log In</Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleGuestLogin}
              disabled={guestLoading}
            >
              {guestLoading ? 'Starting...' : 'Try Guest'}
            </Button>
            <Link to="/signup">
              <Button className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="bg-[linear-gradient(135deg,#020617_0%,#0f172a_40%,#1d4ed8_100%)] px-6 py-10 text-white sm:px-8 sm:py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to WorkNest
              </div>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Understand the whole product before you sign in.
              </h2>
              <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
                WorkNest helps freelancers and service businesses manage clients, proposals, contracts, invoices, and AI-assisted drafting from one connected workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Why it feels faster</p>
                  <p className="mt-1 text-sm text-slate-200">One place for clients, pricing, agreements, billing, and AI help.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Best for</p>
                  <p className="mt-1 text-sm text-slate-200">Freelancers, consultants, agencies, and service businesses.</p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button className="bg-white text-slate-950 hover:bg-slate-100">
                    Create Your Workspace
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    I Already Have an Account
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleGuestLogin}
                  disabled={guestLoading}
                >
                  {guestLoading ? 'Starting Guest...' : 'Try Guest Mode'}
                </Button>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Why users log in fast</p>
              <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,#f8fafc,#eef2ff)] p-5 ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-900">You already know what to do when you enter.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  WorkNest is built so new users can quickly understand the value: set branding, add clients, send polished proposals, and manage invoices without building a messy system themselves.
                </p>
              </div>
              <div className="mt-5 space-y-4">
                {steps.map((step) => (
                  <div key={step} className="flex gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="app-slide-up border-slate-200 bg-white/95 shadow-sm">
                <CardContent className="p-5">
                  <div className={`inline-flex rounded-2xl p-3 ${feature.tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Guide</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Three simple things to understand before entering.</h3>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto">
                Log In Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {quickGuide.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.step} className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.step}</span>
                    <div className="rounded-2xl bg-slate-950 p-3 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">What users can do</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">See the full workflow before entering the app.</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Add clients, create proposals, turn approved work into contracts, manage invoices, customize branding, and use WORKNEST&apos;s AI for help, content, and export-ready output.
              </p>
              <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                Faster setup, cleaner workflow, better client-facing output.
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full sm:w-auto">
                  Start With WorkNest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomePage;
