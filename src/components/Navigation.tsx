import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/adopt", label: "Adopt" },
    { to: "/knowledge", label: "Knowledge" },
    { to: "/donate", label: "Donate" },
    { to: "/volunteer", label: "Volunteer" },
    { to: "/lost-found", label: "Lost & Found" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-sm shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Paws Haven
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "nav-link",
                  isActive(item.to) && "nav-link-active"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Emergency Donate Button */}
          <div className="hidden md:block">
            <Link
              to="/donate"
              className="hero-button-primary text-sm px-4 py-2"
            >
              Emergency Help
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-accent"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block nav-link",
                  isActive(item.to) && "nav-link-active"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setIsOpen(false)}
              className="block hero-button-primary text-center text-sm mt-4"
            >
              Emergency Help
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;