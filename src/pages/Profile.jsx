import { Link } from "react-router-dom";
import { FaUserEdit, FaPenFancy, FaTachometerAlt } from "react-icons/fa";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Profile Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-stone-200">

          <div className="h-52 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

          <div className="px-6 pb-8">

            <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-5">

              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white bg-stone-900 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="flex-1">

                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">
                  {user?.name || "User"}
                </h1>

                <p className="text-stone-500 mt-2">
                  {user?.email || "No Email Available"}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
                  ● Active Account
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <p className="text-stone-500 text-sm">Blogs Written</p>
            <h2 className="text-3xl font-bold text-amber-600 mt-2">
              0
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <p className="text-stone-500 text-sm">Account Status</p>
            <h2 className="text-2xl font-bold text-green-600 mt-2">
              Active
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <p className="text-stone-500 text-sm">Role</p>
            <h2 className="text-2xl font-bold text-blue-600 mt-2">
              Blogger
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <p className="text-stone-500 text-sm">Member Since</p>
            <h2 className="text-xl font-bold text-stone-700 mt-2">
              {new Date().getFullYear()}
            </h2>
          </div>

        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl shadow-md p-6 mt-8">

          <h2 className="text-2xl font-bold text-stone-800 mb-6">
            Account Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-stone-500">
                Full Name
              </label>

              <div className="mt-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                {user?.name || "Not Available"}
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-500">
                Email Address
              </label>

              <div className="mt-2 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                {user?.email || "Not Available"}
              </div>
            </div>

          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="text-2xl font-bold text-stone-800 mb-5">
            Quick Actions
          </h2>

          <div className="grid md:grid-cols-3 gap-5">

            <Link
              to="/create-blog"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-3xl p-6 shadow-md transition duration-300"
            >
              <FaPenFancy className="text-3xl mb-3" />
              <h3 className="font-bold text-lg">
                Create Blog
              </h3>
              <p className="text-sm opacity-90 mt-2">
                Start writing a new article.
              </p>
            </Link>

            <Link
              to="/dashboard"
              className="bg-stone-900 hover:bg-black text-white rounded-3xl p-6 shadow-md transition duration-300"
            >
              <FaTachometerAlt className="text-3xl mb-3" />
              <h3 className="font-bold text-lg">
                Dashboard
              </h3>
              <p className="text-sm opacity-90 mt-2">
                Manage your blogs and activity.
              </p>
            </Link>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl p-6 shadow-md transition duration-300 text-left"
            >
              <FaUserEdit className="text-3xl mb-3" />
              <h3 className="font-bold text-lg">
                Edit Profile
              </h3>
              <p className="text-sm opacity-90 mt-2">
                Update your profile information.
              </p>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;