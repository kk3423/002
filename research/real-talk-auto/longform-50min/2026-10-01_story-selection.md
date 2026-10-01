# Real Talk Auto: seleção de história para o long-form de 50+ min

Data: 2026-10-01 · Status: **aguardando aprovação** (o roteiro ainda não foi escrito)

Legenda de verificação:
- ✅ lido em fonte primária ou em reportagem que cita o documento primário
- 🟡 documento primário localizado, mas lido só via resumo de busca (acesso direto bloqueado no ambiente)
- ⚠️ ainda não verificado; conferir antes do roteiro

---

## 1. Diagnóstico de estado

| Item | Situação real |
|---|---|
| Dados das conversas anteriores | **Nenhum.** Esta sessão começou sem histórico. O "último comando" não está acessível para mim. |
| Arquivos e datasets | O repositório `kk3423/002` estava vazio (sem commits) e o Google Drive não tem nenhum arquivo do Real Talk Auto. |
| Fonte de verdade reconstruída | Canal via vidIQ: 20 vídeos, catálogo completo e retenção (ver `../PIPELINE_STATE.md`) |
| Último candidato analisado | Sem registro. Não dá para afirmar qual foi. |
| Histórias rejeitadas antes | Sem registro. Tratei os 20 temas publicados + ângulos saturados como zona de exclusão. |
| Estado do pipeline | Produção diária de vídeos de 8 a 12 min no formato "documento primário + consequência para o dono". O formato de 50+ min nunca foi testado. |

**Causa provável da falha anterior:** o estado do pipeline nunca foi persistido. Corrigido agora com `PIPELINE_STATE.md`.

---

## 2. Candidatos (19)

Rótulos de runtime: **REJ** = não sobrevive a 10 min · **30** · **40** · **50+**

| # | Story | Why now | Runtime | Duplicação | Status |
|---|---|---|---|---|---|
| 1 | **Crise pós-Takata dos airbags** (infladores falsificados DTN60DB + 52M ARC + Takata inacabada + ruptura Joyson) | 11ª morte em 27/ago/2026; alerta NHTSA em 03/set; eBay banido em 14/set | **50+** | Genuinely new | **FINALISTA → VENCEDOR** |
| 2 | **Portas eletrônicas que prendem ocupantes** (Tesla + indústria) | Recall Tesla de 2,98M na China (21/ago/2026, início 25/set); regulamentação da NHTSA aberta em jul/2026 | **40** (50 no limite) | Genuinely new (transcrição Xiaomi×Tesla verificada) | **FINALISTA** |
| 3 | **As fraudes do crédito automotivo** (Tricolor + First Brands + inadimplência subprime recorde) | Julgamento da Tricolor em 19/out/2026; audiência de supressão em 07/out | **50+** (com risco de timing) | Genuinely new | **FINALISTA** |
| 4 | GM L87 6.2 V8: o conserto do recall falha (EA26005, 997.743 veículos) | EA aberto em 20/ago/2026 | 30–40 | Mesmo ângulo do vídeo da Tundra | REJEITADO: duplicação + saturação (vídeos de 1,5M e 940k views em ago–set) |
| 5 | Ford, a máquina de recalls (153 recalls em 2025; 56+ e 12,1M de veículos até meados de 2026) + consent order | Contagem de 2026 em andamento | 40 | Same topic / new event (vídeo do Ford Escape) | Reserva |
| 6 | Stellantis: ação na mínima histórica, plano de US$ 70 bi | Ação na mínima em 30/set/2026 | 40–50 | Same topic (Maserati, Jeep já cobertos) | Reserva: concorrência alta, 6º vídeo de "montadora em crise" |
| 7 | comma.ai openpilot (PE26007, 3 mortes) | PE aberta em 21/set/2026 | 30 | Genuinely new | 30 MIN: bom vídeo médio |
| 8 | Tesla Cybercab (auditoria AQ26002) | 03/set/2026 | 20–30 | Tesla saturado | Rejeitado para long-form |
| 9 | Tesla FSD EA (3,2M veículos) | EA desde mar/2026 | 30 | Saturado | Rejeitado |
| 10 | Parafuso de direção VW/Audi (2,16M global, 208k EUA) | 25/set/2026 | REJ | Novo | Rejeitado: um único recall não passa do teste dos 10 min |
| 11 | Incêndios de bateria Jeep 4xe (375k, "estacione do lado de fora", conserto anterior falhou) | 2026 | 20–30 | Mesmo ângulo "o conserto falhou" | Rejeitado: duplicação de ângulo |
| 12 | Honda J35 V6 bronzina (investigação de 1,4M) | Aberta em ago/2025 | 20–30 | Same topic (falha de motor) | Rejeitado |
| 13 | Morte da F-150 Lightning / baixa de US$ 19,5 bi da Ford | Dez/2025 (fraco) | 40–50 | Sobrepõe "Detroit walked away" | Reserva evergreen |
| 14 | Fraude de certificação no grupo Toyota (Hino US$ 1,6 bi, Daihatsu, Toyota Industries) | Fraco | 40–50 | O canal já tem 5 vídeos de Toyota | Reserva |
| 15 | Nexperia: a apreensão do chip | Out–nov/2025 (encerrado) | 30 | Novo | Rejeitado: why-now fraco |
| 16 | Right to repair (decisão do 1º Circuito pendente; REPAIR Act) | Aguardando decisão | 30–40 | Novo | Reserva: sem clímax ainda |
| 17 | Investigação das práticas de recall da Hyundai/Kia (ABS Mando, 6,3M) | Antigo | 20–30 | Novo | Rejeitado |
| 18 | Takata como história isolada | — | 50+ | Externo: SATURADO (Plainly Difficult 1,9M; doc "Ticking Time Bomb" 70 min republicado 4x; ARD 44 min em jul/2026) | Rejeitado como núcleo; entra só como contexto no #1 |
| 19 | Manipulação de lances no leilão EBLOCK (DOJ) | Fev/2026 | REJ | Novo | Rejeitado |

