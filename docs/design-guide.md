# Olimpo — Design System v1.0

> *"Ativos que poucos alcançam."*
> Plataforma de vitrine para lojas high-ticket: automóveis, imóveis e outros.

---

## 1. Marca

### Nome
**Olimpo**

Referência ao Monte Olimpo — morada dos deuses gregos, ponto mais alto da Grécia, maior vulcão do sistema solar. Comunica elevação, exclusividade e grandiosidade sem precisar de explicação.

### Tagline principal
> *"Ativos que poucos alcançam."*

### Taglines alternativas
- *"O topo tem endereço."*
- *"Onde o extraordinário é o padrão."*

### Domínio sugerido
`olimpo.com.br`

---

## 2. Personalidade da marca

| Atributo | Descrição |
|---|---|
| **Tom** | Sóbrio, confiante, sem exageros |
| **Postura** | Curador, não vendedor |
| **Promessa** | Conectar compradores sérios a ativos excepcionais |
| **Diferencial** | A negociação começa aqui, mas se conclui pessoalmente |

A Olimpo não empurra produtos. Ela apresenta. O usuário chega, avalia, e parte para o contato presencial convicto.

---

## 3. Paleta de cores

### Cores primárias

| Nome | Hex | Uso |
|---|---|---|
| **Gold** | `#C4A862` | Cor de ação — CTAs, destaques, links ativos |
| **Noir** | `#0E1219` | Fundos hero, headers escuros |
| **Linen** | `#F5F0E8` | Fundo suave, superfícies premium |

### Cores secundárias

| Nome | Hex | Uso |
|---|---|---|
| **Slate** | `#2B3142` | Superfícies secundárias, cards escuros |
| **Driftwood** | `#6A5F50` | Texto muted, legendas, metadados |
| **Sand** | `#E0D8CC` | Bordas, separadores, divisores |

### Escala de cinza funcional

| Nome | Hex | Uso |
|---|---|---|
| **Ink** | `#1C1C1E` | Texto primário (modo claro) |
| **Ash** | `#3D3D3A` | Texto secundário |
| **Mist** | `#9A9890` | Texto terciário, placeholders |
| **Cloud** | `#F0EDE6` | Backgrounds de superfície |

### Regras de uso de cor

- **Gold** é reservado exclusivamente para ação e destaque — nunca use como decoração
- Nunca use mais de 2 cores de destaque na mesma tela
- Fundos hero usam sempre **Noir**; páginas internas usam **Linen** ou branco
- Bordas usam sempre **Sand** (`#E0D8CC`) com espessura de `0.5px` ou `1px`

---

## 4. Tipografia

### Família principal
**Inter** (sans-serif) — para todo o produto, corpo e UI

### Família de apoio
**Playfair Display** (serif) — exclusivamente para títulos hero e momentos editoriais de impacto

### Escala tipográfica

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `display` | 52px | 500 | Hero da home, manchete principal |
| `h1` | 36px | 500 | Títulos de seção |
| `h2` | 24px | 500 | Subtítulos, cabeçalhos de card |
| `h3` | 18px | 500 | Títulos internos, modais |
| `body-lg` | 16px | 400 | Descrições longas |
| `body` | 15px | 400 | Corpo padrão |
| `caption` | 12px | 400 | Metadados, datas, specs técnicas |
| `label` | 11px | 500 | Tags, categorias, badges (uppercase) |

### Regras tipográficas

- Pesos permitidos: **400** (regular) e **500** (medium) — nunca 600 ou 700
- `display` e `h1` podem usar **Playfair Display** em contextos editoriais
- `letter-spacing: 0.08em` em todos os elementos `label`
- `line-height: 1.65` para `body`, `1.1` para `display`

---

## 5. Espaçamento

