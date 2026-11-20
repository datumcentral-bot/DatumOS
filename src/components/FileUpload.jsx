'use client'
import { useState, useRef } from 'react'

const FILE_ICONS = {
  pdf: '📄', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
  xls: '📊', xlsx: '📊', doc: '📝', docx: '📝', zip: '🗜️', txt: '📃',
  csv: '📊', ifc: '🏗️', rvt: '🏗️', nwd: '🏗️', nwc: '🏗️', dwg: '📐',
  dxf: '📐', mp4: '🎬', mov: '🎬',
}

function getExt(name) {
  return (name || '').split('.').pop().toLowerCase()
}

function getIcon(name) {
  return FILE_ICONS[getExt(name)] || '📎'
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Reusable file upload widget — military themed
export function FileUpload({ category = 'general', value, onChange, label = 'ATTACH FILE' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('category', category)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange({ url: data.url, fileName: data.fileName, fileSize: data.fileSize, fileMime: data.fileType })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clear = () => onChange({ url: '', fileName: '', fileSize: 0, fileMime: '' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {value?.url ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#1a2010', border: '1px solid #3a5020', borderRadius: 4, padding: '8px 12px'
        }}>
          <span style={{ fontSize: 20 }}>{getIcon(value.fileName)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: '#e8d5a3', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.fileName}
            </div>
            {value.fileSize > 0 && (
              <div style={{ fontSize: 11, color: '#6a7a60' }}>{fmtSize(value.fileSize)}</div>
            )}
          </div>
          <a href={value.url} target="_blank" rel="noreferrer" download={value.fileName}
            style={{ padding: '4px 10px', background: '#234b84', border: 'none', color: '#e8d5a3', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, textDecoration: 'none' }}>
            ⬇ DOWNLOAD
          </a>
          <button type="button" onClick={clear}
            style={{ padding: '4px 8px', background: '#5a1a1a', border: 'none', color: '#e8d5a3', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700 }}>
            ✕
          </button>
        </div>
      ) : (
        <div>
          <input ref={inputRef} type="file" onChange={handleFile} style={{ display: 'none' }}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.doc,.docx,.zip,.txt,.csv,.ifc,.rvt,.nwd,.nwc,.dwg,.dxf,.mp4,.mov" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', background: uploading ? '#2a3020' : '#1a2010',
              border: '1px dashed #3a5020', color: uploading ? '#6a7a60' : '#8a9a70',
              borderRadius: 4, cursor: uploading ? 'not-allowed' : 'pointer',
              fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1,
              width: '100%', justifyContent: 'center'
            }}>
            {uploading ? '⏳ UPLOADING...' : `📎 ${label}`}
          </button>
          {error && <div style={{ color: '#e05050', fontSize: 11, marginTop: 4, fontFamily: 'Rajdhani,sans-serif' }}>⚠ {error}</div>}
          <div style={{ fontSize: 10, color: '#4a5a40', marginTop: 3, fontFamily: 'Rajdhani,sans-serif' }}>
            PDF, IFC, RVT, NWD, DWG, images, Office docs — max 50MB
          </div>
        </div>
      )}
    </div>
  )
}

// Download button for table rows
export function FileDownloadBtn({ url, fileName }) {
  if (!url) return <span style={{ color: '#4a5a40', fontSize: 11 }}>—</span>
  return (
    <a href={url} target="_blank" rel="noreferrer" download={fileName}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', background: '#1a2a3a', border: '1px solid #234b84',
        color: '#7ab3e0', borderRadius: 3, fontSize: 11,
        fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, textDecoration: 'none',
        cursor: 'pointer', letterSpacing: 0.5
      }}>
      {getIcon(fileName)} {fileName ? fileName.substring(0, 20) + (fileName.length > 20 ? '…' : '') : 'FILE'}
    </a>
  )
}

export { getIcon, fmtSize }
