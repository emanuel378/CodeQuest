# AUDIO.md

## Sistema de Áudio

### Gerenciamento

O `AudioManager` (`js/audio/audioManager.js`) gerencia música de fundo e efeitos sonoros.

### Músicas por Tema

Cada tema visual do nível possui sua própria música (loop infinito):

| Tema | Arquivo | Volume |
| --- | --- | --- |
| `ocean` | `assets/sounds/Music/Cidade do código/Cidade_do_codigo.mp3` | 0.3 |
| `forest` | `assets/sounds/Music/Floresta dos Algoritmos/FlorestaAlgoritmosTeste.mp3` | 0.3 |
| `void` | `assets/sounds/Music/Núcleo Logicron/nucleo_logicron.mp3` | 0.3 |

### Efeitos Sonoros (SFX)

| Nome | Arquivo(s) | Volume | Quando Toca |
| --- | --- | --- | --- |
| `snap` | `block_1.mp3`, `block_2.mp3` (aleatório) | 0.5 | Bloco encaixado no workspace |
| `error` | `erro_1.mp3`, `erro_2.mp3` (aleatório) | 0.5 | Erro de validação, dano no jogador |
| `execute` | `exec.mp3` | 0.5 | Início da execução dos comandos |
| `victory` | `vitoria.mp3` | 0.5 | Fase concluída com sucesso |

### Comportamento

- **Unlock**: áudio é "destravado" no primeiro clique/tecla/toque do usuário (requisito de autoplay dos navegadores)
- **Troca de página**: `fadeOut(500ms)` ao sair da página `/game`
- **Mute**: botão `btn-mute` no header alterna estado mudo; ícone muda entre `volume_up` e `volume_off`
- **Música**: `playMusic(theme)` para a música anterior e inicia a do tema; `stopMusic()` pausa e reseta
- **SFX**: `playSfx(name)` toca uma vez (clona nó para permitir sobreposição)

### Arquivos de Áudio

```
assets/sounds/
  Music/
    Cidade do código/Cidade_do_codigo.mp3
    Floresta dos Algoritmos/FlorestaAlgoritmosTeste.mp3
    Núcleo Logicron/nucleo_logicron.mp3
  SFX/
    Blocos (snap)/block_1.mp3
    Blocos (snap)/block_2.mp3
    Erro de lógica/erro_1.mp3
    Erro de lógica/erro_2.mp3
    Execução de Código (executar)/exec.mp3
    Vitória/vitoria.mp3
```

### Implementação

- Gerenciador: `js/audio/audioManager.js`
- Orquestração: `app.js` (troca de música por nível, mute, unlock)
