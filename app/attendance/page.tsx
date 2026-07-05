"use client";

import React, { useState, useEffect } from 'react';
import { db, Course, Student, Attendance } from '@/app/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/toast';
import {
  IconCalendarCheck,
  IconClock,
  IconCheck,
  IconX,
  IconDeviceFloppy,
  IconInfoCircle
} from '@tabler/icons-react';

export default function AttendancePage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: Attendance['status']; notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Load students and existing logs when course or date changes
  async function loadAttendanceData() {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      // 1. Get enrolled students
      const studentsList = await db.getEnrolledStudents(selectedCourseId);
      setEnrolledStudents(studentsList);

      // 2. Get existing logs for this course and date
      const logs = await db.getAttendance(selectedCourseId, selectedDate);
      
      // 3. Map logs to records state
      const recordsMap: Record<string, { status: Attendance['status']; notes: string }> = {};
      
      // Default everyone to Present
      studentsList.forEach(student => {
        recordsMap[student.id] = { status: 'Present', notes: '' };
      });

      // Overlay existing logs
      logs.forEach(log => {
        if (recordsMap[log.student_id]) {
          recordsMap[log.student_id] = { status: log.status, notes: log.notes || '' };
        }
      });

      setAttendanceRecords(recordsMap);
    } catch (e) {
      toast('Failed to load attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, selectedDate]);

  // Update status for a student
  function handleStatusChange(studentId: string, status: Attendance['status']) {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  }

  // Update note for a student
  function handleNoteChange(studentId: string, notes: string) {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  }

  // Save/Submit logs
  async function handleSave() {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      const recordsToSave: Omit<Attendance, 'id'>[] = enrolledStudents.map(student => {
        const record = attendanceRecords[student.id];
        return {
          student_id: student.id,
          course_id: selectedCourseId,
          date: selectedDate,
          status: record?.status || 'Present',
          notes: record?.notes || ''
        };
      });

      await db.saveAttendance(recordsToSave);
      toast('Attendance saved successfully', 'success');
    } catch (e) {
      toast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Quick stats calculation
  const total = enrolledStudents.length;
  const present = Object.values(attendanceRecords).filter(r => r.status === 'Present').length;
  const late = Object.values(attendanceRecords).filter(r => r.status === 'Late').length;
  const absent = Object.values(attendanceRecords).filter(r => r.status === 'Absent').length;
  const excused = Object.values(attendanceRecords).filter(r => r.status === 'Excused').length;

  return (
    <div className="flex-1 bg-black p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>
          <p className="text-neutral-400 text-sm mt-1">Log and track daily classroom attendance sheets.</p>
        </div>
      </div>

      {/* Select Controls Grid */}
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

        {/* Date Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-400 font-semibold font-mono uppercase">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded-lg p-2 text-sm text-white outline-none transition-colors"
          />
        </div>

        {/* Quick Aggregation Cards */}
        <div className="flex items-end justify-between bg-neutral-950 border border-neutral-900 rounded-lg p-4 h-[68px]">
          <div className="text-center">
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Present</span>
            <span className="text-sm font-semibold text-success mt-1 block">{present + late}</span>
          </div>
          <div className="h-8 w-[1px] bg-neutral-900" />
          <div className="text-center">
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Absent</span>
            <span className="text-sm font-semibold text-red-400 mt-1 block">{absent}</span>
          </div>
          <div className="h-8 w-[1px] bg-neutral-900" />
          <div className="text-center">
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Late</span>
            <span className="text-sm font-semibold text-warning mt-1 block">{late}</span>
          </div>
          <div className="h-8 w-[1px] bg-neutral-900" />
          <div className="text-center">
            <span className="block text-[10px] text-neutral-500 font-bold uppercase font-mono">Excused</span>
            <span className="text-sm font-semibold text-neutral-400 mt-1 block">{excused}</span>
          </div>
        </div>
      </div>

      {/* Roster Sheet */}
      <Card className="bg-neutral-950/20 border-neutral-900/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 text-sm flex flex-col items-center justify-center gap-2">
            <IconInfoCircle className="h-8 w-8 text-neutral-600" />
            <p>No students enrolled in this course.</p>
            <p className="text-xs text-neutral-600">Go to the Students directory to enroll them.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-900 text-xs font-semibold text-neutral-400 tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Attendance Status</th>
                    <th className="px-6 py-4">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((student) => {
                    const record = attendanceRecords[student.id] || { status: 'Present', notes: '' };
                    return (
                      <tr key={student.id} className="border-b border-neutral-900/40 hover:bg-neutral-900/10">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-xs">
                              {student.first_name[0]}{student.last_name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white">
                                {student.first_name} {student.last_name}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 bg-black/60 border border-neutral-900 p-0.5 rounded-lg w-fit">
                            {(['Present', 'Absent', 'Late', 'Excused'] as Attendance['status'][]).map((status) => {
                              const isSelected = record.status === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleStatusChange(student.id, status)}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                                    isSelected
                                      ? status === 'Present' && 'bg-white text-black font-semibold' ||
                                        status === 'Absent' && 'bg-red-950/40 text-red-400 font-semibold border border-red-900/30' ||
                                        status === 'Late' && 'bg-amber-950/40 text-warning font-semibold border border-amber-900/30' ||
                                        status === 'Excused' && 'bg-neutral-850 text-neutral-300 font-semibold border border-neutral-800'
                                      : 'text-neutral-500 hover:text-neutral-300'
                                  }`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            placeholder="Add log notes (e.g. sick leave, excused by parent)..."
                            value={record.notes}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                            className="w-full max-w-md bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 outline-none transition-colors placeholder-neutral-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Button Footer */}
            <div className="flex justify-end p-6 border-t border-neutral-900 bg-neutral-950/10">
              <Button
                onClick={handleSave}
                isLoading={saving}
                className="bg-white text-black hover:bg-neutral-200 font-semibold text-xs py-2 px-5"
              >
                <IconDeviceFloppy className="h-4.5 w-4.5 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
