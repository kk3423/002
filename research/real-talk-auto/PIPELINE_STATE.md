# Real Talk Auto — Pipeline State

Última atualização: 2026-10-02

## Fonte de verdade
- Canal: Real Talk Auto — `UCsevpZpQnMV2_iDsFfdcouQ` (conectado via vidIQ)
- Estado em 2026-10-01: 20 vídeos long-form (4:34–11:45), 9 inscritos, 219 views totais
- Primeiro vídeo: 2026-09-13 · Cadência: 1–3 vídeos/dia
- Nenhum vídeo acima de 12 min. Formato 50+ min nunca testado.

## Baseline de retenção (YouTube Analytics, 2026-09-01 → 2026-10-01)
| Vídeo | Duração | Views | Avg view duration | Avg % |
|---|---|---|---|---|
| BYD vs Toyota (659x6K6lmjA) | 10:06 | 97 | 3:25 | 34.0% |
| Polestar collapse (ay2Ezhc4Ioc) | 11:23 | 25 | 3:03 | 26.9% |
| VW 100,000 jobs (ziqjp2lV_lI) | 4:34 | 28 | 1:10 | 25.8% |
| Hyundai outsold Ford (3R0S17fZjKU) | 10:18 | 3 | 6:59 | 67.9% |
| Porsche/VW write-off (th3Xz63krKU) | 11:45 | 5 | 6:05 | 51.8% |

Amostra muito pequena: nenhum dado de retenção do canal é estatisticamente confiável ainda.

## Catálogo publicado (zonas de exclusão para duplicação)
| Data | Vídeo | Tema/zona |
|---|---|---|
| (em produção) | Ford BlueCruise / NTSB (20 min) | ADAS Nível 2 / NTSB / monitoramento do motorista — NÃO repetir |
| 10-01 | Why Your SUV Is Legally A Truck | CAFE / classificação SUV / regulação NHTSA |
| 10-01 | GM brake part (EA26006) | GM eBoost / investigação NHTSA sem recall |
| 09-30 | Jeep Grand Cherokee recall: first fix wasn't enough | Recall que falhou / molas |
| 09-30 | Ford Escape & Bronco Sport fire fix | Recall que falhou / injetor 1.5 EcoBoost |
| 09-30 | Tundra engine scandal: replacement engines faulty | V35A / motor substituto falhando (menciona GM L87 nas tags) |
| 09-29 | Toyota made RAV4 hybrid-only | Toyota / estratégia híbrida |
| 09-28 | Hyundai outsold Ford | Detroit / híbridos / Stellantis citada |
| 09-27 | 5 car brands in financial trouble | Nissan, Polestar, Maserati, Jaguar, Infiniti |
| 09-26 | America's longest-lasting cars | Confiabilidade / Toyota |
| 09-24 | Honda's CEO in China | Honda / China |
| 09-24 | Why you can't buy a Chinese car in America | Connected vehicle rule / China |
| 09-23 | Toyota pulling back from EVs | Toyota / bateria sólida |
| 09-23 | Porsche profit / VW €6B write-off | VW / Porsche |
| 09-22 | Xiaomi vs Tesla | Finanças Xiaomi/Tesla (transcrição verificada: não trata de portas/maçanetas) |
| 09-21 | BYD vs Tesla | China / Tesla |
| 09-18 | Volvo 1.1% margin | Volvo / EX30 |
| 09-17 | VW cutting 100,000 jobs | VW |
| 09-16 | BYD vs Toyota | China / Toyota |
| 09-15 | Nissan junk rating | Nissan finanças |
| 09-13 | Polestar collapse | Polestar finanças |

Ângulos já saturados no canal: "o recall/conserto falhou" (Jeep, Ford, Tundra), Toyota (5 vídeos), China vs ocidente (5 vídeos), montadora em crise financeira (6 vídeos).

