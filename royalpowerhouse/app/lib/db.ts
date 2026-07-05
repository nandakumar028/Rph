import { supabase } from './supabaseClient';

// --- Data Types ---

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  enrollment_date: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated';
  avatar_url?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacher_name: string;
  room: string;
  schedule: string;
  semester: string;
  created_at?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  status: 'Enrolled' | 'Dropped' | 'Completed';
}

export interface Attendance {
  id: string;
  student_id: string;
  course_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  notes: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  assessment_name: string;
  score: number;
  weight: number;
  date: string;
  created_at?: string;
}

export interface Finance {
  id: string;
  student_id: string;
  title: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paid_date?: string | null;
  created_at?: string;
}

// --- Mock Seed Data ---

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001',
    name: 'Advanced Mathematics',
    code: 'MATH-301',
    description: 'Calculus, linear algebra, and complex numbers.',
    teacher_name: 'Prof. Eleanor Vance',
    room: 'Room 402',
    schedule: 'Mon/Wed 09:00 AM - 10:30 AM',
    semester: 'Fall 2026',
  },
  {
    id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002',
    name: 'Quantum Physics',
    code: 'PHYS-402',
    description: 'Introduction to quantum mechanics, wave functions, and relativity.',
    teacher_name: 'Dr. Julian Foster',
    room: 'Science Lab B',
    schedule: 'Tue/Thu 11:00 AM - 12:30 PM',
    semester: 'Fall 2026',
  },
  {
    id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003',
    name: 'Software Engineering',
    code: 'CS-202',
    description: 'Design patterns, agile methodology, and full-stack development.',
    teacher_name: 'Prof. Sarah Connor',
    room: 'Tech Hub 1',
    schedule: 'Mon/Wed 01:00 PM - 02:30 PM',
    semester: 'Fall 2026',
  },
  {
    id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc004',
    name: 'Creative Writing & Lit',
    code: 'LIT-105',
    description: 'Exploring modern literature, poetry, and narrative structures.',
    teacher_name: 'Dr. Marcus Aurelius',
    room: 'Seminar Hall 3',
    schedule: 'Fri 10:00 AM - 01:00 PM',
    semester: 'Fall 2026',
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001',
    first_name: 'Liam',
    last_name: 'Carter',
    email: 'liam.carter@academy.com',
    phone: '+1 (555) 019-2834',
    enrollment_date: '2026-06-01',
    status: 'Active',
    parent_name: 'Robert Carter',
    parent_phone: '+1 (555) 019-2830',
    parent_email: 'robert.carter@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002',
    first_name: 'Olivia',
    last_name: 'Smith',
    email: 'olivia.smith@academy.com',
    phone: '+1 (555) 014-9821',
    enrollment_date: '2026-06-02',
    status: 'Active',
    parent_name: 'Helen Smith',
    parent_phone: '+1 (555) 014-9820',
    parent_email: 'helen.smith@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc003',
    first_name: 'Noah',
    last_name: 'Davis',
    email: 'noah.davis@academy.com',
    phone: '+1 (555) 017-4839',
    enrollment_date: '2026-06-03',
    status: 'Active',
    parent_name: 'David Davis',
    parent_phone: '+1 (555) 017-4830',
    parent_email: 'david.davis@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004',
    first_name: 'Emma',
    last_name: 'Brown',
    email: 'emma.brown@academy.com',
    phone: '+1 (555) 012-3849',
    enrollment_date: '2026-06-04',
    status: 'Active',
    parent_name: 'Susan Brown',
    parent_phone: '+1 (555) 012-3840',
    parent_email: 'susan.brown@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005',
    first_name: 'Sophia',
    last_name: 'Wilson',
    email: 'sophia.wilson@academy.com',
    phone: '+1 (555) 015-7732',
    enrollment_date: '2026-06-05',
    status: 'Active',
    parent_name: 'James Wilson',
    parent_phone: '+1 (555) 015-7730',
    parent_email: 'james.wilson@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc006',
    first_name: 'Jackson',
    last_name: 'Martinez',
    email: 'jackson.m@academy.com',
    phone: '+1 (555) 018-9921',
    enrollment_date: '2026-06-06',
    status: 'Inactive',
    parent_name: 'Maria Martinez',
    parent_phone: '+1 (555) 018-9920',
    parent_email: 'maria.martinez@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc007',
    first_name: 'Lucas',
    last_name: 'Taylor',
    email: 'lucas.taylor@academy.com',
    phone: '+1 (555) 011-8849',
    enrollment_date: '2026-05-10',
    status: 'Graduated',
    parent_name: 'Elizabeth Taylor',
    parent_phone: '+1 (555) 011-8840',
    parent_email: 'elizabeth.t@gmail.com',
  },
  {
    id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc008',
    first_name: 'Isabella',
    last_name: 'Thomas',
    email: 'isabella.t@academy.com',
    phone: '+1 (555) 016-5521',
    enrollment_date: '2026-06-01',
    status: 'Suspended',
    parent_name: 'Thomas Thomas',
    parent_phone: '+1 (555) 016-5520',
    parent_email: 'thomas.t@gmail.com',
  },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', enrollment_date: '2026-06-01', status: 'Enrolled' },
  { id: 'e2', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', enrollment_date: '2026-06-01', status: 'Enrolled' },
  { id: 'e3', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', enrollment_date: '2026-06-02', status: 'Enrolled' },
  { id: 'e4', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', enrollment_date: '2026-06-02', status: 'Enrolled' },
  { id: 'e5', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', enrollment_date: '2026-06-03', status: 'Enrolled' },
  { id: 'e6', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', enrollment_date: '2026-06-04', status: 'Enrolled' },
  { id: 'e7', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc004', enrollment_date: '2026-06-04', status: 'Enrolled' },
  { id: 'e8', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', enrollment_date: '2026-06-05', status: 'Enrolled' },
  { id: 'e9', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', enrollment_date: '2026-06-05', status: 'Enrolled' },
];

const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'a1', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', date: '2026-07-04', status: 'Present', notes: 'On time' },
  { id: 'a2', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', date: '2026-07-04', status: 'Present', notes: 'On time' },
  { id: 'a3', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', date: '2026-07-04', status: 'Late', notes: 'Traffic delay' },
  { id: 'a4', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', date: '2026-07-04', status: 'Present', notes: 'Active participant' },
  { id: 'a5', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', date: '2026-07-04', status: 'Absent', notes: 'Emailed ahead' },
  { id: 'a6', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', date: '2026-07-04', status: 'Present', notes: '' },
  { id: 'a7', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', date: '2026-07-04', status: 'Present', notes: '' },
  { id: 'a8', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', date: '2026-07-04', status: 'Present', notes: '' },
];

const INITIAL_GRADES: Grade[] = [
  { id: 'g1', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Quiz 1', score: 88.5, weight: 0.1, date: '2026-06-19' },
  { id: 'g2', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Midterm Exam', score: 92.0, weight: 0.3, date: '2026-06-29' },
  { id: 'g3', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Quiz 1', score: 95.0, weight: 0.1, date: '2026-06-19' },
  { id: 'g4', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Midterm Exam', score: 89.0, weight: 0.3, date: '2026-06-29' },
  { id: 'g5', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Quiz 1', score: 76.0, weight: 0.1, date: '2026-06-19' },
  { id: 'g6', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc001', assessment_name: 'Midterm Exam', score: 81.5, weight: 0.3, date: '2026-06-29' },
  { id: 'g7', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', assessment_name: 'Midterm Exam', score: 94.0, weight: 0.3, date: '2026-06-30' },
  { id: 'g8', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc002', assessment_name: 'Midterm Exam', score: 72.0, weight: 0.3, date: '2026-06-30' },
  { id: 'g9', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', assessment_name: 'Project 1', score: 98.0, weight: 0.2, date: '2026-06-24' },
  { id: 'g10', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', assessment_name: 'Project 1', score: 85.0, weight: 0.2, date: '2026-06-24' },
  { id: 'g11', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', course_id: 'c1b87b7a-3604-4b55-bfa3-02f4a4dfc003', assessment_name: 'Project 1', score: 91.0, weight: 0.2, date: '2026-06-24' },
];

const INITIAL_FINANCE: Finance[] = [
  { id: 'f1', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc001', title: 'Tuition Fee Fall 2026', amount: 3500.00, due_date: '2026-09-01', status: 'Paid', paid_date: '2026-07-02' },
  { id: 'f2', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc002', title: 'Tuition Fee Fall 2026', amount: 3500.00, due_date: '2026-09-01', status: 'Paid', paid_date: '2026-07-01' },
  { id: 'f3', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc003', title: 'Tuition Fee Fall 2026', amount: 3500.00, due_date: '2026-09-01', status: 'Pending', paid_date: null },
  { id: 'f4', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc004', title: 'Tuition Fee Fall 2026', amount: 3500.00, due_date: '2026-09-01', status: 'Pending', paid_date: null },
  { id: 'f5', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc005', title: 'Tuition Fee Fall 2026', amount: 3500.00, due_date: '2026-09-01', status: 'Paid', paid_date: '2026-07-03' },
  { id: 'f6', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc006', title: 'Registration Backlog Fee', amount: 120.00, due_date: '2026-06-15', status: 'Overdue', paid_date: null },
  { id: 'f7', student_id: 'b1b87b7a-3604-4b55-bfa3-02f4a4dfc008', title: 'Library Damage Fine', amount: 50.00, due_date: '2026-07-30', status: 'Pending', paid_date: null },
];

// --- Local Storage Database Helper ---

class LocalDB {
  private get<T>(key: string, initial: T[]): T[] {
    if (typeof window === 'undefined') return initial;
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private set<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getStudents() { return this.get<Student>('sms_students', INITIAL_STUDENTS); }
  setStudents(data: Student[]) { this.set('sms_students', data); }

  getCourses() { return this.get<Course>('sms_courses', INITIAL_COURSES); }
  setCourses(data: Course[]) { this.set('sms_courses', data); }

  getEnrollments() { return this.get<Enrollment>('sms_enrollments', INITIAL_ENROLLMENTS); }
  setEnrollments(data: Enrollment[]) { this.set('sms_enrollments', data); }

  getAttendance() { return this.get<Attendance>('sms_attendance', INITIAL_ATTENDANCE); }
  setAttendance(data: Attendance[]) { this.set('sms_attendance', data); }

  getGrades() { return this.get<Grade>('sms_grades', INITIAL_GRADES); }
  setGrades(data: Grade[]) { this.set('sms_grades', data); }

  getFinance() { return this.get<Finance>('sms_finance', INITIAL_FINANCE); }
  setFinance(data: Finance[]) { this.set('sms_finance', data); }
}

const localDB = new LocalDB();

// --- Unified Database Interface (Safe Fallback Wrapper) ---

export const db = {
  // Flag to check if we are connected to Supabase
  isUsingSupabase: () => !!supabase,

  // --- Students API ---

  async getStudents(): Promise<Student[]> {
    if (supabase) {
      const { data, error } = await supabase.from('students').select('*').order('last_name', { ascending: true });
      if (!error && data) return data;
      console.warn('Supabase getStudents error, falling back to LocalStorage:', error);
    }
    return localDB.getStudents();
  },

  async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const newId = crypto.randomUUID();
    const newStudent: Student = { ...student, id: newId };
    
    if (supabase) {
      const { data, error } = await supabase.from('students').insert([newStudent]).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase addStudent error, falling back to LocalStorage:', error);
    }
    
    const students = localDB.getStudents();
    students.push(newStudent);
    localDB.setStudents(students);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (supabase) {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase updateStudent error, falling back to LocalStorage:', error);
    }

    const students = localDB.getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...updates };
      localDB.setStudents(students);
      return students[idx];
    }
    throw new Error('Student not found');
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteStudent error, falling back to LocalStorage:', error);
    }

    const students = localDB.getStudents();
    const filtered = students.filter(s => s.id !== id);
    localDB.setStudents(filtered);

    // Cascade delete enrollments, attendance, grades, finance in local DB
    localDB.setEnrollments(localDB.getEnrollments().filter(e => e.student_id !== id));
    localDB.setAttendance(localDB.getAttendance().filter(a => a.student_id !== id));
    localDB.setGrades(localDB.getGrades().filter(g => g.student_id !== id));
    localDB.setFinance(localDB.getFinance().filter(f => f.student_id !== id));

    return true;
  },

  // --- Courses API ---

  async getCourses(): Promise<Course[]> {
    if (supabase) {
      const { data, error } = await supabase.from('courses').select('*').order('name', { ascending: true });
      if (!error && data) return data;
      console.warn('Supabase getCourses error, falling back to LocalStorage:', error);
    }
    return localDB.getCourses();
  },

  async addCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const newId = crypto.randomUUID();
    const newCourse: Course = { ...course, id: newId };

    if (supabase) {
      const { data, error } = await supabase.from('courses').insert([newCourse]).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase addCourse error, falling back to LocalStorage:', error);
    }

    const courses = localDB.getCourses();
    courses.push(newCourse);
    localDB.setCourses(courses);
    return newCourse;
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    if (supabase) {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase updateCourse error, falling back to LocalStorage:', error);
    }

    const courses = localDB.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...updates };
      localDB.setCourses(courses);
      return courses[idx];
    }
    throw new Error('Course not found');
  },

  async deleteCourse(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteCourse error, falling back to LocalStorage:', error);
    }

    const courses = localDB.getCourses();
    localDB.setCourses(courses.filter(c => c.id !== id));

    // Cascade delete in local DB
    localDB.setEnrollments(localDB.getEnrollments().filter(e => e.course_id !== id));
    localDB.setAttendance(localDB.getAttendance().filter(a => a.course_id !== id));
    localDB.setGrades(localDB.getGrades().filter(g => g.course_id !== id));

    return true;
  },

  // --- Enrollments API ---

  async getEnrollments(): Promise<Enrollment[]> {
    if (supabase) {
      const { data, error } = await supabase.from('enrollments').select('*');
      if (!error && data) return data;
      console.warn('Supabase getEnrollments error, falling back to LocalStorage:', error);
    }
    return localDB.getEnrollments();
  },

  async enrollStudent(studentId: string, courseId: string): Promise<Enrollment> {
    const newId = crypto.randomUUID();
    const newEnrollment: Enrollment = {
      id: newId,
      student_id: studentId,
      course_id: courseId,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Enrolled'
    };

    if (supabase) {
      const { data, error } = await supabase.from('enrollments').insert([newEnrollment]).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase enrollStudent error, falling back to LocalStorage:', error);
    }

    const enrollments = localDB.getEnrollments();
    // Avoid duplicates
    if (enrollments.some(e => e.student_id === studentId && e.course_id === courseId)) {
      return enrollments.find(e => e.student_id === studentId && e.course_id === courseId)!;
    }
    enrollments.push(newEnrollment);
    localDB.setEnrollments(enrollments);
    return newEnrollment;
  },

  async unenrollStudent(studentId: string, courseId: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('enrollments').delete().eq('student_id', studentId).eq('course_id', courseId);
      if (!error) return true;
      console.warn('Supabase unenrollStudent error, falling back to LocalStorage:', error);
    }

    const enrollments = localDB.getEnrollments();
    localDB.setEnrollments(enrollments.filter(e => !(e.student_id === studentId && e.course_id === courseId)));
    return true;
  },

  async getEnrolledStudents(courseId: string): Promise<Student[]> {
    const enrollments = await this.getEnrollments();
    const enrolledIds = enrollments
      .filter(e => e.course_id === courseId && e.status === 'Enrolled')
      .map(e => e.student_id);
    
    const students = await this.getStudents();
    return students.filter(s => enrolledIds.includes(s.id));
  },

  async getStudentCourses(studentId: string): Promise<Course[]> {
    const enrollments = await this.getEnrollments();
    const courseIds = enrollments
      .filter(e => e.student_id === studentId && e.status === 'Enrolled')
      .map(e => e.course_id);
    
    const courses = await this.getCourses();
    return courses.filter(c => courseIds.includes(c.id));
  },

  // --- Attendance API ---

  async getAttendance(courseId?: string, date?: string): Promise<Attendance[]> {
    if (supabase) {
      let query = supabase.from('attendance').select('*');
      if (courseId) query = query.eq('course_id', courseId);
      if (date) query = query.eq('date', date);
      
      const { data, error } = await query;
      if (!error && data) return data;
      console.warn('Supabase getAttendance error, falling back to LocalStorage:', error);
    }

    let attendance = localDB.getAttendance();
    if (courseId) attendance = attendance.filter(a => a.course_id === courseId);
    if (date) attendance = attendance.filter(a => a.date === date);
    return attendance;
  },

  async saveAttendance(records: Omit<Attendance, 'id'>[]): Promise<Attendance[]> {
    const updatedRecords: Attendance[] = [];

    for (const record of records) {
      if (supabase) {
        // Upsert to Supabase
        const { data, error } = await supabase.from('attendance').upsert({
          student_id: record.student_id,
          course_id: record.course_id,
          date: record.date,
          status: record.status,
          notes: record.notes
        }, { onConflict: 'student_id,course_id,date' }).select();
        
        if (!error && data && data[0]) {
          updatedRecords.push(data[0]);
          continue;
        }
        console.warn('Supabase upsert attendance error, falling back to LocalStorage:', error);
      }

      // Local storage fallback
      const attendance = localDB.getAttendance();
      const existingIdx = attendance.findIndex(
        a => a.student_id === record.student_id && a.course_id === record.course_id && a.date === record.date
      );

      if (existingIdx !== -1) {
        attendance[existingIdx] = { ...attendance[existingIdx], status: record.status, notes: record.notes };
        updatedRecords.push(attendance[existingIdx]);
      } else {
        const newRecord: Attendance = { ...record, id: crypto.randomUUID() };
        attendance.push(newRecord);
        updatedRecords.push(newRecord);
      }
      localDB.setAttendance(attendance);
    }

    return updatedRecords;
  },

  // --- Grades API ---

  async getGrades(courseId?: string, studentId?: string): Promise<Grade[]> {
    if (supabase) {
      let query = supabase.from('grades').select('*');
      if (courseId) query = query.eq('course_id', courseId);
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query;
      if (!error && data) return data;
      console.warn('Supabase getGrades error, falling back to LocalStorage:', error);
    }

    let grades = localDB.getGrades();
    if (courseId) grades = grades.filter(g => g.course_id === courseId);
    if (studentId) grades = grades.filter(g => g.student_id === studentId);
    return grades;
  },

  async addGrade(grade: Omit<Grade, 'id'>): Promise<Grade> {
    const newId = crypto.randomUUID();
    const newGrade: Grade = { ...grade, id: newId };

    if (supabase) {
      const { data, error } = await supabase.from('grades').insert([newGrade]).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase addGrade error, falling back to LocalStorage:', error);
    }

    const grades = localDB.getGrades();
    grades.push(newGrade);
    localDB.setGrades(grades);
    return newGrade;
  },

  async updateGrade(id: string, score: number): Promise<Grade> {
    if (supabase) {
      const { data, error } = await supabase.from('grades').update({ score }).eq('id', id).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase updateGrade error, falling back to LocalStorage:', error);
    }

    const grades = localDB.getGrades();
    const idx = grades.findIndex(g => g.id === id);
    if (idx !== -1) {
      grades[idx].score = score;
      localDB.setGrades(grades);
      return grades[idx];
    }
    throw new Error('Grade not found');
  },

  async deleteGrade(id: string): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase.from('grades').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteGrade error, falling back to LocalStorage:', error);
    }

    const grades = localDB.getGrades();
    localDB.setGrades(grades.filter(g => g.id !== id));
    return true;
  },

  // --- Finance API ---

  async getFinance(studentId?: string): Promise<Finance[]> {
    if (supabase) {
      let query = supabase.from('finance').select('*');
      if (studentId) query = query.eq('student_id', studentId);
      
      const { data, error } = await query;
      if (!error && data) return data;
      console.warn('Supabase getFinance error, falling back to LocalStorage:', error);
    }

    let finance = localDB.getFinance();
    if (studentId) finance = finance.filter(f => f.student_id === studentId);
    return finance;
  },

  async addInvoice(invoice: Omit<Finance, 'id'>): Promise<Finance> {
    const newId = crypto.randomUUID();
    const newInvoice: Finance = { ...invoice, id: newId };

    if (supabase) {
      const { data, error } = await supabase.from('finance').insert([newInvoice]).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase addInvoice error, falling back to LocalStorage:', error);
    }

    const finance = localDB.getFinance();
    finance.push(newInvoice);
    localDB.setFinance(finance);
    return newInvoice;
  },

  async recordPayment(id: string, status: 'Paid' | 'Pending' | 'Overdue'): Promise<Finance> {
    const paid_date = status === 'Paid' ? new Date().toISOString().split('T')[0] : null;
    
    if (supabase) {
      const { data, error } = await supabase.from('finance').update({ status, paid_date }).eq('id', id).select();
      if (!error && data && data[0]) return data[0];
      console.warn('Supabase recordPayment error, falling back to LocalStorage:', error);
    }

    const finance = localDB.getFinance();
    const idx = finance.findIndex(f => f.id === id);
    if (idx !== -1) {
      finance[idx].status = status;
      finance[idx].paid_date = paid_date;
      localDB.setFinance(finance);
      return finance[idx];
    }
    throw new Error('Invoice not found');
  }
};
