# HPSD Command Center — Arquitetura de Informações e Stack Tecnológico
_Fênix SW Factory Takeover | Vivo/Telefónica | Accenture_
_Versão 1.0 — Abril 2026_

---

## 1. Visão Geral do Sistema

O HPSD Command Center é um sistema local de inteligência operacional construído para dar visibilidade executiva ao projeto de takeover da SW Factory Fênix. Opera inteiramente offline, sem dependência de servidores externos ou autenticação de terceiros.

```
┌──────────────────────────────────────────────────────────────┐
│                    FONTES DE DADOS                           │
│  PPTX · XLSX · PDF · DOCX · MD (atas Notion)                │
└─────────────────────┬────────────────────────────────────────┘
                      │ ingest.py
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  CAMADA DE STORAGE                           │
│             SQLite  ·  db/hpsd.db                           │
│  7 tabelas  +  4 views derivadas                            │
└──────────┬───────────────────────────┬───────────────────────┘
           │                           │
           ▼                           ▼
┌──────────────────┐       ┌───────────────────────┐
│   DASHBOARD      │       │   PPTX BUILDER        │
│  dashboard.html  │       │   build_pptx.py        │
│  (browser local) │       │   hpsd_status_*.pptx   │
└──────────────────┘       └───────────────────────┘
```

---

## 2. Arquitetura de Informações

### 2.1 Domínio e Entidades

O modelo de domínio orbita em torno de **frentes** (unidades de trabalho) às quais todas as demais entidades se vinculam.

```
frentes (1) ──→ (N) atividades
frentes (1) ──→ (N) issues
frentes (1) ──→ (N) staffing
frentes (1) ──→ (N) treinamentos
frentes (1) ──→ (N) cronograma_macro
atas (N) ←──→ (N) frentes   [via texto livre / menção]
```

---

### 2.2 Entidades Principais

#### `frentes` — Unidades de trabalho do projeto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT PK | Slug identificador (`ftth_xgpon`, `sip`, etc.) |
| `nome` | TEXT | Nome exibido |
| `fornecedor_origem` | TEXT | Druid / Minsait / — |
| `dinamica` | TEXT | `parceria` ou `takeover_competitivo` |
| `ftes_alvo` | INTEGER | Headcount-alvo da frente |
| `data_massificacao` | DATE | Data de go-live prevista |
| `status_semaforo` | TEXT | `verde` / `amarelo` / `vermelho` |
| `percentual_avanco` | REAL | 0.0 a 1.0 |
| `observacoes` | TEXT | Contexto livre |

Frentes cadastradas:

| ID | Nome | Fornecedor | Dinâmica |
|----|------|-----------|----------|
| `ftth_xgpon` | FTTH / XGPON | Druid | Parceria |
| `sip` | SIP | Minsait | Takeover competitivo |
| `ongoing` | Ongoing / Evolução | Druid | Parceria |
| `staffing_contratacao` | Staffing & Contratação | — | — |
| `treinamento` | Treinamento | — | — |

---

#### `atividades` — Entregas e marcos por frente

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT PK | Slug descritivo |
| `frente_id` | TEXT FK | Referência à frente |
| `nome` | TEXT | Título da entrega |
| `dono` | TEXT | Responsável |
| `data_prevista` | DATE | Deadline planejado |
| `data_real` | DATE | Data efetiva (NULL se não concluído) |
| `status` | TEXT | `em_andamento` / `bloqueado` / `atrasado` / `concluido` |
| `onde_deveria_estar` | TEXT | Estado esperado na data atual |
| `onde_esta` | TEXT | Estado real atual |
| `plano_recuperacao` | TEXT | Próximas ações para desbloqueio |
| `fonte_arquivo` | TEXT | Arquivo de origem da extração |

---

#### `issues` — Problemas e riscos ativos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER PK | Auto-increment |
| `frente_id` | TEXT FK | Referência à frente |
| `titulo` | TEXT | Descrição do problema |
| `severidade` | TEXT | `critico` / `alto` / `medio` / `baixo` |
| `dono_acao` | TEXT | Responsável pela resolução |
| `acao` | TEXT | Próxima ação definida |
| `prazo` | DATE | Deadline da ação |
| `status` | TEXT | `aberto` / `em_andamento` / `resolvido` |
| `data_criacao` | DATE | Data de registro |
| `fonte` | TEXT | Origem (ata, reunião, etc.) |

---

