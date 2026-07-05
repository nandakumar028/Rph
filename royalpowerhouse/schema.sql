-- Student Management System (SMS) Clean Schema & Seed Data
-- This script drops existing tables and recreates them fresh to ensure it is clean and repeatable.

-- 1. Drop existing tables in reverse dependency order to prevent foreign key constraint errors
drop table if exists public.finance cascade;
drop table if exists public.grades cascade;
drop table if exists public.attendance cascade;
drop table if exists public.enrollments cascade;
drop table if exists public.courses cascade;
drop table if exists public.students cascade;

-- 2. Enable UUID Extension (safely checks if it already exists in the Postgres instance)
create extension if not exists "uuid-ossp";

-- 3. Create Students Table
create table public.students (
    id uuid default uuid_generate_v4() primary key,
    first_name text not null,
    last_name text not null,
    email text unique not null,
    phone text,
    enrollment_date date default current_date not null,
    status text default 'Active' check (status in ('Active', 'Inactive', 'Suspended', 'Graduated')) not null,
    avatar_url text,
    parent_name text,
    parent_phone text,
    parent_email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Courses Table
create table public.courses (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    code text unique not null,
    description text,
    teacher_name text not null,
    room text,
    schedule text not null, -- e.g. "Mon/Wed 10:00 AM"
    semester text not null, -- e.g. "Fall 2026"
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Enrollments Table (Many-to-Many junction between Students & Courses)
create table public.enrollments (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade not null,
    enrollment_date date default current_date not null,
    status text default 'Enrolled' check (status in ('Enrolled', 'Dropped', 'Completed')) not null,
    unique (student_id, course_id)
);

-- 6. Create Attendance Table
create table public.attendance (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade not null,
    date date default current_date not null,
    status text check (status in ('Present', 'Absent', 'Late', 'Excused')) not null,
    notes text,
    unique (student_id, course_id, date)
);

-- 7. Create Grades Table
create table public.grades (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade not null,
    assessment_name text not null, -- e.g. "Midterm Exam", "Quiz 1"
    score numeric not null check (score >= 0 and score <= 100),
    weight numeric default 1.0 check (weight >= 0 and weight <= 1.0) not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Finance/Invoices Table
create table public.finance (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    title text not null, -- e.g. "Tuition Fee Fall 2026"
    amount numeric not null check (amount >= 0),
    due_date date not null,
    status text default 'Pending' check (status in ('Paid', 'Pending', 'Overdue')) not null,
    paid_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Enable Row Level Security (RLS) on all tables for security
alter table public.students enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.grades enable row level security;
alter table public.finance enable row level security;

-- 10. Create basic permissive policies to allow CRUD operations for local testing & administration
create policy "Allow public read access on students" on public.students for select using (true);
create policy "Allow public insert access on students" on public.students for insert with check (true);
create policy "Allow public update access on students" on public.students for update using (true);
create policy "Allow public delete access on students" on public.students for delete using (true);

create policy "Allow public read access on courses" on public.courses for select using (true);
create policy "Allow public insert access on courses" on public.courses for insert with check (true);
create policy "Allow public update access on courses" on public.courses for update using (true);
create policy "Allow public delete access on courses" on public.courses for delete using (true);

create policy "Allow public read access on enrollments" on public.enrollments for select using (true);
create policy "Allow public insert access on enrollments" on public.enrollments for insert with check (true);
create policy "Allow public update access on enrollments" on public.enrollments for update using (true);
create policy "Allow public delete access on enrollments" on public.enrollments for delete using (true);

create policy "Allow public read access on attendance" on public.attendance for select using (true);
create policy "Allow public insert access on attendance" on public.attendance for insert with check (true);
create policy "Allow public update access on attendance" on public.attendance for update using (true);
create policy "Allow public delete access on attendance" on public.attendance for delete using (true);

create policy "Allow public read access on grades" on public.grades for select using (true);
create policy "Allow public insert access on grades" on public.grades for insert with check (true);
create policy "Allow public update access on grades" on public.grades for update using (true);
create policy "Allow public delete access on grades" on public.grades for delete using (true);

create policy "Allow public read access on finance" on public.finance for select using (true);
create policy "Allow public insert access on finance" on public.finance for insert with check (true);
create policy "Allow public update access on finance" on public.finance for update using (true);
create policy "Allow public delete access on finance" on public.finance for delete using (true);

-- 11. Seed Initial Mock Data
-- Seed Courses
insert into public.courses (id, name, code, description, teacher_name, room, schedule, semester) values
('c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Advanced Mathematics', 'MATH-301', 'Calculus, linear algebra, and complex numbers.', 'Prof. Eleanor Vance', 'Room 402', 'Mon/Wed 09:00 AM - 10:30 AM', 'Fall 2026'),
('c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Quantum Physics', 'PHYS-402', 'Introduction to quantum mechanics, wave functions, and relativity.', 'Dr. Julian Foster', 'Science Lab B', 'Tue/Thu 11:00 AM - 12:30 PM', 'Fall 2026'),
('c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Software Engineering', 'CS-202', 'Design patterns, agile methodology, and full-stack development.', 'Prof. Sarah Connor', 'Tech Hub 1', 'Mon/Wed 01:00 PM - 02:30 PM', 'Fall 2026'),
('c1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'Creative Writing & Lit', 'LIT-105', 'Exploring modern literature, poetry, and narrative structures.', 'Dr. Marcus Aurelius', 'Seminar Hall 3', 'Fri 10:00 AM - 01:00 PM', 'Fall 2026');

-- Seed Students
insert into public.students (id, first_name, last_name, email, phone, status, parent_name, parent_phone, parent_email) values
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Liam', 'Carter', 'liam.carter@academy.com', '+1 (555) 019-2834', 'Active', 'Robert Carter', '+1 (555) 019-2830', 'robert.carter@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Olivia', 'Smith', 'olivia.smith@academy.com', '+1 (555) 014-9821', 'Active', 'Helen Smith', '+1 (555) 014-9820', 'helen.smith@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Noah', 'Davis', 'noah.davis@academy.com', '+1 (555) 017-4839', 'Active', 'David Davis', '+1 (555) 017-4830', 'david.davis@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'Emma', 'Brown', 'emma.brown@academy.com', '+1 (555) 012-3849', 'Active', 'Susan Brown', '+1 (555) 012-3840', 'susan.brown@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'Sophia', 'Wilson', 'sophia.wilson@academy.com', '+1 (555) 015-7732', 'Active', 'James Wilson', '+1 (555) 015-7730', 'james.wilson@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc006', 'Jackson', 'Martinez', 'jackson.m@academy.com', '+1 (555) 018-9921', 'Inactive', 'Maria Martinez', '+1 (555) 018-9920', 'maria.martinez@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc007', 'Lucas', 'Taylor', 'lucas.taylor@academy.com', '+1 (555) 011-8849', 'Graduated', 'Elizabeth Taylor', '+1 (555) 011-8840', 'elizabeth.t@gmail.com'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc008', 'Isabella', 'Thomas', 'isabella.t@academy.com', '+1 (555) 016-5521', 'Suspended', 'Thomas Thomas', '+1 (555) 016-5520', 'thomas.t@gmail.com');

-- Seed Enrollments
insert into public.enrollments (student_id, course_id, status) values
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Enrolled'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Enrolled');

-- Seed Attendance (keyed on current date)
insert into public.attendance (student_id, course_id, date, status, notes) values
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', current_date, 'Present', 'On time'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', current_date, 'Present', 'On time'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', current_date, 'Late', 'Traffic delay'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', current_date, 'Present', 'Active participant'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', current_date, 'Absent', 'Emailed ahead'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', current_date, 'Present', ''),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', current_date, 'Present', ''),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', current_date, 'Present', '');

-- Seed Grades
insert into public.grades (student_id, course_id, assessment_name, score, weight, date) values
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Quiz 1', 88.5, 0.1, current_date - 15),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Midterm Exam', 92.0, 0.3, current_date - 5),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Quiz 1', 95.0, 0.1, current_date - 15),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Midterm Exam', 89.0, 0.3, current_date - 5),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Quiz 1', 76.0, 0.1, current_date - 15),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Midterm Exam', 81.5, 0.3, current_date - 5),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Midterm Exam', 94.0, 0.3, current_date - 4),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Midterm Exam', 72.0, 0.3, current_date - 4),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Project 1', 98.0, 0.20, current_date - 10),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Project 1', 85.0, 0.20, current_date - 10),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Project 1', 91.0, 0.20, current_date - 10);

-- Seed Finance/Invoices
insert into public.finance (student_id, title, amount, due_date, status, paid_date) values
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', 'Tuition Fee Fall 2026', 3500.00, '2026-09-01', 'Paid', '2026-07-02'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', 'Tuition Fee Fall 2026', 3500.00, '2026-09-01', 'Paid', '2026-07-01'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', 'Tuition Fee Fall 2026', 3500.00, '2026-09-01', 'Pending', null),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', 'Tuition Fee Fall 2026', 3500.00, '2026-09-01', 'Pending', null),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', 'Tuition Fee Fall 2026', 3500.00, '2026-09-01', 'Paid', '2026-07-03'),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc006', 'Registration Backlog Fee', 120.00, '2026-06-15', 'Overdue', null),
('b1b87b7a-3604-4b55-bfa3-02f4a4dfc008', 'Library Damage Fine', 50.00, '2026-07-30', 'Pending', null);
