// AWS Certified Solutions Architect – Associate (SAA-C03) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors clfC02Course.js / aifC01Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 4 — Domain 1 (Secure) + Domain 2 (Resilient) authored. D3 + D4 land in Step 2.

const saaC03Course = {
  slug: 'saa-c03',
  title: 'AWS Certified Solutions Architect – Associate — Full Prep Course',
  code: 'SAA-C03',
  subtitle: 'Sixteen ~30-minute sessions covering all four domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 130 minutes, pass at 720/1000 (~72%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Design Secure Architectures', weight: '30%' },
    { id: 'd2', label: 'Domain 2 · Design Resilient Architectures', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · Design High-Performing Architectures', weight: '24%' },
    { id: 'd4', label: 'Domain 4 · Design Cost-Optimized Architectures', weight: '20%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DESIGN SECURE ARCHITECTURES (30%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Design Secure Architectures',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.1',
      title: 'IAM Foundations — Identities, Policies, and Least Privilege',
      duration: 30,
      summary: 'Start here. Identity and access management is the foundation every other security control sits on. We will build the IAM mental model the exam keeps testing — who can do what, to which resource, and under what condition.',
      objectives: [
        'Distinguish IAM users, groups, roles, and policies and know when to use each',
        'Apply the principle of least privilege to a flexible authorization model',
        'Explain how IAM roles and AWS STS enable temporary, cross-account access',
        'Protect the root user and enforce MFA as a security best practice',
      ],
      preLearningCheck: {
        question: 'An application running on an EC2 instance needs to read objects from an S3 bucket. What is the most secure way to grant this access?',
        options: [
          'Create an IAM user, generate access keys, and store them in the application code',
          'Attach an IAM role to the EC2 instance with a policy allowing read access to the bucket',
          'Make the S3 bucket public so the instance can reach it without credentials',
          'Store the root user access keys in an environment variable on the instance',
        ],
        correct: 1,
        note: 'No pressure — attempting this before reading improves retention even when you get it wrong. The phrase "an EC2 instance needs access" is almost always a role question.',
      },
      sections: [
        {
          heading: 'The question every IAM scenario is really asking',
          body: 'Strip away the wrapper and every IAM exam question reduces to one sentence: which principal is allowed to perform which action on which resource, under which conditions? Get fluent at decomposing a scenario into those four parts — principal, action, resource, condition — and most Domain 1 questions answer themselves.\n\nIAM is global (not Region-scoped), and by default a brand-new identity can do nothing. Every permission is an explicit grant. That default-deny posture is the bedrock of least privilege.',
        },
        {
          heading: 'Users, groups, roles — and why roles win',
          body: 'The exam wants you to reach for roles, not long-lived users with access keys. Roles deliver temporary credentials through AWS STS, so there are no static secrets to leak or rotate.',
          table: {
            headers: ['Identity', 'What it is', 'Use it when'],
            rows: [
              ['IAM user', 'A permanent identity with long-term credentials (password, access keys)', 'A specific human or legacy app needs durable console/CLI access and federation is not available'],
              ['IAM group', 'A collection of users that share a policy set', 'You want to manage permissions by job function (Admins, Developers, Auditors)'],
              ['IAM role', 'An identity with no permanent credentials, assumed temporarily via STS', 'An AWS service, an EC2/Lambda workload, or another account needs access — the default secure choice'],
            ],
          },
          callout: { type: 'tip', text: 'Exam reflex: "EC2 instance needs to call AWS", "Lambda needs to write to DynamoDB", "an account in another org unit needs access" → IAM role. If an answer hard-codes access keys, it is almost always the wrong one.' },
        },
        {
          heading: 'Policies — identity-based vs resource-based',
          body: 'Permissions come from JSON policy documents made of statements (Effect, Action, Resource, optional Condition). The exam draws a sharp line between two families of policy.',
          bullets: [
            'Identity-based policies attach to a user, group, or role and say what that identity can do. Managed policies are reusable; inline policies are embedded one-to-one.',
            'Resource-based policies attach to the resource itself (an S3 bucket policy, an SQS queue policy, a KMS key policy) and name the principals allowed to use it.',
            'Cross-account access often needs both: a resource policy on the target that trusts the other account, plus an identity policy on the caller granting the action.',
            'An explicit Deny always wins over any Allow. Service control policies (SCPs) and permission boundaries set the outer limit of what an identity policy can grant.',
          ],
        },
        {
          heading: 'Roles, STS, and cross-account access',
          body: 'A role has two halves: a trust policy (who is allowed to assume it) and a permissions policy (what they can do once assumed). When a principal assumes a role, AWS STS issues short-lived credentials. This is the mechanism behind instance profiles, cross-account access, and federation.\n\nFor cross-account: create a role in Account B that trusts Account A, grant the user in Account A permission to call sts:AssumeRole, and the user switches roles to operate in Account B with no shared secrets.',
          callout: { type: 'note', text: 'Least privilege is not a one-time setting. Start minimal, then use IAM Access Analyzer and the "last accessed" data to tighten further. The exam rewards the answer that grants the narrowest permission that still works.' },
        },
        {
          heading: 'Protecting the root user',
          body: 'The root user can do anything in the account and cannot be restricted by IAM policies or SCPs. Treat it as a break-glass identity: enable MFA on it, delete its access keys, and never use it for daily work.',
          bullets: [
            'Enable MFA on the root user and on all privileged IAM users.',
            'Create an individual IAM identity (or federate) for everyday administration — never share root.',
            'A few tasks genuinely require root (closing the account, changing the support plan, some billing settings) — that is the only time to sign in as root.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company has 40 developers who all need the same set of permissions for a development account. What is the most maintainable way to manage their access?',
          options: [
            'Attach an identical inline policy to each of the 40 IAM users',
            'Put the 40 users in an IAM group and attach the policy to the group',
            'Create one shared IAM user and give all 40 developers the password',
            'Make each developer assume the root user when they need access',
          ],
          correct: 1,
          explainCorrect: 'Correct — an IAM group lets you manage one policy for all 40 users. Add or remove a permission once and it applies to everyone in the group.',
          elaborativePrompt: 'Why is a single shared IAM user (option 3) dangerous even though it technically "works"? Think about what you lose for auditing and accountability when actions cannot be traced to an individual.',
        },
        {
          afterSection: 3,
          question: 'An application in Account A must read from a DynamoDB table in Account B with no long-lived credentials. Which approach fits?',
          options: [
            'Create an IAM user in Account B and embed its access keys in Account A\'s app',
            'Create a role in Account B that trusts Account A; the app assumes it via STS for temporary credentials',
            'Make the DynamoDB table public and access it over the internet',
            'Copy Account B\'s root credentials into Account A\'s Secrets Manager',
          ],
          correct: 1,
          explainCorrect: 'Correct — a cross-account role with a trust policy plus sts:AssumeRole delivers temporary credentials and no shared secrets, which is the secure, exam-preferred pattern.',
          elaborativePrompt: 'The role needs both a trust policy and a permissions policy. In your own words, what does each one control, and what breaks if you configure only one of them?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you are designing access for a new microservice running on EC2 that must write to one S3 bucket and read one DynamoDB table. Walk through why you would use an IAM role, what its permissions policy would allow, and why access keys in the code would be the wrong design.',
      sample: {
        type: 'multiple-choice',
        stem: 'A solutions architect is designing access for an application that runs on Amazon EC2 instances and must read and write objects in a specific Amazon S3 bucket. The security team requires that no long-term credentials be stored on the instances. Which solution meets these requirements with the LEAST operational overhead?',
        options: [
          'Create an IAM user with programmatic access and store the access keys in a file on each instance',
          'Create an IAM role with a policy granting access to the bucket and attach the role to the instances via an instance profile',
          'Embed the AWS account root access keys in the application configuration',
          'Generate temporary credentials manually with AWS STS and redeploy them to the instances every hour',
        ],
        correct: 1,
        explanation: {
          summary: 'An IAM role attached to the instances provides temporary credentials automatically rotated by AWS, with no static secrets stored and no manual rotation — the least-overhead secure design.',
          perOption: [
            'Storing access keys on the instances violates the "no long-term credentials" requirement and creates a rotation burden and leak risk.',
            'Correct — an instance profile delivers temporary, auto-rotated credentials scoped by the role policy. Nothing is stored, nothing is manually rotated.',
            'Using root credentials is the most dangerous option possible; root cannot be scoped and should never be used by an application.',
            'Manually generating and redeploying STS credentials every hour technically avoids static keys but adds large operational overhead that an instance role removes entirely.',
          ],
          link: 'Domain 1 · Task 1.1 — Design secure access to AWS resources',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Principal', def: 'The entity (user, role, or service) making a request to AWS. One of the four parts of every authorization decision.' },
        { term: 'IAM role', def: 'An identity with no permanent credentials that is assumed temporarily via STS. The preferred way to grant access to workloads and across accounts.' },
        { term: 'AWS STS', def: 'Security Token Service — issues short-lived, temporary credentials when a role is assumed.' },
        { term: 'Resource-based policy', def: 'A policy attached directly to a resource (e.g. an S3 bucket policy) that names which principals may use it.' },
        { term: 'Least privilege', def: 'Granting only the permissions required to perform a task, and no more.' },
      ],
      awsServices: [
        { name: 'AWS IAM', purpose: 'Manages identities (users, groups, roles) and the policies that authorize actions on AWS resources. Global, default-deny.' },
        { name: 'AWS STS', purpose: 'Issues temporary security credentials when a role is assumed — the engine behind instance profiles, cross-account access, and federation.' },
        { name: 'IAM Access Analyzer', purpose: 'Identifies resources shared with external entities and helps refine policies toward least privilege.' },
      ],
      examTips: [
        '"Workload/service needs access" or "no stored credentials" → IAM role, not an IAM user with access keys.',
        'Explicit Deny beats any Allow. SCPs and permission boundaries cap what an identity policy can grant.',
        'Cross-account access = role in the target account trusting the source + sts:AssumeRole on the caller.',
        'Root user: enable MFA, delete its access keys, use only for the handful of root-only tasks.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Design Secure Architectures',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.1',
      title: 'Multi-Account Security — Organizations, SCPs, and Federation',
      duration: 30,
      summary: 'Real companies run dozens or hundreds of AWS accounts. This session covers how to govern them centrally — AWS Organizations and SCPs for guardrails, Control Tower for landing zones, and IAM Identity Center plus federation so people sign in once.',
      objectives: [
        'Design a multi-account strategy with AWS Organizations and organizational units',
        'Use service control policies (SCPs) to set permission guardrails across accounts',
        'Explain how AWS Control Tower bootstraps a governed multi-account landing zone',
        'Choose between IAM Identity Center and directory federation for workforce access',
      ],
      preLearningCheck: {
        question: 'A company wants to guarantee that no account in its "Sandbox" organizational unit can ever create resources outside of us-east-1, regardless of what permissions individual IAM admins grant. Which control enforces this?',
        options: [
          'An IAM policy attached to every user in those accounts',
          'A service control policy (SCP) applied to the Sandbox organizational unit',
          'A security group rule restricting traffic to us-east-1',
          'A resource-based policy on each created resource',
        ],
        correct: 1,
        note: 'Think about which control can cap permissions account-wide even against a local administrator. That is the SCP signal.',
      },
      sections: [
        {
          heading: 'Why one account is never enough',
          body: 'Separate AWS accounts are the strongest isolation boundary AWS offers. Companies split workloads into many accounts to isolate blast radius, separate production from development, simplify billing per team, and meet compliance segregation requirements.\n\nThe challenge is governing them all without managing each one by hand. That is what AWS Organizations solves.',
        },
        {
          heading: 'AWS Organizations and organizational units',
          body: 'Organizations links many accounts under one management (payer) account. Accounts are grouped into a tree of organizational units (OUs) — for example Security, Production, Sandbox — so you can apply policy to a whole branch at once. Organizations also enables consolidated billing and volume discounts across all accounts.',
          callout: { type: 'note', text: 'OUs are about applying governance at scale: attach an SCP to an OU and every account beneath it inherits the guardrail. Structure the OU tree around how you want to govern, not around the org chart.' },
        },
        {
          heading: 'Service control policies — guardrails, not grants',
          body: 'An SCP defines the maximum available permissions for the accounts it applies to. It does not grant anything by itself — an action is only allowed if the SCP permits it AND an IAM policy in the account allows it.',
          bullets: [
            'SCPs filter permissions; they never add them. The effective permission is the intersection of the SCP and the identity policy.',
            'SCPs apply to everything in the account except the management account — even to that account\'s root user.',
            'Common use: deny disabling of CloudTrail, deny use of unapproved Regions, deny leaving the organization.',
            'A local IAM admin cannot escape an SCP. This is why SCPs are the answer for "must never be able to, regardless of IAM permissions".',
          ],
        },
        {
          heading: 'Control Tower — a governed landing zone out of the box',
          body: 'AWS Control Tower automates the setup of a secure, multi-account environment (a "landing zone"). It provisions a management account, a log archive and audit account, sets up Organizations and SCPs, and applies preventive and detective guardrails. Use it when a company wants best-practice multi-account governance without assembling it piece by piece.',
        },
        {
          heading: 'Workforce access — IAM Identity Center and federation',
          body: 'People should sign in once, not juggle an IAM user per account. IAM Identity Center (the successor to AWS SSO) provides central, role-based access to all accounts in the organization and integrates with an external identity provider.',
          table: {
            headers: ['Approach', 'How sign-in works', 'Use it when'],
            rows: [
              ['IAM Identity Center', 'Central portal maps users/groups to permission sets across all org accounts', 'Workforce needs single sign-on across many AWS accounts'],
              ['SAML 2.0 federation', 'Corporate IdP (e.g. Okta, AD FS) issues assertions; users assume IAM roles', 'You already run an external IdP and want users to keep one login'],
              ['AWS Directory Service', 'Managed Microsoft AD or AD Connector bridges on-premises AD to AWS', 'Workloads or users depend on Active Directory and you want it managed'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company runs 60 AWS accounts and wants a single consolidated bill plus the ability to apply governance to groups of accounts. Which service provides this foundation?',
          options: [
            'AWS IAM Identity Center',
            'AWS Organizations',
            'AWS Config',
            'Amazon Cognito',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Organizations links accounts under a management account, enables consolidated billing, and groups accounts into OUs for policy.',
          elaborativePrompt: 'Organizations is the foundation, but it is not the same as IAM Identity Center. In your own words, what job does each one do, and why might a company use both together?',
        },
        {
          afterSection: 3,
          question: 'An SCP attached to an OU allows only Amazon S3 and Amazon EC2 actions. An IAM policy on a user in that OU grants full DynamoDB access. What can the user do with DynamoDB?',
          options: [
            'Full DynamoDB access, because the IAM policy grants it',
            'Nothing with DynamoDB, because the SCP does not permit DynamoDB actions',
            'Read-only DynamoDB access, as a compromise between the two policies',
            'Full access, but only from the management account',
          ],
          correct: 1,
          explainCorrect: 'Correct — effective permissions are the intersection of SCP and IAM policy. The SCP does not allow DynamoDB, so the IAM grant cannot take effect.',
          elaborativePrompt: 'SCPs only filter, never grant. Explain why an account could have an SCP that allows a service and still have a user who cannot use it.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would design account governance for a company with separate Production, Development, and Security teams: which accounts/OUs you would create, where you would attach SCPs to prevent dangerous actions, and how the workforce would sign in across all of them.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company uses AWS Organizations to manage 25 accounts. Security policy requires that no account (including its administrators) can disable AWS CloudTrail. Which solution enforces this requirement across all accounts?',
        options: [
          'Attach an IAM policy denying cloudtrail:StopLogging to every IAM user in every account',
          'Apply a service control policy (SCP) that denies cloudtrail:StopLogging and cloudtrail:DeleteTrail to the organization root',
          'Enable MFA on the root user of each account',
          'Create a resource-based policy on the CloudTrail trail in each account',
        ],
        correct: 1,
        explanation: {
          summary: 'An SCP applied at the organization root caps permissions for every account beneath it, so even an account administrator cannot disable CloudTrail. This is the central, tamper-proof guardrail.',
          perOption: [
            'IAM policies on users can be changed by a local administrator, so they do not guarantee the control holds across all accounts.',
            'Correct — a deny SCP at the org root is inherited by all accounts and cannot be overridden by local IAM permissions, enforcing the requirement org-wide.',
            'MFA protects the root sign-in but does nothing to stop an authorized admin from disabling CloudTrail.',
            'A resource-based policy on each trail is per-account, easy to miss, and modifiable locally — not an org-wide guarantee.',
          ],
          link: 'Domain 1 · Task 1.1 — Design a security strategy for multiple AWS accounts',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'AWS Organizations', def: 'Central management of multiple AWS accounts, with organizational units, consolidated billing, and SCPs.' },
        { term: 'Service control policy (SCP)', def: 'An organization policy that sets the maximum permissions for accounts in an OU; it filters but never grants.' },
        { term: 'AWS Control Tower', def: 'Automates a secure, governed multi-account landing zone with pre-configured guardrails.' },
        { term: 'IAM Identity Center', def: 'Centralized, role-based single sign-on across all accounts in an organization; successor to AWS SSO.' },
        { term: 'Permission boundary', def: 'An advanced IAM feature that caps the maximum permissions an identity policy can grant to a user or role.' },
      ],
      awsServices: [
        { name: 'AWS Organizations', purpose: 'Groups and governs many accounts under one management account; enables consolidated billing and SCPs.' },
        { name: 'AWS Control Tower', purpose: 'Sets up and governs a best-practice multi-account landing zone with automated guardrails.' },
        { name: 'AWS IAM Identity Center', purpose: 'Central workforce single sign-on mapping users and groups to permission sets across org accounts.' },
        { name: 'AWS Directory Service', purpose: 'Managed Microsoft Active Directory (and AD Connector) to integrate AWS with on-premises AD.' },
      ],
      examTips: [
        '"Must never be able to, regardless of IAM permissions, across accounts" → service control policy (SCP).',
        'SCPs filter, they never grant. Effective permission = SCP ∩ IAM policy.',
        '"Set up a secure multi-account environment quickly / landing zone" → AWS Control Tower.',
        '"Single sign-on across many accounts" → IAM Identity Center; "keep our existing corporate login" → SAML federation.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Design Secure Architectures',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.2',
      title: 'Securing Workloads — VPC Network Security and Application Defense',
      duration: 30,
      summary: 'This session secures the network and the application layer. You will master the VPC security model the exam loves — security groups vs network ACLs, public vs private subnets — and the service landscape that defends against external threats: Shield, WAF, GuardDuty, and friends.',
      objectives: [
        'Design VPC architectures using security groups, network ACLs, subnets, and NAT gateways',
        'Apply network segmentation with public and private subnets',
        'Select the right service to defend against DDoS, web exploits, and threats (Shield, WAF, GuardDuty, Macie)',
        'Secure application credentials and external connectivity (Secrets Manager, VPN, Direct Connect)',
      ],
      preLearningCheck: {
        question: 'A web server in a public subnet must accept HTTPS from the internet, and a database in a private subnet must accept connections only from that web server. Which statement about the controls involved is correct?',
        options: [
          'Security groups are stateless, so you must add explicit outbound rules for return traffic',
          'Security groups are stateful — allowing inbound traffic automatically permits the response',
          'Network ACLs are stateful and track connections like security groups',
          'A private subnet means resources there cannot be reached by any other resource',
        ],
        correct: 1,
        note: 'The stateful-vs-stateless distinction between security groups and NACLs is one of the most-tested facts in Domain 1. Lock it in now.',
      },
      sections: [
        {
          heading: 'The VPC is your network perimeter',
          body: 'A VPC is a logically isolated virtual network. Inside it you carve subnets, control routing with route tables, and place security controls at two layers: the subnet (network ACLs) and the resource (security groups). The exam tests whether you put the right control at the right layer.',
        },
        {
          heading: 'Security groups vs network ACLs — the must-know table',
          interactive: 'sg-vs-nacl',
          body: 'These two are constantly confused, and the exam exploits that. Memorize the differences.',
          table: {
            headers: ['', 'Security group', 'Network ACL'],
            rows: [
              ['Operates at', 'The resource (ENI / instance)', 'The subnet'],
              ['State', 'Stateful — return traffic auto-allowed', 'Stateless — must allow return traffic explicitly'],
              ['Rules', 'Allow rules only', 'Allow and Deny rules'],
              ['Evaluation', 'All rules evaluated together', 'Rules processed in number order, first match wins'],
            ],
          },
          callout: { type: 'tip', text: 'Reflex: need to block a specific malicious IP at the subnet edge → network ACL Deny rule (security groups cannot deny). Control which instances talk to which → security groups referencing each other.' },
        },
        {
          heading: 'Public vs private subnets and the NAT gateway',
          body: 'A subnet is public if its route table sends 0.0.0.0/0 to an internet gateway. Place internet-facing resources (load balancers, bastion hosts) in public subnets and everything else — app servers, databases — in private subnets.\n\nPrivate resources that need outbound internet access (to download patches, call an API) route through a NAT gateway in a public subnet. The NAT gateway allows outbound connections and their responses, but blocks unsolicited inbound traffic.',
          bullets: [
            'Internet gateway = two-way internet for public subnets.',
            'NAT gateway = outbound-only internet for private subnets; managed, scalable, AZ-resilient (deploy one per AZ for HA).',
            'VPC endpoints let private resources reach AWS services (S3, DynamoDB, and more) without traversing the internet or a NAT gateway at all.',
          ],
        },
        {
          heading: 'Defending against external threats',
          body: 'The exam maps a threat to the service that mitigates it. Learn the pairing.',
          table: {
            headers: ['Threat / need', 'Service', 'What it does'],
            rows: [
              ['DDoS protection', 'AWS Shield (Standard / Advanced)', 'Absorbs and mitigates volumetric and protocol attacks; Advanced adds higher-layer protection and cost protection'],
              ['Web exploits (SQLi, XSS)', 'AWS WAF', 'Filters HTTP(S) requests by rules on ALB, CloudFront, or API Gateway'],
              ['Threat detection', 'Amazon GuardDuty', 'Continuously analyzes logs for malicious or anomalous activity'],
              ['Sensitive data discovery', 'Amazon Macie', 'Uses ML to find and classify PII and sensitive data in S3'],
              ['Vulnerability scanning', 'Amazon Inspector', 'Scans EC2 and container images for known CVEs and exposure'],
            ],
          },
        },
        {
          heading: 'Application credentials and secure connectivity',
          body: 'Applications need secrets and sometimes a private path to on-premises.',
          bullets: [
            'AWS Secrets Manager stores database credentials and API keys and can rotate them automatically. Use it over hard-coded secrets or plaintext config.',
            'Amazon Cognito provides user sign-up/sign-in and federated identity for application end users (distinct from IAM, which is for AWS access).',
            'Site-to-Site VPN gives an encrypted tunnel over the internet to on-premises — quick to set up, but subject to internet variability.',
            'AWS Direct Connect provides a dedicated private network link — consistent latency and bandwidth; pair it with a VPN backup for resilience.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A security team needs to block all traffic from a specific range of malicious IP addresses before it can reach any instance in a subnet. Which control should they use?',
          options: [
            'A security group outbound Deny rule',
            'A network ACL Deny rule on the subnet',
            'An IAM policy condition on source IP',
            'A NAT gateway route',
          ],
          correct: 1,
          explainCorrect: 'Correct — only network ACLs support Deny rules and they act at the subnet boundary, so they can block an IP range before traffic reaches any instance. Security groups have no Deny.',
          elaborativePrompt: 'Security groups cannot express "deny". Explain why that design choice exists and how you would normally restrict access with a security group instead of denying.',
        },
        {
          afterSection: 2,
          question: 'EC2 instances in a private subnet must download OS patches from the internet but must not be reachable from the internet. What should the architect deploy?',
          options: [
            'An internet gateway attached directly to the private subnet',
            'A NAT gateway in a public subnet, with the private subnet routing 0.0.0.0/0 to it',
            'A public IP address on each instance',
            'A VPC peering connection to a public VPC',
          ],
          correct: 1,
          explainCorrect: 'Correct — a NAT gateway permits outbound connections (and their responses) while blocking unsolicited inbound traffic, exactly matching the requirement.',
          elaborativePrompt: 'If the instances only needed to reach Amazon S3 and DynamoDB rather than the general internet, what cheaper option removes the NAT gateway entirely? Explain why.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself the full path of a request to a three-tier web app: where the load balancer, app servers, and database live (public vs private subnets), which security groups reference which, and where you would add a NAT gateway, WAF, and Shield. Narrate why each control sits where it does.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company hosts a public web application behind an Application Load Balancer. The application has been targeted by SQL injection and cross-site scripting attempts. The company wants to filter malicious HTTP requests before they reach the application. Which service should the solutions architect add?',
        options: [
          'Amazon GuardDuty',
          'AWS WAF',
          'Amazon Inspector',
          'AWS Shield Standard',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS WAF inspects and filters HTTP(S) requests at the ALB (or CloudFront/API Gateway) using rules that block SQL injection and XSS patterns — exactly the stated threat.',
          perOption: [
            'GuardDuty detects malicious activity by analyzing logs and alerts on it, but it does not inline-filter web requests.',
            'Correct — WAF applies request-filtering rules (including managed rules for SQLi and XSS) directly in front of the application.',
            'Inspector scans for software vulnerabilities and exposure on EC2 and containers; it does not filter live web traffic.',
            'Shield Standard mitigates DDoS at the network/transport layer; it does not inspect application-layer request content for injection attacks.',
          ],
          link: 'Domain 1 · Task 1.2 — Integrate AWS services to secure applications',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
        { videoId: 'h9R3ACtjc0k', title: 'AWS VPC, Subnets, NACLs & Security Groups (SAA-C03)', channel: 'DevOps Cloud and AI Labs', relevance: 'A focused walkthrough of the VPC security model in this session — security groups vs network ACLs, public and private subnets, and NAT.' },
      ],
      keyTerms: [
        { term: 'Security group', def: 'A stateful, allow-only firewall at the resource level. Return traffic for an allowed flow is automatically permitted.' },
        { term: 'Network ACL', def: 'A stateless, ordered allow/deny firewall at the subnet level. Return traffic must be allowed explicitly.' },
        { term: 'NAT gateway', def: 'A managed service giving private-subnet resources outbound internet access while blocking unsolicited inbound connections.' },
        { term: 'VPC endpoint', def: 'A private connection from a VPC to AWS services that avoids the internet and NAT entirely.' },
        { term: 'AWS WAF', def: 'A web application firewall that filters HTTP(S) requests by rule on ALB, CloudFront, or API Gateway.' },
      ],
      awsServices: [
        { name: 'Amazon VPC', purpose: 'Isolated virtual network where you control subnets, routing, and layered security (security groups + NACLs).' },
        { name: 'AWS Shield', purpose: 'DDoS protection; Standard is automatic and free, Advanced adds higher-layer mitigation and cost protection.' },
        { name: 'AWS WAF', purpose: 'Filters malicious web requests (SQLi, XSS, bots) in front of ALB, CloudFront, or API Gateway.' },
        { name: 'Amazon GuardDuty', purpose: 'Continuous threat detection by analyzing CloudTrail, VPC Flow Logs, and DNS logs for anomalies.' },
        { name: 'AWS Secrets Manager', purpose: 'Securely stores and automatically rotates database credentials, API keys, and other secrets.' },
        { name: 'AWS Direct Connect', purpose: 'Dedicated private network connection between on-premises and AWS for consistent latency and bandwidth.' },
      ],
      examTips: [
        'Security group = stateful, allow-only, at the resource. Network ACL = stateless, allow+deny, at the subnet.',
        'Need to DENY a specific IP range → network ACL. Need outbound-only internet for private instances → NAT gateway.',
        'SQLi/XSS filtering → WAF. DDoS → Shield. Threat detection from logs → GuardDuty. Find PII in S3 → Macie.',
        'Reach AWS services privately without NAT/internet → VPC endpoints (Gateway endpoint for S3/DynamoDB, Interface endpoint otherwise).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Design Secure Architectures',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.3',
      title: 'Protecting Data — Encryption, KMS, and Key Management',
      duration: 30,
      summary: 'The last D1 session secures data itself. You will learn encryption at rest and in transit, how AWS KMS manages keys, the difference between key policies and IAM, and how backups, replication, and classification round out a data-protection strategy.',
      objectives: [
        'Encrypt data at rest with AWS KMS and in transit with TLS via ACM',
        'Differentiate AWS-managed, customer-managed, and imported keys, and key policies vs IAM',
        'Implement key rotation, certificate renewal, and data lifecycle protection',
        'Design backups, replication, and classification to meet retention and compliance needs',
      ],
      preLearningCheck: {
        question: 'A company must encrypt objects in Amazon S3 at rest and needs full control over the encryption key, including the ability to define exactly which principals can use it and to audit every use. Which option fits best?',
        options: [
          'SSE-S3 with an AWS-managed key',
          'SSE-KMS with a customer-managed KMS key',
          'No encryption, secured only by a bucket policy',
          'Client-side hashing of the objects',
        ],
        correct: 1,
        note: 'The phrase "full control over the key" and "audit every use" points to a customer-managed KMS key with its own key policy and CloudTrail logging.',
      },
      sections: [
        {
          heading: 'Two kinds of encryption, two different services',
          body: 'Data protection splits cleanly into two states, and the exam expects you to address both:\n\nAt rest — data stored on disk (S3, EBS, RDS, EFS, DynamoDB). Protected with AWS KMS keys.\n\nIn transit — data moving over a network. Protected with TLS, using certificates from AWS Certificate Manager (ACM).',
        },
        {
          heading: 'AWS KMS and the kinds of keys',
          body: 'KMS creates and controls encryption keys and integrates with almost every AWS storage and database service. Most services use envelope encryption: KMS protects a data key, and the data key encrypts the actual data.',
          table: {
            headers: ['Key type', 'Who controls it', 'Use when'],
            rows: [
              ['AWS-managed key', 'AWS, per service (e.g. aws/s3)', 'You want encryption with zero key management and no custom access control'],
              ['Customer-managed key (CMK)', 'You — full control of policy and rotation', 'You need to define key usage permissions, audit use, and control rotation'],
              ['Imported key material', 'You supply the material', 'Compliance requires you to originate the key material yourself'],
            ],
          },
          callout: { type: 'note', text: 'For the highest assurance / FIPS 140-2 Level 3 dedicated hardware, AWS CloudHSM is the answer rather than KMS. KMS is the default; CloudHSM is the "single-tenant dedicated HSM" exam signal.' },
        },
        {
          heading: 'Key policies vs IAM — who can use a key',
          body: 'Access to a KMS key is governed primarily by its key policy (a resource-based policy on the key). Unlike most services, a KMS key is not automatically usable just because an IAM policy allows kms actions — the key policy must also permit the principal.',
          bullets: [
            'Every customer-managed key has a key policy. It is the primary access control for the key.',
            'You can delegate to IAM by having the key policy grant the account, then using IAM policies to control which identities may use it.',
            'Separation of duties: a key administrator (who manages the key) can be distinct from a key user (who encrypts/decrypts with it).',
            'Every use of a KMS key is logged in CloudTrail, giving a full audit trail.',
          ],
        },
        {
          heading: 'Rotation, certificates, and lifecycle',
          body: 'Security is ongoing, not one-time.',
          bullets: [
            'KMS customer-managed keys support automatic annual rotation; AWS-managed keys rotate on AWS\'s schedule.',
            'ACM provisions and automatically renews public TLS certificates for use on ALB, CloudFront, and API Gateway — removing manual renewal toil.',
            'S3 Object Lifecycle policies transition or expire objects on a schedule; S3 Object Lock enforces write-once-read-many (WORM) retention for compliance.',
            'Classify before you protect: Amazon Macie discovers and labels sensitive data in S3 so controls can be targeted.',
          ],
        },
        {
          heading: 'Backups, replication, and recovery',
          body: 'Durability and recoverability are part of data security. The exam pairs requirements with the right mechanism.',
          bullets: [
            'AWS Backup centralizes and automates backup policies across EBS, RDS, DynamoDB, EFS, and more.',
            'S3 offers 11 nines of durability; enable versioning to protect against accidental deletes and overwrites.',
            'S3 Replication (same-Region SRR or cross-Region CRR) copies objects for compliance, latency, or DR.',
            'Encrypt backups too — a backup of encrypted data should remain encrypted, and cross-Region copies need a key in the destination Region.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A regulated company must control exactly which IAM roles can decrypt data and must produce an audit log of every decryption. Which approach meets this?',
          options: [
            'Use SSE-S3 with the default AWS-managed key',
            'Use a customer-managed KMS key with a key policy scoped to the allowed roles, and review CloudTrail',
            'Disable encryption and rely on a restrictive bucket policy',
            'Encrypt on the client with a static password shared by email',
          ],
          correct: 1,
          explainCorrect: 'Correct — a customer-managed key lets you define exactly which principals can use it via the key policy, and KMS logs every use to CloudTrail for audit.',
          elaborativePrompt: 'Why does the AWS-managed key (option 1) fall short of "control exactly which roles can decrypt"? Think about who owns the policy on an AWS-managed key.',
        },
        {
          afterSection: 3,
          question: 'A company terminates TLS on an Application Load Balancer and wants certificates that renew automatically with no manual steps. Which service should it use?',
          options: [
            'AWS KMS',
            'AWS Certificate Manager (ACM)',
            'AWS Secrets Manager',
            'Amazon Macie',
          ],
          correct: 1,
          explainCorrect: 'Correct — ACM provisions public TLS certificates and renews them automatically for integrated services like ALB, CloudFront, and API Gateway.',
          elaborativePrompt: 'KMS and ACM both deal with cryptography. In your own words, what is each one for, and why is ACM — not KMS — the answer to "TLS certificate on a load balancer"?',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would protect a dataset end to end: how it is encrypted at rest (which key type and why), how it is encrypted in transit, who is allowed to use the key, how the key rotates, and how the data is backed up and replicated for compliance. Justify each choice against a "full control and full audit" requirement.',
      sample: {
        type: 'multiple-choice',
        stem: 'A financial services company stores sensitive data in Amazon S3. Compliance requires that the data be encrypted at rest, that the company control and audit the encryption key, and that the key be rotated automatically each year. Which solution meets these requirements with the LEAST operational overhead?',
        options: [
          'Enable SSE-S3 with an Amazon S3-managed key',
          'Use SSE-KMS with a customer-managed key that has automatic annual rotation enabled',
          'Encrypt objects client-side with a key stored in the application code',
          'Store the data unencrypted and restrict access with a bucket policy',
        ],
        correct: 1,
        explanation: {
          summary: 'A customer-managed KMS key gives the company control over key permissions, CloudTrail-based auditing, and a built-in automatic annual rotation setting — meeting every requirement without custom tooling.',
          perOption: [
            'SSE-S3 encrypts at rest but the key is AWS-managed, so the company cannot control its policy or rotation schedule as required.',
            'Correct — SSE-KMS with a customer-managed key provides control, automatic annual rotation, and full audit logging with minimal overhead.',
            'Client-side encryption with a key in code creates a key-management and rotation burden and a serious leak risk — the opposite of least overhead.',
            'Leaving the data unencrypted fails the explicit "encrypted at rest" requirement outright.',
          ],
          link: 'Domain 1 · Task 1.3 — Determine appropriate data security controls',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Encryption at rest', def: 'Protecting stored data on disk, typically using AWS KMS keys (e.g. SSE-KMS for S3, encrypted EBS/RDS volumes).' },
        { term: 'Encryption in transit', def: 'Protecting data moving over a network with TLS, using certificates from AWS Certificate Manager.' },
        { term: 'Customer-managed key (CMK)', def: 'A KMS key you control fully — its key policy, rotation, and audit — used when you need precise control.' },
        { term: 'Key policy', def: 'The resource-based policy on a KMS key that determines which principals may use or manage it.' },
        { term: 'Envelope encryption', def: 'Encrypting data with a data key, then encrypting that data key with a KMS key — the model most AWS services use.' },
      ],
      awsServices: [
        { name: 'AWS KMS', purpose: 'Creates and controls encryption keys and integrates with most AWS services for encryption at rest via envelope encryption.' },
        { name: 'AWS Certificate Manager (ACM)', purpose: 'Provisions and automatically renews TLS certificates for ALB, CloudFront, and API Gateway.' },
        { name: 'AWS CloudHSM', purpose: 'Single-tenant, dedicated hardware security modules for the highest assurance and compliance key requirements.' },
        { name: 'Amazon Macie', purpose: 'Uses machine learning to discover and classify sensitive data (PII) stored in Amazon S3.' },
        { name: 'AWS Backup', purpose: 'Centralizes and automates backup policies across EBS, RDS, DynamoDB, EFS, and other services.' },
      ],
      examTips: [
        '"Control the key, audit its use, rotate it" → customer-managed KMS key (not AWS-managed/SSE-S3).',
        '"TLS certificate on ALB/CloudFront, auto-renew" → ACM. KMS is for encryption keys, not TLS certs.',
        '"Dedicated single-tenant HSM / FIPS 140-2 Level 3" → CloudHSM, not KMS.',
        'Cross-Region replication of encrypted data needs a KMS key in the destination Region.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — DESIGN RESILIENT ARCHITECTURES (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Design Resilient Architectures',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Decoupling with Messaging — SQS, SNS, and EventBridge',
      duration: 30,
      summary: 'Resilient systems are loosely coupled — components fail or scale independently without taking each other down. This session covers the decoupling toolkit: queues (SQS), pub/sub (SNS), event routing (EventBridge), and the patterns that make them the right answer.',
      objectives: [
        'Explain how loose coupling improves resilience and independent scaling',
        'Choose between Amazon SQS, Amazon SNS, and Amazon EventBridge for a given pattern',
        'Apply queue-based load leveling and fan-out patterns',
        'Recognize when an event-driven or microservice design is the right fit',
      ],
      preLearningCheck: {
        question: 'A web tier sends work to a processing tier. During traffic spikes the processing tier is overwhelmed and requests are lost. Which change most directly fixes this?',
        options: [
          'Put an Amazon SQS queue between the tiers so work is buffered and processed at a sustainable rate',
          'Increase the size of each processing instance',
          'Move both tiers into the same instance to reduce latency',
          'Replace the processing tier with a single larger database',
        ],
        correct: 0,
        note: 'A buffer that absorbs spikes and lets the consumer work at its own pace is the classic queue-based load-leveling pattern. Watch for "requests lost during spikes".',
      },
      sections: [
        {
          heading: 'Why loose coupling is resilience',
          body: 'When component A calls component B directly and synchronously, B becoming slow or unavailable breaks A. Decoupling inserts an intermediary — a queue or an event bus — so A can keep working even when B is down or busy, and B can scale independently of A.\n\nThe exam frames this as removing single points of failure and absorbing demand spikes. Whenever a scenario says work is lost when a downstream component fails or is overwhelmed, think decoupling.',
        },
        {
          heading: 'Amazon SQS — buffering work',
          body: 'SQS is a fully managed message queue. A producer puts messages in; one or more consumers pull them out and process at their own pace. It is the go-to for queue-based load leveling and for decoupling a fast producer from a slower consumer.',
          table: {
            headers: ['Queue type', 'Ordering & delivery', 'Use when'],
            rows: [
              ['Standard', 'Best-effort ordering, at-least-once (possible duplicates), highest throughput', 'Maximum throughput and your consumer is idempotent'],
              ['FIFO', 'Strict ordering, exactly-once processing, limited throughput', 'Order matters and duplicates are unacceptable (e.g. financial transactions)'],
            ],
          },
          callout: { type: 'tip', text: 'SQS is pull-based and point-to-point: one message is processed by one consumer. If you need the same message delivered to many subscribers, that is SNS, not SQS.' },
        },
        {
          heading: 'Amazon SNS — fan-out pub/sub',
          body: 'SNS is publish/subscribe: a publisher sends a message to a topic and SNS pushes a copy to every subscriber (Lambda functions, SQS queues, HTTP endpoints, email). The classic fan-out pattern publishes one event to an SNS topic that delivers to multiple SQS queues, each feeding an independent processing pipeline.',
        },
        {
          heading: 'Amazon EventBridge — event routing with rules',
          body: 'EventBridge is a serverless event bus that routes events from AWS services, SaaS partners, and your own applications to targets based on content-matching rules. Use it when you need to filter and route events to different targets by their content, or to react to AWS service events.',
          bullets: [
            'SQS — buffer and decouple; one consumer per message; for load leveling.',
            'SNS — fan-out the same message to many subscribers; for notifications and parallel pipelines.',
            'EventBridge — route events to targets by rules; for event-driven integration and reacting to AWS/SaaS events.',
            'Step Functions — orchestrate a multi-step workflow with state, retries, and branching across services.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'An order-processing system must guarantee that orders are processed exactly once and in the exact sequence they were placed. Which option fits?',
          options: [
            'An SQS standard queue',
            'An SQS FIFO queue',
            'An SNS standard topic',
            'A single EC2 instance polling a database',
          ],
          correct: 1,
          explainCorrect: 'Correct — an SQS FIFO queue provides strict ordering and exactly-once processing, which the "exact sequence, exactly once" requirement demands.',
          elaborativePrompt: 'Standard queues offer much higher throughput than FIFO. Explain the trade-off you accept by choosing FIFO, and when a standard queue with idempotent consumers would be the better call.',
        },
        {
          afterSection: 3,
          question: 'When a new image is uploaded, the system must trigger three independent processes (thumbnailing, virus scanning, metadata indexing) in parallel. Which design is cleanest?',
          options: [
            'A single SQS queue read by one consumer that does all three jobs',
            'Publish one event to an SNS topic with three subscribers, one per process',
            'Three separate uploads, one for each process',
            'A FIFO queue to force the three jobs to run in order',
          ],
          correct: 1,
          explainCorrect: 'Correct — SNS fan-out delivers the same event to three subscribers so each process runs independently and in parallel, decoupled from the others.',
          elaborativePrompt: 'A common production pattern is SNS-to-SQS fan-out (each subscriber is an SQS queue) rather than SNS straight to a function. What resilience benefit does adding the queue give each consumer?',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would redesign a fragile synchronous pipeline — web tier calling a processing tier calling a database — into a loosely coupled one. Decide where a queue goes, whether any step needs fan-out, and how each tier now scales and fails independently.',
      sample: {
        type: 'multiple-choice',
        stem: 'A solutions architect is designing an application where a front-end tier submits jobs to a back-end processing tier. During traffic spikes, the processing tier cannot keep up and jobs are dropped. The architect needs to ensure no jobs are lost and that the processing tier can scale independently. Which solution meets these requirements MOST effectively?',
        options: [
          'Place the front-end and processing tiers on the same Auto Scaling group',
          'Introduce an Amazon SQS queue between the tiers and have the processing tier consume from it',
          'Increase the instance size of the processing tier to the largest available',
          'Replace the processing tier with an Amazon SNS topic',
        ],
        correct: 1,
        explanation: {
          summary: 'An SQS queue buffers submitted jobs so none are lost during spikes, and the processing tier can scale on queue depth and consume at a sustainable rate — decoupling the two tiers.',
          perOption: [
            'Coupling both tiers in one Auto Scaling group keeps them dependent and still drops work when the processing side falls behind.',
            'Correct — SQS provides durable buffering and lets the consumer scale independently, directly solving lost jobs during spikes.',
            'A bigger instance has a fixed ceiling and still drops work once that ceiling is hit; it does not decouple the tiers.',
            'SNS pushes messages to subscribers and does not buffer work for a consumer to pull at its own pace, so it does not prevent the processing tier from being overwhelmed.',
          ],
          link: 'Domain 2 · Task 2.1 — Determine the AWS services required to achieve loose coupling',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Loose coupling', def: 'A design where components interact through an intermediary so they can fail and scale independently.' },
        { term: 'Queue-based load leveling', def: 'Placing a queue between producer and consumer so demand spikes are buffered and processed at a sustainable rate.' },
        { term: 'Fan-out', def: 'Delivering one published message to many subscribers at once, typically via SNS to multiple SQS queues or functions.' },
        { term: 'Event-driven architecture', def: 'A design where components react to events rather than calling each other directly.' },
        { term: 'SQS FIFO', def: 'A queue type providing strict ordering and exactly-once processing at lower throughput than standard queues.' },
      ],
      awsServices: [
        { name: 'Amazon SQS', purpose: 'Managed message queue for buffering and decoupling; standard (high throughput) and FIFO (ordered, exactly-once) types.' },
        { name: 'Amazon SNS', purpose: 'Managed publish/subscribe messaging for fan-out delivery of one message to many subscribers.' },
        { name: 'Amazon EventBridge', purpose: 'Serverless event bus that routes events to targets based on content-matching rules.' },
        { name: 'AWS Step Functions', purpose: 'Serverless workflow orchestration with state, retries, and branching across multiple services.' },
        { name: 'Amazon API Gateway', purpose: 'Managed front door for REST/HTTP APIs, decoupling clients from backend compute.' },
      ],
      examTips: [
        '"Work lost during spikes / process at its own pace / decouple tiers" → SQS.',
        '"Same message to many subscribers / notify multiple systems" → SNS fan-out.',
        '"Route events to different targets by content / react to AWS service events" → EventBridge.',
        'Order + no duplicates → SQS FIFO. Max throughput + idempotent consumer → SQS standard.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Design Resilient Architectures',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Scaling and Loose Coupling — Compute, Containers, and Serverless',
      duration: 30,
      summary: 'Building on decoupling, this session is about scaling the compute itself. You will learn horizontal vs vertical scaling, EC2 Auto Scaling behind a load balancer, when to choose containers vs serverless, and how caching and read replicas relieve pressure.',
      objectives: [
        'Distinguish horizontal and vertical scaling and design stateless tiers that scale out',
        'Configure EC2 Auto Scaling with an Application Load Balancer for elasticity',
        'Choose between EC2, containers (ECS/EKS), and serverless (Lambda/Fargate)',
        'Apply caching and read replicas to scale read-heavy workloads',
      ],
      preLearningCheck: {
        question: 'An application stores user session state in memory on each web server. The team wants to scale the web tier out and in automatically, but users keep getting logged out when instances are removed. What is the root design problem?',
        options: [
          'The instances are too small and should be scaled vertically instead',
          'The tier is stateful — session state should be externalized so any instance can serve any user',
          'Auto Scaling is incompatible with web applications',
          'The load balancer should be removed to keep users on one server',
        ],
        correct: 1,
        note: 'Statelessness is the prerequisite for horizontal scaling. If removing an instance loses user state, the state is in the wrong place.',
      },
      sections: [
        {
          heading: 'Scale up vs scale out',
          body: 'Vertical scaling (scale up) means a bigger instance — more CPU/RAM. It is simple but has a ceiling and is a single point of failure. Horizontal scaling (scale out) means more instances behind a load balancer — it has no practical ceiling and improves availability. The exam strongly prefers horizontal scaling for resilient, elastic designs.',
          callout: { type: 'tip', text: 'Horizontal scaling requires stateless application tiers. Externalize session state to DynamoDB or ElastiCache so any instance can handle any request, and instances can be added or removed freely.' },
        },
        {
          heading: 'EC2 Auto Scaling + ELB — the elasticity engine',
          body: 'An Auto Scaling group launches and terminates EC2 instances to match demand, across multiple Availability Zones, and replaces unhealthy instances automatically. An Application Load Balancer distributes traffic across them and runs health checks.',
          bullets: [
            'Target tracking scaling keeps a metric (e.g. average CPU at 60%) on target — the simplest, most-recommended policy.',
            'Spreading the group across multiple AZs gives both elasticity and high availability.',
            'Auto Scaling also provides self-healing: a failed health check triggers replacement automatically.',
            'Scheduled scaling handles predictable patterns (e.g. scale up every weekday morning).',
          ],
        },
        {
          heading: 'EC2 vs containers vs serverless',
          body: 'Choosing the compute model is a recurring exam decision. Match the workload to the model.',
          table: {
            headers: ['Model', 'Service', 'Best for'],
            rows: [
              ['Virtual machines', 'Amazon EC2', 'Full OS control, long-running workloads, specialized configurations'],
              ['Containers (managed)', 'Amazon ECS / EKS on Fargate', 'Microservices and portable workloads without managing servers (Fargate) or with cluster control (EC2 launch type)'],
              ['Functions', 'AWS Lambda', 'Event-driven, short-lived tasks; no servers to manage; scales to zero'],
            ],
          },
        },
        {
          heading: 'Relieve the data tier — caching and read replicas',
          body: 'Scaling compute is half the story; the database is often the bottleneck. Two patterns dominate.',
          bullets: [
            'Amazon ElastiCache (Redis/Memcached) caches frequent reads in memory, cutting database load and latency.',
            'Read replicas offload read traffic from the primary database, scaling reads horizontally (RDS supports up to several; Aurora up to 15).',
            'Amazon CloudFront caches static and dynamic content at edge locations, reducing origin load and improving global latency.',
            'DynamoDB Accelerator (DAX) provides an in-memory cache for DynamoDB read-heavy workloads.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A stateless web tier must automatically add instances when CPU rises and remove them when it falls, while staying available if one Availability Zone fails. Which combination achieves this?',
          options: [
            'A single large EC2 instance with a scheduled reboot',
            'An EC2 Auto Scaling group spanning multiple AZs behind an Application Load Balancer',
            'Vertical scaling triggered by a CloudWatch alarm',
            'Two instances in the same AZ with no load balancer',
          ],
          correct: 1,
          explainCorrect: 'Correct — a multi-AZ Auto Scaling group behind an ALB delivers elasticity (scale on CPU), availability (survives an AZ loss), and self-healing.',
          elaborativePrompt: 'Why does spreading the Auto Scaling group across multiple AZs matter even if the application could run in one? Connect this to the definition of high availability.',
        },
        {
          afterSection: 3,
          question: 'A read-heavy reporting workload is overloading an Amazon RDS primary instance with SELECT queries. Which change scales reads with the LEAST application change?',
          options: [
            'Migrate the database to a single larger instance',
            'Add RDS read replicas and direct read queries to them',
            'Move all data into Amazon S3',
            'Switch the database to FIFO processing',
          ],
          correct: 1,
          explainCorrect: 'Correct — read replicas offload SELECT traffic from the primary, scaling reads horizontally without re-architecting the application.',
          elaborativePrompt: 'Read replicas are eventually consistent with the primary. Explain a scenario where that lag would matter, and how caching with ElastiCache might complement or differ from read replicas.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would make a monolithic web app elastic and resilient: how you would make the web tier stateless, where session state goes, how Auto Scaling and the load balancer cooperate, and which caching or replica strategy you would add to protect the database.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a web application on a fleet of Amazon EC2 instances. Traffic is highly variable, with large unpredictable spikes. The application currently stores session data in the memory of each instance, and users are logged out whenever the fleet scales in. The company wants the web tier to scale automatically and remain available during scale-in events. Which combination of actions BEST meets these requirements?',
        options: [
          'Increase the size of each instance and disable scale-in',
          'Store session state in Amazon ElastiCache and run the instances in a multi-AZ Auto Scaling group behind an Application Load Balancer',
          'Pin each user to a single instance using sticky sessions and stop using Auto Scaling',
          'Move session data to instance store volumes on each instance',
        ],
        correct: 1,
        explanation: {
          summary: 'Externalizing session state to ElastiCache makes the tier stateless, so any instance can serve any user and scale-in no longer logs users out; a multi-AZ Auto Scaling group behind an ALB delivers elasticity and availability.',
          perOption: [
            'Bigger instances with scale-in disabled removes elasticity and still loses sessions if an instance fails.',
            'Correct — stateless instances plus a multi-AZ Auto Scaling group and ALB solve both the session loss and the scaling/availability requirements.',
            'Sticky sessions keep users on one instance but lose their state when that instance is replaced, and dropping Auto Scaling removes elasticity.',
            'Instance store is ephemeral local disk — session data there is lost on scale-in or instance failure, which is the original problem.',
          ],
          link: 'Domain 2 · Task 2.1 — Designing scalable, loosely coupled architectures',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Horizontal scaling', def: 'Adding more instances behind a load balancer to handle load; no practical ceiling and improves availability.' },
        { term: 'Stateless tier', def: 'A tier that holds no client-specific state locally, so any instance can serve any request — a prerequisite for scaling out.' },
        { term: 'Auto Scaling group', def: 'A group of EC2 instances that AWS launches/terminates to match demand and replaces when unhealthy.' },
        { term: 'Read replica', def: 'A read-only copy of a database that offloads read traffic from the primary, scaling reads.' },
        { term: 'ElastiCache', def: 'A managed in-memory cache (Redis/Memcached) that reduces database load and latency for frequent reads.' },
      ],
      awsServices: [
        { name: 'Amazon EC2 Auto Scaling', purpose: 'Automatically launches and terminates EC2 instances to match demand across AZs and replaces unhealthy ones.' },
        { name: 'Elastic Load Balancing', purpose: 'Distributes traffic across instances/targets and runs health checks; ALB (L7), NLB (L4), GWLB (appliances).' },
        { name: 'AWS Lambda', purpose: 'Serverless functions for event-driven, short-lived work; no servers and scales to zero.' },
        { name: 'AWS Fargate', purpose: 'Serverless compute for containers (with ECS or EKS) — run containers without managing servers.' },
        { name: 'Amazon ElastiCache', purpose: 'In-memory caching (Redis/Memcached) to offload read-heavy databases and store session state.' },
      ],
      examTips: [
        'Resilient/elastic design → horizontal scaling (Auto Scaling across AZs), not a single bigger instance.',
        '"Users logged out on scale-in / can\'t scale out" → externalize session state (stateless tier).',
        'Read-heavy DB bottleneck → read replicas (offload reads) and/or ElastiCache (cache hot reads).',
        'Event-driven + no servers → Lambda. Containers without servers → Fargate. Need OS control → EC2.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Design Resilient Architectures',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'High Availability and Fault Tolerance',
      duration: 30,
      summary: 'This session is about staying up when things break. You will learn multi-AZ design, how Route 53 routing and health checks enable failover, the load balancer family, and how to find and remove single points of failure.',
      objectives: [
        'Design highly available architectures across multiple Availability Zones',
        'Use Amazon Route 53 routing policies and health checks for failover',
        'Select the appropriate Elastic Load Balancing type for a workload',
        'Identify and mitigate single points of failure, including at the database tier',
      ],
      preLearningCheck: {
        question: 'A company runs a critical relational database on a single Amazon RDS instance in one Availability Zone. They want automatic failover if that AZ fails, with minimal application change. What should they enable?',
        options: [
          'A read replica in the same AZ',
          'RDS Multi-AZ deployment with a standby in another AZ',
          'A larger instance class',
          'Cross-Region replication to a second Region',
        ],
        correct: 1,
        note: 'Distinguish Multi-AZ (automatic failover for availability) from read replicas (read scaling). The exam tests this exact contrast constantly.',
      },
      sections: [
        {
          heading: 'Availability comes from redundancy across AZs',
          body: 'An Availability Zone is one or more discrete data centers with independent power and networking. Availability Zones in a Region are isolated from each other\'s failures. The foundational HA pattern is therefore: run your workload in at least two AZs so the loss of one AZ does not take you down.\n\nMost managed services make this easy — multi-AZ is a configuration choice, not a redesign.',
        },
        {
          heading: 'Multi-AZ vs read replicas — do not confuse them',
          body: 'Both create a second database, but for opposite reasons.',
          table: {
            headers: ['Feature', 'RDS Multi-AZ', 'RDS read replica'],
            rows: [
              ['Purpose', 'High availability / automatic failover', 'Read scaling / offload reads'],
              ['Standby usable for reads?', 'No (synchronous standby)', 'Yes (serves read traffic)'],
              ['Failover', 'Automatic to the standby', 'Manual promotion to primary'],
              ['Replication', 'Synchronous', 'Asynchronous (eventual consistency)'],
            ],
          },
          callout: { type: 'tip', text: '"Automatic failover / survive AZ outage" → Multi-AZ. "Scale read queries / reporting load" → read replica. You can use both together.' },
        },
        {
          heading: 'Route 53 — DNS routing and failover',
          body: 'Amazon Route 53 is a DNS service with health checks and routing policies that enable both performance and failover designs.',
          bullets: [
            'Failover routing sends traffic to a primary and automatically to a standby if a health check fails.',
            'Latency-based routing directs users to the Region with the lowest latency.',
            'Weighted routing splits traffic by percentage (useful for blue/green or canary).',
            'Geolocation/geoproximity routing routes by user location for compliance or localization.',
          ],
        },
        {
          heading: 'The load balancer family',
          body: 'Elastic Load Balancing distributes traffic and removes individual instances as a single point of failure. Pick the right type.',
          table: {
            headers: ['Type', 'Layer', 'Use for'],
            rows: [
              ['Application Load Balancer (ALB)', 'Layer 7 (HTTP/HTTPS)', 'Web apps, path/host routing, microservices, WAF integration'],
              ['Network Load Balancer (NLB)', 'Layer 4 (TCP/UDP)', 'Extreme performance, static IP, low latency, non-HTTP protocols'],
              ['Gateway Load Balancer (GWLB)', 'Layer 3/4', 'Inserting third-party virtual appliances (firewalls, IDS/IPS)'],
            ],
          },
        },
        {
          heading: 'Hunting single points of failure',
          body: 'A resilient architecture has no component whose failure takes down the system. The exam wants you to spot and remove them.',
          bullets: [
            'Single instance → Auto Scaling group across AZs behind a load balancer.',
            'Single-AZ database → Multi-AZ deployment.',
            'Hard-coded IP / single NAT gateway → one NAT gateway per AZ; use DNS, not IPs.',
            'Connection storms overwhelming the DB → Amazon RDS Proxy pools and shares connections.',
            'Immutable infrastructure (replace, do not patch in place) reduces drift and makes recovery predictable.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'An application must remain available even if an entire Availability Zone goes offline. Which is the most fundamental design choice?',
          options: [
            'Run all resources in one AZ but take frequent backups',
            'Deploy resources across at least two Availability Zones',
            'Use the largest available instance type',
            'Enable detailed CloudWatch monitoring',
          ],
          correct: 1,
          explainCorrect: 'Correct — spreading resources across multiple AZs is the foundational HA pattern, since AZs are isolated from each other\'s failures.',
          elaborativePrompt: 'Backups and monitoring are useful, but neither keeps the app serving traffic during an AZ outage. Explain the difference between protecting data and maintaining availability.',
        },
        {
          afterSection: 3,
          question: 'A company needs a load balancer that can route requests to different target groups based on the URL path (e.g. /api vs /images) and integrate with AWS WAF. Which type fits?',
          options: [
            'Network Load Balancer',
            'Application Load Balancer',
            'Gateway Load Balancer',
            'Classic Load Balancer only',
          ],
          correct: 1,
          explainCorrect: 'Correct — the ALB operates at Layer 7 and supports path- and host-based routing plus native WAF integration.',
          elaborativePrompt: 'When would an NLB be the better choice than an ALB despite the ALB\'s richer routing? Think about latency, static IPs, and non-HTTP protocols.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would take a single-AZ, single-instance web-and-database app and make it highly available: which tier gets an Auto Scaling group, which database setting you enable, how Route 53 and the load balancer fit, and what single points of failure remain after your changes.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a production application backed by a single Amazon RDS for PostgreSQL instance in one Availability Zone. The business requires that the database automatically fail over with minimal downtime if the Availability Zone becomes unavailable, and the team wants to avoid application code changes. Which solution meets these requirements?',
        options: [
          'Create a read replica in the same Availability Zone and promote it manually if needed',
          'Enable a Multi-AZ deployment so RDS maintains a synchronous standby in another Availability Zone with automatic failover',
          'Take automated snapshots every hour and restore from snapshot during an outage',
          'Migrate the database to a larger instance class in the same Availability Zone',
        ],
        correct: 1,
        explanation: {
          summary: 'RDS Multi-AZ keeps a synchronous standby in a second AZ and fails over to it automatically via a DNS endpoint change, requiring no application code changes and meeting the minimal-downtime requirement.',
          perOption: [
            'A same-AZ read replica neither survives the AZ failure nor fails over automatically; promotion is manual.',
            'Correct — Multi-AZ provides an automatic, synchronous standby in another AZ with failover handled by AWS and no code changes.',
            'Hourly snapshots restore slowly and lose up to an hour of data, missing the minimal-downtime requirement.',
            'A larger instance in the same AZ does nothing for AZ-level failure — it remains a single point of failure.',
          ],
          link: 'Domain 2 · Task 2.2 — Implement designs to mitigate single points of failure',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Availability Zone (AZ)', def: 'One or more isolated data centers in a Region with independent power and networking.' },
        { term: 'RDS Multi-AZ', def: 'A deployment with a synchronous standby in another AZ and automatic failover, for high availability.' },
        { term: 'Failover routing', def: 'A Route 53 policy that sends traffic to a standby endpoint automatically when the primary health check fails.' },
        { term: 'Single point of failure (SPOF)', def: 'Any component whose failure takes down the whole system; resilient designs eliminate these.' },
        { term: 'RDS Proxy', def: 'A managed connection pool that shares and manages database connections to improve scalability and failover.' },
      ],
      awsServices: [
        { name: 'Amazon Route 53', purpose: 'DNS with health checks and routing policies (failover, latency, weighted, geolocation) for HA and performance.' },
        { name: 'Elastic Load Balancing', purpose: 'Distributes traffic and removes single instances as SPOFs; ALB (L7), NLB (L4), GWLB (appliances).' },
        { name: 'Amazon RDS (Multi-AZ)', purpose: 'Managed relational database with synchronous standby and automatic failover for high availability.' },
        { name: 'Amazon RDS Proxy', purpose: 'Pools and shares database connections to handle connection storms and speed failover.' },
        { name: 'AWS X-Ray', purpose: 'Traces requests across distributed components to find failures and bottlenecks.' },
      ],
      examTips: [
        '"Automatic failover / survive AZ outage / no code change" (database) → RDS Multi-AZ.',
        '"Scale read queries / reporting" → read replica (not Multi-AZ).',
        'Path/host routing + WAF → ALB. Static IP, extreme low latency, TCP/UDP → NLB. Insert firewalls/appliances → GWLB.',
        'DNS failover between primary and standby endpoints → Route 53 failover routing with health checks.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · Design Resilient Architectures',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Disaster Recovery — RPO, RTO, and the Four Strategies',
      duration: 30,
      summary: 'The final D2 session covers disaster recovery across Regions. You will learn the two metrics that drive every DR decision — RPO and RTO — and the four AWS DR strategies, from cheap-and-slow backup & restore to expensive-and-instant active-active.',
      objectives: [
        'Define RPO and RTO and use them to select a DR strategy',
        'Compare backup & restore, pilot light, warm standby, and active-active',
        'Design multi-Region data replication for durability and recovery',
        'Match a business requirement and budget to the right DR pattern',
      ],
      preLearningCheck: {
        question: 'A business states it can tolerate losing at most 5 minutes of data and must be back online within 10 minutes after a Regional disaster, and budget is not a primary constraint. Which DR strategy fits best?',
        options: [
          'Backup and restore',
          'Pilot light',
          'Warm standby or active-active',
          'No DR plan is needed for these numbers',
        ],
        correct: 2,
        note: 'Very low RPO/RTO (minutes) rules out backup/restore and pilot light. The tighter the objectives, the warmer and more expensive the strategy.',
      },
      sections: [
        {
          heading: 'RPO and RTO — the two numbers that decide everything',
          body: 'Every DR decision flows from two metrics:\n\nRPO (Recovery Point Objective) — how much data you can afford to lose, measured in time. An RPO of 1 hour means you can lose up to an hour of data.\n\nRTO (Recovery Time Objective) — how long you can afford to be down before recovery. An RTO of 30 minutes means you must be back within 30 minutes.\n\nThe smaller the numbers, the warmer (and costlier) the strategy you need. The exam gives you the RPO/RTO and budget; you pick the matching strategy.',
        },
        {
          heading: 'The four DR strategies',
          interactive: 'dr-strategy',
          body: 'AWS defines four DR strategies along a spectrum of cost vs recovery speed.',
          table: {
            headers: ['Strategy', 'How it works', 'RPO / RTO', 'Cost'],
            rows: [
              ['Backup & restore', 'Back up data to another Region; provision everything on disaster', 'Hours', 'Lowest'],
              ['Pilot light', 'Core (e.g. database) replicated and always on; rest provisioned on disaster', 'Minutes–tens of minutes', 'Low'],
              ['Warm standby', 'A scaled-down but running copy of the full stack; scale up on disaster', 'Minutes', 'Medium'],
              ['Active-active (multi-site)', 'Full stack running in multiple Regions serving traffic simultaneously', 'Near zero', 'Highest'],
            ],
          },
          callout: { type: 'tip', text: 'Read the qualifier: "lowest cost" with relaxed RPO/RTO → backup & restore. "Near-zero downtime / lose almost no data" → warm standby or active-active. Pilot light and warm standby are the middle-ground answers.' },
        },
        {
          heading: 'Choosing along the spectrum',
          body: 'Map the requirement to the strategy.',
          bullets: [
            'Backup & restore — cheapest; acceptable when hours of RPO/RTO are fine. Use AWS Backup and cross-Region copies.',
            'Pilot light — keep the critical data layer replicated and minimal core running; spin up the rest when needed.',
            'Warm standby — a smaller always-on replica of the whole system; faster than pilot light because everything is already running.',
            'Active-active — both Regions serve live traffic; highest cost, near-zero RTO, used for the most critical systems.',
          ],
        },
        {
          heading: 'Replication and failover building blocks',
          body: 'DR is implemented with specific AWS features.',
          bullets: [
            'S3 Cross-Region Replication (CRR) copies objects to another Region automatically.',
            'Amazon Aurora Global Database and RDS cross-Region read replicas replicate databases across Regions with low lag.',
            'DynamoDB global tables provide multi-Region, active-active data replication.',
            'Route 53 health checks and failover routing redirect users to the recovery Region.',
            'AWS Backup supports cross-Region (and cross-account) backup copies for compliance and recovery.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company can tolerate up to 8 hours of data loss and a full day of downtime for an internal tool, and wants the cheapest DR approach. Which strategy fits?',
          options: [
            'Active-active multi-Region',
            'Warm standby',
            'Backup and restore',
            'Pilot light',
          ],
          correct: 2,
          explainCorrect: 'Correct — relaxed RPO/RTO (hours) plus a cost priority points squarely to backup & restore, the lowest-cost strategy.',
          elaborativePrompt: 'Explain why paying for warm standby or active-active here would be a poor architectural decision, even though they recover faster. Tie your answer to matching cost to the actual requirement.',
        },
        {
          afterSection: 2,
          question: 'A mission-critical payment system requires near-zero data loss and near-zero recovery time across Regions. Which strategy is appropriate?',
          options: [
            'Backup and restore with daily snapshots',
            'Pilot light with the database off until needed',
            'Active-active (multi-site) across two Regions',
            'A single-Region Multi-AZ deployment only',
          ],
          correct: 2,
          explainCorrect: 'Correct — near-zero RPO and RTO across Regions calls for active-active, where both Regions serve live traffic and data is continuously replicated.',
          elaborativePrompt: 'Single-Region Multi-AZ (option 4) is excellent for AZ failures but insufficient here. Explain what class of failure active-across-Regions protects against that Multi-AZ alone does not.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would walk from a stated RPO and RTO to a DR strategy and its AWS building blocks. Pick two contrasting cases — one with hours of tolerance and a tight budget, one with minutes of tolerance and a critical workload — and justify the strategy and the replication features for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a critical application in a single AWS Region. Management requires that, in the event of a full Regional outage, the application recover in another Region within a few minutes (low RTO) with no more than a few minutes of data loss (low RPO). The company is willing to pay for standby infrastructure but does not need both Regions serving production traffic at all times. Which DR strategy BEST fits these requirements?',
        options: [
          'Backup and restore using cross-Region snapshot copies',
          'Pilot light with only the database replicated and all compute off',
          'Warm standby — a scaled-down but always-running copy of the full stack in the second Region, scaled up on failover',
          'A single-Region Multi-AZ deployment',
        ],
        correct: 2,
        explanation: {
          summary: 'Warm standby keeps a smaller but fully running copy of the stack in a second Region, so failover and scale-up take minutes (low RTO) with continuously replicated data (low RPO), without paying for full active-active.',
          perOption: [
            'Backup and restore requires provisioning the environment after the disaster, giving RTO in hours — too slow for the requirement.',
            'Pilot light keeps compute off until disaster, so bringing the full stack up takes longer than the few-minutes RTO allows.',
            'Correct — warm standby balances low RPO/RTO against cost and matches "willing to pay for standby but not full active-active".',
            'Multi-AZ protects against AZ failure within one Region; it does not survive a full Regional outage.',
          ],
          link: 'Domain 2 · Task 2.2 — Selecting an appropriate DR strategy',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
        { videoId: 'dn4F15S4cNw', title: 'Cloud DR Architecture: Backup, Pilot Light, Warm Standby, Active-Active', channel: 'Go Cloud Architects', relevance: 'A visual comparison of the four DR strategies and their RPO/RTO and cost trade-offs — exactly this session\'s topic.' },
      ],
      keyTerms: [
        { term: 'RPO', def: 'Recovery Point Objective — the maximum acceptable amount of data loss, measured in time.' },
        { term: 'RTO', def: 'Recovery Time Objective — the maximum acceptable time to restore service after a disaster.' },
        { term: 'Pilot light', def: 'A DR strategy where core data is replicated and minimal core services run, with the rest provisioned on disaster.' },
        { term: 'Warm standby', def: 'A DR strategy running a scaled-down but live copy of the full stack, scaled up on failover.' },
        { term: 'Active-active (multi-site)', def: 'A DR strategy where multiple Regions serve production traffic simultaneously, giving near-zero RTO/RPO.' },
      ],
      awsServices: [
        { name: 'AWS Backup', purpose: 'Centralized backups with cross-Region and cross-account copy for the backup-and-restore strategy.' },
        { name: 'Amazon S3 Cross-Region Replication', purpose: 'Automatically replicates objects to a bucket in another Region for DR and compliance.' },
        { name: 'Amazon Aurora Global Database', purpose: 'Low-latency cross-Region database replication with fast Regional failover.' },
        { name: 'Amazon DynamoDB global tables', purpose: 'Multi-Region, active-active replicated NoSQL tables for near-zero RPO/RTO.' },
        { name: 'Amazon Route 53', purpose: 'Health checks and failover routing to redirect users to the recovery Region.' },
      ],
      examTips: [
        'Smaller RPO/RTO → warmer, costlier strategy. Larger RPO/RTO + cost priority → backup & restore.',
        'Order of cost/speed: backup & restore < pilot light < warm standby < active-active.',
        '"Near-zero downtime, both Regions live" → active-active. "Cheapest, hours acceptable" → backup & restore.',
        'Multi-AZ ≠ DR across Regions. Multi-AZ survives an AZ; DR strategies survive a Region.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — DESIGN HIGH-PERFORMING ARCHITECTURES (24%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Design High-Performing Architectures',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.1',
      title: 'High-Performing Storage — Object, File, and Block',
      duration: 30,
      summary: 'Domain 3 begins with storage. You will learn the three storage types the exam separates — object, file, block — and how to pick the right service (S3, EFS, FSx, EBS) and configuration to meet a stated performance and scaling demand.',
      objectives: [
        'Distinguish object, file, and block storage and map each to the right AWS service',
        'Select Amazon EBS volume types for throughput vs IOPS requirements',
        'Choose between Amazon EFS and Amazon FSx for shared file storage',
        'Determine storage configurations that scale to meet future performance needs',
      ],
      preLearningCheck: {
        question: 'A fleet of EC2 instances spread across three Availability Zones must all read and write the same set of files concurrently. Which storage service fits?',
        options: [
          'A single Amazon EBS volume attached to all instances',
          'Amazon EFS, mounted by all instances across the AZs',
          'Instance store volumes on each instance',
          'A separate Amazon S3 bucket per instance',
        ],
        correct: 1,
        note: 'Shared, concurrent file access across many instances and AZs is the EFS signal. A standard EBS volume attaches to one instance in one AZ.',
      },
      sections: [
        {
          heading: 'Three storage types, three shapes of problem',
          body: 'The exam expects you to classify a workload by storage type before choosing a service. Object storage is for unstructured data accessed via API (S3). File storage is a shared, mountable file system (EFS, FSx). Block storage is a raw volume attached to one instance like a disk (EBS, instance store).',
          table: {
            headers: ['Type', 'Service', 'Access pattern'],
            rows: [
              ['Object', 'Amazon S3', 'HTTP API, massively scalable, web/data lakes/backups'],
              ['File', 'Amazon EFS / Amazon FSx', 'Shared file system mounted by many clients'],
              ['Block', 'Amazon EBS / instance store', 'A volume attached to a single instance (EBS) or ephemeral local disk (instance store)'],
            ],
          },
          callout: { type: 'tip', text: 'Signal words: "shared across instances" → EFS/FSx. "Attached to one instance / boot volume / database disk" → EBS. "Objects / unlimited / web-accessible" → S3. "Temporary scratch / lost on stop" → instance store.' },
        },
        {
          heading: 'Amazon EBS volume types',
          body: 'EBS volumes back EC2 instances. Choosing the type is a performance-vs-cost decision the exam tests directly.',
          table: {
            headers: ['Volume', 'Category', 'Best for'],
            rows: [
              ['gp3 / gp2', 'General-purpose SSD', 'Most workloads; gp3 lets you provision IOPS/throughput independently of size'],
              ['io2 / io1', 'Provisioned IOPS SSD', 'I/O-intensive databases needing sustained high IOPS and low latency'],
              ['st1', 'Throughput-optimized HDD', 'Large, sequential throughput workloads (big data, log processing)'],
              ['sc1', 'Cold HDD', 'Infrequently accessed, lowest-cost block storage'],
            ],
          },
        },
        {
          heading: 'Shared file storage — EFS vs FSx',
          body: 'When many clients need a shared file system, the choice is about protocol and platform.',
          bullets: [
            'Amazon EFS — fully managed, elastic NFS for Linux. Scales automatically, mounts across AZs, pay for what you use.',
            'Amazon FSx for Windows File Server — fully managed Windows-native SMB file shares with Active Directory integration.',
            'Amazon FSx for Lustre — high-performance file system for HPC, machine learning, and compute-intensive workloads, often paired with S3.',
            'EFS has storage classes (Standard, Infrequent Access) and lifecycle management to reduce cost for cold files.',
          ],
        },
        {
          heading: 'Performance and scale considerations',
          body: 'High-performing storage is about matching the service to the demand and letting it scale.',
          bullets: [
            'S3 scales to virtually unlimited objects and very high request rates; prefix design spreads load automatically.',
            'gp3 decouples IOPS and throughput from volume size — you no longer over-provision capacity just to get performance.',
            'EFS throughput scales with usage (Elastic/Bursting/Provisioned modes) without re-architecting.',
            'For temporary, ultra-low-latency scratch data tied to one instance, instance store outperforms EBS — but the data is lost on stop or termination.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A relational database on EC2 needs sustained high IOPS with consistent low latency. Which EBS volume type is most appropriate?',
          options: [
            'sc1 Cold HDD',
            'io2 Provisioned IOPS SSD',
            'st1 Throughput-optimized HDD',
            'A second instance store volume',
          ],
          correct: 1,
          explainCorrect: 'Correct — Provisioned IOPS SSD (io2/io1) is designed for I/O-intensive databases that need sustained high IOPS and low latency.',
          elaborativePrompt: 'gp3 is now very capable and cheaper than io2. In your own words, at what point would you still choose io2 over a well-tuned gp3 volume?',
        },
        {
          afterSection: 2,
          question: 'A Windows-based application requires a shared file system using SMB with Active Directory integration. Which service should the architect choose?',
          options: [
            'Amazon EFS',
            'Amazon FSx for Windows File Server',
            'Amazon S3',
            'Amazon EBS Multi-Attach',
          ],
          correct: 1,
          explainCorrect: 'Correct — FSx for Windows File Server provides native SMB shares with Active Directory integration; EFS is NFS for Linux.',
          elaborativePrompt: 'EFS and FSx are both shared file systems. Explain the deciding factor between them, and why S3 (object storage) does not satisfy a "shared file system" requirement.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would pick storage for three workloads: a web app serving millions of images, a Linux fleet sharing a content directory across AZs, and a high-IOPS transactional database. Name the service and configuration for each and justify it by storage type and performance need.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a content management application on a group of Amazon EC2 instances in an Auto Scaling group across multiple Availability Zones. All instances must read from and write to the same set of files at the same time, and the storage must scale automatically as content grows. Which storage solution meets these requirements?',
        options: [
          'Attach a single Amazon EBS volume and share it among all instances',
          'Use Amazon EFS and mount the file system on all instances',
          'Store the files on instance store volumes on each instance',
          'Provision a separate gp3 EBS volume for each instance',
        ],
        correct: 1,
        explanation: {
          summary: 'Amazon EFS is an elastic, shared NFS file system that many instances across AZs can mount and write to concurrently, and it scales automatically — matching every requirement.',
          perOption: [
            'A standard EBS volume attaches to one instance in one AZ and cannot be shared concurrently across a multi-AZ fleet.',
            'Correct — EFS supports concurrent shared access across instances and AZs and grows automatically with the data.',
            'Instance store is ephemeral and local to each instance; it is neither shared nor durable.',
            'Per-instance EBS volumes are isolated copies, so instances would not share the same files.',
          ],
          link: 'Domain 3 · Task 3.1 — Determine high-performing and/or scalable storage solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Object storage', def: 'Data stored as objects accessed via API (Amazon S3); massively scalable, ideal for unstructured data.' },
        { term: 'Block storage', def: 'Raw volumes attached to a single instance like a disk (Amazon EBS, instance store).' },
        { term: 'Amazon EFS', def: 'Elastic, shared NFS file system for Linux that many instances can mount across AZs.' },
        { term: 'Provisioned IOPS SSD (io2/io1)', def: 'EBS volume type for I/O-intensive databases needing sustained high IOPS and low latency.' },
        { term: 'Instance store', def: 'Ephemeral local disk physically attached to the host; very fast but lost on stop/terminate.' },
      ],
      awsServices: [
        { name: 'Amazon S3', purpose: 'Highly scalable object storage with 11 nines of durability for unstructured data, data lakes, and backups.' },
        { name: 'Amazon EBS', purpose: 'Block storage volumes for EC2; types from gp3 (general) to io2 (high IOPS) to st1/sc1 (HDD).' },
        { name: 'Amazon EFS', purpose: 'Elastic, shared NFS file storage for Linux, mountable across instances and AZs.' },
        { name: 'Amazon FSx', purpose: 'Managed file systems: FSx for Windows (SMB/AD) and FSx for Lustre (high-performance computing).' },
      ],
      examTips: [
        'Shared file system across instances/AZs → EFS (Linux/NFS) or FSx for Windows (SMB/AD).',
        'High-IOPS database volume → io2/io1. General workloads → gp3 (decouples IOPS/throughput from size).',
        'Sequential big-data throughput → st1; lowest-cost cold block → sc1.',
        'Temporary scratch lost on stop → instance store; durable single-instance volume → EBS.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Design High-Performing Architectures',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.2',
      title: 'High-Performing and Elastic Compute',
      duration: 30,
      summary: 'This session picks the right compute for a performance requirement. You will learn EC2 instance families, how Auto Scaling delivers elasticity, when serverless and containers outperform instances, and how to size resources to the workload.',
      objectives: [
        'Select the appropriate EC2 instance family for a workload profile',
        'Use Auto Scaling and scaling metrics to deliver elastic compute',
        'Choose between EC2, containers, Lambda, Fargate, Batch, and EMR',
        'Right-size compute resources (e.g. instance size, Lambda memory) to meet performance goals',
      ],
      preLearningCheck: {
        question: 'A workload processes thousands of independent, short image-resize jobs triggered by uploads. Traffic is spiky and unpredictable, and the team does not want to manage servers. Which compute option fits best?',
        options: [
          'A fixed fleet of large EC2 instances running continuously',
          'AWS Lambda triggered by each upload event',
          'A single very large EC2 instance scaled vertically',
          'An Amazon EMR cluster running 24/7',
        ],
        correct: 1,
        note: 'Event-driven, short, independent tasks with spiky load and no server management is the Lambda signal — it scales automatically and you pay per invocation.',
      },
      sections: [
        {
          heading: 'EC2 instance families — match the bottleneck',
          body: 'EC2 instances come in families optimized for different resource bottlenecks. The exam describes a workload profile; you pick the family.',
          table: {
            headers: ['Family', 'Optimized for', 'Example workload'],
            rows: [
              ['General purpose (M, T)', 'Balanced CPU/memory', 'Web servers, small databases, dev/test'],
              ['Compute optimized (C)', 'High CPU', 'Batch processing, gaming servers, scientific modeling'],
              ['Memory optimized (R, X)', 'Large RAM', 'In-memory databases, real-time analytics'],
              ['Storage optimized (I, D)', 'High local disk I/O', 'NoSQL databases, data warehousing'],
              ['Accelerated (P, G)', 'GPUs / accelerators', 'Machine learning, graphics rendering'],
            ],
          },
        },
        {
          heading: 'Elasticity through Auto Scaling',
          body: 'Elastic compute matches capacity to demand automatically. Auto Scaling adds and removes instances based on a metric or schedule, and replaces unhealthy ones.',
          bullets: [
            'Target tracking keeps a metric on target (e.g. average CPU 60%) — the simplest, recommended policy.',
            'Step and simple scaling react to CloudWatch alarm thresholds.',
            'Scheduled scaling handles known patterns (business-hours scale-up).',
            'Predictive scaling uses ML to provision ahead of forecast demand.',
          ],
          callout: { type: 'note', text: 'Identify the right scaling metric. CPU is common, but a queue-backed worker tier often scales better on SQS queue depth (a custom CloudWatch metric) than on CPU.' },
        },
        {
          heading: 'EC2 vs serverless vs containers vs purpose-built',
          body: 'Pick the compute model that meets the performance need with the least overhead.',
          bullets: [
            'AWS Lambda — event-driven, short tasks, automatic scaling to zero; size by configuring memory (which also scales CPU).',
            'AWS Fargate — serverless containers; run ECS/EKS tasks without managing instances.',
            'Amazon ECS / EKS on EC2 — when you need cluster-level control or specific instance capabilities.',
            'AWS Batch — managed batch computing that provisions optimal compute for large job queues.',
            'Amazon EMR — managed big-data processing (Spark, Hadoop) for large-scale data transformation and analytics.',
          ],
        },
        {
          heading: 'Right-sizing for performance',
          body: 'Performance is not just "bigger". Match the resource to the workload.',
          bullets: [
            'For Lambda, more memory means more CPU — increasing memory can make a function both faster and cheaper per invocation.',
            'Decouple components so each scales independently rather than over-provisioning a monolith.',
            'Use Compute Optimizer recommendations to find the right instance type and size from real utilization.',
            'Place latency-sensitive instances in a cluster placement group for high network throughput between them.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A scientific simulation is CPU-bound and runs for hours at near-100% processor utilization with modest memory needs. Which EC2 instance family is the best fit?',
          options: [
            'Memory optimized (R)',
            'Compute optimized (C)',
            'Storage optimized (I)',
            'General purpose (T burstable)',
          ],
          correct: 1,
          explainCorrect: 'Correct — compute optimized (C family) targets CPU-bound workloads like batch processing and scientific modeling.',
          elaborativePrompt: 'Why would a T-family burstable instance be a poor choice for a sustained near-100% CPU workload? Think about how burstable CPU credits behave under constant load.',
        },
        {
          afterSection: 2,
          question: 'A team wants to run containerized microservices without managing or patching any EC2 instances or clusters. Which option fits?',
          options: [
            'Amazon ECS on the EC2 launch type',
            'AWS Fargate (with ECS or EKS)',
            'A self-managed Kubernetes cluster on EC2',
            'AWS Batch on managed EC2',
          ],
          correct: 1,
          explainCorrect: 'Correct — Fargate runs containers serverlessly, removing instance and cluster management entirely.',
          elaborativePrompt: 'Fargate removes server management but costs more per unit of raw compute than EC2. Explain when a team would still choose the EC2 launch type despite the extra operational work.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would choose compute for three cases: a steady web tier, a spiky event-driven image processor, and a nightly large-scale data transformation. Name the service, the scaling approach, and how you would size each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company processes uploaded documents with a function that runs for a few seconds per document. Upload volume is highly variable, ranging from zero to thousands per minute. The company wants the processing tier to scale automatically with no idle cost and no servers to manage. Which solution meets these requirements MOST cost-effectively?',
        options: [
          'A fixed Auto Scaling group of EC2 instances sized for peak load',
          'AWS Lambda invoked per document, scaling automatically with demand',
          'A single large memory-optimized EC2 instance running continuously',
          'An always-on Amazon EMR cluster',
        ],
        correct: 1,
        explanation: {
          summary: 'Lambda scales automatically from zero to thousands of concurrent executions, charges only per invocation and duration, and removes server management — ideal for short, spiky, event-driven processing.',
          perOption: [
            'An Auto Scaling group sized for peak pays for idle capacity at low volume and still requires instance management.',
            'Correct — Lambda matches the spiky, short-task profile with automatic scaling and no idle cost or servers.',
            'A continuously running large instance incurs cost even at zero volume and does not scale elastically.',
            'An always-on EMR cluster is for large-scale data processing and would be expensive and idle for this event-driven workload.',
          ],
          link: 'Domain 3 · Task 3.2 — Design high-performing and elastic compute solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Instance family', def: 'A group of EC2 instance types optimized for a resource profile (compute, memory, storage, accelerated).' },
        { term: 'Target tracking scaling', def: 'An Auto Scaling policy that adjusts capacity to keep a chosen metric at a target value.' },
        { term: 'AWS Fargate', def: 'Serverless compute for containers — run ECS/EKS tasks without managing instances.' },
        { term: 'Right-sizing', def: 'Matching the instance type/size or function memory to the workload\'s real needs for best performance and cost.' },
        { term: 'Placement group (cluster)', def: 'A grouping that packs instances close together for high, low-latency network throughput.' },
      ],
      awsServices: [
        { name: 'Amazon EC2', purpose: 'Resizable virtual servers in instance families optimized for compute, memory, storage, or accelerated workloads.' },
        { name: 'Amazon EC2 Auto Scaling', purpose: 'Adds/removes instances on metrics or schedule for elasticity and self-healing.' },
        { name: 'AWS Lambda', purpose: 'Serverless functions for event-driven, short-lived work; scale to zero, sized by memory.' },
        { name: 'AWS Batch', purpose: 'Fully managed batch computing that provisions optimal compute for large job queues.' },
        { name: 'Amazon EMR', purpose: 'Managed big-data framework (Spark, Hadoop) for large-scale processing and transformation.' },
      ],
      examTips: [
        'CPU-bound → C family. Large RAM/in-memory → R/X. GPU/ML → P/G. Balanced → M/T.',
        'Spiky, short, event-driven, no servers → Lambda. Containers without servers → Fargate.',
        'Scale a queue-worker tier on SQS queue depth, not CPU.',
        'More Lambda memory = more CPU; right-sizing memory can be faster AND cheaper.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Design High-Performing Architectures',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.3',
      title: 'High-Performing Databases — Engines, Replicas, and Caching',
      duration: 30,
      summary: 'This session matches a data workload to the right database and makes it fast. You will learn relational vs non-relational vs in-memory, when to add read replicas, and how caching with ElastiCache and DAX removes database bottlenecks.',
      objectives: [
        'Choose between relational, non-relational, and in-memory database types',
        'Use read replicas to scale read-heavy relational workloads',
        'Integrate caching (ElastiCache, DAX) to meet latency and throughput goals',
        'Apply capacity planning and connection management for performance',
      ],
      preLearningCheck: {
        question: 'An application needs single-digit millisecond reads at massive scale with a flexible, key-based access pattern and no fixed schema. Which database fits best?',
        options: [
          'Amazon RDS for PostgreSQL',
          'Amazon DynamoDB',
          'Amazon Redshift',
          'A self-managed relational database on EC2',
        ],
        correct: 1,
        note: 'Key-based access, no fixed schema, single-digit millisecond latency at scale is the DynamoDB signal. Relational engines fit structured, relational queries.',
      },
      sections: [
        {
          heading: 'Pick the database type first',
          body: 'Before picking a service, classify the data model. The exam rewards matching the workload to the right type rather than forcing everything into a relational engine.',
          table: {
            headers: ['Type', 'Service', 'Use when'],
            rows: [
              ['Relational (OLTP)', 'Amazon RDS / Amazon Aurora', 'Structured data, joins, transactions, fixed schema'],
              ['Non-relational (NoSQL)', 'Amazon DynamoDB', 'Key-value/document, massive scale, single-digit ms latency, flexible schema'],
              ['In-memory', 'Amazon ElastiCache', 'Microsecond latency caching, session stores, leaderboards'],
              ['Data warehouse (OLAP)', 'Amazon Redshift', 'Analytics over large structured datasets, columnar queries'],
            ],
          },
          callout: { type: 'tip', text: 'Aurora is a high-performance relational engine (MySQL/PostgreSQL-compatible) — up to 15 low-latency read replicas and storage that auto-scales. Reach for Aurora when a scenario stresses relational performance and availability.' },
        },
        {
          heading: 'Scaling reads with replicas',
          body: 'Read-heavy relational workloads are scaled by offloading reads from the primary.',
          bullets: [
            'RDS read replicas (asynchronous) serve read traffic; RDS supports several, Aurora up to 15.',
            'Point reporting and analytics queries at replicas to keep the primary free for writes.',
            'Replicas are eventually consistent — there is small replication lag, which matters for read-after-write scenarios.',
            'Read replicas are for scaling reads; they are not the same as Multi-AZ, which is for failover/HA (covered in D2).',
          ],
        },
        {
          heading: 'Caching — ElastiCache and DAX',
          body: 'Caching the hottest reads is often the single biggest performance win.',
          table: {
            headers: ['Need', 'Service', 'Notes'],
            rows: [
              ['Cache relational/query results, sessions', 'Amazon ElastiCache (Redis/Memcached)', 'Microsecond reads; Redis adds persistence, replication, pub/sub'],
              ['Cache DynamoDB reads', 'DynamoDB Accelerator (DAX)', 'In-memory cache that drops DynamoDB read latency from ms to microseconds'],
            ],
          },
        },
        {
          heading: 'Capacity, connections, and proxies',
          body: 'Performance also depends on capacity planning and connection handling.',
          bullets: [
            'DynamoDB capacity: on-demand for unpredictable traffic; provisioned (with auto scaling) for steady, predictable load.',
            'Provisioned IOPS storage for RDS sustains high, consistent database I/O.',
            'RDS Proxy pools connections so a swarm of clients (e.g. many Lambda functions) does not exhaust database connections.',
            'Choose the engine to match the workload: e.g. PostgreSQL vs MySQL features, or Aurora for higher throughput and faster replicas.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A reporting dashboard runs heavy read-only queries that are slowing down a transactional Amazon RDS database. Which change scales reads with minimal application change?',
          options: [
            'Enable Multi-AZ on the RDS instance',
            'Add a read replica and point the dashboard queries at it',
            'Increase the storage size of the primary',
            'Switch the database to DynamoDB',
          ],
          correct: 1,
          explainCorrect: 'Correct — a read replica offloads the reporting reads from the primary, scaling read capacity without re-architecting.',
          elaborativePrompt: 'Multi-AZ also creates a second instance but does not help here. Explain the difference in purpose between a read replica and a Multi-AZ standby.',
        },
        {
          afterSection: 2,
          question: 'A DynamoDB-backed application needs to reduce read latency from single-digit milliseconds to microseconds for repeated reads of the same items. Which service should be added?',
          options: [
            'Amazon ElastiCache for Memcached',
            'DynamoDB Accelerator (DAX)',
            'An RDS read replica',
            'Amazon Redshift',
          ],
          correct: 1,
          explainCorrect: 'Correct — DAX is a purpose-built in-memory cache for DynamoDB that delivers microsecond read latency with no application rewrite.',
          elaborativePrompt: 'You could also place ElastiCache in front of DynamoDB manually. Why is DAX often the cleaner answer specifically for DynamoDB read caching?',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would design the data tier for a high-traffic application: which database type suits the access pattern, whether you would add read replicas or caching (and which cache), and how you would handle a flood of connections from many compute instances.',
      sample: {
        type: 'multiple-choice',
        stem: 'A gaming company stores player profiles and game state that must be retrieved with consistent single-digit millisecond latency at very large scale, with an access pattern based on player ID and no need for complex joins. Which database service is the BEST fit?',
        options: [
          'Amazon RDS for MySQL with read replicas',
          'Amazon DynamoDB',
          'Amazon Redshift',
          'A self-managed PostgreSQL cluster on EC2',
        ],
        correct: 1,
        explanation: {
          summary: 'DynamoDB delivers consistent single-digit millisecond performance at massive scale for key-based access patterns without joins, and it scales seamlessly — exactly this workload.',
          perOption: [
            'RDS for MySQL can scale reads with replicas but is not designed for the massive-scale, key-based, schema-flexible pattern as efficiently as DynamoDB.',
            'Correct — key-based access, huge scale, and single-digit ms latency with no joins is the DynamoDB sweet spot.',
            'Redshift is an analytics data warehouse for large OLAP queries, not low-latency operational key lookups.',
            'A self-managed PostgreSQL cluster adds operational burden and is not optimized for this key-value access pattern at scale.',
          ],
          link: 'Domain 3 · Task 3.3 — Determine high-performing database solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
        { videoId: 'QOVK6CIbgdI', title: 'Which AWS Database Should I Use?', channel: 'Code to the Moon', relevance: 'A concise decision guide across RDS, Aurora, DynamoDB, and more — reinforces choosing the right database for the workload.' },
      ],
      keyTerms: [
        { term: 'Amazon Aurora', def: 'A high-performance, MySQL/PostgreSQL-compatible relational engine with up to 15 fast read replicas and auto-scaling storage.' },
        { term: 'Read replica', def: 'An asynchronous read-only database copy that offloads reads from the primary to scale read throughput.' },
        { term: 'Amazon ElastiCache', def: 'Managed in-memory cache (Redis/Memcached) for microsecond reads and session/leaderboard data.' },
        { term: 'DynamoDB Accelerator (DAX)', def: 'An in-memory cache purpose-built for DynamoDB, cutting read latency to microseconds.' },
        { term: 'On-demand capacity', def: 'A DynamoDB billing mode that scales automatically to traffic with no capacity planning, ideal for unpredictable load.' },
      ],
      awsServices: [
        { name: 'Amazon RDS', purpose: 'Managed relational databases (MySQL, PostgreSQL, etc.) with read replicas and Multi-AZ.' },
        { name: 'Amazon Aurora', purpose: 'Cloud-native relational engine with high throughput, fast replicas, and auto-scaling storage.' },
        { name: 'Amazon DynamoDB', purpose: 'Serverless NoSQL key-value/document database with single-digit ms latency at any scale.' },
        { name: 'Amazon ElastiCache', purpose: 'In-memory caching (Redis/Memcached) to offload databases and serve microsecond reads.' },
        { name: 'Amazon RDS Proxy', purpose: 'Connection pooling that prevents connection exhaustion from many clients (e.g. Lambda).' },
      ],
      examTips: [
        'Key-based, massive scale, single-digit ms, flexible schema → DynamoDB. Structured + joins/transactions → RDS/Aurora.',
        'Scale relational reads → read replicas (not Multi-AZ). Cache DynamoDB reads → DAX. Cache anything in-memory → ElastiCache.',
        'Unpredictable DynamoDB traffic → on-demand; steady → provisioned with auto scaling.',
        'Many Lambda functions exhausting DB connections → RDS Proxy.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s12',
      number: 12,
      module: 'Domain 3 · Design High-Performing Architectures',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.4',
      title: 'High-Performing Networking — Edge, Load Balancing, and Connectivity',
      duration: 30,
      summary: 'This session makes the network fast and scalable. You will learn when to use CloudFront vs Global Accelerator at the edge, how to design scalable topologies, and which connectivity option (Direct Connect, VPN, PrivateLink) meets a performance need.',
      objectives: [
        'Choose between Amazon CloudFront and AWS Global Accelerator for edge performance',
        'Design scalable network topologies with appropriate subnet tiers and routing',
        'Select the appropriate load balancing strategy for a workload',
        'Pick connectivity options (Direct Connect, VPN, PrivateLink) to meet performance requirements',
      ],
      preLearningCheck: {
        question: 'A media company serves large static video and image files to a global audience and wants to reduce latency and origin load by caching content near users. Which service fits best?',
        options: [
          'AWS Global Accelerator',
          'Amazon CloudFront',
          'An internal Application Load Balancer',
          'AWS Direct Connect',
        ],
        correct: 1,
        note: 'Caching static/dynamic web content at edge locations close to users is CloudFront. Global Accelerator improves networking for non-cacheable or non-HTTP traffic, but it does not cache.',
      },
      sections: [
        {
          heading: 'Edge acceleration — CloudFront vs Global Accelerator',
          body: 'Both use the AWS global edge network, but they solve different problems and the exam tests the distinction.',
          table: {
            headers: ['', 'Amazon CloudFront', 'AWS Global Accelerator'],
            rows: [
              ['What it does', 'Caches content (HTTP/S) at edge locations', 'Routes traffic over the AWS backbone to the optimal endpoint'],
              ['Best for', 'Static and dynamic web content, media delivery', 'Non-HTTP (TCP/UDP), gaming, IoT, static anycast IPs, fast failover'],
              ['Caching?', 'Yes — reduces origin load and latency', 'No — it optimizes the network path'],
            ],
          },
          callout: { type: 'tip', text: '"Cache content / static assets / media to global users" → CloudFront. "Non-HTTP, two static IPs, fast Regional failover, optimize the path" → Global Accelerator.' },
        },
        {
          heading: 'Load balancing strategy',
          body: 'The right load balancer is a recurring performance decision (revisited from D2 with a performance lens).',
          bullets: [
            'Application Load Balancer (Layer 7) — HTTP/HTTPS, content-based routing, microservices.',
            'Network Load Balancer (Layer 4) — ultra-low latency, millions of requests/sec, static IP, TCP/UDP.',
            'Gateway Load Balancer — transparently insert third-party network appliances.',
            'Distribute targets across AZs and let the load balancer health-check to keep traffic on healthy targets.',
          ],
        },
        {
          heading: 'Scalable network topology',
          body: 'A high-performing VPC design separates tiers and plans for growth.',
          bullets: [
            'Use subnet tiers (public for load balancers, private for app and data) across multiple AZs.',
            'Plan CIDR ranges and IP addressing for future growth so you do not have to re-architect.',
            'AWS Transit Gateway scales hub-and-spoke connectivity across many VPCs and on-premises, replacing a mesh of peering connections.',
            'AWS PrivateLink exposes a service privately to other VPCs without exposing it to the internet or peering whole networks.',
          ],
        },
        {
          heading: 'Connectivity for performance',
          body: 'Hybrid and private connectivity options trade off consistency, latency, and setup.',
          table: {
            headers: ['Option', 'Characteristic', 'Use when'],
            rows: [
              ['AWS Direct Connect', 'Dedicated private link, consistent latency/bandwidth', 'Steady high-throughput hybrid traffic needing predictable performance'],
              ['Site-to-Site VPN', 'Encrypted tunnel over the internet, quick to set up', 'Quick or backup connectivity; tolerant of internet variability'],
              ['AWS PrivateLink', 'Private access to a service via an interface endpoint', 'Reach a service privately without internet exposure or VPC peering'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An online multiplayer game uses UDP traffic and needs the lowest possible latency to players worldwide, plus fast failover between Regional endpoints and a pair of fixed entry IP addresses. Which service fits?',
          options: [
            'Amazon CloudFront',
            'AWS Global Accelerator',
            'An Application Load Balancer in one Region',
            'Amazon Route 53 weighted routing only',
          ],
          correct: 1,
          explainCorrect: 'Correct — Global Accelerator optimizes non-HTTP (UDP) traffic over the AWS backbone, provides static anycast IPs, and offers fast Regional failover.',
          elaborativePrompt: 'CloudFront also uses edge locations. Explain why it is the wrong choice for low-latency UDP game traffic specifically.',
        },
        {
          afterSection: 2,
          question: 'A company has 20 VPCs and an on-premises network that all need to communicate, and managing individual VPC peering connections has become unmanageable. Which service simplifies this at scale?',
          options: [
            'A separate VPN per VPC pair',
            'AWS Transit Gateway as a central hub',
            'AWS Direct Connect only',
            'A NAT gateway in each VPC',
          ],
          correct: 1,
          explainCorrect: 'Correct — Transit Gateway provides hub-and-spoke connectivity that scales to many VPCs and on-premises networks, replacing a complex peering mesh.',
          elaborativePrompt: 'VPC peering is non-transitive. Explain how that limitation makes a full mesh of peering connections grow unmanageably as the number of VPCs increases.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would design networking for a global web application: where you would put a CDN, which load balancer the web tier uses, how the VPC subnets are tiered across AZs, and which connectivity option links a corporate data center for steady high-throughput traffic.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company delivers a website with large static assets (images, videos, downloads) to users across the world. Users far from the origin Region experience slow load times, and the origin servers are heavily loaded serving repeated requests for the same files. Which solution improves performance MOST effectively?',
        options: [
          'Place an Application Load Balancer in front of the origin servers',
          'Use Amazon CloudFront to cache the static assets at edge locations near users',
          'Move the origin servers to a larger instance type',
          'Enable AWS Global Accelerator in front of the origin',
        ],
        correct: 1,
        explanation: {
          summary: 'CloudFront caches the static assets at edge locations close to users, cutting latency for distant users and offloading repeated requests from the origin — addressing both problems.',
          perOption: [
            'An ALB distributes load within a Region but does not cache content or bring it closer to global users.',
            'Correct — CloudFront edge caching reduces global latency and origin load for repeatedly requested static content.',
            'A bigger origin instance does not reduce distance-based latency or cache repeated requests.',
            'Global Accelerator optimizes the network path but does not cache content, so the origin still serves every repeated request.',
          ],
          link: 'Domain 3 · Task 3.4 — Determine high-performing and/or scalable network architectures',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Amazon CloudFront', def: 'A content delivery network that caches content at edge locations to reduce latency and origin load.' },
        { term: 'AWS Global Accelerator', def: 'A service that routes traffic over the AWS backbone to the optimal endpoint with static anycast IPs and fast failover.' },
        { term: 'AWS Transit Gateway', def: 'A central hub that connects many VPCs and on-premises networks, replacing a peering mesh.' },
        { term: 'AWS PrivateLink', def: 'Private connectivity to a service via an interface endpoint, without internet exposure or peering.' },
        { term: 'AWS Direct Connect', def: 'A dedicated private network link from on-premises to AWS for consistent latency and bandwidth.' },
      ],
      awsServices: [
        { name: 'Amazon CloudFront', purpose: 'CDN that caches static and dynamic content at edge locations for low global latency.' },
        { name: 'AWS Global Accelerator', purpose: 'Optimizes traffic over the AWS backbone with static IPs and fast failover; ideal for non-HTTP and gaming.' },
        { name: 'Elastic Load Balancing', purpose: 'Distributes traffic; ALB (L7 routing), NLB (L4 low latency/static IP), GWLB (appliances).' },
        { name: 'AWS Transit Gateway', purpose: 'Scales connectivity across many VPCs and on-premises networks via a central hub.' },
        { name: 'AWS Direct Connect', purpose: 'Dedicated private connection for predictable, high-throughput hybrid networking.' },
      ],
      examTips: [
        'Cache web/media content for global users → CloudFront. Non-HTTP/UDP, static IPs, fast failover → Global Accelerator.',
        'Path/host routing → ALB. Extreme low latency, static IP, TCP/UDP → NLB. Insert appliances → GWLB.',
        'Many VPCs + on-prem connectivity at scale → Transit Gateway (not a peering mesh).',
        'Steady high-throughput hybrid with predictable performance → Direct Connect; quick/backup → VPN.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s13',
      number: 13,
      module: 'Domain 3 · Design High-Performing Architectures',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.5',
      title: 'Data Ingestion and Transformation — Streaming, ETL, and Analytics',
      duration: 30,
      summary: 'The last D3 session moves and transforms data at scale. You will learn streaming ingestion with Kinesis, serverless ETL with Glue, querying S3 with Athena, building data lakes, and bulk transfer options like DataSync and Snow Family.',
      objectives: [
        'Design streaming ingestion with Amazon Kinesis for real-time data',
        'Use AWS Glue for serverless ETL and Amazon Athena to query data in S3',
        'Build and secure data lakes on Amazon S3 with AWS Lake Formation',
        'Select the right data transfer service for a migration or ingestion need',
      ],
      preLearningCheck: {
        question: 'A company must ingest a continuous, high-volume stream of clickstream events in real time so multiple consumers can process them within seconds. Which service is purpose-built for this?',
        options: [
          'Amazon S3 with periodic batch uploads',
          'Amazon Kinesis Data Streams',
          'AWS Glue scheduled nightly jobs',
          'Amazon Athena',
        ],
        correct: 1,
        note: 'Real-time, continuous, high-volume streaming with multiple consumers is the Kinesis signal. Batch uploads and nightly ETL are not real-time.',
      },
      sections: [
        {
          heading: 'Ingestion patterns — batch vs streaming',
          body: 'Start by classifying how data arrives. Batch ingestion handles large chunks on a schedule; streaming ingestion handles continuous, real-time events. The exam pairs the pattern with the service.',
          bullets: [
            'Real-time streaming → Amazon Kinesis Data Streams (custom consumers) or Amazon Data Firehose (managed delivery to S3/Redshift/OpenSearch).',
            'Managed Kafka → Amazon MSK when teams already use Apache Kafka.',
            'Scheduled/batch transformation → AWS Glue jobs.',
            'Frequency and volume in the scenario tell you whether to stream or batch.',
          ],
        },
        {
          heading: 'Transform — AWS Glue and EMR',
          body: 'Transforming data (cleaning, reformatting, enriching) has a serverless option and a cluster option.',
          table: {
            headers: ['Service', 'Model', 'Use when'],
            rows: [
              ['AWS Glue', 'Serverless ETL + data catalog', 'Serverless transformation, schema discovery, format conversion (e.g. CSV to Parquet)'],
              ['Amazon EMR', 'Managed Spark/Hadoop clusters', 'Large-scale, custom big-data processing with full framework control'],
            ],
          },
          callout: { type: 'note', text: 'Converting data to a columnar format like Parquet (often via Glue) makes downstream Athena/Redshift queries faster and cheaper, because they scan far less data.' },
        },
        {
          heading: 'Query and visualize',
          body: 'Once data lands, you analyze it without standing up servers.',
          bullets: [
            'Amazon Athena runs serverless SQL directly against data in S3 — no infrastructure, pay per query scanned.',
            'Amazon Redshift is the data warehouse for large, repeated analytical queries over structured data.',
            'Amazon QuickSight provides managed dashboards and visualization on top of these sources.',
            'Amazon OpenSearch Service supports search and log analytics.',
          ],
        },
        {
          heading: 'Data lakes and bulk transfer',
          body: 'A data lake centralizes raw and processed data on S3; getting data in is its own decision.',
          bullets: [
            'AWS Lake Formation builds and secures a data lake on S3 with centralized, fine-grained permissions.',
            'AWS DataSync moves large datasets between on-premises and AWS over the network, fast and automated.',
            'AWS Storage Gateway gives on-premises systems hybrid access to AWS storage.',
            'AWS Snow Family physically ships data when network transfer would be too slow for petabyte-scale migrations.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team needs to run serverless ETL jobs that crawl data, infer its schema, and convert CSV files in S3 to Parquet, without managing any servers. Which service fits?',
          options: [
            'Amazon EMR',
            'AWS Glue',
            'Amazon Athena',
            'Amazon Kinesis Data Streams',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Glue is serverless ETL with a data catalog and crawlers, and it handles format conversions like CSV to Parquet without server management.',
          elaborativePrompt: 'EMR can also do this transformation. Explain when a team would choose EMR over Glue despite Glue being serverless.',
        },
        {
          afterSection: 2,
          question: 'An analyst wants to run ad-hoc SQL queries directly against log files stored in Amazon S3 without loading them into a database or running a cluster. Which service is best?',
          options: [
            'Amazon Redshift',
            'Amazon Athena',
            'Amazon RDS',
            'AWS Glue',
          ],
          correct: 1,
          explainCorrect: 'Correct — Athena runs serverless SQL directly on data in S3, ideal for ad-hoc queries with no infrastructure to manage.',
          elaborativePrompt: 'Redshift is also for analytics. Explain the trade-off between Athena (query-in-place on S3) and Redshift (loaded warehouse) for occasional vs heavy repeated queries.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself an end-to-end analytics pipeline: how real-time events are ingested, how raw data lands in a data lake, how it is transformed to an efficient format, and how analysts query and visualize it. Name a service for each stage and justify it.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company collects clickstream data from its website and must ingest it in real time, deliver it into an Amazon S3 data lake, and then run ad-hoc SQL analysis on the stored data. The company wants a fully managed, low-maintenance solution. Which combination of services BEST meets these requirements?',
        options: [
          'Amazon Data Firehose to deliver the stream into S3, then Amazon Athena to query the data in place',
          'Batch-upload nightly files to S3, then restore them into Amazon RDS for querying',
          'Amazon EMR running continuously to ingest and query the data',
          'Amazon SQS to buffer events, then Amazon Redshift loaded hourly',
        ],
        correct: 0,
        explanation: {
          summary: 'Amazon Data Firehose is a fully managed stream-delivery service that lands real-time data into S3, and Athena runs serverless SQL directly on that S3 data — a low-maintenance, real-time-to-analysis pipeline.',
          perOption: [
            'Correct — Firehose handles managed real-time delivery to the S3 data lake and Athena queries it in place with no servers to manage.',
            'Nightly batch uploads are not real-time, and loading into RDS adds management and is not ideal for data-lake-scale analytics.',
            'A continuously running EMR cluster is high-maintenance and costly compared to the managed Firehose + Athena combination.',
            'SQS is a message queue, not a streaming-to-storage delivery service, and hourly Redshift loads are not real-time ingestion.',
          ],
          link: 'Domain 3 · Task 3.5 — Determine high-performing data ingestion and transformation solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'Amazon Kinesis Data Streams', def: 'A service for ingesting continuous, high-volume real-time data streams consumed by custom applications.' },
        { term: 'Amazon Data Firehose', def: 'A managed service that delivers streaming data into destinations like S3, Redshift, and OpenSearch.' },
        { term: 'AWS Glue', def: 'Serverless ETL with a data catalog and crawlers for transforming and cataloging data (e.g. CSV to Parquet).' },
        { term: 'Amazon Athena', def: 'Serverless SQL query service that runs directly against data stored in Amazon S3.' },
        { term: 'AWS Lake Formation', def: 'A service to build and centrally secure a data lake on Amazon S3 with fine-grained permissions.' },
      ],
      awsServices: [
        { name: 'Amazon Kinesis', purpose: 'Real-time streaming ingestion (Data Streams) and managed delivery (Data Firehose) for continuous data.' },
        { name: 'AWS Glue', purpose: 'Serverless ETL and data catalog for transforming, cataloging, and converting data formats.' },
        { name: 'Amazon Athena', purpose: 'Serverless, pay-per-query SQL directly over data in Amazon S3.' },
        { name: 'AWS Lake Formation', purpose: 'Builds and secures S3 data lakes with centralized, fine-grained access control.' },
        { name: 'AWS DataSync', purpose: 'Fast, automated transfer of large datasets between on-premises and AWS over the network.' },
      ],
      examTips: [
        'Real-time streaming ingestion → Kinesis (Data Streams = custom consumers; Firehose = managed delivery to S3/Redshift/OpenSearch).',
        'Serverless ETL / schema discovery / CSV→Parquet → Glue. Big-data cluster control → EMR.',
        'Ad-hoc SQL on S3 with no servers → Athena. Heavy repeated analytics on structured data → Redshift.',
        'Network bulk transfer → DataSync; petabyte offline migration → Snow Family; secured S3 data lake → Lake Formation.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — DESIGN COST-OPTIMIZED ARCHITECTURES (20%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s14',
      number: 14,
      module: 'Domain 4 · Design Cost-Optimized Architectures',
      domain: 'd4',
      weight: '20%',
      task: 'Task 4.1',
      title: 'Cost-Optimized Storage — Classes, Lifecycle, and Tiering',
      duration: 30,
      summary: 'Domain 4 is about spending the least to meet the requirement. This session optimizes storage cost: choosing S3 storage classes by access pattern, automating lifecycle transitions, picking the cheapest EBS option, and using the right data-transfer method.',
      objectives: [
        'Select the most cost-effective S3 storage class for an access pattern',
        'Automate cost reduction with S3 Lifecycle policies and Intelligent-Tiering',
        'Choose cost-effective EBS volume types and transfer methods',
        'Use cost management tools to monitor and control storage spend',
      ],
      preLearningCheck: {
        question: 'A company stores objects that must be retained for 7 years for compliance but are almost never accessed, and retrieval times of several hours are acceptable. Which S3 storage class is the most cost-effective?',
        options: [
          'S3 Standard',
          'S3 Glacier Deep Archive',
          'S3 Standard-Infrequent Access',
          'S3 One Zone-Infrequent Access',
        ],
        correct: 1,
        note: 'Rarely accessed, long-term archival with multi-hour retrieval tolerance is the Glacier Deep Archive signal — the lowest-cost class.',
      },
      sections: [
        {
          heading: 'S3 storage classes — pay for the access pattern',
          interactive: 's3-storage-class',
          body: 'S3 charges less for storage as you accept slower or less frequent access. Matching the class to the access pattern is the core cost lever.',
          table: {
            headers: ['Class', 'Access pattern', 'Notes'],
            rows: [
              ['S3 Standard', 'Frequent', 'Default; highest storage cost, no retrieval fee'],
              ['S3 Standard-IA', 'Infrequent, rapid when needed', 'Lower storage cost, per-GB retrieval fee'],
              ['S3 One Zone-IA', 'Infrequent, re-creatable', 'Cheaper than Standard-IA but stored in one AZ (less resilient)'],
              ['S3 Glacier Instant Retrieval', 'Archive, millisecond access', 'Cheap archive when you still need instant reads'],
              ['S3 Glacier Flexible / Deep Archive', 'Rare archive, minutes-to-hours retrieval', 'Lowest cost; Deep Archive is cheapest for long-term compliance'],
            ],
          },
        },
        {
          heading: 'Intelligent-Tiering for unknown patterns',
          body: 'When access patterns are unknown or changing, S3 Intelligent-Tiering automatically moves objects between tiers based on usage, with no retrieval fees, for a small monitoring charge. It is the exam answer for "unpredictable or unknown access patterns" where you do not want to manage lifecycle rules manually.',
          callout: { type: 'tip', text: '"Unknown/changing access pattern, no operational overhead" → Intelligent-Tiering. "Known pattern, predictable transitions" → Lifecycle policy to a specific class.' },
        },
        {
          heading: 'Lifecycle policies — automate the transitions',
          body: 'S3 Lifecycle rules move objects to cheaper classes or expire them on a schedule, removing manual effort.',
          bullets: [
            'Transition objects to IA after 30 days, to Glacier after 90, expire after a retention period — all automatically.',
            'Combine with versioning rules to expire old non-current versions and clean up incomplete multipart uploads.',
            'Lifecycle is the cost answer when the access pattern is predictable over the object\'s life.',
          ],
        },
        {
          heading: 'Block storage cost and data transfer',
          body: 'Storage cost optimization extends beyond S3.',
          bullets: [
            'gp3 is generally cheaper than gp2 and lets you pay for only the IOPS/throughput you need; HDD (st1/sc1) is cheaper for large sequential or cold data.',
            'Delete unattached EBS volumes and old snapshots — a common source of silent waste flagged by Trusted Advisor.',
            'For one-time bulk migration, AWS Snow Family is cheaper and faster than transferring petabytes over the network; DataSync suits ongoing network transfer.',
            'Track spend with AWS Cost Explorer, set guardrails with AWS Budgets, and use cost allocation tags to attribute storage cost to teams.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company has a large set of objects whose access frequency is unpredictable and varies over time, and it wants to minimize cost without writing lifecycle rules or risking retrieval fees. Which option fits?',
          options: [
            'S3 Standard for everything',
            'S3 Intelligent-Tiering',
            'S3 One Zone-IA',
            'A manual monthly review to move objects',
          ],
          correct: 1,
          explainCorrect: 'Correct — Intelligent-Tiering automatically shifts objects between access tiers based on usage with no retrieval fees and minimal management, ideal for unpredictable patterns.',
          elaborativePrompt: 'Intelligent-Tiering charges a small per-object monitoring fee. Explain when a known, stable access pattern would make a plain Lifecycle policy cheaper than Intelligent-Tiering.',
        },
        {
          afterSection: 0,
          question: 'Re-creatable thumbnail images are accessed infrequently, and the company is comfortable regenerating them if lost. Which S3 class minimizes cost for this data?',
          options: [
            'S3 Standard',
            'S3 One Zone-IA',
            'S3 Glacier Deep Archive',
            'S3 Standard-IA',
          ],
          correct: 1,
          explainCorrect: 'Correct — One Zone-IA is cheaper than Standard-IA and its single-AZ storage is acceptable because the data is re-creatable if that AZ is lost.',
          elaborativePrompt: 'Why is One Zone-IA inappropriate for irreplaceable data even when it is accessed infrequently? Connect this to the durability/availability trade-off.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would cost-optimize storage for a dataset whose objects are hot for 30 days, occasionally accessed for a year, then kept for compliance for 7 years. Decide between lifecycle policies and Intelligent-Tiering, and name the classes you would transition through.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company stores application logs in Amazon S3. The logs are accessed frequently for the first 30 days, rarely after that, and must be retained for 7 years to satisfy compliance. Retrieval of old logs can take several hours if ever needed. Which approach minimizes storage cost with the LEAST operational overhead?',
        options: [
          'Keep all logs in S3 Standard for the full 7 years',
          'Create an S3 Lifecycle policy that moves logs to S3 Standard-IA after 30 days and to S3 Glacier Deep Archive for long-term retention',
          'Manually copy old logs to a cheaper bucket each month',
          'Store all logs in S3 One Zone-IA from day one',
        ],
        correct: 1,
        explanation: {
          summary: 'A Lifecycle policy automatically transitions logs from Standard to Standard-IA at 30 days and then to Glacier Deep Archive for cheap long-term compliance retention — matching the access pattern with no manual effort.',
          perOption: [
            'Keeping everything in Standard for 7 years pays premium storage rates for data that is almost never accessed.',
            'Correct — Lifecycle transitions align cost with the known access pattern automatically; Deep Archive is cheapest for rarely accessed compliance data.',
            'Manual monthly copying is operational overhead and error-prone compared to an automated Lifecycle policy.',
            'One Zone-IA from day one risks data loss if the AZ fails (logs needed for compliance are not re-creatable) and is not optimal for the first 30 days of frequent access.',
          ],
          link: 'Domain 4 · Task 4.1 — Design cost-optimized storage solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'S3 storage class', def: 'A tier of S3 storage priced by access frequency and retrieval speed, from Standard to Glacier Deep Archive.' },
        { term: 'S3 Intelligent-Tiering', def: 'A class that auto-moves objects between access tiers based on usage, with no retrieval fees, for unknown patterns.' },
        { term: 'S3 Lifecycle policy', def: 'Rules that automatically transition objects to cheaper classes or expire them on a schedule.' },
        { term: 'S3 Glacier Deep Archive', def: 'The lowest-cost S3 class for rarely accessed, long-term archival data with multi-hour retrieval.' },
        { term: 'Cost allocation tags', def: 'Tags that attribute AWS cost to teams, projects, or environments in billing reports.' },
      ],
      awsServices: [
        { name: 'Amazon S3 (storage classes)', purpose: 'Tiered object storage priced by access pattern; Lifecycle and Intelligent-Tiering reduce cost automatically.' },
        { name: 'AWS Cost Explorer', purpose: 'Visualizes and analyzes AWS spend and usage trends over time.' },
        { name: 'AWS Budgets', purpose: 'Sets cost/usage thresholds and alerts when spend is forecast to exceed them.' },
        { name: 'AWS Snow Family', purpose: 'Physical devices for cost-effective, fast bulk data migration when network transfer is too slow.' },
        { name: 'AWS Trusted Advisor', purpose: 'Flags cost-optimization opportunities like idle resources and unattached volumes.' },
      ],
      examTips: [
        'Unknown/changing access pattern, no overhead → S3 Intelligent-Tiering. Known pattern → Lifecycle policy.',
        'Rare, long-term archive with hours-OK retrieval → Glacier Deep Archive (cheapest). Instant archive reads → Glacier Instant Retrieval.',
        'Re-creatable, infrequent data → One Zone-IA. Irreplaceable data → never One Zone-IA.',
        'gp3 < gp2 in cost; delete unattached volumes/old snapshots; petabyte one-time migration → Snow Family.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s15',
      number: 15,
      module: 'Domain 4 · Design Cost-Optimized Architectures',
      domain: 'd4',
      weight: '20%',
      task: 'Task 4.2',
      title: 'Cost-Optimized Compute — Purchasing Options and Right-Sizing',
      duration: 30,
      summary: 'This session cuts compute cost. You will learn the EC2 purchasing options (On-Demand, Reserved, Savings Plans, Spot) and which workload each fits, plus right-sizing, auto scaling, and serverless as cost levers.',
      objectives: [
        'Match EC2 purchasing options to workload patterns for lowest cost',
        'Use Spot Instances for fault-tolerant, flexible workloads',
        'Right-size compute and use auto scaling to avoid paying for idle capacity',
        'Choose cost-effective compute services (Lambda, Fargate, EC2) for a workload',
      ],
      preLearningCheck: {
        question: 'A company runs a fault-tolerant batch image-processing job that can be interrupted and resumed at any time, and wants to minimize compute cost. Which EC2 purchasing option fits best?',
        options: [
          'On-Demand Instances',
          'Spot Instances',
          'Reserved Instances (3-year, no upfront)',
          'Dedicated Hosts',
        ],
        correct: 1,
        note: 'Fault-tolerant, interruptible, flexible-timing work is the Spot signal — up to ~90% cheaper, at the cost of possible interruption.',
      },
      sections: [
        {
          heading: 'The four purchasing options',
          body: 'EC2 pricing is a major exam topic. Match the commitment model to the workload pattern.',
          table: {
            headers: ['Option', 'Best for', 'Savings vs On-Demand'],
            rows: [
              ['On-Demand', 'Short-term, spiky, unpredictable, or first-time workloads', 'Baseline (none)'],
              ['Savings Plans', 'Steady, predictable usage; flexible across instance family/Region/compute type', 'Up to ~72%'],
              ['Reserved Instances', 'Steady-state workloads on a known instance type for 1 or 3 years', 'Up to ~72%'],
              ['Spot Instances', 'Fault-tolerant, interruptible, flexible workloads', 'Up to ~90%'],
            ],
          },
          callout: { type: 'tip', text: 'Workload-to-option reflexes: spiky/unknown → On-Demand. Steady 24/7 baseline → Savings Plans or Reserved. Interruptible batch/CI/big-data → Spot. Savings Plans add flexibility Reserved Instances lack.' },
        },
        {
          heading: 'Savings Plans vs Reserved Instances',
          body: 'Both reward commitment with discounts; the difference is flexibility.',
          bullets: [
            'Compute Savings Plans apply across instance families, sizes, Regions, and even Fargate/Lambda — maximum flexibility.',
            'EC2 Instance Savings Plans commit to a family in a Region for a deeper discount.',
            'Reserved Instances commit to specific attributes; Convertible RIs allow some changes, Standard RIs the least.',
            'For most "predictable steady-state, want flexibility" scenarios, Savings Plans are the modern preferred answer.',
          ],
        },
        {
          heading: 'Spot for the right workloads',
          body: 'Spot Instances use spare AWS capacity at steep discounts but can be reclaimed with a short notice.',
          bullets: [
            'Ideal for batch jobs, CI/CD, big-data processing, and stateless web tiers that tolerate interruption.',
            'Not for stateful, time-critical, or single-instance workloads that cannot be interrupted.',
            'Combine Spot with On-Demand/Reserved in an Auto Scaling group (mixed instances) to balance cost and reliability.',
          ],
        },
        {
          heading: 'Right-sizing, scaling, and serverless',
          body: 'Buying cheaper is only half of cost optimization; not over-provisioning is the other half.',
          bullets: [
            'Use AWS Compute Optimizer to right-size instances from real utilization data.',
            'Auto Scaling removes idle capacity automatically — scale in when demand drops so you stop paying for unused instances.',
            'Serverless (Lambda, Fargate) eliminates idle cost entirely for spiky or low-utilization workloads — you pay only when running.',
            'Graviton (Arm-based) instances often deliver better price-performance for compatible workloads.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company runs a production web application 24/7 on a predictable, steady fleet and wants to reduce cost while keeping flexibility to change instance families over the commitment term. Which option fits best?',
          options: [
            'On-Demand Instances',
            'Compute Savings Plans',
            'Spot Instances',
            'Standard Reserved Instances locked to one instance type',
          ],
          correct: 1,
          explainCorrect: 'Correct — Compute Savings Plans give deep discounts for steady usage while remaining flexible across instance families, sizes, and Regions.',
          elaborativePrompt: 'Spot is cheaper still. Explain why Spot would be the wrong choice for a steady 24/7 production web tier despite the larger discount.',
        },
        {
          afterSection: 2,
          question: 'A CI/CD system runs many short, interruptible build jobs throughout the day and can simply retry any job that is interrupted. Which purchasing option minimizes cost?',
          options: [
            'Reserved Instances',
            'Spot Instances',
            'On-Demand Instances',
            'Dedicated Hosts',
          ],
          correct: 1,
          explainCorrect: 'Correct — interruptible, retry-safe build jobs are a textbook Spot use case, capturing the largest discount.',
          elaborativePrompt: 'How would you combine Spot with On-Demand in an Auto Scaling group so that build throughput stays acceptable even when Spot capacity is reclaimed?',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would price the compute for a system with three parts: an always-on web tier, an interruptible nightly batch job, and an unpredictable new feature still being load-tested. Assign a purchasing option to each and justify it.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a steady, predictable production workload on Amazon EC2 around the clock and expects to keep running it for at least the next three years. The company wants the lowest cost while retaining the flexibility to change instance families and Regions as the architecture evolves. Which purchasing approach BEST meets these requirements?',
        options: [
          'Run entirely on On-Demand Instances',
          'Purchase a 3-year Compute Savings Plan',
          'Use Spot Instances for the entire workload',
          'Buy 3-year Standard Reserved Instances locked to the current instance type',
        ],
        correct: 1,
        explanation: {
          summary: 'A 3-year Compute Savings Plan gives a deep discount for committed steady usage while staying flexible across instance families, sizes, and Regions — matching both the cost and flexibility requirements.',
          perOption: [
            'On-Demand is the most expensive option for steady 24/7 usage and captures no commitment discount.',
            'Correct — Compute Savings Plans deliver the lowest cost for predictable usage while preserving family/Region flexibility.',
            'Spot can be reclaimed at any time, which is unacceptable for a steady production workload that must stay running.',
            'Standard Reserved Instances give a similar discount but lock to specific attributes, failing the flexibility requirement.',
          ],
          link: 'Domain 4 · Task 4.2 — Design cost-optimized compute solutions',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'On-Demand Instances', def: 'Pay-per-use EC2 with no commitment; best for short-term, spiky, or unpredictable workloads.' },
        { term: 'Savings Plans', def: 'A commitment to a consistent amount of compute usage for 1 or 3 years in exchange for a discount, with family/Region flexibility.' },
        { term: 'Reserved Instances', def: 'A 1- or 3-year commitment to specific instance attributes for a discount over On-Demand.' },
        { term: 'Spot Instances', def: 'Spare EC2 capacity at up to ~90% discount that can be reclaimed; for fault-tolerant, interruptible workloads.' },
        { term: 'AWS Compute Optimizer', def: 'A service that recommends right-sized instance types and sizes from actual utilization.' },
      ],
      awsServices: [
        { name: 'Amazon EC2 (purchasing options)', purpose: 'On-Demand, Savings Plans, Reserved, and Spot models to match cost to workload pattern.' },
        { name: 'AWS Compute Optimizer', purpose: 'Recommends right-sizing of EC2, Auto Scaling groups, Lambda, and EBS from real metrics.' },
        { name: 'Amazon EC2 Auto Scaling', purpose: 'Removes idle capacity by scaling in when demand drops, cutting cost.' },
        { name: 'AWS Lambda', purpose: 'Serverless compute with no idle cost — pay only per invocation and duration.' },
        { name: 'AWS Cost Explorer', purpose: 'Analyzes spend and surfaces Savings Plans/Reserved Instance recommendations.' },
      ],
      examTips: [
        'Spiky/unknown → On-Demand. Steady 24/7 + flexibility → Savings Plans. Steady, fixed type → Reserved. Interruptible → Spot.',
        'Savings Plans flex across family/Region/Fargate/Lambda; Reserved Instances lock attributes.',
        'Cut idle cost: right-size (Compute Optimizer), scale in (Auto Scaling), or go serverless (Lambda/Fargate).',
        'Spot for batch/CI/big-data/stateless; never for stateful, time-critical, single-instance workloads.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s16',
      number: 16,
      module: 'Domain 4 · Design Cost-Optimized Architectures',
      domain: 'd4',
      weight: '20%',
      task: 'Tasks 4.3 & 4.4',
      title: 'Cost-Optimized Databases and Networking',
      duration: 30,
      summary: 'The final session optimizes database and network cost — the two areas where silent spend hides. You will learn cost-effective database choices and the network cost traps (NAT gateways, data transfer) that the exam loves to test.',
      objectives: [
        'Choose cost-effective database types and capacity modes for a workload',
        'Apply backup, retention, and serverless options to control database cost',
        'Reduce network cost from NAT gateways and data transfer',
        'Use VPC endpoints, CloudFront, and routing choices to minimize transfer charges',
      ],
      preLearningCheck: {
        question: 'EC2 instances in a private subnet only need to read and write objects in Amazon S3, and the team wants to avoid the data-processing charges of routing that traffic through a NAT gateway. What should the architect add?',
        options: [
          'A second NAT gateway for redundancy',
          'An S3 gateway VPC endpoint',
          'A public IP address on each instance',
          'An internet gateway attached to the private subnet',
        ],
        correct: 1,
        note: 'A gateway VPC endpoint for S3 (and DynamoDB) routes traffic privately and is free, removing both NAT data-processing charges and internet exposure. A classic SAA cost trap.',
      },
      sections: [
        {
          heading: 'Cost-effective database choices',
          body: 'Database cost optimization starts with picking the right type and capacity mode, not just a smaller instance.',
          bullets: [
            'DynamoDB on-demand for spiky/unpredictable traffic (pay per request); provisioned with auto scaling for steady, predictable load (cheaper at consistent volume).',
            'Aurora Serverless v2 scales database capacity automatically and is cost-effective for variable or intermittent workloads.',
            'Match engine to need: a managed service (RDS/Aurora/DynamoDB) usually beats self-managing a database on EC2 on total cost.',
            'For analytics, a columnar warehouse (Redshift) or query-in-place (Athena) is cheaper than forcing analytics onto an OLTP database.',
          ],
          callout: { type: 'tip', text: '"Unpredictable/intermittent database traffic, do not want to manage capacity" → on-demand / serverless (DynamoDB on-demand, Aurora Serverless). "Steady, predictable" → provisioned capacity.' },
        },
        {
          heading: 'Backups, retention, and replicas',
          body: 'Data protection has a cost dial too.',
          bullets: [
            'Set snapshot frequency and retention to the actual recovery requirement — do not keep more snapshots, longer, than needed.',
            'Read replicas add cost; add them for genuine read-scaling needs, not by default.',
            'Lifecycle and tiering apply to backups too (e.g. cold storage for old backups via AWS Backup).',
          ],
        },
        {
          heading: 'The network cost traps',
          body: 'Networking is where unexpected charges accumulate. The exam tests the well-known traps.',
          table: {
            headers: ['Trap', 'Cheaper approach'],
            rows: [
              ['NAT gateway data-processing charges for AWS-service traffic', 'Use VPC gateway endpoints (free) for S3/DynamoDB; interface endpoints for other services'],
              ['Cross-AZ data transfer charges', 'Keep chatty components in the same AZ where resilience allows; be deliberate about cross-AZ traffic'],
              ['High origin egress for repeated content', 'Put Amazon CloudFront in front to cache and cut origin data-transfer cost'],
              ['One NAT gateway per AZ when traffic is light', 'Balance HA (per-AZ NAT) against cost (a shared NAT) per the requirement'],
            ],
          },
        },
        {
          heading: 'Connectivity and routing cost',
          body: 'Choose connectivity and topology with cost in mind.',
          bullets: [
            'Direct Connect has setup and port cost but lower per-GB transfer than internet/VPN for steady high volume; VPN is cheaper to start for low volume.',
            'Data transfer out to the internet is charged; transfer in is generally free — design accordingly.',
            'Transit Gateway simplifies many-VPC connectivity but adds per-attachment and data-processing cost; VPC peering has no per-hour charge for a few VPCs.',
            'Use Cost Explorer and cost allocation tags to find which workloads drive transfer cost.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A workload generates high data-transfer cost because private instances reach Amazon S3 and DynamoDB through a NAT gateway. Which change reduces this cost the most?',
          options: [
            'Add more NAT gateways',
            'Create gateway VPC endpoints for S3 and DynamoDB',
            'Move the instances to public subnets with public IPs',
            'Switch the instances to larger types',
          ],
          correct: 1,
          explainCorrect: 'Correct — gateway VPC endpoints route S3 and DynamoDB traffic privately for free, removing the NAT gateway data-processing charges entirely.',
          elaborativePrompt: 'Gateway endpoints are free, but interface endpoints (for most other services) have an hourly and per-GB charge. Explain why endpoints can still be worth it versus NAT for those services.',
        },
        {
          afterSection: 0,
          question: 'An application has highly unpredictable, intermittent database traffic and the team does not want to plan or pay for capacity during idle periods. Which option is most cost-effective?',
          options: [
            'A large provisioned RDS instance running continuously',
            'DynamoDB on-demand capacity (or Aurora Serverless)',
            'A 3-year Reserved database instance',
            'Provisioned DynamoDB capacity set to peak',
          ],
          correct: 1,
          explainCorrect: 'Correct — on-demand/serverless database options charge for actual usage and scale to near-zero when idle, ideal for unpredictable, intermittent traffic.',
          elaborativePrompt: 'At very high, steady request volumes, provisioned capacity can be cheaper than on-demand. Explain the crossover point that flips the cost-optimal choice.',
        },
      ],
      selfExplanationPrompt: 'Explain to yourself how you would cut the bill for an architecture with a private subnet talking to S3 through a NAT gateway, a chatty service spread across AZs, and a globally accessed asset library — naming the specific change for each cost trap and why it works.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs application servers in private subnets that frequently read and write large volumes of data to Amazon S3. The data passes through a NAT gateway, and the company is seeing high NAT gateway data-processing charges. The company wants to reduce these costs while keeping the traffic private. Which solution meets these requirements MOST cost-effectively?',
        options: [
          'Add additional NAT gateways to distribute the load',
          'Create an S3 gateway VPC endpoint so traffic to S3 bypasses the NAT gateway',
          'Move the application servers into public subnets',
          'Replace the NAT gateway with a NAT instance on a small EC2 type',
        ],
        correct: 1,
        explanation: {
          summary: 'An S3 gateway VPC endpoint routes S3 traffic privately within the AWS network at no charge, eliminating the NAT gateway data-processing cost while keeping the servers private.',
          perOption: [
            'More NAT gateways increase cost rather than reduce it and still process the same S3 traffic.',
            'Correct — a gateway VPC endpoint for S3 is free, removes NAT data-processing charges, and keeps traffic private.',
            'Moving servers to public subnets exposes them to the internet, violating the private-traffic requirement.',
            'A NAT instance shifts management burden to the company and still processes the traffic; it does not eliminate the per-GB cost the way an endpoint does.',
          ],
          link: 'Domain 4 · Task 4.4 — Design cost-optimized network architectures',
        },
      },
      videos: [
        { videoId: 'c3Cn4xYfxJY', title: 'AWS Solutions Architect Associate (SAA-C03) — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SAA-C03 course (ExamPro). A comprehensive video companion covering this session\'s services alongside the rest of the exam blueprint.' },
      ],
      keyTerms: [
        { term: 'DynamoDB on-demand', def: 'A capacity mode charging per request that scales automatically — cost-effective for unpredictable traffic.' },
        { term: 'Aurora Serverless', def: 'An Aurora mode that auto-scales database capacity, cost-effective for variable or intermittent workloads.' },
        { term: 'Gateway VPC endpoint', def: 'A free endpoint for S3 and DynamoDB that routes traffic privately, avoiding NAT and its data-processing charges.' },
        { term: 'Cross-AZ data transfer', def: 'Charges incurred when data moves between Availability Zones; a common hidden cost.' },
        { term: 'Data transfer out', def: 'The charge for data leaving AWS to the internet; transfer in is generally free.' },
      ],
      awsServices: [
        { name: 'Amazon DynamoDB', purpose: 'On-demand and provisioned capacity modes to match database cost to traffic pattern.' },
        { name: 'Amazon Aurora Serverless', purpose: 'Auto-scaling relational capacity that is cost-effective for variable workloads.' },
        { name: 'VPC endpoints', purpose: 'Private access to AWS services; gateway endpoints (S3/DynamoDB) are free and avoid NAT charges.' },
        { name: 'Amazon CloudFront', purpose: 'Caches content at the edge to reduce repeated origin egress and data-transfer cost.' },
        { name: 'AWS Cost Explorer', purpose: 'Identifies which workloads drive data-transfer and database spend.' },
      ],
      examTips: [
        'Private instances reaching S3/DynamoDB → free gateway VPC endpoint (removes NAT data-processing cost).',
        'Unpredictable/intermittent DB traffic → on-demand / serverless; steady high volume → provisioned.',
        'Cut repeated origin egress → CloudFront. Watch cross-AZ and data-transfer-out charges; transfer in is usually free.',
        'Per-AZ NAT (HA) vs shared NAT (cost) — pick per the requirement. Tag resources to attribute cost.',
      ],
    },

  ],
}

export default saaC03Course
