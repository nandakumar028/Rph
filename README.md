# CRM Portal

A modern, fast, and secure authentication portal built with Next.js and Supabase.

## Features

- **Next.js 15+ App Router** with Server Actions
- **Authentication**: Email/Password and GitHub OAuth via Supabase
- **Secure Middleware**: Protects private routes and manages session tokens securely
- **Multi-tenant Architecture**: Auto-provisions Organizations (workspaces) and Roles for new users
- **Modern UI**: Styled with Tailwind CSS, Shadcn UI components, and Lucide Icons
- **Type-safe**: Strict TypeScript configuration

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

1. Node.js (v18 or newer)
2. A [Supabase](https://supabase.com/) project

### Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values in `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Setup

Run the SQL migrations in your Supabase SQL Editor:
- Execute the contents of `supabase/migrations/20260716000000_phase1_init.sql`

This will set up the necessary `profiles`, `organizations`, and `roles` tables, along with Row Level Security (RLS) and database triggers.

### Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/). Ensure you set the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` environment variables in your deployment settings.
