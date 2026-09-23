# Admin Dashboard & Employee Management Portal

A modern, production-style admin dashboard built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, and **SWR**. It provides comprehensive employee directory management: real-time analytics, filtering, sorting, pagination, multi-step employee creation with location tracking, single and bulk deletion, role-based access control (RBAC), and responsive UI layouts.

The codebase is written to be clean, modular, and beginner-accessible, with detailed architectural comments across components and hooks.

---

## 1. Quick Start

### Prerequisites
- **Node.js**: 18.18+ or 20+
- **npm**: 9+

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (defaults work out of the box for local development)
cp .env.example .env.local

# 3. Start development servers
npm run dev
```

`npm run dev` uses `concurrently` to start **two servers simultaneously**:
- **Mock REST API** (`http://localhost:4000`): Served by [json-server](https://github.com/typicode/json-server) backed by [`db.json`](./db.json) containing fake employee records, activity timelines, and hiring trend history.
- **Next.js Web Application** (`http://localhost:3000`): The Next.js 14 frontend application.

Open [`http://localhost:3000`](http://localhost:3000) in your browser. Sign in using any mock email and select your desired role (**Admin**, **Editor**, or **Viewer**).

### Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Runs both mock API (`:4000`) and Next.js dev server (`:3000`) |
| `npm run dev:web` | Runs only the Next.js development server |
| `npm run dev:api` | Runs only the `json-server` mock REST API |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm test` | Runs Jest test suite |

---

## 2. Authentication & Demo Login Details

The portal features a built-in Role-Based Access Control (RBAC) system with mock authentication for demonstration and testing purposes.

### Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** *(Default)* | `admin@example.com` | *(Any password / None required)* | **Full Access**: View dashboard, Add employees, Edit profiles, Delete single employee, Bulk delete |
| **Editor** | `editor@example.com` | *(Any password / None required)* | **Edit Access**: View dashboard, Add employees, Edit profiles (cannot delete) |
| **Viewer** | `viewer@example.com` | *(Any password / None required)* | **Read-Only**: View dashboard & employee directory |

### How Login Works
- **Automatic Default Session**: For reviewer convenience, visiting the application (locally or on deployed URLs) automatically initializes an **Admin** session so all capabilities ("Add employee", inline editing, and deletion) are immediately available without gating.
- **Switching Roles**: To test permissions for different roles (e.g. Editor or Viewer), click **Log out** in the top navigation bar or go directly to [`/login`](http://localhost:3000/login). Select your desired role and click **Sign in**.
- **Edge Middleware Protection**: Requests without a session cookie are redirected to `/login` by [`middleware.ts`](./middleware.ts).

---

## 3. Key Features

- **Executive Analytics Dashboard**:
  - Top-level KPIs: Total headcount, active headcount, on-leave count, and average company salary.
  - Interactive 30-day hiring trend chart and department distribution breakdown using Recharts.
  - Date-range filtering (7 days, 30 days, 90 days, or all time).
- **Employee Directory**:
  - Server-paginated table with configurable page size.
  - Real-time debounced search by name or email.
  - Multi-attribute filtering (Department, Status).
  - Column-based sorting (Name, Department, Salary, Joined Date).
  - Multi-row selection with bulk actions (bulk deletion).
  - Single employee deletion with modal confirmation.
- **Location Modes**:
  - Employee locations are standardized across three primary workplace modes:
    - **In Office**
    - **Hybrid**
    - **Work From Home**
  - Fully integrated into types, creation forms, detail editing, and database schemas.
- **Multi-Step Employee Onboarding Form**:
  - Step 1: **Basic Info** (Full name, valid email address).
  - Step 2: **Role & Work Details** (Department, Role, Location mode, Salary).
  - Step 3: **Review & Confirmation** before submitting.
  - Step-by-step client validation preventing invalid progression.
  - Draft autosaving via `localStorage` to recover in-progress drafts after reloads.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full permissions (View, Add, Edit, Delete, Bulk Delete).
  - **Editor**: View, Add, and Edit employee records.
  - **Viewer**: Read-only access to dashboard and directory.
- **Employee Profile & Activity View**:
  - Dedicated dynamic route (`/employees/[id]`) with inline field editing.
  - Historical timeline of status changes, notes, and profile activities.

---

## 4. Project Structure

```
admin-dashboard/
├── db.json                     # Mock database used by json-server (port 4000) & serverless fallback
├── middleware.ts               # Server-side auth route guard (cookie check)
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── api/                # Built-in internal API routes (employees, activities, trend)
│   │   ├── dashboard/          # Analytics dashboard (Server Component + interactive charts)
│   │   ├── employees/          # Employee directory & bulk actions
│   │   │   ├── [id]/           # Employee detail, inline editing & activity log
│   │   │   └── new/            # Employee onboarding wizard page
│   │   ├── login/              # Mock authentication login page
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   └── page.tsx            # Root redirector to /dashboard or /login
│   ├── components/
│   │   ├── dashboard/          # KPI cards, charts, and metrics views
│   │   ├── employees/          # MultiStepForm, EmployeeTable, EmployeeFilters, ConfirmModal
│   │   ├── layout/             # Sidebar, Topbar, and navigation components
│   │   └── ui/                 # Reusable UI primitives (Button, Modal, Input, Select, Badge, Skeleton)
│   ├── hooks/
│   │   └── useEmployees.ts     # SWR hooks (useEmployees, useEmployee, useEmployeeMutations)
│   ├── lib/
│   │   ├── api.ts              # Centralized API client with fetchWithRetry & direct DB fallback
│   │   ├── types.ts            # Shared domain models, constants (LOCATIONS, DEPARTMENTS, ROLES)
│   │   └── useAuth.tsx         # Authentication context and permission checking (can())
│   └── __tests__/              # Unit and integration test suite
```

---

## 5. Architecture & Rendering Strategy

The project adheres to modern Next.js 14 best practices by balancing Server Components and Client Components:

- **Server Components by Default**:
  - `src/app/dashboard/page.tsx` fetches data directly on the server for instant first-paint performance without unnecessary client bundle overhead.
- **Client Components for Interactivity**:
  - `src/app/employees/page.tsx` and `src/components/employees/MultiStepForm.tsx` use `"use client"` because they manage interactive state (selection sets, draft forms, inline editing, URL synchronizations).
- **URL-Synchronized State**:
  - Search queries, filters, sorting column/direction, and page numbers reside in URL query parameters (`/employees?search=smith&department=Engineering&page=2`), allowing filtered views to be shared and bookmarked easily.

---

## 6. Data Mutations & API Resilience

### Caching and Optimistic Updates
- **SWR Integration**: Server data is fetched and cached using SWR. Cached responses are displayed instantly with background revalidations.
- **Single & Bulk Deletions (`useEmployeeMutations`)**:
  - **Optimistic Eviction**: When single or multiple employees are deleted, `removeMany` optimistically purges the deleted IDs from the client SWR cache immediately, preventing screen flicker.
  - **Sequential API Execution**: Deletion requests are processed sequentially (`for (const id of ids) { await api.deleteEmployee(id); }`) to ensure file-based mock databases (like `json-server`) do not encounter concurrent write locks or file-watcher reload cycles.
  - **Single Revalidation**: SWR revalidation is executed once in a `finally` block after all deletions conclude.

### Network Resilience (`fetchWithRetry`) & Direct DB Fallback
- The centralized API client in [`src/lib/api.ts`](./src/lib/api.ts) wraps network requests with `fetchWithRetry`.
- **Automatic Serverless Fallback**: If an external mock server (`:4000`) is offline or unreachable (e.g. during cloud serverless execution on Vercel), the client gracefully falls back to built-in Next.js internal API routes (`/api/*`) backed directly by [`db.json`](./db.json). This ensures zero runtime downtime whether running locally or in the cloud.

---

## 7. Security & Authorization

- **Middleware Route Protection**: [`middleware.ts`](./middleware.ts) runs on Edge/server before request execution, redirecting unauthenticated users to `/login`.
- **Role Permission Utility**: `useAuth().can(action)` checks user permissions (`edit`, `delete`, `bulk`) to conditionally render sensitive actions.
- **Sanitized Configurations**: Secrets and server paths are managed through `.env.local` (which is excluded from version control).

---

## 8. Testing

Unit tests are written with **Jest** and **React Testing Library**:

```bash
npm test
```

All 3 test suites pass cleanly:
- `Button.test.tsx` (button click, loading state, disabled behavior)
- `Pagination.test.tsx` (page counts, boundaries, navigation)
- `MultiStepForm.test.tsx` (multi-step progression, form validations, conditional leave end date)

---

## 9. Production Deployment

To deploy this application to production on platforms such as [Vercel](https://vercel.com):

1. Push your repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. (Optional) Provide environment variables in the project settings:
   - `AUTH_SECRET`: A secure string for session signing (e.g. `admindasboard3625876`).
4. Click **Deploy**.

> **Note on Backend in Production**: When deployed to Vercel, the application automatically uses its built-in Next.js internal API routes (`/api/employees`, `/api/activities`, `/api/trend`) with direct database fallback. You do **not** need to deploy or run a separate `json-server` instance!
