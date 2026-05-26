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
          setComments(data);
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

      setComments([data, ...comments]);

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

    const token =
      localStorage.getItem("token");

    if (!token) {

      toast.error(
        "Please login first"
      );

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
                likes: Array(data.likes).fill(
                  "liked"
                ),
              }
            : comment
        )
      );

    } catch (error) {

      console.log(error);

      toast.error(
        "Failed to like comment"
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

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">

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
            <div className="mt-14">

              {/* top */}
              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-stone-800">
                    Discussion
                  </h2>

                  <p className="text-sm text-stone-400 mt-1">
                    Join the community conversation
                  </p>

                </div>

                <div className="
                  hidden sm:flex
                  items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-gradient-to-r
                  from-orange-100
                  to-amber-100
                  text-orange-700
                  text-xs font-semibold
                  shadow-sm
                ">

                  🔥 {comments.length} Comments

                </div>

              </div>

              {/* comment box */}
              <div className="
                relative
                overflow-hidden
                rounded-3xl
                border border-white/30
                bg-white/70
                backdrop-blur-xl
                shadow-[0_8px_40px_rgba(0,0,0,0.06)]
                p-5 sm:p-6
                mb-10
              ">

                <div className="
                  absolute inset-0
                  bg-gradient-to-r
                  from-amber-100/20
                  to-orange-100/20
                  pointer-events-none
                " />

                <div className="relative">

                  <textarea
                    value={commentText}
                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }
                    placeholder="Share your thoughts..."
                    rows="4"
                    className="
                      w-full
                      bg-transparent
                      resize-none
                      border-none
                      focus:outline-none
                      text-stone-700
                      placeholder-stone-400
                      text-sm sm:text-base
                    "
                  />

                  <div className="
                    flex items-center justify-between
                    mt-5
                  ">

                    <p className="
                      text-xs
                      text-stone-400
                    ">
                      Be respectful and constructive
                    </p>

                    <button
                      onClick={handleComment}
                      className="
                        group
                        relative
                        overflow-hidden
                        px-6 py-3
                        rounded-2xl
                        bg-gradient-to-r
                        from-amber-500
                        to-orange-500
                        text-white
                        text-sm font-semibold
                        shadow-lg shadow-orange-500/20
                        hover:scale-105
                        transition-all duration-300
                      "
                    >

                      Post Comment

                    </button>

                  </div>

                </div>

              </div>

              {/* comments */}
              <div className="space-y-5">

                {comments.length === 0 ? (

                  <div className="
                    text-center
                    py-14
                    rounded-3xl
                    bg-white/60
                    border border-stone-100
                  ">

                    <div className="text-5xl mb-3">
                      💭
                    </div>

                    <h3 className="
                      text-lg
                      font-semibold
                      text-stone-700
                    ">
                      No comments yet
                    </h3>

                    <p className="
                      text-sm
                      text-stone-400
                      mt-1
                    ">
                      Start the conversation
                    </p>

                  </div>

                ) : (

                  comments.map((comment) => (

                    <div
                      key={comment._id}
                      className="
                        group
                        relative
                        overflow-hidden
                        rounded-3xl
                        border border-white/40
                        bg-white/70
                        backdrop-blur-xl
                        shadow-[0_8px_30px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                        transition-all duration-300
                        p-5
                      "
                    >

                      <div className="
                        absolute top-0 left-0
                        w-full h-[2px]
                        bg-gradient-to-r
                        from-amber-400
                        via-orange-400
                        to-rose-400
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity duration-500
                      " />

                      <div className="
                        flex items-start gap-4
                      ">

                        {/* avatar */}
                        <div className="
                          w-11 h-11
                          rounded-2xl
                          bg-gradient-to-br
                          from-amber-500
                          to-orange-500
                          flex items-center justify-center
                          text-white
                          font-bold
                          shadow-lg shadow-orange-500/20
                          flex-shrink-0
                        ">

                          {(comment.user?.name?.charAt(0) || "U").toUpperCase()}

                        </div>

                        {/* content */}
                        <div className="flex-1 min-w-0">

                          <div className="
                            flex items-center gap-2
                            flex-wrap
                          ">

                            <h3 className="
                              font-semibold
                              text-stone-800
                              text-sm sm:text-base
                            ">
                              {comment.user?.name || "Anonymous"}
                            </h3>

                            <span className="
                              text-[10px]
                              px-2 py-0.5
                              rounded-full
                              bg-stone-100
                              text-stone-500
                              font-medium
                            ">
                              Community Member
                            </span>

                          </div>

                          <p className="
                            mt-2
                            text-sm sm:text-[15px]
                            text-stone-600
                            leading-relaxed
                            whitespace-pre-wrap
                          ">
                            {comment.text}
                          </p>

                          {/* actions */}
                          <div className="
                            flex items-center gap-3
                            mt-4
                          ">

                            <button
                              onClick={() =>
                                handleLike(comment._id)
                              }
                              className="
                                group/like
                                flex items-center gap-2
                                px-4 py-2
                                rounded-2xl
                                bg-rose-50
                                hover:bg-rose-100
                                border border-rose-100
                                hover:border-rose-200
                                transition-all duration-300
                              "
                            >

                              <span className="
                                text-sm
                                group-hover/like:scale-125
                                transition-transform duration-300
                              ">
                                ❤️
                              </span>

                              <span className="
                                text-xs font-semibold
                                text-rose-600
                              ">
                                {comment.likes?.length || 0}
                              </span>

                            </button>

                            <span className="
                              text-xs
                              text-stone-400
                            ">
                              {new Date(
                                comment.createdAt
                              ).toLocaleDateString()}
                            </span>

                          </div>

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