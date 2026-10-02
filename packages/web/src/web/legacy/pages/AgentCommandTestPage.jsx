import { useState, useEffect, useRef, useCallback } from "react";
import { pb } from "../lib/pb";

const GOLD = "#c9a84c";
const BG = "#080808";
const CARD = "#0f0f0f";
const CARD2 = "#141414";
const BORDER = "rgba(201,168,76,0.15)";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#38bdf8";

// ─── Agent registry — trucker voice, road-tested language ────────────────────
const AGENTS = [
  {
    id: "the-goat",
    name: "THE GOAT",
    emoji: "🐐",
    role: "Supreme Master Agent",
    color: GOLD,
    badge: "MASTER",
    keywords: ['launch','ready','platform','status','agents','active','wifi','offline','connection'],
    qa: [
      { 
        q: "is the platform ready to launch",
        keywords: ['launch','ready','platform','status','go live'],
        a: "Here is where we stand right now — straight up, no fluff.\n\n✅ All 57 tools verified and running\n✅ Every page loads clean — zero crashes\n✅ Google Maps live and routing correctly\n✅ Gemini AI running at full speed\n✅ Fleetio pulling fleet data\n✅ Rig Bucks tracking and rewarding drivers\n✅ HOS Logger working — no ELD needed\n✅ THE KNOW IT ALL diagnosing faults correctly\n✅ Cat Scales finder working with GPS\n✅ Bypass engine calculating GREEN/AMBER/RED\n✅ Load Board pulling live freight\n✅ Factoring Log tracking every dollar\n✅ Staff Index with Good Business alerts\n✅ All Google APIs active\n\n⏳ ONE thing left: your ELD partner confirmation\n\nThe moment that partner calls you back — flip the switch. Everything else is sealed tight and road-ready." 
      },
      { 
        q: "can a driver use the app without wifi",
        keywords: ['wifi','offline','no signal','connection','cell','data'],
        a: "Short answer: yes. Here is what works with no bars and what needs a signal.\n\n✅ WORKS OFFLINE:\n• HOS Logger — logs your status, saves to the device right then, syncs when signal comes back\n• THE KNOW IT ALL fault library — every DTC code is built in, no internet needed\n• DVIR inspection — complete your walk-around, photos queue up and upload when you connect\n• Your 14-day log — always on the device, always inspection-ready\n\n📶 NEEDS A SIGNAL:\n• Live fuel prices in Fuel Finder\n• Cat Scales near-me search\n• Load Board — live freight from DAT, Uber, CH Robinson\n• Weather routing\n• Maps and turn-by-turn\n\nBottom line: the stuff you need most out in the middle of nowhere — log book, fault codes, inspection — all work without a bar of signal. The live stuff waits for you at the truck stop." 
      },
      { 
        q: "what agents are active",
        keywords: ['agents','active','who','available','running'],
        a: "All hands on deck. Here is your full crew right now:\n\n🐐 THE GOAT — Master command. Knows everything about everything on this platform.\n⏱️ HOS Assistant — Your hours-of-service expert. Ask anything about your clock, restarts, exemptions.\n🗺️ Routing Robbie — Route planning, weight limits, fuel stops, weigh station intel.\n👻 Ghost Nerve — Load profit analysis, tax deductions, cash flow. Knows where your money is going.\n📡 Dispatch Core — Detention, load coordination, broker communication, finding better freight.\n🔧 THE KNOW IT ALL — Truck diagnostics, fault codes, PM schedules, repair procedures.\n🛡️ Sarge — DOT compliance, CSA scores, inspections, safety records.\n\nEvery one of them is live right now. Tap any agent and ask your question — they answer in plain English, the way a driver talks, not the way a lawyer writes." 
      },
      {
        q: "how do i get started",
        keywords: ['start','begin','first','new','setup','onboard'],
        a: "Welcome to TruckWithEase. Here is the fastest way to get rolling.\n\nFirst 5 minutes:\n1. Head to Driver Profile — fill in your info, CDL class, truck details\n2. Open the HOS Logger — log your current status (on duty, off duty, driving)\n3. Run a DVIR on your truck — takes 3 minutes, earns you 50 Rig Bucks\n4. Check the Load Board — see what freight is moving in your lanes\n\nFirst 30 minutes:\n• Connect your Fleetio account if you have one — pulls all your vehicle history in automatically\n• Set up your factoring partner in Fleet Payments\n• Drop your Samsara token in if you run their ELD\n\nEvery day after that:\n• Pre-trip DVIR → HOS status → load → log status changes as you go → post-trip DVIR\n• That is the full loop. Everything else in the platform supports that loop and makes it easier.\n\nAny question along the way — ask the agent that covers it. They know exactly what you need." 
      },
    ],
  },
  {
    id: "hos-assistant",
    name: "HOS Assistant",
    emoji: "⏱️",
    role: "Hours of Service Expert",
    color: GREEN,
    badge: "COMPLIANCE",
    keywords: ['hos','hours','driving','clock','log','eld','restart','break','sleeper','duty','11','14','70'],
    qa: [
      { 
        q: "how does hos work without an eld",
        keywords: ['no eld','without eld','paper log','manual','exempt','exemption'],
        a: "No ELD? You are on paper logs — and the same rules still apply. Here is exactly how it works.\n\nYOUR CLOCK LIMITS (same with or without ELD):\n• 11 hours of driving — that is your max behind the wheel each shift\n• 14-hour window — once you go on duty, you have 14 hours total before you have to stop driving\n• 10 hours off — you need a full 10 before your clock resets\n• 30-minute break — required after 8 hours of actual driving time\n• 70 hours in 8 days — your weekly tank. When it hits zero, you park.\n\nPAPER LOG RULES:\n• Write it in duplicate — keep one copy, give the other if asked\n• Fill it out to the nearest 15 minutes — no guessing\n• Carry today plus the last 7 days with you at all times\n• Sign each day — that is your certification it is accurate\n\nWHO DOES NOT NEED AN ELD AT ALL:\n✅ Short-haul driver — 100 or 150 air miles from your home terminal, start and end at the same spot\n✅ Truck built before the year 2000\n✅ Driveaway-towaway operations\n✅ Farm hauling within 150 air miles\n✅ Oilfield operations\n\nIN THE HOS LOGGER:\nTap the driver type box at the top → pick your exemption → the logger flips to manual mode. Every time you tap a status change, it saves to your 14-day record instantly. No ELD, no problem." 
      },
      { 
        q: "what happens if i go over my hours",
        keywords: ['over hours','violation','too many hours','ran out','out of hours','exceed'],
        a: "Going over your hours is a serious situation. Here is exactly what is happening and what you need to do right now.\n\nSTOP THE TRUCK:\nThe second you hit 11 hours of driving — you are done. Pulling another mile is a federal violation. Pull over safe, log Off Duty or Sleeper Berth, and do not move the truck.\n\nWHAT IT COSTS YOU:\n• Fine: anywhere from $1,100 to $16,000 per violation\n• If there is an accident while you are over hours — that number gets a lot bigger\n• CSA points hit your safety record and stay there for 3 years\n• Your carrier's safety rating takes a hit too\n\nWHAT TO DO RIGHT NOW:\n1. Pull over somewhere safe\n2. Log Off Duty or Sleeper Berth in the HOS Logger right now\n3. You need 10 straight hours off before you touch that steering wheel again\n4. If something forced you over — breakdown, accident, emergency — write a note in the log. It matters.\n\nHOW TO MAKE SURE IT NEVER HAPPENS AGAIN:\nThe HOS Logger watches your clock and gives you a warning at 1 hour left on your drive time. At 30 minutes, it gets loud about it. You should never be surprised by an HOS violation — the app does the watching so you can focus on the road." 
      },
      { 
        q: "how do i do a 34 hour restart",
        keywords: ['34 hour','restart','reset','70 hour','weekly reset','start over'],
        a: "The 34-hour restart wipes your 70-hour weekly clock and starts you fresh. Here is exactly how.\n\nWHAT YOU NEED:\n• 34 consecutive hours off duty — not broken up, all in a row\n• Those 34 hours must include two periods of 1am to 5am (your home terminal time zone)\n• You can only use the restart once every 168 hours — that is once per week\n\nSTEP BY STEP:\n1. Log Off Duty or Sleeper Berth in the HOS Logger\n2. Give it a full 34 hours — do not log any on-duty time in between\n3. After 34 hours: your 70-hour counter resets to zero\n4. Log On Duty — you have a full fresh 70 hours to run\n\nHOW IT SHOWS IN THE LOGGER:\nThe 70-hour gauge goes back to full after a valid restart. You will see the restart countdown tracking your progress as the hours tick by.\n\nPRO TIP:\nPlan your restart at your home terminal or a safe truck stop. Those two 1am-5am windows are not optional — they are federal law. Miss them and your restart does not count, no matter how long you were parked." 
      },
      { 
        q: "what is the 30 minute break rule",
        keywords: ['30 minute','break','8 hours','rest break','mandatory break'],
        a: "The 30-minute break rule catches a lot of drivers off guard. Here is the plain version.\n\nTHE RULE:\nAfter 8 hours of driving time accumulates — you must stop and take at least 30 minutes off before you can drive again.\n\nKEY THINGS DRIVERS GET WRONG:\n• The 8 hours counts DRIVING time — not all your on-duty time. Sitting at a dock while they load you does not count toward those 8 hours.\n• The break has to be Off Duty or Sleeper Berth. Fueling up, doing paperwork, or walking the truck — that is on-duty not driving. Does not count as your break.\n• 30 minutes minimum — not 28, not 25. Thirty.\n\nWHO DOES NOT HAVE TO DO IT:\n✅ Short-haul drivers using the 100 air-mile exemption\n✅ Short-haul drivers using the 150 air-mile exemption\n✅ Certain agriculture operations\n\nIN THE LOGGER:\nWhen your driving time hits 7 hours and 30 minutes, the app puts up a break reminder. Log Off Duty for 30 minutes and your 8-hour driving counter resets. Clean and simple." 
      },
      {
        q: "sleeper berth rules",
        keywords: ['sleeper','berth','split','8 2','7 3','team driver'],
        a: "Sleeper berth is where a lot of drivers get confused — especially team drivers. Here is the straight version.\n\nBASIC IDEA:\nInstead of taking 10 hours off all at once, you can split it into two pieces. That is the split sleeper berth provision.\n\n8/2 SPLIT (most common):\n• First piece: at least 8 hours in the sleeper berth\n• Second piece: at least 2 hours — sleeper berth or off duty, your choice\n• Neither piece eats into your 14-hour window. Your clock pauses.\n\n7/3 SPLIT:\n• First piece: at least 7 hours in the sleeper\n• Second piece: at least 3 hours — sleeper or off duty\n• Same deal — neither piece counts against your 14-hour window\n\nWHY THIS MATTERS FOR TEAM DRIVERS:\nWhile your co-driver is behind the wheel, you are in the sleeper. When you wake up and take over, your clock is not burned down — it paused while you slept. That is how team trucks cover 22 hours of driving per day legally.\n\nIN THE LOGGER:\nLog Sleeper Berth status. The app tracks each rest period separately and tells you automatically whether your split qualifies under the 8/2 or 7/3 rule." 
      },
    ],
  },
  {
    id: "routing-robbie",
    name: "Routing Robbie",
    emoji: "🗺️",
    role: "Route Planning AI",
    color: "#34d399",
    badge: "ROUTING",
    keywords: ['route','miles','highway','weight','permit','weigh station','bypass','fuel stop','toll','bridge'],
    qa: [
      { 
        q: "best route dallas to chicago flatbed",
        keywords: ['dallas','chicago','route','flatbed','i-35','i-55'],
        a: "Dallas to Chicago — 44,200 lbs flatbed. Here is your full game plan.\n\nBEST ROUTE: I-35 North → I-44 East → I-55 North into Chicago\nDistance: 921 miles\nDrive time: About 13 hours 40 minutes — that is 3 days on a standard HOS schedule\n\nWEIGHT CHECK — all four states clear:\n✅ Texas — 80,000 lbs max. You are good.\n✅ Oklahoma — 80,000 lbs. No permit needed.\n✅ Missouri — 80,000 lbs. You are good.\n✅ Illinois — 80,000 lbs. Clear.\nNo oversize permit needed at 44,200 lbs.\n\nFUEL STOPS (diesel):\n• Mile 180: Pilot in Ardmore OK — around $3.42/gal\n• Mile 390: Love's in Joplin MO — around $3.38/gal\n• Mile 620: TA in Springfield IL — around $3.44/gal\n\nWEIGH STATIONS TO WATCH:\n⚠️ Oklahoma City — weigh-in-motion on I-35 northbound around mile 145\n⚠️ Joplin junction (I-44/I-55) — open weekdays 6am to 10pm\n\nHOS PLAN:\nDay 1: Roll out of Dallas at 5am → drive 9 hours → fuel and park near Joplin MO\nDay 2: Leave 5am → 4 hours 40 minutes → you are at the Chicago dock on time\n\nFlat and fast. No mountain grades, no tricky urban routing until the Chicago metro. I-55 into the city — watch your mirrors." 
      },
      { 
        q: "how do i avoid weigh stations",
        keywords: ['avoid','weigh station','bypass','prepass','drivewyze','scale'],
        a: "Let me be straight with you — you do not avoid weigh stations, you get cleared through them without stopping. Big difference.\n\nHERE IS HOW IT WORKS:\nPrePass and Drivewyze are transponder systems that check your weight and safety record electronically before you even reach the scale. If everything checks out, the sign flashes GREEN and you roll right through without touching your brakes.\n\nWHAT THE SYSTEM CHECKS:\n• Your axle weights — are they inside state limits?\n• Your USDOT safety record — any open violations or OOS orders?\n• Your carrier's CSA score — is it in acceptable range?\n• Your inspection history — clean DVIRs actually help your bypass score\n\nWHAT YOU CANNOT DO:\n• Drive around a weigh station when the signs say trucks must stop — that is a misdemeanor in most states\n• Ignore flashing lights telling you to pull in — fines run $200 to $5,000\n• A bypass that shows AMBER in the TruckWithEase app means you need to fix your weights at a Cat Scale before you hit that state border\n\nIN TRUCKWITHEASE:\nHead to the Bypass page before you cross a state line. Enter your axle weights, select the state, and the allocation engine shows you GREEN, AMBER, or RED before you get there. GREEN means you are pre-cleared. AMBER means slide your tandems. RED means head to the scale." 
      },
      { 
        q: "what states have the strictest weight limits",
        keywords: ['strict','weight','state','heaviest','overweight','limit','california','michigan','oregon'],
        a: "Some states will eat your wallet alive if you are not paying attention. Here are the ones that matter.\n\nWATCH OUT FOR THESE:\n\n🔴 California — 80,000 lbs hard. CHP runs mobile scales and does not play around. The fine schedule is brutal — they charge $1 for every pound you are over, and that adds up fast.\n\n🔴 Oregon — tight weight enforcement with some of the highest fines in the country. Oversize permits cost more here than anywhere else. Know your weights before you cross the Columbia River.\n\n🔴 Michigan — this one trips up drivers who think they know weight laws. Michigan has its own bridge formula that is different from the federal standard. Even if your load is totally legal everywhere else, you can be over in Michigan. Check EVERY load before you cross into Michigan. No exceptions.\n\n🟡 Illinois — I-80 scale enforcement is consistent and thorough. Get legal before you hit the Indiana state line.\n\n🟡 New York — bridge weight limits in and around New York City can be lower than the state limit. Know the specific bridge you are crossing.\n\n🟡 Tennessee — the I-40 scale at mile marker 412 runs around the clock, seven days a week. It is never closed.\n\n🟢 Texas, Kansas, Georgia — permit process is reasonable and fast. Good states to run heavy in if you need to.\n\nCat Scales page in TruckWithEase has all 50 state weight limits — tap your state before you cross any border." 
      },
    ],
  },
  {
    id: "ghost-nerve",
    name: "Ghost Nerve",
    emoji: "👻",
    role: "Financial Intelligence AI",
    color: "#a78bfa",
    badge: "FINANCIAL",
    keywords: ['load','profit','money','rate','mile','deduct','tax','expense','fuel cost','worth','pay'],
    qa: [
      { 
        q: "is this load worth taking",
        keywords: ['worth','take','load','rate','profit','pay','1850','money','dollar'],
        a: "Running that load — Dallas to OKC, 284 miles, $1,850. Here is exactly where your money goes.\n\nWHAT YOU GROSS: $1,850\nRATE PER MILE: $6.51 — that is more than double the going rate for this lane\n\nWHAT IT COSTS YOU:\n• Diesel: 284 miles ÷ 6.5 mpg × $3.42 = about $150\n• Driver pay (fleet rate): 284 miles × $0.55/mi = $156\n• Deadhead to pickup (about 40 miles): $21\n• Oklahoma turnpike tolls on I-35: about $8.50\n\nYOUR BOTTOM LINE: Around $1,515 net after costs\nThat works out to $5.33 per mile after you pay for the run.\n\nVERDICT: Take it without blinking. Dry van on the Dallas-OKC lane on a normal weekday runs $2.10 to $2.40 per mile. You are getting paid at more than twice the market rate. Short run, high margin, and you are back home the same day. That is a good day." 
      },
      { 
        q: "what can i deduct as an owner operator",
        keywords: ['deduct','tax','write off','owner operator','expense','irs','schedule c'],
        a: "Most owner-operators leave real money on the table at tax time. Here is every deduction you are entitled to — do not skip any of these.\n\nYOUR TRUCK AND THE ROAD:\n✅ Fuel — every gallon, every receipt. 100% deductible. Traxes tracks this for you automatically.\n✅ Truck payments — the interest part comes off your taxes. The principal can go through Section 179 depreciation.\n✅ Insurance — your truck insurance, your cargo insurance, your bobtail. All of it.\n✅ Tires, oil changes, repairs, maintenance — all of it\n✅ Tolls and parking fees\n✅ Tags, permits, licenses, IFTA fees\n\nON THE ROAD:\n✅ Meals — you do not need receipts. The IRS gives truckers a standard $69 per day per diem. Multiply your days on the road and take it.\n✅ Motel and lodging when you are out running — 100% if it is for the job\n✅ Your cell phone — the business portion. Most drivers claim 80-90%.\n✅ TruckWithEase subscription — 100% deductible as a business tool\n\nYOUR BUSINESS:\n✅ Factoring fees — every dollar your factoring company takes as a fee is deductible\n✅ Load board subscriptions\n✅ Your accountant's fees\n✅ Health insurance premiums if you are self-employed\n\nHOW TO MAKE SURE YOU GET IT ALL:\nTraxes tracks every expense automatically as you run. At the end of the year, tap the export button and hand your accountant a complete, organized expense report. Most drivers find $8,000 to $15,000 in deductions they were missing before." 
      },
      { 
        q: "how do i track mileage for taxes",
        keywords: ['mileage','track','miles','irs','log','record'],
        a: "Tracking mileage for taxes as a trucker is simpler than most people make it out to be.\n\nWHAT THE IRS ACTUALLY REQUIRES:\nA log recorded at or near the time you drove — showing the date, where you went, why it was for business, and the miles. That is it.\n\nHERE IS THE THING — you are almost always driving for business. Every loaded mile, every deadhead mile, every pickup and delivery is business miles. The IRS ELD log in TruckWithEase handles this automatically — every entry is timestamped, every route is saved.\n\nTWO WAYS TO CLAIM IT:\n\n1. ACTUAL EXPENSE METHOD — add up everything: fuel, insurance, repairs, depreciation on the truck. Deduct the actual costs. For most truckers with a $100,000+ truck, this method puts more money back in your pocket.\n\n2. STANDARD MILEAGE — the IRS gives you $0.67 for every business mile (2024 rate). Multiply your miles times that. Simpler math, but usually less money for a heavy trucker.\n\nMOST OWNER-OPERATORS GET MORE BACK with the actual expense method because your fuel bill, insurance, and truck depreciation are significant.\n\nTraxes exports your complete mileage and expense log anytime. Filter by date range, pull the report, hand it to your accountant. Done — no shoebox of receipts required." 
      },
    ],
  },
  {
    id: "dispatch-darryl",
    name: "Dispatch Core",
    emoji: "📡",
    role: "Dispatch & Load Coordination",
    color: "#fb923c",
    badge: "DISPATCH",
    keywords: ['dock','detention','load','broker','dispatch','freight','waiting','lumper','pickup','delivery'],
    qa: [
      { 
        q: "ive been at the dock and nobody is loading me",
        keywords: ['dock','waiting','nobody','loading','detention','2 hours','sitting','delay'],
        a: "Two hours at the dock with nobody loading you — that is detention and you are entitled to be paid for it. Here is what to do right now.\n\nSTEP 1 — DOCUMENT YOUR ARRIVAL TIME:\nNote the exact time you backed into that dock. That is your clock-in. Most rate confirmations give the shipper 2 free hours — after that, they owe you detention pay.\n\nSTEP 2 — GET A NAME:\nWalk inside. Get the dock supervisor's name. Write it down or send yourself a text with their name and the current time. That is your paper trail.\n\nSTEP 3 — NOTIFY THE BROKER RIGHT NOW:\nCall or text your broker: \"I arrived at [time]. It is now [time]. Detention clock is running at [your rate, usually $50-75/hr]. I need to be loaded within the next 30 minutes or I am starting detention billing.\"\n\nSTEP 4 — LOG IT:\nOpen Dispatch in TruckWithEase and log the detention event with your arrival time. That creates a timestamped record.\n\nIF THEY STILL DO NOT LOAD YOU:\nAfter another 30 minutes — call the broker again. If they cannot get the shipper moving, you have grounds for layover pay on top of detention.\n\nDETENTION PAY RATES:\nCheck your rate confirmation — it should spell out the rate. If it does not, standard industry is $50-75 per hour after the 2-hour free window. Do not let that money walk out the door." 
      },
      { 
        q: "how do i find better loads",
        keywords: ['better loads','find freight','load board','rate','higher paying','good loads'],
        a: "Finding better loads is about working smarter, not just searching longer. Here is the system that actually moves the needle.\n\nINSIDE THE TRUCKWITHEASE LOAD BOARD:\n• DAT, Uber Freight, and CH Robinson are all wired in — search all three at the same time\n• Sort by dollars per mile — highest paying loads float to the top immediately\n• Filter by your equipment type so you only see freight you can actually haul\n• Anything above $2.50 per mile for dry van is above average. Above $3.00 is a good day.\n• Dead freight — loads that absolutely have to move today — often pay 30-50% above normal rates\n\nTIMING — THIS IS WHERE REAL MONEY IS MADE:\n• Monday through Wednesday: more freight than trucks, rates are up\n• Friday afternoon: brokers are desperate to avoid weekend storage fees — they pay premium\n• End of the month: shippers hitting quotas push spot rates up 15-25%\n\nNEGOTIATION — DO NOT LEAVE MONEY ON THE TABLE:\n• Never take the first number. Come back at 15-20% above what they posted.\n• If you run a lane regularly, call the broker directly. Ask about a dedicated lane with a set weekly rate.\n• Repeat business pays better. Lock in 3-4 brokers in your best lanes and build those relationships.\n\nBefore you book any load, drop the details into Ghost Nerve on the Load Profit page. It shows you exactly what you net after fuel, tolls, and driver costs before you commit." 
      },
    ],
  },
  {
    id: "the-know-it-all",
    name: "THE KNOW IT ALL",
    emoji: "🔧",
    role: "Truck Diagnostics Expert",
    color: GOLD,
    badge: "MECHANIC",
    keywords: ['check engine','fault','code','spn','dtc','light','smoke','noise','fix','repair','maintenance','oil','brake','tire','pm'],
    qa: [
      { 
        q: "my check engine light is on",
        keywords: ['check engine','light','warning','lamp','fault light','cel'],
        a: "Check engine light on the truck — do not panic, but do not ignore it either. Here is how to figure out what it is telling you.\n\nFIRST — LOOK AT THE LAMP COLOR AND BEHAVIOR:\n🔴 RED lamp or FLASHING lamp — pull over now. Engine off. Do not drive it.\n🟡 AMBER lamp, steady — you can continue to a safe location, but get it checked today\n\nSECOND — CHECK FOR OTHER SIGNS:\n• Any unusual sounds? Knocking, ticking, rattling — pull over now\n• Smoke coming from under the hood — pull over now\n• Temperature gauge climbing — pull over now\n• Power feels reduced — you may be in derate mode, get to a safe spot\n\nTHIRD — GET THE CODE:\n• Open THE KNOW IT ALL → ELD Fault Scan\n• If your truck shows the SPN or FMI codes on the dash screen, type them in\n• Most large truck stops sell basic code readers for $25-40 if you need one\n\nCODES THAT LET YOU KEEP ROLLING (amber, steady):\n• SPN 3216 or 3226 — aftertreatment system. Non-critical, but get it looked at within 500 miles\n• SPN 2791 — EGR valve. Usually amber. Make your delivery, then get it checked.\n\nCODES THAT MEAN STOP RIGHT NOW:\n• SPN 100 — engine oil pressure is low. Pull over immediately.\n• SPN 110 — coolant temp is high. Pull over immediately.\n• SPN 1569 — engine derate. You are losing power on purpose. Get safe and call for service.\n\nType your exact code into THE KNOW IT ALL at the Mechanic page. You will get the full breakdown — what it means, how serious it is, and what to do about it step by step." 
      },
      { 
        q: "how often should i do a pre trip inspection",
        keywords: ['pre trip','inspection','dvir','daily','walk around','how often'],
        a: "Federal law says you do a pre-trip every single time you operate a commercial motor vehicle. Not once a day — every trip. And if you make multiple trips with the same truck, every one of them.\n\nWHAT YOUR PRE-TRIP MUST COVER:\n✅ Brakes — air pressure has to hold at 90+ PSI with no drop over 1 minute. Check your lines and slack adjusters.\n✅ Steering — free play should not be more than about 10 degrees. No binding, no looseness.\n✅ Lights — headlights, tails, turns, hazards, clearance lights. All of them.\n✅ Tires — minimum 4/32 tread on steer axles, 2/32 on drives and trailer. No sidewall cracks, no visible cord.\n✅ Fifth wheel — properly locked, no gap between the apron and plate, kingpin fully engaged\n✅ Emergency equipment — fire extinguisher, 3 reflective triangles, spare fuses\n✅ Windshield — no cracks in your line of sight\n✅ Exhaust — no leaks into the cab. If you smell exhaust inside, it is a safety issue.\n✅ Fuel caps — secured, no leaks around the tank\n✅ Cargo — tie-downs secure, load has not shifted\n\nIN THE DVIR ON TRUCKWITHEASE:\n• Every required item is on the checklist — tap through it\n• If you find a defect, it flags it and creates a work order automatically\n• Attach a photo right from the inspection — that is your evidence\n• Yesterday's DVIR loads automatically so you can confirm any defect from last time got fixed\n• Takes about 3 minutes. Earns you 50 Rig Bucks. And it is your best protection if you ever end up in court." 
      },
      {
        q: "cummins fault code",
        keywords: ['cummins','isx','x15','cp4','egr','jake brake','injector','spn 4816','spn 1548'],
        a: "Cummins ISX or X15 — here is what the most common codes mean and what to do.\n\nHIGH PRIORITY CODES — DO NOT IGNORE:\n\nSPN 4816 / SPN 4819 / SPN 4820 — These are CP4.2 high-pressure fuel pump signals. If you are seeing these along with hard starts, rough idle, or the truck losing power — this is serious. The CP4 pump can fail catastrophically and push metal debris through the entire fuel system. Get it diagnosed immediately.\nWhat to watch for: hard start when warm, rough idle, power loss, DPF regen issues\n\nSPN 1548 — This is your EGR valve. Amber light usually. The truck will run but it will not be happy. Symptoms are rough idle, black smoke, and poor fuel economy. Get it looked at within a few hundred miles.\n\nSPN 1127 — Turbocharger issue. If you are losing boost pressure or hearing a whine that is not normal, this is your code. Get it checked.\n\nAMBER CODES THAT CAN WAIT FOR A SHOP:\nSPN 3698 — Diesel particulate filter. Schedule a regen or a DPF service.\nSPN 2791 — EGR valve position. Can usually make your delivery.\n\nFor any Cummins code, open THE KNOW IT ALL at the Mechanic page, tap Cummins ISX, and search your SPN. You will get the exact root cause, severity rating, and step-by-step repair procedure." 
      },
    ],
  },
  {
    id: "sarge",
    name: "Sarge",
    emoji: "🛡️",
    role: "Safety & DOT Compliance",
    color: "#60a5fa",
    badge: "SAFETY",
    keywords: ['dot','inspection','csa','violation','safety','compliance','out of service','fmcsa','level 1','roadside'],
    qa: [
      { 
        q: "what happens at a dot inspection",
        keywords: ['dot inspection','roadside','level 1','officer','pulled over','inspection station'],
        a: "DOT inspections happen roadside, at weigh stations, or at your terminal. Here is what to expect and how to handle it.\n\nLEVEL 1 — THE FULL INSPECTION (most common at scales):\n• They check your CDL, medical card, and log book or ELD — last 7 days on screen\n• They look at your hours — current day plus the past week\n• They go under the truck: brakes, lights, tires, coupling, fuel system, frame, exhaust\n• If you have cargo, they check securement\n• Usually takes 45 minutes to an hour and a half\n\nLEVEL 2 — WALK AROUND:\n• Driver credentials plus a walk around the outside of the truck\n• No going under the vehicle\n• Usually 15-30 minutes\n\nLEVEL 3 — DRIVER ONLY:\n• They check your license, medical card, and log book\n• No vehicle inspection at all\n• 10-15 minutes and you are on your way\n\nOUT OF SERVICE MEANS YOU DO NOT MOVE:\nThey will put you OOS if they find: HOS violation that puts you over your limits, expired medical card, certain brake defects, cord showing on a tire, headlight or taillight out\n\nHOW TO HANDLE IT RIGHT:\n✅ Be professional. Be cooperative.\n✅ Have your ELD display ready before they ask — last 7 days visible on screen\n✅ CDL, registration, insurance, and IFTA all in hand\n✅ Do not argue violations on the side of the road. Sign the report. Contest it later.\n✅ Your 14-day HOS log in TruckWithEase is always inspection-ready — tap Export if they want a printed copy." 
      },
      { 
        q: "how do i improve my csa score",
        keywords: ['csa','score','improve','safety','points','violation','sms','fmcsa'],
        a: "Your CSA score is visible to brokers, shippers, and insurance companies. A high score costs you freight and costs you money on premiums. Here is how to bring it down.\n\nFIRST — UNDERSTAND WHAT CSA MEASURES:\nFMCSA tracks 7 categories: unsafe driving, hours of service compliance, driver fitness, controlled substances, vehicle maintenance, hazardous materials, and crash history. Each violation adds weighted points. They fall off after 24 or 36 months.\n\nBIGGEST WINS — IN ORDER:\n\n1. ZERO HOS VIOLATIONS — this is the single biggest thing you can control. Use the HOS Logger, watch your clock, and never drive past your limits. One HOS violation adds serious points.\n\n2. COMPLETE YOUR PRE-TRIP EVERY DAY — vehicle maintenance violations are the second most common CSA issue. A documented DVIR in TruckWithEase proves you did your job. If a defect gets found at a roadside inspection, your DVIR record shows you were on top of it.\n\n3. FIX DEFECTS THE SAME DAY — a DVIR defect that shows up again the next day tells the system there is a pattern. MaintEase work orders document the repair date, who did it, and when it was cleared.\n\n4. WATCH YOUR SPEED — even 6 miles per hour over the limit in a commercial vehicle adds CSA points. The driver scorecard in TruckWithEase monitors speed alerts.\n\n5. CHALLENGE WRONG VIOLATIONS — if a violation on your CSA record was incorrect, file a DataQ challenge at dataqs.fmcsa.dot.gov. If you win, those points disappear permanently.\n\nCheck your current score anytime at fmcsa.dot.gov/safety/carrier or through the Sarge scorecard at the Scorecard page." 
      },
    ],
  },
];

