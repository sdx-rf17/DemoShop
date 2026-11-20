// Small API helper. The token is stored in localStorage after login.
export function getToken() {
  return localStorage.getItem('demoshop_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('demoshop_token', token);
  else localStorage.removeItem('demoshop_token');
}

export async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

export const login = (email, password) =>
  api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getProducts = () => api('/api/products');
export const createProduct = (p) =>
  api('/api/products', { method: 'POST', body: JSON.stringify(p) });
export const updateProduct = (id, p) =>
  api('/api/products/' + id, { method: 'PUT', body: JSON.stringify(p) });
export const deleteProduct = (id) => api('/api/products/' + id, { method: 'DELETE' });
export const getOrders = () => api('/api/orders');
export const updateOrder = (id, status) =>
  api('/api/orders/' + id, { method: 'PUT', body: JSON.stringify({ status }) });
export const getUsers = () => api('/api/users');
export const getStats = () => api('/api/stats/overview');
