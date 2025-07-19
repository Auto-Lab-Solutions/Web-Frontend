import React, { useState, useEffect } from "react"
import { useFormData } from '../components/contexts/GlobalDataContext'
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function BookingFormPage() {
  const navigate = useNavigate()
  const { formData, getFormData, updateFormData } = useFormData()
  const [errors, setErrors] = useState({})
  const [isBuyer, setIsBuyer] = useState(true) // Toggle state

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
    const prevFormData = getFormData()
    updateFormData(prevFormData)
    setClientData({
      isBuyer: prevFormData.isBuyer || true,
      buyerName: prevFormData.buyerData?.name || "",
      buyerEmail: prevFormData.buyerData?.email || "",
      buyerPhoneNumber: prevFormData.buyerData?.phoneNumber || "",
      carMake: prevFormData.carData?.make || "",
      carModel: prevFormData.carData?.model || "",
      carYear: prevFormData.carData?.year || "",
      carLocation: prevFormData.carData?.location || "",
      sellerName: prevFormData.sellerData?.name || "",
      sellerEmail: prevFormData.sellerData?.email || "",
      sellerPhoneNumber: prevFormData.sellerData?.phoneNumber || "",
      notes: prevFormData.notes || "",
    })
  }, [])

  if (!formData.serviceId || !formData.planId) {
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setClientData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (isBuyer) {
      if (!clientData.buyerName) newErrors.buyerName = "Name is required"
      if (!clientData.buyerEmail) newErrors.buyerEmail = "Email is required"
      if (!clientData.buyerPhoneNumber) newErrors.buyerPhoneNumber = "Phone number is required"
    } else {
      if (!clientData.sellerName) newErrors.sellerName = "Name is required"
      if (!clientData.sellerEmail) newErrors.sellerEmail = "Email is required"
      if (!clientData.sellerPhoneNumber) newErrors.sellerPhoneNumber = "Phone number is required"
    }

    // Car fields (always required)
    if (!clientData.carMake) newErrors.carMake = "Make is required"
    if (!clientData.carModel) newErrors.carModel = "Model is required"
    if (!clientData.carYear) newErrors.carYear = "Year is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    updateFormData({
      ...formData,
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
    <div className="bg-gray-50 min-h-screen px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Vehicle & Contact Details</h1>

        {/* TOGGLE BUTTON */}
        <div className="flex justify-center mb-6 space-x-2">
          <Button
            type="button"
            variant={isBuyer ? "default" : "outline"}
            onClick={() => setIsBuyer(true)}
            className="rounded-l-lg px-6"
          >
            I'm the Buyer
          </Button>
          <Button
            type="button"
            variant={!isBuyer ? "default" : "outline"}
            onClick={() => setIsBuyer(false)}
            className="rounded-r-lg px-6"
          >
            I'm the Seller
          </Button>
        </div>

        <Card>
          <CardContent className="space-y-10 p-6">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buyer Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Buyer Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="buyerName">Name {isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="buyerName" name="buyerName" value={clientData.buyerName} onChange={handleChange} className={errors.buyerName ? "border-red-500" : ""} />
                    {errors.buyerName && <p className="text-red-500 text-sm">{errors.buyerName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerEmail">Email {isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="buyerEmail" name="buyerEmail" type="email" value={clientData.buyerEmail} onChange={handleChange} className={errors.buyerEmail ? "border-red-500" : ""} />
                    {errors.buyerEmail && <p className="text-red-500 text-sm">{errors.buyerEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerPhoneNumber">Phone Number {isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="buyerPhoneNumber" name="buyerPhoneNumber" type="tel" value={clientData.buyerPhoneNumber} onChange={handleChange} className={errors.buyerPhoneNumber ? "border-red-500" : ""} />
                    {errors.buyerPhoneNumber && <p className="text-red-500 text-sm">{errors.buyerPhoneNumber}</p>}
                  </div>
                </div>

                {/* Seller Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Seller Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Name {!isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="sellerName" name="sellerName" value={clientData.sellerName} onChange={handleChange} className={errors.sellerName ? "border-red-500" : ""} />
                    {errors.sellerName && <p className="text-red-500 text-sm">{errors.sellerName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerEmail">Email {!isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="sellerEmail" name="sellerEmail" type="email" value={clientData.sellerEmail} onChange={handleChange} className={errors.sellerEmail ? "border-red-500" : ""} />
                    {errors.sellerEmail && <p className="text-red-500 text-sm">{errors.sellerEmail}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerPhoneNumber">Phone Number {!isBuyer && <span className="text-red-500">*</span>}</Label>
                    <Input id="sellerPhoneNumber" name="sellerPhoneNumber" type="tel" value={clientData.sellerPhoneNumber} onChange={handleChange} className={errors.sellerPhoneNumber ? "border-red-500" : ""} />
                    {errors.sellerPhoneNumber && <p className="text-red-500 text-sm">{errors.sellerPhoneNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Car Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Car Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="carMake">Make <span className="text-red-500">*</span></Label>
                    <Input id="carMake" name="carMake" value={clientData.carMake} onChange={handleChange} className={errors.carMake ? "border-red-500" : ""} />
                    {errors.carMake && <p className="text-red-500 text-sm">{errors.carMake}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carModel">Model <span className="text-red-500">*</span></Label>
                    <Input id="carModel" name="carModel" value={clientData.carModel} onChange={handleChange} className={errors.carModel ? "border-red-500" : ""} />
                    {errors.carModel && <p className="text-red-500 text-sm">{errors.carModel}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carYear">Year <span className="text-red-500">*</span></Label>
                    <Input id="carYear" name="carYear" type="number" value={clientData.carYear} onChange={handleChange} className={errors.carYear ? "border-red-500" : ""} />
                    {errors.carYear && <p className="text-red-500 text-sm">{errors.carYear}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carLocation">Location</Label>
                    <Input id="carLocation" name="carLocation" value={clientData.carLocation} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Additional Notes</h2>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea id="notes" name="notes" value={clientData.notes} onChange={handleChange} rows={5} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 resize-none" />
                </div>
              </div>

              <Button type="submit" className="w-full">Go to Slot Selection</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default BookingFormPage
