// auth.js - gerencia token e autenticação
function getToken() {
  return localStorage.getItem('@hostMonitor:token');
}

function isAuthenticated() {
  if (!getToken()) {
    window.location.href = '/signin.html';
    return false;
  }
  return true;
}

function signin(token) {
  localStorage.setItem('@hostMonitor:token', token);
  window.location.href = '/home.html';
}

function signout() {
  localStorage.removeItem('@hostMonitor:token');
  window.location.href = '/signin.html';
}

export default { getToken, isAuthenticated, signin, signout };
