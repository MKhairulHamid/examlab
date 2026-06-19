// AWS Certified Generative AI Developer – Professional (AIP-C01) — Exam Prep Course
// ~19 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors sapC02Course.js / dvaC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 5 — Domain 1 (Foundation Model Integration, Data Management & Compliance) authored (s1–s6).
// D2 + D3 sessions land in Step 2; D4 + D5 + interactive widgets land in Step 3.

const aipC01Course = {
  slug: 'aip-c01',
  title: 'AWS Certified Generative AI Developer – Professional — Full Prep Course',
  code: 'AIP-C01',
  subtitle: 'Nineteen ~30-minute sessions covering all five domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 75 questions (65 scored + 10 unscored), 180 minutes, pass at 750/1000 (75%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Foundation Model Integration, Data Management & Compliance', weight: '31%' },
    { id: 'd2', label: 'Domain 2 · Implementation & Integration', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · AI Safety, Security & Governance', weight: '20%' },
    { id: 'd4', label: 'Domain 4 · Operational Efficiency & Optimization', weight: '12%' },
    { id: 'd5', label: 'Domain 5 · Testing, Validation & Troubleshooting', weight: '11%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — FOUNDATION MODEL INTEGRATION, DATA MANAGEMENT &
    //  COMPLIANCE (31%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.1',
      title: 'Designing GenAI Solutions From Business Requirements',
      duration: 30,
      summary: 'The Professional exam does not ask "what is a foundation model" — it hands you a business problem and asks for an architecture. This session builds the design discipline: translating requirements into an FM-backed architecture, proving feasibility with a focused proof-of-concept on Amazon Bedrock, and standardizing the build with the AWS Well-Architected Framework and its Generative AI Lens so the same patterns hold across many deployments.',
      objectives: [
        'Translate business needs and technical constraints into a concrete GenAI architecture (FM choice, integration pattern, deployment strategy)',
        'Decide when a problem warrants generative AI at all versus a deterministic or traditional ML approach',
        'Build a proof-of-concept on Amazon Bedrock to validate feasibility, performance, and business value before full build-out',
        'Apply the AWS Well-Architected Framework Generative AI Lens to standardize components across deployments',
        'Recognize the recurring GenAI solution archetypes — RAG, agents, summarization, classification, content generation',
      ],
      preLearningCheck: {
        question: 'A product team wants a customer-support assistant that answers questions using the company\'s private, frequently-updated knowledge base, with citations. Which solution archetype is the BEST starting point?',
        options: [
          'Fine-tune a foundation model on the knowledge base and redeploy it nightly',
          'Retrieval Augmented Generation (RAG) — retrieve relevant documents at query time and ground the model\'s answer in them',
          'Train a new model from scratch on the company corpus',
          'Use a deterministic keyword search and skip the foundation model entirely',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'From requirement to architecture — the Professional mindset',
          body: 'At the Practitioner level you learn what generative AI is. At the Professional level you are given a business outcome — "reduce ticket handling time," "draft compliant contracts," "let analysts query 10 years of filings in plain language" — and you must return an architecture that is feasible, responsible, and economical. The exam rewards the candidate who maps the requirement to the smallest sufficient pattern, not the one who reaches for the largest model every time.\n\nEvery design starts with three questions: (1) Is generative AI even the right tool, or would deterministic logic or traditional ML be cheaper and more reliable? (2) What does the model need that it was not trained on — private data, live data, the ability to act? (3) What are the non-functional constraints — latency, cost ceiling, data residency, accuracy bar, auditability? Those answers select the archetype.',
        },
        {
          heading: 'The recurring GenAI solution archetypes',
          body: 'Most exam scenarios reduce to one of a handful of patterns. Recognizing the archetype from the stem is half the battle.',
          table: {
            headers: ['Archetype', 'Use when', 'Core AWS building blocks'],
            rows: [
              ['Prompt-only generation', 'The base model already knows enough; you just need good instructions', 'Amazon Bedrock InvokeModel + prompt engineering'],
              ['Retrieval Augmented Generation (RAG)', 'Answers must be grounded in private or frequently-changing data, with citations', 'Bedrock Knowledge Bases, OpenSearch / Aurora pgvector, embeddings'],
              ['Agents / tool use', 'The model must take actions, call APIs, or reason over multiple steps', 'Bedrock Agents, Strands Agents, Step Functions, Lambda tools'],
              ['Fine-tuning / customization', 'You need a consistent style, domain vocabulary, or behavior the base model lacks', 'Bedrock custom models, SageMaker AI, LoRA adapters'],
              ['Multimodal extraction', 'Inputs are documents, images, audio — not just text', 'Bedrock multimodal models, Amazon Textract, Transcribe'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: "private data" + "must cite sources" + "data changes often" → RAG, almost never fine-tuning. Fine-tuning teaches style and behavior; it does not reliably teach fresh facts.' },
        },
        {
          heading: 'Validate with a proof-of-concept on Amazon Bedrock',
          body: 'A Professional architect does not commit to a full build before proving the hard parts. Amazon Bedrock makes a PoC fast: a single API surface to many foundation models, managed Knowledge Bases, Guardrails, and Agents, with no infrastructure to run. The PoC exists to retire risk, not to be production.',
          bullets: [
            'Prove feasibility — can any available FM actually do this task acceptably? Test 2–3 models through the same Bedrock API before designing around one.',
            'Prove performance characteristics — measure latency and token cost on representative inputs, not toy examples.',
            'Prove business value — define the success metric (deflection rate, accuracy, time saved) up front and measure it on the PoC.',
            'Keep it disposable — a PoC validates assumptions; production adds resilience, governance, monitoring, and CI/CD (covered in later sessions).',
          ],
        },
        {
          heading: 'Standardize with the Well-Architected Generative AI Lens',
          body: 'When you will run many GenAI workloads, ad-hoc designs do not scale. The AWS Well-Architected Framework gives six pillars (operational excellence, security, reliability, performance efficiency, cost optimization, sustainability), and the Generative AI Lens adds GenAI-specific guidance — model selection, prompt and RAG design, responsible AI, and cost control for token-based workloads.',
          bullets: [
            'Use the AWS Well-Architected Tool (with the Generative AI Lens) to review designs against a consistent checklist.',
            'Capture reusable components — a standard RAG ingestion pipeline, a Guardrails policy, a prompt template repository — so each new workload inherits proven patterns.',
            'Treat responsible AI and cost as first-class design constraints from day one, not retrofits — they are far cheaper to design in than to bolt on.',
          ],
          callout: { type: 'note', text: 'The Generative AI Lens is the standardization mechanism the exam expects when a scenario says "consistent implementation across multiple teams/deployments."' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A bank wants to extract specific fixed fields (account number, date, amount) from millions of scanned, structured forms with near-perfect accuracy and the lowest cost. Which approach is BEST?',
          options: [
            'A large general-purpose LLM with a carefully engineered prompt for every form',
            'Amazon Textract for structured document extraction, reserving an FM only for the genuinely unstructured parts',
            'Fine-tune a foundation model on the bank\'s forms',
            'Train a custom model from scratch on the form layouts',
          ],
          correct: 1,
          explainCorrect: 'Correct — for deterministic field extraction from structured forms, a purpose-built service like Amazon Textract is more accurate and far cheaper than an LLM. Generative AI is the wrong, more expensive tool for a well-bounded extraction task.',
          elaborativePrompt: 'Why is reaching for the biggest LLM often the wrong instinct at the Professional level? Think about cost, accuracy guarantees, and the maturity of purpose-built services.',
        },
        {
          afterSection: 3,
          question: 'A team will deploy a dozen GenAI workloads across several business units and wants every team to follow the same security, cost, and responsible-AI practices. Which AWS resource BEST enforces this consistency?',
          options: [
            'Let each team design independently and review at the end',
            'The AWS Well-Architected Tool with the Generative AI Lens, plus a shared library of reusable components',
            'A single shared foundation model that all teams must call',
            'Amazon CloudWatch dashboards for each workload',
          ],
          correct: 1,
          explainCorrect: 'Correct — the Well-Architected Generative AI Lens provides the consistent review checklist, and reusable standardized components (ingestion pipelines, Guardrails policies, prompt repositories) make the good patterns the default across teams.',
          elaborativePrompt: 'Why is standardizing components more durable than relying on each team\'s judgment? Consider what happens as the number of teams and workloads grows.',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague how you would decide, for a new business request, whether to use prompt-only generation, RAG, an agent, or fine-tuning — and what single piece of information most strongly points to RAG.',
      sample: {
        type: 'multiple-choice',
        stem: 'A legal firm wants an internal assistant that answers questions strictly from its own continuously-updated contract repository, must cite the exact source clause for every answer, and must never invent information. The firm needs a proof-of-concept quickly with minimal infrastructure. Which architecture BEST meets these requirements?',
        options: [
          'Fine-tune a foundation model on the contract repository and retrain it whenever contracts change',
          'Build a Retrieval Augmented Generation solution using Amazon Bedrock Knowledge Bases over the contract repository, returning source citations with each answer',
          'Prompt a large foundation model directly and rely on its training data to answer contract questions',
          'Train a custom language model from scratch on the firm\'s contracts',
        ],
        correct: 1,
        explanation: {
          summary: 'The requirements — answers grounded strictly in private, frequently-changing data, with exact source citations and no fabrication — define a Retrieval Augmented Generation (RAG) problem. Amazon Bedrock Knowledge Bases provides managed ingestion, embedding, vector storage, retrieval, and built-in source attribution, making it the fastest low-infrastructure path to a grounded, citable PoC.',
          perOption: [
            'Fine-tuning teaches style and behavior, not reliable, current facts; it cannot guarantee citations and retraining on every contract change is slow and costly.',
            'Correct — RAG with Bedrock Knowledge Bases grounds every answer in the live repository and returns citations, exactly matching the requirements with minimal infrastructure.',
            'Relying on the base model\'s training data cannot answer questions about the firm\'s private contracts and is prone to hallucination — the opposite of the requirement.',
            'Training from scratch is enormously expensive, slow, and unnecessary; it still would not provide citations or stay current as contracts change.',
          ],
          link: 'D1 · Task 1.1 — Analyze requirements and design GenAI solutions (archetype selection, RAG, Bedrock Knowledge Bases)',
        },
      },
      videos: [
        {
          videoId: '_vdK5PgcNvc',
          title: 'Introducing Amazon Bedrock',
          channel: 'Amazon Web Services',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Overview of the managed FM platform that underpins almost every architecture in this course — companion to all sessions.',
        },
        {
          videoId: 'qYNweeDHiyU',
          title: 'AI, Machine Learning, Deep Learning and Generative AI Explained',
          channel: 'IBM Technology',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Grounds the vocabulary for deciding when generative AI is the right tool versus traditional ML.',
        },
      ],
      keyTerms: [
        { term: 'Foundation model (FM)', def: 'A large model pre-trained on broad data that can be adapted to many downstream tasks via prompting, retrieval, or fine-tuning.' },
        { term: 'Solution archetype', def: 'A recurring GenAI design pattern — prompt-only, RAG, agents, fine-tuning, or multimodal extraction — that a requirement maps to.' },
        { term: 'Proof-of-concept (PoC)', def: 'A disposable build whose only job is to retire the riskiest assumptions (feasibility, performance, value) before full development.' },
        { term: 'Well-Architected Generative AI Lens', def: 'AWS guidance that extends the six Well-Architected pillars with GenAI-specific best practices for model selection, RAG, responsible AI, and cost.' },
        { term: 'Amazon Bedrock', def: 'A fully managed service offering a single API to many foundation models, plus Knowledge Bases, Guardrails, Agents, and customization.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock', purpose: 'Single managed API to multiple foundation models; the fastest path to a GenAI proof-of-concept.' },
        { name: 'Amazon Bedrock Knowledge Bases', purpose: 'Managed RAG — ingestion, embeddings, vector storage, retrieval, and source citations.' },
        { name: 'AWS Well-Architected Tool (Generative AI Lens)', purpose: 'Consistent design review checklist that standardizes GenAI workloads across teams.' },
        { name: 'Amazon Textract', purpose: 'Purpose-built document/field extraction — often a cheaper, more accurate choice than an LLM for structured forms.' },
        { name: 'Amazon SageMaker AI', purpose: 'Build, fine-tune, and host models when an architecture genuinely needs customization beyond Bedrock.' },
      ],
      examTips: [
        'Private data + must cite sources + data changes often → RAG, not fine-tuning.',
        'Fine-tuning teaches style/behavior, not fresh facts — never the answer for "keep answers current."',
        'A deterministic, well-bounded task (structured extraction, lookups) → purpose-built service (Textract), not an LLM.',
        '"Consistent implementation across many teams/deployments" → Well-Architected Generative AI Lens + reusable components.',
        'A PoC exists to retire risk (feasibility, performance, value); it is disposable, not production.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.2',
      title: 'Selecting, Switching, and Customizing Foundation Models',
      duration: 30,
      summary: 'Choosing a model is a recurring Professional decision: which FM fits the task, how to swap models without rewriting code, how to keep serving when a model or Region is unavailable, and how to deploy a customized model with a real lifecycle. This session builds the selection criteria, the abstraction layer for dynamic model switching, the resilience patterns, and the customization/deployment story with SageMaker and LoRA.',
      objectives: [
        'Choose a foundation model from benchmarks, capability fit, modality, context window, latency, and cost — not reputation',
        'Design an abstraction layer (Lambda, API Gateway, AppConfig) that lets you switch models or providers without code changes',
        'Build resilience with Bedrock Cross-Region Inference, circuit breakers, and graceful degradation',
        'Deploy and manage customized FMs with SageMaker AI, parameter-efficient adaptation (LoRA), and SageMaker Model Registry',
        'Apply versioning, automated deployment, rollback, and retirement to model lifecycle management',
      ],
      preLearningCheck: {
        question: 'A production app calls one foundation model by hardcoding its model ID throughout the codebase. The team now wants to A/B test a cheaper model and switch providers without redeploying application code. What should they have done?',
        options: [
          'Add more if/else branches in the application for each model',
          'Place model selection behind an abstraction layer driven by runtime configuration (e.g. AWS AppConfig) so the model can change without code changes',
          'Fine-tune the original model so switching is never needed',
          'Hardcode the new model ID and redeploy every time',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Choosing a foundation model on evidence, not reputation',
          body: 'The exam expects model selection driven by the requirement. A larger or more famous model is not automatically correct — it is often slower and more expensive than the task needs. Evaluate candidates against the same representative inputs and score them on the dimensions that matter for the use case.',
          table: {
            headers: ['Selection dimension', 'What to ask'],
            rows: [
              ['Capability fit', 'Can it do the task at the required quality? Reasoning, coding, summarization, extraction differ by model.'],
              ['Modality', 'Text only, or image/audio/multimodal? The input type can eliminate most candidates immediately.'],
              ['Context window', 'Does the prompt + retrieved context + output fit? Long-document tasks need large context models.'],
              ['Latency', 'Interactive chat needs low latency; batch jobs can tolerate slower, cheaper models.'],
              ['Cost', 'Price per input/output token × expected volume. Often the deciding factor at scale.'],
              ['Customizability / availability', 'Can it be fine-tuned? Is it available in your Region, or only via cross-Region inference?'],
            ],
          },
          callout: { type: 'tip', text: 'Benchmark candidate models on YOUR representative data through one Bedrock API, then pick on measured capability-per-dollar — not on which model is most talked about.' },
        },
        {
          heading: 'Dynamic model switching — design for change',
          body: 'Models improve and prices change monthly. A Professional design never hardcodes a model ID across the codebase. Put model selection behind an abstraction so swapping a model, adding a provider, or running an A/B test is a configuration change, not a deployment.',
          interactive: 'model-selector',
          bullets: [
            'AWS Lambda as a thin inference proxy — application code calls one internal endpoint; Lambda resolves which FM to invoke.',
            'Amazon API Gateway in front of the proxy — gives a stable API contract, request validation, throttling, and routing.',
            'AWS AppConfig to store the active model mapping and roll out changes (and A/B splits) safely with validation and automatic rollback.',
            'Result: switching providers, upgrading model versions, or shifting traffic between models requires no application redeploy.',
          ],
        },
        {
          heading: 'Resilience — keep serving when a model or Region fails',
          body: 'Foundation models can be throttled, regionally limited, or temporarily unavailable. The exam tests whether your design degrades gracefully instead of failing hard.',
          table: {
            headers: ['Pattern', 'What it does'],
            rows: [
              ['Bedrock Cross-Region Inference', 'Automatically routes inference to other Regions to raise throughput and handle models with limited regional availability'],
              ['Circuit breaker (Step Functions / app logic)', 'Stops hammering a failing model after repeated errors and fails over to a fallback'],
              ['Fallback model cascade', 'On error or timeout, retry with a different (often smaller/cheaper) model so the user still gets an answer'],
              ['Graceful degradation', 'Return a reduced-quality but valid response (cached answer, simpler model, "try later") instead of an error'],
            ],
          },
          callout: { type: 'warning', text: 'A single model in a single Region is a single point of failure. If the stem stresses "continuous operation during disruptions," the answer adds cross-Region inference and/or a fallback model — not just retries against the same endpoint.' },
        },
        {
          heading: 'Customization and lifecycle — fine-tuned and domain-specific models',
          body: 'When prompting and RAG are not enough — you need a consistent house style, domain vocabulary, or a specialized behavior — you customize. But a customized model is software: it needs versioning, deployment automation, rollback, and retirement.',
          bullets: [
            'Parameter-efficient adaptation (LoRA, adapters) fine-tunes a small number of added weights instead of the whole model — far cheaper and faster than full fine-tuning, and easy to swap.',
            'Amazon SageMaker AI deploys domain-specific fine-tuned models as endpoints when you need full control beyond Bedrock\'s managed customization.',
            'SageMaker Model Registry versions models and gates promotion (e.g. require approval before a model reaches production).',
            'Automated deployment pipelines push new model versions; rollback strategies revert to the last known-good version on failed deployment.',
            'Lifecycle management retires and replaces models on a schedule so you are never serving a stale or unsupported model.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A real-time chat feature must keep responding even when its primary foundation model is being throttled or is unavailable in the current Region. Which combination BEST ensures continuous operation?',
          options: [
            'Increase the retry count against the same model and Region',
            'Use Amazon Bedrock Cross-Region Inference plus a fallback to a secondary model on repeated failures',
            'Cache every possible response in advance',
            'Move all traffic to a single larger model',
          ],
          correct: 1,
          explainCorrect: 'Correct — cross-Region inference handles regional unavailability and throttling, while a fallback model on repeated failure provides graceful degradation. Both remove the single point of failure that one model in one Region represents.',
          elaborativePrompt: 'Why do more retries against the same throttled endpoint usually make the situation worse rather than better? Think about what throttling is signaling.',
        },
        {
          afterSection: 3,
          question: 'A company must adapt a foundation model to its domain vocabulary cheaply and be able to roll back instantly if a new adapted version underperforms in production. Which approach BEST fits?',
          options: [
            'Full fine-tuning of the entire model for each update with no versioning',
            'Parameter-efficient adaptation (LoRA) with versions tracked in SageMaker Model Registry and an automated rollback to the last approved version',
            'Re-train the base model from scratch on each change',
            'Edit the prompt and hope the behavior generalizes',
          ],
          correct: 1,
          explainCorrect: 'Correct — LoRA adapts a small set of weights cheaply, the Model Registry versions each adapted model and gates promotion, and an automated rollback to the last approved version handles a bad deployment safely.',
          elaborativePrompt: 'Why is parameter-efficient adaptation easier to roll back and swap than full fine-tuning? Consider what artifact actually changes between versions.',
        },
      ],
      selfExplanationPrompt: 'Explain why putting model selection behind an abstraction layer (Lambda + AppConfig) is a Professional-level requirement rather than a nice-to-have, and what it lets you do that hardcoding a model ID does not.',
      sample: {
        type: 'multiple-choice',
        stem: 'A SaaS company invokes a foundation model from application code that hardcodes the model ID in dozens of places. Leadership wants to continuously evaluate newer and cheaper models, run A/B tests in production, and switch providers — all without redeploying the application. Which design BEST achieves this?',
        options: [
          'Add configuration flags in code for each model and redeploy when a flag changes',
          'Route all FM calls through a Lambda inference proxy behind API Gateway, with the active model and A/B split stored in AWS AppConfig',
          'Fine-tune the current model so the team never needs to switch',
          'Create a separate copy of the application for each candidate model',
        ],
        correct: 1,
        explanation: {
          summary: 'An abstraction layer decouples application code from any specific model. A Lambda inference proxy resolves which FM to call, API Gateway gives a stable contract with validation and throttling, and AWS AppConfig holds the active model mapping and A/B split so changes (and safe rollouts with automatic rollback) happen as configuration — never as an application redeploy.',
          perOption: [
            'Configuration flags in code still require a redeploy to change, which is exactly what the requirement forbids.',
            'Correct — the Lambda + API Gateway + AppConfig pattern makes model selection and A/B testing a runtime configuration change with no application redeploy.',
            'Fine-tuning locks the team to one model and does nothing to enable provider switching or A/B testing of newer models.',
            'Forking the application per model multiplies maintenance and still requires deployments to shift traffic.',
          ],
          link: 'D1 · Task 1.2 — Select and configure FMs (abstraction layers, dynamic model switching, AppConfig)',
        },
      },
      videos: [
        {
          videoId: '_vdK5PgcNvc',
          title: 'Introducing Amazon Bedrock',
          channel: 'Amazon Web Services',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Shows the single-API access to many models that makes evidence-based selection and switching practical.',
        },
      ],
      keyTerms: [
        { term: 'Context window', def: 'The maximum number of tokens (prompt + retrieved context + output) a model can process in one request.' },
        { term: 'Abstraction layer', def: 'A proxy (e.g. Lambda + API Gateway) that decouples application code from any specific model, enabling config-driven switching.' },
        { term: 'AWS AppConfig', def: 'A service for storing and safely rolling out runtime configuration — used here to change the active model without redeploying code.' },
        { term: 'Cross-Region Inference', def: 'Amazon Bedrock capability that routes inference across Regions to raise throughput and handle limited regional model availability.' },
        { term: 'LoRA (low-rank adaptation)', def: 'A parameter-efficient fine-tuning technique that trains a small set of added weights instead of the whole model.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock', purpose: 'Access many FMs through one API; supports Cross-Region Inference for resilience and throughput.' },
        { name: 'AWS Lambda', purpose: 'Thin inference proxy that resolves and invokes the active model behind a stable internal endpoint.' },
        { name: 'Amazon API Gateway', purpose: 'Stable API contract in front of the proxy with request validation, throttling, and routing.' },
        { name: 'AWS AppConfig', purpose: 'Stores the active model mapping and A/B split; rolls changes out safely with validation and rollback.' },
        { name: 'Amazon SageMaker AI + Model Registry', purpose: 'Deploys customized/fine-tuned models and versions them with approval gates and rollback.' },
      ],
      examTips: [
        'Switch models/providers without redeploying → abstraction layer (Lambda + API Gateway) driven by AppConfig.',
        'Continuous operation during model/Region disruption → Bedrock Cross-Region Inference + fallback model, not just more retries.',
        'Cheap, swappable, reversible customization → LoRA/parameter-efficient adaptation, versioned in SageMaker Model Registry.',
        'Pick a model on measured capability-per-dollar for the task — bigger/famous is not automatically better.',
        'A single model in a single Region is a single point of failure.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.3',
      title: 'Data Validation and Processing Pipelines for FM Consumption',
      duration: 30,
      summary: 'Foundation models are only as good as what you feed them. This session covers building data validation workflows that gate quality before ingestion, processing pipelines for text, image, audio, and tabular inputs, formatting data to each model\'s exact API contract, and enhancing input quality so responses are consistent. Garbage in is the most common, least glamorous cause of bad GenAI output.',
      objectives: [
        'Build data validation workflows that enforce quality standards before data reaches a foundation model',
        'Process multimodal inputs — text, image, audio, tabular — with the right service for each type',
        'Format input data to model-specific requirements (JSON for Bedrock, structured payloads for SageMaker endpoints, conversation formatting)',
        'Enhance input data quality (reformatting, entity extraction, normalization) to improve response consistency',
        'Recognize when a data-quality problem — not the model — is the root cause of poor output',
      ],
      preLearningCheck: {
        question: 'A RAG pipeline ingests thousands of documents nightly. Some are malformed, empty, or duplicated, and answer quality has degraded. What is the BEST first control to add?',
        options: [
          'Switch to a larger foundation model',
          'A data validation step (e.g. AWS Glue Data Quality) that checks completeness, format, and duplicates before documents are embedded and indexed',
          'Increase the model\'s temperature',
          'Add more documents to dilute the bad ones',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Why data quality is the hidden determinant of FM output',
          body: 'A foundation model faithfully reflects what it is given. If the retrieved context is malformed, duplicated, stale, or off-topic, the model produces confident but wrong answers — and teams waste weeks blaming the model. The Professional discipline is to gate data quality before it reaches the model, the same way you would validate input to any production system.\n\nValidation is not a one-time cleanup; it is a continuous workflow that runs on every ingestion, emits metrics, and can quarantine bad records so they never pollute the vector store or the prompt.',
        },
        {
          heading: 'Building data validation workflows',
          body: 'Validation enforces measurable quality rules and surfaces failures as metrics you can alarm on.',
          table: {
            headers: ['Service', 'Role in validation'],
            rows: [
              ['AWS Glue Data Quality', 'Define and run quality rules (completeness, uniqueness, format, freshness) on data in your lake/catalog before ingestion'],
              ['SageMaker Data Wrangler', 'Visually profile, clean, and transform datasets; detect anomalies and missing values before use'],
              ['Custom AWS Lambda functions', 'Lightweight, event-driven checks (schema validation, deduplication, PII screening) on individual records'],
              ['Amazon CloudWatch metrics', 'Track data-quality KPIs over time and alarm when failure rates spike'],
            ],
          },
          callout: { type: 'tip', text: 'Exam signal: degraded answer quality + "documents are malformed/duplicated/stale" → add validation (Glue Data Quality) upstream, not a bigger model downstream.' },
        },
        {
          heading: 'Processing multimodal inputs',
          body: 'Real pipelines ingest more than clean text. Each input type has a purpose-built processing path before it becomes model-ready.',
          table: {
            headers: ['Input type', 'Processing path'],
            rows: [
              ['Text documents', 'Clean, normalize, chunk; embed for retrieval (covered next session)'],
              ['Images', 'Bedrock multimodal models for understanding/description; Amazon Rekognition for detection/labels'],
              ['Audio', 'Amazon Transcribe to convert speech to text, then treat as text'],
              ['Scanned documents / forms', 'Amazon Textract to extract text, tables, and key-value pairs'],
              ['Tabular / large-scale batch', 'SageMaker Processing jobs for heavy, distributed transformation'],
            ],
          },
        },
        {
          heading: 'Formatting input to the model\'s contract',
          body: 'Each model and endpoint expects a specific request shape. A correct payload is part of integration, not an afterthought.',
          bullets: [
            'Amazon Bedrock expects JSON request bodies whose structure depends on the model provider — match the provider\'s schema exactly.',
            'SageMaker AI endpoints expect the content type and structure the deployed model was built for.',
            'Dialog applications need conversation formatting (roles, turn history) so the model has the right context.',
            'Malformed or mis-shaped payloads cause integration errors and silently truncated context — a frequent troubleshooting topic (see Domain 5).',
          ],
        },
        {
          heading: 'Enhancing input quality for better responses',
          body: 'Beyond rejecting bad data, you can actively improve good data so the model performs more consistently.',
          bullets: [
            'Use Amazon Bedrock to reformat or summarize messy text into a clean, consistent structure before the main prompt.',
            'Use Amazon Comprehend to extract entities and key phrases, enriching the context with structured signals.',
            'Use Lambda to normalize data — consistent units, dates, casing, and encoding — so the model is not distracted by surface noise.',
            'Consistent, well-structured input reduces variance in output far more reliably than tweaking inference parameters.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A support assistant must ingest recorded customer phone calls so their content can be searched and summarized by a foundation model. Which processing path is correct?',
          options: [
            'Feed the raw audio files directly to a text foundation model',
            'Use Amazon Transcribe to convert speech to text, then process the transcript like any other text input',
            'Use Amazon Textract on the audio files',
            'Store the audio in S3 and query it with SQL',
          ],
          correct: 1,
          explainCorrect: 'Correct — audio must first become text. Amazon Transcribe performs speech-to-text, after which the transcript flows through the normal text pipeline (validation, chunking, embedding).',
          elaborativePrompt: 'Why must each modality be converted to a representation the model accepts before it reaches the FM? Think about what a text model can and cannot consume.',
        },
        {
          afterSection: 4,
          question: 'Responses from a RAG system are inconsistent because source documents use mixed date formats, units, and casing. Which action MOST directly improves consistency?',
          options: [
            'Raise the model temperature for more variety',
            'Normalize the input data (units, dates, casing, encoding) with Lambda before embedding and prompting',
            'Add more documents to the index',
            'Switch to a multiple-response prompt',
          ],
          correct: 1,
          explainCorrect: 'Correct — normalizing surface noise so inputs are consistent reduces output variance far more reliably than changing inference parameters. The root cause is the data, not the model.',
          elaborativePrompt: 'Why does cleaning input data usually beat tuning inference parameters when output is inconsistent? Consider where the variance is actually coming from.',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate why "the model is bad" is often the wrong diagnosis, and how a validation-and-normalization pipeline addresses the more common real cause of poor GenAI output.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company\'s RAG-based knowledge assistant has seen answer quality decline. Investigation shows the nightly ingestion loads thousands of documents, some empty, some duplicated, and some with broken formatting, directly into the vector store. Which change BEST addresses the root cause?',
        options: [
          'Replace the foundation model with a larger one',
          'Insert an AWS Glue Data Quality validation stage that enforces completeness, format, and de-duplication rules before documents are embedded and indexed, with failures tracked in CloudWatch',
          'Increase the number of retrieved chunks per query',
          'Raise the temperature so the model is more creative',
        ],
        correct: 1,
        explanation: {
          summary: 'The root cause is poor input data reaching the vector store — empty, duplicated, and malformed documents. A validation stage (AWS Glue Data Quality) that enforces completeness, format, and uniqueness before embedding prevents bad data from polluting retrieval, and CloudWatch metrics make ongoing quality observable. No model change can compensate for bad inputs.',
          perOption: [
            'A larger model still retrieves and reasons over the same polluted data; it cannot fix garbage input.',
            'Correct — validating and de-duplicating data before ingestion removes the actual cause of degraded retrieval and answers.',
            'Retrieving more chunks pulls in more of the same bad data, often making answers worse.',
            'Temperature controls randomness, not correctness; raising it increases variability without fixing the data.',
          ],
          link: 'D1 · Task 1.3 — Data validation and processing pipelines (Glue Data Quality, ingestion gating)',
        },
      },
      videos: [
        {
          videoId: '_vdK5PgcNvc',
          title: 'Introducing Amazon Bedrock',
          channel: 'Amazon Web Services',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Context for how formatted inputs flow into Bedrock models and Knowledge Bases.',
        },
      ],
      keyTerms: [
        { term: 'Data validation workflow', def: 'An automated, repeatable process that enforces quality rules (completeness, format, uniqueness, freshness) before data reaches a model.' },
        { term: 'AWS Glue Data Quality', def: 'A service to define and run data-quality rules on catalogued/lake data, gating bad records before ingestion.' },
        { term: 'Multimodal processing', def: 'Converting non-text inputs (image, audio, scanned forms) into model-consumable representations with purpose-built services.' },
        { term: 'Input normalization', def: 'Standardizing units, dates, casing, and encoding so surface noise does not increase model output variance.' },
        { term: 'Amazon Transcribe', def: 'Speech-to-text service that turns audio into text so it can flow through a text pipeline.' },
      ],
      awsServices: [
        { name: 'AWS Glue Data Quality', purpose: 'Enforce completeness, format, uniqueness, and freshness rules before data is ingested for FM use.' },
        { name: 'Amazon SageMaker Data Wrangler', purpose: 'Profile, clean, and transform datasets; detect anomalies before they reach the model.' },
        { name: 'Amazon Transcribe', purpose: 'Convert recorded audio to text for downstream processing.' },
        { name: 'Amazon Textract', purpose: 'Extract text, tables, and key-value pairs from scanned documents and forms.' },
        { name: 'Amazon Comprehend', purpose: 'Extract entities and key phrases to enrich and structure input context.' },
      ],
      examTips: [
        'Degraded answers + malformed/duplicated/stale documents → add validation upstream (Glue Data Quality), not a bigger model.',
        'Audio input → Amazon Transcribe first; scanned forms → Amazon Textract first; then treat as text.',
        'Inconsistent output from mixed formats → normalize input data, do not tune temperature.',
        'Bedrock requests are JSON shaped per model provider — match the provider schema exactly.',
        'Large-scale, distributed transformation → SageMaker Processing jobs.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.4',
      title: 'Designing Vector Store Solutions for FM Augmentation',
      duration: 30,
      summary: 'RAG lives or dies on its vector store. This session covers choosing a vector database architecture (Bedrock Knowledge Bases, OpenSearch with vectors, Aurora pgvector, DynamoDB), designing metadata frameworks that make retrieval precise and filterable, scaling with sharding and hierarchical indexing, and keeping the store current with maintenance and synchronization. This is the storage half of RAG; the retrieval half follows in the next session.',
      objectives: [
        'Choose a vector store — Bedrock Knowledge Bases, OpenSearch Service, Aurora pgvector, DynamoDB — based on scale, integration, and operational fit',
        'Design metadata frameworks (timestamps, authorship, domain tags) that enable filtered, context-aware retrieval',
        'Scale semantic search with OpenSearch sharding, multi-index, and hierarchical indexing strategies',
        'Integrate source systems — document stores, wikis, knowledge bases — into the vector pipeline',
        'Keep vector stores current with incremental updates, change detection, and scheduled refresh',
      ],
      preLearningCheck: {
        question: 'A team wants the fastest path to a managed RAG store that handles ingestion, embedding, vector storage, and retrieval without operating a database. Which option BEST fits?',
        options: [
          'Build a custom vector index on EC2 and manage it themselves',
          'Amazon Bedrock Knowledge Bases, which manages the end-to-end RAG vector pipeline',
          'Store embeddings as CSV files in Amazon S3',
          'Use Amazon RDS with no extensions',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'What a vector store does in RAG',
          body: 'RAG works by converting text into embeddings — numeric vectors that place semantically similar text near each other in high-dimensional space. At query time you embed the question and find the nearest document vectors, then feed those documents to the model as grounding context. The vector store is the database that holds those embeddings and answers nearest-neighbor queries fast. Choosing and designing it well is what makes retrieval relevant and scalable.',
          callout: { type: 'note', text: 'This session is the storage half of RAG. The next session covers retrieval mechanics — chunking, embedding models, hybrid search, and reranking.' },
        },
        {
          heading: 'Choosing a vector store',
          body: 'AWS offers a spectrum from fully managed to fully self-built. Match it to the requirement.',
          interactive: 'vector-store-selector',
          table: {
            headers: ['Option', 'Best when'],
            rows: [
              ['Amazon Bedrock Knowledge Bases', 'You want managed end-to-end RAG (ingest, embed, store, retrieve, cite) with minimal operations'],
              ['Amazon OpenSearch Service (vector engine + Neural plugin)', 'You need scale, hybrid keyword+vector search, and tight Bedrock integration'],
              ['Amazon Aurora with pgvector', 'Vectors should live alongside existing relational data and transactions'],
              ['Amazon DynamoDB (with vector capability)', 'You need serverless key-value scale for embeddings and metadata at very high request rates'],
              ['Amazon Neptune Analytics', 'Relationships between entities matter (graph + vector) for retrieval'],
            ],
          },
          callout: { type: 'tip', text: '"Managed RAG, minimal ops" → Bedrock Knowledge Bases. "Hybrid keyword+semantic at scale" → OpenSearch. "Vectors next to my relational data" → Aurora pgvector.' },
        },
        {
          heading: 'Metadata frameworks — precision and filtering',
          body: 'Raw vector similarity is not enough. Rich metadata lets you filter and rank retrieval so the model gets the right context, not just the semantically closest.',
          bullets: [
            'Attach timestamps so you can prefer recent documents and expire stale ones.',
            'Attach authorship and source attributes for trust, citation, and access control.',
            'Tag documents by domain/topic so queries can be scoped to the relevant corpus (e.g. "HR policies only").',
            'Use S3 object metadata and tagging systems as the source of truth that flows into the vector store\'s metadata fields.',
            'Metadata filtering at query time dramatically improves precision and enables per-user/per-tenant access control.',
          ],
        },
        {
          heading: 'Scaling semantic search',
          body: 'As corpora grow to millions of vectors, naive single-index search degrades. These techniques keep retrieval fast and relevant at scale.',
          bullets: [
            'OpenSearch sharding distributes the index across nodes so search scales horizontally.',
            'Multi-index approaches separate specialized domains (e.g. legal vs. support) so each search is smaller and more relevant.',
            'Hierarchical indexing organizes content by structure (section → subsection) so retrieval can narrow before it searches.',
            'Choose the approximate-nearest-neighbor (ANN) algorithm and parameters to trade recall against latency for your scale.',
          ],
        },
        {
          heading: 'Keeping the store current',
          body: 'A vector store that drifts out of date produces confidently wrong answers. Maintenance is part of the design.',
          bullets: [
            'Incremental update mechanisms add/modify only changed documents instead of full re-indexing.',
            'Real-time change detection (e.g. via DynamoDB Streams or S3 events) triggers re-embedding when source data changes.',
            'Scheduled refresh pipelines reconcile the store with sources on a cadence and remove deleted documents.',
            'Bedrock Knowledge Bases can re-sync from a source S3 bucket so the managed store reflects the latest data.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A multi-tenant SaaS app must ensure each customer\'s RAG queries only ever retrieve that customer\'s documents. What is the BEST design element to add to the vector store?',
          options: [
            'Rely on vector similarity alone to keep tenants separate',
            'Attach a tenant ID as metadata to every vector and filter on it at query time',
            'Use one larger foundation model',
            'Store all tenants in one index with no metadata',
          ],
          correct: 1,
          explainCorrect: 'Correct — tenant isolation in RAG is achieved with a metadata field (tenant ID) and metadata filtering at query time, so retrieval can never cross tenant boundaries. Similarity alone provides no isolation guarantee.',
          elaborativePrompt: 'Why can semantic similarity never guarantee tenant isolation on its own? Think about what determines whether two vectors are "close."',
        },
        {
          afterSection: 4,
          question: 'A knowledge base is updated continuously, but the RAG system keeps returning outdated answers. Which maintenance pattern BEST keeps the vector store current?',
          options: [
            'Re-index the entire corpus once a year',
            'Use real-time change detection (e.g. S3 events / DynamoDB Streams) to trigger incremental re-embedding of changed documents',
            'Increase the number of retrieved chunks',
            'Switch the embedding model',
          ],
          correct: 1,
          explainCorrect: 'Correct — change detection that triggers incremental re-embedding keeps the store synchronized with sources in near real time, so retrieval reflects the latest data. Annual re-indexing leaves long windows of stale answers.',
          elaborativePrompt: 'Why is incremental, event-driven updating preferable to periodic full re-indexing for a frequently-changing corpus? Consider cost and the staleness window.',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague why metadata is as important as the embeddings themselves in a production vector store, giving two concrete things metadata enables that pure similarity cannot.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is building a RAG assistant over a large, fast-changing internal documentation set. Requirements: minimal database operations, support for filtering retrieval by department and document recency, and the store must stay synchronized as documents change. Which design BEST meets these requirements?',
        options: [
          'Store embeddings as flat files in Amazon S3 and scan them at query time',
          'Use Amazon Bedrock Knowledge Bases backed by a managed vector store, attach department and timestamp metadata for filtering, and configure source synchronization so the store re-syncs as documents change',
          'Fine-tune the foundation model on all documentation and retrain weekly',
          'Keep all documents in a single OpenSearch index with no metadata and re-index annually',
        ],
        correct: 1,
        explanation: {
          summary: 'Bedrock Knowledge Bases provides a managed RAG vector pipeline (minimal operations), supports metadata so retrieval can filter by department and recency, and can re-sync from the source as documents change — matching every requirement. The other options either provide no real vector search, address the wrong technique, or fail the filtering and freshness requirements.',
          perOption: [
            'Flat files in S3 give no efficient nearest-neighbor search, no metadata filtering, and no synchronization — it does not scale or meet the requirements.',
            'Correct — managed Knowledge Bases with metadata filtering and source synchronization satisfies minimal-ops, filtering, and freshness together.',
            'Fine-tuning does not provide filtered retrieval or citations and cannot stay current with fast-changing docs without constant retraining.',
            'A single index with no metadata cannot filter by department or recency, and annual re-indexing leaves answers stale.',
          ],
          link: 'D1 · Task 1.4 — Design vector store solutions (Bedrock Knowledge Bases, metadata frameworks, synchronization)',
        },
      },
      videos: [
        {
          videoId: 'klTvEwg3oJ4',
          title: 'Vector databases are so hot right now. WTF are they?',
          channel: 'Fireship',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Fast, intuitive explanation of what vector databases are and why semantic search needs them.',
        },
        {
          videoId: '_vdK5PgcNvc',
          title: 'Introducing Amazon Bedrock',
          channel: 'Amazon Web Services',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Shows where Bedrock Knowledge Bases fits as a managed vector store for RAG.',
        },
      ],
      keyTerms: [
        { term: 'Embedding', def: 'A numeric vector representing the meaning of text/data so semantically similar items sit close together in vector space.' },
        { term: 'Vector store', def: 'A database that holds embeddings and answers nearest-neighbor (semantic similarity) queries efficiently.' },
        { term: 'Metadata filtering', def: 'Restricting retrieval by attributes (tenant, department, recency, author) attached to each vector, improving precision and enabling isolation.' },
        { term: 'pgvector', def: 'A PostgreSQL/Aurora extension that adds vector similarity search alongside relational data.' },
        { term: 'Incremental update', def: 'Re-embedding only changed documents (often event-driven) instead of re-indexing the whole corpus.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Knowledge Bases', purpose: 'Managed end-to-end RAG vector store with ingestion, embedding, retrieval, citations, and source sync.' },
        { name: 'Amazon OpenSearch Service', purpose: 'Scalable vector + keyword (hybrid) search with sharding and the Neural plugin for Bedrock integration.' },
        { name: 'Amazon Aurora (pgvector)', purpose: 'Vector similarity search alongside existing relational data and transactions.' },
        { name: 'Amazon DynamoDB', purpose: 'Serverless key-value scale for embeddings and metadata at very high request rates; Streams enable change detection.' },
        { name: 'Amazon S3', purpose: 'Source document repository and object metadata that feeds the vector store and drives synchronization.' },
      ],
      examTips: [
        'Managed RAG, minimal ops → Bedrock Knowledge Bases. Hybrid keyword+semantic at scale → OpenSearch. Vectors beside relational data → Aurora pgvector.',
        'Tenant/department isolation and recency filtering → metadata fields + metadata filtering, never similarity alone.',
        'Fast-changing corpus → event-driven incremental re-embedding (S3 events/DynamoDB Streams), not annual re-indexing.',
        'Scale single index → OpenSearch sharding, multi-index per domain, hierarchical indexing.',
        'This is the STORAGE half of RAG; retrieval mechanics (chunking, embeddings, reranking) are the next session.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s5',
      number: 5,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.5',
      title: 'Retrieval Mechanisms — Chunking, Embeddings, and Hybrid Search',
      duration: 30,
      summary: 'With the vector store in place, retrieval quality decides whether RAG answers are relevant. This session covers document chunking strategies, choosing and configuring embedding models, deploying vector search, improving relevance with hybrid search and rerankers, and advanced query handling — expansion, decomposition, transformation — plus consistent access patterns like function calling and the Model Context Protocol (MCP).',
      objectives: [
        'Choose a chunking strategy (fixed-size, hierarchical, semantic) appropriate to the content structure',
        'Select and configure an embedding model on dimensionality, domain fit, and performance',
        'Deploy vector search with OpenSearch, Aurora pgvector, or Bedrock Knowledge Bases',
        'Improve relevance with hybrid (keyword + vector) search and Bedrock reranker models',
        'Apply query expansion, decomposition, and transformation, and expose retrieval via function calling / MCP',
      ],
      preLearningCheck: {
        question: 'A RAG system retrieves chunks that are technically related but miss the precise answer, and very long documents get cut off mid-section. Which lever should you tune FIRST?',
        options: [
          'The foundation model\'s temperature',
          'The chunking strategy — chunk size and how documents are split for embedding and retrieval',
          'The number of foundation models in use',
          'The IAM permissions on the vector store',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Chunking — the most underrated RAG lever',
          body: 'Documents must be split into chunks before embedding, because you retrieve and inject chunks, not whole documents. Chunk too large and you waste context window and dilute relevance; chunk too small and you sever the context a passage needs to make sense. Chunking strategy often affects answer quality more than the choice of model.',
          table: {
            headers: ['Strategy', 'How it works', 'Best for'],
            rows: [
              ['Fixed-size chunking', 'Split every N tokens, often with overlap', 'Uniform text where structure does not matter much'],
              ['Hierarchical chunking', 'Split by document structure (section → paragraph), retrieving parents for context', 'Structured docs (manuals, contracts) where context matters'],
              ['Semantic chunking', 'Split at meaning boundaries so each chunk is a coherent idea', 'Mixed content where topic shifts should define boundaries'],
            ],
          },
          callout: { type: 'tip', text: 'Amazon Bedrock Knowledge Bases offers built-in chunking options (fixed, hierarchical, semantic); Lambda can implement custom chunking when content needs special handling.' },
        },
        {
          heading: 'Choosing an embedding model',
          body: 'The embedding model turns text into the vectors your store searches. It is a real design choice, separate from the generation model.',
          bullets: [
            'Dimensionality — higher dimensions can capture more nuance but cost more storage and compute; match it to the accuracy you actually need.',
            'Domain fit — an embedding model aligned to your domain (legal, code, multilingual) retrieves more relevantly than a generic one.',
            'Amazon Titan Text Embeddings (via Bedrock) is a common default; evaluate alternatives on your own retrieval metrics.',
            'Use Lambda to batch-generate embeddings during ingestion for cost and throughput efficiency.',
            'The embedding model used at ingestion MUST be the same one used at query time — mismatched embeddings break similarity.',
          ],
        },
        {
          heading: 'Hybrid search and reranking — raising relevance',
          body: 'Pure vector search can miss exact keywords (names, IDs, error codes) and sometimes ranks loosely-related text too high. Two techniques fix this.',
          interactive: 'hybrid-search',
          bullets: [
            'Hybrid search combines keyword (lexical/BM25) and vector (semantic) scoring, capturing both exact matches and meaning — OpenSearch supports this natively.',
            'Reranking runs a second, more precise model over the top-K retrieved chunks to reorder them by true relevance before they reach the FM — Amazon Bedrock offers reranker models.',
            'A typical high-relevance pipeline: retrieve broadly (hybrid) → rerank top-K → inject the best few chunks into the prompt.',
          ],
          callout: { type: 'note', text: 'Exam signal: "retrieves related but not the BEST passages" → add reranking. "Misses exact terms/IDs" → add hybrid (keyword + vector) search.' },
        },
        {
          heading: 'Advanced query handling',
          body: 'The user\'s raw question is often not the best search query. Transforming it improves what you retrieve.',
          bullets: [
            'Query expansion — use an FM to add synonyms/related terms so retrieval is not brittle to exact wording (Amazon Bedrock).',
            'Query decomposition — break a multi-part question into sub-queries, retrieve for each, then combine (Lambda / Step Functions).',
            'Query transformation — rewrite conversational questions into standalone, retrieval-friendly queries (Step Functions orchestration).',
          ],
        },
        {
          heading: 'Consistent access — function calling and MCP',
          body: 'Retrieval should be exposed to models and agents through standard interfaces so it plugs in consistently.',
          bullets: [
            'Function calling — define vector search as a tool the model can invoke when it needs grounding.',
            'Model Context Protocol (MCP) — a standardized way for clients/agents to query retrieval and other tools through a consistent contract.',
            'Standardized API patterns mean any application or agent augments with the same retrieval service rather than reimplementing it.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A RAG system over a software product\'s docs frequently fails to surface the exact error code a user pastes, even though it appears verbatim in the docs. Which improvement BEST addresses this?',
          options: [
            'Increase chunk size to include more text',
            'Use hybrid search that combines keyword (lexical) matching with vector similarity',
            'Raise the foundation model temperature',
            'Reduce the number of documents in the store',
          ],
          correct: 1,
          explainCorrect: 'Correct — pure semantic vectors can miss exact tokens like error codes. Hybrid search adds lexical keyword matching so verbatim terms are reliably retrieved alongside semantically similar content.',
          elaborativePrompt: 'Why can a purely semantic embedding under-retrieve an exact identifier even when it exists in the corpus? Think about what embeddings optimize for.',
        },
        {
          afterSection: 3,
          question: 'Retrieved chunks are on-topic but the single most relevant passage is often ranked below less useful ones, so the model\'s answer is weaker than the data supports. What BEST improves final relevance?',
          options: [
            'Add a Bedrock reranker model to reorder the top-K retrieved chunks by true relevance before prompting',
            'Switch to a smaller embedding model',
            'Remove metadata from the index',
            'Lower the number of retrieved chunks to one',
          ],
          correct: 0,
          explainCorrect: 'Correct — a reranker applies a more precise relevance model to the top-K candidates and reorders them, so the best passage reaches the FM first. This directly fixes "related but not best-ranked" retrieval.',
          elaborativePrompt: 'Why is a two-stage retrieve-then-rerank pipeline often better than trying to get ranking perfect in a single vector search? Consider the trade-off between recall and precision.',
        },
      ],
      selfExplanationPrompt: 'Explain to a teammate the full path a user question takes through a high-quality RAG retriever — query transformation, hybrid retrieval, reranking — and why each stage exists.',
      sample: {
        type: 'multiple-choice',
        stem: 'A RAG assistant over technical manuals must retrieve both conceptual explanations and exact part numbers, and developers complain that the single best passage is frequently not the top result. The team wants the highest retrieval relevance. Which combination BEST achieves this?',
        options: [
          'Pure vector search with a larger generation model',
          'Hybrid search (keyword + vector) to capture exact terms and meaning, followed by a Bedrock reranker that reorders the top-K results by relevance before prompting',
          'Fixed-size chunking with temperature set to zero',
          'Retrieve a single chunk per query to reduce noise',
        ],
        correct: 1,
        explanation: {
          summary: 'Two distinct problems need two techniques. Hybrid search combines lexical keyword matching (for exact part numbers) with vector similarity (for concepts), so both are retrieved. A reranker then applies a precise relevance model to the top-K candidates so the single best passage is surfaced first. Together they maximize retrieval relevance — a larger model or temperature changes do not address retrieval at all.',
          perOption: [
            'A larger generation model cannot improve what retrieval fails to surface; pure vector search still misses exact terms.',
            'Correct — hybrid retrieval captures exact terms and meaning, and reranking reorders the candidates so the best passage reaches the model first.',
            'Chunking and temperature do not address either the exact-term miss or the ranking problem.',
            'Retrieving one chunk increases the chance of missing the answer entirely; it reduces recall rather than improving relevance.',
          ],
          link: 'D1 · Task 1.5 — Design retrieval mechanisms (hybrid search, reranking, query handling)',
        },
      },
      videos: [
        {
          videoId: 'sVcwVQRHIc8',
          title: 'Learn RAG From Scratch',
          channel: 'freeCodeCamp.org',
          startSeconds: null,
          endSeconds: null,
          relevance: 'End-to-end walkthrough of retrieval mechanics — chunking, embeddings, retrieval, and generation.',
        },
        {
          videoId: 'ySus5ZS0b94',
          title: 'OpenAI Embeddings and Vector Databases Crash Course',
          channel: 'Adrian Twarog',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Concrete intuition for embeddings and similarity search that underpin retrieval quality.',
        },
      ],
      keyTerms: [
        { term: 'Chunking', def: 'Splitting documents into retrievable units before embedding; size and boundaries strongly affect answer quality.' },
        { term: 'Hybrid search', def: 'Combining lexical keyword scoring with vector similarity so both exact terms and meaning are retrieved.' },
        { term: 'Reranking', def: 'A second, more precise relevance pass over the top-K retrieved chunks to reorder them before prompting.' },
        { term: 'Query expansion / decomposition', def: 'Rewriting or breaking up a question to retrieve more relevant context than the raw query would.' },
        { term: 'Model Context Protocol (MCP)', def: 'A standardized protocol for clients/agents to access tools like retrieval through a consistent contract.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Knowledge Bases', purpose: 'Built-in chunking options and managed retrieval; integrates reranking and embeddings.' },
        { name: 'Amazon Titan Text Embeddings (Bedrock)', purpose: 'Embedding model that converts text to vectors for semantic search.' },
        { name: 'Amazon OpenSearch Service', purpose: 'Native hybrid (keyword + vector) search for high retrieval relevance at scale.' },
        { name: 'Amazon Bedrock (reranker models)', purpose: 'Reorders top-K retrieved chunks by true relevance before they reach the generation model.' },
        { name: 'AWS Step Functions / Lambda', purpose: 'Orchestrate query expansion, decomposition, and transformation pipelines.' },
      ],
      examTips: [
        'Misses exact terms/IDs → hybrid (keyword + vector) search. Retrieves related-but-not-best → add a reranker.',
        'Long docs cut off / context diluted → fix chunking (size, overlap, hierarchical) before blaming the model.',
        'The embedding model at ingestion must match the one at query time.',
        'Conversational/multi-part questions → query transformation/decomposition before retrieval.',
        'Expose retrieval as a tool via function calling / MCP for consistent reuse across apps and agents.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s6',
      number: 6,
      module: 'Domain 1 · Foundation Model Integration, Data Management & Compliance',
      domain: 'd1',
      weight: '31%',
      task: 'Task 1.6',
      title: 'Prompt Engineering Strategies and Governance',
      duration: 30,
      summary: 'Prompts are production code. This session covers building instruction frameworks that control model behavior, managing prompts as governed, versioned, approved assets with Amazon Bedrock Prompt Management, enforcing quality with regression testing, applying advanced techniques like chain-of-thought and structured output, and composing multi-step logic with Bedrock Prompt Flows. The shift is from "writing a clever prompt" to "operating a prompt system."',
      objectives: [
        'Build instruction frameworks (role definitions, output templates, Guardrails) that reliably control FM behavior',
        'Manage prompts as governed assets — parameterized templates, versioning, approval workflows — with Bedrock Prompt Management',
        'Enforce prompt quality with automated verification, edge-case testing, and regression detection',
        'Apply advanced techniques: chain-of-thought, structured input/output, and feedback loops',
        'Compose complex multi-step logic with Bedrock Prompt Flows (sequential chains, conditional branching, reusable components)',
      ],
      preLearningCheck: {
        question: 'A team edits production prompts directly in application code, with no versioning or review. A prompt change silently degraded output and they cannot tell what changed or roll back. What is the BEST practice they are missing?',
        options: [
          'Use a larger foundation model so prompts matter less',
          'Manage prompts as versioned, governed assets with approval workflows (e.g. Amazon Bedrock Prompt Management) and regression testing',
          'Set temperature to zero everywhere',
          'Stop using prompts and rely on fine-tuning only',
        ],
        correct: 1,
        note: 'Guess before reading — attempting retrieval first improves retention even when you are wrong.',
      },
      sections: [
        {
          heading: 'Prompts are production assets, not throwaway text',
          body: 'At the Professional level, a prompt that controls a customer-facing model is as critical as any deployed code. It must be versioned, reviewed, tested, and rollback-able. The recurring exam theme is governance: who can change a prompt, how is a change approved, how do you detect that a change regressed quality, and how do you revert. "Editing prompts live in code" is the anti-pattern the exam wants you to replace.',
        },
        {
          heading: 'Instruction frameworks — controlling behavior',
          body: 'Reliable behavior comes from structured instructions plus enforced guardrails, not from one long paragraph of hope.',
          bullets: [
            'Role definitions — tell the model who it is and its scope ("You are a support agent for product X; only answer from provided context").',
            'Output templates — specify the exact response format (sections, JSON schema) so downstream systems can parse it.',
            'Amazon Bedrock Prompt Management — store and parameterize these templates centrally so every app uses the approved version.',
            'Amazon Bedrock Guardrails — enforce responsible-AI rules (blocked topics, PII handling, denied content) independently of the prompt, so behavior holds even if the prompt is bypassed.',
          ],
          callout: { type: 'tip', text: 'Guardrails enforce policy regardless of the prompt; instruction templates shape behavior within policy. The exam expects both — Guardrails for safety, templates for format/role.' },
        },
        {
          heading: 'Prompt management and governance',
          body: 'Treat prompts with the same rigor as code: a repository, versions, approvals, and an audit trail.',
          interactive: 'prompt-governance',
          table: {
            headers: ['Capability', 'How AWS supports it'],
            rows: [
              ['Parameterized templates', 'Bedrock Prompt Management stores reusable templates with variables instead of copies scattered in code'],
              ['Versioning + approval', 'Promote prompt versions through approval workflows before they reach production'],
              ['Template repository', 'Store prompt assets (e.g. in Amazon S3) as a managed source of truth'],
              ['Usage tracking + audit', 'AWS CloudTrail records prompt-management actions; CloudWatch Logs capture access and invocation'],
            ],
          },
        },
        {
          heading: 'Quality assurance and regression testing',
          body: 'A prompt that worked yesterday can break after a change or a model update. Test prompts like code.',
          bullets: [
            'Use Lambda to assert expected outputs against a set of known inputs (a golden set).',
            'Use Step Functions to run edge-case suites systematically before promoting a prompt.',
            'Track prompt regression in CloudWatch — alarm when output quality metrics drop after a change.',
            'Gate promotion: a prompt version only reaches production if it passes the regression suite.',
          ],
        },
        {
          heading: 'Advanced techniques and Prompt Flows',
          body: 'Beyond basic instructions, structured techniques and composition handle sophisticated tasks.',
          bullets: [
            'Chain-of-thought — instruct the model to reason step by step before answering, improving complex reasoning quality.',
            'Structured input/output — provide clearly delimited components and require a specific output schema (e.g. JSON) for reliable parsing.',
            'Feedback loops — feed evaluation results back to refine prompts iteratively rather than guessing.',
            'Amazon Bedrock Prompt Flows — visually compose sequential prompt chains, conditional branching on model responses, reusable prompt components, and integrated pre/post-processing for multi-step tasks.',
          ],
          callout: { type: 'note', text: 'When a single prompt cannot handle a multi-step task with branching, the answer is Bedrock Prompt Flows (or an agent), not an ever-longer single prompt.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company must guarantee that a customer-facing assistant never discusses competitor products or returns PII, regardless of how users phrase their prompts or how the system prompt evolves. Which control BEST enforces this?',
          options: [
            'Add "do not discuss competitors or share PII" to the system prompt and hope it holds',
            'Apply Amazon Bedrock Guardrails to enforce denied topics and PII filtering independently of the prompt',
            'Lower the temperature to zero',
            'Use a longer prompt with more rules',
          ],
          correct: 1,
          explainCorrect: 'Correct — Guardrails enforce safety policy at the platform level, independent of the prompt, so the rules hold even if the prompt is changed or a user attempts to override it. Instructions in the prompt alone can be bypassed.',
          elaborativePrompt: 'Why is a platform-level guardrail more trustworthy than an instruction embedded in the prompt? Think about prompt injection and prompt drift over time.',
        },
        {
          afterSection: 3,
          question: 'After a model version upgrade, a previously reliable prompt started returning malformed JSON intermittently. Which practice would have caught this BEFORE production?',
          options: [
            'Manually eyeballing a few outputs',
            'An automated regression test suite (e.g. Lambda + Step Functions) that validates outputs against a golden set and gates promotion',
            'Increasing the max token limit',
            'Switching to a multiple-response prompt',
          ],
          correct: 1,
          explainCorrect: 'Correct — automated regression testing against known inputs/outputs, run as a promotion gate, detects format and quality regressions (including after model upgrades) before they reach users.',
          elaborativePrompt: 'Why should prompts have a regression suite that runs on model upgrades, not just on prompt edits? Consider that the model is also a dependency that changes.',
        },
      ],
      selfExplanationPrompt: 'Explain to a colleague why "prompt engineering" at the Professional level is really "prompt operations," and name three things you must do to a production prompt that you would never skip for production code.',
      sample: {
        type: 'multiple-choice',
        stem: 'An enterprise runs several GenAI applications whose prompts are currently hardcoded in each codebase. They need centralized, versioned prompt templates with an approval workflow before changes go live, an audit trail of who changed what, and automated checks that a new prompt version does not regress output quality. Which approach BEST meets these requirements?',
        options: [
          'Keep prompts in code but add comments describing each change',
          'Use Amazon Bedrock Prompt Management for parameterized, versioned templates with approval workflows, record changes via CloudTrail, and run an automated regression suite (Lambda + Step Functions) as a promotion gate',
          'Move all prompts into a single large system prompt shared by every app',
          'Replace prompting with fine-tuning so prompt governance is unnecessary',
        ],
        correct: 1,
        explanation: {
          summary: 'The requirements are prompt governance: centralized versioned templates, approval before production, an audit trail, and regression detection. Bedrock Prompt Management provides parameterized, versioned templates with approval workflows; CloudTrail supplies the audit trail; and an automated regression suite gated on promotion catches quality regressions. This treats prompts as governed production assets.',
          perOption: [
            'Comments in code provide neither versioned approval, an audit trail, nor regression testing — the core requirements.',
            'Correct — Prompt Management + approval workflows + CloudTrail auditing + a regression gate satisfies every stated requirement.',
            'One giant shared prompt increases coupling and risk and still lacks versioning, approvals, and regression testing.',
            'Fine-tuning does not eliminate prompts, and it provides none of the governance the requirements demand.',
          ],
          link: 'D1 · Task 1.6 — Prompt engineering strategies and governance (Bedrock Prompt Management, approval workflows, regression testing)',
        },
      },
      videos: [
        {
          videoId: '_vdK5PgcNvc',
          title: 'Introducing Amazon Bedrock',
          channel: 'Amazon Web Services',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Covers Bedrock features — Prompt Management, Guardrails, Prompt Flows — that operationalize prompts.',
        },
      ],
      keyTerms: [
        { term: 'Instruction framework', def: 'Structured prompt design (role, scope, output template) that reliably controls model behavior within policy.' },
        { term: 'Bedrock Prompt Management', def: 'A service to store, parameterize, version, and approve prompt templates centrally instead of hardcoding them.' },
        { term: 'Bedrock Guardrails', def: 'Platform-level controls that enforce denied topics, content filtering, and PII handling independently of the prompt.' },
        { term: 'Chain-of-thought', def: 'A technique instructing the model to reason step by step before answering, improving complex reasoning.' },
        { term: 'Bedrock Prompt Flows', def: 'A way to compose multi-step prompt logic — sequential chains, conditional branching, reusable components, pre/post-processing.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Prompt Management', purpose: 'Centralized, parameterized, versioned prompt templates with approval workflows.' },
        { name: 'Amazon Bedrock Guardrails', purpose: 'Enforce responsible-AI policy (denied topics, content filters, PII) independently of the prompt.' },
        { name: 'Amazon Bedrock Prompt Flows', purpose: 'Compose sequential/branching multi-step prompt logic with reusable components.' },
        { name: 'AWS Step Functions + Lambda', purpose: 'Run prompt regression suites and edge-case tests as a promotion gate.' },
        { name: 'AWS CloudTrail / CloudWatch Logs', purpose: 'Audit prompt-management actions and log prompt access and invocations.' },
      ],
      examTips: [
        'Hardcoded prompts in code → move to Bedrock Prompt Management (versioned, parameterized, approval workflow).',
        'Guarantee safety regardless of prompt/user input → Bedrock Guardrails (platform-level), not instructions in the prompt.',
        'Detect quality regressions before production → automated regression suite gating promotion; alarm in CloudWatch.',
        'Multi-step task with branching → Bedrock Prompt Flows (or an agent), not an ever-longer single prompt.',
        'Audit trail of prompt changes → CloudTrail; access/invocation logs → CloudWatch Logs.',
      ],
    },

  ],
}

export default aipC01Course
