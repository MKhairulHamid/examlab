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

    {
      id: 'd1-s6',
      number: 6,
      module: 'Domain 1 · Network Design',
      domain: 'd1',
      weight: '30%',
      task: 'Task 1.6',
      title: 'Multi-Account, Multi-Region, Multi-VPC Routing — Peering, Transit Gateway, and PrivateLink',
      duration: 30,
      summary: 'As an organization grows, the question becomes "how do hundreds of VPCs across many accounts and Regions talk to each other?" This session builds the connectivity-pattern decision the exam tests most: VPC peering vs. Transit Gateway vs. PrivateLink, plus VPC sharing and the strategies for handling overlapping IP address space.',
      objectives: [
        'Choose between VPC peering, Transit Gateway, and PrivateLink for a given connectivity requirement',
        'Apply VPC sharing (via AWS RAM) to a multi-account setup',
        'Resolve overlapping CIDR problems with NAT, PrivateLink, and Transit Gateway routing',
        'Design inter-Region connectivity with Transit Gateway peering and cross-Region patterns',
      ],
      preLearningCheck: {
        question: 'A company has 40 VPCs across many accounts that all need to communicate, plus connectivity to an on-premises data center. Managing a full mesh of VPC peering connections has become unmanageable. What is the best design?',
        options: [
          'Add more VPC peering connections to complete the mesh',
          'Deploy a Transit Gateway as a central hub and attach the VPCs and the hybrid connection to it',
          'Use PrivateLink between every pair of VPCs',
          'Merge all workloads into a single VPC',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: VPC peering is non-transitive and becomes an O(n²) mesh that does not scale. A Transit Gateway is a regional hub that connects thousands of VPCs and hybrid links with transitive routing — the standard answer for many-VPC connectivity at scale.',
      },
      sections: [
        {
          heading: 'The three connectivity patterns',
          body: 'Each pattern serves a different need:\n\nVPC peering — a one-to-one connection between two VPCs (same or cross-Region, same or cross-account). Traffic stays on the AWS network, there is no bandwidth bottleneck, and it is low cost. But it is non-transitive (if A peers with B and B with C, A cannot reach C through B) and becomes an unmanageable full mesh beyond a handful of VPCs. CIDRs must not overlap.\n\nAWS Transit Gateway (TGW) — a regional hub-and-spoke router that connects thousands of VPCs, VPN, and Direct Connect attachments with transitive routing and multiple route tables for segmentation. The default answer for many-VPC and hybrid connectivity at scale; supports inter-Region peering between Transit Gateways.\n\nAWS PrivateLink — exposes a single service (not a whole network) privately via an interface VPC endpoint backed by an NLB/GWLB endpoint service. The consumer reaches only that service, with no route-table or CIDR coupling — ideal for SaaS/service exposure and when CIDRs overlap.',
          bullets: [
            'Two VPCs, simple, low cost, non-transitive → VPC peering.',
            'Many VPCs + hybrid, transitive, segmented routing → Transit Gateway.',
            'Expose one service privately, no network coupling, works with overlapping CIDRs → PrivateLink.',
            'Peering and TGW require non-overlapping CIDRs for routed connectivity; PrivateLink does not.',
          ],
          callout: { type: 'note', text: 'Scale and transitivity are the tells. "Full mesh is unmanageable / many VPCs / hybrid hub" → Transit Gateway. "Just two VPCs" → peering. "Only need one service reachable / overlapping CIDRs" → PrivateLink.' },
          interactive: 'vpc-connectivity',
        },
        {
          heading: 'VPC sharing and AWS RAM',
          body: 'VPC sharing lets multiple accounts in an organization create resources in shared subnets of a central VPC, using AWS Resource Access Manager (RAM). Participants deploy into the owner\'s subnets, so all the workloads sit in one VPC — they communicate without any peering or Transit Gateway, and you consolidate IP space and reduce the number of VPCs to manage. Many networking resources are shareable via RAM: Transit Gateways, Route 53 Resolver rules, prefix lists, License Manager, and subnets. RAM is the mechanism the exam expects for "share this networking resource across accounts."',
          bullets: [
            'VPC sharing (via RAM) = multiple accounts deploy into shared subnets of one VPC — no peering needed between them.',
            'RAM shares TGWs, subnets, Resolver rules, prefix lists, and more across accounts in an organization.',
            'VPC sharing consolidates IP usage and reduces VPC sprawl; ownership/billing of the VPC stays with the owner account.',
          ],
          callout: { type: 'tip', text: 'When workloads in different accounts must sit in the same VPC and talk with zero inter-VPC plumbing, VPC sharing via RAM is the pattern — not peering or a Transit Gateway.' },
        },
        {
          heading: 'Handling overlapping IP address space',
          body: 'Overlapping CIDRs are a recurring exam scenario because routed solutions (peering, TGW) require unique address space. When you cannot re-IP, the options are:\n\nPrivateLink — the consumer reaches the provider\'s service through an interface endpoint with the endpoint\'s own IP; the underlying CIDRs never need to be routable to each other, so overlaps do not matter. The standard answer for connecting overlapping networks for a specific service.\n\nNAT — place a NAT instance/appliance (or private NAT gateway) so traffic is translated to non-overlapping addresses before crossing into the other network.\n\nTransit Gateway with careful route tables and NAT can also bridge overlaps in some designs. The exam most often rewards PrivateLink for service access across overlapping CIDRs.',
          bullets: [
            'Overlapping CIDRs + need one service → PrivateLink (no routable coupling).',
            'Overlapping CIDRs + need broader connectivity → NAT to translate into non-overlapping space.',
            'Peering and TGW routed connectivity require non-overlapping CIDRs — re-IP or NAT if they overlap.',
          ],
          callout: { type: 'warning', text: 'You cannot create a VPC peering connection or route TGW traffic between VPCs with overlapping CIDR blocks. If re-IP is impossible, reach for PrivateLink (per-service) or NAT (broader).' },
        },
        {
          heading: 'Inter-Region connectivity',
          body: 'For cross-Region needs: VPC peering supports inter-Region peering (encrypted, over the AWS backbone). Transit Gateways in different Regions can be peered, building a global network where each regional TGW is a hub and inter-Region traffic rides the AWS backbone — combined with a Direct Connect gateway, on-premises can reach VPCs in many Regions. CloudFront and Global Accelerator address user-facing global performance, while TGW peering and inter-Region VPC peering address VPC-to-VPC reach. Route tables and propagation control which prefixes flow where.',
          bullets: [
            'Inter-Region VPC peering = encrypted VPC-to-VPC across Regions over the backbone.',
            'Transit Gateway peering = connect regional TGW hubs into a global, segmented network.',
            'Direct Connect gateway = one DX reaches VPCs/TGWs across multiple Regions and accounts.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A provider must expose a single internal API to dozens of consumer VPCs in other accounts without giving them network-level access to its VPC, and some consumers use overlapping CIDR ranges. Which service fits best?',
          options: [
            'VPC peering with each consumer',
            'AWS PrivateLink with an interface endpoint service',
            'A Transit Gateway shared with all consumers',
            'Internet gateway with public endpoints',
          ],
          correct: 1,
          explainCorrect: 'Correct — PrivateLink exposes just the service via interface endpoints, with no network coupling, and works even when consumer CIDRs overlap because there is no routable connection between the networks.',
          elaborativePrompt: 'Why does PrivateLink sidestep the overlapping-CIDR problem that peering and Transit Gateway cannot?',
        },
        {
          afterSection: 1,
          question: 'An organization wants several accounts to run workloads inside the same central VPC subnets so they communicate with no inter-VPC connectivity to manage. What should they use?',
          options: [
            'A Transit Gateway',
            'VPC sharing via AWS Resource Access Manager',
            'A full mesh of VPC peering',
            'PrivateLink between accounts',
          ],
          correct: 1,
          explainCorrect: 'Correct — VPC sharing through RAM lets multiple accounts deploy into shared subnets of one VPC, so they communicate within that VPC with no peering or Transit Gateway needed.',
          elaborativePrompt: 'How does putting workloads in one shared VPC remove the need for any inter-VPC connectivity?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: an organization has dozens of VPCs across accounts, needs hybrid reach, has two specific overlapping-CIDR partners that need a single service, and wants some accounts to share one VPC. Walk through which pattern — peering, Transit Gateway, PrivateLink, or VPC sharing — solves each part and why.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is growing from 5 to 60 VPCs across many accounts and needs scalable, transitive connectivity among the VPCs and to two on-premises data centers, with the ability to segment which VPCs can reach which. The current full mesh of VPC peering connections is unmanageable. What should the company implement?',
        options: [
          'Continue expanding the VPC peering mesh and document it carefully',
          'Deploy a Transit Gateway as a central hub, attach the VPCs and the hybrid connections, and use multiple TGW route tables for segmentation',
          'Use PrivateLink to connect every VPC pair',
          'Consolidate all 60 VPCs into one VPC',
        ],
        correct: 1,
        explanation: {
          summary: 'A Transit Gateway is the hub-and-spoke router built for exactly this: it connects thousands of VPCs and hybrid attachments with transitive routing and supports multiple route tables to segment which attachments can reach which — replacing the unscalable peering mesh.',
          perOption: [
            'A peering mesh is non-transitive and grows O(n²); at 60 VPCs it is exactly the unmanageable problem to escape.',
            'Correct — Transit Gateway gives transitive, scalable connectivity plus route-table segmentation and a single place to attach hybrid links.',
            'PrivateLink exposes individual services, not full transitive VPC-to-VPC connectivity for 60 VPCs.',
            'Collapsing 60 VPCs into one destroys account/workload isolation and is operationally infeasible.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 2 — NETWORK IMPLEMENTATION (26%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd2-s7',
      number: 7,
      module: 'Domain 2 · Network Implementation',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.1',
      title: 'Implementing Hybrid Connectivity — Provisioning Direct Connect, VPN, and Routing',
      duration: 30,
      summary: 'Design becomes reality here. This session covers the implementation details the exam tests: provisioning Direct Connect (LOA-CFA, VIFs, Direct Connect gateway), standing up Site-to-Site VPN with static or BGP routing, wiring on-premises name resolution, and validating the path with Route Analyzer and Reachability Analyzer.',
      objectives: [
        'Provision Direct Connect — physical connection, LOA-CFA, and the right virtual interface type',
        'Implement Site-to-Site VPN with static routing or dynamic BGP, and as a Direct Connect backup',
        'Connect on-premises name resolution and configure route propagation',
        'Validate hybrid connectivity with Transit Gateway Route Analyzer and Reachability Analyzer',
      ],
      preLearningCheck: {
        question: 'You are connecting a Direct Connect connection to multiple Transit Gateways across two AWS Regions. Which virtual interface type and component do you use?',
        options: [
          'A private VIF directly to each Transit Gateway',
          'A transit VIF associated with a Direct Connect gateway, which connects to the Transit Gateways',
          'A public VIF',
          'A NAT gateway',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: a transit VIF connects to Transit Gateways, and you attach it through a Direct Connect gateway, which can associate with TGWs in multiple Regions and accounts. Private VIFs go to VPCs (via VGW or DX gateway); public VIFs reach AWS public services.',
      },
      sections: [
        {
          heading: 'Provisioning Direct Connect',
          body: 'Implementing DX follows a sequence: request a connection (dedicated 1/10/100 Gbps, or a hosted connection from a partner), receive the Letter of Authorization and Connecting Facility Assignment (LOA-CFA), and have the cross-connect installed at the Direct Connect location between your equipment (or the colocation provider\'s) and AWS. Then create virtual interfaces:\n\nPrivate VIF — reaches one VPC via a virtual private gateway, or many VPCs via a Direct Connect gateway. Transit VIF — reaches Transit Gateways via a Direct Connect gateway. Public VIF — reaches AWS public service endpoints (e.g. S3) over the private DX path. A Direct Connect gateway is a global resource that lets a single DX connection serve VPCs and TGWs across Regions and accounts.',
          bullets: [
            'Order: request connection → LOA-CFA → cross-connect → create VIF(s) → configure BGP.',
            'Private VIF → VPC(s); Transit VIF → Transit Gateway(s); Public VIF → AWS public services.',
            'Direct Connect gateway = one DX serving multiple Regions/accounts (not a Region-local resource).',
            'A transit VIF attaches via a DX gateway; you cannot attach a transit VIF straight to a VGW.',
          ],
          callout: { type: 'note', text: 'Match the VIF to the target: VPC → private VIF, Transit Gateway → transit VIF (via DX gateway), AWS public services like S3/DynamoDB over DX → public VIF.' },
        },
        {
          heading: 'Implementing Site-to-Site VPN',
          body: 'A Site-to-Site VPN connects your customer gateway (on-premises device) to a virtual private gateway (attached to one VPC) or a Transit Gateway (for many VPCs). Each VPN connection provides two tunnels in different AZs for redundancy. Routing is either static (you define the on-premises prefixes) or dynamic with BGP (routes exchanged automatically — preferred for failover and scale). To use VPN as a Direct Connect backup, run BGP on both; when DX withdraws its routes, traffic shifts to the VPN automatically. Accelerated Site-to-Site VPN routes the tunnels over the AWS global backbone via Global Accelerator for more consistent performance.',
          bullets: [
            'VPN terminates on a virtual private gateway (single VPC) or a Transit Gateway (many VPCs).',
            'Two tunnels per connection for HA; configure both on the customer gateway.',
            'Dynamic BGP routing is preferred over static for automatic failover and easier scaling.',
            'VPN-as-DX-backup relies on BGP: DX route withdrawal fails traffic over to the VPN.',
          ],
          callout: { type: 'tip', text: 'For many VPCs plus hybrid, terminate the VPN (and DX transit VIF) on a Transit Gateway rather than per-VPC virtual private gateways — it centralizes hybrid connectivity and routing.' },
        },
        {
          heading: 'On-premises name resolution and route propagation',
          body: 'Implementing hybrid connectivity includes DNS and routing wiring. For name resolution, deploy Route 53 Resolver outbound endpoints with forwarding rules so AWS resolves on-premises domains, and inbound endpoints so on-premises resolves AWS private zones (covered in depth in the DNS sessions). For routing, enable route propagation so dynamically learned BGP routes populate the VPC or Transit Gateway route tables automatically instead of being added by hand. On a Transit Gateway, association decides which route table an attachment uses, and propagation decides which routes are advertised into a route table — together they implement segmentation.',
          bullets: [
            'Enable BGP route propagation so learned routes populate route tables automatically.',
            'Transit Gateway: association = which route table an attachment uses; propagation = which routes appear in it.',
            'Wire on-premises DNS with Resolver inbound/outbound endpoints as part of connectivity.',
          ],
        },
        {
          heading: 'Validating connectivity',
          body: 'After implementation, validate before declaring success. Transit Gateway Route Analyzer (in Network Manager) traces the route a packet would take across the Transit Gateway network and shows where it would be dropped. VPC Reachability Analyzer verifies the configured path between two resources end to end and names any blocking component. Together they confirm the design works without waiting for a user to report a failure. Flow logs and BGP session status (and received-route counts) round out the verification.',
          bullets: [
            'Transit Gateway Route Analyzer = trace the path across the TGW network and find drops.',
            'Reachability Analyzer = verify a specific source→destination path and identify blockers.',
            'Check BGP session state and advertised/received routes to confirm dynamic routing is healthy.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 1,
          question: 'A company wants its Site-to-Site VPN to automatically take over if the Direct Connect link fails, with no manual route changes. What should it configure?',
          options: [
            'Static routes on both the VPN and Direct Connect',
            'Dynamic BGP routing on both the Direct Connect and the VPN so route withdrawal triggers failover',
            'A second NAT gateway',
            'A public VIF on the VPN',
          ],
          correct: 1,
          explainCorrect: 'Correct — with BGP on both paths, when Direct Connect withdraws its routes the VPN routes remain and traffic fails over automatically. Static routing cannot react to a link failure on its own.',
          elaborativePrompt: 'Why does dynamic BGP enable automatic failover where static routes would not?',
        },
        {
          afterSection: 0,
          question: 'An engineer must connect a single Direct Connect connection to VPCs located in three different AWS Regions. Which component makes this possible?',
          options: [
            'A virtual private gateway per VPC',
            'A Direct Connect gateway associated with the private VIF',
            'A separate Direct Connect per Region',
            'VPC peering',
          ],
          correct: 1,
          explainCorrect: 'Correct — a Direct Connect gateway is a global resource that lets one DX connection (via private or transit VIF) reach VPCs and Transit Gateways across multiple Regions and accounts.',
          elaborativePrompt: 'What does a Direct Connect gateway add over attaching a VIF directly to a single VPC\'s virtual private gateway?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must provision DX to reach Transit Gateways in two Regions, add an encrypted backup path, wire on-premises DNS, and prove it all works. Walk through the VIF and DX gateway choices, the VPN and BGP setup, the route propagation, and the tools you use to validate.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company is implementing hybrid connectivity to Transit Gateways in two AWS Regions over a single Direct Connect connection, with a Site-to-Site VPN as automatic backup. Which combination correctly implements this?',
        options: [
          'A private VIF to each VPC and static VPN routes',
          'A transit VIF associated with a Direct Connect gateway connected to both Transit Gateways, plus a BGP-routed Site-to-Site VPN on the Transit Gateways as backup',
          'A public VIF and a NAT gateway',
          'Inter-Region VPC peering only',
        ],
        correct: 1,
        explanation: {
          summary: 'Reaching Transit Gateways over Direct Connect requires a transit VIF through a Direct Connect gateway, which can associate with TGWs in multiple Regions; a BGP-routed Site-to-Site VPN terminated on the TGWs provides automatic failover when DX withdraws its routes.',
          perOption: [
            'Private VIFs go to VPCs, not Transit Gateways, and static VPN routes cannot fail over automatically.',
            'Correct — transit VIF + Direct Connect gateway reaches multi-Region TGWs, and BGP VPN backup fails over automatically.',
            'A public VIF reaches AWS public services, not Transit Gateways, and a NAT gateway is irrelevant here.',
            'Inter-Region VPC peering connects VPCs, not on-premises to AWS, so it is not hybrid connectivity.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd2-s8',
      number: 8,
      module: 'Domain 2 · Network Implementation',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.2',
      title: 'Implementing Multi-Account & Multi-VPC Connectivity — Hub-and-Spoke, RAM, and Boundaries',
      duration: 30,
      summary: 'This session implements the multi-account network: a Transit Gateway hub-and-spoke shared across accounts with RAM, the route-table segmentation that isolates environments, security at the boundaries with security groups, NACLs, and Network Firewall, and the DHCP and routing details that make a single- or multi-VPC design actually work.',
      objectives: [
        'Implement a hub-and-spoke topology with Transit Gateway and share it across accounts with RAM',
        'Segment traffic using multiple Transit Gateway route tables (association and propagation)',
        'Implement security between network boundaries with security groups, NACLs, and Network Firewall',
        'Configure VPC fundamentals — DHCP option sets, routing, and subnet design — for multi-VPC connectivity',
      ],
      preLearningCheck: {
        question: 'In a Transit Gateway hub, you must ensure production VPCs can reach shared services but NOT each other or the development VPCs. What feature implements this isolation?',
        options: [
          'A single default Transit Gateway route table for all attachments',
          'Multiple Transit Gateway route tables with controlled association and propagation per attachment',
          'Security groups on the Transit Gateway',
          'A NAT gateway per VPC',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Transit Gateway segmentation is done with multiple route tables. You associate each attachment with a route table and control which routes propagate into it, so you decide exactly which attachments can reach which — e.g. all spokes reach shared services but not each other.',
      },
      sections: [
        {
          heading: 'Building the hub-and-spoke and sharing it',
          body: 'The standard multi-VPC topology is a Transit Gateway hub with VPC attachments as spokes. Each VPC gets a TGW attachment (an ENI in a subnet per AZ), a route to the TGW in its subnet route tables, and the TGW routes traffic between attachments. To use one TGW across many accounts, the network/shared-services account owns the TGW and shares it with AWS Resource Access Manager (RAM); other accounts then create attachments to it. This centralizes hybrid links (DX, VPN) and inter-VPC routing in one account while workloads stay in their own accounts.',
          bullets: [
            'Each VPC attachment places TGW ENIs in a subnet per AZ; add a route to the TGW in VPC route tables.',
            'Share the Transit Gateway across accounts with AWS RAM; spoke accounts create their own attachments.',
            'Centralize DX and VPN on the TGW so all spokes inherit hybrid connectivity through the hub.',
            'A transit VPC (appliance-based) is the older pattern; Transit Gateway is the managed, preferred one.',
          ],
          callout: { type: 'note', text: 'For "connect many VPCs across accounts with central hybrid links," the answer is a Transit Gateway owned by a network account and shared via RAM — not a mesh of peering or per-VPC VPNs.' },
          interactive: 'vpc-connectivity',
        },
        {
          heading: 'Segmentation with route tables',
          body: 'Transit Gateway route tables are how you segment a flat hub into isolated domains. Each attachment is associated with exactly one route table (which determines the routes that attachment can use), and routes are propagated into route tables (which determines what destinations appear). A common pattern: a "spokes" route table that has a route only to the shared-services VPC (so spokes reach shared services but not each other), and a "shared-services" route table that has routes to all spokes. Blackhole routes can explicitly drop traffic. This association/propagation model is the heart of multi-environment isolation.',
          bullets: [
            'Association = which route table an attachment uses; propagation = which routes land in a route table.',
            'Spoke-to-shared-services-only isolation: spokes\' route table routes to shared services; no spoke-to-spoke routes.',
            'Blackhole routes explicitly discard traffic to a prefix.',
          ],
          callout: { type: 'tip', text: 'When a question asks to allow spokes to reach shared services but not each other, the answer is multiple TGW route tables with selective propagation — not security groups or separate Transit Gateways.' },
        },
        {
          heading: 'Security at the boundaries',
          body: 'Layered boundary controls: security groups are stateful and operate at the ENI/instance level (allow rules only) — the first line for instance-level access. Network ACLs are stateless and operate at the subnet level (allow and deny rules, evaluated by rule number) — useful for coarse subnet-wide deny rules. AWS Network Firewall is a managed, stateful firewall deployed in dedicated firewall subnets for VPC-level traffic filtering: domain filtering, Suricata-compatible IPS rules, and centralized inspection — often combined with a Transit Gateway so all inter-VPC and egress traffic is routed through a central inspection VPC. Network Firewall (or GWLB with third-party appliances) is the answer for deep, centralized traffic inspection that security groups and NACLs cannot do.',
          bullets: [
            'Security group = stateful, instance/ENI level, allow-only.',
            'NACL = stateless, subnet level, allow + deny by rule order.',
            'AWS Network Firewall = managed stateful VPC firewall (domain/IPS filtering), often centralized via TGW + inspection VPC.',
            'Centralized egress/inspection: route spoke traffic through a TGW to an inspection VPC running Network Firewall or GWLB appliances.',
          ],
        },
        {
          heading: 'VPC fundamentals that make it work',
          body: 'Multi-VPC connectivity still depends on the basics. DHCP option sets define the DNS servers and domain name handed to instances — point them at custom resolvers for hybrid DNS. Subnet route tables must have the routes to the TGW/peering/endpoints for traffic to flow. Subnet design (per-AZ subnets, dedicated subnets for TGW attachments, NAT, and firewall endpoints) and non-overlapping CIDR planning are prerequisites. Secondary CIDR blocks extend a VPC that is running out of space. These details are frequently the difference between a design that works and one that silently drops traffic.',
          bullets: [
            'DHCP option sets set instance DNS/domain — key for hybrid name resolution.',
            'Every subnet route table needs the explicit route to the TGW/peer/endpoint.',
            'Dedicate small subnets to TGW attachments, NAT, and firewall endpoints; keep CIDRs non-overlapping.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A central networking account owns a Transit Gateway. How do workload accounts in the same organization attach their VPCs to it?',
          options: [
            'Recreate the Transit Gateway in each account',
            'Share the Transit Gateway with AWS Resource Access Manager, then create attachments from the workload accounts',
            'Use VPC peering to the networking account',
            'Enable a public VIF',
          ],
          correct: 1,
          explainCorrect: 'Correct — sharing the TGW via AWS RAM lets other accounts in the organization create VPC attachments to the shared Transit Gateway without duplicating it.',
          elaborativePrompt: 'Why is sharing one TGW via RAM better than each account running its own Transit Gateway?',
        },
        {
          afterSection: 2,
          question: 'A company must inspect all egress traffic from dozens of spoke VPCs with domain filtering and IPS rules, centrally. Which implementation fits?',
          options: [
            'A security group rule on each instance',
            'Route spoke traffic through the Transit Gateway to a central inspection VPC running AWS Network Firewall',
            'A network ACL on every subnet',
            'A NAT gateway in each spoke',
          ],
          correct: 1,
          explainCorrect: 'Correct — centralized inspection routes spoke egress via the TGW to an inspection VPC with AWS Network Firewall, which does domain filtering and Suricata IPS — capabilities security groups and NACLs lack.',
          elaborativePrompt: 'Why can security groups and NACLs not provide the centralized domain/IPS inspection that Network Firewall does?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must connect 30 VPCs across accounts so they reach shared services but not each other, run all egress through central inspection, and keep one TGW for the whole org. Walk through the hub-and-spoke build, RAM sharing, the route-table segmentation, and where Network Firewall sits.',
      sample: {
        type: 'multiple-choice',
        stem: 'An organization runs many VPCs across multiple accounts. Requirements: all VPCs reach a shared-services VPC but spokes must not reach each other, one Transit Gateway serves the whole organization, and all internet egress is centrally inspected. Which implementation meets these requirements?',
        options: [
          'A full mesh of VPC peering with security groups controlling access',
          'A Transit Gateway shared via RAM, with separate TGW route tables so spokes route only to shared services, and spoke egress routed through a central inspection VPC running AWS Network Firewall',
          'One large shared VPC for every account with NACLs between subnets',
          'A Site-to-Site VPN between every pair of VPCs',
        ],
        correct: 1,
        explanation: {
          summary: 'A RAM-shared Transit Gateway gives one hub for the org; multiple TGW route tables enforce spoke-to-shared-services-only isolation; routing spoke egress through a central inspection VPC with Network Firewall delivers centralized egress inspection.',
          perOption: [
            'A peering mesh does not scale, is non-transitive, and security groups cannot centrally inspect egress.',
            'Correct — shared TGW + segmented route tables + central inspection VPC with Network Firewall meets isolation, single-hub, and inspection requirements together.',
            'Collapsing every account into one VPC breaks isolation and does not provide central egress inspection.',
            'A VPN mesh between VPC pairs is unscalable and is not how inter-VPC connectivity is built.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd2-s9',
      number: 9,
      module: 'Domain 2 · Network Implementation',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.3',
      title: 'Implementing Complex Hybrid & Multi-Account DNS',
      duration: 30,
      summary: 'This session implements DNS for the real, messy enterprise: conditional forwarding both directions with Resolver endpoints, private hosted zones shared across accounts with RAM, centralized vs. distributed DNS architectures, the right record types, DNSSEC on Route 53, and DNS monitoring and logging.',
      objectives: [
        'Implement bidirectional conditional forwarding with Resolver inbound and outbound endpoints and rules',
        'Share private hosted zones and Resolver rules across accounts with AWS RAM',
        'Choose centralized vs. distributed DNS architecture and the correct record types',
        'Enable DNSSEC on Route 53 and configure DNS query logging',
      ],
      preLearningCheck: {
        question: 'A central networking account hosts Route 53 Resolver outbound rules for forwarding queries to on-premises DNS. How do workload accounts use the same forwarding rules without recreating them?',
        options: [
          'Copy the rules manually into each account',
          'Share the Resolver rules with AWS Resource Access Manager and associate them with the workload VPCs',
          'Use a public hosted zone',
          'Enable DNSSEC',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: Route 53 Resolver rules (and private hosted zones) are shareable via AWS RAM. A central account defines the forwarding rules once, shares them, and workload accounts associate them with their VPCs — the basis of centralized hybrid DNS.',
      },
      sections: [
        {
          heading: 'Conditional forwarding both directions',
          body: 'Enterprise hybrid DNS resolves names in both directions. Implement it with Resolver endpoints and rules:\n\nOutbound endpoint + forwarding rules — for each on-premises domain (e.g. corp.example.com), a Resolver rule forwards matching queries from the VPC to the on-premises DNS server IPs. This is conditional forwarding: only the matching domains go on-premises; everything else uses the default resolver.\n\nInbound endpoint — provides IP addresses in the VPC that on-premises DNS servers conditionally forward to, so on-premises can resolve Route 53 private hosted zone names. The endpoints are deployed across AZs for resilience. This pairing is the canonical hybrid DNS implementation.',
          bullets: [
            'Outbound endpoint + rule per on-premises domain = AWS resolves on-premises names (conditional forwarding).',
            'Inbound endpoint = on-premises resolves AWS private zone names (point on-premises forwarders at it).',
            'Deploy endpoints in multiple AZs; each endpoint has IPs that on-premises/AWS forward to.',
          ],
          callout: { type: 'note', text: 'Remember direction: outbound = queries leaving AWS to on-premises; inbound = queries entering AWS from on-premises. Full hybrid DNS uses both, with conditional forwarding rules on each side.' },
          interactive: 'resolver-endpoint',
        },
        {
          heading: 'Sharing DNS across accounts with RAM',
          body: 'In multi-account organizations you do not want DNS configured per account. Route 53 Resolver rules can be shared via AWS RAM: a central networking account defines the outbound forwarding rules once, shares them with the organization, and member accounts associate the shared rules with their VPCs — so every account resolves on-premises names consistently. Private hosted zones can be associated with VPCs in other accounts (cross-account association), centralizing internal DNS. This RAM-based sharing is how the exam expects centralized hybrid DNS to scale.',
          bullets: [
            'Share Resolver forwarding rules via RAM; member accounts associate them with their VPCs.',
            'Associate a central private hosted zone with VPCs in multiple accounts/Regions for shared internal names.',
            'Centralizing DNS rules avoids drift and per-account duplication across the organization.',
          ],
          callout: { type: 'tip', text: 'When DNS must behave identically across dozens of accounts, define rules and zones centrally and share with RAM — do not replicate configuration account by account.' },
        },
        {
          heading: 'Centralized vs. distributed DNS, and record types',
          body: 'Two architectures: a centralized DNS account runs the Resolver endpoints and forwarding rules, and all VPCs use them via RAM — simpler governance, single point to manage and secure. A distributed model puts endpoints in each VPC/account — more isolation but more to manage. The exam usually favors centralized for consistency at scale. Record-type literacy matters: A (IPv4), AAAA (IPv6), CNAME (alias to another hostname, not at apex), alias (AWS resources, works at apex), TXT (verification/SPF/DKIM), PTR (reverse DNS), MX (mail), NS/SOA (delegation/zone authority). Use alias for AWS endpoints at the apex; CNAME only below the apex for external names.',
          bullets: [
            'Centralized DNS account + RAM sharing = consistent, governable hybrid DNS at scale.',
            'A/AAAA = IPv4/IPv6; CNAME = non-apex external; alias = AWS targets at apex; PTR = reverse; TXT = verification.',
            'Delegation uses NS records; conditional forwarding routes a subdomain to specific resolvers.',
          ],
        },
        {
          heading: 'DNSSEC, monitoring, and logging',
          body: 'Implement DNSSEC signing on a Route 53 public hosted zone to let resolvers verify responses are authentic (protecting against spoofing/cache poisoning); this requires creating a key-signing key (KSK) in AWS KMS and adding a DS record at the parent registrar. The Resolver can also perform DNSSEC validation on inbound resolution. For observability, enable Route 53 Resolver query logging to capture the DNS queries from your VPCs (to CloudWatch Logs, S3, or Kinesis Data Firehose) — essential for troubleshooting and security analysis. Public hosted zones can log queries too. Health checks and CloudWatch metrics round out DNS monitoring.',
          bullets: [
            'DNSSEC signing on public zones: KSK in KMS + DS record at the registrar; Resolver can validate DNSSEC.',
            'Resolver query logging captures VPC DNS queries (CloudWatch Logs/S3/Firehose) for troubleshooting and security.',
            'Use health checks and Route 53 metrics to monitor DNS-driven failover and endpoint health.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'EC2 instances must resolve names in the on-premises domain corp.example.com, while all other lookups use the default resolver. What is the correct implementation?',
          options: [
            'An inbound Resolver endpoint',
            'An outbound Resolver endpoint with a forwarding rule for corp.example.com pointing at the on-premises DNS servers',
            'A public hosted zone for corp.example.com',
            'A CNAME at the zone apex',
          ],
          correct: 1,
          explainCorrect: 'Correct — conditional forwarding via an outbound endpoint and a rule for corp.example.com sends only those queries to on-premises while everything else uses the default resolver.',
          elaborativePrompt: 'Why is conditional forwarding preferable to forwarding all queries on-premises?',
        },
        {
          afterSection: 2,
          question: 'A company needs the apex record example.com to point to a CloudFront distribution. Which record type must be used?',
          options: [
            'A CNAME record',
            'A Route 53 alias record',
            'An MX record',
            'A PTR record',
          ],
          correct: 1,
          explainCorrect: 'Correct — a CNAME cannot exist at the zone apex; a Route 53 alias record points the apex to the CloudFront distribution and resolves at query time.',
          elaborativePrompt: 'What limitation of CNAME records makes alias records necessary at the apex?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a multi-account org needs every account to resolve on-premises names consistently, on-premises to resolve AWS private names, the apex pointing at an ALB, signed public DNS, and query visibility. Walk through the endpoints, RAM sharing, record types, DNSSEC, and logging you would implement.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company with 25 AWS accounts in an organization needs every account to resolve names in the on-premises domain, managed centrally so the configuration is identical everywhere and easy to maintain. Which implementation best meets this requirement?',
        options: [
          'Create an outbound Resolver endpoint and forwarding rule in every account separately',
          'In a central networking account, create an outbound Resolver endpoint and forwarding rules, share the rules via AWS RAM, and associate them with each account\'s VPCs',
          'Create a public hosted zone for the on-premises domain',
          'Use a single NAT gateway for all DNS traffic',
        ],
        correct: 1,
        explanation: {
          summary: 'Defining the outbound endpoint and forwarding rules once in a central account and sharing the rules via AWS RAM gives consistent, centrally managed hybrid DNS that every account associates with its VPCs — no per-account drift.',
          perOption: [
            'Per-account endpoints and rules duplicate configuration 25 times and invite drift — the opposite of central management.',
            'Correct — central Resolver rules shared with RAM and associated to member VPCs deliver identical, maintainable hybrid DNS at scale.',
            'A public hosted zone exposes internal names publicly and does not forward AWS queries to on-premises DNS.',
            'A NAT gateway has nothing to do with DNS resolution or forwarding rules.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    {
      id: 'd2-s10',
      number: 10,
      module: 'Domain 2 · Network Implementation',
      domain: 'd2',
      weight: '26%',
      task: 'Task 2.4',
      title: 'Automating Network Infrastructure — IaC, Event-Driven Automation, and Avoiding Hardcoding',
      duration: 30,
      summary: 'Networks at scale must be code. This session covers automating network infrastructure the way the exam expects: provisioning with CloudFormation, the CDK, the CLI, SDKs, and APIs; event-driven automation with EventBridge and Lambda; integrating hybrid automation; and why hardcoded values in templates cause failures you must design out.',
      objectives: [
        'Choose the right IaC tool — CloudFormation, CDK, CLI, SDK, or API — for a network automation task',
        'Build event-driven network automation with EventBridge and Lambda',
        'Avoid the failure modes of hardcoded values in IaC templates',
        'Integrate hybrid and repeatable network configurations with AWS-native IaC',
      ],
      preLearningCheck: {
        question: 'A CloudFormation template hardcodes specific subnet IDs and AMI IDs, so it fails when deployed to a different Region or account. What is the correct way to make it portable?',
        options: [
          'Copy and edit the template for every Region and account',
          'Use parameters, mappings, pseudo parameters, and dynamic references (e.g. Parameter Store / SSM public parameters) instead of hardcoded values',
          'Hardcode every Region\'s values in one giant template',
          'Stop using infrastructure as code',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: hardcoded resource IDs break portability. Parameters, mappings, pseudo parameters (like AWS::Region), and dynamic references (SSM Parameter Store, including AWS public parameters for AMIs) make a template reusable across Regions and accounts.',
      },
      sections: [
        {
          heading: 'The IaC toolset',
          body: 'AWS offers several ways to define network infrastructure as code:\n\nAWS CloudFormation — declarative templates (JSON/YAML) describing resources and their relationships; CloudFormation handles ordering, rollback, and drift detection. StackSets deploy the same template across many accounts and Regions — ideal for org-wide network baselines.\n\nAWS CDK — define infrastructure in a programming language (TypeScript, Python, etc.); it synthesizes to CloudFormation, giving loops, conditionals, and reusable constructs for complex networks.\n\nAWS CLI / SDK / APIs — imperative control for scripting and integrating networking actions into pipelines and tools.\n\nThe exam favors declarative IaC (CloudFormation/CDK) for repeatable, reviewable, version-controlled network provisioning, and StackSets for multi-account rollout.',
          bullets: [
            'CloudFormation = declarative templates; StackSets = same template across many accounts/Regions.',
            'CDK = infrastructure in a real programming language, synthesized to CloudFormation.',
            'CLI/SDK/API = imperative; good for scripting and pipeline integration.',
            'Repeatable, reviewable, versioned network configs → declarative IaC over manual console changes.',
          ],
          callout: { type: 'note', text: 'For org-wide, consistent network baselines (VPCs, TGW attachments, guardrails) across accounts and Regions, CloudFormation StackSets is the go-to deployment mechanism.' },
        },
        {
          heading: 'Event-driven network automation',
          body: 'Beyond provisioning, networks need to react. The event-driven pattern: a change or finding emits an event to Amazon EventBridge, which triggers a Lambda function (or Systems Manager Automation, or Step Functions) to take a networking action — e.g. auto-tag a new ENI, revert an unauthorized security group change, update a route, or remediate a non-compliant configuration detected by AWS Config. Config rules with automatic remediation, and EventBridge rules on API calls (via CloudTrail), implement self-healing and guardrails without human intervention.',
          bullets: [
            'EventBridge → Lambda / SSM Automation / Step Functions = the standard event-driven automation shape.',
            'AWS Config rule + auto-remediation = detect and fix non-compliant network config automatically.',
            'EventBridge on CloudTrail events can revert risky changes (e.g. an opened security group) in seconds.',
          ],
          callout: { type: 'tip', text: 'When a question wants automatic reaction to a network change or non-compliant resource, think event-driven: EventBridge (or Config rules) triggering Lambda/SSM Automation — not a scheduled script or manual review.' },
        },
        {
          heading: 'Why hardcoding fails',
          body: 'Hardcoded values are the classic IaC anti-pattern the exam calls out. A template that embeds specific subnet IDs, AMI IDs, account IDs, or CIDRs cannot be reused across Regions or accounts and breaks when those resources change. The fixes: parameters (inputs supplied at deploy time), mappings (e.g. Region → AMI), pseudo parameters (AWS::Region, AWS::AccountId), and dynamic references that pull values at deploy time from SSM Parameter Store or Secrets Manager — including AWS-published public SSM parameters for the latest AMIs. These make templates portable, reduce drift, and avoid the lowest-cost-but-fragile trap of copy-edited templates.',
          bullets: [
            'Hardcoded IDs/CIDRs/AMIs break portability and reuse across accounts and Regions.',
            'Use parameters, mappings, pseudo parameters, and SSM/Secrets dynamic references instead.',
            'AWS public SSM parameters provide always-current AMI IDs — no hardcoded AMI per Region.',
          ],
          callout: { type: 'warning', text: 'Copy-editing a template per Region/account to change hardcoded values seems cheap but multiplies maintenance and drift. The exam-correct answer is parameterization and dynamic references in a single reusable template.' },
        },
        {
          heading: 'Hybrid and cost-efficient automation',
          body: 'Network automation should extend to hybrid and stay cost-aware. Integrate on-premises or third-party automation with AWS-native IaC by exposing parameters and using APIs, so hybrid changes are codified rather than manual. Automating optimization — right-sizing NAT, consolidating endpoints, cleaning up unused Elastic IPs and idle Transit Gateway attachments — eliminates waste and achieves efficiency at the lowest cost while keeping configurations repeatable. The goal is a network where every change is a reviewed, version-controlled, automated action with no console drift.',
          bullets: [
            'Codify hybrid changes by integrating third-party/on-premises automation with AWS IaC via parameters and APIs.',
            'Automate cleanup of unused EIPs, idle endpoints, and stale attachments to control cost.',
            'Treat every network change as version-controlled code reviewed before deploy — no manual drift.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 0,
          question: 'A company must deploy an identical baseline VPC and Transit Gateway attachment configuration to 30 accounts across two Regions, consistently. Which mechanism fits best?',
          options: [
            'Run the AWS CLI by hand in each account',
            'CloudFormation StackSets',
            'A single CloudFormation stack in one account',
            'Edit the console in each account',
          ],
          correct: 1,
          explainCorrect: 'Correct — StackSets deploy one template across many accounts and Regions from a central point, giving consistent, repeatable network baselines.',
          elaborativePrompt: 'Why are StackSets better than running the same template manually 60 times?',
        },
        {
          afterSection: 2,
          question: 'A CloudFormation template fails when deployed to a new Region because it references a specific AMI ID and subnet ID. What is the best fix?',
          options: [
            'Maintain a separate hardcoded template per Region',
            'Use parameters, Region mappings or AWS public SSM parameters for the AMI, and dynamic references instead of hardcoded IDs',
            'Remove the resources that vary by Region',
            'Deploy only to the original Region',
          ],
          correct: 1,
          explainCorrect: 'Correct — parameters, mappings/public SSM parameters, and dynamic references make the template portable across Regions without hardcoded IDs, avoiding per-Region template sprawl.',
          elaborativePrompt: 'How do dynamic references and parameters remove the fragility that hardcoded IDs introduce?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: you must roll out a consistent network baseline to many accounts, automatically revert risky security group changes, and make your templates portable across Regions. Walk through the IaC tool, the event-driven mechanism, and how you eliminate hardcoded values.',
      sample: {
        type: 'multiple-choice',
        stem: 'A platform team must provision identical networking baselines across 40 accounts and 3 Regions, keep templates portable so they do not break per Region, and automatically remediate any security group that is changed to allow 0.0.0.0/0 on SSH. Which combination meets these requirements?',
        options: [
          'Hardcoded per-Region templates run manually, with a weekly audit',
          'CloudFormation StackSets with parameters and SSM dynamic references for portability, plus an EventBridge rule (or AWS Config rule with auto-remediation) that triggers Lambda to revert non-compliant security group changes',
          'A single stack in one account and email alerts for security group changes',
          'CDK deployed by hand to each account with hardcoded AMI IDs',
        ],
        correct: 1,
        explanation: {
          summary: 'StackSets deploy consistent baselines across accounts and Regions; parameters and dynamic references keep templates portable; an EventBridge or Config-rule-driven Lambda auto-reverts the risky security group change — covering provisioning, portability, and automated remediation.',
          perOption: [
            'Manual per-Region templates and weekly audits are exactly the drift-prone, slow approach the requirements rule out.',
            'Correct — StackSets + parameterized/dynamic templates + event-driven auto-remediation meets consistency, portability, and self-healing together.',
            'A single stack does not cover 40 accounts, and email alerts are not automatic remediation.',
            'Hand-deployed CDK with hardcoded AMIs breaks portability and consistency.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

    // ═══════════════════════════════════════════════════════════════
    //  DOMAIN 3 — NETWORK MANAGEMENT AND OPERATION (20%)
    // ═══════════════════════════════════════════════════════════════

    {
      id: 'd3-s11',
      number: 11,
      module: 'Domain 3 · Network Management and Operation',
      domain: 'd3',
      weight: '20%',
      task: 'Task 3.1',
      title: 'Maintaining Routing & Connectivity — BGP, Route Tables, Quotas, and Propagation',
      duration: 30,
      summary: 'Keeping a network running is its own discipline. This session covers maintaining routing and connectivity: BGP over Direct Connect and VPN, Direct Connect gateway and VIF behavior, route propagation and route tables, the service limits and quotas that bite at scale, and route summarization and CIDR-overlap handling.',
      objectives: [
        'Manage BGP routing over Direct Connect and VPN, and maintain private/public access to AWS services',
        'Use route tables and propagation to direct traffic correctly',
        'Account for the limits and quotas that constrain networking services',
        'Optimize routing with route summarization and resolve CIDR-overlap and route-precedence issues',
      ],
      preLearningCheck: {
        question: 'A Transit Gateway route table has both a static route and a propagated route to the same destination prefix. Which one does the Transit Gateway use?',
        options: [
          'The propagated route always wins',
          'The static route is preferred over the propagated route for the same prefix',
          'It load-balances between them equally',
          'It drops the traffic as a conflict',
        ],
        correct: 1,
        note: 'No pressure — guessing first improves retention. The key idea: for an identical prefix, a Transit Gateway prefers a static route over a propagated (dynamically learned) route. More specific prefixes always win first (longest-prefix match); static beats propagated only when the prefix length is equal.',
      },
      sections: [
        {
          heading: 'Maintaining BGP routing',
          body: 'Hybrid connectivity runs on BGP, and maintaining it means watching sessions and route exchange. Over Direct Connect (and dynamic VPN), each VIF/tunnel runs a BGP session; you monitor session state, the number of advertised and received routes, and stay under route limits. AWS advertises VPC/TGW prefixes to you and accepts your on-premises prefixes. Maintaining active/passive or load-shared designs means keeping the BGP attributes (AS path prepending, local preference via communities, MED) configured as intended, and verifying failover by checking that route withdrawal shifts traffic. Bidirectional Forwarding Detection (BFD) speeds failure detection so failover happens faster than BGP timers alone.',
          bullets: [
            'Monitor BGP session state and advertised/received route counts per VIF/tunnel.',
            'Keep AS path prepending / local preference / MED set to preserve the intended path selection.',
            'Enable BFD for sub-second failure detection and faster failover than default BGP hold timers.',
          ],
          callout: { type: 'note', text: 'AWS route preference: longest-prefix match first; for equal prefixes, a static route beats a propagated one. On a VPC route table, the most specific matching route wins regardless of how it was added.' },
        },
        {
          heading: 'Route tables, propagation, and access methods',
          body: 'Maintaining connectivity is largely route-table hygiene. Route propagation automatically installs BGP-learned routes from a virtual private gateway or Transit Gateway into route tables, so you do not hand-maintain them. On a Transit Gateway, association (which route table an attachment uses) and propagation (which routes appear) must stay aligned with the segmentation intent. For accessing AWS services privately, maintain gateway VPC endpoints (S3, DynamoDB — added as routes/prefix lists in route tables) and interface endpoints (PrivateLink — DNS-resolved ENIs); for public access over DX, maintain the public VIF. Prefix lists (including managed prefix lists shared via RAM) keep route and security rules concise and consistent.',
          bullets: [
            'Route propagation auto-installs learned routes; verify it is enabled where you rely on dynamic routing.',
            'Gateway endpoints (S3/DynamoDB) add prefix-list routes; interface endpoints (PrivateLink) are DNS-resolved ENIs.',
            'Managed prefix lists (shareable via RAM) keep route tables and security groups concise and consistent.',
          ],
          callout: { type: 'tip', text: 'If private connectivity to S3/DynamoDB "stops working," check the gateway endpoint\'s prefix-list route in the affected subnet route table — a missing or overridden route is the usual cause.' },
        },
        {
          heading: 'Limits and quotas',
          body: 'At scale, service quotas shape design and maintenance. Examples the exam expects you to respect: a VPC route table holds a limited number of routes (raise-able to a point), so summarize prefixes rather than advertising many specific ones; Direct Connect VIFs and BGP routes per VIF are capped (around 100 prefixes advertised over a private/transit VIF by default — exceeding it can drop the session), so summarize; Transit Gateway, peering, and endpoint counts have quotas; and bandwidth is bounded per connection/attachment. Monitor usage against Service Quotas and request increases proactively. Hitting a hard limit (like the DX prefix limit) can break a BGP session entirely, not just throttle it.',
          bullets: [
            'VPC route-table entries and DX/VIF advertised-prefix counts are limited — summarize routes to stay under them.',
            'Exceeding the Direct Connect prefix advertisement limit can drop the BGP session, not just degrade it.',
            'Track Transit Gateway, peering, endpoint, and bandwidth quotas with Service Quotas; raise proactively.',
          ],
          callout: { type: 'warning', text: 'Advertising too many specific prefixes over Direct Connect can exceed the per-VIF route limit and tear down BGP. Summarize on-premises routes into aggregates to stay within quota.' },
        },
        {
          heading: 'Route summarization and CIDR overlap',
          body: 'Optimizing and maintaining routing means controlling the size and correctness of route tables. Route summarization (advertising 10.0.0.0/8 instead of dozens of /24s) reduces route count, stays under prefix limits, and simplifies maintenance — at the cost of less granular control. CIDR-overlap problems arise when networks share address space: routed solutions need unique CIDRs, so resolve overlaps with re-IP, NAT, or PrivateLink (per service). When troubleshooting "traffic goes the wrong way," check longest-prefix match (a more specific route elsewhere is winning), static-vs-propagated precedence, and whether summarization accidentally created a more-specific or less-specific match than intended.',
          bullets: [
            'Summarize prefixes to cut route count and stay under quotas (trade-off: coarser control).',
            'Resolve CIDR overlaps with re-IP, NAT, or PrivateLink — routed paths require unique address space.',
            'Wrong-path troubleshooting: check longest-prefix match and static-vs-propagated precedence first.',
          ],
        },
      ],
      microQuizzes: [
        {
          afterSection: 2,
          question: 'After a network grows, the BGP session over a Direct Connect private VIF starts dropping because too many specific prefixes are advertised. What is the best remedy?',
          options: [
            'Disable BGP and use static routes for everything',
            'Summarize the on-premises prefixes into aggregate routes to stay under the per-VIF prefix limit',
            'Add a second NAT gateway',
            'Switch to a public VIF',
          ],
          correct: 1,
          explainCorrect: 'Correct — Direct Connect caps advertised prefixes per VIF; summarizing many specific routes into aggregates keeps you under the limit and stabilizes the BGP session.',
          elaborativePrompt: 'Why does exceeding the prefix limit drop the whole BGP session rather than just ignoring extra routes?',
        },
        {
          afterSection: 0,
          question: 'On a VPC route table, traffic to 10.1.2.0/24 is going to the wrong target even though a 10.0.0.0/8 route points elsewhere. Why?',
          options: [
            'Route tables choose randomly',
            'The more specific 10.1.2.0/24 route wins by longest-prefix match over the broader 10.0.0.0/8',
            'Propagated routes always lose',
            'Security groups override route tables',
          ],
          correct: 1,
          explainCorrect: 'Correct — the most specific (longest-prefix) matching route always wins, so 10.1.2.0/24 takes precedence over 10.0.0.0/8 for that destination.',
          elaborativePrompt: 'How does longest-prefix match determine which route applies when several routes overlap?',
        },
      ],
      selfExplanationPrompt: 'Before the practice question, explain to yourself: a growing hybrid network has a flapping BGP session, traffic taking an unexpected path, and a route table nearing its limit. Walk through how you diagnose the prefix-limit problem, apply summarization, and use longest-prefix-match and static-vs-propagated rules to explain and fix the routing.',
      sample: {
        type: 'multiple-choice',
        stem: 'A company\'s Direct Connect BGP session becomes unstable as the on-premises network grows and advertises several hundred specific routes to AWS. The team must restore a stable session while keeping connectivity to all on-premises networks. What should they do?',
        options: [
          'Replace Direct Connect with a Site-to-Site VPN',
          'Summarize the on-premises routes into aggregate prefixes so the number advertised stays within the Direct Connect per-VIF limit',
          'Advertise even more specific routes for clarity',
          'Disable route propagation on the VPC route tables',
        ],
        correct: 1,
        explanation: {
          summary: 'Direct Connect limits the number of prefixes advertised per VIF; exceeding it destabilizes BGP. Summarizing the many specific routes into aggregates keeps full reachability while staying under the limit, restoring a stable session.',
          perOption: [
            'Switching to VPN does not address the root cause (too many prefixes) and reduces performance.',
            'Correct — route summarization reduces advertised-prefix count under the VIF limit while preserving connectivity.',
            'Advertising more specific routes worsens the prefix-count problem that is breaking BGP.',
            'Disabling propagation removes needed routes and breaks connectivity rather than fixing the prefix-limit issue.',
          ],
        },
      },
      videos: [COMPANION_VIDEO],
    },

  ],
}

export default ansC01Course
