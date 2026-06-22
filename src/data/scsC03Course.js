// AWS Certified Security – Specialty (SCS-C03) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors deaC01Course.js / dopC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 5 — Domain 1 (Detection, s1–s3) + Domain 2 (Incident Response, s4–s5) authored.
// D3–D6 land in Steps 2–3.

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

  ],
}

export default scsC03Course
