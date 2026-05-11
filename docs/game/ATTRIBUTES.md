# ATTRIBUTES.md

## Sistema de Atributos

### Núcleo Lógico (`nucleoLogico`)

Controla quantas tentativas o jogador tem por fase. Cada erro (validação falha, execução incompleta, morte) consome uma tentativa.

| Nível | Tentativas por Fase |
| --- | --- |
| 1 | 5 |
| 2 | 6 |
| 3 | 7 |
| 4 | 8 |
| 5 | 10 |

### Eficiência de Algoritmo (`eficienciaAlgoritmo`)

Multiplicador de XP ganho ao concluir fases.

| Nível | Bônus de XP |
| --- | --- |
| 1 | ×1.0 |
| 2 | ×1.1 |
| 3 | ×1.2 |
| 4 | ×1.3 |
| 5 | ×1.5 |

### Nível do Personagem

O jogador possui um nível global que sobe com XP acumulado.

| Nível | XP Necessário |
| --- | --- |
| 1 | 0 |
| 2 | 150 |
| 3 | 350 |
| 4 | 600 |
| 5 | 900 |
| 6 | 1250 |
| 7 | 1700 |
| 8 (max) | 2200 |

Cada vez que o personagem sobe de nível, ganha **1 ponto de atributo** para gastar em Núcleo Lógico ou Eficiência de Algoritmo.

### Painel de Atributos

Exibido no `simulation-panel` acima do grid de simulação. Mostra:

- Avatar do herói
- Nível do personagem com barra de XP
- Nível atual de cada atributo
- Detalhes: tentativas restantes / bônus de XP atual
- Botão `+` para gastar ponto de atributo (só aparece se há pontos disponíveis e o atributo não está no máximo)
- Tooltip informativo ao passar mouse sobre o ícone `info`

### Implementação

- Definições: `js/game/attributes.js` (`AttributeSystem`)
- Progressão por jogador: `js/game/progression.js`
- Painel UI: `js/ui/attributesPanel.js`
