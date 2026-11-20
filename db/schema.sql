-- Demo Shop — MySQL schema + demo seed data
-- Demo project, not a real client order. Demo data only.
-- Usage:
--   mysql -u root -p < db/schema.sql
--   (or: CREATE DATABASE demoshop; then run this file)
-- The backend also works WITHOUT MySQL: if it cannot connect, it falls
-- back to the same in-memory demo data (backend/src/data/demoData.js).

CREATE DATABASE IF NOT EXISTS demoshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE demoshop;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL DEFAULT 'customer',
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category VARCHAR(80) NOT NULL DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(100) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Demo users. The password_hash below is bcrypt for the demo password
-- "Demo1234" (same for all demo users). Demo login: admin@demo.shop / Demo1234
INSERT INTO users (id, name, email, role, password_hash) VALUES
(1, 'Admin User', 'admin@demo.shop', 'admin', '$2a$10$KfhwmuAUyBVU5vQgcHsPXORWEl7pzTylEJKSms6F5enFVonZFt/KW'),
(2, 'Maria Manager', 'maria@demo.shop', 'manager', '$2a$10$KfhwmuAUyBVU5vQgcHsPXORWEl7pzTylEJKSms6F5enFVonZFt/KW'),
(3, 'Omar Staff', 'omar@demo.shop', 'staff', '$2a$10$KfhwmuAUyBVU5vQgcHsPXORWEl7pzTylEJKSms6F5enFVonZFt/KW'),
(4, 'Lina Customer', 'lina@demo.shop', 'customer', '$2a$10$KfhwmuAUyBVU5vQgcHsPXORWEl7pzTylEJKSms6F5enFVonZFt/KW')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

INSERT INTO products (id, name, price, stock, category) VALUES
(1, 'Wireless Headphones', 79.99, 42, 'Electronics'),
(2, 'Smart Watch', 129.99, 25, 'Electronics'),
(3, 'Laptop Stand', 34.99, 60, 'Accessories'),
(4, 'USB-C Hub', 49.99, 80, 'Accessories'),
(5, 'Mechanical Keyboard', 89.99, 30, 'Electronics'),
(6, 'Wireless Mouse', 29.99, 95, 'Accessories'),
(7, 'Travel Backpack', 59.99, 18, 'Accessories'),
(8, 'Desk Lamp', 24.99, 55, 'Home Office')
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), stock = VALUES(stock), category = VALUES(category);

INSERT INTO orders (id, customer, total, status, date) VALUES
(1, 'Lina Customer', 109.98, 'paid', '2026-11-14'),
(2, 'Lina Customer', 129.99, 'shipped', '2026-11-13'),
(3, 'Omar Staff', 84.98, 'done', '2026-11-12'),
(4, 'Maria Manager', 179.98, 'done', '2026-11-11'),
(5, 'Lina Customer', 59.99, 'pending', '2026-11-15'),
(6, 'Omar Staff', 49.99, 'paid', '2026-11-15'),
(7, 'Maria Manager', 154.97, 'shipped', '2026-11-10'),
(8, 'Lina Customer', 24.99, 'done', '2026-11-09'),
(9, 'Omar Staff', 219.97, 'pending', '2026-11-16'),
(10, 'Maria Manager', 89.98, 'paid', '2026-11-16')
ON DUPLICATE KEY UPDATE customer = VALUES(customer), total = VALUES(total), status = VALUES(status), date = VALUES(date);

INSERT INTO order_items (order_id, product_id, qty, price) VALUES
(1, 1, 1, 79.99), (1, 6, 1, 29.99),
(2, 2, 1, 129.99),
(3, 3, 1, 34.99), (3, 4, 1, 49.99),
(4, 5, 2, 89.99),
(5, 7, 1, 59.99),
(6, 4, 1, 49.99),
(7, 1, 1, 79.99), (7, 3, 1, 34.99), (7, 8, 1, 24.99),
(8, 8, 1, 24.99),
(9, 2, 1, 129.99), (9, 5, 1, 89.99),
(10, 6, 3, 29.99);
