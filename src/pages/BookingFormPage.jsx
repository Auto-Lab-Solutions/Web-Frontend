import React, { useState, useEffect } from "react"
import { useGlobalData } from '../components/contexts/GlobalDataContext'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import FormField from "@/components/common/FormField"
import FormSection from "@/components/common/FormSection"
import { useMobileInputStyling } from "../hooks/useMobileOptimization"
import { getPlansAndPricingUrl } from "@/meta/menu"

function BookingFormPage() {
  const navigate = useNavigate()
  const { appointmentFormData, updateAppointmentFormData } = useGlobalData()
  const [errors, setErrors] = useState({})
  const [isBuyer, setIsBuyer] = useState(true) // Toggle state

  // Apply mobile input optimizations
  useMobileInputStyling();

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
    setIsBuyer(appointmentFormData.isBuyer || true)
  }, [appointmentFormData])

  if (!appointmentFormData.serviceId || !appointmentFormData.planId) {
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setClientData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleChange = (buyerStatus) => {
    setIsBuyer(buyerStatus)
    setClientData((prev) => ({ ...prev, isBuyer: buyerStatus }))
  }

  const isFormValid = () => {
    if (isBuyer) {
      return clientData.buyerName && clientData.buyerEmail && clientData.buyerPhoneNumber && 
             clientData.carMake && clientData.carModel && clientData.carYear
    } else {
      return clientData.sellerName && clientData.sellerEmail && clientData.sellerPhoneNumber && 
             clientData.carMake && clientData.carModel && clientData.carYear
    }
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+]?[0-9\s\-()]*$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (isBuyer) {
      if (!clientData.buyerName) newErrors.buyerName = "Name is required"
      if (!clientData.buyerEmail) newErrors.buyerEmail = "Email is required"
      if (!clientData.buyerPhoneNumber) {
        newErrors.buyerPhoneNumber = "Phone number is required"
      } else if (!validatePhoneNumber(clientData.buyerPhoneNumber)) {
        newErrors.buyerPhoneNumber = "Phone number can only contain numbers, +, spaces, hyphens, and parentheses"
      }
    } else {
      if (!clientData.sellerName) newErrors.sellerName = "Name is required"
      if (!clientData.sellerEmail) newErrors.sellerEmail = "Email is required"
      if (!clientData.sellerPhoneNumber) {
        newErrors.sellerPhoneNumber = "Phone number is required"
      } else if (!validatePhoneNumber(clientData.sellerPhoneNumber)) {
        newErrors.sellerPhoneNumber = "Phone number can only contain numbers, +, spaces, hyphens, and parentheses"
      }
    }

    // Car fields (always required)
    if (!clientData.carMake) newErrors.carMake = "Make is required"
    if (!clientData.carModel) newErrors.carModel = "Model is required"
    if (!clientData.carYear) newErrors.carYear = "Year is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    updateAppointmentFormData({
      ...appointmentFormData,
      isBuyer,
      buyerData: {
        name: clientData.buyerName,
        email: clientData.buyerEmail,
        phoneNumber: clientData.buyerPhoneNumber,
      },
      carData: {
        make: clientData.carMake,
        model: clientData.carModel,
        year: clientData.carYear,
        location: clientData.carLocation,
      },
      sellerData: {
        name: clientData.sellerName,
        email: clientData.sellerEmail,
        phoneNumber: clientData.sellerPhoneNumber,
      },
      notes: clientData.notes,
    })

    navigate('/slot-selection')
  }

  return (
    <TooltipProvider>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-text-primary bg-clip-text text-transparent">
              Vehicle & Contact Details
            </h1>
            <p className="text-text-secondary text-lg">
              Please provide your information and vehicle details for the inspection
            </p>
          </div>

          {/* TOGGLE BUTTON */}
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

          <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Buyer Info */}
                  <FormSection title="Buyer Information">
                    <div className="grid gap-6">
                      <FormField
                        id="buyerName"
                        name="buyerName"
                        label="Full Name"
                        value={clientData.buyerName}
                        onChange={handleChange}
                        error={errors.buyerName}
                        required={isBuyer}
                        tooltip={isBuyer ? "Enter your first and last name" : "Enter the buyer's first and last name"}
                      />
                      <FormField
                        id="buyerEmail"
                        name="buyerEmail"
                        label="Email Address"
                        type="email"
                        value={clientData.buyerEmail}
                        onChange={handleChange}
                        error={errors.buyerEmail}
                        required={isBuyer}
                        tooltip={isBuyer ? "Enter your email address" : "Enter the buyer's email address"}
                      />
                      <FormField
                        id="buyerPhoneNumber"
                        name="buyerPhoneNumber"
                        label="Phone Number"
                        type="tel"
                        value={clientData.buyerPhoneNumber}
                        onChange={handleChange}
                        error={errors.buyerPhoneNumber}
                        required={isBuyer}
                        tooltip={isBuyer ? "Enter your phone number" : "Enter the buyer's phone number"}
                      />
                    </div>
                  </FormSection>

                  {/* Seller Info */}
                  <FormSection title="Seller Information">
                    <div className="grid gap-6">
                      <FormField
                        id="sellerName"
                        name="sellerName"
                        label="Full Name"
                        value={clientData.sellerName}
                        onChange={handleChange}
                        error={errors.sellerName}
                        required={!isBuyer}
                        tooltip={!isBuyer ? "Enter your first and last name" : "Enter the seller's first and last name"}
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
                      />
                    </div>
                  </FormSection>
                </div>

                {/* Car Info */}
                <FormSection title="Vehicle Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      id="carMake"
                      name="carMake"
                      label="Make"
                      value={clientData.carMake}
                      onChange={handleChange}
                      error={errors.carMake}
                      required={true}
                      tooltip="Vehicle manufacturer (e.g., Toyota, Honda, BMW)"
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
                    />
                    <FormField
                      id="carYear"
                      name="carYear"
                      label="Year"
                      type="number"
                      value={clientData.carYear}
                      onChange={handleChange}
                      error={errors.carYear}
                      required={true}
                      tooltip="Manufacturing year of the vehicle"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    <FormField
                      id="carLocation"
                      name="carLocation"
                      label="Current Location"
                      value={clientData.carLocation}
                      onChange={handleChange}
                      tooltip="Where the vehicle is located for inspection scheduling"
                      placeholder="City, State or Address"
                    />
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
                      placeholder="Any specific concerns, requests, or information about the vehicle..."
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
                    className={`px-7 sm:px-20 py-3 rounded-xl text-lg font-semibold transition-all duration-200 transform ${
                      isFormValid()
                        ? 'animated-button-primary'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to Slot Selection →
                  </button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-start mt-6">
            <motion.button
              onClick={() => navigate(getPlansAndPricingUrl(appointmentFormData.serviceId))}
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm"
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
