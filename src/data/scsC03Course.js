// AWS Certified Security – Specialty (SCS-C03) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors deaC01Course.js / dopC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Course COMPLETE — all 16 sessions across all six domains authored
// (D1 Detection s1–s3, D2 Incident Response s4–s5, D3 Infrastructure Security s6–s8,
//  D4 IAM s9–s10, D5 Data Protection s11–s13, D6 Foundations & Governance s14–s16).

// Verified companion video (oEmbed-checked, public) — appears on every session.
const COMPANION_VIDEO = {
  videoId: '54ANTSF4hQM',
  title: 'AWS Security Specialty (SCS-C02) Full Course — Complete Exam Prep + Hands-On Labs',
  channel: 'Cloud Guru',
  startSeconds: null,
  endSeconds: null,
  relevance: 'Full Security Specialty curriculum — companion to any session. The SCS-C02 content maps almost entirely onto SCS-C03.',
}

const scsC03Course = {
  slug: 'scs-c03',
  title: 'AWS Certified Security – Specialty — Full Prep Course',
  code: 'SCS-C03',
  subtitle: 'Sixteen ~30-minute sessions covering all six domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 170 minutes, pass at 750/1000 (75%). Compensatory scoring — no per-domain minimum. We author multiple choice and multiple response only (the real exam also includes ordering and matching).',
  modules: [
    { id: 'd1', label: 'Domain 1 · Detection', weight: '16%' },
    { id: 'd2', label: 'Domain 2 · Incident Response', weight: '14%' },
    { id: 'd3', label: 'Domain 3 · Infrastructure Security', weight: '18%' },
    { id: 'd4', label: 'Domain 4 · Identity and Access Management', weight: '20%' },
    { id: 'd5', label: 'Domain 5 · Data Protection', weight: '18%' },
    { id: 'd6', label: 'Domain 6 · Security Foundations and Governance', weight: '14%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DETECTION (16%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Detection',
      domain: 'd1',
      weight: '16%',
      task: 'Task 1.1',
      title: 'Monitoring & Alerting — GuardDuty, Security Hub, Macie, and the Detective-Service Map',
      duration: 30,
      summary: 'Detection starts with knowing which service sees which signal. This session builds the single most tested mental model in Domain 1: the difference between GuardDuty (threat detection), Security Hub (posture aggregation), Macie (sensitive-data discovery), Inspector (vulnerability scanning), Detective (investigation), and Config (configuration state). Get this map right and a third of the detection questions answer themselves.',
      objectives: [
        'Distinguish GuardDuty, Security Hub, Macie, Inspector, Detective, and AWS Config by the exact signal each one produces',
        'Design account- and organization-wide monitoring by enabling services through AWS Organizations with a delegated administrator',
        'Aggregate findings into Security Hub and route them to action with EventBridge and SNS',
        'Use Config conformance packs and Systems Manager State Manager to run continuous, automated assessments',
      ],
      preLearningCheck: {
        question: 'A security team wants automatic, intelligent detection of compromised EC2 instances and anomalous IAM credential use across every account — using AWS-managed threat intelligence and with no agents to deploy. Which service fits best?',
        options: [
          'Amazon Macie, because it analyzes data for sensitive content',
          'Amazon GuardDuty, because it continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs for threats using managed intelligence',
          'AWS Config, because it records configuration changes',
          'Amazon Inspector, because it scans for software vulnerabilities',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: GuardDuty is the managed threat-detection service. It ingests CloudTrail, VPC Flow Logs, and DNS logs (no agents) and applies AWS threat intelligence and ML to surface behaviors like credential exfiltration, crypto-mining, and reconnaissance.',
      },
      sections: [
        {
          heading: 'The detective-service map',
          body: 'Almost every Domain 1 question reduces to "which service produces this signal?" Build a sharp, one-line distinction for each:\n\nAmazon GuardDuty — continuous threat detection. It analyzes CloudTrail management and data events, VPC Flow Logs, and DNS query logs (plus optional EKS, RDS, Lambda, and S3 protections) using AWS threat intelligence and machine learning. No agents. It tells you "something malicious is happening" — credential exfiltration, crypto-mining, port scanning, communication with known-bad IPs.\n\nAWS Security Hub — posture and finding aggregation. It does not detect threats itself; it ingests findings from GuardDuty, Inspector, Macie, IAM Access Analyzer, and dozens of partners in a normalized format (ASFF), runs security standards (CIS, AWS Foundational Security Best Practices, PCI), and gives a single prioritized view across accounts.\n\nAmazon Macie — sensitive-data discovery. It scans S3 to find and classify PII, credentials, and financial data, and reports buckets that are public or unencrypted.\n\nAmazon Inspector — vulnerability management. It scans EC2 instances, container images in ECR, and Lambda functions for known CVEs and unintended network exposure.\n\nAmazon Detective — investigation, not detection. It builds a linked-behavior graph from the same logs so you can drill into the root cause of a GuardDuty finding.\n\nAWS Config — configuration state and compliance. It records resource configuration over time and evaluates rules ("is this bucket public?", "is this volume encrypted?"). It answers "what is misconfigured," not "who is attacking."',
          callout: { type: 'note', text: 'The cleanest exam tells: "detect malicious behavior / threat" → GuardDuty. "single view of all findings across accounts / security standard score" → Security Hub. "find PII / sensitive data in S3" → Macie. "scan for CVEs / vulnerabilities" → Inspector. "investigate / root cause a finding" → Detective. "is this resource configured correctly" → Config.' },
          interactive: 'detective-service',
        },
        {
          heading: 'Turning it on for a whole organization',
          body: 'Specialty questions are rarely about a single account — they are about hundreds. The pattern is the same for GuardDuty, Security Hub, Macie, Inspector, and Detective: enable the service through AWS Organizations and designate a delegated administrator account (usually a dedicated security or audit account). The delegated admin can then auto-enable the service for all existing and future member accounts.',
          bullets: [
            'Use a delegated administrator account rather than the Organizations management account — least privilege keeps the management account out of day-to-day security operations.',
            '"Auto-enable for new accounts" guarantees coverage as the org grows; a new account is protected the moment it joins.',
            'Security Hub aggregates findings from all member accounts and can also aggregate across Regions into a single aggregation Region.',
            'GuardDuty, Macie, Inspector, and Detective all support the delegated-admin + auto-enable model — recognizing this pattern answers many "how do you do this at scale" questions.',
          ],
          callout: { type: 'tip', text: 'When a question says "across all accounts in the organization, including future accounts," the answer almost always involves a delegated administrator and an auto-enable setting — not a per-account manual step or a custom Lambda.' },
        },
        {
          heading: 'From finding to action — metrics, alerts, and dashboards',
          body: 'Detecting is only half the job; the exam expects findings to drive action. GuardDuty and Security Hub emit findings to Amazon EventBridge as events. An EventBridge rule matches on finding type or severity and routes to a target: an SNS topic for human notification, a Lambda function or Systems Manager Automation document for automatic remediation, or a ticketing integration.\n\nFor metric-based alerting, CloudWatch alarms watch a metric (or a metric filter over a log group) and fire to SNS when a threshold is crossed. CloudWatch dashboards and Security Hub’s summary views give the at-a-glance posture.',
          bullets: [
            'GuardDuty/Security Hub finding → EventBridge rule (filter by severity/type) → SNS (notify) or Lambda/SSM Automation (remediate).',
            'A CloudWatch metric filter turns a log pattern (e.g. root account login, failed auth) into a metric you can alarm on.',
            'Use EventBridge — not polling — for event-driven security automation; it is lower latency and lower overhead.',
          ],
        },
        {
          heading: 'Continuous assessment with Config and State Manager',
          body: 'Beyond reactive detection, the exam wants proactive, scheduled assessment. AWS Config conformance packs bundle many Config rules (and remediation actions) into a single deployable unit you can roll out across the organization to continuously check compliance. Systems Manager State Manager enforces a desired configuration state on instances on a schedule (e.g. ensuring the CloudWatch agent is installed and an antivirus definition is current). Security Hub security standards run their own scheduled checks and produce a compliance score.',
          callout: { type: 'warning', text: 'Do not confuse Config (records configuration and evaluates compliance rules) with CloudTrail (records API activity). "Was a non-compliant resource created?" → Config. "Who made the API call that created it?" → CloudTrail. Many distractors swap these two.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security engineer needs a single, normalized view of findings from GuardDuty, Inspector, and Macie across 40 accounts, scored against the AWS Foundational Security Best Practices standard. Which service provides this?',
          options: [
            'Amazon Detective',
            'AWS Security Hub',
            'Amazon GuardDuty',
            'AWS Config',
          ],
          correct: 1,
          explainCorrect: 'Correct — Security Hub aggregates and normalizes findings from other security services across accounts and runs security standards to produce a compliance score. It is the aggregation layer, not a detector itself.',
          elaborativePrompt: 'In your own words, why is Security Hub the aggregator here rather than GuardDuty, even though GuardDuty produces threat findings?',
        },
        {
          afterSection: 1,
          question: 'An organization wants GuardDuty enabled on every current account and automatically on any account created in the future, managed centrally without using the Organizations management account for daily operations. What should they configure?',
          options: [
            'A Lambda function that runs nightly to enable GuardDuty on new accounts',
            'A delegated administrator account for GuardDuty with auto-enable for new accounts',
            'A separate GuardDuty detector created manually in each account',
            'An SCP that forces GuardDuty on',
          ],
          correct: 1,
          explainCorrect: 'Correct — designating a delegated administrator and enabling auto-enable covers all current and future accounts centrally, keeping the management account out of routine security operations.',
          elaborativePrompt: 'Why is a delegated administrator preferred over running security operations directly from the Organizations management account?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company has 50 accounts and wants (1) automatic detection of compromised credentials and instances, (2) discovery of PII sitting in S3, (3) one prioritized dashboard of everything across all accounts, and (4) automatic notification when a high-severity threat appears. Walk through exactly which service handles each requirement and how the findings flow to a human.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security team must continuously detect threats such as credential exfiltration and crypto-mining across all accounts in an AWS organization, with the lowest operational overhead and no software to install on instances. Which approach meets the requirement?',
        options: [
          'Deploy a third-party IDS agent on every EC2 instance and forward logs to Amazon OpenSearch Service',
          'Enable Amazon GuardDuty across the organization using a delegated administrator with auto-enable for new accounts',
          'Create AWS Config rules in every account to flag suspicious configurations',
          'Enable Amazon Macie in every account to classify data and detect threats',
        ],
        correct: 1,
        explanation: {
          summary: 'GuardDuty is the managed, agentless threat-detection service. Enabling it organization-wide through a delegated administrator with auto-enable gives full, low-overhead coverage of behaviors like credential exfiltration and crypto-mining.',
          perOption: [
            'A third-party agent fleet is exactly the operational overhead to avoid, and it is not what AWS expects for managed threat detection.',
            'Correct — GuardDuty analyzes CloudTrail, VPC Flow Logs, and DNS logs with managed threat intelligence, needs no agents, and the delegated-admin + auto-enable model covers all current and future accounts.',
            'Config detects misconfiguration, not active threats like credential exfiltration or crypto-mining — it answers the wrong question.',
            'Macie discovers sensitive data in S3; it does not detect crypto-mining or compromised-instance behavior.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Detection',
      domain: 'd1',
      weight: '16%',
      task: 'Task 1.2',
      title: 'Logging Solutions — CloudTrail, CloudWatch Logs, Security Lake, and Choosing the Right Log Source',
      duration: 30,
      summary: 'You cannot investigate what you did not log. This session builds the logging architecture the exam expects: an organization CloudTrail trail to a central account, a dedicated logging account, log data lakes with Security Lake, and — critically — which network log source (VPC Flow Logs, Resolver logs, CloudFront logs) actually sees a given threat. Log-source selection is a recurring, high-value question pattern.',
      objectives: [
        'Configure an organization CloudTrail trail and a dedicated, locked-down central logging account',
        'Distinguish CloudTrail management events, data events, and Insights events',
        'Select the correct log source for a given signal — VPC Flow Logs, Route 53 Resolver query logs, CloudFront logs, or service logs',
        'Use Security Lake to centralize logs in OCSF, and analyze logs with Athena, CloudWatch Logs Insights, and OpenSearch',
      ],
      preLearningCheck: {
        question: 'An investigator must determine which external domain names an EC2 instance attempted to resolve, to confirm communication with a command-and-control server. Which log source captures this?',
        options: [
          'VPC Flow Logs, because they record all network traffic',
          'Amazon Route 53 Resolver query logs, because they record DNS queries made from the VPC',
          'AWS CloudTrail, because it records API calls',
          'S3 server access logs',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: VPC Flow Logs record IP-level metadata (source/dest IP, port, bytes, accept/reject) but not domain names. Route 53 Resolver query logs are what capture the actual DNS names being resolved.',
      },
      sections: [
        {
          heading: 'CloudTrail — the API system of record',
          body: 'CloudTrail records who did what, when, and from where across the AWS API. Three event categories matter:\n\nManagement events — control-plane operations (create a bucket, attach a policy, launch an instance). On by default for the most recent 90 days in Event history; create a trail to retain them in S3 long-term.\n\nData events — high-volume data-plane operations (S3 GetObject/PutObject, Lambda Invoke, DynamoDB item access). Off by default and billed separately because of volume; enable selectively when you need object-level forensics.\n\nInsights events — CloudTrail’s own anomaly detection on unusual API call-rate patterns (e.g. a sudden burst of IAM changes).\n\nFor an organization, create an organization trail in the management account: it applies to every member account automatically, and members cannot disable or alter it.',
          bullets: [
            'Enable log file validation so you can prove logs were not tampered with (CloudTrail writes a signed digest).',
            'Send the trail to an S3 bucket in a dedicated logging account, and optionally to CloudWatch Logs for metric filters and alarms.',
            'A common exam tell: "track API activity / who deleted the resource" → CloudTrail; "object-level read/write of specific S3 data" → CloudTrail data events.',
          ],
          callout: { type: 'note', text: 'Management events answer "who changed the configuration." Data events answer "who read or wrote the actual object/record." If a question hinges on S3 object access, plain management-event logging will not show it — you need data events.' },
        },
        {
          heading: 'The dedicated logging account and log integrity',
          body: 'AWS expects logs to live in a separate, tightly controlled logging (or log archive) account — the model Control Tower sets up automatically. Centralizing logs there means even an attacker who compromises a workload account cannot delete the evidence. Protect the log store with: an S3 bucket policy that allows only the log-delivery principals to write; S3 Object Lock (WORM) to make logs immutable for a retention period; SCPs that prevent member accounts from disabling the org trail; and KMS encryption with a key the workload accounts cannot use to read.',
          bullets: [
            'Cross-account: workload accounts write logs; only the security/logging account can read and manage them.',
            'S3 Object Lock in compliance mode makes logs immutable even to the root user for the retention period.',
            'CloudTrail log file validation + Object Lock together give tamper-evidence and tamper-resistance.',
          ],
          callout: { type: 'warning', text: 'If a scenario worries about an attacker deleting logs to cover their tracks, the answer involves a separate logging account plus immutability (Object Lock / Vault Lock) and an SCP — not just "turn on CloudTrail."' },
        },
        {
          heading: 'Choosing the right network log source',
          body: 'This is one of the highest-value question patterns in Domain 1. Each log source sees a different layer, and the exam tests whether you pick the one that actually contains the evidence:',
          bullets: [
            'VPC Flow Logs — IP-level metadata: source/destination IP, port, protocol, bytes, and ACCEPT/REJECT. Use for "was traffic allowed/blocked between these IPs," exfiltration volume, or rejected-connection patterns. They do NOT contain packet payloads or domain names.',
            'Route 53 Resolver query logs — the DNS names resolved from within the VPC. Use for "what domains did the instance look up" (C2 detection).',
            'CloudFront / ALB access logs — Layer-7 HTTP request detail at the edge or load balancer (URI, status, user agent, client IP).',
            'CloudTrail — the AWS API control/data plane (not in-VPC network traffic).',
            'Transit gateway flow logs — cross-VPC/hybrid traffic metadata at the transit gateway.',
          ],
          callout: { type: 'tip', text: 'Map the question to a layer: "which IPs/ports and accept-or-reject" → VPC Flow Logs. "which domain names" → Resolver query logs. "which URLs/HTTP requests" → CloudFront/ALB logs. "which API calls" → CloudTrail.' },
          interactive: 'log-source-selector',
        },
        {
          heading: 'Centralize and analyze — Security Lake, Athena, Logs Insights, OpenSearch',
          body: 'Amazon Security Lake centralizes security logs (CloudTrail, VPC Flow Logs, Route 53, Security Hub findings, and third-party sources) into a purpose-built data lake in your account, automatically normalized to the Open Cybersecurity Schema Framework (OCSF) and stored as Parquet in S3. That normalization lets you query everything with one schema and feed third-party SIEMs.\n\nFor analysis: Amazon Athena runs SQL directly over logs in S3 (great for ad-hoc forensic queries and large historical volumes); CloudWatch Logs Insights queries log groups interactively for near-real-time investigation; Amazon OpenSearch Service indexes logs for rich search, correlation, and dashboards; Amazon Managed Grafana visualizes across sources.',
          bullets: [
            'Security Lake → OCSF-normalized Parquet in S3 → query with Athena or subscribe a SIEM.',
            'Athena for cheap SQL over huge S3 log volumes; Logs Insights for live CloudWatch log groups; OpenSearch for search/correlation dashboards.',
            'Normalization (OCSF) is the point of Security Lake — it removes per-source schema differences so correlation is possible.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company must retain a tamper-evident record of every management API call across all accounts in its organization, and members must not be able to turn it off. What should they configure?',
          options: [
            'A separate CloudTrail trail created individually in each member account',
            'An organization CloudTrail trail with log file validation, delivering to a dedicated logging account',
            'CloudWatch Logs subscription filters in each account',
            'GuardDuty with S3 protection enabled',
          ],
          correct: 1,
          explainCorrect: 'Correct — an organization trail applies to all members and cannot be disabled by them; log file validation provides tamper-evidence; a dedicated logging account isolates the evidence.',
          elaborativePrompt: 'Why does an organization trail plus a dedicated logging account protect evidence better than per-account trails?',
        },
        {
          afterSection: 2,
          question: 'GuardDuty flags an instance for communicating with a known malicious domain. To list every domain that instance queried over the past week, which log source should the investigator analyze?',
          options: [
            'VPC Flow Logs',
            'Route 53 Resolver query logs',
            'CloudTrail management events',
            'S3 access logs',
          ],
          correct: 1,
          explainCorrect: 'Correct — Resolver query logs record the DNS names resolved from the VPC. VPC Flow Logs show IP/port metadata but not domain names.',
          elaborativePrompt: 'In your own words, what is the difference in what VPC Flow Logs and Resolver query logs each capture?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: an organization needs a central, tamper-proof record of all API activity, the ability to investigate which domains and IPs a compromised instance talked to, and one place to run SQL across all of it. Walk through the trail design, the logging account, which log sources you turn on, and how you query them.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security team must centralize security logs from CloudTrail, VPC Flow Logs, and Route 53 from across the organization into a single normalized data store that can be queried with SQL and shared with a third-party SIEM, with minimal custom ETL. Which solution best fits?',
        options: [
          'Stream every log to a self-managed Elasticsearch cluster and write custom parsers per source',
          'Enable Amazon Security Lake to collect the sources into an OCSF-normalized data lake in S3, queryable by Athena and subscribable by the SIEM',
          'Store raw logs in separate S3 buckets per account and query each with a different schema',
          'Forward all logs to CloudWatch Logs and rely on metric filters',
        ],
        correct: 1,
        explanation: {
          summary: 'Security Lake purpose-builds a centralized log data lake, automatically normalizing sources to OCSF and storing Parquet in S3 — directly queryable by Athena and subscribable by third-party tools, with no custom per-source parsing.',
          perOption: [
            'A self-managed cluster with custom parsers is exactly the ETL and operational burden Security Lake removes.',
            'Correct — Security Lake centralizes and normalizes to OCSF, so one schema serves Athena queries and SIEM subscribers with minimal custom work.',
            'Per-account buckets with different schemas defeat correlation and require custom query logic per source.',
            'CloudWatch Logs metric filters are for alerting on patterns, not for building a normalized, SQL-queryable, SIEM-shareable data lake.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Detection',
      domain: 'd1',
      weight: '16%',
      task: 'Task 1.3',
      title: 'Troubleshooting Monitoring, Logging & Alerting — When the Telemetry Breaks',
      duration: 30,
      summary: 'Detection is only as good as its plumbing, and the exam tests whether you can find the break: a Lambda function with no logs, an alarm that never fires, a CloudWatch agent that stopped shipping, a flow log that is empty. This session is about the permissions, configuration, and quotas that silently kill telemetry — and how to restore it.',
      objectives: [
        'Diagnose missing logs by checking IAM/resource permissions, log configuration, and delivery destinations',
        'Fix the most common cause of "no logs" — a missing or insufficient execution-role permission',
        'Troubleshoot CloudWatch Agent configuration and EC2 instance role problems',
        'Reason about why an alarm or EventBridge rule did not fire (state, filter, target permissions)',
      ],
      preLearningCheck: {
        question: 'A Lambda function runs successfully but writes nothing to CloudWatch Logs, and no log group appears. What is the most likely cause?',
        options: [
          'CloudWatch Logs is down in the Region',
          'The function’s execution role lacks logs:CreateLogGroup / CreateLogStream / PutLogEvents permissions',
          'The function code has no print statements',
          'Log retention is set too low',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Lambda writes logs using its execution role. Without the logs:CreateLogGroup, CreateLogStream, and PutLogEvents permissions (granted by the AWS managed AWSLambdaBasicExecutionRole), no log group is ever created — even though the function runs.',
      },
      sections: [
        {
          heading: 'The "no logs" decision tree',
          body: 'When telemetry is missing, work the chain from producer to destination. Most "missing logs" problems are permission problems, not service outages.\n\n1. Permissions — does the principal that produces the log have permission to write it? Lambda uses its execution role; EC2 uses the instance profile role; VPC Flow Logs uses a delivery IAM role; CloudTrail/Config use a service role and an S3 bucket policy. A missing permission here is the number-one cause.\n\n2. Configuration — is logging actually enabled and pointed somewhere? API Gateway execution/access logging is off until you set a CloudWatch Logs role ARN and enable it per stage. CloudFront standard logging must be turned on and given a bucket. S3 data events in CloudTrail are off by default.\n\n3. Destination policy — does the target accept the writes? An S3 bucket policy or KMS key policy that denies the log-delivery service will silently drop logs. Cross-account delivery needs the destination to trust the source.',
          bullets: [
            'Lambda → AWSLambdaBasicExecutionRole (or equivalent logs:* on the log group).',
            'EC2 CloudWatch agent → instance profile with CloudWatchAgentServerPolicy.',
            'API Gateway → account-level CloudWatch Logs role ARN + per-stage logging enabled.',
            'VPC Flow Logs → a delivery role (for CloudWatch) or a bucket policy allowing delivery.logs.amazonaws.com (for S3).',
          ],
          callout: { type: 'tip', text: 'If logs are missing, suspect IAM first. "The function/agent runs but produces no logs" is almost always a missing write permission or a destination policy that denies the log-delivery principal.' },
        },
        {
          heading: 'CloudWatch Agent and EC2 instance issues',
          body: 'EC2 and on-premises servers do not ship OS-level logs or custom metrics (memory, disk) to CloudWatch on their own — the CloudWatch agent does. When agent telemetry stops, check, in order: the instance role has CloudWatchAgentServerPolicy; the agent is installed and running; the agent configuration file specifies the correct log files and metrics; and the instance has network egress to the CloudWatch endpoint (a route, NAT, or VPC endpoint). For Systems Manager–managed instances, the SSM agent and the AmazonSSMManagedInstanceCore permission must also be present.',
          bullets: [
            'Memory and disk metrics are NOT default EC2 metrics — they require the CloudWatch agent.',
            'A common break: the instance role was changed or detached, so the agent loses permission to put logs/metrics.',
            'No internet route and no VPC endpoint for CloudWatch/SSM = silent telemetry loss for private instances.',
          ],
        },
        {
          heading: 'Why the alarm or rule never fired',
          body: 'A configured alert that does not fire has its own checklist. For CloudWatch alarms: confirm the metric is actually being published (no data means the alarm sits in INSUFFICIENT_DATA, not ALARM), the threshold and evaluation periods are right, and the alarm action (SNS) is valid and the SNS topic policy allows CloudWatch to publish. For EventBridge rules: confirm the event pattern actually matches the incoming event shape, the rule is enabled, and the target’s resource policy/role allows EventBridge to invoke it. For metric-filter alarms: the filter pattern must match the log format exactly, or the metric stays at zero.',
          callout: { type: 'warning', text: 'A metric filter that does not match the log line produces no data points, so its alarm never leaves INSUFFICIENT_DATA and never alerts. Test the filter pattern against a real log sample.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'API Gateway is returning errors but no execution or access logs appear in CloudWatch Logs. What is the most likely configuration gap?',
          options: [
            'The CloudWatch Logs role ARN is not set at the account level and/or logging is not enabled on the stage',
            'CloudWatch Logs is not available in the Region',
            'The API has no usage plan',
            'The Lambda integration timed out',
          ],
          correct: 0,
          explainCorrect: 'Correct — API Gateway logging requires an account-level CloudWatch Logs role ARN and per-stage logging to be turned on. Without both, nothing is written.',
          elaborativePrompt: 'Why does API Gateway need an explicit role and per-stage setting before it logs anything?',
        },
        {
          afterSection: 2,
          question: 'A CloudWatch alarm built on a metric filter for "root account login" never fires, even after a root login occurs. The filter’s metric shows no data points. What should you check first?',
          options: [
            'Increase the alarm evaluation period',
            'Verify the metric-filter pattern matches the actual CloudTrail log format',
            'Lower the SNS retry count',
            'Enable detailed monitoring on the instance',
          ],
          correct: 1,
          explainCorrect: 'Correct — if the filter pattern does not match the log structure, no metric data points are produced, so the alarm stays in INSUFFICIENT_DATA and never alerts.',
          elaborativePrompt: 'What is the relationship between a metric filter matching log lines and the alarm’s state?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a team reports that a critical Lambda has no logs, an EC2 fleet stopped sending memory metrics, and a security alarm never fired during a real incident. Walk through the permission, configuration, and destination checks you would make for each, and why permissions are the usual culprit.',
      sample: {
        type: 'multiple-choice',
        stem: 'After deploying a new Lambda function, the team finds no log group and no log events in CloudWatch Logs, although the function executes correctly. What is the correct fix?',
        options: [
          'Add print/logging statements and redeploy — the code simply isn’t logging',
          'Attach a policy to the function’s execution role granting logs:CreateLogGroup, logs:CreateLogStream, and logs:PutLogEvents',
          'Increase the function timeout and memory',
          'Enable CloudTrail data events for Lambda',
        ],
        correct: 1,
        explanation: {
          summary: 'Lambda writes to CloudWatch Logs using its execution role. If that role lacks the logs:CreateLogGroup/CreateLogStream/PutLogEvents permissions, no log group is ever created even though the function runs. Granting them (e.g. via AWSLambdaBasicExecutionRole) restores logging.',
          perOption: [
            'The absence of a log group itself indicates a permissions problem, not missing print statements — runtime logs would still create the group if permitted.',
            'Correct — the execution role needs the three CloudWatch Logs write permissions; without them Lambda cannot create the log group or stream.',
            'Timeout and memory affect execution, not whether logs are written.',
            'CloudTrail data events record Invoke API calls, not the function’s application logs in CloudWatch.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — INCIDENT RESPONSE (14%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s4',
      number: 4,
      module: 'Domain 2 · Incident Response',
      domain: 'd2',
      weight: '14%',
      task: 'Task 2.1',
      title: 'Designing & Testing an Incident Response Plan',
      duration: 30,
      summary: 'Good incident response is built before the incident. This session covers preparing AWS for incidents — runbooks, pre-provisioned access, blast-radius reduction, and Shield Advanced — and the AWS-native ways to automate remediation and to test that your plan actually works with Fault Injection Service and Resilience Hub.',
      objectives: [
        'Build response runbooks and automations with Systems Manager OpsCenter and Automation documents',
        'Prepare for incidents by pre-provisioning least-privilege responder access and minimizing blast radius',
        'Automate remediation with Systems Manager, Step Functions, Lambda, and the Automated Forensics Orchestrator',
        'Validate the IR plan with AWS Fault Injection Service and AWS Resilience Hub',
      ],
      preLearningCheck: {
        question: 'During an incident, responders need elevated permissions quickly, but those permissions must not sit unused on accounts day-to-day. What is the best preparation?',
        options: [
          'Give the security team permanent administrator access in every account',
          'Pre-create a least-privilege break-glass IR role that responders can assume on demand, with access logged and alarmed',
          'Share the root user credentials with the on-call engineer',
          'Disable IAM during the incident to remove friction',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: prepare access ahead of time as an assumable, least-privilege role (break-glass), so responders get exactly the permissions they need only when they assume it — and every assumption is logged and alerts the team.',
      },
      sections: [
        {
          heading: 'Prepare before the incident',
          body: 'AWS’s incident response guidance is "prepare, then respond." Preparation has a few concrete pillars the exam tests:\n\nRunbooks and automation — codify response steps as Systems Manager Automation documents and surface operational issues in Systems Manager OpsCenter (OpsItems) so responders work from a consistent, repeatable playbook rather than ad-hoc commands. SageMaker AI notebooks can host investigation playbooks for analysts.\n\nPre-provisioned access — create the IR/break-glass role ahead of time with least privilege, ready to assume. Do not hand out standing admin.\n\nMinimize blast radius — segment accounts and networks so a compromise is contained: separate workloads into different accounts, isolate sensitive subnets, and scope roles tightly so one stolen credential cannot reach everything.\n\nShield Advanced — for DDoS, enable it proactively for protected resources, get access to the Shield Response Team, and configure protections before an attack, not during.',
          bullets: [
            'Runbook = repeatable, reviewed steps; Automation document = the executable form of that runbook.',
            'Break-glass role: least privilege, assumable on demand, every use logged to CloudTrail and alarmed.',
            'Blast-radius reduction is a preparation control — account separation and tight role scope limit how far an incident spreads.',
          ],
          callout: { type: 'note', text: 'When a question asks how to "be prepared" or "reduce the blast radius," it is testing preparation controls — pre-provisioned least-privilege access, account/network segmentation, and pre-configured protections like Shield Advanced — not in-the-moment heroics.' },
        },
        {
          heading: 'Automate remediation',
          body: 'The exam strongly favors automated, event-driven remediation over manual steps. The canonical pipeline: a finding (GuardDuty, Security Hub, or a Config rule) emits an event to EventBridge, which triggers a Systems Manager Automation document, a Lambda function, or a Step Functions state machine to contain and remediate — isolate the instance, revoke a session, quarantine a key, or snapshot for forensics. For EC2 forensics specifically, the Automated Forensics Orchestrator for Amazon EC2 (an AWS solution) captures disk and memory artifacts and isolates the instance automatically. Amazon Application Recovery Controller (ARC) helps shift traffic and recover during large-scale events.',
          bullets: [
            'Finding → EventBridge → SSM Automation / Lambda / Step Functions = the standard auto-remediation shape.',
            'Step Functions is the fit when remediation is multi-step with branching and human-approval stages.',
            'Automated Forensics Orchestrator for EC2 = capture artifacts + isolate, without a responder doing it by hand.',
          ],
          callout: { type: 'tip', text: 'When two answers both work but one is manual and one is event-driven automation, the exam wants the automated one — it is faster, consistent, and reduces the window of exposure.' },
        },
        {
          heading: 'Test that the plan works',
          body: 'A plan you have never tested is a hypothesis. AWS Fault Injection Service (FIS) runs controlled experiments — injecting faults like instance termination, API throttling, or network disruption — to validate that detection, alerting, and recovery actually fire as designed. AWS Resilience Hub assesses an application against defined RTO/RPO targets and recommends improvements. Tabletop exercises and game days use these tools to rehearse the runbook end-to-end so gaps surface before a real incident.',
          callout: { type: 'warning', text: 'Do not confuse FIS (deliberately injects faults to test response and resilience) with GuardDuty (detects real threats). A question about "validating the incident response plan" or "chaos/resilience testing" points to FIS and Resilience Hub.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company wants a GuardDuty finding for a compromised EC2 instance to automatically isolate the instance and capture a forensic snapshot, with no responder action. Which design fits best?',
          options: [
            'Email the security team and wait for a human to act',
            'An EventBridge rule on the GuardDuty finding that triggers a Systems Manager Automation document (or the Automated Forensics Orchestrator) to snapshot and isolate the instance',
            'A nightly Config report listing risky instances',
            'A CloudWatch dashboard showing the finding',
          ],
          correct: 1,
          explainCorrect: 'Correct — routing the finding through EventBridge to SSM Automation (or the forensics orchestrator) performs containment and artifact capture automatically, minimizing exposure time.',
          elaborativePrompt: 'Why is event-driven automated containment preferred over a human-in-the-loop email for this case?',
        },
        {
          afterSection: 2,
          question: 'A security team wants to verify that their detection and recovery automation actually triggers when an instance is abruptly terminated. Which AWS service is designed for this controlled testing?',
          options: [
            'Amazon GuardDuty',
            'AWS Fault Injection Service',
            'AWS Config',
            'Amazon Detective',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Fault Injection Service runs controlled fault experiments (like instance termination) to validate that monitoring, alerting, and recovery behave as designed.',
          elaborativePrompt: 'In your own words, how does deliberately injecting a fault build confidence in an IR plan?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you are designing IR for a regulated workload. Walk through how you prepare responder access without standing admin, how you reduce blast radius, how a high-severity GuardDuty finding triggers automatic containment, and how you would test the whole thing before a real incident.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security organization must ensure responders can obtain elevated access during an incident without holding standing administrative permissions, and every use of that access must be auditable. What is the best preparation?',
        options: [
          'Grant the security team permanent AdministratorAccess in all accounts',
          'Pre-create a least-privilege incident response role that responders assume on demand, with all AssumeRole activity logged to CloudTrail and alarmed',
          'Store root credentials in a shared password manager for emergencies',
          'Create the responder role only after an incident is declared',
        ],
        correct: 1,
        explanation: {
          summary: 'A pre-provisioned, least-privilege break-glass role that responders assume on demand gives just-in-time elevated access without standing admin, and CloudTrail logging plus alarms make every use auditable.',
          perOption: [
            'Permanent admin everywhere is the opposite of least privilege and a huge standing risk.',
            'Correct — assumable least-privilege IR role, logged and alarmed, delivers just-in-time access with full auditability.',
            'Sharing root credentials violates root-protection best practice and is not auditable to an individual.',
            'Creating the role mid-incident adds dangerous delay and is exactly what preparation is meant to avoid.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Incident Response',
      domain: 'd2',
      weight: '14%',
      task: 'Task 2.2',
      title: 'Responding to Security Events — Forensics, Containment, and Root Cause Analysis',
      duration: 30,
      summary: 'When an event is real, the response follows a disciplined sequence: capture forensic evidence, scope the impact, contain and eradicate the threat, recover cleanly, and find the root cause so it cannot recur. This session maps each phase to the right AWS service — and to the order that preserves evidence rather than destroying it.',
      objectives: [
        'Capture and preserve forensic artifacts (snapshots, memory, logs) without contaminating evidence',
        'Scope an event by correlating logs and validating findings across services',
        'Contain and eradicate threats with network isolation, credential/key revocation, and clean recovery',
        'Conduct root cause analysis with Amazon Detective',
      ],
      preLearningCheck: {
        question: 'A running EC2 instance is confirmed compromised. To preserve evidence for forensics, what should you do BEFORE terminating or rebuilding it?',
        options: [
          'Immediately terminate the instance to stop the attacker',
          'Isolate it with a restrictive security group, then capture an EBS snapshot and (if possible) a memory dump for analysis',
          'Reboot the instance to clear malware',
          'Delete its CloudTrail logs to reduce noise',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: contain by isolating (not destroying), then capture artifacts — an EBS snapshot and memory image — before any action that would erase evidence. Terminating or rebooting first can destroy the very data forensics needs.',
      },
      sections: [
        {
          heading: 'The response sequence — preserve, then act',
          body: 'A security event follows a disciplined order, and the exam tests that you preserve evidence before you destroy it:\n\n1. Capture forensic artifacts — take EBS volume snapshots, capture instance memory where feasible, and copy relevant logs to an isolated forensics account. Snapshots and logs are your evidence; gather them first.\n\n2. Scope and validate — correlate logs (CloudTrail, VPC Flow Logs, Resolver logs) and validate findings from GuardDuty/Security Hub to understand what was touched and how far the compromise spread.\n\n3. Contain — isolate the resource so the threat cannot spread or exfiltrate: swap to a quarantine security group with no egress, detach it from auto scaling, and revoke the credentials or sessions it used.\n\n4. Eradicate and recover — remove the threat and rebuild from a known-good, patched image or restore from a clean backup. Never "clean in place" and call it done.\n\n5. Root cause analysis — determine how the attacker got in and close that path.',
          bullets: [
            'Order matters: isolate to stop spread, capture artifacts, THEN eradicate — not terminate-first.',
            'Move evidence (snapshots, logs) to a dedicated, locked-down forensics account so it cannot be tampered with.',
            'Recovery means restore-from-clean (golden AMI or known-good backup), not patching a compromised host in place.',
          ],
          callout: { type: 'warning', text: 'Terminating, rebooting, or rebuilding a compromised instance before capturing snapshots and memory destroys forensic evidence. The exam consistently rewards "isolate and snapshot first."' },
          interactive: 'ir-phase',
        },
        {
          heading: 'Containment techniques on AWS',
          body: 'Containment is about cutting the threat off without losing the evidence. The standard moves: replace the instance’s security group with a quarantine group that denies all inbound and outbound (or allows only the forensics tooling); remove the instance from its target group / Auto Scaling group so it stops receiving traffic and is not replaced; revoke active IAM sessions (for a compromised role, attach a deny-all policy or use the "revoke sessions" action that adds an AWSRevokeOlderSessions condition); and for a leaked access key, deactivate then delete it and rotate. For a compromised KMS key, disable it or schedule deletion after confirming blast radius.',
          bullets: [
            'Network containment = quarantine security group / NACL, not instance termination.',
            'Credential containment = deactivate/rotate access keys; revoke role sessions; force-reset affected users.',
            'Detach from ASG/target group so the compromised host neither serves traffic nor gets auto-replaced mid-investigation.',
          ],
        },
        {
          heading: 'Root cause analysis with Detective',
          body: 'Amazon Detective is purpose-built for the "how and how far" question. It automatically ingests CloudTrail, VPC Flow Logs, and GuardDuty findings and builds a linked behavior graph across accounts, so an analyst can pivot from a finding to the entity (instance, role, IP) and see its activity over time — failed logins, unusual API calls, new geographies. That turns a single GuardDuty finding into a full picture of the attack path. Athena and OpenSearch complement this for custom log queries, but Detective is the managed investigation graph the exam names for RCA.',
          callout: { type: 'tip', text: '"Investigate the root cause / understand the scope of a GuardDuty finding across accounts" → Amazon Detective. GuardDuty detects; Detective explains. They are designed to work together.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'Which sequence best preserves forensic value when responding to a confirmed instance compromise?',
          options: [
            'Terminate the instance, then review CloudTrail',
            'Isolate the instance with a quarantine security group, capture an EBS snapshot and memory, then eradicate and rebuild from a clean image',
            'Reboot to clear memory, then snapshot',
            'Rebuild from the same AMI in place and continue serving traffic',
          ],
          correct: 1,
          explainCorrect: 'Correct — isolate to stop spread, capture artifacts to preserve evidence, then eradicate and recover from a known-good image. Destroying the host first loses evidence.',
          elaborativePrompt: 'Why does isolating before capturing, and capturing before terminating, matter for an investigation?',
        },
        {
          afterSection: 2,
          question: 'After a GuardDuty finding, an analyst needs to see all activity related to the implicated IAM role across accounts over the past month to understand the attack path. Which service is purpose-built for this?',
          options: [
            'Amazon Macie',
            'Amazon Detective',
            'AWS Config',
            'Amazon Inspector',
          ],
          correct: 1,
          explainCorrect: 'Correct — Detective builds a linked behavior graph from CloudTrail, VPC Flow Logs, and GuardDuty findings, letting the analyst pivot across entities and time to find the root cause and scope.',
          elaborativePrompt: 'How does Detective’s behavior graph differ from simply reading raw CloudTrail logs?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: GuardDuty reports that an EC2 instance is exfiltrating data to an unknown IP. Walk through, in order, exactly what you do — how you isolate it, what artifacts you capture and where you store them, how you contain the credentials it used, how you recover service, and how you find the root cause.',
      sample: {
        type: 'multiple-choice',
        stem: 'GuardDuty reports that an EC2 instance is communicating with a known malicious IP and exfiltrating data. The team must stop the activity while preserving the ability to investigate. What is the correct first response?',
        options: [
          'Terminate the instance immediately to stop the exfiltration',
          'Apply a quarantine security group that blocks the instance’s traffic, then capture an EBS snapshot and memory for forensics before eradication',
          'Reboot the instance to drop the malicious connection',
          'Delete the instance’s CloudTrail trail to stop further logging noise',
        ],
        correct: 1,
        explanation: {
          summary: 'Network isolation via a quarantine security group stops the exfiltration without destroying the host, and capturing a snapshot and memory preserves the evidence needed to scope and investigate before the instance is eradicated and rebuilt clean.',
          perOption: [
            'Terminating stops the activity but destroys volatile and disk evidence the investigation needs.',
            'Correct — isolate to halt exfiltration, then snapshot and capture memory to preserve evidence, before eradicating and recovering from a clean image.',
            'Rebooting drops connections but wipes memory-resident evidence and does not contain a persistent threat.',
            'Deleting the trail destroys evidence and reduces visibility — the opposite of correct response.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — INFRASTRUCTURE SECURITY (18%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s6',
      number: 6,
      module: 'Domain 3 · Infrastructure Security',
      domain: 'd3',
      weight: '18%',
      task: 'Task 3.1',
      title: 'Edge Security — CloudFront, AWS WAF, Shield, and Stopping Threats at the Door',
      duration: 30,
      summary: 'The cheapest place to block an attack is before it reaches your origin. This session builds the edge-defense stack the exam expects: CloudFront as the front door, AWS WAF for Layer-7 filtering (OWASP Top 10, rate limiting, geo rules), Shield Advanced for DDoS, and the header and origin-access controls that keep traffic from bypassing the edge entirely.',
      objectives: [
        'Choose an edge protection strategy based on the threat — L7 application attacks, DDoS, bots, or geographic restriction',
        'Configure AWS WAF managed and custom rules for OWASP Top 10, rate-based limiting, and geo-matching',
        'Use CloudFront with origin access control and Shield Advanced to protect and front origins',
        'Prevent origin bypass with secret headers, OAC, and signed URLs/cookies',
      ],
      preLearningCheck: {
        question: 'A web application behind CloudFront is being hit by SQL-injection and cross-site-scripting attempts. Which service is designed to inspect and block these Layer-7 request patterns?',
        options: [
          'AWS Shield Standard, because it protects against all attacks',
          'AWS WAF, because it inspects HTTP(S) requests and blocks malicious patterns like SQLi and XSS',
          'A security group on the origin instances',
          'Network ACLs on the public subnet',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: AWS WAF operates at Layer 7 and inspects the content of HTTP(S) requests, so it can match and block SQLi/XSS patterns. Shield handles DDoS (L3/L4 and some L7 volumetrics); security groups and NACLs work at L3/L4 and cannot read request payloads.',
      },
      sections: [
        {
          heading: 'Match the control to the threat',
          body: 'Edge security questions almost always hinge on picking the control that operates at the right layer for the named threat:\n\nAWS WAF — Layer 7. Inspects HTTP(S) request components (URI, query string, headers, body, cookies) and blocks based on rules: AWS Managed Rule groups (Core rule set for OWASP Top 10, known-bad-inputs, SQLi, Linux/PHP, IP reputation), rate-based rules to throttle floods from a single IP, geo-match to allow/deny by country, and custom rules using regex or string match. Attach a WAF web ACL to CloudFront, Application Load Balancer, API Gateway, AppSync, or Cognito user pools.\n\nAWS Shield Standard — automatic, free DDoS protection at L3/L4 for all AWS customers. AWS Shield Advanced — paid; adds protection for higher-layer and larger volumetric attacks, near-real-time visibility, cost-protection credits for scaling during an attack, and access to the Shield Response Team (SRT).\n\nAmazon CloudFront — the CDN and front door. Terminating TLS at the edge, absorbing volumetric load, and giving WAF and Shield a single chokepoint to defend.',
          bullets: [
            'OWASP Top 10 / SQLi / XSS / bad bots → AWS WAF (often AWS Managed Rules).',
            'Flood from a single source IP → WAF rate-based rule. Large-scale volumetric/DDoS → Shield Advanced.',
            'Restrict access by country → WAF geo-match rule (or CloudFront geo restriction for simple allow/deny).',
            'WAF attaches to CloudFront, ALB, API Gateway, AppSync, and Cognito — not directly to an EC2 instance.',
          ],
          callout: { type: 'note', text: 'Layer is the tell. "Inspect/blocks malicious HTTP requests" → WAF (L7). "Absorb a large DDoS" → Shield Advanced. "Allow/deny IP ranges or ports" → security group/NACL (L3/L4). A request-content threat is never solved by a security group.' },
        },
        {
          heading: 'Designing WAF rules',
          body: 'A WAF web ACL evaluates rules in priority order; each rule either allows, blocks, counts, or runs CAPTCHA/challenge. The exam favors layered, managed-first design:\n\nStart with AWS Managed Rules (Core rule set covers OWASP Top 10) so you inherit AWS-maintained signatures. Add a rate-based rule (e.g. block any IP exceeding N requests in 5 minutes) to blunt brute-force and HTTP floods. Add geo-match rules where the business only serves certain countries. Use Count mode first to observe what a new rule would block before switching it to Block — this avoids false positives taking down legitimate traffic. For bots, AWS WAF Bot Control and the CAPTCHA/challenge actions separate humans from automation. Logs go to CloudWatch Logs, S3, or Kinesis Data Firehose for analysis, and findings can be normalized to OCSF and ingested by Security Lake or a third-party tool.',
          bullets: [
            'Managed Rules first, custom rules to fill gaps; order matters because evaluation stops at the first terminating action.',
            'Deploy new rules in Count mode, review, then promote to Block to avoid blocking legitimate users.',
            'Rate-based rule = per-IP request throttling; Bot Control + CAPTCHA = automation defense.',
            'WAF logs can be sent to Firehose/S3 and normalized (OCSF) for centralized analysis.',
          ],
          callout: { type: 'tip', text: 'When a question worries about a new WAF rule blocking real users, the answer is to run it in Count mode first and review the logs before enabling Block.' },
        },
        {
          heading: 'Don’t let attackers bypass the edge',
          body: 'All the edge defense in the world is useless if traffic can hit the origin directly. The exam tests the controls that force traffic through CloudFront and WAF:\n\nOrigin Access Control (OAC) — for an S3 origin, OAC (the successor to Origin Access Identity) lets only CloudFront read the bucket; the bucket itself stays private. For a custom (ALB/EC2) origin, inject a secret custom header at CloudFront and have the origin (or a WAF rule on the ALB) require that header, so requests that skip CloudFront are rejected. Signed URLs and signed cookies restrict access to specific content to authorized users for a limited time. Field-level encryption protects sensitive form fields end-to-end. CloudFront also enforces HTTPS (viewer protocol policy) and modern TLS, and lets you add security response headers (HSTS, CSP) via a response headers policy. S3 CORS configuration governs which web origins a browser may call the bucket from — a frequent source of "why is my cross-origin request blocked" troubleshooting.',
          bullets: [
            'S3 origin → OAC + private bucket; custom origin → secret header required at the origin/ALB WAF.',
            'Signed URLs/cookies = time-limited, per-user access to private content through CloudFront.',
            'Enforce HTTPS and add HSTS/CSP via CloudFront policies; S3 CORS controls cross-origin browser access.',
          ],
          callout: { type: 'warning', text: 'If WAF/Shield protect CloudFront but the ALB or S3 bucket is still publicly reachable, attackers simply skip the edge. Lock the origin to CloudFront with OAC or a required secret header.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team must add a new WAF rule to block a suspicious pattern but is worried it will accidentally block legitimate customers. What is the safest rollout?',
          options: [
            'Enable the rule in Block mode immediately and watch support tickets',
            'Deploy the rule in Count mode first, review the matched requests in WAF logs, then switch it to Block',
            'Apply the rule only to the management account',
            'Disable all managed rules while testing',
          ],
          correct: 1,
          explainCorrect: 'Correct — Count mode records what the rule would match without blocking, so you can validate against real traffic before promoting it to Block and risking false positives.',
          elaborativePrompt: 'Why does Count mode reduce the risk of a new rule taking down legitimate traffic?',
        },
        {
          afterSection: 2,
          question: 'An application is fronted by CloudFront with AWS WAF, but attackers are reaching the Application Load Balancer origin directly and bypassing WAF entirely. What best prevents this?',
          options: [
            'Increase the WAF rate limit on CloudFront',
            'Have CloudFront add a secret custom header and configure the ALB (or a WAF on the ALB) to require it, rejecting requests that lack it',
            'Move the ALB to a private subnet only',
            'Enable Shield Standard on the ALB',
          ],
          correct: 1,
          explainCorrect: 'Correct — a secret header injected by CloudFront and required at the origin ensures only edge-routed traffic is accepted, closing the direct-to-origin bypass.',
          elaborativePrompt: 'Why does edge protection lose its value if the origin remains directly reachable?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a public web app is seeing SQL-injection attempts, a request flood from a handful of IPs, and traffic from countries you do not serve — and you suspect some attackers are hitting the load balancer directly. Walk through which edge control addresses each threat and how you stop the origin bypass.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company serves a global web application through Amazon CloudFront. It must block OWASP Top 10 attacks, throttle request floods from individual IPs, and ensure no one can reach the origin Application Load Balancer directly. Which combination meets all three requirements?',
        options: [
          'Attach security groups to the ALB and enable Shield Standard',
          'Attach an AWS WAF web ACL (managed Core rule set + a rate-based rule) to CloudFront, and require a secret CloudFront-injected header at the ALB',
          'Use only CloudFront geo restriction and S3 Object Lock',
          'Enable AWS Config rules and Amazon Inspector on the ALB',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS WAF managed Core rules cover the OWASP Top 10, a rate-based rule throttles per-IP floods, and a secret header that CloudFront injects (and the ALB requires) forces all traffic through the edge — addressing all three requirements together.',
          perOption: [
            'Security groups work at L3/L4 and cannot inspect HTTP for OWASP attacks; Shield Standard does not filter application-layer request content.',
            'Correct — WAF managed rules + rate-based rule handle L7 attacks and floods, and the required secret header closes the direct-to-origin path.',
            'Geo restriction and Object Lock address neither SQLi/XSS nor per-IP rate limiting.',
            'Config and Inspector assess configuration and vulnerabilities; they do not block live malicious HTTP requests.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd3-s7',
      number: 7,
      module: 'Domain 3 · Infrastructure Security',
      domain: 'd3',
      weight: '18%',
      task: 'Task 3.2',
      title: 'Compute Workload Security — Hardened Images, Patching, Inspector, and Roles',
      duration: 30,
      summary: 'Securing compute means hardening what you launch, keeping it patched, scanning it for vulnerabilities, and giving it credentials the right way. This session covers golden AMIs and hardened container images, Patch Manager, Amazon Inspector and GuardDuty runtime protection, agentless access with Session Manager, and the instance-profile/role model — the recurring "how does this workload get its permissions" question.',
      objectives: [
        'Build and maintain hardened AMIs and container images with EC2 Image Builder and Systems Manager',
        'Keep workloads current with Patch Manager and validate continuously with Amazon Inspector',
        'Choose agentless administrative access with Session Manager and EC2 Instance Connect over SSH bastions',
        'Assign credentials to compute correctly with instance profiles, service roles, and execution roles',
      ],
      preLearningCheck: {
        question: 'An application on EC2 needs to read from an S3 bucket. What is the most secure way to give the application its AWS credentials?',
        options: [
          'Store an IAM user’s access keys in a file on the instance',
          'Attach an IAM role to the instance via an instance profile so the application uses automatically-rotated temporary credentials',
          'Hard-code credentials in the application code',
          'Pass the access keys as environment variables at launch',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: an IAM role attached through an instance profile delivers temporary, auto-rotated credentials via the instance metadata service — no long-lived keys to store, leak, or rotate manually.',
      },
      sections: [
        {
          heading: 'Harden what you launch',
          body: 'A secure workload starts from a secure image. The exam expects a pipeline, not manual hardening:\n\nEC2 Image Builder automates building, hardening, testing, and distributing golden AMIs and container images on a schedule, applying CIS or STIG hardening components and the latest patches, then publishing a versioned, immutable image. Distributing one approved AMI across the org (and enforcing its use) means every instance starts from a known-good baseline. For containers, build hardened base images, scan them in Amazon ECR, and only promote images that pass.\n\nSystems Manager underpins much of this: State Manager enforces desired configuration (agent installed, baseline applied) and Run Command/Automation apply changes at scale without SSH.',
          bullets: [
            'EC2 Image Builder = automated, versioned golden AMIs/container images with CIS/STIG hardening baked in.',
            'Immutable infrastructure: rebuild from a new hardened image rather than patching long-lived instances in place.',
            'ECR image scanning gates which container images may be deployed.',
          ],
          callout: { type: 'note', text: '"Standardized, automatically rebuilt, hardened images across the organization" → EC2 Image Builder. It replaces hand-maintained AMIs and ad-hoc hardening scripts.' },
        },
        {
          heading: 'Patch, scan, and detect at runtime',
          body: 'Three distinct jobs the exam keeps separate:\n\nAWS Systems Manager Patch Manager defines patch baselines and patch groups and applies operating-system and application patches on a maintenance-window schedule across EC2 and on-premises servers — this is remediation/keeping current.\n\nAmazon Inspector continuously scans EC2 instances, container images in ECR, and Lambda functions for known CVEs and unintended network reachability, producing prioritized findings — this is vulnerability assessment. It is agentless-capable via the SSM agent and runs automatically as new CVEs are published.\n\nAmazon GuardDuty Runtime Monitoring adds runtime threat detection inside EC2, ECS, and EKS workloads (suspicious process/file/network behavior) — this is active-threat detection at runtime, complementing Inspector’s static CVE view.',
          bullets: [
            'Keep software current / apply patches → Patch Manager.',
            'Find known CVEs and unintended exposure → Amazon Inspector (EC2, ECR, Lambda).',
            'Detect malicious behavior inside a running workload → GuardDuty Runtime Monitoring.',
            'CodeGuru Security and Amazon Q Developer shift this left, finding vulnerabilities in code during the pipeline.',
          ],
          callout: { type: 'warning', text: 'Don’t conflate Inspector and Patch Manager. Inspector tells you what is vulnerable; Patch Manager fixes it. A question about "identify vulnerabilities" is Inspector; "deploy the patches on a schedule" is Patch Manager.' },
        },
        {
          heading: 'Access without SSH, and credentials done right',
          body: 'Two recurring patterns:\n\nAdministrative access — prefer AWS Systems Manager Session Manager for shell access: no open inbound port 22, no bastion host, no SSH keys to manage, and every session is logged to CloudWatch Logs/S3 and authorized by IAM. EC2 Instance Connect provides short-lived SSH key push for occasional SSH needs. Both beat a permanently-open bastion.\n\nCredentials for compute — never embed long-lived keys. EC2 uses an instance profile (the container that passes an IAM role to the instance); ECS tasks use a task role; Lambda uses an execution role. Each delivers temporary, rotated credentials scoped to least privilege. For workloads that must call AWS from outside (on-prem/other cloud), IAM Roles Anywhere issues temporary credentials based on X.509 certificates.',
          bullets: [
            'Session Manager: no inbound 22, no bastion, IAM-authorized, fully logged — the exam’s preferred admin access.',
            'EC2 → instance profile role; ECS task → task role; Lambda → execution role. All temporary, all rotated.',
            'IAM Roles Anywhere = temporary AWS credentials for non-AWS workloads via certificates.',
          ],
          callout: { type: 'tip', text: '"Give shell access without opening SSH or running a bastion, and log every session" → Session Manager. "How should this instance/function get AWS permissions" → a role (instance profile / task role / execution role), never stored keys.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A security team must continuously identify known CVEs in running EC2 instances and in container images stored in Amazon ECR, with findings updated automatically as new CVEs are published. Which service fits?',
          options: [
            'AWS Systems Manager Patch Manager',
            'Amazon Inspector',
            'AWS Config',
            'Amazon Macie',
          ],
          correct: 1,
          explainCorrect: 'Correct — Amazon Inspector continuously scans EC2, ECR images, and Lambda for known CVEs and network reachability, re-evaluating automatically as the CVE database changes.',
          elaborativePrompt: 'How do Inspector (find vulnerabilities) and Patch Manager (apply patches) divide the work between them?',
        },
        {
          afterSection: 2,
          question: 'A company wants administrators to get a shell on private EC2 instances with no open inbound SSH port, no bastion host, IAM-based authorization, and a full audit log of every session. What should they use?',
          options: [
            'Open port 22 to the corporate IP range on the security group',
            'AWS Systems Manager Session Manager',
            'A public bastion host with SSH key pairs',
            'EC2 user data that adds SSH keys at boot',
          ],
          correct: 1,
          explainCorrect: 'Correct — Session Manager provides IAM-authorized, fully-logged shell access through the SSM agent with no inbound ports and no bastion, eliminating SSH key sprawl.',
          elaborativePrompt: 'Why is Session Manager more secure and auditable than a traditional SSH bastion?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you own a fleet of EC2 instances and some Lambda functions. Walk through how you standardize a hardened image, keep everything patched, continuously find vulnerabilities, give admins shell access without SSH, and provide the application its AWS credentials — naming the AWS service for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'An application running on EC2 needs to call Amazon S3 and Amazon DynamoDB. Security policy forbids any long-lived credentials on instances and requires automatic credential rotation. What is the correct approach?',
        options: [
          'Create an IAM user, generate access keys, and place them in the application’s config file',
          'Create an IAM role with least-privilege S3 and DynamoDB permissions and attach it to the instances via an instance profile',
          'Store access keys in environment variables injected at launch time',
          'Use the root account’s access keys with a restrictive bucket policy',
        ],
        correct: 1,
        explanation: {
          summary: 'An IAM role attached through an instance profile gives the application temporary, automatically-rotated credentials retrieved from the instance metadata service — no long-lived keys to store or rotate, scoped to least privilege.',
          perOption: [
            'Static access keys in a config file are long-lived credentials that can be leaked and must be rotated manually — exactly what the policy forbids.',
            'Correct — an instance profile delivers a role’s temporary, auto-rotated credentials with least-privilege permissions and nothing stored on disk.',
            'Injected static keys are still long-lived credentials that violate the no-stored-keys and rotation requirements.',
            'Using root account keys is a severe violation of root-protection and least-privilege practices.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd3-s8',
      number: 8,
      module: 'Domain 3 · Infrastructure Security',
      domain: 'd3',
      weight: '18%',
      task: 'Task 3.3',
      title: 'Network Security Controls — Security Groups, NACLs, Network Firewall, and Segmentation',
      duration: 30,
      summary: 'The VPC is where most network-security questions live. This session sharpens the controls and the order they apply: stateful security groups versus stateless NACLs, AWS Network Firewall for deep inspection, secure hybrid connectivity, segmentation patterns, and the tools that find unnecessary or unintended access — Network Access Analyzer, Inspector reachability, and Verified Access.',
      objectives: [
        'Distinguish stateful security groups from stateless NACLs and apply each correctly',
        'Add deep traffic inspection and filtering with AWS Network Firewall and DNS Firewall',
        'Design segmentation — north-south, east-west, and isolated subnets — and secure hybrid connectivity',
        'Find unnecessary or unintended network access with Network Access Analyzer, Inspector reachability, and VPC Reachability Analyzer',
      ],
      preLearningCheck: {
        question: 'You add an inbound allow rule to a security group but no matching outbound rule. Return traffic for an allowed inbound connection still flows. Why?',
        options: [
          'Security groups are stateless, so all traffic is allowed by default',
          'Security groups are stateful — return traffic for an allowed connection is automatically permitted regardless of outbound rules',
          'A NACL is overriding the security group',
          'Outbound rules are ignored entirely',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: security groups are stateful. If inbound traffic is allowed, the response is automatically allowed back out (and vice versa). NACLs, by contrast, are stateless and need explicit rules in both directions, including the ephemeral port range for return traffic.',
      },
      sections: [
        {
          heading: 'Security groups vs NACLs — stateful vs stateless',
          body: 'This distinction is tested constantly. Get the model exact:\n\nSecurity groups operate at the elastic network interface (instance) level, are stateful (return traffic for an allowed flow is automatically permitted), support allow rules only, and evaluate all rules before deciding. They are your primary instance-level firewall.\n\nNetwork ACLs operate at the subnet level, are stateless (you must allow both the inbound request and the outbound response, including the ephemeral port range), support both allow and deny rules, and evaluate rules in numbered order, stopping at the first match. NACLs are a coarse, subnet-wide backstop — useful for explicitly denying a specific IP/CIDR, which security groups cannot do.',
          bullets: [
            'Need to allow traffic and let responses flow automatically → security group (stateful).',
            'Need to explicitly DENY a specific IP/CIDR at the subnet edge → NACL (only NACLs support deny).',
            'NACLs are stateless: forgetting the ephemeral-port return rule is a classic "connection hangs" bug.',
            'A security group can reference another security group as its source — clean for tier-to-tier rules.',
          ],
          callout: { type: 'note', text: 'Only NACLs can DENY. If a question requires blocking a specific malicious IP range across a whole subnet, that is a NACL deny rule — a security group can only allow.' },
          interactive: 'network-control',
        },
        {
          heading: 'Deeper inspection — Network Firewall and DNS Firewall',
          body: 'Security groups and NACLs filter on IP/port; they cannot inspect deeply or filter by domain. For that:\n\nAWS Network Firewall is a managed, stateful firewall for the VPC supporting deep packet inspection, Suricata-compatible IPS rules, domain-name allow/deny lists, and protocol filtering — deployed in a dedicated firewall subnet and used for centralized egress/ingress filtering across a VPC or via a transit gateway. Route 53 Resolver DNS Firewall blocks DNS resolution of known-malicious or unapproved domains from within the VPC. AWS Firewall Manager centrally manages WAF, Shield Advanced, security groups, Network Firewall, and DNS Firewall policies across all accounts in the organization.',
          bullets: [
            'Need IPS / deep packet inspection / domain filtering at the VPC level → AWS Network Firewall.',
            'Block DNS lookups of malicious domains → Route 53 Resolver DNS Firewall.',
            'Enforce firewall/WAF/SG policies centrally across the org → AWS Firewall Manager.',
          ],
          callout: { type: 'tip', text: 'When the requirement exceeds IP/port filtering — domain-based egress control, intrusion prevention, payload inspection — the answer is AWS Network Firewall (or DNS Firewall for the DNS layer), not a bigger security-group ruleset.' },
        },
        {
          heading: 'Segmentation and secure hybrid connectivity',
          body: 'Segmentation limits blast radius. North-south (internet ↔ VPC) traffic is controlled at the edge and public subnets; east-west (workload ↔ workload) traffic is controlled with security-group references, separate subnets/VPCs, and a transit gateway with route-table segmentation; the most sensitive tiers sit in isolated subnets with no internet route, reaching AWS services only through VPC endpoints (PrivateLink). For hybrid links: AWS Site-to-Site VPN provides encrypted tunnels over the internet; AWS Direct Connect is a private, dedicated connection (not encrypted by itself — add a VPN or MACsec for encryption); MACsec adds Layer-2 encryption on supported Direct Connect links. AWS Verified Access provides VPN-less, identity- and device-aware access to internal applications, evaluating trust on every request.',
          bullets: [
            'Isolated subnet + VPC endpoints = sensitive workloads reach AWS services without any internet path.',
            'Direct Connect is private but unencrypted — layer a VPN or MACsec for confidentiality.',
            'Verified Access = zero-trust, per-request, identity/device-aware access to internal apps without a VPN.',
          ],
          callout: { type: 'warning', text: 'Direct Connect alone is private but NOT encrypted. If a question requires encryption in transit over the dedicated link, you still need a VPN over Direct Connect or MACsec.' },
        },
        {
          heading: 'Find unnecessary and unintended access',
          body: 'The exam expects proactive discovery of access you did not intend to grant. VPC Network Access Analyzer evaluates network reachability across your VPCs and reports paths to/from the internet or between segments that violate your defined access scopes. Amazon Inspector network reachability findings flag instances reachable from the internet on open ports. VPC Reachability Analyzer tests whether a specific source can reach a specific destination and pinpoints the blocking (or allowing) component — invaluable for troubleshooting why traffic is or isn’t flowing. Together they answer "is anything exposed that shouldn’t be, and what is allowing it."',
          bullets: [
            'Network Access Analyzer = org/VPC-wide "what paths exist that violate my intended access?"',
            'Reachability Analyzer = point-to-point "can A reach B, and which control decides?"',
            'Inspector reachability = "which instances are exposed to the internet on which ports?"',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security team must block all traffic from a specific malicious /24 IP range to every instance in a subnet, overriding any allow rules. Which control can do this?',
          options: [
            'A security group inbound deny rule',
            'A network ACL deny rule on the subnet',
            'A route table entry',
            'A larger security group rule set',
          ],
          correct: 1,
          explainCorrect: 'Correct — only NACLs support explicit deny rules and apply at the subnet level, so a deny rule for the CIDR blocks it regardless of security-group allows. Security groups cannot express a deny.',
          elaborativePrompt: 'Why can’t a security group accomplish an explicit block of a specific IP range?',
        },
        {
          afterSection: 2,
          question: 'A company connects on-premises to AWS over AWS Direct Connect and must guarantee that traffic on the link is encrypted. Direct Connect alone does not satisfy the auditor. What should they add?',
          options: [
            'Nothing — Direct Connect encrypts traffic by default',
            'A Site-to-Site VPN over the Direct Connect link, or MACsec on a supported connection',
            'A larger NACL rule set',
            'Enable S3 encryption',
          ],
          correct: 1,
          explainCorrect: 'Correct — Direct Connect is private but not encrypted; running an IPsec VPN over it or enabling MACsec on supported links provides encryption in transit.',
          elaborativePrompt: 'Why is "private connection" not the same as "encrypted connection" for Direct Connect?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you are securing a three-tier VPC with a hybrid link to on-prem. Walk through where you use security groups versus NACLs, when you reach for Network Firewall, how you segment the tiers and isolate the database, how you encrypt the Direct Connect link, and which tool you run to confirm nothing is unintentionally reachable from the internet.',
      sample: {
        type: 'multiple-choice',
        stem: 'A VPC hosts sensitive workloads that must be able to call Amazon S3 and Amazon DynamoDB but must have no path to or from the internet, and the security team wants to verify continuously that no unintended internet path exists. Which combination meets the requirement?',
        options: [
          'Place the workloads in a public subnet with a restrictive security group, and check manually',
          'Place the workloads in isolated private subnets reaching AWS services through VPC (gateway/interface) endpoints, and run VPC Network Access Analyzer to confirm no internet paths exist',
          'Use a NAT gateway and rely on Inspector for patching',
          'Attach an internet gateway and block port 80 with a NACL',
        ],
        correct: 1,
        explanation: {
          summary: 'Isolated private subnets with VPC endpoints let the workloads reach S3 and DynamoDB privately with no internet route at all, and Network Access Analyzer continuously evaluates reachability to prove no unintended internet path exists.',
          perOption: [
            'A public subnet gives the workloads an internet path, the opposite of the requirement, and manual checks don’t scale.',
            'Correct — VPC endpoints provide private service access from isolated subnets, and Network Access Analyzer verifies the absence of internet paths org-wide.',
            'A NAT gateway creates outbound internet access, which the requirement forbids; Inspector is for vulnerabilities, not network paths.',
            'Attaching an internet gateway introduces an internet path; a single port block does not isolate the workloads.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — IDENTITY AND ACCESS MANAGEMENT (20%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s9',
      number: 9,
      module: 'Domain 4 · Identity and Access Management',
      domain: 'd4',
      weight: '20%',
      task: 'Task 4.1',
      title: 'Authentication — Identity Center, Cognito, MFA, and Temporary Credentials',
      duration: 30,
      summary: 'Authentication answers "who are you" — and the exam draws a hard line between human/workforce identity and application/customer identity. This session covers IAM Identity Center for workforce SSO, Amazon Cognito for application users, MFA and external IdP federation, and how STS issues the temporary credentials that should power almost everything.',
      objectives: [
        'Choose IAM Identity Center for workforce access and Amazon Cognito for application/customer users',
        'Federate with external identity providers using SAML and OIDC, and enforce MFA',
        'Issue and use temporary credentials with AWS STS, and generate S3 presigned URLs for scoped access',
        'Troubleshoot authentication failures with CloudTrail, permission sets, and Directory Service',
      ],
      preLearningCheck: {
        question: 'A company with 2,000 employees wants single sign-on to multiple AWS accounts using their existing corporate identity provider, with centrally managed permissions per account. Which service is purpose-built for this?',
        options: [
          'Amazon Cognito user pools',
          'AWS IAM Identity Center (successor to AWS SSO), federated to the corporate IdP, using permission sets',
          'An IAM user for each employee in every account',
          'Amazon Verified Permissions',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: IAM Identity Center is the workforce SSO service — it federates to a corporate IdP (or its own directory) and assigns permission sets across many accounts in the org. Cognito is for application/customer users, not workforce console access.',
      },
      sections: [
        {
          heading: 'Workforce identity vs application identity',
          body: 'The single most important authentication distinction on the exam:\n\nAWS IAM Identity Center — workforce/human access to AWS accounts and applications. It connects to an external IdP (Okta, Entra ID, Ping) via SAML 2.0 or to its own built-in directory or AWS Managed Microsoft AD, then grants access across all org accounts using permission sets (reusable collections of policies that become IAM roles in each account). Users get one sign-on portal and short-term credentials.\n\nAmazon Cognito — application/customer identity. User pools provide sign-up/sign-in and a user directory for your app (with OIDC/OAuth2, hosted UI, MFA, and social/enterprise federation); identity pools (federated identities) exchange a verified identity for temporary AWS credentials via STS so the app can call AWS services directly.\n\nIAM users/groups still exist but AWS steers you away from per-person IAM users toward federation and Identity Center.',
          bullets: [
            'Employees signing in to AWS accounts/CLI → IAM Identity Center + permission sets.',
            'Customers signing in to your web/mobile app → Amazon Cognito user pool (authN) + identity pool (temporary AWS creds).',
            'Permission set = the reusable role definition Identity Center deploys into each assigned account.',
          ],
          callout: { type: 'note', text: 'Workforce = IAM Identity Center. App/customer users = Cognito. Mixing these up is a top distractor. "Employees, SSO, multiple accounts" → Identity Center; "millions of app sign-ins, social login" → Cognito.' },
        },
        {
          heading: 'Federation and MFA',
          body: 'Federation lets users keep one identity. SAML 2.0 federation maps an external IdP’s assertions to IAM roles (or Identity Center permission sets) — used for enterprise workforce SSO. OIDC federation (web identity) is common for app and CI/CD use cases, including GitHub Actions assuming a role without stored keys. AWS Directory Service (AWS Managed Microsoft AD) provides a managed AD for workloads that need real Active Directory, and can be the identity source for Identity Center. MFA should be enforced everywhere it matters: on the root user (hardware MFA, then lock the credentials away), on privileged roles via an aws:MultiFactorAuthPresent condition in policies, and within Identity Center and Cognito sign-in flows.',
          bullets: [
            'SAML 2.0 → enterprise workforce SSO to roles/permission sets; OIDC → web/app and pipeline federation.',
            'Enforce MFA on root and privileged actions; policies can require aws:MultiFactorAuthPresent = true.',
            'AWS Managed Microsoft AD (Directory Service) backs workloads that need genuine Active Directory.',
          ],
          callout: { type: 'tip', text: 'GitHub Actions / external CI calling AWS "without stored long-lived keys" → OIDC federation to an IAM role. Enterprise employees → SAML to Identity Center.' },
        },
        {
          heading: 'Temporary credentials with STS and presigned URLs',
          body: 'AWS Security Token Service (STS) issues short-lived credentials and is the engine behind roles, federation, and Identity Center. AssumeRole returns temporary credentials for a role (optionally with an ExternalId for third-party cross-account access, or a session policy to further scope down); AssumeRoleWithSAML and AssumeRoleWithWebIdentity do the same from federated identities. Temporary credentials are the default-correct answer for almost any "how should X get access" question because they expire automatically and avoid stored secrets. For object-level sharing, an S3 presigned URL grants time-limited access to a specific object using the signer’s permissions — ideal for letting a user upload or download one object without giving them broader S3 access or AWS credentials.',
          bullets: [
            'Prefer STS temporary credentials (AssumeRole / federation) over any long-lived access key.',
            'Cross-account third-party access → role with an ExternalId to prevent the confused-deputy problem.',
            'Share one object briefly → S3 presigned URL (time-limited, scoped to that object, no AWS account needed).',
          ],
        },
        {
          heading: 'Troubleshooting authentication',
          body: 'When sign-in or assume-role fails, work the evidence. CloudTrail records every authentication and AssumeRole event with the error — start there to see whether the request even arrived and why it was denied. For Identity Center issues, check that the user is assigned the permission set for that account and that the IdP attribute mapping is correct. For Cognito, check the app client settings, the user pool/identity pool trust, and token expiry. For AD-backed scenarios, confirm the Directory Service trust and that the user is in the right group. A federation failure is often a trust-policy or attribute-mapping mismatch rather than a permissions problem.',
          callout: { type: 'warning', text: 'A "user can authenticate but can’t access the account" problem in Identity Center is usually a missing permission-set assignment or wrong attribute mapping — not a broken IdP. CloudTrail tells you which.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A SaaS company needs sign-up, sign-in, social login, and a user directory for the millions of consumers using its mobile app, plus a way to grant those users temporary AWS credentials to upload to S3. Which service fits?',
          options: [
            'AWS IAM Identity Center',
            'Amazon Cognito (user pool for sign-in, identity pool for temporary AWS credentials)',
            'IAM users created per customer',
            'AWS Directory Service',
          ],
          correct: 1,
          explainCorrect: 'Correct — Cognito user pools handle consumer authentication and social federation, and identity pools exchange the verified identity for temporary AWS credentials via STS. Identity Center is for workforce access, not app customers.',
          elaborativePrompt: 'Why is Cognito, not IAM Identity Center, the right choice for application customers?',
        },
        {
          afterSection: 2,
          question: 'A user must be able to download one specific private S3 object for the next 15 minutes, without an AWS account or any broader S3 permissions. What is the simplest secure mechanism?',
          options: [
            'Make the bucket public temporarily',
            'Generate an S3 presigned URL scoped to that object with a 15-minute expiry',
            'Create an IAM user with S3FullAccess',
            'Email the object’s access keys',
          ],
          correct: 1,
          explainCorrect: 'Correct — a presigned URL grants time-limited access to exactly one object using the signer’s permissions, with no AWS account or extra IAM grant for the recipient.',
          elaborativePrompt: 'How does a presigned URL limit exposure compared with broadening the recipient’s IAM permissions?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company has 1,500 employees who need SSO into 30 AWS accounts, a customer-facing app with millions of users who sign in with Google, a CI pipeline in GitHub that deploys to AWS, and a need to let a partner download a single report file. Walk through which authentication service and credential mechanism you use for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company uses Okta as its corporate identity provider and wants employees to sign in once and access roles across all 25 of its AWS accounts, with permissions managed centrally and no per-account IAM users. Which solution best meets this?',
        options: [
          'Create matching IAM users in every account and sync passwords from Okta',
          'Configure AWS IAM Identity Center with Okta as the external SAML identity source and assign permission sets to users/groups across the accounts',
          'Use Amazon Cognito user pools federated to Okta for console access',
          'Share a single cross-account IAM role’s access keys with all employees',
        ],
        correct: 1,
        explanation: {
          summary: 'IAM Identity Center federates to Okta via SAML and uses permission sets to grant centrally-managed, role-based access across all org accounts with a single sign-on — no per-account IAM users and no long-lived keys.',
          perOption: [
            'Per-account IAM users with synced passwords is unscalable, hard to audit, and the opposite of centralized federation.',
            'Correct — Identity Center + Okta (SAML) + permission sets delivers central, role-based SSO across every account.',
            'Cognito is for application/customer identities, not workforce console access across many AWS accounts.',
            'Sharing a role’s access keys is insecure, non-auditable per user, and relies on long-lived credentials.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd4-s10',
      number: 10,
      module: 'Domain 4 · Identity and Access Management',
      domain: 'd4',
      weight: '20%',
      task: 'Task 4.2',
      title: 'Authorization — Policy Evaluation, Least Privilege, Boundaries, and ABAC',
      duration: 30,
      summary: 'Authorization answers "what are you allowed to do" — and Domain 4 is the largest on the exam, with policy evaluation at its heart. This session locks in the IAM evaluation logic (explicit deny always wins), the policy types and how they combine, permission boundaries and SCPs, ABAC with tags, and the analysis tools that explain and fix unintended access.',
      objectives: [
        'Apply the IAM policy evaluation logic — explicit deny > explicit allow > implicit deny — across identity, resource, SCP, boundary, and session policies',
        'Write least-privilege policies and constrain maximum permissions with permission boundaries and SCPs',
        'Design ABAC with tags and choose between ABAC and RBAC',
        'Diagnose and fix authorization failures with IAM Access Analyzer and the policy simulator',
      ],
      preLearningCheck: {
        question: 'An identity-based policy allows s3:DeleteObject, but a Service Control Policy on the account explicitly denies s3:DeleteObject. Can the user delete the object?',
        options: [
          'Yes, because the identity policy grants it',
          'No — an explicit deny anywhere in the evaluation (including an SCP) always overrides any allow',
          'Only if they have MFA',
          'Yes, because SCPs do not affect IAM users',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: explicit deny always wins. An SCP that denies an action removes it from the maximum permission set for the entire account, so no identity policy can grant it back. This single rule resolves a large share of Domain 4 questions.',
      },
      sections: [
        {
          heading: 'The evaluation logic — explicit deny always wins',
          body: 'Every authorization question reduces to one decision flow. A request is allowed only if it survives every applicable policy type:\n\n1. Is there an explicit DENY in any policy (identity, resource, SCP, permission boundary, session policy)? If yes → denied, full stop.\n2. For cross-account, an allow is needed in BOTH the resource policy and the caller’s identity policy.\n3. Within an account, an explicit ALLOW in an identity or resource policy is required.\n4. SCPs and permission boundaries set the MAXIMUM permissions — they don’t grant anything; a permission must be allowed by an identity/resource policy AND not be excluded by any boundary/SCP.\n5. Default is implicit deny.\n\nThe practical hierarchy: explicit deny > (boundary/SCP must permit) > explicit allow > implicit deny.',
          bullets: [
            'Explicit deny in ANY policy type beats every allow — memorize this.',
            'SCPs and permission boundaries are guardrails (max permissions), never grants.',
            'Effective permissions = (what identity/resource policies allow) ∩ (what every boundary/SCP permits), minus any explicit deny.',
            'Cross-account access needs an allow on both sides: the resource policy and the principal’s identity policy.',
          ],
          callout: { type: 'note', text: 'If a permission seems granted but the action still fails, look for an explicit deny or a boundary/SCP that doesn’t include it. "Allowed in the IAM policy but still denied" almost always means an SCP, permission boundary, or resource-policy deny.' },
          interactive: 'policy-eval',
        },
        {
          heading: 'The policy types and how they combine',
          body: 'Six policy types appear on the exam, each with a job:\n\nIdentity-based policies attach to a user, group, or role and grant permissions to that principal. Resource-based policies attach to a resource (S3 bucket policy, KMS key policy, SQS, Lambda) and grant a principal access to that resource — and enable cross-account access without assuming a role. Permission boundaries cap the maximum permissions an identity can have (used to safely delegate IAM administration). Service Control Policies (and the newer Resource Control Policies) set the maximum permissions for accounts/OUs in an organization. Session policies are passed at AssumeRole time to further scope a session. ACLs (legacy S3/cross-account) are a coarse, mostly-discouraged option.',
          bullets: [
            'Resource-based policy (e.g. S3 bucket policy, KMS key policy) is how you grant cross-account access without role assumption.',
            'Permission boundary = a ceiling on an identity, used so a junior admin can create roles but never exceed the boundary.',
            'SCP/RCP = org-wide ceilings on accounts/OUs; they never grant, only restrict.',
            'KMS key policy is the root of trust for a key — IAM alone cannot grant key use unless the key policy allows it.',
          ],
          callout: { type: 'warning', text: 'A KMS key’s key policy must allow access — an identity policy granting kms:Decrypt is not enough on its own unless the key policy delegates to IAM. This trips up many "why can’t this role decrypt" questions.' },
        },
        {
          heading: 'Least privilege, boundaries, ABAC vs RBAC',
          body: 'AWS wants the minimum permissions necessary. Start from zero and add only what is needed; use IAM Access Analyzer policy generation to build a policy from observed CloudTrail activity. Permission boundaries let you delegate role/user creation safely — the created principal can never exceed the boundary even if its policy says more. For scaling permissions, contrast two models: RBAC grants permissions by role/job function (predefined policies per role) and works well when roles are stable; ABAC (attribute-based access control) grants based on tags — a policy says "allow access to resources whose Project tag matches the principal’s Project tag," so you add new projects/teams without writing new policies. ABAC scales better in large, fast-changing orgs; RBAC is simpler when the set of roles is small and fixed. IAM Roles Anywhere and IAM path-based organization help structure principals at scale.',
          bullets: [
            'Generate least-privilege policies from real usage with IAM Access Analyzer policy generation.',
            'Permission boundary = safe delegation of IAM admin; the principal can’t exceed the ceiling.',
            'ABAC (tag-matching policies) scales to many teams/projects without new policies; RBAC fits a small, stable set of roles.',
          ],
          callout: { type: 'tip', text: 'When a question says "grant access that automatically scales as new projects/teams are added without writing new policies," that is ABAC — tag-based conditions like aws:PrincipalTag matching aws:ResourceTag.' },
        },
        {
          heading: 'Analyze and fix unintended access',
          body: 'The exam expects you to prove and repair access. IAM Access Analyzer identifies resources (S3 buckets, roles, KMS keys, etc.) shared with external principals — surfacing unintended public or cross-account exposure — and its unused-access analysis flags unused roles/permissions to right-size them. The IAM policy simulator evaluates whether a given policy set would allow or deny a specific action, so you can test before deploying. Last-accessed information (service and action last-accessed data) shows which permissions a principal actually uses, guiding removal of the rest. Combined, these let you detect over-permissioning, simulate the fix, and tighten to least privilege.',
          bullets: [
            'Find resources exposed externally / publicly → IAM Access Analyzer (external-access findings).',
            'Test whether a policy allows/denies an action before deploying → IAM policy simulator.',
            'Right-size permissions → last-accessed data + Access Analyzer unused-access findings.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A role has an identity policy allowing ec2:* and the account’s SCP allows ec2:Describe* only. A resource has no relevant policy. Can the role call ec2:TerminateInstances?',
          options: [
            'Yes, the identity policy allows ec2:*',
            'No — the SCP caps the account at ec2:Describe*, so TerminateInstances is outside the maximum permissions and is denied',
            'Yes, if the user has MFA',
            'Only in the management account',
          ],
          correct: 1,
          explainCorrect: 'Correct — an SCP sets the maximum permissions for the account. Even though the identity policy allows ec2:*, the effective permission is the intersection with the SCP, which permits only ec2:Describe*. TerminateInstances is excluded.',
          elaborativePrompt: 'Why does the SCP limit the result even though the identity policy is broader?',
        },
        {
          afterSection: 3,
          question: 'A security team must find every S3 bucket and IAM role in the account that is accessible by principals outside the organization, to remediate unintended sharing. Which tool is purpose-built for this?',
          options: [
            'IAM policy simulator',
            'IAM Access Analyzer (external-access findings)',
            'AWS Config rules only',
            'Amazon Inspector',
          ],
          correct: 1,
          explainCorrect: 'Correct — IAM Access Analyzer continuously analyzes resource policies and reports resources shared with external/public principals, exactly the unintended-exposure use case. The simulator tests a specific request rather than discovering external exposure.',
          elaborativePrompt: 'How does Access Analyzer’s job differ from the policy simulator’s job?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a role’s IAM policy clearly allows an action, yet the action is denied. Walk through every place a deny or a missing ceiling could come from — explicit deny, SCP/RCP, permission boundary, session policy, resource-policy or KMS key-policy gap, cross-account both-sides rule — and which tool you would use to confirm the cause and then prove the fix.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer’s IAM role has a policy that allows s3:GetObject on a bucket, but every GetObject request is denied. The bucket is in the same account and has a bucket policy with an explicit Deny for any request where aws:SecureTransport is false. The developer’s tool is calling over HTTP. Why is the request denied, and what is the fix?',
        options: [
          'The identity policy is wrong; add s3:* to fix it',
          'The bucket policy’s explicit deny (non-TLS requests) overrides the identity allow; the fix is to call S3 over HTTPS',
          'SCPs always block S3; remove the SCP',
          'The role needs MFA to read objects',
        ],
        correct: 1,
        explanation: {
          summary: 'An explicit deny always overrides an allow. The bucket policy denies any request not using TLS (aws:SecureTransport=false), so HTTP requests are denied regardless of the identity allow. Switching the client to HTTPS satisfies the condition and the request succeeds.',
          perOption: [
            'Broadening the identity policy to s3:* changes nothing — the explicit deny still wins, and it violates least privilege.',
            'Correct — the explicit deny on non-TLS requests overrides the allow; calling over HTTPS makes aws:SecureTransport true and the request is permitted.',
            'There is no SCP described here; the deny comes from the bucket policy’s TLS condition.',
            'The deny is conditioned on transport security, not MFA; adding MFA would not satisfy aws:SecureTransport.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 5 — DATA PROTECTION (18%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd5-s11',
      number: 11,
      module: 'Domain 5 · Data Protection',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.1',
      title: 'Data in Transit — Enforcing TLS, Private Connectivity, and Inter-Service Encryption',
      duration: 30,
      summary: 'Data on the wire must be encrypted and, where possible, kept off the public internet entirely. This session covers enforcing TLS at load balancers and on S3, using ACM to manage certificates, reaching AWS services privately with VPC endpoints and PrivateLink, and the encryption-in-transit options for analytics and container workloads the exam likes to test.',
      objectives: [
        'Enforce encryption in transit with ELB security policies, HTTPS listeners, and S3 aws:SecureTransport conditions',
        'Manage and rotate TLS certificates with AWS Certificate Manager (ACM)',
        'Keep traffic off the public internet using VPC endpoints, AWS PrivateLink, Client VPN, and Verified Access',
        'Recognize the in-transit encryption controls for EMR, EKS, SageMaker, and Nitro-based instances',
      ],
      preLearningCheck: {
        question: 'A team must guarantee that no client can read or write an S3 bucket over unencrypted HTTP — every request must use TLS. What is the cleanest way to enforce this?',
        options: [
          'Hope clients use HTTPS and monitor for HTTP requests',
          'Add a bucket policy that denies any request where aws:SecureTransport is false',
          'Enable default encryption on the bucket',
          'Turn on S3 Block Public Access',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: default encryption protects data at rest, not in transit. To force TLS, a bucket policy with a Deny on aws:SecureTransport = false rejects any non-HTTPS request outright.',
      },
      sections: [
        {
          heading: 'Enforce encryption in transit',
          body: 'The exam expects encryption in transit to be required, not optional. The controls:\n\nLoad balancers — configure an HTTPS/TLS listener and attach an ACM certificate; choose a modern ELB security policy that disallows weak protocols/ciphers (e.g. TLS 1.2+). Redirect HTTP to HTTPS so plaintext is never served.\n\nS3 — add a bucket policy that denies any request where aws:SecureTransport is false. This is the canonical "force TLS for S3" answer and a frequent troubleshooting scenario (an HTTP client gets AccessDenied because of this condition).\n\nAPIs and CloudFront — set the viewer protocol policy to redirect-to-HTTPS or HTTPS-only, and use minimum TLS versions. Many AWS service endpoints already require TLS.',
          bullets: [
            'Force TLS on S3 → bucket policy Deny when aws:SecureTransport = false.',
            'ELB → HTTPS listener + ACM cert + a security policy that bans weak TLS versions/ciphers.',
            'CloudFront → viewer protocol policy redirect-to-HTTPS and a minimum TLS version.',
          ],
          callout: { type: 'note', text: 'aws:SecureTransport is the condition key for "was this request made over TLS." A Deny when it is false is how you make HTTPS mandatory — and a classic reason an otherwise-allowed S3 request is denied.' },
        },
        {
          heading: 'Certificates with ACM',
          body: 'AWS Certificate Manager provisions, manages, and auto-renews TLS certificates for integrated services — Elastic Load Balancing, CloudFront, API Gateway, and more. Public ACM certificates are free and renew automatically (so expired-certificate outages disappear), but the private key never leaves AWS and cannot be exported, so ACM public certs only work with integrated services. For certificates you must install on EC2 or on-premises, or for an internal PKI, use AWS Private Certificate Authority (ACM Private CA) to issue private certificates. The exam tells: "automatically renewing public TLS certs for an ALB/CloudFront" → ACM; "issue private certificates for internal services / an internal CA" → AWS Private CA.',
          bullets: [
            'ACM public certs: free, auto-renewing, usable only with integrated services (ALB, CloudFront, API GW).',
            'ACM-issued public cert private keys cannot be exported — they stay in AWS.',
            'AWS Private CA issues private certificates for internal PKI and for installing on instances.',
          ],
          callout: { type: 'tip', text: 'If a question worries about certificate expiry causing an outage, ACM’s automatic renewal for integrated services is the answer — no manual rotation.' },
        },
        {
          heading: 'Keep traffic private — VPC endpoints and PrivateLink',
          body: 'Encryption is stronger when the traffic never touches the public internet. Two endpoint types: a gateway VPC endpoint provides private access to Amazon S3 and DynamoDB via a route-table entry (free); an interface VPC endpoint (powered by AWS PrivateLink) creates an ENI in your subnet with a private IP for most other AWS services and for your own/partner services. PrivateLink also lets you expose a service in your VPC privately to other VPCs/accounts without VPC peering or internet exposure. For user access: AWS Client VPN gives remote users an encrypted tunnel into the VPC, and AWS Verified Access provides VPN-less, identity-aware access to internal applications. Pairing private endpoints with a bucket-policy condition like aws:SourceVpce lets you require that S3 is reached only through your endpoint.',
          bullets: [
            'Gateway endpoint → S3 and DynamoDB (route-table based, no ENI, free).',
            'Interface endpoint (PrivateLink) → most other services and private SaaS, via a private-IP ENI.',
            'Restrict a bucket to your VPC endpoint with an aws:SourceVpce condition in the bucket policy.',
          ],
          callout: { type: 'warning', text: 'A gateway endpoint is only for S3 and DynamoDB. For any other service (KMS, Secrets Manager, SSM, etc.) you need an interface endpoint (PrivateLink). Choosing the wrong endpoint type is a common distractor.' },
        },
        {
          heading: 'In-transit encryption for analytics and containers',
          body: 'Specialty scenarios reach into data and container services. Amazon EMR supports in-transit encryption between cluster nodes (TLS) configured via a security configuration. Amazon EKS encrypts control-plane traffic and supports mTLS/service mesh (e.g. App Mesh) for pod-to-pod encryption. Amazon SageMaker can enable inter-container traffic encryption for distributed training jobs. AWS Nitro System instances provide encryption of traffic between supported Nitro instances automatically, and Nitro Enclaves isolate highly sensitive data processing. The point the exam makes: encryption in transit is configurable inside these managed services, not just at the load balancer.',
          bullets: [
            'EMR security configuration enables node-to-node TLS in the cluster.',
            'SageMaker can encrypt inter-container traffic for distributed training.',
            'Nitro-based instances encrypt traffic between supported instances; Nitro Enclaves isolate sensitive processing.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An auditor requires that an S3 bucket reject every request not made over TLS. Which control enforces this directly?',
          options: [
            'Enable S3 default encryption (SSE-S3)',
            'Add a bucket policy that denies requests where aws:SecureTransport is false',
            'Turn on S3 Versioning',
            'Enable S3 Block Public Access',
          ],
          correct: 1,
          explainCorrect: 'Correct — the aws:SecureTransport=false Deny rejects any non-HTTPS request. Default encryption, versioning, and Block Public Access address other concerns (at-rest encryption, recovery, public exposure).',
          elaborativePrompt: 'Why does default encryption not satisfy an in-transit (TLS) requirement?',
        },
        {
          afterSection: 2,
          question: 'Workloads in a private subnet must call AWS KMS without any internet path. Which connectivity option is required?',
          options: [
            'A gateway VPC endpoint',
            'An interface VPC endpoint (AWS PrivateLink) for KMS',
            'A NAT gateway',
            'An internet gateway with a restrictive NACL',
          ],
          correct: 1,
          explainCorrect: 'Correct — gateway endpoints only serve S3 and DynamoDB; every other service, including KMS, needs an interface endpoint (PrivateLink). NAT and internet gateways introduce an internet path.',
          elaborativePrompt: 'When do you reach for a gateway endpoint versus an interface endpoint?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must guarantee all traffic to an application is encrypted in transit, certificates never silently expire, and sensitive workloads reach S3 and KMS without crossing the internet. Walk through the ELB/S3 enforcement, how ACM handles certs, and which endpoint types you use for S3 versus KMS.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company terminates TLS on an Application Load Balancer and must ensure only strong, modern TLS is negotiated, certificates renew without manual work, and HTTP requests are never served in plaintext. Which combination meets all three?',
        options: [
          'Self-signed certificates on the instances and an HTTP listener',
          'An HTTPS listener with an ACM certificate, an ELB security policy that requires TLS 1.2+, and an HTTP-to-HTTPS redirect',
          'A TCP listener with a network load balancer and no certificate',
          'Store a purchased certificate in S3 and reference it from the listener',
        ],
        correct: 1,
        explanation: {
          summary: 'An HTTPS listener with an ACM-managed certificate gives automatic renewal, a modern ELB security policy enforces TLS 1.2+ and strong ciphers, and an HTTP-to-HTTPS redirect ensures plaintext is never served.',
          perOption: [
            'Self-signed certs and an HTTP listener provide neither trusted TLS nor encryption in transit.',
            'Correct — ACM cert (auto-renew) + a TLS 1.2+ security policy + HTTP→HTTPS redirect satisfies all three requirements.',
            'A plain TCP listener with no certificate does not enforce TLS at the load balancer.',
            'ACM manages and renews the certificate for integrated services; stashing a static cert in S3 reintroduces manual rotation.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd5-s12',
      number: 12,
      module: 'Domain 5 · Data Protection',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.2',
      title: 'Data at Rest — KMS, CloudHSM, Object Integrity, and Backup',
      duration: 30,
      summary: 'Encryption at rest on AWS runs through KMS, and the exam tests the envelope-encryption model, the KMS-vs-CloudHSM choice, and client-side vs server-side encryption. This session also covers data integrity and immutability (Object Lock, Vault Lock, versioning), lifecycle and retention, and the backup and replication strategy that defends against ransomware.',
      objectives: [
        'Explain envelope encryption and choose between SSE-S3, SSE-KMS, SSE-C, and client-side encryption',
        'Decide between AWS KMS and AWS CloudHSM based on control, compliance, and single-tenancy needs',
        'Ensure integrity and immutability with S3 Object Lock, S3 Versioning, Glacier Vault Lock, and code signing',
        'Design backup, lifecycle, and replication with AWS Backup, DLM, and DataSync, including ransomware protection',
      ],
      preLearningCheck: {
        question: 'A regulated workload requires a dedicated, single-tenant FIPS 140-2 Level 3 hardware security module that the customer fully controls, for managing its own encryption keys. Which service fits?',
        options: [
          'AWS KMS with an AWS managed key',
          'AWS CloudHSM',
          'AWS Secrets Manager',
          'Amazon Macie',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: KMS is a multi-tenant managed service backed by HSMs and is the default for most workloads. CloudHSM gives a dedicated, single-tenant HSM under your exclusive control — the answer when a regulation demands single tenancy or you must own the HSM.',
      },
      sections: [
        {
          heading: 'KMS and the envelope-encryption model',
          body: 'AWS KMS is the center of at-rest encryption. It holds customer master keys (KMS keys) and uses envelope encryption: KMS generates a data key, the service encrypts your data with that data key, and KMS encrypts the data key under the KMS key — so the plaintext data key is never stored. KMS keys come in three flavors: AWS managed keys (created and managed by services, e.g. aws/s3), customer managed keys (you control the policy, rotation, and grants), and AWS owned keys. Customer managed keys give you key policies, automatic annual rotation, grants, and CloudTrail visibility into every Decrypt call. Access to use a key is governed by the key policy (the root of trust) plus IAM and optional grants.',
          bullets: [
            'Envelope encryption: data encrypted with a data key; the data key encrypted by the KMS key — plaintext data key never persisted.',
            'Customer managed key = full control: key policy, automatic rotation, grants, per-call CloudTrail.',
            'The KMS key policy must allow access; an IAM allow for kms:Decrypt is insufficient unless the key policy delegates to IAM.',
          ],
          callout: { type: 'note', text: 'For cross-account or cross-service key use, the KMS key policy is decisive. Many "why can’t this role decrypt" problems are a key policy that never granted the principal — not a missing IAM permission.' },
        },
        {
          heading: 'KMS vs CloudHSM, and where encryption happens',
          body: 'Two decisions the exam loves:\n\nKMS vs CloudHSM — KMS is multi-tenant, fully managed, deeply integrated, and right for the vast majority of workloads. CloudHSM is a single-tenant, dedicated, FIPS 140-2 Level 3 HSM you control exclusively — choose it when a regulation mandates single tenancy, you must manage the HSM yourself, or you need specific cryptographic operations KMS doesn’t expose. KMS can even use a CloudHSM-backed custom key store to combine integration with dedicated hardware.\n\nServer-side vs client-side — SSE-S3 (S3-managed keys), SSE-KMS (KMS keys, auditable and controllable), and SSE-C (customer-provided keys) all encrypt on the server. Client-side encryption encrypts data before it ever reaches AWS, so AWS never sees plaintext — the choice when you cannot trust the cloud with plaintext at all.',
          bullets: [
            'Default to KMS; choose CloudHSM for single-tenant/dedicated-HSM/compliance mandates.',
            'SSE-KMS gives auditable, controllable server-side encryption with CloudTrail on key use.',
            'Client-side encryption = data encrypted before upload; AWS never handles plaintext.',
          ],
          callout: { type: 'tip', text: '"Dedicated, single-tenant, customer-controlled HSM / FIPS 140-2 Level 3" → CloudHSM. "Managed, integrated, auditable keys for S3/EBS/RDS" → SSE-KMS with a customer managed key.' },
        },
        {
          heading: 'Integrity and immutability',
          body: 'Confidentiality is not enough — the exam tests tamper-resistance. S3 Versioning preserves every version so an overwrite or delete can be rolled back. S3 Object Lock (WORM) makes objects immutable for a retention period or under a legal hold; compliance mode means not even the root user can delete them until the period expires (governance mode allows privileged override). S3 Glacier Vault Lock enforces a write-once-read-many policy on archives that, once locked, cannot be changed. For software supply chain integrity, AWS Signer code signing verifies that Lambda code or container artifacts have not been altered. CloudTrail log file validation provides a signed digest to prove logs are intact.',
          bullets: [
            'S3 Object Lock compliance mode = immutable even to root for the retention period — the strongest anti-tamper/anti-ransomware control for S3.',
            'Versioning enables rollback; Object Lock prevents deletion outright.',
            'Glacier Vault Lock locks an archive WORM policy permanently once set.',
          ],
          callout: { type: 'warning', text: 'Compliance mode vs governance mode on Object Lock is a tested distinction: compliance mode cannot be overridden by anyone (including root); governance mode permits override by principals with a special permission. Regulatory immutability → compliance mode.' },
        },
        {
          heading: 'Lifecycle, backup, and ransomware defense',
          body: 'Data protection includes keeping clean, recoverable copies. AWS Backup centrally manages and automates backups across EBS, RDS, DynamoDB, EFS, FSx, and more, with backup policies, cross-Region/cross-account copy, and a vault you can lock (AWS Backup Vault Lock) to make backups immutable. Amazon Data Lifecycle Manager automates EBS snapshot creation and retention. S3 Lifecycle rules transition objects to cheaper classes and expire them on schedule. AWS DataSync moves data efficiently between on-premises and AWS. The ransomware-resilient pattern the exam rewards: versioning + Object Lock or Backup Vault Lock + cross-account copies, so an attacker who compromises one account cannot encrypt or delete the only copy.',
          bullets: [
            'AWS Backup = centralized, policy-driven backups across many services, with cross-account/Region copy and Vault Lock immutability.',
            'Ransomware resilience = immutable, versioned, cross-account copies the attacker cannot reach or alter.',
            'DLM automates EBS snapshots; S3 Lifecycle automates tiering and expiration.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A role’s IAM policy grants kms:Decrypt, but it still cannot decrypt objects encrypted with a customer managed KMS key in the same account. What is the most likely cause?',
          options: [
            'The S3 bucket is not versioned',
            'The KMS key policy does not grant the role permission to use the key',
            'The object is in Glacier',
            'MFA is not enabled on the role',
          ],
          correct: 1,
          explainCorrect: 'Correct — the KMS key policy is the root of trust. Unless it grants the principal (directly or by delegating to IAM), an IAM allow for kms:Decrypt is not sufficient.',
          elaborativePrompt: 'Why must the key policy, not just the IAM policy, permit key use?',
        },
        {
          afterSection: 2,
          question: 'A compliance rule requires that audit objects in S3 cannot be deleted or overwritten by anyone — including administrators and the root user — for seven years. Which control enforces this?',
          options: [
            'S3 Versioning alone',
            'S3 Object Lock in compliance mode with a seven-year retention period',
            'A restrictive bucket policy',
            'SSE-KMS encryption',
          ],
          correct: 1,
          explainCorrect: 'Correct — Object Lock compliance mode makes objects immutable for the retention period and cannot be overridden by any principal, including root. Versioning alone allows deletion of versions; a bucket policy can be changed.',
          elaborativePrompt: 'Why is compliance mode stronger than a bucket policy for guaranteeing immutability?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must encrypt sensitive data at rest with auditable, customer-controlled keys, guarantee certain records cannot be altered or deleted for years, and keep backups that survive a ransomware attack on the primary account. Walk through your KMS key choice, the immutability control, and the backup design — and note when CloudHSM would be required instead of KMS.',
      sample: {
        type: 'multiple-choice',
        stem: 'A financial company must protect S3 backups against ransomware: even if an attacker gains admin access to the production account, the backups must not be deletable or alterable, and a clean copy must exist outside that account. Which design best meets this?',
        options: [
          'Enable SSE-KMS on the bucket and rely on IAM policies to block deletes',
          'Use S3 Versioning plus Object Lock in compliance mode, and replicate the data to a separate account whose backup vault is locked',
          'Store a single copy in S3 Glacier and restrict access with a bucket policy',
          'Take EBS snapshots nightly in the same account',
        ],
        correct: 1,
        explanation: {
          summary: 'Object Lock in compliance mode makes the objects immutable even to an account admin or root, versioning preserves prior states, and replicating to a separate, vault-locked account ensures a clean copy the attacker cannot reach or destroy.',
          perOption: [
            'SSE-KMS protects confidentiality, and IAM policies can be changed by a compromised admin — neither guarantees immutability.',
            'Correct — compliance-mode Object Lock + versioning + a cross-account locked vault delivers immutable, unreachable, recoverable copies.',
            'A single copy with a mutable bucket policy is neither immutable nor isolated from a compromised admin.',
            'Same-account nightly snapshots can be deleted by the same compromised admin — no isolation or immutability.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd5-s13',
      number: 13,
      module: 'Domain 5 · Data Protection',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.3',
      title: 'Secrets, Credentials & Key Material — Secrets Manager, KMS Key Lifecycle, and Data Masking',
      duration: 30,
      summary: 'Long-lived secrets are a liability; the exam wants them stored, rotated, and scoped by AWS-native services. This session covers Secrets Manager versus Parameter Store, automatic rotation, KMS key material options (AWS-generated, imported, external key stores, multi-Region), masking sensitive data in logs and notifications, and issuing private certificates.',
      objectives: [
        'Store and automatically rotate secrets with AWS Secrets Manager, and know when SSM Parameter Store fits',
        'Choose KMS key material: AWS-generated, imported (BYOK), external key store (XKS), and multi-Region keys',
        'Mask sensitive data with CloudWatch Logs data protection policies and SNS message data protection',
        'Issue and manage private certificates and key material with AWS Private CA',
      ],
      preLearningCheck: {
        question: 'An application reads a database password from a config file that is rarely changed. Security wants the credential stored securely and rotated automatically every 30 days without code changes. Which service is purpose-built for this?',
        options: [
          'Store it in an environment variable',
          'AWS Secrets Manager, which stores the secret and rotates it automatically via a Lambda rotation function',
          'Hard-code it but encrypt the file',
          'AWS Certificate Manager',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Secrets Manager stores secrets encrypted with KMS and natively rotates them on a schedule using a managed/Lambda rotation function — with built-in integration for RDS, Redshift, and DocumentDB so the password changes in both the secret and the database.',
      },
      sections: [
        {
          heading: 'Secrets Manager vs Parameter Store',
          body: 'Both store configuration securely with KMS encryption and IAM access control, but the exam draws a line:\n\nAWS Secrets Manager is built for secrets that must rotate. It supports automatic rotation via a Lambda function, with native integrations for Amazon RDS, Aurora, Redshift, and DocumentDB so a rotation updates both the stored secret and the database credential. It supports cross-account access via resource policies and fine-grained retrieval permissions. It carries a per-secret cost.\n\nAWS Systems Manager Parameter Store stores configuration data and secrets (SecureString parameters encrypted with KMS) for free at the standard tier, integrates everywhere, but does not rotate secrets natively. Use it for config values and simple secrets where automatic rotation isn’t required; use Secrets Manager when scheduled rotation and database integration matter.',
          bullets: [
            'Need automatic rotation and DB credential integration → Secrets Manager.',
            'Plain config values / simple secrets, cost-sensitive, no rotation → Parameter Store SecureString.',
            'Both encrypt with KMS and authorize access with IAM; only Secrets Manager rotates natively.',
          ],
          callout: { type: 'note', text: 'The fastest tell: if the requirement says "rotate automatically" (especially for an RDS/Aurora/Redshift password), it is Secrets Manager. If it is just "store a parameter securely," Parameter Store SecureString is the cheaper fit.' },
        },
        {
          heading: 'KMS key material — generated, imported, external, multi-Region',
          body: 'KMS keys differ by where the key material comes from and lives:\n\nAWS-generated material (the default) — KMS creates and stores the key material; supports automatic annual rotation. Imported key material (BYOK) — you generate key material elsewhere and import it; you are responsible for its source and re-import, and automatic rotation is not available for imported material. External key store (XKS) — the key material stays in a key manager you operate outside AWS, and KMS calls out to it for cryptographic operations, for organizations that must keep key material entirely off AWS. Custom key store (CloudHSM-backed) — KMS keys whose material lives in a CloudHSM cluster you control. Multi-Region keys — a primary key replicated to other Regions with the same key ID and material, so you can encrypt in one Region and decrypt in another (useful for cross-Region DR and global tables).',
          bullets: [
            'Imported key material (BYOK): you own the source; no automatic rotation; you must re-import before expiry.',
            'External key store (XKS): key material never resides in AWS — it stays in your external key manager.',
            'Multi-Region keys: same key material across Regions for cross-Region encrypt/decrypt and DR.',
          ],
          callout: { type: 'tip', text: '"Encrypt data in one Region and decrypt it in another with the same key" → KMS multi-Region keys. "Key material must never live in AWS" → external key store (XKS). "We must supply our own key material" → import key material (BYOK).' },
        },
        {
          heading: 'Masking sensitive data in logs and messages',
          body: 'Secrets often leak through telemetry, not databases. CloudWatch Logs data protection policies automatically detect and mask sensitive data (credentials, PII, financial identifiers) in log events using managed and custom data identifiers, so the raw values are redacted from anyone without an unmask permission. Amazon SNS message data protection applies similar data protection policies to message payloads to detect, redact, or block sensitive data flowing through topics. For S3 and broader stores, Amazon Macie discovers sensitive data so you can remediate. The exam point: prevent secrets and PII from being exposed in operational data, not just in primary storage.',
          bullets: [
            'CloudWatch Logs data protection policies mask sensitive values in log events; unmasking requires a specific permission.',
            'SNS message data protection detects/redacts/blocks sensitive data in messages.',
            'Macie finds sensitive data at rest in S3 for remediation.',
          ],
          callout: { type: 'warning', text: 'If a scenario worries that passwords or PII are being written into CloudWatch Logs, the targeted answer is a CloudWatch Logs data protection policy that masks them — not deleting the log group or turning off logging.' },
        },
        {
          heading: 'Private certificates and key lifecycle',
          body: 'Beyond passwords, the exam treats certificates and keys as managed material. AWS Private CA stands up a private certificate authority hierarchy to issue private TLS/mTLS certificates for internal services, containers, and IoT devices — with controlled issuance, revocation (CRL/OCSP), and audit. KMS key lifecycle matters too: enable automatic rotation for AWS-generated customer managed keys; disable or schedule deletion (with a mandatory waiting period, 7–30 days) when retiring a key; and use key policies plus grants to scope exactly who can use a key. Together these keep credential and key material short-lived, scoped, and revocable.',
          bullets: [
            'AWS Private CA issues and revokes private certificates for internal PKI (services, containers, IoT).',
            'KMS key deletion has a mandatory 7–30 day waiting period — disable first if unsure, since deletion is irreversible.',
            'Automatic rotation applies to AWS-generated customer managed keys, not to imported key material.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A team must store an Amazon RDS master password and rotate it automatically every 30 days so the change applies to both the secret and the database, with no application code changes. Which service fits best?',
          options: [
            'SSM Parameter Store SecureString',
            'AWS Secrets Manager with rotation enabled',
            'A KMS-encrypted file in S3',
            'AWS Certificate Manager',
          ],
          correct: 1,
          explainCorrect: 'Correct — Secrets Manager rotates secrets on a schedule with native RDS integration, updating both the secret and the database credential. Parameter Store does not rotate natively.',
          elaborativePrompt: 'Why is Secrets Manager preferred over Parameter Store when automatic rotation is required?',
        },
        {
          afterSection: 1,
          question: 'A company must encrypt data in us-east-1 and decrypt the same data in eu-west-1 using identical key material, without re-encrypting. Which KMS capability enables this?',
          options: [
            'Imported key material (BYOK)',
            'KMS multi-Region keys',
            'A separate independent key per Region',
            'An external key store (XKS)',
          ],
          correct: 1,
          explainCorrect: 'Correct — multi-Region keys replicate the same key ID and material across Regions, so ciphertext from one Region decrypts in another. Independent per-Region keys cannot decrypt each other’s ciphertext.',
          elaborativePrompt: 'Why can’t two independent single-Region keys decrypt each other’s data?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must store and auto-rotate database credentials, keep certain key material entirely outside AWS, encrypt-and-decrypt data across two Regions, and stop passwords from leaking into CloudWatch Logs. Walk through which AWS service and key option solves each requirement.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security team discovers that an application intermittently logs database connection strings — including passwords — into Amazon CloudWatch Logs. They must prevent the credentials from being readable by operators viewing the logs, while keeping logging fully enabled. What should they implement?',
        options: [
          'Delete the affected log groups and stop logging the application',
          'Apply a CloudWatch Logs data protection policy that detects and masks the sensitive data, restricting unmasking to authorized principals',
          'Move the logs to S3 and encrypt the bucket with SSE-KMS',
          'Lower the log retention period to one day',
        ],
        correct: 1,
        explanation: {
          summary: 'A CloudWatch Logs data protection policy uses managed and custom data identifiers to detect and mask sensitive values like credentials in log events, so operators see redacted data while logging continues; unmasking requires a specific permission.',
          perOption: [
            'Disabling logging destroys needed operational visibility and is an overreaction to a masking problem.',
            'Correct — a data protection policy masks the credentials in place and limits who can unmask them, keeping logs intact.',
            'At-rest encryption does not prevent an operator with log read access from seeing the plaintext credentials.',
            'Shorter retention does not stop the credentials from being readable while the logs exist.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 6 — SECURITY FOUNDATIONS AND GOVERNANCE (14%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd6-s14',
      number: 14,
      module: 'Domain 6 · Security Foundations and Governance',
      domain: 'd6',
      weight: '14%',
      task: 'Task 6.1',
      title: 'Multi-Account Governance — Organizations, Control Tower, SCPs/RCPs, and Root Protection',
      duration: 30,
      summary: 'Security at scale is an organization problem. This session builds the multi-account governance model the exam expects: AWS Organizations as the structure, Control Tower as the guardrailed landing zone, SCPs and RCPs as the org-wide ceilings, delegated administration for security services, and disciplined protection of the root user.',
      objectives: [
        'Structure accounts with AWS Organizations and OUs, and stand up a governed landing zone with AWS Control Tower',
        'Apply organization policies — SCPs, RCPs, and AI services opt-out / declarative policies — as guardrails',
        'Delegate administration of security services to a dedicated security account',
        'Protect and centralize the root user, and design break-glass access',
      ],
      preLearningCheck: {
        question: 'A company wants to guarantee that no account in a specific OU can ever disable AWS CloudTrail or leave the organization, regardless of that account’s own IAM policies. What enforces this org-wide?',
        options: [
          'An IAM policy attached to every user',
          'A Service Control Policy (SCP) attached to the OU that denies those actions',
          'A permission boundary on each role',
          'A resource-based policy on CloudTrail',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: SCPs set the maximum permissions for accounts/OUs in an organization. A Deny SCP on the OU removes those actions from every principal in those accounts — no local IAM policy can grant them back.',
      },
      sections: [
        {
          heading: 'Organizations and OUs',
          body: 'AWS Organizations is the foundation: it groups accounts under a management account, arranges them into organizational units (OUs), and enables centralized billing and governance. The recommended structure separates concerns — a dedicated security/audit account, a log archive account, shared services, and workload accounts grouped into OUs by environment or business unit. The management account should hold almost no workloads; it is used for org administration only. This account separation is itself a security control: it bounds blast radius and lets you apply different guardrails per OU.',
          bullets: [
            'Group accounts into OUs (e.g. Security, Infrastructure, Workloads/Prod, Workloads/Dev) to apply tailored guardrails.',
            'Keep the management account minimal — no workloads — to reduce its blast radius.',
            'Dedicated security and log archive accounts isolate findings and evidence from workloads.',
          ],
          callout: { type: 'note', text: 'Account separation is a primary AWS security boundary. "Limit blast radius / isolate environments" at the org level points to separate accounts and OUs, not just IAM within one account.' },
        },
        {
          heading: 'Control Tower — the governed landing zone',
          body: 'AWS Control Tower automates setup of a secure, multi-account landing zone on top of Organizations: it provisions the management, log archive, and audit accounts, sets up centralized logging and an account factory for standardized account vending, and applies controls (guardrails). Controls come in types: preventive (implemented as SCPs — block disallowed actions), detective (implemented as Config rules — flag non-compliance), and proactive (block non-compliant resources before deployment via CloudFormation hooks). Controls also have a guidance level — mandatory (always on), strongly recommended, and elective. Control Tower is the fast path to a best-practice org; you can still add custom SCPs and Config rules beyond its built-in controls.',
          bullets: [
            'Control Tower = automated landing zone + account factory + built-in controls (guardrails).',
            'Preventive control → SCP; detective control → Config rule; proactive control → CloudFormation hook.',
            'Add custom/optional controls beyond the mandatory ones for your specific requirements.',
          ],
          callout: { type: 'tip', text: 'When a question wants a "standardized, guardrailed multi-account environment with centralized logging, set up quickly," that is AWS Control Tower — not building Organizations + Config + SCPs by hand.' },
        },
        {
          heading: 'Organization policies — SCPs, RCPs, and more',
          body: 'Organizations supports several policy types that act as guardrails, never grants:\n\nService Control Policies (SCPs) set the maximum permissions for principals in the attached accounts/OUs — a Deny SCP blocks actions org-wide regardless of local IAM. Resource Control Policies (RCPs) are the resource-side counterpart: they set the maximum access that can be granted on resources (e.g. S3 buckets, SQS) in the org, even to external principals — powerful for enforcing "only our org can access these resources." AI services opt-out policies control whether AWS may use your content for AI service improvement. Declarative policies enforce a desired configuration for a service (e.g. block public AMIs) that persists even as the service evolves. Backup policies centrally manage AWS Backup plans. All of these attach at the root, OU, or account level and inherit down.',
          bullets: [
            'SCP = ceiling on what principals can do; RCP = ceiling on what access resources can grant (incl. to external principals).',
            'SCPs and RCPs never grant permissions — they only restrict the maximum.',
            'Declarative policies enforce service configuration baselines; AI opt-out policies govern data use for AI improvement.',
          ],
          callout: { type: 'warning', text: 'SCPs limit principals; RCPs limit resource access. To stop a resource from being shared with anyone outside the organization regardless of its resource policy, the newer control is an RCP — an SCP alone governs principals, not resource-policy grants.' },
        },
        {
          heading: 'Delegated administration and root protection',
          body: 'Two governance essentials. Delegated administration lets you run security services (GuardDuty, Security Hub, Macie, IAM Access Analyzer, Detective, Firewall Manager, etc.) from a dedicated security account rather than the management account — least privilege at the org level. Root user protection: the management and member account root users are the most powerful identities, so enable hardware MFA on them, remove or lock away their access keys, and use the root only for the few tasks that require it. AWS now supports centralized root access management in Organizations — removing standing root credentials from member accounts and performing privileged root tasks centrally — plus break-glass procedures for emergency access that are tightly logged and alarmed.',
          bullets: [
            'Delegate security-service administration to a dedicated security account — keep the management account out of daily ops.',
            'Root user: hardware MFA, no access keys, used only when strictly required.',
            'Centralized root access management removes standing root credentials from member accounts; break-glass is logged and alarmed.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company wants a standardized multi-account environment quickly, with centralized logging, an audit account, automated account provisioning, and built-in preventive and detective guardrails. Which service delivers this fastest?',
          options: [
            'AWS Organizations alone',
            'AWS Control Tower',
            'AWS Config in each account',
            'AWS IAM Identity Center',
          ],
          correct: 1,
          explainCorrect: 'Correct — Control Tower automates the landing zone (management, log archive, audit accounts), an account factory, and preventive (SCP) and detective (Config) guardrails. Organizations alone is the substrate but requires manual assembly of the rest.',
          elaborativePrompt: 'What does Control Tower add on top of plain AWS Organizations?',
        },
        {
          afterSection: 2,
          question: 'Security must guarantee that no S3 bucket anywhere in the organization can grant access to a principal outside the organization, even if a bucket owner writes a permissive bucket policy. Which control fits best?',
          options: [
            'An SCP denying s3:PutBucketPolicy',
            'A Resource Control Policy (RCP) that restricts resource access to organization principals',
            'A permission boundary on bucket owners',
            'Enabling S3 Block Public Access only',
          ],
          correct: 1,
          explainCorrect: 'Correct — RCPs set the maximum access resources can grant, including blocking access to external principals org-wide, regardless of individual resource policies. SCPs govern principals, not resource-policy grants.',
          elaborativePrompt: 'Why is an RCP, not an SCP, the right tool for constraining resource-policy grants?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you are standing up governance for a 100-account organization. Walk through how you structure accounts and OUs, how you stand up the landing zone, which guardrails you use to cap principals versus resource access, how you run security services without the management account, and how you protect the root user.',
      sample: {
        type: 'multiple-choice',
        stem: 'An organization must ensure that member accounts in the Production OU can never disable AWS Config or delete the organization CloudTrail, regardless of any IAM permissions an administrator in those accounts might grant. What is the correct mechanism?',
        options: [
          'Attach an IAM deny policy to every role in those accounts',
          'Attach a Service Control Policy to the Production OU that explicitly denies config:Delete*/StopConfigurationRecorder and cloudtrail:Delete*/StopLogging',
          'Use a permission boundary on each account’s administrators',
          'Enable MFA on the root user of each account',
        ],
        correct: 1,
        explanation: {
          summary: 'An SCP attached to the OU sets the maximum permissions for every principal in those accounts. A Deny for the Config and CloudTrail disabling actions cannot be overridden by any local IAM policy, guaranteeing the controls stay on.',
          perOption: [
            'Per-role IAM deny policies are unenforceable at scale — a local admin can change or omit them; they are not an org-wide guarantee.',
            'Correct — an SCP Deny on the OU removes those actions from every principal regardless of local IAM, which is exactly the guarantee required.',
            'Permission boundaries cap a principal’s permissions but are set within the account and can be altered locally; they are not an org-level guarantee.',
            'Root MFA protects the root credential but does not prevent other administrators from disabling Config or CloudTrail.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd6-s15',
      number: 15,
      module: 'Domain 6 · Security Foundations and Governance',
      domain: 'd6',
      weight: '14%',
      task: 'Task 6.2',
      title: 'Secure & Consistent Deployment — IaC Guardrails, Firewall Manager, and Resource Sharing',
      duration: 30,
      summary: 'Consistency is a security property: drift and snowflake configurations are how gaps appear. This session covers securing infrastructure-as-code with CloudFormation StackSets, Guard, and linting; enforcing security policies centrally with AWS Firewall Manager; tagging for governance; and sharing resources safely with Service Catalog and AWS RAM.',
      objectives: [
        'Deploy consistently across accounts with CloudFormation StackSets and validate templates with cfn-lint and CloudFormation Guard',
        'Use tags to group, attribute, and enforce policy on resources',
        'Centrally enforce WAF, Shield, security group, and firewall policies with AWS Firewall Manager',
        'Share resources securely with AWS Service Catalog and AWS Resource Access Manager (RAM)',
      ],
      preLearningCheck: {
        question: 'A security team must guarantee that every account in the organization always has the same AWS WAF rules and security-group baseline applied — including on new accounts and newly created resources — managed from one place. Which service is built for this?',
        options: [
          'AWS Config in each account',
          'AWS Firewall Manager',
          'A CloudFormation template run manually per account',
          'Amazon Inspector',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: AWS Firewall Manager centrally configures and enforces WAF rules, Shield Advanced, security group baselines, Network Firewall, and DNS Firewall policies across all accounts in an organization — automatically applying to existing and future accounts and resources.',
      },
      sections: [
        {
          heading: 'Secure infrastructure as code',
          body: 'Repeatable, reviewed infrastructure is more secure than hand-built infrastructure. The exam’s IaC security toolkit:\n\nCloudFormation StackSets deploy and update the same stack across many accounts and Regions from the management or a delegated admin account — and with service-managed permissions, they auto-deploy to new accounts as they join. This is how you roll a security baseline everywhere consistently.\n\nCloudFormation Guard (cfn-guard) is a policy-as-code tool: you write rules (e.g. "every S3 bucket must have encryption enabled") and validate templates against them in the pipeline, blocking non-compliant infrastructure before deployment. cfn-lint catches template errors and best-practice violations early. CloudFormation hooks (proactive controls) can also reject non-compliant resources at deploy time.',
          bullets: [
            'StackSets = consistent multi-account/Region deployment, auto-enrolling new accounts (service-managed).',
            'CloudFormation Guard = policy-as-code that fails the pipeline on non-compliant templates.',
            'Shift security left: validate templates (Guard/lint/hooks) before resources are ever created.',
          ],
          callout: { type: 'note', text: '"Deploy the same baseline stack to every account including future ones" → CloudFormation StackSets (service-managed). "Enforce policy rules on templates in the pipeline" → CloudFormation Guard.' },
        },
        {
          heading: 'Tags as a governance tool',
          body: 'Tags are not just for billing — they drive security policy. Consistent tags (Owner, Environment, DataClassification, Project, CostCenter) let you group resources, attribute ownership during an incident, and write tag-based controls. ABAC policies grant access based on matching tags; tag policies (an Organizations policy type) enforce a standardized tag taxonomy across the org; and SCPs can require a tag on resource creation. Config rules can flag untagged or mis-tagged resources. The exam point: a disciplined tagging strategy is what makes attribute-based access control, cost attribution, and automated governance possible.',
          bullets: [
            'Tag policies (Organizations) enforce a consistent tag taxonomy across accounts.',
            'ABAC and SCP conditions can require/match tags to grant or restrict access.',
            'Config rules detect non-compliant or missing tags for remediation.',
          ],
        },
        {
          heading: 'Central enforcement with Firewall Manager',
          body: 'AWS Firewall Manager is the organization-wide policy enforcer for network and edge protections. From a delegated admin account it centrally configures and continuously enforces: AWS WAF web ACLs and rule groups, AWS Shield Advanced protections, security group baselines and audits, AWS Network Firewall policies, and Route 53 Resolver DNS Firewall rules — across all accounts, automatically applying to existing and newly created resources. It both deploys the policy and remediates drift, so a developer who removes a required WAF rule has it reapplied. Firewall Manager requires AWS Organizations and AWS Config.',
          bullets: [
            'Firewall Manager centrally enforces WAF, Shield Advanced, SG baselines, Network Firewall, and DNS Firewall org-wide.',
            'It auto-applies to new accounts/resources and remediates drift from the required policy.',
            'Prerequisites: AWS Organizations (all features) and AWS Config enabled.',
          ],
          callout: { type: 'tip', text: 'Single-account, one-off rules → configure WAF/Shield directly. "Enforce the same protections across the whole organization, including future accounts, and auto-remediate drift" → AWS Firewall Manager.' },
        },
        {
          heading: 'Sharing resources securely',
          body: 'Two services govern controlled sharing. AWS Service Catalog lets a central team publish approved, versioned products (CloudFormation templates) that other teams launch through a self-service portal — with launch constraints so users provision standardized, compliant resources without holding the underlying broad permissions. AWS Resource Access Manager (RAM) shares specific resources (subnets, Transit Gateways, License Manager configs, Route 53 Resolver rules, etc.) across accounts in the organization without duplicating them or resorting to permissive policies. The exam contrast: Service Catalog = governed self-service provisioning of approved stacks; RAM = sharing actual existing resources across accounts.',
          bullets: [
            'Service Catalog = approved, governed products provisioned via self-service with launch constraints (least privilege for users).',
            'AWS RAM = share specific existing resources (e.g. subnets, TGW) across accounts without broad policies.',
            'Both reduce the need to grant broad permissions to enable cross-team/cross-account work.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security team wants to block any CloudFormation deployment whose template defines an S3 bucket without encryption, catching it in the CI pipeline before resources are created. Which tool fits?',
          options: [
            'AWS Config managed rules',
            'CloudFormation Guard (policy-as-code validation in the pipeline)',
            'Amazon Inspector',
            'AWS Trusted Advisor',
          ],
          correct: 1,
          explainCorrect: 'Correct — CloudFormation Guard evaluates templates against policy-as-code rules in the pipeline and fails the build on violations, preventing non-compliant infrastructure from ever deploying. Config evaluates resources after they exist.',
          elaborativePrompt: 'How does pipeline-time validation (Guard) differ from post-deployment detection (Config)?',
        },
        {
          afterSection: 2,
          question: 'An organization must guarantee a standard set of AWS WAF rules is applied to every Application Load Balancer in every account, including future accounts, with drift automatically corrected. Which service should they use?',
          options: [
            'Configure AWS WAF separately in each account',
            'AWS Firewall Manager',
            'AWS Config conformance packs only',
            'AWS Shield Standard',
          ],
          correct: 1,
          explainCorrect: 'Correct — Firewall Manager centrally enforces WAF (and other) policies org-wide, auto-applies to new accounts/resources, and remediates drift. Per-account WAF configuration cannot guarantee consistency at scale.',
          elaborativePrompt: 'Why does Firewall Manager scale better than configuring WAF in each account individually?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must roll a security baseline to every account and keep it consistent, prevent non-compliant infrastructure from deploying, enforce WAF and security-group policy org-wide, and let teams provision approved stacks and share subnets without broad permissions. Walk through which service handles each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A platform team must let dozens of application teams self-provision a standardized, compliant three-tier stack, without granting those teams the broad IAM permissions the stack’s resources normally require, and while keeping the template versioned and approved. Which service best meets this?',
        options: [
          'Give each team AdministratorAccess and a copy of the template',
          'Publish the stack as an AWS Service Catalog product with a launch constraint, so teams provision it via self-service without the underlying permissions',
          'Share the resources with AWS RAM',
          'Email the CloudFormation template to each team to deploy manually',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS Service Catalog publishes approved, versioned products that teams launch through self-service; a launch constraint runs the provisioning with a role that has the needed permissions, so users provision compliant stacks without holding broad permissions themselves.',
          perOption: [
            'Granting AdministratorAccess violates least privilege and removes all governance.',
            'Correct — Service Catalog products plus a launch constraint deliver governed, least-privilege self-service of approved stacks.',
            'RAM shares existing resources across accounts; it does not provide governed self-service provisioning of a templated stack.',
            'Emailing templates for manual deployment provides no governance, versioning control, or permission isolation.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd6-s16',
      number: 16,
      module: 'Domain 6 · Security Foundations and Governance',
      domain: 'd6',
      weight: '14%',
      task: 'Task 6.3',
      title: 'Evaluating Compliance — Config, Security Hub, Audit Manager, and Artifact',
      duration: 30,
      summary: 'The final session closes the loop: proving and maintaining compliance. It covers AWS Config rules for detecting and automatically remediating non-compliance, Security Hub standards for posture scoring, Audit Manager for collecting evidence against frameworks, Artifact for AWS’s own compliance reports, and the Well-Architected Tool for self-assessment.',
      objectives: [
        'Detect and automatically remediate non-compliant resources with AWS Config rules and SSM Automation',
        'Score and track security posture against standards with AWS Security Hub',
        'Collect audit evidence against compliance frameworks with AWS Audit Manager',
        'Obtain AWS compliance reports with AWS Artifact and self-assess with the Well-Architected Tool',
      ],
      preLearningCheck: {
        question: 'A company must continuously detect S3 buckets that become publicly accessible and automatically remediate them, with an audit trail of every change. Which combination is purpose-built for this?',
        options: [
          'Amazon Inspector with a weekly scan',
          'An AWS Config rule that detects public buckets, with an SSM Automation remediation action',
          'A manual monthly review',
          'Amazon Macie',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: AWS Config evaluates resources against rules (e.g. s3-bucket-public-read-prohibited) and can trigger an automatic remediation (an SSM Automation document) when a resource drifts out of compliance, recording the whole timeline.',
      },
      sections: [
        {
          heading: 'Detect and remediate with AWS Config',
          body: 'AWS Config is the compliance workhorse. It records the configuration of resources over time and evaluates them against Config rules — AWS-managed (e.g. encrypted-volumes, s3-bucket-public-read-prohibited, restricted-ssh) or custom (Lambda/Guard-backed). When a resource is non-compliant, Config can trigger an automatic remediation action — typically an SSM Automation document — to fix it (e.g. remove public access, enable encryption). Conformance packs bundle many rules and remediations into one deployable unit you can roll out org-wide. Config also gives you a full configuration timeline and relationships, answering "what changed, when, and was it compliant" for audits.',
          bullets: [
            'Config rule detects drift; an SSM Automation remediation fixes it automatically.',
            'Conformance packs deploy a whole compliance baseline (rules + remediations) across the org.',
            'Config’s configuration timeline answers "what was the state of this resource at this time" for auditors.',
          ],
          callout: { type: 'note', text: 'The canonical "detect and auto-fix" pattern is a Config rule + an SSM Automation remediation. "Who made the change" is CloudTrail; "is it compliant and fix it" is Config.' },
        },
        {
          heading: 'Posture scoring with Security Hub',
          body: 'AWS Security Hub aggregates findings (from GuardDuty, Inspector, Macie, Config, partners) and runs security standards — AWS Foundational Security Best Practices, CIS AWS Foundations Benchmark, PCI DSS, NIST — producing a compliance score and a prioritized list of failed controls across all accounts and Regions. Many of its controls are powered by Config rules under the hood. Security Hub supports automated response and remediation (sending findings to EventBridge for SSM/Lambda actions) and cross-Region aggregation. The exam framing: Security Hub is the single pane for "how compliant and secure is our posture, scored against a recognized standard, across the whole org."',
          bullets: [
            'Security Hub standards (FSBP, CIS, PCI, NIST) produce a posture score and failed-control list across accounts.',
            'Findings can route through EventBridge to SSM/Lambda for automated remediation.',
            'Cross-Region and cross-account aggregation gives one org-wide compliance view.',
          ],
          callout: { type: 'tip', text: '"One prioritized, scored view of security posture against a recognized standard across all accounts" → Security Hub. "Evaluate and remediate a specific resource-configuration rule" → AWS Config.' },
        },
        {
          heading: 'Evidence collection with Audit Manager',
          body: 'AWS Audit Manager automates the collection of audit evidence and maps it to the controls of compliance frameworks (SOC 2, PCI DSS, GDPR, HITRUST, CIS, and custom frameworks). It continuously gathers evidence from CloudTrail, Config, Security Hub, and AWS API calls, organizes it into assessment reports, and tracks control status — turning what used to be a manual evidence-gathering scramble into an ongoing, framework-aligned process. The distinction the exam tests: Config and Security Hub assess the technical state; Audit Manager packages the evidence of that state into auditor-ready assessments against a named framework.',
          bullets: [
            'Audit Manager maps automatically-collected evidence to framework controls (SOC 2, PCI, GDPR, custom).',
            'It produces auditor-ready assessment reports, reducing manual evidence collection.',
            'Use it when the requirement is "prepare evidence for an audit against framework X," not "detect a misconfiguration."',
          ],
          callout: { type: 'warning', text: 'Audit Manager collects and organizes evidence for an audit; it does not detect or fix misconfigurations. If the requirement is remediation, that is Config; if it is "produce evidence for SOC 2," that is Audit Manager.' },
        },
        {
          heading: 'AWS Artifact and the Well-Architected Tool',
          body: 'Two final pieces. AWS Artifact is the self-service portal for AWS’s own compliance documentation — SOC reports, ISO certifications, PCI attestations, and the like — used to demonstrate AWS’s side of the shared responsibility model to your auditors. It also hosts certain agreements (e.g. BAA). The AWS Well-Architected Tool lets you review workloads against the framework’s pillars (including the Security pillar), surfacing risks and improvement recommendations as a structured self-assessment. The shared responsibility model underlies all of this: AWS is responsible for security of the cloud (Artifact evidences this); you are responsible for security in the cloud (Config, Security Hub, Audit Manager, and the Well-Architected review evidence that).',
          bullets: [
            'AWS Artifact = download AWS’s compliance reports (SOC, ISO, PCI) and agreements — AWS’s side of shared responsibility.',
            'Well-Architected Tool = structured self-assessment of a workload against the framework pillars, including Security.',
            'Shared responsibility: Artifact covers "of the cloud"; your tools cover "in the cloud."',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A team needs unencrypted EBS volumes to be detected and automatically brought into compliance, with a recorded history of the change. Which approach fits best?',
          options: [
            'An Amazon Inspector vulnerability scan',
            'An AWS Config rule (encrypted-volumes) with an automatic SSM Automation remediation',
            'A CloudWatch alarm on volume metrics',
            'A manual quarterly review',
          ],
          correct: 1,
          explainCorrect: 'Correct — a Config rule detects the non-compliant volumes and an attached SSM Automation remediation fixes them, while Config records the configuration timeline. Inspector finds CVEs, not configuration compliance.',
          elaborativePrompt: 'How do the detection and the remediation pieces work together in AWS Config?',
        },
        {
          afterSection: 2,
          question: 'An auditor requests evidence that the company’s controls satisfy SOC 2, collected continuously and mapped to the SOC 2 control set. Which service is purpose-built for assembling this evidence?',
          options: [
            'AWS Config rules',
            'AWS Audit Manager',
            'AWS Security Hub',
            'AWS Artifact',
          ],
          correct: 1,
          explainCorrect: 'Correct — Audit Manager continuously collects evidence and maps it to a framework’s controls (like SOC 2), producing auditor-ready assessments. Artifact provides AWS’s own reports; Config/Security Hub assess technical state but don’t package framework evidence.',
          elaborativePrompt: 'How does Audit Manager’s job differ from what AWS Artifact provides?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must continuously detect and auto-fix misconfigurations, score your posture against a recognized standard across all accounts, assemble evidence for a SOC 2 audit, and obtain AWS’s own ISO/SOC reports for the auditor. Walk through which service delivers each, and where the shared-responsibility line falls.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company must continuously evaluate its accounts against the CIS AWS Foundations Benchmark, see a prioritized compliance score across all accounts and Regions, and automatically remediate the most common failures. Which combination best meets this?',
        options: [
          'AWS Artifact to download CIS reports and a manual remediation checklist',
          'AWS Security Hub with the CIS standard enabled for scoring, backed by AWS Config rules, with failed findings routed through EventBridge to SSM Automation for remediation',
          'Amazon Inspector scanning instances weekly',
          'AWS Audit Manager assessments reviewed quarterly',
        ],
        correct: 1,
        explanation: {
          summary: 'Security Hub runs the CIS standard to produce a cross-account, cross-Region posture score and prioritized failed controls (many backed by Config rules), and routing findings through EventBridge to SSM Automation delivers automatic remediation — covering all three requirements.',
          perOption: [
            'Artifact provides AWS’s own compliance documents, not a continuous evaluation of your accounts; manual remediation does not scale.',
            'Correct — Security Hub (CIS standard) + Config rules score posture across the org, and EventBridge→SSM Automation auto-remediates failures.',
            'Inspector finds software CVEs and reachability, not CIS configuration-benchmark compliance scoring.',
            'Audit Manager assembles audit evidence but does not provide continuous posture scoring or automatic remediation.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

  ],
}

export default scsC03Course
