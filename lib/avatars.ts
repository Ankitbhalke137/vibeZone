/**
 * Avatar presets (FR-AUTH-003 — "upload to OCI Object Storage or preset").
 * Presets are the $0 path for Phase 2: no storage bucket needed.
 * `avatarUrl` stores either `preset:<key>` or a full `https://` URL.
 */
export const AVATAR_PRESETS = [
  { key: "aurora", from: "#22d3ee", to: "#6366f1" },
  { key: "sunset", from: "#f97316", to: "#ec4899" },
  { key: "forest", from: "#22c55e", to: "#0d9488" },
  { key: "grape", from: "#a855f7", to: "#ec4899" },
  { key: "ocean", from: "#0ea5e9", to: "#4f46e5" },
  { key: "gold", from: "#eab308", to: "#f97316" },
  { key: "mint", from: "#34d399", to: "#3b82f6" },
  { key: "rose", from: "#fb7185", to: "#f43f5e" },
] as const;

export type AvatarPresetKey = (typeof AVATAR_PRESETS)[number]["key"];

export const PRESET_KEYS: string[] = AVATAR_PRESETS.map((p) => p.key);

export function presetStyle(key: string): { from: string; to: string } {
  return AVATAR_PRESETS.find((p) => p.key === key) ?? AVATAR_PRESETS[0];
}

export function isValidAvatarUrl(v: string): boolean {
  return (
    (v.startsWith("preset:") && PRESET_KEYS.includes(v.slice(7))) ||
    /^https:\/\/\S{1,500}$/.test(v)
  );
}
