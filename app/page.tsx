import { getDashboardData } from "@/lib/dashboard-data";
import { Hero } from "@/components/dashboard/hero";
import { LiveCard } from "@/components/dashboard/live-card";
import { PollCard } from "@/components/dashboard/poll-card";
import { Happenings } from "@/components/dashboard/happenings";
import { CourseTracker } from "@/components/dashboard/course-tracker";
import { AnnouncementsEvents } from "@/components/dashboard/announcements-events";
import { NotesLostFound } from "@/components/dashboard/notes-lostfound";
import { SeniorsConnect } from "@/components/dashboard/seniors-connect";
import { RightRail } from "@/components/dashboard/right-rail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home",
  description: "Your campus in one place — announcements, chat, events, notes, polls and more.",
};

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-4">
        <Hero user={data.user} stats={data.stats} newAnnouncements={data.announcements.length} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LiveCard />
          <PollCard poll={data.poll} isAuthed={data.isAuthed} />
        </div>

        <Happenings />
        <CourseTracker />
        <AnnouncementsEvents announcements={data.announcements} events={data.events} />
        <NotesLostFound notes={data.notes} lostFound={data.lostFound} />
        <SeniorsConnect seniors={data.seniors} />
      </div>

      <aside className="min-w-0">
        <RightRail
          weekly={data.leaderboard.weekly}
          allTime={data.leaderboard.allTime}
          you={data.you}
          channels={data.channels}
        />
      </aside>
    </div>
  );
}
