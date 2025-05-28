// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  // Verifica se há um usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  /*
  // Estas linhas impedem o acesso sem login. Estão comentadas para testes.
  if (!usuarioLogado) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'index.html';
    return;
  }
  */

  // Exibe o nome do usuário logado
  const nomeUsuarioElemento = document.getElementById('nome-usuario');
  if (nomeUsuarioElemento && usuarioLogado) {
    nomeUsuarioElemento.textContent = usuarioLogado.nome;
  }

  // Botão de logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = 'index.html';
    });
  }

  // Gerenciamento de postagens
  const formPostagem = document.getElementById('form-postagem');
  const listaPostagens = document.getElementById('lista-postagens');

  // Carrega postagens existentes
  const postagens = JSON.parse(localStorage.getItem('postagens')) || [];
  postagens.forEach((postagem) => {
    adicionarPostagemNaTela(postagem);
  });

  // Evento de envio do formulário de postagem
  if (formPostagem) {
    formPostagem.addEventListener('submit', (e) => {
      e.preventDefault();
      const conteudo = document.getElementById('conteudo-postagem').value.trim();
      if (!conteudo) {
        alert('Por favor, escreva algo para postar.');
        return;
      }

      // Se não estiver logado, bloqueia postagem (opcional)
      if (!usuarioLogado) {
        alert('Você precisa estar logado para postar.');
        return;
      }

      const novaPostagem = {
        id: Date.now(),
        autor: usuarioLogado.nome,
        conteudo,
        data: new Date().toLocaleString(),
      };

      postagens.push(novaPostagem);
      localStorage.setItem('postagens', JSON.stringify(postagens));
      adicionarPostagemNaTela(novaPostagem);
      formPostagem.reset();

      // Notifica outros usuários sobre a nova postagem
      notificarUsuarios(novaPostagem);
    });
  }

  // Função para adicionar uma postagem na tela
  function adicionarPostagemNaTela(postagem) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${postagem.autor}</strong> (${postagem.data}): ${postagem.conteudo}`;
    listaPostagens.appendChild(li);
  }

  // Função para notificar outros usuários
  function notificarUsuarios(postagem) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.forEach((usuario) => {
      if (!usuarioLogado || usuario.email !== usuarioLogado.email) {
        const notificacoes = JSON.parse(localStorage.getItem(`notificacoes_${usuario.email}`)) || [];
        notificacoes.push({
          mensagem: `${postagem.autor} fez uma nova postagem.`,
          data: postagem.data,
        });
        localStorage.setItem(`notificacoes_${usuario.email}`, JSON.stringify(notificacoes));
      }
    });
  }

  // Exibe notificações para o usuário logado
  const listaNotificacoes = document.getElementById('lista-notificacoes');
  if (listaNotificacoes && usuarioLogado) {
    const notificacoes = JSON.parse(localStorage.getItem(`notificacoes_${usuarioLogado.email}`)) || [];
    notificacoes.forEach((notificacao) => {
      const li = document.createElement('li');
      li.textContent = `${notificacao.mensagem} (${notificacao.data})`;
      listaNotificacoes.appendChild(li);
    });

    // Limpa as notificações após exibi-las
    localStorage.removeItem(`notificacoes_${usuarioLogado.email}`);
  }
});
