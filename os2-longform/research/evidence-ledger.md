# Evidence Ledger: The Post-Takata Airbag Crisis

Atualizado em 2026-10-01. Os IDs de fonte remetem a `os2-longform/data/sources/verified_transcripts.md`.

## Rotas de acesso tentadas

| Rota | Resultado |
|---|---|
| A–C: sistema de arquivos, repositório, caches, downloads, artefatos | Nenhum documento |
| Google Drive (busca por termos do tema) | Nada relevante |
| Gmail (busca por termos do tema) | Nada |
| D–H: URLs alternativas (nhtsa.gov, static/api.nhtsa.gov, federalregister.gov + API JSON + public-inspection, govinfo.gov, regulations.gov, web.archive.org) | **HTTP 403 na política de egress**. O README do proxy proíbe contornar ("do not retry or route around"). Não houve contorno. |
| Outros ambientes da conta | Só existe este ambiente |
| I: WebSearch | Funciona, mas devolve resumo/snippet. Não conta como leitura. |
| J: transcrições completas de vídeo (vidIQ) | **Funciona**: canal oficial da NHTSA (primário) + emissoras (secundário lido na íntegra) |

## Classificação

- **[PRIMARY VERIFIED]**: conteúdo publicado pela própria NHTSA, lido na íntegra
- **[SECONDARY VERIFIED]**: reportagem lida na íntegra
  - Tier 1 = rede nacional ou afiliada local estabelecida
  - Tier 2 = NTD
- **[ATTRIBUTED CLAIM]**: afirmação de uma parte (ARC, DTN, Carfax, autoridade, processo judicial), documentada em fonte lida. Só entra no roteiro atribuída.
- **[UNVERIFIED - REMOVE]**: só existe em snippet, resumo ou fonte de baixa credibilidade. Fica fora do roteiro.

---

## Claims prioritários

### 1. "11 mortes / 14 crashes / 3 feridos graves"
- **SOURCE:** só snippets de busca (Motor1, KBB, Autoblog e press release da NHTSA de 03/09/2026 via busca) e descrições de vídeos de baixa credibilidade
- **SOURCE TYPE:** snippet
- **DATE:** 2026-09-03
- **STATUS:** **[UNVERIFIED - REMOVE]**
- **WHAT IT PROVES:** nada verificável aqui
- **WHAT IT DOES NOT PROVE:** a contagem atual
- **SUBSTITUTO VERIFICADO:**
  - 6 mortes em out/2025 (N7, T2)
  - 8 mortes e 2 feridos graves em jan/2026 (N2, T1; N8, T2)
  - 10 mortes e 2 feridos graves em 12 batidas, achados iniciais de abr/2026 (N9, T2)
- **SAFE SCRIPT WORDING:** "In October 2025 the count was six. By January 2026, eight. By April, NHTSA's initial findings tied ten deaths to these inflators. Check NHTSA's site for the current number. We could not independently confirm any figure after April."

### 2. "11ª morte em 27/08/2026 (Dallas, Equinox 2018)"
- **SOURCE:** snippets e shorts estrangeiros
- **STATUS:** **[UNVERIFIED - REMOVE]**
- **SAFE SCRIPT WORDING:** omitir. Não citar Dallas, Equinox nem a data.

### 3. "A busca por VIN não identifica o DTN"
- **SOURCE:** a frase literal só aparece em snippets: **[UNVERIFIED - REMOVE]** como citação da NHTSA
- **Componentes verificados:**
  - A busca por VIN mostra recalls (A1, A2: PRIMARY)
  - A orientação da NHTSA para o DTN é histórico + inspeção, não VIN (N8 citação, N2)
  - As peças foram instaladas depois de uma batida, fora da fábrica (N2, N7)
- **WHAT IT PROVES:** a lógica de que uma busca de recall só mostra recalls que existem
- **WHAT IT DOES NOT PROVE:** uma declaração literal da NHTSA sobre o VIN
- **SAFE SCRIPT WORDING (rotulado como análise):** "A recall lookup can only show you a recall that exists. For these inflators, NHTSA's advice isn't 'check your VIN'. It's 'learn the car's history and get it inspected.'"

