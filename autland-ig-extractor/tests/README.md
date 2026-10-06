# Testes do PATCHED 15.4

Todas as respostas do Instagram nestes testes são **simuladas**. Nenhum teste
faz consulta real ao Instagram. O ambiente onde rodaram não tem acesso ao
instagram.com nem à sessão do usuário. Resultado completo e a separação entre
real e simulado: `RESULTADOS-TESTES-15.4.txt`.

`EXT_DIR` é a pasta da extensão descompactada (o conteúdo do ZIP).

## Fixtures (`tests/fixtures/`)

Formas de **capturas públicas reais** de terceiros, anonimizadas por
`make-fixtures.py`: chaves, tipos e aninhamento ficam, todo valor pessoal é
trocado (e-mail, telefone, nome, usuário, ids, URLs, bio, endereço).

| Arquivo | Forma |
|---|---|
| `info-business.json` | `GET /api/v1/users/{id}/info/`, conta comercial, `public_email` preenchido |
| `info-creator.json` | mesma rota, conta de criador, `public_email` preenchido |
| `info-business-empty.json` | `info-business` com `public_email` vazio |
| `web-business-null.json` | `GET /api/v1/users/web_profile_info/` (a rota da 15.3): `business_email` nulo |

## 1. Unitários do parser e do leitor (45 testes)

```bash
EXT_DIR=/caminho/extensao ORIG_DIR=/caminho/extensao-v13 node --test tests/unit.test.js
```

`ORIG_DIR` aponta para o PATCHED 13 e serve só para comparar a extração de
telefone (regressão zero).

Cobrem:

- classificação do parser e os envelopes aceitos (`user`, `data.user`,
  `items[0].user`) com conferência do id;
- as formas reais anonimizadas: `/info/` traz `public_email`, a rota web traz
  `business_email` nulo;
- o leitor pede só a função compartilhada (`request`), sem `fetch` nem
  `web_profile_info`;
- HTTP 200 com e-mail, vazio, oculto, CALL/TEXT, bio ignorada, prioridade do e-mail;
- 429 (Retry-After numérico, data, ausente), zero consultas depois dele;
- 401, 403, 400, 5xx, rede, página de login, JSON inválido, envelope
  desconhecido: estados próprios, nada salvo como resultado;
- cache por user id (validade, outra aba, id ausente, id divergente, 404);
- duas leituras simultâneas do mesmo id e uma consulta de cada vez;
- intervalo adaptativo e a pausa salva sob trava.

## 2. Dados, fila, histórico e exportação (28 testes, Node)

```bash
EXT_DIR=/caminho/extensao [OLD_EXT_DIR=/caminho/extensao-15.3] node --test tests/node/data.test.js
```

Rodam o código real do dashboard e do popup em Node, com relógio virtual e
APIs do navegador simuladas. Cobrem, no modo Comment:

- a rota é `/users/{id}/info/`, 1 consulta por usuário, mesma chamada e mesmos
  cabeçalhos dos outros modos, nenhuma `web_profile_info`;
- lista inteira salva antes da 1ª consulta; 429 pausa com zero consultas a mais;
- 403, login, página HTML, rede e 5xx pausam, mostram o estado certo e, ao
  continuar, refazem só o perfil que falhou;
- perfis sem e-mail, CALL/TEXT e respostas vazias seguidas não param a fila;
  apagados (404) não pausam até 10 seguidos;
- comentário sem `user.pk`: usa outro campo de id; sem id nenhum, não consulta;
- cache entre extrações; quadro da 1ª resposta; "Validar 1 perfil pendente";
- fechar e reabrir: fila e cursor persistentes, nenhuma página relida;
- lista interrompida no meio; 320 comentaristas em 20 páginas;
- cursor repetido ou ausente; histórico antigo; linhas da rota antiga;
- **15.3 × 15.4:** com `OLD_EXT_DIR` apontando para a 15.3, o teste "a 15.3 não
  obtém o public_email" roda a mesma resposta anonimizada nas duas versões.

E, para todos os modos: filtro DJ, histórico sem e-mail da bio, perfil
renomeado, 404 e erro persistente, índice com dois dashboards e colunas das
exportações.

## 3. Ponta a ponta no Chromium (dashboard real)

```bash
NODE_PATH=$(npm root -g) tests/e2e/run-all.sh /caminho/extensao v154 saida/
# ou cenários avulsos:
NODE_PATH=$(npm root -g) node tests/e2e/run.js /caminho/extensao v154 validacao_inicial retomada_comment
```

Carrega a extensão descompactada no Chromium e opera o dashboard. Toda
requisição é interceptada:

- o backend Parse recebe respostas de teste;
- as listas e os perfis do Instagram recebem respostas simuladas;
- no Comment, `/users/{id}/info/` responde pelo `id` do comentarista e
  `web_profile_info` é proibida (qualquer chamada reprova);
- qualquer outro host é bloqueado e reprova o teste.

**Cenários do modo Comment:** `tipos_mistos`, `omitidos_profissionais`,
`retido_pela_web` (CALL com e-mail vazio), `validacao_inicial`,
`ritmo_padrao` (15–30 s), `comentarios_primeiro`, `cache_entre_extracoes`,
`pausa_compartilhada`, `primeiro_429[:segundos ≥ 60]`, `verificacao_429`,
`lista_sem_retry`, `prova_persistente`,
`falha_acesso:http403|html|negado|http503`, `identidade`,
`tres_indisponiveis`, `export_vazio`, `retomada_comment`, `pausa_1259_1313`,
`armazenamento_vazio_1313`.

**Cenários dos outros modos:** `seguidores`, `seguidores_429`,
`seguidores_pausa_salva`, `seguidores_falhas`, `seguindo`, `curtidas`,
`hashtag`, `local` (perfil 404), `lista`, `lista_inexistente`, `dj_filtro`.

Os cenários gravam `intervals: [10, 10]` para ficarem rápidos; só
`ritmo_padrao` usa o padrão do produto. Requer Playwright com Chromium e
`openpyxl` (leitura das abas XLSX). O `run-all.sh` roda até 5 navegadores por vez.

## 4. Atualização sem perder a pausa

```bash
NODE_PATH=$(npm root -g) node tests/e2e/storage-lifecycle.js /caminho/extensao-15.3 /caminho/extensao-15.4
```

Grava uma pausa e o contador de recusas na versão instalada e confere os dois
depois de Recarregar, de copiar os arquivos novos por cima e Recarregar, de
reiniciar o navegador e de carregar a mesma extensão de outra pasta.

## 5. Teste de mutação

```bash
python3 tests/mutate154.py /caminho/extensao-15.4 /caminho/extensao-13
```

Injeta 8 defeitos, um por vez, numa cópia da extensão (pausa de 429 ignorada,
falha lida como resultado, cache desligado, fila persistente ignorada,
prioridade do e-mail trocada, 3 indisponíveis pausando de novo, HTML de login
lido como "sem e-mail", rota web de volta ao Comment) e roda as suítes
unitária e de dados. Cada defeito precisa derrubar pelo menos um teste. O
resultado da 15.4 está em `tests/mutation-154.txt`: 8 de 8 detectados.
