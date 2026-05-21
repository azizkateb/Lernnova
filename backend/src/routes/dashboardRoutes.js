const express = require("express");
const router = express.Router();

const {
  getSellerOverview,
  getAdminOverview,
  getSellerServices,
  getSellerProducts,
  getSellerServiceOrders,
  getSellerProductOrders,
  getAdminUsers,
  getAdminServices,
  getAdminProducts,
  getAdminServiceOrders,
  getAdminProductOrders,
  getBuyerOverview,
  getBuyerServiceOrders,
  getBuyerProductOrders,
  updateAdminUserStatus,
} = require("../controllers/dashboardController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get(
  "/seller/overview",
  protect,
  allowRoles("seller", "admin"),
  getSellerOverview
);

router.get(
  "/admin/overview",
  protect,
  allowRoles("admin"),
  getAdminOverview
);

router.get(
  "/admin/users",
  protect,
  allowRoles("admin"),
  getAdminUsers
);

router.patch(
  "/admin/users/:id/status",
  protect,
  allowRoles("admin"),
  updateAdminUserStatus
);

router.get(
  "/admin/services",
  protect,
  allowRoles("admin"),
  getAdminServices
);

router.get(
  "/admin/products",
  protect,
  allowRoles("admin"),
  getAdminProducts
);

router.get(
  "/admin/service-orders",
  protect,
  allowRoles("admin"),
  getAdminServiceOrders
);

router.get(
  "/admin/product-orders",
  protect,
  allowRoles("admin"),
  getAdminProductOrders
);

router.get(
  "/seller/services",
  protect,
  allowRoles("seller", "admin"),
  getSellerServices
);

router.get(
  "/seller/products",
  protect,
  allowRoles("seller", "admin"),
  getSellerProducts
);

router.get(
  "/seller/service-orders",
  protect,
  allowRoles("seller", "admin"),
  getSellerServiceOrders
);

router.get(
  "/seller/product-orders",
  protect,
  allowRoles("seller", "admin"),
  getSellerProductOrders
);

router.get("/buyer/overview", protect, getBuyerOverview);

router.get("/buyer/service-orders", protect, getBuyerServiceOrders);

router.get("/buyer/product-orders", protect, getBuyerProductOrders);

module.exports = router;
