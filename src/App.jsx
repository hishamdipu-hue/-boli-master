import { useEffect, useState } from 'react';
import { Anchor, GitBranch, LogIn, LogOut, RefreshCw, ShieldCheck, Ship, AlertCircle } from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [links, setLinks] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setSession(data?.session ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(event) {
    event.preventDefault();
    if (!supabase) return setError('App setup is incomplete. Add the Supabase environment variables in Vercel.');
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (e) { setError(e.message || 'Could not sign in.'); }
    finally { setBusy(false); }
  }

  async function loadLineage() {
    if (!supabase || !session?.user) return;
    setLoading(true); setError('');
    try {
      const user = session.user;
      const { data, error: queryError } = await supabase
        .from('boli_vessel_links')
        .select('id, child_id, child_email, parent_email, parent_id, status, created_at')
        .or(`child_id.eq.${user.id},parent_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      if (queryError) throw queryError;
      setLinks(Array.isArray(data) ? data : []);
    } catch (e) {
      setLinks([]);
      setError(e.message || 'Unable to load vessel lineage. Check your access and try again.');
    } finally { setLoading(false); }
  }

  useEffect(() => { if (session) loadLineage(); else setLinks([]); }, [session?.user?.id]);

  async function resetPassword() {
    if (!supabase) return setError('App setup is incomplete.');
    if (!email.trim()) return setError('Enter your email first, then choose Reset password.');
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setNotice('If an account exists for that email, a password reset link will be sent.');
    } catch (e) { setError(e.message || 'Could not request a password reset.'); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
    else { setSession(null); setLinks([]); }
  }

  const currentUserId = session?.user?.id;
  const myLinks = links.filter(link => link.child_id === currentUserId || link.parent_id === currentUserId);

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Anchor size={22}/></span><span>BOLI<small>VESSEL LINEAGE</small></span></a>
      {session && <button className="quiet-button" onClick={signOut}><LogOut size={16}/> Sign out</button>}
    </header>
    <section className="hero">
      <div className="eyebrow"><ShieldCheck size={14}/> CULTURAL MEMORY NETWORK</div>
      <h1>Every vessel has<br/><em>a story.</em></h1>
      <p>Connect generations of vessels and preserve the stories that travel between them.</p>
    </section>
    {!supabase && <div className="notice error"><AlertCircle size={18}/><div><strong>Setup needed</strong><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel project settings to connect the app to your existing database.</p></div></div>}
    {!session ? <section className="panel auth-panel">
      <div className="panel-heading"><div className="icon-box"><LogIn size={20}/></div><div><h2>Welcome back</h2><p>Sign in to view your vessel lineage.</p></div></div>
      <form onSubmit={signIn}>
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Your password"/></label>
        <button className="primary-button" type="submit" disabled={busy || !supabase}>{busy ? 'Please wait…' : 'Sign in'}</button>
      </form>
      <button className="text-button" onClick={resetPassword} disabled={busy || !supabase}>Forgot password?</button>
    </section> : <section className="panel">
      <div className="section-head"><div><div className="eyebrow">YOUR NETWORK</div><h2>Vessel lineage</h2><p className="muted">Signed in as {session.user.email}</p></div><button className="icon-button" onClick={loadLineage} disabled={loading} aria-label="Refresh lineage"><RefreshCw size={17} className={loading ? 'spin' : ''}/></button></div>
      {error && <div className="notice error"><AlertCircle size={18}/><span>{error}</span></div>}
      {notice && <div className="notice success">{notice}</div>}
      {loading ? <div className="loading"><span className="spinner"/>Loading your lineage…</div> : myLinks.length === 0 ? <div className="empty-state"><div className="empty-icon"><GitBranch size={25}/></div><h3>Your lineage starts here</h3><p>No vessel links were found for this account yet. When a parent vessel is linked, this page will stay visible and show the link status here.</p></div> : <div className="link-list">{myLinks.map(link => <article className="link-row" key={link.id}><div className="link-symbol"><Ship size={19}/></div><div className="link-info"><strong>{link.child_id === currentUserId ? 'Parent vessel' : 'Child vessel'}</strong><span>{link.child_id === currentUserId ? (link.parent_email || 'Parent email not provided') : (link.child_email || 'Child email not provided')}</span><small>{link.status || 'status unavailable'}</small></div><span className={'status status-' + (link.status || 'unknown')}>{link.status || 'Unknown'}</span></article>)}</div>}
      <div className="footnote"><ShieldCheck size={15}/> Lineage data is loaded securely from your BOLI database.</div>
    </section>}
    {error && !session && <div className="notice error"><AlertCircle size={18}/><span>{error}</span></div>}
    {notice && !session && <div className="notice success">{notice}</div>}
    <footer> BOLI <span>·</span> Preserve the story. Connect the generations.</footer>
  </main>;
}