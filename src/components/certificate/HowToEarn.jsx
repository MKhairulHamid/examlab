import React from 'react'
import { CheckCircle2, Circle, BookOpen, FileCheck2, Award } from 'lucide-react'
import { Button } from '../../design-system'

/**
 * "How to earn this credential" — sets clear, unambiguous expectations on every
 * surface (public landing, exam detail, dashboard).
 *
 * mode:
 *   - 'static'  marketing/public — just the three steps.
 *   - 'live'    logged-in — each step shows progress (✓ / count) and a CTA to the next action.
 *
 * Props: program, mode, studyDone, studyTotal, examPassed, issued, onStudy, onExam.
 */
export function HowToEarn({
  program,
  mode = 'static',
  studyDone = 0,
  studyTotal,
  examPassed = false,
  issued = false,
  onStudy,
  onExam,
  className = '',
}) {
  const live = mode === 'live'
  const total = studyTotal ?? program?.sessions ?? null
  const studyComplete = total != null && studyDone >= total

  const steps = [
    {
      icon: BookOpen,
      title: total ? `Complete all ${total} study sessions` : 'Complete all study sessions',
      detail: live && total ? `${Math.min(studyDone, total)} of ${total} done` : `for ${program?.shortName || program?.name || 'this program'}`,
      done: studyComplete,
      cta: !studyComplete && onStudy ? { label: 'Continue studying', onClick: onStudy } : null,
    },
    {
      icon: FileCheck2,
      title: 'Pass the final mock exam',
      detail: 'score 70% or higher',
      done: examPassed,
      cta: studyComplete && !examPassed && onExam ? { label: 'Take the final exam', onClick: onExam } : null,
    },
    {
      icon: Award,
      title: 'Earn your Readiness credential',
      detail: 'issued automatically with a public verification link',
      done: issued,
      cta: null,
    },
  ]

  return (
    <div className={['rounded-xl border border-gray-200 bg-white p-5 sm:p-6', className].join(' ')}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
        How to earn this credential
      </h3>
      <ol className="mt-4 space-y-4">
        {steps.map((step, i) => {
          const StepIcon = step.icon
          return (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {live ? (
                  step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-[#00D4AA]" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A2540]/8 text-[0.6875rem] font-bold text-[#0A2540]">
                    {i + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StepIcon className="h-4 w-4 shrink-0 text-gray-400" />
                  <span
                    className={[
                      'text-sm font-semibold',
                      live && step.done ? 'text-gray-400 line-through' : 'text-[#0A2540]',
                    ].join(' ')}
                  >
                    {step.title}
                  </span>
                </div>
                <div className="mt-0.5 pl-6 text-xs text-gray-500">{step.detail}</div>
                {step.cta && (
                  <div className="mt-2 pl-6">
                    <Button variant="outline" size="sm" onClick={step.cta.onClick}>
                      {step.cta.label}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default HowToEarn
