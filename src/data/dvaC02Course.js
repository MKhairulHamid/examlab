// AWS Certified Developer – Associate (DVA-C02) — Exam Prep Course
// 15 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors clfC02Course.js / saaC03Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 4 — Domain 1 (Development) + Domain 2 (Security) authored (s1–s8).
// D3 (Deployment) + D4 (Troubleshooting & Optimization) sessions and interactive widgets land in Step 2.

const dvaC02Course = {
  slug: 'dva-c02',
  title: 'AWS Certified Developer – Associate — Full Prep Course',
  code: 'DVA-C02',
  subtitle: 'Fifteen ~30-minute sessions covering all four domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 130 minutes, pass at 720/1000 (~72%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Development with AWS Services', weight: '32%' },
    { id: 'd2', label: 'Domain 2 · Security', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · Deployment', weight: '24%' },
    { id: 'd4', label: 'Domain 4 · Troubleshooting & Optimization', weight: '18%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DEVELOPMENT WITH AWS SERVICES (32%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Development with AWS Services',
      domain: 'd1',
      weight: '32%',
      task: 'Task 1.1',
      title: 'Writing Resilient Application Code on AWS',
      duration: 30,
      summary: 'Start here. Before any single service, the exam wants to know you can write code that survives the real world — failures, retries, and loose coupling. We build the mental model the whole certification rests on: architectural patterns, the SDK, and resilience.',
      objectives: [
        'Distinguish tightly vs. loosely coupled, synchronous vs. asynchronous, and stateful vs. stateless designs',
        'Use the AWS SDK and CLI to interact with services, including pagination and credential resolution',
        'Implement resilient client code: retries with exponential backoff and jitter, idempotency, and circuit breakers',
        'Recognize when to decouple components with SQS, SNS, EventBridge, or Step Functions',
      ],
      preLearningCheck: {
        question: 'An application makes an API call to a downstream service that occasionally returns HTTP 500 errors under load. Which client-side strategy BEST prevents these transient failures from overwhelming the downstream service while still recovering?',
        options: [
          'Retry immediately in a tight loop until the call succeeds',
          'Retry with exponential backoff and jitter',
          'Fail the request immediately and surface the error to the user',
          'Increase the client timeout so the call waits longer',
        ],
        correct: 1,
        note: 'Take a guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Why this domain dominates the exam',
          body: 'Domain 1 is 32% of DVA-C02 — the largest slice — because everything else (securing, deploying, troubleshooting) assumes you can already build the application. The exam is written for someone who codes against AWS daily, so the questions are practical: given a failure mode or an integration need, what does the resilient developer do?\n\nThis session sets up the patterns. The next three drill into the services that carry the most weight: Lambda and DynamoDB.',
        },
        {
          heading: 'Coupling, state, and communication style',
          body: 'Three axes describe almost every architecture question. Learn the axis and the "good default," and you can reason through scenarios you have never seen.',
          table: {
            headers: ['Axis', 'Options', 'Cloud-native default'],
            rows: [
              ['Coupling', 'Tightly coupled (direct call) vs. loosely coupled (via a queue/topic)', 'Loosely coupled — a failure in one component should not cascade'],
              ['Communication', 'Synchronous (caller waits) vs. asynchronous (fire-and-forget)', 'Asynchronous for anything slow or spiky — buffer with a queue'],
              ['State', 'Stateful (server holds session) vs. stateless (state externalized)', 'Stateless — store state in DynamoDB/ElastiCache so any instance can serve any request'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "must scale horizontally," "any worker can pick up the job," or "survive an instance failure" → the answer is the stateless / loosely coupled / asynchronous option.' },
        },
        {
          heading: 'Talking to AWS: the SDK and CLI',
          body: 'Your code reaches AWS through the SDK (in Java, Python/boto3, JavaScript, Go, etc.) or the AWS CLI. Both resolve credentials the same way — and the exam tests that you know the order and the best practice.',
          bullets: [
            'Credential resolution order (simplified): environment variables → shared credentials/config file → IAM role attached to the compute (EC2 instance profile, ECS task role, Lambda execution role).',
            'Best practice: never hard-code access keys. On AWS compute, attach an IAM role — the SDK picks up temporary credentials automatically and rotates them.',
            'Pagination: list/query APIs return results in pages. Use the SDK paginators (or follow NextToken) — a single call does NOT return every item.',
            'Region and endpoint resolution come from config; many SDK errors are simply a missing or wrong Region.',
          ],
        },
        {
          heading: 'Resilience patterns you must code',
          body: 'AWS APIs can throttle (HTTP 429 / ThrottlingException) or fail transiently (5xx). The resilient developer plans for it.',
          bullets: [
            'Exponential backoff with jitter — wait 1s, 2s, 4s… plus a random offset so retrying clients do not synchronize into a thundering herd. The AWS SDKs do this automatically for retryable errors.',
            'Idempotency — design write operations so a retried request does not double-charge or duplicate. Use a client token / idempotency key the service can deduplicate on.',
            'Circuit breaker — after repeated failures to a third-party dependency, stop calling it for a cooldown window and fail fast, rather than piling up requests.',
            'Dead-letter handling — when an async message cannot be processed after N attempts, route it to a dead-letter queue for later inspection instead of losing it.',
          ],
          callout: { type: 'warning', text: 'Idempotency is a favorite exam trap. If retries could cause duplicate side effects (a second payment, a duplicate order), the correct design adds an idempotency token — not "retry fewer times."' },
        },
        {
          heading: 'Decoupling services: which integration service?',
          body: 'When the answer is "decouple these components," you must pick the right integration primitive. These recur across the whole exam.',
          table: {
            headers: ['Service', 'Pattern', 'Use when'],
            rows: [
              ['Amazon SQS', 'Queue (point-to-point, pull)', 'Buffer work for one consumer group; smooth out spikes; guarantee each message is processed'],
              ['Amazon SNS', 'Pub/sub topic (push, fan-out)', 'One event must notify many subscribers at once'],
              ['Amazon EventBridge', 'Event bus with routing rules', 'Route events by content to different targets; integrate SaaS and AWS events'],
              ['AWS Step Functions', 'Workflow orchestration', 'Coordinate a multi-step process with branching, retries, and state'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A developer is writing code that runs on an EC2 instance and needs to call Amazon S3. What is the recommended way to provide credentials?',
          options: [
            'Embed an IAM user access key and secret in the application code',
            'Store the access key in a plaintext file on the instance',
            'Attach an IAM role to the EC2 instance and let the SDK use the temporary credentials',
            'Pass the root account credentials as environment variables',
          ],
          correct: 2,
          explainCorrect: 'Correct — an instance profile (IAM role) delivers automatically rotated temporary credentials that the SDK picks up with no hard-coded secrets.',
          elaborativePrompt: 'Why are temporary role credentials safer than a long-lived access key, even if the access key has the exact same permissions? Think about what happens if the instance is compromised.',
        },
        {
          afterSection: 4,
          question: 'An order-processing API may be retried by clients on a network timeout. Which design prevents a single order from being created twice?',
          options: [
            'Lower the client timeout so retries are less likely',
            'Accept a client-supplied idempotency token and ignore duplicates of the same token',
            'Move the API behind a load balancer',
            'Return HTTP 200 even when processing fails',
          ],
          correct: 1,
          explainCorrect: 'Correct — an idempotency token lets the service recognize a retried request and return the original result instead of creating a duplicate order.',
          elaborativePrompt: 'Why does exponential backoff alone NOT solve the duplicate-order problem? What different category of problem does each technique address?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to a teammate: why is "loosely coupled and asynchronous" the cloud-native default? Give one concrete failure that this design survives but a direct synchronous call does not.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer is building a microservice that calls a third-party payment API. The payment API is occasionally slow and sometimes returns 5xx errors. The developer must ensure the service remains responsive and does not lose payment requests during these outages. Which combination is the MOST resilient design?',
        options: [
          'Call the payment API synchronously and retry immediately in a loop until it succeeds',
          'Place payment requests on an Amazon SQS queue, process them with retries and exponential backoff, and send failures to a dead-letter queue',
          'Increase the service timeout to 60 seconds so slow calls have time to complete',
          'Cache the payment responses in memory so repeated calls are faster',
        ],
        correct: 1,
        explanation: {
          summary: 'Decoupling with SQS buffers requests during the third-party outage, backoff retries handle transient errors without a thundering herd, and a dead-letter queue preserves requests that still fail — nothing is lost and the service stays responsive.',
          perOption: [
            'A synchronous tight retry loop ties up the service thread and hammers the failing API, making the outage worse — and a process crash loses the in-flight request.',
            'Correct — queue for decoupling + backoff for transient errors + DLQ for durability is the canonical resilient pattern.',
            'A longer timeout makes the service LESS responsive and still loses requests if the dependency is down. It treats the symptom, not the failure mode.',
            'Caching responses does nothing for write requests like payments and does not address durability during an outage.',
          ],
          link: 'D1 · Task 1.1 — Resilient application code and messaging services',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — pairs with every session in this course.',
        },
      ],
      keyTerms: [
        { term: 'Idempotency', def: 'A property where performing the same operation multiple times has the same effect as performing it once — essential for safe retries.' },
        { term: 'Exponential backoff', def: 'A retry strategy that increases the wait time between attempts (1s, 2s, 4s…), usually with random jitter, to avoid overwhelming a recovering service.' },
        { term: 'Loose coupling', def: 'A design where components interact through an intermediary (queue, topic, event bus) so a failure in one does not directly break another.' },
        { term: 'Stateless', def: 'A design where no per-client session is held on the server; state is externalized so any instance can handle any request.' },
        { term: 'Instance profile', def: 'An IAM role attached to compute (EC2/ECS/Lambda) that supplies automatically rotated temporary credentials to the SDK.' },
      ],
      awsServices: [
        { name: 'AWS SDK / AWS CLI', purpose: 'Programmatic and command-line access to AWS service APIs, with built-in credential resolution and retry logic.' },
        { name: 'Amazon SQS', purpose: 'Managed message queue for decoupling and buffering work between components.' },
        { name: 'Amazon SNS', purpose: 'Pub/sub messaging for fan-out notifications to many subscribers.' },
        { name: 'Amazon EventBridge', purpose: 'Serverless event bus that routes events by content to multiple targets.' },
        { name: 'AWS Step Functions', purpose: 'Orchestrates multi-step workflows with branching, retries, and state management.' },
      ],
      examTips: [
        '"Decouple" + "buffer spikes" + "do not lose work" → Amazon SQS with a dead-letter queue.',
        'Retries that could cause duplicate side effects → add an idempotency token, not just backoff.',
        'On AWS compute, credentials come from an attached IAM role — never hard-coded keys.',
        'List/Query APIs are paginated — always handle NextToken or use an SDK paginator.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Development with AWS Services',
      domain: 'd1',
      weight: '32%',
      task: 'Task 1.2',
      title: 'Developing for AWS Lambda',
      duration: 30,
      summary: 'Lambda is the single most-tested service on DVA-C02. We cover how a function is configured, how it handles events and errors, how concurrency works, and how to package and tune it. Get this session solid and a large fraction of the exam follows.',
      objectives: [
        'Configure a Lambda function: memory, timeout, runtime, handler, environment variables, layers, and triggers',
        'Explain reserved vs. provisioned concurrency and how they address throttling and cold starts',
        'Handle errors with retries, dead-letter queues, and Lambda Destinations',
        'Package functions correctly and enable VPC access when private resources are needed',
      ],
      preLearningCheck: {
        question: 'A latency-sensitive Lambda function suffers from slow cold starts during traffic spikes. Which configuration keeps a pool of initialized execution environments warm and ready?',
        options: [
          'Reserved concurrency',
          'Provisioned concurrency',
          'A larger function timeout',
          'A dead-letter queue',
        ],
        correct: 1,
        note: 'Guess first — the attempt primes you to retain the distinction when you read it.',
      },
      sections: [
        {
          heading: 'The Lambda execution model',
          body: 'Lambda runs your handler in a managed execution environment in response to an event. You provide the code and configuration; AWS provisions, scales, and patches the runtime. You pay per request and per GB-second of compute.\n\nKey insight for the exam: the first invocation in a fresh environment pays a "cold start" to initialize. Subsequent invocations reuse the warm environment. Code outside the handler runs once per environment — put expensive setup (SDK clients, DB connections) there, not inside the handler.',
        },
        {
          heading: 'Configuration that the exam tests',
          body: 'Memory is the master dial: raising memory proportionally raises CPU and network throughput. A function can become both faster AND cheaper at a higher memory setting because it finishes sooner.',
          table: {
            headers: ['Setting', 'What it controls', 'Exam note'],
            rows: [
              ['Memory (128 MB–10 GB)', 'RAM and proportional CPU/network', 'Raising memory can lower cost by reducing duration — tune it'],
              ['Timeout (max 15 min)', 'Max run time before Lambda kills the invocation', 'Lambda is not for hours-long jobs — that is a container/batch'],
              ['Environment variables', 'Config passed to the function', 'Can be encrypted with a KMS key for sensitive values'],
              ['Layers', 'Shared libraries/dependencies packaged separately', 'Reuse common code across functions; keep the deployment package small'],
              ['Ephemeral storage (/tmp)', 'Scratch disk, 512 MB–10 GB', 'For temporary files during an invocation'],
            ],
          },
        },
        {
          heading: 'Concurrency: reserved vs. provisioned',
          body: 'This distinction is one of the most reliably tested points on the entire exam. They solve different problems.',
          bullets: [
            'Concurrency = the number of in-flight invocations at one instant. The account has a default regional limit (e.g. 1,000) shared across functions.',
            'Reserved concurrency — caps and guarantees a slice of the account limit for one function. Protects other functions from being starved AND prevents this function from overwhelming a downstream resource. Setting it to 0 effectively disables the function.',
            'Provisioned concurrency — pre-initializes a set number of execution environments so they are warm. Eliminates cold-start latency for predictable or latency-sensitive workloads. Costs more because you pay to keep them warm.',
          ],
          callout: { type: 'tip', text: 'Cold-start latency problem → provisioned concurrency. "Limit how many run at once" / "protect a downstream database from too many connections" → reserved concurrency.' },
        },
        {
          heading: 'Event sources and the error lifecycle',
          body: 'How Lambda handles a failure depends on how it was invoked.',
          table: {
            headers: ['Invocation type', 'Examples', 'On error'],
            rows: [
              ['Synchronous', 'API Gateway, ALB, direct Invoke', 'Error returned to caller; caller must retry'],
              ['Asynchronous', 'S3 events, SNS, EventBridge', 'Lambda retries twice, then sends to a DLQ or on-failure Destination'],
              ['Poll-based (stream/queue)', 'SQS, Kinesis, DynamoDB Streams', 'Lambda polls and retries; failures can block the shard or return to the queue'],
            ],
          },
          bullets: [
            'Dead-letter queue (DLQ) — an SQS queue or SNS topic that receives events Lambda could not process after retries.',
            'Lambda Destinations — for async invocations, route the result (success OR failure) to SQS, SNS, EventBridge, or another Lambda, with richer metadata than a DLQ.',
          ],
        },
        {
          heading: 'Packaging and VPC access',
          body: 'Two practical configuration points that show up in scenarios.',
          bullets: [
            'Packaging — deploy as a .zip archive (code + dependencies, with shared libs in a layer) or as a container image up to 10 GB pushed to Amazon ECR.',
            'VPC access — to reach private resources (e.g. an RDS database in a private subnet), configure the function with VPC subnets and security groups. Lambda then runs with an elastic network interface in your VPC.',
            'A VPC-attached Lambda needs a NAT gateway (or VPC endpoints) to reach the public internet or public AWS endpoints — a common "why can my function no longer call S3?" gotcha.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A Lambda function connects to an Amazon RDS database. Under load, the database runs out of connections because too many function instances connect simultaneously. Which setting directly limits how many instances run at once?',
          options: [
            'Provisioned concurrency',
            'Reserved concurrency',
            'A higher memory setting',
            'A longer timeout',
          ],
          correct: 1,
          explainCorrect: 'Correct — reserved concurrency caps the maximum simultaneous invocations, protecting the database connection pool.',
          elaborativePrompt: 'Why would provisioned concurrency be the wrong fix here, even though it also involves "concurrency"? What problem does provisioned concurrency actually solve?',
        },
        {
          afterSection: 3,
          question: 'An S3 event triggers a Lambda function asynchronously. The function fails repeatedly. Where do the failed events go if configured correctly, so they are not lost?',
          options: [
            'They are returned to the S3 caller to retry',
            'They are silently dropped after the first attempt',
            'To a dead-letter queue or an on-failure Destination',
            'They block the function until manually cleared',
          ],
          correct: 2,
          explainCorrect: 'Correct — for asynchronous invocations, Lambda retries then routes unprocessable events to a DLQ or an on-failure Destination.',
          elaborativePrompt: 'Why does the error-handling behavior depend on whether the invocation is synchronous, asynchronous, or poll-based? What would go wrong if all three behaved the same way?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague the difference between reserved and provisioned concurrency using a single sentence for each that names the exact problem it solves. Which one costs more just by being enabled, and why?',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer has a Lambda function behind API Gateway that powers a customer-facing feature. During morning traffic spikes, users complain about slow first responses, which profiling traces to cold starts. The team needs consistent low latency during the predictable morning peak. What should the developer configure?',
        options: [
          'Increase the function timeout to allow cold starts to complete',
          'Enable provisioned concurrency to keep execution environments warm',
          'Set reserved concurrency to a low value to limit invocations',
          'Move the function code into the handler to speed initialization',
        ],
        correct: 1,
        explanation: {
          summary: 'Cold-start latency on a predictable peak is exactly what provisioned concurrency addresses — it pre-warms a pool of environments so the first requests do not pay initialization cost.',
          perOption: [
            'A longer timeout does not reduce cold-start latency; it only allows longer-running invocations.',
            'Correct — provisioned concurrency keeps environments initialized and warm, eliminating cold-start latency for the peak.',
            'Reserved concurrency caps simultaneous invocations — it would make throttling WORSE, not reduce latency.',
            'Initialization code belongs OUTSIDE the handler (run once per environment); moving it inside would slow every invocation.',
          ],
          link: 'D1 · Task 1.2 — Configure and tune Lambda functions',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers the Lambda development and configuration topics in depth.',
        },
      ],
      keyTerms: [
        { term: 'Cold start', def: 'The initialization latency paid when Lambda creates a fresh execution environment for an invocation.' },
        { term: 'Reserved concurrency', def: 'A cap that guarantees and limits the maximum simultaneous invocations for a single function.' },
        { term: 'Provisioned concurrency', def: 'Pre-initialized, warm execution environments that remove cold-start latency for a function.' },
        { term: 'Lambda layer', def: 'A separate package of shared libraries or dependencies that multiple functions can reuse.' },
        { term: 'Lambda Destination', def: 'A configured target (SQS, SNS, EventBridge, Lambda) that receives the result of an asynchronous invocation, on success or failure.' },
      ],
      awsServices: [
        { name: 'AWS Lambda', purpose: 'Serverless compute that runs code in response to events, scaling automatically with usage-based billing.' },
        { name: 'Amazon ECR', purpose: 'Container registry that stores Lambda container images and other container artifacts.' },
        { name: 'Amazon SQS', purpose: 'Commonly used as a Lambda dead-letter queue for unprocessable asynchronous events.' },
      ],
      examTips: [
        'Cold-start latency → provisioned concurrency. Cap simultaneous runs / protect a downstream → reserved concurrency.',
        'Raising memory raises CPU too — a function can be faster AND cheaper at higher memory.',
        'Async invocation failures → DLQ or on-failure Destination after retries.',
        'Put SDK clients and connections OUTSIDE the handler so they are reused across warm invocations.',
        'Lambda max timeout is 15 minutes — longer jobs belong on Fargate/ECS or AWS Batch.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Development with AWS Services',
      domain: 'd1',
      weight: '32%',
      task: 'Task 1.3',
      title: 'DynamoDB — Keys, Indexes, and Capacity',
      duration: 30,
      summary: 'DynamoDB is the densest single topic on DVA-C02. We build the data model from the ground up: partition and sort keys, when to add an LSI vs. a GSI, query vs. scan, consistency, and the capacity math the exam loves to test.',
      objectives: [
        'Design partition and sort keys, including high-cardinality keys for even distribution',
        'Choose between a Local Secondary Index (LSI) and a Global Secondary Index (GSI)',
        'Distinguish Query from Scan and strongly vs. eventually consistent reads',
        'Calculate read and write capacity (RCU/WCU) and choose on-demand vs. provisioned mode',
      ],
      preLearningCheck: {
        question: 'A table is queried most often by customer_id but sometimes needs to be searched by email, which is not the table\'s key. Which feature lets you efficiently query by email without scanning the whole table?',
        options: [
          'A Global Secondary Index with email as the partition key',
          'A larger provisioned read capacity',
          'A Scan operation with a filter expression on email',
          'DynamoDB Accelerator (DAX)',
        ],
        correct: 0,
        note: 'Guess before reading — the pre-test effect helps even on a wrong guess.',
      },
      sections: [
        {
          heading: 'Keys: how DynamoDB finds your data',
          body: 'Every item has a primary key. There are two forms:\n\n• Simple primary key — just a partition key (e.g. customer_id). The partition key is hashed to decide which physical partition stores the item.\n• Composite primary key — partition key + sort key (e.g. customer_id + order_date). Items with the same partition key are stored together, sorted by the sort key, enabling efficient range queries within a partition.',
          callout: { type: 'tip', text: 'High-cardinality partition keys (many distinct values, evenly accessed) spread load across partitions. A low-cardinality key like "status=active" creates a hot partition and throttling — a classic exam scenario.' },
        },
        {
          heading: 'Query vs. Scan',
          body: 'This is one of the most tested DynamoDB distinctions. They have very different efficiency.',
          table: {
            headers: ['Operation', 'How it works', 'Efficiency'],
            rows: [
              ['Query', 'Reads items with a specific partition key (and optional sort-key condition)', 'Efficient — reads only the matching partition'],
              ['Scan', 'Reads every item in the table, then applies a filter', 'Expensive — consumes capacity for the whole table, even filtered rows'],
            ],
          },
          bullets: [
            'A filter expression is applied AFTER the read — it does not save capacity. Filtering a Scan still reads (and bills) every item.',
            'If you frequently need to query by a non-key attribute, add a secondary index instead of scanning.',
          ],
        },
        {
          heading: 'Secondary indexes: LSI vs. GSI',
          body: 'Indexes let you query by attributes that are not the table\'s primary key. Choosing the right one is a frequent exam question.',
          table: {
            headers: ['Aspect', 'Local Secondary Index (LSI)', 'Global Secondary Index (GSI)'],
            rows: [
              ['Partition key', 'Same as the table', 'Any attribute (different from the table)'],
              ['Sort key', 'Alternate sort key', 'Any attribute'],
              ['When created', 'Only at table creation', 'Any time, added or removed later'],
              ['Capacity', 'Shares the table\'s capacity', 'Has its OWN provisioned capacity'],
              ['Consistency', 'Supports strongly consistent reads', 'Eventually consistent only'],
            ],
          },
          callout: { type: 'warning', text: 'Remember: you can only create an LSI when the table is created; a GSI can be added later. "Need to query by a new attribute on an existing table" → GSI.' },
        },
        {
          heading: 'Read consistency',
          body: 'DynamoDB replicates writes across multiple facilities. Reads come in two flavors:',
          bullets: [
            'Eventually consistent (default) — may not reflect a very recent write, but costs half as much (0.5 RCU per 4 KB). Fine for most reads.',
            'Strongly consistent — always returns the latest committed write, costs a full RCU per 4 KB, and is not available on GSIs.',
            'Transactions (TransactWriteItems / TransactGetItems) give all-or-nothing ACID semantics across multiple items, at double the capacity cost.',
          ],
        },
        {
          heading: 'Capacity: the math the exam tests',
          body: 'Capacity is measured in units. Know the rounding rules — these power direct calculation questions.',
          bullets: [
            'WCU — 1 Write Capacity Unit = one write of up to 1 KB per second. A 3 KB item costs 3 WCU per write.',
            'RCU — 1 Read Capacity Unit = one strongly consistent read of up to 4 KB per second, OR two eventually consistent reads of up to 4 KB.',
            'Item size is always rounded UP to the next KB (writes) or 4 KB (reads).',
            'On-demand mode — pay per request, no capacity planning, scales instantly. Best for unpredictable or spiky traffic.',
            'Provisioned mode — set RCU/WCU (optionally with auto scaling). Cheaper for steady, predictable traffic.',
          ],
          callout: { type: 'tip', text: 'Worked example: reading a 6 KB item with strong consistency = round 6 KB up to 8 KB = 2 × 4 KB = 2 RCU. With eventual consistency it is 1 RCU (half).' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'An application stores events with a partition key of event_type, but 95% of events have the type "click". What problem will this cause?',
          options: [
            'Strongly consistent reads will fail',
            'A hot partition that throttles because load is not evenly distributed',
            'The table cannot be queried by event_type',
            'Writes will be silently dropped',
          ],
          correct: 1,
          explainCorrect: 'Correct — a low-cardinality, skewed partition key concentrates traffic on one partition, causing throttling. A high-cardinality key spreads load.',
          elaborativePrompt: 'Why does adding more provisioned capacity NOT reliably fix a hot partition? Think about how DynamoDB distributes capacity across partitions.',
        },
        {
          afterSection: 4,
          question: 'How many RCUs are needed to perform one strongly consistent read per second of an 11 KB item?',
          options: [
            '1 RCU',
            '2 RCU',
            '3 RCU',
            '11 RCU',
          ],
          correct: 2,
          explainCorrect: 'Correct — 11 KB rounds up to 12 KB; 12 ÷ 4 = 3 RCU for a strongly consistent read.',
          elaborativePrompt: 'How would the answer change if the read were eventually consistent instead? Work through why the cost halves.',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate when you would reach for a GSI versus an LSI. Name the two hard constraints on an LSI that often force the GSI choice.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer has an existing DynamoDB table with user_id as the partition key. A new feature must look up users by their email address, which is stored as a non-key attribute. The lookups must be efficient and the table already contains millions of items. What should the developer do?',
        options: [
          'Run a Scan with a filter expression on the email attribute',
          'Create a Local Secondary Index on email',
          'Create a Global Secondary Index with email as the partition key',
          'Recreate the table using email as the partition key',
        ],
        correct: 2,
        explanation: {
          summary: 'A GSI with email as its partition key allows efficient queries by email and can be added to an existing table at any time — exactly the requirement.',
          perOption: [
            'A Scan reads every item and bills for all of them — inefficient at millions of items, and it gets worse as the table grows.',
            'An LSI can only be created at table creation time and must share the table\'s partition key — it cannot index a brand-new partition key on an existing table.',
            'Correct — a GSI supports a different partition key, can be added later, and makes email lookups efficient.',
            'Recreating the table is hugely disruptive and unnecessary; it also breaks queries by user_id.',
          ],
          link: 'D1 · Task 1.3 — DynamoDB keys and indexing',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — includes the DynamoDB data-modeling and capacity sections.',
        },
      ],
      keyTerms: [
        { term: 'Partition key', def: 'The primary-key attribute hashed to determine which physical partition stores an item; high cardinality spreads load.' },
        { term: 'Sort key', def: 'The second part of a composite key; orders items within a partition and enables range queries.' },
        { term: 'GSI', def: 'Global Secondary Index — an index with any partition/sort key, its own capacity, eventually consistent, addable any time.' },
        { term: 'LSI', def: 'Local Secondary Index — shares the table partition key with an alternate sort key; created only at table creation; supports strong consistency.' },
        { term: 'RCU / WCU', def: 'Read/Write Capacity Units — the throughput currency: 1 RCU = one 4 KB strongly consistent read/sec; 1 WCU = one 1 KB write/sec.' },
      ],
      awsServices: [
        { name: 'Amazon DynamoDB', purpose: 'Fully managed key-value and document NoSQL database with single-digit-millisecond performance at any scale.' },
        { name: 'DynamoDB Streams', purpose: 'Captures an ordered change log of item modifications for event-driven processing (covered next session).' },
      ],
      examTips: [
        'Query reads one partition efficiently; Scan reads (and bills for) the whole table — avoid Scan in steady-state code.',
        'Add an index to query by a non-key attribute. New attribute on an existing table → GSI (LSI is creation-time only).',
        'Memorize capacity rounding: writes round up to 1 KB, reads to 4 KB; eventual reads cost half of strong.',
        'Low-cardinality/skewed partition key → hot partition and throttling. Pick a high-cardinality key.',
        'Spiky/unpredictable traffic → on-demand mode; steady predictable traffic → provisioned with auto scaling.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Development with AWS Services',
      domain: 'd1',
      weight: '32%',
      task: 'Task 1.3',
      title: 'Caching, Streams, and Choosing a Data Store',
      duration: 30,
      summary: 'We finish Domain 1 by rounding out the data layer: caching with ElastiCache and DAX, change processing with DynamoDB Streams and TTL, and how to pick the right data store — DynamoDB, RDS/Aurora, ElastiCache, or S3 — for an access pattern.',
      objectives: [
        'Use DynamoDB Accelerator (DAX) and Amazon ElastiCache to cache reads and reduce latency',
        'Apply caching strategies (lazy loading vs. write-through) and TTL for data lifecycle',
        'Process changes with DynamoDB Streams and manage expiry with DynamoDB TTL',
        'Match an access pattern to DynamoDB, RDS/Aurora, ElastiCache, or Amazon S3',
      ],
      preLearningCheck: {
        question: 'An application reads the same DynamoDB items repeatedly and needs microsecond latency without changing its DynamoDB API calls. Which caching option fits BEST?',
        options: [
          'Amazon ElastiCache for Memcached',
          'DynamoDB Accelerator (DAX)',
          'Amazon CloudFront',
          'A larger provisioned read capacity',
        ],
        correct: 1,
        note: 'Take a guess first — retrieval practice before reading boosts retention.',
      },
      sections: [
        {
          heading: 'Why cache at all',
          body: 'Caching stores frequently accessed data in fast memory so repeated reads avoid the slower (and more expensive) trip to the database. The exam expects you to know which cache fits which situation, and the two classic caching strategies.',
          bullets: [
            'Lazy loading (cache-aside) — read from cache; on a miss, read from the database and populate the cache. Only requested data is cached; stale data is possible until it expires.',
            'Write-through — write to the cache and database together, so the cache is always current; but it caches data that may never be read.',
            'TTL (time to live) — expire cached entries after a set period to bound staleness.',
          ],
        },
        {
          heading: 'DAX vs. ElastiCache',
          body: 'Both cache reads, but they target different scenarios.',
          table: {
            headers: ['Aspect', 'DynamoDB Accelerator (DAX)', 'Amazon ElastiCache'],
            rows: [
              ['Scope', 'Purpose-built cache for DynamoDB only', 'General-purpose in-memory cache for any data'],
              ['API', 'Same DynamoDB API — minimal code change', 'Redis/Memcached API — application manages it'],
              ['Latency', 'Microsecond reads for DynamoDB', 'Microsecond reads, broadly applicable'],
              ['Use when', 'Read-heavy DynamoDB workloads needing a drop-in cache', 'Caching query results, sessions, leaderboards, pub/sub'],
            ],
          },
          callout: { type: 'tip', text: '"Cache DynamoDB with no API rewrite" → DAX. "Cache arbitrary data / sessions / a leaderboard" → ElastiCache. Redis adds persistence, replication, and pub/sub; Memcached is simpler and multi-threaded.' },
        },
        {
          heading: 'DynamoDB Streams and TTL',
          body: 'DynamoDB has built-in event and lifecycle features the exam tests directly.',
          bullets: [
            'DynamoDB Streams — an ordered, 24-hour change log of item-level modifications. Trigger a Lambda function from the stream to fan out changes, replicate data, or maintain aggregates.',
            'TTL — mark a timestamp attribute as the expiry; DynamoDB deletes expired items automatically at no extra cost. Ideal for session data, logs, or anything with a natural lifespan.',
            'Global Tables build on Streams to give multi-Region, active-active replication.',
          ],
        },
        {
          heading: 'Choosing the right data store',
          body: 'A recurring exam pattern: given an access pattern, pick the store. Match the shape of the data and queries to the service.',
          table: {
            headers: ['Need', 'Service', 'Why'],
            rows: [
              ['Key-value / document, massive scale, simple access patterns', 'Amazon DynamoDB', 'Serverless NoSQL, single-digit-ms, scales seamlessly'],
              ['Relational data, joins, complex SQL, transactions', 'Amazon RDS / Aurora', 'Managed relational engines; Aurora adds scale and HA'],
              ['Sub-millisecond in-memory reads, sessions, leaderboards', 'Amazon ElastiCache', 'In-memory Redis/Memcached'],
              ['Large objects, static assets, data lake, backups', 'Amazon S3', 'Durable, cheap object storage; not a query database'],
            ],
          },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'Using the lazy-loading (cache-aside) strategy, what happens on a cache miss?',
          options: [
            'The request fails and returns an error',
            'The application reads from the database and then writes the value into the cache',
            'The cache automatically queries the database in the background',
            'The item is written to both cache and database simultaneously',
          ],
          correct: 1,
          explainCorrect: 'Correct — lazy loading fetches from the database on a miss and populates the cache so the next read is a hit.',
          elaborativePrompt: 'What is the main downside of lazy loading compared to write-through, and in what kind of workload does that downside matter most?',
        },
        {
          afterSection: 2,
          question: 'A team wants microsecond read latency for a read-heavy DynamoDB application but does not want to rewrite their data-access code to use a different API. What should they use?',
          options: [
            'Amazon ElastiCache for Redis',
            'DynamoDB Accelerator (DAX)',
            'Amazon CloudFront',
            'Amazon RDS read replicas',
          ],
          correct: 1,
          explainCorrect: 'Correct — DAX is a drop-in cache that uses the same DynamoDB API, so existing code works with minimal change.',
          elaborativePrompt: 'Why might a team still choose ElastiCache over DAX even for a DynamoDB-backed app? What does ElastiCache do that DAX cannot?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague how you would decide between DynamoDB and Amazon RDS for a new feature. What single property of the queries pushes you toward relational?',
      sample: {
        type: 'multiple-choice',
        stem: 'A gaming application must store a real-time leaderboard that updates constantly and is read thousands of times per second with sub-millisecond latency. The data is transient and does not need durable relational storage. Which service is the BEST fit?',
        options: [
          'Amazon RDS for PostgreSQL',
          'Amazon S3',
          'Amazon ElastiCache for Redis',
          'Amazon Athena',
        ],
        correct: 2,
        explanation: {
          summary: 'A constantly updated, heavily read leaderboard with sub-millisecond latency is a textbook in-memory use case, and Redis even has built-in sorted-set structures purpose-made for leaderboards.',
          perOption: [
            'RDS is durable relational storage with higher latency — overkill and too slow for a real-time leaderboard.',
            'S3 is object storage for files, not a low-latency, high-frequency read/write data structure.',
            'Correct — ElastiCache for Redis delivers in-memory sub-millisecond performance and has native sorted sets ideal for leaderboards.',
            'Athena queries data in S3 with SQL for analytics — it is not a real-time low-latency store.',
          ],
          link: 'D1 · Task 1.3 — Use data caching services and select stores by access pattern',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers ElastiCache, DAX, and data-store selection.',
        },
      ],
      keyTerms: [
        { term: 'DAX', def: 'DynamoDB Accelerator — a managed in-memory cache for DynamoDB that uses the same API and delivers microsecond reads.' },
        { term: 'Lazy loading', def: 'A cache strategy that loads data into the cache only on a miss; minimizes cached data but allows staleness.' },
        { term: 'Write-through', def: 'A cache strategy that writes to cache and database together, keeping the cache current at the cost of caching unused data.' },
        { term: 'DynamoDB Streams', def: 'An ordered 24-hour change log of item modifications, often used to trigger Lambda for event-driven processing.' },
        { term: 'TTL (DynamoDB)', def: 'A per-item expiry timestamp that DynamoDB uses to automatically delete expired items at no extra cost.' },
      ],
      awsServices: [
        { name: 'Amazon ElastiCache', purpose: 'Managed in-memory cache (Redis or Memcached) for sub-millisecond reads, sessions, and pub/sub.' },
        { name: 'Amazon DynamoDB Accelerator (DAX)', purpose: 'Drop-in in-memory cache for DynamoDB using the same API.' },
        { name: 'Amazon RDS / Aurora', purpose: 'Managed relational databases for SQL workloads with joins and transactions.' },
        { name: 'Amazon S3', purpose: 'Durable object storage for files, static assets, backups, and data lakes.' },
      ],
      examTips: [
        'Cache DynamoDB with no code rewrite → DAX. Cache arbitrary data / sessions / leaderboards → ElastiCache.',
        'Lazy loading caches on a miss (possible staleness); write-through keeps the cache current (caches unused data).',
        'Need event-driven processing of table changes → DynamoDB Streams + Lambda.',
        'Auto-expire old items at no cost → DynamoDB TTL.',
        'Joins and complex SQL push you to RDS/Aurora; key-value at scale stays on DynamoDB.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — SECURITY (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Security',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'IAM for Applications — Roles, Policies, and STS',
      duration: 30,
      summary: 'Domain 2 starts with how your application proves who it is and what it may do. We cover IAM policies, the principle of least privilege, assuming roles, and how AWS STS vends the temporary credentials that power secure, key-free access.',
      objectives: [
        'Read an IAM policy and determine whether an action is allowed or denied',
        'Apply least privilege using IAM roles for applications instead of long-lived keys',
        'Explain how AssumeRole and AWS STS provide temporary, cross-account credentials',
        'Distinguish identity-based policies, resource-based policies, and how an explicit deny wins',
      ],
      preLearningCheck: {
        question: 'An application on EC2 must read from one specific S3 bucket. What is the MOST secure way to grant this access?',
        options: [
          'Create an IAM user, generate access keys, and store them in the application config',
          'Attach an IAM role to the EC2 instance with a policy allowing s3:GetObject on that bucket',
          'Make the bucket public so the application can read it',
          'Use the AWS account root credentials',
        ],
        correct: 1,
        note: 'Guess first — the pre-test effect strengthens memory even on a wrong answer.',
      },
      sections: [
        {
          heading: 'How an authorization decision is made',
          body: 'Every AWS API call is evaluated against the policies that apply to the requesting principal. The logic the exam tests:',
          bullets: [
            'Default deny — if nothing explicitly allows the action, it is denied.',
            'An explicit Allow grants access — unless…',
            'An explicit Deny overrides any Allow. An explicit deny always wins.',
            'Permissions are the union of all applicable policies (identity-based, resource-based, permissions boundaries, SCPs).',
          ],
          callout: { type: 'tip', text: 'Exam shortcut: if any policy in scope says Deny for the action, the answer is "denied," no matter how many Allows exist.' },
        },
        {
          heading: 'Anatomy of an IAM policy',
          body: 'An IAM policy is JSON with statements. Each statement has Effect (Allow/Deny), Action (the API operations), Resource (the ARNs), and optional Condition. You should be able to read one and predict the outcome.',
          bullets: [
            'Action — e.g. "s3:GetObject", "dynamodb:Query". Wildcards like "s3:*" grant broad access.',
            'Resource — the ARN(s) the actions apply to. "*" means all resources.',
            'Condition — extra constraints (source IP, MFA present, requested Region, a tag value).',
            'Least privilege — grant only the specific actions on the specific resources the workload needs, nothing more.',
          ],
        },
        {
          heading: 'Roles vs. users for applications',
          body: 'For application code, the answer is almost always a role, not a user with keys.',
          table: {
            headers: ['', 'IAM user', 'IAM role'],
            rows: [
              ['Credentials', 'Long-lived access key + secret', 'Temporary credentials from STS'],
              ['Rotation', 'Manual, easy to forget', 'Automatic, short-lived'],
              ['Best for', 'Rare — specific human/programmatic cases', 'Applications, EC2/ECS/Lambda, cross-account access'],
              ['Risk if leaked', 'High — valid until manually revoked', 'Low — expires in minutes to hours'],
            ],
          },
          callout: { type: 'warning', text: 'Hard-coded access keys in code or config are the most common security anti-pattern on the exam. The fix is always an IAM role delivering temporary credentials.' },
        },
        {
          heading: 'STS and AssumeRole',
          body: 'AWS Security Token Service (STS) issues temporary, limited-privilege credentials. This is the engine behind roles and cross-account access.',
          bullets: [
            'AssumeRole — a principal calls sts:AssumeRole on a role it is trusted to assume; STS returns temporary credentials (access key, secret, session token) that expire.',
            'Trust policy — a resource-based policy on the role that names WHO may assume it (e.g. another account, a service like lambda.amazonaws.com).',
            'Cross-account access — Account A\'s role trusts Account B; a principal in B assumes the role in A to act there, with no shared long-lived keys.',
            'Federation — STS also underpins identity-provider federation (covered next session with Cognito).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A principal has one policy that allows s3:GetObject on a bucket and another policy that explicitly denies s3:GetObject on the same bucket. What is the result?',
          options: [
            'Access is allowed because there is an explicit Allow',
            'Access is denied because an explicit Deny overrides any Allow',
            'The two policies cancel out and the default Allow applies',
            'It depends on which policy was attached first',
          ],
          correct: 1,
          explainCorrect: 'Correct — in IAM evaluation, an explicit Deny always overrides any Allow.',
          elaborativePrompt: 'Why is "explicit deny wins" a useful security guardrail? Think about how an organization could use a deny in an SCP to enforce a rule no individual account can override.',
        },
        {
          afterSection: 3,
          question: 'An application in Account B needs to write to a DynamoDB table in Account A. Which approach avoids sharing long-lived credentials?',
          options: [
            'Create an IAM user in Account A and email the keys to the Account B team',
            'Make the DynamoDB table public',
            'Create a role in Account A that trusts Account B; the app assumes it via STS for temporary credentials',
            'Copy the table into Account B',
          ],
          correct: 2,
          explainCorrect: 'Correct — a cross-account role with a trust policy plus sts:AssumeRole grants temporary access without sharing static keys.',
          elaborativePrompt: 'What two pieces must both be in place for AssumeRole to succeed — one on the role and one on the calling principal?',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate why temporary STS credentials are safer than an IAM user access key, even when both grant identical permissions. Frame it around what an attacker gains from stealing each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer is deploying an application to AWS Lambda that must read messages from an Amazon SQS queue and write results to a DynamoDB table. Following security best practices, how should the developer grant the function access to these services?',
        options: [
          'Create an IAM user with the needed permissions and store its access keys in Lambda environment variables',
          'Assign a Lambda execution role with a least-privilege policy granting only the required SQS and DynamoDB actions',
          'Grant the function full administrator access to avoid permission errors',
          'Make the SQS queue and DynamoDB table publicly accessible',
        ],
        correct: 1,
        explanation: {
          summary: 'A Lambda execution role provides automatically rotated temporary credentials, and a least-privilege policy grants exactly the SQS and DynamoDB actions needed — the secure, recommended pattern.',
          perOption: [
            'Storing access keys in environment variables reintroduces long-lived secrets that can leak and must be rotated manually — the anti-pattern.',
            'Correct — an execution role with a least-privilege policy is the best practice for Lambda service access.',
            'Administrator access violates least privilege and dramatically widens the blast radius if the function is compromised.',
            'Making the resources public exposes them to the internet — a severe security failure.',
          ],
          link: 'D2 · Task 2.1 — IAM roles and least privilege for applications',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers IAM policies, roles, and STS.',
        },
      ],
      keyTerms: [
        { term: 'IAM role', def: 'An identity with permissions that can be assumed to obtain temporary credentials; preferred for applications and services.' },
        { term: 'Least privilege', def: 'Granting only the specific actions on the specific resources a workload needs — nothing more.' },
        { term: 'AWS STS', def: 'Security Token Service — issues temporary, expiring credentials used by roles and federation.' },
        { term: 'Trust policy', def: 'A resource-based policy on a role that defines which principals are allowed to assume it.' },
        { term: 'Explicit deny', def: 'A Deny statement in any applicable policy that overrides all Allow statements for that action.' },
      ],
      awsServices: [
        { name: 'AWS IAM', purpose: 'Defines identities (users, roles) and policies that authorize actions on AWS resources.' },
        { name: 'AWS STS', purpose: 'Issues temporary security credentials for roles, cross-account access, and federation.' },
      ],
      examTips: [
        'Application needs AWS access → attach a role, never hard-coded keys.',
        'Explicit Deny beats any Allow; default is deny when nothing matches.',
        'Cross-account access → a role with a trust policy + sts:AssumeRole, not shared keys.',
        'Least privilege means specific actions on specific ARNs — "*:*" or admin access is the wrong answer.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Security',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Application Authentication with Amazon Cognito',
      duration: 30,
      summary: 'How do end users sign in to your application, and how does the app then call AWS on their behalf? Amazon Cognito answers both. We disentangle user pools from identity pools — the single most-confused topic in this domain — plus tokens and API authorization.',
      objectives: [
        'Distinguish a Cognito user pool (authentication) from an identity pool (authorization to AWS)',
        'Describe the OAuth 2.0 / OIDC tokens a user pool issues (ID, access, refresh)',
        'Secure APIs with bearer tokens and API Gateway authorizers',
        'Choose Cognito federation for social and enterprise (SAML/OIDC) sign-in',
      ],
      preLearningCheck: {
        question: 'A mobile app authenticates users and then needs to let those users upload directly to an S3 bucket using temporary AWS credentials scoped to each user. Which Cognito feature provides the AWS credentials?',
        options: [
          'A Cognito user pool',
          'A Cognito identity pool',
          'An IAM user per app user',
          'AWS STS GetSessionToken called from the client with root keys',
        ],
        correct: 1,
        note: 'Guess before reading — even a wrong attempt improves retention of the distinction.',
      },
      sections: [
        {
          heading: 'The two halves of Cognito',
          body: 'Cognito has two components that are constantly confused on the exam. Lock this down and most Cognito questions become easy.',
          table: {
            headers: ['Component', 'Answers the question', 'Gives you'],
            rows: [
              ['User pool', '"Who is this user?" (authentication)', 'A user directory + sign-up/sign-in; issues JWT tokens'],
              ['Identity pool (federated identities)', '"What AWS resources may this user touch?" (authorization)', 'Temporary AWS credentials via STS, mapped to an IAM role'],
            ],
          },
          callout: { type: 'tip', text: 'Mnemonic: USER pool = identify the USER. IDENTITY pool = hand out AWS IDENTITY (credentials). Many real apps use both: the user pool signs the user in, then the identity pool exchanges that login for AWS credentials.' },
        },
        {
          heading: 'Tokens a user pool issues',
          body: 'After a successful sign-in, a user pool returns three JSON Web Tokens (JWTs). Know what each is for.',
          bullets: [
            'ID token — contains identity claims about the user (name, email). Used by the app to learn who signed in.',
            'Access token — authorizes access to resources/APIs; presented as a bearer token to protected endpoints.',
            'Refresh token — long-lived token used to obtain new ID/access tokens without re-prompting the user for credentials.',
          ],
        },
        {
          heading: 'Securing APIs with authorizers',
          body: 'When the client holds a token, API Gateway validates it before the request reaches your backend. The exam tests which authorizer to use.',
          table: {
            headers: ['Authorizer', 'How it validates', 'Use when'],
            rows: [
              ['Cognito authorizer', 'Validates a user-pool JWT directly', 'Users sign in via a Cognito user pool'],
              ['Lambda authorizer', 'Your Lambda inspects the token/headers and returns an IAM policy', 'Custom auth logic or a third-party token format'],
              ['IAM authorization', 'Request signed with SigV4 using IAM credentials', 'Callers are AWS principals (services, signed requests)'],
            ],
          },
        },
        {
          heading: 'Federation: social and enterprise sign-in',
          body: 'Cognito user pools can federate to external identity providers, so users sign in with credentials they already have.',
          bullets: [
            'Social identity providers — Google, Facebook, Apple, Amazon via OIDC/OAuth.',
            'Enterprise identity providers — corporate directories via SAML 2.0 or OIDC.',
            'The user pool becomes the single integration point; your app trusts the pool\'s tokens regardless of the upstream provider.',
            'Bearer tokens — the app sends the token in the Authorization header; the API validates it. Never embed long-lived AWS keys in a mobile or browser client.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An application needs to sign users in with a username and password and maintain a directory of users. Which Cognito component provides this?',
          options: [
            'Identity pool',
            'User pool',
            'AWS STS directly',
            'IAM Identity Center',
          ],
          correct: 1,
          explainCorrect: 'Correct — a user pool is the managed user directory that handles sign-up and sign-in (authentication).',
          elaborativePrompt: 'If the same app later needs those signed-in users to write to DynamoDB with per-user permissions, which component would you add, and what does it hand back?',
        },
        {
          afterSection: 1,
          question: 'Which token issued by a Cognito user pool is used to obtain new tokens after the others expire, without forcing the user to log in again?',
          options: [
            'ID token',
            'Access token',
            'Refresh token',
            'Session token',
          ],
          correct: 2,
          explainCorrect: 'Correct — the refresh token is long-lived and is exchanged for fresh ID and access tokens.',
          elaborativePrompt: 'Why is it important that the access token is short-lived while the refresh token is long-lived? What security trade-off does this split manage?',
        },
      ],
      selfExplanationPrompt: 'In one sentence each, explain to a teammate what a Cognito user pool does and what an identity pool does, and describe an app flow that uses both in sequence.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer is building a single-page web application. Users must sign in with Google or with an email/password account, and after signing in, the front end must call a protected Amazon API Gateway REST API. Which approach correctly handles authentication and API authorization?',
        options: [
          'Embed an IAM user access key in the JavaScript so the app can call the API',
          'Use a Cognito user pool (with Google federation) for sign-in, and a Cognito authorizer on API Gateway to validate the user-pool tokens',
          'Make the API public and validate users in the browser only',
          'Use an identity pool alone to authenticate the users with passwords',
        ],
        correct: 1,
        explanation: {
          summary: 'A user pool handles email/password and federated Google sign-in and issues JWTs; a Cognito authorizer on API Gateway validates those tokens, securing the API without any long-lived secret in the browser.',
          perOption: [
            'Embedding an access key in client-side JavaScript exposes a long-lived secret to anyone who views the page — a severe security flaw.',
            'Correct — user pool (with federation) for authentication + Cognito authorizer for API authorization is the intended design.',
            'Validating users only in the browser provides no real security; the API itself must enforce authorization.',
            'An identity pool vends AWS credentials; it is not the component that authenticates users with passwords — that is the user pool.',
          ],
          link: 'D2 · Task 2.1 — Cognito authentication and API authorization',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers Cognito user pools, identity pools, and API Gateway authorizers.',
        },
      ],
      keyTerms: [
        { term: 'Cognito user pool', def: 'A managed user directory that handles sign-up/sign-in and issues JWT tokens — authentication.' },
        { term: 'Cognito identity pool', def: 'A component that exchanges a verified login for temporary AWS credentials mapped to an IAM role — authorization to AWS.' },
        { term: 'JWT', def: 'JSON Web Token — the signed token format Cognito user pools issue (ID, access, refresh).' },
        { term: 'Bearer token', def: 'A token sent in the Authorization header that grants access to whoever presents it; must be transmitted over TLS.' },
        { term: 'Lambda authorizer', def: 'An API Gateway authorizer that runs custom Lambda logic to validate a request and return an IAM policy.' },
      ],
      awsServices: [
        { name: 'Amazon Cognito', purpose: 'Provides user sign-up/sign-in (user pools) and temporary AWS credentials for users (identity pools).' },
        { name: 'Amazon API Gateway', purpose: 'Fronts APIs and validates tokens via Cognito, Lambda, or IAM authorizers before requests reach the backend.' },
      ],
      examTips: [
        'User pool = authenticate the user (who they are). Identity pool = vend AWS credentials (what they can access).',
        'Three user-pool tokens: ID (identity claims), access (authorize API calls), refresh (renew the others).',
        'Users sign in via a user pool + protect API Gateway → Cognito authorizer. Custom/third-party token → Lambda authorizer.',
        'Never put long-lived AWS keys in a browser or mobile client — use Cognito-issued temporary credentials.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Security',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Encryption with AWS KMS',
      duration: 30,
      summary: 'Encryption questions reduce to a few repeatable ideas: at rest vs. in transit, client-side vs. server-side, and how AWS KMS and envelope encryption protect data keys. We make those crisp so the scenarios become predictable.',
      objectives: [
        'Distinguish encryption at rest from encryption in transit',
        'Explain envelope encryption and the role of a KMS key (CMK) and data keys',
        'Choose between client-side and server-side encryption (e.g. S3 SSE options)',
        'Use KMS key policies, grants, key rotation, and cross-account key access',
      ],
      preLearningCheck: {
        question: 'In envelope encryption with AWS KMS, what does KMS actually encrypt?',
        options: [
          'The entire object directly with the KMS key',
          'A data key, which in turn encrypts the actual data',
          'Only the object metadata',
          'The TLS session between client and server',
        ],
        correct: 1,
        note: 'Take a guess — retrieval before reading boosts retention even when wrong.',
      },
      sections: [
        {
          heading: 'At rest vs. in transit',
          body: 'Two orthogonal protections the exam expects you to separate cleanly.',
          bullets: [
            'Encryption in transit — protects data moving over the network, via TLS/HTTPS. Use ACM-managed certificates on load balancers, CloudFront, and API Gateway.',
            'Encryption at rest — protects stored data on disk, via KMS-integrated services (S3, EBS, RDS, DynamoDB) so a stolen disk reveals nothing.',
            'A complete design uses both: TLS on the wire and KMS-backed encryption on disk.',
          ],
        },
        {
          heading: 'AWS KMS and envelope encryption',
          body: 'AWS Key Management Service (KMS) manages cryptographic keys. The central concept is envelope encryption.',
          bullets: [
            'A KMS key (customer master key / CMK) never leaves KMS unencrypted; it is used to encrypt and decrypt small payloads — like data keys.',
            'Envelope encryption — KMS generates a data key, returns a plaintext copy AND an encrypted copy. Your service encrypts the actual data with the plaintext data key, then discards it, storing the encrypted data key alongside the ciphertext.',
            'To decrypt, the encrypted data key is sent to KMS, which returns the plaintext data key to decrypt the data. The large data never goes to KMS — only the small key does.',
            'GenerateDataKey is the API behind this; it is why KMS scales to encrypt huge objects efficiently.',
          ],
          callout: { type: 'tip', text: 'Why envelope encryption? Encrypting gigabytes directly with KMS would be slow and is not allowed (KMS encrypts ≤4 KB). Encrypting a tiny data key with KMS, then bulk-encrypting locally with that key, is fast and scalable.' },
        },
        {
          heading: 'Client-side vs. server-side encryption',
          body: 'Where does encryption happen? This distinction, especially for S3, is heavily tested.',
          table: {
            headers: ['Approach', 'Who encrypts', 'Examples'],
            rows: [
              ['Server-side (SSE)', 'AWS encrypts after receiving the data', 'SSE-S3 (S3-managed keys), SSE-KMS (KMS keys), SSE-C (customer-provided keys)'],
              ['Client-side', 'The application encrypts before sending to AWS', 'AWS Encryption SDK / S3 client-side encryption — AWS never sees plaintext'],
            ],
          },
          bullets: [
            'SSE-S3 — AWS manages the keys entirely; simplest.',
            'SSE-KMS — uses a KMS key, giving you audit trails (CloudTrail) and access control over the key; often the default best answer when "audit who decrypted" appears.',
            'SSE-C — you supply the key on each request; AWS uses it but does not store it.',
            'Client-side — required when AWS must never have access to plaintext or keys.',
          ],
        },
        {
          heading: 'Key policies, rotation, and cross-account use',
          body: 'Operational details that drive scenario questions.',
          bullets: [
            'Key policy — the resource policy on a KMS key defining who can use and manage it; required for cross-account key access (the other account is granted in the key policy, then via IAM in its own account).',
            'Grants — a more granular, temporary way to delegate use of a key to a principal.',
            'Automatic key rotation — for customer-managed keys, KMS can rotate the backing key material yearly while keeping the same key ID; old data stays decryptable.',
            'Enabling/disabling and scheduling deletion of keys are controlled operations — deleting a key makes its data permanently unrecoverable.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'Why does envelope encryption send only a data key to AWS KMS rather than the full object?',
          options: [
            'Because KMS cannot decrypt anything larger than the key',
            'Because KMS can only encrypt small payloads, so bulk data is encrypted locally with a KMS-protected data key',
            'Because data keys are stored permanently inside KMS',
            'Because the object is always encrypted in transit instead',
          ],
          correct: 1,
          explainCorrect: 'Correct — KMS encrypts only small payloads, so a data key is encrypted by KMS and used locally to bulk-encrypt the data efficiently.',
          elaborativePrompt: 'After the data is encrypted with the plaintext data key, why must the application discard that plaintext key? What would be the risk of keeping it next to the ciphertext?',
        },
        {
          afterSection: 2,
          question: 'A compliance requirement states that AWS must never have access to the unencrypted data or the encryption keys. Which approach satisfies this?',
          options: [
            'SSE-S3',
            'SSE-KMS',
            'Client-side encryption',
            'Encryption in transit with TLS',
          ],
          correct: 2,
          explainCorrect: 'Correct — client-side encryption encrypts the data before it ever reaches AWS, so AWS sees only ciphertext and never the keys.',
          elaborativePrompt: 'Why does SSE-KMS NOT satisfy "AWS must never access the keys," even though it gives you control and auditing over the key?',
        },
      ],
      selfExplanationPrompt: 'Walk a teammate through envelope encryption step by step, from GenerateDataKey to storing the ciphertext. Then explain in one sentence why this is faster than asking KMS to encrypt the whole object.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer must store sensitive files in Amazon S3 encrypted at rest. The security team requires that every decryption be logged and that access to the encryption key be controlled independently of the S3 bucket permissions. Which option meets these requirements with the least custom code?',
        options: [
          'SSE-S3 with S3-managed keys',
          'SSE-KMS with a customer-managed KMS key',
          'Client-side encryption with keys stored in the application',
          'No encryption, relying on bucket policies',
        ],
        correct: 1,
        explanation: {
          summary: 'SSE-KMS encrypts objects server-side using a KMS key whose use is logged in CloudTrail and controlled by a key policy independent of bucket permissions — meeting the auditing and separate-access requirements with minimal code.',
          perOption: [
            'SSE-S3 manages keys entirely within S3 with no separate key access control or per-decryption auditing of a key policy.',
            'Correct — SSE-KMS provides CloudTrail logging of key use and independent key-policy access control.',
            'Client-side encryption meets a stricter requirement but adds significant code and key-management burden not asked for here.',
            'No encryption fails the at-rest requirement entirely.',
          ],
          link: 'D2 · Task 2.2 — Encryption at rest with AWS KMS',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers KMS, envelope encryption, and S3 encryption options.',
        },
      ],
      keyTerms: [
        { term: 'Envelope encryption', def: 'Encrypting data with a data key, then encrypting that data key with a KMS key — enabling fast local bulk encryption.' },
        { term: 'KMS key (CMK)', def: 'A managed key in AWS KMS that never leaves the service unencrypted and protects data keys.' },
        { term: 'SSE-KMS', def: 'Server-side encryption using a KMS key, providing CloudTrail audit logs and key-policy access control.' },
        { term: 'Client-side encryption', def: 'Encrypting data in the application before sending it to AWS, so AWS never sees plaintext or keys.' },
        { term: 'Key policy', def: 'The resource policy on a KMS key that governs who can use and manage it, including cross-account access.' },
      ],
      awsServices: [
        { name: 'AWS KMS', purpose: 'Creates and controls encryption keys and performs envelope encryption for integrated AWS services.' },
        { name: 'AWS Certificate Manager (ACM)', purpose: 'Provisions and manages TLS certificates for encryption in transit on load balancers, CloudFront, and API Gateway.' },
      ],
      examTips: [
        'Audit who decrypted + control key separately from the resource → SSE-KMS.',
        'AWS must never see plaintext or keys → client-side encryption.',
        'Envelope encryption: KMS encrypts a small data key; the data key bulk-encrypts the object locally.',
        'In transit = TLS/ACM; at rest = KMS-integrated service encryption. A full design uses both.',
        'Deleting a KMS key permanently destroys access to data encrypted under it — disable before scheduling deletion.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · Security',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.3',
      title: 'Managing Secrets and Sensitive Data in Code',
      duration: 30,
      summary: 'The fastest way to fail a security review — and a DVA question — is a credential hard-coded in source. We cover Secrets Manager vs. SSM Parameter Store, encrypting environment variables, and handling PII so sensitive data never leaks into code or logs.',
      objectives: [
        'Choose between AWS Secrets Manager and SSM Parameter Store for a given need',
        'Use automatic rotation for database and API credentials',
        'Encrypt sensitive Lambda environment variables with KMS',
        'Classify and protect sensitive data (PII/PHI) and keep it out of logs',
      ],
      preLearningCheck: {
        question: 'An application needs database credentials that are automatically rotated on a schedule with no code changes. Which service is purpose-built for this?',
        options: [
          'SSM Parameter Store (standard tier)',
          'AWS Secrets Manager',
          'A Lambda environment variable',
          'An S3 object with the password in it',
        ],
        correct: 1,
        note: 'Guess first — the pre-test effect aids retention even on a wrong answer.',
      },
      sections: [
        {
          heading: 'Never hard-code secrets',
          body: 'A database password, API key, or token in source code or a committed config file is a breach waiting to happen — it ends up in version control, logs, and developer laptops. The DVA exam consistently rewards externalizing secrets into a managed store and fetching them at runtime with an IAM role.',
        },
        {
          heading: 'Secrets Manager vs. Parameter Store',
          body: 'Both store configuration and secrets encrypted with KMS, but they target different needs. The choice is a frequent exam question.',
          table: {
            headers: ['Aspect', 'AWS Secrets Manager', 'SSM Parameter Store'],
            rows: [
              ['Built for', 'Secrets — credentials, API keys', 'Config + secrets (SecureString)'],
              ['Automatic rotation', 'Yes — built-in, including RDS integration', 'No native rotation'],
              ['Cost', 'Per secret + per API call', 'Standard tier is free; advanced tier paid'],
              ['Size / hierarchy', 'JSON secret values', 'Hierarchical paths; standard up to 4 KB'],
              ['Best when', 'You need rotation and lifecycle management', 'Free, simple config and secrets without rotation'],
            ],
          },
          callout: { type: 'tip', text: 'Decision rule: needs automatic rotation (especially DB credentials) → Secrets Manager. Just storing config or a secret cheaply with no rotation → Parameter Store SecureString.' },
        },
        {
          heading: 'Rotation',
          body: 'Rotation periodically replaces a credential so a leaked value has a short useful life.',
          bullets: [
            'Secrets Manager rotation runs a Lambda function on a schedule to generate a new secret and update both the store and the target service (e.g. the database user).',
            'For supported databases (RDS, Aurora, Redshift, DocumentDB), rotation is largely turnkey.',
            'Applications fetch the current secret at runtime, so rotation requires no redeploy — the app always reads the latest version.',
          ],
        },
        {
          heading: 'Environment variables and sensitive data handling',
          body: 'Even outside a dedicated secret store, sensitive values need care.',
          bullets: [
            'Lambda environment variables are encrypted at rest by default; for sensitive values, encrypt them with a customer-managed KMS key and decrypt in the function — or better, fetch from Secrets Manager/Parameter Store at runtime.',
            'Data classification — know PII (personally identifiable information) and PHI (protected health information); these demand encryption and restricted access.',
            'Sanitize and mask — never log raw secrets, tokens, or PII. Mask sensitive fields before writing logs, and scrub them from error messages.',
            'Multi-tenant data — enforce per-tenant isolation in access patterns so one tenant can never read another\'s data.',
          ],
          callout: { type: 'warning', text: 'Writing a secret or PII into CloudWatch Logs is a real exam distractor and a real-world incident. Logs are widely readable — treat them as sensitive output and mask before logging.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team stores application configuration values and a few secrets but does not need automatic rotation, and wants to minimize cost. Which service fits BEST?',
          options: [
            'AWS Secrets Manager',
            'SSM Parameter Store with SecureString parameters',
            'Hard-coded constants in the code',
            'An unencrypted S3 file',
          ],
          correct: 1,
          explainCorrect: 'Correct — Parameter Store SecureString stores config and secrets encrypted with KMS at no cost in the standard tier, and rotation is not required here.',
          elaborativePrompt: 'What single requirement, if added to this scenario, would flip the best answer to Secrets Manager?',
        },
        {
          afterSection: 3,
          question: 'During debugging, a developer adds a log line that prints the full request including an authentication token. Why is this a security problem?',
          options: [
            'Logging slows the application down',
            'CloudWatch Logs are encrypted so the token is unusable',
            'Logs are broadly readable and persistent, exposing the secret to anyone with log access',
            'Tokens cannot be written to logs',
          ],
          correct: 2,
          explainCorrect: 'Correct — logs are widely accessible and retained, so a logged token is effectively a leaked credential.',
          elaborativePrompt: 'What is a safe alternative that still helps debugging — what could you log instead of the raw token to correlate requests without exposing the secret?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague the one-question test you would use to decide between Secrets Manager and Parameter Store. Then name one place sensitive data commonly leaks even when secrets are stored correctly.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer is building an application on AWS Lambda that connects to an Amazon RDS database. Security policy requires that the database password be automatically rotated every 30 days without any code deployment, and that the password never appear in source code. What should the developer use?',
        options: [
          'Store the password in a Lambda environment variable and update it manually each month',
          'Store the password in AWS Secrets Manager with automatic rotation enabled, and fetch it at runtime',
          'Hard-code the password and rely on the Lambda execution role for security',
          'Store the password in an S3 object and read it at startup',
        ],
        correct: 1,
        explanation: {
          summary: 'Secrets Manager is purpose-built for credentials with built-in automatic rotation (including RDS integration); the function fetches the current secret at runtime, so rotation needs no redeploy and nothing is hard-coded.',
          perOption: [
            'Manually updating an environment variable each month is error-prone, requires a deploy, and is not automatic rotation.',
            'Correct — Secrets Manager with rotation meets the automatic-rotation and no-hard-coding requirements directly.',
            'Hard-coding the password violates the requirement and exposes the secret in source control regardless of the execution role.',
            'An S3 object provides no rotation and adds key-management and access-control burden Secrets Manager handles natively.',
          ],
          link: 'D2 · Task 2.3 — Secret management and rotation',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers Secrets Manager, Parameter Store, and protecting sensitive data.',
        },
      ],
      keyTerms: [
        { term: 'AWS Secrets Manager', def: 'A service for storing secrets with built-in automatic rotation, including turnkey rotation for supported databases.' },
        { term: 'SSM Parameter Store', def: 'A service for hierarchical configuration and secrets (SecureString), free in the standard tier, without native rotation.' },
        { term: 'SecureString', def: 'A Parameter Store parameter type encrypted with KMS for storing sensitive values.' },
        { term: 'PII / PHI', def: 'Personally identifiable / protected health information — sensitive data classes requiring encryption and restricted access.' },
        { term: 'Rotation', def: 'Periodically replacing a credential so that a leaked value has a short useful lifetime.' },
      ],
      awsServices: [
        { name: 'AWS Secrets Manager', purpose: 'Stores and automatically rotates secrets such as database credentials and API keys.' },
        { name: 'AWS Systems Manager Parameter Store', purpose: 'Stores configuration data and secrets in a hierarchy, with KMS-encrypted SecureString values.' },
      ],
      examTips: [
        'Automatic rotation (especially RDS credentials) → Secrets Manager. Free, simple config/secrets without rotation → Parameter Store SecureString.',
        'Fetch secrets at runtime with an IAM role — never hard-code them or bake them into an image.',
        'Encrypt sensitive Lambda environment variables with a customer-managed KMS key.',
        'Never log secrets or PII — logs are broadly readable; mask before logging.',
      ],
    },

  ],
}

export default dvaC02Course
