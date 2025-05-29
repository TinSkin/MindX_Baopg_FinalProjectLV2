import React, { useState, useEffect } from "react";

// Import Components
import ProductCard from "./ProductCard";

function ProductList({ displayedProducts }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedProducts.map((prod) => (
          <ProductCard key={prod.id} {...prod} />
        ))}
      </div>
    </>
  );
}

export default ProductList;
