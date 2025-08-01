import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, CreditCard, Lock, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentSummary from '../components/payment/PaymentSummary';
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../meta/menu';
import { da } from 'date-fns/locale/da';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe with environment configuration
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const { referenceNumber, type } = useParams(); // type: 'appointment' or 'order'
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();

  // Payment states
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [clientSecret, setClientSecret] = useState('');

  // Get data passed from previous page (if any)
  const passedData = location.state;

  useEffect(() => {
    if (referenceNumber && restClient) {
      loadPaymentData();
    }
  }, [referenceNumber, restClient, type]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!restClient) {
        throw new Error('Network connection not available');
      }

      let response;
      if (type === 'appointment') {
        response = await restClient.get(`appointments/${referenceNumber}`, { 
          userId: userId
        });
      } else if (type === 'order') {
        response = await restClient.get(`orders/${referenceNumber}`, { 
          userId: userId
        });
      } else {
        throw new Error('Invalid payment type');
      }

      if (response.data && response.data.success) {
        const data = response.data[type] || response.data.appointment || response.data.order;
        setPaymentData(formatPaymentData(data, type));
        
        // Create payment intent if not already paid
        const paymentStatus = data.paymentStatus?.toLowerCase();
        if (paymentStatus !== 'paid') {
          await createPaymentIntent(data);
        }
      } else {
        setError(`${type} not found.`);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
      if (error.response?.status === 404) {
        setError(`${type} not found. Please check your reference number.`);
      } else if (error.response?.status === 403) {
        setError(`You are not authorized to view this ${type}.`);
      } else {
        setError(`Unable to fetch ${type} details. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPaymentData = (data, dataType) => {
    if (dataType === 'appointment') {
      return {
        type: 'appointment',
        referenceNumber: data.appointmentId,
        title: getServiceById(data.serviceId)?.name || 'Service Appointment',
        subtitle: getPlanById(data.serviceId, data.planId)?.name || 'Standard Plan',
        description: data.description || 'Service appointment details',
        amount: data.totalPrice || 0,
        currency: 'AUD',
        status: data.status,
        paymentStatus: data.paymentStatus,
        createdAt: data.createdDate || data.createdAt,
        customerInfo: {
          name: data.isBuyer ? data.buyerName : data.sellerName,
          email: data.isBuyer ? data.buyerEmail : data.sellerEmail,
          phone: data.isBuyer ? data.buyerPhone : data.sellerPhone || ''
        },
      };
    } else if (dataType === 'order') {
      return {
        type: 'order',
        referenceNumber: data.orderId,
        title: getCategoryById(data.categoryId)?.name || 'Order',
        subtitle: getItemById(data.categoryId, data.itemId)?.name || 'Order',
        description: data.description || 'Order details',
        amount: data.totalPrice || 0,
        currency: 'AUD',
        status: data.status,
        paymentStatus: data.paymentStatus,
        createdAt: data.createdAt,
        customerInfo: {
          name: data.customerName || '',
          email: data.customerEmail || '',
          phone: data.customerPhone || ''
        },
        items: data.items || [],
        vehicleInfo: {
          make: data.carMake || '',
          model: data.carModel || '',
          year: data.carYear || ''
        },
        deliveryLocation: data.deliveryLocation || ''
      };
    }
  };

  const createPaymentIntent = async (data) => {
    try {
      const amount = type === 'appointment' 
        ? data.price || 0
        : data.totalPrice || data.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

      const response = await restClient.post('payments/stripe/intent', {
        userId: userId || 'guest',
        referenceNumber,
        type,
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'aud',
        metadata: {
          userId: userId || 'guest',
          referenceNumber,
          type
        }
      });

      if (response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      if (error.response?.status === 400 && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      setPaymentStatus('processing');
      
      // Update payment status in backend
      await restClient.post(`/payments/stripe/confirm`, {
        paymentIntentId: paymentIntent.id,
        referenceNumber,
        type,
        userId: userId || 'guest'
      });

      setPaymentStatus('success');
      
      // Redirect to status page after success
      setTimeout(() => {
        navigate('/status', { 
          state: { 
            paymentSuccess: true, 
            referenceNumber,
            type 
          } 
        });
      }, 3000);

    } catch (error) {
      console.error('Error confirming payment:', error);
      setPaymentStatus('error');
      setError('Payment succeeded but confirmation failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    setError(error.message || 'Payment failed. Please try again.');
  };

  const getPaymentStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Payment Completed',
          color: 'text-green-500',
          bg: 'bg-green-500/10 border border-green-500/20'
        };
      case 'pending':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: 'Payment Pending',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10 border border-yellow-500/20'
        };
      case 'failed':
      case 'declined':
        return {
          icon: <XCircle className="w-6 h-6" />,
          text: 'Payment Failed',
          color: 'text-red-500',
          bg: 'bg-red-500/10 border border-red-500/20'
        };
      default:
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: 'Payment Required',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10 border border-blue-500/20'
        };
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="font-sans min-h-screen bg-background-primary flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-highlight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading payment details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="font-sans min-h-screen bg-background-primary">
          <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 mt-8">Payment Error</h1>
              <p className="text-xl text-text-secondary mb-8">{error}</p>
              <Button
                onClick={() => navigate('/status')}
                className="animated-button-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Status
              </Button>
            </div>
          </section>
        </div>
      </PageContainer>
    );
  }

  if (!paymentData) {
    return null;
  }

  // Check if already paid
  const paymentStatusInfo = getPaymentStatusInfo(paymentData.paymentStatus);
  const isAlreadyPaid = ['paid'].includes(paymentData.paymentStatus?.toLowerCase());

  if (isAlreadyPaid) {
    return (
      <PageContainer>
        <div className="font-sans min-h-screen bg-background-primary">
          <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Payment Already Completed</h1>
                <p className="text-xl text-text-secondary mb-8">
                  This {type} has already been paid for.
                </p>
              </div>
              <Button
                onClick={() => navigate('/status')}
                className="animated-button-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Status
              </Button>
            </div>
          </section>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="font-sans min-h-screen bg-background-primary">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <FadeInItem element="div" direction="y" className="mb-6">
              <Button
                onClick={() => navigate('/status')}
                variant="outline"
                className="mb-4 border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Status
              </Button>
            </FadeInItem>

            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
              {paymentData.title}
            </FadeInItem>
            <FadeInItem
              element="p"
              direction="y"
              className="text-xl text-text-secondary"
            >
              Reference: {paymentData.referenceNumber}
            </FadeInItem>
          </div>
        </section>

        {/* Payment Content */}
        <section className="bg-background-secondary py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Payment Summary */}
              <FadeInItem element="div" direction="x">
                <PaymentSummary paymentData={paymentData} />
              </FadeInItem>

              {/* Payment Form */}
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm sticky top-8">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary">Secure Payment</h3>
                        <p className="text-text-secondary text-sm">Your payment is protected by Stripe</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Security Badges */}
                    <div className="flex items-center gap-4 mb-6 p-3 bg-background-secondary/50 rounded-lg">
                      <Shield className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">256-bit SSL Encryption</p>
                        <p className="text-xs text-text-secondary">Your data is secure and encrypted</p>
                      </div>
                      <Lock className="w-5 h-5 text-text-secondary" />
                    </div>

                    {/* Payment Status */}
                    <div className={`flex items-center gap-3 p-3 rounded-lg mb-6 ${paymentStatusInfo.bg}`}>
                      <span className={paymentStatusInfo.color}>
                        {paymentStatusInfo.icon}
                      </span>
                      <span className={`font-medium ${paymentStatusInfo.color}`}>
                        {paymentStatusInfo.text}
                      </span>
                    </div>

                    {/* Show payment form only if not already paid and we have clientSecret */}
                    {!isAlreadyPaid && clientSecret && (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm
                          clientSecret={clientSecret}
                          paymentData={paymentData}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          paymentStatus={paymentStatus}
                        />
                      </Elements>
                    )}

                    {/* Loading state for payment intent creation */}
                    {!isAlreadyPaid && !clientSecret && !error && (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-text-secondary">Initializing secure payment...</p>
                      </div>
                    )}

                    {/* Payment Success State */}
                    {paymentStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-500 mb-2">Payment Successful!</h3>
                        <p className="text-text-secondary mb-4">
                          Your payment has been processed successfully.
                        </p>
                        <p className="text-sm text-text-secondary">
                          Redirecting to status page...
                        </p>
                      </motion.div>
                    )}

                    {/* Payment Error State */}
                    {paymentStatus === 'error' && error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <XCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-500 mb-2">Payment Failed</h3>
                        <p className="text-text-secondary mb-4">{error}</p>
                        <Button
                          onClick={() => {
                            setPaymentStatus('idle');
                            setError('');
                            loadPaymentData();
                          }}
                          className="animated-button-primary"
                        >
                          Try Again
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </FadeInItem>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default PaymentPage;
