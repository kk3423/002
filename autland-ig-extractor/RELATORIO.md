# Autland IG Extractor — PATCHED 15.2 — Relatório

## Resultado

**A coleta do e-mail de "Contato → E-mail" no modo Comment NÃO está restaurada.**

- Nos seus dois testes reais, o Instagram recusou a consulta de perfil com
  **HTTP 429** já na 1ª chamada.
- Mesmo sem o 429, toda evidência disponível indica que essa consulta não
  traz o e-mail comercial (seção 3).
- A versão 15.2 não muda isso. Ela corrige um defeito de gravação da pausa e
  registra no diagnóstico o que faltava para provar o que aconteceu.

## 1. A pausa que "sumiu" às 13:13

### Fatos

| # | Fato | Evidência |
|---|---|---|
| 1 | 12:59:23 (PATCHED 15): 429 na 1ª consulta, pausa até 13:59:23 | Seu 1º print |
| 2 | O contador "recusas seguidas: 1" das 12:59 veio do armazenamento da extensão | No código, o painel relê esse valor do armazenamento depois do 429 |
| 3 | 13:13:06 (PATCHED 15.1): saiu uma consulta, 429, pausa até 14:13:06 e "recusas seguidas: 1" | Seu 2º print |
| 4 | Para essa consulta sair, a extensão não encontrou a pausa salva. O contador 1 mostra que também não encontrou o registro das 12:59: os dois sumiram juntos | O leitor confere a pausa salva antes de cada consulta. O contador só volta a 0 com uma resposta de perfil, e não houve nenhuma |
| 5 | Nada no código apaga ou reduz a pausa ou o contador. As chaves são as mesmas desde a versão 14 | Auditoria: a pausa tem 2 gravadores e ambos ficam com a pausa maior; não existe `clear()` nem remoção dessas chaves |
| 6 | Com a **15.1**, a pausa e o contador se mantêm, com **zero consultas** ao Instagram durante a pausa | Teste no Chromium (simulado) em: reabrir às 13:13, Recarregar, copiar arquivos novos e Recarregar, reiniciar o navegador, carregar de outra pasta (mesma chave e mesmo ID) e várias abas |
| 7 | Com o armazenamento da extensão **vazio** às 13:13, a tela fica idêntica ao seu 2º print: nova consulta, 429, "recusas seguidas: 1" e pausa até 14:13 | Teste no Chromium (simulado) |

### Hipóteses (não comprovadas)

O armazenamento lido às 13:13 estava vazio. As causas possíveis estão fora do
código da extensão:
- a extensão foi removida e carregada de novo;
- outro perfil do Chrome foi usado;
- os dados foram limpos.

Não é possível provar qual delas a partir dos prints. A remoção também não pôde
ser automatizada aqui: a confirmação do Chrome não conclui sem tela.

### O que a 15.2 corrige e acrescenta

- **Defeito corrigido:** depois de um 429, o dashboard gravava a pausa sem a
  trava usada pelo leitor. Numa corrida entre abas, a pausa mais curta podia
  ficar por último. Agora todas as gravações usam uma trava única e são
  repetidas 1 vez em caso de erro. Se mesmo assim a gravação falhar, o painel
  avisa.
- **Diagnóstico:** "Pausa salva no navegador" passa a vir do armazenamento.
  Antes, vinha só da memória da aba e não provava que estava salva.
- **Retry-After:** cada 429 mostra o valor recebido, ou "ausente".
- **Prova de reinício:** o painel mostra "Estado salvo neste navegador desde". Se
  essa data for posterior ao último 429, o estado foi apagado fora da extensão.
- **Privacidade:** nenhum cookie, token ou cabeçalho é registrado. Isso é
  verificado em teste.

## 2. Origem do 429

