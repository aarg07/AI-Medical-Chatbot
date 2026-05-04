import React, { useState, useRef } from 'react'
import { 
  FileText, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Activity, 
  Droplets, 
  Pill, 
  Hospital,
  Download
} from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { analyzeMedicalReport } from '../utils/apiClient'
import ReactMarkdown from 'react-markdown'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ReportAnalysis() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const resultRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage({
        data: reader.result.split(',')[1],
        mimeType: file.type,
        previewUrl: reader.result
      })
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please upload an image of the medical report to proceed.")
      return
    }

    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const messages = [
        { 
          role: 'user', 
          content: 'Analyze this medical report image in extreme detail. Extract all laboratory values, identify any abnormalities, detect nutrient deficiencies, and provide a full diagnostic summary with actionable solutions.', 
          image: selectedImage 
        }
      ]
      const result = await analyzeMedicalReport(messages)
      setAnalysisResult(result)
    } catch (err) {
      setError("Failed to analyze the report image. Please ensure the text is clear and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const exportPDF = async () => {
    if (!resultRef.current) return

    try {
      const canvas = await html2canvas(resultRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('Medical_Report_Analysis.pdf')
    } catch (error) {
      alert('Unable to export the report as PDF.')
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <section className="hero-panel p-8 sm:p-10">
        <div>
          <p className="hero-kicker">Vision Diagnostic Suite</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Image Report Analyzer
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300">
            Upload a clear photo of your lab results or medical documents. Our AI vision system will extract all markers, detect deficiencies, and provide a detailed diagnostic report.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <section className="panel-surface p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <Upload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Report Image</h2>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[300px] ${
                  selectedImage 
                  ? 'border-red-500 bg-red-50/30 dark:bg-red-900/10' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                
                {selectedImage ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img src={selectedImage.previewUrl} alt="Preview" className="h-48 w-48 object-contain rounded-2xl shadow-xl border-4 border-white dark:border-slate-800" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        className="absolute -top-3 -right-3 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg text-red-500 hover:scale-110 transition-transform"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400">Report image loaded successfully</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Drop your report here</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">Capture a clear photo of your medical document for the most accurate diagnosis.</p>
                    <button className="mt-6 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium">Browse Files</button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !selectedImage}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-300 dark:disabled:from-slate-800 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Report...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Run Diagnostic Analysis
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="panel-surface p-6 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Analysis Report</h2>
            </div>
            
            {analysisResult && (
              <button 
                onClick={exportPDF}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {!analysisResult && !isLoading && (
                <Motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-10"
                >
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-medium">No Analysis Data</h3>
                  <p className="text-sm text-slate-500 mt-2">Upload a report and run analysis to see results here.</p>
                </Motion.div>
              )}

              {isLoading && (
                <Motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-red-500/20 rounded-full animate-ping absolute" />
                    <div className="w-20 h-20 border-4 border-t-red-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Scanning markers & values...</p>
                </Motion.div>
              )}

              {analysisResult && (
                <Motion.div 
                  ref={resultRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate dark:prose-invert max-w-none"
                >
                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Feature Info */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Pill, label: 'Medicine Advice', desc: 'Identifies standard medications' },
          { icon: Droplets, label: 'Nutrient Check', desc: 'Detects vitamin deficiencies' },
          { icon: Activity, label: 'Disease Detection', desc: 'Analyzes disease patterns' },
          { icon: Hospital, label: 'Triage Info', desc: 'Visit or stay home guidance' },
        ].map((item) => (
          <div key={item.label} className="panel-surface p-4 flex items-start gap-3">
            <item.icon className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
