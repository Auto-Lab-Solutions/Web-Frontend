import React, { useEffect} from "react";
import { useFormData } from "../components/FormDataContext";
import { getServiceById, getPlanById } from "../utils/menu";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function BookingConfirmationPage() {
  const { formData, getFormData, updateFormData, clearFormData } = useFormData();
  const navigate = useNavigate();

  const handleConfirm = () => {
    // Submit to backend or next step
    console.log("Confirmed data:", formData);
    navigate("/appointments");
    clearFormData();
  };

  const handleBack = () => {
    navigate("/slot-selection");
  };

  useEffect(() => {
    const prevFormData = getFormData();
    updateFormData(prevFormData);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Confirm Your Details</h1>

        <Card>
          <CardContent className="space-y-8 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Booking Summary</h2>
              <p className="text-gray-600">
                Service: {getServiceById(formData?.serviceId)?.name} <br />
                Plan: {getPlanById(formData?.serviceId, formData?.planId)?.name} <br />
              </p>
              <div className="flex flex-col items-center justify-center mt-4">
                {
                  formData.selectedSlots.map((slot, index) => (
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
                <p><strong>Name:</strong> {formData?.buyerData?.name}</p>
                <p><strong>Email:</strong> {formData?.buyerData?.email}</p>
                <p><strong>Phone:</strong> {formData?.buyerData?.phoneNumber}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
                <p><strong>Name:</strong> {formData?.sellerData?.name}</p>
                <p><strong>Email:</strong> {formData?.sellerData?.email}</p>
                <p><strong>Phone:</strong> {formData?.sellerData?.phoneNumber}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Car Information</h2>
              <p><strong>Make:</strong> {formData?.carData?.make}</p>
              <p><strong>Model:</strong> {formData?.carData?.model}</p>
              <p><strong>Year:</strong> {formData?.carData?.year}</p>
              <p><strong>Location:</strong> {formData?.carData?.location}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <p>{formData?.notes || "N/A"}</p>
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
