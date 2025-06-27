import PageContainer from "../components/PageContainer";
import { motion } from 'framer-motion';

const plans = [
  {
    title: 'Standard Pre-Purchase Inspection',
    price: 220,
    features: [
      'Engine bay & powertrain visual inspection',
      'Structure & body check',
      'Tyres, wheels & brakes evaluation',
      'Undercarriage & suspension assessment',
      'Fluid leakage detection',
      'Battery & charging check',
      'OBD2 scan & live data',
      'Interior/dashboard tests',
      'Safety systems & electrics',
      'Detailed report & consultation',
      'Test drive on request',
    ],
  },
  {
    title: 'Comprehensive Inspection',
    price: 280,
    features: [
      'Full chassis/frame structural examination',
      'Advanced suspension/steering/drivetrain assessment',
      'Brake performance analysis',
      'Fuel system evaluation',
      'Ignition system & coil resistance check',
      'Expanded OBD2 diagnostics',
      'Exhaust & catalytic converter test',
      'Deep safety feature testing (SRS, ABS)',
      'Advanced electrical systems check',
      'High-res report with photos',
      'Priority consultation',
    ],
    highlight: true,
  },
  {
    title: 'Advanced Diagnostic Inspection',
    price: 350,
    features: [
      'Oscilloscope-based cam/crank correlation',
      'Ignition waveform analysis',
      'Compression oscilloscope testing',
      'Fuel injector & rail pressure testing',
      'Alternator ripple & charging diagnostics',
      'Thermal imaging of electrical/cooling systems',
      'Advanced suspension load testing',
      'Exhaust gas & emissions analysis',
      'Undercarriage boroscope exam',
      'Real-time oscilloscope data logging',
      'Diagnostic graphs in report',
      'Extended technical consultation',
    ],
  },
];

const PricingPage = () => {
  return (
    <PageContainer>
      <div className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Pricing Plan
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.title}
              whileHover={{ scale: 1.03 }}
              className={`bg-white border rounded-lg shadow p-6 flex flex-col ${
                plan.highlight ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <div className="text-3xl font-bold mt-2">${plan.price}</div>
              </div>
              <ul className="flex-1 space-y-2 mb-6 text-gray-700 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-600 mr-2">✔️</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto px-4 py-2 font-semibold rounded-lg ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                } transition`}
              >
                Select
              </button>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center text-gray-600 px-4">
          <p>
            Our mobile vehicle inspection service travels across Perth metro
            including Southern River, Canning Vale, Rockingham, Mandurah,
            Fremantle, Joondalup & more.
          </p>
          <p className="mt-2">
            Call us: <strong>045 123 70 48</strong> or email{' '}
            <strong>janithadharmasuriya@gmail.com</strong>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

export default PricingPage;