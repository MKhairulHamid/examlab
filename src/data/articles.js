// Articles / blog content — single source of truth for the /blog index and
// /blog/:slug pages. Content is authored as typed blocks (no markdown dependency)
// so the renderer in BlogPost.jsx stays small and predictable.
//
// Block types:
//   { type: 'p', text }                      paragraph (supports **bold** inline)
//   { type: 'h2', text }                     section heading
//   { type: 'ul', items: [..] }              bullet list
//   { type: 'ol', items: [..] }              numbered list
//   { type: 'callout', text }                highlighted aside
//   { type: 'quote', text }                  pull quote
//
// IMPORTANT: keep the slug/title/description/date of each article in sync with
// ARTICLES_META in vite.config.js — that mirror drives SEO prerendering.
// No emoji in article content (brand guideline).

export const ARTICLES = [
  {
    slug: 'welcome-to-cloud-exam-lab',
    title: 'Welcome to Cloud Exam Lab: Learn Cloud the Way It Sticks',
    description:
      'What Cloud Exam Lab is, who it is for, and how our structured study sessions and exam-realistic practice help you actually pass your AWS certification.',
    date: '2026-01-15',
    updated: '2026-01-15',
    author: 'Cloud Exam Lab Team',
    readingTime: '5 min read',
    tags: ['Getting Started', 'Platform'],
    heroLead: 'A study platform built around how memory actually works.',
    body: [
      { type: 'p', text: 'Most people prepare for an AWS certification the same way: they watch a long video course, highlight a PDF, and then hammer practice questions until exam day. It feels productive. It rarely is. You recognise the right answer when you see it, walk into the exam, and discover that recognition is not the same as recall.' },
      { type: 'p', text: 'Cloud Exam Lab is built to close that gap. Instead of passive content you skim once, we structure your prep around short, focused study sessions and exam-realistic practice — the two things research consistently shows move knowledge into long-term memory.' },
      { type: 'h2', text: 'Who this is for' },
      { type: 'ul', items: [
        'Career switchers who want a recognised cloud credential without a computer-science background.',
        'Working professionals fitting study around a full-time job who need a clear, efficient path.',
        'Students and recent grads who want proof of skills that recruiters actually filter for.',
        'Anyone who has failed a cloud exam before and wants a method, not just more questions.',
      ] },
      { type: 'h2', text: 'What makes it different' },
      { type: 'p', text: 'Every program is organised into the same proven loop: **learn a focused concept**, **explain it back in your own words**, then **prove it under exam conditions**. You are never more than a few minutes from doing something active with what you just read.' },
      { type: 'callout', text: 'You do not pass a certification by consuming more content. You pass it by retrieving what you know, on demand, under time pressure — which is exactly what we train.' },
      { type: 'h2', text: 'Where to start' },
      { type: 'p', text: 'Pick the certification that matches where you are. New to the cloud entirely? Start with Cloud Practitioner (CLF-C02). Already comfortable and aiming for a role? An Associate-level program like Solutions Architect (SAA-C03) or Developer (DVA-C02) is your target. The next articles in this series walk through the method in detail so you know exactly what to expect.' },
    ],
  },
  {
    slug: 'teach-to-learn-method',
    title: 'The Teach-to-Learn Method: Why Explaining Beats Re-Reading',
    description:
      'The Feynman-inspired Teach to Learn technique is built into every Cloud Exam Lab session. Here is why explaining a concept aloud beats re-reading it five times.',
    date: '2026-02-03',
    updated: '2026-02-03',
    author: 'Cloud Exam Lab Team',
    readingTime: '6 min read',
    tags: ['Study Method', 'Learning Science'],
    heroLead: 'If you cannot explain it simply, you do not understand it yet.',
    body: [
      { type: 'p', text: 'Re-reading is the most popular study technique and one of the least effective. It produces a comforting sense of fluency — the words feel familiar — but familiarity is not understanding. The moment the question is phrased differently, the illusion collapses.' },
      { type: 'p', text: 'The Teach-to-Learn method, inspired by physicist Richard Feynman, flips this. Instead of asking "have I read this?", it asks "can I explain this to someone who has never heard of it?" That single shift forces you to find — and fill — the gaps you would otherwise glide over.' },
      { type: 'h2', text: 'How it works in a session' },
      { type: 'ol', items: [
        'You learn a tight, self-contained concept — say, the difference between a security group and a network ACL.',
        'You close the material and explain it back in plain language, as if teaching a colleague.',
        'You compare your explanation against the source and notice exactly where you hand-waved.',
        'You re-explain, this time without the gap. That second pass is where the learning sticks.',
      ] },
      { type: 'callout', text: 'The discomfort of not being able to explain something is the signal. Most study methods hide that signal. Teach to Learn surfaces it on purpose, early, while there is still time to fix it.' },
      { type: 'h2', text: 'Why it works' },
      { type: 'p', text: 'Explaining is a form of **retrieval practice** combined with **elaboration** — two of the most strongly evidenced learning techniques in cognitive science. Retrieval strengthens memory far more than re-exposure, and elaboration ties new facts to things you already know, making them easier to recall later under pressure.' },
      { type: 'p', text: 'Every study session on Cloud Exam Lab has a Teach-to-Learn step built in, so you are not relying on willpower to do the hard, effective thing — the structure does it for you.' },
    ],
  },
  {
    slug: 'how-structured-study-sessions-work',
    title: 'How Structured Study Sessions Work on Cloud Exam Lab',
    description:
      'A look inside the session model: focused concepts, active recall, spaced checkpoints, and progress tracking that keeps you moving toward exam-ready.',
    date: '2026-02-24',
    updated: '2026-02-24',
    author: 'Cloud Exam Lab Team',
    readingTime: '6 min read',
    tags: ['Platform', 'Study Method'],
    heroLead: 'Small, deliberate sessions beat marathon cram nights.',
    body: [
      { type: 'p', text: 'A study session on Cloud Exam Lab is not a chapter. It is a deliberately small, self-contained unit you can finish in one sitting — and crucially, one that ends with you having done something, not just read something.' },
      { type: 'h2', text: 'The shape of a session' },
      { type: 'ul', items: [
        'A focused concept, scoped tightly enough to hold in your head at once.',
        'An active recall or Teach-to-Learn step that forces you to retrieve, not re-read.',
        'Interactive widgets for the concepts that are easier to understand by doing than by reading.',
        'A checkpoint that confirms you can apply the idea before you move on.',
      ] },
      { type: 'h2', text: 'Progress that means something' },
      { type: 'p', text: 'Your progress bar does not fill up just because you scrolled to the bottom of a page. It advances when you clear checkpoints — so a completed program genuinely reflects what you can do, not how many pages you opened.' },
      { type: 'callout', text: 'Twenty focused minutes with a recall step at the end will move you further than two passive hours. The platform is designed to make the focused twenty minutes the path of least resistance.' },
      { type: 'h2', text: 'Spacing and streaks' },
      { type: 'p', text: 'Short daily sessions also let you take advantage of **spaced repetition** — revisiting material across days rather than cramming it into one. We track your study streak to make that daily rhythm easy to keep, because consistency, not intensity, is what gets people certified.' },
    ],
  },
  {
    slug: 'exam-realistic-practice',
    title: 'Exam-Realistic Practice: How Our Mock Exams Mirror the Real Test',
    description:
      'Timed, full-length, scenario-based mock exams that match the real AWS blueprint — so exam day feels like a rehearsal you have already done.',
    date: '2026-03-18',
    updated: '2026-03-18',
    author: 'Cloud Exam Lab Team',
    readingTime: '5 min read',
    tags: ['Practice Exams', 'Exam Day'],
    heroLead: 'Practice the way you will be tested, not the way that feels easy.',
    body: [
      { type: 'p', text: 'There is a reason a flight simulator looks and feels like a real cockpit: you want the first time something matters to feel like the hundredth time you have done it. Our mock exams apply the same principle to certification.' },
      { type: 'h2', text: 'What "exam-realistic" actually means' },
      { type: 'ul', items: [
        'Full-length and timed, so you train pacing and stamina, not just knowledge.',
        'Weighted to the official AWS exam blueprint, so each domain gets the attention it deserves.',
        'Scenario-based questions that test judgement between several plausible answers — the real exam rarely asks for a definition.',
        'Detailed explanations on every question, with links to the official AWS documentation.',
      ] },
      { type: 'callout', text: 'A question you got right but could not explain is a question you got lucky on. Reviewing the explanation for correct answers — not just wrong ones — is where mock exams pay off.' },
      { type: 'h2', text: 'How to use them' },
      { type: 'p', text: 'Do not save the mock exam for the night before. Take one early to find your weak domains, study to close them, then take another to confirm. When you are consistently clearing the pass threshold under time pressure, you are genuinely ready — and exam day feels like a rehearsal you have already done.' },
    ],
  },
  {
    slug: 'choosing-your-aws-certification-path',
    title: 'Choosing Your AWS Path: From Cloud Practitioner to Professional',
    description:
      'CLF-C02, the Associate tier, and the Professional level explained — how to pick the right AWS certification for where you are in your career.',
    date: '2026-04-09',
    updated: '2026-04-09',
    author: 'Cloud Exam Lab Team',
    readingTime: '7 min read',
    tags: ['Certification Paths', 'Career'],
    heroLead: 'The right first exam depends on where you are starting from.',
    body: [
      { type: 'p', text: 'AWS offers a lot of certifications, and the sheer number is enough to stall people before they start. The good news: you only need to choose your next one. Here is how the levels fit together.' },
      { type: 'h2', text: 'Foundational — Cloud Practitioner (CLF-C02)' },
      { type: 'p', text: 'The on-ramp. It teaches how the cloud works — the economics, the core services, security, and how teams build on AWS — without assuming any IT background. If you are new to the cloud, or in a business, sales, or finance role that touches it, start here.' },
      { type: 'h2', text: 'Associate — the career credential' },
      { type: 'ul', items: [
        'Solutions Architect Associate (SAA-C03): the most popular cloud cert in the world — designing resilient, cost-effective architectures.',
        'Developer Associate (DVA-C02): building, deploying, and debugging applications on AWS.',
        'Machine Learning Engineer Associate (MLA-C01): building and operating ML workloads on AWS.',
      ] },
      { type: 'p', text: 'Associate-level certs are the ones recruiters filter for. If you want a cloud role, this is the tier that opens doors.' },
      { type: 'h2', text: 'Professional — depth and seniority' },
      { type: 'p', text: 'Solutions Architect Professional (SAP-C02) is a significant step up in scope and difficulty, aimed at people already working with AWS who want to prove senior-level design judgement across complex, multi-account environments.' },
      { type: 'callout', text: 'A simple rule: if you cannot yet explain the core AWS services confidently, do Cloud Practitioner first. If you can, skip straight to the Associate that matches the role you want.' },
      { type: 'p', text: 'Whichever you pick, Cloud Exam Lab has a full structured program for it — the same session model and exam-realistic practice, scaled to the depth each level demands.' },
    ],
  },
  {
    slug: 'study-plan-zero-to-certified',
    title: 'From Zero to Certified: A Realistic Study Plan You Can Keep',
    description:
      'A week-by-week study plan using Cloud Exam Lab — built around short daily sessions, spaced review, and mock exams instead of last-minute cramming.',
    date: '2026-05-06',
    updated: '2026-05-06',
    author: 'Cloud Exam Lab Team',
    readingTime: '7 min read',
    tags: ['Study Plan', 'Getting Started'],
    heroLead: 'Consistency beats intensity. Here is a plan built around that.',
    body: [
      { type: 'p', text: 'The best study plan is the one you actually follow. This one assumes you have a job, a life, and roughly thirty to forty-five minutes on most days. Adjust the pace to your exam level — Associate and Professional take longer than Foundational — but the structure holds.' },
      { type: 'h2', text: 'Weeks 1–2: build the base' },
      { type: 'ul', items: [
        'One study session most days. End each with the Teach-to-Learn step — no skipping the recall.',
        'Do not chase speed. Understanding the first time saves you re-learning later.',
        'Keep your streak alive. A short session every day beats one long session a week.',
      ] },
      { type: 'h2', text: 'Weeks 3–4: pressure-test' },
      { type: 'ul', items: [
        'Take your first full, timed mock exam. Treat it as diagnosis, not judgement.',
        'List your weakest domains and spend the next sessions closing exactly those gaps.',
        'Revisit earlier material briefly — spaced review is what makes it permanent.',
      ] },
      { type: 'h2', text: 'Final week: confirm and rest' },
      { type: 'ol', items: [
        'Take another full mock exam under real conditions. Aim to clear the pass threshold comfortably.',
        'Review every explanation — including the questions you got right.',
        'The day before, do light review only. A rested brain recalls better than a crammed one.',
      ] },
      { type: 'callout', text: 'If you are consistently passing timed mock exams with margin to spare, you are ready. The score on a calm rehearsal predicts exam day far better than how many hours you logged.' },
    ],
  },
  {
    slug: 'free-access-and-promo-codes',
    title: 'Free Access and Promo Codes: Try a Program Without Paying',
    description:
      'How to unlock a Cloud Exam Lab program for free with a promo code — what the code does, how to redeem it, and how long your access lasts.',
    date: '2026-06-02',
    updated: '2026-06-02',
    author: 'Cloud Exam Lab Team',
    readingTime: '4 min read',
    tags: ['Promo Codes', 'Getting Started'],
    heroLead: 'A shared code can unlock full practice access — no payment needed.',
    body: [
      { type: 'p', text: 'We want the method to sell itself, so we make it easy to try the real thing for free. Promo codes give you full practice access to a program — or to every program — for a set period, with no payment details required.' },
      { type: 'h2', text: 'How a promo code works' },
      { type: 'ul', items: [
        'A code unlocks either one specific exam or all programs, depending on how it was created.',
        'Once redeemed, your access lasts for a set length of time — for example a week or a month.',
        'Each code has a redemption deadline. You need to redeem it before that time; after it, the code expires.',
      ] },
      { type: 'h2', text: 'How to redeem' },
      { type: 'ol', items: [
        'Open the redeem page at /redeem.',
        'Sign in, or create a free account — it takes a moment.',
        'Enter the code exactly as it was shared with you and confirm.',
      ] },
      { type: 'callout', text: 'Redeem promptly. Codes are time-limited on purpose, and the message you received will tell you the exact deadline. Once you redeem, the clock on your access starts.' },
      { type: 'h2', text: 'After it expires' },
      { type: 'p', text: 'If your free access runs out and you want to keep going, you can subscribe to unlock everything. Your progress is tied to your account, so nothing you have studied is lost — you pick up exactly where you left off.' },
    ],
  },
]

// Newest first for the index page.
export const ARTICLES_SORTED = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1))

export function getArticle(slug) {
  return ARTICLES.find((a) => a.slug === slug) || null
}
