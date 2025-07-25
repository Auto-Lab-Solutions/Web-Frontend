import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import FormField from '../components/common/FormField';
import FormSection from '../components/common/FormSection';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TooltipProvider } from '../components/ui/tooltip';
import { ArrowLeft, Package, ShoppingCart, Car, User } from 'lucide-react';
import { categories, getCategoryById, getItemById } from '../meta/menu';
import { useMobileInputStyling } from '../hooks/useMobileOptimization';

const OrderFormPage = () => {
  const navigate = useNavigate();
  const { orderFormData, updateOrderFormData } = useGlobalData();
  const [errors, setErrors] = useState({});
  
  // Apply mobile input optimizations
  useMobileInputStyling();

  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    carMake: '',
    carModel: '',
    carYear: '',
    carLocation: '',
    notes: '',
    scheduledDate: ''
  });

  // Get selected items from the global context
  const selectedItems = orderFormData.items || [];
  const categoryName = orderFormData.categoryName || '';
  const totalAmount = orderFormData.totalAmount || 0;

  useEffect(() => {
    setOrderData({
      customerName: orderFormData.customerData?.name || '',
      customerEmail: orderFormData.customerData?.email || '',
      customerPhone: orderFormData.customerData?.phoneNumber || '',
      customerAddress: orderFormData.customerData?.address || '',
      carMake: orderFormData.carData?.make || '',
      carModel: orderFormData.carData?.model || '',
      carYear: orderFormData.carData?.year || '',
      carLocation: orderFormData.carData?.location || '',
      notes: orderFormData.notes || '',
      scheduledDate: orderFormData.scheduledDate || ''
    });
  }, [orderFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setOrderData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validation
    if (!selectedItems || selectedItems.length === 0) {
      newErrors.items = "No items selected. Please go back and select items.";
    }
    if (!orderData.customerName) newErrors.customerName = "Name is required";
    if (!orderData.customerEmail) newErrors.customerEmail = "Email is required";
    if (!orderData.customerPhone) newErrors.customerPhone = "Phone number is required";
    if (!orderData.carMake) newErrors.carMake = "Car make is required";
    if (!orderData.carModel) newErrors.carModel = "Car model is required";
    
    // Email validation
    if (orderData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }
    
    // Year validation
    if (orderData.carYear) {
      const year = parseInt(orderData.carYear);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.carYear = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // Update global state and navigate to confirmation
    updateOrderFormData({
      ...orderFormData, // Keep existing items data
      customerData: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        phoneNumber: orderData.customerPhone,
        address: orderData.customerAddress
      },
      carData: {
        make: orderData.carMake,
        model: orderData.carModel,
        year: orderData.carYear,
        location: orderData.carLocation
      },
      notes: orderData.notes,
      scheduledDate: orderData.scheduledDate
    });

    navigate('/order-confirmation');
  };

  // Redirect if no items are selected
  useEffect(() => {
    if (!selectedItems || selectedItems.length === 0) {
      navigate('/accessories/categories');
    }
  }, [selectedItems, navigate]);

  return (
    <TooltipProvider>
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
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
              Create New Order
            </FadeInItem>
            <FadeInItem element="p" direction="y" className="text-xl text-text-secondary">
              Fill out the form below to place your order
            </FadeInItem>
          </div>

          <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Order Details Section */}
                <FormSection title="Order Summary" icon={<Package className="w-5 h-5" />}>
                  {/* Selected Items Display */}
                  <div className="space-y-4">
                    <div className="bg-background-secondary border border-border-secondary rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {categoryName}
                        </h3>
                        <button
                          type="button"
                          onClick={() => navigate(`/accessories/items?category=${orderFormData.categoryId}`)}
                          className="text-sm text-highlight-primary hover:text-highlight-secondary transition-colors"
                        >
                          Edit Items
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-background-primary/50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-text-primary">{item.itemName}</h4>
                              <p className="text-sm text-text-secondary">{item.itemDesc}</p>
                              <p className="text-sm text-text-secondary">
                                ${item.itemPrice} × {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-text-primary">
                                ${item.totalPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total Price Display */}
                      <div className="mt-4 pt-4 border-t border-border-secondary">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-text-primary">Total:</span>
                          <span className="text-2xl font-bold text-highlight-primary">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {errors.items && (
                      <p className="text-red-500 text-sm mt-2">{errors.items}</p>
                    )}
                  </div>

                  {/* Scheduled Date */}
                  <div className="mt-6">
                    <FormField
                      id="scheduledDate"
                      name="scheduledDate"
                      label="Preferred Delivery Date (Optional)"
                      type="date"
                      value={orderData.scheduledDate}
                      onChange={handleChange}
                      tooltip="When would you like this order to be delivered?"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </FormSection>

                {/* Customer Information Section */}
                <FormSection title="Customer Information" icon={<User className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      id="customerName"
                      name="customerName"
                      label="Full Name"
                      value={orderData.customerName}
                      onChange={handleChange}
                      error={errors.customerName}
                      required={true}
                      tooltip="Enter your full name"
                    />
                    <FormField
                      id="customerEmail"
                      name="customerEmail"
                      label="Email Address"
                      type="email"
                      value={orderData.customerEmail}
                      onChange={handleChange}
                      error={errors.customerEmail}
                      required={true}
                      tooltip="Enter your email address"
                    />
                    <FormField
                      id="customerPhone"
                      name="customerPhone"
                      label="Phone Number"
                      type="tel"
                      value={orderData.customerPhone}
                      onChange={handleChange}
                      error={errors.customerPhone}
                      required={true}
                      tooltip="Enter your phone number"
                    />
                    <FormField
                      id="customerAddress"
                      name="customerAddress"
                      label="Address (Optional)"
                      value={orderData.customerAddress}
                      onChange={handleChange}
                      tooltip="Enter your delivery address"
                    />
                  </div>
                </FormSection>

                {/* Vehicle Information Section */}
                <FormSection title="Vehicle Information" icon={<Car className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      id="carMake"
                      name="carMake"
                      label="Make"
                      value={orderData.carMake}
                      onChange={handleChange}
                      error={errors.carMake}
                      required={true}
                      tooltip="Vehicle manufacturer (e.g., Toyota, Honda, BMW)"
                    />
                    <FormField
                      id="carModel"
                      name="carModel"
                      label="Model"
                      value={orderData.carModel}
                      onChange={handleChange}
                      error={errors.carModel}
                      required={true}
                      tooltip="Specific model name (e.g., Camry, Civic, 3 Series)"
                    />
                    <FormField
                      id="carYear"
                      name="carYear"
                      label="Year (Optional)"
                      type="number"
                      value={orderData.carYear}
                      onChange={handleChange}
                      error={errors.carYear}
                      tooltip="Manufacturing year of the vehicle"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    <FormField
                      id="carLocation"
                      name="carLocation"
                      label="Vehicle Location (Optional)"
                      value={orderData.carLocation}
                      onChange={handleChange}
                      tooltip="Where the vehicle is located for service delivery"
                    />
                  </div>
                </FormSection>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-text-primary">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={orderData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-background-secondary border border-border-secondary text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary transition"
                    placeholder="Any special instructions or requirements..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/accessories/items?category=${orderFormData.categoryId}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm"
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Items
                  </motion.button>

                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold animated-button-primary"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Review Order
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
    </TooltipProvider>
  );
};

export default OrderFormPage;
