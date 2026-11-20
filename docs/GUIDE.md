# Demo Shop — Guide

This guide explains how the Demo Shop backend is built, how a request
flows through it, how to add a new feature the same way, how to switch
from in-memory demo data to MySQL, and how to test it by hand.

Demo project, not a real client order. Demo data only.

## 1. Architecture principles

The backend follows two simple ideas:

**Feature-based.** Code is grouped by what it does for the user, not by
technical type. Everything about products lives in
`backend/src/features/products/`; everything about orders lives in
`backend/src/features/orders/`, and so on for auth, users and stats.
To change how orders work, you open one folder.

**Layered.** Inside each feature, every file has one layer and one job:

| Layer | File suffix | Owns | Must never contain |
| ----- | ----------- | ---- | ------------------ |
| Route | `.routes.js` | Mapping HTTP method + path to a controller | Business logic, SQL |
| Controller | `.controller.js` | HTTP only: read params/body, call the service, send JSON | Business logic, SQL |
| Service | `.service.js` | Business rules: validation, 404s, allowed values | SQL, Express `req`/`res` |
| Repository | `.repository.js` | Data access: MySQL when available, in-memory demo data otherwise | Express `req`/`res`, validation |

Shared code lives outside the features:

- `src/server.js` — entry point only. Load config, init the database,
  create the app, listen. 21 lines, no routes, no logic.
- `src/app.js` — creates the Express app, adds `cors()` and
  `express.json()`, mounts the feature routers under `/api`, applies the
  `authenticate` middleware to the protected features, then the 404 and
  error handlers. No business logic.
- `src/config/env.js` — the only file that reads `process.env`. Every
  other file imports `env` from here, so defaults live in one place.
- `src/config/database.js` — creates the MySQL pool and answers one
  question: `isMySqlEnabled()`. It also logs the startup message
  (`No MySQL config found — using in-memory demo data.` when there is no
  DB config, `MySQL connected — demo data loaded from database.` when
  MySQL works, or a "not reachable" message with the same fallback).
  No SQL lives here.
- `src/middleware/auth.js` — verifies the JWT Bearer token, puts the
  user on `req.user`, rejects missing/invalid tokens with 401.
- `src/middleware/errorHandler.js` — the only place that sends error
  responses. `ApiError` keeps its status and message; anything else
  becomes a 500 so internals never leak.
- `src/middleware/validate.js` — tiny helpers: `requireFields(body, fields)`
  and `parseId(param)`.
- `src/common/errors.js` — the `ApiError` class (`new ApiError(404, '...')`).
- `src/common/http.js` — `asyncHandler(fn)`, so controllers need no
  try/catch: a thrown error goes to the central error handler.
- `src/data/demoData.js` — the in-memory demo data (users with a bcrypt
  hash of `Demo1234`, 8 products, 10 orders). Used only by repositories
  when MySQL is unavailable. No other layer touches it directly.

```
Request
  -> Route       (which controller?)
  -> Controller  (what did the client send? what do I return?)
  -> Service     (is this allowed? does it exist? is it valid?)
  -> Repository  (read/write the data)
  -> MySQL / in-memory demo data
```

Errors flow the other way: a service throws `ApiError(404, 'Product not
found')`, `asyncHandler` passes it to `next()`, and the central error
handler sends `{ "error": "Product not found" }` with status 404.

## 2. Each feature, explained

### auth — `POST /api/auth/login`

- `auth.routes.js` — `POST /login` only, public (no auth middleware).
- `auth.controller.js` — reads `email` and `password` from the body.
- `auth.service.js` — lowercases/trims the email, finds the user,
  compares the password with bcrypt, signs a JWT (8 hours), returns
  `{ token, user }`. Wrong email or password is always 401
  `Invalid email or password` — it never says which part was wrong.
- `auth.repository.js` — `findUserByEmail(email)`: a MySQL `SELECT`
  when MySQL is enabled, otherwise a search of the demo users. This is
  the only place that sees `password_hash`.

### products — `/api/products`

