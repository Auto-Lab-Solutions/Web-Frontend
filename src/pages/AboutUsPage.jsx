import PageContainer from '../components/common/PageContainer';
import GoogleMap from '../components/GoogleMap';
import { motion } from 'framer-motion';

const features = [
  { icon: '/icons/premium.svg', title: 'Premium car care', description: 'Maintenance detailing, paint correction, paint protection.' },
  { icon: '/icons/support.svg', title: '24/7 support', description: 'Round‑the‑clock customer support.' },
  { icon: '/icons/experienced.svg', title: 'Highly experienced', description: 'Certified, trained detailers.' },
  { icon: '/icons/bespoke.svg', title: 'Bespoke detailing', description: 'Personalised car care services.' },
  { icon: '/icons/products.svg', title: 'Exclusive products', description: 'We use Gyeon, SunTek.' },
  { icon: '/icons/certified.svg', title: 'Certified detailers', description: 'International Detailing Association.' },
];

const specializations = [
  '4×4 Vehicle Detailing',
  'JDM Car Detailing',
  'Classic Car Detailing',
  'Tesla Protection',
];

const AboutUsPage = () => {
  return (
    <PageContainer>
        <div className="space-y-16 font-sans">
          {/* Hero */}
          <header className="bg-gray-800 text-white py-20 text-center">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
              Proudly Perth, Proudly Premium
            </motion.h1>
            <p className="text-xl opacity-80">
              Sharkey Auto Detailing is a leading auto detailing and car care establishment … Perth, Western Australia
            </p>
          </header>

          {/* Journey */}
          <section className="container mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-6">Our Journey</h2>
            <p className="mb-4">
              Established in 2017, Sharkey Auto Detailing started as a two‑man mobile detailing unit… 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img src="/images/journey-illustration.svg" alt="Journey Illustration" className="rounded-lg" />
              <img src="/images/handshake.svg" alt="Handshake" className="rounded-lg" />
            </div>
          </section>

          {/* Commitment & Vision */}
          <section className="bg-gray-100 py-12">
            <div className="container mx-auto px-6 text-center space-y-6">
              <h2 className="text-3xl font-semibold">Our Commitment</h2>
              <p>Every vehicle deserves the royal treatment… </p>

              <h2 className="text-3xl font-semibold">Our Vision</h2>
              <p>To continue growing and evolving while maintaining dedication and passion… </p>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="container mx-auto px-6">
            <h2 className="text-3xl font-semibold mb-8 text-center">Why Choose Us</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  className="flex space-x-4 p-6 border rounded-lg bg-white shadow-sm"
                  whileHover={{ scale: 1.03 }}
                >
                  <img src={f.icon} alt={f.title} className="w-12 h-12 shrink-0" />
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-gray-600">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Services */}
          <section className="bg-gray-50 py-12">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-semibold mb-6 text-center">What We Specialize In</h2>
              <ul className="list-disc list-inside space-y-2 text-lg">
                {specializations.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-semibold mb-4">Drive with pride. Detail with Sharkey</h2>
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
              Get a Quote
            </button>
          </section>
        </div>
      <GoogleMap />
    </PageContainer>
  );
}

export default AboutUsPage;
