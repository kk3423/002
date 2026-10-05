#!/bin/bash
# Usage: tests/e2e/run-all.sh <extension dir> <label> <output dir>
# Runs every end-to-end scenario against the real dashboard in Chromium, 5 browsers
# at a time. Every Instagram response is SIMULATED; any other host is blocked.
set -u
DIR=$(cd "$(dirname "$0")" && pwd)
EXT=$(cd "$1" && pwd); LABEL=$2; OUT=$3
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
mkdir -p "$OUT"
batches=(
  "tipos_mistos omitidos_profissionais retido_pela_web pausa_compartilhada primeiro_429:300"
  "primeiro_429 verificacao_429 lista_sem_retry prova_persistente identidade"
  "falha_acesso:http403 falha_acesso:redirect falha_acesso:html tres_indisponiveis export_vazio"
  "seguidores seguidores_429 seguindo curtidas hashtag"
  "local lista lista_inexistente dj_filtro seguidores_pausa_salva"
  "retomada_comment seguidores_falhas"
)
i=0
for b in "${batches[@]}"; do
  i=$((i+1))
  timeout 1500 node "$DIR/run.js" "$EXT" "$LABEL" $b > "$OUT/batch$i.txt" 2>&1
  echo "lote $i: $(grep -c '^PASS' "$OUT/batch$i.txt") ok / $(grep -c '^FAIL' "$OUT/batch$i.txt") falhas  ($b)"
done
cat "$OUT"/batch*.txt | grep -E '^(PASS|FAIL)' > "$OUT/todas.txt"
echo "TOTAL: $(grep -c '^PASS' "$OUT/todas.txt") ok / $(grep -c '^FAIL' "$OUT/todas.txt") falhas"
