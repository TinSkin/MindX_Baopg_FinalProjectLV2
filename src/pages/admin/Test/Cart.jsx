import { useEffect, useState } from "react"; // Import hook useEffect và useState để quản lý trạng thái và side-effect
import { useNavigate } from "react-router-dom"; // Import hook useNavigate để điều hướng
import Header from "../components/Header"; // Import component Header


const Cart = () => {
  // Định nghĩa component Cart
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
  const [cartItems, setCartItems] = useState([]); // Trạng thái lưu danh sách sản phẩm trong giỏ hàng
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading


  // Hàm tải giỏ hàng từ localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart"); // Lấy giỏ hàng từ localStorage
    if (savedCart) {
      setCartItems(JSON.parse(savedCart)); // Parse và cập nhật trạng thái nếu có
    }
  }, []); // Chạy một lần khi component mount


  // Hàm cập nhật số lượng sản phẩm
  const updateQuantity = (id, quantity) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ); // Cập nhật số lượng, đảm bảo không dưới 1
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Lưu vào localStorage
  };


  // Hàm xóa sản phẩm khỏi giỏ hàng
  const removeItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id); // Lọc ra sản phẩm không có ID cần xóa
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart)); // Cập nhật localStorage
  };


  // Tính tổng tiền
  const getTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toLocaleString(); // Tính tổng và định dạng số
  };


  if (!cartItems.length && !isLoading) {
    // Hiển thị thông báo nếu giỏ hàng trống
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Giỏ hàng của bạn
            </h3>
            <p className="text-center text-gray-600">Giỏ hàng trống.</p>
            <button
              onClick={() => navigate("/hello")} // Chuyển hướng về trang Hello
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 mx-auto block"
            >
              Quay lại mua sắm
            </button>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Giỏ hàng của bạn
          </h3>
          {isLoading ? (
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-lg font-semibold text-gray-700">
                        Sản phẩm
                      </th>
                      <th className="p-3 text-left text-lg font-semibold text-gray-700">
                        Giá
                      </th>
                      <th className="p-3 text-left text-lg font-semibold text-gray-700">
                        Số lượng
                      </th>
                      <th className="p-3 text-left text-lg font-semibold text-gray-700">
                        Thành tiền
                      </th>
                      <th className="p-3 text-left text-lg font-semibold text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={
                              item.images[0] ||
                              "https://placehold.co/50x50?text=Default+Image"
                            }
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) =>
                              (e.target.src =
                                "https://placehold.co/50x50?text=Image+Not+Found")
                            }
                          />
                          <span className="font-bold text-lg">{item.name}</span>
                        </td>
                        <td className="p-3 text-lg text-gray-900">
                          {item.price.toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            min="1"
                            className="w-16 p-1 border rounded text-center"
                          />
                        </td>
                        <td className="p-3 text-lg text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} ₫
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-right">
                <p className="text-xl font-bold">Tổng tiền: {getTotal()} ₫</p>
                <button
                  onClick={() => navigate("/checkout")}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Thanh toán
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default Cart; // Xuất component Cart
