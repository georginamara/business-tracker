import { useState, useMemo } from 'react'
import { useBusiness } from '../hooks/useBusiness'
import ExpenseFormModal from '../components/ExpenseFormModal'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'
import type { Expense } from '../data/expenses'
import { expenseCategories } from '../data/expenses'
import type { Timestamp, FieldValue } from 'firebase/firestore'

export default function Expenses() {
  const { expenses, addExpense, updateExpense, removeExpense, loading } = useBusiness()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const handleSave = async (data: {
    description: string
    category: string
    amount: number
    date: string
    notes?: string
    createdAt: Timestamp | FieldValue
  }) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data as Omit<Expense, 'id'>)
    } else {
      await addExpense(data as unknown as Omit<Expense, 'id'>)
    }
    setModalOpen(false)
    setEditingExpense(null)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await removeExpense(deleteTarget.id)
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    let result = [...expenses]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.description.toLowerCase().includes(q))
    }

    if (categoryFilter) {
      result = result.filter((e) => e.category === categoryFilter)
    }

    if (dateFilter) {
      result = result.filter((e) => e.date === dateFilter)
    }

    result.sort((a, b) =>
      sortOrder === 'newest'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    )

    return result
  }, [expenses, search, categoryFilter, dateFilter, sortOrder])

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
        <button
          onClick={() => { setEditingExpense(null); setModalOpen(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
        >
          <option value="">All Categories</option>
          {expenseCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="flex-1 min-w-[140px] rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-white dark:bg-slate-700 dark:text-white"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            className="px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Clear Date
          </button>
        )}

        <div className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden">
          <button
            onClick={() => setSortOrder('newest')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              sortOrder === 'newest'
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortOrder('oldest')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              sortOrder === 'oldest'
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600'
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            title={search || categoryFilter || dateFilter ? 'No expenses found' : 'No expenses yet'}
            description={
              search || categoryFilter || dateFilter
                ? 'Try adjusting your search or filters.'
                : 'Add your first expense to start tracking spending.'
            }
            action={
              !search && !categoryFilter && !dateFilter ? (
                <button
                  onClick={() => { setEditingExpense(null); setModalOpen(true) }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Expense
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-card">
              <thead>
                <tr className="text-left text-gray-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/50">
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.map((expense) => (
                  <tr key={expense.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 group">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white" data-label="Description">
                      <div>{expense.description}</div>
                      {expense.notes && (
                        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{expense.notes}</div>
                      )}
                    </td>
                    <td className="px-5 py-4" data-label="Category">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-gray-900 dark:text-white font-medium" data-label="Amount">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-slate-400" data-label="Date">{expense.date}</td>
                    <td className="px-5 py-4 text-right" data-label="">
                      <div className="inline-flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(expense)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-400 dark:text-slate-500 flex items-center justify-between">
            <span>
              {filtered.length} expense{filtered.length !== 1 ? 's' : ''}
              {(search || categoryFilter || dateFilter) && expenses.length !== filtered.length && (
                <span className="text-gray-400 dark:text-slate-500"> (filtered from {expenses.length})</span>
              )}
            </span>
            <span className="font-medium text-gray-600 dark:text-slate-300">
              Total: ${totalFiltered.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <ExpenseFormModal
        open={modalOpen}
        expense={editingExpense}
        onSave={handleSave}
        onClose={() => { setModalOpen(false); setEditingExpense(null) }}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Expense</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
              Are you sure you want to delete <strong className="text-gray-700 dark:text-slate-200">{deleteTarget.description}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
