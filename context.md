# BlogVerse Context

## What This App Is

BlogVerse is a social blogging platform with two main surfaces:

- A public landing experience for discovery and sign-up.
- An authenticated editorial/social app for writing, reading, following, liking, commenting, searching, direct messaging, and managing a personal profile.

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
- No `socket.io-client` dependency yet — the client cannot connect to the server's Socket.IO layer (see [Direct Messaging](#direct-messaging-in-progress) below).

### Server

- Node.js with Express 5
- MongoDB with Mongoose
- JWT-based auth with cookie sessions
- bcryptjs for password hashing
- nodemailer for email delivery
- Cloudinary for image uploads
- Socket.IO for real-time events (currently: direct messages, online-user presence)
- cors, cookie-parser, dotenv, and crypto for request/session/email support

## Main Client Features

- Public marketing landing page with theme-aware branding.
- Authentication screens for login and signup.
- Email verification flow with OTP support.
- Onboarding wizard that collects interests, avatar, bio, privacy, and theme preference.
- Home feed with separate following, recommended, and trending content.
- Blog reading page with auth protection.
- Create post flow for authored journal entries.
- Personal journal view for the user's own posts.
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
- Direct messaging: 1:1 conversations, text/image messages, and real-time delivery + online-presence broadcast over Socket.IO (server-side only — see below).

## Data Model Summary

- Users store username, email, password, verification state, privacy, avatar, bio, interests, theme preference, follower/following counts, and blog count.
- Posts store title, rich content, catchline, cover image, author reference, author type, visibility, tags, read time, like/comment counts, slug, published state, and font selection.
- Follows support pending and accepted relationships, with separate handling for human users and AI authors.
- AI authors have name, avatar, bio, writing style, topic domains, follower count, post count, and active state.
- Conversations store two `participants`, a `lastMessage` ref, denormalized `lastMessageText`/`lastMessageAt` for list sorting.
- Messages store `conversationId`, `senderId`, `text`, optional `image` URL, `messageType` (text/image), a `status` enum (sent/delivered/read, not yet driven by any read-receipt logic), and `isDeleted` (soft-delete flag, not yet exposed via any route).

## Architecture Notes

- The client bootstraps auth state on load and gates routes with public/private guards.
- Theme is stored in Zustand and synced from the authenticated user record.
- The server exposes REST endpoints under `/api/auth`, `/api/posts`, `/api/feed`, `/api/comments`, `/api/likes`, `/api/follow`, `/api/search`, `/api/profile`, and `/api/messages`.
- The Express `app` is now created inside `lib/socket.js` and wrapped in a raw `http` server so Socket.IO can share the same HTTP listener; `index.js` imports `{ app, server }` from there instead of calling `express()` itself.
- The app consistently treats blog visibility as public, followers-only, or private.
- Both human users and AI authors are first-class content sources in feeds, search, profiles, and follow relationships.

## Notable Implementation Patterns

- Slugs are generated uniquely from post titles.
- Interests and feed matching are normalized to better align labels and tags.
- Private accounts use follow requests instead of immediate follows.
- The UI leans on runtime theme tokens rather than fixed colors for many surfaces.
- Real-time delivery uses an in-memory `{ userId: socketId }` map in `lib/socket.js`; there is no adapter for multi-instance deployments, so presence/delivery only works within a single server process.

## Repo Layout

- `client/blog-versum/` contains the React frontend.
- `server/` contains the Express API, Socket.IO server, and MongoDB models.
- `client/blog-versum/ui-pages/` appears to contain static HTML references or mockups.

## Quick Take

This is a full-stack blog/community product with authenticated publishing, social engagement, personalized feeds, search, profile management, theme customization, an AI-author layer built into the backend data model and client UI, and an in-progress real-time direct-messaging layer (backend complete, frontend not yet wired up).

---

# Server Deep Scan

## Server Folder Structure

