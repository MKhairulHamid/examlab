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

  ],
}

export default deaC01Course
