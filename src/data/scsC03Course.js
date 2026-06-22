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

  ],
}

export default scsC03Course
