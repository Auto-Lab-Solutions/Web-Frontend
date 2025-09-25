import React, { useState, useEffect } from "react"
import { useGlobalData } from '../components/contexts/GlobalDataContext'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import FormField from "@/components/common/FormField"
import FormSection from "@/components/common/FormSection"
import AppointmentStepIndicator from "@/components/common/AppointmentStepIndicator"
import { useMobileInputStyling } from "../hooks/useMobileOptimization"
import { getPlansAndPricingUrl, isInspectionService } from "@/meta/menu"
import BackArrow from '@/components/common/BackArrow'
import { getPerthCurrentDateTime } from '../utils/timezoneUtils'

function BookingFormPage() {
  const navigate = useNavigate()
  const { appointmentFormData, updateAppointmentFormData } = useGlobalData()
  const [errors, setErrors] = useState({})
  const [isBuyer, setIsBuyer] = useState(true) // Toggle state

  // Check if current service is an inspection service
  const isInspection = isInspectionService(appointmentFormData?.serviceId)

  // Apply mobile input optimizations
  useMobileInputStyling();

  // Validation helper functions to match backend
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const validatePhoneNumber = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    // Remove spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Allow international format starting with + or domestic format
    const phonePattern = /^(\+\d{1,3})?\d{7,15}$/;
    return phonePattern.test(cleanPhone);
  };

  const validateYear = (year) => {
    try {
      const yearInt = parseInt(year);
      const currentYear = getPerthCurrentDateTime().getFullYear();
      if (isNaN(yearInt) || yearInt < 1900 || yearInt > currentYear + 1) {
        return { isValid: false, message: `Year must be between 1900 and ${currentYear + 1}` };
      }
      return { isValid: true, message: "" };
    } catch (error) {
      return { isValid: false, message: "Year must be a valid number" };
    }
  };

  const [clientData, setClientData] = useState({
    isBuyer: true,
    buyerName: "",
    buyerEmail: "",
    buyerPhoneNumber: "",
    carMake: "",
    carModel: "",
    carYear: "",
    carLocation: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhoneNumber: "",
    notes: "",
  })

  useEffect(() => {
    setClientData({
      isBuyer: appointmentFormData.isBuyer || true,
      buyerName: appointmentFormData.buyerData?.name || "",
      buyerEmail: appointmentFormData.buyerData?.email || "",
      buyerPhoneNumber: appointmentFormData.buyerData?.phoneNumber || "",
      carMake: appointmentFormData.carData?.make || "",
      carModel: appointmentFormData.carData?.model || "",
      carYear: appointmentFormData.carData?.year || "",
      carLocation: appointmentFormData.carData?.location || "",
      sellerName: appointmentFormData.sellerData?.name || "",
      sellerEmail: appointmentFormData.sellerData?.email || "",
      sellerPhoneNumber: appointmentFormData.sellerData?.phoneNumber || "",
      notes: appointmentFormData.notes || "",
    })
    // For non-inspection services, always set as buyer (customer)
    const initialIsBuyer = isInspection ? (appointmentFormData.isBuyer || true) : true
    setIsBuyer(initialIsBuyer)
  }, [appointmentFormData, isInspection])

  if (!appointmentFormData || !appointmentFormData?.serviceId || !appointmentFormData?.planId) {
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setClientData((prev) => ({ ...prev, [name]: value }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    
    // Real-time validation for specific fields
    if ((name === 'buyerEmail' || name === 'sellerEmail') && value) {
      if (!validateEmail(value)) {
        setErrors((prev) => ({ ...prev, [name]: 'Please enter a valid email address' }))
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }))
      }
    }

    if ((name === 'buyerPhoneNumber' || name === 'sellerPhoneNumber') && value) {
      if (!validatePhoneNumber(value)) {
        setErrors((prev) => ({ ...prev, [name]: 'Please enter a valid phone number (7-15 digits, optional +country code)' }))
      } else {
        setErrors((prev) => ({ ...prev, [name]: '' }))
      }
    }

    if (name === 'carYear' && value) {
      const yearValidation = validateYear(value)
      if (!yearValidation.isValid) {
        setErrors((prev) => ({ ...prev, carYear: yearValidation.message }))
      } else {
        setErrors((prev) => ({ ...prev, carYear: '' }))
      }
    }
  }

  const handleToggleChange = (buyerStatus) => {
    setIsBuyer(buyerStatus)
    setClientData((prev) => ({ ...prev, isBuyer: buyerStatus }))
  }

  const isFormValid = () => {
    // Helper function to validate year
    const isValidYear = (year) => {
      if (!year) return false
      const yearNum = parseInt(year)
      const currentYear = getPerthCurrentDateTime().getFullYear()
      return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1
    }

    const hasValidCarData = clientData.carMake && clientData.carModel && isValidYear(clientData.carYear)

    // For non-inspection services, only customer (buyer) data is required
    if (!isInspection) {
      return clientData.buyerName && clientData.buyerEmail && clientData.buyerPhoneNumber && hasValidCarData
    }

    // For inspection services, validate based on buyer/seller toggle
    if (isBuyer) {
      return clientData.buyerName && clientData.buyerEmail && clientData.buyerPhoneNumber && hasValidCarData
    } else {
      return clientData.sellerName && clientData.sellerEmail && clientData.sellerPhoneNumber && hasValidCarData
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // For non-inspection services, always validate customer (buyer) data
    const validateBuyer = !isInspection || isBuyer
    const validateSeller = isInspection && !isBuyer

    if (validateBuyer) {
      if (!clientData.buyerName || !clientData.buyerName.trim()) {
        newErrors.buyerName = "Name is required"
      }
      if (!clientData.buyerEmail || !clientData.buyerEmail.trim()) {
        newErrors.buyerEmail = "Email is required"
      } else if (!validateEmail(clientData.buyerEmail)) {
        newErrors.buyerEmail = "Please enter a valid email address"
      }
      if (!clientData.buyerPhoneNumber || !clientData.buyerPhoneNumber.trim()) {
        newErrors.buyerPhoneNumber = "Phone number is required"
      } else if (!validatePhoneNumber(clientData.buyerPhoneNumber)) {
        newErrors.buyerPhoneNumber = "Please enter a valid phone number (7-15 digits, optional +country code)"
      }
    }

    if (validateSeller) {
      if (!clientData.sellerName || !clientData.sellerName.trim()) {
        newErrors.sellerName = "Name is required"
      }
      if (!clientData.sellerEmail || !clientData.sellerEmail.trim()) {
        newErrors.sellerEmail = "Email is required"
      } else if (!validateEmail(clientData.sellerEmail)) {
        newErrors.sellerEmail = "Please enter a valid email address"
      }
      if (!clientData.sellerPhoneNumber || !clientData.sellerPhoneNumber.trim()) {
        newErrors.sellerPhoneNumber = "Phone number is required"
      } else if (!validatePhoneNumber(clientData.sellerPhoneNumber)) {
        newErrors.sellerPhoneNumber = "Please enter a valid phone number (7-15 digits, optional +country code)"
      }
    }

    // Car fields (always required)
    if (!clientData.carMake || !clientData.carMake.trim()) {
      newErrors.carMake = "Make is required"
    }
    if (!clientData.carModel || !clientData.carModel.trim()) {
      newErrors.carModel = "Model is required"
    }
    if (!clientData.carYear || !clientData.carYear.trim()) {
      newErrors.carYear = "Year is required"
    } else {
      const yearValidation = validateYear(clientData.carYear)
      if (!yearValidation.isValid) {
        newErrors.carYear = yearValidation.message
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    updateAppointmentFormData({
      ...appointmentFormData,
      isBuyer: isInspection ? isBuyer : true, // Always true for non-inspection services
      buyerData: {
        name: clientData.buyerName.trim(),
        email: clientData.buyerEmail.trim(),
        phoneNumber: clientData.buyerPhoneNumber.trim(),
      },
      carData: {
        make: clientData.carMake.trim(),
        model: clientData.carModel.trim(),
        year: clientData.carYear.trim(),
        location: clientData.carLocation.trim(),
      },
      sellerData: {
        name: clientData.sellerName.trim(),
        email: clientData.sellerEmail.trim(),
        phoneNumber: clientData.sellerPhoneNumber.trim(),
      },
      notes: clientData.notes.trim(),
    })

    navigate('/slot-selection')
  }

  return (
    <TooltipProvider>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20 relative">
        <BackArrow to={() => navigate(getPlansAndPricingUrl(appointmentFormData.serviceId))} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-4">
            <h1 className="sm:text-4xl text-3xl font-bold mb-2 bg-text-primary bg-clip-text text-transparent">
              Vehicle & Contact Details
            </h1>
            <p className="text-text-secondary sm:text-lg text-base">
              Please provide your information and vehicle details for the Appointment.
            </p>
          </div>
          
          {/* Step Indicator */}
          <AppointmentStepIndicator currentStep={2} className="mb-8" />

          {/* TOGGLE BUTTON - Only show for inspection services */}
          {isInspection && (
            <div className="flex justify-center mb-8">
              <div className="bg-card-primary rounded-3xl p-1 border border-border-primary shadow-lg">
                <Button
                  type="button"
                  onClick={() => handleToggleChange(true)}
                  className={`px-6 py-2 rounded-2xl transition-all duration-300 font-semibold
                    ${
                      isBuyer
                        ? "bg-highlight-primary text-text-tertiary shadow-lg transform scale-105 ml-1"
                        : "bg-transparent text-text-secondary hover:bg-gray-800/50 hover:text-text-primary"
                    }`}
                >
                  I'm the Buyer
                </Button>
                <Button
                  type="button"
                  onClick={() => handleToggleChange(false)}
                  className={`px-6 py-2 rounded-2xl transition-all duration-300 font-semibold
                    ${
                      !isBuyer
                        ? "bg-highlight-primary text-text-tertiary shadow-lg transform scale-105 mr-1"
                        : "bg-transparent text-text-secondary hover:bg-gray-800/50 hover:text-text-primary"
                    }`}
                >
                  I'm the Seller
                </Button>
              </div>
            </div>
          )}

          <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
            <CardContent className="p-4 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                  {/* Customer/Buyer Info */}
                  <FormSection title={isInspection ? "Buyer Information" : "Customer Information"}>
                    {!isBuyer && isInspection && (
                      <div className="mb-4 p-3 bg-card-secondary/50 border border-border-secondary rounded-lg backdrop-blur-sm">
                        <p className="text-sm text-text-secondary">
                          <svg className="w-4 h-4 inline mr-2 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          This section is optional. You may skip these fields if buyer information is not available at this time.
                        </p>
                      </div>
                    )}
                    <div className="grid gap-4 sm:gap-6">
                      <FormField
                        id="buyerName"
                        name="buyerName"
                        label="Full Name"
                        value={clientData.buyerName}
                        onChange={handleChange}
                        error={errors.buyerName}
                        required={isInspection ? isBuyer : true}
                        tooltip={isInspection ? (isBuyer ? "Enter your first and last name" : "Enter the buyer's first and last name") : "Enter your first and last name"}
                        placeholder="e.g., John Smith"
                      />
                      <FormField
                        id="buyerEmail"
                        name="buyerEmail"
                        label="Email Address"
                        type="email"
                        value={clientData.buyerEmail}
                        onChange={handleChange}
                        error={errors.buyerEmail}
                        required={isInspection ? isBuyer : true}
                        tooltip={isInspection ? (isBuyer ? "Enter your email address" : "Enter the buyer's email address") : "Enter your email address"}
                        placeholder="john.smith@example.com"
                      />
                      <FormField
                        id="buyerPhoneNumber"
                        name="buyerPhoneNumber"
                        label="Phone Number"
                        type="tel"
                        value={clientData.buyerPhoneNumber}
                        onChange={handleChange}
                        error={errors.buyerPhoneNumber}
                        required={isInspection ? isBuyer : true}
                        tooltip={isInspection ? (isBuyer ? "Enter your phone number" : "Enter the buyer's phone number") : "Enter your phone number"}
                        placeholder="+61 412 345 678"
                      />
                    </div>
                  </FormSection>

                  {/* Seller Info - Only show for inspection services */}
                  {isInspection && (
                    <FormSection title="Seller Information">
                      {isBuyer && (
                        <div className="mb-4 p-3 bg-card-secondary/50 border border-border-secondary rounded-lg backdrop-blur-sm">
                          <p className="text-sm text-text-secondary">
                            <svg className="w-4 h-4 inline mr-2 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            This section is optional. You may skip these fields if seller information is not available at this time.
                          </p>
                        </div>
                      )}
                      <div className="grid gap-4 sm:gap-6">
                        <FormField
                          id="sellerName"
                          name="sellerName"
                          label="Full Name"
                          value={clientData.sellerName}
                          onChange={handleChange}
                          error={errors.sellerName}
                          required={!isBuyer}
                          tooltip={!isBuyer ? "Enter your first and last name" : "Enter the seller's first and last name"}
                          placeholder="e.g., Jane Doe"
                        />
                        <FormField
                          id="sellerEmail"
                          name="sellerEmail"
                          label="Email Address"
                          type="email"
                          value={clientData.sellerEmail}
                          onChange={handleChange}
                          error={errors.sellerEmail}
                          required={!isBuyer}
                          tooltip={!isBuyer ? "Enter your email address" : "Enter the seller's email address"}
                          placeholder="jane.doe@example.com"
                        />
                        <FormField
                          id="sellerPhoneNumber"
                          name="sellerPhoneNumber"
                          label="Phone Number"
                          type="tel"
                          value={clientData.sellerPhoneNumber}
                          onChange={handleChange}
                          error={errors.sellerPhoneNumber}
                          required={!isBuyer}
                          tooltip={!isBuyer ? "Enter your phone number" : "Enter the seller's phone number"}
                          placeholder="+61 423 456 789"
                        />
                      </div>
                    </FormSection>
                  )}
                </div>

                {/* Car Info */}
                <FormSection title="Vehicle Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <FormField
                      id="carMake"
                      name="carMake"
                      label="Make"
                      value={clientData.carMake}
                      onChange={handleChange}
                      error={errors.carMake}
                      required={true}
                      tooltip="Vehicle manufacturer (e.g., Toyota, Honda, BMW)"
                      placeholder="e.g., Toyota"
                    />
                    <FormField
                      id="carModel"
                      name="carModel"
                      label="Model"
                      value={clientData.carModel}
                      onChange={handleChange}
                      error={errors.carModel}
                      required={true}
                      tooltip="Specific model name (e.g., Camry, Civic, 3 Series)"
                      placeholder="e.g., Camry"
                    />
                    <FormField
                      id="carYear"
                      name="carYear"
                      label="Year"
                      type="text"
                      value={clientData.carYear}
                      onChange={handleChange}
                      error={errors.carYear}
                      required={true}
                      tooltip="Manufacturing year of the vehicle"
                      placeholder="e.g., 2008"
                      pattern="[0-9]{4}"
                      inputMode="numeric"
                    />
                    <div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="carLocation" className="text-text-primary font-medium text-base">
                            Vehicle Location
                          </Label>
                        </div>
                        <div className="mb-2 p-2 bg-card-secondary/30 border border-border-secondary rounded-md backdrop-blur-sm">
                          <p className="text-xs text-text-secondary">
                            <svg className="w-3 h-3 inline mr-1 text-text-tertiary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            This field is optional if our mechanics will not need to visit your specified location for the appointment.
                          </p>
                        </div>
                        <div className="relative">
                          <Input 
                            id="carLocation"
                            name="carLocation"
                            type="text"
                            value={clientData.carLocation}
                            onChange={handleChange}
                            className="transition-all duration-200 focus:ring-2 focus:ring-border-tertiary/20 border-border-secondary hover:border-border-tertiary/50 focus:border-border-tertiary pr-10"
                            placeholder="e.g., Perth, WA or 123 Main St, Suburb, State"
                          />
                          <div className="hidden md:block">
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-border-primary text-white text-xs flex items-center justify-center cursor-help hover:bg-border-secondary transition-colors"
                              title="Where the vehicle is located for inspection scheduling"
                            >
                              ?
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Notes */}
                <FormSection title="Additional Information">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="notes" className="text-text-primary font-medium text-base">
                        Special Notes or Requests
                      </Label>
                    </div>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      value={clientData.notes} 
                      onChange={handleChange} 
                      rows={4} 
                      placeholder="Any specific concerns, requests, or information about the vehicle or appointment..."
                      className="w-full rounded-lg border border-border-secondary px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-border-tertiary/20 focus:border-border-tertiary resize-none transition-all duration-200 hover:border-border-tertiary/50 min-h-[2.75rem]" 
                    />
                  </div>
                </FormSection>

                <div className="my-6 sm:my-0">
                  <p>
                    <span className="text-red-500">*</span> Required Fields
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: isFormValid() ? 1.01 : 1 }}
                  whileTap={{ scale: isFormValid() ? 0.99 : 1 }}
                  className="flex justify-center mt-0"
                >
                  <button
                    type="submit" 
                    disabled={!isFormValid()}
                    className={`px-7 py-3 rounded-xl text-lg font-semibold transition-all duration-200 transform ${
                      isFormValid()
                        ? 'animated-button-primary'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to TimeSlots →
                  </button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-start mt-6">
            <motion.button
              onClick={() => navigate(getPlansAndPricingUrl(appointmentFormData.serviceId))}
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm shadow-sm hover:shadow border border-border-secondary"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Plan Selection
            </motion.button>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

export default BookingFormPage
