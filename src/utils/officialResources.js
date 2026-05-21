/**
 * Resolves the official certification resource URL for an exam.
 *
 * Priority:
 *   1. exam.official_url   — explicit value if the data ever provides one
 *   2. AWS cert mapping    — matched by slug/name keywords
 *   3. Provider hub        — AWS/Azure/GCP certification landing page
 *   4. null                — unknown; callers should hide the link
 */

// Ordered most-specific first so e.g. "…-professional" wins over "…-associate".
const AWS_CERT_RESOURCES = [
  { match: ['cloud-practitioner', 'cloud practitioner', 'clf-c'], url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
  { match: ['ai-practitioner', 'ai practitioner', 'aif-c'],        url: 'https://aws.amazon.com/certification/certified-ai-practitioner/' },
  { match: ['solutions-architect-professional', 'solutions architect professional', 'sap-c'], url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/' },
  { match: ['solutions-architect', 'solutions architect', 'saa-c'], url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
  { match: ['devops-engineer', 'devops', 'dop-c'],                 url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/' },
  { match: ['cloudops', 'sysops', 'soa-c'],                        url: 'https://aws.amazon.com/certification/certified-sysops-admin-associate/' },
  { match: ['data-engineer', 'data engineer', 'dea-c'],            url: 'https://aws.amazon.com/certification/certified-data-engineer-associate/' },
  { match: ['developer', 'dva-c'],                                 url: 'https://aws.amazon.com/certification/certified-developer-associate/' },
  { match: ['machine-learning-engineer', 'ml-engineer', 'ml engineer', 'mla-c'], url: 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/' },
  { match: ['machine-learning-specialty', 'machine learning', 'mls-c'], url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/' },
  { match: ['advanced-networking', 'networking', 'ans-c'],         url: 'https://aws.amazon.com/certification/certified-advanced-networking-specialty/' },
  { match: ['security', 'scs-c'],                                  url: 'https://aws.amazon.com/certification/certified-security-specialty/' },
  { match: ['generative', 'genai'],                                url: 'https://aws.amazon.com/certification/' },
]

const PROVIDER_HUBS = {
  aws:    'https://aws.amazon.com/certification/',
  azure:  'https://learn.microsoft.com/credentials/certifications/',
  gcp:    'https://cloud.google.com/learn/certification',
  google: 'https://cloud.google.com/learn/certification',
}

export function getOfficialResourceUrl(exam) {
  if (!exam) return null
  if (exam.official_url) return exam.official_url

  const haystack = `${exam.slug || ''} ${exam.name || ''}`.toLowerCase()
  const provider = (exam.provider || '').toLowerCase()

  // Non-AWS providers: no per-exam mapping yet — link to their cert hub.
  if (provider && !provider.includes('aws')) {
    return PROVIDER_HUBS[provider] || null
  }

  const found = AWS_CERT_RESOURCES.find(r => r.match.some(k => haystack.includes(k)))
  return found ? found.url : PROVIDER_HUBS.aws
}

export default getOfficialResourceUrl
