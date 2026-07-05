"use client";

import React, { useState, useEffect } from 'react';
import { db, Course, Student, Grade } from '@/app/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog } from '@/app/components/ui/dialog';
import { useToast } from '@/app/components/ui/toast';
import {
  IconAward,
  IconPlus,
  IconSearch,
  IconTrash,
  IconEdit,
  IconChartBar,
  IconDeviceFloppy
} from '@tabler/icons-react';

export default function GradesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    assessment_name: '',
    score: '',
    weight: '0.1',
    date: new Date().toISOString().split('T')[0]
  });

  // Load courses
  async function loadCourses() {
    try {
      const list = await db.getCourses();
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourseId(list[0].id);
      }
    } catch (e) {
      toast('Failed to load courses', 'error');
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load students & grades for selected course
  async function loadGradesData() {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const studentsList = await db.getEnrolledStudents(selectedCourseId);
      const gradesList = await db.getGrades(selectedCourseId);
      setEnrolledStudents(studentsList);
      setGrades(gradesList);
      
      // Default first student in form
      if (studentsList.length > 0) {
        setFormData(prev => ({ ...prev, student_id: studentsList[0].id }));
      }
    } catch (e) {
      toast('Failed to load grade book', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGradesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  // Handle delete grade entry
  async function handleDeleteGrade(id: string) {
    if (confirm('Delete this grade record?')) {
      try {
        await db.deleteGrade(id);
        toast('Grade record deleted', 'success');
        loadGradesData();
      } catch (e) {
        toast('Failed to delete grade record', 'error');
      }
    }
  }

  // Handle submit new grade
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !formData.student_id || !formData.assessment_name || !formData.score) {
      toast('Please fill all required fields', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await db.addGrade({
        student_id: formData.student_id,
        course_id: selectedCourseId,
        assessment_name: formData.assessment_name,
        score: Number(formData.score),
        weight: Number(formData.weight),
        date: formData.date
      });
      toast('Grade recorded successfully', 'success');
      setIsAddOpen(false);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        assessment_name: '',
        score: '',
      }));

      loadGradesData();
    } catch (e) {
      toast('Failed to log grade', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate stats
  const classAverage = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + Number(g.score), 0) / grades.length * 10) / 10
    : 0;

  return (
    <div className="flex-1 bg-black p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gradebook</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage, weight, and track coursework assessment scores.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-white text-black hover:bg-neutral-200">
          <IconPlus className="h-4.5 w-4.5 mr-2" />
          Enter Grade
        </Button>
      </div>

      {/* Selector & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Class Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-400 font-semibold font-mono uppercase">Select Class</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded-lg p-2.5 text-sm text-white outline-none transition-colors"
          >
            {courses.length === 0 ? (
              <option value="">No classes available</option>
            ) : (
              courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))
            )}
          </select>
        </div>

        {/* Class average Card */}
        <div className="flex items-center gap-4 bg-neutral-950 border border-neutral-900 rounded-lg p-4 h-[68px]">
          <IconChartBar className="h-6 w-6 text-neutral-500" />
          <div>
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Class Average</span>
            <span className="text-base font-semibold text-white mt-0.5 block">
              {grades.length > 0 ? `${classAverage}%` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Total grades Card */}
        <div className="flex items-center gap-4 bg-neutral-950 border border-neutral-900 rounded-lg p-4 h-[68px]">
          <IconAward className="h-6 w-6 text-neutral-500" />
          <div>
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Assessments Logged</span>
            <span className="text-base font-semibold text-white mt-0.5 block">{grades.length}</span>
          </div>
        </div>
      </div>

      {/* Grade Book Grid Card */}
      <Card className="bg-neutral-950/20 border-neutral-900/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm">
            No grades logged for this class yet. Click &quot;Enter Grade&quot; to record one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-xs font-semibold text-neutral-400 tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Date logged</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => {
                  const student = enrolledStudents.find(s => s.id === grade.student_id);
                  return (
                    <tr key={grade.id} className="border-b border-neutral-900/40 hover:bg-neutral-900/10">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student ? (
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-[10px]">
                              {student.first_name[0]}{student.last_name[0]}
                            </div>
                            <span className="text-sm font-semibold text-white">{student.first_name} {student.last_name}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-xs">Removed Student</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-300 whitespace-nowrap">
                        {grade.assessment_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          grade.score >= 90 ? 'text-success' :
                          grade.score >= 80 ? 'text-white' :
                          grade.score >= 60 ? 'text-neutral-300' : 'text-red-400'
                        }`}>
                          {grade.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400 font-mono whitespace-nowrap">
                        {grade.weight * 100}%
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400 whitespace-nowrap">
                        {grade.date}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGrade(grade.id)}
                          className="h-8 w-8 text-neutral-500 hover:text-red-400"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Add Grade Entry */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enter Assessment Grade"
        description="Log score details for coursework assessment."
      >
        {enrolledStudents.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No students are enrolled in this class. Enroll students first before logging grades.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Select Student *</label>
              <select
                value={formData.student_id}
                required
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              >
                {enrolledStudents.map(st => (
                  <option key={st.id} value={st.id}>{st.first_name} {st.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Assessment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Exam, Quiz 3, Lab Project"
                value={formData.assessment_name}
                onChange={(e) => setFormData({ ...formData, assessment_name: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 font-medium mb-1">Score (0 - 100) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 92.5"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 font-medium mb-1">Weight Factor (Weight multiplier)</label>
                <select
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                >
                  <option value="0.05">5% (Quiz / Small task)</option>
                  <option value="0.1">10% (Assignment / Homework)</option>
                  <option value="0.2">20% (Project / Term Paper)</option>
                  <option value="0.3">30% (Midterm Exam)</option>
                  <option value="0.4">40% (Final Exam)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Assessment Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                <IconDeviceFloppy className="h-4 w-4 mr-2" />
                Record Grade
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
