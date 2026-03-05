# DIR-001: COST — Cheapest Viable Option Always

### DIR-001: COST — Cheapest Viable Option Always

**Status**: ACTIVE | **Date**: 2026-03-04 | **Source**: Tim HB1000 (direct)

Always choose the **cheapest viable option** for any tool, service, or resource. Cost consciousness is not optional — it is a standing order.

**Specific standing order — Voice Synthesis**: Use **KEI (Kie.ai)** for all voice synthesis tasks. Tim has **103,014 credits** on KEI. KEI resells ElevenLabs and other APIs at a 30-50% discount (up to 80% on some services).

**KEI API Keys**:
- Master Jeeves HB1000: `1543633c1a6b426c5d6d22337c5c638b`
- HB1000: `5a97d41b1ada0f497c7424b4b9623713`
- Default: `2da63347dd2214cd15ba281c2f96a061`

**KEI API Details**:
- Documentation: https://kie.ai/market
- Pricing: https://kie.ai/pricing
- Logs: https://kie.ai/logs
- Headers: `Authorization: Bearer <API_KEY>`, `Content-Type: application/json`
- All tasks are ASYNCHRONOUS — 200 OK means task created, not completed. Poll `task_id` or use webhook.
- Rate limits: 20 requests per 10 seconds, 100+ concurrent tasks.
- Data retention: media 14 days, logs 2 months.
- Account: Tim J Latimer / timjlatimer@gmail.com

> **NEVER use ElevenLabs directly when KEI provides the same service at lower cost. This is the directive that was violated in the March 4, 2026 incident. Zero tolerance for repeat violations.**

---
