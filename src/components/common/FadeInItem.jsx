import { motion } from "framer-motion";

const FadeInItem = ({ element, direction = "x", className, key, scale = 1,
  children }) => {
  if (element === "h1") {
    return (
      <motion.h1
        key={key}
        initial={{ opacity: 0, x: direction === "x" ? -30 : 0, y: direction === "y" ? 30 : 0 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale }}
        className={`${className}`}
      >
        {children}
      </motion.h1>
    );
  } else if (element === "div") {
    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, x: direction === "x" ? -30 : 0, y: direction === "y" ? 30 : 0 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale }}
        className={`${className}`}
      >
        {children}
      </motion.div>
    );
  } else if (element === "p") {
    return (
      <motion.p
        key={key}
        initial={{ opacity: 0, x: direction === "x" ? -30 : 0, y: direction === "y" ? 30 : 0 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale }}
        className={`${className}`}
      >
        {children}
      </motion.p>
    );
  }
  return (
    <motion.span
      key={key}
      initial={{ opacity: 0, x: direction === "x" ? -30 : 0, y: direction === "y" ? 30 : 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale }}
      className={`${className}`}
    >
      {children}
    </motion.span>
  );
}

export default FadeInItem;
