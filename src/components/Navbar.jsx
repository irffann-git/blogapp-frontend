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
    return () => document.removeEventListener("keydown", handleEscape);
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
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with subtle glow */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={closeMenu}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center shadow-md shadow-red-500/20 group-hover:shadow-red-500/40 transition-all duration-300">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent group-hover:to-white transition-all duration-300">
                BlogApp
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              {token ? (
                <>
                  <Link
                    to="/create-blog"
                    className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-red-500/40 transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Write
                    </span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="relative group px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  </Link>

                  <div className="h-6 w-px bg-white/10 mx-1" />

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 group/profile"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-red-500/50 blur-md opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover/profile:scale-105">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>
                    <span className="hidden lg:inline text-sm text-gray-300 group-hover/profile:text-white transition-colors">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="relative group px-4 py-2 rounded-full text-sm font-medium border border-white/20 text-gray-300 hover:text-white hover:border-red-500/50 transition-all duration-200"
                  >
                    <span className="relative z-10">Logout</span>
                    <span className="absolute inset-0 rounded-full bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-200" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="relative group px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <span className="relative z-10">Login</span>
                    <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  </Link>

                  <Link
                    to="/register"
                    className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md shadow-red-500/20 hover:shadow-red-500/40 transform hover:scale-105"
                  >
                    <span className="relative z-10">Register</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden relative w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
            >
              <div className="absolute left-1/2 top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between">
                <span
                  className={`h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isMenuOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-white rounded-full transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop with blur */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer - Fixed text colors */}
      <div
        ref={menuRef}
        className={`fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-2xl transition-all duration-400 md:hidden ${
          isMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-5 space-y-3">
          {token ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-2">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-red-500/50 blur-md" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white text-base">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              {/* Create Blog link */}
              <Link
                to="/create-blog"
                onClick={closeMenu}
                className="group flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-red-500/30"
              >
                <span className="font-medium text-white">Create Blog</span>
                <span className="text-red-500 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* Dashboard link */}
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="group flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-red-500/30"
              >
                <span className="font-medium text-white">Dashboard</span>
                <span className="text-red-500 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* Profile link (added for convenience) */}
              <Link
                to="/profile"
                onClick={closeMenu}
                className="group flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-red-500/30"
              >
                <span className="font-medium text-white">Profile</span>
                <span className="text-red-500 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="group w-full flex justify-between items-center px-4 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all duration-200 border border-red-500/20 text-red-400 hover:text-red-300"
              >
                <span className="font-medium">Logout</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </>
          ) : (
            <>
              {/* Login link */}
              <Link
                to="/login"
                onClick={closeMenu}
                className="group flex justify-between items-center px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-red-500/30"
              >
                <span className="font-medium text-white">Login</span>
                <span className="text-red-500 transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              {/* Register link */}
              <Link
                to="/register"
                onClick={closeMenu}
                className="group flex justify-between items-center px-4 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-all duration-200 border border-red-500/20 text-red-400 hover:text-red-300"
              >
                <span className="font-medium">Register</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default Navbar;