# AI Internal Publishing API - Phase 1

## Goal

Prepare the backend architecture for AI-generated posts using LangGraph service present in agents/ folder. 
Refer to the agents/ codebase or more specifically main.py in that.

This PR **does not modify** the existing public `/api/posts/create` endpoint.

Instead, it introduces a new internal publishing API that will later be consumed by the Python LangGraph application.

---

# Objectives

## Backend

Create a new internal API endpoint:

```
POST /api/internal/posts
```

This endpoint is **not** intended for frontend usage.

---

## API Authorization

Create a middleware:

```
middleware/internalApiAuth.js
```

Responsibilities:

- Read the `x-api-key` request header.
- Compare it against `process.env.INTERNAL_API_KEY`.
- Return HTTP 401 if invalid or missing.
- Call `next()` if valid.

Do not use JWT authentication for this endpoint.

---

## Route

Create

```
routes/internal.route.js
```

Mount

```
POST /posts
```

behind the API key middleware.

The final endpoint should become

```
POST /api/internal/posts
```

---

## Controller

Create

```
controllers/internal.controller.js
```

Responsibilities:

- Validate required request fields.
- Delegate all database work to a service.
- Return success/error responses.

Keep controller logic minimal.

---

## Service Layer

Create

```
services/post.service.js
```

Although the existing public controller is not being refactored in this PR, implement the business logic here so the internal API is built on the desired architecture.

This service will later become the shared implementation for both the public and internal APIs.

---

## Payload

The endpoint should accept only AI-generated content fields.

Example:

```json
{
  "authorName": "Sophia",
  "title": "...",
  "catchline": "...",
  "content": "...",
  "tags": ["AI"]
}
```

The backend should remain responsible for:

- resolving the AI author
- generating slugs
- calculating read time
- timestamps
- persistence

---

# Environment Variables

Add

```
INTERNAL_API_KEY=
```

to `.env.example`.

Document its purpose.

---

# Agents Project


add api_client.py for making that internal api call under services/ directory inside the agents/ directory.
Study main.py to note how data is being stored in the final state of the graph/worklow.
---

# api_client.py

This module will eventually:

1. Execute the LangGraph workflow.
2. Receive structured output.
3. Send a POST request to

```
POST /api/internal/posts
```

using

```
x-api-key
```

No MongoDB code should exist in the Python project.

---

# Cover Image Handling 

refer to following public urls and randomly pick any of the following at the time of creating post using the internal api
COVER_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAgdl637JFCoBXP_kWH_MTBkXL2VApbfMRUL9DVpHR8jlA4Y6Nt7FzIB6JLVIaSknItI9vYVG4LIURVLfkqVM6LaE0VRB7i6uaFryXEq7LgidtXlFAB1YiPRX1tkon7FoAcJS4QtiAyXRqKcSSfkpfNE-1IrE-k37tjjBbgyS8D4vNtjMcMwvWHkxJjR5vwlZpwIhGbbsJnSL-yH3UoclGJpnopna5XwSL8HoL-bY7butzNyZ0UEEgQM-2aDDq75daHWGIxYRQ3BA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBl9gYfmoxN70h4IKA_MtIEYelT-6Fu1coFi674AZSWnuuls0mVBhmyenE5HkfXQsHvVhscOT8O0CY1tlp-Ab8576BlIzHEL0B2r5mcr2C30c4Idg57DlQFpBZMKH2qTBuc3INJeTcbwkX3D4ZAsiYRIT6bbsOqY1mDhfD7OKQegOoMmBYWpOXqq-mhdFo_LcHsV1bhmCS65VSjwtvdqwf_zvDte753LMAaiw29j6WMolFmKx9MrIkpRkqBQoWSOExrLgM6Twt8Cw',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=1200&q=80',
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1200&q=80',
  'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1200&q=80',
  'https://images.unsplash.com/photo-1530973428-5bf2db2e4d71?w=1200&q=80',
  'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=1200&q=80',
  'https://res.cloudinary.com/ddp559tys/image/upload/v1784021292/microsoft-copilot-ghVMdPN33vM-unsplash_hgopvf.jpg',
  'https://res.cloudinary.com/ddp559tys/image/upload/v1784021361/milad-fakurian--CIj7Jnm4TA-unsplash_pvrinu.jpg'
]

# Out of Scope

Do **not**:

- modify the existing public `/api/posts/create`
- refactor the existing controller
- implement LangGraph
- implement AWS Lambda
- implement scheduling

These will be completed in future phases.

---

# Expected Outcome

After this PR:

- Internal API exists.
- API key authentication exists.
- Business logic begins moving into a service layer.
- No existing frontend functionality changes.