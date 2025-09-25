import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { 
  User, 
  Package, 
  Calendar, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../../meta/menu';
import { formatPerthDateTime } from '../../utils/timezoneUtils';

const PaymentSummary = ({ paymentData }) => {
  const InfoItem = ({ icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-5 h-5 text-primary mt-0.5 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary font-medium">{label}</p>
        <p className="text-text-primary font-semibold break-words">{value}</p>
      </div>
    </div>
  );

  const SectionCard = ({ title, icon, children, className = '' }) => (
    <Card className={`bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-primary">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const formatTimeslot = (paymentData) => {
    if (!paymentData.scheduledDate) return 'Not scheduled';
    
    try {
      // If we have scheduledTimeSlot with start and end times
      if (paymentData.scheduledTimeSlot && paymentData.scheduledTimeSlot.start && paymentData.scheduledTimeSlot.end) {
        // Format just the date part without time
        const date = new Date(paymentData.scheduledDate);
        const dateStr = date.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        return `${dateStr}, ${paymentData.scheduledTimeSlot.start} - ${paymentData.scheduledTimeSlot.end}`;
      }
      
      // If we have selectedSlots array, use the first slot
      if (paymentData.selectedSlots && paymentData.selectedSlots.length > 0) {
        const slot = paymentData.selectedSlots[0];
        if (slot.start && slot.end) {
          const date = new Date(slot.date || paymentData.scheduledDate);
          const dateStr = date.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          return `${dateStr}, ${slot.start} - ${slot.end}`;
        }
      }
      
      // Fallback to just the date if no time slot information is available
      const date = new Date(paymentData.scheduledDate);
      const dateStr = date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${dateStr} (Time TBD)`;
      
    } catch (error) {
      console.error('Error formatting timeslot:', error);
      return 'Schedule information unavailable';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      
      // Handle different date formats
      if (typeof dateString === 'number') {
        // If it's a number, treat as timestamp
        // Check if it's in seconds (Unix timestamp) or milliseconds
        if (dateString < 10000000000) {
          // Likely seconds, convert to milliseconds
          date = new Date(dateString * 1000);
        } else {
          // Already in milliseconds
          date = new Date(dateString);
        }
      } else if (typeof dateString === 'string') {
        // Handle string dates
        if (dateString.includes('T') || dateString.includes('Z')) {
          // ISO format
          date = new Date(dateString);
        } else if (dateString.match(/^\d+$/)) {
          // String that's all numbers (timestamp as string)
          const timestamp = parseInt(dateString);
          // Use a higher threshold: 100000000000 (March 2973) to distinguish seconds vs milliseconds
          // Timestamps in seconds for current era will be < 100000000000
          // Timestamps in milliseconds for current era will be > 100000000000
          if (timestamp < 100000000000) {
            date = new Date(timestamp * 1000);
          } else {
            date = new Date(timestamp);
          }
        } else {
          // Other string format
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date parsed from:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    } catch (error) {
      console.error('Error formatting date:', error, 'Original value:', dateString);
      return 'Date unavailable';
    }
  };

  const renderAppointmentDetails = () => {
    const service = getServiceById(paymentData.serviceId);
    const plan = getPlanById(paymentData.serviceId, paymentData.planId);

    return (
      <>
        {/* Service Information */}
        <SectionCard
          title="Service Details"
          icon={<Settings />}
          className="mb-6"
        >
          <InfoItem
            icon={<CheckCircle />}
            label="Service Type"
            value={paymentData.title || 'Vehicle Inspection'}
          />
          <InfoItem
            icon={<Package />}
            label="Plan"
            value={paymentData.subtitle || 'Standard Plan'}
          />
          <InfoItem
            icon={<Calendar />}
            label="Scheduled Timeslot"
            value={formatTimeslot(paymentData)}
          />
        </SectionCard>
      </>
    );
  };

  const renderOrderDetails = () => {
    return (
      <>
        {/* Order Items */}
        <SectionCard
          title="Order Items"
          icon={<Package />}
          className="mb-6"
        >
          <div className="space-y-3">
            {paymentData.items.map((item, index) => {
              const category = getCategoryById(item.categoryId);
              const itemData = getItemById(item.categoryId, item.itemId);
              
              return (
                <div key={index} className="bg-background-secondary/30 rounded-lg p-4 border border-border-secondary">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{itemData?.name || 'Unknown Item'}</h4>
                      <p className="text-sm text-text-secondary">{category?.name || 'Unknown Category'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-highlight-primary">AUD {(item.totalPrice || 0).toFixed(2)}</p>
                      <p className="text-sm text-text-secondary">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  {itemData?.description && (
                    <p className="text-xs text-text-secondary mt-2">{itemData.description}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-border-secondary pt-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-primary">Total Items:</span>
              <span className="font-semibold text-text-primary">{paymentData.items.length}</span>
            </div>
          </div>
        </SectionCard>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary Header */}
      <Card className="bg-card-primary border border-border-primary shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Summary</h2>
            <p className="text-text-secondary">{paymentData.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 rounded-lg p-4 border border-border-secondary">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <div>
                <p className="text-text-secondary font-medium">Reference Number</p>
                <p className="text-lg font-bold text-text-primary">{paymentData.referenceNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-text-secondary font-medium">Amount Due</p>
                <p className="text-3xl font-bold text-highlight-primary">
                  AUD {paymentData.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <SectionCard
        title="Customer Information"
        icon={<User />}
        className="mb-6"
      >
        <InfoItem
          icon={<User />}
          label="Name"
          value={paymentData.customerInfo.name}
        />
        <InfoItem
          icon={<Mail />}
          label="Email"
          value={paymentData.customerInfo.email}
        />
        <InfoItem
          icon={<Phone />}
          label="Phone"
          value={paymentData.customerInfo.phone}
        />
      </SectionCard>

      {/* Render specific details based on type */}
      {paymentData.type === 'appointment' && renderAppointmentDetails()}
      {paymentData.type === 'order' && renderOrderDetails()}

      {/* Payment Information */}
      <SectionCard
        title="Payment Information"
        icon={<Clock />}
      >
        <InfoItem
          icon={<Calendar />}
          label="Created Date"
          value={formatDate(paymentData.createdAt)}
        />
        <InfoItem
          icon={<Package />}
          label="Payment Type"
          value={paymentData.type === 'appointment' ? 'Service Payment' : 'Product Order'}
        />
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm font-medium text-green-400">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default PaymentSummary;
