/* eslint-disable @typescript-eslint/naming-convention */
'use client'

import { useToast } from '@/hooks/use-toast'
import { useUploadThing } from '@/lib/uploadthing'
import { cn } from '@/lib/utils'
import {
  Image as ImageIcon,
  Loader2,
  MousePointerSquareDashed,
} from 'lucide-react'
import { FC, useState, useTransition } from 'react'
import Dropzone, { FileRejection } from 'react-dropzone'
import { Progress } from '../ui/progress'

interface IDragAndDropImageProps {
  callback: (imageUrl: string) => void
}

const DragAndDropImage: FC<IDragAndDropImageProps> = ({
  callback,
}): JSX.Element => {
  const { toast } = useToast()
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: ([data]) => {
      const imageUrl = data.url
      callback(imageUrl)
    },
    onUploadProgress(p) {
      setUploadProgress(p)
    },
  })

  const onDropRejected = (rejectedFiles: FileRejection[]): void => {
    const [file] = rejectedFiles

    setIsDragOver(false)

    toast({
      title: `${file.file.type} type is not supported.`,
      description: 'Please choose a PNG, JPG, or JPEG image instead.',
      variant: 'destructive',
    })
  }

  const onDropAccepted = (acceptedFiles: File[]): void => {
    startUpload(acceptedFiles, { image: undefined })

    setIsDragOver(false)
  }

  const [isPending] = useTransition()

  return (
    <div
      className={cn(
        'relative size-[150px] bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-full flex justify-center flex-col items-center text-center',

        isDragOver && 'ring-blue-900/25 bg-blue-900/10',
      )}
    >
      <div className="relative flex w-full flex-1 flex-col items-center justify-center">
        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
          }}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className="flex size-full flex-1 flex-col items-center justify-center"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragOver ? (
                <MousePointerSquareDashed className="mb-2 size-5 text-zinc-500" />
              ) : isUploading || isPending ? (
                <Loader2 className="mb-2 size-5 animate-spin text-zinc-500" />
              ) : (
                <ImageIcon className="mb-2 size-5 text-zinc-500" />
              )}
              <div className="mb-2 flex flex-col justify-center text-xs text-zinc-700">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs">Uploading...</p>
                    <Progress
                      value={uploadProgress}
                      className="mt-2 h-2 w-28 bg-gray-300"
                    />
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center">
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isDragOver ? (
                  <p>
                    <span className="font-semibold">Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>

              {isPending ? null : (
                <p className="text-[0.6rem] text-zinc-500">PNG, JPG, JPEG</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  )
}

export default DragAndDropImage
