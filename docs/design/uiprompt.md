# VibeZone — Complete UI/UX Design & Development Brief

## 1. Project Overview

Build **VibeZone**, a modern, responsive, student-focused campus community platform.

VibeZone brings students together in one digital space where they can connect, communicate, share knowledge, discover campus activities, participate in discussions, find mentors, and stay updated.

**Core tagline:** Connect. Learn. Engage. Grow.

The product should feel like a combination of a campus social network, student productivity platform, community forum, and academic resource hub.

The goal is to create a polished, production-quality web application—not merely a static landing page or UI prototype.

## 2. Design Vision

Create a visually attractive, modern, friendly, premium, and intuitive interface.

Use the supplied VibeZone UI reference images as visual inspiration.

The design should combine:
- The clean, soft, lavender visual language of a modern SaaS dashboard.
- The engaging layout and social-feed experience of a social media platform.
- The functionality and information density of a student portal.
- The visual polish of a premium commercial web application.

Avoid making the application look like a generic college management system.

### Design personality
- Modern
- Student-friendly
- Energetic
- Professional
- Community-driven
- Clean and organized
- Approachable but premium

## 3. Visual Design System

### Primary color palette

Use a light lavender theme as the default visual direction.

| Purpose | Color |
|---|---|
| Primary purple | #7047F5 |
| Secondary purple | #8B5CF6 |
| Accent violet | #A855F7 |
| Soft lavender | #EDE9FE |
| Background | #F7F6FF |
| Surface | #FFFFFF |
| Main text | #17152B |
| Secondary text | #77758B |
| Border | #E9E6F5 |
| Success | #22C55E |
| Warning | #F59E0B |
| Error | #EF4444 |

Use purple gradients sparingly for primary buttons, active navigation, highlights, and promotional cards.

### Dark mode

Provide a complete dark-mode alternative.

Suggested colors:
- Background: #0D0B18
- Surface: #171426
- Elevated surface: #211B35
- Primary: #8B5CF6
- Secondary: #C084FC
- Main text: #F8F7FF
- Secondary text: #AAA5BE
- Border: #302A45

The light and dark themes must both be carefully designed. Do not simply invert colors.

### Typography

Use a modern sans-serif font such as:
- Inter
- Geist
- Plus Jakarta Sans

Use clear typography hierarchy:
- Large, bold page headings.
- Medium-weight section headings.
- Readable body text.
- Small, subtle metadata.
- Consistent line height and spacing.

### UI styling

Use:
- Rounded cards with approximately 14–20px corner radii.
- Subtle shadows.
- Soft borders.
- Consistent spacing.
- Simple line icons.
- Carefully controlled gradients.
- Attractive avatars.
- Consistent button heights.
- Clear hover and focus states.
- Small, purposeful animations.

Avoid excessive glassmorphism, unnecessary gradients, oversized empty cards, and decorative elements that reduce usability.

## 4. Global Application Layout

Create a consistent application shell for authenticated users.

### Desktop layout

Use three main regions:

**Left sidebar**
- VibeZone logo.
- Home.
- Explore.
- Chat.
- Events.
- Notes.
- Polls.
- Mentorship.
- Lost & Found.
- Academic Calendar.
- Q&A.
- Profile.
- Settings.
- More.

Include:
- Active navigation highlighting.
- Notification badges.
- Collapsible sidebar.
- User profile section at the bottom.
- Theme toggle.

**Top navigation bar**
- Global search.
- Create button.
- Notification icon.
- Message shortcut.
- User avatar and profile menu.

**Main content**
- Page-specific content.
- Responsive card grids.
- Feed layouts.
- Contextual right sidebar where appropriate.

### Mobile layout

Build a mobile-first responsive experience.

Use:
- Compact top header.
- Bottom navigation.
- Mobile-friendly cards.
- Full-width content.
- Touch-friendly buttons.
- Slide-out navigation for secondary features.
- Mobile-optimized forms and dialogs.

The bottom navigation should prioritize:
1. Home
2. Explore
3. Create
4. Chat
5. Profile

