import React from 'react';
import { Clock, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

/**
 * PendingStatusMessage Component
 * 
 * Displays an informative message for appointments in pending status
 * to help customers understand what happens next in the review process.
 * - For 'compact' variant (StatusPage): Only displays when user has exactly 1 appointment
 * - For 'full' variant (AppointmentPage): Always displays regardless of appointment count
 * 
 * @param {Object} props
 * @param {string} props.variant - Display variant: 'full' (detailed card) or 'compact' (inline message)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.totalAppointments - Total number of appointments created by the user
 */
const PendingStatusMessage = ({ variant = 'full', className = '', totalAppointments = 1 }) => {
  // Only apply the appointment count restriction for compact variant (StatusPage)
  if (variant === 'compact' && totalAppointments !== 1) {
    return null;
  }
  const steps = [
    {
      icon: <Info className="w-4 h-4" />,
      text: "Your appointment request has been received"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: "Our team is reviewing your details and availability"
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      text: "You'll receive confirmation within one business hour"
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold mb-1">What happens next?</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Our team is reviewing your appointment request and will confirm your booking within one business hour. 
              You'll be notified via email or phone once your preferred time slot is confirmed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-card-primary border border-blue-500/20 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-full">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-400">What happens next?</h3>
            <p className="text-text-secondary text-sm">Your appointment is under review</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-full flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span className="text-blue-400">{step.icon}</span>
                <span>{step.text}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <p className="text-text-secondary text-sm leading-relaxed">
            <strong className="text-text-primary">Expected response time:</strong> Within one business hour during our operating hours (Monday-Friday, 9 AM - 6 PM). 
            For requests submitted outside business hours also, we try to respond as soon as possible.
          </p>
        </div>
        
        <div className="mt-3 p-3 bg-background-secondary/50 rounded-lg border border-border-secondary">
          <p className="text-text-secondary text-xs">
            <strong className="text-text-primary">Need immediate assistance?</strong> Contact our support team directly for urgent requests or questions about your appointment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingStatusMessage;