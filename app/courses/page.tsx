"use client";

import React, { useState, useEffect } from 'react';
import { db, Course, Student } from '@/app/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog } from '@/app/components/ui/dialog';
import { useToast } from '@/app/components/ui/toast';
import {
  IconSearch,
  IconBooks,
  IconUsers,
  IconEdit,
  IconTrash,
  IconClock,
  IconSchool,
  IconCalendarEvent
} from '@tabler/icons-react';

export default function CoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Selected state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEnrolledStudents, setSelectedEnrolledStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    name: '',
    code: '',
    description: '',
    teacher_name: '',
    room: '',
    schedule: '',
    semester: 'Fall 2026',
  });

  async function loadData() {
    try {
      const coursesList = await db.getCourses();
      const studentsList = await db.getStudents();
      const enrollments = await db.getEnrollments();
      
      setCourses(coursesList);
      setStudents(studentsList);
      
      // Calculate enrollment counts
      const counts: Record<string, number> = {};
      coursesList.forEach(c => {
        counts[c.id] = enrollments.filter(e => e.course_id === c.id && e.status === 'Enrolled').length;
      });
      setEnrollmentCounts(counts);
    } catch (e) {
      toast('Failed to load courses', 'error');
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleViewCourse(course: Course) {
    setSelectedCourse(course);
    try {
      const list = await db.getEnrolledStudents(course.id);
      setSelectedEnrolledStudents(list);
    } catch (e) {
      setSelectedEnrolledStudents([]);
    }
    setIsDetailOpen(true);
  }

  function handleOpenForm(course?: Course) {
    if (course) {
      setIsEditing(true);
      setSelectedCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        description: course.description || '',
        teacher_name: course.teacher_name,
        room: course.room || '',
        schedule: course.schedule,
        semester: course.semester,
      });
    } else {
      setIsEditing(false);
      setSelectedCourse(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        teacher_name: '',
        room: '',
        schedule: '',
        semester: 'Fall 2026',
      });
    }
    setIsFormOpen(true);
  }

  async function handleDeleteCourse(id: string) {
    if (confirm('Are you sure you want to remove this course? All associated grade entries and student logs will be lost.')) {
      try {
        await db.deleteCourse(id);
        toast('Course deleted successfully', 'success');
        loadData();
      } catch (err) {
        toast('Failed to delete course', 'error');
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing && selectedCourse) {
        await db.updateCourse(selectedCourse.id, formData);
        toast('Course updated successfully', 'success');
      } else {
        await db.addCourse(formData);
        toast('Course created successfully', 'success');
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      toast('Failed to save course', 'error');
    }
  }

  async function handleRemoveStudentFromCourse(studentId: string) {
    if (!selectedCourse) return;
    try {
      await db.unenrollStudent(studentId, selectedCourse.id);
      toast('Student removed from class', 'success');
      // Refresh enrolled list
      const list = await db.getEnrolledStudents(selectedCourse.id);
      setSelectedEnrolledStudents(list);
      // Refresh count
      loadData();
    } catch (e) {
      toast('Failed to drop enrollment', 'error');
    }
  }

  return (
    <div className="flex-1 bg-black p-6 md:p-8 overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage curricular modules, lecture halls, and classes.</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-white text-black hover:bg-neutral-200">
          <IconBooks className="h-4.5 w-4.5 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative max-w-md">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by title, course code, or teacher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
        />
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="text-center py-16 bg-neutral-950/20 border-neutral-900/60">
          <p className="text-neutral-500 text-sm">No courses recorded. Feel free to create one!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const count = enrollmentCounts[course.id] || 0;
            return (
              <Card
                key={course.id}
                hoverable
                onClick={() => handleViewCourse(course)}
                className="bg-neutral-950/40 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between pb-0 mb-3">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">{course.code}</span>
                      <CardTitle className="text-base font-bold mt-1 text-white leading-tight">{course.name}</CardTitle>
                    </div>
                    <span className="text-xs text-neutral-400 font-medium bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-full">
                      {course.semester}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">
                      {course.description || "No description provided."}
                    </p>
                    
                    {/* Course details */}
                    <div className="space-y-2 text-xs text-neutral-400 border-t border-neutral-900/60 pt-3">
                      <div className="flex items-center gap-2">
                        <IconSchool className="h-4 w-4 text-neutral-500" />
                        <span>{course.teacher_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-neutral-500" />
                        <span>{course.schedule}</span>
                      </div>
                      {course.room && (
                        <div className="flex items-center gap-2">
                          <IconCalendarEvent className="h-4 w-4 text-neutral-500" />
                          <span>{course.room}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Footer details */}
                <CardFooter className="flex justify-between items-center bg-neutral-950/20 pt-3 border-t border-neutral-900 mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                    <IconUsers className="h-4 w-4 text-neutral-500" />
                    <span>{count} Enrolled</span>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm(course)}>
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:text-red-400" onClick={() => handleDeleteCourse(course.id)}>
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Course Detail View */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCourse?.name}
        description={`Course Code: ${selectedCourse?.code} • Enrolled Students`}
        className="max-w-2xl"
      >
        {selectedCourse && (
          <div className="space-y-6">
            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 border-b border-neutral-900 pb-4 text-xs">
              <div>
                <span className="text-neutral-500 block font-mono">INSTRUCTOR</span>
                <span className="font-semibold text-neutral-200 text-sm mt-0.5 block">{selectedCourse.teacher_name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block font-mono">SCHEDULE & ROOM</span>
                <span className="font-semibold text-neutral-200 text-sm mt-0.5 block">
                  {selectedCourse.schedule} {selectedCourse.room ? `(${selectedCourse.room})` : ''}
                </span>
              </div>
            </div>

            {/* Enrolled Students list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Enrolled Class List</h4>
              <div className="glass-panel p-4 rounded-lg bg-neutral-950/40 max-h-[300px] overflow-y-auto">
                {selectedEnrolledStudents.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">No students are currently enrolled in this class.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedEnrolledStudents.map((st) => (
                      <div key={st.id} className="flex items-center justify-between text-xs border-b border-neutral-900 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-[10px]">
                            {st.first_name[0]}{st.last_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-200">{st.first_name} {st.last_name}</div>
                            <div className="text-[10px] text-neutral-500">{st.email}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudentFromCourse(st.id)}
                          className="h-6 text-[10px] hover:text-red-400"
                        >
                          Drop Student
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenForm(selectedCourse);
                }}
              >
                Edit Class Settings
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Create/Edit Form */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditing ? "Edit Course Settings" : "Create New Course"}
        description="Configure academic parameters for the course module."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-neutral-400 font-medium mb-1">Course Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS-202"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1">Instructor / Teacher Name *</label>
            <input
              type="text"
              required
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Schedule Schedule *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mon/Wed 10:00 AM"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Lecture Room</label>
              <input
                type="text"
                placeholder="e.g. Room 302"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 font-medium mb-1">Academic Semester</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
            >
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2027">Spring 2027</option>
              <option value="Summer 2027">Summer 2027</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Class"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
