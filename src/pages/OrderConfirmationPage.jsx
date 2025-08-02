import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import useProgressBarScroll from '../hooks/useProgressBarScroll';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  User, 
  Car, 
  Calendar,
  CheckCircle,
  DollarSign 
} from 'lucide-react';
import { categories, getCategoryById, getItemById } from '../meta/menu';
import { formatOrderForSubmission, validateOrderData, handleOrderError } from '../utils/orderUtils';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const { userId, orderFormData, clearFormData } = useGlobalData();
  const { restClient } = useRestClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Initialize progress bar scroll hook (step 4 of 4)
  const { containerRef, stepRefs } = useProgressBarScroll(4, 4);

  if (!orderFormData || !orderFormData.items || orderFormData.items.length === 0) {
    navigate('/accessories/categories');
    return null;
  }

  const selectedItems = orderFormData.items || [];
  const totalAmount = orderFormData.totalAmount || 0;
  const categoryName = orderFormData.categoryName || 'Unknown Category';

  const handleConfirm = async () => {
    if (!restClient) {
      setSubmitError("Network connection not available. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate order data before submission
      const validation = validateOrderData(orderFormData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Format order data for backend
      const requestBody = formatOrderForSubmission(orderFormData, userId);
      console.log("Submitting order data:", requestBody);

      // Call the backend API
      const response = await restClient.post('orders', requestBody);

      if (response.data && response.data.success) {
        console.log("Order created successfully:", response.data);
        setIsSuccess(true);
        
        // Show success state for 3 seconds before navigating
        setTimeout(() => {
          navigate("/status");
          clearFormData();
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setSubmitError(handleOrderError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/order-form");
  };

  const InfoSection = ({ title, icon, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-highlight-primary rounded-full flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ label, value, highlight = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-border-secondary last:border-b-0">
      <span className="text-text-secondary font-medium">{label}:</span>
      <span className={`font-semibold ${highlight ? 'text-highlight-primary text-lg' : 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <FadeInItem element="h1" direction="y" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              {isSuccess ? "Order Placed Successfully!" : "Review Your Order"}
            </FadeInItem>
            <FadeInItem element="p" direction="y" className="text-base sm:text-xl text-text-secondary px-2">
              {isSuccess 
                ? "Thank you for your order. You will be redirected to your status page shortly."
                : "Please review your order details before confirming"
              }
            </FadeInItem>
          </div>

          {/* Progress Indicator */}
          {!isSuccess && (
            <div ref={containerRef} className="flex items-center justify-center mb-8 overflow-x-auto pb-2 -mx-4 px-6 sm:px-8 scrollbar-thin scrollbar-thumb-border-secondary hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 px-8 xs:px-10 sm:px-12 py-2 bg-background-secondary rounded-lg shadow-sm min-w-[800px]">
                <div ref={stepRefs.current[0]} id="step-1" className="flex items-center cursor-pointer whitespace-nowrap pl-6 xs:pl-4" onClick={() => navigate('/accessories/categories')}>
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                    ✓
                  </div>
                  <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium hover:text-highlight-primary">Category</span>
                </div>
                <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-green-500"></div>
                <div ref={stepRefs.current[1]} id="step-2" className="flex items-center cursor-pointer whitespace-nowrap" onClick={() => navigate('/cart')}>
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                    ✓
                  </div>
                  <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium hover:text-highlight-primary">Items</span>
                </div>
                <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-green-500"></div>
                <div ref={stepRefs.current[2]} id="step-3" className="flex items-center cursor-pointer whitespace-nowrap" onClick={() => navigate('/order-form')}>
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                    ✓
                  </div>
                  <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium hover:text-highlight-primary">Details</span>
                </div>
                <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-highlight-primary"></div>
                <div ref={stepRefs.current[3]} id="step-4" className="flex items-center whitespace-nowrap pr-6 xs:pr-4">
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                    4
                  </div>
                  <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium">Confirmation</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Animation */}
          {isSuccess && (
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <FadeInItem element="div" direction="x">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <InfoSection title="Order Details" icon={<Package className="w-5 h-5 text-text-tertiary" />}>
                    <div className="space-y-4">
                      <InfoItem label="Category" value={categoryName} />
                      
                      {/* Items List */}
                      <div className="space-y-3 pl-4 border-l-2 border-border-secondary">
                        <h4 className="font-medium text-text-primary mb-2">Items:</h4>
                        {selectedItems.map((item, index) => (
                          <div key={index} className="bg-background-secondary/30 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-text-primary">{item.itemName}</h5>
                                <p className="text-sm text-text-secondary">{item.itemDesc}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-text-primary">
                                  ${item.totalPrice.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-sm text-text-secondary">
                              <span>${item.itemPrice} × {item.quantity}</span>
                              <span>{item.quantity} item{item.quantity > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-border-secondary">
                        <InfoItem label="Total Amount" value={`$${totalAmount.toFixed(2)}`} highlight={true} />
                      </div>
                    </div>
                  </InfoSection>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Customer Information */}
            <FadeInItem element="div" direction="x">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <InfoSection title="Customer Information" icon={<User className="w-5 h-5 text-text-tertiary" />}>
                    <div className="space-y-3">
                      <InfoItem label="Name" value={orderFormData.customerData?.name || 'N/A'} />
                      <InfoItem label="Email" value={orderFormData.customerData?.email || 'N/A'} />
                      <InfoItem label="Phone" value={orderFormData.customerData?.phoneNumber || 'N/A'} />
                    </div>
                  </InfoSection>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Vehicle Information */}
            <FadeInItem element="div" direction="x">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                <CardContent className="p-6">
                  <InfoSection title="Vehicle Information" icon={<Car className="w-5 h-5 text-text-tertiary" />}>
                    <div className="space-y-3">
                      <InfoItem label="Make" value={orderFormData.carData?.make || 'N/A'} />
                      <InfoItem label="Model" value={orderFormData.carData?.model || 'N/A'} />
                      <InfoItem label="Year" value={orderFormData.carData?.year || 'N/A'} />
                    </div>
                  </InfoSection>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Delivery Information */}
            {orderFormData.deliveryLocation && (
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <InfoSection title="Delivery Information" icon={<Package className="w-5 h-5 text-text-tertiary" />}>
                      <div className="space-y-3">
                        <InfoItem label="Delivery Location" value={orderFormData.deliveryLocation} />
                      </div>
                    </InfoSection>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}

            {/* Additional Notes */}
            {orderFormData.notes && (
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <InfoSection title="Additional Notes" icon={<Calendar className="w-5 h-5 text-text-tertiary" />}>
                      <p className="text-text-secondary bg-background-secondary/50 p-4 rounded-lg">
                        {orderFormData.notes}
                      </p>
                    </InfoSection>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}
          </div>

          {/* Error Message */}
          {submitError && !isSuccess && (
            <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-red-400 mb-1">Error Creating Order</h4>
                  <p className="text-red-300 text-sm">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isSuccess && (
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 px-6 py-3 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                whileHover={isSubmitting ? {} : { x: -4 }}
                whileTap={isSubmitting ? {} : { scale: 0.95 }}
              >
                <ArrowLeft className={`w-5 h-5 transition-transform duration-200 ${
                  isSubmitting ? '' : 'group-hover:-translate-x-1'
                }`} />
                Back to Form
              </motion.button>

              <motion.div
                className="flex-1"
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                <Button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold animated-button-primary"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin"></div>
                      Placing Order...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Confirm Order
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default OrderConfirmationPage;