Do not simply shrink the desktop interface. Design a genuinely usable mobile layout.

## 5. Pages and Their UI Requirements

### A. Public Landing Page

Create an attractive landing page for visitors who are not logged in.

**Hero section**
- VibeZone logo.
- Headline: "Everything your campus needs, in one place."
- Supporting text: "Connect, learn, engage, and grow with your campus community."
- Primary CTA: Join VibeZone.
- Secondary CTA: Explore Features.
- Friendly campus/student imagery.

**Feature section**

Show feature cards for:
- Announcements.
- Campus Events.
- Notes and Resources.
- Community Discussions.
- Student Chat.
- Mentorship.
- Polls.
- Academic Calendar.

**Additional sections**
- How VibeZone works.
- Community benefits.
- Feature highlights.
- FAQ.
- Footer with useful links.

Keep the landing page visually engaging without making unsupported claims about user counts or platform statistics.

### B. Authentication

Create polished authentication screens.

Include:
- Sign-in page.
- Email verification page.
- OTP entry screen.
- Resend OTP interaction.
- Loading and error states.
- Successful verification state.
- Logout and session-expired states.

Use a centered authentication card with a subtle purple background treatment.

The interface must communicate errors clearly without revealing whether an account exists.

### C. Home Dashboard

This is the most important authenticated screen.

**Welcome section**
- Greeting with the student's name.
- Profile avatar.
- Short welcome message.
- Today's campus highlights.

**Featured event banner**
- Event image.
- Event title.
- Date and time.
- Location.
- View Event button.

**Quick Access**

Display attractive shortcut cards for:
- Announcements.
- Notes.
- Polls.
- Calendar.
- Mentorship.
- Q&A.

**Main content area**
- Recent announcements.
- Upcoming events.
- Trending topics.
- Recent community posts.
- Popular notes.
- Suggested communities.

**Right sidebar**
- Student points.
- Trending topics.
- Upcoming events.
- Suggested users.
- Community activity.

Make the dashboard dynamic and information-rich without overwhelming the user.

### D. Explore Page

Build a discovery interface.

Include:
- Search bar.
- Trending topics.
- Popular discussions.
- Recommended posts.
- Student communities.
- Popular notes.
- Upcoming events.

Provide filters such as:
- All.
- Academic.
- Technology.
- Campus Life.
- Events.
- Career.

Use a responsive card grid.

### E. Social Feed

Create a modern social feed.

Each post card should contain:
- Author avatar.
- Author name.
- Timestamp.
- Post visibility.
- Post text.
- Optional image or attachment.
- Like button.
- Comment button.
- Share action.
- Bookmark action.
- Report option.

Provide:
- Create post composer.
- Image attachment preview.
- Poll creation.
- Post editing.
- Post deletion.
- Comment section.

Use clear loading, empty, and error states.

### F. Create Post

Design a dedicated post composer.

Include:
- Text editor.
- Photo upload.
- GIF option if supported.
- Poll creation.
- Event or note sharing where appropriate.
- Audience/visibility selection.
- Tags.
- Preview.
- Publish button.

Keep the interface simple and distraction-free.

### G. Chat and Messaging

Create a modern messaging interface.

**Left panel**
- Conversation list.
- Search conversations.
- Unread indicators.
- Online indicators where supported.
- Message requests.

**Main panel**
- Conversation header.
- User details.
- Message history.
- Message timestamps.
- Message input.
- Attachment action.
- Send button.

Include:
- Empty conversation state.
- Loading state.
- Message delivery state where supported.
- Block and report actions.
- Message request handling.

For mobile, use a separate conversation list screen and conversation detail screen.

### H. Events

Create an events discovery and management interface.

Include:
- Event listing.
- Featured event.
- Event categories.
- Search and filters.
- Event detail page.
- Event poster.
- Date, time, venue.
- Organizer information.
- RSVP button.
- Attendee count.
- Capacity information.
- Waitlist status where applicable.

Create separate states for:
- Upcoming events.
- Past events.
- Registered events.
- Full events.
- Cancelled events.

### I. Notes and Academic Resources

Build a student resource-sharing interface.

