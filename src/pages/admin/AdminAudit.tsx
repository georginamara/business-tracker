import { useAdmin } from '../../hooks/useAdmin'
import { ClipboardList, Shield, Trash2, Pause, Play, RefreshCw } from 'lucide-react'

export default function AdminAudit() {
  const { auditLogs, loading } = useAdmin()

  const getActionIcon = (action: string) => {
    if (action.includes('Delete')) return <Trash2 size={14} className="text-red-400" />
    if (action.includes('Suspend')) return <Pause size={14} className="text-amber-400" />
    if (action.includes('Activate')) return <Play size={14} className="text-emerald-400" />
    if (action.includes('Plan')) return <RefreshCw size={14} className="text-blue-400" />
    return <Shield size={14} className="text-slate-400" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('Delete')) return 'bg-red-500/10 text-red-400'
    if (action.includes('Suspend')) return 'bg-amber-500/10 text-amber-400'
    if (action.includes('Activate')) return 'bg-emerald-500/10 text-emerald-400'
    if (action.includes('Plan')) return 'bg-blue-500/10 text-blue-400'
    return 'bg-slate-700 text-slate-300'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-slate-400 mt-1">Track all administrative actions</p>
      </div>

      <div className="rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-400">Loading...</div>
        ) : auditLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No audit logs yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target User</th>
                  <th className="px-6 py-3">Admin ID</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white font-medium">{log.targetEmail}</td>
                    <td className="px-6 py-3 text-slate-400 font-mono text-xs">{log.adminId}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {(log.timestamp as { toDate?: () => Date })?.toDate?.().toLocaleString() ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
