import { useEffect, useState } from 'react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [error, setError] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/posts');
      setPosts(await res.json());
    } catch {
      setError('Could not load posts');
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    localStorage.setItem('adminToken', token);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) return setError('Could not publish (wrong admin token or empty fields?)');
    setTitle('');
    setContent('');
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) return setError('Could not delete (wrong admin token?)');
    load();
  };

  const s = {
    wrap: { maxWidth: 700, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' },
    form: { display: 'grid', gap: 8, margin: '16px 0 32px' },
    post: { borderBottom: '1px solid #ddd', padding: '16px 0' },
  };

  return (
    <div style={s.wrap}>
      <h1>My Blog</h1>
      <button onClick={() => setShowAdmin(!showAdmin)}>
        {showAdmin ? 'Hide admin' : 'Admin'}
      </button>

      {showAdmin && (
        <form onSubmit={submit} style={s.form}>
          <input placeholder="Admin token" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Write something..." rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
          <button type="submit">Publish</button>
        </form>
      )}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {posts.map((p) => (
        <article key={p.id} style={s.post}>
          <h2>{p.title}</h2>
          <small>{new Date(p.created_at).toLocaleString()}</small>
          <p style={{ whiteSpace: 'pre-wrap' }}>{p.content}</p>
          {showAdmin && <button onClick={() => remove(p.id)}>Delete</button>}
        </article>
      ))}
      {!posts.length && <p>No posts yet.</p>}
    </div>
  );
}
