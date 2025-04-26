import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [avatarURL, setAvatarURL] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    street: "",
    zipcode: "",
    city: "",
    country: "",
    addressId: null,
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUser(currentUser);
    setAvatarURL(currentUser.avatarURL || "https://via.placeholder.com/100");
    fetch(`http://localhost:9999/address?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(addresses => {
        let addr = addresses && addresses.length > 0 ? addresses[0] : null;
        setFormData({
          fullname: currentUser.fullname || currentUser.username || "",
          street: addr?.street || currentUser.address?.street || "",
          zipcode: addr?.zipcode || currentUser.address?.zipcode || "",
          city: addr?.city || currentUser.address?.city || "",
          country: addr?.country || currentUser.address?.country || "",
          addressId: addr?.id || null,
        });
      });
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChangeInfo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let avatarUploadURL = avatarURL;
      if (avatarFile) {
        avatarUploadURL = avatarURL;
      }
      const userRes = await fetch(`http://localhost:9999/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: formData.fullname,
          avatarURL: avatarUploadURL,
        }),
      });
      if (!userRes.ok) throw new Error("Cập nhật user thất bại");
      const updatedUser = await userRes.json();
      let addressRes;
      if (formData.addressId) {
        addressRes = await fetch(`http://localhost:9999/address/${formData.addressId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: formData.street,
            zipcode: formData.zipcode,
            city: formData.city,
            country: formData.country,
            userId: user.id,
            fullName: formData.fullname,
          }),
        });
      } else {
        addressRes = await fetch(`http://localhost:9999/address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            street: formData.street,
            zipcode: formData.zipcode,
            city: formData.city,
            country: formData.country,
            userId: user.id,
            fullName: formData.fullname,
          }),
        });
      }
      if (!addressRes.ok) throw new Error("Cập nhật địa chỉ thất bại");
      const updatedUserFull = { ...updatedUser, avatarURL: avatarUploadURL };
      localStorage.setItem("currentUser", JSON.stringify(updatedUserFull));
      setUser(updatedUserFull);
      setSuccess("Cập nhật thành công!");
    } catch (err) {
      setError("Không thể cập nhật thông tin cá nhân.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (passwordData.oldPassword !== user.password) {
      setError("Mật khẩu cũ không đúng");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:9999/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordData.newPassword }),
        }
      );
      if (!response.ok) throw new Error("Đổi mật khẩu thất bại");
      const updated = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(updated));
      setUser(updated);
      setSuccess("Đổi mật khẩu thành công!");
      setShowChangePassword(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError("Không thể đổi mật khẩu.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded relative">
      {/* Nút Back to Home */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200 text-sm"
      >
        ← Về trang chủ
      </button>


      <h2 className="text-2xl font-semibold mb-6 text-center">Thông tin cá nhân</h2>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <form onSubmit={handleChangeInfo} className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={avatarURL || "https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <button
            type="button"
            className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-sm"
            onClick={() => fileInputRef.current.click()}
          >
            Chọn ảnh khác
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Họ tên</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={formData.fullname}
            onChange={e => setFormData({ ...formData, fullname: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Địa chỉ</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Đường/phố"
            value={formData.street}
            onChange={e => setFormData({ ...formData, street: e.target.value })}
          />
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Mã bưu điện"
            value={formData.zipcode}
            onChange={e => setFormData({ ...formData, zipcode: e.target.value })}
          />
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Thành phố"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
          />
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Quốc gia"
            value={formData.country}
            onChange={e => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Cập nhật thông tin</button>
      </form>
      <hr className="my-6" />
      <button
        className="text-blue-600 underline mb-4"
        onClick={() => setShowChangePassword(!showChangePassword)}
      >
        {showChangePassword ? "Đóng đổi mật khẩu" : "Đổi mật khẩu"}
      </button>
      {showChangePassword && (
        <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
          <div>
            <label className="block mb-1 font-medium">Mật khẩu cũ</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={passwordData.oldPassword}
              onChange={e => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={passwordData.newPassword}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={passwordData.confirmPassword}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Đổi mật khẩu</button>
        </form>
      )}
    </div>
  );
}