- `server/`
    - `package.json`, `package-lock.json`: Express/Mongo/Socket.IO backend package metadata and dependency lockfile.
    - `.env`: runtime config for MongoDB, JWT, Cloudinary, mail, client origin, and port.
    - `src/`: all backend source code.

- `server/src/`
    - `index.js`: Express app bootstrap (app/server sourced from `lib/socket.js`), middleware setup, route mounting, and MongoDB connection.
    - `controllers/`: request handlers for auth, posts, feed, comments, likes, follows, and messages.
    - `routes/`: Express route maps that connect URL paths to controller functions.
    - `middleware/`: shared request guards, currently the JWT auth protector.
    - `models/`: Mongoose schemas for users, posts, follows, comments, likes, AI authors, bookmarks, trending posts, conversations, and messages.
    - `lib/`: infrastructure helpers for MongoDB, Cloudinary, Socket.IO, and utility functions.
    - `scripts/`: seed scripts for populating users, AI authors, posts, follows, likes, and comments.
    - `scripts/mockdata/`: the static fixtures used by the seed scripts.

- `server/src/controllers/`
    - `auth.controller.js`: signup, login, logout, auth check, OTP send/verify, profile updates, theme updates, profile-section updates, and profile-info retrieval.
    - `posts.controller.js`: create, update, delete, list, and fetch posts by ID or author.
    - `feed.controller.js`: following feed, recommended feed, and trending feed.
    - `comments.controller.js`: create, delete, and list comments by post.
    - `likes.controller.js`: like, unlike, and like-state lookup.
    - `follow.controller.js`: follow request, unfollow, accept/reject request, followers list, following list, and pending requests.
    - `message.controller.js`: `sendMessage` (creates/reuses a conversation, uploads an optional image to Cloudinary, persists the message, updates conversation's last-message fields, and emits `newMessage` to both sender's and receiver's sockets), `getConversations` (list current user's conversations sorted by `lastMessageAt`), `getConversationWithUser` (find-or-create the conversation with a specific user plus its full message history), `getMessagesByConversation` (fetch messages for a conversation ID after verifying the requester is a participant).

- `server/src/routes/`
    - `auth.route.js`: `/api/auth` endpoints for signup/login/logout, verification, profile, and theme changes.
    - `posts.route.js`: `/api/posts` endpoints for create/update/delete/read post operations.
    - `feed.route.js`: `/api/feed` endpoints for following/recommended/trending content.
    - `comments.route.js`: `/api/comments` endpoints for comment CRUD-by-post.
    - `likes.route.js`: `/api/likes` endpoints for like state and mutations.
    - `follow.route.js`: `/api/follow` endpoints for social graph actions and pending approvals.
    - `search.route.js`: `/api/search/:query/:isBlog/:userType` for combined blog/user search.
    - `profile.route.js`: `/api/profile/me` and `/api/profile/:identifier` for human and AI profiles.
    - `message.route.js`: `/api/messages` — `GET /conversations`, `GET /with/:userId`, `GET /conversation/:conversationId`, `POST /send/:receiverId`. All routes go through `protectRoute`.

- `server/src/models/`
    - `user.model.js`: authenticated human users, verification, privacy, interests, theme preference, and denormalized social/blog counters.
    - `post.model.js`: rich-text blog posts with slug, visibility, author type, tags, read time, counters, and publish state.
    - `follow.model.js`: directed follow relationships with `pending`/`accepted`/`rejected` and `user` vs `AI` target type.
    - `comment.model.js`: post comments and reply chains through `parentCommentId`.
    - `like.model.js`: one-like-per-user-per-post tracking.
    - `ai.model.js`: AI author profiles with bio, writing style, topic domains, and activity/counter fields.
    - `bookmark.model.js`: bookmark storage, currently present but not wired into routes.
    - `trending.model.js`: trending score storage, currently present but feed ranking is computed in memory.
    - `conversation.model.js`: 1:1 `participants` array, `lastMessage` ref, `lastMessageText`, `lastMessageAt`; indexed on `participants` and `lastMessageAt` for list queries. Schema allows >2 participants but controller logic (`$size: 2`) only ever creates/looks up 2-person conversations — no group chat.
    - `message.model.js`: `conversationId`, `senderId`, `text`, `image`, `messageType` (text/image), `status` (sent/delivered/read — set on create, never updated afterward), `isDeleted` (soft-delete flag with no route that sets it to `true`). Indexed on `(conversationId, createdAt)` and `senderId`.

