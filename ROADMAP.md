# Roadmap

## Vision

An open-source, self-hostable alternative to commercial WhatsApp engagement suites: a team
inbox, CRM, broadcasts and **governed AI agents** that answer customers safely.

## Milestones

### Now

- [ ] Connect AI agents to the inbound webhook, with human hand-off and confidence thresholds
- [ ] Verify the `X-Hub-Signature-256` header on webhook requests
- [ ] Rate limiting on authentication routes
- [ ] Automated tests for API routes and the Prisma layer

### Next

- [ ] Docker Compose for one-command local setup with Postgres
- [ ] Role-based permissions (admin, manager, agent) enforced in middleware and APIs
- [ ] Template management with approval-status sync from Meta
- [ ] Media messages (images, documents, voice notes)
- [ ] Opt-in and opt-out tracking for broadcast compliance

### Later

- [ ] Analytics: first-response time, resolution time, agent workload
- [ ] Knowledge-base retrieval (RAG) for agents
- [ ] Multi-channel inbox (Instagram, Telegram)
- [ ] Hosted multi-tenant SaaS with usage-based billing

## Where this can go

| Direction        | Idea |
| ---------------- | ---- |
| **Startup**      | A WhatsApp customer-engagement SaaS for small and mid-size businesses, priced per seat or per conversation. The governance layer (audit trail, confidence scores, escalation) is the differentiator for regulated industries. |
| **Research**     | Evaluating safe autonomous customer-support agents: escalation policies, hallucination rates and measured customer satisfaction. |
| **Open source**  | Becoming the reference implementation of the WhatsApp Cloud API in Next.js. |

> **Note on intellectual property.** If you plan to patent any novel mechanism built here,
> file **before** publishing details publicly. Public disclosure can affect patentability in
> many jurisdictions. Consult a patent attorney.

## How to help

See [CONTRIBUTING.md](CONTRIBUTING.md) and the issues labelled `good first issue`.