### 4. "~10.000 unidades" / "número desconhecido"
- **SOURCE:**
  - N8: texto da NTD citando o release da NHTSA de jan/2026, "estimated the total amount of air bag inflators under investigation at 10,000"
  - N7: "It's unclear how many DTN inflators are installed in cars in the US"
- **SOURCE TYPE:** secundário Tier 2, fonte única para cada número
- **STATUS:** **[SECONDARY VERIFIED – T2]**, só com atribuição
- **CONFLITO RESOLVIDO:** não há contradição. Os ~10.000 são infladores *sob investigação*; o desconhecido é quantos estão *instalados*.
- **WHAT IT DOES NOT PROVE:** que existam 10.000 em carros nos EUA
- **SAFE SCRIPT WORDING:** "Reporting on NHTSA's January warning said the investigation covered an estimated ten thousand inflators. How many are actually sitting in American steering wheels, no one has said."

### 5. "Likely illegally imported"
- **SOURCE:**
  - N9: "likely illegally imported into the United States by unknown importers"
  - N7 e N8: "likely illegally imported"
  - N2 (NBC): "illegally imported", fala do âncora
- **SOURCE TYPE:** secundário (T1 + T2) atribuindo à NHTSA
- **STATUS:** **[ATTRIBUTED CLAIM]** à NHTSA
- **WHAT IT DOES NOT PROVE:** que um importador específico cometeu crime, nem quem importou
- **SAFE SCRIPT WORDING:** "NHTSA says the inflators were likely illegally imported, by importers it hasn't identified."

### 6. Natureza jurídica da ordem da NHTSA
- **Verificado:**
  - Achados *iniciais* publicados no início de abr/2026 (N9: "initial findings published on April 2", T2)
  - A NHTSA estava "considering a nationwide ban" (N9)
  - Citação de Duffy (N9)
- **Não verificado:**
  - Decisão final de 29/04/2026
  - Base legal (49 U.S.C.)
  - "Primeira ordem compulsória ou proibição em 20+ anos"
- **STATUS:**
  - "initial findings + considering a ban": **[SECONDARY VERIFIED – T2]**
  - Decisão final, base legal e "primeira em 20+ anos": **[UNVERIFIED - REMOVE]**
- **CONFLITO "ban vs prohibition vs compulsory recall order":** **não resolvível** sem o documento. Nenhum dos três termos será usado como fato.
- **SAFE SCRIPT WORDING:** "In early April 2026, NHTSA published initial findings that these inflators are defective and said it was considering a nationwide ban on their sale and import. We were not able to review the final order ourselves. Check NHTSA's site for its current status."

### 7. "~52M ARC"
- **SOURCE:**
  - 6abc (N5, T1, 07/09/2023) e WFAA (N6, T1, 06/09/2023): a NHTSA pressionando pelo recall de 52M, infladores ARC **e Delphi**
  - NBC/ABC/NewsNation (N1, N3, N4; mai/2023): carta exigindo recall de 67M infladores ARC fabricados antes de 2018
- **STATUS:** **[SECONDARY VERIFIED – T1]**
- **CONFLITO 52M vs 67M:** resolvido. **São dois atos diferentes:** 67M = carta de mai/2023; 52M = etapa formal de set/2023 (ARC + Delphi). O motivo da diferença **não** está verificado e não será explicado.
- **WHAT IT DOES NOT PROVE:** que 52M estejam comprovadamente defeituosos (foi a posição da agência numa etapa contestada); que a recusa tenha sido final
- **SAFE SCRIPT WORDING:** "In May 2023, NHTSA demanded that ARC recall 67 million inflators. By September, the formal process covered 52 million inflators made by ARC and by Delphi."

### 8. Posição da NHTSA sobre o ARC em dez/2024 ("recuo")
- **SOURCE:** só snippets (AP via Washington Times, Fortune)
- **STATUS:** **[UNVERIFIED - REMOVE]**
- **SAFE SCRIPT WORDING:** "We could not confirm that a final order requiring that recall has ever been issued." É uma afirmação sobre a nossa verificação, não sobre a agência.

