import React, { useEffect, useState, useMemo } from 'react';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useRestClient } from '../components/contexts/RestContext';
import { useNavigate } from 'react-router-dom';
import { format, set } from 'date-fns';
import { fetchUnavailableSlots, generateTimeSlots } from '../utils/appointmentUtils';
import { 
  checkSlotAvailability, 
  filterAvailableSlots, 
  getAvailabilityStats,
  getMechanicsCount 
} from '../utils/slotAvailabilityUtils';
import { 
  findOptimalSlotCombinations,
  getRecommendedSlots,
  isSlotRecommended 
} from '../utils/slotRecommendationUtils';
import { getPlanDuration } from '../meta/menu';
import { 
  getPerthCurrentDateTime,
  formatPerthDateToISO,
  convertToPerthTime,
  getPerthCurrentDateString
} from '../utils/timezoneUtils';
import '../css/calendar-custom.css';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar } from '@/components/ui/calendar';
import { motion } from 'framer-motion';
import AppointmentStepIndicator from '@/components/common/AppointmentStepIndicator';
import BackArrow from '@/components/common/BackArrow';

// Function to get initial date (today in Perth timezone or tomorrow if today has no available slots)
const getInitialDate = () => {
  return getPerthCurrentDateTime(); // Start with today in Perth timezone, useEffect will handle switching if needed
};

