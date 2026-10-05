# Testes do PATCHED 14

Todas as respostas do Instagram nestes testes são **simuladas**. Nenhum teste
faz consulta real ao Instagram, e o ambiente onde foram executados não tem
acesso ao instagram.com nem à sessão do usuário.

## Unitários (parser e leitor) — 41 testes

```bash
EXT_DIR=/caminho/extensao-v14 ORIG_DIR=/caminho/extensao-v13 node --test tests/unit.test.js
```

`ORIG_DIR` serve para comparar a extração de telefone com o PATCHED 13
(regressão zero).

Cobrem: classificação por perfil (encontrado / não entregue pela web / vazio /
oculto / omitido / conta pessoal / inválido), detecção de contato retido,
tipos de perfil, bloqueio de rota por campo omitido e por retenção, recusas
(429/400) que **não** bloqueiam a rota, 404 como resposta de perfil, migração
de schema antigo, cache compartilhado entre fila e verificação manual,
divergência de identidade, pausa com Retry-After e evidência mascarada.

## Ponta a ponta (dashboard real no Chromium) — 163 verificações

Carrega a extensão descompactada no Chromium e opera o dashboard do modo
Comment. Toda requisição é interceptada: backend Parse, lista de comentários e
`web_profile_info` recebem respostas de teste; qualquer outro host é bloqueado
e reprova o teste.

```bash
NODE_PATH=$(npm root -g) node tests/e2e/run.js /caminho/extensao-v14 v14 <cenários>
```

Cenários: `tipos_mistos`, `omitidos_profissionais`, `retido_pela_web`,
`pausa_compartilhada`, `primeiro_429[:segundos]`, `verificacao_429`,
`lista_sem_retry`, `prova_persistente`, `falha_acesso:http403`,
`falha_acesso:redirect`, `falha_acesso:html`, `identidade`,
`tres_indisponiveis`, `export_vazio`.

Requer Playwright com Chromium e `openpyxl` (leitura das abas XLSX). Rode no
máximo ~5 cenários por vez: cada um abre um Chromium.
