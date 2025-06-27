import React, { useState, useEffect } from "react"
import { useFormData } from '../components/FormDataContext';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function BookingFormPage() {
  const navigate = useNavigate();
  const { formData, getFormData, updateFormData } = useFormData();

  const [clientData, setClientData] = useState({
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
    const prevFormData = getFormData();
    updateFormData(prevFormData);
    setClientData({
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
    });
  }, []);

  if (!formData.serviceId || !formData.planId) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Please select a service and a plan first</h2>
        <p className="text-gray-500 mb-6">
          You need to select a service and plan before booking time slots.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFormData({
      ...formData,
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
    });
    navigate('/slot-selection');
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

        <Card>
          <CardContent className="space-y-10 p-6">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Row 1: Buyer and Seller Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Buyer Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="buyerName">Full Name</Label>
                    <Input id="buyerName" name="buyerName" value={clientData.buyerName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerEmail">Email</Label>
                    <Input id="buyerEmail" name="buyerEmail" type="email" value={clientData.buyerEmail} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyerPhoneNumber">Phone Number</Label>
                    <Input id="buyerPhoneNumber" name="buyerPhoneNumber" type="tel" value={clientData.buyerPhoneNumber} onChange={handleChange} placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Seller Information</h2>
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Full Name</Label>
                    <Input id="sellerName" name="sellerName" value={clientData.sellerName} onChange={handleChange} placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerEmail">Email</Label>
                    <Input id="sellerEmail" name="sellerEmail" type="email" value={clientData.sellerEmail} onChange={handleChange} placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerPhoneNumber">Phone Number</Label>
                    <Input id="sellerPhoneNumber" name="sellerPhoneNumber" type="tel" value={clientData.sellerPhoneNumber} onChange={handleChange} placeholder="+1 987 654 321" />
                  </div>
                </div>
              </div>

              {/* Row 2: Car Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Car Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="carMake">Make</Label>
                    <Input id="carMake" name="carMake" value={clientData.carMake} onChange={handleChange} placeholder="Toyota" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carModel">Model</Label>
                    <Input id="carModel" name="carModel" value={clientData.carModel} onChange={handleChange} placeholder="Corolla" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carYear">Year</Label>
                    <Input id="carYear" name="carYear" type="number" value={clientData.carYear} onChange={handleChange} placeholder="2020" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carLocation">Location</Label>
                    <Input id="carLocation" name="carLocation" value={clientData.carLocation} onChange={handleChange} placeholder="Melbourne, VIC" />
                  </div>
                </div>
              </div>

              {/* Row 3: Notes */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Additional Notes</h2>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea id="notes" name="notes" value={clientData.notes} onChange={handleChange} placeholder="Any additional details..." rows={5} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
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

export default BookingFormPage;