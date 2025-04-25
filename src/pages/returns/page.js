import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import TopMenu from '../../components/TopMenu';
import MainHeader from '../../components/MainHeader';
import SubMenu from '../../components/SubMenu';
import Footer from '../../components/Footer';

export default function Returns() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [returnRequests, setReturnRequests] = useState([]);
    const [orders, setOrders] = useState({});
    const [orderItems, setOrderItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                // Fetch return requests
                const returnsRes = await fetch(`http://localhost:9999/returnRequests?user_id=${currentUser.id}`);
                const returnsData = await returnsRes.json();
                setReturnRequests(returnsData);

                // Fetch orders
                const orderIds = returnsData.map(r => r.order_id);
                const ordersRes = await fetch(`http://localhost:9999/orders?ids=${orderIds.join(',')}`);
                const ordersData = await ordersRes.json();
                const ordersMap = {};
                ordersData.forEach(o => {
                    ordersMap[o.id] = o;
                });
                setOrders(ordersMap);

                // Fetch order items
                const orderItemsRes = await fetch(`http://localhost:9999/orderItems?order_ids=${orderIds.join(',')}`);
                const orderItemsData = await orderItemsRes.json();
                setOrderItems(orderItemsData);

                // Fetch products
                const productIds = [...new Set(orderItemsData.map(item => item.product_id))];
                const productsRes = await fetch(`http://localhost:9999/products?ids=${productIds.join(',')}`);
                const productsData = await productsRes.json();
                const productsMap = {};
                productsData.forEach(p => {
                    productsMap[p.id] = p;
                });
                setProducts(productsMap);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const getOrderItems = (orderId) => {
        return orderItems.filter(item => item.order_id === orderId);
    };

    const filteredReturns = returnRequests.filter(returnRequest => {
        const order = orders[returnRequest.order_id];
        const orderItemsList = getOrderItems(returnRequest.order_id);
        const matchesSearch = order?.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderItemsList.some(item => products[item.product_id]?.title.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "all" || returnRequest.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "text-yellow-600";
            case "approved": return "text-green-600";
            case "rejected": return "text-red-600";
            default: return "text-gray-600";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                Please <span onClick={() => navigate("/auth")} className="text-blue-500 underline cursor-pointer">login</span> to view return requests.
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
                    <Package size={24} /> Return Requests
                </h2>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search returns..."
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
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading...</div>
                ) : filteredReturns.length === 0 ? (
                    <div className="text-center text-gray-600">No return requests found.</div>
                ) : (
                    <div className="space-y-6">
                        {filteredReturns.map((returnRequest) => {
                            const order = orders[returnRequest.order_id];
                            const orderItemsList = getOrderItems(returnRequest.order_id);
                            return (
                                <div key={returnRequest.id} className="border rounded-lg p-6 bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Return #{returnRequest.id}</h3>
                                            <p className="text-gray-600">Order #{order?.order_id}</p>
                                            <p className="text-gray-600">Requested on {formatDate(returnRequest.created_at)}</p>
                                        </div>
                                        <div className={`font-semibold ${getStatusColor(returnRequest.status)}`}>
                                            {returnRequest.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="font-medium">Return Reason</p>
                                            <p className="text-gray-600">{returnRequest.reason}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-2">Return Items</h4>
                                        <div className="space-y-2">
                                            {orderItemsList.map((item) => {
                                                const product = products[item.product_id];
                                                return (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div>
                                                            <p className="font-medium">{product?.title}</p>
                                                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</p>
                                                            <p className="text-sm text-gray-600">${item.unit_price} each</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
} 