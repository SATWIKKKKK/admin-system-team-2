import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password, role = "Admin") => {
    const mockUser = {
      id: "u1",
      email,
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
      domain: role === "Lead" ? "Web Development" : null,
    };
    setUser(mockUser);
    return mockUser;
  };

  const signup = (name, email, password, role = "Admin") => {
    const mockUser = { id: "u" + Date.now(), email, name, role, domain: null };
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === "Admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
