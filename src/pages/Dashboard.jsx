import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function getImageUrl(image) {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/api/blogs/myblogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBlogs();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.delete(`/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(data.message || "Blog deleted successfully");
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500/30 border-t-red-600 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <div className="min-h-screen bg-black py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-red-400 uppercase mb-1">
              Your content
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              My blogs
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
              Manage your published posts
            </p>
          </div>
          <Link
            to="/create-blog"
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-full text-sm transition-all duration-300 shadow-md shadow-red-500/20 inline-flex items-center gap-2 w-fit transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline">Write new blog</span>
            <span className="xs:hidden">New</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4 flex items-center gap-3 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{blogs.length}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Total blogs</p>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4 flex items-center gap-3 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {new Set(blogs.map((b) => b.category).filter(Boolean)).size}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400">Categories</p>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-3 sm:p-4 flex items-center gap-3 transition-all duration-300 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-gray-400">Total views</p>
            </div>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 sm:p-10 md:p-14 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">No blogs yet</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 sm:mb-7">Start writing your first blog post</p>
            <Link
              to="/create-blog"
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-5 sm:px-6 py-2.5 rounded-full text-sm transition-all duration-300 shadow-md shadow-red-500/20 inline-block transform hover:scale-105 active:scale-95"
            >
              Write first blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {blogs.map((blog) => {
              const imgUrl = getImageUrl(blog.image);
              return (
                <div
                  key={blog._id}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500/40 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-red-500/5"
                >
                  {imgUrl && (
                    <div className="relative overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={blog.title}
                        className="w-full h-36 sm:h-40 md:h-44 object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 truncate max-w-[60%]">
                        {blog.category || "Uncategorized"}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
                        </svg>
                        {blog.views || 0}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-semibold text-white mb-1 line-clamp-2 leading-snug">
                      {blog.title}
                    </h2>

                    <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {blog.description}
                    </p>

                    <div className="flex gap-2 mt-auto pt-2 sm:pt-3 border-t border-gray-800">
                      <Link
                        to={`/edit-blog/${blog._id}`}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-center px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.98]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        disabled={deletingId === blog._id}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1 active:scale-[0.98]"
                      >
                        {deletingId === blog._id ? (
                          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;