import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Heart, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Paws Haven
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Dedicated to rescuing, rehabilitating, and rehoming animals in need. 
              Together, we give them a second chance at happiness.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/adopt", label: "Pet Adoption" },
                { to: "/lost-found", label: "Lost & Found" },
                { to: "/volunteer", label: "Volunteer" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">help@pawshaven.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">
                  123 Shelter Lane, Pet City, PC 12345
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Emergency</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-secondary" />
                <div>
                  <p className="text-sm font-medium text-foreground">24/7 Emergency</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 911-PETS</p>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Police: 911</p>
                <p className="text-muted-foreground">Fire Department: 911</p>
                <p className="text-muted-foreground">Animal Control: +1 (555) ANIMAL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2024 Paws Haven Animal Shelter. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;