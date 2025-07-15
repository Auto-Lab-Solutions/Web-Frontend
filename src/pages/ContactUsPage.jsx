import PageContainer from '../components/common/PageContainer';
import QuotaForm from '../components/common/QuotaForm';
import FadeInItem from '@/components/common/FadeInItem';
import GoogleMap from '../components/GoogleMap';
import { companyAddress, companyLocalPhone, companyEmail } from '../metaData';

const ContactUsPage = () => {

  return (
    <PageContainer>
      <div className="font-sans">

        {/* Hero */}
        <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
          <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4 mt-8">
            Contact Our Team
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="y"
            className="text-xl max-w-2xl mx-auto text-text-secondary"
          >
            Have questions? Ready to book an inspection? We're here to help.
          </FadeInItem>
          <FadeInItem element="div" direction="y" className="mt-6 space-y-2 text-lg">
            <p>
              📞 Call us:{" "}
              <a href={`tel:${companyLocalPhone}`} className="text-highlight-primary font-semibold underline">
                {companyLocalPhone}
              </a>
            </p>
            <p>
              📧 Email us:{" "}
              <a href={`mailto:${companyEmail}`} className="text-highlight-primary font-semibold underline">
                {companyEmail}
              </a>
            </p>
          </FadeInItem>
        </section>

        {/* Location */}
        <section className="bg-background-primary text-text-primary pt-20 pb-24  px-6 text-center">
          {/* <SectionHeading text="Our Location" /> */}
          <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
            Our Location
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="y"
            className="max-w-xl mx-auto text-lg text-text-secondary mt-4"
          >
            Visit us at{" "}
            <a
              href="https://www.google.com/maps/place/Perth+Cars+Pre-Purchase+Inspection+Service/@-31.9898836,115.9302042,15.95z/data=!4m14!1m7!3m6!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!2sPerth+Cars+Pre-Purchase+Inspection+Service!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5!3m5!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5?entry=ttu"
              className="text-highlight-primary font-semibold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {companyAddress}
            </a>
            , or book a mobile inspection at your preferred location.
          </FadeInItem>
        </section>

        {/* Contact Form */}
        <section className="bg-background-secondary pt-12 pb-0">
          {/* <SectionHeading text="Send Us a Message" /> */}
          <FadeInItem
            element="div"
            direction="y"
            className="mx-auto mt-0"
          >
            <QuotaForm />
          </FadeInItem>
        </section>

        {/* Map */}
        <section className="bg-background-primary py-16 px-6 text-center text-text-primary">
          {/* <SectionHeading text="Find Us on the Map" /> */}
          <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-8">
            Find Us on the Map
          </FadeInItem>
          <FadeInItem element="div" direction="y" className="max-w-5xl mx-auto">
            <GoogleMap />
          </FadeInItem>
        </section>

      </div>
    </PageContainer>
  );
};

export default ContactUsPage;
