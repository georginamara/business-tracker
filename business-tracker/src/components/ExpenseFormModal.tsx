import { useState, useEffect } from 'react'
import { serverTimestamp, type Timestamp, type FieldValue } from 'firebase/firestore'
import type { Expense } from '../data/expenses'
import { expenseCategories } from '../data/expenses'

interface ExpenseFormModalProps {
  open: boolean
  expense?: Expense | null
  onSave: (expenseData: {
    description: string
    category: string
    amount: number
    date: string
    notes?: string
    createdAt: Timestamp | FieldValue
  }) => void
  onClose: () => void
}

export default function ExpenseFormModal({ open, expense, onSave, onClose }: ExpenseFormModalProps) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(expenseCategories[0])
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (expense) {
        setDescription(expense.description)
        setCategory(expense.category)
        setAmount(expense.amount.toString())
        setDate(expense.date)
        setNotes(expense.notes || '')
      } else {
        setDescription('')
        setCategory(expenseCategories[0])
        setAmount('')
        setDate(new Date().toISOString().slice(0, 10))
        setNotes('')
      }
      setError('')
    }
  }, [open, expense])

  if (!open) return null

  const isEditing = !!expense

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than zero.')
      return
    }
    if (!date) {
      setError('Date is required.')
      return
    }

    onSave({
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      date,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      createdAt: expense?.createdAt || serverTimestamp(),
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError('') }}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setError('') }}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Notes <span className="text-gray-400 dark:text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 transition-shadow resize-none dark:bg-slate-700 dark:text-white"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-sm"
            >
              {isEditing ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
