import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X, 
  Calendar, 
  Car, 
  Eye, 
  Plus,
  Package,
  Truck
} from 'lucide-react';
import { getCategoryById, getItemById } from '../meta/orders';
import { getOrderStatusInfo } from '../utils/orderUtils';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user's orders on component mount
  useEffect(() => {
    if (userId && restClient) {
      loadUserOrders();
    }
  }, [userId, restClient]);

  const loadUserOrders = async () => {
    if (!userId || !restClient) return;

    try {
      setLoading(true);
      const response = await restClient.get('orders', { userId });
      
      if (response.data && response.data.success) {
        const orders = response.data.orders || [];
        setUserOrders(orders);
        setFilteredOrders(orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (!restClient) {
        throw new Error('Network connection not available');
      }

      // Search in user's orders for the reference number
      const filtered = userOrders.filter(order => 
        order.orderId && 
        order.orderId.toLowerCase().includes(referenceNumber.trim().toLowerCase())
      );

      if (filtered.length > 0) {
        setFilteredOrders(filtered);
      } else {
        // If not found in loaded orders, try fetching from backend
        try {
          const response = await restClient.get(`orders/${referenceNumber.trim()}`, { 
            userId: userId || 'guest' 
          });

          if (response.data && response.data.success && response.data.order) {
            setFilteredOrders([response.data.order]);
          } else {
            setFilteredOrders([]);
            setError('Order not found. Please check your reference number.');
          }
        } catch (fetchError) {
          setFilteredOrders([]);
          if (fetchError.response?.status === 404) {
            setError('Order not found. Please check your reference number.');
          } else if (fetchError.response?.status === 403) {
            setError('You are not authorized to view this order.');
          } else {
            setError('Unable to fetch order details. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error during search:', error);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setReferenceNumber('');
    setError('');
    setFilteredOrders(userOrders);
  };

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const formatOrderData = (orderData) => {
    const category = getCategoryById(orderData.categoryId);
    const item = getItemById(orderData.categoryId, orderData.itemId);
    
    return {
      referenceNumber: orderData.orderId,
      status: orderData.status || 'pending',
      category: category?.name || 'Unknown Category',
      item: item?.name || 'Unknown Item',
      quantity: orderData.quantity || 1,
      unitPrice: orderData.price || 0,
      totalPrice: orderData.totalPrice || (orderData.price * orderData.quantity),
      vehicle: {
        make: orderData.carMake || 'N/A',
        model: orderData.carModel || 'N/A',
        year: orderData.carYear || 'N/A'
      },
      customer: {
        name: orderData.customerName || 'N/A',
        email: orderData.customerEmail || 'N/A',
        phone: orderData.customerPhone || 'N/A'
      },
      scheduledDate: orderData.scheduledDate || null,
      createdAt: orderData.createdDate || orderData.createdAt || new Date().toISOString().split('T')[0]
    };
  };

  const isSearchActive = referenceNumber.trim() !== '';

  return (
    <PageContainer>
      <div className="font-sans min-h-screen bg-background-primary">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
          <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4 mt-8">
            Your Orders
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="y"
            className="text-xl max-w-2xl mx-auto text-text-secondary"
          >
            View all your orders or search for a specific one using the reference number.
          </FadeInItem>
        </section>

        {/* Search Section */}
        <section className="bg-background-primary py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-highlight-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-text-tertiary" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Search Orders</h2>
                    <p className="text-text-secondary">Enter a reference number to search for a specific order</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter reference number (e.g., ORD-2025-001)"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="text-base h-12 bg-background-secondary border-border-secondary focus:border-highlight-primary"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <motion.div
                        className="flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleSearch}
                          disabled={loading}
                          className="w-full h-12 text-base font-semibold animated-button-primary"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin"></div>
                              Searching...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Search className="w-5 h-5" />
                              Search
                            </div>
                          )}
                        </Button>
                      </motion.div>

                      {isSearchActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleClearSearch}
                            variant="outline"
                            className="h-12 px-6 border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>
          </div>
        </section>

        {/* Create New Order Button */}
        <section className="bg-background-secondary py-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <FadeInItem element="div" direction="y">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => navigate('/order-form')}
                  className="animated-button-primary text-lg px-8 py-4 h-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Order
                </Button>
              </motion.div>
            </FadeInItem>
          </div>
        </section>

        {/* Orders List */}
        {filteredOrders.length > 0 && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <FadeInItem element="div" direction="y">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-text-primary mb-2">
                    {isSearchActive ? 'Search Results' : 'All Orders'}
                  </h2>
                  <p className="text-text-secondary">
                    {isSearchActive 
                      ? `Found ${filteredOrders.length} order(s) matching your search`
                      : `Showing ${filteredOrders.length} order(s)`
                    }
                  </p>
                </div>
              </FadeInItem>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order, index) => {
                  const formattedOrder = formatOrderData(order);
                  const statusInfo = getOrderStatusInfo(formattedOrder.status);
                  
                  return (
                    <FadeInItem key={order.orderId || index} element="div" direction="y" delay={index * 0.1}>
                      <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105">
                        <CardContent className="p-6">
                          {/* Header with status */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-text-secondary">
                              Ref: {formattedOrder.referenceNumber}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.bg}`}>
                              <span className={`font-semibold ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>

                          {/* Order info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-text-primary mb-1">{formattedOrder.item}</h3>
                            <p className="text-text-secondary text-sm">{formattedOrder.category}</p>
                          </div>

                          {/* Quantity and price */}
                          <div className="mb-4 p-3 bg-background-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-4 h-4 text-highlight-primary" />
                              <span className="text-sm font-medium text-text-primary">Order Details</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Quantity:</span>
                              <span className="text-text-primary font-semibold">{formattedOrder.quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Unit Price:</span>
                              <span className="text-text-primary font-semibold">${formattedOrder.unitPrice}</span>
                            </div>
                          </div>

                          {/* Vehicle info */}
                          <div className="mb-4 p-3 bg-background-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Car className="w-4 h-4 text-highlight-primary" />
                              <span className="text-sm font-medium text-text-primary">Vehicle</span>
                            </div>
                            <p className="text-sm text-text-secondary">
                              {formattedOrder.vehicle.make} {formattedOrder.vehicle.model} ({formattedOrder.vehicle.year})
                            </p>
                          </div>

                          {/* Scheduled date */}
                          {formattedOrder.scheduledDate && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Truck className="w-4 h-4 text-highlight-primary" />
                                <span className="text-sm font-medium text-text-primary">Scheduled</span>
                              </div>
                              <p className="text-sm text-text-secondary">
                                {new Date(formattedOrder.scheduledDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          {/* Total price */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-text-secondary text-sm">Total Price</span>
                            <span className="text-highlight-primary font-semibold text-lg">${formattedOrder.totalPrice}</span>
                          </div>

                          {/* View details button */}
                          <Button
                            onClick={() => handleOrderClick(formattedOrder.referenceNumber)}
                            variant="outline"
                            className="w-full text-sm border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </FadeInItem>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* No orders message */}
        {!loading && filteredOrders.length === 0 && userOrders.length === 0 && !isSearchActive && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <FadeInItem element="div" direction="y">
                <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
                  <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Orders Found</h3>
                  <p className="text-text-secondary mb-6">You haven't created any orders yet.</p>
                  <Button
                    onClick={() => navigate('/order-form')}
                    className="animated-button-primary"
                  >
                    Create Your First Order
                  </Button>
                </div>
              </FadeInItem>
            </div>
          </section>
        )}

        {/* Search no results message */}
        {!loading && filteredOrders.length === 0 && isSearchActive && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <FadeInItem element="div" direction="y">
                <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
                  <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Results Found</h3>
                  <p className="text-text-secondary mb-6">
                    No orders found matching "{referenceNumber}". Please check your reference number or clear the search to view all orders.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      className="border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
                    >
                      Clear Search
                    </Button>
                    <Button
                      onClick={() => navigate('/order-form')}
                      className="animated-button-primary"
                    >
                      Create New Order
                    </Button>
                  </div>
                </div>
              </FadeInItem>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};

export default OrdersPage;
