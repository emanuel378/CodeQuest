# PROFILES.md

## Sistema de Perfis

### Gerenciamento de Perfis

O `PlayerManager` (`js/game/playerManager.js`) permite múltiplos perfis de jogador no mesmo navegador.

#### Funcionalidades

- Criar novo perfil (nome + ID único baseado em timestamp)
- Selecionar perfil ativo
- Deletar perfil (remove progresso + entradas do ranking)
- Persistência automática em `localStorage`

#### IDs de Jogador

```javascript
id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
// Exemplo: "lxp9z3k8f4"
```

### localStorage

| Chave | Conteúdo |
| --- | --- |
| `codequest_players` | Lista de perfis: `[{ id, name, createdAt }]` |
| `codequest_active_player` | ID do perfil ativo |
| `codequest_player_{id}` | Progresso individual do jogador |
| `codequest_ranking` | Ranking global multi-player |
| `codequest_workspace` | Estado do workspace (blocos) |

#### Estrutura `codequest_player_{id}`

```javascript
{
  currentLevel: 2,
  completedLevels: [0, 1],
  unlockedCommands: ["move", "turnRight", ...],
  totalXP: 500,
  attributes: {
    nucleoLogico: { level: 2 },
    eficienciaAlgoritmo: { level: 1 }
  },
  attributePoints: 1,
  playerLevel: 3,
  playerXP: 600,
  failedLevels: [],
  levelStats: { "0": { stars: 3, bestScore: 1200, ... } }
}
```

### Fluxo de Criação

1. Novo visitante → tutorial `GameTutorial` guia criação de perfil
2. Cria perfil via `ProfileMenu`
3. `PlayerManager.addPlayer(name)` → salva em `codequest_players`
4. `Progression` carrega dados do `codequest_player_{id}`
5. Se sem perfil → botão Executar mostra erro "Crie ou selecione um perfil"

### Migração de Dados Legados

`app.js` inclui `_migrateLegacyData()` que converte dados de versão anterior (formato antigo sem `codequest_players`) para o novo formato multi-perfil.

### Implementação

- Gerenciador: `js/game/playerManager.js`
- Progressão por jogador: `js/game/progression.js`
- Menu UI: `js/ui/profileMenu.js`
- Tutorial: `js/ui/gameTutorial.js`
