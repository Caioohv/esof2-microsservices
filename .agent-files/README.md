# Spec-Driven Development com Agentes de IA

Este diretório implementa um workflow de **Spec-Driven Development (SDD)** baseado em agentes especializados de IA. A ideia central é substituir o planejamento informal por um conjunto de artefatos de especificação versionados que servem como fonte de verdade para todos os agentes e desenvolvedores.

---

## O que é Spec-Driven Development?

No SDD, nenhum código é escrito antes que uma especificação clara exista. O fluxo é:

```
Especificação → Planejamento → Tarefas → Implementação → Revisão
```

Cada etapa é executada por um agente especializado que lê os artefatos da etapa anterior e produz os artefatos da próxima. Os agentes não tomam decisões de arquitetura — elas estão todas registradas nos arquivos de contexto.

---

## Pipeline de Agentes

```
┌─────────────────┐
│  Contextualizer │  Analisa o codebase e gera/atualiza spec, memory e goals
└────────┬────────┘
         │ escreve: context/spec.md, context/memory.md, context/goals.md
         ▼
┌─────────────────┐
│     Planner     │  Lê o contexto e produz um roadmap estruturado por fases
└────────┬────────┘
         │ escreve: context/roadmap.md
         ▼
┌─────────────────┐
│  Task-Creator   │  Quebra cada fase do roadmap em task files executáveis
└────────┬────────┘
         │ escreve: tasks/pending/<N>-<titulo>.md
         ▼
┌─────────────────┐
│    Developer    │  Lê uma task, implementa, marca steps como concluídos
└────────┬────────┘
         │ deixa o arquivo em: tasks/pending/ (para o Reviewer validar)
         ▼
┌─────────────────┐
│    Reviewer     │  Valida o código contra a task e os padrões do spec
└────────┬────────┘
         │ aprovado → move para: tasks/done/
         │ reprovado → anota feedback no arquivo e mantém em tasks/pending/
         ▼
    tasks/done/
```

---

## Estrutura de Diretórios

```
.agent-files/
├── README.md                  # Este arquivo — documentação do pipeline
├── context/                   # Fonte de verdade do projeto
│   ├── spec.md                # Stack técnica, arquitetura, modelos de dados (DECISÕES TRAVADAS)
│   ├── memory.md              # Decisões históricas, gotchas, dívida técnica
│   ├── goals.md               # Visão do produto e objetivos imediatos
│   └── roadmap.md             # Fases de desenvolvimento com critérios de sucesso
└── prompts/                   # Definições dos agentes
│   ├── contextualizer.md      # Agente 1: analisa codebase, gera contexto
│   ├── plan.md                # Agente 2: gera roadmap a partir do contexto
│   ├── task-creator.md        # Agente 3: quebra roadmap em tasks executáveis
│   ├── develop.md             # Agente 4: implementa tasks
│   └── review.md              # Agente 5: valida implementações
└── tasks/
    ├── pending/               # Tasks aguardando implementação ou revisão
    └── done/                  # Tasks aprovadas e entregues
```

---

## Agentes

### 1. Contextualizer
**Arquivo**: `prompts/contextualizer.md`

**Responsabilidade**: É o ponto de entrada do pipeline. Analisa o codebase existente (estrutura de diretórios, package.json, arquivos de config, READMEs) e produz ou atualiza os três arquivos de contexto base: `spec.md`, `memory.md` e `goals.md`.

**Quando usar**: Ao iniciar trabalho em um projeto novo, ou quando o codebase evoluiu significativamente e o contexto precisa ser ressincronizado.

**Entradas**: Codebase inteiro  
**Saídas**: `context/spec.md`, `context/memory.md`, `context/goals.md`

---

### 2. Planner
**Arquivo**: `prompts/plan.md`

**Responsabilidade**: Lê os três arquivos de contexto e produz um roadmap estruturado com fases, dependências e critérios de sucesso. Não toma decisões de arquitetura — apenas organiza o trabalho a partir do que está em `spec.md` e `goals.md`.

**Quando usar**: Ao iniciar um novo ciclo de desenvolvimento ou quando o escopo muda significativamente.

