import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle, Phone, Mail, Car, Calendar } from 'lucide-react';
import { companyLocalPhone, companyEmail } from '../meta/companyData';
import { getServiceById, getPlanById } from '../meta/menu';

const AppointmentPage = () => {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  const { userId } = useGlobalData();
  const { restClient } = useRestClient();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const formattedAppointment = formatAppointmentData(response.data.appointment);
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
              <Button
                onClick={() => navigate('/appointments')}
                className="animated-button-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Appointments
              </Button>
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
        <section className="bg-background-tertiary text-text-primary py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <FadeInItem element="div" direction="y" className="mb-6">
              <Button
                onClick={() => navigate('/appointments')}
                variant="outline"
                className="mb-4 border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Appointments
              </Button>
            </FadeInItem>
            
            <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-4">
              Appointment Details
            </FadeInItem>
            <FadeInItem
              element="p"
              direction="y"
              className="text-xl text-text-secondary"
            >
              Reference: {appointment.referenceNumber}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">Appointment Status</h3>
                      <p className="text-text-secondary text-sm">Last updated: {appointment.createdAt}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusInfo(appointment.status).bg}`}>
                      <span className={getStatusInfo(appointment.status).color}>
                        {getStatusInfo(appointment.status).icon}
                      </span>
                      <span className={`font-semibold ${getStatusInfo(appointment.status).color}`}>
                        {getStatusInfo(appointment.status).text}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

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

            {/* Vehicle & Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Vehicle Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Make:</span>
                        <span className="text-text-primary font-semibold">{appointment.vehicle.make}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Model:</span>
                        <span className="text-text-primary font-semibold">{appointment.vehicle.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Year:</span>
                        <span className="text-text-primary font-semibold">{appointment.vehicle.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Location:</span>
                        <span className="text-text-primary font-semibold">{appointment.vehicle.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeInItem>

              <FadeInItem element="div" direction="x">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm h-full">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Schedule</h3>
                    <div className="space-y-3">
                      {appointment.selectedSlots && appointment.selectedSlots.length > 0 ? (
                        appointment.selectedSlots.map((slot, index) => (
                          <div key={index} className="p-3 bg-background-secondary/50 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-text-secondary">Slot {index + 1}:</span>
                              <span className="text-highlight-primary font-semibold">Priority #{index + 1}</span>
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
                  </CardContent>
                </Card>
              </FadeInItem>
            </div>

            {/* Contact Information */}
            <FadeInItem element="div" direction="y">
              <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Contact Name</p>
                      <p className="text-text-primary font-semibold">{appointment.contact.buyerName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Email</p>
                      <p className="text-text-primary font-semibold">{appointment.contact.buyerEmail}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-text-secondary text-sm">Phone</p>
                      <p className="text-text-primary font-semibold">{appointment.contact.buyerPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInItem>

            {/* Notes */}
            {appointment.notes && (
              <FadeInItem element="div" direction="y">
                <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-primary mb-4">Additional Notes</h3>
                    <p className="text-text-primary leading-relaxed bg-card-secondary/50 rounded-lg p-4 border border-border-secondary">
                      {appointment.notes}
                    </p>
                  </CardContent>
                </Card>
              </FadeInItem>
            )}
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="bg-background-primary py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <FadeInItem element="h2" direction="y" className="text-2xl font-bold text-text-primary mb-4">
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
      </div>
    </PageContainer>
  );
};

export default AppointmentPage;
