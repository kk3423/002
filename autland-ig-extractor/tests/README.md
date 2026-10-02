# Testes do PATCHED 14

Todas as respostas do Instagram nestes testes são **simuladas**. Nenhum teste
faz consulta real ao Instagram.

## Unitários (parser e leitor)

```bash
EXT_DIR=/caminho/extensao-v14 ORIG_DIR=/caminho/extensao-v13 node --test tests/unit.test.js
```

`ORIG_DIR` serve para comparar a extração de telefone com o PATCHED 13
(regressão zero).

## Ponta a ponta (dashboard real no Chromium)

Carrega a extensão descompactada no Chromium e opera o dashboard do modo
Comment. Toda requisição é interceptada: backend Parse, lista de comentários e
`web_profile_info` recebem respostas de teste; qualquer outro host é bloqueado
e registrado como falha.

```bash
NODE_PATH=$(npm root -g) node tests/e2e/run.js /caminho/extensao-v14 v14 \
  tipos_mistos omitidos_profissionais primeiro_429:120 primeiro_429 verificacao_429 \
  falha_acesso:http403 falha_acesso:redirect falha_acesso:html identidade tres_indisponiveis
```

Requer Playwright com Chromium. Rodar no máximo ~5 cenários por vez evita
contenção na abertura dos navegadores.
