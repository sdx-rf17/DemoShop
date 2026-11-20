import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', stock: '', category: '' });
  const [editing, setEditing] = useState(null);

  function load() {
    getProducts().then(setProducts).catch((e) => setError(e.message));
  }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };
      if (editing) await updateProduct(editing, payload);
      else await createProduct(payload);
      setForm({ name: '', price: '', stock: '', category: '' });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    load();
  }

  return (
    <div>
      <h1>Products</h1>
      <p className="muted">Add, edit, or hide products. Demo data only.</p>
      {error && <p className="error">{error}</p>}
      <form className="card form-row" onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <button type="submit">{editing ? 'Save' : 'Add product'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', price: '', stock: '', category: '' }); }}>Cancel</button>}
      </form>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => { setEditing(p.id); setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category }); }}>Edit</button>{' '}
                  <button onClick={() => remove(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
