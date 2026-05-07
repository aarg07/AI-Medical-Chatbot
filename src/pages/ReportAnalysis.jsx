import { useCallback, useEffect, useState, useRef } from 'react'
import { Upload, FileText, Loader2, AlertTriangle, Download, Trash2, Camera, CheckCircle2, Phone, Activity, Apple, Pill, ShieldAlert, Stethoscope, Sun, History, Utensils, FlaskConical, Eye } from 'lucide-react'
import { apiClient } from '../utils/apiClient'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const emptyReport = {
  summary: 'No analysis available. Please try again with a clearer report image.',
  lacking: [],
  possible_diseases: [],
  deficiencies: [],
  nutrients_needed: [],
  minerals_needed: [],
  vitamins_needed: [],
  symptoms: [],
  foods_to_eat: [],
  remedies: [],
  basic_medicines: [],
  warning: 'See doctor if symptoms worsen.',
  emergency: false,
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normalizeReport(analysis) {
  if (!analysis) return emptyReport
  if (typeof analysis === 'string') {
    return { ...emptyReport, summary: analysis }
  }

  return {
    summary: analysis.summary || emptyReport.summary,
    lacking: asArray(analysis.lacking),
    possible_diseases: asArray(analysis.possible_diseases),
    deficiencies: asArray(analysis.deficiencies),
    nutrients_needed: asArray(analysis.nutrients_needed),
    minerals_needed: asArray(analysis.minerals_needed),
    vitamins_needed: asArray(analysis.vitamins_needed),
    symptoms: asArray(analysis.symptoms),
    foods_to_eat: asArray(analysis.foods_to_eat),
    remedies: asArray(analysis.remedies),
    basic_medicines: asArray(analysis.basic_medicines),
    warning: analysis.warning || emptyReport.warning,
    emergency: Boolean(analysis.emergency),
  }
}

function InfoCard({ title, icon, children, tone = 'slate' }) {
  const IconComponent = icon
  const toneClass = {
    slate: 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/70',
    red: 'border-red-100 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/20',
    green: 'border-green-100 bg-green-50/80 dark:border-green-900/50 dark:bg-green-950/20',
    blue: 'border-blue-100 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/20',
    amber: 'border-amber-100 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20',
  }[tone]

  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm dark:bg-slate-900">
          <IconComponent className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function TagList({ items, emptyText = 'None found in the uploaded report.' }) {
  if (!items.length) {
    return <p className="text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{emptyText}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {item}
        </span>
      ))}
    </div>
  )
}

