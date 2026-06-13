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
      videos: [],
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
      videos: [],
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
      videos: [],
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
      videos: [],
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
      videos: [],
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
      videos: [],
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
      videos: [],
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
      videos: [],
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

  ],
}

export default saaC03Course
