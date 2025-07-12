import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Home,
  Phone,
  Gem,
  CarFront,
  Car
} from "lucide-react";
import FadeInItem from "../common/FadeInItem";

const Footer = () => {
  return (
    <footer className="bg-background-secondary text-text-primary text-base">
      {/* Top Social Section */}
      <FadeInItem element="div" direction="y">
        <div className="border-b border-border-primary px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center md:text-left text-text-secondary font-medium">
            Get connected with us on social networks:
          </p>
          <div className="flex gap-4">
            {[Facebook, Linkedin, Instagram, Twitter, Github].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="text-text-secondary hover:text-highlight-primary transition"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </FadeInItem>
      
      <FadeInItem element="div" direction="y">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {/* Company Info */}
            <div>
              <h6 className="uppercase font-bold text-text-primary mb-4 flex items-center gap-2">
                <CarFront size={20} /> Auto Lab Solutions
              </h6>
              <p className="text-base text-text-primary/90 leading-relaxed">
                We deliver cutting-edge automotive inspection and repair solutions
                with state-of-the-art technology, expert service, and a commitment
                to safety and quality.
              </p>
            </div>

            {/* Useful Links */}
            <div>
              <h6 className="uppercase font-bold text-text-primary mb-4">Useful Links</h6>
              <ul className="space-y-3">
                {["About Us", "Contact Us", "Newsfeed", "Inspection Status"].map((text, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-text-primary/90 hover:text-highlight-primary transition"
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <h6 className="uppercase font-bold text-text-primary mb-4">Contact</h6>
                <ul className="space-y-3 text-base">
                  <li className="flex items-start gap-2 text-text-primary/90">
                    <Home size={20} className="mt-0.5 text-highlight-primary" />
                    70b Division St, Welshpool WA 6106, Australia
                  </li>
                  <li className="flex items-center gap-2 text-text-primary/90">
                    <Mail size={20} className="text-highlight-primary" />
                    info@example.com
                  </li>
                  <li className="flex items-center gap-2 text-text-primary/90">
                    <Phone size={20} className="text-highlight-primary" />
                    +61 451 237 048
                  </li>
                </ul>
              </div>

              {/* Scroll to Top */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-text-primary hover:bg-highlight-primary text-text-tertiary px-6 py-2 rounded-full font-medium transition"
                >
                  Scroll to top
                </button>
              </div>
            </div>
          </div>
        </div>
      </FadeInItem>

      {/* Bottom Bar */}
      <div className="bg-card-primary py-4 text-center text-text-secondary text-sm">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://yourcompany.com"
          className="text-text-primary font-semibold hover:text-highlight-primary transition"
        >
          AutoLabSolutions.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
