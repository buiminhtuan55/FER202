import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Edit, Trash2, Check, X } from "lucide-react";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function UserAddress() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    zipcode: "",
    country: "",
    isDefault: false,
  });
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Lấy thông tin người dùng hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    if (!currentUser) return;
    fetchAddresses();
  }, [currentUser]);

  const fetchAddresses = async () => {
    try {
      // Giả định rằng API cho phép lấy địa chỉ của người dùng
      const response = await fetch(
        `http://localhost:9999/address?userId=${currentUser.id}`
      );
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách địa chỉ");
      }
      const data = await response.json();
      setAddresses(data);

      // Tìm địa chỉ mặc định nếu có
      const defaultAddress = data.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setDefaultAddressId(defaultAddress.id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setLoading(false);
    }
  };

  const handleOpenForm = (address = null) => {
    if (address) {
      // Chỉnh sửa địa chỉ hiện có
      setFormData({
        street: address.street || "",
        city: address.city || "",
        zipcode: address.zipcode || "",
        country: address.country || "",
        isDefault: address.isDefault || false,
      });
      setEditingAddress(address);
    } else {
      // Thêm địa chỉ mới
      setFormData({
        street: "",
        city: "",
        zipcode: "",
        country: "",
        isDefault: addresses.length === 0, // Nếu không có địa chỉ nào, đặt địa chỉ mới là mặc định
      });
      setEditingAddress(null);
    }
    setShowAddressForm(true);
  };

  const handleCloseForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setFormData({
      street: "",
      city: "",
      zipcode: "",
      country: "",
      isDefault: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.street ||
      !formData.city ||
      !formData.zipcode ||
      !formData.country
    ) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      const addressData = {
        ...formData,
        userId: currentUser.id,
      };

      let response;

      if (editingAddress) {
        // Cập nhật địa chỉ
        response = await fetch(
          `http://localhost:9999/address/${editingAddress.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          }
        );
      } else {
        // Thêm địa chỉ mới
        response = await fetch("http://localhost:9999/address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        });
      }

      if (!response.ok) {
        throw new Error("Không thể lưu địa chỉ");
      }

      // Nếu đây là địa chỉ mặc định mới, cập nhật các địa chỉ khác
      if (formData.isDefault) {
        // Cập nhật toàn bộ danh sách địa chỉ
        await fetchAddresses();
      } else {
        // Chỉ cập nhật địa chỉ này
        const updatedAddress = await response.json();

        if (editingAddress) {
          // Thay thế địa chỉ cũ bằng địa chỉ mới
          setAddresses(
            addresses.map((addr) =>
              addr.id === updatedAddress.id ? updatedAddress : addr
            )
          );
        } else {
          // Thêm địa chỉ mới vào danh sách
          setAddresses([...addresses, updatedAddress]);
        }
      }

      alert(
        editingAddress
          ? "Cập nhật địa chỉ thành công"
          : "Thêm địa chỉ thành công"
      );
      handleCloseForm();
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Đã xảy ra lỗi khi lưu địa chỉ");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // Đặt địa chỉ này là mặc định
      await fetch(`http://localhost:9999/address/${addressId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDefault: true }),
      });

      // Cập nhật các địa chỉ khác không phải là mặc định
      const otherAddresses = addresses.filter((addr) => addr.id !== addressId);
      for (const addr of otherAddresses) {
        if (addr.isDefault) {
          await fetch(`http://localhost:9999/address/${addr.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isDefault: false }),
          });
        }
      }

      // Cập nhật lại danh sách địa chỉ
      await fetchAddresses();

      setDefaultAddressId(addressId);
      alert("Đã đặt làm địa chỉ mặc định");
    } catch (error) {
      console.error("Error setting default address:", error);
      alert("Không thể đặt địa chỉ mặc định");
    }
  };

  const handleDeleteConfirm = (addressId) => {
    setDeleteConfirmation(addressId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await fetch(`http://localhost:9999/address/${addressId}`, {
        method: "DELETE",
      });

      // Cập nhật danh sách địa chỉ
      setAddresses(addresses.filter((addr) => addr.id !== addressId));

      if (defaultAddressId === addressId) {
        setDefaultAddressId(null);
      }

      setDeleteConfirmation(null);
      alert("Đã xóa địa chỉ");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Không thể xóa địa chỉ");
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-20">
        Vui lòng{" "}
        <span
          onClick={() => navigate("/auth")}
          className="text-blue-500 underline cursor-pointer"
        >
          đăng nhập
        </span>{" "}
        để quản lý địa chỉ.
      </div>
    );
  }

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <TopMenu />
      <MainHeader />
      <SubMenu />

      <div className="my-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Home size={24} /> Quản lý địa chỉ
        </h2>

        <div className="mb-6">
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Thêm địa chỉ mới</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <p className="text-gray-500">Bạn chưa có địa chỉ nào.</p>
            <p className="mt-2">
              <button
                onClick={() => handleOpenForm()}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Thêm địa chỉ mới
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 shadow-sm ${
                  address.isDefault ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="text-blue-600 text-sm font-medium mb-2">
                    Địa chỉ mặc định
                  </div>
                )}
                <div className="space-y-1 mb-4">
                  <p className="font-medium">{currentUser.fullname}</p>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.zipcode}
                  </p>
                  <p>{address.country}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(address)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Sửa
                    </button>

                    {!address.isDefault && (
                      <>
                        {deleteConfirmation === address.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                            >
                              <Check size={14} />
                              Xác nhận
                            </button>
                            <button
                              onClick={handleDeleteCancel}
                              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1"
                            >
                              <X size={14} />
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteConfirm(address.id)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ đường
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Địa chỉ chi tiết, số nhà, tên đường"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Thành phố"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã bưu điện
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mã bưu điện"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quốc gia"
                    required
                  />
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isDefault"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
