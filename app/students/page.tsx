"use client";

import React, { useState, useEffect } from 'react';
import { db, Student, Course } from '@/app/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog } from '@/app/components/ui/dialog';
import { useToast } from '@/app/components/ui/toast';
import {
  IconSearch,
  IconUserPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconCalendar,
  IconBook,
  IconPlus
} from '@tabler/icons-react';

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended' | 'Graduated'>('All');
  
  // Modal states
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Selected state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudentCourses, setSelectedStudentCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    avatar_url: '',
  });

  // Load students & courses
  async function loadData() {
    try {
      const studentsList = await db.getStudents();
      const coursesList = await db.getCourses();
      setStudents(studentsList);
      setCourses(coursesList);
    } catch (err) {
      toast('Failed to load student data', 'error');
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter students
  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle opening view modal
  async function handleViewProfile(student: Student) {
    setSelectedStudent(student);
    try {
      const studentCourses = await db.getStudentCourses(student.id);
      setSelectedStudentCourses(studentCourses);
    } catch (e) {
      setSelectedStudentCourses([]);
    }
    setIsViewOpen(true);
  }

  // Handle opening add/edit form
  function handleOpenForm(student?: Student) {
    if (student) {
      setIsEditing(true);
      setSelectedStudent(student);
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone || '',
        enrollment_date: student.enrollment_date,
        status: student.status,
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
        avatar_url: student.avatar_url || '',
      });
    } else {
      setIsEditing(false);
      setSelectedStudent(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        avatar_url: '',
      });
    }
    setIsFormOpen(true);
  }

  // Handle delete student
  async function handleDeleteStudent(id: string) {
    if (confirm('Are you sure you want to remove this student? This action cascades to attendance, grades, and fee records.')) {
      try {
        await db.deleteStudent(id);
        toast('Student removed successfully', 'success');
        loadData();
      } catch (err) {
        toast('Failed to delete student', 'error');
      }
    }
  }

  // Submit student form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing && selectedStudent) {
        await db.updateStudent(selectedStudent.id, formData);
        toast('Student profile updated', 'success');
      } else {
        await db.addStudent(formData);
        toast('New student enrolled', 'success');
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      toast('Failed to save student profile', 'error');
    }
  }

  // Quick enroll student into a course from profile
  async function handleQuickEnroll(courseId: string) {
    if (!selectedStudent) return;
    try {
      await db.enrollStudent(selectedStudent.id, courseId);
      toast('Student enrolled in class', 'success');
      // Refresh selected student courses
      const studentCourses = await db.getStudentCourses(selectedStudent.id);
      setSelectedStudentCourses(studentCourses);
    } catch (err) {
      toast('Failed to enroll student', 'error');
    }
  }

  return (
    <div className="flex-1 bg-black p-6 md:p-8 overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Students</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage enrollments, profiles, and parental logs.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-white text-black hover:bg-neutral-200">
          <IconUserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </div>

      {/* Directory Filter / Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-grow relative">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-neutral-950 border border-neutral-900 rounded-lg p-0.5 self-start overflow-x-auto max-w-full">
          {['All', 'Active', 'Inactive', 'Suspended', 'Graduated'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as any)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Students List Table */}
      <Card className="bg-neutral-950/20 border-neutral-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-900 text-xs font-semibold text-neutral-400 tracking-wider">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Enrollment Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-500 text-sm">
                    No students match your current search/filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleViewProfile(student)}
                    className="border-b border-neutral-900/50 hover:bg-neutral-900/10 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">
                            {student.first_name} {student.last_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300 whitespace-nowrap">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400 whitespace-nowrap">
                      {student.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-400 whitespace-nowrap">
                      {student.enrollment_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          student.status === 'Active' && 'bg-success-bg text-success border-success/20'
                        } ${
                          student.status === 'Inactive' && 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        } ${
                          student.status === 'Suspended' && 'bg-error-bg text-error border-error/20'
                        } ${
                          student.status === 'Graduated' && 'bg-neutral-900 text-white border-neutral-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProfile(student)}
                          className="h-8 w-8"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(student)}
                          className="h-8 w-8"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="h-8 w-8 text-neutral-500 hover:text-red-400"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Profile */}
      <Dialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Student Profile"
        description="Detailed enrollment and academic record."
        className="max-w-2xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Header Details */}
            <div className="flex items-center gap-4 border-b border-neutral-900 pb-6">
              <div className="h-16 w-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl font-bold text-white uppercase">
                {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-bold text-white">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <IconMail className="h-3.5 w-3.5" />
                    {selectedStudent.email}
                  </span>
                  {selectedStudent.phone && (
                    <span className="flex items-center gap-1">
                      <IconPhone className="h-3.5 w-3.5" />
                      {selectedStudent.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5" />
                    Enrolled {selectedStudent.enrollment_date}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Parental / Emergency Contact details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Parent / Guardian Contacts</h4>
                <div className="glass-panel p-4 rounded-lg bg-neutral-950/40 space-y-3">
                  {selectedStudent.parent_name ? (
                    <>
                      <div>
                        <div className="text-[10px] text-neutral-500 font-mono">NAME</div>
                        <div className="text-sm font-semibold text-neutral-200">{selectedStudent.parent_name}</div>
                      </div>
                      {selectedStudent.parent_phone && (
                        <div>
                          <div className="text-[10px] text-neutral-500 font-mono">PHONE</div>
                          <div className="text-sm text-neutral-300">{selectedStudent.parent_phone}</div>
                        </div>
                      )}
                      {selectedStudent.parent_email && (
                        <div>
                          <div className="text-[10px] text-neutral-500 font-mono">EMAIL</div>
                          <div className="text-sm text-neutral-300">{selectedStudent.parent_email}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-neutral-500">No guardian contact details recorded.</div>
                  )}
                </div>
              </div>

              {/* Course Enrollments & Quick Enroll */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Course Enrollments</h4>
                <div className="glass-panel p-4 rounded-lg bg-neutral-950/40 space-y-3 max-h-[220px] overflow-y-auto">
                  {selectedStudentCourses.length === 0 ? (
                    <div className="text-xs text-neutral-500">No active classes enrolled.</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedStudentCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between text-xs border-b border-neutral-900 pb-2 last:border-0 last:pb-0">
                          <div>
                            <div className="font-semibold text-neutral-200">{course.name}</div>
                            <div className="text-neutral-500 text-[10px]">{course.code} • {course.schedule}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('Drop course enrollment?')) {
                                await db.unenrollStudent(selectedStudent.id, course.id);
                                toast('Enrolment deleted', 'success');
                                const sc = await db.getStudentCourses(selectedStudent.id);
                                setSelectedStudentCourses(sc);
                              }
                            }}
                            className="h-6 text-[10px] hover:text-red-400"
                          >
                            Drop
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enroll in another class */}
                  <div className="border-t border-neutral-900 pt-3 mt-3">
                    <div className="text-[10px] text-neutral-500 mb-2 font-mono">ENROLL IN COURSE</div>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleQuickEnroll(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 bg-black border border-neutral-850 rounded px-2 py-1 text-xs text-neutral-300 outline-none"
                      >
                        <option value="">Select a course...</option>
                        {courses
                          .filter(c => !selectedStudentCourses.some(sc => sc.id === c.id))
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsViewOpen(false);
                  handleOpenForm(selectedStudent);
                }}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Add/Edit Form */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditing ? "Edit Profile Details" : "Enroll New Student"}
        description="Provide correct student personal and guardian logs."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-4 mt-2">
            <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase mb-3">Guardian Information</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 font-medium mb-1">Guardian Name</label>
                <input
                  type="text"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 font-medium mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    value={formData.parent_phone}
                    onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                    className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 font-medium mb-1">Guardian Email</label>
                  <input
                    type="email"
                    value={formData.parent_email}
                    onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                    className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
