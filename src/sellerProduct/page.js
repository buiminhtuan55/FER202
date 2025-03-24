import React, { useState, useEffect } from "react";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: 0,
    categoryId: 1,
    url: "",
    status: "available",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sản phẩm từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:9999/products");
        if (!response.ok) throw new Error("Không thể lấy danh sách sản phẩm.");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Thêm hoặc sửa sản phẩm
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productToSave = editingProduct
      ? { ...editingProduct }
      : { ...newProduct, id: `prod${Date.now()}` }; // Tạo ID tạm thời nếu thêm mới

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct
        ? `http://localhost:9999/products/${productToSave.id}`
        : "http://localhost:9999/products";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      });
      if (!response.ok) throw new Error("Không thể lưu sản phẩm.");

      const savedProduct = await response.json();
      if (editingProduct) {
        setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
      } else {
        setProducts([...products, savedProduct]);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ title: "", description: "", price: 0, categoryId: 1, url: "", status: "available" });
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      alert("Không thể lưu sản phẩm. Vui lòng thử lại.");
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      const response = await fetch(`http://localhost:9999/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Không thể xóa sản phẩm.");
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  // Mở modal để sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Quản lý sản phẩm bán hàng</h2>
      <p className="text-gray-600 mb-6">Tạo, chỉnh sửa và xóa sản phẩm của bạn.</p>

      {/* Nút thêm sản phẩm */}
      <button
        onClick={() => {
          setEditingProduct(null);
          setIsModalOpen(true);
        }}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Thêm sản phẩm
      </button>

      {/* Danh sách sản phẩm */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Hình ảnh</th>
              <th className="p-2 text-left">Tên sản phẩm</th>
              <th className="p-2 text-left">Mô tả</th>
              <th className="p-2 text-left">Giá (£)</th>
              <th className="p-2 text-left">Danh mục</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-2">
                    <img src={`${product.url}/50`} alt={product.title} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="p-2">{product.title}</td>
                  <td className="p-2">{product.description}</td>
                  <td className="p-2">£{(product.price / 100).toFixed(2)}</td>
                  <td className="p-2">{product.categoryId}</td>
                  <td className="p-2">{product.status}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-500 hover:underline mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h3>
            <form onSubmit={handleSaveProduct}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.title : newProduct.title}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, title: e.target.value })
                      : setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: Brown Leather Bag"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: Handcrafted genuine leather bag..."
                  rows="3"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Giá (penny)</label>
                <input
                  type="number"
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) })
                      : setNewProduct({ ...newProduct, price: parseInt(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: 2500 (25.00 GBP)"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">ID Danh mục</label>
                <input
                  type="number"
                  value={editingProduct ? editingProduct.categoryId : newProduct.categoryId}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, categoryId: parseInt(e.target.value) })
                      : setNewProduct({ ...newProduct, categoryId: parseInt(e.target.value) })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">URL hình ảnh</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.url : newProduct.url}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, url: e.target.value })
                      : setNewProduct({ ...newProduct, url: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  placeholder="Ví dụ: https://picsum.photos/id/7"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={editingProduct ? editingProduct.status : newProduct.status}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, status: e.target.value })
                      : setNewProduct({ ...newProduct, status: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="available">Có sẵn</option>
                  <option value="sold">Đã bán</option>
                  <option value="unavailable">Không có sẵn</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;