Include:
- Notes listing.
- Subject filters.
- Branch filters.
- Search.
- Resource preview.
- Upload note.
- Download action.
- Bookmark action.
- View count.
- Author details.
- Verification status.

Each note card should display:
- Title.
- Subject.
- Description.
- Author.
- Upload date.
- File type.
- Views/downloads.

Include an upload form with validation and upload progress.

### J. Polls

Create a clean poll interface.

Include:
- Poll of the Day.
- Question.
- Options.
- Vote button.
- Results visualization.
- Total votes.
- Poll closing time.
- Previous polls.

After voting, show results in a clear bar chart or percentage-based visualization.

### K. Mentorship

Build a student mentorship discovery interface.

Include:
- Search mentors.
- Filter by branch.
- Filter by skills.
- Mentor profile cards.
- Experience/interests.
- Request mentorship button.
- Mentorship request status.
- My mentors section.

Mentor cards should have a clear visual hierarchy and consistent profile presentation.

### L. Lost & Found

Create a dedicated lost-and-found section.

Include:
- Lost item listings.
- Found item listings.
- Search and filters.
- Item image.
- Item title.
- Category.
- Location.
- Date reported.
- Status.
- Report item button.
- Contact or claim workflow.

Do not publicly display private contact information.

### M. Academic Calendar

Build a calendar page with:
- Monthly calendar.
- Weekly view.
- Upcoming events.
- Academic deadlines.
- Examination dates.
- Holidays.
- Event detail popovers.
- Calendar filters.

Use different visual indicators for academic events, examinations, holidays, and community events.

### N. Campus Q&A

Build a question-and-answer community.

Include:
- Ask Question button.
- Question feed.
- Categories.
- Search.
- Answers.
- Upvotes.
- Accepted answer indicator.
- Tags.
- Question status.
- Report action.

Use a familiar, readable forum-style layout.

### O. Student Profile

Create a polished student profile page.

Include:
- Cover section.
- Profile avatar.
- Student name.
- Branch and academic year.
- Short bio.
- Interests and skills.
- Edit Profile button.
- Posts.
- Shared notes.
- Achievements.
- Points.
- Badges.
- Followers/following if supported.

Keep personal and academic information privacy-aware.

### P. Notifications

Create a notification center.

Include tabs:
- All.
- Mentions.
- Activity.
- Events.
- System.

Notification types:
- Likes.
- Comments.
- Replies.
- New messages.
- Event updates.
- Mentorship requests.
- Announcements.

Include:
- Unread indicators.
- Mark as read.
- Mark all as read.
- Notification preferences.

### Q. Admin Panel

Create a separate, role-protected administration interface.

Use a professional dashboard layout.

Include:
- Overview statistics.
- User management.
- Announcement management.
- Event management.
- Notes moderation.
- Reports queue.
- Content moderation.
- Poll management.
- Audit/activity history.

The reports queue should show:
- Reported content.
- Report category.
- Reporter information according to authorized permissions.
- Report time.
- Review status.
- Review action.

Use clear confirmation dialogs for destructive actions.

Do not expose admin functionality to ordinary students.

### R. Settings

Include:
- Account settings.
- Profile settings.
- Security.
- Active sessions.
- Notification preferences.
- Theme preferences.
- Privacy controls.
- Blocked users.
- Account export.
- Account deletion.

### S. Other Required UI States

Design reusable screens/components for:
- 404 page.
- 403 access denied.
- 500 server error.
- Empty states.
- Skeleton loading.
- Form validation errors.
- Network errors.
- Success notifications.
- Confirmation dialogs.
- Permission-denied states.
- Session expiration.

## 6. Reusable Component Library

Create a consistent component system.

Components should include:
- Button.
- IconButton.
- Input.
- SearchBar.
- Textarea.
- Select.
- Tabs.
- Badge.
- Avatar.
- AvatarGroup.
- Card.
- Modal.
- Drawer.
- Dropdown.
- Tooltip.
- Toast.
- Skeleton.
- EmptyState.
- Pagination.
- PostCard.
- EventCard.
- NoteCard.
- MentorCard.
- NotificationItem.
- UserListItem.
- Sidebar.
- Topbar.
- MobileNavigation.

