import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import { Button } from '../components/ui/button';
import { CheckCircle, ArrowRight, Home, FileText } from 'lucide-react';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();

  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentIntent = searchParams.get('payment_intent');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

  useEffect(() => {
    if (paymentIntent && restClient) {
      confirmPayment();
    } else {
      // If no payment intent, redirect to status page
      setTimeout(() => navigate('/status'), 3000);
    }
  }, [paymentIntent, restClient]);

  const confirmPayment = async () => {
    try {
      setLoading(true);

      const response = await restClient.post('payments/stripe/confirm', {
        paymentIntentId: paymentIntent
      });

      if (response.data && response.data.success) {
        setConfirmationData(response.data);
        
        // Auto-redirect to appointment page after confirmation
        setTimeout(() => {
          if (response.data.type && response.data.referenceNumber) {
            navigate(`/${response.data.type}/${response.data.referenceNumber}`);
          } else {
            navigate('/status');
          }
        }, 5000); // Give user time to see the success message
      }
    } catch (error) {
      console.error('Error confirming payment success:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (confirmationData?.type && confirmationData?.referenceNumber) {
      navigate(`/${confirmationData.type}/${confirmationData.referenceNumber}`);
    } else {
      navigate('/status');
    }
  };

  return (
    <PageContainer>
      <div className="font-sans min-h-screen bg-background-primary flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Payment Successful! 🎉
            </h1>
            <p className="text-xl text-text-secondary mb-6">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>

            {confirmationData && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card-primary border border-border-primary rounded-lg p-6 mx-auto max-w-md"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Reference:</span>
                    <span className="text-text-primary font-medium">
                      {confirmationData.referenceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span className="text-text-primary font-medium capitalize">
                      {confirmationData.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Amount:</span>
                    <span className="text-text-primary font-medium">
                      AUD {(confirmationData.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {loading && (
              <div className="bg-card-primary border border-border-primary rounded-lg p-6 mx-auto max-w-md">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-text-secondary">Confirming payment...</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleViewDetails}
              className="animated-button-primary px-8 py-3 text-lg font-semibold group"
            >
              <FileText className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
              View Details
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-8 py-3 text-lg font-semibold border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary group"
            >
              <Home className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
              Go Home
            </Button>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 p-6 bg-card-secondary/50 border border-border-secondary rounded-lg backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold text-text-primary mb-3">What's Next?</h3>
            <div className="text-text-secondary space-y-2 text-sm">
              <p>• You will receive a confirmation email shortly</p>
              <p>• Our team will contact you to schedule or confirm details</p>
              <p>• You can track your {confirmationData?.type || 'request'} status anytime</p>
              <p>• Need help? Contact our support team</p>
            </div>
          </motion.div>

          {/* Auto-redirect notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-text-secondary text-sm mt-6"
          >
            You will be redirected to your appointment details page automatically in a few moments.
          </motion.p>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default PaymentSuccessPage;
