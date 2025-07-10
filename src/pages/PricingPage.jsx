import PageContainer from '../components/common/PageContainer';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getServiceById, getPlanById } from "../utils/menu";
import { useFormData } from '../components/FormDataContext';

const PricingPage = ({ serviceId }) => {
  const navigate = useNavigate();
  const plans = getServiceById(serviceId)?.plans || [];
  const { updateFormData  } = useFormData();
  return (
    <PageContainer>
      <div className="py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Pricing Plan
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className={`bg-white border rounded-lg shadow p-6 flex flex-col ${
                plan.highlight ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
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
                onClick={() => {
                  updateFormData({
                    serviceId: serviceId,
                    planId: plan.id,
                  });
                  navigate('/booking-form');
                }}
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