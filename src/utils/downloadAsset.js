/**
 * downloadAsset.js — client-side asset download helpers.
 *
 * Assets are generated as SVG strings (see brand asset templates). These
 * helpers let the admin download them as SVG, or rasterize to PNG via canvas
 * at a configurable scale for crisp output. No backend or storage involved.
 */

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function withExt(filename, ext) {
  return filename.toLowerCase().endsWith(`.${ext}`) ? filename : `${filename}.${ext}`
}

export function downloadSvg(svgString, filename) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  triggerDownload(blob, withExt(filename, 'svg'))
}

/** Rasterize an SVG string to a PNG Blob at `scale`× the given dimensions. */
export function svgToPngBlob(svgString, width, height, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Canvas toBlob returned null'))),
        'image/png'
      )
    }
    img.onerror = () => reject(new Error('Failed to load SVG for rasterization'))
    // data: URL keeps the canvas untainted (no external resources in our SVGs)
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)
  })
}

export async function downloadPng(svgString, width, height, filename, scale = 2) {
  const blob = await svgToPngBlob(svgString, width, height, scale)
  triggerDownload(blob, withExt(filename, 'png'))
}

export function downloadText(text, filename, mime = 'text/plain') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  triggerDownload(blob, filename)
}
