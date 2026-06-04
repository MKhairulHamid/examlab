// AWS Certified AI Practitioner (AIF-C01) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement of
// the official AIF-C01 exam guide. Each session ends with a realistic,
// scenario-based sample exam question and a full explanation.
//
// Session schema (see .claude/skills/create-study-session.md for authoring guide):
// {
//   id, number, module, domain, weight, task, title, duration (minutes),
//   summary,
//   objectives: string[],
//   preLearningCheck: { question, options, correct, note }   — pre-test before content
//   selfExplanationPrompt: string                            — shown before sample question
//   sections: [{ heading, body?, bullets?, table?: {headers, rows}, callout?: {type, text} }],
//   keyTerms: [{ term, def }],
//   awsServices: [{ name, purpose }],
//   examTips: string[],
//   sample: {
//     type: 'multiple-choice' | 'multiple-response',
//     stem,
//     options: string[],
//     correct: number | number[],   // index, or array of indexes for multiple-response
//     explanation: { summary, perOption: string[], link }
//   }
// }

const aifC01Course = {
  slug: 'aif-c01',
  title: 'AWS Certified AI Practitioner — Full Prep Course',
  code: 'AIF-C01',
  subtitle: 'Sixteen 30-minute sessions covering every exam domain, each with a real exam-style question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 90 minutes, pass at 700/1000 (~70%). Compensatory scoring — no per-domain minimum.',
  modules: [
    { id: 'd1', label: 'Domain 1 · Fundamentals of AI & ML', weight: '20%' },
    { id: 'd2', label: 'Domain 2 · Fundamentals of Generative AI', weight: '24%' },
    { id: 'd3', label: 'Domain 3 · Applications of Foundation Models', weight: '28%' },
    { id: 'd4', label: 'Domain 4 · Guidelines for Responsible AI', weight: '14%' },
    { id: 'd5', label: 'Domain 5 · Security, Compliance & Governance', weight: '14%' },
    { id: 'exam', label: 'Exam Readiness', weight: '—' },
  ],

  sessions: [
    // ───────────────────────── DOMAIN 1 ─────────────────────────
    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Fundamentals of AI & ML',
      domain: 'd1',
      weight: '20%',
      task: 'Task 1.1',
      title: 'AI, ML & Deep Learning — Core Concepts',
      duration: 30,
      summary: 'Start from zero. We\'ll build the foundational vocabulary — AI, ML, deep learning, generative AI — through everyday stories before touching any exam definition.',
      objectives: [
        'Define AI, ML, deep learning, neural networks, NLP, and computer vision',
        'Distinguish AI vs ML vs deep learning vs generative AI vs agentic AI',
        'Explain training vs inferencing and the four inference types',
        'Identify learning methods (supervised, unsupervised, reinforcement) and data types',
      ],
      preLearningCheck: {
        question: 'Before we start — which statement best describes Machine Learning?',
        options: [
          'Software where a programmer writes every rule for every decision',
          'Software that learns patterns from data instead of being explicitly programmed',
          'A broader category that contains Artificial Intelligence inside it',
          'Another name for deep learning and neural networks',
        ],
        correct: 1,
        note: 'No pressure if you got that wrong — attempting the question before reading actually helps your brain prepare to absorb the answer. That\'s the point.',
      },
      sections: [
        {
          heading: 'You\'ve already been using AI for years',
          body: 'Netflix recommending what to watch. Spam never reaching your inbox. Your phone translating a photo of a menu in seconds. None of that is magic — it\'s software making decisions. That\'s AI in the wild.\n\nThis session pulls back the curtain. By the end, you\'ll have a clear mental model of what AI actually is, how machine learning fits inside it, and why the buzzwords — deep learning, generative AI, large language models — are not the same thing.',
        },
        {
          heading: 'The old way: writing every rule by hand',
          body: 'Before machine learning, software ran on hand-written rules. "If the email contains \'free\' and the sender is unknown, mark it as spam." Simple problems, reliable results.\n\nThe trouble: the world adapts. Spammers write "fr3e." New addresses appear daily. The rule book goes stale overnight.\n\nReal problems — recognising faces, understanding speech, predicting loan defaults — involve too many variables for any human to enumerate. A different approach was needed.',
        },
        {
          heading: 'The breakthrough: let the machine learn the rules',
          body: 'Machine learning flips the model. Instead of writing rules, you show the system thousands of examples and let it find patterns on its own.\n\nFeed it 100,000 spam emails and 100,000 legitimate ones — the system learns to tell them apart, discovering patterns a human might never think to look for. That\'s the core idea. Everything else in this session builds on it.',
        },
        {
          heading: 'How AI, ML, and deep learning fit together',
          body: 'These terms are not interchangeable — they nest inside each other like Russian dolls. Think family tree, not synonym list.',
          bullets: [
            'Artificial Intelligence (AI) — the broad field of making machines perform tasks that normally require human intelligence.',
            'Machine Learning (ML) — a subset of AI where systems learn patterns from data instead of being explicitly programmed.',
            'Deep Learning (DL) — a subset of ML that uses multi-layered neural networks; it\'s what powers vision, speech, and language tasks at scale.',
            'Generative AI (GenAI) — deep-learning models trained to create new content: text, images, audio, or code.',
            'Agentic AI — systems that use a model to plan, call external tools, and act autonomously toward a goal across multiple steps.',
          ],
          callout: { type: 'tip', text: 'Exam shortcut: if a question asks which term is the broadest, it\'s always AI. If it asks which is the most specialised subset, it\'s generative AI (or agentic AI for autonomous systems).' },
        },
        {
          heading: 'A few more terms you\'ll see on the exam',
          body: 'These building blocks appear across all five exam domains. Learn them once, use them everywhere.',
          bullets: [
            'Neural network — the underlying structure of most modern ML. Layers of connected "neurons" that learn weighted relationships in data, loosely inspired by the brain.',
            'Model — the trained artifact. It\'s the thing you actually use to make predictions. Think of it as the finished product.',
            'Algorithm — the procedure used during training. It\'s the recipe, not the cake.',
            'Computer vision (CV) — a branch of AI focused on interpreting images and video (e.g., detecting objects in a photo).',
            'Natural Language Processing (NLP) — understanding and generating human language (e.g., summarising a document, answering a question).',
            'Bias — systematic errors that produce unfair or skewed results, often because the training data wasn\'t representative.',
            'Overfitting — the model memorised the training data so well that it fails on new, unseen examples. Underfitting is the opposite: the model is too simple to capture real patterns.',
          ],
        },
        {
          heading: 'Studying vs. taking the test: training and inferencing',
          body: 'Imagine a student preparing for a maths exam. They work through hundreds of practice problems, building internal rules: "when I see this pattern, do this." That\'s training.\n\nExam day arrives. They apply those rules to problems they\'ve never seen before. That\'s inferencing.\n\nFor AI, training is the expensive phase where the model learns from data — it happens once (or periodically). Inferencing is using the finished model in production. The exam will ask you to match the right inference type to a given scenario.',
          table: {
            headers: ['Inference type', 'What it means', 'When to use it'],
            rows: [
              ['Real-time', 'Instant, synchronous response', 'Chatbot replies, fraud check at checkout — anything where the user is waiting'],
              ['Batch', 'Large volumes processed on a schedule', 'Nightly credit scoring, weekly product recommendations — latency doesn\'t matter'],
              ['Asynchronous', 'Request sent, result returned later', 'Large payloads or long-running jobs where you can\'t keep a connection open'],
              ['Serverless', 'No infrastructure to manage; scales to zero', 'Spiky or unpredictable traffic where you only pay for what you use'],
            ],
          },
        },
        {
          heading: 'Three ways a machine can learn',
          body: 'The exam will describe a scenario and ask you to pick the learning method. One question unlocks most of them: do we have labelled examples, or not?',
          bullets: [
            'Supervised learning — you provide labelled data: every input has a known correct answer. The model learns to map inputs to outputs. Used for classification (e.g., spam vs. not spam) and regression (e.g., predict tomorrow\'s sales figure).',
            'Unsupervised learning — no labels at all. The model explores the data and finds hidden structure on its own. Used for clustering (e.g., grouping customers by behaviour) and anomaly detection (e.g., spotting unusual network traffic).',
            'Reinforcement learning — no labelled dataset. An agent takes actions in an environment, receives rewards or penalties, and gradually learns a strategy. Think of it like training a dog: reward the right behaviour and it happens more often.',
          ],
          callout: { type: 'tip', text: 'The single most useful fact for Domain 1: supervised learning requires labelled data; unsupervised does not. This distinction alone resolves a large portion of the learning-method questions on the exam.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 3,
          question: 'A product manager says their new feature uses "deep learning." Based on the hierarchy, which statements are necessarily true?',
          options: [
            'The feature uses machine learning and is therefore also an AI system',
            'The feature is a type of generative AI',
            'The feature does not use machine learning — deep learning is a separate category',
            'Deep learning and machine learning are interchangeable terms',
          ],
          correct: 0,
          explainCorrect: 'Correct — the hierarchy nests: AI ⊃ ML ⊃ deep learning. Every deep learning system is also an ML system and an AI system by definition.',
          elaborativePrompt: 'Why does it matter that these terms nest inside each other rather than sit side by side? Think about what a product team might misunderstand if they treated "ML" and "deep learning" as synonyms.',
        },
        {
          afterSection: 5,
          question: 'A bank runs a nightly job that scores one million loan applications and flags high-risk ones. No customer is waiting for an instant result. Which inference type is the best fit?',
          options: [
            'Real-time inference',
            'Batch inference',
            'Serverless inference',
            'Asynchronous inference',
          ],
          correct: 1,
          explainCorrect: 'Correct — batch inference is designed for large volumes processed on a schedule where latency is not critical. The nightly timing and large volume are the giveaways.',
          elaborativePrompt: 'Why would real-time inference be the wrong choice here even if it technically could work? Think about cost, architecture complexity, and what "the customer is waiting" implies about system design.',
        },
        {
          afterSection: 6,
          question: 'A startup wants to group website visitors into segments by browsing behaviour, but they have no pre-defined segment names or labels. Which learning method applies?',
          options: [
            'Supervised learning with a classification model',
            'Supervised learning with a regression model',
            'Unsupervised learning with a clustering algorithm',
            'Reinforcement learning with a reward function',
          ],
          correct: 2,
          explainCorrect: 'Correct — no pre-defined labels means the model must discover natural groupings on its own. That is clustering, an unsupervised technique.',
          elaborativePrompt: 'Why does the absence of labels make supervised learning impossible here — not just inconvenient, but fundamentally incompatible? What would you actually need to collect to make supervised learning viable for this same problem?',
        },
      ],
      videos: [
        {
          videoId: 'qYNweeDHiyU',
          title: 'AI, Machine Learning, Deep Learning and Generative AI Explained',
          channel: 'IBM Technology',
          // Full video is relevant — covers the exact AI→ML→DL→GenAI hierarchy this session teaches.
          // startSeconds / endSeconds are optional; omit or set to null to play the full video.
          startSeconds: null,
          endSeconds: null,
          relevance: 'Explains the AI → ML → Deep Learning → Generative AI hierarchy covered in this session, with clear visual analogies.',
        },
      ],
      keyTerms: [
        { term: 'Training', def: 'The process of feeding labelled examples to a model so it can learn internal rules. Happens once (or periodically). Computationally expensive.' },
        { term: 'Inferencing', def: 'Using a finished, trained model to make predictions on new, unseen data. This is what happens in production.' },
        { term: 'Overfitting', def: 'The model memorised the training data — including its noise — and performs poorly on new examples.' },
        { term: 'Labeled data', def: 'A dataset where each example comes with the correct answer. Required for supervised learning.' },
        { term: 'Agentic AI', def: 'An AI system that can plan a sequence of steps, call external tools, and take autonomous actions toward a goal.' },
      ],
      awsServices: [],
      examTips: [
        '"Learns from data instead of being explicitly programmed" is the exam\'s definition of machine learning — watch for that phrase.',
        'Supervised = labeled data. Unsupervised = no labels. Reinforcement = rewards. These three map cleanly to problem types.',
        'When the exam describes spiky or unpredictable traffic, the answer for inference is almost always serverless.',
        'Batch inference = large volume + latency not critical. Real-time inference = someone is actively waiting for an answer.',
      ],
      selfExplanationPrompt: 'Before you try the practice question, think through this in your own words: a colleague asks you to explain the difference between supervised and unsupervised learning, and why that difference determines which one to use. How would you explain it without using the words "supervised" or "unsupervised"?',
      sample: {
        type: 'multiple-choice',
        stem: 'A retailer wants to group its customers into segments based on purchasing behavior. It has transaction data but no predefined segment labels. Which machine learning approach is most appropriate?',
        options: [
          'Supervised learning with a classification algorithm',
          'Unsupervised learning with a clustering algorithm',
          'Reinforcement learning with a reward function',
          'Supervised learning with a regression algorithm',
        ],
        correct: 1,
        explanation: {
          summary: 'No predefined labels means the model must discover natural groupings on its own — that\'s clustering, an unsupervised technique. The key signal in the question is "no predefined segment labels."',
          perOption: [
            'Classification is supervised and needs labelled examples of each segment. The retailer doesn\'t have those.',
            'Correct — clustering is unsupervised and finds natural groupings in unlabelled data. This is exactly the scenario described.',
            'Reinforcement learning is designed for sequential decision-making with rewards — not for segmenting a static dataset.',
            'Regression predicts a continuous numeric value like next month\'s revenue, not which group a customer belongs to.',
          ],
          link: 'Domain 1 · Task 1.1 — Learning methods',
        },
      },
    },
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Fundamentals of AI & ML',
      domain: 'd1',
      weight: '20%',
      task: 'Task 1.2',
      title: 'Practical AI Use Cases & AWS AI Services',
      duration: 30,
      summary: 'Recognise where AI/ML genuinely adds value, match the right technique to a business problem, and pick the correct AWS managed AI service without building a custom model.',
      objectives: [
        'Identify scenarios where AI/ML adds value vs where a simple rule suffices',
        'Match classification, regression, and clustering to business problems',
        'Select the correct AWS managed AI service for a given use case',
        'Decide when to use a pre-built service vs train a custom model',
      ],
      preLearningCheck: {
        question: 'When does AI/ML add the most value over a hand-written rule?',
        options: [
          'When the decision can be captured as a simple if/then condition',
          'When the problem involves complex patterns across large amounts of data',
          'When you need every prediction to be 100% auditable and deterministic',
          'When your dataset is small and errors are very costly',
        ],
        correct: 1,
        note: 'If you guessed wrong, that\'s fine — you\'ve just primed your brain to notice exactly this answer as you read. That\'s the whole point of the exercise.',
      },
      sections: [
        {
          heading: 'Not every problem needs a model',
          body: 'Picture this: a product manager walks into a meeting and says "can we use AI to send the right promotional email to the right customer?" Maybe — but the actual rule might be "send the discount email to anyone who hasn\'t bought in 90 days." That\'s a database query. No model required.\n\nThe quickest way to waste three months is to build an ML model for a problem that a simple rule already solves reliably. The first question to ask is always: could a human write the answer down in a sentence or two?',
        },
        {
          heading: 'When the switch flips — what makes AI worth it',
          body: 'AI earns its place when three things align: the patterns are too complex to enumerate by hand, there\'s enough data to reveal them, and predictions that are occasionally wrong are acceptable.\n\nIt falls short when the stakes demand 100% explainability, the dataset is tiny, or the cost of a wrong answer outweighs the automation gain. A fraud-detection model that flags 2% of legitimate transactions might be fine for a credit card company; the same error rate in medical diagnosis is a different conversation.',
        },
        {
          heading: 'Three techniques, three jobs',
          body: 'The exam will describe a business outcome and ask you to name the technique. One question cuts through most of them: what kind of answer does the business actually need?',
          table: {
            headers: ['Technique', 'Output type', 'Classic example'],
            rows: [
              ['Classification', 'A discrete label — this OR that', 'Spam vs. not-spam; fraud vs. legitimate; customer will churn vs. won\'t'],
              ['Regression', 'A continuous number', 'Predict next month\'s sales; estimate a house price; forecast daily demand'],
              ['Clustering', 'Natural groups — no labels given', 'Customer segmentation by behaviour; anomaly grouping; document topic discovery'],
            ],
          },
          callout: { type: 'tip', text: 'Classification = predict a category. Regression = predict a number. Clustering = discover groups with no labels. These three cover the majority of Domain 1 technique questions.' },
        },
        {
          heading: 'The AWS managed AI service catalogue',
          body: 'These are pre-trained APIs — you call them, they return results. No data labelling, no model training. Learn one job per service; the exam describes a scenario and you match it.',
          table: {
            headers: ['Service', 'One-line job'],
            rows: [
              ['Amazon Comprehend', 'NLP on text — sentiment, entities, key phrases, language, PII detection'],
              ['Amazon Transcribe', 'Speech → text (audio files or live streams)'],
              ['Amazon Polly', 'Text → lifelike speech'],
              ['Amazon Translate', 'Translate text between languages'],
              ['Amazon Lex', 'Build conversational chatbots (voice + text)'],
              ['Amazon Rekognition', 'Analyse images and video — objects, faces, content moderation'],
              ['Amazon Textract', 'Extract text and structured data from scanned documents and forms'],
              ['Amazon SageMaker AI', 'Build, train, tune, and deploy custom ML models'],
            ],
          },
        },
        {
          heading: 'Pre-built vs custom: when to train your own model',
          body: 'Managed services should be your first instinct. They\'re fast, cheap, and require no ML expertise. Only reach for SageMaker when the managed service genuinely can\'t do what you need.',
          bullets: [
            'Use a managed service when — the use case matches an existing API (text, speech, image, translation); you need to ship fast; no labelled training data is available.',
            'Train a custom model when — you need domain-specific knowledge the pre-built model doesn\'t have; you need explainability or regulatory control over the model itself; you\'re working with tabular/structured data requiring full pipeline control.',
            'Foundation models (via Amazon Bedrock) sit in the middle — broad knowledge, no training required, but require prompt engineering rather than API calls.',
          ],
          callout: { type: 'warning', text: 'Common trap: the exam describes a text/NLP task and lists SageMaker as an option. SageMaker is always more effort — pick Comprehend, Transcribe, or Lex if the managed service fits.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A supply chain team wants to predict exactly how many units of a product they will sell next month so they can order the right stock level. Which ML technique is most appropriate?',
          options: [
            'Classification — predict whether stock will run out or not',
            'Regression — predict the exact number of units',
            'Clustering — group products by sales behaviour',
            'Reinforcement learning — optimise the ordering strategy over time',
          ],
          correct: 1,
          explainCorrect: 'Correct — regression predicts a continuous number. "Exactly how many units" is a numerical forecast, which is precisely what regression is for.',
          elaborativePrompt: 'Why would classification be the wrong choice here, even if the team simplified the problem to "will we sell more or less than 10,000 units?" — what information would you lose, and does that matter for ordering stock?',
        },
        {
          afterSection: 3,
          question: 'A legal team needs to automatically extract party names, dates, and monetary values from thousands of scanned PDF contracts. Which AWS service handles this with the least custom work?',
          options: [
            'Amazon Comprehend',
            'Amazon Rekognition',
            'Amazon Textract',
            'Amazon Transcribe',
          ],
          correct: 2,
          explainCorrect: 'Correct — Textract is purpose-built to extract text and structured data from scanned documents and forms. Comprehend analyses text you\'ve already extracted; Textract does the extraction step itself.',
          elaborativePrompt: 'After Textract extracts the raw text from the PDFs, what would you use next if the team also wanted to classify the sentiment of each contract clause as favourable or unfavourable? Why does the pipeline need two services rather than one?',
        },
      ],
      videos: [
        {
          videoId: '6CFFFDpbPlA',
          title: 'Top 3 AWS AI Services You Need to Master',
          channel: 'Learn with Whiteboard',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Walks through key AWS AI service selection decisions — reinforces when to use a managed service versus building your own model.',
        },
      ],
      keyTerms: [
        { term: 'Classification', def: 'An ML technique that predicts a discrete label or category. Requires labelled training data.' },
        { term: 'Regression', def: 'An ML technique that predicts a continuous numeric value. Requires labelled training data.' },
        { term: 'Clustering', def: 'An unsupervised technique that discovers natural groups in data — no labels required.' },
        { term: 'Managed AI service', def: 'A pre-trained AWS API (e.g. Comprehend, Rekognition) you call without building or training a model.' },
        { term: 'Amazon Textract', def: 'Extracts text and structured data from scanned documents and forms — distinct from Comprehend, which analyses already-extracted text.' },
      ],
      awsServices: [
        { name: 'Amazon Comprehend', purpose: 'NLP — sentiment, entities, key phrases, PII detection on text' },
        { name: 'Amazon Transcribe', purpose: 'Convert speech audio to text' },
        { name: 'Amazon Polly', purpose: 'Convert text to lifelike speech' },
        { name: 'Amazon Translate', purpose: 'Neural machine translation between languages' },
        { name: 'Amazon Lex', purpose: 'Build conversational chatbots and voice interfaces' },
        { name: 'Amazon Rekognition', purpose: 'Analyse images and video — objects, faces, moderation' },
        { name: 'Amazon Textract', purpose: 'Extract text and structured data from scanned documents' },
        { name: 'Amazon SageMaker AI', purpose: 'Build, train, and deploy custom ML models end-to-end' },
      ],
      examTips: [
        'Sentiment / entity / key-phrase extraction from text → Amazon Comprehend.',
        'Speech audio → text → Amazon Transcribe. Text → spoken audio → Amazon Polly. Don\'t swap them.',
        'Scanned documents / PDFs → extract structured data → Amazon Textract (not Comprehend — that\'s for text already extracted).',
        'Custom training on company-specific data → Amazon SageMaker AI. Any pre-built service comes first if it fits.',
        'Foundation models with no training → Amazon Bedrock. Custom tabular ML → SageMaker.',
      ],
      selfExplanationPrompt: 'Before trying the practice question: a colleague suggests using Amazon SageMaker to detect the sentiment of customer reviews. Walk yourself through whether Amazon Comprehend would be the better first choice — and what the key deciding factor is.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company receives thousands of customer support emails daily and wants to automatically detect whether each message expresses a positive, negative, or neutral tone — with no model training. Which AWS service requires the least implementation effort?',
        options: [
          'Amazon Polly',
          'Amazon Transcribe',
          'Amazon Comprehend',
          'Amazon SageMaker AI',
        ],
        correct: 2,
        explanation: {
          summary: 'Detecting tone in text is sentiment analysis — a built-in capability of Amazon Comprehend that requires no model training. You call the API, it returns a sentiment label.',
          perOption: [
            'Polly converts text to lifelike speech. It produces audio output — it does not analyse tone.',
            'Transcribe converts speech audio to text. The input here is already text, so Transcribe adds nothing.',
            'Correct — Comprehend\'s sentiment analysis is a direct API call on text. Zero training required.',
            'SageMaker AI could technically build a custom sentiment model, but that\'s weeks of work. The question asks for least effort.',
          ],
          link: 'Domain 1 · Task 1.2 — AWS managed AI services',
        },
      },
    },
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Fundamentals of AI & ML',
      domain: 'd1',
      weight: '20%',
      task: 'Task 1.3',
      title: 'The ML Development Lifecycle & Metrics',
      duration: 30,
      summary: 'Walk the ML pipeline end-to-end — from business problem to production monitoring — and learn which metrics tell you whether the model is actually working.',
      objectives: [
        'Describe each stage of the ML development lifecycle in order',
        'Explain core MLOps concepts: experimentation, pipelines, monitoring, drift',
        'Distinguish accuracy, precision, recall, and F1 — and know when each one matters',
        'Explain why business metrics are the final judge of any ML system',
      ],
      preLearningCheck: {
        question: 'A fraud-detection model correctly catches 95% of real fraud, but it also wrongly flags 40% of legitimate transactions. Which metric best captures the problem with those false alarms?',
        options: [
          'Recall — measures how many real fraud cases are caught',
          'Accuracy — measures the overall fraction of correct predictions',
          'Precision — measures how many flagged transactions are actually fraudulent',
          'F1 score — the harmonic mean of precision and recall',
        ],
        correct: 2,
        note: 'Not sure? That\'s exactly what this session covers. By the end you\'ll be able to pick the right metric instantly — the pre-test just warms up that part of your brain.',
      },
      sections: [
        {
          heading: 'Every model starts as a business question',
          body: 'No one starts an ML project by downloading a dataset. They start with a problem: "Can we predict which customers are about to cancel?" That question determines what data you need, how you define success, and which metric matters at the end.\n\nThe gap between "we have a model" and "we solved the problem" is where most ML projects fail. A model that scores 99% accuracy on a test set but never moves a business metric is a failure — just an expensive-looking one.',
        },
        {
          heading: 'The pipeline: a relay race, not a single sprint',
          body: 'Building a model isn\'t one task — it\'s a chain of handoffs. Drop any one of them and the whole system breaks.\n\nData collected with the wrong signals cannot be fixed later by a better algorithm. A model trained on biased data will produce biased predictions at scale. A well-trained model deployed without monitoring will silently degrade as the world changes. Each stage sets the ceiling for every stage that follows.',
        },
        {
          heading: 'The eight stages in order',
          body: 'This is the sequence the exam expects you to know — and the order matters.',
          table: {
            headers: ['Stage', 'What happens'],
            rows: [
              ['1 · Business problem', 'Define the question and success criteria before touching data'],
              ['2 · Data collection', 'Gather raw data from the sources relevant to the problem'],
              ['3 · Data preparation', 'Clean, label, and split into train / validation / test sets'],
              ['4 · Feature engineering', 'Transform raw data into inputs the model can learn from'],
              ['5 · Model training', 'Feed the prepared data to the algorithm; it learns internal rules'],
              ['6 · Evaluation', 'Measure performance on held-out test data using the right metrics'],
              ['7 · Deployment', 'Expose the model as an API or batch job for real-world use'],
              ['8 · Monitoring → retrain', 'Watch for drift; trigger retraining when performance degrades'],
            ],
          },
        },
        {
          heading: 'MLOps: keeping models alive after launch',
          body: 'Training a model once is the easy part. Keeping it accurate for months or years is the hard part.',
          bullets: [
            'Experimentation & repeatability — track every experiment (data version, hyperparameters, results) so any run can be reproduced.',
            'Automated pipelines — remove manual steps that introduce error and slow retraining cycles.',
            'Model drift — the real world changes; yesterday\'s training data becomes today\'s stale signal. Monitoring detects this before it damages predictions.',
            'Retraining triggers — when monitoring flags drift, the pipeline re-runs from data preparation through deployment automatically.',
          ],
          callout: { type: 'tip', text: '"Drift detected → retrain" is the pattern the exam tests. If the question mentions model performance degrading over time, the answer involves monitoring and retraining — not rebuilding from scratch.' },
        },
        {
          heading: 'Metrics: measuring what actually matters',
          body: 'This is where most candidates lose points. Accuracy feels intuitive but is the most dangerous metric to trust alone.',
          table: {
            headers: ['Metric', 'What it measures', 'When it matters most'],
            rows: [
              ['Accuracy', 'Fraction of all predictions that are correct', 'Only reliable on balanced datasets — misleading when one class is rare'],
              ['Precision', 'Of everything predicted positive, how many truly are', 'Use when false positives are costly — spam filters, fraud alerts that block customers'],
              ['Recall', 'Of all real positives, how many did we catch', 'Use when false negatives are costly — disease screening, fraud that harms customers'],
              ['F1 score', 'Harmonic mean of precision and recall', 'Use when you need to balance both — no strong preference for one type of error'],
            ],
          },
          callout: { type: 'warning', text: 'Accuracy trap: if 1% of transactions are fraudulent, a model that predicts "not fraud" for every transaction scores 99% accuracy — but catches zero fraud. Always ask about class balance before trusting accuracy.' },
        },
        {
          heading: 'Business metrics: the final judge',
          body: 'Model metrics prove the system works technically. Business metrics prove it works for the organisation.\n\nA sentiment model with 90% accuracy that doesn\'t reduce customer churn has failed. Always connect the model metric to a downstream business outcome: cost per inference, customer satisfaction score, conversion rate, revenue impact.',
          bullets: [
            'Cost metrics — cost per inference, total development cost, ROI on the ML investment.',
            'Outcome metrics — customer churn rate, conversion rate, revenue per user, claims processed.',
            'Proxy metrics — model accuracy or F1 are proxies; business metrics are what stakeholders actually care about.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'A company discovers its recommendation model was trained on data that over-represents users aged 18–24. Older users are getting irrelevant suggestions. Which stage of the ML pipeline should be revisited first?',
          options: [
            'Stage 7 — Deployment: re-deploy with a different configuration',
            'Stage 5 — Model training: use a different algorithm',
            'Stage 3 — Data preparation: audit and rebalance the training data',
            'Stage 8 — Monitoring: add alerts for recommendation quality',
          ],
          correct: 2,
          explainCorrect: 'Correct — the problem is in the training data (it doesn\'t represent all user groups). No algorithm change or deployment fix will help if the data itself is biased. Data preparation is where this must be fixed.',
          elaborativePrompt: 'Why can\'t this be fixed at the monitoring stage (stage 8) instead — even though monitoring is where you\'d detect the problem? What does that tell you about the relationship between early pipeline stages and the quality ceiling of everything that follows?',
        },
        {
          afterSection: 4,
          question: 'A bank\'s fraud model is generating so many false alarms that customers are calling to complain their cards are blocked. The team wants to reduce customer complaints without rebuilding the model. Which metric should they optimise to address this?',
          options: [
            'Recall — to catch more actual fraud',
            'Accuracy — to improve overall prediction correctness',
            'Precision — to reduce the rate of wrongly flagged legitimate transactions',
            'F1 score — to balance both types of error equally',
          ],
          correct: 2,
          explainCorrect: 'Correct — false positives (legitimate transactions flagged as fraud) are causing the complaints. Precision measures "of all the transactions we flag, how many are actually fraudulent." Improving precision means fewer wrongly blocked cards.',
          elaborativePrompt: 'If the team boosts precision by raising the fraud-detection threshold, what happens to recall? And can you think of a real scenario where a bank would deliberately accept lower precision in order to protect recall — and why?',
        },
      ],
      videos: [
        {
          videoId: 'B0mVY_8JNG8',
          title: 'Confusion Matrix, Accuracy, Precision, Recall & F1 Score Explained',
          channel: 'codebasics',
          startSeconds: null,
          endSeconds: null,
          relevance: 'Visual walkthrough of the confusion matrix and all four evaluation metrics — exactly what this session covers, with clear numerical examples.',
        },
      ],
      keyTerms: [
        { term: 'MLOps', def: 'Practices for reliably building, deploying, and maintaining ML models in production — automation, monitoring, and retraining.' },
        { term: 'Model drift', def: 'Degradation of model accuracy as real-world data diverges from the training data over time.' },
        { term: 'Precision', def: 'True positives ÷ (true positives + false positives). High precision = few false alarms.' },
        { term: 'Recall', def: 'True positives ÷ (true positives + false negatives). High recall = few missed cases.' },
        { term: 'F1 score', def: 'Harmonic mean of precision and recall. Use when you need to balance both error types.' },
        { term: 'Feature engineering', def: 'Transforming raw data into inputs (features) the model can learn from effectively.' },
      ],
      awsServices: [
        { name: 'Amazon SageMaker AI', purpose: 'End-to-end ML lifecycle — build, train, evaluate, deploy, and monitor custom models' },
        { name: 'Amazon Bedrock', purpose: 'Managed access to foundation models via API — no training required' },
      ],
      examTips: [
        'Accuracy is misleading on imbalanced datasets → always ask "what fraction of the data is the positive class?"',
        '"Don\'t miss real cases" (disease, fraud harming customers) → maximise recall.',
        '"Don\'t flag innocent cases" (spam filter, fraud blocking customers) → maximise precision.',
        'Model performance degrades over time → the answer is monitoring detecting drift, then retraining — not rebuilding.',
        'Business problem is always stage 1 — before data, before training, before everything.',
      ],
      selfExplanationPrompt: 'Before trying the practice question: a colleague says "our cancer screening model has 99% accuracy." Without any other information, explain why that number alone might be completely misleading — and what metric you\'d ask to see instead.',
      sample: {
        type: 'multiple-choice',
        stem: 'A hospital builds a model to flag patients who may have a rare but serious disease. The medical team agrees that missing a true case is far more dangerous than investigating a false alarm. Which evaluation metric should the team prioritise when selecting the final model?',
        options: [
          'Precision',
          'Recall',
          'Accuracy',
          'Inference latency',
        ],
        correct: 1,
        explanation: {
          summary: 'Missing real cases (false negatives) is the costly error here. Recall measures how many of the actual positive cases the model catches — maximising it minimises missed diagnoses.',
          perOption: [
            'Precision minimises false positives (false alarms), which the team said is the less harmful error — so this is the wrong direction.',
            'Correct — recall = true positives ÷ all actual positives. Maximising it means fewer real cases are missed, which is the stated priority.',
            'Accuracy is highly misleading for a rare disease. A model that predicts "no disease" for every patient scores near-100% accuracy yet catches zero cases.',
            'Inference latency is an operational concern. It has nothing to do with whether the model catches real cases.',
          ],
          link: 'Domain 1 · Task 1.3 — Model performance metrics',
        },
      },
    },

    // ───────────────────────── DOMAIN 2 ─────────────────────────
    {
      id: 'd2-s4',
      number: 4,
      module: 'Domain 2 · Fundamentals of Generative AI',
      domain: 'd2',
      weight: '24%',
      task: 'Task 2.1',
      title: 'Generative AI Core Concepts',
      duration: 30,
      summary: 'Understand how text becomes numbers (tokens, embeddings, vectors), how transformers work at a high level, and the foundation model lifecycle.',
      objectives: [
        'Explain tokens, chunking, embeddings, and vectors',
        'Describe transformer-based LLMs at a conceptual level',
        'Contrast foundation models with traditional ML models',
        'Outline the foundation model lifecycle',
      ],
      sections: [
        {
          heading: 'How models represent text',
          bullets: [
            'Token — a chunk of text (roughly a word or word-piece) the model processes. Pricing and context limits are measured in tokens.',
            'Chunking — splitting long documents into smaller pieces so they fit and can be indexed/retrieved.',
            'Embedding — a numeric vector that captures the meaning of text; similar meanings sit close together.',
            'Vector — the array of numbers; stored in a vector database to enable semantic search.',
          ],
        },
        {
          heading: 'Transformers & LLMs',
          bullets: [
            'Large Language Models (LLMs) are transformer-based: they use an attention mechanism to weigh relationships between tokens.',
            'They predict the next token given prior context — that is how text is "generated".',
            'Multi-modal models handle more than one input/output type (text + image + audio).',
            'Diffusion models generate images by iteratively denoising random noise.',
          ],
        },
        {
          heading: 'Foundation models vs traditional ML',
          table: {
            headers: ['Foundation model', 'Traditional ML model'],
            rows: [
              ['Pre-trained on massive, broad data', 'Trained on a narrow, task-specific dataset'],
              ['General-purpose, adapts to many tasks', 'Solves one specific task'],
              ['Customized via prompting, RAG, fine-tuning', 'Re-trained for each new task'],
            ],
          },
        },
        {
          heading: 'Foundation model lifecycle',
          callout: { type: 'note', text: 'Data selection → Model selection → Pre-training → Fine-tuning → Evaluation → Deployment → Feedback (loop back). Also note: token-based pricing and context engineering shape FM application design.' },
        },
      ],
      keyTerms: [
        { term: 'Token', def: 'The unit of text a model reads/produces; billing and context windows are measured in tokens.' },
        { term: 'Embedding', def: 'A numeric vector representing the semantic meaning of text.' },
        { term: 'Vector database', def: 'A store optimized for similarity search over embeddings.' },
        { term: 'Diffusion model', def: 'A generative model that creates images by progressively removing noise.' },
      ],
      awsServices: [],
      examTips: [
        'Embeddings + vector database = semantic search; this underpins RAG (Domain 3).',
        'Tokens drive cost — "reduce cost" answers often involve fewer/shorter tokens or smaller context.',
        'Diffusion = image generation; transformer = language. Don\'t mix them up.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A developer wants to enable semantic search so that a query like "ways to lower my bill" also matches a document titled "reducing monthly costs." What must the application generate from the text to make this possible?',
        options: [
          'Embeddings (vector representations) stored in a vector database',
          'A larger context window for the language model',
          'Additional fine-tuning data',
          'A higher temperature setting',
        ],
        correct: 0,
        explanation: {
          summary: 'Semantic search relies on embeddings — vectors that place similar meanings close together — stored in a vector database for similarity lookup.',
          perOption: [
            'Correct — embeddings capture meaning so semantically similar phrases match even without shared keywords.',
            'A larger context window lets the model read more text but does not enable semantic matching of documents.',
            'Fine-tuning changes model behavior; it is not how semantic search retrieves documents.',
            'Temperature controls randomness of generated output, unrelated to search relevance.',
          ],
          link: 'Domain 2 · Task 2.1 — Embeddings & vectors',
        },
      },
    },
    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Fundamentals of Generative AI',
      domain: 'd2',
      weight: '24%',
      task: 'Task 2.1',
      title: 'GenAI Use Cases & Agentic AI',
      duration: 30,
      summary: 'Survey what generative AI is good for, then go deeper on agentic AI: agents, tools, memory, multi-agent patterns, and Model Context Protocol (MCP).',
      objectives: [
        'List common generative AI use cases',
        'Explain agentic AI and how agents use tools and memory',
        'Describe multi-agent patterns and Model Context Protocol (MCP)',
        'Understand token-based pricing and context engineering',
      ],
      sections: [
        {
          heading: 'Generative AI use cases',
          bullets: [
            'Content creation: text, images, video, audio generation.',
            'Summarization, translation, and code generation.',
            'AI assistants and customer-service agents.',
            'Search, recommendation engines, and knowledge retrieval.',
          ],
        },
        {
          heading: 'Agentic AI',
          body: 'An agent uses a foundation model as its "brain" to decide actions, then calls tools (APIs, search, calculators, databases) and observes results — looping until the goal is met.',
          bullets: [
            'Tool use — the agent invokes external functions/APIs to act in the world or fetch facts.',
            'Memory management — short-term (conversation) and long-term (persisted) context.',
            'Workflow orchestration — chaining steps and deciding what to do next.',
          ],
        },
        {
          heading: 'Multi-agent systems & MCP',
          bullets: [
            'Multi-agent patterns — several specialized agents collaborate (e.g., a planner agent + worker agents).',
            'Multi-agent communication — agents pass messages/results to coordinate.',
            'Model Context Protocol (MCP) — an open standard for connecting models/agents to external tools and data sources in a consistent way.',
          ],
        },
        {
          heading: 'Pricing & context',
          bullets: [
            'Token-based pricing — you pay per input + output token; longer prompts/answers cost more.',
            'Context engineering — deciding what information to put in the limited context window for best results.',
          ],
        },
      ],
      keyTerms: [
        { term: 'AI agent', def: 'A system that uses an FM to plan and take actions via tools to accomplish a goal.' },
        { term: 'Tool use', def: 'An agent calling external functions/APIs to retrieve data or perform actions.' },
        { term: 'MCP', def: 'Model Context Protocol — an open standard for connecting AI models to tools and data.' },
        { term: 'Context window', def: 'The maximum amount of tokens a model can consider at once.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock AgentCore', purpose: 'Infrastructure for building and running agentic applications' },
      ],
      examTips: [
        'If a scenario needs the model to take actions / call APIs / do multi-step tasks autonomously → agentic AI.',
        'MCP = standardized connection between models/agents and external tools/data.',
        'Token-based pricing means trimming prompts and outputs reduces cost.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants an AI system that can answer a customer request like "reschedule my delivery to Friday" by looking up the order, calling the shipping API to change the date, and confirming back to the user. Which approach best fits this requirement?',
        options: [
          'A single zero-shot text completion',
          'An AI agent that can use tools to take multi-step actions',
          'A diffusion model',
          'An embeddings model for semantic search',
        ],
        correct: 1,
        explanation: {
          summary: 'The task requires planning and taking actions (lookup, API call, confirmation) — that is agentic AI with tool use.',
          perOption: [
            'A single completion only produces text; it cannot look up orders or call the shipping API.',
            'Correct — an agent plans, calls tools/APIs, and acts on the result to complete the task.',
            'Diffusion models generate images, not actions or text workflows.',
            'Embeddings power search/retrieval but cannot execute the rescheduling action.',
          ],
          link: 'Domain 2 · Task 2.1 — Agentic AI',
        },
      },
    },
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Fundamentals of Generative AI',
      domain: 'd2',
      weight: '24%',
      task: 'Task 2.2',
      title: 'Capabilities & Limitations of Generative AI',
      duration: 30,
      summary: 'Know what generative AI does well, where it fails (hallucination, nondeterminism), how to choose a model, and how to measure business value.',
      objectives: [
        'List the advantages and limitations of generative AI',
        'Explain hallucination, nondeterminism, and limited interpretability',
        'Identify factors for selecting a model',
        'Identify business-value metrics for GenAI',
      ],
      sections: [
        {
          heading: 'Advantages vs limitations',
          table: {
            headers: ['Advantages', 'Limitations'],
            rows: [
              ['Adaptable across many tasks', 'Hallucinations — confident but false outputs'],
              ['Conversational, responsive', 'Limited interpretability (hard to explain why)'],
              ['Rich content generation', 'Inaccuracy in specialized domains'],
              ['Broad general knowledge', 'Nondeterminism — same input can give different output'],
            ],
          },
        },
        {
          heading: 'Why these limitations matter',
          bullets: [
            'Hallucination — a model can invent facts, citations, or numbers. Mitigate with RAG grounding, validation, and human review.',
            'Nondeterminism — temperature and sampling make outputs vary; can be a problem for reproducibility.',
            'Limited interpretability — large models are black boxes, which complicates regulated use cases.',
          ],
        },
        {
          heading: 'Model selection factors',
          bullets: [
            'Modality (text/image/audio), performance and accuracy requirements, latency.',
            'Compliance constraints, cost (token pricing), and complexity of the task.',
          ],
        },
        {
          heading: 'Business value metrics',
          bullets: [
            'Cross-domain performance, ROI, efficiency gains.',
            'Conversion rate, average revenue per user (ARPU), customer lifetime value, accuracy.',
          ],
          callout: { type: 'warning', text: 'Because GenAI can hallucinate, never use raw model output as the sole basis for high-stakes decisions (medical, legal, financial) without grounding and human oversight.' },
        },
      ],
      keyTerms: [
        { term: 'Hallucination', def: 'A model producing plausible-sounding but factually incorrect output.' },
        { term: 'Nondeterminism', def: 'The same prompt can yield different outputs across runs.' },
        { term: 'Interpretability', def: 'The degree to which a human can understand why a model produced an output.' },
      ],
      awsServices: [],
      examTips: [
        'Hallucination is the most-tested GenAI limitation — pair it with RAG/grounding as the mitigation.',
        '"Outputs vary each run" = nondeterminism (often tied to temperature).',
        'Model selection is multi-factor: cost, latency, modality, accuracy, compliance.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A legal team notices that a generative AI tool occasionally cites court cases that do not exist. What is this behavior called, and which approach most directly reduces it?',
        options: [
          'Overfitting; reduce the training dataset size',
          'Hallucination; ground responses in a trusted document source using RAG',
          'Nondeterminism; lower the temperature to zero',
          'Bias; add more diverse training data',
        ],
        correct: 1,
        explanation: {
          summary: 'Inventing nonexistent facts is hallucination. Grounding answers in retrieved, trusted sources (RAG) most directly reduces it.',
          perOption: [
            'Overfitting is a training-fit problem, not the generation of fake facts; shrinking data would not help.',
            'Correct — fabricated citations are hallucinations; RAG anchors outputs to real source documents.',
            'Lowering temperature reduces randomness but does not supply correct facts; the model can still hallucinate confidently.',
            'Bias refers to unfair outcomes across groups, not invented citations.',
          ],
          link: 'Domain 2 · Task 2.2 — Limitations (hallucination)',
        },
      },
    },
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Fundamentals of Generative AI',
      domain: 'd2',
      weight: '24%',
      task: 'Task 2.3',
      title: 'AWS Infrastructure for Generative AI',
      duration: 30,
      summary: 'Map the AWS GenAI service landscape — Bedrock, SageMaker, JumpStart, Amazon Q, AgentCore — and the advantages and cost tradeoffs of building on AWS.',
      objectives: [
        'Identify the core AWS services for generative AI and their roles',
        'Explain the advantages of building GenAI on AWS',
        'Describe cost tradeoffs and pricing options',
      ],
      sections: [
        {
          heading: 'Core AWS GenAI services',
          table: {
            headers: ['Service', 'Role'],
            rows: [
              ['Amazon Bedrock', 'Fully managed access to multiple foundation models via one API; customization (RAG, fine-tuning, agents, guardrails)'],
              ['Amazon SageMaker AI', 'End-to-end platform to build, train, deploy, and host custom models'],
              ['SageMaker JumpStart', 'Hub of pre-trained, open-source, and proprietary models to deploy quickly'],
              ['Amazon Q', 'Generative AI assistant for business (Q Business) and developers (Q Developer)'],
              ['Amazon Bedrock AgentCore', 'Infrastructure for building/operating agentic applications'],
            ],
          },
        },
        {
          heading: 'Why build GenAI on AWS',
          bullets: [
            'Accessibility & lower barrier to entry — managed services, no model hosting to manage.',
            'Choice of models from multiple providers through a single API (Bedrock).',
            'Built-in security and compliance; data stays in your account.',
            'Faster speed to market.',
          ],
        },
        {
          heading: 'Cost & performance tradeoffs',
          bullets: [
            'Token-based / on-demand pricing — pay per token used; ideal for variable workloads.',
            'Provisioned throughput — reserve capacity for predictable, high-volume, low-latency needs.',
            'Custom models cost more to create and host than using a base model.',
            'Tradeoffs across responsiveness, availability, redundancy, and regional coverage.',
          ],
          callout: { type: 'tip', text: 'Bedrock = managed FM API (fastest path, no infrastructure). SageMaker = full control to build/host your own. JumpStart = quick-deploy model hub.' },
        },
      ],
      keyTerms: [
        { term: 'Amazon Bedrock', def: 'Managed service offering many foundation models behind one API, with customization features.' },
        { term: 'Provisioned throughput', def: 'Reserved model capacity for predictable, high-volume, low-latency usage.' },
        { term: 'SageMaker JumpStart', def: 'A hub of pre-built models you can deploy with minimal setup.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock', purpose: 'Managed multi-provider foundation model access + customization' },
        { name: 'Amazon SageMaker AI', purpose: 'Build/train/deploy/host custom models end-to-end' },
        { name: 'SageMaker JumpStart', purpose: 'Quick-deploy hub of pre-trained models' },
        { name: 'Amazon Q', purpose: 'Generative AI assistant for business and developers' },
        { name: 'Amazon Bedrock AgentCore', purpose: 'Run agentic applications' },
      ],
      examTips: [
        '"Fastest, least operational overhead to use an FM" → Amazon Bedrock.',
        '"Full control to train/host a custom model" → Amazon SageMaker AI.',
        'Predictable high volume + low latency → provisioned throughput; spiky/variable → on-demand tokens.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A startup wants to add a chat feature powered by a large language model but has no ML infrastructure team and wants to experiment with models from several providers through one API. Which AWS service best fits?',
        options: [
          'Amazon SageMaker AI',
          'Amazon Bedrock',
          'Amazon EC2 with a self-hosted model',
          'Amazon Comprehend',
        ],
        correct: 1,
        explanation: {
          summary: 'Bedrock offers managed, multi-provider foundation models behind a single API with no infrastructure to run — ideal for a team without ML ops.',
          perOption: [
            'SageMaker AI is powerful but requires building/hosting models — more operational effort than the startup wants.',
            'Correct — Bedrock provides serverless access to multiple FMs via one API, minimal setup.',
            'Self-hosting on EC2 maximizes operational burden, the opposite of what is needed.',
            'Comprehend is a fixed NLP service, not a way to access general-purpose LLMs for chat.',
          ],
          link: 'Domain 2 · Task 2.3 — AWS GenAI infrastructure',
        },
      },
    },

    // ───────────────────────── DOMAIN 3 ─────────────────────────
    {
      id: 'd3-s8',
      number: 8,
      module: 'Domain 3 · Applications of Foundation Models',
      domain: 'd3',
      weight: '28%',
      task: 'Task 3.1',
      title: 'FM Design Considerations & RAG',
      duration: 30,
      summary: 'The highest-weight domain begins here: how to select a model, tune inference parameters, and use Retrieval Augmented Generation (RAG) to ground responses.',
      objectives: [
        'Apply foundation model selection criteria',
        'Explain inference parameters such as temperature and token length',
        'Describe RAG and when to use it, with AWS implementation',
        'Compare customization approaches by cost',
      ],
      sections: [
        {
          heading: 'FM selection criteria',
          bullets: [
            'Cost, modality, latency, multi-lingual support, model size/complexity.',
            'Customization needs, input/output length limits, and prompt caching to reduce repeated cost.',
          ],
        },
        {
          heading: 'Inference parameters',
          table: {
            headers: ['Parameter', 'Effect'],
            rows: [
              ['Temperature', 'Higher = more random/creative; lower = more focused/deterministic'],
              ['Top-p / Top-k', 'Limit which next tokens are considered, controlling diversity'],
              ['Max tokens', 'Caps output length (and cost)'],
            ],
          },
        },
        {
          heading: 'Retrieval Augmented Generation (RAG)',
          body: 'RAG retrieves relevant documents from your own knowledge source and adds them to the prompt so the model answers using up-to-date, proprietary facts — without retraining.',
          bullets: [
            'Great for: company knowledge bases, policies, product docs, reducing hallucination.',
            'On AWS: implemented with Amazon Bedrock Knowledge Bases.',
            'Vector storage options: Amazon OpenSearch, Aurora, Neptune, RDS for PostgreSQL (pgvector).',
          ],
        },
        {
          heading: 'Customization approaches by cost',
          table: {
            headers: ['Approach', 'Relative cost / effort'],
            rows: [
              ['Prompt engineering / in-context learning', 'Lowest — just change the prompt'],
              ['RAG', 'Low–moderate — add a retrieval layer, no retraining'],
              ['Fine-tuning', 'Higher — retrain on labeled data'],
              ['Continuous pre-training', 'High — extend the base model on large new data'],
              ['Pre-training from scratch', 'Highest — rarely justified'],
            ],
          },
          callout: { type: 'tip', text: 'Need the model to know your private/current data? Reach for RAG before fine-tuning — it is cheaper and keeps data fresh.' },
        },
      ],
      keyTerms: [
        { term: 'RAG', def: 'Retrieval Augmented Generation — injecting retrieved documents into the prompt to ground answers.' },
        { term: 'Temperature', def: 'Inference parameter controlling randomness/creativity of output.' },
        { term: 'Knowledge Base', def: 'Amazon Bedrock feature that manages retrieval for RAG over your data.' },
        { term: 'Prompt caching', def: 'Reusing previously processed prompt context to cut latency and cost.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Knowledge Bases', purpose: 'Managed RAG over your documents' },
        { name: 'Amazon OpenSearch', purpose: 'Vector store for embeddings (semantic search)' },
        { name: 'Aurora / RDS for PostgreSQL', purpose: 'Relational DBs with vector support (pgvector)' },
      ],
      examTips: [
        'Lower temperature for factual/consistent answers; higher for creative variety.',
        'Up-to-date or proprietary knowledge without retraining = RAG (Bedrock Knowledge Bases).',
        'Order customization by cost: prompt < RAG < fine-tune < continuous pre-train < pre-train.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'An enterprise wants its chatbot to answer questions using the company\'s internal policy documents, which change monthly. The team wants accurate, current answers with minimal cost and no model retraining. What should they implement?',
        options: [
          'Fine-tune the foundation model on the policy documents',
          'Retrieval Augmented Generation (RAG) with Amazon Bedrock Knowledge Bases',
          'Pre-train a new model from scratch on the documents',
          'Increase the model temperature to improve answer quality',
        ],
        correct: 1,
        explanation: {
          summary: 'RAG retrieves the latest documents at query time and grounds answers in them — no retraining, low cost, and easy to keep current as docs change monthly.',
          perOption: [
            'Fine-tuning bakes knowledge in at training time; monthly changes would require repeated, costly retraining.',
            'Correct — RAG via Bedrock Knowledge Bases grounds answers in current documents without retraining.',
            'Pre-training from scratch is the most expensive option and unnecessary here.',
            'Temperature affects randomness, not factual accuracy or knowledge freshness.',
          ],
          link: 'Domain 3 · Task 3.1 — RAG & customization cost',
        },
      },
    },
    {
      id: 'd3-s9',
      number: 9,
      module: 'Domain 3 · Applications of Foundation Models',
      domain: 'd3',
      weight: '28%',
      task: 'Task 3.2',
      title: 'Effective Prompt Engineering',
      duration: 30,
      summary: 'Master prompting techniques (zero/one/few-shot, chain-of-thought, templates), prompt constructs, and the security risks of prompts.',
      objectives: [
        'Differentiate zero-shot, one-shot, few-shot, and chain-of-thought prompting',
        'Apply prompt constructs: context, instruction, negative prompts',
        'Recognize prompt risks: injection, poisoning, hijacking, jailbreaking',
        'Identify AWS prompt management tooling',
      ],
      sections: [
        {
          heading: 'Core prompting techniques',
          table: {
            headers: ['Technique', 'Description'],
            rows: [
              ['Zero-shot', 'No examples — model relies only on the instruction'],
              ['One-shot (single-shot)', 'One example provided to guide format/behavior'],
              ['Few-shot', 'Several examples demonstrate the desired pattern'],
              ['Chain-of-thought', 'Ask the model to reason step-by-step before answering'],
              ['Prompt templates', 'Reusable prompts with placeholders for inputs'],
            ],
          },
        },
        {
          heading: 'Prompt constructs & best practices',
          bullets: [
            'Provide context, a clear instruction, and (optionally) negative prompts — what NOT to do.',
            'Be specific and concise; ambiguity produces poor results.',
            'Use guardrails and response controls to keep outputs safe and on-format.',
          ],
        },
        {
          heading: 'Prompt risks & attacks',
          table: {
            headers: ['Attack', 'What it does'],
            rows: [
              ['Prompt injection', 'Malicious input overrides the system instructions'],
              ['Prompt poisoning', 'Crafted inputs corrupt the model\'s behavior'],
              ['Prompt hijacking', 'Redirects the model to an unintended task'],
              ['Jailbreaking', 'Bypasses the model\'s safety guardrails'],
            ],
          },
          callout: { type: 'warning', text: 'Never trust user input blindly inside a prompt. Use Bedrock Guardrails and validation to defend against prompt injection.' },
        },
      ],
      keyTerms: [
        { term: 'Few-shot prompting', def: 'Providing several examples in the prompt to steer output format/behavior.' },
        { term: 'Chain-of-thought', def: 'Prompting the model to reason step-by-step to improve complex answers.' },
        { term: 'Prompt injection', def: 'An attack where malicious input overrides intended instructions.' },
        { term: 'Jailbreaking', def: 'Tricking a model into bypassing its safety guardrails.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Prompt Management', purpose: 'Version, store, and manage prompts' },
        { name: 'Amazon Bedrock Guardrails', purpose: 'Filter content and enforce safety policies' },
      ],
      examTips: [
        'Examples in the prompt = shot count (0/1/few). "Show your reasoning" = chain-of-thought.',
        'Malicious input overriding instructions = prompt injection (most-tested attack).',
        'Jailbreaking specifically means bypassing safety guardrails.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A developer provides the model with three example input-output pairs in the prompt so it learns the exact JSON format to return, without any retraining. Which prompt engineering technique is this?',
        options: [
          'Zero-shot prompting',
          'Few-shot prompting',
          'Chain-of-thought prompting',
          'Fine-tuning',
        ],
        correct: 1,
        explanation: {
          summary: 'Providing multiple examples in the prompt to demonstrate the desired output is few-shot prompting.',
          perOption: [
            'Zero-shot provides no examples, only an instruction.',
            'Correct — supplying several examples in the prompt is few-shot prompting.',
            'Chain-of-thought asks the model to reason step-by-step; it is not about providing examples.',
            'Fine-tuning changes model weights through training, not examples placed in a prompt.',
          ],
          link: 'Domain 3 · Task 3.2 — Prompting techniques',
        },
      },
    },
    {
      id: 'd3-s10',
      number: 10,
      module: 'Domain 3 · Applications of Foundation Models',
      domain: 'd3',
      weight: '28%',
      task: 'Task 3.3',
      title: 'Training & Fine-Tuning Approaches',
      duration: 30,
      summary: 'Compare every way to adapt a model — fine-tuning, instruction tuning, domain adaptation, transfer learning, RLHF, distillation — and the data prep behind them.',
      objectives: [
        'Distinguish pre-training, continuous pre-training, and fine-tuning',
        'Explain instruction tuning, domain adaptation, transfer learning, RLHF, and distillation',
        'Describe data preparation considerations',
      ],
      sections: [
        {
          heading: 'Training & adaptation approaches',
          table: {
            headers: ['Approach', 'When to use'],
            rows: [
              ['Pre-training', 'Train from scratch on huge general data — very expensive'],
              ['Continuous pre-training', 'Extend a model on new unlabeled domain data'],
              ['Fine-tuning', 'Adapt a pre-trained model to a task using labeled examples'],
              ['Instruction tuning', 'Fine-tune so the model follows instructions more reliably'],
              ['Domain adaptation', 'Fine-tune on domain text (legal, medical, finance)'],
              ['Transfer learning', 'Reuse learned representations for a related task'],
              ['RLHF', 'Align outputs to human preferences via human feedback'],
              ['Distillation', 'Train a smaller model to mimic a larger one — cuts cost/latency'],
            ],
          },
        },
        {
          heading: 'Data preparation',
          bullets: [
            'Curation and governance — clean, relevant, well-sourced data.',
            'Dataset size and labeling quality drive fine-tuning success.',
            'Representativeness reduces bias and improves generalization.',
          ],
          callout: { type: 'tip', text: 'Distillation is the go-to answer when the goal is a smaller/cheaper/faster model that retains most of a larger model\'s quality.' },
        },
      ],
      keyTerms: [
        { term: 'Fine-tuning', def: 'Adapting a pre-trained model to a specific task using labeled data.' },
        { term: 'RLHF', def: 'Reinforcement Learning from Human Feedback — aligning model output with human preferences.' },
        { term: 'Distillation', def: 'Training a smaller "student" model to imitate a larger "teacher" model.' },
        { term: 'Continuous pre-training', def: 'Further pre-training a base model on additional unlabeled domain data.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock', purpose: 'Supports fine-tuning and model customization' },
        { name: 'Amazon SageMaker AI', purpose: 'Custom training, fine-tuning, and distillation workflows' },
      ],
      examTips: [
        'Fine-tuning needs labeled data; continuous pre-training uses unlabeled domain data.',
        'RLHF = aligning to human preferences; distillation = smaller/cheaper model.',
        'Domain adaptation = specialize on legal/medical/financial language.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A team has a high-quality large model but needs to deploy on edge devices with limited compute and lower latency, while keeping most of the quality. Which technique is most appropriate?',
        options: [
          'Continuous pre-training',
          'Model distillation',
          'Increasing the context window',
          'Retrieval Augmented Generation (RAG)',
        ],
        correct: 1,
        explanation: {
          summary: 'Distillation trains a smaller "student" model to mimic the large one, reducing size, cost, and latency while retaining most quality — ideal for constrained edge devices.',
          perOption: [
            'Continuous pre-training makes a model more knowledgeable, not smaller or faster.',
            'Correct — distillation produces a compact, lower-latency model suitable for the edge.',
            'A larger context window increases compute needs, the opposite of the goal.',
            'RAG adds a retrieval layer; it does not shrink the model for edge deployment.',
          ],
          link: 'Domain 3 · Task 3.3 — Distillation',
        },
      },
    },
    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Applications of Foundation Models',
      domain: 'd3',
      weight: '28%',
      task: 'Task 3.4',
      title: 'Evaluating Foundation Model Performance',
      duration: 30,
      summary: 'Learn how to judge model quality: human-in-the-loop, benchmarks, LLM-as-a-judge, and automated metrics like ROUGE, BLEU, and BERTScore.',
      objectives: [
        'Describe evaluation approaches for foundation models',
        'Differentiate ROUGE, BLEU, and BERTScore',
        'Identify the relevant business metrics for FM applications',
      ],
      sections: [
        {
          heading: 'Evaluation approaches',
          bullets: [
            'Human-in-the-loop — people rate output quality; best for nuanced/subjective tasks.',
            'Benchmark datasets — standardized tests with known answers for repeatable comparison.',
            'LLM-as-a-judge — a separate model scores outputs; scalable for open-ended responses.',
            'Amazon Bedrock Model Evaluation — managed service for automatic and human evaluation.',
          ],
        },
        {
          heading: 'Automated metrics',
          table: {
            headers: ['Metric', 'Measures', 'Typical use'],
            rows: [
              ['ROUGE', 'Recall-oriented overlap with reference', 'Summarization quality'],
              ['BLEU', 'Precision-oriented n-gram overlap', 'Translation quality'],
              ['BERTScore', 'Semantic similarity via embeddings', 'Meaning beyond exact word match'],
              ['LLM-as-a-judge', 'Flexible scoring by another model', 'Open-ended generation'],
            ],
          },
          callout: { type: 'tip', text: 'Mnemonic: ROUGE → summaRization (recall); BLEU → translation (precision); BERTScore → meaning/semantics.' },
        },
        {
          heading: 'Business metrics',
          bullets: [
            'Task completion rate, user satisfaction, cost per interaction.',
            'Productivity improvements, user engagement, alignment with business objectives.',
          ],
        },
      ],
      keyTerms: [
        { term: 'ROUGE', def: 'Recall-oriented metric comparing generated text to references; common for summarization.' },
        { term: 'BLEU', def: 'Precision-oriented n-gram overlap metric; common for translation.' },
        { term: 'BERTScore', def: 'Embedding-based metric measuring semantic similarity, not just word overlap.' },
        { term: 'LLM-as-a-judge', def: 'Using a separate model to score the quality of generated outputs.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Model Evaluation', purpose: 'Managed automatic and human model evaluation' },
      ],
      examTips: [
        'Summarization → ROUGE; translation → BLEU; semantic meaning → BERTScore.',
        'Subjective/nuanced quality → human-in-the-loop; scale open-ended scoring → LLM-as-a-judge.',
        'Business value still matters: completion rate, satisfaction, cost per interaction.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A team is comparing several models on a document summarization task and wants an automated metric that measures how much of the reference summary content is captured. Which metric is most appropriate?',
        options: [
          'BLEU',
          'ROUGE',
          'Inference latency',
          'F1 score on a classification label',
        ],
        correct: 1,
        explanation: {
          summary: 'ROUGE is recall-oriented and designed for summarization — it measures overlap with reference summaries (how much reference content is captured).',
          perOption: [
            'BLEU is precision-oriented and tailored to translation, not summarization recall.',
            'Correct — ROUGE measures recall overlap with reference summaries, the standard summarization metric.',
            'Latency is an operational metric, not a measure of summary quality.',
            'Classification F1 does not apply to free-form summarization quality.',
          ],
          link: 'Domain 3 · Task 3.4 — Evaluation metrics',
        },
      },
    },

    // ───────────────────────── DOMAIN 4 ─────────────────────────
    {
      id: 'd4-s12',
      number: 12,
      module: 'Domain 4 · Guidelines for Responsible AI',
      domain: 'd4',
      weight: '14%',
      task: 'Task 4.1',
      title: 'Building Responsible AI Systems',
      duration: 30,
      summary: 'Understand the pillars of responsible AI, the legal risks of generative AI, dataset considerations, and the AWS tools that support responsible AI.',
      objectives: [
        'List the pillars of responsible AI',
        'Identify legal and ethical risks of generative AI',
        'Explain how dataset choices affect fairness',
        'Match AWS tools to responsible-AI needs',
      ],
      sections: [
        {
          heading: 'Pillars of responsible AI',
          bullets: [
            'Bias — systematic errors that produce unfair outcomes for certain groups.',
            'Fairness — equitable treatment across demographic groups.',
            'Inclusivity — diverse, representative training data.',
            'Robustness — reliable performance across varied inputs and edge cases.',
            'Safety — preventing harmful outputs.',
            'Veracity — factual accuracy and groundedness.',
          ],
        },
        {
          heading: 'Legal & ethical risks',
          bullets: [
            'Intellectual property infringement (training data and generated content).',
            'Biased or discriminatory outputs (hiring, lending).',
            'Loss of customer trust from hallucinations or errors.',
            'End-user harm from incorrect advice.',
          ],
        },
        {
          heading: 'Dataset considerations',
          bullets: [
            'Inclusive, diverse data reduces bias.',
            'Curated, balanced datasets reduce bias variance.',
            'Overfitting/underfitting can harm specific demographic groups disproportionately.',
          ],
        },
        {
          heading: 'AWS tools for responsible AI',
          table: {
            headers: ['Tool', 'Purpose'],
            rows: [
              ['Amazon Bedrock Guardrails', 'Content filtering and safety policies'],
              ['Amazon SageMaker Clarify', 'Bias detection and explainability'],
              ['SageMaker Model Monitor', 'Detect drift and bias in production'],
              ['Amazon Augmented AI (A2I)', 'Human review workflows for predictions'],
            ],
          },
          callout: { type: 'tip', text: 'Clarify = detect bias & explain; Guardrails = block harmful content; Model Monitor = watch production drift; A2I = add human review.' },
        },
      ],
      keyTerms: [
        { term: 'Bias', def: 'Systematic error that yields unfair outcomes for certain groups.' },
        { term: 'Fairness', def: 'Equitable model treatment across demographic groups.' },
        { term: 'Veracity', def: 'Factual accuracy and groundedness of outputs.' },
        { term: 'A2I', def: 'Amazon Augmented AI — adds human review to ML predictions.' },
      ],
      awsServices: [
        { name: 'Amazon Bedrock Guardrails', purpose: 'Filter content; enforce safety/topic policies' },
        { name: 'Amazon SageMaker Clarify', purpose: 'Detect bias and provide explainability' },
        { name: 'SageMaker Model Monitor', purpose: 'Monitor production models for drift and bias' },
        { name: 'Amazon Augmented AI (A2I)', purpose: 'Route low-confidence predictions to humans' },
      ],
      examTips: [
        'Detect bias in a dataset/model → SageMaker Clarify.',
        'Block toxic/unsafe generated content → Bedrock Guardrails.',
        'Add human oversight to predictions → Amazon A2I.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A bank is concerned its loan-approval model may unfairly disadvantage certain demographic groups. Which AWS service is designed to detect this bias and help explain the model\'s predictions?',
        options: [
          'Amazon SageMaker Clarify',
          'Amazon Polly',
          'Amazon Bedrock Knowledge Bases',
          'AWS CloudTrail',
        ],
        correct: 0,
        explanation: {
          summary: 'SageMaker Clarify is purpose-built to detect bias across groups and provide explainability for model predictions.',
          perOption: [
            'Correct — Clarify detects bias and explains feature contributions to predictions.',
            'Polly is text-to-speech; unrelated to bias detection.',
            'Knowledge Bases power RAG retrieval, not bias analysis.',
            'CloudTrail logs API activity for auditing; it does not analyze model bias.',
          ],
          link: 'Domain 4 · Task 4.1 — Responsible AI tools',
        },
      },
    },
    {
      id: 'd4-s13',
      number: 13,
      module: 'Domain 4 · Guidelines for Responsible AI',
      domain: 'd4',
      weight: '14%',
      task: 'Task 4.2',
      title: 'Transparent & Explainable Models',
      duration: 30,
      summary: 'Distinguish transparent, explainable, and black-box models; understand the interpretability-vs-performance tradeoff and human-centered design.',
      objectives: [
        'Differentiate transparent, explainable (XAI), and black-box models',
        'Explain the interpretability vs performance tradeoff',
        'Apply human-centered design principles',
        'Identify AWS tools for transparency',
      ],
      sections: [
        {
          heading: 'Transparency vs explainability vs black box',
          table: {
            headers: ['Concept', 'Description'],
            rows: [
              ['Transparent model', 'Decisions trace to clear rules/inputs (e.g., decision trees)'],
              ['Explainable AI (XAI)', 'Techniques that explain why a model made a prediction'],
              ['Black-box model', 'Internal logic not interpretable (e.g., large neural nets)'],
            ],
          },
        },
        {
          heading: 'The core tradeoff',
          bullets: [
            'Higher interpretability often means lower raw performance — and vice versa.',
            'Regulated/high-stakes domains may require interpretable models even at some accuracy cost.',
          ],
          callout: { type: 'note', text: 'Recognize when explainability is a requirement (lending, healthcare, hiring) versus when peak performance is acceptable.' },
        },
        {
          heading: 'Human-centered design & AWS tools',
          bullets: [
            'Provide user-feedback mechanisms and make AI decision criteria visible.',
            'SageMaker Model Cards — document model purpose, data, performance, and limitations.',
            'SageMaker Clarify and Bedrock Model Evaluation also support transparency.',
          ],
        },
      ],
      keyTerms: [
        { term: 'Explainable AI (XAI)', def: 'Methods that make a model\'s predictions understandable to humans.' },
        { term: 'Black-box model', def: 'A model whose internal decision logic is not human-interpretable.' },
        { term: 'Model Cards', def: 'Documentation of a model\'s intended use, data, performance, and limitations.' },
      ],
      awsServices: [
        { name: 'SageMaker Model Cards', purpose: 'Document model behavior, data, and limitations' },
        { name: 'SageMaker Clarify', purpose: 'Explainability and bias detection' },
        { name: 'Amazon Bedrock Model Evaluation', purpose: 'Evaluate and compare model outputs' },
      ],
      examTips: [
        'Need to explain why a decision was made → explainability/XAI (and Clarify).',
        'Need to document a model for governance → SageMaker Model Cards.',
        'Remember the interpretability ↔ performance tradeoff.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A regulated insurer must document each model\'s intended use, training data, performance, and known limitations so auditors can review them. Which AWS capability is designed for this documentation?',
        options: [
          'Amazon SageMaker Model Cards',
          'Amazon Bedrock Guardrails',
          'Amazon Transcribe',
          'AWS PrivateLink',
        ],
        correct: 0,
        explanation: {
          summary: 'SageMaker Model Cards centralize standardized documentation of a model\'s purpose, data, performance, and limitations for governance and audit.',
          perOption: [
            'Correct — Model Cards document intended use, data, performance, and limitations.',
            'Guardrails filter content at runtime; they are not documentation.',
            'Transcribe is speech-to-text; unrelated.',
            'PrivateLink provides private network connectivity; not documentation.',
          ],
          link: 'Domain 4 · Task 4.2 — Transparency tools',
        },
      },
    },

    // ───────────────────────── DOMAIN 5 ─────────────────────────
    {
      id: 'd5-s14',
      number: 14,
      module: 'Domain 5 · Security, Compliance & Governance',
      domain: 'd5',
      weight: '14%',
      task: 'Task 5.1',
      title: 'Securing AI Systems',
      duration: 30,
      summary: 'Apply AWS security services to AI workloads, follow secure data engineering practices, and defend against AI-specific threats.',
      objectives: [
        'Identify AWS security services relevant to AI systems',
        'Apply secure data engineering practices',
        'Recognize AI-specific threats and how to mitigate them',
        'Explain the AWS Shared Responsibility Model',
      ],
      sections: [
        {
          heading: 'AWS security services for AI',
          table: {
            headers: ['Service / control', 'Purpose'],
            rows: [
              ['IAM', 'Roles, policies, least-privilege access'],
              ['Encryption (at rest & in transit)', 'Protect data confidentiality'],
              ['Amazon Macie', 'Discover sensitive data (PII) in Amazon S3'],
              ['AWS PrivateLink', 'Private connectivity without internet exposure'],
              ['Amazon Bedrock Guardrails', 'Content filtering and output validation'],
              ['Bedrock AgentCore Identity', 'Identity & access for agentic workloads'],
            ],
          },
        },
        {
          heading: 'Shared Responsibility Model',
          bullets: [
            'AWS secures the cloud (infrastructure); the customer secures what is in the cloud (data, access, configuration).',
            'For AI: customers control data, IAM, prompts/guardrails, and how outputs are used.',
          ],
        },
        {
          heading: 'AI-specific threats & mitigations',
          table: {
            headers: ['Threat', 'Mitigation'],
            rows: [
              ['Prompt injection', 'Input validation, Bedrock Guardrails'],
              ['Data leakage', 'Access controls, encryption, avoid training on secrets'],
              ['Hallucination risk', 'RAG grounding, output validation, confidence scoring + human review'],
              ['Toxicity', 'Content filters / Guardrails'],
            ],
          },
          callout: { type: 'warning', text: 'Mitigate hallucination with grounding (RAG), output validation, and confidence-based human review — not by simply trusting the model.' },
        },
      ],
      keyTerms: [
        { term: 'IAM', def: 'AWS Identity and Access Management — controls who can do what, with least privilege.' },
        { term: 'Amazon Macie', def: 'Service that discovers and protects sensitive data in S3.' },
        { term: 'AWS PrivateLink', def: 'Private connectivity to AWS services without traversing the internet.' },
        { term: 'Shared Responsibility Model', def: 'AWS secures the cloud; the customer secures what they put in it.' },
      ],
      awsServices: [
        { name: 'IAM', purpose: 'Least-privilege identity and access control' },
        { name: 'Amazon Macie', purpose: 'Discover sensitive/PII data in S3' },
        { name: 'AWS PrivateLink', purpose: 'Private access to services without internet exposure' },
        { name: 'Amazon Bedrock Guardrails', purpose: 'Filter content and validate outputs' },
      ],
      examTips: [
        'Discover PII in S3 → Amazon Macie. Private access to Bedrock without internet → PrivateLink.',
        'Prompt injection mitigation → input validation + Guardrails.',
        'Know the Shared Responsibility split: AWS = of the cloud; customer = in the cloud.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'Before training, a company must locate and protect personally identifiable information (PII) sitting in its Amazon S3 buckets. Which AWS service is purpose-built for this?',
        options: [
          'Amazon Macie',
          'Amazon Lex',
          'Amazon Bedrock',
          'Amazon Polly',
        ],
        correct: 0,
        explanation: {
          summary: 'Amazon Macie uses ML to discover and classify sensitive data such as PII in S3, enabling protection before that data is used.',
          perOption: [
            'Correct — Macie discovers and classifies sensitive data (PII) in S3.',
            'Lex builds chatbots; it does not scan storage for PII.',
            'Bedrock provides foundation models, not sensitive-data discovery.',
            'Polly is text-to-speech; unrelated to data classification.',
          ],
          link: 'Domain 5 · Task 5.1 — Securing AI data',
        },
      },
    },
    {
      id: 'd5-s15',
      number: 15,
      module: 'Domain 5 · Security, Compliance & Governance',
      domain: 'd5',
      weight: '14%',
      task: 'Task 5.2',
      title: 'Governance & Compliance for AI',
      duration: 30,
      summary: 'Use AWS governance services, apply data governance strategies, and follow governance protocols including the Generative AI Security Scoping Matrix.',
      objectives: [
        'Identify AWS governance and compliance services',
        'Apply data governance strategies',
        'Describe governance protocols for AI',
      ],
      sections: [
        {
          heading: 'AWS governance & compliance services',
          table: {
            headers: ['Service', 'Purpose'],
            rows: [
              ['AWS Config', 'Track resource configuration & compliance over time'],
              ['Amazon Inspector', 'Automated vulnerability assessments'],
              ['AWS Audit Manager', 'Continuously collect audit evidence'],
              ['AWS Artifact', 'On-demand compliance reports & agreements'],
              ['AWS CloudTrail', 'Log API activity for an audit trail'],
              ['AWS Trusted Advisor', 'Best-practice recommendations'],
            ],
          },
        },
        {
          heading: 'Data governance strategies',
          bullets: [
            'Data lifecycle management (creation → archival → deletion) and retention policies.',
            'Logging and observability of AI interactions.',
            'Data residency — where data is stored and processed.',
            'Monitoring for model drift and anomalies.',
          ],
        },
        {
          heading: 'Governance protocols',
          bullets: [
            'AI governance policies with a regular review cadence.',
            'Generative AI Security Scoping Matrix — frames security responsibilities by how you use GenAI (consumer app → self-trained model).',
            'Transparency standards for AI-generated content; team training on AI safety.',
          ],
          callout: { type: 'tip', text: 'Audit trail of who called what, when → CloudTrail. Configuration compliance over time → AWS Config. Compliance reports for auditors → AWS Artifact.' },
        },
      ],
      keyTerms: [
        { term: 'AWS CloudTrail', def: 'Logs API calls across your account to provide an audit trail.' },
        { term: 'AWS Config', def: 'Tracks resource configurations and evaluates them against compliance rules.' },
        { term: 'AWS Artifact', def: 'Self-service portal for AWS compliance reports and agreements.' },
        { term: 'GenAI Security Scoping Matrix', def: 'A framework for assessing security responsibilities based on how GenAI is used.' },
      ],
      awsServices: [
        { name: 'AWS Config', purpose: 'Configuration & compliance tracking' },
        { name: 'AWS CloudTrail', purpose: 'API activity audit logging' },
        { name: 'AWS Audit Manager', purpose: 'Continuous audit evidence collection' },
        { name: 'AWS Artifact', purpose: 'On-demand compliance documentation' },
        { name: 'Amazon Inspector', purpose: 'Vulnerability assessment' },
      ],
      examTips: [
        'Who did what, when (audit trail) → CloudTrail. Resource config compliance → AWS Config.',
        'Need SOC/ISO compliance reports → AWS Artifact.',
        'Data residency = where data is physically stored/processed — tie to region choices.',
      ],
      sample: {
        type: 'multiple-choice',
        stem: 'A compliance officer needs a complete record of every API call made to the company\'s AWS account — including which user invoked an Amazon Bedrock model and when — to support a security audit. Which service provides this?',
        options: [
          'AWS Trusted Advisor',
          'AWS CloudTrail',
          'Amazon Macie',
          'Amazon Bedrock Guardrails',
        ],
        correct: 1,
        explanation: {
          summary: 'CloudTrail records API activity across the account, providing the who/what/when audit trail needed for compliance reviews.',
          perOption: [
            'Trusted Advisor gives best-practice recommendations, not a detailed API audit log.',
            'Correct — CloudTrail logs API calls (including Bedrock invocations) for auditing.',
            'Macie discovers sensitive data in S3; it does not log API activity.',
            'Guardrails filter content at runtime; they are not an audit log.',
          ],
          link: 'Domain 5 · Task 5.2 — Governance & audit',
        },
      },
    },

    // ───────────────────────── EXAM READINESS ─────────────────────────
    {
      id: 'exam-s16',
      number: 16,
      module: 'Exam Readiness',
      domain: 'exam',
      weight: '—',
      task: 'Final review',
      title: 'Exam Strategy & Final Review',
      duration: 30,
      summary: 'Lock in exam logistics, question-type tactics, time management, and a domain-by-domain recall sweep before you sit the exam.',
      objectives: [
        'Recall exam logistics and scoring',
        'Apply tactics for each question type',
        'Manage your 90 minutes effectively',
        'Run a final domain-by-domain recall sweep',
      ],
      sections: [
        {
          heading: 'Exam logistics',
          bullets: [
            '65 questions total: 50 scored + 15 unscored (you can\'t tell which). 90 minutes.',
            'Pass at 700/1000 (~70%). Compensatory scoring — no per-domain minimum.',
            'No penalty for guessing — never leave a question blank.',
          ],
        },
        {
          heading: 'Question-type tactics',
          table: {
            headers: ['Type', 'Tactic'],
            rows: [
              ['Multiple choice (1 of 4)', 'Eliminate two obviously wrong, then pick the single best'],
              ['Multiple response (select N)', 'Treat each option as true/false; all must be right (no partial credit)'],
              ['Ordering', 'Anchor the clear first/last step, then fill the middle'],
              ['Matching', 'Do the pairs you are sure of first to narrow the rest'],
            ],
          },
        },
        {
          heading: 'Time & mindset',
          bullets: [
            '~80 seconds per question average — flag hard ones and move on; revisit at the end.',
            'Watch for keywords: "least operational overhead", "most cost-effective", "without retraining".',
            'When two answers look right, pick the one that best matches the stated constraint.',
          ],
        },
        {
          heading: 'Rapid domain recall',
          bullets: [
            'D1: supervised=labeled; recall vs precision; AWS AI service jobs.',
            'D2: tokens/embeddings; hallucination; Bedrock vs SageMaker; agentic AI & MCP.',
            'D3: RAG before fine-tuning; prompting techniques; ROUGE/BLEU/BERTScore; distillation.',
            'D4: bias/fairness pillars; Clarify (bias), Guardrails (content), Model Cards (docs).',
            'D5: Macie (PII), PrivateLink (private access), CloudTrail (audit), Config (compliance).',
          ],
          callout: { type: 'tip', text: 'Take at least one full, timed 65-question simulation before exam day to build stamina and surface weak domains.' },
        },
      ],
      keyTerms: [
        { term: 'Compensatory scoring', def: 'Only the total score matters; a weak domain can be offset by a strong one.' },
        { term: 'Scaled score', def: 'A normalized score from 100–1000; 700 is passing.' },
      ],
      awsServices: [],
      examTips: [
        'Answer every question — there is no guessing penalty.',
        'Keywords like "least overhead" or "no retraining" usually point to Bedrock/RAG/managed services.',
        'Flag-and-return beats getting stuck on one hard question.',
      ],
      sample: {
        type: 'multiple-response',
        stem: 'Which TWO statements about the AWS Certified AI Practitioner exam are correct? (Select TWO.)',
        options: [
          'There is no penalty for guessing, so you should answer every question',
          'You must pass each domain individually to pass the exam',
          'The exam uses compensatory scoring based on your total score',
          'A wrong answer subtracts points from your total score',
        ],
        correct: [0, 2],
        explanation: {
          summary: 'The exam has no guessing penalty (answer everything) and uses compensatory scoring (only the total matters, no per-domain minimum).',
          perOption: [
            'Correct — there is no guessing penalty, so always answer.',
            'Incorrect — there is no per-domain pass requirement.',
            'Correct — scoring is compensatory; only the overall scaled score determines pass/fail.',
            'Incorrect — wrong answers do not subtract points.',
          ],
          link: 'Exam Readiness — Logistics & scoring',
        },
      },
    },
  ],
}

export default aifC01Course
