# Demo Shop — Admin Dashboard (Full-Stack Demo)

**Demo project, not a real client order.** Demo data only — no real customers,
no fake clients, no testimonials, no invented company history. Brand is
"Demo Shop" only.

A small shop admin dashboard: a shop owner can log in, see sales at a glance,
manage products, view orders and change their status, and manage users —
without code.

## What is included

- **Frontend:** React + Vite, React Router, plain CSS, Recharts.
  Pages: Login, Overview, Products, Orders, Users, Settings.
  Clean, mobile-friendly admin layout with a sidebar.
- **Backend:** Node.js + Express, JWT auth, bcryptjs, MySQL (`mysql2`).
  Layered, feature-based architecture — see below.
- **Database:** MySQL schema in `db/schema.sql` (users, products, orders,
  order_items) with demo seed data. The backend also works **without**
  MySQL: it falls back to the same in-memory demo data.
- **Demo data:** 8 products, 10 orders (pending / paid / shipped / done),
  4 users.

## Architecture

The backend is organised **by feature, then by layer**. Each feature
(auth, products, orders, users, stats) has the same four files, and each
layer has exactly one job:

```
Request
  -> Route       (maps HTTP method + path to a controller)
  -> Controller  (HTTP only: reads params/body, calls the service, sends JSON)
  -> Service     (business rules: validation, 404s, allowed statuses)
  -> Repository  (data access only: MySQL when available, in-memory demo data otherwise)
  -> MySQL / in-memory demo data
```

Rules the code follows:

- Routes contain no business logic and no SQL.
- Controllers contain no SQL and no business rules.
- Services contain no SQL and no Express `req` / `res`.
- Repositories contain no Express `req` / `res` — they only read and write data.
- `src/server.js` is the entry point only (21 lines): load config, init the
  database, create the app, listen. No routes, no logic.
- Errors are thrown as `ApiError(status, message)` in services and turned
  into JSON by one central error handler (`src/middleware/errorHandler.js`).

### Folder tree

```text
demoshop/
├── README.md
├── docs/
│   └── GUIDE.md            # Longer guide: how the layers work, how to add a feature
├── .env.example
├── .gitignore
├── db/
│   └── schema.sql          # MySQL schema + demo seed data
├── backend/
│   ├── package.json        # start: node src/server.js, dev: node --watch src/server.js
│   ├── .env.example
│   └── src/
│       ├── server.js       # Entry point only (bootstrap)
│       ├── app.js          # Express app: middleware, mounts routers under /api
│       ├── config/
│       │   ├── env.js      # Env parsing (PORT, JWT_SECRET, DB_*), safe demo defaults
│       │   └── database.js # MySQL pool + isMySqlEnabled(); no SQL here
│       ├── middleware/
│       │   ├── auth.js         # JWT verify, req.user, 401 on missing/invalid token
│       │   ├── errorHandler.js # Central error handler + 404
│       │   └── validate.js     # Small helpers (requireFields, parseId)
│       ├── common/
│       │   ├── errors.js   # ApiError class
│       │   └── http.js     # asyncHandler wrapper (no try/catch in controllers)
│       ├── data/
│       │   └── demoData.js # In-memory demo data (used only when MySQL is unavailable)
│       └── features/
│           ├── auth/       # auth.routes / controller / service / repository
│           ├── products/   # products.routes / controller / service / repository
│           ├── orders/     # orders.routes / controller / service / repository
│           ├── users/      # users.routes / controller / service / repository
│           └── stats/      # stats.routes / controller / service / repository
└── frontend/
    ├── package.json
    ├── vite.config.js      # Dev proxy /api -> localhost:5000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── components/
        │   └── Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Overview.jsx
            ├── Products.jsx
            ├── Orders.jsx
            ├── Users.jsx
            └── Settings.jsx
```

## API

Base URL: `http://localhost:5000`. All routes except login and health
require a JWT: `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| GET | `/api/health` | No | `{ ok: true, demo: true }` |
| POST | `/api/auth/login` | No | Login with email + password, returns `{ token, user }` |
| GET | `/api/products` | Yes | List all products |
| POST | `/api/products` | Yes | Create a product (201). Requires `name` and `price` |
| GET | `/api/products/:id` | Yes | One product, or 404 |
| PUT | `/api/products/:id` | Yes | Update a product (partial), or 404 |
| DELETE | `/api/products/:id` | Yes | Delete a product, returns `{ ok: true }`, or 404 |
| GET | `/api/orders` | Yes | List all orders, with items |
| GET | `/api/orders/:id` | Yes | One order, or 404 |
| PUT | `/api/orders/:id` | Yes | Change order status (`pending` / `paid` / `shipped` / `done`) |
| GET | `/api/users` | Yes | List all users (never includes password hashes) |
| GET | `/api/users/:id` | Yes | One user, or 404 |
| GET | `/api/stats/overview` | Yes | `{ totalSales, totalOrders, totalProducts, totalUsers, salesByDay }` |

Errors are always JSON: `{ "error": "..." }`, with status 400 (validation),
401 (missing/invalid token, or wrong login), 404 (not found), 500 (server error).

Notes:

- `totalSales` and `salesByDay` count only paid / shipped / done orders.
  Pending orders are not counted as sales. `totalOrders` counts all orders.
- In-memory mode: changes (add/edit/delete a product, change an order
  status) are kept in memory only and are lost when the backend restarts.
  With MySQL, changes are saved in the database.

## How to run

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optional — only needed for MySQL / a custom secret
npm run dev            # or: npm start
```

Backend runs on http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173 (API requests are proxied to the backend).

Build the frontend:

```bash
cd frontend
npm run build
```

## Demo login

- Email: `admin@demo.shop`
- Password: `Demo1234`
- Role: admin

Other demo users (same demo password `Demo1234`):
`maria@demo.shop` (manager), `omar@demo.shop` (staff), `lina@demo.shop` (customer).

## MySQL setup (optional)

The backend works without MySQL. To use MySQL instead:

```bash
mysql -u root -p < db/schema.sql
```

Then set `DB_*` in `backend/.env` (see `backend/.env.example`):

```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=demoshop
```

On startup the backend logs either `MySQL connected — demo data loaded from database.`
or `No MySQL config found — using in-memory demo data.` (or a "not reachable"
message, with the same in-memory fallback).

## What is NOT included

- No real payments (no Stripe / PayPal in this demo).
- No real customer data.
- No deployment setup beyond the local dev commands above.
- No tests yet — see `docs/GUIDE.md` for the manual testing checklist.
