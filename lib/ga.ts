/**
 * GA4 event helpers (plan Week 2: "GA4 base + sign_up/login/announcement_view events").
 * No-ops when NEXT_PUBLIC_GA4_MEASUREMENT_ID is unset, so local/preview deploys stay clean.
 */

type GaParams = Record<string, string | number | boolean>;

const ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

type GaWindow = Window & {
  gtag?: (command: string, target: string, params?: GaParams) => void;
  dataLayer?: unknown[];
};

export function track(event: string, params: GaParams = {}) {
  if (!ID || typeof window === "undefined") return;
  const w = window as GaWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.gtag?.("event", event, params);
}

/** PRD §13 taxonomy — events used in Phase 2. */
export const ga = {
  signUp: () => track("sign_up", { method: "otp" }),
  login: () => track("login", { method: "otp" }),
  announcementView: (id: string, category: string) =>
    track("announcement_view", { announcement_id: id, category }),
  announcementClick: (id: string) =>
    track("announcement_click", { announcement_id: id }),
  selectContent: (type: string, id: string) =>
    track("select_content", { item_type: type, item_id: id }),
  messageSend: (channelType: string, aliased: boolean) =>
    track("message_send", { channel_type: channelType, aliased }),
  pollView: (id: string) => track("poll_view", { poll_id: id }),
  pollVote: (id: string) => track("poll_vote", { poll_id: id }),
  leaderboardView: (period: string) => track("leaderboard_view", { period }),
  noteView: (subject: string, type: string) =>
    track("note_view", { subject, type }),
  noteOpen: (subject: string, type: string) =>
    track("note_open", { subject, type }),
  eventView: (id: string, category: string | null) =>
    track("event_view", { event_id: id, category: category ?? "" }),
  eventRsvp: (id: string) => track("event_rsvp", { event_id: id }),
  feedbackSubmit: (category: string) => track("feedback_submit", { category }),
  reportCreate: (contentType: string, reason: string) =>
    track("report_create", { content_type: contentType, reason }),
  themeToggle: (mode: string) => track("theme_toggle", { mode }),
};

/** Inlined into the layout when GA4 is configured (kept here so config lives in one place). */
export function gaInitSnippet(id: string): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{send_page_view:true});`;
}
