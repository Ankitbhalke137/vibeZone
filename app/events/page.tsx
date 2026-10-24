import { ComingSoon } from "@/components/coming-soon";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <ComingSoon
      title="Campus Events"
      week="Week 4"
      desc="Event listings, RSVP and reminders that arrive 24h and 1h before they start."
    />
  );
}
