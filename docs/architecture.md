# Architecture

## Request flow

1. **Inbound message.** WhatsApp Cloud API calls `POST /api/whatsapp/webhook`. The route
   verifies the request, finds or creates the `Contact` and `Conversation`, and stores the
   `Message`.
2. **AI agents.** `POST /api/ai-agents/chat` sends an agent's system prompt and the
   conversation to the Anthropic API and returns the reply. Agents are configured in the
   bot studio and stored as `AIAgent` records. The webhook currently stores inbound
   messages only; wiring agent replies into it is a natural next step.
3. **Human reply.** Team members answer from the inbox, which calls `POST /api/whatsapp/send`.
4. **Broadcasts.** `POST /api/broadcasts/[id]/send` fans an approved `Template` out to a
   segment and records one `BroadcastRecipient` row per contact.

## Authentication

- `POST /api/auth/login` verifies a bcrypt hash and sets a signed JWT in the
  `session-token` cookie. The signing key comes from `NEXTAUTH_SECRET` via
  `src/lib/secret.ts`.
- `src/middleware.ts` verifies the token on every request. API routes answer `401` and
  pages redirect to `/login`. Public paths: `/login`, `/register`, the auth endpoints and
  the webhook.

## Multi-tenancy

Each `User`, `WhatsAppAccount`, `Contact`, `Conversation` and `Template` belongs to an
`Organization`. Queries are scoped by the organisation of the signed-in user.

## Folder conventions

| Path                    | Responsibility                                  |
| ----------------------- | ----------------------------------------------- |
| `src/app/api/**`        | Thin route handlers: validate, call lib, respond |
| `src/lib/**`            | Reusable server logic (auth, Prisma, WhatsApp)  |
| `src/app/(dashboard)/**`| Authenticated UI, one folder per feature        |
| `prisma/`               | Schema and seed data                            |
