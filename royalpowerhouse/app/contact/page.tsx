"use client";

import React, { useState } from 'react';
import { IconMail, IconPhone, IconMapPin, IconSend, IconCheck } from '@tabler/icons-react';

const contactDetails = [
  {
    icon: IconMail,
    label: 'Email',
    value: 'info@royalpowerhouse.com',
    href: 'mailto:info@royalpowerhouse.com',
  },
  {
    icon: IconPhone,
    label: 'Phone',
    value: '+1 (555) 000-1234',
    href: 'tel:+15550001234',
  },
  {
    icon: IconMapPin,
    label: 'Address',
    value: '42 Academy Drive, San Francisco, CA 94102',
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-700 transition-colors resize-none';

  return (
    <div className="flex-1 bg-black overflow-y-auto">
      {/* Hero */}
      <section className="border-b border-neutral-900 px-6 md:px-12 py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0,transparent_70%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-4">
            Get in touch
          </h1>
          <p className="text-neutral-400 text-base max-w-lg leading-relaxed font-light">
            Have a question, need support, or want to partner with us? We&apos;d love to hear from you. 
            Fill out the form and we&apos;ll respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-white mb-5">Contact Information</h2>
              <div className="space-y-4">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-900 hover:border-neutral-800 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono mb-0.5">{item.label}</p>
                        <p className="text-sm text-neutral-300 font-light">{item.value}</p>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a key={item.label} href={item.href} className="block hover:opacity-80 transition-opacity">
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Office Hours */}
            <div className="p-4 rounded-xl border border-neutral-900 bg-neutral-950/30">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Office Hours</h3>
              <div className="space-y-1.5">
                {[
                  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
                  { day: 'Saturday', hours: '9:00 AM – 2:00 PM' },
                  { day: 'Sunday', hours: 'Closed' },
                ].map((row) => (
                  <div key={row.day} className="flex justify-between text-xs">
                    <span className="text-neutral-400">{row.day}</span>
                    <span className={row.hours === 'Closed' ? 'text-neutral-600' : 'text-neutral-300'}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-5">
                  <IconCheck className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-neutral-400 text-sm max-w-sm">
                  Thank you for reaching out. We&apos;ll get back to you at <span className="text-white font-medium">{form.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 text-xs text-neutral-500 hover:text-white transition-colors underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2 font-medium">Full Name <span className="text-neutral-600">*</span></label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-2 font-medium">Email Address <span className="text-neutral-600">*</span></label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@school.edu"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-2 font-medium">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" className="bg-neutral-950">Select a topic…</option>
                    <option value="support" className="bg-neutral-950">Technical Support</option>
                    <option value="billing" className="bg-neutral-950">Billing & Finance</option>
                    <option value="feature" className="bg-neutral-950">Feature Request</option>
                    <option value="partnership" className="bg-neutral-950">Partnership</option>
                    <option value="other" className="bg-neutral-950">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-2 font-medium">Message <span className="text-neutral-600">*</span></label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you…"
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-neutral-600">
                    We respect your privacy. No spam, ever.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[130px] justify-center"
                  >
                    {submitting ? (
                      <span className="h-4 w-4 rounded-full border-2 border-neutral-400 border-t-black animate-spin" />
                    ) : (
                      <>
                        <IconSend className="h-3.5 w-3.5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