#### `staffing` — Posições e contratações

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER PK | Auto-increment |
| `frente_id` | TEXT FK | Referência à frente |
| `perfil` | TEXT | Cargo / função |
| `tipo_contrato` | TEXT | `CLT` / `PJ` / `absorção_Druid` / `Minsait_replace` |
| `status` | TEXT | `aberto` / `em_processo` / `contratado` / `onboarded` |
| `responsavel` | TEXT | Dono do processo de contratação |
| `previsao_entrada` | DATE | Data esperada de início |
| `wave` | TEXT | Wave 1 a 5 |
| `fonte_arquivo` | TEXT | Planilha de origem |

---

#### `treinamentos` — Capacitações e certificações

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER PK | Auto-increment |
| `frente_id` | TEXT FK | Referência à frente |
| `nome` | TEXT | Nome do treinamento |
| `tipo` | TEXT | `HPE` / `academia_acn` / `on_the_job` |
| `responsavel` | TEXT | Dono |
| `participantes_alvo` | INTEGER | Total previsto |
| `participantes_concluidos` | INTEGER | Concluíram até a data |
| `data_inicio` / `data_fim` | DATE | Janela do treinamento |
| `status` | TEXT | `planejado` / `em_andamento` / `concluido` / `bloqueado` |

---

#### `cronograma_macro` — Milestones do projeto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER PK | Auto-increment |
| `frente_id` | TEXT FK | Referência à frente |
| `milestone` | TEXT | Nome do marco |
| `data_planejada` | DATE | Data original do contrato |
| `data_reprojetada` | DATE | Nova data se houver desvio |
| `status` | TEXT | `no_prazo` / `em_risco` / `atrasado` |
| `dependencias` | TEXT | Pré-requisitos para atingir o marco |

Milestones cadastrados:

| Marco | Data | Status |
|-------|------|--------|
| Wave 1 — início Druid (contratação formal) | 18/05/2026 | Em risco |
| DEV FTTH — conclusão | 22/06/2026 | Em risco |
| 14 novos contratados iniciam (Academia CG) | 04/05/2026 | No prazo |
| Massificação FTTH | 01/08/2026 | Em risco |
| Massificação SIP | 01/08/2026 | Em risco |
| Migração legado VVN | 01/09/2026 | No prazo |
| Massificação XGPON | 01/11/2026 | No prazo |

---

#### `atas` — Registros de reunião

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER PK | Auto-increment |
| `data` | DATE | Data da reunião |
| `titulo` | TEXT | Nome da reunião |
| `participantes` | TEXT | Lista de participantes |
| `decisoes` | TEXT | Decisões registradas |
| `acoes` | TEXT | JSON array de `{acao, dono, prazo}` |
| `fonte_arquivo` | TEXT | Arquivo `.md` de origem (Notion export) |

---

### 2.3 Views Derivadas

As views são computadas no SQLite e servem como interface entre o banco e as camadas de apresentação.

| View | Propósito | Alimenta |
|------|-----------|---------|
| `view_status_executivo` | Agrega por frente: semáforo, % avanço, top issue, próximo milestone, delta staffing | Topo do dashboard (cards de frentes) |
| `view_top_issues` | Issues ordenados por severidade × prazo | Seção Issues do dashboard |
| `view_kanban_frente` | Atividades agrupadas por status com campo `ordem_kanban` | Kanban clicável por frente |
| `view_staffing_gap` | Delta entre posições planejadas e preenchidas por frente e wave | Indicador de risco de staffing |

---

### 2.4 Hierarquia da Informação no Dashboard

O dashboard organiza a informação em três camadas de zoom:

```
NÍVEL 1 — Visão Executiva (topo)
  └─ Cards por frente: semáforo · % avanço · data de massificação
       └─ Intenção: responder "qual é o status?" em 10 segundos

NÍVEL 2 — Issues Ativos (meio)
  └─ Cards por issue: severidade · dono · prazo · ação
       └─ Intenção: responder "o que está bloqueado e quem age?"

NÍVEL 3 — Detalhe Operacional (kanban)
  └─ Por frente → por status: onde deveria estar / onde está / plano
       └─ Intenção: drill-down para a call das 12h

BUSCA GLOBAL (transversal)
  └─ Índice em memória sobre todas as entidades
       └─ Intenção: acesso por qualquer termo (pessoa, sistema, palavra-chave)
```

---

### 2.5 Fluxo de Dados

