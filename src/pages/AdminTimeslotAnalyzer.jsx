import React, { useEffect, useState, useMemo } from 'react';
import { useRestClient } from '../components/contexts/RestContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { generateTimeSlots } from '../utils/appointmentUtils';
import { 
  checkSlotAvailability, 
  filterAvailableSlots, 
  getAvailabilityStats,
  getMechanicsCount 
} from '../utils/slotAvailabilityUtils';
import { 
  findOptimalSlotCombinations,
  getRecommendedSlots 
} from '../utils/slotRecommendationUtils';
import { 
  getPerthCurrentDateTime,
  formatPerthDateToISO,
  convertToPerthTime,
} from '../utils/timezoneUtils';
import PageContainer from '../components/common/PageContainer';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Clock, Users, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

// Duration options for admin selection (in minutes)
const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes', key: '30min' },
  { value: 60, label: '1 hour', key: '1hr' },
  { value: 90, label: '1.5 hours', key: '1.5hr' },
  { value: 120, label: '2 hours', key: '2hr' },
  { value: 150, label: '2.5 hours', key: '2.5hr' },
  { value: 180, label: '3 hours', key: '3hr' },
];

// Day options for quick selection
const DAY_OPTIONS = [
  { 
    key: 'today', 
    label: 'Today', 
    getDate: () => getPerthCurrentDateTime() 
  },
  { 
    key: 'tomorrow', 
    label: 'Tomorrow', 
    getDate: () => {
      const date = getPerthCurrentDateTime();
      date.setDate(date.getDate() + 1);
      return date;
    }
  },
  { 
    key: 'dayAfter', 
    label: 'Day After Tomorrow', 
    getDate: () => {
      const date = getPerthCurrentDateTime();
      date.setDate(date.getDate() + 2);
      return date;
    }
  }
];

