import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Home,
  Phone,
  Printer,
  Gem
} from "lucide-react"

function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 text-sm">
      {/* Social Section */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b">
        <div className="mb-2 md:mb-0">
          <span>Get connected with us on social networks:</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-gray-600 hover:text-gray-800 transition">
            <Facebook size={20} />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800 transition">
            <Twitter size={20} />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800 transition">
            <Instagram size={20} />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800 transition">
            <Linkedin size={20} />
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800 transition">
            <Github size={20} />
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {/* Company Info */}
          <div>
            <h6 className="uppercase font-bold mb-4 flex items-center gap-2">
              <Gem size={16} /> Auto Lab Solutions
            </h6>
            <p>
              Auto Lab Solutions is a leading provider of automotive inspection and repair solutions, dedicated to ensuring the highest standards of quality and safety in the automotive industry. Our team of experts utilizes state-of-the-art technology to deliver comprehensive inspection services tailored to meet the needs of our clients.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h6 className="uppercase font-bold mb-4">Useful links</h6>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-800">About Us</a></li>
              <li><a href="#" className="hover:text-gray-800">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-800">Newsfeed</a></li>
              <li><a href="#" className="hover:text-gray-800">Inspection Status</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="uppercase font-bold mb-4">Contact</h6>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Home size={16} /> 70b Division St, Welshpool WA 6106, Australia</li>
              <li className="flex items-center gap-2"><Mail size={16} /> info@example.com</li>
              <li className="flex items-center gap-2"><Phone size={16} /> +61 451 237 048</li>
            </ul>
            {/* align button to right bottom corner */}
            <div className="flex justify-end">
              <button 
                className="mt-6 px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-gray-100 transition"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Go on Top
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-neutral-700 text-center py-4">
        © {new Date().getFullYear()} Copyright: 
        <a className="text-neutral-200 font-semibold ml-1" href="https://yourcompany.com">
          AutoLabSolutions.com
        </a>
      </div>
    </footer>
  )
}

export default Footer;