### Ficha completa dos finalistas

#### #1: A crise pós-Takata dos airbags
1. **STORY:** Infladores de airbag de reposição, chineses e provavelmente importados ilegalmente (marcação DTN60DB), já mataram 11 motoristas nos EUA em batidas que dariam para sobreviver. A NHTSA usou sua ordem mais forte em 20+ anos, mas não consegue localizar os carros. Enquanto isso, 52M de infladores ARC que a própria agência chamou de defeituosos em 2023 continuam sem recall, e milhões de Takata seguem sem reparo.
2. **WHY NOW:** 11ª morte em 27/08/2026 (Dallas, Equinox 2018), alerta da NHTSA em 03/09, eBay banindo airbags em 14/09, cobertura da NPR em 24/09.
3. **WHY PEOPLE CARE:** O airbag é o item de segurança em que todo mundo confia sem pensar. Quem comprou um carro usado que já bateu pode estar dirigindo com um.
4. **SEARCH DEMAND:** "takata airbag" 13.051/mês (**+164%** sobre a base); "takata" 34.888/mês; "airbag recall" <750; termos específicos de DTN com volume baixo. Demanda MÉDIA, puxada pela marca Takata e pelo noticiário.
5. **EVERGREEN:** STRONG
6. **COMPETITION:** DTN: 1 vídeo de 8 min (717 views). ARC: baixa. Takata: saturada (por isso não é o núcleo).
7. **PRIMARY SOURCES:** NHTSA Initial Decision (01/04/2026) e Final Decision (29/04/2026) sobre o DTN; Federal Register 2026-06620; press release da NHTSA de 03/09/2026; página "Deadly Air Bag Replacements"; ARC Initial Decision (Federal Register 2023-19441), Supplemental Initial Decision (jul/2024) e memorando de dez/2024; recall GM 26V325 (Joyson); página Takata Recall Spotlight; press release do "Do Not Drive" da FCA.
8. **OWNER CONSEQUENCE:** Máxima. A busca pelo VIN não detecta o DTN; o dono paga inspeção e troca; carros com histórico de batida desde 2020 precisam de inspeção; carros ARC continuam em circulação.
9. **POTENTIAL REVELATIONS:** ver seção 5
10. **RUNTIME:** 50+ (alvo de 55–60 min)
11. **DUPLICATION RISK:** nenhum (zero vídeos de airbag no catálogo)
12. **FIT:** perfeito: documento primário + consequência para o dono + falha do sistema regulatório (o DNA do canal)

#### #2: Portas eletrônicas que prendem ocupantes
1. **STORY:** A maçaneta embutida, criada por estética e aerodinâmica, virou risco de morte quando o 12V cai depois de uma batida. A China baniu o design e forçou recall de quase 3M de Teslas. Nos EUA, a NHTSA negou a petição de defeito, mas abriu regulamentação para toda a indústria.
2. **WHY NOW:** Recall na China em 21/08/2026 (2.975.910 veículos, início 25/09); NHTSA em jul/2026.
3. **WHY PEOPLE CARE:** Medo visceral (ficar preso); toca em Tesla, Xiaomi, Ford Mach-E e outros.
4. **SEARCH DEMAND:** "tesla door handle" 4.471/mês; "tesla door handles" 3.543/mês. MÉDIA.
5. **EVERGREEN:** MEDIUM–STRONG (mudança de regra de design para todos os carros)
6. **COMPETITION:** ALTA no núcleo: Bloomberg Originals, 18 min, **930k views** (dez/2025), cobre Cybertruck, histórico, NHTSA e China.
7. **PRIMARY SOURCES:** NHTSA PE25-010 (set/2025, Model Y 2021, 174.290 veículos); negativa de petição + regulamentação da NHTSA (jul/2026); recall no SAMR (China); padrão do MIIT (fev/2026); FMVSS 206.
8. **OWNER CONSEQUENCE:** Alta (localizar o destravamento manual; ferramenta de fuga).
9. **REVELATIONS:** (1) A FMVSS 206 não regula onde fica nem como é sinalizado o destravamento manual, então não existe regra a violar; (2) a China agiu primeiro, e a correção lá é software (abaixar os vidros depois da batida); (3) a NHTSA negou a petição citando uma única reclamação e, na mesma decisão, abriu regra para todos.
10. **RUNTIME:** 40 (50 só com expansão para indústria inteira, o que traz risco de enchimento)
11. **DUPLICATION:** genuinely new
12. **FIT:** bom, mas a concorrência com Bloomberg reduz o diferencial

#### #3: As fraudes do crédito automotivo
1. **STORY:** Duas empresas do ecossistema automotivo (Tricolor, que vendia carros usados com crédito subprime, e First Brands, dona de Fram, Autolite, Trico e Raybestos) colapsaram em set/2025 sob acusações de penhor duplo de garantias. Os fundadores foram indiciados, num momento em que a inadimplência subprime bateu o recorde de 32 anos.
2. **WHY NOW:** Julgamento de Daniel Chu em 19/10/2026; audiência de supressão de provas em 07/10.
3. **WHY PEOPLE CARE:** Crédito e preço do carro; peças que estão em todo AutoZone.
4. **SEARCH DEMAND:** não medido no vidIQ (tema de finanças)
5. **EVERGREEN:** MEDIUM–STRONG (fraude é evergreen; o contexto macro muda)
6. **COMPETITION:** MÉDIA–ALTA no lado financeiro (Patrick Boyle, 24 min, 451k; FT; JunkBondInvestor); baixa no lado automotivo.
7. **PRIMARY SOURCES:** Indiciamento do SDNY contra os irmãos James (29/01/2026); indiciamento substitutivo de Chu (24/06/2026, estatuto "financial kingpin"); Fitch: subprime 60+ dias em 6,9% (jan/2026); autos das falências.
8. **OWNER CONSEQUENCE:** Média (tomadores da Tricolor; quem compra no subprime)
9. **REVELATIONS:** (1) US$ 2,2 bi em garantias penhoradas contra US$ 1,4 bi reais (Tricolor); (2) VP financeiro da First Brands se declarou culpado e coopera; (3) dívida com rating AAA virou centavos.
10. **RUNTIME:** 50+ material, mas o **payoff (veredito) ainda não existe**
11. **DUPLICATION:** genuinely new
12. **FIT:** médio (mais finanças que carro)

---

## 3. Teste de 50+ minutos

Pergunta: *"Se fosse contado em 10 min, o que de importante ficaria de fora?"*

| Candidato | O que ficaria de fora em 10 min | Camadas | Veredito |
|---|---|---|---|
| #1 Airbags | Tudo do ARC (16 anos, a recusa, o recuo), o mecanismo físico das 4 formas de falha, a economia da reposição (US$ 100 vs ~US$ 1.000), a cadeia eBay → oficina → concessionária, por que um recall não consegue achar os carros, a Takata inacabada, o caso Joyson, o checklist do dono | 4 + 1 | **50+ MIN** |
| #2 Portas | O histórico do design, o caso Cybertruck/Piedmont, a lacuna da FMVSS 206, o detalhe da regra chinesa, outras montadoras | 3 | **40 MIN** |
| #3 Crédito | A mecânica do factoring, o paralelo Tricolor×First Brands, o macro subprime, o histórico dos fundadores | 3 + veredito pendente | **50+ material / timing FAIL** |
| #5 Ford | A explicação do consent order (mais recalls = mais honestidade?), o custo de garantia, os casos | 3 | 40 MIN |
| #6 Stellantis | A era Tavares, preços, revolta dos dealers, Filosa | 3 | 40–50 MIN, mas é o 6º vídeo de "montadora em crise" |
| #13 Lightning | Promessa vs custo, baixa de US$ 19,5 bi, EREV | 3 | 40 MIN (why-now fraco) |

---

## 4. Validação de fontes primárias (top 3)

### #1 Airbags

| CLAIM | SOURCE | DATE | SOURCE TYPE | WHAT IT PROVES | WHAT IT DOES NOT PROVE |
|---|---|---|---|---|---|
| Infladores marcados DTN60DB contêm defeito de segurança | NHTSA Final Decision (nhtsa.gov/.../final-decision-air-bag-inflator-marked-DTN60DB-04292026.pdf) 🟡 | 2026-04-29 | Decisão regulatória final | Conclusão oficial da NHTSA; proíbe venda e importação | Quantas unidades existem; quem importou |
| 12 rupturas, 10 mortes, 2 feridos graves (na data da decisão) | NHTSA Initial Decision + Federal Register 2026-06620 🟡 | 2026-04-01/06 | Decisão regulatória | Contagem oficial em abr/2026 | Que todos os casos tenham a mesma origem de compra |
| 1º caso: 30/05/2023, Malibu 2018, Dallas, motorista morto; VOQ em 16/06/2023 | Initial Decision (via resumo de busca) 🟡 | 2026-04-01 | Decisão regulatória | Cronologia: primeira morte 2+ anos antes do EA | ⚠️ a data exata precisa ser conferida no PDF |
| EA aberto em 21/10/2025 | Initial Decision 🟡 | — | Documento NHTSA | Prazo entre a 1ª morte e o EA (~29 meses) | Por que demorou (não inferir negligência sem prova) |
| Fabricante: Jilin Province Detiannuo Safety Technology Co. (China); "likely illegally imported" | Federal Register / NHTSA 🟡 | 2026-04 | Regulatório | Identidade do fabricante segundo a NHTSA | Que a DTN tenha feito o produto como falsificação intencional (a NHTSA usa "substandard"/"likely illegally imported"; a imprensa usa "counterfeit") |
| Estimativa inicial de ~10.000 unidades; total real desconhecido | Initial Decision (via resumo) 🟡 | 2026-04 | Regulatório | Ordem de grandeza segundo a NHTSA | Número real em circulação |
| Primeira ordem compulsória/proibição em 20+ anos | NHTSA press release + The Crash Report 🟡 | 2026-04 / 09 | Agência + análise | Excepcionalidade da medida | Que tenha sido "a primeira da história" |
| 11ª morte: 27/08/2026, Dallas, Equinox 2018; 14 batidas, 11 mortes, 3 feridos graves | Press release NHTSA "Banned Chinese Air Bag Inflator Kills 11th Person" ✅ (via Motor1/KBB/Autoblog) | 2026-09-03 | Agência | Contagem atual; expansão além de Malibu/Sonata | Que outros modelos estejam afetados em escala |
| A busca pelo VIN não identifica o inflador; não há lista de veículos; o dono paga inspeção e troca | NHTSA "Deadly Air Bag Replacements" + News12/Motor1 ✅ | 2026-09 | Agência + imprensa | A lacuna estrutural do sistema de recall | Que não exista nenhum caminho de ressarcimento (⚠️ conferir a redação exata da NHTSA) |
| WSJ (jul/2026) rastreou um componente comprado no eBay **pela concessionária** | NPR citando o WSJ ✅ (imprensa secundária) | 2026-07 / 09-24 | Jornalismo investigativo | Que pelo menos um caso passou por compra no eBay | Que concessionárias em geral comprem no eBay (caso único). ⚠️ Ler o WSJ original |
| eBay bane a venda de airbags e infladores nos EUA; Amazon, Meta, Temu e Alibaba já baniam | Repairer Driven News / NPR ✅ | 2026-09-14 / 24 | Imprensa + política corporativa | Resposta do mercado | Que a venda online tenha acabado |
| WSJ já ligava peças chinesas de reposição a 5 mortes em set/2025 | Repairer Driven News citando o WSJ ✅ | 2025-09-29 | Imprensa | O problema era público antes do EA | — |
| ARC: a NHTSA concluiu (inicialmente) que ~52M infladores ARC/Delphi são defeituosos | Federal Register 2023-19441 🟡 | 2023-09-05 | Initial Decision | Posição oficial em 2023 | **Que sejam defeituosos de forma comprovada e final** (decisão inicial, não final) |
| ARC recusou o pedido de recall de 67M | Carta NHTSA / cobertura AP ✅ | 2023-04/05 | Agência + imprensa | Recusa formal | — |
| A NHTSA recuou em dez/2024 para "investigação adicional"; decisão final pendente em 2026 | Memorando NHTSA (via AP/Fortune/Washington Times) ✅ | 2024-12-18 | Agência | Status atual: sem recall amplo | Que a NHTSA tenha desistido (oficialmente, segue investigando) |
| Rupturas ARC: 1ª em 29/01/2009 (Ohio, T&C 2002); morte em 08/04/2014 (NM, Kia Optima 2004); Traverse 2015 em 2021 | Federal Register 2023-19441 (via resumo) 🟡 | 2023 | Regulatório | Linha do tempo de 12+ anos | ⚠️ Local da morte de 2021 (MI vs KY) conflitante, conferir |
| ARC sustenta que as rupturas são anomalias isoladas de fabricação | Posição pública da ARC (via cobertura) ✅ | 2023–2026 | Declaração corporativa | O contraponto obrigatório | Independência da conclusão |
| Takata: 28 mortes nos EUA; 67M+ infladores; "Do Not Drive" da FCA para ~225k sem reparo | NHTSA Takata Spotlight + press release ✅ | 2024-09 / 2026-02 | Agência | Escala e situação atual | ⚠️ O número "5M+ sem reparo" vem da Carfax, não da NHTSA |
| GM 26V325: inflador de cortina (Joyson) com risco de ruptura (trinca + água → corrosão sob tensão), 2.785 caminhonetes | Recall report NHTSA 26V325 ✅ (via resumo) | 2026 | Documento do fabricante | O modo físico de falha existe também no sucessor da Takata | **Que a Joyson tenha um problema sistêmico** (é 1 incidente, veículo estacionado, 2.785 unidades) |

### #2 Portas

| CLAIM | SOURCE | DATE | TYPE | PROVES | DOES NOT PROVE |
|---|---|---|---|---|---|
| Recall Tesla China: 2.975.910 veículos, correção por OTA + etiquetas | Arquivamento SAMR (via AP/Local10) ✅ | 2026-08-21 | Regulador chinês | Escala e forma da correção | Que exista defeito nos carros dos EUA |
| NHTSA nega petição sobre Model 3 (179.031) e abre regulamentação | Decisão NHTSA (via Electrek/TechCrunch) ✅ | 2026-07-23/24 | Agência | Lacuna regulatória reconhecida | Que haja uma regra pronta (é só o início do processo) |
| FMVSS 206 não regula posição nem sinalização do destravamento manual | Electrek (citando a NHTSA) 🟡 | 2026-07 | Imprensa citando agência | Que não existe regra a violar | — |
| PE25-010: maçanetas do Model Y 2021 (174.290) | NHTSA ODI ✅ | 2025-09 | Investigação | Que há investigação aberta | Defeito confirmado |
| China exige destravamento mecânico interno e externo | MIIT (via Repairer Driven News) 🟡 | 2026-02 | Regulador | Divergência regulatória China×EUA | ⚠️ Data de vigência (2027?) a conferir |

### #3 Crédito automotivo

| CLAIM | SOURCE | DATE | TYPE | PROVES | DOES NOT PROVE |
|---|---|---|---|---|---|
| Irmãos James indiciados (9 acusações) | Press release DOJ SDNY ✅ | 2026-01-29 | Acusação | Que existe acusação formal | **Culpa** (alegação; ambos se declararam inocentes) |
| VP financeiro (Brumbergs) se declarou culpado e coopera | Cobertura do caso (Truck Parts & Service) ✅ | 2026 | Imprensa | Cooperação com a acusação | Culpa dos réus principais |
| Tricolor: US$ 2,2 bi em garantias penhoradas contra US$ 1,4 bi reais | Indiciamento (via Bloomberg Law/NatLawReview) ✅ | 2025-12 / 2026-06 | Acusação | O tamanho da alegação | Fato provado |
| Julgamento de Chu em 19/10/2026; audiência em 07/10 | Ordem judicial (via NatLawReview) ✅ | 2026-09-28 | Judicial | Calendário | Resultado |
| Subprime 60+ dias em 6,9%, recorde desde 1993 | Fitch ✅ | 2026-01 | Dado de mercado | Estresse no crédito | Causalidade com as fraudes |
| Julgamento First Brands (13/07/2026) adiado? | Pedidos de adiamento ⚠️ | 2026 | Judicial | — | **Status atual desconhecido**, conferir |

---

## 5. DECISION GATE

**WINNING STORY:** A crise pós-Takata dos airbags: infladores falsificados que a NHTSA não consegue localizar, 52 milhões que ela não forçou a recolher e uma Takata que nunca terminou.

**TITLE CONCEPT (direção, não o título final):**
- "11 Dead, No Recall: The Airbag Crisis America Never Finished"
- "The Airbag Part a VIN Check Can't Find"
- "Your Airbag Can Become a Bomb in 4 Different Ways"

**WHY THIS STORY:** É o único candidato com 4 camadas independentes, cada uma revelando uma falha diferente do sistema:
- DTN: o mercado falhou (peça sem dono e sem rastro)
- ARC: o regulador falhou (fabricante conhecido, defeito concluído, nenhum recall)
- Takata: a execução falhou (o recall existe, mas o carro continua na rua)
- Joyson: a física persiste (o mesmo tipo de vaso de pressão ainda trinca)

Isso evita a repetição que mataria um vídeo de 50 min sobre um único caso.

**WHY NOW:** 11ª morte em 27/08 e alerta da NHTSA em 03/09; eBay banindo em 14/09; NPR em 24/09; a decisão final do ARC segue pendente.

**EVERGREEN:** STRONG. Todo carro tem airbag, o ARC pode ficar anos sem solução, e a lacuna de rastreabilidade de peças de reposição é estrutural.

**DEMAND:** MÉDIA. "takata airbag" com 13k/mês e +164%; tema em alta no noticiário; a palavra "Takata" tem reconhecimento de marca.

**DUPLICATION:** GENUINELY NEW STORY (nenhum vídeo de airbag no catálogo de 20).

**PRIMARY EVIDENCE:** Initial e Final Decisions da NHTSA sobre o DTN (abr/2026), Federal Register 2026-06620, press release NHTSA de 03/09/2026, Initial e Supplemental Decisions do ARC (2023/2024), memorando de dez/2024, recall 26V325, Takata Spotlight. Ver a tabela da seção 4.

**REVELATION 1:** A NHTSA usou sua ferramenta mais forte em 20+ anos e ela não alcança os carros: não há lista de VIN, não há importador, e o dono paga a inspeção e a troca. A busca de recall que todo mundo faz não detecta a peça.

**REVELATION 2:** Em pelo menos um caso documentado pelo WSJ, o inflador foi comprado no eBay **por uma concessionária**. A cadeia de confiança "levei na oficina certa" também falhou. (Tratar como caso único documentado.)

