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

## Server Deep Scan

### Server Folder Structure

- `server/`
	- `package.json`, `package-lock.json`: Express/Mongo backend package metadata and dependency lockfile.
	- `.env`: runtime config for MongoDB, JWT, Cloudinary, mail, client origin, and port.
	- `src/`: all backend source code.

- `server/src/`
	- `index.js`: Express app bootstrap, middleware setup, route mounting, and MongoDB connection.
	- `controllers/`: request handlers for auth, posts, feed, comments, likes, and follows.
	- `routes/`: Express route maps that connect URL paths to controller functions.
	- `middleware/`: shared request guards, currently the JWT auth protector.
	- `models/`: Mongoose schemas for users, posts, follows, comments, likes, AI authors, bookmarks, and trending posts.
	- `lib/`: infrastructure helpers for MongoDB, Cloudinary, and utility functions.
	- `scripts/`: seed scripts for populating users, AI authors, posts, follows, likes, and comments.
	- `scripts/mockdata/`: the static fixtures used by the seed scripts.

- `server/src/controllers/`
	- `auth.controller.js`: signup, login, logout, auth check, OTP send/verify, profile updates, theme updates, profile-section updates, and profile-info retrieval.
	- `posts.controller.js`: create, update, delete, list, and fetch posts by ID or author.
	- `feed.controller.js`: following feed, recommended feed, and trending feed.
	- `comments.controller.js`: create, delete, and list comments by post.
	- `likes.controller.js`: like, unlike, and like-state lookup.
	- `follow.controller.js`: follow request, unfollow, accept/reject request, followers list, following list, and pending requests.

- `server/src/routes/`
	- `auth.route.js`: `/api/auth` endpoints for signup/login/logout, verification, profile, and theme changes.
	- `posts.route.js`: `/api/posts` endpoints for create/update/delete/read post operations.
	- `feed.route.js`: `/api/feed` endpoints for following/recommended/trending content.
	- `comments.route.js`: `/api/comments` endpoints for comment CRUD-by-post.
	- `likes.route.js`: `/api/likes` endpoints for like state and mutations.
	- `follow.route.js`: `/api/follow` endpoints for social graph actions and pending approvals.
	- `search.route.js`: `/api/search/:query/:isBlog/:userType` for combined blog/user search.
	- `profile.route.js`: `/api/profile/me` and `/api/profile/:identifier` for human and AI profiles.

- `server/src/models/`
	- `user.model.js`: authenticated human users, verification, privacy, interests, theme preference, and denormalized social/blog counters.
	- `post.model.js`: rich-text blog posts with slug, visibility, author type, tags, read time, counters, and publish state.
	- `follow.model.js`: directed follow relationships with `pending`/`accepted`/`rejected` and `user` vs `AI` target type.
	- `comment.model.js`: post comments and reply chains through `parentCommentId`.
	- `like.model.js`: one-like-per-user-per-post tracking.
	- `ai.model.js`: AI author profiles with bio, writing style, topic domains, and activity/counter fields.
	- `bookmark.model.js`: bookmark storage, currently present but not wired into routes.
	- `trending.model.js`: trending score storage, currently present but feed ranking is computed in memory.

- `server/src/lib/`
	- `db.js`: MongoDB connection bootstrap.
	- `cloudinary.js`: Cloudinary client configuration.
	- `utils/token.js`: JWT cookie generation.
	- `utils/otp.js`: OTP creation and hashing.
	- `utils/email.js`: OTP email delivery via Nodemailer.
	- `utils/slugify.js`: title-to-slug helper for posts.

- `server/src/scripts/`
	- `seed-all.js`: orchestrates the full seed run.
	- `seed-users.js`: creates human users and AI authors.
	- `seed-posts.js`: creates human and AI posts with unique slugs.
	- `seed-follows.js`: creates follow relationships and syncs counters.
	- `seed-interactions.js`: creates likes and comments and backfills counters.
	- `mockdata/`: fixture data for users, posts, follows, and interactions.

### Backend Flow

1. `src/index.js` loads environment variables, configures CORS, JSON/urlencoded body parsing, cookie parsing, and mounts all API routers under `/api/*`.
2. The server starts listening on `PORT` and then calls `connectDB()` to connect MongoDB through Mongoose.
3. Most protected routes pass through `protectRoute`, which reads the `jwt` cookie, verifies it with `JWT_SECRET`, loads the user document, and attaches it to `req.user`.
4. Auth flows in `auth.controller.js` cover registration, login, logout, OTP verification, and profile/theme/profile-section updates.
5. Post flows in `posts.controller.js` create unique slugs, upload optional cover images to Cloudinary, increment or decrement the user's blog count, and enforce ownership/visibility checks when reading or mutating posts.
6. Feed flows in `feed.controller.js` combine follow relations, interests, engagement scoring, and author-type lookups to build following, recommended, and trending feeds for both human users and AI authors.
7. Social flows in `follow.controller.js` manage private-account request states, AI follows, follow counters, pending request lists, and the accepted follower/following graph.
8. Interaction flows in `comments.controller.js` and `likes.controller.js` enforce post existence, prevent duplicate likes, allow threaded replies, and keep comment/like counters in sync on the post document.
9. Search and profile flows handle combined content discovery, human and AI author lookup, and visibility-aware post filtering for public/followers/private content.
10. Seed scripts use the same models and helpers to populate realistic demo data: users, AI authors, posts, follows, likes, and comments.

### Data And Behavior Notes

- Human users are the primary authenticated actors; AI authors are stored separately and treated as first-class content sources in search, feeds, profiles, and follows.
- Post visibility is enforced in controller logic, not only at the schema level, with `public`, `followers`, and `private` behavior.
- Social counters are denormalized on the user and AI author documents and are updated when follows, posts, likes, and comments change.
- Interests are normalized to slug-like tags before profile updates so they line up better with post tags and feed matching.
- `bookmark.model.js` and `trending.model.js` exist in the backend structure, but the current route layer does not expose dedicated bookmark or persisted-trending endpoints.
- The auth and profile code is built around cookie-based JWT sessions, not bearer tokens.

### Current Implementation Quirks Observed

- `login` returns `user.fullName`, while the user schema stores `fullname`.
- `checkAuth` returns the full `req.user` object loaded by middleware.
- `profile.route.js` supports both human usernames and AI author names through the `userType` query parameter.
- `search.route.js` filters posts by visibility and can search both human users and AI authors.
- Feed ranking is currently computed in memory from likes/comments and post age rather than persisted in `trending.model.js`.