Sistema baseado em múltiplos de **8px**.

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Gaps internos mínimos |
| `space-2` | 8px | Gaps entre elementos inline |
| `space-3` | 12px | Padding de badges e chips |
| `space-4` | 16px | Padding interno de cards |
| `space-5` | 20px | Gap entre componentes |
| `space-6` | 24px | Padding de seções compactas |
| `space-8` | 32px | Margens entre seções |
| `space-10` | 40px | Padding de seções grandes |
| `space-16` | 64px | Espaçamento hero |

---

## 6. Bordas e elevação

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4px | Badges, pills pequenos |
| `radius-md` | 8px | Inputs, botões, chips |
| `radius-lg` | 12px | Cards padrão |
| `radius-xl` | 16px | Cards hero, modais |
| `radius-full` | 9999px | Avatares, tags arredondadas |

### Bordas

- Espessura padrão: `0.5px` — transmite refinamento
- Cor padrão: `#E0D8CC` (Sand)
- Bordas de destaque (card selecionado, foco): `1px solid #C4A862`
- **Sem sombras decorativas** — elevação é comunicada por contraste de cor, não por box-shadow

---

## 7. Componentes

### 7.1 Botões

#### Primário
```
background: #C4A862
color: #0E1219
border: none
border-radius: radius-md
padding: 10px 22px
font-size: 14px
font-weight: 500
```
Uso: ação principal da tela ("Ver detalhes", "Agendar visita")

#### Secundário
```
background: transparent
color: texto primário
border: 0.5px solid #E0D8CC
border-radius: radius-md
padding: 10px 22px
font-size: 14px
```
Uso: ações de suporte ("Salvar", "Compartilhar")

#### Ghost
```
background: transparent
color: #C4A862
border: none
font-size: 14px
```
Uso: links de navegação, "Ver mais →"

---

### 7.2 Card de listagem

Estrutura padrão de um ativo na vitrine:

```
┌─────────────────────────────┐
│  [ imagem do ativo ]        │  ← height: 200px, background escuro
│  [badge: Automóvel]         │  ← posição: top-left, sobre a imagem
├─────────────────────────────┤
│  Título do ativo            │  ← h3, 18px, weight 500
│  Subtítulo / specs          │  ← caption, 12px, Driftwood
│                             │
│  Valor                      │  ← label 11px uppercase, Mist
│  R$ 390.000                 │  ← 20px, weight 500, Ink
│                             │
│  [Ver detalhes] [Salvar]    │  ← botão primário + secundário
└─────────────────────────────┘
```

**Especificações do card:**
- `background: #FFFFFF`
- `border: 0.5px solid #E0D8CC`
- `border-radius: 12px`
- `overflow: hidden`
- Hover: `border-color: #C4A862` com transição de `200ms`

---

### 7.3 Badges de categoria

Cada categoria tem sua própria identidade visual dentro do badge:

| Categoria | Background | Texto |
|---|---|---|
| Automóvel | `#1E2430` | `#8A9BB8` |
| Imóvel | `#1A2219` | `#7A9B72` |
| Náutico | `#0F1E24` | `#6A9BAA` |
| Aviação | `#1E1A2A` | `#9B8AB8` |

Especificações:
```
padding: 3px 10px
border-radius: radius-full
font-size: 10px
font-weight: 500
letter-spacing: 0.07em
text-transform: uppercase
```

---

### 7.4 Chips de filtro

Três estados:

```
Inativo:  border: 0.5px solid #E0D8CC  |  color: Driftwood  |  bg: transparent
Hover:    border: 0.5px solid #C4A862  |  color: #C4A862    |  bg: transparent
Ativo:    border: none                 |  color: #0E1219    |  bg: #C4A862
```

```
padding: 5px 14px
border-radius: radius-full
font-size: 12px
```

---

### 7.5 Inputs e formulários

```
height: 40px
padding: 9px 13px
border: 0.5px solid #E0D8CC
border-radius: radius-md
font-size: 14px
background: #FFFFFF
color: Ink
```

**Estados:**
- Default: `border-color: #E0D8CC`
- Focus: `border-color: #C4A862`, sem box-shadow
- Error: `border-color: #E24B4A`

