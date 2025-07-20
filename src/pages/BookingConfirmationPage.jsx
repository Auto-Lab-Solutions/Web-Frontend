import React, { useEffect} from "react";
import { useGlobalData } from "../components/contexts/GlobalDataContext";
import { getServiceById, getPlanById } from "../meta/menu";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function BookingConfirmationPage() {
  const { appointmentFormData, clearFormData } = useGlobalData();
  const navigate = useNavigate();

  const handleConfirm = () => {
    // Submit to backend or next step
    console.log("Confirmed data:", appointmentFormData);
    navigate("/appointments");
    clearFormData();
  };

  const handleBack = () => {
    navigate("/slot-selection");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-background-primary"
    >
      <div className="max-w-6xl mx-auto space-y-10 text-black py-20 px-3 sm:px-12">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-text-primary bg-clip-text text-transparent">
            Confirm Your Booking
          </h1>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Please review your appointment details below and confirm to complete your booking.
          </p>
        </div>

        {/* Service Summary Card */}
        <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-background-primary/20 to-background-secondary/20 p-8 border-b border-border-secondary">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto green-light-gradient rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Booking Summary</h2>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 green-dark-gradient px-4 py-2 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                  </svg>
                  {getServiceById(appointmentFormData?.serviceId)?.name}
                </div>
                <div className="inline-flex items-center gap-2 blue-dark-gradient px-4 py-2 rounded-full text-sm font-medium ml-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h8a2 2 0 002-2V7a2 2 0 00-2-2h-6m0 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2z" />
                  </svg>
                  {getPlanById(appointmentFormData?.serviceId, appointmentFormData?.planId)?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Time Slots */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <svg className="w-7 h-7 text-highlight-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Selected Time Slots
            </h3>
            <div className="grid gap-3">
              {appointmentFormData.selectedSlots.map((slot, index) => {
                const priorityColors = [
                  'blue-light-gradient',
                  'green-light-gradient',
                  'orange-light-gradient',
                  'purple-light-gradient'
                ];

                return (
                  <div key={index} className="relative bg-gradient-to-r from-card-secondary/50 to-card-primary border-2 border-border-secondary rounded-xl p-4 flex items-center shadow-md backdrop-blur-sm">
                    {/* Priority Badge */}
                    <div className={`w-8 h-8 ${priorityColors[index] || priorityColors[0]} text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg mr-4`}>
                      {index + 1}
                    </div>
                    
                    {/* Slot Content */}
                    <div className="flex-1">
                      <div className="font-semibold text-text-primary text-lg">{slot.date}</div>
                      <div className="text-sm text-text-secondary flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slot.start} - {slot.end}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Contact Information */}
        {((appointmentFormData?.buyerData?.name || appointmentFormData?.buyerData?.email || appointmentFormData?.buyerData?.phoneNumber) ||
          (appointmentFormData?.sellerData?.name || appointmentFormData?.sellerData?.email || appointmentFormData?.sellerData?.phoneNumber)) && (
          <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-text-primary mb-8 flex items-center gap-2">
              <svg className="w-6 h-6 text-highlight-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Contact Information
            </h3>
            
            <div className={`grid gap-8 ${
              (appointmentFormData?.buyerData?.name || appointmentFormData?.buyerData?.email || appointmentFormData?.buyerData?.phoneNumber) &&
              (appointmentFormData?.sellerData?.name || appointmentFormData?.sellerData?.email || appointmentFormData?.sellerData?.phoneNumber)
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {/* Buyer Information */}
              {(appointmentFormData?.buyerData?.name || appointmentFormData?.buyerData?.email || appointmentFormData?.buyerData?.phoneNumber) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-text-primary">Buyer Information</h4>
                  </div>
                  <div className="space-y-3 pl-13">
                    {appointmentFormData?.buyerData?.name && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Name:</span>
                        <span className="text-text-primary font-semibold">{appointmentFormData.buyerData.name}</span>
                      </div>
                    )}
                    {appointmentFormData?.buyerData?.email && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Email:</span>
                        <span className="text-text-primary">{appointmentFormData.buyerData.email}</span>
                      </div>
                    )}
                    {appointmentFormData?.buyerData?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Phone:</span>
                        <span className="text-text-primary">{appointmentFormData.buyerData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seller Information */}
              {(appointmentFormData?.sellerData?.name || appointmentFormData?.sellerData?.email || appointmentFormData?.sellerData?.phoneNumber) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-text-primary">Seller Information</h4>
                  </div>
                  <div className="space-y-3 pl-13">
                    {appointmentFormData?.sellerData?.name && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Name:</span>
                        <span className="text-text-primary font-semibold">{appointmentFormData.sellerData.name}</span>
                      </div>
                    )}
                    {appointmentFormData?.sellerData?.email && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Email:</span>
                        <span className="text-text-primary">{appointmentFormData.sellerData.email}</span>
                      </div>
                    )}
                    {appointmentFormData?.sellerData?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary font-medium w-16">Phone:</span>
                        <span className="text-text-primary">{appointmentFormData.sellerData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vehicle Information */}
        <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-highlight-primary to-highlight-secondary rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-text-primary">Vehicle Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="blue-dark-gradient rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm">
              <div className="text-sm text-blue-400 font-medium mb-1">Make</div>
              <div className="text-lg font-semibold text-text-primary">{appointmentFormData?.carData?.make}</div>
            </div>
            <div className="green-dark-gradient rounded-xl p-4 border border-green-500/30 backdrop-blur-sm">
              <div className="text-sm text-green-400 font-medium mb-1">Model</div>
              <div className="text-lg font-semibold text-text-primary">{appointmentFormData?.carData?.model}</div>
            </div>
            <div className="orange-dark-gradient rounded-xl p-4 border border-orange-500/30 backdrop-blur-sm">
              <div className="text-sm text-orange-400 font-medium mb-1">Year</div>
              <div className="text-lg font-semibold text-text-primary">{appointmentFormData?.carData?.year}</div>
            </div>
            <div className="purple-dark-gradient rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
              <div className="text-sm text-purple-400 font-medium mb-1">Location</div>
              <div className="text-lg font-semibold text-text-primary">{appointmentFormData?.carData?.location || 'Not specified'}</div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {appointmentFormData?.notes && (
          <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary">Additional Notes</h3>
            </div>
            <div className="bg-card-secondary/50 rounded-lg p-4 border border-border-secondary backdrop-blur-sm">
              <p className="text-text-primary leading-relaxed">{appointmentFormData?.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button
            onClick={handleBack}
            className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-border-secondary text-text-secondary hover:border-border-tertiary hover:bg-card-primary/50 transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Slots
          </button>
          <button
            onClick={handleConfirm}
            className="relative px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-button-primary to-highlight-primary hover:from-highlight-primary hover:to-highlight-secondary text-text-tertiary shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-highlight-primary/30"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirm & Submit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default BookingConfirmationPage;
