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
    results.errors.push({
      criterion: '3.1.1',
      level: 'A',
      name: 'Idioma da Página',
      message: "A tag <html> não possui um atributo 'lang' válido. Isso dificulta a leitura por leitores de tela."
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
      results.errors.push({
        criterion: '1.1.1',
        level: 'A',
        name: 'Conteúdo Não Textual',
        message: `Imagem ${index + 1} sem atributo 'alt': ${src || 'sem src'}`
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
  nonInteractiveClickables.forEach((el) => {
    const tabIndex = el.getAttribute('tabindex');
    const isFocusable = tabIndex !== null && parseInt(tabIndex, 10) >= 0;
    const role = el.getAttribute('role');

    if (!isFocusable) {
      results.errors.push({
        criterion: '2.1.1',
        level: 'A',
        name: 'Teclado',
        message: `Elemento <${el.tagName.toLowerCase()}> com evento onclick não é acessível via teclado (falta tabindex="0")`
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
      results.warnings.push({
        criterion: '1.4.3 / 2.4.4',
        level: 'AA / A',
        name: 'Contraste e Propósito do Link',
        message: `Link ${index + 1} sem texto visível ou aria-label: ${link.href || 'sem href'}`
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
    results.warnings.push({
      criterion: '2.4.1',
      level: 'A',
      name: 'Ignorar Blocos',
      message: 'Não foi encontrado um link "pular para conteúdo principal". Isso ajuda usuários de teclado/leitores de tela.'
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
    results.warnings.push({
      criterion: '1.3.1',
      level: 'A',
      name: 'Informações e Relações',
      message: 'Página sem tag <h1>. Toda página deve ter um cabeçalho principal para estruturação adequada.'
    });
  } else if (h1s.length > 1) {
    results.warnings.push({
      criterion: '1.3.1',
      level: 'A',
      name: 'Informações e Relações',
      message: `Página possui ${h1s.length} tags <h1>. Recomenda-se apenas um <h1> por página.`
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
    results.errors.push({
      criterion: '2.4.2',
      level: 'A',
      name: 'Título da Página',
      message: 'Página sem título (<title>). O título é essencial para identificação da página.'
    });
    results.passedCriteria--;
  } else if (pageTitle.length < 10) {
    results.warnings.push({
      criterion: '2.4.2',
      level: 'A',
      name: 'Título da Página',
      message: 'Título da página muito curto. Recomenda-se um título mais descritivo.'
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
        results.warnings.push({
          criterion: '3.3.2',
          level: 'A',
          name: 'Rótulos ou Instruções',
          message: `Campo de formulário (${input.type || input.tagName}) sem rótulo associado. ${hasPlaceholder ? 'Placeholder não substitui label.' : ''}`
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

  auditButton.addEventListener('click', async () => {
    // Limpa resultados anteriores
    scoreEl.innerHTML = '<div class="loading"><div class="spinner"></div>Analisando página...</div>';
    summaryEl.innerHTML = '';
    errorListEl.innerHTML = '';

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

        auditData.errors.forEach((error) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>[${error.criterion} - Nível ${error.level}]</strong> ${error.name}<br>${error.message}`;
          errorListEl.appendChild(li);
        });
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

        auditData.warnings.forEach((warning) => {
          const li = document.createElement('li');
          li.style.borderLeftColor = '#ffc107';
          li.style.background = '#fff3cd';
          li.style.color = '#856404';
          li.innerHTML = `<strong>[${warning.criterion} - Nível ${warning.level}]</strong> ${warning.name}<br>${warning.message}`;
          errorListEl.appendChild(li);
        });
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