Label acima do input:
```
font-size: 11px
font-weight: 500
letter-spacing: 0.06em
text-transform: uppercase
color: Driftwood
margin-bottom: 4px
```

---

### 7.6 Cards de métricas

Para exibir números da plataforma (estoque total, parceiros, etc.):

```
background: #F5F0E8  (Linen)
border-radius: radius-md
padding: 14px 16px
text-align: center
```

Estrutura interna:
- Número: `22px`, `weight 500`, cor **Gold** ou **Ink**
- Label: `11px`, `Mist`, `letter-spacing: 0.04em`

---

## 8. Iconografia

- Biblioteca: **Tabler Icons** (outline only)
- Tamanho inline: `16–20px`
- Tamanho decorativo: `24px` máximo
- Cor: sempre herda do contexto — nunca hardcode uma cor em ícone
- Ícones decorativos recebem `aria-hidden="true"`
- Ícones funcionais recebem `aria-label` descritivo

---

## 9. Grid e layout

### Breakpoints

| Nome | Largura | Colunas |
|---|---|---|
| `mobile` | < 768px | 1 coluna |
| `tablet` | 768px – 1024px | 2 colunas |
| `desktop` | > 1024px | 3–4 colunas |

### Grid de listagem

```
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
gap: 20px
```

### Container máximo
`max-width: 1280px`, centralizado, padding horizontal `24px` (mobile) / `40px` (desktop)

---

## 10. Tom de voz

### Princípios

- **Curador, não vendedor** — a Olimpo apresenta, não empurra
- **Direto e preciso** — sem superlativos vazios ("incrível", "imperdível")
- **Respeito pelo tempo do usuário** — informação densa, sem rodeios

### Exemplos

| Evitar | Preferir |
|---|---|
| "Incrível oportunidade imperdível!" | "BMW M340i · 2023 · 14.200 km" |
| "O melhor carro do mercado" | "Agende uma avaliação presencial" |
| "Não perca essa chance!" | "Ativos que poucos alcançam." |

### Hierarquia de informação em um ativo

1. **O quê** — nome e modelo do ativo
2. **Specs** — dados objetivos (km, área, ano)
3. **Valor** — direto, sem eufemismos
4. **Próximo passo** — agendar visita ou entrar em contato

---

## 11. Logo — diretrizes

### Símbolo
Triângulo ascendente com linha horizontal — remete ao pico de uma montanha. Simples, escalável, funciona em qualquer tamanho.

### Versões

| Versão | Fundo | Cor do símbolo | Cor do nome |
|---|---|---|---|
| Principal | `#0E1219` (Noir) | `#C4A862` (Gold) | `#F5F0E8` (Linen) |
| Clara | `#F5F0E8` (Linen) | `#0E1219` (Noir) | `#0E1219` (Noir) |
| Monocromática | Qualquer | Mesma cor do nome | — |

### Espaço de proteção
Mínimo de `1×` a altura do símbolo em todos os lados do logo.

### Tamanho mínimo
- Digital: `120px` de largura (logotipo completo), `32px` (símbolo isolado)
- Impresso: `30mm` de largura

---

## 12. Animação e transições

- Duração padrão: `200ms`
- Easing: `ease-out`
- Propriedades animadas: `border-color`, `background`, `opacity`, `transform`
- **Sem animações decorativas** — movimento só quando comunica estado ou feedback
- Hover em cards: `border-color` muda para Gold em `200ms`
- Hover em botões: `background` levemente mais escuro em `150ms`

---

## 13. Acessibilidade

- Contraste mínimo: **4.5:1** para texto normal, **3:1** para texto grande
- Gold `#C4A862` sobre Noir `#0E1219`: contraste **6.8:1** ✓
- Todos os inputs com `label` associado via `for`/`id`
- Foco visível em todos os elementos interativos: `outline: 2px solid #C4A862`
- Imagens de ativos com `alt` descritivo

---

*Olimpo Design System — uso interno do projeto ESOF II*