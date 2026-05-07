import { useCallback, useState, useEffect } from 'react'
import { 
  FileText, 
  ChevronRight, 
  AlertCircle, 
  Stethoscope, 
  Droplets, 
  Activity,
  Loader2,
  X,
} from 'lucide-react'
import { apiClient } from '../../utils/apiClient'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState(null)

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient.getAdminReports(page)
      setReports(data.reports)
      setTotalPages(data.pages)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const timer = setTimeout(loadReports, 0)
    return () => clearTimeout(timer)
  }, [loadReports])

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Medical Reports</h1>
          <p className="text-sm font-semibold text-slate-500">Monitor AI-analyzed medical reports and detected deficiencies.</p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Motion.div 
            key={report._id}
            layoutId={report._id}
            onClick={() => setSelectedReport(report)}
            className="panel-surface group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-red-500/20"
          >
            <div className="relative h-2 bg-gradient-to-r from-red-500 to-orange-500" />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 p-2 text-red-600">
                    <FileText className="h-full w-full" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{report.userId?.name || 'Anonymous'}</p>
                    <p className="text-xs font-semibold text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {report.analysis?.analysis?.emergency && (
                  <span className="badge badge--red">Urgent</span>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <p className="line-clamp-2 text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                  {report.analysis?.analysis?.summary}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {report.analysis?.analysis?.deficiencies?.slice(0, 3).map((def, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                      {def}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Detailed Analysis</span>
                <ChevronRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div className="flex h-32 flex-col items-center justify-center text-slate-400">
          <FileText size={32} className="mb-2 opacity-20" />
          <p className="text-sm font-bold">No reports analyzed yet</p>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-500">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200"
            disabled={page >= totalPages}
            onClick={() => setPage(current => Math.min(totalPages, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <Motion.div 
              layoutId={selectedReport._id}
              className="panel-surface relative w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-red-500 p-2.5 text-white">
                    <Stethoscope className="h-full w-full" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Analysis Details</h2>
                    <p className="text-xs font-bold text-slate-500">Patient: {selectedReport.userId?.name} - {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <section>
                      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-red-600">Clinical Summary</h3>
                      <div className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-900/60">
                        <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-200">
                          {selectedReport.analysis?.analysis?.summary}
                        </p>
                      </div>
                    </section>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4 dark:border-red-900/20">
                        <div className="flex items-center gap-2 text-red-600">
                          <Droplets size={16} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Deficiencies</h4>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {selectedReport.analysis?.analysis?.deficiencies?.map((item, i) => (
                            <li key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/20">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Activity size={16} />
                          <h4 className="text-[10px] font-black uppercase tracking-widest">Possible Risks</h4>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {selectedReport.analysis?.analysis?.possible_diseases?.map((item, i) => (
                            <li key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300">- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4 dark:border-orange-900/20">
                      <div className="flex items-center gap-2 text-orange-600">
                        <AlertCircle size={16} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Medical Warning</h4>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300 italic">
                        "{selectedReport.analysis?.analysis?.warning}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">Extracted Raw Text (OCR)</h3>
                      <div className="max-h-[300px] overflow-y-auto rounded-3xl bg-slate-900 p-6 text-slate-400">
                        <code className="text-xs leading-relaxed">
                          {selectedReport.analysis?.ocrText || 'No OCR text available'}
                        </code>
                      </div>
                    </section>
                    
                    <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900/60">
                       <h4 className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Recommended Remedies</h4>
                       <div className="flex flex-wrap gap-2">
                         {selectedReport.analysis?.analysis?.remedies?.map((rem, i) => (
                           <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm dark:bg-slate-800">{rem}</span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
