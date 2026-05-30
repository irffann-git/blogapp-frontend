import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function getImageUrl(image) {
  const placeholder = "https://placehold.co/600x400?text=No+Image";
  if (!image) return placeholder;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

// Netflix-style Blog Card Component with responsive design
function BlogCard({ blog }) {
  const cardRef = useRef(null);
  const placeholder = "https://placehold.co/600x400?text=No+Image";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "20px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link to={`/blogs/${blog._id}`} className="block group">
      <div
        ref={cardRef}
        className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-red-900/20 transition-all duration-300 opacity-0 translate-y-4 border border-gray-800 hover:border-red-600"
        style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
      >
        <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-gray-900">
          <img
            src={getImageUrl(blog.image)}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder;
            }}
          />
          <span className="absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white bg-red-600 rounded-md shadow-md">
            {blog.category}
          </span>
        </div>
        <div className="p-3 sm:p-4 md:p-5">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 mb-1.5 sm:mb-2">
            <span className="font-medium text-gray-300 truncate max-w-[100px] sm:max-w-full">
              {blog.user?.name || "Anonymous"}
            </span>
            <span>•</span>
            <time dateTime={blog.createdAt} className="flex-shrink-0">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
          <h3 className="font-semibold text-white mb-1.5 sm:mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-red-500 transition-colors">
            {blog.title}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
            {blog.description?.slice(0, 100)}…
          </p>
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="flex items-center gap-1 text-gray-500">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
              </svg>
              {(blog.views || 0).toLocaleString()}
            </span>
            <span className="text-red-500 font-medium group-hover:text-red-400 transition-colors">
              Read more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Responsive Skeleton loader
function BlogCardSkeleton() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="h-40 sm:h-44 md:h-48 bg-gray-800" />
      <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 bg-gray-700 rounded" />
          <div className="h-3 w-3 bg-gray-700 rounded-full" />
          <div className="h-3 w-24 bg-gray-700 rounded" />
        </div>
        <div className="h-4 sm:h-5 w-full bg-gray-700 rounded" />
        <div className="h-3 sm:h-4 w-3/4 bg-gray-700 rounded" />
        <div className="flex justify-between items-center pt-1 sm:pt-2">
          <div className="h-3 w-12 bg-gray-700 rounded" />
          <div className="h-3 sm:h-4 w-16 sm:w-20 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const blogsPerPage = 6;
  const debouncedSearch = useDebounce(search, 400);
  
  const categories = ["All", "Technology", "Lifestyle", "Sports", "Programming", "Business", "Travel", "Health"];

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/api/blogs?search=${encodeURIComponent(debouncedSearch)}`, { 
          signal: controller.signal 
        });
        setBlogs(data);
      } catch (error) {
        if (error.name === "AbortError" || error.name === "CanceledError") return;
        toast.error("Failed to fetch blogs. Please try again.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
    return () => controller.abort();
  }, [debouncedSearch]);

  const filteredBlogs = selectedCategory === "All" 
    ? blogs 
    : blogs.filter(b => b.category === selectedCategory);

  const trendingBlogs = [...filteredBlogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const latestBlogs = [...filteredBlogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = latestBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(latestBlogs.length / blogsPerPage);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* NETFLIX-STYLE HERO - FULLY RESPONSIVE */}
      <div className="bg-gradient-to-br from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Badge */}
            <div className="mb-3 sm:mb-4">
              <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-red-500 bg-red-500/10 rounded-full border border-red-500/30">
                BLOG INSIGHTS
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              Thought leadership for <br className="hidden sm:block" />
              <span className="text-red-500">modern readers</span>
            </h1>
            
            <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
              In-depth articles on technology, business, and culture — curated by industry experts.
            </p>
            
            <div className="max-w-md mx-auto mb-6 sm:mb-8 px-2 sm:px-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pl-10 sm:pl-12 pr-8 sm:pr-10 text-white bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm sm:text-base"
                />
                <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {search && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 active:scale-95 ${
                    selectedCategory === cat 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!search && trendingBlogs.length > 0 && !loading && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-lg sm:text-xl font-bold text-white">Trending now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {trendingBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {search ? (
                <>Search results for "<span className="text-red-500">{search}</span>"</>
              ) : selectedCategory !== "All" ? (
                <>Latest in {selectedCategory}</>
              ) : (
                "Latest articles"
              )}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-xs sm:text-sm text-gray-400">{latestBlogs.length} {latestBlogs.length === 1 ? 'post' : 'posts'}</p>
              {(search || selectedCategory !== "All") && (
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-400 font-medium active:scale-95 transition-transform"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : currentBlogs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-[#1a1a1a] rounded-xl border border-gray-800">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">No articles found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="px-4 sm:px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors active:scale-95"
              >
                Browse all articles
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {currentBlogs.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-10 sm:mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {(() => {
                      const pages = [];
                      let start = Math.max(1, currentPage - 2);
                      let end = Math.min(totalPages, start + 4);
                      
                      if (end - start < 4) {
                        start = Math.max(1, end - 4);
                      }
                      
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 active:scale-95
                            ${currentPage === page
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'}`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-95"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-black border-t border-gray-800 mt-12 sm:mt-16 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}