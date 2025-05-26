import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from 'react-router-dom';

export default function MobMenu({ Menus }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState(null);
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
      <button className="lg:hidden z-[999] relative" onClick={toggleDrawer}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <motion.div
        className="fixed left-0 right-0 top-16 overflow-y-auto h-full bg-white-50 backdrop-blur text-white p-6 pb-20"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
      >
        <ul>
          {Menus.map(({ name, path, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = subMenu?.length;

            if (!hasSubMenu) {
              return (
                <li key={name}>
                  <Link 
                    to={path}
                    onClick={toggleDrawer}
                    className="flex-center-between p-4 hover:bg-white/5 rounded-md cursor-pointer relative"
                  >
                    {name}
                  </Link>
                </li>
              );
            }

            return (
              <li key={name}>
                <span
                  className="flex-center-between p-4 hover:bg-white/5 rounded-md cursor-pointer relative"
                  onClick={() => setClicked(isClicked ? null : i)}
                >
                  {name}
                  <ChevronDown className={`ml-auto ${isClicked && "rotate-180"}`} />
                </span>
                <motion.ul
                  initial="exit"
                  animate={isClicked ? "enter" : "exit"}
                  variants={subMenuDrawer}
                  className="ml-5"
                >
                  {subMenu.map(({ name: subName, subpath, icon: Icon }) => (
                    <Link to={`${path}${subpath}`} key={`${path}${subpath}`}>
                      <li
                        className="p-2 flex-center hover:bg-white/5 rounded-md gap-x-2 cursor-pointer"
                        onClick={toggleDrawer}
                      >
                        <Icon size={17} />
                        {subName}
                      </li>
                    </Link>
                  ))}
                </motion.ul>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
