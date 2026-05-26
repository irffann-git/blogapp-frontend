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

        const { data } = await API.get(
          `/api/blogs/${id}`
        );

        if (isMountedRef.current) {
          setBlog(data);
        }

        // increment views
        API.put(
          `/api/blogs/${id}/view`
        ).catch((err) => {
          console.log(
            "View increment failed:",
            err
          );
        });

      } catch (error) {

        console.error(
          "Blog fetch error:",
          error
        );

        toast.error(
          "Failed to fetch blog"
        );

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

        const { data } = await API.get(
          `/api/comments/${id}`
        );

        if (isMountedRef.current) {

          const formattedComments = data.map(
            (comment) => ({
              ...comment,
              isLiked: false,
            })
          );

          setComments(formattedComments);

        }

      } catch (error) {

        console.error(
          "Comments fetch error:",
          error
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

      toast.error(
        "Comment cannot be empty"
      );

      return;

    }

    const token =
      localStorage.getItem("token");

    if (!token) {

      toast.error(
        "Please login first"
      );

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

      setComments([
        {
          ...data,
          isLiked: false,
        },
        ...comments,
      ]);

      setCommentText("");

      toast.success("Comment added");

    } catch (error) {

      console.error(
        "Add comment error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to add comment"
      );

    }

  };

  // LIKE COMMENT
  const handleLike = async (commentId) => {

    const token = localStorage.getItem("token");

    if (!token) {

      toast.error("Please login first");

      return;

    }

    // backup
    const oldComments = [...comments];

    // find target
    const targetComment = comments.find(
      (comment) => comment._id === commentId
    );

    if (!targetComment) return;

    const isLiked = targetComment.isLiked;

    // optimistic update
    setComments((prevComments) =>
      prevComments.map((comment) => {

        if (comment._id === commentId) {

          const currentLikes =
            comment.likes?.length || 0;

          return {
            ...comment,

            likes: Array(
              isLiked
                ? Math.max(currentLikes - 1, 0)
                : currentLikes + 1
            ).fill("liked"),

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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // sync backend state
      setComments((prevComments) =>
        prevComments.map((comment) => {

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

      // rollback
      setComments(oldComments);

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

  return (

    <div className="min-h-screen bg-[#F5F0E8] py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-4xl mx-auto">

        {/* back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-amber-700 text-sm font-medium mb-6 transition-colors"
        >
          ← Back to home
        </Link>

        {/* blog card */}
        <article className="bg-[#FFFCF7] rounded-3xl border border-stone-200 overflow-hidden shadow-sm">

          {/* image */}
          <div className="relative w-full aspect-video bg-stone-200">

            <img
              src={imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />

          </div>

          {/* content */}
          <div className="p-5 sm:p-8 md:p-10">

            {/* category + views */}
            <div className="flex flex-wrap items-center gap-3 mb-5">

              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryClass}`}
              >
                {blog.category || "Uncategorized"}
              </span>

              <span className="text-xs text-stone-400">
                👁 {blog.views || 0} views
              </span>

            </div>

            {/* title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 leading-tight mb-6">
              {blog.title}
            </h1>

            {/* author */}
            <div className="flex items-center gap-3 pb-6 border-b border-stone-100 mb-8">

              <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">

                {(blog.user?.name?.charAt(0) || "A").toUpperCase()}

              </div>

              <div>

                <p className="font-semibold text-stone-700">
                  {blog.user?.name || "Anonymous"}
                </p>

                <p className="text-xs text-stone-400">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>

              </div>

            </div>

            {/* description */}
            <div className="text-stone-600 leading-relaxed text-[15px] whitespace-pre-wrap">
              {blog.description}
            </div>

            {/* COMMENTS */}
            <div className="mt-12 border-t border-stone-200 pt-8">

              {/* header */}
              <div className="mb-6">

                <h2 className="text-xl sm:text-2xl font-semibold text-stone-800">
                  Comments
                </h2>

                <p className="text-sm text-stone-400 mt-1">
                  {comments.length} responses
                </p>

              </div>

              {/* comment input */}
              <div className="flex gap-3 mb-8">

                {/* avatar */}
                <div className="
                  w-10 h-10
                  rounded-full
                  bg-amber-500
                  flex items-center justify-center
                  text-white
                  font-semibold
                  flex-shrink-0
                ">
                  U
                </div>

                <div className="flex-1">

                  <textarea
                    value={commentText}
                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }
                    placeholder="Add a comment..."
                    rows="3"
                    className="
                      w-full
                      border border-stone-200
                      rounded-2xl
                      px-4 py-3
                      text-sm
                      bg-white
                      focus:outline-none
                      focus:ring-2
                      focus:ring-amber-400
                      resize-none
                    "
                  />

                  <div className="
                    flex justify-end mt-3
                  ">

                    <button
                      onClick={handleComment}
                      className="
                        px-5 py-2
                        rounded-full
                        bg-stone-900
                        hover:bg-stone-800
                        text-white
                        text-sm
                        font-medium
                        transition-colors
                      "
                    >
                      Post
                    </button>

                  </div>

                </div>

              </div>

              {/* comments list */}
              <div className="space-y-6">

                {comments.length === 0 ? (

                  <p className="
                    text-sm
                    text-stone-400
                    text-center
                    py-6
                  ">
                    No comments yet.
                  </p>

                ) : (

                  comments.map((comment) => (

                    <div
                      key={comment._id}
                      className="flex gap-3"
                    >

                      {/* avatar */}
                      <div className="
                        w-10 h-10
                        rounded-full
                        bg-amber-500
                        flex items-center justify-center
                        text-white
                        text-sm
                        font-semibold
                        flex-shrink-0
                      ">

                        {(comment.user?.name?.charAt(0) || "U").toUpperCase()}

                      </div>

                      {/* content */}
                      <div className="flex-1">

                        {/* top */}
                        <div className="
                          flex items-center gap-2
                          mb-1
                        ">

                          <h3 className="
                            text-sm
                            font-semibold
                            text-stone-800
                          ">
                            {comment.user?.name || "Anonymous"}
                          </h3>

                          <span className="
                            text-xs
                            text-stone-400
                          ">
                            {new Date(
                              comment.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        {/* comment */}
                        <p className="
                          text-sm
                          text-stone-700
                          leading-relaxed
                          whitespace-pre-wrap
                        ">
                          {comment.text}
                        </p>

                        {/* actions */}
                        <div className="
                          flex items-center gap-4
                          mt-2
                        ">

                          <button
                            onClick={() =>
                              handleLike(comment._id)
                            }
                            className={`
                              flex items-center gap-1
                              text-xs transition-colors
                              ${
                                comment.isLiked
                                  ? "text-rose-500"
                                  : "text-stone-500 hover:text-rose-500"
                              }
                            `}
                          >

                            <span>
                              {comment.isLiked
                                ? "❤️"
                                : "🤍"}
                            </span>

                            <span>
                              {comment.likes?.length || 0}
                            </span>

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

    </div>

  );

}

export default BlogDetails;