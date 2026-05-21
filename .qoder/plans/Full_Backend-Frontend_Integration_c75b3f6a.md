# Full Backend-Frontend Integration Plan

## Current State Summary

**Backend:** 69 routes across 10 groups, all functional.
**Frontend:** Partial coverage — many API functions missing, 3 seller pages missing, several buttons disconnected, inconsistent response parsing.

**Already Working (no changes needed):**
- Auth (login/register/me)
- Profile (get/update/avatar/public)
- Home, Services, ServiceDetails, Products, ProductDetails, Cart pages
- Seller: Dashboard, Services list, AddService, EditService, AddProduct
- Buyer: Dashboard, ServiceOrders list
- Admin: Dashboard, Users, ServiceReview, ProductReview, AllServiceOrders, AllProductOrders

---

## Task 1: Create API Response Helper

**File:** `frontend/src/utils/apiResponse.js` (NEW)

Create `extractArray(result, fallbackKeys)` and `extractPagination(result, items)` helpers for consistent paginated response parsing across all pages.

---

## Task 2: Complete serviceOrdersApi.js

**File:** `frontend/src/api/serviceOrdersApi.js`

Currently only has `createServiceOrder`. Add:
- `getMyServiceOrders(params)` → GET `/api/service-orders/my-orders`
- `getServiceOrderById(id)` → GET `/api/service-orders/{id}`
- `updateServiceOrderStatus(id, status)` → PATCH `/api/service-orders/{id}/status`
- `getOrderMessages(orderId)` → GET `/api/service-orders/{orderId}/messages`
- `sendOrderMessage(orderId, message)` → POST `/api/service-orders/{orderId}/messages`
- `uploadOrderFile(orderId, file)` → POST `/api/service-orders/{orderId}/files`
- `getOrderFiles(orderId)` → GET `/api/service-orders/{orderId}/files`
- `downloadOrderFile(orderId, fileId)` → GET `/api/service-orders/{orderId}/files/{fileId}/download`

---

## Task 3: Complete productOrdersApi.js

**File:** `frontend/src/api/productOrdersApi.js`

Currently only has `createCheckoutSession`. Add:
- `createProductOrder(data)` → POST `/api/product-orders`
- `getMyProductOrders(params)` → GET `/api/product-orders/my-orders`
- `getProductOrderById(id)` → GET `/api/product-orders/{id}`
- `updateProductOrderPaymentStatus(id, status)` → PATCH `/api/product-orders/{id}/payment-status`
- `getPurchasedProductFiles(orderId)` → GET `/api/product-orders/{orderId}/files`
- `downloadPurchasedProductFile(orderId, fileId)` → GET `/api/product-orders/{orderId}/files/{fileId}/download` (responseType: blob)

Also move `createProductOrder` and `downloadProductFile` out of `productsApi.js` if duplicated there (but keep backward compat imports).

---

## Task 4: Complete categoriesApi.js

**File:** `frontend/src/api/categoriesApi.js`

Currently only has `getServiceCategories()` and `getProductCategories()`. Add admin CRUD:
- `createServiceCategory(data)` → POST `/api/categories`
- `updateServiceCategory(id, data)` → PUT `/api/categories/{id}`
- `deleteServiceCategory(id)` → DELETE `/api/categories/{id}`
- `createProductCategory(data)` → POST `/api/product-categories`
- `updateProductCategory(id, data)` → PUT `/api/product-categories/{id}`
- `deleteProductCategory(id)` → DELETE `/api/product-categories/{id}`

---

## Task 5: Add missing product file functions to productsApi.js

**File:** `frontend/src/api/productsApi.js`

Add if missing:
- `getProductFiles(productId)` → GET `/api/products/{productId}/files`
- `deleteProductFile(productId, fileId)` → DELETE `/api/products/{productId}/files/{fileId}`
- `updateProduct(id, data)` → PUT `/api/products/{id}` (verify exists)
- `deleteProduct(id)` → DELETE `/api/products/{id}` (verify exists)

---

## Task 6: Create SellerServiceOrders.jsx

**File:** `frontend/src/pages/seller/SellerServiceOrders.jsx` (NEW)

- Fetch from `getSellerServiceOrders(params)` (already in dashboardApi)
- Table: Order ID, Service, Buyer, Status, Price, Messages, Files, Deadline, Created
- Status filter, pagination
- Match existing seller dashboard design

---

## Task 7: Create SellerProductOrders.jsx

**File:** `frontend/src/pages/seller/SellerProductOrders.jsx` (NEW)

- Fetch from `getSellerProductOrders(params)` (already in dashboardApi)
- Table: Order ID, Product, Buyer, Payment Status, Order Status, Price, Created
- Status filters, pagination
- Match existing seller dashboard design

---

## Task 8: Create EditProduct.jsx

**File:** `frontend/src/pages/seller/EditProduct.jsx` (NEW)

- Mirror EditService.jsx pattern
- Fetch product via `getProductById(id)`
- Load product categories via `getProductCategories()`
- Update via `updateProduct(id, data)` from productsApi
- Handle file management (list files, upload new, delete existing)
- Pre-populate form with existing data

---

## Task 9: Fix SellerProducts.jsx Edit/Delete Buttons

**File:** `frontend/src/pages/seller/SellerProducts.jsx`

- Connect Edit button → navigate to `/seller/products/{id}/edit`
- Connect Delete button → confirm dialog + call `deleteProduct(id)` + refresh list
- Mirror the working pattern from SellerServices.jsx

---

## Task 10: Fix BuyerProductOrders.jsx Download

**File:** `frontend/src/pages/buyer/BuyerProductOrders.jsx`

Current bug: `downloadProductFile(orderId, 'master')` uses hardcoded fileId.

Fix: 
1. First fetch file list: `getPurchasedProductFiles(orderId)` 
2. Then download each/first file: `downloadPurchasedProductFile(orderId, fileId)`
3. Or show file list with individual download buttons

---

## Task 11: Add Missing Routes to App.jsx

**File:** `frontend/src/App.jsx`

Add routes:
- `/seller/service-orders` → SellerServiceOrders
- `/seller/product-orders` → SellerProductOrders
- `/seller/products/:id/edit` → EditProduct

Ensure sidebar links match actual routes.

---

## Task 12: Wire BuyerServiceOrders Messaging (if time permits)

**File:** `frontend/src/pages/buyer/BuyerServiceOrders.jsx`

The page has a MessageSquare button that's UI-only. Backend supports:
- GET/POST messages on service orders
- File upload/download on service orders

Wire the message button to open a modal/panel showing messages and allowing replies. This is a larger feature but the backend is ready.

---

## Task 13: Add i18n Keys for New Pages

**File:** `frontend/src/i18n/translations.js`

Add English + Arabic keys for:
- Seller Service Orders page
- Seller Product Orders page
- Edit Product page
- Download/file management labels
- Messaging labels

---

## Execution Order

1. **Tasks 1-5** (API layer) — can run in parallel, no page dependencies
2. **Tasks 6-8** (new pages) — depend on Tasks 2-5 for API functions
3. **Tasks 9-11** (fixes + routing) — can run alongside Tasks 6-8
4. **Task 12** (messaging) — depends on Task 2
5. **Task 13** (i18n) — can be bundled with page creation tasks

## Estimated Scope
- ~4 new files to create
- ~8 files to modify
- 0 backend changes (except the MySQL search fix already done)