## Experimentos em andamento
- LONG-FORM 50+ MIN — "After Takata: The Airbag Crisis America Never Finished"
  - Seleção: `longform-50min/2026-10-01_story-selection.md` (aprovada pelo usuário)
  - 1ª validação: NO-GO (`longform-50min/2026-10-01_document-validation.md`), superada pela validação abaixo
  - Validação final: **PASS (escopo reduzido)**. Fontes lidas na íntegra via transcrições de vídeo: NHTSA (primário), NBC/ABC/6abc/WFAA/WPXI/KHOU/CBS8/Autoline/NewsNation/NTD (secundário)
    - Ledger: `/os2-longform/research/evidence-ledger.md`
    - Transcrições: `/os2-longform/data/sources/`
  - Roteiro v1: `/os2-longform/scripts/2026-10-01_post-takata-airbag-crisis_SCRIPT.md`. São 7.174 palavras, ~51 min a 140 wpm; abaixo de 50 min se narrado acima de ~143 wpm.
  - Pacote (títulos, thumbnails, SEO, B-roll, auditorias): `/os2-longform/scripts/2026-10-01_post-takata-airbag-crisis_PACKAGE.md`
  - Auditoria pré-produção (2026-10-02): NEED MICRO-EDITS, 20 itens, ver `/os2-longform/scripts/2026-10-02_pre-production-audit.md`. Projeção: 7.140 palavras, ≤142,8 wpm para 50+. Título: A. Thumbnail: "WHO MADE THIS?".
  - FINAL (2026-10-02): as 20 micro-edições foram aplicadas, mais 2 reescritas de segurança ("no one to recall" → "no one stands behind"). VO: `/os2-longform/scripts/2026-10-02_FINAL_VO_SCRIPT.md` (7.135 palavras). ZinAI: `2026-10-02_ZINAI_CHAPTERS.md` (88 blocos). Upload: `2026-10-02_UPLOAD_PACKAGE.md`.
  - Pendências antes de publicar:
    - Se possível, confirmar nos documentos da NHTSA de abr/2026 os 4 itens que só têm fonte NTD
    - Re-timing dos capítulos após a narração
    - Definir antes da publicação o critério de sucesso do experimento

- 20-MIN DOCUMENTARY — "Ford's Hands-Free BlueCruise Didn't Brake. Investigators Found Out Why" (2026-10-02)
  - Seleção: 13 candidatos. Vencedor: NTSB × Ford BlueCruise (categoria 5, genuinamente nova)
  - Por que venceu: única candidata com fonte primária completa acessível (reunião do NTSB de 31/03/2026, vídeo de 3h44, transcrição inteira lida)
  - Rejeitados: maçanetas eletrônicas (fonte primária bloqueada + Bloomberg ~930k); dados vendidos a seguradoras (saturado em 2026); comma.ai PE26007 (fontes fracas e contraditórias, reavaliar)
  - Pacote completo: `/os2-20min/2026-10-02_bluecruise_MASTER_PACKAGE.md` (20 seções)
  - Roteiro: `/os2-20min/scripts/2026-10-02_bluecruise_SCRIPT.md`. VO limpo: `2026-10-02_bluecruise_VO_PLAIN.txt`
    - 2.956 palavras = 21:06 a 140 WPM / 19:42 a 150 WPM
  - Fontes salvas: `/os2-20min/data/sources/` (NTSB, Ford How-To, Autoline, TechCrunch via reprodução)
  - Pendências: sincronizar capítulos após a narração; checar se a investigação da NHTSA (EA25-001) foi encerrada antes de publicar

## Limitações conhecidas do ambiente
- A política de egress responde 403 para nhtsa.gov, static/api.nhtsa.gov, federalregister.gov, govinfo.gov, regulations.gov, web.archive.org e sites de notícias. Só pypi.org e github.com respondem. O README do proxy proíbe contornar.
- Rota legítima que funciona: transcrições completas de vídeos do YouTube via conector vidIQ (canal oficial USDOTNHTSA + emissoras).
- WebSearch devolve só snippets, que não contam como leitura.
