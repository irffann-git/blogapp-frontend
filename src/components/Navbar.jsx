import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logout Success");
    navigate("/login");
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <nav className="bg-[#3D2B1F] text-stone-100 sticky top-0 z-50 border-b border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={closeMenu}
            >
              <span className="text-xl font-bold tracking-tight text-[#F5F0E8]">
                BlogApp
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <>
                  <Link
                    to="/create-blog"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-4 py-2 rounded-full text-sm font-semibold transition"
                  >
                    + Write
                  </Link>

                  <Link
                    to="/dashboard"
                    className="bg-stone-700 hover:bg-stone-600 text-stone-100 px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    Dashboard
                  </Link>


                  <div className="h-5 w-px bg-stone-600"></div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-amber-50 text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <span className="hidden lg:inline text-sm text-stone-300">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="border border-stone-600 hover:border-stone-400 hover:text-white text-stone-400 px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-stone-300 hover:text-white px-3 py-2 text-sm font-medium transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-5 py-2 rounded-full text-sm font-semibold transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden relative w-10 h-10 rounded-lg bg-stone-800/50 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between">
                <span
                  className={`h-0.5 bg-white rounded transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-white rounded transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-white rounded transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 right-0 z-40 bg-[#3D2B1F] border-b border-stone-700 shadow-xl transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-5 space-y-4">
          {token ? (
            <>
              <div className="flex items-center gap-3 pb-4 border-b border-stone-700">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-lg font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs text-stone-400">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <Link
                to="/create-blog"
                onClick={closeMenu}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 transition"
              >
                <span>Create Blog</span>
                <span className="text-amber-500">→</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 transition"
              >
                <span>Dashboard</span>
                <span className="text-amber-500">→</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
              >
                <span>Logout</span>
                <span>→</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-stone-800/50 hover:bg-stone-700 transition"
              >
                <span>Login</span>
                <span className="text-amber-500">→</span>
              </Link>

              <Link
                to="/register"
                onClick={closeMenu}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition"
              >
                <span>Register</span>
                <span>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;