import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  DollarSign
} from 'lucide-react';
import { getCategoryById, getItemById } from '../meta/menu';
import { getOrderStatusInfo } from '../utils/orderUtils';

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
        const formattedOrder = formatOrderData(response.data.order);
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

  const formatOrderData = (orderData) => {
    const category = getCategoryById(orderData.categoryId);
    const item = getItemById(orderData.categoryId, orderData.itemId);
    
    return {
      referenceNumber: orderData.orderId,
      status: orderData.status || 'pending',
      category: category?.name || 'Unknown Category',
      item: item?.name || 'Unknown Item',
      description: item?.description || 'No description available',
      quantity: orderData.quantity || 1,
      unitPrice: orderData.price || 0,
      totalPrice: orderData.totalPrice || (orderData.price * orderData.quantity),
      unit: item?.unit || 'piece',
      vehicle: {
        make: orderData.carMake || 'N/A',
        model: orderData.carModel || 'N/A',
        year: orderData.carYear || 'N/A',
        location: orderData.carLocation || 'Not specified'
      },
      customer: {
        name: orderData.customerName || 'N/A',
        email: orderData.customerEmail || 'N/A',
        phone: orderData.customerPhone || 'N/A',
        address: orderData.customerAddress || 'Not specified'
      },
      scheduledDate: orderData.scheduledDate || null,
      notes: orderData.notes || '',
      createdAt: orderData.createdDate || orderData.createdAt || new Date().toISOString().split('T')[0],
      postNotes: orderData.postNotes || ''
    };
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
                className="border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
              >
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
      <div className="font-sans min-h-screen bg-background-primary">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
              Order Details
            </FadeInItem>
            <FadeInItem
              element="p"
              direction="y"
              className="text-xl text-text-secondary"
            >
              Reference: {order.referenceNumber}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">Order Status</h3>
                      <p className="text-text-secondary text-sm">Created: {order.createdAt}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
                      <span className={`font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Category</p>
                      <p className="text-text-primary font-semibold">{order.category}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Item</p>
                      <p className="text-text-primary font-semibold">{order.item}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Description</p>
                      <p className="text-text-primary">{order.description}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Quantity</p>
                      <p className="text-text-primary font-semibold">{order.quantity} {order.unit}(s)</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Unit Price</p>
                      <p className="text-text-primary font-semibold">${order.unitPrice}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Total Price</p>
                      <p className="text-text-primary font-semibold text-highlight-primary text-lg">${order.totalPrice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Vehicle & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Vehicle Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Make:</span>
                        <span className="text-text-primary font-semibold">{order.vehicle.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Model:</span>
                        <span className="text-text-primary font-semibold">{order.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Year:</span>
                        <span className="text-text-primary font-semibold">{order.vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Location:</span>
                        <span className="text-text-primary font-semibold">{order.vehicle.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>

              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Delivery Information</h3>
                    <div className="space-y-3">
                      {order.scheduledDate ? (
                        <div className="p-3 bg-background-secondary/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-highlight-primary" />
                            <span className="text-sm font-medium text-text-primary">Scheduled Date</span>
                          </div>
                          <p className="text-text-primary font-semibold">
                            {new Date(order.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Calendar className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                          <p className="text-text-secondary">No scheduled delivery date</p>
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
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Name</p>
                      <p className="text-text-primary font-semibold">{order.customer.name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Email</p>
                      <p className="text-text-primary font-semibold">{order.customer.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Phone</p>
                      <p className="text-text-primary font-semibold">{order.customer.phone}</p>
                    </div>
                  </div>
                  {order.customer.address !== 'Not specified' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-text-secondary text-sm">Address</p>
                      <p className="text-text-primary font-semibold">{order.customer.address}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Notes */}
            {order.notes && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Order Notes</h3>
                    <p className="text-text-secondary bg-background-secondary/50 p-4 rounded-lg">
                      {order.notes}
                    </p>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}

            {/* Post-Delivery Notes */}
            {order.postNotes && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Delivery Notes</h3>
                    <p className="text-text-secondary bg-background-secondary/50 p-4 rounded-lg">
                      {order.postNotes}
                    </p>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}
          </div>
        </section>

        {/* Back Button */}
        <section className="bg-background-primary py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.button
              onClick={() => navigate('/status')}
              className="flex items-center gap-2 px-6 py-3 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group"
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
