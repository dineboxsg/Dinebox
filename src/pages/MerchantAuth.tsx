import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import { ArrowLeft, Mail, Lock, User, Store, MapPin, Phone, Utensils } from 'lucide-react';

export function MerchantLoginPage() {
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (session) {
    navigate('/merchant');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/merchant');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center animate-fade-in">
      <div className="container-page max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-text hover:text-charcoal mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to DineBox
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-beige/40 p-8">
          <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">Merchant Login</h1>
          <p className="text-sm text-muted-text mb-6">Sign in to manage your restaurant.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-charcoal mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="input-field pl-11" placeholder="you@restaurant.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="input-field pl-11" placeholder="••••••••" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-muted-text text-center mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/merchant/signup')} className="text-orange-600 font-medium hover:underline">
              Create your DineBox
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function MerchantSignupPage() {
  const { session } = useAuth();
  const [form, setForm] = useState({
    ownerName: '', email: '', password: '', restaurantName: '', cuisine: '', address: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (session) {
    navigate('/merchant');
  }

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.ownerName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: restError } = await supabase.from('restaurants').insert({
        owner_id: data.user.id,
        name: form.restaurantName,
        slug: `${slugify(form.restaurantName)}-${Date.now().toString(36).slice(-4)}`,
        cuisine: form.cuisine,
        address: form.address,
        phone: form.phone,
        status: 'pending',
      });

      if (restError) {
        setError('Account created but restaurant setup failed: ' + restError.message);
      } else {
        setSuccess(true);
      }
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center animate-fade-in">
        <div className="container-page max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange/10 flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-orange" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-3">Your DineBox is being reviewed</h1>
          <p className="text-muted-text mb-6">We'll notify you once your restaurant is approved. You can now sign in to preview your dashboard.</p>
          <button onClick={() => navigate('/merchant/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  const fields = [
    { key: 'ownerName', label: 'Owner Name', icon: User, type: 'text', placeholder: 'John Tan' },
    { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'you@restaurant.com' },
    { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '••••••••' },
    { key: 'restaurantName', label: 'Restaurant Name', icon: Store, type: 'text', placeholder: 'Bella Napoli' },
    { key: 'cuisine', label: 'Cuisine', icon: Utensils, type: 'text', placeholder: 'Italian' },
    { key: 'address', label: 'Address', icon: MapPin, type: 'text', placeholder: '12 Jalan Tenteram, Sembawang' },
    { key: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: '+65 6758 1234' },
  ] as const;

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center animate-fade-in">
      <div className="container-page max-w-lg">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-text hover:text-charcoal mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to DineBox
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-beige/40 p-8">
          <h1 className="font-serif text-2xl font-bold text-charcoal mb-2">Create Your DineBox</h1>
          <p className="text-sm text-muted-text mb-6">Join Singapore's live F&B discovery platform.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-sm font-medium text-charcoal mb-1.5 block">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required
                    className="input-field pl-11"
                    placeholder={f.placeholder}
                  />
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-orange w-full py-3">
              {loading ? 'Creating...' : 'Create Your DineBox'}
            </button>
          </form>

          <p className="text-sm text-muted-text text-center mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate('/merchant/login')} className="text-orange-600 font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