| Fato | Evidência |
|---|---|
| Consulta recusada: `GET https://www.instagram.com/api/v1/users/web_profile_info/?username=<perfil>`, com os cookies da sua sessão | Linha "Consulta" do diagnóstico e código do leitor |
| HTTP 429 na 1ª consulta, duas vezes (12:59:23 e 13:13:06), com 14 min de intervalo | Seus prints |
| As duas pausas tiveram exatamente 60 min | Seus prints: 60 min é o padrão quando o Retry-After não vem; um Retry-After de 3600 s daria o mesmo |
| A sessão estava ativa: a lista de comentários do mesmo post respondeu (47 perfis) | 1º print |
| Mensagem do Instagram no 429 | **Não visível** nos prints; a 15.2 passa a mostrá-la quando vier |

**Hipóteses:**
- **Limite de consultas a essa rota para a sua conta ou rede.** É o que mais
  combina com 429 na 1ª chamada duas vezes seguidas e com a outra rota
  funcionando.
- **Mudança do Instagram nessa rota para sessões logadas.** Há relatos públicos
  de setembro de 2026 com o mesmo padrão.

Sem acesso à sua sessão, não dá para separar as duas.

## 3. A consulta usada pode trazer o e-mail comercial?

Pela evidência disponível, **não**:

- **Capturas públicas:** em cerca de 75 respostas reais publicadas por
  terceiros, `web_profile_info` traz `business_email` **nulo** em todas as
  capturas de 2022 em diante. Isso vale inclusive para sessões logadas e
  perfis comerciais com botão de contato.
- **Código do próprio Instagram:** o código web diz que os botões de contato
  só aparecem no app do celular. A versão web não mostra "Contato → E-mail" de
  outros perfis.
- **Rota móvel:** nas capturas atuais, o e-mail aparece só em `public_email`
  da API móvel `/users/{id}/info/`. Ela continua fora do modo Comment, como
  você definiu.

## 4. Testes

| Bateria | Real ou simulado | Resultado |
|---|---|---|
| Seu teste das 12:59 (PATCHED 15) | **Real** | Comentários OK; 1ª consulta de perfil: **HTTP 429**; pausa de 60 min, nada repetido |
| Seu teste das 13:13 (PATCHED 15.1) | **Real** | 1ª consulta de perfil: **HTTP 429**. A pausa anterior não estava no armazenamento (seção 1) |
| Consulta ao Instagram a partir deste ambiente | **Real** | **Nenhuma**: a política de rede do ambiente bloqueia o instagram.com, e não há sessão sua aqui |
| Unitários do parser, do leitor e da gravação da pausa | Simulado | 46/46 |
| Dados, histórico e exportação | Simulado | 12/12 |
| Ponta a ponta no Chromium, todos os modos | Simulado | 359/359 verificações em 29 cenários |
| Reprodução 12:59 → 13:13 (15.2 / 15.1) | Simulado | 15.2: 26/26 e armazenamento vazio 9/9. 15.1: 22/25; as 3 falhas são verificações que só existem na 15.2, e a pausa foi conservada |
| Ciclo de vida do armazenamento (Recarregar, atualizar arquivos, reiniciar, outra pasta) | Simulado | Pausa e contador conservados em todos; a remoção não pôde ser automatizada |

## 5. O que ficou de fora e por quê

- **Teste real a partir deste ambiente:** a rede bloqueia o instagram.com e não
  há sessão sua aqui. Os únicos resultados reais são os seus dois testes.
- **Mudança nos cabeçalhos da consulta de perfil:** a política de segurança do
  ambiente bloqueou essa alteração, que por isso não está na 15.2. A consulta
  continua igual à da 15.1.
- **`/users/{id}/info/` no modo Comment:** continua fora, como você definiu.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `Autland-IG-Extractor-PATCHED-15.2.zip` | Extensão completa (34 arquivos) |
| `RESULTADOS-TESTES.txt` | Saída completa dos testes |
| `diffs/` | Diferenças 13→14 e 14→15.2 |
| `tests/` | Testes unitários, de dados e ponta a ponta (com a reprodução 12:59 → 13:13) |
