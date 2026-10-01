# Validação documental: crise dos airbags pós-Takata

Data: 2026-10-01 · História aprovada: DTN60DB + ARC/Delphi + Takata inacabada + Joyson
Resultado: **NO-GO para roteiro**. Nenhum documento primário ou secundário pôde ser lido diretamente.

## A) Status dos documentos

Busca local (todo o sistema de arquivos + repositório + Google Drive): **nenhum PDF ou documento encontrado**. As pastas `os2-longform/data/primary/`, `data/` e `downloads/` não existem; `research/` contém só os relatórios escritos nesta sessão.

Acesso direto pela rede (curl + WebFetch): **bloqueado**. A política do ambiente libera só domínios de desenvolvimento (pypi.org, github.com). Sites de governo e de imprensa não respondem.

| Documento | URL | Status |
|---|---|---|
| NHTSA Final Decision DTN60DB (29/04/2026) | nhtsa.gov/sites/nhtsa.gov/files/2026-04/final-decision-air-bag-inflator-marked-DTN60DB-04292026.pdf | INACESSÍVEL |
| NHTSA Initial Decision DTN (abr/2026) | nhtsa.gov/sites/nhtsa.gov/files/2026-04/2026-04-01-dtn-recall-initial-decision-web.pdf | INACESSÍVEL |
| Federal Register 2026-06620 | federalregister.gov/documents/2026/04/06/2026-06620 · public-inspection.federalregister.gov/2026-06620.pdf | INACESSÍVEL |
| NHTSA "Deadly Air Bag Replacements" | nhtsa.gov/air-bags/deadly-air-bag-replacements | INACESSÍVEL |
| NHTSA press release da 11ª morte | nhtsa.gov/press-releases/banned-chinese-air-bag-inflator-kills-11th-person-us | INACESSÍVEL |
| ARC Initial Decision (FR 2023-19441) | federalregister.gov/documents/2023/09/08/2023-19441 · govinfo.gov | INACESSÍVEL |
| ARC Supplemental Initial Decision (jul/2024) | nhtsa.gov/sites/nhtsa.gov/files/2024-07/ARC-Supplemental-Initial-Decision-NHTSA-2023-0038-web.pdf | INACESSÍVEL |
| Memorando NHTSA ARC (dez/2024) | regulations.gov docket NHTSA-2023-0038 | INACESSÍVEL |
| NHTSA Takata Recall Spotlight | nhtsa.gov/vehicle-safety/takata-recall-spotlight | INACESSÍVEL |
| Recall report 26V325 (GM/Joyson) | static.nhtsa.gov/odi/rcl/2026/RCLRPT-26V325-1180.pdf · api.nhtsa.gov | INACESSÍVEL |
| Fontes secundárias (NPR, Motor1, KBB, AP, Autoblog, CBS, Electrek, WSJ) | — | INACESSÍVEIS |

**Correção ao relatório anterior:** os ✅ marcados em `2026-10-01_story-selection.md` vieram de trechos resumidos pelo mecanismo de busca, não de leitura integral das reportagens. Eles não valem como verificação.

## B) Claims verificados

- [PRIMARY VERIFIED]: **0**
- [SECONDARY VERIFIED]: **0**

## C) Claims a remover (todos ficam [UNVERIFIED - REMOVE FROM SCRIPT] até leitura direta)

Coluna "Evidência hoje" = o que os trechos de busca indicam. Isso serve só para priorizar a verificação; não serve como fonte.

