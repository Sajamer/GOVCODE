'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { IScreenshot } from '@/types/dashboard'
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ImageModalProps {
  screenshots: IScreenshot[]
  isOpen: boolean
  onClose: () => void
}

export default function ImageModal({
  screenshots,
  isOpen,
  onClose,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : screenshots.length - 1,
    )
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < screenshots.length - 1 ? prevIndex + 1 : 0,
    )
  }

  const openInNewTab = () => {
    window.open(screenshots[currentIndex].image, '_blank')
  }

  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = screenshots[currentIndex].image
    link.download = `screenshot-${screenshots[currentIndex].id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-hidden p-0">
        <DialogTitle className="sr-only" />
        <DialogDescription className="sr-only" />
        <div className="relative mx-auto h-[60vh] w-[95%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={screenshots[currentIndex].image}
                alt={`Screenshot ${screenshots[currentIndex].id}`}
                layout="fill"
                objectFit="contain"
              />
            </motion.div>
          </AnimatePresence>
          {screenshots.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 opacity-50 transition-all hover:opacity-75"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 opacity-50 transition-all hover:opacity-75"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-4">
          <button
            onClick={openInNewTab}
            className="rounded-full bg-white p-2 opacity-50 transition-all hover:opacity-75"
          >
            <ExternalLink className="size-5" />
          </button>
          <button
            onClick={downloadImage}
            className="rounded-full bg-white p-2 opacity-50 transition-all hover:opacity-75"
          >
            <Download className="size-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
