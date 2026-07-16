import type { AuditLogWithId } from '../data/audit'

interface AuditLogDetailsModalProps {
  log: AuditLogWithId
  onClose: () => void
}

function formatTimestamp(ts: AuditLogWithId['createdAt']): string {
  if (!ts) return '—'
  const d = ts.toDate()
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatFieldLabel(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace('_', ' ')
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'object' && 'toDate' in (value as object)) {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString()
  }
  return String(value)
}

const actionLabels: Record<string, string> = {
  subscription_updated: 'Subscription Updated',
}

function actionLabel(action: string): string {
  return actionLabels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase())
}

export default function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audit Log Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Actor</span>
              <span className="text-gray-900 dark:text-white">{log.actorEmail}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Role</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                {log.actorRole}
              </span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Action</span>
              <span className="text-gray-900 dark:text-white">{actionLabel(log.action)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Target Store</span>
              <span className="text-gray-900 dark:text-white">{log.targetStore || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Target UID</span>
              <span className="text-gray-900 dark:text-white font-mono text-xs break-all">{log.targetUid || '—'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Timestamp</span>
            <span className="text-sm text-gray-900 dark:text-white">{formatTimestamp(log.createdAt)}</span>
          </div>

          {log.changes && Object.keys(log.changes).length > 0 && (
            <div>
              <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Changes</span>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg divide-y divide-gray-200 dark:divide-slate-600">
                {Object.entries(log.changes).map(([field, entry]) => (
                  <div key={field} className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                      {formatFieldLabel(field)}
                    </span>
                    <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-700 rounded px-2 py-1 border border-gray-200 dark:border-slate-600 truncate">
                        {displayValue(entry.old)}
                      </span>
                      <svg className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="text-gray-900 dark:text-white bg-white dark:bg-slate-700 rounded px-2 py-1 border border-gray-200 dark:border-slate-600 truncate">
                        {displayValue(entry.new)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Device</span>
            <span className="text-sm text-gray-600 dark:text-slate-400 break-all font-mono text-xs">
              {log.metadata.device || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
