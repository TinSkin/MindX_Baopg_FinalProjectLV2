// Import hook useNavigate từ react-router-dom để điều hướng trang
import { useNavigate } from "react-router-dom";

// Import hook useEffect và useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState } from "react";

// Import các icon Pencil, Eye, Trash2 từ thư viện lucide-react để dùng trong giao diện
import { Pencil, Trash2 } from "lucide-react";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import hàm fetchProducts từ productAPI để lấy danh sách sản phẩm từ server
import { fetchAccounts } from "../../api/accountAPI";

// Import Schema
import { addAccountSchema } from "../../utils/addAccountSchema";
import { editAccountSchema } from "../../utils/editAccountSchema";

// Import component 
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";

const AdminAccount = () => {
  // Khởi tạo hook useNavigate để điều hướng trang
  const navigate = useNavigate();

  // Loading
  const [isLoading, setIsLoading] = useState(false); // Trạng thái isLoading: Kiểm soát trạng thái loading khi thực hiện các thao tác (thêm, sửa, xóa)

  // Accounts
  const [accounts, setAccounts] = useState([]); // Trạng thái products: Lưu toàn bộ danh sách sản phẩm gốc từ server
  const [filteredAccounts, setFilteredAccounts] = useState([]); // Trạng thái filteredProducts: Lưu danh sách sản phẩm sau khi search/filter/sort
  const [displayedAccounts, setDisplayedAccounts] = useState([]); // Trạng thái displayedProducts: Lưu danh sách sản phẩm hiển thị trên trang hiện tại (sau phân trang)

  // Trạng thái editingAccount: Lưu thông tin sản phẩm đang được chỉnh sửa
  const [editingAccount, setEditingAccount] = useState(null)

  // Modal
  const [showAddModal, setShowAddModal] = useState(false); // Trạng thái showAddModal: Kiểm soát hiển thị modal thêm sản phẩm mới
  const [showEditModal, setShowEditModal] = useState(false); // Trạng thái showEditModal: Kiểm soát hiển thị modal chỉnh sửa sản phẩm

  // Pagnition
  const [itemsPerPage, setItemsPerPage] = useState(5); // Trạng thái itemsPerPage: Số sản phẩm hiển thị trên mỗi trang, mặc định là 5
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái currentPage: Trang hiện tại, mặc định là 1

  // Search, sort, status
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái searchTerm: Lưu từ khóa tìm kiếm theo tên sản phẩm
  const [statusFilter, setStatusFilter] = useState("all"); // Trạng thái statusFilter: Lưu trạng thái lọc (all, available, unavailable)
  const [sortOption, setSortOption] = useState(""); // Trạng thái sortOption: Lưu tùy chọn sắp xếp (giá, ngày, tăng/giảm)

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage); // Tính số trang dựa trên filteredProducts và itemsPerPage

  // Hàm paginate: Chuyển đến trang cụ thể
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm nextPage: Chuyển đến trang tiếp theo
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Hàm prevPage: Quay lại trang trước
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Hàm loadAccounts: Lấy danh sách sản phẩm từ server và cập nhật trạng thái
  const loadAccounts = async () => {
    console.log("Loading products...");
    try {
      setIsLoading(true); // Bật trạng thái loading
      const result = await fetchAccounts(); // Gọi API để lấy danh sách sản phẩm

      // ACCOUNT LIST
      let accountsList = []; // Khởi tạo mảng để lưu danh sách sản phẩm
      if (Array.isArray(result)) {
        const validAccounts = result.filter(
          // Lọc các sản phẩm hợp lệ
          (account) =>
            account &&
            typeof account === "object" &&
            account.email &&
            account.fullName // Sản phẩm phải là object, có id và name
        )
        console.log(`Products from result:`, validAccounts); // Log danh sách sản phẩm hợp lệ để debug
        accountsList = [...accountsList, ...validAccounts];
      }

      // UNIQUE ACCOUNTS
      const uniqueAccounts = Array.from(
        // Loại bỏ tài khoản trùng lặp dựa trên email
        new Map(accountsList.map((item) => [item.email, item])).values()
      );
      console.log("Parsed account list:", uniqueAccounts); // Log danh sách sản phẩm sau khi loại bỏ trùng lặp
      if (!Array.isArray(uniqueAccounts)) {
        // Kiểm tra nếu danh sách không phải mảng
        Notification.error(
          "Dữ liệu tài khoản không hợp lệ",
          "Danh sách đã được reset."
        );
        setAccounts([]); // Reset accounts về mảng rỗng
        setFilteredAccounts([]); // Reset filteredAccounts về mảng rỗng
        setDisplayedAccounts([]); // Reset displayedAccounts về mảng rỗng
      } else {
        setAccounts(uniqueAccounts); // Cập nhật trạng thái products
        setFilteredAccounts(uniqueAccounts); // Cập nhật trạng thái filteredProducts
        Notification.success(
          `Tải thành công ${uniqueAccounts.length} tài khoản.`
        );
      }

      // UNAVAILABLE ACCOUNTS
      const unavailableAccounts = uniqueAccounts // Lấy danh sách ID của các sản phẩm có trạng thái "unavailable"
        .filter((account) => account.status === "unavailable")
        .map((account) => account.id);
      localStorage.setItem(
        // Lưu danh sách ID vào localStorage
        "unavailableAccounts",
        JSON.stringify(unavailableAccounts)
      );
      // console.log(
      //   "Unavailable account IDs saved to localStorage:",
      //   unavailableAccounts
      // ); // Log danh sách ID đã lưu

      // STORED UNAVAILABLE ACCOUNTS
      const storedUnavailableAccounts = JSON.parse(
        // Đọc lại danh sách ID từ localStorage để xác nhận
        localStorage.getItem("unavailableAccounts") || "[]"
      );
      // console.log(
      //   "Confirmed unavailable product IDs in localStorage:",
      //   storedUnavailableAccounts
      // ); // Log để xác nhận
    } catch (error) {
      Notification.error(
        "Không thể tải danh sách tài khoản",
        error?.message || "Đã xảy ra lỗi khi kết nối đến server."
      );
      setAccounts([]); // Reset accounts về mảng rỗng
      setFilteredAccounts([]); // Reset filteredAccounts về mảng rỗng
      setDisplayedAccounts([]); // Reset displayedAccounts về mảng rỗng
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm handleAddProduct: Thêm sản phẩm mới
  const handleAddAccount = async (values) => {
    setIsLoading(true); // Bật trạng thái loading

    const fullName = values.fullName;
    const phone = values.phone;
    const email = values.email;
    const password = values.password;
    const role = values.role;
    const status = values.status;

    const newUser = {
      fullName,
      phone,
      email,
      password,
      role,
      status
    };

    //Todo: Hiện tại tới dòng này
    try {
      const users = await fetchAccounts();

      const emailExists = users.some(
        (user) => user.email === values.email.trim().toLowerCase()
      );

      if (emailExists) {
        setErrors({ email: "Email đã tồn tại!" });
        Notification.error("Email đã tồn tại", "Vui lòng sử dụng email khác.");
        setSubmitting(false);
        return;
      }

      // Bước 2: Gửi dữ liệu lên API mock để tạo tài khoản
      const response = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      // Hiển thị trạng thái bằng toast
      Notification.promise(response, {
        loading: "Đang thêm tài khoản...",
        success: "Thêm tài khoản thành công!",
        error: "Không thể thêm tài khoản. Vui lòng thử lại.",
      });

      if (!response.ok) throw new Error("Đăng ký thất bại");

      setShowAddModal(false); // Đóng modal

      // Tải lại danh sách sản phẩm
      await loadAccounts();

    } catch (error) {
      Notification.error("Thêm tài khoản thất bại", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm handleSoftDeleteAccount: Soft delete một tài khoản (chuyển trạng thái thành unavailable)
  const handleSoftDeleteAccount = async (email) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn thay đổi trạng thái sản phẩm này không?"
      )
    ) {
      // Hiển thị xác nhận trước khi xóa
      return;
    }

    setIsLoading(true); // Bật trạng thái loading

    const accountToUpdate = accounts.find((item) => item.email === email);
    if (!accountToUpdate) {
      Notification.error("Không tìm thấy tài khoản cần cập nhật");
      return;
    }

    const updatedAccount = {
      ...accountToUpdate,
      status: "unavailable",
    };

    console.log(updatedAccount)

    try {
      const response = await fetch(
        // Gửi yêu cầu cập nhật lên server
        "https://mindx-mockup-server.vercel.app/api/resources/accounts_user?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "PUT", // Phương thức POST
          headers: {
            "Content-Type": "application/json", // Định dạng dữ liệu gửi đi
          },
          body: JSON.stringify(updatedAccount), // Dữ liệu gửi đi
        }
      );

      if (!response.ok) {
        // Kiểm tra nếu yêu cầu thất bại
        const errorText = await response.text(); // Lấy thông tin lỗi
        // console.error("Server response status:", response.status); // Log mã lỗi
        // console.error("Server response text:", errorText); // Log chi tiết lỗi
        throw new Error(
          "Lỗi từ server: " + response.statusText + " - " + errorText
        ); // Ném lỗi
      }

      const result = await response.json(); // Lấy kết quả từ server
      // console.log("Server response after soft delete:", result); // Log kết quả
      await loadAccounts(); // Tải lại danh sách sản phẩm từ server

      Notification.success("Đã cập nhật trạng thái tài khoản", "Tài khoản đã được chuyển sang 'unavailable'");

      const storedUnavailableProducts = JSON.parse(
        // Đọc lại danh sách unavailable từ localStorage
        localStorage.getItem("unavailableProducts") || "[]"
      );
      // console.log("After soft delete, unavailable product IDs in localStorage:",storedUnavailableProducts); // Log để xác nhận
    } catch (error) {
      // console.error("Lỗi khi thay đổi trạng thái sản phẩm:", error); // Log lỗi
      Notification.error("Cập nhật thất bại", error.message);
      setAccounts(accounts); // Khôi phục danh sách sản phẩm nếu lỗi
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  const handleEditAccount = (account) => {
    if (account.status === "unavailable") {
      Notification.warning("Không thể chỉnh sửa", "Tài khoản đã bị vô hiệu hóa.");
      return;
    }
    setEditingAccount(account); // Lưu thông tin account cần chỉnh sửa
    setShowEditModal(true); // Mở modal chỉnh sửa
  };

  const handleUpdateAccount = async (values) => {
    setIsLoading(true);

    const id = values.id.trim();
    const fullName = values.fullName.trim();
    const email = values.email.trim();
    const role = values.role.trim();
    const status = values.status;
  }

  // useEffect: Xử lý search, filter, sort
  useEffect(() => {
    let updatedAccounts = [...accounts]; // Tạo bản sao của danh sách sản phẩm gốc

    // Search: Tìm kiếm theo tên
    if (searchTerm) {
      // Kiểm tra nếu có từ khóa tìm kiếm
      updatedAccounts = updatedAccounts.filter(
        (
          account // Lọc sản phẩm có tên chứa từ khóa
        ) => account.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter: Lọc theo trạng thái
    if (statusFilter !== "all") {
      // Kiểm tra nếu trạng thái lọc không phải "all"
      updatedAccounts = updatedAccounts.filter(
        // Lọc sản phẩm theo trạng thái
        (account) => account.status === statusFilter
      );
    }

    // Sort: Sắp xếp theo giá hoặc ngày
    if (sortOption) {
      // Kiểm tra nếu có tùy chọn sắp xếp
      updatedAccounts.sort((a, b) => {
        // Sắp xếp danh sách sản phẩm
        if (sortOption === "price-asc")
          return a.fullName - b.fullName;
        else if (sortOption === "price-desc")
          return b.fullName - a.fullName; // Sắp xếp giá giảm dần
        return 0; // Không thay đổi nếu không khớp
      });
    }

    setFilteredAccounts(updatedAccounts); // Cập nhật danh sách filteredProducts
    setCurrentPage(1); // Reset về trang 1 khi search/filter/sort thay đổi
  }, [searchTerm, statusFilter, sortOption, accounts]); // Chạy lại khi các trạng thái này thay đổi

  // useEffect: Xử lý pagination
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage; // Tính chỉ số sản phẩm cuối cùng trên trang
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Tính chỉ số sản phẩm đầu tiên trên trang
    const currentItems = filteredAccounts.slice(
      indexOfFirstItem,
      indexOfLastItem
    ); // Cắt danh sách sản phẩm theo trang
    setDisplayedAccounts(currentItems); // Cập nhật danh sách hiển thị
  }, [filteredAccounts, currentPage, itemsPerPage]); // Chạy lại khi filteredProducts, currentPage, hoặc itemsPerPage thay đổi

  // useEffect: Kiểm tra đăng nhập và tải sản phẩm
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn"); // Lấy trạng thái đăng nhập từ localStorage
    const userData = localStorage.getItem("user"); // Lấy thông tin người dùng từ localStorage

    if (isLoggedIn !== "true" || !userData) {
      // Kiểm tra nếu chưa đăng nhập
      navigate("/login"); // Điều hướng đến trang đăng nhập
      return;
    }

    const parsedUser = JSON.parse(userData); // Parse thông tin người dùng từ JSON
    if (parsedUser.role !== "admin") {
      // Kiểm tra nếu người dùng không phải admin
      navigate("/"); // Điều hướng đến trang hello
      return;
    }

    const storedUnavailableProducts = JSON.parse(
      // Đọc danh sách sản phẩm unavailable từ localStorage
      localStorage.getItem("unavailableProducts") || "[]"
    );
    // console.log(
    //   "Initial unavailable product IDs in localStorage:",
    //   storedUnavailableProducts
    // ); // Log để debug

    loadAccounts(); // Gọi hàm loadProducts để tải danh sách sản phẩm
  }, [navigate]); // Chạy lại khi navigate thay đổi

  return (
    <>
      <Header />
      <div className="max-w-full mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Container chính */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          {/* Container cho các nút và bộ lọc */}
          <div className="flex gap-4">
            {/* Nhóm nút Soft Delete All và Add New */}
            <button
              onClick={() => setShowAddModal(true)} // Mở modal thêm sản phẩm
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
              disabled={isLoading}
            >
              + Add New
            </button>
          </div>
          <div className="flex gap-4 flex-wrap">
            {/* Nhóm các bộ lọc và sắp xếp */}
            {/* Ô tìm kiếm */}
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              value={searchTerm} // Giá trị từ trạng thái
              onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật trạng thái khi nhập
              className="p-2 border-2 border-dark_blue rounded w-64"
            />
            {/* Dropdown lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border-2 border-dark_blue rounded"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            {/* Dropdown sắp xếp */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border-2 border-dark_blue rounded"
            >
              <option value="">Không sắp xếp</option>
              <option value="price-asc">Giá: Tăng dần</option>
              <option value="price-desc">Giá: Giảm dần</option>
              <option value="date-asc">Ngày: Cũ nhất</option>
              <option value="date-desc">Ngày: Mới nhất</option>
            </select>
            {/* Dropdown chọn số sản phẩm mỗi trang */}
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1); // Reset về trang 1 khi thay đổi
              }}
              className="p-2 border-2 border-dark_blue rounded"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md">
          {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
          {filteredAccounts.length === 0 && searchTerm ? ( // Kiểm tra nếu không tìm thấy sản phẩm và có từ khóa tìm kiếm
            <p className="text-center text-gray-600 text-lg">
              Sản phẩm bạn tìm kiếm không tồn tại
            </p>
          ) : (
            <table className="min-w-full border-2 divide-y divide-gray-200">
              {/* Bảng hiển thị sản phẩm */}
              <thead className="bg-green_starbuck">
                {/* Phần tiêu đề bảng */}
                <tr className="text-center">
                  <th className="p-3 text-lg font-semibold text-white">
                    <input type="checkbox" /> {/* Checkbox chọn tất cả */}
                  </th>
                  <th className="p-3 text-lg font-semibold text-white !text-left">Full Name</th>
                  <th className="p-3 text-lg font-semibold text-white !text-left">
                    Email
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">Phone Number</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Role
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Status
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Phần thân bảng */}
                {displayedAccounts.map(
                  (
                    item // Duyệt qua danh sách sản phẩm hiển thị
                  ) => (
                    <tr key={item.email} className="hover:bg-gray-50 text-center">
                      {/* Dòng sản phẩm, đổi màu khi hover */}
                      <td className="p-3">
                        <input type="checkbox" /> {/* Checkbox chọn sản phẩm */}
                      </td>
                      {/* FULLNAME ACCOUNT */}
                      <td className="p-3 text-dark_blue font-semibold text-left">
                        {item.fullName || "N/A"}
                      </td>
                      {/* EMAIL */}
                      <td className="p-3 text-lg text-gray-900 text-left">
                        {item.email || "N/A"}{" "}
                        {/* Hiển thị email account */}
                      </td>
                      {/* PHONE NUMBER */}
                      <td className="p-3 text-lg text-dark_blue">
                        {item.phone || "N/A"} {/* Hiển thị tên sản phẩm */}
                      </td>
                      {/* ROLE */}
                      <td className="p-3 text-lg text-dark_blue">
                        {item.role || "N/A"} {/* Hiển thị tên sản phẩm */}
                      </td>
                      {/* STATUS */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-lg rounded font-semibold ${item.status === "available"
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                            }`} // Đổi màu trạng thái
                        >
                          {item.status === "available"
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>
                      {/* ACTION */}
                      <td className="p-3 ">
                        <div className="flex items-center justify-center space-x-2">
                          {" "}
                          {/* Nhóm các nút hành động */}
                          <Pencil
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                            onClick={() => handleEditAccount(item)} // Gọi hàm chỉnh sửa
                            disabled={item.status === "unavailable"}
                            style={{
                              cursor:
                                item.status === "unavailable"
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: item.status === "unavailable" ? 0.5 : 1,
                            }}
                          />
                          {/* Icon xem chi tiết */}
                          <Trash2
                            className="w-4 h-4 text-red-600 cursor-pointer"
                            onClick={
                              item.status === "unavailable"
                                ? undefined
                                : () => handleSoftDeleteAccount(item.email) // Gọi hàm soft delete
                            }
                            disabled={
                              isLoading || item.status === "unavailable"
                            }
                            style={{
                              cursor:
                                isLoading || item.status === "unavailable"
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                isLoading || item.status === "unavailable"
                                  ? 0.5
                                  : 1,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredAccounts.length > 0 && ( // Hiển thị phân trang nếu có sản phẩm
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="ml-4 px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
          >
            Trang trước
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (
                number // Tạo danh sách số trang
              ) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded font-semibold ${currentPage === number
                    ? "bg-green_starbuck text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {number}
                </button>
              )
            )}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="mr-4 px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
          >
            Trang sau
          </button>
        </div>
      )}
      {showAddModal && ( // Hiển thị modal thêm sản phẩm
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <Formik
            initialValues={{
              fullName: "",
              email: "",
              password: "",
              confirmPassword: "",
              phone: "",
              role: "user",
              status: "available",
            }}
            validationSchema={addAccountSchema}
            onSubmit={(values) => {
              console.log("Submitting", values);
              handleAddAccount(values);
            }}
          >
            {({ values }) => (
              <Form className="bg-white p-6 rounded shadow-md w-[900px] space-y-4">
                <h2 className="text-xl font-bold text-green_starbuck">Thêm tài khoản mới</h2>

                <div className="space-y-2">
                  <Field name="fullName" className="w-full p-2 border rounded" placeholder="Họ và tên" />
                  <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />

                  <Field name="email" type="email" className="w-full p-2 border rounded" placeholder="Email" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />

                  <Field name="password" type="password" className="w-full p-2 border rounded" placeholder="Mật khẩu" />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />

                  <Field
                    name="confirmPassword"
                    type="password"
                    className="w-full p-2 border rounded"
                    placeholder="Xác nhận mật khẩu"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />

                  <Field name="phone" className="w-full p-2 border rounded" placeholder="Số điện thoại" />
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                      <Field as="select" name="role" className="w-full p-2 border rounded">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Field>
                      <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                      <Field as="select" name="status" className="w-full p-2 border rounded">
                        <option value="available">Hoạt động</option>
                        <option value="unavailable">Ngưng hoạt động</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>
                </div>

                {/* Button  */}
                <div className="flex justify-end space-x-2">
                  {/* Button Hủy */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  {/* Button Thêm */}
                  <button
                    type="submit"
                    className="relative bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Đang thêm...
                      </span>
                    ) : (
                      "Thêm"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div >
      )}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <Formik
            initialValues={{
              fullName: editingAccount?.fullName || "",
              email: editingAccount?.email || "",
              password: editingAccount?.password || "",
              phone: editingAccount?.phone || "",
              role: editingAccount?.role || "user",
              status: editingAccount?.status || "available",
            }}
            validationSchema={editAccountSchema}
            onSubmit={(values) => {
              console.log("Updating Account", values);
              handleUpdateAccount(values);
            }}
          >
            {() => (
              <Form className="bg-white p-6 rounded shadow-md w-[600px] space-y-4">
                <h2 className="text-xl font-bold text-green_starbuck">Chỉnh sửa tài khoản</h2>

                {/* Full Name */}
                <Field name="fullName" className="w-full p-2 border rounded" placeholder="Họ và tên" />
                <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm" />

                <Field name="phone" className="w-full p-2 border rounded" placeholder="Số điện thoại" />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />

                {/* Role */}
                <div>
                  <label className="block font-medium mb-1">Vai trò</label>
                  <Field
                    as="select"
                    name="role"
                    className="w-full p-2 border rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block font-medium mb-1">Trạng thái</label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full p-2 border rounded"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-red-500 text-sm" />
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAccount(null);
                    }}
                    className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                    type="button"
                    disabled={isLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="relative bg-green_starbuck text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
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
                        Đang cập nhật...
                      </span>
                    ) : (
                      "Cập nhật"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

    </>
  )
}

export default AdminAccount
