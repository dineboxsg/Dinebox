import { useEffect, useState } from 'react';
import { Search, Shield, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'merchant';
  created_at: string;
};

export function AdminUsers() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('id, email, full_name, role, created_at').order('created_at', { ascending: false });
    setUsers((data || []) as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (user: AdminUser) => {
    if (user.id === session?.user.id) return;
    const nextRole = user.role === 'admin' ? 'merchant' : 'admin';
    setUpdatingId(user.id);
    await supabase.from('users').update({ role: nextRole }).eq('id', user.id);
    await load();
    setUpdatingId(null);
  };

  const visibleUsers = users.filter((user) =>
    `${user.full_name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Users & access</h1>
          <p className="text-sm text-muted-text mt-1">Manage merchant accounts and administrator access.</p>
        </div>
        <span className="badge bg-cream text-muted-text self-start sm:self-auto">{users.length} accounts</span>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email..." className="input-field pl-11" />
      </div>

      {loading ? <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="h-20 rounded-2xl bg-cream animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {visibleUsers.map((user) => {
            const isCurrentUser = user.id === session?.user.id;
            const isAdmin = user.role === 'admin';
            return (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-white border border-beige/40">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-orange/10 text-orange' : 'bg-cream text-muted-text'}`}>
                  {isAdmin ? <Shield className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-charcoal truncate">{user.full_name || 'Unnamed user'}</h2>
                  <p className="text-xs text-muted-text truncate">{user.email} · Joined {new Date(user.created_at).toLocaleDateString('en-SG')}</p>
                </div>
                <span className={`badge capitalize ${isAdmin ? 'bg-orange/10 text-orange-600' : 'bg-cream text-muted-text'}`}>{user.role}</span>
                <button
                  onClick={() => changeRole(user)}
                  disabled={isCurrentUser || updatingId === user.id}
                  className="btn-outline text-xs !py-2 disabled:cursor-not-allowed disabled:opacity-45"
                  title={isCurrentUser ? 'You cannot change your own role' : undefined}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {updatingId === user.id ? 'Saving...' : isAdmin ? 'Remove admin' : 'Make admin'}
                </button>
              </div>
            );
          })}
          {!visibleUsers.length && <div className="rounded-2xl bg-white border border-beige/40 p-8 text-center text-sm text-muted-text">No matching accounts found.</div>}
        </div>
      )}
    </div>
  );
}
