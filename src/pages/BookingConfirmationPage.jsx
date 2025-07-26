import React, { useEffect, useState } from "react";
import { useGlobalData } from "../components/contexts/GlobalDataContext";
import { useRestClient } from "../components/contexts/RestContext";
import { getServiceById, getPlanById } from "../meta/menu";
import { formatAppointmentForSubmission, validateAppointmentData, handleAppointmentError } from "../utils/appointmentUtils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Reusable components
const InfoItem = ({ label, value, labelWidth = "w-16" }) => (
  <div className="flex items-center gap-3">
    <span className={`text-text-secondary font-medium ${labelWidth}`}>{label}:</span>
    <span className="text-text-primary font-semibold">{value}</span>
  </div>
);

const ContactSection = ({ title, data, gradientClass }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 ${gradientClass} rounded-full flex items-center justify-center`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h4 className="text-xl font-semibold text-text-primary">{title}</h4>
    </div>
    <div className="space-y-3 pl-13">
      {data?.name && <InfoItem label="Name" value={data.name} />}
      {data?.email && <InfoItem label="Email" value={data.email} />}
      {data?.phoneNumber && <InfoItem label="Phone" value={data.phoneNumber} />}
    </div>
  </div>
);

const VehicleInfoCard = ({ label, value }) => (
  <div className="dark-gradient-primary rounded-xl p-4 border border-border-primary backdrop-blur-sm">
    <div className="text-sm text-text-primary font-medium mb-1">{label}</div>
    <div className="text-lg font-semibold text-text-primary">{value}</div>
  </div>
);

const SectionHeader = ({ icon, title, size = "text-2xl" }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h3 className={`${size} font-semibold text-text-primary`}>{title}</h3>
  </div>
);

function BookingConfirmationPage() {
  const { userId, appointmentFormData, clearFormData } = useGlobalData();
  const { restClient } = useRestClient();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  if (!appointmentFormData || !appointmentFormData?.serviceId || !appointmentFormData?.planId || !appointmentFormData?.selectedSlots?.length) {
    navigate('/');
  }

  const handleConfirm = async () => {
    if (!restClient) {
      setSubmitError("Network connection not available. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate appointment data before submission
      const validation = validateAppointmentData(appointmentFormData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Format appointment data for backend
      const requestBody = formatAppointmentForSubmission(appointmentFormData, userId);
      console.log("Submitting appointment data:", requestBody);

      // Call the backend API
      const response = await restClient.post('appointments', requestBody);

      if (response.data && response.data.success) {
        console.log("Appointment created successfully:", response.data);
        setIsSuccess(true);
        
        // Show custom success alert
        setShowAlert(true);
        
        // Show success state for 3 seconds before navigating
        setTimeout(() => {
          navigate("/status");
          clearFormData();
        }, 3000);
      } else {
        throw new Error(response.data?.message || "Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      setSubmitError(handleAppointmentError(error));
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Custom Success Alert Modal */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-2xl border border-green-200 dark:border-green-700 p-8 max-w-md w-full mx-4 backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              </div>

              {/* Alert Content */}
              <div className="text-center space-y-4">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-green-800 dark:text-green-200"
                >
                  🎉 Success!
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-green-700 dark:text-green-300 text-lg font-medium"
                >
                  Your appointment has been created successfully!
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-green-600 dark:text-green-400 text-sm"
                >
                  You will be redirected to your status page shortly.
                </motion.p>

                {/* Progress bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6"
                >
                  <div className="bg-green-200 dark:bg-green-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear", delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Redirecting automatically...
                  </p>
                </motion.div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowAlert(false)}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Service Summary Card */}
        <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-background-primary/20 to-background-secondary/20 p-8 border-b border-border-secondary">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-highlight-primary rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Booking Summary</h2>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 green-dark-gradient px-4 py-2 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {getServiceById(appointmentFormData?.serviceId)?.name}
                </div>
                <div className="inline-flex items-center gap-2 blue-dark-gradient px-4 py-2 rounded-full text-sm font-medium ml-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {getPlanById(appointmentFormData?.serviceId, appointmentFormData?.planId)?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Time Slots */}
          <div className="p-8">
            <SectionHeader 
              icon={
                <svg className="w-7 h-7 text-highlight-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Selected Time Slots"
              size="text-xl"
            />
            <div className="grid gap-3">
              {appointmentFormData?.selectedSlots?.map((slot, index) => {
                const priorityColors = [
                  'blue-light-gradient',
                  'green-light-gradient',
                  'orange-light-gradient',
                  'purple-light-gradient'
                ];

                return (
                  <div key={index} className="relative dark-gradient-primary border-2 border-border-primary rounded-xl p-4 flex items-center shadow-md backdrop-blur-sm">
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
            <SectionHeader 
              icon={
                <svg className="w-6 h-6 text-highlight-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Contact Information"
            />
            
            <div className={`grid gap-8 ${
              (appointmentFormData?.buyerData?.name || appointmentFormData?.buyerData?.email || appointmentFormData?.buyerData?.phoneNumber) &&
              (appointmentFormData?.sellerData?.name || appointmentFormData?.sellerData?.email || appointmentFormData?.sellerData?.phoneNumber)
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {/* Buyer Information */}
              {(appointmentFormData?.buyerData?.name || appointmentFormData?.buyerData?.email || appointmentFormData?.buyerData?.phoneNumber) && (
                <ContactSection 
                  title="Buyer Information"
                  data={appointmentFormData.buyerData}
                  gradientClass="blue-light-gradient"
                />
              )}

              {/* Seller Information */}
              {(appointmentFormData?.sellerData?.name || appointmentFormData?.sellerData?.email || appointmentFormData?.sellerData?.phoneNumber) && (
                <ContactSection 
                  title="Seller Information"
                  data={appointmentFormData.sellerData}
                  gradientClass="green-light-gradient"
                />
              )}
            </div>
          </div>
        )}

        {/* Vehicle Information */}
        <div className="bg-card-primary rounded-2xl shadow-xl border border-border-primary p-8 backdrop-blur-sm">
          <SectionHeader 
            icon={
              <svg className="w-7 h-7 text-highlight-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9m-8-9l4-4 4 4M4 3h16a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            }
            title="Vehicle Information"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VehicleInfoCard label="Make" value={appointmentFormData?.carData?.make} />
            <VehicleInfoCard label="Model" value={appointmentFormData?.carData?.model} />
            <VehicleInfoCard label="Year" value={appointmentFormData?.carData?.year} />
            <VehicleInfoCard label="Location" value={appointmentFormData?.carData?.location || 'Not specified'} />
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

        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Appointment Created Successfully!</h4>
                <p className="text-green-300 text-sm">Redirecting to your status page...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && !isSuccess && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-1">Error Creating Appointment</h4>
                <p className="text-red-300 text-sm">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || isSuccess}
            className={`relative px-20 py-3 rounded-xl text-text-primary text-lg font-semibold transition-all duration-200 ${
              isSuccess
                ? 'bg-green-600 cursor-default'
                : isSubmitting 
                ? 'opacity-70 cursor-not-allowed bg-gray-600' 
                : 'animated-button-primary hover:scale-105'
            }`}
          >
            {isSuccess ? (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Appointment Created!
              </>
            ) : isSubmitting ? (
              <>
                <svg className="w-5 h-5 mr-2 inline animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Appointment...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm & Submit
              </>
            )}
          </button>
        </div>
          
        {/* Back Button */}
        <div className="flex justify-start mt-6">
          <motion.button
            onClick={handleBack}
            disabled={isSubmitting || isSuccess}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group backdrop-blur-sm ${
              isSubmitting || isSuccess
                ? 'opacity-50 cursor-not-allowed text-text-secondary' 
                : 'text-text-secondary hover:text-text-primary hover:bg-card-primary/50'
            }`}
            whileHover={isSubmitting || isSuccess ? {} : { x: -4 }}
            whileTap={isSubmitting || isSuccess ? {} : { scale: 0.95 }}
          >
            <svg className={`w-5 h-5 transition-transform duration-200 ${
              isSubmitting || isSuccess ? '' : 'group-hover:-translate-x-1'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Slot Selection
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default BookingConfirmationPage;
