import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/register", formData);
      toast.success(data.message || "Registration successful!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#F5F0E8] border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition";

  const labelClass =
    "block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8] px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#FFFCF7] rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">

          {/* header */}
          <div className="bg-[#3D2B1F] px-5 sm:px-8 py-8 text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F5F0E8]">Create account</h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-1">Join the Blogger community</p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 space-y-5">

            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className={inputClass}
                onChange={handleChange}
                value={formData.name}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className={inputClass}
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className={inputClass}
                onChange={handleChange}
                value={formData.password}
                required
                minLength={6}
              />
              <p className="text-xs text-stone-400 mt-1.5">Must be at least 6 characters</p>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-stone-900 font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-stone-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </div>

            <p className="text-center text-sm text-stone-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-amber-700 hover:text-amber-600 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>

          </form>
        </div>

        <p className="text-center text-xs text-stone-400 mt-5 px-2">
          By registering, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Register;