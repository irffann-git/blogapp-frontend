import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function CreateBlog() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "image") {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const blogData = new FormData();
      blogData.append("title", formData.title);
      blogData.append("description", formData.description);
      blogData.append("category", formData.category);
      blogData.append("image", formData.image);

      const { data } = await API.post("/api/blogs", blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(data.message || "Blog created successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition";

  const labelClass = "block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8 sm:py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">

        {/* card */}
        <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

          {/* header */}
          <div className="bg-[#3D2B1F] px-5 sm:px-8 py-6 sm:py-7">
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-2">
              New post
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">
              Write a new blog
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">
              Share your thoughts with the world
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

            {/* title */}
            <div>
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter a compelling title..."
                className={inputClass}
                onChange={handleChange}
                value={formData.title}
                required
              />
            </div>

            {/* description */}
            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                name="description"
                placeholder="Write your blog content here..."
                rows="7"
                className={`${inputClass} resize-none`}
                onChange={handleChange}
                value={formData.description}
                required
              />
            </div>

            {/* category */}
            <div>
              <label className={labelClass}>Category *</label>
              <input
                type="text"
                name="category"
                placeholder="e.g. Technology, Travel, Health..."
                className={inputClass}
                onChange={handleChange}
                value={formData.category}
                required
              />
            </div>

            {/* image upload */}
            <div>
              <label className={labelClass}>Cover image *</label>
              <label className="flex items-center gap-3 cursor-pointer w-full bg-[#F5F0E8] border border-dashed border-stone-300 hover:border-amber-400 rounded-xl px-4 py-3 sm:py-4 transition-colors">
                <svg className="w-5 h-5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm text-stone-400 truncate">
                  {formData.image ? formData.image.name : "Click to upload an image"}
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                  required
                />
              </label>

              {/* preview – responsive image */}
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-full h-48 sm:h-56 object-cover rounded-xl border border-stone-200"
                />
              )}
            </div>

            {/* divider */}
            <div className="border-t border-stone-100" />

            {/* buttons – responsive stacking */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="sm:flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="sm:flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                {loading ? "Publishing..." : "Publish blog"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBlog;