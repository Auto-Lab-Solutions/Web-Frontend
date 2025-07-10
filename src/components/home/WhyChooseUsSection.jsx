import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { reasons } from "@/utils/itemContent";


const WhyChooseUsSection = () => {
  return (
    <section className="bg-background-primary py-16 px-4">
        <SectionHeading text="Why Choose Us?" />
        <motion.p
            initial={{ y: 48, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75 }}
            className="section-subheading"
        >
            We go the extra mile to ensure your satisfaction and peace of mind.
        </motion.p>

        <Carousel
            opts={{
                align: "center",
                loop: true,
            }}
            className="w-full max-w-5xl mx-auto px-4 mt-4 overflow-hidden xl:overflow-visible"
        >
            <CarouselContent>
                {reasons.map((reason, index) => (
                <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3 p-4"
                >
                    <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="bg-card-primary rounded-xl p-6 h-full flex flex-col justify-between shadow-md border border-border-primary"
                    >
                    <div className="flex items-center mb-3 text-green-400 justify-center md:justify-start">
                        <CheckCircle className="mr-2 w-5 h-5" />
                        <h3 className="card-heading">
                        {reason.title}
                        </h3>
                    </div>
                    <div className="flex justify-center md:justify-start">
                    <p className="card-description">{reason.description}</p>
                    </div>
                    </motion.div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <div className="flex justify-center mt-6 gap-4 max-w-full">
                <CarouselPrevious className="text-white border-border-primary" />
                <CarouselNext className="text-white border-border-primary" />
            </div>
        </Carousel>
    </section>
  );
};

export default WhyChooseUsSection;
