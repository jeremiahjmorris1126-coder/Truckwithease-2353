import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase();

const C = {
  bg: "#080c14", card: "#0d1420", border: "#1a2540", gold: "#f5a623",
  blue: "#00d4ff", green: "#00e676", red: "#ff3d57", purple: "#a855f7",
  orange: "#ff6b35", teal: "#00bcd4", pink: "#e91e8c", text: "#e8eaf0", muted: "#5a6a8a",
};

const APIS = [
  {
    id: "openai", emoji: "🧠", label: "OpenAI — Dream Team Intelligence",
    desc: "Powers THE GOAT, HRease, Ghost Nerve, Game Up AI, and all 12 Dream Team agents with real intelligence", color: "#10a37f",
    fields: [{ key: "openai_api_key", label: "OpenAI API Key", placeholder: "sk-…", type: "password" }],
    tags: ["THE GOAT","HRease Brain","Ghost Nerve AI","Game Up Adaptive","Dispatch Intelligence","All 12 Agents"],
    guide: "platform.openai.com → API Keys → Create new secret key. Copy it immediately — it only shows once.",
    link: "/ai-team", linkLabel: "Open Dream Team →",
    getLink: "https://platform.openai.com/api-keys", getLinkLabel: "Get OpenAI Key →",
  },
  {
    id: "gemini", emoji: "✨", label: "Google Gemini — AI Intelligence",
    desc: "Powers Ghost Nerve, Dispatch AI, Phantom Compliance, document analysis, and predictive lane intelligence", color: "#4285f4",
    fields: [{ key: "gemini_api_key", label: "Gemini API Key", placeholder: "AIza… (from aistudio.google.com)", type: "password" }],
    tags: ["Ghost Nerve","Lane Prediction","Document AI","Driver Coaching","Compliance Risk"],
    guide: "Go to aistudio.google.com → Sign in with Google → API Keys → Create API Key. Free tier available.",
    link: "/dual-ai", linkLabel: "Open AI Intelligence →",
    getLink: "https://aistudio.google.com/app/apikey", getLinkLabel: "Get Gemini Key →",
  },
  {
    id: "ibm", emoji: "🔵", label: "IBM Watson — Precision AI (Cost-Controlled)",
    desc: "Applied only to 3 high-value functions: accident report voice capture, DOT document visual scanning, and driver speech commands. All other AI routed to OpenAI/Gemini to minimize cost.",
    color: "#0f62fe",
    fields: [
      { key: "ibm_api_key", label: "IBM API Key", placeholder: "Paste your IBM API key here", type: "password" },
      { key: "ibm_url", label: "IBM Service URL", placeholder: "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/…", type: "text" },
      { key: "ibm_monthly_limit", label: "Monthly Spend Limit ($)", placeholder: "e.g. 25", type: "text" },
    ],
    tags: ["Accident Voice Capture","DOT Doc Scanning","Driver Commands","Cost-Capped","Precision Only"],
    guide: "IBM is applied ONLY to: 1) Voice capture on accident reports, 2) DOT document photo scanning, 3) Driver voice commands in cab. Everything else uses OpenAI or Gemini. Set a monthly spend limit to cap your cost. Go to cloud.ibm.com → Resource List → Watson service → Manage → Credentials.",
    getLink: "https://cloud.ibm.com/resources", getLinkLabel: "Open IBM Dashboard →",
  },
  {
    id: "twilio", emoji: "📱", label: "Fleet Voice — Twilio",
    desc: "Hands-free calling & SMS through cab speakers", color: C.gold,
    fields: [
      { key: "twilio_sid", label: "Account SID (starts with AC…)", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      { key: "twilio_token", label: "Auth Token", placeholder: "Your Twilio Auth Token", type: "password" },
      { key: "twilio_phone", label: "Fleet Phone Number (optional)", placeholder: "+1 (555) 000-0000", type: "text" },
    ],
    tags: ["Fleet Voice", "Driver SMS", "Group Calls", "Signal Sam"],
    guide: "console.twilio.com → Account Info on homepage. SID starts with AC. Click eye icon for Auth Token.",
    link: "/fleet-voice", linkLabel: "Open Fleet Voice →",
    getLink: "https://console.twilio.com", getLinkLabel: "Open Twilio Console →",
  },
  {
    id: "twilio_rest", emoji: "💬", label: "Twilio REST — Automated Messaging",
    desc: "Auto-SMS drivers on load dispatch, alerts, signup verification, SOS notifications", color: "#f22f46",
    fields: [
      { key: "twilio_rest_sid", label: "Account SID (starts with AC…)", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", type: "text" },
      { key: "twilio_rest_token", label: "REST Auth Token", placeholder: "Your Twilio REST Auth Token", type: "password" },
      { key: "twilio_rest_from", label: "Sending Phone Number", placeholder: "+1 (555) 000-0000", type: "text" },
    ],
    tags: ["Load Dispatch SMS", "Driver Alerts", "Signup Verify", "SOS Notifications", "Payroll Alerts", "Breakdown Alerts"],
    guide: "console.twilio.com → Account Info. Use a separate Auth Token from your voice token for security. Get a messaging number under Phone Numbers → Manage.",
    link: "/dispatch", linkLabel: "Open Dispatch →",
  },
  {
    id: "serp", emoji: "🔍", label: "Search Intelligence — SerpAPI",
    desc: "Live broker reputation checks + road closure alerts", color: C.blue,
    fields: [{ key: "serpapi_key", label: "SerpAPI Key", placeholder: "64-character hex string", type: "password" }],
    tags: ["Broker Reputation", "Road Alerts", "Freight News", "Driver Pay Intel"],
    guide: "serpapi.com → Dashboard → Your Private API Key.",
    link: "/loads", linkLabel: "Open Load Board →",
  },
  {
    id: "gameup", emoji: "🎮", label: "Game Up — Driver Training AI",
    desc: "Powers all 10 training modules with adaptive AI", color: C.purple,
    fields: [{ key: "gameup_api_key", label: "Game Up AI Key", placeholder: "Paste your Game Up API key", type: "password" }],
    tags: ["HOS Rules","Pre-Trip DVIR","Hazmat","DOT Inspection","ELD","Accident Reporting"],
    guide: "Paste the key from your Game Brain / Game Up provider dashboard.",
    link: "/game-up", linkLabel: "Open Game Up →",
  },
  {
    id: "worldnews", emoji: "🌍", label: "World News Intelligence",
    desc: "Live freight news, lane alerts, fuel events, port disruptions", color: C.green,
    fields: [{ key: "worldnews_api_key", label: "World News API Key", placeholder: "Paste your World News API key", type: "password" }],
    tags: ["Dispatch Feed","Ghost Nerve","Driver Gala","Fuel Alerts","Port Disruptions"],
    guide: "worldnewsapi.com → My Account → API Key.",
    link: "/dispatch", linkLabel: "Open Dispatch →",
  },
  {
    id: "samsara", emoji: "🚛", label: "Samsara Fleet API",
    desc: "GPS, HOS, safety events, reefer temps from Samsara ELDs", color: C.orange,
    fields: [
      { key: "samsara_app_id", label: "Samsara App ID", placeholder: "From samsara.com/partners/technology", type: "text" },
      { key: "samsara_app_secret", label: "Samsara App Secret", placeholder: "Your Samsara App Secret", type: "password" },
    ],
    tags: ["GPS Tracking","HOS Logs","Safety Events","Reefer Temp","Vehicle Data"],
    guide: "Apply at samsara.com/partners/technology. Once approved you receive App ID and App Secret.",
    link: "/samsara-connect", linkLabel: "Samsara Connect →",
  },
  {
    id: "geotab", emoji: "📡", label: "Geotab ELD Integration",
    desc: "White-label ELD data — GPS, trips, engine hours, payroll miles", color: C.teal,
    fields: [
      { key: "geotab_database", label: "Geotab Database Name", placeholder: "Found in my.geotab.com URL", type: "text" },
      { key: "geotab_username", label: "API Username", placeholder: "Your Geotab API user email", type: "text" },
      { key: "geotab_password", label: "API Password", placeholder: "Your Geotab API password", type: "password" },
    ],
    tags: ["Live GPS","HOS Logs","Engine Hours","Payroll Miles","Fuel Data","Driver Score"],
    guide: "my.geotab.com → Administration → Users → Create API-only user.",
    link: "/geotab", linkLabel: "Geotab Setup Guide →",
  },
  {
    id: "dat", emoji: "📦", label: "DAT Load Board",
    desc: "Live freight loads, rate data, lane history from DAT", color: C.red,
    fields: [{ key: "dat_api_key", label: "DAT API Key", placeholder: "From dat.com developer portal", type: "password" }],
    tags: ["Live Loads","Rate Data","Lane History","Broker Info","Market Rates"],
    guide: "developer.dat.com → Sign In → My Account → API Keys → Generate New Key. Included free with any DAT subscription.",
    link: "/loads", linkLabel: "Open Load Board →",
    getLink: "https://developer.dat.com", getLinkLabel: "Get DAT API Key →",
  },
  {
    id: "azure", emoji: "☁️", label: "Microsoft Azure",
    desc: "Data analytics, Power BI reports, Teams alerts, AI services", color: C.blue,
    fields: [
      { key: "azure_client_id", label: "Azure Client ID", placeholder: "From Azure Portal → App Registrations", type: "text" },
      { key: "azure_client_secret", label: "Azure Client Secret", placeholder: "Your Azure Client Secret", type: "password" },
      { key: "azure_tenant_id", label: "Azure Tenant ID", placeholder: "Your Azure Directory (Tenant) ID", type: "text" },
    ],
    tags: ["Power BI","Data Factory","Teams Alerts","Cognitive Services"],
    guide: "portal.azure.com → Azure Active Directory → App Registrations → New Registration → Copy Client ID & Tenant ID → Certificates & Secrets → New Client Secret.",
    link: "/microsoft-integration", linkLabel: "Azure Integration →",
    getLink: "https://portal.azure.com", getLinkLabel: "Open Azure Portal →",
  },
  {
    id: "youtube", emoji: "▶️", label: "YouTube — Training Videos",
    desc: "Embed training videos into Game Up modules and driver onboarding", color: "#ff0000",
    fields: [{ key: "youtube_api_key", label: "YouTube Data API Key", placeholder: "AIza…", type: "password" }],
    tags: ["Game Up Modules","Driver Onboarding","Training Videos","HOS Tutorials"],
    guide: "console.cloud.google.com → APIs & Services → Credentials → YouTube Data API v3 key.",
    link: "/game-up", linkLabel: "Open Game Up →",
  },
  {
    id: "facebook", emoji: "📘", label: "Facebook / Meta — Job Posting",
    desc: "Post driver job ads to Facebook directly from HRease with one tap", color: "#1877f2",
    fields: [
      { key: "facebook_app_id", label: "Meta App ID", placeholder: "From developers.facebook.com", type: "text" },
      { key: "facebook_app_secret", label: "Meta App Secret", placeholder: "Your Meta App Secret", type: "password" },
    ],
    tags: ["Driver Job Ads","Facebook Recruiting","Applicant Tracking","One-Tap Post"],
    guide: "developers.facebook.com → My Apps → Create App → Business → Settings → Basic.",
    link: "/humanai", linkLabel: "Open HRease →",
  },
  {
    id: "linkedin", emoji: "💼", label: "LinkedIn — Driver Recruiting",
    desc: "Post driver openings to LinkedIn automatically from HRease", color: "#0077b5",
    fields: [
      { key: "linkedin_client_id", label: "LinkedIn Client ID", placeholder: "From linkedin.com/developers", type: "text" },
      { key: "linkedin_client_secret", label: "LinkedIn Client Secret", placeholder: "Your LinkedIn Client Secret", type: "password" },
    ],
    tags: ["Driver Recruiting","Job Postings","Applicant Background"],
    guide: "linkedin.com/developers → My Apps → Create App → Auth tab.",
    link: "/humanai", linkLabel: "Open HRease →",
  },
  {
    id: "twitter", emoji: "𝕏", label: "Twitter / X — Freight Intelligence",
    desc: "Real-time freight news, road alerts, and FMCSA updates into Ghost Nerve", color: "#e7e7e7",
    fields: [
      { key: "twitter_api_key", label: "API Key", placeholder: "From developer.twitter.com", type: "text" },
      { key: "twitter_api_secret", label: "API Secret", placeholder: "Your Twitter API Secret", type: "password" },
      { key: "twitter_bearer_token", label: "Bearer Token", placeholder: "Your Twitter Bearer Token", type: "password" },
    ],
    tags: ["Ghost Nerve","Freight News","Road Alerts","FMCSA Updates","Fuel Prices"],
    guide: "developer.twitter.com → Sign In → Create Project → Create App → Keys and Tokens tab → Bearer Token is there immediately. Takes 5 minutes.",
    link: "/ghost-nerve", linkLabel: "Open Ghost Nerve →",
    getLink: "https://developer.twitter.com/en/portal/dashboard", getLinkLabel: "Get Twitter/X Key →",
  },
  {
    id: "fmcsa", emoji: "🏛️", label: "FMCSA Safety API — ✅ Registered",
    desc: "You are already registered — just grab your API key and paste it here", color: C.green,
    fields: [{ key: "fmcsa_api_key", label: "FMCSA API Key", placeholder: "From ai.fmcsa.dot.gov/api → My Account → API Key", type: "password" }],
    tags: ["✅ Already Registered","Carrier Safety","Violation History","CSA Scores","DOT Numbers"],
    guide: "ai.fmcsa.dot.gov/api → sign in → My Account → API Key. You're already registered.",
    link: "/fmcsa-registration", linkLabel: "View FMCSA Status →",
  },
  {
    id: "azuga", emoji: "🔺", label: "Azuga ELD Integration",
    desc: "Connects Azuga ELD hardware to TruckWithEase — live GPS, driver behavior scores, vehicle diagnostics, and trip history flow directly into dispatch and payroll",
    color: "#e53e3e",
    fields: [
      { key: "azuga_api_key", label: "Azuga API Key", placeholder: "From azuga.com → Settings → Integrations → API Access", type: "password" },
      { key: "azuga_fleet_id", label: "Azuga Fleet ID", placeholder: "Your Azuga Fleet Account ID", type: "text" },
    ],
    tags: ["Live GPS","Driver Behavior","Harsh Braking","Vehicle Diagnostics","Trip History","Payroll Sync"],
    guide: "azuga.com → Sign In → Settings → Integrations → API Access → Copy API Key and Fleet ID. If not visible, email support@azuga.com and request fleet API credentials for third-party integration — same day response.",
    getLink: "https://www.azuga.com", getLinkLabel: "Open Azuga Portal →",
  },
  {
    id: "aws", emoji: "🟠", label: "Amazon Web Services (AWS)",
    desc: "Location mapping, document scanning, voice transcription, secure file storage, and push notifications — five powerful services in one connection",
    color: "#FF9900",
    fields: [
      { key: "aws_access_key_id", label: "AWS Access Key ID", placeholder: "AKIAxxxxxxxxxxxxxxxx", type: "text" },
      { key: "aws_secret_access_key", label: "AWS Secret Access Key", placeholder: "Your AWS Secret Access Key", type: "password" },
      { key: "aws_region", label: "AWS Region", placeholder: "us-east-1", type: "text" },
    ],
    tags: ["Location Maps","Document Scan","Voice Transcribe","File Storage","Push Alerts"],
    guide: "aws.amazon.com → Sign In → Click your name (top right) → Security Credentials → Access Keys → Create Access Key. Copy both Access Key ID and Secret Access Key. Powers: Amazon Location Service (truck routing), Rekognition (VIN/CDL scanning), Transcribe (accident voice capture), S3 (document storage), SNS (push notifications).",
    getLink: "https://console.aws.amazon.com/iam/home#/security_credentials", getLinkLabel: "Open AWS Security Credentials →",
  },
  {
    id: "bendix", emoji: "🔧", label: "Bendix ABS — Brake Intelligence",
    desc: "Pulls ABS event data, brake wear alerts, and stability control events directly from Peterbilt, Freightliner, and Kenworth ECMs into your safety score and maintenance agent",
    color: "#e53e3e",
    fields: [
      { key: "bendix_api_key", label: "Bendix ACom API Key", placeholder: "From partner.bendix.com", type: "password" },
      { key: "bendix_fleet_id", label: "Fleet ID", placeholder: "Your Bendix Fleet Account ID", type: "text" },
    ],
    tags: ["ABS Events","Brake Wear","Safety Score","Insurance","Maintenance"],
    guide: "partner.bendix.com → Apply as Technology Partner → once approved, API Key is under Account → Integrations. ABS activation events flow into your Safety Score and Insurance Savings Calculator automatically. Repeated ABS events on same axle trigger a maintenance alert before a DOT violation.",
    getLink: "https://www.bendix.com/en/products-and-services/safety-systems/acom-diagnostics.html", getLinkLabel: "Open Bendix Partner Portal →",
  },
  {
    id: "idrive", emoji: "📷", label: "iDrive E2 — AI Dashcam & Driver Safety",
    desc: "AI dashcam with forward and inward facing cameras — real-time distraction detection, drowsiness alerts, harsh event clips, collision detection — all feeding your safety score, accident reports, and driver scorecards automatically",
    color: "#10b981",
    fields: [
      { key: "idrive_api_key", label: "iDrive E2 API Key", placeholder: "From idrivecam.com fleet portal", type: "password" },
      { key: "idrive_fleet_id", label: "Fleet Account ID", placeholder: "Your iDrive Fleet ID", type: "text" },
    ],
    tags: ["AI Dashcam","Distraction Detection","Drowsiness","Safety Score","Accident Report","Driver Scorecard"],
    guide: "Go to idrivecam.com → Fleet Portal → Account Settings → API Access → Generate Key. Your Fleet Account ID is on the dashboard homepage. Once activated: every camera event (distraction, drowsiness, harsh brake, collision) feeds your Safety Score and Insurance Savings Calculator in real time. Accident clips auto-attach to reports. Ghost Nerve detects fleet-wide patterns across all cameras.",
    getLink: "https://www.idrivecam.com", getLinkLabel: "Open iDrive Fleet Portal →",
  },
  {
    id: "devsecops", emoji: "🛡️", label: "DevSecOps ALM — Application Lifecycle Management",
    color: "#7C3AED",
    description: "Enterprise security scanning, application health monitoring, compliance pipeline, and vulnerability detection across all 22 APIs and 140+ platform functions. Every code change checked against FMCSA, DOT, and data privacy regulations automatically.",
    fields: [
      { key: "devsecops_api_key", label: "DevSecOps ALM API Key", placeholder: "Your ALM API Key", type: "password" },
      { key: "devsecops_project_id", label: "Project ID", placeholder: "Your ALM Project ID", type: "text" },
      { key: "devsecops_org_id", label: "Organization ID", placeholder: "Your ALM Organization ID", type: "text" },
    ],
    powers: [
      "🛡️ Continuous security scanning across all 22 APIs",
      "👁️ THE GOAT master agent security intelligence",
      "🔐 Code Vault access logging and threat detection",
      "📋 FMCSA & DOT compliance pipeline automation",
      "⚡ Real-time vulnerability detection and auto-remediation",
      "📊 Application health monitoring across 140+ platform functions",
      "🔒 Driver data privacy protection (CCPA/GDPR compliant)",
      "🚨 Instant security alerts to platform owner",
    ],
    guide: "Log into your DevSecOps ALM portal → Settings → API Access → Generate API Key. Copy your Project ID and Organization ID from the dashboard. Once activated, security scanning runs continuously across all platform APIs, THE GOAT monitors threat levels, and your Code Vault logs every access attempt with full audit trail.",
    cost: "Enterprise — pay per scan",
  },
  {
    id: "kubernetes", emoji: "⚙️", label: "Kubernetes — Infrastructure Scale Manager",
    color: "#326CE5",
    description: "Auto-scaling infrastructure management. Activates when fleet count exceeds 500 — spins up additional computing power automatically to keep Ghost Nerve, Quantum Dispatch, and all 22 APIs responding instantly under heavy load. Your growth insurance policy.",
    fields: [
      { key: "kubernetes_api_key", label: "Kubernetes API Key", placeholder: "Your K8s API Key", type: "password" },
      { key: "kubernetes_cluster_url", label: "Cluster URL", placeholder: "https://your-cluster.kubernetes.io", type: "text" },
    ],
    powers: [
      "⚙️ Auto-scales when 500+ fleets are active simultaneously",
      "🔄 Zero-downtime deployments — platform never goes dark",
      "📊 Load balancing across Ghost Nerve and all 22 APIs",
      "🛡️ Self-healing — failed services restart automatically",
      "💾 Database scaling as driver count grows",
      "🌐 Multi-region deployment for nationwide coverage",
    ],
    guide: "Kubernetes is documented and ready — activate when active fleet count approaches 500. Your K8s API key is saved and waiting. When the time comes: log into your Kubernetes dashboard → Settings → API Access → paste your key here. THE GOAT will automatically trigger scaling events.",
    cost: "Pay per compute hour — activates at scale",
  },

  {
    id: "runware", emoji: "🎨", label: "Runware — AI Image Generation",
    desc: "Generates custom visuals for Game Up training modules, HRease job postings, safety illustrations, and fleet branded materials. Fastest AI image generation available.",
    color: "#7c3aed",
    fields: [{ key: "runware_api_key", label: "Runware API Key", placeholder: "Paste your Runware API key here", type: "password" }],
    tags: ["Game Up Visuals","Job Post Images","Safety Illustrations","Fleet Branding","Driver Gala"],
    guide: "Go to runware.ai → Sign up → Dashboard → API Keys → Create Key. Free credits included to start. Once activated, Game Up training modules get custom scenario images, HRease job postings get professional graphics, and accident reports get auto-generated scene diagrams.",
    link: "/game-up", linkLabel: "Open Game Up →",
    getLink: "https://runware.ai", getLinkLabel: "Get Runware Key →",
    powers: [
      "🎮 Game Up — custom training scenario images for all 10 modules",
      "📋 HRease — auto-generated job posting graphics for Facebook/LinkedIn",
      "🚨 Accident Reports — AI scene diagrams attached to insurance reports",
      "🏢 Fleet Branding — custom safety posters and training materials",
      "🎉 Driver Gala — route illustrations and weather scene visuals",
    ],
    cost: "Pay per image — free credits to start, $0.001-0.01 per image after",
  },

  // ── Load Board APIs ──────────────────────────────────────────────────────
  {
    id: "loadboard_123", emoji: "📦", label: "123Loadboard — Owner-Operator Loads",
    desc: "Most popular load board for owner-operators and small fleets. Free tier available — drivers access loads at zero extra cost. Massive spot market coverage across all 50 states.",
    color: "#e65c00",
    fields: [
      { key: "lb123_api_key", label: "123Loadboard API Key", placeholder: "Paste your 123Loadboard API key", type: "password" },
      { key: "lb123_username", label: "Account Username", placeholder: "Your 123Loadboard username", type: "text" },
    ],
    tags: ["Owner-Operators","Free Tier","Spot Market","All 50 States","Small Fleets"],
    guide: "Go to 123loadboard.com → Log in → Account Settings → API Access → Generate API Key. Free tier included with any subscription.",
    getLink: "https://www.123loadboard.com/api", getLinkLabel: "Get 123Loadboard API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Included with 123Loadboard subscription",
  },
  {
    id: "loadboard_convoy", emoji: "🚚", label: "Convoy — Digital Freight Network",
    desc: "AI-powered digital freight network. Instant booking with no negotiation — strong on dry van and reefer. Guaranteed rates, fast payment, and high-quality shippers.",
    color: "#00a651",
    fields: [
      { key: "convoy_api_key", label: "Convoy API Key", placeholder: "Paste your Convoy API key", type: "password" },
      { key: "convoy_carrier_id", label: "Carrier ID", placeholder: "Your Convoy Carrier ID", type: "text" },
    ],
    tags: ["Instant Booking","Guaranteed Rates","Dry Van","Reefer","No Negotiation","Fast Pay"],
    guide: "Go to convoy.com/carriers → Sign in → Settings → Integrations → API Access. Apply as a carrier partner if not already registered.",
    getLink: "https://convoy.com/carriers", getLinkLabel: "Get Convoy API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with Convoy carrier account",
  },
  {
    id: "loadboard_uber", emoji: "🔵", label: "Uber Freight — Instant Rate Booking",
    desc: "Massive shipper network with instant rate quotes. No negotiation, no back-and-forth — tap book, confirm, and go. Perfect for van, flatbed, and regional fleets.",
    color: "#000000",
    fields: [
      { key: "uber_freight_key", label: "Uber Freight API Key", placeholder: "Paste your Uber Freight API key", type: "password" },
      { key: "uber_freight_id", label: "Carrier Account ID", placeholder: "Your Uber Freight Carrier ID", type: "text" },
    ],
    tags: ["Instant Rates","No Negotiation","Van Loads","Flatbed","Regional","Large Shippers"],
    guide: "Go to freight.uber.com → Carrier sign up → Settings → API Integration. Approval typically takes 2–3 business days.",
    getLink: "https://freight.uber.com", getLinkLabel: "Get Uber Freight API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with Uber Freight carrier account",
  },
  {
    id: "loadboard_loadsmart", emoji: "🧠", label: "Loadsmart — AI Instant Booking",
    desc: "AI-powered instant booking platform. Strong on predictable lanes with consistent volume. Instant rates, digital POD, and fast payment — perfect for fleets building consistent lane networks.",
    color: "#7c3aed",
    fields: [
      { key: "loadsmart_api_key", label: "Loadsmart API Key", placeholder: "Paste your Loadsmart API key", type: "password" },
    ],
    tags: ["AI Booking","Predictable Lanes","Instant Rates","Digital POD","Fast Payment"],
    guide: "Go to loadsmart.com/carriers → Sign up as carrier → Account Settings → API Access → Generate Key.",
    getLink: "https://loadsmart.com/carriers", getLinkLabel: "Get Loadsmart API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with Loadsmart carrier account",
  },
  {
    id: "loadboard_coyote", emoji: "🐺", label: "Coyote Logistics — UPS Network",
    desc: "UPS-owned brokerage with massive consistent freight. Strong shipper relationships, reliable loads on major corridors, and competitive rates. Excellent for fleets wanting steady volume.",
    color: "#ff6900",
    fields: [
      { key: "coyote_api_key", label: "Coyote API Key", placeholder: "Paste your Coyote Logistics API key", type: "password" },
      { key: "coyote_carrier_id", label: "Carrier ID", placeholder: "Your Coyote Carrier ID", type: "text" },
    ],
    tags: ["UPS Network","Consistent Freight","Major Corridors","Reliable Rates","High Volume"],
    guide: "Go to coyote.com/carriers → Register as carrier → Partner Portal → API Credentials. Note: Coyote may require a brief carrier vetting call.",
    getLink: "https://www.coyote.com/carriers", getLinkLabel: "Get Coyote API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with Coyote carrier account",
  },
  {
    id: "loadboard_chrobinson", emoji: "🌐", label: "CH Robinson / Navisphere — Enterprise",
    desc: "Largest 3PL in the world. Enterprise fleets use this exclusively. Consistent high-volume freight, premium shippers, and a technology platform built for large operations.",
    color: "#003087",
    fields: [
      { key: "chr_api_key", label: "CH Robinson API Key", placeholder: "Paste your Navisphere API key", type: "password" },
      { key: "chr_account_id", label: "Account ID", placeholder: "Your CH Robinson Account ID", type: "text" },
    ],
    tags: ["World's Largest 3PL","Enterprise","Premium Shippers","High Volume","Navisphere"],
    guide: "Go to chrobinson.com/technology → Navisphere Carrier → Request API Access. Enterprise vetting required — best for fleets 10+ trucks.",
    getLink: "https://www.chrobinson.com/en-us/carriers/", getLinkLabel: "Get CH Robinson API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with CH Robinson carrier account",
  },
  {
    id: "loadboard_next", emoji: "🚢", label: "Next Trucking — Port & Drayage",
    desc: "Specialized in drayage and port loads. If your fleets operate near major ports (LA, Long Beach, NY, Savannah, Houston) this is the highest-paying load source available.",
    color: "#0891b2",
    fields: [
      { key: "next_api_key", label: "Next Trucking API Key", placeholder: "Paste your Next Trucking API key", type: "password" },
    ],
    tags: ["Port Loads","Drayage","High Pay","LA/LB Port","Savannah","Houston"],
    guide: "Go to next-trucking.com → Carrier sign up → API Integration under account settings. Best for fleets near major US ports.",
    getLink: "https://www.next-trucking.com/carriers", getLinkLabel: "Get Next Trucking API →",
    link: "/loads", linkLabel: "Open Load Board →",
    cost: "Free with Next Trucking carrier account",
  },

  // ── IONOS Developer ──────────────────────────────────────────────────────
  {
    id: "ionos", emoji: "🔷", label: "IONOS Developer API — Domain & Infrastructure",
    desc: "Manages morrishive.com domains, DNS records, subdomains, and SSL certificates directly from TruckWithEase. Auto-provisions white-label fleet portals at checkout and monitors server health inside your App Maintenance Agent.",
    color: "#003d8f",
    fields: [
      { key: "ionos_api_key", label: "IONOS API Key", placeholder: "Paste your IONOS Developer API key here", type: "password" },
    ],
    tags: ["Domain Management","White-Label Portals","DNS","SSL","Server Monitoring","Infrastructure"],
    guide: "Your IONOS API key comes from your IONOS Developer account dashboard. Go to developer.ionos.com → Log in → API Keys → Copy your key. Once activated, TruckWithEase can auto-provision subdomains like smithtrucking.morrishive.com for large fleets at checkout, manage DNS records, and pull live server health into your App Maintenance Agent and THE GOAT's monitoring dashboard.",
    getLink: "https://developer.ionos.com", getLinkLabel: "Open IONOS Developer Portal →",
    link: "/app-maintenance", linkLabel: "Open App Maintenance →",
    powers: [
      "🌐 White-Label Fleet Portals — auto-provision smithtrucking.morrishive.com at checkout",
      "🔒 SSL Certificate Management — every fleet portal secured automatically",
      "📡 DNS Record Control — manage all morrishive.com subdomains from inside TruckWithEase",
      "🖥️ Server Health Monitoring — live uptime and performance into App Maintenance Agent",
      "👑 THE GOAT Dashboard — infrastructure status feeds THE GOAT's monitoring layer",
      "⚙️ Auto-Provisioning — new fleet portals go live in seconds after checkout",
    ],
    cost: "Included with your IONOS hosting account — no extra charge for API access",
  },
];

function nav(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function TwilioSetupPage() {
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Load all saved keys from permanent storage on mount
  useEffect(() => {
    const controller = new AbortController();
    async function loadKeys() {
      try {
        const result = await pb.collection('platform_settings').getList(1, 200, {
          sort: 'key',
          signal: controller.signal,
        });
        const loaded = {};
        result.items.forEach(item => {
          if (item.value) loaded[item.key] = item.value;
        });
        setValues(loaded);
      } catch (e) {
        if (!e?.isAbort) console.error('Failed to load keys', e);
      } finally {
        setLoading(false);
      }
    }
    loadKeys();
    return () => controller.abort();
  }, []);

  function handleChange(key, val) {
    setValues(v => ({ ...v, [key]: val }));
  }

  async function activate(api) {
    const allFilled = api.fields.every(f => values[f.key]?.trim());
    if (!allFilled) return;
    setSavingId(api.id);
    try {
      // Save each field key/value to permanent storage
      for (const f of api.fields) {
        const val = values[f.key]?.trim();
        if (!val) continue;
        // Check if record exists
        try {
          const existing = await pb.collection('platform_settings').getFirstListItem(`key="${f.key}"`);
          await pb.collection('platform_settings').update(existing.id, { value: val, label: f.label, active: true });
        } catch (notFound) {
          await pb.collection('platform_settings').create({ key: f.key, value: val, label: f.label, active: true });
        }
      }
      // Also persist to localStorage for immediate SDK use
      for (const f of api.fields) {
        const val = values[f.key]?.trim();
        if (!val) continue;
        localStorage.setItem(`twe_${f.key}`, val);
        sessionStorage.setItem(`twe_${f.key}`, val);
        // Special keys for AI services
        if (f.key === 'gemini_api_key') { localStorage.setItem('twe_gemini_key', val); sessionStorage.setItem('twe_gemini_key', val); }
        if (f.key === 'openai_api_key') { localStorage.setItem('twe_openai_key', val); sessionStorage.setItem('twe_openai_key', val); }
      }
      setSaved(s => ({ ...s, [api.id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [api.id]: false })), 4000);
    } catch (e) {
      console.error('Failed to save key', e);
    } finally {
      setSavingId(null);
    }
  }

  function isActivated(api) {
    return api.fields.every(f => values[f.key]?.length > 0);
  }

  const activeCount = APIS.filter(a => isActivated(a)).length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 20px", fontFamily: "'DM Sans','Barlow',Arial,sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>⚙️</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.text, marginBottom: 8 }}>Platform API Keys</div>
          <div style={{ fontSize: 15, color: C.muted, maxWidth: 480, margin: "0 auto 8px" }}>
            All your connected services in one secure place. Keys save permanently — they'll be here every time you return.
          </div>
          {loading ? (
            <div style={{ color: C.muted, fontSize: 13, marginTop: 12 }}>Loading your saved keys…</div>
          ) : (
            <div style={{ color: C.green, fontSize: 13, fontWeight: 700, marginTop: 12 }}>
              ✓ {activeCount} of {APIS.length} services active — keys saved permanently
            </div>
          )}

          {/* Quick Jump Menu - Sticky */}
          <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#080c14", borderBottom: `1px solid #1a2540`, padding: "12px 16px" }}>
            {/* Search bar */}
            <input
              placeholder="🔍 Search any API (IBM, AWS, OpenAI, Geotab…)"
              onChange={e => {
                const q = e.target.value.toLowerCase();
                APIS.forEach(api => {
                  const el = document.getElementById(`api-${api.id}`);
                  if (el) el.style.display = !q || api.label.toLowerCase().includes(q) || api.id.includes(q) ? 'block' : 'none';
                });
              }}
              style={{ width: "100%", background: "#0d1320", border: "2px solid #D4AF37", borderRadius: 12, padding: "10px 16px", color: "#fff", fontSize: 14, fontWeight: 600, outline: "none", marginBottom: 10, boxSizing: "border-box" }}
            />
            {/* Highlighted shortcuts */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { id: "ibm", emoji: "🔵", label: "IBM Watson", color: "#0f62fe" },
                { id: "aws", emoji: "🟠", label: "AWS", color: "#FF9900" },
                { id: "openai", emoji: "🧠", label: "OpenAI", color: "#00E676" },
                { id: "gemini", emoji: "✨", label: "Gemini", color: "#4285F4" },
                { id: "twilio", emoji: "📱", label: "Fleet Voice", color: "#F22F46" },
                { id: "geotab", emoji: "📡", label: "Geotab", color: "#00BCD4" },
                { id: "samsara", emoji: "🚛", label: "Samsara", color: "#FF6B35" },
                { id: "azure", emoji: "☁️", label: "Azure", color: "#0078D4" },
                { id: "fmcsa", emoji: "🏛️", label: "FMCSA", color: "#4CAF50" },
                { id: "dat", emoji: "📦", label: "DAT", color: "#9C27B0" },
              ].map(s => (
                <button key={s.id} onClick={() => { const el = document.getElementById(`api-${s.id}`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                  style={{ background: `${s.color}30`, border: `2px solid ${s.color}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {s.emoji} {s.label}
                </button>
              ))}
              <button onClick={() => { const el = document.getElementById(`api-aws`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#FF990030", border: "3px solid #FF9900", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#FF9900", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #FF990060" }}>
                🟠 AWS ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-ibm`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#0f62fe30", border: "3px solid #0f62fe", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#7eb3ff", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #0f62fe60" }}>
                🔵 IBM ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-idrive`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#10b98130", border: "3px solid #10b981", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#6ee7b7", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #10b98160" }}>
                📷 iDrive E2 ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-devsecops`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#7C3AED30", border: "3px solid #7C3AED", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a78bfa", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #7C3AED60" }}>
                🛡️ DevSecOps ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-runware`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#7c3aed30", border: "3px solid #7c3aed", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#c4b5fd", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #7c3aed60" }}>
                🎨 Runware ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-kubernetes`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#326CE530", border: "3px solid #326CE5", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#93c5fd", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #326CE560" }}>
                ⚙️ Kubernetes ← TAP HERE
              </button>
              <button onClick={() => { const el = document.getElementById(`api-ionos`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                style={{ background: "#003d8f30", border: "3px solid #003d8f", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#60a5fa", fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 12px #003d8f60" }}>
                🔷 IONOS ← TAP HERE
              </button>
              {/* Load Board shortcuts */}
              {[
                { id: "loadboard_123", emoji: "📦", label: "123Loadboard", color: "#e65c00" },
                { id: "loadboard_convoy", emoji: "🚚", label: "Convoy", color: "#00a651" },
                { id: "loadboard_uber", emoji: "🔵", label: "Uber Freight", color: "#555" },
                { id: "loadboard_loadsmart", emoji: "🧠", label: "Loadsmart", color: "#7c3aed" },
                { id: "loadboard_coyote", emoji: "🐺", label: "Coyote", color: "#ff6900" },
                { id: "loadboard_chrobinson", emoji: "🌐", label: "CH Robinson", color: "#003087" },
                { id: "loadboard_next", emoji: "🚢", label: "Next Trucking", color: "#0891b2" },
              ].map(s => (
                <button key={s.id}
                  onClick={() => { const el = document.getElementById(`api-${s.id}`); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}
                  style={{ background: `${s.color}25`, border: `2px solid ${s.color}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#fff", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            {APIS.map(api => {
              const active = isActivated(api);
              return (
                <div key={api.id} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: active ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? C.green : C.border}`,
                  borderRadius: 20, padding: "4px 11px", fontSize: 12,
                  color: active ? C.green : C.muted, fontWeight: 700,
                }}>
                  <span>{api.emoji}</span>
                  <span>{active ? "✓" : "○"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* API blocks */}
        {APIS.map(api => (
          <div key={api.id} id={`api-${api.id}`} style={{
            background: C.card,
            border: `1px solid ${saved[api.id] || isActivated(api) ? api.color + '60' : C.border}`,
            borderRadius: 18, padding: 28, marginBottom: 20, transition: "border-color 0.3s",
            scrollMarginTop: 20,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ fontSize: 28 }}>{api.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: api.color }}>{api.label}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{api.desc}</div>
              </div>
              {isActivated(api) && (
                <div style={{ background: "rgba(0,230,118,0.12)", border: `1px solid ${C.green}`, borderRadius: 8, padding: "4px 14px", fontSize: 12, color: C.green, fontWeight: 700 }}>
                  ✓ Active
                </div>
              )}
            </div>

            {api.fields.map(f => (
              <div key={f.key}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 700, letterSpacing: "0.04em" }}>{f.label}</div>
                <input
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={values[f.key] || ""}
                  onChange={e => handleChange(f.key, e.target.value)}
                />
              </div>
            ))}

            <button
              style={{ padding: "12px 28px", borderRadius: 10, background: savingId === api.id ? C.muted : api.color, border: "none", color: "#000", fontWeight: 900, fontSize: 14, cursor: savingId === api.id ? "not-allowed" : "pointer", transition: "background 0.2s" }}
              onClick={() => activate(api)}
              disabled={savingId === api.id}
            >
              {savingId === api.id ? "Saving…" : saved[api.id] ? "✓ Saved!" : `Activate ${api.label.split("—")[0].trim()}`}
            </button>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
              {api.tags.map(t => (
                <span key={t} style={{ background: `${api.color}12`, border: `1px solid ${api.color}30`, borderRadius: 6, padding: "3px 10px", fontSize: 11, color: api.color }}>{t}</span>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: 12, background: `${api.color}08`, border: `1px solid ${api.color}20`, borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>📍 {api.guide}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => nav(api.link)} style={{ padding: "7px 16px", background: `${api.color}15`, border: `1px solid ${api.color}35`, borderRadius: 8, color: api.color, fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{api.linkLabel}</button>
                {api.getLink && (
                  <a href={api.getLink} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 16px", background: api.color, border: "none", borderRadius: 8, color: "#000", fontWeight: 900, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>{api.getLinkLabel}</a>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Bottom nav */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 16, paddingBottom: 40 }}>
          {[
            { label: "Command Center", path: "/command" },
            { label: "Fleet Voice", path: "/fleet-voice" },
            { label: "Load Board", path: "/loads" },
            { label: "Dispatch", path: "/dispatch" },
            { label: "Game Up", path: "/game-up" },
            { label: "Ghost Nerve", path: "/ghost-nerve" },
          ].map(l => (
            <button key={l.path} onClick={() => nav(l.path)} style={{ padding: "9px 20px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{l.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
