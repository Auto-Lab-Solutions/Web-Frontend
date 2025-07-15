import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileText, Search, Leaf, Brain, Star, Wallet, DollarSign, CalendarClock } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import FadeInItem from "./common/FadeInItem";
import Autoplay from "embla-carousel-autoplay"

const iconStyles = "w-8 h-8 text-highlight-primary";
const reasons = [
  {
    icon: <Brain className={iconStyles} />,
    title: "Easy Online Booking",
    description: "Provide us with the seller’s details and leave the rest to us.",
  },
  {
    icon: <Search className={iconStyles} />,
    title: "Fast Turnaround",
    description: "Receive your report instantly, right after the inspection has been processed.",
  },
  {
    icon: <FileText className={iconStyles} />,
    title: "Completely Independent",
    description: "Carinspect qualified mechanics work independently of any selling party, delivering you an unbiased report.",
  },
  {
    icon: <Star className={iconStyles} />,
    title: "Fully Qualified Mechanics",
    description: "Fully qualified and fully insured. Carinspect mechanic’s are the experts.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="bg-background-primary pt-8 pb-16 px-4">
        <SectionHeading text="Buy with peace of mind" />
        
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
