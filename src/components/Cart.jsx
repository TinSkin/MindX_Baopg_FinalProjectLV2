import React from "react";

import { useNavigate, Link } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg w-72 text-center shadow-lg">
      <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md mb-4 shadow-sm">
        <h2 className="text-white text-lg font-semibold">Giỏ Hàng Của Tôi</h2>
      </div>
      <div className="w-[80%] mx-auto pb-4">
        <p className="text-gray-500 text-sm mb-4">Chưa có sản phẩm nào!</p>
        <Link to='/cart' className="bg-dark_blue hover:bg-camel text-white w-full px-4 py-2 rounded text-sm font-semibold">
          Thanh toán
        </Link>
      </div>
    </div>
  );
}

export default Cart;
