
// Hàm handleAddProduct: Thêm sản phẩm mới
const handleAddProduct = async () => {
    setIsLoading(true); // Bật trạng thái loading

    // Lấy ID từ input
    const newId = document.getElementById("newId").value;
    // Lấy Name từ input
    const newName = document.getElementById("newName").value;
    // Lấy URL ảnh từ input
    const newImageInput = document.getElementById("newImages").value;
    // Lấy Price từ input
    const newPrice = document.getElementById("newPrice").value;
    // Lấy Topping từ input
    const toppingCheckboxes = document.querySelectorAll(".topping-checkbox:checked");
    const selectedToppings = Array.from(toppingCheckboxes).map((checkbox) => ({
        name: checkbox.value,
        price: parseFloat(checkbox.dataset.price),
    }));


    if (!newId || !newName || !newPrice || !newImageInput) {
        // Kiểm tra nếu thiếu thông tin
        console.log(
            "Lỗi: Vui lòng nhập đầy đủ thông tin: ID, Tên, Giá, và URL ảnh."
        );
        alert("Vui lòng nhập đầy đủ thông tin: ID, Tên, Giá, và URL ảnh.");
        setIsLoading(false);
        //   return;
    }

    const images = newImageInput // Tách URL ảnh thành mảng
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
    if (images.length === 0) {
        // Kiểm tra nếu không có URL ảnh hợp lệ
        console.log("Lỗi: Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
        alert("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
        setIsLoading(false);
        return;
    }

    const newProduct = {
        // Tạo object sản phẩm mới
        id: newId,
        name: newName,
        images,
        price: parseInt(newPrice),
        date: new Date().toLocaleDateString("vi-VN", {
            // Tạo ngày hiện tại theo định dạng tiếng Việt
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        status: "available",
    };

    //Todo: Hiện tại tới dòng này
    try {
        const currentResult = await fetchProducts(); // Lấy danh sách sản phẩm hiện tại từ server
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
            // Loại bỏ sản phẩm trùng lặp
            new Map(currentProducts.map((item) => [item.id, item])).values()
        );

        const isIdExists = uniqueCurrentProducts.some(
            // Kiểm tra nếu ID đã tồn tại
            (product) => product.id === newId
        );
        if (isIdExists) {
            console.log("Lỗi: Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
            alert("Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
            setIsLoading(false);
            return;
        }

        const updatedProducts = [...uniqueCurrentProducts, newProduct]; // Thêm sản phẩm mới vào danh sách

        const response = await fetch(
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server response status:", response.status);
            console.error("Server response text:", errorText);
            throw new Error(
                "Lỗi từ server: " + response.statusText + " - " + errorText
            );
        }

        const result = await response.json();
        console.log("Server response after adding product:", result);

        await loadProducts(); // Tải lại danh sách sản phẩm

        const addedProduct = newProduct;
        console.log("Added product:", addedProduct);

        setShowAddModal(false); // Đóng modal
        setImagePreviews([]); // Reset preview ảnh
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        alert("Thêm thất bại. Thử lại sau.");
    } finally {
        setIsLoading(false);
    }
};

// Hàm handleUpdateProduct: Cập nhật sản phẩm
const handleUpdateProduct = async () => {
    setIsLoading(true);

    const updatedId = document.getElementById("editId").value;
    const updatedName = document.getElementById("editName").value;
    const updatedImageInput = document.getElementById("editImages").value;
    const updatedPrice = document.getElementById("editPrice").value;

    if (!updatedId || !updatedName || !updatedPrice || !updatedImageInput) {
        alert("Vui lòng nhập đầy đủ thông tin: ID, Tên, Giá, và URL ảnh.");
        setIsLoading(false);
        return;
    }

    const images = updatedImageInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
    if (images.length === 0) {
        alert("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
        setIsLoading(false);
        return;
    }

    const updatedProduct = {
        id: updatedId,
        name: updatedName,
        images,
        price: parseInt(updatedPrice),
        date: editingProduct.date,
        status: "available",
    };

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
                product.id === updatedId && product.id !== editingProduct.id
        );
        if (isIdExists) {
            alert("Mã sản phẩm đã tồn tại. Vui lòng chọn mã khác.");
            setIsLoading(false);
            return;
        }

        const updatedProducts = uniqueCurrentProducts.map((product) =>
            product.id === editingProduct.id ? updatedProduct : product
        );

        const response = await fetch(
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
        console.log("Server response after update:", result);

        await loadProducts();

        setShowEditModal(false);
        setImagePreviews([]);
        setEditingProduct(null);
    } catch (error) {
        console.error("Lỗi khi chỉnh sửa sản phẩm:", error);
        alert(`Chỉnh sửa thất bại: ${error.message}. Thử lại sau.`);
    } finally {
        setIsLoading(false);
    }
};

// Form Add Product Modal
<div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
    <h2 className="text-xl font-bold text-green_starbuck">Thêm sản phẩm mới</h2>
    {/* Add Id */}
    <input
        type="text"
        placeholder="ID"
        className="w-full p-2 border rounded"
        id="newId"
    />
    {/* Add Name */}
    <input
        type="text"
        placeholder="Tên sản phẩm"
        className="w-full p-2 border rounded"
        id="newName"
    />
    {/* Add Image */}
    <input
        type="text"
        placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
        className="w-full p-2 border rounded"
        id="newImages"
        onChange={handleImageInputChange}
    />
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
    {/* Add Price */}
    <input
        type="number"
        placeholder="Giá (VNĐ)"
        className="w-full p-2 border rounded"
        id="newPrice"
    />
    {/* Add Size */}
    <div>
        <label className="block font-medium mb-1">Chọn giá theo size</label>
        {["S", "M", "L"].map((size) => (
            <div key={size} className="flex items-center gap-2 mb-2">
                <span className="w-6">{size}</span>
                <input
                    type="number"
                    placeholder={`Giá size ${size}`}
                    className="flex-1 p-2 border rounded"
                    id={`priceSize${size}`}
                />
            </div>
        ))}
    </div>

    {/* Add Topping */}
    <div>
        <label className="block font-medium mb-1">Chọn Topping</label>
        {availableToppings.map((topping, index) => (
            <label key={index} className="flex items-center mb-1">
                <input
                    type="checkbox"
                    value={topping.name}
                    data-price={topping.price}
                    className="mr-2 topping-checkbox"
                />
                {topping.name} (+{topping.price.toLocaleString("vi-VN")}₫)
            </label>
        ))}
    </div>
    {/* Add Date */}
    <input
        type="text"
        disabled
        value={new Date().toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })}
        className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
        id="newDate"
    />
    <div className="flex justify-end space-x-2">
        <button
            onClick={() => {
                setShowAddModal(false);
                setImagePreviews([]);
            }}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            disabled={isLoading}
        >
            Hủy
        </button>
        <button
            onClick={handleAddProduct}
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

</div>

// Form Edit Product Modal
{/* 
<div className="bg-white p-6 rounded shadow-md w-[400px] space-y-4">
    <h2 className="text-xl font-bold">Chỉnh sửa sản phẩm</h2>
    <input
        type="text"
        placeholder="ID"
        className="w-full p-2 border rounded"
        id="editId"
        defaultValue={editingProduct.id}
    />
    <input
        type="text"
        placeholder="Tên sản phẩm"
        className="w-full p-2 border rounded"
        id="editName"
        defaultValue={editingProduct.name}
    />
    <input
        type="text"
        placeholder="URL ảnh (dùng dấu phẩy để nhập nhiều URL)"
        className="w-full p-2 border rounded"
        id="editImages"
        defaultValue={editingProduct.image.join(", ")}
        onChange={handleImageInputChange}
    />
    <div className="flex flex-wrap gap-2">
        {imagePreviews.map((src, idx) => (
        <img
            key={idx}
            src={src}
            alt={`preview-${idx}`}
            className="w-24 h-24 object-cover rounded"
            onError={(e) =>
            (e.target.src =
            "https://via.placeholder.com/150?text=Image+Not+Found")
            }
        />
        ))}
    </div>
    <input
        type="number"
        placeholder="Giá (VNĐ)"
        className="w-full p-2 border rounded"
        id="editPrice"
        defaultValue={editingProduct.price}
    />
    <input
        type="text"
        disabled
        value={editingProduct.date}
        className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"
        id="editDate"
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
        onClick={handleUpdateProduct}
        className="relative bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
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
</div> 
    */}