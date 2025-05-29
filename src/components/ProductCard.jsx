import React, { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Formik Yup
import { Formik, Form, Field, ErrorMessage } from "formik";

// Import Schema
import { addOrderSchema } from "../utils/addOrderSchema";

function ProductCard(props) {
  // Loading
  const [isLoading, setIsLoading] = useState(false); // Trạng thái isLoading: Kiểm soát trạng thái loading khi thực hiện các thao tác (thêm, sửa, xóa)

  // Modal
  const [showAddModal, setShowAddModal] = useState(false); // Trạng thái showAddModal: Kiểm soát hiển thị modal 

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
    { name: "Thạch Trái Cây", extraPrice: 14400 },
    { name: "Pudding Trứng", extraPrice: 16800 },
    { name: "Đậu Đỏ", extraPrice: 14400 },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Product Swiper */}
        <Swiper
          modules={[Autoplay]} // Sử dụng module Autoplay
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }} // Tự động chuyển ảnh sau 2 giây
          loop={
            Array.isArray(props.image) && props.image.length > 1 // Lặp lại nếu có nhiều hơn 1 ảnh
          }
          className="rounded-md"
        >
          {Array.isArray(props.image) &&
            props.image.map(
              (
                img,
                idx // Duyệt qua danh sách ảnh
              ) => (
                <SwiperSlide key={idx}>
                  <img
                    src={img}
                    alt={props.name || "Product image"}
                    className="w-full h-72 object-cover rounded-md"
                  />
                </SwiperSlide>
              )
            )}
        </Swiper>
        <div className="p-3 text-center">
          <h3 className="text-sm font-semibold leading-tight mb-1">
            {props.name}
          </h3>
          <p className="text-logo_color text-sm mb-2 font-semibold">
            {props.price.toLocaleString()}đ
          </p>
          <button onClick={() => setShowAddModal(true)} className="bg-dark_blue hover:bg-camel text-white py-1 px-2 rounded text-sm flex items-center justify-center w-full">
            <span className="mr-1">+</span> Thêm
          </button>
        </div>
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
            validationSchema={addOrderSchema}
            onSubmit={(values) => {
              console.log("Submitting", values);
              handleAddProduct(values);
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="bg-white p-6 rounded shadow-md w-[900px] space-y-4">
                <div className="flex-1">
                  <div className="flex">
                    {/* Product Swiper */}
                    <Swiper
                      modules={[Autoplay]} // Sử dụng module Autoplay
                      autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                      }} // Tự động chuyển ảnh sau 2 giây
                      loop={
                        Array.isArray(props.image) && props.image.length > 1 // Lặp lại nếu có nhiều hơn 1 ảnh
                      }
                      className="rounded-md"
                    >
                      {Array.isArray(props.image) &&
                        props.image.map(
                          (
                            img,
                            idx // Duyệt qua danh sách ảnh
                          ) => (
                            <SwiperSlide key={idx}>
                              <img
                                src={img}
                                alt={props.name || "Product image"}
                                className=" h-20 object-cover rounded-md"
                              />
                            </SwiperSlide>
                          )
                        )}
                    </Swiper>
                  </div>
                  <div className="">
                    <p className="font-bold text-dark_blue">{props.name}</p>
                    <span className="text-camel font-semibold">  {typeof props.price === "number"
                      ? props.price.toLocaleString()
                      : "N/A"}{" "}
                      {/* Hiển thị giá, định dạng số */}₫</span>
                    <p>{props.description}</p>
                  </div>
                </div>

                {/* Mô tả sản phẩm */}

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
    </>
  );
}

export default ProductCard;
