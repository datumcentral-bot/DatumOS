import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

// Allowed file types
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/octet-stream': '.ifc', // IFC files
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const category = formData.get('category') || 'general' // cde, model-production, general

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Size check
    const bytes = await file.arrayBuffer()
    if (bytes.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max size is 50MB.` }, { status: 400 })
    }

    // Type check — be permissive for IFC/RVT/NWD
    const mimeType = file.type || 'application/octet-stream'
    const originalName = file.name || 'upload'
    const ext = extname(originalName).toLowerCase() || '.bin'

    // Allowed extensions
    const ALLOWED_EXTS = ['.pdf','.jpg','.jpeg','.png','.gif','.webp','.xls','.xlsx','.doc','.docx','.zip','.txt','.csv','.ifc','.rvt','.nwd','.nwc','.dwg','.dxf','.3dm','.obj','.fbx','.glb','.gltf','.mp4','.mov','.avi']
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: `File type ${ext} not allowed.` }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', category)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const uniqueName = `${randomUUID()}${ext}`
    const filePath = join(uploadDir, uniqueName)

    // Write file
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${category}/${uniqueName}`

    return NextResponse.json({
      url: publicUrl,
      fileName: originalName,
      fileSize: bytes.byteLength,
      fileType: mimeType || ext.replace('.', '').toUpperCase(),
      path: filePath,
    }, { status: 201 })

  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}