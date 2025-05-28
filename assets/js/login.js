document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-login');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      console.log('E-mail:', email);
      console.log('Senha:', senha);
      // Aqui você pode adicionar a lógica para autenticar o usuário
    });
  } else {
    console.error('Elemento #form-login não encontrado.');
  }
});
