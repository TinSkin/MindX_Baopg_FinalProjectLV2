import React, { useState } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import Components
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Promotion from "./pages/Promotion";
import Unauthorized from "./pages/unauthorized/Unauthorized";
import AdminProduct from "./pages/admin/AdminProduct";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/notfound/NotFound";

// Import component dùng để bảo vệ route
import PrivateRoute from "./routes/PrivateRoute";

// For testing purposes

import "./App.css";

// Main Component
function App() {
  return (
    // Bọc toàn bộ app trong Router để kích hoạt hệ thống định tuyến
    <Router>
      <Routes>
        {/* 🌐 Các route công khai (không yêu cầu đăng nhập) */}
        {/* Trang chủ mặc định là Home */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/promotion" element={<Promotion />} />
        {/* <Route path="/menu" element={<Menu />} /> */}
        <Route path="/unauthorized" element={<Unauthorized />} />{" "}
        <Route path="/404" element={<NotFound />} />{" "}
        <Route element={<PrivateRoute />}>
          <Route path="/menu" element={<Menu />} />{" "}
          {/* Trang user sau khi đăng nhập */}
          {/* <Route path="/cart" element={<Cart />} /> Trang giỏ hàng */}
          {/* <Route path="/product/:id" element={<ProductDetail />} />{" "} */}
          {/* Trang chi tiết sản phẩm với ID động */}
          {/* <Route path="/checkout" element={<Checkout />} />{" "} */}
          {/* Trang thanh toán */}
        </Route>
        {/* 🔐 Các route chỉ dành cho admin */}
        <Route element={<PrivateRoute requiredRole="admin" />}>
          {/* Khi truy cập /admin → điều hướng tới /admin/products */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/products" replace />}
          />
          {/* Trang quản lý sản phẩm dành riêng cho admin */}
          <Route path="/admin/products" element={<AdminProduct />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
