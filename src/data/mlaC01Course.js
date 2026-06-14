// AWS Certified Machine Learning Engineer – Associate (MLA-C01) — Exam Prep Course
// 15 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors clfC02Course.js / saaC03Course.js / dvaC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 4 — Domain 1 (Data Preparation) + Domain 2 (ML Model Development) authored (s1–s8).
// D3 (Deployment & Orchestration) + D4 (Monitoring, Maintenance & Security) sessions and interactive widgets land in Step 2.

const mlaC01Course = {
  slug: 'mla-c01',
  title: 'AWS Certified Machine Learning Engineer – Associate — Full Prep Course',
  code: 'MLA-C01',
  subtitle: 'Fifteen ~30-minute sessions covering all four domains of the ML engineering lifecycle, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 130 minutes, pass at 720/1000 (~72%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Data Preparation for ML', weight: '28%' },
    { id: 'd2', label: 'Domain 2 · ML Model Development', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · Deployment & Orchestration', weight: '22%' },
    { id: 'd4', label: 'Domain 4 · Monitoring, Maintenance & Security', weight: '24%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — DATA PREPARATION FOR MACHINE LEARNING (28%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Data Preparation for ML',
      domain: 'd1',
      weight: '28%',
      task: 'Task 1.1',
      title: 'Ingesting and Storing Data for ML',
      duration: 30,
      summary: 'Every ML pipeline starts with data arriving somewhere it can be used. This session builds the foundation: the file formats ML loves, the AWS storage and streaming services that hold and move data, and how to choose between them on cost, performance, and access pattern.',
      objectives: [
        'Choose the right data format (Parquet, ORC, Avro, JSON, CSV, RecordIO) for an ML access pattern',
        'Match a workload to the correct storage service (S3, EFS, FSx, EBS) and streaming source (Kinesis, MSK, Managed Flink)',
        'Extract data from operational stores (RDS, DynamoDB) into an ML-ready location',
        'Reason about cost, throughput, and latency trade-offs when making the initial storage decision',
      ],
      preLearningCheck: {
        question: 'A team trains models on a 500 GB tabular dataset and almost every job reads only 6 of the 80 columns. Which storage format minimizes the data scanned per training run?',
        options: [
          'CSV, because it is human-readable and widely supported',
          'JSON, because it preserves nested structure',
          'Apache Parquet, because it is columnar and reads only the needed columns',
          'A single compressed ZIP archive of CSV files',
        ],
        correct: 2,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Why data preparation is the largest domain',
          body: 'Domain 1 is 28% of MLA-C01 — the biggest slice — because in real ML work, data wrangling dwarfs modeling. A model is only as good as the data feeding it, and an ML engineer spends more time moving, cleaning, and shaping data than tuning algorithms.\n\nThis first session is about getting data into the right place in the right shape. The next three sessions transform it, engineer features, and guard its quality and fairness.',
        },
        {
          heading: 'Data formats: row vs. columnar',
          body: 'The format you store data in directly affects training cost and speed. The exam expects you to pick by access pattern.',
          table: {
            headers: ['Format', 'Type', 'Best for'],
            rows: [
              ['Apache Parquet', 'Columnar', 'Analytics and ML training that read a subset of columns — reads less, costs less, compresses well'],
              ['Apache ORC', 'Columnar', 'Similar to Parquet; common in the Hive/EMR ecosystem'],
              ['Apache Avro', 'Row-based + schema', 'Streaming and record-by-record processing where the whole row is needed; schema evolution'],
              ['CSV / JSON', 'Row-based text', 'Small data, human readability, interchange — simple but no column pruning, larger and slower'],
              ['RecordIO (protobuf)', 'Binary record', 'The packed format several SageMaker built-in algorithms read most efficiently (Pipe mode)'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "reads only some columns," "reduce data scanned," or "lower Athena/training cost" → columnar Parquet/ORC. "SageMaker built-in algorithm, streaming input" → RecordIO-protobuf.' },
        },
        {
          heading: 'Where data lives: storage services',
          body: 'Object storage is the default ML data lake, but file and block storage matter when training jobs need a POSIX file system or high IOPS.',
          table: {
            headers: ['Service', 'Kind', 'ML use case'],
            rows: [
              ['Amazon S3', 'Object store', 'The ML data lake — training data, model artifacts, datasets. Default answer for "store training data."'],
              ['Amazon EFS', 'Shared file (NFS)', 'A shared, elastic file system many training instances mount at once for the same dataset'],
              ['Amazon FSx for Lustre', 'High-perf file', 'High-throughput, low-latency file system for large-scale training; can link to an S3 bucket'],
              ['Amazon EBS', 'Block (single instance)', 'A volume attached to one instance/notebook; Provisioned IOPS for demanding I/O'],
            ],
          },
        },
        {
          heading: 'Streaming ingestion',
          body: 'When data arrives continuously, you ingest it with a streaming service rather than batch-loading files.',
          bullets: [
            'Amazon Kinesis Data Streams — real-time, ordered, sharded ingestion you build consumers against; replay within retention.',
            'Amazon Data Firehose — fully managed delivery that buffers and lands streaming data into S3/Redshift/OpenSearch, with optional format conversion to Parquet/ORC.',
            'Amazon Managed Service for Apache Flink — stateful stream processing/analytics on data in motion.',
            'Amazon MSK (Managed Streaming for Apache Kafka) — managed Kafka when teams already standardize on Kafka.',
          ],
          callout: { type: 'note', text: 'Firehose is the low-effort path to "land streaming data in S3 as Parquet." Kinesis Data Streams is the choice when you need custom, low-latency consumers or replay.' },
        },
        {
          heading: 'Pulling from operational stores',
          body: 'Training data often starts in a transactional database. You extract it into S3 rather than training against the live OLTP store.',
          bullets: [
            'Amazon RDS / Aurora — relational source; export snapshots to S3 or use AWS Glue/Spark to extract and land in the lake.',
            'Amazon DynamoDB — key-value/NoSQL source; export to S3 (point-in-time export) or stream changes for incremental datasets.',
            'S3 Transfer Acceleration speeds long-distance uploads into S3; EBS Provisioned IOPS guarantees disk throughput for an instance doing heavy local I/O.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 3,
          question: 'A distributed training job runs on 8 instances that must all read the SAME large dataset through a high-throughput POSIX file interface. Which storage service is the best fit?',
          options: [
            'Amazon S3 mounted individually on each instance with no shared layer',
            'Amazon FSx for Lustre, optionally linked to the S3 dataset',
            'A separate Amazon EBS volume attached to each instance',
            'Amazon DynamoDB as the training data source',
          ],
          correct: 1,
          explainCorrect: 'Correct — FSx for Lustre gives a high-throughput shared file system that all instances mount, and it can hydrate from S3, making it ideal for large distributed training.',
          elaborativePrompt: 'Why is a per-instance EBS volume a poor fit here? What problem does a shared file system solve that independent block volumes do not?',
        },
        {
          afterSection: 4,
          question: 'A team must continuously land clickstream events into S3 as Parquet for later training, with the least operational effort. Which service is the best fit?',
          options: [
            'Amazon Data Firehose with record format conversion to Parquet',
            'Amazon EBS Provisioned IOPS',
            'A cron job that copies CSV files nightly',
            'Amazon DynamoDB Streams written directly to a model',
          ],
          correct: 0,
          explainCorrect: 'Correct — Firehose is fully managed, buffers the stream, converts records to Parquet, and delivers to S3 with no servers to manage.',
          elaborativePrompt: 'Firehose vs. Kinesis Data Streams — when would the extra control of Data Streams be worth the added operational effort?',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate why an ML team would convert raw CSV logs to Parquet before training, even though it adds a transformation step. What two costs does columnar storage reduce?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML engineer is building a training pipeline over 2 TB of historical transaction data currently stored as gzipped CSV in Amazon S3. Training jobs read only 8 of the 60 columns, and the team wants to cut both Amazon Athena query cost and per-job data read. What should the engineer do?',
        options: [
          'Keep the CSV files but enable S3 Transfer Acceleration',
          'Convert the data to Apache Parquet so queries and training read only the needed columns',
          'Load all the data into Amazon DynamoDB and read it from there',
          'Store the CSV files on Amazon EBS Provisioned IOPS volumes',
        ],
        correct: 1,
        explanation: {
          summary: 'Parquet is columnar and compressed, so both Athena and the training job read only the 8 requested columns instead of scanning every row of all 60 — directly lowering scanned bytes, cost, and read time.',
          perOption: [
            'Transfer Acceleration speeds uploads into S3; it does nothing to reduce the bytes scanned per query or training read.',
            'Correct — columnar Parquet enables column pruning and compression, the canonical fix for "reduce scanned data and cost."',
            'DynamoDB is an operational key-value store, not an analytics/training format; it would be costly and ill-suited to columnar scans.',
            'EBS Provisioned IOPS changes disk throughput, not the amount of data the query engine must read; the CSV scan cost remains.',
          ],
          link: 'D1 · Task 1.1 — Choosing data formats based on access patterns',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — orients you to the full exam scope and how this session fits.',
        },
      ],
      keyTerms: [
        { term: 'Columnar format', def: 'A storage layout (Parquet, ORC) that stores values column-by-column, so queries read only the columns they need and compress efficiently.' },
        { term: 'RecordIO-protobuf', def: 'A packed binary record format that several SageMaker built-in algorithms read most efficiently, especially in Pipe mode.' },
        { term: 'Pipe mode', def: 'A SageMaker input mode that streams data from S3 directly to the training algorithm rather than downloading it first.' },
        { term: 'FSx for Lustre', def: 'A high-throughput, low-latency shared file system suited to large-scale and distributed ML training; can link to an S3 dataset.' },
        { term: 'Amazon Data Firehose', def: 'A fully managed service that buffers streaming data and delivers it to destinations like S3, with optional conversion to Parquet/ORC.' },
      ],
      awsServices: [
        { name: 'Amazon S3', purpose: 'Object storage that serves as the default ML data lake for datasets and model artifacts.' },
        { name: 'Amazon FSx for Lustre', purpose: 'High-performance shared file system for large-scale and distributed training, linkable to S3.' },
        { name: 'Amazon Kinesis', purpose: 'Real-time streaming ingestion (Data Streams) and managed delivery (Data Firehose) for data in motion.' },
        { name: 'Amazon MSK', purpose: 'Managed Apache Kafka for teams standardized on Kafka for event streaming.' },
        { name: 'Amazon EFS / EBS', purpose: 'Shared NFS file storage (EFS) and single-instance block storage (EBS) for training and notebooks.' },
      ],
      examTips: [
        '"Read only some columns / reduce scanned bytes / lower cost" → Apache Parquet (columnar).',
        '"Land streaming data in S3 with least effort" → Amazon Data Firehose (with Parquet conversion).',
        '"Many training instances share one large dataset over a file system" → FSx for Lustre.',
        'SageMaker built-in algorithms are most efficient with RecordIO-protobuf in Pipe mode.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Data Preparation for ML',
      domain: 'd1',
      weight: '28%',
      task: 'Task 1.2',
      title: 'Transforming Data and Feature Engineering',
      duration: 30,
      summary: 'Raw data is rarely model-ready. This session covers the cleaning and feature-engineering techniques the exam expects — handling outliers and missing values, scaling, encoding categorical variables — and the AWS tools that do the work: SageMaker Data Wrangler, AWS Glue, DataBrew, and Spark on EMR.',
      objectives: [
        'Apply cleaning techniques: outlier treatment, missing-value imputation, deduplication',
        'Choose feature-engineering transforms: scaling/standardization, binning, log transform, normalization',
        'Select the right encoding (one-hot, label, binary) for a categorical feature',
        'Match a transformation job to the right AWS tool (Data Wrangler vs. Glue vs. DataBrew vs. EMR Spark)',
      ],
      preLearningCheck: {
        question: 'A categorical feature "city" has 3 unordered values used by a linear model. Which encoding avoids implying a false numeric order between the categories?',
        options: [
          'Label encoding (city → 0, 1, 2)',
          'One-hot encoding (one binary column per city)',
          'Leaving the strings as-is',
          'Log transformation',
        ],
        correct: 1,
        note: 'Take a guess first — the attempt primes you to retain the distinction.',
      },
      sections: [
        {
          heading: 'Cleaning before engineering',
          body: 'Before crafting features, you fix data quality. The exam tests that you know the standard remedies and their trade-offs.',
          table: {
            headers: ['Problem', 'Technique', 'Note'],
            rows: [
              ['Missing values', 'Imputation (mean/median/mode, model-based) or row drop', 'Median is robust to outliers; dropping rows loses data — prefer imputation when data is scarce'],
              ['Outliers', 'Detect (z-score, IQR) then cap, transform, or remove', 'Don’t blindly delete — an "outlier" may be a real signal (fraud)'],
              ['Duplicates', 'Deduplication on a key', 'Duplicate rows bias the model toward repeated examples'],
              ['Mixed/dirty values', 'Standardize formats, fix types', 'e.g. unify date formats, trim units from numbers'],
            ],
          },
        },
        {
          heading: 'Feature engineering transforms',
          body: 'Feature engineering reshapes values so the model learns more easily. Scaling matters most for distance- and gradient-based algorithms.',
          bullets: [
            'Scaling / standardization — put features on a comparable range (min-max scaling to [0,1], or standardization to mean 0 / std 1). Critical for k-NN, SVM, neural nets; less so for tree models.',
            'Normalization — rescale so values share a common scale or unit norm.',
            'Log transformation — compress a long right-tailed distribution (income, counts) so the model is less dominated by huge values.',
            'Binning — bucket a continuous value into ranges (age → child/adult/senior) to capture non-linear effects.',
            'Feature splitting — break a compound field (timestamp → hour, day-of-week) into informative parts.',
          ],
          callout: { type: 'tip', text: 'Exam signal: "features on very different scales" + a distance/gradient algorithm (k-NN, neural net) → standardize/scale. Tree-based models (XGBoost) are largely scale-invariant.' },
        },
        {
          heading: 'Encoding categorical variables',
          body: 'Models need numbers. How you turn categories into numbers depends on whether the category has an inherent order and how many distinct values it has.',
          table: {
            headers: ['Encoding', 'When to use', 'Watch out for'],
            rows: [
              ['One-hot', 'Unordered categories with low cardinality', 'High cardinality explodes column count (the "curse of dimensionality")'],
              ['Label / ordinal', 'Categories with a real order (low/med/high)', 'On unordered data it invents a false ranking that misleads linear models'],
              ['Binary / hashing', 'High-cardinality categories', 'Fewer columns than one-hot; some collision risk'],
              ['Tokenization', 'Text → tokens/IDs for NLP', 'Feeds embeddings or language models'],
            ],
          },
        },
        {
          heading: 'Which AWS tool transforms the data?',
          body: 'A frequent exam decision: the same transformation can be done several ways, and the "best" answer depends on scale, who does it, and operational effort.',
          table: {
            headers: ['Tool', 'Sweet spot', 'Character'],
            rows: [
              ['SageMaker Data Wrangler', 'Visual, interactive feature engineering inside SageMaker Studio', 'Fast exploration; exports a repeatable processing flow'],
              ['AWS Glue', 'Serverless Spark ETL at scale; data catalog', 'Code/visual ETL for large pipelines, scheduled jobs'],
              ['AWS Glue DataBrew', 'No-code visual data cleaning/profiling for analysts', '250+ prebuilt transforms, no programming'],
              ['Spark on Amazon EMR', 'Very large custom Spark/Hadoop processing', 'Most control; you manage the cluster lifecycle'],
            ],
          },
          callout: { type: 'note', text: 'Data Wrangler = interactive feature engineering for the data scientist in Studio. DataBrew = no-code cleaning for analysts. Glue = serverless ETL pipelines. EMR = heavy, custom, large-scale Spark.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A feature representing annual income is heavily right-skewed, with a few very large values dominating a linear model. Which transformation most directly reduces that skew?',
          options: [
            'One-hot encoding',
            'Log transformation',
            'Deduplication',
            'Label encoding',
          ],
          correct: 1,
          explainCorrect: 'Correct — a log transform compresses the long right tail so extreme values no longer dominate, often making the distribution closer to normal.',
          elaborativePrompt: 'Why does a tree-based model care less about this skew than a linear model does?',
        },
        {
          afterSection: 4,
          question: 'A data scientist wants to interactively explore a dataset and build a repeatable feature-engineering flow directly inside SageMaker Studio. Which tool fits best?',
          options: [
            'AWS Glue DataBrew',
            'Spark on Amazon EMR',
            'SageMaker Data Wrangler',
            'Amazon Athena',
          ],
          correct: 2,
          explainCorrect: 'Correct — Data Wrangler is built for interactive, visual feature engineering in Studio and exports the steps as a repeatable processing flow.',
          elaborativePrompt: 'When would you move the same transformations from Data Wrangler to a Glue job instead?',
        },
      ],
      selfExplanationPrompt: 'Explain why one-hot encoding a 10,000-value "product_id" column is a bad idea, and name one alternative encoding that scales better.',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML engineer is preparing a dataset for a k-nearest-neighbors model. Features include "age" (0–100), "annual_income" (0–500000), and "city" (one of five unordered values). The model performs poorly, dominated by income. Which preparation steps are MOST appropriate?',
        options: [
          'Label-encode city as 0–4 and leave age and income unscaled',
          'Standardize age and income to comparable scales and one-hot encode city',
          'Drop age and income because they are numeric',
          'Bin city into ranges and leave income unscaled',
        ],
        correct: 1,
        explanation: {
          summary: 'k-NN uses distance, so features on vastly different scales let income dominate — standardizing age and income fixes that. City is unordered, so one-hot encoding avoids inventing a false numeric ranking.',
          perOption: [
            'Label-encoding unordered cities invents a false order, and leaving income unscaled keeps it dominating the distance metric.',
            'Correct — scale the numeric features for a distance-based model and one-hot the low-cardinality unordered category.',
            'Dropping the numeric features discards the most predictive signal; the problem is scaling, not their presence.',
            'Binning the (unordered) city does not address the income-scale problem that is causing the poor performance.',
          ],
          link: 'D1 · Task 1.2 — Feature scaling and encoding techniques',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — frames where data transformation sits in the exam.',
        },
      ],
      keyTerms: [
        { term: 'Standardization', def: 'Rescaling a feature to mean 0 and standard deviation 1, so features on different scales contribute comparably.' },
        { term: 'One-hot encoding', def: 'Turning an unordered category into one binary column per value, avoiding any false numeric ordering.' },
        { term: 'Imputation', def: 'Filling in missing values (e.g. with the median or a model prediction) instead of dropping the rows.' },
        { term: 'Binning', def: 'Bucketing a continuous variable into discrete ranges to capture non-linear effects.' },
        { term: 'Log transformation', def: 'Applying a logarithm to compress a long right-tailed distribution so extreme values no longer dominate.' },
      ],
      awsServices: [
        { name: 'SageMaker Data Wrangler', purpose: 'Visual, interactive data preparation and feature engineering inside SageMaker Studio.' },
        { name: 'AWS Glue', purpose: 'Serverless Spark-based ETL and data cataloging for large, scheduled transformation pipelines.' },
        { name: 'AWS Glue DataBrew', purpose: 'No-code visual data cleaning and profiling with 250+ prebuilt transforms for analysts.' },
        { name: 'Amazon EMR', purpose: 'Managed big-data platform for very large, custom Spark/Hadoop transformations.' },
      ],
      examTips: [
        'Distance/gradient algorithms (k-NN, SVM, neural nets) need scaling; tree models (XGBoost) usually do not.',
        'Unordered category → one-hot; ordered category → label/ordinal; high cardinality → binary/hashing.',
        'Data Wrangler = interactive Studio feature engineering; DataBrew = no-code cleaning; Glue = serverless ETL; EMR = heavy custom Spark.',
        'Right-skewed numeric feature → log transform to reduce the influence of extreme values.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Data Preparation for ML',
      domain: 'd1',
      weight: '28%',
      task: 'Task 1.2',
      title: 'Feature Store, Data Labeling, and Streaming Transforms',
      duration: 30,
      summary: 'Two recurring exam themes: how to store and reuse engineered features consistently across training and inference (SageMaker Feature Store), and how to create high-quality labeled datasets (Ground Truth, Mechanical Turk). We also cover transforming data as it streams in.',
      objectives: [
        'Explain what SageMaker Feature Store solves: feature reuse and train/serve consistency',
        'Distinguish online vs. offline feature stores and when each is used',
        'Choose the right labeling approach (Ground Truth, Ground Truth Plus, Mechanical Turk, A2I)',
        'Transform streaming data in flight with AWS Lambda or Spark',
      ],
      preLearningCheck: {
        question: 'A model uses a feature computed differently in the training pipeline than in the real-time serving code, causing degraded production accuracy. Which AWS capability is designed to prevent this train/serve skew?',
        options: [
          'Amazon S3 versioning',
          'SageMaker Feature Store (shared online + offline store)',
          'AWS Glue DataBrew',
          'Amazon Mechanical Turk',
        ],
        correct: 1,
        note: 'Guess first — retrieval practice strengthens memory even on a wrong attempt.',
      },
      sections: [
        {
          heading: 'The problem Feature Store solves',
          body: 'Teams often recompute the same features in many places — once in the training pipeline, again in the serving code. Small differences create "training/serving skew," where the model sees subtly different inputs in production than it learned from. SageMaker Feature Store is a central, governed repository of engineered features that both training and inference read from, so the definition is computed once and reused consistently.',
        },
        {
          heading: 'Online vs. offline store',
          body: 'Feature Store has two faces for two access patterns.',
          table: {
            headers: ['Store', 'Latency', 'Used for'],
            rows: [
              ['Online store', 'Low-latency, single-record lookup', 'Real-time inference — fetch the latest feature values for one entity at prediction time'],
              ['Offline store', 'High-throughput, historical (S3-backed)', 'Building training datasets and batch scoring from the full feature history'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "consistent features across training and real-time inference" or "reuse features across teams" → SageMaker Feature Store. Online store = real-time lookups; offline store = training/batch.' },
        },
        {
          heading: 'Creating labeled data',
          body: 'Supervised learning needs labels. AWS offers a spectrum from fully self-managed to fully managed labeling.',
          table: {
            headers: ['Service', 'What it does', 'Use when'],
            rows: [
              ['SageMaker Ground Truth', 'Managed data labeling with human + automated (active) labeling', 'You need labeled datasets and want automated labeling to cut cost'],
              ['Ground Truth Plus', 'Turnkey, AWS-managed labeling workforce/service', 'You want AWS to run the labeling operation for you'],
              ['Amazon Mechanical Turk', 'On-demand crowdsourced human workforce', 'You need a large, flexible pool of human workers for tasks'],
              ['Amazon A2I (Augmented AI)', 'Human review of low-confidence ML predictions', 'You need a human-in-the-loop to review uncertain inferences'],
            ],
          },
        },
        {
          heading: 'Transforming data in flight',
          body: 'Not all transformation is batch. When data streams in, you can transform each record before it lands.',
          bullets: [
            'AWS Lambda — run lightweight, per-record transformation on streaming data (e.g. invoked by Kinesis/Firehose) with no servers to manage.',
            'Spark (on EMR or Glue streaming) — stateful or heavy transformations over streaming micro-batches.',
            'Amazon Data Firehose can invoke a Lambda to transform records and convert format before delivery to S3.',
          ],
          callout: { type: 'note', text: 'Lambda is the default for simple, stateless per-record stream transforms; reach for Spark when the processing is heavy or needs windowed/stateful logic.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A fraud-detection model must look up a customer’s most recent engineered features in a few milliseconds at prediction time. Which part of SageMaker Feature Store serves this?',
          options: [
            'The offline store backed by Amazon S3',
            'The online store for low-latency single-record lookups',
            'AWS Glue Data Catalog',
            'Amazon Mechanical Turk',
          ],
          correct: 1,
          explainCorrect: 'Correct — the online store is optimized for low-latency, single-record retrieval at inference time.',
          elaborativePrompt: 'Why is the offline store, despite holding the same features, the wrong choice for real-time scoring?',
        },
        {
          afterSection: 3,
          question: 'A team needs humans to review only the ML predictions that fall below a confidence threshold, leaving high-confidence predictions automated. Which service implements this human-in-the-loop pattern?',
          options: [
            'Amazon A2I (Augmented AI)',
            'SageMaker Feature Store',
            'AWS Glue',
            'Amazon Kinesis',
          ],
          correct: 0,
          explainCorrect: 'Correct — Amazon A2I routes low-confidence inferences to human reviewers while letting confident predictions flow through automatically.',
          elaborativePrompt: 'How does A2I differ from Ground Truth in purpose — labeling a dataset vs. reviewing live predictions?',
        },
      ],
      selfExplanationPrompt: 'Describe "training/serving skew" in your own words and explain how a shared Feature Store removes it.',
      sample: {
        type: 'multiple-choice',
        stem: 'Several teams compute the same customer features in separate pipelines, and a model’s production accuracy is lower than in offline evaluation because a feature is calculated slightly differently at serving time. Which solution BEST addresses the root cause?',
        options: [
          'Store the training data in Apache Parquet to speed up reads',
          'Adopt SageMaker Feature Store so training and inference read the same centrally defined features',
          'Increase the model’s training epochs to improve accuracy',
          'Move the serving code to a larger instance type',
        ],
        correct: 1,
        explanation: {
          summary: 'The accuracy gap is caused by training/serving skew — the same feature computed differently in two places. A shared Feature Store defines each feature once and serves it to both training (offline store) and real-time inference (online store), eliminating the inconsistency.',
          perOption: [
            'Parquet improves read efficiency but does nothing about features being computed inconsistently across pipelines.',
            'Correct — Feature Store centralizes feature definitions so training and serving use identical values, removing the skew.',
            'More epochs cannot fix inputs that differ between training and production; it may even overfit.',
            'A larger instance changes performance, not the correctness of the feature values feeding the model.',
          ],
          link: 'D1 · Task 1.2 — Creating and managing features with SageMaker Feature Store',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — situates feature management and labeling in the exam blueprint.',
        },
      ],
      keyTerms: [
        { term: 'Feature Store', def: 'A central repository of engineered features, with an online store for real-time lookups and an offline store for training/batch.' },
        { term: 'Training/serving skew', def: 'Degraded production accuracy caused by features being computed differently during training than during inference.' },
        { term: 'SageMaker Ground Truth', def: 'A managed data-labeling service that combines human labelers with automated (active) labeling to reduce cost.' },
        { term: 'Amazon A2I', def: 'Augmented AI — routes low-confidence ML predictions to human reviewers (human-in-the-loop).' },
        { term: 'Active learning', def: 'A labeling technique where the model auto-labels confident examples and sends only uncertain ones to humans.' },
      ],
      awsServices: [
        { name: 'SageMaker Feature Store', purpose: 'Central feature repository ensuring consistent features across training and inference.' },
        { name: 'SageMaker Ground Truth', purpose: 'Managed dataset labeling with human and automated labeling workflows.' },
        { name: 'Amazon Mechanical Turk', purpose: 'On-demand crowdsourced human workforce for labeling and other tasks.' },
        { name: 'Amazon A2I', purpose: 'Human review of low-confidence model predictions (human-in-the-loop).' },
        { name: 'AWS Lambda', purpose: 'Serverless per-record transformation of streaming data with no infrastructure to manage.' },
      ],
      examTips: [
        '"Consistent features across training and real-time serving" → SageMaker Feature Store.',
        'Online store = low-latency real-time lookup; offline store = S3-backed training/batch history.',
        'Human review of only low-confidence predictions → Amazon A2I; dataset labeling → Ground Truth.',
        'Simple per-record stream transform → Lambda; heavy/stateful → Spark.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Data Preparation for ML',
      domain: 'd1',
      weight: '28%',
      task: 'Task 1.3',
      title: 'Data Integrity, Bias, and Compliance',
      duration: 30,
      summary: 'The last data session guards quality and fairness. We cover pre-training bias metrics and SageMaker Clarify, validating data quality with Glue Data Quality and DataBrew, protecting sensitive data (encryption, masking, PII/PHI), and preparing data — splitting, shuffling, augmentation — to reduce prediction bias.',
      objectives: [
        'Identify pre-training bias metrics (class imbalance, difference in proportions of labels) and how to address them',
        'Use SageMaker Clarify to detect bias and AWS Glue Data Quality / DataBrew to validate data',
        'Apply data protection: encryption, classification, anonymization, masking for PII/PHI and residency',
        'Prepare data with splitting, shuffling, and augmentation to reduce prediction bias',
      ],
      preLearningCheck: {
        question: 'A fraud dataset has 99% legitimate and 1% fraudulent transactions, and the model just predicts "legitimate" every time to score 99% accuracy. What is the core data problem?',
        options: [
          'The data is encrypted',
          'Severe class imbalance',
          'Too many feature columns',
          'The data is stored as Parquet',
        ],
        correct: 1,
        note: 'Guess before reading — the attempt makes the concept stick.',
      },
      sections: [
        {
          heading: 'Pre-training bias and class imbalance',
          body: 'Bias can enter before a model is even trained — in the data itself. The exam tests two pre-training bias concepts and the metrics SageMaker Clarify reports.',
          bullets: [
            'Class imbalance (CI) — one class vastly outnumbers another (fraud, rare disease). A naive model ignores the minority class and still scores high accuracy, which is misleading.',
            'Difference in proportions of labels (DPL) — a positive outcome is distributed unevenly across groups (a facet), signaling potential unfairness.',
            'Remedies for imbalance: resampling (oversample the minority / undersample the majority), synthetic data generation (e.g. SMOTE-style), and class weighting during training.',
          ],
          callout: { type: 'warning', text: 'High accuracy on an imbalanced dataset is a trap. Prefer precision, recall, and F1 (covered in Session 8) — and fix the imbalance with resampling or synthetic data.' },
        },
        {
          heading: 'SageMaker Clarify for bias',
          body: 'SageMaker Clarify detects bias and explains models at multiple stages of the lifecycle.',
          bullets: [
            'Pre-training bias — measures imbalance and label-proportion bias in the raw dataset (CI, DPL, and more) before training.',
            'Post-training bias — measures whether the trained model’s predictions differ unfairly across facets.',
            'Explainability — uses feature-attribution (SHAP-style) to show which features drove predictions.',
            'Drift detection — integrates with Model Monitor to flag when live data drifts from the training distribution (revisited in Domain 4).',
          ],
        },
        {
          heading: 'Validating data quality',
          body: 'Bad data silently degrades models. AWS provides managed ways to define and enforce quality rules.',
          table: {
            headers: ['Tool', 'Role'],
            rows: [
              ['AWS Glue Data Quality', 'Define and run data-quality rules (completeness, uniqueness, ranges) on data in the Glue catalog/pipelines'],
              ['AWS Glue DataBrew', 'Profile datasets and surface quality issues visually, no code'],
              ['SageMaker Clarify', 'Detect bias/imbalance as part of quality assessment'],
            ],
          },
        },
        {
          heading: 'Protecting sensitive data',
          body: 'ML data frequently contains PII or PHI, which brings compliance and residency obligations. You must classify, protect, and sometimes mask it.',
          bullets: [
            'Encryption — at rest with AWS KMS (S3 SSE-KMS, encrypted EBS/EFS), in transit with TLS. Use a customer-managed key when you need control and audit over key usage.',
            'Classification & discovery — Amazon Macie scans S3 to discover and classify sensitive data like PII.',
            'Anonymization & masking — remove or obscure direct identifiers; mask fields before they reach a wider audience or a training set that does not need them.',
            'Data residency — keep data in required Regions to meet legal/compliance constraints.',
          ],
          callout: { type: 'tip', text: '"Discover and classify PII sitting in S3" → Amazon Macie. "Encrypt training data at rest with auditable, controllable keys" → AWS KMS customer-managed key.' },
        },
        {
          heading: 'Preparing data to reduce prediction bias',
          body: 'Final preparation steps make evaluation honest and the model more robust.',
          bullets: [
            'Splitting — partition into train/validation/test so you measure generalization, not memorization. Never let test data leak into training.',
            'Shuffling — randomize order so the model does not learn an artifact of how data was sorted.',
            'Augmentation — synthetically expand data (image flips/crops, text paraphrase, minority-class synthesis) to improve robustness and balance.',
            'Configure the training data location (EFS/FSx) so the training job can load it efficiently.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A medical dataset has only 2% positive cases. Which combination best addresses the imbalance before training?',
          options: [
            'Do nothing; 98% accuracy by predicting "negative" is good enough',
            'Resample (oversample the minority or undersample the majority) and/or generate synthetic minority examples',
            'Encrypt the dataset with KMS',
            'Convert the dataset to Parquet',
          ],
          correct: 1,
          explainCorrect: 'Correct — resampling and synthetic minority generation rebalance the classes so the model actually learns the rare positive case.',
          elaborativePrompt: 'Why is "98% accuracy" misleading here, and which metrics would reveal the model is useless?',
        },
        {
          afterSection: 4,
          question: 'A company must automatically discover and classify personally identifiable information stored across many S3 buckets. Which service is purpose-built for this?',
          options: [
            'Amazon Macie',
            'AWS Glue DataBrew',
            'Amazon Kinesis',
            'SageMaker Feature Store',
          ],
          correct: 0,
          explainCorrect: 'Correct — Amazon Macie uses ML to discover and classify sensitive data such as PII in Amazon S3.',
          elaborativePrompt: 'Once Macie flags PII, what protection steps (encryption, masking) would you apply before the data is used for training?',
        },
      ],
      selfExplanationPrompt: 'Explain the difference between pre-training bias (what Clarify measures in the data) and the prediction problem caused by class imbalance. How does each get addressed?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML engineer is preparing a healthcare dataset that contains protected health information (PHI) for training a model. Requirements: discover and classify the sensitive fields, encrypt the data at rest with keys the security team can audit and control, and ensure the trained model is evaluated for bias across patient groups. Which combination meets these requirements?',
        options: [
          'Use Amazon Macie to classify PHI, encrypt with an AWS KMS customer-managed key, and use SageMaker Clarify to assess bias',
          'Store the data in CSV, encrypt with an AWS-owned key, and skip bias analysis',
          'Use AWS Glue to convert to Parquet and rely on default S3 encryption only',
          'Use Mechanical Turk to label the data and Amazon Kinesis to encrypt it',
        ],
        correct: 0,
        explanation: {
          summary: 'Macie discovers and classifies the PHI, a KMS customer-managed key gives the security team auditable control over encryption at rest, and SageMaker Clarify measures bias across patient facets — each tool maps to one requirement.',
          perOption: [
            'Correct — Macie for classification, KMS CMK for controllable/auditable encryption, Clarify for bias assessment.',
            'An AWS-owned key is not auditable/controllable by the security team, and skipping bias analysis violates the third requirement.',
            'Default S3 encryption gives no customer key control, and format conversion does not address classification or bias.',
            'Kinesis does not encrypt data for this purpose, and the answer ignores classification, controllable encryption, and bias.',
          ],
          link: 'D1 · Task 1.3 — Data protection, compliance, and bias detection',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers data integrity, security, and bias in context.',
        },
      ],
      keyTerms: [
        { term: 'Class imbalance (CI)', def: 'A dataset where one class greatly outnumbers another, causing models to ignore the minority class while still scoring high accuracy.' },
        { term: 'Difference in proportions of labels (DPL)', def: 'A pre-training bias metric measuring whether a positive outcome is unevenly distributed across a facet (group).' },
        { term: 'SageMaker Clarify', def: 'A service that detects pre- and post-training bias and explains model predictions via feature attribution.' },
        { term: 'Amazon Macie', def: 'A service that uses ML to discover and classify sensitive data such as PII in Amazon S3.' },
        { term: 'Data augmentation', def: 'Synthetically expanding a dataset (e.g. image transforms, minority-class synthesis) to improve robustness and balance.' },
      ],
      awsServices: [
        { name: 'SageMaker Clarify', purpose: 'Detects bias before and after training and explains model outputs with feature attribution.' },
        { name: 'AWS Glue Data Quality', purpose: 'Defines and enforces data-quality rules within Glue pipelines and the data catalog.' },
        { name: 'Amazon Macie', purpose: 'Discovers and classifies sensitive data like PII/PHI stored in Amazon S3.' },
        { name: 'AWS KMS', purpose: 'Manages encryption keys for at-rest data, including auditable customer-managed keys.' },
      ],
      examTips: [
        'High accuracy on an imbalanced dataset is misleading — rebalance with resampling/synthetic data and judge with precision/recall/F1.',
        'Pre-training bias metrics (CI, DPL) and explainability → SageMaker Clarify.',
        'Discover/classify PII or PHI in S3 → Amazon Macie; controllable encryption at rest → KMS customer-managed key.',
        'Always split before training and never let test data leak into training (data leakage).',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — ML MODEL DEVELOPMENT (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · ML Model Development',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Choosing a Modeling Approach',
      duration: 30,
      summary: 'Before training anything, the ML engineer chooses the approach: a pre-built AI service, a SageMaker built-in algorithm, a foundation model from JumpStart/Bedrock, or a fully custom model. This session builds the decision framework and maps common business problems to the right AWS option.',
      objectives: [
        'Decide between an AWS AI service, a built-in algorithm, a foundation model, and a custom model',
        'Map common business problems to the right managed AI service',
        'Select SageMaker built-in algorithms for common problem types',
        'Weigh interpretability and cost when choosing a model or algorithm',
      ],
      preLearningCheck: {
        question: 'A company wants to transcribe customer-support call recordings into text with the least development effort and no model training. Which AWS option fits best?',
        options: [
          'Train a custom speech model with SageMaker script mode',
          'Use Amazon Transcribe',
          'Fine-tune a foundation model in Amazon Bedrock',
          'Use a SageMaker built-in XGBoost algorithm',
        ],
        correct: 1,
        note: 'Guess first — retrieval practice helps even when the guess is wrong.',
      },
      sections: [
        {
          heading: 'The build-vs-buy spectrum',
          body: 'A central MLA-C01 skill is choosing the lowest-effort approach that still meets the requirement. There is a spectrum from fully managed to fully custom.',
          table: {
            headers: ['Approach', 'Effort', 'Use when'],
            rows: [
              ['AWS AI service (Rekognition, Transcribe, …)', 'Lowest — API call, no training', 'A common task (vision, speech, language) already solved by a managed service'],
              ['Foundation model (Bedrock / JumpStart)', 'Low — use or fine-tune a pre-trained model', 'Generative or general tasks; little labeled data; fast time-to-value'],
              ['SageMaker built-in algorithm', 'Medium — bring data, configure algorithm', 'Standard supervised/unsupervised problems on your own data'],
              ['Custom model (script mode / BYOC)', 'Highest — write and train your own', 'Unique requirements no managed option satisfies'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "least development effort," "no ML expertise," or "no training data" → an AWS AI service or a foundation model, not a custom-trained model.' },
        },
        {
          heading: 'Managed AI services by problem',
          body: 'Memorize which managed service solves which business problem — these are frequent one-line answers.',
          table: {
            headers: ['Need', 'Service'],
            rows: [
              ['Image/video analysis (objects, faces, moderation)', 'Amazon Rekognition'],
              ['Speech-to-text transcription', 'Amazon Transcribe'],
              ['Text-to-speech', 'Amazon Polly'],
              ['Language translation', 'Amazon Translate'],
              ['NLP: sentiment, entities, key phrases', 'Amazon Comprehend (Medical for clinical text)'],
              ['Extract text/data from documents', 'Amazon Textract'],
              ['Product/content recommendations', 'Amazon Personalize'],
              ['Forecasting and anomaly detection on metrics', 'Lookout for Metrics / built-in forecasting'],
              ['Generative AI (text, chat, embeddings)', 'Amazon Bedrock'],
            ],
          },
        },
        {
          heading: 'SageMaker built-in algorithms',
          body: 'When you train on your own data but want AWS-optimized algorithms, SageMaker provides built-ins. Know a few canonical mappings.',
          bullets: [
            'XGBoost — gradient-boosted trees for tabular classification/regression; the workhorse answer for structured data.',
            'Linear Learner — linear/logistic models for classification and regression at scale.',
            'K-Means — unsupervised clustering.',
            'Image Classification / Object Detection — computer vision on your own labeled images.',
            'BlazingText — word embeddings and text classification.',
            'DeepAR — time-series forecasting across many related series.',
          ],
        },
        {
          heading: 'Interpretability and cost',
          body: 'Model choice is not only about accuracy.',
          bullets: [
            'Interpretability — regulated or high-stakes decisions (credit, healthcare) may require an explainable model (linear, tree) or post-hoc explanations (Clarify/SHAP) over an opaque deep network.',
            'Cost — a managed AI service or smaller model may meet the requirement far more cheaply than training a large custom model; factor training + inference cost into the choice.',
            'Feasibility — assess whether enough quality data exists at all; if not, a pre-trained/foundation model may be the only practical route.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A startup with no ML engineers and no labeled data wants to add a chatbot that answers questions over their product docs quickly. Which approach best fits?',
          options: [
            'Train a custom transformer from scratch with SageMaker script mode',
            'Use a foundation model via Amazon Bedrock (optionally with retrieval over their docs)',
            'Use a SageMaker built-in K-Means algorithm',
            'Use Amazon Polly',
          ],
          correct: 1,
          explainCorrect: 'Correct — a Bedrock foundation model delivers generative Q&A with minimal effort and no training, ideal when there is no ML team or labeled data.',
          elaborativePrompt: 'What would change if the company had a large, specialized labeled corpus and strict latency/cost targets?',
        },
        {
          afterSection: 3,
          question: 'An ML engineer must predict customer churn (yes/no) from a large tabular dataset of structured features. Which SageMaker built-in algorithm is the most common first choice?',
          options: [
            'XGBoost',
            'BlazingText',
            'DeepAR',
            'Image Classification',
          ],
          correct: 0,
          explainCorrect: 'Correct — XGBoost (gradient-boosted trees) is the go-to built-in for tabular classification/regression and usually a strong baseline.',
          elaborativePrompt: 'Why might XGBoost be preferred over a neural network for a modest tabular dataset?',
        },
      ],
      selfExplanationPrompt: 'Give a rule of thumb for deciding between an AWS AI service, a foundation model, and a custom-trained model. What is the first question you ask?',
      sample: {
        type: 'multiple-choice',
        stem: 'A media company needs to automatically detect inappropriate content in user-uploaded images and flag it for moderation. They have no labeled training data and want to ship quickly with minimal ML development. What should the ML engineer recommend?',
        options: [
          'Train a custom convolutional neural network using SageMaker script mode',
          'Use Amazon Rekognition content moderation APIs',
          'Use Amazon Comprehend to analyze the images',
          'Use the SageMaker XGBoost built-in algorithm',
        ],
        correct: 1,
        explanation: {
          summary: 'Rekognition provides ready-made image and content-moderation APIs — no training data, no model development, fastest path to a working solution for a common vision task.',
          perOption: [
            'Training a custom CNN needs labeled data and ML expertise and is far slower — overkill for a problem a managed service already solves.',
            'Correct — Rekognition’s content moderation is purpose-built for detecting inappropriate imagery with a simple API call.',
            'Comprehend is for natural-language text, not images; it cannot analyze image content.',
            'XGBoost is a tabular algorithm and is not designed to classify raw images.',
          ],
          link: 'D2 · Task 2.1 — Selecting AI services to solve common business needs',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — frames model-approach selection within the exam.',
        },
      ],
      keyTerms: [
        { term: 'Foundation model', def: 'A large pre-trained model (offered via Amazon Bedrock or SageMaker JumpStart) usable directly or fine-tuned for a task.' },
        { term: 'SageMaker JumpStart', def: 'A hub of pre-built models and solution templates you can deploy or fine-tune quickly.' },
        { term: 'XGBoost', def: 'A gradient-boosted decision-tree algorithm; the common SageMaker built-in for tabular classification and regression.' },
        { term: 'Interpretability', def: 'The degree to which a model’s decisions can be explained — often required for regulated, high-stakes use cases.' },
        { term: 'Amazon Bedrock', def: 'A managed service for accessing and customizing foundation models for generative AI through an API.' },
      ],
      awsServices: [
        { name: 'Amazon Rekognition', purpose: 'Pre-built image and video analysis, including content moderation and face/object detection.' },
        { name: 'Amazon Bedrock', purpose: 'Access and fine-tune foundation models for generative AI via a managed API.' },
        { name: 'Amazon SageMaker', purpose: 'Build, train, and deploy custom and built-in-algorithm models across the ML lifecycle.' },
        { name: 'Amazon Comprehend / Transcribe / Translate / Polly', purpose: 'Managed NLP, speech-to-text, translation, and text-to-speech services.' },
      ],
      examTips: [
        '"Least effort / no training data / common task" → managed AI service (Rekognition, Transcribe, Comprehend) or a Bedrock foundation model.',
        'Tabular classification/regression → SageMaker XGBoost is the default built-in.',
        'Regulated, high-stakes decision → favor interpretable models or add Clarify/SHAP explanations.',
        'Always weigh training + inference cost, not just accuracy, when selecting an approach.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · ML Model Development',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Training Models on SageMaker',
      duration: 30,
      summary: 'How models actually get trained on SageMaker: the training-job model, built-in algorithms vs. script mode (TensorFlow/PyTorch), fine-tuning foundation models, distributed training and faster-training techniques, and bringing in models built outside SageMaker.',
      objectives: [
        'Explain training elements: epoch, step, batch size, and how SageMaker training jobs run',
        'Choose between built-in algorithms, script mode, and bring-your-own-container',
        'Fine-tune pre-trained/foundation models (JumpStart, Bedrock) on custom data',
        'Reduce training time with distributed training and early stopping',
      ],
      preLearningCheck: {
        question: 'A team wants to train a PyTorch model on SageMaker using their own training script, while still letting SageMaker manage the infrastructure. Which approach fits?',
        options: [
          'A SageMaker built-in algorithm only',
          'SageMaker script mode with the PyTorch framework container',
          'Amazon Rekognition',
          'AWS Glue',
        ],
        correct: 1,
        note: 'Guess before reading — the attempt strengthens recall.',
      },
      sections: [
        {
          heading: 'The SageMaker training job',
          body: 'A SageMaker training job spins up the compute you specify, pulls your data from S3 (File or Pipe mode), runs the algorithm/script, and writes the model artifact back to S3 — then tears the compute down so you pay only for what you used. You provide the algorithm, hyperparameters, input data location, and instance configuration.',
          bullets: [
            'Epoch — one full pass over the training dataset.',
            'Step / iteration — one update of the model weights, processing one batch.',
            'Batch size — how many samples are processed before each weight update; affects memory use, speed, and stability.',
          ],
        },
        {
          heading: 'Built-in vs. script mode vs. BYOC',
          body: 'SageMaker offers three levels of control for training.',
          table: {
            headers: ['Mode', 'You provide', 'Use when'],
            rows: [
              ['Built-in algorithm', 'Data + hyperparameters', 'A standard problem an AWS-optimized algorithm already covers (XGBoost, etc.)'],
              ['Script mode', 'Your training script for a supported framework (TensorFlow, PyTorch, scikit-learn)', 'You need custom model code but want managed framework containers'],
              ['Bring your own container (BYOC)', 'A custom Docker image', 'You need a framework/dependency SageMaker does not provide out of the box'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "our own TensorFlow/PyTorch code, managed infrastructure" → script mode. "Unsupported framework or custom runtime" → BYOC.' },
        },
        {
          heading: 'Fine-tuning pre-trained models',
          body: 'You rarely train large models from scratch. Fine-tuning adapts a pre-trained model to your data at a fraction of the cost.',
          bullets: [
            'SageMaker JumpStart — fine-tune pre-built models on your dataset with minimal code.',
            'Amazon Bedrock — customize foundation models (fine-tuning, and retrieval/continued pre-training) for generative tasks.',
            'Watch for catastrophic forgetting — fine-tuning too aggressively can erase the base model’s general knowledge (covered more in Session 7).',
          ],
        },
        {
          heading: 'Training faster and integrating external models',
          body: 'Large jobs need techniques to finish sooner and ways to bring in work done elsewhere.',
          bullets: [
            'Distributed training — split work across many instances/GPUs: data parallelism (same model, shard the data) or model parallelism (split a model too big for one device).',
            'Early stopping — halt training when the validation metric stops improving, saving time and reducing overfitting.',
            'Managed Spot training — use Spot Instances for training jobs to cut cost, with checkpointing to resume after interruption.',
            'Integrating external models — import a model trained outside SageMaker (e.g. as artifacts or a BYOC image) to deploy or continue working with it in SageMaker.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'During training, increasing the batch size from 32 to 512 on the same instance causes out-of-memory errors. Why?',
          options: [
            'A larger batch processes more samples per step and needs more memory to hold activations and gradients',
            'Larger batches always reduce memory usage',
            'Batch size has no effect on memory',
            'The dataset format changed',
          ],
          correct: 0,
          explainCorrect: 'Correct — a bigger batch holds more samples (and their activations/gradients) in memory at once, increasing the per-step memory footprint.',
          elaborativePrompt: 'Besides memory, how does batch size influence training speed and stability of the gradient updates?',
        },
        {
          afterSection: 3,
          question: 'A team wants a domain-specific text generator but has limited data and no budget to train a large model from scratch. What is the most practical approach?',
          options: [
            'Train a transformer from scratch on the limited data',
            'Fine-tune a foundation model (Bedrock or JumpStart) on the domain data',
            'Use K-Means clustering',
            'Use Amazon Polly',
          ],
          correct: 1,
          explainCorrect: 'Correct — fine-tuning a foundation model adapts powerful pre-trained knowledge to the domain with far less data and cost than training from scratch.',
          elaborativePrompt: 'What risk does aggressive fine-tuning introduce, and what is that phenomenon called?',
        },
      ],
      selfExplanationPrompt: 'Explain the difference between data parallelism and model parallelism in distributed training, and give one situation that requires model parallelism.',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML engineer must train a custom PyTorch model on a large dataset. They want to keep their own training code, let SageMaker manage the training infrastructure, and reduce both wall-clock time and cost. Which combination is MOST appropriate?',
        options: [
          'Use a SageMaker built-in algorithm and a single large On-Demand instance',
          'Use SageMaker script mode with the PyTorch container, distributed training across multiple instances, and managed Spot training with checkpointing',
          'Rewrite the model to use Amazon Comprehend',
          'Train on a local laptop and upload the artifact',
        ],
        correct: 1,
        explanation: {
          summary: 'Script mode runs their own PyTorch code on managed infrastructure; distributed training shortens wall-clock time on a large dataset; managed Spot training with checkpointing cuts cost while tolerating interruptions — all three requirements are met.',
          perOption: [
            'A built-in algorithm cannot run their custom PyTorch code, and a single instance neither parallelizes nor minimizes cost.',
            'Correct — script mode + distributed training + managed Spot with checkpointing addresses custom code, speed, and cost together.',
            'Comprehend is a managed NLP service, not a way to train an arbitrary custom PyTorch model.',
            'Local training abandons managed, scalable infrastructure and does not parallelize or leverage Spot savings.',
          ],
          link: 'D2 · Task 2.2 — Script mode, distributed training, and cost-efficient training',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — places SageMaker training in the exam context.',
        },
      ],
      keyTerms: [
        { term: 'Epoch', def: 'One complete pass of the training algorithm over the entire training dataset.' },
        { term: 'Batch size', def: 'The number of samples processed before the model updates its weights once; affects memory, speed, and stability.' },
        { term: 'Script mode', def: 'A SageMaker training approach where you supply your own script for a supported framework (TensorFlow, PyTorch) in a managed container.' },
        { term: 'Distributed training', def: 'Splitting training across multiple devices/instances via data parallelism or model parallelism to finish faster or fit larger models.' },
        { term: 'Managed Spot training', def: 'Using Spot Instances for SageMaker training jobs to lower cost, with checkpointing to resume after interruptions.' },
      ],
      awsServices: [
        { name: 'Amazon SageMaker Training', purpose: 'Runs managed training jobs with built-in algorithms, script mode, or custom containers.' },
        { name: 'SageMaker JumpStart', purpose: 'Fine-tunes pre-built and foundation models on custom data with minimal code.' },
        { name: 'Amazon Bedrock', purpose: 'Customizes foundation models for generative tasks via a managed API.' },
        { name: 'Amazon EC2 Spot Instances', purpose: 'Provide discounted compute usable for fault-tolerant, checkpointed training jobs.' },
      ],
      examTips: [
        'Own TensorFlow/PyTorch code + managed infra → script mode; unsupported runtime → bring your own container.',
        'Limited data + no from-scratch budget → fine-tune a foundation model (JumpStart/Bedrock).',
        'Cut training cost → managed Spot training with checkpointing; cut wall-clock time → distributed training.',
        'Early stopping reduces both training time and overfitting.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · ML Model Development',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Refining Models — Tuning, Regularization, and Versioning',
      duration: 30,
      summary: 'Turning a trained model into a good one. We cover hyperparameter tuning (random search, Bayesian, SageMaker AMT), fighting overfitting and underfitting with regularization, combining models with ensembling, reducing model size, and tracking versions in the SageMaker Model Registry.',
      objectives: [
        'Distinguish overfitting from underfitting and choose the right remedy for each',
        'Apply regularization (dropout, weight decay, L1/L2) and early stopping',
        'Run hyperparameter tuning with SageMaker automatic model tuning (random/Bayesian)',
        'Combine models (ensembling/boosting), reduce model size, and version with Model Registry',
      ],
      preLearningCheck: {
        question: 'A model scores 99% on training data but only 70% on validation data. What is happening, and which remedy directly targets it?',
        options: [
          'Underfitting — add more features',
          'Overfitting — apply regularization (e.g. dropout, L2) or get more data',
          'The data is imbalanced — convert to Parquet',
          'The learning rate is too low — train fewer epochs',
        ],
        correct: 1,
        note: 'Guess first — the retrieval attempt aids retention.',
      },
      sections: [
        {
          heading: 'Overfitting vs. underfitting',
          body: 'The central diagnostic in model refinement. Read the gap between training and validation performance.',
          table: {
            headers: ['Symptom', 'Diagnosis', 'Remedies'],
            rows: [
              ['High training accuracy, low validation accuracy', 'Overfitting (memorized noise)', 'Regularization, more/augmented data, simpler model, early stopping, feature selection'],
              ['Low training AND low validation accuracy', 'Underfitting (too simple)', 'More complex model, more features, train longer, reduce regularization'],
              ['Both high and close', 'Good generalization', 'Ship it (after honest test evaluation)'],
            ],
          },
          callout: { type: 'warning', text: 'A large train-vs-validation gap = overfitting. Closing it by adding capacity makes it WORSE — you reduce capacity or add regularization/data instead.' },
        },
        {
          heading: 'Regularization techniques',
          body: 'Regularization constrains the model so it generalizes instead of memorizing.',
          bullets: [
            'L2 (weight decay) — penalizes large weights, shrinking them toward zero for a smoother model.',
            'L1 — penalizes absolute weight size and can drive some weights to exactly zero, performing feature selection.',
            'Dropout — randomly disables neurons during training so the network cannot rely on any single path (neural nets).',
            'Early stopping — stop when validation performance stops improving, before the model overfits.',
            'Catastrophic forgetting — when fine-tuning, the model can lose previously learned knowledge; mitigate with lower learning rates and balanced data.',
          ],
        },
        {
          heading: 'Hyperparameter tuning',
          body: 'Hyperparameters (learning rate, tree depth, number of layers) are set before training, not learned. SageMaker automatic model tuning (AMT) searches for good values.',
          table: {
            headers: ['Strategy', 'How it searches', 'Trade-off'],
            rows: [
              ['Grid search', 'Every combination on a grid', 'Exhaustive but explodes combinatorially'],
              ['Random search', 'Random samples of the space', 'Cheap, surprisingly effective baseline'],
              ['Bayesian optimization', 'Uses past results to pick promising next trials', 'Fewer trials to a good result; AMT default'],
            ],
          },
          callout: { type: 'tip', text: 'SageMaker AMT runs many training jobs to optimize an objective metric. Bayesian optimization typically reaches a good configuration in fewer trials than random or grid search.' },
        },
        {
          heading: 'Ensembling, size reduction, and versioning',
          body: 'Final refinements improve accuracy, shrink the model, and make it auditable.',
          bullets: [
            'Ensembling — combine multiple models: bagging (parallel, reduce variance), boosting (sequential, reduce bias — e.g. XGBoost), stacking (a meta-model over base models).',
            'Model size reduction — pruning, quantization-style data-type changes, compression, and feature selection shrink a model for cheaper/faster inference (note: deep quantization analysis itself is out of scope).',
            'SageMaker Model Registry — catalog model versions with metadata and approval status for repeatability, audits, and controlled deployment.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A model has low accuracy on BOTH training and validation sets. What is the most appropriate next step?',
          options: [
            'Add more dropout and L2 regularization',
            'Increase model capacity / add features / train longer (it is underfitting)',
            'Collect a separate test set',
            'Reduce the number of features',
          ],
          correct: 1,
          explainCorrect: 'Correct — poor performance on both sets indicates underfitting; the model is too simple, so add capacity, add features, or train longer.',
          elaborativePrompt: 'Why would adding regularization make an underfitting model perform even worse?',
        },
        {
          afterSection: 3,
          question: 'An ML engineer wants SageMaker to find good hyperparameters in as few training runs as possible by learning from previous trials. Which AMT strategy should they choose?',
          options: [
            'Grid search',
            'Bayesian optimization',
            'Manual guessing',
            'No tuning',
          ],
          correct: 1,
          explainCorrect: 'Correct — Bayesian optimization uses results from prior trials to choose promising next configurations, usually reaching a good result in fewer jobs.',
          elaborativePrompt: 'When might random search still be preferable to Bayesian optimization despite needing more trials?',
        },
      ],
      selfExplanationPrompt: 'Explain how you would tell overfitting from underfitting using only the training and validation curves, and name one remedy for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A deep neural network achieves 98% accuracy on the training set but only 76% on the validation set. The team wants to improve generalization without collecting a large amount of new data. Which combination of techniques is MOST appropriate?',
        options: [
          'Add more layers and train for many more epochs',
          'Apply dropout and L2 regularization, use early stopping, and augment the existing data',
          'Increase the learning rate sharply',
          'Remove the validation set and train on all data',
        ],
        correct: 1,
        explanation: {
          summary: 'The large train-vs-validation gap is classic overfitting. Dropout and L2 constrain the model, early stopping halts before it memorizes, and augmentation effectively expands the data — all directly improve generalization without much new data.',
          perOption: [
            'Adding layers and epochs increases capacity and training exposure, making overfitting worse, not better.',
            'Correct — regularization + early stopping + augmentation is the canonical overfitting remedy when new data is scarce.',
            'A sharply higher learning rate destabilizes training and does not address overfitting.',
            'Removing the validation set hides the problem and risks shipping an overfit model with no way to detect it.',
          ],
          link: 'D2 · Task 2.2 — Preventing overfitting with regularization',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers tuning and model refinement topics.',
        },
      ],
      keyTerms: [
        { term: 'Overfitting', def: 'A model that memorizes training data (high train, low validation accuracy) and fails to generalize.' },
        { term: 'Regularization', def: 'Techniques (L1, L2/weight decay, dropout) that constrain a model to improve generalization.' },
        { term: 'Hyperparameter tuning (AMT)', def: 'SageMaker automatic model tuning runs many jobs to optimize an objective metric, often via Bayesian optimization.' },
        { term: 'Ensembling', def: 'Combining multiple models (bagging, boosting, stacking) to improve performance over any single model.' },
        { term: 'Model Registry', def: 'A SageMaker catalog of versioned models with metadata and approval status for repeatability and governance.' },
      ],
      awsServices: [
        { name: 'SageMaker Automatic Model Tuning', purpose: 'Searches hyperparameter space (random/Bayesian) by running many training jobs to optimize a metric.' },
        { name: 'SageMaker Model Registry', purpose: 'Versions and governs trained models with metadata and approval workflows for deployment.' },
        { name: 'Amazon SageMaker', purpose: 'Hosts the training, tuning, and experiment-tracking workflow for model refinement.' },
      ],
      examTips: [
        'High train / low validation accuracy = overfitting → regularization, early stopping, more/augmented data, simpler model.',
        'Low train AND validation accuracy = underfitting → more capacity, more features, train longer.',
        'Need good hyperparameters in fewest trials → SageMaker AMT with Bayesian optimization.',
        'Track and govern model versions for audits and controlled deployment → SageMaker Model Registry.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · ML Model Development',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.3',
      title: 'Analyzing Model Performance',
      duration: 30,
      summary: 'How to judge whether a model is actually good. We read the confusion matrix and the metrics derived from it — accuracy, precision, recall, F1 — plus ROC/AUC for classifiers and RMSE for regression, and cover baselines, shadow testing, and using SageMaker Clarify and Debugger.',
      objectives: [
        'Read a confusion matrix and compute accuracy, precision, recall, and F1',
        'Choose the right metric for the business cost (precision vs. recall, ROC/AUC, RMSE)',
        'Establish baselines and run reproducible experiments',
        'Use shadow/production variant comparison, SageMaker Clarify, and Debugger',
      ],
      preLearningCheck: {
        question: 'In a fraud-detection model, missing an actual fraud (a false negative) is far more costly than a false alarm. Which metric should you prioritize?',
        options: [
          'Precision',
          'Recall',
          'Overall accuracy',
          'Training loss',
        ],
        correct: 1,
        note: 'Guess first — attempting recall before learning aids retention.',
      },
      sections: [
        {
          heading: 'The confusion matrix',
          body: 'Almost every classification metric comes from four counts: true positives (TP), false positives (FP), true negatives (TN), false negatives (FN). The exam expects you to compute the derived metrics by hand.',
          table: {
            headers: ['Metric', 'Formula', 'Answers the question'],
            rows: [
              ['Accuracy', '(TP + TN) / total', 'Overall, how often is the model right? (misleading when imbalanced)'],
              ['Precision', 'TP / (TP + FP)', 'Of those predicted positive, how many really are? (cost of false alarms)'],
              ['Recall (sensitivity)', 'TP / (TP + FN)', 'Of the actual positives, how many did we catch? (cost of misses)'],
              ['F1 score', '2 · (P · R) / (P + R)', 'Harmonic mean of precision and recall — balance when both matter'],
            ],
          },
          callout: { type: 'tip', text: 'Precision vs. recall is the most-tested trade-off. Costly false negatives (fraud, disease) → optimize recall. Costly false positives (spam blocking a real email) → optimize precision. Need balance → F1.' },
        },
        {
          heading: 'ROC, AUC, and regression metrics',
          body: 'Beyond the single-threshold confusion matrix, other metrics summarize performance across thresholds or for continuous targets.',
          bullets: [
            'ROC curve — plots true-positive rate vs. false-positive rate across all classification thresholds.',
            'AUC (Area Under the ROC Curve) — a single number (0.5 = random, 1.0 = perfect) summarizing separability regardless of threshold; robust for imbalanced data.',
            'RMSE (Root Mean Square Error) — for regression; the typical magnitude of prediction error, penalizing large errors more.',
            'A confusion matrix / heat map visualizes where a multi-class model confuses one class for another.',
          ],
        },
        {
          heading: 'Baselines and reproducibility',
          body: 'A metric means little without a reference point and the ability to reproduce it.',
          bullets: [
            'Baseline — a simple reference (majority-class predictor, previous model) to beat; "90% accuracy" is unimpressive if the majority class is 90%.',
            'Reproducible experiments — fix random seeds, track datasets/hyperparameters/metrics (SageMaker Experiments) so a result can be regenerated and compared.',
            'Assess trade-offs — a slightly more accurate model may cost far more to train or serve; weigh performance against training time and cost.',
          ],
        },
        {
          heading: 'Shadow testing, Clarify, and Debugger',
          body: 'SageMaker provides tools to validate and diagnose models around deployment.',
          bullets: [
            'Shadow variant — send a copy of live production traffic to a new model variant without affecting users, comparing its performance to the production variant before promoting it.',
            'SageMaker Clarify — interpret model outputs (feature attribution) and detect bias in predictions.',
            'SageMaker Debugger — capture tensors during training to diagnose convergence problems (vanishing/exploding gradients, stalled loss).',
            'A/B testing (production variants) — split live traffic across model versions to compare real-world performance (revisited in Domain 4).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A model produces TP = 80, FP = 20, FN = 40, TN = 860. What is its recall?',
          options: [
            '80 / (80 + 20) = 0.80',
            '80 / (80 + 40) ≈ 0.67',
            '(80 + 860) / 1000 = 0.94',
            '80 / 1000 = 0.08',
          ],
          correct: 1,
          explainCorrect: 'Correct — recall = TP / (TP + FN) = 80 / 120 ≈ 0.67. It measures the share of actual positives the model caught.',
          elaborativePrompt: 'Compute precision for the same matrix. Why are precision and recall different here, and what does each tell the business?',
        },
        {
          afterSection: 3,
          question: 'A model achieves 92% accuracy, but the most common class makes up 92% of the data. What should you conclude?',
          options: [
            'The model is excellent — ship it',
            'The accuracy may be no better than always predicting the majority class; compare against that baseline and use precision/recall/F1',
            'Accuracy is the only metric that matters',
            'The data must be encrypted',
          ],
          correct: 1,
          explainCorrect: 'Correct — matching the majority-class baseline means the model may have learned nothing useful; imbalance-robust metrics reveal the truth.',
          elaborativePrompt: 'Which single metric would most quickly expose that this model is useless on the minority class?',
        },
      ],
      selfExplanationPrompt: 'Explain in plain language why a spam filter and a cancer-screening model should optimize for different metrics. Which one favors precision, which favors recall, and why?',
      sample: {
        type: 'multiple-choice',
        stem: 'A bank is building a model to flag fraudulent transactions. Fraud is rare (under 1% of transactions), and the cost of missing a fraud is far higher than the cost of reviewing a false alarm. Which evaluation approach is MOST appropriate?',
        options: [
          'Optimize for overall accuracy, since it summarizes everything',
          'Prioritize recall (and monitor F1/AUC), because catching actual fraud matters most and accuracy is misleading on imbalanced data',
          'Use RMSE because it penalizes large errors',
          'Optimize precision only, accepting many missed frauds',
        ],
        correct: 1,
        explanation: {
          summary: 'With rare fraud and costly false negatives, recall (catching actual fraud) is the priority, while AUC and F1 give an imbalance-robust view. Overall accuracy is misleading because predicting "not fraud" every time already scores ~99%.',
          perOption: [
            'Accuracy is dominated by the 99% legitimate class and would look great even for a model that never catches fraud.',
            'Correct — recall targets the costly false negatives, and F1/AUC handle the class imbalance honestly.',
            'RMSE is a regression metric and does not apply to this binary classification problem.',
            'Optimizing precision alone tolerates many missed frauds (low recall) — exactly the costly outcome here.',
          ],
          link: 'D2 · Task 2.3 — Selecting and interpreting evaluation metrics',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers evaluation metrics and model analysis.',
        },
      ],
      keyTerms: [
        { term: 'Precision', def: 'TP / (TP + FP) — of the items predicted positive, the fraction that truly are positive.' },
        { term: 'Recall', def: 'TP / (TP + FN) — of the actual positives, the fraction the model correctly identified.' },
        { term: 'F1 score', def: 'The harmonic mean of precision and recall, useful when both errors matter and classes are imbalanced.' },
        { term: 'AUC', def: 'Area Under the ROC Curve — a threshold-independent measure of class separability (0.5 random, 1.0 perfect).' },
        { term: 'Shadow variant', def: 'A model variant that receives a copy of live traffic for comparison without affecting users.' },
      ],
      awsServices: [
        { name: 'SageMaker Clarify', purpose: 'Explains model predictions via feature attribution and detects bias in outputs.' },
        { name: 'SageMaker Debugger', purpose: 'Captures training tensors to diagnose convergence issues like vanishing/exploding gradients.' },
        { name: 'SageMaker Experiments', purpose: 'Tracks datasets, hyperparameters, and metrics for reproducible experiments.' },
        { name: 'Amazon SageMaker', purpose: 'Supports shadow and production variants for comparing model performance.' },
      ],
      examTips: [
        'Costly false negatives (fraud, disease) → optimize recall; costly false positives → optimize precision; balance → F1.',
        'Accuracy is misleading on imbalanced data — compare against the majority-class baseline and use AUC/F1.',
        'Compare a new model on live traffic without user impact → shadow variant; split traffic → A/B (production variants).',
        'Diagnose training convergence problems → SageMaker Debugger; interpret/bias-check outputs → SageMaker Clarify.',
      ],
    },

  ],
}

export default mlaC01Course
