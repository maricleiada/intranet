document.addEventListener('DOMContentLoaded', () => {
  // ELEMENTOS
  const btnEscrever = document.querySelector('.tweet-button');
  const areaPostagem = document.getElementById('area-postagem');
  const btnPostar = document.getElementById('btn-postar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const textoPostagem = document.getElementById('texto-postagem');
  const inputImagem = document.getElementById('imagem-postagem');
  const listaPostagens = document.getElementById('lista-postagens');
  const btnPesquisar = document.getElementById('btn-pesquisar');
  const campoBusca = document.getElementById('campo-busca');
  const inputBusca = document.getElementById('input-busca');
  const btnLogout = document.getElementById('btn-logout');
  const nomeUsuarioElemento = document.getElementById('nome-usuario');

  // Verifica se usuário está logado
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  // Se não estiver logado, redireciona para login (descomente se quiser)
  /*
  if (!usuarioLogado) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'index.html';
    return;
  }
  */

  // Exibe o nome do usuário logado no cabeçalho
  if (nomeUsuarioElemento && usuarioLogado) {
    nomeUsuarioElemento.textContent = usuarioLogado.nome;
  }

  // Botão logout - remove usuário e volta para login
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('usuarioLogado');
      window.location.href = 'index.html';
    });
  }

  // Mostrar/ocultar área de criação de post
  btnEscrever.addEventListener('click', () => {
    if (areaPostagem.style.display === 'none') {
      areaPostagem.style.display = 'block';
      textoPostagem.focus();
    } else {
      areaPostagem.style.display = 'none';
    }
  });

  // Cancelar criação de post
  btnCancelar.addEventListener('click', () => {
    textoPostagem.value = '';
    inputImagem.value = '';
    areaPostagem.style.display = 'none';
  });

  // Postar nova postagem
  btnPostar.addEventListener('click', () => {
    const texto = textoPostagem.value.trim();

    if (texto === '') {
      alert('Digite algum texto para postar!');
      return;
    }

    const file = inputImagem.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        adicionarPostagem(texto, e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      adicionarPostagem(texto, null);
    }
  });

  // Função para adicionar post no localStorage e no feed visual
  function adicionarPostagem(texto, imagemBase64) {
    const autor = usuarioLogado ? usuarioLogado.nome : 'Anônimo';
    const dataAtual = new Date().toLocaleString();

    const novaPostagem = {
      autor,
      data: dataAtual,
      conteudo: texto,
      imagem: imagemBase64
    };

    const postagens = JSON.parse(localStorage.getItem('postagens')) || [];
    postagens.unshift(novaPostagem);
    localStorage.setItem('postagens', JSON.stringify(postagens));

    inserirPostagemNoFeed(novaPostagem);

    // Limpar campos e esconder área
    textoPostagem.value = '';
    inputImagem.value = '';
    areaPostagem.style.display = 'none';
  }

  // Função para inserir postagem no feed visualmente
  function inserirPostagemNoFeed(postagem) {
    const li = document.createElement('li');

    let html = `<strong>${postagem.autor}</strong> <small>(${postagem.data})</small>:<br />${postagem.conteudo}`;
    if (postagem.imagem) {
      html += `<br /><img src="${postagem.imagem}" alt="Imagem da postagem" style="max-width: 200px; margin-top: 5px;" />`;
    }

    li.innerHTML = html;
    listaPostagens.insertBefore(li, listaPostagens.firstChild);
  }

  // Carrega as postagens salvas no localStorage ao carregar a página
  const postagensSalvas = JSON.parse(localStorage.getItem('postagens')) || [];
  postagensSalvas.forEach(postagem => inserirPostagemNoFeed(postagem));

  // Busca - mostrar/ocultar campo busca
  if (btnPesquisar && campoBusca && inputBusca) {
    btnPesquisar.addEventListener('click', () => {
      campoBusca.style.display = campoBusca.style.display === 'none' ? 'block' : 'none';
      inputBusca.focus();
    });

    // Filtra postagens ao apertar ENTER na busca
    inputBusca.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const termo = inputBusca.value.toLowerCase();
        const postagens = document.querySelectorAll('#lista-postagens li');
        postagens.forEach((li) => {
          const texto = li.textContent.toLowerCase();
          li.style.display = texto.includes(termo) ? '' : 'none';
        });
      }
    });
  }

  // Carrega posts externos de arquivo JSON (posts.json)
  fetch('posts.json')
    .then(response => response.json())
    .then(postsExternos => {
      postsExternos.forEach(post => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${post.username}</strong>: ${post.content}`;
        listaPostagens.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar posts externos:', error);
    });

  // Carrega notificações do usuário e exibe
  const listaNotificacoes = document.getElementById('lista-notificacoes');
  if (listaNotificacoes) {
    const notificacoes = JSON.parse(localStorage.getItem(
      usuarioLogado ? `notificacoes_${usuarioLogado.email}` : 'notificacoes_guest'
    )) || [];

    notificacoes.forEach((notificacao) => {
      const li = document.createElement('li');
      li.textContent = `${notificacao.mensagem} (${notificacao.data})`;
      listaNotificacoes.appendChild(li);
    });

    if (usuarioLogado) {
      localStorage.removeItem(`notificacoes_${usuarioLogado.email}`);
    }
  }
});
