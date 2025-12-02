import React, { useState, useEffect } from 'react'
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
                            distractors: "Confusing Orchestration (central controller) with Choreography (distributed); Assuming Microservices always share a single database (they should have their own).",
                            quiz: [
                                {
                                    question: "Which architectural pattern involves sending a message to multiple destinations in parallel?",
                                    options: ["Choreography", "Orchestration", "Fanout", "Monolithic"],
                                    correct: 2
                                }
                            ]
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

function TopicItem({ item, isBookmarked, onToggleBookmark, onStartQuiz }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showFlashcard, setShowFlashcard] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const savedProgress = localStorage.getItem(`study-progress-${item.name}`)
        if (savedProgress) {
            setProgress(parseInt(savedProgress))
        }
    }, [item.name])

    const markAsStudied = () => {
        const newProgress = progress >= 100 ? 0 : 100
        setProgress(newProgress)
        localStorage.setItem(`study-progress-${item.name}`, newProgress.toString())
    }

    return (
        <div style={{
            marginBottom: '1rem',
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: `2px solid ${isOpen ? '#00D4AA' : '#e5e7eb'}`,
            transition: 'all 0.3s',
            boxShadow: isOpen ? '0 10px 25px rgba(0,212,170,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isOpen ? 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(0,168,132,0.05) 100%)' : 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <span style={{ 
                    fontWeight: '700', 
                    color: '#0A2540', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    fontSize: '1rem',
                    flex: 1
                }}>
                    {progress >= 100 ? '✅' : '📚'} {item.name}
                    {isBookmarked && <span style={{ color: '#f59e0b' }}>⭐</span>}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggleBookmark(item.name)
                        }}
                        style={{
                            fontSize: '1.25rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            padding: '0.25rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark this topic"}
                    >
                        {isBookmarked ? '⭐' : '☆'}
                    </button>
                    <span style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.3s',
                        color: '#00D4AA',
                        fontSize: '1.25rem'
                    }}>
                        ▼
                    </span>
                </div>
            </button>

            {isOpen && (
                <div style={{
                    padding: '0 1.25rem 1.25rem',
                    borderTop: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    animation: 'slideDown 0.3s ease'
                }}>
                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', margin: '1.25rem 0' }}>
                        <button
                            onClick={() => setShowFlashcard(true)}
                            style={{
                                padding: '0.875rem 1rem',
                                background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,212,170,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,212,170,0.4)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,212,170,0.3)'
                            }}
                        >
                            🃏 Flashcard
                        </button>
                        <button
                            onClick={() => onStartQuiz(item)}
                            style={{
                                padding: '0.875rem 1rem',
                                background: '#0A2540',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.background = '#1A3B5C'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.background = '#0A2540'
                            }}
                        >
                            📝 Quiz
                        </button>
                        <button
                            onClick={markAsStudied}
                            style={{
                                padding: '0.875rem 1rem',
                                background: progress >= 100 ? 'white' : 'rgba(0,212,170,0.1)',
                                color: progress >= 100 ? '#00D4AA' : '#00A884',
                                border: `2px solid ${progress >= 100 ? '#00D4AA' : 'rgba(0,212,170,0.3)'}`,
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)'
                                e.currentTarget.style.background = progress >= 100 ? '#f9fafb' : 'rgba(0,212,170,0.2)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.background = progress >= 100 ? 'white' : 'rgba(0,212,170,0.1)'
                            }}
                        >
                            {progress >= 100 ? '✓ Studied' : '☑ Mark'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            padding: '1.25rem',
                            background: 'white',
                            borderRadius: '0.75rem',
                            border: '2px solid rgba(0,212,170,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h5 style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#00D4AA',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                💡 Key Concept
                            </h5>
                            <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                                {item.concept}
                            </p>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'white',
                            borderRadius: '0.75rem',
                            border: '2px solid #bae6fd',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h5 style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#0369a1',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                ✅ Use Cases
                            </h5>
                            <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                                {item.cases}
                            </p>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'white',
                            borderRadius: '0.75rem',
                            border: '2px solid #fecaca',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h5 style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                ⚠️ Exam Distractors
                            </h5>
                            <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                                {item.distractors}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Flashcard Modal */}
            {showFlashcard && (
                <div className="modal-overlay" onClick={() => { setShowFlashcard(false); setIsFlipped(false); }}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => { setShowFlashcard(false); setIsFlipped(false); }}>
                            ×
                        </button>
                        <div className="modal-header">
                            <h2 className="modal-title">🃏 Flashcard: {item.name}</h2>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Click the card to flip</p>
                        </div>
                        
                        <div 
                            className="flashcard-container"
                            style={{
                                perspective: '1000px',
                                minHeight: '300px',
                                marginTop: '1.5rem'
                            }}
                        >
                            <div
                                onClick={() => setIsFlipped(!isFlipped)}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    minHeight: '300px',
                                    transformStyle: 'preserve-3d',
                                    transition: 'transform 0.6s',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Front of card */}
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    backfaceVisibility: 'hidden',
                                    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                                    borderRadius: '1rem',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', textAlign: 'center' }}>
                                        {item.name}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', marginTop: '1rem', opacity: 0.9 }}>
                                        Click to reveal answer
                                    </p>
                                </div>

                                {/* Back of card */}
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    background: 'white',
                                    borderRadius: '1rem',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    border: '2px solid #00D4AA',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    overflowY: 'auto',
                                    maxHeight: '500px'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>💡</div>
                                    <div style={{ color: '#0A2540', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                                        {item.concept}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="form-button"
                            >
                                {isFlipped ? '🔄 Flip Back' : '🔄 Flip Card'}
                            </button>
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
    const [bookmarkedTopics, setBookmarkedTopics] = useState([])
    const [quizItem, setQuizItem] = useState(null)
    const [quizAnswer, setQuizAnswer] = useState(null)
    const [showQuizResult, setShowQuizResult] = useState(false)
    const [filterBookmarked, setFilterBookmarked] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [studyStats, setStudyStats] = useState({ total: 0, completed: 0 })

    useEffect(() => {
        const saved = localStorage.getItem('bookmarked-topics')
        if (saved) {
            setBookmarkedTopics(JSON.parse(saved))
        }
        updateStudyStats()
    }, [])

    const updateStudyStats = () => {
        let total = 0
        let completed = 0
        studyData.tasks.forEach(task => {
            task.sections.forEach(section => {
                section.items.forEach(item => {
                    total++
                    const progress = localStorage.getItem(`study-progress-${item.name}`)
                    if (progress && parseInt(progress) >= 100) {
                        completed++
                    }
                })
            })
        })
        setStudyStats({ total, completed })
    }

    const toggleBookmark = (topicName) => {
        const newBookmarks = bookmarkedTopics.includes(topicName)
            ? bookmarkedTopics.filter(name => name !== topicName)
            : [...bookmarkedTopics, topicName]
        setBookmarkedTopics(newBookmarks)
        localStorage.setItem('bookmarked-topics', JSON.stringify(newBookmarks))
    }

    const startQuiz = (item) => {
        if (item.quiz && item.quiz.length > 0) {
            setQuizItem(item)
            setQuizAnswer(null)
            setShowQuizResult(false)
        }
    }

    const checkQuizAnswer = () => {
        setShowQuizResult(true)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
                {/* Header */}
                <button
                    onClick={() => navigate(`/exam/${slug}`)}
                    style={{
                        padding: '0.75rem 1.25rem',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(16px)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        transition: 'all 0.2s',
                        fontSize: '0.9375rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                    ← Back to Exam Details
                </button>

                {/* Title Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2.5rem',
                    padding: '2rem',
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'white',
                        marginBottom: '0.75rem'
                    }}>
                        📚 Interactive Study Material
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem' }}>
                        AWS Developer Associate Certification
                    </p>
                </div>

                {/* Stats & Controls */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {/* Progress Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(0,168,132,0.15) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(0,212,170,0.3)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#00D4AA' }}>
                            {studyStats.completed}/{studyStats.total}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                            Topics Completed
                        </div>
                        <div style={{
                            marginTop: '0.75rem',
                            height: '6px',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '9999px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${studyStats.total > 0 ? (studyStats.completed / studyStats.total) * 100 : 0}%`,
                                background: 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
                                transition: 'width 0.3s'
                            }}></div>
                        </div>
                    </div>

                    {/* Bookmarks Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
                            {bookmarkedTopics.length}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            Bookmarked Topics
                        </div>
                        <button
                            onClick={() => setFilterBookmarked(!filterBookmarked)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filterBookmarked ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)' : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: filterBookmarked ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {filterBookmarked ? '✓ Showing Bookmarked' : 'Show Bookmarked'}
                        </button>
                    </div>

                    {/* Search Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '1rem',
                        padding: '1.5rem'
                    }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🔍</div>
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '0.9375rem',
                                outline: 'none'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                                e.currentTarget.style.borderColor = '#00D4AA'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                            }}
                        />
                    </div>
                </div>

                {/* Content Domain */}
                <div style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    padding: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#0A2540',
                        marginBottom: '2rem',
                        paddingBottom: '1rem',
                        borderBottom: '3px solid #00D4AA'
                    }}>
                        {studyData.title}
                    </h2>

                    {studyData.tasks.map((task) => (
                        <div key={task.id} style={{ marginBottom: '3rem' }}>
                            <h3 style={{
                                fontSize: '1.375rem',
                                fontWeight: '700',
                                color: '#0A2540',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <span style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '700'
                                }}>
                                    {task.id.replace('task', '')}
                                </span>
                                {task.title}
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {task.sections.map((section, idx) => {
                                    const filteredItems = section.items.filter(item => {
                                        const matchesSearch = !searchTerm || 
                                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            item.concept.toLowerCase().includes(searchTerm.toLowerCase())
                                        const matchesBookmark = !filterBookmarked || bookmarkedTopics.includes(item.name)
                                        return matchesSearch && matchesBookmark
                                    })

                                    if (filteredItems.length === 0) return null

                                    return (
                                        <div key={idx} style={{
                                            background: section.type === 'Knowledge' 
                                                ? 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(0,168,132,0.05) 100%)'
                                                : 'linear-gradient(135deg, rgba(10,37,64,0.05) 0%, rgba(26,59,92,0.05) 100%)',
                                            borderRadius: '1rem',
                                            padding: '1.5rem',
                                            border: `2px solid ${section.type === 'Knowledge' ? 'rgba(0,212,170,0.2)' : 'rgba(10,37,64,0.2)'}`
                                        }}>
                                            <h4 style={{
                                                fontWeight: '700',
                                                marginBottom: '1.25rem',
                                                fontSize: '1.125rem',
                                                color: section.type === 'Knowledge' ? '#00D4AA' : '#0A2540',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                {section.type === 'Knowledge' ? '🧠' : '🛠️'} 
                                                {section.type === 'Knowledge' ? 'Knowledge of:' : 'Skills in:'}
                                            </h4>

                                            <div>
                                                {filteredItems.map((item, itemIdx) => (
                                                    <TopicItem 
                                                        key={itemIdx} 
                                                        item={item}
                                                        isBookmarked={bookmarkedTopics.includes(item.name)}
                                                        onToggleBookmark={toggleBookmark}
                                                        onStartQuiz={startQuiz}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quiz Modal */}
            {quizItem && quizItem.quiz && (
                <div className="modal-overlay" onClick={() => setQuizItem(null)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setQuizItem(null)}>×</button>
                        <div className="modal-header">
                            <h2 className="modal-title">📝 Quick Quiz: {quizItem.name}</h2>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <p style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#0A2540',
                                marginBottom: '1.5rem',
                                lineHeight: '1.6'
                            }}>
                                {quizItem.quiz[0].question}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {quizItem.quiz[0].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setQuizAnswer(idx)}
                                        disabled={showQuizResult}
                                        style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            background: showQuizResult
                                                ? (idx === quizItem.quiz[0].correct ? 'rgba(34,197,94,0.1)' : 
                                                   idx === quizAnswer ? 'rgba(239,68,68,0.1)' : 'white')
                                                : (quizAnswer === idx ? 'rgba(0,212,170,0.1)' : 'white'),
                                            border: showQuizResult
                                                ? (idx === quizItem.quiz[0].correct ? '2px solid #22c55e' :
                                                   idx === quizAnswer ? '2px solid #ef4444' : '1px solid #e5e7eb')
                                                : (quizAnswer === idx ? '2px solid #00D4AA' : '1px solid #e5e7eb'),
                                            borderRadius: '0.75rem',
                                            color: '#0A2540',
                                            cursor: showQuizResult ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9375rem',
                                            fontWeight: quizAnswer === idx ? '600' : '400'
                                        }}
                                    >
                                        {showQuizResult && idx === quizItem.quiz[0].correct && '✅ '}
                                        {showQuizResult && idx === quizAnswer && idx !== quizItem.quiz[0].correct && '❌ '}
                                        {option}
                                    </button>
                                ))}
                            </div>

                            {!showQuizResult ? (
                                <button
                                    onClick={checkQuizAnswer}
                                    disabled={quizAnswer === null}
                                    className="form-button"
                                    style={{ opacity: quizAnswer === null ? 0.5 : 1 }}
                                >
                                    Check Answer
                                </button>
                            ) : (
                                <div style={{
                                    padding: '1.25rem',
                                    background: quizAnswer === quizItem.quiz[0].correct 
                                        ? 'rgba(34,197,94,0.1)' 
                                        : 'rgba(239,68,68,0.1)',
                                    border: quizAnswer === quizItem.quiz[0].correct
                                        ? '2px solid #22c55e'
                                        : '2px solid #ef4444',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{
                                        fontSize: '1.125rem',
                                        fontWeight: '700',
                                        color: quizAnswer === quizItem.quiz[0].correct ? '#15803d' : '#991b1b',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {quizAnswer === quizItem.quiz[0].correct ? '🎉 Correct!' : '❌ Incorrect'}
                                    </p>
                                    <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: '1.6' }}>
                                        {quizItem.concept}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudyMaterial
