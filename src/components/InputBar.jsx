import React, { useState, useRef } from 'react'
import { Send, Mic, ImagePlus, X, Loader2 } from 'lucide-react'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function InputBar({ input, setInput, isLoading, sendMessage }) {
  const [isListening, setIsListening] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input, selectedImage)
    setInput('')
    setSelectedImage(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input, selectedImage)
      setInput('')
      setSelectedImage(null)
    }
  }

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input.")
      return
    }

    if (isListening) return;

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript) // visually update the bar
      sendMessage(transcript, selectedImage) // auto-send instantly!
      setSelectedImage(null)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.")
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Please select an image under 8 MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage({
        data: reader.result.split(',')[1],
        mimeType: file.type,
        previewUrl: reader.result
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-800/50 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl mx-auto">
        
        <AnimatePresence>
          {selectedImage && (
            <Motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl w-max relative ring-1 ring-slate-200 dark:ring-slate-700"
            >
              <img src={selectedImage.previewUrl} alt="Wound Preview" className="h-16 w-16 object-cover rounded-xl shadow-sm" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 pr-8">
                Symptom image attached
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-red-500 shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </Motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          
          <div className="flex flex-col gap-2 pb-1">
            <Motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              title="Upload symptom image"
            >
              <ImagePlus className="w-5 h-5" />
            </Motion.button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />

            <Motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListen}
              className={`p-3 rounded-full transition-colors shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </Motion.button>
          </div>

          <div className="flex-1 relative">
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening to your medical question..." : "Describe symptoms, ask about a disease, or upload a medical image..."}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none transition-shadow shadow-inner"
            />
          </div>

          <Motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white p-4 flex items-center justify-center rounded-[1.5rem] transition-all shadow-md shadow-red-500/20 disabled:shadow-none"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-1" />}
          </Motion.button>
        </div>

      </form>
    </div>
  )
}
