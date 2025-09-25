import React from "react"
import { motion } from "framer-motion"

const FormSection = ({ title, children, className = "" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 sm:space-y-6 ${className}`}
    >
      <div className="border-b border-border-secondary pb-2">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          {title}
        </h2>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>
    </motion.div>
  )
}

export default FormSection
