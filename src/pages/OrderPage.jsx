import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { downloadInvoicePDF } from '../utils/pdfUtils';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Car, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Truck,
  DollarSign,
  CreditCard,
  CheckCircle,
  Download,
  Clock,
  UserCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { getCategoryById, getItemById } from '../meta/menu';
import { getOrderStatusInfo } from '../utils/orderUtils';
import { isPaymentRequired, getPaymentStatusInfo, formatPaymentMethod } from '../utils/paymentUtils';
import { companyLocalPhone, companyEmail } from '../meta/companyData';
import { formatPerthDateTime, formatPerthRelativeTime } from '../utils/timezoneUtils';
import BackArrow from '../components/common/BackArrow';

const OrderPage = () => {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (referenceNumber && restClient) {
      loadOrderDetails();
    }
  }, [referenceNumber, restClient]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');

      if (!restClient) {
        throw new Error('Network connection not available');
      }

      // Fetch order details using GET with path param and query param
      const response = await restClient.get(`orders/${referenceNumber}`, { 
        userId: userId || 'guest' 
      });

      if (response.data && response.data.success && response.data.order) {
        const formattedOrder = formatOrderData(response.data.order, response.data.assignedMechanic);
        setOrder(formattedOrder);
      } else {
        setError('Order not found.');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 404) {
        setError('Order not found. Please check your reference number.');
      } else if (error.response?.status === 403) {
        setError('You are not authorized to view this order.');
      } else {
        setError('Unable to fetch order details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatOrderData = (orderData, assignedMechanic = null) => {
    // Format each item in the order with additional information
    const formattedItems = (orderData.items || []).map(item => {
      const category = getCategoryById(item.categoryId);
      const itemDetails = getItemById(item.categoryId, item.itemId);
      
      return {
        ...item,
        name: itemDetails?.name || 'Unknown Item',
        description: itemDetails?.description || 'No description available',
        categoryName: category?.name || 'Unknown Category',
        // Ensure price and quantity are numbers
        unitPrice: parseFloat(item.unitPrice || 0),
        totalPrice: parseFloat(item.totalPrice || 0),
        quantity: parseInt(item.quantity || 1, 10)
      };
    });
    
    return {
      referenceNumber: orderData.orderId,
      status: orderData.status || 'pending',
      paymentStatus: orderData.paymentStatus || 'pending',
      items: formattedItems,
      totalPrice: orderData.totalPrice || formattedItems.reduce((sum, item) => sum + item.totalPrice, 0),
      vehicle: {
        make: orderData.carMake || 'N/A',
        model: orderData.carModel || 'N/A',
        year: orderData.carYear || 'N/A',
      },
      customer: {
        name: orderData.customerName || 'N/A',
        email: orderData.customerEmail || 'N/A',
        phone: orderData.customerPhone || 'N/A',
      },
      deliveryLocation: orderData.deliveryLocation || '',
      scheduledDate: orderData.scheduledDate || null,
      assignedMechanicId: orderData.assignedMechanicId || null,
      assignedMechanic: assignedMechanic || null,
      notes: orderData.notes || '',
      postNotes: orderData.postNotes || '',
      createdAt: orderData.createdDate || orderData.createdAt || formatPerthDateTime(new Date(), { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).split('/').reverse().join('-'),
      updatedAt: orderData.updatedAt || null,
      // Enhanced payment-related fields
      paymentDetails: {
        paidAt: orderData.paidAt || null,
        paymentAmount: orderData.paymentAmount || null,
        paymentIntentId: orderData.paymentIntentId || null,
        paymentMethod: orderData.paymentMethod || null,
        invoiceUrl: orderData.invoiceUrl || null,
        updatedAt: orderData.updatedAt || null
      }
    };
  };

  // Helper function to format timestamps using Perth timezone
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return formatPerthDateTime(timestamp, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to format dates in a user-friendly way using Perth timezone
  const formatUserFriendlyDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      // Use relative time formatting for Perth timezone
      return formatPerthRelativeTime(dateInput);
    } catch (error) {
      // Fallback to absolute Perth time formatting
      return formatPerthDateTime(dateInput, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Helper function to check if a value is empty/not meaningful
  const isEmpty = (value) => {
    return !value || 
           value === '' || 
           value === 'N/A' || 
           value === 'Not specified' || 
           value === 'TBD' || 
           value === null || 
           value === undefined;
  };

  // Helper function to check if assigned mechanic has meaningful data
  const hasMechanicInfo = (mechanic) => {
    if (!mechanic) return false;
    return !isEmpty(mechanic.userName) || 
           !isEmpty(mechanic.userEmail) || 
           !isEmpty(mechanic.contactNumber);
  };

  // Helper function to check if payment details have meaningful data
  const hasPaymentDetails = (paymentDetails) => {
    if (!paymentDetails) return false;
    return !isEmpty(paymentDetails.paymentAmount) ||
           !isEmpty(paymentDetails.paidAt) ||
           !isEmpty(paymentDetails.paymentMethod) ||
           !isEmpty(paymentDetails.paymentIntentId) ||
           !isEmpty(paymentDetails.invoiceUrl);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-background-primary flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-highlight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading order details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Order Not Found</h2>
            <p className="text-text-secondary mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/status')}
                variant="outline"
                className="border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary hover:bg-card-primary/50 shadow-sm hover:shadow flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Status
              </Button>
              <Button
                onClick={() => navigate('/order-form')}
                className="animated-button-primary"
              >
                Create New Order
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return null;
  }

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <PageContainer>
      <div className="font-sans min-h-screen bg-background-primary relative">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary pt-15 pb-20 px-6 text-center">
          <BackArrow to={() => navigate('/status')} />
          <div className="max-w-4xl mx-auto">
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-6">
              Order Details
            </FadeInItem>
            <FadeInItem element="div" direction="y" className="inline-block">
              <div className="bg-card-primary border-2 border-highlight-primary rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm sm:max-w-none mx-auto">
                <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wide">
                  Reference Number
                </div>
                <div className="text-lg sm:text-xl font-bold text-highlight-primary font-mono tracking-wider break-all sm:break-normal">
                  {order.referenceNumber.toUpperCase()}
                </div>
              </div>
            </FadeInItem>
          </div>
        </section>

        {/* Order Details */}
        <section className="bg-background-secondary py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Card */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Order Status</h3>
                      <div className="flex items-center gap-6 flex-wrap text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatUserFriendlyDate(order.createdAt)}</span>
                        </div>
                        {!isEmpty(order.updatedAt) && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Clock className="w-4 h-4" />
                            <span>Updated {formatUserFriendlyDate(order.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
                        <span className={`font-semibold ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Order Information */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Order Information</h3>
                  
                  {/* Order Items Table */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" /> Ordered Items
                    </h4>
                    
                    {order.items && order.items.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="min-w-full">
                          {/* Table Header */}
                          <div className="grid grid-cols-12 gap-4 p-4 bg-background-tertiary/50 rounded-t-lg border-b border-border-secondary text-sm font-semibold text-text-primary">
                            <div className="col-span-5">Item Details</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-center">Unit Price (AUD)</div>
                            <div className="col-span-3 text-right">Total Price (AUD)</div>
                          </div>
                          
                          {/* Table Body */}
                          <div className="bg-background-secondary/20 rounded-b-lg">
                            {order.items.map((item, index) => (
                              <div key={index} className={`grid grid-cols-12 gap-4 p-4 ${index < order.items.length - 1 ? 'border-b border-border-secondary/50' : ''}`}>
                                {/* Item Details */}
                                <div className="col-span-5">
                                  <div className="space-y-1">
                                    <p className="text-text-primary font-semibold text-sm">{item.name || 'Unknown Item'}</p>
                                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                                      {item.categoryName || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Quantity */}
                                <div className="col-span-2 flex items-center justify-center">
                                  <span className="text-text-primary font-semibold text-sm">
                                    {item.quantity || 1}
                                  </span>
                                </div>
                                
                                {/* Unit Price */}
                                <div className="col-span-2 flex items-center justify-center">
                                  <span className="text-text-primary font-semibold text-sm">
                                    {(item.unitPrice || 0).toFixed(2)}
                                  </span>
                                </div>
                                
                                {/* Total Price */}
                                <div className="col-span-3 flex items-center justify-end">
                                  <span className="text-highlight-primary font-bold text-sm">
                                    {(item.totalPrice || 0).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-background-secondary/20 rounded-lg">
                        <Package className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                        <p className="text-text-secondary">No items in this order</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Total */}
                  <div className="border-t border-border-secondary pt-4 mt-4">
                    <div className="flex justify-between items-center bg-highlight-primary/10 border border-highlight-primary/20 p-4 rounded-lg">
                      <p className="text-text-primary font-semibold text-lg">Total Amount</p>
                      <p className="text-highlight-primary font-bold text-2xl">AUD {(order.totalPrice || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Payment Section */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">Payment Status</h3>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getPaymentStatusInfo(order.paymentStatus).bg} self-start`}>
                      <CreditCard className="w-5 h-5 text-black" />
                      <span className={`font-semibold ${getPaymentStatusInfo(order.paymentStatus).textColor}`}>
                        {getPaymentStatusInfo(order.paymentStatus).text}
                      </span>
                    </div>
                  </div>
                  
                  {isPaymentRequired(order.paymentStatus) && order.status?.toLowerCase() !== 'cancelled' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-text-primary font-medium mb-1">Payment Required</p>
                          <p className="text-text-secondary text-sm">
                            {order.status?.toLowerCase() === 'pending' ?
                              "Please complete your payment to process this order."
                              :
                              "You can complete your payment online or during delivery."
                            }
                          </p>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Button
                            onClick={() => navigate(`/payment/order/${order.referenceNumber}`)}
                            className="payment-button animated-button-primary w-full sm:w-auto"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isPaymentRequired(order.paymentStatus) && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-green-400 font-medium">Payment Completed</p>
                          <p className="text-green-300 text-sm">Thank you for your payment!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Details - Show when payment is completed */}
                  {!isPaymentRequired(order.paymentStatus) && hasPaymentDetails(order.paymentDetails) && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-lg font-semibold text-text-primary">Payment Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!isEmpty(order.paymentDetails.paymentAmount) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Payment Amount</p>
                            <p className="text-text-primary font-semibold">AUD {order.paymentDetails.paymentAmount}</p>
                          </div>
                        )}
                        {!isEmpty(order.paymentDetails.paidAt) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Paid At</p>
                            <p className="text-text-primary font-semibold">{formatTimestamp(order.paymentDetails.paidAt)}</p>
                          </div>
                        )}
                        {!isEmpty(order.paymentDetails.paymentMethod) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Payment Method</p>
                            <p className="text-text-primary font-semibold">{formatPaymentMethod(order.paymentDetails.paymentMethod)}</p>
                          </div>
                        )}
                        {!isEmpty(order.paymentDetails.paymentIntentId) && (
                          <div className="space-y-1 sm:col-span-2">
                            <p className="text-text-secondary text-sm">Transaction ID</p>
                            <p className="text-text-primary font-semibold font-mono text-xs break-all">{order.paymentDetails.paymentIntentId}</p>
                          </div>
                        )}
                      </div>
                      {!isEmpty(order.paymentDetails.invoiceUrl) && (
                        <div className="mt-3">
                          <a
                            href={order.paymentDetails.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Invoice
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Vehicle & Delivery/Mechanic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Vehicle Details</h3>
                    <div className="space-y-3">
                      {!isEmpty(order.vehicle.make) && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Make:</span>
                          <span className="text-text-primary font-semibold">{order.vehicle.make}</span>
                        </div>
                      )}
                      {!isEmpty(order.vehicle.model) && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Model:</span>
                          <span className="text-text-primary font-semibold">{order.vehicle.model}</span>
                        </div>
                      )}
                      {!isEmpty(order.vehicle.year) && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Year:</span>
                          <span className="text-text-primary font-semibold">{order.vehicle.year}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>

              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Delivery Information</h3>
                    
                    {/* Assigned Mechanic */}
                    {hasMechanicInfo(order.assignedMechanic) && (
                      <div className="mb-4">
                        <h4 className="text-md font-semibold text-blue-400 mb-3 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" /> Assigned Mechanic
                        </h4>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="space-y-2">
                            {!isEmpty(order.assignedMechanic.userName) && (
                              <div className="flex justify-between">
                                <span className="text-text-secondary text-sm">Name:</span>
                                <span className="text-blue-400 font-semibold text-sm">{order.assignedMechanic.userName}</span>
                              </div>
                            )}
                            {!isEmpty(order.assignedMechanic.userEmail) && (
                              <div className="flex justify-between">
                                <span className="text-text-secondary text-sm">Email:</span>
                                <span className="text-blue-400 font-semibold text-sm">{order.assignedMechanic.userEmail}</span>
                              </div>
                            )}
                            {!isEmpty(order.assignedMechanic.contactNumber) && (
                              <div className="flex justify-between">
                                <span className="text-text-secondary text-sm">Contact:</span>
                                <span className="text-blue-400 font-semibold text-sm">{order.assignedMechanic.contactNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Delivery Information */}
                    <div className="space-y-3">
                      {order.scheduledDate ? (
                        <div className="p-3 bg-background-secondary/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-highlight-primary" />
                            <span className="text-sm font-medium text-text-primary">Scheduled Date</span>
                          </div>
                          <p className="text-text-primary font-semibold">
                            {formatPerthDateTime(order.scheduledDate, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Calendar className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                          <p className="text-text-secondary text-sm">No scheduled delivery date</p>
                        </div>
                      )}
                      
                      {!isEmpty(order.deliveryLocation) && (
                        <div className="p-3 bg-background-secondary/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-highlight-primary" />
                            <span className="text-sm font-medium text-text-primary">Delivery Location</span>
                          </div>
                          <p className="text-text-primary font-semibold text-sm">
                            {order.deliveryLocation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>
            </div>

            {/* Customer Information */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {!isEmpty(order.customer.name) && (
                      <div className="space-y-2">
                        <p className="text-text-secondary text-sm">Name</p>
                        <p className="text-text-primary font-semibold">{order.customer.name}</p>
                      </div>
                    )}
                    {!isEmpty(order.customer.email) && (
                      <div className="space-y-2">
                        <p className="text-text-secondary text-sm">Email</p>
                        <p className="text-text-primary font-semibold">{order.customer.email}</p>
                      </div>
                    )}
                    {!isEmpty(order.customer.phone) && (
                      <div className="space-y-2">
                        <p className="text-text-secondary text-sm">Phone</p>
                        <p className="text-text-primary font-semibold">{order.customer.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Notes */}
            {(order.notes || order.postNotes) && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Notes</h3>
                    
                    {order.notes && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Pre-Delivery Notes
                        </h4>
                        <p className="text-text-primary leading-relaxed bg-card-secondary/50 rounded-lg p-4 border border-border-secondary">
                          {order.notes}
                        </p>
                      </div>
                    )}
                    
                    {order.postNotes && (
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Delivery Notes
                        </h4>
                        <p className="text-text-primary leading-relaxed bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          {order.postNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeInItem>
            )}
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="bg-background-primary py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <FadeInItem element="h2" direction="y" className="text-2xl font-bold text-text-primary mb-8">
              Need Help?
            </FadeInItem>
            <FadeInItem element="p" direction="y" className="text-text-secondary mb-8">
              Have questions about this order? Our team is here to help.
            </FadeInItem>
            
            <FadeInItem element="div" direction="y">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Phone className="w-8 h-8 text-highlight-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Call Us</h3>
                    <a 
                      href={`tel:${companyLocalPhone}`}
                      className="text-highlight-primary font-semibold hover:underline"
                    >
                      {companyLocalPhone}
                    </a>
                  </CardContent>
                </Card>

                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 text-highlight-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Email Us</h3>
                    <a 
                      href={`mailto:${companyEmail}`}
                      className="text-highlight-primary font-semibold hover:underline"
                    >
                      {companyEmail}
                    </a>
                  </CardContent>
                </Card>
              </div>
            </FadeInItem>
          </div>
        </section>

        {/* Back Button */}
        <section className="bg-background-primary py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.button
              onClick={() => navigate('/status')}
              className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group shadow-sm hover:shadow border border-border-secondary"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Status
            </motion.button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default OrderPage;
