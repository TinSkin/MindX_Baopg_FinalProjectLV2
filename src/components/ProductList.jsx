import React from "react";

// Import Components
import ProductCard from "./ProductCard";

// Sample Products For Testing
const sampleProducts = [
  {
    id: 2015,
    name: "Trà Xanh Chanh Leo Kem Phô Mai",
    price: 38000,
    image:
      "https://web-work.s3.kstorage.vn/uploads/upload/2023/03/upload-16-1679365987005.jpeg",
  },
  {
    id: 2016,
    name: "Trà Sữa Khoai Môn Đường Hổ",
    price: 38000,
    image:
      "https://ttol.vietnamnetjsc.vn/images/2022/07/16/08/43/tra-matcha-001-20220716.jpg",
  },
  {
    id: 2017,
    name: "Trà Xanh Đào Chanh Leo",
    price: 35000,
    image:
      "https://web-work.s3.kstorage.vn/uploads/upload/2023/03/upload-16-1679365987005.jpeg",
  },
  {
    id: 2018,
    name: "Trà Sữa Ô Long Nhài",
    price: 20000,
    image:
      "https://ttol.vietnamnetjsc.vn/images/2022/07/16/08/43/tra-matcha-001-20220716.jpg",
  },
];

function ProductList({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((prod) => (
        <ProductCard key={prod.id} {...prod} />
      ))}
    </div>
  );
}

export default ProductList;
