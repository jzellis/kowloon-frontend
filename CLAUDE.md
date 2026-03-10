# Kowloon Frontend — Claude Instructions

## Stack
- React 19 + Vite 7 + ESM
- React Router v7 (`createBrowserRouter`)
- Redux Toolkit for state management
- Tailwind CSS v4 + DaisyUI v5 (CSS-only config, no `tailwind.config.js`)
- TipTap for rich text editing (WYSIWYG → Markdown via `tiptap-markdown`)
- `@kowloon/client` from `../kowloon-client` (local install)

## Design — Read This First

This UI is inspired by **1950s midcentury print design and Blue Note Records album covers**. It should feel like a beautiful magazine, not an app. Every component should reflect this:
- Strong typographic hierarchy, generous whitespace
- No excessive rounding, shadows, or "app" chrome
- Bold display type (Bebas Neue), clean UI type (IBM Plex Sans), beautiful reading type (Source Serif 4)
- Color palette: warm cream base, medium navy header, dark plum accent — see `src/index.css`

Use `font-display`, `font-ui`, `font-reading` Tailwind utilities for typography.
DaisyUI theme is `kowloon` — always use theme tokens (`bg-primary`, `text-base-content`, etc.), never hardcode colors.

## Key Conventions

- **No rounded corners** — `rounded-*` classes are off-brand, avoid them
- **Nav active state**: keep text cream, use plum bottom border only (dark plum on navy bg is unreadable)
- **All API calls** go through `useClient()` hook → `client.feeds`, `client.activities`, etc.
- **All writes** go via `client.activities` (POST to `/outbox`) — never direct HTTP
- **Public assets** (`/logo.png`, `/favicon.svg`, etc.) live in `public/` and are referenced as `/filename`
- **Components** go in `src/components/` organized by type: `layout/`, `ui/`, `posts/`, `circles/`, `groups/`, `notifications/`
- **Pages** go in `src/pages/` — one file per route

## Routing Structure

1. Standalone (no layout): `/login`, `/register`
2. PublicLayout (all users): `/`, `/posts/*`, `/users/*`, `/groups/*`, `/circles/*`, `/pages/*`, `/search`
3. Layout/protected (auth required): `/posts/new`, `/posts/:id/edit`, `/groups/new`, `/groups/:id/edit`, `/circles/new`, `/circles/:id/edit`, `/notifications`, `/profile`

## Layout Grid

Both layouts use a 12-column grid: Sidebar (3) | Main content (6) | RightSidebar (3). Full width, stacks on mobile.

## Feeds / Content Model

- There is no generic feed — feeds are always from a Circle, filterable by post type (`?type=`)
- Home (`/`) shows server landing for anon users; default Circle feed for auth'd users
- User's "Following" circle is the default feed; any Circle can be set as default
- Post types: Note, Article, Media, Event, Link

## Related Projects

- Server: `/home/jzellis/Projects/kowloon` (backend, `kwln.org:3000`)
- Client lib: `/home/jzellis/Projects/kowloon-client`
- Joplin notes API: `http://localhost:41184` — token in `../kowloon/.env` as `JOPLIN_TOKEN`
- Screens/Pages Joplin note ID: `b453497de1ff4d56af451de3d2c02252`
