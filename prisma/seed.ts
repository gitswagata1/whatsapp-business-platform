import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) throw new Error("Set SEED_ADMIN_PASSWORD before seeding.");
  const hashedPassword = await bcrypt.hash(seedPassword, 12);

  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Acme Co",
      plan: "PRO",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "OWNER",
      organizationId: org.id,
    },
  });

  const waAccount = await prisma.whatsAppAccount.upsert({
    where: { phoneNumber: "15550000000" },
    update: {},
    create: {
      phoneNumber: "15550000000",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "CONFIGURE_ME",
      wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "CONFIGURE_ME",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "CONFIGURE_ME",
      businessName: "Acme Co",
      organizationId: org.id,
    },
  });

  // Create default tags
  const tags = [
    { name: "VIP", color: "#f59e0b" },
    { name: "New Lead", color: "#25d366" },
    { name: "Follow Up", color: "#6366f1" },
    { name: "Interested", color: "#ec4899" },
    { name: "Converted", color: "#10b981" },
    { name: "Support", color: "#3b82f6" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: {
        name_organizationId: { name: tag.name, organizationId: org.id },
      },
      update: {},
      create: { ...tag, organizationId: org.id },
    });
  }

  // Create default AI agent
  await prisma.aIAgent.upsert({
    where: { id: "default-agent" },
    update: {},
    create: {
      id: "default-agent",
      name: "Acme Assistant",
      description:
        "24/7 AI assistant for Acme Co - handles product queries, pricing, and support",
      systemPrompt: `You are the AI assistant for Acme Co. You help customers with:
- Product information and specifications
- Pricing and availability
- Order status and tracking
- General support queries

Be professional, concise, and helpful. Keep responses under 300 characters for WhatsApp readability.
If you don't know something, politely ask the customer to speak with a human agent.`,
      knowledgeBase: "Configure your product catalog, pricing, and FAQ information here.",
      model: "claude-sonnet-4-20250514",
      temperature: 0.5,
      maxTokens: 512,
      organizationId: org.id,
    },
  });

  // Create default message templates
  const templates = [
    {
      name: "welcome_message",
      category: "MARKETING",
      body: "Hello {{1}}! Welcome to Acme Co. How can we help you today?",
      footer: "Acme Co",
      status: "APPROVED",
    },
    {
      name: "order_confirmation",
      category: "UTILITY" ,
      body: "Hi {{1}}, your order #{{2}} has been confirmed. Expected delivery: {{3}}. Thank you for choosing Acme Co!",
      footer: "Acme Co",
      status: "APPROVED" ,
    },
    {
      name: "follow_up",
      category: "MARKETING" ,
      body: "Hi {{1}}, we noticed you were interested in our products. Would you like to know more? Reply YES to connect with our team.",
      footer: "Acme Co",
      status: "APPROVED" ,
    },
    {
      name: "feedback_request",
      category: "UTILITY" ,
      body: "Hi {{1}}, thank you for your recent purchase from Acme Co! We'd love to hear your feedback. How was your experience? (1-5)",
      footer: "Acme Co",
      status: "APPROVED" ,
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: {
        name_organizationId: {
          name: template.name,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        ...template,
        organizationId: org.id,
        whatsappAccountId: waAccount.id,
      },
    });
  }

  // Create default working hours
  const workingDays = [
    { day: 1, start: "09:00", end: "18:00" },
    { day: 2, start: "09:00", end: "18:00" },
    { day: 3, start: "09:00", end: "18:00" },
    { day: 4, start: "09:00", end: "18:00" },
    { day: 5, start: "09:00", end: "18:00" },
    { day: 6, start: "10:00", end: "14:00" },
  ];

  for (const wd of workingDays) {
    await prisma.workingHours.upsert({
      where: {
        dayOfWeek_organizationId: {
          dayOfWeek: wd.day,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        dayOfWeek: wd.day,
        startTime: wd.start,
        endTime: wd.end,
        isActive: true,
        autoReplyMessage:
          "Thank you for reaching out to Acme Co! We're currently outside business hours. We'll get back to you soon.",
        organizationId: org.id,
      },
    });
  }

  // Create quick replies
  const quickReplies = [
    { shortcut: "/hi", message: "Hello! Welcome to Acme Co. How can I help you today?" },
    { shortcut: "/thanks", message: "Thank you for choosing Acme Co! Is there anything else I can help you with?" },
    { shortcut: "/hours", message: "Our business hours are Mon-Fri 9AM-6PM, Sat 10AM-2PM. We're closed on Sundays." },
    { shortcut: "/wait", message: "Thank you for your patience. Let me check on that for you." },
    { shortcut: "/transfer", message: "Let me connect you with a specialist who can help you better." },
  ];

  for (const qr of quickReplies) {
    await prisma.quickReply.upsert({
      where: {
        shortcut_organizationId: {
          shortcut: qr.shortcut,
          organizationId: org.id,
        },
      },
      update: {},
      create: { ...qr, organizationId: org.id },
    });
  }

  console.log("Seed completed for Acme Co");
  console.log("---");
  console.log("Admin login: admin@example.com (password from SEED_ADMIN_PASSWORD)");
  console.log("WhatsApp number: +91 90560 06634");
  console.log("Organization: Acme Co (PRO plan)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
