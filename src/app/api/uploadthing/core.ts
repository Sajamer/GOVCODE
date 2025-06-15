import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { z } from 'zod'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ image: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input }
    })
    .onUploadComplete(async ({ file }) => {
      return { image: file.url }
    }),
  fileUploader: f({
    pdf: { maxFileSize: '16MB' },
    text: { maxFileSize: '16MB' },
    image: { maxFileSize: '8MB' },
    blob: { maxFileSize: '16MB' },
  })
    .input(z.object({ description: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url, name: file.name }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
