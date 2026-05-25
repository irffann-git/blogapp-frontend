import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const categoryColors = {
  Technology:   "bg-amber-50 text-amber-900",
  Lifestyle:    "bg-orange-50 text-orange-900",
  Travel:       "bg-orange-50 text-orange-900",
  Food:         "bg-yellow-50 text-yellow-900",
  Sports:       "bg-red-50 text-red-900",
  Programming:  "bg-yellow-50 text-yellow-900",
  Business:     "bg-stone-100 text-stone-800",
  Health:       "bg-lime-50 text-lime-900",
  Productivity: "bg-amber-50 text-amber-900",
  default:      "bg-stone-100 text-stone-700",
};

// Global cache – ensures only ONE increment request per blog id
const viewIncrementPromises = new Map();

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        let data;

        if (!viewIncrementPromises.has(id)) {
          const putPromise = API.put(`/api/blogs/${id}/view`, null)
            .then(res => res.data)
            .catch(err => {
              viewIncrementPromises.delete(id);
              throw err;
            });
          viewIncrementPromises.set(id, putPromise);
        }

        data = await viewIncrementPromises.get(id);

        if (isMountedRef.current) {
          setBlog(data);
        }
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error(error);
        toast.error("Failed to fetch blog");
        setBlog(null);
        viewIncrementPromises.delete(id);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isMountedRef.current = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-9 h-9 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-stone-700 mb-2">Blog not found</h2>
          <p className="text-stone-400 text-sm mb-7">The blog post you're looking for doesn't exist.</p>
          <Link to="/" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-2.5 rounded-full text-sm transition-colors inline-block">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const placeholderImage = "https://via.placeholder.com/1200x600?text=Blog+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link – more touch‑friendly */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium mb-5 sm:mb-7 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>

        {/* Article card */}
        <article className="bg-[#FFFCF7] rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Hero image – responsive aspect ratio */}
          <div className="relative w-full bg-stone-200 aspect-video md:aspect-[16/9]">
            <img
              src={blog.image ? `${import.meta.env.VITE_API_URL}${blog.image}` : "https://via.placeholder.com/800x400"}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = placeholderImage)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* Content area – responsive padding */}
          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
            {/* Category + views row */}
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryClass}`}>
                {blog.category || "Uncategorized"}
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                👁 {blog.views || 0} views
              </span>
            </div>

            {/* Title – responsive size */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 leading-tight sm:leading-snug mb-5 sm:mb-6">
              {blog.title}
            </h1>

            {/* Author info – responsive layout */}
            <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-stone-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 font-semibold text-xs sm:text-sm flex-shrink-0">
                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-stone-700 text-sm sm:text-base">
                  {blog.user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-stone-400">
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Recently"}
                </p>
              </div>
            </div>

            {/* Blog description – responsive text size */}
            <div className="text-stone-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {blog.description}
            </div>

            {/* Footer – responsive stacking */}
            <div className="mt-8 sm:mt-10 pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-xs text-stone-400">
                Written by{" "}
                <span className="text-stone-600 font-medium">
                  {blog.user?.name || "Anonymous"}
                </span>
              </p>
              <button
                onClick={() => navigator.share && navigator.share({ title: blog.title, url: window.location.href })}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-amber-700 hover:text-amber-600 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogDetails;