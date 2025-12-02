import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Data Structure for Content Domain 1
const studyData = {
    title: "Content Domain 1: Development with AWS Services",
    tasks: [
        {
            id: "task1",
            title: "Task 1: Develop code for applications hosted on AWS",
            sections: [
                {
                    type: "Knowledge",
                    items: [
                        {
                            name: "Architectural patterns",
                            concept: "Architectural patterns define the structural organization of software systems. Key patterns include Event-driven (decoupled components communicating via events), Microservices (small, independent services), Monolithic (single unified unit), Choreography (decentralized decision making), Orchestration (centralized controller), and Fanout (sending a message to multiple destinations in parallel).",
                            cases: "Using SNS to fanout notifications to multiple SQS queues for parallel processing; Breaking a monolithic e-commerce app into microservices for better scalability.",
                            distractors: "Confusing Orchestration (central controller) with Choreography (distributed); Assuming Microservices always share a single database (they should have their own)."
                        },
                        {
                            name: "Idempotency",
                            concept: "Idempotency ensures that performing an operation multiple times produces the same result as performing it once. This is crucial for retries in distributed systems to prevent side effects like duplicate payments.",
                            cases: "A Lambda function processing an order payment uses a unique transaction ID to check if the payment was already processed before charging the card.",
                            distractors: "Thinking idempotency means the operation always succeeds (it means the *state change* is consistent); Believing GET requests are the only idempotent method (PUT and DELETE are also idempotent)."
                        },
                        {
                            name: "Stateful vs Stateless",
                            concept: "Stateless applications do not retain user data (session state) between requests on the server; state is held by the client or external store (DB/Cache). Stateful applications store session data locally on the server.",
                            cases: "Stateless: A REST API where every request contains all necessary info (token). Stateful: A legacy app using sticky sessions to keep user login data on a specific EC2 instance.",
                            distractors: "Assuming Lambda is stateful by default (it is stateless); Confusing 'Stateless' with 'Database-less' (Stateless apps still use DBs, they just don't store session state in memory)."
                        },
                        {
                            name: "Tightly vs Loosely coupled",
                            concept: "Loosely coupled components operate independently; a failure in one doesn't crash the other. Tightly coupled components depend heavily on each other.",
                            cases: "Loosely Coupled: SQS queue between a web server and a worker process. Tightly Coupled: A function directly calling another function's API synchronously.",
                            distractors: "Thinking synchronous API calls are loosely coupled (they create temporal coupling); Believing loose coupling eliminates all failures (it isolates them)."
                        },
                        {
                            name: "Fault-tolerant design patterns",
                            concept: "Patterns to ensure system reliability. Retries with Exponential Backoff and Jitter (wait longer between retries with random variation to avoid thundering herd). Dead-letter queues (DLQ) capture failed messages for analysis.",
                            cases: "Using a DLQ for an SQS queue to catch messages that fail processing 3 times; Implementing exponential backoff in AWS SDK calls to handle throttling.",
                            distractors: "Using linear backoff for high-concurrency retries (causes collisions); Deleting failed messages immediately instead of using a DLQ."
                        },
                        {
                            name: "Synchronous vs Asynchronous patterns",
                            concept: "Synchronous: The caller waits for a response (blocking). Asynchronous: The caller sends a request and continues without waiting (non-blocking).",
                            cases: "Sync: API Gateway triggering Lambda and waiting for the result. Async: S3 event triggering a Lambda function to process an image.",
                            distractors: "Assuming Async is always faster (it improves throughput/responsiveness, not necessarily individual latency); Thinking API Gateway can only be Synchronous (it supports Async integration)."
                        }
                    ]
                },
                {
                    type: "Skills",
                    items: [
                        {
                            name: "Creating fault-tolerant and resilient applications",
                            concept: "Writing code that handles failures gracefully using try-catch blocks, retries, and circuit breakers. Utilizing AWS SDK built-in retry mechanisms.",
                            cases: "Configuring the AWS SDK in Java to automatically retry throttled DynamoDB requests; Implementing a circuit breaker pattern in a Python microservice.",
                            distractors: "Writing custom retry logic without checking if the error is retryable (e.g., 400 Bad Request vs 500 Internal Error); Ignoring SDK default retry settings."
                        },
                        {
                            name: "Creating, extending, and maintaining APIs",
                            concept: "Designing RESTful APIs using API Gateway. Transforming requests/responses (Mapping Templates), validating input (Request Validation), and managing status codes.",
                            cases: "Using API Gateway mapping templates to transform a JSON request before sending it to a legacy XML backend; Setting up request validation models to reject invalid payloads.",
                            distractors: "Hardcoding validation logic in Lambda instead of using API Gateway validation (inefficient); Returning 200 OK for all responses including errors (bad practice)."
                        },
                        {
                            name: "Writing and running unit tests (AWS SAM)",
                            concept: "Using AWS SAM (Serverless Application Model) to test serverless applications locally. `sam local invoke` runs functions in Docker containers simulating Lambda.",
                            cases: "Running `sam local start-api` to test API Gateway endpoints locally; Writing unit tests for Lambda handlers using mock events.",
                            distractors: "Thinking SAM tests run directly in the AWS cloud (they run locally in Docker); Confusing `sam build` with `sam deploy`."
                        },
                        {
                            name: "Writing code to use messaging services",
                            concept: "Interacting with SQS and SNS. Sending messages, polling queues, deleting messages after processing.",
                            cases: "A Python script sending order details to an SQS queue; A Lambda function publishing a topic to SNS for email notifications.",
                            distractors: "Forgetting to delete a message from SQS after processing (leads to visibility timeout loop); Polling SQS in a tight loop without Long Polling (inefficient)."
                        },
                        {
                            name: "Interacting with AWS services via APIs/SDKs",
                            concept: "Using the AWS SDK to perform actions on resources. Understanding credentials chain, regions, and async/await patterns.",
                            cases: "Using Boto3 (Python SDK) to upload a file to S3; Using the Node.js SDK to put an item into DynamoDB.",
                            distractors: "Hardcoding credentials in code (security risk, use Roles/Env vars); Not handling pagination when listing resources (e.g., S3 listObjects)."
                        },
                        {
                            name: "Handling data streaming",
                            concept: "Working with Kinesis Data Streams. Producing and consuming records. Understanding shards and partition keys.",
                            cases: "A producer putting clickstream data into Kinesis; A Lambda function triggered by Kinesis to process batches of records.",
                            distractors: "Confusing Kinesis Data Streams (real-time) with Kinesis Firehose (load to S3/Redshift); Ignoring the order of records within a shard."
                        }
                    ]
                }
            ]
        },
        {
            id: "task2",
            title: "Task 2: Develop code for AWS Lambda",
            sections: [
                {
                    type: "Knowledge",
                    items: [
                        {
                            name: "Event source mapping",
                            concept: "A resource that reads from an event source (like Kinesis or SQS) and invokes a Lambda function. It manages polling and batching.",
                            cases: "Configuring an Event Source Mapping for a Lambda function to read messages from an SQS queue.",
                            distractors: "Thinking Lambda polls SQS directly without a mapping (the mapping service does the polling); Assuming Event Source Mapping pushes data (it polls pull-based sources)."
                        },
                        {
                            name: "Stateless applications",
                            concept: "Lambda functions are ephemeral. Any data stored in `/tmp` or global variables is not guaranteed to persist between invocations.",
                            cases: "Storing a database connection in a global variable for reuse (execution context reuse) but checking if it exists first.",
                            distractors: "Relying on local file storage for permanent data; Assuming global variables are reset for every single request (container reuse preserves them)."
                        },
                        {
                            name: "Unit testing",
                            concept: "Testing Lambda logic in isolation by mocking the `event` and `context` objects.",
                            cases: "Using a JSON file representing an S3 event to test a Lambda function locally.",
                            distractors: "Trying to mock the entire AWS cloud environment instead of just the inputs/outputs; Ignoring the asynchronous nature of Node.js Lambda tests."
                        },
                        {
                            name: "Event-driven architecture",
                            concept: "Systems where flow is determined by events (state changes). Lambda is central to this, triggered by events from S3, DynamoDB, etc.",
                            cases: "S3 Object Created event triggers a Lambda to generate a thumbnail.",
                            distractors: "Confusing Event-driven with Scheduled (Cron) tasks (Scheduled is time-driven); Thinking Event-driven implies synchronous communication."
                        },
                        {
                            name: "Scalability",
                            concept: "Lambda scales horizontally by creating more instances of the function. Concurrency limits control this scaling.",
                            cases: "Setting a reserved concurrency limit to prevent a Lambda function from overwhelming a downstream database.",
                            distractors: "Vertical scaling (adding more CPU/RAM to a single instance) as the primary scaling mechanism (Lambda scales horizontally); Ignoring the account-level concurrency limit."
                        },
                        {
                            name: "Accessing private VPC resources",
                            concept: "To access private resources (RDS, ElastiCache) in a VPC, Lambda must be configured with VPC subnets and security groups.",
                            cases: "Configuring a Lambda function to connect to a private RDS instance within a private subnet.",
                            distractors: "Thinking Lambda is in a VPC by default (it runs in a service VPC); Believing VPC access automatically gives internet access (needs NAT Gateway)."
                        }
                    ]
                },
                {
                    type: "Skills",
                    items: [
                        {
                            name: "Configuring Lambda functions",
                            concept: "Defining memory (which allocates CPU), timeout, runtime, handler, layers (shared code), and environment variables.",
                            cases: "Increasing memory to 1024MB to get more CPU power for a computation-heavy task; Using Layers to share a common library across multiple functions.",
                            distractors: "Configuring CPU directly (CPU is proportional to memory); Hardcoding config values instead of using Environment Variables."
                        },
                        {
                            name: "Handling event lifecycle and errors",
                            concept: "Managing success/failure. Async invocations can use Destinations (onSuccess/onFailure). Stream based errors use BisectBatchOnFunctionError.",
                            cases: "Configuring an 'OnFailure' destination to send failed async events to an SNS topic.",
                            distractors: "Using Dead Letter Queues (DLQ) for synchronous invocations (DLQs are for async only); Ignoring partial batch failures in Kinesis processing."
                        },
                        {
                            name: "Writing and running test code",
                            concept: "Using AWS SDKs to invoke functions or simulate events for integration testing.",
                            cases: "A script that uploads a file to S3 and checks if the expected Lambda function was triggered and wrote to DynamoDB.",
                            distractors: "Testing only the 'happy path'; Not cleaning up test resources (S3 objects, DB items) after tests run."
                        },
                        {
                            name: "Integrating Lambda with AWS services",
                            concept: "Understanding permissions (Execution Role) and triggers. Lambda needs permission to access other services.",
                            cases: "Granting a Lambda function `dynamodb:PutItem` permission via its IAM Execution Role.",
                            distractors: "Adding permissions to the User invoking the Lambda instead of the Lambda's role; Confusing Resource-based policies (who can call Lambda) with Execution Roles (what Lambda can do)."
                        },
                        {
                            name: "Tuning Lambda for performance",
                            concept: "Optimizing cold starts, memory allocation, and code efficiency. Using Provisioned Concurrency for latency-sensitive apps.",
                            cases: "Enabling Provisioned Concurrency for a checkout function to ensure instant response; Using Lambda Power Tuning tool to find the best memory/cost ratio.",
                            distractors: "Always choosing the max memory (waste of money); Ignoring initialization code (imports/setup) which contributes to cold start time."
                        }
                    ]
                }
            ]
        },
        {
            id: "task3",
            title: "Task 3: Use data stores in application development",
            sections: [
                {
                    type: "Knowledge",
                    items: [
                        {
                            name: "Relational vs Non-relational databases",
                            concept: "Relational (RDS/Aurora): Structured, SQL, ACID, joins. Non-relational (DynamoDB): Flexible schema, NoSQL, high scale, simple queries.",
                            cases: "Relational: Financial ledger requiring complex transactions. Non-relational: User session data or high-traffic gaming leaderboard.",
                            distractors: "Using DynamoDB for complex relational data requiring many joins (inefficient); Using RDS for massive scale, simple key-value lookups (harder to scale)."
                        },
                        {
                            name: "CRUD operations",
                            concept: "Create, Read, Update, Delete. The basic functions of persistent storage.",
                            cases: "DynamoDB: PutItem, GetItem, UpdateItem, DeleteItem.",
                            distractors: "Confusing `PutItem` (overwrite) with `UpdateItem` (modify attributes); Thinking `GetItem` can retrieve multiple items (use `BatchGetItem` or `Query`)."
                        },
                        {
                            name: "High-cardinality partition keys",
                            concept: "In DynamoDB, partition keys should have many unique values (high cardinality) to distribute traffic evenly across partitions.",
                            cases: "Using `UserID` or `DeviceID` as a partition key.",
                            distractors: "Using `Status` (e.g., 'Active', 'Inactive') as a partition key (causes hot partitions); Using a date as a partition key for time-series data without suffixing."
                        },
                        {
                            name: "Cloud storage options",
                            concept: "File (EFS - shared file system), Object (S3 - flat structure, metadata), Block (EBS - raw disk), Databases.",
                            cases: "EFS: Shared code directory for web servers. S3: Storing user profile images. EBS: Boot volume for EC2.",
                            distractors: "Using S3 for a high-performance OS boot drive (not possible); Using EBS for shared storage across multiple AZs (EBS is single-AZ)."
                        },
                        {
                            name: "Database consistency models",
                            concept: "Strongly Consistent: Read returns the most recent write. Eventually Consistent: Read might return stale data for a short time (lower latency/cost).",
                            cases: "DynamoDB defaults to Eventually Consistent reads. You can request Strongly Consistent reads.",
                            distractors: "Assuming all AWS databases are strongly consistent by default; Thinking eventual consistency means data loss (it just means delay in propagation)."
                        },
                        {
                            name: "Query vs Scan",
                            concept: "Query: Finds items based on Primary Key values (efficient). Scan: Reads every item in the table (inefficient, expensive).",
                            cases: "Query: Get all orders for User X. Scan: Export the entire table for backup.",
                            distractors: "Using Scan to find a specific user (terrible performance); Thinking Query can search on non-key attributes without an index."
                        },
                        {
                            name: "DynamoDB keys and indexing",
                            concept: "Primary Key (Partition Key + Optional Sort Key). LSI (Local Secondary Index) and GSI (Global Secondary Index) allow querying on other attributes.",
                            cases: "GSI: Querying users by 'Email' instead of 'UserID'.",
                            distractors: "Creating an LSI after table creation (LSI must be created at table creation); Confusing Partition Key with Sort Key."
                        },
                        {
                            name: "Caching strategies",
                            concept: "Write-through (write to cache and DB same time), Read-through (cache loads from DB if miss), Lazy loading (app loads from DB if miss and updates cache), TTL (Time To Live).",
                            cases: "Lazy Loading: Check Redis for user profile; if missing, fetch from RDS and write to Redis with TTL.",
                            distractors: "Using Write-through for data that is rarely read (waste of cache); Setting infinite TTL (cache fills up with stale data)."
                        },
                        {
                            name: "S3 tiers and lifecycle",
                            concept: "Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier. Lifecycle policies automate transitions.",
                            cases: "Moving logs to Glacier after 30 days for compliance; Using Intelligent-Tiering for unpredictable access patterns.",
                            distractors: "Using Glacier for frequently accessed data (high retrieval cost/time); Using One Zone-IA for critical data (risk of AZ loss)."
                        },
                        {
                            name: "Ephemeral vs Persistent storage",
                            concept: "Ephemeral: Temporary (Instance Store, Lambda /tmp). Persistent: Durable (EBS, S3, EFS).",
                            cases: "Instance Store: Temporary cache or buffer. EBS: Database storage.",
                            distractors: "Storing critical database files on Instance Store (data lost on stop/start); Treating Lambda /tmp as persistent storage."
                        }
                    ]
                },
                {
                    type: "Skills",
                    items: [
                        {
                            name: "Serializing and deserializing data",
                            concept: "Converting objects to format for storage (JSON/Binary) and back.",
                            cases: "Marshaling a Python dictionary to JSON for DynamoDB; Unmarshaling a JSON payload from API Gateway.",
                            distractors: "Storing raw binary objects in DynamoDB without encoding (use Binary type or S3); Ignoring JSON parsing errors."
                        },
                        {
                            name: "Using, managing, and maintaining data stores",
                            concept: "Provisioning tables, managing capacity (RCU/WCU or On-Demand), monitoring metrics.",
                            cases: "Switching a DynamoDB table to On-Demand mode for unpredictable traffic.",
                            distractors: "Manually scaling RCU/WCU when Auto Scaling is available; Ignoring CloudWatch metrics for throttled requests."
                        },
                        {
                            name: "Managing data lifecycles",
                            concept: "Automating data deletion or archival. DynamoDB TTL, S3 Lifecycle Policies.",
                            cases: "Setting a TTL attribute on DynamoDB items to auto-delete old sessions.",
                            distractors: "Writing a custom cron job to delete old S3 files (use Lifecycle Policies); Thinking DynamoDB TTL deletes items instantly (it happens within 48 hours)."
                        },
                        {
                            name: "Using data caching services",
                            concept: "ElastiCache (Redis/Memcached) and DAX (DynamoDB Accelerator).",
                            cases: "Using DAX to cache DynamoDB reads for a high-read application; Using Redis for a sorted leaderboard.",
                            distractors: "Using DAX for a write-heavy application (write-through overhead); Using Memcached when you need persistence or replication (Redis features)."
                        }
                    ]
                }
            ]
        }
    ]
}

