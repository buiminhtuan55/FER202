import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown, Heart, Menu } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import MainHeader from "../../components/MainHeader";
import SubMenu from "../../components/SubMenu";
import Footer from "../../components/Footer";


// Filter configurations for different categories
const categoryFilters = {
    1: [ // Fashion
        { name: "Size", options: ["S", "M", "L", "XL"] },
        { name: "Color", options: ["Black", "White", "Blue", "Red"] },
        { name: "Material", options: ["Cotton", "Leather", "Wool", "Synthetic"] },
        { name: "Price", options: ["Under $25", "$25-$50", "$50-$100", "Over $100"] },
        { name: "Condition", options: ["New", "Used", "Refurbished"] },
    ],
    2: [ // Electronics
        { name: "Brand", options: ["Apple", "Samsung", "Sony", "Microsoft"] },
        { name: "Model", options: ["Model A", "Model B", "Model C"] },
        { name: "Storage Capacity", options: ["64GB", "128GB", "256GB", "512GB"] },
        { name: "Price", options: ["Under $500", "$500-$1000", "Over $1000"] },
        { name: "Condition", options: ["New", "Used", "Refurbished"] },
    ],
    3: [ // Home & Kitchen
        { name: "Room", options: ["Kitchen", "Bedroom", "Bathroom", "Living Room"] },
        { name: "Material", options: ["Wood", "Metal", "Glass", "Plastic"] },
        { name: "Brand", options: ["KitchenAid", "Dyson", "Cuisinart", "Ninja"] },
        { name: "Price", options: ["Under $50", "$50-$200", "Over $200"] },
        { name: "Condition", options: ["New", "Used", "Refurbished"] },
    ],
    4: [ // Health & Fitness
        { name: "Type", options: ["Cardio", "Strength", "Yoga", "Recovery"] },
        { name: "Brand", options: ["Nike", "Adidas", "Under Armour", "Fitbit"] },
        { name: "Price", options: ["Under $50", "$50-$200", "Over $200"] },
        { name: "Condition", options: ["New", "Used", "Refurbished"] },
    ],
    5: [ // Entertainment
        { name: "Type", options: ["Games", "Music", "Movies", "Books"] },
        { name: "Brand", options: ["Sony", "Microsoft", "Nintendo", "Other"] },
        { name: "Price", options: ["Under $20", "$20-$60", "Over $60"] },
        { name: "Format", options: ["Digital", "Physical", "Collector's Edition"] },
    ],
    default: [
        { name: "Price", options: ["Low to High", "High to Low"] },
        { name: "Condition", options: ["New", "Used", "Refurbished"] },
        { name: "Buying Format", options: ["All Listings", "Auction", "Buy It Now"] },
    ]
};

// Subcategories for each main category
const categorySubcategories = {
    1: [ // Fashion
        "Men's Clothing",
        "Women's Clothing",
        "Shoes",
        "Jewelry & Watches",
        "Accessories",
        "Kids' Clothing",
        "Vintage & Collectible",
        "Handbags & Wallets",
        "Costumes & Formal Wear",
        "Cultural Clothing"
    ],
    2: [ // Electronics
        "Smartphones & Accessories",
        "Computers & Tablets",
        "Cameras & Photography",
        "TV & Home Audio",
        "Wearable Technology",
        "Video Games & Consoles",
        "Computer Components",
        "Home Surveillance",
        "Vehicle Electronics",
        "Virtual Reality"
    ],
    3: [ // Home & Kitchen
        "Appliances",
        "Cookware",
        "Furniture",
        "Bedding & Linens",
        "Kitchen Gadgets",
        "Home Decor",
        "Storage & Organization",
        "Bathroom Accessories",
        "Cleaning Supplies",
        "Patio & Garden"
    ],
    4: [ // Health & Fitness
        "Exercise Equipment",
        "Yoga & Pilates",
        "Supplements",
        "Fitness Trackers",
        "Athletic Clothing",
        "Sports Equipment",
        "Massage & Recovery",
        "Vitamins & Nutrition",
        "Personal Care",
        "Medical Equipment"
    ],
    5: [ // Entertainment
        "Video Games",
        "Board Games",
        "Musical Instruments",
        "Collectibles",
        "Books & Magazines",
        "Movies & TV Shows",
        "Music CDs & Vinyl",
        "Toys & Hobbies",
        "Outdoor Recreation",
        "Arts & Crafts"
    ],
    default: [
        "Popular Items",
        "New Arrivals",
        "Top Rated",
        "Best Sellers",
        "Special Offers",
        "Clearance",
        "Featured Brands",
        "Trending Now",
        "Recommended For You",
        "Seasonal Items"
    ]
};

