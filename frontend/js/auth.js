// auth.js
const Auth = {
  signin: (token) => {
    localStorage.setItem('token', token);
    window.location.href = 'home.html';
  },
  signout: () => {
    localStorage.removeItem('token');
    window.location.href = 'signin.html';
  },
  getToken: () => localStorage.getItem('token'),
};

export default Auth;
