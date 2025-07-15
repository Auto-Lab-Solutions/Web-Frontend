import { motion } from "framer-motion";

const FadeInItem = ({ element, direction = "x", className, scale = 1, children }) => {
  const initial = {
    opacity: 0,
    x: direction === "x" ? -30 : 0,
    y: direction === "y" ? 30 : 0,
  };

  const sharedProps = {
    initial,
    whileInView: { opacity: 1, x: 0, y: 0 },
    transition: { duration: 0.6 },
    whileHover: { scale },
    className: `${className}`,
    viewport: { once: true },
  };

  switch (element) {
    case "h1":
      return <motion.h1 {...sharedProps}>{children}</motion.h1>;
    case "div":
      return <motion.div {...sharedProps}>{children}</motion.div>;
    case "p":
      return <motion.p {...sharedProps}>{children}</motion.p>;
    default:
      return <motion.span {...sharedProps}>{children}</motion.span>;
  }
};

export default FadeInItem;

