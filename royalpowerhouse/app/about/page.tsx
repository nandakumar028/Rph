import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Academy SMS',
  description: 'Learn about Royal Powerhouse Academy and our student management platform.',
};

import React from 'react';
import {
  IconShieldCheck,
  IconBolt,
  IconUsers,
  IconAward,
  IconChartBar,
  IconDeviceLaptop,
} from '@tabler/icons-react';

const values = [
  {
    icon: IconBolt,
    title: 'Performance First',
    description: 'Built on Next.js 16 with Turbopack, delivering sub-second page loads and seamless transitions.',
  },
  {
    icon: IconShieldCheck,
    title: 'Secure by Design',
    description: 'Row-level security via Supabase ensures each record is protected and privately isolated.',
  },
  {
    icon: IconUsers,
    title: 'Student-Centered',
    description: 'Every feature is designed around the needs of students, educators, and administrators alike.',
  },
  {
    icon: IconAward,
    title: 'Grade Intelligence',
    description: 'Track weighted assessments, monitor score trends, and identify performance gaps at a glance.',
  },
  {
    icon: IconChartBar,
    title: 'Real-Time Analytics',
    description: 'Live dashboard metrics give administrators instant visibility into attendance, finance, and enrollment.',
  },
  {
    icon: IconDeviceLaptop,
    title: 'Device Agnostic',
    description: 'Fully responsive across desktop, tablet, and mobile with an elegant dark-mode interface.',
  },
];

const team = [
  { initials: 'EV', name: 'Eleanor Vance', role: 'Head of Mathematics' },
  { initials: 'JF', name: 'Dr. Julian Foster', role: 'Director of Sciences' },
  { initials: 'SC', name: 'Prof. Sarah Connor', role: 'Engineering Lead' },
  { initials: 'MA', name: 'Dr. Marcus Aurelius', role: 'Dean of Humanities' },
];

export default function AboutPage() {
  return (
    <div className="flex-1 bg-black overflow-y-auto">
      {/* Hero */}
      <section className="border-b border-neutral-900 px-6 md:px-12 py-16 md:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04)_0,transparent_70%)] pointer-events-none" />
        <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">About Us</p>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-5 max-w-3xl mx-auto">
          Built for Modern Education
        </h1>
        <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
          Royal Powerhouse Academy SMS is a premium, open-core student management platform designed 
          for institutions that value clarity, speed, and beautiful design. We believe administrative 
          software should feel effortless.
        </p>
      </section>

      {/* Stats */}
      <section className="border-b border-neutral-900 px-6 md:px-12 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '500+', label: 'Students Managed' },
            { value: '12', label: 'Active Courses' },
            { value: '98%', label: 'Attendance Accuracy' },
            { value: '2026', label: 'Founded' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">{stat.value}</span>
              <span className="text-xs text-neutral-500 mt-1 tracking-wider uppercase font-mono">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-neutral-900 px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">Our Principles</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-10">What drives us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="glass-panel p-6 rounded-xl border border-neutral-900/50 group hover:border-neutral-700/60 transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 group-hover:border-neutral-700 transition-colors">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-b border-neutral-900 px-6 md:px-12 py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">The Faculty</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-10">Meet our educators</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center p-4 rounded-xl border border-neutral-900/50 hover:border-neutral-800 transition-colors">
                <div className="h-14 w-14 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-base text-white mb-3">
                  {member.initials}
                </div>
                <span className="text-sm font-semibold text-white">{member.name}</span>
                <span className="text-[11px] text-neutral-500 mt-0.5">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-neutral-500 uppercase mb-4">Our Mission</p>
          <blockquote className="text-xl md:text-2xl font-light text-neutral-300 leading-relaxed italic">
            &ldquo;To give educators and administrators the tools they need to focus on what matters most — 
            the growth and success of every student.&rdquo;
          </blockquote>
          <p className="text-neutral-500 text-xs mt-6 font-mono tracking-widest">— Royal Powerhouse Academy</p>
        </div>
      </section>
    </div>
  );
}