**REVELATION 3:** O mesmo regulador concluiu em 2023 que ~52M de infladores ARC (GM, Ford, Stellantis, Hyundai, Kia, VW, BMW, Toyota, Tesla e outras) eram defeituosos, pediu recall, recuou em dez/2024 e, em out/2026, não há decisão final. A ordem compulsória foi usada contra um fabricante chinês sem presença nos EUA, não contra o fabricante conhecido. (Contraponto obrigatório: 7 rupturas em dezenas de milhões; ARC diz que são anomalias isoladas.)

**POSSIBLE REVELATION 4:** São quatro modos físicos de falha (propelente que degrada / saída bloqueada por escória de solda / carcaça abaixo do padrão / trinca + umidade → corrosão sob tensão) com um único ponto cego: o sistema de recall rastreia o **carro**, não a **peça**.

**EXPECTED RUNTIME:** 55–60 min (~8.300–9.000 palavras a ~150 wpm). Material para 50+ sem enchimento; se o Ato 4 (Takata) passar de 9 min, cortar.

**RETENTION STRUCTURE:** ver o mapa abaixo. São 6 atos com open loop explícito em cada transição, e a promessa de abertura ("4 maneiras + o que fazer com o seu carro") é paga no Ato 6.

**MAIN RISK:**
1. **Canal sem base de audiência.** 9 inscritos e 0–99 views por vídeo. O teste vai gerar dados estatisticamente fracos. Defina o critério de sucesso **antes** de publicar (sugestão: watch time total ≥ 2× a média dos vídeos de 10 min; AVD ≥ 6 min).
2. **Risco jurídico e factual.** Mortes, empresa nomeada (DTN), ARC contesta. Linguagem obrigatória: "NHTSA says", "initially concluded", "likely illegally imported". Nunca "counterfeit" como fato próprio do canal, só atribuído.
3. **Fontes primárias lidas via resumo.** nhtsa.gov e federalregister.gov estão bloqueados neste ambiente. Os PDFs precisam ser lidos diretamente antes do roteiro (lista abaixo).
4. **Gravidade da Takata.** A concorrência é enorme; o Ato 4 precisa ser curto e só sobre o que **não terminou**.
5. **Repetição.** Três histórias de "inflador explode". Mitigação: cada ato responde a uma pergunta diferente (quem fez / quem deveria agir / quem não apareceu / a física).

**PASS / FAIL:** **PASS** (condicionado à leitura direta dos PDFs da NHTSA antes do roteiro)

---

## 6. RETENTION MAP (alvo: 58 min)

