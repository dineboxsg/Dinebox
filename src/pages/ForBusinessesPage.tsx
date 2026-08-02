import { ArrowRight, Store, Edit3, TrendingUp } from 'lucide-react';
import { navigate } from '@/lib/router';

export function ForBusinessesPage() {
  const steps = [
    { icon: Store, title: 'Create your DineBox', desc: 'Set up your restaurant profile in minutes. Add your logo, photos, and details.' },
    { icon: Edit3, title: 'Post what\'s happening', desc: 'Publish deals, new menus, events, and updates. Keep your customers in the loop.' },
    { icon: TrendingUp, title: 'Get discovered', desc: 'Customers across Singapore discover you. Build your DineBox Score and climb the chart.' },
  ];

  return (
    <div className="pt-24 pb-16 animate-fade-in">
      {/* Hero */}
      <section className="container-page py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange-600 text-sm font-medium mb-6">
          For Businesses
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-charcoal mb-4 max-w-3xl mx-auto">
          Give your restaurant a digital home on DineBox
        </h1>
        <p className="text-lg text-muted-text max-w-2xl mx-auto mb-8">
          Publish your deals, menus, events and updates and get discovered by customers across Singapore.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/merchant/signup')} className="btn-orange px-6 py-3">
            Create Your DineBox <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/merchant/login')} className="btn-outline px-6 py-3">
            Merchant Login
          </button>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-cream/40 py-16">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-orange" />
                </div>
                <div className="text-sm text-orange font-semibold mb-2">Step {i + 1}</div>
                <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">{step.title}</h3>
                <p className="text-sm text-muted-text">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-4">Ready to get started?</h2>
        <p className="text-muted-text mb-6">Join Singapore's live F&B discovery platform today.</p>
        <button onClick={() => navigate('/merchant/signup')} className="btn-orange px-8 py-3">
          Create Your DineBox <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
