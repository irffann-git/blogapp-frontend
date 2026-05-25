import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const categoryColors = {
  Technology: "bg-amber-50 text-amber-900",
  Lifestyle: "bg-orange-50 text-orange-900",
  Travel: "bg-orange-50 text-orange-900",
  Food: "bg-yellow-50 text-yellow-900",
  Sports: "bg-red-50 text-red-900",
  Programming: "bg-yellow-50 text-yellow-900",
  Business: "bg-stone-100 text-stone-800",
  Health: "bg-lime-50 text-lime-900",
  Productivity: "bg-amber-50 text-amber-900",
  default: "bg-stone-100 text-stone-700",
};

const viewIncrementPromises = new Map();

function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchBlog = async () => {
      setLoading(true);
      try {
        let data;
        if (!viewIncrementPromises.has(id)) {
          const putPromise = API.put(`/api/blogs/${id}/view`, null)
            .then((res) => res.data)
            .catch((err) => {
              viewIncrementPromises.delete(id);
              throw err;
            });
          viewIncrementPromises.set(id, putPromise);
        }
        data = await viewIncrementPromises.get(id);
        if (isMountedRef.current) setBlog(data);
      } catch (error) {
        console.error("Blog fetch error:", error);
        toast.error("Failed to fetch blog");
        setBlog(null);
        viewIncrementPromises.delete(id);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        console.log(`Fetching comments for blog ${id} from ${API.defaults.baseURL}/api/comments/${id}`);
        const { data } = await API.get(`/api/comments/${id}`);
        if (isMountedRef.current) setComments(data);
        console.log("Comments loaded:", data.length);
      } catch (error) {
        console.error("Comments fetch error:", error.response?.status, error.response?.data);
      }
    };

    fetchBlog();
    fetchComments();

    return () => {
      isMountedRef.current = false;
    };
  }, [id]);

  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      console.log("Posting comment:", commentText);
      const { data } = await API.post(
        `/api/comments/${id}`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Comment posted:", data);
      setComments([data, ...comments]);
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Add comment error:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        toast.error(error.response.data?.message || `Error ${error.response.status}: Failed to add comment`);
      } else if (error.request) {
        console.error("No response received");
        toast.error("Cannot connect to server. Check if backend is running.");
      } else {
        toast.error(error.message || "Failed to add comment");
      }
    }
  };

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
  const imageUrl = blog.image 
    ? (blog.image.startsWith('http') ? blog.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3005'}${blog.image}`)
    : placeholderImage;

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium mb-5 sm:mb-7 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>

        <article className="bg-[#FFFCF7] rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="relative w-full bg-stone-200 aspect-video md:aspect-[16/9]">
            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = placeholderImage)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryClass}`}>
                {blog.category || "Uncategorized"}
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                👁 {blog.views || 0} views
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 leading-tight sm:leading-snug mb-5 sm:mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-stone-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 font-semibold text-xs sm:text-sm flex-shrink-0">
                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-stone-700 text-sm sm:text-base">
                  {blog.user?.name || "Anonymous"}
                </p>
                <p className="text-xs text-stone-400">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-stone-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {blog.description}
            </div>

            {/* Comments section */}
            <div className="mt-10 border-t border-stone-100 pt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-5">
                Comments ({comments.length})
              </h2>

              <div className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write your comment..."
                  rows="3"
                  className="w-full bg-[#F5F0E8] border border-stone-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
                <button
                  onClick={handleComment}
                  className="mt-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Add Comment
                </button>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-stone-400 text-sm text-center py-6">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="bg-[#F5F0E8] border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 text-xs font-semibold">
                          {(comment.user?.name?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <span className="font-semibold text-stone-700 text-sm">
                          {comment.user?.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-stone-400 ml-auto">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed ml-8">
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogDetails;