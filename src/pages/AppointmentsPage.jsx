
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
import { Search, Clock, CheckCircle, XCircle, X, Calendar, Car, Eye } from 'lucide-react';
import { getServiceById, getPlanById } from '../meta/menu';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [userAppointments, setUserAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user's appointments on component mount
  useEffect(() => {
    if (userId && restClient) {
      loadUserAppointments();
    }
  }, [userId, restClient]);

  const loadUserAppointments = async () => {
    if (!userId || !restClient) return;

    try {
      setLoading(true);
      const response = await restClient.get('appointments', { userId });
      
      if (response.data && response.data.success) {
        const appointments = response.data.appointments || [];
        setUserAppointments(appointments);
        setFilteredAppointments(appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
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

      // Search in user's appointments for the reference number
      const filtered = userAppointments.filter(apt => 
        apt.appointmentId && 
        apt.appointmentId.toLowerCase().includes(referenceNumber.trim().toLowerCase())
      );

      if (filtered.length > 0) {
        setFilteredAppointments(filtered);
      } else {
        // If not found in loaded appointments, try fetching from backend
        try {
          const response = await restClient.get(`appointments/${referenceNumber.trim()}`, { 
            userId: userId || 'guest' 
          });

          if (response.data && response.data.success && response.data.appointment) {
            setFilteredAppointments([response.data.appointment]);
          } else {
            setFilteredAppointments([]);
            setError('Appointment not found. Please check your reference number.');
          }
        } catch (fetchError) {
          setFilteredAppointments([]);
          if (fetchError.response?.status === 404) {
            setError('Appointment not found. Please check your reference number.');
          } else if (fetchError.response?.status === 403) {
            setError('You are not authorized to view this appointment.');
          } else {
            setError('Unable to fetch appointment details. Please try again.');
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
    setFilteredAppointments(userAppointments);
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/appointment/${appointmentId}`);
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Confirmed',
          color: 'text-green-500',
          bg: 'bg-green-500/10 border border-green-500/20'
        };
      case 'pending':
      case 'created':
        return {
          icon: <Clock className="w-5 h-5" />,
          text: 'Pending',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10 border border-yellow-500/20'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-5 h-5" />,
          text: 'Cancelled',
          color: 'text-red-500',
          bg: 'bg-red-500/10 border border-red-500/20'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Completed',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10 border border-blue-500/20'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          text: status || 'Unknown',
          color: 'text-gray-500',
          bg: 'bg-gray-500/10 border border-gray-500/20'
        };
    }
  };

  const formatAppointmentData = (aptData) => {
    const service = getServiceById(aptData.serviceId);
    const plan = getPlanById(aptData.serviceId, aptData.planId);
    
    return {
      referenceNumber: aptData.appointmentId,
      status: aptData.status || 'pending',
      service: service?.name || 'Unknown Service',
      plan: plan?.name || 'Unknown Plan',
      vehicle: {
        make: aptData.carData?.make || 'N/A',
        model: aptData.carData?.model || 'N/A',
        year: aptData.carData?.year || 'N/A',
        location: aptData.carData?.location || 'Not specified'
      },
      selectedSlots: aptData.selectedSlots || [],
      contact: {
        buyerName: aptData.buyerData?.name || aptData.sellerData?.name || 'N/A',
        buyerEmail: aptData.buyerData?.email || aptData.sellerData?.email || 'N/A',
        buyerPhone: aptData.buyerData?.phoneNumber || aptData.sellerData?.phoneNumber || 'N/A'
      },
      notes: aptData.notes || '',
      createdAt: aptData.createdDate || aptData.createdAt || new Date().toISOString().split('T')[0],
      totalCost: aptData.price ? `$${aptData.price}` : 'TBD'
    };
  };

  const isSearchActive = referenceNumber.trim() !== '';

  return (
    <PageContainer>
      <div className="font-sans min-h-screen bg-background-primary">
        {/* Hero Section */}
        <section className="bg-background-tertiary text-text-primary py-20 px-6 text-center">
          <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4 mt-8">
            Your Appointments
          </FadeInItem>
          <FadeInItem
            element="p"
            direction="y"
            className="text-xl max-w-2xl mx-auto text-text-secondary"
          >
            View all your appointments or search for a specific one using the reference number.
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
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Search Appointments</h2>
                    <p className="text-text-secondary">Enter a reference number to search for a specific appointment</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Enter reference number (e.g., ALS-2025-001)"
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

        {/* Appointments List */}
        {filteredAppointments.length > 0 && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <FadeInItem element="div" direction="y">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-text-primary mb-2">
                    {isSearchActive ? 'Search Results' : 'All Appointments'}
                  </h2>
                  <p className="text-text-secondary">
                    {isSearchActive 
                      ? `Found ${filteredAppointments.length} appointment(s) matching your search`
                      : `Showing ${filteredAppointments.length} appointment(s)`
                    }
                  </p>
                </div>
              </FadeInItem>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((apt, index) => {
                  const formattedApt = formatAppointmentData(apt);
                  const statusInfo = getStatusInfo(formattedApt.status);
                  
                  return (
                    <FadeInItem key={apt.appointmentId || index} element="div" direction="y" delay={index * 0.1}>
                      <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105">
                        <CardContent className="p-6">
                          {/* Header with status */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-text-secondary">
                              Ref: {formattedApt.referenceNumber}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusInfo.bg}`}>
                              <span className={statusInfo.color}>
                                {statusInfo.icon}
                              </span>
                              <span className={`font-semibold ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>

                          {/* Service info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-text-primary mb-1">{formattedApt.service}</h3>
                            <p className="text-text-secondary text-sm">{formattedApt.plan}</p>
                          </div>

                          {/* Vehicle info */}
                          <div className="mb-4 p-3 bg-background-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Car className="w-4 h-4 text-highlight-primary" />
                              <span className="text-sm font-medium text-text-primary">Vehicle</span>
                            </div>
                            <p className="text-sm text-text-secondary">
                              {formattedApt.vehicle.make} {formattedApt.vehicle.model} ({formattedApt.vehicle.year})
                            </p>
                          </div>

                          {/* Slots info */}
                          {formattedApt.selectedSlots.length > 0 && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-highlight-primary" />
                                <span className="text-sm font-medium text-text-primary">Schedule</span>
                              </div>
                              {formattedApt.selectedSlots.slice(0, 2).map((slot, idx) => (
                                <p key={idx} className="text-sm text-text-secondary">
                                  {slot.date} - {slot.start} to {slot.end}
                                </p>
                              ))}
                              {formattedApt.selectedSlots.length > 2 && (
                                <p className="text-xs text-text-secondary">
                                  +{formattedApt.selectedSlots.length - 2} more slots
                                </p>
                              )}
                            </div>
                          )}

                          {/* Cost */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-text-secondary text-sm">Total Cost</span>
                            <span className="text-highlight-primary font-semibold">{formattedApt.totalCost}</span>
                          </div>

                          {/* View details button */}
                          <Button
                            onClick={() => handleAppointmentClick(formattedApt.referenceNumber)}
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

        {/* No appointments message */}
        {!loading && filteredAppointments.length === 0 && userAppointments.length === 0 && !isSearchActive && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <FadeInItem element="div" direction="y">
                <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
                  <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Appointments Found</h3>
                  <p className="text-text-secondary mb-6">You haven't created any appointments yet.</p>
                  <Button
                    onClick={() => navigate('/booking')}
                    className="animated-button-primary"
                  >
                    Book Your First Appointment
                  </Button>
                </div>
              </FadeInItem>
            </div>
          </section>
        )}

        {/* Search no results message */}
        {!loading && filteredAppointments.length === 0 && isSearchActive && (
          <section className="bg-background-secondary py-16 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <FadeInItem element="div" direction="y">
                <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
                  <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No Results Found</h3>
                  <p className="text-text-secondary mb-6">
                    No appointments found matching "{referenceNumber}". Please check your reference number or clear the search to view all appointments.
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
                      onClick={() => navigate('/booking')}
                      className="animated-button-primary"
                    >
                      Book New Appointment
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

export default AppointmentsPage;
