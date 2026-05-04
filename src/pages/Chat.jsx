import { useRef } from 'react'
import { Download, LocateFixed, ScanHeart, ShieldAlert, Volume2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import ChatWindow from '../components/ChatWindow'
import EmergencyContacts from '../components/EmergencyContacts'
import InputBar from '../components/InputBar'
import QuickChips from '../components/QuickChips'
import { useChat } from '../hooks/useChat'

const supportCards = [
  {
    title: 'Voice guidance',
    description: 'Listen to AI steps aloud when your hands are busy or stress levels are high.',
    icon: Volume2,
  },
  {
    title: 'Image review',
    description: 'Attach a photo to give the assistant more context for visible injuries.',
    icon: ScanHeart,
  },
  {
    title: 'Nearby support',
    description: 'Use the map shortcut to look for nearby hospitals from your current location.',
    icon: LocateFixed,
  },
]

export default function Chat({ user }) {
  const { messages, input, setInput, isLoading, sendMessage, chatBottomRef } = useChat()
  const chatExportRef = useRef(null)

  const exportPDF = async () => {
    if (!chatExportRef.current) return

    try {
      const canvas = await html2canvas(chatExportRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }

      pdf.save('Emergency_Guide_Session.pdf')
    } catch (error) {
      console.error('PDF generation failed', error)
      alert('Unable to export the session as PDF.')
    }
  }

  return (
    <div className="space-y-8">
      <section className="hero-panel p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="hero-kicker">Assistant workspace</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Hi {user?.name ?? 'Responder'}, what medical concern are you handling?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-300">
              Type symptoms, ask about a disease, use a quick chip, attach an image, or speak directly. The assistant will answer in calm step-by-step language.
            </p>
          </div>

          <button className="secondary-button" onClick={exportPDF} type="button">
            <Download className="h-4 w-4" />
            <span>Export chat as PDF</span>
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel-surface flex min-h-[70vh] flex-col overflow-hidden p-0">
          <div className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-3">
              {supportCards.map((card) => {
                const IconComponent = card.icon

                return (
                <article key={card.title} className="mini-card min-h-0">
                  <IconComponent className="h-5 w-5 text-red-500" />
                  <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{card.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{card.description}</p>
                </article>
              )})}
            </div>
          </div>

          <ChatWindow
            chatBottomRef={chatBottomRef}
            chatExportRef={chatExportRef}
            isLoading={isLoading}
            messages={messages}
          />

          <QuickChips onSend={sendMessage} />
          <InputBar
            input={input}
            isLoading={isLoading}
            sendMessage={sendMessage}
            setInput={setInput}
          />
        </section>

        <aside className="space-y-6">
          <EmergencyContacts />

          <div className="panel-surface p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Usage reminders</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <p>Use the quick chips when you need speed and the text box when details matter.</p>
              <p>The assistant helps with symptom guidance and first response, but severe symptoms still need an urgent professional call.</p>
              <p>Export the session if you want a clean handoff summary for notes or presentation purposes.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
