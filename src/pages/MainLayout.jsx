import { useState, useEffect } from "react";
import CarouselComp from "../components/CarouselComp";
import Product from "../components/Product";
import Footer from "../components/Footer";
import MainHeader from "../components/MainHeader";
import SubMenu from "../components/SubMenu";
import TopMenu from "../components/TopMenu";

const ITEMS_PER_PAGE = 10;

const CATEGORY_IMAGES = {
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&h=500&fit=crop",
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=500&fit=crop",
  "Home & Kitchen":
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&h=500&fit=crop",
  "Health & Fitness":
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500&h=500&fit=crop",
  Entertainment:
    "https://images.unsplash.com/photo-1511882150382-421056c89033?w=500&h=500&fit=crop",
};

export default function MainLayout() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch("http://localhost:9999/products");
        const productsData = await productsResponse.json();

        const categoriesResponse = await fetch(
          "http://localhost:9999/categories"
        );
        const categoriesData = await categoriesResponse.json();

        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to first page when changing category
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(
        (product) => String(product.categoryId) === String(selectedCategory)
      )
    : products;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
      <div>
        <TopMenu />
        <MainHeader />
        <SubMenu />
      </div>

      <div>
        <CarouselComp />

        <div className="max-w-[1200px] mx-auto">
          <div className="mt-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 px-4">
              Explore Popular Categories
            </h2>

            {/* Category filter */}
            <div className="flex justify-between items-center gap-4 px-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center bg-white mb-3 shadow-md transition-all duration-300 overflow-hidden group-hover:shadow-lg ${
                    !selectedCategory ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&h=500&fit=crop"
                    alt="All Categories"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    !selectedCategory ? "text-blue-500" : "text-gray-700"
                  }`}
                >
                  All Categories
                </span>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center bg-white mb-3 shadow-md transition-all duration-300 overflow-hidden group-hover:shadow-lg ${
                      selectedCategory === category.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <img
                      src={CATEGORY_IMAGES[category.name] || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      selectedCategory === category.id
                        ? "text-blue-500"
                        : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {paginatedProducts.map((product) => (
                  <Product key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pb-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 rounded-full ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