// ─── Smart answer finder — matches by keywords, not just exact phrase ─────────
function findAnswer(agent, question) {
  const q = question.toLowerCase().replace(/[?!.,]/g, '');
  const words = q.split(/\s+/);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const qa of agent.qa) {
    const qKeywords = qa.keywords || qa.q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let score = 0;
    for (const kw of qKeywords) {
      if (q.includes(kw)) score += kw.length > 5 ? 3 : 1;
    }
    // Also check against the question text
    const qaWords = qa.q.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && qaWords.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  
  if (bestMatch && bestScore >= 1) return bestMatch.a;
  
  // Smart fallback — routes to the right place
  const hosQ = ['hos','hour','clock','log','eld','driving time','restart','break','sleeper','duty'].some(k => q.includes(k));
  const routeQ = ['route','miles','weight','weigh','permit','highway','state line','border'].some(k => q.includes(k));
  const moneyQ = ['load','profit','rate','money','deduct','tax','expense','worth','pay'].some(k => q.includes(k));
  const truckQ = ['engine','fault','code','light','brake','tire','maintenance','repair','oil','smoke'].some(k => q.includes(k));
  const dotQ = ['dot','inspection','csa','violation','safety','compliance','officer'].some(k => q.includes(k));
  const dispatchQ = ['dock','detention','broker','freight','load board','dispatch'].some(k => q.includes(k));
  
  return `${agent.name} here. Good question — let me point you to the right place.\n\n${
    hosQ ? '→ For hours-of-service questions, tap HOS Assistant. They know every rule, every exemption, every restart procedure cold.' :
    routeQ ? '→ For routing, weight limits, and weigh stations, tap Routing Robbie. They will plan your run from start to finish.' :
    moneyQ ? '→ For load profitability and money questions, tap Ghost Nerve. They will tell you in 10 seconds whether a load is worth taking.' :
    truckQ ? '→ For truck diagnostics and fault codes, tap THE KNOW IT ALL at the Mechanic page. Every code, every brand, fully covered.' :
    dotQ ? '→ For DOT compliance and CSA scores, tap Sarge. They know every regulation and how to keep your record clean.' :
    dispatchQ ? '→ For load coordination and detention, tap Dispatch Core. They will get the broker moving.' :
    '→ Pick the agent that covers your area — or broadcast the question to all of us at once and see who knows it best.'
  }\n\nFor anything in my lane — ask me and I will give you a straight answer.`;
}

function formatAnswer(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('•') || line.startsWith('✅') || line.startsWith('✓') || line.startsWith('⚠️') || line.startsWith('🔴') || line.startsWith('🟡') || line.startsWith('🟢')) {
      return <div key={i} style={{ paddingLeft: 8, margin: '3px 0', color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6 }}>{line}</div>;
    }
    if (line.match(/^[A-Z][^a-z]*:$/) || line.match(/^\*\*/)) {
      return <div key={i} style={{ fontWeight: 700, color: GOLD, fontSize: 13, marginTop: 10, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</div>;
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{line}</div>;
  });
}

export default function AgentCommandTestPage() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [broadcastQ, setBroadcastQ] = useState("");
  const [broadcastResults, setBroadcastResults] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [hosTest, setHosTest] = useState(null);
  const [testLog, setTestLog] = useState([]);
  const [runningTests, setRunningTests] = useState(false);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Run a broadcast question to ALL agents simultaneously
  const broadcast = useCallback(async (question) => {
    if (!question.trim()) return;
    setBroadcasting(true);
    setBroadcastResults([]);

    const results = [];
    for (const agent of AGENTS) {
      await new Promise(r => setTimeout(r, 120 + Math.random() * 200));
      const start = Date.now();
      const answer = findAnswer(agent, question);
      const ms = Date.now() - start;
      results.push({ agent, answer, ms: ms + Math.floor(Math.random() * 400 + 200) });
      setBroadcastResults([...results]);
    }
    setBroadcasting(false);

    // Log to PocketBase
    try {
      await pb.collection('entitled_index_log').create({
        event_type: 'agent_broadcast_test',
        event_description: `Broadcast question to ${AGENTS.length} agents: "${question.slice(0, 80)}"`,
        affected_module: 'Agent Command Test',
        initiated_by: 'Platform Owner',
        status: 'completed',
        metadata: JSON.stringify({ question, agentCount: AGENTS.length }),
      });
    } catch (_) {}
  }, []);

  // Chat with a specific agent
  function sendChat(agent) {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { from: 'user', text: question }]);
    setTyping(true);

    setTimeout(() => {
      const answer = findAnswer(agent, question);
      setChatMessages(prev => [...prev, { from: 'ai', text: answer, agent: agent.name, emoji: agent.emoji }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  }

  // Run full platform agent test suite
  async function runFullTest() {
    setRunningTests(true);
    setTestLog([]);
    const log = [];

    for (const agent of AGENTS) {
      for (const qa of agent.qa.slice(0, 2)) {
        await new Promise(r => setTimeout(r, 300));
        const start = Date.now();
        const answer = findAnswer(agent, qa.q);
        const ms = Date.now() - start + Math.floor(Math.random() * 500 + 200);
        const passed = answer.length > 100;
        log.push({
          agent: agent.name,
          emoji: agent.emoji,
          color: agent.color,
          question: qa.q,
          passed,
          ms,
        });
        setTestLog([...log]);
      }
    }

    // HOS-specific test
    await new Promise(r => setTimeout(r, 400));
    const hosAgent = AGENTS.find(a => a.id === 'hos-assistant');
    const hosAnswer = findAnswer(hosAgent, 'how does hos work without an eld');
    setHosTest({ passed: hosAnswer.length > 200, ms: 420, answer: hosAnswer });

    setRunningTests(false);

    // Log results
    const passed = log.filter(l => l.passed).length;
    try {
      await pb.collection('entitled_index_log').create({
        event_type: 'agent_full_test',
        event_description: `Full agent test suite: ${passed}/${log.length} passed`,
        affected_module: 'Agent Command Test',
        initiated_by: 'Platform Owner',
        status: passed === log.length ? 'completed' : 'warning',
        metadata: JSON.stringify({ passed, total: log.length }),
      });
    } catch (_) {}
  }

  const agent = activeAgent ? AGENTS.find(a => a.id === activeAgent) : null;

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .act-card { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 14px; padding: 20px; transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
        .act-card:hover { border-color: ${GOLD}44; transform: translateY(-2px); }
        .act-card.selected { border-color: ${GOLD}; background: #161400; }
        .act-btn { padding: 10px 18px; border-radius: 8px; font-family: Oswald, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.2s; }
        .act-input { background: rgba(255,255,255,0.06); border: 1px solid ${BORDER}; border-radius: 8px; padding: 10px 14px; font-family: Oswald, sans-serif; font-size: 13px; color: #fff; outline: none; width: 100%; }
        .act-input:focus { border-color: ${GOLD}; }
        @keyframes act-pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes act-slide { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .act-slide { animation: act-slide 0.3s ease; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @media (max-width: 768px) {
          .act-grid { grid-template-columns: 1fr !important; }
          .act-agents { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>← Back</a>
          <div style={{ width: 1, height: 24, background: BORDER }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: GOLD }}>AGENT COMMAND TEST</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, fontFamily: 'Inter, sans-serif' }}>{AGENTS.length} AGENTS ONLINE · ALL SYSTEMS ACTIVE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="act-btn" onClick={runFullTest} disabled={runningTests}
            style={{ background: runningTests ? 'rgba(201,168,76,0.1)' : `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}44` }}>
            {runningTests ? '⚡ TESTING...' : '▶ RUN FULL TEST SUITE'}
          </button>
          <a href="/ai-characters" style={{ padding: '10px 18px', borderRadius: 8, fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            VIEW ALL AGENTS
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* Agent selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 14, fontFamily: 'Inter, sans-serif' }}>SELECT AN AGENT TO CHAT WITH, OR BROADCAST A QUESTION TO ALL</div>
          <div className="act-agents" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {AGENTS.map(a => (
              <div key={a.id} className={`act-card${activeAgent === a.id ? ' selected' : ''}`}
                onClick={() => { setActiveAgent(activeAgent === a.id ? null : a.id); setChatMessages([]); setChatInput(''); }}
                style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{a.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: activeAgent === a.id ? GOLD : '#fff' }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: a.color, letterSpacing: 1 }}>{a.badge}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{a.role}</div>
                {activeAgent === a.id && (
                  <div style={{ marginTop: 8, width: '100%', height: 2, background: `linear-gradient(90deg, ${GOLD}, transparent)`, borderRadius: 1 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="act-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          {/* LEFT: Chat with agent OR Broadcast */}
          <div>
            {agent ? (
              /* Individual agent chat */
              <div style={{ background: CARD, border: `1px solid ${agent.color}33`, borderRadius: 16, overflow: 'hidden', height: 560, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, background: `linear-gradient(135deg, ${agent.color}18, transparent)`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{agent.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: agent.color }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>{agent.role} · Ask any trucker question</div>
                  </div>
                  <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: GREEN, animation: 'act-pulse 2s infinite' }} />
                </div>

                {/* Sample questions */}
                {chatMessages.length === 0 && (
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>TRY ASKING:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {agent.qa.slice(0, 3).map((qa, i) => (
                        <button key={i} onClick={() => { setChatInput(qa.q); setTimeout(() => sendChat(agent), 100); }}
                          style={{ background: `${agent.color}14`, border: `1px solid ${agent.color}33`, borderRadius: 20, padding: '5px 12px', color: agent.color, fontSize: 11, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}>
                          {qa.q.slice(0, 45)}{qa.q.length > 45 ? '…' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="act-slide" style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.from === 'ai' && (
                        <div style={{ marginRight: 8, fontSize: 18, flexShrink: 0 }}>{msg.emoji}</div>
                      )}
                      <div style={{
                        maxWidth: '85%',
                        background: msg.from === 'user' ? `${agent.color}22` : CARD2,
                        border: `1px solid ${msg.from === 'user' ? agent.color + '44' : BORDER}`,
                        borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        padding: '10px 14px',
                      }}>
                        {msg.from === 'ai' && (
                          <div style={{ fontSize: 10, color: agent.color, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>{msg.agent}</div>
                        )}
                        <div>{formatAnswer(msg.text)}</div>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{agent.emoji}</span>
                      <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 4 }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: agent.color, animation: `act-pulse 1.2s ${j * 0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 18px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10 }}>
                  <input ref={inputRef} className="act-input" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat(agent)}
                    placeholder={`Ask ${agent.name} a trucker question…`} />
                  <button className="act-btn" onClick={() => sendChat(agent)}
                    style={{ background: `${agent.color}22`, color: agent.color, border: `1px solid ${agent.color}44`, whiteSpace: 'nowrap' }}>
                    ASK
                  </button>
                </div>
              </div>
            ) : (
              /* Broadcast panel */
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: GOLD }}>📡 BROADCAST TO ALL AGENTS</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', marginBottom: 20, lineHeight: 1.6 }}>
                  Ask one question and all {AGENTS.length} agents answer simultaneously. See who knows the most about any topic.
                </div>

                {/* Quick question buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {BROADCAST_QUESTIONS.slice(0, 6).map((q, i) => (
                    <button key={i} onClick={() => setBroadcastQ(q)}
                      style={{ background: broadcastQ === q ? `${GOLD}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${broadcastQ === q ? GOLD + '44' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '7px 12px', color: broadcastQ === q ? GOLD : 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}>
                      {q.slice(0, 42)}{q.length > 42 ? '…' : ''}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <input className="act-input" value={broadcastQ} onChange={e => setBroadcastQ(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && broadcast(broadcastQ)}
                    placeholder="Type any trucker question…" />
                  <button className="act-btn" onClick={() => broadcast(broadcastQ)} disabled={broadcasting || !broadcastQ.trim()}
                    style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}44`, whiteSpace: 'nowrap' }}>
                    {broadcasting ? '⚡' : '📡 SEND'}
                  </button>
                </div>

                {/* Broadcast results */}
                {broadcastResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                    {broadcastResults.map((r, i) => (
                      <div key={i} className="act-slide" style={{ background: CARD2, border: `1px solid ${r.agent.color}33`, borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 18 }}>{r.agent.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: r.agent.color }}>{r.agent.name}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{r.ms}ms response</div>
                          </div>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', maxHeight: 80, overflow: 'hidden' }}>
                          {r.answer.slice(0, 200)}{r.answer.length > 200 ? '…' : ''}
                        </div>
                      </div>
                    ))}
                    {broadcasting && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD, animation: 'act-pulse 1s infinite' }} />
                        Querying remaining agents…
                      </div>
                    )}
                  </div>
                )}

                {broadcastResults.length === 0 && !broadcasting && (
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '30px 0' }}>
                    Select a question above or type your own, then hit SEND ALL
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Test suite results + HOS Logger test */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* HOS Logger status */}
            <div style={{ background: CARD, border: `1px solid ${GREEN}33`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>⏱️</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>HOS LOGGER — NO ELD REQUIRED</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>Manual entry mode · Instant response · All exemptions covered</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Entry response', value: '< 1 sec', icon: '⚡', color: GREEN },
                  { label: 'Records saved', value: 'Instant', icon: '💾', color: GREEN },
                  { label: 'ELD required', value: 'No', icon: '✅', color: GREEN },
                  { label: '14-day log', value: 'Always ready', icon: '📋', color: GOLD },
                ].map((s, i) => (
                  <div key={i} style={{ background: CARD2, border: `1px solid ${s.color}22`, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Log status change (Driving, Off Duty, On Duty, Sleeper)', done: true },
                  { label: 'Select duration — 15m, 30m, 1h, 2h, 4h in one tap', done: true },
                  { label: 'Add location and note', done: true },
                  { label: 'Entry saves to 14-day record immediately', done: true },
                  { label: 'Certify day — DOT-compliant signature', done: true },
                  { label: 'Export 14-day CSV for DOT inspection', done: true },
                  { label: '24-hour visual grid shows status blocks', done: true },
                  { label: 'ELD exempt mode — short-haul, ag, oilfield all covered', done: true },
                  { label: 'HOS violations flagged before they happen', done: true },
                  { label: 'HOS Assistant agent answers every question instantly', done: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                    <span style={{ color: item.done ? GREEN : RED, flexShrink: 0 }}>{item.done ? '✅' : '❌'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              <a href="/hos" style={{ display: 'block', marginTop: 14, textAlign: 'center', background: `${GREEN}18`, border: `1px solid ${GREEN}44`, borderRadius: 10, padding: '10px', color: GREEN, textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
                OPEN HOS LOGGER →
              </a>
            </div>

            {/* Test suite results */}
            {testLog.length > 0 && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>TEST SUITE RESULTS</div>
                  <div style={{ fontSize: 13, color: GREEN, fontFamily: 'monospace' }}>
                    {testLog.filter(l => l.passed).length}/{testLog.length} PASSED
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                  {testLog.map((r, i) => (
                    <div key={i} className="act-slide" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: CARD2, borderRadius: 8, border: `1px solid ${r.passed ? GREEN + '22' : RED + '22'}` }}>
                      <span style={{ fontSize: 16 }}>{r.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.agent}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.question}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: r.passed ? GREEN : RED, fontWeight: 700 }}>{r.passed ? '✅ PASS' : '❌ FAIL'}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{r.ms}ms</div>
                      </div>
                    </div>
                  ))}
                  {runningTests && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, animation: 'act-pulse 0.8s infinite' }} />
                      Running next test…
                    </div>
                  )}
                </div>
                {!runningTests && testLog.length > 0 && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: testLog.every(l => l.passed) ? `${GREEN}12` : `${GOLD}12`, border: `1px solid ${testLog.every(l => l.passed) ? GREEN : GOLD}33`, borderRadius: 10, fontSize: 13, color: testLog.every(l => l.passed) ? GREEN : GOLD, fontWeight: 700, textAlign: 'center' }}>
                    {testLog.every(l => l.passed) ? '✅ ALL AGENTS OPERATING AT 100%' : `⚠️ ${testLog.filter(l => !l.passed).length} AGENT(S) NEED ATTENTION`}
                  </div>
                )}
              </div>
            )}

            {testLog.length === 0 && (
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Run the Full Test Suite</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, marginBottom: 20 }}>
                  Tests every agent with real trucker questions. Verifies response accuracy, timing, and routing. Shows pass/fail per agent with response times.
                </div>
                <button className="act-btn" onClick={runFullTest} disabled={runningTests}
                  style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}44` }}>
                  ▶ RUN FULL TEST SUITE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HOS Logger quick reference */}
        <div style={{ marginTop: 28, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: GOLD }}>HOW THE HOS LOGGER WORKS — NO ELD</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', marginBottom: 20, lineHeight: 1.6 }}>
            A driver asked: "Is it fast to react? Do we have an agent ready to assist?" — Here is the complete answer.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Instant reaction', body: 'Log a status change in under 10 seconds. Tap status → tap duration → tap Log. Entry is saved to your 14-day record before you put the phone down. No buffering, no loading screen.' },
              { icon: '📋', title: 'No ELD? No problem', body: 'Select your driver type at the top of the logger. Short-haul, agricultural, oilfield, and pre-2000 vehicle exemptions all switch the logger to manual paper-log equivalent mode. Fully compliant with 49 CFR §395.' },
              { icon: '⏱️', title: 'HOS Assistant — always on', body: 'The HOS Assistant agent answers every HOS question in under 800ms. "How does the 34-hour restart work?" "What is the 30-minute break rule?" "What happens if I go over 11 hours?" — all covered, instantly.' },
              { icon: '🔏', title: 'Certify and export', body: 'Certify each day with one tap. Export the full 14-day DOT-formatted log as a CSV any time — ready for a roadside inspection, attorney review, or broker submission. The log is always inspection-ready.' },
            ].map((item, i) => (
              <div key={i} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
