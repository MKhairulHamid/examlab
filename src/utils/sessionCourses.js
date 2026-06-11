// Registry of session-based prep courses keyed by exam slug fragment.
// A slug containing any of these fragments resolves to the matching course.
// Shared by StudyMaterial (to render the course) and ExamDetail (to show
// per-domain study progress), so the mapping stays in one place.

import aifC01Course from '../data/aifC01Course'

const SESSION_COURSES = [
  { match: ['aif', 'ai-practitioner'], course: aifC01Course },
]

export function getSessionCourse(slug) {
  const lowerSlug = (slug || '').toLowerCase()
  return SESSION_COURSES.find(entry =>
    entry.match.some(fragment => lowerSlug.includes(fragment))
  )?.course ?? null
}

export default getSessionCourse
