import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";
import { faqs } from "@/meta/faqs";
import SectionHeading from "@/components/common/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FadeInItem from "../common/FadeInItem";

function FAQSection() {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const initialCount = 5;
  const visibleFaqs = showAll ? faqs : faqs.slice(0, initialCount);

  return (
    <div className="w-full space-y-6 pb-8 px-4 bg-background-tertiary">
      <SectionHeading text="Frequently Asked Questions" />

      <Accordion
        type="single"
        collapsible
        className="space-y-2 my-8 mx-auto max-w-xl sm:max-w-6xl"
      >
        {visibleFaqs.map((faq) => (
          <FadeInItem element="div" direction="y" key={faq.id}>
            <AccordionItem
              key={faq.id}
              value={`item-${faq.id}`}
              className="rounded-xl transition-all border shadow-sm bg-card-secondary border-border-primary hover:border-border-secondary hover:shadow-lg"
              onMouseEnter={() => setHoveredItem(faq.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center justify-between">
                <div className="card-heading p-5 transition-colors cursor-pointer">
                  {faq.question}
                </div>
                <div className="card-heading p-5 transition-colors cursor-pointer">
                  {hoveredItem === faq.id ? "" : "▼"}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {hoveredItem === faq.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-5 pb-6 overflow-hidden"
                  >
                    {faq.answer.map((answer, idx) => (
                      <p key={idx} className="card-description">
                        {answer}
                      </p>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </AccordionItem>
          </FadeInItem>
        ))}
      </Accordion>

      {faqs.length > initialCount && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-primary underline hover:text-secondary transition-colors"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
}

export default FAQSection;
