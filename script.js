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
