import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function ProductCard(props) {
  console.log(props);
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer">
      {/* Product Swiper */}

      <img
        src={props.image[0]}
        alt={props.name}
        className="w-full h-72 object-cover"
      />
      <div className="p-3 text-center">
        <h3 className="text-sm font-semibold leading-tight mb-1">
          {props.name}
        </h3>
        <p className="text-logo_color text-sm mb-2 font-semibold">
          {props.price.toLocaleString()}đ
        </p>
        <button className="bg-dark_blue hover:bg-camel text-white py-1 px-2 rounded text-sm flex items-center justify-center w-full">
          <span className="mr-1">+</span> Thêm
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