- `server/src/lib/`
    - `db.js`: MongoDB connection bootstrap.
    - `cloudinary.js`: Cloudinary client configuration.
    - `socket.js`: creates the Express `app`, wraps it in an `http.Server`, attaches a Socket.IO server (CORS locked to `http://localhost:5173`, hardcoded rather than `process.env.CLIENT_URL`), tracks online users in an in-memory `userSocketMap`, broadcasts `getOnlineUsers` on connect/disconnect, and exports `getReceiverSocketId(userId)` for controllers to target a specific socket.
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
    - `mockdata/`: fixture data for users, posts, follows, and interactions. No message/conversation seed data exists yet.

## Backend Flow

1. `src/index.js` loads environment variables, configures CORS, JSON/urlencoded body parsing, cookie parsing, and mounts all API routers under `/api/*`. `app`/`server` are imported from `lib/socket.js` rather than created locally.
2. The server starts listening on `PORT` via `server.listen` (an `http.Server`, not the bare Express app) and then calls `connectDB()` to connect MongoDB through Mongoose.
3. Most protected routes pass through `protectRoute`, which reads the `jwt` cookie, verifies it with `JWT_SECRET`, loads the user document, and attaches it to `req.user`.
4. Auth flows in `auth.controller.js` cover registration, login, logout, OTP verification, and profile/theme/profile-section updates.
5. Post flows in `posts.controller.js` create unique slugs, upload optional cover images to Cloudinary, increment or decrement the user's blog count, and enforce ownership/visibility checks when reading or mutating posts.
6. Feed flows in `feed.controller.js` combine follow relations, interests, engagement scoring, and author-type lookups to build following, recommended, and trending feeds for both human users and AI authors.
7. Social flows in `follow.controller.js` manage private-account request states, AI follows, follow counters, pending request lists, and the accepted follower/following graph.
8. Interaction flows in `comments.controller.js` and `likes.controller.js` enforce post existence, prevent duplicate likes, allow threaded replies, and keep comment/like counters in sync on the post document.
9. Search and profile flows handle combined content discovery, human and AI author lookup, and visibility-aware post filtering for public/followers/private content.
10. Messaging flows in `message.controller.js` find-or-create a 2-person `Conversation`, persist a `Message`, patch the conversation's last-message fields, and — separately from the HTTP response — push a `newMessage` event over Socket.IO to whichever of the sender/receiver sockets are currently connected (looked up via `lib/socket.js`'s `userSocketMap`).
11. Socket.IO connection handling in `lib/socket.js` reads `userId` from the handshake query string, maps it to the live socket id, and broadcasts the full online-user id list to everyone on every connect/disconnect.
12. Seed scripts use the same models and helpers to populate realistic demo data: users, AI authors, posts, follows, likes, and comments.

## Data And Behavior Notes

- Human users are the primary authenticated actors; AI authors are stored separately and treated as first-class content sources in search, feeds, profiles, and follows.
- Post visibility is enforced in controller logic, not only at the schema level, with `public`, `followers`, and `private` behavior.
- Social counters are denormalized on the user and AI author documents and are updated when follows, posts, likes, and comments change.
- Interests are normalized to slug-like tags before profile updates so they line up better with post tags and feed matching.
- `bookmark.model.js` and `trending.model.js` exist in the backend structure, but the current route layer does not expose dedicated bookmark or persisted-trending endpoints.
- The auth and profile code is built around cookie-based JWT sessions, not bearer tokens; Socket.IO connections are **not** authenticated the same way — the client just passes a raw `userId` in the handshake query, so any client can claim to be any user's socket.
- AI authors cannot be messaged — `message.controller.js` only resolves `receiverId`/`otherUserId` against the `User` model, not `ai.model.js`.

