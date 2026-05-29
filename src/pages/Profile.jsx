import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [blogs, setBlogs] = useState([]);
  const [blogCount, setBlogCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/api/blogs/myblogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogs(data);
        setBlogCount(data.length);
        setTotalViews(data.reduce((sum, b) => sum + (b.views || 0), 0));
      } catch (error) {
        console.error("fetchStats error:", error.response || error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleOpenEdit = () => {
    setEditForm({ name: user?.name || "", email: user?.email || "" });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.put(
        "/api/auth/update-profile",
        { name: editForm.name, email: editForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedUser = {
        ...user,
        name: data.name || editForm.name,
        email: data.email || editForm.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  // Get recent blogs (latest 3 by creation date or default order from API)
  const recentBlogs = blogs.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Hero Section - Redesigned with modern card and decorative elements */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FFFCF7] shadow-lg border border-stone-200/60">
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="absolute -top-24 -right-24 w-64 h-64 text-stone-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <svg className="absolute -bottom-16 -left-16 w-48 h-48 text-stone-200" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>

          {/* Cover area with gradient */}
          <div className="h-40 sm:h-48 bg-gradient-to-r from-[#3D2B1F] via-[#5a3d2b] to-[#3D2B1F]" />
          
          <div className="px-6 pb-8 relative">
            <div className="-mt-12 flex flex-col md:flex-row md:items-end gap-5">
              {/* Enhanced Avatar with ring and shadow */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#FFFCF7] bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xl flex-shrink-0 transition-transform group-hover:scale-105">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <button
                  onClick={handleOpenEdit}
                  className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md hover:bg-stone-100 transition-colors"
                  aria-label="Edit profile picture"
                >
                  <svg className="w-3.5 h-3.5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800">
                    {user?.name || "User"}
                  </h1>
                  <div className="inline-flex items-center gap-1.5 bg-lime-50 text-lime-700 px-3 py-1 rounded-full text-xs font-semibold border border-lime-200 shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                    </span>
                    Active Account
                  </div>
                </div>
                <p className="text-stone-500 mt-1 text-sm sm:text-base flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {user?.email || "No email available"}
                </p>
              </div>
              <button
                onClick={handleOpenEdit}
                className="hidden md:flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:shadow-md hover:-translate-y-0.5 self-end mb-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Enhanced with icons and hover effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="group bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <span className="text-lg">📝</span> Blogs written
                </p>
                <h2 className="text-3xl font-bold text-amber-600">
                  {loadingStats ? (
                    <span className="inline-block w-8 h-7 bg-amber-100 rounded animate-pulse" />
                  ) : (
                    blogCount
                  )}
                </h2>
              </div>
              <div className="p-2 rounded-full bg-amber-50 text-amber-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <span className="text-lg">👁️</span> Total views
                </p>
                <h2 className="text-3xl font-bold text-stone-800">
                  {loadingStats ? (
                    <span className="inline-block w-12 h-7 bg-stone-100 rounded animate-pulse" />
                  ) : (
                    totalViews.toLocaleString()
                  )}
                </h2>
              </div>
              <div className="p-2 rounded-full bg-stone-100 text-stone-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <span className="text-lg">⭐</span> Role
                </p>
                <h2 className="text-2xl font-bold text-blue-600">Blogger</h2>
              </div>
              <div className="p-2 rounded-full bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="group bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <span className="text-lg">📅</span> Member since
                </p>
                <h2 className="text-2xl font-bold text-stone-700">{memberSince}</h2>
              </div>
              <div className="p-2 rounded-full bg-stone-100 text-stone-500 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Section - Redesigned with better visual separation */}
        <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-xl">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-800">Account information</h2>
            </div>
            <button
              onClick={handleOpenEdit}
              className="md:hidden flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold px-4 py-2 rounded-full text-xs transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full name
              </label>
              <div className="bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 font-medium">
                {user?.name || "Not available"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email address
              </label>
              <div className="bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 font-medium">
                {user?.email || "Not available"}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Blogs Section - New feature using existing data */}
        {!loadingStats && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-xl">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-stone-800">Recent blogs</h2>
              </div>
              <Link to="/dashboard" className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                View all
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {recentBlogs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    to={`/edit-blog/${blog._id}`}
                    className="group bg-[#FFFCF7] rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 block"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {blog.title || "Untitled"}
                      </h3>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {blog.views || 0}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-2 mb-3">
                      {blog.content?.substring(0, 100) || "No preview available"}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Unknown date"}
                      </span>
                      <span className="text-amber-500 group-hover:underline">Edit →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#FFFCF7] rounded-xl border border-stone-200 p-8 text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-stone-500">No blogs yet. Start your writing journey!</p>
                <Link
                  to="/create-blog"
                  className="inline-block mt-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-full text-sm transition-colors"
                >
                  Create first blog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions - Redesigned with better styling and hover effects */}
        <div className="mt-6 sm:mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-50 rounded-xl">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-800">Quick actions</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            <Link
              to="/create-blog"
              className="group bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-bold text-base sm:text-lg">Create blog</h3>
              </div>
              <p className="text-sm text-stone-800/80">Start writing a new article</p>
            </Link>
            <Link
              to="/dashboard"
              className="group bg-[#3D2B1F] hover:bg-stone-800 text-stone-100 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <h3 className="font-bold text-base sm:text-lg">Dashboard</h3>
              </div>
              <p className="text-sm text-stone-300">Manage your blogs and activity</p>
            </Link>
            <button
              onClick={handleOpenEdit}
              className="group bg-[#FFFCF7] hover:bg-stone-50 text-stone-800 rounded-2xl p-5 sm:p-6 border border-stone-200 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl text-left w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-stone-100 rounded-full group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base sm:text-lg">Edit profile</h3>
              </div>
              <p className="text-sm text-stone-400">Update your profile information</p>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal - Enhanced design */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="bg-gradient-to-r from-[#3D2B1F] to-[#5a3d2b] px-6 py-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs font-semibold tracking-widest text-amber-300 uppercase">
                  Account settings
                </p>
              </div>
              <h3 className="text-lg font-bold text-[#F5F0E8]">Edit profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                />
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Changes will be saved to your account and updated everywhere.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold py-3 rounded-xl text-sm transition-all shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;