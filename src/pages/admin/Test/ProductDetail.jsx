import { useEffect, useState } from "react"; // Import hook useEffect và useState
import { useNavigate, useParams } from "react-router-dom"; // Import useParams để lấy ID từ URL
import Header from "../components/Header"; // Import component Header
import { fetchProducts } from "../api/productAPI"; // Import hàm fetchProducts
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper và SwiperSlide
import { Pagination, Autoplay } from "swiper/modules"; // Import các module của Swiper
import "swiper/css"; // Import CSS cơ bản của Swiper
import "swiper/css/pagination"; // Import CSS cho pagination


const ProductDetail = () => {
  const navigate = useNavigate(); // Khởi tạo hook useNavigate
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const [product, setProduct] = useState(null); // Trạng thái lưu thông tin sản phẩm
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [relatedProducts, setRelatedProducts] = useState([]); // Trạng thái sản phẩm tương tự
  const [recentProducts, setRecentProducts] = useState([]); // Trạng thái sản phẩm gần đây
  const [reviews, setReviews] = useState([]); // Trạng thái đánh giá


  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true); // Bật trạng thái loading


        // Gọi API để lấy danh sách sản phẩm từ server
        const result = await fetchProducts({ cache: "no-store" });
        console.log("API Result:", result); // Log dữ liệu thô từ API để debug


        let productsList = [];
        if (Array.isArray(result)) {
          result.forEach((item) => {
            if (item && item.data && Array.isArray(item.data)) {
              const validProducts = item.data.filter(
                (product) =>
                  product &&
                  typeof product === "object" &&
                  product.id &&
                  product.name
              );
              productsList = productsList.concat(validProducts);
            }
          });
        }
        console.log("Products List:", productsList); // Log danh sách sản phẩm đã lọc


        // Tạo Map để ưu tiên sản phẩm có date mới nhất
        const productMap = new Map();
        productsList.forEach((product) => {
          const existingProduct = productMap.get(product.id);
          if (!existingProduct) {
            productMap.set(product.id, product);
          } else {
            const existingDate = new Date(
              existingProduct.date.replace("thg", "tháng")
            );
            const newDate = new Date(product.date.replace("thg", "tháng"));
            if (newDate > existingDate) {
              productMap.set(product.id, product);
            }
          }
        });


        const uniqueProducts = Array.from(productMap.values());
        console.log("Unique Products:", uniqueProducts); // Log danh sách sản phẩm duy nhất


        const foundProduct = uniqueProducts.find((p) => p.id === id);
        console.log("Found Product:", foundProduct); // Log sản phẩm tìm thấy
        setProduct(foundProduct);


        // Sản phẩm gần đây (sort theo date giảm dần, lấy 3 sản phẩm)
        const recent = [...uniqueProducts]
          .sort(
            (a, b) =>
              new Date(b.date.replace("thg", "tháng")) -
              new Date(a.date.replace("thg", "tháng"))
          )
          .slice(0, 3);
        console.log("Recent Products:", recent); // Log sản phẩm gần đây
        setRecentProducts(recent);


        // Sản phẩm tương tự (giả lập dựa trên tên chứa "Áo" hoặc cùng loại)
        const similar = uniqueProducts
          .filter((p) => p.name.includes("Áo") && p.id !== id)
          .slice(0, 3);
        console.log("Related Products:", similar); // Log sản phẩm tương tự
        setRelatedProducts(similar);


        // Giả lập dữ liệu đánh giá
        setReviews([
          {
            id: 1,
            user: "Nguyen Van A",
            comment: "Sản phẩm chất lượng tốt!",
            rating: 4,
          },
          {
            id: 2,
            user: "Tran Thi B",
            comment: "Màu sắc đẹp, giao hàng nhanh!",
            rating: 5,
          },
        ]);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        alert("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false); // Tắt trạng thái loading
      }
    };
    loadProduct(); // Gọi hàm tải sản phẩm
  }, [id]); // Chạy lại khi ID thay đổi


  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1; // Tăng số lượng nếu đã có
    } else {
      cart.push({ ...product, quantity: 1 }); // Thêm mới với số lượng 1
    }
    localStorage.setItem("cart", JSON.stringify(cart)); // Lưu vào localStorage
    alert("Đã thêm vào giỏ hàng!");
  };


  if (isLoading) {
    return (
      <div className="text-center mt-10">
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
    );
  }


  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600">Sản phẩm không tồn tại.</p>
            <button
              onClick={() => navigate("/hello")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300 mx-auto block"
            >
              Quay lại
            </button>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Header />
      <section className="py-8 bg-white md:py-16 dark:bg-gray-900 antialiased">
        <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
              {product.images && product.images.length > 0 ? (
                <Swiper
                  modules={[Pagination, Autoplay]}
                  spaceBetween={10}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  style={{ height: "400px" }}
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={
                          image ||
                          "https://via.placeholder.com/600x400?text=Image+Not+Found"
                        }
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/600x400?text=Image+Not+Found")
                        }
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src="https://via.placeholder.com/600x400?text=No+Image+Available"
                  alt="No Image"
                  className="w-full h-[400px] object-cover rounded-lg"
                />
              )}
            </div>


            <div className="mt-6 sm:mt-8 lg:mt-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                {product.name}
              </h1>
              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                  {product.price.toLocaleString()} ₫
                </p>


                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i <
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                            reviews.length
                            ? "text-yellow-300"
                            : "text-gray-300"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">
                    (
                    {reviews.length > 0
                      ? (
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                          reviews.length
                        ).toFixed(1)
                      : "0.0"}
                    )
                  </p>
                  <a
                    href="#reviews"
                    className="text-sm font-medium leading-none text-gray-900 underline hover:no-underline dark:text-white"
                  >
                    {reviews.length} Reviews
                  </a>
                </div>
              </div>


              <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                <button
                  onClick={addToCart}
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 -ms-2 me-2"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                    />
                  </svg>
                  Thêm vào giỏ hàng
                </button>
              </div>


              <hr className="my-6 md:my-8 border-gray-200 dark:border-gray-800" />


              <p className="mb-6 text-gray-500 dark:text-gray-400">
                {product.description ||
                  "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Sản phẩm gần đây với Swiper cho từng sản phẩm */}
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 mt-10">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">
          Sản phẩm gần đây
        </h4>
        {recentProducts.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {recentProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  {p.images && p.images.length > 0 ? (
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      spaceBetween={5}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      style={{ height: "200px" }}
                    >
                      {p.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={
                              image ||
                              "https://via.placeholder.com/300x200?text=Image+Not+Found"
                            }
                            alt={`${p.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/300x200?text=Image+Not+Found")
                            }
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Image+Available"
                      alt="No Image"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 text-center">
                    <h5 className="text-lg font-semibold text-gray-900">
                      {p.name}
                    </h5>
                    <p className="text-gray-600">
                      Giá: {p.price.toLocaleString()} ₫
                    </p>
                    <button
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-gray-600">Không có sản phẩm gần đây.</p>
        )}
      </div>


      {/* Sản phẩm tương tự với Swiper cho từng sản phẩm */}
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 mt-10">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">
          Sản phẩm tương tự
        </h4>
        {relatedProducts.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {relatedProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                  {p.images && p.images.length > 0 ? (
                    <Swiper
                      modules={[Pagination, Autoplay]}
                      spaceBetween={5}
                      slidesPerView={1}
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 3000, disableOnInteraction: false }}
                      style={{ height: "200px" }}
                    >
                      {p.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={
                              image ||
                              "https://via.placeholder.com/300x200?text=Image+Not+Found"
                            }
                            alt={`${p.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.target.src =
                                "https://via.placeholder.com/300x200?text=Image+Not+Found")
                            }
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x200?text=No+Image+Available"
                      alt="No Image"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 text-center">
                    <h5 className="text-lg font-semibold text-gray-900">
                      {p.name}
                    </h5>
                    <p className="text-gray-600">
                      Giá: {p.price.toLocaleString()} ₫
                    </p>
                    <button
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-gray-600">Không có sản phẩm tương tự.</p>
        )}
      </div>


      {/* Đánh giá/Feedback */}
      <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0 mt-10" id="reviews">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">
          Đánh giá và Feedback
        </h4>
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="font-semibold text-gray-800">{review.user}</p>
                <p className="text-gray-600">{review.comment}</p>
                <p className="text-yellow-500">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Chưa có đánh giá nào.</p>
        )}
      </div>
    </>
  );
};


export default ProductDetail; // Xuất component ProductDetail
