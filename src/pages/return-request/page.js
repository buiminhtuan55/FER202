import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, ArrowLeft } from "lucide-react";
import moment from "moment";

import Footer from "../../components/Footer";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";

export default function ReturnRequest() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [returnRequests, setReturnRequests] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [reason, setReason] = useState("");
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                // Fetch order details
                const orderRes = await fetch(`http://localhost:9999/orders/${orderId}`);
                const orderData = await orderRes.json();
                setOrder(orderData);

                // Fetch return requests for this order
                const returnRes = await fetch(`http://localhost:9999/return_requests?order_id=${orderId}`);
                const returnData = await returnRes.json();
                setReturnRequests(returnData);

                // Initialize selected items
                setSelectedItems(orderData.items.map(item => ({
                    ...item,
                    return_condition: "Damaged",
                    selected: false
                })));
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser, orderId]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItems.some(item => item.selected)) {
            alert("Please select at least one item to return");
            return;
        }

        const formData = new FormData();
        formData.append("order_id", orderId);
        formData.append("user_id", currentUser.id);
        formData.append("reason", reason);
        formData.append("items", JSON.stringify(selectedItems.filter(item => item.selected)));
        images.forEach(image => formData.append("images", image));

        try {
            const response = await fetch("http://localhost:9999/return_requests", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                alert("Return request submitted successfully");
                navigate("/order-history");
            } else {
                throw new Error("Failed to submit return request");
            }
        } catch (error) {
            console.error("Error submitting return request:", error);
            alert("Failed to submit return request. Please try again.");
        }
    };

    if (!currentUser) {
        return (
            <div className="text-center py-20">
                Please <span onClick={() => navigate("/auth")} className="text-blue-500 underline cursor-pointer">login</span> to submit a return request.
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (!order) {
        return <div className="text-center py-20">Order not found</div>;
    }

    return (
        <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
            <TopMenu />
            <MainHeader />
            <SubMenu />

            <div className="my-8">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/order-history")}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <ArrowLeft size={20} className="mr-1" /> Back to Order History
                    </button>
                    <h2 className="text-2xl font-bold">Return Request - Order #{order.order_id}</h2>
                </div>

                {/* Existing Return Requests */}
                {returnRequests.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Previous Return Requests</h3>
                        <div className="space-y-4">
                            {returnRequests.map((request) => (
                                <div key={request.return_id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold">Request #{request.return_id}</div>
                                            <div className="text-sm text-gray-600">
                                                Submitted on {moment(request.request_date).format("MMMM Do YYYY, h:mm A")}
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm ${
                                            request.status === "approved" ? "bg-green-100 text-green-800" :
                                            request.status === "rejected" ? "bg-red-100 text-red-800" :
                                            "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {request.status}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">Reason: {request.reason}</div>
                                    {request.admin_notes && (
                                        <div className="text-sm text-gray-600">Admin Notes: {request.admin_notes}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Return Request Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Select Items to Return</h3>
                        <div className="space-y-4">
                            {selectedItems.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={(e) => {
                                                const newItems = [...selectedItems];
                                                newItems[index].selected = e.target.checked;
                                                setSelectedItems(newItems);
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">{item.product_name}</div>
                                            <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                                            <div className="text-sm text-gray-600">Price: £{item.price}</div>
                                            <select
                                                value={item.return_condition}
                                                onChange={(e) => {
                                                    const newItems = [...selectedItems];
                                                    newItems[index].return_condition = e.target.value;
                                                    setSelectedItems(newItems);
                                                }}
                                                className="mt-2 border rounded px-2 py-1 text-sm"
                                            >
                                                <option value="Damaged">Damaged</option>
                                                <option value="Wrong Item">Wrong Item</option>
                                                <option value="Not as Described">Not as Described</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Return
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded-lg p-3"
                            rows="4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Images (Optional)
                        </label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <Upload className="text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-600">
                                    Click to upload images of the items
                                </span>
                            </label>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Upload ${index + 1}`}
                                            className="w-full h-24 object-cover rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Submit Return Request
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
} 