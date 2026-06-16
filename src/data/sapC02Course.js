// AWS Certified Solutions Architect – Professional (SAP-C02) — Exam Prep Course
// 17 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors dvaC02Course.js / mlaC01Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 4 — Domain 1 (Design Solutions for Organizational Complexity) authored (s1–s5).
// D2 (New Solutions) + D3 (Continuous Improvement) + D4 (Migration & Modernization) sessions and
// interactive widgets land in Step 2.

const sapC02Course = {
  slug: 'sap-c02',
  title: 'AWS Certified Solutions Architect – Professional — Full Prep Course',
  code: 'SAP-C02',
  subtitle: 'Seventeen ~30-minute sessions covering all four domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 75 questions (65 scored + 10 unscored), 180 minutes, pass at 750/1000 (75%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Design Solutions for Organizational Complexity', weight: '26%' },
    { id: 'd2', label: 'Domain 2 · Design for New Solutions', weight: '29%' },
    { id: 'd3', label: 'Domain 3 · Continuous Improvement for Existing Solutions', weight: '25%' },
    { id: 'd4', label: 'Domain 4 · Accelerate Workload Migration & Modernization', weight: '20%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DESIGN SOLUTIONS FOR ORGANIZATIONAL COMPLEXITY (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Design Solutions for Organizational Complexity',
      domain: 'd1',
      weight: '26%',
      task: 'Task 1.1',
      title: 'Connecting VPCs, Accounts, and On-Premises at Scale',
      duration: 30,
      summary: 'The Professional exam opens with the network you cannot avoid: dozens of VPCs across many accounts, plus on-premises and co-location sites that must reach the cloud. This session builds the decision model — peering vs. Transit Gateway vs. PrivateLink vs. Direct Connect vs. VPN — and the hybrid DNS that makes it all resolvable.',
      objectives: [
        'Choose among VPC peering, Transit Gateway, and PrivateLink for VPC-to-VPC and shared-services connectivity',
        'Select the right hybrid link — Direct Connect, Site-to-Site VPN, or both — based on bandwidth, latency, and resilience needs',
        'Explain why peering is non-transitive and when Transit Gateway becomes the better hub',
        'Design hybrid DNS resolution with Route 53 Resolver inbound and outbound endpoints',
        'Select Regions and Availability Zones from network and latency requirements',
      ],
      preLearningCheck: {
        question: 'A company has 30 VPCs across multiple accounts that all need to communicate, plus a connection to its on-premises data center. The networking team is overwhelmed maintaining a full mesh of VPC peering connections. Which service BEST simplifies this at scale?',
        options: [
          'Add more VPC peering connections and document them carefully',
          'AWS Transit Gateway as a central hub for all VPCs and the on-premises link',
          'A NAT gateway in each VPC',
          'VPC endpoints in every VPC',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Why connectivity is the first Professional skill',
          body: 'At the Associate level you connect one VPC to the internet and maybe peer two VPCs. At the Professional level you are handed an organization: many accounts, many VPCs, on-premises sites, and partners — all with different trust and routing needs. The exam tests whether you can pick the connectivity primitive that scales and stays operable, not just one that technically works.\n\nThe core trap is the full mesh: VPC peering is simple for a handful of VPCs, but N VPCs need N(N-1)/2 peering connections, and peering is non-transitive — A↔B and B↔C does not give you A↔C. That O(n²) growth is the signal to move to a hub.',
        },
        {
          heading: 'VPC-to-VPC: peering vs. Transit Gateway vs. PrivateLink',
          body: 'Three primitives, three different jobs. Match the requirement to the primitive.',
          interactive: 'connectivity-selector',
          table: {
            headers: ['Option', 'Model', 'Use when'],
            rows: [
              ['VPC peering', 'One-to-one, non-transitive, no extra hops', 'A few VPCs need full IP connectivity; lowest cost; no transitive routing needed'],
              ['Transit Gateway', 'Hub-and-spoke; transitive; attaches VPCs, VPNs, and Direct Connect', 'Many VPCs/accounts and/or hybrid links must interconnect through one managed hub'],
              ['AWS PrivateLink', 'Exposes a single service via an interface endpoint; one-way', 'You want to share ONE service across VPCs/accounts without routing the whole network together'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "share a specific service with consumers without giving them network-level access to the whole VPC" → PrivateLink (interface endpoint), not peering or Transit Gateway.' },
        },
        {
          heading: 'Hybrid connectivity: Direct Connect vs. VPN',
          body: 'Connecting on-premises to AWS is a resilience-and-bandwidth question. Direct Connect is a dedicated private link; Site-to-Site VPN runs over the public internet but is fast to stand up.',
          table: {
            headers: ['Link', 'Strengths', 'Trade-off'],
            rows: [
              ['AWS Direct Connect (DX)', 'Consistent low latency, high dedicated bandwidth, private', 'Weeks to provision; a single DX is itself a single point of failure'],
              ['Site-to-Site VPN', 'Minutes to set up, encrypted, low cost', 'Latency/throughput vary with the public internet'],
              ['DX + VPN backup', 'DX for performance, VPN as automatic failover', 'Most resilient hybrid pattern — the common Professional answer'],
              ['DX with MACsec / two DX at different locations', 'Encryption and/or no single point of failure', 'Higher cost; used when compliance or HA demands it'],
            ],
          },
          callout: { type: 'warning', text: 'A single Direct Connect connection is NOT highly available. If the stem stresses resilience, the answer adds a second DX (different location/device) or a Site-to-Site VPN backup.' },
        },
        {
          heading: 'Hybrid DNS with Route 53 Resolver',
          body: 'Once networks are connected, names must resolve both ways. Route 53 Resolver endpoints bridge cloud and on-premises DNS.',
          bullets: [
            'Inbound endpoint — lets on-premises systems resolve AWS private hosted zone records (queries flow INTO the VPC).',
            'Outbound endpoint + Resolver rules — forwards queries for on-premises domains FROM the VPC to your on-premises DNS servers.',
            'Centralize resolver endpoints in a shared-services VPC and share rules across accounts with AWS Resource Access Manager (RAM) to avoid per-account duplication.',
            'For service-to-service private access, pair Route 53 private hosted zones with VPC interface endpoints (PrivateLink).',
          ],
        },
        {
          heading: 'Choosing Regions and Availability Zones',
          body: 'Network and latency requirements drive Region and AZ choices as much as feature availability.',
          bullets: [
            'Place workloads in the Region closest to the majority of users to minimize latency; use multiple Regions for global reach, data sovereignty, or DR.',
            'Spread tiers across multiple AZs for high availability — AZs are isolated failure domains within a Region.',
            'Use Local Zones or Wavelength when single-digit-millisecond latency to a metro or 5G edge is required.',
            'Cross-Region data transfer has cost and latency implications — model it before committing to a multi-Region design.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company shares an internal fraud-scoring API with 40 consumer VPCs across many accounts. Consumers must call only that one API and must NOT have network access to the rest of the provider VPC. What is the BEST design?',
          options: [
            'Peer every consumer VPC with the provider VPC',
            'Expose the API through AWS PrivateLink as an interface endpoint service',
            'Attach all VPCs to a Transit Gateway with full routing',
            'Publish the API to the public internet with an allow-list of IPs',
          ],
          correct: 1,
          explainCorrect: 'Correct — PrivateLink exposes exactly one service to consumers over an interface endpoint, with no broader network connectivity, which is precisely the least-privilege requirement.',
          elaborativePrompt: 'Why do both peering and Transit Gateway grant more access than this requirement asks for? Think about what "network-level connectivity" means versus "access to one service."',
        },
        {
          afterSection: 2,
          question: 'A workload requires consistent low latency and high dedicated bandwidth to on-premises, with no single point of failure. Which option BEST meets this?',
          options: [
            'A single Direct Connect connection',
            'A single Site-to-Site VPN tunnel',
            'Two Direct Connect connections at different DX locations',
            'Internet egress through a NAT gateway',
          ],
          correct: 2,
          explainCorrect: 'Correct — two Direct Connect connections at different locations deliver dedicated bandwidth and low latency while removing the single point of failure that one DX represents.',
          elaborativePrompt: 'When would a single DX with a VPN backup be the better answer instead of two DX connections? Consider cost versus the bandwidth guarantee during failover.',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate why VPC peering becomes unmanageable past a handful of VPCs, and what specifically Transit Gateway changes about the routing model.',
      sample: {
        type: 'multiple-choice',
        stem: 'A global company runs 25 VPCs spread across four AWS accounts and three Regions. All VPCs must communicate with each other and with two on-premises data centers. The networking team needs a solution that scales without a mesh of point-to-point links and supports transitive routing between VPCs, VPNs, and Direct Connect. Which design BEST meets these requirements?',
        options: [
          'Create VPC peering connections between all VPCs and attach VPN connections to each VPC individually',
          'Deploy a Transit Gateway in each Region, attach all in-Region VPCs and the hybrid links to it, and peer the Transit Gateways across Regions',
          'Use AWS PrivateLink to connect every VPC to every other VPC',
          'Route all inter-VPC traffic through a single NAT gateway in a central VPC',
        ],
        correct: 1,
        explanation: {
          summary: 'A regional Transit Gateway acts as a hub that provides transitive routing among all attached VPCs, VPNs, and Direct Connect gateways. Inter-Region Transit Gateway peering then connects the Regions, giving a scalable hub-of-hubs that avoids the O(n²) mesh of peering.',
          perOption: [
            'A full peering mesh does not scale to 25 VPCs and peering is non-transitive, so it cannot route between VPCs and the hybrid links the way the requirement demands.',
            'Correct — per-Region Transit Gateways with inter-Region peering deliver transitive routing across VPCs, VPN, and Direct Connect, and scale cleanly as VPCs are added.',
            'PrivateLink shares a single service via an interface endpoint; it is not a general-purpose any-to-any network connectivity solution.',
            'A NAT gateway provides outbound internet access, not private inter-VPC routing, and a single central NAT is a bottleneck and single point of failure.',
          ],
          link: 'D1 · Task 1.1 — Network connectivity strategies (Transit Gateway, transitive routing, hybrid links)',
        },
      },
      videos: [
        {
          videoId: 'hyEw7dQ9-JE',
          title: 'AWS Solutions Architect Professional (SAP-C02) Certification Course — Pass the Exam!',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full SAP-C02 curriculum companion (Andrew Brown / ExamPro) — pairs with every session in this course.',
        },
      ],
      keyTerms: [
        { term: 'Transit Gateway', def: 'A regional network hub that connects VPCs, VPNs, and Direct Connect with transitive routing, replacing a mesh of peering connections.' },
        { term: 'VPC peering', def: 'A one-to-one, non-transitive connection between two VPCs; simple and cheap but does not scale to many VPCs.' },
        { term: 'AWS PrivateLink', def: 'Private, one-way access to a single service via an interface endpoint, without exposing the rest of the provider VPC.' },
        { term: 'Direct Connect (DX)', def: 'A dedicated private network link between on-premises and AWS offering consistent latency and bandwidth.' },
        { term: 'Route 53 Resolver endpoint', def: 'Inbound/outbound DNS endpoints that bridge on-premises and AWS DNS resolution in hybrid architectures.' },
      ],
      awsServices: [
        { name: 'AWS Transit Gateway', purpose: 'Central hub for transitive routing among many VPCs, VPNs, and Direct Connect gateways across accounts and Regions.' },
        { name: 'AWS Direct Connect', purpose: 'Dedicated private connectivity from on-premises to AWS with predictable performance.' },
        { name: 'AWS Site-to-Site VPN', purpose: 'Encrypted IPsec tunnels over the internet; quick to deploy and a common DX backup.' },
        { name: 'AWS PrivateLink', purpose: 'Exposes a single service to consumer VPCs/accounts via interface endpoints with no broader network access.' },
        { name: 'Amazon Route 53 Resolver', purpose: 'Hybrid DNS resolution between AWS VPCs and on-premises DNS using inbound/outbound endpoints and rules.' },
      ],
      examTips: [
        'Many VPCs/accounts + transitive routing + hybrid links → Transit Gateway hub, not a peering mesh.',
        'Share ONE service without network-level access to the whole VPC → PrivateLink interface endpoint.',
        'Resilient hybrid link → DX with a VPN backup, or two DX at different locations. A single DX is a SPOF.',
        'On-premises must resolve AWS private records → Route 53 Resolver inbound endpoint; VPC must resolve on-prem names → outbound endpoint + rules.',
        'VPC peering is non-transitive — A↔B and B↔C never implies A↔C.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Design Solutions for Organizational Complexity',
      domain: 'd1',
      weight: '26%',
      task: 'Task 1.2',
      title: 'Security and Identity Across Many Accounts',
      duration: 30,
      summary: 'Once accounts multiply, identity and security must be centralized or they become unmanageable. This session covers workforce identity with IAM Identity Center, cross-account access with roles, federation with third-party IdPs, encryption with KMS and ACM, and a centralized model for security findings and audit.',
      objectives: [
        'Design cross-account access using IAM roles and trust policies instead of long-lived users',
        'Use IAM Identity Center for centralized workforce sign-in and permission sets across all accounts',
        'Integrate third-party identity providers via SAML 2.0 / OIDC federation',
        'Choose encryption strategies for data at rest and in transit with AWS KMS and ACM',
        'Centralize security findings and audit with Security Hub, GuardDuty, CloudTrail, and IAM Access Analyzer',
      ],
      preLearningCheck: {
        question: 'A company with 50 AWS accounts wants employees to sign in once with their corporate credentials and receive role-appropriate access in each account. Which AWS service is designed for this?',
        options: [
          'Create IAM users in every account for each employee',
          'AWS IAM Identity Center integrated with the corporate identity provider',
          'Amazon Cognito user pools',
          'A shared root account password',
        ],
        correct: 1,
        note: 'Take a guess first — retrieval practice strengthens memory even when the guess is wrong.',
      },
      sections: [
        {
          heading: 'The identity problem at organizational scale',
          body: 'IAM users do not scale across an organization: 50 accounts × hundreds of employees means thousands of long-lived credentials to rotate, audit, and de-provision. The Professional answer is almost always centralized, federated, role-based access with short-lived credentials.\n\nTwo distinct audiences: workforce identities (your employees) and workload/cross-account access (services and roles assuming into other accounts). They use different tools.',
        },
        {
          heading: 'Workforce identity: IAM Identity Center',
          body: 'AWS IAM Identity Center (successor to AWS SSO) is the front door for human sign-in across an AWS Organization.',
          bullets: [
            'Connect an external IdP (Okta, Entra ID, Ping) or use the built-in directory; employees sign in once.',
            'Permission sets define what a user can do; assign them to users/groups per account — no per-account IAM users.',
            'Access is delivered as short-lived role credentials, automatically rotated.',
            'De-provisioning a user in the IdP removes their access everywhere at once.',
          ],
          callout: { type: 'tip', text: 'Exam signal: "single sign-on across many accounts," "centralized workforce access," "use existing corporate directory" → IAM Identity Center with permission sets.' },
        },
        {
          heading: 'Cross-account access and federation with roles',
          body: 'For programmatic and cross-account access, IAM roles with trust policies are the mechanism. A principal in account A assumes a role in account B; the role\'s trust policy says who may assume it, and its permissions policy says what they can do.',
          table: {
            headers: ['Need', 'Mechanism'],
            rows: [
              ['App in account A reads an S3 bucket in account B', 'Cross-account IAM role in B that A assumes via sts:AssumeRole'],
              ['External SaaS vendor accesses your account', 'IAM role with a trust policy requiring an ExternalId to prevent the confused-deputy problem'],
              ['Employees from a corporate IdP get console access', 'SAML 2.0 / OIDC federation (often fronted by IAM Identity Center)'],
              ['Mobile/web app end users', 'Amazon Cognito identity pools — NOT IAM users'],
            ],
          },
          callout: { type: 'warning', text: 'When a third party assumes a role in your account, require an ExternalId in the trust policy. Without it, a malicious actor who learns your role ARN could be impersonated by the vendor (the confused-deputy problem).' },
        },
        {
          heading: 'Encryption: KMS and ACM',
          body: 'Data-at-rest and data-in-transit encryption is expected on every Professional design. The choice is about key control and certificate management.',
          table: {
            headers: ['Concern', 'Service / pattern'],
            rows: [
              ['Encrypt data at rest (S3, EBS, RDS, etc.)', 'AWS KMS keys — AWS-managed for simplicity, customer-managed (CMK) for control, rotation, and policy'],
              ['Strict regulatory key control / imported key material', 'KMS with imported key material or AWS CloudHSM'],
              ['Share encrypted resources across accounts', 'Customer-managed KMS key with a key policy granting the other account'],
              ['TLS certificates for ALB/CloudFront/API Gateway', 'AWS Certificate Manager (ACM) — free public certs, auto-renewed'],
              ['Private internal certificates', 'ACM Private CA'],
            ],
          },
        },
        {
          heading: 'Centralized security findings and audit',
          body: 'A multi-account org needs one place to see security posture, not 50. Aggregate via a delegated administrator account.',
          bullets: [
            'AWS Security Hub — aggregates findings across accounts/Regions and runs standards checks (CIS, AWS FSBP).',
            'Amazon GuardDuty — threat detection from VPC, DNS, and CloudTrail logs; enable org-wide with auto-enrollment.',
            'AWS CloudTrail — an organization trail logs API activity from all accounts to a central, locked-down S3 bucket.',
            'IAM Access Analyzer — flags resources shared outside your account/organization (external access).',
            'Amazon Inspector — continuous vulnerability scanning for EC2, ECR images, and Lambda.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A SaaS provider needs to assume a role in your AWS account to manage resources on your behalf. What should the role\'s trust policy include to prevent the confused-deputy problem?',
          options: [
            'A condition requiring a unique ExternalId supplied by you',
            'A longer session duration',
            'MFA on the SaaS provider\'s root account',
            'A NAT gateway in the SaaS provider\'s VPC',
          ],
          correct: 0,
          explainCorrect: 'Correct — requiring an ExternalId in the trust policy ensures the third party can only assume the role when presenting the agreed secret, preventing impersonation if your role ARN leaks.',
          elaborativePrompt: 'Explain the confused-deputy problem in your own words: who is the "deputy," and how does the ExternalId stop it?',
        },
        {
          afterSection: 4,
          question: 'A security team wants a single, centralized view of GuardDuty and other findings across all 60 accounts in the organization. What is the BEST approach?',
          options: [
            'Log in to each account daily and review findings',
            'Enable Security Hub with a delegated administrator account and organization-wide auto-enrollment',
            'Email findings from each account to a shared inbox',
            'Disable GuardDuty in member accounts to reduce noise',
          ],
          correct: 1,
          explainCorrect: 'Correct — Security Hub with a delegated administrator aggregates findings org-wide, and auto-enrollment ensures new accounts are covered automatically.',
          elaborativePrompt: 'Why is a delegated administrator account preferable to using the Organizations management account for this aggregation?',
        },
      ],
      selfExplanationPrompt: 'Explain why IAM users do not scale across an organization, and how IAM Identity Center plus cross-account roles replace them with short-lived, centrally managed access.',
      sample: {
        type: 'multiple-choice',
        stem: 'A large enterprise has 80 AWS accounts in AWS Organizations. Employees authenticate through the company\'s existing SAML identity provider. The security team requires: single sign-on into every account, role-based permissions managed centrally, no long-lived IAM credentials, and immediate revocation when an employee leaves. Which solution BEST meets these requirements?',
        options: [
          'Create IAM users and groups in each account and synchronize them with a script',
          'Configure AWS IAM Identity Center connected to the SAML identity provider, and assign permission sets to groups across accounts',
          'Share a set of cross-account IAM user access keys stored in AWS Secrets Manager',
          'Use Amazon Cognito user pools to grant employees console access',
        ],
        correct: 1,
        explanation: {
          summary: 'IAM Identity Center federates with the existing SAML IdP, delivers SSO across all Organization accounts, manages access centrally with permission sets, issues only short-lived role credentials, and revokes access immediately when the user is removed in the IdP.',
          perOption: [
            'Per-account IAM users are exactly the long-lived, unscalable model the requirements rule out, and a sync script does not provide SSO or instant revocation.',
            'Correct — IAM Identity Center with SAML federation and permission sets satisfies SSO, central management, no long-lived credentials, and instant revocation.',
            'Sharing IAM user access keys creates long-lived credentials and no per-user revocation — the opposite of the requirement.',
            'Cognito is for application end users, not workforce SSO and console access across many accounts.',
          ],
          link: 'D1 · Task 1.2 — Cross-account access, federation, and centralized identity',
        },
      },
      videos: [
        {
          videoId: 'hyEw7dQ9-JE',
          title: 'AWS Solutions Architect Professional (SAP-C02) Certification Course — Pass the Exam!',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full SAP-C02 curriculum companion — identity, federation, and security sections support this session.',
        },
      ],
      keyTerms: [
        { term: 'IAM Identity Center', def: 'Centralized workforce SSO across an AWS Organization, with permission sets and federation to external IdPs.' },
        { term: 'Permission set', def: 'A reusable definition of access (policies + session duration) assigned to users/groups per account in IAM Identity Center.' },
        { term: 'Cross-account role', def: 'An IAM role whose trust policy lets a principal in another account assume it via sts:AssumeRole.' },
        { term: 'ExternalId', def: 'A shared secret in a role trust policy that prevents the confused-deputy problem when a third party assumes the role.' },
        { term: 'Customer-managed KMS key (CMK)', def: 'A KMS key you control — its policy, rotation, and cross-account sharing — used when AWS-managed keys are insufficient.' },
      ],
      awsServices: [
        { name: 'AWS IAM Identity Center', purpose: 'Centralized SSO and permission management across all Organization accounts, federated with external IdPs.' },
        { name: 'AWS IAM (roles & STS)', purpose: 'Cross-account and federated access via assumable roles issuing short-lived credentials.' },
        { name: 'AWS KMS', purpose: 'Managed encryption keys for data at rest, with policy control, rotation, and cross-account sharing.' },
        { name: 'AWS Certificate Manager', purpose: 'Provisions and auto-renews TLS certificates for ALB, CloudFront, and API Gateway; ACM Private CA for internal certs.' },
        { name: 'AWS Security Hub', purpose: 'Aggregates security findings and standards checks across accounts and Regions via a delegated administrator.' },
      ],
      examTips: [
        'SSO across many accounts + existing corporate directory → IAM Identity Center with permission sets.',
        'Third party assumes a role in your account → require an ExternalId (confused-deputy defense).',
        'Application end users ≠ workforce: Cognito for app users, IAM Identity Center for employees.',
        'Share an encrypted resource cross-account → customer-managed KMS key with a key policy granting the other account.',
        'Org-wide security visibility → Security Hub + GuardDuty + organization CloudTrail under a delegated admin account.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Design Solutions for Organizational Complexity',
      domain: 'd1',
      weight: '26%',
      task: 'Task 1.3',
      title: 'Reliability, Resilience, and Disaster Recovery',
      duration: 30,
      summary: 'Disaster recovery is the single most reliably tested topic in this domain. This session locks in RTO and RPO, the four DR strategies and their cost/recovery trade-offs, AWS Elastic Disaster Recovery, automatic-recovery design, and when to scale up versus scale out.',
      objectives: [
        'Define RTO and RPO precisely and map them to a DR strategy',
        'Compare backup & restore, pilot light, warm standby, and multi-site active/active on cost vs. recovery time',
        'Apply AWS Elastic Disaster Recovery (DRS) for fast, low-RPO recovery of servers',
        'Design architectures that automatically recover from failure (health checks, Auto Scaling, Multi-AZ)',
        'Decide between scale-up (vertical) and scale-out (horizontal) for resilience and performance',
      ],
      preLearningCheck: {
        question: 'A business can tolerate at most 5 minutes of data loss and must be back online within 10 minutes after a regional failure. Which disaster recovery strategy BEST fits these aggressive RTO/RPO targets at reasonable cost?',
        options: [
          'Backup and restore',
          'Pilot light',
          'Warm standby',
          'Storing nightly backups in Amazon S3 Glacier',
        ],
        correct: 2,
        note: 'Guess first — the act of choosing primes you to remember the trade-offs as you read them.',
      },
      sections: [
        {
          heading: 'RTO and RPO: the two numbers that decide everything',
          body: 'Every DR question reduces to two requirements:\n\n• RTO (Recovery Time Objective) — how long you can be DOWN before the business is harmed.\n• RPO (Recovery Point Objective) — how much DATA you can afford to lose, measured backward from the failure.\n\nAggressive (small) RTO/RPO means more standing infrastructure and more cost. The exam gives you the numbers; your job is to pick the cheapest strategy that still meets them.',
          callout: { type: 'note', text: 'RTO is about time-to-recover; RPO is about data-loss tolerance. A 5-minute RPO means replication must be near-continuous; a 24-hour RPO means a nightly backup is fine.' },
        },
        {
          heading: 'The four DR strategies',
          body: 'Memorize the order from cheapest/slowest to most expensive/fastest. Each step trades money for a smaller RTO/RPO.',
          interactive: 'dr-strategy',
          table: {
            headers: ['Strategy', 'What runs in DR Region', 'RTO / RPO', 'Cost'],
            rows: [
              ['Backup & restore', 'Nothing standing; restore from backups on demand', 'Hours / hours', 'Lowest'],
              ['Pilot light', 'Core data replicated; minimal services off or tiny', 'Tens of minutes / minutes', 'Low'],
              ['Warm standby', 'A scaled-down but always-running copy', 'Minutes / seconds–minutes', 'Medium'],
              ['Multi-site active/active', 'Full production in both Regions, serving traffic', 'Near zero / near zero', 'Highest'],
            ],
          },
          callout: { type: 'tip', text: 'Map the requirement to the cheapest strategy that meets it: hours OK → backup & restore; minutes → pilot light or warm standby; near-zero → multi-site. Do not over-engineer to multi-site if warm standby meets the RTO.' },
        },
        {
          heading: 'AWS Elastic Disaster Recovery (DRS)',
          body: 'AWS Elastic Disaster Recovery continuously replicates servers (on-premises or cloud) into a low-cost staging area in AWS, then launches recovery instances on demand.',
          bullets: [
            'Continuous block-level replication gives a low RPO (seconds to minutes) without running full duplicate instances.',
            'Pay mainly for low-cost staging storage until you actually fail over — cheaper than warm standby for many server-based workloads.',
            'Good for lift-and-shift DR of EC2 or physical/virtual servers; non-disruptive drills validate the plan.',
            'Contrast with AWS Backup, which is point-in-time backup/restore (higher RPO), and with native database replication for data-tier DR.',
          ],
        },
        {
          heading: 'Designing for automatic recovery',
          body: 'Resilience is not just DR between Regions — it is surviving component failure within a Region without human intervention.',
          bullets: [
            'EC2 Auto Scaling across multiple AZs replaces unhealthy instances automatically using health checks.',
            'Elastic Load Balancing routes only to healthy targets and spreads load across AZs.',
            'Multi-AZ databases (RDS/Aurora) fail over to a standby automatically; read replicas can be promoted for cross-Region DR.',
            'Route 53 health checks with failover routing send users to a healthy endpoint or DR site.',
            'Decouple with SQS/SNS so a failed consumer does not lose work — messages wait in the queue.',
          ],
        },
        {
          heading: 'Scale up vs. scale out',
          body: 'When the optimal architecture is in question, distinguish the two axes of growth.',
          table: {
            headers: ['Approach', 'Meaning', 'Best for'],
            rows: [
              ['Scale up (vertical)', 'Bigger instance — more CPU/RAM', 'Workloads that cannot easily distribute (some databases); quick headroom'],
              ['Scale out (horizontal)', 'More instances behind a load balancer', 'Stateless tiers; elasticity, fault tolerance, and near-unlimited growth'],
            ],
          },
          callout: { type: 'warning', text: 'Scaling up has a ceiling and the instance is still a single point of failure. For resilience and elasticity, the Professional answer favors scaling out across AZs whenever the workload can be made stateless.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company keeps a full production copy running in a second Region, serving live traffic alongside the primary. Which DR strategy is this, and what RTO/RPO does it provide?',
          options: [
            'Backup & restore — hours RTO/RPO',
            'Pilot light — tens of minutes RTO',
            'Multi-site active/active — near-zero RTO/RPO',
            'Warm standby — minutes RTO',
          ],
          correct: 2,
          explainCorrect: 'Correct — running full production in both Regions serving traffic is multi-site active/active, giving near-zero RTO and RPO at the highest cost.',
          elaborativePrompt: 'For a workload where hours of downtime is acceptable, why would choosing multi-site be a poor architectural decision even though it "works"?',
        },
        {
          afterSection: 3,
          question: 'Which AWS service continuously replicates entire servers into a low-cost staging area and launches recovery instances only when you fail over?',
          options: [
            'AWS Backup',
            'AWS Elastic Disaster Recovery (DRS)',
            'Amazon S3 Glacier Deep Archive',
            'AWS Snowball',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Elastic Disaster Recovery continuously replicates servers to low-cost staging and spins up recovery instances on failover, giving low RPO without paying for full standby instances.',
          elaborativePrompt: 'How does DRS achieve a lower RPO than nightly AWS Backup while costing less than a full warm standby?',
        },
      ],
      selfExplanationPrompt: 'Explain RTO and RPO to a colleague using a concrete example, then describe how each of the four DR strategies trades cost for a smaller RTO/RPO.',
      sample: {
        type: 'multiple-choice',
        stem: 'A financial services application must recover in a second AWS Region within 10 minutes (RTO) with no more than 1 minute of data loss (RPO). The business wants to avoid paying for a full duplicate of the production fleet but accepts running a reduced-capacity environment continuously. Which DR strategy BEST meets these requirements at the lowest cost?',
        options: [
          'Backup and restore from cross-Region snapshots',
          'Pilot light with databases replicated and application servers switched off',
          'Warm standby running a scaled-down but always-on copy with continuous data replication, scaled up on failover',
          'Multi-site active/active with full production capacity in both Regions',
        ],
        correct: 2,
        explanation: {
          summary: 'Warm standby keeps a smaller always-running copy with continuous replication, so it can meet a ~1-minute RPO and a ~10-minute RTO (scale up the standby on failover) without the cost of full active/active. It is the cheapest option that satisfies both targets.',
          perOption: [
            'Backup and restore recovers in hours, far exceeding the 10-minute RTO.',
            'Pilot light with servers switched off typically needs more than 10 minutes to provision and scale the application tier, risking the RTO.',
            'Correct — warm standby (scaled-down, always-on, continuously replicated) meets the 1-minute RPO and 10-minute RTO while avoiding the cost of full duplication.',
            'Multi-site active/active meets the targets but costs the most, and the business explicitly wants to avoid a full duplicate fleet.',
          ],
          link: 'D1 · Task 1.3 — DR strategy selection by RTO/RPO and cost',
        },
      },
      videos: [
        {
          videoId: 'hyEw7dQ9-JE',
          title: 'AWS Solutions Architect Professional (SAP-C02) Certification Course — Pass the Exam!',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full SAP-C02 curriculum companion — disaster recovery and resilience sections support this session.',
        },
      ],
      keyTerms: [
        { term: 'RTO', def: 'Recovery Time Objective — the maximum acceptable time to restore service after a disruption.' },
        { term: 'RPO', def: 'Recovery Point Objective — the maximum acceptable amount of data loss, measured backward from the moment of failure.' },
        { term: 'Pilot light', def: 'A DR strategy where core data is replicated and minimal services idle, ready to scale up on failover.' },
        { term: 'Warm standby', def: 'A DR strategy running a scaled-down but always-on copy that is scaled up on failover for a low RTO.' },
        { term: 'AWS Elastic Disaster Recovery (DRS)', def: 'Continuous server replication into low-cost staging, launching recovery instances on demand for a low RPO.' },
      ],
      awsServices: [
        { name: 'AWS Elastic Disaster Recovery', purpose: 'Continuous block-level server replication with on-demand failover for low-RPO DR at low standing cost.' },
        { name: 'AWS Backup', purpose: 'Centralized, policy-based point-in-time backup and restore across many AWS services and accounts.' },
        { name: 'Amazon Route 53', purpose: 'Health checks and failover routing to direct users to a healthy endpoint or DR Region.' },
        { name: 'Amazon RDS / Aurora', purpose: 'Multi-AZ automatic failover and cross-Region read replicas for database resilience and DR.' },
        { name: 'EC2 Auto Scaling', purpose: 'Automatically replaces unhealthy instances across AZs for self-healing capacity.' },
      ],
      examTips: [
        'Match RTO/RPO to the CHEAPEST strategy that meets them — do not default to multi-site.',
        'Hours OK → backup & restore; minutes → pilot light/warm standby; near-zero → multi-site active/active.',
        'Low RPO without full standby instances for server workloads → AWS Elastic Disaster Recovery.',
        'Automatic in-Region recovery → Multi-AZ + Auto Scaling + ELB health checks + Route 53 failover.',
        'Scale out (stateless, across AZs) beats scale up when resilience and elasticity matter.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Design Solutions for Organizational Complexity',
      domain: 'd1',
      weight: '26%',
      task: 'Task 1.4',
      title: 'Designing a Multi-Account AWS Environment',
      duration: 30,
      summary: 'A single AWS account cannot isolate teams, limit blast radius, or enforce guardrails at scale. This session covers AWS Organizations and Control Tower, organizational units and service control policies, resource sharing with RAM, and a centralized logging and governance model.',
      objectives: [
        'Justify a multi-account strategy: isolation, blast-radius reduction, billing, and governance',
        'Structure accounts into organizational units (OUs) and apply service control policies (SCPs)',
        'Use AWS Control Tower to set up a governed landing zone with guardrails',
        'Share resources across accounts with AWS Resource Access Manager (RAM)',
        'Centralize logging, event notifications, and governance across the organization',
      ],
      preLearningCheck: {
        question: 'An organization wants to guarantee that no account in its "Sandbox" group can ever create resources outside approved Regions, regardless of the IAM permissions an account admin grants. Which mechanism enforces this?',
        options: [
          'An IAM policy attached to each user',
          'A service control policy (SCP) applied to the Sandbox organizational unit',
          'A security group rule',
          'A bucket policy',
        ],
        correct: 1,
        note: 'Guess first — predicting the answer improves retention even if you are wrong.',
      },
      sections: [
        {
          heading: 'Why one account is not enough',
          body: 'A single account forces every team, environment, and workload to share one blast radius, one set of service quotas, and one IAM boundary. Multi-account design uses account boundaries as the strongest isolation primitive AWS offers.',
          bullets: [
            'Isolation — separate prod from dev/test; a mistake in one account cannot touch another.',
            'Blast radius — a compromised or misconfigured account is contained.',
            'Billing and chargeback — per-account cost attribution to teams/business units.',
            'Governance — apply different guardrails to different account groups.',
          ],
        },
        {
          heading: 'Organizations, OUs, and SCPs',
          body: 'AWS Organizations groups accounts into a hierarchy of organizational units (OUs). Service control policies (SCPs) set the maximum permissions any principal in those accounts can have.',
          table: {
            headers: ['Concept', 'Role'],
            rows: [
              ['Management account', 'Root of the org; pays the consolidated bill; should run no workloads'],
              ['Organizational unit (OU)', 'A group of accounts (e.g. Prod, Dev, Sandbox, Security) that share guardrails'],
              ['Service control policy (SCP)', 'A guardrail that caps permissions — it can deny, but never grants access'],
              ['Consolidated billing', 'One bill for all accounts, with volume discounts and shared Reserved Instances/Savings Plans'],
            ],
          },
          callout: { type: 'warning', text: 'An SCP is a permission CEILING, not a grant. Even if an account admin attaches AdministratorAccess, an SCP that denies a Region or service still blocks it. SCPs do not apply to the management account — keep workloads out of it.' },
        },
        {
          heading: 'AWS Control Tower: the governed landing zone',
          body: 'Control Tower automates a well-architected multi-account setup so you do not build it by hand.',
          bullets: [
            'Sets up a multi-account landing zone with a Security OU (log archive + audit accounts) out of the box.',
            'Applies preventive guardrails (SCPs) and detective guardrails (AWS Config rules) from a curated library.',
            'Account Factory provisions new accounts that are compliant from creation.',
            'Use Control Tower when you want an opinionated, automated baseline; use raw Organizations + SCPs when you need full custom control.',
          ],
        },
        {
          heading: 'Sharing resources with RAM',
          body: 'Instead of duplicating infrastructure in every account, AWS Resource Access Manager (RAM) shares specific resources across accounts in the organization.',
          bullets: [
            'Share a Transit Gateway, subnets (VPC sharing), Route 53 Resolver rules, License Manager configs, and more.',
            'A common pattern: a central networking account owns the Transit Gateway and shares it via RAM to all workload accounts.',
            'VPC sharing lets multiple accounts deploy into subnets of a centrally managed VPC, reducing VPC sprawl.',
          ],
        },
        {
          heading: 'Centralized logging and governance',
          body: 'Governance at scale means one place to look and one set of rules enforced everywhere.',
          bullets: [
            'Organization CloudTrail → a central, immutable S3 bucket in a dedicated log-archive account.',
            'Aggregate Config, GuardDuty, and Security Hub into a delegated administrator (audit) account.',
            'Use EventBridge to route cross-account events (e.g. compliance changes) to a central handler.',
            'Tagging policies and SCPs enforce consistent tagging and resource standards across all accounts.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company wants new AWS accounts to be created already compliant, with a log-archive and audit account, preventive and detective guardrails, and a standard structure — without building it all manually. Which service is purpose-built for this?',
          options: [
            'AWS Control Tower',
            'AWS Config',
            'AWS Systems Manager',
            'Amazon Inspector',
          ],
          correct: 0,
          explainCorrect: 'Correct — Control Tower sets up a governed landing zone with a Security OU, guardrails, and Account Factory for compliant-by-default account provisioning.',
          elaborativePrompt: 'When would you choose raw AWS Organizations with hand-built SCPs over Control Tower? Think about customization versus speed.',
        },
        {
          afterSection: 3,
          question: 'A central networking account owns a Transit Gateway that all workload accounts must attach to. What is the BEST way to grant the other accounts access to it?',
          options: [
            'Recreate the Transit Gateway in every account',
            'Share the Transit Gateway with the organization using AWS Resource Access Manager (RAM)',
            'Make the Transit Gateway public',
            'Copy the route tables into each account manually',
          ],
          correct: 1,
          explainCorrect: 'Correct — RAM shares the Transit Gateway from the owning account to the rest of the organization, avoiding duplication while keeping central ownership.',
          elaborativePrompt: 'Why is central ownership of the Transit Gateway with RAM sharing better than each account owning its own?',
        },
      ],
      selfExplanationPrompt: 'Explain why a service control policy is a "permission ceiling" rather than a grant, and give an example where an SCP blocks an action even though IAM allows it.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is expanding to 40 AWS accounts. Leadership requires: production accounts must be prevented from using any Region outside us-east-1 and eu-west-1; all API activity must be logged to a central immutable location; and new accounts must be provisioned with this governance already in place. Which combination BEST meets these requirements?',
        options: [
          'Attach IAM policies in each account restricting Regions, and enable CloudTrail separately per account',
          'Use AWS Control Tower for the landing zone, apply a Region-restriction SCP to the Production OU, and send an organization CloudTrail to a central log-archive account',
          'Use security groups to block Regions and store logs in each account\'s own S3 bucket',
          'Grant every account AdministratorAccess and rely on training to avoid disallowed Regions',
        ],
        correct: 1,
        explanation: {
          summary: 'Control Tower provisions governed accounts with a central log archive; a Region-restriction SCP on the Production OU is an enforced ceiling no account admin can override; and an organization CloudTrail centralizes immutable logs. Together they satisfy all three requirements and apply automatically to new accounts.',
          perOption: [
            'Per-account IAM policies can be changed by account admins and do not enforce an org-wide ceiling, and per-account CloudTrail is not centralized or guaranteed.',
            'Correct — Control Tower + Region SCP on the Production OU + organization CloudTrail to a log-archive account enforce all requirements and extend automatically to new accounts.',
            'Security groups control network traffic, not which Regions can be used, and per-account log buckets are not centralized or immutable by default.',
            'Relying on training provides no enforcement and violates least privilege.',
          ],
          link: 'D1 · Task 1.4 — Multi-account governance with Organizations, SCPs, and Control Tower',
        },
      },
      videos: [
        {
          videoId: 'hyEw7dQ9-JE',
          title: 'AWS Solutions Architect Professional (SAP-C02) Certification Course — Pass the Exam!',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full SAP-C02 curriculum companion — Organizations, Control Tower, and governance sections support this session.',
        },
      ],
      keyTerms: [
        { term: 'AWS Organizations', def: 'Service for grouping and centrally governing multiple AWS accounts with consolidated billing.' },
        { term: 'Organizational unit (OU)', def: 'A group of accounts within an organization that share guardrails and policies.' },
        { term: 'Service control policy (SCP)', def: 'A guardrail that caps the maximum permissions of accounts/OUs; it can deny but never grants access.' },
        { term: 'AWS Control Tower', def: 'Automated setup of a governed multi-account landing zone with guardrails and Account Factory.' },
        { term: 'AWS Resource Access Manager (RAM)', def: 'Shares specific resources (Transit Gateway, subnets, Resolver rules) across accounts in an organization.' },
      ],
      awsServices: [
        { name: 'AWS Organizations', purpose: 'Central management of many accounts, OUs, consolidated billing, and SCP guardrails.' },
        { name: 'AWS Control Tower', purpose: 'Provisions and governs a multi-account landing zone with preventive and detective guardrails.' },
        { name: 'AWS Resource Access Manager', purpose: 'Shares resources such as Transit Gateways and subnets across organization accounts.' },
        { name: 'AWS CloudTrail (organization trail)', purpose: 'Logs API activity from all accounts to a central, immutable S3 bucket.' },
        { name: 'AWS Config', purpose: 'Detective guardrails that evaluate resource compliance across accounts.' },
      ],
      examTips: [
        'Enforce an org-wide restriction no admin can override → SCP on the relevant OU (a ceiling, not a grant).',
        'Compliant-by-default new accounts + landing zone → AWS Control Tower with Account Factory.',
        'Share a Transit Gateway or subnets across accounts → AWS Resource Access Manager (RAM).',
        'Central immutable audit logs → organization CloudTrail to a dedicated log-archive account.',
        'Keep workloads OUT of the management account — SCPs do not restrict it.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s5',
      number: 5,
      module: 'Domain 1 · Design Solutions for Organizational Complexity',
      domain: 'd1',
      weight: '26%',
      task: 'Task 1.5',
      title: 'Cost Optimization and Visibility at Scale',
      duration: 30,
      summary: 'At organizational scale, cost is an architecture concern. This session covers the cost-visibility toolset, the purchasing options that drive the biggest savings (Savings Plans, Reserved Instances, Spot), rightsizing with Compute Optimizer and S3 Storage Lens, and a tagging strategy that maps spend to business units.',
      objectives: [
        'Use Cost Explorer, AWS Budgets, Trusted Advisor, and the Pricing Calculator for visibility and forecasting',
        'Choose among On-Demand, Savings Plans, Reserved Instances, and Spot for a given usage pattern',
        'Rightsize with AWS Compute Optimizer and analyze storage with S3 Storage Lens',
        'Design a tagging strategy and cost allocation tags that map spend to business units',
        'Leverage consolidated billing for volume discounts and shared commitments',
      ],
      preLearningCheck: {
        question: 'A company runs a steady, predictable baseline of compute 24/7 across several instance families and wants the largest discount while keeping flexibility to change instance types. Which purchasing option fits BEST?',
        options: [
          'On-Demand Instances',
          'Compute Savings Plans',
          'Spot Instances',
          'Standard Reserved Instances for one specific instance type',
        ],
        correct: 1,
        note: 'Guess first — retrieval practice strengthens memory even when the guess is wrong.',
      },
      sections: [
        {
          heading: 'Cost is an architectural requirement',
          body: 'On the Professional exam, "the cheapest option that meets the requirements" is frequently the credited answer. You must know both the visibility tools (to find waste) and the purchasing levers (to cut the bill) and apply them at organization scale.',
        },
        {
          heading: 'The cost-visibility toolset',
          body: 'Different tools answer different questions. Match the tool to the question.',
          table: {
            headers: ['Tool', 'Answers'],
            rows: [
              ['AWS Cost Explorer', 'Where has my spend gone, and what is the trend/forecast?'],
              ['AWS Budgets', 'Alert me (or take action) when spend or usage crosses a threshold'],
              ['AWS Cost and Usage Report (CUR)', 'The most granular line-item data, for deep analysis in Athena/QuickSight'],
              ['AWS Pricing Calculator', 'Estimate the cost of a design BEFORE building it'],
              ['AWS Trusted Advisor', 'Recommendations including idle/underused resources and cost optimization checks'],
            ],
          },
        },
        {
          heading: 'Purchasing options: the biggest lever',
          body: 'Matching the purchasing model to the usage pattern is where the savings are. This recurs across the whole exam.',
          table: {
            headers: ['Option', 'Discount vs On-Demand', 'Use when'],
            rows: [
              ['On-Demand', 'None', 'Short-term, spiky, or unpredictable workloads'],
              ['Compute Savings Plans', 'Up to ~66%, flexible across instance family/Region/compute type', 'Steady baseline where you want commitment savings with flexibility'],
              ['EC2 Instance Savings Plans / Standard RIs', 'Up to ~72%, less flexible', 'Very stable, known instance family in a Region'],
              ['Spot Instances', 'Up to ~90%', 'Fault-tolerant, interruptible workloads (batch, CI, stateless web with capacity-rebalancing)'],
            ],
          },
          callout: { type: 'tip', text: 'Flexibility vs. discount: Compute Savings Plans trade a little discount for the freedom to change instance families and Regions. Spot is cheapest but can be reclaimed — only for interruption-tolerant work.' },
        },
        {
          heading: 'Rightsizing and storage analytics',
          body: 'The cheapest instance is the one you do not over-provision. Visibility drives rightsizing.',
          bullets: [
            'AWS Compute Optimizer — analyzes utilization and recommends better-sized EC2, Auto Scaling, EBS, and Lambda configurations.',
            'Amazon S3 Storage Lens — organization-wide visibility into S3 usage and activity, surfacing cost-saving opportunities (e.g. incomplete multipart uploads, cold data to tier down).',
            'S3 lifecycle policies and Intelligent-Tiering move objects to cheaper classes automatically.',
            'Rightsize first, THEN commit to Savings Plans/RIs — committing to oversized capacity locks in waste.',
          ],
        },
        {
          heading: 'Tagging and consolidated billing',
          body: 'You cannot optimize what you cannot attribute. Tags and consolidated billing make cost visible per team and unlock org-wide discounts.',
          bullets: [
            'Define a tagging strategy (e.g. CostCenter, Project, Environment, Owner) and activate them as cost allocation tags.',
            'Enforce tagging with Organizations tag policies and SCPs so untagged spend does not slip through.',
            'Consolidated billing aggregates all accounts into one bill, with volume tiering and shared Savings Plans/RIs benefiting the whole org.',
            'Cost categories in Cost Explorer group spend into business-meaningful buckets for chargeback/showback.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A nightly batch job is fully fault-tolerant and can resume if interrupted. The company wants the lowest possible compute cost. Which purchasing option is BEST?',
          options: [
            'On-Demand Instances',
            'Standard Reserved Instances',
            'Spot Instances',
            'Compute Savings Plans',
          ],
          correct: 2,
          explainCorrect: 'Correct — Spot Instances offer the deepest discount (up to ~90%) and are ideal for fault-tolerant, interruptible workloads like a resumable nightly batch.',
          elaborativePrompt: 'Why would Spot be the wrong choice for a steady-state, always-on production database, even though it is cheapest?',
        },
        {
          afterSection: 3,
          question: 'A company wants automatic recommendations to rightsize over-provisioned EC2 instances and EBS volumes based on actual utilization. Which service provides this?',
          options: [
            'AWS Pricing Calculator',
            'AWS Compute Optimizer',
            'AWS Budgets',
            'Amazon Inspector',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Compute Optimizer analyzes utilization metrics and recommends optimal EC2, Auto Scaling, EBS, and Lambda configurations to cut waste.',
          elaborativePrompt: 'Why should you rightsize with Compute Optimizer BEFORE buying Savings Plans or Reserved Instances?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague how you would decide between Compute Savings Plans, Reserved Instances, and Spot for three different workloads: a 24/7 baseline, a fixed database tier, and a fault-tolerant batch job.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company with 30 accounts under AWS Organizations wants to: see cost broken down by business unit, prevent any single account from exceeding its monthly budget without alerting finance, and obtain the largest sustainable discount on a steady 24/7 compute baseline that spans several instance families. Which combination BEST meets these goals?',
        options: [
          'Activate cost allocation tags with a tag policy, set AWS Budgets alerts per account, and purchase Compute Savings Plans for the baseline',
          'Rely on the consolidated bill total, check Cost Explorer manually each month, and buy Spot Instances for the baseline',
          'Use Standard Reserved Instances for one instance type and disable tagging to reduce complexity',
          'Give each account its own bill and purchase On-Demand only',
        ],
        correct: 0,
        explanation: {
          summary: 'Cost allocation tags (enforced by a tag policy) attribute spend to business units; per-account AWS Budgets alert finance before overruns; and Compute Savings Plans give the largest sustainable discount for a steady baseline while staying flexible across instance families. The combination meets all three goals.',
          perOption: [
            'Correct — tags + tag policy for attribution, AWS Budgets for alerting, and Compute Savings Plans for a flexible steady-state discount address every requirement.',
            'Spot is inappropriate for an always-on baseline (it can be reclaimed), and manual monthly checks do not alert finance proactively.',
            'A single-instance-type RI lacks the flexibility for several families, and disabling tagging defeats per-business-unit attribution.',
            'Separate bills lose consolidated volume discounts, and On-Demand-only forgoes the requested baseline discount.',
          ],
          link: 'D1 · Task 1.5 — Cost visibility, purchasing options, and tagging at scale',
        },
      },
      videos: [
        {
          videoId: 'hyEw7dQ9-JE',
          title: 'AWS Solutions Architect Professional (SAP-C02) Certification Course — Pass the Exam!',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full SAP-C02 curriculum companion — billing, purchasing options, and cost optimization sections support this session.',
        },
      ],
      keyTerms: [
        { term: 'Compute Savings Plans', def: 'A commitment to a steady dollar-per-hour of compute for 1 or 3 years, flexible across instance family, size, Region, and compute type.' },
        { term: 'Spot Instances', def: 'Spare EC2 capacity at up to ~90% discount that AWS can reclaim with short notice — for fault-tolerant workloads.' },
        { term: 'Cost allocation tags', def: 'Tags activated for billing so spend can be grouped and reported by team, project, or environment.' },
        { term: 'AWS Compute Optimizer', def: 'Recommends rightsized EC2, Auto Scaling, EBS, and Lambda configurations from real utilization data.' },
        { term: 'Consolidated billing', def: 'One bill across all Organization accounts, with volume tiering and shared Savings Plans/RIs.' },
      ],
      awsServices: [
        { name: 'AWS Cost Explorer', purpose: 'Visualizes spend, trends, and forecasts, and groups cost with cost categories.' },
        { name: 'AWS Budgets', purpose: 'Threshold-based cost/usage alerts and automated actions per account or scope.' },
        { name: 'AWS Compute Optimizer', purpose: 'Utilization-based rightsizing recommendations to remove over-provisioning.' },
        { name: 'Amazon S3 Storage Lens', purpose: 'Organization-wide S3 usage and activity analytics surfacing storage cost savings.' },
        { name: 'AWS Pricing Calculator', purpose: 'Estimates the cost of an architecture before it is built.' },
      ],
      examTips: [
        'Cheapest option that MEETS the requirement is usually the credited answer — match purchasing model to usage pattern.',
        'Steady baseline, want flexibility → Compute Savings Plans; fixed instance type → Reserved Instances; fault-tolerant → Spot.',
        'Rightsize with Compute Optimizer BEFORE committing to Savings Plans/RIs.',
        'Attribute spend to business units → cost allocation tags enforced by an Organizations tag policy.',
        'Estimate before building → Pricing Calculator; alert on overruns → AWS Budgets; analyze trend → Cost Explorer.',
      ],
    },

  ],
}

export default sapC02Course