function SlotsSelectionPage() {
  const navigate = useNavigate();
  const { appointmentFormData, updateAppointmentFormData } = useGlobalData();
  const { restClient } = useRestClient();
  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0); // Force re-render when needed
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [optimizationStats, setOptimizationStats] = useState(null);
  
  // Generate time slots based on the selected plan's duration
  const timeSlots = useMemo(() => {
    const duration = getPlanDuration(appointmentFormData?.serviceId, appointmentFormData?.planId);
    return generateTimeSlots(duration);
  }, [appointmentFormData?.serviceId, appointmentFormData?.planId]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Slight drag before activating
      },
    }),
    useSensor(TouchSensor, {
  activationConstraint: {
    distance: 5, // Instead of delay, use distance
  },
}),
  );

  // Function to fetch unavailable slots and existing appointments for a specific date
  const fetchSlotsForDate = async (date) => {
    if (!restClient) return;
    
    setLoadingSlots(true);
    setSlotsError(null);
    
    try {
      // Fetch manually unavailable slots
      const { unavailableSlots: slots, error: slotsError } = await fetchUnavailableSlots(restClient, date);
      
      if (slotsError) {
        setSlotsError(slotsError);
        setUnavailableSlots([]);
        setExistingAppointments([]);
      } else {
        console.log('Manually unavailable timeslots:', slots);
        setUnavailableSlots(slots);
        
        // Fetch existing appointments for the date to check mechanic availability
        try {
          const dateStr = typeof date === 'string' ? date : formatPerthDateToISO(convertToPerthTime(date));
          
          // Use the correct /unavailable-slots endpoint according to API documentation
          const unavailableSlotsResponse = await restClient.get('/unavailable-slots', { date: dateStr });
          
          if (unavailableSlotsResponse?.data) {
            const responseData = unavailableSlotsResponse.data;
            console.log('Unavailable slots response:', responseData);
            
            // Extract appointments from the scheduled slots in the response
            if (responseData.scheduledSlots && Array.isArray(responseData.scheduledSlots)) {
              // Convert scheduled slots to appointment format for compatibility
              const appointmentsFromSlots = responseData.scheduledSlots.map(slot => ({
                appointmentId: slot.appointmentId,
                scheduledTimeSlot: slot.timeSlot,
                scheduledDate: dateStr,
                status: slot.status,
                reason: slot.reason
              }));
              console.log('Extracted appointments from scheduled slots:', appointmentsFromSlots);
              setExistingAppointments(appointmentsFromSlots);
            } else {
              setExistingAppointments([]);
            }
          } else {
            setExistingAppointments([]);
          }
        } catch (appointmentError) {
          console.warn('Could not fetch unavailable slots data, proceeding with manual unavailable slots only:', appointmentError);
          setExistingAppointments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching slot data:', error);
      setSlotsError('Failed to load slot availability data. Please try again.');
      setUnavailableSlots([]);
      setExistingAppointments([]);
    }
    
    setLoadingSlots(false);
  };

  useEffect(() => {
    setSelectedSlots(appointmentFormData?.selectedSlots ? appointmentFormData.selectedSlots.map(slot => ({
      id: `${slot.date}_${slot.start}`,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    })) : []);
  }, []);

  // Fetch unavailable slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, restClient]);

  // Check if any slots are available for the current date and auto-select next day if none
  useEffect(() => {
    if (!loadingSlots && selectedDate) {
      const today = getPerthCurrentDateTime();
      today.setHours(0, 0, 0, 0);
      const currentSelectedDate = convertToPerthTime(selectedDate);
      currentSelectedDate.setHours(0, 0, 0, 0);
      
      // Only check for today's date, not future dates that user manually selected
      if (currentSelectedDate.getTime() === today.getTime()) {
        const availableSlots = filterAvailableSlots(timeSlots, existingAppointments, unavailableSlots, selectedDate);
        
        if (availableSlots.length === 0) {
          // No slots available for today, select tomorrow in Perth timezone
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          setSelectedDate(tomorrow);
          setCalendarKey(prev => prev + 1); // Force calendar re-render
        }
      }
    }
  }, [loadingSlots, unavailableSlots, existingAppointments, selectedDate]);

  // Update slot recommendations when relevant data changes
  useEffect(() => {
    if (!loadingSlots && timeSlots && timeSlots.length > 0) {
      updateSlotRecommendations();
    }
  }, [timeSlots, selectedSlots, existingAppointments, unavailableSlots, selectedDate, loadingSlots]);

  if (!appointmentFormData || !appointmentFormData?.serviceId || !appointmentFormData?.planId) {
    navigate('/');
  }

  // Helper function to get slot availability info
  const getSlotAvailability = (slot) => {
    return checkSlotAvailability(slot, existingAppointments, unavailableSlots, selectedDate);
  };

  // Function to calculate and update slot recommendations
  const updateSlotRecommendations = () => {
    if (!timeSlots || timeSlots.length === 0) {
      setRecommendedSlots([]);
      setOptimizationStats(null);
      return;
    }

    try {
      const result = findOptimalSlotCombinations(
        timeSlots,
        selectedSlots,
        existingAppointments,
        unavailableSlots,
        selectedDate,
        4 // Maximum slots user can select
      );

      setRecommendedSlots(result.recommendedSlots);
      setOptimizationStats(result);

      console.log('Slot optimization results:', {
        current: result.currentMaxAppointments,
        potential: result.potentialMaxAppointments,
        improvement: result.improvementPossible,
        recommended: result.recommendedSlots.length,
        stats: result.statistics
      });
    } catch (error) {
      console.error('Error calculating slot recommendations:', error);
      setRecommendedSlots([]);
      setOptimizationStats(null);
    }
  };

  const isOverlapping = (newSlotObj) => {
    const newStart = new Date(`${newSlotObj.date}T${newSlotObj.start}`);
    const newEnd = new Date(`${newSlotObj.date}T${newSlotObj.end}`);

    return selectedSlots.some((s) => {
      const existingStart = new Date(`${s.date}T${s.start}`);
      const existingEnd = new Date(`${s.date}T${s.end}`);
      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  const handleSelect = (slot) => {
    const dateStr = formatPerthDateToISO(convertToPerthTime(selectedDate));

    const newSlot = {
      id: `${dateStr}_${slot.start}`,
      date: dateStr,
      start: slot.start,
      end: slot.end,
    };

    // Check slot availability using the new logic
    const availability = getSlotAvailability(slot);
    
    if (!availability.isAvailable) {
      let message = 'This time slot is not available.';
      
      switch (availability.reason) {
        case 'too_soon':
          message = 'This time slot must be at least 2 hours from now. Please select a different slot.';
          break;
        case 'manually_unavailable':
          message = 'This time slot has been manually marked as unavailable. Please select a different slot.';
          break;
        case 'fully_booked':
          message = `This time slot is fully booked (${availability.occupiedBy}/${availability.totalCapacity} mechanics occupied). Please select a different slot.`;
          break;
        default:
          message = availability.message || 'This time slot is not available. Please select a different slot.';
      }
      
      alert(message);
      return;
    }

    if (isOverlapping(newSlot)) {
      alert('Overlapping time slot!');
      return;
    }

    if (selectedSlots.length >= 4) {
      alert('You can select up to 4 slots.');
      return;
    }

    setSelectedSlots([...selectedSlots, newSlot]);
    // Recommendations will be updated automatically via useEffect
  };

  const handleRemove = (id) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== id));
    // Recommendations will be updated automatically via useEffect
  };

  const handleDnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedSlots.findIndex((i) => i.id === active.id);
    const newIndex = selectedSlots.findIndex((i) => i.id === over.id);
    setSelectedSlots(arrayMove(selectedSlots, oldIndex, newIndex));
    // Note: Drag and drop just reorders, doesn't change selection, so recommendations stay the same
  };

  const handleNext = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot.');
      return;
    }
    updateAppointmentFormData({
      ...appointmentFormData,
      selectedSlots: selectedSlots.map((s, index) => ({
        date: s.date,
        start: s.start,
        end: s.end,
        priority: index + 1
      })),
    });
    navigate('/booking-confirmation');
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen w-full mx-auto bg-background-primary py-20 px-3 sm:px-12 relative"
      >
        <BackArrow to={() => navigate('/booking-form')} />

        <div className="text-center mb-4">
          <h1 className="sm:text-4xl text-3xl font-bold mb-2 bg-text-primary bg-clip-text text-transparent">
            Choose Your Time
          </h1>
          <p className="text-text-secondary text-lg hidden sm:block">
            Select your preferred date and timeslot for the appointment.
          </p>
          <p className="text-text-secondary text-lg hidden sm:block">
            You can choose up to 4 slots and reorder them by your preference.
          </p>
          <p className="text-text-secondary text-base sm:hidden">
            Select your preferred date and timeslot for the appointment. You can choose up to 4 slots and reorder them by your preference.
          </p>
        </div>
        
        {/* Step Indicator */}
        <AppointmentStepIndicator currentStep={3} className="mb-8" />

        {/* Calendar + Time Slots side by side */}
        <div className="rounded-2xl shadow-xl border border-border-secondary overflow-hidden bg-background-tertiary">
          <div className="flex flex-col lg:flex-row">
            {/* Calendar */}
            <div className="lg:w-2/5 p-8 bg-card-primary border-r border-border-secondary flex flex-col">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="w-10 h-10 blue-light-gradient rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">Select a Date</h3>
                  </div>
                  <p className="text-text-secondary">Choose your preferred date for the appointment.</p>
                  {selectedDate && (
                    <p className="text-blue-600 font-medium text-sm mt-1">
                      Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <div className="rounded-2xl shadow-xl border-2 border-blue-100 bg-text-primary p-4 transition-all duration-200 hover:shadow-2xl hover:border-blue-300">
                    <div className="calendar-container">
                      <Calendar
                        key={calendarKey}
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            // Force calendar re-render to maintain selection state
                            setCalendarKey(prev => prev + 1);
                          }
                        }}
                        className="rounded-xl border-0 bg-transparent text-text-tertiary"
                        captionLayout="dropdown-buttons"
                        showOutsideDays={false}
                        disabled={(date) => {
                          const today = getPerthCurrentDateTime();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        defaultMonth={selectedDate}
                        fixedWeeks={true}
                        classNames={{
                          day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-500",
                          day: "hover:bg-blue-50 focus-visible:bg-blue-50",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="lg:w-3/5 p-8">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="w-10 h-10 green-light-gradient rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">Available Time Slots</h3>
                  </div>
                  <p className="text-text-secondary">
                    {loadingSlots ? 'Loading available slots...' : 'You can select up to 4 time slots for your appointment. Some slots are recommended for you.✨ '}
                  </p>
                  {!loadingSlots && !slotsError && optimizationStats && (
                    <div className="flex flex-col gap-2 mt-2 text-sm">
                      {(() => {
                        const stats = getAvailabilityStats(timeSlots, existingAppointments, unavailableSlots, selectedDate);
                        const mechanicsCount = getMechanicsCount();
                        
                        console.log('Slot availability stats:', stats);
                        
                        return (
                          <>
                            <div className="flex gap-4 justify-center lg:justify-start">
                              <span className="text-emerald-600 font-medium">
                                {stats.availableSlots} available
                              </span>
                              <span className="text-red-500 font-medium">
                                {stats.manuallyUnavailableSlots} unavailable
                              </span>
                              <span className="text-amber-600 font-medium">
                                {stats.tooSoonSlots} too soon
                              </span>
                            </div>
                            
                            {/* Environmental sustainability message */}
                            {optimizationStats.recommendedSlots.length > 0 && (
                              <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-green-800 font-medium text-xs">🌿 Choosing recommended slots supports our eco-friendly practices</span>
                                </div>
                              </div>
                            )}
                            
                            {optimizationStats.improvementPossible && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-emerald-800 font-semibold text-sm">Perfect Slots for You</span>
                                </div>
                                <div className="text-xs text-emerald-700 leading-relaxed">
                                  We've highlighted some slots that work particularly well for your appointment.
                                  {optimizationStats.recommendedSlots.length > 0 && (
                                    <span className="block mt-1">
                                      Consider the {optimizationStats.recommendedSlots.length} recommended slot{optimizationStats.recommendedSlots.length > 1 ? 's' : ''} marked with ✨ for the best experience.
                                    </span>
                                  )}
                                </div>
                                
                                {/* Environmental message */}
                                <div className="mt-3 pt-2 border-t border-emerald-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-green-800 font-medium text-xs">🌱 Eco-Friendly Choice</span>
                                  </div>
                                  <div className="text-xs text-green-700 leading-relaxed">
                                    These time slots help reduce energy consumption and support our commitment to environmental sustainability.
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                {slotsError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-red-700 font-medium">{slotsError}</span>
                    </div>
                    <button 
                      onClick={() => fetchSlotsForDate(selectedDate)}
                      className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const dateStr = formatPerthDateToISO(convertToPerthTime(selectedDate));
                    const isSelected = selectedSlots.find(
                      (s) => s.date === dateStr && s.start === slot.start
                    );
                    
                    const availability = getSlotAvailability(slot);
                    const overlapping = isOverlapping({
                      date: dateStr,
                      start: slot.start,
                      end: slot.end,
                    });

                    // Check if this slot is recommended for optimal appointments
                    const isRecommended = !isSelected && !overlapping && availability.isAvailable && 
                      recommendedSlots.some(recommended => 
                        recommended.start === slot.start && recommended.end === slot.end
                      );

                    const isDisabled = isSelected || overlapping || !availability.isAvailable || loadingSlots;

                    // Determine slot appearance based on availability and recommendation
                    let slotClass, slotTitle, statusIcon;
                    
                    if (isSelected) {
                      slotClass = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-200';
                      slotTitle = 'Selected for your appointment';
                      statusIcon = (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      );
                    } else if (isRecommended) {
                      slotClass = 'bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 hover:from-emerald-200 hover:via-green-100 hover:to-emerald-200 text-emerald-900 border-2 border-emerald-400 shadow-lg hover:shadow-xl hover:border-emerald-500 hover:scale-110 transition-all duration-300 animate-pulse ring-2 ring-emerald-300 ring-opacity-50';
                      slotTitle = `✨ Recommended for you: ${availability.message} • Eco-friendly choice 🌱`;
                      statusIcon = (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      );
                    } else if (overlapping) {
                      slotClass = 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300';
                      slotTitle = 'Time conflicts with your selection';
                    } else if (loadingSlots) {
                      slotClass = 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100 animate-pulse';
                      slotTitle = 'Loading availability...';
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
                          slotTitle = 'Not available at this time';
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
                      <button
                        key={slot.start}
                        onClick={() => handleSelect(slot)}
                        disabled={isDisabled}
                        className={`relative rounded-xl px-2 py-3 text-md font-medium border-2 transition-all duration-200 transform hover:scale-105 select-none ${slotClass}`}
                        title={slotTitle}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-xs opacity-75">to {slot.end}</div>
                          {availability.isAvailable && availability.occupiedBy > 0 && (
                            <div className="text-xs mt-1 opacity-60">
                              {availability.totalCapacity - availability.occupiedBy}/{availability.totalCapacity} free
                            </div>
                          )}
                          {isRecommended && (
                            <div className="text-xs sm:text-xs text-[9px] mt-1 font-bold text-emerald-800 animate-pulse">
                              ⭐ RECOMMENDED ⭐
                            </div>
                          )}
                        </div>
                        {statusIcon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Slots */}
        <div className="bg-background-tertiary rounded-2xl shadow-xl mt-4 border border-border-secondary p-8">
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <div className="w-10 h-10 purple-light-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-text-primary">Your Selected Slots</h3>
              </div>
              <p className="text-md text-text-secondary">
                {selectedSlots.length === 0 
                  ? "No slots selected yet. Choose your preferred time slots above."
                  : `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected. Drag to reorder by priority.`
                }
              </p>
            </div>
            
            {selectedSlots.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-border-tertiary flex items-center justify-center">
                  <svg className="w-12 h-12 text-text-tertiary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg text-text-secondary/80 mb-2">No time slots selected</p>
                <p className="text-md text-text-secondary">Select a date and choose your preferred time slots to get started</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDnd}>
                <SortableContext
                  items={selectedSlots.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedSlots.map((slot, index) => (
                      <SortableSlot key={slot.id} slot={slot} index={index} onRemove={handleRemove} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Next button */}
        <div className="flex justify-center mt-8 px-4">
          <button
            disabled={selectedSlots.length === 0}
            className={`relative px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 transform ${
              selectedSlots.length > 0
                ? 'animated-button-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNext}
          >
            {selectedSlots.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {selectedSlots.length}
              </span>
            )}
            Continue to Confirmation
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
          
        {/* Back Button */}
        <div className="flex justify-start mt-6">
          <motion.button
            onClick={() => navigate('/booking-form')}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm shadow-sm hover:shadow border border-border-secondary"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Booking Form
          </motion.button>
        </div>

      </motion.div>
    </>
  );
}

function SortableSlot({ slot, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = [
    'bg-gradient-to-r from-emerald-500 to-emerald-600', // Most preferred - green
    'bg-gradient-to-r from-blue-500 to-blue-600',       // Second - blue  
    'bg-gradient-to-r from-purple-500 to-purple-600',   // Third - purple
    'bg-gradient-to-r from-rose-500 to-rose-600'        // Fourth - rose
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`group relative bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 flex items-center shadow-md hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105 border-blue-300' : ''
      }`}
    >
      {/* Priority Badge */}
      <div className={`absolute -top-3 -left-3 w-8 h-8 ${priorityColors[index] || priorityColors[0]} text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg`}>
        {index + 1}
      </div>

      {/* Drag Handle */}
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing w-12 h-12 flex items-center justify-center mr-4 rounded-lg hover:bg-gray-100 transition-colors touch-none group-hover:bg-gray-100"
        title="Drag to reorder"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-400 group-hover:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9h.01M8 15h.01M12 9h.01M12 15h.01M16 9h.01M16 15h.01"
          />
        </svg>
      </div>

      {/* Slot Content */}
      <div className="flex-1 mr-4">
        <div className="font-semibold text-gray-800 text-lg">{slot.date}</div>
        <div className="text-sm text-gray-600 flex items-center mt-1">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {slot.start} - {slot.end}
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(slot.id);
        }}
        className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors group"
        title="Remove this slot"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default SlotsSelectionPage;