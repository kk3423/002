# Autland IG Extractor — PATCHED 14 — Relatório

## Resultado

**A coleta do e-mail do botão Contato → E-mail não está validada.** Não houve
nenhuma consulta real ao Instagram nesta entrega.

## Por que não houve teste real

| Bloqueio | Evidência |
|---|---|
| A rede do ambiente bloqueia o Instagram | `CONNECT www.instagram.com:443` → HTTP 403 da política de saída. O mesmo vale para i.instagram.com, graph.instagram.com e facebook.com |
| Não há sessão do Instagram no ambiente | O teste exigiria seus cookies de login, que não estão disponíveis (e não devem ser compartilhados) |
| Não há navegador ligado ao seu computador | Nenhuma ferramenta de navegador conectada a esta sessão |

Pela regra do ambiente, um bloqueio de política não é contornado.

## O que substituiu o teste real: respostas reais de terceiros

Foram examinadas cerca de 75 respostas reais do Instagram que terceiros
publicaram em repositórios abertos. Nenhuma consulta foi feita à Meta.
Os achados passaram por verificação adversarial.

- `business_email` vem **nulo** em toda captura web de 2022 em diante. Isso
  vale inclusive para sessões logadas e para perfis comerciais que anunciam
  contato (ligar/mensagem). Capturas de 2019 e 2021 ainda traziam o e-mail.
- Nas capturas atuais, o e-mail público só aparece como `public_email` na API
  móvel `/users/{id}/info/`. Essa rota continua fora do modo Comment.
- O código web do próprio Instagram diz: *"Contact buttons are only visible
  on your profile in the Instagram mobile app."*
- Relatos públicos de setembro de 2026 descrevem a `web_profile_info`
  respondendo 429 já na primeira chamada para contas logadas. É o mesmo padrão
  do seu teste real na versão 13.

**Leitura honesta:** é provável que a rota permitida não entregue esse e-mail.
A v14 não tem como mudar isso. O que ela faz é provar o caso no primeiro uso
real, gastando poucas consultas.

## Testes

| Tipo | Real ou simulado | Resultado |
|---|---|---|
| Sintaxe (12 arquivos JS, manifest, locales) | n/a | OK |
| Unitários do parser e do leitor | **Simulado** (fetch falso) | 41/41 |
| Ponta a ponta: dashboard real no Chromium, storage e locks reais | **Simulado** (toda a rede interceptada) | 163/163 em 15 cenários |
| Linha de base da v13 no mesmo harness | **Simulado** | Reproduziu os 2 bugs de parada global |
| Parser contra formas de respostas reais de terceiros | Dados reais de terceiros, sem consulta | Classificação correta em todos os casos |
| Consulta ao Instagram | **Real** | **Nenhuma** (bloqueado) |

## Revisão adversarial

Foram confirmados e corrigidos 17 defeitos. Entre eles:

- O Iniciar ignorava a pausa salva por outra aba.
- A lista de comentários repetia sozinha após um 403.
- Um Retry-After curto encurtava uma pausa longa.
- A fila ficava em laço infinito quando pausava na última linha.
- O cache era duplicado entre a fila e a verificação manual.
- A prova real se perdia no log rotativo.
- Texto do Instagram era exibido como HTML.
- O rótulo "não entregue" aparecia em perfis sem contato anunciado.

## Mudança que afeta os outros modos

Conta **pessoal** com `public_email` residual deixa de ser coletada, porque
conta pessoal não tem botão Contato. Nenhuma outra diferença foi encontrada; o
telefone ficou idêntico em todos os casos testados.