- Routes: `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`.
- Service rules: create requires `name` and `price` (400 otherwise);
  price must be a number; update is partial (only the fields sent are
  changed); unknown id is 404 `Product not found`; delete returns
  `{ ok: true }`.
- Repository: MySQL CRUD with parameterised queries, otherwise
  array operations on the demo products. The `id` for a new in-memory
  product is max existing id + 1.

### orders — `/api/orders`

- Routes: `GET /`, `GET /:id`, `PUT /:id` (status change only).
- Service rules: status must be one of `pending`, `paid`, `shipped`,
  `done` (400 otherwise); unknown id is 404 `Order not found`. Sending
  no status returns the order unchanged.
- Repository: orders with their `items` (from `order_items` in MySQL,
  from the embedded items in demo data).

### users — `/api/users`

- Routes: `GET /`, `GET /:id`.
- Repository never returns `password_hash`: the MySQL queries select
  only `id, name, email, role`, and the in-memory path maps users to
  the same public shape. Unknown id is 404 `User not found`.

### stats — `/api/stats/overview`

- Route: `GET /overview`.
- Repository: counts products and users, counts all orders, and sums
  sales for paid / shipped / done orders only — pending orders are not
  sales. `salesByDay` groups those completed sales by date.
- Service: rounds money to 2 decimals. Response shape:
  `{ totalSales, totalOrders, totalProducts, totalUsers, salesByDay }`,
  where each `salesByDay` entry is `{ date, sales }`.

## 3. Request flow — two examples

### Login, then list products

```
1. POST /api/auth/login  { email: "admin@demo.shop", password: "Demo1234" }
   auth.routes -> auth.controller -> auth.service.login()
     -> auth.repository.findUserByEmail()   [MySQL or demo data]
     -> bcrypt.compare(password, user.password_hash)
     -> jwt.sign({ id, email, role, name }, JWT_SECRET, 8h)
   <- { token, user: { id: 1, name: "Admin User", email: "admin@demo.shop", role: "admin" } }

2. GET /api/products  Authorization: Bearer <token>
   app.js -> authenticate() verifies the token, sets req.user
   products.routes -> products.controller.list()
     -> products.service.listProducts()
       -> products.repository.findAll()     [MySQL or demo data]
   <- [ { id: 1, name: "Wireless Headphones", price: 79.99, ... }, ... ]
```

### A failed request

```
GET /api/products   (no token)
  -> authenticate() throws ApiError(401, "Missing token")
  -> errorHandler sends  401  { "error": "Missing token" }

PUT /api/products/999  { "price": 10 }
  -> products.service.updateProduct() -> repository.findById(999) -> null
  -> throws ApiError(404, "Product not found")
  -> errorHandler sends  404  { "error": "Product not found" }
```

## 4. How to add a NEW feature (example: categories)

Follow the same four files, in this order:

1. **Repository** — `src/features/categories/categories.repository.js`.
   Write `findAll()`, `findById(id)`, `create(input)`, `update(id, changes)`,
   `remove(id)` — MySQL branch first, in-memory branch on `demoData`
   second. No `req`/`res`, no validation. If the data is new, add it to
   `src/data/demoData.js` and to `db/schema.sql`.
2. **Service** — `src/features/categories/categories.service.js`.
   Write the rules: what is required, what is a 400, what is a 404.
   Import the repository, throw `ApiError`, return plain data.
3. **Controller** — `src/features/categories/categories.controller.js`.
   One function per route, wrapped in `asyncHandler`. Read
   `parseId(req.params.id)` and `req.body`, call the service, send the
   result (`201` on create).
4. **Route** — `src/features/categories/categories.routes.js`.
   Create the router, map the methods, export it.
5. **Mount it** — in `src/app.js`:
   `app.use('/api/categories', authenticate, categoriesRoutes);`
6. **Test it** — with curl (see section 6), then add the page to the
   React frontend (`frontend/src/api.js` + a page in `frontend/src/pages/`).

Do not put the new feature's logic in `server.js`, `app.js`, or a
controller — if you catch yourself writing SQL in a controller or a
business rule in a route, move it one layer down.

