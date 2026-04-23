import { Heart, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-clinic-navy text-clinic-blue-light relative overflow-hidden">
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pet Medic" className="h-10 w-auto" />
          <p className="text-sm opacity-80">Professional veterinary care</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs opacity-70">
          <span className="flex items-center gap-1"><Phone size={12} /> +20 123 456 789</span>
          <span className="flex items-center gap-1"><Mail size={12} /> info@petmedic.com</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> Cairo, Egypt</span>
        </div>
      </div>
      <div className="border-t border-clinic-blue/20 mt-4 pt-4 text-center text-xs opacity-50">
        <p className="flex items-center justify-center gap-1">
          © 2026 Pet Medic. Made with <Heart size={12} className="text-clinic-red" /> for pets.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;