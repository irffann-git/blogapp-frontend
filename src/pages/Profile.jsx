import { Link } from "react-router-dom";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-amber-500 to-orange-600"></div>

          <div className="px-6 pb-8">
            <div className="-mt-16 flex flex-col md:flex-row md:items-end gap-4">

              {/* Avatar */}
              <div className="w-32 h-32 rounded-full border-4 border-white bg-amber-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-stone-800">
                  {user?.name || "User"}
                </h1>

                <p className="text-stone-500 mt-1">
                  {user?.email || "No Email"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-stone-500 text-sm">
              Blogs Written
            </h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              0
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-stone-500 text-sm">
              Account Status
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              Active
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-stone-500 text-sm">
              Member Since
            </h3>
            <p className="text-lg font-semibold text-stone-700 mt-2">
              {new Date().getFullYear()}
            </p>
          </div>

        </div>

        {/* Account Information */}
        <div className="bg-white rounded-3xl shadow mt-8 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6">
            Account Information
          </h2>

          <div className="space-y-5">

            <div>
              <label className="text-sm text-stone-500">
                Full Name
              </label>
              <div className="mt-1 text-stone-800 font-medium">
                {user?.name || "Not Available"}
              </div>
            </div>

            <div>
              <label className="text-sm text-stone-500">
                Email Address
              </label>
              <div className="mt-1 text-stone-800 font-medium">
                {user?.email || "Not Available"}
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <Link
            to="/create-blog"
            className="bg-amber-500 hover:bg-amber-600 text-white p-5 rounded-2xl shadow text-center font-semibold transition"
          >
            Create Blog
          </Link>

          <Link
            to="/dashboard"
            className="bg-stone-800 hover:bg-stone-900 text-white p-5 rounded-2xl shadow text-center font-semibold transition"
          >
             Dashboard
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Profile;