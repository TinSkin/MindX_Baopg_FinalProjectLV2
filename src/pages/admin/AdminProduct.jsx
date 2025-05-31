// Import hook useNavigate từ react-router-dom để điều hướng trang
import { useNavigate } from "react-router-dom";

// Import hook useEffect và useState từ React để quản lý trạng thái và side-effect
import { useEffect, useState } from "react";

// Import các icon Pencil, Eye, Trash2 từ thư viện lucide-react để dùng trong giao diện
import { Pencil, Trash2 } from "lucide-react";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Swiper
import "swiper/css"; // Import CSS của Swiper để hiển thị carousel ảnh
import "swiper/css/navigation"; // Import CSS navigation của Swiper (nếu có dùng navigation)
import { Autoplay } from "swiper/modules"; // Import module Autoplay từ Swiper để ảnh tự động chuyển
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide để tạo carousel ảnh sản phẩm

// Import hàm fetchProducts từ productAPI để lấy danh sách sản phẩm từ server
import { fetchProducts } from "../../api/productAPI";

// Import Schema
import { addProductSchema } from "../../utils/addProductSchema";
import { editProductSchema } from "../../utils/editProductSchema";

// Import component 
import Header from "../../components/Admin/Header";
import Notification from "../../components/Notification";

const AdminProduct = () => {
  // Khởi tạo hook useNavigate để điều hướng trang
  const navigate = useNavigate();

  // Loading
  const [isLoading, setIsLoading] = useState(false); // Trạng thái isLoading: Kiểm soát trạng thái loading khi thực hiện các thao tác (thêm, sửa, xóa)

  // Products
  const [products, setProducts] = useState([]); // Trạng thái products: Lưu toàn bộ danh sách sản phẩm gốc từ server
  const [filteredProducts, setFilteredProducts] = useState([]); // Trạng thái filteredProducts: Lưu danh sách sản phẩm sau khi search/filter/sort
  const [displayedProducts, setDisplayedProducts] = useState([]); // Trạng thái displayedProducts: Lưu danh sách sản phẩm hiển thị trên trang hiện tại (sau phân trang)

  // Trạng thái imagePreviews: Lưu danh sách URL ảnh để hiển thị preview trong modal
  const [imagePreviews, setImagePreviews] = useState([]);

  // Trạng thái editingProduct: Lưu thông tin sản phẩm đang được chỉnh sửa
  const [editingProduct, setEditingProduct] = useState(null)

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

  // Topping
  const availableToppings = [
    { name: "Trân Châu", extraPrice: 12000 },
    { name: "Thạch Dừa", extraPrice: 4000 },
    { name: "Thạch Thảo Mộc", extraPrice: 12000 },
    { name: "Pudding", extraPrice: 16800 },
    { name: "Kem Phô Mai", extraPrice: 19200 },
    { name: "Kem Tươi", extraPrice: 12000 },
    { name: "Nha Đam", extraPrice: 14400 },
    { name: "Thạch Trái Cây", extraPrice: 14400 },
    { name: "Socola Chip", extraPrice: 14400 },
    { name: "Pudding Trứng", extraPrice: 16800 },
    { name: "Đậu Đỏ", extraPrice: 14400 },
  ];

  // Hàm parseCustomDate: Chuyển đổi định dạng ngày tháng dạng "15, thg 10, 2024" thành Date object để sắp xếp
  const parseCustomDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") {
      // Kiểm tra nếu dateStr không tồn tại hoặc không phải string
      return new Date(0); // Trả về ngày mặc định (1/1/1970) nếu lỗi
    }
    if (dateStr.includes("thg")) {
      // Kiểm tra nếu chuỗi ngày có định dạng tiếng Việt (chứa "thg")
      const months = {
        // Định nghĩa object ánh xạ tháng tiếng Việt sang tiếng Anh
        "thg 1": "Jan",
        "thg 2": "Feb",
        "thg 3": "Mar",
        "thg 4": "Apr",
        "thg 5": "May",
        "thg 6": "Jun",
        "thg 7": "Jul",
        "thg 8": "Aug",
        "thg 9": "Sep",
        "thg 10": "Oct",
        "thg 11": "Nov",
        "thg 12": "Dec",
      };
      const [day, month, year] = dateStr.split(", "); // Tách chuỗi ngày thành ngày, tháng, năm
      if (!day || !month || !year) {
        // Kiểm tra nếu không tách được đầy đủ
        return new Date(0); // Trả về ngày mặc định nếu lỗi
      }
      const monthKey = month.toLowerCase(); // Chuyển tháng về chữ thường để ánh xạ
      const engDateStr = `${day.replace(/\D/g, "")} ${months[monthKey]
        } ${year}`; // Tạo chuỗi ngày dạng tiếng Anh: "15 Jan 2024"
      return new Date(engDateStr) || new Date(0); // Chuyển thành Date object, trả về ngày mặc định nếu lỗi
    }
    return new Date(dateStr) || new Date(0); // Nếu không phải định dạng tiếng Việt, thử chuyển trực tiếp thành Date, trả về ngày mặc định nếu lỗi
  };

  // Hàm loadProducts: Lấy danh sách sản phẩm từ server và cập nhật trạng thái
  const loadProducts = async () => {
    // console.log("Loading products...");
    try {
      setIsLoading(true); // Bật trạng thái loading
      const result = await fetchProducts(); // Gọi API để lấy danh sách sản phẩm
      // console.log("Raw result from API:", result[0].data); // Log dữ liệu thô từ API để debug

      // PRODUCTS LIST
      let productsList = []; // Khởi tạo mảng để lưu danh sách sản phẩm
      if (Array.isArray(result[0].data)) {
        // Kiểm tra nếu kết quả trả về là mảng
        result.forEach((item, index) => {
          // Duyệt qua từng phần tử trong kết quả
          if (item && item.data && Array.isArray(item.data)) {
            // Kiểm tra nếu phần tử có thuộc tính data và data là mảng
            const validProducts = item.data.filter(
              // Lọc các sản phẩm hợp lệ
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name // Sản phẩm phải là object, có id và name
            );
            productsList = [...productsList, ...validProducts];
          }
        });
      }

      // UNIQUE PRODUCTS
      const uniqueProducts = Array.from(
        // Loại bỏ sản phẩm trùng lặp dựa trên id
        new Map(productsList.map((item) => [item.id, item])).values()
      );
      // console.log("Parsed product list:", uniqueProducts); // Log danh sách sản phẩm sau khi loại bỏ trùng lặp
      if (!Array.isArray(uniqueProducts)) {
        // Kiểm tra nếu danh sách không phải mảng
        Notification.error("Dữ liệu sản phẩm không hợp lệ", "Danh sách đã được reset.");
        setProducts([]); // Reset products về mảng rỗng
        setFilteredProducts([]); // Reset filteredProducts về mảng rỗng
        setDisplayedProducts([]); // Reset displayedProducts về mảng rỗng
      } else {
        setProducts(uniqueProducts); // Cập nhật trạng thái products
        setFilteredProducts(uniqueProducts); // Cập nhật trạng thái filteredProducts
        Notification.success(`Tải thành công ${uniqueProducts.length} sản phẩm.`);
      }

      // UNAVAILABLE PRODUCTS
      const unavailableProducts = uniqueProducts // Lấy danh sách ID của các sản phẩm có trạng thái "unavailable"
        .filter((product) => product.status === "unavailable")
        .map((product) => product.id);
      localStorage.setItem(
        // Lưu danh sách ID vào localStorage
        "unavailableProducts",
        JSON.stringify(unavailableProducts)
      );
      // console.log("Unavailable product IDs saved to localStorage:",unavailableProducts); // Log danh sách ID đã lưu

      // STORED UNAVAILABLE PRODUCTS
      const storedUnavailableProducts = JSON.parse(
        // Đọc lại danh sách ID từ localStorage để xác nhận
        localStorage.getItem("unavailableProducts") || "[]"
      );
      // console.log("Confirmed unavailable product IDs in localStorage:", storedUnavailableProducts); // Log để xác nhận
    } catch (error) {
      Notification.error("Không thể tải danh sách sản phẩm", error.message);
      setProducts([]); // Reset products về mảng rỗng
      setFilteredProducts([]); // Reset filteredProducts về mảng rỗng
      setDisplayedProducts([]); // Reset displayedProducts về mảng rỗng
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm handleImageInputChange: Xử lý khi người dùng nhập URL ảnh trong modal
  const handleImageInputChange = (e) => {
    const value = e.target.value; // Lấy giá trị từ input
    const images = value // Tách chuỗi URL bằng dấu phẩy, loại bỏ khoảng trắng và giá trị rỗng
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setImagePreviews(images); // Cập nhật danh sách preview ảnh
  };

  // Hàm handleSoftDeleteAllProducts: Soft delete tất cả sản phẩm
  const handleSoftDeleteAllProducts = async () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn thay đổi trạng thái tất cả sản phẩm không?"
      )
    ) {
      // Hiển thị xác nhận
      return;
    }

    setIsLoading(true); // Bật trạng thái loading

    const updatedProducts = products.map((item) => ({
      // Cập nhật trạng thái tất cả sản phẩm thành unavailable
      ...item,
      status: "unavailable",
    }));
    setProducts(updatedProducts); // Cập nhật danh sách sản phẩm

    try {
      const response = await fetch(
        // Gửi yêu cầu cập nhật lên server
        "https://mindx-mockup-server.vercel.app/api/resources/products_drink?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response status:", response.status);
        console.error("Server response text:", errorText);
        throw new Error(
          "Lỗi từ server: " + response.statusText + " - " + errorText
        );
      }

      const result = await response.json();
      console.log("Server response after soft delete all:", result);
      await loadProducts();

      const storedUnavailableProducts = JSON.parse(
        localStorage.getItem("unavailableProducts") || "[]"
      );
      console.log(
        "After soft delete all, unavailable product IDs in localStorage:",
        storedUnavailableProducts
      );
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái tất cả sản phẩm:", error);
      alert(
        `Thay đổi trạng thái tất cả thất bại: ${error.message}. Thử lại sau.`
      );
      setProducts(products);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm handleAddProduct: Thêm sản phẩm mới
  const handleAddProduct = async (values) => {
    setIsLoading(true); // Bật trạng thái loading

    const image = values.image
    // Trim các trường chuỗi
    const id = values.id.trim();
    const name = values.name.trim();
    const basePrice = values.basePrice;
    const description = values.description;
    const category = values.category;

    // Tách URL ảnh thành mảng
    const trimmedImages = image.split(",").map((s) => s.trim()).filter((s) => s);

    // Chuyển sizeOptions mảng thành object với parseInt giá
    const sizeOptions = values.sizeOptions.map(({ size, price }) => ({
      size: size.trim(),
      price: parseInt(price) || 0,
    }));

    // Xử lý toppings 
    const toppings = values.toppings.map((topping) => {
      const found = availableToppings.find((t) => t.name === topping.name);
      return found || { name: topping.name, extraPrice: 0 };
    });

    // New Product
    const newProduct = {
      // Tạo object sản phẩm mới
      id,
      name,
      description,
      category,
      price: parseInt(basePrice) || 0,
      currency: "VNĐ",
      sizeOptions,
      toppings,
      status: "available",
      date: new Date().toLocaleDateString("vi-VN", {
        // Tạo ngày hiện tại theo định dạng tiếng Việt
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      image: trimmedImages,
    };

    //Todo: Hiện tại tới dòng này
    try {
      // Lấy danh sách sản phẩm hiện tại từ server
      const currentResult = await fetchProducts();
      let currentProducts = [];
      if (Array.isArray(currentResult)) {
        currentResult.forEach((item) => {
          if (item && item.data && Array.isArray(item.data)) {
            const validProducts = item.data.filter(
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name
            );
            currentProducts = [...currentProducts, ...validProducts];
          }
        });
      }

      // Loại bỏ sản phẩm trùng lặp
      const uniqueCurrentProducts = Array.from(
        new Map(currentProducts.map((item) => [item.id, item])).values()
      );

      // Kiểm tra nếu ID đã tồn tại
      const isIdExists = uniqueCurrentProducts.some(
        (product) => product.id === id
      );

      if (isIdExists) {
        Notification.error("Mã sản phẩm đã tồn tại.", "Vui lòng chọn mã khác.");
        setIsLoading(false);
        return;
      }

      // Thêm sản phẩm mới vào danh sách
      const updatedProducts = [...uniqueCurrentProducts, newProduct];

      // Gửi yêu cầu thêm sản phẩm lên server POST, dùng toast.promise để báo trạng thái khi POST
      const postPromise = await fetch(
        // Gửi yêu cầu thêm sản phẩm lên server
        "https://mindx-mockup-server.vercel.app/api/resources/products_drink?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      // Hiển thị trạng thái bằng toast
      Notification.promise(postPromise, {
        loading: "Đang thêm sản phẩm...",
        success: "Thêm sản phẩm thành công!",
        error: "Không thể thêm sản phẩm. Vui lòng thử lại.",
      });

      // Đợi kết quả thực sự từ server
      const response = await postPromise;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi từ server: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Server response after adding product:", result);

      // Tải lại danh sách sản phẩm
      await loadProducts();

      const addedProduct = newProduct;
      console.log("Added product:", addedProduct);

      setShowAddModal(false); // Đóng modal
      setImagePreviews([]); // Reset preview ảnh
    } catch (error) {
      Notification.error("Thêm sản phẩm thất bại", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm handleEditProduct: Mở modal chỉnh sửa sản phẩm
  const handleEditProduct = (product) => {
    if (product.status === "unavailable") {
      // Kiểm tra nếu sản phẩm không khả dụng
      Notification.warning("Không thể chỉnh sửa sản phẩm có trạng thái 'unavailable'.");
      return;
    }
    setEditingProduct(product); // Lưu thông tin sản phẩm cần chỉnh sửa
    setImagePreviews(product.image); // Hiển thị preview ảnh của sản phẩm
    setShowEditModal(true); // Mở modal chỉnh sửa
  };

  // Hàm handleUpdateProduct: Cập nhật sản phẩm
  const handleUpdateProduct = async (values) => {
    setIsLoading(true);

    // image ở đây đã là mảng string[], chỉ cần trim từng phần tử
    const image = values.image
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (image.length === 0) {
      alert("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
      setIsLoading(false);
      return;
    }

    // Trim các trường chuỗi
    const id = values.id.trim();
    const name = values.name.trim();
    const basePrice = values.basePrice;
    const description = values.description;
    const category = values.category;

    // Chuyển sizeOptions mảng thành object với parseInt giá
    const sizeOptions = values.sizeOptions.map(({ size, price }) => ({
      size: size.trim(),
      price: parseInt(price) || 0,
    }));

    // Xử lý toppings 
    const toppings = values.toppings.map((topping) => {
      const found = availableToppings.find((t) => t.name === topping.name);
      return found || { name: topping.name, extraPrice: 0 };
    });

    // Updated Product
    const updatedProduct = {
      id,
      name,
      description,
      category,
      price: parseInt(basePrice) || 0,
      currency: "VNĐ",
      sizeOptions,
      toppings,
      status: "available",
      date: editingProduct.date,
      image,
    };

    // Fetch danh sách hiện tại
    try {
      const currentResult = await fetchProducts();
      let currentProducts = [];
      if (Array.isArray(currentResult)) {
        currentResult.forEach((item) => {
          if (item && item.data && Array.isArray(item.data)) {
            const validProducts = item.data.filter(
              (product) =>
                product &&
                typeof product === "object" &&
                product.id &&
                product.name
            );
            currentProducts = [...currentProducts, ...validProducts];
          }
        });
      }

      const uniqueCurrentProducts = Array.from(
        new Map(currentProducts.map((item) => [item.id, item])).values()
      );

      const isIdExists = uniqueCurrentProducts.some(
        (product) =>
          product.id === id && product.id !== editingProduct.id
      );
      if (isIdExists) {
        Notification.error("Mã sản phẩm đã tồn tại", "Vui lòng chọn mã khác.");
        setIsLoading(false);
        return;
      }

      const updatedProducts = uniqueCurrentProducts.map((product) =>
        product.id === editingProduct.id ? updatedProduct : product
      );

      const postPromise = await fetch(
        "https://mindx-mockup-server.vercel.app/api/resources/products_drink?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: updatedProducts }),
        }
      );

      // 👉 Thêm Notification trạng thái
      Notification.promise(postPromise, {
        loading: "Đang cập nhật sản phẩm...",
        success: "Cập nhật thành công!",
        error: "Không thể cập nhật. Vui lòng thử lại.",
      });

      const response = await postPromise;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi từ server: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Server response after adding product:", result);

      await loadProducts();
      // Hiển thị thông báo thành công
      Notification.success("Cập nhật thành công", "Sản phẩm đã được cập nhật.");

      setShowEditModal(false);
      setImagePreviews([]);
      setEditingProduct(null);
    } catch (error) {
      Notification.error("Cập nhật thất bại", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage); // Tính số trang dựa trên filteredProducts và itemsPerPage

  // Hàm paginate: Chuyển đến trang cụ thể
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm nextPage: Chuyển đến trang tiếp theo
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Hàm prevPage: Quay lại trang trước
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // useEffect: Xử lý search, filter, sort
  useEffect(() => {
    let updatedProducts = [...products]; // Tạo bản sao của danh sách sản phẩm gốc

    // Search: Tìm kiếm theo tên
    if (searchTerm) {
      // Kiểm tra nếu có từ khóa tìm kiếm
      updatedProducts = updatedProducts.filter(
        (
          product // Lọc sản phẩm có tên chứa từ khóa
        ) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter: Lọc theo trạng thái
    if (statusFilter !== "all") {
      // Kiểm tra nếu trạng thái lọc không phải "all"
      updatedProducts = updatedProducts.filter(
        // Lọc sản phẩm theo trạng thái
        (product) => product.status === statusFilter
      );
    }

    // Sort: Sắp xếp theo giá hoặc ngày
    if (sortOption) {
      // Kiểm tra nếu có tùy chọn sắp xếp
      updatedProducts.sort((a, b) => {
        // Sắp xếp danh sách sản phẩm
        if (sortOption === "price-asc")
          return a.price - b.price; // Sắp xếp giá tăng dần
        else if (sortOption === "price-desc")
          return b.price - a.price; // Sắp xếp giá giảm dần
        else if (sortOption === "date-asc")
          return parseCustomDate(a.date) - parseCustomDate(b.date);
        // Sắp xếp ngày cũ nhất
        else if (sortOption === "date-desc")
          return parseCustomDate(b.date) - parseCustomDate(a.date); // Sắp xếp ngày mới nhất
        return 0; // Không thay đổi nếu không khớp
      });
    }

    setFilteredProducts(updatedProducts); // Cập nhật danh sách filteredProducts
    setCurrentPage(1); // Reset về trang 1 khi search/filter/sort thay đổi
  }, [searchTerm, statusFilter, sortOption, products]); // Chạy lại khi các trạng thái này thay đổi

  // useEffect: Xử lý pagination
  useEffect(() => {
    const indexOfLastItem = currentPage * itemsPerPage; // Tính chỉ số sản phẩm cuối cùng trên trang
    const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Tính chỉ số sản phẩm đầu tiên trên trang
    const currentItems = filteredProducts.slice(
      indexOfFirstItem,
      indexOfLastItem
    ); // Cắt danh sách sản phẩm theo trang
    setDisplayedProducts(currentItems); // Cập nhật danh sách hiển thị
  }, [filteredProducts, currentPage, itemsPerPage]); // Chạy lại khi filteredProducts, currentPage, hoặc itemsPerPage thay đổi

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
    // console.log("Initial unavailable product IDs in localStorage:",storedUnavailableProducts); // Log để debug

    loadProducts(); // Gọi hàm loadProducts để tải danh sách sản phẩm
  }, [navigate]); // Chạy lại khi navigate thay đổi

  // Hàm handleSoftDeleteProduct: Soft delete một sản phẩm (chuyển trạng thái thành unavailable)
  const handleSoftDeleteProduct = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn thay đổi trạng thái sản phẩm này không?"
      )
    ) {
      // Hiển thị xác nhận trước khi xóa
      return;
    }

    setIsLoading(true); // Bật trạng thái loading

    const updatedProducts = products.map(
      (
        item // Cập nhật trạng thái sản phẩm
      ) => (item.id === id ? { ...item, status: "unavailable" } : item)
    );
    setProducts(updatedProducts); // Cập nhật danh sách sản phẩm

    try {
      const response = await fetch(
        // Gửi yêu cầu cập nhật lên server
        "https://mindx-mockup-server.vercel.app/api/resources/products_drink?apiKey=67fe686cc590d6933cc1248b",
        {
          method: "POST", // Phương thức POST
          headers: {
            "Content-Type": "application/json", // Định dạng dữ liệu gửi đi
          },
          body: JSON.stringify({ data: updatedProducts }), // Dữ liệu gửi đi
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
      await loadProducts(); // Tải lại danh sách sản phẩm từ server

      Notification.success("Đã cập nhật trạng thái sản phẩm", "Sản phẩm đã được chuyển sang 'unavailable'");

      const storedUnavailableProducts = JSON.parse(
        // Đọc lại danh sách unavailable từ localStorage
        localStorage.getItem("unavailableProducts") || "[]"
      );
      // console.log("After soft delete, unavailable product IDs in localStorage:",storedUnavailableProducts); // Log để xác nhận
    } catch (error) {
      // console.error("Lỗi khi thay đổi trạng thái sản phẩm:", error); // Log lỗi
      Notification.error("Cập nhật thất bại", error.message);
      setProducts(products); // Khôi phục danh sách sản phẩm nếu lỗi
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

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
              onClick={handleSoftDeleteAllProducts} // Gọi hàm soft delete tất cả
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
              disabled={isLoading} // Vô hiệu hóa khi đang loading
            >
              {isLoading ? ( // Hiển thị spinner khi loading
                <span className="flex items-center ">
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
                  Đang xử lý...
                </span>
              ) : (
                "🗑 Delete All" // Hiển thị text khi không loading
              )}
            </button>
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
              className="p-2 border-2 rounded w-64 border-dark_blue"
            />
            {/* Dropdown lọc trạng thái */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border-2 rounded border-dark_blue"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            {/* Dropdown sắp xếp */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border-2 rounded border-dark_blue"
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
              className="p-2 border-2 rounded border-dark_blue"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-md">
          {/* Container bảng, hỗ trợ cuộn ngang nếu bảng quá rộng */}
          {filteredProducts.length === 0 && searchTerm ? ( // Kiểm tra nếu không tìm thấy sản phẩm và có từ khóa tìm kiếm
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
                  <th className="p-3 text-lg font-semibold text-white">ID</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Name & Image
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">Date</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Description
                  </th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Category
                  </th>
                  {/* <th className="p-3 text-lg font-semibold text-white">
                    Price
                  </th> */}
                  <th className="p-3 text-lg font-semibold text-white">Size</th>
                  <th className="p-3 text-lg font-semibold text-white">
                    Topping
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
                {displayedProducts.map(
                  (
                    item // Duyệt qua danh sách sản phẩm hiển thị
                  ) => (
                    <tr key={item.id} className="hover:bg-gray-50 text-center">
                      {/* Dòng sản phẩm, đổi màu khi hover */}
                      <td className="p-3">
                        <input type="checkbox" /> {/* Checkbox chọn sản phẩm */}
                      </td>
                      {/* ID PRODUCT */}
                      <td className="p-3 text-dark_blue font-semibold cursor-pointer">
                        {item.id || "N/A"} {/* Hiển thị ID sản phẩm */}
                      </td>
                      {/* NAME & IMAGE */}
                      <td className="p-3 flex items-center space-x-3">
                        {/* Cột tên và ảnh */}
                        <div className="w-[150px] h-[150px]">
                          {/* Container ảnh */}
                          <Swiper
                            modules={[Autoplay]} // Sử dụng module Autoplay
                            autoplay={{
                              delay: 2000,
                              disableOnInteraction: false,
                            }} // Tự động chuyển ảnh sau 2 giây
                            loop={
                              Array.isArray(item.image) && item.image.length > 1 // Lặp lại nếu có nhiều hơn 1 ảnh
                            }
                            className="rounded-md overflow-hidden h-full"
                          >
                            {Array.isArray(item.image) &&
                              item.image.map(
                                (
                                  img,
                                  idx // Duyệt qua danh sách ảnh
                                ) => (
                                  <SwiperSlide key={idx}>
                                    <img
                                      src={img}
                                      alt={item.name || "Product image"}
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  </SwiperSlide>
                                )
                              )}
                          </Swiper>
                        </div>
                        <span className="font-bold text-camel text-lg">
                          {item.name || "N/A"} {/* Hiển thị tên sản phẩm */}
                        </span>
                      </td>
                      {/* DATE */}
                      <td className="p-3 text-lg text-dark_blue">
                        {item.date || "N/A"} {/* Hiển thị ngày */}
                      </td>
                      {/* DESCRIPTION */}
                      <td className="p-3 text-lg text-gray-900">
                        {item.description || "N/A"}
                        {/* Hiển thị tên sản phẩm */}
                      </td>
                      {/* CATEGORY */}
                      <td className="p-3 text-lg text-gray-900">
                        {item.category || "N/A"} {/* Hiển thị tên sản phẩm */}
                      </td>
                      {/* PRICE */}
                      {/* <td className="p-3 text-lg text-camel font-semibold">
                        {typeof item.price === "number"
                          ? item.price.toLocaleString()
                          : "N/A"}
                        ₫
                      </td> */}
                      {/* SIZE */}
                      <td className="p-3 text-lg text-gray-900">
                        {Array.isArray(item.sizeOptions) &&
                          item.sizeOptions.map((option, index) => (
                            <div
                              key={index}
                              className="block mx-1 px-2 py-1 bg-dark_blue mt-2 rounded text-left"
                            >
                              <span className="text-white font-semibold">
                                {typeof option === "object"
                                  ? option.size
                                  : option}
                                :{" "}
                              </span>
                              <span className="text-white">
                                {typeof option.price === "number"
                                  ? option.price.toLocaleString()
                                  : "N/A"}₫
                              </span>
                            </div>
                          ))}
                      </td>
                      {/* TOPPING */}
                      <td className="p-3 text-lg text-gray-900">
                        {Array.isArray(item.sizeOptions) &&
                          item.toppings.map((option, index) => (
                            <div
                              key={index}
                              className="block mx-1 px-2 py-1 bg-dark_blue mt-2 rounded text-left"
                            >
                              <span className="text-white font-semibold">
                                {typeof option === "object"
                                  ? option.name
                                  : option}
                                :{" "}
                              </span>
                              <span className="text-white font-semibold">
                                {typeof option.extraPrice === "number"
                                  ? option.extraPrice.toLocaleString()
                                  : "N/A"}₫
                              </span>
                            </div>
                          ))}
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
                      <td className="p-3">
                        <div className="flex items-center justify-start space-x-2">
                          {/* Nhóm các nút hành động */}
                          <Pencil
                            className="w-4 h-4 text-blue-600 cursor-pointer"
                            onClick={() => handleEditProduct(item)} // Gọi hàm chỉnh sửa
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
                                : () => handleSoftDeleteProduct(item.id) // Gọi hàm soft delete
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
        {/* Pagination */}
        {filteredProducts.length > 0 && ( // Hiển thị phân trang nếu có sản phẩm
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
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
              className="px-4 py-2 bg-green_starbuck text-white rounded hover:bg-green_starbuck/80 disabled:bg-gray-400 font-semibold"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
      {showAddModal && ( // Hiển thị modal thêm sản phẩm
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <Formik
            initialValues={{
              id: "",
              name: "",
              image: "",
              basePrice: "",
              sizeOptions: [],
              toppings: [],
              description: "",
              category: "",
            }}
            validationSchema={addProductSchema}
            onSubmit={(values) => {
              console.log("Submitting", values);
              handleAddProduct(values);
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="bg-white p-6 rounded shadow-md w-[900px] space-y-4">
                <h2 className="text-xl font-bold text-green_starbuck">Thêm sản phẩm mới</h2>

                <div className="flex gap-4">
                  <div className="flex-1">
                    {/* Thêm ID */}
                    <Field name="id" className="w-full p-2 border rounded" placeholder="ID" />
                    <ErrorMessage name="id" component="div" className="text-red-500 text-sm" />
                  </div>
                  <div className="flex-1">
                    {/* Thêm Tên */}
                    <Field name="name" className="w-full p-2 border rounded" placeholder="Tên sản phẩm" />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Mô tả sản phẩm */}
                <Field
                  name="description"
                  as="textarea"
                  className="w-full p-2 border rounded"
                  placeholder="Mô tả sản phẩm"
                />
                <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />

                {/* Danh mục sản phẩm */}
                <Field
                  name="category"
                  as="select"
                  className="w-full p-2 border rounded"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Cà Phê">Cà phê</option>
                  <option value="Trà">Trà</option>
                  <option value="Frappuccino">Frappuccino</option>
                  <option value="Đồ Uống">Đồ uống</option>
                  <option value="Sinh Tố">Sinh Tố</option>
                  <option value="Nước Trái Cây">Nước trái cây</option>
                  <option value="Khác">Khác</option>
                </Field>
                <ErrorMessage name="category" component="div" className="text-red-500 text-sm" />

                {/* Thêm Ảnh */}
                <Field name="image">
                  {({ field, form }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                      onChange={(e) => {
                        const value = e.target.value;
                        form.setFieldValue("image", value);      // Cập nhật Formik
                        handleImageInputChange(e);               // Gọi hàm xử lý preview
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map(
                    (
                      src,
                      idx // Hiển thị preview ảnh
                    ) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`preview-${idx}`}
                        className="w-24 h-24 object-cover rounded"
                        onError={
                          (e) =>
                          (e.target.src =
                            "https://via.placeholder.com/150?text=Image+Not+Found") // Hiển thị ảnh mặc định nếu lỗi
                        }
                      />
                    )
                  )}
                </div>

                {/* Thêm Giá */}
                <Field name="basePrice"
                  type="number"
                  className="w-full p-2 border rounded"
                  placeholder="Giá (VNĐ)"
                />
                <ErrorMessage name="basePrice" component="div" className="text-red-500 text-sm" />

                {/* Thêm Size */}
                {["S", "M", "L"].map((size) => {
                  const isChecked = values.sizeOptions.some((opt) => opt.size === size);
                  const currentPrice = values.sizeOptions.find((opt) => opt.size === size)?.price || "";

                  return (
                    <div key={size} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue("sizeOptions", [...values.sizeOptions, { size, price: "" }]);
                          } else {
                            setFieldValue(
                              "sizeOptions",
                              values.sizeOptions.filter((opt) => opt.size !== size)
                            );
                          }
                        }}
                      />
                      <span className="w-6">{size}</span>
                      <input
                        type="number"
                        placeholder={`Giá size ${size}`}
                        className="flex-1 p-2 border rounded"
                        value={currentPrice}
                        onChange={(e) => {
                          setFieldValue(
                            "sizeOptions",
                            values.sizeOptions.map((opt) =>
                              opt.size === size ? { ...opt, price: e.target.value } : opt
                            )
                          );
                        }}
                        disabled={!isChecked}
                      />
                    </div>
                  );
                })}

                {/* Thêm Topping */}
                <div>
                  <label className="block font-medium mb-1">Chọn Topping</label>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1 ">
                    {availableToppings.map((topping, index) => {
                      const isChecked = values.toppings.some(t => t.name === topping.name);
                      return (
                        <label key={index} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updatedToppings = e.target.checked
                                ? [...values.toppings, topping]
                                : values.toppings.filter((t) => t.name !== topping.name);
                              setFieldValue("toppings", updatedToppings);
                            }}
                            className="mr-2"
                          />
                          {topping.name} (+{topping.extraPrice.toLocaleString("vi-VN")}₫)
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Thêm Date */}
                <input
                  type="text"
                  disabled
                  value={new Date().toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
                />

                {/* Button  */}
                <div className="flex justify-end space-x-2">
                  {/* Button Hủy */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setImagePreviews([]);
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
      {
        showEditModal &&
        editingProduct && ( // Hiển thị modal chỉnh sửa
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <Formik
              initialValues={{
                id: editingProduct?.id || "",
                name: editingProduct?.name || "",
                image: Array.isArray(editingProduct?.image)
                  ? editingProduct.image // ✅ giữ nguyên dạng mảng
                  : typeof editingProduct?.image === "string"
                    ? editingProduct.image.split(",").map((s) => s.trim()).filter(Boolean)
                    : [],
                basePrice: editingProduct?.price || "",
                sizeOptions: editingProduct?.sizeOptions || [], // <-- quan trọng
                toppings: editingProduct?.toppings || [],
                description: editingProduct?.description || "",
                category: editingProduct?.category?.trim() || "",
              }}
              validationSchema={editProductSchema}
              onSubmit={(values) => {
                console.log("Submitting", values);
                handleUpdateProduct(values);
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="bg-white p-6 rounded shadow-md w-[900px] space-y-4">
                  <h2 className="text-xl font-bold text-green_starbuck">Chỉnh sửa sản phẩm</h2>

                  {/* ID và Tên sản phẩm trong cùng hàng */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Field name="id" className="w-full p-2 border rounded" placeholder="ID" />
                      <ErrorMessage name="id" component="div" className="text-red-500 text-sm" />
                    </div>
                    <div className="flex-1">
                      <Field name="name" className="w-full p-2 border rounded" placeholder="Tên sản phẩm" />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                    </div>
                  </div>

                  {/* Mô tả sản phẩm */}
                  <Field
                    name="description"
                    as="textarea"
                    className="w-full p-2 border rounded"
                    placeholder="Mô tả sản phẩm"
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-sm" />

                  {/* Danh mục sản phẩm */}
                  <Field
                    name="category"
                    as="select"
                    className="w-full p-2 border rounded"
                    value={values.category} // thêm dòng này
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Cà Phê">Cà phê</option>
                    <option value="Trà">Trà</option>
                    <option value="Frappuccino">Frappuccino</option>
                    <option value="Đồ Uống">Đồ uống</option>
                    <option value="Sinh Tố">Sinh Tố</option>
                    <option value="Nước Trái Cây">Nước trái cây</option>
                    <option value="Khác">Khác</option>
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-red-500 text-sm" />

                  {/* Thêm Ảnh */}
                  <Field name="image">
                    {({ field, form }) => (
                      <input
                        {...field}
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
                        onChange={(e) => {
                          const value = e.target.value;
                          const imageArray = value
                            .split(",")
                            .map((url) => url.trim())
                            .filter((url) => url);
                          form.setFieldValue("image", imageArray);
                          handleImageInputChange(e);
                        }}
                      />
                    )}
                  </Field>
                  <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map(
                      (
                        src,
                        idx // Hiển thị preview ảnh
                      ) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`preview-${idx}`}
                          className="w-24 h-24 object-cover rounded"
                          onError={
                            (e) =>
                            (e.target.src =
                              "https://via.placeholder.com/150?text=Image+Not+Found") // Hiển thị ảnh mặc định nếu lỗi
                          }
                        />
                      )
                    )}
                  </div>

                  {/* Thêm Giá */}
                  <Field
                    name="basePrice"
                    type="number"
                    className="w-full p-2 border rounded"
                    placeholder="Giá (VNĐ)"
                  />
                  <ErrorMessage name="basePrice" component="div" className="text-red-500 text-sm" />

                  {/* Thêm Size */}
                  {["S", "M", "L"].map((size) => {
                    const isChecked = values.sizeOptions.some((opt) => opt.size === size);
                    const currentPrice = values.sizeOptions.find((opt) => opt.size === size)?.price || "";

                    return (
                      <div key={size} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          defaultValue={editingProduct.size}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue("sizeOptions", [...values.sizeOptions, { size, price: "" }]);
                            } else {
                              setFieldValue(
                                "sizeOptions",
                                values.sizeOptions.filter((opt) => opt.size !== size)
                              );
                            }
                          }}
                        />
                        <span className="w-6">{size}</span>
                        <input
                          type="number"
                          placeholder={`Giá size ${size}`}
                          className="flex-1 p-2 border rounded"
                          value={currentPrice}
                          onChange={(e) => {
                            setFieldValue(
                              "sizeOptions",
                              values.sizeOptions.map((opt) =>
                                opt.size === size ? { ...opt, price: e.target.value } : opt
                              )
                            );
                          }}
                          disabled={!isChecked}
                        />
                      </div>
                    );
                  })}

                  {/* Thêm Topping */}
                  <div>
                    <label className="block font-medium mb-1">Chọn Topping</label>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-1 ">
                      {availableToppings.map((topping, index) => {
                        const isChecked = values.toppings.some(
                          (t) => t.name.toLowerCase() === topping.name.toLowerCase()
                        );
                        return (
                          <label key={index} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updatedToppings = e.target.checked
                                  ? [...values.toppings, topping]
                                  : values.toppings.filter((t) => t.name !== topping.name);
                                setFieldValue("toppings", updatedToppings);
                              }}
                              className="mr-2"
                            />
                            {topping.name} (+{topping.extraPrice.toLocaleString("vi-VN")}₫)
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Thêm Date */}
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
                  />

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setImagePreviews([]);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
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
        )
      }
    </>
  );
};

export default AdminProduct;
