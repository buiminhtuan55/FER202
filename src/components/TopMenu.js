import { useState, useEffect } from "react"
import { ChevronDown, ShoppingCart, Bell } from "lucide-react"
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function TopMenu() {
    const [isMenu, setIsMenu] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)
    const [cartCount, setCartCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const user = localStorage.getItem('currentUser')
        if (user) {
            setCurrentUser(JSON.parse(user))
        }
    }, [])

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!currentUser) {
                setCartCount(0)
                return
            }

            try {
                const response = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch cart: ${response.status}`)
                }
                const cartItems = await response.json()
                const totalProducts = cartItems.reduce((sum, item) => sum + item.productId.length, 0)
                setCartCount(totalProducts)
            } catch (error) {
                console.error('Error fetching cart count:', error)
                setCartCount(0)
            }
        }

        fetchCartCount()
        const interval = setInterval(fetchCartCount, 3000)
        return () => clearInterval(interval)
    }, [currentUser])

    useEffect(() => {
        if (currentUser) {
            const fetchCartCount = async () => {
                try {
                    console.log("Fetching cart count on route change for user:", currentUser.id)
                    const response = await fetch(`http://localhost:9999/shoppingCart?userId=${currentUser.id}`)
                    if (!response.ok) {
                        throw new Error(`Failed to fetch cart: ${response.status}`)
                    }
                    const cartItems = await response.json()
                    console.log("Cart items on route change:", cartItems)
                    const totalProducts = cartItems.reduce((sum, item) => sum + item.productId.length, 0)
                    setCartCount(totalProducts)
                } catch (error) {
                    console.error('Error fetching cart count:', error)
                }
            }
            fetchCartCount()
        }
    }, [location.pathname, currentUser])

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!currentUser) {
                setNotifications([])
                setUnreadCount(0)
                return
            }

            try {
                const response = await fetch(`http://localhost:9999/notifications?user_id=${currentUser.id}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch notifications: ${response.status}`)
                }
                const data = await response.json()
                setNotifications(data)
                setUnreadCount(data.filter(notification => notification.status === 'unread').length)
            } catch (error) {
                console.error('Error fetching notifications:', error)
                setNotifications([])
                setUnreadCount(0)
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
        return () => clearInterval(interval)
    }, [currentUser])

    const handleSignOut = () => {
        localStorage.removeItem('currentUser')
        setCurrentUser(null)
        setCartCount(0)
        setIsMenu(false)
        navigate('/')
    }

    const markNotificationAsRead = async (notificationId) => {
        try {
            const notification = notifications.find(n => n.id === notificationId)
            
            if (notification && notification.status === 'unread') {
                const updatedNotification = {
                    ...notification,
                    status: 'read',
                    read_at: new Date().toISOString()
                }
                
                await fetch(`http://localhost:9999/notifications/${notificationId}`, {
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
                setUnreadCount(prev => prev - 1)
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleNotificationClick = (notification) => {
        markNotificationAsRead(notification.id)
        setIsNotificationOpen(false)
        
        if (notification.action_url) {
            navigate(notification.action_url)
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
                    
                    return fetch(`http://localhost:9999/notifications/${notification.id}`, {
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
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order':
                return '📦 '
            case 'promotion':
                return '🏷️ '
            case 'feedback':
                return '💬 '
            case 'system':
                return '🔔 '
            default:
                return '🔔 '
        }
    }

    return (
        <div id="TopMenu" className="border-b">
            <div className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
                <ul id="TopMenuLeft" className="flex items-center text-[11px] text-[#333333] px-2 h-8">
                    <li className="relative px-3">
                        {currentUser ? (
                            <button
                                onClick={() => setIsMenu(!isMenu)}
                                className="flex items-center gap-2 hover:underline cursor-pointer"
                            >
                                <div>Hi, {currentUser.fullname}</div>
                                <ChevronDown size={12} />
                            </button>
                        ) : (
                            <Link to="/auth" className="flex items-center gap-2 hover:underline cursor-pointer">
                                <div>Login</div>
                                <ChevronDown size={12} />
                            </Link>
                        )}

                        {currentUser && (
                            <div
                                id="AuthDropdown"
                                className={`
                                    absolute bg-white w-[200px] text-[#333333] z-40 top-[20px] left-0 border shadow-lg
                                    ${isMenu ? "visible" : "hidden"}
                                `}
                            >
                                <div>
                                    <div className="flex items-center justify-start gap-1 p-3">
                                        <img
                                            src={`https://picsum.photos/id/${currentUser.id}/50`}
                                            alt="User Avatar"
                                            className="w-[50px] h-[50px] rounded-full"
                                        />
                                        <div className="font-bold text-[13px]">{currentUser.fullname}</div>
                                    </div>
                                </div>

                                <div className="border-b" />

                                <ul className="bg-white">
                                    <li className="text-[11px] py-2 px-4 w-full hover:underline text-blue-500 hover:text-blue-600 cursor-pointer">
                                        <Link to="/order-history">My orders</Link>
                                    </li>
                                    <li
                                        onClick={handleSignOut}
                                        className="text-[11px] py-2 px-4 w-full hover:underline text-blue-500 hover:text-blue-600 cursor-pointer"
                                    >
                                        Sign out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </li>
                    <li className="px-3 hover:underline cursor-pointer">
                        <Link to="/daily-deals">Daily Deals</Link>
                    </li>
                    <li className="px-3 hover:underline cursor-pointer">
                        <Link to="/help">Help & Contact</Link>
                    </li>
                </ul>

                <ul id="TopMenuRight" className="flex items-center text-[11px] text-[#333333] px-2 h-8">
                    {currentUser?.role === "admin" && (
                        <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
                            <Link to="/adminDashboard" className="flex items-center gap-2 text-blue-400 font-bold">
                                Admin Panel
                            </Link>
                        </li>
                    )}
                    <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
                        <Link to="/sell" className="flex items-center gap-2">
                            Sell
                        </Link>
                    </li>
                    <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
                        <Link to="/sell" className="flex items-center gap-2">
                            <img width={32} src="/images/vn.png" alt="UK flag" />
                            Ship to
                        </Link>
                    </li>
                    <li className="flex items-center gap-2 px-3 hover:underline cursor-pointer">
                        <Link to="/wishlist">
                            Wishlist
                        </Link>
                    </li>
                    {/* Notification Icon */}
                    {currentUser && (
                        <li className="relative px-3 cursor-pointer">
                            <div onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <div className="absolute text-[10px] -top-[2px] -right-[5px] bg-red-500 w-[14px] h-[14px] rounded-full text-white">
                                        <div className="flex items-center justify-center -mt-[1px]">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                                    <div className="flex justify-between items-center px-4 py-2 border-b">
                                        <h3 className="font-semibold text-gray-700">Thông báo</h3>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={markAllAsRead}
                                                className="text-xs text-blue-500 hover:text-blue-700"
                                            >
                                                Đánh dấu đã đọc tất cả
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {notifications.length === 0 ? (
                                        <div className="py-4 px-4 text-center text-gray-500">
                                            Không có thông báo nào
                                        </div>
                                    ) : (
                                        <div>
                                            {notifications.map((notification) => (
                                                <div 
                                                    key={notification.id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                                                        notification.status === 'unread' ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start">
                                                        <p className="text-sm font-medium">
                                                            {getNotificationIcon(notification.type)}
                                                            {notification.title}
                                                        </p>
                                                        {notification.status === 'unread' && (
                                                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {notification.content}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(notification.created_at).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                            
                                            <div className="p-2 text-center">
                                                <Link 
                                                    to="/notifications"
                                                    className="text-xs text-blue-500 hover:text-blue-700"
                                                    onClick={() => setIsNotificationOpen(false)}
                                                >
                                                    Xem tất cả thông báo
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    )}
                    <li className="px-3 hover:underline cursor-pointer">
                        <Link to="/cart" className="relative">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <div className="absolute text-[10px] -top-[2px] -right-[5px] bg-red-500 w-[14px] h-[14px] rounded-full text-white">
                                    <div className="flex items-center justify-center -mt-[1px]">
                                        {cartCount}
                                    </div>
                                </div>
                            )}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}