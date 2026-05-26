import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

function Navbar() {

  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState(
      JSON.parse(
        localStorage.getItem("user")
      ) || null
    );

  const menuRef = useRef(null);

  const token =
    localStorage.getItem("token");

  // logout
  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    toast.success("Logout Success");

    navigate("/login");

    setIsMenuOpen(false);

  };

  // close menu
  const closeMenu = () =>
    setIsMenuOpen(false);

  // toggle menu
  const toggleMenu = () =>
    setIsMenuOpen((prev) => !prev);

  // ESC close
  useEffect(() => {

    const handleEscape = (e) => {

      if (e.key === "Escape") {

        closeMenu();

      }

    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

    };

  }, []);

  // prevent scroll
  useEffect(() => {

    if (isMenuOpen) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "unset";

    }

    return () => {

      document.body.style.overflow =
        "unset";

    };

  }, [isMenuOpen]);

  // resize close
  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth >= 768) {

        closeMenu();

      }

    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

    };

  }, []);

  // live user update
  useEffect(() => {

    const updateUser = () => {

      setCurrentUser(
        JSON.parse(
          localStorage.getItem("user")
        ) || null
      );

    };

    window.addEventListener(
      "userUpdated",
      updateUser
    );

    return () => {

      window.removeEventListener(
        "userUpdated",
        updateUser
      );

    };

  }, []);

  return (
    <>
      {/* navbar */}
      <nav className="bg-[#3D2B1F] text-stone-100 sticky top-0 z-50 border-b border-stone-700">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-center h-16">

            {/* logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={closeMenu}
            >

              <span className="text-xl font-bold tracking-tight text-[#F5F0E8]">
                BlogApp
              </span>

            </Link>

            {/* desktop */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">

              {token ? (
                <>
                  {/* write */}
                  <Link
                    to="/create-blog"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                  >
                    + Write
                  </Link>

                  {/* dashboard */}
                  <Link
                    to="/dashboard"
                    className="bg-stone-700 hover:bg-stone-600 text-stone-100 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>

                  <div className="h-5 w-px bg-stone-600" />

                  {/* profile */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 hover:bg-stone-700 px-2 py-1 rounded-lg transition"
                  >

                    {/* image */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-600 flex items-center justify-center text-amber-50 text-sm font-semibold">

                      {currentUser?.profileImage ? (

                        <img
                          src={
                            currentUser.profileImage
                          }
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        currentUser?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"

                      )}

                    </div>

                    {/* name */}
                    <span className="hidden lg:inline text-sm text-stone-300">

                      {currentUser?.name
                        ?.split(" ")[0] ||
                        "User"}

                    </span>

                  </Link>

                  {/* logout */}
                  <button
                    onClick={handleLogout}
                    className="bg-transparent border border-stone-600 hover:border-stone-400 hover:text-stone-100 text-stone-400 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* login */}
                  <Link
                    to="/login"
                    className="text-stone-300 hover:text-stone-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>

                  {/* register */}
                  <Link
                    to="/register"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-5 py-1.5 rounded-full text-sm font-semibold transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* mobile button */}
            <button
              onClick={toggleMenu}
              className="md:hidden relative w-10 h-10 rounded-lg bg-stone-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors hover:bg-stone-700"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex flex-col justify-between items-center">

                <span
                  className={`w-5 h-0.5 bg-stone-300 rounded-full transition-all duration-300 ${
                    isMenuOpen
                      ? "rotate-45 translate-y-2"
                      : ""
                  }`}
                />

                <span
                  className={`w-5 h-0.5 bg-stone-300 rounded-full transition-all duration-300 ${
                    isMenuOpen
                      ? "opacity-0"
                      : ""
                  }`}
                />

                <span
                  className={`w-5 h-0.5 bg-stone-300 rounded-full transition-all duration-300 ${
                    isMenuOpen
                      ? "-rotate-45 -translate-y-2"
                      : ""
                  }`}
                />

              </div>

            </button>

          </div>

        </div>

      </nav>

      {/* backdrop */}
      {isMenuOpen && (

        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />

      )}

      {/* mobile menu */}
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 right-0 z-40 bg-[#3D2B1F] border-b border-stone-700 shadow-xl transition-all duration-300 ease-out md:hidden ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >

        <div className="p-5 space-y-4">

          {token ? (
            <>
              {/* user card */}
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 pb-4 border-b border-stone-700 hover:bg-stone-800/40 rounded-xl transition p-2"
              >

                {/* image */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-600 flex items-center justify-center text-amber-50 text-lg font-bold">

                  {currentUser?.profileImage ? (

                    <img
                      src={
                        currentUser.profileImage
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    currentUser?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"

                  )}

                </div>

                {/* info */}
                <div>

                  <p className="font-semibold text-stone-100">

                    {currentUser?.name ||
                      "User"}

                  </p>

                  <p className="text-xs text-stone-400">

                    {currentUser?.email ||
                      "user@example.com"}

                  </p>

                </div>

              </Link>

              {/* create */}
              <Link
                to="/create-blog"
                onClick={closeMenu}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 text-stone-200 font-medium transition"
              >

                <span>Create Blog</span>

                <span className="text-amber-500">
                  →
                </span>

              </Link>

              {/* dashboard */}
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 text-stone-200 font-medium transition"
              >

                <span>Dashboard</span>

                <span className="text-amber-500">
                  →
                </span>

              </Link>

              {/* logout */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 text-stone-200 font-medium transition"
              >

                <span>Logout</span>

                <span className="text-amber-500">
                  →
                </span>

              </button>
            </>
          ) : (
            <>
              {/* login */}
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 text-stone-200 font-medium transition"
              >

                <span>Login</span>

                <span className="text-amber-500">
                  →
                </span>

              </Link>

              {/* register */}
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium transition"
              >

                <span>Register</span>

                <span className="text-amber-500">
                  →
                </span>

              </Link>
            </>
          )}

        </div>

      </div>
    </>
  );
}

export default Navbar;