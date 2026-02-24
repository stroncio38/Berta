// Script principal para interações: carrossel, abas, observer e scroll suave
document.addEventListener('DOMContentLoaded', () => {

  /* ===================== 1. Intersection Observer para animações de entrada ===================== */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Usa 'animated' para todos os elementos .js-scroll
        entry.target.classList.add('animated'); 
        
        // Trata os cards dentro da seção 'features' separadamente para escalonar o delay
        if (entry.target.classList.contains('features')) {
            entry.target.querySelectorAll('.card').forEach((card, index) => {
                // Adiciona um pequeno delay baseado no índice
                card.style.transitionDelay = `${index * 150}ms`;
                card.classList.add('animated');
            });
        }
        
        // Elementos que usam a classe 'visible' (como o CTA dentro de features)
        if (entry.target.classList.contains('cta') || entry.target.classList.contains('produtos-section') || entry.target.classList.contains('manutencao-section')) {
            entry.target.classList.add('visible');
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Observe as seções principais e elementos de animação
  // Adicionei novamente as classes .produtos-section e .manutencao-section para que a classe 'visible' seja aplicada.
  document.querySelectorAll('.js-scroll, .cta, .produtos-section, .manutencao-section').forEach(el => observer.observe(el));


  /* ===================== 2. Lógica do Dropdown (Menu de Produtos) ===================== */
  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(toggle => {
      // Remove event listeners antigos para evitar duplicação em resize
      toggle.removeEventListener('click', handleDropdownClick);
      toggle.addEventListener('click', handleDropdownClick);
    });
  }

  function handleDropdownClick(e) {
      const toggle = this;
      // Apenas em mobile (largura < 768px)
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = toggle.closest('.dropdown');
        
        // Fecha outros dropdowns abertos
        document.querySelectorAll('.dropdown.open').forEach(openDropdown => {
          if (openDropdown !== dropdown) {
            openDropdown.classList.remove('open');
            openDropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
          }
        });
        
        // Alterna o dropdown atual
        dropdown.classList.toggle('open');
        const isExpanded = dropdown.classList.contains('open');
        toggle.setAttribute('aria-expanded', isExpanded);
      } else {
        // Se for desktop, o CSS (hover) deve lidar com isso.
        // O preventDefault não é chamado para que o link funcione como âncora se clicado.
      }
  }
  
  initDropdowns();
  window.addEventListener('resize', initDropdowns);


  /* ===================== 3. Lógica do Carrossel (Ajustada) ===================== */
  function initCarrossel(carrossel) {
    const slidesContainer = carrossel.querySelector('.slides');
    const slides = carrossel.querySelectorAll('.slides img');
    const prevBtn = carrossel.querySelector('.prev');
    const nextBtn = carrossel.querySelector('.next');
    
    carrossel.carrosselState = {
        currentIndex: 0,
        totalSlides: slides.length
    };
    
    // Função acessível
    carrossel.updateCarrossel = function() {
        const { currentIndex } = this.carrosselState;
        const offset = -currentIndex * 100;
        slidesContainer.style.transform = `translateX(${offset}%)`;
    };

    prevBtn.addEventListener('click', () => {
      let { currentIndex, totalSlides } = carrossel.carrosselState;
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      carrossel.carrosselState.currentIndex = currentIndex;
      carrossel.updateCarrossel();
    });

    nextBtn.addEventListener('click', () => {
      let { currentIndex, totalSlides } = carrossel.carrosselState;
      currentIndex = (currentIndex + 1) % totalSlides;
      carrossel.carrosselState.currentIndex = currentIndex;
      carrossel.updateCarrossel();
    });

    carrossel.updateCarrossel();
  }

  document.querySelectorAll('.carrossel').forEach(initCarrossel);
  

  /* ===================== 4. Abas de Produtos (Ajustada) ===================== */
  const abas = document.querySelectorAll('.aba');
  const conteudos = document.querySelectorAll('.produtos-conteudo .conteudo');

  abas.forEach(aba => {
    aba.addEventListener('click', () => {
      abas.forEach(a => a.classList.remove('ativa'));
      conteudos.forEach(c => c.classList.remove('ativo'));

      aba.classList.add('ativa');
      const targetId = aba.dataset.target;
      const conteudoAtivo = document.getElementById(targetId);

      if (conteudoAtivo) {
        conteudoAtivo.classList.add('ativo');

        // Reinicia o carrossel do conteúdo ativo
        const carrossel = conteudoAtivo.querySelector('.carrossel');
        if (carrossel && carrossel.carrosselState) {
            carrossel.carrosselState.currentIndex = 0;
            // Usa a função do carrossel para atualizar a visualização
            carrossel.updateCarrossel(); 
        }
      }
    });
  });

});

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    atualizarBadge(); // Atualiza o número no header
    
    // Se estivermos na página de orçamento, carrega a lista
    if (window.location.pathname.includes('orcamento.html')) {
        renderizarCarrinhoNaTela();
    }
});

// --- LÓGICA DO CARRINHO DE ORÇAMENTO ---

// Executa ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    atualizarBadgeCarrinho();
});

// Função para ler o carrinho salvo
function getCarrinho() {
    return JSON.parse(localStorage.getItem('berta_orcamento')) || [];
}

// Função para atualizar o número vermelho no header
function atualizarBadgeCarrinho() {
    const carrinho = getCarrinho();
    // Tenta pegar o badge tanto pelo ID quanto pela classe, para garantir
    const badges = document.querySelectorAll('.cart-badge, #cart-badge');
    
    badges.forEach(badge => {
        if (badge) {
            badge.innerText = carrinho.length;
            if (carrinho.length > 0) {
                badge.classList.remove('hidden');
                badge.style.display = 'flex'; // Força o display flex caso a classe hidden não seja suficiente
            } else {
                badge.classList.add('hidden');
                badge.style.display = 'none';
            }
        }
    });
}

// Função principal de adicionar ao carrinho
// Agora aceita parâmetros diretos para ser mais robusta
function adicionarAoCarrinho(nomeProduto, modeloProduto, imgProduto) {
    
    // Fallback: Se não receber parâmetros, tenta pegar da variável global currentProduct (modo antigo)
    if (!nomeProduto && typeof currentProduct !== 'undefined' && currentProduct) {
        nomeProduto = currentProduct.name;
        // Tenta pegar o modelo de um select ou usa o primeiro disponível
        const select = document.getElementById('product-select');
        if (select) {
            modeloProduto = select.options[select.selectedIndex].text;
        } else if (currentProduct.models && currentProduct.models.length > 0) {
            modeloProduto = currentProduct.models[0].code;
        } else {
            modeloProduto = "Padrão";
        }
        imgProduto = currentProduct.img;
    }

    // Validação final
    if (!nomeProduto) {
        console.error("Erro: Produto não identificado.");
        alert("Erro ao adicionar produto. Tente recarregar a página.");
        return;
    }

    const novoItem = {
        id: Date.now(), // ID único
        produto: nomeProduto,
        modelo: modeloProduto || "Padrão",
        img: imgProduto || ""
    };

    // Salva no LocalStorage
    const carrinho = getCarrinho();
    carrinho.push(novoItem);
    localStorage.setItem('berta_orcamento', JSON.stringify(carrinho));

    // Atualiza visual e avisa usuário
    atualizarBadgeCarrinho();
    
    // Feedback visual (opcional, pode ser removido se o botão já tiver feedback próprio)
    // alert(`${novoItem.produto} adicionado ao orçamento!`);
    console.log("Item adicionado:", novoItem);
}
// --- CONFIGURAÇÃO E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    atualizarBadgeCarrinho();
    
    // Se estivermos na página de orçamento, renderiza a lista
    if (window.location.pathname.includes('orcamento.html')) {
        renderizarPaginaOrcamento();
    }
});

// --- FUNÇÕES DO CARRINHO (LOCAL STORAGE) ---

function getCarrinho() {
    return JSON.parse(localStorage.getItem('berta_orcamento')) || [];
}

function salvarCarrinho(itens) {
    localStorage.setItem('berta_orcamento', JSON.stringify(itens));
    atualizarBadgeCarrinho();
}

