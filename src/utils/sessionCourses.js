// Registry of session-based prep courses keyed by exam slug fragment.
// A slug containing any of these fragments resolves to the matching course.
// Shared by StudyMaterial (to render the course) and ExamDetail (to show
// per-domain study progress), so the mapping stays in one place.

import aifC01Course from '../data/aifC01Course'
import clfC02Course from '../data/clfC02Course'
import saaC03Course from '../data/saaC03Course'
import dvaC02Course from '../data/dvaC02Course'
import mlaC01Course from '../data/mlaC01Course'
import sapC02Course from '../data/sapC02Course'
import aipC01Course from '../data/aipC01Course'
import soaC03Course from '../data/soaC03Course'
import dopC02Course from '../data/dopC02Course'
import deaC01Course from '../data/deaC01Course'

const SESSION_COURSES = [
  { match: ['aif', 'ai-practitioner'], course: aifC01Course },
  { match: ['clf', 'cloud-practitioner'], course: clfC02Course },
  { match: ['saa', 'solutions-architect-associate'], course: saaC03Course },
  { match: ['dva', 'developer-associate'], course: dvaC02Course },
  { match: ['mla', 'machine-learning-engineer-associate'], course: mlaC01Course },
  { match: ['sap', 'solutions-architect-professional'], course: sapC02Course },
  { match: ['aip', 'generative-ai-developer'], course: aipC01Course },
  { match: ['soa', 'cloudops-engineer-associate'], course: soaC03Course },
  { match: ['dop', 'devops-engineer-professional'], course: dopC02Course },
  { match: ['dea', 'data-engineer-associate'], course: deaC01Course },
]

export function getSessionCourse(slug) {
  const lowerSlug = (slug || '').toLowerCase()
  return SESSION_COURSES.find(entry =>
    entry.match.some(fragment => lowerSlug.includes(fragment))
  )?.course ?? null
}

export default getSessionCourse