| # | Claim | Evidência hoje (não lida) | Conflito ou risco de redação | Documento que fecha |
|---|---|---|---|---|
| 1 | 11 mortes, 14 batidas, 3 feridos graves | 5+ veículos de imprensa repetem a contagem atribuída à NHTSA | Baixo conflito; contagem pode ter mudado | Press release NHTSA da 11ª morte |
| 2 | 11ª morte: 27/08/2026, Dallas, Equinox 2018 | Mesma fonte | — | Press release NHTSA |
| 3 | A busca pelo VIN não identifica o inflador DTN | NHTSA (via News12/Motor1) | — | "Deadly Air Bag Replacements" |
| 4 | A NHTSA não consegue estimar quantos existem | Trecho: "unable to estimate… beyond an initial estimate of 10,000 units" | **Contraditório:** é estimativa ou não? O que os 10.000 medem? | Initial Decision / FR 2026-06620 |
| 5 | Importadores desconhecidos / "likely illegally imported" | NHTSA (via imprensa) | Usar só "likely illegally imported", atribuído; nunca "illegal" | Final Decision |
| 6 | "Primeira ordem compulsória em 20+ anos" | Os termos variam entre as fontes: "first ban", "first prohibition", "first compulsory recall order" | **Termo jurídico incerto** (ban ≠ recall order) | Final Decision + press release |
| 7 | Concessionária comprou o inflador no eBay | Cadeia única: WSJ → NPR → resumo de busca | **Alto risco**: possível erro de paráfrase; WSJ tem paywall | Reportagem original do WSJ (jul/2026) |
| 8 | ~52 milhões de infladores ARC/Delphi | Os números variam: 52M, 67M, ~50M, ~60M | **Número depende do documento**; 52M é da decisão *inicial* | FR 2023-19441 |
| 9 | A NHTSA recuou no ARC (dez/2024) | AP/Fortune/Washington Times | Redação: "said further investigation is warranted"; não "withdrew" nem "dropped" | Memorando dez/2024 (docket NHTSA-2023-0038) |
| 10 | Veículos Takata ainda sem reparo | Os números conflitam: ">5M" (Carfax), "~225k" (FCA), "98% completion" | **Conflito de números e de fontes** | Takata Spotlight + press release Do Not Drive (fev/2026) |
| 11 | Joyson 26V325: 2.785 veículos; trinca + água → corrosão sob tensão; relato de 13/04/2026 | Resumos de sites de picape/recall | Não pode virar "problema sistêmico"; "Joyson = sucessora da Takata" também precisa de fonte | Recall report 26V325 |
| 12 | Final Decision: defeito + proibição de venda e importação | Trecho do PDF via busca | — | Final Decision |
| 13 | Initial Decision: 12 rupturas, 10 mortes, 2 feridos | Trecho via busca | Data conflitante: 1 vs 2 de abril (FR em 6/abr) | Initial Decision + FR |
| 14 | 1º caso: 30/05/2023, Dallas, Malibu 2018; VOQ em 16/06/2023 | Trecho via busca | **Inconsistência:** o VOQ cita Malibu 2020 | Initial Decision |
| 15 | EA aberto em 21/10/2025 | Trecho via busca | — | Initial Decision |
| 16 | "~29 meses" entre a 1ª morte e o EA | Cálculo meu | Deriva de duas datas não verificadas | Itens 14 + 15 |
| 17 | Nome do fabricante | Duas grafias: "…Detiannuo Safety Technology Co., Ltd." vs "…Detiannuo Automobile Safety System Co Ltd" | **Conflito** | FR 2026-06620 |
| 18 | Uso de "counterfeit" | A imprensa usa o termo; a NHTSA usa "substandard"/"defect" | Nunca como afirmação do canal | Final Decision |
| 19 | Inspeção para quem teve deploy desde 2020 / o dono paga inspeção e troca | Trechos via imprensa | Redação exata importa (orientação ≠ obrigação) | "Deadly Air Bag Replacements" |
| 20 | Preço: ~US$ 100 vs ~US$ 1.000 OEM | Trecho atribuído à NPR/AP | — | Reportagem lida |
| 21 | Amazon, Meta, Temu e Alibaba já proibiam airbags | Trecho da NPR | — | Reportagem lida |
| 22 | eBay: anúncio em 14/09; vigência em 24/09 | A vigência vem de descrição de vídeo concorrente | Fonte fraca | Comunicado do eBay |
| 23 | WSJ ligou peças chinesas a 5 mortes (set/2025) | Trecho via Repairer Driven News | — | WSJ/RDN lido |
| 24 | ARC: 1ª ruptura 29/01/2009 (OH); morte 08/04/2014 (NM, Optima 2004); morte do Traverse em 2021 | Trechos de escritórios de advocacia | **Local da morte de 2021: MI vs KY** | FR 2023-19441 |
| 25 | ARC recusou o pedido de recall de 67M (abr/2023) | AP via busca | — | Carta NHTSA / FR 2023-19441 |
| 26 | Lista de montadoras com ARC (BMW… VW) | Trecho de site jurídico | Fonte fraca | FR 2023-19441 |
| 27 | Recalls parciais ARC (GM ~1M em 2023, BMW, VW) | Trechos | — | Recall reports |
| 28 | Posição da ARC: "anomalias isoladas" | Trechos | É alegação da ARC; precisa de citação literal | Comentários da ARC no docket |
| 29 | Takata: 28 mortes nos EUA; 67M+ infladores | Vários trechos | — | Takata Spotlight |
| 30 | Número de vidas salvas por airbags | Nunca pesquisado | — | Dado NHTSA |
| 31 | Mecanismo ARC (escória de solda bloqueia o orifício) | Trechos | — | FR 2023-19441 |
| 32 | Base legal (49 U.S.C. 30118/30120) | Conhecimento prévio, sem fonte | — | Final Decision |
| 33 | Análise "The Crash Report" (ordem usada contra o alvo errado) | Trechos | É opinião; só como opinião atribuída | Artigo lido |

## D) GO / NO-GO

**NO-GO.** Nenhum claim atinge [PRIMARY VERIFIED] ou [SECONDARY VERIFIED]. Os claims centrais (#1, #3, #5, #6, #8, #9) não podem ir para o roteiro.

Para desbloquear (qualquer um dos dois):
1. Liberar na rede do ambiente: `www.nhtsa.gov`, `static.nhtsa.gov`, `api.nhtsa.gov`, `www.federalregister.gov`, `public-inspection.federalregister.gov`, `www.govinfo.gov`, `www.regulations.gov` (opcional: `www.npr.org`, `apnews.com`).
2. Ou baixar os 10 documentos da tabela A e commitar em `os2-longform/data/primary/` (ou subir no Google Drive). O WSJ tem paywall: sem o texto, o claim #7 sai do roteiro de qualquer forma.
