import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchProducts({ cache: "no-store" });

        console.log("Menu: ", result);

        const productsList = Array.isArray(result)
          ? result.flatMap(
              (item) =>
                item?.data?.filter(
                  (product) =>
                    product &&
                    typeof product === "object" &&
                    product.id &&
                    product.name
                ) || []
            )
          : [];

        const productMap = new Map();
        productsList.forEach((product) => {
          console.log(productsList);
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
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
        alert("Không thể tải sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  console.log("Products Last", products);

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="flex gap-4">
          {/* Category */}
          <FadeInOnScroll direction="left" delay={0.2}>
            <Category />
          </FadeInOnScroll>

          {/* Product List */}
          <div className="flex-1">
            <ProductList products={products} />
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
