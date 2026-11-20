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
  - `POST /api/auth/login` — public, returns a JWT
  - `GET / POST / PUT / DELETE /api/products` — protected
  - `GET / PUT /api/orders` — protected
  - `GET /api/users` — protected
  - `GET /api/stats/overview` — protected, totals + sales by day
  - All routes except login are protected by JWT.
- **Database:** MySQL schema in `db/schema.sql` (users, products, orders,
  order_items) with demo seed data.
- **Demo data:** 8 products, 10 orders (pending / paid / shipped / done),
  4 users.

## What is NOT included

- No real payments (no Stripe / PayPal in this demo).
- No real customer data.
- No deployment setup beyond the local dev commands below.
- Changes made in the demo (add/edit/delete a product, change an order
  status) are stored in memory only when MySQL is not used, and are lost
  when the backend restarts.

## MySQL — optional

The backend **also works without MySQL**. If there is no `.env` file, or
MySQL cannot be reached, it logs a message and falls back to the same
in-memory demo data, so the demo runs out of the box.

To use MySQL instead:

```bash
mysql -u root -p < db/schema.sql
```

Then set `DB_*` in `backend/.env` (see `backend/.env.example`).

## How to run

### Backend

```bash
cd backend
npm install
cp .env.example .env   # optional — only needed for MySQL / a custom secret
npm run dev
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

## Project structure

```text
demoshop/
├── README.md
├── .env.example
├── .gitignore
├── db/
│   └── schema.sql
├── backend/
│   ├── package.json
│   ├── server.js        # Express app + all API routes
│   ├── data.js          # In-memory demo data (fallback)
│   ├── db.js            # Optional MySQL load
│   └── .env.example
└── frontend/
    ├── package.json
    ├── vite.config.js   # Dev proxy /api -> localhost:5000
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
