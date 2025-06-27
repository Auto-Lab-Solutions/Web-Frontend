import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageContainer from "../components/PageContainer";

const ContactUsPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit form', form);
  };

  return (
    <PageContainer>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-16 px-6">
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-center text-lg mb-8">
          Book your pre‑purchase car inspection today! Call us now at{' '}
          <a href="tel:0407193506" className="text-blue-600 font-semibold">
            0407 193 506
          </a>
        </p>
        <p className="text-center text-gray-600 mb-12">
          Or visit us at{' '}
          <a href="https://www.google.com/maps/place/Perth+Cars+Pre-Purchase+Inspection+Service/@-31.9898836,115.9302042,15.95z/data=!4m14!1m7!3m6!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!2sPerth+Cars+Pre-Purchase+Inspection+Service!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5!3m5!1s0x2a32bd151492dc2f:0x63cadc40b16b2176!8m2!3d-31.9887171!4d115.9350593!16s%2Fg%2F11x1ls0pj5?entry=ttu&g_ep=EgoyMDI1MDYyMi4wIKXMDSoASAFQAw%3D%3D" className="text-blue-600 font-semibold">
            70b Division St, Welshpool WA 6106, Australia
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="font-medium">Your Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                required
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="font-medium">Your Phone</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                required
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </label>
          </div>

          <label className="block">
            <span className="font-medium">Your Email</span>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="font-medium">Your Message</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </label>

          {/* Add a CAPTCHA component as needed */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 text-center text-gray-600">
          <p className="mb-2">
            You can also call us directly at{' '}
            <a href="tel:0407193506" className="text-blue-600 font-semibold">
              0407 193 506
            </a>
            .
          </p>
          <p>Spot On Vehicle Inspections offer personal and detailed pre purchase car inspection service and analysis. Contact us today to learn more about what we can offer you!</p>
        </div>
      </motion.div>
    </PageContainer>
  );
}

export default ContactUsPage;
