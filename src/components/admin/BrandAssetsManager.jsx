import React, { useMemo, useState } from 'react'
import { Download, Code, Check, Copy } from 'lucide-react'
import { ASSET_SPECS, BRAND } from '../../data/brand'
import { buildAssetSvg, emailSignatureHtml } from './brand/assetTemplates'
import { downloadSvg, downloadPng, downloadText } from '../../utils/downloadAsset'

const GROUP_ORDER = ['Logo', 'Google Ads', 'Instagram', 'Social', 'Favicon']

function AssetCard({ id, spec }) {
  const svg = useMemo(() => buildAssetSvg(id), [id])
  const [busy, setBusy] = useState(false)

  async function onPng() {
    setBusy(true)
    try {
      // Favicons want exact pixel size (scale 1); everything else 2× for crispness.
      const scale = spec.group === 'Favicon' ? 1 : 2
      await downloadPng(svg, spec.width, spec.height, `cel-${id}`, scale)
    } catch (e) {
      alert(`PNG export failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-card brand-asset-card">
      <div className="brand-asset-stage" data-tall={spec.height > spec.width}>
        <div className="brand-asset-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <div className="brand-asset-meta">
        <span className="brand-asset-label">{spec.label}</span>
        <span className="brand-asset-dim">{spec.width} × {spec.height}</span>
      </div>
      <div className="brand-asset-actions">
        <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={onPng} disabled={busy}>
          <Download size={14} /> {busy ? 'Rendering…' : 'PNG'}
        </button>
        <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => downloadSvg(svg, `cel-${id}`)}>
          <Code size={14} /> SVG
        </button>
      </div>
    </div>
  )
}

function EmailSignatureCard() {
  const html = useMemo(() => emailSignatureHtml(), [])
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className="admin-card brand-asset-card brand-asset-card--wide">
      <div className="brand-asset-stage brand-asset-stage--light">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="brand-asset-meta">
        <span className="brand-asset-label">Email signature</span>
        <span className="brand-asset-dim">HTML</span>
      </div>
      <div className="brand-asset-actions">
        <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy HTML'}
        </button>
        <button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => downloadText(html, 'cel-email-signature.html', 'text/html')}>
          <Download size={14} /> .html
        </button>
      </div>
    </div>
  )
}

export default function BrandAssetsManager() {
  const groups = useMemo(() => {
    const byGroup = {}
    for (const [id, spec] of Object.entries(ASSET_SPECS)) {
      ;(byGroup[spec.group] ||= []).push([id, spec])
    }
    return byGroup
  }, [])

  return (
    <div className="admin-section brand-assets">
      <h2 className="admin-section-title">Brand Assets</h2>
      <p className="admin-note">
        Ready-to-post assets generated live from the brand tokens. Download any as a
        crisp PNG or an editable SVG. Built for {BRAND.name} social and advertising.
      </p>

      {GROUP_ORDER.filter(g => groups[g]).map(group => (
        <section key={group} className="brand-block">
          <h3 className="admin-list-title">{group}</h3>
          <div className="brand-asset-grid" data-group={group}>
            {groups[group].map(([id, spec]) => (
              <AssetCard key={id} id={id} spec={spec} />
            ))}
          </div>
        </section>
      ))}

      <section className="brand-block">
        <h3 className="admin-list-title">Email</h3>
        <div className="brand-asset-grid">
          <EmailSignatureCard />
        </div>
      </section>
    </div>
  )
}
