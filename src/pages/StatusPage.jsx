import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRestClient } from '../components/contexts/RestContext';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Calendar, Package, Clock, Car, Settings, Banknote, CreditCard } from 'lucide-react';
import { getStatusColor, getStatusText, getPaymentStatusColor, getPaymentStatusText } from '../utils/appointmentUtils';
import { getOrderStatusInfo, calculateOrderTotal } from '../utils/orderUtils';
import { formatDate } from '../utils/appointmentUtils';
import { isPaymentRequired, getPaymentStatusInfo } from '../utils/paymentUtils';
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../meta/menu';

const StatusPage = () => {
  const { restClient } = useRestClient();
  const { userId, clearFormData } = useGlobalData();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');

  // Clear any lingering cart data when viewing status page
  useEffect(() => {
    clearFormData();
  }, [clearFormData]);

  useEffect(() => {
    if (userId && restClient) {
      fetchData();
    }
  }, [userId, restClient]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await restClient.get('/appointments', { userId })
      if (appointmentsResponse?.data?.appointments) {
        setAppointments(appointmentsResponse.data.appointments);
      }

      // Fetch orders
      const ordersResponse = await restClient.get('/orders', { userId });
      if (ordersResponse?.data?.orders) {
        setOrders(ordersResponse.data.orders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchTerm.toLowerCase();
    const service = getServiceById(appointment.serviceId);
    const plan = getPlanById(appointment.serviceId, appointment.planId);
    
    return (
      // Personal information
      appointment.buyerName?.toLowerCase().includes(searchLower) ||
      appointment.buyerEmail?.toLowerCase().includes(searchLower) ||
      appointment.sellerName?.toLowerCase().includes(searchLower) ||
      appointment.sellerEmail?.toLowerCase().includes(searchLower) ||
      appointment.customerName?.toLowerCase().includes(searchLower) ||
      appointment.customerEmail?.toLowerCase().includes(searchLower) ||
      
      // Service and plan information
      service?.name?.toLowerCase().includes(searchLower) ||
      plan?.name?.toLowerCase().includes(searchLower) ||
      
      // Car information
      appointment.carMake?.toLowerCase().includes(searchLower) ||
      appointment.carModel?.toLowerCase().includes(searchLower) ||
      appointment.carYear?.toString().includes(searchLower) ||
      
      // Status information
      appointment.status?.toLowerCase().includes(searchLower) ||
      appointment.paymentStatus?.toLowerCase().includes(searchLower) ||
      getStatusText(appointment.status)?.toLowerCase().includes(searchLower) ||
      getPaymentStatusText(appointment.paymentStatus)?.toLowerCase().includes(searchLower) ||
      
      // Appointment ID
      appointment.appointmentId?.toLowerCase().includes(searchLower)
    );
  });

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get category and item information for all items in the order
    const itemMatches = order.items?.some(item => {
      const category = getCategoryById(item.categoryId);
      const itemData = getItemById(item.categoryId, item.itemId);
      
      return (
        category?.name?.toLowerCase().includes(searchLower) ||
        itemData?.name?.toLowerCase().includes(searchLower)
      );
    }) || false;
    
    return (
      // Personal information
      order.customerName?.toLowerCase().includes(searchLower) ||
      order.customerEmail?.toLowerCase().includes(searchLower) ||
      order.buyerName?.toLowerCase().includes(searchLower) ||
      order.buyerEmail?.toLowerCase().includes(searchLower) ||
      
      // Car information
      order.carMake?.toLowerCase().includes(searchLower) ||
      order.carModel?.toLowerCase().includes(searchLower) ||
      order.carYear?.toString().includes(searchLower) ||
      
      // Order information
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.status?.toLowerCase().includes(searchLower) ||
      getOrderStatusInfo(order.status)?.text?.toLowerCase().includes(searchLower) ||
      
      // Item matches
      itemMatches
    );
  });

  const AppointmentCard = ({ appointment }) => {
    const service = getServiceById(appointment.serviceId);
    const plan = getPlanById(appointment.serviceId, appointment.planId);

    const handleCardClick = (e) => {
      // Don't navigate if clicking on payment button
      if (e.target.closest('.payment-button')) {
        return;
      }
      navigate(`/appointment/${appointment.appointmentId}`);
    };

    const handlePayNowClick = (e) => {
      e.stopPropagation();
      navigate(`/payment/appointment/${appointment.appointmentId}`);
    };

    const needsPayment = isPaymentRequired(appointment.paymentStatus);
    
    return (
      <Card 
        className="bg-card-primary border border-border-primary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                {service?.name || 'Service'}
              </CardTitle>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={`${getStatusColor(appointment.status)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                  {getStatusText(appointment.status)}
                </Badge>
                {appointment.status?.toLowerCase() !== 'pending' && appointment.status?.toLowerCase() !== 'cancelled' && (
                  <Badge className={`${getPaymentStatusColor(appointment.paymentStatus)} text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1`}>
                    <CreditCard className="w-3 h-3" />
                    <span>{getPaymentStatusText(appointment.paymentStatus)}</span>
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Plan section with enhanced styling */}
            <div className="flex items-center space-x-2 bg-background-secondary/50 rounded-lg px-3 py-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary">{plan?.name || 'Plan'}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Appointment details grid */}
          <div className="space-y-3">
            {appointment.scheduledDate && (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-text-secondary font-medium">
                  {formatDate(appointment.scheduledDate)}
                </span>
              </div>
            )}
            
            {appointment.scheduledTimeSlot && (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-text-secondary font-medium">
                  {appointment.scheduledTimeSlot?.start} - {appointment.scheduledTimeSlot?.end}
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
              <Car className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-text-secondary font-medium">
                {appointment.carMake} {appointment.carModel} ({appointment.carYear})
              </span>
            </div>
          </div>
          
          {/* Price section with enhanced styling */}
          <div className="border-t border-border-secondary pt-3 mt-4">
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-secondary">Total Price</span>
              </div>
              <span className="text-lg font-bold text-primary">
                ${plan?.price || 0}
              </span>
            </div>
            
            {/* Payment Button */}
            {needsPayment && appointment.status?.toLowerCase() !== 'cancelled' && (
              <div className="mt-3">
                {appointment.status?.toLowerCase() !== 'pending' ? (
                  <Button
                    onClick={handlePayNowClick}
                    className="payment-button w-full animated-button-primary text-sm py-2"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now - ${plan?.price || 0}
                  </Button>
                ) : (
                  <div className="text-center p-2 bg-background-secondary/30 rounded-lg text-sm text-text-secondary">
                    Payment will be available after appointment is confirmed
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrderCard = ({ order }) => {
    const statusInfo = getOrderStatusInfo(order.status);
    
    const handleCardClick = (e) => {
      // Don't navigate if clicking on payment button
      if (e.target.closest('.payment-button')) {
        return;
      }
      navigate(`/order/${order.orderId}`);
    };

    const handlePayNowClick = (e) => {
      e.stopPropagation();
      navigate(`/payment/order/${order.orderId}`);
    };

    const needsPayment = isPaymentRequired(order.paymentStatus);
    
    // Get category and item names for the first item (assuming single item orders for now)
    const firstItem = order.items?.[0];
    let categoryName = 'Category';
    let itemName = 'Item';
    
    if (firstItem) {
      const category = getCategoryById(firstItem.categoryId);
      const item = getItemById(firstItem.categoryId, firstItem.itemId);
      if (category) {
        categoryName = category.name;
      }
      if (item) {
        itemName = item.name;
      }
    }
    
    return (
      <Card 
        className="bg-card-primary border border-border-primary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                {categoryName}
              </CardTitle>
              <div className="flex flex-col items-end space-y-2">
                <Badge className={`${statusInfo.bg} ${statusInfo.color} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                  {statusInfo.text}
                </Badge>
                {/* Payment Status Badge */}
                {order.paymentStatus && (
                  <Badge className={`${getPaymentStatusInfo(order.paymentStatus).bg} text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1`}>
                    <CreditCard className="w-3 h-3" />
                    <span>{getPaymentStatusInfo(order.paymentStatus).text}</span>
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Item section with enhanced styling */}
            <div className="flex items-center space-x-2 bg-background-secondary/50 rounded-lg px-3 py-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary">{itemName}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Order details grid */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
              <Package className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-text-secondary font-medium">
                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            
            {order.scheduledDate && (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-text-secondary font-medium">
                  {formatDate(order.scheduledDate)}
                </span>
              </div>
            )}
            
            {order.scheduledTimeSlot && (
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm text-text-secondary font-medium">
                  {order.scheduledTimeSlot?.start} - {order.scheduledTimeSlot?.end}
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-background-secondary/30">
              <Car className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-text-secondary font-medium">
                {order.carMake} {order.carModel} ({order.carYear})
              </span>
            </div>
          </div>
          
          {/* Price section with enhanced styling */}
          <div className="border-t border-border-secondary pt-3 mt-4">
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-secondary">Total Price</span>
              </div>
              <span className="text-lg font-bold text-primary">
                ${(order.totalPrice || 0).toFixed(2)}
              </span>
            </div>
            
            {/* Payment Button */}
            {needsPayment && order.status?.toLowerCase() !== 'cancelled' && (
              <div className="mt-3">
                {order.status?.toLowerCase() !== 'pending' ? (
                  <Button
                    onClick={handlePayNowClick}
                    className="payment-button w-full animated-button-primary text-sm py-2"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now - ${(order.totalPrice || 0).toFixed(2)}
                  </Button>
                ) : (
                  <div className="text-center p-2 bg-background-secondary/30 rounded-lg text-sm text-text-secondary">
                    Payment will be available after order is confirmed
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
              Check Status
            </FadeInItem>
            <FadeInItem element="p" direction="y" className="text-xl text-text-secondary">
              Track your appointments and orders
            </FadeInItem>
          </div>

          {/* Search */}
          <Card className="bg-card-primary border border-border-primary mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search by name, email, service, car, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background-secondary border-border-secondary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-card-primary border border-border-primary rounded-xl p-2 inline-flex shadow-md relative overflow-hidden w-full max-w-md">
              {/* Active Tab Indicator - Animated Background */}
              <div 
                className={`absolute top-2 bottom-2 rounded-lg transition-all duration-300 ease-in-out bg-highlight-primary ${
                  activeTab === 'appointments' ? 'left-2 right-[calc(50%+2px)]' : 'left-[calc(50%+2px)] right-2'
                }`}
                style={{ zIndex: 0 }}
              ></div>
              
              {/* Appointments Tab */}
              <Button
                onClick={() => setActiveTab('appointments')}
                className={`relative z-10 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2 rounded-lg border-0 shadow-none transition-colors duration-300 w-1/2 ${
                  activeTab === 'appointments' 
                    ? 'text-white font-semibold' 
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                <Calendar className={`w-4 h-4 flex-shrink-0 ${activeTab === 'appointments' ? 'text-white' : 'text-text-secondary'}`} />
                <span className="whitespace-nowrap text-xs xs:text-sm">Appointments ({filteredAppointments.length})</span>
              </Button>
              
              {/* Orders Tab */}
              <Button
                onClick={() => setActiveTab('orders')}
                className={`relative z-10 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-3 sm:px-4 py-2 rounded-lg border-0 shadow-none transition-colors duration-300 w-1/2 ${
                  activeTab === 'orders' 
                    ? 'text-white font-semibold' 
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                <Package className={`w-4 h-4 flex-shrink-0 ${activeTab === 'orders' ? 'text-white' : 'text-text-secondary'}`} />
                <span className="whitespace-nowrap text-xs xs:text-sm">Orders ({filteredOrders.length})</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'appointments' ? (
            loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <Card className="bg-card-primary border border-border-primary">
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No appointments found</h3>
                  <p className="text-text-secondary mb-6">
                    {searchTerm ? 'No appointments match your search.' : 'You have no appointments yet.'}
                  </p>
                  <Button onClick={() => navigate('/pricing/pre-purchase-inspection')}>
                    Book Inspection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
                ))}
              </div>
            )
          ) : (
            loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-card-primary border border-border-primary">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                  <p className="text-text-secondary mb-6">
                    {searchTerm ? 'No orders match your search.' : 'You have no orders yet.'}
                  </p>
                  <Button onClick={() => navigate('/pricing/accessories')}>
                    Order Accessories
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            )
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default StatusPage;
