import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { CreditCard, Loader2 } from 'lucide-react';

const PaymentForm = ({ clientSecret, paymentData, onSuccess, onError, paymentStatus }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [buttonDisabledTimer, setButtonDisabledTimer] = useState(false);

  // Effect to handle post-click button disable timeout
  useEffect(() => {
    let timer;
    if (buttonDisabledTimer) {
      // Keep button disabled for 5 seconds from the moment user clicks
      timer = setTimeout(() => {
        setButtonDisabledTimer(false);
      }, 8000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [buttonDisabledTimer]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#F3F4F6',
        backgroundColor: '#3F3F46',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#A1A1AA',
        },
        iconColor: '#F3F4F6',
      },
      invalid: {
        color: '#EA4335',
        iconColor: '#EA4335',
      },
      complete: {
        color: '#22C55E',
        iconColor: '#22C55E',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Start the 5-second disable timer immediately when user clicks
    setButtonDisabledTimer(true);
    setProcessing(true);
    setMessage('');

    const cardElement = elements.getElement(CardElement);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
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

  const isDisabled = !stripe || !elements || processing || paymentStatus === 'pending' || paymentStatus === 'paid' || buttonDisabledTimer;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Amount Display */}
      <div className="bg-background-secondary/50 rounded-lg p-4 border border-border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-text-primary">
            AUD {paymentData.amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Element Container */}
      <div className="bg-background-secondary/30 rounded-lg p-4 border border-border-secondary">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Card Information
            </label>
            <div className="bg-card-secondary rounded-lg p-3 border border-border-secondary">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </div>
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
          processing || paymentStatus === 'pending' || buttonDisabledTimer
            ? 'bg-gray-600 cursor-not-allowed'
            : paymentStatus === 'paid'
            ? 'bg-green-600 cursor-not-allowed'
            : paymentStatus === 'failed'
            ? 'bg-red-600 cursor-not-allowed'
            : paymentStatus === 'cancelled'
            ? 'bg-gray-600 cursor-not-allowed'
            : 'animated-button-primary hover:scale-105'
        }`}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : buttonDisabledTimer && !processing ? (
          <>
            Please Wait...
          </>
        ) : paymentStatus === 'paid' ? (
          <>
            Payment Successful!
          </>
        ) : paymentStatus === 'failed' ? (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Retry Payment - AUD {paymentData.amount.toFixed(2)}
          </>
        ) : paymentStatus === 'cancelled' ? (
          <>
            Payment Cancelled
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay AUD {paymentData.amount.toFixed(2)}
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