| TIME | WHAT VIEWER KNOWS | NEW INFORMATION | OPEN QUESTION | PAYOFF | NEXT CURIOSITY GAP |
|---|---|---|---|---|---|
| 0:00 | Nada | 27/ago/2026, Dallas: batida leve, Equinox 2018, motorista morto, e não foi pela batida | O que matou? | Foi o airbag | Como um airbag mata? |
| 0:45 | O airbag matou | É a 11ª morte pela mesma peça; a 1ª também foi em Dallas, em 2023 | Por que ninguém parou isso em 3 anos? | (parcial) existiu uma proibição federal | Se foi proibido, por que continua matando? |
| 1:40 | Há uma proibição | A busca pelo VIN não encontra essa peça; não há recall possível | Então como eu sei se está no meu carro? | Promessa: até o fim, você vai saber | E não é o único problema |
| 2:30 | Existe a peça falsa | 52M de infladores que o governo chamou de defeituosos não foram recolhidos; a Takata ainda não acabou | Como tudo isso coexiste? | Promessa do vídeo: 4 maneiras de um airbag virar bomba + o que fazer | Primeiro: o que é um inflador |
| 3:30 | Contexto geral | O inflador é um vaso de pressão pirotécnico que dispara em ~30 ms | O que pode dar errado num objeto tão simples? | As 4 falhas: propelente, saída, carcaça, trinca | Qual delas é a do DTN? |
| 5:30 | A anatomia | Por que a NHTSA considera o airbag um dos maiores salvadores de vidas ⚠️(verificar número) | Se salva tanto, por que o risco é tolerado? | Trade-off: o risco é raro e a proteção é enorme | Até a peça deixar de ser a original |
| 7:00 | A estrutura | Um carro bate e o airbag dispara. Custo de reposição OEM ~US$ 1.000 vs ~US$ 100 online | Quem compra o de US$ 100? | Mercado de salvados, roubo de airbag, reparos baratos | De onde vem o de US$ 100? |
| 9:00 | A economia | Jilin Province Detiannuo, China; marcação DTN60DB; "likely illegally imported" | Quem importou? | Ninguém sabe: não há registro | Quando a NHTSA soube? |
| 10:30 | A origem | Linha do tempo: morte em mai/2023, VOQ em jun/2023, WSJ ligando a 5 mortes em set/2025, EA só em out/2025 | Por que ~29 meses? | Contexto do que exige um EA (sem acusar sem prova) | O que a NHTSA fez quando agiu? |
| 12:30 | A demora | Abr/2026: Initial Decision → Final Decision em 28 dias, a primeira ordem compulsória em 20+ anos | Resolveu? | **REVELATION 1:** não alcança os carros: sem VIN, sem lista, o dono paga | Então quem instalou essas peças? |
| 15:00 | A ordem é cega | Casos: Malibu e Sonata com inflador trocado depois de batida | Foi oficina de fundo de quintal? | **REVELATION 2:** WSJ: um deles foi comprado no eBay por uma concessionária | Se até concessionária compra, onde está a barreira? |
| 17:30 | A cadeia falhou | Amazon, Meta, Temu e Alibaba já baniam; o eBay só baniu em set/2026, depois do WSJ | O banimento resolve? | Não: as peças já instaladas continuam lá | E está se espalhando? |
| 19:00 | O mercado reagiu | 11ª morte num Equinox: o 1º caso fora de Malibu/Sonata; 14 batidas | Quais modelos são vulneráveis? | A NHTSA diz que não se limita a esses modelos | Ponte: e quando o fabricante é conhecido? |
| 21:00 | O DTN é um fantasma | ARC: Knoxville, Tennessee; fornece GM, Ford, Hyundai, VW, BMW, Tesla… | O ARC também mata? | 1ª ruptura em 2009; morte em 2014 (Kia Optima, NM) | Por que levou anos? |
| 23:30 | O ARC existe | Mecanismo: escória da solda por fricção bloqueia a saída e a pressão rasga a carcaça | É raro? | 7 rupturas confirmadas nos EUA (dentro de dezenas de milhões) | Raro o bastante para ignorar? |
| 25:30 | A física do ARC | 2015–16: investigação; Traverse 2015 em 2021 | O que a NHTSA concluiu? | Abr/2023: pedido de recall de 67M; a ARC recusa | O que acontece quando o fabricante diz não? |
| 27:30 | A recusa | Set/2023: Initial Decision, ~52M; audiência pública | A agência forçou? | Jul/2024: Supplemental, a NHTSA reafirma | Então o recall saiu? |
| 29:30 | A NHTSA reafirmou | **REVELATION 3:** dez/2024, recuo para "mais investigação"; out/2026 sem decisão | Por que recuou? | Comentários da indústria: diferenças entre plantas e linhas | O lado da ARC |
| 32:00 | O recuo | Contraponto: a ARC diz que são anomalias isoladas; a estatística da raridade | Quem está certo? | Recalls parciais: GM (~1M em 2023), BMW, VW | Como fica o dono de um carro ARC? |
| 34:00 | Recalls parciais | Contraste: a ordem compulsória foi contra o DTN, não contra o ARC | É coerência ou conveniência? | Análise: é mais fácil agir contra quem não tem advogado (rotular como análise) | "Raro" é o que a Takata também dizia |
| 36:00 | O contraste | Takata em 90 s: nitrato de amônio, 67M de infladores, 28 mortes nos EUA, falência em 2017 | Isso já não acabou? | Não: em fev/2026, "Do Not Drive" para ~225k Stellantis sem reparo | Por que ainda há carros sem reparo? |
| 38:30 | A Takata não acabou | Envelhecimento: calor + umidade pioram o propelente com o tempo | Os carros sem reparo são os mais perigosos? | Sim: os mais velhos e mais degradados | Para onde vão esses carros? |
| 40:30 | O envelhecimento | Os mais velhos acabam no mercado de usados e salvados, o mesmo mercado que consome o DTN (análise) | Existe um padrão comum? | Os 3 casos convergem para o comprador de usado | E os novos airbags, são seguros? |
| 42:30 | A convergência | Joyson (que comprou os ativos da Takata): recall GM 26V325, trinca + água → corrosão sob tensão | O problema voltou? | Não exagerar: 1 incidente, 2.785 trucks; mas a física persiste | Por que o sistema não pega isso? |
| 45:00 | A física persiste | Como um recall funciona: a lei rastreia o VIN do veículo; peça de reposição sem rastreio | Por que ninguém exige rastreio? | **REVELATION 4:** 4 falhas, 1 ponto cego: o sistema rastreia o carro, não a peça | O que está mudando? |
| 48:00 | O ponto cego | Respostas: banimentos de plataformas, alerta da NHTSA às concessionárias, inspeção recomendada | Basta? | O que cobre e o que não cobre | Quem está mais exposto? |
| 50:30 | As respostas | Perfil de risco: usado, já batido, reparado fora da rede, título rebuilt | Sou eu? | Diagnóstico em 3 perguntas | O que fazer hoje |
| 52:30 | O perfil | Checklist: VIN (Takata/ARC); airbag disparou desde 2020?; quem reparou?; inspeção profissional; não fazer você mesmo; não dirigir se achar DTN | Quanto custa? | O dono paga (NHTSA) + estimativas ⚠️ | E na compra do usado? |
| 55:00 | O que fazer | Na compra de usado: histórico, inspeção do sistema SRS, desconfiar de reparo barato | — | Promessa cumprida (4 falhas + o que fazer) | Fecho |
| 56:30 | Tudo | Volta a Dallas: duas mortes na mesma cidade, com três anos de diferença, pela mesma peça | O que mudou entre as duas? | Uma proibição que não encontra os carros | Fim |

