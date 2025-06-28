import React, { useEffect, useState } from 'react';
import { useFormData } from '../components/FormDataContext';
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
  const { formData, getFormData, updateFormData } = useFormData();
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
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const prevFormData = getFormData();
    updateFormData(prevFormData);
    setSelectedSlots(prevFormData?.selectedSlots? prevFormData.selectedSlots.map(slot => ({
      id: `${slot.date}_${slot.start}`,
      date: slot.date,
      start: slot.start,
      end: slot.end,
    })) : []);
  }, []);

  if (!formData.serviceId || !formData.planId) {
    navigate('/');
  } else if (formData.isBuyer) {
    if (!formData.buyerData.name 

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
    updateFormData({
      ...formData,
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
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10 text-black">
      <h2 className="text-3xl font-bold text-center">Book Your Time Slots</h2>

      {/* Calendar + Time Slots side by side */}
      <div className="flex flex-col md:flex-row md:space-x-6 items-start">
        {/* Calendar */}
        <div className="flex flex-col items-center md:items-start w-full mb-4 md:w-1/3">
          <span className="font-medium block mb-4 text-gray-100">Select a Date</span>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border shadow"
          />
        </div>

        {/* Time Slots - no scroll, just wrap */}
        <div className="md:w-2/3">
          <div className="flex flex-col items-center md:items-start w-full mb-4">
            <span className="font-medium block text-gray-100">Available Time Slots</span>
          </div>
          <div className="flex flex-wrap gap-4">
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
                  className={`rounded-lg px-4 py-2 text-sm border transition select-none ${
                    isSelected
                      ? 'bg-green-500 text-white border-green-600'
                      : overlapping
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                      : 'hover:bg-blue-100 bg-white text-black border-blue-400'
                  }`}
                  title={
                    isSelected
                      ? 'Slot selected'
                      : overlapping
                      ? 'Overlapping slot - not available'
                      : 'Click to select this slot'
                  }
                >
                  {slot.start} - {slot.end}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Slots */}
      <div>
        <h3 className="font-medium mb-3 text-gray-100 text-center md:text-left mt-6 md:mt-0 mb-4 md:mb-6">Your Selected Slots</h3>
        {selectedSlots.length === 0 ? (
          <p className="text-gray-500 text-center">
            No slots selected yet. Please select a date and choose your time slots.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDnd}>
            <SortableContext
              items={selectedSlots.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {selectedSlots.map((slot) => (
                  <SortableSlot key={slot.id} slot={slot} onRemove={handleRemove} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Next button */}
      <div className="flex justify-center mt-6">
        <button
          disabled={selectedSlots.length === 0}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
            selectedSlots.length > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleNext}
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  );
}

function SortableSlot({ slot, onRemove }) {
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white text-black px-4 py-3 rounded-lg border flex items-center shadow"
    >
      {/* Bigger drag handle */}
      <div
        {...listeners}
        className="cursor-grab w-10 h-10 flex items-center justify-center mr-4 rounded hover:bg-gray-100"
        title="Drag to reorder"
      >
        {/* Drag icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
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

      {/* Slot content */}
      <span className="flex-1">{slot.date} | {slot.start} - {slot.end}</span>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(slot.id);
        }}
        className="text-sm text-red-500 hover:underline"
      >
        Remove
      </button>
    </li>
  );
}

export default SlotsSelectionPage;