## 5. Switching from in-memory data to MySQL

1. Create the database and seed it:
   ```bash
   mysql -u root -p < db/schema.sql
   ```
2. Copy the example env file and fill in your database password:
   ```bash
   cd backend
   cp .env.example .env
   ```
   ```text
   PORT=5000
   JWT_SECRET=change-me-in-production
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=demoshop
   ```
3. Start the backend (`npm run dev`). You should see:
   `MySQL connected — demo data loaded from database.`
   If MySQL is down or the config is wrong you will see a "not reachable"
   message instead, and the backend keeps working on in-memory demo data.
4. Changes made through the API are now saved in MySQL and survive a
   restart. To go back to demo data, remove the `DB_*` lines from
   `backend/.env` (or delete the file) and restart.

Notes:

- The demo password `Demo1234` is public demo data, not a real secret.
  It is stored as a bcrypt hash in `db/schema.sql` and in
  `src/data/demoData.js` (hashed at startup). Change `JWT_SECRET` before
  using this code for anything real — never ship the placeholder.
- The MySQL path has not been tested against a live MySQL server in
  this environment (no MySQL server was available here). Run the
  checklist in section 6 with a `backend/.env` before claiming MySQL
  works. The in-memory path is fully tested.

## 6. Testing checklist (manual, with curl)

Start the backend with no `.env` (in-memory demo data), then run:

```bash
# 1. Health — expect 200 { ok: true, demo: true }
curl http://localhost:5000/api/health

# 2. Login, wrong password — expect 401 { error: "Invalid email or password" }
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@demo.shop","password":"wrong"}'

# 3. Login, correct — expect 200 with a token; save it
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@demo.shop","password":"Demo1234"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

# 4. Products without a token — expect 401 { error: "Missing token" }
curl http://localhost:5000/api/products

# 5. Products with a token — expect 200, 8 products
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products

# 6. One product — expect 200; id 999 — expect 404
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products/1

# 7. Create a product — expect 201 with the new product (id 9)
curl -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Test Product","price":9.99,"stock":5,"category":"Test"}' \
  http://localhost:5000/api/products

# 8. Create with no name — expect 400 { error: "name and price are required" }
curl -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"price":9.99}' http://localhost:5000/api/products

# 9. Update the product — expect 200 with the new price
curl -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"price":12.99}' http://localhost:5000/api/products/9

# 10. Delete the product — expect 200 { ok: true }; again — expect 404
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products/9

# 11. Orders — expect 200, 10 orders; one order — expect 200
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/orders

# 12. Change an order status — expect 200 with status "shipped"
curl -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"shipped"}' http://localhost:5000/api/orders/1

# 13. Bad status — expect 400
curl -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"flying"}' http://localhost:5000/api/orders/1

# 14. Users — expect 200, 4 users, no password_hash anywhere in the output
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users

# 15. Stats — expect 200; totalSales counts paid/shipped/done only
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/stats/overview
```

Then repeat steps 3, 5, 11, 14 and 15 with a `backend/.env` pointing at
a real MySQL database seeded with `db/schema.sql`, and check the same
numbers come back.

## 7. Common errors

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| `401 Missing token` | No `Authorization: Bearer <token>` header | Log in first, copy the token |
| `401 Invalid or expired token` | Wrong/expired token, or a different `JWT_SECRET` than the one used to sign it | Log in again; use one `.env` |
| `Cannot find module ...` | Dependencies not installed, or wrong folder | `cd backend && npm install` |
| `EADDRINUSE` on port 5000 | An old backend is still running | Stop it, or change `PORT` in `.env` |
| `No MySQL config found — using in-memory demo data.` | No `DB_HOST`/`DB_NAME` in `backend/.env` | This is normal without MySQL; add `DB_*` to use MySQL |
| Frontend shows `Loading…` forever | Backend not running, or the Vite proxy cannot reach `:5000` | Start the backend, check `http://localhost:5000/api/health` |
| `npm run build` fails in frontend | Dependencies not installed | `cd frontend && npm install && npm run build` |
