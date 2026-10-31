import pypandoc

prd = r"""# VibeZone — Product Requirements Document (PRD)

**Version:** 2.2  
**Date:** 31 October 2026  
**Status:** Revised — Architecture, Authentication, APIs and Feature Scope  
**Product Direction:** Hybrid Campus Social Network + Academic Productivity Platform  
**Database:** Neon PostgreSQL  
**Application Framework:** Next.js

---

# 1. Executive Summary

## 1.1 Product Overview

VibeZone is a mobile-first campus platform designed to bring academic activities, campus communication, student interaction and community engagement into one place.

It provides students with a central platform for official announcements, real-time communication, academic resources, events, polls, mentorship, campus services and career opportunities.

The platform aims to replace scattered communication across messaging groups, notice boards and disconnected resources with one organized and moderated campus ecosystem.

**Product tagline:** Everything your campus needs, in one place.

## 1.2 Target Audience

- Students
- Seniors and mentors
- Student club members
- Moderators
- Campus administrators
- Incoming students and public visitors

Initial deployment: One campus, approximately 200 students.

## 1.3 Product Vision

To build a connected campus ecosystem where students can learn, communicate, collaborate, discover opportunities and participate in campus life.

---

# 2. Problems and Solutions

| Problem | VibeZone Solution |
|---|---|
| Official notices get buried in chat groups | Centralized Announcement Board |
| Notes and study materials are scattered | Searchable Notes Repository |
| Students miss campus events | Events, RSVP and reminders |
| No organized way to communicate | Channels and Direct Messages |
| Students hesitate to give feedback | Anonymous Feedback Portal |
| Students struggle to find mentors | Seniors Connect |
| No central academic schedule | Academic Calendar |
| Students cannot easily find campus information | Global Search |
| Placement information is scattered | Placement and Career Hub |
| Students struggle to find project partners | Project Collaboration |
| Students have difficulty finding answers | Campus Q&A Forum |

---

# 3. Product Goals and Success Metrics

| Goal | Target |
|---|---|
| Student adoption | 70% of the initial student population within 6 weeks |
| Activation | 60% of verified users complete their profile and one core action |
| Weekly engagement | At least 100 weekly active users |
| Daily engagement | DAU/WAU ratio of at least 25% |
| Academic resources | At least 30 useful resources |
| Announcement adoption | 90% of official announcements published through VibeZone |
| Feedback trust | At least 20 submissions per month |
| Report handling | 95% of reports reviewed within 24 hours |
| Performance | Mobile p75 LCP below 2.5 seconds |

These targets should be reviewed after launch and adjusted using actual usage data.

---

# 4. User Roles and Permissions

## 4.1 User Roles

| Role | Description |
|---|---|
| Student | Regular verified campus user |
| Senior | Student with additional mentorship capabilities |
| Moderator | Handles reports and community moderation |
| Admin | Manages platform content, users and settings |
| Super Admin | Platform owner with protected administrative permissions |
| Guest | Unauthenticated visitor with access to public content |

A senior remains a student. Senior status should be represented as a capability or profile attribute rather than a completely separate permission hierarchy.

## 4.2 Permission Hierarchy

Student → Senior capabilities → Moderator → Admin → Super Admin.

Permissions must be enforced on the server. Hiding a button in the frontend is not sufficient authorization.

## 4.3 Permission Matrix

| Feature | Student | Senior | Moderator | Admin |
|---|---|---|---|---|
| Read public announcements | Yes | Yes | Yes | Yes |
| Chat and DMs | Yes | Yes | Yes | Yes |
| Submit notes | Yes | Yes | Yes | Yes |
| Create events | No | No | Yes | Yes |
| Moderate content | No | No | Yes | Yes |
| Reveal alias identity | No | No | Authorized | Authorized |
| Manage roles | No | No | No | Yes |
| Manage platform settings | No | No | No | Yes |
| Manage super-admin access | No | No | No | Super Admin only |

All role changes must be audited.

---

# 5. Product Scope and Feature Priorities

Priority definitions:

- **P0:** Essential for the first usable release.
- **P1:** Important features to add in the next release phase.
- **P2:** Advanced features that expand the platform.

## 5.1 P0 — Core Release

| Module | Features |
|---|---|
| Authentication | Campus email OTP, profiles, sessions, roles |
| Announcements | Create, edit, schedule, pin, archive and public viewing |
| Chat | Channels, DMs, alias mode and moderation |
| Events | Events, RSVP and reminders |
| Notes | Resource submission, search, filters and upvotes |
| Polls | Daily polls, voting and results |
| Leaderboard | Weekly and all-time rankings |
| Feedback | Anonymous feedback and admin review |
| Moderation | Reports, warnings, bans and audit logs |
| Notifications | In-app notifications and Web Push |
| System | Responsive UI, PWA, dark/light theme and error tracking |

## 5.2 P1 — Important Product Expansion

All the following features are included in the VibeZone roadmap.

| Module | Features |
|---|---|
| Lost & Found | Lost/found posts, images, filters, resolution status |
| Seniors Connect | Mentor profiles, expertise tags, mentorship requests |
| Academic Calendar | Semesters, exams, assignments, holidays and reminders |
| Global Search | Search announcements, notes/PYQs, events, channels and profiles |
| Study Groups | Create groups, join groups, group discussions and resources |
| Saved Items | Bookmark announcements, notes, events and useful posts |
| Placement Hub | Company information, placement resources, opportunities and preparation material |
| Campus Q&A | Ask questions, answer, upvote and accept answers |
| Personalized Dashboard | Personalized updates, upcoming events, tasks and recommended resources |
| Club Directory | Discover clubs, view activities and find joining information |
| Student Profiles | Skills, interests, academic information and project interests |
| Notification Preferences | Category controls, quiet hours and notification priorities |
| Event Waitlist | Waitlist when capacity is reached and automatic promotion |
| Note Verification | Verified academic resources and content quality indicators |
| DM Safety | Block users, manage blocked accounts and report conversations |
| Report Tracking | View report status and moderation outcomes where appropriate |
| File Uploads | Managed file storage for notes, avatars and images |
| Typing Indicators | Show when another user is typing |
| Presence | Online/offline presence |
| Read Receipts | Message delivery and read status |
| Weekly Trivia | Campus quizzes and leaderboard rewards |
| Announcement Digests | Optional email summaries |
| Calendar Export | Event and academic calendar subscriptions |
| Advanced Search | Search filters, sorting and improved relevance |
| SEO and Sharing | Public page metadata and social previews |

## 5.3 P2 — Advanced Features

All the following features are included in the longer-term roadmap.

| Module | Features |
|---|---|
| AI Campus Assistant | Answer campus-related questions using approved campus information |
| Smart Recommendations | Recommend notes, events, clubs and opportunities |
| Semantic Search | Search by meaning rather than exact keywords |
| Project Partner Matching | Find collaborators based on skills and interests |
| Club Management | Club membership, activities and internal announcements |
| Club Voting | Polls and voting for eligible club decisions |
| Student Marketplace | Moderated student-to-student listings |
| Advanced Gamification | Badges, achievements and monthly seasons |
| Weekly Digest | Personalized weekly campus activity summary |
| Advanced Q&A | Accepted answers, tags, reputation and question discovery |
| Advanced Analytics | Adoption, engagement, module usage and moderation trends |
| Announcement Reactions | Reactions and discussion threads |
| Embedded Polls | Polls inside announcements |
| Live Streaming | External or managed live streaming integration |
| Event Recordings | Recordings and post-event resources |
| Project Collaboration | Shared project spaces and collaboration tools |
| Multi-Campus Support | Separate campus workspaces and access boundaries |
| Mobile Application | Native or wrapped mobile experience |

**Important:** Including a feature in the PRD means it is part of the product roadmap. It does not mean every feature must be built in the first release.

---

# 6. Functional Requirements

## 6.1 Authentication and Session Management

### FR-AUTH — Authentication

| ID | Requirement | Priority |
|---|---|---|
| AUTH-001 | Users can register and log in using an approved campus email address. | P0 |
| AUTH-002 | The approved email domain is configured through `CAMPUS_EMAIL_DOMAINS=pwioi.com`. | P0 |
| AUTH-003 | Email verification uses a six-digit OTP. | P0 |
| AUTH-004 | OTP expires after 10 minutes. | P0 |
| AUTH-005 | Maximum three OTP resends within the configured resend window. | P0 |
| AUTH-006 | OTP abuse triggers temporary lockout and rate limiting. | P0 |
| AUTH-007 | Only one account can exist for a normalized campus email address. | P0 |
| AUTH-008 | Users complete their profile after their first successful verification. | P0 |
| AUTH-009 | Users can log out from their current device. | P0 |
| AUTH-010 | Users can sign out from all active devices. | P0 |
| AUTH-011 | Users can view and revoke active sessions. | P0 |
| AUTH-012 | Users can request account export and deletion. | P1 |
| AUTH-013 | Admins can suspend or restore accounts. | P0 |
| AUTH-014 | Admins can assign or revoke moderator permissions. | P0 |
| AUTH-015 | Suspicious login and authentication activity is logged. | P0 |

### 6.1.1 OTP Verification Flow

1. User enters campus email.
2. Server normalizes the email and validates its domain.
3. Server checks whether the account is eligible to log in.
4. Server applies IP and email rate limits.
5. Server generates a cryptographically secure six-digit OTP.
6. OTP is stored as a keyed hash, never as plaintext.
7. OTP is sent through the configured transactional email provider.
8. User enters the OTP.
9. Server verifies the hash, expiry and attempt count.
10. OTP is marked consumed so it cannot be reused.
11. Existing user is logged in, or a new user proceeds to onboarding.
12. Server creates a new authenticated session.

A new OTP invalidates older active OTPs for the same email and purpose.

### 6.1.2 OTP Security Rules

- OTP must never be stored in plaintext.
- Use a server-secret keyed HMAC for OTP verification storage.
- Maximum five incorrect verification attempts per OTP.
- Maximum three resend requests within 10 minutes.
- Apply per-email and per-IP rate limits.
- Apply a 10-minute lockout after repeated abuse.
- Never reveal whether an email belongs to an existing account through public error messages.
- Validate the exact domain after the `@` symbol; do not use unsafe substring matching.
- OTP endpoints must return generic responses that reduce account enumeration.
- OTP values and authentication secrets must never appear in application logs.

### 6.1.3 Session Management

Sessions must be stored in Neon PostgreSQL so that they can be revoked centrally.

**Session configuration:**

| Property | Requirement |
|---|---|
| Storage | Database-backed sessions |
| Cookie | HTTP-only |
| Secure | Enabled in production |
| SameSite | Lax |
| Session lifetime | 7 days |
| Renewal | Sliding expiry on qualifying activity |
| Token | Cryptographically random opaque token |
| Database storage | SHA-256 hash of session token |
| Revocation | Immediate server-side invalidation |
| Device information | Optional device label and limited user-agent metadata |
| Last activity | Updated with throttling to avoid excessive database writes |

The raw session token is sent only through a secure cookie. The database stores its hash.

### 6.1.4 Session Lifecycle

**Login**
- A new session is created after successful OTP verification.
- A new session token is generated.
- Only its hash is stored in the database.
- The raw token is set as a secure cookie.

**Normal activity**
- Server validates the session on protected requests.
- Expired or revoked sessions are rejected.
- Sliding expiry is renewed according to the configured policy.

**Logout**
- The current session is marked revoked.
- The browser cookie is cleared.

**Sign out everywhere**
- All active sessions belonging to the user are revoked.
- All previously issued tokens become invalid on their next request.

**Session expiry**
- Expired sessions cannot authenticate requests.
- Expired session records are periodically cleaned up.

**Passwordless recovery**
- The campus email OTP remains the account recovery mechanism.
- Sensitive account changes require a fresh verification step.

### 6.1.5 Account and Device Security

- Users can view active sessions and last-used information.
- Users can revoke an individual session.
- Users can revoke all sessions.
- A suspicious login can trigger a notification.
- Changing the registered email requires verification of the new address and must preserve campus-domain restrictions.
- Role changes, account suspensions and alias reveals must be recorded in audit logs.
- Admin accounts should use stronger account protection and a protected recovery procedure.

### 6.1.6 Authentication Acceptance Criteria

- An invalid campus domain cannot register.
- A valid OTP can be used only once.
- An expired OTP cannot create a session.
- Repeated OTP attempts trigger the configured protection.
- A revoked session cannot access protected endpoints.
- Signing out everywhere invalidates every active session.
- A user cannot change their role by editing frontend data or request payloads.
- A user cannot access another user's private session information.

## 6.2 Announcement Board

| ID | Requirement | Priority |
|---|---|---|
| ANN-001 | Moderators and admins can create announcements. | P0 |
| ANN-002 | Announcements support categories and sanitized rich text. | P0 |
| ANN-003 | Announcements can be pinned, edited, scheduled and archived. | P0 |
| ANN-004 | Guests can read public announcements. | P0 |
| ANN-005 | Announcement views and clicks are measured. | P0 |
| ANN-006 | Announcements can trigger push notifications. | P1 |
| ANN-007 | Optional email blast and digest delivery. | P1 |
| ANN-008 | Users can bookmark announcements. | P1 |
| ANN-009 | Announcement reactions and discussion threads. | P2 |
| ANN-010 | Polls can be embedded in announcements. | P2 |

Categories: Academic, Events, Placements, Hostel, Clubs and Urgent.

## 6.3 Chat and Direct Messages

| ID | Requirement | Priority |
|---|---|---|
| CHAT-001 | Seeded channels such as General, Help, Placements, Memes and Random. | P0 |
| CHAT-002 | Users can send and receive messages in real time. | P0 |
| CHAT-003 | Messages support cursor-based pagination. | P0 |
| CHAT-004 | Users can edit their messages within 15 minutes. | P0 |
| CHAT-005 | Users can soft-delete their own messages. | P0 |
| CHAT-006 | Users can open one-to-one DMs. | P0 |
| CHAT-007 | Alias mode allows posting under a generated alias. | P0 |
| CHAT-008 | Alias identity can only be revealed by authorized moderators with a recorded reason. | P0 |
| CHAT-009 | Messages can be reported. | P0 |
| CHAT-010 | Message rate limits prevent spam. | P0 |
| CHAT-011 | Typing indicators. | P1 |
| CHAT-012 | Online presence. | P1 |
| CHAT-013 | Read receipts. | P1 |
| CHAT-014 | Block and unblock users. | P1 |
| CHAT-015 | Search message history. | P1 |

Private messaging and mentorship must include block, report and moderation controls. If minors may use the platform, mentorship and direct-message policies must include suitable safeguarding and reporting procedures.

## 6.4 Events

| ID | Requirement | Priority |
|---|---|---|
| EVT-001 | Authorized users can create, edit and archive events. | P0 |
| EVT-002 | Events include title, description, location, category, start and end times. | P0 |
| EVT-003 | Users can RSVP. | P0 |
| EVT-004 | Event capacity is enforced transactionally. | P0 |
| EVT-005 | Users receive reminders at 24 hours and 1 hour before events. | P0 |
| EVT-006 | Public event detail pages. | P1 |
| EVT-007 | Calendar export using ICS. | P1 |
| EVT-008 | Admin RSVP list and CSV export. | P1 |
| EVT-009 | Waitlist and automatic promotion. | P1 |
| EVT-010 | Event recordings. | P2 |
| EVT-011 | Live streaming integration. | P2 |

RSVP states: `going`, `maybe`, `not_going`, `waitlisted`.

Capacity updates must be protected against simultaneous requests exceeding the event limit. Reminder jobs must be idempotent so that users do not receive duplicate reminders.

## 6.5 Notes Repository

| ID | Requirement | Priority |
|---|---|---|
| NOTES-001 | Students can submit academic resources. | P0 |
| NOTES-002 | Resources support subject, branch, year, semester and type. | P0 |
| NOTES-003 | Users can search and filter resources. | P0 |
| NOTES-004 | Users can upvote a resource once. | P0 |
| NOTES-005 | Users can report broken or misleading links. | P0 |
| NOTES-006 | Users can bookmark resources. | P1 |
| NOTES-007 | Verified resource indicators. | P1 |
| NOTES-008 | Direct managed file uploads. | P1 |
| NOTES-009 | AI-powered recommendations. | P2 |
| NOTES-010 | Semantic search. | P2 |

## 6.6 Polls and Gamification

- Daily campus polls.
- One vote per user per poll.
- Poll scheduling and automatic closure.
- Weekly and all-time leaderboards.
- Server-side points calculation.
- Daily action limits.
- Anti-gaming detection.
- Weekly trivia.
- Badges and achievements.
- Monthly leaderboard seasons.

Points must be awarded only for meaningful, verified actions. Reports must never earn points. Repeated RSVP toggling, artificial messages and repeated upvotes must not generate unlimited points.

Every award must have an idempotency key and an auditable ledger entry.

## 6.7 Anonymous Feedback

- Feedback must not be linked to the submitting user's account.
- Categories include Academic, Facilities, Hostel, Clubs and Other.
- Feedback is visible to authorized administrators only.
- Moderators can review, classify and resolve submissions.
- Technical anti-abuse metadata must be disclosed in the privacy policy.
- Small cohorts and message content can still make a person identifiable; do not promise absolute anonymity.
- There is no direct reply channel to anonymous submitters in the initial release.

## 6.8 Lost & Found

- Create lost and found posts.
- Add description, location, date and optional image.
- Filter by item type, location and recency.
- Authors and moderators can mark posts resolved.
- Posts can be archived after 30 days.
- Users can report inappropriate posts.

## 6.9 Seniors Connect

- Seniors opt in as mentors.
- Mentor profiles include skills and expertise tags.
- Juniors can search and filter mentors.
- Juniors can submit mentorship requests.
- Seniors can accept or reject requests.
- Accepted requests create a mentorship conversation.
- Users can end a mentorship.
- Mentorship must have blocking, reporting and safeguarding controls.

## 6.10 Academic Calendar

- Display academic semesters.
- Add examination dates.
- Add assignment and submission deadlines.
- Display holidays and campus activities.
- Filter calendar by academic category.
- Allow users to subscribe to calendar updates.
- Provide reminders based on notification preferences.

## 6.11 Global Search

Search should support:

- Announcements
- Notes and PYQs
- Events
- Public profiles
- Clubs
- Study groups
- Campus Q&A
- Placement resources

Search results must respect access permissions. Private DMs and restricted content must never appear in global search.

## 6.12 Study Groups

- Create a study group.
- Add group description, subject and tags.
- Join or leave groups.
- Assign group owners and moderators.
- Share relevant resources.
- Discuss topics.
- Report inappropriate activity.

## 6.13 Saved Items

Users can save:

- Announcements
- Notes
- Events
- Q&A answers
- Placement resources

Saved items must be private to the account owner.

## 6.14 Placement and Career Hub

- Company information.
- Placement preparation resources.
- Interview preparation material.
- Opportunity announcements.
- Career events.
- Skill-based resources.
- Placement-related discussions.

Do not publish confidential company or student placement information without authorization.

## 6.15 Campus Q&A

- Students can ask questions.
- Questions can have tags.
- Other students can submit answers.
- Answers can be upvoted.
- Question authors can accept an answer.
- Search and filtering are available.
- Moderators can review reported questions and answers.
- Advanced reputation features are planned for P2.

## 6.16 Personalized Dashboard

The dashboard can show:

- Recent announcements.
- Upcoming events.
- Academic deadlines.
- Saved resources.
- New messages.
- Recommended study groups.
- Placement opportunities.
- Daily poll.
- Personal activity summary.

## 6.17 Club Directory

- Display available clubs.
- Club description and category.
- Club activities and upcoming events.
- Contact or joining information.
- Club-specific announcements.
- Future club membership management and voting.

## 6.18 Notifications

- In-app notification center.
- Web Push subscriptions.
- Per-category preferences.
- Quiet hours.
- Notification priorities.
- Event reminders.
- Announcement alerts.
- Mentorship notifications.
- Weekly digest.
- Delivery status and retry tracking.

---

# 7. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Mobile p75 LCP below 2.5 seconds |
| NFR-002 | API Performance | Target API p95 below 500 ms for normal operations |
| NFR-003 | Realtime | Target message delivery p95 below 500 ms under expected load |
| NFR-004 | Capacity | Support approximately 200 registered users and expected campus traffic |
| NFR-005 | Availability | Target 99.5% monthly availability during term |
| NFR-006 | Security | HTTPS, secure cookies, validation, authorization and secure headers |
| NFR-007 | Authentication | Database-backed sessions and server-side session revocation |
| NFR-008 | Privacy | Collect only required user data |
| NFR-009 | Accessibility | WCAG 2.1 AA for core flows |
| NFR-010 | Compatibility | Current major desktop and mobile browsers |
| NFR-011 | Observability | Structured logs, error tracking and health monitoring |
| NFR-012 | Backup | Automated Neon backup strategy and periodic restore tests |
| NFR-013 | Timezone | Store timestamps in UTC and display campus schedules in Asia/Kolkata |
| NFR-014 | Data Deletion | Process approved account deletion requests within seven days, subject to documented retention requirements |
| NFR-015 | File Security | Restrict file types, size, ownership and access; scan uploaded files where supported |
| NFR-016 | API Safety | Rate limiting, input validation and consistent error handling |

---

# 8. Technical Architecture

## 8.1 Architecture Overview

The platform will use Next.js as the main application framework and Neon PostgreSQL as the only primary application database.

OCI is not part of the architecture.

```text
                  STUDENT / GUEST
                         |
                         v
                   NEXT.JS APP
                  (Vercel Hosting)
                         |
              +----------+----------+
              |                     |
              v                     v
        API ROUTE HANDLERS     SERVER COMPONENTS
              |
              v
       AUTHENTICATION LAYER
              |
       SESSION VALIDATION
              |
       ROLE / PERMISSION CHECK
              |
       BUSINESS LOGIC LAYER
              |
       +------+-------------------------------+
       |              |             |          |
       v              v             v          v
    NEON DB       REALTIME       SCHEDULER   STORAGE
  PostgreSQL      PROVIDER       PROVIDER   PROVIDER
       |              |             |          |
       +--------------+-------------+----------+
                         |
                         v
                    APPLICATION
                     RESPONSE
```

## 8.2 Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| ORM | Prisma |
| Database connection | Neon pooled connection for runtime; direct connection for migrations |
| Hosting | Vercel |
| Authentication | Custom campus-email OTP and database-backed sessions |
| Validation | Zod |
| UI | Tailwind CSS and shadcn/ui |
| Realtime | Managed realtime provider, selected before implementation |
| Scheduling | Managed background-job/scheduler provider |
| Email | Configurable transactional email provider |
| File storage | Managed object-storage provider for uploaded files |
| Push | Web Push using VAPID |
| Analytics | GA4 or privacy-conscious equivalent |
| Error tracking | Sentry or equivalent |
| Testing | Playwright and unit/integration testing |
| Version control | GitHub |

**Architecture clarification:** Neon is the database provider, not a complete replacement for realtime servers, file storage, email delivery or background scheduling. Those capabilities require managed integrations or suitable application services. Their providers and plan limits must be confirmed before implementation.

## 8.3 Database Connection Strategy

- `DATABASE_URL`: Neon pooled connection for normal application queries.
- `DIRECT_URL`: Neon direct connection for Prisma migrations and schema operations.
- Enforce TLS.
- Never expose database credentials to the browser.
- Use server-side database access only.
- Apply connection limits and sensible query timeouts.
- Use separate development, staging and production database environments.
- Use migration files committed to version control.

## 8.4 Scheduling

A managed scheduler or durable background-job service must handle:

- Daily poll publication.
- Poll closure.
- Event reminders.
- Academic deadline reminders.
- Weekly leaderboard rollover.
- Notification digests.
- Data cleanup.
- Account deletion workflows.
- Expired session cleanup.

Jobs must be retryable, monitored and idempotent.

## 8.5 Realtime Communication

A managed realtime service will handle:

- Channel messages.
- DM messages.
- Typing indicators.
- Presence.
- Read receipts.
- Message delivery acknowledgements.

The service must authenticate users and validate channel membership. The client must never be trusted to authorize access to a private channel.

---

# 9. Database Design

All primary application records are stored in Neon PostgreSQL.

## 9.1 Main Tables

| Table | Purpose |
|---|---|
| users | User accounts |
| user_profiles | Student profile information |
| user_roles | User permissions and role assignments |
| otp_challenges | OTP verification challenges |
| sessions | Active and revoked sessions |
| channels | Chat channels |
| channel_members | Channel membership and alias settings |
| messages | Chat messages |
| message_reports | Message-specific report references |
| announcements | Official announcements |
| events | Campus events |
| event_rsvps | RSVP and waitlist records |
| notes | Academic resources |
| note_votes | Resource upvotes |
| polls | Poll definitions |
| poll_options | Poll choices |
| poll_votes | User votes |
| point_ledger | Gamification transactions |
| feedback | Anonymous feedback |
| lost_and_found | Lost and found posts |
| mentorship_requests | Mentorship requests |
| notifications | User notifications |
| notification_prefs | Notification preferences |
| push_subscriptions | Web Push subscriptions |
| reports | General moderation reports |
| moderation_actions | Moderation history |
| audit_logs | Administrative activity |
| blocked_users | User blocking |
| academic_calendar | Academic dates and activities |
| study_groups | Study group records |
| study_group_members | Group membership |
| bookmarks | Saved content |
| placement_resources | Career and placement resources |
| clubs | Club directory |
| qa_questions | Campus questions |
| qa_answers | Answers |
| qa_votes | Q&A votes |
| projects | Project collaboration listings |
| project_members | Project membership |
| achievements | Available badges |
| user_achievements | Earned badges |
| scheduled_jobs | Job tracking, where supported by the selected scheduler |

## 9.2 Authentication Tables

### users

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | Normalized unique campus email |
| email_verified_at | TIMESTAMPTZ | Verification time |
| status | VARCHAR | active, suspended, deleted |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update |

### otp_challenges

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | VARCHAR | Target email |
| otp_hash | VARCHAR | Keyed OTP hash |
| purpose | VARCHAR | login, email_change |
| expires_at | TIMESTAMPTZ | Expiration |
| attempts | INTEGER | Verification attempts |
| resend_count | INTEGER | Resend count |
| consumed_at | TIMESTAMPTZ | Single-use tracking |
| created_at | TIMESTAMPTZ | Creation time |

OTP records must be cleaned up after their retention period.

### sessions

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Account reference |
| token_hash | VARCHAR | Hash of opaque session token |
| device_label | VARCHAR | Optional device name |
| user_agent | TEXT | Limited device metadata |
| created_at | TIMESTAMPTZ | Session creation |
| last_seen_at | TIMESTAMPTZ | Last activity |
| expires_at | TIMESTAMPTZ | Expiry |
| revoked_at | TIMESTAMPTZ | Revocation time |

Indexes should support lookup by token hash, user and expiry.

### user_roles

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | User reference |
| role | VARCHAR | student, moderator, admin |
| granted_by | UUID | Granting administrator |
| granted_at | TIMESTAMPTZ | Grant time |
| revoked_at | TIMESTAMPTZ | Revocation time |

The super-admin account must have a protected bootstrap and recovery process.

## 9.3 Other Database Rules

- Use foreign keys for relationships.
- Use unique constraints for votes, memberships and account emails.
- Use transactions for capacity-sensitive RSVP operations.
- Use idempotency keys for points and scheduled notifications.
- Use `TIMESTAMPTZ` for real timestamps.
- Store timestamps in UTC.
- Convert to `Asia/Kolkata` when displaying campus schedules.
- Use appropriate indexes for search, filters and cursor pagination.
- Use soft deletion where recovery or moderation history is required.
- Document cascade and retention behaviour for every major relationship.

---

# 10. API Endpoints

All endpoints use Next.js App Router route handlers.

All request bodies, query parameters and route parameters must be validated using Zod.

All protected endpoints must validate the session and permissions on the server.

## 10.1 API Standards

| Standard | Requirement |
|---|---|
| Base path | `/api/v1` |
| Data format | JSON |
| Authentication | Secure HTTP-only session cookie |
| Validation | Zod |
| Pagination | Cursor-based for feeds and histories |
| Error format | Consistent JSON error object |
| Rate limiting | Per user, email and IP where appropriate |
| Authorization | Server-side role and ownership checks |
| Idempotency | Required for points and scheduled operations where duplicate actions matter |
| API versioning | `/api/v1` |

Example error response:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

## 10.2 Authentication APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/request-otp` | Public | Request OTP |
| POST | `/api/v1/auth/verify-otp` | Public | Verify OTP and create session |
| POST | `/api/v1/auth/resend-otp` | Public | Resend OTP within limits |
| POST | `/api/v1/auth/logout` | Authenticated | Revoke current session |
| POST | `/api/v1/auth/logout-all` | Authenticated | Revoke all sessions |
| GET | `/api/v1/auth/sessions` | Authenticated | List active sessions |
| DELETE | `/api/v1/auth/sessions/:id` | Owner | Revoke selected session |
| GET | `/api/v1/auth/me` | Authenticated | Current account |
| POST | `/api/v1/auth/change-email` | Authenticated | Start email-change verification |
| POST | `/api/v1/auth/confirm-email` | Authenticated | Confirm new email |
| POST | `/api/v1/auth/export` | Authenticated | Request personal data export |
| POST | `/api/v1/auth/delete-account` | Authenticated | Request account deletion |

## 10.3 Profile APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/users/me` | Authenticated | Get own profile |
| PATCH | `/api/v1/users/me` | Authenticated | Update profile |
| GET | `/api/v1/users/:id` | Authenticated | View permitted public profile |
| GET | `/api/v1/users/handle/:handle` | Authenticated | Find profile by handle |
| POST | `/api/v1/users/me/avatar` | Authenticated | Upload avatar |
| GET | `/api/v1/users/me/preferences` | Authenticated | Read preferences |
| PATCH | `/api/v1/users/me/preferences` | Authenticated | Update preferences |
| GET | `/api/v1/users/me/blocked` | Authenticated | List blocked accounts |
| POST | `/api/v1/users/:id/block` | Authenticated | Block user |
| DELETE | `/api/v1/users/:id/block` | Authenticated | Unblock user |

## 10.4 Announcement APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/announcements` | Public | List published announcements |
| GET | `/api/v1/announcements/:id` | Public | Get announcement |
| POST | `/api/v1/announcements` | Moderator+ | Create announcement |
| PATCH | `/api/v1/announcements/:id` | Moderator+ | Update announcement |
| DELETE | `/api/v1/announcements/:id` | Moderator+ | Archive/delete announcement |
| POST | `/api/v1/announcements/:id/pin` | Moderator+ | Pin announcement |
| DELETE | `/api/v1/announcements/:id/pin` | Moderator+ | Unpin announcement |
| POST | `/api/v1/announcements/:id/publish` | Moderator+ | Publish scheduled announcement |
| POST | `/api/v1/announcements/:id/bookmark` | Authenticated | Save announcement |

## 10.5 Chat APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/channels` | Authenticated | List channels |
| GET | `/api/v1/channels/:id` | Member | Channel details |
| POST | `/api/v1/channels` | Admin | Create channel |
| PATCH | `/api/v1/channels/:id` | Admin | Update channel |
| DELETE | `/api/v1/channels/:id` | Admin | Archive channel |
| GET | `/api/v1/channels/:id/messages` | Member | Message history |
| POST | `/api/v1/channels/:id/messages` | Member | Send message |
| PATCH | `/api/v1/messages/:id` | Author | Edit message |
| DELETE | `/api/v1/messages/:id` | Author/moderator | Delete message |
| POST | `/api/v1/messages/:id/report` | Authenticated | Report message |
| POST | `/api/v1/dms/:userId` | Authenticated | Open or retrieve DM |
| GET | `/api/v1/dms` | Authenticated | List permitted conversations |
| GET | `/api/v1/dms/:id/messages` | Conversation member | DM history |
| POST | `/api/v1/dms/:id/messages` | Conversation member | Send DM |

## 10.6 Events APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/events` | Public | List events |
| GET | `/api/v1/events/:id` | Public | Event detail |
| POST | `/api/v1/events` | Moderator+ | Create event |
| PATCH | `/api/v1/events/:id` | Moderator+ | Update event |
| DELETE | `/api/v1/events/:id` | Moderator+ | Archive event |
| POST | `/api/v1/events/:id/rsvp` | Authenticated | Create/update RSVP |
| DELETE | `/api/v1/events/:id/rsvp` | Authenticated | Cancel RSVP |
| GET | `/api/v1/events/:id/rsvps` | Organizer/admin | View RSVP list |
| GET | `/api/v1/events/:id/waitlist` | Organizer/admin | View waitlist |
| GET | `/api/v1/events/:id/calendar` | Public | Download ICS |

## 10.7 Notes APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/notes` | Public/Authenticated | Browse notes |
| GET | `/api/v1/notes/:id` | Public/Authenticated | Note detail |
| POST | `/api/v1/notes` | Authenticated | Submit resource |
| PATCH | `/api/v1/notes/:id` | Author/moderator | Update resource |
| DELETE | `/api/v1/notes/:id` | Author/moderator | Remove resource |
| POST | `/api/v1/notes/:id/vote` | Authenticated | Upvote |
| DELETE | `/api/v1/notes/:id/vote` | Authenticated | Remove upvote |
| POST | `/api/v1/notes/:id/open` | Authenticated | Track resource open |
| POST | `/api/v1/notes/:id/report` | Authenticated | Report resource |
| POST | `/api/v1/notes/:id/bookmark` | Authenticated | Bookmark resource |

## 10.8 Poll and Leaderboard APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/polls/today` | Authenticated | Today's poll |
| GET | `/api/v1/polls/:id` | Authenticated | Poll details |
| POST | `/api/v1/polls` | Admin | Create poll |
| PATCH | `/api/v1/polls/:id` | Admin | Update poll |
| POST | `/api/v1/polls/:id/vote` | Authenticated | Submit vote |
| GET | `/api/v1/polls/:id/results` | Authenticated | View results |
| GET | `/api/v1/leaderboard` | Authenticated | View rankings |
| GET | `/api/v1/users/me/points` | Authenticated | View own points |
| GET | `/api/v1/users/me/achievements` | Authenticated | View badges |

## 10.9 Feedback APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/feedback` | Public | Submit anonymous feedback |
| GET | `/api/v1/admin/feedback` | Admin | List feedback |
| GET | `/api/v1/admin/feedback/:id` | Admin | View feedback |
| PATCH | `/api/v1/admin/feedback/:id` | Admin | Update review status |

Public feedback submission must not accept or store a user ID or session identifier.

## 10.10 Lost & Found APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/lost-found` | Public | Browse listings |
| GET | `/api/v1/lost-found/:id` | Public | Listing detail |
| POST | `/api/v1/lost-found` | Authenticated | Create listing |
| PATCH | `/api/v1/lost-found/:id` | Author/moderator | Update listing |
| DELETE | `/api/v1/lost-found/:id` | Author/moderator | Remove listing |
| POST | `/api/v1/lost-found/:id/resolve` | Author/moderator | Resolve listing |
| POST | `/api/v1/lost-found/:id/report` | Authenticated | Report listing |

## 10.11 Mentorship APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/mentors` | Authenticated | Browse mentors |
| GET | `/api/v1/mentors/:id` | Authenticated | Mentor profile |
| POST | `/api/v1/mentors/me/opt-in` | Eligible student | Become a mentor |
| POST | `/api/v1/mentorship/requests` | Authenticated | Send request |
| GET | `/api/v1/mentorship/requests` | Authenticated | List own requests |
| PATCH | `/api/v1/mentorship/requests/:id` | Request recipient | Accept/reject |
| POST | `/api/v1/mentorship/requests/:id/end` | Request participant | End mentorship |

## 10.12 Academic Calendar APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/calendar` | Public/Authenticated | View calendar |
| GET | `/api/v1/calendar/:id` | Public/Authenticated | Calendar item |
| POST | `/api/v1/calendar` | Moderator+ | Create calendar item |
| PATCH | `/api/v1/calendar/:id` | Moderator+ | Update item |
| DELETE | `/api/v1/calendar/:id` | Moderator+ | Archive item |
| GET | `/api/v1/calendar/export` | Authenticated | Export calendar |

## 10.13 Study Group APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/study-groups` | Authenticated | Browse groups |
| GET | `/api/v1/study-groups/:id` | Authenticated | Group details |
| POST | `/api/v1/study-groups` | Authenticated | Create group |
| PATCH | `/api/v1/study-groups/:id` | Group owner | Update group |
| DELETE | `/api/v1/study-groups/:id` | Group owner/moderator | Archive group |
| POST | `/api/v1/study-groups/:id/join` | Authenticated | Join group |
| DELETE | `/api/v1/study-groups/:id/membership` | Member | Leave group |

## 10.14 Search and Bookmarks APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/search` | Public/Authenticated | Search permitted content |
| GET | `/api/v1/bookmarks` | Authenticated | List saved items |
| POST | `/api/v1/bookmarks` | Authenticated | Save item |
| DELETE | `/api/v1/bookmarks/:id` | Authenticated | Remove saved item |

## 10.15 Placement and Career APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/placements/resources` | Authenticated | List resources |
| GET | `/api/v1/placements/resources/:id` | Authenticated | Resource detail |
| POST | `/api/v1/placements/resources` | Moderator+ | Publish resource |
| PATCH | `/api/v1/placements/resources/:id` | Moderator+ | Update resource |
| DELETE | `/api/v1/placements/resources/:id` | Moderator+ | Archive resource |
| GET | `/api/v1/placements/opportunities` | Authenticated | View opportunities |

## 10.16 Campus Q&A APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/questions` | Public/Authenticated | List questions |
| GET | `/api/v1/questions/:id` | Public/Authenticated | Question detail |
| POST | `/api/v1/questions` | Authenticated | Ask question |
| PATCH | `/api/v1/questions/:id` | Author/moderator | Edit question |
| DELETE | `/api/v1/questions/:id` | Author/moderator | Remove question |
| POST | `/api/v1/questions/:id/answers` | Authenticated | Submit answer |
| PATCH | `/api/v1/answers/:id` | Author/moderator | Edit answer |
| POST | `/api/v1/answers/:id/accept` | Question author | Accept answer |
| POST | `/api/v1/questions/:id/vote` | Authenticated | Vote on question |

## 10.17 Notification APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/notifications` | Authenticated | List notifications |
| PATCH | `/api/v1/notifications/:id/read` | Owner | Mark as read |
| POST | `/api/v1/notifications/read-all` | Authenticated | Mark all as read |
| GET | `/api/v1/notifications/preferences` | Authenticated | Read preferences |
| PATCH | `/api/v1/notifications/preferences` | Authenticated | Update preferences |
| POST | `/api/v1/push/subscribe` | Authenticated | Save push subscription |
| DELETE | `/api/v1/push/subscribe/:id` | Owner | Remove subscription |

## 10.18 Moderation APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/reports` | Authenticated | Report content |
| GET | `/api/v1/moderation/reports` | Moderator+ | View moderation queue |
| GET | `/api/v1/moderation/reports/:id` | Moderator+ | Report details |
| PATCH | `/api/v1/moderation/reports/:id` | Moderator+ | Update report status |
| POST | `/api/v1/moderation/actions` | Moderator+ | Record moderation action |
| POST | `/api/v1/moderation/users/:id/warn` | Moderator+ | Warn user |
| POST | `/api/v1/moderation/users/:id/ban` | Moderator+ | Suspend user |
| POST | `/api/v1/moderation/users/:id/restore` | Moderator+ | Restore user |
| POST | `/api/v1/moderation/reveal-alias` | Authorized moderator+ | Reveal alias with mandatory reason |
| GET | `/api/v1/admin/audit-logs` | Admin | View audit history |

Report objects must support different content types, including messages, notes, lost-and-found posts, Q&A content and profiles.

---

# 11. API Authorization and Error Handling

Every endpoint must follow this sequence:

1. Receive request.
2. Validate input.
3. Authenticate session if required.
4. Check account status.
5. Check role and permission.
6. Check ownership or resource membership.
7. Execute business logic.
8. Record relevant audit or analytics event.
9. Return a consistent response.

Important HTTP status codes:

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request with no response body |
| 400 | Invalid request |
| 401 | Not authenticated |
| 403 | Permission denied |
| 404 | Resource not found |
| 409 | Duplicate or conflicting operation |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

Do not expose stack traces, database errors, secrets or internal infrastructure details to users.

---

# 12. Realtime Events

The managed realtime integration must support authenticated, authorized events.

| Event | Direction | Purpose |
|---|---|---|
| `channel:join` | Client → Server | Request channel membership |
| `channel:leave` | Client → Server | Leave channel |
| `message:send` | Client → Server | Send message |
| `message:created` | Server → Client | Deliver message |
| `message:edited` | Server → Client | Notify message update |
| `message:deleted` | Server → Client | Notify deletion |
| `typing:start` | Client → Server | Start typing indicator |
| `typing:stop` | Client → Server | Stop typing indicator |
| `presence:update` | Server → Client | Presence update |
| `message:read` | Client → Server | Read receipt |
| `notification:new` | Server → Client | New notification |

The server must validate session, membership, ownership and rate limits before accepting an event.

---

# 13. Moderation, Privacy and Safety

## 13.1 Moderation Workflow

1. User reports content.
2. Report is saved.
3. Duplicate reports are handled without creating unnecessary queue entries.
4. Moderator reviews the report and relevant context.
5. Moderator dismisses or takes action.
6. Action is recorded in moderation history.
7. User receives an appropriate outcome notification where applicable.
8. User can submit an appeal when permitted.

## 13.2 Moderation Actions

- Dismiss report.
- Remove content.
- Issue warning.
- Temporarily suspend account.
- Permanently restrict account where justified.
- Restore content or account.
- Reveal an alias with a mandatory reason and audit record.

The three-strike policy should allow documented exceptions for serious safety incidents. Warnings must have an expiry policy and a clear history.

## 13.3 Privacy

- Do not sell student data.
- Do not expose private messages through public search.
- Do not expose session tokens or OTPs.
- Restrict access to administrative information.
- Store only necessary analytics.
- Make the feedback portal's technical metadata practices clear.
- Document data deletion and retention.
- Apply appropriate safeguarding to private messaging and mentorship.

---

# 14. Data Retention

| Data | Proposed Retention |
|---|---|
| OTP challenges | Until expiry and short cleanup window |
| Sessions | Until expiry/revocation and cleanup |
| Notifications | 90 days |
| Soft-deleted messages | 30 days unless needed for an active report |
| Feedback anti-abuse hash | 7 days |
| Application logs | 14 days, subject to provider configuration |
| Audit logs | Retained under a documented administrative policy |
| Backups | According to the configured Neon backup and recovery plan |
| Uploaded files | Until deletion or the applicable retention policy |

Deletion requests must account for backups, moderation evidence, legal obligations and data that cannot safely be removed immediately.

---

# 15. Integrations and Dependencies

| Integration | Purpose | Requirement |
|---|---|---|
| Vercel | Next.js hosting | Production and preview deployments |
| Neon | PostgreSQL database | Pooled runtime and direct migration connections |
| Realtime provider | Chat and presence | Authenticated channels |
| Scheduler provider | Reminders and recurring jobs | Retry and idempotency support |
| Email provider | OTP and transactional mail | Delivery monitoring and rate limits |
| Object storage | Uploaded images and files | Private access and signed URLs |
| Web Push | Browser notifications | VAPID configuration |
| Sentry or equivalent | Error tracking | Production error monitoring |
| GA4 or equivalent | Analytics | Privacy-conscious configuration |
| GitHub | Version control | Protected production branch |

Provider selection, free-tier limits, pricing and production suitability must be checked before the corresponding feature is implemented. No service should be assumed to be free indefinitely.

---

# 16. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| OTP abuse | Account security risk | Hashing, rate limits and lockouts |
| Session theft | Unauthorized access | Secure cookies, token hashing and revocation |
| Database outage | Application disruption | Neon recovery plan and tested backups |
| Realtime provider outage | Chat disruption | Retry, reconnect and clear degraded state |
| Scheduler failure | Missed reminders | Job monitoring, retries and idempotency |
| Email delivery failure | Login disruption | Delivery monitoring and resend controls |
| Low adoption | Poor engagement | Seed content and student ambassadors |
| Anonymous abuse | Student safety risk | Moderation, rate limits and audit trail |
| Gamification abuse | Unfair leaderboard | Server-side points and deduplication |
| File abuse | Security risk | MIME restrictions, size limits and scanning |
| Scope creep | Delayed release | P0/P1/P2 roadmap |
| Privacy concerns | Loss of trust | Data minimization and clear policies |
| Solo development capacity | Delivery delays | Phased releases and testable milestones |

---

# 17. Release Roadmap

## Phase 1 — Core Release (P0)

Build the essential platform:

- Authentication and sessions.
- User profiles and permissions.
- Announcements.
- Chat and DMs.
- Events and RSVP.
- Notes repository.
- Polls and leaderboard.
- Feedback.
- Moderation.
- Basic notifications.
- PWA and responsive UI.
- Production monitoring and backup validation.

## Phase 2 — Campus Productivity (P1)

Add:

- Lost & Found.
- Seniors Connect.
- Academic Calendar.
- Global Search.
- Study Groups.
- Saved Items.
- Placement Hub.
- Campus Q&A.
- Personalized Dashboard.
- Club Directory.
- Student skills and interests.
- Advanced notification preferences.
- Event waitlists.
- Note verification.
- Blocking and report tracking.
- File uploads.
- Typing indicators, presence and read receipts.
- Weekly trivia.
- Email digests and calendar subscription.

## Phase 3 — Intelligent Campus Platform (P2)

Add:

- AI Campus Assistant.
- Smart Recommendations.
- Semantic Search.
- Project Partner Matching.
- Advanced Club Management.
- Club Voting.
- Student Marketplace.
- Badges and achievements.
- Personalized Weekly Digest.
- Advanced Q&A.
- Advanced Analytics.
- Announcement Reactions.
- Embedded Polls.
- Live Streaming and Recordings.
- Project Collaboration.
- Multi-Campus Support.
- Native Mobile Experience.

---

# 18. Launch Acceptance Criteria

- [ ] A guest can read public announcements.
- [ ] A student can register using an approved campus email.
- [ ] OTP verification works with expiry and rate limits.
- [ ] Sessions are securely stored and revocable.
- [ ] Sign out everywhere invalidates all active sessions.
- [ ] Role checks are enforced server-side.
- [ ] Two users can exchange authorized real-time messages.
- [ ] Alias mode works with an audited reveal process.
- [ ] Reports reach the moderation queue.
- [ ] Moderators can warn, restrict and restore accounts.
- [ ] Events support RSVP and capacity enforcement.
- [ ] Event reminders are delivered without duplicate jobs.
- [ ] Notes can be submitted, searched and upvoted.
- [ ] Poll voting is unique and idempotent.
- [ ] Points are calculated server-side.
- [ ] Anonymous feedback contains no user or session linkage.
- [ ] Neon is the only primary application database.
- [ ] No OCI service is required by the application.
- [ ] Data backups and restore procedures are tested.
- [ ] Privacy and retention policies are documented.
- [ ] Core flows pass automated and manual tests.
- [ ] No unresolved critical security or P0 bugs remain.

---

# 19. Final Product Definition

VibeZone is a hybrid campus ecosystem combining:

1. **Communication:** Announcements, chat and direct messages.
2. **Academics:** Notes, academic calendar, study groups and Q&A.
3. **Campus Life:** Events, clubs, polls and Lost & Found.
4. **Career Development:** Placement resources and mentorship.
5. **Community:** Feedback, profiles, collaboration and gamification.
6. **Intelligence:** AI assistant, semantic search and recommendations in the advanced phase.

The product will use Next.js as its application framework and Neon PostgreSQL as its primary database.

The platform will be developed in phases, beginning with essential campus functionality and gradually expanding into a complete academic and social ecosystem.

**Product principle:** Build a reliable and useful campus platform first. Add intelligence and advanced automation after the core experience is stable.
"""

output_path = "/mnt/data/VibeZone_PRD_v2.2.md"
pypandoc.convert_text(
    prd,
    to="md",
    format="md",
    outputfile=output_path,
    extra_args=["--standalone"]
)

print(f"Created: {output_path}")
