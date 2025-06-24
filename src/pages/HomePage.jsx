import PageContainer from '../components/PageContainer';
import ServicesSection from '../components/ServicesSection';
import HeroSection from '../components/HeroSection';
import InspectionFeatures from '../components/InspectionFeatures';
import FAQSection from '../components/FAQSection';
import ReviewsSection from '../components/ReviewsSection';
import Footer from '../components/Footer';


const HomePage = () =>  {
  return (
    <PageContainer>
      <HeroSection />
      <ServicesSection />
      <ReviewsSection />
      <InspectionFeatures />
      <FAQSection />
      <Footer />
    </PageContainer>
  );
}

export default HomePage;


