import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, Search, Leaf, Brain, Star, Wallet, DollarSign, CalendarClock } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import FadeInItem from "../common/FadeInItem";
import Autoplay from "embla-carousel-autoplay"

const iconStyles = "w-6 h-6 text-highlight-primary";
const reasons = [
  {
    icon: <Brain className={iconStyles} />,
    title: "Expert Technicians",
    description: "Our skilled professionals deliver top-notch service every time.",
  },
  {
    icon: <Search className={iconStyles} />,
    title: "In-Depth Inspections",
    description: "Our skilled professionals deliver top-notch service every time.",
  },
  {
    icon: <FileText className={iconStyles} />,
    title: "Detailed Reports",
    description: "Our skilled professionals deliver top-notch service every time.",
  },
  {
    icon: <Star className={iconStyles} />,
    title: "Trusted by Thousands",
    description: "We’re trusted by a growing community of loyal customers.",
  },
  {
    icon: <Leaf className={iconStyles} />,
    title: "Eco-Friendly Practices",
    description: "We care for the planet using sustainable materials and processes.",
  },
  {
    icon: <CalendarClock className={iconStyles} />,   
    title: "Flexible Scheduling",
    description: "Reach out anytime — we’re always ready to help.",
  },
  {
    icon: <DollarSign className={iconStyles} />,
    title: "Affordable Pricing",
    description: "Transparent and competitive pricing with no hidden costs.",
  },
  {
    icon: <Wallet className={iconStyles} />,
    title: "Flexible Pay Methods",
    description: "We offer exceptional service that exceeds expectations.",
  }
];

const WhyChooseUsSection = () => {
  return (
    <section className="bg-background-primary pt-8 pb-16 px-4">
        <SectionHeading text="Why Choose Us" />
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
            className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl mx-auto mt-4 overflow-hidden sm:overflow-visible"
        >
            <CarouselContent className="ml-1">
                {reasons.map((reason, index) => (
                <CarouselItem
                    key={index}
                    className="md:basis-1/2 lg:basis-1/3 p-4"
                >
                    <FadeInItem
                        element="div"
                        direction="y"
                        scale={1.02}
                        className="bg-card-primary rounded-xl px-2 py-6 sm:p-6 flex flex-col gap-3 shadow-md border border-border-primary"
                    >
                    <div className="flex items-center text-highlight-primary justify-center md:justify-start gap-2">
                        {reason.icon}
                        <h3 className="card-heading">{reason.title}</h3>
                    </div>
                    <div className="flex justify-center md:justify-start">
                        <p className="card-description px-2 sm:px-0">{reason.description}</p>
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
