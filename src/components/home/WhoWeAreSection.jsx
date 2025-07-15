import { motion } from "framer-motion";
import SectionHeading from "../common/SectionHeading";
import { whoWeAreDesc, whoWeArePoints } from "../../meta/companyData";
import FadeInItem from "../common/FadeInItem";


const WhoWeAreSection = () => {
  return (
    <section className="pt-4 pb-16 bg-background-secondary text-white px-4">
      <motion.div
        className="max-w-5xl mx-auto bg-background-primary border border-border-primary rounded-2xl shadow-lg p-6 sm:p-12 pb-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <SectionHeading text="Who We Are" />
        {whoWeAreDesc.map((line, idx) => (
          <FadeInItem
            key={idx}
            element="p"
            direction="x"
            className="section-subheading mb-4"
          >
            {line}
          </FadeInItem>
        ))}
  
        {/* Key Points */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {whoWeArePoints.map((point, idx) => (
            <FadeInItem
              key={idx}
              element="div"
              direction="y"
              scale={1.02}
              className="bg-card-primary rounded-xl p-6 border border-border-primary shadow-md flex flex-col items-start gap-3"
            >
              <div className="flex items-center gap-2 justify-center md:justify-start w-full">
                {point.icon}
                <h3 className="card-heading">{point.title}</h3>
              </div>
              <p className="card-description">{point.description}</p>
            </FadeInItem>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default WhoWeAreSection;
