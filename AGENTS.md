# AGENTS.md

## Visão geral do projeto

- Para arquitetura detalhada, veja `ARCHITECTURE.md`
- `DESIGN.md` define o design system — use os tokens exatos, cores, tipografia e especificações de componentes para todo trabalho de UI.
- Protótipo visual no Google Stitch: [https://stitch.withgoogle.com/projects/7811335591909664974]
- `GAME.md` define o desenvolvimento do jogo e regras: sistema de progressão, catálogo de blocos, progressão de níveis.

## Instruções Carregadas Automaticamente

Os seguintes arquivos são injetados no contexto em toda sessão via `opencode.json`:
- `ARCHITECTURE.md` – arquitetura, fluxo de dados, invariantes, mapa de arquivos
- `DESIGN.md` – use *apenas* tokens YAML do frontmatter para UI; em conflitos entre YAML e prosa, prefira o YAML

Demais documentos (ex: `GAME.md`) são carregados sob demanda via Skills.

## Skills Disponíveis (`.opencode/skills/`)

As Skills abaixo são atalhos inteligentes carregados sob demanda. Em caso de conflito, **AGENTS.md sempre vence**.

| Skill | Nome | Quando Usar |
| ------ | ------ | ------------- |
| Conformidade Arquitetural | `architecture-compliance` | Ao trabalhar em `engine/`, `ui/` ou `app.js` |
| Design System | `design-system` | Ao trabalhar em `styles/` ou componentes UI |
| Lógica de Jogo | `game-logic` | Ao trabalhar em `game/`, níveis ou progressão |
| Estilo de Código | `code-style` | Ao criar ou editar arquivos JavaScript |
| Catálogo de Blocos | `block-catalog` | Ao adicionar novos blocos ao catálogo |

### Instrução para Agentes

- Skills são carregadas automaticamente conforme a tarefa (via ferramenta `skill`)
- Cada Skill referencia seu documento fonte (`ARCHITECTURE.md`, `DESIGN.md`, `GAME.md`) como verdade
- Skills são complementares, nunca substituem os documentos originais

## Arquitetura

### Regras de Conformidade

- Arquivos em `engine/` **NUNCA** referenciam DOM (`document`, `window`, eventos DOM), exceto `parser.js` que apenas lê o DOM
- Arquivos em `ui/` **NUNCA** contêm lógica de jogo (condições de vitória/derrota, colisão, estado do herói)
- `app.js` é o único arquivo que pode importar engine e UI; apenas coordena execução, não adiciona lógica a nenhuma das camadas

Violações das regras de conformidade são erros críticos; rejeite qualquer código que misture camadas.

Para mapa completo de arquivos e fluxo de dados, veja `ARCHITECTURE.md`.

## Desenvolvimento

- Projeto 100% estático: sem etapas de build, basta abrir `index.html` no navegador
- Servidor local opcional para recarregamento automático, não obrigatório

## Git Workflow

- Mensagens de commit: padrão conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Nunca comite arquivos temporários, `.env` ou pastas de dependências
- Mudanças em `DESIGN.md`/`GAME.md` devem ter prefixo `docs:` e resumo das alterações de regras
- PRs devem listar qual regra de AGENTS.md foi seguida para cada arquivo alterado

## Regras de Escalonamento

Se bloqueado ou se um pedido do usuário contradisser `DESIGN.md`/`GAME.md`:

1. PARE o trabalho imediatamente
2. Cite a regra exata violada (copie do doc)
3. Explique o impacto no projeto (ex: "usar React viola a regra de zero frameworks")
4. Proponha 3 alternativas que sigam todas as regras
5. Aguarde aprovação explícita do usuário antes de prosseguir

## Convenções de código

- Must usar ES6+ Classes para todos os componentes com estado; proibido padrão de função para componentes de engine/ator/ui
- async/await para runner (cadeia de execução)
- Event delegation para interações com múltiplos blocos
- **NUNCA** misturar manipulação de DOM com lógica de jogo: arquivos de engine não acessam DOM (exceto `parser.js` para leitura), arquivos de UI não contêm lógica de jogo
- **NUNCA** adicionar comentários desnecessários
- Nomes de arquivos em camelCase, classes em PascalCase

Para detalhes de stack tecnógica e invariantes arquiteturais, veja `ARCHITECTURE.md`.

## Critérios de Conclusão de Tarefas

Tarefa só está completa se:

- [ ] Nenhum arquivo de `engine/` tem referências ao DOM (exceto `parser.js` que apenas lê)
- [ ] Nenhum arquivo de `ui/` tem lógica de jogo
- [ ] CSS usa *apenas* variáveis do frontmatter de `DESIGN.md` (sem cores/espaçamentos hardcoded)
- [ ] Novos blocos de jogo seguem exatamente o formato do catálogo em `GAME.md`
- [ ] Código segue convenções de nomenclatura (arquivos camelCase, classes PascalCase)
- [ ] Skill correspondente foi carregada e seguida (quando aplicável)