function StepList({ items, emptyText }) {
  if (!items.length) {
    return <p className="text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">{emptyText}</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ReportAnalysis() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [reportHistory, setReportHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const reportRef = useRef(null)

  const loadReportHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const data = await apiClient.getHistory()
      setReportHistory(data.reports || [])
    } catch (err) {
      console.error('Failed to load report history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadReportHistory, 0)
    return () => clearTimeout(timer)
  }, [loadReportHistory])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image is too large (max 10MB)')
        return
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError('Upload an image or PDF report file.')
        return
      }
      setError(null)
      setImage(file)
      setAnalysis(null)
      if (file.type === 'application/pdf') {
        setPreview(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!image || loading) return
    setLoading(true)
    setError(null)

    try {
      const data = await apiClient.analyzeReport(image)
      if (!data || !data.analysis) throw new Error('No analysis generated. Please try again.')
      setAnalysis(data)
      loadReportHistory()
    } catch (err) {
      console.error('Report analysis failed:', err)
      setError(err.message || 'Failed to connect to AI server.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!reportRef.current) return
    setError(null)
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pageWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`medical-report-analysis-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error('Failed to download report PDF:', err)
      setError('Could not download the report PDF. Please try again.')
    }
  }

  const reset = () => {
    setImage(null)
    setPreview(null)
    setAnalysis(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openReportFromHistory = (savedReport) => {
    if (!savedReport?.analysis) return
    setAnalysis(savedReport.analysis)
    setImage(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const report = normalizeReport(analysis?.analysis)

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 text-slate-800 dark:text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">AI Medical Report Analyzer</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-bold uppercase tracking-tight">
          Upload reports for instant, human-readable medical summaries
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
      {!analysis ? (
        <div className="panel-surface p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_4px_20px_rgba(225,29,72,0.3)]" />
          
          <div className="grid gap-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-4 border-dashed rounded-[40px] p-12 transition-all cursor-pointer group relative overflow-hidden ${
                preview ? 'border-red-500 bg-red-50/20 dark:bg-red-950/10' : 'border-slate-100 dark:border-slate-800 hover:border-red-500 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              {preview ? (
                <div className="relative z-10 space-y-6">
                  <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-3xl shadow-2xl border-8 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700" />
                  <p className="text-sm font-black text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Report Ready for Analysis
                  </p>
                </div>
              ) : image?.type === 'application/pdf' ? (
                <div className="relative z-10 space-y-6">
                  <div className="h-24 w-24 bg-red-50 dark:bg-red-950/20 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                    <FileText className="h-12 w-12 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{image.name}</p>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-[0.2em]">PDF selected</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-24 w-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner">
                    <Upload className="h-12 w-12 text-slate-300 dark:text-slate-600 group-hover:text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Click to Upload Report</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">MAX SIZE: 10MB (JPG, PNG, WEBP, PDF)</p>
                  </div>
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*,application/pdf"
            />

            {error && (
              <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-3xl border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in duration-300">
                <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!image || loading}
                className="primary-button px-12 py-5 text-xl font-black shadow-2xl shadow-red-200 dark:shadow-none disabled:opacity-50 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    <span>Analyze Now</span>
                  </>
                )}
              </button>
              {image && !loading && (
                <button onClick={reset} className="p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 transition-all group">
                  <Trash2 className="h-7 w-7 text-slate-400 group-hover:text-red-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Action Bar */}
          <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/60 p-5 rounded-[32px] border border-white/20 backdrop-blur-2xl sticky top-4 z-20 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800">
            <div className="flex items-center gap-4 ml-2">
              <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200 dark:shadow-none">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">Analysis Complete</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Secure MongoDB Storage Active</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={downloadPDF} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-red-500 transition-all flex items-center gap-3 group shadow-sm">
                <Download className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500" />
                <span className="text-sm font-black text-slate-800 dark:text-slate-300">Download Report</span>
              </button>
              <button onClick={reset} className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl shadow-red-200 dark:shadow-none transition-all flex items-center gap-3 group">
                <Trash2 className="h-5 w-5" />
                <span className="text-sm font-black">New Analysis</span>
              </button>
            </div>
          </div>

          <div ref={reportRef} className="panel-surface p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <FileText className="h-80 w-80" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b-4 border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 bg-red-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-red-200 dark:shadow-none ring-4 ring-red-50 dark:ring-red-950/20">
                    <FileText className="h-9 w-9 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Medical Diagnostic Report</h2>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em]">AI-Powered Clinical Analysis</p>
                  </div>
                </div>
                
                {/* Emergency Contacts Badge */}
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-black text-red-700 dark:text-red-400 tracking-tighter">Police: 100</span>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400 tracking-tighter">Ambulance: 102</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-6 ${report.emergency ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30' : 'border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20'}`}>
                <div className="mb-3 flex items-center gap-3">
                  {report.emergency ? (
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                  <p className={`text-xs font-black uppercase tracking-[0.22em] ${report.emergency ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                    {report.emergency ? 'Urgent Attention Needed' : 'Simple Report Summary'}
                  </p>
                </div>
                <p className="whitespace-pre-line text-base font-bold leading-8 text-slate-800 dark:text-slate-100">
                  {report.summary}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InfoCard title="Where You Are Lacking" icon={Activity} tone="red">
                  <StepList items={report.lacking} emptyText="No clear low or high values were detected." />
                </InfoCard>

                <InfoCard title="What It Can Indicate" icon={Stethoscope} tone="amber">
                  <TagList items={report.possible_diseases} emptyText="No likely condition could be inferred from this report." />
                </InfoCard>

                <InfoCard title="Deficiencies" icon={FlaskConical} tone="red">
                  <TagList items={report.deficiencies} />
                </InfoCard>

                <InfoCard title="Nutrients Needed" icon={Apple} tone="green">
                  <TagList items={report.nutrients_needed} emptyText="No specific nutrient need was detected." />
                </InfoCard>

                <InfoCard title="Minerals Needed" icon={FlaskConical} tone="blue">
                  <TagList items={report.minerals_needed} emptyText="No specific mineral need was detected." />
                </InfoCard>

                <InfoCard title="Vitamins Needed" icon={Sun} tone="green">
                  <TagList items={report.vitamins_needed} emptyText="No specific vitamin need was detected." />
                </InfoCard>

                <InfoCard title="Possible Symptoms" icon={Stethoscope} tone="blue">
                  <TagList items={report.symptoms} emptyText="No symptoms were clearly mentioned in the report." />
                </InfoCard>

                <InfoCard title="Warning" icon={AlertTriangle} tone={report.emergency ? 'red' : 'amber'}>
                  <p className="text-sm font-bold leading-7 text-slate-700 dark:text-slate-200">{report.warning}</p>
                </InfoCard>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <InfoCard title="What To Eat" icon={Utensils} tone="green">
                  <StepList items={report.foods_to_eat} emptyText="No specific food advice was suggested from this report." />
                </InfoCard>

                <InfoCard title="Simple Remedies" icon={Sun} tone="green">
                  <StepList items={report.remedies} emptyText="No home remedies were suggested from this report." />
                </InfoCard>

                <InfoCard title="Basic Medicines" icon={Pill} tone="blue">
                  <StepList items={report.basic_medicines} emptyText="No basic medicine advice was suggested. Ask a doctor before taking supplements." />
                </InfoCard>
              </div>
              
              <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex items-start gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-full w-2 bg-red-600 group-hover:w-4 transition-all" />
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1 animate-pulse" />
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Mandatory Medical Disclaimer</p>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">
                    This summary is strictly for informational purposes. The AI analysis should NOT be treated as a clinical diagnosis or medical prescription. 
                    India Emergency: Call **102 (Ambulance)** or **100 (Police)** immediately for critical situations. 
                    Always present this report and analysis to a certified medical professional before taking any action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>

        <aside className="panel-surface h-fit p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Report History</h2>
                <p className="text-xs font-semibold text-slate-500">Saved for 7 days</p>
              </div>
            </div>
            {historyLoading && <Loader2 className="h-4 w-4 animate-spin text-red-600" />}
          </div>

          <div className="space-y-3">
            {reportHistory.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-900/60">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">No saved report analyses yet.</p>
              </div>
            ) : (
              reportHistory.map((savedReport, index) => {
                const saved = normalizeReport(savedReport.analysis?.analysis)
                return (
                  <button
                    key={savedReport._id}
                    onClick={() => openReportFromHistory(savedReport)}
                    className="w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-red-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                        {index === 0 ? 'Latest Report' : `Report ${index + 1}`}
                      </span>
                      <Eye className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="line-clamp-2 text-sm font-bold leading-6 text-slate-800 dark:text-slate-100">
                      {saved.summary}
                    </p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      {new Date(savedReport.createdAt).toLocaleString()}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
