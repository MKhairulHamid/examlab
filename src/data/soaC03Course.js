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

  ],
}

export default soaC03Course
