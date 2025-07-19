import React, { useEffect} from "react";
import { useGlobalData } from "../components/contexts/GlobalDataContext";
import { getServiceById, getPlanById } from "../meta/menu";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="bg-gray-50 min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Details</h1>

        <Card>
          <CardContent className="space-y-8 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Booking Summary</h2>
              <p className="text-gray-600">
                Service: {getServiceById(appointmentFormData?.serviceId)?.name} <br />
                Plan: {getPlanById(appointmentFormData?.serviceId, appointmentFormData?.planId)?.name} <br />
              </p>
              <div className="flex flex-col items-center justify-center mt-4">
                {
                  appointmentFormData.selectedSlots.map((slot, index) => (
                    <span key={index}>
                      {slot.date} from {slot.start} to {slot.end}
                    </span>
                  ))
                }
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Buyer Information</h2>
                <p><strong>Name:</strong> {appointmentFormData?.buyerData?.name}</p>
                <p><strong>Email:</strong> {appointmentFormData?.buyerData?.email}</p>
                <p><strong>Phone:</strong> {appointmentFormData?.buyerData?.phoneNumber}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
                <p><strong>Name:</strong> {appointmentFormData?.sellerData?.name}</p>
                <p><strong>Email:</strong> {appointmentFormData?.sellerData?.email}</p>
                <p><strong>Phone:</strong> {appointmentFormData?.sellerData?.phoneNumber}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Car Information</h2>
              <p><strong>Make:</strong> {appointmentFormData?.carData?.make}</p>
              <p><strong>Model:</strong> {appointmentFormData?.carData?.model}</p>
              <p><strong>Year:</strong> {appointmentFormData?.carData?.year}</p>
              <p><strong>Location:</strong> {appointmentFormData?.carData?.location}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <p>{appointmentFormData?.notes || "N/A"}</p>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleConfirm}>Confirm & Submit</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
