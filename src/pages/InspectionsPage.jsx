import PageContainer from '@/components/common/PageContainer';
import { motion } from 'framer-motion';
import {
  MapPin,
  Wrench,
  CalendarDays,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import FadeInItem from "@/components/common/FadeInItem";
import InspectionFeatures from '@/components/home/InspectionFeatures';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MousePointerClick, Clock, ShieldCheck, BadgeCheck } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import Autoplay from "embla-carousel-autoplay"
import { companyName, coverageAreas } from '../meta/companyData';
import MechanicsSection from '@/components/common/MechanicsSection';
import { useNavigate } from 'react-router-dom';

const iconStyles = "w-8 h-8 text-highlight-primary";

const inspectionsDesc = [
  `${companyName} delivers top-tier on-site car inspections across Perth.`,
  "Our certified mechanics conduct thorough checks and provide reports you can trust, helping you make confident, informed decisions."
]

const inspectionSteps = [
  {
    number: 1,
    title: 'Book Online Now',
    desc: "Choose your inspection plan and complete our quick online form.",
    icon: <ClipboardList className={iconStyles} />,
  },
  {
    number: 2,
    title: 'Schedule a Time',
    desc: "We’ll arrange a convenient time that suits your availability.",
    icon: <CalendarDays className={iconStyles} />,
  },
  {
    number: 3,
    title: 'On-Site Inspection',
    desc: "Our expert mechanic performs a detailed inspection at the vehicle's location.",
    icon: <Wrench className={iconStyles} />,
  },
  {
    number: 4,
    title: 'Detailed Report Sent',
    desc: "You’ll receive a clear, comprehensive digital report with expert insights.",
    icon: <CheckCircle className={iconStyles} />,
  },
];

const inspectionBenefits = [
  {
    icon: <MousePointerClick className={iconStyles} />,
    title: "Easy Online Booking",
    description: "Just share the seller’s details — we’ll handle everything else for you.",
  },
  {
    icon: <Clock className={iconStyles} />,
    title: "Fast Turnaround",
    description: "Get your digital report delivered promptly after the inspection is complete.",
  },
  {
    icon: <ShieldCheck className={iconStyles} />,
    title: "Independent & Unbiased",
    description: "Our licensed mechanics work solely for you, not the seller.",
  },
  {
    icon: <BadgeCheck className={iconStyles} />,
    title: "Qualified Professionals",
    description: "Fully certified, fully insured — our expert team ensures trusted results.",
  },
];

const InspectionsPage = () => {
  const navigate = useNavigate();
  return (
    <PageContainer>
      <div className="font-sans">
        {/* Hero */}
        <header className="bg-background-tertiary text-text-primary py-20 text-center">
          <FadeInItem
            element="h1"
            direction="x"
            className="text-2xl md:text-4xl font-bold mb-4"
          >
            Pre-Purchase Car Inspections – Perth, WA
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="x"
            className="text-xl opacity-90 max-w-sm sm:max-w-3xl mx-auto"
          >
            {inspectionsDesc.map((line, index) => (
              <span key={index}>
                {line}
                {index < inspectionsDesc.length - 1 && <br />}
              </span>
            ))}
          </FadeInItem>
          <FadeInItem
            element="div"
            direction="y"
          >
            <button className="mt-6 px-8 py-3 bg-button-primary text-text-tertiary font-semibold rounded-full shadow hover:bg-highlight-primary transition"
              onClick={() => navigate('/pricing/pre-purchase-inspection')}
            >
              Book Pre‑Purchase Inspection
            </button>
          </FadeInItem>
        </header>

        {/* Benefits Section */}
        <section className="bg-background-primary pt-8 pb-16 px-4">
          <SectionHeading text="Confidence in Every Purchase" />
          
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
                  {inspectionBenefits.map((reason, index) => (
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

        {/* How it works */}
        <section className="pt-16 pb-0 bg-background-secondary text-white px-4">
          <motion.div
            className="max-w-5xl mx-auto bg-background-primary border border-border-primary rounded-2xl shadow-xl p-6 sm:p-12 pb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading text="How It Works" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {inspectionSteps.map((s) => (
                <FadeInItem
                  key={s.number}
                  element="div"
                  direction="y"
                  className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="flex justify-center items-center mb-4">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
                </FadeInItem>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <InspectionFeatures />

        {/* Locations */}
        <section className="container mx-auto px-6 text-center bg-background-primary py-16">
          <SectionHeading text="Coverage Areas" />
          <FadeInItem
            element="p"
            direction="x"
            className="section-subheading mb-6"
          >
            We operate across Perth and nearby suburbs:
          </FadeInItem>
          <div className="flex flex-wrap justify-center gap-4">
            {coverageAreas.map(loc => (
              <FadeInItem
                key={loc}
                element="div"
                direction="y"
                scale={1.02}
                className="flex items-center gap-2 bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg shadow"
              >
                <MapPin className="w-4 h-4 text-highlight-primary" />
                {loc}
              </FadeInItem>
            ))}
          </div>
        </section>

        {/* Mechanic Spotlight */}
        <MechanicsSection />

        {/* CTA */}
        <section className="bg-background-tertiary text-text-primary text-center py-20">
          {/* <h2 className="text-3xl font-bold mb-6">Ready to Buy with Confidence?</h2> */}
          <SectionHeading text="Ready to Buy with Confidence?" />
          <FadeInItem
            element="div"
            direction="x"
            className="section-subheading mb-6 mt-6"
          >
            <button className="px-10 py-2.5 bg-button-primary text-text-tertiary font-semibold rounded-full hover:bg-highlight-primary transition shadow"
              onClick={() => navigate('/pricing/pre-purchase-inspection')}
            >
              Book Your Inspection Now
            </button>
          </FadeInItem>
        </section>
      </div>
    </PageContainer>
  );
}

export default InspectionsPage;
