import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from 'react-router-dom';

export default function MobMenu({ Menus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState(null);
  
  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setClicked(null);
  };

  const subMenuDrawer = {
    enter: {
      height: "auto",
      overflow: "hidden",
    },
    exit: {
      height: 0,
      overflow: "hidden",
    },
  };

  return (
    <div>
      <button 
        className="lg:hidden z-[999] relative p-2 rounded-md hover:bg-white/10 transition-colors" 
        onClick={toggleDrawer}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <motion.div
        className="fixed inset-0 top-[60px] z-50 bg-zinc-900/95 backdrop-blur-sm text-white overflow-y-auto"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="p-4 pb-28 max-h-[calc(100vh-60px)] overflow-y-auto">
          <ul className="space-y-2">
            {Menus.map(({ name, path, subMenu }, i) => {
              const isClicked = clicked === i;
              const hasSubMenu = subMenu?.length;

              if (!hasSubMenu) {
                return (
                  <li key={name}>
                    <Link 
                      to={path}
                      onClick={toggleDrawer}
                      className="flex items-center justify-between p-4 hover:bg-white/10 rounded-md cursor-pointer relative transition-colors text-lg font-medium"
                    >
                      {name}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={name} className="bg-white/5 rounded-md overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-white/10 cursor-pointer relative text-lg font-medium transition-colors"
                    onClick={() => setClicked(isClicked ? null : i)}
                    aria-expanded={isClicked}
                  >
                    {name}
                    <ChevronDown className={`ml-auto transition-transform duration-300 ${isClicked ? "rotate-180" : ""}`} />
                  </button>
                  <motion.ul
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                    className="bg-white/5"
                  >
                    {subMenu.map(({ name: subName, subpath, icon: Icon }) => (
                      <Link to={`${path}${subpath}`} key={`${path}${subpath}`}>
                        <li
                          className="p-4 flex items-center hover:bg-white/10 gap-x-3 cursor-pointer transition-colors"
                          onClick={toggleDrawer}
                        >
                          {Icon && <Icon size={18} className="text-highlight-primary" />}
                          <span className="text-base">{subName}</span>
                        </li>
                      </Link>
                    ))}
                  </motion.ul>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
