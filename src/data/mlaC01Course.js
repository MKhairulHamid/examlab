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
          interactive: 'precision-recall',
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

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — DEPLOYMENT AND ORCHESTRATION OF ML WORKFLOWS (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Deployment & Orchestration',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.1',
      title: 'Deployment Infrastructure and Endpoint Types',
      duration: 30,
      summary: 'A trained model is useless until it serves predictions. This session covers the single densest decision in Domain 3 — choosing the right SageMaker inference option (real-time, serverless, asynchronous, batch) — plus compute selection, containers, multi-model endpoints, and edge deployment.',
      objectives: [
        'Choose the right SageMaker inference option for a traffic and payload pattern',
        'Select CPU vs. GPU compute and the right deployment target (SageMaker, EKS/ECS, Lambda)',
        'Use multi-model and multi-container endpoints to consolidate models',
        'Recognize when to optimize a model for edge devices with SageMaker Neo',
      ],
      preLearningCheck: {
        question: 'An inference request carries a 400 MB payload and can take several minutes to process, and the client does not need an instant response. Which SageMaker option fits best?',
        options: [
          'A real-time endpoint',
          'An asynchronous endpoint',
          'A serverless endpoint',
          'Batch transform',
        ],
        correct: 1,
        note: 'Guess first — the attempt primes you to retain the endpoint distinctions.',
      },
      sections: [
        {
          heading: 'Four ways to serve a model',
          body: 'SageMaker offers four inference options. The exam tests which one fits a described traffic pattern, payload size, and latency need. Learn the decision boundaries cold.',
          table: {
            headers: ['Option', 'Best for', 'Key trait'],
            rows: [
              ['Real-time endpoint', 'Steady traffic needing low-latency responses 24/7', 'Persistent instances; you pay while it runs'],
              ['Serverless endpoint', 'Intermittent/spiky traffic with idle gaps', 'Auto-scales (including to zero); cold starts possible; pay per use'],
              ['Asynchronous endpoint', 'Large payloads and long-running inference', 'Requests are queued; results returned when ready'],
              ['Batch transform', 'Scoring a whole dataset offline', 'No persistent endpoint; spin up, score, tear down'],
            ],
          },
          callout: { type: 'tip', text: 'Decision cues: instant + steady → real-time; spiky/idle + pay-per-use → serverless; big payload / minutes-long → asynchronous; whole dataset offline → batch transform.' },
          interactive: 'endpoint-selector',
        },
        {
          heading: 'Choosing compute: CPU vs. GPU',
          body: 'Compute choice drives both performance and cost for training and inference.',
          bullets: [
            'GPU — needed for deep-learning training and high-throughput deep-learning inference; expensive, so justify it.',
            'CPU — fine for classical ML (XGBoost, linear models) and many lighter inference workloads; cheaper.',
            'Inference-optimized instances (e.g. AWS Inferentia) deliver high inference throughput per dollar for supported models.',
            'Match instance family to the bottleneck: memory-optimized for large models, compute-optimized for CPU-bound inference.',
          ],
        },
        {
          heading: 'Deployment targets and containers',
          body: 'SageMaker endpoints are the default, but models can be served on other targets, and containers package the runtime.',
          table: {
            headers: ['Target', 'Use when'],
            rows: [
              ['SageMaker endpoint', 'Default managed model hosting with built-in scaling and monitoring'],
              ['Amazon EKS / ECS', 'You already standardize on Kubernetes/containers and want models in that platform'],
              ['AWS Lambda', 'Lightweight, intermittent inference for small models; fully serverless'],
              ['Provided vs. custom container', 'Use AWS-provided framework containers, or bring your own (BYOC) for custom dependencies'],
            ],
          },
        },
        {
          heading: 'Multi-model endpoints and the edge',
          body: 'Two cost/performance optimizations the exam likes.',
          bullets: [
            'Multi-model endpoint (MME) — host many models behind one endpoint, loading each into memory on demand. Cost-effective when you have many models, each with low/intermittent traffic.',
            'Multi-container endpoint — host different containers/frameworks behind one endpoint, optionally as an inference pipeline.',
            'SageMaker Neo — compile/optimize a model to run efficiently on edge devices (and cloud), reducing footprint and latency on constrained hardware.',
          ],
          callout: { type: 'note', text: '"Hundreds of models, each rarely called, minimize cost" → multi-model endpoint. "Run the model on a constrained edge device" → SageMaker Neo.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company hosts hundreds of customer-specific models, each receiving only occasional traffic, and wants to minimize hosting cost. Which option fits best?',
          options: [
            'A separate real-time endpoint per model',
            'A multi-model endpoint that loads each model on demand',
            'Batch transform run continuously',
            'A serverless endpoint per model with provisioned concurrency',
          ],
          correct: 1,
          explainCorrect: 'Correct — a multi-model endpoint shares infrastructure across many low-traffic models, loading each on demand, which is far cheaper than one endpoint per model.',
          elaborativePrompt: 'What is the trade-off of loading models on demand — what happens on the first request for a model not currently in memory?',
        },
        {
          afterSection: 3,
          question: 'A model must run inference directly on a fleet of low-power IoT cameras with limited memory. Which AWS capability helps?',
          options: [
            'SageMaker Neo to compile and optimize the model for the edge devices',
            'A larger GPU real-time endpoint in the cloud',
            'Batch transform',
            'SageMaker Feature Store',
          ],
          correct: 0,
          explainCorrect: 'Correct — SageMaker Neo optimizes a model to run efficiently on constrained edge hardware with a smaller footprint and lower latency.',
          elaborativePrompt: 'Why might running inference on the edge be preferable to sending every frame to a cloud endpoint?',
        },
      ],
      selfExplanationPrompt: 'In your own words, give the one-line cue that distinguishes an asynchronous endpoint from batch transform. Both handle large/long jobs — what is the difference?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML team serves a model that receives unpredictable, bursty traffic with long idle periods overnight. They want to avoid paying for idle capacity and can tolerate an occasional cold-start delay. Which SageMaker inference option should they choose?',
        options: [
          'A real-time endpoint with several always-on instances',
          'A serverless inference endpoint',
          'Batch transform on a schedule',
          'An asynchronous endpoint with large instances',
        ],
        correct: 1,
        explanation: {
          summary: 'Serverless inference automatically scales capacity with demand (including to zero during idle periods), so the team pays only for what they use and tolerates the occasional cold start — exactly matching bursty, idle-heavy traffic.',
          perOption: [
            'Always-on real-time instances waste money during the long idle periods the team wants to avoid paying for.',
            'Correct — serverless inference scales to zero when idle and charges per use, fitting bursty traffic with cold-start tolerance.',
            'Batch transform scores datasets offline; it cannot serve unpredictable real-time request traffic.',
            'An asynchronous endpoint targets large payloads/long jobs, not the idle-cost problem; it still provisions instances.',
          ],
          link: 'D3 · Task 3.1 — Selecting the deployment endpoint type',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — frames deployment options within the exam.',
        },
      ],
      keyTerms: [
        { term: 'Real-time endpoint', def: 'A persistent SageMaker endpoint serving low-latency predictions for steady traffic; you pay while it runs.' },
        { term: 'Serverless inference', def: 'An endpoint that auto-scales with demand (including to zero), charging per use; suited to intermittent traffic, with possible cold starts.' },
        { term: 'Asynchronous endpoint', def: 'An endpoint that queues requests for large payloads or long-running inference and returns results when ready.' },
        { term: 'Batch transform', def: 'An offline job that scores an entire dataset without a persistent endpoint.' },
        { term: 'Multi-model endpoint', def: 'One endpoint hosting many models loaded on demand, to cost-effectively serve many low-traffic models.' },
        { term: 'SageMaker Neo', def: 'A service that compiles and optimizes models to run efficiently on edge devices and in the cloud.' },
      ],
      awsServices: [
        { name: 'Amazon SageMaker Endpoints', purpose: 'Managed real-time, serverless, and asynchronous model hosting with scaling and monitoring.' },
        { name: 'SageMaker Batch Transform', purpose: 'Offline scoring of whole datasets without a persistent endpoint.' },
        { name: 'SageMaker Neo', purpose: 'Compiles and optimizes models for efficient edge and cloud inference.' },
        { name: 'AWS Inferentia', purpose: 'Inference-optimized chips delivering high throughput per dollar for supported models.' },
      ],
      examTips: [
        'Instant + steady → real-time; spiky/idle + pay-per-use → serverless; large payload/long job → asynchronous; whole dataset offline → batch transform.',
        'Many low-traffic models, minimize cost → multi-model endpoint.',
        'Run on constrained edge hardware → SageMaker Neo.',
        'GPU for deep learning; CPU/Inferentia for classical or cost-sensitive inference.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Deployment & Orchestration',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.2',
      title: 'Infrastructure as Code and Endpoint Auto Scaling',
      duration: 30,
      summary: 'Production ML infrastructure must be reproducible, scalable, and cost-aware. This session covers infrastructure as code (CloudFormation, CDK), building and storing containers (ECR, ECS, EKS, BYOC), configuring SageMaker endpoint auto scaling, securing endpoints in a VPC, and using Spot to cut cost.',
      objectives: [
        'Choose between CloudFormation and CDK and explain why IaC matters for ML',
        'Build, store, and deploy containers with ECR/ECS/EKS and BYOC',
        'Configure SageMaker endpoint auto scaling and pick the right scaling metric',
        'Secure endpoints inside a VPC and reduce cost with Spot Instances',
      ],
      preLearningCheck: {
        question: 'An ML team wants their entire training and hosting stack to be version-controlled, repeatable, and deployable to multiple accounts with one definition. Which approach achieves this?',
        options: [
          'Click through the SageMaker console each time',
          'Define the stack as infrastructure as code (CloudFormation or AWS CDK)',
          'Email a runbook to the team',
          'Manually tag resources after creating them',
        ],
        correct: 1,
        note: 'Guess before reading — retrieval practice helps retention.',
      },
      sections: [
        {
          heading: 'Why infrastructure as code',
          body: 'Manually clicking through the console is not repeatable, auditable, or reviewable. Infrastructure as code (IaC) defines the whole stack — endpoints, roles, pipelines — as a template you version, review, and deploy consistently across environments.',
          table: {
            headers: ['Tool', 'Style', 'Use when'],
            rows: [
              ['AWS CloudFormation', 'Declarative templates (JSON/YAML)', 'You want native AWS IaC with a declarative definition of resources'],
              ['AWS CDK', 'Code (Python/TypeScript/…) that synthesizes CloudFormation', 'You prefer real programming constructs (loops, classes) to generate infrastructure'],
            ],
          },
          callout: { type: 'tip', text: 'Both CDK and CloudFormation end up as CloudFormation stacks. CDK is "IaC in a programming language"; CloudFormation is "IaC as declarative templates." Either gives repeatable, reviewable provisioning.' },
        },
        {
          heading: 'On-demand vs. provisioned, and Spot',
          body: 'Resourcing choices trade cost against availability.',
          bullets: [
            'On-demand — pay-as-you-go, no commitment; the default for unpredictable workloads.',
            'Provisioned/reserved capacity — commit for steady workloads to lower cost (covered with Savings Plans in Session 14).',
            'Spot Instances — deeply discounted spare capacity that can be reclaimed; ideal for fault-tolerant, checkpointed training jobs. Avoid for endpoints that need guaranteed availability.',
          ],
        },
        {
          heading: 'Containers for ML',
          body: 'Models ship as containers. Know the container services and the bring-your-own-container path.',
          table: {
            headers: ['Service', 'Role'],
            rows: [
              ['Amazon ECR', 'Private registry that stores your Docker images (training and inference containers)'],
              ['Amazon ECS', 'Run containers on a managed cluster (or Fargate, serverless)'],
              ['Amazon EKS', 'Run containers on managed Kubernetes'],
              ['BYOC with SageMaker', 'Bring your own container when you need a framework/dependency SageMaker does not provide'],
            ],
          },
        },
        {
          heading: 'Endpoint auto scaling and VPC',
          body: 'A production endpoint should scale with demand and be network-isolated.',
          bullets: [
            'Auto scaling — attach a scaling policy to a SageMaker endpoint so instance count rises and falls with load, controlling both latency and cost.',
            'Scaling metric — choose what to scale on: invocations per instance (the common default), model latency, or CPU/GPU utilization.',
            'Target tracking keeps a chosen metric at a target value; scheduled scaling handles known time-based patterns.',
            'VPC configuration — place the endpoint in a VPC with private subnets and security groups so traffic stays off the public internet; use VPC endpoints for private access to AWS services.',
          ],
          callout: { type: 'note', text: 'For endpoint auto scaling, "invocations per instance" (SageMakerVariantInvocationsPerInstance) is the standard target-tracking metric. Scale on model latency or utilization when those are the binding constraint.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A team prefers to define their ML infrastructure using Python with loops and reusable classes, while still deploying through AWS-native stacks. Which tool fits best?',
          options: [
            'AWS CDK',
            'Hand-written CloudFormation YAML only',
            'The SageMaker console',
            'A shell script with the AWS CLI run manually',
          ],
          correct: 0,
          explainCorrect: 'Correct — the AWS CDK lets you express infrastructure in a programming language and synthesizes CloudFormation under the hood.',
          elaborativePrompt: 'Since CDK compiles to CloudFormation anyway, what does using a programming language buy you over writing the YAML directly?',
        },
        {
          afterSection: 3,
          question: 'A real-time endpoint sees traffic that doubles during business hours. The team wants instance count to follow demand to control latency and cost. What should they configure?',
          options: [
            'A fixed, large number of instances at all times',
            'Auto scaling with a target-tracking policy on invocations per instance',
            'Batch transform instead of an endpoint',
            'Manual scaling by an engineer each morning',
          ],
          correct: 1,
          explainCorrect: 'Correct — a target-tracking auto scaling policy (commonly on invocations per instance) automatically adds/removes instances as load changes.',
          elaborativePrompt: 'When would scaling on model latency be a better metric than invocations per instance?',
        },
      ],
      selfExplanationPrompt: 'Explain why Spot Instances are great for training jobs but risky for a production inference endpoint. What property of each workload drives the difference?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML platform team must deploy identical SageMaker hosting stacks to dev, staging, and production accounts, with peer review of every infrastructure change and the ability to roll back. The model endpoint must also scale automatically with traffic. Which approach BEST meets these requirements?',
        options: [
          'Create resources manually in each account and document the steps',
          'Define the stack as infrastructure as code (CloudFormation/CDK) and attach an auto scaling policy to the endpoint',
          'Use a single oversized fixed-capacity endpoint shared across all accounts',
          'Write a one-off shell script run by hand per account',
        ],
        correct: 1,
        explanation: {
          summary: 'IaC gives repeatable, peer-reviewable, rollback-capable deployment of identical stacks across accounts, and an auto scaling policy makes the endpoint follow traffic — together meeting every requirement.',
          perOption: [
            'Manual creation is not repeatable, reviewable, or reliably identical across three accounts, and does not address scaling.',
            'Correct — IaC for reproducible, reviewable, rollback-capable stacks plus endpoint auto scaling for traffic-following capacity.',
            'A single shared oversized endpoint breaks account isolation and wastes cost rather than scaling with demand.',
            'A hand-run script is not reviewable or rollback-friendly and drifts between accounts.',
          ],
          link: 'D3 · Task 3.2 — Infrastructure as code and endpoint auto scaling',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers IaC and scaling for ML infrastructure.',
        },
      ],
      keyTerms: [
        { term: 'Infrastructure as code (IaC)', def: 'Defining infrastructure in version-controlled templates/code (CloudFormation, CDK) for repeatable, reviewable deployment.' },
        { term: 'AWS CDK', def: 'A framework to define infrastructure in a programming language that synthesizes CloudFormation.' },
        { term: 'Amazon ECR', def: 'A private container registry for storing Docker images used in training and inference.' },
        { term: 'Endpoint auto scaling', def: 'A policy that adjusts a SageMaker endpoint’s instance count based on a metric like invocations per instance.' },
        { term: 'Spot Instances', def: 'Discounted reclaimable capacity, ideal for fault-tolerant, checkpointed training but not for always-available endpoints.' },
      ],
      awsServices: [
        { name: 'AWS CloudFormation', purpose: 'Declarative infrastructure-as-code templates for repeatable AWS provisioning.' },
        { name: 'AWS CDK', purpose: 'Defines infrastructure in a programming language, synthesizing CloudFormation.' },
        { name: 'Amazon ECR', purpose: 'Stores container images for SageMaker training and inference, including BYOC.' },
        { name: 'AWS Auto Scaling', purpose: 'Scales SageMaker endpoint capacity with demand via target-tracking and scheduled policies.' },
      ],
      examTips: [
        'Repeatable, reviewable, multi-account provisioning → infrastructure as code (CloudFormation or CDK).',
        'CDK = IaC in a programming language; both compile to CloudFormation.',
        'Endpoint should follow traffic → auto scaling, commonly target-tracking on invocations per instance.',
        'Spot for fault-tolerant/checkpointed training; never for endpoints needing guaranteed availability.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Deployment & Orchestration',
      domain: 'd3',
      weight: '22%',
      task: 'Task 3.3',
      title: 'CI/CD and Orchestration for ML Workflows',
      duration: 30,
      summary: 'MLOps in action: automating the build → train → deploy → retrain loop. We cover the AWS CI/CD services (CodePipeline, CodeBuild, CodeDeploy), SageMaker Pipelines vs. Step Functions vs. Airflow, deployment strategies for models, automated testing, and event-driven retraining.',
      objectives: [
        'Map the roles of CodePipeline, CodeBuild, and CodeDeploy in an ML pipeline',
        'Choose the right orchestrator: SageMaker Pipelines, Step Functions, or MWAA (Airflow)',
        'Apply deployment strategies (blue/green, canary, linear) to model releases',
        'Trigger training/retraining with EventBridge and add automated tests to the pipeline',
      ],
      preLearningCheck: {
        question: 'A team wants a purpose-built, ML-native way to define a repeatable workflow of data processing, training, evaluation, and model registration steps. Which AWS service is designed for this?',
        options: [
          'AWS CodeDeploy',
          'Amazon SageMaker Pipelines',
          'Amazon SQS',
          'AWS Config',
        ],
        correct: 1,
        note: 'Guess first — the attempt strengthens recall of the orchestrators.',
      },
      sections: [
        {
          heading: 'The CI/CD service map',
          body: 'AWS CI/CD is a small set of services that hand off to each other. Know what each one does.',
          table: {
            headers: ['Service', 'Role in the pipeline'],
            rows: [
              ['AWS CodePipeline', 'Orchestrates the stages (source → build → test → deploy) end to end'],
              ['AWS CodeBuild', 'Compiles, packages, and runs tests in a managed build environment'],
              ['AWS CodeDeploy', 'Automates the deployment, including traffic-shifting strategies'],
              ['AWS CodeArtifact', 'Stores and shares package dependencies'],
            ],
          },
          callout: { type: 'tip', text: 'CodePipeline = the conductor; CodeBuild = build/test; CodeDeploy = release with strategy. Source events (Git push) and EventBridge rules kick the pipeline off.' },
        },
        {
          heading: 'Choosing an ML orchestrator',
          body: 'Beyond code CI/CD, ML workflows themselves need orchestration. Three common choices differ in focus.',
          table: {
            headers: ['Orchestrator', 'Best for'],
            rows: [
              ['SageMaker Pipelines', 'ML-native pipelines (process → train → evaluate → register → deploy) with lineage tracking'],
              ['AWS Step Functions', 'General serverless workflow orchestration across many AWS services with branching/retries'],
              ['Amazon MWAA (Managed Airflow)', 'Teams already standardized on Apache Airflow DAGs'],
            ],
          },
          callout: { type: 'note', text: 'Default to SageMaker Pipelines for an ML-specific workflow with built-in lineage. Choose Step Functions for broad multi-service orchestration, and MWAA when the team already uses Airflow.' },
        },
        {
          heading: 'Deployment strategies for models',
          body: 'How you release a new model version controls risk. SageMaker supports traffic-shifting strategies on endpoints.',
          bullets: [
            'Blue/green — stand up the new version alongside the old and switch traffic; instant rollback by switching back.',
            'Canary — shift a small percentage of traffic to the new version first, watch metrics, then complete the rollout.',
            'Linear — shift traffic in equal increments over time (e.g. 10% every few minutes), monitoring as you go.',
            'Rollback — automatically revert if alarms fire during the shift, limiting the blast radius of a bad model.',
          ],
          interactive: 'deploy-strategy',
        },
        {
          heading: 'Automated testing and retraining',
          body: 'CI/CD for ML adds tests and a loop back to training.',
          bullets: [
            'Automated tests — unit tests for code, integration/end-to-end tests for the pipeline, and model-quality gates (e.g. only register a model if it beats a metric threshold).',
            'Continuous deployment flows — Gitflow / GitHub Flow structure how commits and branches trigger pipelines.',
            'Event-driven retraining — an Amazon EventBridge rule (on a schedule, new data arriving, or a drift alarm from Model Monitor) starts a SageMaker Pipeline to retrain and redeploy.',
            'Approval steps — a human or automated approval can gate promotion of a newly registered model to production.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'In an ML CI/CD pipeline, which service is responsible for running the unit and integration tests and packaging the model container?',
          options: [
            'AWS CodePipeline',
            'AWS CodeBuild',
            'AWS CodeDeploy',
            'Amazon EventBridge',
          ],
          correct: 1,
          explainCorrect: 'Correct — CodeBuild provides the managed build environment that compiles, packages, and runs tests; CodePipeline orchestrates and CodeDeploy releases.',
          elaborativePrompt: 'Where in the same pipeline would a model-quality gate (only deploy if accuracy improves) most naturally live?',
        },
        {
          afterSection: 3,
          question: 'A team wants to release a new model version by routing 10% of live traffic to it, monitoring, and only then sending the remaining 90%. Which deployment strategy is this?',
          options: [
            'All-at-once',
            'Canary',
            'Blue/green with instant full switch',
            'Batch transform',
          ],
          correct: 1,
          explainCorrect: 'Correct — shifting a small percentage first and then completing the rollout is the canary strategy, which limits blast radius.',
          elaborativePrompt: 'How does canary differ from linear traffic shifting, and when would you prefer each?',
        },
      ],
      selfExplanationPrompt: 'Describe an end-to-end automated retraining loop using EventBridge, SageMaker Pipelines, and Model Registry. What event starts it and what gate decides whether the new model ships?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML team wants to automatically retrain and redeploy a model whenever Model Monitor detects significant data drift, with an ML-native workflow that tracks lineage from data processing through training, evaluation, and model registration. Which combination BEST implements this?',
        options: [
          'A cron job on an EC2 instance that retrains nightly regardless of drift',
          'An EventBridge rule on the drift alarm that triggers a SageMaker Pipeline, registering the model in the Model Registry on success',
          'AWS CodeDeploy alone polling the data for changes',
          'Manual retraining whenever an engineer notices the drift',
        ],
        correct: 1,
        explanation: {
          summary: 'EventBridge reacts to the drift alarm and triggers a SageMaker Pipeline — the ML-native orchestrator with lineage tracking — which processes data, trains, evaluates, and registers the model. This is event-driven, automated, and auditable.',
          perOption: [
            'A nightly cron retrains on a fixed schedule, ignoring drift, and lacks lineage tracking and a quality gate.',
            'Correct — EventBridge on the drift alarm → SageMaker Pipeline (with lineage) → Model Registry on success is the canonical drift-triggered retraining loop.',
            'CodeDeploy releases applications; it neither orchestrates ML training steps nor tracks ML lineage.',
            'Manual retraining is not automated and does not react reliably to drift.',
          ],
          link: 'D3 · Task 3.3 — Event-driven retraining and ML orchestration',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers CI/CD and MLOps orchestration.',
        },
      ],
      keyTerms: [
        { term: 'SageMaker Pipelines', def: 'An ML-native workflow service that orchestrates processing, training, evaluation, and registration with lineage tracking.' },
        { term: 'AWS CodePipeline', def: 'A service that orchestrates CI/CD stages (source, build, test, deploy) end to end.' },
        { term: 'Canary deployment', def: 'Shifting a small percentage of traffic to a new version first, then completing the rollout after monitoring.' },
        { term: 'Linear deployment', def: 'Shifting traffic to a new version in equal increments over time while monitoring.' },
        { term: 'Event-driven retraining', def: 'Using an EventBridge rule (schedule, new data, or drift alarm) to automatically trigger a retraining pipeline.' },
      ],
      awsServices: [
        { name: 'Amazon SageMaker Pipelines', purpose: 'ML-native orchestration of the build-train-evaluate-register-deploy workflow with lineage.' },
        { name: 'AWS CodePipeline / CodeBuild / CodeDeploy', purpose: 'Orchestrate, build/test, and release stages of a CI/CD pipeline.' },
        { name: 'Amazon EventBridge', purpose: 'Triggers training/retraining jobs and pipelines on schedules or events such as drift alarms.' },
        { name: 'Amazon MWAA', purpose: 'Managed Apache Airflow for teams orchestrating workflows with DAGs.' },
      ],
      examTips: [
        'CodePipeline orchestrates; CodeBuild builds/tests; CodeDeploy releases with a strategy.',
        'ML-native workflow with lineage → SageMaker Pipelines; broad multi-service → Step Functions; existing Airflow → MWAA.',
        'Canary = small % first then rest; linear = equal increments; blue/green = parallel env with instant switch/rollback.',
        'Drift alarm → EventBridge → SageMaker Pipeline → Model Registry is the standard automated retraining loop.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 4 — ML SOLUTION MONITORING, MAINTENANCE & SECURITY (24%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd4-s12',
      number: 12,
      module: 'Domain 4 · Monitoring, Maintenance & Security',
      domain: 'd4',
      weight: '24%',
      task: 'Task 4.1',
      title: 'Monitoring Model Inference and Drift',
      duration: 30,
      summary: 'A model that was accurate at launch silently degrades as the world changes. This session covers detecting that decay: types of drift, SageMaker Model Monitor, using Clarify for distribution changes, and comparing model versions with A/B testing in production.',
      objectives: [
        'Distinguish data drift from concept drift and why both hurt accuracy',
        'Use SageMaker Model Monitor to watch data quality and model quality in production',
        'Detect distribution changes with SageMaker Clarify',
        'Compare model versions safely with A/B testing (production variants)',
      ],
      preLearningCheck: {
        question: 'A fraud model performs worse over months because fraud patterns and customer behavior have shifted away from the training data. What is this phenomenon called?',
        options: [
          'Overfitting',
          'Model/data drift',
          'Underfitting',
          'Data leakage',
        ],
        correct: 1,
        note: 'Guess first — the attempt aids retention even when wrong.',
      },
      sections: [
        {
          heading: 'Why models decay: drift',
          body: 'A deployed model assumes the future resembles the data it learned from. When that assumption breaks, accuracy drifts down even though the model itself never changed.',
          table: {
            headers: ['Type', 'What changes', 'Example'],
            rows: [
              ['Data (covariate) drift', 'The distribution of the input features', 'Customer demographics shift; a new device sends different feature values'],
              ['Concept drift', 'The relationship between inputs and the target', 'What counts as "fraud" evolves as fraudsters adapt'],
              ['Label/prior drift', 'The distribution of the target class', 'The fraud rate itself rises or falls over time'],
            ],
          },
          callout: { type: 'warning', text: 'Drift is silent — the endpoint keeps returning predictions with no errors. You only catch it by monitoring input distributions and model quality against a baseline.' },
        },
        {
          heading: 'SageMaker Model Monitor',
          body: 'Model Monitor continuously checks a live endpoint against a baseline captured from the training data and raises alerts when things drift.',
          bullets: [
            'Data quality monitoring — detects when incoming feature distributions or statistics deviate from the training baseline.',
            'Model quality monitoring — compares predictions against actual labels (when they arrive) to track accuracy/precision/recall over time.',
            'Bias drift and feature-attribution drift — integrates with SageMaker Clarify to flag fairness and explanation changes.',
            'It captures endpoint data, runs scheduled monitoring jobs, and emits metrics/alarms to CloudWatch.',
          ],
          callout: { type: 'tip', text: '"Detect that live data has drifted from the training distribution" → SageMaker Model Monitor (data quality), often paired with Clarify for bias/attribution drift.' },
        },
        {
          heading: 'A/B testing model versions',
          body: 'Before fully trusting a new model, compare it against the current one on real traffic.',
          bullets: [
            'Production variants — a SageMaker endpoint can host multiple model variants and split live traffic between them by weight.',
            'A/B testing — route, say, 90% to the current model and 10% to the candidate, then compare real-world metrics before promoting.',
            'Shadow testing (from Session 8) — send a copy of traffic to the candidate with no user impact, when you want comparison without serving its responses.',
          ],
        },
        {
          heading: 'Monitoring the whole workflow',
          body: 'Inference monitoring extends beyond the model to the pipeline around it.',
          bullets: [
            'Watch for anomalies or errors in data processing and inference (failed jobs, malformed inputs, latency spikes).',
            'Apply the ML lens design principles: monitor data quality, model quality, and the operational health of the pipeline together.',
            'Feed drift signals back into the retraining loop (Session 11) so detection leads to action.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A recommendation model’s accuracy falls because the meaning of a "trending" product changed seasonally — the input/output relationship itself shifted. Which kind of drift is this?',
          options: [
            'Data (covariate) drift',
            'Concept drift',
            'Overfitting',
            'Data leakage',
          ],
          correct: 1,
          explainCorrect: 'Correct — when the relationship between inputs and the target changes, that is concept drift, not merely a shift in the input distribution.',
          elaborativePrompt: 'How would your remediation differ for concept drift versus pure data drift?',
        },
        {
          afterSection: 2,
          question: 'A team needs to be alerted automatically when the feature distributions hitting a production endpoint diverge from the training baseline. Which service should they configure?',
          options: [
            'SageMaker Model Monitor',
            'AWS CloudFormation',
            'Amazon ECR',
            'SageMaker Feature Store',
          ],
          correct: 0,
          explainCorrect: 'Correct — Model Monitor compares live endpoint data against a training baseline and raises alerts on data-quality drift.',
          elaborativePrompt: 'Once Model Monitor fires a drift alarm, what automated action from Session 11 should follow?',
        },
      ],
      selfExplanationPrompt: 'Explain why a model with zero errors in production can still be failing the business, and how monitoring catches that.',
      sample: {
        type: 'multiple-choice',
        stem: 'A deployed credit-risk model returns predictions normally, but the data science team suspects its accuracy is slipping as applicant behavior changes. They want automated detection when live input data diverges from the training distribution, plus the ability to track prediction quality over time. What should they implement?',
        options: [
          'Increase the endpoint instance size to improve accuracy',
          'Enable SageMaker Model Monitor for data-quality and model-quality monitoring against a training baseline, with CloudWatch alarms',
          'Switch the endpoint to batch transform',
          'Retrain the model once and assume it will stay accurate',
        ],
        correct: 1,
        explanation: {
          summary: 'Model Monitor captures endpoint data, compares it to a training baseline for data-quality drift, and (with labels) tracks model-quality over time, emitting CloudWatch alarms — exactly the automated drift detection the team needs.',
          perOption: [
            'A larger instance changes throughput/latency, not accuracy or drift detection.',
            'Correct — Model Monitor provides baseline-based data- and model-quality monitoring with alarms.',
            'Batch transform changes how inference runs; it does not detect drift on a live endpoint.',
            'A one-time retrain ignores that drift is ongoing; without monitoring the team will not know when accuracy slips again.',
          ],
          link: 'D4 · Task 4.1 — Monitoring data quality and model performance for drift',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers monitoring and drift detection.',
        },
      ],
      keyTerms: [
        { term: 'Data drift', def: 'A change in the distribution of input features away from the training data, degrading accuracy.' },
        { term: 'Concept drift', def: 'A change in the relationship between inputs and the target variable over time.' },
        { term: 'SageMaker Model Monitor', def: 'A service that compares a live endpoint against a training baseline to detect data- and model-quality drift.' },
        { term: 'Production variant', def: 'A model version hosted on an endpoint, with live traffic split by weight to enable A/B testing.' },
        { term: 'A/B testing', def: 'Routing portions of live traffic to different model versions to compare real-world performance before promotion.' },
      ],
      awsServices: [
        { name: 'SageMaker Model Monitor', purpose: 'Detects data- and model-quality drift on live endpoints against a baseline and alerts via CloudWatch.' },
        { name: 'SageMaker Clarify', purpose: 'Detects bias drift and feature-attribution changes in production data.' },
        { name: 'Amazon SageMaker', purpose: 'Hosts production variants to enable A/B and shadow testing of model versions.' },
        { name: 'Amazon CloudWatch', purpose: 'Receives monitoring metrics and fires alarms on drift and anomalies.' },
      ],
      examTips: [
        'Drift is silent — only baseline monitoring catches it; the endpoint keeps returning predictions.',
        'Detect live-data divergence from training distribution → SageMaker Model Monitor (data quality).',
        'Compare a candidate model on a slice of live traffic → A/B testing with production variants; no user impact → shadow.',
        'Data drift = inputs change; concept drift = input→target relationship changes.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s13',
      number: 13,
      module: 'Domain 4 · Monitoring, Maintenance & Security',
      domain: 'd4',
      weight: '24%',
      task: 'Task 4.2',
      title: 'Infrastructure Observability and Troubleshooting',
      duration: 30,
      summary: 'Beyond the model, the infrastructure serving it must be observable. This session covers the CloudWatch family (Logs, Logs Insights, alarms, dashboards), X-Ray tracing, CloudTrail auditing, EventBridge, QuickSight dashboards, and choosing instance types to fix latency and performance problems.',
      objectives: [
        'Use CloudWatch Logs, Logs Insights, alarms, and dashboards to troubleshoot ML systems',
        'Apply X-Ray tracing and CloudWatch Lambda Insights to latency problems',
        'Use CloudTrail to audit API activity and trigger actions',
        'Match instance families to performance bottlenecks',
      ],
      preLearningCheck: {
        question: 'An ML engineer needs to run ad-hoc queries across large volumes of endpoint and Lambda log data to find the cause of intermittent errors. Which tool is purpose-built for this?',
        options: [
          'Amazon CloudWatch Logs Insights',
          'AWS CloudTrail',
          'Amazon S3 Select',
          'AWS Config',
        ],
        correct: 0,
        note: 'Guess first — retrieval practice strengthens the distinction.',
      },
      sections: [
        {
          heading: 'The CloudWatch family',
          body: 'CloudWatch is the backbone of AWS observability. Know the pieces and when each applies.',
          table: {
            headers: ['Tool', 'Use for'],
            rows: [
              ['CloudWatch Metrics', 'Numeric time-series (invocations, latency, CPU/GPU, errors) with alarms'],
              ['CloudWatch Logs', 'Centralized log collection from endpoints, Lambda, and training jobs'],
              ['CloudWatch Logs Insights', 'Ad-hoc query language to search and aggregate large log volumes'],
              ['CloudWatch Alarms', 'Threshold/anomaly alarms that notify (SNS) or trigger actions'],
              ['CloudWatch Dashboards', 'At-a-glance operational views of key metrics'],
            ],
          },
          callout: { type: 'tip', text: '"Query/aggregate across large log data to find a cause" → CloudWatch Logs Insights. "Alert when a metric crosses a threshold" → CloudWatch alarm (often → SNS).' },
        },
        {
          heading: 'Tracing and deep latency analysis',
          body: 'Metrics tell you something is slow; tracing tells you where.',
          bullets: [
            'AWS X-Ray — distributed tracing that follows a request across services to pinpoint the slow component in an inference pipeline.',
            'CloudWatch Lambda Insights — deeper performance metrics for Lambda functions (memory, cold starts, CPU).',
            'Use traces and segment timing to separate model inference time from data-fetch or network time.',
          ],
        },
        {
          heading: 'Auditing and event-driven ops',
          body: 'Security and operations both rely on knowing who did what, and reacting to events.',
          bullets: [
            'AWS CloudTrail — records API calls across the account for auditing, compliance, and forensics; create a trail to persist events to S3. CloudTrail can also be used to invoke re-training or other actions in response to logged activity.',
            'Amazon EventBridge — routes events (including CloudWatch alarms and CloudTrail events) to targets that take action, such as starting a retraining pipeline.',
            'Amazon QuickSight — build business-facing dashboards over metrics/data; CloudWatch dashboards serve the operational/engineering view.',
          ],
        },
        {
          heading: 'Choosing instance types for performance',
          body: 'Many "fix the performance/latency" answers come down to selecting the right instance family.',
          table: {
            headers: ['Family', 'Optimized for', 'Use when'],
            rows: [
              ['General purpose', 'Balanced CPU/memory', 'Mixed workloads with no single bottleneck'],
              ['Compute optimized', 'High CPU', 'CPU-bound inference or preprocessing'],
              ['Memory optimized', 'Large RAM', 'Large models or in-memory datasets'],
              ['Accelerated / inference optimized', 'GPU / Inferentia', 'Deep-learning training or high-throughput DL inference'],
            ],
          },
          callout: { type: 'note', text: 'Rightsizing tools (SageMaker Inference Recommender, AWS Compute Optimizer) recommend the instance type/size that meets latency and throughput at the lowest cost — covered next session.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'An inference pipeline spans an API Gateway, a Lambda preprocessor, and a SageMaker endpoint, and the team needs to find which component adds the most latency. Which tool is best?',
          options: [
            'AWS X-Ray distributed tracing',
            'AWS CloudTrail',
            'Amazon S3 access logs',
            'AWS Config rules',
          ],
          correct: 0,
          explainCorrect: 'Correct — X-Ray traces a request across services and shows per-segment timing, pinpointing the slow component.',
          elaborativePrompt: 'How does a trace give you information that a single latency metric on the endpoint cannot?',
        },
        {
          afterSection: 2,
          question: 'A compliance team must review every API action taken against the SageMaker and S3 resources in the account over the last 90 days. Which service provides this audit record?',
          options: [
            'AWS CloudTrail',
            'Amazon CloudWatch Dashboards',
            'AWS X-Ray',
            'Amazon QuickSight',
          ],
          correct: 0,
          explainCorrect: 'Correct — CloudTrail records API activity across the account for auditing and compliance; a trail persists the history to S3.',
          elaborativePrompt: 'What is the difference in purpose between CloudTrail (API audit) and CloudWatch Logs (application/operational logs)?',
        },
      ],
      selfExplanationPrompt: 'Distinguish CloudWatch, X-Ray, and CloudTrail in one sentence each — what unique question does each answer?',
      sample: {
        type: 'multiple-choice',
        stem: 'A real-time inference endpoint intermittently returns high latency. The ML engineer must (1) get alerted when p99 latency crosses a threshold, (2) query large volumes of logs to find the pattern, and (3) trace individual slow requests across the API Gateway, Lambda, and the endpoint. Which combination of tools is correct?',
        options: [
          'CloudTrail for alerts, S3 Select for logs, and Config for tracing',
          'A CloudWatch alarm on latency, CloudWatch Logs Insights for log queries, and AWS X-Ray for request tracing',
          'QuickSight for alerts, EventBridge for logs, and CloudFormation for tracing',
          'Model Monitor for all three',
        ],
        correct: 1,
        explanation: {
          summary: 'A CloudWatch alarm handles threshold alerting on latency, Logs Insights queries large log volumes for patterns, and X-Ray traces individual requests across services to localize the slow component — each tool maps to one requirement.',
          perOption: [
            'CloudTrail audits API calls (not metric alerts), S3 Select queries S3 objects (not operational logs), and Config tracks configuration (not request traces).',
            'Correct — CloudWatch alarm + Logs Insights + X-Ray map exactly to alerting, log querying, and request tracing.',
            'QuickSight is BI dashboards, EventBridge routes events, and CloudFormation is IaC — none match these three needs.',
            'Model Monitor watches model/data drift, not infrastructure latency, log querying, or distributed tracing.',
          ],
          link: 'D4 · Task 4.2 — Observability tools for latency and performance',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers observability and troubleshooting.',
        },
      ],
      keyTerms: [
        { term: 'CloudWatch Logs Insights', def: 'A query language for searching and aggregating large volumes of CloudWatch log data ad hoc.' },
        { term: 'CloudWatch alarm', def: 'A rule that triggers a notification or action when a metric crosses a threshold or behaves anomalously.' },
        { term: 'AWS X-Ray', def: 'Distributed tracing that follows a request across services to localize latency and errors.' },
        { term: 'AWS CloudTrail', def: 'A service that records account API activity for auditing, compliance, and event-driven actions.' },
        { term: 'Instance family', def: 'A category of EC2/SageMaker instance optimized for compute, memory, general use, or acceleration.' },
      ],
      awsServices: [
        { name: 'Amazon CloudWatch', purpose: 'Metrics, logs, Logs Insights, alarms, and dashboards for ML monitoring and troubleshooting.' },
        { name: 'AWS X-Ray', purpose: 'Distributed request tracing to pinpoint latency across an inference pipeline.' },
        { name: 'AWS CloudTrail', purpose: 'Records API activity for auditing and can trigger actions like retraining.' },
        { name: 'Amazon QuickSight', purpose: 'Business-facing dashboards over metrics and data.' },
      ],
      examTips: [
        'Query/aggregate large logs → CloudWatch Logs Insights; threshold alert → CloudWatch alarm (→ SNS).',
        'Pinpoint the slow service in a request path → AWS X-Ray tracing.',
        'Audit who-did-what via API → AWS CloudTrail (trail to S3).',
        'Operational dashboards → CloudWatch; business dashboards → QuickSight.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s14',
      number: 14,
      module: 'Domain 4 · Monitoring, Maintenance & Security',
      domain: 'd4',
      weight: '24%',
      task: 'Task 4.2',
      title: 'Cost Optimization for ML Workloads',
      duration: 30,
      summary: 'ML compute — especially GPUs — is expensive, so the exam tests cost control directly. This session covers the cost-management tools (Cost Explorer, Budgets, Trusted Advisor), tagging for allocation, rightsizing with Inference Recommender and Compute Optimizer, and purchasing options (Spot, Reserved, Savings Plans).',
      objectives: [
        'Use Cost Explorer, AWS Budgets, and Trusted Advisor to analyze and control ML spend',
        'Apply a tagging strategy for cost allocation and tracking',
        'Rightsize instances with SageMaker Inference Recommender and AWS Compute Optimizer',
        'Choose purchasing options: On-Demand, Spot, Reserved, and SageMaker Savings Plans',
      ],
      preLearningCheck: {
        question: 'A team runs a steady, predictable 24/7 inference endpoint and wants the largest discount over the next year in exchange for a usage commitment. Which option fits best?',
        options: [
          'On-Demand Instances',
          'Spot Instances',
          'SageMaker Savings Plans (or Reserved capacity)',
          'Provisioned concurrency',
        ],
        correct: 2,
        note: 'Guess first — the attempt helps the pricing models stick.',
      },
      sections: [
        {
          heading: 'Cost management tools',
          body: 'AWS provides distinct tools for understanding, forecasting, and capping spend. The exam tests which one fits the verb in the question.',
          table: {
            headers: ['Tool', 'Answers', 'Verb'],
            rows: [
              ['AWS Cost Explorer', 'Where has my spend gone, and what is the trend?', 'Analyze / visualize'],
              ['AWS Budgets', 'Alert or act when spend approaches a limit', 'Cap / alert'],
              ['AWS Trusted Advisor', 'What idle/underused resources can I cut?', 'Recommend savings'],
              ['Cost allocation tags', 'Attribute cost to a team/project/model', 'Track / allocate'],
            ],
          },
          callout: { type: 'tip', text: '"Analyze/visualize past spend" → Cost Explorer. "Alert/stop at a threshold" → AWS Budgets. "Attribute cost by team/project" → cost allocation tags. "Recommend idle-resource savings" → Trusted Advisor.' },
        },
        {
          heading: 'Tagging for cost allocation',
          body: 'You cannot manage what you cannot attribute. A consistent tagging strategy (e.g. team, project, environment, model) lets Cost Explorer and Budgets break spend down by dimension and enforce per-team budgets.',
          bullets: [
            'Define and enforce mandatory tags (often via AWS Organizations tag policies).',
            'Activate cost allocation tags so they appear in billing reports.',
            'Tag training jobs, endpoints, and storage so ML spend is visible per workload.',
          ],
        },
        {
          heading: 'Rightsizing',
          body: 'Over-provisioned instances are the most common ML cost leak. AWS recommends the smallest instance that still meets your performance target.',
          bullets: [
            'SageMaker Inference Recommender — load-tests a model across instance types and recommends the one meeting latency/throughput at the lowest cost.',
            'AWS Compute Optimizer — analyzes utilization of EC2/other resources and recommends rightsizing.',
            'Watch capacity issues: provisioned concurrency, service quotas, and auto scaling all affect both cost and the ability to handle load.',
          ],
          callout: { type: 'note', text: '"Find the cheapest instance that still meets the model’s latency SLA" → SageMaker Inference Recommender.' },
        },
        {
          heading: 'Purchasing options',
          body: 'Matching the pricing model to the workload pattern is the biggest single lever on ML cost.',
          table: {
            headers: ['Option', 'Discount', 'Best for'],
            rows: [
              ['On-Demand', 'None (baseline)', 'Unpredictable or short-lived workloads'],
              ['Spot Instances', 'Largest (up to ~90%)', 'Fault-tolerant, interruptible training with checkpointing'],
              ['Reserved Instances', 'Significant (1–3 yr commit)', 'Steady, predictable instance usage'],
              ['SageMaker Savings Plans', 'Significant (commit $/hr)', 'Steady SageMaker usage across instance types with flexibility'],
            ],
          },
          callout: { type: 'warning', text: 'Spot can be reclaimed at any time — perfect for checkpointed training, wrong for an always-on production endpoint. Commit-based plans (Reserved/Savings) reward predictable, steady usage.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A finance team wants to be automatically notified — and optionally stop further spend — when the ML project’s monthly cost reaches 80% of its limit. Which tool fits?',
          options: [
            'AWS Cost Explorer',
            'AWS Budgets',
            'AWS Trusted Advisor',
            'Amazon CloudWatch dashboards',
          ],
          correct: 1,
          explainCorrect: 'Correct — AWS Budgets sets thresholds that trigger alerts (and budget actions) as spend approaches a limit.',
          elaborativePrompt: 'Why is Cost Explorer the wrong tool here even though it shows spend?',
        },
        {
          afterSection: 3,
          question: 'A large model is trained repeatedly in jobs that can checkpoint and safely resume after interruption. Which purchasing option minimizes training cost?',
          options: [
            'On-Demand Instances',
            'Spot Instances with checkpointing',
            'A 3-year Reserved Instance',
            'Provisioned concurrency',
          ],
          correct: 1,
          explainCorrect: 'Correct — Spot Instances offer the deepest discount and suit interruptible, checkpointed training jobs.',
          elaborativePrompt: 'Why would a 3-year Reserved Instance be a poor fit for sporadic training jobs?',
        },
      ],
      selfExplanationPrompt: 'Give the one-line decision rule for choosing among On-Demand, Spot, and a commitment plan (Reserved/Savings). What workload property decides it?',
      sample: {
        type: 'multiple-choice',
        stem: 'An ML team must reduce costs. They run (a) nightly training jobs that checkpoint and can tolerate interruption, and (b) a steady 24/7 production endpoint with predictable load. They also need to attribute spend to each project and be alerted before exceeding budget. Which combination is MOST cost-effective?',
        options: [
          'Run both on On-Demand, and check Cost Explorer occasionally',
          'Use Spot for the training jobs, a SageMaker Savings Plan (or Reserved) for the steady endpoint, cost allocation tags for attribution, and AWS Budgets for alerts',
          'Use Reserved Instances for the training jobs and Spot for the production endpoint',
          'Use provisioned concurrency for everything and disable monitoring',
        ],
        correct: 1,
        explanation: {
          summary: 'Spot fits interruptible, checkpointed training (deepest discount); a Savings Plan/Reserved fits the steady, predictable endpoint; cost allocation tags attribute spend per project; and Budgets alerts before overspending — each tool matches one requirement.',
          perOption: [
            'All-On-Demand forgoes the large discounts available for both interruptible training and steady usage.',
            'Correct — Spot for training, Savings Plan/Reserved for the steady endpoint, tags for attribution, Budgets for alerts.',
            'This inverts the fit: Spot can be reclaimed and is wrong for an always-on endpoint, while a 3-year Reserved is wrong for sporadic training.',
            'Provisioned concurrency does not minimize these costs, and disabling monitoring removes the visibility the team needs.',
          ],
          link: 'D4 · Task 4.2 — Cost optimization and purchasing options',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers cost monitoring and optimization.',
        },
      ],
      keyTerms: [
        { term: 'AWS Cost Explorer', def: 'A tool to analyze and visualize historical AWS spend and trends.' },
        { term: 'AWS Budgets', def: 'A tool to set spend/usage thresholds that trigger alerts and optional budget actions.' },
        { term: 'Cost allocation tags', def: 'Tags that attribute AWS cost to a team, project, or workload in billing reports.' },
        { term: 'SageMaker Inference Recommender', def: 'A service that load-tests a model across instance types to recommend the cheapest that meets the SLA.' },
        { term: 'SageMaker Savings Plans', def: 'A commitment ($/hour for 1–3 years) that discounts steady SageMaker usage with instance-type flexibility.' },
      ],
      awsServices: [
        { name: 'AWS Cost Explorer', purpose: 'Analyzes and visualizes ML spend over time.' },
        { name: 'AWS Budgets', purpose: 'Alerts and acts when spend approaches defined limits.' },
        { name: 'SageMaker Inference Recommender', purpose: 'Recommends the lowest-cost instance meeting a model’s latency/throughput targets.' },
        { name: 'AWS Compute Optimizer', purpose: 'Recommends rightsizing based on resource utilization.' },
      ],
      examTips: [
        'Analyze past spend → Cost Explorer; alert/cap at threshold → AWS Budgets; attribute spend → cost allocation tags.',
        'Cheapest instance meeting an SLA → SageMaker Inference Recommender; rightsizing → Compute Optimizer.',
        'Interruptible/checkpointed training → Spot; steady predictable usage → Reserved or SageMaker Savings Plans.',
        'Idle/underused resource recommendations → Trusted Advisor.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd4-s15',
      number: 15,
      module: 'Domain 4 · Monitoring, Maintenance & Security',
      domain: 'd4',
      weight: '24%',
      task: 'Task 4.3',
      title: 'Securing ML Resources',
      duration: 30,
      summary: 'The final session locks down the ML system. We cover IAM least-privilege for ML artifacts, SageMaker Role Manager and security features, network isolation with VPCs/subnets/security groups, securing CI/CD pipelines, and auditing for continued compliance.',
      objectives: [
        'Apply least-privilege IAM to ML roles, users, and applications',
        'Use SageMaker Role Manager and SageMaker security/compliance features',
        'Isolate ML resources with VPCs, subnets, and security groups',
        'Secure CI/CD pipelines and audit ML systems for compliance',
      ],
      preLearningCheck: {
        question: 'A SageMaker training job needs to read one specific S3 bucket and write model artifacts to another, and nothing more. What is the correct IAM approach?',
        options: [
          'Attach AdministratorAccess to the execution role for simplicity',
          'Grant a least-privilege role scoped to exactly those two buckets and actions',
          'Use the AWS account root user credentials',
          'Make both buckets public',
        ],
        correct: 1,
        note: 'Guess first — the retrieval attempt aids retention.',
      },
      sections: [
        {
          heading: 'Least-privilege IAM for ML',
          body: 'Security on AWS starts with identity. The principle of least privilege — grant only the permissions a role needs, nothing more — is the most-tested security idea.',
          bullets: [
            'IAM roles for compute — a SageMaker execution role grants the training/hosting job temporary, scoped permissions (e.g. read input bucket, write artifact bucket). Never embed long-lived keys.',
            'Scope policies tightly — limit actions and resources (specific buckets, KMS keys), not Action:* Resource:*.',
            'SageMaker Role Manager — helps build scoped IAM roles for ML personas (data scientist, MLOps) using predefined permission templates.',
            'Bucket policies / resource policies — control access to the S3 artifacts and other resources from the resource side.',
          ],
          callout: { type: 'tip', text: 'Default security answer: a least-privilege IAM role scoped to the exact resources and actions, using temporary credentials — never admin access, root, or hard-coded keys.' },
        },
        {
          heading: 'SageMaker security features',
          body: 'SageMaker has built-in controls for protecting data and workloads.',
          bullets: [
            'Encryption — encrypt data at rest (S3/EBS/EFS with KMS) and in transit (TLS); encrypt training volumes and inter-node traffic for distributed jobs.',
            'Network isolation — run training/processing jobs with no internet access (network isolation mode) so containers cannot exfiltrate data.',
            'VPC mode — launch SageMaker resources inside your VPC to keep traffic private.',
            'Compliance — SageMaker supports common compliance programs; combine with CloudTrail auditing for evidence.',
          ],
        },
        {
          heading: 'Network isolation',
          body: 'Keeping ML traffic off the public internet is a frequent requirement.',
          bullets: [
            'VPC, subnets, security groups — place endpoints and jobs in private subnets, with security groups restricting inbound/outbound traffic.',
            'VPC endpoints (PrivateLink) — reach AWS services (S3, SageMaker API) privately without traversing the internet.',
            'Combine with KMS encryption and least-privilege IAM for defense in depth.',
          ],
          callout: { type: 'note', text: '"Endpoint must not be reachable from the public internet" → deploy in a VPC with private subnets + security groups, and use VPC endpoints for AWS service access.' },
        },
        {
          heading: 'Securing pipelines and auditing',
          body: 'The CI/CD pipeline and ongoing audit are part of the security surface.',
          bullets: [
            'CI/CD security — scope pipeline roles to least privilege, store secrets in AWS Secrets Manager (not in code), and scan artifacts; protect the source repository.',
            'Auditing & logging — CloudTrail records API activity; CloudWatch Logs captures operational logs; together they provide the audit trail for continued compliance.',
            'Continuously monitor for security drift and respond to anomalies (failed auth, unexpected API calls).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An ML engineer is creating an IAM role for a data scientist who should be able to run SageMaker training and notebooks but not modify billing or IAM. What is the best way to build this scoped role quickly?',
          options: [
            'Attach AdministratorAccess and trust the data scientist',
            'Use SageMaker Role Manager with a persona-based permission template',
            'Share the root account credentials',
            'Grant Action:* on Resource:* but only in one Region',
          ],
          correct: 1,
          explainCorrect: 'Correct — SageMaker Role Manager builds least-privilege roles from ML persona templates, granting only what that persona needs.',
          elaborativePrompt: 'Why is "Action:* in one Region" still a violation of least privilege despite the Region limit?',
        },
        {
          afterSection: 2,
          question: 'A regulated company requires that a SageMaker endpoint never send or receive traffic over the public internet. Which configuration meets this?',
          options: [
            'Deploy the endpoint in a VPC with private subnets and security groups, using VPC endpoints for AWS service access',
            'Make the endpoint public but add a strong password',
            'Disable CloudTrail to reduce exposure',
            'Use On-Demand instances instead of Spot',
          ],
          correct: 0,
          explainCorrect: 'Correct — placing the endpoint in a VPC with private subnets/security groups and using VPC endpoints keeps all traffic private.',
          elaborativePrompt: 'What additional controls (encryption, IAM) would you layer on for defense in depth?',
        },
      ],
      selfExplanationPrompt: 'Explain "least privilege" to a teammate and give one concrete example of tightening an over-broad SageMaker execution role.',
      sample: {
        type: 'multiple-choice',
        stem: 'A healthcare ML system must: give each training job only the access it needs, keep all inference traffic off the public internet, encrypt data at rest with auditable keys, and retain an audit trail of all API activity. Which combination meets ALL requirements?',
        options: [
          'A shared admin role, a public endpoint, default encryption, and no logging',
          'Least-privilege IAM execution roles, a VPC with private subnets and security groups, KMS customer-managed keys, and CloudTrail',
          'Root credentials for jobs, a VPC, and S3 public buckets',
          'AdministratorAccess roles, Spot Instances, and QuickSight dashboards',
        ],
        correct: 1,
        explanation: {
          summary: 'Least-privilege roles scope each job’s access, a VPC with private subnets/security groups keeps inference traffic private, KMS customer-managed keys give auditable encryption at rest, and CloudTrail provides the API audit trail — every requirement is satisfied.',
          perOption: [
            'A shared admin role, public endpoint, and no logging violate least privilege, network isolation, and auditability.',
            'Correct — least-privilege IAM + private VPC + KMS CMK + CloudTrail maps to all four requirements.',
            'Root credentials and public buckets are major security violations, regardless of the VPC.',
            'AdministratorAccess breaks least privilege, and Spot/QuickSight do not address isolation, encryption, or auditing.',
          ],
          link: 'D4 · Task 4.3 — Securing ML resources with IAM, VPC, KMS, and auditing',
        },
      },
      videos: [
        {
          videoId: 'ylZH9RLHGyw',
          title: 'Everything You Need to Know About AWS ML Engineer Associate (MLA-C01)',
          channel: 'K21Academy',
          startSeconds: null,
          endSeconds: null,
          relevance: 'MLA-C01 overview companion — covers ML security and the full exam wrap-up.',
        },
      ],
      keyTerms: [
        { term: 'Least privilege', def: 'Granting an identity only the permissions required for its task, and no more.' },
        { term: 'SageMaker execution role', def: 'An IAM role that grants a training or hosting job temporary, scoped permissions to AWS resources.' },
        { term: 'SageMaker Role Manager', def: 'A tool to build least-privilege IAM roles for ML personas from permission templates.' },
        { term: 'Network isolation', def: 'Running ML resources in a VPC (and optionally with no internet) so traffic stays private.' },
        { term: 'VPC endpoint', def: 'A private connection (PrivateLink) to AWS services that avoids the public internet.' },
      ],
      awsServices: [
        { name: 'AWS IAM', purpose: 'Defines least-privilege roles and policies controlling access to ML resources.' },
        { name: 'SageMaker Role Manager', purpose: 'Builds scoped IAM roles for ML personas from templates.' },
        { name: 'Amazon VPC', purpose: 'Isolates ML resources in private subnets with security groups and VPC endpoints.' },
        { name: 'AWS CloudTrail', purpose: 'Provides the API audit trail for security and compliance.' },
      ],
      examTips: [
        'Default security answer = least-privilege IAM role, scoped resources/actions, temporary credentials — never admin/root/hard-coded keys.',
        'Build scoped ML roles fast → SageMaker Role Manager (persona templates).',
        'No public internet for an endpoint → VPC private subnets + security groups + VPC endpoints.',
        'Auditable encryption at rest → KMS customer-managed key; API audit trail → CloudTrail.',
      ],
    },

  ],
}

export default mlaC01Course