## Current Implementation Quirks Observed

- `login` returns `user.fullName`, while the user schema stores `fullname`.
- `checkAuth` returns the full `req.user` object loaded by middleware.
- `profile.route.js` supports both human usernames and AI author names through the `userType` query parameter.
- `search.route.js` filters posts by visibility and can search both human users and AI authors.
- Feed ranking is currently computed in memory from likes/comments and post age rather than persisted in `trending.model.js`.
- `lib/socket.js` hardcodes CORS origin to `http://localhost:5173` instead of reading `process.env.CLIENT_URL` like the rest of the app does — production Socket.IO connections will be rejected by CORS as currently written.
- `Message.status` and `Message.isDeleted` are defined in the schema but nothing in the route/controller layer ever transitions them past their defaults — no read receipts, no delete-message endpoint.
- `userSocketMap` in `lib/socket.js` is process-local memory; presence and delivery break across multiple server instances/restarts (no Redis adapter or similar).

---

# Direct Messaging (in progress)

This feature is **backend-complete, frontend-stubbed**. Useful to know before picking up chat UI work:

- Server: `message.controller.js`, `message.route.js`, `conversation.model.js`, `message.model.js`, `lib/socket.js` are all implemented and mounted at `/api/messages` (see Server Deep Scan above).
- Client: `store/useMessageStore.js` exists but only declares state flags (`users`, `isfetchingUsers`, `isfetchingMessages`, `isSendingMessage`) and a `fetchUsers` action that sets a loading flag and never calls the API or returns data.
- No chat page/route exists in `App.jsx`, no chat UI components exist under `components/`, and `socket.io-client` is not in `client/blog-versum/package.json` — so the client cannot open a socket connection at all yet.
- Anyone picking this up needs to: add `socket.io-client`, connect it (passing `authUser._id` as the `userId` query param to match `lib/socket.js`'s handshake expectation), build out `useMessageStore` against the four `/api/messages` endpoints, listen for the `newMessage` and `getOnlineUsers` socket events, and add a route + page/components for the chat UI.

---

# Client Deep Scan

The client is a Vite + React 19 app at `client/blog-versum/`. This section is intentionally kept to one-line-per-file — enough to navigate straight to the right file, not a full read. For visual/design conventions, see [Frontend Design Patterns](#frontend-design-patterns) below.

## Client Folder Structure

- `client/blog-versum/`
    - `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `vercel.json`: build/tooling config.
    - `DESIGN.md`: the frontend design-system source of truth (theming, geometry, typography, component styling rules).
    - `public/`, `dist/`: static assets and build output.
    - `src/`: all frontend source.
- `client/ui-pages/`: standalone static HTML mockups (`home.html`, `homev2.html`, `login.html`, `signup.html`, `theme.html`) — reference/legacy, not part of the built React app.

## `src/` Top Level

- `App.jsx` — route table; wraps every route in `AuthGuard`/`PublicRoute`, bootstraps auth via `useAuthStore.checkAuth()` on mount, renders a global `Toaster`.
- `main.jsx` — React root render entrypoint (StrictMode).
- `index.css` — Tailwind entry + global styles.

## `src/pages/`

- `Home.jsx` — main authenticated feed (For You/Following/Popular tabs, trending topics). Uses `useThemeStore`, `useFeedStore`, `useFollowStore`.
- `Home2.jsx` — public marketing landing page composing hero/features/bento/CTA sections. Uses `useThemeStore`.
- `Login.jsx` / `Signup.jsx` — auth forms with OTP email-verification flow. Uses `useAuthStore`.
- `Onboarding.jsx` — multi-step post-signup wizard (interests, avatar, bio, privacy, theme). Uses `useAuthStore`, `useThemeStore`.
- `Explore.jsx` — topic-deck-driven discovery page revealing a masonry feed per topic (currently mock data, no store fetch). Uses `useThemeStore`.
- `SearchPage.jsx` — full search results view with type/origin filters. Uses `useThemeStore`, `useSearchStore`.
- `ProfilePage.jsx` — viewable profile (human or AI) with posts, stats, follow actions. Uses `useThemeStore`, `useProfileStore`, `useFollowStore`.
- `Myjournal.jsx` — the current user's own posts with All/Public/Followers/Drafts filters and delete flow. Uses `useThemeStore`, `usePostStore`.
- `Createpost.jsx` — post editor (cover image, font, catchline, publish/draft). Uses `useThemeStore`, `usePostStore`.
- `ViewBlogPage.jsx` — single post reader with likes and comments section. Uses `useThemeStore`, `usePostStore`, `useLikeStore`, `useCommentStore`.
- `settings/Settings.jsx` — settings shell with sidebar nav (Profile/Theme/Notifications/Privacy via query param) + logout. Uses `useThemeStore`, `useAuthStore`.
- `settings/sections/ProfileSection.jsx` — edit profile form (username/bio/avatar). Uses `useAuthStore`.
- `settings/sections/ThemeSection.jsx` — theme picker grid. Uses `useThemeStore`, `useAuthStore`.
- `settings/sections/NotificationsSection.jsx` — pending follow-request accept/reject list. Uses `useFollowStore`.

## `src/components/`

- `BlogCard.jsx` — dual-mode post card ("home" feed vs "journal" author variant); data passed via props.
- `Navbar.jsx` — authenticated top navbar (nav links, search bar, profile popover, logout). Uses `useAuthStore`, `useProfileStore`.
- `SearchBar.jsx` — debounced search input, calls `axiosInstance` directly (not a store).
- `SearchResultsDropdown.jsx` — dropdown rendering author/post results under `SearchBar`.
- `CoverImagePicker.jsx` — modal for picking a cover image from `lib/fallbackCoverImages.js`.
- `EmailVerificationCard.jsx` — OTP entry card with countdown, used by Login/Signup.
- `SocialAuthButtons.jsx` — Google OAuth button placeholder.
- `Footer.jsx` — site-wide footer.
- `MascortCard.jsx` — animated illustrated mascot widget (auth/onboarding pages).
- `comments/index.jsx` — comments section container (skeleton, `CommentItem` list, composer). Uses `useThemeStore`.
- `comments/CommentItem.jsx`, `comments/ReplyItem.jsx` — comment/reply rows with reply-toggle and owner-delete; data/actions via props.
- `explore/Topicdeck.jsx`, `explore/MasonryFeed.jsx`, `explore/ExploreBackground.jsx` — Explore page's topic switcher, masonry grid, and decorative background.
- `home2/HeroSection.jsx`, `FeaturesGrid.jsx`, `BentoShowcase.jsx`, `CtaSection.jsx`, `PublicNavbar.jsx` — landing-page section components, all theme-token driven.
- `onboarding/StepAvatar.jsx`, `StepBio.jsx`, `StepInterests.jsx`, `StepPrivacy.jsx`, `StepTheme.jsx` — one component per onboarding wizard step; local state, applied to the backend later via `Onboarding.jsx`.
- `profile/ConnectionsCard.jsx` — followers/following list card. Uses `useFollowStore`.
- `profile/ProfilePopoverCard.jsx` — navbar profile dropdown (stats + logout); data via props.
- `shared/PageDoodles.jsx` — reusable decorative SVG background used across most pages (density via `variant` prop). Uses `useThemeStore`.
- `toasts/DeletePostConfirmToast.jsx`, `toasts/UnfollowConfirmToast.jsx` — custom `react-hot-toast` confirmation UIs.

## `src/store/` (Zustand — see mapping table below for API calls)

`useAuthStore`, `useThemeStore`, `useFeedStore`, `usePostStore`, `useFollowStore`, `useLikeStore`, `useCommentStore`, `useProfileStore`, `useSearchStore`, `useExploreStore` (stub — just `topics: []`), `useMessageStore` (stub — see [Direct Messaging](#direct-messaging-in-progress)), `themeConfig.js` (static theme palette data + `hexToRgba` helper, not a store).

## `src/lib/` (non-store helpers)

- `axios.js` — shared `axiosInstance` (baseURL from `VITE_API_URL`, `withCredentials: true`).
- `defaultAvatar.js` — default avatar image URLs.
- `fallbackCoverImages.js` — curated cover images + deterministic hash-based picker.
- `Mockexploredata.js`, `mockProfileData.js`, `mockSearchData.js` — mock datasets used to stub Explore/Profile/Search UI ahead of/independent of real backend wiring.

## `src/guards/`

- `RouteGuards.jsx` — `AuthGuard` (redirects to `/` if no `authUser`) and `PublicRoute` (redirects to `/home` if already authenticated); both take `authUser` as a prop from `App.jsx`.
- `ScrollToTop.jsx` — resets scroll position on route change.

---

# Frontend Design Patterns

Full detail lives in `client/blog-versum/DESIGN.md`; this is the condensed version plus patterns observed in code that aren't spelled out there.

- **Theme tokens over fixed colors.** Every themed page/component reads `const theme = useThemeStore((state) => state.getTheme())` and uses `theme.primary` / `theme.homeBackground`, plus `hexToRgba(theme.primary, alpha)` (from `store/themeConfig.js`) for tints/borders/shadows instead of hardcoded hex values. Theme choices live in `themeConfig.js` (plain/sunshine/midnight/ocean/cotton/forest) and persist via Zustand's `persist` middleware under `localStorage` key `blogversum-theme`.
- **One Zustand store per domain**, all in `src/store/`, all following the same shape: plain `create((set, get) => ({...}))` (no `persist` except `useThemeStore`), one boolean loading flag per async action (e.g. `isFetchingPosts`, `isCreatingPost`, `isDeletingPost`), and actions that return data/booleans to the caller rather than storing large collections centrally — most pages call a store action and hold the result in local `useState`, using stores mainly as the API-call + loading-state layer rather than a full client-side cache.
- **Route guarding at the top level.** `App.jsx` wraps every `<Route>` element in `AuthGuard` or `PublicRoute` from `guards/RouteGuards.jsx`, driven by `authUser` from `useAuthStore`, checked once via `checkAuth()` on app mount.
- **Toast-driven feedback**, via `react-hot-toast`. Simple success/error toasts are fired directly from store actions; destructive confirmations use custom toast components (`components/toasts/DeletePostConfirmToast.jsx`, `UnfollowConfirmToast.jsx`) rendered inside `toast.custom(...)` rather than native `confirm()`.
- **Component organization by domain subfolder** under `components/` (`comments/`, `explore/`, `home2/`, `onboarding/`, `profile/`, `shared/`, `toasts/`), each folder scoped to one page or feature; page-level components in `pages/` compose them.
- **Decorative-but-shared background layer.** `components/shared/PageDoodles.jsx` is reused across most authenticated pages for the hand-drawn SVG motif described in `DESIGN.md`; Explore has its own dedicated `explore/ExploreBackground.jsx` instead.
- **Mock data as a stopgap.** `lib/Mockexploredata.js`, `lib/mockProfileData.js`, `lib/mockSearchData.js` exist so pages like `Explore.jsx` can be built/styled ahead of (or independent of) full backend wiring — a signal that a page using one of these is not yet fully live-data-driven.
- **Shape/geometry language** (from `DESIGN.md`): generous rounding (`rounded-xl`/`rounded-lg`) on containers, `rounded-full` pill shapes for chips/primary actions, thick borders and visible shadow for "cartoon-confidence" depth, Plus Jakarta Sans typography with heavy display weights for headlines.

---

# Frontend ↔ Backend Mapping

Which client store hits which server route. All calls go through `lib/axios.js`'s `axiosInstance` (`baseURL = VITE_API_URL`, cookies included), so backend paths below are relative to `/api`.

| Client store | Action | HTTP call | Backend route file → controller |
|---|---|---|---|
| `useAuthStore` | `checkAuth` | `GET /auth/check` | `auth.route.js` → `auth.controller.js` |
| | `getProfileInfo` | `GET /auth/profile-info` | same |
| | `signup` | `POST /auth/signup` | same |
| | `sendOTP` | `POST /auth/send-otp` | same |
| | `verifyOTP` | `POST /auth/verify-email` | same |
| | `login` | `POST /auth/login` | same |
| | `logout` | `POST /auth/logout` | same |
| | `updateProfile` | `PUT /auth/update-profile` | same |
| | `updateTheme` | `PUT /auth/update-theme` | same |
| | `updateProfileSection` | `PUT /auth/update-profile-section` | same |
| `useFeedStore` | `fetchHomeFeed` | `GET /feed/following`, `/feed/recommended`, `/feed/trending` (parallel) | `feed.route.js` → `feed.controller.js` |
| `usePostStore` | `fetchMyPosts` | `GET /posts/my-posts` | `posts.route.js` → `posts.controller.js` |
| | `createPost` | `POST /posts/create` | same |
| | `deletePost` | `DELETE /posts/delete/:postId` | same |
| | `fetchPostById` | `GET /posts/post/:postId` | same |
| `useFollowStore` | `fetchPendingRequests` | `GET /follow/pending` | `follow.route.js` → `follow.controller.js` |
| | `fetchFollowing` | `GET /follow/following` | same |
| | `fetchFollowers` | `GET /follow/followers` | same |
| | `sendFollowRequest` | `POST /follow/request` | same |
| | `acceptFollowRequest` | `POST /follow/accept` | same |
| | `rejectFollowRequest` | `POST /follow/reject` | same |
| | `unfollow` | `POST /follow/unfollow` | same |
| `useLikeStore` | `likePost` | `POST /likes/like/:postId` | `likes.route.js` → `likes.controller.js` |
| | `unlikePost` | `DELETE /likes/unlike/:postId` | same |
| | `hasLiked` | `GET /likes/hasliked/:postId` | same |
| `useCommentStore` | `fetchCommentsByPost` | `GET /comments/post/:postId` | `comments.route.js` → `comments.controller.js` |
| | `postComment` | `POST /comments/create` | same |
| | `deleteComment` | `DELETE /comments/delete/:commentId` | same |
| `useProfileStore` | `fetchMyProfileBasics` | `GET /profile/me` | `profile.route.js` |
| | `fetchProfile` | `GET /profile/:identifier?userType=` | same |
| `useSearchStore` | `fetchSearchResults` | `GET /search/:query/:isBlog/:userType` | `search.route.js` |
| `useMessageStore` | *(stub — `fetchUsers` sets a loading flag and calls no endpoint)* | — | `message.route.js` → `message.controller.js` exists and is fully functional server-side; nothing on the client calls it yet. See [Direct Messaging](#direct-messaging-in-progress). |
| `useExploreStore` | *(stub — `topics: []`, no actions)* | — | `Explore.jsx` currently reads from `lib/Mockexploredata.js` instead. |
| `useThemeStore` | local only (persisted to `localStorage`) | — | synced *from* `useAuthStore` (`syncThemeFromUser`) whenever auth/profile/theme responses include `themePreference`; not an independent API caller. |

Not yet reachable from the client at all: Socket.IO events (`newMessage`, `getOnlineUsers`) — no `socket.io-client` connection exists in `client/blog-versum`.
