# **Product Requirements Document (PRD): VibeZone**

# **1\. Executive Summary & Overview**

* **Product Name:** VibeZone  
* **Target Audience:** \~200 B.Tech College Students (Focus: Campus Life, Engagement & Social Connection)  
* **Tech Stack:** Next.js (Full-stack: App Router, Server Actions, API Routes), Node.js, PostgreSQL / MongoDB, Vercel (Hosting), Google Analytics (Engagement Tracking)

# **2\. Core Functional Requirements & Modules**

* **User Authentication & Profiles**  
  * Campus email verification and login.  
  * Profile creation with customizable avatars and handle display.  
* **Announcement Board**  
  * Verified admin/mod posting for official updates and campus news.  
  * Public view for unauthenticated or non-logged-in users.  
* **General Chat Forum & Direct Messages (DMs)**  
  * Real-time community chat channels and direct messaging.  
  * **Alias Anonymity:** Option to post/chat under temporary aliases while enforcing backend identity mapping for safety/moderation.  
* **Event Management**  
  * Campus event listings, registrations, RSVPs, and automated reminders.  
* **Notes & Study Sharing Repository**  
  * Subject-wise categorised resource index.  
  * **External Storage Redirection:** Direct support for Google Drive / Cloud shareable links to handle large files seamlessly without bloat.  
* **Interactive Games, Polls & Participation Leaderboard**  
  * Daily engagement polls and quick casual games.  
  * Gamified leaderboard tracking active student participation.  
* **Broadcast Video Streaming**  
  * Live stream broadcasts for college events, sessions, or gaming tournaments.  
* **Anonymous Feedback Portal**  
  * Secure submission form for anonymous student feedback routed straight to an administrative moderation dashboard.  
* **Lost and Found Module**  
  * Community board to post lost or found items with images, contact tags, and resolution status.  
* **Seniors Connect (Mentorship Module)**  
  * Dedicated connection portal pairing junior students with seniors for academic, career, and campus guidance.  
* **System & Experience Features**  
  * **Push Notifications:** Real-time updates for DMs, announcements, and polls.  
  * **Dark Mode:** System-wide dark/light theme toggle.

# **3\. Database Schema (Relational / PostgreSQL Specification)**

## **Core User & Social Entities**

| Table Name | Column Name | Data Type | Constraints & Description |
| :---- | :---- | :---- | :---- |
| **users** | `id` | UUID | Primary Key |
|  | `email` | VARCHAR | Unique, Not Null |
|  | `name` | VARCHAR | Not Null |
|  | `avatar_url` | TEXT | Optional profile image |
|  | `role` | VARCHAR | `student, senior, admin` |
|  | `created_at` | TIMESTAMP | Default current timestamp |
| **chats** | `id` | UUID | Primary Key |
|  | `sender_id` | UUID | Foreign Key \-\> users.id |
|  | `receiver_id` | UUID | Foreign Key \-\> users.id (Nullable for global forum) |
|  | `alias_name` | VARCHAR | Nullable, display identity |
|  | `message` | TEXT | Not Null |
|  | `created_at` | TIMESTAMP | Default current timestamp |
| **mentorship\_requests** | `id` | UUID | Primary Key |
|  | `student_id` | UUID | Foreign Key \-\> users.id |
|  | `senior_id` | UUID | Foreign Key \-\> users.id |
|  | `status` | VARCHAR | `pending, accepted, rejected` |
|  | `created_at` | TIMESTAMP | Default current timestamp |

## **Academic & Content Entities**

| Table Name | Column Name | Data Type | Constraints & Description |
| :---- | :---- | :---- | :---- |
| **announcements** | `id` | UUID | Primary Key |
|  | `title` | VARCHAR | Not Null |
|  | `content` | TEXT | Not Null |
|  | `author_id` | UUID | Foreign Key \-\> users.id |
|  | `created_at` | TIMESTAMP | Default current timestamp |
| **notes** | `id` | UUID | Primary Key |
|  | `title` | VARCHAR | Not Null |
|  | `subject` | VARCHAR | Subject categorization |
|  | `external_link` | TEXT | Google Drive / External URL |
|  | `uploaded_by` | UUID | Foreign Key \-\> users.id |
|  | `created_at` | TIMESTAMP | Default current timestamp |
| **events** | `id` | UUID | Primary Key |
|  | `title` | VARCHAR | Not Null |
|  | `description` | TEXT | Event details |
|  | `event_date` | TIMESTAMP | Scheduled time |
|  | `created_by` | UUID | Foreign Key \-\> users.id |

## **Interactive & Campus Utility Entities**

| Table Name | Column Name | Data Type | Constraints & Description |
| :---- | :---- | :---- | :---- |
| **polls** | `id` | UUID | Primary Key |
|  | `question` | TEXT | Not Null |
|  | `options` | JSONB | List of poll options |
|  | `created_at` | TIMESTAMP | Default current timestamp |
| **poll\_votes** | `id` | UUID | Primary Key |
|  | `poll_id` | UUID | Foreign Key \-\> polls.id |
|  | `user_id` | UUID | Foreign Key \-\> users.id |
|  | `option_index` | INT | Selected option index |
| **lost\_and\_found** | `id` | UUID | Primary Key |
|  | `item_name` | VARCHAR | Item title |
|  | `description` | TEXT | Item description and location |
|  | `type` | VARCHAR | `lost, found` |
|  | `contact_info` | VARCHAR | Preferred contact details |
|  | `status` | VARCHAR | `open, resolved` |
|  | `user_id` | UUID | Foreign Key \-\> users.id |
| **feedback** | `id` | UUID | Primary Key |
|  | `message` | TEXT | Anonymous feedback content |
|  | `created_at` | TIMESTAMP | Default current timestamp |

# **4\. Automation & Engagement Strategy**

## **Content Automation**

* **External API Ingestion:** Integrate background cron jobs / Next.js API routes calling APIs (e.g., Reddit API for trending memes, Official Joke API) to keep entertainment content updating automatically without daily manual admin intervention.

## **Tracking Student Engagement**

* **Google Analytics Integration:** Track Active Users (DAU/MAU), event click rates (Notes downloads, poll submissions, chat activity), and user journey paths.

