import PageContainer from '../components/common/PageContainer';
import { motion } from 'framer-motion';
import { ShieldCheck, SearchCheck, Users, Settings2, FileText, Smile, MapPin } from 'lucide-react';
import SectionHeading from '@/components/common/SectionHeading';
import FadeInItem from '@/components/common/FadeInItem';
import GoogleMap from '../components/GoogleMap';

const iconStyle = "w-8 h-8 text-highlight-primary";

const values = [
  {
    title: "Comprehensive Inspection",
    desc: "Your safety is our top priority. We inspect every detail to ensure you’re fully informed before making your purchase.",
    icon: <SearchCheck className={iconStyle} />,
  },
  {
    title: "Expert Team",
    desc: "Our professional inspectors are experienced, reliable, and focused on delivering unbiased, high-quality reports.",
    icon: <Users className={iconStyle} />,
  },
  {
    title: "Advanced Equipment",
    desc: "We use cutting-edge diagnostic tools to identify mechanical, electrical, or structural issues that may go unnoticed otherwise.",
    icon: <Settings2 className={iconStyle} />,
  },
  {
    title: "Personalized Reports",
    desc: "Every report is tailored to the vehicle, including service history and condition. No templates, just clear insights.",
    icon: <FileText className={iconStyle} />,
  },
  {
    title: "Customer Satisfaction",
    desc: "We ensure a smooth, transparent process from start to finish—your satisfaction is always our priority.",
    icon: <Smile className={iconStyle} />,
  },
];

const AboutUsPage = () => {
  return (
    <PageContainer>
      <div className="font-sans">

        {/* Hero */}
        <header className="bg-background-tertiary text-text-primary py-20 text-center">
          <FadeInItem
            element="h1"
            direction="x"
            className="text-4xl font-bold mb-4"
          >
            About Perth Pre‑Purchase Inspections
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="x"
            className="text-xl opacity-90 max-w-sm sm:max-w-2xl mx-auto"
          >
            Making informed car buying decisions is crucial. That’s why we provide detailed insights and expert evaluations you can trust.
          </FadeInItem>
        </header>

        {/* Company Overview */}
        <section className="bg-background-primary text-text-primary py-16 px-6 text-center">
          <SectionHeading text="Who We Are" />
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-text-secondary leading-relaxed mt-4"
          >
            Based in Southern River, we proudly deliver mobile pre‑purchase car inspections across Perth and its surrounding suburbs. From Canning Vale to Joondalup, Rockingham to Ellenbrook, our certified inspectors travel to where you need us—north, south, east, and west.
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-text-secondary leading-relaxed mt-4"
          >
            Our team brings industry-grade expertise right to your doorstep, offering on-site vehicle checks that assess mechanical, structural, and safety conditions to help you buy with confidence.
          </FadeInItem>
        </section>

        {/* What Sets Us Apart */}
        <section className="bg-background-secondary text-white py-16 px-6">
          <motion.div
            className="max-w-5xl mx-auto bg-background-primary border border-border-primary rounded-2xl shadow-xl p-6 sm:p-12 pb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading text="What Sets Us Apart" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {values.map((val, idx) => (
                <FadeInItem
                  key={idx}
                  element="div"
                  direction="y"
                  className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="flex justify-center items-center mb-4">
                    {val.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{val.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{val.desc}</p>
                </FadeInItem>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Our Mission */}
        <section className="bg-background-primary text-text-primary py-16 px-6 text-center">
          <SectionHeading text="Our Mission" />
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-text-secondary leading-relaxed mt-4"
          >
            Our mission is to provide thorough, transparent, and technology-backed inspections that empower you to make confident vehicle purchasing decisions. We aim to bring clarity and peace of mind to every customer, every time.
          </FadeInItem>
        </section>

        {/* Our Vision */}
        <section className="bg-background-secondary text-white py-16 px-6 text-center">
          <SectionHeading text="Our Vision" />
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-zinc-300 leading-relaxed mt-4"
          >
            Our vision is to be Perth’s most trusted mobile vehicle inspection service—known for precision, integrity, and customer-first service. We envision a future where every vehicle buyer feels informed, secure, and confident.
          </FadeInItem>
        </section>

        {/* Google Map Section */}
        <section className="bg-background-primary py-16 px-6 text-center text-text-primary">
          <SectionHeading text="Our Service Area" />
          <FadeInItem
            element="p"
            direction="x"
            className="section-subheading mb-6 max-w-2xl mx-auto"
          >
            Proudly based in Southern River, our team travels across Perth to reach you—whether you're in Midland, Mandurah, Joondalup, or anywhere in between.
          </FadeInItem>
          <FadeInItem element="div" direction="y" className="max-w-5xl mx-auto">
            <GoogleMap />
          </FadeInItem>
        </section>

        {/* CTA */}
        <section className="bg-background-tertiary text-text-primary text-center py-20">
          <SectionHeading text="Schedule an Inspection" />
          <FadeInItem
            element="div"
            direction="x"
            className="section-subheading mb-6 mt-6"
          >
            <button className="px-10 py-2.5 bg-button-primary text-text-tertiary font-semibold rounded-full hover:bg-highlight-primary transition shadow">
              Book Now with Confidence
            </button>
          </FadeInItem>
        </section>

      </div>
    </PageContainer>
  );
};

export default AboutUsPage;
