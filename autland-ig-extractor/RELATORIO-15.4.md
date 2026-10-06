# Autland IG Extractor — PATCHED 15.4 — Relatório

## Resultado

**Implementação concluída, mas não validada em resposta real.**

- O modo Comment agora consulta `GET /api/v1/users/{id}/info/` pela mesma função
  dos outros modos e lê o e-mail em `public_email`.
- Todos os testes passaram, mas todos usam respostas simuladas. Falta uma única
  validação real, que a própria extensão mostra na tela (seção 6).
- Eu não afirmo que está funcionando. Os seus 3 testes reais anteriores pegaram
  HTTP 429, e nenhum deles chegou a esta rota.

## 1. Causa

| Fato | Evidência |
|---|---|
| O Comment perguntava `web_profile_info`, que entrega o e-mail em `data.user.business_email` | Código da 15.3 |
| Esse campo veio **nulo em 11 de 11** respostas reais de terceiros guardadas (9 comerciais, 2 criadores, com botão CALL/TEXT) | **Real, de terceiros** |
| O e-mail está em `user.public_email` de `/users/{id}/info/`: **3 de 3** respostas reais guardadas (2 comerciais, 1 criador) | **Real, de terceiros** |
| Nos seus 3 testes (12:59, 13:13, 14:16:38) a 1ª consulta de perfil recebeu HTTP 429 e nenhuma resposta de perfil chegou | **Real**: seus prints |
| A 15.3 era só diagnóstico e manteve a rota web | Relatório da 15.3 |

## 2. Versões antigas e função identificada

**Busca:** PATCHED 8, 9, 10, 11 e 12 **não existem** neste ambiente. Procurei no
repositório e em todas as refs do git, nos anexos da conversa, em
`/mnt/user-data`, `/mnt/attach`, Desktop, Downloads e Lixeira, e em todo o
sistema de arquivos por `.zip`, `.crx` e nomes `autland`/`patched`. O único código antigo
é o **PATCHED 13** (o anexo de 02/10). Desktop, Downloads e Lixeira ficam na sua
máquina, não neste container. Pela sua regra, usei a função de `/users/{id}/info/`
que já existe nos outros modos, sem criar uma segunda implementação.

Comparação PATCHED 13 × 15.3 × 15.4 da função compartilhada:

| Item | Resultado |
|---|---|
| Função | Chamada `m.a.get(...)` no ramo "não Comment" de `loadUserInfoDetail`. Idêntica no PATCHED 13 e na 15.3. Na 15.4 virou o método único `requestUserInfoDetail`, usado por **todos** os modos |
| Endpoint | `GET https://www.instagram.com/api/v1/users/${@}$/info/` (config `ApiUserInfoDetail`; mesmo padrão nas 3 versões). A config original vem do servidor do fornecedor e não está acessível aqui |
| Cabeçalhos | `x-ig-app-id: 936619743392459`, `x-asbd-id: 129477`, `x-csrftoken` e `x-ig-www-claim` da sua sessão, `accept`, `accept-language`, `x-requested-with`. Construtor idêntico nas 3 versões (conferido por hash) |
| Credenciais | `withCredentials: true` no axios (cookies da sessão). Nenhum `fetch` próprio |
| Origem do `user_id` | `user.pk` do comentário (`user.pk_id`, `user.id` e `user_id` como alternativas). Sem id, usa uma resposta já salva; nunca outra rota |
| Resposta | `{ user: {...}, status: "ok" }` |
| Caminho do e-mail | `data.user.public_email` no axios, que é `user.public_email` no corpo |
| Erros nos outros modos (PATCHED 13) | 401/403 pausam com aviso de sessão; 302 pede novo login; 429 pausa e salva a pausa. A 15.x acrescentou 404 → "Perfil indisponível" e 1 nova tentativa por erro passageiro |
| Intervalo | Configuração `intervals`: 15–30 s aleatório, mínimo 10 s. O PATCHED 13 usava 10–15 s só no Comment; a 15.4 volta ao padrão dos outros modos |

## 3. O que mudou

| # | Antes (15.3) | Agora (15.4) |
|---|---|---|
| 1 | Comment: `web_profile_info`, e-mail em `business_email` (nulo) | Comment: `/users/{id}/info/` pela função única, e-mail em `public_email` |
| 2 | Comentário → consulta por @nome | Comentário → `user_id` → 1 consulta (metade das consultas) |
| 3 | Classificação própria do leitor para a rota web | Parser só nos envelopes `user`, `data.user` e `items[0].user`, com o id conferido |
| 4 | Estados misturados com textos antigos | 7 estados: `email_found`, `no_public_email`, `rate_limited`, `login_required`, `access_denied`, `temporary_error`, `pending`. Mais `profile_unavailable` para conta apagada (404) |
| 5 | — | Só HTTP 200 com o perfil real vira "sem e-mail". Falha nunca é salva como resultado |
| 6 | Fila em memória; a retomada relia as páginas | Fila e cursor da lista salvos juntos após cada página. A retomada continua do ponto salvo |
| 7 | Cache por @nome | Cache por `user_id` (14 dias com e-mail, 7 sem e-mail, 3 para indisponível) |
| 8 | Intervalo de 10–15 s | 15–30 s (padrão dos outros modos). Cada 429 dobra o intervalo, até 2 min |
| 9 | "Verificar 1 perfil" pedia um @perfil | "Validar 1 perfil pendente" faz 1 consulta e mostra o quadro. O primeiro resultado real de cada execução também abre o quadro |
| 10 | 3 perfis indisponíveis seguidos pausavam a fila | Pausa só com 10 seguidos (indício de sessão ruim). Perfil sem e-mail, CALL/TEXT e respostas vazias nunca param a fila |

