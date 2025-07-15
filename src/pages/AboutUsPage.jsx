import PageContainer from '../components/common/PageContainer';
import { motion } from 'framer-motion';

import SectionHeading from '@/components/common/SectionHeading';
import FadeInItem from '@/components/common/FadeInItem';
import GoogleMap from '../components/GoogleMap';
import MechanicsSection from '@/components/common/MechanicsSection';
import { companyName, whoWeAre, ourValues, aboutShort, ourMission, ourVision, locationDesc } from '../metaData';


const AboutUsPage = () => {
  return (
    <PageContainer>
      <div className="font-sans">

        {/* Hero */}
        <header className="bg-background-tertiary text-text-primary py-20 text-center">
          <FadeInItem
            element="h1"
            direction="x"
            className="text-3xl md:text-4xl font-bold mb-8 mt-4"
          >
            About {companyName}
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="x"
            className="text-xl text-text-primary/90 max-w-md sm:max-w-2xl mx-auto"
          >
            {aboutShort}
          </FadeInItem>
        </header>

        {/* Company Overview */}
        <section className="bg-background-primary text-text-primary pt-16 pb-20 px-6 text-center">
          <SectionHeading text="Who We Are" />
          {whoWeAre.map((line, idx) => (
            <FadeInItem
              element="p"
              direction="y"
              className="max-w-4xl mx-4 sm:mx-auto text-lg text-text-secondary leading-relaxed mt-4"
            >
              {line}
            </FadeInItem>
          ))}
        </section>

        {/* Our Vision */}
        <section className="bg-background-secondary text-white py-16 px-6 text-center">
          <SectionHeading text="Our Vision" />
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-zinc-300 leading-relaxed mt-4"
          >
            {ourVision}
          </FadeInItem>
        </section>

        {/* Our Mission */}
        <section className="bg-background-primary text-text-primary py-16 px-6 text-center">
          <SectionHeading text="Our Mission" />
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-3xl mx-auto text-lg text-text-secondary leading-relaxed mt-4"
          >
            {ourMission}
          </FadeInItem>
        </section>

        {/* What Sets Us Apart */}
        <section className="bg-background-secondary text-white pt-16 pb-4 px-6">
          <motion.div
            className="max-w-5xl mx-auto bg-background-primary border border-border-primary rounded-2xl shadow-xl p-6 sm:p-12 pb-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading text="What Sets Us Apart" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {ourValues.map((val, idx) => (
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

        {/* Mechanics Section */}
        <MechanicsSection />

        {/* Google Map Section */}
        <section className="bg-background-primary py-16 px-6 text-center text-text-primary">
          <SectionHeading text="Our Service Area" />
          <FadeInItem
            element="p"
            direction="x"
            className="section-subheading mb-6 max-w-2xl mx-auto"
          >
            {locationDesc}
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
