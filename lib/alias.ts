/**
 * Persistent per-channel aliases (FR-CHAT-005). An alias is generated once and
 * stored on `channel_members.alias_name`, so classmates can recognise the same
 * anonymous voice across days. The alias is display-only — `messages.sender_id`
 * always keeps the real identity for moderators.
 */
const ADJECTIVES = [
  "silent", "brave", "clever", "cosmic", "curious", "electric", "fuzzy", "gentle",
  "hidden", "lucky", "midnight", "neon", "quiet", "rapid", "sunny", "swift",
  "velvet", "wandering", "wild", "zesty",
];

const ANIMALS = [
  "fox", "otter", "panda", "tiger", "falcon", "koala", "lion", "owl", "raven",
  "seal", "shark", "sparrow", "turtle", "whale", "wolf", "yak", "zebra", "cobra",
  "dolphin", "gecko",
];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Same user + channel → same alias, unless the member row already stores one. */
export function generateAlias(userId: string, channelId: string): string {
  const h = hash(`${userId}:${channelId}`);
  const adjective = ADJECTIVES[h % ADJECTIVES.length]!;
  const animal = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length]!;
  const number = String((h % 90) + 10);
  const name = `${capitalise(adjective)}${capitalise(animal)}${number}`;
  return name.slice(0, 30);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
