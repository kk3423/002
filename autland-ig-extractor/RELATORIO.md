# Autland IG Extractor — PATCHED 15 — Relatório

## Resultado

| Parte | Situação |
|---|---|
| Modos Seguidores, Seguindo, Hashtag, Curtidas, Local e Lista | Corrigidos e validados de ponta a ponta, com respostas **simuladas** |
| Histórico, retomada e exportações (todos os modos) | Corrigidos e validados, com respostas **simuladas** |
| Modo Comment: e-mail do botão Contato → E-mail | **Não comprovado.** Não houve nenhuma consulta real ao Instagram |

Para usar, basta instalar. As instruções estão no `LEIA-ME.txt`, dentro do ZIP.

## O que foi corrigido nesta versão

| # | Problema encontrado | Efeito antes | Agora |
|---|---|---|---|
| 1 | Comment: o histórico contava comentaristas **listados** como extraídos | Ao retomar depois de um 429, a extensão pulava quem nunca foi consultado. Na simulação foram 98 de 150; com o 429 na 1ª consulta, eram todos | Conta só perfis consultados. A retomada pula exatamente os já salvos. Contagens de versões antigas não são usadas |
| 2 | Comment: o fim da lista marcava o histórico como "concluído" | O histórico ficava "concluído" com consultas pendentes | Só conclui quando todos foram consultados |
| 3 | Histórico com linhas antigas de e-mail tirado da bio | A exportação pelo Histórico do popup ainda saía com esses e-mails | Linhas antigas são limpas ao retomar. O popup aplica a mesma regra e exporta "E-mail comercial" e "Status do e-mail" |
| 4 | Retomada duplicava linhas | O mesmo perfil aparecia duas vezes no histórico | Um registro por perfil |
| 5 | Filtro DJ decidia o que era salvo e quando terminava | Com o filtro ligado, a extração nunca concluía e perfis sumiam do histórico | O filtro só afeta a tabela e a exportação |
| 6 | Perfil apagado (HTTP 404) nos outros modos | O perfil era consultado de novo, abria uma aba do Instagram e a extração nunca concluía | Vira "Perfil indisponível" e a fila segue. Com 3 seguidos, a fila pausa |
| 7 | Contador de erros nunca zerava | Depois de 2 erros em qualquer ponto da extração, nenhum perfil ganhava mais nova tentativa | 1 nova tentativa por perfil. Se o erro persistir, a linha mostra a falha e a extração conclui |
| 8 | Perfil renomeado entre a lista e o detalhe | Perdia o e-mail comercial ("Campo omitido") | É reconhecido pelo id e mantém o e-mail |
| 9 | Lista de @perfis com nome inexistente | Gerava consulta com id vazio (`/users//info/`) | Vira "Perfil indisponível", sem consulta inválida |
| 10 | Aba de sessão do instagram.com | No Comment, com 100, 200… comentaristas, abria uma aba a **cada** perfil | No máximo 1 aba a cada 100 perfis processados |
| 11 | Pausa 429 salva por outro dashboard | Os outros modos ficavam parados até você clicar | Continuam sozinhos no fim da pausa. O Comment segue esperando o Iniciar |
| 12 | Dois dashboards abertos | Um sobrescrevia o índice do histórico do outro, e a limpeza de 190 dias podia apagar histórico em uso | Gravação com trava e releitura do índice |
| 13 | Texto de erro do Instagram nos avisos | Era exibido como HTML | Exibido como texto puro |

As regras de 429 foram preservadas sem nenhuma mudança:

- pausa compartilhada e salva pelo Retry-After, com 60 minutos quando ele não vem;
- no modo Comment, sem repetição automática;
- 1 consulta por vez e intervalo mínimo de 10 s;
- `/users/{id}/info/` fora do modo Comment.

## Testes

| Bateria | Real ou simulado | Resultado |
|---|---|---|
| Sintaxe (12 arquivos JS, manifest e traduções) | n/a | OK |
| Unitários do parser e do leitor | Simulado | 41/41 |
| Dados, histórico e exportação (código real do dashboard e do popup em Node) | Simulado | 12/12 (no PATCHED 14: 10 dos 12 falham, reproduzindo os defeitos) |
| Ponta a ponta: dashboard real no Chromium, todos os modos, 27 cenários | Simulado (toda a rede interceptada) | 322/322 verificações |
| Consulta ao Instagram | **Real** | **Nenhuma.** A rede do ambiente bloqueia o instagram.com e não há sessão sua aqui |

O detalhe de cada verificação está em `RESULTADOS-TESTES.txt`. Os testes ficam em `tests/` e podem ser rodados de novo.

## Modo Comment: por que continua sem prova

- Foram examinadas cerca de 75 respostas reais publicadas por terceiros. Em
  todas as capturas web de 2022 em diante, `business_email` vem **nulo**,
  inclusive em perfis comerciais com botão de contato.
- O e-mail público só aparece em `public_email`, na API móvel
  `/users/{id}/info/`. Ela continua fora do modo Comment, como você pediu.
- Relatos de setembro de 2026 descrevem HTTP 429 já na primeira consulta
  `web_profile_info`, o mesmo que você viu na versão 13.

**Leitura honesta:** é provável que a rota permitida não entregue esse e-mail.
A extensão prova o caso no primeiro uso real, gastando poucas consultas, e
registra tudo nas abas de diagnóstico do XLSX.

## Não alterado de propósito

- A rota do modo Comment e todos os seus limites.
- A verificação de limite de teste (trial) do fornecedor. Ela compara um valor
  com ele mesmo e nunca dispara, mas é lógica de licença e ficou como estava.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `Autland-IG-Extractor-PATCHED-15.zip` | Extensão completa (34 arquivos), com `LEIA-ME.txt` e `PATCH_NOTES.txt` |
| `RESULTADOS-TESTES.txt` | Saída completa das três baterias |
| `diffs/` | Diferenças 13→14 e 14→15 |
| `tests/` | Testes unitários, de dados e ponta a ponta, com instruções |
