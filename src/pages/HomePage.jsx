import PageContainer from '../components/common/PageContainer';
import ServicesSection from '../components/home/ServicesSection';
import HeroSection from '../components/home/HeroSection';
import InspectionFeatures from '../components/home/InspectionFeatures';
import FAQSection from '../components/home/FAQSection';
import ReviewsSection from '../components/home/ReviewsSection';
import QuotaForm from '../components/common/QuotaForm';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import WhoWeAreSection from '../components/home/WhoWeAreSection';

const HomePage = () =>  {
  return (
    <PageContainer>
      <HeroSection />
      <WhoWeAreSection />
      <WhyChooseUsSection />
      <ServicesSection />
      <InspectionFeatures />
      <ReviewsSection />
      <FAQSection />
      <QuotaForm />
    </PageContainer>
  );
}

export default HomePage;


