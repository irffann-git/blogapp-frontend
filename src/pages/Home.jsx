import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// debounce hook
function useDebounce(value, delay) {

  const [debouncedValue, setDebouncedValue] =
    useState(value);

  useEffect(() => {

    const handler = setTimeout(() => {

      setDebouncedValue(value);

    }, delay);

    return () => clearTimeout(handler);

  }, [value, delay]);

  return debouncedValue;

}

// category colors
const categoryColors = {

  Technology:
    "bg-amber-50 text-amber-900",

  Lifestyle:
    "bg-orange-50 text-orange-900",

  Sports:
    "bg-red-50 text-red-900",

  Programming:
    "bg-yellow-50 text-yellow-900",

  Business:
    "bg-stone-100 text-stone-800",

  Travel:
    "bg-orange-50 text-orange-900",

  Health:
    "bg-lime-50 text-lime-900",

  Productivity:
    "bg-amber-50 text-amber-900",

  default:
    "bg-stone-100 text-stone-700",

};

// blog card
function BlogCard({ blog }) {

 
    const placeholderImage = "https://placehold.co/600x400?text=No+Image";

  const categoryClass =
    categoryColors[blog.category] ||
    categoryColors.default;

  return (

    <Link
      to={`/blogs/${blog._id}`}
      className="group bg-[#FFFCF7] rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >

      {/* image */}
      <div className="relative overflow-hidden h-48 sm:h-52">

<img
  src={
    blog.image
      ? blog.image.startsWith("http")
        ? blog.image
        : `${window.location.origin
            .replace("5173", "")
            .replace("3000", "")
            .replace(/\/$/, "")}${blog.image}`
      : placeholderImage
  }
  alt={blog.title}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = placeholderImage;
  }}
/>

        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      </div>

      {/* content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">

        {/* category */}
        <span
          className={`self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${categoryClass}`}
        >

          {blog.category}

        </span>

        {/* title */}
        <h2 className="text-sm sm:text-base font-semibold mb-2 line-clamp-2 text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">

          {blog.title}

        </h2>

        {/* views */}
        <p className="text-xs text-stone-400 mb-2">

          👁 {blog.views || 0} views

        </p>

        {/* description */}
        <p className="text-stone-500 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">

          {blog.description?.slice(0, 120)}...

        </p>

        {/* author */}
        <div className="flex items-center mt-auto pt-3 border-t border-stone-100">

          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 text-xs font-semibold">

            {(blog.user?.name?.charAt(0) || "A").toUpperCase()}

          </div>

          <p className="text-xs text-stone-500 ml-2 truncate">

            {blog.user?.name || "Anonymous"}

          </p>

        </div>

      </div>

    </Link>

  );

}

// home
function Home() {

  const [blogs, setBlogs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedCategory,
    setSelectedCategory] =
    useState("All");
    const [currentPage, setCurrentPage] =
  useState(1);

const blogsPerPage = 12;

  const debouncedSearch =
    useDebounce(search, 500);

  // categories
  const categories = [

    "All",
    "Technology",
    "Lifestyle",
    "Sports",
    "Programming",
    "Business",
    "Travel",
    "Health",
    "Productivity",

  ];

  // fetch blogs
  const fetchBlogs = useCallback(

    async (signal) => {

      try {

        setLoading(true);

        const { data } = await API.get(
  `/api/blogs?search=${encodeURIComponent(
    debouncedSearch
  )}`,
  {
    signal,
  }
);

        setBlogs(data);

      } catch (error) {

        if (
          error.name === "AbortError" ||
          error.name === "CanceledError"
        ) {
          return;
        }

        console.log(error);

        toast.error(
          "Failed to fetch blogs"
        );

        setBlogs([]);

      } finally {

        setLoading(false);

      }

    },

    [debouncedSearch]

  );

  // use effect
  useEffect(() => {

    const controller =
      new AbortController();

    const loadBlogs = async () => {

      await fetchBlogs(
        controller.signal
      );

    };

    loadBlogs();

    return () =>
      controller.abort();

  }, [fetchBlogs]);

  // loading
  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-screen bg-[#F5F0E8]">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto" />

          <p className="mt-5 text-stone-500 text-sm">

            Gathering stories...

          </p>

        </div>

      </div>

    );

  }

  // filtered blogs
  const filteredBlogs =

    selectedCategory === "All"

      ? blogs

      : blogs.filter(

          (b) =>
            b.category ===
            selectedCategory

        );

  // trending blogs
  const trendingBlogs = [...blogs]

    .sort((a, b) =>

      b.views - a.views

    )

    .slice(0, 3);

    // pagination
