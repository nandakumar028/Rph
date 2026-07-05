"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { StatCardSkeleton } from '@/app/components/ui/skeleton';
import { db, type Student, type Course, type Attendance, type Grade, type Finance } from '@/app/lib/db';
import {
  IconUsers,
  IconBook,
  IconCalendarCheck,
  IconCreditCard,
  IconActivity,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';

// --- Types ---
interface Stat {
  studentsCount: number;
  activeCount: number;
  coursesCount: number;
  attendanceRate: number;
  outstandingFees: number;
  paidFeesCount: number;
  totalFeesCount: number;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'grade' | 'finance' | 'student' | 'attendance';
}

interface CourseEnrollment {
  name: string;
  code: string;
  count: number;
}

// --- Sub-components ---

function StatusBadge({ status }: { status: 'Active' | 'Inactive' | 'Suspended' | 'Graduated' }) {
  const styles = {
    Active: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/50',
    Inactive: 'bg-neutral-900/60 text-neutral-400 border-neutral-800/50',
    Suspended: 'bg-red-950/60 text-red-400 border-red-900/50',
    Graduated: 'bg-blue-950/60 text-blue-400 border-blue-900/50',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
}

function MiniBar({ value, max, color = 'bg-white' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-neutral-900 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-neutral-500 w-6 text-right">{value}</span>
    </div>
  );
}

// --- Dashboard Page ---

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat>({
    studentsCount: 0,
    activeCount: 0,
    coursesCount: 0,
    attendanceRate: 0,
    outstandingFees: 0,
    paidFeesCount: 0,
    totalFeesCount: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<CourseEnrollment[]>([]);
  const [studentStatusBreakdown, setStudentStatusBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setSupabaseConnected(db.isUsingSupabase());

        const [students, courses, attendance, finance, grades, enrollments] = await Promise.all([
          db.getStudents(),
          db.getCourses(),
          db.getAttendance(),
          db.getFinance(),
          db.getGrades(),
          db.getEnrollments(),
        ]);

        // --- Stats ---
        const activeCount = students.filter((s) => s.status === 'Active').length;
        const presentCount = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
        const outstandingFees = finance
          .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
          .reduce((sum, f) => sum + Number(f.amount), 0);
        const paidFeesCount = finance.filter((f) => f.status === 'Paid').length;

        setStats({
          studentsCount: students.length,
          activeCount,
          coursesCount: courses.length,
          attendanceRate,
          outstandingFees,
          paidFeesCount,
          totalFeesCount: finance.length,
        });

        // --- Student Status Breakdown ---
        const statusGroups = ['Active', 'Inactive', 'Suspended', 'Graduated'];
        setStudentStatusBreakdown(
          statusGroups.map((s) => ({ status: s, count: students.filter((st) => st.status === s).length }))
        );

        // --- Course Enrollment counts ---
        const courseMap = courses.map((c) => ({
          name: c.name,
          code: c.code,
          count: enrollments.filter((e) => e.course_id === c.id && e.status === 'Enrolled').length,
        }));
        setCourseEnrollments(courseMap.sort((a, b) => b.count - a.count));

        // --- Recent Students ---
        setRecentStudents(students.slice(-4).reverse());

        // --- Activity feed ---
        const activities: ActivityItem[] = [];
        grades.slice(-3).forEach((g, idx) => {
          const student = students.find((s) => s.id === g.student_id);
          const course = courses.find((c) => c.id === g.course_id);
          if (student && course) {
            activities.push({
              id: `g-${idx}`,
              text: `${student.first_name} ${student.last_name} scored ${g.score}% on ${g.assessment_name} in ${course.name}`,
              time: g.date,
              type: 'grade',
            });
          }
        });
        finance.slice(-2).forEach((f, idx) => {
          const student = students.find((s) => s.id === f.student_id);
          if (student) {
            activities.push({
              id: `f-${idx}`,
              text: `Invoice "${f.title}" ($${Number(f.amount).toLocaleString()}) — ${student.first_name} ${student.last_name}`,
              time: f.created_at ? f.created_at.split('T')[0] : '2026-07-04',
              type: 'finance',
            });
          }
        });
        attendance.slice(-2).forEach((a, idx) => {
          const student = students.find((s) => s.id === a.student_id);
          const course = courses.find((c) => c.id === a.course_id);
          if (student && course) {
            activities.push({
              id: `a-${idx}`,
              text: `${student.first_name} ${student.last_name} marked ${a.status} in ${course.name}`,
              time: a.date,
              type: 'attendance',
            });
          }
        });

        activities.sort((a, b) => b.time.localeCompare(a.time));
        setRecentActivities(activities.slice(0, 6));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activityDotColor = {
    grade: 'bg-blue-500',
    finance: 'bg-emerald-500',
    student: 'bg-white',
    attendance: 'bg-amber-500',
  };

  const maxEnrollment = Math.max(...courseEnrollments.map((c) => c.count), 1);
  const maxStatus = Math.max(...studentStatusBreakdown.map((s) => s.count), 1);

  return (
    <div className="flex-1 bg-black overflow-y-auto">
      <div className="p-6 md:p-8 max-w-screen-xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-neutral-500 text-sm mt-1">Academy overview &amp; live metrics</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className={`h-2 w-2 rounded-full ${supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
            <span className="text-xs font-medium text-neutral-400">
              {supabaseConnected ? 'Supabase Live' : 'LocalStorage Sandbox'}
            </span>
            {!supabaseConnected && (
              <div className="group relative flex items-center">
                <IconAlertCircle className="h-3.5 w-3.5 text-neutral-500 hover:text-white cursor-pointer ml-1" />
                <div className="absolute right-0 top-6 w-64 p-3 rounded-lg glass-panel text-[11px] text-neutral-400 leading-normal pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  Running in sandbox mode. Run <code className="text-white font-mono bg-neutral-900 px-1 rounded">schema.sql</code> in Supabase to go live.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <Card className="bg-neutral-950/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-neutral-400">Total Students</CardTitle>
                  <IconUsers className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.studentsCount}</div>
                  <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                    <IconTrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">{stats.activeCount} active</span>
                    &nbsp;·&nbsp;{stats.studentsCount - stats.activeCount} other
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-neutral-950/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-neutral-400">Active Courses</CardTitle>
                  <IconBook className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.coursesCount}</div>
                  <p className="text-[11px] text-neutral-500 mt-1">Fall 2026 semester</p>
                </CardContent>
              </Card>

              <Card className="bg-neutral-950/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-neutral-400">Avg Attendance</CardTitle>
                  <IconCalendarCheck className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.attendanceRate}%</div>
                  <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                    {stats.attendanceRate >= 75 ? (
                      <><IconTrendingUp className="h-3 w-3 text-emerald-500" /><span className="text-emerald-500">On track</span></>
                    ) : (
                      <><IconTrendingDown className="h-3 w-3 text-red-400" /><span className="text-red-400">Below target</span></>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-neutral-950/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-neutral-400">Outstanding Fees</CardTitle>
                  <IconCreditCard className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${stats.outstandingFees.toLocaleString()}</div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {stats.paidFeesCount}/{stats.totalFeesCount} invoices cleared
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* ── Middle Row: Enrollment Bar Chart + Student Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Enrollment Bars */}
          <Card className="bg-neutral-950/20 border-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Enrollment by Course</CardTitle>
              <p className="text-neutral-500 text-xs mt-0.5">Students currently enrolled per course</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-2.5 w-32 bg-neutral-900 rounded animate-pulse" />
                        <div className="h-2.5 w-8 bg-neutral-900 rounded animate-pulse" />
                      </div>
                      <div className="h-1.5 bg-neutral-900 rounded animate-pulse" />
                    </div>
                  ))
                : courseEnrollments.map((c) => (
                    <div key={c.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300 font-medium truncate max-w-[200px]">{c.name}</span>
                        <span className="text-neutral-500 font-mono text-[10px] ml-2">{c.code}</span>
                      </div>
                      <MiniBar value={c.count} max={maxEnrollment} />
                    </div>
                  ))}
            </CardContent>
          </Card>

          {/* Student Status Breakdown */}
          <Card className="bg-neutral-950/20 border-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Student Status</CardTitle>
              <p className="text-neutral-500 text-xs mt-0.5">Breakdown across all enrollment states</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-neutral-900 rounded animate-pulse" />
                  ))
                : studentStatusBreakdown.map((s) => {
                    const colors: Record<string, string> = {
                      Active: 'bg-emerald-500',
                      Inactive: 'bg-neutral-600',
                      Suspended: 'bg-red-500',
                      Graduated: 'bg-blue-500',
                    };
                    return (
                      <div key={s.status} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${colors[s.status]}`} />
                            <span className="text-neutral-300 font-medium">{s.status}</span>
                          </div>
                          <span className="text-neutral-400 font-mono text-[10px]">{s.count} students</span>
                        </div>
                        <MiniBar value={s.count} max={maxStatus} color={colors[s.status]} />
                      </div>
                    );
                  })}

              {/* Legend total */}
              {!loading && (
                <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] text-neutral-600 font-mono">
                  <span>TOTAL REGISTERED</span>
                  <span>{stats.studentsCount} STUDENTS</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom Row: Recent Students + Activity Feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Students */}
          <Card className="lg:col-span-2 bg-neutral-950/20 border-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Recent Students</CardTitle>
              <p className="text-neutral-500 text-xs mt-0.5">Last added to the system</p>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="divide-y divide-neutral-900">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="h-9 w-9 rounded-full bg-neutral-900 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-32 bg-neutral-900 rounded animate-pulse" />
                        <div className="h-2 w-44 bg-neutral-900 rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-14 bg-neutral-900 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-neutral-900/60">
                  {recentStudents.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-900/20 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{s.first_name} {s.last_name}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{s.email}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                  {recentStudents.length === 0 && (
                    <div className="px-5 py-8 text-center text-sm text-neutral-600">No students found.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="bg-neutral-950/20 border-neutral-900/60 flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <IconActivity className="h-4 w-4 text-white" />
              <CardTitle className="text-sm font-semibold">Activity Feed</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-2">
              {loading ? (
                <div className="space-y-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-neutral-900 mt-1 shrink-0 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-full bg-neutral-900 rounded animate-pulse" />
                        <div className="h-2 w-20 bg-neutral-900 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-10 text-neutral-600 text-xs">No recent activity.</div>
              ) : (
                <div className="space-y-5 flex-1">
                  {recentActivities.map((act) => (
                    <div key={act.id} className="flex gap-3">
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className={`h-2 w-2 rounded-full ${activityDotColor[act.type]} mt-1`} />
                        <div className="w-px bg-neutral-900 flex-1 mt-1" />
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-[11px] text-neutral-300 leading-normal">{act.text}</p>
                        <p className="text-[10px] text-neutral-600 font-mono mt-1">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-neutral-700 border-t border-neutral-900/80 pt-4 mt-4 flex justify-between font-mono">
                <span>LIVE LOG</span>
                <span>READY</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
