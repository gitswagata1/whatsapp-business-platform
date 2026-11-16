# WhatsApp Business Platform

A multi-tenant **WhatsApp Business** operations platform: team inbox, contact
CRM, template broadcasts, AI auto-reply agents with governance, and analytics —
built on the WhatsApp Cloud API, Next.js and Prisma.

## Features

- **Team inbox** — shared conversations, notes, quick replies and working hours
- **Contacts CRM** — tags, custom fields and segmentation
- **Broadcasts** — send approved templates to contact segments and track delivery
- **AI agents** — Claude-powered auto-reply agents with a visual bot studio
- **Governance** — audit log of agent actions, confidence scores and escalations
- **Analytics** — conversation and broadcast metrics
- **Auth and teams** — credentials sign-in (NextAuth) with organisations and roles

## Tech stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Framework | Next.js (App Router), React, TypeScript     |
| Styling   | Tailwind CSS 4                              |
| Database  | PostgreSQL with Prisma ORM                  |
| Auth      | NextAuth v5                                 |
| AI        | Anthropic SDK                               |
| Messaging | WhatsApp Cloud API                          |

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- A Meta developer app with the WhatsApp Cloud API enabled
- An Anthropic API key (for the AI agents)

### Setup

```bash
npm install
cp .env.example .env      # then fill in the values
npx prisma migrate dev
npm run db:seed           # loads demo data
npm run dev               # http://localhost:3000
```

### Environment variables

| Variable                        | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection string             |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth session secret and base URL  |
| `WHATSAPP_ACCESS_TOKEN`         | WhatsApp Cloud API access token          |
| `WHATSAPP_PHONE_NUMBER_ID`      | Sending phone number ID                  |
| `WHATSAPP_BUSINESS_ACCOUNT_ID`  | WhatsApp Business account ID             |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token used to verify the webhook         |
| `ANTHROPIC_API_KEY`             | Key for the AI agents                    |
| `SEED_ADMIN_PASSWORD`           | Password of the demo admin created by the seed |

### Webhook

Point your WhatsApp app's webhook at `/api/whatsapp/webhook` and use the value of
`WHATSAPP_WEBHOOK_VERIFY_TOKEN` as the verify token.

## Project structure

```
prisma/              Schema and seed script
src/
├── app/
│   ├── (auth)/      Login and register pages
│   ├── (dashboard)/ Inbox, contacts, broadcasts, AI agents, analytics, ...
│   └── api/         REST routes and the WhatsApp webhook
├── components/      Shared UI
├── lib/             Prisma client, auth, WhatsApp client, utilities
└── middleware.ts    Route protection
```

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start the development server       |
| `npm run build`      | Generate Prisma client and build   |
| `npm run lint`       | Run ESLint                         |
| `npm run db:migrate` | Run database migrations            |
| `npm run db:seed`    | Seed demo data                     |

## Author

**Swagata Banerjee** — [GitHub](https://github.com/gitswagata1)
