import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

// Netflix-style category colors (dark mode with red/pink accents)
const categoryColors = {
  Technology: "bg-red-500/20 text-red-400 border border-red-500/30",
  Lifestyle: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
  Travel: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  Food: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Sports: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Programming: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  Business: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Health: "bg-green-500/20 text-green-400 border border-green-500/30",
  Productivity: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  default: "bg-gray-800 text-gray-300 border border-gray-700",
};

function getImageUrl(image, fallback) {
  if (!image) return fallback;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_API_URL}/${image.replace(/^\/+/, "")}`;
}

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
        const { data } = await API.get(`/api/blogs/${id}`);
        if (isMountedRef.current) setBlog(data);
        API.put(`/api/blogs/${id}/view`).catch((err) => console.log("View increment failed:", err));
      } catch (error) {
        console.error("Blog fetch error:", error);
        toast.error("Failed to fetch blog");
        setBlog(null);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const { data } = await API.get(`/api/comments/${id}`);
        if (isMountedRef.current) {
          const formattedComments = data.map((comment) => ({
            ...comment,
            isLiked: false,
          }));
          setComments(formattedComments);
        }
      } catch (error) {
        console.error("Comments fetch error:", error);
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
      const { data } = await API.post(
        `/api/comments/${id}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([{ ...data, isLiked: false }, ...comments]);
      setCommentText("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const handleLike = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const oldComments = [...comments];
    const targetComment = comments.find((c) => c._id === commentId);
    if (!targetComment) return;

    const isLiked = targetComment.isLiked;

    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === commentId) {
          const currentLikes = comment.likes?.length || 0;
          return {
            ...comment,
            likes: Array(isLiked ? Math.max(currentLikes - 1, 0) : currentLikes + 1).fill("liked"),
            isLiked: !isLiked,
          };
        }
        return comment;
      })
    );

    try {
      const { data } = await API.put(
        `/api/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: Array(data.likes).fill("liked"),
              isLiked: data.liked,
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to like comment");
      setComments(oldComments);
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
          <p className="mt-4 text-gray-400 text-sm">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-2">Blog not found</h2>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all duration-300 shadow-md shadow-red-500/20 transform hover:scale-105"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const placeholderImage = "https://placehold.co/1200x600?text=No+Image";
  const categoryClass = categoryColors[blog.category] || categoryColors.default;
  const imageUrl = getImageUrl(blog.image, placeholderImage);

  return (
    <div className="min-h-screen bg-black py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">

        {/* back button - responsive spacing */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs sm:text-sm font-medium mb-4 sm:mb-5 transition-colors group"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        {/* blog card - fully responsive glass card */}
        <article className="bg-gray-900/50 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-800 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-red-900/20">

          {/* image - responsive aspect ratio */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[16/9] bg-gray-900 overflow-hidden">
            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* content - responsive padding */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">

            {/* category + views - responsive layout */}
            <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
              <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full ${categoryClass}`}>
                {blog.category || "Uncategorized"}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path fillRule="evenodd" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" clipRule="evenodd" />
                </svg>
                {(blog.views || 0).toLocaleString()} views
              </span>
            </div>

            {/* title - responsive font sizes */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 sm:mb-5">
              {blog.title}
            </h1>

            {/* author - responsive layout */}
            <div className="flex items-center gap-3 pb-4 sm:pb-5 border-b border-gray-800 mb-5 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-500/50 blur-md opacity-50" />
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                  {(blog.user?.name?.charAt(0) || "A").toUpperCase()}
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-white">
                  {blog.user?.name || "Anonymous"}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* description - responsive text size and line height */}
            <div className="text-sm sm:text-[15px] md:text-base text-gray-300 leading-6 sm:leading-7 md:leading-7 whitespace-pre-wrap break-words">
              {blog.description}
            </div>

            {/* COMMENTS SECTION */}
            <div className="mt-8 sm:mt-10 md:mt-12 border-t border-gray-800 pt-6 sm:pt-8">

              {/* header */}
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
                  Comments
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Join the conversation</p>
              </div>

              {/* comment input - stack on mobile, row on tablet+ */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 mb-8">
                <div className="relative self-start">
                  <div className="absolute inset-0 rounded-full bg-red-500/30 blur-sm" />
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                    U
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl sm:rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleComment}
                      className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-medium transition-all duration-300 shadow-md shadow-red-500/20 transform hover:scale-105 active:scale-95"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* comments list */}
              <div className="space-y-5 sm:space-y-6 md:space-y-7">
                {comments.length === 0 ? (
                  <div className="text-center py-8 sm:py-10 bg-gray-800/30 rounded-xl border border-gray-800">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-2 sm:gap-3 group animate-fade-in">
                      {/* avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-red-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-md">
                          {(comment.user?.name?.charAt(0) || "U").toUpperCase()}
                        </div>
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                            {comment.user?.name || "Anonymous"}
                          </h3>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-300 leading-5 sm:leading-6 whitespace-pre-wrap break-words">
                          {comment.text}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => handleLike(comment._id)}
                            className={`flex items-center gap-1 text-xs transition-all active:scale-95 ${
                              comment.isLiked
                                ? "text-red-500"
                                : "text-gray-500 hover:text-red-400"
                            }`}
                          >
                            <span className="text-sm sm:text-base">
                              {comment.isLiked ? "❤️" : "🤍"}
                            </span>
                            <span className="text-xs sm:text-sm">{comment.likes?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BlogDetails;