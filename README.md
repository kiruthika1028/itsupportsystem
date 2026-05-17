# IT Support Portal

Enterprise-grade internal IT support ticketing system built with **Next.js 14 (App Router)**, **MongoDB Atlas**, **Tailwind CSS**, **ShadCN UI**, and **JWT authentication**.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### All users
- Per-tab JWT sessions (`sessionStorage` + Bearer tokens; tabs do not share login state)
- Role-based access (Admin, Support Engineer, Employee)
- Dashboard with ticket statistics and activity feed
- Create, view, edit tickets with priorities and categories
- Comments, file attachments, search and filters
- Dark mode, responsive sidebar layout
- Real-time SSE connection for live updates
- Toast notifications

### Admin & Support
- Manage all tickets, assign engineers, update status
- Internal notes and internal comments
- User management (CRUD, role changes)
- Analytics dashboard with charts
- PDF export of tickets
- Email notifications (optional SMTP)
- Activity audit logs

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS, ShadCN UI, Axios, React Hook Form, Recharts |
| Backend | Next.js API Routes, Mongoose, JWT (jose), bcryptjs |
| Database | MongoDB Atlas |
| Deploy | Vercel |

## Project structure

```
/app                 # App Router pages & API routes
/components          # UI and layout components
/models              # Mongoose schemas
/lib                 # Auth, DB, validators, utilities
/hooks               # Custom React hooks
/context             # Auth context
/types               # TypeScript types
/public/uploads      # Uploaded attachments
/scripts             # Seed & utility scripts
```

## Getting started

### 1. Prerequisites

- Node.js 18+
- MongoDB Atlas cluster ([create free cluster](https://www.mongodb.com/cloud/atlas))

### 2. Clone and install

```bash
cd CURSORPROJECT
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/it-support?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=IT Support <noreply@company.com>
```

**MongoDB Atlas setup:**
1. Create a cluster and database user
2. Network Access → Add IP `0.0.0.0/0` (or your IP for production)
3. Copy connection string into `MONGODB_URI`

### 4. Seed demo users

```bash
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@12345 |
| Support | support@company.com | Support@12345 |
| Employee | employee@company.com | Employee@12345 |

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register employee |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | List tickets (paginated, filters) |
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets/:id` | Ticket details |
| PUT | `/api/tickets/:id` | Update ticket |
| DELETE | `/api/tickets/:id` | Delete ticket (admin) |
| POST | `/api/tickets/:id/comments` | Add comment |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (staff) |
| POST | `/api/users` | Create user (admin) |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (admin) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Analytics data |
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/activities` | Activity logs |
| POST | `/api/upload` | File upload |
| GET | `/api/export/pdf` | Export PDF report |
| GET | `/api/tickets/stream` | SSE real-time stream |

## Roles & permissions

| Feature | Employee | Support | Admin |
|---------|----------|---------|-------|
| Create tickets | ✅ | ✅ | ✅ |
| View own tickets | ✅ | — | — |
| View all tickets | — | ✅ | ✅ |
| Assign tickets | — | ✅ | ✅ |
| Internal notes | — | ✅ | ✅ |
| Analytics | — | ✅ | ✅ |
| User management | — | — | ✅ |
| Delete tickets | — | — | ✅ |

## Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - SMTP vars (optional)
4. Deploy

**Note:** File uploads on Vercel are ephemeral. For production, use [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or AWS S3.

```bash
npm run build
```

## Authentication (per-tab sessions)

Each browser tab keeps its **own** login via `sessionStorage`:

| Storage | Scope | Used for |
|---------|--------|----------|
| `sessionStorage` | Single tab | JWT + user snapshot |
| `Authorization: Bearer` header | Per request | API authentication |

**Why:** HTTP-only cookies are shared across all tabs on the same origin. Logging in on tab B overwrote the cookie tab A used, so both tabs showed the same role.

**How it works now:**
1. Login/register returns a JWT; the client stores it in **this tab's** `sessionStorage`.
2. Axios attaches `Authorization: Bearer <token>` on every API call.
3. `RouteGuard` protects dashboard routes using tab-local auth state.
4. SSE/PDF use the tab token (query param or authenticated fetch).

You can run Employee in one tab and Support in another without cross-over.

## Security

- Password hashing with bcrypt (12 rounds)
- JWT per tab (not shared cookies)
- Zod input validation on all API routes
- Rate limiting on auth endpoints
- Mongoose parameterized queries (NoSQL injection prevention)
- Middleware route protection
- Role-based API authorization

## Ticket statuses & priorities

**Status:** Open → In Progress → Resolved → Closed

**Priority:** Low, Medium, High, Critical

**Categories:** Hardware, Software, Network, Security, Account Access, Database, Cloud, Other

## License

MIT — Internal enterprise use.