// Adiciona um item ao carrinho
function adicionarAoCarrinho(produto, modelo) {
    const carrinho = getCarrinho();
    
    const novoItem = {
        id: Date.now(), // ID único baseado no tempo
        produto: produto,
        modelo: modelo,
        data: new Date().toLocaleDateString()
    };
    
    carrinho.push(novoItem);
    salvarCarrinho(carrinho);
    
    // Feedback visual (pode ser melhorado com um Toast/Notificação)
    // alert(`"${produto} - ${modelo}" adicionado ao orçamento!`);
    atualizarBadgeCarrinho();
}

// Remove um item específico pelo ID
function removerDoOrcamento(id) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(item => item.id !== id); // Mantém tudo que NÃO for o ID clicado
    salvarCarrinho(carrinho);
    
    // Se estiver na página de orçamento, atualiza a lista visualmente na hora
    if (window.location.pathname.includes('orcamento.html')) {
        renderizarPaginaOrcamento();
    }
}

// Limpa tudo
function limparCarrinho() {
    if(confirm("Tem certeza que deseja limpar toda a lista?")) {
        localStorage.removeItem('berta_orcamento');
        atualizarBadgeCarrinho();
        window.location.reload(); // Recarrega para limpar a tela
    }
}

// Atualiza a bolinha vermelha no header (Badge)
function atualizarBadgeCarrinho() {
    const carrinho = getCarrinho();
    const badges = document.querySelectorAll('.cart-badge'); // Seleciona todos os badges (desktop/mobile)
    
    badges.forEach(badge => {
        badge.innerText = carrinho.length;
        if (carrinho.length > 0) {
            badge.classList.remove('hidden');
            badge.style.display = 'flex';
        } else {
            badge.classList.add('hidden');
            badge.style.display = 'none';
        }
    });
}

// --- LÓGICA DA PÁGINA DE ORÇAMENTO (RENDERIZAÇÃO) ---

function renderizarPaginaOrcamento() {
    const listaVisual = document.getElementById('lista-itens-orcamento');
    const inputOculto = document.getElementById('mensagem-sistema'); // Campo que vai pro email
    const containerVazio = document.getElementById('carrinho-vazio');
    const containerCheio = document.getElementById('carrinho-cheio');
    const formContainer = document.getElementById('area-formulario');

    // Proteção caso os elementos não existam na página
    if (!listaVisual) return; 

    const carrinho = getCarrinho();

    // 1. Cenário: Carrinho Vazio
    if (carrinho.length === 0) {
        if(containerVazio) containerVazio.classList.remove('hidden');
        if(containerCheio) containerCheio.classList.add('hidden');
        if(formContainer) formContainer.classList.add('hidden'); // Esconde o form se não tem produtos
        return;
    }

    // 2. Cenário: Carrinho com Itens
    if(containerVazio) containerVazio.classList.add('hidden');
    if(containerCheio) containerCheio.classList.remove('hidden');
    if(formContainer) formContainer.classList.remove('hidden');

    listaVisual.innerHTML = '';
    let textoParaEmail = "ITENS SOLICITADOS PARA COTAÇÃO:\n================================\n";

    carrinho.forEach((item, index) => {
        // Monta o texto para o e-mail (invisível para o usuário)
        textoParaEmail += `${index + 1}. ${item.produto} (Modelo: ${item.modelo})\n`;

        // Monta o HTML visual (Card do item na lista)
        const li = document.createElement('div');
        li.className = 'flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-red-200 transition mb-3';
        li.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="bg-white p-2 rounded-lg border border-gray-100 text-gray-400">
                    <i class="fas fa-box"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${item.produto}</h4>
                    <p class="text-xs text-gray-500 font-medium">${item.modelo}</p>
                </div>
            </div>
            <button onclick="removerDoOrcamento(${item.id})" class="text-gray-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition" title="Remover este item">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        listaVisual.appendChild(li);
    });

    // Atualiza o campo oculto do formulário
    if(inputOculto) {
        inputOculto.value = textoParaEmail;
    }
}