function AdminTimeslotAnalyzer() {
  const { restClient } = useRestClient();
  
  // State for controls
  const [selectedDate, setSelectedDate] = useState(getPerthCurrentDateTime());
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 1 hour
  const [selectedDayKey, setSelectedDayKey] = useState('today');
  
  // State for data
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  
  // State for analysis results
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [optimizationStats, setOptimizationStats] = useState(null);
  const [availabilityStats, setAvailabilityStats] = useState(null);

  // Generate time slots based on selected duration
  const timeSlots = useMemo(() => {
    // Convert minutes to hours for generateTimeSlots function
    const durationInHours = selectedDuration / 60;
    return generateTimeSlots(durationInHours);
  }, [selectedDuration]);

  // Fetch data for the selected date
  const fetchSlotsForDate = async (date) => {
    if (!restClient || !date) return;

    try {
      setLoadingSlots(true);
      setError(null);

      const dateStr = typeof date === 'string' ? date : formatPerthDateToISO(convertToPerthTime(date));
      
      // Fetch unavailable slots and appointments
      const unavailableSlotsResponse = await restClient.get('/unavailable-slots', { date: dateStr });
      
      if (unavailableSlotsResponse?.data) {
        const responseData = unavailableSlotsResponse.data;
        console.log('Admin - Unavailable slots response:', responseData);
        
        // Extract appointments from scheduled slots
        if (responseData.scheduledSlots && Array.isArray(responseData.scheduledSlots)) {
          const appointmentsFromSlots = responseData.scheduledSlots.map(slot => {
            // Handle different timeSlot formats
            let timeSlotObj = slot.timeSlot;
            
            // If timeSlot is a string like "09:00-10:00", convert to object
            if (typeof timeSlotObj === 'string' && timeSlotObj.includes('-')) {
              const [start, end] = timeSlotObj.split('-');
              timeSlotObj = { start: start.trim(), end: end.trim() };
            }
            
            // Ensure timeSlotObj has start and end properties
            if (!timeSlotObj || !timeSlotObj.start || !timeSlotObj.end) {
              console.warn('Invalid timeSlot format:', slot);
              return null;
            }
            
            return {
              appointmentId: slot.appointmentId,
              scheduledTimeSlot: timeSlotObj,
              scheduledDate: dateStr,
              status: slot.status,
              reason: slot.reason
            };
          }).filter(appointment => appointment !== null);
          
          console.log('Admin - Processed appointments:', appointmentsFromSlots);
          setExistingAppointments(appointmentsFromSlots);
        } else {
          setExistingAppointments([]);
        }

        // Extract unavailable slots - preserve detailed information for tooltips
        if (responseData.unavailableSlots && Array.isArray(responseData.unavailableSlots)) {
          console.log('Admin - Raw unavailable slots:', responseData.unavailableSlots);
          const processedUnavailableSlots = responseData.unavailableSlots.map(slot => {
            // Handle different slot formats - preserve object format for detailed tooltips
            if (typeof slot === 'string') {
              return { timeSlot: slot, reason: 'manually_set' }; // Default reason for string format
            } else if (slot && typeof slot === 'object') {
              const timeSlot = slot.timeSlot || slot.slot;
              if (timeSlot && typeof timeSlot === 'string') {
                return {
                  timeSlot: timeSlot,
                  reason: slot.reason || 'unknown',
                  appointmentId: slot.appointmentId,
                  status: slot.status
                };
              }
            }
            return null;
          }).filter(slot => slot !== null);
          
          console.log('Admin - Processed unavailable slots with details:', processedUnavailableSlots);
          setUnavailableSlots(processedUnavailableSlots);
        } else {
          setUnavailableSlots([]);
        }
      }
    } catch (error) {
      console.error('Error fetching slots for date:', error);
      setError('Failed to load slot data. Please try again.');
      setExistingAppointments([]);
      setUnavailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Calculate recommendations and stats
  const updateAnalysis = () => {
    if (!timeSlots || timeSlots.length === 0) {
      setRecommendedSlots([]);
      setOptimizationStats(null);
      setAvailabilityStats(null);
      return;
    }

    try {
      // Convert unavailable slots to string format for utility functions
      const unavailableSlotStrings = unavailableSlots.map(unavailable => 
        typeof unavailable === 'string' ? unavailable : unavailable.timeSlot
      ).filter(slot => slot && typeof slot === 'string'); // Filter out invalid slots
      
      // Debug logging for data validation
      console.log('Admin - Analysis Data Validation:');
      console.log('- Time slots count:', timeSlots.length);
      console.log('- Existing appointments count:', existingAppointments?.length || 0);
      console.log('- Unavailable slots count:', unavailableSlotStrings.length);
      
      // Validate existingAppointments structure
      if (existingAppointments && existingAppointments.length > 0) {
        existingAppointments.forEach((appointment, index) => {
          if (!appointment) {
            console.warn(`Admin - Null appointment at index ${index}`);
            return;
          }
          
          if (appointment.scheduledTimeSlot) {
            if (!appointment.scheduledTimeSlot.start || !appointment.scheduledTimeSlot.end) {
              console.warn(`Admin - Invalid scheduledTimeSlot at index ${index}:`, appointment.scheduledTimeSlot);
            }
          }
          
          if (appointment.selectedSlots) {
            appointment.selectedSlots.forEach((slot, slotIndex) => {
              if (!slot || !slot.start || !slot.end) {
                console.warn(`Admin - Invalid selectedSlot at appointment ${index}, slot ${slotIndex}:`, slot);
              }
            });
          }
        });
      }
      
      // Calculate slot recommendations for maximum appointments
      const result = findOptimalSlotCombinations(
        timeSlots,
        [], // No selected slots for admin view
        existingAppointments || [],
        unavailableSlotStrings || [],
        selectedDate,
        timeSlots.length // Consider all slots
      );

      setRecommendedSlots(result.recommendedSlots || []);
      setOptimizationStats(result);

      // Calculate availability statistics
      const stats = getAvailabilityStats(timeSlots, existingAppointments || [], unavailableSlotStrings || [], selectedDate);
      console.log('Admin - Availability stats:', stats);
      setAvailabilityStats(stats);

    } catch (error) {
      console.error('Error calculating slot analysis:', error);
      setRecommendedSlots([]);
      setOptimizationStats(null);
      setAvailabilityStats(null);
    }
  };

  // Handle day selection
  const handleDaySelect = (dayKey) => {
    setSelectedDayKey(dayKey);
    const dayOption = DAY_OPTIONS.find(option => option.key === dayKey);
    if (dayOption) {
      setSelectedDate(dayOption.getDate());
    }
  };

  // Handle duration selection
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  // Get slot availability for display with detailed tooltip information
  const getSlotAvailability = (slot) => {
    try {
      // Extract string array for the utility function
      const unavailableSlotStrings = unavailableSlots.map(unavailable => 
        typeof unavailable === 'string' ? unavailable : unavailable.timeSlot
      );
      
      // Get basic availability from utility
      const basicAvailability = checkSlotAvailability(slot, existingAppointments, unavailableSlotStrings, selectedDate);
      
      // If not available, check if we can provide more detailed tooltip information
      if (!basicAvailability.isAvailable) {
        // Helper function to check if two time ranges overlap
        const timesOverlap = (start1, end1, start2, end2) => {
          const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
          };
          
          const start1Min = timeToMinutes(start1);
          const end1Min = timeToMinutes(end1);
          const start2Min = timeToMinutes(start2);
          const end2Min = timeToMinutes(end2);
          
          return start1Min < end2Min && start2Min < end1Min;
        };
        
        // Find the detailed unavailable slot object - check for overlaps, not just exact matches
        const detailedUnavailableSlot = unavailableSlots.find(unavailable => {
          const unavailableTimeSlot = typeof unavailable === 'string' ? unavailable : unavailable.timeSlot;
          const [unavailableStart, unavailableEnd] = unavailableTimeSlot.split('-');
          
          // Check if the generated slot overlaps with this unavailable slot
          return timesOverlap(slot.start, slot.end, unavailableStart, unavailableEnd);
        });
        
        if (detailedUnavailableSlot && typeof detailedUnavailableSlot === 'object') {
          let enhancedMessage = basicAvailability.message;
          let enhancedReason = basicAvailability.reason;
          
          switch (detailedUnavailableSlot.reason) {
            case 'manually_set':
              enhancedMessage = 'Not available - manually marked as unavailable by admin';
              enhancedReason = 'manually_unavailable';
              break;
            case 'scheduled_appointment':
              enhancedMessage = `Already booked - Appointment ${detailedUnavailableSlot.appointmentId ? detailedUnavailableSlot.appointmentId.slice(0, 8) + '...' : 'N/A'} (${detailedUnavailableSlot.status || 'SCHEDULED'})`;
              enhancedReason = 'fully_booked';
              break;
            case 'pending_appointment':
              enhancedMessage = `Pending appointment - ${detailedUnavailableSlot.appointmentId ? detailedUnavailableSlot.appointmentId.slice(0, 8) + '...' : 'N/A'} (${detailedUnavailableSlot.status || 'PENDING'})`;
              enhancedReason = 'fully_booked';
              break;
          }
          
          return {
            ...basicAvailability,
            message: enhancedMessage,
            reason: enhancedReason
          };
        }
      }
      
      return basicAvailability;
      
    } catch (error) {
      console.error('Error checking slot availability:', error, 'Slot:', slot);
      return {
        isAvailable: false,
        reason: 'error',
        message: 'Error checking availability'
      };
    }
  };

  // Check if slot is recommended
  const isSlotRecommended = (slot) => {
    try {
      return recommendedSlots.some(recommended => 
        recommended.start === slot.start && recommended.end === slot.end
      );
    } catch (error) {
      console.error('Error checking slot recommendation:', error);
      return false;
    }
  };

  // Effect to fetch data when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, restClient]);

  // Effect to update analysis when data changes
  useEffect(() => {
    if (!loadingSlots && timeSlots && timeSlots.length > 0) {
      updateAnalysis();
    }
  }, [timeSlots, existingAppointments, unavailableSlots, selectedDate, loadingSlots]);

  return (
    <PageContainer>
      <div className="min-h-screen bg-background-primary py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4 mt-12">
              Admin Timeslot Analyzer
            </h1>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-card-primary border border-border-primary">
              <CardHeader>
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analysis Controls
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Day Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Select Date
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {DAY_OPTIONS.map((option) => (
                      <Button
                        key={option.key}
                        onClick={() => handleDaySelect(option.key)}
                        variant={selectedDayKey === option.key ? "default" : "outline"}
                        className={`px-4 py-2 ${
                          selectedDayKey === option.key 
                            ? 'bg-highlight-primary text-white' 
                            : 'border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary'
                        }`}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3">
                    Timeslot Duration
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {DURATION_OPTIONS.map((option) => (
                      <Button
                        key={option.key}
                        onClick={() => handleDurationSelect(option.value)}
                        variant={selectedDuration === option.value ? "default" : "outline"}
                        className={`px-3 py-2 text-sm ${
                          selectedDuration === option.value 
                            ? 'bg-highlight-primary text-white' 
                            : 'border-border-secondary text-text-secondary hover:border-highlight-primary hover:text-highlight-primary'
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis Results - Reordered to show Timeslots first, then Overview */}
          <div className="space-y-8">
            {/* Timeslot Analysis - Now displayed first */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card-primary border border-border-primary">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeslot Analysis
                  </h3>
                  <p className="text-text-secondary text-sm">
                    View availability status and recommendations for {selectedDuration}-minute slots
                  </p>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                      <p className="text-text-secondary">No timeslots available for this duration</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {timeSlots.map((slot, index) => {
                        const availability = getSlotAvailability(slot);
                        const isRecommended = isSlotRecommended(slot);
                        
                        // Determine slot appearance based on availability and recommendation - same as SlotsSelectionPage
                        let slotClass, slotTitle, statusIcon;
                        
                        if (isRecommended) {
                          slotClass = 'bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 hover:from-emerald-200 hover:via-green-100 hover:to-emerald-200 text-emerald-900 border-2 border-emerald-400 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:scale-105 transition-all duration-300 animate-pulse ring-2 ring-emerald-300 ring-opacity-50';
                          slotTitle = `✨ Recommended for optimal scheduling: ${availability.message} • Maximum efficiency choice 🚀`;
                          statusIcon = (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          );
                        } else {
                          switch (availability.reason) {
                            case 'available':
                              slotClass = 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:shadow-md hover:scale-105 transition-all duration-200';
                              slotTitle = availability.message;
                              break;
                            case 'fully_booked':
                              slotClass = 'bg-rose-100 text-rose-500 cursor-not-allowed border-rose-200';
                              slotTitle = availability.message;
                              statusIcon = (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              );
                              break;
                            case 'manually_unavailable':
                              slotClass = 'bg-red-100 text-red-500 cursor-not-allowed border-red-200';
                              slotTitle = availability.message; // Use the enhanced message from getSlotAvailability
                              statusIcon = (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM4 10a6 6 0 1012 0A6 6 0 004 10z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              );
                              break;
                            case 'too_soon':
                              slotClass = 'bg-amber-100 text-amber-600 cursor-not-allowed border-amber-200';
                              slotTitle = 'Too soon - need at least 2 hours notice (Perth time)';
                              statusIcon = (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              );
                              break;
                            default:
                              slotClass = 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300';
                              slotTitle = availability.message || 'Not available';
                          }
                        }

                        return (
                          <div
                            key={index}
                            className={`relative rounded-xl px-2 py-3 text-md font-medium border-2 transition-all duration-200 transform hover:scale-105 select-none ${slotClass}`}
                            title={slotTitle}
                          >
                            {statusIcon}
                            <div className="text-sm font-semibold mb-1">
                              {slot.start} - {slot.end}
                            </div>
                            <div className="text-xs opacity-75">
                              {isRecommended ? 'Recommended' : 
                               availability.isAvailable ? 'Available' :
                               availability.reason === 'fully_booked' ? 'Fully Booked' :
                               availability.reason === 'too_soon' ? 'Too Soon' :
                               availability.reason === 'manually_unavailable' ? 'Unavailable' :
                               'Not Available'}
                            </div>
                            {availability.isAvailable && (
                              <div className="text-xs mt-1 opacity-60">
                                {availability.availableMechanics || 0}/{getMechanicsCount()} free
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Overview - Now displayed below timeslots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card-primary border border-border-primary">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analysis Overview
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingSlots ? (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 border-2 border-highlight-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-text-secondary">Loading analysis...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  ) : (
                    <>
                      {/* Compact Mechanics Info */}
                      <div className="flex items-center justify-between bg-background-secondary/30 rounded-lg px-4 py-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-highlight-primary" />
                          <span className="text-sm font-medium text-text-primary">Available Mechanics</span>
                        </div>
                        <span className="text-lg font-bold text-highlight-primary">{getMechanicsCount()}</span>
                      </div>

                      {/* Availability Stats */}
                      {availabilityStats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-700 font-medium">Available Slots</p>
                            <p className="text-2xl font-bold text-green-600">{availabilityStats.availableSlots || 0}</p>
                          </div>
                          
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-700 font-medium">Unavailable Slots</p>
                            <p className="text-2xl font-bold text-red-600">
                              {(availabilityStats.fullyBookedSlots || 0) + 
                               (availabilityStats.manuallyUnavailableSlots || 0) + 
                               (availabilityStats.tooSoonSlots || 0)}
                            </p>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-700 font-medium">Maximum Capacity</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {availabilityStats.maximumCapacity || 0}
                            </p>
                            <p className="text-xs text-blue-500">max appointments possible (considering overlaps)</p>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-amber-700 font-medium">Current Utilization</p>
                            <p className="text-2xl font-bold text-amber-600">
                              {availabilityStats.currentAppointments || 0} / {availabilityStats.maximumCapacity || 0}
                            </p>
                            <p className="text-xs text-amber-500">{availabilityStats.utilizationRate || '0%'} capacity used</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default AdminTimeslotAnalyzer;