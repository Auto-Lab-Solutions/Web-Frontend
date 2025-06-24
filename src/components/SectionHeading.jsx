import { motion } from "framer-motion";

const SectionHeading = ({ text}) => {
  return (
    <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-center my-8">
      {/* <motion.h1
              initial={{ y: 48, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 0.75 }}
              className="mb-20 text-4xl font-black uppercase text-zinc-50"
            > */}
      {text}
      {/* </motion.h1> */}
    </div>
  )
}

export default SectionHeading;