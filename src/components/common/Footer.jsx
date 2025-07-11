import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Home,
  Phone,
  Gem
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 text-sm">
      {/* Top Social Section */}
      <div className="border-b border-zinc-700 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-center md:text-left text-zinc-300 font-medium">
          Get connected with us on social networks:
        </p>
        <div className="flex gap-4">
          {[Facebook, Twitter, Instagram, Linkedin, Github].map((Icon, idx) => (
            <a
              key={idx}
              href="#"
              className="text-zinc-400 hover:text-red-500 transition"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Company Info */}
          <div>
            <h6 className="uppercase font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Gem size={18} /> Auto Lab Solutions
            </h6>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We deliver cutting-edge automotive inspection and repair solutions
              with state-of-the-art technology, expert service, and a commitment
              to safety and quality.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h6 className="uppercase font-bold text-zinc-100 mb-4">Useful Links</h6>
            <ul className="space-y-3">
              {["About Us", "Contact Us", "Newsfeed", "Inspection Status"].map((text, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:text-red-400 transition"
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
              <h6 className="uppercase font-bold text-zinc-100 mb-4">Contact</h6>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Home size={16} className="mt-0.5 text-red-500" />
                  70b Division St, Welshpool WA 6106, Australia
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-red-500" />
                  info@example.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-red-500" />
                  +61 451 237 048
                </li>
              </ul>
            </div>

            {/* Scroll to Top */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-red-500 hover:bg-warning-primary text-white px-6 py-2 rounded-full font-medium transition"
              >
                Scroll to top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-zinc-800 py-4 text-center text-zinc-400 text-xs">
        © {new Date().getFullYear()}{" "}
        <a
          href="https://yourcompany.com"
          className="text-white font-semibold hover:text-red-400 transition"
        >
          AutoLabSolutions.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