### 9. Takata ainda sem reparo
- **SOURCE:**
  - Stellantis com "do not drive" para ~225.000 veículos, MY 2003–2016 (N11 KHOU, N12 CBS 8, N10 WPXI; T1; fev/2026)
  - Carfax: ~5M carros sem reparo no país (N10, atribuído à Carfax)
  - NHTSA: "millions of defective Takata air bags on the road that need repair" (A1, PRIMARY, 2023)
  - Pelo menos 28 mortes (N12)
- **STATUS:**
  - 225k: **[SECONDARY VERIFIED – T1]**
  - 5M: **[ATTRIBUTED CLAIM]** (Carfax)
  - "millions": **[PRIMARY VERIFIED]**
  - 28 mortes: **[SECONDARY VERIFIED – T1]**
- **CONFLITO 225k vs 5M:** não é conflito. 225k = população Stellantis com "do not drive"; 5M = estimativa da Carfax para todos os Takata sem reparo.
- **CONFLITO 28 mortes vs outros números:** usar só "at least 28" (N12). Nenhum outro número.
- **SAFE SCRIPT WORDING:** "In February 2026, Stellantis told owners of about 225,000 older Chrysler, Dodge, Jeep and Ram vehicles with unrepaired Takata airbags: do not drive. Carfax put the number of unrepaired Takata vehicles nationwide at about five million."

### 10. Joyson 26V325
- **SOURCE:** só snippets e resumos de sites de recall
- **STATUS:** **[UNVERIFIED - REMOVE]**
- **SAFE SCRIPT WORDING:** omitir por completo. O ato JOYSON foi removido da estrutura.

---

## Demais claims