**Entradas**: `context/spec.md`, `context/memory.md`, `context/goals.md`  
**Saídas**: `context/roadmap.md`

---

### 3. Task-Creator
**Arquivo**: `prompts/task-creator.md`

**Responsabilidade**: Lê o roadmap e quebra cada fase em task files concretos e executáveis. Cada task file contém contexto, steps detalhados, acceptance criteria e lista de arquivos a criar/modificar — tudo que um Developer Agent precisa para executar sem ambiguidade.

**Quando usar**: Após o Planner gerar ou atualizar o roadmap.

**Entradas**: `context/roadmap.md`, `context/spec.md`, `context/memory.md`, `tasks/done/` (para evitar duplicatas)  
**Saídas**: `tasks/pending/<N>-<titulo>.md`

---

### 4. Developer
**Arquivo**: `prompts/develop.md`

**Responsabilidade**: Lê uma task de `tasks/pending/`, implementa o código seguindo os padrões do `spec.md` e `memory.md`, e marca os steps como concluídos no arquivo da task. Deixa o arquivo em `tasks/pending/` para o Reviewer validar — não move sozinho para `done/`.

**Quando usar**: Para implementar qualquer feature ou serviço do roadmap.

**Entradas**: `tasks/pending/<N>-<titulo>.md`, `context/spec.md`, `context/memory.md`  
**Saídas**: Código implementado + task file atualizado (steps marcados)

---

### 5. Reviewer
**Arquivo**: `prompts/review.md`

**Responsabilidade**: Valida o código implementado contra os acceptance criteria da task, os padrões de Clean Code, segurança e arquitetura do `spec.md`. Se aprovado, move o arquivo para `tasks/done/`. Se reprovado, anota feedback no próprio arquivo da task e mantém em `tasks/pending/` para o Developer corrigir.

**Quando usar**: Após o Developer sinalizar que terminou uma task.

**Entradas**: `tasks/pending/<N>-<titulo>.md`, código modificado, `context/spec.md`  
**Saídas**: Task movida para `tasks/done/` (aprovada) ou feedback anotado no arquivo (reprovada)

---

## Regras de Contexto

Os arquivos em `context/` são a fonte de verdade do projeto. Todos os agentes leem esses arquivos antes de agir.

| Arquivo | Quem escreve | Frequência de atualização |
|---------|-------------|--------------------------|
| `spec.md` | Contextualizer | Rara — decisões de arquitetura são estáveis |
| `memory.md` | Contextualizer, Developer, Reviewer | Quando surgem gotchas ou decisões novas |
| `goals.md` | Contextualizer | Quando o escopo do produto muda |
| `roadmap.md` | Planner | Por ciclo de desenvolvimento |

**Regra de ouro**: Nenhum agente modifica `context/` sem uma razão explícita (nova decisão arquitetural, gotcha descoberto durante implementação). Modificações de contexto devem ser pequenas e precisas — não reescrever do zero.

---

## Estado Atual das Tasks

| # | Título | Status |
|---|--------|--------|
| 1 | Infrastructure Setup | ✅ Done |
| 2 | Auth Service Bootstrap | ✅ Done |
| 3 | User Service Bootstrap | ⬜ Pending |
| 4 | Store Service Bootstrap | ⬜ Pending |
| 5 | Frontend Foundation | ⬜ Pending |
| 6 | Payment Service Bootstrap | ⬜ Pending |
| 7 | Visit Scheduling | ⬜ Pending |

---

## Como Iniciar uma Nova Feature

1. **Verifique o roadmap**: `context/roadmap.md` — identifique a próxima fase pendente.
2. **Leia o contexto**: `context/spec.md` e `context/memory.md` — entenda as restrições.
3. **Selecione a task**: `tasks/pending/` — pegue a menor task não bloqueada por dependências.
4. **Execute com o Developer Agent**: Passe o arquivo da task e os arquivos de contexto relevantes.
5. **Revise com o Reviewer Agent**: Após a implementação, valide contra os acceptance criteria.
6. **Repita**: Avance sequencialmente pelas fases do roadmap.
