// AWS Certified Advanced Networking – Specialty (ANS-C01) — Exam Prep Course
// 16 sessions of ~30 minutes each, covering every domain and task statement.
// Schema mirrors scsC03Course.js / deaC01Course.js — see study-materials-standard.html for authoring rules.
// Build status: IN PROGRESS — Domain 1 (Network Design) sessions s1–s6 and Domain 2/3 start authored.
//   D1 Network Design s1–s6, D2 Network Implementation s7–s10, D3 Management & Operation s11–s13,
//   D4 Security, Compliance & Governance s14–s16.

// Verified companion video (oEmbed-checked, public) — appears on every session.
const COMPANION_VIDEO = {
  videoId: 'kDNA00qpeCE',
  title: 'AWS Certified Advanced Networking Exam — What to Expect and How to Best Prepare',
  channel: 'Digital Cloud Training',
  startSeconds: null,
  endSeconds: null,
  relevance: 'Exam-strategy companion for the ANS-C01 — scope, domains, and how to prepare for the Advanced Networking Specialty.',
}

const ansC01Course = {
  slug: 'ans-c01',
  title: 'AWS Certified Advanced Networking – Specialty — Full Prep Course',
  code: 'ANS-C01',
  subtitle: 'Sixteen ~30-minute sessions covering all four domains, each ending with a real exam-style scenario question.',
  passingNote: 'Real exam: 65 questions (50 scored + 15 unscored), 170 minutes, pass at 700/1000 (70%). Compensatory scoring — no per-domain minimum. We author multiple choice and multiple response only (the real exam also includes matching).',
  modules: [
    { id: 'd1', label: 'Domain 1 · Network Design', weight: '30%' },
    { id: 'd2', label: 'Domain 2 · Network Implementation', weight: '26%' },
    { id: 'd3', label: 'Domain 3 · Network Management and Operation', weight: '20%' },
    { id: 'd4', label: 'Domain 4 · Network Security, Compliance, and Governance', weight: '24%' },
  ],

  sessions: [

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 1 — NETWORK DESIGN (30%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd1-s1',
      number: 1,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.1',
      title: 'Edge Network Services — CloudFront, Global Accelerator, and Optimizing Global Traffic',
      duration: 30,
      summary: 'Global users do not wait. This session builds the single most tested edge decision in Domain 1: when to reach for Amazon CloudFront (a content delivery network that caches at the edge) versus AWS Global Accelerator (an anycast front door that routes over the AWS backbone), and how each integrates with ELB, API Gateway, and your origins. Get this distinction right and a chunk of the design questions answer themselves.',
      objectives: [
        'Distinguish Amazon CloudFront and AWS Global Accelerator by what each optimizes and the traffic it is built for',
        'Choose an edge solution from global inbound and outbound traffic requirements',
        'Integrate CloudFront and Global Accelerator with ELB, API Gateway, and EC2 origins',
        'Reason about caching, static vs. dynamic content, and static anycast IPs',
      ],
      preLearningCheck: {
        question: 'A company runs a TCP-based multiplayer game on EC2 behind a Network Load Balancer and needs the lowest possible latency for players worldwide, plus two static IP addresses that never change for client allow-listing. Which AWS edge service fits best?',
        options: [
          'Amazon CloudFront, because it caches content at edge locations',
          'AWS Global Accelerator, because it provides static anycast IPs and routes traffic over the AWS global network to the nearest healthy endpoint',
          'Amazon Route 53 latency routing alone',
          'An Application Load Balancer in every Region',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Global Accelerator gives you two static anycast IP addresses and sends traffic onto the AWS backbone at the nearest edge, lowering latency and jitter for non-HTTP and TCP/UDP workloads. CloudFront is a CDN optimized for cacheable HTTP(S) content, not arbitrary TCP/UDP with fixed IPs.',
      },
      sections: [
        {
          heading: 'The two edge services and what each optimizes',
          body: 'Almost every Task 1.1 question reduces to "CloudFront or Global Accelerator?" Build a sharp distinction:\n\nAmazon CloudFront — a content delivery network (CDN). It caches content at hundreds of edge locations close to users and serves cacheable HTTP(S) responses from there, cutting latency and offloading the origin. It terminates TLS at the edge, supports Lambda@Edge and CloudFront Functions for request/response manipulation, and is the natural front for websites, APIs, media, and static assets. It works at Layer 7 (HTTP/HTTPS).\n\nAWS Global Accelerator — a network-layer traffic accelerator. It gives you two static anycast IP addresses advertised from AWS edge locations; client traffic enters the AWS global backbone at the nearest edge and is routed to the nearest healthy endpoint (ALB, NLB, EC2, or Elastic IP) in any Region. It improves performance and availability for TCP and UDP traffic generally — gaming, IoT, VoIP, and any non-cacheable or non-HTTP workload — and gives fast regional failover. It works at Layer 4.',
          bullets: [
            'Cacheable HTTP(S) content, websites, media, static + dynamic web → CloudFront.',
            'TCP/UDP, non-HTTP, need static anycast IPs, fast multi-Region failover → Global Accelerator.',
            'CloudFront caches; Global Accelerator does not cache — it accelerates the network path.',
            'Both put a global front in front of regional resources and both integrate with AWS Shield for DDoS protection.',
          ],
          callout: { type: 'note', text: 'The cleanest tell: "cache content / CDN / static assets / HTTP" → CloudFront. "static IPs / TCP or UDP / lowest network latency / fast regional failover" → Global Accelerator. They are complementary, not interchangeable.' },
          interactive: 'edge-service',
        },
        {
          heading: 'Integration patterns',
          body: 'The exam rewards knowing what each fronts. CloudFront origins can be an S3 bucket (with Origin Access Control to keep the bucket private), an Application Load Balancer, an API Gateway endpoint, a Lambda function URL, or any custom HTTP origin. Global Accelerator endpoints are ALBs, NLBs, EC2 instances, or Elastic IPs spread across one or more Regions, grouped into endpoint groups per Region with traffic dials and weights.\n\nThey can be combined: Global Accelerator can sit in front of an ALB that also serves a CloudFront distribution for different traffic classes. For HTTP APIs, CloudFront in front of API Gateway adds caching and edge TLS; for low-latency gRPC or game traffic, Global Accelerator in front of an NLB is the fit.',
          bullets: [
            'CloudFront origins: S3 (with OAC), ALB, API Gateway, Lambda function URL, custom HTTP.',
            'Global Accelerator endpoints: ALB, NLB, EC2, Elastic IP — across Regions in endpoint groups.',
            'Endpoint groups have a traffic dial (percentage) and per-endpoint weights for blue/green and gradual shifts.',
            'Both integrate with AWS WAF? — WAF attaches to CloudFront and ALB/API Gateway, not directly to Global Accelerator.',
          ],
          callout: { type: 'tip', text: 'When a question pairs "global API with caching and WAF at the edge," think CloudFront → API Gateway/ALB. When it pairs "static IPs + lowest-latency TCP/UDP + instant Region failover," think Global Accelerator → NLB.' },
        },
        {
          heading: 'Caching, content type, and failover behavior',
          body: 'CloudFront decisions hinge on cacheability: cache behaviors map path patterns to origins and cache policies; TTLs and cache keys (headers, query strings, cookies) determine hit ratio. Dynamic, personalized, or write traffic passes through to the origin but still benefits from the optimized edge-to-origin path and TLS termination. Global Accelerator decisions hinge on the network: it continuously health-checks endpoints and, because clients keep talking to the same static anycast IPs, a failed Region is bypassed in seconds without any DNS TTL wait. That DNS-independent failover is a key advantage over Route 53 failover, which is bounded by record TTL and resolver caching.',
          callout: { type: 'warning', text: 'Route 53 failover depends on DNS TTL and client/resolver caching, so failover can lag. Global Accelerator failover is at the network layer behind fixed IPs, so it is far faster — pick it when the requirement is near-instant regional failover.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A media company serves large video files and a static website to a global audience and wants to cut latency and origin load by caching close to users. Which service is the best fit?',
          options: [
            'AWS Global Accelerator',
            'Amazon CloudFront',
            'AWS Direct Connect',
            'Amazon Route 53 weighted routing',
          ],
          correct: 1,
          explainCorrect: 'Correct — CloudFront is a CDN that caches HTTP(S) content at edge locations, lowering latency and offloading the origin. That is exactly the cacheable-content use case.',
          elaborativePrompt: 'Why does caching at the edge help a media/static-website workload more than network acceleration alone?',
        },
        {
          afterSection: 1,
          question: 'An application needs two fixed IP addresses for firewall allow-listing and must route UDP traffic to the nearest healthy Region with rapid failover. What should you use?',
          options: [
            'CloudFront with a custom origin',
            'AWS Global Accelerator with endpoint groups in each Region',
            'An NLB with a Route 53 CNAME',
            'API Gateway edge-optimized endpoint',
          ],
          correct: 1,
          explainCorrect: 'Correct — Global Accelerator provides two static anycast IPs and routes UDP/TCP over the AWS backbone to the nearest healthy endpoint group, failing over in seconds.',
          elaborativePrompt: 'Why are the static anycast IPs and network-layer failover the deciding features here rather than CloudFront caching?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company has (1) a global static website and media library, (2) a low-latency UDP game server fleet in three Regions, and (3) a requirement for fixed IPs and instant Region failover for the game. Walk through which edge service serves each requirement and why caching vs. network acceleration is the deciding factor.',
      sample: {
        type: 'multiple-choice',
        stem: 'A gaming company runs UDP-based game servers on EC2 behind Network Load Balancers in three AWS Regions. Players report high latency and slow recovery when a Region degrades. The company also needs two static IP addresses for client configuration. Which solution best meets these requirements?',
        options: [
          'Put Amazon CloudFront in front of the Network Load Balancers and enable caching',
          'Deploy AWS Global Accelerator with an endpoint group per Region pointing to the Network Load Balancers',
          'Use Amazon Route 53 latency-based routing to the three Network Load Balancers',
          'Replace the Network Load Balancers with Application Load Balancers and enable cross-zone load balancing',
        ],
        correct: 1,
        explanation: {
          summary: 'Global Accelerator gives two static anycast IPs, draws traffic onto the AWS backbone at the nearest edge for lower UDP latency and jitter, and fails over between Regions at the network layer in seconds — exactly the gaming requirement.',
          perOption: [
            'CloudFront is an HTTP(S) CDN for cacheable content; it does not accelerate arbitrary UDP game traffic or provide fixed client IPs.',
            'Correct — Global Accelerator provides static anycast IPs, backbone routing to the nearest healthy endpoint group, and fast regional failover for TCP/UDP workloads.',
            'Route 53 latency routing improves path selection but its failover is bounded by DNS TTL and gives no static IPs — slower recovery than Global Accelerator.',
            'Switching to ALBs does not help UDP (ALB is HTTP/HTTPS) and does nothing for static IPs or cross-Region latency.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s2',
      number: 2,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.2',
      title: 'DNS Design — Route 53 Public, Private, and Hybrid Resolution',
      duration: 30,
      summary: 'DNS is the control plane for where traffic goes. This session builds the Route 53 design model the exam expects: public vs. private hosted zones, the seven routing policies and when each applies, alias records, health checks, DNSSEC, and the Resolver inbound/outbound endpoints that make hybrid name resolution work in both directions.',
      objectives: [
        'Choose between public and private hosted zones for a given resolution requirement',
        'Select the correct Route 53 routing policy — simple, weighted, latency, failover, geolocation, geoproximity, multivalue',
        'Use alias records, health checks, and DNSSEC correctly',
        'Design hybrid DNS with Route 53 Resolver inbound and outbound endpoints',
      ],
      preLearningCheck: {
        question: 'On-premises servers must resolve records in a Route 53 private hosted zone, and AWS resources must resolve names in the on-premises Active Directory domain. Which Route 53 Resolver configuration is required?',
        options: [
          'Only a public hosted zone',
          'An inbound endpoint for on-premises-to-AWS resolution and an outbound endpoint with forwarding rules for AWS-to-on-premises resolution',
          'A single NAT gateway',
          'DNSSEC signing on the private hosted zone',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: direction decides the endpoint. Inbound endpoints let on-premises resolvers query Route 53; outbound endpoints (with forwarding rules) let AWS resolve names hosted on-premises. Bidirectional hybrid DNS needs both.',
      },
      sections: [
        {
          heading: 'Public vs. private hosted zones',
          body: 'A hosted zone is a container for the DNS records of a domain. A public hosted zone answers queries from the internet for a domain you own (e.g. example.com). A private hosted zone is associated with one or more VPCs and answers only from within those VPCs — used for internal names (e.g. db.internal.example.com) that should never be publicly resolvable. The same domain can have both a public and a private zone (split-horizon DNS), returning different answers to internet clients versus in-VPC clients. For a private zone to resolve, the VPC must have enableDnsSupport and enableDnsHostnames turned on.',
          bullets: [
            'Public hosted zone → internet-facing names. Private hosted zone → in-VPC names only, associated with specific VPCs.',
            'Split-horizon: same name resolves differently inside the VPC vs. on the internet.',
            'A private hosted zone can be associated with VPCs in multiple accounts and Regions.',
            'VPC DNS attributes (enableDnsSupport / enableDnsHostnames) must be enabled for private resolution.',
          ],
          callout: { type: 'note', text: '"Internal name that must not be publicly resolvable" → private hosted zone. "Public website / API on the internet" → public hosted zone. "Different answer inside vs. outside" → both (split-horizon).' },
        },
        {
          heading: 'The routing policies',
          body: 'Route 53 routing policies decide which record value is returned. The exam tests choosing the right one:\n\nSimple — one record, no logic. Weighted — split traffic by assigned weights (canary/blue-green, A/B). Latency — return the Region that gives the lowest latency to the user. Failover — primary/secondary with health checks for active-passive DR. Geolocation — answer by the user\'s continent/country (compliance, localized content). Geoproximity — answer by geographic distance with an adjustable bias to shift load between Regions. Multivalue answer — return up to eight healthy records at random for simple client-side load distribution with health checks.',
          bullets: [
            'Blue/green or canary by percentage → weighted.',
            'Lowest latency to the nearest Region → latency-based.',
            'Active-passive DR → failover with health checks.',
            'Answer by user country/continent (data residency, language) → geolocation.',
            'Shift traffic between Regions with a tunable bias → geoproximity.',
          ],
          callout: { type: 'tip', text: 'Do not confuse latency (optimizes performance to the nearest Region) with geolocation (answers based on where the user is, for compliance/localization). They sound similar and are a classic distractor pair.' },
          interactive: 'route53-policy',
        },
        {
          heading: 'Alias records, health checks, and DNSSEC',
          body: 'An alias record is a Route 53 extension that points a name at an AWS resource (CloudFront, ELB, S3 website, API Gateway, Global Accelerator, another Route 53 record) — it resolves at query time, can sit at the zone apex (unlike a CNAME), and is free. Use alias for AWS targets; use CNAME only for non-apex names pointing at external hostnames.\n\nHealth checks monitor endpoint health (HTTP/HTTPS/TCP, or a CloudWatch alarm, or other health checks) and let failover, multivalue, and weighted policies route away from unhealthy targets.\n\nDNSSEC signs your zone so resolvers can verify responses were not tampered with (protecting against DNS spoofing). Route 53 supports DNSSEC signing for public hosted zones and DNSSEC validation on the Resolver.',
          bullets: [
            'Alias = AWS targets, works at the apex, free, resolves to the live resource. CNAME = non-apex, external names.',
            'Health checks drive failover/multivalue/weighted routing and can watch endpoints, CloudWatch alarms, or other checks.',
            'DNSSEC signing (public zones) prevents spoofing/cache-poisoning; the Resolver can validate DNSSEC.',
          ],
          callout: { type: 'warning', text: 'A CNAME cannot live at the zone apex (example.com). When you need the apex to point at an ELB or CloudFront, you must use an alias record, not a CNAME.' },
        },
        {
          heading: 'Hybrid DNS with Resolver endpoints',
          body: 'By default every VPC has the Route 53 Resolver (the .2 resolver) that handles in-VPC DNS. Hybrid resolution needs Resolver endpoints:\n\nInbound endpoint — gives on-premises DNS servers a target in the VPC to forward queries to, so on-premises can resolve Route 53 private hosted zone names.\n\nOutbound endpoint — lets the VPC Resolver forward queries to on-premises (or other external) DNS servers, using Resolver rules that match specific domains (conditional forwarding). For full bidirectional hybrid DNS you deploy both. Resolver rules can be shared across accounts with AWS RAM so an entire organization uses consistent forwarding.',
          bullets: [
            'Inbound endpoint = on-premises → AWS resolution.',
            'Outbound endpoint + forwarding rules = AWS → on-premises (conditional forwarding by domain).',
            'Share Resolver rules and private hosted zones across accounts with AWS RAM for centralized hybrid DNS.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company must serve different content to users in Germany to satisfy data-residency rules, regardless of latency. Which routing policy fits?',
          options: [
            'Latency-based routing',
            'Geolocation routing',
            'Weighted routing',
            'Multivalue answer routing',
          ],
          correct: 1,
          explainCorrect: 'Correct — geolocation routing answers based on the user\'s location (e.g. country = Germany), which is what data-residency and localization requirements need. Latency optimizes speed, not jurisdiction.',
          elaborativePrompt: 'Why is geolocation the right tool for a compliance requirement, while latency routing would not guarantee it?',
        },
        {
          afterSection: 3,
          question: 'AWS-hosted applications need to resolve names in the corporate on-premises DNS domain corp.example.com. Which Resolver configuration is required?',
          options: [
            'An inbound Resolver endpoint',
            'An outbound Resolver endpoint with a forwarding rule for corp.example.com pointing to the on-premises DNS servers',
            'A public hosted zone for corp.example.com',
            'DNSSEC validation only',
          ],
          correct: 1,
          explainCorrect: 'Correct — resolving on-premises names from AWS requires an outbound endpoint with a conditional forwarding rule for that domain. An inbound endpoint handles the opposite direction.',
          elaborativePrompt: 'Restate the difference between what inbound and outbound Resolver endpoints each enable.',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a hybrid company needs (1) an internal name that only resolves inside the VPC, (2) on-premises servers able to resolve that name, (3) AWS able to resolve on-premises Active Directory names, and (4) the apex of their public domain pointing at a CloudFront distribution. Walk through the hosted-zone type, the Resolver endpoints, and the record type for each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is building hybrid connectivity. On-premises systems must resolve records in a Route 53 private hosted zone, and EC2 instances must resolve hostnames in the on-premises domain. Which design meets both requirements?',
        options: [
          'Create a public hosted zone and add the on-premises records to it',
          'Create a Route 53 Resolver inbound endpoint for on-premises-to-AWS resolution and an outbound endpoint with a forwarding rule for the on-premises domain',
          'Peer the VPCs and rely on the default VPC resolver',
          'Enable DNSSEC on the private hosted zone',
        ],
        correct: 1,
        explanation: {
          summary: 'Bidirectional hybrid DNS needs both Resolver endpoints: an inbound endpoint so on-premises resolvers can query Route 53, and an outbound endpoint with conditional forwarding so the VPC resolver forwards on-premises-domain queries to the corporate DNS servers.',
          perOption: [
            'A public hosted zone exposes internal records to the internet and still does not forward AWS queries to on-premises DNS.',
            'Correct — inbound endpoint covers on-premises→AWS, outbound endpoint with a forwarding rule covers AWS→on-premises.',
            'VPC peering provides IP connectivity but does not make on-premises DNS resolvable from AWS or vice versa.',
            'DNSSEC adds response integrity but does nothing to enable hybrid resolution in either direction.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s3',
      number: 3,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.3',
      title: 'Load Balancing Design — ALB, NLB, GWLB, and Choosing by OSI Layer',
      duration: 30,
      summary: 'The load balancer you pick is decided by the layer you operate at. This session builds the elastic load balancing model the exam expects: ALB at Layer 7, NLB at Layer 4, Gateway Load Balancer at Layer 3 for inline appliances, the target-group and TLS choices that go with each, and the integrations with auto scaling, Global Accelerator, WAF, and EKS.',
      objectives: [
        'Map ALB, NLB, and Gateway Load Balancer to OSI layers 7, 4, and 3 and their use cases',
        'Choose target types (instance, IP, ALB-as-target) and protocols (TCP, UDP, TLS, GENEVE)',
        'Decide TLS termination vs. passthrough, and configure cross-zone, stickiness, and routing algorithms',
        'Integrate load balancers with auto scaling, WAF, Global Accelerator, and the AWS Load Balancer Controller for EKS',
      ],
      preLearningCheck: {
        question: 'A workload needs millions of requests per second of ultra-low-latency TCP load balancing, preserving the client source IP, with a static IP per Availability Zone. Which load balancer fits best?',
        options: [
          'Application Load Balancer, because it is the most feature-rich',
          'Network Load Balancer, because it operates at Layer 4 with very high performance, source-IP preservation, and static/Elastic IPs',
          'Gateway Load Balancer, because it inspects all traffic',
          'Classic Load Balancer, because it supports TCP',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: the NLB is the Layer 4 choice for extreme performance, low latency, source-IP preservation, and static/Elastic IPs. The ALB is Layer 7 (HTTP routing) and does not give per-AZ static IPs; GWLB is for inserting third-party inline appliances.',
      },
      sections: [
        {
          heading: 'Three load balancers, three layers',
          body: 'Elastic Load Balancing offers three modern load balancers (plus the legacy Classic):\n\nApplication Load Balancer (ALB) — Layer 7 (HTTP/HTTPS). Routes on host, path, headers, query string, and method; supports redirects, fixed responses, authentication (OIDC/Cognito), and WAF integration. Target types: instance, IP, and Lambda. The choice for web apps, microservices, and containers.\n\nNetwork Load Balancer (NLB) — Layer 4 (TCP/UDP/TLS). Extreme throughput and ultra-low latency, preserves the client source IP, supports static and Elastic IPs per AZ, and is the only one that handles UDP. The choice for high-performance, non-HTTP, or static-IP requirements.\n\nGateway Load Balancer (GWLB) — Layer 3. Transparently inserts fleets of third-party virtual appliances (firewalls, IDS/IPS, deep packet inspection) into the traffic path using the GENEVE protocol on port 6081. The choice for inline security inspection at scale.',
          bullets: [
            'HTTP routing, host/path rules, WAF, authentication → ALB (L7).',
            'TCP/UDP, extreme performance, source-IP preservation, static/Elastic IPs → NLB (L4).',
            'Insert inline firewalls/IDS/IPS appliances transparently → GWLB (L3, GENEVE).',
            'ALB targets: instance, IP, Lambda. NLB targets: instance, IP, ALB. GWLB targets: the appliance fleet.',
          ],
          callout: { type: 'note', text: 'Layer is the tell. "Route by URL path / host header / HTTP" → ALB. "TCP/UDP / static IP / fastest" → NLB. "Transparent third-party security appliance inspection" → GWLB.' },
          interactive: 'lb-selector',
        },
        {
          heading: 'Target groups, protocols, and combining load balancers',
          body: 'A target group routes to a set of targets with a health check. Target type matters: instance targets see the source as the load balancer (for ALB) or the client (NLB preserves source IP); IP targets allow on-premises or PrivateLink-reachable backends; ALB-as-target lets an NLB front an ALB so you get a static IP and Global Accelerator/PrivateLink in front of Layer-7 routing. GWLB uses the GENEVE protocol to its appliance target group. NLB can expose a service through AWS PrivateLink (an endpoint service is backed by an NLB or GWLB), which is how PrivateLink exposes your service to other VPCs.',
          bullets: [
            'NLB preserves client source IP; ALB presents its own IP to instance targets (use X-Forwarded-For for the client IP).',
            'IP target type reaches on-premises backends over Direct Connect/VPN.',
            'NLB-in-front-of-ALB = static IP + L7 routing + PrivateLink/Global Accelerator front.',
            'PrivateLink endpoint services are backed by an NLB (or GWLB) — a recurring exam fact.',
          ],
          callout: { type: 'tip', text: 'Need PrivateLink to expose your own application to other VPCs? The endpoint service must sit behind an NLB (or GWLB). ALB cannot directly back a PrivateLink endpoint service — front it with an NLB.' },
        },
        {
          heading: 'TLS, cross-zone, stickiness, and integrations',
          body: 'TLS termination at the load balancer offloads decryption and lets the ALB inspect/route on HTTP and lets WAF apply — use ACM-managed certificates. TLS passthrough (NLB with a TCP listener) sends encrypted traffic straight to the backend for end-to-end encryption or when the backend must terminate TLS itself. Cross-zone load balancing spreads requests evenly across all AZs (always on and free for ALB; off by default and incurs inter-AZ data charges for NLB). Stickiness (session affinity) pins a client to a target via a cookie (ALB) or source-IP/flow (NLB). For EKS, the AWS Load Balancer Controller provisions ALBs for Ingress and NLBs for LoadBalancer Services from Kubernetes manifests. Global Accelerator or CloudFront can front ELB for global reach.',
          bullets: [
            'TLS termination → offload + L7 inspection + WAF (ACM certs). TLS passthrough → end-to-end encryption via NLB.',
            'Cross-zone: on/free for ALB; off-by-default and billed cross-AZ for NLB.',
            'AWS Load Balancer Controller maps Kubernetes Ingress→ALB and Service type LoadBalancer→NLB.',
            'Auto Scaling registers/deregisters targets automatically as the group scales.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A security team must run all VPC egress traffic through a fleet of third-party firewall appliances for inline inspection, transparently and at scale. Which load balancer is designed for this?',
          options: [
            'Application Load Balancer',
            'Gateway Load Balancer',
            'Network Load Balancer',
            'Classic Load Balancer',
          ],
          correct: 1,
          explainCorrect: 'Correct — Gateway Load Balancer transparently inserts third-party virtual appliances (firewalls, IDS/IPS) into the traffic path using GENEVE, scaling the appliance fleet behind it.',
          elaborativePrompt: 'Why is GWLB, rather than ALB or NLB, the right tool for inserting inline security appliances?',
        },
        {
          afterSection: 1,
          question: 'A company wants to expose its internal application to other VPCs privately using AWS PrivateLink. What must back the PrivateLink endpoint service?',
          options: [
            'An Application Load Balancer',
            'A Network Load Balancer (or Gateway Load Balancer)',
            'A Classic Load Balancer',
            'An API Gateway',
          ],
          correct: 1,
          explainCorrect: 'Correct — a PrivateLink endpoint service is backed by an NLB (or GWLB). To expose an ALB-based app, front the ALB with an NLB.',
          elaborativePrompt: 'Why does PrivateLink require an NLB behind the endpoint service rather than an ALB directly?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must (1) route web traffic by URL path to microservices with WAF, (2) load-balance a UDP service with a static IP at extreme throughput, (3) insert a third-party firewall fleet inline, and (4) expose an internal app to other VPCs via PrivateLink. Walk through which load balancer and target configuration solves each.',
      sample: {
        type: 'multiple-choice',
        stem: 'A microservices application needs HTTP routing based on URL path to different target groups, native AWS WAF protection, and user authentication via OpenID Connect at the load balancer. Which load balancer meets all of these requirements?',
        options: [
          'Network Load Balancer with TLS listeners',
          'Application Load Balancer with path-based listener rules',
          'Gateway Load Balancer with a GENEVE target group',
          'Classic Load Balancer with TCP listeners',
        ],
        correct: 1,
        explanation: {
          summary: 'Path-based routing, native WAF integration, and built-in OIDC/Cognito authentication are Layer-7 features unique to the Application Load Balancer.',
          perOption: [
            'NLB is Layer 4 — it cannot route on URL path, integrate WAF, or perform OIDC authentication.',
            'Correct — the ALB does host/path routing, integrates AWS WAF, and supports OIDC/Cognito authentication at the listener.',
            'GWLB is for inserting inline appliances at Layer 3, not HTTP path routing or authentication.',
            'The Classic Load Balancer lacks content-based routing, WAF integration, and authentication; it is legacy.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s4',
      number: 4,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.4',
      title: 'Logging & Monitoring Requirements — Visibility Across AWS and Hybrid Networks',
      duration: 30,
      summary: 'You cannot operate what you cannot see. This session builds the observability design the exam expects: CloudWatch metrics, logs, alarms, and dashboards; VPC Flow Logs and Traffic Mirroring for traffic visibility; Reachability Analyzer for path verification; Transit Gateway Network Manager for topology; and access logs for ELB and CloudFront — plus how to capture a performance baseline.',
      objectives: [
        'Select the right visibility tool for a requirement — metrics, flow logs, traffic mirroring, path analysis, or topology',
        'Distinguish VPC Flow Logs (metadata) from Traffic Mirroring (full packets)',
        'Use Reachability Analyzer and Transit Gateway Network Manager for path and topology visibility',
        'Capture a baseline of network performance and define meaningful network metrics',
      ],
      preLearningCheck: {
        question: 'A security team needs to capture full packet payloads from specific EC2 instances to feed an intrusion-detection appliance for deep analysis. Which feature provides this?',
        options: [
          'VPC Flow Logs, because they record all traffic',
          'VPC Traffic Mirroring, because it copies actual packets (headers and payload) to a monitoring appliance',
          'CloudWatch metrics',
          'AWS CloudTrail',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: VPC Flow Logs record connection metadata (5-tuple, bytes, accept/reject) but not packet contents. Traffic Mirroring copies the actual packets to a target (an appliance behind an NLB/GWLB) for deep packet inspection.',
      },
      sections: [
        {
          heading: 'The visibility toolbox',
          body: 'Each tool sees a different layer; the exam tests picking the one that holds the evidence:\n\nVPC Flow Logs — connection metadata per network interface, subnet, or VPC: source/destination IP and port, protocol, bytes, packets, and ACCEPT/REJECT. Delivered to CloudWatch Logs, S3, or Kinesis Data Firehose. Use for "was traffic allowed or rejected," top talkers, and exfiltration volume. Base and extended fields are configurable.\n\nVPC Traffic Mirroring — copies the actual packets (headers and payload) from an ENI to a monitoring target (typically an appliance behind an NLB or GWLB) for IDS/IPS and deep packet inspection.\n\nCloudWatch — metrics (e.g. ELB request counts, NAT gateway bytes, NLB active flows, VPN tunnel state), logs, alarms, dashboards, and Logs Insights queries.\n\nReachability Analyzer — static analysis of whether and how a packet can get from a source to a destination, and which component blocks it.\n\nTransit Gateway Network Manager — a global view of your Transit Gateway and on-premises topology, with events and metrics.',
          bullets: [
            'Metadata / accept-reject / top talkers → VPC Flow Logs.',
            'Full packet capture for IDS/IPS → Traffic Mirroring.',
            'Can the packet get there, and what blocks it → Reachability Analyzer.',
            'Visualize and monitor the global TGW/hybrid topology → Transit Gateway Network Manager.',
          ],
          callout: { type: 'note', text: 'Flow Logs = who talked to whom and was it allowed (metadata). Traffic Mirroring = the actual packets for deep inspection. A question that needs payload analysis is never solved by Flow Logs.' },
        },
        {
          heading: 'Reachability Analyzer and Network Access Analyzer',
          body: 'VPC Reachability Analyzer performs configuration-based (not live-traffic) reachability analysis between two resources: it tells you whether a path exists and, if not, exactly which security group, NACL, route table, or gateway blocks it — invaluable for verifying design intent and troubleshooting "why can\'t A reach B." Network Access Analyzer (a related tool) identifies unintended network access against access-scope definitions — e.g. "can any internet path reach a database subnet?" Use Reachability Analyzer for connectivity verification and Network Access Analyzer for security posture/segmentation verification.',
          bullets: [
            'Reachability Analyzer = can A reach B, and what blocks it (design verification, troubleshooting).',
            'Network Access Analyzer = find unintended access paths against defined scopes (segmentation audit).',
            'Both are static analysis — no packets sent, so they are safe to run anytime.',
          ],
          callout: { type: 'tip', text: 'When a question asks to verify connectivity intent automatically after a config change, Reachability Analyzer is the tool — it evaluates the path from configuration without generating traffic.' },
        },
        {
          heading: 'Access logs and a performance baseline',
          body: 'Access logs capture request-level detail: ELB access logs (per request: client IP, latencies, target, status) and CloudFront access logs (edge request detail) are stored in S3 for analysis with Athena. They differ from Flow Logs (network metadata) and CloudTrail (API calls). To capture a baseline, collect representative metrics over a normal period — latency, throughput, packet loss, connection counts, NAT/VPN/TGW byte and flow metrics — so anomalies and capacity trends are detectable against a known-good reference. Dashboards aggregate these for at-a-glance health, and alarms fire on deviations.',
          bullets: [
            'ELB/CloudFront access logs = per-request L7 detail in S3 (query with Athena).',
            'Baseline = normal-period metrics (latency, throughput, loss, flows) to compare against.',
            'CloudWatch dashboards for visualization; alarms for threshold-based alerting to SNS.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'An operations team wants to know which source and destination IP pairs were rejected by security groups or NACLs over the last day, without capturing packet contents. What should they enable?',
          options: [
            'VPC Traffic Mirroring',
            'VPC Flow Logs',
            'AWS CloudTrail data events',
            'CloudFront access logs',
          ],
          correct: 1,
          explainCorrect: 'Correct — VPC Flow Logs record the 5-tuple and ACCEPT/REJECT decision per flow, which is exactly the metadata needed, without packet payloads.',
          elaborativePrompt: 'Why are Flow Logs sufficient here, and when would you instead need Traffic Mirroring?',
        },
        {
          afterSection: 1,
          question: 'After changing route tables and security groups, an engineer wants to confirm an EC2 instance can still reach an RDS database and, if not, see exactly what blocks it — without sending traffic. Which tool fits?',
          options: [
            'VPC Flow Logs',
            'VPC Reachability Analyzer',
            'CloudWatch metrics',
            'Traffic Mirroring',
          ],
          correct: 1,
          explainCorrect: 'Correct — Reachability Analyzer statically evaluates the configured path and identifies the blocking component, verifying design intent without generating traffic.',
          elaborativePrompt: 'How does configuration-based analysis differ from reading Flow Logs to answer "can A reach B?"',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you need (1) per-flow metadata to spot rejected connections and top talkers, (2) full packet capture for an IDS, (3) confirmation that a path exists between two resources after a change, and (4) a global view of your Transit Gateway topology. Walk through which tool delivers each and why they are not interchangeable.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company must continuously verify that newly deployed resources can reach required endpoints and quickly identify which security group, NACL, or route blocks a path when connectivity fails — all without injecting test traffic into production. Which AWS capability best meets this requirement?',
        options: [
          'Enable VPC Flow Logs and grep for REJECT entries',
          'Use VPC Reachability Analyzer to analyze paths from configuration and identify blocking components',
          'Enable VPC Traffic Mirroring to a packet-capture appliance',
          'Create CloudWatch alarms on NAT gateway metrics',
        ],
        correct: 1,
        explanation: {
          summary: 'Reachability Analyzer performs static, configuration-based path analysis between resources, reporting whether a path exists and exactly which component blocks it — without sending traffic, so it is safe and repeatable in production.',
          perOption: [
            'Flow Logs only show flows that were actually attempted; they do not proactively verify intended paths or pinpoint the blocking config before traffic flows.',
            'Correct — Reachability Analyzer evaluates the configured network path and names the blocking security group/NACL/route, with no traffic injected.',
            'Traffic Mirroring captures packets for inspection but does not analyze reachability or identify blocking configuration.',
            'NAT gateway alarms watch throughput, not whether a specific source can reach a specific destination.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd1-s5',
      number: 5,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.5',
      title: 'Hybrid Connectivity Design — Direct Connect, Site-to-Site VPN, and BGP Routing',
      duration: 30,
      summary: 'Connecting a data center to AWS is the heart of the exam. This session builds the hybrid design model: Direct Connect for dedicated private bandwidth versus Site-to-Site VPN over the internet, how to combine them for resilience, the Layer 1/2 physical concepts, and how BGP attributes steer traffic for active/passive and load-shared topologies.',
      objectives: [
        'Choose between Direct Connect and Site-to-Site VPN, and design redundant hybrid connectivity',
        'Apply Layer 1/2 concepts — VLANs, LAG, optics, jumbo frames — and encapsulation (GRE, IPsec)',
        'Influence traffic flow with BGP attributes (AS path prepending, local preference, MED, longest prefix)',
        'Design SD-WAN integration with Transit Gateway Connect and overlay networks',
      ],
      preLearningCheck: {
        question: 'A company needs consistent, low-latency, high-bandwidth private connectivity to AWS that does not traverse the public internet, with predictable performance for a data-heavy hybrid application. Which service is the primary choice?',
        options: [
          'AWS Site-to-Site VPN, because it is quick to set up',
          'AWS Direct Connect, because it provides a dedicated private physical connection with consistent bandwidth and latency',
          'A NAT gateway',
          'VPC peering',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Direct Connect is a dedicated physical link that bypasses the internet, giving consistent bandwidth and latency. VPN is fast to deploy and encrypted but rides the public internet, so performance is variable — often used as a backup to Direct Connect.',
      },
      sections: [
        {
          heading: 'Direct Connect vs. Site-to-Site VPN',
          body: 'The two hybrid connectivity options trade off performance against speed-of-deployment and cost:\n\nAWS Direct Connect (DX) — a dedicated, private physical connection from your network to AWS via a Direct Connect location. Consistent bandwidth (1/10/100 Gbps dedicated, or sub-1G hosted) and latency, lower data-transfer cost at scale, and traffic that never touches the public internet. It is not encrypted by itself (it is private, not encrypted) — add MACsec at Layer 2 or run a VPN over it for encryption. Provisioning takes time (cross-connect, LOA-CFA).\n\nAWS Site-to-Site VPN — an IPsec tunnel over the public internet to a virtual private gateway or Transit Gateway. Encrypted, quick to set up, and cheap, but bandwidth and latency depend on the internet. Each connection has two tunnels for redundancy. Accelerated Site-to-Site VPN uses Global Accelerator to route over the AWS backbone for better performance.',
          bullets: [
            'Consistent performance, private, high bandwidth, lower egress cost → Direct Connect.',
            'Encrypted, fast to deploy, low cost, internet-based → Site-to-Site VPN.',
            'DX is private but NOT encrypted — add MACsec or VPN-over-DX for encryption in transit.',
            'A common resilient pattern: Direct Connect as primary + Site-to-Site VPN as backup.',
          ],
          callout: { type: 'note', text: '"Consistent/dedicated/private/high-bandwidth" → Direct Connect. "Encrypted/quick/cheap/internet" → VPN. "Encrypted AND consistent private bandwidth" → VPN over Direct Connect (or DX with MACsec).' },
          interactive: 'hybrid-connectivity',
        },
        {
          heading: 'Designing for resilience',
          body: 'AWS publishes resilience tiers for Direct Connect. Maximum resilience uses two connections at two different Direct Connect locations, each on separate devices, terminating to separate routers on-premises. High resilience uses two connections at two locations. For development, a single connection is the minimum. Because DX provisioning takes time and a single DX has no fast fallback, Site-to-Site VPN is frequently configured as automatic backup — if the DX link fails, BGP withdraws its routes and traffic shifts to the VPN. Virtual interfaces (VIFs) carry the traffic: a private VIF reaches a VPC (via a virtual private gateway or a Direct Connect gateway), a transit VIF reaches Transit Gateways via a Direct Connect gateway, and a public VIF reaches AWS public services.',
          bullets: [
            'Maximum resilience = two DX connections at two DX locations on separate hardware.',
            'VPN backup to DX: BGP route withdrawal triggers failover to the VPN tunnel automatically.',
            'VIF types: private VIF → VPC; transit VIF → Transit Gateway (via DX gateway); public VIF → AWS public services.',
            'A Direct Connect gateway lets one DX connect to VPCs/TGWs in many Regions and accounts.',
          ],
          callout: { type: 'warning', text: 'Direct Connect alone is a single point of failure unless you add a second connection (ideally at a second location) or a VPN backup. "Resilient hybrid connectivity" almost always means redundant paths, not one DX.' },
        },
        {
          heading: 'Layer 1/2 and encapsulation concepts',
          body: 'The exam expects physical-layer literacy. A link aggregation group (LAG) bundles multiple DX connections into one logical higher-bandwidth link. VLANs (802.1Q tags) separate VIFs on the same physical connection. Optics and the cross-connect are arranged via the Letter of Authorization and Connecting Facility Assignment (LOA-CFA) at the colocation facility. Jumbo frames (MTU 9001 on DX/VPC, 8500 over Transit Gateway) increase throughput for bulk transfer — both ends must agree on MTU. Encapsulation/encryption technologies: GRE tunnels carry routing/overlay traffic; IPsec provides encryption (the basis of Site-to-Site VPN). Overlay networks (e.g. for SD-WAN) ride on top of the underlying transport.',
          bullets: [
            'LAG = bundle DX links for more bandwidth/redundancy; VLANs separate VIFs on one connection.',
            'LOA-CFA authorizes the physical cross-connect at the Direct Connect/colocation facility.',
            'Jumbo frames: 9001 MTU within VPC/DX, 8500 over Transit Gateway; both ends must match.',
            'GRE = encapsulation/overlay; IPsec = encryption (used by Site-to-Site VPN).',
          ],
        },
        {
          heading: 'Steering traffic with BGP',
          body: 'Direct Connect and dynamic VPN use BGP to exchange routes, and the exam tests influencing path selection. From AWS toward your network, AWS prefers the most specific route (longest prefix match) first, then the path with the higher BGP local preference (AWS uses BGP communities on public/private VIFs to set local pref) — local preference is the primary inbound control. From your network toward AWS, you influence AWS\'s choice with AS path prepending (a longer AS path is less preferred) and Multi-Exit Discriminator (MED). For active/passive, advertise the standby path with a longer AS path (prepending) or rely on a less-specific route so it is used only when the primary withdraws. For load sharing, advertise equal, equally specific routes across links.',
          bullets: [
            'AWS route preference order: longest prefix match → highest local preference → shortest AS path.',
            'Local preference (via BGP communities) is the main control for AWS→on-premises path choice.',
            'AS path prepending and MED influence on-premises→AWS path choice (active/passive).',
            'Equal, equally specific advertisements across links = load sharing/ECMP.',
          ],
          callout: { type: 'tip', text: 'For active/passive over two links, make the passive link less preferred — longer AS path (prepending) on the standby, or a less specific prefix — so traffic only uses it when the primary fails.' },
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company has a Direct Connect connection and must add encryption in transit for compliance, while keeping private connectivity. What is the most appropriate approach?',
          options: [
            'Direct Connect already encrypts all traffic, so nothing is needed',
            'Run an IPsec Site-to-Site VPN over the Direct Connect connection (or enable MACsec)',
            'Switch entirely to a public-internet VPN',
            'Enable a NAT gateway',
          ],
          correct: 1,
          explainCorrect: 'Correct — Direct Connect is private but not encrypted. Running a VPN over the DX (or enabling MACsec at Layer 2) adds encryption while keeping the dedicated private path.',
          elaborativePrompt: 'Why does "private" not mean "encrypted," and what does VPN-over-DX give you that plain DX does not?',
        },
        {
          afterSection: 3,
          question: 'A company has two Direct Connect links and wants one to be active and the other to carry traffic only if the first fails. How can they influence AWS to prefer the primary link for return traffic?',
          options: [
            'Advertise a longer AS path (AS path prepending) on the standby link',
            'Disable BGP on both links',
            'Use the same MED on both links',
            'Use a NAT gateway to choose the path',
          ],
          correct: 0,
          explainCorrect: 'Correct — prepending the AS path on the standby makes it less preferred, so AWS uses the primary link and only fails over to the longer-AS-path standby when the primary withdraws.',
          elaborativePrompt: 'How do AS path length and route specificity combine to create an active/passive design?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a company needs resilient, high-bandwidth, encrypted hybrid connectivity with one path preferred over the other. Walk through the connection types you would provision, how you add encryption, how you make it resilient, and which BGP attributes you tune to keep the secondary path passive.',
      sample: {
        type: 'multiple-choice',
        stem: 'A financial company needs hybrid connectivity to AWS that is high-bandwidth, has consistent low latency, encrypts data in transit for compliance, and remains available if a single link fails. Which design best meets all requirements?',
        options: [
          'A single Site-to-Site VPN over the internet',
          'A single Direct Connect connection with no additional configuration',
          'Two Direct Connect connections at two Direct Connect locations, with IPsec VPN running over them for encryption',
          'VPC peering between the data center and the VPC',
        ],
        correct: 2,
        explanation: {
          summary: 'Two Direct Connect connections at separate locations give high bandwidth, consistent latency, and resilience; running IPsec VPN over the Direct Connect links adds the required encryption in transit. This meets bandwidth, latency, encryption, and availability together.',
          perOption: [
            'A single internet VPN has variable performance and is a single point of failure — it fails the consistency and resilience requirements.',
            'A single Direct Connect is not encrypted and is a single point of failure.',
            'Correct — redundant Direct Connect at two locations delivers consistent, resilient private bandwidth, and VPN-over-DX provides the encryption compliance requires.',
            'VPC peering connects VPCs, not a data center to AWS — it is not a hybrid connectivity option at all.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

  ],
}

export default ansC01Course