export default function ListCategory() {
    // Extract categoryId from URL params
    const { categoryId } = useParams();
    // Giữ nguyên categoryId dưới dạng string
    const numericCategoryId = categoryId;

    const [activeTab, setActiveTab] = useState("all");
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch tất cả categories
                const allCategoriesResponse = await fetch("http://localhost:9999/categories");
                const allCategories = await allCategoriesResponse.json();
                setAllCategories(allCategories);

                // Tìm category theo id, đảm bảo so sánh dạng string
                const currentCategory = allCategories.find(cat => String(cat.id) === String(numericCategoryId));
                if (currentCategory) {
                    setCategory(currentCategory);
                } else {
                    throw new Error("Category not found");
                }

                // Fetch products của category
                const productsResponse = await fetch(`http://localhost:9999/products?categoryId=${numericCategoryId}`);
                const productsData = await productsResponse.json();
                setProducts(productsData);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        if (numericCategoryId) {
            fetchData();
        }
    }, [numericCategoryId]);

    // Load Wishlist từ localStorage khi trang tải
    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist(storedWishlist);
    }, []);

    // Kiểm tra sản phẩm có trong Wishlist không
    const isInWishlist = (id) => wishlist.some(item => item.id === id);

    // Xử lý khi click vào nút trái tim
    const toggleWishlist = (product) => {
        let updatedWishlist;
        if (isInWishlist(product.id)) {
            updatedWishlist = wishlist.filter(item => item.id !== product.id);
        } else {
            updatedWishlist = [...wishlist, product];
        }

        setWishlist(updatedWishlist);
        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    };

    // Get subcategories based on current category
    const getSubcategories = () => {
        return categorySubcategories[numericCategoryId] || categorySubcategories.default;
    };

    // Get filters based on current category
    const getFilters = () => {
        return categoryFilters[numericCategoryId] || categoryFilters.default;
    };

    // Filter products based on active tab
    const filteredProducts = products.filter(product => {
        if (activeTab === "all") return true;
        if (activeTab === "available") return product.status === "available";
        if (activeTab === "unavailable") return product.status === "unavailable";
        return true;
    });

    if (loading) {
        return (
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div className="text-center py-20">Loading...</div>
                <Footer />
            </div>
        );
    }

    if (!category) {
        return (
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div className="text-center py-20">Category not found</div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>

                <div className="max-w-[1300px] mx-auto p-4">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-600 mb-4">
                        <Link to="/" className="hover:underline cursor-pointer">Home</Link>
                        <span className="mx-2">{">"}</span>
                        <span>{category.name}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

                    <div className="flex gap-8">
                        {/* Left Sidebar */}
                        <div className="w-64 flex-shrink-0">
                            <h2 className="font-semibold mb-4">Shop by Category</h2>
                            <ul className="space-y-3">
                                {getSubcategories().map((subcategory, index) => (
                                    <li key={index} className="text-gray-700 hover:text-blue-600 cursor-pointer">
                                        {subcategory}
                                    </li>
                                ))}
                            </ul>

                            <h2 className="font-semibold mt-8 mb-4">Shop by Store</h2>
                            <ul className="space-y-3">
                                {allCategories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            to={`/list-category/${cat.id}`}
                                            className={`text-gray-700 hover:text-blue-600 cursor-pointer ${numericCategoryId === String(cat.id) ? "font-bold text-blue-600" : ""}`}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Tabs and Results Count */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex rounded-full bg-gray-100 p-1">
                                        <button
                                            className={`px-4 py-1 rounded-full ${activeTab === "all" ? "bg-gray-800 text-white" : ""}`}
                                            onClick={() => setActiveTab("all")}
                                        >
                                            All Listings
                                        </button>
                                        <button
                                            className={`px-4 py-1 rounded-full ${activeTab === "available" ? "bg-gray-800 text-white" : ""}`}
                                            onClick={() => setActiveTab("available")}
                                        >
                                            Available
                                        </button>
                                        <button
                                            className={`px-4 py-1 rounded-full ${activeTab === "unavailable" ? "bg-gray-800 text-white" : ""}`}
                                            onClick={() => setActiveTab("unavailable")}
                                        >
                                            Out of Stock
                                        </button>
                                    </div>
                                    <span className="text-gray-600">{filteredProducts.length} Results</span>
                                </div>

                                {/* Sort Options */}
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-1 px-4 py-2 rounded-full border hover:border-gray-400">
                                        Best Match
                                        <ChevronDown size={16} />
                                    </button>
                                    <button className="p-2 rounded-full border hover:border-gray-400">
                                        <Menu size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {getFilters().map((filter) => (
                                    <button
                                        key={filter.name}
                                        className="flex items-center gap-1 px-4 py-2 rounded-full border hover:border-gray-400"
                                    >
                                        {filter.name}
                                        <ChevronDown size={16} />
                                    </button>
                                ))}
                            </div>

                            {/* Product List */}
                            <div className="space-y-6">
                                {filteredProducts.length === 0 ? (
                                    <div className="text-center py-10 border rounded-lg">
                                        No products found in this category
                                    </div>
                                ) : (
                                    filteredProducts.map(product => (
                                        <div key={product.id} className="flex gap-4 p-4 border rounded-lg">
                                            <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                                                <img
                                                    src={`${product.url}/400`}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {product.status === "unavailable" && (
                                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1">
                                                        Sold Out
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => toggleWishlist(product)}
                                                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white"
                                                >
                                                    <Heart
                                                        size={20}
                                                        color={isInWishlist(product.id) ? "red" : "black"}
                                                        fill={isInWishlist(product.id) ? "red" : "none"}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex-1">
                                                <Link to={`/product/${product.id}`}>
                                                    <h3 className="text-lg font-medium hover:text-blue-600 cursor-pointer">
                                                        {product.title}
                                                    </h3>
                                                </Link>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {product.status === "available" ? "In Stock" : "Out of Stock"} · {category.name}
                                                </div>
                                                <div className="mt-2">
                                                    <div className="text-xl font-semibold">
                                                        ${(product.price / 100).toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-through">
                                                        Was: ${((product.price * 1.2) / 100).toFixed(2)}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-600">Free shipping</div>
                                                <div className="mt-2 text-sm text-gray-600">{Math.floor(Math.random() * 200) + 1} sold</div>
                                                <div className="mt-2 text-sm">{product.description}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <Footer />
                </div>
            </div>
        </>
    );
}