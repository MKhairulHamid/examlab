// AWS Certified DevOps Engineer – Professional (DOP-C02) — Exam Prep Course
// 18 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors soaC03Course.js / sapC02Course.js — see study-materials-standard.html for authoring rules.
// Build status: Step 1 of 5 — Domain 1 (SDLC Automation) + Domain 2 (Config Mgmt & IaC) authored. D3–D6 land in Steps 2–3.

const dopC02Course = {
  slug: 'dop-c02',
  title: 'AWS Certified DevOps Engineer – Professional — Full Prep Course',
  code: 'DOP-C02',
  subtitle: 'Eighteen ~30-minute sessions covering all six domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 75 questions (65 scored + 10 unscored), 180 minutes, pass at 750/1000 (75%). Compensatory scoring — no per-domain minimum. Question types are multiple choice and multiple response only.',
  modules: [
    { id: 'd1', label: 'Domain 1 · SDLC Automation', weight: '22%' },
    { id: 'd2', label: 'Domain 2 · Configuration Management & IaC', weight: '17%' },
    { id: 'd3', label: 'Domain 3 · Resilient Cloud Solutions', weight: '15%' },
    { id: 'd4', label: 'Domain 4 · Monitoring & Logging', weight: '15%' },
    { id: 'd5', label: 'Domain 5 · Incident & Event Response', weight: '14%' },
    { id: 'd6', label: 'Domain 6 · Security & Compliance', weight: '17%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — SDLC AUTOMATION (22%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · SDLC Automation',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.1',
      title: 'CI/CD Pipelines — CodePipeline, CodeBuild, and CodeDeploy',
      duration: 30,
      summary: 'This is the spine of the whole exam. A DevOps engineer turns a code change into a safe production release without a human running commands. This session builds the mental model of an AWS-native pipeline: how source, build, test, and deploy stages connect, where artifacts flow, and how single-account pipelines extend to multi-account environments.',
      objectives: [
        'Map the four classic pipeline phases (source, build, test, deploy) to AWS services',
        'Explain how CodePipeline orchestrates stages and passes artifacts between them',
        'Design a cross-account pipeline where a tooling account deploys into separate dev/test/prod accounts',
        'Manage build-time secrets with Secrets Manager and SSM Parameter Store instead of hardcoding them',
      ],
      preLearningCheck: {
        question: 'A team runs CodePipeline in a central "tooling" account but needs it to deploy a CloudFormation stack into a separate production account. What is the standard way to grant that access?',
        options: [
          'Copy the production account credentials into a CodeBuild environment variable',
          'CodePipeline assumes a cross-account IAM role in the production account, and the artifact S3 bucket and KMS key grant that account access',
          'Move CodePipeline into the production account — cross-account deploys are not supported',
          'Make the production account a public artifact mirror',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: cross-account delivery is built on assumed IAM roles plus a shared, KMS-encrypted artifact bucket whose policy and key both trust the target account. No long-lived credentials ever move.',
      },
      sections: [
        {
          heading: 'The pipeline as an assembly line',
          body: 'Every CI/CD question rests on one model: a pipeline is an ordered set of stages, each stage holds one or more actions, and actions pass artifacts to the next stage through an Amazon S3 artifact store. AWS CodePipeline is the orchestrator — it reacts to a source change, runs each stage in order, and stops (or rolls back) on failure.\n\nThe canonical AWS toolchain maps cleanly onto the phases: a source action (a Git repository, S3, or ECR), a build action (CodeBuild compiles, runs unit tests, and produces a build artifact), optional test actions, and a deploy action (CodeDeploy, CloudFormation, ECS, or S3). Get fluent reading a scenario as "which service is doing source vs. build vs. deploy?" — that single decomposition answers most Domain 1 questions.',
          callout: { type: 'note', text: 'CodePipeline = orchestration. CodeBuild = compile/test in a managed container. CodeDeploy = release to compute targets. CodeCommit = a managed Git repo (still supported, though many teams now source from GitHub via a connection). Keep these four jobs distinct.' },
          interactive: 'pipeline-stage',
        },
        {
          heading: 'CodeBuild — the build and test engine',
          body: 'CodeBuild runs your build in an ephemeral, managed container defined by a buildspec.yml. It is where compilation, unit tests, code coverage, linting, and artifact packaging happen. Because it is fully managed and pay-per-minute, the exam favors it over self-managed Jenkins on EC2 when the requirement is "least operational overhead."',
          bullets: [
            'The buildspec defines phases (install, pre_build, build, post_build) and which files become output artifacts.',
            'A CodeBuild project needs an IAM service role granting it access to source, artifacts (S3), logs (CloudWatch Logs), and any service it calls.',
            'Build environments can run privileged mode to build Docker images and push them to Amazon ECR.',
            'Reports (test and coverage) can be published to CodeBuild report groups for visibility.',
          ],
          callout: { type: 'tip', text: 'Exam reflex: "managed build with no servers to patch" → CodeBuild. "We already maintain Jenkins" is the higher-overhead distractor the question usually wants you to reject.' },
        },
        {
          heading: 'Managing build and deployment secrets',
          body: 'Never bake credentials, API keys, or database passwords into a buildspec, source repo, or AMI. CodeBuild and CodeDeploy retrieve secrets at run time from AWS Secrets Manager (rotatable secrets like DB passwords, API tokens) or AWS Systems Manager Parameter Store (configuration values and SecureString parameters).',
          bullets: [
            'buildspec env can reference secrets-manager and parameter-store values so the plaintext never appears in the template or logs.',
            'Secrets Manager supports automatic rotation via Lambda; Parameter Store SecureString is cheaper for simple config and small secrets.',
            'The CodeBuild/CodeDeploy IAM role must be granted GetSecretValue / GetParameter on exactly the needed secrets — least privilege.',
            'Encryption is via KMS; the role also needs kms:Decrypt on the relevant key.',
          ],
        },
        {
          heading: 'Single-account vs. multi-account pipelines',
          body: 'A production-grade DevOps setup isolates environments into separate AWS accounts. A central tooling/shared-services account hosts the pipeline; it deploys into dev, test, and prod accounts. This is a frequent Professional-level scenario.',
          bullets: [
            'The pipeline assumes a cross-account IAM role in each target account to perform the deployment.',
            'The artifact S3 bucket policy AND the KMS key policy must grant the target accounts access, or the deploy action fails to read the artifact.',
            'CloudFormation deploy actions can use a separate role (the CloudFormation service role) in the target account, decoupling "who can run the pipeline" from "what the stack can create."',
            'Manual approval actions add a human gate before the prod stage — a common requirement for change control.',
          ],
          callout: { type: 'warning', text: 'A cross-account pipeline that "deploys but produces an access-denied on the artifact" is almost always a missing grant on the KMS key policy, not just the bucket policy. The key policy is the detail candidates forget.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A pipeline must compile code, run unit tests, and build a Docker image, then push it to Amazon ECR — with no servers to manage. Which service performs this stage?',
          options: [
            'AWS CodeDeploy',
            'AWS CodeBuild (with privileged mode enabled to build the image)',
            'AWS CodePipeline acting on its own',
            'Amazon EC2 with a cron job',
          ],
          correct: 1,
          explainCorrect: 'Correct — CodeBuild is the managed build/test engine; privileged mode lets it build and push Docker images to ECR. CodePipeline only orchestrates; CodeDeploy only releases.',
          elaborativePrompt: 'In your own words, why is CodeBuild preferred over a self-managed Jenkins server when the requirement emphasizes minimizing operational overhead?',
        },
        {
          afterSection: 3,
          question: 'A central pipeline deploys into a separate prod account and fails with an access-denied error reading the input artifact. The S3 bucket policy already grants the prod account. What is the most likely missing piece?',
          options: [
            'The KMS key policy used to encrypt the artifact bucket does not grant the prod account decrypt access',
            'CodePipeline does not support cross-account deployment',
            'The prod account must be in a different Region',
            'The source stage must use CodeCommit instead of GitHub',
          ],
          correct: 0,
          explainCorrect: 'Correct — artifacts are KMS-encrypted; the target account needs both the bucket grant and kms:Decrypt on the key. The key policy is the commonly forgotten half.',
          elaborativePrompt: 'Why does AWS require both a bucket policy grant and a KMS key policy grant for cross-account artifact access, rather than just one?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company wants one pipeline in a tooling account that builds an app, requires a manual approval, then deploys into a separate prod account with zero hardcoded credentials. Walk through each stage, where the artifact lives, which IAM role is assumed where, and how the database password reaches the app without ever being in the repo.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants a fully managed CI/CD pipeline. Source is in GitHub. The build must run unit tests and produce a container image. Deployment targets a production account separate from the pipeline account, and a release manager must approve before production. Which approach meets all requirements with the LEAST operational overhead?',
        options: [
          'Run Jenkins on an EC2 Auto Scaling group in the pipeline account, store the prod account access keys in Jenkins credentials, and deploy directly',
          'Use CodePipeline with a GitHub source, a CodeBuild build/test stage that pushes to ECR, a manual approval action, and a deploy action that assumes a cross-account role in the production account',
          'Have developers run builds locally and upload artifacts to an S3 bucket the production account polls every hour',
          'Use CodePipeline but grant the pipeline account AdministratorAccess in the production account to avoid configuring roles',
        ],
        correct: 1,
        explanation: {
          summary: 'CodePipeline + CodeBuild + manual approval + a cross-account assumed role is the managed, least-overhead, least-privilege pattern that satisfies every stated requirement.',
          perOption: [
            'Self-managed Jenkins is exactly the operational overhead to avoid, and storing long-lived prod access keys in Jenkins violates least privilege and credential-hygiene best practice.',
            'Correct — every requirement maps to a native action: GitHub source, CodeBuild for build/test/ECR push, a manual approval gate, and a cross-account role for the prod deploy. No servers, no stored credentials.',
            'Local builds plus hourly S3 polling is neither continuous, managed, nor auditable, and adds latency and drift.',
            'Granting AdministratorAccess cross-account defeats least privilege; a scoped deployment role is the correct, secure pattern.',
          ],
          link: 'Domain 1 · Task 1.1 — Implement CI/CD pipelines',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'A blueprint-level walkthrough of the DOP-C02 exam — domains, style, and key services. A companion overview that pairs with every session.' },
        { videoId: 'NCXzTgjUOQo', title: 'CI/CD Pipeline with AWS CodePipeline, CodeCommit, CodeBuild, and CodeDeploy', channel: 'Amazon Web Services', relevance: 'Official AWS walkthrough of an end-to-end pipeline — the exact source/build/deploy chain at the heart of Task 1.1.' },
      ],
      keyTerms: [
        { term: 'CodePipeline', def: 'The orchestration service that models a release as ordered stages and actions and runs them automatically on a source change.' },
        { term: 'CodeBuild', def: 'A fully managed, pay-per-minute build service that compiles code, runs tests, and produces artifacts in an ephemeral container defined by a buildspec.' },
        { term: 'Artifact store', def: 'The S3 bucket (KMS-encrypted) where CodePipeline passes output from one stage as input to the next.' },
        { term: 'Cross-account role', def: 'An IAM role in a target account that the pipeline assumes to deploy there, avoiding any long-lived credentials.' },
        { term: 'Manual approval action', def: 'A pipeline action that pauses for a human to approve or reject before the next stage runs — a change-control gate.' },
      ],
      awsServices: [
        { name: 'AWS CodePipeline', purpose: 'Orchestrates the CI/CD workflow across source, build, test, approval, and deploy stages.' },
        { name: 'AWS CodeBuild', purpose: 'Runs builds and tests in managed containers and can build and push Docker images to ECR.' },
        { name: 'AWS Secrets Manager / SSM Parameter Store', purpose: 'Supply build/deploy secrets and config at run time so credentials are never hardcoded.' },
      ],
      examTips: [
        '"Fully managed build, no servers to patch" → CodeBuild. Self-managed Jenkins is the higher-overhead distractor.',
        'Cross-account deploy = assume a role in the target account + grant that account on BOTH the artifact bucket policy and the KMS key policy.',
        'Secrets belong in Secrets Manager / Parameter Store and are referenced from the buildspec — never hardcoded in repos, templates, or AMIs.',
        'Add a manual approval action when a question asks for a human gate before production.',
        'CodePipeline orchestrates; it does not build or deploy by itself — match each verb in the stem to the right Code* service.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · SDLC Automation',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.2',
      title: 'Automated Testing in the Pipeline — From Unit Tests to Load at Scale',
      duration: 30,
      summary: 'A pipeline is only as safe as the tests that gate it. This session covers the test pyramid in a CI/CD context: which tests run where, how exit codes signal pass/fail, how to measure coverage, and how to run integration, load, and security tests by invoking AWS services from within the pipeline.',
      objectives: [
        'Place unit, integration, acceptance, UI, and security tests at the right pipeline stages',
        'Explain how application exit codes and CodeBuild report groups drive pass/fail decisions',
        'Run tests on pull requests and merges to catch defects before they reach the main branch',
        'Invoke AWS services (Lambda, CodeBuild, Device Farm, third-party tools) for testing inside a pipeline',
      ],
      preLearningCheck: {
        question: 'In a CI/CD pipeline, where do fast unit tests belong, and where do slower load/stress tests belong?',
        options: [
          'Both run only in production after deployment',
          'Unit tests run early in the build stage on every commit; load/stress tests run later against a deployed test environment',
          'Load tests run first because they are most important',
          'Tests should be run manually by QA outside the pipeline',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The principle: cheap, fast tests fail fast and early (shift left); expensive, slow tests run later against a real deployed environment where they are meaningful.',
      },
      sections: [
        {
          heading: 'The test pyramid in a pipeline',
          body: 'The exam expects you to place tests sensibly. Fast, cheap unit tests run on every commit inside the build stage — they catch most defects and give near-instant feedback. Integration tests (does the service talk to its dependencies?) run after a build succeeds. Acceptance and UI tests validate end-to-end behavior against a deployed environment. Load, stress, and performance tests run last, against a production-like test stage, because they are slow and need real infrastructure.\n\nThe organizing principle is "shift left": catch the cheapest-to-fix defects as early as possible, and reserve expensive tests for later stages where they add unique value.',
          callout: { type: 'note', text: 'Security scanning (SAST on source, dependency/vulnerability scans, image scanning in ECR) is itself a test stage. The exam treats security scans as first-class pipeline tests, not an afterthought.' },
          interactive: 'test-stage',
        },
        {
          heading: 'Exit codes, reports, and gating',
          body: 'A test action communicates pass/fail through the process exit code: zero means success, non-zero fails the build and stops the pipeline. This is how CodeBuild knows whether to proceed. Beyond pass/fail, CodeBuild test report groups capture which tests ran and code-coverage metrics for visibility and trend tracking.',
          bullets: [
            'A non-zero exit code in any buildspec phase fails the build — wire your test runner to exit non-zero on failure.',
            'Test report groups surface JUnit/Cucumber-style results and coverage in the console.',
            'Failing the pipeline on a coverage threshold is done in the buildspec by exiting non-zero when coverage drops below the bar.',
            'Use separate CodeBuild actions (or stages) so a failing integration test does not get blamed on the unit-test action — clearer signal.',
          ],
        },
        {
          heading: 'Testing on pull requests and merges',
          body: 'The earliest gate is the pull request. Running builds and tests automatically when a PR is opened (or when code merges) prevents broken code from ever reaching the main branch. With CodeBuild you trigger builds on PR/webhook events from GitHub or CodeCommit, report status back, and block the merge until checks pass.',
          bullets: [
            'CodeBuild webhooks can trigger on PULL_REQUEST_CREATED / UPDATED events to validate proposed changes.',
            'Branch protection (in the source provider) blocks merging until the required check passes.',
            'This is continuous integration in the literal sense — integrate and test small changes often.',
          ],
          callout: { type: 'tip', text: 'When a scenario says "catch defects before they reach the main/release branch," the answer is running automated tests on the pull request, not after deployment.' },
        },
        {
          heading: 'Invoking AWS services for testing at scale',
          body: 'Professional scenarios go beyond unit tests. You invoke other services from within the pipeline: a Lambda invoke action to run a custom validation, a separate CodeBuild project for load testing with a tool like JMeter or Locust, AWS Device Farm for mobile UI testing, or a synthetic canary to validate a deployed endpoint.',
          bullets: [
            'CodePipeline has a Lambda invoke action for custom test/validation logic that returns success or failure to the pipeline.',
            'Load/stress tests run in a CodeBuild action against a deployed test environment, often using Fargate or EC2 to generate load.',
            'CloudWatch Synthetics canaries continuously test endpoints and can gate or alarm on failures.',
            'Application health for blue/green deploys can be validated by CodeDeploy lifecycle hooks (e.g. a Lambda that runs validation before traffic shifts).',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A buildspec runs a test suite, but failing tests do not stop the pipeline — it deploys broken code. What is the most likely cause?',
          options: [
            'The test runner exits with code 0 even when tests fail, so CodeBuild treats the phase as successful',
            'CodePipeline cannot run tests',
            'Unit tests must run in production',
            'The artifact bucket is full',
          ],
          correct: 0,
          explainCorrect: 'Correct — CodeBuild gates on the exit code. If the test command swallows failures and returns 0, the build "passes." The runner must exit non-zero on failure.',
          elaborativePrompt: 'Why is the process exit code, rather than parsing log text, the reliable way for a build system to know whether a step succeeded?',
        },
        {
          afterSection: 2,
          question: 'A team wants to prevent any code that breaks unit tests from ever being merged into the main branch. What is the best approach?',
          options: [
            'Run a load test in production nightly',
            'Trigger CodeBuild on pull-request events and require the check to pass before the merge is allowed',
            'Email developers a reminder to test their code',
            'Deploy first, then run unit tests',
          ],
          correct: 1,
          explainCorrect: 'Correct — testing on the pull request with a required status check blocks broken code at the gate, before it reaches main.',
          elaborativePrompt: 'How does shifting tests to the pull-request stage change the cost and speed of fixing a defect compared with catching it after deployment?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a team ships a regression because a slow integration bug slipped through. Describe where unit, integration, and load tests should sit in their pipeline, how exit codes gate each stage, and what single change would have caught the bug before the main branch.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company wants its pipeline to (1) block merges that fail unit tests, (2) run integration tests against a deployed test stack, and (3) run load tests only against the staging environment before production. Which design correctly sequences these tests?',
        options: [
          'Run all three test types only in production to use real traffic',
          'Run unit tests on pull requests as a required check, integration tests in a build action after deploying to the test stack, and load tests in a staging stage before the production approval',
          'Run load tests first on every commit, then unit tests after deployment',
          'Skip unit tests and rely on manual QA before each release',
        ],
        correct: 1,
        explanation: {
          summary: 'Tests are placed by cost and meaning: cheap unit tests gate the merge, integration tests run against a real test deployment, and slow load tests run in staging before prod — classic shift-left sequencing.',
          perOption: [
            'Testing only in production exposes users to defects and is the opposite of catching problems early.',
            'Correct — unit tests on the PR, integration tests after the test deploy, and load tests in staging before the prod gate matches the test pyramid and the stated requirements.',
            'Load tests are slow and need a deployed environment; running them first on every commit is wasteful and meaningless without infrastructure.',
            'Relying on manual QA removes automation and repeatability — the exact thing CI/CD exists to replace.',
          ],
          link: 'Domain 1 · Task 1.2 — Integrate automated testing into CI/CD pipelines',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview of the DOP-C02 blueprint — revisit the Domain 1 segment alongside this session.' },
      ],
      keyTerms: [
        { term: 'Shift left', def: 'The practice of running the cheapest, fastest tests as early as possible so defects are caught and fixed before they propagate.' },
        { term: 'Exit code', def: 'The numeric status a process returns; zero means success and non-zero fails the build stage, gating the pipeline.' },
        { term: 'Test report group', def: 'A CodeBuild construct that collects test results and code-coverage metrics for visibility and trend tracking.' },
        { term: 'Pull-request build', def: 'A CodeBuild build triggered by a PR event that validates a change before it can be merged.' },
        { term: 'CloudWatch Synthetics canary', def: 'A scripted, scheduled test that continuously exercises an endpoint or workflow and alarms on failure.' },
      ],
      awsServices: [
        { name: 'AWS CodeBuild', purpose: 'Runs unit, integration, coverage, and load tests, gating on exit codes and publishing report groups.' },
        { name: 'AWS Lambda (pipeline invoke)', purpose: 'Runs custom validation logic as a pipeline action, returning pass/fail to CodePipeline.' },
        { name: 'Amazon CloudWatch Synthetics', purpose: 'Continuously tests deployed endpoints with canaries and surfaces failures as alarms.' },
      ],
      examTips: [
        'Place tests by cost: unit early on the PR, integration after a test deploy, load/stress last in staging.',
        'CodeBuild gates on the exit code — a runner that exits 0 on failure silently lets broken code through.',
        '"Block broken code before the main branch" → run tests on the pull request with a required status check.',
        'Security scans (SAST, dependency, image scanning) are pipeline tests too — treat them as gates.',
        'Use a Lambda invoke action or CodeBuild action to invoke AWS services for custom or large-scale testing.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · SDLC Automation',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.3',
      title: 'Build and Manage Artifacts — CodeArtifact, ECR, and Image Builder',
      duration: 30,
      summary: 'Pipelines produce things: compiled packages, container images, and machine images. This session covers where those artifacts live, how to secure and version them, how their lifecycles are managed, and how EC2 Image Builder automates the creation of hardened AMIs and container images.',
      objectives: [
        'Choose the right artifact repository: CodeArtifact for packages, ECR for images, S3 for generic artifacts',
        'Secure artifact access with IAM and repository policies and encrypt artifacts at rest',
        'Apply lifecycle policies to expire old images and objects and control storage cost',
        'Automate hardened AMI and container image creation with EC2 Image Builder',
      ],
      preLearningCheck: {
        question: 'A team builds Docker images in their pipeline and needs a managed, private registry to store and scan them. Which AWS service fits?',
        options: [
          'AWS CodeArtifact',
          'Amazon Elastic Container Registry (Amazon ECR)',
          'Amazon S3 Glacier',
          'AWS CodeCommit',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. ECR is the managed private container registry, with built-in image scanning and lifecycle policies. CodeArtifact is for language packages (npm, pip, Maven), not images.',
      },
      sections: [
        {
          heading: 'Choosing the right artifact store',
          body: 'Match the artifact type to the repository. AWS CodeArtifact is a managed repository for software packages — npm, PyPI, Maven, NuGet — and can proxy public registries so builds are reproducible and not dependent on the public internet. Amazon ECR is the managed private registry for container images, with vulnerability scanning and lifecycle policies. Amazon S3 holds generic build artifacts (zip files, binaries) and is the CodePipeline artifact store.',
          bullets: [
            'CodeArtifact: language packages; upstream/proxy to public repos; domain-scoped sharing across accounts.',
            'ECR: Docker/OCI images; scan-on-push; immutable tags option; cross-account and cross-Region replication.',
            'S3: generic artifacts and the pipeline artifact store; versioning and lifecycle rules.',
            'EC2 Image Builder output: AMIs and container images distributed to accounts/Regions.',
          ],
          callout: { type: 'note', text: 'Packages → CodeArtifact. Images → ECR. Generic files / pipeline hand-off → S3. AMIs and golden images → EC2 Image Builder. Memorize this four-way split.' },
        },
        {
          heading: 'Securing and versioning artifacts',
          body: 'Artifacts often contain proprietary code, so access control and encryption matter. Repository and resource policies plus IAM control who can read and publish; KMS encrypts artifacts at rest. Versioning and immutability prevent a published artifact from being silently overwritten.',
          bullets: [
            'ECR supports immutable image tags so a tag like v1.2.3 can never be repointed — critical for reproducible deploys.',
            'ECR scan-on-push surfaces CVEs in image layers; gate the pipeline on scan results for supply-chain hygiene.',
            'CodeArtifact uses domain and repository policies for cross-account package sharing under least privilege.',
            'S3 artifact buckets should enforce encryption, block public access, and use bucket policies scoped to the pipeline roles.',
          ],
        },
        {
          heading: 'Artifact lifecycle and cost',
          body: 'Artifacts accumulate. Old container images, package versions, and build outputs cost money and clutter registries. Lifecycle policies expire them automatically.',
          bullets: [
            'ECR lifecycle policies expire images by count (keep last N) or age (older than X days), often keeping tagged releases and pruning untagged layers.',
            'S3 lifecycle rules transition or expire old artifacts (e.g. delete pipeline artifacts after 30 days).',
            'CodeArtifact retains versions but you can clean up unused packages to control cost.',
            'Right lifecycle policy = lower storage cost without losing the releases you must keep.',
          ],
          callout: { type: 'tip', text: '"Registry is filling up with old untagged images" → an ECR lifecycle policy that expires untagged images and keeps the last N tagged ones.' },
        },
        {
          heading: 'EC2 Image Builder — golden images as code',
          body: 'Building and patching AMIs by hand does not scale. EC2 Image Builder automates the pipeline that creates, hardens, tests, and distributes AMIs and container images. You define a recipe (base image + components), a pipeline runs on a schedule or trigger, tests the image, and distributes the result to target accounts and Regions.',
          bullets: [
            'Image Builder produces consistent, patched, hardened golden images without manual snapshots.',
            'Components are reusable build/test/validate steps (install software, apply CIS hardening, run tests).',
            'Distribution settings copy the finished AMI/image to multiple accounts and Regions automatically.',
            'Scheduled pipelines rebuild images when a new base AMI or patch is available, keeping fleets current.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A build needs to consume internal npm packages and proxy public npm so builds are reproducible and not dependent on the public registry. Which service fits?',
          options: [
            'Amazon ECR',
            'AWS CodeArtifact with an upstream to the public npm registry',
            'Amazon S3 Glacier Deep Archive',
            'AWS CodeDeploy',
          ],
          correct: 1,
          explainCorrect: 'Correct — CodeArtifact is the managed package repository; an upstream/proxy to public npm gives reproducible, available builds. ECR is for images, not packages.',
          elaborativePrompt: 'Why does proxying the public package registry through CodeArtifact improve both build reproducibility and supply-chain security?',
        },
        {
          afterSection: 3,
          question: 'A company must run a fleet of EC2 instances on a hardened, patched AMI that is rebuilt monthly and distributed to three accounts. What is the least-overhead solution?',
          options: [
            'Manually launch an instance, patch it, and snapshot a new AMI each month',
            'Use EC2 Image Builder with a recipe and scheduled pipeline that hardens, tests, and distributes the AMI to all accounts',
            'Bake credentials into the AMI and copy it by hand',
            'Use a single AMI forever and patch at boot with a long user-data script',
          ],
          correct: 1,
          explainCorrect: 'Correct — EC2 Image Builder automates building, hardening, testing, and cross-account distribution on a schedule. Manual snapshots do not scale and drift.',
          elaborativePrompt: 'What risks (drift, inconsistency, human error) does automating golden-image creation with Image Builder remove compared with manual AMI snapshots?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a pipeline produces an npm package, a Docker image, and a hardened AMI. Walk through which repository each belongs in, how you secure and version it, how you stop old artifacts from piling up, and how the AMI gets rebuilt and shared across accounts automatically.',
      sample: {
        type: 'multiple-choice',
        stem: 'A DevOps team builds container images in CodeBuild. They need a private registry that scans images for vulnerabilities on push, enforces immutable tags for releases, and automatically removes old untagged layers to control cost. Which solution meets these needs?',
        options: [
          'Store images in an S3 bucket with versioning enabled',
          'Push images to Amazon ECR with scan-on-push, immutable tags for release tags, and a lifecycle policy that expires untagged images',
          'Store images in AWS CodeArtifact with an npm upstream',
          'Keep images only on the build host and copy them manually at deploy time',
        ],
        correct: 1,
        explanation: {
          summary: 'ECR is the managed image registry; scan-on-push, tag immutability, and lifecycle policies directly satisfy the scanning, reproducibility, and cost requirements.',
          perOption: [
            'S3 stores objects, not container images, and offers no image scanning, tag immutability, or registry semantics.',
            'Correct — ECR provides exactly these features: vulnerability scanning on push, immutable release tags, and lifecycle expiry of untagged layers.',
            'CodeArtifact is for language packages (npm, pip, Maven), not container images.',
            'Manual copying defeats automation and provides no scanning, versioning, or lifecycle control.',
          ],
          link: 'Domain 1 · Task 1.3 — Build and manage artifacts',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview — the artifact and registry services appear throughout the Domain 1 walkthrough.' },
      ],
      keyTerms: [
        { term: 'CodeArtifact', def: 'A managed software package repository (npm, PyPI, Maven, NuGet) that can proxy public registries for reproducible, available builds.' },
        { term: 'Amazon ECR', def: 'A managed private container registry with image scanning, tag immutability, lifecycle policies, and cross-account/Region replication.' },
        { term: 'Image scanning', def: 'Scanning container image layers for known vulnerabilities (CVEs), e.g. ECR scan-on-push.' },
        { term: 'Lifecycle policy', def: 'A rule that automatically expires old artifacts (ECR images, S3 objects) by age or count to control cost.' },
        { term: 'EC2 Image Builder', def: 'A service that automates building, hardening, testing, and distributing AMIs and container images from a recipe.' },
      ],
      awsServices: [
        { name: 'AWS CodeArtifact', purpose: 'Stores and shares language packages and proxies public registries for reproducible builds.' },
        { name: 'Amazon ECR', purpose: 'Hosts private container images with scanning, immutability, and lifecycle management.' },
        { name: 'EC2 Image Builder', purpose: 'Automates golden AMI and container image creation, testing, and cross-account distribution.' },
      ],
      examTips: [
        'Packages → CodeArtifact; images → ECR; generic files / pipeline hand-off → S3; golden AMIs → EC2 Image Builder.',
        'ECR scan-on-push + immutable tags = supply-chain hygiene and reproducible release deploys.',
        '"Registry filling with old images" → ECR lifecycle policy (expire untagged, keep last N tagged).',
        'Automate hardened AMIs with EC2 Image Builder — never rely on manual snapshots that drift.',
        'Image Builder distribution settings copy finished images across accounts and Regions automatically.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · SDLC Automation',
      domain: 'd1',
      weight: '22%',
      task: 'Task 1.4',
      title: 'Deployment Strategies — Blue/Green and Canary across EC2, ECS, EKS, and Lambda',
      duration: 30,
      summary: 'How you release is as important as what you release. This session covers the deployment strategies the exam loves — in-place, rolling, blue/green, and canary — how CodeDeploy implements them on each compute platform, mutable vs. immutable infrastructure, and how to roll back fast when a release goes wrong.',
      objectives: [
        'Distinguish in-place, rolling, blue/green, and canary deployments and their trade-offs',
        'Explain how CodeDeploy implements each strategy on EC2/on-prem, ECS, and Lambda',
        'Contrast mutable (in-place patch) with immutable (replace) deployment patterns',
        'Design automatic rollback on alarms and failed health checks to limit blast radius',
      ],
      preLearningCheck: {
        question: 'A team needs to release a new version with zero downtime and the ability to roll back instantly by shifting traffic, accepting that they run two full environments briefly. Which strategy fits best?',
        options: [
          'In-place deployment that updates the running servers',
          'Blue/green deployment that stands up a parallel (green) environment and shifts traffic once it is healthy',
          'Manually copying files to each server during a maintenance window',
          'Deploying directly to production without a test',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Blue/green keeps the old (blue) environment intact while the new (green) one is validated, so rollback is just shifting traffic back — instant and low-risk, at the cost of running two environments briefly.',
      },
      sections: [
        {
          heading: 'The four strategies and their trade-offs',
          body: 'The exam wants you to match a strategy to constraints — downtime tolerance, rollback speed, cost, and risk appetite.\n\nIn-place updates the existing instances (cheapest, but causes capacity reduction or downtime and slow rollback). Rolling replaces instances in batches (no full second fleet, gradual, but a mixed-version window). Blue/green stands up a complete parallel environment and shifts all traffic once healthy (zero downtime, instant rollback, but double infrastructure briefly). Canary shifts a small percentage of traffic first, watches metrics, then completes (lowest blast radius, catches problems with real traffic before full rollout).',
          callout: { type: 'note', text: 'Blue/green = instant rollback by traffic switch, double cost briefly. Canary = gradual traffic shift to limit blast radius. Rolling = batch replacement, no second fleet. In-place = cheapest, slowest/riskiest rollback. The constraints in the stem pick the winner.' },
          interactive: 'deploy-strategy',
        },
        {
          heading: 'How CodeDeploy implements them per platform',
          body: 'CodeDeploy is the release engine, and the available strategies depend on the compute target. Knowing what each platform supports is a common question.',
          bullets: [
            'EC2/on-premises: in-place or blue/green; uses the CodeDeploy agent and an appspec.yml with lifecycle hooks (BeforeInstall, AfterInstall, ApplicationStart, ValidateService).',
            'Amazon ECS: blue/green via CodeDeploy shifting traffic between two task sets behind an ALB; supports canary and linear traffic shifting.',
            'AWS Lambda: traffic shifting between function versions via aliases — canary (e.g. 10% for 5 min) or linear, with automatic rollback on alarm.',
            'Amazon EKS: typically managed via Kubernetes-native rollouts (or tools like Argo/Flagger); CodeDeploy is not the primary mechanism.',
          ],
          callout: { type: 'tip', text: 'Lambda and ECS canary/linear shifting is configured by deployment configuration (e.g. CodeDeployDefault.LambdaCanary10Percent5Minutes). EC2 blue/green needs the agent and a load balancer to shift traffic between fleets.' },
        },
        {
          heading: 'Mutable vs. immutable infrastructure',
          body: 'A deeper pattern underlies the strategies. Mutable (in-place) deployments change servers that keep running — patching, updating code on the same instance. Immutable deployments never modify a running server; they replace it with a freshly built one (from a new AMI or container image) and discard the old. Immutable is the modern default because it eliminates configuration drift and makes rollback a matter of pointing back at the previous image.',
          bullets: [
            'Immutable pairs naturally with blue/green and with golden images from EC2 Image Builder.',
            'Mutable risks drift: servers diverge over time as patches and hotfixes accumulate unevenly.',
            'Auto Scaling groups with launch templates make immutable replacement easy — new launch template version → instance refresh.',
            'Containers are inherently immutable: you ship a new image, not a patched running container.',
          ],
        },
        {
          heading: 'Rollback and limiting blast radius',
          body: 'A deployment strategy is only safe if failure triggers a fast, automatic rollback. CodeDeploy can roll back automatically when a deployment fails or a CloudWatch alarm fires during the deployment, and lifecycle hooks let you validate before traffic shifts.',
          bullets: [
            'Configure automatic rollback on deployment failure and on alarm — do not rely on a human noticing.',
            'CodeDeploy lifecycle hooks (e.g. a Lambda at BeforeAllowTraffic) run validation tests before traffic moves to the new version.',
            'Canary/linear shifting limits how many users see a bad version before the alarm rolls it back.',
            'For blue/green, keep the blue environment until the green is proven, then decommission — rollback is just re-pointing traffic.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A serverless team wants to release a new Lambda version to 10% of traffic for 5 minutes, automatically rolling back if errors spike, then shift the rest. Which mechanism provides this?',
          options: [
            'An in-place EC2 deployment with the CodeDeploy agent',
            'CodeDeploy traffic shifting on a Lambda alias using a canary deployment configuration with a CloudWatch alarm for rollback',
            'Manually editing the function code in the console',
            'A rolling deployment across an Auto Scaling group',
          ],
          correct: 1,
          explainCorrect: 'Correct — CodeDeploy shifts traffic between Lambda versions via an alias using a canary config, and a linked CloudWatch alarm triggers automatic rollback.',
          elaborativePrompt: 'Why does shifting only 10% of traffic first meaningfully reduce the blast radius of a bad release compared with an all-at-once switch?',
        },
        {
          afterSection: 2,
          question: 'A company suffers repeated outages because servers drift apart as hotfixes are applied unevenly. Which pattern best eliminates this drift?',
          options: [
            'Apply more frequent in-place patches by hand',
            'Adopt immutable deployments — replace instances from a freshly built golden image rather than modifying running ones',
            'Increase the instance size',
            'Disable Auto Scaling',
          ],
          correct: 1,
          explainCorrect: 'Correct — immutable infrastructure replaces servers from a known-good image, so no two servers diverge over time. Drift is designed out.',
          elaborativePrompt: 'How does building from a golden image and replacing instances make rollback simpler than patching servers in place?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a payments service must release with zero downtime, validate the new version against real traffic before full rollout, and roll back automatically if error rates rise. Walk through which strategy you choose, how CodeDeploy implements it for your compute platform, and exactly what triggers the rollback.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company runs a critical service on Amazon ECS behind an Application Load Balancer. They require zero-downtime releases, automatic rollback if 5xx errors rise during the release, and the ability to validate the new version against a small slice of live traffic first. Which deployment approach meets all requirements?',
        options: [
          'In-place deployment that restarts tasks on the existing service',
          'CodeDeploy blue/green for ECS with canary traffic shifting between task sets and a CloudWatch alarm on 5xx that triggers automatic rollback',
          'Manually scale the service to zero and back up during a maintenance window',
          'A rolling update with no health checks or alarms',
        ],
        correct: 1,
        explanation: {
          summary: 'ECS blue/green via CodeDeploy with canary shifting and an alarm-triggered rollback delivers zero downtime, live-traffic validation, and automatic recovery — every stated requirement.',
          perOption: [
            'In-place task restarts cause a version-mixed window and offer no instant rollback or canary validation.',
            'Correct — CodeDeploy blue/green for ECS shifts traffic between task sets (canary first), and a 5xx CloudWatch alarm triggers automatic rollback to the original task set.',
            'Scaling to zero is downtime, the opposite of the requirement.',
            'A rolling update without health checks or alarms cannot validate or roll back automatically.',
          ],
          link: 'Domain 1 · Task 1.4 — Implement deployment strategies for instance, container, and serverless environments',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview — deployment strategies are a heavily tested Domain 1 topic covered in the walkthrough.' },
      ],
      keyTerms: [
        { term: 'Blue/green deployment', def: 'Standing up a parallel new (green) environment and shifting traffic once healthy, enabling zero downtime and instant rollback.' },
        { term: 'Canary deployment', def: 'Shifting a small percentage of traffic to the new version first, watching metrics, then completing — limiting blast radius.' },
        { term: 'Rolling deployment', def: 'Replacing instances in batches so there is no full second fleet, at the cost of a temporary mixed-version state.' },
        { term: 'Immutable infrastructure', def: 'Never modifying a running server; replacing it with a freshly built image to eliminate configuration drift.' },
        { term: 'CodeDeploy lifecycle hook', def: 'A defined point in a deployment (e.g. BeforeAllowTraffic) where validation logic runs before traffic shifts.' },
      ],
      awsServices: [
        { name: 'AWS CodeDeploy', purpose: 'Implements in-place, blue/green, canary, and linear deployments across EC2/on-prem, ECS, and Lambda with automatic rollback.' },
        { name: 'Elastic Load Balancing (ALB)', purpose: 'Shifts traffic between blue and green fleets/task sets during a deployment.' },
        { name: 'Amazon CloudWatch alarms', purpose: 'Trigger automatic CodeDeploy rollback when error or latency metrics breach during a release.' },
      ],
      examTips: [
        'Match strategy to constraints: zero downtime + instant rollback → blue/green; limit blast radius with live traffic → canary; no second fleet → rolling.',
        'Lambda/ECS canary and linear shifting is set by the deployment configuration; EC2 blue/green needs the agent + a load balancer.',
        'Immutable (replace from a golden image) eliminates drift; mutable (in-place patch) accumulates it.',
        'Always configure automatic rollback on deployment failure AND on a CloudWatch alarm — never rely on a human.',
        'EKS rollouts are usually Kubernetes-native; CodeDeploy is the engine for EC2, ECS, and Lambda.',
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — CONFIGURATION MANAGEMENT AND IaC (17%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s5',
      number: 5,
      module: 'Domain 2 · Configuration Management & IaC',
      domain: 'd2',
      weight: '17%',
      task: 'Task 2.1',
      title: 'Infrastructure as Code — CloudFormation, SAM, CDK, and StackSets',
      duration: 30,
      summary: 'Infrastructure as code is how DevOps engineers make environments reproducible, reviewable, and recoverable. This session builds the IaC toolkit: CloudFormation as the foundation, SAM and CDK as higher-level authoring layers, StackSets for multi-account/Region deployment, and how change sets, drift detection, and reusable modules keep infrastructure safe and governed.',
      objectives: [
        'Compose infrastructure with CloudFormation, SAM, and CDK and know when each fits',
        'Deploy stacks across many accounts and Regions with CloudFormation StackSets',
        'Use change sets and drift detection to manage change safely on IaC platforms',
        'Package governance and standards into reusable building blocks (modules, Service Catalog)',
      ],
      preLearningCheck: {
        question: 'A platform team must deploy the same baseline stack (logging, guardrails, IAM roles) into 200 accounts across 3 Regions, and keep them in sync as the baseline evolves. Which CloudFormation capability is purpose-built for this?',
        options: [
          'A single stack deployed manually in each account',
          'CloudFormation StackSets, which deploy and update a stack across many accounts and Regions from one operation',
          'Copying the template into each account by email',
          'Nested stacks within one account',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. StackSets are the multi-account, multi-Region deployment mechanism: define once, deploy and update across an organization, optionally with automatic deployment to new accounts via Organizations integration.',
      },
      sections: [
        {
          heading: 'The IaC authoring layers',
          body: 'CloudFormation is the foundational AWS IaC engine: a declarative template (JSON/YAML) describes resources, and CloudFormation provisions, updates, and deletes them as a managed stack with rollback on failure. SAM (Serverless Application Model) is a CloudFormation extension with concise syntax for serverless apps (functions, APIs, tables). CDK (Cloud Development Kit) lets you define infrastructure in a real programming language (TypeScript, Python, etc.) that synthesizes to CloudFormation — ideal when you want loops, conditionals, and reusable constructs.',
          bullets: [
            'CloudFormation: declarative source of truth; stacks, parameters, outputs, exports, rollback.',
            'SAM: shorthand for serverless; transforms into CloudFormation at deploy time.',
            'CDK: imperative authoring in code that compiles to CloudFormation; great for abstraction and reuse.',
            'All three converge on CloudFormation as the execution engine — they are authoring choices, not separate runtimes.',
          ],
          callout: { type: 'note', text: 'Third-party tools like Terraform also appear in scenarios. When a question stresses AWS-native, managed IaC with no extra tooling, CloudFormation/SAM/CDK is the intended answer; when it stresses an existing multi-cloud Terraform practice, respect that.' },
          interactive: 'iac-selector',
        },
        {
          heading: 'StackSets — IaC across accounts and Regions',
          body: 'A single stack lives in one account and Region. StackSets extend a template to many accounts and Regions from one administrative operation. With AWS Organizations integration, StackSets can deploy automatically to accounts as they join an organizational unit — the backbone of landing-zone governance.',
          bullets: [
            'Service-managed permissions (via Organizations) auto-deploy to new accounts in target OUs; self-managed uses explicit admin/execution roles.',
            'Use StackSets for baseline guardrails: centralized logging, IAM roles, Config rules, security tooling.',
            'Updates propagate to all stack instances, keeping the fleet consistent as the baseline changes.',
            'Drift can be detected across stack instances to find accounts that diverged.',
          ],
        },
        {
          heading: 'Changing infrastructure safely',
          body: 'IaC change management is itself an exam topic. Change sets preview exactly what an update will add, modify, or replace before you execute it — critical when a change could replace a database. Drift detection reports where the live resources no longer match the template (someone changed it by hand).',
          bullets: [
            'Change sets: review create/modify/REPLACE actions before applying — a replacement on a stateful resource is a red flag.',
            'Drift detection: find manual, out-of-band changes that broke the IaC source of truth, then re-converge.',
            'Stack policies protect critical resources from accidental update/replacement during a stack update.',
            'DeletionPolicy / UpdateReplacePolicy (e.g. Retain, Snapshot) protect data on stateful resources.',
          ],
          callout: { type: 'warning', text: 'A CloudFormation update that shows "Replacement: True" on an RDS database or EBS volume will destroy and recreate it — losing data unless a snapshot/retain policy is set. Always read the change set before executing.' },
        },
        {
          heading: 'Reusable, governed building blocks',
          body: 'At scale, you do not want every team writing raw templates. You package approved patterns so teams self-serve within guardrails. CloudFormation modules and CDK constructs encapsulate reusable, standards-compliant resources. AWS Service Catalog publishes approved products (templates) that users launch without needing broad permissions — governance built in.',
          bullets: [
            'CloudFormation modules / CDK constructs: encode security and tagging standards once, reuse everywhere.',
            'Service Catalog: curated, versioned products with launch constraints so users deploy approved stacks under least privilege.',
            'AppConfig manages application configuration and feature flags separately from code, with validation and safe rollout.',
            'Config and Config rules continuously check that deployed resources stay compliant with the standard.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A team wants to define infrastructure using TypeScript with loops and reusable classes, but still deploy through AWS-native, managed provisioning. Which tool fits?',
          options: [
            'Raw CloudFormation YAML only',
            'AWS CDK, which synthesizes the TypeScript into CloudFormation for deployment',
            'A bash script calling the CLI',
            'Editing resources by hand in the console',
          ],
          correct: 1,
          explainCorrect: 'Correct — CDK lets you author in a real language and compiles to CloudFormation, combining programmability with managed, declarative provisioning.',
          elaborativePrompt: 'What do you gain and what do you give up by authoring in CDK versus writing CloudFormation templates directly?',
        },
        {
          afterSection: 2,
          question: 'Before applying a CloudFormation update to a production stack containing an RDS database, an engineer wants to confirm the change will not replace the database. What should they use?',
          options: [
            'Apply the update and watch for errors',
            'Create and review a change set, checking for any Replacement: True on the database resource',
            'Delete the stack and recreate it',
            'Turn off drift detection',
          ],
          correct: 1,
          explainCorrect: 'Correct — a change set previews exactly which resources will be added, modified, or replaced, so a dangerous replacement is caught before execution.',
          elaborativePrompt: 'Why is previewing a change set especially important for stateful resources like databases and volumes?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a platform team must roll a security baseline into every account in their organization, let application teams self-serve approved infrastructure, and never accidentally replace a production database during an update. Walk through which IaC mechanisms deliver each of those three goals.',
      sample: {
        type: 'multiple-choice',
        stem: 'A central platform team must deploy and continuously update a standard security baseline (Config rules, IAM roles, centralized logging) across all 150 accounts in their AWS Organization, including any new accounts added later, with the least ongoing effort. Which solution fits best?',
        options: [
          'Write a shell script that loops over accounts and runs the CLI from a laptop',
          'Use CloudFormation StackSets with service-managed permissions and automatic deployment to the target organizational units',
          'Email the template to each account owner to deploy manually',
          'Create one large nested stack in the management account only',
        ],
        correct: 1,
        explanation: {
          summary: 'StackSets with Organizations service-managed permissions deploy and update a baseline across all accounts and auto-enroll new accounts — exactly the multi-account governance requirement.',
          perOption: [
            'A laptop script is brittle, unaudited, and will not automatically cover new accounts — high ongoing effort.',
            'Correct — service-managed StackSets deploy across the org, propagate updates to all instances, and automatically deploy to new accounts that join the target OUs.',
            'Manual per-account deployment does not scale and guarantees drift and missed accounts.',
            'A nested stack in one account does nothing for the other 149 accounts.',
          ],
          link: 'Domain 2 · Task 2.1 — Define cloud infrastructure and reusable components',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview — IaC and CloudFormation feature prominently in the Domain 2 portion of the walkthrough.' },
      ],
      keyTerms: [
        { term: 'CloudFormation', def: 'The foundational AWS IaC engine that provisions and manages resources from a declarative template as a stack.' },
        { term: 'AWS CDK', def: 'A framework for defining infrastructure in a programming language that synthesizes to CloudFormation.' },
        { term: 'StackSets', def: 'A CloudFormation feature that deploys and updates a stack across many accounts and Regions from one operation.' },
        { term: 'Change set', def: 'A preview of the exact additions, modifications, and replacements a stack update will perform before it runs.' },
        { term: 'Drift detection', def: 'A check that reports where live resources no longer match the IaC template due to out-of-band changes.' },
      ],
      awsServices: [
        { name: 'AWS CloudFormation', purpose: 'Declarative IaC provisioning with stacks, change sets, drift detection, and StackSets for multi-account deployment.' },
        { name: 'AWS Service Catalog', purpose: 'Publishes approved, versioned infrastructure products so teams self-serve under governance and least privilege.' },
        { name: 'AWS AppConfig', purpose: 'Manages and safely rolls out application configuration and feature flags separately from code.' },
      ],
      examTips: [
        'CloudFormation/SAM/CDK all run on CloudFormation — they are authoring choices, not separate engines.',
        'Multi-account/multi-Region baseline → StackSets; with Organizations, auto-deploy to new accounts.',
        'Always review a change set before updating; "Replacement: True" on a database or volume means data loss without a snapshot/retain policy.',
        'Drift detection finds manual changes that broke the IaC source of truth.',
        'Package standards as CloudFormation modules / CDK constructs and publish via Service Catalog for governed self-service.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s6',
      number: 6,
      module: 'Domain 2 · Configuration Management & IaC',
      domain: 'd2',
      weight: '17%',
      task: 'Task 2.2',
      title: 'Multi-Account Automation — Organizations, Control Tower, and SCPs',
      duration: 30,
      summary: 'Real AWS estates are dozens or hundreds of accounts. This session covers automating their creation and governance: AWS Organizations as the structure, Control Tower for an automated landing zone, Service Control Policies as organization-wide guardrails, and the security services (Security Hub, GuardDuty, Detective) that give central visibility at scale.',
      objectives: [
        'Structure an estate with AWS Organizations, organizational units, and consolidated billing',
        'Stand up and govern a landing zone with AWS Control Tower and Account Factory',
        'Enforce organization-wide guardrails with Service Control Policies (SCPs)',
        'Centralize security findings across accounts with Security Hub, GuardDuty, and Detective',
      ],
      preLearningCheck: {
        question: 'A company wants to guarantee that NO account in a specific organizational unit can ever disable CloudTrail or leave a set of approved Regions — regardless of that account admin\'s IAM permissions. Which control enforces this?',
        options: [
          'An IAM policy attached to each user',
          'A Service Control Policy (SCP) attached to the organizational unit',
          'A CloudWatch alarm',
          'A strong password policy',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. An SCP sets the maximum permissions for accounts in an OU. Even a full account administrator cannot exceed the SCP boundary — it is the organization-wide guardrail IAM policies cannot override.',
      },
      sections: [
        {
          heading: 'Organizations — the account structure',
          body: 'AWS Organizations is the foundation of multi-account management. It groups accounts under a management (payer) account, organizes them into organizational units (OUs), provides consolidated billing, and is the integration point for SCPs and service-level delegation. The exam expects you to know it as the substrate every other governance feature builds on.',
          bullets: [
            'OUs group accounts (e.g. Prod, Dev, Sandbox, Security) so policies apply by function.',
            'Consolidated billing aggregates spend and shares volume discounts and Savings Plans/RIs across accounts.',
            'Delegated administrator lets a non-management account run a service (e.g. a Security account administers GuardDuty/Security Hub) — keep the management account minimal.',
            'Trusted access enables services (StackSets, Config, Security Hub) to operate across the organization.',
          ],
          callout: { type: 'note', text: 'Best practice: keep the management account nearly empty and delegate security/operations to dedicated accounts. Workloads never run in the management account.' },
        },
        {
          heading: 'Control Tower and Account Factory',
          body: 'AWS Control Tower automates a best-practice landing zone on top of Organizations: it sets up a multi-account structure, centralized logging and audit accounts, and a library of guardrails. Account Factory standardizes and automates provisioning of new accounts with the baseline already applied — the answer to "automate account creation and onboarding."',
          bullets: [
            'Control Tower deploys preventive guardrails (SCP-based) and detective guardrails (Config rule-based) automatically.',
            'Account Factory (and Account Factory for Terraform) provisions new accounts with networking, logging, and guardrails pre-configured.',
            'Centralized log archive and audit accounts are created as part of the landing zone.',
            'Customizations for Control Tower (CfCT) layers your own CloudFormation/StackSets onto the account lifecycle.',
          ],
          callout: { type: 'tip', text: '"Automate creation, onboarding, and securing of new accounts with a best-practice baseline" → Control Tower + Account Factory. Building the same by hand with Organizations alone is the higher-effort distractor.' },
        },
        {
          heading: 'SCPs — guardrails that IAM cannot override',
          body: 'Service Control Policies define the maximum available permissions for accounts in an OU. They do not grant anything; they bound what IAM in those accounts can allow. This is how you enforce non-negotiable rules — deny leaving approved Regions, deny disabling security services, deny root actions — across every account at once.',
          bullets: [
            'SCPs are guardrails: effective permissions = intersection of SCPs and IAM policies.',
            'Common patterns: region restriction, deny disabling CloudTrail/Config/GuardDuty, deny deleting specific resources, require encryption.',
            'SCPs do not apply to the management account — another reason to keep it empty.',
            'Combine a broad allow with targeted denies, or an allow-list approach, depending on the governance model.',
          ],
        },
        {
          heading: 'Centralized security visibility at scale',
          body: 'Governance is not only prevention; it is detection across the whole estate. AWS Security Hub aggregates findings from many services and accounts into one place; Amazon GuardDuty does intelligent threat detection; Amazon Detective helps investigate. Delegating these to a security account gives a single pane of glass.',
          bullets: [
            'Security Hub: aggregates and prioritizes findings (from GuardDuty, Inspector, Macie, Config) org-wide with standards like CIS/AWS FSBP.',
            'GuardDuty: continuous threat detection from CloudTrail, VPC Flow Logs, and DNS logs; org-wide with auto-enroll for new accounts.',
            'Detective: builds linked data to investigate the root cause of a finding.',
            'Delegate administration to a dedicated security account so the management account stays minimal.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company needs to provision dozens of new accounts that all come pre-configured with centralized logging, baseline networking, and mandatory guardrails, with minimal manual effort. Which solution fits best?',
          options: [
            'Manually create each account and apply settings by hand',
            'AWS Control Tower with Account Factory to standardize and automate account provisioning and guardrails',
            'A single shared account for everyone',
            'IAM users in one account per team',
          ],
          correct: 1,
          explainCorrect: 'Correct — Control Tower + Account Factory automate landing-zone account creation with logging, networking, and guardrails already applied.',
          elaborativePrompt: 'Why is a standardized landing zone safer and cheaper to operate than letting each team configure its own account from scratch?',
        },
        {
          afterSection: 2,
          question: 'Even with an SCP denying it, a particular action still succeeds in the management account. Why?',
          options: [
            'SCPs do not apply to the organization management account',
            'SCPs only work on weekdays',
            'The SCP must be attached to an IAM user',
            'SCPs grant permissions directly',
          ],
          correct: 0,
          explainCorrect: 'Correct — SCPs do not restrict the management account. This is a key reason to keep workloads out of it and run them in member accounts.',
          elaborativePrompt: 'Given SCPs exclude the management account, why is keeping that account nearly empty a security best practice?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company is going from 3 accounts to 80 and wants every new account to be created automatically with logging and guardrails, certain actions denied org-wide no matter what local admins do, and all security findings visible in one place. Walk through which service delivers each of those three outcomes and why IAM alone cannot.',
      sample: {
        type: 'multiple-choice',
        stem: 'A security team must ensure that across an AWS Organization, no member account — even one whose admin has full IAM access — can disable AWS CloudTrail or operate outside two approved Regions. They also want all GuardDuty and Config findings centralized in a dedicated security account. Which combination meets these requirements?',
        options: [
          'Attach IAM policies to every user in every account and review them monthly',
          'Apply SCPs to the relevant OUs to deny disabling CloudTrail and deny non-approved Regions, and delegate Security Hub/GuardDuty administration to the security account for centralized findings',
          'Use strong passwords and MFA only',
          'Move all workloads into the management account so they are easier to watch',
        ],
        correct: 1,
        explanation: {
          summary: 'SCPs enforce non-overridable guardrails on member accounts, and delegated Security Hub/GuardDuty administration centralizes findings — matching every requirement.',
          perOption: [
            'IAM policies can be changed by an account admin and do not provide an org-wide ceiling — they cannot guarantee the restriction.',
            'Correct — SCPs bound permissions regardless of local IAM, and delegating security services to a dedicated account centralizes findings across the org.',
            'Passwords and MFA do not restrict which API actions or Regions an account may use.',
            'Concentrating workloads in the management account is an anti-pattern — SCPs do not even apply there.',
          ],
          link: 'Domain 2 · Task 2.2 — Deploy automation to create, onboard, and secure AWS accounts',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview — multi-account governance with Organizations, Control Tower, and SCPs is core Domain 2 material.' },
      ],
      keyTerms: [
        { term: 'AWS Organizations', def: 'The service that groups AWS accounts under a management account into OUs with consolidated billing and policy attachment points.' },
        { term: 'Organizational unit (OU)', def: 'A grouping of accounts within an organization to which policies like SCPs are attached.' },
        { term: 'AWS Control Tower', def: 'An automated landing-zone service that sets up a governed multi-account environment with guardrails and Account Factory.' },
        { term: 'Service Control Policy (SCP)', def: 'An organization policy that sets the maximum permissions for member accounts; it bounds, but never grants, access.' },
        { term: 'Delegated administrator', def: 'A member account authorized to administer an org-wide service (e.g. GuardDuty) so the management account stays minimal.' },
      ],
      awsServices: [
        { name: 'AWS Organizations', purpose: 'Provides the multi-account structure, consolidated billing, and policy attachment for SCPs and trusted access.' },
        { name: 'AWS Control Tower', purpose: 'Automates a best-practice landing zone with guardrails and standardized account provisioning via Account Factory.' },
        { name: 'AWS Security Hub / GuardDuty / Detective', purpose: 'Centralize security findings, threat detection, and investigation across all accounts.' },
      ],
      examTips: [
        'SCPs are guardrails that bound member-account permissions regardless of IAM — they never apply to the management account.',
        'Automate account creation + baseline → Control Tower + Account Factory; Organizations alone is the higher-effort option.',
        'Keep the management account nearly empty; delegate security/ops to dedicated accounts.',
        'Effective permissions = intersection of SCPs and IAM policies. An SCP deny always wins.',
        'Centralize findings with delegated Security Hub/GuardDuty administration and org-wide auto-enroll for new accounts.',
      ],
    },

    // ─────────────────────────────────────────────────────────────
    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Configuration Management & IaC',
      domain: 'd2',
      weight: '17%',
      task: 'Task 2.3',
      title: 'Operational Automation at Scale — Systems Manager, Lambda, and Step Functions',
      duration: 30,
      summary: 'Beyond provisioning, DevOps engineers automate the ongoing operation of large fleets: inventory, patching, desired-state configuration, and custom workflows. This session covers AWS Systems Manager as the operations toolbox, Lambda for custom automation, and Step Functions for orchestrating complex, multi-step processes reliably.',
      objectives: [
        'Automate inventory, patching, and desired-state configuration with Systems Manager',
        'Maintain compliance and drift correction with State Manager and Config',
        'Build custom automations with Lambda and the AWS SDKs for scenarios no managed feature covers',
        'Orchestrate complex, long-running, multi-step workflows reliably with Step Functions',
      ],
      preLearningCheck: {
        question: 'A company must keep thousands of EC2 instances patched on a schedule, with reporting on which instances are non-compliant, and no SSH access or custom agents to manage. Which AWS service is built for this?',
        options: [
          'AWS Lambda invoked manually per instance',
          'AWS Systems Manager (Patch Manager with maintenance windows and compliance reporting)',
          'Amazon EC2 user data scripts only',
          'AWS CodeDeploy',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. Systems Manager Patch Manager scans and patches fleets on a schedule via maintenance windows and reports compliance — all through the SSM agent, with no SSH or bespoke tooling.',
      },
      sections: [
        {
          heading: 'Systems Manager — the operations toolbox',
          body: 'AWS Systems Manager (SSM) is the central service for operating fleets at scale, all through the SSM agent and IAM (no inbound SSH/RDP needed). The exam treats its capabilities as distinct tools, and you should know which sub-capability solves which problem.',
          bullets: [
            'Patch Manager: scan and patch instances on a schedule via maintenance windows; report compliance.',
            'State Manager: enforce a desired configuration continuously (e.g. ensure the CloudWatch agent is installed and running).',
            'Run Command: execute a command/document across many instances at once, audited and without SSH.',
            'Inventory: collect software, configuration, and metadata across the fleet; Session Manager gives shell access without open ports.',
            'Automation runbooks: multi-step operational workflows (e.g. patch then reboot then validate) defined as documents.',
          ],
          callout: { type: 'note', text: 'Session Manager replaces bastion hosts and open SSH ports — shell access via IAM and logged to CloudTrail/S3. A frequent "secure remote access without inbound ports" answer.' },
          interactive: 'ssm-capability',
        },
        {
          heading: 'Desired state and compliance',
          body: 'Operations at scale means continuously converging the fleet to a known-good state and proving compliance. State Manager applies and re-applies configuration on a schedule so drift is corrected automatically. AWS Config records resource configuration over time and evaluates rules; together they keep the estate compliant and auditable.',
          bullets: [
            'State Manager associations re-apply desired configuration on a cadence — drift self-heals.',
            'Config rules evaluate compliance continuously and can trigger automatic remediation (an SSM Automation runbook).',
            'SSM Compliance and Patch compliance dashboards report which resources are off-baseline.',
            'Pair Config detective rules with SSM Automation remediation for closed-loop correction.',
          ],
        },
        {
          heading: 'Custom automation with Lambda and the SDKs',
          body: 'When no managed feature fits exactly, you write the automation. AWS Lambda running the AWS SDK is the serverless glue for custom operational logic — triggered by events, schedules, or pipelines. The exam favors Lambda over a script on a babysat EC2 instance when the work is event-driven and intermittent.',
          bullets: [
            'Lambda + SDK: custom remediation, enrichment, or cross-service orchestration with no servers to manage.',
            'EventBridge schedules (cron) or event patterns invoke Lambda for time-based or reactive automation.',
            'Lambda is ideal for short, stateless tasks; for long or multi-step work, hand off to Step Functions.',
            'Grant the Lambda execution role least-privilege access to exactly the APIs it calls.',
          ],
        },
        {
          heading: 'Orchestrating complex workflows with Step Functions',
          body: 'Some automations are multi-step, long-running, need branching, retries, and human approvals. Chaining raw Lambdas becomes fragile. AWS Step Functions is a managed state machine that orchestrates steps with built-in error handling, retries, parallelism, and wait states — the right tool for complex or long workflows.',
          bullets: [
            'Step Functions models a workflow as states (Task, Choice, Parallel, Wait, Map) with visual tracing.',
            'Built-in retry/catch and exponential backoff make multi-step automation reliable without custom plumbing.',
            'Standard workflows run up to a year (long-running ops); Express workflows handle high-volume, short events.',
            'Directly integrates with hundreds of AWS services, reducing the amount of Lambda glue needed.',
          ],
          callout: { type: 'tip', text: '"Many steps, retries, branching, long-running, needs an audit trail" → Step Functions. A single Lambda chaining everything itself is the brittle distractor.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An operations team needs secure shell access to production instances for troubleshooting, but security forbids open inbound SSH ports and bastion hosts. Which Systems Manager capability fits?',
          options: [
            'Run Command with a reboot',
            'Session Manager, which provides audited shell access via the SSM agent and IAM with no inbound ports',
            'Patch Manager',
            'A public Elastic IP on each instance',
          ],
          correct: 1,
          explainCorrect: 'Correct — Session Manager gives shell access through the agent and IAM, fully logged, with no open SSH ports or bastions.',
          elaborativePrompt: 'How does Session Manager improve the security posture and auditability of remote access compared with SSH and bastion hosts?',
        },
        {
          afterSection: 3,
          question: 'A workflow must run several steps with conditional branching, automatic retries with backoff, and a wait for an external approval — reliably and with a visual audit trail. What should orchestrate it?',
          options: [
            'A single large Lambda function with nested try/catch logic',
            'AWS Step Functions modeling the steps as a state machine with built-in retries, choices, and wait states',
            'A cron job on an EC2 instance',
            'CodeBuild',
          ],
          correct: 1,
          explainCorrect: 'Correct — Step Functions provides managed orchestration with retries, branching, waits, and tracing, far more reliable than hand-rolled logic in one Lambda.',
          elaborativePrompt: 'Why does pushing orchestration concerns (retries, branching, state) into Step Functions make the individual Lambda tasks simpler and more reliable?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company must patch a large fleet on a schedule with compliance reporting, auto-correct any drift in the CloudWatch agent configuration, and run a multi-step remediation workflow when a non-compliant resource is found. Walk through which Systems Manager capability, plus Lambda or Step Functions, handles each part.',
      sample: {
        type: 'multiple-choice',
        stem: 'A DevOps team must continuously ensure a security agent is installed and running on every EC2 instance in a large fleet, automatically re-installing it if removed, with no SSH access and full reporting. Which solution requires the least custom code and operational overhead?',
        options: [
          'Write a cron job on each instance that reinstalls the agent and emails a report',
          'Use Systems Manager State Manager to enforce the desired configuration on a schedule, with SSM compliance reporting',
          'Manually check each instance weekly via SSH',
          'Bake the agent into the AMI and never check again',
        ],
        correct: 1,
        explanation: {
          summary: 'State Manager continuously applies and re-applies the desired configuration, self-healing drift, and reports compliance — the managed, least-overhead answer with no SSH.',
          perOption: [
            'Per-instance cron jobs are custom code to maintain on every host and lack centralized, reliable reporting.',
            'Correct — State Manager associations enforce desired state on a cadence so a removed agent is reinstalled automatically, with SSM compliance visibility and no inbound access.',
            'Manual weekly SSH checks do not scale and are not continuous or automated.',
            'Baking into the AMI does not prevent later removal or drift on running instances.',
          ],
          link: 'Domain 2 · Task 2.3 — Design and build automated solutions for complex tasks and large-scale environments',
        },
      },
      videos: [
        { videoId: 'uhOZqiw7mdk', title: 'New AWS DevOps Professional (DOP-C02) Certification Exam', channel: 'Digital Cloud Training', relevance: 'Companion overview — Systems Manager, Lambda, and Step Functions automation recur across Domains 2 and 5.' },
      ],
      keyTerms: [
        { term: 'Systems Manager (SSM)', def: 'The central fleet-operations service (Patch Manager, State Manager, Run Command, Session Manager, Automation) working through the SSM agent and IAM.' },
        { term: 'State Manager', def: 'An SSM capability that continuously enforces a desired configuration on a schedule, self-healing drift.' },
        { term: 'Patch Manager', def: 'An SSM capability that scans and patches fleets on a schedule via maintenance windows and reports compliance.' },
        { term: 'Session Manager', def: 'An SSM capability giving audited shell access via the agent and IAM, with no open inbound ports or bastion hosts.' },
        { term: 'Step Functions', def: 'A managed state-machine service that orchestrates multi-step workflows with built-in retries, branching, and wait states.' },
      ],
      awsServices: [
        { name: 'AWS Systems Manager', purpose: 'Operates fleets at scale — patching, desired-state config, inventory, secure access, and automation runbooks.' },
        { name: 'AWS Lambda', purpose: 'Runs custom, event-driven operational automation with the AWS SDK and no servers to manage.' },
        { name: 'AWS Step Functions', purpose: 'Orchestrates complex, long-running, multi-step automation reliably with retries, branching, and tracing.' },
      ],
      examTips: [
        'Patch a fleet on a schedule with compliance → SSM Patch Manager + maintenance windows.',
        'Continuously enforce desired state / self-heal drift → SSM State Manager (pair with Config rules for detection).',
        'Secure shell access with no open ports or bastions → SSM Session Manager.',
        'Custom, event-driven automation → Lambda + SDK; for many steps, retries, and branching → Step Functions.',
        'Prefer managed SSM/Step Functions over scripts babysat on EC2 — less code, less overhead, better audit trail.',
      ],
    },

  ],
}

export default dopC02Course
