import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState(null)
    const [activeTab, setActiveTab] = useState("all")
    const navigate = useNavigate()

    useEffect(() => {
        const user = localStorage.getItem('currentUser')
        if (user) {
            setCurrentUser(JSON.parse(user))
        } else {
            navigate('/auth')
        }
    }, [navigate])

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!currentUser) return

            try {
                setLoading(true)
                const response = await fetch(`http://localhost:9999/messages?user_id=${currentUser.id}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch notifications: ${response.status}`)
                }
                const data = await response.json()
                setNotifications(data)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching notifications:', error)
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [currentUser])

    const markNotificationAsRead = async (notificationId) => {
        try {
            const notification = notifications.find(n => n.id === notificationId)
            
            if (notification && notification.status === 'unread') {
                const updatedNotification = {
                    ...notification,
                    status: 'read',
                    read_at: new Date().toISOString()
                }
                
                await fetch(`http://localhost:9999/messages/${notificationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedNotification)
                })
                
                // Update local state
                setNotifications(notifications.map(n => 
                    n.id === notificationId ? updatedNotification : n
                ))
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const updatePromises = notifications
                .filter(n => n.status === 'unread')
                .map(notification => {
                    const updatedNotification = {
                        ...notification,
                        status: 'read',
                        read_at: new Date().toISOString()
                    }
                    
                    return fetch(`http://localhost:9999/messages/${notification.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedNotification)
                    })
                })
            
            await Promise.all(updatePromises)
            
            // Update local state
            setNotifications(notifications.map(n => ({
                ...n,
                status: 'read',
                read_at: n.status === 'unread' ? new Date().toISOString() : n.read_at
            })))
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    const handleNotificationClick = (notification) => {
        markNotificationAsRead(notification.id)
        
        if (notification.action_url) {
            navigate(notification.action_url)
        }
    }

    const filteredNotifications = () => {
        if (activeTab === "all") return notifications
        if (activeTab === "unread") return notifications.filter(n => n.status === "unread")
        return notifications.filter(n => n.type === activeTab)
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return '📦'
            case 'promotion':
                return '🏷️'
            case 'feedback':
                return '💬'
            case 'system':
                return '🔔'
            default:
                return '🔔'
        }
    }

    const getTimeDifference = (timestamp) => {
        const now = new Date()
        const notificationTime = new Date(timestamp)
        const diffInSeconds = Math.floor((now - notificationTime) / 1000)
        
        if (diffInSeconds < 60) return `${diffInSeconds} giây trước`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
        
        return new Date(timestamp).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const tabCount = (tabName) => {
        if (tabName === "all") return notifications.length
        if (tabName === "unread") return notifications.filter(n => n.status === "unread").length
        return notifications.filter(n => n.type === tabName).length
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Thông báo của bạn</h1>
            
            {/* Tab navigation */}
            <div className="border-b mb-6">
                <div className="flex space-x-6">
                    {[
                        { id: "all", label: "Tất cả" },
                        { id: "unread", label: "Chưa đọc" },
                        { id: "order", label: "Đơn hàng" },
                        { id: "promotion", label: "Khuyến mãi" },
                        { id: "feedback", label: "Phản hồi" },
                        { id: "system", label: "Hệ thống" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 relative ${
                                activeTab === tab.id 
                                    ? "text-blue-600 font-medium border-b-2 border-blue-600" 
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            <span className="ml-1 text-xs bg-gray-100 rounded-full px-2 py-0.5">
                                {tabCount(tab.id)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between mb-6">
                <div className="text-sm text-gray-500">
                    Hiển thị {filteredNotifications().length} thông báo
                </div>
                <button 
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Đánh dấu tất cả đã đọc
                </button>
            </div>
            
            {/* Notifications list */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredNotifications().length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>Không có thông báo nào trong mục này</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications().map(notification => (
                        <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                                notification.status === 'unread' ? 'bg-blue-50 border-blue-100' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                                        <p className="text-xs text-gray-400 mt-2">{getTimeDifference(notification.created_at)}</p>
                                    </div>
                                </div>
                                {notification.status === 'unread' && (
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}