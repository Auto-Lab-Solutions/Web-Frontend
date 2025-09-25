import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Clock, CheckCircle, XCircle, Phone, Mail, Car, Calendar, CreditCard, User, FileText, UserCheck, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { companyLocalPhone, companyEmail } from '../meta/companyData';
import { getServiceById, getPlanById, isInspectionService } from '../meta/menu';
import { isPaymentRequired, getPaymentStatusInfo, formatPaymentMethod } from '../utils/paymentUtils';
import { checkTimeslotAvailability } from '../utils/appointmentUtils';
import { formatPerthDateTime, formatPerthRelativeTime, formatPerthDateToISO, getPerthCurrentDateTime } from '../utils/timezoneUtils';
import BackArrow from '../components/common/BackArrow';
import PendingStatusMessage from '../components/common/PendingStatusMessage';

const AppointmentPage = () => {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if current service is an inspection service
  const isInspection = appointment ? isInspectionService(getServiceById(appointment.service)?.id) : true;

  useEffect(() => {
    if (referenceNumber && restClient) {
      loadAppointmentDetails();
    }
  }, [referenceNumber, restClient]);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError('');

      if (!restClient) {
        throw new Error('Network connection not available');
      }

      // Fetch appointment details using GET with path param and query param
      const response = await restClient.get(`appointments/${referenceNumber}`, { 
        userId: userId || 'guest' 
      });

      if (response.data && response.data.success && response.data.appointment) {
        const formattedAppointment = formatAppointmentData(response.data.appointment, response.data.assignedMechanic);
        setAppointment(formattedAppointment);
      } else {
        setError('Appointment not found.');
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      if (error.response?.status === 404) {
        setError('Appointment not found. Please check your reference number.');
      } else if (error.response?.status === 403) {
        setError('You are not authorized to view this appointment.');
      } else {
        setError('Unable to fetch appointment details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayNowClick = async (e) => {
    e.stopPropagation();
    setErrorMessage(''); // Clear any previous errors
    console.log('🔵 Pay Now clicked for appointment (AppointmentPage):', appointment.referenceNumber);
    console.log('🔵 Full appointment object:', appointment);
    console.log('🔵 Appointment status:', appointment.status);
    console.log('🔵 Appointment selectedSlots:', appointment.selectedSlots);
    console.log('🔵 Appointment scheduledDate:', appointment.scheduledDate);
    console.log('🔵 Appointment scheduledTimeSlot:', appointment.scheduledTimeSlot);
    
    // Only check timeslot availability for pending appointments
    if (appointment.status?.toLowerCase() === 'pending') {
      console.log('🟡 Appointment is pending, checking for slots data');
      
      // Look for slots in different possible properties
      let slotsToCheck = appointment.selectedSlots;
      
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
    navigate(`/payment/appointment/${appointment.referenceNumber}`);
  };

  // Helper function to normalize timestamps from API
  const normalizeTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    // If it's already a Date object, return as is
    if (timestamp instanceof Date) return timestamp;
    
    // If it's a string that looks like a number (Unix timestamp)
    if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
      const numTimestamp = parseInt(timestamp, 10);
      // Use a higher threshold: 100000000000 (March 2973) to distinguish seconds vs milliseconds
      // Timestamps in seconds for current era will be < 100000000000
      // Timestamps in milliseconds for current era will be > 100000000000
      return new Date(numTimestamp < 100000000000 ? numTimestamp * 1000 : numTimestamp);
    }
    
    // If it's a number
    if (typeof timestamp === 'number') {
      return new Date(timestamp < 100000000000 ? timestamp * 1000 : timestamp);
    }
    
    // For ISO strings or other string formats, let Date constructor handle it
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    return null;
  };

  const formatAppointmentData = (aptData, assignedMechanic = null) => {
    const service = getServiceById(aptData.serviceId);
    const plan = getPlanById(aptData.serviceId, aptData.planId);
    
    return {
      referenceNumber: aptData.appointmentId,
      status: aptData.status || 'pending',
      paymentStatus: aptData.paymentStatus || 'pending',
      service: service?.name || 'Unknown Service',
      plan: plan?.name || 'Unknown Plan',
      vehicle: {
        make: aptData.carMake || 'N/A',
        model: aptData.carModel || 'N/A',
        year: aptData.carYear || 'N/A',
        location: aptData.carLocation || 'Not specified'
      },
      selectedSlots: aptData.selectedSlots || [],
      scheduledDate: aptData.scheduledDate || null,
      scheduledTimeSlot: aptData.scheduledTimeSlot || null,
      assignedMechanicId: aptData.assignedMechanicId || null,
      assignedMechanic: assignedMechanic || null,
      contact: {
        buyerName: aptData.buyerName ? aptData.buyerName : aptData.isBuyer ? 'N/A' : 'Not specified',
        buyerEmail: aptData.buyerEmail ? aptData.buyerEmail : aptData.isBuyer ? 'N/A' : 'Not specified',
        buyerPhone: aptData.buyerPhone ? aptData.buyerPhone : aptData.isBuyer ? 'N/A' : 'Not specified',
        sellerName: aptData.sellerName ? aptData.sellerName : !aptData.isBuyer ? 'N/A' : 'Not specified',
        sellerEmail: aptData.sellerEmail ? aptData.sellerEmail : !aptData.isBuyer ? 'N/A' : 'Not specified',
        sellerPhone: aptData.sellerPhone ? aptData.sellerPhone : !aptData.isBuyer ? 'N/A' : 'Not specified'
      },
      notes: aptData.notes || '',
      postNotes: aptData.postNotes || '',
      reports: aptData.reports || [],
      createdAt: normalizeTimestamp(aptData.createdAt || aptData.createdDate) || getPerthCurrentDateTime(),
      updatedAt: normalizeTimestamp(aptData.updatedAt),
      totalCost: aptData.price ? `$${aptData.price}` : 'TBD',
      // Enhanced payment-related fields
      paymentDetails: {
        paidAt: normalizeTimestamp(aptData.paidAt),
        paymentConfirmedAt: normalizeTimestamp(aptData.paymentConfirmedAt),
        paymentConfirmedBy: aptData.paymentConfirmedBy || null,
        paymentAmount: aptData.paymentAmount || aptData.price || null,
        paymentIntentId: aptData.paymentIntentId || null,
        paymentMethod: aptData.paymentMethod || null,
        invoiceUrl: aptData.invoiceUrl || null,
        updatedAt: normalizeTimestamp(aptData.updatedAt)
      }
    };
  };

  // Helper function to format timestamps
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
      console.error('formatTimestamp error:', error);
      return 'N/A';
    }
  };

  // Helper function to format dates in a user-friendly way using Perth timezone
  const formatUserFriendlyDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    try {
      // Use Perth timezone relative time formatting
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

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return {
          icon: <CheckCircle className="w-5 h-5 text-black" />,
          text: 'Confirmed',
          color: 'text-black',
          bg: 'bg-blue-500'
        };
      case 'pending':
      case 'created':
        return {
          icon: <Clock className="w-5 h-5 text-black" />,
          text: 'In Review',
          color: 'text-black',
          bg: 'bg-yellow-500'
        };
      case 'ongoing':
        return {
          icon: <Clock className="w-5 h-5 text-white" />,
          text: 'Ongoing',
          color: 'text-white',
          bg: 'bg-purple-500'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-5 h-5 text-black" />,
          text: 'Cancelled',
          color: 'text-black',
          bg: 'bg-red-500'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-black" />,
          text: 'Completed',
          color: 'text-black',
          bg: 'bg-green-500'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-black" />,
          text: status || 'Unknown',
          color: 'text-black',
          bg: 'bg-gray-500'
        };
    }
  };

  // Helper function to check if seller information exists
  const hasSellerInfo = (contact) => {
    return (
      contact.sellerName !== 'Not specified' &&
      contact.sellerEmail !== 'Not specified' &&
      contact.sellerPhone !== 'Not specified'
    );
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

  // Helper function to check if buyer information exists
  const hasBuyerInfo = (contact) => {
    return !isEmpty(contact.buyerName) || 
           !isEmpty(contact.buyerEmail) || 
           !isEmpty(contact.buyerPhone);
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
           !isEmpty(paymentDetails.paymentConfirmedAt) ||
           !isEmpty(paymentDetails.paymentMethod) ||
           !isEmpty(paymentDetails.paymentIntentId) ||
           !isEmpty(paymentDetails.invoiceUrl);
  };

  // Helper function to check if vehicle details have meaningful data
  const hasVehicleDetails = (vehicle) => {
    if (!vehicle) return false;
    return !isEmpty(vehicle.make) ||
           !isEmpty(vehicle.model) ||
           !isEmpty(vehicle.year) ||
           !isEmpty(vehicle.location);
  };

  // Helper function to check if scheduling information has meaningful data
  const hasSchedulingInfo = (appointment) => {
    return hasMechanicInfo(appointment.assignedMechanic) ||
           appointment.scheduledTimeSlot ||
           (appointment.selectedSlots && appointment.selectedSlots.length > 0);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="font-sans min-h-screen bg-background-primary flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-highlight-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading appointment details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="font-sans min-h-screen bg-background-primary">
          <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 mt-8">Appointment Not Found</h1>
              <p className="text-xl text-text-secondary mb-8">{error}</p>
            </div>
          </section>
        </div>
      </PageContainer>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <PageContainer>
      
      <div className="font-sans min-h-screen bg-background-primary">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary pt-15 pb-20 px-6">
          <BackArrow to={() => navigate('/status')} />
          <div className="max-w-4xl mx-auto text-center">    
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-6">
              Appointment Details
            </FadeInItem>
            <FadeInItem element="div" direction="y" className="inline-block">
              <div className="bg-card-primary border-2 border-highlight-primary rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm sm:max-w-none mx-auto">
                <div className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wide">
                  Reference Number
                </div>
                <div className="text-lg sm:text-xl font-bold text-highlight-primary font-mono tracking-wider break-all sm:break-normal">
                  {appointment.referenceNumber.toUpperCase()}
                </div>
              </div>
            </FadeInItem>
          </div>
        </section>

        {/* Appointment Details */}
        <section className="bg-background-secondary py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Card */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Appointment Status</h3>
                      <div className="flex items-center gap-6 flex-wrap text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatUserFriendlyDate(appointment.createdAt)}</span>
                        </div>
                        {!isEmpty(appointment.updatedAt) && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Clock className="w-4 h-4" />
                            <span>Updated {formatUserFriendlyDate(appointment.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusInfo(appointment.status).bg}`}>
                        <span>
                          {getStatusInfo(appointment.status).icon}
                        </span>
                        <span className={`font-semibold ${getStatusInfo(appointment.status).color}`}>
                          {getStatusInfo(appointment.status).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Pending Status Information */}
            {appointment.status?.toLowerCase() === 'pending' && (
              <FadeInItem element="div" direction="y">
                <PendingStatusMessage variant="full" />
              </FadeInItem>
            )}

            {/* Service Details */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Service Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Service Type</p>
                      <p className="text-text-primary font-semibold">{appointment.service}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Plan</p>
                      <p className="text-text-primary font-semibold">{appointment.plan}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Total Cost</p>
                      <p className="text-text-primary font-semibold text-highlight-primary text-lg">{appointment.totalCost}</p>
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
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getPaymentStatusInfo(appointment.paymentStatus).bg} self-start`}>
                      <CreditCard className="w-5 h-5 text-black" />
                      <span className={`font-semibold ${getPaymentStatusInfo(appointment.paymentStatus).textColor}`}>
                        {getPaymentStatusInfo(appointment.paymentStatus).text}
                      </span>
                    </div>
                  </div>
                  
                  {isPaymentRequired(appointment.paymentStatus) && appointment.status?.toLowerCase() !== 'cancelled' && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-text-primary font-medium mb-1">Payment Required</p>
                          <p className="text-text-secondary text-sm">
                            {appointment.status?.toLowerCase() === 'pending' ?
                              "Please complete your payment to reserve your most preferred time slot."
                              :
                              "You can complete your payment online or on-site."
                            }
                          </p>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Button
                            onClick={handlePayNowClick}
                            disabled={isCheckingAvailability}
                            className="payment-button animated-button-primary w-full sm:w-auto"
                          >
                            {isCheckingAvailability ? (
                              <>
                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Checking Availability...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="mt-4">
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-400">
                          <div className="flex justify-between items-start">
                            <span>{errorMessage}</span>
                            <button
                              onClick={() => setErrorMessage('')}
                              className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {!isPaymentRequired(appointment.paymentStatus) && (
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
                  {!isPaymentRequired(appointment.paymentStatus) && hasPaymentDetails(appointment.paymentDetails) && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-lg font-semibold text-text-primary">Payment Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {!isEmpty(appointment.paymentDetails.paymentAmount) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Payment Amount</p>
                            <p className="text-text-primary font-semibold">AUD {appointment.paymentDetails.paymentAmount}</p>
                          </div>
                        )}
                        {!isEmpty(appointment.paymentDetails.paymentConfirmedAt) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Payment Confirmed At</p>
                            <p className="text-text-primary font-semibold">{formatTimestamp(appointment.paymentDetails.paymentConfirmedAt)}</p>
                          </div>
                        )}
                        {!isEmpty(appointment.paymentDetails.paymentMethod) && (
                          <div className="space-y-1">
                            <p className="text-text-secondary text-sm">Payment Method</p>
                            <p className="text-text-primary font-semibold">{formatPaymentMethod(appointment.paymentDetails.paymentMethod)}</p>
                          </div>
                        )}
                        {!isEmpty(appointment.paymentDetails.paymentIntentId) && (
                          <div className="space-y-1 sm:col-span-2">
                            <p className="text-text-secondary text-sm">Transaction ID</p>
                            <p className="text-text-primary font-semibold font-mono text-xs break-all">{appointment.paymentDetails.paymentIntentId}</p>
                          </div>
                        )}
                      </div>
                      {!isEmpty(appointment.paymentDetails.invoiceUrl) && (
                        <div className="mt-3">
                          <a
                            href={appointment.paymentDetails.invoiceUrl}
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

            {/* Vehicle & Schedule */}
            {(hasVehicleDetails(appointment.vehicle) || hasSchedulingInfo(appointment)) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hasVehicleDetails(appointment.vehicle) && (
                  <FadeInItem element="div" direction="x">
                    <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Vehicle Details</h3>
                        <div className="space-y-3">
                          {!isEmpty(appointment.vehicle.make) && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Make:</span>
                              <span className="text-text-primary font-semibold">{appointment.vehicle.make}</span>
                            </div>
                          )}
                          {!isEmpty(appointment.vehicle.model) && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Model:</span>
                              <span className="text-text-primary font-semibold">{appointment.vehicle.model}</span>
                            </div>
                          )}
                          {!isEmpty(appointment.vehicle.year) && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Year:</span>
                              <span className="text-text-primary font-semibold">{appointment.vehicle.year}</span>
                            </div>
                          )}
                          {!isEmpty(appointment.vehicle.location) && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Location:</span>
                              <span className="text-text-primary font-semibold">{appointment.vehicle.location}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </FadeInItem>
                )}

                {hasSchedulingInfo(appointment) && (
                  <FadeInItem element="div" direction="x">
                    <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary mb-4">Scheduling Information</h3>
                    
                    {/* Assigned Mechanic */}
                    {hasMechanicInfo(appointment.assignedMechanic) && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                          <UserCheck className="w-4 h-4" /> Assigned Mechanic
                        </h4>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {!isEmpty(appointment.assignedMechanic.userName) && (
                              <div className="space-y-1">
                                <p className="text-text-secondary text-sm">Name</p>
                                <p className="text-blue-400 font-semibold break-words">{appointment.assignedMechanic.userName}</p>
                              </div>
                            )}
                            {!isEmpty(appointment.assignedMechanic.userEmail) && (
                              <div className="space-y-1">
                                <p className="text-text-secondary text-sm">Email</p>
                                <p className="text-blue-400 font-semibold break-all text-sm">{appointment.assignedMechanic.userEmail}</p>
                              </div>
                            )}
                            {!isEmpty(appointment.assignedMechanic.contactNumber) && (
                              <div className="space-y-1">
                                <p className="text-text-secondary text-sm">Contact</p>
                                <p className="text-blue-400 font-semibold break-words">{appointment.assignedMechanic.contactNumber}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirmed Schedule */}
                    {appointment.scheduledTimeSlot && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Scheduled Time Slot
                        </h4>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-semibold">
                                {appointment.scheduledTimeSlot.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg">
                              <Clock className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-semibold">
                                {appointment.scheduledTimeSlot.start} - {appointment.scheduledTimeSlot.end}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selected Time Slots */}
                    <div>
                      <h4 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> 
                        {appointment.scheduledTimeSlot ? 'Originally Requested Slots' : 'Selected Time Slots'}
                      </h4>
                      <div className="space-y-3">
                        {appointment.selectedSlots && appointment.selectedSlots.length > 0 ? (
                          appointment.selectedSlots.map((slot, index) => (
                            <div key={index} className="p-3 bg-background-secondary/50 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-text-secondary">Slot {index + 1}:</span>
                                <span className="text-highlight-primary font-semibold">Priority #{slot.priority || index + 1}</span>
                              </div>
                              <div className="mt-1">
                                <p className="text-text-primary font-semibold">{slot.date}</p>
                                <p className="text-text-secondary text-sm">{slot.start} - {slot.end}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-text-secondary">No schedule information available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>
                )}
              </div>
            )}

            {/* Contact Information */}
            {(hasBuyerInfo(appointment.contact) || hasSellerInfo(appointment.contact)) && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Contact Information</h3>
                    
                    {/* Customer/Buyer Information */}
                    {hasBuyerInfo(appointment.contact) && (
                      <div className={!hasSellerInfo(appointment.contact) ? "" : "mb-6"}>
                        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> {isInspection ? "Buyer Information" : "Customer Information"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {!isEmpty(appointment.contact.buyerName) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Name</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.buyerName}</p>
                            </div>
                          )}
                          {!isEmpty(appointment.contact.buyerEmail) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Email</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.buyerEmail}</p>
                            </div>
                          )}
                          {!isEmpty(appointment.contact.buyerPhone) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Phone</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.buyerPhone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Seller Information - Only show if at least one field has information and is inspection service */}
                    {isInspection && hasSellerInfo(appointment.contact) && (
                      <div>
                        <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                          <User className="w-4 h-4" /> Seller Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {!isEmpty(appointment.contact.sellerName) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Name</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.sellerName}</p>
                            </div>
                          )}
                          {!isEmpty(appointment.contact.sellerEmail) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Email</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.sellerEmail}</p>
                            </div>
                          )}
                          {!isEmpty(appointment.contact.sellerPhone) && (
                            <div className="space-y-2">
                              <p className="text-text-secondary text-sm">Phone</p>
                              <p className="text-text-primary font-semibold">{appointment.contact.sellerPhone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </FadeInItem>
            )}

            {/* Inspection Reports */}
            {appointment.reports && appointment.reports.filter(report => report.approved === true).length > 0 && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Inspection Reports
                    </h3>
                    <div className="space-y-4">
                      {appointment.reports
                        .filter(report => report.approved === true) // Only show approved reports
                        .map((report, index) => (
                        <div key={report.id || index} className="p-4 bg-background-secondary/50 rounded-lg border border-border-secondary">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-text-primary mb-2">{report.title || report.fileName}</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-text-secondary">File Size: </span>
                                  <span className="text-text-primary font-medium">
                                    {report.fileSize ? `${(report.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-text-secondary">Uploaded: </span>
                                  <span className="text-text-primary font-medium">
                                    {report.uploadedAt ? formatPerthDateTime(report.uploadedAt, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              {report.fileUrl && (
                                <a
                                  href={report.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                >
                                  <FileText className="w-4 h-4" />
                                  View Report
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}

            {/* Notes */}
            {(appointment.notes || appointment.postNotes) && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Notes</h3>
                    
                    {appointment.notes && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Pre-Inspection Notes
                        </h4>
                        <p className="text-text-primary leading-relaxed bg-card-secondary/50 rounded-lg p-4 border border-border-secondary">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                    
                    {appointment.postNotes && (
                      <div>
                        <h4 className="text-lg font-semibold text-text-primary mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Post-Inspection Notes
                        </h4>
                        <p className="text-text-primary leading-relaxed bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          {appointment.postNotes}
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
              Have questions about this appointment? Our team is here to help.
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
}; // End of AppointmentPage component function

export default AppointmentPage;
