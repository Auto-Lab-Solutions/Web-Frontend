import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

const PaymentForm = ({ clientSecret, paymentData, onSuccess, onError, paymentStatus }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('Payment failed:', error);
      setMessage(error.message);
      onError(error);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment succeeded:', paymentIntent);
      onSuccess(paymentIntent);
    }

    setProcessing(false);
  };

  const isDisabled = !stripe || !elements || processing || paymentStatus === 'processing' || paymentStatus === 'success';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Amount Display */}
      <div className="bg-background-secondary/50 rounded-lg p-4 border border-border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-text-primary">
            AUD ${paymentData.amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Element Container */}
      <div className="bg-background-secondary/30 rounded-lg p-4 border border-border-secondary">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: 'transparent',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              },
              rules: {
                '.Input': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
                '.Input:focus': {
                  border: '1px solid #3b82f6',
                  boxShadow: '0 0 0 1px #3b82f6',
                },
                '.Label': {
                  color: '#9ca3af',
                  fontWeight: '500',
                },
                '.Tab': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                },
                '.Tab:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '.Tab--selected': {
                  backgroundColor: '#3b82f6',
                  border: '1px solid #3b82f6',
                },
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {message && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-sm">{message}</p>
        </div>
      )}

      {/* Payment Button */}
      <Button
        type="submit"
        disabled={isDisabled}
        className={`w-full py-3 text-lg font-semibold transition-all duration-200 ${
          processing || paymentStatus === 'processing'
            ? 'bg-gray-600 cursor-not-allowed'
            : paymentStatus === 'success'
            ? 'bg-green-600 cursor-default'
            : 'animated-button-primary hover:scale-105'
        }`}
      >
        {processing || paymentStatus === 'processing' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : paymentStatus === 'success' ? (
          <>
            Payment Successful!
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay AUD ${paymentData.amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-text-secondary">
          Your payment information is secure and encrypted. We never store your card details.
        </p>
      </div>
    </form>
  );
};

export default PaymentForm;