Use shared components instead of independently styling every page.

## 7. Interaction and Animation

Every visible control should have a meaningful interaction.

Implement:
- Button hover states.
- Smooth page transitions.
- Sidebar collapse/expand.
- Dropdown menus.
- Modal transitions.
- Tabs.
- Search interactions.
- Filter interactions.
- Form validation.
- Toast notifications.
- Loading indicators.
- Responsive navigation.
- Theme switching.

Use subtle animations, preferably around 150–250ms.

Avoid unnecessary motion and respect reduced-motion preferences.

## 8. Responsive Design

Support:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

Suggested breakpoints:
- Mobile: below 640px.
- Tablet: 640px–1023px.
- Desktop: 1024px and above.

Requirements:
- No horizontal overflow.
- Readable text at all sizes.
- Consistent spacing.
- Touch-friendly controls.
- Responsive card grids.
- Proper mobile navigation.

## 9. Accessibility

Follow accessible design practices:
- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Proper form labels.
- Accessible contrast.
- Screen-reader-friendly labels.
- Descriptive button names.
- Accessible dialogs.
- Reduced-motion support.

Do not communicate status through color alone.

## 10. Technical Implementation

Follow the existing VibeZone PRD and its confirmed technical decisions.

- Framework: Next.js App Router.
- Language: TypeScript.
- Database: Neon PostgreSQL.
- Hosting: Vercel.
- Styling: Tailwind CSS.
- Components: reusable component architecture.
- Icons: Lucide.
- Forms: validated forms with clear error messages.

Do not introduce a different primary database or OCI.

Use the API endpoints and authentication/session design defined in the VibeZone PRD.

The UI must connect to real backend endpoints. Do not present hardcoded sample data as real user activity.

Use mock data only for clearly identified development previews.

Keep database access, authorization, and sensitive operations on the server side.

## 11. Important Functional Requirements

- Authentication must work.
- Session handling must work.
- Role-based access must be enforced.
- Users must only access authorized resources.
- Forms must validate input.
- Search and filters must work.
- Uploads must display progress and errors.
- Buttons must perform their advertised actions.
- Loading and empty states must be implemented.
- Unauthorized users must not access protected pages.
- Admin pages must enforce admin permissions on the server.
- Mobile and desktop layouts must both work.

## 12. Design Quality Rules

1. Prioritize usability over decoration.
2. Maintain one consistent design system.
3. Use the same spacing scale across all pages.
4. Use consistent button and card styles.
5. Avoid overcrowded dashboards.
6. Avoid excessive gradients.
7. Avoid random colors.
8. Use realistic campus-related imagery.
9. Use clear labels and meaningful icons.
10. Make the UI look like a real, professionally designed product.

## 13. Development Workflow

Build the application in stages:

**Stage 1 — Foundation**
- Design tokens.
- Typography.
- Theme system.
- Global layout.
- Sidebar.
- Topbar.
- Mobile navigation.
- Reusable components.

**Stage 2 — Core Screens**
- Landing page.
- Authentication.
- Home dashboard.
- Explore.
- Profile.
- Social feed.
- Create post.

**Stage 3 — Community Features**
- Chat.
- Events.
- Notes.
- Polls.
- Mentorship.
- Lost & Found.
- Q&A.
- Academic Calendar.

**Stage 4 — Platform Management**
- Notifications.
- Settings.
- Admin panel.
- Moderation screens.

**Stage 5 — Quality**
- Responsive testing.
- Accessibility.
- Empty and error states.
- Loading states.
- API integration.
- Security and permission testing.
- Visual consistency review.

## 14. Final Expected Result

Deliver a complete, polished VibeZone application that feels like a premium campus community platform.

The interface should be visually close to the supplied design references while remaining practical, accessible, responsive, and consistent with the VibeZone PRD.

Do not stop after creating the landing page.

Build every required page, reusable component, responsive layout, and interaction. Prioritize a consistent, production-quality user experience across the entire platform.