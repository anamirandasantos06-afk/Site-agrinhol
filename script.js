/* ============================================================
   AGROFUTURO 2026 — script.js
   Funcionalidades:
   - Partículas animadas no Hero
   - Menu mobile (burger)
   - Accordion (seção intro benefícios)
   - Cards expansíveis (benefícios)
   - Formulário de inscrição com validação
   - Sistema de comentários dinâmicos
   - Painel de acessibilidade
     • Aumentar / diminuir fonte
     • Modo escuro / claro
     • Leitura por voz (SpeechSynthesis API)
     • Parar leitura
============================================================ */

'use strict';

/* ─────────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────────── */

/**
 * Seleciona um elemento do DOM.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {Element|null}
 */
const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Seleciona todos os elementos do DOM.
 * @param {string} selector
 * @param {Element} [context=document]
 * @returns {NodeList}
 */
const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Formata a hora atual no padrão HH:MM.
 * @returns {string}
 */
const timeNow = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/* ─────────────────────────────────────────────
   1. PARTÍCULAS DO HERO
───────────────────────────────────────────── */

(function initParticles() {
  const container = $('#heroParticles');
  if (!container) return;

  const COLORS = [
    'rgba(30,144,255,0.55)',
    'rgba(46,204,113,0.45)',
    'rgba(201,150,43,0.40)',
    'rgba(248,250,252,0.20)',
  ];
  const COUNT = 22;

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('span');
    el.classList.add('particle');
    const size   = Math.random() * 8 + 3;           // 3–11px
    const left   = Math.random() * 100;              // % horizontal
    const delay  = Math.random() * 12;               // segundos de delay
    const dur    = Math.random() * 14 + 10;          // 10–24s de duração
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)];

    Object.assign(el.style, {
      width:           `${size}px`,
      height:          `${size}px`,
      left:            `${left}%`,
      bottom:          '-20px',
      background:      color,
      animationDelay:  `${delay}s`,
      animationDuration:`${dur}s`,
    });

    container.appendChild(el);
  }
})();

/* ─────────────────────────────────────────────
   2. MENU MOBILE (BURGER)
───────────────────────────────────────────── */

(function initMobileMenu() {
  const burger = $('#navBurger');
  const nav    = $('.main-nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    // Evita scroll do body quando menu aberto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha ao clicar em um link do menu
  $$('a', nav).forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Fecha ao pressionar ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    }
  });
})();

/* ─────────────────────────────────────────────
   3. ACCORDIONS GENÉRICOS
   (funciona para qualquer .accordion na página)
───────────────────────────────────────────── */

(function initAccordions() {
  $$('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const bodyId   = trigger.getAttribute('aria-controls');
      const body     = bodyId ? document.getElementById(bodyId) : null;

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) {
        body.hidden = expanded;
      }
    });
  });
})();

/* ─────────────────────────────────────────────
   4. CARDS EXPANSÍVEIS DE BENEFÍCIOS
───────────────────────────────────────────── */

(function initBenefitCards() {
  $$('.benefit-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.benefit-card');
      const extra = card ? $('.benefit-extra', card) : null;
      if (!extra) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      extra.hidden = isExpanded;
      btn.innerHTML = isExpanded
        ? `Ver mais <span aria-hidden="true">+</span>`
        : `Ver menos <span aria-hidden="true">−</span>`;
    });
  });
})();

/* ─────────────────────────────────────────────
   5. FORMULÁRIO DE INSCRIÇÃO
───────────────────────────────────────────── */

(function initInscricaoForm() {
  const form   = $('#inscricaoForm');
  const msgEl  = $('#formMsg');
  if (!form || !msgEl) return;

  /**
   * Exibe uma mensagem de feedback no formulário.
   * @param {string} text
   * @param {'success'|'error'} type
   */
  function showMsg(text, type) {
    msgEl.textContent = text;
    msgEl.className = `form-msg ${type}`;
    setTimeout(() => {
      msgEl.textContent = '';
      msgEl.className = 'form-msg';
    }, 5000);
  }

  /**
   * Validação simples de e-mail.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nome   = $('#nome',   form).value.trim();
    const email  = $('#email',  form).value.trim();
    const cidade = $('#cidade', form).value.trim();

    // Validações
    if (!nome) {
      showMsg('Por favor, informe seu nome completo.', 'error');
      $('#nome', form).focus();
      return;
    }
    if (!isValidEmail(email)) {
      showMsg('Informe um e-mail válido.', 'error');
      $('#email', form).focus();
      return;
    }
    if (!cidade) {
      showMsg('Por favor, informe sua cidade.', 'error');
      $('#cidade', form).focus();
      return;
    }

    // Feedback de sucesso (simulação — sem backend)
    const btn = $('#btnInscrever');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Inscrevendo…';

    setTimeout(() => {
      showMsg(`✓ Inscrição realizada com sucesso! Até breve, ${nome}.`, 'success');
      form.reset();
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Inscrever-me Agora';
    }, 1200);
  });
})();

/* ─────────────────────────────────────────────
   6. SISTEMA DE COMENTÁRIOS
───────────────────────────────────────────── */

(function initComments() {
  const btnComment    = $('#btnComment');
  const authorInput   = $('#commentAuthor');
  const textInput     = $('#commentText');
  const commentsList  = $('#commentsList');
  if (!btnComment || !authorInput || !textInput || !commentsList) return;

  /**
   * Cria e insere um novo item de comentário na lista.
   * @param {string} author
   * @param {string} text
   */
  function addComment(author, text) {
    const item = document.createElement('div');
    item.classList.add('comment-item');
    item.setAttribute('role', 'article');
    item.setAttribute('aria-label', `Comentário de ${author}`);

    item.innerHTML = `
      <p class="comment-author" aria-label="Autor">${escapeHtml(author)}</p>
      <p class="comment-text">${escapeHtml(text)}</p>
      <time class="comment-time" datetime="${new Date().toISOString()}" aria-label="Horário">Hoje às ${timeNow()}</time>
    `;

    commentsList.prepend(item);
  }

  /**
   * Sanitiza texto para evitar XSS.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  btnComment.addEventListener('click', () => {
    const author = authorInput.value.trim() || 'Leitor Anônimo';
    const text   = textInput.value.trim();

    if (!text) {
      textInput.focus();
      textInput.style.borderColor = '#E74C3C';
      setTimeout(() => { textInput.style.borderColor = ''; }, 2000);
      return;
    }

    addComment(author, text);
    authorInput.value = '';
    textInput.value   = '';
    textInput.focus();
  });

  // Permite enviar com Ctrl+Enter na textarea
  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      btnComment.click();
    }
  });
})();

/* ─────────────────────────────────────────────
   7. PAINEL DE ACESSIBILIDADE
───────────────────────────────────────────── */

(function initA11yPanel() {
  const toggle     = $('#a11yToggle');
  const options    = $('#a11yOptions');
  const btnFontUp  = $('#btnFontUp');
  const btnFontDn  = $('#btnFontDown');
  const btnTheme   = $('#btnTheme');
  const btnRead    = $('#btnRead');
  const btnStop    = $('#btnStop');

  if (!toggle || !options) return;

  // ── Toggle do painel ──
  toggle.addEventListener('click', () => {
    const isOpen = !options.hidden;
    options.hidden = isOpen;
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // Fecha ao clicar fora
  document.addEventListener('click', e => {
    if (!$('#a11yPanel').contains(e.target)) {
      options.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ── Tamanho de fonte ──
  let fontScale = 100; // percentual base
  const FONT_STEP = 10;
  const FONT_MIN  = 70;
  const FONT_MAX  = 150;

  function applyFontScale(scale) {
    document.documentElement.style.fontSize = `${scale}%`;
    fontScale = scale;
  }

  btnFontUp && btnFontUp.addEventListener('click', () => {
    applyFontScale(Math.min(fontScale + FONT_STEP, FONT_MAX));
  });

  btnFontDn && btnFontDn.addEventListener('click', () => {
    applyFontScale(Math.max(fontScale - FONT_STEP, FONT_MIN));
  });

  // ── Modo escuro / claro ──
  // Persiste a preferência na sessão
  const savedTheme = sessionStorage.getItem('agrofuturo-theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');

  btnTheme && btnTheme.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    sessionStorage.setItem('agrofuturo-theme', isDark ? 'dark' : 'light');
  });

  // ── Leitura por voz (SpeechSynthesis API) ──
  const synth = window.speechSynthesis;

  /**
   * Coleta o texto do conteúdo principal da página.
   * Filtra elementos de cabeçalho, rodapé e painel de acessibilidade.
   * @returns {string}
   */
  function getMainText() {
    const main = $('#mainContent');
    if (!main) return '';
    // Clona para não modificar o DOM original
    const clone = main.cloneNode(true);
    // Remove elementos interativos/decorativos
    $$('[aria-hidden="true"], .benefit-number, script, style', clone)
      .forEach(el => el.remove());
    return clone.innerText
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  btnRead && btnRead.addEventListener('click', () => {
    if (!synth) {
      alert('Seu navegador não suporta leitura por voz.');
      return;
    }
    // Para qualquer leitura em andamento
    synth.cancel();

    const text = getMainText();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'pt-BR';
    utterance.rate  = 0.92;
    utterance.pitch = 1.0;
    utterance.volume= 1.0;

    // Tenta usar voz em português, se disponível
    const voices = synth.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith('pt'));
    if (ptVoice) utterance.voice = ptVoice;

    synth.speak(utterance);
  });

  // As vozes podem carregar de forma assíncrona
  if (synth) {
    synth.addEventListener('voiceschanged', () => { /* vozes disponíveis */ });
  }

  btnStop && btnStop.addEventListener('click', () => {
    synth && synth.cancel();
  });

})();

/* ─────────────────────────────────────────────
   8. ANIMAÇÃO DE ENTRADA POR SCROLL
   (IntersectionObserver — sem bibliotecas)
───────────────────────────────────────────── */

(function initScrollReveal() {
  // Verifica suporte
  if (!('IntersectionObserver' in window)) return;

  // Adiciona classe base a todos os elementos animáveis
  const targets = $$(
    '.card, .benefit-card, .galeria-item, .quote-block, .stat-item, .accordion'
  );

  targets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Pequeno delay escalonado por índice
        const idx = [...targets].indexOf(entry.target);
        entry.target.style.transitionDelay = `${(idx % 6) * 0.07}s`;
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────
   9. HEADER: EFEITO AO ROLAR
───────────────────────────────────────────── */

(function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Aumenta sombra ao rolar
    if (y > 60) {
      header.style.boxShadow = '0 4px 30px rgba(10,35,66,0.40)';
    } else {
      header.style.boxShadow = '';
    }

    lastY = y;
  }, { passive: true });
})();
