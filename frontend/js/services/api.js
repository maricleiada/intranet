import Auth from '../auth.js';

const BASE_URL = 'http://localhost:3000/api/sites';

export default {
  async request(path, options = {}) {
    const token = Auth.getToken();
    options.headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const res = await fetch(`${BASE_URL}/${path}`, options);
    if (!res.ok) {
      const text = await res.text();
      try { throw new Error(JSON.parse(text).error || JSON.parse(text).message); } 
      catch { throw new Error(text); }
    }

    return res.status !== 204 ? res.json() : {};
  },

  async create(path, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text();
      try { return JSON.parse(text); } 
      catch { throw new Error(text); }
    }

    return res.json();
  },

  async update(path, data) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text();
      try { return JSON.parse(text); } 
      catch { throw new Error(text); }
    }

    return res.json();
  },

  async remove(path) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}/${path}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      try { return JSON.parse(text); } 
      catch { throw new Error(text); }
    }

    return res;
  }
};
