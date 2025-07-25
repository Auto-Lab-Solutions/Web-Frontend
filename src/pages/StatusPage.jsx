import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Calendar, Package, Clock, MapPin, Phone, Mail, Car } from 'lucide-react';
import { getStatusColor, getStatusText } from '../utils/appointmentUtils';
import { getOrderStatusInfo, calculateOrderTotal } from '../utils/orderUtils';
import { formatDate } from '../utils/appointmentUtils';

const StatusPage = () => {
  const { restClient } = useRestClient();
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch appointments
      const appointmentsResponse = await restClient.get('/api/get-appointments');
      if (appointmentsResponse?.appointments) {
        setAppointments(appointmentsResponse.appointments);
      }

      // Fetch orders
      const ordersResponse = await restClient.get('/api/get-orders');
      if (ordersResponse?.orders) {
        setOrders(ordersResponse.orders);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.customerData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.customerData?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const AppointmentCard = ({ appointment }) => (
    <Card className="bg-card-primary border border-border-primary hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-text-primary">
            #{appointment.referenceNumber}
          </CardTitle>
          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary">
              {formatDate(appointment.appointmentDate)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary">{appointment.timeSlot}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary">
              {appointment.carData?.make} {appointment.carData?.model} ({appointment.carData?.year})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary">{appointment.carData?.location}</span>
          </div>
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary">{appointment.customerData?.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderCard = ({ order }) => {
    const statusInfo = getOrderStatusInfo(order.status);
    
    return (
      <Card className="bg-card-primary border border-border-primary hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-text-primary">
              #{order.referenceNumber}
            </CardTitle>
            <Badge className={`${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary">
                {order.items?.length || 0} item(s)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary">
                {order.scheduledDate ? formatDate(order.scheduledDate) : 'Not scheduled'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Car className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary">
                {order.carMake} {order.carModel} ({order.carYear})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-text-secondary font-semibold">
                Total: ${(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary">{order.customerName}</span>
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
                  placeholder="Search by reference number, name, or email..."
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
                  <Button onClick={() => window.location.href = '/pricing'}>
                    Book Inspection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.referenceNumber} appointment={appointment} />
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
                  <Button onClick={() => window.location.href = '/pricing/accessories'}>
                    Order Accessories
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.referenceNumber} order={order} />
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
