import PageContainer from "../components/PageContainer";
import { motion } from 'framer-motion';

const steps = [
  { number: 1, title: 'Easy Online Booking', desc: 'Send us the seller details & leave the rest to us.', icon: '/icons/booking.svg' },
  { number: 2, title: 'Fast Turnaround', desc: 'Receive your report instantly after the inspection.', icon: '/icons/clock.svg' },
  { number: 3, title: 'Completely Independent', desc: 'Qualified mechanics, unbiased inspections.', icon: '/icons/independent.svg' },
  { number: 4, title: 'Fully Qualified Mechanics', desc: 'Insured experts ensuring precise reports.', icon: '/icons/mechanic.svg' },
];

const features = [
  'Comprehensive 170‑point inspection',
  'Engine, exterior, interior, underbody, test‑drive',
  'Digital report with photos & summary',
  '90‑day warranty offered on approved vehicles',
];

const locations = [
  'Perth', 'Rockingham', 'Mandurah', 'Fremantle',
];

const InspectionsPage = () => {
  return (
    <PageContainer>
      <div className="space-y-16 font-sans">
        {/* Hero */}
        <header className="bg-blue-800 text-white py-20 text-center">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-4">
            Mobile Pre‑Purchase Car Inspections – Perth, WA
          </motion.h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Expert pre‑purchase inspections done fast and hassle‑free by fully qualified mechanics.
          </p>
          <button className="mt-6 px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-gray-100 transition">
            Book Pre‑Purchase Inspection
          </button>
        </header>

        {/* How it works */}
        <section className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(s => (
              <motion.div
                key={s.number}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 border rounded-lg bg-white shadow"
              >
                <img src={s.icon} alt={s.title} className="mx-auto w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Step {s.number}: {s.title}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-semibold text-center mb-6">What's included</h2>
            <ul className="list-disc list-inside space-y-3 max-w-xl mx-auto text-lg">
              {features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </section>

        {/* Locations */}
        <section className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-4">Coverage Areas</h2>
          <p className="mb-6">We operate across Perth and its surrounding suburbs:</p>
          <div className="inline-grid grid-cols-2 sm:grid-cols-4 gap-4 text-lg">
            {locations.map(loc => <span key={loc} className="bg-blue-100 px-4 py-2 rounded">{loc}</span>)}
          </div>
        </section>

        {/* Mechanic Spotlight */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-6 md:flex items-center gap-8">
            <img src="/images/mechanic-perth.jpg" alt="James – Perth Mechanic" className="w-48 h-48 rounded-full mx-auto md:mx-0" />
            <div>
              <h3 className="text-2xl font-semibold">James – Perth</h3>
              <p className="mt-4 text-gray-700">
                James is a seasoned mechanic in Perth with over 10 years’ experience, ensuring every inspection is thorough, unbiased and reliable.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 bg-blue-800 text-white">
          <h2 className="text-3xl font-semibold mb-4">Ready to Buy with Confidence?</h2>
          <button className="px-8 py-3 bg-white text-blue-800 font-semibold rounded-lg hover:bg-gray-100 transition">
            Book Your Inspection Now
          </button>
        </section>
      </div>
    </PageContainer>
  );
}

export default InspectionsPage;
