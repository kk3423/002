# Testes do PATCHED 15.3

Todas as respostas do Instagram nestes testes são **simuladas**. Nenhum teste
faz consulta real ao Instagram. O ambiente onde rodaram não tem acesso ao
instagram.com nem à sessão do usuário.

`EXT_DIR` é a pasta da extensão descompactada (o conteúdo do ZIP).

## 1. Unitários do parser e do leitor (54 testes)

```bash
EXT_DIR=/caminho/extensao ORIG_DIR=/caminho/extensao-v13 node --test tests/unit.test.js
```

`ORIG_DIR` aponta para o PATCHED 13 e serve só para comparar a extração de
telefone (regressão zero).

Cobrem:

- classificação por perfil: encontrado, vazio, oculto, omitido, conta
  pessoal, inválido;
- CALL/TEXT com e-mail nulo = "vazio" (nenhuma inferência de e-mail retido);
- perfis sem e-mail nunca param a fila (nem decisões salvas pela 14-15.2);
- pausa 429 com Retry-After, gravação da pausa sob trava, falhas de acesso;
- caminhos dos campos de e-mail recebidos, sem valores;
- cache persistente por nome + ID (validade, troca de dono, limite);
- intervalo adaptativo (429 dobra, 5 respostas reduzem, mínimo de 10 s).

Na 15.2, 14 destes 54 testes falham: são os comportamentos novos.

## 2. Dados, histórico e exportação (18 testes, Node)

```bash
EXT_DIR=/caminho/extensao node --test tests/node/data.test.js
```

Rodam o código real do dashboard e do popup em Node, com relógio virtual e
APIs do navegador simuladas. Cobrem:

- retomada do modo Comment, inclusive de históricos de versões antigas;
- lista de comentários inteira lida e salva antes da 1ª consulta de e-mail;
  um 429 preserva todos os comentaristas;
- perfil já consultado em outra extração: nenhuma nova consulta, e a linha
  do cache não espera o intervalo;
- perfis comerciais sem e-mail não param a fila;
- cursor de página repetido ou ausente encerra a lista (a extração conclui);
- retomada cuja lista falha no meio não apaga comentaristas já salvos;
- histórico sem duplicar e sem e-mail da bio, exportação do popup, filtro DJ,
  perfil 404, perfil renomeado, aba de sessão, índice com dois dashboards e
  colunas das exportações em todos os modos.

Na 15.2, os 6 testes novos falham.

## 3. Ponta a ponta no Chromium (dashboard real)

```bash
NODE_PATH=$(npm root -g) tests/e2e/run-all.sh /caminho/extensao v153 saida/
# ou cenários avulsos:
NODE_PATH=$(npm root -g) node tests/e2e/run.js /caminho/extensao v153 comentarios_primeiro cache_entre_extracoes
```

Carrega a extensão descompactada no Chromium e opera o dashboard. Toda
requisição é interceptada:

- o backend Parse recebe respostas de teste;
- as listas e os perfis do Instagram recebem respostas simuladas;
- qualquer outro host é bloqueado e reprova o teste.

**Cenários do modo Comment:** `tipos_mistos`, `omitidos_profissionais`
(fila não para; diagnóstico de 1 clique), `retido_pela_web` (CALL com e-mail
nulo = vazio, fila não para), `comentarios_primeiro` (lista paginada inteira
antes da 1ª consulta; 429 preserva a lista), `cache_entre_extracoes`,
`pausa_compartilhada`, `primeiro_429[:segundos ≥ 60]`, `verificacao_429`,
`lista_sem_retry`, `prova_persistente`, `falha_acesso:http403|redirect|html`,
`identidade`, `tres_indisponiveis`, `export_vazio`, `retomada_comment`,
`pausa_1259_1313`, `armazenamento_vazio_1313`.

**Cenários dos outros modos:** `seguidores`, `seguidores_429`,
`seguidores_pausa_salva`, `seguidores_falhas`, `seguindo`, `curtidas`,
`hashtag`, `local` (perfil 404), `lista`, `lista_inexistente`, `dj_filtro`.

Requer Playwright com Chromium e `openpyxl` (leitura das abas XLSX). O
`run-all.sh` roda até 5 navegadores por vez.

## 4. Atualização sem perder a pausa

```bash
NODE_PATH=$(npm root -g) node tests/e2e/storage-lifecycle.js /caminho/extensao-15.2 /caminho/extensao-15.3
```

Grava uma pausa e o contador de recusas na versão instalada e confere os dois
depois de Recarregar, de copiar os arquivos novos por cima e Recarregar, de
reiniciar o navegador e de carregar a mesma extensão de outra pasta.
