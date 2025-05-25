import React from "react";

// Sample Products For Testing
const categories = [
  { name: "Món Nổi Bật", count: 64 },
  { name: "Instant Milk Tea", count: 0 },
  { name: "Trà Sữa", count: 18 },
  { name: "Fresh Fruit Tea", count: 8 },
  { name: "Macchiato Cream Cheese", count: 8 },
  { name: "Cà Phê", count: 2 },
  { name: "Ice Cream", count: 5 },
  { name: "Special Menu", count: 11 },
];

function Category() {
  return (
    <div className="bg-white shadow w-60 rounded-md">
      <div className="bg-dark_blue p-4 rounded-tr-md rounded-tl-md">
        <h2 className="font-semibold text-white text-center">Danh Mục</h2>
      </div>
      <ul className="p-4">
        {categories.map((cat, index) => (
          <li
            key={index}
            className="flex justify-between py-2 px-2 hover:bg-camel rounded cursor-pointer text-dark_blue  hover:text-white"
          >
            <span>{cat.name}</span>
            <span className="text-sm font-semibold">{cat.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Category;
