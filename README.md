# OmniDeck

🇺🇸 **English** | 🇧🇷 [Português](#-português)

**OmniDeck** is a next-generation markdown presentation engine. Write Deckset/Marp-flavored markdown, get a polished slideshow — no build step, no theme picker required. The long-term vision is an AI agent that reads your local notes (including Obsidian vaults) and drafts decks for you.

This README reflects the **current state** of the codebase, not just the vision.

## What works today

| Capability | Status | Where |
| --- | --- | --- |
| Deckset + Marp markdown parser | ✅ | `src/core/deckset-parser.js` (1500 LOC — directives registry, `#[fit]`, positioned headings, `:::columns/steps/center/math/diagram` blocks, GFM tables, fenced code, speaker notes, frontmatter YAML+Deckset) |
| Autoflow layout inference | ✅ | `src/core/autoflow.js` (9 rules: title, divider, diagonal, z-pattern, alternating, statement, bare-image-position-variation, phrase-bullets, autoscale; cross-slide anti-monotony state) |
| Custom slide engine (OmniDeckSlides) | ✅ | `src/core/slides2.js` — navigation, fragments, backgrounds, resize-aware scaling |
| File loading via drag-drop or file picker | ✅ | drop any `.md` on the window, or click **Open** in the floating toolbar |
| PDF export (in-browser) | ✅ | floating **Export PDF** button or `⌘/Ctrl+E`. Uses html2canvas + pdf-lib via CDN |
| Keyboard navigation | ✅ | `← → PgUp PgDn` / `Space` (Shift+Space back) / `Home End` |
| Theme registry (10 themes, 40+ schemes) | ⚠️ | registered in `src/core/constants.js`, **not yet applied** — see [#14](https://github.com/paulotvlincelia/OmniDeck/issues/14) |
| Layout CSS for parser-emitted classes | ❌ | layouts render but **without styling** — see [#13](https://github.com/paulotvlincelia/OmniDeck/issues/13) |
| Backend / vault scanning / AI agent | 🚧 | FastAPI stub only (`backend/main.py`); no integration yet |

## Setup

```bash
npm install
npm run dev   # vite dev server at http://localhost:5173
```

Drop any `.md` file on the window to load it. The default `public/test.md` loads on startup.

The markdown dialect follows [Deckset](https://www.deckset.com/) conventions (`---` as slide separator, `![right]/![left]/![fit]` modifiers, `#[fit]` headings, `^` speaker notes, `[.directive: value]` for per-slide config, key:value frontmatter at the top). Marp directives are also accepted. Full dialect reference in the closed [RFC 002](https://github.com/paulotvlincelia/OmniDeck/issues/2).

## Architecture (1 paragraph)

A `.md` file goes through `parseDecksetMarkdown()` (optionally pre-processed by `applyAutoflow()` for layout inference), producing concatenated `<section>` HTML. That HTML is injected into `.slides`, and the `OmniDeckSlides` engine handles navigation, fragments, scaling, and background management. PDF export reuses the same DOM via `print-mode.js` (resizes `.reveal` to 1280×720 px) and captures each slide with html2canvas before assembling pages with pdf-lib. The backend (`backend/main.py`) is a stub for future agent/vault integration.

## Roadmap

Active issues live on GitHub. Current priorities:

- **Visual** — [#13 Port layout CSS](https://github.com/paulotvlincelia/OmniDeck/issues/13) (P1, blocks visual usability) · [#14 Theme system wiring](https://github.com/paulotvlincelia/OmniDeck/issues/14)
- **Editor experience** — [#6 Paste-area + error boundary](https://github.com/paulotvlincelia/OmniDeck/issues/6) · [#7 Parser fixtures](https://github.com/paulotvlincelia/OmniDeck/issues/7) · [#5 README/docs](https://github.com/paulotvlincelia/OmniDeck/issues/5)
- **Backend** — gated by [RFC 003](https://github.com/paulotvlincelia/OmniDeck/issues/3): [#8 Local scanner](https://github.com/paulotvlincelia/OmniDeck/issues/8) · [#9 Frontend↔backend integration](https://github.com/paulotvlincelia/OmniDeck/issues/9)
- **Agent** — gated by [RFC 004](https://github.com/paulotvlincelia/OmniDeck/issues/4): [#11 Outline generator](https://github.com/paulotvlincelia/OmniDeck/issues/11) · [#12 Outline→markdown converter](https://github.com/paulotvlincelia/OmniDeck/issues/12)

Open design discussions: [RFC 001](https://github.com/paulotvlincelia/OmniDeck/issues/1) (MVP scope), [RFC 003](https://github.com/paulotvlincelia/OmniDeck/issues/3) (security/permissions), [RFC 004](https://github.com/paulotvlincelia/OmniDeck/issues/4) (agent architecture). [RFC 002](https://github.com/paulotvlincelia/OmniDeck/issues/2) (markdown dialect) is closed as retro-doc.

## Tech stack

- **Frontend**: Vite + vanilla JS, no framework. Parser, autoflow, slide engine all live in `src/core/`.
- **Backend** (planned): Python + FastAPI for local file/vault scanning and LLM orchestration.
- **PDF**: html2canvas + pdf-lib loaded on-demand from CDN — no npm dependency.


---

<h2 id="-português">🇧🇷 Português</h2>

**OmniDeck** é um motor de apresentações markdown de próxima geração. Escreva markdown Deckset/Marp e obtenha uma apresentação polida — sem build, sem seletor de tema obrigatório. A visão de longo prazo é um agente AI que lê suas notas locais (incluindo vaults Obsidian) e propõe decks automaticamente.

Este README descreve o **estado atual** do código, não só a visão.

## O que funciona hoje

| Recurso | Status | Onde |
| --- | --- | --- |
| Parser Deckset + Marp | ✅ | `src/core/deckset-parser.js` (1500 LOC — registry de diretivas, `#[fit]`, headings posicionados, blocos `:::columns/steps/center/math/diagram`, tabelas GFM, fenced code, speaker notes, frontmatter YAML+Deckset) |
| Inferência de layout (Autoflow) | ✅ | `src/core/autoflow.js` (9 regras: title, divider, diagonal, z-pattern, alternating, statement, bare-image-position-variation, phrase-bullets, autoscale; estado cross-slide para anti-monotonia) |
| Engine de slides (OmniDeckSlides) | ✅ | `src/core/slides2.js` — navegação, fragments, backgrounds, scaling responsivo |
| Carregar `.md` via drag-drop ou seletor | ✅ | arraste um `.md` na janela ou clique **Open** no toolbar flutuante |
| Export PDF (in-browser) | ✅ | botão **Export PDF** ou `⌘/Ctrl+E`. Usa html2canvas + pdf-lib via CDN |
| Navegação por teclado | ✅ | `← → PgUp PgDn` / `Espaço` (Shift+Espaço volta) / `Home End` |
| Registry de temas (10 temas, 40+ schemes) | ⚠️ | registrado em `src/core/constants.js`, **ainda não aplicado** — [#14](https://github.com/paulotvlincelia/OmniDeck/issues/14) |
| CSS dos layouts emitidos pelo parser | ❌ | renderiza, mas **sem estilos** — [#13](https://github.com/paulotvlincelia/OmniDeck/issues/13) |
| Backend / vault scanning / agente AI | 🚧 | apenas stub FastAPI (`backend/main.py`); sem integração |

## Setup

```bash
npm install
npm run dev   # vite em http://localhost:5173
```

Arraste qualquer `.md` na janela para carregar. O `public/test.md` carrega por padrão.

Dialeto markdown: segue convenções [Deckset](https://www.deckset.com/) — `---` como separador de slide, `![right]/![left]/![fit]` como modificadores, `#[fit]` para headings auto-fit, `^` para speaker notes, `[.diretiva: valor]` para config por slide, key:value no topo para frontmatter. Diretivas Marp também são aceitas. Referência completa na [RFC 002 fechada](https://github.com/paulotvlincelia/OmniDeck/issues/2).

## Arquitetura (1 parágrafo)

Um `.md` passa por `parseDecksetMarkdown()` (com pré-processamento opcional via `applyAutoflow()`), produzindo HTML concatenado de `<section>`. O HTML é injetado em `.slides`, e o engine `OmniDeckSlides` cuida de navegação, fragments, scaling e backgrounds. O export PDF reusa o mesmo DOM via `print-mode.js` (força `.reveal` para 1280×720 px) e captura cada slide com html2canvas antes de compor páginas com pdf-lib. O backend (`backend/main.py`) é apenas um stub para futura integração com agente/vault.

## Roadmap

Issues ativos no GitHub. Prioridades atuais:

- **Visual** — [#13 Portar CSS de layout](https://github.com/paulotvlincelia/OmniDeck/issues/13) (P1, bloqueia usabilidade visual) · [#14 Wire do sistema de temas](https://github.com/paulotvlincelia/OmniDeck/issues/14)
- **Editor** — [#6 Paste-area + error boundary](https://github.com/paulotvlincelia/OmniDeck/issues/6) · [#7 Fixtures do parser](https://github.com/paulotvlincelia/OmniDeck/issues/7) · [#5 README/docs](https://github.com/paulotvlincelia/OmniDeck/issues/5)
- **Backend** — bloqueado pela [RFC 003](https://github.com/paulotvlincelia/OmniDeck/issues/3): [#8 Scanner local](https://github.com/paulotvlincelia/OmniDeck/issues/8) · [#9 Integração frontend↔backend](https://github.com/paulotvlincelia/OmniDeck/issues/9)
- **Agente** — bloqueado pela [RFC 004](https://github.com/paulotvlincelia/OmniDeck/issues/4): [#11 Gerador de outline](https://github.com/paulotvlincelia/OmniDeck/issues/11) · [#12 Conversor outline→markdown](https://github.com/paulotvlincelia/OmniDeck/issues/12)

Discussões abertas: [RFC 001](https://github.com/paulotvlincelia/OmniDeck/issues/1) (escopo MVP), [RFC 003](https://github.com/paulotvlincelia/OmniDeck/issues/3) (segurança/permissões), [RFC 004](https://github.com/paulotvlincelia/OmniDeck/issues/4) (arquitetura do agente). [RFC 002](https://github.com/paulotvlincelia/OmniDeck/issues/2) (dialeto markdown) foi fechada como retro-doc.

## Stack tecnológica

- **Frontend**: Vite + vanilla JS, sem framework. Parser de markdown, autoflow e engine de slides vivem em `src/core/`.
- **Backend** (planejado): Python + FastAPI para scanning local de arquivos/vaults e orquestração de LLM.
- **PDF**: html2canvas + pdf-lib carregados sob demanda via CDN — sem dependência npm.

