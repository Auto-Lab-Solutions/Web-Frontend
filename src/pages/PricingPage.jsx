import PageContainer from '../components/common/PageContainer';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getServiceById, getPlanById } from "../meta/menu";
import { useFormData } from '../components/FormDataContext';
import { Check } from 'lucide-react';

const PricingPage = ({ serviceId }) => {
  const navigate = useNavigate();
  const serviceName = getServiceById(serviceId)?.name || "Service";
  const plans = getServiceById(serviceId)?.plans || [];
  const { updateFormData  } = useFormData();
  return (
    <PageContainer>
      <div className="py-16 bg-background-primary text-text-primary">
        <h2 className="text-3xl font-bold text-center mb-12 mt-2 px-4">
          Choose Your Pricing Plan
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-card-primary border rounded-lg shadow p-5 py-8 mx-1 flex flex-col border-border-secondary"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-center text-text-primary">{plan.name}</h3>
                <div className="text-3xl font-bold mt-2 text-center text-text-primary">AUD {plan.price}</div>
              </div>
              <ul className="flex-1 space-y-2 mb-6 text-gray-700 text-sm">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    {/* <span className="mr-2">✅</span> */}
                    <Check className="w-5 h-5 text-highlight-primary mr-2" />
                    <span className="text-base text-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className="mt-auto px-4 py-2 font-semibold rounded-lg
                bg-button-primary text-text-tertiary hover:bg-highlight-primary transition"
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
        <div className="mt-12 text-center px-4 max-w-2xl mx-auto text-text-secondary">
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