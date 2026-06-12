// AWS Certified Cloud Practitioner (CLF-C02) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors aifC01Course.js — see study-materials-standard.html for authoring rules.

const clfC02Course = {
  slug: 'clf-c02',
  title: 'AWS Certified Cloud Practitioner — Full Prep Course',
  code: 'CLF-C02',
  subtitle: 'Sixteen 30-minute sessions covering all four domains, each ending with a real exam-style question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 90 minutes, pass at 700/1000 (~70%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Cloud Concepts', weight: '24%' },
    { id: 'd2', label: 'Domain 2 · Security & Compliance', weight: '30%' },
    { id: 'd3', label: 'Domain 3 · Cloud Technology & Services', weight: '34%' },
    { id: 'd4', label: 'Domain 4 · Billing, Pricing & Support', weight: '12%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — CLOUD CONCEPTS
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Cloud Concepts',
      domain: 'd1',
      weight: '24%',
      task: 'Task 1.1',
      title: 'The Value of AWS Cloud — Why Cloud Beats On-Premises',
      duration: 30,
      summary: 'Start here. We\'ll build the case for cloud from first principles — why companies move to AWS, what they actually gain, and how to answer the "what is the cloud for?" questions the exam loves.',
      objectives: [
        'Explain the six advantages of cloud computing',
        'Describe the benefits of high availability, elasticity, and agility',
        'Understand the value of AWS global infrastructure for deployment speed and reach',
        'Articulate the AWS value proposition compared to on-premises infrastructure',
      ],
      preLearningCheck: {
        question: 'Before we start — which statement best describes the primary economic advantage of moving from on-premises to AWS?',
        options: [
          'AWS hardware is cheaper to manufacture than commodity server hardware',
          'Companies replace large upfront capital expenditure with smaller, variable operating costs',
          'AWS guarantees 100% uptime, which eliminates the cost of outages',
          'Cloud removes the need for any IT staff, reducing headcount costs',
        ],
        correct: 1,
        note: 'No pressure — attempting this before reading actually improves retention even when you get it wrong. That\'s why we ask it first.',
      },
      sections: [
        {
          heading: 'The server room nobody wants to talk about',
          body: 'Somewhere in most medium-sized companies there is a room. It hums. It is cold. It is full of servers bought three years ago for a workload that no longer exists — and a workload that did not exist three years ago is currently crashing because there is no room for more servers.\n\nThat room represents how IT used to work: predict your peak capacity, buy for it years in advance, pay for it whether you use it or not, scramble when you guessed wrong. AWS exists because that model is broken.',
        },
        {
          heading: 'What AWS actually sells',
          body: 'Amazon built the infrastructure that runs amazon.com — and then realised it had built something far more valuable than an online bookstore. It had built the ability to spin up virtually unlimited computing resources in minutes and pay only for what it used.\n\nIn 2006 AWS started selling that capability to everyone. The core promise has not changed since: rent computing, storage, networking, and databases by the hour (or second), at a scale no individual company could afford to own, with none of the upfront commitment.',
        },
        {
          heading: 'The six advantages of cloud computing',
          body: 'AWS publishes six official advantages. The exam tests whether you can recognise each one — and more importantly, match a business scenario to the correct advantage.',
          bullets: [
            'Trade capital expense for variable expense — instead of buying servers, pay only for what you consume. No idle hardware.',
            'Benefit from massive economies of scale — AWS aggregates usage from hundreds of thousands of customers, driving costs down for everyone.',
            'Stop guessing capacity — provision exactly what you need today, scale up tomorrow, scale down next week. No stranded hardware.',
            'Increase speed and agility — new IT resources are minutes away, not weeks of procurement. Teams experiment faster.',
            'Stop spending money running and maintaining data centers — focus engineering on products, not on racking servers.',
            'Go global in minutes — deploy to multiple AWS Regions around the world with a few clicks. Zero new data-center contracts.',
          ],
          callout: { type: 'tip', text: 'Exam pattern: a question describes a pain point (e.g. "stranded servers after a project ends"). Map the pain to the advantage that resolves it ("stop guessing capacity"). Learn the pain, not just the label.' },
        },
        {
          heading: 'High availability, elasticity, and agility — three terms the exam conflates',
          body: 'These three are often tested together, and students frequently mix them up. Each is precise.',
          table: {
            headers: ['Term', 'What it means', 'Example'],
            rows: [
              ['High availability (HA)', 'System continues operating even when individual components fail', 'A web app runs across 3 Availability Zones — losing one AZ keeps the app online'],
              ['Elasticity', 'Capacity automatically scales up and down to match actual demand', 'Auto Scaling adds EC2 instances during a Black Friday spike, removes them at midnight'],
              ['Agility', 'Speed at which new IT resources can be acquired and discarded', 'A developer spins up a test environment in 3 minutes, deletes it after 2 hours'],
            ],
          },
        },
        {
          heading: 'The global infrastructure advantage',
          body: 'Before cloud, deploying your application in Tokyo meant leasing space in a Japanese data center, hiring local staff, and navigating local procurement. It took months.\n\nWith AWS you select a Region in the console and click deploy. Your users in Tokyo get low-latency responses from servers physically near them. Your users in Frankfurt get the same from a Frankfurt Region.',
          bullets: [
            'Lower latency — users are physically closer to AWS infrastructure, improving response times.',
            'Data residency — some regulations require data to stay in a specific country. AWS Regions let you comply without building your own data center.',
            'Disaster recovery across geographies — replicate across Regions so a natural disaster in one location does not take your application offline.',
            'Faster deployment to new markets — entering a new geography is a configuration change, not a capital project.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A retail company bought 200 servers three years ago to handle peak holiday traffic. For nine months of the year, 140 of those servers sit nearly idle. Which cloud advantage directly solves this problem?',
          options: [
            'Trade capital expense for variable expense',
            'Stop guessing capacity',
            'Benefit from massive economies of scale',
            'Go global in minutes',
          ],
          correct: 1,
          explainCorrect: 'Correct — "stop guessing capacity" means you provision exactly what you need, when you need it. The idle servers are a direct consequence of having to guess years ahead.',
          elaborativePrompt: 'Why does "trade capital expense for variable expense" NOT fully solve the idle-server problem, even though it also seems relevant? Think about what changes if you still have to commit to capacity upfront, even if you pay differently.',
        },
        {
          afterSection: 3,
          question: 'During a product launch, a company\'s application automatically scaled from 10 to 80 EC2 instances within minutes to handle the surge, then scaled back to 10 overnight. Which characteristic does this describe?',
          options: [
            'High availability',
            'Fault tolerance',
            'Elasticity',
            'Agility',
          ],
          correct: 2,
          explainCorrect: 'Correct — elasticity is the ability to automatically scale capacity up and down to match demand. The key signal is "automatically scaled" in response to load changes.',
          elaborativePrompt: 'Why would high availability alone be insufficient to handle a 10× traffic spike, even though HA is a related concept? What does HA protect against that elasticity does not — and vice versa?',
        },
      ],
      selfExplanationPrompt: 'Before you try the practice question, explain to yourself: a non-technical manager asks why the company should move its data center workloads to AWS. What are the two most compelling reasons you would give — and which one is most relevant when the company\'s biggest frustration is slow time-to-market for new features?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company currently runs its application in a single on-premises data center. The engineering team frequently waits 6–8 weeks for new servers to be procured and provisioned before they can begin development work. Which benefit of AWS Cloud most directly addresses this problem?',
        options: [
          'Economies of scale reduce the per-unit cost of compute',
          'Increased speed and agility allows new resources to be acquired in minutes',
          'High availability across multiple Availability Zones prevents outages',
          'Elasticity automatically adjusts capacity to match workload demand',
        ],
        correct: 1,
        explanation: {
          summary: 'The 6–8 week wait is a procurement and provisioning delay — an agility problem. AWS eliminates it by making compute resources available in minutes through the console or API.',
          perOption: [
            'Economies of scale reduce cost, but they do not address the time delay in getting new resources. Cost is not the stated frustration.',
            'Correct — speed and agility directly solves the slow provisioning problem. New EC2 instances are available in minutes, not weeks.',
            'High availability protects against failures across AZs. It has nothing to do with how quickly developers can access new resources.',
            'Elasticity handles dynamic scaling of existing capacity. It does not solve the initial provisioning wait for new development environments.',
          ],
          link: 'Domain 1 · Task 1.1 — Benefits of AWS Cloud',
        },
      },
      videos: [
        {
          videoId: 'a9__D53WsUs',
          title: 'AWS Certified Cloud Practitioner — Full Course for Beginners',
          channel: 'freeCodeCamp.org',
          startSeconds: 0,
          endSeconds: 1200,
          relevance: 'Covers the six cloud advantages and the core value proposition of AWS at a beginner-friendly pace.',
        },
      ],
      keyTerms: [
        { term: 'Capital expenditure (CapEx)', def: 'Upfront spending on physical infrastructure — servers, networking, real estate. Fixed cost regardless of usage.' },
        { term: 'Operating expenditure (OpEx)', def: 'Pay-as-you-go spending for services consumed. Variable cost that scales with usage.' },
        { term: 'Elasticity', def: 'The ability to automatically scale compute capacity up or down in response to demand.' },
        { term: 'High availability', def: 'A design goal where a system continues operating despite individual component failures.' },
        { term: 'Agility', def: 'The speed at which new IT resources can be provisioned and released, measured in minutes rather than weeks.' },
      ],
      awsServices: [],
      examTips: [
        '"Eliminate need to guess capacity" → the answer whenever the scenario involves idle servers or capacity shortfalls.',
        '"Go global in minutes" → the answer whenever the scenario involves entering a new geographic market quickly.',
        'Elasticity ≠ high availability. HA keeps you running when something breaks. Elasticity keeps you performant when traffic spikes.',
        'Agility = speed of provisioning. If the pain is "slow time to market" or "long procurement," the answer is agility.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Cloud Concepts',
      domain: 'd1',
      weight: '24%',
      task: 'Task 1.2',
      title: 'AWS Well-Architected Framework — The Six Pillars',
      duration: 30,
      summary: 'The Well-Architected Framework is a set of design principles AWS uses to evaluate cloud workloads. The exam gives you a scenario and asks which pillar it falls under — learn each pillar\'s core concern and you can answer those questions reliably.',
      objectives: [
        'Name and describe all six pillars of the Well-Architected Framework',
        'Match a business or technical scenario to the correct pillar',
        'Identify the key design principles within each pillar',
        'Distinguish between pillars that are commonly confused (reliability vs. availability, cost optimization vs. performance efficiency)',
      ],
      preLearningCheck: {
        question: 'Before we start — which pillar of the Well-Architected Framework focuses on the ability of a workload to recover from failures and dynamically acquire resources to meet demand?',
        options: [
          'Operational Excellence',
          'Performance Efficiency',
          'Reliability',
          'Security',
        ],
        correct: 2,
        note: 'If you\'re not sure, take a guess — the attempt primes your brain to retain the correct answer when you read it.',
      },
      sections: [
        {
          heading: 'Why AWS wrote the Well-Architected Framework',
          body: 'By 2012 AWS had reviewed thousands of customer architectures. They kept seeing the same patterns — and the same mistakes. Teams optimised for cost but forgot reliability. Teams built highly reliable systems that nobody could operate. Teams added features faster than they could secure them.\n\nThe Well-Architected Framework is AWS\'s published answer: six lenses for evaluating any cloud workload. It does not prescribe a single architecture. It gives you the right questions to ask.',
        },
        {
          heading: 'The six pillars at a glance',
          body: 'Each pillar has a core concern. Learn that concern and you can answer most pillar-identification questions without memorising bullet points.',
          table: {
            headers: ['Pillar', 'Core concern', 'One-line summary'],
            rows: [
              ['Operational Excellence', 'Run and monitor workloads effectively', 'Automate operations, respond to events, learn from failures to keep improving'],
              ['Security', 'Protect data and systems', 'Apply least privilege, encrypt everything, detect threats early'],
              ['Reliability', 'Recover from disruptions', 'Design for failure: distribute load, auto-recover, test recovery procedures'],
              ['Performance Efficiency', 'Use resources efficiently', 'Right-size compute, use managed services, stay current with new AWS capabilities'],
              ['Cost Optimization', 'Eliminate waste', 'Pay only for what you use, right-size, use spot and reserved pricing'],
              ['Sustainability', 'Minimise environmental impact', 'Reduce energy consumption and carbon footprint of cloud workloads'],
            ],
          },
          callout: { type: 'tip', text: 'Memory trick: OSRPCS — "Ops Secures Reliable Performance, Cheaply and Sustainably." The order matches the official pillars and each word points at the core concern.' },
        },
        {
          heading: 'Operational Excellence — running well every day',
          body: 'Operational Excellence is about the ongoing management of workloads in production. It is the "day 2" pillar — not how you build something, but how you run it after launch.',
          bullets: [
            'Perform operations as code — use CloudFormation or CDK so infrastructure changes are version-controlled and repeatable.',
            'Make frequent, small, reversible changes — deploy small increments that can be quickly rolled back if something goes wrong.',
            'Anticipate failure — game-day exercises, chaos engineering, and runbook automation build muscle memory for incidents.',
            'Learn from all operational failures — every incident is a structured blameless post-mortem with concrete action items.',
          ],
        },
        {
          heading: 'Security — never trust, always verify',
          body: 'Security applies defence in depth: multiple layers of protection so that a breach of one layer does not compromise the whole system.',
          bullets: [
            'Implement a strong identity foundation — use IAM roles with least privilege; never share credentials; enable MFA on all human accounts.',
            'Enable traceability — log everything with CloudTrail, CloudWatch, and AWS Config; know who did what and when.',
            'Apply security at all layers — network (VPC, security groups, WAF), compute (patching, hardening), data (encryption at rest and in transit).',
            'Automate security best practices — use AWS Security Hub and GuardDuty to detect and respond to threats automatically.',
          ],
        },
        {
          heading: 'Reliability, Performance Efficiency, Cost Optimization & Sustainability',
          body: 'These four pillars complete the framework. The exam most often tests whether you can separate Reliability from Performance Efficiency — they sound similar but address completely different failure modes.',
          table: {
            headers: ['Pillar', 'What it asks', 'Common exam scenario'],
            rows: [
              ['Reliability', '"Will it keep running when something breaks?"', 'Multi-AZ deployments, auto-recovery from instance failure, database failover'],
              ['Performance Efficiency', '"Is it fast enough for its cost?"', 'Choosing the right EC2 instance type, using CloudFront for latency, Lambda for event-driven loads'],
              ['Cost Optimization', '"Are we spending money on things we don\'t need?"', 'Rightsizing, deleting unused snapshots, using Spot for batch jobs, Reserved Instances for steady state'],
              ['Sustainability', '"What is the environmental impact?"', 'Using managed services (less idle infrastructure), gravitating to newer, more efficient instance types'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company stores customer data and recently discovered that several S3 buckets are publicly accessible. An audit found that many IAM users have administrator access even though their jobs require far less. Which Well-Architected pillar is most violated?',
          options: [
            'Operational Excellence',
            'Security',
            'Reliability',
            'Cost Optimization',
          ],
          correct: 1,
          explainCorrect: 'Correct — public S3 buckets and excessive IAM permissions are both Security pillar violations. The Security pillar covers least privilege, data protection, and access control.',
          elaborativePrompt: 'Why would this situation not be classified under Operational Excellence, even though "poor operations" contributed to it? What is the precise distinction between the two pillars?',
        },
        {
          afterSection: 4,
          question: 'A team notices their application is running on the same large EC2 instance type it used two years ago when traffic was 10× higher. The instance is using only 8% of its CPU on average. Which pillar should guide the team\'s next action?',
          options: [
            'Reliability',
            'Performance Efficiency',
            'Cost Optimization',
            'Sustainability',
          ],
          correct: 2,
          explainCorrect: 'Correct — 8% CPU utilisation on an oversized instance is waste. Cost Optimization asks "are we spending money on resources we don\'t need?" Rightsizing directly addresses this.',
          elaborativePrompt: 'Why would "Performance Efficiency" be the wrong pillar here, even though instance sizing is a performance concept? What would need to be different about the scenario for Performance Efficiency to be the right answer?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: a colleague says "Reliability and Performance Efficiency are basically the same thing — both are about the system working properly." Explain to yourself why that\'s wrong. What exactly does each pillar protect against that the other does not?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company\'s application experienced a 4-hour outage when a single database server failed. The team has no automated recovery process — engineers had to manually restore from a backup. Which Well-Architected pillar does this failure most directly violate?',
        options: [
          'Operational Excellence — the team lacked runbooks for the recovery process',
          'Reliability — the system was not designed to recover automatically from infrastructure failures',
          'Security — unpatched database software contributed to the failure',
          'Performance Efficiency — the single database was undersized for the workload',
        ],
        correct: 1,
        explanation: {
          summary: 'The Reliability pillar requires workloads to automatically recover from infrastructure failures. A single database with no automated failover is a textbook reliability gap.',
          perOption: [
            'Operational Excellence is about running and improving operations. The lack of a runbook is a secondary symptom — the root cause is a single point of failure in the architecture.',
            'Correct — Reliability covers automatic recovery from failures. A single database with no Multi-AZ or read replica violates the core principle of designing for failure.',
            'There is no information about security vulnerabilities causing this outage. Security applies to data protection and access control, not infrastructure redundancy.',
            'Performance Efficiency is about using resources efficiently for the workload. Undersizing is a performance concern, not a recovery/availability concern.',
          ],
          link: 'Domain 1 · Task 1.2 — Well-Architected Framework · Reliability pillar',
        },
      },
      videos: [
        {
          videoId: 'x6DIk0_2Goo',
          title: 'AWS Well-Architected Framework Explained',
          channel: 'TechWorld with Nana',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Walks through each pillar with concrete examples — good visual summary for reinforcing the distinctions between pillars.',
        },
      ],
      keyTerms: [
        { term: 'Well-Architected Framework', def: 'AWS\'s set of architectural best practices across six pillars, used to evaluate and improve cloud workloads.' },
        { term: 'Operational Excellence', def: 'The pillar focused on running, monitoring, and continuously improving workloads in production.' },
        { term: 'Reliability', def: 'The pillar focused on a workload\'s ability to recover from failures and dynamically meet demand.' },
        { term: 'Least privilege', def: 'Granting only the minimum permissions required for a task — a core Security pillar principle.' },
        { term: 'Rightsizing', def: 'Matching instance or resource size to actual usage — a core Cost Optimization practice.' },
      ],
      awsServices: [
        { name: 'AWS Well-Architected Tool', purpose: 'Free console tool that reviews workloads against the six pillars and provides actionable recommendations.' },
      ],
      examTips: [
        '"Recover from failure automatically" → Reliability pillar.',
        '"Least privilege / IAM / encryption / detect threats" → Security pillar.',
        '"Rightsizing / unused resources / Spot Instances" → Cost Optimization pillar.',
        '"Deploy changes frequently and safely / runbooks / post-mortems" → Operational Excellence pillar.',
        'Reliability ≠ Performance. Reliability = "will it stay up?" Performance Efficiency = "is it fast enough for its cost?"',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Cloud Concepts',
      domain: 'd1',
      weight: '24%',
      task: 'Task 1.3',
      title: 'Cloud Migration — AWS CAF and the 7 Rs',
      duration: 30,
      summary: 'Most companies don\'t start in the cloud — they migrate to it. This session covers the AWS Cloud Adoption Framework (CAF), the seven migration strategies, and AWS Snowball for large data transfers.',
      objectives: [
        'Explain the purpose and perspectives of the AWS Cloud Adoption Framework (CAF)',
        'Identify and distinguish the seven migration strategies (the 7 Rs)',
        'Understand when to use AWS Snowball vs. online data transfer',
        'Match a migration scenario to the correct CAF outcome and strategy',
      ],
      preLearningCheck: {
        question: 'Before we start — what does "Rehost" mean in the context of cloud migration strategies?',
        options: [
          'Rewrite the application to use cloud-native services',
          'Move the application to the cloud without any changes ("lift and shift")',
          'Shut down the application because it is no longer needed',
          'Replace the application with a SaaS product',
        ],
        correct: 1,
        note: 'This is the most common migration strategy question on the exam. Take a guess before reading.',
      },
      sections: [
        {
          heading: 'Migration is harder than it looks',
          body: 'Moving to the cloud is not just a technology project. It changes how teams are organised, how finance tracks spending, how developers work, and how the company governs its data. Companies that treat it purely as an IT lift-and-shift frequently fail or stall.\n\nAWS observed thousands of migrations and distilled the lessons into the Cloud Adoption Framework — a structured approach to getting people, processes, and technology aligned before the first server ever moves.',
        },
        {
          heading: 'AWS Cloud Adoption Framework (CAF) — six perspectives',
          body: 'The CAF organises migration activities into six perspectives. The exam tests whether you can map a business outcome to the right perspective.',
          table: {
            headers: ['Perspective', 'Focus area', 'Typical owners'],
            rows: [
              ['Business', 'Align IT investments to business outcomes; reduce business risk', 'CEO, CFO, business unit leaders'],
              ['People', 'Evolve culture, leadership, and workforce skills for cloud', 'HR, training, change management'],
              ['Governance', 'Orchestrate cloud initiatives; manage risk and compliance', 'CIO, program management, compliance'],
              ['Platform', 'Build scalable cloud infrastructure and modernise architecture', 'CTO, architects, engineers'],
              ['Security', 'Ensure data confidentiality, integrity, and availability', 'CISO, security team'],
              ['Operations', 'Define how business and cloud operations are conducted day-to-day', 'VP Operations, support'],
            ],
          },
          callout: { type: 'tip', text: 'CAF exam pattern: the scenario will name a pain point (e.g. "staff lack cloud skills") — map it to the perspective whose owners would fix it (People perspective). You don\'t need to memorise the capability lists.' },
        },
        {
          heading: 'The seven migration strategies — the 7 Rs',
          body: 'Once leadership has aligned on migrating, engineers need a strategy for each individual application. AWS defines seven, ranging from "move it as-is" to "throw it away."',
          table: {
            headers: ['Strategy', 'Nickname', 'What it means', 'When to use it'],
            rows: [
              ['Rehost', 'Lift and shift', 'Move the app to EC2 without any changes', 'Fastest path to cloud; modernise later'],
              ['Replatform', 'Lift, tinker, and shift', 'Minor optimisations without changing core architecture (e.g. move to RDS)', 'Quick wins without full refactoring'],
              ['Refactor / Re-architect', 'Re-architect', 'Redesign using cloud-native services (serverless, containers)', 'When agility or scalability demands it; most expensive'],
              ['Repurchase', 'Drop and shop', 'Replace with a SaaS product (e.g. move CRM to Salesforce)', 'Legacy on-prem software with a commercial SaaS equivalent'],
              ['Retire', 'Turn it off', 'Decommission applications that are no longer needed', 'Portfolio cleanup; saves migration cost and ongoing spend'],
              ['Retain', 'Revisit later', 'Keep on-premises for now (compliance, recent investment, too complex)', 'Applications not ready to migrate yet'],
              ['Relocate', 'Hypervisor lift', 'Move VMware workloads to AWS VMware Cloud', 'Large VMware estates; no re-platforming needed'],
            ],
          },
        },
        {
          heading: 'AWS Snowball — moving petabytes offline',
          body: 'Online data transfer has a practical ceiling. Uploading 100 TB over a 1 Gbps connection takes over 9 days — longer if the connection is shared and not fully available.\n\nAWS Snowball solves this by physically shipping a ruggedised encrypted storage device to your premises. You load your data onto it, ship it back to AWS, and AWS imports it directly into S3. No internet bandwidth required.',
          bullets: [
            'Snowball Edge Storage Optimised — up to 80 TB of usable storage per device. Ship multiple devices in parallel for larger datasets.',
            'Snowball Edge Compute Optimised — includes EC2 compute for edge processing before data is sent to AWS.',
            'AWS Snow Family — the broader family includes Snowcone (small, portable) and Snowmobile (a shipping container for exabyte-scale migrations).',
          ],
          callout: { type: 'tip', text: 'Exam rule: if the scenario mentions limited bandwidth, slow connectivity, or terabytes-to-petabytes of data to transfer, the answer is likely AWS Snowball. Online transfer (AWS DataSync) is for smaller or ongoing data movement.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company migrating to AWS finds that its development team has strong application skills but no cloud experience. The migration is stalling because engineers are reverting to on-premises patterns. Which CAF perspective should the migration team focus on?',
          options: [
            'Platform perspective',
            'Security perspective',
            'People perspective',
            'Governance perspective',
          ],
          correct: 2,
          explainCorrect: 'Correct — the People perspective addresses workforce skills, culture, and change management. Engineers reverting to on-premises patterns is a skills and culture problem, not a technology or security problem.',
          elaborativePrompt: 'Why would the Platform perspective not solve this, even though it covers infrastructure and architecture? What is the crucial difference between having the right platform and having people who can use it effectively?',
        },
        {
          afterSection: 2,
          question: 'A company is moving a legacy on-premises HR application to AWS. The application has an outdated, undocumented codebase that nobody wants to touch. The team\'s goal is to move it to the cloud as quickly as possible and deal with modernisation later. Which migration strategy should they use?',
          options: [
            'Refactor — redesign it as a serverless application',
            'Rehost — lift and shift it to EC2 without changes',
            'Repurchase — replace it with an HR SaaS product',
            'Retire — decommission it since it is outdated',
          ],
          correct: 1,
          explainCorrect: 'Correct — Rehost (lift and shift) moves the application to EC2 without changes. It is the fastest strategy and explicitly defers modernisation. The undocumented codebase makes Refactor extremely risky.',
          elaborativePrompt: 'Why would Repurchase be a reasonable alternative to evaluate, and what additional information would you need before choosing it over Rehost? What makes Repurchase sometimes better — and sometimes worse — than Rehost for a legacy application?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain in your own words why a company might deliberately choose to Retain (keep on-premises) rather than migrate an application. What kinds of applications are genuinely better left on-premises, and what would have to change for them to become migration candidates?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company needs to migrate 500 TB of archival data from its on-premises data center to Amazon S3. The data center\'s internet connection is 200 Mbps and is shared with production traffic. The team estimates that a full online transfer would take months. Which AWS service should the company use?',
        options: [
          'AWS DataSync over a dedicated Direct Connect connection',
          'Amazon S3 Transfer Acceleration',
          'AWS Snowball Edge Storage Optimised',
          'AWS Storage Gateway File Gateway',
        ],
        correct: 2,
        explanation: {
          summary: '500 TB over a shared 200 Mbps connection is impractical online. AWS Snowball physically ships encrypted storage devices — load, ship, and AWS imports into S3 without consuming internet bandwidth.',
          perOption: [
            'Direct Connect would improve bandwidth, but setting up a Direct Connect circuit takes weeks and adds cost. Even with a dedicated connection, 500 TB is enormous and the data is archival (one-time transfer), making the ongoing cost of Direct Connect hard to justify.',
            'S3 Transfer Acceleration optimises online transfer over the public internet using CloudFront edge locations. It helps with latency but does not solve a bandwidth constraint at this scale.',
            'Correct — Snowball is designed exactly for this: large, one-time data migrations where online transfer is impractical due to bandwidth or time constraints.',
            'Storage Gateway File Gateway is for ongoing hybrid access to S3 as a file share. It is not a bulk data migration tool.',
          ],
          link: 'Domain 1 · Task 1.3 — Migration strategies and resources',
        },
      },
      videos: [
        {
          videoId: 'id-PY0GBFVE',
          title: 'AWS Migration Strategies — The 6 Rs Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Official AWS walkthrough of the migration strategies with concrete application examples.',
        },
      ],
      keyTerms: [
        { term: 'AWS CAF', def: 'Cloud Adoption Framework — a structured guide with six perspectives to align people, processes, and technology for cloud migration.' },
        { term: 'Rehost (lift and shift)', def: 'Moving an application to the cloud without any architectural changes. Fastest migration path.' },
        { term: 'Refactor', def: 'Re-architecting an application to use cloud-native services. Highest effort, highest long-term value.' },
        { term: 'AWS Snowball', def: 'A physically shipped, ruggedised encrypted device for transferring large datasets to AWS without using internet bandwidth.' },
        { term: 'Retire', def: 'Decommissioning applications that are no longer needed — reduces scope and cost of migration.' },
      ],
      awsServices: [
        { name: 'AWS Snowball Edge', purpose: 'Petabyte-scale offline data transfer device. Shipped to your premises, loaded with data, returned to AWS for import into S3.' },
        { name: 'AWS DataSync', purpose: 'Online data transfer service for moving data from on-premises to S3, EFS, or FSx over the internet or Direct Connect.' },
      ],
      examTips: [
        '"Lift and shift" = Rehost. "No code changes, fastest path" = Rehost.',
        '"Redesign / cloud-native / serverless" = Refactor/Re-architect.',
        '"Replace with SaaS" = Repurchase.',
        '"Limited bandwidth + large dataset" = AWS Snowball. "Ongoing sync" = DataSync.',
        'CAF perspectives map to pain points: skills gaps → People; compliance → Governance; architecture → Platform.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Cloud Concepts',
      domain: 'd1',
      weight: '24%',
      task: 'Task 1.4',
      title: 'Cloud Economics — CapEx, OpEx, and Rightsizing',
      duration: 30,
      summary: 'Understanding cloud economics is what separates candidates who pass from those who score in the 800s. This session covers the financial mechanics of cloud — fixed vs. variable costs, total cost of ownership, licensing models, and how rightsizing and automation turn economic theory into real savings.',
      objectives: [
        'Distinguish capital expenditure (CapEx) from operating expenditure (OpEx)',
        'Identify the hidden costs of on-premises infrastructure beyond hardware',
        'Understand BYOL vs. included licensing and when each model applies',
        'Explain rightsizing, automation benefits, and economies of scale as cost levers',
      ],
      preLearningCheck: {
        question: 'Before we start — which cost model does AWS primarily use?',
        options: [
          'Capital expenditure — you purchase reserved capacity upfront for 3–5 years',
          'Operating expenditure — you pay variable costs based on actual usage',
          'Fixed fee — you pay a flat monthly subscription regardless of usage',
          'Hybrid — AWS charges CapEx for compute and OpEx for storage',
        ],
        correct: 1,
        note: 'Take a guess — if you already know this, the session will deepen it. If you\'re unsure, you\'re about to find out.',
      },
      sections: [
        {
          heading: 'The data center bill you never fully see',
          body: 'When a company evaluates moving to the cloud, the finance team often looks at EC2 pricing and compares it to what they think their servers cost. That comparison almost always makes cloud look expensive.\n\nThe servers are the visible cost. The invisible costs are what the cloud comparison actually wins on: the real estate, the cooling, the power, the network equipment, the hardware refresh cycles every 3–5 years, the staff who rack and cable servers, the disaster recovery site they pay for but rarely use. Add it all up and the on-premises "cheaper" option frequently isn\'t.',
        },
        {
          heading: 'CapEx vs. OpEx — the foundational distinction',
          body: 'Every cloud economics question on the exam comes back to this table. Understand it deeply.',
          table: {
            headers: ['Model', 'What you pay', 'When you pay', 'Risk', 'Cloud equivalent'],
            rows: [
              ['Capital Expenditure (CapEx)', 'Large upfront purchase: servers, networking, real estate', 'Before you know your actual usage', 'You over-buy or under-buy; idle hardware is sunk cost', 'On-premises data center; Reserved Instances (partial analogy)'],
              ['Operating Expenditure (OpEx)', 'Ongoing cost for services consumed', 'After you use them, proportional to usage', 'Costs can spike with unexpected usage; requires budget monitoring', 'AWS pay-as-you-go (On-Demand pricing)'],
            ],
          },
          callout: { type: 'tip', text: 'AWS is primarily OpEx. The exam tests whether you understand that "variable cost" and "pay for what you use" are OpEx characteristics — and that this trades upfront risk for ongoing flexibility.' },
        },
        {
          heading: 'Total cost of ownership — what you\'re actually comparing',
          body: 'Total Cost of Ownership (TCO) is the full cost of an option over time, including everything a line-item hardware quote leaves out.',
          bullets: [
            'Hardware — servers, storage, networking equipment, refresh cycles every 3–5 years.',
            'Facilities — data center real estate, power, cooling (typically $1,000–$3,000/server/year just for power and cooling).',
            'Operations staff — staff to rack, cable, patch, monitor, and respond to hardware failures 24/7.',
            'Disaster recovery — a secondary site, often running at 50% idle capacity, paid for whether or not a disaster ever occurs.',
            'Software licensing — OS, database, and middleware licenses that run on physical hardware.',
          ],
        },
        {
          heading: 'Licensing: BYOL vs. included licensing',
          body: 'Software licensing is one of the trickiest cost factors in cloud migration. You have two models.',
          bullets: [
            'Included licensing — the software license is bundled into the AWS service price. Amazon RDS for SQL Server, for example, includes the Microsoft SQL Server license in the hourly rate. Simpler to price, but typically more expensive per hour.',
            'Bring Your Own License (BYOL) — you bring an existing license you already own (often from an Enterprise Agreement) to AWS and run it on dedicated hardware (Dedicated Hosts). Cheaper per hour if you have a valid license; requires careful compliance tracking.',
          ],
          callout: { type: 'tip', text: 'Exam pattern: if a scenario says a company has an existing Enterprise Agreement for Windows Server or SQL Server licenses, BYOL on Dedicated Hosts is likely the most cost-effective approach.' },
        },
        {
          heading: 'Rightsizing and automation — turning theory into savings',
          body: 'Moving to the cloud does not automatically save money. You can replicate all the waste of on-premises infrastructure in the cloud — and pay for it by the hour instead of in one large capital outlay.\n\nRightsizing and automation are the practices that actually realise cloud savings.',
          bullets: [
            'Rightsizing — matching instance type and size to actual usage. An m5.4xlarge running at 5% CPU is wasting roughly 95% of what you\'re paying for. AWS Compute Optimizer analyses metrics and recommends the right size.',
            'Economies of scale — because AWS aggregates demand from millions of customers, it achieves hardware and operational costs that no individual company can match. AWS passes some of those savings back as price reductions (which have happened 100+ times since 2006).',
            'Automation — replacing manual, error-prone operational tasks (server patching, backup schedules, scaling decisions) with code eliminates the labour cost and human error component of operations.',
            'Serverless for the right workloads — AWS Lambda charges per invocation and execution duration. A workload that runs 1,000 times a day for 100ms each pays for 100 seconds of compute. The equivalent EC2 instance runs all month.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A CFO argues that running a workload on EC2 at $0.10/hour is more expensive than their on-premises servers, which cost $8,000 to purchase 3 years ago. What critical cost factor is the CFO most likely failing to include in the on-premises total?',
          options: [
            'EC2 data transfer costs outbound to the internet',
            'Facilities costs — power, cooling, and data center space for the server',
            'AWS Support plan costs required for enterprise workloads',
            'The cost of the AWS Management Console',
          ],
          correct: 1,
          explainCorrect: 'Correct — the purchase price of hardware is only part of on-premises cost. Power, cooling, and data center space often cost more than the hardware itself over a 3-year lifecycle.',
          elaborativePrompt: 'What other on-premises costs beyond facilities are also invisible in a hardware-only comparison? List two more categories that would change the TCO calculation significantly.',
        },
        {
          afterSection: 4,
          question: 'A company just migrated to AWS and noticed their monthly bill is 40% higher than expected. An analysis shows that 60% of their EC2 instances are running at under 10% CPU utilisation at all times. What is the most appropriate next step to reduce costs?',
          options: [
            'Move all workloads to Reserved Instances immediately',
            'Enable detailed monitoring on all instances to gather more data',
            'Rightsize the instances to match actual usage patterns',
            'Switch to Spot Instances for all production workloads',
          ],
          correct: 2,
          explainCorrect: 'Correct — 10% CPU utilisation on standard instances means the instances are dramatically oversized. Rightsizing reduces the instance type (and cost) to match actual usage, which is the direct solution to the stated problem.',
          elaborativePrompt: 'Why would moving to Reserved Instances not solve the fundamental problem even though it would reduce the hourly rate? What would still be wasted — and potentially locked in?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain to a finance colleague (who has never worked in IT) why "the servers only cost us $50,000" is an incomplete picture of what the data center actually costs the company. What would you include in the full accounting?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is evaluating whether to expand its on-premises data center or migrate to AWS. The on-premises option requires purchasing $2M of hardware upfront. The AWS option has no upfront cost but charges monthly based on usage. Which characteristic of the AWS pricing model best describes this difference?',
        options: [
          'AWS uses a CapEx model that spreads hardware costs over 36 months',
          'AWS trades capital expenditure for variable operational expenditure',
          'AWS eliminates all IT costs by moving them to a fixed monthly subscription',
          'AWS uses a hybrid model that combines upfront reservation fees with usage charges',
        ],
        correct: 1,
        explanation: {
          summary: 'The $2M upfront purchase is CapEx. AWS\'s pay-as-you-go model converts that to OpEx — variable costs that scale with usage and require no upfront commitment.',
          perOption: [
            'AWS does not spread hardware costs over 36 months. There is no hardware purchase — AWS owns and manages the hardware. The customer pays for usage.',
            'Correct — this is the classic CapEx-to-OpEx shift. No upfront commitment, no hardware purchase; pay variable costs based on what you actually consume.',
            'AWS does not charge a flat monthly subscription. Costs vary with usage. "Fixed subscription" describes SaaS products, not AWS infrastructure pricing.',
            'AWS On-Demand pricing has no upfront fees. Reserved Instances (a separate option) do have upfront components, but that is not described in this scenario.',
          ],
          link: 'Domain 1 · Task 1.4 — Cloud economics · CapEx vs. OpEx',
        },
      },
      videos: [
        {
          videoId: 'RMSq3GAdAUM',
          title: 'AWS Total Cost of Ownership Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Official AWS explanation of TCO concepts with the AWS Pricing Calculator walkthrough.',
        },
      ],
      keyTerms: [
        { term: 'Total Cost of Ownership (TCO)', def: 'The full cost of an IT option over time, including hardware, facilities, staffing, and software — not just the purchase price.' },
        { term: 'CapEx', def: 'Capital Expenditure — large upfront investment in physical assets. Owned, depreciated, fixed regardless of usage.' },
        { term: 'OpEx', def: 'Operating Expenditure — ongoing variable costs paid for services as consumed. AWS\'s primary billing model.' },
        { term: 'Rightsizing', def: 'Adjusting instance types and sizes to match actual workload requirements, eliminating over-provisioned (wasted) capacity.' },
        { term: 'BYOL', def: 'Bring Your Own License — using an existing software license on AWS infrastructure (typically Dedicated Hosts) to avoid paying for an included license.' },
      ],
      awsServices: [
        { name: 'AWS Compute Optimizer', purpose: 'Analyses CloudWatch metrics and recommends optimal EC2 instance types and sizes based on actual utilisation.' },
        { name: 'AWS Pricing Calculator', purpose: 'Estimates the cost of AWS services for a proposed architecture before you build it.' },
      ],
      examTips: [
        'CapEx = upfront purchase. OpEx = pay as you go. AWS is primarily OpEx.',
        '"Hidden costs" of on-premises: power, cooling, real estate, staff, DR site, hardware refresh.',
        '"Rightsizing" = the answer when the scenario describes oversized or underutilised resources.',
        'BYOL → Dedicated Hosts. If a scenario mentions an existing Enterprise Agreement, Dedicated Hosts + BYOL is the cost-efficient pairing.',
        '"Economies of scale" = the reason AWS can keep cutting prices — aggregated demand drives down per-unit costs.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — SECURITY AND COMPLIANCE
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Security & Compliance',
      domain: 'd2',
      weight: '30%',
      task: 'Task 2.1',
      title: 'The Shared Responsibility Model',
      duration: 30,
      summary: 'The single most-tested concept in Domain 2. Who is responsible for what changes depending on whether you\'re running EC2, RDS, or Lambda. Master this model and you can answer a third of all D2 questions with confidence.',
      objectives: [
        'Explain the AWS shared responsibility model',
        'Describe what AWS is responsible for ("security of the cloud")',
        'Describe what the customer is responsible for ("security in the cloud")',
        'Explain how responsibility shifts between EC2, RDS, and Lambda',
      ],
      preLearningCheck: {
        question: 'Before we start — who is responsible for patching the operating system on an Amazon EC2 instance?',
        options: [
          'AWS — they manage all infrastructure including the OS running on EC2',
          'The customer — EC2 is IaaS and the customer controls the OS layer',
          'It is shared equally between AWS and the customer',
          'AWS patches the OS automatically unless the customer opts out',
        ],
        correct: 1,
        note: 'This is the canonical shared responsibility question. If you guessed wrong, the session explains exactly why.',
      },
      sections: [
        {
          heading: 'The contractor analogy',
          body: 'Imagine hiring a construction company to build you an office. They are responsible for the foundation, the walls, the electrical wiring, and the plumbing — the building itself. What you do inside the office — how you secure it, who has keys, whether you install a fire suppression system — is your responsibility.\n\nAWS works exactly the same way. AWS is responsible for the building. You are responsible for what you put inside it.',
        },
        {
          heading: 'AWS\'s responsibility — "security OF the cloud"',
          body: 'AWS owns and operates the physical infrastructure that runs all AWS services. Customers never see this layer — and never have to manage it.',
          bullets: [
            'Physical data centers — buildings, access controls, perimeter security, cameras, guards.',
            'Physical hardware — servers, networking equipment, storage hardware and their maintenance and eventual disposal.',
            'Network infrastructure — the fiber, switches, and routers that connect AWS Regions and Availability Zones.',
            'Hypervisor and virtualisation layer — the software that runs EC2 instances is AWS\'s responsibility to patch and secure.',
            'Managed service software — for services like S3, DynamoDB, and Lambda, AWS manages the underlying OS and software, not the customer.',
          ],
        },
        {
          heading: 'Customer\'s responsibility — "security IN the cloud"',
          body: 'The customer\'s responsibility starts at the point where they have control. For EC2, that is the operating system. For S3, it is the access policies and encryption settings.',
          bullets: [
            'Operating system (EC2) — patching, hardening, and securing the OS running on your EC2 instance is 100% the customer\'s job.',
            'Application code — the security of the software you write and deploy.',
            'IAM — creating users, groups, roles, and policies; enforcing least privilege; enabling MFA.',
            'Data encryption — choosing whether to encrypt data at rest and in transit, and managing encryption keys.',
            'Network configuration — security group rules, NACLs, VPC routing decisions.',
            'Identity and access — managing who can log into your systems and what they can do.',
          ],
        },
        {
          heading: 'How responsibility shifts by service type',
          body: 'This is where most candidates lose marks. The model is not binary — it shifts depending on how much of the stack AWS manages for you.',
          table: {
            headers: ['Service', 'Type', 'OS patching', 'Database patching', 'App code', 'Data', 'IAM'],
            rows: [
              ['Amazon EC2', 'IaaS', 'Customer', 'Customer (if DB on EC2)', 'Customer', 'Customer', 'Customer'],
              ['Amazon RDS', 'PaaS (managed DB)', 'AWS', 'AWS', 'N/A', 'Customer', 'Customer'],
              ['AWS Lambda', 'Serverless / FaaS', 'AWS', 'N/A', 'Customer (function code)', 'Customer', 'Customer'],
              ['Amazon S3', 'Managed storage', 'AWS', 'N/A', 'N/A', 'Customer', 'Customer'],
            ],
          },
          callout: { type: 'warning', text: 'Common mistake: candidates assume AWS patches the OS for EC2. It does NOT. EC2 is IaaS — the customer owns the OS and everything above it. AWS only manages the physical host and hypervisor.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company\'s EC2 instance was compromised because the operating system had not been patched in 8 months. The company claims AWS should have patched it automatically. Which statement is correct?',
          options: [
            'AWS should have patched it — AWS is responsible for all EC2 infrastructure',
            'The customer is responsible — EC2 OS patching is the customer\'s job under the shared responsibility model',
            'It is a shared responsibility — AWS patches the OS and the customer applies application patches',
            'AWS is responsible for patching if the customer uses Amazon-provided AMIs',
          ],
          correct: 1,
          explainCorrect: 'Correct — under the shared responsibility model, EC2 is IaaS. The customer controls and is responsible for the guest OS, including patching. AWS manages only the physical host and hypervisor.',
          elaborativePrompt: 'How does this responsibility change if the same application runs on AWS Lambda instead of EC2? What does that shift tell you about the trade-off between using managed services vs. IaaS?',
        },
        {
          afterSection: 3,
          question: 'A company runs its customer database on Amazon RDS. A security audit flags that database software patches have not been applied. Who is responsible for applying database engine patches on RDS?',
          options: [
            'The customer — they control all software running in their account',
            'AWS — RDS is a managed service and AWS handles database engine patching',
            'It is shared — AWS applies minor patches and the customer applies major version upgrades',
            'The customer\'s DBA — AWS requires a designated database administrator to approve all patches',
          ],
          correct: 1,
          explainCorrect: 'Correct — RDS is a managed service (PaaS). AWS manages the underlying OS and database engine patching. The customer is responsible for the data inside the database, IAM access to it, and encryption settings — not the engine patches.',
          elaborativePrompt: 'If the customer wanted full control over database patching timing and procedures, what would they need to do differently — and what would they give up by making that change?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain to yourself why the line between AWS\'s responsibility and the customer\'s responsibility is drawn at different levels for EC2 vs. RDS vs. Lambda. What is the underlying principle that determines where AWS takes over?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a web application on Amazon EC2 instances behind an Elastic Load Balancer. A penetration test reveals that the EC2 instances are running an outdated version of the operating system with known vulnerabilities. According to the AWS shared responsibility model, who is responsible for remediating this finding?',
        options: [
          'AWS — they are responsible for the security of all EC2 infrastructure',
          'The customer — patching the EC2 operating system is a customer responsibility',
          'AWS Security — the AWS Trust and Safety team patches known vulnerabilities automatically',
          'Both AWS and the customer share equal responsibility for OS-level security on EC2',
        ],
        correct: 1,
        explanation: {
          summary: 'EC2 is IaaS. AWS manages the physical host and hypervisor. The operating system and everything above it — including patching — is the customer\'s responsibility.',
          perOption: [
            'AWS is responsible for the physical infrastructure and hypervisor — not the guest OS. Customers choose their AMI and are responsible for keeping it patched.',
            'Correct — EC2 OS patching is explicitly a customer responsibility under the shared responsibility model.',
            'The AWS Trust and Safety team handles abuse reports and policy violations, not automated OS patching for customer instances.',
            'Responsibility is not shared equally on EC2. The OS layer is entirely the customer\'s domain.',
          ],
          link: 'Domain 2 · Task 2.1 — Shared responsibility model',
        },
      },
      videos: [
        {
          videoId: '2VuXVoL5Cvw',
          title: 'AWS Shared Responsibility Model Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Official AWS explanation of the shared responsibility model with service-by-service examples.',
        },
      ],
      keyTerms: [
        { term: 'Shared responsibility model', def: 'AWS\'s framework dividing security duties: AWS secures the cloud infrastructure; the customer secures everything they put in it.' },
        { term: 'Security OF the cloud', def: 'AWS\'s responsibility: physical hardware, data centers, networking, hypervisor, and managed service software.' },
        { term: 'Security IN the cloud', def: 'The customer\'s responsibility: OS patching, IAM, application code, data encryption, and network configuration.' },
        { term: 'IaaS', def: 'Infrastructure as a Service — e.g. EC2. The customer controls the OS and above; AWS controls physical host and hypervisor.' },
        { term: 'PaaS', def: 'Platform as a Service — e.g. RDS. AWS manages the OS and platform software; the customer manages data and access.' },
      ],
      awsServices: [
        { name: 'Amazon EC2', purpose: 'IaaS virtual machines. Customer controls and is responsible for the operating system and above.' },
        { name: 'Amazon RDS', purpose: 'Managed relational database service. AWS handles OS and DB engine patching; customer handles data and IAM.' },
        { name: 'AWS Lambda', purpose: 'Serverless compute. AWS manages all infrastructure including the OS; customer is responsible only for function code and IAM.' },
      ],
      examTips: [
        '"Security OF the cloud" = AWS. "Security IN the cloud" = customer.',
        'EC2 OS patching = customer. RDS OS/DB patching = AWS. Lambda everything below code = AWS.',
        'The more managed a service is, the more AWS takes on. EC2 < RDS < Lambda (in terms of how much the customer owns).',
        'IAM is ALWAYS the customer\'s responsibility, regardless of service type.',
        'Data encryption settings are ALWAYS the customer\'s choice (AWS provides the tools; the customer decides to use them).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Security & Compliance',
      domain: 'd2',
      weight: '30%',
      task: 'Task 2.2',
      title: 'Compliance, Governance, and Security Concepts',
      duration: 30,
      summary: 'AWS serves industries from healthcare to finance — each with its own regulatory requirements. This session covers how AWS helps customers meet compliance obligations, the key governance and audit tools, and the encryption options the exam tests most often.',
      objectives: [
        'Identify where to find AWS compliance reports and certifications (AWS Artifact)',
        'Understand encryption at rest vs. encryption in transit',
        'Recognise the purpose of key governance and audit services (CloudTrail, Config, CloudWatch)',
        'Describe how AWS helps meet geographic and industry compliance requirements',
      ],
      preLearningCheck: {
        question: 'Before we start — where can AWS customers access compliance reports such as SOC 2 and ISO 27001 certifications?',
        options: [
          'AWS Security Blog',
          'AWS Artifact',
          'AWS Trusted Advisor',
          'AWS Shield Advanced console',
        ],
        correct: 1,
        note: 'AWS Artifact is a specific service name that appears on the exam. Take a guess before we cover it.',
      },
      sections: [
        {
          heading: 'The compliance burden problem',
          body: 'A hospital building a patient records application on-premises has to audit its own hardware, produce its own HIPAA compliance evidence, and maintain its own security certifications. That is expensive, slow, and requires specialised compliance staff.\n\nWhen that hospital moves to AWS, something important happens: AWS has already completed those audits. AWS holds ISO 27001, SOC 2, HIPAA, PCI DSS, and dozens of other certifications — and it makes the audit evidence available to customers so they can demonstrate their own compliance to regulators.',
        },
        {
          heading: 'AWS Artifact — your compliance document library',
          body: 'AWS Artifact is a self-service portal in the AWS console where customers can download AWS\'s compliance reports and certifications on demand.',
          bullets: [
            'Available at no charge in the AWS Management Console.',
            'Contains third-party audit reports including SOC 1, SOC 2, SOC 3, ISO certifications, PCI DSS attestation, HIPAA eligibility documentation, and more.',
            'Customers can use these reports as evidence in their own compliance audits.',
            'Also contains AWS agreements (e.g. Business Associate Agreement for HIPAA) that customers can accept digitally.',
          ],
          callout: { type: 'tip', text: '"Where do you find AWS compliance reports?" → AWS Artifact. This is tested directly and frequently.' },
        },
        {
          heading: 'Encryption — at rest vs. in transit',
          body: 'Encryption is a two-state problem. Data exists in one of two states: stored somewhere (at rest) or moving between systems (in transit). Both states need protection, and the exam tests both.',
          table: {
            headers: ['Type', 'What it protects', 'AWS tools', 'Exam signal'],
            rows: [
              ['Encryption at rest', 'Data stored in S3, EBS, RDS, DynamoDB — protects against physical theft of storage media', 'AWS KMS, S3 server-side encryption, EBS encryption, RDS encryption', '"Data stored in S3 must be protected" → encryption at rest'],
              ['Encryption in transit', 'Data moving between systems — protects against network interception (man-in-the-middle)', 'TLS/SSL, HTTPS, VPN, AWS Certificate Manager', '"Data moving between client and server must be protected" → encryption in transit'],
            ],
          },
        },
        {
          heading: 'Governance and audit services — know who did what',
          body: 'Governance requires accountability. AWS provides several services specifically for understanding what is happening in your account, who changed what, and whether your configuration complies with policy.',
          table: {
            headers: ['Service', 'What it records', 'Key use case'],
            rows: [
              ['AWS CloudTrail', 'API calls — who did what, when, from where', 'Audit trail: "who deleted that S3 bucket?" or "who changed the security group?"'],
              ['Amazon CloudWatch', 'Metrics, logs, and events from AWS services and applications', 'Operational monitoring: alerts when CPU spikes, application errors increase'],
              ['AWS Config', 'Configuration changes to AWS resources over time', 'Compliance check: "is this S3 bucket public? Was it public yesterday?"'],
              ['AWS Audit Manager', 'Automated evidence collection for compliance frameworks', 'Continuous audit evidence for PCI DSS, HIPAA, SOC 2 without manual screenshots'],
            ],
          },
          callout: { type: 'tip', text: 'CloudTrail = WHO. CloudWatch = WHAT IS HAPPENING. Config = WHAT HAS CHANGED. These three are the most commonly confused services on the exam.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A financial services company is preparing for a PCI DSS audit. The auditor asks for evidence that the underlying cloud infrastructure meets PCI DSS requirements. Where should the company look?',
          options: [
            'AWS Security Hub dashboard',
            'Amazon Inspector reports',
            'AWS Artifact',
            'AWS Trusted Advisor security checks',
          ],
          correct: 2,
          explainCorrect: 'Correct — AWS Artifact is the self-service portal for AWS compliance documents including PCI DSS attestation reports. This is exactly what auditors request as evidence of cloud infrastructure compliance.',
          elaborativePrompt: 'What additional compliance evidence would the company still need to produce themselves — the kind that AWS Artifact does NOT cover? Think about where the customer\'s responsibility begins in a PCI DSS audit.',
        },
        {
          afterSection: 3,
          question: 'A security team receives an alert that an S3 bucket containing customer data was made publicly accessible. They need to determine which IAM user made the change and when. Which AWS service provides this information?',
          options: [
            'Amazon CloudWatch — it monitors resource metrics and sends alerts',
            'AWS Config — it tracks configuration changes over time',
            'AWS CloudTrail — it records all API calls including who made them',
            'Amazon GuardDuty — it detects suspicious activity in the account',
          ],
          correct: 2,
          explainCorrect: 'Correct — CloudTrail records every API call, including the IAM user or role who made it, the timestamp, and the source IP. "Who changed this bucket?" is always a CloudTrail question.',
          elaborativePrompt: 'Why would AWS Config also be relevant in this scenario, even though it\'s not the correct answer? What would Config tell you that CloudTrail would not — and what would CloudTrail tell you that Config would not?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: without looking at your notes, explain the difference between CloudTrail, CloudWatch, and Config in one sentence each. If you can state clearly what each one records and its primary use case, you will not confuse them on the exam.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company\'s security policy requires that all data stored in Amazon S3 must be protected against unauthorised access if the underlying storage media is removed or stolen. Which security measure should the company implement?',
        options: [
          'Enable S3 Versioning to maintain copies of all objects',
          'Configure S3 server-side encryption to encrypt data at rest',
          'Enable S3 Transfer Acceleration for all uploads',
          'Apply an S3 bucket policy that restricts access by IP address',
        ],
        correct: 1,
        explanation: {
          summary: 'Physical theft of storage media is the exact threat that encryption at rest addresses. S3 server-side encryption ensures that even raw storage media contains only unreadable ciphertext.',
          perOption: [
            'S3 Versioning maintains multiple versions of objects to recover from accidental deletion or overwrite. It does not protect against physical theft of storage media.',
            'Correct — encryption at rest protects stored data if the physical media is compromised. Server-side encryption means AWS encrypts data before writing it to disk and decrypts it when you read it.',
            'Transfer Acceleration improves upload speed via CloudFront edge locations. It protects data in transit speed, not data at rest.',
            'A bucket policy restricting by IP controls who can access the data over the network. It does not protect the raw data on physical storage media.',
          ],
          link: 'Domain 2 · Task 2.2 — Security concepts · Encryption at rest',
        },
      },
      videos: [
        {
          videoId: 'giMvObLlx4E',
          title: 'AWS Compliance Overview',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Explains how AWS compliance programs work and how customers inherit compliance from AWS.',
        },
      ],
      keyTerms: [
        { term: 'AWS Artifact', def: 'Self-service portal for downloading AWS compliance reports (SOC, ISO, PCI DSS, HIPAA) and AWS agreements.' },
        { term: 'Encryption at rest', def: 'Protecting data that is stored — on disk, in databases, in S3. Defends against physical media theft.' },
        { term: 'Encryption in transit', def: 'Protecting data as it moves between systems — over the network. Uses TLS/HTTPS/VPN.' },
        { term: 'AWS CloudTrail', def: 'Records every AWS API call — who, what, when, where. The primary service for security auditing and forensics.' },
        { term: 'AWS Config', def: 'Tracks changes to AWS resource configurations over time and evaluates them against compliance rules.' },
      ],
      awsServices: [
        { name: 'AWS Artifact', purpose: 'Downloads AWS compliance reports and agreements for customer audits.' },
        { name: 'AWS CloudTrail', purpose: 'Logs all API activity in an AWS account — the audit trail for security investigations.' },
        { name: 'AWS Config', purpose: 'Records configuration changes to AWS resources and evaluates whether they comply with rules.' },
        { name: 'Amazon CloudWatch', purpose: 'Monitors metrics, logs, and events from AWS services and applications; triggers alarms.' },
        { name: 'AWS Audit Manager', purpose: 'Automates collection of audit evidence for compliance frameworks like PCI DSS and HIPAA.' },
      ],
      examTips: [
        '"Where are AWS compliance reports?" → AWS Artifact.',
        'CloudTrail = WHO did WHAT (API calls). CloudWatch = IS SOMETHING WRONG (metrics/alarms). Config = HAS THIS CHANGED (configuration state).',
        'Encryption at rest = protects stored data. Encryption in transit = protects data moving over a network.',
        'AWS KMS (Key Management Service) manages encryption keys used by S3, EBS, RDS, and other services.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Security & Compliance',
      domain: 'd2',
      weight: '30%',
      task: 'Task 2.3',
      title: 'IAM — Identity and Access Management',
      duration: 30,
      summary: 'IAM is the front door to every AWS service. Understanding how users, groups, roles, and policies work together — and how MFA and least privilege are applied — is essential for Domain 2 and shows up across all five domains.',
      objectives: [
        'Explain the purpose of the AWS root account and when (not) to use it',
        'Distinguish IAM users, groups, roles, and policies',
        'Describe the principle of least privilege and how to enforce it',
        'Identify authentication options including MFA and IAM Identity Center',
      ],
      preLearningCheck: {
        question: 'Before we start — what should you do immediately after creating a new AWS account?',
        options: [
          'Create an IAM user with administrator access for day-to-day tasks',
          'Enable MFA on the root account and stop using it for regular work',
          'Share the root account credentials with the senior IT administrator',
          'Delete the root account to prevent unauthorised access',
        ],
        correct: 1,
        note: 'Root account security is a direct exam topic. Take a guess before reading.',
      },
      sections: [
        {
          heading: 'The master key problem',
          body: 'When you create an AWS account, you get a root user — an account with unlimited power over everything in the account. It can delete all resources, cancel the account, change billing, and bypass every permission policy. There is no permission boundary on the root user.\n\nUsing the root user for everyday tasks is like carrying a master key to every room in a hospital on your keychain as you make daily rounds. One moment of inattention — a phishing email, a stolen laptop — and the entire hospital is compromised.\n\nIAM exists to solve this. You create individual identities with only the permissions they need, leaving the master key locked in a safe.',
        },
        {
          heading: 'The root account — lock it down on day one',
          body: 'The root account should be used for exactly two things: creating the first IAM user, and tasks that only root can do (very few). For everything else, use IAM.',
          bullets: [
            'Enable MFA on the root account immediately after account creation.',
            'Do not create access keys for the root account.',
            'Store root credentials securely — physical safe or a password manager that is itself MFA-protected.',
            'Tasks only root can do: changing the account name or email, closing the account, restoring IAM permissions if a user accidentally removes all admin access, subscribing to certain AWS support plans.',
          ],
          callout: { type: 'warning', text: 'Exam trap: any option that says "use the root account" for a regular task is almost always wrong. The best practice is to lock root in a safe and operate through IAM users or roles.' },
        },
        {
          heading: 'IAM building blocks — users, groups, roles, and policies',
          body: 'IAM has four main concepts. Learn how they relate to each other.',
          table: {
            headers: ['Concept', 'What it is', 'How it works'],
            rows: [
              ['IAM User', 'A permanent identity for a person or application', 'Has a username/password (console) and/or access keys (programmatic). Gets permissions directly or via group membership.'],
              ['IAM Group', 'A collection of IAM users', 'Attach policies to the group; all users in the group inherit those permissions. The right way to manage permissions at scale.'],
              ['IAM Role', 'A temporary identity that can be assumed', 'No long-term credentials. AWS services (EC2, Lambda), other accounts, or federated users assume roles to get temporary permissions.'],
              ['IAM Policy', 'A JSON document defining permissions', 'Attached to users, groups, or roles. Specifies what actions are allowed or denied on which resources.'],
            ],
          },
        },
        {
          heading: 'Least privilege and authentication',
          body: 'Least privilege is not a feature — it is a discipline. It means granting only the minimum permissions required to do the job, and no more. The exam tests this principle in scenario form: if a developer only needs to read from S3, their policy should grant only S3:GetObject — not AdministratorAccess.',
          bullets: [
            'Managed policies — AWS-provided policies (e.g. AmazonS3ReadOnlyAccess) that cover common use cases. Easy to apply, less precise.',
            'Custom policies — JSON policies you write to grant exactly the permissions needed. More precise, requires careful authoring.',
            'Multi-Factor Authentication (MFA) — a second factor beyond password. Hardware MFA key or virtual MFA app. Required for root; strongly recommended for all users with console access.',
            'IAM Identity Center (formerly AWS SSO) — single sign-on service that lets users log in once and access multiple AWS accounts and applications with a single set of credentials.',
            'Federated identity — employees can log in using company credentials (Active Directory, Google Workspace) through SAML 2.0 or OIDC, without creating individual IAM users for each person.',
          ],
          callout: { type: 'tip', text: 'Exam pattern: "a company has 500 employees who need access to AWS" → the answer involves IAM Identity Center or federated access, NOT creating 500 individual IAM users.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A new AWS account has just been created. The account owner plans to use the root account credentials daily for infrastructure management. A security reviewer flags this as a critical risk. Which two actions should the account owner take FIRST?',
          options: [
            'Enable MFA on the root account and create a separate IAM admin user for day-to-day work',
            'Create a strong 20-character password for the root account and share it with the team',
            'Enable CloudTrail logging and assign root account credentials to the senior engineer',
            'Create access keys for the root account so the team can use the CLI securely',
          ],
          correct: 0,
          explainCorrect: 'Correct — the two immediate actions are (1) enable MFA on root to protect against credential theft, and (2) create an IAM admin user so root is never used for daily tasks.',
          elaborativePrompt: 'Why is creating a "strong password" for root still insufficient even if it is 20 characters? What attack vectors does a strong password alone not protect against?',
        },
        {
          afterSection: 2,
          question: 'A company has 50 developers who all need the same set of permissions to deploy applications. Which IAM approach follows best practices?',
          options: [
            'Create one IAM user with full admin access and share those credentials among all developers',
            'Create a separate IAM policy for each developer and attach it individually to each user',
            'Create an IAM group, attach the required permissions policy to the group, and add all developers as members',
            'Use the root account to grant permissions to all 50 developers directly',
          ],
          correct: 2,
          explainCorrect: 'Correct — IAM Groups are the right tool for managing permissions at scale. Attach the policy once to the group; adding a new developer means adding them to the group, not recreating permissions.',
          elaborativePrompt: 'What operational problem would you face six months from now if you instead attached individual policies to each of the 50 users? Think about what happens when the permission requirements change.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the difference between an IAM user and an IAM role in your own words. Focus specifically on the difference in credential lifetime — when would you use a role instead of a user, and why is that better for an EC2 instance that needs to access S3?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company has an EC2 instance running an application that needs to read objects from an S3 bucket. A developer suggests creating an IAM user with S3 read access and embedding the access key in the application\'s configuration file. Which approach is more secure?',
        options: [
          'Use the approach the developer suggested — access keys are encrypted in the config file',
          'Create an IAM role with S3 read permissions and attach it to the EC2 instance',
          'Use the root account credentials to give the application full S3 access',
          'Store the access key in an environment variable instead of a config file',
        ],
        correct: 1,
        explanation: {
          summary: 'IAM roles provide temporary credentials that the EC2 instance automatically rotates. No long-term credentials are stored anywhere — the role is assumed at runtime.',
          perOption: [
            'Storing access keys in config files is insecure. Keys can be accidentally committed to source control, leaked in logs, or exposed in backups. Long-term credentials are a significant attack surface.',
            'Correct — IAM roles attached to EC2 instances provide temporary credentials via the instance metadata service. No long-term access keys are stored anywhere. This is the AWS best practice.',
            'The root account should never be used for application credentials. It has unlimited permissions and cannot be scoped to read-only S3 access.',
            'Environment variables are slightly better than config files but still store long-term credentials on the instance. If the instance is compromised, the key is exposed.',
          ],
          link: 'Domain 2 · Task 2.3 — IAM roles and least privilege',
        },
      },
      videos: [
        {
          videoId: 'SXSqhTn2DuE',
          title: 'AWS IAM Core Concepts Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Covers users, groups, roles, and policies with console demonstrations.',
        },
      ],
      keyTerms: [
        { term: 'Root account', def: 'The account created when you first sign up for AWS. Has unrestricted access. Should be locked down and used only for tasks that require it.' },
        { term: 'IAM Role', def: 'A temporary identity that can be assumed by AWS services, users, or external identities. Does not have long-term credentials.' },
        { term: 'Least privilege', def: 'Granting only the minimum permissions required to perform a task — no more.' },
        { term: 'MFA', def: 'Multi-Factor Authentication — a second authentication factor beyond a password. Required for the root account; recommended for all IAM users.' },
        { term: 'IAM Identity Center', def: 'AWS\'s single sign-on service. Lets users access multiple AWS accounts with one set of credentials.' },
      ],
      awsServices: [
        { name: 'AWS IAM', purpose: 'Manages identities (users, groups, roles) and their permissions across all AWS services.' },
        { name: 'AWS IAM Identity Center', purpose: 'Single sign-on for AWS accounts and applications. Replaces creating individual IAM users for each person.' },
        { name: 'AWS Secrets Manager', purpose: 'Stores and rotates secrets (passwords, API keys, database credentials) so applications don\'t embed them in code.' },
      ],
      examTips: [
        '"Use root account" is almost always the wrong answer on the exam.',
        'EC2 needs to access AWS services → IAM role attached to the instance (never embed access keys in code).',
        '"500 users need AWS access" → IAM Identity Center or federated access, not 500 IAM users.',
        'IAM Group = manage permissions at scale. Attach policy to group, add users to group.',
        'MFA adds a second factor. Root MFA is mandatory best practice, not optional.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · Security & Compliance',
      domain: 'd2',
      weight: '30%',
      task: 'Task 2.4',
      title: 'AWS Security Services — GuardDuty, WAF, Shield, and More',
      duration: 30,
      summary: 'AWS provides a layered suite of security services. The exam presents a threat scenario and asks which service to use. This session maps each service to the threat it solves so you can answer those questions reliably.',
      objectives: [
        'Identify the purpose of GuardDuty, Inspector, Macie, WAF, Shield, and Security Hub',
        'Match a threat scenario to the correct AWS security service',
        'Understand where AWS Marketplace provides third-party security tools',
        'Locate AWS security information resources',
      ],
      preLearningCheck: {
        question: 'Before we start — which AWS service monitors your account for malicious activity and unauthorised behaviour using machine learning and threat intelligence?',
        options: [
          'AWS WAF',
          'Amazon Inspector',
          'Amazon GuardDuty',
          'AWS Shield',
        ],
        correct: 2,
        note: 'GuardDuty is one of the most frequently tested security services. Take a guess.',
      },
      sections: [
        {
          heading: 'The layered defence model',
          body: 'No single security control protects against all threats. A sophisticated attack might slip past a firewall, evade a network scanner, and then be caught by an anomaly detector. Security works in layers — each layer assumes the ones before it might fail.\n\nAWS provides specialised services for each layer of this defence. The exam tests whether you can match a threat to the right layer.',
        },
        {
          heading: 'Threat detection — finding attackers already inside',
          body: 'These services look for evidence that something suspicious is already happening in your account or workloads.',
          table: {
            headers: ['Service', 'What it detects', 'How it works'],
            rows: [
              ['Amazon GuardDuty', 'Malicious activity and unauthorised behaviour in your account', 'Continuously analyses CloudTrail, VPC Flow Logs, and DNS logs using ML and threat intelligence. Detects compromised credentials, crypto-mining, unusual API calls.'],
              ['Amazon Inspector', 'Software vulnerabilities and network exposure on EC2 and Lambda', 'Scans EC2 AMIs and Lambda functions for known CVEs and unintended network reachability. Produces a risk score per finding.'],
              ['Amazon Macie', 'Sensitive data (PII, credentials) in Amazon S3', 'Uses ML to discover and classify sensitive data such as credit card numbers, SSNs, and API keys stored in S3 buckets.'],
            ],
          },
          callout: { type: 'tip', text: 'Memory shortcut: GuardDuty = account-level threat intel. Inspector = software vulnerability scanner. Macie = sensitive data in S3. Each has a distinct scope.' },
        },
        {
          heading: 'Edge protection — stopping attacks before they reach your application',
          body: 'These services sit at the network and application edge, filtering malicious traffic before it touches your servers.',
          table: {
            headers: ['Service', 'What it blocks', 'Where it sits'],
            rows: [
              ['AWS WAF (Web Application Firewall)', 'Web application attacks: SQL injection, cross-site scripting (XSS), malicious bots, bad IPs', 'In front of CloudFront, ALB, API Gateway, or AppSync'],
              ['AWS Shield Standard', 'Layer 3/4 DDoS attacks (SYN floods, UDP reflection)', 'Automatically enabled for all AWS customers at no charge'],
              ['AWS Shield Advanced', 'Sophisticated DDoS attacks + cost protection + 24/7 DDoS response team access', 'Paid service — for high-traffic or DDoS-sensitive applications'],
              ['AWS Firewall Manager', 'Centrally manages WAF rules, Shield Advanced protections, and Security Groups across all accounts in an AWS Organization', 'Organisation-level governance layer'],
            ],
          },
        },
        {
          heading: 'Posture management — are we configured securely?',
          body: 'Beyond detecting attacks, these services evaluate whether your AWS environment is configured according to security best practices.',
          bullets: [
            'AWS Security Hub — aggregates security findings from GuardDuty, Inspector, Macie, and third-party tools into a single dashboard. Provides a security score against standards like CIS AWS Foundations Benchmark.',
            'AWS Trusted Advisor — provides automated checks against AWS best practices in five categories: cost optimisation, performance, security, fault tolerance, and service limits. The security checks flag open security groups, public S3 buckets, and missing MFA on root.',
          ],
          callout: { type: 'tip', text: 'Security Hub = aggregated view of all security findings. Trusted Advisor = broader best practice checks across five categories (not just security).' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A security team suspects that an IAM access key stored in a public GitHub repository has been used to perform unauthorised API calls. Which service would have already detected this activity and generated a finding?',
          options: [
            'Amazon Inspector — it scans EC2 instances for vulnerabilities',
            'Amazon Macie — it detects sensitive data in S3',
            'Amazon GuardDuty — it detects anomalous API activity using CloudTrail logs',
            'AWS Config — it records configuration changes to AWS resources',
          ],
          correct: 2,
          explainCorrect: 'Correct — GuardDuty analyses CloudTrail logs and uses threat intelligence to detect anomalous API behaviour such as calls from unusual locations, credential abuse, or crypto-mining activity.',
          elaborativePrompt: 'How would Amazon Macie actually be relevant to this scenario in a complementary (not competing) way? What would Macie detect that GuardDuty would not?',
        },
        {
          afterSection: 2,
          question: 'A company\'s web application hosted behind an Application Load Balancer is experiencing an attack that is injecting malicious SQL code into web form fields. Which AWS service should they enable to block this?',
          options: [
            'AWS Shield Standard — protects against volumetric DDoS attacks',
            'Amazon GuardDuty — detects malicious activity in AWS accounts',
            'AWS WAF — filters web application traffic including SQL injection',
            'Amazon Inspector — scans for software vulnerabilities on EC2 instances',
          ],
          correct: 2,
          explainCorrect: 'Correct — AWS WAF (Web Application Firewall) is specifically designed to filter application-layer attacks including SQL injection and XSS. It can be attached to an ALB to inspect and block malicious HTTP requests.',
          elaborativePrompt: 'Why would AWS Shield NOT solve the SQL injection problem, even though it also blocks attacks? What is the precise difference between a volumetric DDoS attack (what Shield handles) and an application-layer injection attack (what WAF handles)?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: without looking at notes, name the difference between GuardDuty and Inspector in one sentence each. If someone asks "which one scans for software vulnerabilities on EC2?" and "which one looks for suspicious API calls?" — can you answer those confidently?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company stores customer personal information including Social Security numbers and credit card details in multiple Amazon S3 buckets. They need to identify which buckets contain this sensitive data and ensure none of it is unintentionally exposed. Which AWS service is designed for this purpose?',
        options: [
          'Amazon GuardDuty — continuously monitors for malicious activity in the AWS account',
          'Amazon Macie — uses machine learning to discover and classify sensitive data in S3',
          'AWS Config — tracks changes to S3 bucket configurations over time',
          'Amazon Inspector — scans compute resources for software vulnerabilities',
        ],
        correct: 1,
        explanation: {
          summary: 'Amazon Macie is purpose-built to discover, classify, and protect sensitive data in S3. It uses ML to identify PII, financial data, and credentials stored in buckets.',
          perOption: [
            'GuardDuty monitors for threats like compromised credentials and anomalous API calls. It does not scan S3 bucket contents for sensitive data types.',
            'Correct — Macie scans S3 bucket contents, classifies data types (credit cards, SSNs, credentials), and alerts when sensitive data is found in buckets with public access or insufficient encryption.',
            'AWS Config tracks whether S3 bucket configurations (access policies, encryption settings) have changed. It does not scan the actual contents of the bucket for sensitive data.',
            'Amazon Inspector scans EC2 instances and Lambda functions for software vulnerabilities. It does not analyse S3 object contents.',
          ],
          link: 'Domain 2 · Task 2.4 — Security services · Amazon Macie',
        },
      },
      videos: [
        {
          videoId: 'ozpVMzRJkKs',
          title: 'AWS Security Services Overview',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Overview of the core AWS security service portfolio including GuardDuty, WAF, Shield, and Inspector.',
        },
      ],
      keyTerms: [
        { term: 'Amazon GuardDuty', def: 'Threat detection service that monitors AWS accounts for malicious activity using ML and threat intelligence feeds.' },
        { term: 'Amazon Inspector', def: 'Automated vulnerability management service that scans EC2 and Lambda for software vulnerabilities (CVEs).' },
        { term: 'Amazon Macie', def: 'Data security service that uses ML to discover and protect sensitive data (PII, credentials) stored in Amazon S3.' },
        { term: 'AWS WAF', def: 'Web Application Firewall that filters application-layer attacks (SQL injection, XSS) in front of CloudFront, ALB, or API Gateway.' },
        { term: 'AWS Shield', def: 'DDoS protection service. Standard is free for all customers. Advanced adds response team access and cost protection.' },
      ],
      awsServices: [
        { name: 'Amazon GuardDuty', purpose: 'Account-level threat detection using CloudTrail, VPC Flow Logs, and DNS logs.' },
        { name: 'Amazon Inspector', purpose: 'Vulnerability scanning for EC2 instances and Lambda functions.' },
        { name: 'Amazon Macie', purpose: 'Sensitive data discovery and classification in Amazon S3 buckets.' },
        { name: 'AWS WAF', purpose: 'Application-layer firewall blocking web exploits (SQL injection, XSS, bad bots).' },
        { name: 'AWS Shield', purpose: 'DDoS protection — Standard (free, automatic) and Advanced (paid, with response team).' },
        { name: 'AWS Security Hub', purpose: 'Centralised security findings dashboard aggregating GuardDuty, Inspector, Macie, and third-party tools.' },
      ],
      examTips: [
        'GuardDuty = account-level threat intel (compromised keys, crypto-mining, unusual API calls).',
        'Inspector = software CVE scanner on EC2/Lambda.',
        'Macie = sensitive data (PII/credit cards) discovery in S3.',
        'WAF = SQL injection, XSS, web application attacks. Shield = volumetric DDoS.',
        'Security Hub = aggregates findings from all security services into one place.',
        'Trusted Advisor = best practice checks across 5 categories (cost, performance, security, fault tolerance, limits).',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — CLOUD TECHNOLOGY AND SERVICES
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.1 + 3.2',
      title: 'Global Infrastructure and Deployment Methods',
      duration: 30,
      summary: 'Before you can use any AWS service, you need a mental map of where those services run and how you talk to them. This session covers AWS Regions, Availability Zones, edge locations, and the four ways to access and provision AWS.',
      objectives: [
        'Describe the relationship between AWS Regions, Availability Zones, and edge locations',
        'Explain when to use multiple AZs versus multiple Regions',
        'Identify the four methods for accessing and operating AWS (Console, CLI, SDK, IaC)',
        'Distinguish cloud, hybrid, and on-premises deployment models',
      ],
      preLearningCheck: {
        question: 'Before we start — what is the primary purpose of deploying an application across multiple Availability Zones?',
        options: [
          'To reduce latency for users in different countries',
          'To achieve high availability by eliminating single points of failure within a Region',
          'To comply with data residency regulations in different countries',
          'To reduce costs by distributing workloads across cheaper infrastructure',
        ],
        correct: 1,
        note: 'Multi-AZ vs. multi-Region is one of the most tested infrastructure concepts. Take a guess.',
      },
      sections: [
        {
          heading: 'The geography of AWS',
          body: 'AWS operates a global network of infrastructure. Understanding the three levels of that infrastructure — Regions, Availability Zones, and edge locations — lets you answer a large class of CLF-C02 questions about availability, latency, and data sovereignty.',
        },
        {
          heading: 'Regions, Availability Zones, and edge locations',
          body: 'These three levels nest inside each other from largest to smallest geographic scope.',
          table: {
            headers: ['Level', 'What it is', 'Example', 'Purpose'],
            rows: [
              ['Region', 'A geographic area with 3+ Availability Zones. Physically isolated from other Regions.', 'us-east-1 (N. Virginia), eu-west-1 (Ireland)', 'Data sovereignty, latency optimisation, geographic reach'],
              ['Availability Zone (AZ)', 'One or more discrete data centers within a Region, with independent power, cooling, and networking', 'us-east-1a, us-east-1b, us-east-1c', 'High availability — AZs do not share single points of failure'],
              ['Edge Location', 'A CloudFront or Route 53 endpoint closer to end users than a full AWS Region', 'Distributed in 400+ cities worldwide', 'Caching and DNS resolution with ultra-low latency'],
            ],
          },
        },
        {
          heading: 'Multiple AZs vs. multiple Regions — know the difference',
          body: 'These two patterns solve different problems. The exam will describe a scenario and ask which one applies.',
          table: {
            headers: ['Pattern', 'Solves', 'Exam signals'],
            rows: [
              ['Multiple Availability Zones', 'High availability within a Region — survives a single data center failure', '"Eliminate single point of failure" · "Continue if one AZ fails" · "High availability"'],
              ['Multiple Regions', 'Disaster recovery, data sovereignty, low latency for global users', '"Comply with data residency" · "Survive a regional disaster" · "Low latency for users in Europe and Asia"'],
            ],
          },
          callout: { type: 'tip', text: 'AZs share the same Region and same country — they do not solve data sovereignty. If a regulation requires data to stay in a specific country, you need the right Region, not just multiple AZs.' },
        },
        {
          heading: 'Accessing AWS — four methods',
          body: 'Every AWS action is an API call under the hood. You just choose which interface to issue those calls through.',
          table: {
            headers: ['Method', 'What it is', 'Best for'],
            rows: [
              ['AWS Management Console', 'Web-based GUI', 'Exploration, learning, one-off tasks, visualising resource relationships'],
              ['AWS CLI', 'Command-line tool for scripting API calls', 'Automation scripts, quick ad-hoc commands, CI/CD pipelines'],
              ['AWS SDKs', 'Language-specific libraries (Python/boto3, Java, Node.js, etc.)', 'Application code that needs to call AWS APIs programmatically'],
              ['Infrastructure as Code (IaC)', 'Declarative templates (CloudFormation, CDK, Terraform) that define infrastructure', 'Repeatable, version-controlled, auditable infrastructure provisioning'],
            ],
          },
        },
        {
          heading: 'Deployment models',
          body: 'Not every workload runs entirely in AWS. The exam tests whether you can match a company\'s situation to the right deployment model.',
          bullets: [
            'Cloud deployment — all components run in the cloud. Applications are built on cloud services or migrated fully from on-premises. No data center hardware.',
            'On-premises deployment (private cloud) — infrastructure runs in a local data center using virtualisation and management tools. AWS Outposts extends AWS services on-premises.',
            'Hybrid deployment — some components in the cloud, some on-premises. Connected via VPN or Direct Connect. Common during migration or for regulatory reasons.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company with customers in Europe wants to reduce latency for those users. Their application currently runs only in the us-east-1 Region. What should they do?',
          options: [
            'Deploy the application to multiple Availability Zones within us-east-1',
            'Enable CloudFront caching in us-east-1 edge locations',
            'Deploy the application to the eu-west-1 Region to bring it geographically closer to European users',
            'Increase the EC2 instance size to reduce response time',
          ],
          correct: 2,
          explainCorrect: 'Correct — reducing latency for geographically distant users requires deploying to a Region closer to them. Multiple AZs within a single Region all remain in the same geography and do not reduce transatlantic latency.',
          elaborativePrompt: 'When would a CloudFront edge location (the other reasonable option) be sufficient, and when would it NOT be enough? Think about the types of content and workloads where caching at the edge solves the problem vs. those where full compute proximity is needed.',
        },
        {
          afterSection: 3,
          question: 'A DevOps team wants to provision the same infrastructure environment (VPC, EC2 instances, RDS database) repeatedly for different clients. Each environment must be identical. Which access method is most appropriate?',
          options: [
            'AWS Management Console — visually configure each environment step by step',
            'AWS CLI — run a long sequence of commands for each deployment',
            'Infrastructure as Code — use AWS CloudFormation templates to define and reproduce the environment',
            'AWS SDKs — write a Python script that calls EC2, RDS, and VPC APIs for each client',
          ],
          correct: 2,
          explainCorrect: 'Correct — IaC (CloudFormation) is specifically designed for repeatable, consistent infrastructure deployments. A template defines the desired state; each deployment creates an identical environment.',
          elaborativePrompt: 'Why would the CLI or SDK approach — while technically capable of the same result — be harder to maintain over time? Think about what happens when a requirement changes and you need to update 30 client environments.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the difference between deploying across multiple AZs and deploying across multiple Regions in terms of the problem each solves. Name a specific scenario where AZs are sufficient and a different scenario where you would definitely need multiple Regions.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company operates a critical e-commerce platform in a single AWS Region. A recent failure of one Availability Zone caused the application to become unavailable for 45 minutes. What architectural change would prevent a similar outage?',
        options: [
          'Deploy the application to a second AWS Region for geographic redundancy',
          'Deploy the application across multiple Availability Zones within the same Region using an Elastic Load Balancer',
          'Increase the size of EC2 instances to handle more requests during a failure',
          'Enable AWS CloudFront caching to serve requests from edge locations during an AZ failure',
        ],
        correct: 1,
        explanation: {
          summary: 'The failure was a single AZ outage within a Region. Multi-AZ deployment within the same Region is the correct solution — if one AZ fails, the load balancer routes traffic to instances in healthy AZs.',
          perOption: [
            'Multi-Region deployment addresses regional disasters or data sovereignty, not single AZ failures. It is architecturally heavier and more expensive than needed for this problem.',
            'Correct — deploying across multiple AZs with an ELB ensures that an AZ failure does not take the application offline. Traffic is automatically routed to healthy AZs.',
            'Larger instances do not survive an AZ failure. A compute failure means all instances in that AZ become unavailable regardless of size.',
            'CloudFront caches static content at edge locations. It cannot serve a dynamic e-commerce application during a compute failure in an AZ.',
          ],
          link: 'Domain 3 · Task 3.2 — AWS global infrastructure · Availability Zones',
        },
      },
      videos: [
        {
          videoId: '3XFODda6YXo',
          title: 'AWS Global Infrastructure Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Visual walkthrough of Regions, AZs, and edge locations with the AWS global infrastructure map.',
        },
      ],
      keyTerms: [
        { term: 'AWS Region', def: 'A geographically isolated area containing 3+ Availability Zones. You choose a Region based on latency, data residency, and service availability.' },
        { term: 'Availability Zone', def: 'One or more discrete data centers within a Region with independent power, cooling, and networking. Multiple AZs enable high availability.' },
        { term: 'Edge Location', def: 'A CloudFront or Route 53 endpoint distributed globally for low-latency content delivery and DNS resolution.' },
        { term: 'Infrastructure as Code', def: 'Defining cloud infrastructure in declarative templates (CloudFormation, CDK) for repeatable, version-controlled provisioning.' },
        { term: 'Hybrid deployment', def: 'A deployment model where some workloads run in the cloud and others run on-premises, connected via VPN or Direct Connect.' },
      ],
      awsServices: [
        { name: 'Amazon CloudFront', purpose: 'Content delivery network (CDN) — caches and serves content from edge locations closest to users.' },
        { name: 'AWS CloudFormation', purpose: 'IaC service — define AWS infrastructure in JSON/YAML templates for repeatable, consistent deployments.' },
      ],
      examTips: [
        'Multiple AZs = high availability within a Region. Multiple Regions = DR, data sovereignty, or global latency.',
        'Edge locations ≠ Availability Zones. Edge locations serve cached content (CloudFront) — they do not run full compute workloads.',
        '"Repeatable / version-controlled infrastructure" → IaC (CloudFormation).',
        '"Hybrid cloud" = some in cloud + some on-premises. Often connected with AWS VPN or Direct Connect.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.3',
      title: 'Compute Services — EC2, Lambda, Containers, and Auto Scaling',
      duration: 30,
      summary: 'Compute is the heart of Domain 3. The exam will describe a workload and ask which compute service fits. Master the key distinctions — managed vs. unmanaged, serverless vs. server-based, containers vs. VMs — and these questions become straightforward.',
      objectives: [
        'Identify appropriate use cases for Amazon EC2 instance types',
        'Distinguish between serverless options (AWS Lambda, Fargate) and server-based options (EC2)',
        'Recognise when to use containers (ECS, EKS) vs. virtual machines',
        'Explain how Auto Scaling and Elastic Load Balancing provide elasticity and high availability',
      ],
      preLearningCheck: {
        question: 'Before we start — which compute option should you use when you want to run code in response to events without managing any servers?',
        options: [
          'Amazon EC2 with Auto Scaling',
          'Amazon ECS on EC2',
          'AWS Lambda',
          'Amazon EC2 Spot Instances',
        ],
        correct: 2,
        note: 'Lambda is the canonical "serverless" answer. Take a guess.',
      },
      sections: [
        {
          heading: 'The compute spectrum',
          body: 'AWS offers compute across a spectrum from "you manage everything" to "you just provide code." The right choice depends on how much control you need versus how much operational overhead you\'re willing to accept.',
        },
        {
          heading: 'Amazon EC2 — when you need the full machine',
          body: 'EC2 provides virtual machines (instances) in the cloud. You choose the OS, install software, and have full root/admin access. It is the closest thing to running your own server — without the hardware.',
          bullets: [
            'Full control — choose OS, install any software, configure the network stack, access root.',
            'Many instance families, each optimised for a different workload type.',
            'You pay for the time the instance is running, regardless of whether it is doing useful work.',
            'You are responsible for the OS, patching, and everything above the hypervisor.',
          ],
          table: {
            headers: ['Instance family', 'Optimised for', 'Example use case'],
            rows: [
              ['General purpose (t3, m5)', 'Balanced CPU/memory/network', 'Web servers, small databases, dev/test environments'],
              ['Compute optimised (c5)', 'High CPU performance', 'Scientific modelling, video encoding, high-traffic web'],
              ['Memory optimised (r5)', 'Large in-memory datasets', 'In-memory databases (Redis), big data analytics, SAP HANA'],
              ['Storage optimised (i3)', 'High sequential read/write IOPS', 'Data warehousing, Elasticsearch, Cassandra clusters'],
              ['Accelerated computing (p4, g4)', 'GPU for ML training or graphics', 'Deep learning training, video transcoding, 3D rendering'],
            ],
          },
        },
        {
          heading: 'Containers — ECS and EKS',
          body: 'Containers package an application and its dependencies into a portable unit that runs identically across environments. AWS offers two managed container orchestration services.',
          bullets: [
            'Amazon ECS (Elastic Container Service) — AWS\'s own container orchestration platform. Simpler to operate than Kubernetes; integrates natively with IAM, ALB, and CloudWatch. Run containers on EC2 instances you manage, or on serverless Fargate.',
            'Amazon EKS (Elastic Kubernetes Service) — managed Kubernetes. AWS handles the control plane; you use standard Kubernetes tools. Choose EKS when your team already uses Kubernetes or needs Kubernetes-specific ecosystem tools.',
          ],
          callout: { type: 'tip', text: 'Exam shortcut: ECS = simpler, AWS-native. EKS = standard Kubernetes. Both can run on EC2 or Fargate. "Already uses Kubernetes" → EKS.' },
        },
        {
          heading: 'Serverless compute — Lambda and Fargate',
          body: 'Serverless means you do not manage servers, OS, or infrastructure. You provide code (Lambda) or container images (Fargate); AWS handles everything else.',
          table: {
            headers: ['Service', 'What you provide', 'Billing', 'Best for'],
            rows: [
              ['AWS Lambda', 'A function (code + runtime)', 'Per invocation + duration (milliseconds)', 'Event-driven tasks, short-lived jobs, APIs — anything that runs for under 15 minutes'],
              ['AWS Fargate', 'A container image', 'Per vCPU + memory per second', 'Containerised workloads without managing EC2 instances — longer-running than Lambda'],
              ['Amazon EC2', 'OS + everything above', 'Per hour/second while running', 'Full control workloads, legacy apps, anything requiring persistent processes or OS access'],
            ],
          },
        },
        {
          heading: 'Auto Scaling and Load Balancing',
          body: 'Individual compute resources fail and traffic fluctuates. These two services work together to keep applications available and performant.',
          bullets: [
            'Auto Scaling — automatically adjusts the number of EC2 instances (or ECS tasks, or Lambda concurrency) based on demand. Scale out when traffic increases; scale in when it drops. Saves cost and handles spikes without manual intervention.',
            'Elastic Load Balancer (ELB) — distributes incoming traffic across multiple instances/targets in multiple AZs. Three types: Application Load Balancer (HTTP/HTTPS, path-based routing), Network Load Balancer (TCP/UDP, ultra-low latency), Gateway Load Balancer (third-party virtual appliances).',
          ],
          callout: { type: 'tip', text: 'ELB + Auto Scaling = the standard high-availability pattern. ELB sends traffic only to healthy instances; Auto Scaling adds/removes instances automatically.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company is running a machine learning training job that requires 64 GPU cores and takes approximately 6 hours to complete. Which EC2 instance family should they use?',
          options: [
            'General purpose (m5) — balanced CPU/memory for most workloads',
            'Compute optimised (c5) — high CPU performance for compute-intensive tasks',
            'Accelerated computing (p4) — GPU instances for ML training',
            'Memory optimised (r5) — large in-memory datasets for analytics',
          ],
          correct: 2,
          explainCorrect: 'Correct — ML training is a GPU workload. Accelerated computing instances (p-series, g-series) provide GPUs specifically for machine learning training and inference.',
          elaborativePrompt: 'Why would a compute-optimised (c5) instance, which also excels at intensive computations, be the wrong choice for ML training specifically? What is the key hardware difference that makes GPU instances necessary?',
        },
        {
          afterSection: 3,
          question: 'A developer wants to run a function that processes incoming S3 upload events. Each execution takes about 3 seconds. There may be 0 events or 10,000 events per hour depending on user activity. Which compute service minimises cost and operational overhead?',
          options: [
            'An EC2 instance running a polling process that checks S3 every minute',
            'An ECS cluster with a container that processes uploads continuously',
            'AWS Lambda triggered by S3 event notifications',
            'An EC2 Auto Scaling group that scales based on S3 event queue depth',
          ],
          correct: 2,
          explainCorrect: 'Correct — Lambda is billed per invocation and per 100ms of execution. For spiky, event-driven, short-duration workloads, Lambda is almost always cheaper and operationally simpler than running instances that idle during quiet periods.',
          elaborativePrompt: 'What would the cost comparison look like at 0 events/hour vs. 10,000 events/hour for Lambda vs. a constantly-running EC2 instance? Think about what drives cost in each model.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain to yourself the key question to ask when choosing between EC2, Lambda, and Fargate. When does "no server management" matter more than "full control" — and what workload characteristics make Lambda the wrong choice?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a web application that experiences unpredictable traffic spikes — sometimes 10× the normal load for a few hours, then back to baseline. The team wants the application to remain available during spikes without paying for excess capacity during normal periods. Which combination of services best achieves this?',
        options: [
          'A single large EC2 instance with reserved capacity to handle peak load',
          'Multiple EC2 instances behind an Elastic Load Balancer with Auto Scaling',
          'AWS Lambda with a reserved concurrency limit of 10 concurrent executions',
          'An EC2 Spot Instance fleet that automatically bids for cheap capacity',
        ],
        correct: 1,
        explanation: {
          summary: 'ELB distributes traffic across multiple EC2 instances; Auto Scaling adds instances during spikes and removes them during quiet periods. This is the canonical elastic web application architecture on AWS.',
          perOption: [
            'A single large instance sized for peak load pays for full capacity 24/7 — even at baseline traffic. No elasticity and a single point of failure.',
            'Correct — ELB + Auto Scaling is the standard pattern for elastic, available web applications. Auto Scaling adjusts capacity to demand; ELB sends traffic only to healthy instances.',
            'Lambda with a concurrency limit of 10 would throttle requests above 10 concurrent users. Lambda concurrency limits should be raised, not lowered, for handling spikes.',
            'Spot Instances can be interrupted with 2 minutes notice, which is unsuitable for a production web application that needs consistent availability.',
          ],
          link: 'Domain 3 · Task 3.3 — Compute services · Auto Scaling and ELB',
        },
      },
      videos: [
        {
          videoId: 'TsRBftzZsQo',
          title: 'AWS EC2 Instance Types Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Walks through EC2 instance families and how to choose the right one for a workload.',
        },
      ],
      keyTerms: [
        { term: 'Amazon EC2', def: 'Virtual machines in the cloud. Full OS control; customer manages OS and above. Billed per second while running.' },
        { term: 'AWS Lambda', def: 'Serverless function execution. Event-driven, billed per invocation + duration. AWS manages all infrastructure.' },
        { term: 'AWS Fargate', def: 'Serverless container execution for ECS and EKS. No EC2 instances to manage; billed per vCPU and memory consumed.' },
        { term: 'Auto Scaling', def: 'Automatically adjusts the number of compute resources (EC2, ECS tasks) in response to demand metrics.' },
        { term: 'Elastic Load Balancer', def: 'Distributes incoming traffic across multiple compute targets in multiple AZs for high availability.' },
      ],
      awsServices: [
        { name: 'Amazon EC2', purpose: 'Virtual machines with full OS control. Choose instance type, OS, software.' },
        { name: 'AWS Lambda', purpose: 'Run code without managing servers. Event-driven, scales automatically, billed per invocation.' },
        { name: 'Amazon ECS', purpose: 'AWS container orchestration. Run Docker containers on EC2 or Fargate.' },
        { name: 'Amazon EKS', purpose: 'Managed Kubernetes for teams using standard Kubernetes tooling.' },
        { name: 'AWS Fargate', purpose: 'Serverless compute engine for containers. No EC2 management required.' },
      ],
      examTips: [
        '"Event-driven / no server management / short execution" → Lambda.',
        '"Full OS control / legacy app / custom software" → EC2.',
        '"Already using Kubernetes" → EKS. "AWS-native containers" → ECS.',
        '"Automatically scale and distribute traffic" → Auto Scaling + ELB.',
        'Spot Instances are for fault-tolerant workloads (batch jobs, not production web apps).',
        'GPU workloads (ML training, video encoding) → accelerated computing instances (p-, g-series).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.5',
      title: 'Networking — VPC, Security Groups, Route 53, and Connectivity',
      duration: 30,
      summary: 'Networking underpins everything in AWS. This session covers the VPC as your private cloud network, how traffic is controlled with security groups and NACLs, DNS with Route 53, and how you connect from on-premises to AWS.',
      objectives: [
        'Describe the key components of an Amazon VPC (subnets, internet gateway, route tables)',
        'Distinguish security groups from network ACLs',
        'Explain the purpose of Amazon Route 53',
        'Identify connectivity options: AWS VPN vs. AWS Direct Connect',
      ],
      preLearningCheck: {
        question: 'Before we start — what is the difference between a security group and a network ACL in an Amazon VPC?',
        options: [
          'Security groups operate at the VPC level; network ACLs operate at the instance level',
          'Security groups are stateful and operate at the instance level; network ACLs are stateless and operate at the subnet level',
          'They are the same thing — AWS renamed network ACLs to security groups',
          'Security groups block traffic by default; network ACLs allow all traffic by default',
        ],
        correct: 1,
        note: 'Security groups vs. NACLs is a classic exam topic. Take a guess.',
      },
      sections: [
        {
          heading: 'Your private cloud network',
          body: 'When you launch AWS resources, they run inside a Virtual Private Cloud (VPC) — a logically isolated section of the AWS cloud that you define and control. Think of it as your own private data center network, running on AWS infrastructure.\n\nEvery AWS account comes with a default VPC in each Region. You can create additional VPCs with custom IP ranges, subnets, and routing configurations.',
        },
        {
          heading: 'VPC components',
          body: 'A VPC has several building blocks that work together to route, isolate, and protect your resources.',
          bullets: [
            'Subnet — a range of IP addresses within a VPC. Public subnets route to the internet; private subnets do not. EC2 instances, RDS databases, and Lambda functions live in subnets.',
            'Internet Gateway (IGW) — attached to a VPC to enable communication between resources in public subnets and the internet.',
            'NAT Gateway — allows resources in private subnets to initiate outbound connections to the internet (e.g. software updates) without being directly reachable from the internet.',
            'Route table — rules that determine where network traffic is directed. Each subnet is associated with a route table.',
          ],
        },
        {
          heading: 'Security groups vs. Network ACLs — know the difference',
          body: 'Both control traffic, but they operate at different levels and have different behaviours. This comparison is one of the most-tested networking topics on the exam.',
          table: {
            headers: ['Feature', 'Security Group', 'Network ACL (NACL)'],
            rows: [
              ['Level', 'Instance level (attached to EC2/RDS/Lambda)', 'Subnet level (applied to all resources in the subnet)'],
              ['State', 'Stateful — return traffic automatically allowed', 'Stateless — must explicitly allow both inbound AND outbound'],
              ['Rules', 'Allow rules only (no explicit deny)', 'Allow AND deny rules'],
              ['Default behaviour', 'Deny all inbound; allow all outbound', 'Allow all traffic (default NACL) / deny all (custom NACL)'],
            ],
          },
          callout: { type: 'tip', text: 'Stateful vs. stateless is the key: if a security group allows inbound HTTP, the reply automatically goes out. For a NACL, you must explicitly allow both the inbound request AND the outbound reply.' },
        },
        {
          heading: 'Amazon Route 53 — DNS and routing',
          body: 'Route 53 is AWS\'s scalable DNS service. It translates domain names (example.com) into IP addresses and routes end-user requests to the right AWS resource.',
          bullets: [
            'Domain registration — you can purchase and manage domain names directly in Route 53.',
            'DNS resolution — authoritative DNS for your domains; extremely low latency and high availability (the "53" refers to port 53, the DNS port).',
            'Health checks — Route 53 monitors endpoint health and stops routing traffic to unhealthy endpoints.',
            'Routing policies — beyond simple DNS lookup, Route 53 can route traffic based on latency (to the nearest Region), geography, weighted distribution (A/B testing), or failover.',
          ],
        },
        {
          heading: 'Connecting on-premises to AWS',
          body: 'Most companies run hybrid environments — some workloads on-premises, some in AWS. Two main options connect them.',
          table: {
            headers: ['Option', 'How it works', 'Bandwidth', 'Use case'],
            rows: [
              ['AWS VPN', 'Encrypted tunnel over the public internet (IPsec)', 'Up to ~1.25 Gbps, shared internet', 'Quick, cost-effective connectivity for moderate data volumes; traffic still traverses the internet'],
              ['AWS Direct Connect', 'Dedicated private physical connection from on-premises to AWS (bypasses the internet)', '1 Gbps, 10 Gbps, or 100 Gbps dedicated', 'Consistent high throughput, low latency, compliance requirements — data never touches the public internet'],
            ],
          },
          callout: { type: 'tip', text: '"Consistent network performance / never traverses the internet / dedicated connection" → Direct Connect. "Quick and cheap connectivity" or "encrypted tunnel" → AWS VPN.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company allows inbound HTTP (port 80) traffic to their EC2 instance via a security group. An application running on the instance makes an HTTP request to an external API and does not receive a response. The network ACL on the subnet allows all inbound traffic. Which configuration is most likely the problem?',
          options: [
            'The security group is missing an outbound rule for HTTP',
            'The network ACL is missing outbound rules for the response traffic',
            'The internet gateway is not attached to the VPC',
            'The security group is missing an inbound rule for return traffic',
          ],
          correct: 1,
          explainCorrect: 'Correct — NACLs are stateless. The NACL must explicitly allow both the outbound request (the instance calling the external API) AND the inbound response. If no explicit outbound rule exists, the request is blocked. Security groups are stateful and would not have this problem.',
          elaborativePrompt: 'Why do security groups not have this problem? What does "stateful" actually mean in terms of how the security group tracks individual connections — and why does that eliminate the need for explicit return traffic rules?',
        },
        {
          afterSection: 4,
          question: 'A company needs a dedicated, private network connection from their on-premises data center to AWS. They require consistent 10 Gbps bandwidth that never traverses the public internet, due to compliance requirements. Which service meets these requirements?',
          options: [
            'AWS VPN — an encrypted tunnel over the internet',
            'AWS Direct Connect — a dedicated private physical connection',
            'Amazon CloudFront — a CDN for low-latency content delivery',
            'AWS Transit Gateway — a network hub for connecting VPCs',
          ],
          correct: 1,
          explainCorrect: 'Correct — Direct Connect provides a dedicated physical connection that bypasses the public internet, offering consistent high bandwidth and satisfying compliance requirements for private connectivity.',
          elaborativePrompt: 'What trade-offs would the company accept by choosing Direct Connect over VPN — not just benefits but also the costs and constraints? Think about setup time, physical infrastructure requirements, and cost structure.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the "stateful vs. stateless" distinction between security groups and NACLs in your own words. Use a specific example — a web browser request and the server\'s response — to illustrate what each term means in practice.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants to allow inbound HTTPS traffic (port 443) to an EC2 web server from any IP address, but block all other inbound traffic. Which resource in a VPC should they configure to enforce this at the instance level?',
        options: [
          'A route table with a rule allowing port 443 traffic',
          'A network ACL with a deny rule for all ports except 443',
          'A security group with an inbound rule allowing port 443 from 0.0.0.0/0',
          'An internet gateway policy restricting inbound traffic to port 443',
        ],
        correct: 2,
        explanation: {
          summary: 'Security groups operate at the instance level and control inbound/outbound traffic. A security group rule allowing port 443 from 0.0.0.0/0 allows HTTPS from any IP; all other inbound traffic is denied by default.',
          perOption: [
            'Route tables control where traffic is routed (which gateway or subnet), not whether traffic is allowed or blocked on specific ports.',
            'A NACL operates at the subnet level, not the instance level. Also, NACLs are stateless, so deny rules are more complex to manage correctly.',
            'Correct — security groups are instance-level firewalls. They deny all inbound by default; adding a rule for port 443 from 0.0.0.0/0 allows HTTPS while blocking everything else.',
            'Internet gateways do not have traffic policies — they simply enable internet connectivity for a VPC. Port filtering is done by security groups and NACLs.',
          ],
          link: 'Domain 3 · Task 3.5 — Networking · Security groups',
        },
      },
      videos: [
        {
          videoId: 'fpxDGU2KdkA',
          title: 'AWS VPC Explained',
          channel: 'TechWorld with Nana',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Visual walkthrough of VPC concepts including subnets, security groups, NACLs, and internet gateways.',
        },
      ],
      keyTerms: [
        { term: 'VPC', def: 'Virtual Private Cloud — a logically isolated network you define in AWS. All resources run inside a VPC.' },
        { term: 'Security group', def: 'Stateful, instance-level virtual firewall. Allows traffic; cannot explicitly deny. Return traffic is automatically allowed.' },
        { term: 'Network ACL', def: 'Stateless, subnet-level firewall. Supports both allow and deny rules. Both inbound and outbound must be explicitly allowed.' },
        { term: 'AWS Direct Connect', def: 'A dedicated private physical network connection from on-premises to AWS, bypassing the public internet.' },
        { term: 'Amazon Route 53', def: 'AWS\'s scalable DNS service for domain registration, routing, and health checks.' },
      ],
      awsServices: [
        { name: 'Amazon VPC', purpose: 'Isolated virtual network for AWS resources with customisable IP ranges, subnets, and routing.' },
        { name: 'Amazon Route 53', purpose: 'DNS service, domain registration, and traffic routing with health checks.' },
        { name: 'AWS Direct Connect', purpose: 'Dedicated private network connection from on-premises to AWS.' },
        { name: 'AWS VPN', purpose: 'Encrypted IPsec tunnel over the internet connecting on-premises to AWS VPC.' },
      ],
      examTips: [
        'Security group = stateful, instance level, allow only. NACL = stateless, subnet level, allow + deny.',
        '"Consistent bandwidth / private / no internet" → Direct Connect. "Quick encrypted tunnel" → VPN.',
        'Route 53 does DNS resolution AND routing policies (latency, geo, failover, weighted).',
        'Public subnet = has route to internet gateway. Private subnet = no direct internet route.',
        'NAT Gateway allows private subnet resources to reach the internet outbound without being reachable inbound.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s12',
      number: 12,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.4',
      title: 'Database Services — RDS, Aurora, DynamoDB, and ElastiCache',
      duration: 30,
      summary: 'AWS offers purpose-built databases for different data models. The exam asks you to select the right database for a given scenario — relational vs. NoSQL vs. in-memory. The choices are precise and the distractors are plausible: learn the key differentiators.',
      objectives: [
        'Distinguish relational databases (RDS, Aurora) from NoSQL databases (DynamoDB)',
        'Identify when to use in-memory caching (ElastiCache)',
        'Compare EC2-hosted databases with AWS managed database services',
        'Identify database migration tools: AWS DMS and AWS SCT',
      ],
      preLearningCheck: {
        question: 'Before we start — which AWS database service is a fully managed NoSQL key-value and document database?',
        options: [
          'Amazon RDS',
          'Amazon Aurora',
          'Amazon ElastiCache',
          'Amazon DynamoDB',
        ],
        correct: 3,
        note: 'DynamoDB is the most-tested NoSQL database on the exam. Take a guess.',
      },
      sections: [
        {
          heading: 'The relational vs. NoSQL decision',
          body: 'Picking the right database is one of the most consequential architecture decisions. Use the wrong type and you will fight the database for the lifetime of the application.\n\nRelational databases store data in tables with rows and columns, enforce relationships between tables, and use SQL. They excel at complex queries involving multiple tables but require a fixed schema.\n\nNoSQL databases trade rigid schema and complex joins for horizontal scalability and flexible data models. They can handle millions of requests per second at any scale — something traditional relational databases struggle with.',
        },
        {
          heading: 'Amazon RDS and Amazon Aurora',
          body: 'Amazon RDS (Relational Database Service) is a managed service that runs popular relational database engines without the operational burden of running them on EC2.',
          bullets: [
            'Engines supported: MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server, and Amazon Aurora.',
            'AWS manages: OS patching, database engine upgrades, backups, and Multi-AZ failover. You manage: schema design, queries, and connection strings.',
            'Multi-AZ deployment — a standby replica in a second AZ automatically takes over if the primary fails.',
          ],
          table: {
            headers: ['Service', 'What it is', 'Key advantage'],
            rows: [
              ['Amazon RDS', 'Managed versions of common open-source and commercial DB engines', 'Drop-in replacement for existing databases; lift-and-shift friendly'],
              ['Amazon Aurora', 'AWS\'s own cloud-native relational DB (MySQL and PostgreSQL compatible)', 'Up to 5× faster than standard MySQL, 3× faster than PostgreSQL; automatically scales storage; Aurora Serverless scales compute'],
            ],
          },
        },
        {
          heading: 'Amazon DynamoDB — serverless NoSQL',
          body: 'DynamoDB is AWS\'s fully managed, serverless NoSQL database. It delivers consistent single-digit millisecond latency at any scale — from zero to millions of requests per second.',
          bullets: [
            'Key-value and document data model — data is stored as items (rows) with attributes (fields). No fixed schema.',
            'Fully serverless — no clusters to provision, no capacity to guess (with on-demand mode). AWS manages everything.',
            'Single-digit millisecond latency — consistent performance regardless of table size.',
            'DynamoDB Accelerator (DAX) — an in-memory cache layer purpose-built for DynamoDB that reduces read latency to microseconds.',
          ],
          callout: { type: 'tip', text: 'Exam signal for DynamoDB: "highly scalable" + "any scale" + "key-value or document" + "serverless" + "single-digit millisecond latency" → DynamoDB.' },
        },
        {
          heading: 'Amazon ElastiCache — in-memory caching',
          body: 'Some data is read far more often than it changes. Fetching the same product catalogue from a database on every page load wastes compute and adds latency. ElastiCache stores frequently-accessed data in memory so the application can read it in microseconds instead of milliseconds.',
          bullets: [
            'ElastiCache for Redis — supports complex data structures, persistence, pub/sub, geospatial queries. More features.',
            'ElastiCache for Memcached — simpler, multi-threaded, focused on pure caching. Less overhead.',
          ],
          callout: { type: 'tip', text: '"Reduce database read load" or "sub-millisecond latency for frequently accessed data" → ElastiCache.' },
        },
        {
          heading: 'Managed databases vs. databases on EC2',
          body: 'You can run any database on EC2 — but why would you, when AWS offers managed alternatives?',
          table: {
            headers: ['Aspect', 'Database on EC2', 'AWS Managed (RDS/Aurora)'],
            rows: [
              ['OS/DB patching', 'Your responsibility', 'AWS manages'],
              ['Backups', 'Your responsibility', 'Automated, point-in-time recovery'],
              ['High availability', 'Manual setup — you configure replication', 'Multi-AZ failover in a few clicks'],
              ['Scaling', 'Manual instance resize', 'Storage auto-scales (Aurora); vertical scaling with downtime (RDS)'],
              ['When to choose', 'Need a DB engine AWS doesn\'t offer, or full root DB access', 'All other cases — lower operational burden'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A startup is building a mobile gaming leaderboard that must handle millions of players updating their scores simultaneously. It requires consistent single-digit millisecond read/write latency. Which database service best fits this use case?',
          options: [
            'Amazon RDS for MySQL — reliable relational database for high-traffic applications',
            'Amazon DynamoDB — serverless NoSQL with consistent millisecond latency at any scale',
            'Amazon Aurora — cloud-native relational database with 5× MySQL performance',
            'Amazon ElastiCache — in-memory caching for sub-millisecond reads',
          ],
          correct: 1,
          explainCorrect: 'Correct — DynamoDB is purpose-built for this: high-throughput, low-latency workloads with simple key-value access patterns. Millions of concurrent writes are handled natively.',
          elaborativePrompt: 'Why would Aurora, despite being faster than standard MySQL, still be the wrong choice here? What does "5× faster than MySQL" not address that DynamoDB handles natively?',
        },
        {
          afterSection: 3,
          question: 'A company\'s e-commerce application is experiencing slow page loads because the product database is being queried thousands of times per second for the same 500 popular products. The database CPU is at 90%. What is the most effective solution?',
          options: [
            'Upgrade to a larger RDS instance type to handle more queries',
            'Add a read replica to distribute query load across multiple database instances',
            'Implement Amazon ElastiCache to cache the product data in memory',
            'Move the product data to Amazon DynamoDB for faster key-value lookups',
          ],
          correct: 2,
          explainCorrect: 'Correct — the same 500 products are read repeatedly. This is exactly what caching solves: ElastiCache stores the results in memory so the database is queried once, not thousands of times per second.',
          elaborativePrompt: 'Why would a read replica reduce but not eliminate the database CPU problem? What does a read replica do that caching does not — and what does caching do that a read replica cannot?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain when you would choose DynamoDB over RDS for a new application. Name two specific characteristics of the use case that would make DynamoDB the better fit — and one scenario where RDS would be necessary despite those characteristics.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants to migrate its on-premises Oracle database to Amazon Aurora PostgreSQL. The database schema requires conversion from Oracle syntax to PostgreSQL. Which combination of AWS services should the company use?',
        options: [
          'AWS DataSync to transfer data, and AWS Backup to convert the schema',
          'AWS Schema Conversion Tool (SCT) to convert the schema, and AWS Database Migration Service (DMS) to migrate the data',
          'AWS Snowball to transfer the database files, and AWS Glue to transform the schema',
          'Amazon RDS Import/Export to handle both schema conversion and data migration',
        ],
        correct: 1,
        explanation: {
          summary: 'Cross-engine database migration has two parts: schema conversion (Oracle → PostgreSQL syntax) and data migration. AWS SCT handles the schema; AWS DMS handles the ongoing data replication during cutover.',
          perOption: [
            'DataSync moves files between storage systems, not databases. AWS Backup is for backup and restore — neither converts database schemas.',
            'Correct — SCT converts schema from one engine to another (Oracle → PostgreSQL); DMS migrates the actual data and can run continuously during the cutover period to minimise downtime.',
            'Snowball is for large-scale offline data transfer to S3, not database migration. AWS Glue is an ETL service, not a database migration tool.',
            'There is no "RDS Import/Export" service that performs schema conversion. RDS supports native database import tools but not cross-engine schema conversion.',
          ],
          link: 'Domain 3 · Task 3.4 — Database services · Migration tools',
        },
      },
      videos: [
        {
          videoId: 'RqD4nMyBazU',
          title: 'AWS Database Services Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Overview of RDS, Aurora, DynamoDB, and ElastiCache with use case guidance.',
        },
      ],
      keyTerms: [
        { term: 'Amazon RDS', def: 'Managed relational database service supporting MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora.' },
        { term: 'Amazon Aurora', def: 'AWS cloud-native relational DB (MySQL/PostgreSQL compatible). Up to 5× faster than MySQL; storage auto-scales.' },
        { term: 'Amazon DynamoDB', def: 'Fully managed serverless NoSQL database. Key-value and document model; single-digit millisecond latency at any scale.' },
        { term: 'Amazon ElastiCache', def: 'In-memory caching service (Redis or Memcached) for sub-millisecond access to frequently-read data.' },
        { term: 'AWS DMS', def: 'Database Migration Service — migrates data between database engines with minimal downtime.' },
      ],
      awsServices: [
        { name: 'Amazon RDS', purpose: 'Managed relational databases. AWS handles patching, backups, and Multi-AZ failover.' },
        { name: 'Amazon Aurora', purpose: 'High-performance cloud-native relational database compatible with MySQL and PostgreSQL.' },
        { name: 'Amazon DynamoDB', purpose: 'Serverless NoSQL database for high-throughput, low-latency workloads at any scale.' },
        { name: 'Amazon ElastiCache', purpose: 'In-memory caching layer for reducing database load and achieving sub-millisecond read latency.' },
        { name: 'AWS DMS', purpose: 'Migrates databases to AWS with minimal downtime; supports same-engine and cross-engine migrations.' },
        { name: 'AWS SCT', purpose: 'Converts database schema and code from one engine to another (e.g. Oracle to PostgreSQL).' },
      ],
      examTips: [
        '"Key-value / highly scalable / serverless / millisecond latency" → DynamoDB.',
        '"Reduce database read load / cache frequently accessed data" → ElastiCache.',
        '"Drop-in replacement for MySQL/PostgreSQL" → RDS or Aurora.',
        '"Cross-engine migration" = SCT (schema) + DMS (data).',
        'Multi-AZ RDS = high availability. Read Replica = read scaling (not HA).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s13',
      number: 13,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.6',
      title: 'Storage Services — S3, EBS, EFS, and AWS Backup',
      duration: 30,
      summary: 'Storage is one of the most-tested service categories in Domain 3. Three storage types — object, block, and file — serve fundamentally different use cases. The exam gives you a scenario and asks which type (and which service) fits. Master the distinctions and this becomes a reliable source of correct answers.',
      objectives: [
        'Distinguish object, block, and file storage and match each to the right AWS service',
        'Identify Amazon S3 storage classes and when to use each',
        'Explain lifecycle policies and when they save money',
        'Understand the purpose of AWS Backup',
      ],
      preLearningCheck: {
        question: 'Before we start — which type of storage is Amazon S3?',
        options: [
          'Block storage — data stored in fixed-size blocks accessible via OS volume',
          'File storage — data organised in a hierarchical file system',
          'Object storage — data stored as discrete objects with metadata and a unique key',
          'In-memory storage — data held in RAM for sub-millisecond access',
        ],
        correct: 2,
        note: 'S3\'s storage type is tested directly. Take a guess.',
      },
      sections: [
        {
          heading: 'Three storage types — one concept unlocks everything',
          body: 'Before naming any AWS service, understand the storage type it uses. The storage type determines what you can do with it, how it performs, and which workloads it fits.',
          table: {
            headers: ['Type', 'Analogy', 'Access method', 'Best for'],
            rows: [
              ['Object storage', 'Files in a warehouse — each tagged with a unique label', 'HTTP/S API (GET, PUT) — no OS mount', 'Images, videos, backups, logs, static web content, any "file" accessed via URL'],
              ['Block storage', 'A raw hard drive attached to your computer', 'Mounted as a volume by an OS', 'Database files, OS volumes, boot volumes — anything needing low-latency, high-IOPS disk'],
              ['File storage', 'A shared network drive (NFS or SMB)', 'Mounted as a network file system', 'Shared access from multiple instances; home directories; content management systems'],
            ],
          },
        },
        {
          heading: 'Amazon S3 — object storage at any scale',
          body: 'S3 stores data as objects in buckets. Each object has a key (like a filename), the data itself, and metadata. S3 has no file hierarchy — folders are a UI convenience built on key prefixes.\n\nS3 is the backbone of most AWS architectures: data lakes, backup destinations, static website hosting, media storage, log archives.',
          table: {
            headers: ['Storage class', 'Use case', 'Retrieval time', 'Cost vs. Standard'],
            rows: [
              ['S3 Standard', 'Frequently accessed data', 'Milliseconds', 'Baseline'],
              ['S3 Intelligent-Tiering', 'Unknown or changing access patterns — auto-moves objects between tiers', 'Milliseconds', 'Small monitoring fee + lower storage cost for infrequent tier'],
              ['S3 Standard-IA (Infrequent Access)', 'Data accessed less than once a month', 'Milliseconds', 'Lower storage, higher retrieval fee'],
              ['S3 One Zone-IA', 'Infrequent access, single AZ, recreatable data', 'Milliseconds', 'Lowest IA cost; no AZ redundancy'],
              ['S3 Glacier Instant Retrieval', 'Archive with occasional instant access (once a quarter)', 'Milliseconds', 'Very low storage cost'],
              ['S3 Glacier Flexible Retrieval', 'Archive; retrieval within minutes to hours acceptable', 'Minutes to 12 hours', 'Very low storage cost'],
              ['S3 Glacier Deep Archive', 'Long-term archive; accessed once a year or less', '12–48 hours', 'Lowest cost in S3'],
            ],
          },
          callout: { type: 'tip', text: 'Exam pattern: match the access frequency to the class. Frequent → Standard. Unknown → Intelligent-Tiering. Monthly → Standard-IA. Yearly or "7-year compliance archive" → Glacier Deep Archive.' },
        },
        {
          heading: 'Amazon EBS — block storage for EC2',
          body: 'Elastic Block Store provides persistent block storage volumes that attach to EC2 instances. Think of it as the SSD inside your cloud server.',
          bullets: [
            'Persists independently of the EC2 instance — you can stop or terminate the instance and the EBS volume survives.',
            'One AZ — an EBS volume lives in a single Availability Zone. To move it, take a snapshot (which goes to S3) and restore in another AZ.',
            'Instance store — local NVMe storage physically attached to the host. Extremely fast but ephemeral: data is lost when the instance stops or terminates. Only for temporary, high-throughput scratch data.',
          ],
          callout: { type: 'warning', text: 'EBS vs. instance store: EBS is persistent. Instance store is temporary. If the exam scenario involves data that must survive an instance stop, the answer requires EBS (or S3), never instance store.' },
        },
        {
          heading: 'Amazon EFS and FSx — file storage',
          body: 'File storage provides a shared filesystem that multiple EC2 instances (or on-premises servers) can mount simultaneously — something EBS cannot do.',
          bullets: [
            'Amazon EFS (Elastic File System) — a managed NFS filesystem. Automatically scales; can be accessed from thousands of EC2 instances simultaneously. Multi-AZ. Good for shared content, big data, and container filesystems.',
            'Amazon FSx — managed file systems for specific workloads. FSx for Windows File Server (SMB protocol, Windows apps), FSx for Lustre (high-performance computing, ML training).',
          ],
          callout: { type: 'tip', text: '"Multiple EC2 instances sharing the same filesystem" → EFS. "Windows-based file sharing / SMB" → FSx for Windows.' },
        },
        {
          heading: 'S3 Lifecycle policies and AWS Backup',
          body: 'Data changes in value over time. A transaction log is critical when created, accessed monthly for a year, then needs to be retained for 7 years but almost never read. Lifecycle policies automate this progression.',
          bullets: [
            'S3 Lifecycle policy — automatically transitions objects between storage classes (e.g., Standard → Standard-IA after 30 days → Glacier Deep Archive after 90 days) or deletes them after a defined period.',
            'AWS Backup — a centralised backup service that manages backup policies across EC2, EBS, RDS, DynamoDB, EFS, and more. Create backup plans once, apply to multiple resources; track compliance from a single dashboard.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company needs to share a large media library of video files across 50 EC2 instances simultaneously. All instances must be able to read and write to the same files. Which storage service is most appropriate?',
          options: [
            'Amazon EBS — attach one volume to all 50 instances',
            'Amazon S3 — store the media files as objects accessible via API',
            'Amazon EFS — a shared NFS filesystem that multiple instances can mount',
            'Instance store — high-performance local storage on each instance',
          ],
          correct: 2,
          explainCorrect: 'Correct — EFS is a shared file system that can be mounted by thousands of EC2 instances simultaneously. EBS can only be attached to one EC2 instance at a time (with a multi-attach exception for io1/io2 volumes, not tested at CLF level).',
          elaborativePrompt: 'Why would S3 not be ideal here despite also being accessible from all 50 instances? Think about how applications access files via a filesystem mount vs. via an HTTP API — and what the application code would need to change.',
        },
        {
          afterSection: 1,
          question: 'A company stores financial transaction logs in Amazon S3 Standard. The logs are accessed frequently for the first 30 days, rarely for the next 6 months, and then must be retained for 7 years for compliance but are almost never accessed. Which approach minimises storage cost while meeting retention requirements?',
          options: [
            'Keep all logs in S3 Standard for 7 years — compliance requires maximum availability',
            'Use a lifecycle policy: Standard for 30 days → Standard-IA for 6 months → Glacier Deep Archive for the remainder',
            'Delete logs after 6 months and export them to an on-premises tape archive',
            'Use S3 Intelligent-Tiering and let AWS determine the right class automatically',
          ],
          correct: 1,
          explainCorrect: 'Correct — a lifecycle policy automates the progression through storage classes as access frequency changes. Glacier Deep Archive has the lowest storage cost in S3 and is designed for long-term compliance archives.',
          elaborativePrompt: 'Why would Intelligent-Tiering not be the optimal answer here even though it sounds like it handles unknown access patterns? When does Intelligent-Tiering\'s monitoring fee make lifecycle policies the better economic choice?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the difference between EBS and EFS in terms of access patterns and use cases. If you were explaining to a developer which one to use for (a) a database volume and (b) a shared content directory for a web application, what would you say?',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a database on an Amazon EC2 instance. The database requires fast, low-latency block storage with persistent data even when the instance is stopped. Which AWS storage service meets these requirements?',
        options: [
          'Amazon S3 — durable object storage accessible via API',
          'Amazon EBS — persistent block storage that survives instance stops',
          'Instance store — local NVMe storage with the lowest possible latency',
          'Amazon EFS — a managed file system for shared access across instances',
        ],
        correct: 1,
        explanation: {
          summary: 'Databases need block storage (not object or file storage) and the data must persist when the instance stops. EBS is persistent block storage — it is the standard choice for database volumes on EC2.',
          perOption: [
            'S3 is object storage accessed via HTTP API. Databases require block storage that an OS can mount as a volume.',
            'Correct — EBS is persistent block storage that attaches to EC2 as a volume. Data survives instance stops, restarts, and even instance termination (by default or with the "delete on termination" option disabled).',
            'Instance store delivers the lowest latency, but data is lost when the instance stops or terminates. A database cannot lose its data on every instance stop.',
            'EFS is a shared NFS filesystem. While it can technically host database files, it introduces network latency and is not designed for high-IOPS database workloads.',
          ],
          link: 'Domain 3 · Task 3.6 — Storage services · Amazon EBS',
        },
      },
      videos: [
        {
          videoId: '77lMCiiMilo',
          title: 'AWS Storage Services Overview',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Official overview of S3, EBS, EFS, and storage selection guidance.',
        },
      ],
      keyTerms: [
        { term: 'Amazon S3', def: 'Object storage service. Data stored as objects (files + metadata) in buckets. Accessible via HTTP/S API.' },
        { term: 'Amazon EBS', def: 'Persistent block storage volumes that attach to EC2 instances as OS volumes. Survive instance stops.' },
        { term: 'Amazon EFS', def: 'Managed NFS file system accessible from thousands of EC2 instances simultaneously.' },
        { term: 'Instance store', def: 'Temporary, local NVMe storage physically on the EC2 host. Extremely fast but lost when the instance stops.' },
        { term: 'S3 Lifecycle policy', def: 'Rules that automatically transition objects to cheaper storage classes or delete them based on age.' },
      ],
      awsServices: [
        { name: 'Amazon S3', purpose: 'Object storage for any type of file. Multiple storage classes optimised for access frequency and cost.' },
        { name: 'Amazon EBS', purpose: 'Persistent block storage for EC2 instance volumes. Required for databases and OS boot volumes.' },
        { name: 'Amazon EFS', purpose: 'Shared NFS filesystem for multiple EC2 instances. Scales automatically.' },
        { name: 'Amazon FSx', purpose: 'Managed file systems for Windows (FSx for Windows) and HPC (FSx for Lustre).' },
        { name: 'AWS Backup', purpose: 'Centralised backup management across EC2, EBS, RDS, DynamoDB, EFS, and more.' },
      ],
      examTips: [
        'S3 = object. EBS = block (one EC2 at a time). EFS = file (shared, many EC2s). Instance store = ephemeral block.',
        '"Multiple instances sharing the same filesystem" → EFS.',
        '"7-year compliance archive / rarely accessed" → S3 Glacier Deep Archive.',
        '"Data must survive instance stop" → EBS (not instance store).',
        '"Automate cost reduction as data ages" → S3 Lifecycle policy.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s14',
      number: 14,
      module: 'Domain 3 · Cloud Technology & Services',
      domain: 'd3',
      weight: '34%',
      task: 'Task 3.7 + 3.8',
      title: 'AI/ML, Analytics, and Other AWS Services',
      duration: 30,
      summary: 'Task 3.7 and 3.8 cover a broad range of purpose-built AWS services — AI/ML, analytics, messaging, developer tools, and IoT. The exam tests awareness and selection: which service solves which problem. Learn each service\'s core job and you can answer these scenario questions reliably.',
      objectives: [
        'Identify AWS AI/ML services and the tasks they solve (SageMaker, Lex, Kendra, Rekognition)',
        'Identify analytics services and their use cases (Athena, Kinesis, Glue, QuickSight)',
        'Select the right messaging service (SNS, SQS, EventBridge)',
        'Identify developer tools, IoT, and end-user computing services',
      ],
      preLearningCheck: {
        question: 'Before we start — which AWS service lets you query data directly in Amazon S3 using standard SQL without loading it into a database first?',
        options: [
          'Amazon Kinesis',
          'Amazon Athena',
          'AWS Glue',
          'Amazon QuickSight',
        ],
        correct: 1,
        note: 'Athena is a distinctive service with an unusual value proposition. Take a guess.',
      },
      sections: [
        {
          heading: 'When AWS services beat building from scratch',
          body: 'Adding AI to an application used to require a team of ML engineers, months of training data collection, and significant compute investment. AWS changed this by offering pre-trained AI capabilities as API calls — add natural language understanding to your app with a few lines of code.\n\nThe same logic applies to analytics, messaging, and IoT. Purpose-built services that take months to build and operate are available as managed services.',
        },
        {
          heading: 'AI and machine learning services',
          body: 'These services fall into two categories: high-level AI services (pre-trained, no ML expertise needed) and developer-level ML platforms (SageMaker).',
          table: {
            headers: ['Service', 'What it does', 'Use case'],
            rows: [
              ['Amazon SageMaker', 'End-to-end ML platform for building, training, and deploying custom models', 'Teams that need to train their own models on proprietary data'],
              ['Amazon Rekognition', 'Analyses images and videos — object detection, facial analysis, text extraction', 'Content moderation, employee badge verification, searching images by label'],
              ['Amazon Lex', 'Builds conversational chatbots (the technology behind Alexa)', 'Customer service chatbots, IVR phone systems'],
              ['Amazon Kendra', 'Intelligent enterprise search using NLP', 'Internal knowledge base search — employees ask natural language questions'],
              ['Amazon Polly', 'Converts text to lifelike speech', 'Accessibility features, voice assistants, audiobook generation'],
              ['Amazon Translate', 'Real-time neural machine translation', 'Multilingual applications, document translation at scale'],
              ['Amazon Comprehend', 'NLP for sentiment analysis, entity recognition, topic modelling', 'Analysing customer reviews, categorising support tickets'],
            ],
          },
        },
        {
          heading: 'Analytics services',
          body: 'Data is only valuable if you can ask questions of it. AWS analytics services cover the full pipeline from ingestion to visualisation.',
          table: {
            headers: ['Service', 'What it does', 'Exam signal'],
            rows: [
              ['Amazon Athena', 'Query data in S3 with SQL — no infrastructure, pay per query', '"Query S3 directly with SQL" or "serverless analytics"'],
              ['Amazon Kinesis', 'Real-time streaming data ingestion and processing', '"Real-time" + "streaming" + "IoT sensors / clickstreams / logs"'],
              ['AWS Glue', 'Serverless ETL (Extract, Transform, Load) — prepares data for analytics', '"Prepare data / transform data / data catalogue"'],
              ['Amazon QuickSight', 'Business intelligence dashboards and visualisations', '"Visualise data / create dashboards / business users"'],
              ['Amazon Redshift', 'Petabyte-scale data warehouse for analytical queries', '"Data warehouse" + "large-scale analytics" + "structured historical data"'],
            ],
          },
        },
        {
          heading: 'Application integration — messaging and events',
          body: 'These services decouple application components so they communicate asynchronously and independently.',
          table: {
            headers: ['Service', 'What it does', 'Key differentiator'],
            rows: [
              ['Amazon SQS', 'Message queue — producer sends messages; consumer processes them at its own pace', 'Buffers workloads; handles spikes; exactly-once or at-least-once delivery'],
              ['Amazon SNS', 'Pub/sub notifications — one message fans out to many subscribers', 'Send the same message to email, SMS, Lambda, SQS simultaneously'],
              ['Amazon EventBridge', 'Event bus — routes events from AWS services and SaaS apps to targets based on rules', 'Event-driven architectures; reacting to AWS service state changes'],
            ],
          },
          callout: { type: 'tip', text: 'SQS = one-to-one queue (decouple producer/consumer). SNS = one-to-many fanout (notify multiple systems). EventBridge = event-driven routing (react to events from AWS or SaaS).' },
        },
        {
          heading: 'Developer tools, end-user computing, and IoT',
          body: 'The exam covers a breadth of services from Task 3.8. Know the category each service belongs to.',
          bullets: [
            'Developer tools — AWS CodeBuild (build code), AWS CodePipeline (CI/CD pipeline automation), AWS X-Ray (distributed tracing and debugging).',
            'Business applications — Amazon Connect (cloud contact centre), Amazon SES (bulk transactional email).',
            'End-user computing — Amazon WorkSpaces (cloud desktops for remote workers), Amazon AppStream 2.0 (stream desktop applications to a browser).',
            'Frontend/mobile — AWS Amplify (full-stack web and mobile app development), AWS AppSync (managed GraphQL API).',
            'IoT — AWS IoT Core (connect, manage, and receive data from IoT devices securely at scale).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A retail company wants to add a feature that automatically analyses product review text to determine whether customer sentiment is positive, negative, or neutral. Which AWS service provides this capability without requiring any ML expertise?',
          options: [
            'Amazon SageMaker — trains custom ML models on the company\'s review data',
            'Amazon Comprehend — NLP service that analyses sentiment and entities in text',
            'Amazon Lex — builds conversational chatbots for customer interaction',
            'Amazon Kendra — enterprise search for finding information in documents',
          ],
          correct: 1,
          explainCorrect: 'Correct — Amazon Comprehend is a pre-trained NLP service that provides sentiment analysis, entity recognition, and topic modelling. No ML expertise or training data required.',
          elaborativePrompt: 'When would SageMaker be the better choice over Comprehend for sentiment analysis on product reviews? What would need to be different about the company\'s requirements or data for a custom model to outperform Comprehend\'s pre-trained model?',
        },
        {
          afterSection: 2,
          question: 'A company has millions of log files stored in Amazon S3. A data analyst wants to run occasional SQL queries on these logs to investigate anomalies, without provisioning any database servers. Which service is most appropriate?',
          options: [
            'Amazon Redshift — a data warehouse for large-scale analytics',
            'Amazon Athena — queries data in S3 directly using SQL with no infrastructure',
            'AWS Glue — ETL service for preparing and transforming data',
            'Amazon Kinesis — real-time streaming data ingestion and processing',
          ],
          correct: 1,
          explainCorrect: 'Correct — Athena queries S3 data directly with SQL. It is serverless and charges per query scanned. Perfect for occasional ad-hoc queries on existing S3 data without spinning up infrastructure.',
          elaborativePrompt: 'Why would Amazon Redshift not be appropriate here, even though it also runs SQL queries on large datasets? Think about the operational burden and cost model — what changes when queries are occasional vs. continuous?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the difference between SNS and SQS in one sentence each. For each one, name a specific scenario where it is the right choice and why the other would not work as well.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company processes order confirmations by sending them to multiple downstream systems: an email service, an inventory system, and an analytics platform. When an order is placed, all three systems must receive the notification. Which AWS service best supports this architecture?',
        options: [
          'Amazon SQS — a message queue that allows one consumer to process each message',
          'Amazon SNS — a pub/sub service that delivers one message to multiple subscribers simultaneously',
          'Amazon Kinesis — real-time streaming for high-volume data ingestion',
          'AWS EventBridge — event bus for routing AWS service events to targets',
        ],
        correct: 1,
        explanation: {
          summary: 'One message (order placed) must be delivered to three separate systems simultaneously. SNS fanout delivers the same message to multiple subscribers — email, SQS queue for inventory, and Lambda for analytics — all from a single publish.',
          perOption: [
            'SQS is a queue: a message is consumed by one consumer, then deleted from the queue. It cannot deliver the same message to three separate systems simultaneously.',
            'Correct — SNS pub/sub delivers one message to all subscribers. Each of the three downstream systems subscribes to the topic and receives the notification.',
            'Kinesis is designed for high-volume streaming data (sensor readings, clickstreams). It is heavyweight for order notification fanout.',
            'EventBridge routes events based on rules and is excellent for complex event routing. For this straightforward fanout pattern, SNS is simpler and more direct.',
          ],
          link: 'Domain 3 · Task 3.8 — Application integration · Amazon SNS',
        },
      },
      videos: [
        {
          videoId: 'Lv9RMxPHvEY',
          title: 'AWS Analytics Services Overview',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Covers Athena, Kinesis, Glue, and QuickSight with guidance on when to use each.',
        },
      ],
      keyTerms: [
        { term: 'Amazon SageMaker', def: 'End-to-end ML platform for building, training, and deploying machine learning models.' },
        { term: 'Amazon Athena', def: 'Serverless SQL query service that runs queries directly against data stored in Amazon S3.' },
        { term: 'Amazon Kinesis', def: 'Real-time streaming data service for ingesting and processing high-volume event streams.' },
        { term: 'Amazon SNS', def: 'Pub/sub notification service. One message fans out to multiple subscribers (email, SMS, Lambda, SQS).' },
        { term: 'Amazon SQS', def: 'Message queue service that decouples producers and consumers. Each message consumed by one recipient.' },
      ],
      awsServices: [
        { name: 'Amazon SageMaker', purpose: 'Build, train, and deploy custom ML models.' },
        { name: 'Amazon Rekognition', purpose: 'Image and video analysis — object detection, facial analysis.' },
        { name: 'Amazon Lex', purpose: 'Conversational chatbot builder (same technology as Alexa).' },
        { name: 'Amazon Athena', purpose: 'Serverless SQL queries on S3 data.' },
        { name: 'Amazon Kinesis', purpose: 'Real-time streaming data ingestion and processing.' },
        { name: 'AWS Glue', purpose: 'Serverless ETL for preparing and transforming data.' },
        { name: 'Amazon SNS', purpose: 'One-to-many pub/sub notifications.' },
        { name: 'Amazon SQS', purpose: 'Message queue for decoupling application components.' },
        { name: 'AWS IoT Core', purpose: 'Connect and manage IoT devices and route their data to AWS services.' },
      ],
      examTips: [
        '"Query S3 with SQL / no infrastructure" → Athena.',
        '"Real-time streaming / clickstreams / sensor data" → Kinesis.',
        '"One message to many systems" → SNS. "Decouple one producer from one consumer" → SQS.',
        '"Sentiment / entity recognition / NLP on text" → Amazon Comprehend.',
        '"Custom ML model / train on own data" → SageMaker.',
        '"Image/video analysis" → Rekognition. "Chatbot" → Lex. "Enterprise search" → Kendra.',
      ],
    },


    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — BILLING, PRICING AND SUPPORT
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s15',
      number: 15,
      module: 'Domain 4 · Billing, Pricing & Support',
      domain: 'd4',
      weight: '12%',
      task: 'Task 4.1',
      title: 'AWS Pricing Models — On-Demand, Reserved, Savings Plans, and Spot',
      duration: 30,
      summary: 'AWS offers several ways to pay for compute — and the differences in price are substantial. Understanding which model to use for which workload can cut your AWS bill significantly. More importantly for the exam, you must be able to match a scenario to the correct pricing model.',
      objectives: [
        'Describe On-Demand, Reserved, Savings Plans, and Spot pricing models',
        'Match workload characteristics to the most cost-effective pricing model',
        'Explain the AWS Free Tier and its three offer types',
        'Identify key principles of AWS pricing (pay-as-you-go, pay less when you reserve)',
      ],
      preLearningCheck: {
        question: 'Before we start — which EC2 pricing model is most appropriate for a workload that must run continuously and cannot be interrupted?',
        options: [
          'Spot Instances — cheapest available compute',
          'On-Demand — no commitment, pay by the second',
          'Reserved Instances — 1- or 3-year commitment for a significant discount',
          'Savings Plans — flexible commitment applied across instance families',
        ],
        correct: 2,
        note: 'Steady-state workloads have a well-known best answer. Take a guess.',
      },
      sections: [
        {
          heading: 'The pricing decision',
          body: 'AWS compute costs are not one-size-fits-all. The right model depends on how predictable and continuous your workload is. The more committed you are to a stable baseline usage, the more AWS discounts you. The trade-off is flexibility vs. cost.',
        },
        {
          heading: 'The four EC2 pricing models',
          body: 'Understanding the four models and when each applies is one of the most reliably-tested concepts in Domain 4.',
          table: {
            headers: ['Model', 'Commitment', 'Discount vs. On-Demand', 'Best for', 'Risk'],
            rows: [
              ['On-Demand', 'None — pay per second', '0%', 'Short-term, unpredictable workloads; spiky or new applications you cannot forecast', 'Highest cost for steady workloads'],
              ['Reserved Instances', '1 or 3 years, specific instance type/Region', 'Up to 72%', 'Steady-state, always-on workloads (databases, production servers that run 24/7)', 'Locked in — wrong forecast means paying for unused capacity'],
              ['Savings Plans', '1 or 3 years, flexible — applies across instance families and even Lambda/Fargate', 'Up to 66%', 'Same steady-state use cases as RIs with more flexibility to change instance types or services', 'Lower discount than highest RI tier, but more flexibility'],
              ['Spot Instances', 'None — bid for spare capacity; can be interrupted with 2-min notice', 'Up to 90%', 'Fault-tolerant, flexible workloads: batch jobs, ML training, rendering, CI/CD', 'Interruption risk — not for production web servers or databases'],
            ],
          },
        },
        {
          heading: 'Dedicated Hosts and Dedicated Instances',
          body: 'Sometimes regulations or licensing require that you run on hardware not shared with other AWS customers.',
          bullets: [
            'Dedicated Instances — your instances run on hardware isolated from other AWS accounts. The specific host may vary. Useful for compliance requirements.',
            'Dedicated Hosts — a physical server fully allocated to your account. You control placement. Required for software licenses that are tied to specific physical servers (e.g. per-socket or per-core licensing for Oracle, Windows Server).',
          ],
          callout: { type: 'tip', text: '"Physical server for BYOL / license compliance" → Dedicated Host. "Compliance isolation without physical server control" → Dedicated Instances.' },
        },
        {
          heading: 'AWS Free Tier',
          body: 'AWS offers three types of free usage — knowing the difference is testable.',
          table: {
            headers: ['Type', 'How it works', 'Example'],
            rows: [
              ['12 months free', 'Available to new AWS accounts for 12 months after account creation', 'Amazon EC2 t2.micro (750 hours/month), Amazon S3 (5 GB)'],
              ['Always free', 'Available to all AWS accounts, no expiry', 'AWS Lambda (1M requests/month), Amazon DynamoDB (25 GB storage)'],
              ['Trials', 'Short-term free trials of specific services starting from date of activation', 'Amazon SageMaker (2 months free), Amazon Redshift (2 months free)'],
            ],
          },
        },
        {
          heading: 'Core pricing principles',
          body: 'Three principles drive how AWS charges across all services — the exam expects you to know them.',
          bullets: [
            'Pay-as-you-go — pay only for what you use, only when you use it. No upfront infrastructure investment.',
            'Pay less when you reserve — committing to 1 or 3 years of usage earns significant discounts (Reserved Instances, Savings Plans).',
            'Pay less with more usage — volume discounts apply automatically on S3 storage, data transfer, and other services as your usage grows.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company runs a production MySQL database on Amazon RDS that must be available 24 hours a day, 7 days a week. They have been using the database for 2 years and expect to continue for at least 3 more years. Which pricing model minimises cost?',
          options: [
            'On-Demand — no commitment, maximum flexibility for the database',
            'Spot Instances — 90% discount and the database can tolerate brief interruptions',
            '3-year Reserved Instance with partial upfront payment — largest discount for a steady-state workload',
            'Savings Plans — flexible commitment that can be applied to RDS',
          ],
          correct: 2,
          explainCorrect: 'Correct — a production database running 24/7 for a predictable multi-year period is exactly what Reserved Instances are designed for. A 3-year commitment with partial upfront payment delivers the highest discount (up to 72%).',
          elaborativePrompt: 'Why is the Spot Instance option obviously wrong for a production database, even though the cost savings are the largest? What specific characteristic of Spot makes it unsuitable — and what does "tolerate interruptions" actually mean for a database?',
        },
        {
          afterSection: 2,
          question: 'A company wants to run a software license that requires a dedicated physical server with consistent hardware. The license is tied to the number of physical processor sockets. Which EC2 option should they use?',
          options: [
            'On-Demand Instances on shared hardware',
            'Reserved Instances — provide hardware isolation',
            'Dedicated Instances — run on isolated hardware separate from other accounts',
            'Dedicated Hosts — provide visibility into and control over physical server hardware',
          ],
          correct: 3,
          explainCorrect: 'Correct — Dedicated Hosts give you a specific physical server allocated to your account. You can see and control socket, core, and NUMA topology, which is required for per-socket software licensing.',
          elaborativePrompt: 'What is the difference between Dedicated Hosts and Dedicated Instances in terms of what you can control — and which compliance or licensing scenario requires each?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain why a 3-year Reserved Instance purchase for a rarely-used development environment would be a poor financial decision, even though it offers the highest discount. What characteristic of the workload matters more than the discount percentage?',
      sample: {
        type: 'multiple-choice',
        stem: 'A machine learning team runs large training jobs on EC2. Each job takes 4–8 hours, runs on 50 GPU instances, and can be restarted from a checkpoint if interrupted. The team runs 3–4 training jobs per week, but the schedule is flexible. Which pricing model minimises cost?',
        options: [
          'On-Demand Instances — most reliable availability for GPU instances',
          'Reserved Instances — commit to 50 GPU instances for 1 year to reduce cost',
          'Spot Instances — fault-tolerant ML training is the ideal Spot workload',
          'Savings Plans — flexible compute commitment across instance families',
        ],
        correct: 2,
        explanation: {
          summary: 'ML training is the canonical Spot Instance use case: fault-tolerant (can checkpoint and restart), flexible timing, high compute requirements. Spot offers up to 90% discount for exactly this scenario.',
          perOption: [
            'On-Demand provides reliable access but at full price. For 50 GPU instances running multiple days per week, the cost would be very high with no benefit over Spot for a restartable workload.',
            'Reserved Instances make sense for continuous 24/7 usage. If the team only runs 3–4 jobs per week and not continuously, reserved capacity would sit idle most of the time — wasting the commitment.',
            'Correct — ML training jobs that can checkpoint and restart are the textbook Spot workload. Spot is up to 90% cheaper, and the 2-minute interruption window gives the job time to save a checkpoint.',
            'Savings Plans reduce cost for steady, continuous compute usage. Like Reserved Instances, they are not optimised for intermittent bursty workloads.',
          ],
          link: 'Domain 4 · Task 4.1 — EC2 pricing models · Spot Instances',
        },
      },
      videos: [
        {
          videoId: 'fBTsyoHVKTs',
          title: 'AWS EC2 Pricing Models Explained',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Covers On-Demand, Reserved, Savings Plans, and Spot with practical examples.',
        },
      ],
      keyTerms: [
        { term: 'On-Demand Instances', def: 'EC2 compute with no commitment. Pay per second with no long-term contract. Highest per-hour cost.' },
        { term: 'Reserved Instances', def: '1- or 3-year commitment to a specific EC2 configuration for up to 72% discount over On-Demand.' },
        { term: 'Savings Plans', def: 'Flexible 1- or 3-year compute commitment ($/hour) applied across EC2 families, Lambda, and Fargate.' },
        { term: 'Spot Instances', def: 'Spare EC2 capacity at up to 90% discount. Can be interrupted with 2-minute notice. Fault-tolerant workloads only.' },
        { term: 'Dedicated Host', def: 'A physical server fully allocated to your AWS account. Required for per-socket BYOL software licensing.' },
      ],
      awsServices: [
        { name: 'Amazon EC2 Reserved Instances', purpose: 'Pre-purchase EC2 capacity for 1–3 years for significant discounts on steady-state workloads.' },
        { name: 'AWS Savings Plans', purpose: 'Flexible compute commitment that automatically applies discounts across EC2, Lambda, and Fargate.' },
        { name: 'Amazon EC2 Spot Instances', purpose: 'Up to 90% discount on interruptible spare EC2 capacity for fault-tolerant workloads.' },
      ],
      examTips: [
        'Steady-state / 24/7 workload → Reserved Instances or Savings Plans.',
        'Fault-tolerant / interruptible / batch / ML training → Spot.',
        'Short-term / unpredictable → On-Demand.',
        'Per-socket BYOL licensing → Dedicated Host (not Dedicated Instances).',
        'Free Tier: 12-month (new accounts) vs. always-free (all accounts) vs. trial (per service).',
        'Three pricing principles: pay-as-you-go, pay less when you reserve, pay less with more.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s16',
      number: 16,
      module: 'Domain 4 · Billing, Pricing & Support',
      domain: 'd4',
      weight: '12%',
      task: 'Task 4.2 + 4.3',
      title: 'Cost Management, Billing Tools, and AWS Support Plans',
      duration: 30,
      summary: 'The final session ties billing to action: how do you see what you\'re spending, predict future costs, set guardrails, and get help when you need it? AWS provides purpose-built tools for each of these — and the exam tests whether you can select the right one.',
      objectives: [
        'Identify AWS billing and cost management tools (Cost Explorer, Budgets, Cost Allocation Tags)',
        'Distinguish between TCO Calculator, Pricing Calculator, and AWS Compute Optimizer',
        'Describe the four AWS Support plans and their key features',
        'Explain AWS Trusted Advisor and AWS Health Dashboard',
      ],
      preLearningCheck: {
        question: 'Before we start — which AWS tool would you use to create a monthly budget alert that sends a notification when your EC2 spend exceeds $500?',
        options: [
          'AWS Cost Explorer — visualise and analyse cost and usage data',
          'AWS Budgets — set custom budgets and receive alerts when thresholds are exceeded',
          'AWS Trusted Advisor — recommendations to reduce cost and improve security',
          'AWS Compute Optimizer — right-size EC2 instances for cost and performance',
        ],
        correct: 1,
        note: 'Budget alerts are a common scenario. Take a guess.',
      },
      sections: [
        {
          heading: 'Billing and cost management tools',
          body: 'AWS provides several tools for understanding, controlling, and optimising your spend. Each has a distinct purpose — the exam often presents scenarios where one is clearly the right choice.',
          table: {
            headers: ['Tool', 'What it does', 'Exam signal'],
            rows: [
              ['AWS Cost Explorer', 'Visualise historical cost and usage. Filter by service, linked account, tag. Identify trends and anomalies.', '"Analyse past spending / identify what drove last month\'s bill / visualise trends"'],
              ['AWS Budgets', 'Set custom budgets (cost, usage, reservation utilisation). Receive alerts via email or SNS when actual or forecast spend exceeds threshold.', '"Alert when spending exceeds $X / notify me if forecast exceeds budget"'],
              ['Cost Allocation Tags', 'Tag resources by project, team, or environment. Tags appear on cost reports to show which team/project generated which costs.', '"Show which team is responsible for which AWS costs / chargeback / cost allocation"'],
              ['AWS Compute Optimizer', 'ML-powered recommendations to right-size EC2, Lambda, and ECS workloads for cost and performance.', '"Right-size EC2 / reduce compute cost while maintaining performance"'],
            ],
          },
        },
        {
          heading: 'Planning and estimation tools',
          body: 'Before committing to AWS or during architecture planning, you need to estimate costs. AWS offers two distinct tools.',
          table: {
            headers: ['Tool', 'Purpose', 'When to use'],
            rows: [
              ['AWS Pricing Calculator', 'Estimate monthly AWS cost for a planned architecture before you build it. Configure services, regions, and usage patterns.', 'Pre-deployment cost modelling — "what will this architecture cost before I build it?"'],
              ['AWS Migration Evaluator (formerly TCO Calculator)', 'Compare on-premises infrastructure cost to estimated AWS cost. Builds a case for cloud migration.', 'Executive approval for migration — "should we move from our data center to AWS?"'],
            ],
          },
          callout: { type: 'tip', text: 'Pricing Calculator = "what will this AWS architecture cost?" Migration Evaluator = "how does AWS compare to our current on-premises cost?"' },
        },
        {
          heading: 'AWS Support Plans',
          body: 'AWS offers four support tiers. The exam tests which plan provides specific features — particularly around response times and access to AWS staff.',
          table: {
            headers: ['Plan', 'Cost', 'Key features', 'Response time (production outage)'],
            rows: [
              ['Basic', 'Free (all accounts)', 'AWS documentation, whitepapers, community forums, AWS Health Dashboard, 6 core Trusted Advisor checks', 'No technical support cases'],
              ['Developer', 'From $29/month', 'One primary contact, email support during business hours', '12 hours (impaired system), 24 hours (general)'],
              ['Business', 'From $100/month (3% of monthly bill)', 'All Trusted Advisor checks, phone/chat/email 24/7, Infrastructure Event Management (fee)', '1 hour (production system down)'],
              ['Enterprise On-Ramp', 'From $5,500/month', 'Technical Account Manager (TAM) pool, Concierge Support Team', '30 minutes (business-critical system down)'],
              ['Enterprise', 'From $15,000/month', 'Dedicated TAM, proactive reviews, Well-Architected reviews', '15 minutes (business-critical system down)'],
            ],
          },
          callout: { type: 'tip', text: 'Key exam patterns: "24/7 phone support" → Business or above. "Dedicated TAM" → Enterprise. "All Trusted Advisor checks" → Business or above. Basic and Developer have no 24/7 support.' },
        },
        {
          heading: 'AWS Trusted Advisor',
          body: 'Trusted Advisor inspects your AWS environment and makes recommendations across five categories.',
          bullets: [
            'Cost optimisation — identify idle or underutilised resources (unused EC2 instances, unattached EBS volumes).',
            'Performance — flag configuration choices that reduce application performance.',
            'Security — identify security gaps (open ports, MFA not enabled on root, overly permissive S3 buckets).',
            'Fault tolerance — identify architectures lacking high availability (no Multi-AZ, no Auto Scaling).',
            'Service limits — alert before you hit AWS service quotas that could cause failures.',
          ],
          callout: { type: 'tip', text: 'Basic/Developer plans get 6 core security checks. Business and Enterprise plans unlock all Trusted Advisor checks across all five categories.' },
        },
        {
          heading: 'AWS Health Dashboard',
          body: 'Not every issue is something you caused. Sometimes AWS has a service disruption that affects your resources.',
          bullets: [
            'Service Health Dashboard — shows real-time and historical status of all AWS services across all Regions. Public view at status.aws.amazon.com.',
            'Personal Health Dashboard (AWS Health) — shows health events specifically affecting resources in your AWS account. Personalised alerts with guidance on how to remediate.',
          ],
          callout: { type: 'tip', text: '"Is AWS having an outage?" → Service Health Dashboard. "How does this AWS event affect MY resources?" → Personal Health Dashboard.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company wants to receive an automated alert when their total AWS spend for the month exceeds $10,000, before the invoice is issued. Which service should they configure?',
          options: [
            'AWS Cost Explorer — to visualise and investigate the spend that exceeded $10,000',
            'AWS Budgets — to define a budget threshold and receive an alert when actual or forecast spend exceeds it',
            'AWS Trusted Advisor — to identify and eliminate the cost drivers causing the spend to rise',
            'Amazon CloudWatch — to create a metric alarm based on estimated charges',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Budgets is the purpose-built tool for setting spending thresholds and receiving alerts. You can alert on actual spend, forecast spend, or reservation utilisation.',
          elaborativePrompt: 'What would Cost Explorer tell you about the situation, and why is that information useful but insufficient for the scenario described — which asks for proactive notification before costs are incurred?',
        },
        {
          afterSection: 2,
          question: 'A startup has an AWS Business Support plan. Their production application is completely down and they need AWS technical assistance. What is the maximum time AWS guarantees a response to a "production system down" case?',
          options: [
            '15 minutes',
            '30 minutes',
            '1 hour',
            '4 hours',
          ],
          correct: 2,
          explainCorrect: 'Correct — AWS Business Support guarantees a 1-hour response time for production system down cases. Enterprise plans offer 15 minutes (Enterprise) or 30 minutes (Enterprise On-Ramp).',
          elaborativePrompt: 'What would the response time be if the company had Developer Support instead of Business? What does that difference mean for a production outage costing thousands of dollars per hour?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question: explain the difference between Cost Explorer and AWS Budgets — not just what each does, but which one is reactive (looks backward) and which is proactive (can alert in real time). Name a concrete scenario where you\'d use each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is planning to migrate its on-premises data center to AWS. Finance needs to quantify the potential savings and build a business case comparing current on-premises infrastructure costs against projected AWS costs. Which AWS tool is designed for this purpose?',
        options: [
          'AWS Pricing Calculator — estimates the monthly cost of a specific AWS architecture',
          'AWS Cost Explorer — analyses and visualises current AWS spending patterns',
          'AWS Migration Evaluator — compares on-premises total cost of ownership with projected AWS costs',
          'AWS Budgets — sets spending thresholds and alerts for AWS services',
        ],
        correct: 2,
        explanation: {
          summary: 'Migration Evaluator (formerly Total Cost of Ownership Calculator) is specifically designed for migration business cases — it models current on-premises costs and compares them to AWS. The output is a TCO comparison report for finance and executives.',
          perOption: [
            'The Pricing Calculator estimates the cost of a specific AWS architecture after you have decided to migrate. It does not model or compare current on-premises costs.',
            'Cost Explorer analyses your actual current AWS spend. It is useful after migration, not before — there is no AWS spend to analyse yet.',
            'Correct — Migration Evaluator collects data about on-premises workloads and produces a detailed cost comparison. It is designed specifically for the "should we move to AWS?" question.',
            'AWS Budgets is for setting spending alerts on existing AWS usage, not for pre-migration cost comparison.',
          ],
          link: 'Domain 4 · Task 4.2 — Billing tools · Migration Evaluator',
        },
      },
      videos: [
        {
          videoId: 'XHqhWGFEVNw',
          title: 'AWS Cost Management Tools Overview',
          channel: 'AWS',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Walks through Cost Explorer, Budgets, and Trusted Advisor with practical demonstration.',
        },
      ],
      keyTerms: [
        { term: 'AWS Cost Explorer', def: 'Visualise and analyse historical AWS cost and usage data. Filter by service, account, tag, Region.' },
        { term: 'AWS Budgets', def: 'Set cost, usage, or reservation budgets with email/SNS alerts when actual or forecast spend exceeds threshold.' },
        { term: 'AWS Trusted Advisor', def: 'Inspects your AWS environment and makes recommendations across cost, performance, security, fault tolerance, and service limits.' },
        { term: 'AWS Migration Evaluator', def: 'Compares on-premises infrastructure costs with projected AWS costs for migration business cases.' },
        { term: 'Personal Health Dashboard', def: 'Shows AWS health events that specifically affect resources in your account, with remediation guidance.' },
      ],
      awsServices: [
        { name: 'AWS Cost Explorer', purpose: 'Historical cost and usage visualisation and trend analysis.' },
        { name: 'AWS Budgets', purpose: 'Set spending thresholds with automated alerts for proactive cost control.' },
        { name: 'AWS Trusted Advisor', purpose: 'Automated best-practice checks across cost, security, performance, and fault tolerance.' },
        { name: 'AWS Compute Optimizer', purpose: 'ML-powered right-sizing recommendations for EC2, Lambda, and ECS.' },
        { name: 'AWS Health Dashboard', purpose: 'Real-time AWS service status (public) and account-specific health events (personal).' },
      ],
      examTips: [
        '"Proactive spend alert before the invoice" → AWS Budgets.',
        '"Analyse what drove last month\'s bill" → Cost Explorer.',
        '"Build a migration business case / compare TCO" → Migration Evaluator.',
        '"24/7 phone support" → Business plan or above.',
        '"Dedicated TAM" → Enterprise plan.',
        '"All Trusted Advisor checks" → Business plan or above. Basic gets 6 core checks only.',
        'Service Health Dashboard = all AWS / public. Personal Health Dashboard = your account / personalised.',
      ],
    },
  ],
}

export default clfC02Course
