/**
 * Seed test chat data into Neon database
 * Run with: npx tsx scripts/seed-chat.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding chat test data...\n");

  // 1. Create test users
  console.log("Creating test users...");
  const users = await Promise.all([
    db.user.upsert({
      where: { email: "alice@pwioi.com" },
      create: {
        email: "alice@pwioi.com",
        name: "Alice Johnson",
        handle: "alice_cs",
        branch: "CSE",
        year: 2,
        role: "student",
        onboardedAt: new Date(),
      },
      update: {},
    }),
    db.user.upsert({
      where: { email: "bob@pwioi.com" },
      create: {
        email: "bob@pwioi.com",
        name: "Bob Smith",
        handle: "bob_ece",
        branch: "ECE",
        year: 3,
        role: "student",
        onboardedAt: new Date(),
      },
      update: {},
    }),
    db.user.upsert({
      where: { email: "carol@pwioi.com" },
      create: {
        email: "carol@pwioi.com",
        name: "Carol Davis",
        handle: "carol_mech",
        branch: "ME",
        year: 2,
        role: "senior",
        onboardedAt: new Date(),
      },
      update: {},
    }),
    db.user.upsert({
      where: { email: "david@pwioi.com" },
      create: {
        email: "david@pwioi.com",
        name: "David Chen",
        handle: "david_cse",
        branch: "CSE",
        year: 4,
        role: "moderator",
        onboardedAt: new Date(),
      },
      update: {},
    }),
  ]);

  console.log(`✓ Created ${users.length} users`);
  users.forEach(u => console.log(`   - ${u.name} (@${u.handle}) - ${u.role}`));

  // 2. Create test channels
  console.log("\nCreating test channels...");
  const channels = await Promise.all([
    db.channel.upsert({
      where: { slug: "general" },
      create: {
        slug: "general",
        name: "general",
        type: "global",
        topic: "General campus discussion",
        createdBy: users[0].id,
      },
      update: {},
    }),
    db.channel.upsert({
      where: { slug: "help" },
      create: {
        slug: "help",
        name: "help",
        type: "global",
        topic: "Ask anything - someone always answers",
        createdBy: users[0].id,
      },
      update: {},
    }),
    db.channel.upsert({
      where: { slug: "placements" },
      create: {
        slug: "placements",
        name: "placements",
        type: "global",
        topic: "Drives, prep and opportunity sharing",
        createdBy: users[0].id,
      },
      update: {},
    }),
    db.channel.upsert({
      where: { slug: "memes" },
      create: {
        slug: "memes",
        name: "memes",
        type: "global",
        topic: "Strictly for the laughs",
        createdBy: users[0].id,
      },
      update: {},
    }),
    db.channel.upsert({
      where: { slug: "random" },
      create: {
        slug: "random",
        name: "random",
        type: "global",
        topic: "Off-topic anything goes",
        createdBy: users[0].id,
      },
      update: {},
    }),
  ]);

  console.log(`✓ Created ${channels.length} channels`);
  channels.forEach(c => console.log(`   - #${c.slug} (${c.type})`));

  // 3. Add channel memberships
  console.log("\nAdding channel memberships...");
  for (const channel of channels) {
    for (const user of users) {
      await db.channelMember.upsert({
        where: { channelId_userId: { channelId: channel.id, userId: user.id } },
        create: {
          channelId: channel.id,
          userId: user.id,
          aliasActive: false,
        },
        update: {},
      });
    }
  }
  console.log(`✓ Added memberships for ${users.length} users to ${channels.length} channels`);

  // 4. Create test messages
  console.log("\nCreating test messages...");
  
  const generalChannel = channels.find(c => c.slug === "general")!;
  const helpChannel = channels.find(c => c.slug === "help")!;
  const placementsChannel = channels.find(c => c.slug === "placements")!;
  const memesChannel = channels.find(c => c.slug === "memes")!;

  const alice = users[0];
  const bob = users[1];
  const carol = users[2];
  const david = users[3];

  const messages = await Promise.all([
    // General channel messages
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: alice.id,
        body: "Hello everyone! Welcome to the general channel! 👋",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: bob.id,
        body: "Hey Alice! How's everyone doing today?",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: carol.id,
        body: "Hi all! Just joined the platform. Looks great so far!",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: david.id,
        body: "Welcome @carol_mech! Feel free to ask any questions.",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: alice.id,
        body: "Anyone know when the mid-term results will be out?",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: bob.id,
        body: "I heard they should be out by next week",
        aliasName: null,
        isFlagged: false,
      },
    }),
    
    // Help channel messages
    db.message.create({
      data: {
        channelId: helpChannel.id,
        senderId: bob.id,
        body: "Can someone help me with ECE circuits?",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: helpChannel.id,
        senderId: carol.id,
        body: "I can help! What specifically are you working on?",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: helpChannel.id,
        senderId: bob.id,
        body: "Just started the analog circuits module. Having trouble with op-amps.",
        aliasName: null,
        isFlagged: false,
      },
    }),
    
    // Placements channel messages
    db.message.create({
      data: {
        channelId: placementsChannel.id,
        senderId: david.id,
        body: "TCS is visiting campus next week! Registration closes Friday.",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: placementsChannel.id,
        senderId: alice.id,
        body: "Thanks for the heads up! Already registered.",
        aliasName: null,
        isFlagged: false,
      },
    }),
    
    // Memes channel messages
    db.message.create({
      data: {
        channelId: memesChannel.id,
        senderId: bob.id,
        body: "When you've been coding for 10 hours straight 😵‍💫 #studentlife",
        aliasName: null,
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: memesChannel.id,
        senderId: carol.id,
        body: "Me every Monday morning ☕",
        aliasName: null,
        isFlagged: false,
      },
    }),
    
    // Alias mode message
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: david.id,
        body: "Speaking up anonymously here - the cafeteria food needs improvement!",
        aliasName: "SecretStudent",
        isFlagged: false,
      },
    }),
    db.message.create({
      data: {
        channelId: generalChannel.id,
        senderId: alice.id,
        body: "Haha @SecretStudent speaks the truth! Cafeteria samosas are the only good thing.",
        aliasName: null,
        isFlagged: false,
      },
    }),
  ]);

  console.log(`✓ Created ${messages.length} messages`);
  
  // Print summary
  console.log("\n📊 Summary:");
  console.log(`   Users: ${users.length}`);
  console.log(`   Channels: ${channels.length}`);
  console.log(`   Messages: ${messages.length}`);
  
  console.log("\n✅ All seed data created successfully!");
  console.log("\nYou can now verify in your Neon database or chat UI.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
