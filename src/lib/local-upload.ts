/**
 * Local file upload utility functions to replace UploadThing
 * These functions handle local file storage on the server
 */

export interface LocalUploadResult {
  id: string
  name: string
  url: string
  size?: number
  type?: string
}

export interface LocalUploadOptions {
  files: File[]
  input?: {
    description?: string
    auditDetailId?: string
  }
}

/**
 * Upload files to local server storage
 * Replacement for UploadThing's uploadFiles function
 */
export async function uploadFilesLocally(
  fileType: string, // For compatibility with UploadThing API
  options: LocalUploadOptions,
): Promise<LocalUploadResult[]> {
  const { files, input } = options
  const results: LocalUploadResult[] = []

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    if (input?.auditDetailId) {
      formData.append('auditDetailId', input.auditDetailId)
    }
    if (input?.description) {
      formData.append('description', input.description)
    }

    try {
      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      results.push(result)
    } catch (error) {
      console.error('Upload error for file:', file.name, error)
      throw error
    }
  }

  return results
}

/**
 * Delete a file from local storage
 * Replacement for UploadThing's deleteFiles function
 */
export async function deleteFileLocally(attachmentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/upload/local/${attachmentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Delete failed')
    }
  } catch (error) {
    console.error('Delete error for attachment:', attachmentId, error)
    throw error
  }
}

/**
 * Get file information
 */
export async function getFileInfo(
  attachmentId: string,
): Promise<LocalUploadResult> {
  try {
    const response = await fetch(`/api/upload/local/${attachmentId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Get file info failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Get file info error for attachment:', attachmentId, error)
    throw error
  }
}

/**
 * Create a local file URL for viewing/downloading
 */
export function createLocalFileUrl(filename: string): string {
  return `/uploads/${filename}`
}

/**
 * Extract filename from local URL
 */
export function getFilenameFromLocalUrl(url: string): string {
  return url.split('/').pop() || ''
}
