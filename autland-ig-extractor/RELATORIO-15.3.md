# Autland IG Extractor — PATCHED 15.3 — Relatório

## Resultado

**A coleta do e-mail de "Contato → E-mail" no modo Comment NÃO está restaurada.
A 15.3 não foi validada em resposta real.**

- A 15.3 é uma versão de diagnóstico, não a correção final. Ela muda a fila e
  a classificação do e-mail e traz o diagnóstico de 1 clique (seção 3).
- O campo que preenchia o e-mail vem de outra consulta. Ela continua fora do
  modo Comment pela sua regra (seções 2 e 6).

## 1. Por que a 15.2 falhou

| # | Causa | Evidência |
|---|---|---|
| 1 | Nos seus 3 testes (12:59, 13:13 e 14:16:38), a 1ª consulta de perfil recebeu **HTTP 429**. Nenhuma resposta de perfil chegou | **Real**: seus prints |
| 2 | Mesmo sem o 429, a consulta do Comment não traz o e-mail. `web_profile_info` entrega o e-mail em `data.user.business_email`, que veio **nulo em 11 de 11** respostas reais guardadas aqui | **Real, de terceiros**: ~75 respostas examinadas; todas as de 2022 em diante vêm nulas |
| 3 | A 15.2 rotulava CALL/TEXT com e-mail nulo como "e-mail não entregue pela consulta web". Era uma inferência, e 3 perfis assim encerravam a fila | Código da 15.2 |
| 4 | A lista de comentários e as consultas de e-mail rodavam juntas. Um 429 na consulta de e-mail pausava também a leitura da lista | Código da 15.2. **Real**: às 12:59 a lista parou em 47 perfis num post com 733 comentários, no momento do 429 |

## 2. Onde o e-mail aparecia antes

O ZIP anterior ao PATCHED 13, que coletava o e-mail, não está disponível aqui.
Por isso não há comparação arquivo a arquivo com ele. A comparação vem de duas
fontes: o código da própria 15.2, que ainda usa `/users/{pk}/info/` nos outros
modos, e as notas do PATCHED 13, que registram a troca no Comment. A
configuração original das consultas vem do servidor do fornecedor da extensão
e não está acessível aqui. A coluna da esquerda foi confirmada só com
respostas simuladas.

| | Fluxo que preenchia o e-mail | Modo Comment na 15.2 e na 15.3 |
|---|---|---|
| Requisição | `GET https://www.instagram.com/api/v1/users/{pk}/info/` | `GET https://www.instagram.com/api/v1/users/web_profile_info/?username={usuário}` |
| No código | config `ApiUserInfoDetail` (`/api/v1/users/${@}$/info/`), ramo "não Comment" de `loadUserInfoDetail` | `case 4` troca a rota; leitor `commercial-profile-reader.js` |
| Campo (caminho JSON) | `user.public_email` (no código: `data.user.public_email`) | `data.user.business_email` (`public_email` não existe nessa resposta) |
| Respostas reais guardadas | 3 de 3 com `public_email` preenchido (2 comerciais, 1 criador) | 11 de 11 com `business_email` nulo (9 comerciais, 2 criadores; `business_contact_method` CALL ×6, TEXT ×1, UNKNOWN ×4) |
| Onde está na 15.3 | Seguidores, Seguindo, Curtidas, Hashtag, Local e Lista | Única rota do Comment |

Outros pontos das respostas reais:
- **Outros campos:** nenhuma traz `contact_email` nem e-mail dentro de objeto
  aninhado.
- **Contas pessoais:** nenhuma resposta guardada é de conta pessoal. Elas não
  têm botão Contato.
- **Histórico do Comment, pelas notas do PATCHED 13 (ordem inferida):**
  `/users/{id}/info/` → consulta GraphQL sem campo de e-mail →
  `web_profile_info` (do PATCHED 13 até a 15.3).

## 3. O que a 15.3 muda

| # | Antes (15.2) | Agora (15.3) |
|---|---|---|
| 1 | A consulta de e-mail começava com a lista incompleta, e um 429 parava a lista | A lista inteira é lida e salva antes da 1ª consulta. Um 429 não apaga nem corta comentaristas |
| 2 | CALL/TEXT com e-mail nulo virava "e-mail não entregue pela consulta web" | Vira "Campo comercial vazio" |
| 3 | 3 perfis sem o campo, ou "retidos", encerravam a fila | Perfil sem e-mail nunca para a fila. Só falha de acesso pausa (429, 403, login, rede) |
| 4 | Cache só dentro da página | Cache salvo por nome + ID: 14 dias, ou 3 dias para perfil indisponível, até 3000 perfis. Sem nova consulta entre extrações, e a linha do cache não espera os 10 s |
| 5 | Intervalo fixo de 10 s | Base de 10 s. Cada 429/400 dobra o intervalo (até 2 min); 5 respostas seguidas reduzem 20% |
| 6 | "Verificar 1 perfil" mostrava só o status | Quadro com rota, HTTP, Retry-After, caminhos dos campos de e-mail recebidos (sem valores) e resultado. Nenhum cookie, token ou valor pessoal |
| 7 | Um cursor de página repetido deixava a extração sem fim | Página sem cursor novo encerra a lista, e as consultas de e-mail começam |
| 8 | O histórico local guardava só os perfis já consultados | Guarda todos os comentaristas listados, também numa retomada que pare no meio |