**Preservado:** 429 com pausa imediata, Retry-After, 60 min quando ausente, pausa
salva e compartilhada, nenhuma consulta durante a pausa, nenhuma repetição
automática, 1 consulta por vez, chave do manifesto e ID da extensão. Sem proxy,
troca de IP, rotação de conta, cliente móvel falso, cookies copiados ou token
externo.

## 4. Testes — real x simulado

| Bateria | Tipo | Resultado |
|---|---|---|
| Seus testes de 05/10 (versões 15, 15.1 e 15.2) | **Real** | 3 consultas de perfil, 3 × HTTP 429. Nenhuma resposta de perfil. Nenhuma ao `/users/{id}/info/` |
| Consulta ao Instagram a partir deste ambiente | **Real** | **Nenhuma**: a rede bloqueia o instagram.com e não há sessão sua aqui |
| Unitários do parser e do leitor | Simulado | **45 de 45 passam** |
| Dados, fila e exportação (código real do dashboard em Node) | Simulado | **28 de 28 passam** (inclui o teste de contraste com a 15.3 carregada) |
| Ponta a ponta no Chromium, todos os modos | Simulado | **413 verificações OK, 0 falhas**, em 34 cenários (7 lotes), sobre o ZIP extraído |
| Mesma resposta anonimizada: 15.3 falha, 15.4 passa | Simulado | 15.3: `['', '', '']`. 15.4: os 3 e-mails. As mesmas suítes na 15.3: unitários 18 de 45 passam, dados 7 de 28 passam |
| Atualização 15.3 → 15.4 mantendo a pausa e o contador | Simulado | pausa e contador mantidos em Recarregar, arquivos novos por cima, reinício do Chrome e outra pasta. A remoção da extensão não pôde ser testada sem tela |
| Revisão independente do diff por um agente | n/a | **Não concluída**: o agente parou duas vezes pelo limite de gasto da organização. No lugar: a minha revisão do diff (achou 1 defeito, retomar uma fila já concluída ficava esperando; corrigido com teste) e um teste de mutação com **8 de 8** defeitos injetados detectados (`RESULTADOS-TESTES-15.4.txt`, seção 10) |

As fixtures são as **formas** de capturas públicas reais, anonimizadas
(`tests/fixtures/make-fixtures.py`): chaves, tipos e aninhamento preservados e
valores pessoais trocados. Os 17 testes obrigatórios e onde cada um está:
`RESULTADOS-TESTES-15.4.txt`, seção 8.

## 5. Conferências

| Item | Resultado |
|---|---|
| SHA-256 do ZIP | `d3dee3e18bc8930f1699393712e32916a8b2a2029acbe29c1c7482f8dcc95585` |
| Sintaxe dos 12 arquivos JavaScript (`node --check`) e do JSON | OK |
| Chave do manifesto e ID da extensão | Preservados: `icceojeancmncflpknhmfbfaleindgmi` (chave idêntica à da 15.3; só `version_name` mudou) |
| Arquivos alterados | `dashboard.js`, `commercial-profile-reader.js`, `public-contact-parser.js`, `request-pacing.js`, `manifest.json` (só `version_name`), `LEIA-ME.txt`, `PATCH_NOTES.txt`. Os outros 27 são idênticos |
| 15.3 | Preservada: o ZIP e o relatório continuam no repositório |

## 6. Atualizar e validar

**Atualizar (sem remover a extensão e sem apagar o armazenamento):**
1. Feche os dashboards e extraia o ZIP inteiro.
2. Copie todos os arquivos por cima da pasta instalada.
3. Em `chrome://extensions`, clique em **Recarregar**. Não remova a extensão.

**Validar (um clique):** no modo Comment, clique em **Iniciar**. A lista é lida e
salva. A primeira resposta real abre o quadro:
- `email_found` com `public_email: texto`: a coleta funciona e a fila segue sozinha.
- `no_public_email` para um perfil que no app mostra Contato → E-mail: envie o print do quadro.
- HTTP 429: a pausa é respeitada e nada mais sai até o horário.

Se uma pausa de 429 estiver salva, aguarde o horário mostrado na tela.

## 7. Limites que continuam

- **Não há prova real** de que o Instagram entrega `public_email` para a sua conta nesta
  rota hoje. O formato vem de capturas de terceiros.
- **O 429 pode continuar.** Esta rota pode ter o mesmo limite da outra. A extensão respeita
  o limite e gasta metade das consultas, mas não promete vencê-lo.
- **Ritmo mais lento:** 15–30 s por perfil. Um post com 300 comentaristas leva cerca de 2 horas
  de consultas, mais a leitura da lista.
- **Remover a extensão apaga a fila, o cache e a pausa salva.** Não remova.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `Autland-IG-Extractor-PATCHED-15.4.zip` | Extensão completa (34 arquivos), com `LEIA-ME.txt` e `PATCH_NOTES.txt` |
| `PATCHED-15.4-src/` | Código-fonte correspondente (o ZIP extraído) |
| `diffs/PATCH-15.3-para-15.4.diff` | Diferenças completas 15.3 → 15.4 (7 arquivos) |
| `RESULTADOS-TESTES-15.4.txt` | Saída completa dos testes, real e simulado separados |
| `tests/` | Testes unitários, de dados e ponta a ponta, mais as fixtures anonimizadas |
