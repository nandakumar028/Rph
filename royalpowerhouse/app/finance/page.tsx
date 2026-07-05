"use client";

import React, { useState, useEffect } from 'react';
import { db, Student, Finance } from '@/app/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Dialog } from '@/app/components/ui/dialog';
import { useToast } from '@/app/components/ui/toast';
import {
  IconCreditCard,
  IconPlus,
  IconSearch,
  IconCheck,
  IconTrendingUp,
  IconAlertCircle,
  IconTrash,
  IconClock
} from '@tabler/icons-react';

export default function FinancePage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Finance[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  
  const [loading, setLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    title: 'Tuition Fee Fall 2026',
    amount: '3500',
    due_date: '', // Set on mount/data fetch
    status: 'Pending' as 'Pending' | 'Paid'
  });

  async function loadFinanceData() {
    setLoading(true);
    try {
      const studentsList = await db.getStudents();
      const financeList = await db.getFinance();
      setStudents(studentsList);
      setInvoices(financeList);
      
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        student_id: prev.student_id || (studentsList[0]?.id ?? ''),
        due_date: prev.due_date || defaultDate
      }));
    } catch (e) {
      toast('Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const student = students.find(s => s.id === inv.student_id);
    const fullName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : '';
    const matchesSearch = fullName.includes(search.toLowerCase()) || inv.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Toggle invoice paid
  async function handleRecordPayment(id: string, currentStatus: Finance['status']) {
    const nextStatus: Finance['status'] = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await db.recordPayment(id, nextStatus);
      toast(nextStatus === 'Paid' ? 'Payment received and recorded' : 'Invoice marked as pending', 'success');
      loadFinanceData();
    } catch (e) {
      toast('Failed to update invoice status', 'error');
    }
  }

  // Submit invoice
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.student_id || !formData.title || !formData.amount || !formData.due_date) {
      toast('Please fill all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await db.addInvoice({
        student_id: formData.student_id,
        title: formData.title,
        amount: Number(formData.amount),
        due_date: formData.due_date,
        status: formData.status as any,
        paid_date: formData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null
      });
      toast('Invoice generated successfully', 'success');
      setIsAddOpen(false);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        title: 'Tuition Fee Fall 2026',
        amount: '3500',
      }));

      loadFinanceData();
    } catch (e) {
      toast('Failed to generate invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // Financial aggregation stats
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

  return (
    <div className="flex-1 bg-black p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Finance</h1>
          <p className="text-neutral-400 text-sm mt-1">Track tuition billing, invoices, and collected revenues.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-white text-black hover:bg-neutral-200">
          <IconPlus className="h-4.5 w-4.5 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Aggregate stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Collected revenue */}
        <Card className="bg-neutral-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
            <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">Collected Revenue</span>
            <IconTrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-neutral-500 mt-1">Total tuition fees paid in full</p>
          </CardContent>
        </Card>

        {/* Outstanding invoices */}
        <Card className="bg-neutral-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
            <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">Outstanding Fees</span>
            <IconClock className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
              <span>Awaiting payment or overdue</span>
            </p>
          </CardContent>
        </Card>

        {/* Overdue Count */}
        <Card className="bg-neutral-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-2">
            <span className="text-xs font-semibold text-neutral-400 font-mono uppercase">Overdue Bills</span>
            <IconAlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{overdueCount} Invoices</div>
            <p className="text-[10px] text-neutral-500 mt-1">Past due dates and uncollected</p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Filter / Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-grow relative">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search invoices by student name or bill title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-900 focus:border-neutral-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-neutral-950 border border-neutral-900 rounded-lg p-0.5 self-start overflow-x-auto max-w-full">
          {['All', 'Paid', 'Pending', 'Overdue'].map((filter) => (
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

      {/* Invoices List Table */}
      <Card className="bg-neutral-950/20 border-neutral-900/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 text-sm">
            No invoice records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 text-xs font-semibold text-neutral-400 tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Invoice Bill</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const student = students.find(s => s.id === inv.student_id);
                  return (
                    <tr key={inv.id} className="border-b border-neutral-900/40 hover:bg-neutral-900/10">
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
                        {inv.title}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white font-mono whitespace-nowrap">
                        ${inv.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400 whitespace-nowrap">
                        {inv.due_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            inv.status === 'Paid' && 'bg-success-bg text-success border-success/20'
                          } ${
                            inv.status === 'Pending' && 'bg-amber-950/40 text-warning border-warning/20'
                          } ${
                            inv.status === 'Overdue' && 'bg-red-950/40 text-red-400 border-red-900/35'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRecordPayment(inv.id, inv.status)}
                            className="h-8 text-xs font-semibold px-3"
                          >
                            {inv.status === 'Paid' ? 'Mark Unpaid' : 'Collect Paid'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Create Invoice Entry */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Fee Invoice"
        description="Issue a new tuition billing invoice for a student."
      >
        {students.length === 0 ? (
          <div className="text-center py-6 text-sm text-neutral-500">
            No enrolled students to issue invoices to. Create student profiles first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Bill Recipient *</label>
              <select
                value={formData.student_id}
                required
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              >
                {students.map(st => (
                  <option key={st.id} value={st.id}>{st.first_name} {st.last_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Billing Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-400 font-medium mb-1">Invoice Amount ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="3500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 font-medium mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
                >
                  <option value="Pending">Pending (Unpaid)</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 font-medium mb-1">Billing Due Date *</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-black border border-neutral-850 focus:border-neutral-700 rounded-lg p-2 text-sm text-white outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-900 pt-4 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={submitting}>
                Create Bill
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
