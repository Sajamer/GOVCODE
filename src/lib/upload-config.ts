/**
 * File upload configuration
 * Set the upload method here to switch between local and cloud storage
 */

export const UPLOAD_CONFIG = {
  // Set to 'local' for local file storage, 'uploadthing' for cloud storage
  method: 'local' as 'local' | 'uploadthing',

  // Local storage configuration
  local: {
    uploadDir: '/uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      '.pdf',
      '.doc',
      '.docx',
      '.txt',
      '.jpg',
      '.jpeg',
      '.png',
      '.xls',
      '.xlsx',
    ],
  },

  // UploadThing configuration (if you want to switch back)
  uploadthing: {
    maxFileSize: 4 * 1024 * 1024, // 4MB (UploadThing free tier limit)
  },
}

export const isLocalUpload = () => UPLOAD_CONFIG.method === 'local'
export const isUploadThingEnabled = () => UPLOAD_CONFIG.method === 'uploadthing'
