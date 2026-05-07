---
name: stitch-bypass
description: Contorna o erro "can't resolve reference #/$defs/ScreenInstance" do MCP stitch Google usando HTTP direto via curl
---

# Skill de Bypass — Google Stitch MCP

## Precedência

1. `AGENTS.md` (Constituição — maior prioridade)
2. Esta Skill (aplica-se apenas ao domínio de interação com Google Stitch)
3. Em caso de conflito → SEMPRE deferir ao `AGENTS.md`

## Problema Conhecido

O servidor MCP do Google Stitch (`stitch.googleapis.com/mcp`) retorna um JSON Schema inválido nas ferramentas `create_design_system_from_design_md` e `apply_design_system`: a referência `#/$defs/ScreenInstance` é usada mas não definida no `$defs` (só existe `SelectedScreenInstance`). O cliente MCP do opencode quebra ao validar o schema com o erro:

```
can't resolve reference #/$defs/ScreenInstance from id #
failed to get tools from client
```

Enquanto o Google não corrige o schema, use chamadas HTTP diretas via curl.

## Setup

```bash
export STITCH_API_KEY="$(cat ./secrets/stitch-api-key)"
export STITCH_PROJECT_ID="5884929533116366884"
```

Alias útil:
```bash
alias stitch='curl -s -X POST https://stitch.googleapis.com/mcp \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $STITCH_API_KEY"'
```

## Template Genérico

```bash
curl -s -X POST https://stitch.googleapis.com/mcp \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "TOOL_NAME",
      "arguments": { ... }
    }
  }'
```

## Ferramentas e Exemplos

### Projetos

| Ferramenta | Descrição | Exemplo |
|---|---|---|
| `create_project` | Cria novo projeto | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_project","arguments":{"title":"Novo Projeto"}}}'` |
| `get_project` | Detalhes de um projeto | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_project","arguments":{"name":"projects/'"$STITCH_PROJECT_ID"'"}}}'` |
| `list_projects` | Lista todos os projetos | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_projects","arguments":{}}}'` |

### Screens

| Ferramenta | Descrição | Exemplo |
|---|---|---|
| `list_screens` | Lista screens de um projeto | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_screens","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'"}}}'` |
| `get_screen` | Detalhes de uma screen | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_screen","arguments":{"name":"projects/'"$STITCH_PROJECT_ID"'/screens/SCREEN_ID","projectId":"'"$STITCH_PROJECT_ID"'","screenId":"SCREEN_ID"}}}'` |
| `generate_screen_from_text` | Gera screen por texto | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_screen_from_text","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","prompt":"Home page com hero e grid de cards"}}}'` |
| `edit_screens` | Edita screens existentes | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"edit_screens","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","selectedScreenIds":["SCREEN_ID"],"prompt":"Mudar cores para tema escuro"}}}'` |
| `generate_variants` | Gera variantes de screens | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"generate_variants","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","selectedScreenIds":["SCREEN_ID"],"prompt":"Versão mobile","variantOptions":{"count":3}}}'` |

### Design System

| Ferramenta | Descrição | Exemplo |
|---|---|---|
| `create_design_system` | Cria design system | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_design_system","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","designSystem":{"colorMode":"DARK","font":"SPACE_GROTESK","roundness":"ROUND_EIGHT"}}}}'` |
| `upload_design_md` | Envia DESIGN.md como base | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"upload_design_md","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","designMdBase64":"'"$(base64 -w0 DESIGN.md)"'"}}}'` |
| `list_design_systems` | Lista design systems | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_design_systems","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'"}}}'` |
| `update_design_system` | Atualiza design system | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"update_design_system","arguments":{"name":"projects/'"$STITCH_PROJECT_ID"'/designSystems/DS_ID","projectId":"'"$STITCH_PROJECT_ID"'","designSystem":{"colorMode":"LIGHT"}}}}'` |

### Ferramentas com Schema Quebrado (funcionam via curl)

| Ferramenta | Descrição | Exemplo |
|---|---|---|
| `create_design_system_from_design_md` | Cria DS a partir de DESIGN.md | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_design_system_from_design_md","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","selectedScreenInstance":{"screenId":"SCREEN_ID"}}}}'` |
| `apply_design_system` | Aplica DS a screens | `stitch -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"apply_design_system","arguments":{"projectId":"'"$STITCH_PROJECT_ID"'","selectedScreenInstances":[{"screenId":"SCREEN_ID"}],"assetId":"projects/'"$STITCH_PROJECT_ID"'/designSystems/DS_ID"}}}'` |

## Notas

- O bug é **exclusivamente no schema JSON-RPC** retornado pelo `tools/list` — as chamadas diretas via `tools/call` funcionam normalmente
- O `$STITCH_PROJECT_ID` acima é o projeto "Remix of CodeQuest – A Jornada dos Autômatos"
- Para obter `SCREEN_ID` e `DS_ID`, use `list_screens` e `list_design_systems`
- A API key usada é a mesma do `secrets/stitch-api-key`
