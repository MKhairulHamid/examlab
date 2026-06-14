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
          interactive: 'lambda-concurrency',
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
          interactive: 'ddb-capacity',
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

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — DEPLOYMENT (24%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Deployment',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.1',
      title: 'Preparing Application Artifacts',
      duration: 30,
      summary: 'Before code can deploy, it must be packaged correctly. We cover infrastructure as code with AWS SAM and CloudFormation, Lambda packaging options, container images in Amazon ECR, and per-environment configuration with AppConfig.',
      objectives: [
        'Package a Lambda function as a .zip or a container image and manage its dependencies',
        'Define serverless infrastructure with AWS SAM and AWS CloudFormation templates',
        'Store and version container images in Amazon ECR',
        'Externalize per-environment configuration with AWS AppConfig and environment variables',
      ],
      preLearningCheck: {
        question: 'A team wants to define a Lambda function, an API Gateway API, and a DynamoDB table as code using a concise, serverless-focused template that transforms into CloudFormation. Which tool fits BEST?',
        options: [
          'AWS SAM (Serverless Application Model)',
          'A shell script that calls the AWS CLI',
          'Manually clicking through the console',
          'A DynamoDB table storing the config',
        ],
        correct: 0,
        note: 'Guess first — attempting before reading improves retention even on a wrong answer.',
      },
      sections: [
        {
          heading: 'Infrastructure as code: CloudFormation and SAM',
          body: 'Deployments should be repeatable and version-controlled. Infrastructure as code (IaC) declares your resources in a template so the same stack can be created identically in any environment.',
          bullets: [
            'AWS CloudFormation — the foundational IaC service; a JSON/YAML template describes resources, and CloudFormation provisions them as a managed stack.',
            'AWS SAM — a serverless-focused extension of CloudFormation with shorter syntax for functions, APIs, and tables. A SAM template transforms into standard CloudFormation at deploy time.',
            'The SAM CLI builds, packages, and deploys, and can run functions and APIs locally (sam local) for testing.',
            'AWS CDK — define infrastructure in a programming language (TypeScript, Python…) that synthesizes to CloudFormation; useful when you want loops, logic, and reuse.',
          ],
          callout: { type: 'tip', text: 'SAM vs. CloudFormation on the exam: "concise serverless template / sam local testing" → SAM. "Any resource type / maximum control" → CloudFormation. SAM IS CloudFormation under the hood.' },
        },
        {
          heading: 'Lambda packaging options',
          body: 'A Lambda deployment package can take two forms, and the exam asks you to choose.',
          table: {
            headers: ['Option', 'Limit', 'Use when'],
            rows: [
              ['.zip archive', 'Up to 250 MB unzipped (incl. layers)', 'Standard functions; share common deps via layers'],
              ['Container image', 'Up to 10 GB, stored in Amazon ECR', 'Large dependencies, custom runtimes, existing container tooling'],
            ],
          },
          bullets: [
            'Dependencies (libraries, config files) must be inside the package or a layer — a function cannot import what was not packaged.',
            'Keep the deployment package small for faster cold starts; move shared libraries into layers.',
          ],
        },
        {
          heading: 'Container images and Amazon ECR',
          body: 'Amazon Elastic Container Registry (ECR) stores and versions container images for Lambda, ECS, and EKS.',
          bullets: [
            'Push images with a tag (e.g. myapp:1.4.2); image tags identify versions for deployment.',
            'ECR integrates with IAM for access control and can scan images for vulnerabilities.',
            'For container-based Lambda, the function references an ECR image URI instead of a .zip.',
          ],
        },
        {
          heading: 'Per-environment configuration',
          body: 'The same artifact should run in dev, test, and prod with different settings. Externalize configuration rather than baking it into the build.',
          bullets: [
            'Environment variables — simple per-function/per-environment values; encrypt sensitive ones with KMS.',
            'AWS AppConfig — manage and safely deploy configuration changes (feature flags, tuning values) with validation and gradual rollout, separate from code deployments.',
            'Parameter Store / Secrets Manager — externalize config and secrets fetched at runtime (covered in Domain 2).',
          ],
          callout: { type: 'tip', text: 'AppConfig is for deploying configuration changes safely and gradually — feature flags and operational tuning — WITHOUT redeploying the application code.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'How does an AWS SAM template relate to AWS CloudFormation?',
          options: [
            'SAM replaces CloudFormation with a completely separate engine',
            'A SAM template transforms into a standard CloudFormation template at deploy time',
            'SAM only works for EC2, not serverless resources',
            'They are unrelated services',
          ],
          correct: 1,
          explainCorrect: 'Correct — SAM is an extension of CloudFormation; its concise template is transformed into full CloudFormation when deployed.',
          elaborativePrompt: 'Given that SAM is "just" CloudFormation underneath, why does AWS offer it at all? What does the shorter SAM syntax save you when defining a function plus its API and table?',
        },
        {
          afterSection: 1,
          question: 'A Lambda function needs a 4 GB machine-learning dependency that far exceeds the .zip size limit. What packaging option should the developer use?',
          options: [
            'Split the dependency across multiple layers',
            'Package the function as a container image stored in Amazon ECR',
            'Store the dependency in DynamoDB and load it at runtime',
            'Reduce the function memory to fit the limit',
          ],
          correct: 1,
          explainCorrect: 'Correct — container images support up to 10 GB, accommodating large dependencies that exceed the .zip limit.',
          elaborativePrompt: 'Why does the deployment package size affect cold-start time, and how does that influence whether you reach for a container image or trim dependencies?',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate when you would choose AWS SAM over plain CloudFormation, and when AppConfig is the right tool instead of a code deployment. Give one concrete scenario for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer maintains a serverless application made of several Lambda functions and an API Gateway API. They want to define all of it as code in a concise template, test the functions locally before deploying, and deploy consistently to multiple environments. Which approach is the BEST fit?',
        options: [
          'Write a custom Bash script that calls the AWS CLI for each resource',
          'Use AWS SAM to define the resources and the SAM CLI to build, test locally, and deploy',
          'Create the resources by hand in the AWS Management Console for each environment',
          'Store the function code in Amazon S3 and configure everything manually',
        ],
        correct: 1,
        explanation: {
          summary: 'AWS SAM provides concise serverless IaC, the SAM CLI enables local testing (sam local) and repeatable multi-environment deploys, and it transforms into CloudFormation for consistent provisioning — matching every requirement.',
          perOption: [
            'A custom CLI script is imperative, error-prone, and lacks the managed stack lifecycle and local-testing tooling SAM provides.',
            'Correct — SAM plus the SAM CLI covers concise IaC, local testing, and consistent multi-environment deployment.',
            'Manual console creation is not repeatable, not version-controlled, and drifts between environments.',
            'Storing code in S3 and configuring manually misses the IaC, local-testing, and consistency requirements.',
          ],
          link: 'D3 · Task 3.1 — Prepare artifacts with AWS SAM',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers SAM, CloudFormation, packaging, and ECR.',
        },
      ],
      keyTerms: [
        { term: 'AWS CloudFormation', def: 'The foundational IaC service that provisions resources from a JSON/YAML template as a managed stack.' },
        { term: 'AWS SAM', def: 'Serverless Application Model — a concise CloudFormation extension for functions, APIs, and tables, with a local-testing CLI.' },
        { term: 'Lambda layer', def: 'A separately packaged set of shared dependencies that functions can reuse, keeping deployment packages small.' },
        { term: 'Amazon ECR', def: 'Elastic Container Registry — stores and versions container images by tag for Lambda, ECS, and EKS.' },
        { term: 'AWS AppConfig', def: 'A service for validating and gradually deploying configuration changes separately from application code.' },
      ],
      awsServices: [
        { name: 'AWS SAM', purpose: 'Defines and deploys serverless applications with concise templates and local testing.' },
        { name: 'AWS CloudFormation', purpose: 'Provisions any AWS resource from declarative templates as managed stacks.' },
        { name: 'Amazon ECR', purpose: 'Stores, versions, and scans container images used by Lambda and container services.' },
        { name: 'AWS AppConfig', purpose: 'Deploys configuration and feature flags safely and gradually without a code release.' },
      ],
      examTips: [
        'Concise serverless template + local testing → AWS SAM (it transforms into CloudFormation).',
        'Dependency too large for a .zip (>250 MB) → container image in ECR (up to 10 GB).',
        'Deploy config/feature-flag changes without redeploying code → AppConfig.',
        'Package all dependencies in the artifact or a layer — a function cannot import what was not packaged.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Deployment',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.2 & 3.3',
      title: 'Testing and Automating Deployment Tests',
      duration: 30,
      summary: 'Shipping with confidence means testing before and during deployment. We cover unit vs. integration testing, mocking external dependencies, API Gateway stages for dev endpoints, test events for Lambda, and using approved versions for integration testing.',
      objectives: [
        'Distinguish unit, integration, and end-to-end tests and where each runs',
        'Mock external dependencies and create test events for Lambda and API Gateway',
        'Use API Gateway stages to host development and test endpoints',
        'Use Lambda aliases, container image tags, and Amplify branches to test approved versions',
      ],
      preLearningCheck: {
        question: 'A developer wants to deploy a new version of an API to a separate URL so testers can exercise it without affecting production. Which API Gateway feature provides this?',
        options: [
          'A separate AWS account per request',
          'API Gateway stages (e.g. dev, test, prod)',
          'A Lambda layer',
          'A DynamoDB global table',
        ],
        correct: 1,
        note: 'Take a guess before reading — retrieval practice helps even when wrong.',
      },
      sections: [
        {
          heading: 'The testing pyramid in an AWS app',
          body: 'Different tests catch different problems at different costs. The exam expects you to match a test type to a goal.',
          table: {
            headers: ['Test type', 'Scope', 'In AWS'],
            rows: [
              ['Unit test', 'A single function in isolation', 'Run locally / in CodeBuild; mock AWS calls'],
              ['Integration test', 'Components working together', 'Hit real or emulated services (sam local, dev stage)'],
              ['End-to-end test', 'The whole deployed system', 'Run against a deployed test environment'],
            ],
          },
        },
        {
          heading: 'Mocking and test events',
          body: 'Tests should not depend on flaky external systems. Mocking replaces a real dependency with a controlled stand-in.',
          bullets: [
            'Mock APIs / stubs — simulate an external dependency so a test runs deterministically and offline.',
            'Test events — JSON payloads that represent the event a Lambda, API Gateway, or SAM resource would receive, used to invoke and verify the function.',
            'sam local invoke / sam local start-api — run functions and APIs locally with test events before deploying.',
            'Test event-driven flows by publishing sample events to the queue/topic/bus and asserting the downstream effect.',
          ],
        },
        {
          heading: 'Stages and dev endpoints',
          body: 'API Gateway stages let one API serve multiple environments from different URLs.',
          bullets: [
            'A stage (dev, test, prod) is a named deployment of an API with its own endpoint URL and settings.',
            'Stage variables act like environment variables for a stage — e.g. point the dev stage at a dev Lambda alias and prod at the prod alias.',
            'This separates testing traffic from production without duplicating the API definition.',
          ],
        },
        {
          heading: 'Testing with approved versions',
          body: 'Automated deployment testing runs against known-good versions so results are reproducible.',
          bullets: [
            'Lambda aliases — a named pointer (e.g. "test") to a specific function version; tests target the alias so the version is controlled.',
            'Container image tags — pin integration tests to a specific image tag rather than "latest".',
            'AWS Amplify branches / AWS Copilot environments — branch- or environment-based deployments for isolated integration testing.',
            'Deploying a SAM/CloudFormation stack update to a separate staging environment lets you validate the change before promoting it.',
          ],
          callout: { type: 'tip', text: 'A Lambda alias is the unit of "an approved version to test or shift traffic to." Versions are immutable snapshots; the alias is the movable pointer.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A unit test for a Lambda function must run quickly and deterministically in the build pipeline without calling real AWS services. What technique makes this possible?',
          options: [
            'Deploy the function to production and test there',
            'Mock the AWS service calls so the function runs in isolation',
            'Remove all external calls from the function permanently',
            'Increase the function timeout',
          ],
          correct: 1,
          explainCorrect: 'Correct — mocking the AWS calls isolates the function so the unit test is fast and deterministic.',
          elaborativePrompt: 'Why is an integration test still necessary even after the unit tests pass with mocks? What class of bug can mocks never catch?',
        },
        {
          afterSection: 3,
          question: 'A team wants their integration tests to always run against a specific, approved version of a Lambda function rather than whatever was deployed last. What should they target?',
          options: [
            'The $LATEST version directly',
            'A Lambda alias pointing to the approved version',
            'A random version each run',
            'The function ARN without a qualifier',
          ],
          correct: 1,
          explainCorrect: 'Correct — an alias is a stable, named pointer to a specific approved version, ideal for controlled integration testing.',
          elaborativePrompt: 'How does using an alias for testing connect to using an alias for traffic shifting in a canary deployment? What is the common idea?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague the difference between a unit test with mocks and an integration test, and why API Gateway stages let you test a new API version safely. Use a concrete example.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer is building a serverless API and wants testers to validate new changes against a separate endpoint that uses a test version of the backend Lambda function, without affecting the production endpoint. Which combination achieves this?',
        options: [
          'Deploy a second copy of the entire application in a new AWS account for every test',
          'Use an API Gateway test stage with a stage variable pointing to a Lambda "test" alias',
          'Point all traffic at $LATEST and test in production',
          'Disable the production stage while testing',
        ],
        correct: 1,
        explanation: {
          summary: 'An API Gateway test stage gives testers a separate URL, and a stage variable referencing a Lambda test alias routes that stage to the approved test version — isolating test traffic from production cleanly.',
          perOption: [
            'A whole new account per test is heavy, slow, and unnecessary when stages and aliases provide isolation within the same setup.',
            'Correct — a test stage plus a stage-variable-driven Lambda alias isolates the test version from production.',
            'Testing in production against $LATEST risks breaking live users and gives no isolation.',
            'Disabling the production stage causes an outage and still does not provide a controlled test version.',
          ],
          link: 'D3 · Task 3.2/3.3 — Stages, aliases, and automated deployment testing',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers testing, API Gateway stages, and Lambda aliases.',
        },
      ],
      keyTerms: [
        { term: 'Unit test', def: 'A test of a single function in isolation, typically with external dependencies mocked.' },
        { term: 'Integration test', def: 'A test of multiple components working together against real or emulated services.' },
        { term: 'API Gateway stage', def: 'A named deployment of an API (dev/test/prod) with its own URL and stage variables.' },
        { term: 'Lambda alias', def: 'A stable named pointer to a specific Lambda version, used for testing and traffic shifting.' },
        { term: 'Test event', def: 'A JSON payload representing an event a function would receive, used to invoke and verify it.' },
      ],
      awsServices: [
        { name: 'AWS SAM CLI', purpose: 'Builds and runs functions and APIs locally (sam local) with test events before deployment.' },
        { name: 'Amazon API Gateway', purpose: 'Hosts APIs across stages with stage variables to separate dev, test, and prod.' },
        { name: 'AWS Lambda (versions & aliases)', purpose: 'Immutable versions plus movable aliases enable controlled testing and traffic shifting.' },
      ],
      examTips: [
        'Separate test endpoint without affecting prod → API Gateway stages + stage variables.',
        'Deterministic, offline unit tests → mock the AWS service calls.',
        'Test/shift against an approved version → Lambda alias (versions are immutable; the alias moves).',
        'Run functions and APIs locally before deploying → sam local with test events.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Deployment',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.4',
      title: 'CI/CD with AWS Developer Tools',
      duration: 30,
      summary: 'A commit should flow automatically to a tested deployment. We map the AWS CI/CD services — CodePipeline, CodeBuild, CodeArtifact, and CodeDeploy — and how a buildspec, source repository, and pipeline stages fit together.',
      objectives: [
        'Identify what CodePipeline, CodeBuild, CodeDeploy, and CodeArtifact each do',
        'Write the role of a buildspec.yml in a CodeBuild project',
        'Trigger build, test, and deploy actions from a commit to a repository',
        'Use orchestrated pipeline stages to promote code across environments',
      ],
      preLearningCheck: {
        question: 'In an AWS CI/CD pipeline, which service is responsible for compiling code and running tests according to a buildspec file?',
        options: [
          'AWS CodePipeline',
          'AWS CodeBuild',
          'AWS CodeDeploy',
          'AWS CodeArtifact',
        ],
        correct: 1,
        note: 'Guess before reading — the pre-test effect aids retention even on a wrong guess.',
      },
      sections: [
        {
          heading: 'The AWS CI/CD service map',
          body: 'Each "Code" service owns one stage of the pipeline. Confusing them is a top exam pitfall — learn the one-line job of each.',
          table: {
            headers: ['Service', 'Job', 'Analogy'],
            rows: [
              ['CodePipeline', 'Orchestrates the stages (source → build → test → deploy)', 'The conductor'],
              ['CodeBuild', 'Compiles code and runs tests per a buildspec', 'The build server'],
              ['CodeDeploy', 'Deploys the built artifact to compute (EC2, Lambda, ECS)', 'The release agent'],
              ['CodeArtifact', 'Stores and shares software packages/dependencies', 'The package repository'],
            ],
          },
          callout: { type: 'tip', text: 'Mnemonic: Pipeline orchestrates, Build builds, Deploy deploys, Artifact stores artifacts. Match the verb to the service and most questions resolve themselves.' },
        },
        {
          heading: 'CodeBuild and the buildspec',
          body: 'CodeBuild runs your build in a managed container. It is configured by a buildspec.yml at the repo root.',
          bullets: [
            'The buildspec defines phases: install, pre_build, build, post_build — each a list of shell commands.',
            'It declares artifacts (the output files to pass to the next stage) and can cache dependencies.',
            'Environment variables (including secrets from Secrets Manager / Parameter Store) feed configuration into the build.',
            'CodeBuild reports test results and build logs to CloudWatch Logs.',
          ],
        },
        {
          heading: 'From commit to deployment',
          body: 'A pipeline turns a source change into a deployment automatically.',
          bullets: [
            'Source stage — a commit to a repository (e.g. GitHub, CodeCommit, S3) triggers the pipeline.',
            'Build stage — CodeBuild compiles and tests, producing an artifact.',
            'Deploy stage — CodeDeploy (or CloudFormation/SAM) releases the artifact to the target environment.',
            'Stages run in order; an action that fails stops the pipeline so a broken build never reaches production.',
          ],
        },
        {
          heading: 'Promoting across environments',
          body: 'Orchestrated workflows promote a change through environments with controls.',
          bullets: [
            'Add sequential stages (e.g. deploy-to-test → manual approval → deploy-to-prod) so changes are validated before production.',
            'Manual approval actions pause the pipeline for a human gate.',
            'Branches and labels manage versions and releases; a feature branch can drive its own pipeline or environment.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'Which AWS service orchestrates the overall flow of source, build, and deploy stages?',
          options: [
            'AWS CodeBuild',
            'AWS CodePipeline',
            'AWS CodeDeploy',
            'AWS CodeArtifact',
          ],
          correct: 1,
          explainCorrect: 'Correct — CodePipeline is the orchestrator that connects and sequences the stages.',
          elaborativePrompt: 'Why is it useful to separate orchestration (CodePipeline) from the actual build (CodeBuild) and deploy (CodeDeploy) steps, rather than one service doing everything?',
        },
        {
          afterSection: 1,
          question: 'Where do you define the commands CodeBuild runs to install dependencies, build, and test your application?',
          options: [
            'In a buildspec.yml file',
            'In the DynamoDB table',
            'In the Lambda environment variables',
            'In an IAM policy',
          ],
          correct: 0,
          explainCorrect: 'Correct — the buildspec.yml defines the build phases and commands CodeBuild executes.',
          elaborativePrompt: 'Why is keeping the buildspec in the source repository (rather than only in the console) valuable for reproducibility and version control?',
        },
      ],
      selfExplanationPrompt: 'Without looking, state the one-line job of CodePipeline, CodeBuild, CodeDeploy, and CodeArtifact. Then describe how a single git commit travels through them to reach production.',
      sample: {
        type: 'multiple-choice',
        stem: 'A development team wants every commit to their repository to automatically compile the code, run the test suite, and—only if tests pass—deploy the application to a staging environment, with a manual approval before production. Which AWS services should orchestrate and execute this workflow?',
        options: [
          'CodeArtifact orchestrates while CodeCommit builds and deploys',
          'CodePipeline orchestrates the stages, CodeBuild compiles and tests, and CodeDeploy releases the artifact',
          'CodeDeploy orchestrates while CodeBuild stores the packages',
          'A single Lambda function does compile, test, and deploy in one invocation',
        ],
        correct: 1,
        explanation: {
          summary: 'CodePipeline sequences source → build → (approval) → deploy; CodeBuild runs the compile and tests via a buildspec; CodeDeploy releases the artifact — the canonical AWS CI/CD division of labor.',
          perOption: [
            'CodeArtifact is a package repository, not an orchestrator, and CodeCommit is a source repository, not a build/deploy engine.',
            'Correct — Pipeline orchestrates, Build builds and tests, Deploy releases, with a manual-approval action before prod.',
            'CodeDeploy deploys; it does not orchestrate, and CodeBuild builds rather than storing packages (that is CodeArtifact).',
            'Cramming compile/test/deploy into one Lambda discards the staged, gated, observable pipeline the requirement describes.',
          ],
          link: 'D3 · Task 3.4 — CI/CD with AWS developer tools',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers CodePipeline, CodeBuild, CodeDeploy, and CodeArtifact.',
        },
      ],
      keyTerms: [
        { term: 'AWS CodePipeline', def: 'Orchestrates CI/CD stages (source, build, test, deploy) and sequences their actions.' },
        { term: 'AWS CodeBuild', def: 'A managed build service that compiles code and runs tests according to a buildspec.yml.' },
        { term: 'AWS CodeDeploy', def: 'Deploys application artifacts to EC2, Lambda, or ECS using configurable deployment strategies.' },
        { term: 'AWS CodeArtifact', def: 'A managed artifact repository for storing and sharing software packages and dependencies.' },
        { term: 'buildspec.yml', def: 'The YAML file defining CodeBuild build phases, commands, and output artifacts.' },
      ],
      awsServices: [
        { name: 'AWS CodePipeline', purpose: 'Automates and orchestrates the release pipeline from source to deployment.' },
        { name: 'AWS CodeBuild', purpose: 'Compiles source, runs tests, and produces build artifacts in a managed container.' },
        { name: 'AWS CodeDeploy', purpose: 'Releases artifacts to compute targets with strategies like blue/green and canary.' },
        { name: 'AWS CodeArtifact', purpose: 'Stores and serves software package dependencies for builds.' },
      ],
      examTips: [
        'Match the verb: Pipeline orchestrates, Build builds/tests, Deploy deploys, Artifact stores packages.',
        'Build commands and phases live in buildspec.yml in the repo.',
        'A failed stage stops the pipeline — broken builds never reach production.',
        'Add a manual-approval action for a human gate before deploying to prod.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s12',
      number: 12,
      module: 'Domain 3 · Deployment',
      domain: 'd3',
      weight: '24%',
      task: 'Task 3.4',
      title: 'Deployment Strategies and Rollbacks',
      duration: 30,
      summary: 'How you release matters as much as what you release. We compare all-at-once, rolling, canary, and blue/green deployments, and how Lambda versions, aliases, and weighted traffic shifting implement safe releases with instant rollback.',
      objectives: [
        'Compare all-at-once, rolling, canary, and blue/green deployment strategies',
        'Use Lambda versions and aliases with weighted traffic shifting for canary releases',
        'Choose a strategy based on downtime tolerance, rollback speed, and cost',
        'Perform rollbacks using the chosen deployment strategy',
      ],
      preLearningCheck: {
        question: 'A team needs to release a new version with the ability to roll back instantly if errors spike, and they can afford to run a second full environment temporarily. Which strategy fits BEST?',
        options: [
          'All-at-once',
          'Blue/green',
          'Rolling',
          'In-place without versioning',
        ],
        correct: 1,
        note: 'Guess first — attempting before reading strengthens memory even when wrong.',
      },
      sections: [
        {
          heading: 'The four strategies',
          body: 'Each strategy is a different point on the speed/risk/cost curve. The exam gives you a constraint and asks for the matching strategy.',
          interactive: 'deploy-strategy',
          table: {
            headers: ['Strategy', 'How it works', 'Trade-off'],
            rows: [
              ['All-at-once', 'Replace everything simultaneously', 'Fastest and cheapest; brief downtime, full blast radius'],
              ['Rolling', 'Replace instances in batches on the same fleet', 'No extra capacity; slower, mixed versions during rollout'],
              ['Canary', 'Shift a small % of traffic first, then the rest', 'Limits blast radius; needs traffic-shifting support'],
              ['Blue/Green', 'Stand up a parallel environment and switch over', 'Instant rollback; costs a second full environment'],
            ],
          },
        },
        {
          heading: 'Lambda versions, aliases, and traffic shifting',
          body: 'Lambda has native primitives that implement canary and blue/green releases.',
          bullets: [
            'Version — an immutable snapshot of function code and configuration (e.g. version 7). $LATEST is the mutable working copy.',
            'Alias — a movable named pointer (e.g. "prod") to a version. Clients invoke the alias, so you can repoint it without changing callers.',
            'Weighted alias — an alias can split traffic between two versions (e.g. 90% v6 / 10% v7). This is how you canary a Lambda: shift a small percentage, watch metrics, then move to 100%.',
            'CodeDeploy can automate this shift (Canary10Percent5Minutes, Linear, AllAtOnce) and roll back automatically on a CloudWatch alarm.',
          ],
          callout: { type: 'tip', text: 'A weighted Lambda alias = built-in canary. Roll back by shifting weight back to the old version — no redeploy needed.' },
        },
        {
          heading: 'Choosing and rolling back',
          body: 'Map the requirement to the strategy, and know how each rolls back.',
          bullets: [
            'Zero downtime + instant rollback, budget for a second environment → blue/green (switch the router back to blue).',
            'Limit blast radius, validate on real traffic gradually → canary (shift weight back on failure).',
            'No spare capacity, downtime not acceptable but slower rollout fine → rolling (redeploy previous version to roll back).',
            'Cost/speed priority, brief downtime acceptable → all-at-once.',
            'Automated rollback: tie the deployment to a CloudWatch alarm so a spike in errors reverts the release automatically.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'Which deployment strategy replaces instances in batches using the existing fleet, without provisioning a second full environment?',
          options: [
            'Blue/green',
            'Rolling',
            'All-at-once',
            'Canary',
          ],
          correct: 1,
          explainCorrect: 'Correct — a rolling deployment updates the fleet in batches, so no duplicate environment is needed.',
          elaborativePrompt: 'What is the main downside of rolling compared to blue/green when a bad version is detected mid-rollout? Think about rollback speed and mixed versions.',
        },
        {
          afterSection: 1,
          question: 'How can a developer route 10% of traffic to a new Lambda version while keeping 90% on the current version?',
          options: [
            'Create two separate functions and a load balancer',
            'Use a weighted Lambda alias that splits traffic between the two versions',
            'Edit $LATEST directly during business hours',
            'Use a DynamoDB table to track which users get the new version',
          ],
          correct: 1,
          explainCorrect: 'Correct — a weighted alias splits invocation traffic between two versions, implementing a canary release natively.',
          elaborativePrompt: 'Why is rolling back a weighted-alias canary faster than rolling back an all-at-once deployment? What exactly do you change?',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate how a weighted Lambda alias implements a canary deployment, and how you would roll it back. Then name the one strategy you would pick when instant rollback matters most and budget is not a constraint.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer must release a new version of a Lambda-backed API. The business requires that only a small fraction of users hit the new version at first, with automatic rollback if the error rate rises, before the rest of the traffic is shifted. Which approach meets these requirements with the least custom code?',
        options: [
          'Deploy all-at-once and monitor manually, rolling back by redeploying if needed',
          'Use a weighted Lambda alias with CodeDeploy canary traffic shifting and a CloudWatch alarm for automatic rollback',
          'Run two separate stacks and switch DNS manually',
          'Update $LATEST in production and watch the logs',
        ],
        correct: 1,
        explanation: {
          summary: 'A weighted alias shifts a small traffic percentage to the new version; CodeDeploy automates the canary shift and triggers an automatic rollback on a CloudWatch alarm — exactly the gradual, self-protecting release described, with minimal custom code.',
          perOption: [
            'All-at-once exposes every user immediately and relies on manual rollback — the opposite of a small-fraction canary with automatic rollback.',
            'Correct — weighted alias + CodeDeploy canary + CloudWatch alarm delivers gradual exposure and automatic rollback natively.',
            'Manual DNS switching between stacks is slow, error-prone, and does not provide gradual percentage-based exposure or automatic rollback.',
            'Editing $LATEST in production gives no traffic control, no canary, and no automatic rollback.',
          ],
          link: 'D3 · Task 3.4 — Deployment strategies and rollback',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers deployment strategies, Lambda aliases, and traffic shifting.',
        },
      ],
      keyTerms: [
        { term: 'Blue/green deployment', def: 'Releasing to a parallel environment and switching traffic over, enabling instant rollback.' },
        { term: 'Canary deployment', def: 'Shifting a small percentage of traffic to the new version first, then completing the rollout.' },
        { term: 'Rolling deployment', def: 'Replacing instances in batches on the existing fleet, with no duplicate environment.' },
        { term: 'Lambda version vs. alias', def: 'A version is an immutable code snapshot; an alias is a movable pointer (optionally weighted) to a version.' },
        { term: 'Weighted alias', def: 'A Lambda alias that splits invocation traffic between two versions to implement canary releases.' },
      ],
      awsServices: [
        { name: 'AWS Lambda (versions/aliases)', purpose: 'Provides immutable versions and weighted aliases for canary and blue/green releases.' },
        { name: 'AWS CodeDeploy', purpose: 'Automates traffic-shifting deployments and rolls back automatically on a CloudWatch alarm.' },
        { name: 'Amazon CloudWatch', purpose: 'Alarms on error/latency metrics that trigger automatic deployment rollback.' },
      ],
      examTips: [
        'Instant rollback + can afford a second environment → blue/green.',
        'Gradual exposure / limit blast radius → canary (weighted Lambda alias).',
        'No spare capacity, slower rollout acceptable → rolling. Cost/speed, brief downtime OK → all-at-once.',
        'Automatic rollback → tie CodeDeploy to a CloudWatch alarm.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — TROUBLESHOOTING AND OPTIMIZATION (18%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s13',
      number: 13,
      module: 'Domain 4 · Troubleshooting & Optimization',
      domain: 'd4',
      weight: '18%',
      task: 'Task 4.1',
      title: 'Root Cause Analysis with CloudWatch and X-Ray',
      duration: 30,
      summary: 'When something breaks, the developer reads the evidence. We cover CloudWatch Logs and Logs Insights for querying, CloudWatch metrics and alarms, and AWS X-Ray for tracing a request across services to find where it failed or slowed down.',
      objectives: [
        'Find and query application logs with CloudWatch Logs and Logs Insights',
        'Interpret metrics, alarms, and dashboards to spot anomalies',
        'Use AWS X-Ray traces to locate failures and latency across services',
        'Troubleshoot deployment failures and service-integration issues from logs',
      ],
      preLearningCheck: {
        question: 'A request passes through API Gateway, a Lambda function, and DynamoDB, and is intermittently slow. Which AWS service best shows WHERE in that chain the latency occurs?',
        options: [
          'CloudWatch Logs alone',
          'AWS X-Ray distributed tracing',
          'AWS CloudTrail',
          'Amazon Inspector',
        ],
        correct: 1,
        note: 'Take a guess before reading — retrieval practice helps even on a wrong answer.',
      },
      sections: [
        {
          heading: 'The three signals: logs, metrics, traces',
          body: 'Observability rests on three kinds of data, and each answers a different question.',
          table: {
            headers: ['Signal', 'Answers', 'Service'],
            rows: [
              ['Logs', 'What exactly happened (events, errors)?', 'CloudWatch Logs'],
              ['Metrics', 'Is something abnormal over time (rates, counts)?', 'CloudWatch Metrics/Alarms'],
              ['Traces', 'Where in a multi-service request did it fail or slow?', 'AWS X-Ray'],
            ],
          },
        },
        {
          heading: 'CloudWatch Logs and Logs Insights',
          body: 'Lambda, API Gateway, and many services emit logs to CloudWatch Logs automatically (via the execution role\'s permissions).',
          bullets: [
            'Log groups organize logs by source; log streams hold the individual entries.',
            'CloudWatch Logs Insights — a query language to search and aggregate logs (filter, stats, sort) across a log group, e.g. count errors by type or find the slowest requests.',
            'Metric filters turn a log pattern (e.g. "ERROR") into a CloudWatch metric you can alarm on.',
            'A common deployment-failure workflow: read the service\'s log output (CodeBuild logs, Lambda logs) to find the exact error.',
          ],
          callout: { type: 'tip', text: 'Query logs to find relevant data → CloudWatch Logs Insights. It is the answer when a question says "search across logs" or "aggregate log data to find the cause."' },
        },
        {
          heading: 'Metrics, alarms, and dashboards',
          body: 'Metrics summarize behavior over time so you can detect and alert on problems.',
          bullets: [
            'CloudWatch metrics (e.g. Lambda Errors, Throttles, Duration; DynamoDB ThrottledRequests) reveal abnormal trends.',
            'Alarms watch a metric against a threshold and trigger actions (notify via SNS, trigger auto scaling, roll back a deployment).',
            'Dashboards combine metrics and logs for an at-a-glance health view.',
          ],
        },
        {
          heading: 'Tracing with AWS X-Ray',
          body: 'X-Ray follows a single request as it travels across services, producing a service map and per-segment timing.',
          bullets: [
            'Instrument the application (X-Ray SDK or auto-instrumentation) so each hop records a segment/subsegment.',
            'The service map shows the call graph; faults and high-latency segments are highlighted, pinpointing the culprit hop.',
            'Trace data exposes downstream call latency (e.g. a slow DynamoDB query) and service-integration errors.',
            'Use X-Ray when the problem spans services and logs alone cannot show where the time goes.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A developer needs to search across thousands of Lambda log entries to count how many failed with a specific error and find the slowest invocations. Which tool is designed for this?',
          options: [
            'AWS CloudTrail event history',
            'CloudWatch Logs Insights queries',
            'AWS X-Ray service map',
            'Amazon Athena on the function code',
          ],
          correct: 1,
          explainCorrect: 'Correct — Logs Insights provides a query language to filter and aggregate log data across a log group.',
          elaborativePrompt: 'How does CloudTrail differ from CloudWatch Logs in what it records? Why would CloudTrail not help debug an application error inside a function?',
        },
        {
          afterSection: 3,
          question: 'An API request that spans API Gateway, Lambda, and DynamoDB is intermittently slow, but the Lambda logs look normal. What is the BEST tool to locate the slow hop?',
          options: [
            'Increase the Lambda timeout',
            'AWS X-Ray distributed tracing',
            'A larger DynamoDB table',
            'CloudTrail management events',
          ],
          correct: 1,
          explainCorrect: 'Correct — X-Ray traces the request across services and highlights which segment (hop) is slow.',
          elaborativePrompt: 'Why can per-service logs alone miss a cross-service latency problem that X-Ray reveals? What does a trace capture that separate logs do not?',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague the difference between logs, metrics, and traces by naming the question each one answers. Then describe a debugging situation where you would reach for X-Ray rather than Logs Insights.',
      sample: {
        type: 'multiple-choice',
        stem: 'A serverless application composed of API Gateway, several Lambda functions, and DynamoDB is experiencing intermittent high latency. The team has checked individual Lambda logs but cannot determine which component is responsible. What should they use to identify the source of the latency?',
        options: [
          'Enable AWS X-Ray tracing to see a service map and per-segment timing across the request path',
          'Increase the memory of every Lambda function',
          'Review AWS CloudTrail management events',
          'Add more DynamoDB read capacity preemptively',
        ],
        correct: 0,
        explanation: {
          summary: 'X-Ray traces each request across API Gateway, Lambda, and DynamoDB and highlights the slow segment, pinpointing the responsible component — which per-service logs alone could not reveal.',
          perOption: [
            'Correct — X-Ray distributed tracing shows where in the multi-service path the latency occurs.',
            'Blindly increasing memory everywhere is guesswork without knowing which component is slow.',
            'CloudTrail records API/management activity for auditing, not request-level latency across services.',
            'Adding DynamoDB capacity assumes the database is the cause before any evidence identifies it.',
          ],
          link: 'D4 · Task 4.1 — Root cause analysis with X-Ray and CloudWatch',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers CloudWatch Logs, Logs Insights, metrics, and X-Ray.',
        },
      ],
      keyTerms: [
        { term: 'CloudWatch Logs', def: 'The service that collects and stores log events from Lambda, API Gateway, and other sources.' },
        { term: 'CloudWatch Logs Insights', def: 'A query language for searching and aggregating log data across a log group.' },
        { term: 'CloudWatch alarm', def: 'A rule that watches a metric against a threshold and triggers actions such as SNS notifications or rollbacks.' },
        { term: 'AWS X-Ray', def: 'A distributed tracing service that maps a request across services and highlights faults and latency.' },
        { term: 'Metric filter', def: 'A rule that converts a log pattern into a CloudWatch metric for alarming.' },
      ],
      awsServices: [
        { name: 'Amazon CloudWatch', purpose: 'Collects logs, metrics, alarms, and dashboards for monitoring and troubleshooting.' },
        { name: 'AWS X-Ray', purpose: 'Traces requests across services to locate failures and latency bottlenecks.' },
        { name: 'AWS CloudTrail', purpose: 'Records API/management activity for auditing and security investigation (not app-level latency).' },
      ],
      examTips: [
        'Search/aggregate across logs → CloudWatch Logs Insights.',
        'Find the slow or failing hop across multiple services → AWS X-Ray.',
        'Audit who did what API call → CloudTrail (not the tool for debugging app errors).',
        'Turn a log pattern like "ERROR" into an alertable metric → a metric filter + CloudWatch alarm.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s14',
      number: 14,
      module: 'Domain 4 · Troubleshooting & Optimization',
      domain: 'd4',
      weight: '18%',
      task: 'Task 4.2',
      title: 'Instrumenting Code for Observability',
      duration: 30,
      summary: 'You cannot debug what you cannot see. We cover structured logging, custom metrics with the CloudWatch embedded metric format (EMF), X-Ray annotations, notification alerts, and health checks — the instrumentation that makes an application observable.',
      objectives: [
        'Distinguish logging, monitoring, and observability',
        'Emit custom metrics, including via the CloudWatch embedded metric format (EMF)',
        'Add structured logs and X-Ray annotations for searchable, traceable telemetry',
        'Configure notification alerts and application health checks',
      ],
      preLearningCheck: {
        question: 'A developer wants to publish a custom business metric (e.g. orders processed) from a Lambda function with minimal API calls, by writing a specially structured log entry that CloudWatch parses into a metric. Which approach is this?',
        options: [
          'CloudWatch embedded metric format (EMF)',
          'A CloudTrail trail',
          'An X-Ray annotation',
          'A DynamoDB stream',
        ],
        correct: 0,
        note: 'Guess first — the pre-test effect aids retention even when wrong.',
      },
      sections: [
        {
          heading: 'Logging vs. monitoring vs. observability',
          body: 'The exam expects you to separate these related ideas.',
          bullets: [
            'Logging — recording discrete events and state ("order 123 failed validation").',
            'Monitoring — watching known metrics and alarming on thresholds ("error rate > 1%").',
            'Observability — being able to ask new questions about system behavior from rich telemetry (logs + metrics + traces) without shipping new code first.',
            'Good instrumentation is what turns raw logging into observability.',
          ],
        },
        {
          heading: 'Structured logging',
          body: 'Logs are far more useful when they are machine-readable.',
          bullets: [
            'Emit logs as structured JSON (key/value fields) instead of free text, so Logs Insights can filter and aggregate on fields.',
            'Include correlation IDs (e.g. a request ID) so you can trace one transaction across functions and services.',
            'Log user actions and application events at appropriate levels — and never log secrets or PII.',
          ],
        },
        {
          heading: 'Custom metrics and EMF',
          body: 'Beyond built-in metrics, you can publish your own business and performance metrics.',
          bullets: [
            'PutMetricData — the direct API to publish a custom metric; simple but an API call per batch.',
            'CloudWatch embedded metric format (EMF) — write a specially structured JSON log line and CloudWatch automatically extracts metrics from it. Efficient for high-volume metrics from Lambda because it piggybacks on logging.',
            'Use dimensions to slice a metric (e.g. orders by region) and choose meaningful units.',
          ],
          callout: { type: 'tip', text: 'EMF is the exam answer for "emit custom metrics efficiently from Lambda without a separate PutMetricData call per data point" — the metric rides along in the log.' },
        },
        {
          heading: 'Tracing annotations, alerts, and health checks',
          body: 'Round out instrumentation with tracing metadata, proactive alerts, and health signals.',
          bullets: [
            'X-Ray annotations — indexed key/value pairs added to a trace so you can filter traces (e.g. by customer or version); metadata is non-indexed extra context.',
            'Notification alerts — CloudWatch alarms publishing to Amazon SNS notify on specific conditions (quota limits approaching, deployment completed, error spike).',
            'Health checks and readiness probes — endpoints/configuration that report whether an instance or container is healthy and ready to receive traffic (used by ELB, ECS, Route 53).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'Why is structured (JSON) logging preferable to free-text logging when using CloudWatch Logs Insights?',
          options: [
            'It uses less storage in every case',
            'Insights can filter and aggregate on specific fields rather than parsing free text',
            'Free-text logs cannot be stored in CloudWatch',
            'JSON logs are automatically encrypted and text logs are not',
          ],
          correct: 1,
          explainCorrect: 'Correct — structured fields let Logs Insights query and aggregate precisely, which is hard with unstructured text.',
          elaborativePrompt: 'How does including a correlation/request ID in every structured log line make debugging a multi-function transaction dramatically easier?',
        },
        {
          afterSection: 2,
          question: 'A high-throughput Lambda function must emit a custom metric on every invocation with minimal overhead and no extra API call per data point. Which approach fits BEST?',
          options: [
            'Call PutMetricData synchronously on every invocation',
            'Use the CloudWatch embedded metric format (EMF) in the function logs',
            'Write the metric to DynamoDB and query it later',
            'Store metrics in an S3 file per invocation',
          ],
          correct: 1,
          explainCorrect: 'Correct — EMF embeds the metric in a structured log line, so CloudWatch extracts it without a separate metric API call per data point.',
          elaborativePrompt: 'What is the cost or performance downside of calling PutMetricData on every single invocation in a high-volume function, and how does EMF avoid it?',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate the difference between monitoring and observability, and why structured logging plus EMF custom metrics move an application toward the latter. Give one new question observability lets you answer that plain logging does not.',
      sample: {
        type: 'multiple-choice',
        stem: 'A developer needs a Lambda function to publish a custom "PaymentsProcessed" metric on every invocation. The function runs at very high volume, and the team wants to avoid the throttling and latency of calling the CloudWatch API for each data point. What is the MOST efficient way to emit this custom metric?',
        options: [
          'Call PutMetricData once per invocation',
          'Write the metric using the CloudWatch embedded metric format (EMF) in the function logs',
          'Store each value in DynamoDB and run a nightly aggregation',
          'Print the value to the logs as free text and parse it manually later',
        ],
        correct: 1,
        explanation: {
          summary: 'EMF lets the function emit a structured log line that CloudWatch automatically converts into a metric — no per-invocation metric API call, so it scales efficiently for high-volume functions.',
          perOption: [
            'Calling PutMetricData per invocation adds an API call, latency, and throttling risk at high volume.',
            'Correct — EMF embeds the metric in the log, avoiding a separate API call per data point.',
            'A nightly DynamoDB aggregation is not a real-time metric and adds storage and compute overhead.',
            'Free-text logs are not automatically a metric and require fragile manual parsing.',
          ],
          link: 'D4 · Task 4.2 — Custom metrics with the embedded metric format',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers structured logging, custom metrics, and X-Ray instrumentation.',
        },
      ],
      keyTerms: [
        { term: 'Observability', def: 'The ability to ask new questions about system behavior from rich telemetry without first shipping new code.' },
        { term: 'Structured logging', def: 'Emitting logs as machine-readable JSON fields so they can be filtered and aggregated precisely.' },
        { term: 'Embedded metric format (EMF)', def: 'A CloudWatch log format that lets a structured log line be automatically extracted into a metric.' },
        { term: 'X-Ray annotation', def: 'An indexed key/value pair on a trace used to filter and search traces.' },
        { term: 'Health check', def: 'A signal that reports whether an instance or container is healthy and ready to serve traffic.' },
      ],
      awsServices: [
        { name: 'Amazon CloudWatch', purpose: 'Stores logs and metrics, including EMF-extracted custom metrics, and alarms on them.' },
        { name: 'AWS X-Ray', purpose: 'Captures traces with annotations and metadata for searchable, end-to-end visibility.' },
        { name: 'Amazon SNS', purpose: 'Delivers notification alerts triggered by CloudWatch alarms.' },
      ],
      examTips: [
        'Efficient custom metrics from high-volume Lambda → EMF (metric rides in the log), not PutMetricData per call.',
        'Make logs queryable in Logs Insights → structured JSON with correlation IDs.',
        'Filter/search traces by a value → X-Ray annotations (indexed); metadata is non-indexed context.',
        'Notify on a condition (quota, deploy done, error spike) → CloudWatch alarm → SNS.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s15',
      number: 15,
      module: 'Domain 4 · Troubleshooting & Optimization',
      domain: 'd4',
      weight: '18%',
      task: 'Task 4.3',
      title: 'Optimizing Application Performance',
      duration: 30,
      summary: 'We close the course by making applications faster and cheaper: tuning Lambda memory and concurrency, caching at multiple layers, optimizing messaging, and using metrics and traces to find and fix bottlenecks.',
      objectives: [
        'Tune Lambda memory and concurrency for performance and cost',
        'Apply caching at the right layer (CloudFront, API Gateway, ElastiCache/DAX, app-level)',
        'Use subscription filter policies to reduce unnecessary message processing',
        'Identify performance bottlenecks from metrics, traces, and logs',
      ],
      preLearningCheck: {
        question: 'A Lambda function is CPU-bound and runs slowly. Increasing which single setting also increases its CPU allocation, often making it faster and sometimes cheaper overall?',
        options: [
          'Timeout',
          'Memory',
          'Reserved concurrency',
          'Ephemeral storage',
        ],
        correct: 1,
        note: 'Take a guess before reading — retrieval before content improves retention.',
      },
      sections: [
        {
          heading: 'Tuning Lambda for performance and cost',
          body: 'Lambda performance optimization is mostly about memory, concurrency, and reuse.',
          bullets: [
            'Memory sizing — memory scales CPU and network proportionally; a higher setting can finish faster AND cost less (cost = GB-seconds). Profile to find the sweet spot (e.g. with Lambda Power Tuning).',
            'Provisioned concurrency — removes cold-start latency for predictable or latency-sensitive workloads (Session 2).',
            'Reuse — initialize SDK clients and connections outside the handler so warm invocations reuse them; keep deployment packages small.',
            'Right-size to the minimum memory/compute that meets the latency target — over-provisioning wastes cost.',
          ],
        },
        {
          heading: 'Caching at the right layer',
          body: 'Caching is the highest-leverage optimization, but it must sit at the correct layer for the workload.',
          table: {
            headers: ['Layer', 'Service', 'Caches'],
            rows: [
              ['Edge / content', 'Amazon CloudFront', 'Static and cacheable responses near users; cache by request headers'],
              ['API', 'API Gateway caching', 'Responses for repeated API requests'],
              ['Database', 'DAX (DynamoDB) / ElastiCache', 'Hot reads to cut database load and latency'],
              ['Application', 'In-process / ElastiCache', 'Computed results and session data'],
            ],
          },
          callout: { type: 'tip', text: 'Cache content based on request headers → CloudFront cache behaviors. Cache hot DynamoDB reads with no code rewrite → DAX. Cache arbitrary computed data/sessions → ElastiCache.' },
        },
        {
          heading: 'Optimizing messaging',
          body: 'Process only the messages that matter.',
          bullets: [
            'Subscription filter policies — on SNS subscriptions (and EventBridge rules), filter so a subscriber only receives the messages it cares about, avoiding wasteful downstream invocations.',
            'Batch processing — let Lambda process SQS/Kinesis records in batches to reduce per-message overhead.',
            'Tune batch size and concurrency to balance throughput against downstream pressure.',
          ],
        },
        {
          heading: 'Finding bottlenecks',
          body: 'Optimization is data-driven — measure, then fix the actual constraint.',
          bullets: [
            'Use CloudWatch metrics (Duration, Throttles, IteratorAge) and X-Ray traces to locate the slow segment.',
            'Use application logs to identify slow queries or hot code paths.',
            'A Scan or a missing index on DynamoDB, an undersized cache, or an N+1 call pattern are common culprits — address the measured bottleneck rather than guessing.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A CPU-bound Lambda function is slow at 128 MB. The developer raises it to 1024 MB and it finishes much faster. Why can this also reduce cost?',
          options: [
            'Higher memory has a lower per-GB price',
            'More memory means proportionally more CPU, so the function runs for far less time, and cost is memory × time',
            'Cost is based only on the number of invocations',
            'Lambda gives free CPU above 512 MB',
          ],
          correct: 1,
          explainCorrect: 'Correct — memory scales CPU; the much shorter duration can outweigh the higher per-ms price, since cost is GB-seconds.',
          elaborativePrompt: 'Why is there usually a sweet spot rather than "more memory is always cheaper"? What happens to cost once the function is no longer CPU-constrained?',
        },
        {
          afterSection: 1,
          question: 'An application repeatedly reads the same hot items from DynamoDB and needs lower latency without rewriting its data-access code. Which caching option fits BEST?',
          options: [
            'Amazon CloudFront',
            'DynamoDB Accelerator (DAX)',
            'API Gateway caching',
            'A larger Lambda memory setting',
          ],
          correct: 1,
          explainCorrect: 'Correct — DAX caches DynamoDB reads using the same API, cutting latency and database load with minimal code change.',
          elaborativePrompt: 'For caching a fully rendered HTML page served to users worldwide, why would CloudFront be the better layer than DAX? Match the cache to the data it holds.',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague why raising Lambda memory can make a function both faster and cheaper, and then name the caching layer you would choose for (a) static global content and (b) hot DynamoDB reads. Justify each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A read-heavy application serves the same computed product listings to many users and is hitting DynamoDB on every request, driving up latency and read costs. The team wants to reduce DynamoDB load and improve response time for these repeated reads with minimal changes to the data-access code. What should they implement?',
        options: [
          'Increase the DynamoDB provisioned read capacity indefinitely',
          'Add DynamoDB Accelerator (DAX) to cache the hot reads using the same DynamoDB API',
          'Move the data to Amazon S3 and query it with Athena',
          'Raise the Lambda timeout so slow reads complete',
        ],
        correct: 1,
        explanation: {
          summary: 'DAX is an in-memory cache for DynamoDB that uses the same API, so it cuts latency and offloads repeated hot reads from the table with minimal code change — directly addressing the read-heavy bottleneck.',
          perOption: [
            'Endlessly raising read capacity treats the symptom at growing cost without caching the repeated reads.',
            'Correct — DAX caches hot DynamoDB reads with the same API, reducing latency and table load.',
            'Moving to S3 + Athena is an analytics pattern, not a low-latency cache for repeated transactional reads.',
            'A longer timeout does nothing to reduce latency or DynamoDB load; it only allows slow reads to finish.',
          ],
          link: 'D4 · Task 4.3 — Application caching and performance optimization',
        },
      },
      videos: [
        {
          videoId: 'RrKRN9zRBWs',
          title: 'AWS Certified Developer – Associate — Full Course',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Full DVA-C02 curriculum companion — covers Lambda tuning, caching layers, and performance optimization.',
        },
      ],
      keyTerms: [
        { term: 'Lambda memory tuning', def: 'Adjusting memory (which scales CPU/network) to optimize a function for both speed and GB-second cost.' },
        { term: 'CloudFront caching', def: 'Edge caching of cacheable content near users, configurable by request headers.' },
        { term: 'DAX', def: 'DynamoDB Accelerator — an in-memory cache for DynamoDB reads using the same API.' },
        { term: 'Subscription filter policy', def: 'A filter on an SNS subscription or EventBridge rule so a subscriber receives only relevant messages.' },
        { term: 'Right-sizing', def: 'Provisioning the minimum resources that meet the performance target to avoid wasted cost.' },
      ],
      awsServices: [
        { name: 'AWS Lambda', purpose: 'Tunable via memory and concurrency for performance and cost optimization.' },
        { name: 'Amazon CloudFront', purpose: 'Edge cache that reduces latency and origin load for cacheable content.' },
        { name: 'Amazon DynamoDB Accelerator (DAX)', purpose: 'In-memory cache that offloads hot DynamoDB reads with the same API.' },
        { name: 'Amazon ElastiCache', purpose: 'In-memory cache for computed results, sessions, and arbitrary hot data.' },
      ],
      examTips: [
        'Lambda slow + CPU-bound → raise memory (scales CPU); can be faster AND cheaper. Right-size to the minimum that meets latency.',
        'Cache by layer: global static content → CloudFront; hot DynamoDB reads → DAX; arbitrary data/sessions → ElastiCache; repeated API responses → API Gateway caching.',
        'Reduce wasteful downstream processing → SNS/EventBridge subscription filter policies.',
        'Optimize from evidence — use CloudWatch metrics, X-Ray, and logs to find the real bottleneck before changing anything.',
      ],
    },

  ],
}

export default dvaC02Course
