export default function Settings() {
  const user = JSON.parse(localStorage.getItem('demoshop_user') || 'null');
  return (
    <div>
      <h1>Settings</h1>
      <p className="muted">Demo settings — changes here are not saved to a real store.</p>
      <div className="card">
        <h2>Shop</h2>
        <p><strong>Name:</strong> Demo Shop</p>
        <p><strong>Currency:</strong> USD</p>
        <p><strong>Demo login:</strong> admin@demo.shop / Demo1234</p>
      </div>
      <div className="card">
        <h2>Signed in as</h2>
        <p>{user ? `${user.name} — ${user.email} (${user.role})` : 'Not signed in'}</p>
        <p className="muted small">
          This is a demo project, not a real client order. No real customer data is used.
        </p>
      </div>
    </div>
  );
}