const indexOfLastBlog =
  currentPage * blogsPerPage;

const indexOfFirstBlog =
  indexOfLastBlog - blogsPerPage;

const currentBlogs =
  filteredBlogs.slice(
    indexOfFirstBlog,
    indexOfLastBlog
  );

const totalPages = Math.ceil(
  filteredBlogs.length /
    blogsPerPage
);

  return (

    <div className="min-h-screen bg-[#F5F0E8]">

      {/* hero */}
      <div className="bg-[#3D2B1F] text-stone-100 py-12 sm:py-16 px-4">

        <div className="max-w-3xl mx-auto text-center">

          <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-2 sm:mb-3">

            Discover stories

          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-[#F5F0E8] leading-tight">

            Explore ideas & insights

          </h1>

          <p className="text-stone-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">

            Stories from creative minds around the world

          </p>

          {/* search */}
          <div className="relative max-w-xl mx-auto">

            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            <input
              type="text"
              placeholder="Search by title, category, or content..."
              value={search}
              onChange={(e) => {

  setSearch(e.target.value);

  setCurrentPage(1);

}}
              maxLength={50}
              className="w-full pl-11 pr-4 py-3 sm:py-4 rounded-full bg-[#F5F0E8] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base"
            />

          </div>

          {/* categories */}
          <div className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-7">

            {
              categories.map((cat) => (

                <button
                  key={cat}
                  onClick={() => {

  setSelectedCategory(cat);

  setCurrentPage(1);

}}
                  className={`px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-stone-900 shadow-md"
                      : "bg-white/10 text-stone-300 hover:bg-amber-500/20 hover:text-amber-200"
                  }`}
                >

                  {cat}

                </button>

              ))
            }

          </div>

        </div>

      </div>

      {/* content */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 md:py-16">

        {/* trending */}
        {
          trendingBlogs.length > 0 && (

            <section className="mb-12 sm:mb-16">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">

                <h2 className="text-xl sm:text-2xl font-bold text-stone-800">

                  Trending blogs

                </h2>

                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 sm:px-4 py-1 rounded-full self-start sm:self-auto">

                  Top viewed

                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                {
                  trendingBlogs.map((blog) => (

                    <BlogCard
                      key={blog._id}
                      blog={blog}
                    />

                  ))
                }

              </div>

            </section>

          )
        }

        {/* divider */}
        <div className="border-t border-stone-200 mb-10 sm:mb-12" />

        {/* latest */}
        <section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 sm:mb-8">

            <h2 className="text-xl sm:text-2xl font-bold text-stone-800">

              {
                search
                  ? `Search results for "${search}"`
                  : "Latest blogs"
              }

            </h2>

            <div className="flex items-center gap-3 sm:gap-4">

              <p className="text-xs sm:text-sm text-stone-500">

                {filteredBlogs.length} results

              </p>

              {
                search && (

                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    className="text-xs sm:text-sm text-amber-700 hover:text-amber-600"
                  >

                    Clear

                  </button>

                )
              }

            </div>

          </div>

          {
            filteredBlogs.length === 0 ? (

              <div className="text-center py-12 sm:py-16 bg-white/50 rounded-2xl">

                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                <p className="text-stone-500 text-base sm:text-lg">

                  No blogs match your search

                </p>

                <p className="text-stone-400 text-xs sm:text-sm mt-1">

                  Try another keyword

                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                {
                  currentBlogs.map((blog) => (

                    <BlogCard
                      key={blog._id}
                      blog={blog}
                    />

                  ))
                }

              </div>

            )
          }

        </section>
        {/* pagination */}
{
  totalPages > 1 && (

    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">

      {/* prev */}
      <button
        onClick={() =>
          setCurrentPage((prev) =>
            Math.max(prev - 1, 1)
          )
        }
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          currentPage === 1
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : "bg-amber-500 text-stone-900 hover:bg-amber-400"
        }`}
      >
        Prev
      </button>

      {/* pages */}
      {
        [...Array(totalPages)].map(
          (_, index) => (

            <button
              key={index}
              onClick={() =>
                setCurrentPage(index + 1)
              }
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition ${
                currentPage ===
                index + 1
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
              }`}
            >
              {index + 1}
            </button>

          )
        )
      }

      {/* next */}
      <button
        onClick={() =>
          setCurrentPage((prev) =>
            Math.min(
              prev + 1,
              totalPages
            )
          )
        }
        disabled={
          currentPage === totalPages
        }
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          currentPage === totalPages
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : "bg-amber-500 text-stone-900 hover:bg-amber-400"
        }`}
      >
        Next
      </button>

    </div>

  )
}

      </div>

    </div>

  );

}

export default Home;