---
name: block-catalog
description: Mantém formato exato da tabela de blocos do GAME.md ao adicionar novos itens no CodeQuest
---

# Skill de Catálogo de Blocos

## Precedência
1. `AGENTS.md` (Constituição - maior prioridade)
2. Esta Skill (aplica-se apenas dentro do domínio de catálogo de blocos)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Instrução
**LEIA sempre a versão mais recente de `GAME.md`** (seção "Catálogo de Blocos") antes de adicionar novos blocos.
Esta skill garante conformidade com o formato exato da tabela.

## Formato Obrigatório para Novos Blocos

Ao adicionar um novo bloco, siga **exatamente**:

```markdown
| Nome do Bloco | *Categoria* | Nível | Descrição do que faz |
```

### Exemplo Prático
```markdown
| Para Cada (for) | *Controle* | 4 | Itera sobre uma lista de itens |
| Enquanto (while) | *Controle* | 4 | Executa enquanto condição for verdadeira |
```

## Categorias Válidas
- *Movimento* (cor: Blue / `var(--primary)`)
- *Controle* (cor: Purple / `var(--secondary)`)
- *Sensores* (cor: Green / `var(--tertiary)`)
- *Ações* (sem cor específica no DESIGN.md)

## Regras de Validação

### 1. Formato da Tabela
- Exatamente 4 colunas: Bloco | Categoria | Nível | Descrição
- Categoria entre asteriscos: `*Movimento*`, `*Controle*`, etc.
- Nível deve ser número (0 = Inicial, 1, 2, 3...)

### 2. Passos para Adicionar Novo Bloco
1. Adicionar linha na tabela "Catálogo de Blocos" em `GAME.md`
2. Se novo nível, adicionar linha na tabela "Progressão de Níveis" também
3. Atualizar `game/levels.js` com configuração do grid e obstáculos
4. Atualizar `game/progression.js` para desbloquear blocos ao completar nível anterior

### 3. Exemplo de Expansão (do GAME.md)

#### Adicionar Nível 4
```markdown
| 4 | Caverna dos Loops | Para Cada (for), Enquanto (while) | Completar labirinto usando loops | 7x7 | Pedras, Água, Inimigos |
```

#### Adicionar Blocos para Nível 4
```markdown
| Para Cada (for) | *Controle* | 4 | Itera sobre uma lista de itens |
| Enquanto (while) | *Controle* | 4 | Executa enquanto condição for verdadeira |
```

## Checklist de Verificação
- [ ] Bloco segue formato exato: `| Nome | *Categoria* | Nível | Descrição |`?
- [ ] Categoria está entre asteriscos?
- [ ] Nível é um número válido?
- [ ] Descrição é clara e objetiva?
- [ ] Se novo nível, tabela de Progressão também foi atualizada?
- [ ] `levels.js` e `progression.js` atualizados?
