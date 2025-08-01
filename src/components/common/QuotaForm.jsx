import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRestClient } from '../contexts/RestContext';
import { useGlobalData } from '../contexts/GlobalDataContext';

const QuotaForm = () => {
  const { restClient } = useRestClient();
  const { userId } = useGlobalData();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (!restClient) {
    return <div className="text-red-500">Network connection not available</div>;
  }
  if (!userId) {
    return <div className="text-red-500">User ID not initialized</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear errors for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check for empty fields
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.message.trim()) newErrors.message = "Message is required";
    
    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Validate message length
    if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      // Scroll to the top of the form to show errors
      window.scrollTo({
        top: e.target.getBoundingClientRect().top + window.scrollY - 100,
        behavior: 'smooth'
      });
      return;
    }
    
    if (!restClient) {
      alert('Network connection not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await restClient.post('inquiries', {
        inquiryData: form,
        userId: userId,
      });
      
      const data = response.data;
      setFormSubmitted(true);
      setForm({ firstName: '', lastName: '', email: '', message: '' });
      // Reset after 5 seconds
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert('An error occurred while submitting the inquiry.');
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background-secondary text-text-primary py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 items-start">
        {/* Left Side Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-1 text-center md:text-right"
        >
          <h2 className="text-3xl text-text-primary font-bold mb-4">Get in Touch</h2>
          <p className="text-text-secondary">
            Have questions or need a quote? <br /> Fill out the form and we’ll get back to you shortly.
          </p>
        </motion.div>

        {/* Form */}
        {formSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 p-6 bg-green-900/20 border border-green-800/30 rounded-lg"
          >
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-green-300">Message Sent Successfully!</h3>
            </div>
            <p className="text-text-primary ml-8">Thank you for contacting us. We will get back to you shortly.</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form Validation Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="col-span-full mb-4 bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-red-300 font-medium">Please fix the following errors:</h3>
                </div>
                <ul className="list-disc pl-10 text-red-300">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="text-sm">{message}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Input Fields */}
          <div className="col-span-1 space-y-4">
            {[
              { name: 'firstName', label: 'First Name *', type: 'text' },
              { name: 'lastName', label: 'Last Name *', type: 'text' },
              { name: 'email', label: 'Email *', type: 'email' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-base font-medium mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                  className={`w-full bg-card-primary border ${errors[field.name] ? 'border-red-500' : 'border-border-primary'} text-base text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary transition`}
                />
                {errors[field.name] && (
                  <div className="mt-1 flex items-center bg-red-900/20 px-2 py-1 rounded border border-red-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-red-300 text-sm font-medium">{errors[field.name]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message + Button */}
          <div className="col-span-1 lg:col-span-2 flex flex-col justify-between">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={7}
                required
                className={`w-full bg-card-primary border ${errors.message ? 'border-red-500' : 'border-border-primary'} text-base text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary transition`}
              />
              {errors.message && (
                <div className="mt-1 flex items-center bg-red-900/20 px-2 py-1 rounded border border-red-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-300 text-sm font-medium">{errors.message}</p>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-start lg:justify-end">
              <button
                type="submit"
                className="bg-text-primary text-text-tertiary rounded-full px-8 py-2 font-medium hover:bg-highlight-primary transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </motion.form>
        )}
      </div>
    </section>
  );
};

export default QuotaForm;
