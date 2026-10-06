#!/bin/bash
# Usage: tests/e2e/run-final.sh <extension dir> <label> <output dir> [parallel=4] [scenario...]
# Runs the final suite (final.js + lifecycle.js), one process per scenario, N browsers at a time.
# Every Instagram response is SIMULATED; any other host is blocked. Needs Playwright with Chromium,
# python3 + openpyxl (XLSX reading) and, for the update scenarios, OLD153_DIR / OLD154_DIR
# (the folders of PATCHED 15.3 / 15.4 as they were installed).
set -u
DIR=$(cd "$(dirname "$0")" && pwd)
EXT=$(cd "$1" && pwd); LABEL=$2; OUT=$3; PAR=${4:-4}; shift $(( $# < 4 ? $# : 4 ))
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
export E2E_STREAM=1
export E2E_SAVE_DIR="$OUT/arquivos-exportados"
mkdir -p "$OUT" "$E2E_SAVE_DIR"
if [ $# -gt 0 ]; then LIST=("$@"); else LIST=(
  pacote_carga matriz:comment matriz:seguidores matriz:seguindo matriz:hashtag matriz:curtidas matriz:local matriz:lista
  botoes_comment quadro_janelas dj_exportacao popup_iniciar dialogo_continuar_recomecar dedup fechar_reabrir recarregar_extensao todos_429 erros_http
  atualizacao_153 atualizacao_154
); fi
running=0
for s in "${LIST[@]}"; do
  f="$OUT/$(echo "$s" | tr ':' '_').txt"
  ( timeout 2400 node "$DIR/final.js" "$EXT" "$LABEL" "$s" > "$f" 2> "$f.live"; echo "$s: $(grep -c '^PASS' "$f") ok / $(grep -c '^FAIL' "$f") falhas" ) &
  running=$((running+1))
  if [ "$running" -ge "$PAR" ]; then wait -n; running=$((running-1)); fi
done
wait
cat "$OUT"/*.txt | grep -E '^(PASS|FAIL)' > "$OUT/todas.txt"
echo "TOTAL: $(grep -c '^PASS' "$OUT/todas.txt") ok / $(grep -c '^FAIL' "$OUT/todas.txt") falhas"
