// Marketing catalog for every certification program we offer.
// Single source of truth for the main landing page (program grid) and the
// per-program landing pages at /:code (e.g. /CLF-C02).
//
// Keep this in sync with src/data/<exam>Course.js (domains, session counts) and
// the Supabase exam_types/question_sets rows. Exam facts below are the official
// AWS numbers at time of writing.

import { Cloud, BrainCircuit, Layers, Code2, Cpu, Network } from 'lucide-react'

export const PROGRAMS = [
  {
    code: 'CLF-C02',
    slug: 'clf-c02',
    name: 'AWS Certified Cloud Practitioner',
    shortName: 'Cloud Practitioner',
    level: 'Foundational',
    Icon: Cloud,
    color: '#0EA5E9',
    tagline: 'The cloud literacy everyone in a modern company is expected to have.',
    heroLead: 'Understand the cloud',
    heroAccent: 'that runs the world.',
    blurb:
      'CLF-C02 is the best on-ramp to AWS. It teaches you how cloud computing actually works — the economics, the core services, security, and how teams build on AWS — without assuming any prior IT background.',
    whyTopic:
      'Almost every company now runs on the cloud, and "cloud fluency" has quietly become a baseline expectation across business, sales, finance, and engineering roles. Cloud Practitioner gives you the vocabulary and mental model to understand what your technical colleagues are building, why it costs what it costs, and how it stays secure — knowledge that pays off in meetings long before any exam.',
    learnOutcomes: [
      'How cloud computing replaces capital expense with on-demand, pay-as-you-go resources',
      'The core AWS services for compute, storage, networking, and databases — and when each fits',
      'The Shared Responsibility Model and the fundamentals of cloud security and compliance',
      'How AWS pricing works and how organizations control and optimize their cloud spend',
      'The AWS global infrastructure and how it delivers reliability and low latency worldwide',
    ],
    careerBenefit:
      'Cloud Practitioner is the credential that opens the door. It is the natural first cert for career switchers, the box recruiters look for on non-engineering tech roles, and the foundation every other AWS certification builds on.',
    roles: ['Career switchers', 'Sales & business roles', 'Project managers', 'Aspiring cloud engineers'],
    sessions: 16,
    domains: [
      { label: 'Cloud Concepts', weight: '24%' },
      { label: 'Security & Compliance', weight: '30%' },
      { label: 'Cloud Technology & Services', weight: '34%' },
      { label: 'Billing, Pricing & Support', weight: '12%' },
    ],
    facts: { questions: '65', time: '90 min', passing: '700 / 1000', cost: '$100' },
    evergreenValue:
      'Even if you never sit the exam, you walk away genuinely cloud-literate — able to follow any conversation about AWS, reason about cloud costs, and decide whether a deeper technical cert is right for you.',
  },
  {
    code: 'AIF-C01',
    slug: 'aif-c01',
    name: 'AWS Certified AI Practitioner',
    shortName: 'AI Practitioner',
    level: 'Foundational',
    Icon: BrainCircuit,
    color: '#8B5CF6',
    tagline: 'Prove you understand AI, machine learning, and generative AI — for every role.',
    heroLead: 'AI is changing every role.',
    heroAccent: 'Understand it properly.',
    blurb:
      'AIF-C01 is AWS’s broadest AI credential. It covers how machine learning and generative AI actually work, where they fit, and how to use them responsibly — no coding or data-science background required.',
    whyTopic:
      'AI has gone from a specialist topic to something every team is expected to reason about. The hard part is separating genuine understanding from buzzwords. This program gives you a clear, accurate mental model of how models work, what they can and cannot do, and how to apply them responsibly — the kind of literacy that makes you the person in the room who actually gets it.',
    learnOutcomes: [
      'The real differences between AI, machine learning, and deep learning',
      'How foundation models and large language models work, and what generative AI is good (and bad) at',
      'Prompt engineering, retrieval-augmented generation (RAG), and when to fine-tune',
      'Responsible AI: bias, fairness, transparency, and explainability',
      'How AWS services like Bedrock and SageMaker fit into real AI solutions',
    ],
    careerBenefit:
      'AIF-C01 signals that you can engage with AI at the depth decisions require. It is ideal for product, business, and consulting roles working alongside AI, and a clean bridge for developers pivoting toward the AI space.',
    roles: ['Product & business roles', 'Developers pivoting to AI', 'Consultants & analysts', 'Team leads'],
    sessions: 16,
    domains: [
      { label: 'Fundamentals of AI & ML', weight: '20%' },
      { label: 'Fundamentals of Generative AI', weight: '24%' },
      { label: 'Applications of Foundation Models', weight: '28%' },
      { label: 'Guidelines for Responsible AI', weight: '14%' },
      { label: 'Security, Compliance & Governance', weight: '14%' },
    ],
    facts: { questions: '65', time: '90 min', passing: '700 / 1000', cost: '$100' },
    evergreenValue:
      'Even without the exam, you gain a durable, hype-free understanding of AI you can apply immediately — in your work, your decisions, and how you talk about the technology reshaping your field.',
  },
  {
    code: 'SAA-C03',
    slug: 'saa-c03',
    name: 'AWS Certified Solutions Architect – Associate',
    shortName: 'Solutions Architect',
    level: 'Associate',
    Icon: Layers,
    color: '#6366F1',
    tagline: 'Design secure, resilient, high-performing, cost-optimized systems on AWS.',
    heroLead: 'Architect systems',
    heroAccent: 'that scale and survive.',
    blurb:
      'SAA-C03 is the most popular AWS certification in the world. It teaches you to design complete architectures — choosing the right services and trade-offs for security, resilience, performance, and cost.',
    whyTopic:
      'Architecture is where cloud knowledge becomes valuable. Anyone can launch a server; designing a system that stays up under load, recovers from failure, protects its data, and does not waste money is a genuine skill. This program trains the way an architect thinks — weighing trade-offs across dozens of services to fit real business requirements.',
    learnOutcomes: [
      'Designing secure architectures with IAM, encryption, and network isolation',
      'Building for resilience: high availability, fault tolerance, and disaster recovery',
      'Designing high-performing, scalable systems with the right compute, storage, and database choices',
      'Cost-optimization strategies and how to choose the most economical design',
      'How to read a business requirement and select the right AWS services and trade-offs',
    ],
    careerBenefit:
      'Solutions Architect is the highest-demand associate cert and a recognized signal for cloud engineer, solutions architect, and DevOps roles. It is the credential that moves you from "knows AWS" to "can design on AWS."',
    roles: ['Cloud engineers', 'Solutions architects', 'Backend & DevOps engineers', 'Technical leads'],
    sessions: 16,
    domains: [
      { label: 'Design Secure Architectures', weight: '30%' },
      { label: 'Design Resilient Architectures', weight: '26%' },
      { label: 'Design High-Performing Architectures', weight: '24%' },
      { label: 'Design Cost-Optimized Architectures', weight: '20%' },
    ],
    facts: { questions: '65', time: '130 min', passing: '720 / 1000', cost: '$150' },
    evergreenValue:
      'Even if you skip the exam, you learn to design real cloud systems — a skill that directly improves the way you build, review, and reason about software, whatever your job title.',
  },
  {
    code: 'DVA-C02',
    slug: 'dva-c02',
    name: 'AWS Certified Developer – Associate',
    shortName: 'Developer',
    level: 'Associate',
    Icon: Code2,
    color: '#00A884',
    tagline: 'Build, deploy, secure, and debug real applications on AWS.',
    heroLead: 'Build applications',
    heroAccent: 'the cloud-native way.',
    blurb:
      'DVA-C02 is for people who write code. It covers developing applications with AWS services, securing them, deploying with modern pipelines, and troubleshooting them in production.',
    whyTopic:
      'Modern development is cloud development. Knowing a language is no longer enough — employers expect you to build on managed services, ship through CI/CD, handle authentication and secrets correctly, and debug distributed systems. This program turns "I can code" into "I can ship production software on AWS."',
    learnOutcomes: [
      'Developing with core AWS services: Lambda, DynamoDB, S3, API Gateway, and more',
      'Application security: IAM, Cognito, encryption, and managing secrets properly',
      'Modern deployment with CI/CD pipelines, containers, and infrastructure as code',
      'Troubleshooting and optimizing applications using logging, tracing, and metrics',
      'The serverless and event-driven patterns that define cloud-native development',
    ],
    careerBenefit:
      'Developer Associate is the credential that proves you can ship real software on AWS. It is highly valued for backend, full-stack, and platform engineering roles, and pairs naturally with the DevOps Professional track.',
    roles: ['Software developers', 'Backend & full-stack engineers', 'Platform engineers', 'DevOps engineers'],
    sessions: 15,
    domains: [
      { label: 'Development with AWS Services', weight: '32%' },
      { label: 'Security', weight: '26%' },
      { label: 'Deployment', weight: '24%' },
      { label: 'Troubleshooting & Optimization', weight: '18%' },
    ],
    facts: { questions: '65', time: '130 min', passing: '720 / 1000', cost: '$150' },
    evergreenValue:
      'Even without the certificate, you become a measurably better cloud developer — writing code that deploys cleanly, fails safely, and uses managed services the way they were designed to be used.',
  },
  {
    code: 'MLA-C01',
    slug: 'mla-c01',
    name: 'AWS Certified Machine Learning Engineer – Associate',
    shortName: 'ML Engineer',
    level: 'Associate',
    Icon: Cpu,
    color: '#F59E0B',
    tagline: 'Take machine learning from raw data all the way to production.',
    heroLead: 'Ship machine learning',
    heroAccent: 'that actually runs.',
    blurb:
      'MLA-C01 covers the full ML engineering lifecycle on AWS — preparing data, developing models, deploying and orchestrating them, and keeping them healthy in production.',
    whyTopic:
      'The shortage in machine learning is not people who can train a model in a notebook — it is people who can get models into production and keep them working. This program teaches the engineering around the model: data pipelines, deployment, orchestration, monitoring, and security. It is where data science becomes a reliable, operational system.',
    learnOutcomes: [
      'Preparing, transforming, and validating data for machine learning at scale',
      'Developing, training, and tuning models with Amazon SageMaker',
      'Deploying and orchestrating ML workflows with automated, repeatable pipelines',
      'Monitoring models in production for drift, performance, and cost',
      'Securing ML systems and managing them responsibly across their lifecycle',
    ],
    careerBenefit:
      'ML Engineer Associate validates the operational skills employers struggle to find. It is built for the fast-growing MLOps and ML engineering roles that sit between data science and production software.',
    roles: ['ML engineers', 'MLOps engineers', 'Data engineers', 'Data scientists moving to production'],
    sessions: 15,
    domains: [
      { label: 'Data Preparation for ML', weight: '28%' },
      { label: 'ML Model Development', weight: '26%' },
      { label: 'Deployment & Orchestration', weight: '22%' },
      { label: 'Monitoring, Maintenance & Security', weight: '24%' },
    ],
    facts: { questions: '65', time: '130 min', passing: '720 / 1000', cost: '$150' },
    evergreenValue:
      'Even if you never take the exam, you learn how real ML systems are built and operated — the production skills that separate a working prototype from something a business can depend on.',
  },
  {
    code: 'SAP-C02',
    slug: 'sap-c02',
    name: 'AWS Certified Solutions Architect – Professional',
    shortName: 'Solutions Architect Pro',
    level: 'Professional',
    Icon: Network,
    color: '#4338CA',
    tagline: 'Design and evolve complex, multi-account AWS architectures at enterprise scale.',
    heroLead: 'Architect the enterprise —',
    heroAccent: 'across every account and Region.',
    blurb:
      'SAP-C02 is AWS’s flagship architecture certification. It teaches you to design for organizational complexity, build new solutions against demanding requirements, continuously improve systems already in production, and lead large-scale migration and modernization — the work of a senior architect.',
    whyTopic:
      'There is a real gap between knowing the AWS services and being trusted to design across an entire organization — dozens of accounts, hybrid networks, competing requirements, and systems that already exist and cannot simply be rebuilt. This program trains that senior judgment: how to weigh trade-offs no single right answer covers, design for failure and scale, and lead a migration without breaking the business. It is the difference between building a system and owning the architecture.',
    learnOutcomes: [
      'Designing for organizational complexity: multi-account governance, hybrid connectivity, and centralized security',
      'Architecting new solutions that meet exacting reliability, performance, security, and cost requirements at once',
      'Continuously improving production systems — operational excellence, resilience, and cost without a rebuild',
      'Leading workload migration and modernization with the 7 Rs, the right tools, and a sound TCO case',
      'Reasoning through the genuine trade-offs of professional-level scenarios where several options all work',
    ],
    careerBenefit:
      'Solutions Architect Professional is one of the highest-value credentials in cloud and a recognized signal for senior, lead, and principal architect roles. It is the natural next step after the Associate and the cert that moves you from "can design on AWS" to "can own the architecture for an enterprise."',
    roles: ['Senior & lead architects', 'Principal engineers', 'Cloud architects', 'Migration & platform leads'],
    sessions: 17,
    domains: [
      { label: 'Design Solutions for Organizational Complexity', weight: '26%' },
      { label: 'Design for New Solutions', weight: '29%' },
      { label: 'Continuous Improvement for Existing Solutions', weight: '25%' },
      { label: 'Accelerate Workload Migration & Modernization', weight: '20%' },
    ],
    facts: { questions: '65', time: '180 min', passing: '750 / 1000', cost: '$300' },
    evergreenValue:
      'Even if you never sit the exam, you develop the way a senior architect thinks — designing across whole organizations, weighing real trade-offs, and improving systems that are already running. That judgment is the most durable, highest-leverage skill in cloud.',
  },
]

export const PROGRAMS_BY_CODE = PROGRAMS.reduce((acc, p) => {
  acc[p.code.toUpperCase()] = p
  return acc
}, {})

export function getProgram(code) {
  if (!code) return null
  return PROGRAMS_BY_CODE[code.toUpperCase()] || null
}
