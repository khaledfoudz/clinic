import { Heart } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer style={{ backgroundColor: "#EEF2F7" }} className="relative overflow-hidden">
    <div className="container mx-auto px-6 py-10 relative">

      {/* Top section */}
      <div className="flex flex-col items-center gap-3 text-center">
        <img src={logo} alt="Pet Medic" className="h-14 w-auto" />
        <p style={{ color: "#1A2744", opacity: 0.5, fontSize: "13px", letterSpacing: "0.08em" }}>
          CAIRO, EGYPT — PROFESSIONAL VETERINARY CARE
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(26,39,68,0.12)", margin: "28px 0" }} />

      {/* Bottom section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <p style={{ color: "#1A2744", opacity: 0.35, fontSize: "12px" }}>
          © 2026 Pet Medic. All rights reserved.
        </p>
        <p className="flex items-center gap-1" style={{ color: "#1A2744", opacity: 0.35, fontSize: "12px" }}>
          Made with <Heart size={11} style={{ color: "#C0392B", opacity: 0.8 }} /> for every pet
        </p>
      </div>

    </div>
  </footer>
);

export default Footer;