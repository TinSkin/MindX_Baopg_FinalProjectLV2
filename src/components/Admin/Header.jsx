import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// Import img
import logo from "../../img/logo.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  const [user, setUser] = useState(null);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <header className="bg-green_starbuck shadow-md py-4 px-6 sticky top-0 z-50 border-b-8 border-camel">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <div
          to={"/"}
          className="font-bold text-camel text-lg focus:outline-none"
        >
          <img src={logo} alt="Logo" className="w-full h-[130px]" />
        </div>
        <div className="flex w-[70%] items-center justify-around">
          <ul className="flex gap-6 text-white font-semibold uppercase">
            {/* <Link
              to={"/"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-4 hover:border-camel ${
                location.pathname === "/"
                  ? "border-b-4 border-camel"
                  : "hover:text-camel"
              }`}
            >
              Trang chủ
            </Link> */}
            <Link
              to={"/admin/products"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-4 hover:border-camel ${
                location.pathname === "/admin/products"
                  ? "border-b-4 border-camel"
                  : "hover:text-camel"
              }`}
            >
              Sản phẩm
            </Link>
            <Link
              to={"/admin/accounts"}
              className={`cursor-pointer hover:text-camel border-solid hover:border-b-4 hover:border-camel ${
                location.pathname === "/admin/accounts"
                  ? "border-b-4 border-camel"
                  : "hover:text-camel"
              }`}
            >
              Tài khoản
            </Link>
          </ul>

          {user ? (
            <div className="relative">
              {/* Avatar button */}
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="user-menu-button"
                aria-expanded="false"
                onClick={() => {
                  const dropdown = document.getElementById("user-dropdown");
                  dropdown.classList.toggle("hidden");
                }}
              >
                <img
                  className="w-12 h-12 rounded-full"
                  src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
                  alt="user"
                />
              </button>

              {/* Dropdown menu */}
              <div
                id="user-dropdown"
                className="hidden absolute right-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow z-50"
              >
                <div className="px-4 py-3 text-md text-dark_blue ">
                  <div className="font-semibold">{user.fullName}</div>
                  <div className="font-medium truncate text-camel">
                    {user.email}
                  </div>
                </div>
                {/* <ul className="py-2 text-sm text-dark_blue">
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-camel hover:text-white font-semibold"
                    >
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/admin/products"
                      className="block px-4 py-2 hover:bg-camel hover:text-white font-semibold"
                    >
                      Ad
                    </Link>
                  </li>
                  <li>
                    <Link to
                      href="#"
                      className="block px-4 py-2 hover:bg-camel hover:text-white font-semibold"
                    >
                      Earnings
                    </Link>
                  </li>
                </ul> */}
                <div className="py-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full bg-camel text-white px-4 py-2 rounded hover:bg-logo_color transition font-semibold"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="bg-camel text-white px-4 py-2 rounded hover:bg-logo_color transition font-semibold"
              onClick={handleLoginClick}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
