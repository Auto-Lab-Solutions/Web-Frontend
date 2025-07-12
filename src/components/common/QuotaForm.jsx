import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuotaForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', form);
    // TODO: Replace with actual submission logic
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
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
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
                  className="w-full bg-card-primary border border-border-primary text-base text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary transition"
                />
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
                className="w-full bg-card-primary border border-border-primary text-base text-text-primary px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight-primary transition"
              />
            </div>
            <div className="mt-2 flex justify-start lg:justify-end">
              <button
                type="submit"
                className="bg-text-primary text-text-tertiary rounded-full px-8 py-2 font-medium hover:bg-highlight-primary transition-all duration-200"
              >
                Send Message
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default QuotaForm;
