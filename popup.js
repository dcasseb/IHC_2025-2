/**
 * Função de auditoria de acessibilidade web universal
 * Será injetada e executada no contexto de qualquer página web ativa.
 */
function runAccessibilityAudit() {
  // Debug: força a leitura do DOM atual
  const currentUrl = window.location.href;
  const currentTitle = document.title;
  const currentDomain = window.location.hostname;
  
  const results = {
    errors: [],
    warnings: [],
    successes: [],
    totalCriteria: 7,
    passedCriteria: 7,
    url: currentUrl,
    pageTitle: currentTitle,
    domain: currentDomain,
    timestamp: new Date().toISOString()
  };

  // Log para debug
  console.log('=== ANÁLISE DE ACESSIBILIDADE ===');
  console.log('URL Analisada:', currentUrl);
  console.log('Título:', currentTitle);
  console.log('Timestamp:', results.timestamp);

  // ---
  // Critério 3.1.1: Idioma da Página (WCAG Nível A)
  // ---
  const htmlLang = document.documentElement.lang;
  if (!htmlLang || htmlLang.trim() === '') {
    document.documentElement.dataset.agielErrorId = 'html-no-lang';
    results.errors.push({
      criterion: '3.1.1',
      level: 'A',
      name: 'Idioma da Página',
      message: "A tag <html> não possui um atributo 'lang' válido. Isso dificulta a leitura por leitores de tela.",
      elementId: 'html-no-lang',
      elementType: 'html'
    });
    results.passedCriteria--;
  } else {
    results.successes.push({
      criterion: '3.1.1',
      message: `Idioma da página definido corretamente: "${htmlLang}"`
    });
  }

  // ---
  // Critério 1.1.1: Conteúdo Não Textual - Imagens (WCAG Nível A)
  // ---
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  let imagesWithEmptyAlt = 0;
  let imagesWithGoodAlt = 0;

  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      const src = img.src.length > 60 ? img.src.substring(0, 60) + '...' : img.src;
      // Gerar seletor único para o elemento
      img.dataset.agielErrorId = `img-no-alt-${index}`;
      results.errors.push({
        criterion: '1.1.1',
        level: 'A',
        name: 'Conteúdo Não Textual',
        message: `Imagem ${index + 1} sem atributo 'alt': ${src || 'sem src'}`,
        elementId: `img-no-alt-${index}`,
        elementType: 'img'
      });
      imagesWithoutAlt++;
    } else if (img.alt.trim() === '') {
      imagesWithEmptyAlt++;
    } else {
      imagesWithGoodAlt++;
    }
  });

  if (imagesWithoutAlt > 0) {
    results.passedCriteria--;
  } else if (images.length > 0) {
    results.successes.push({
      criterion: '1.1.1',
      message: `${images.length} imagem(ns) verificada(s) - todas possuem atributo alt`
    });
  }

  // ---
  // Critério 2.1.1: Teclado - Acessibilidade via teclado (WCAG Nível A)
  // ---
  const nonInteractiveClickables = document.querySelectorAll(
    'div[onclick], span[onclick], p[onclick], img[onclick]'
  );

  let keyboardIssues = 0;
  nonInteractiveClickables.forEach((el, index) => {
    const tabIndex = el.getAttribute('tabindex');
    const isFocusable = tabIndex !== null && parseInt(tabIndex, 10) >= 0;
    const role = el.getAttribute('role');

    if (!isFocusable) {
      el.dataset.agielErrorId = `keyboard-${index}`;
      results.errors.push({
        criterion: '2.1.1',
        level: 'A',
        name: 'Teclado',
        message: `Elemento <${el.tagName.toLowerCase()}> com evento onclick não é acessível via teclado (falta tabindex="0")`,
        elementId: `keyboard-${index}`,
        elementType: el.tagName.toLowerCase()
      });
      keyboardIssues++;
    }
  });

  if (keyboardIssues > 0) {
    results.passedCriteria--;
  } else {
    results.successes.push({
      criterion: '2.1.1',
      message: 'Elementos clicáveis verificados estão acessíveis via teclado'
    });
  }

  // ---
  // Critério 1.4.3: Contraste (Mínimo) - Verificação básica (WCAG Nível AA)
  // ---
  const links = document.querySelectorAll('a');
  let linksWithoutVisibleText = 0;

  links.forEach((link, index) => {
    const text = link.textContent.trim();
    const ariaLabel = link.getAttribute('aria-label');
    
    if (!text && !ariaLabel && !link.querySelector('img[alt]')) {
      link.dataset.agielErrorId = `link-no-text-${index}`;
      results.warnings.push({
        criterion: '1.4.3 / 2.4.4',
        level: 'AA / A',
        name: 'Contraste e Propósito do Link',
        message: `Link ${index + 1} sem texto visível ou aria-label: ${link.href || 'sem href'}`,
        elementId: `link-no-text-${index}`,
        elementType: 'a'
      });
      linksWithoutVisibleText++;
    }
  });

  if (linksWithoutVisibleText > 0) {
    results.passedCriteria--;
  } else if (links.length > 0) {
    results.successes.push({
      criterion: '2.4.4',
      message: `${links.length} link(s) verificado(s) - todos possuem texto ou label`
    });
  }

  // ---
  // Critério 2.4.1: Ignorar Blocos (WCAG Nível A)
  // ---
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  const hasSkipToContent = Array.from(skipLinks).some(link => 
    link.textContent.toLowerCase().includes('conteúdo') ||
    link.textContent.toLowerCase().includes('content') ||
    link.textContent.toLowerCase().includes('pular') ||
    link.textContent.toLowerCase().includes('skip')
  );

  if (!hasSkipToContent) {
    const nav = document.querySelector('nav, header, [role="navigation"]');
    if (nav) nav.dataset.agielErrorId = 'skip-link-missing';
    results.warnings.push({
      criterion: '2.4.1',
      level: 'A',
      name: 'Ignorar Blocos',
      message: 'Não foi encontrado um link "pular para conteúdo principal". Isso ajuda usuários de teclado/leitores de tela.',
      elementId: nav ? 'skip-link-missing' : null,
      elementType: nav ? nav.tagName.toLowerCase() : null
    });
  } else {
    results.successes.push({
      criterion: '2.4.1',
      message: 'Link para pular navegação encontrado'
    });
  }

  // ---
  // Critério 1.3.1: Informações e Relações - Estrutura de Cabeçalhos (WCAG Nível A)
  // ---
  const h1s = document.querySelectorAll('h1');
  
  if (h1s.length === 0) {
    document.body.dataset.agielErrorId = 'no-h1';
    results.warnings.push({
      criterion: '1.3.1',
      level: 'A',
      name: 'Informações e Relações',
      message: 'Página sem tag <h1>. Toda página deve ter um cabeçalho principal para estruturação adequada.',
      elementId: 'no-h1',
      elementType: 'body'
    });
  } else if (h1s.length > 1) {
    h1s.forEach((h1, idx) => h1.dataset.agielErrorId = `multiple-h1-${idx}`);
    results.warnings.push({
      criterion: '1.3.1',
      level: 'A',
      name: 'Informações e Relações',
      message: `Página possui ${h1s.length} tags <h1>. Recomenda-se apenas um <h1> por página.`,
      elementId: 'multiple-h1-0',
      elementType: 'h1'
    });
  } else {
    results.successes.push({
      criterion: '1.3.1',
      message: 'Estrutura de cabeçalho H1 adequada'
    });
  }

  // ---
  // Critério 2.4.2: Título da Página (WCAG Nível A)
  // ---
  const pageTitle = document.title;
  
  if (!pageTitle || pageTitle.trim() === '') {
    const titleEl = document.querySelector('title') || document.head;
    if (titleEl) titleEl.dataset.agielErrorId = 'no-title';
    results.errors.push({
      criterion: '2.4.2',
      level: 'A',
      name: 'Título da Página',
      message: 'Página sem título (<title>). O título é essencial para identificação da página.',
      elementId: 'no-title',
      elementType: 'title'
    });
    results.passedCriteria--;
  } else if (pageTitle.length < 10) {
    const titleEl = document.querySelector('title');
    if (titleEl) titleEl.dataset.agielErrorId = 'short-title';
    results.warnings.push({
      criterion: '2.4.2',
      level: 'A',
      name: 'Título da Página',
      message: 'Título da página muito curto. Recomenda-se um título mais descritivo.',
      elementId: 'short-title',
      elementType: 'title'
    });
  } else {
    results.successes.push({
      criterion: '2.4.2',
      message: `Título da página definido: "${pageTitle}"`
    });
  }

  // ---
  // Critério 3.2.4: Identificação Consistente (WCAG Nível AA)
  // Verificação de formulários
  // ---
  const forms = document.querySelectorAll('form');
  let formsWithoutLabels = 0;

  forms.forEach((form) => {
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    
    inputs.forEach((input) => {
      const hasLabel = input.id && form.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledby = input.getAttribute('aria-labelledby');
      const hasPlaceholder = input.getAttribute('placeholder');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        input.dataset.agielErrorId = `form-input-${formsWithoutLabels}`;
        results.warnings.push({
          criterion: '3.3.2',
          level: 'A',
          name: 'Rótulos ou Instruções',
          message: `Campo de formulário (${input.type || input.tagName}) sem rótulo associado. ${hasPlaceholder ? 'Placeholder não substitui label.' : ''}`,
          elementId: `form-input-${formsWithoutLabels}`,
          elementType: input.tagName.toLowerCase()
        });
        formsWithoutLabels++;
      }
    });
  });

  if (formsWithoutLabels === 0 && forms.length > 0) {
    results.successes.push({
      criterion: '3.3.2',
      message: 'Campos de formulário com rótulos adequados'
    });
  }

  // Calcular Score
  results.score = (results.passedCriteria / results.totalCriteria) * 100;
  
  // Estatísticas
  results.stats = {
    totalImages: images.length,
    imagesWithoutAlt: imagesWithoutAlt,
    imagesWithGoodAlt: imagesWithGoodAlt,
    totalLinks: links.length,
    totalForms: forms.length,
    h1Count: h1s.length
  };

  return results;
}

/**
 * Função para destacar elementos com erros na página
 * @param {boolean} show - Se deve mostrar ou esconder os highlights
 */
function highlightAccessibilityErrors(show) {
  // Remove highlights anteriores
  const existingStyle = document.getElementById('agiel-highlight-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Remove overlays anteriores
  const existingOverlays = document.querySelectorAll('.agiel-error-overlay');
  existingOverlays.forEach(overlay => overlay.remove());
  
  // Remove badges anteriores
  const existingBadges = document.querySelectorAll('.agiel-error-badge');
  existingBadges.forEach(badge => badge.remove());

  if (!show) return;

  // Adiciona estilos de highlight
  const style = document.createElement('style');
  style.id = 'agiel-highlight-style';
  style.textContent = `
    [data-agiel-error-id] {
      outline: 3px solid #dc3545 !important;
      outline-offset: 2px !important;
      position: relative !important;
    }
    
    .agiel-error-overlay {
      position: absolute;
      background: rgba(220, 53, 69, 0.15);
      border: 2px dashed #dc3545;
      pointer-events: none;
      z-index: 999999;
      box-sizing: border-box;
    }
    
    .agiel-error-badge {
      position: absolute;
      background: #dc3545;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 3px;
      z-index: 1000000;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      white-space: nowrap;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .agiel-warning-badge {
      background: #ffc107 !important;
      color: #000 !important;
    }
    
    [data-agiel-error-id].agiel-warning-highlight {
      outline-color: #ffc107 !important;
    }
    
    .agiel-error-overlay.agiel-warning-overlay {
      background: rgba(255, 193, 7, 0.15);
      border-color: #ffc107;
    }
  `;
  document.head.appendChild(style);

  // Encontra todos os elementos marcados com erros
  const errorElements = document.querySelectorAll('[data-agiel-error-id]');
  
  errorElements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Cria badge com informação do erro
    const badge = document.createElement('div');
    badge.className = 'agiel-error-badge';
    badge.textContent = `⚠ Erro ${index + 1}`;
    badge.style.top = (rect.top + scrollTop - 20) + 'px';
    badge.style.left = (rect.left + scrollLeft) + 'px';
    
    // Verifica se o elemento está visível
    if (rect.width > 0 && rect.height > 0) {
      document.body.appendChild(badge);
    }
  });
}

/**
 * Função para scrollar até um elemento específico
 * @param {string} elementId - ID do elemento de erro
 */
function scrollToErrorElement(elementId) {
  const element = document.querySelector(`[data-agiel-error-id="${elementId}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Adiciona efeito de pulse temporário
    const originalOutline = element.style.outline;
    element.style.outline = '4px solid #ff0000';
    element.style.outlineOffset = '4px';
    
    // Cria overlay temporário para destacar
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'agiel-pulse-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: ${rect.top - 10}px;
      left: ${rect.left - 10}px;
      width: ${rect.width + 20}px;
      height: ${rect.height + 20}px;
      border: 4px solid #dc3545;
      border-radius: 8px;
      animation: agielPulse 1.5s ease-out;
      pointer-events: none;
      z-index: 1000001;
    `;
    
    // Adiciona keyframes se não existir
    if (!document.getElementById('agiel-pulse-keyframes')) {
      const keyframes = document.createElement('style');
      keyframes.id = 'agiel-pulse-keyframes';
      keyframes.textContent = `
        @keyframes agielPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `;
      document.head.appendChild(keyframes);
    }
    
    document.body.appendChild(overlay);
    
    // Remove após animação
    setTimeout(() => {
      overlay.remove();
      element.style.outline = originalOutline || '';
      element.style.outlineOffset = '';
    }, 1500);
    
    return true;
  }
  return false;
}

/**
 * Função para limpar todos os marcadores de erro
 */
function clearErrorMarkers() {
  // Remove data attributes
  const errorElements = document.querySelectorAll('[data-agiel-error-id]');
  errorElements.forEach(el => {
    delete el.dataset.agielErrorId;
  });
  
  // Remove estilos
  const style = document.getElementById('agiel-highlight-style');
  if (style) style.remove();
  
  // Remove badges
  const badges = document.querySelectorAll('.agiel-error-badge');
  badges.forEach(b => b.remove());
  
  // Remove overlays
  const overlays = document.querySelectorAll('.agiel-error-overlay, .agiel-pulse-overlay');
  overlays.forEach(o => o.remove());
}

/**
 * Função para aplicar contraste na página
 */
function applyContrastMode(mode) {
  // Remove estilos anteriores
  const existingStyle = document.getElementById('agiel-contrast-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  let cssRules = '';

  switch (mode) {
    case 'high':
      cssRules = `
        * {
          background-color: white !important;
          color: black !important;
          border-color: black !important;
        }
        a, a * {
          color: #0000EE !important;
          text-decoration: underline !important;
        }
        a:visited, a:visited * {
          color: #551A8B !important;
        }
        img, video, iframe {
          filter: contrast(1.2) !important;
        }
        input, textarea, select, button {
          background-color: white !important;
          color: black !important;
          border: 2px solid black !important;
        }
      `;
      break;

    case 'dark':
      cssRules = `
        * {
          background-color: #000000 !important;
          color: #FFFFFF !important;
          border-color: #FFFFFF !important;
        }
        a, a * {
          color: #66B2FF !important;
          text-decoration: underline !important;
        }
        a:visited, a:visited * {
          color: #BB86FC !important;
        }
        img, video, iframe {
          filter: brightness(0.8) contrast(1.1) !important;
        }
        input, textarea, select, button {
          background-color: #1a1a1a !important;
          color: #FFFFFF !important;
          border: 2px solid #FFFFFF !important;
        }
      `;
      break;

    case 'yellow':
      cssRules = `
        * {
          background-color: #FFFF00 !important;
          color: #000000 !important;
          border-color: #000000 !important;
        }
        a, a * {
          color: #0000CC !important;
          text-decoration: underline !important;
          font-weight: bold !important;
        }
        a:visited, a:visited * {
          color: #660099 !important;
        }
        img, video, iframe {
          filter: contrast(1.3) !important;
        }
        input, textarea, select, button {
          background-color: #FFFFCC !important;
          color: #000000 !important;
          border: 3px solid #000000 !important;
        }
      `;
      break;

    case 'normal':
    default:
      // Remove todos os estilos personalizados
      return;
  }

  // Cria e injeta o estilo
  const style = document.createElement('style');
  style.id = 'agiel-contrast-style';
  style.textContent = cssRules;
  document.head.appendChild(style);
}

/**
 * Lógica do Popup (Executado no contexto da extensão)
 */
document.addEventListener('DOMContentLoaded', () => {
  const auditButton = document.getElementById('auditButton');
  const scoreEl = document.getElementById('score');
  const summaryEl = document.getElementById('summary');
  const errorListEl = document.getElementById('errorList');

  // Botões de contraste
  const normalContrastBtn = document.getElementById('normalContrast');
  const highContrastBtn = document.getElementById('highContrast');
  const darkModeBtn = document.getElementById('darkMode');
  const yellowBlackBtn = document.getElementById('yellowBlack');

  const contrastButtons = [normalContrastBtn, highContrastBtn, darkModeBtn, yellowBlackBtn];

  // Botões de highlight
  const highlightSection = document.getElementById('highlightSection');
  const toggleHighlightBtn = document.getElementById('toggleHighlight');
  const clearHighlightBtn = document.getElementById('clearHighlight');
  const highlightIcon = document.getElementById('highlightIcon');
  const highlightText = document.getElementById('highlightText');
  
  let isHighlightActive = false;
  let currentAuditData = null;

  // Função para atualizar botão ativo
  function setActiveContrastButton(activeButton) {
    contrastButtons.forEach(btn => btn.classList.remove('active'));
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }

  // Exibe a URL atual da página
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    try {
      const url = new URL(tab.url);
      document.getElementById('urlDisplay').textContent = url.hostname;
    } catch (e) {
      document.getElementById('urlDisplay').textContent = 'Página atual';
    }
  });

  // Carrega o modo de contraste salvo
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const style = document.getElementById('agiel-contrast-style');
          if (!style) return 'normal';
          if (style.textContent.includes('background-color: white !important')) return 'high';
          if (style.textContent.includes('background-color: #000000 !important')) return 'dark';
          if (style.textContent.includes('background-color: #FFFF00 !important')) return 'yellow';
          return 'normal';
        }
      });
      
      const currentMode = result[0].result;
      if (currentMode === 'high') setActiveContrastButton(highContrastBtn);
      else if (currentMode === 'dark') setActiveContrastButton(darkModeBtn);
      else if (currentMode === 'yellow') setActiveContrastButton(yellowBlackBtn);
      else setActiveContrastButton(normalContrastBtn);
    } catch (e) {
      setActiveContrastButton(normalContrastBtn);
    }
  });

  // Event listeners para botões de contraste
  normalContrastBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: applyContrastMode,
      args: ['normal']
    });
    setActiveContrastButton(normalContrastBtn);
  });

  highContrastBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: applyContrastMode,
      args: ['high']
    });
    setActiveContrastButton(highContrastBtn);
  });

  darkModeBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: applyContrastMode,
      args: ['dark']
    });
    setActiveContrastButton(darkModeBtn);
  });

  yellowBlackBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: applyContrastMode,
      args: ['yellow']
    });
    setActiveContrastButton(yellowBlackBtn);
  });

  // Event listener para toggle de highlight
  toggleHighlightBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    isHighlightActive = !isHighlightActive;
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: highlightAccessibilityErrors,
      args: [isHighlightActive]
    });
    
    if (isHighlightActive) {
      toggleHighlightBtn.classList.add('active');
      highlightIcon.textContent = '✅';
      highlightText.textContent = 'Marcações Ativas';
    } else {
      toggleHighlightBtn.classList.remove('active');
      highlightIcon.textContent = '📍';
      highlightText.textContent = 'Marcar Erros na Página';
    }
  });

  // Event listener para limpar highlights
  clearHighlightBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: clearErrorMarkers
    });
    
    isHighlightActive = false;
    toggleHighlightBtn.classList.remove('active');
    highlightIcon.textContent = '📍';
    highlightText.textContent = 'Marcar Erros na Página';
  });

  // Função para criar item de erro clicável
  async function createClickableErrorItem(error, isWarning = false) {
    const li = document.createElement('li');
    
    if (isWarning) {
      li.style.borderLeftColor = '#ffc107';
      li.style.background = '#fff3cd';
      li.style.color = '#856404';
    }
    
    li.innerHTML = `<strong>[${error.criterion} - Nível ${error.level}]</strong> ${error.name}<br>${error.message}`;
    
    // Se o erro tiver um elemento associado, torna clicável
    if (error.elementId) {
      li.classList.add('clickable');
      li.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: scrollToErrorElement,
          args: [error.elementId]
        });
      });
    }
    
    return li;
  }

  auditButton.addEventListener('click', async () => {
    // Limpa resultados anteriores
    scoreEl.innerHTML = '<div class="loading"><div class="spinner"></div>Analisando página...</div>';
    summaryEl.innerHTML = '';
    errorListEl.innerHTML = '';
    
    // Esconde seção de highlight até ter resultados
    highlightSection.style.display = 'none';
    isHighlightActive = false;

    // Pega a aba ativa
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Executa a função de auditoria na página
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: runAccessibilityAudit,
      });

      const auditData = results[0].result;

      // Exibe o Score
      let scoreClass = 'score-error';
      let emoji = '❌';
      if (auditData.score === 100) {
        scoreClass = 'score-excellent';
        emoji = '✅';
      } else if (auditData.score >= 70) {
        scoreClass = 'score-warning';
        emoji = '⚠️';
      }

      scoreEl.innerHTML = `<div class="${scoreClass}">${emoji} Score: ${auditData.score.toFixed(0)}%<br>
        <span style="font-size: 0.7em;">${auditData.passedCriteria}/${auditData.totalCriteria} critérios aprovados</span>
      </div>`;

      // Exibe o Sumário
      const stats = auditData.stats;
      summaryEl.innerHTML = `
        <div class="summary">
          <strong>📊 Resumo da Análise:</strong><br>
          <div style="font-size: 11px; color: #666; margin: 5px 0; word-break: break-all;">
            <strong>URL:</strong> ${auditData.url}<br>
            <strong>Título:</strong> ${auditData.pageTitle || 'Sem título'}
          </div>
          • ${stats.totalImages} imagens encontradas<br>
          • ${stats.totalLinks} links verificados<br>
          • ${stats.totalForms} formulário(s) na página<br>
          • ${auditData.errors.length} erro(s) crítico(s)<br>
          • ${auditData.warnings.length} aviso(s)
        </div>
      `;

      // Exibe os Erros e Avisos
      errorListEl.innerHTML = '';
      
      // Armazena dados da auditoria para uso posterior
      currentAuditData = auditData;
      
      // Mostra seção de highlight se houver erros ou avisos
      if (auditData.errors.length > 0 || auditData.warnings.length > 0) {
        highlightSection.style.display = 'flex';
        toggleHighlightBtn.classList.remove('active');
        highlightIcon.textContent = '📍';
        highlightText.textContent = 'Marcar Erros na Página';
      }

      // Sucessos primeiro (se houver)
      if (auditData.successes.length > 0 && auditData.errors.length === 0 && auditData.warnings.length === 0) {
        auditData.successes.forEach((success) => {
          const li = document.createElement('li');
          li.className = 'success';
          li.textContent = `✓ ${success.message}`;
          errorListEl.appendChild(li);
        });
      }

      // Erros críticos
      if (auditData.errors.length > 0) {
        const errorHeader = document.createElement('li');
        errorHeader.style.background = '#721c24';
        errorHeader.style.color = 'white';
        errorHeader.style.fontWeight = 'bold';
        errorHeader.style.borderLeft = 'none';
        errorHeader.textContent = `🚨 ERROS CRÍTICOS (${auditData.errors.length})`;
        errorListEl.appendChild(errorHeader);

        for (const error of auditData.errors) {
          const li = await createClickableErrorItem(error, false);
          errorListEl.appendChild(li);
        }
      }

      // Avisos
      if (auditData.warnings.length > 0) {
        const warningHeader = document.createElement('li');
        warningHeader.style.background = '#856404';
        warningHeader.style.color = 'white';
        warningHeader.style.fontWeight = 'bold';
        warningHeader.style.borderLeft = 'none';
        warningHeader.textContent = `⚠️ AVISOS (${auditData.warnings.length})`;
        errorListEl.appendChild(warningHeader);

        for (const warning of auditData.warnings) {
          const li = await createClickableErrorItem(warning, true);
          errorListEl.appendChild(li);
        }
      }

      // Mensagem de sucesso total
      if (auditData.errors.length === 0 && auditData.warnings.length === 0) {
        const successMsg = document.createElement('li');
        successMsg.className = 'success';
        successMsg.style.fontSize = '14px';
        successMsg.style.textAlign = 'center';
        successMsg.textContent = '🎉 Parabéns! Nenhum problema de acessibilidade detectado!';
        errorListEl.appendChild(successMsg);
      }

    } catch (e) {
      console.error(e);
      scoreEl.innerHTML = '<div class="score-error">❌ Erro ao auditar a página</div>';
      errorListEl.innerHTML = `<li>⚠️ Verifique se a página não é restrita (ex: chrome://, chrome-extension://) ou recarregue-a e tente novamente.<br><br><small>Erro: ${e.message}</small></li>`;
    }
  });
});
