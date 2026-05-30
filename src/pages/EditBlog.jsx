import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  // Predefined category options (8 options)
  const categoryOptions = [
    "Technology",
    "Lifestyle",
    "Sports",
    "Programming",
    "Business",
    "Travel",
    "Health",
    "Productivity"
  ];

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await API.get(`/api/blogs/${id}`);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          image: null,
        });
        if (data.image) setPreview(`${import.meta.env.VITE_API_URL}${data.image}`);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch blog");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

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
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const blogData = new FormData();
      blogData.append("title", formData.title);
      blogData.append("description", formData.description);
      blogData.append("category", formData.category);
      if (formData.image) blogData.append("image", formData.image);

      const { data } = await API.put(`/api/blogs/${id}`, blogData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(data.message || "Blog updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
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
          <p className="mt-4 text-gray-400 text-sm">Loading blog...</p>
        </div>
      </div>
    );
  }

  // Responsive input classes (shared)
  const inputClass =
    "w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

  const selectClass =
    "w-full bg-gray-800/50 border border-gray-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none cursor-pointer";

  const labelClass = "block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-black py-6 sm:py-8 md:py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-800 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-red-900/20">

          <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7">
            <p className="text-[11px] sm:text-xs font-semibold tracking-widest text-white/80 uppercase mb-1.5 sm:mb-2">
              Edit post
            </p>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              Update your blog
            </h1>
            <p className="text-white/60 text-[11px] sm:text-xs md:text-sm mt-1">
              Make changes and republish
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

            {/* Title */}
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter blog title"
                className={inputClass}
                onChange={handleChange}
                value={formData.title}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                placeholder="Write your blog content here..."
                rows="6 sm:rows=7"
                className={`${inputClass} resize-none`}
                onChange={handleChange}
                value={formData.description}
                required
              />
            </div>

            {/* Category - Dropdown Select with 8 options */}
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={selectClass}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className={labelClass}>Replace cover image</label>
              <label className="flex items-center gap-3 cursor-pointer w-full bg-gray-800/50 border-2 border-dashed border-gray-600 hover:border-red-500 rounded-xl px-4 py-3 sm:py-4 transition-all duration-200 group min-h-[52px]">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors flex-1">
                  {formData.image ? formData.image.name : "Click to upload a new image (optional)"}
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>

              {preview && (
                <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
            </div>

            <div className="border-t border-gray-800" />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full sm:flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 shadow-md shadow-red-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;