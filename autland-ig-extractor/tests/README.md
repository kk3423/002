# Testes do PATCHED 15.1

Todas as respostas do Instagram nestes testes são **simuladas**. Nenhum teste
faz consulta real ao Instagram. O ambiente onde rodaram não tem acesso ao
instagram.com nem à sessão do usuário.

`EXT_DIR` é a pasta da extensão descompactada (o conteúdo do ZIP).

## 1. Unitários do parser e do leitor (41 testes)

```bash
EXT_DIR=/caminho/extensao ORIG_DIR=/caminho/extensao-v13 node --test tests/unit.test.js
```

`ORIG_DIR` aponta para o PATCHED 13 e serve só para comparar a extração de
telefone (regressão zero).

Cobrem a classificação por perfil (encontrado / não entregue pela web / vazio /
oculto / omitido / conta pessoal / inválido), o contato retido, o bloqueio da
rota, as recusas 429/400 que não bloqueiam, o 404, a migração de schema, o
cache, a divergência de identidade, a pausa com Retry-After e a evidência
mascarada.

## 2. Dados, histórico e exportação (12 testes, Node)

```bash
EXT_DIR=/caminho/extensao node --test tests/node/data.test.js
```

Rodam o código real do dashboard e do popup em Node, com relógio virtual e
APIs do navegador simuladas. Cobrem:

- retomada do modo Comment, inclusive de históricos de versões antigas;
- histórico sem duplicar e sem e-mail da bio;
- exportação do popup;
- filtro DJ;
- perfil 404 e erro persistente;
- perfil renomeado;
- aba de sessão;
- índice do histórico com dois dashboards;
- colunas das exportações em todos os modos.

No PATCHED 14, 10 destes 12 testes falham. Eles reproduzem os defeitos
corrigidos.

## 3. Ponta a ponta no Chromium (dashboard real)

```bash
NODE_PATH=$(npm root -g) tests/e2e/run-all.sh /caminho/extensao v15 saida/
# ou cenários avulsos:
NODE_PATH=$(npm root -g) node tests/e2e/run.js /caminho/extensao v15 tipos_mistos curtidas
```

Carrega a extensão descompactada no Chromium e opera o dashboard. Toda
requisição é interceptada:

- o backend Parse recebe respostas de teste;
- as listas e os perfis do Instagram recebem respostas simuladas;
- qualquer outro host é bloqueado e reprova o teste.

**Cenários do modo Comment:** `tipos_mistos`, `omitidos_profissionais`,
`retido_pela_web`, `pausa_compartilhada`, `primeiro_429[:segundos ≥ 60]`,
`verificacao_429`, `lista_sem_retry`, `prova_persistente`,
`falha_acesso:http403|redirect|html`, `identidade`, `tres_indisponiveis`,
`export_vazio`, `retomada_comment`.

**Cenários dos outros modos:** `seguidores`, `seguidores_429`,
`seguidores_pausa_salva`, `seguidores_falhas`, `seguindo`, `curtidas`,
`hashtag`, `local` (perfil 404), `lista`, `lista_inexistente`, `dj_filtro`.

Requer Playwright com Chromium e `openpyxl` (leitura das abas XLSX). O
`run-all.sh` roda até 5 navegadores por vez.
