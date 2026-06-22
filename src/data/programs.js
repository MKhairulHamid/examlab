// Marketing catalog for every certification program we offer.
// Single source of truth for the main landing page (program grid) and the
// per-program landing pages at /:code (e.g. /CLF-C02).
//
// Keep this in sync with src/data/<exam>Course.js (domains, session counts) and
// the Supabase exam_types/question_sets rows. Exam facts below are the official
// AWS numbers at time of writing.

import { Cloud, BrainCircuit, Layers, Code2, Cpu, Network, Sparkles, Activity, Workflow, Database, ShieldCheck } from 'lucide-react'

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
    code: 'SOA-C03',
    slug: 'soa-c03',
    name: 'AWS Certified CloudOps Engineer – Associate',
    shortName: 'CloudOps Engineer',
    level: 'Associate',
    Icon: Activity,
    color: '#0891B2',
    tagline: 'Deploy, monitor, secure, and keep real AWS workloads running in production.',
    heroLead: 'Operate the cloud —',
    heroAccent: 'and fix it when it breaks.',
    blurb:
      'SOA-C03 is AWS’s operations certification — the new CloudOps Engineer credential that succeeds SysOps Administrator. It teaches you to run systems that already exist: monitoring and remediation, scaling and recovery, automated provisioning, security operations, and networking troubleshooting.',
    whyTopic:
      'Building a system is one skill; keeping it healthy at 3 a.m. is another. The operations gap is real — companies are full of people who can launch infrastructure but few who can read a metric, trace a failure to the right layer, and remediate it without guesswork. This program trains the operator’s mindset: observe, diagnose, automate, recover. It is the difference between hoping the system stays up and knowing how to keep it up.',
    learnOutcomes: [
      'Monitoring and observability with CloudWatch — metrics, the agent, alarms, dashboards, and log analysis',
      'Automated remediation: wiring alarms to EventBridge, Systems Manager runbooks, and Lambda',
      'Reliability operations — Auto Scaling, Multi-AZ, ELB and Route 53 health checks, and AWS Backup with real RTO/RPO targets',
      'Provisioning and automation with CloudFormation, StackSets, Image Builder, and Systems Manager',
      'Security and networking operations — IAM and KMS troubleshooting, and diagnosing VPC connectivity from flow logs',
    ],
    careerBenefit:
      'CloudOps Engineer Associate is the credential employers look for in cloud operations, support, and SRE roles, and the natural operations counterpart to Solutions Architect. It is a recognized step toward the DevOps Engineer – Professional certification and proves you can be trusted with production.',
    roles: ['Cloud operations engineers', 'Systems administrators', 'Site reliability engineers', 'Cloud support & DevOps engineers'],
    sessions: 16,
    domains: [
      { label: 'Monitoring, Logging & Performance', weight: '22%' },
      { label: 'Reliability & Business Continuity', weight: '22%' },
      { label: 'Deployment, Provisioning & Automation', weight: '22%' },
      { label: 'Security & Compliance', weight: '16%' },
      { label: 'Networking & Content Delivery', weight: '18%' },
    ],
    facts: { questions: '65', time: '130 min', passing: '720 / 1000', cost: '$150' },
    evergreenValue:
      'Even if you never sit the exam, you learn how production cloud systems are actually operated — how to observe them, automate their upkeep, and recover them under pressure. That operational judgment is what makes any engineer someone a team can rely on.',
  },
  {
    code: 'DEA-C01',
    slug: 'dea-c01',
    name: 'AWS Certified Data Engineer – Associate',
    shortName: 'Data Engineer',
    level: 'Associate',
    Icon: Database,
    color: '#0D9488',
    tagline: 'Build, operate, and secure the data pipelines that power analytics on AWS.',
    heroLead: 'Engineer the data',
    heroAccent: 'that everything else runs on.',
    blurb:
      'DEA-C01 is AWS’s data engineering certification. It teaches you to ingest and transform data, orchestrate pipelines, choose and model the right data stores, operate and monitor everything in production, and apply the security and governance that real data demands.',
    whyTopic:
      'Every analytics dashboard, ML model, and business decision sits on top of a data pipeline someone had to build and keep running. That plumbing — moving data reliably from dozens of sources, transforming it cleanly, storing it where it can be queried affordably, and proving it is governed and secure — is one of the most in-demand skills in tech. This program trains the data engineer’s judgment: streaming versus batch, the right store for the access pattern, the least-overhead orchestration, and the cost trade-offs that separate a pipeline that scales from one that bleeds money.',
    learnOutcomes: [
      'Ingesting data from streaming and batch sources with Kinesis, MSK, Glue, DMS, and Lambda',
      'Transforming and processing data with AWS Glue, EMR, Lambda, and Redshift — including formats, partitioning, and cost optimization',
      'Choosing and modeling the right data store: Redshift, RDS, DynamoDB, S3 data lakes, and the Glue Data Catalog',
      'Orchestrating, monitoring, and troubleshooting pipelines with Step Functions, MWAA, EventBridge, CloudWatch, and CloudTrail',
      'Securing and governing data with IAM, Lake Formation, KMS encryption, Macie, and audit logging',
    ],
    careerBenefit:
      'Data Engineer Associate validates exactly the skills employers struggle to hire for. It is built for the data engineer, analytics engineer, and ETL developer roles that sit at the foundation of every data and ML team, and it pairs naturally with the Solutions Architect and Machine Learning tracks.',
    roles: ['Data engineers', 'Analytics & BI engineers', 'ETL developers', 'Backend engineers moving into data'],
    sessions: 16,
    domains: [
      { label: 'Data Ingestion & Transformation', weight: '34%' },
      { label: 'Data Store Management', weight: '26%' },
      { label: 'Data Operations & Support', weight: '22%' },
      { label: 'Data Security & Governance', weight: '18%' },
    ],
    facts: { questions: '65', time: '130 min', passing: '720 / 1000', cost: '$150' },
    evergreenValue:
      'Even if you never sit the exam, you learn how production data pipelines are actually built and operated — ingestion, transformation, the right store, orchestration, and governance. That data-engineering judgment is one of the most leveraged, transferable skills in modern tech, whatever your job title.',
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
    facts: { questions: '75', time: '180 min', passing: '750 / 1000', cost: '$300' },
    evergreenValue:
      'Even if you never sit the exam, you develop the way a senior architect thinks — designing across whole organizations, weighing real trade-offs, and improving systems that are already running. That judgment is the most durable, highest-leverage skill in cloud.',
  },
  {
    code: 'AIP-C01',
    slug: 'aip-c01',
    name: 'AWS Certified Generative AI Developer – Professional',
    shortName: 'GenAI Developer Pro',
    level: 'Professional',
    Icon: Sparkles,
    color: '#DB2777',
    tagline: 'Build production generative AI on AWS — RAG, agents, and foundation models done right.',
    heroLead: 'Build generative AI',
    heroAccent: 'that survives production.',
    blurb:
      'AIP-C01 is AWS’s most advanced AI engineering credential. It teaches you to integrate foundation models into real applications — designing RAG and vector stores, building agentic workflows, securing and governing AI, and optimizing it for cost, performance, and quality in production.',
    whyTopic:
      'Almost anyone can call a model API and get a demo working. The hard, valuable skill is everything around the model: grounding answers in private data without hallucination, giving the model tools and memory to act, keeping it safe and compliant, and making it fast and affordable at scale. This program trains exactly that engineering — the difference between a flashy prototype and a generative AI system a business can actually depend on.',
    learnOutcomes: [
      'Designing RAG systems: vector stores, chunking, embeddings, hybrid search, and reranking that ground answers in your own data',
      'Building agentic AI — tool use, multi-step reasoning, memory, and orchestration with Bedrock Agents, Strands, and Step Functions',
      'Securing and governing GenAI: Guardrails, PII protection, prompt-injection defense, responsible AI, and auditability',
      'Optimizing for cost and performance: token efficiency, caching, model selection, and latency tuning',
      'Evaluating, testing, and troubleshooting foundation-model applications the way production demands',
    ],
    careerBenefit:
      'Generative AI Developer Professional is the most advanced AI engineering certification on AWS and one of the highest-signal credentials in the market. It is built for the AI engineer, applied-AI, and GenAI platform roles that are among the fastest-growing and best-paid in tech.',
    roles: ['AI / GenAI engineers', 'Applied AI developers', 'ML engineers building with FMs', 'Solutions architects on AI platforms'],
    sessions: 19,
    domains: [
      { label: 'FM Integration, Data & Compliance', weight: '31%' },
      { label: 'Implementation & Integration', weight: '26%' },
      { label: 'AI Safety, Security & Governance', weight: '20%' },
      { label: 'Operational Efficiency & Optimization', weight: '12%' },
      { label: 'Testing, Validation & Troubleshooting', weight: '11%' },
    ],
    facts: { questions: '75', time: '180 min', passing: '750 / 1000', cost: '$300' },
    evergreenValue:
      'Even if you never sit the exam, you learn how production generative AI is actually engineered — grounding, agents, safety, and cost control. That is the practical, in-demand skill behind every serious GenAI product, whatever your job title.',
  },
  {
    code: 'DOP-C02',
    slug: 'dop-c02',
    name: 'AWS Certified DevOps Engineer – Professional',
    shortName: 'DevOps Engineer Pro',
    level: 'Professional',
    Icon: Workflow,
    color: '#EA580C',
    tagline: 'Automate the delivery, operation, and recovery of distributed systems on AWS.',
    heroLead: 'Ship faster, fail safer —',
    heroAccent: 'automate the whole delivery lifecycle.',
    blurb:
      'DOP-C02 is AWS’s definitive DevOps credential. It teaches you to build continuous-delivery pipelines, manage infrastructure as code across many accounts, design systems that are highly available and self-healing, instrument them with deep monitoring, and respond to incidents with automation — the full operate-and-deliver lifecycle of a senior DevOps engineer.',
    whyTopic:
      'Modern software lives or dies on how well it is delivered and operated. Anyone can deploy once by hand; the valuable skill is making deployment, recovery, monitoring, and compliance happen automatically, safely, and at scale across an entire organization. This program trains exactly that engineering judgment — how to design a pipeline that ships dozens of times a day without breaking production, infrastructure that rebuilds itself from code, and systems that detect and remediate their own failures before a human is paged. It is the difference between running software and engineering the machine that runs it.',
    learnOutcomes: [
      'Building CI/CD pipelines with CodePipeline, CodeBuild, and CodeDeploy — including blue/green and canary releases for EC2, ECS, EKS, and Lambda',
      'Managing infrastructure as code at scale: CloudFormation, SAM, CDK, StackSets, and multi-account governance with Organizations and Control Tower',
      'Designing resilient, scalable systems — Multi-AZ and multi-Region, auto scaling, and automated recovery against real RTO and RPO targets',
      'Instrumenting deep observability with CloudWatch, X-Ray, metric filters, and event-driven alerting and remediation',
      'Automating incident response and security/compliance controls — EventBridge, Systems Manager, Config, GuardDuty, and Security Hub',
    ],
    careerBenefit:
      'DevOps Engineer Professional is one of the highest-value credentials in cloud and a recognized signal for senior DevOps, platform, and SRE roles. It is the natural next step after the Developer or SysOps Associate and the cert that moves you from "can deploy on AWS" to "can own the delivery and reliability of an entire platform."',
    roles: ['DevOps & platform engineers', 'Site reliability engineers', 'Release & build engineers', 'Cloud automation leads'],
    sessions: 18,
    domains: [
      { label: 'SDLC Automation', weight: '22%' },
      { label: 'Configuration Management & IaC', weight: '17%' },
      { label: 'Resilient Cloud Solutions', weight: '15%' },
      { label: 'Monitoring & Logging', weight: '15%' },
      { label: 'Incident & Event Response', weight: '14%' },
      { label: 'Security & Compliance', weight: '17%' },
    ],
    facts: { questions: '75', time: '180 min', passing: '750 / 1000', cost: '$300' },
    evergreenValue:
      'Even if you never sit the exam, you learn how high-performing teams actually deliver and operate software on AWS — pipelines, infrastructure as code, observability, and self-healing automation. That operational engineering is the most leveraged, transferable skill in modern cloud work, whatever your job title.',
  },
  {
    code: 'SCS-C03',
    slug: 'scs-c03',
    name: 'AWS Certified Security – Specialty',
    shortName: 'Security Specialty',
    level: 'Specialty',
    Icon: ShieldCheck,
    color: '#DC2626',
    tagline: 'Secure AWS workloads end to end — detection, identity, data protection, and governance.',
    heroLead: 'Security is the job that never sleeps.',
    heroAccent: 'Learn to do it at cloud scale.',
    blurb:
      'SCS-C03 is AWS’s deepest security credential. It teaches you to detect threats and build logging at scale, respond to incidents with forensics and containment, secure infrastructure from the edge to the network, manage identity and access with least privilege, protect data in transit and at rest, and govern security across an entire multi-account organization.',
    whyTopic:
      'Security is the one concern that touches every workload, every team, and every line of the shared responsibility model — and it is where a single misconfiguration becomes a breach. The valuable skill is not memorizing services; it is reasoning about how an attacker moves, where a control belongs in a layered defense, and how an Allow and a Deny actually combine when an organization, a resource policy, and a permission boundary all have a say. This program trains exactly that judgment: how to see what is happening in an account, lock identity down to least privilege, keep data confidential and intact, and prove compliance across hundreds of accounts. It is the difference between using AWS security services and engineering a security posture.',
    learnOutcomes: [
      'Designing detection and logging at scale — GuardDuty, Security Hub, Macie, Detective, Security Lake, organization CloudTrail trails, and the right log source for each threat',
      'Responding to incidents — forensic artifact capture, containment and eradication, automated remediation, and root cause analysis with Amazon Detective',
      'Securing infrastructure — edge protection with WAF and Shield Advanced, hardened compute and patching, and network controls and segmentation',
      'Managing identity and access — IAM Identity Center, federation, ABAC and RBAC, and how SCPs, resource policies, permission boundaries, and session policies evaluate together',
      'Protecting data — TLS and private connectivity, KMS and CloudHSM encryption at rest, key management, and secrets rotation; plus multi-account governance with Organizations and Control Tower',
    ],
    careerBenefit:
      'Security Specialty is one of the highest-paying and fastest-growing AWS certifications, and a recognized signal for cloud security engineer, security architect, and DevSecOps roles. It unlocks regulated work in healthcare, finance, government, and defense — and moves you from "can build on AWS" to "can secure what the whole organization builds on AWS."',
    roles: ['Cloud security engineers', 'Security architects', 'DevSecOps engineers', 'Compliance & IAM specialists'],
    sessions: 16,
    domains: [
      { label: 'Detection', weight: '16%' },
      { label: 'Incident Response', weight: '14%' },
      { label: 'Infrastructure Security', weight: '18%' },
      { label: 'Identity & Access Management', weight: '20%' },
      { label: 'Data Protection', weight: '18%' },
      { label: 'Security Foundations & Governance', weight: '14%' },
    ],
    facts: { questions: '65', time: '170 min', passing: '750 / 1000', cost: '$300' },
    evergreenValue:
      'Even if you never sit the exam, you walk away able to reason about cloud security the way an attacker and a defender both do — least-privilege identity, layered network and data controls, detection and response, and governance across many accounts. That security judgment is among the most in-demand and durable skills in all of technology, whatever your job title.',
  },
]

export const PROGRAMS_BY_CODE = PROGRAMS.reduce((acc, p) => {
  acc[p.code.toUpperCase()] = p
  return acc
}, {})

export const PROGRAMS_BY_SLUG = PROGRAMS.reduce((acc, p) => {
  acc[p.slug.toLowerCase()] = p
  return acc
}, {})

export function getProgram(code) {
  if (!code) return null
  return PROGRAMS_BY_CODE[code.toUpperCase()] || null
}

export function getProgramBySlug(slug) {
  if (!slug) return null
  return PROGRAMS_BY_SLUG[slug.toLowerCase()] || null
}
