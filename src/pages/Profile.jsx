import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserEdit, FaPenFancy, FaTachometerAlt } from "react-icons/fa";
import API from "../services/api";
import toast from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
  const [blogCount, setBlogCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  // Fetch user's blogs to get real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await API.get("/api/blogs/myblogs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlogCount(data.length);
        setTotalViews(data.reduce((sum, b) => sum + (b.views || 0), 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Open edit modal pre-filled
  const handleOpenEdit = () => {
    setEditForm({ name: user?.name || "", email: user?.email || "" });
    setShowEditModal(true);
  };

  // Save profile changes
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
      // Update localStorage and state
      const updatedUser = { ...user, name: data.name || editForm.name, email: data.email || editForm.email };
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

  // Member since year — use createdAt if available, fallback to current year
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Profile Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FFFCF7] shadow-sm border border-stone-200">
          <div className="h-48 sm:h-52 bg-[#3D2B1F]">
            {/* decorative dots */}
            <div className="absolute top-6 left-8 w-32 h-32 rounded-full bg-amber-500/10" />
            <div className="absolute top-10 right-12 w-20 h-20 rounded-full bg-amber-500/10" />
          </div>

          <div className="px-6 pb-8">
            <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-5">

              {/* Avatar */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#FFFCF7] bg-amber-500 text-white flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-md flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="flex-1 pb-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800">
                  {user?.name || "User"}
                </h1>
                <p className="text-stone-500 mt-1 text-sm sm:text-base">
                  {user?.email || "No email available"}
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-lime-50 text-lime-800 px-4 py-1 rounded-full text-xs font-semibold border border-lime-200">
                  ● Active Account
                </div>
              </div>

              {/* Edit button (desktop) */}
              <button
                onClick={handleOpenEdit}
                className="hidden md:flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-5 py-2.5 rounded-full text-sm transition-colors self-end mb-1"
              >
                <FaUserEdit className="w-4 h-4" />
                Edit profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm">
            <p className="text-stone-400 text-xs font-medium mb-2">Blogs written</p>
            <h2 className="text-3xl font-bold text-amber-600">
              {loadingStats ? (
                <span className="inline-block w-8 h-7 bg-amber-100 rounded animate-pulse" />
              ) : blogCount}
            </h2>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm">
            <p className="text-stone-400 text-xs font-medium mb-2">Total views</p>
            <h2 className="text-3xl font-bold text-stone-800">
              {loadingStats ? (
                <span className="inline-block w-12 h-7 bg-stone-100 rounded animate-pulse" />
              ) : totalViews.toLocaleString()}
            </h2>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm">
            <p className="text-stone-400 text-xs font-medium mb-2">Role</p>
            <h2 className="text-2xl font-bold text-blue-600">Blogger</h2>
          </div>

          <div className="bg-[#FFFCF7] rounded-2xl p-5 border border-stone-200 shadow-sm">
            <p className="text-stone-400 text-xs font-medium mb-2">Member since</p>
            <h2 className="text-2xl font-bold text-stone-700">{memberSince}</h2>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-stone-800">Account information</h2>
            {/* Edit button (mobile) */}
            <button
              onClick={handleOpenEdit}
              className="md:hidden flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold px-4 py-2 rounded-full text-xs transition-colors"
            >
              <FaUserEdit />
              Edit
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5">
                Full name
              </label>
              <div className="bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700">
                {user?.name || "Not available"}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide block mb-1.5">
                Email address
              </label>
              <div className="bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700">
                {user?.email || "Not available"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-4">Quick actions</h2>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">

            <Link
              to="/create-blog"
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-2xl p-5 sm:p-6 border border-amber-400 transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaPenFancy className="text-2xl mb-3" />
              <h3 className="font-bold text-base sm:text-lg">Create blog</h3>
              <p className="text-sm mt-1 text-stone-700">Start writing a new article</p>
            </Link>

            <Link
              to="/dashboard"
              className="bg-[#3D2B1F] hover:bg-stone-900 text-stone-100 rounded-2xl p-5 sm:p-6 border border-stone-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              <FaTachometerAlt className="text-2xl mb-3 text-amber-400" />
              <h3 className="font-bold text-base sm:text-lg">Dashboard</h3>
              <p className="text-sm mt-1 text-stone-400">Manage your blogs and activity</p>
            </Link>

            <button
              onClick={handleOpenEdit}
              className="bg-[#FFFCF7] hover:bg-stone-50 text-stone-800 rounded-2xl p-5 sm:p-6 border border-stone-200 transition-all duration-200 hover:-translate-y-0.5 text-left"
            >
              <FaUserEdit className="text-2xl mb-3 text-stone-500" />
              <h3 className="font-bold text-base sm:text-lg">Edit profile</h3>
              <p className="text-sm mt-1 text-stone-400">Update your profile information</p>
            </button>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
        >
          <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 w-full max-w-md shadow-xl overflow-hidden">

            {/* modal header */}
            <div className="bg-[#3D2B1F] px-6 py-5">
              <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-1">
                Account settings
              </p>
              <h3 className="text-lg font-bold text-[#F5F0E8]">Edit profile</h3>
            </div>

            {/* modal body */}
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

              <p className="text-xs text-stone-400">
                Changes will be saved to your account and updated everywhere.
              </p>
            </div>

            {/* modal footer */}
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
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;