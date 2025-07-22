# Local File Upload System

This document explains how the local file upload system works as a replacement for UploadThing.

## Overview

The local file upload system stores files on your server's file system instead of using cloud storage. Files are saved to the `public/uploads` directory and metadata is stored in your database.

## How It Works

### File Storage

- **Location**: Files are stored in `public/uploads/` directory
- **Accessibility**: Files are accessible to all users in your organization
- **Persistence**: Files persist on your server and are backed up with your server data

### Database Storage

- File metadata is stored in the existing `Attachment` table
- Includes: file name, local URL, size, type, and audit detail association

### Upload Process

1. User selects a file
2. File is uploaded to `/api/upload/local` endpoint
3. Server saves file to `public/uploads/` with a unique filename
4. Metadata is saved to database
5. File becomes immediately available to all organization users

## API Endpoints

### POST `/api/upload/local`

Upload a new file for audit details

- **Body**: FormData with `file` and `auditDetailId`
- **Response**: File metadata with local URL
- **Use case**: Audit attachments

### POST `/api/upload/general`

Upload a new file (general purpose)

- **Body**: FormData with `file`
- **Response**: File metadata with local URL
- **Use case**: Screenshots, general files that don't need immediate database linking

### DELETE `/api/upload/local/[id]`

Delete a file

- **Parameter**: Attachment ID
- **Action**: Removes file from filesystem and database

### GET `/api/upload/local/[id]`

Get file information

- **Parameter**: Attachment ID
- **Response**: File metadata

## Configuration

Edit `src/lib/upload-config.ts` to configure:

- Upload method (local vs cloud)
- File size limits
- Allowed file types
- Upload directory

## File Access

Files are accessible via direct URLs:

- Format: `/uploads/[unique-filename]`
- Example: `/uploads/1703123456789-abc123.pdf`

## Utility Functions

The system provides two main upload functions:

### `uploadFilesLocally(fileType, options)`

- **Purpose**: Upload files for audit details
- **Parameters**:
  - `fileType`: String (for UploadThing compatibility)
  - `options`: Object with `files` array and optional `input.auditDetailId`
- **Returns**: Array of `LocalUploadResult`
- **Use case**: Audit attachments that need immediate database linking

### `uploadFilesGenerally(fileType, options)`

- **Purpose**: Upload files for general use (screenshots, etc.)
- **Parameters**:
  - `fileType`: String (for UploadThing compatibility)
  - `options`: Object with `files` array and optional `input` object
- **Returns**: Array of `LocalUploadResult`
- **Use case**: Screenshots and other files that will be handled by calling code

### `deleteFileLocally(attachmentId)`

- **Purpose**: Delete files from local storage
- **Parameters**: `attachmentId` string
- **Use case**: Remove uploaded files

## Security Considerations

1. **File Types**: Only specific file types are allowed (configurable)
2. **Size Limits**: File size is limited (configurable)
3. **Authentication**: Upload requires user authentication
4. **Unique Names**: Files get unique names to prevent conflicts

## Backup and Storage

- Files are stored locally on your server
- Include `public/uploads/` in your backup strategy
- Files are excluded from git (added to .gitignore)

## Migration from UploadThing

The system is designed as a drop-in replacement:

- Same interface in React components
- Existing file URLs remain functional
- Database schema unchanged

## Switching Back to UploadThing

To switch back to UploadThing:

1. Change `method` in `upload-config.ts` to `'uploadthing'`
2. Update imports in components to use UploadThing functions
3. Ensure UploadThing configuration is set up

## Benefits of Local Storage

1. **Cost**: No cloud storage fees
2. **Control**: Full control over file management
3. **Speed**: Faster uploads (no external API calls)
4. **Privacy**: Files stay on your infrastructure
5. **Reliability**: No dependency on external services

## Considerations

1. **Server Storage**: Requires adequate server storage space
2. **Backups**: Files need to be included in backup strategy
3. **Scaling**: May need storage optimization for large deployments
4. **CDN**: Consider adding CDN for better performance if needed