```
Arquivos (./data/ e subpastas)
   │
   │  Parsers por tipo de arquivo
   │  PPTX → python-pptx
   │  XLSX → openpyxl
   │  PDF  → pdfplumber
   │  DOCX → python-docx
   │  MD   → stdlib (re + string)
   │
   ▼
ingest.py
   │  Normalização
   │  Deduplicação (hash por conteúdo)
   │  Resolução de conflitos entre fontes
   │  Flag: dado ausente / sem dono / sem prazo
   │
   ▼
db/hpsd.db  (SQLite)
   │
   ├──▶ views derivadas (geradas no schema)
   │
   ├──▶ outputs/dashboard.html  ← dados embedados no build
   │
   └──▶ outputs/hpsd_status_*.pptx  ← build_pptx.py
```

---

## 3. Stack Tecnológico

### 3.1 Runtime e Linguagens

| Componente | Tecnologia | Versão mínima | Uso |
|-----------|------------|---------------|-----|
| Runtime de scripts | Python 3 | 3.9+ | Ingestão + geração PPTX |
| Banco de dados | SQLite 3 | 3.35+ | Storage local; sem servidor |
| Dashboard | HTML5 + CSS3 + JavaScript ES2020 | — | Interface visual |
| Tipografia | Inter (Google Fonts) | — | UI font; fallback Arial |

---

### 3.2 Bibliotecas Python

#### Dependências de parsing (opcionais — falha graceful se ausentes)

| Biblioteca | Instalação | Uso |
|-----------|-----------|-----|
| `python-pptx` | `pip install python-pptx` | Leitura de arquivos `.pptx` |
| `openpyxl` | `pip install openpyxl` | Leitura de arquivos `.xlsx` |
| `pdfplumber` | `pip install pdfplumber` | Extração de texto de PDFs |
| `python-docx` | `pip install python-docx` | Leitura de arquivos `.docx` |

#### Stdlib (sem instalação)

| Módulo | Uso |
|--------|-----|
| `sqlite3` | Conexão e queries ao banco |
| `pathlib` | Navegação de diretórios |
| `json` | Serialização de actions das atas |
| `hashlib` | Deduplicação por hash de conteúdo |
| `datetime` | Normalização e comparação de datas |
| `re` | Parsing de Markdown e extração de campos |
| `typing` | Type hints nos scripts |

#### Para geração do PPTX

| Biblioteca | Uso específico |
|-----------|---------------|
| `python-pptx` | Criação de slides, shapes, tabelas |
| `sqlite3` | Query ao banco para dados em tempo real |

---

### 3.3 Dashboard (Frontend)

O dashboard é **zero-dependency** no runtime — nenhuma biblioteca JavaScript externa além do Google Fonts.

| Decisão | Alternativa descartada | Motivo |
|---------|----------------------|--------|
| Vanilla JS | React / Vue | Funciona em `file://` sem bundler ou servidor |
| Dados embedados no HTML | sql.js + fetch do arquivo | `fetch()` é bloqueado em `file://` no Chrome por padrão |
| SQLite build-time | REST API local | Zero configuração, zero porta, funciona offline |
| CSS puro | Tailwind / Bootstrap | Sem CDN obrigatório; controle total da paleta Accenture |

**Funcionalidades implementadas:**

| Feature | Implementação |
|---------|--------------|
| Busca global | Índice em memória (`searchIndex[]`) construído no `DOMContentLoaded` |
| Normalização | `String.normalize('NFD')` + remoção de diacríticos |
| Debounce | `setTimeout` 300ms no evento `input` |
| Highlight | `RegExp` case-insensitive + substituição por `<mark>` |
| Scroll + pulse | `requestAnimationFrame` + `scrollIntoView` + CSS keyframe animation |
| Dimming de seções | Toggle de classe `.dimmed` (opacity 0.22) por seção sem match |
| Kanban | Tabs clicáveis com re-render parcial do board por frente |
| Semáforo animado | CSS `@keyframes` com `box-shadow` pulsante no status `vermelho` |

---

### 3.4 Paleta de Design

Accenture brand guidelines aplicadas:

