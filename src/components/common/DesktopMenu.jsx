import { useState } from "react";
// import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

const navBarItem = (menuName) => (
  <span className="flex-center gap-1 font-semibold hover:bg-highlight-primary hover:text-text-tertiary cursor-pointer px-3 py-1 rounded-xl">
    {menuName}
    {/* {hasSubMenu && (
        <ChevronDown className="mt-[0.6px] group-hover:rotate-180 duration-200" />
    )} */}
  </span>
);

export default function DesktopMenu({ menu }) {
  const [isHover, toggleHover] = useState(false);
  const toggleHoverMenu = () => {
    toggleHover(!isHover);
  };

  const subMenuAnimate = {
    enter: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
      },
      display: "block",
    },
    exit: {
      opacity: 0,
      rotateX: -15,
      transition: {
        duration: 0.5,
      },
      transitionEnd: {
        display: "none",
      },
    },
  };

  const hasSubMenu = menu?.subMenu?.length;

  return (
    <motion.li
      className="group/link"
      onHoverStart={() => {
        toggleHoverMenu();
      }}
      onHoverEnd={toggleHoverMenu}
      key={menu.name}
    >
      {!hasSubMenu ? (
        <Link to={menu.path}>
          {navBarItem(menu.name)}
        </Link>
      ) : 
        navBarItem(menu.name)
      }
      {hasSubMenu && (
        <motion.div
          className="sub-menu"
          initial="exit"
          animate={isHover ? "enter" : "exit"}
          variants={subMenuAnimate}
        >
          <div
            className={`grid gap-7 ${
              menu.gridCols === 3
                ? "grid-cols-3"
                : menu.gridCols === 2
                ? "grid-cols-2"
                : "grid-cols-1"
            } rounded-lg p-3 bg-card-primary
            `}
          >
            {hasSubMenu &&
              menu.subMenu.map((submenu, i) => (
                <div className="relative cursor-pointer" key={i}>
                  <Link
                    to={`${menu.path}${submenu.subpath}`}
                  >
                    {menu.gridCols > 1 && menu?.subMenuHeading?.[i] && (
                      <p className="text-sm mb-4 text-gray-700">
                        {menu?.subMenuHeading?.[i]}
                      </p>
                    )}
                    <div className="flex-center gap-x-4 group/menubox">
                      <div className="bg-white/5 w-fit p-2 rounded-md group-hover/menubox:bg-highlight-primary group-hover/menubox:text-gray-900 duration-300">
                        {submenu.icon && <submenu.icon />}
                      </div>
                      <div>
                        <h6 className="text-text-primary font-semibold group-hover/menubox:text-highlight-primary">{submenu.name}</h6>
                        <p className="text-sm text-text-secondary group-hover/menubox:text-highlight-primary">{submenu.desc}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.li>
  );
}