function TopicItem({ item }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="mb-4 bg-black/20 rounded-xl overflow-hidden border border-white/5 transition-all hover:border-white/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <span className="font-semibold text-white/90">{item.name}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-accent`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <div className="p-4 pt-0 border-t border-white/10 bg-black/10">
                    <div className="mt-4 space-y-4">
                        <div>
                            <h5 className="text-sm font-bold text-accent mb-1 uppercase tracking-wide">Key Concept</h5>
                            <p className="text-sm text-white/80 leading-relaxed">{item.concept}</p>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-blue-400 mb-1 uppercase tracking-wide">Use Cases</h5>
                            <p className="text-sm text-white/80 leading-relaxed">{item.cases}</p>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-red-400 mb-1 uppercase tracking-wide">Exam Distractors</h5>
                            <p className="text-sm text-white/80 leading-relaxed">{item.distractors}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StudyMaterial() {
    const { slug } = useParams()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-primary text-white">
            <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">
                {/* Header */}
                <button
                    onClick={() => navigate(`/exam/${slug}`)}
                    className="back-button mb-4 sm:mb-6"
                >
                    ← Back to Exam Details
                </button>

                <h1 className="text-3xl font-bold mb-8">Study Material: AWS Developer Associate</h1>

                {/* Content Domain 1 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-accent">{studyData.title}</h2>

                    {studyData.tasks.map((task) => (
                        <div key={task.id} className="mb-10 last:mb-0">
                            <h3 className="text-xl font-bold mb-6 text-white/90 border-b border-white/10 pb-2">{task.title}</h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {task.sections.map((section, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10">
                                        <h4 className="font-bold mb-4 text-lg text-accent-light flex items-center gap-2">
                                            {section.type === 'Knowledge' ? '🧠' : '🛠️'} {section.type === 'Knowledge' ? 'Knowledge of:' : 'Skills in:'}
                                        </h4>

                                        <div>
                                            {section.items.map((item, itemIdx) => (
                                                <TopicItem key={itemIdx} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default StudyMaterial
