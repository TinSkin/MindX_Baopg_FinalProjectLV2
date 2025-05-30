import { useRef, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner"; // import Toaster của sonner

import { CircleX, MessageSquare, CircleArrowDown  } from 'lucide-react';

// Import Components
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Promotion from "./pages/Checkout";
import Checkout from "./pages/Checkout";

// Lấy Components và dữ liệu AI
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";

// Import Error Page
import NotFound from "./pages/notfound/NotFound";
import Unauthorized from "./pages/unauthorized/Unauthorized";

// Import Admin Components
import AdminProduct from "./pages/admin/AdminProduct";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccount from "./pages/admin/AdminAccount";

// Import component dùng để bảo vệ route
import PrivateRoute from "./routes/PrivateRoute";

import "./App.css";

// Main Component
function App() {
  // Chat box
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  const generateBotResponse = async (history) => {
    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text != "Thinking..."),
        { role: "model", text, isError },
      ]);
    };
    // Format chat history for API request
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };
    try {
      // Make the API call to get the bot's response
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error.message || "Something went wrong!");
      // Clean and update chat history with bot's response
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiResponseText);
    } catch (error) {
      // Update chat history with the error message
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    // Auto-scroll whenever chat history updates
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    // Bọc toàn bộ app trong Router để kích hoạt hệ thống định tuyến
    <Router>
      {/* Toaster nên được đặt ở đây để nó bao phủ toàn bộ app */}
      <Toaster richColors position="top-right" />
      <div className={`container z-10 sticky ${showChatbot ? "show-chatbot" : ""}`}>
        <button
          onClick={() => setShowChatbot((prev) => !prev)}
          id="chatbot-toggler"
        >
          <span className="material-symbols-outlined"><MessageSquare /></span>
          <span className="material-symbols-outlined"><CircleX /></span>
        </button>
        <div className="chatbot-popup">
          {/* Chatbot Header */}
          <div className="chat-header">
            <div className="header-info">
              <ChatbotIcon />
              <h2 className="logo-text">Trợ Lý Hệ Thống</h2>
            </div>
            <button
              className="material-symbols-outlined"
              onClick={() => setShowChatbot((prev) => !prev)}
            >
              <CircleArrowDown className="w-full"/>
            </button>
          </div>
          {/* Chatbot Body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <ChatbotIcon />
              <p className="message-text">
                Chào Bạn <br /> Tôi có thể giúp gì cho bạn ?
              </p>
            </div>
            {/* Render the chat history dynamically */}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>
          {/* Chatbot Footer */}
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
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
          <Route path="/cart" element={<Cart />} />{" "}
          {/* Trang user sau khi đăng nhập */}
          {/* <Route path="/cart" element={<Cart />} /> Trang giỏ hàng */}
          {/* <Route path="/product/:id" element={<ProductDetail />} />{" "} */}
          {/* Trang chi tiết sản phẩm với ID động */}
          <Route path="/checkout" element={<Checkout />} />{" "}
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
          <Route path="/admin/accounts" element={<AdminAccount />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
