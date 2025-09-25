import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestClient } from '../components/contexts/RestContext';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Search, Calendar, CalendarPlus, Package, Clock, Car, Settings, Banknote, CreditCard, AlertTriangle, X } from 'lucide-react';
import { getAppointmentStatusInfo } from '../utils/appointmentUtils';
import { getOrderStatusInfo, calculateOrderTotal } from '../utils/orderUtils';
import { formatDate, checkTimeslotAvailability } from '../utils/appointmentUtils';
import { isPaymentRequired, getPaymentStatusInfo } from '../utils/paymentUtils';
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../meta/menu';
import PageContainer from '../components/common/PageContainer';
import PendingStatusMessage from '../components/common/PendingStatusMessage';

const StatusPage = () => {
  const { restClient } = useRestClient();
  const { userId, clearFormData } = useGlobalData();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  // Orders functionality temporarily hidden
  // const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Always show appointments tab since orders are hidden
  // const [activeTab, setActiveTab] = useState('appointments');

  // Clear any lingering cart data when viewing status page
  useEffect(() => {
    clearFormData();
  }, []); // Remove clearFormData from dependencies to prevent infinite loop

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

      // Orders functionality temporarily disabled
      // const ordersResponse = await restClient.get('/orders', { userId });
      // if (ordersResponse?.data?.orders) {
      //   setOrders(ordersResponse.data.orders);
      // }
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
      getAppointmentStatusInfo(appointment.status)?.text?.toLowerCase().includes(searchLower) ||
      getPaymentStatusInfo(appointment.paymentStatus)?.text?.toLowerCase().includes(searchLower) ||
      
      // Appointment ID
      appointment.appointmentId?.toLowerCase().includes(searchLower)
    );
  });

  // Orders filtering temporarily disabled
  // const filteredOrders = orders.filter(order => {
  //   const searchLower = searchTerm.toLowerCase();
  //   
  //   // Get category and item information for all items in the order
  //   const itemMatches = order.items?.some(item => {
  //     const category = getCategoryById(item.categoryId);
  //     const itemData = getItemById(item.categoryId, item.itemId);
  //     
  //     return (
  //       category?.name?.toLowerCase().includes(searchLower) ||
  //       itemData?.name?.toLowerCase().includes(searchLower)
  //     );
  //   }) || false;
  //   
  //   return (
  //     // Personal information
  //     order.customerName?.toLowerCase().includes(searchLower) ||
  //     order.customerEmail?.toLowerCase().includes(searchLower) ||
  //     order.buyerName?.toLowerCase().includes(searchLower) ||
  //     order.buyerEmail?.toLowerCase().includes(searchLower) ||
  //     
  //     // Car information
  //     order.carMake?.toLowerCase().includes(searchLower) ||
  //     order.carModel?.toLowerCase().includes(searchLower) ||
  //     order.carYear?.toString().includes(searchLower) ||
  //     
  //     // Order information
  //     order.orderId?.toLowerCase().includes(searchLower) ||
  //     order.status?.toLowerCase().includes(searchLower) ||
  //     getOrderStatusInfo(order.status)?.text?.toLowerCase().includes(searchLower) ||
  //     
  //     // Item matches
  //     itemMatches
  //   );
  // });

  const AppointmentCard = ({ appointment }) => {
    const service = getServiceById(appointment.serviceId);
    const plan = getPlanById(appointment.serviceId, appointment.planId);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCardClick = (e) => {
      console.log('Card clicked:', appointment.appointmentId);
      // Use navigate instead of direct location change
      navigate(`/appointment/${appointment.appointmentId}`);
    };

    const handlePayNowClick = async (e) => {
      e.stopPropagation();
      setErrorMessage(''); // Clear any previous errors
      console.log('🔵 Pay Now clicked for appointment:', appointment.appointmentId);
      console.log('🔵 Full appointment object:', appointment);
      console.log('🔵 Appointment status:', appointment.status);
      console.log('🔵 Appointment slots (direct):', appointment.slots);
      console.log('🔵 Appointment selectedSlots:', appointment.selectedSlots);
      console.log('🔵 Appointment timeSlots:', appointment.timeSlots);
      console.log('🔵 Appointment scheduledDate:', appointment.scheduledDate);
      console.log('🔵 Appointment scheduledTimeSlot:', appointment.scheduledTimeSlot);
      
      // Only check timeslot availability for pending appointments
      if (appointment.status?.toLowerCase() === 'pending') {
        console.log('🟡 Appointment is pending, checking for slots data');
        
        // Look for slots in different possible properties
        let slotsToCheck = appointment.slots || appointment.selectedSlots || appointment.timeSlots;
        
        if (!slotsToCheck && appointment.scheduledTimeSlot) {
          // If we have scheduledTimeSlot, convert it to the expected format
          slotsToCheck = [{
            date: appointment.scheduledDate,
            start: appointment.scheduledTimeSlot.start,
            end: appointment.scheduledTimeSlot.end,
            priority: 1
          }];
        }
        
        console.log('🟡 Slots to check:', slotsToCheck);
        
        if (slotsToCheck && slotsToCheck.length > 0) {
          console.log('🟡 Starting timeslot availability check for pending appointment');
          setIsCheckingAvailability(true);
          
          try {
            // Get the highest priority slot (priority 1)
            const highestPrioritySlot = slotsToCheck.find(slot => slot.priority === 1) || slotsToCheck[0];
            console.log('🟡 Highest priority slot found:', highestPrioritySlot);
            
            if (highestPrioritySlot) {
              const timeslotString = `${highestPrioritySlot.start}-${highestPrioritySlot.end}`;
              console.log('🟡 Checking availability for:', {
                date: highestPrioritySlot.date,
                timeslot: timeslotString
              });
              
              // Check timeslot availability
              const availabilityResult = await checkTimeslotAvailability(
                restClient, 
                highestPrioritySlot.date, 
                timeslotString
              );
              
              console.log('🟡 Availability result:', availabilityResult);
              
              if (availabilityResult.error) {
                console.log('🔴 Error in availability check:', availabilityResult.error);
                setErrorMessage(`Error checking timeslot availability: ${availabilityResult.error}`);
                return;
              }
              
              if (!availabilityResult.isAvailable) {
                console.log('🔴 Timeslot not available, showing alert');
                setErrorMessage('Sorry, your most preferred timeslot is not available now. Please contact us to get your preferred timeslot updated.');
                return;
              }
              
              console.log('🟢 Timeslot is available, proceeding to payment');
            }
          } catch (error) {
            console.error('🔴 Error checking timeslot availability:', error);
            setErrorMessage('Unable to verify timeslot availability. Please try again or contact us.');
            return;
          } finally {
            setIsCheckingAvailability(false);
          }
        } else {
          console.log('🔵 Skipping availability check - no slots found in appointment data');
        }
      } else {
        console.log('🔵 Skipping availability check - not pending status');
      }
      
      // If timeslot is available or no check needed, proceed to payment
      console.log('🟢 Navigating to payment page');
      navigate(`/payment/appointment/${appointment.appointmentId}`);
    };

    const needsPayment = isPaymentRequired(appointment.paymentStatus);
    
    return (
      <Card 
        className="bg-card-primary border border-border-primary hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group overflow-hidden gap-2"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="space-y-3 pb-3 border-b border-border-secondary">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <CardTitle className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                {service?.name || 'Service'}
              </CardTitle>
              <div className="flex flex-col items-start sm:items-end space-y-2">
                <Badge className={`${getAppointmentStatusInfo(appointment.status).bg} ${getAppointmentStatusInfo(appointment.status).textColor} text-xs px-2 py-1 rounded-full font-medium`}>
                  {getAppointmentStatusInfo(appointment.status).text}
                </Badge>
                {appointment.status?.toLowerCase() !== 'cancelled' && (
                  <Badge className={`${getPaymentStatusInfo(appointment.paymentStatus).bg} ${getPaymentStatusInfo(appointment.paymentStatus).textColor} text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1`}>
                    <CreditCard className="w-5 h-5 text-black" />
                    <span>{getPaymentStatusInfo(appointment.paymentStatus).text}</span>
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
        
        <CardContent className="space-y-3 pt-0">
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
          <div className="border-t border-border-secondary pt-3 mt-3">
            <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-primary" />
                <span className="text-sm text-text-secondary">Total Price</span>
              </div>
              <span className="text-lg font-bold text-primary">
                AUD {plan?.price || 0}
              </span>
            </div>
            
            {/* Payment Button */}
            {needsPayment && appointment.status?.toLowerCase() !== 'cancelled' && (
              <div className="mt-3">
                <Button
                  onClick={handlePayNowClick}
                  disabled={isCheckingAvailability}
                  className="payment-button w-full animated-button-primary text-sm py-2"
                  size="sm"
                >
                  {isCheckingAvailability ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Checking Availability...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now - AUD {plan?.price || 0}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3">
              <Alert className="border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400 text-sm">
                  <div className="flex justify-between items-start">
                    <span>{errorMessage}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setErrorMessage('');
                      }}
                      className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {/* Pending Status Information */}
          {appointment.status?.toLowerCase() === 'pending' && (
            <div className="mt-3 pt-3 border-t border-border-secondary">
              <PendingStatusMessage variant="compact" totalAppointments={appointments.length} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // OrderCard component temporarily disabled since orders functionality is hidden
  // const OrderCard = ({ order }) => {
  //   const statusInfo = getOrderStatusInfo(order.status);
  //   ... (entire component commented out)
  // };

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Check Status
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Track your appointments and stay updated on their progress.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <Input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card-primary border-border-primary text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>

          {/* Content - Only showing appointments since orders are hidden */}
          {loading ? (
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
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/pricing/pre-purchase-inspection');
                  }}
                  className="animated-button-primary bg-highlight-primary hover:bg-highlight-primary/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Book an Inspection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default StatusPage;
