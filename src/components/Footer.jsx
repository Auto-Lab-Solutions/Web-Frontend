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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {/* Company Info */}
          <div>
            <h6 className="uppercase font-bold mb-4 flex items-center gap-2">
              <Gem size={16} /> Company name
            </h6>
            <p>
              Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet,
              consectetur adipisicing elit.
            </p>
          </div>

          {/* Products */}
          <div>
            <h6 className="uppercase font-bold mb-4">Products</h6>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-800">Angular</a></li>
              <li><a href="#" className="hover:text-gray-800">React</a></li>
              <li><a href="#" className="hover:text-gray-800">Vue</a></li>
              <li><a href="#" className="hover:text-gray-800">Laravel</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h6 className="uppercase font-bold mb-4">Useful links</h6>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-800">Pricing</a></li>
              <li><a href="#" className="hover:text-gray-800">Settings</a></li>
              <li><a href="#" className="hover:text-gray-800">Orders</a></li>
              <li><a href="#" className="hover:text-gray-800">Help</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h6 className="uppercase font-bold mb-4">Contact</h6>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Home size={16} /> New York, NY 10012, US</li>
              <li className="flex items-center gap-2"><Mail size={16} /> info@example.com</li>
              <li className="flex items-center gap-2"><Phone size={16} /> + 01 234 567 88</li>
              <li className="flex items-center gap-2"><Printer size={16} /> + 01 234 567 89</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-neutral-700 text-center py-4">
        © {new Date().getFullYear()} Copyright: 
        <a className="text-neutral-200 font-semibold ml-1" href="https://yourcompany.com">
          YourCompany.com
        </a>
      </div>
    </footer>
  )
}

export default Footer;
