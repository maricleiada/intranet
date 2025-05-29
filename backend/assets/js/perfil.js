document.addEventListener('DOMContentLoaded', () => {
  // Verifica se há um usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
  if (!usuarioLogado) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'index.html';
    return;
  }

  // Exibe as informações do usuário
  document.getElementById('nome-usuario').textContent = usuarioLogado.nome;
  document.getElementById('email-usuario').textContent = usuarioLogado.email;
  document.getElementById('cargo-usuario').textContent = usuarioLogado.cargo;
  document.getElementById('bio-usuario').textContent = usuarioLogado.bio;
  document.getElementById('foto-perfil').src = usuarioLogado.foto || 'assets/img/avatar_padrao.png';

  // Função para editar o perfil
  document.getElementById('btn-editar').addEventListener('click', () => {
    const novoNome = prompt('Digite seu novo nome:', usuarioLogado.nome);
    if (novoNome) {
      usuarioLogado.nome = novoNome;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      document.getElementById('nome-usuario').textContent = novoNome;
    }
  });

  // Função para logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
  });
});
