import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CheckCircle } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import FadeInItem from "../common/FadeInItem";
import Autoplay from "embla-carousel-autoplay"

const iconStyles = "w-6 h-6 text-highlight-primary";
const reasons = [
  {
    icon: <CheckCircle className={iconStyles} />,
    title: "Expert Technicians",
    description: "Our skilled professionals deliver top-notch service every time.",
  },
  {
    icon: <CheckCircle className={iconStyles} />,
    title: "Trusted by Thousands",
    description: "We’re trusted by a growing community of loyal customers.",
  },
  {
    icon: <CheckCircle className={iconStyles} />,
    title: "Eco-Friendly Practices",
    description: "We care for the planet using sustainable materials and processes.",
  },
  {
    icon: <CheckCircle className={iconStyles} />,   
    title: "24/7 Support",
    description: "Reach out anytime — we’re always ready to help.",
  },
  {
    icon: <CheckCircle className={iconStyles} />,
    title: "Affordable Pricing",
    description: "Transparent and competitive pricing with no hidden costs.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="bg-background-primary py-16 px-4">
        <SectionHeading text="Why Choose Us?" />
        <FadeInItem element="p" direction="x" className="section-subheading">
            We go the extra mile to ensure your satisfaction and peace of mind.
        </FadeInItem>
        
        <Carousel
            opts={{
                align: "center",
                loop: true,
            }}
            plugins={[
                Autoplay({
                    delay: 4000,
                }),
            ]}
            className="w-[78%] sm:w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl mx-auto mt-4"
        >
            <CarouselContent>
                {reasons.map((reason, index) => (
                <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3 p-4 ml-2 sm:ml-0"
                >
                    <FadeInItem
                        element="div"
                        direction="y"
                        className="bg-card-primary rounded-xl px-2 py-6 sm:p-6 flex flex-col gap-3 shadow-md border border-border-primary"
                    >
                    <div className="flex items-center text-highlight-primary justify-center md:justify-start gap-2">
                        {reason.icon}
                        <h3 className="card-heading">{reason.title}</h3>
                    </div>
                    <div className="flex justify-center md:justify-start">
                        <p className="card-description">{reason.description}</p>
                    </div>
                    </FadeInItem>
                </CarouselItem>
                ))}
                
            </CarouselContent>
            <div className="flex justify-between">
                <CarouselPrevious className="text-white border-border-primary" />
                <CarouselNext className="text-white border-border-primary" />
            </div>
        </Carousel>
    </section>
  );
};

export default WhyChooseUsSection;
