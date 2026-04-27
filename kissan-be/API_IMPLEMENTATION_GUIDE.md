# Kissan Backend API Implementation Guide

## Overview

- **Project Name**: Kissan (Farmers Market Backend API)
- **Tech Stack**: Express.js, Prisma (MySQL), JWT Authentication
- **Port**: 3000 (default)
- **API Docs**: Available at `/api-docs` (Swagger UI)

---

## Base Paths

| Prefix            | Description    |
| ----------------- | -------------- |
| `/api/auth`       | Authentication |
| `/api/products`   | Products       |
| `/api/categories` | Categories     |
| `/api/cart`       | Shopping Cart  |
| `/api/quotations` | Quotations     |
| `/api/orders`     | Orders         |
| `/api/stats`      | Statistics     |

---

## Authentication & Authorization

- **JWT Token**: Bearer token in Authorization header
- **Token Expiry**: 7 days
- **Roles**: `farmer`, `buyer`
- **Middleware**: `authMiddleware` (validates JWT), `requireRole(...roles)` (checks role)

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

# API Endpoints

## 1. Auth Routes (`/api/auth`)

### POST /register

Register a new user (farmer or buyer).

**Auth**: No

**Request**:

```json
{
  "name": "string (min 2)",
  "email": "string (email)",
  "password": "string (min 6)",
  "role": "farmer" | "buyer",
  "phone": "string (optional)",
  "address": "string (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "phone": "string | null",
    "address": "string | null",
    "createdAt": "Date"
  },
  "message": "Registration successful"
}
```

---

### POST /login

Login and get JWT token.

**Auth**: No

**Request**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "token": "JWT token (expires 7d)",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  },
  "message": "Login successful"
}
```

---

### GET /me

Get current user profile.

**Auth**: Yes

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "phone": "string | null",
    "address": "string | null",
    "createdAt": "Date"
  }
}
```

---

## 2. Product Routes (`/api/products`)

### GET /

Get all products with pagination and filters.

**Auth**: No

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| categoryId | number | - | Filter by category |
| farmerId | number | - | Filter by farmer |
| search | string | - | Search by title |
| isActive | boolean | - | Filter by active status |

**Response**:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "totalPages": "number"
    }
  }
}
```

---

### GET /my-products

Get farmer's own products.

**Auth**: Yes
**Role**: farmer

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response**:

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": { ... }
  }
}
```

---

### GET /:id

Get product by ID.

**Auth**: No

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "title": "string",
    "description": "string | null",
    "nutritionalInfo": "string | null",
    "unit": "kg | pcs",
    "price": "number",
    "quantityAvailable": "number",
    "isActive": "boolean",
    "isDeleted": "boolean",
    "farmerId": "number",
    "images": [...],
    "categories": [...],
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

---

### POST /

Create new product.

**Auth**: Yes
**Role**: farmer

**Request** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| title | string | Product title |
| description | string (optional) | Product description |
| nutritionalInfo | string (optional) | Nutritional information |
| unit | string | `kg` or `pcs` |
| price | number | Price per unit |
| quantityAvailable | number | Available quantity |
| categoryIds | string | JSON array of category IDs |
| images | files | Product images (max 5) |

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Product created"
}
```

---

### PUT /:id

Update product.

**Auth**: Yes
**Role**: farmer

**Request**:

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "nutritionalInfo": "string (optional)",
  "unit": "kg | pcs (optional)",
  "price": "number (optional)",
  "quantityAvailable": "number (optional)",
  "categoryIds": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Product updated"
}
```

---

### DELETE /:id

Soft delete product.

**Auth**: Yes
**Role**: farmer

**Response**:

```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

### POST /:id/images

Upload product images.

**Auth**: Yes
**Role**: farmer

**Request** (multipart/form-data):
| Field | Type | Description |
|-------|------|-------------|
| images | files | Product images (max 5) |

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Images uploaded"
}
```

---

## 3. Category Routes (`/api/categories`)

### GET /

Get all categories with product count.

**Auth**: No

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "name": "string",
      "products": "number (count)"
    }
  ]
}
```

---

### POST /

Create new category.

**Auth**: Yes
**Role**: farmer

**Request**:

```json
{
  "name": "string (required, max 100)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "string"
  },
  "message": "Category created"
}
```

---

## 4. Cart Routes (`/api/cart`)

### GET /

Get user's cart with items.

**Auth**: Yes
**Role**: buyer

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "userId": "number",
    "farmerId": "number",
    "items": [...],
    "totalAmount": "number"
  }
}
```