| ID | Claim | Fonte | Status | Redação segura / nota |
|---|---|---|---|---|
| C11 | Inflador = pequeno gerador de gás; químicos que entram em ignição para encher o airbag | N9, N7; A1 ("a chemical inside the airbag") | SECONDARY T2 + PRIMARY | Linguagem geral |
| C12 | O airbag precisa abrir "in the blink of an eye" | N1 (especialista) | ATTRIBUTED | "as one expert told NBC" |
| C13 | Ruptura ARC: "metal debris to be forcefully ejected into the passenger compartment" | N5 (descrição da NHTSA) | ATTRIBUTED (NHTSA) | Mecanismo de escória de solda **REMOVIDO** |
| C14 | Takata: fragmentos a 200 mph; maior risco em veículos mais velhos, em clima quente e úmido | A1 | PRIMARY | Não gráfico |
| C15 | Mortes DTN em Malibu e Sonata **com título salvage ou rebuilt** | N2 | SECONDARY T1 | "according to NHTSA, as reported by NBC" |
| C16 | Risco não confirmado como limitado a esses modelos | N2, N8 | SECONDARY T1 | Atribuir aos "officials" |
| C17 | Peças instaladas sobretudo após batida anterior, como substituto barato | N2, N7 | SECONDARY T1 | "investigators say" |
| C18 | Venda suspeita por marketplaces online ("we think") | N2 | ATTRIBUTED | Manter o "we think" |
| C19 | O site da DTN diz que ela não faz negócios com os EUA / produtos proibidos para os EUA | N2 (T1), N8 (citação) | ATTRIBUTED (DTN) | "the company says on its website" |
| C20 | A NBC procurou a DTN e não teve resposta | N2 | SECONDARY T1 | Datar: jan/2026 |
| C21 | Canal do YouTube com o nome da DTN (2016) com link para loja no Alibaba | M1 | ATTRIBUTED (propriedade não confirmada) | "a channel presenting itself as…"; não prova a rota de importação |
| C22 | Investigação com polícia local; orientação de reportar à HSI/FBI | N8 | SECONDARY T2 | Atribuir |
| C23 | Citações da NHTSA ("Whoever is bringing them…"; "learn their vehicle's history…"; "history report… inspected…") | N8 (texto citando o release) | ATTRIBUTED (NHTSA) via T2 | Citar como "NHTSA said in its January warning" |
| C24 | Citação de Duffy: "these substandard parts are killing American families" | N9 | ATTRIBUTED via T2 | Citação curta |
| C25 | Processo na Flórida: mãe de 22 anos, dois filhos, ~30 mph | N7 | ATTRIBUTED (alegação judicial) | **Sem nome**, sem detalhe de ferimento. **US$ 603M REMOVIDO** (sem fonte adequada) |
| C26 | Se achar DTN: não dirigir até trocar por peça que atenda aos padrões dos EUA; reportar à NHTSA | N2 | SECONDARY T1 | Checklist |
| C27 | Um mecânico consegue checar quem fabricou o airbag | N2 (especialistas) | ATTRIBUTED | Checklist |
| C28 | Busca por placa ou VIN no site da NHTSA | N10, A1, A2 | SECONDARY + PRIMARY | Checklist |
| C29 | Novos PSAs da NHTSA sobre Takata em 24/09/2026 | A2 + metadado | PRIMARY | Gancho de "why now" |
| C30 | Vídeo "NHTSA Airbag Counterfeit Final" de 2012 existe | A3 (só metadado) | PRIMARY (existência/data) | "a video titled…" — conteúdo desconhecido |
| C31 | ARC sediada no Tennessee; usada por pelo menos 12 montadoras | N1, N3 | SECONDARY T1 | — |
| C32 | Marcas citadas "reportedly": GM, Ford, Tesla, Toyota, Hyundai, Kia, Mercedes-Benz, BMW, VW | N5 | SECONDARY T1 ("reportedly") | Manter "reportedly" |
| C33 | ARC: carta de 11/05/2023 com "random one-off manufacturing anomalies… properly addressed with individual recalls" | N3 | ATTRIBUTED (ARC) | — |
| C34 | ARC: "just seven incidents in the U.S. over a decade and a half…" | N1 | ATTRIBUTED (ARC) | — |
| C35 | NHTSA: pelo menos 9 incidentes, 2009 a mar/2023, 2 mortes | N3 | SECONDARY T1 | — |
| C36 | Morte de motorista em **Michigan** em 2021 (ARC) | N1 | SECONDARY T1 | **Conflito MI/KY resolvido: Michigan** |
| C37 | GM: recall voluntário de quase 1M de Traverse, Acadia e Enclave 2014–2017 ("abundance of caution"); troca do módulo do airbag do motorista; cartas a partir de 25/06 | N1, N3 | SECONDARY T1 | — |
| C38 | Especialista: 284M de veículos nos EUA; seria um dos maiores recalls | N1 | ATTRIBUTED | — |
| C39 | 2 mortes e 7 feridos desde 2009 (ARC/Delphi, set/2023) | N5, N6 | SECONDARY T1 | — |
| C40 | Consumer Reports: passo "incomum"; "only taking this step because they feel very confident in the data" | N5 | ATTRIBUTED | — |
| C41 | ARC: "extensive field testing did not find any defect" | N5 | ATTRIBUTED | — |
| C42 | Em set/2023 os veículos exatos ainda não tinham sido identificados publicamente | N5 | SECONDARY T1 | Datar |
| C43 | Pelo menos 28 mortes e centenas de feridos (Takata) | N12 | SECONDARY T1 | Sem "nos EUA" explícito, por cautela |
| C44 | Estados com mais Takata sem reparo: CA, TX, FL | N10 (apuração da WPXI) | ATTRIBUTED (WPXI) | — |
| C45 | Recall gratuito na concessionária | A1, A2, N10 | PRIMARY | — |

## Adendo: segunda passada de busca (mesmo dia)

