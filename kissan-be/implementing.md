# 🧾 1. Updated Tech Stack

- **Node.js + Express + TypeScript**
- **MySQL (InnoDB)**
- ORM: **Prisma** (recommended) or Sequelize
- JWT Auth
- Multer (file upload)
- Swagger (OpenAPI)

👉 I’ll use **Prisma-style schema** (clean + scalable)

---

# 🗄️ 2. Database Schema (MySQL)

## 👤 Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  role ENUM('farmer', 'buyer') NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌾 Products Table

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT,
  title VARCHAR(255),
  description TEXT,
  nutritional_info TEXT,
  unit ENUM('kg', 'pcs'),
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (farmer_id) REFERENCES users(id)
);
```

---

## 🖼️ Product Images

```sql
CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  url TEXT,

  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 🏷️ Categories

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);
```

---

## 🔗 Product Categories (Many-to-Many)

```sql
CREATE TABLE product_categories (
  product_id INT,
  category_id INT,
  PRIMARY KEY (product_id, category_id),

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

---

## 🛒 Cart

```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  farmer_id INT,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (farmer_id) REFERENCES users(id)
);
```

---

## 🧺 Cart Items

```sql
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT,

  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 📩 Quotations

```sql
CREATE TABLE quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  farmer_id INT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Quotation Items

```sql
CREATE TABLE quotation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT,
  product_id INT,
  quantity INT,
  offered_price DECIMAL(10,2),

  FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);
```

---

## 📦 Orders

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  farmer_id INT,
  total_amount DECIMAL(10,2),
  status ENUM('pending','confirmed','shipped','delivered') DEFAULT 'pending',
  source ENUM('cart','quotation'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Order Items

```sql
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),

  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

# ⚙️ 3. Prisma Schema (Recommended)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      Role
  products  Product[]
}

enum Role {
  farmer
  buyer
}
```

👉 (I can generate full Prisma schema if you want)

---

# 🔐 4. Auth Implementation (JWT)

### Flow

1. Register → hash password (bcrypt)
2. Login → verify → return JWT
3. Middleware:

```ts
req.user = decodedToken;
```

---

# 📁 5. File Upload (Multer)

```ts
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});
```

👉 Store URL in `product_images`

---

# 🧠 6. Important Business Logic

## 🛒 Cart Rule (CRITICAL)

```ts
if (cart.farmerId !== product.farmerId) {
  throw Error("Cart can only contain one farmer's products");
}
```

---

## 📩 Quotation → Order Conversion

```ts
if (status === "accepted") {
  createOrderFromQuotation();
}
```

---

# 📡 7. API Design (Mobile Friendly)

### Standard Response

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

---

# 📘 8. Swagger (Updated for MySQL APIs)

### Example: Create Quotation

```ts
/**
 * @swagger
 * /quotations:
 *   post:
 *     summary: Create quotation
 *     tags: [Quotation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmerId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     offeredPrice:
 *                       type: number
 *     responses:
 *       200:
 *         description: Quotation created
 */
```

---

# 🚀 9. Performance Considerations

- Add indexes:

```sql
CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_orders_user ON orders(user_id);
```

- Use pagination (LIMIT, OFFSET)

---

# 🔒 10. Security

- bcrypt password hashing
- JWT expiration (7d or 1d)
- Rate limiting
- Input validation (Zod recommended)

---

# 🧱 11. Folder Structure

```bash
src/
 ├── modules/
 │    ├── auth/
 │    ├── product/
 │    ├── cart/
 │    ├── quotation/
 │    ├── order/
 ├── prisma/
 ├── middlewares/
 ├── utils/
 └── app.ts
```

---

# ⚡ 12. What You’re Missing (Important Additions)

You didn’t mention these but you SHOULD include:

- ✅ Stock management (`quantity_available`)
- ✅ Soft delete for products
- ✅ Order address snapshot
- ✅ Payment status (even if COD)
- ✅ Farmer profile page

---
