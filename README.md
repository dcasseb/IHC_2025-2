# 🔍 Auditor de Acessibilidade Agiel

Extensão Chrome personalizada para auditoria de acessibilidade do website **www.agiel.com.br**, baseada nas Diretrizes de Acessibilidade para Conteúdo Web (WCAG).

## 📋 Sobre o Projeto

Esta extensão foi desenvolvida especificamente para analisar e auditar a acessibilidade do website da Agiel - Agência de Estágios. A ferramenta verifica 7 critérios importantes da WCAG e fornece um relatório detalhado com erros críticos, avisos e sucessos.

## ✨ Diferenciais desta Extensão

### Personalização para Agiel
- Interface visual moderna com gradiente roxo personalizado
- Detecção automática se está no site da Agiel
- Estatísticas específicas (imagens, links, formulários)
- Relatórios detalhados com emojis e cores intuitivas

### Critérios Avaliados

#### Erros Críticos (Nível A - Obrigatórios)
1. **3.1.1 - Idioma da Página**: Verifica se a tag `<html>` possui atributo `lang`
2. **1.1.1 - Conteúdo Não Textual**: Analisa se todas as imagens possuem atributo `alt`
3. **2.1.1 - Teclado**: Verifica se elementos clicáveis são acessíveis via teclado
4. **2.4.2 - Título da Página**: Confirma existência de um `<title>` descritivo

#### Avisos (Níveis A e AA - Importantes)
5. **2.4.1 - Ignorar Blocos**: Busca links para "pular para conteúdo"
6. **1.3.1 - Estrutura de Cabeçalhos**: Verifica uso adequado de tags `<h1>`
7. **3.3.2 - Rótulos de Formulários**: Analisa se campos possuem labels associados

## 🚀 Como Instalar e Usar

### Instalação

1. Faça o download ou clone esta pasta em seu computador
2. Abra o Google Chrome e acesse: `chrome://extensions/`
3. Ative o **"Modo de desenvolvedor"** (toggle no canto superior direito)
4. Clique em **"Carregar sem compactação"**
5. Selecione a pasta `agiel_accessibility_plugin`
6. A extensão aparecerá na barra de ferramentas do Chrome

### Uso

1. Navegue até **https://www.agiel.com.br/site/**
2. Clique no ícone da extensão na barra de ferramentas
3. Clique no botão **"🚀 Analisar Página Atual"**
4. Aguarde alguns segundos para o relatório completo

### Interpretando os Resultados

- **Score 100% (Verde) ✅**: Excelente! Todos os critérios foram atendidos
- **Score 70-99% (Amarelo) ⚠️**: Atenção! Alguns avisos foram encontrados
- **Score <70% (Vermelho) ❌**: Crítico! Existem erros de acessibilidade

## 📊 Funcionalidades Avançadas

### Relatório Detalhado
- **Erros Críticos**: Problemas que impedem a acessibilidade (vermelho)
- **Avisos**: Melhorias recomendadas (amarelo)
- **Sucessos**: Critérios aprovados (verde)

### Estatísticas
- Total de imagens na página
- Imagens sem texto alternativo
- Quantidade de links e formulários
- Contagem de cabeçalhos H1

### Interface Moderna
- Design responsivo e intuitivo
- Gradientes e animações suaves
- Categorização clara por cores
- Indicação de nível WCAG (A, AA, AAA)

## 🛠️ Estrutura do Projeto

```
agiel_accessibility_plugin/
├── manifest.json     # Configuração da extensão (Manifest V3)
├── popup.html        # Interface visual moderna
├── popup.js          # Lógica de auditoria e análise
├── icon.png          # Ícone da extensão (128x128)
└── README.md         # Esta documentação
```

## 🔧 Tecnologias Utilizadas

- **Manifest V3**: Última versão da API de extensões Chrome
- **HTML5 & CSS3**: Interface responsiva com gradientes
- **JavaScript ES6+**: Análise dinâmica do DOM
- **Chrome Extensions API**: `chrome.tabs` e `chrome.scripting`

## 📚 Referências WCAG

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)

## 🎯 Site Alvo

**Agiel - Agência de Estágios**
- URL: https://www.agiel.com.br/site/
- Serviço: Contratação e gestão de estagiários
- Público: Empresas, instituições de ensino e estudantes

## ⚠️ Observações

- A extensão pode ser usada em qualquer site, mas foi otimizada para Agiel
- Alguns critérios WCAG requerem análise manual complementar
- Esta é uma ferramenta de diagnóstico, não garante conformidade total
- Recomenda-se teste com usuários reais e leitores de tela

## 🎓 Projeto Acadêmico

Desenvolvido para a disciplina de **Interação Humano-Computador (IHC)** da **Universidade de Brasília (UnB)**.

## 📝 Licença

Projeto educacional de código aberto. Livre para uso e modificação.

---

**Desenvolvido com ❤️ para promover acessibilidade web**
