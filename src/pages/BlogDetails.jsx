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

function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // FETCH BLOG
    const fetchBlog = async () => {
      setLoading(true);

      try {
        const { data } = await API.get(`/api/blogs/${id}`);

        if (isMountedRef.current) {
          setBlog(data);
        }

        // increment views separately
        API.put(`/api/blogs/${id}/view`).catch((err) => {
          console.log("View increment failed:", err);
        });

      } catch (error) {
        console.error("Blog fetch error:", error);

        toast.error("Failed to fetch blog");

        setBlog(null);

      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    // FETCH COMMENTS
    const fetchComments = async () => {
      try {
        console.log(
          `Fetching comments from ${API.defaults.baseURL}/api/comments/${id}`
        );

        const { data } = await API.get(`/api/comments/${id}`);

        if (isMountedRef.current) {
          setComments(data);
        }

      } catch (error) {
        console.error(
          "Comments fetch error:",
          error.response?.status,
          error.response?.data
        );
      }
    };

    fetchBlog();
    fetchComments();

    return () => {
      isMountedRef.current = false;
    };
  }, [id]);

  // ADD COMMENT
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments([data, ...comments]);

      setCommentText("");

      toast.success("Comment added");

    } catch (error) {
      console.error("Add comment error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to add comment"
      );
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto" />
          <p className="mt-4 text-stone-500 text-sm">
            Loading blog post...
          </p>
        </div>
      </div>
    );
  }

  // BLOG NOT FOUND
  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-stone-700 mb-2">
            Blog not found
          </h2>

          <Link
            to="/"
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-6 py-2.5 rounded-full text-sm transition-colors inline-block"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const placeholderImage =
    "https://via.placeholder.com/1200x600?text=Blog+Image";

  const categoryClass =
    categoryColors[blog.category] ||
    categoryColors.default;

  const imageUrl = blog.image
    ? blog.image.startsWith("http")
      ? blog.image
      : `${import.meta.env.VITE_API_URL}/${blog.image.replace(/^\/+/, "")}`
    : placeholderImage;
    const handleLike = async (commentId) => {

  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login first");
    return;
  }

  try {

    const { data } = await API.put(
      `/api/comments/${commentId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likes: Array(data.likes).fill("liked"),
            }
          : comment
      )
    );

  } catch (error) {

    console.log(error);

    toast.error("Failed to like comment");

  }
};

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium mb-5 sm:mb-7 transition-colors"
        >
          ← Back to home
        </Link>

        <article className="bg-[#FFFCF7] rounded-2xl border border-stone-200 overflow-hidden shadow-sm">

          <div className="relative w-full bg-stone-200 aspect-video">

            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />

          </div>

          <div className="p-5 sm:p-6 md:p-8 lg:p-10">

            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryClass}`}
              >
                {blog.category || "Uncategorized"}
              </span>

              <span className="text-xs text-stone-400">
                👁 {blog.views || 0} views
              </span>

            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-stone-800 leading-tight sm:leading-snug mb-5 sm:mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-stone-100">

              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 font-semibold text-xs sm:text-sm">

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

            {/* COMMENTS */}
            <div className="mt-10 border-t border-stone-100 pt-8">

              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-5">
                Comments ({comments.length})
              </h2>

              <div className="mb-8">

                <textarea
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(e.target.value)
                  }
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

                    <div
                      key={comment._id}
                      className="bg-[#F5F0E8] border border-stone-200 rounded-xl p-4"
                    >

                      <div className="flex items-center gap-2 mb-2">

                        <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 text-xs font-semibold">

                          {(comment.user?.name?.charAt(0) || "U").toUpperCase()}

                        </div>

                        <span className="font-semibold text-stone-700 text-sm">
                          {comment.user?.name || "Anonymous"}
                        </span>

                      </div>

                      <p className="text-sm text-stone-600 leading-relaxed ml-8">
                        {comment.text}
                      </p>
                      <div className="ml-8 mt-2">

  <button
    onClick={() => handleLike(comment._id)}
    className="text-xs text-amber-700 hover:text-amber-500 font-medium"
  >
    ❤️ {comment.likes?.length || 0} Likes
  </button>

</div>

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