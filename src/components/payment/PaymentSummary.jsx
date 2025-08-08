import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { 
  User, 
  Car, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { getServiceById, getPlanById, getCategoryById, getItemById } from '../../meta/menu';

const PaymentSummary = ({ paymentData }) => {
  const InfoItem = ({ icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="w-5 h-5 text-text-tertiary mt-0.5 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary font-medium">{label}</p>
        <p className="text-text-primary font-semibold break-words">{value}</p>
      </div>
    </div>
  );

  const SectionCard = ({ title, icon, children, className = '' }) => (
    <Card className={`bg-card-secondary border border-border-secondary ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-text-tertiary">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
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
            label="Booked Date"
            value={formatDate(paymentData.createdAt)}
          />
        </SectionCard>

        {/* Vehicle Information */}
        <SectionCard
          title="Vehicle Details"
          icon={<Car />}
          className="mb-6"
        >
          <InfoItem
            icon={<Car />}
            label="Make & Model"
            value={`${paymentData.vehicleInfo.make} ${paymentData.vehicleInfo.model}`}
          />
          <InfoItem
            icon={<Calendar />}
            label="Year"
            value={paymentData.vehicleInfo.year}
          />
          <InfoItem
            icon={<MapPin />}
            label="Location"
            value={paymentData.vehicleInfo.location || 'Not specified'}
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
                <div key={index} className="bg-background-secondary/50 rounded-lg p-3 border border-border-secondary">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{itemData?.name || 'Unknown Item'}</h4>
                      <p className="text-sm text-text-secondary">{category?.name || 'Unknown Category'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">AUD ${(item.totalPrice || 0).toFixed(2)}</p>
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

        {/* Vehicle Information */}
        <SectionCard
          title="Vehicle Details"
          icon={<Car />}
          className="mb-6"
        >
          <InfoItem
            icon={<Car />}
            label="Make & Model"
            value={`${paymentData.vehicleInfo.make} ${paymentData.vehicleInfo.model}`}
          />
          <InfoItem
            icon={<Calendar />}
            label="Year"
            value={paymentData.vehicleInfo.year}
          />
          {paymentData.deliveryLocation && (
            <InfoItem
              icon={<MapPin />}
              label="Delivery Location"
              value={paymentData.deliveryLocation}
            />
          )}
        </SectionCard>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary Header */}
      <Card className="bg-card-primary border border-border-primary shadow-xl">
        <CardHeader className="pb-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Payment Summary</h2>
            <p className="text-text-secondary">{paymentData.description}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg p-4 border border-blue-500/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-text-secondary font-medium">Reference Number</p>
                <p className="text-lg font-bold text-text-primary">{paymentData.referenceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-text-secondary font-medium">Amount Due</p>
                <p className="text-3xl font-bold text-highlight-primary">
                  AUD ${paymentData.amount.toFixed(2)}
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
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-medium text-blue-400">
              Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default PaymentSummary;
