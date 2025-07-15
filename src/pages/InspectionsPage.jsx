import PageContainer from '../components/common/PageContainer';
import { motion } from 'framer-motion';
import {
  MapPin,
  Wrench,
  CalendarDays,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import FadeInItem from "@/components/common/FadeInItem";
import InspectionFeatures from '../components/home/InspectionFeatures';
import InspectionBenefitsSection from '../components/InspectionBenefitsSection';

const iconStyle = "w-8 h-8 text-highlight-primary";

const inspectionSteps = [
  { number: 1, title: 'Book Online', desc: "Select your inspection plan and submit our quick form.", icon: <ClipboardList className={iconStyle} /> },
  { number: 2, title: 'We Schedule', desc: "We’ll arrange inspection time with the seller and notify you.", icon: <CalendarDays className={iconStyle} /> },
  { number: 3, title: 'Expert Inspection', desc: "Our mechanic inspects thoroughly and calls you afterward.", icon: <Wrench className={iconStyle} /> },
  { number: 4, title: 'Get Your Report', desc: "A detailed digital report with insights lands in your inbox.", icon: <CheckCircle className={iconStyle} /> },
];

const locations = ['Perth', 'Rockingham', 'Mandurah', 'Fremantle'];

const InspectionsPage = () => {
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
            className="text-xl opacity-90 max-w-sm sm:max-w-2xl mx-auto"
          >
            Carinspect offers the best onsite pre-purchase car inspections in Perth. Our certified mechanics conduct thorough checks and provide reports you can trust.
          </FadeInItem>
          <FadeInItem
            element="div"
            direction="y"
          >
            <button className="mt-6 px-8 py-3 bg-button-primary text-text-tertiary font-semibold rounded-lg shadow hover:bg-highlight-primary transition">
              Book Pre‑Purchase Inspection
            </button>
          </FadeInItem>
        </header>

        {/* Benefits Section */}
        <InspectionBenefitsSection />

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
            {locations.map(loc => (
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
        <section className="bg-background-secondary py-16">
          <FadeInItem
            element="div"
            direction="y"
            className="container mx-auto px-6 md:flex items-center gap-12"
          >
            <img src="/images/mechanic-perth.jpg" alt="James – Perth Mechanic" className="w-40 h-40 rounded-full object-cover mx-auto md:mx-0 shadow-lg border-4 border-border-primary hover:border-highlight-primary transition" />
            <div className="text-center md:text-left mt-6 md:mt-0">
              <h3 className="text-2xl font-semibold text-text-primary">James – Perth</h3>
              <p className="mt-4 text-text-secondary">
                With over 10 years of hands-on experience, James ensures each inspection is done thoroughly and professionally.
              </p>
            </div>
          </FadeInItem>
        </section>

        {/* CTA */}
        <section className="bg-background-tertiary text-text-primary text-center py-20">
          {/* <h2 className="text-3xl font-bold mb-6">Ready to Buy with Confidence?</h2> */}
          <SectionHeading text="Ready to Buy with Confidence?" />
          <FadeInItem
            element="div"
            direction="x"
            className="section-subheading mb-6 mt-6"
          >
            <button className="px-10 py-2.5 bg-button-primary text-text-tertiary font-semibold rounded-full hover:bg-highlight-primary transition shadow">
              Book Your Inspection Now
            </button>
          </FadeInItem>
        </section>
      </div>
    </PageContainer>
  );
}

export default InspectionsPage;
