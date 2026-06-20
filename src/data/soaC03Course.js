// AWS Certified CloudOps Engineer – Associate (SOA-C03) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors saaC03Course.js / clfC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 4 — Domain 1 (Monitoring) + Domain 2 (Reliability) authored. D3–D5 land in Step 2.

const soaC03Course = {
  slug: 'soa-c03',
  title: 'AWS Certified CloudOps Engineer – Associate — Full Prep Course',
  code: 'SOA-C03',
  subtitle: 'Sixteen ~30-minute sessions covering all five domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 130 minutes, pass at 720/1000 (~72%). Compensatory scoring — no per-domain minimum. SOA-C03 has no hands-on exam labs.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Monitoring, Logging & Performance', weight: '22%' },
    { id: 'd2', label: 'Domain 2 · Reliability & Business Continuity', weight: '22%' },
    { id: 'd3', label: 'Domain 3 · Deployment, Provisioning & Automation', weight: '22%' },
    { id: 'd4', label: 'Domain 4 · Security & Compliance', weight: '16%' },
    { id: 'd5', label: 'Domain 5 · Networking & Content Delivery', weight: '18%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — MONITORING, LOGGING, ANALYSIS, REMEDIATION & PERFORMANCE (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Monitoring, Logging & Performance',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.1',
      title: 'CloudWatch Core — Metrics, Alarms, Dashboards, and the Agent',
      duration: 30,
      summary: 'Start here. You cannot operate, scale, or remediate what you cannot see — so observability is the foundation of the whole exam. This session builds the CloudWatch mental model: what a metric is, where it comes from, why some metrics need the agent, and how alarms turn a number crossing a line into an action.',
      objectives: [
        'Explain the CloudWatch data model — namespaces, metrics, dimensions, statistics, and periods',
        'Know which metrics AWS publishes for free and which require the CloudWatch agent (memory, disk, in-guest)',
        'Configure metric alarms, including thresholds, evaluation periods, and missing-data treatment',
        'Use composite alarms and CloudWatch dashboards to monitor across resources, accounts, and Regions',
      ],
      preLearningCheck: {
        question: 'A CloudOps engineer needs to alarm on the memory utilization of an EC2 Linux instance, but the metric never appears in CloudWatch. What is the most likely reason?',
        options: [
          'Memory metrics are only available for Windows instances',
          'Memory is an in-guest metric that the hypervisor cannot see — the CloudWatch agent must be installed to publish it',
          'The instance must be rebooted before CloudWatch starts collecting memory metrics',
          'Memory utilization is only visible in the EC2 console, never in CloudWatch',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: the hypervisor sees CPU, network, and disk I/O at the host level, but it cannot see inside the guest OS for memory or disk-used. That gap is what the agent fills.',
      },
      sections: [
        {
          heading: 'The CloudWatch data model',
          body: 'Every CloudWatch question rests on one model. A metric is a time-ordered series of data points living in a namespace (like AWS/EC2). Dimensions are name/value pairs that identify exactly which resource a metric belongs to (InstanceId=i-123). When you view or alarm on a metric you also choose a statistic (Average, Sum, Maximum, p99) and a period (the window each data point covers, e.g. 60 seconds).\n\nGet fluent at reading a metric as "namespace → metric name → dimensions → statistic over a period." Most monitoring questions are really asking whether you picked the right statistic (Average hides spikes that Maximum reveals) or the right period.',
          callout: { type: 'note', text: 'Standard resolution is 1-minute granularity; high-resolution custom metrics go down to 1 second. Detailed monitoring on EC2 gives 1-minute metrics instead of the default 5-minute — a common exam detail.' },
        },
        {
          heading: 'Where metrics come from — and the agent gap',
          body: 'AWS services publish metrics automatically, but only what the platform can observe from outside the workload. For EC2 that means CPU utilization, network in/out, and disk read/write at the host level. It does NOT include memory utilization or disk space used, because those live inside the guest operating system the hypervisor cannot inspect.',
          bullets: [
            'Default EC2 metrics (no agent): CPUUtilization, NetworkIn/Out, DiskReadOps/WriteOps, StatusCheck metrics.',
            'Requires the CloudWatch agent: memory used, disk space used, swap, and any custom application metric — plus log collection.',
            'The unified CloudWatch agent collects both metrics and logs from EC2, on-premises servers, and containers (ECS/EKS).',
            'StatusCheckFailed_System (AWS infrastructure) vs StatusCheckFailed_Instance (the guest) — pair a system-check alarm with an EC2 recovery action.',
          ],
          callout: { type: 'tip', text: 'Exam reflex: "memory", "disk space used", or "custom application metric" not showing up → install/configure the CloudWatch agent. Default EC2 metrics never include in-guest memory.' },
        },
        {
          heading: 'Alarms — turning a number into an action',
          body: 'A metric alarm watches a single metric (or a metric math expression) and moves between three states: OK, ALARM, and INSUFFICIENT_DATA. You define the threshold, the number of evaluation periods, and how many of those periods must breach (the "M out of N" datapoints-to-alarm). Tuning these is how you avoid false alarms on a brief spike.',
          bullets: [
            'An alarm action can notify an SNS topic, trigger an Auto Scaling policy, or invoke an EC2 action (stop/terminate/reboot/recover).',
            'Missing-data treatment matters: treat missing data as notBreaching, breaching, ignore, or missing — a frequent troubleshooting question when an alarm never fires.',
            'Composite alarms combine several alarms with AND/OR logic so you alert on a real condition, not every component — and reduce alarm noise.',
            'Metric math (and anomaly detection bands) lets one alarm watch a derived value, e.g. error rate = errors / requests.',
          ],
          interactive: 'alarm-routing',
        },
        {
          heading: 'Dashboards and cross-account, cross-Region visibility',
          body: 'CloudWatch dashboards are customizable, shareable views of metrics and alarms. The exam emphasizes that dashboards (and alarms) can span multiple accounts and Regions, which is how a central operations team watches an entire organization from one pane of glass.',
          bullets: [
            'Cross-account observability lets a monitoring account view metrics, logs, and traces from many source accounts.',
            'A dashboard can display widgets from several Regions at once — useful for global workloads.',
            'Dashboards can be shared (even publicly or to specific users) without granting full console access.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'An application owner reports that a CPU spike caused timeouts at 14:32, but the CloudWatch graph using the Average statistic over 5 minutes looks flat. What change best reveals the spike?',
          options: [
            'Switch the statistic to Maximum and use a shorter (1-minute) period',
            'Delete and recreate the metric',
            'Switch the metric namespace from AWS/EC2 to AWS/Logs',
            'Increase the alarm threshold so the spike is ignored',
          ],
          correct: 0,
          explainCorrect: 'Correct — Average over 5 minutes smooths a short spike into the baseline. Maximum over a 1-minute period surfaces the peak that caused the timeouts.',
          elaborativePrompt: 'In your own words, why can the Average statistic hide a real problem that Maximum or a high percentile (p99) would expose? When might Average still be the right choice?',
        },
        {
          afterSection: 2,
          question: 'A team wants a single alert that fires only when BOTH the application is returning 5xx errors AND CPU is saturated — not when either happens alone. Which CloudWatch feature fits?',
          options: [
            'A metric filter on the load balancer logs',
            'A composite alarm combining the 5xx alarm and the CPU alarm with AND logic',
            'A high-resolution custom metric',
            'A separate SNS topic for each alarm',
          ],
          correct: 1,
          explainCorrect: 'Correct — a composite alarm with AND logic fires only when both child alarms are in ALARM, giving one meaningful, low-noise alert.',
          elaborativePrompt: 'How do composite alarms reduce alert fatigue compared with subscribing to many individual alarms? What is the risk of combining too many conditions into one?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: an EC2-hosted app is reportedly "running out of memory" and crashing, but you see no memory metric in CloudWatch. Walk through why the metric is absent, what you would install and configure to get it, and what alarm you would build to catch the problem before the next crash.',
      sample: {
        type: 'multiple-choice',
        stem: 'A CloudOps engineer must be alerted before an EC2 Linux instance exhausts its memory, but no memory metric is available in Amazon CloudWatch. Which solution meets the requirement with the LEAST custom development?',
        options: [
          'Write a cron job that parses free output and pushes a value to CloudWatch with a custom Lambda function on a schedule',
          'Install and configure the unified CloudWatch agent to publish the mem_used_percent metric, then create a CloudWatch alarm on it',
          'Enable EC2 detailed monitoring, which adds memory utilization at 1-minute granularity',
          'Create a CloudWatch dashboard and visually watch the memory graph during business hours',
        ],
        correct: 1,
        explanation: {
          summary: 'Memory is an in-guest metric the hypervisor cannot see. The unified CloudWatch agent is the purpose-built, low-effort way to publish it; an alarm on that metric provides the alert.',
          perOption: [
            'A custom cron-plus-Lambda pipeline works but is exactly the custom development the agent exists to avoid — more code, more to maintain.',
            'Correct — the CloudWatch agent publishes memory (and disk) metrics with configuration only, and a standard alarm handles the alert. Least custom development.',
            'Detailed monitoring only increases the frequency of the metrics AWS already collects (CPU, network, disk I/O); it does not add in-guest memory.',
            'Watching a dashboard is not an alert and does not cover off-hours — it fails the "be alerted before exhaustion" requirement.',
          ],
          link: 'Domain 1 · Task 1.1 — Implement metrics, alarms, and filters by using AWS monitoring and logging services',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Andrew Brown\'s full freeCodeCamp SysOps/CloudOps course (ExamPro). A comprehensive video companion that tracks the SOA exam blueprint — pairs with every session.' },
        { videoId: '__knpcBRLHg', title: 'Amazon CloudWatch Tutorial — Cloud Monitoring Tools', channel: 'edureka!', relevance: 'A focused walkthrough of CloudWatch metrics, alarms, and dashboards — the core of Task 1.1.' },
      ],
      keyTerms: [
        { term: 'Metric', def: 'A time-ordered set of data points in a namespace, identified by dimensions. The fundamental unit CloudWatch stores.' },
        { term: 'Dimension', def: 'A name/value pair (e.g. InstanceId=i-123) that uniquely identifies which resource a metric belongs to.' },
        { term: 'CloudWatch agent', def: 'Software installed on a server or container to publish in-guest metrics (memory, disk) and collect logs that the platform cannot see by default.' },
        { term: 'Composite alarm', def: 'An alarm whose state is derived from a logical (AND/OR) combination of other alarms, used to reduce noise and alert on real conditions.' },
        { term: 'Detailed monitoring', def: 'An EC2 option that delivers metrics at 1-minute instead of the default 5-minute granularity (for the metrics AWS already collects).' },
      ],
      awsServices: [
        { name: 'Amazon CloudWatch', purpose: 'Collects metrics, logs, and events; provides alarms, dashboards, and anomaly detection for AWS and on-premises resources.' },
        { name: 'CloudWatch agent', purpose: 'Publishes in-guest metrics (memory, disk used, swap) and ships logs from EC2, on-premises, ECS, and EKS.' },
        { name: 'Amazon SNS', purpose: 'Pub/sub notification service that alarms publish to in order to fan out alerts to email, SMS, or downstream automation.' },
      ],
      examTips: [
        'Memory and disk-space-used are in-guest metrics → require the CloudWatch agent. Default EC2 metrics never include them.',
        'Detailed monitoring = higher frequency (1-min), NOT new metric types. Do not confuse it with the agent.',
        'Average hides spikes; use Maximum or a percentile to surface short bursts. Pick the statistic the question\'s symptom demands.',
        'Composite alarms reduce noise by combining alarms with AND/OR. "Alert only when both X and Y" is the signal.',
        'StatusCheckFailed_System → pair with an EC2 recover action; StatusCheckFailed_Instance → usually an OS/guest fix or reboot.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Monitoring, Logging & Performance',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.2',
      title: 'Automated Remediation — Logs, EventBridge, and Systems Manager Runbooks',
      duration: 30,
      summary: 'Detecting a problem is half the job; fixing it without a human at 3 a.m. is the other half. This session covers turning logs into signals, routing events with EventBridge, and taking action with Systems Manager Automation runbooks and Lambda — the event-driven remediation chain the exam tests constantly.',
      objectives: [
        'Extract signals from logs with metric filters and query them with CloudWatch Logs Insights',
        'Route, filter, and enrich events with Amazon EventBridge and troubleshoot rules that do not match',
        'Choose the right action target: SSM Automation runbook vs Lambda vs an SNS notification',
        'Assemble the alarm → EventBridge → automation remediation pattern end to end',
      ],
      preLearningCheck: {
        question: 'A CloudWatch alarm detects that an EC2 instance has an unencrypted public security group rule. The team wants the rule automatically removed whenever this happens, with no custom code to maintain. Which target best fits?',
        options: [
          'Email the security team via SNS and let them fix it manually',
          'An AWS Systems Manager Automation runbook that performs the remediation action',
          'A CloudWatch dashboard widget',
          'A second CloudWatch alarm',
        ],
        correct: 1,
        note: 'Think about which service can actually take the corrective action as a packaged, low-code step. SSM Automation runbooks are built for exactly this — predefined or custom remediation workflows.',
      },
      sections: [
        {
          heading: 'From logs to signals — metric filters and Logs Insights',
          body: 'Logs are raw text until you turn them into something you can alarm on or analyze. CloudWatch gives you two complementary tools. A metric filter scans incoming log events for a pattern (e.g. the word "ERROR" or an HTTP 500) and increments a CloudWatch metric you can then alarm on. CloudWatch Logs Insights is an interactive query language for ad-hoc investigation across log groups after the fact.',
          bullets: [
            'Metric filter → real-time, turns a recurring log pattern into a metric + alarm (e.g. count of failed SSH logins).',
            'Logs Insights → on-demand querying and aggregation for troubleshooting ("show me the top 10 slowest requests in the last hour").',
            'Subscription filters can stream matching log events to Lambda, Kinesis, or OpenSearch for further processing.',
            'CloudTrail records API activity (who did what, when); use it as the audit trail behind a remediation trigger.',
          ],
          callout: { type: 'note', text: 'Metric filter vs Logs Insights is a classic disambiguation: need a continuous alarm on a pattern → metric filter. Need to investigate a past incident interactively → Logs Insights.' },
        },
        {
          heading: 'EventBridge — the event router',
          body: 'Amazon EventBridge receives events from AWS services, your own apps, and SaaS partners, and routes them to targets based on rules. A rule has an event pattern (which events to match) and one or more targets (where to send them). EventBridge can also transform or enrich the event before delivery and run on a schedule (replacing CloudWatch Events scheduled rules).',
          bullets: [
            'Event pattern matches on fields in the event JSON; if your rule never fires, the pattern almost always does not match the real event shape.',
            'Targets include Lambda, SSM Automation, Step Functions, SNS, SQS, and more — one event can fan out to several.',
            'Input transformers reshape the event so the target receives exactly the fields it needs.',
            'Scheduled rules (or EventBridge Scheduler) trigger automation on a cron/rate basis — e.g. nightly snapshot cleanup.',
          ],
          callout: { type: 'tip', text: 'Troubleshooting an EventBridge rule that "does nothing": (1) confirm the event actually occurs on the right bus, (2) check the event pattern matches the real event JSON, (3) confirm the target\'s resource policy/role allows EventBridge to invoke it.' },
        },
        {
          heading: 'Taking action — SSM Automation vs Lambda',
          body: 'When an event demands a fix, you choose an action primitive. AWS Systems Manager Automation runbooks are predefined or custom multi-step workflows for operational tasks (restart a service, patch an instance, remove a bad security-group rule, create an AMI). AWS provides many managed runbooks out of the box. Lambda is for arbitrary custom logic when no runbook fits.',
          table: {
            headers: ['Need', 'Reach for', 'Why'],
            rows: [
              ['A standard remediation (stop/patch/snapshot/restore)', 'SSM Automation runbook', 'Often a ready-made AWS-managed runbook; low/no code, auditable steps'],
              ['Custom business logic or glue code', 'AWS Lambda', 'Full programming flexibility for anything a runbook cannot express'],
              ['Just notify a human', 'Amazon SNS / AWS User Notifications', 'No action taken automatically — routes the alert to people'],
              ['Long, branching, multi-service workflow', 'AWS Step Functions', 'Orchestrates many steps with retries and state'],
            ],
          },
        },
        {
          heading: 'The remediation chain, assembled',
          body: 'Put the pieces together and you get the pattern the exam returns to again and again: a signal is detected, an event is routed, and an action is taken automatically.\n\nCloudWatch alarm (or a Config rule, or a GuardDuty finding) → EventBridge rule matches the event → target is an SSM Automation runbook or Lambda that remediates → optionally notify via SNS. Knowing which box does which job — detect, route, act, notify — lets you answer almost any automation scenario.',
          bullets: [
            'AWS Config can detect non-compliant resources and trigger SSM Automation remediation directly (auto-remediation).',
            'Auto Scaling can be the "action" when the remediation is simply adding/removing capacity.',
            'Keep the human in the loop with SNS or AWS User Notifications for visibility, even when the fix is automatic.',
          ],
          interactive: 'alarm-routing',
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security team must be alarmed the moment the number of "Failed password" entries in an SSH log exceeds 10 in five minutes. Which approach fits best?',
          options: [
            'Run a CloudWatch Logs Insights query manually every morning',
            'Create a metric filter that counts the pattern and a CloudWatch alarm on that metric',
            'Enable EC2 detailed monitoring',
            'Stream the logs to S3 and inspect them weekly',
          ],
          correct: 1,
          explainCorrect: 'Correct — a metric filter converts the recurring log pattern into a CloudWatch metric in real time, and an alarm on that metric provides the immediate alert.',
          elaborativePrompt: 'Why is a metric filter the right tool for a continuous alert, while Logs Insights is better for investigating an incident that already happened?',
        },
        {
          afterSection: 2,
          question: 'An EventBridge rule is supposed to invoke a Lambda function when an object is uploaded to S3, but the function never runs. Everything else looks configured. What should you check first?',
          options: [
            'Whether the event pattern matches the actual event shape, and that EventBridge has permission to invoke the function',
            'Whether the S3 bucket is encrypted',
            'Whether the Lambda function is written in Python',
            'Whether CloudTrail is disabled',
          ],
          correct: 0,
          explainCorrect: 'Correct — rules silently fail to fire when the event pattern does not match the real event JSON, or when the target lacks an invocation permission. Those are the two first checks.',
          elaborativePrompt: 'Describe the difference between "the event never reached the bus", "the pattern did not match", and "the target rejected the invoke." How would you tell them apart?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself the full path from detection to fix: a resource becomes non-compliant, you want it corrected automatically and the on-call engineer informed. Name each component you would use to detect, route, act, and notify — and why a plain SNS email alone would not satisfy "corrected automatically."',
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants any newly created Amazon EBS volume that is unencrypted to be reported and automatically remediated, with minimal custom code. Which combination of services achieves this?',
        options: [
          'Amazon Inspector scans the volumes and patches them automatically',
          'AWS Config detects the non-compliant volume and triggers a Systems Manager Automation runbook to remediate it',
          'A CloudWatch dashboard displays unencrypted volumes for an engineer to fix manually',
          'AWS Trusted Advisor stops the instance using the volume',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS Config continuously evaluates resource compliance and can invoke an SSM Automation runbook as an auto-remediation action — detection plus low-code correction.',
          perOption: [
            'Amazon Inspector assesses software vulnerabilities and network exposure; it does not detect EBS encryption state or remediate it.',
            'Correct — a Config rule flags the unencrypted volume and its remediation action runs an SSM Automation runbook, satisfying both "reported" and "automatically remediated" with minimal code.',
            'A dashboard provides visibility only; it requires a human and does not remediate automatically.',
            'Trusted Advisor offers best-practice checks and recommendations; it does not take corrective actions on resources.',
          ],
          link: 'Domain 1 · Task 1.2 — Identify and remediate issues by using monitoring and availability metrics',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers CloudWatch Logs, EventBridge, and Systems Manager automation in the operations context of this session.' },
      ],
      keyTerms: [
        { term: 'Metric filter', def: 'A rule that scans incoming log events for a pattern and increments a CloudWatch metric you can alarm on.' },
        { term: 'CloudWatch Logs Insights', def: 'An interactive query language for searching and aggregating log data on demand during troubleshooting.' },
        { term: 'EventBridge rule', def: 'An event pattern plus one or more targets; matches events and routes (optionally transforming) them to services that act.' },
        { term: 'SSM Automation runbook', def: 'A predefined or custom multi-step Systems Manager workflow that performs an operational/remediation task.' },
        { term: 'Auto-remediation', def: 'AWS Config feature that runs a remediation action (often an SSM runbook) automatically when a resource is found non-compliant.' },
      ],
      awsServices: [
        { name: 'Amazon EventBridge', purpose: 'Serverless event bus that routes events from AWS, custom apps, and SaaS to targets based on rules; supports scheduling and transformation.' },
        { name: 'AWS Systems Manager Automation', purpose: 'Runs predefined or custom runbooks to automate operational and remediation tasks across fleets of resources.' },
        { name: 'AWS Lambda', purpose: 'Runs custom code in response to events when no managed runbook fits the required remediation logic.' },
        { name: 'AWS Config', purpose: 'Records resource configurations, evaluates them against rules, and can trigger automatic remediation.' },
      ],
      examTips: [
        'Continuous alert on a log pattern → metric filter + alarm. Investigate a past incident → Logs Insights query.',
        'EventBridge rule not firing → check the event pattern matches the real event JSON and the target invoke permission.',
        'Standard remediation with little/no code → SSM Automation runbook (often AWS-managed). Arbitrary logic → Lambda.',
        'AWS Config detects non-compliance and can auto-remediate via SSM. Inspector = vulnerabilities, not config compliance.',
        'Detect → route → act → notify: map each to CloudWatch/Config, EventBridge, SSM/Lambda, SNS.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Monitoring, Logging & Performance',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.3',
      title: 'Compute & Storage Performance — EC2, EBS Volume Types, and S3/EFS',
      duration: 30,
      summary: 'When a system is slow, the fix is usually picking the right resource, not just a bigger one. This session covers optimizing EC2 compute, choosing and tuning EBS volume types, and accelerating S3 and shared file storage — the performance levers the exam loves to test through "the app is slow / costs too much" scenarios.',
      objectives: [
        'Right-size and optimize EC2 compute using metrics, instance families, and placement groups',
        'Choose the correct EBS volume type (gp3, io2, st1, sc1) for an IOPS/throughput/cost profile',
        'Apply S3 performance strategies — multipart upload, Transfer Acceleration, DataSync, and prefixes',
        'Select and tune shared file storage (EFS, FSx) including EFS lifecycle/throughput modes',
      ],
      preLearningCheck: {
        question: 'A database on EBS needs sustained high IOPS at a predictable cost, and the team wants to avoid the burst-credit model. Which EBS volume type is the best default starting point?',
        options: [
          'gp2 (older general purpose, burst-based)',
          'gp3 (general purpose with independently provisioned IOPS and throughput)',
          'sc1 (cold HDD)',
          'standard (previous-generation magnetic)',
        ],
        correct: 1,
        note: 'gp3 decouples IOPS and throughput from volume size and gives a predictable baseline without gp2\'s burst-credit behavior — often the right modern default before you reach for io2.',
      },
      sections: [
        {
          heading: 'Optimizing EC2 compute',
          body: 'EC2 performance tuning starts with matching the instance family to the workload: compute-optimized (C) for CPU-bound work, memory-optimized (R/X) for in-memory databases and caches, storage-optimized (I/D) for high local IOPS, and general purpose (M/T) for balanced needs. T-family instances are burstable and run on CPU credits — great for spiky low-average workloads, dangerous for sustained CPU.',
          bullets: [
            'Use CloudWatch (and the agent for memory) plus AWS Compute Optimizer to right-size — Compute Optimizer recommends families/sizes from observed utilization.',
            'T-family CPU credits: if CPUCreditBalance hits zero, a sustained workload throttles (or bills for unlimited mode). Move steady workloads to M/C.',
            'Placement groups tune networking: cluster (low latency, high throughput within one AZ), spread (separate hardware for HA), partition (large distributed systems).',
            'Enhanced networking / ENA and larger instances raise network bandwidth ceilings for network-bound apps.',
          ],
          callout: { type: 'tip', text: 'Resource tags + Compute Optimizer + CloudWatch are the exam\'s "how do I right-size" trio. A T-instance throttling under steady load is a classic distractor cue to switch families.' },
        },
        {
          heading: 'EBS volume types — the decision that recurs',
          body: 'EBS performance questions reduce to matching a workload to a volume type. SSD-backed volumes optimize for IOPS (small, random I/O); HDD-backed volumes optimize for throughput (large, sequential I/O) at low cost.',
          table: {
            headers: ['Volume type', 'Backing', 'Best for'],
            rows: [
              ['gp3', 'SSD', 'Default general purpose; IOPS and throughput provisioned independently of size, predictable cost'],
              ['gp2', 'SSD', 'Legacy general purpose; performance scales with size via burst credits (prefer gp3)'],
              ['io2 / io2 Block Express', 'SSD', 'Mission-critical databases needing the highest, most durable provisioned IOPS and low latency'],
              ['st1', 'HDD', 'Throughput-intensive, sequential workloads (big data, log processing) — cannot be a boot volume'],
              ['sc1', 'HDD', 'Cold, infrequently accessed data at the lowest cost'],
            ],
          },
          callout: { type: 'note', text: 'IOPS vs throughput is the crux: random small reads (a transactional DB) → SSD/provisioned IOPS; large sequential scans (analytics, logs) → throughput-optimized st1. Monitor VolumeQueueLength and latency to spot an undersized volume.' },
        },
        {
          heading: 'Amazon S3 performance strategies',
          body: 'S3 scales massively, but how you move and lay out data matters. The exam expects you to match a transfer or access problem to the right S3 feature.',
          bullets: [
            'Multipart upload: split large objects into parts uploaded in parallel — faster and resilient for big files; recommended above 100 MB.',
            'S3 Transfer Acceleration: routes uploads over the CloudFront edge network for fast long-distance transfers to a bucket.',
            'AWS DataSync: managed, high-throughput transfer for large-scale on-premises ↔ AWS (or AWS ↔ AWS) migrations and recurring syncs.',
            'S3 scales per prefix; modern S3 handles high request rates automatically, but spreading keys across prefixes still helps extreme workloads.',
            'S3 Lifecycle policies transition objects to cheaper classes or expire them — a cost-and-performance lever covered more in the cost domain.',
          ],
        },
        {
          heading: 'Shared file storage — EFS and FSx',
          body: 'When multiple instances need a shared file system (not block storage tied to one instance, and not object storage), you choose between EFS and the FSx family. EFS is elastic NFS for Linux; FSx provides fully managed third-party file systems.',
          bullets: [
            'Amazon EFS: elastic, multi-AZ NFS shared across many Linux instances; scales automatically. Use EFS lifecycle management to move cold files to Infrequent Access (EFS-IA) for cost savings.',
            'EFS throughput modes (Elastic/Bursting/Provisioned) and performance modes tune for the workload; Elastic is the modern default.',
            'Amazon FSx for Windows File Server: SMB shares for Windows workloads (Active Directory integrated).',
            'Amazon FSx for Lustre: high-performance computing and ML workloads needing extreme throughput, often linked to S3.',
          ],
          callout: { type: 'tip', text: 'Storage selection signal: one instance, block → EBS; many Linux instances, shared files → EFS; Windows/SMB → FSx for Windows; HPC/ML throughput → FSx for Lustre; objects/web → S3.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A log-processing job sequentially scans terabytes of data and is bottlenecked on disk throughput, not random IOPS, and the team wants the lowest cost that still performs. Which EBS volume type fits?',
          options: [
            'io2 Block Express',
            'st1 (throughput-optimized HDD)',
            'gp2',
            'sc1 (cold HDD)',
          ],
          correct: 1,
          explainCorrect: 'Correct — st1 is built for large, sequential, throughput-heavy workloads like log and big-data processing at a lower cost than SSD, while still performing well.',
          elaborativePrompt: 'Why would provisioned-IOPS io2 be both overkill and more expensive here, and why might sc1 be too slow despite being cheaper?',
        },
        {
          afterSection: 3,
          question: 'A fleet of Linux web servers across two Availability Zones must all read and write the same set of user-uploaded files. Which storage service fits best?',
          options: [
            'An EBS volume attached to one instance and shared over the network',
            'Amazon EFS mounted on all instances',
            'Amazon S3 Glacier Deep Archive',
            'Instance store on each server',
          ],
          correct: 1,
          explainCorrect: 'Correct — EFS is an elastic, multi-AZ shared file system that many Linux instances can mount simultaneously, exactly matching the shared read/write requirement.',
          elaborativePrompt: 'Explain why a single EBS volume cannot satisfy "all instances read and write the same files across AZs", and why instance store would lose the data.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would diagnose a slow application that reads many small records from a database volume. Which CloudWatch/EBS metrics would you check, how would you decide between gp3 and io2, and what would make you suspect the instance family rather than the disk?',
      sample: {
        type: 'multiple-choice',
        stem: 'An application stores large media files in Amazon S3. Users in distant Regions complain that uploading multi-gigabyte files is slow and frequently fails partway through. Which two changes most improve upload speed and reliability? (The single best combined answer.)',
        options: [
          'Switch the bucket to S3 One Zone-IA and disable versioning',
          'Use S3 multipart upload for the large files and enable S3 Transfer Acceleration',
          'Move the files to Amazon EBS and share the volume',
          'Enable EC2 detailed monitoring on the upload servers',
        ],
        correct: 1,
        explanation: {
          summary: 'Multipart upload parallelizes and makes large transfers resilient (a failed part is retried, not the whole file); Transfer Acceleration speeds long-distance uploads via the edge network.',
          perOption: [
            'Changing the storage class affects cost/availability, not upload speed or reliability, and disabling versioning removes protection without helping.',
            'Correct — multipart upload handles large files reliably by splitting them into retryable parts, and Transfer Acceleration uses CloudFront edge locations to accelerate distant uploads.',
            'EBS is block storage for a single instance and cannot replace S3 for globally accessed object storage; sharing it does not solve upload latency.',
            'Detailed monitoring changes metric frequency only and has no effect on transfer speed or success rate.',
          ],
          link: 'Domain 1 · Task 1.3 — Implement performance optimization strategies for compute, storage, and database resources',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers EC2, EBS volume types, and S3/EFS storage performance as part of the operations curriculum.' },
      ],
      keyTerms: [
        { term: 'gp3', def: 'General-purpose SSD EBS volume whose IOPS and throughput are provisioned independently of size, with predictable cost — the modern default.' },
        { term: 'Provisioned IOPS (io2)', def: 'SSD EBS volume for mission-critical databases needing the highest, most consistent IOPS and durability.' },
        { term: 'st1', def: 'Throughput-optimized HDD volume for large, sequential workloads like big-data and log processing; cannot be a boot volume.' },
        { term: 'Multipart upload', def: 'S3 feature that splits a large object into parts uploaded in parallel and retried individually for speed and resilience.' },
        { term: 'Amazon EFS', def: 'Elastic, multi-AZ NFS file system that many Linux instances can mount and share simultaneously.' },
      ],
      awsServices: [
        { name: 'Amazon EBS', purpose: 'Block storage for EC2; volume types (gp3/io2/st1/sc1) trade off IOPS, throughput, and cost for a single instance.' },
        { name: 'AWS Compute Optimizer', purpose: 'Recommends optimal EC2 instance families/sizes (and EBS/Lambda settings) from observed utilization to right-size workloads.' },
        { name: 'Amazon S3', purpose: 'Object storage with performance features (multipart upload, Transfer Acceleration) and lifecycle management.' },
        { name: 'Amazon EFS / FSx', purpose: 'Shared file storage — EFS for elastic Linux NFS; FSx for Windows SMB and high-performance Lustre file systems.' },
      ],
      examTips: [
        'gp3 is the modern general-purpose default; reach for io2 only when the workload needs the highest durable IOPS.',
        'Random small I/O (transactional DB) → SSD/IOPS. Large sequential I/O (logs/analytics) → throughput-optimized st1.',
        'Large/slow/failing S3 uploads → multipart upload (+ Transfer Acceleration for distance). Bulk migration → DataSync.',
        'Many Linux instances sharing files → EFS. Windows shares → FSx for Windows. HPC/ML → FSx for Lustre.',
        'T-family burstable instances throttle under sustained CPU once credits run out — move steady load to M/C families.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Monitoring, Logging & Performance',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.3',
      title: 'Database Performance — RDS Metrics, Performance Insights, and RDS Proxy',
      duration: 30,
      summary: 'Databases are where performance problems hurt most and where the exam expects real diagnostic skill. This session covers monitoring RDS with CloudWatch and Performance Insights, fixing connection-storm and read-bottleneck problems with RDS Proxy and read replicas, and knowing when caching is the real answer.',
      objectives: [
        'Monitor RDS health with CloudWatch metrics and Amazon RDS Performance Insights',
        'Diagnose connection exhaustion and use RDS Proxy to pool and stabilize connections',
        'Scale read-heavy workloads with read replicas and offload with ElastiCache',
        'Apply Performance Insights proactive recommendations to tune database configuration',
      ],
      preLearningCheck: {
        question: 'A serverless application using Lambda opens a new database connection on every invocation and the RDS instance keeps hitting its max-connections limit during traffic spikes. What is the most appropriate fix?',
        options: [
          'Increase the Lambda timeout',
          'Put Amazon RDS Proxy in front of the database to pool and reuse connections',
          'Switch the database to a larger EBS volume',
          'Disable CloudWatch monitoring to reduce load',
        ],
        correct: 1,
        note: 'Lambda scaling can open thousands of short-lived connections and exhaust the database. RDS Proxy pools connections so the database sees a stable, manageable number — the textbook fix.',
      },
      sections: [
        {
          heading: 'Monitoring RDS — CloudWatch vs Performance Insights',
          body: 'RDS publishes CloudWatch metrics for the basics: CPUUtilization, FreeableMemory, DatabaseConnections, ReadIOPS/WriteIOPS, ReadLatency/WriteLatency, and FreeStorageSpace. These tell you THAT something is wrong. Amazon RDS Performance Insights tells you WHY — it visualizes database load by wait state and top SQL, so you can see whether the bottleneck is CPU, I/O, locks, or a specific slow query.',
          bullets: [
            'CloudWatch = resource-level metrics and alarms (is the instance CPU/memory/storage healthy?).',
            'Performance Insights = database-engine-level load analysis (which queries and wait events dominate?).',
            'Enhanced Monitoring adds OS-level metrics (per-process) at high frequency for deep diagnosis.',
            'Performance Insights proactive recommendations surface tuning advice (e.g. parameter or index issues) before they cause outages.',
          ],
          callout: { type: 'note', text: '"The database is slow — find the offending query" → Performance Insights. "Is the instance about to run out of storage/CPU" → CloudWatch metric + alarm. The exam separates resource health from query-level load.' },
        },
        {
          heading: 'Connection management and RDS Proxy',
          body: 'Modern, highly concurrent and serverless applications can overwhelm a database with connections — each connection consumes memory, and opening/closing them is expensive. Amazon RDS Proxy sits between the application and the database, pooling and sharing connections so the database handles a stable number even as the app scales.',
          bullets: [
            'RDS Proxy reduces failover time and shields the database from connection storms caused by Lambda or large fleets.',
            'It improves resiliency: during a failover, the proxy preserves application connections and routes to the new primary.',
            'It integrates with Secrets Manager and IAM authentication for credential handling.',
            'Symptom to recognize: "too many connections" errors or connection latency under scale → RDS Proxy.',
          ],
        },
        {
          heading: 'Scaling reads — replicas and caching',
          body: 'When a database is read-bound, you have two complementary levers. Read replicas offload read traffic to additional copies of the database; ElastiCache offloads repeated reads entirely by serving them from memory. The exam wants you to distinguish "scale the database for reads" from "stop hitting the database at all."',
          bullets: [
            'Read replicas (RDS/Aurora): asynchronous copies that serve read queries, scaling read throughput. Aurora replicas also provide fast failover targets.',
            'ElastiCache (Redis/Memcached): in-memory cache for hot data and query results — dramatically cuts read latency and database load for repeated reads.',
            'Use a cache-aside pattern: app checks the cache first, falls back to the database, then populates the cache.',
            'Writes still go to the primary; replicas and caches do not scale write throughput (that needs vertical scaling, sharding, or a different engine).',
          ],
          callout: { type: 'tip', text: 'Read-heavy and repetitive → ElastiCache (serve from memory). Read-heavy but varied/fresh → read replicas. Write-heavy → caching/replicas will not help; scale up or re-architect.' },
        },
        {
          heading: 'Tuning and proactive recommendations',
          body: 'Beyond architecture, RDS exposes configuration levers. Parameter groups control engine settings; Performance Insights proactive recommendations flag misconfigurations and resource pressure before they become incidents. Storage autoscaling prevents the "ran out of disk" outage by growing storage automatically.',
          bullets: [
            'Enable RDS storage autoscaling so FreeStorageSpace alarms do not turn into outages.',
            'Right-size the instance class from Performance Insights data — more memory often beats more CPU for caching-heavy databases.',
            'Multi-AZ improves availability (covered in the reliability domain) but the standby does not serve reads.',
            'Use CloudWatch alarms on DatabaseConnections, ReadLatency, and FreeableMemory as early-warning signals.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An RDS database shows acceptable CPU and memory in CloudWatch, but users report intermittent slowness. The team needs to find which specific SQL statements and wait events are responsible. Which tool is purpose-built for this?',
          options: [
            'Amazon RDS Performance Insights',
            'AWS Trusted Advisor',
            'A CloudWatch billing alarm',
            'Amazon Inspector',
          ],
          correct: 0,
          explainCorrect: 'Correct — Performance Insights visualizes database load by wait state and top SQL, pinpointing the queries and contention causing slowness even when resource metrics look fine.',
          elaborativePrompt: 'Why can CloudWatch resource metrics look healthy while the database is still slow? What does load-by-wait-state reveal that CPU% cannot?',
        },
        {
          afterSection: 2,
          question: 'A reporting dashboard runs the same handful of expensive read queries thousands of times an hour against RDS, driving high load. Which change most reduces database load with the least change to data freshness needs (results can be seconds stale)?',
          options: [
            'Add an ElastiCache layer and serve the repeated query results from memory',
            'Switch the instance to a smaller class to save money',
            'Disable Performance Insights',
            'Convert the database to a single-AZ deployment',
          ],
          correct: 0,
          explainCorrect: 'Correct — caching the repeated, slightly-stale-tolerant query results in ElastiCache serves them from memory and removes most of the load from the database.',
          elaborativePrompt: 'When would read replicas be a better fit than ElastiCache for offloading reads, and when would caching clearly win?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would triage a "the database is slow" ticket: which CloudWatch metrics you would scan first, when you would open Performance Insights, and how you would decide among RDS Proxy, a read replica, and ElastiCache based on what you find.',
      sample: {
        type: 'multiple-choice',
        stem: 'A Lambda-based application experiences errors during traffic spikes. Investigation shows the Amazon RDS database repeatedly reaching its maximum connection limit as thousands of Lambda invocations each open their own connection. Which solution resolves this with the LEAST application rework?',
        options: [
          'Increase the RDS instance size repeatedly until the connection errors stop',
          'Introduce Amazon RDS Proxy so connections are pooled and reused across invocations',
          'Move the database to Amazon S3',
          'Add a CloudWatch alarm on DatabaseConnections and notify the team by email',
        ],
        correct: 1,
        explanation: {
          summary: 'RDS Proxy pools and reuses database connections, so a rapidly scaling Lambda fleet presents a stable connection count to the database — solving connection exhaustion without rewriting the app.',
          perOption: [
            'Scaling up raises the connection ceiling slightly but does not address thousands of short-lived connections; it is costly and only delays the problem.',
            'Correct — RDS Proxy is purpose-built for this Lambda-connection-storm pattern, pooling connections and also improving failover behavior, with no application redesign.',
            'S3 is object storage and cannot serve as a relational database; this does not apply.',
            'An alarm provides visibility but does not fix the connection exhaustion — it only tells you it is happening.',
          ],
          link: 'Domain 1 · Task 1.3 — Implement performance optimization strategies for compute, storage, and database resources',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers RDS monitoring, scaling, and the database operations concepts in this session.' },
      ],
      keyTerms: [
        { term: 'RDS Performance Insights', def: 'A database performance tool that visualizes load by wait state and top SQL to pinpoint the cause of slowness.' },
        { term: 'RDS Proxy', def: 'A managed connection pool that sits between applications and RDS, stabilizing connections and improving failover.' },
        { term: 'Read replica', def: 'An asynchronous copy of a database that serves read queries to scale read throughput.' },
        { term: 'ElastiCache', def: 'In-memory cache (Redis/Memcached) that serves hot data and repeated query results, cutting database read load.' },
        { term: 'Storage autoscaling', def: 'RDS feature that automatically grows allocated storage to prevent out-of-space outages.' },
      ],
      awsServices: [
        { name: 'Amazon RDS', purpose: 'Managed relational database with CloudWatch metrics, Performance Insights, read replicas, Multi-AZ, and storage autoscaling.' },
        { name: 'Amazon RDS Proxy', purpose: 'Pools and shares database connections to handle connection storms (especially from Lambda) and speed failover.' },
        { name: 'Amazon ElastiCache', purpose: 'In-memory data store used as a cache to offload repeated reads from the database.' },
      ],
      examTips: [
        'Find the slow query / contention → Performance Insights. Instance resource health/alarms → CloudWatch metrics.',
        'Lambda or large fleet exhausting "max connections" → RDS Proxy (connection pooling), not a bigger instance.',
        'Repeated, slightly-stale-OK reads → ElastiCache. Varied fresh reads at scale → read replicas.',
        'Replicas and caches scale reads, not writes. Write-bound → scale up, shard, or re-architect.',
        'Enable RDS storage autoscaling so a FreeStorageSpace problem does not become an outage.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — RELIABILITY AND BUSINESS CONTINUITY (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Reliability & Business Continuity',
      domain: 'd2',
      weight: '22%',
      task: 'Task 2.1',
      title: 'Scalability and Elasticity — Auto Scaling, Caching, and Database Scaling',
      duration: 30,
      summary: 'Elasticity is matching capacity to demand automatically — adding resources when load rises and removing them when it falls. This session covers EC2 Auto Scaling and its policy types, caching with CloudFront and ElastiCache to absorb load, and scaling managed databases including DynamoDB.',
      objectives: [
        'Configure EC2 Auto Scaling groups and choose among target-tracking, step, and scheduled policies',
        'Use lifecycle hooks, health checks, and cooldowns to scale safely',
        'Apply caching (CloudFront, ElastiCache) to enhance dynamic scalability',
        'Scale managed databases — RDS storage/replicas and DynamoDB on-demand vs provisioned with auto scaling',
      ],
      preLearningCheck: {
        question: 'An application should keep average CPU across its Auto Scaling group near 50%, adding or removing instances automatically as load changes. Which scaling policy is the simplest fit?',
        options: [
          'A scheduled scaling action at fixed times',
          'A target-tracking scaling policy set to 50% average CPU',
          'Manual adjustment of desired capacity',
          'A step scaling policy with ten different steps',
        ],
        correct: 1,
        note: 'Target tracking is the "set a target and let AWS maintain it" policy — like a thermostat. It is the simplest choice when you have one metric and a desired value.',
      },
      sections: [
        {
          heading: 'EC2 Auto Scaling fundamentals',
          body: 'An Auto Scaling group (ASG) maintains a desired number of EC2 instances between a minimum and maximum, launching from a launch template. It replaces unhealthy instances automatically and distributes them across Availability Zones for resilience. The ASG is the core mechanism behind both elasticity (scale with demand) and self-healing (replace failures).',
          bullets: [
            'min / desired / max capacity define the range; the ASG keeps "desired" running and adjusts it via policies.',
            'Health checks: EC2 status checks and (optionally) ELB health checks decide when to replace an instance.',
            'Multi-AZ distribution gives fault tolerance — losing an AZ triggers replacement capacity in the others.',
            'Launch templates (preferred over legacy launch configurations) define the instance configuration to launch.',
          ],
        },
        {
          heading: 'Scaling policy types',
          body: 'Choosing the policy is the exam\'s favorite Auto Scaling question. Each policy answers a different "when should we scale?"',
          table: {
            headers: ['Policy', 'How it decides', 'Use when'],
            rows: [
              ['Target tracking', 'Keeps a metric at a target value (e.g. 50% CPU)', 'You have one clear metric and a desired level — the simplest, most common choice'],
              ['Step scaling', 'Adds/removes capacity in steps based on alarm breach size', 'You need different responses to different severity levels'],
              ['Simple scaling', 'One adjustment per alarm, then a cooldown', 'Basic needs; largely superseded by target tracking'],
              ['Scheduled scaling', 'Changes capacity at known times', 'Predictable demand (business hours, nightly batch, a known sale)'],
              ['Predictive scaling', 'ML forecasts demand and pre-scales', 'Recurring, predictable daily/weekly traffic patterns'],
            ],
          },
          callout: { type: 'tip', text: 'Cooldowns and warm-up periods prevent thrashing — scaling out then in repeatedly. If an ASG over-reacts to brief spikes, tuning cooldown/instance warm-up is often the fix.' },
          interactive: 'scaling-policy',
        },
        {
          heading: 'Caching to absorb load',
          body: 'The cheapest request is the one your servers never handle. Caching is a scalability strategy as much as a performance one: it lets a fixed backend serve far more users by offloading repeated work.',
          bullets: [
            'Amazon CloudFront: a CDN that caches content at edge locations close to users — offloads static (and cacheable dynamic) content from the origin and cuts latency.',
            'Amazon ElastiCache: in-memory caching of database query results and session data, so the database scales further without growing.',
            'Caching smooths spikes: a flash crowd hitting cached content never reaches the origin, buying the ASG time to scale.',
            'Together with Auto Scaling, caching reduces how much you must scale in the first place.',
          ],
        },
        {
          heading: 'Scaling managed databases',
          body: 'Databases scale differently from stateless compute. The exam expects you to know the scaling model for RDS and especially DynamoDB.',
          bullets: [
            'RDS: scale vertically (larger instance class) for writes, add read replicas for reads, and enable storage autoscaling for capacity. Aurora Serverless v2 scales capacity automatically.',
            'DynamoDB on-demand: pay per request, scales instantly to any traffic with no capacity planning — best for spiky or unknown workloads.',
            'DynamoDB provisioned + auto scaling: set a target utilization and DynamoDB adjusts read/write capacity units — best for predictable, steady traffic at lower cost.',
            'DynamoDB Accelerator (DAX) adds an in-memory cache for microsecond reads; global tables provide multi-Region scaling.',
          ],
          callout: { type: 'note', text: 'DynamoDB capacity-mode choice is a recurring question: unpredictable/spiky or new app → on-demand. Predictable/steady and cost-sensitive → provisioned with auto scaling.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A retailer knows traffic surges every weekday at 9 a.m. when a promotion goes live, then settles. They want capacity ready in advance, not reacting after latency rises. Which scaling approach fits best?',
          options: [
            'Target tracking on CPU only',
            'Scheduled scaling (or predictive scaling) to add capacity before the known surge',
            'Manual scaling each morning',
            'Disabling the Auto Scaling group',
          ],
          correct: 1,
          explainCorrect: 'Correct — when demand is predictable by time, scheduled scaling pre-provisions capacity before the surge; predictive scaling does the same using forecasts. Reactive target tracking alone would lag the spike.',
          elaborativePrompt: 'Why does purely reactive scaling (target tracking) sometimes cause a brief period of poor performance at the start of a known spike, and how does scheduling avoid it?',
        },
        {
          afterSection: 3,
          question: 'A new application has completely unpredictable, bursty traffic and the team does not want to plan capacity or risk throttling. Which DynamoDB configuration is the safest starting point?',
          options: [
            'Provisioned capacity with a low fixed value',
            'On-demand capacity mode',
            'A single read replica',
            'Disable auto scaling entirely',
          ],
          correct: 1,
          explainCorrect: 'Correct — on-demand mode scales instantly to whatever traffic arrives with no capacity planning, which is ideal for new or unpredictable, bursty workloads.',
          elaborativePrompt: 'Once the traffic pattern becomes well understood and steady, why might the team switch from on-demand to provisioned-with-auto-scaling?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how an Auto Scaling group, a load balancer, CloudFront, and ElastiCache work together to handle a 10x traffic spike. Which layer absorbs the spike first, which scales over minutes, and why caching reduces how far the compute layer must scale.',
      sample: {
        type: 'multiple-choice',
        stem: 'A web application behind an Application Load Balancer runs on an EC2 Auto Scaling group. During unpredictable traffic spikes, latency rises before new instances finish launching. The team wants to keep average CPU near a target and reduce how often the backend is hit by repeated identical requests. Which combination best meets these goals?',
        options: [
          'Use a scheduled scaling policy and disable the load balancer health checks',
          'Use a target-tracking scaling policy on CPU and add a caching layer (CloudFront/ElastiCache) to offload repeated requests',
          'Replace the Auto Scaling group with a single larger instance',
          'Switch the database to provisioned IOPS and remove the Auto Scaling group',
        ],
        correct: 1,
        explanation: {
          summary: 'Target tracking keeps CPU near the desired level automatically, and caching absorbs repeated requests so fewer reach the backend — together smoothing spikes and reducing required scale.',
          perOption: [
            'Scheduled scaling cannot anticipate unpredictable spikes, and disabling health checks removes self-healing — both make reliability worse.',
            'Correct — target tracking maintains the CPU target while CloudFront/ElastiCache offloads repeated work, reducing latency during spikes and how far the group must scale.',
            'A single larger instance removes elasticity and creates a single point of failure — the opposite of a reliable, scalable design.',
            'Provisioned IOPS addresses disk performance, not request spikes, and removing the ASG eliminates elasticity and self-healing.',
          ],
          link: 'Domain 2 · Task 2.1 — Implement scalability and elasticity',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers EC2 Auto Scaling, scaling policies, and caching for elasticity in the operations context.' },
      ],
      keyTerms: [
        { term: 'Auto Scaling group (ASG)', def: 'A group of EC2 instances kept between min and max capacity, scaled by policies and self-healed across AZs.' },
        { term: 'Target-tracking policy', def: 'A scaling policy that keeps a chosen metric at a target value, like a thermostat — the simplest common choice.' },
        { term: 'Predictive scaling', def: 'Auto Scaling that uses ML forecasts of recurring demand to add capacity before it is needed.' },
        { term: 'DynamoDB on-demand', def: 'A capacity mode that scales instantly per-request with no capacity planning, ideal for spiky or unknown workloads.' },
        { term: 'CloudFront', def: 'A content delivery network that caches content at edge locations to offload the origin and reduce latency.' },
      ],
      awsServices: [
        { name: 'Amazon EC2 Auto Scaling', purpose: 'Maintains and scales a fleet of EC2 instances across AZs using target-tracking, step, scheduled, and predictive policies.' },
        { name: 'Amazon CloudFront', purpose: 'CDN that caches and serves content from edge locations, absorbing load and lowering latency for users.' },
        { name: 'Amazon DynamoDB', purpose: 'Serverless NoSQL database that scales via on-demand or provisioned-with-auto-scaling capacity modes; DAX adds caching.' },
      ],
      examTips: [
        'One metric, one target → target tracking. Known time-based demand → scheduled/predictive. Severity tiers → step scaling.',
        'Cooldown / instance warm-up tuning fixes scaling that thrashes on brief spikes.',
        'Caching (CloudFront/ElastiCache) reduces how far the compute layer must scale — pair it with Auto Scaling.',
        'DynamoDB: spiky/unknown → on-demand; steady/predictable + cost-sensitive → provisioned with auto scaling.',
        'Read replicas/caches scale reads; vertical scaling or Aurora Serverless v2 handles write/capacity growth.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Reliability & Business Continuity',
      domain: 'd2',
      weight: '22%',
      task: 'Task 2.2',
      title: 'High Availability — Load Balancing, Health Checks, and Multi-AZ',
      duration: 30,
      summary: 'High availability means surviving the failure of a component — an instance, a subnet, an entire Availability Zone — without downtime. This session covers Elastic Load Balancing, Route 53 health checks and failover, and Multi-AZ deployments, the core building blocks of fault-tolerant operations.',
      objectives: [
        'Distinguish the ELB types (ALB, NLB, GWLB) and choose the right one',
        'Configure and troubleshoot ELB target health checks and Route 53 health checks',
        'Design Multi-AZ deployments for compute and databases to eliminate single points of failure',
        'Use Route 53 failover routing to redirect traffic away from an unhealthy endpoint',
      ],
      preLearningCheck: {
        question: 'An RDS database must remain available even if its Availability Zone fails, with automatic failover and no application reconfiguration. Which feature provides this?',
        options: [
          'A read replica in the same AZ',
          'A Multi-AZ deployment with a synchronous standby in another AZ',
          'A larger instance class',
          'Daily snapshots to S3',
        ],
        correct: 1,
        note: 'Multi-AZ keeps a synchronous standby in a second AZ and fails over automatically via the same endpoint. A read replica is for scaling reads, not automatic HA failover.',
      },
      sections: [
        {
          heading: 'Elastic Load Balancing — types and roles',
          body: 'A load balancer distributes traffic across healthy targets in multiple AZs, which is what makes a fleet both scalable and highly available. The exam expects you to match the load balancer type to the protocol and need.',
          table: {
            headers: ['Type', 'Layer', 'Use for'],
            rows: [
              ['Application Load Balancer (ALB)', 'Layer 7 (HTTP/HTTPS)', 'Web apps; path/host routing, redirects, WebSockets, target groups'],
              ['Network Load Balancer (NLB)', 'Layer 4 (TCP/UDP/TLS)', 'Extreme performance, low latency, static IPs, non-HTTP protocols'],
              ['Gateway Load Balancer (GWLB)', 'Layer 3/4', 'Inserting third-party virtual appliances (firewalls, IDS/IPS) transparently'],
            ],
          },
          callout: { type: 'note', text: 'ALB routes on HTTP attributes (path, host, headers); NLB is for raw TCP/UDP performance and static/Elastic IPs. GWLB is the "security appliance" answer.' },
        },
        {
          heading: 'Health checks — the heart of HA',
          body: 'High availability depends entirely on accurate health checks. A load balancer only sends traffic to targets that pass its health check; an unhealthy target is taken out of rotation automatically. Route 53 health checks operate at the DNS layer to detect endpoint failure and drive failover between sites.',
          bullets: [
            'ELB target health check: configurable path, interval, healthy/unhealthy thresholds. Misconfigured paths are a top cause of "all targets unhealthy".',
            'Common ELB troubleshooting: a security group blocking the health-check port, a wrong health-check path returning non-200, or the app binding to the wrong port.',
            'Route 53 health checks monitor an endpoint (or a CloudWatch alarm) and mark it unhealthy to trigger DNS-level failover.',
            'Health checks plus Auto Scaling = self-healing: a failing instance is removed and replaced automatically.',
          ],
          callout: { type: 'tip', text: 'Classic exam troubleshooting: targets show unhealthy even though the app works. Suspect the health-check path (must return 200), the health-check port, or a security group/NACL blocking the load balancer\'s probe.' },
        },
        {
          heading: 'Multi-AZ deployments',
          body: 'An Availability Zone is one or more isolated data centers; AZs in a Region have independent power, cooling, and networking, so they do not share single points of failure. Spreading a workload across multiple AZs is the fundamental HA pattern.',
          bullets: [
            'RDS Multi-AZ: a synchronous standby in a second AZ with automatic failover via the same DNS endpoint — availability, not read scaling.',
            'Compute: run the Auto Scaling group across multiple AZs behind a load balancer so the loss of one AZ leaves capacity in the others.',
            'Stateless design plus a load balancer makes AZ failure transparent to users.',
            'Multi-AZ protects against AZ failure; multi-Region (next session\'s territory) protects against Region failure and adds DR.',
          ],
        },
        {
          heading: 'Route 53 failover routing',
          body: 'Route 53 is more than DNS — its routing policies plus health checks let you steer traffic for availability. Failover routing sends users to a primary endpoint while it is healthy and to a secondary when it is not. (Other routing policies — latency, weighted, geolocation — are covered in the networking domain.)',
          bullets: [
            'Failover routing: primary + secondary records tied to health checks for active-passive HA/DR.',
            'A health check can watch an endpoint directly or watch a CloudWatch alarm for richer conditions.',
            'Combine with Multi-AZ within a Region and failover routing across Regions for layered resilience.',
            'TTL affects how quickly clients pick up the failover — lower TTL = faster failover, more DNS queries.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'After deploying a web app behind an Application Load Balancer, every target is marked unhealthy and users get 502 errors, even though the app responds fine when tested directly on the instance. What is the most likely cause?',
          options: [
            'The Region is experiencing an outage',
            'The health-check path or port is misconfigured, or a security group blocks the load balancer health-check traffic',
            'The application is written in the wrong language',
            'S3 versioning is disabled',
          ],
          correct: 1,
          explainCorrect: 'Correct — when targets are unhealthy but the app works directly, the fault is almost always the health-check configuration (wrong path/port returning non-200) or a security group/NACL blocking the load balancer\'s probe.',
          elaborativePrompt: 'Walk through the exact path of a health-check request from the load balancer to the target. At which hops could a security group, NACL, or wrong path break it?',
        },
        {
          afterSection: 2,
          question: 'A team uses an RDS read replica in another AZ and assumes it gives automatic failover if the primary AZ fails. Why is this assumption wrong, and what should they use?',
          options: [
            'Read replicas already provide automatic failover; the assumption is correct',
            'Read replicas scale reads and require manual promotion; for automatic AZ failover they need a Multi-AZ deployment',
            'They should take more frequent snapshots instead',
            'They should switch to a single-AZ deployment to simplify failover',
          ],
          correct: 1,
          explainCorrect: 'Correct — a read replica is asynchronous and must be manually promoted; it is for read scaling. Automatic failover on AZ loss requires a Multi-AZ deployment with a synchronous standby.',
          elaborativePrompt: 'In your own words, contrast the purpose of a read replica with the purpose of a Multi-AZ standby. Can a single deployment use both at once, and why might it?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how a two-AZ architecture (load balancer + Auto Scaling group + Multi-AZ RDS) survives the complete loss of one Availability Zone. Trace what happens to in-flight requests, to the database, and to capacity, and identify anything that would still be a single point of failure.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a stateless web tier on EC2 behind an Application Load Balancer in a single Availability Zone, with a single-AZ RDS database. They need the application to survive the failure of one Availability Zone with no manual intervention. Which set of changes achieves this?',
        options: [
          'Increase the EC2 instance size and enable detailed monitoring',
          'Spread the Auto Scaling group across multiple AZs behind the ALB and convert RDS to a Multi-AZ deployment',
          'Add a read replica in the same AZ and take hourly snapshots',
          'Move static assets to S3 and keep everything else single-AZ',
        ],
        correct: 1,
        explanation: {
          summary: 'High availability comes from removing the single-AZ dependency: multi-AZ compute behind the load balancer plus a Multi-AZ database with automatic failover keeps the app running if one AZ fails.',
          perOption: [
            'A larger instance and more monitoring do nothing to survive an AZ failure — the single-AZ dependency remains.',
            'Correct — distributing the ASG across AZs and using RDS Multi-AZ provides automatic failover and surviving capacity when an AZ is lost, with no manual steps.',
            'A same-AZ read replica fails with the AZ, and snapshots are for recovery, not automatic high availability.',
            'Offloading static assets does not address the single-AZ compute and database that would take the app down.',
          ],
          link: 'Domain 2 · Task 2.2 — Implement highly available and resilient environments',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers Elastic Load Balancing, health checks, Route 53, and Multi-AZ high availability.' },
      ],
      keyTerms: [
        { term: 'Application Load Balancer', def: 'A Layer 7 load balancer that routes HTTP/HTTPS traffic on path, host, and headers across healthy targets in multiple AZs.' },
        { term: 'Network Load Balancer', def: 'A Layer 4 load balancer for high-performance TCP/UDP traffic, supporting static and Elastic IPs.' },
        { term: 'Health check', def: 'A periodic probe that determines whether a target or endpoint is healthy; unhealthy targets are removed from rotation.' },
        { term: 'Multi-AZ deployment', def: 'Running resources across isolated Availability Zones (RDS uses a synchronous standby) to survive an AZ failure with automatic failover.' },
        { term: 'Failover routing', def: 'A Route 53 policy that directs traffic to a primary endpoint while healthy and to a secondary when it fails.' },
      ],
      awsServices: [
        { name: 'Elastic Load Balancing', purpose: 'Distributes traffic across healthy targets in multiple AZs; ALB (L7), NLB (L4), and GWLB (appliances).' },
        { name: 'Amazon Route 53', purpose: 'DNS service with health checks and routing policies (including failover) for availability and traffic steering.' },
        { name: 'Amazon RDS Multi-AZ', purpose: 'Maintains a synchronous standby in another AZ with automatic failover for database high availability.' },
      ],
      examTips: [
        'ALB = HTTP/HTTPS path/host routing; NLB = TCP/UDP performance + static IPs; GWLB = third-party security appliances.',
        'All targets unhealthy but app works → check health-check path/port (must return 200) and security group/NACL on the probe.',
        'RDS Multi-AZ = automatic HA failover (same endpoint). Read replica = read scaling, manual promotion. Do not confuse them.',
        'Spread the Auto Scaling group across AZs so losing one AZ leaves capacity in the others.',
        'Multi-AZ survives AZ failure; multi-Region survives Region failure (DR). Match the scope to the requirement.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Reliability & Business Continuity',
      domain: 'd2',
      weight: '22%',
      task: 'Task 2.3',
      title: 'Backup, Restore, and Disaster Recovery — RTO, RPO, and the Four Strategies',
      duration: 30,
      summary: 'Backups exist to be restored, and disaster recovery is about hitting recovery targets at an acceptable cost. This session covers centralized backups with AWS Backup, point-in-time restore, versioning, and the four DR strategies — matching backup & restore, pilot light, warm standby, and multi-site to RTO and RPO requirements.',
      objectives: [
        'Define RTO and RPO and use them to drive backup and DR decisions',
        'Centralize and automate backups across services with AWS Backup',
        'Use point-in-time restore, snapshots, and versioning to recover data',
        'Choose among the four DR strategies based on RTO/RPO and cost',
      ],
      preLearningCheck: {
        question: 'A business can tolerate losing at most 5 minutes of data but can accept up to 1 hour to restore service. Which pair of terms describes these two requirements?',
        options: [
          'RPO = 1 hour, RTO = 5 minutes',
          'RPO = 5 minutes, RTO = 1 hour',
          'Both are the RTO',
          'Both are the RPO',
        ],
        correct: 1,
        note: 'RPO (Recovery Point Objective) = how much DATA you can lose (5 minutes here). RTO (Recovery Time Objective) = how long you can be DOWN (1 hour here). Keeping the two straight is essential for every DR question.',
      },
      sections: [
        {
          heading: 'RTO and RPO — the language of recovery',
          body: 'Every backup and DR decision is anchored in two numbers. RPO (Recovery Point Objective) is the maximum acceptable amount of data loss, measured in time — it dictates how frequently you back up or replicate. RTO (Recovery Time Objective) is the maximum acceptable downtime — it dictates how quickly you must restore or fail over. Tighter objectives cost more, so the exam constantly asks you to pick the cheapest option that still meets the stated RTO/RPO.',
          bullets: [
            'Small RPO (seconds/minutes) → continuous or frequent replication, not nightly backups.',
            'Small RTO (minutes) → resources already running or quickly startable, not "restore from cold backup".',
            'Cost rises as both objectives shrink; the right answer meets the requirement without over-paying.',
            'A backup you have never restored is a hope, not a plan — test restores are part of the discipline.',
          ],
          callout: { type: 'note', text: 'Read DR questions by extracting the RTO and RPO first, then eliminate any strategy that cannot meet them, then pick the cheapest survivor. That algorithm answers most Task 2.3 questions.' },
        },
        {
          heading: 'AWS Backup — centralized and automated',
          body: 'AWS Backup is the managed, centralized way to automate and govern backups across many services from one place — EC2, EBS, RDS, DynamoDB, EFS, FSx, Storage Gateway, and more. You define a backup plan (frequency, retention, lifecycle to cold storage) and apply it to resources by tag, replacing per-service scripts.',
          bullets: [
            'Backup plans schedule backups and set retention and transition-to-cold-storage rules centrally.',
            'Tag-based resource assignment applies a plan automatically to any resource with a matching tag.',
            'Cross-Region and cross-account backup copy supports DR and ransomware/blast-radius isolation.',
            'Backup Vault Lock enforces immutable (WORM) retention so backups cannot be deleted early — compliance and ransomware protection.',
          ],
          interactive: 'backup-strategy',
        },
        {
          heading: 'Restore methods and versioning',
          body: 'Different data stores recover in different ways, and the exam expects you to match the method to the service and the RPO.',
          bullets: [
            'RDS/Aurora point-in-time restore (PITR): restore to any second within the retention window using automated backups + transaction logs — low RPO without manual snapshots.',
            'Snapshots (EBS, RDS, DynamoDB): point-in-time copies; restoring creates a new resource. Automate them with AWS Backup or Data Lifecycle Manager.',
            'S3 Versioning: keeps every version of an object so you can recover from accidental overwrite or delete; pair with MFA Delete for protection.',
            'S3 Cross-Region Replication and FSx/EFS backups extend durability and DR reach.',
          ],
          callout: { type: 'tip', text: 'Need to recover to a precise moment before a bad write with minimal data loss → point-in-time restore. Need to undo an accidental object overwrite/delete → S3 versioning. Match the recovery tool to the failure mode.' },
        },
        {
          heading: 'The four DR strategies',
          body: 'AWS frames disaster recovery as four strategies along a cost-vs-speed spectrum. Knowing where each sits — and the RTO/RPO it delivers — is core exam material.',
          table: {
            headers: ['Strategy', 'RTO / RPO', 'How it works'],
            rows: [
              ['Backup & Restore', 'Hours (highest RTO/RPO)', 'Back up data; recreate infrastructure in the DR Region after a disaster. Cheapest.'],
              ['Pilot Light', 'Tens of minutes', 'Core data replicated and minimal services (e.g. database) always on; scale up the rest on failover.'],
              ['Warm Standby', 'Minutes', 'A scaled-down but fully functional copy always running; scale it up to take production load.'],
              ['Multi-Site Active/Active', 'Near zero (lowest RTO/RPO)', 'Full production running in multiple Regions serving traffic simultaneously. Most expensive.'],
            ],
          },
          callout: { type: 'note', text: 'The order from cheapest/slowest to costliest/fastest is: Backup & Restore → Pilot Light → Warm Standby → Multi-Site. Match the stated RTO/RPO to the leftmost (cheapest) strategy that still meets it.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company wants one place to schedule and enforce backups for EC2, RDS, DynamoDB, and EFS, with central retention policies and cross-Region copies, instead of separate scripts per service. Which service fits?',
          options: [
            'AWS Backup',
            'Amazon Inspector',
            'AWS Trusted Advisor',
            'Amazon CloudFront',
          ],
          correct: 0,
          explainCorrect: 'Correct — AWS Backup centralizes backup scheduling, retention, lifecycle, and cross-Region/account copies across many services through backup plans and tag-based assignment.',
          elaborativePrompt: 'What operational risks come from per-service backup scripts that AWS Backup\'s central plans and Vault Lock are designed to remove?',
        },
        {
          afterSection: 3,
          question: 'A workload must recover within about 10 minutes of a Region failure with only seconds of data loss, but the business wants to avoid the full cost of running duplicate production everywhere. Which DR strategy is the best fit?',
          options: [
            'Backup & Restore',
            'Warm Standby',
            'A single-AZ deployment',
            'Multi-Site Active/Active',
          ],
          correct: 1,
          explainCorrect: 'Correct — warm standby keeps a scaled-down but fully functional copy always running, giving a minutes-level RTO with low RPO, at lower cost than full active/active multi-site.',
          elaborativePrompt: 'Why would backup & restore fail this RTO, and why might multi-site be considered over-provisioned (and over-priced) for a 10-minute target?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would choose a DR strategy for a system with a 15-minute RTO and a 1-minute RPO on a moderate budget. Walk through why you would eliminate backup & restore and multi-site, and how AWS Backup, replication, and a warm standby fit together.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company must recover its critical application in another AWS Region within 30 minutes (RTO) with no more than 5 minutes of data loss (RPO), while keeping costs as low as possible. Which disaster recovery strategy best meets these requirements?',
        options: [
          'Backup & Restore — restore from cross-Region backups after a disaster',
          'Pilot Light — keep the database replicated and core services minimal, then scale up the rest on failover',
          'Multi-Site Active/Active — run full production in both Regions at all times',
          'Single-Region deployment with hourly snapshots',
        ],
        correct: 1,
        explanation: {
          summary: 'Pilot light keeps critical data continuously replicated (meeting a ~5-minute RPO) and core components ready, so the environment can be scaled up within the 30-minute RTO — at far lower cost than always-on multi-site.',
          perOption: [
            'Backup & Restore typically yields an RTO of hours because infrastructure must be recreated after the event — it cannot reliably meet a 30-minute RTO.',
            'Correct — pilot light replicates the data (low RPO) and keeps a minimal core warm, allowing scale-up inside a 30-minute RTO at lower cost than warm standby or multi-site.',
            'Multi-site meets the objectives but runs full duplicate production continuously, which contradicts the "lowest cost" requirement.',
            'A single-Region design with hourly snapshots cannot survive a Region failure and gives an RPO of up to an hour — failing both requirements.',
          ],
          link: 'Domain 2 · Task 2.3 — Implement backup and restore strategies',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers AWS Backup, snapshots, RTO/RPO, and the disaster recovery strategies in this session.' },
      ],
      keyTerms: [
        { term: 'RPO (Recovery Point Objective)', def: 'The maximum acceptable amount of data loss, measured in time; drives backup/replication frequency.' },
        { term: 'RTO (Recovery Time Objective)', def: 'The maximum acceptable downtime; drives how quickly you must restore or fail over.' },
        { term: 'AWS Backup', def: 'Centralized service to automate, schedule, and govern backups across many AWS services, with cross-Region/account copy and Vault Lock.' },
        { term: 'Point-in-time restore', def: 'Restoring a database to any second within a retention window using automated backups plus transaction logs.' },
        { term: 'Pilot light', def: 'A DR strategy that keeps core data replicated and minimal services running, scaling up the rest only on failover.' },
      ],
      awsServices: [
        { name: 'AWS Backup', purpose: 'Centralizes and automates backup, retention, lifecycle, and cross-Region/account copy across EC2, EBS, RDS, DynamoDB, EFS, and more.' },
        { name: 'Amazon S3 Versioning', purpose: 'Preserves every version of an object to recover from accidental overwrite or deletion; pairs with MFA Delete.' },
        { name: 'Amazon RDS (PITR)', purpose: 'Provides point-in-time restore from automated backups and transaction logs for low-RPO database recovery.' },
      ],
      examTips: [
        'RPO = data loss tolerance (backup frequency); RTO = downtime tolerance (recovery speed). Extract both first.',
        'DR strategy order cheapest→fastest: Backup & Restore → Pilot Light → Warm Standby → Multi-Site. Pick the cheapest that meets RTO/RPO.',
        'Centralized, multi-service, policy-driven backups → AWS Backup (tag-based plans, cross-Region copy, Vault Lock).',
        'Precise recovery before a bad write → point-in-time restore. Accidental object overwrite/delete → S3 versioning.',
        'Backup Vault Lock = immutable WORM retention for compliance and ransomware protection.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — DEPLOYMENT, PROVISIONING, AND AUTOMATION (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s8',
      number: 8,
      module: 'Domain 3 · Deployment, Provisioning & Automation',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.1',
      title: 'Infrastructure as Code — AMIs, Image Builder, CloudFormation, and CDK',
      duration: 30,
      summary: 'Repeatable provisioning is what separates operations from firefighting. This session covers building golden images with EC2 Image Builder, and defining whole environments declaratively with AWS CloudFormation and the AWS CDK — including how stacks behave when a deployment fails.',
      objectives: [
        'Build and maintain consistent AMIs and container images with EC2 Image Builder',
        'Define infrastructure declaratively with CloudFormation templates (and the CDK that synthesizes them)',
        'Explain stack creation, update, rollback, drift, and change sets',
        'Read common CloudFormation deployment errors and know where to look',
      ],
      preLearningCheck: {
        question: 'A team wants every EC2 instance to launch from a hardened, pre-patched image that is rebuilt and tested automatically each month. Which service is purpose-built for this?',
        options: [
          'AWS CloudFormation',
          'EC2 Image Builder',
          'Amazon Inspector',
          'AWS Config',
        ],
        correct: 1,
        note: 'EC2 Image Builder automates building, hardening, testing, and distributing AMIs and container images on a schedule — exactly the "golden image pipeline" described.',
      },
      sections: [
        {
          heading: 'Golden images with EC2 Image Builder',
          body: 'A golden image is a pre-configured, hardened machine image that instances launch from, so every server starts identical and compliant. EC2 Image Builder automates the whole pipeline: it builds the image from a recipe, applies components (patches, agents, hardening), tests it, and distributes the resulting AMI (or container image) to the Regions and accounts that need it.',
          bullets: [
            'A recipe defines the base image plus build and test components; a pipeline runs it on a schedule or on demand.',
            'Image Builder versions images and can distribute them across Regions/accounts automatically.',
            'It reduces drift and patching toil — rebuild the image instead of patching every running instance by hand.',
            'Output can be an AMI for EC2 or a container image for ECS/EKS.',
          ],
        },
        {
          heading: 'CloudFormation — declarative infrastructure',
          body: 'AWS CloudFormation provisions resources from a template (JSON or YAML) that declares the desired state. You submit the template, CloudFormation creates a stack, and it figures out the order and dependencies. Because the template is code, environments become repeatable, reviewable, and version-controlled.',
          bullets: [
            'A stack is the unit of deployment — all resources in a template are created, updated, and deleted together.',
            'Parameters make a template reusable across environments; Mappings, Conditions, and Outputs add flexibility.',
            'Change sets preview what an update will modify before you execute it — avoiding surprise replacements.',
            'Nested stacks and modules break large templates into reusable pieces.',
          ],
          callout: { type: 'note', text: 'CloudFormation is declarative: you describe the end state, not the steps. That is why it can compute dependencies, detect drift, and roll back cleanly.' },
        },
        {
          heading: 'Stack behavior — rollback, drift, deletion policies',
          body: 'The exam tests what happens when things go wrong or change outside the template. Knowing the default behaviors is the difference between calm and panic during an incident.',
          bullets: [
            'On a failed create, CloudFormation rolls the stack back and deletes the resources it created (unless you disable rollback for debugging).',
            'On a failed update, it rolls back to the last known good state automatically.',
            'Drift detection reports resources changed outside CloudFormation (someone edited a security group by hand) so you can reconcile.',
            'DeletionPolicy: Retain or Snapshot protects critical resources (a database) from being destroyed when a stack is deleted.',
          ],
          callout: { type: 'tip', text: 'A stuck UPDATE_ROLLBACK_FAILED or a resource that "already exists" error usually means manual changes drifted the stack. Detect drift, then continue the rollback or import the resource.' },
        },
        {
          heading: 'The AWS CDK',
          body: 'The AWS Cloud Development Kit (CDK) lets you define infrastructure in a general-purpose programming language (TypeScript, Python, Java, etc.). The CDK synthesizes a CloudFormation template under the hood — so you get loops, conditionals, and abstractions while still deploying through CloudFormation\'s reliable engine.',
          bullets: [
            'CDK code → synthesized CloudFormation template → deployed as a normal stack.',
            'Constructs are reusable components that bundle best-practice defaults.',
            'Choose CDK when teams prefer real code and abstraction; choose raw templates for simple, declarative needs or when no programming runtime is desired.',
            'Both are first-party AWS IaC; third-party Terraform is covered in the next session.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A CloudFormation stack deletion would normally destroy a production RDS database that is part of the template. How do you ensure the database survives a stack deletion?',
          options: [
            'Set a DeletionPolicy of Retain (or Snapshot) on the database resource',
            'Disable rollback on the stack',
            'Add the database to a second template',
            'Enable detailed monitoring on the database',
          ],
          correct: 0,
          explainCorrect: 'Correct — a DeletionPolicy of Retain keeps the resource when the stack is deleted (Snapshot keeps a final snapshot), protecting critical data.',
          elaborativePrompt: 'Why is relying on memory ("we just will not delete the stack") a poor safeguard, and what does DeletionPolicy guarantee that a process cannot?',
        },
        {
          afterSection: 0,
          question: 'An operations team patches every running EC2 instance individually each month and still finds configuration drift between servers. What change most reduces this toil and drift?',
          options: [
            'Take more frequent EBS snapshots',
            'Build a hardened, patched AMI with EC2 Image Builder and relaunch instances from it',
            'Increase the instance size',
            'Disable automatic updates',
          ],
          correct: 1,
          explainCorrect: 'Correct — baking patches and hardening into a golden image with Image Builder, then launching from it, replaces per-instance patching and eliminates drift between servers.',
          elaborativePrompt: 'How does "replace the image" (immutable infrastructure) differ from "patch each server in place", and why does it reduce drift?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself the lifecycle of a CloudFormation stack from submit to a failed update: what CloudFormation does on success, what it does automatically on failure, and how drift detection and DeletionPolicy protect you when reality diverges from the template.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company deploys all infrastructure with AWS CloudFormation. An engineer manually changed a security group that the stack manages, and now a stack update fails. Which action best identifies what diverged so the team can reconcile it?',
        options: [
          'Delete and recreate the entire stack immediately',
          'Run CloudFormation drift detection to see which resources differ from the template',
          'Increase the stack timeout and retry',
          'Disable rollback and ignore the error',
        ],
        correct: 1,
        explanation: {
          summary: 'Drift detection compares the live resources against the template and reports exactly what was changed outside CloudFormation — the precise information needed to reconcile.',
          perOption: [
            'Deleting and recreating risks destroying data and does not explain what diverged; it is destructive and uninformed.',
            'Correct — drift detection pinpoints the manually changed security group (and any other drift) so the team can fix the template or the resource.',
            'A longer timeout does not address a configuration mismatch; the update will still conflict.',
            'Disabling rollback hides the failure rather than resolving the underlying drift.',
          ],
          link: 'Domain 3 · Task 3.1 — Provision and maintain cloud resources',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers CloudFormation, AMIs, and infrastructure-as-code provisioning in the operations context.' },
      ],
      keyTerms: [
        { term: 'Golden image', def: 'A pre-configured, hardened machine image that instances launch from so every server starts identical and compliant.' },
        { term: 'EC2 Image Builder', def: 'A service that automates building, hardening, testing, and distributing AMIs and container images on a schedule.' },
        { term: 'CloudFormation stack', def: 'The unit of deployment in CloudFormation — all resources in a template created, updated, and deleted together.' },
        { term: 'Drift detection', def: 'A CloudFormation feature that reports resources changed outside the template so you can reconcile them.' },
        { term: 'DeletionPolicy', def: 'A template attribute (Retain/Snapshot/Delete) controlling whether a resource survives stack deletion.' },
      ],
      awsServices: [
        { name: 'AWS CloudFormation', purpose: 'Provisions and manages AWS resources declaratively from templates as stacks, with rollback, change sets, and drift detection.' },
        { name: 'EC2 Image Builder', purpose: 'Automates the build, hardening, testing, and distribution of golden AMIs and container images.' },
        { name: 'AWS CDK', purpose: 'Defines infrastructure in a programming language and synthesizes CloudFormation templates for deployment.' },
      ],
      examTips: [
        'Automated, scheduled hardened-image pipeline → EC2 Image Builder. Declarative environment → CloudFormation.',
        'Failed create → rollback deletes created resources; failed update → rollback to last good state (defaults).',
        'Resource changed by hand and update fails → run drift detection, then reconcile.',
        'Protect a DB from stack deletion → DeletionPolicy: Retain or Snapshot.',
        'CDK synthesizes CloudFormation — it is real code on top of the same reliable engine.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Deployment, Provisioning & Automation',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.1',
      title: 'Multi-Account & Multi-Region Provisioning — StackSets, RAM, and Third-Party IaC',
      duration: 30,
      summary: 'Real organizations provision across many accounts and Regions and share resources between them. This session covers CloudFormation StackSets for fleet-wide deployment, AWS Resource Access Manager for sharing, deployment strategies, and how third-party tools like Terraform and Git fit alongside AWS-native IaC.',
      objectives: [
        'Deploy a single template across many accounts and Regions with CloudFormation StackSets',
        'Share resources across accounts with AWS Resource Access Manager (AWS RAM)',
        'Choose appropriate deployment strategies (in-place, blue/green, rolling, canary)',
        'Place Terraform and Git correctly relative to AWS-native CloudFormation/CDK',
      ],
      preLearningCheck: {
        question: 'A platform team must deploy the same baseline guardrail stack to 50 AWS accounts across 3 Regions and keep them in sync as the template evolves. Which feature does this with the least manual effort?',
        options: [
          'Run the template manually in each account',
          'CloudFormation StackSets',
          'A single CloudFormation stack in the management account',
          'AWS Config aggregator',
        ],
        correct: 1,
        note: 'StackSets extend a single template to many target accounts and Regions from one operation, and keep them updated centrally — exactly the fleet-wide deployment described.',
      },
      sections: [
        {
          heading: 'CloudFormation StackSets',
          body: 'A StackSet lets you deploy one CloudFormation template to many target accounts and Regions from a single administrative action, and then update or delete those stack instances centrally. It is the answer whenever a question says "the same thing in many accounts/Regions".',
          bullets: [
            'Define once, deploy to a list of accounts/Regions (or, with AWS Organizations integration, to whole OUs automatically).',
            'Automatic deployment to new accounts that join a target OU keeps guardrails consistent as the org grows.',
            'Operation preferences control rollout (max concurrent accounts, failure tolerance) to limit blast radius.',
            'Used for landing-zone baselines: IAM roles, Config rules, logging, and security guardrails.',
          ],
          callout: { type: 'note', text: 'One template, many accounts/Regions, centrally managed → StackSets. A single account/Region → a normal stack.' },
        },
        {
          heading: 'Sharing resources with AWS RAM',
          body: 'AWS Resource Access Manager (AWS RAM) lets one account share specific resources with other accounts or an entire organization — without duplicating them. This is how organizations centralize networking and other shared infrastructure.',
          bullets: [
            'Common shares: VPC subnets (shared VPC), Transit Gateways, Route 53 Resolver rules, License Manager configurations.',
            'Sharing avoids running a separate copy in every account and centralizes management.',
            'RAM shares the resource itself; it is distinct from cross-account IAM roles, which grant access to act in another account.',
            'Integrates with AWS Organizations so you can share to OUs.',
          ],
        },
        {
          heading: 'Deployment strategies',
          body: 'How you roll out a change determines its risk. The exam expects you to match a risk tolerance to a strategy.',
          table: {
            headers: ['Strategy', 'How it works', 'Trade-off'],
            rows: [
              ['In-place', 'Update the existing instances directly', 'Simplest, but downtime/risk during the update'],
              ['Rolling', 'Update a batch at a time', 'No full outage; mixed versions briefly run together'],
              ['Blue/green', 'Stand up a new environment, then shift traffic', 'Fast rollback by shifting back; costs two environments briefly'],
              ['Canary', 'Send a small % of traffic to the new version first', 'Limits blast radius; needs traffic-shifting and monitoring'],
            ],
          },
          callout: { type: 'tip', text: 'Need instant rollback and zero downtime → blue/green. Need to validate on a small slice before full rollout → canary. CodeDeploy and many AWS services implement these patterns.' },
        },
        {
          heading: 'Terraform, Git, and AWS-native IaC',
          body: 'The exam acknowledges third-party tooling. Terraform is a popular multi-cloud IaC tool that can provision AWS resources; Git is the version-control backbone for all IaC. You should know where each fits relative to CloudFormation/CDK.',
          bullets: [
            'Terraform uses its own state file and HCL language; it is provider-agnostic and common in multi-cloud shops.',
            'CloudFormation/CDK are AWS-native, deeply integrated (drift detection, StackSets, change sets) and need no external state management.',
            'Git stores templates/HCL as code, enabling review, history, and CI/CD-driven deployment — the operational backbone for any IaC.',
            'The choice is often organizational: AWS-only and tight integration → CloudFormation/CDK; multi-cloud or existing Terraform investment → Terraform.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A central networking account owns a Transit Gateway that application accounts must use without each creating their own. Which service shares it across accounts?',
          options: [
            'AWS Resource Access Manager (AWS RAM)',
            'CloudFormation StackSets',
            'Amazon Route 53',
            'AWS Config',
          ],
          correct: 0,
          explainCorrect: 'Correct — AWS RAM shares specific resources such as Transit Gateways and subnets across accounts, avoiding duplicate infrastructure and centralizing management.',
          elaborativePrompt: 'How does sharing a resource with RAM differ from granting a cross-account IAM role? What does each one actually let the other account do?',
        },
        {
          afterSection: 2,
          question: 'A team wants to release a new application version to only 5% of users first, watch error rates, then ramp up if healthy. Which deployment strategy matches?',
          options: [
            'In-place update of all instances at once',
            'Canary deployment',
            'Deleting the old version before deploying the new one',
            'A cold backup restore',
          ],
          correct: 1,
          explainCorrect: 'Correct — a canary deployment routes a small percentage of traffic to the new version first so problems are caught with limited blast radius before full rollout.',
          elaborativePrompt: 'Contrast canary with blue/green: both reduce risk, but how do their rollback mechanics and traffic patterns differ?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how a platform team would roll out a new security-baseline template to every account in an organization, share a central VPC with those accounts, and release an app change with instant rollback — naming the AWS feature for each of the three needs.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security team must ensure that a standard set of AWS Config rules and IAM roles is deployed identically to all current and future accounts in an AWS Organization, across two Regions, and stays updated centrally. Which approach best meets this requirement?',
        options: [
          'Manually run a CloudFormation template in each account when it is created',
          'Use CloudFormation StackSets with AWS Organizations integration to deploy to the target OUs automatically',
          'Share the rules with AWS RAM',
          'Create one CloudFormation stack in the management account only',
        ],
        correct: 1,
        explanation: {
          summary: 'StackSets with Organizations integration deploy a template to many accounts and Regions centrally and automatically include new accounts that join the target OUs — exactly the requirement.',
          perOption: [
            'Manual per-account runs do not scale, drift over time, and miss future accounts.',
            'Correct — StackSets deploy and maintain the same stack across all target accounts/Regions and auto-deploy to new accounts in the OU.',
            'RAM shares existing resources between accounts; it does not deploy templated Config rules and IAM roles into each account.',
            'A single stack in the management account does not place the rules and roles into the other 50 accounts.',
          ],
          link: 'Domain 3 · Task 3.1 — Provision and share resources across multiple AWS Regions and accounts',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers multi-account provisioning, StackSets, resource sharing, and deployment strategies.' },
      ],
      keyTerms: [
        { term: 'CloudFormation StackSets', def: 'A feature that deploys and manages a single template across many accounts and Regions from one operation.' },
        { term: 'AWS RAM', def: 'Resource Access Manager — shares specific resources (subnets, Transit Gateways, Resolver rules) across accounts and OUs.' },
        { term: 'Blue/green deployment', def: 'Releasing to a parallel new environment and shifting traffic, enabling fast rollback by shifting back.' },
        { term: 'Canary deployment', def: 'Routing a small percentage of traffic to a new version first to validate it before full rollout.' },
        { term: 'Terraform', def: 'A provider-agnostic third-party IaC tool with its own state file and HCL language, common in multi-cloud environments.' },
      ],
      awsServices: [
        { name: 'AWS CloudFormation StackSets', purpose: 'Deploys one template across many accounts and Regions centrally, with Organizations integration for auto-deployment.' },
        { name: 'AWS Resource Access Manager', purpose: 'Shares specific resources across accounts and organizations without duplicating them.' },
        { name: 'AWS CodeDeploy', purpose: 'Automates application deployments using in-place, rolling, blue/green, and canary strategies.' },
      ],
      examTips: [
        'Same template across many accounts/Regions, centrally managed → StackSets (with Organizations for auto-enroll).',
        'Share an existing resource (subnet, Transit Gateway, Resolver rule) across accounts → AWS RAM.',
        'Instant rollback + zero downtime → blue/green. Validate on a small slice first → canary.',
        'RAM shares the resource; cross-account IAM role grants the ability to act. Do not conflate them.',
        'Terraform = multi-cloud, external state; CloudFormation/CDK = AWS-native, integrated (StackSets, drift, change sets).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Deployment, Provisioning & Automation',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.2',
      title: 'Automating Existing Resources — Systems Manager and Event-Driven Automation',
      duration: 30,
      summary: 'Once resources exist, the job becomes keeping them patched, configured, and self-managing. This session covers the Systems Manager toolbox — Fleet Manager, State Manager, Patch Manager, Maintenance Windows, Run Command, and Parameter Store — and event-driven automation with Lambda and S3 event notifications.',
      objectives: [
        'Operate fleets at scale with Systems Manager (Run Command, State Manager, Patch Manager)',
        'Schedule disruptive operations safely with Maintenance Windows',
        'Store configuration and secrets references in Parameter Store',
        'Build event-driven automation with Lambda and S3 Event Notifications',
      ],
      preLearningCheck: {
        question: 'An operations team must apply OS patches to hundreds of EC2 instances on a defined schedule, with compliance reporting, and without SSH access to each box. Which Systems Manager capability fits?',
        options: [
          'Patch Manager with a Maintenance Window',
          'CloudFormation drift detection',
          'A single Lambda function triggered manually',
          'EC2 detailed monitoring',
        ],
        correct: 0,
        note: 'Patch Manager automates patching across a fleet with baselines and compliance reporting, and a Maintenance Window schedules it during an approved time — no per-instance SSH required.',
      },
      sections: [
        {
          heading: 'The Systems Manager toolbox',
          body: 'AWS Systems Manager (SSM) is the operations Swiss-army knife for managing existing fleets. Its capabilities work through the SSM Agent (preinstalled on most AMIs) and an instance role, so you manage servers without opening SSH or RDP.',
          table: {
            headers: ['Capability', 'What it does', 'Use it for'],
            rows: [
              ['Run Command', 'Execute commands/scripts across many instances', 'Ad-hoc fleet operations without SSH'],
              ['State Manager', 'Enforce a desired configuration state continuously', 'Keep agents installed, settings consistent (anti-drift)'],
              ['Patch Manager', 'Automate OS/app patching with baselines + compliance', 'Scheduled, reported fleet patching'],
              ['Session Manager', 'Browser/CLI shell with no open inbound ports', 'Secure, audited access without bastions or SSH keys'],
              ['Fleet Manager', 'Manage servers from a console UI', 'Inventory and remote management at a glance'],
            ],
          },
          callout: { type: 'tip', text: 'Session Manager is the exam\'s preferred answer for "access an instance without opening port 22 / without a bastion host" — it is auditable and needs no inbound rules.' },
        },
        {
          heading: 'Maintenance Windows and Run Command',
          body: 'Disruptive operations — patching, restarts, deployments — should happen in approved windows, not whenever an alarm fires. A Maintenance Window defines a recurring schedule and the tasks (Run Command documents, Automation runbooks) to execute, with concurrency and error thresholds to bound risk.',
          bullets: [
            'Maintenance Windows schedule when automation runs; Run Command/Automation define what runs.',
            'Concurrency and error-tolerance settings limit how many instances are touched at once and stop on too many failures.',
            'Targets are chosen by tag or resource group so the right fleet is affected.',
            'Pair Patch Manager + Maintenance Window for compliant, scheduled patching across the fleet.',
          ],
        },
        {
          heading: 'Parameter Store for configuration',
          body: 'Systems Manager Parameter Store provides hierarchical storage for configuration data and secrets references. Applications read parameters at runtime instead of hard-coding values, and SecureString parameters are encrypted with KMS.',
          bullets: [
            'Standard parameters are free and ample for most configuration; SecureString encrypts sensitive values with KMS.',
            'For secrets needing automatic rotation, AWS Secrets Manager is the richer choice (covered in the security domain).',
            'Parameters can be referenced directly by CloudFormation, ECS task definitions, and Lambda.',
            'Versioning and hierarchies (/app/prod/db-url) keep configuration organized across environments.',
          ],
          callout: { type: 'note', text: 'Parameter Store SecureString vs Secrets Manager: both store secrets encrypted, but Secrets Manager adds built-in automatic rotation. "Needs automatic rotation" → Secrets Manager.' },
        },
        {
          heading: 'Event-driven automation',
          body: 'Beyond scheduled and ad-hoc operations, the strongest automation reacts to events as they happen. AWS Lambda runs code in response to triggers with no servers to manage; S3 Event Notifications fire when objects are created or deleted.',
          bullets: [
            'S3 Event Notifications → Lambda (or SQS/SNS/EventBridge): process an upload, generate a thumbnail, kick off a pipeline.',
            'EventBridge (from the monitoring domain) routes a much broader set of events to Lambda and other targets.',
            'Lambda is the glue for custom operational logic that no managed service performs out of the box.',
            'Event-driven beats polling: you act the instant something happens, paying only when it does.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security policy forbids opening inbound port 22 and prohibits bastion hosts, yet engineers still need shell access to troubleshoot EC2 instances, with full audit logging. Which Systems Manager feature fits?',
          options: [
            'Run Command only',
            'Session Manager',
            'Patch Manager',
            'Parameter Store',
          ],
          correct: 1,
          explainCorrect: 'Correct — Session Manager provides an audited shell to instances without any open inbound ports or bastion hosts, satisfying both the security and audit requirements.',
          elaborativePrompt: 'Why is Session Manager more secure than opening SSH even with key pairs? Think about attack surface, key management, and auditability.',
        },
        {
          afterSection: 3,
          question: 'Every time a user uploads an image to an S3 bucket, a thumbnail must be generated automatically with no servers to manage. Which design fits best?',
          options: [
            'Poll the bucket every minute with a cron job on an EC2 instance',
            'An S3 Event Notification that triggers a Lambda function to generate the thumbnail',
            'A scheduled Maintenance Window',
            'A CloudFormation stack update',
          ],
          correct: 1,
          explainCorrect: 'Correct — an S3 Event Notification triggering Lambda processes each upload the moment it happens, serverless and pay-per-use, with no polling.',
          elaborativePrompt: 'Why is event-driven (S3 → Lambda) better than polling the bucket on a schedule, in both latency and cost?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would patch a fleet of 200 instances on the second Sunday of each month, keep an agent installed on every instance continuously, and give engineers audited shell access with no open ports — naming the Systems Manager capability for each requirement.',
      sample: {
        type: 'multiple-choice',
        stem: 'A CloudOps team must patch 300 EC2 instances monthly during an approved two-hour window, produce patch-compliance reports, and avoid opening SSH on any instance. Which combination meets all requirements with the least custom scripting?',
        options: [
          'Write a custom shell script and copy it to each instance over SSH',
          'Use Systems Manager Patch Manager with patch baselines, scheduled by a Maintenance Window, reporting compliance centrally',
          'Trigger a Lambda function manually for each instance',
          'Take an EBS snapshot of each instance and restore it patched',
        ],
        correct: 1,
        explanation: {
          summary: 'Patch Manager automates fleet patching with baselines and built-in compliance reporting; a Maintenance Window confines it to the approved schedule — all through the SSM Agent with no SSH.',
          perOption: [
            'Custom SSH scripting is exactly the manual, port-opening toil the requirements forbid and does not produce compliance reporting.',
            'Correct — Patch Manager plus a Maintenance Window delivers scheduled, reported, agent-based patching across the fleet with no inbound SSH.',
            'Manually invoking Lambda per instance does not scale to 300 instances and provides no patch baseline or compliance model.',
            'Snapshot-and-restore is a backup workflow, not a patching mechanism, and does not patch running software cleanly.',
          ],
          link: 'Domain 3 · Task 3.2 — Automate the management of existing resources',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers Systems Manager (Run Command, Patch Manager, Session Manager) and event-driven automation.' },
      ],
      keyTerms: [
        { term: 'Systems Manager Run Command', def: 'Executes commands or scripts across many instances at once without SSH.' },
        { term: 'State Manager', def: 'Continuously enforces a desired configuration state on instances to prevent drift.' },
        { term: 'Patch Manager', def: 'Automates OS/application patching across a fleet using baselines, with compliance reporting.' },
        { term: 'Session Manager', def: 'Provides audited shell access to instances with no open inbound ports or bastion hosts.' },
        { term: 'Parameter Store', def: 'Hierarchical storage for configuration values and SecureString secrets, encrypted with KMS.' },
      ],
      awsServices: [
        { name: 'AWS Systems Manager', purpose: 'Manages fleets at scale: Run Command, State Manager, Patch Manager, Maintenance Windows, Session Manager, and Parameter Store.' },
        { name: 'AWS Lambda', purpose: 'Runs event-driven code with no servers to manage — the glue for custom operational automation.' },
        { name: 'Amazon S3 Event Notifications', purpose: 'Fires events on object create/delete to trigger Lambda, SQS, SNS, or EventBridge.' },
      ],
      examTips: [
        'Access an instance with no open port 22 / no bastion → Session Manager (audited, no inbound rules).',
        'Scheduled, reported fleet patching → Patch Manager + Maintenance Window.',
        'Keep configuration consistent / anti-drift on a fleet → State Manager.',
        'SecureString in Parameter Store vs Secrets Manager: need automatic rotation → Secrets Manager.',
        'React to an upload instantly with no servers → S3 Event Notification → Lambda (not polling).',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — SECURITY AND COMPLIANCE (16%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s11',
      number: 11,
      module: 'Domain 4 · Security & Compliance',
      domain: 'd4',
      weight: '16%',
      task: 'Task 4.1',
      title: 'IAM Operations — Access, MFA, Federation, and Troubleshooting',
      duration: 30,
      summary: 'Security operations start with identity. This session covers operating IAM day to day — users, roles, MFA, policy evaluation, and multi-account guardrails with Organizations and SCPs — and, crucially for this exam, troubleshooting "why is this access denied?" with Access Analyzer, the policy simulator, and CloudTrail.',
      objectives: [
        'Apply IAM features operationally — password policies, MFA, roles, resource policies, and conditions',
        'Reason through policy evaluation: explicit deny, SCP boundaries, and least privilege',
        'Troubleshoot access issues with IAM Access Analyzer, the policy simulator, and CloudTrail',
        'Enforce multi-account guardrails with AWS Organizations and service control policies',
      ],
      preLearningCheck: {
        question: 'A developer has an IAM policy that allows s3:GetObject, yet calls still fail with AccessDenied. The account is in an OU with a service control policy. What is the most likely cause?',
        options: [
          'IAM policies always override SCPs, so the SCP is irrelevant',
          'An SCP (or explicit deny) is blocking the action — an SCP sets the maximum permissions regardless of the IAM allow',
          'The S3 bucket needs detailed monitoring enabled',
          'The developer must use the root user',
        ],
        correct: 1,
        note: 'SCPs cap what any identity in the account can do. An IAM allow cannot exceed the SCP boundary, and any explicit deny wins. This is the classic multi-account "allowed but still denied" scenario.',
      },
      sections: [
        {
          heading: 'Operating IAM',
          body: 'You built the IAM mental model conceptually; operations is about running it safely. Enforce strong authentication, prefer roles over long-lived keys, and use conditions to tighten access to exactly what is needed.',
          bullets: [
            'Enforce an account password policy and require MFA for privileged actions and the root user.',
            'Prefer IAM roles (temporary STS credentials) for workloads and cross-account access over IAM users with access keys.',
            'Policy conditions (aws:SourceIp, aws:MultiFactorAuthPresent, aws:PrincipalTag) scope access by context.',
            'Resource policies (S3 bucket policy, KMS key policy) name who may use a resource — needed for cross-account access.',
          ],
        },
        {
          heading: 'How a request is actually evaluated',
          body: 'Most access-denied troubleshooting comes down to knowing the evaluation order. AWS denies by default, then combines all applicable policies. An explicit Deny anywhere always wins.',
          bullets: [
            'Default deny → an allow must come from an identity-based or resource-based policy.',
            'An explicit Deny in ANY policy (identity, resource, SCP, boundary, session) overrides every Allow.',
            'SCPs and permission boundaries set the maximum permissions — they grant nothing, they only cap.',
            'Effective permissions = (what an Allow grants) ∩ (SCP) ∩ (permission boundary), minus any explicit Deny.',
          ],
          callout: { type: 'tip', text: '"Allowed by IAM but still denied" almost always means an explicit deny, an SCP boundary, a permission boundary, or a resource policy that does not grant the cross-account principal. Check those four.' },
        },
        {
          heading: 'Troubleshooting access',
          body: 'This exam expects you to diagnose access problems with the right tool, not by trial and error.',
          table: {
            headers: ['Tool', 'What it answers', 'Use when'],
            rows: [
              ['IAM policy simulator', 'Would this policy allow this action on this resource?', 'Test permissions before/while debugging a denial'],
              ['IAM Access Analyzer', 'Which resources are shared with external entities?', 'Find unintended public/cross-account access'],
              ['CloudTrail', 'Who made which API call, when, and what was the result?', 'Investigate what actually happened and why it failed'],
              ['Last accessed data', 'Which permissions has this identity actually used?', 'Tighten toward least privilege'],
            ],
          },
        },
        {
          heading: 'Multi-account guardrails',
          body: 'At scale, you govern many accounts with AWS Organizations. Service control policies (SCPs) set guardrails that even account administrators cannot exceed — the backbone of preventive security across an organization.',
          bullets: [
            'SCPs restrict the maximum permissions for accounts/OUs (e.g. deny use of unapproved Regions, deny disabling CloudTrail).',
            'SCPs affect IAM principals in member accounts but never the management account and never grant permissions.',
            'IAM Identity Center provides centralized workforce sign-on and permission sets across accounts.',
            'Federation lets users sign in with an external identity provider (SAML/OIDC) and assume roles — no per-user IAM users.',
          ],
          callout: { type: 'note', text: 'SCP = guardrail (maximum), IAM policy = grant (within the guardrail). To stop every account from using a Region regardless of local admin rights, an SCP is the only control that works.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A security engineer needs to know whether any S3 bucket or IAM role in the account is unintentionally shared with an external AWS account or the public. Which tool surfaces this directly?',
          options: [
            'IAM Access Analyzer',
            'Amazon CloudWatch',
            'The IAM policy simulator',
            'AWS Budgets',
          ],
          correct: 0,
          explainCorrect: 'Correct — IAM Access Analyzer continuously identifies resources (S3 buckets, roles, KMS keys, and more) shared with external entities, flagging unintended external access.',
          elaborativePrompt: 'Why is Access Analyzer better for finding external sharing than reading each resource policy by hand? What does it analyze that a human review easily misses?',
        },
        {
          afterSection: 3,
          question: 'A company must guarantee that no IAM user or role in any member account can launch resources outside approved Regions, even if a local admin grants the permission. Which control enforces this?',
          options: [
            'A permission boundary on each user',
            'A service control policy (SCP) on the organizational unit denying non-approved Regions',
            'A security group rule',
            'An S3 bucket policy',
          ],
          correct: 1,
          explainCorrect: 'Correct — an SCP on the OU caps permissions for every principal in those accounts, so even an admin-granted allow cannot exceed the guardrail.',
          elaborativePrompt: 'Why can a local account administrator not override an SCP, and how does that make SCPs a preventive (not just detective) control?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself the full evaluation of an API request that has an IAM allow but still returns AccessDenied. Walk through default deny, the role of an explicit deny, how an SCP and a permission boundary cap the result, and which tool you would use to confirm the cause.',
      sample: {
        type: 'multiple-choice',
        stem: 'An IAM role has a policy that explicitly allows dynamodb:PutItem, but applications using the role receive AccessDenied. The account belongs to an organizational unit governed by a service control policy. Which step best identifies the cause?',
        options: [
          'Add the dynamodb:PutItem permission again to the same policy',
          'Check whether the SCP (or an explicit deny) restricts DynamoDB for the account, since an SCP caps the role’s effective permissions',
          'Switch the application to use the root user',
          'Enable detailed monitoring on the DynamoDB table',
        ],
        correct: 1,
        explanation: {
          summary: 'When an identity policy allows an action but it is still denied, an SCP boundary or an explicit deny is the usual cause — the SCP sets the maximum permissions the role can ever have.',
          perOption: [
            'Re-adding an allow that already exists changes nothing; the block is above the identity policy.',
            'Correct — the SCP (or any explicit deny) caps effective permissions regardless of the IAM allow, so it is the first thing to inspect.',
            'Using the root user is dangerous and does not diagnose the policy boundary; it also would not apply to the application.',
            'Detailed monitoring concerns metrics, not authorization, and has no effect on the AccessDenied result.',
          ],
          link: 'Domain 4 · Task 4.1 — Implement and manage security and compliance tools and policies',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers IAM operations, policy evaluation, Organizations/SCPs, and access troubleshooting.' },
      ],
      keyTerms: [
        { term: 'Service control policy (SCP)', def: 'An Organizations guardrail that sets the maximum permissions for accounts/OUs; it caps but never grants.' },
        { term: 'Permission boundary', def: 'An advanced IAM feature that limits the maximum permissions an identity-based policy can grant to a principal.' },
        { term: 'IAM Access Analyzer', def: 'A service that identifies resources shared with external entities, flagging unintended external access.' },
        { term: 'IAM policy simulator', def: 'A tool that tests whether a set of policies would allow or deny a specific action on a resource.' },
        { term: 'Federation', def: 'Signing in with an external identity provider (SAML/OIDC) to assume roles, avoiding per-user IAM users.' },
      ],
      awsServices: [
        { name: 'AWS IAM', purpose: 'Manages identities, policies, MFA, and conditions; the policy simulator and last-accessed data aid least-privilege and troubleshooting.' },
        { name: 'AWS Organizations', purpose: 'Centrally governs multiple accounts and applies SCP guardrails across OUs.' },
        { name: 'IAM Access Analyzer', purpose: 'Continuously identifies external and public access to resources to catch unintended sharing.' },
        { name: 'AWS CloudTrail', purpose: 'Records API calls (who/what/when/result) — the audit trail for investigating access and changes.' },
      ],
      examTips: [
        'Explicit Deny always wins. An IAM allow cannot exceed an SCP or permission-boundary cap.',
        '"Allowed by IAM but still denied" → check SCP, permission boundary, explicit deny, and resource policy.',
        'Find unintended external/public sharing → IAM Access Analyzer. Test a permission → policy simulator.',
        'Investigate what actually happened on an API call → CloudTrail.',
        'Enforce a rule across all member accounts regardless of local admins → SCP (preventive guardrail).',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s12',
      number: 12,
      module: 'Domain 4 · Security & Compliance',
      domain: 'd4',
      weight: '16%',
      task: 'Task 4.1',
      title: 'Compliance Operations — Trusted Advisor, AWS Config, and Region Controls',
      duration: 30,
      summary: 'Compliance is an operational discipline: continuously checking that resources match policy and remediating when they drift. This session covers Trusted Advisor checks, AWS Config rules and conformance packs for continuous compliance, and enforcing requirements like approved Regions and services.',
      objectives: [
        'Use AWS Trusted Advisor checks (including security) to find and remediate issues',
        'Continuously evaluate compliance with AWS Config rules and conformance packs',
        'Auto-remediate non-compliant resources with Config + SSM Automation',
        'Enforce compliance requirements such as approved Regions and services',
      ],
      preLearningCheck: {
        question: 'An auditor requires continuous evidence that every EBS volume in the account is encrypted, with automatic flagging the moment a non-compliant volume appears. Which service is designed for this?',
        options: [
          'AWS Trusted Advisor run manually each quarter',
          'AWS Config with a managed rule evaluating EBS encryption',
          'Amazon CloudWatch dashboards',
          'AWS Budgets',
        ],
        correct: 1,
        note: 'AWS Config continuously records resource configurations and evaluates them against rules, flagging non-compliance as it happens and keeping a compliance history — exactly what continuous evidence requires.',
      },
      sections: [
        {
          heading: 'Trusted Advisor — best-practice checks',
          body: 'AWS Trusted Advisor inspects your account against best practices across five categories: cost optimization, performance, security, fault tolerance, and service limits. It is point-in-time guidance you act on, not a continuous enforcement engine.',
          bullets: [
            'Security checks flag issues like open security groups, public S3 buckets, MFA on root, and exposed access keys.',
            'Service-limit checks warn before you hit quotas that would block scaling.',
            'The full check set requires a Business or Enterprise Support plan; Basic/Developer get a limited set.',
            'Trusted Advisor recommends; it does not automatically remediate (that is Config + automation).',
          ],
          callout: { type: 'note', text: 'Trusted Advisor = recommendations across cost/performance/security/fault-tolerance/limits. Config = continuous compliance evaluation with history and auto-remediation. The exam separates "advice" from "enforcement".' },
        },
        {
          heading: 'AWS Config — continuous compliance',
          body: 'AWS Config records the configuration of your resources over time and evaluates them against rules. It answers "is this resource compliant right now, and was it compliant last Tuesday?" — the backbone of continuous compliance and change auditing.',
          bullets: [
            'Config rules (AWS-managed or custom) evaluate resources (e.g. "S3 buckets must block public access").',
            'The configuration timeline shows every change to a resource and when it happened — invaluable for audits and root cause.',
            'Conformance packs bundle many rules (and remediations) into a deployable compliance framework.',
            'Config aggregators roll up compliance across many accounts and Regions into one view.',
          ],
        },
        {
          heading: 'Auto-remediation',
          body: 'Detection is only half of compliance; the exam rewards closing the loop. AWS Config can attach a remediation action — typically an SSM Automation runbook — that fires when a resource is found non-compliant.',
          bullets: [
            'Config rule detects non-compliance → triggers an SSM Automation runbook → resource is corrected automatically.',
            'Example: a public S3 bucket is detected and a runbook re-enables Block Public Access.',
            'Remediation can be automatic or require manual approval, depending on risk.',
            'This is the same detect→act pattern from the monitoring domain, applied to compliance.',
          ],
          callout: { type: 'tip', text: 'Continuous compliance with automatic correction → AWS Config rule + SSM Automation remediation. Trusted Advisor cannot remediate on its own.' },
        },
        {
          heading: 'Enforcing Region and service requirements',
          body: 'Many compliance regimes restrict where data may live and which services may run. The exam expects you to enforce these preventively, not just detect violations after the fact.',
          bullets: [
            'Use an SCP to deny actions outside approved Regions or to deny disallowed services org-wide (preventive).',
            'Use AWS Config rules to detect and report resources in disallowed Regions/services (detective).',
            'AWS Audit Manager helps collect evidence and map controls to frameworks for audits.',
            'Combine preventive (SCP) and detective (Config) controls for defense in depth.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'During an audit you must show the exact moment a security group was changed to allow 0.0.0.0/0 and its full configuration history. Which service provides this timeline?',
          options: [
            'AWS Trusted Advisor',
            'AWS Config configuration timeline',
            'Amazon QuickSight',
            'AWS Budgets',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Config records every configuration change with timestamps, so its configuration timeline shows exactly when the security group was opened and what changed.',
          elaborativePrompt: 'Why is Config\'s configuration history better evidence for an auditor than a current snapshot of the resource? What does the timeline prove that a point-in-time view cannot?',
        },
        {
          afterSection: 2,
          question: 'A company wants any S3 bucket that becomes publicly accessible to be automatically locked down again, with minimal custom code. Which approach fits?',
          options: [
            'A Trusted Advisor weekly email to the security team',
            'An AWS Config rule that triggers an SSM Automation remediation to re-enable Block Public Access',
            'A CloudWatch dashboard showing public buckets',
            'A manual quarterly review',
          ],
          correct: 1,
          explainCorrect: 'Correct — a Config rule detects the public bucket and an attached SSM Automation runbook re-enables Block Public Access automatically, closing the loop with little code.',
          elaborativePrompt: 'How does pairing Config (detect) with SSM Automation (act) turn a detective control into a self-healing one? When might you require manual approval instead?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would prove to an auditor that all resources stay compliant and self-correct: which service continuously evaluates configuration, how you would auto-remediate a violation, and which control you would add to prevent resources from ever being created in a disallowed Region.',
      sample: {
        type: 'multiple-choice',
        stem: 'A regulated company must continuously verify that all RDS instances are encrypted and automatically remediate any that are not, while keeping an auditable history of compliance. Which solution meets these requirements?',
        options: [
          'Run AWS Trusted Advisor manually each month and email findings',
          'Use an AWS Config managed rule for RDS encryption with an SSM Automation remediation action, retaining Config’s compliance history',
          'Create a CloudWatch alarm on RDS CPU utilization',
          'Enable S3 versioning on the audit bucket',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS Config continuously evaluates the encryption rule, records a compliance timeline for auditors, and can auto-remediate via SSM Automation — covering verification, remediation, and history.',
          perOption: [
            'Trusted Advisor is periodic, manual, and cannot remediate or provide a continuous compliance timeline.',
            'Correct — a Config rule plus SSM Automation remediation delivers continuous evaluation, automatic correction, and an auditable history.',
            'A CPU alarm measures performance, not encryption compliance, and does nothing to remediate.',
            'S3 versioning protects objects from overwrite; it does not evaluate or remediate RDS encryption.',
          ],
          link: 'Domain 4 · Task 4.1 — Implement remediation and enforce compliance requirements',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers Trusted Advisor, AWS Config rules and remediation, and compliance enforcement.' },
      ],
      keyTerms: [
        { term: 'AWS Trusted Advisor', def: 'A service that checks an account against best practices across cost, performance, security, fault tolerance, and service limits.' },
        { term: 'AWS Config rule', def: 'A managed or custom evaluation that continuously checks whether resources comply with a desired configuration.' },
        { term: 'Conformance pack', def: 'A deployable bundle of Config rules and remediations representing a compliance framework.' },
        { term: 'Config configuration timeline', def: 'A history of every change to a resource over time, used for auditing and root-cause analysis.' },
        { term: 'Auto-remediation', def: 'A Config remediation action (often an SSM Automation runbook) that corrects a non-compliant resource automatically.' },
      ],
      awsServices: [
        { name: 'AWS Config', purpose: 'Continuously records and evaluates resource configurations against rules, with history, conformance packs, and auto-remediation.' },
        { name: 'AWS Trusted Advisor', purpose: 'Provides best-practice recommendations across five categories, including security and service limits.' },
        { name: 'AWS Audit Manager', purpose: 'Collects evidence and maps controls to compliance frameworks to streamline audits.' },
      ],
      examTips: [
        'Trusted Advisor = point-in-time best-practice advice. AWS Config = continuous compliance with history + remediation.',
        'Need a configuration-change timeline for an auditor → AWS Config.',
        'Continuous compliance + automatic correction → Config rule + SSM Automation remediation.',
        'Prevent resource creation in disallowed Regions/services → SCP (preventive). Detect/report it → Config (detective).',
        'Full Trusted Advisor check set needs Business/Enterprise Support.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s13',
      number: 13,
      module: 'Domain 4 · Security & Compliance',
      domain: 'd4',
      weight: '16%',
      task: 'Task 4.2',
      title: 'Protecting Data — KMS, ACM, Secrets, and the Detection Services',
      duration: 30,
      summary: 'This session covers protecting data and infrastructure operationally: encryption at rest with KMS, encryption in transit with ACM, secure secret storage with Secrets Manager, and the four detection services the exam loves to confuse — GuardDuty, Inspector, Macie, and Security Hub.',
      objectives: [
        'Implement and troubleshoot encryption at rest with AWS KMS (keys, policies, rotation)',
        'Implement encryption in transit with AWS Certificate Manager (ACM)',
        'Store and rotate secrets securely with AWS Secrets Manager',
        'Distinguish GuardDuty, Inspector, Macie, and Security Hub and route their findings',
      ],
      preLearningCheck: {
        question: 'A team needs database credentials that rotate automatically every 30 days, are never hard-coded, and are retrieved by the application at runtime. Which service is the best fit?',
        options: [
          'Store them in an environment variable on the instance',
          'AWS Secrets Manager',
          'A plaintext file in an S3 bucket',
          'A CloudWatch log group',
        ],
        correct: 1,
        note: 'Secrets Manager stores secrets encrypted with KMS and provides built-in automatic rotation (including native integration with RDS) — exactly the rotation-plus-runtime-retrieval requirement.',
      },
      sections: [
        {
          heading: 'Encryption at rest with KMS',
          body: 'AWS Key Management Service (KMS) creates and controls the encryption keys that protect data at rest across AWS services. The exam expects you to understand key types, who can use a key, and common troubleshooting.',
          bullets: [
            'Most services integrate with KMS: encrypt an EBS volume, S3 object, RDS database, or snapshot by selecting a KMS key.',
            'Customer-managed keys give you control over the key policy, rotation, and grants; AWS-managed keys are simpler but less flexible.',
            'Automatic annual key rotation is available for customer-managed keys; the key policy plus IAM controls who can use the key.',
            'Troubleshooting "access denied" on encrypted data: the caller usually lacks kms:Decrypt permission on the key, or the key policy does not allow the principal — both the data permission AND the key permission are required.',
          ],
          callout: { type: 'tip', text: 'A user can read an S3 object\'s permissions yet still get AccessDenied because they lack kms:Decrypt on the bucket\'s KMS key. Encrypted data needs both resource access and key access.' },
        },
        {
          heading: 'Encryption in transit with ACM',
          body: 'AWS Certificate Manager (ACM) provisions, manages, and renews SSL/TLS certificates used to encrypt data in transit. ACM certificates are commonly attached to load balancers, CloudFront, and API Gateway.',
          bullets: [
            'ACM auto-renews certificates it issues, removing the classic "the cert expired and the site went down" outage.',
            'Attach an ACM certificate to an ALB/NLB or CloudFront distribution to terminate TLS.',
            'ACM public certificates are free; private CAs (ACM Private CA) cover internal PKI.',
            'A common operational fix: an expiring certificate not auto-renewed because DNS validation records were removed — restore validation.',
          ],
        },
        {
          heading: 'Secrets management',
          body: 'Hard-coded credentials are a top security failure. AWS provides two encrypted stores; choosing between them is a recurring exam point.',
          table: {
            headers: ['Need', 'Use', 'Why'],
            rows: [
              ['Secrets with automatic rotation', 'AWS Secrets Manager', 'Built-in rotation (native for RDS), fine-grained access, audit'],
              ['Simple config + occasional secrets', 'SSM Parameter Store (SecureString)', 'Free standard tier, KMS-encrypted, no built-in rotation'],
              ['Database/API credentials at runtime', 'AWS Secrets Manager', 'Apps fetch on demand; nothing stored in code'],
            ],
          },
          callout: { type: 'note', text: 'Secrets Manager vs Parameter Store SecureString: both encrypt with KMS. The deciding factor is automatic rotation — if the question stresses rotating credentials, it is Secrets Manager.' },
        },
        {
          heading: 'The detection services — do not confuse them',
          body: 'Four AWS services find security problems, and the exam routinely tests which one does what. Learn the one-line role of each, then how Security Hub ties them together.',
          bullets: [
            'Amazon GuardDuty: intelligent threat detection from logs (VPC flow, DNS, CloudTrail) — finds malicious or anomalous activity (e.g. crypto-mining, compromised credentials).',
            'Amazon Inspector: automated vulnerability management — scans EC2, container images, and Lambda for CVEs and unintended network exposure.',
            'Amazon Macie: discovers and classifies sensitive data (PII) in S3 using machine learning.',
            'AWS Security Hub: aggregates findings from GuardDuty, Inspector, Macie, and Config into one prioritized dashboard and runs security-standard checks.',
          ],
          callout: { type: 'tip', text: 'Threat/anomaly in activity → GuardDuty. Software vulnerabilities/CVEs → Inspector. Sensitive data (PII) in S3 → Macie. One pane aggregating all findings → Security Hub.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A user has s3:GetObject permission on a bucket but receives AccessDenied when downloading objects encrypted with a customer-managed KMS key. What is the most likely fix?',
          options: [
            'Make the bucket public',
            'Grant the user kms:Decrypt on the KMS key (via the key policy/IAM)',
            'Enable S3 Transfer Acceleration',
            'Switch the bucket to a different Region',
          ],
          correct: 1,
          explainCorrect: 'Correct — reading KMS-encrypted objects requires kms:Decrypt on the key in addition to S3 read permission. Granting the key permission resolves the denial.',
          elaborativePrompt: 'Why does AWS require both the data permission and the key permission to read encrypted data? What attack does separating them prevent?',
        },
        {
          afterSection: 3,
          question: 'Security wants to be alerted when an EC2 instance starts communicating with a known cryptocurrency-mining domain — anomalous, threat-like behavior. Which service detects this?',
          options: [
            'Amazon Inspector',
            'Amazon GuardDuty',
            'Amazon Macie',
            'AWS Certificate Manager',
          ],
          correct: 1,
          explainCorrect: 'Correct — GuardDuty analyzes VPC flow, DNS, and CloudTrail logs to detect malicious or anomalous activity such as communication with mining domains.',
          elaborativePrompt: 'In one sentence each, distinguish what GuardDuty, Inspector, and Macie would each catch. Why would Inspector miss the mining-domain activity?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would secure a new application end to end: encrypt its database at rest, serve it over TLS without manual cert renewals, store its database password so it rotates automatically, and detect both software vulnerabilities and threat activity — naming the AWS service for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'An application stores its database password in plaintext in a configuration file. Security requires that the credential be encrypted, rotated automatically every 30 days, and retrieved by the application at runtime without code changes on each rotation. Which solution meets these requirements?',
        options: [
          'Move the password into an environment variable on the instance',
          'Store the credential in AWS Secrets Manager with automatic rotation enabled and have the app fetch it at runtime',
          'Put the password in an SSM Parameter Store standard String parameter',
          'Encrypt the configuration file with KMS and leave the password inside it',
        ],
        correct: 1,
        explanation: {
          summary: 'Secrets Manager encrypts the credential with KMS, rotates it automatically (natively for databases like RDS), and serves it to the application at runtime, so rotation requires no code change.',
          perOption: [
            'An environment variable is still effectively a static, unrotated secret on the host — it meets none of the rotation requirements.',
            'Correct — Secrets Manager provides encryption, built-in automatic rotation, and runtime retrieval, satisfying every requirement.',
            'A standard String parameter is not encrypted and has no rotation; even SecureString lacks built-in automatic rotation.',
            'Encrypting the file still leaves a static password inside it with no rotation and manual handling.',
          ],
          link: 'Domain 4 · Task 4.2 — Implement strategies to protect data and infrastructure',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers KMS, ACM, Secrets Manager, and the GuardDuty/Inspector/Macie/Security Hub detection suite.' },
      ],
      keyTerms: [
        { term: 'AWS KMS', def: 'Key Management Service — creates and controls encryption keys for data at rest across AWS services.' },
        { term: 'AWS Certificate Manager (ACM)', def: 'Provisions and auto-renews SSL/TLS certificates for encryption in transit on load balancers, CloudFront, and API Gateway.' },
        { term: 'AWS Secrets Manager', def: 'Stores secrets encrypted with KMS and rotates them automatically, with runtime retrieval by applications.' },
        { term: 'Amazon GuardDuty', def: 'Threat detection that analyzes logs to find malicious or anomalous activity.' },
        { term: 'AWS Security Hub', def: 'Aggregates findings from GuardDuty, Inspector, Macie, and Config into one prioritized view with standard checks.' },
      ],
      awsServices: [
        { name: 'AWS KMS', purpose: 'Manages encryption keys and policies for at-rest encryption; kms:Decrypt is required to read encrypted data.' },
        { name: 'AWS Secrets Manager', purpose: 'Securely stores and automatically rotates secrets, with native database integration and runtime retrieval.' },
        { name: 'Amazon GuardDuty / Inspector / Macie', purpose: 'Detect threats (GuardDuty), vulnerabilities (Inspector), and sensitive data (Macie) respectively.' },
        { name: 'AWS Security Hub', purpose: 'Central aggregation and prioritization of security findings across the detection services and Config.' },
      ],
      examTips: [
        'Encrypted data needs BOTH resource access AND kms:Decrypt on the key. Missing key permission = AccessDenied.',
        'Auto-renewing TLS certs on ALB/CloudFront → ACM. Secrets with automatic rotation → Secrets Manager.',
        'GuardDuty = threats/anomalies; Inspector = vulnerabilities/CVEs; Macie = PII in S3; Security Hub = aggregation.',
        'Parameter Store SecureString vs Secrets Manager: rotation requirement → Secrets Manager.',
        'Customer-managed KMS keys give you key-policy control and optional annual rotation.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 5 — NETWORKING AND CONTENT DELIVERY (18%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd5-s14',
      number: 14,
      module: 'Domain 5 · Networking & Content Delivery',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.1',
      title: 'VPC Foundations — Subnets, Routing, Security, and Private Connectivity',
      duration: 30,
      summary: 'Networking is where operations gets concrete. This session builds the VPC mental model — subnets, route tables, gateways, and the two firewall layers — then covers private connectivity (endpoints, PrivateLink, peering, Transit Gateway) and how to keep network costs down.',
      objectives: [
        'Assemble a VPC from subnets, route tables, internet/NAT gateways, and IGWs',
        'Distinguish security groups (stateful) from network ACLs (stateless) and apply each',
        'Choose private connectivity: VPC endpoints, PrivateLink, peering, and Transit Gateway',
        'Reduce network cost through NAT and endpoint placement and data-transfer awareness',
      ],
      preLearningCheck: {
        question: 'EC2 instances in a private subnet must download OS updates from the internet but must not be reachable from the internet. Which component enables this?',
        options: [
          'An internet gateway attached directly to the private subnet',
          'A NAT gateway in a public subnet, with the private subnet routing 0.0.0.0/0 to it',
          'A security group rule allowing all inbound traffic',
          'A VPC peering connection',
        ],
        correct: 1,
        note: 'A NAT gateway lets private instances make outbound connections (e.g. for updates) while blocking unsolicited inbound traffic. It lives in a public subnet; the private subnet routes internet-bound traffic to it.',
      },
      sections: [
        {
          heading: 'The VPC building blocks',
          body: 'A VPC is your isolated network in AWS. Inside it, subnets segment the address space per Availability Zone, route tables decide where traffic goes, and gateways connect to the outside world. Whether a subnet is "public" or "private" is defined entirely by its route table.',
          bullets: [
            'A public subnet has a route to an internet gateway (IGW); a private subnet does not.',
            'An internet gateway provides bidirectional internet access for public subnets.',
            'A NAT gateway gives private subnets outbound-only internet access (it lives in a public subnet).',
            'An egress-only internet gateway is the IPv6 equivalent of NAT — outbound-only for IPv6.',
          ],
          interactive: 'vpc-troubleshooter',
        },
        {
          heading: 'The two firewall layers',
          body: 'A VPC has two stateless/stateful firewall layers, and telling them apart is one of the most tested distinctions on the exam.',
          table: {
            headers: ['', 'Security Group', 'Network ACL'],
            rows: [
              ['Level', 'Instance / ENI', 'Subnet'],
              ['State', 'Stateful (return traffic auto-allowed)', 'Stateless (must allow return explicitly)'],
              ['Rules', 'Allow only', 'Allow and Deny'],
              ['Evaluation', 'All rules evaluated', 'Numbered order, first match wins'],
            ],
          },
          callout: { type: 'tip', text: 'Stateful vs stateless is the crux. If outbound works but responses are dropped, suspect a stateless NACL missing an ephemeral-port return rule. To block a specific bad IP, you need a NACL deny — security groups cannot deny.' },
        },
        {
          heading: 'Private connectivity options',
          body: 'Operations often requires reaching AWS services or other VPCs without traversing the public internet. The exam wants you to match the connectivity need to the right construct.',
          bullets: [
            'VPC endpoints (Gateway): private access to S3 and DynamoDB via a route-table entry — no internet, no NAT cost.',
            'VPC endpoints (Interface / PrivateLink): private access to most AWS services and to SaaS/partner services via an ENI in your subnet.',
            'VPC peering: one-to-one private connectivity between two VPCs (non-transitive).',
            'Transit Gateway: a hub that connects many VPCs and on-premises networks at scale (transitive) — the answer when peering would become a mesh.',
          ],
          callout: { type: 'note', text: 'Two VPCs → peering. Many VPCs/accounts and on-prem in a hub → Transit Gateway. Private access to S3/DynamoDB → Gateway endpoint. Private access to other AWS/SaaS services → Interface endpoint (PrivateLink).' },
        },
        {
          heading: 'Network cost optimization',
          body: 'Networking quietly drives cost, and the exam includes a cost-optimization skill for it. The biggest levers are avoiding unnecessary NAT and data-transfer charges.',
          bullets: [
            'Gateway VPC endpoints for S3/DynamoDB remove NAT data-processing charges for that traffic — a common savings.',
            'Keep traffic within an AZ when possible; cross-AZ and cross-Region data transfer costs more.',
            'A single shared NAT gateway per AZ (rather than per subnet) balances cost and resilience.',
            'Data transfer OUT to the internet is the priciest direction; caching with CloudFront can reduce it.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'Outbound requests from an instance succeed, but the responses never arrive, and you confirm the security group allows the traffic. The subnet uses a custom network ACL. What is the most likely cause?',
          options: [
            'The security group is stateful and broken',
            'The network ACL is stateless and is missing an inbound allow rule for the ephemeral return ports',
            'The instance needs a public IP',
            'The route table points to a NAT gateway',
          ],
          correct: 1,
          explainCorrect: 'Correct — NACLs are stateless, so return traffic on ephemeral ports must be explicitly allowed inbound. A missing ephemeral-range rule drops the responses even when the security group is fine.',
          elaborativePrompt: 'Explain why a stateful security group never needs an explicit return rule, while a stateless NACL always does. What is the ephemeral port range and why does it matter here?',
        },
        {
          afterSection: 2,
          question: 'An organization has 30 VPCs across several accounts that all need to communicate, plus an on-premises data center. Managing individual peering connections has become unmanageable. Which service simplifies this?',
          options: [
            'More VPC peering connections',
            'AWS Transit Gateway',
            'A second internet gateway',
            'An interface VPC endpoint',
          ],
          correct: 1,
          explainCorrect: 'Correct — Transit Gateway is a transitive hub that connects many VPCs and on-premises networks centrally, replacing an unmanageable mesh of peering connections.',
          elaborativePrompt: 'Why does VPC peering not scale to dozens of VPCs (think about the number of connections and non-transitivity), and how does a hub-and-spoke Transit Gateway solve it?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how a two-tier app in a VPC routes traffic: how a public-subnet load balancer reaches the internet, how private-subnet instances get OS updates without being internet-reachable, and which firewall layer you would use to block a single malicious IP versus allow app traffic to one instance.',
      sample: {
        type: 'multiple-choice',
        stem: 'EC2 instances in a private subnet must retrieve objects from Amazon S3 without traversing the public internet, and the team wants to avoid NAT gateway data-processing charges for this traffic. Which solution best meets both goals?',
        options: [
          'Add a NAT gateway and route S3 traffic through it',
          'Create a Gateway VPC endpoint for S3 and add it to the private subnet’s route table',
          'Attach an internet gateway to the private subnet',
          'Set up VPC peering to a public VPC',
        ],
        correct: 1,
        explanation: {
          summary: 'A Gateway VPC endpoint for S3 provides private connectivity via a route-table entry, keeping traffic off the internet and avoiding NAT data-processing costs for S3 access.',
          perOption: [
            'Routing S3 traffic through a NAT gateway works but still incurs NAT data-processing charges — the opposite of the cost goal.',
            'Correct — a Gateway endpoint for S3 gives private, no-internet access and removes NAT charges for that traffic.',
            'Attaching an IGW to the private subnet would make it public and expose the instances — violating the private requirement.',
            'Peering to a public VPC does not provide private S3 access and adds needless complexity and cost.',
          ],
          link: 'Domain 5 · Task 5.1 — Implement and optimize networking features and connectivity',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers VPC subnets, routing, gateways, security groups vs NACLs, and private connectivity.' },
      ],
      keyTerms: [
        { term: 'NAT gateway', def: 'A managed gateway giving private-subnet instances outbound-only internet access; lives in a public subnet.' },
        { term: 'Security group', def: 'A stateful, allow-only firewall at the instance/ENI level; return traffic is automatically permitted.' },
        { term: 'Network ACL', def: 'A stateless, allow-and-deny firewall at the subnet level; return traffic must be allowed explicitly.' },
        { term: 'Gateway VPC endpoint', def: 'A route-table-based private connection to S3 or DynamoDB that avoids the internet and NAT charges.' },
        { term: 'Transit Gateway', def: 'A transitive hub connecting many VPCs and on-premises networks, replacing a peering mesh at scale.' },
      ],
      awsServices: [
        { name: 'Amazon VPC', purpose: 'Your isolated virtual network — subnets, route tables, gateways, and the two firewall layers.' },
        { name: 'AWS Transit Gateway', purpose: 'Hub that interconnects many VPCs and on-premises networks at scale with transitive routing.' },
        { name: 'AWS PrivateLink / VPC endpoints', purpose: 'Private connectivity to AWS and SaaS services without traversing the internet.' },
      ],
      examTips: [
        'Public vs private subnet is defined by the route table (route to IGW = public).',
        'Private outbound to internet → NAT gateway. Never attach an IGW to a private subnet.',
        'Security group = stateful, allow-only, instance level. NACL = stateless, allow+deny, subnet level.',
        'Block a specific bad IP → NACL deny (security groups cannot deny).',
        'S3/DynamoDB private + cheap → Gateway endpoint. Many VPCs + on-prem hub → Transit Gateway. Two VPCs → peering.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd5-s15',
      number: 15,
      module: 'Domain 5 · Networking & Content Delivery',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.2',
      title: 'DNS, Content Delivery, and Network Protection — Route 53, CloudFront, and the Edge',
      duration: 30,
      summary: 'This session covers steering and accelerating traffic at the edge: Route 53 routing policies and query logging, content distribution with CloudFront and Global Accelerator, and the network protection services — WAF, Shield, Network Firewall, and DNS Firewall.',
      objectives: [
        'Configure Route 53 DNS and choose the right routing policy for a goal',
        'Enable Route 53 query logging and understand resolver behavior',
        'Distribute and accelerate content with CloudFront and Global Accelerator',
        'Apply the network protection services (WAF, Shield, Network Firewall, DNS Firewall)',
      ],
      preLearningCheck: {
        question: 'A company wants users automatically directed to the AWS Region that gives them the lowest network latency. Which Route 53 routing policy fits?',
        options: [
          'Simple routing',
          'Latency-based routing',
          'Weighted routing',
          'Failover routing',
        ],
        correct: 1,
        note: 'Latency-based routing sends each user to the Region that provides the lowest latency for them. Weighted splits by ratio; failover is active-passive; simple returns a fixed record.',
      },
      sections: [
        {
          heading: 'Route 53 routing policies',
          body: 'Route 53 is AWS\'s DNS service, and its routing policies are heavily tested. Each policy answers a different traffic-steering goal; match the goal to the policy.',
          table: {
            headers: ['Policy', 'Steers by', 'Use for'],
            rows: [
              ['Simple', 'One record, no logic', 'A single resource'],
              ['Weighted', 'Percentage split across records', 'A/B testing, gradual migration'],
              ['Latency-based', 'Lowest latency Region for the user', 'Global apps optimizing performance'],
              ['Failover', 'Primary while healthy, else secondary', 'Active-passive HA/DR'],
              ['Geolocation', 'User’s geographic location', 'Content localization, data-sovereignty routing'],
              ['Multivalue answer', 'Several healthy records returned', 'Simple client-side load spreading with health checks'],
            ],
          },
          callout: { type: 'tip', text: 'Latency vs geolocation is a classic trap: latency optimizes for speed (nearest in network terms), geolocation routes by where the user physically is (for compliance/localization). Read which goal the question states.' },
        },
        {
          heading: 'Resolver and query logging',
          body: 'Beyond public DNS, Route 53 Resolver handles DNS resolution inside and across your VPCs and to on-premises networks, and query logging gives you visibility into DNS activity for security and troubleshooting.',
          bullets: [
            'Route 53 Resolver endpoints enable hybrid DNS — inbound (on-prem → AWS) and outbound (AWS → on-prem) resolution.',
            'Resolver query logging records the DNS queries from your VPCs — useful for detecting exfiltration and debugging resolution.',
            'Private hosted zones serve DNS records only within associated VPCs.',
            'Health checks on records drive failover routing decisions.',
          ],
        },
        {
          heading: 'CloudFront and Global Accelerator',
          body: 'Two services use the AWS edge network, but for different traffic. The exam expects you to pick correctly between them.',
          bullets: [
            'Amazon CloudFront: a CDN that caches HTTP(S) content at edge locations near users — best for websites, APIs, and static/streaming content; reduces latency and origin load.',
            'AWS Global Accelerator: routes TCP/UDP traffic over the AWS backbone to the optimal endpoint, providing static anycast IPs and fast regional failover — best for non-HTTP or whole-application acceleration.',
            'CloudFront caches; Global Accelerator does not cache — it accelerates and routes.',
            'CloudFront integrates with WAF and Shield at the edge for protection.',
          ],
          callout: { type: 'note', text: 'Cacheable web content → CloudFront. Non-HTTP (gaming, IoT, VoIP) or need static anycast IPs and instant regional failover → Global Accelerator.' },
        },
        {
          heading: 'Network protection services',
          body: 'The exam asks you to audit and apply AWS\'s layered network protections. Know what each defends against.',
          bullets: [
            'AWS WAF: filters HTTP(S) requests by rules (SQL injection, XSS, rate limiting, geo-block) on CloudFront, ALB, or API Gateway.',
            'AWS Shield: DDoS protection — Standard is automatic and free; Advanced adds enhanced mitigation, cost protection, and a response team.',
            'AWS Network Firewall: stateful network/protocol filtering for an entire VPC (IDS/IPS-style rules).',
            'Route 53 Resolver DNS Firewall: blocks DNS queries to malicious or disallowed domains from your VPCs.',
          ],
          callout: { type: 'tip', text: 'Layer 7 web exploits → WAF. DDoS → Shield. VPC-wide stateful traffic filtering → Network Firewall. Malicious domain lookups → DNS Firewall. Match the threat to the layer.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company must keep European users’ requests served only from EU Regions to satisfy data-residency rules, regardless of latency. Which Route 53 routing policy enforces this?',
          options: [
            'Latency-based routing',
            'Geolocation routing',
            'Weighted routing',
            'Simple routing',
          ],
          correct: 1,
          explainCorrect: 'Correct — geolocation routing directs users based on their physical location, so EU users can be pinned to EU Regions for data residency even if another Region were lower-latency.',
          elaborativePrompt: 'Why would latency-based routing be the wrong choice for a data-residency requirement, even though it also sends users to a nearby Region most of the time?',
        },
        {
          afterSection: 3,
          question: 'A public web application is being hit by SQL-injection attempts and needs request filtering at the edge in front of CloudFront. Which service fits?',
          options: [
            'AWS Shield Standard only',
            'AWS WAF with managed rules',
            'AWS Network Firewall',
            'Route 53 DNS Firewall',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS WAF filters HTTP(S) requests with rules (including managed rule groups for SQL injection and XSS) and attaches to CloudFront, ALB, and API Gateway.',
          elaborativePrompt: 'Distinguish what WAF, Shield, and Network Firewall each defend against. Why is WAF, not Shield, the answer for SQL injection?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself how you would deliver a global web app: which service caches content near users, which routing policy sends users to the lowest-latency Region, and which protections you would layer at the edge for web exploits and DDoS — naming each service and what it defends against.',
      sample: {
        type: 'multiple-choice',
        stem: 'A media company serves a global audience streaming video and static assets over HTTPS. They want lower latency, reduced origin load, and protection against common web exploits. Which combination best meets these goals?',
        options: [
          'AWS Global Accelerator with AWS Network Firewall',
          'Amazon CloudFront for content delivery with AWS WAF attached for request filtering',
          'Route 53 weighted routing with AWS Shield Standard only',
          'A single larger origin server in one Region',
        ],
        correct: 1,
        explanation: {
          summary: 'CloudFront caches HTTPS content at the edge to cut latency and origin load, and AWS WAF attached to the distribution filters common web exploits — directly matching all three goals.',
          perOption: [
            'Global Accelerator does not cache content (so it does not reduce origin load for static assets), and Network Firewall is VPC-level, not edge web filtering.',
            'Correct — CloudFront delivers and caches the content globally while WAF provides edge protection against web exploits.',
            'Weighted routing does not cache or reduce latency by proximity, and Shield Standard addresses DDoS, not web exploits like injection.',
            'A single larger origin removes the CDN benefit, keeps latency high for distant users, and adds no exploit protection.',
          ],
          link: 'Domain 5 · Task 5.2 — Configure domains, DNS services, and content delivery',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers Route 53 routing policies, CloudFront, Global Accelerator, and the network protection services.' },
      ],
      keyTerms: [
        { term: 'Latency-based routing', def: 'A Route 53 policy that sends each user to the Region giving them the lowest network latency.' },
        { term: 'Geolocation routing', def: 'A Route 53 policy that routes users by physical location, used for localization and data residency.' },
        { term: 'Amazon CloudFront', def: 'A CDN that caches HTTP(S) content at edge locations to reduce latency and origin load.' },
        { term: 'AWS Global Accelerator', def: 'Routes TCP/UDP traffic over the AWS backbone with static anycast IPs and fast regional failover; does not cache.' },
        { term: 'AWS WAF', def: 'A web application firewall that filters HTTP(S) requests by rules on CloudFront, ALB, and API Gateway.' },
      ],
      awsServices: [
        { name: 'Amazon Route 53', purpose: 'DNS with routing policies (simple, weighted, latency, failover, geolocation, multivalue), Resolver, and query logging.' },
        { name: 'Amazon CloudFront', purpose: 'Edge CDN that caches and accelerates HTTP(S) content and integrates with WAF and Shield.' },
        { name: 'AWS WAF / Shield / Network Firewall / DNS Firewall', purpose: 'Layered protection: web exploits, DDoS, VPC traffic filtering, and malicious domain blocking.' },
      ],
      examTips: [
        'Lowest latency → latency-based routing. Route by physical location/compliance → geolocation. A/B or migration → weighted.',
        'Cacheable HTTP(S) content → CloudFront. Non-HTTP or static anycast IPs + fast failover → Global Accelerator.',
        'Web exploits (SQLi/XSS/rate limit) → WAF. DDoS → Shield (Advanced for big targets).',
        'VPC-wide stateful filtering → Network Firewall. Block malicious domain lookups → Route 53 DNS Firewall.',
        'Route 53 Resolver query logging helps detect DNS-based exfiltration and debug resolution.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd5-s16',
      number: 16,
      module: 'Domain 5 · Networking & Content Delivery',
      domain: 'd5',
      weight: '18%',
      task: 'Task 5.3',
      title: 'Network Troubleshooting — Flow Logs, CloudFront Caching, and Hybrid Connectivity',
      duration: 30,
      summary: 'The exam\'s densest troubleshooting task. This session is a systematic method for diagnosing connectivity failures using VPC flow logs and the other network logs, fixing CloudFront caching problems, and resolving hybrid (VPN/Direct Connect) connectivity issues — plus the CloudWatch network monitoring tools.',
      objectives: [
        'Diagnose VPC connectivity failures systematically across SG, NACL, route table, and gateways',
        'Read VPC flow logs and the ELB/WAF/CloudFront logs to locate the broken hop',
        'Identify and remediate CloudFront caching issues (stale content, low hit ratio)',
        'Troubleshoot hybrid connectivity over VPN and Direct Connect',
      ],
      preLearningCheck: {
        question: 'You are debugging why traffic to an EC2 instance is failing and want to see whether packets are being ACCEPTed or REJECTed at the network interface, including the source, destination, and port. Which tool shows this?',
        options: [
          'CloudFront access logs',
          'VPC flow logs',
          'AWS Cost Explorer',
          'S3 server access logs',
        ],
        correct: 1,
        note: 'VPC flow logs capture metadata for IP traffic at the VPC, subnet, or ENI level — including the accept/reject action — which is the first place to look when diagnosing whether traffic is reaching and being allowed at an interface.',
      },
      sections: [
        {
          heading: 'A systematic troubleshooting method',
          body: 'Random guessing wastes time on the exam and in real incidents. Diagnose connectivity by walking the path the packet takes and checking each layer in order. The first layer that blocks the packet is your fault.',
          bullets: [
            'Is there a route? Check the route table for a path to the destination (IGW, NAT, peering, TGW, endpoint).',
            'Does the subnet firewall allow it? Check the network ACL (stateless — both directions, including ephemeral return ports).',
            'Does the instance firewall allow it? Check the security group (stateful — inbound rule for the port).',
            'Is the target healthy and listening? Check the app, the health check, and that it binds the right port.',
            'For public access: does the instance have a public IP / is it behind a public load balancer?',
          ],
          callout: { type: 'tip', text: 'Memorize the order: route table → NACL → security group → target health. Most "cannot connect" questions resolve at one of these four, and the wording usually hints which.' },
        },
        {
          heading: 'Reading the network logs',
          body: 'Each log source answers a different question. Knowing which log to pull is half the battle.',
          table: {
            headers: ['Log', 'Answers', 'Use when'],
            rows: [
              ['VPC flow logs', 'Was IP traffic accepted or rejected at the ENI/subnet/VPC?', 'Diagnose whether traffic reached and was allowed'],
              ['ELB access logs', 'What requests hit the load balancer and how did it respond?', 'Investigate 4xx/5xx and backend health at the LB'],
              ['CloudFront logs', 'What did the edge serve, and was it a cache hit or miss?', 'Diagnose caching behavior and edge errors'],
              ['WAF web ACL logs', 'Which requests were allowed or blocked by which rule?', 'Confirm whether WAF is blocking legitimate traffic'],
            ],
          },
          callout: { type: 'note', text: 'A REJECT in VPC flow logs points at a security group or NACL block; an ACCEPT means the packet was allowed at the network layer, so look higher (the app, health check, or load balancer).' },
        },
        {
          heading: 'CloudFront caching issues',
          body: 'CloudFront problems usually present as either "users see stale content" or "the cache is not helping (low hit ratio)." Both have well-known causes and fixes.',
          bullets: [
            'Stale content after a deploy → create an invalidation for the changed paths, or use versioned object names so new content has a new URL.',
            'Low cache hit ratio → check the TTL (Cache-Control headers / cache policy) and whether you are forwarding unnecessary headers, cookies, or query strings that fragment the cache.',
            'Personalized or cookie-varying responses cache poorly — cache only what is truly cacheable.',
            'Confirm cache hits/misses in CloudFront logs (the x-edge-result-type field).',
          ],
        },
        {
          heading: 'Hybrid connectivity and network monitoring',
          body: 'Connecting AWS to on-premises adds VPN and Direct Connect, each with its own failure modes, plus CloudWatch tools that watch network health.',
          bullets: [
            'Site-to-Site VPN runs over the internet (encrypted); troubleshoot tunnels, BGP/routing, and the customer gateway config.',
            'AWS Direct Connect is a dedicated private connection; troubleshoot the physical link, virtual interfaces (VIFs), and BGP; many designs add a VPN as encrypted backup.',
            'Reachability Analyzer tests whether a path exists between two resources and pinpoints the blocking component — a powerful static troubleshooting tool.',
            'CloudWatch Internet Monitor and Network Monitor surface internet-path and network performance/health for proactive detection.',
          ],
          callout: { type: 'tip', text: 'For "does a path exist and what is blocking it" without sending real traffic, VPC Reachability Analyzer is the exam answer — it evaluates SGs, NACLs, route tables, and gateways for you.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'VPC flow logs show ACCEPT for traffic reaching an EC2 instance on port 443, yet users still get connection errors. Where should you look next?',
          options: [
            'The security group, because the traffic must be blocked there',
            'The application/health check on the instance, since the network layer already allowed the packet',
            'The network ACL outbound rules only',
            'The Route 53 routing policy',
          ],
          correct: 1,
          explainCorrect: 'Correct — an ACCEPT means the packet passed the network controls, so the fault is higher up: the application may not be listening, may be unhealthy, or the health check is failing. Look at the target, not the firewalls.',
          elaborativePrompt: 'How does the accept/reject field in flow logs let you split a problem into "network layer" vs "application layer" quickly? What would a REJECT have told you instead?',
        },
        {
          afterSection: 2,
          question: 'After deploying a new version of a website, some users still see the old assets served through CloudFront. What is the most direct fix?',
          options: [
            'Disable CloudFront entirely',
            'Create a CloudFront invalidation for the changed paths (or use versioned file names)',
            'Lower the origin server’s CPU',
            'Switch to Global Accelerator',
          ],
          correct: 1,
          explainCorrect: 'Correct — cached old objects are served until they expire; invalidating the changed paths (or versioning the file names) forces CloudFront to fetch and serve the new content.',
          elaborativePrompt: 'Why does versioning object names (e.g. app.v2.js) avoid the stale-cache problem more cleanly than repeated invalidations at scale?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself your step-by-step method for a "users cannot reach the application" ticket: the order in which you check route table, NACL, security group, and target health, which log you pull at each step, and how an ACCEPT versus REJECT in VPC flow logs redirects your investigation.',
      sample: {
        type: 'multiple-choice',
        stem: 'Users report they cannot connect to a web server in a public subnet. The security group allows inbound 443, the instance is healthy, and the application is listening. VPC flow logs show REJECT for the inbound HTTPS traffic. Which component is the most likely cause?',
        options: [
          'The application is misconfigured',
          'A network ACL on the subnet is denying the inbound traffic (or its ephemeral return ports)',
          'The CloudFront cache is stale',
          'The RDS database is down',
        ],
        correct: 1,
        explanation: {
          summary: 'A REJECT in flow logs with a correctly configured security group and a healthy, listening app points to the other network-layer control — a network ACL denying the traffic at the subnet boundary.',
          perOption: [
            'The app is confirmed healthy and listening, and a REJECT happens at the network layer before traffic reaches the app — so the application is not the cause.',
            'Correct — with the SG allowing the port and the app healthy, a flow-log REJECT indicates the stateless network ACL is blocking the inbound (or its ephemeral return) traffic.',
            'CloudFront caching would not cause a flow-log REJECT on the instance, and the scenario is direct access, not a stale-cache symptom.',
            'An RDS outage would not produce a REJECT on inbound HTTPS to the web server at the network layer.',
          ],
          link: 'Domain 5 · Task 5.3 — Troubleshoot network connectivity issues',
        },
      },
      videos: [
        { videoId: 'KX_AfyrhlgQ', title: 'AWS SysOps Administrator Associate — Full Course to PASS the Exam', channel: 'freeCodeCamp.org', relevance: 'Covers VPC flow logs, network troubleshooting, CloudFront caching, and hybrid connectivity.' },
      ],
      keyTerms: [
        { term: 'VPC flow logs', def: 'Logs of IP traffic metadata (including accept/reject) at the VPC, subnet, or ENI level for connectivity diagnosis.' },
        { term: 'CloudFront invalidation', def: 'A request to remove cached objects so CloudFront fetches fresh content from the origin.' },
        { term: 'Cache hit ratio', def: 'The fraction of requests served from the CloudFront cache; low ratios often mean over-forwarded headers/cookies or short TTLs.' },
        { term: 'AWS Direct Connect', def: 'A dedicated private network connection from on-premises to AWS, often backed up by a VPN.' },
        { term: 'Reachability Analyzer', def: 'A tool that statically tests whether a network path exists between two resources and identifies the blocking component.' },
      ],
      awsServices: [
        { name: 'VPC Flow Logs', purpose: 'Capture accept/reject metadata for IP traffic to diagnose whether traffic reached and was allowed at each layer.' },
        { name: 'Amazon CloudFront', purpose: 'Edge CDN whose logs and invalidations are central to diagnosing caching and stale-content issues.' },
        { name: 'VPC Reachability Analyzer', purpose: 'Statically evaluates connectivity between resources, checking SGs, NACLs, route tables, and gateways.' },
        { name: 'CloudWatch Internet/Network Monitor', purpose: 'Monitor internet-path and network performance and health for proactive detection.' },
      ],
      examTips: [
        'Troubleshoot in order: route table → NACL → security group → target health. First blocker wins.',
        'VPC flow log REJECT → SG or NACL block. ACCEPT → look higher (app, health check, load balancer).',
        'Stale CloudFront content → invalidate changed paths or version object names. Low hit ratio → fix TTL/forwarded headers.',
        'Path exists? What is blocking it? without real traffic → VPC Reachability Analyzer.',
        'Match the log to the question: flow logs (network), ELB logs (LB requests), CloudFront logs (cache), WAF logs (rule blocks).',
      ],
    },

  ],
}

export default soaC03Course