| ID | Claim | Fonte | Status | Nota |
|---|---|---|---|---|
| C46 | Definição da NHTSA de safety defect: "unreasonable risk… crash and injury or death"; "materials, how… built, or how it performs"; exemplos "brake failure, steering failure, or exploding airbags"; "We review every complaint we receive" | A4 | PRIMARY | Liga a definição à frase "unreasonable risk" da carta ao ARC (N1) |
| C47 | "Your vehicle is either affected by safety recalls, or it isn't." (PSA de 24/09/2026) | A5 | PRIMARY | Recurso narrativo do fecho |
| C48 | "Your vehicle could have an open safety recall, and you might not know it. Check… license plate or VIN" (27/03/2026) | A6 | PRIMARY | Substitui a fonte secundária da busca por placa |
| C49 | Audiência pública da NHTSA em 05/10/2023; a agência "again argued" que os 52M ARC + Delphi devem ser recolhidos; a ARC discorda e recusou | N13 | SECONDARY T1 | Autoline publicou em 06/10, falando de "yesterday" |
| C50 | Dos 52M, ~11M são da Delphi (hoje da Autoliv), sob licença da ARC | N13 | SECONDARY T1 (fonte única) | Atribuir à Autoline |
| C51 | Se a NHTSA ordenar recall, a ARC pode contestar na Justiça federal; a NHTSA pode ir à Justiça para forçar montadoras a cumprir | N13 | SECONDARY T1 | Descrição do processo, atribuída |
| C39b | **Conflito na contagem de mortes do ARC.** Autoline: "seven injuries and one death in the US". 6abc/WFAA/ABC: "at least two deaths". NBC: morte em Michigan em 2021. | N13, N5, N6, N3, N1 | **RESOLVIDO DE FORMA CONSERVADORA** | "at least one death in the United States, and at least two deaths cited by regulators overall" |
| C52 | BMW "do not drive" (mai/2023): ~90.000 veículos 2000–2006, Série 3 e 5, já sob recall Takata; "becoming more dangerous by the day"; aviso: risco "dire", "extremely high probability of failure during a crash"; peças, reparo e guincho grátis | N14 | SECONDARY T1 | Frase de ferimento gráfico **omitida** |
| C53 | WFAA (dez/2025): a Carfax identificou o Texas como líder em veículos com Takata pendente | N15 | ATTRIBUTED (Carfax via WFAA) | Relatado em 2025. A WPXI (fev/2026) lista CA, TX, FL. Não é conflito: datas e recortes diferentes. |
| C54 | Três "ingredientes" segundo a NHTSA: calor, umidade, tempo; veículos no Texas com prioridade de reparo | N15 | SECONDARY T1 (atribuído à NHTSA) | — |
| C55 | Caso de um espectador: carro 2013, "repair not yet available"; reclamação formal à NHTSA + pedido por escrito à montadora; concessionária deu carro reserva até o reparo, sem custo | N15 | SECONDARY T1 (caso individual) | Sem nome no roteiro; um caso, não estatística |

## Removidos por evidência insuficiente

| Claim | Motivo |
|---|---|
| 11 mortes / 14 batidas / 3 feridos; 11ª morte em Dallas (Equinox, 27/08/2026) | Só snippet |
| Decisão final da NHTSA de 29/04/2026; "primeira proibição/ordem em 20+ anos"; base legal | Só snippet; termo jurídico incerto |
| Literal "A VIN search cannot identify the part"; "owners bear the cost"; "deployed since 2020" | Só snippet ou fontes fracas |
| Concessionária comprou no eBay (WSJ) | WSJ inacessível; instrução explícita de remover |
| Proibição do eBay (14/09, vigência 24/09/2026) | Só snippet e podcasts/shorts de baixa credibilidade |
| Veredito de US$ 603M; ação contra o eBay; Seção 230 | Fontes de baixa credibilidade (canais pequenos, vídeo de escritório de advocacia) |
| Condenações do DOJ na Carolina do Norte | Só listas de referências em descrições |
| ARC: recuo da NHTSA em dez/2024; "decisão final pendente em 2026" | Só snippet |
| ARC: mecanismo de escória da solda por fricção | Não lido |
| ARC: rupturas de 2009 (OH) e 2014 (NM, Optima) com detalhes | Não lido; só o agregado "9 incidentes 2009–2023" (N3) |
| Joyson 26V325 | Só snippet |
| Takata: 67M infladores; nitrato de amônio; acordo de US$ 1 bi; falência | Não lido |
| DTN: número EA25-005; abertura em 21/10/2025; primeiro caso em 30/05/2023 (Malibu 2018 vs 2020) | Só snippet; conflito interno |
| Preço US$ 100 vs ~US$ 1.000 | Fontes fracas |
| "WSJ: 5 mortes em set/2025" | Cadeia fraca (descrição de podcast citando o WSJ) |
