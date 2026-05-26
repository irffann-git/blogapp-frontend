import { useState } from "react";
import toast from "react-hot-toast";

function Profile() {

  const storedUser =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const [name, setName] =
    useState(storedUser.name || "");

  const [email, setEmail] =
    useState(storedUser.email || "");

  const [bio, setBio] =
    useState(storedUser.bio || "");

  const [profileImage, setProfileImage] =
    useState(
      storedUser.profileImage || ""
    );

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setProfileImage(reader.result);

    };

    reader.readAsDataURL(file);

  };

  const handleSave = () => {

    const updatedUser = {
      ...storedUser,
      name,
      email,
      bio,
      profileImage,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    toast.success(
      "Profile updated successfully"
    );

  };

  return (

    <div className="min-h-screen bg-[#F5F0E8] px-4 py-10">

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">

        {/* heading */}
        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-stone-800">
            My Profile
          </h1>

          <p className="text-stone-500 mt-2">
            Manage your account details
          </p>

        </div>

        {/* profile image */}
        <div className="flex flex-col items-center mb-8">

          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow">

            {profileImage ? (

              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />

            ) : (

              <div className="w-full h-full bg-amber-600 flex items-center justify-center text-white text-4xl font-bold">

                {name?.charAt(0)?.toUpperCase() || "U"}

              </div>

            )}

          </div>

          <label className="mt-4 cursor-pointer bg-amber-500 hover:bg-amber-400 text-stone-900 px-4 py-2 rounded-full text-sm font-semibold transition">

            Change Photo

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

          </label>

        </div>

        {/* form */}
        <div className="space-y-5">

          {/* name */}
          <div>

            <label className="block text-sm font-medium text-stone-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter your name"
            />

          </div>

          {/* email */}
          <div>

            <label className="block text-sm font-medium text-stone-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Enter email"
            />

          </div>

          {/* bio */}
          <div>

            <label className="block text-sm font-medium text-stone-700 mb-2">
              Bio
            </label>

            <textarea
              rows="4"
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              placeholder="Tell something about yourself..."
            />

          </div>

          {/* save */}
          <button
            onClick={handleSave}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-xl font-semibold transition"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );

}

export default Profile;