Micro-beats (a cada 30–90 s, dentro dos blocos): cada bloco acima tem 2–3 mudanças internas (dado novo, citação de documento, comparação numérica ou contradição). O detalhamento linha a linha fica para depois da aprovação.

---

## 7. Antes de escrever o roteiro (pré-requisitos)

Ler diretamente (bloqueados nesta sessão):
1. `nhtsa.gov/sites/nhtsa.gov/files/2026-04/2026-04-01-dtn-recall-initial-decision-web.pdf`
2. `nhtsa.gov/sites/nhtsa.gov/files/2026-04/final-decision-air-bag-inflator-marked-DTN60DB-04292026.pdf`
3. `federalregister.gov/documents/2026/04/06/2026-06620`
4. `nhtsa.gov/press-releases/banned-chinese-air-bag-inflator-kills-11th-person-us`
5. `nhtsa.gov/air-bags/deadly-air-bag-replacements`
6. `federalregister.gov/documents/2023/09/08/2023-19441` (ARC Initial Decision: lista de rupturas)
7. `nhtsa.gov/sites/nhtsa.gov/files/2024-07/ARC-Supplemental-Initial-Decision-NHTSA-2023-0038-web.pdf`
8. `static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V325-1180.pdf` (Joyson/GM)
9. A reportagem do WSJ de jul/2026 (caso eBay/concessionária) e a de set/2025 (5 mortes)
10. `vehicle-safety.org/stories/counterfeit-airbag-phantom-recall` (análise, rotular como opinião)

Itens ⚠️ a resolver: local da morte ARC de 2021; vigência do padrão chinês; número de vidas salvas por airbag segundo a NHTSA; redação exata sobre quem paga a inspeção.

## Fontes consultadas (web)
- https://www.motor1.com/news/807606/banned-chinese-air-bag-inflator/
- https://www.kbb.com/car-news/nhtsa-banned-airbags-have-now-killed-11-people/
- https://www.npr.org/2026/09/24/nx-s1-5978124/ebay-bans-airbags-faulty-counterfeit-auto-parts
- https://www.repairerdrivennews.com/2026/09/14/ebay-bans-sale-of-airbags-and-inflators-on-site/
- https://www.repairerdrivennews.com/2025/09/29/wall-street-journal-nhtsa-believes-chinese-aftermarket-air-bag-parts-connected-to-five-deaths/
- https://hudsonvalley.news12.com/deadly-replacement-air-bags-may-not-show-up-in-vin-recall-searches-nhtsa-warns
- https://vehicle-safety.org/stories/counterfeit-airbag-phantom-recall
- https://www.washingtontimes.com/news/2024/dec/18/u-retreats-massive-air-bag-recall/
- https://fortune.com/2024/12/19/us-hits-pause-massive-recall-nearly-50-million-automobile-air-bag-inflators
- https://www.cbsnews.com/news/arc-delphi-airbag-recall-52-million-nhtsa/
- https://www.autobodynews.com/news/deadly-takata-airbags-linked-to-28th-u-s-fatality
- https://www.wfsb.com/2026/02/12/fca-issues-do-not-drive-warning-vehicles-with-unrepaired-takata-airbags/
- https://pickuptrucktalk.com/2026/06/2018-2019-chevrolet-silverado-1500-2500-3500-gmc-sierra-1500-2500-3500-recall-2-7k-roof-rail-airbag-issue/
- https://www.local10.com/business/2026/08/21/tesla-recalls-nearly-3m-vehicles-in-china-over-door-handle-safety-risks/
- https://electrek.co/2026/07/24/nhtsa-denies-tesla-door-release-defect-petition-opens-rulemaking/
- https://www.cnbc.com/2026/01/29/first-brands-founder-patrick-james-and-his-brother-indicted-for-fraud.html
- https://natlawreview.com/article/doj-revives-rare-financial-kingpin-statute-expanded-prosecution-tricolor-founder
- https://news.bloomberglaw.com/bankruptcy-law/tricolor-founder-daniel-chu-gets-october-trial-on-fraud-charges
- https://gmauthority.com/blog/2026/08/gm-6-2l-l87-engine-post-recall-failures-piling-up-nhtsa-investigation-shows/
- https://www.cnbc.com/2026/09/30/stellantis-guidance-turnaround-plan.html
- https://www.motor1.com/news/789583/ford-2026-recalls-list-models-affected/
- https://electrek.co/2026/09/24/comma-ai-openpilot-nhtsa-investigation-crashes/
- https://www.detroitnews.com/story/business/autos/2026/09/04/tesla-faces-nhtsa-probe-over-cybercab-deployment/91609788007/
- https://www.euronews.com/2026/09/25/over-28-million-audi-and-volkswagen-vehicles-face-recall-worldwide
