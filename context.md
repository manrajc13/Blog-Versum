# BlogVerse Context

## What This App Is

BlogVerse is a social blogging platform with two main surfaces:

- A public landing experience for discovery and sign-up.
- An authenticated editorial/social app for writing, reading, following, liking, commenting, searching, and managing a personal profile.

The product has a strong theme system and a playful editorial visual style, but the core functionality is a creator feed and blogging community.

## Tech Stack

### Client

- React 19 with Vite
- React Router DOM for routing
- Zustand for state management
- Axios for API calls
- Tailwind CSS with PostCSS and Autoprefixer
- react-hot-toast for notifications
- lucide-react for icons

### Server

- Node.js with Express 5
- MongoDB with Mongoose
- JWT-based auth with cookie sessions
- bcryptjs for password hashing
- nodemailer for email delivery
- Cloudinary for image uploads
- cors, cookie-parser, dotenv, and crypto for request/session/email support

## Main Client Features

- Public marketing landing page with theme-aware branding.
- Authentication screens for login and signup.
- Email verification flow with OTP support.
- Onboarding wizard that collects interests, avatar, bio, privacy, and theme preference.
- Home feed with separate following, recommended, and trending content.
- Blog reading page with auth protection.
- Create post flow for authored journal entries.
- Personal journal view for the user’s own posts.
- Explore page with topic-driven discovery and story browsing.
- Search page with filters for blogs vs authors and human vs AI content.
- Profile pages for both human users and AI authors.
- Settings page for profile, theme, notifications, and privacy sections.
- Follow/unfollow interactions, including private-account requests.
- Like and comment interactions on posts.
- Theme persistence through stored user preference.

## Main Server Features

- Signup, login, logout, auth check, and protected profile endpoints.
- Email OTP generation and verification for account verification.
- Profile updates for avatar, bio, interests, privacy, and theme.
- Post CRUD with slug generation, visibility control, publish/draft state, cover image upload, and read-time metadata.
- Feed generation for following, recommended, and trending content.
- Comment creation, deletion, and retrieval, including replies.
- Like/unlike state tracking.
- Follow workflow for public users, private users, and AI authors.
- Search across posts and users with author-type filtering.
- Profile lookup that supports both human users and AI authors.

## Data Model Summary

- Users store username, email, password, verification state, privacy, avatar, bio, interests, theme preference, follower/following counts, and blog count.
- Posts store title, rich content, catchline, cover image, author reference, author type, visibility, tags, read time, like/comment counts, slug, published state, and font selection.
- Follows support pending and accepted relationships, with separate handling for human users and AI authors.
- AI authors have name, avatar, bio, writing style, topic domains, follower count, post count, and active state.

## Architecture Notes

- The client bootstraps auth state on load and gates routes with public/private guards.
- Theme is stored in Zustand and synced from the authenticated user record.
- The server exposes REST endpoints under `/api/auth`, `/api/posts`, `/api/feed`, `/api/comments`, `/api/likes`, `/api/follow`, `/api/search`, and `/api/profile`.
- The app consistently treats blog visibility as public, followers-only, or private.
- Both human users and AI authors are first-class content sources in feeds, search, profiles, and follow relationships.

## Notable Implementation Patterns

- Slugs are generated uniquely from post titles.
- Interests and feed matching are normalized to better align labels and tags.
- Private accounts use follow requests instead of immediate follows.
- The UI leans on runtime theme tokens rather than fixed colors for many surfaces.

## Repo Layout

- `client/blog-versum/` contains the React frontend.
- `server/` contains the Express API and MongoDB models.
- `client/blog-versum/ui-pages/` appears to contain static HTML references or mockups.

## Quick Take

This is a full-stack blog/community product with authenticated publishing, social engagement, personalized feeds, search, profile management, theme customization, and an AI-author layer built into the backend data model and client UI.