| Token | Hex | Uso |
|-------|-----|-----|
| `--purple` | `#A100FF` | Accent principal, botões, borders ativos |
| `--purple-light` | `#C866FF` | Hover states, títulos em dark |
| `--dark` | `#1A1A2E` | Header, fundo de tabelas |
| `--dark2` | `#16213E` | Barra de busca |
| `--red` | `#EF4444` | Semáforo vermelho, status crítico |
| `--orange` | `#F97316` | Severidade alta, estado atual |
| `--yellow` | `#CA8A04` | Semáforo amarelo, em andamento |
| `--green` | `#22C55E` | Semáforo verde, concluído |

---

### 3.5 Estrutura de Arquivos

```
HPSD/
├── db/
│   └── hpsd.db                    # SQLite — fonte de verdade
├── scripts/
│   ├── ingest.py                  # Ingestão: arquivos → banco
│   └── build_pptx.py              # Builder: banco → PPTX executivo
├── docs/
│   ├── HPSD_DATA_MODEL.md         # Schema detalhado (proposta)
│   ├── HPSD_ARCHITECTURE.md       # Este documento
│   └── HPSD_PROMPTS_v2.md         # Prompts de operação do sistema
├── outputs/
│   ├── dashboard.html             # Dashboard interativo (single-file)
│   ├── hpsd_status_YYYYMMDD.pptx  # Status executivo gerado
│   ├── briefing_YYYYMMDD.html     # Briefing executivo
│   └── ingestao_report.md         # Relatório de ingestão
├── atas/                          # Exports do Notion (.md)
├── 00-04/                         # Documentos fonte (SharePoint sync)
└── CLAUDE.md                      # Contexto do projeto para Claude Code
```

---

## 4. Comandos Operacionais

| Comando | O que faz |
|---------|-----------|
| `python3 scripts/ingest.py` | Re-processa todos os arquivos em `./data/` e atualiza o banco |
| `python3 scripts/build_pptx.py` | Gera PPTX de status com dados atuais do banco |
| `open outputs/dashboard.html` | Abre o dashboard no browser padrão |
| `sqlite3 db/hpsd.db ".tables"` | Lista tabelas do banco |
| `sqlite3 db/hpsd.db "SELECT * FROM view_top_issues;"` | Consulta direta às views |

---

## 5. Decisões de Arquitetura

### Por que SQLite e não um arquivo JSON?

O banco relacional permite views derivadas que agregam dados de múltiplas tabelas sem duplicar lógica no frontend. Também permite queries ad-hoc via CLI para diagnóstico rápido sem abrir o dashboard.

### Por que os dados são embedados no HTML e não lidos do banco em runtime?

Browsers modernos bloqueiam `fetch()` e `XMLHttpRequest` para arquivos locais em `file://` (política CORS). A alternativa seria rodar um servidor local (`python3 -m http.server`), o que adiciona fricção operacional. Embedar os dados no build garante que o arquivo funciona com duplo clique, sem configuração.

A consequência é que o dashboard precisa ser re-gerado após cada ingestão — o que é natural dado que a ingestão já gera os outputs.

### Por que não usar React, Vue ou outro framework?

O dashboard não tem estado complexo que justifique um framework. O re-render parcial (kanban tabs) é trivial em vanilla JS. A ausência de build step (webpack/vite) mantém o arquivo deployável como um único `.html` que qualquer pessoa do time pode abrir sem instalar nada.

### Por que os parsers são opcionais com fallback graceful?

Nem todas as máquinas do time têm as mesmas bibliotecas instaladas. O `ingest.py` registra no relatório quais arquivos foram pulados por falta de parser, permitindo ingestão parcial útil em vez de erro total.

---

## 6. Limitações Conhecidas

| Limitação | Impacto | Mitigação |
|-----------|---------|-----------|
| Dados embedados no HTML são estáticos | Dashboard mostra snapshot do momento da ingestão | Re-executar `ingest.py` + regenerar `dashboard.html` |
| Sem autenticação | Qualquer pessoa com acesso ao arquivo vê todos os dados | Acesso restrito ao diretório local |
| SQLite não suporta concorrência multi-processo | Ingestão e leitura simultânea podem corromper o banco | Nunca executar `ingest.py` enquanto `build_pptx.py` roda |
| Parsers dependem de estrutura dos documentos fonte | Mudança de layout nos XLSXs ou PPTXs pode quebrar a extração | Validar relatório `ingestao_report.md` após cada ingestão |
| `requirements.txt` ausente | Ambiente não é reproduzível de forma declarativa | **Próximo passo: criar `requirements.txt`** |

---

_Documento gerado por Claude Code · Accenture · Projeto HPSD / Fênix_
