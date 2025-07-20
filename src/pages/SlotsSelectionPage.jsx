import React, { useEffect, useState } from 'react';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import { useNavigate } from 'react-router-dom';
import { format, set } from 'date-fns';
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

const generateTimeSlots = () => {
  const slots = [];
  let hour = 8;
  let minute = 0;

  while (hour < 18) {
    const start = new Date();
    start.setHours(hour);
    start.setMinutes(minute);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    if (end.getHours() <= 20) {
      slots.push({
        start: start.toTimeString().slice(0, 5),
        end: end.toTimeString().slice(0, 5),
      });
    }

    minute += 30;
    if (minute === 60) {
      hour++;
      minute = 0;
    }
  }

  return slots;
};

const timeSlots = generateTimeSlots();

function SlotsSelectionPage() {
  const navigate = useNavigate();
  const { appointmentFormData, updateAppointmentFormData } = useGlobalData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);
  
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

  useEffect(() => {
    setSelectedSlots(appointmentFormData?.selectedSlots ? appointmentFormData.selectedSlots.map(slot => ({
      id: `${slot.date}_${slot.start}`,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    })) : []);
  }, []);

  if (!appointmentFormData.serviceId || !appointmentFormData.planId) {
    navigate('/');
  }

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
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const newSlot = {
      id: `${dateStr}_${slot.start}`,
      date: dateStr,
      start: slot.start,
      end: slot.end,
    };

    if (isOverlapping(newSlot)) {
      alert('Overlapping time slot!');
      return;
    }

    if (selectedSlots.length >= 4) {
      alert('You can select up to 4 slots.');
      return;
    }

    setSelectedSlots([...selectedSlots, newSlot]);
  };

  const handleRemove = (id) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedSlots.findIndex((i) => i.id === active.id);
    const newIndex = selectedSlots.findIndex((i) => i.id === over.id);
    setSelectedSlots(arrayMove(selectedSlots, oldIndex, newIndex));
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full mx-auto bg-background-primary py-20 px-3 sm:px-12"
    >

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-text-primary bg-clip-text text-transparent">
            Book Your Time Slots
          </h1>
          <p className="text-text-secondary text-lg hidden sm:block">
            Select your preferred date and time slots for the appointment.
          </p>
          <p className="text-text-secondary text-lg hidden sm:block">
            You can choose up to 4 slots and reorder them by priority.
          </p>
          <p className="text-text-secondary text-lg sm:hidden">
            Select your preferred date and time slots for the appointment. You can choose up to 4 slots and reorder them by priority.
          </p>
        </div>

        {/* Calendar + Time Slots side by side */}
        <div className="rounded-2xl shadow-xl border border-border-secondary overflow-hidden bg-background-tertiary">
          <div className="flex flex-col lg:flex-row">
            {/* Calendar */}
            <div className="lg:w-2/5 p-8 bg-card-primary border-r border-border-secondary flex flex-col">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="w-10 h-10 blue-light-gradient rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-1 sm:mb-0">Select a Date</h3>
                      <p className="text-text-secondary">Choose your preferred appointment date</p>
                    </div>
                  </div>
                  
                </div>
                <div className="flex justify-center">
                  <div className="rounded-2xl shadow-xl border-2 border-blue-100 bg-text-primary p-4 transition-all duration-200 hover:shadow-2xl hover:border-blue-300">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-xl border-0 bg-transparent text-text-tertiary"
                      captionLayout="dropdown-buttons"
                      showOutsideDays
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Time Slots */}
            <div className="lg:w-3/5 p-8">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="w-10 h-10 green-light-gradient rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-text-primary mb-1 sm:mb-0">Available Time Slots</h3>
                      <p className="text-text-secondary">Select up to 4 time slots for your appointment</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    const isSelected = selectedSlots.find(
                      (s) => s.date === dateStr && s.start === slot.start
                    );

                    const overlapping = isOverlapping({
                      date: dateStr,
                      start: slot.start,
                      end: slot.end,
                    });

                    return (
                      <button
                        key={slot.start}
                        onClick={() => handleSelect(slot)}
                        disabled={isSelected || overlapping}
                        className={`relative rounded-xl px-2 py-3 text-md font-medium border-2 transition-all duration-200 transform hover:scale-105 select-none ${
                          isSelected
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-200'
                            : overlapping
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                        title={
                          isSelected
                            ? 'Slot selected'
                            : overlapping
                            ? 'Overlapping slot - not available'
                            : 'Click to select this slot'
                        }
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-xs opacity-75">to {slot.end}</div>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
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
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="w-10 h-10 purple-light-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-text-primary mb-1 sm:mb-0">Your Selected Slots</h3>
                  <p className="text-md text-text-secondary">
                    {selectedSlots.length === 0 
                      ? "No slots selected yet. Choose your preferred time slots above."
                      : `${selectedSlots.length} slot${selectedSlots.length > 1 ? 's' : ''} selected. Drag to reorder by priority.`
                    }
                  </p>
                </div>
              </div>
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
        <div className="flex justify-center mt-8">
          <button
            disabled={selectedSlots.length === 0}
            className={`relative px-12 py-3 rounded-xl text-lg font-semibold transition-all duration-200 transform ${
              selectedSlots.length > 0
                ? 'animated-button-primary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNext}
          >
            {selectedSlots.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
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
            className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm"
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
    'bg-gradient-to-r from-blue-500 to-blue-600',
    'bg-gradient-to-r from-green-500 to-green-600', 
    'bg-gradient-to-r from-orange-500 to-orange-600',
    'bg-gradient-to-r from-purple-500 to-purple-600'
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