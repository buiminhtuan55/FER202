import React, { useState, useEffect } from "react";
import TopMenu from "../layouts/includes/TopMenu";
import MainHeader from "../layouts/includes/MainHeader";
import SubMenu from "../layouts/includes/SubMenu";
import { useNavigate } from "react-router-dom";

const SellerProducts = () => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null);
  const [productsDetails, setProductsDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: 0,
    quantity: 0,
    categoryId: 1,
    url: "",
    status: "available",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.id) {
        setError("Vui lòng đăng nhập để xem sản phẩm của bạn.");
        setLoading(false);
        return;
      }

      try {
        console.log("Current User:", currentUser);

        console.log("Fetching sellerProduct...");
        const sellerResponse = await fetch(
          `http://localhost:9999/sellerProduct?userId=${currentUser.id}`
        );
        if (!sellerResponse.ok) {
          throw new Error(
            `Không thể lấy danh sách sản phẩm của người bán: ${sellerResponse.statusText}`
          );
        }
        const sellerData = await sellerResponse.json();
        console.log("Seller Data:", sellerData);
        const seller = Array.isArray(sellerData)
          ? sellerData.find((item) => item.userId === currentUser.id)
          : sellerData;
        if (!seller) {
          throw new Error("Không tìm thấy dữ liệu sản phẩm cho người dùng này.");
        }
        setSellerData(seller);

        const productIds = seller.products.map((p) => p.idProduct);
        if (productIds.length > 0) {
          console.log("Fetching products for IDs:", productIds);
          const productsResponse = await fetch("http://localhost:9999/products");
          if (!productsResponse.ok) {
            throw new Error(`Không thể lấy chi tiết sản phẩm: ${productsResponse.statusText}`);
          }
          const allProducts = await productsResponse.json();
          console.log("All Products:", allProducts);
          const filteredProducts = allProducts.filter((product) =>
            productIds.includes(product.id)
          );
          setProductsDetails(filteredProducts);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const generateNewProductId = async () => {
    try {
      const response = await fetch("http://localhost:9999/products");
      if (!response.ok) throw new Error("Không thể lấy danh sách sản phẩm.");
      const allProducts = await response.json();
      const existingIds = allProducts.map((p) => parseInt(p.id.replace("prod", "")));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      return `prod${maxId + 1}`;
    } catch (err) {
      console.error("Error generating ID:", err);
      return `prod${Date.now()}`; // Fallback nếu không lấy được danh sách
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để thực hiện thao tác này.");
      return;
    }

    const isEditing = !!editingProduct;
    let productToSave;

    if (isEditing) {
      productToSave = { ...editingProduct, id: editingProduct.idProduct };
    } else {
      const newId = await generateNewProductId();
      productToSave = {
        id: newId,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        quantity: newProduct.quantity,
        categoryId: newProduct.categoryId,
        url: newProduct.url,
        status: newProduct.status,
      };
    }

    try {
      const productMethod = isEditing ? "PUT" : "POST";
      const productUrl = isEditing
        ? `http://localhost:9999/products/${productToSave.id}`
        : "http://localhost:9999/products";
      const productResponse = await fetch(productUrl, {
        method: productMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productToSave),
      });
      if (!productResponse.ok) throw new Error("Không thể lưu chi tiết sản phẩm.");
      const savedProduct = await productResponse.json();

      const updatedSellerProducts = isEditing
        ? sellerData.products.map((p) =>
            p.idProduct === productToSave.id ? { ...p, status: productToSave.status } : p
          )
        : [...sellerData.products, { idProduct: productToSave.id, status: productToSave.status }];
      const updatedSellerData = { ...sellerData, products: updatedSellerProducts };

      const sellerResponse = await fetch(
        `http://localhost:9999/sellerProduct/${sellerData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSellerData),
        }
      );
      if (!sellerResponse.ok) throw new Error("Không thể cập nhật danh sách sản phẩm.");

      setSellerData(updatedSellerData);
      setProductsDetails(
        isEditing
          ? productsDetails.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [...productsDetails, savedProduct]
      );
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({
        title: "",
        description: "",
        price: 0,
        quantity: 0,
        categoryId: 1,
        url: "",
        status: "available",
      });
    } catch (err) {
      console.error("Save Error:", err);
      alert("Không thể lưu sản phẩm: " + err.message);
    }
  };

  const handleDeleteProduct = async (idProduct) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

    try {
      const productResponse = await fetch(`http://localhost:9999/products/${idProduct}`, {
        method: "DELETE",
      });
      if (!productResponse.ok) throw new Error("Không thể xóa sản phẩm.");

      const updatedProducts = sellerData.products.filter((p) => p.idProduct !== idProduct);
      const updatedSellerData = { ...sellerData, products: updatedProducts };

      const sellerResponse = await fetch(
        `http://localhost:9999/sellerProduct/${sellerData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSellerData),
        }
      );
      if (!sellerResponse.ok) throw new Error("Không thể cập nhật danh sách sản phẩm.");

      setSellerData(updatedSellerData);
      setProductsDetails(productsDetails.filter((p) => p.id !== idProduct));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Không thể xóa sản phẩm: " + err.message);
    }
  };

  const handleEditProduct = (product) => {
    const detailedProduct = productsDetails.find((p) => p.id === product.idProduct);
    setEditingProduct({
      idProduct: product.idProduct,
      title: detailedProduct?.title || "",
      description: detailedProduct?.description || "",
      price: detailedProduct?.price || 0,
      quantity: detailedProduct?.quantity || 0,
      categoryId: detailedProduct?.categoryId || 1,
      url: detailedProduct?.url || "",
      status: product.status,
    });
    setIsModalOpen(true);
  };

  if (!currentUser || !currentUser.id) {
    return (
      <div className="p-4 text-center">
        Vui lòng đăng nhập để quản lý sản phẩm của bạn.
      </div>
    );
  }

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  if (!sellerData || !sellerData.products)
    return <div className="p-4">Không có dữ liệu sản phẩm.</div>;

  return (
    <div>
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quản lý sản phẩm bán hàng</h2>
          <button
            onClick={() => navigate('/totalSell')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Xem doanh thu
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Quản lý sản phẩm của bạn (Người dùng ID: {currentUser.id}).
        </p>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Thêm sản phẩm
        </button>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Hình ảnh</th>
                <th className="p-2 text-left">ID Sản phẩm</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-left">Mô tả</th>
                <th className="p-2 text-left">Giá (£)</th>
                <th className="p-2 text-left">Số lượng</th>
                <th className="p-2 text-left">Danh mục</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sellerData.products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">
                    Chưa có sản phẩm nào.
                  </td>
                </tr>
              ) : (
                sellerData.products.map((product) => {
                  const detail = productsDetails.find((p) => p.id === product.idProduct) || {};
                  return (
                    <tr key={product.idProduct} className="border-b">
                      <td className="p-2">
                        {detail.url ? (
                          <img
                            src={`${detail.url}/50`}
                            alt={detail.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2">{product.idProduct}</td>
                      <td className="p-2">{detail.title || "N/A"}</td>
                      <td className="p-2">{detail.description || "N/A"}</td>
                      <td className="p-2">£{(detail.price / 100 || 0).toFixed(2)}</td>
                      <td className="p-2">{detail.quantity || 0}</td>
                      <td className="p-2">{detail.categoryId || "N/A"}</td>
                      <td className="p-2">{product.status}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-500 hover:underline mr-2"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.idProduct)}
                          className="text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <form onSubmit={handleSaveProduct}>
                {editingProduct && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">ID Sản phẩm</label>
                    <input
                      type="text"
                      value={editingProduct.idProduct}
                      className="w-full p-2 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                )}
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
                    value={
                      editingProduct ? editingProduct.description : newProduct.description
                    }
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
                  <label className="block text-gray-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })
                        : setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Ví dụ: 10"
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">ID Danh mục</label>
                  <input
                    type="number"
                    value={
                      editingProduct ? editingProduct.categoryId : newProduct.categoryId
                    }
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({
                            ...editingProduct,
                            categoryId: parseInt(e.target.value),
                          })
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
    </div>
  );
};

export default SellerProducts;