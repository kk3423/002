# Checkpoint — PATCHED 15.5 (trabalho em andamento, NÃO é a entrega)

Gravado em 2026-10-06 08:02 UTC. Base: PATCHED 15.4 (commit e2029ea).
**Estado: PENDENTE DE VALIDAÇÃO REAL.** Nada aqui afirma que a coleta de e-mail/telefone funciona no Instagram.

## Feito até agora (simulado; nenhuma consulta ao Instagram)
- Fluxo auditado: comentário -> user_id -> GET /api/v1/users/{id}/info/ -> contatos -> armazenamento -> tabela -> exportação.
- Correções 15.5 (ver `PATCHED-15.5-src/PATCH_NOTES.txt`): telefone no registro de validação; endereço realmente enviado; ids acima de 2^53;
  Comment lê a resposta no layout do leitor; exportações do dashboard depois de retomar trazem tudo; telefone inválido; máscara;
  **novo neste checkpoint:** o quadro "Validação de 1 consulta" saiu da notificação flutuante (600x520 px) que cobria Continue/Exportar e foi para dentro do painel.
- Testes: unitários 55, dados 35, Chromium (suíte final + antiga), mutação (26 defeitos). Resultados completos só na entrega.

## Pendente
- Reverificação completa do pacote final extraído numa pasta limpa (última rodada completa foi antes da correção do quadro).
- Revisão de código por um segundo agente (em andamento) + revisão manual registrada.
- Validação real: bloqueada (sem sessão do Instagram, instagram.com bloqueado neste ambiente, nenhuma ferramenta controla o seu Chrome).
- Relatório, ZIP, SHA-256 e evidências da entrega.