**Preservado:**
- 429, Retry-After, pausa salva e nenhuma repetição automática;
- 1 consulta por vez e mínimo de 10 s;
- cabeçalhos e cookies da consulta;
- `/users/{id}/info/` fora do Comment;
- bio nunca vira e-mail.

A pausa e o contador sobrevivem à atualização da 15.2 para a 15.3 (testado).

**Única parada por perfil que ficou:** 3 perfis seguidos indisponíveis ou
divergentes pausam a fila para você conferir a sessão. Isso pode indicar sessão
expirada e não tem relação com e-mail.

## 4. Testes — real x simulado

| Bateria | Tipo | Resultado |
|---|---|---|
| Seus testes: 12:59 (15), 13:13 (15.1) e 14:16:38 (15.2) | **Real** | 3 consultas de perfil e 3 respostas HTTP 429. Nenhuma resposta de perfil. A lista de comentários carregou (47 e 87 perfis). Pausa de 60 min, nada repetido |
| Consulta ao Instagram a partir deste ambiente | **Real** | **Nenhuma**: a rede bloqueia o instagram.com e não há sessão sua aqui |
| Unitários do parser e do leitor | Simulado | **54 de 54 passam**. Na 15.2, 40 de 54: os 14 que falham são os comportamentos novos |
| Dados, histórico e exportação (Node) | Simulado | **18 de 18 passam**. Na 15.2, 12 de 18: os 6 que falham são os comportamentos novos |
| Ponta a ponta no Chromium, todos os modos | Simulado | **379 verificações OK, 0 falhas, em 31 cenários.** Rodou sobre o build cujo código é idêntico ao do ZIP final (só `LEIA-ME.txt` e `PATCH_NOTES.txt` diferem) |
| Atualização da 15.2 para a 15.3 sem perder a pausa | Simulado | Pausa e contador mantidos (Recarregar, arquivos novos por cima, reinício do Chrome, outra pasta). A remoção da extensão não pôde ser testada sem tela |
| Revisão independente do diff por um agente | n/a | **Não concluída**: o agente parou por limite de uso da organização. A minha revisão adversarial achou 2 defeitos (itens 7 e 8 da seção 3), corrigidos com teste que falha no build anterior |

## 5. Evidência pedida

| Item | Situação |
|---|---|
| Perfil que mostra Contato → E-mail | **não validado em resposta real** |
| E-mail exato aparecendo na extensão | **não validado em resposta real** |
| Perfil sem e-mail exibido como vazio ou indisponível | Só simulado |
| Endpoint | Comment: `web_profile_info`. Fluxo antigo: `/users/{pk}/info/` |
| Status HTTP | Real: 429 nas 3 consultas |
| Caminho JSON | Antigo: `user.public_email`. Atual: `data.user.business_email`, nulo nas respostas de terceiros |
| Número de consultas reais | 3, todas com 429. Nenhuma a partir deste ambiente |
| Comportamento no 429 | Real: pausa de 60 min sem repetição (seus prints). Simulado: Retry-After, pausa salva e zero consultas durante a pausa |

## 6. O que impede a coleta

- **Não há bloqueio técnico de extensão Chrome.** O código da própria
  extensão já chama `/users/{id}/info/` nos outros modos. Isso não foi testado
  em resposta real aqui.
- **O bloqueio é de regra.** Sua regra exclui essa rota do modo Comment.
  Quando tentei nesta sessão uma opção desligada por padrão para ela, a
  política de segurança do ambiente bloqueou a alteração. Por isso ela não
  está na 15.3.
- **Sem prova real a partir daqui.** Não consigo mostrar uma resposta real do
  Instagram: a rede deste ambiente bloqueia o instagram.com.

**Próximo passo recomendado (1 clique, 1 consulta):** depois da pausa, abra
o modo Comment, digite um @perfil que no app mostra Contato → E-mail e clique
em "Verificar 1 perfil". O quadro mostra o resultado:
- **HTTP 200 com `data.user.business_email=null`:** fica provado, com resposta
  real, que esta rota não entrega o campo.
- **HTTP 200 com o campo preenchido e "Contato público do Instagram":** a
  coleta está comprovada.

**Decisão que fica com você.** A única rota com e-mail nas respostas reais é
`/users/{id}/info/`, e o modo Comment a exclui por regra sua. Não alterei essa
regra e não contornei o bloqueio do ambiente. Se quiser reconsiderá-la, a
decisão é sua e precisa ser explícita, e a mudança também depende de o
ambiente permitir. Não há garantia de que essa rota escape do 429.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `Autland-IG-Extractor-PATCHED-15.3.zip` | Extensão completa (34 arquivos), com `LEIA-ME.txt` e `PATCH_NOTES.txt` |
| `diffs/PATCH-15.2-para-15.3.diff` | Diferenças da 15.2 para a 15.3 (6 arquivos) |
| `RESULTADOS-TESTES.txt` | Saída completa dos testes, separando real e simulado |
| `LEIA-ME.txt` e `PATCH_NOTES.txt` | Dentro do ZIP: instalação e lista de mudanças |
| `tests/` | Testes unitários, de dados e ponta a ponta |
