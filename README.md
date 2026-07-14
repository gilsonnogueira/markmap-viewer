# 🧠 Markmap Viewer

Visualizador de mapas mentais **Markmap** para estudo do TJCE.

Cole seu código Markdown/Markmap, veja o mapa renderizado em tempo real e exporte em SVG, PNG ou HTML standalone.

**🔗 Acesso:** https://gilsonnogueira.github.io/markmap-viewer

---

## ✨ Funcionalidades

| Funcionalidade | Detalhes |
|---|---|
| **Editor** | Área de código com suporte a Tab, atalho `Ctrl+Enter` |
| **Renderizador** | Markmap completo: frontmatter YAML, spans HTML, callouts, tabelas, emojis |
| **Exportar SVG** | Download vetorial do mapa renderizado |
| **Exportar PNG** | Imagem em alta resolução (2×) |
| **Exportar HTML** | Arquivo standalone que funciona offline |
| **Zoom / Fit** | Botões + scroll do mouse |
| **Expandir / Recolher** | Controle total dos nós |
| **Resize** | Arraste o divisor para ajustar o painel |

## 🗂 Padrão TJCE

O template padrão segue a arquitetura do projeto:

```yaml
---
markmap:
  initialExpandLevel: 2
  maxWidth: 400
  spacingHorizontal: 100
  spacingVertical: 32
---
```

Hierarquia obrigatória:
- **Raiz:** `# <span style="font-size: 1.8em;">**Disciplina** <br> Assunto</span>`
- **Nível 1:** `- <span style="font-size: 1.3em;">**Tópico**</span> <!-- fold -->`
- **Nível 2:** `- <span style="font-size: 1.1em;">**Subtópico**</span>`
- **Nível 3+:** listas markdown puras

## ⚡ Uso local

Basta abrir `index.html` no browser — sem build, sem servidor, zero dependências locais.

## 🚀 Deploy

GitHub Pages aponta para a branch `main`, pasta raiz.
