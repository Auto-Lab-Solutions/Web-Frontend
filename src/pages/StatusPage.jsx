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
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../meta/menu';

const StatusPage = () => {
  const { restClient } = useRestClient();
  const { userId } = useGlobalData();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');

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

  const filteredAppointments = appointments.filter(appointment =>
    appointment.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.sellerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AppointmentCard = ({ appointment }) => {
    const service = getServiceById(appointment.serviceId);
    const plan = getPlanById(appointment.serviceId, appointment.planId);

    const handleCardClick = () => {
      navigate(`/appointment/${appointment.appointmentId}`);
    };
    
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
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrderCard = ({ order }) => {
    const statusInfo = getOrderStatusInfo(order.status);
    
    const handleCardClick = () => {
      navigate(`/order/${order.orderId}`);
    };
    
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
        className="bg-card-primary border border-border-primary hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-text-primary">
              {categoryName}
            </CardTitle>
            <div className="text-sm text-text-secondary">
              {itemName}
            </div>
            <Badge className={`${statusInfo.bg} ${statusInfo.color} w-fit`}>
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary">
                {order.items?.length || 0} item(s)
              </span>
            </div>
            {order.scheduledDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <span className="text-text-secondary">
                  {formatDate(order.scheduledDate)}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary">
                {order.carMake} {order.carModel} {order.carYear}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary font-semibold">
                Total: ${(order.totalPrice || 0).toFixed(2)}
              </span>
            </div>
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
              Track your appointments and orders in one place
            </FadeInItem>
          </div>

          {/* Search */}
          <Card className="bg-card-primary border border-border-primary mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background-secondary border-border-secondary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-8">
            <div className="bg-card-primary border border-border-primary rounded-lg p-1 inline-flex">
              <Button
                variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('appointments')}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Appointments ({filteredAppointments.length})</span>
              </Button>
              <Button
                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('orders')}
                className="flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Orders ({filteredOrders.length})</span>
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
