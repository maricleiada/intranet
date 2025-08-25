// services/api.js - faz requests autenticados para o backend
import Auth from '../auth.js';

const API_URL = 'http://localhost:3000';

async function request(resource, method = 'GET', data = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers.Authorization = `Bearer ${Auth.getToken()}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${API_URL}/${resource}`, options);

  if (!res.ok && res.status === 401) {
    Auth.signout();
    throw new Error('Não autorizado');
  }

  return method !== 'DELETE' ? await res.json() : res.ok;
}

async function create(resource, data, auth = true) {
  return request(resource, 'POST', data, auth);
}

async function read(resource, auth = true) {
  return request(resource, 'GET', null, auth);
}

async function update(resource, data, auth = true) {
  return request(resource, 'PUT', data, auth);
}

async function remove(resource, auth = true) {
  return request(resource, 'DELETE', null, auth);
}

export default { create, read, update, remove };
