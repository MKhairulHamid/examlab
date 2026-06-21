// AWS Certified Data Engineer – Associate (DEA-C01) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors dopC02Course.js / soaC03Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 5 — Domain 1 (Data Ingestion and Transformation) authored. D2–D4 land in Steps 2–3.

const deaC01Course = {
  slug: 'dea-c01',
  title: 'AWS Certified Data Engineer – Associate — Full Prep Course',
  code: 'DEA-C01',
  subtitle: 'Sixteen ~30-minute sessions covering all four domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 130 minutes, pass at 720/1000 (72%). Compensatory scoring — no per-domain minimum. Question types are multiple choice and multiple response only.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Data Ingestion and Transformation', weight: '34%' },
    { id: 'd2', label: 'Domain 2 · Data Store Management', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · Data Operations and Support', weight: '22%' },
    { id: 'd4', label: 'Domain 4 · Data Security and Governance', weight: '18%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DATA INGESTION AND TRANSFORMATION (34%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.1',
      title: 'Streaming Ingestion — Kinesis, Firehose, MSK, and DynamoDB Streams',
      duration: 30,
      summary: 'Real-time data is the heartbeat of a modern data platform. This session builds the mental model of streaming ingestion on AWS: how Kinesis Data Streams, Amazon Data Firehose, Amazon MSK, and DynamoDB Streams differ, when each fits, and how shards, throughput, and replay shape your design. Getting the streaming-vs-batch decision right is the single most tested idea in Domain 1.',
      objectives: [
        'Distinguish Kinesis Data Streams, Amazon Data Firehose, Amazon MSK, and DynamoDB Streams by latency, management, and use case',
        'Explain shards, throughput limits, and the fan-in / fan-out distribution model',
        'Trigger a Lambda function from a Kinesis stream and reason about ordering and retries',
        'Describe replayability and the difference between stateful and stateless stream processing',
      ],
      preLearningCheck: {
        question: 'A team needs sub-second, real-time processing of clickstream events with multiple independent consumers reading the same data. Which service fits best?',
        options: [
          'Amazon Data Firehose, because it is fully managed',
          'Amazon Kinesis Data Streams, because it retains records and supports multiple concurrent consumers in real time',
          'Amazon S3 batch ingestion with a nightly job',
          'Amazon SQS standard queue',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Kinesis Data Streams stores records for a retention window and lets many consumers read them independently in real time. Firehose buffers and delivers to a destination — it is not a multi-consumer real-time bus.',
      },
      sections: [
        {
          heading: 'The streaming family, decoded',
          body: 'Streaming ingestion questions almost always reduce to "which of these four services fits the requirement?" Build a sharp distinction:\n\nAmazon Kinesis Data Streams is a real-time, sub-second data bus. Producers write records; the stream stores them (1–365 days retention) and many consumers read independently. You manage capacity as shards (provisioned) or let it scale (on-demand).\n\nAmazon Data Firehose (formerly Kinesis Data Firehose) is a fully managed delivery stream. It buffers incoming data by size or time and loads it to a destination — S3, Redshift, OpenSearch, Splunk. It is near-real-time (buffering adds seconds to minutes), can transform with Lambda, and converts formats (e.g. to Parquet). No shards, no consumers to manage.\n\nAmazon MSK (Managed Streaming for Apache Kafka) is managed Apache Kafka — choose it when the requirement names Kafka, existing Kafka tooling, or open-source compatibility.\n\nDynamoDB Streams captures item-level change events from a DynamoDB table, commonly consumed by Lambda for change-data-capture.',
          callout: { type: 'note', text: 'The cleanest exam tell: "real-time, multiple consumers, custom processing" → Kinesis Data Streams. "Just land it in S3/Redshift with no code to manage" → Amazon Data Firehose. "Kafka" → MSK. "React to table changes" → DynamoDB Streams.' },
          interactive: 'ingestion-selector',
        },
        {
          heading: 'Shards, throughput, and on-demand capacity',
          body: 'A Kinesis Data Stream is divided into shards. Each shard ingests up to 1 MB/s or 1,000 records/s and emits up to 2 MB/s. Throughput scales by adding shards; the partition key spreads records across them. If one key is too hot, that shard throttles while others sit idle — a classic skew problem.',
          bullets: [
            'Provisioned mode: you set the shard count and pay per shard — best when throughput is predictable.',
            'On-demand mode: Kinesis scales shards automatically — best for spiky or unknown workloads, at a higher per-GB price.',
            'ProvisionedThroughputExceeded errors signal you are hitting per-shard limits — add shards or pick a better partition key.',
            'Enhanced fan-out gives each consumer its own 2 MB/s pipe, removing contention when many consumers read one stream.',
          ],
          callout: { type: 'tip', text: 'A "hot shard" / throttling scenario is usually a partition-key design problem. The fix is a higher-cardinality, evenly distributed partition key — not just more shards.' },
        },
        {
          heading: 'Fan-in, fan-out, and Lambda consumers',
          body: 'Streaming distribution has two shapes. Fan-in aggregates many producers into one stream. Fan-out delivers one stream to many consumers — either via standard shared-throughput reads or enhanced fan-out (a dedicated pipe per consumer).\n\nAWS Lambda can consume a Kinesis stream directly: the Lambda service polls shards and invokes your function with batches of records. Records in a shard are processed in order; on error the batch is retried, which can block the shard until the records expire or succeed (mitigated with bisect-on-error, a max retry age, and an on-failure destination).',
          bullets: [
            'Lambda reads per shard in order — parallelism scales with shard count (and parallelization factor).',
            'A poison-pill record can stall a shard; configure MaximumRetryAttempts, MaximumRecordAgeInSeconds, and a failure destination (SQS/SNS).',
            'For simple "land the stream in S3," Firehose with no Lambda is lower overhead than a custom consumer.',
          ],
        },
        {
          heading: 'Replayability and stateful vs. stateless',
          body: 'Because Kinesis Data Streams and MSK retain records, consumers can replay — re-read from an earlier point to reprocess after a bug fix or a downstream outage. Firehose does not retain data, so a Firehose-only pipeline is not replayable past its buffer. This retention difference is a frequent distractor.\n\nA stateless transformation treats each record independently (map, filter, enrich from a lookup). A stateful one depends on other records — windowed aggregations, running counts, deduplication — and needs somewhere to hold state (a stream processor like Managed Service for Apache Flink, or an external store).',
          callout: { type: 'warning', text: 'If a question requires reprocessing historical events or surviving a downstream outage, a Firehose-only design fails — you need the retention/replay of Kinesis Data Streams or MSK.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A workload must continuously load streaming records into Amazon S3 as Parquet with the least possible operational overhead and no requirement for multiple real-time consumers. Which service fits?',
          options: [
            'Amazon Kinesis Data Streams with a custom Lambda consumer that writes to S3',
            'Amazon Data Firehose with record-format conversion to Parquet and an S3 destination',
            'Amazon MSK with a Kafka Connect S3 sink the team operates',
            'Amazon SQS with a polling EC2 fleet',
          ],
          correct: 1,
          explainCorrect: 'Correct — Firehose is fully managed, buffers and delivers straight to S3, and converts to Parquet natively. No shards, consumers, or code to operate.',
          elaborativePrompt: 'In your own words, why is Firehose preferred here even though Kinesis Data Streams could also reach S3?',
        },
        {
          afterSection: 1,
          question: 'A Kinesis Data Stream throttles with ProvisionedThroughputExceeded on one shard while others are nearly idle. What is the most likely root cause?',
          options: [
            'The stream needs enhanced fan-out enabled',
            'A low-cardinality or skewed partition key is concentrating records on one shard',
            'Retention is set too high',
            'The consumer is a Lambda function',
          ],
          correct: 1,
          explainCorrect: 'Correct — uneven partition keys create a hot shard. A higher-cardinality, evenly distributed key spreads load across shards.',
          elaborativePrompt: 'Why does simply adding more shards not fix a hot-key problem on its own?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company ingests millions of IoT events per minute, needs two independent real-time consumers (one for live dashboards, one for anomaly detection), and must be able to reprocess the last 3 days after a bug fix. Walk through why you choose Kinesis Data Streams over Firehose, how you size shards, how you keep one device from creating a hot shard, and how replay works.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company streams sensor data and must support two independent consumer applications reading the same records in real time, with the ability to replay the last 72 hours after deploying a fix. Which ingestion design meets all requirements with the LEAST operational overhead?',
        options: [
          'Amazon Data Firehose delivering to S3, with both applications reading the S3 objects',
          'Amazon Kinesis Data Streams with 72-hour retention and enhanced fan-out for each of the two consumers',
          'Amazon SQS standard queues, one per consumer, with a 72-hour message timer',
          'A self-managed Apache Kafka cluster on EC2 with custom retention scripts',
        ],
        correct: 1,
        explanation: {
          summary: 'Kinesis Data Streams retains records for replay and supports multiple independent real-time consumers; enhanced fan-out gives each its own throughput. It is the managed fit for "real-time + multi-consumer + replay."',
          perOption: [
            'Firehose does not retain data for replay and is a delivery stream, not a multi-consumer real-time bus — reading S3 is batch, not real time.',
            'Correct — retention up to 72 hours enables replay, and enhanced fan-out gives each of the two consumers a dedicated 2 MB/s real-time pipe with no contention.',
            'SQS does not support multiple independent consumers reading the same message, and message timers are not a replay mechanism.',
            'Self-managed Kafka on EC2 is exactly the operational overhead to avoid; MSK would be the managed Kafka option if Kafka were required.',
          ],
          link: 'Domain 1 · Task 1.1 — Perform data ingestion (streaming sources)',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'A full DEA-C01 walkthrough covering every domain. The streaming-ingestion sections pair directly with Task 1.1; use it as a companion to every session.' },
      ],
      keyTerms: [
        { term: 'Kinesis Data Streams', def: 'A real-time, sub-second streaming data bus that retains records and supports multiple independent consumers; capacity is managed as shards or on-demand.' },
        { term: 'Amazon Data Firehose', def: 'A fully managed delivery stream that buffers and loads streaming data to destinations like S3, Redshift, and OpenSearch, with optional Lambda transform and format conversion.' },
        { term: 'Shard', def: 'The unit of capacity in a Kinesis Data Stream — ~1 MB/s in, 2 MB/s out; records are distributed across shards by partition key.' },
        { term: 'Enhanced fan-out', def: 'A Kinesis feature giving each consumer a dedicated 2 MB/s read pipe, eliminating contention when many consumers read one stream.' },
        { term: 'Replayability', def: 'The ability to re-read retained stream records from an earlier point to reprocess data — available in Kinesis Data Streams and MSK, not in a Firehose-only pipeline.' },
      ],
      awsServices: [
        { name: 'Amazon Kinesis Data Streams', purpose: 'Real-time ingestion with retention and multiple independent consumers; the default for custom stream processing.' },
        { name: 'Amazon Data Firehose', purpose: 'Fully managed, near-real-time delivery of streaming data to S3, Redshift, and OpenSearch with optional transform and Parquet conversion.' },
        { name: 'Amazon MSK / DynamoDB Streams', purpose: 'Managed Apache Kafka for Kafka-based workloads; DynamoDB Streams for item-level change capture consumed by Lambda.' },
      ],
      examTips: [
        '"Real-time + multiple consumers + replay" → Kinesis Data Streams. "Just deliver to S3/Redshift, no code" → Amazon Data Firehose.',
        '"Kafka" in the stem → Amazon MSK. "React to DynamoDB table changes" → DynamoDB Streams + Lambda.',
        'Throttling on one shard while others idle = hot partition key; fix the key, not only the shard count.',
        'Firehose buffers (seconds–minutes) and does NOT retain for replay — a frequent distractor against a real-time/replay requirement.',
        'Lambda consumes Kinesis per shard in order; configure retry age and an on-failure destination to avoid a poison-pill stalling a shard.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.1',
      title: 'Batch Ingestion, Schedulers, and Event Triggers',
      duration: 30,
      summary: 'Most data still arrives in batches — files in S3, table extracts via DMS, SaaS exports via AppFlow. This session covers batch ingestion sources and the two ways pipelines start: on a schedule (EventBridge, Airflow, time-based) or on an event (S3 Event Notifications, EventBridge). It also covers consuming data APIs and controlling source access with IP allowlists.',
      objectives: [
        'Select the right batch ingestion source: S3, AWS Glue, EMR, AWS DMS, Redshift, Lambda, and Amazon AppFlow',
        'Configure scheduled ingestion with EventBridge Scheduler, Apache Airflow, and time-based triggers',
        'Configure event-driven ingestion with S3 Event Notifications and EventBridge rules',
        'Consume data APIs and use IP allowlists to permit connections to data sources',
      ],
      preLearningCheck: {
        question: 'A pipeline should start within seconds of a new file landing in an S3 bucket, not wait for a fixed schedule. What is the right trigger?',
        options: [
          'A cron job that lists the bucket every 24 hours',
          'An S3 Event Notification (or EventBridge rule on S3) that invokes the processing job on object creation',
          'A manual run by an operator',
          'Increasing the Glue crawler frequency to once per minute',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Event-driven beats polling: S3 emits an event on object creation that can trigger Lambda, Step Functions, or a Glue job immediately, with no idle polling.',
      },
      sections: [
        {
          heading: 'Batch ingestion sources',
          body: 'Batch ingestion moves bounded sets of data on a cadence rather than record-by-record. Map each source to its job:\n\nAmazon S3 is the landing zone for files (CSV, JSON, Parquet) and the source for most batch ETL. AWS Glue reads from S3, JDBC databases, and the Data Catalog. Amazon EMR runs large Spark/Hive batch jobs. AWS DMS migrates and replicates from relational databases (full load + change data capture). Amazon AppFlow pulls from SaaS apps (Salesforce, ServiceNow, Google Analytics) on a schedule or event. AWS Lambda handles lightweight, short ingestion tasks; Amazon Redshift loads via COPY.',
          callout: { type: 'note', text: 'Source tells: relational DB migration/replication → AWS DMS. SaaS app data → Amazon AppFlow. Big Spark/Hive batch → EMR. Files in S3 transformed → AWS Glue. Tiny/quick task → Lambda.' },
        },
        {
          heading: 'Scheduling: EventBridge, Airflow, and time-based',
          body: 'Scheduled ingestion runs on a clock. Amazon EventBridge Scheduler triggers jobs, crawlers, and Lambda on cron or rate expressions at scale. Amazon MWAA (Managed Workflows for Apache Airflow) schedules and orchestrates complex DAGs with dependencies — choose it when the requirement names Airflow or rich inter-task dependencies. Glue jobs and crawlers also have built-in time-based schedules for simple cases.',
          bullets: [
            'EventBridge Scheduler: serverless, cron/rate, one-time or recurring, scales to millions of schedules — the default managed scheduler.',
            'MWAA (Airflow): managed Airflow for DAGs with branching, retries, and cross-task dependencies; more power, more overhead.',
            'Glue built-in schedule: simplest for "run this crawler/job every night."',
          ],
          callout: { type: 'tip', text: 'Plain time-based trigger with no complex dependencies → EventBridge Scheduler or a Glue schedule. Multi-step DAG with dependencies and backfills → MWAA (Airflow).' },
        },
        {
          heading: 'Event triggers: S3 Notifications and EventBridge',
          body: 'Event-driven ingestion reacts the moment data appears. Amazon S3 Event Notifications fire on object-created (and other) events to Lambda, SNS, or SQS. EventBridge can also receive S3 events (via CloudTrail or EventBridge-enabled buckets) and route them with rich pattern matching to many targets — Step Functions, Glue, Lambda. Event-driven designs remove idle polling and cut latency to near-zero.',
          bullets: [
            'S3 → Lambda for a quick transform, or S3 → EventBridge → Step Functions for a multi-step workflow.',
            'EventBridge rules pattern-match on event content and fan out to multiple targets at once.',
            'Prefer event triggers over frequent polling/crawling when low latency or cost efficiency matters.',
          ],
          interactive: 'ingestion-selector',
        },
        {
          heading: 'Consuming data APIs and IP allowlists',
          body: 'Some sources are reached through APIs — a partner REST endpoint, a database API, or the Redshift Data API. Pipelines consume them with Lambda, Glue, or a container, handling pagination, authentication, and rate limits. When a source restricts inbound connections, you may need to add your egress IP addresses to its allowlist — typically the stable public IPs of a NAT gateway, so the source firewall permits your pipeline.',
          bullets: [
            'Use a NAT gateway with an Elastic IP so the source can allowlist a stable address from your VPC.',
            'Store API credentials in Secrets Manager / Parameter Store, never in code.',
            'Respect source rate limits with backoff; cache or paginate large API result sets.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A team must continuously replicate changes from an on-premises PostgreSQL database into Amazon S3 with minimal custom code. Which service is the best fit?',
          options: [
            'Amazon AppFlow',
            'AWS Database Migration Service (DMS) with full load plus change data capture (CDC)',
            'Amazon EMR running a nightly Spark job',
            'Amazon Kinesis Data Streams',
          ],
          correct: 1,
          explainCorrect: 'Correct — DMS performs an initial full load and then ongoing CDC from relational sources to targets like S3, with little custom code. AppFlow is for SaaS apps, not databases.',
          elaborativePrompt: 'Why is DMS a better match than a nightly EMR job when the requirement is continuous, low-latency replication?',
        },
        {
          afterSection: 1,
          question: 'A pipeline needs a multi-step DAG with task dependencies, retries, and the ability to backfill historical runs. Which orchestration/scheduling choice fits best?',
          options: [
            'A single EventBridge cron rule',
            'Amazon MWAA (Managed Workflows for Apache Airflow)',
            'An S3 Event Notification',
            'A Glue crawler schedule',
          ],
          correct: 1,
          explainCorrect: 'Correct — MWAA runs Apache Airflow DAGs with dependencies, retries, and backfills. A single cron rule cannot express inter-task dependencies.',
          elaborativePrompt: 'When would EventBridge Scheduler be the better choice than MWAA despite MWAA being more capable?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: files arrive irregularly in S3 throughout the day and must be processed within a minute of arrival, while a separate nightly job aggregates them. Describe which trigger you use for each, why event-driven beats polling for the first, and how a NAT gateway Elastic IP lets a downstream partner API allowlist your pipeline.',
      sample: {
        type: 'multiple-choice',
        stem: 'Vendor files land in an S3 bucket at unpredictable times and must be transformed within seconds of arrival, with no idle compute between arrivals. Which design meets the requirement most cost-effectively?',
        options: [
          'A Glue crawler scheduled to run every minute to detect new files',
          'An S3 Event Notification on object creation that invokes a Lambda function (or starts a Step Functions workflow) to process the file',
          'An EC2 instance running a polling script in a tight loop',
          'A nightly EMR batch job',
        ],
        correct: 1,
        explanation: {
          summary: 'Event-driven processing triggered by S3 object-created events runs only when data arrives — lowest latency and no idle cost.',
          perOption: [
            'A per-minute crawler still polls, adds latency and cost, and is meant for catalog updates, not low-latency file processing.',
            'Correct — S3 Event Notifications invoke processing the instant an object is created, with zero idle compute between arrivals.',
            'A tight polling loop on EC2 wastes compute continuously and adds latency versus native events.',
            'A nightly batch job cannot meet a within-seconds requirement.',
          ],
          link: 'Domain 1 · Task 1.1 — Perform data ingestion (batch sources, event triggers)',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers batch ingestion, DMS, AppFlow, and event-driven triggers — direct companion to Task 1.1 batch ingestion.' },
      ],
      keyTerms: [
        { term: 'AWS DMS', def: 'Database Migration Service — migrates and continuously replicates relational data (full load + change data capture) to targets such as S3 and Redshift.' },
        { term: 'Amazon AppFlow', def: 'A managed service that transfers data between SaaS applications (Salesforce, ServiceNow, etc.) and AWS on a schedule or event.' },
        { term: 'EventBridge Scheduler', def: 'A serverless scheduler that triggers jobs, Lambda, and crawlers on cron or rate expressions at scale.' },
        { term: 'S3 Event Notification', def: 'A bucket configuration that emits events (e.g. object-created) to Lambda, SNS, or SQS to start event-driven processing.' },
        { term: 'NAT gateway Elastic IP', def: 'A stable public IP for VPC egress that a source firewall can allowlist to permit connections from your pipeline.' },
      ],
      awsServices: [
        { name: 'AWS DMS', purpose: 'Migrate and replicate relational databases into AWS data stores with full load and ongoing CDC.' },
        { name: 'Amazon EventBridge', purpose: 'Schedule jobs and route event-driven triggers (including S3 events) to many targets with pattern matching.' },
        { name: 'Amazon AppFlow', purpose: 'Ingest data from SaaS applications on a schedule or event without custom integration code.' },
      ],
      examTips: [
        'Relational DB migration/replication → DMS (full load + CDC). SaaS app data → AppFlow. Big Spark/Hive batch → EMR.',
        'Low latency on file arrival → S3 Event Notifications / EventBridge, not frequent polling or crawling.',
        'Multi-step DAG with dependencies/backfills → MWAA (Airflow). Simple clock trigger → EventBridge Scheduler or a Glue schedule.',
        'Stable source allowlisting → NAT gateway with an Elastic IP so the source firewall permits a fixed address.',
        'Keep API credentials in Secrets Manager / Parameter Store and handle pagination and rate limits when consuming data APIs.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.2',
      title: 'Transforming and Processing Data — Glue, EMR, Lambda, and Redshift',
      duration: 30,
      summary: 'Raw data is rarely usable as-is. This session covers the core transformation engines — AWS Glue, Amazon EMR, AWS Lambda, and Amazon Redshift — how to choose between them, how to convert formats like CSV to Parquet, connect via JDBC/ODBC, integrate multiple sources, and optimize cost and performance while processing.',
      objectives: [
        'Choose the right transformation engine: AWS Glue, Amazon EMR, AWS Lambda, or Amazon Redshift',
        'Convert data between formats (e.g. CSV to Apache Parquet) and explain why columnar formats cut cost',
        'Connect to data sources with JDBC/ODBC and integrate data from multiple sources',
        'Optimize cost and performance, and troubleshoot common transformation failures',
      ],
      preLearningCheck: {
        question: 'A team needs serverless, Spark-based ETL with a managed data catalog and no clusters to operate. Which service is the best fit?',
        options: [
          'Amazon EMR on EC2',
          'AWS Glue (serverless Spark ETL with the Glue Data Catalog)',
          'A single AWS Lambda function with a 15-minute timeout',
          'Amazon Redshift Spectrum',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. AWS Glue is serverless Apache Spark with a built-in catalog: no clusters to size or patch. EMR gives more control but you operate the cluster; Lambda is for short, light tasks under 15 minutes.',
      },
      sections: [
        {
          heading: 'Choosing a transformation engine',
          body: 'Four engines cover most transformation scenarios:\n\nAWS Glue — serverless Apache Spark ETL with the Glue Data Catalog, crawlers, and visual/code authoring. Default for managed, scalable ETL with no cluster management.\n\nAmazon EMR — managed Hadoop/Spark/Hive/Presto clusters. Choose it for very large jobs, fine-grained tuning, custom frameworks, or cost control with Spot. You operate the cluster (or use EMR Serverless).\n\nAWS Lambda — short (≤15 min), lightweight, event-driven transforms. Great for small per-object processing, not heavy joins over terabytes.\n\nAmazon Redshift — transform in the warehouse with SQL (ELT). Load raw data, then transform with SQL/stored procedures; use Redshift Spectrum to query S3 directly.',
          callout: { type: 'note', text: 'Reflexes: serverless Spark + catalog → Glue. Huge/custom/Spot-optimized big-data → EMR. Tiny per-file transform → Lambda. Transform-in-warehouse with SQL → Redshift (ELT).' },
          interactive: 'transform-service',
        },
        {
          heading: 'File formats: why Parquet wins',
          body: 'Converting row-based CSV/JSON to a columnar format like Apache Parquet (or ORC) is one of the highest-leverage optimizations in data engineering. Columnar formats store values by column, so analytic queries read only the columns they need and skip the rest. They compress far better and carry schema and statistics that let engines prune data.',
          bullets: [
            'Athena and Redshift Spectrum charge by data scanned — Parquet + partitioning can cut scan cost by 90%+ versus raw CSV.',
            'Columnar formats enable predicate pushdown and column projection, reading less data per query.',
            'Glue and EMR can convert formats; Firehose can convert to Parquet on the way into S3.',
            'Pair Parquet with sensible partitioning (e.g. by date) and right-sized files (avoid many tiny files).',
          ],
          callout: { type: 'tip', text: 'Any "reduce Athena cost / speed up scans over S3" question almost always wants columnar Parquet + partitioning + compression — not a bigger query engine.' },
        },
        {
          heading: 'Connectivity and multi-source integration',
          body: 'Transformation jobs read from many places. JDBC/ODBC connectors let Glue and EMR reach relational databases (RDS, Redshift, on-prem) over standard drivers; Glue connections store the JDBC endpoint, credentials (from Secrets Manager), and network config. Integrating multiple sources means joining streaming, batch, and reference data into one model — often staged in S3 and cataloged in Glue so every engine sees the same schema.',
          bullets: [
            'A Glue connection defines how a job reaches a JDBC source inside a VPC, including subnet and security group.',
            'Use the Glue Data Catalog as the shared schema so Athena, EMR, Redshift Spectrum, and Glue agree.',
            'Stage and conform data in S3 (a data lake) to decouple sources from consumers.',
          ],
        },
        {
          heading: 'Cost, performance, and troubleshooting',
          body: 'Cost and performance optimization is heavily tested. Right-size the engine, use columnar formats and partitioning, avoid the small-files problem, and pick the cheapest engine that meets the SLA. Common transformation failures include schema mismatches, out-of-memory on skewed joins, throttling on a source, and slow jobs from tiny files or missing partitions.',
          bullets: [
            'Glue: tune worker type/number (DPUs); enable job bookmarks to process only new data.',
            'EMR: use Spot for task nodes and right-size core nodes; avoid data skew that overloads one executor.',
            'Small-files problem: compact many tiny objects into fewer larger files to cut overhead.',
            'Out-of-memory on a join usually means skew — repartition or salt the skewed key.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'Analysts complain that Athena queries over a 2 TB CSV dataset in S3 are slow and expensive. What single change yields the largest cost and performance improvement?',
          options: [
            'Move the data to a larger Athena workgroup',
            'Convert the data to partitioned, compressed Apache Parquet',
            'Increase the Athena query timeout',
            'Copy the data into DynamoDB',
          ],
          correct: 1,
          explainCorrect: 'Correct — Athena bills by data scanned. Partitioned, compressed Parquet lets Athena read only needed columns/partitions, cutting scan volume dramatically.',
          elaborativePrompt: 'Explain how columnar storage and partitioning each reduce the bytes Athena must scan.',
        },
        {
          afterSection: 0,
          question: 'A nightly job performs a multi-terabyte Spark transformation and the team wants to minimize cost using Spot capacity and custom Spark tuning. Which engine fits best?',
          options: [
            'AWS Lambda',
            'Amazon EMR (with Spot task nodes)',
            'A single Glue Python shell job',
            'Amazon Redshift Data API',
          ],
          correct: 1,
          explainCorrect: 'Correct — EMR gives cluster-level control, custom Spark tuning, and Spot task nodes for large, cost-sensitive batch jobs.',
          elaborativePrompt: 'When would AWS Glue still be preferable to EMR despite EMR’s tuning flexibility?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a pipeline lands raw JSON clickstream and CSV order data in S3 and must produce a query-optimized dataset that analysts hit with Athena. Walk through which engine you pick, why you convert to partitioned Parquet, how the Glue Data Catalog keeps schemas consistent, and one performance pitfall (small files or skew) you would guard against.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs serverless ETL on data in S3 and wants to reprocess only newly arrived files on each run, with no clusters to manage and a shared schema available to Athena and Redshift Spectrum. Which approach best meets these requirements?',
        options: [
          'Amazon EMR on EC2 with a manual high-water-mark file and a separate Hive metastore',
          'AWS Glue Spark jobs with job bookmarks enabled, writing partitioned Parquet, cataloged in the Glue Data Catalog',
          'A fleet of EC2 instances running cron-based Python scripts',
          'AWS Lambda functions that each process the entire dataset on every run',
        ],
        correct: 1,
        explanation: {
          summary: 'Glue is serverless Spark; job bookmarks track processed data so only new files are handled; the Glue Data Catalog is the shared schema for Athena and Redshift Spectrum.',
          perOption: [
            'EMR on EC2 means operating clusters and a separate metastore — more overhead than the serverless, catalog-integrated requirement.',
            'Correct — Glue removes cluster management, job bookmarks deliver incremental processing, Parquet optimizes queries, and the Data Catalog is shared across engines.',
            'Self-managed EC2 cron scripts add operational overhead and no native catalog or incremental tracking.',
            'Reprocessing the entire dataset on every Lambda run is wasteful and will hit Lambda limits on large data.',
          ],
          link: 'Domain 1 · Task 1.2 — Transform and process data',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers Glue, EMR, and transformation patterns including format conversion — companion to Task 1.2.' },
      ],
      keyTerms: [
        { term: 'AWS Glue', def: 'Serverless Apache Spark ETL with a managed Data Catalog, crawlers, and job bookmarks for incremental processing.' },
        { term: 'Amazon EMR', def: 'Managed big-data clusters (Spark, Hive, Presto) for large or specialized batch processing, with Spot support for cost control.' },
        { term: 'Apache Parquet', def: 'A columnar, compressed file format that reduces scan cost and speeds analytic queries via column projection and predicate pushdown.' },
        { term: 'Job bookmark', def: 'A Glue feature that tracks already-processed data so a job handles only new records on each run.' },
        { term: 'Small-files problem', def: 'A performance issue where many tiny objects add per-file overhead; compacting into fewer larger files restores throughput.' },
      ],
      awsServices: [
        { name: 'AWS Glue', purpose: 'Serverless Spark ETL, crawlers, and the Data Catalog; the default managed transformation engine.' },
        { name: 'Amazon EMR', purpose: 'Operate or run serverless big-data frameworks for large, tunable, cost-optimized batch jobs.' },
        { name: 'Amazon Redshift', purpose: 'Transform data in the warehouse with SQL (ELT) and query S3 directly with Redshift Spectrum.' },
      ],
      examTips: [
        'Serverless Spark + catalog → Glue. Huge/custom/Spot big-data → EMR. Tiny per-file transform → Lambda. Transform-in-warehouse → Redshift (ELT).',
        '"Cut Athena cost / faster S3 scans" → columnar Parquet + partitioning + compression.',
        'Glue job bookmarks = incremental processing of only new data.',
        'Out-of-memory on a join usually means data skew — repartition or salt the key.',
        'Use the Glue Data Catalog as the shared schema so Athena, EMR, Redshift Spectrum, and Glue agree.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.3',
      title: 'Orchestrating Data Pipelines — Step Functions, MWAA, Glue Workflows',
      duration: 30,
      summary: 'A pipeline is many steps that must run in the right order, retry on failure, and alert someone when things break. This session covers orchestration on AWS — Step Functions, Amazon MWAA (Airflow), Glue workflows, EventBridge, and Lambda — and how to build pipelines that are performant, available, scalable, resilient, and fault tolerant, with SNS/SQS notifications.',
      objectives: [
        'Choose between AWS Step Functions, Amazon MWAA, Glue workflows, EventBridge, and Lambda for orchestration',
        'Design pipelines for performance, availability, scalability, resiliency, and fault tolerance',
        'Implement and maintain serverless workflows with retries and error handling',
        'Send pipeline alerts with Amazon SNS and decouple steps with Amazon SQS',
      ],
      preLearningCheck: {
        question: 'A serverless ETL pipeline needs ordered steps, built-in retries, branching on success/failure, and a visual state machine — with no servers to manage. Which service fits best?',
        options: [
          'Amazon MWAA (managed Airflow)',
          'AWS Step Functions',
          'A single large Lambda function with try/except blocks',
          'Amazon EventBridge alone',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Step Functions is a serverless state machine with native retry, catch, branching, and parallelism — ideal for ordered, fault-tolerant serverless workflows without operating any infrastructure.',
      },
      sections: [
        {
          heading: 'The orchestration options',
          body: 'Orchestration coordinates the steps of a pipeline. The exam expects you to pick the least-overhead fit:\n\nAWS Step Functions — serverless state machine with retry, catch, branching, parallel, and map states. Best for ordered, event-driven, serverless workflows integrating Lambda, Glue, EMR, ECS, and more.\n\nAmazon MWAA (Managed Airflow) — managed Apache Airflow for complex Python DAGs, rich dependencies, backfills, and teams already on Airflow. More capability, more operational surface.\n\nAWS Glue workflows — orchestrate Glue crawlers and jobs together when the whole pipeline lives in Glue.\n\nAmazon EventBridge + Lambda — lightweight, event-driven glue for simple trigger-and-run patterns.',
          callout: { type: 'note', text: 'Tells: serverless state machine with retries/branching → Step Functions. Airflow / complex DAGs / backfills → MWAA. All-Glue pipeline → Glue workflows. Simple event → action → EventBridge + Lambda.' },
          interactive: 'orchestration-selector',
        },
        {
          heading: 'Designing for resiliency and fault tolerance',
          body: 'Pipelines fail — a source is down, a job throws, a record is malformed. Resilient design assumes failure and recovers automatically. Step Functions Retry policies handle transient errors with backoff; Catch routes terminal failures to a cleanup or notification path. Idempotent steps make re-runs safe. Decoupling with SQS buffers bursts and isolates a slow consumer from fast producers.',
          bullets: [
            'Add Retry with backoff for transient errors and Catch for terminal failures in Step Functions.',
            'Make steps idempotent so a retry or replay does not double-write.',
            'Use SQS to decouple producers from consumers and absorb spikes; use dead-letter queues for poison messages.',
            'Design for availability and scalability by favoring managed, auto-scaling services over fixed capacity.',
          ],
          callout: { type: 'warning', text: 'A pipeline that "loses events when a downstream step is briefly unavailable" usually lacks a buffer — insert SQS (with a DLQ) between the producer and the failing consumer.' },
        },
        {
          heading: 'Notifications: SNS and SQS',
          body: 'Operators need to know when a pipeline succeeds, fails, or breaches an SLA. Amazon SNS publishes notifications to email, SMS, or other services (fan-out to many subscribers). Amazon SQS queues messages for asynchronous, decoupled processing. Step Functions and EventBridge can publish to SNS on failure; CloudWatch alarms can also notify via SNS.',
          bullets: [
            'SNS = pub/sub fan-out for alerts and notifications to many endpoints.',
            'SQS = durable queue for decoupling and buffering work between stages.',
            'Wire a Step Functions Catch (or an EventBridge rule on a failed state) to an SNS topic for failure alerts.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A data team already runs dozens of Apache Airflow DAGs on-premises with complex dependencies and wants a managed equivalent on AWS with minimal rework. Which service fits best?',
          options: [
            'AWS Step Functions',
            'Amazon MWAA (Managed Workflows for Apache Airflow)',
            'AWS Glue workflows',
            'Amazon SQS',
          ],
          correct: 1,
          explainCorrect: 'Correct — MWAA is managed Apache Airflow, so existing DAGs and Airflow skills carry over with little rework.',
          elaborativePrompt: 'Why might a brand-new serverless pipeline still favor Step Functions over MWAA despite Airflow’s power?',
        },
        {
          afterSection: 1,
          question: 'A pipeline drops events whenever a downstream processor is briefly unavailable. What is the most appropriate fix?',
          options: [
            'Increase the Lambda memory size',
            'Insert an Amazon SQS queue (with a dead-letter queue) between the producer and the processor to buffer and decouple them',
            'Switch the source to CSV',
            'Run the processor on a larger EC2 instance',
          ],
          correct: 1,
          explainCorrect: 'Correct — SQS buffers messages while the consumer is down and a DLQ captures poison messages, preventing event loss.',
          elaborativePrompt: 'How does decoupling with a queue improve both resiliency and scalability of the pipeline?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: an ETL pipeline runs a Glue job, then an EMR step, then loads Redshift, and must retry transient failures, alert the team on terminal failure, and never lose events during a brief outage. Walk through why Step Functions orchestrates the steps, where Retry/Catch go, where you insert SQS, and how SNS delivers the failure alert.',
      sample: {
        type: 'multiple-choice',
        stem: 'A serverless data pipeline must run several steps in order, retry transient errors with backoff, branch to a cleanup path on terminal failure, and email the on-call engineer when a run fails — with no infrastructure to operate. Which design best meets the requirements?',
        options: [
          'A single Lambda function containing all steps and try/except blocks, emailing via SES on exceptions',
          'AWS Step Functions with Retry and Catch states orchestrating the steps, and a Catch that publishes to an Amazon SNS topic subscribed by the on-call engineer',
          'An Amazon MWAA environment running a one-task DAG that calls every step sequentially',
          'EventBridge rules chained together with no error handling',
        ],
        correct: 1,
        explanation: {
          summary: 'Step Functions natively models ordered steps, Retry with backoff, Catch for terminal failures, and integrates with SNS for alerting — all serverless.',
          perOption: [
            'Cramming all steps into one Lambda loses per-step retry/branching, risks the 15-minute limit, and is hard to observe.',
            'Correct — Step Functions provides ordered execution, Retry/Catch, branching, and an easy SNS notification on failure with no servers to run.',
            'A single-task MWAA DAG wastes Airflow’s strengths and adds an always-on environment to operate for a serverless requirement.',
            'Chaining EventBridge rules with no error handling cannot meet the retry/branch/alert requirements reliably.',
          ],
          link: 'Domain 1 · Task 1.3 — Orchestrate data pipelines',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers Step Functions, orchestration, and serverless workflow patterns — companion to Task 1.3.' },
      ],
      keyTerms: [
        { term: 'AWS Step Functions', def: 'A serverless state machine that orchestrates steps with native Retry, Catch, branching, parallel, and map states.' },
        { term: 'Amazon MWAA', def: 'Managed Workflows for Apache Airflow — managed Airflow for complex Python DAGs with dependencies and backfills.' },
        { term: 'Glue workflow', def: 'A Glue feature that orchestrates crawlers and jobs together when the whole pipeline lives in AWS Glue.' },
        { term: 'Dead-letter queue (DLQ)', def: 'An SQS queue that captures messages a consumer repeatedly fails to process, preventing them from blocking the pipeline.' },
        { term: 'Idempotency', def: 'A property where re-running a step produces the same result, making retries and replays safe from double-writes.' },
      ],
      awsServices: [
        { name: 'AWS Step Functions', purpose: 'Serverless orchestration with retries, error catching, branching, and service integrations.' },
        { name: 'Amazon MWAA', purpose: 'Run managed Apache Airflow DAGs for complex, dependency-rich pipelines.' },
        { name: 'Amazon SNS / Amazon SQS', purpose: 'SNS fans out alerts to subscribers; SQS decouples and buffers work between pipeline stages.' },
      ],
      examTips: [
        'Serverless state machine with retries/branching → Step Functions. Airflow/complex DAGs/backfills → MWAA. All-Glue → Glue workflows.',
        'Add Retry (backoff) for transient errors and Catch for terminal failures; make steps idempotent.',
        'Insert SQS + DLQ to stop event loss when a downstream step is briefly unavailable.',
        'SNS = pub/sub alerting to many subscribers; SQS = durable buffering and decoupling.',
        'Prefer managed, auto-scaling services for availability and scalability over fixed-capacity compute.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s5',
      number: 5,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.4',
      title: 'Programming Concepts I — Code Optimization, Lambda Tuning, Distributed Computing',
      duration: 30,
      summary: 'Data engineers write and run code, and the exam tests language-agnostic programming concepts: optimizing code to reduce runtime, tuning Lambda concurrency and performance, choosing the right languages and frameworks, mounting storage in Lambda, and reasoning about distributed computing and data structures. No syntax trivia — just the concepts that make pipelines fast and efficient.',
      objectives: [
        'Optimize code to reduce runtime and cost for ingestion and transformation',
        'Configure Lambda concurrency, memory, and performance, and mount storage volumes',
        'Select appropriate languages and frameworks (Python, SQL, Scala) for data engineering',
        'Explain distributed computing and the data structures relevant to data processing',
      ],
      preLearningCheck: {
        question: 'A Lambda-based transform is slow and occasionally times out at 15 minutes processing a large file. Which change most directly improves per-invocation performance?',
        options: [
          'Increase the function’s memory, which also raises its CPU allocation',
          'Lower the function timeout',
          'Disable logging',
          'Move the code from Python to Bash',
        ],
        correct: 0,
        note: 'No pressure — guessing first improves retention. In Lambda, CPU scales with memory — raising memory gives more CPU and often cuts runtime. For data that exceeds Lambda’s limits, a distributed engine like Glue/EMR is the better tool.',
      },
      sections: [
        {
          heading: 'Optimizing code for runtime and cost',
          body: 'Faster code is cheaper code in a pay-per-use world. The exam favors general optimization principles: minimize data movement, push filtering close to the source (predicate pushdown, partition pruning), process incrementally instead of reprocessing everything, and parallelize where the workload allows. Reading only the columns and partitions you need (columnar formats) beats scanning whole files.',
          bullets: [
            'Process only new data (Glue job bookmarks, incremental loads) instead of full reprocessing.',
            'Filter and project early so downstream steps handle less data.',
            'Batch small operations and reuse connections instead of opening one per record.',
            'Parallelize independent work; avoid unnecessary shuffles in Spark.',
          ],
        },
        {
          heading: 'Tuning AWS Lambda',
          body: 'Lambda is a workhorse for light data tasks. Memory is the master dial: CPU and network scale with the memory you allocate, so more memory can mean shorter, cheaper runs. Concurrency controls how many invocations run at once — reserved concurrency guarantees capacity (and caps it to protect downstreams), while provisioned concurrency pre-warms instances to remove cold-start latency.',
          bullets: [
            'Raise memory to gain CPU; benchmark to find the cost/performance sweet spot.',
            'Reserved concurrency caps and guarantees concurrent executions to protect throttled downstreams (e.g. RDS).',
            'Provisioned concurrency eliminates cold starts for latency-sensitive functions.',
            'Lambda hard limits: 15-minute max, 10 GB memory, 10 GB ephemeral /tmp — exceed these and use Glue/EMR/containers.',
          ],
          callout: { type: 'tip', text: 'When a Lambda data job hits the 15-minute limit or needs huge memory, the exam answer is usually "move to a distributed engine (Glue/EMR) or container," not "keep tuning Lambda."' },
        },
        {
          heading: 'Storage in Lambda and language choices',
          body: 'Lambda functions get ephemeral /tmp storage (configurable up to 10 GB) for scratch work, and can mount an Amazon EFS file system for shared, persistent, larger storage across invocations. For language choice, the exam is language-agnostic but expects sensible matches: Python for general ETL and glue code, SQL for in-database/warehouse transforms, Scala/Java for Spark-heavy jobs, Bash/PowerShell for automation scripting.',
          bullets: [
            'Lambda /tmp: fast ephemeral scratch space, up to 10 GB.',
            'Mount Amazon EFS to Lambda for shared/persistent storage beyond /tmp.',
            'Python and SQL dominate data engineering; Scala/Java suit large Spark workloads.',
          ],
        },
        {
          heading: 'Distributed computing and data structures',
          body: 'Big-data processing is distributed: work is split across many nodes (Spark executors, EMR task nodes) that process partitions in parallel and shuffle data between stages. Understanding this explains why skew (uneven partitions) slows a job, why shuffles are expensive, and why partitioning matters. The exam also touches basic data structures and algorithms — e.g. graph and tree structures — at a conceptual level, not implementation detail.',
          bullets: [
            'Distributed engines parallelize across partitions; even partitioning maximizes throughput.',
            'Shuffles (wide transformations) move data across the network and are costly — minimize them.',
            'Data skew overloads one node; repartition or salt to rebalance.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A Lambda function writing to an RDS database overwhelms it during traffic spikes. Which Lambda setting most directly protects the database?',
          options: [
            'Increase the function memory',
            'Set a reserved concurrency limit on the function to cap simultaneous executions',
            'Enable provisioned concurrency',
            'Shorten the timeout',
          ],
          correct: 1,
          explainCorrect: 'Correct — reserved concurrency caps how many invocations run at once, limiting the connection load on RDS.',
          elaborativePrompt: 'How do reserved and provisioned concurrency solve different problems (protection vs. cold starts)?',
        },
        {
          afterSection: 3,
          question: 'A Spark job runs far slower than expected, and logs show one executor doing most of the work while others finish early. What is the likely cause?',
          options: [
            'Too much memory allocated',
            'Data skew — one partition/key holds most of the data',
            'The cluster has too many nodes',
            'The data is stored as Parquet',
          ],
          correct: 1,
          explainCorrect: 'Correct — skew concentrates work on one executor. Repartitioning or salting the hot key rebalances the load.',
          elaborativePrompt: 'Why are wide transformations (shuffles) especially sensitive to data skew?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a Python Lambda transform is timing out on large files and hammering a downstream RDS database. Walk through which knobs you turn (memory for CPU, reserved concurrency to protect RDS), when you stop tuning Lambda and move to Glue/EMR, and why even data partitioning matters for the distributed version.',
      sample: {
        type: 'multiple-choice',
        stem: 'A Lambda function processes incoming files but frequently times out at 15 minutes on the largest files and needs more than 10 GB of working memory for some inputs. What is the most appropriate change?',
        options: [
          'Keep increasing Lambda memory and request a timeout-limit increase from AWS',
          'Move the heavy processing to a distributed engine such as AWS Glue or Amazon EMR that is built for large datasets',
          'Split the file into thousands of tiny pieces and process each in its own Lambda',
          'Disable logging to speed the function up',
        ],
        correct: 1,
        explanation: {
          summary: 'When data exceeds Lambda’s hard limits (15 minutes, 10 GB memory), the right move is a distributed engine designed for scale, not further Lambda tuning.',
          perOption: [
            'Lambda’s 15-minute and 10 GB limits are hard ceilings that cannot be raised by request — tuning cannot overcome them.',
            'Correct — Glue or EMR are purpose-built for large, memory-heavy distributed processing beyond Lambda’s limits.',
            'Shattering into thousands of tiny Lambdas creates the small-files problem and orchestration complexity without fixing the underlying mismatch.',
            'Disabling logging removes observability and does not address the limits.',
          ],
          link: 'Domain 1 · Task 1.4 — Apply programming concepts (Lambda, distributed computing)',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers Lambda, programming concepts, and distributed processing for data engineering — companion to Task 1.4.' },
      ],
      keyTerms: [
        { term: 'Reserved concurrency', def: 'A Lambda setting that guarantees and caps the number of simultaneous executions, used to protect throttled downstreams.' },
        { term: 'Provisioned concurrency', def: 'Pre-warmed Lambda execution environments that eliminate cold-start latency for latency-sensitive functions.' },
        { term: 'Lambda /tmp and EFS mount', def: 'Ephemeral scratch storage (up to 10 GB) and an optional mounted EFS file system for shared, persistent storage across invocations.' },
        { term: 'Distributed computing', def: 'Splitting work across many nodes that process partitions in parallel and shuffle data between stages.' },
        { term: 'Data skew', def: 'Uneven distribution of data across partitions/nodes that overloads one worker and slows the whole job.' },
      ],
      awsServices: [
        { name: 'AWS Lambda', purpose: 'Run short, event-driven transforms; tune memory (CPU), concurrency, and storage for performance.' },
        { name: 'Amazon EFS', purpose: 'Provide shared, persistent file storage that Lambda can mount beyond ephemeral /tmp.' },
        { name: 'AWS Glue / Amazon EMR', purpose: 'Distributed engines for workloads that exceed Lambda’s time and memory limits.' },
      ],
      examTips: [
        'Lambda CPU scales with memory — raise memory to cut runtime; benchmark for the cost sweet spot.',
        'Reserved concurrency protects downstreams (caps); provisioned concurrency removes cold starts.',
        'Lambda hard limits: 15 min, 10 GB memory, 10 GB /tmp — exceed them and move to Glue/EMR/containers.',
        'Mount EFS to Lambda for shared/persistent storage beyond /tmp.',
        'Slow distributed job with one busy executor = data skew; repartition or salt the hot key.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s6',
      number: 6,
      module: 'Domain 1 · Data Ingestion and Transformation',
      domain: 'd1',
      weight: '34%',
      task: 'Task 1.4',
      title: 'Programming Concepts II — IaC, CI/CD, and Software Engineering Best Practices',
      duration: 30,
      summary: 'Production data pipelines are deployed like software: version-controlled, tested, and shipped through pipelines, with infrastructure defined as code. This session covers CloudFormation, AWS CDK, and AWS SAM for repeatable deployment, CI/CD for data pipelines, and the software-engineering practices — version control, testing, logging, monitoring — that keep pipelines reliable.',
      objectives: [
        'Use Infrastructure as Code (CloudFormation, AWS CDK) for repeatable, version-controlled deployments',
        'Use AWS SAM to package and deploy serverless data pipelines (Lambda, Step Functions, DynamoDB)',
        'Describe CI/CD for data pipelines — implementation, testing, and deployment',
        'Apply software engineering best practices: version control, testing, logging, and monitoring',
      ],
      preLearningCheck: {
        question: 'A team wants every environment (dev, test, prod) to be provisioned identically and reproducibly from source-controlled definitions. What approach should they use?',
        options: [
          'Click through the AWS Console and document the steps in a wiki',
          'Infrastructure as Code (e.g. AWS CloudFormation or AWS CDK) stored in version control',
          'Manually run AWS CLI commands from each engineer’s laptop',
          'Take an AMI snapshot and copy it around',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. IaC defines infrastructure declaratively in templates kept in Git, so any environment can be recreated identically and changes are reviewed and versioned.',
      },
      sections: [
        {
          heading: 'Infrastructure as Code: CloudFormation and CDK',
          body: 'IaC replaces manual setup with declarative, version-controlled definitions. AWS CloudFormation provisions resources from JSON/YAML templates; the same template recreates an environment anywhere, and stacks track and roll back changes. AWS CDK lets you define infrastructure in a programming language (Python, TypeScript) that synthesizes to CloudFormation — better for reuse, loops, and abstractions. Both deliver repeatable, reviewable deployments.',
          bullets: [
            'CloudFormation templates are the declarative source of truth; change sets preview changes before applying.',
            'CDK uses real code (constructs) to generate CloudFormation — powerful for DRY, parameterized infrastructure.',
            'Store templates/CDK code in Git so every change is reviewed, versioned, and reproducible.',
            'Repeatable deployment across accounts/Regions is the core exam benefit of IaC.',
          ],
        },
        {
          heading: 'AWS SAM for serverless data pipelines',
          body: 'The AWS Serverless Application Model (SAM) is a CloudFormation extension that makes defining serverless resources concise — a few lines declare a Lambda function, its trigger, a Step Functions workflow, or a DynamoDB table. SAM packages code and dependencies and deploys the stack, and the SAM CLI supports local testing. For a serverless data pipeline (Lambda + Step Functions + DynamoDB), SAM is the streamlined IaC choice.',
          bullets: [
            'SAM templates are shorthand CloudFormation for serverless resources.',
            'sam build / sam deploy package and ship the pipeline; sam local tests functions locally.',
            'Ideal when the pipeline is Lambda/Step Functions/DynamoDB-centric.',
          ],
          callout: { type: 'note', text: 'SAM is for serverless-first stacks; full CloudFormation/CDK covers everything. CDK suits teams who prefer real code and heavy reuse across many resource types.' },
        },
        {
          heading: 'CI/CD for data pipelines',
          body: 'Data pipelines benefit from the same continuous-integration and continuous-delivery discipline as application code. A pipeline (CodePipeline/CodeBuild or any CI tool) lints and tests the ETL code, validates IaC templates, runs the deployment to a test environment, executes data tests, and promotes to production on success. This catches schema and logic errors before they hit production data.',
          bullets: [
            'CI: on each commit, run unit tests on transform logic and validate IaC templates.',
            'CD: deploy to a test environment, run data-quality and integration tests, then promote to prod.',
            'Treat pipeline code and infrastructure as artifacts that flow through the same release process.',
          ],
        },
        {
          heading: 'Software engineering best practices',
          body: 'Reliable pipelines apply core engineering hygiene. Version control (Git) tracks every change to code and IaC. Automated testing validates transforms and catches regressions. Logging (CloudWatch Logs) and monitoring (CloudWatch metrics/alarms, structured logs) make failures visible and debuggable. These practices turn a fragile script into a maintainable system.',
          bullets: [
            'Version control everything — transform code, IaC, configuration.',
            'Automate tests for transformation logic and data expectations.',
            'Emit structured logs and metrics so failures are observable and alertable.',
            'Separate config from code and keep secrets in Secrets Manager / Parameter Store.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team is building a serverless data pipeline composed mainly of Lambda functions, a Step Functions workflow, and a DynamoDB table, and wants concise IaC with local testing. Which tool is the most streamlined fit?',
          options: [
            'AWS Serverless Application Model (SAM)',
            'Hand-written shell scripts using the AWS CLI',
            'Manual Console configuration',
            'Terraform with no modules',
          ],
          correct: 0,
          explainCorrect: 'Correct — SAM is purpose-built shorthand for serverless resources, with local testing via the SAM CLI and CloudFormation under the hood.',
          elaborativePrompt: 'When would a team choose full CloudFormation or CDK over SAM?',
        },
        {
          afterSection: 0,
          question: 'Which is the primary exam-relevant benefit of defining pipeline infrastructure as code rather than configuring it by hand?',
          options: [
            'It eliminates the need for IAM',
            'It makes deployments repeatable, version-controlled, and reviewable across environments',
            'It removes all costs',
            'It guarantees the pipeline never fails',
          ],
          correct: 1,
          explainCorrect: 'Correct — IaC gives repeatable, reviewable, versioned deployments so every environment is reproducible and changes are auditable.',
          elaborativePrompt: 'How does storing IaC in Git improve collaboration and change safety on a data team?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a data team must deploy the same serverless pipeline to dev, test, and prod identically, with every change reviewed and tested before reaching production data. Walk through why you define the stack with SAM/CDK in Git, how a CI/CD pipeline tests and promotes it, and which logging/monitoring you add to catch failures.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company must deploy an identical serverless ETL stack (Lambda, Step Functions, DynamoDB) to three accounts, with all changes reviewed in Git and validated by automated tests before reaching production. Which approach best meets these requirements?',
        options: [
          'Configure each account manually in the Console and record the steps in a runbook',
          'Define the stack with AWS SAM (or CDK) in version control and deploy it through a CI/CD pipeline that runs tests before promoting to each account',
          'Copy a working Lambda function’s code between accounts by hand',
          'Use one shared production stack for all three environments',
        ],
        correct: 1,
        explanation: {
          summary: 'IaC (SAM/CDK) in Git plus a CI/CD pipeline gives identical, reviewed, tested, repeatable deployments across accounts — exactly the stated requirements.',
          perOption: [
            'Manual Console setup is not repeatable or reviewable and drifts between environments.',
            'Correct — SAM/CDK templates in Git are the source of truth; the CI/CD pipeline tests and promotes them identically to each account.',
            'Hand-copying code is error-prone, unversioned, and omits the surrounding infrastructure.',
            'Sharing one production stack for all environments defeats environment isolation and safe testing.',
          ],
          link: 'Domain 1 · Task 1.4 — Apply programming concepts (IaC, CI/CD, best practices)',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers IaC, deployment, and engineering practices for data pipelines — companion to Task 1.4.' },
      ],
      keyTerms: [
        { term: 'AWS CloudFormation', def: 'Declarative IaC that provisions and tracks AWS resources from JSON/YAML templates, with change sets and rollback.' },
        { term: 'AWS CDK', def: 'A framework to define infrastructure in a programming language that synthesizes to CloudFormation, enabling reuse and abstraction.' },
        { term: 'AWS SAM', def: 'A CloudFormation extension that concisely defines serverless resources and supports local testing via the SAM CLI.' },
        { term: 'CI/CD for pipelines', def: 'Applying continuous integration and delivery — automated tests, validation, and staged deployment — to data pipeline code and infrastructure.' },
        { term: 'Version control', def: 'Tracking every change to code and IaC in Git so changes are reviewed, reproducible, and auditable.' },
      ],
      awsServices: [
        { name: 'AWS CloudFormation / CDK', purpose: 'Define infrastructure as code for repeatable, version-controlled deployments across accounts and Regions.' },
        { name: 'AWS SAM', purpose: 'Package and deploy serverless data pipelines (Lambda, Step Functions, DynamoDB) with concise templates and local testing.' },
        { name: 'AWS CodePipeline / CodeBuild', purpose: 'Run CI/CD for data pipelines — test transform code and IaC, then deploy and promote across environments.' },
      ],
      examTips: [
        'Repeatable, reviewable, version-controlled environments → Infrastructure as Code (CloudFormation/CDK).',
        'Serverless-first stack (Lambda/Step Functions/DynamoDB) → AWS SAM is the concise IaC choice.',
        'CDK suits teams wanting real code, loops, and reuse; SAM suits serverless shorthand; CloudFormation covers everything.',
        'CI/CD for pipelines = test transform logic + validate IaC, deploy to test, run data tests, promote to prod.',
        'Keep secrets out of code (Secrets Manager / Parameter Store) and emit structured logs/metrics for observability.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — DATA STORE MANAGEMENT (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Data Store Management',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Choosing the Right Data Store — Redshift, RDS, DynamoDB, S3, and More',
      duration: 30,
      summary: 'Picking where data lives is the highest-leverage decision a data engineer makes. This session builds the selection framework: Redshift for analytics, RDS/Aurora for relational OLTP, DynamoDB for key-value at scale, S3 + Athena for the data lake, plus migration and remote-access patterns (Transfer Family, Redshift federated queries, materialized views, Spectrum), locks, open table formats, and vector indexes.',
      objectives: [
        'Match a workload to the right store: Redshift, RDS/Aurora, DynamoDB, S3 data lake, EMR, MemoryDB',
        'Apply remote-access patterns: Redshift federated queries, materialized views, and Redshift Spectrum',
        'Explain open table formats (Apache Iceberg) and when they matter',
        'Describe vector stores and index types (HNSW, IVF) for similarity search',
      ],
      preLearningCheck: {
        question: 'A workload runs complex analytical queries (aggregations and JOINs) over billions of rows for BI dashboards. Which store is the best fit?',
        options: [
          'Amazon DynamoDB',
          'Amazon Redshift (a columnar MPP data warehouse)',
          'Amazon RDS for MySQL with a single instance',
          'Amazon ElastiCache',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Redshift is a columnar, massively parallel data warehouse built for large analytical (OLAP) queries. DynamoDB excels at key-value lookups, not ad-hoc analytics; a single RDS instance cannot scan billions of rows efficiently.',
      },
      sections: [
        {
          heading: 'The data-store decision tree',
          body: 'Every storage question is "which store matches the access pattern, scale, and cost?" Build sharp distinctions:\n\nAmazon Redshift — columnar MPP warehouse for OLAP analytics over large datasets. Amazon RDS / Aurora — relational OLTP for transactional apps and moderate-size relational data. Amazon DynamoDB — serverless key-value/document store for single-digit-millisecond lookups at any scale, with predictable access patterns. Amazon S3 + Athena — the data lake: cheap, durable object storage queried in place with serverless SQL. Amazon EMR — process huge datasets with Spark/Hive (compute, often over S3). Amazon MemoryDB / ElastiCache — in-memory for ultra-low-latency key-value and caching.',
          bullets: [
            'OLAP / analytics over big data → Redshift (or Athena over an S3 lake).',
            'Transactional relational app → RDS / Aurora.',
            'High-scale key-value with known access pattern → DynamoDB.',
            'Cheap durable lake queried ad hoc → S3 + Athena.',
            'Ultra-low-latency key-value / cache → MemoryDB / ElastiCache.',
          ],
          callout: { type: 'note', text: 'DynamoDB vs. Redshift is the classic trap: DynamoDB is point lookups and predictable patterns; Redshift is ad-hoc analytical scans and JOINs. Matching the access pattern is the whole game.' },
          interactive: 'datastore-selector',
        },
        {
          heading: 'Remote access: federated queries, materialized views, Spectrum',
          body: 'Redshift can reach data without copying it. Federated queries let Redshift query live data in RDS/Aurora PostgreSQL/MySQL directly. Redshift Spectrum queries data in S3 in place (external tables in the Glue Data Catalog) — extending the warehouse over the lake. Materialized views precompute and store query results for fast repeated access, refreshed incrementally. Together they reduce data movement and speed analytics.',
          bullets: [
            'Redshift Spectrum: query S3 data with Redshift SQL without loading it — pay per data scanned.',
            'Federated query: join live operational data in RDS/Aurora from Redshift without ETL.',
            'Materialized views: cache expensive aggregate results; auto/incremental refresh.',
          ],
          callout: { type: 'tip', text: '"Analyze warehouse + lake together without copying" → Redshift Spectrum. "Speed up a repeated expensive aggregation" → a materialized view.' },
        },
        {
          heading: 'Open table formats and locks',
          body: 'Apache Iceberg is an open table format that brings database-like features to data-lake files in S3: ACID transactions, schema evolution, time travel, and efficient upserts/deletes — supported by Athena, EMR, Glue, and Redshift. Choose Iceberg when a lake needs reliable updates and evolving schemas rather than append-only files. On the warehouse side, locks (in Redshift and RDS) coordinate concurrent access; long-running transactions can block others, a common troubleshooting theme.',
          bullets: [
            'Iceberg = ACID transactions, schema evolution, time travel, row-level updates on S3 data.',
            'Use open table formats when the lake needs updates/deletes and consistent reads, not just appends.',
            'Lock contention (Redshift/RDS) from long transactions can block writers/readers — keep transactions short.',
          ],
        },
        {
          heading: 'Vector stores and index types',
          body: 'Generative-AI workloads need similarity search over embeddings (vectors). AWS supports vectors in Amazon Aurora PostgreSQL (pgvector), Amazon OpenSearch Service, MemoryDB, and others. Two index types recur: HNSW (Hierarchical Navigable Small Worlds) — graph-based, fast and accurate, more memory; and IVF (Inverted File) — cluster-based, lower memory, tunable recall. The exam expects you to recognize these as vector index types for nearest-neighbor search, not to implement them.',
          bullets: [
            'Vectors = numeric embeddings enabling similarity / nearest-neighbor search.',
            'HNSW: graph index, high speed/accuracy, higher memory.',
            'IVF: inverted-file/cluster index, lower memory, tunable.',
            'Aurora PostgreSQL (pgvector) and OpenSearch are common AWS vector stores.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An application needs single-digit-millisecond lookups of user profiles by user ID at massive scale, with a well-known access pattern. Which store fits best?',
          options: [
            'Amazon Redshift',
            'Amazon DynamoDB',
            'Amazon Athena over S3',
            'Amazon EMR',
          ],
          correct: 1,
          explainCorrect: 'Correct — DynamoDB delivers consistent single-digit-millisecond key-value access at any scale when the access pattern is known and designed for.',
          elaborativePrompt: 'Why is Redshift a poor fit for high-volume single-key lookups even though it can store the data?',
        },
        {
          afterSection: 1,
          question: 'A team wants to run Redshift SQL across both warehouse tables and large historical data sitting in S3 without loading the S3 data into Redshift. Which feature fits?',
          options: [
            'Redshift federated query',
            'Redshift Spectrum',
            'A DynamoDB global secondary index',
            'An ElastiCache cluster',
          ],
          correct: 1,
          explainCorrect: 'Correct — Redshift Spectrum queries S3 data in place via external tables, extending the warehouse over the lake with no load step.',
          elaborativePrompt: 'How does Spectrum differ from a federated query in what it connects to?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company has transactional orders in Aurora, billions of historical events in S3, and needs fast BI dashboards plus the occasional join of live orders with historical data. Walk through which store serves dashboards, how Spectrum and federated queries let Redshift reach S3 and Aurora without copying, and when a materialized view would speed a repeated report.',
      sample: {
        type: 'multiple-choice',
        stem: 'A BI team runs heavy analytical queries over 5 years of clickstream data in Amazon S3 and must occasionally join it with current records in an Aurora PostgreSQL database — without building ETL to copy either dataset. Which approach best meets the requirement?',
        options: [
          'Load all S3 data and all Aurora data into DynamoDB and query there',
          'Use Amazon Redshift with Spectrum to query the S3 data in place and a federated query to join the live Aurora data',
          'Run nightly EMR jobs to copy everything into a single RDS instance',
          'Store the clickstream in ElastiCache for fast queries',
        ],
        correct: 1,
        explanation: {
          summary: 'Redshift Spectrum queries the S3 lake in place and federated queries reach live Aurora data — analytics across both with no ETL copying.',
          perOption: [
            'DynamoDB is a key-value store, not an analytical engine, and loading everything in defeats the no-copy requirement.',
            'Correct — Spectrum covers the S3 historical data without loading it, and a federated query joins the live Aurora records directly.',
            'Copying everything into one RDS instance is exactly the ETL and scale problem the requirement rules out.',
            'ElastiCache is an in-memory cache, unsuited to 5 years of analytical clickstream data.',
          ],
          link: 'Domain 2 · Task 2.1 — Choose a data store',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers data store selection across Redshift, RDS, DynamoDB, and S3 — companion to Task 2.1.' },
      ],
      keyTerms: [
        { term: 'Amazon Redshift', def: 'A columnar, massively parallel data warehouse for large analytical (OLAP) queries; extends to S3 via Spectrum and to RDS/Aurora via federated queries.' },
        { term: 'Redshift Spectrum', def: 'A Redshift feature that queries data in S3 in place via external tables, billed per data scanned.' },
        { term: 'Materialized view', def: 'A precomputed, stored query result (often an aggregation) that is refreshed incrementally for fast repeated reads.' },
        { term: 'Apache Iceberg', def: 'An open table format that adds ACID transactions, schema evolution, and time travel to data-lake files in S3.' },
        { term: 'Vector index (HNSW / IVF)', def: 'Index structures for nearest-neighbor similarity search over embeddings; HNSW is graph-based, IVF is cluster/inverted-file based.' },
      ],
      awsServices: [
        { name: 'Amazon Redshift', purpose: 'OLAP data warehouse with Spectrum (S3) and federated queries (RDS/Aurora) for analytics without data movement.' },
        { name: 'Amazon DynamoDB', purpose: 'Serverless key-value/document store for single-digit-millisecond access at scale with known access patterns.' },
        { name: 'Amazon S3 + Athena', purpose: 'Durable, cheap data lake queried in place with serverless SQL; the backbone of the lake architecture.' },
      ],
      examTips: [
        'Match the access pattern: OLAP analytics → Redshift/Athena; relational OLTP → RDS/Aurora; key-value at scale → DynamoDB; cheap lake → S3.',
        '"Query S3 from Redshift without loading" → Spectrum. "Join live RDS/Aurora from Redshift" → federated query.',
        'Repeated expensive aggregation → materialized view.',
        'Lake needs ACID updates/deletes + schema evolution → Apache Iceberg open table format.',
        'Vectors/similarity search → pgvector on Aurora PostgreSQL or OpenSearch; HNSW and IVF are vector index types.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · Data Store Management',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Data Cataloging — Glue Data Catalog, Crawlers, and Partitions',
      duration: 30,
      summary: 'A data lake without a catalog is a swamp. This session covers data cataloging on AWS: the AWS Glue Data Catalog as the central technical metastore, Glue crawlers for schema discovery, keeping partitions in sync, source/target connections, and business catalogs like Amazon SageMaker Catalog. The catalog is what makes S3 data queryable by Athena, EMR, Redshift Spectrum, and Glue.',
      objectives: [
        'Explain the AWS Glue Data Catalog as a shared technical metastore (Hive-compatible)',
        'Use Glue crawlers to discover schemas and populate the catalog',
        'Keep partitions synchronized so queries find new data',
        'Distinguish technical catalogs from business catalogs (Amazon SageMaker Catalog)',
      ],
      preLearningCheck: {
        question: 'New date-partitioned files were written to S3, but Athena queries do not return them. What is the most likely fix?',
        options: [
          'Restart the Athena service',
          'Add the new partitions to the catalog (run a crawler, MSCK REPAIR TABLE, or partition projection)',
          'Convert the data to CSV',
          'Increase the Athena timeout',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Athena reads partitions registered in the catalog. New partitions must be added — by a crawler, MSCK REPAIR TABLE, the Glue API, or partition projection — or queries silently miss the new data.',
      },
      sections: [
        {
          heading: 'The Glue Data Catalog: one schema for every engine',
          body: 'The AWS Glue Data Catalog is a central, Hive-compatible metastore holding table definitions, schemas, and partition metadata for data in S3 and other sources. It is the single source of truth that Athena, Redshift Spectrum, EMR, and Glue all read, so they agree on schema and location. A table in the catalog points to an S3 path and describes columns, types, format, and partitions — the data stays in S3; the catalog stores only metadata.',
          bullets: [
            'The catalog stores metadata (schema, location, partitions), not the data itself.',
            'It is Hive-metastore compatible, so EMR/Spark/Presto can use it directly.',
            'Athena, Redshift Spectrum, EMR, and Glue share it — one schema, many engines.',
            'Databases group tables; tables map to an S3 prefix and a SerDe/format.',
          ],
          callout: { type: 'note', text: 'When a question stresses "consistent schema available to Athena, EMR, and Redshift Spectrum," the answer is the Glue Data Catalog as the shared metastore.' },
        },
        {
          heading: 'Crawlers: automatic schema discovery',
          body: 'A Glue crawler connects to a data store (S3, JDBC), infers schema and partition structure, and creates or updates tables in the Data Catalog. Crawlers can run on a schedule or on demand and detect new columns and partitions. They classify file formats (CSV, JSON, Parquet) and can group similar files into one table. Crawlers automate what would otherwise be manual DDL.',
          bullets: [
            'Crawlers infer schema and partitions and write table definitions to the catalog.',
            'Schedule them (EventBridge / built-in) to pick up new data and schema changes.',
            'Classifiers determine format; custom classifiers handle unusual formats.',
            'For predictable layouts, partition projection can avoid crawlers entirely.',
          ],
        },
        {
          heading: 'Partitions and keeping them in sync',
          body: 'Partitioning splits a table by column values (commonly date) into separate S3 prefixes, so query engines scan only relevant partitions — a major cost and speed win. But the catalog must know about each partition. New partitions are registered by re-running a crawler, MSCK REPAIR TABLE (Athena/Hive), the Glue AddPartition API, or partition projection, which computes partition locations from a pattern at query time with no catalog entries to maintain.',
          bullets: [
            'Partition pruning: engines skip partitions outside the query predicate, cutting scan cost.',
            'Register new partitions via crawler, MSCK REPAIR TABLE, Glue API, or partition projection.',
            'Partition projection is ideal for highly predictable, high-cardinality partition schemes (e.g. by hour).',
          ],
          callout: { type: 'warning', text: '"Athena does not see new data" is almost always unregistered partitions — not a permissions or format issue. Sync the partitions.' },
        },
        {
          heading: 'Connections and business catalogs',
          body: 'Glue connections store how a job or crawler reaches a source or target — JDBC endpoint, credentials (from Secrets Manager), and VPC networking — and are reused across jobs. Beyond the technical catalog, business data catalogs add human context: ownership, descriptions, classifications, and discovery for analysts. Amazon SageMaker Catalog (in SageMaker Unified Studio) provides governed business cataloging and data discovery on top of technical metadata.',
          bullets: [
            'Glue connections = reusable source/target connectivity (JDBC, network, credentials).',
            'Technical catalog (Glue) = schemas/partitions for engines; business catalog = context/governance for people.',
            'Amazon SageMaker Catalog provides business-level discovery and governance.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team continuously lands new daily partitions in S3 and wants the Data Catalog to stay current automatically as schemas and partitions evolve. What is the most appropriate tool?',
          options: [
            'Manually write CREATE TABLE statements each day',
            'A scheduled AWS Glue crawler',
            'A DynamoDB stream',
            'An ElastiCache cluster',
          ],
          correct: 1,
          explainCorrect: 'Correct — a scheduled Glue crawler discovers new partitions and schema changes and updates the catalog without manual DDL.',
          elaborativePrompt: 'When would partition projection be preferable to running a crawler for this?',
        },
        {
          afterSection: 0,
          question: 'Why is the AWS Glue Data Catalog valuable in a multi-engine analytics environment?',
          options: [
            'It stores the actual data so engines do not need S3',
            'It provides one shared, Hive-compatible schema that Athena, EMR, Redshift Spectrum, and Glue all read',
            'It encrypts all data automatically',
            'It replaces the need for IAM',
          ],
          correct: 1,
          explainCorrect: 'Correct — the catalog is a shared metastore so every engine agrees on schema and location; the data itself stays in S3.',
          elaborativePrompt: 'Why does separating metadata (catalog) from data (S3) help a multi-engine setup?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a lake in S3 is queried by Athena and Redshift Spectrum, and new date partitions arrive hourly. Walk through how the Glue Data Catalog provides one schema for both engines, how a crawler or partition projection keeps partitions current, and why "Athena missing new data" points to partition sync.',
      sample: {
        type: 'multiple-choice',
        stem: 'An organization stores data in S3 and queries it with Athena, Amazon EMR, and Redshift Spectrum. They want a single, consistent schema definition shared by all three engines, kept current as new partitions arrive. Which solution best meets this?',
        options: [
          'Maintain a separate Hive metastore on each EMR cluster and copy definitions between engines',
          'Use the AWS Glue Data Catalog as the shared metastore, populated and kept current by scheduled Glue crawlers (or partition projection)',
          'Store schema definitions in a DynamoDB table each engine reads',
          'Embed the schema in every query',
        ],
        correct: 1,
        explanation: {
          summary: 'The Glue Data Catalog is the shared, Hive-compatible metastore for Athena, EMR, and Redshift Spectrum; crawlers (or projection) keep partitions current.',
          perOption: [
            'Per-cluster Hive metastores duplicate and drift — the opposite of one shared schema.',
            'Correct — one Glue Data Catalog gives all three engines a consistent schema, and crawlers/projection keep new partitions registered.',
            'A hand-rolled DynamoDB schema store reinvents the catalog and is not understood natively by the query engines.',
            'Embedding schema in queries is unmanageable and inconsistent across engines.',
          ],
          link: 'Domain 2 · Task 2.2 — Understand data cataloging systems',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers the Glue Data Catalog, crawlers, and partitioning — companion to Task 2.2.' },
      ],
      keyTerms: [
        { term: 'Glue Data Catalog', def: 'A central, Hive-compatible metastore of table schemas, locations, and partitions shared by Athena, EMR, Redshift Spectrum, and Glue.' },
        { term: 'Glue crawler', def: 'A job that connects to a data store, infers schema and partitions, and creates or updates catalog tables automatically.' },
        { term: 'Partition', def: 'A division of a table by column values (e.g. date) into S3 prefixes so engines scan only relevant data.' },
        { term: 'Partition projection', def: 'An Athena feature that computes partition locations from a pattern at query time, avoiding catalog partition maintenance.' },
        { term: 'SageMaker Catalog', def: 'A business data catalog providing governed discovery and context on top of technical metadata.' },
      ],
      awsServices: [
        { name: 'AWS Glue Data Catalog', purpose: 'Shared technical metastore for all analytics engines over S3 and JDBC sources.' },
        { name: 'AWS Glue Crawlers', purpose: 'Automatically discover schemas and partitions and keep the catalog current.' },
        { name: 'Amazon Athena', purpose: 'Serverless SQL over cataloged S3 data; relies on registered partitions to find data.' },
      ],
      examTips: [
        'Consistent schema across Athena/EMR/Redshift Spectrum → the Glue Data Catalog as a shared metastore.',
        'The catalog stores metadata only; the data stays in S3.',
        '"Athena does not see new data" → unregistered partitions; fix with crawler, MSCK REPAIR TABLE, Glue API, or partition projection.',
        'Predictable, high-cardinality partitions → partition projection (no crawler needed).',
        'Technical catalog (Glue) = schema for engines; business catalog (SageMaker Catalog) = context/governance for people.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s9',
      number: 9,
      module: 'Domain 2 · Data Store Management',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.3',
      title: 'Managing the Data Lifecycle — S3 Lifecycle, Versioning, and TTL',
      duration: 30,
      summary: 'Data has a lifecycle: hot when fresh, cold as it ages, eventually expired or archived. This session covers managing that lifecycle cost-effectively — S3 storage classes and Lifecycle policies, expiring old data, S3 versioning and DynamoDB TTL, compliant deletion, load/unload between S3 and Redshift, and protecting data with resiliency and availability.',
      objectives: [
        'Use S3 Lifecycle policies to transition data across storage classes and expire it',
        'Manage S3 versioning and DynamoDB TTL for retention and cleanup',
        'Perform load/unload operations between Amazon S3 and Amazon Redshift',
        'Delete data to meet business and legal requirements and protect it with resiliency',
      ],
      preLearningCheck: {
        question: 'Log data is queried heavily for 30 days, rarely after 90 days, and must be kept 7 years for compliance at lowest cost. What is the best approach?',
        options: [
          'Keep everything in S3 Standard forever',
          'An S3 Lifecycle policy that transitions objects to cheaper classes (e.g. Standard-IA then Glacier/Deep Archive) over time',
          'Delete the data after 30 days',
          'Store all of it in DynamoDB',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. S3 Lifecycle policies automatically transition aging data to cheaper tiers and can expire it, matching cost to access frequency over a long retention period.',
      },
      sections: [
        {
          heading: 'S3 storage classes and Lifecycle policies',
          body: 'S3 offers storage classes priced for different access patterns: Standard (hot), Standard-IA / One Zone-IA (infrequent), Glacier Instant Retrieval, Glacier Flexible Retrieval, and Glacier Deep Archive (cheapest, slowest). S3 Lifecycle policies automate moving objects between classes and expiring them based on age. S3 Intelligent-Tiering moves objects between tiers automatically based on observed access, ideal when access patterns are unknown or changing.',
          bullets: [
            'Lifecycle transition rules move objects to cheaper classes as they age.',
            'Lifecycle expiration rules delete objects after a set age.',
            'Intelligent-Tiering auto-optimizes when access patterns are unpredictable (no retrieval fees for tier moves).',
            'Match class to access: hot → Standard; cold/archive → Glacier tiers.',
          ],
          callout: { type: 'tip', text: 'Unknown/changing access pattern → S3 Intelligent-Tiering. Known aging pattern → explicit Lifecycle transitions. Long-term archive at lowest cost → Glacier Deep Archive.' },
        },
        {
          heading: 'Versioning and DynamoDB TTL',
          body: 'S3 versioning keeps every version of an object, protecting against accidental overwrite or deletion (a delete adds a delete marker; prior versions remain). Lifecycle rules can expire noncurrent versions to control cost. DynamoDB TTL automatically deletes items after a per-item expiry timestamp, cleaning up stale data (sessions, ephemeral records) at no extra cost and without consuming write capacity for the deletes.',
          bullets: [
            'S3 versioning protects against accidental overwrite/delete; combine with Lifecycle to expire old versions.',
            'DynamoDB TTL auto-deletes expired items based on a timestamp attribute, free of charge.',
            'Versioning underpins MFA delete and replication consistency.',
          ],
        },
        {
          heading: 'Load and unload: S3 ↔ Redshift',
          body: 'Moving data between the lake and the warehouse is routine. The Redshift COPY command bulk-loads data from S3 (and other sources) into Redshift tables efficiently, in parallel across slices. The UNLOAD command exports Redshift query results back to S3 (often as Parquet) for archival or lake consumption. COPY/UNLOAD are the standard, performant bridge between S3 and Redshift.',
          bullets: [
            'COPY loads from S3 to Redshift in parallel — far faster than row-by-row inserts.',
            'UNLOAD exports query results to S3, commonly as partitioned Parquet.',
            'Use an IAM role on the cluster for COPY/UNLOAD S3 access (no static keys).',
          ],
        },
        {
          heading: 'Compliant deletion and resiliency',
          body: 'Some data must be deleted to meet legal or business requirements (right-to-erasure, retention limits). Lifecycle expiration, targeted deletes, and Iceberg/row-level deletes handle this; verify deletion across replicas and backups. Protecting data means resiliency and availability: S3 is multi-AZ durable by design, cross-Region replication guards against regional loss, and AWS Backup centralizes backup policies — balanced against any data-sovereignty constraints on where copies may live.',
          bullets: [
            'Use Lifecycle expiration or explicit deletes to meet retention/erasure requirements; account for versions and backups.',
            'S3 durability is multi-AZ; add cross-Region replication for regional resilience where allowed.',
            'AWS Backup centralizes and schedules backups across services.',
          ],
          callout: { type: 'warning', text: 'A "data must be deleted for compliance" requirement is not satisfied while old object versions or cross-Region replicas still hold copies — expire versions and account for replicated data.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'Access patterns for a new dataset are unknown and may change month to month, and the team wants to minimize storage cost without manual tuning. Which S3 option fits best?',
          options: [
            'S3 Standard with a manual review every quarter',
            'S3 Intelligent-Tiering',
            'S3 Glacier Deep Archive immediately',
            'Delete data after 7 days',
          ],
          correct: 1,
          explainCorrect: 'Correct — Intelligent-Tiering automatically moves objects between access tiers based on usage, optimizing cost when patterns are unknown or shifting.',
          elaborativePrompt: 'Why is an explicit Lifecycle transition rule less ideal than Intelligent-Tiering when access is unpredictable?',
        },
        {
          afterSection: 2,
          question: 'A team must bulk-load several terabytes of Parquet from S3 into Amazon Redshift as fast as possible. Which approach is best?',
          options: [
            'Row-by-row INSERT statements from a script',
            'The Redshift COPY command loading from S3 in parallel, using an IAM role for access',
            'Stream the data through DynamoDB first',
            'Upload via the Redshift Console manually',
          ],
          correct: 1,
          explainCorrect: 'Correct — COPY loads from S3 in parallel across slices and is the standard high-throughput load path; an attached IAM role grants S3 access.',
          elaborativePrompt: 'Why is COPY dramatically faster than individual INSERT statements in Redshift?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: event data is hot for 30 days, cold afterward, and must be retained 7 years then deleted, with a copy loaded into Redshift for analysis. Walk through the S3 Lifecycle transitions and expiration you set, why you use COPY to load Redshift, and how versioning and replicas affect "compliant deletion."',
      sample: {
        type: 'multiple-choice',
        stem: 'A company keeps audit logs in S3 that are queried often for 30 days, occasionally for a year, and must be retained for 7 years at the lowest possible cost, then automatically deleted. Which configuration meets all requirements?',
        options: [
          'Store everything in S3 Standard and delete manually after 7 years',
          'An S3 Lifecycle policy that transitions objects to Standard-IA, then to Glacier Deep Archive as they age, with an expiration rule at 7 years',
          'Move all logs to DynamoDB with a TTL of 7 years',
          'Keep two copies in S3 Standard in two Regions indefinitely',
        ],
        correct: 1,
        explanation: {
          summary: 'Lifecycle transitions match storage cost to declining access, and an expiration rule auto-deletes at 7 years — exactly the lifecycle described.',
          perOption: [
            'S3 Standard for 7 years is far more expensive than archival tiers, and manual deletion is error-prone.',
            'Correct — transition to Standard-IA then Glacier Deep Archive cuts cost as access drops, and a 7-year expiration rule automates compliant deletion.',
            'DynamoDB is the wrong store for large append-only logs and is costlier than S3 archival tiers.',
            'Two indefinite Standard copies maximize cost and never delete, violating the retention limit.',
          ],
          link: 'Domain 2 · Task 2.3 — Manage the lifecycle of data',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers S3 storage classes, lifecycle management, and Redshift load/unload — companion to Task 2.3.' },
      ],
      keyTerms: [
        { term: 'S3 Lifecycle policy', def: 'Rules that automatically transition objects to cheaper storage classes and expire them based on age.' },
        { term: 'S3 Intelligent-Tiering', def: 'A storage class that automatically moves objects between access tiers based on observed usage, ideal for unknown patterns.' },
        { term: 'S3 versioning', def: 'Keeping multiple versions of an object to protect against accidental overwrite or deletion.' },
        { term: 'DynamoDB TTL', def: 'A feature that auto-deletes items after a per-item expiry timestamp, at no extra cost.' },
        { term: 'COPY / UNLOAD', def: 'Redshift commands that bulk-load data from S3 in parallel (COPY) and export query results to S3 (UNLOAD).' },
      ],
      awsServices: [
        { name: 'Amazon S3 (storage classes + Lifecycle)', purpose: 'Tiered durable storage with automated transitions and expiration for cost-optimized retention.' },
        { name: 'Amazon DynamoDB TTL', purpose: 'Automatically expire stale items without consuming write capacity.' },
        { name: 'Amazon Redshift COPY/UNLOAD', purpose: 'High-throughput load from and unload to S3 between the lake and the warehouse.' },
      ],
      examTips: [
        'Known aging pattern → S3 Lifecycle transitions; unknown/changing access → Intelligent-Tiering; cheapest archive → Glacier Deep Archive.',
        'Lifecycle expiration automates compliant deletion — but account for noncurrent versions and cross-Region replicas.',
        'DynamoDB TTL auto-deletes expired items free of charge.',
        'Bulk S3→Redshift load → COPY (parallel) with an IAM role; export → UNLOAD (often Parquet).',
        'S3 versioning protects against accidental delete/overwrite; expire old versions with Lifecycle to control cost.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s10',
      number: 10,
      module: 'Domain 2 · Data Store Management',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.4',
      title: 'Data Modeling, Schema Evolution, and Optimization',
      duration: 30,
      summary: 'How you model and lay out data determines query speed and cost. This session covers schema design for Redshift, DynamoDB, and Lake Formation; handling schema evolution and changing data characteristics; schema conversion with AWS SCT and DMS; data lineage; and the optimization levers — indexing, partitioning, compression, and distribution/sort keys.',
      objectives: [
        'Design effective schemas for Redshift, DynamoDB, and Lake Formation',
        'Handle schema evolution and changes to data characteristics over time',
        'Perform schema conversion with AWS SCT and AWS DMS Schema Conversion',
        'Apply indexing, partitioning, compression, and distribution/sort keys for optimization',
      ],
      preLearningCheck: {
        question: 'In Amazon Redshift, which choice most affects how efficiently large table JOINs run across the cluster?',
        options: [
          'The S3 bucket name',
          'The table’s distribution style (and sort keys)',
          'The IAM role attached to the cluster',
          'The VPC CIDR block',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Redshift distributes table rows across slices by distribution style (KEY, ALL, EVEN, AUTO). Co-locating joined rows via a shared distribution key minimizes data redistribution during JOINs; sort keys speed range scans.',
      },
      sections: [
        {
          heading: 'Schema design per store',
          body: 'Each store rewards a different modeling approach. Redshift (columnar OLAP) favors star/snowflake schemas, distribution keys to co-locate joins, and sort keys for range filters. DynamoDB (NoSQL) is designed from access patterns first — often a single-table design with composite keys and secondary indexes to serve each query without scans. Lake Formation governs tables over S3 (registered in the Glue Catalog) with fine-grained access; modeling there means sensible partitioning and columnar layout.',
          bullets: [
            'Redshift: star/snowflake; choose distribution style (KEY/ALL/EVEN/AUTO) and sort keys deliberately.',
            'DynamoDB: model from access patterns; composite keys + GSIs/LSIs; avoid scans.',
            'Lake Formation/S3: partition and use columnar formats; govern with table/column permissions.',
          ],
          callout: { type: 'note', text: 'DynamoDB modeling is access-pattern-first: list the queries, then design keys and indexes to serve them. Relational normalization habits often lead to anti-patterns in DynamoDB.' },
        },
        {
          heading: 'Schema evolution and changing data',
          body: 'Data changes shape over time — new columns, changed types, new sources. Schema evolution handles this without breaking consumers. Columnar formats and open table formats (Iceberg) support adding/renaming columns and evolving partitions safely. Glue crawlers can detect schema changes and update the catalog. Designing for evolution (nullable additions, versioned schemas, tolerant readers) prevents pipeline breakage when upstream data shifts.',
          bullets: [
            'Iceberg supports safe schema and partition evolution (add/drop/rename columns, partition spec changes).',
            'Crawlers detect new/changed columns; plan for additive, backward-compatible changes.',
            'Tolerant consumers and versioned schemas keep pipelines resilient to upstream changes.',
          ],
        },
        {
          heading: 'Schema conversion: SCT and DMS',
          body: 'Migrating between database engines often requires converting schema and code. The AWS Schema Conversion Tool (AWS SCT) and DMS Schema Conversion convert source schemas, stored procedures, and data types to a target engine (e.g. Oracle → Aurora PostgreSQL, on-prem warehouse → Redshift). SCT reports what converts automatically and what needs manual rework, while AWS DMS moves the data. Together they enable heterogeneous migrations.',
          bullets: [
            'AWS SCT / DMS Schema Conversion: convert schema and code objects between heterogeneous engines.',
            'DMS handles the data movement (full load + CDC); SCT handles the schema/code translation.',
            'SCT assessment reports flag objects needing manual conversion.',
          ],
        },
        {
          heading: 'Optimization: lineage, partitioning, compression',
          body: 'Optimization spans correctness and performance. Data lineage (via Amazon SageMaker Catalog / ML Lineage Tracking) records where data came from and how it was transformed — vital for trust and debugging. For performance: partition to prune scans, use columnar compression to shrink I/O, choose Redshift distribution/sort keys to minimize redistribution, and index in DynamoDB/RDS for the access pattern. These levers cut both latency and cost.',
          bullets: [
            'Lineage tracks origin and transformations for trust, auditing, and debugging.',
            'Partitioning prunes scans; compression (columnar encodings) cuts I/O and storage.',
            'Redshift: KEY distribution co-locates joins; sort keys speed range filters; let AUTO help when unsure.',
            'DynamoDB GSIs/LSIs and RDS indexes serve specific access patterns efficiently.',
          ],
          callout: { type: 'tip', text: 'Performance-tuning questions usually reward the layout/optimization lever (partitioning, compression, distribution/sort key, index) — not a bigger instance.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'When designing a DynamoDB table, what should drive the choice of partition key, sort key, and secondary indexes?',
          options: [
            'Third-normal-form relational normalization',
            'The application’s known access patterns and queries',
            'The alphabetical order of attributes',
            'The size of the S3 bucket',
          ],
          correct: 1,
          explainCorrect: 'Correct — DynamoDB is modeled from access patterns: design keys and indexes so each required query is served efficiently without scans.',
          elaborativePrompt: 'Why can applying relational normalization to DynamoDB lead to poor performance?',
        },
        {
          afterSection: 2,
          question: 'A company is migrating an on-premises Oracle database to Amazon Aurora PostgreSQL and must convert the schema and stored procedures. Which tool is purpose-built for this?',
          options: [
            'Amazon Athena',
            'AWS Schema Conversion Tool (AWS SCT) / DMS Schema Conversion',
            'Amazon QuickSight',
            'AWS Glue DataBrew',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS SCT / DMS Schema Conversion converts heterogeneous schemas and code objects; DMS then migrates the data.',
          elaborativePrompt: 'What does SCT’s assessment report tell you before a migration begins?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a slow Redshift dashboard JOINs a large fact table to a dimension table and scans far more data than expected. Walk through how distribution style co-locates the join, how sort keys and compression reduce I/O, and how partitioning would help the equivalent query over S3 in Athena.',
      sample: {
        type: 'multiple-choice',
        stem: 'A Redshift dashboard JOINs a multi-billion-row fact table to a dimension table, and queries are slow due to heavy data redistribution across the cluster during the JOIN. Which change most directly addresses the problem?',
        options: [
          'Increase the Athena query timeout',
          'Choose a KEY distribution style on the join column so matching rows are co-located on the same slices, and set appropriate sort keys',
          'Convert the tables to DynamoDB',
          'Store the data in S3 Glacier',
        ],
        correct: 1,
        explanation: {
          summary: 'KEY distribution on the join column co-locates matching rows, eliminating most cross-slice redistribution; sort keys further speed filtered scans.',
          perOption: [
            'Athena timeouts are irrelevant to a Redshift JOIN performance problem.',
            'Correct — distributing both tables on the join key co-locates the join and removes the costly redistribution; sort keys aid range filters.',
            'DynamoDB is a key-value store, not suited to ad-hoc analytical JOINs over billions of rows.',
            'Glacier is archival storage and would make the data far slower to query, not faster.',
          ],
          link: 'Domain 2 · Task 2.4 — Design data models and schema evolution',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers schema design, Redshift distribution/sort keys, and optimization — companion to Task 2.4.' },
      ],
      keyTerms: [
        { term: 'Distribution style (Redshift)', def: 'How table rows are spread across slices (KEY, ALL, EVEN, AUTO); KEY on the join column co-locates joins to avoid redistribution.' },
        { term: 'Sort key (Redshift)', def: 'A column ordering that lets Redshift skip blocks during range-filtered scans, speeding queries.' },
        { term: 'Single-table design (DynamoDB)', def: 'Modeling multiple entity types in one table from access patterns, using composite keys and secondary indexes.' },
        { term: 'Schema evolution', def: 'Safely changing a schema over time (adding/renaming columns, changing partitions) without breaking consumers — strong in Iceberg.' },
        { term: 'AWS SCT', def: 'The Schema Conversion Tool that converts schemas and code between heterogeneous database engines, paired with DMS for data movement.' },
      ],
      awsServices: [
        { name: 'Amazon Redshift', purpose: 'Columnar warehouse where distribution and sort keys plus compression drive analytical performance.' },
        { name: 'AWS SCT / AWS DMS', purpose: 'Convert heterogeneous schemas/code (SCT) and migrate the data (DMS) during engine migrations.' },
        { name: 'Amazon SageMaker Catalog', purpose: 'Establish data lineage and governed cataloging for trust and auditability.' },
      ],
      examTips: [
        'DynamoDB modeling is access-pattern-first — list queries, then design keys/indexes; avoid relational normalization habits.',
        'Redshift JOIN redistribution pain → KEY distribution on the join column; sort keys speed range filters.',
        'Heterogeneous DB migration schema/code → AWS SCT / DMS Schema Conversion; DMS moves the data.',
        'Performance tuning usually rewards a layout lever (partitioning, compression, dist/sort key, index) over a bigger instance.',
        'Iceberg enables safe schema and partition evolution; design additive, backward-compatible changes.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — DATA OPERATIONS AND SUPPORT (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Data Operations and Support',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.1',
      title: 'Automating Data Processing — Glue, Step Functions, Lambda, and Athena',
      duration: 30,
      summary: 'Operations is about making pipelines run repeatably without babysitting. This session covers automating data processing with AWS services: orchestrating with MWAA and Step Functions, calling AWS SDKs from code, using Glue/EMR/Redshift features, preparing data with DataBrew and SageMaker Unified Studio, querying with Athena, and automating with Lambda and EventBridge.',
      objectives: [
        'Automate processing with Lambda, EventBridge, Step Functions, and MWAA',
        'Call AWS SDKs to drive AWS features from code, and troubleshoot managed workflows',
        'Use Glue DataBrew and SageMaker Unified Studio to prepare data with low/no code',
        'Query data on demand with Amazon Athena',
      ],
      preLearningCheck: {
        question: 'A team wants to prepare and clean data visually, without writing code, to profile columns and build repeatable transformation recipes. Which service fits best?',
        options: [
          'Amazon Athena',
          'AWS Glue DataBrew',
          'Amazon Kinesis Data Streams',
          'AWS CloudFormation',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. AWS Glue DataBrew is a visual data-preparation tool: profile data, apply 250+ built-in transformations as reusable recipes, all with no code. Athena queries data with SQL but is not a visual prep tool.',
      },
      sections: [
        {
          heading: 'Automating with the right service',
          body: 'Automation removes humans from the run loop. Lambda runs event-driven processing; EventBridge schedules and routes events; Step Functions orchestrates multi-step workflows; MWAA runs Airflow DAGs. The skill is matching the automation tool to the shape of the work — single event → Lambda; scheduled or event-routed → EventBridge; ordered multi-step with retries → Step Functions; complex dependency DAG → MWAA. (These mirror the orchestration choices from Domain 1, now applied operationally.)',
          bullets: [
            'Lambda: event-driven, short processing and glue logic.',
            'EventBridge: schedule jobs and route events to targets.',
            'Step Functions: ordered, fault-tolerant multi-step automation.',
            'MWAA: managed Airflow for complex, dependency-rich pipelines.',
          ],
        },
        {
          heading: 'SDKs and service features',
          body: 'Beyond managed orchestration, data engineers automate by calling AWS SDKs (boto3 for Python and others) from Lambda, Glue, or containers — starting jobs, reading/writing S3, running Redshift queries via the Redshift Data API, and submitting EMR steps. Each processing service exposes features worth knowing: Glue jobs/triggers/workflows, EMR steps and notebooks, and Redshift stored procedures and the Data API for serverless query execution.',
          bullets: [
            'Use SDKs to start jobs, move data, and run queries programmatically.',
            'Redshift Data API runs SQL asynchronously without managing connections — great from Lambda.',
            'Glue triggers/workflows and EMR steps automate multi-job sequences.',
          ],
          callout: { type: 'tip', text: 'Running Redshift SQL from Lambda without managing JDBC connections or VPC plumbing → the Redshift Data API.' },
        },
        {
          heading: 'Low-code prep: DataBrew and SageMaker Unified Studio',
          body: 'Not all transformation needs Spark code. AWS Glue DataBrew offers visual, no-code data preparation — profiling, 250+ transformations, and reusable recipes — ideal for analysts and quick cleaning. Amazon SageMaker Unified Studio brings data engineering, analytics, and ML into one governed environment for preparing and processing data. These tools speed routine prep without custom code.',
          bullets: [
            'DataBrew: visual profiling and reusable transformation recipes, no code.',
            'SageMaker Unified Studio: unified, governed workspace for data prep and analytics.',
            'Choose low-code prep for routine cleaning; Glue/EMR Spark for heavy custom logic.',
          ],
        },
        {
          heading: 'Querying with Athena and troubleshooting workflows',
          body: 'Amazon Athena runs serverless SQL directly over S3 (via the Glue Catalog) — no infrastructure, pay per data scanned. It is the default for ad-hoc querying and lightweight automated checks. When automated workflows fail, troubleshooting MWAA and Step Functions means reading execution history, task logs (CloudWatch), and error states — a frequent operations theme covered more in the monitoring session.',
          bullets: [
            'Athena: serverless SQL over S3; pay per scan; ideal for ad-hoc and scheduled queries.',
            'Troubleshoot Step Functions via execution history and CloudWatch Logs; MWAA via Airflow task logs.',
            'Pair Athena with partitioned Parquet to keep automated queries cheap.',
          ],
          interactive: 'orchestration-selector',
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A Lambda function must run SQL against Amazon Redshift without managing persistent JDBC connections or placing the function in the cluster’s VPC. What is the cleanest approach?',
          options: [
            'Open a JDBC connection from the Lambda on every invocation',
            'Use the Amazon Redshift Data API to run SQL asynchronously',
            'Export the data to DynamoDB and query there',
            'Run the query manually in the Console',
          ],
          correct: 1,
          explainCorrect: 'Correct — the Redshift Data API runs SQL over HTTPS without managing connections or VPC networking, ideal for serverless callers like Lambda.',
          elaborativePrompt: 'Why does the Data API simplify running Redshift queries from short-lived serverless functions?',
        },
        {
          afterSection: 2,
          question: 'Analysts need to profile a messy dataset and build a repeatable cleaning workflow without writing Spark code. Which service is the best fit?',
          options: [
            'Amazon EMR with custom Scala',
            'AWS Glue DataBrew',
            'Amazon Kinesis Data Firehose',
            'AWS Step Functions',
          ],
          correct: 1,
          explainCorrect: 'Correct — DataBrew provides visual profiling and reusable no-code recipes for exactly this routine cleaning work.',
          elaborativePrompt: 'When would you still reach for Glue Spark jobs instead of DataBrew?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a daily pipeline must run a Glue job, then run a Redshift query from a Lambda, then notify a team — all automated. Walk through which service orchestrates, how the Lambda uses the Redshift Data API, and where DataBrew or Athena would fit for prep and ad-hoc checks.',
      sample: {
        type: 'multiple-choice',
        stem: 'A serverless pipeline must, on a schedule, run a transformation and then execute several SQL statements in Amazon Redshift from a Lambda function, with no JDBC connection management and minimal operational overhead. Which combination best meets this?',
        options: [
          'A cron job on EC2 that opens JDBC connections to Redshift',
          'Amazon EventBridge Scheduler to trigger the workflow and the Amazon Redshift Data API to run the SQL from Lambda',
          'A manual Console run each day',
          'Amazon Kinesis Data Streams to push SQL to Redshift',
        ],
        correct: 1,
        explanation: {
          summary: 'EventBridge Scheduler triggers the run and the Redshift Data API executes SQL from Lambda without connection or VPC management — fully serverless and low overhead.',
          perOption: [
            'An EC2 cron job with JDBC adds servers, connection management, and operational overhead the requirement avoids.',
            'Correct — EventBridge Scheduler handles the schedule and the Redshift Data API runs SQL from Lambda with no connection management.',
            'Manual Console runs are not automation.',
            'Kinesis Data Streams is for streaming ingestion, not executing SQL in Redshift.',
          ],
          link: 'Domain 3 · Task 3.1 — Automate data processing by using AWS services',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers automation with Glue, Step Functions, Lambda, Athena, and DataBrew — companion to Task 3.1.' },
      ],
      keyTerms: [
        { term: 'Redshift Data API', def: 'An HTTPS API to run SQL on Redshift asynchronously without managing JDBC connections or VPC networking — ideal for Lambda.' },
        { term: 'AWS Glue DataBrew', def: 'A visual, no-code data-preparation tool for profiling data and building reusable transformation recipes.' },
        { term: 'SageMaker Unified Studio', def: 'A unified, governed environment combining data engineering, analytics, and ML for preparing and processing data.' },
        { term: 'Amazon Athena', def: 'Serverless SQL query service over S3 (via the Glue Catalog), billed per data scanned.' },
        { term: 'AWS SDK automation', def: 'Driving AWS features (start jobs, run queries, move data) programmatically from code such as boto3 in Lambda or Glue.' },
      ],
      awsServices: [
        { name: 'AWS Step Functions / Amazon MWAA', purpose: 'Orchestrate multi-step and dependency-rich data processing automatically.' },
        { name: 'AWS Glue DataBrew', purpose: 'Visual, no-code data preparation with reusable recipes.' },
        { name: 'Amazon Athena', purpose: 'Serverless SQL over S3 for ad-hoc and automated querying.' },
      ],
      examTips: [
        'Match automation to work shape: single event → Lambda; schedule/route → EventBridge; ordered multi-step → Step Functions; complex DAG → MWAA.',
        'Run Redshift SQL from Lambda with no connection/VPC management → the Redshift Data API.',
        'No-code visual data prep with reusable recipes → AWS Glue DataBrew.',
        'Ad-hoc SQL over S3 with no infrastructure → Athena (keep it cheap with partitioned Parquet).',
        'Troubleshoot Step Functions via execution history + CloudWatch; MWAA via Airflow task logs.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s12',
      number: 12,
      module: 'Domain 3 · Data Operations and Support',
      domain: 'd3',
      weight: '22%',
      task: 'Tasks 3.2 & 3.4',
      title: 'Analyzing Data and Ensuring Data Quality',
      duration: 30,
      summary: 'Operations includes making data analyzable and trustworthy. This session covers analyzing data with Athena and QuickSight, SQL in Redshift and Athena, Athena Spark notebooks, the provisioned-vs-serverless trade-off, and aggregation concepts — plus ensuring data quality with checks, Glue Data Quality and DataBrew rules, sampling, and handling data skew.',
      objectives: [
        'Analyze and visualize data with Athena, QuickSight, and SQL in Redshift/Athena',
        'Use Athena notebooks with Apache Spark to explore data',
        'Weigh provisioned vs. serverless trade-offs for analytics workloads',
        'Ensure data quality with checks, Glue Data Quality / DataBrew rules, sampling, and skew handling',
      ],
      preLearningCheck: {
        question: 'A team wants interactive business dashboards over data in Redshift and S3, shared with non-technical stakeholders. Which AWS service is purpose-built for this?',
        options: [
          'Amazon Athena',
          'Amazon QuickSight',
          'AWS Glue crawler',
          'Amazon SQS',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Amazon QuickSight is AWS’s serverless BI and dashboarding service, connecting to Redshift, Athena/S3, RDS, and more to build interactive visualizations for business users.',
      },
      sections: [
        {
          heading: 'Analyzing and visualizing data',
          body: 'Analysis turns stored data into answers. Amazon Athena runs SQL over S3 for ad-hoc analysis; Amazon Redshift runs SQL for warehouse analytics and can create views to encapsulate logic. Amazon QuickSight is the BI layer — interactive dashboards and visualizations over Redshift, Athena, and more, with SPICE in-memory acceleration. The exam expects you to know SQL analysis concepts: aggregation, rolling averages, GROUP BY, and pivoting.',
          bullets: [
            'Athena: serverless SQL over S3 for ad-hoc analysis and views.',
            'Redshift: warehouse SQL and views for repeated analytical workloads.',
            'QuickSight: serverless BI dashboards; SPICE caches data for fast visuals.',
            'Know aggregation, rolling average, grouping, and pivoting as SQL concepts.',
          ],
        },
        {
          heading: 'Athena Spark notebooks and exploration',
          body: 'Beyond SQL, Athena supports Apache Spark notebooks for interactive, code-based exploration over large datasets without provisioning a cluster — useful for data scientists and engineers exploring data with PySpark. This pairs serverless convenience with Spark’s expressiveness for transformations and analysis that exceed plain SQL.',
          bullets: [
            'Athena for Apache Spark: run PySpark in notebooks, serverless, no cluster to manage.',
            'Good for exploratory, code-based analysis over S3 data.',
            'Complements Athena SQL for logic that is awkward in pure SQL.',
          ],
        },
        {
          heading: 'Provisioned vs. serverless trade-offs',
          body: 'A recurring decision: provisioned (Redshift provisioned clusters, EMR on EC2) vs. serverless (Athena, Redshift Serverless, EMR Serverless, Glue). Serverless minimizes operations and bills per use — ideal for spiky, unpredictable, or intermittent workloads. Provisioned can be cheaper and more controllable for steady, high-utilization workloads and offers fine tuning. Match the billing and operations model to the workload pattern.',
          bullets: [
            'Serverless (Athena, Redshift Serverless, Glue): no ops, pay-per-use, great for spiky/intermittent loads.',
            'Provisioned (Redshift clusters, EMR on EC2): steady high-utilization, tunable, can be cheaper at scale.',
            'Decide on workload predictability and utilization, not just preference.',
          ],
          callout: { type: 'tip', text: 'Spiky, unpredictable, or occasional analytics → serverless (Athena/Redshift Serverless). Steady, heavy, 24/7 utilization → a right-sized provisioned cluster is often cheaper.' },
        },
        {
          heading: 'Ensuring data quality',
          body: 'Trustworthy pipelines validate data. Run quality checks during processing — completeness (no empty required fields), validity, uniqueness, and consistency. AWS Glue Data Quality defines and runs rules on Glue tables and jobs; DataBrew profiles data and applies rule-based validation. Sampling examines a representative subset for quick checks, and handling data skew (rebalancing hot keys) keeps distributed jobs from stalling. Failing records can be quarantined for review rather than corrupting downstream data.',
          bullets: [
            'Check completeness, validity, uniqueness, and consistency while processing.',
            'AWS Glue Data Quality / DataBrew define and enforce data-quality rules.',
            'Sampling gives fast quality signals on large datasets.',
            'Mitigate data skew (salting/repartitioning) so distributed jobs stay balanced.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'An analytics workload runs heavy queries only a few hours a week, unpredictably. Which model minimizes cost and operational overhead?',
          options: [
            'A large, always-on provisioned Redshift cluster',
            'Serverless options such as Amazon Athena or Redshift Serverless that bill per use',
            'A fleet of EC2 instances running constantly',
            'An on-premises Hadoop cluster',
          ],
          correct: 1,
          explainCorrect: 'Correct — serverless analytics bills per use and requires no idle capacity, ideal for spiky, intermittent workloads.',
          elaborativePrompt: 'At what utilization level would a provisioned cluster start to beat serverless on cost?',
        },
        {
          afterSection: 3,
          question: 'A pipeline must reject records with missing required fields and enforce uniqueness rules as part of an AWS Glue job. Which capability fits best?',
          options: [
            'Amazon QuickSight visuals',
            'AWS Glue Data Quality rules',
            'S3 versioning',
            'A DynamoDB GSI',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Glue Data Quality defines and evaluates rules (completeness, uniqueness, validity) within Glue jobs to gate bad data.',
          elaborativePrompt: 'Why is quarantining failing records often better than dropping them silently?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a weekly analytics job runs unpredictably and must produce a stakeholder dashboard from trustworthy data. Walk through why you choose serverless analytics, where QuickSight fits, and how Glue Data Quality rules ensure completeness and uniqueness before the data reaches the dashboard.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs ad-hoc analytical SQL over S3 a few times a week and must publish interactive dashboards to business stakeholders, while ensuring incoming data has no missing required fields. Which combination best meets all requirements with the least operational overhead?',
        options: [
          'A 24/7 provisioned Redshift cluster, Excel exports, and manual spot-checks',
          'Amazon Athena for the ad-hoc SQL, Amazon QuickSight for dashboards, and AWS Glue Data Quality rules to enforce completeness',
          'Amazon EMR on EC2 running constantly, with custom Spark dashboards',
          'DynamoDB for analytics with a Lambda emailing CSVs',
        ],
        correct: 1,
        explanation: {
          summary: 'Athena (serverless SQL) + QuickSight (serverless BI) + Glue Data Quality (rule enforcement) match the intermittent, low-overhead, quality-gated requirement exactly.',
          perOption: [
            'A 24/7 cluster wastes money for a few-times-a-week workload, and manual checks do not enforce quality.',
            'Correct — Athena handles intermittent SQL with no idle cost, QuickSight delivers stakeholder dashboards, and Glue Data Quality enforces completeness rules.',
            'Always-on EMR and custom dashboards add heavy operational overhead for an occasional workload.',
            'DynamoDB is not an analytical engine, and emailing CSVs is not interactive dashboarding.',
          ],
          link: 'Domain 3 · Tasks 3.2 & 3.4 — Analyze data and ensure data quality',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers Athena, QuickSight, serverless vs. provisioned, and data quality — companion to Tasks 3.2 and 3.4.' },
      ],
      keyTerms: [
        { term: 'Amazon QuickSight', def: 'AWS’s serverless BI service for interactive dashboards over Redshift, Athena/S3, and more, with SPICE in-memory acceleration.' },
        { term: 'Athena for Apache Spark', def: 'Serverless Spark notebooks in Athena for code-based exploration of S3 data without managing a cluster.' },
        { term: 'Serverless vs. provisioned', def: 'A cost/operations trade-off: serverless bills per use for spiky loads; provisioned suits steady, high-utilization workloads.' },
        { term: 'AWS Glue Data Quality', def: 'A capability to define and evaluate data-quality rules (completeness, uniqueness, validity) on Glue tables and jobs.' },
        { term: 'Data skew', def: 'Uneven key distribution that overloads one worker; mitigated by salting or repartitioning to keep jobs balanced.' },
      ],
      awsServices: [
        { name: 'Amazon Athena', purpose: 'Serverless SQL and Spark notebooks for ad-hoc analysis and exploration over S3.' },
        { name: 'Amazon QuickSight', purpose: 'Serverless BI dashboards and visualizations for business stakeholders.' },
        { name: 'AWS Glue Data Quality / DataBrew', purpose: 'Define and enforce data-quality rules and profile data during processing.' },
      ],
      examTips: [
        'Interactive BI dashboards for stakeholders → Amazon QuickSight.',
        'Spiky/occasional analytics → serverless (Athena, Redshift Serverless); steady heavy load → provisioned cluster.',
        'Code-based exploration without a cluster → Athena for Apache Spark notebooks.',
        'Enforce completeness/uniqueness/validity in pipelines → AWS Glue Data Quality (or DataBrew rules).',
        'Know SQL analysis concepts: aggregation, rolling average, GROUP BY, pivoting; mitigate skew with salting/repartitioning.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s13',
      number: 13,
      module: 'Domain 3 · Data Operations and Support',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.3',
      title: 'Maintaining and Monitoring Pipelines — CloudWatch, CloudTrail, and Log Analysis',
      duration: 30,
      summary: 'Pipelines fail quietly unless you watch them. This session covers maintaining and monitoring data pipelines: logging application data to CloudWatch Logs, tracking API calls with CloudTrail, alerting on problems, troubleshooting performance and failures in Glue and EMR, extracting logs for audit, and analyzing logs with Athena, OpenSearch, and CloudWatch Logs Insights.',
      objectives: [
        'Log application and pipeline data with Amazon CloudWatch Logs',
        'Track API activity for audit and troubleshooting with AWS CloudTrail',
        'Send alerts and troubleshoot performance and failures in Glue and EMR',
        'Extract and analyze logs with Athena, Amazon OpenSearch Service, and CloudWatch Logs Insights',
      ],
      preLearningCheck: {
        question: 'You need to know which user or role deleted an S3 object and when, for an audit. Which service provides this record?',
        options: [
          'Amazon CloudWatch metrics',
          'AWS CloudTrail (API activity logging)',
          'Amazon QuickSight',
          'AWS Glue crawler logs',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. AWS CloudTrail records API calls — who did what, when, and from where — across AWS, making it the source of truth for auditing actions like a DeleteObject call.',
      },
      sections: [
        {
          heading: 'Logging and metrics with CloudWatch',
          body: 'Amazon CloudWatch is the observability backbone. CloudWatch Logs collects application and service logs (Glue, EMR, Lambda, Redshift) for searching and retention control. CloudWatch metrics track performance and health; alarms fire when a metric breaches a threshold and notify via SNS or trigger automation. Structured logs plus the right metrics make a pipeline’s behavior visible and alertable.',
          bullets: [
            'CloudWatch Logs: centralize pipeline and application logs; set retention to control cost.',
            'CloudWatch metrics + alarms: detect threshold breaches and notify (SNS) or act.',
            'Most data services emit logs/metrics to CloudWatch natively.',
          ],
        },
        {
          heading: 'Auditing with CloudTrail',
          body: 'AWS CloudTrail records management and (optionally) data-event API calls across the account — the authoritative audit trail of who did what. It answers "who deleted this table," "who changed this IAM policy," and feeds security and compliance reviews. CloudTrail logs can be delivered to S3 and queried (Athena) or analyzed in CloudTrail Lake. Distinguish CloudTrail (API activity / audit) from CloudWatch (metrics, logs, alarms).',
          bullets: [
            'CloudTrail = API call history for audit and forensic troubleshooting.',
            'Deliver trails to S3; query with Athena or use CloudTrail Lake.',
            'CloudTrail (who/what/when on APIs) vs. CloudWatch (performance metrics + app logs).',
          ],
          callout: { type: 'note', text: 'Audit "who performed an action" → CloudTrail. Monitor "how the system is performing / app logs" → CloudWatch. This split is a frequent distractor.' },
        },
        {
          heading: 'Troubleshooting Glue and EMR',
          body: 'Operations means fixing pipelines. Glue job failures and performance issues are diagnosed from job run details, CloudWatch Logs, and metrics (DPU usage, errors); common causes include OOM from skew, schema mismatches, and throttled sources. EMR issues are read from step logs, YARN/Spark UIs, and CloudWatch; common causes include under-sized nodes, skew, and Spot interruptions. Bookmarks, retries, and right-sizing are typical remedies.',
          bullets: [
            'Glue: inspect job run logs/metrics; fix OOM (skew), schema drift, and source throttling.',
            'EMR: use step logs and Spark/YARN UIs; right-size nodes and handle Spot interruptions.',
            'Use retries and idempotency so transient failures recover automatically.',
          ],
        },
        {
          heading: 'Extracting and analyzing logs',
          body: 'Logs are a dataset too. For audits and analysis, extract logs to S3 and query them with Athena, stream them to Amazon OpenSearch Service for search and dashboards, or use CloudWatch Logs Insights for fast ad-hoc queries directly on log groups. For very large log volumes, EMR can process them at scale. Match the tool to volume and latency: Logs Insights for quick interactive queries, OpenSearch for search/dashboards, Athena/EMR for big batch log analytics.',
          bullets: [
            'CloudWatch Logs Insights: fast interactive queries over log groups.',
            'OpenSearch Service: full-text search and dashboards over log data.',
            'Athena (logs in S3) / EMR: large-scale batch log analysis.',
          ],
          callout: { type: 'tip', text: 'Quick interactive log queries → CloudWatch Logs Insights. Search + dashboards over logs → OpenSearch. Huge historical log analytics in S3 → Athena or EMR.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A security review must determine which IAM principal ran an UnloadFromRedshift-related API call and when. Which service holds this information?',
          options: [
            'Amazon CloudWatch metrics',
            'AWS CloudTrail',
            'Amazon Athena query history only',
            'AWS Glue Data Catalog',
          ],
          correct: 1,
          explainCorrect: 'Correct — CloudTrail records API activity with the principal, time, and source, serving as the audit trail for such reviews.',
          elaborativePrompt: 'How do CloudTrail and CloudWatch play complementary but distinct roles in operations?',
        },
        {
          afterSection: 3,
          question: 'An on-call engineer needs to run a quick, interactive query across recent application logs in a CloudWatch log group to find error patterns. Which tool is the most direct fit?',
          options: [
            'Amazon QuickSight',
            'CloudWatch Logs Insights',
            'AWS CloudFormation',
            'Amazon SQS',
          ],
          correct: 1,
          explainCorrect: 'Correct — CloudWatch Logs Insights runs fast, interactive queries directly over log groups, ideal for ad-hoc error investigation.',
          elaborativePrompt: 'When would you stream logs to OpenSearch instead of using Logs Insights?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a nightly Glue job started failing and a stakeholder asks both "why is it failing" and "who changed its configuration." Walk through how CloudWatch Logs/metrics diagnose the failure, how CloudTrail reveals the configuration change, and which tool you use to query the logs quickly versus at large scale.',
      sample: {
        type: 'multiple-choice',
        stem: 'A data team must alert on AWS Glue job failures within minutes, investigate the cause from logs, and separately produce an audit record of who modified the job’s configuration. Which combination of services is appropriate?',
        options: [
          'Use only Amazon QuickSight dashboards for everything',
          'CloudWatch metrics/alarms (with SNS) and CloudWatch Logs to detect and investigate failures, plus AWS CloudTrail to audit who changed the job configuration',
          'Rely on S3 versioning to detect failures and audit changes',
          'Use DynamoDB Streams to capture job failures and configuration changes',
        ],
        correct: 1,
        explanation: {
          summary: 'CloudWatch alarms + Logs handle failure detection and root-cause investigation; CloudTrail provides the audit trail of configuration changes — each service in its proper role.',
          perOption: [
            'QuickSight is a BI tool, not an alerting, logging, or audit service.',
            'Correct — CloudWatch alarms (via SNS) alert on failures, CloudWatch Logs supports investigation, and CloudTrail records who changed the configuration.',
            'S3 versioning tracks object versions, not Glue job failures or API-level configuration changes.',
            'DynamoDB Streams captures table item changes, not Glue failures or IAM/config API activity.',
          ],
          link: 'Domain 3 · Task 3.3 — Maintain and monitor data pipelines',
        },
      },
      videos: [
        { videoId: '6G0bLDIcO7Y', title: 'AWS Certified Data Engineer – Associate (DEA-C01) [Full Course in 285min]', channel: 'Johnny Chivers', relevance: 'Covers CloudWatch, CloudTrail, and log analysis for pipeline monitoring — companion to Task 3.3.' },
      ],
      keyTerms: [
        { term: 'Amazon CloudWatch Logs', def: 'Centralized log collection for AWS services and applications, with retention control and querying via Logs Insights.' },
        { term: 'CloudWatch alarm', def: 'A rule that fires when a metric breaches a threshold, notifying via SNS or triggering automation.' },
        { term: 'AWS CloudTrail', def: 'A record of API calls across AWS — who did what, when, from where — the authoritative audit trail.' },
        { term: 'CloudWatch Logs Insights', def: 'An interactive query tool for fast ad-hoc analysis of CloudWatch log groups.' },
        { term: 'Amazon OpenSearch Service', def: 'A managed search and analytics engine used to search and visualize log data.' },
      ],
      awsServices: [
        { name: 'Amazon CloudWatch', purpose: 'Collect logs, track metrics, and alarm on pipeline health and performance.' },
        { name: 'AWS CloudTrail', purpose: 'Audit API activity to determine who changed or accessed resources.' },
        { name: 'Amazon OpenSearch Service / Athena', purpose: 'Search, dashboard, and analyze log data for troubleshooting and audit.' },
      ],
      examTips: [
        'Audit "who did what" → CloudTrail; monitor performance + app logs → CloudWatch. Keep the split straight.',
        'Alert on pipeline failures → CloudWatch alarms → SNS.',
        'Quick interactive log queries → CloudWatch Logs Insights; search/dashboards → OpenSearch; big batch log analytics → Athena/EMR.',
        'Glue failures: read job run logs/metrics; common causes are skew OOM, schema drift, throttling.',
        'Build retries and idempotency so transient pipeline failures recover automatically.',
      ],
    },

  ],
}

export default deaC01Course
