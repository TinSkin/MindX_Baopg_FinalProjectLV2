import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Import Components
import Header from "../components/Header";
import Footer from "../components/Footer";
import Category from "../components/Category";
import ProductList from "../components/ProductList";
import Cart from "../components/Cart";
import FadeInOnScroll from "./../components/FadeInOnScroll";

// Import Fetch Product
import { fetchProducts } from "../api/productAPI";

// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Menu() {
  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Products
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Trạng thái filteredProducts: Lưu danh sách sản phẩm sau khi search/filter/sort
  const [displayedProducts, setDisplayedProducts] = useState([]); // Trạng thái displayedProducts: Lưu danh sách sản phẩm hiển thị trên trang hiện tại (sau phân trang)

  // Pagnition
  const [itemsPerPage, setItemsPerPage] = useState(8); // Trạng thái itemsPerPage: Số sản phẩm hiển thị trên mỗi trang, mặc định là 8
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái currentPage: Trang hiện tại, mặc định là 1

  // Hàm loadProducts: Lấy danh sách sản phẩm từ server và cập nhật trạng thái
  const loadProducts = async () => {
    try {
      setIsLoading(true); // Bật trạng thái loading
      const result = await fetchProducts(); // Gọi API để lấy danh sách sản phẩm

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
            // console.log(`Products from result[${index}].data:`, validProducts); // Log danh sách sản phẩm hợp lệ để debug
            productsList = [...productsList, ...validProducts];
          }
        });
      }

      // UNIQUE PRODUCTS
      const uniqueProducts = Array.from(
        // Loại bỏ sản phẩm trùng lặp dựa trên id
        new Map(productsList.map((item) => [item.id, item])).values()
      );

      if (!Array.isArray(uniqueProducts)) {
        // Kiểm tra nếu danh sách không phải mảng
        console.error(
          "Dữ liệu không đúng định dạng, trả về mảng rỗng:",
          uniqueProducts
        ); // Log lỗi
        setProducts([]); // Reset products về mảng rỗng
        setFilteredProducts([]); // Reset filteredProducts về mảng rỗng
        setDisplayedProducts([]); // Reset displayedProducts về mảng rỗng
      } else {
        setProducts(uniqueProducts); // Cập nhật trạng thái products
        setFilteredProducts(uniqueProducts); // Cập nhật trạng thái filteredProducts
      }

      // AVAILABLE PRODUCTS
      const availableProducts = uniqueProducts // Lấy danh sách ID của các sản phẩm có trạng thái "available"
        .filter((product) => product.status === "available")
        .map((product) => product.id);

      localStorage.setItem(
        // Lưu danh sách ID vào localStorage
        "availableProducts",
        JSON.stringify(availableProducts)
      );

      const displayed = uniqueProducts.filter((p) =>
        availableProducts.includes(p.id)
      );
      setProducts(displayed); // ✅ chỉ còn sản phẩm "available"
      setFilteredProducts(displayed);
      setDisplayedProducts(displayed);

    } catch (error) {
      console.error("Không thể tải danh sách sản phẩm:", error); // Log lỗi nếu không tải được sản phẩm
      alert(
        `Không thể tải danh sách sản phẩm: ${error.message}. Vui lòng thử lại sau.`
      ); // Hiển thị thông báo lỗi cho người dùng
      setProducts([]); // Reset products về mảng rỗng
      setFilteredProducts([]); // Reset filteredProducts về mảng rỗng
      setDisplayedProducts([]); // Reset displayedProducts về mảng rỗng
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
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

  // Search, sort
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái searchTerm: Lưu từ khóa tìm kiếm theo tên sản phẩm
  const [sortOption, setSortOption] = useState(""); // Trạng thái sortOption: Lưu tùy chọn sắp xếp (giá, ngày, tăng/giảm)

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

    // Sort: Sắp xếp theo giá hoặc ngày
    if (sortOption) {
      // Kiểm tra nếu có tùy chọn sắp xếp
      updatedProducts.sort((a, b) => {
        // Sắp xếp danh sách sản phẩm
        if (sortOption === "price-asc")
          return a.price - b.price; // Sắp xếp giá tăng dần
        else if (sortOption === "price-desc")
          return b.price - a.price; // Sắp xếp giá giảm dần
      });
    }

    setFilteredProducts(updatedProducts); // Cập nhật danh sách filteredProducts
    setCurrentPage(1); // Reset về trang 1 khi search/filter/sort thay đổi
  }, [searchTerm, sortOption, products]); // Chạy lại khi các trạng thái này thay đổi

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
    loadProducts(); // Gọi hàm loadProducts để tải danh sách sản phẩm
  }, []); // Chạy lại khi navigate thay đổi

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex gap-4">
          {/* Category */}
          <FadeInOnScroll direction="left" delay={0.2}>
            <Category />
          </FadeInOnScroll>

          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            {/* Product List */}
            <div className="flex-1">
              {/* Sort & Search */}
              <div className="flex gap-4 justify-between mb-5">
                {" "}
                {/* Nhóm các bộ lọc và sắp xếp */}
                {/* Ô tìm kiếm */}
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên..."
                  value={searchTerm} // Giá trị từ trạng thái
                  onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật trạng thái khi nhập
                  className="p-2 border rounded w-72"
                />
                {/* Dropdown sắp xếp */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">Không sắp xếp</option>
                  <option value="price-asc">Giá: Tăng dần</option>
                  <option value="price-desc">Giá: Giảm dần</option>
                </select>
              </div>

              {/* Display Producat */}
              {filteredProducts.length === 0 && searchTerm ? (
                <p className="text-center text-gray-600 text-lg">
                  Không tải được sản phẩm
                </p>
              ) : (
                <ProductList products={products} displayedProducts={displayedProducts} />
              )}
              {/* Pagination */}
              {filteredProducts.length > 0 && ( // Hiển thị phân trang nếu có sản phẩm
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-dark_blue text-white rounded hover:bg-dark_blue/80 disabled:bg-gray-400 font-semibold"
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
                            ? "bg-dark_blue text-white"
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
                    className="px-4 py-2 bg-dark_blue text-white rounded hover:bg-bg-dark_blue/80 disabled:bg-gray-400 font-semibold"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cart */}
          <FadeInOnScroll direction="right" delay={0.2}>
            <Cart />
          </FadeInOnScroll>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Menu;
