-- ============================================================
-- VibeZone hardening pass (PRD §10 note + D7)
-- Prisma cannot express CHECK constraints → apply AFTER db push:
--   npm run db:harden     (idempotent — safe to re-run)
-- ============================================================

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_role_chk
    CHECK (role IN ('student','senior','club_leader','moderator','faculty','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT users_status_chk
    CHECK (status IN ('active','banned','deleted'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE channels ADD CONSTRAINT channels_type_chk
    CHECK (type IN ('global','dm','mentorship'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE messages ADD CONSTRAINT messages_body_len_chk
    CHECK (length(body) BETWEEN 1 AND 4000);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE message_reports ADD CONSTRAINT message_reports_reason_chk
    CHECK (reason IN ('abuse','spam','explicit','other'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE message_reports ADD CONSTRAINT message_reports_status_chk
    CHECK (status IN ('open','dismissed','actioned'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT events_status_chk
    CHECK (status IN ('draft','published','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE event_rsvps ADD CONSTRAINT event_rsvps_status_chk
    CHECK (status IN ('going','maybe','not_going'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE notes ADD CONSTRAINT notes_link_https_chk
    CHECK (external_link ~ '^https://');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE notes ADD CONSTRAINT notes_type_chk
    CHECK (type IN ('Notes','PYQ','Lab','Slides','Other'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE polls ADD CONSTRAINT polls_status_chk
    CHECK (status IN ('draft','scheduled','open','closed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE feedback ADD CONSTRAINT feedback_message_len_chk
    CHECK (length(message) BETWEEN 10 AND 1000);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE feedback ADD CONSTRAINT feedback_status_chk
    CHECK (status IN ('open','in_review','resolved'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE lost_and_found ADD CONSTRAINT lnf_type_chk
    CHECK (type IN ('lost','found'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE lost_and_found ADD CONSTRAINT lnf_status_chk
    CHECK (status IN ('open','resolved'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mentorship_requests ADD CONSTRAINT mentor_status_chk
    CHECK (status IN ('pending','accepted','rejected','expired','ended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE mentorship_requests ADD CONSTRAINT mentor_self_chk
    CHECK (student_id <> senior_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Performance indexes (feed + queues)
CREATE INDEX IF NOT EXISTS idx_ann_feed ON announcements (pinned DESC, publish_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_bucket ON point_ledger (bucket_date, user_id);

DO $$ BEGIN
  ALTER TABLE broadcasts ADD CONSTRAINT broadcasts_status_chk
    CHECK (status IN ('live','upcoming','ended'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE clubs ADD CONSTRAINT clubs_category_chk
    CHECK (category IN ('tech','robotics','sports','business','cultural','content','social-welfare'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE clubs ADD CONSTRAINT clubs_status_chk
    CHECK (status IN ('active','archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE club_positions ADD CONSTRAINT club_positions_status_chk
    CHECK (status IN ('open','closed','filled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE club_applications ADD CONSTRAINT club_applications_status_chk
    CHECK (status IN ('submitted','reviewed','interviewed','elected','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_club_app_user ON club_applications (user_id);
CREATE INDEX IF NOT EXISTS idx_club_app_status ON club_applications (status);