---

### POST /

Add item to cart.

**Auth**: Yes
**Role**: buyer

**Request**:

```json
{
  "productId": "number",
  "quantity": "number"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "cart": { ... },
    "totalAmount": "number"
  },
  "message": "Added to cart"
}
```

---

### PATCH /:itemId

Update cart item quantity.

**Auth**: Yes
**Role**: buyer

**Request**:

```json
{
  "quantity": "number"
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Cart updated"
}
```

---

### DELETE /:itemId

Remove item from cart.

**Auth**: Yes
**Role**: buyer

**Response**:

```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### DELETE /

Clear entire cart.

**Auth**: Yes
**Role**: buyer

**Response**:

```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## 5. Order Routes (`/api/orders`)

### GET /

Get orders. Buyer gets own orders, farmer gets own orders.

**Auth**: Yes

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | - | Filter by status (`pending`, `confirmed`, `shipped`, `delivered`) |

**Response**:

```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": { ... }
  }
}
```

---

### GET /:id

Get order by ID.

**Auth**: Yes

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "totalAmount": "number",
    "status": "pending | confirmed | shipped | delivered",
    "source": "cart | quotation",
    "paymentStatus": "string",
    "shippingAddress": "string | null",
    "userId": "number",
    "farmerId": "number",
    "items": [...],
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

---

### POST /from-cart

Create order from cart.

**Auth**: Yes
**Role**: buyer

**Request**:

```json
{
  "shippingAddress": "string (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "totalAmount": "number",
    "status": "pending",
    "source": "cart",
    "paymentStatus": "string",
    "shippingAddress": "string | null",
    "userId": "number",
    "farmerId": "number",
    "items": [...],
    "createdAt": "Date"
  },
  "message": "Order created from cart"
}
```

---

### PATCH /:id

Update order status.

**Auth**: Yes
**Role**: farmer

**Request**:

```json
{
  "status": "pending | confirmed | shipped | delivered"
}
```

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Order status updated"
}
```

---

## 6. Quotation Routes (`/api/quotations`)

### GET /

Get quotations.

**Auth**: Yes

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | - | Filter by status (`pending`, `accepted`, `rejected`) |

**Response**:

```json
{
  "success": true,
  "data": {
    "quotations": [...],
    "pagination": { ... }
  }
}
```

---

### GET /:id

Get quotation by ID.

**Auth**: Yes

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "status": "pending | accepted | rejected",
    "userId": "number",
    "farmerId": "number",
    "items": [...],
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

---

### POST /

Create quotation request.

**Auth**: Yes
**Role**: buyer

**Request**:

```json
{
  "farmerId": "number",
  "items": [
    {
      "productId": "number",
      "quantity": "number",
      "offeredPrice": "number"
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "number",
    "status": "pending",
    "userId": "number",
    "farmerId": "number",
    "items": [...],
    "createdAt": "Date"
  },
  "message": "Quotation created"
}
```

---

### PATCH /:id

Update quotation status.

**Auth**: Yes
**Role**: farmer

**Request**:

```json
{
  "status": "pending | accepted | rejected"
}
```

**Note**: When farmer accepts quotation, it automatically creates an order.

**Response**:

```json
{
  "success": true,
  "data": { ... },
  "message": "Quotation status updated"
}
```

---

## 7. Stats Routes (`/api/stats`)

### GET /

Get user statistics.

**Auth**: Yes

**Response (Farmer)**:

```json
{
  "success": true,
  "data": {
    "products": "number (total products)",
    "quotations": "number (pending quotations)",
    "orders": "number (active orders)"
  }
}
```

**Response (Buyer)**:

```json
{
  "success": true,
  "data": {
    "orders": "number (total orders)",
    "quotations": "number (pending quotations)",
    "cart": "number (cart items)"
  }
}
```

---

# Database Models

## User

| Field     | Type            | Description         |
| --------- | --------------- | ------------------- |
| id        | Int (PK)        | Auto-increment      |
| name      | String          | User name           |
| email     | String (unique) | Email address       |
| password  | String          | Hashed password     |
| role      | Enum            | `farmer` or `buyer` |
| phone     | String?         | Phone number        |
| address   | String?         | Address             |
| createdAt | DateTime        | Creation timestamp  |
| updatedAt | DateTime        | Update timestamp    |

## Product

| Field             | Type     | Description             |
| ----------------- | -------- | ----------------------- |
| id                | Int (PK) | Auto-increment          |
| title             | String   | Product title           |
| description       | String?  | Product description     |
| nutritionalInfo   | String?  | Nutritional information |
| unit              | Enum     | `kg` or `pcs`           |
| price             | Float    | Price per unit          |
| quantityAvailable | Int      | Available quantity      |
| isActive          | Boolean  | Active status           |
| isDeleted         | Boolean  | Soft delete flag        |
| farmerId          | Int (FK) | Reference to User       |
| createdAt         | DateTime | Creation timestamp      |
| updatedAt         | DateTime | Update timestamp        |

## ProductImage

| Field     | Type     | Description          |
| --------- | -------- | -------------------- |
| id        | Int (PK) | Auto-increment       |
| url       | String   | Image URL            |
| productId | Int (FK) | Reference to Product |

## Category

| Field | Type            | Description    |
| ----- | --------------- | -------------- |
| id    | Int (PK)        | Auto-increment |
| name  | String (unique) | Category name  |

## ProductCategory

| Field      | Type     | Description           |
| ---------- | -------- | --------------------- |
| productId  | Int (FK) | Reference to Product  |
| categoryId | Int (FK) | Reference to Category |

## Cart

| Field     | Type     | Description                |
| --------- | -------- | -------------------------- |
| id        | Int (PK) | Auto-increment             |
| userId    | Int (FK) | Reference to User (buyer)  |
| farmerId  | Int (FK) | Reference to User (farmer) |
| createdAt | DateTime | Creation timestamp         |
| updatedAt | DateTime | Update timestamp           |

## CartItem

| Field     | Type     | Description          |
| --------- | -------- | -------------------- |
| id        | Int (PK) | Auto-increment       |
| quantity  | Int      | Item quantity        |
| cartId    | Int (FK) | Reference to Cart    |
| productId | Int (FK) | Reference to Product |

## Quotation

| Field     | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| id        | Int (PK) | Auto-increment                    |
| status    | Enum     | `pending`, `accepted`, `rejected` |
| userId    | Int (FK) | Reference to User (buyer)         |
| farmerId  | Int (FK) | Reference to User (farmer)        |
| createdAt | DateTime | Creation timestamp                |
| updatedAt | DateTime | Update timestamp                  |

## QuotationItem

| Field        | Type     | Description            |
| ------------ | -------- | ---------------------- |
| id           | Int (PK) | Auto-increment         |
| quantity     | Int      | Item quantity          |
| offeredPrice | Float    | Offered price          |
| quotationId  | Int (FK) | Reference to Quotation |
| productId    | Int (FK) | Reference to Product   |

## Order

| Field           | Type     | Description                                    |
| --------------- | -------- | ---------------------------------------------- |
| id              | Int (PK) | Auto-increment                                 |
| totalAmount     | Float    | Total order amount                             |
| status          | Enum     | `pending`, `confirmed`, `shipped`, `delivered` |
| source          | Enum     | `cart` or `quotation`                          |
| paymentStatus   | String   | Payment status                                 |
| shippingAddress | String?  | Shipping address                               |
| userId          | Int (FK) | Reference to User (buyer)                      |
| farmerId        | Int (FK) | Reference to User (farmer)                     |
| createdAt       | DateTime | Creation timestamp                             |
| updatedAt       | DateTime | Update timestamp                               |

## OrderItem

| Field     | Type     | Description          |
| --------- | -------- | -------------------- |
| id        | Int (PK) | Auto-increment       |
| quantity  | Int      | Item quantity        |
| price     | Float    | Item price           |
| orderId   | Int (FK) | Reference to Order   |
| productId | Int (FK) | Reference to Product |

---

# File Structure

```
src/
├── app.ts                     # Express app setup & route mounting
├── index.ts                   # Server entry point
├── config/
│   └── swagger.ts            # Swagger configuration
├── modules/
│   ├── auth/                 # Auth module
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.validation.ts
│   │   └── index.ts
│   ├── product/              # Product module
│   │   ├── product.routes.ts
│   │   ├── product.controller.ts
│   │   ├── product.validation.ts
│   │   └── index.ts
│   ├── category/             # Category module
│   ├── cart/                # Cart module
│   ├── order/                # Order module
│   ├── quotation/            # Quotation module
│   └── stats/               # Stats module
├── middlewares/
│   ├── auth.ts               # JWT authentication
│   ├── upload.ts             # File upload (Multer)
│   └── validate.ts           # Request validation
├── types/
│   └── express.ts           # Custom type definitions
└── utils/
    └── prisma.ts            # Prisma client
```
