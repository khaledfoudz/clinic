import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Patient Form" },
  { to: "/dashboard", label: "Dashboard" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Pet Medic" className="h-14 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Login Button */}
          <Link
            to="/login"
            className={`ml-3 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/login"
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Login */}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className={`block text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/login"
                ? "bg-green-700 text-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;