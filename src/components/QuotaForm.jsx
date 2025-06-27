import React, { useState } from 'react';

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
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 justify-center items-start">
        {/* Left Text */}
        <div className="md:w-1/3 flex justify-center md:justify-end">
          <p className="text-2xl font-medium leading-relaxed text-center md:text-right">
            For quotes or any <br /> inquiry, contact us
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="md:w-2/3 w-full grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Input Fields */}
          <div className="col-span-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Message and Send */}
          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={7}
                required
                className="w-full bg-transparent border border-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="mt-6 flex justify-start lg:justify-end">
              <button
                type="submit"
                className="text-red-500 border-2 border-red-500 rounded-full px-8 py-2 font-semibold hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default QuotaForm;
