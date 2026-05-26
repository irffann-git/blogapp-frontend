import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  useEffect(() => {
    const loadBlogs = async () => {
      await fetchMyBlogs();
    };
    loadBlogs();
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
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">Loading your blogs...</p>
        </div>
      </div>
    );
  }

  const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-1">
              Your content
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">My blogs</h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-0.5">Manage your published posts</p>
          </div>
          <Link
            to="/create-blog"
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors inline-flex items-center gap-2 w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Write new blog
          </Link>
        </div>

        {/* stat cards - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 sm:mb-10">
          <div className="bg-[#FFFCF7] rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{blogs.length}</p>
              <p className="text-xs text-stone-400">Total blogs</p>
            </div>
          </div>

          <div className="bg-[#FFFCF7] rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">
                {new Set(blogs.map((b) => b.category).filter(Boolean)).size}
              </p>
              <p className="text-xs text-stone-400">Categories</p>
            </div>
          </div>

          <div className="bg-[#FFFCF7] rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-stone-400">Total views</p>
            </div>
          </div>
        </div>

        {/* empty state */}
        {blogs.length === 0 ? (
          <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 p-8 sm:p-14 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-700 mb-1">No blogs yet</h3>
            <p className="text-stone-400 text-sm mb-7">Start writing your first blog post</p>
            <Link
              to="/create-blog"
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-2.5 rounded-full text-sm transition-colors inline-block"
            >
              Write first blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-[#FFFCF7] rounded-2xl overflow-hidden border border-stone-200 hover:border-amber-300 transition-all duration-300 flex flex-col"
              >
                {blog.image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${blog.image.replace(/^\/+/, "")}`}
                    alt={blog.title}
                    className="w-full h-40 sm:h-44 object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}

                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900">
                      {blog.category || "Uncategorized"}
                    </span>
                    <span className="text-xs text-stone-400 ml-auto">
                      👁 {blog.views || 0}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-semibold text-stone-800 mb-2 line-clamp-2 leading-snug">
                    {blog.title}
                  </h2>

                  <p className="text-stone-500 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                    {blog.description}
                  </p>

                  <div className="flex gap-2 mt-auto pt-3 border-t border-stone-100">
                    <Link
                      to={`/edit-blog/${blog._id}`}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      disabled={deletingId === blog._id}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {deletingId === blog._id ? (
                        <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;