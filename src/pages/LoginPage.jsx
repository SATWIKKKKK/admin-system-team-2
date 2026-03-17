import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Menu, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (isLogin) {
      login(email, password, role);
    } else {
      signup(name, email, password, role);
    }
    setLoading(false);
    navigate("/");
  };

  const navLinks = ["Home", "About", "Events"];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-[#f59e0b] text-xl font-bold">&lt;/&gt;</span>
              <span className="text-lg font-semibold tracking-tight">Tech Club</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Desktop Sign Up button */}
            <div className="hidden md:block">
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="px-4 py-2 text-sm font-medium text-[#f59e0b] border border-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/10 transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden text-gray-400 hover:text-white cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-[#0a0a0a] overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setMenuOpen(false);
                  }}
                  className="w-full mt-2 px-4 py-2 text-sm font-medium text-[#f59e0b] border border-[#f59e0b] rounded-lg hover:bg-[#f59e0b]/10 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl">
            {/* Orange code icon */}
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
                <span className="text-[#f59e0b] text-lg font-bold">&lt;&gt;</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {isLogin
                  ? "Log in to your Tech Club account"
                  : "Sign up for your Tech Club account"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1.5 mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/50 transition-colors"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/50 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/50 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role select */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  {isLogin ? "Login as" : "Role"}
                </label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full bg-[#0a0a0a] border-white/10 text-white h-10 rounded-lg focus:ring-[#f59e0b]/50 focus:border-[#f59e0b]/50 [&>svg]:text-gray-500">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Lead">Domain Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Keep me logged in */}
              {isLogin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="keepLoggedIn"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#0a0a0a] accent-[#f59e0b] cursor-pointer"
                  />
                  <label htmlFor="keepLoggedIn" className="text-sm text-gray-400 cursor-pointer select-none">
                    Keep me logged in
                  </label>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer group"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider & social login (login mode only) */}
            {isLogin && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </button>
                </div>
              </>
            )}

            {/* Toggle sign up / sign in */}
            <p className="text-center text-sm text-gray-400 mt-6">
              {isLogin ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors cursor-pointer"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-[#f59e0b] hover:text-[#d97706] font-medium transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
