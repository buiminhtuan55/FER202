import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Search, ArrowRight, Eye } from "lucide-react";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function OrderHistory() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    const orderStatuses = {
        paid: { label: "Đã thanh toán", color: "text-green-600" },
        return_pending: { label: "Đang xử lý hoàn trả", color: "text-purple-600" },
        return_approved: { label: "Đã chấp nhận hoàn trả", color: "text-indigo-600" },
        return_rejected: { label: "Từ chối hoàn trả", color: "text-red-600" },
        returned: { label: "Đã hoàn trả", color: "text-gray-600" }
    };

    const getOrderItems = (orderId) => {
        return orderItems.filter(item => item.orderId === orderId);
    };

    const getOrderTotal = (orderId) => {
        const items = getOrderItems(orderId);
        return items.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (item.quantity * (product?.price || 0));
        }, 0).toFixed(2);
    };

    const getStatusColor = (status) => {
        return orderStatuses[status]?.color || "text-gray-600";
    };

    const getStatusLabel = (status) => {
        return orderStatuses[status]?.label || status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return "N/A";
        }
    };

    // Tính toán phân trang
    const calculatePagination = () => {
        const filtered = orders.filter(order => {
            const orderItemsList = getOrderItems(order.id);
            const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                orderItemsList.some(item => products[item.productId]?.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === "all" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        const total = Math.max(1, Math.ceil(filtered.length / ordersPerPage));
        const lastIndex = currentPage * ordersPerPage;
        const firstIndex = lastIndex - ordersPerPage;
        const current = filtered.slice(firstIndex, lastIndex);

        return {
            totalPages: total,
            currentOrders: current,
            filteredOrders: filtered
        };
    };

    // Lấy page từ URL khi component mount
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const page = parseInt(searchParams.get('page')) || 1;
        setCurrentPage(page);
    }, [location.search]);

    // Reset về trang 1 khi filter hoặc search thay đổi
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('page');
        navigate(`?${searchParams.toString()}`);
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);

    const { totalPages, currentOrders, filteredOrders } = calculatePagination();

    // Cập nhật URL khi page thay đổi
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            // Cập nhật state trước
            setCurrentPage(newPage);
            
            // Sau đó cập nhật URL
            const searchParams = new URLSearchParams(location.search);
            searchParams.set('page', newPage.toString());
            navigate(`?${searchParams.toString()}`);
            
            // Cuộn lên đầu trang
            window.scrollTo(0, 0);
        }
    }, [currentPage, totalPages, filteredOrders.length, location.search, navigate]);

    const fetchData = async () => {
        if (!currentUser) return;
        try {
            // Fetch orders
            const ordersRes = await fetch(`http://localhost:9999/orders?buyerId=${currentUser.id}`);
            const ordersData = await ordersRes.json();
            setOrders(ordersData);

            // Fetch order items - sửa lại query để lấy tất cả orderItems của các đơn hàng
            const orderItemsPromises = ordersData.map(order => 
                fetch(`http://localhost:9999/orderItems?orderId=${order.id}`).then(res => res.json())
            );
            const orderItemsArrays = await Promise.all(orderItemsPromises);
            const allOrderItems = orderItemsArrays.flat();
            
            setOrderItems(allOrderItems);

            // Fetch products - sửa lại query để lấy tất cả products
            const productIds = [...new Set(allOrderItems.map(item => item.productId))];
            const productsPromises = productIds.map(id =>
                fetch(`http://localhost:9999/products/${id}`).then(res => res.json())
            );
            const productsArray = await Promise.all(productsPromises);
            const productsMap = {};
            productsArray.forEach(p => {
                if (p) productsMap[p.id] = p;
            });
            setProducts(productsMap);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };
    const getProductName = (productId) => {
        const product = products[productId];
        return product ? product.title : 'Unknown';
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const handleReturnRequest = async (order) => {
        setSelectedOrder(order);
        setShowReturnForm(true);
    };

    const submitReturnRequest = async () => {
        if (!selectedOrder || (!returnReason && !customReason)) {
            alert('Vui lòng điền lý do hoàn trả');
            return;
        }

        try {
            const finalReason = returnReason === "other" ? customReason : returnReason;
            
            // Tạo yêu cầu hoàn trả
            const returnData = {
                orderId: selectedOrder.id,
                userId: currentUser.id,
                reason: finalReason,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            // Gửi yêu cầu hoàn trả
            const returnResponse = await fetch('http://localhost:9999/returnRequests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(returnData)
            });

            if (returnResponse.ok) {
                // Cập nhật trạng thái đơn hàng thành "return_pending"
                const orderUpdateResponse = await fetch(`http://localhost:9999/orders/${selectedOrder.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: "return_pending"
                    })
                });

                if (orderUpdateResponse.ok) {
                    // Cập nhật state local
                    const updatedOrders = orders.map(order => {
                        if (order.id === selectedOrder.id) {
                            return { ...order, status: "return_pending" };
                        }
                        return order;
                    });
                    setOrders(updatedOrders);
                    
                    alert('Yêu cầu hoàn trả đã được gửi thành công');
                    setShowReturnForm(false);
                } else {
                    alert('Không thể cập nhật trạng thái đơn hàng');
                }
            } else {
                alert('Không thể gửi yêu cầu hoàn trả');
            }
        } catch (error) {
            console.error('Error submitting return request:', error);
            alert('Lỗi khi gửi yêu cầu hoàn trả');
        }
    };

    const viewOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };
    // Component phân trang
    const Pagination = useCallback(() => {
        // Không hiển thị phân trang nếu không có đơn hàng hoặc chỉ có 1 trang
        if (totalPages <= 1 || filteredOrders.length === 0) {
            return null;
        }

        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Hàm xử lý click cho nút "Sau"
        const handleNextClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePageChange(currentPage + 1);
        };

        // Hàm xử lý click cho nút "Trước"
        const handlePrevClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePageChange(currentPage - 1);
        };

        // Hàm xử lý click cho nút số trang
        const handlePageClick = (e, pageNum) => {
            e.preventDefault();
            e.stopPropagation();
            handlePageChange(pageNum);
        };

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                    type="button"
                    onClick={handlePrevClick}
                    disabled={currentPage <= 1}
                    className={`px-3 py-1 rounded ${currentPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    Trước
                </button>
                
                <div className="flex space-x-1">
                    {startPage > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePageChange(1);
                                }}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="px-2">...</span>}
                        </>
                    )}

                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            type="button"
                            onClick={(e) => handlePageClick(e, number)}
                            className={`px-3 py-1 rounded ${
                                currentPage === number
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {number}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="px-2">...</span>}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handlePageChange(totalPages);
                                }}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleNextClick}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 rounded ${currentPage >= totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    Sau
                </button>

                <div className="text-sm text-gray-500 ml-4">
                    Trang {currentPage} / {totalPages}
                </div>
            </div>
        );
    }, [currentPage, totalPages, filteredOrders.length, handlePageChange]);

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                Vui lòng <span onClick={() => navigate("/auth")} className="text-blue-500 underline cursor-pointer">đăng nhập</span> để xem lịch sử đơn hàng.
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
                    <FileText size={24} /> Lịch sử đơn hàng
                </h2>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(orderStatuses).map(([value, { label }]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Đang tải...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center text-gray-600">Không tìm thấy đơn hàng nào.</div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {currentOrders.map((order) => (
                                <div key={order.id} className="border rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm text-gray-500">Mã đơn hàng: <span className="font-semibold">{order.id}</span></div>
                                        <div className="text-sm text-gray-500">{formatDate(order.order_date || order.orderDate || order.created_at)}</div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                        {getOrderItems(order.id).slice(0, 3).map((item) => {
                                            const product = products[item.productId];
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="border p-3 rounded-md bg-gray-50 cursor-pointer hover:shadow"
                                                    onClick={() => product && navigate(`/product/${product.id}`)}
                                                >
                                                    {Array.isArray(product?.images) && product.images.length > 0 && product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.title}
                                                            className="w-full h-24 object-cover rounded mb-2 opacity-90 hover:opacity-100 transition"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                                                    )}
                                                    <div className="font-semibold mb-1 text-sm truncate">{product?.title}</div>
                                                    <div className="text-xs text-gray-600">Số lượng: {item.quantity}</div>
                                                    <div className="text-xs text-gray-600">Giá: £{item.unitPrice || product?.price || 0}</div>
                                                </div>
                                            );
                                        })}
                                        {getOrderItems(order.id).length > 3 && (
                                            <div className="border p-3 rounded-md bg-gray-50 flex items-center justify-center">
                                                <button
                                                    onClick={() => viewOrderDetail(order)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    +{getOrderItems(order.id).length - 3} sản phẩm khác
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Status and Actions */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>Trạng thái: <span className={`font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span></div>
                                            <div>Tổng tiền: <span className="font-semibold">£{Number(order.totalPrice || 0).toFixed(2)}</span></div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                onClick={() => viewOrderDetail(order)}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2"
                                            >
                                                <Eye size={16} />
                                                <span>Xem chi tiết</span>
                                            </button>
                                            
                                            {order.status === "paid" && (
                                                <button
                                                    onClick={() => handleReturnRequest(order)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                                                >
                                                    <span>Yêu cầu hoàn trả đơn hàng</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination />
                    </>
                )}
            </div>

            {/* Return Request Form Modal */}
            {showReturnForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-xl font-bold mb-4">Yêu cầu hoàn trả</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lý do hoàn trả</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                >
                                    <option value="">Chọn lý do</option>
                                    <option value="damaged">Sản phẩm bị hỏng</option>
                                    <option value="wrong_item">Nhận sai sản phẩm</option>
                                    <option value="not_as_described">Không đúng mô tả</option>
                                    <option value="changed_mind">Thay đổi ý định</option>
                                    <option value="other">Lý do khác</option>
                                </select>
                            </div>
                            
                            {returnReason === "other" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nhập lý do</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        rows="3"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Nhập lý do hoàn trả của bạn..."
                                    ></textarea>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setShowReturnForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={submitReturnRequest}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Gửi yêu cầu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
                        <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                        
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="font-semibold mb-2">Thông tin đơn hàng</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Ngày đặt:</span> {new Date(selectedOrder.order_date).toLocaleDateString('vi-VN')}</p>
                                    <p><span className="font-medium">Trạng thái:</span> <span className={getStatusColor(selectedOrder.status)}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span></p>
                                    <p><span className="font-medium">Tổng tiền:</span> £{Number(selectedOrder.totalPrice || 0).toFixed(2)}</p>
                                    {selectedOrder.discount > 0 && (
                                      <p><span className="font-medium">Giảm giá đã áp dụng:</span> -£{Number(selectedOrder.discount / 100).toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold mb-2">Địa chỉ giao hàng</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.shipping_address?.address || 'Không có thông tin'}</p>
                                    <p><span className="font-medium">Thành phố:</span> {selectedOrder.shipping_address?.city || 'Không có'}</p>
                                    <p><span className="font-medium">Mã bưu điện:</span> {selectedOrder.shipping_address?.zipcode || 'Không có'}</p>
                                    <p><span className="font-medium">Quốc gia:</span> {selectedOrder.shipping_address?.country || 'Không có thông tin'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <h4 className="font-semibold mb-2">Sản phẩm</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {
                                    orderItems
                                    .filter(item => item.orderId === selectedOrder.id) 
                                    .map((item, index) => {
                                        const product = products[item.productId];
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <button
                                                        className="text-blue-600 hover:underline"
                                                        onClick={() => product && navigate(`/product/${product.id}`)}
                                                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                    >
                                                        {product ? product.title : getProductName(item.productId)}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">{item.quantity}</td>
                                                <td className="px-6 py-4">£{item.unitPrice.toFixed(2)}</td>
                                                <td className="px-6 py-4">£{(item.quantity * item.unitPrice).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                }

                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-right font-medium">Tổng tiền:</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">£{Number(selectedOrder.totalPrice || 0).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowOrderDetail(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

