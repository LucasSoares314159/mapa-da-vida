#!/usr/bin/env bash
# Avisa quando um arquivo estrutural muda, para que o CLAUDE.md acompanhe.
# Entrada: JSON do hook em stdin. Saída: JSON com additionalContext, ou nada.
set -uo pipefail

payload=$(cat)
arquivo=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)
[ -z "$arquivo" ] && exit 0

# Caminho relativo à raiz do projeto
raiz=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
rel=${arquivo#"$raiz"/}

item=""
case "$rel" in
  app/*/page.tsx|app/page.tsx)
    item="Rota nova ou alterada → tabela **Rotas** e conferir o \`matcher\` do middleware." ;;
  app/*/route.ts)
    item="Endpoint de API novo → tabela **Rotas**." ;;
  lib/*.ts)
    item="Arquivo em \`/lib\` → tabela **/lib — onde vive cada regra**." ;;
  middleware.ts)
    item="Middleware alterado → conferir rotas protegidas e a coluna Auth na tabela **Rotas**." ;;
  types/index.ts)
    item="Tipos ou constantes globais → se virou fonte de verdade, aponte para ela em vez de duplicar a lista." ;;
  *.sql|SUPABASE_*.md)
    item="Migração de schema → **Modelo de dados**; se cria invariante (flag, unicidade, legado), documentar em *Invariantes*." ;;
  emails/*)
    item="Template de e-mail → tabela **E-mails**." ;;
  app/actions/*.ts)
    item="Server action nova → conferir se a feature precisa de seção própria." ;;
esac

[ -z "$item" ] && exit 0

jq -n --arg f "$rel" --arg i "$item" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("CLAUDE.md — arquivo estrutural alterado (" + $f + ").\n- " + $i + "\nRodar o checklist \"Manutenção deste arquivo\" no CLAUDE.md antes do commit final. Se nada mudou de fato para a documentação, seguir sem alterar.")
  }
}'
