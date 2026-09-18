// NightShield Mock Data Store (HarvestHub - Problem ID SC-03)
// All simulated transport, risk, journey, contact, and authority data in one file.

export const cityData = {
  cityName: "Neo-Veridia Central Metro",
  tagline: "Late-night public transport safety companion",
  activeCommuters: 1420,
  monitoredRoutesCount: 5,
  stops: [
    { id: "stop_01", name: "North Tech Hub", x: 120, y: 80, crowd: "Medium", lighting: "Good" },
    { id: "stop_02", name: "Cyberia Crossing", x: 220, y: 130, crowd: "High", lighting: "Moderate" },
    { id: "stop_03", name: "St. Jude Square", x: 180, y: 220, crowd: "Medium", lighting: "Good" },
    { id: "stop_04", name: "Central Interchange", x: 320, y: 240, crowd: "High", lighting: "Excellent" },
    { id: "stop_05", name: "Grand Terminal", x: 420, y: 230, crowd: "High", lighting: "Excellent" },
    { id: "stop_06", name: "Riverside Boulevard", x: 240, y: 340, crowd: "Low", lighting: "Dim" },
    { id: "stop_07", name: "University Quarter", x: 460, y: 140, crowd: "Medium", lighting: "Good" },
    { id: "stop_08", name: "Westside Market", x: 110, y: 290, crowd: "Low", lighting: "Moderate" },
    { id: "stop_09", name: "Southgate Junction", x: 380, y: 390, crowd: "Medium", lighting: "Good" },
    { id: "stop_10", name: "East Docks Station", x: 550, y: 240, crowd: "Low", lighting: "Dim" },
    { id: "stop_11", name: "Harbor View Point", x: 580, y: 350, crowd: "Low", lighting: "Moderate" },
    { id: "stop_12", name: "Silicon Gateway", x: 490, y: 430, crowd: "Medium", lighting: "Good" },
  ]
};

// Late-Night Delays Chart Data (9 PM to 5 AM comparing this week to last week)
export const lateNightDelaysData = [
  { hour: "9 PM", thisWeekPink: 8, thisWeekViolet: 6, lastWeek: 7 },
  { hour: "10 PM", thisWeekPink: 12, thisWeekViolet: 9, lastWeek: 10 },
  { hour: "11 PM", thisWeekPink: 18, thisWeekViolet: 13, lastWeek: 15 },
  { hour: "12 AM", thisWeekPink: 27, thisWeekViolet: 20, lastWeek: 22 },
  { hour: "1 AM", thisWeekPink: 34, thisWeekViolet: 25, lastWeek: 26 },
  { hour: "2 AM", thisWeekPink: 29, thisWeekViolet: 22, lastWeek: 23 },
  { hour: "3 AM", thisWeekPink: 19, thisWeekViolet: 15, lastWeek: 17 },
  { hour: "4 AM", thisWeekPink: 11, thisWeekViolet: 8, lastWeek: 9 },
  { hour: "5 AM", thisWeekPink: 6, thisWeekViolet: 4, lastWeek: 5 },
];

// Route Reliability Curve Data (Hourly reliability across the night)
export const routeReliabilityData = [
  { time: "21:00", reliability: 96, delays: 3 },
  { time: "22:00", reliability: 92, delays: 6 },
  { time: "23:00", reliability: 86, delays: 12 },
  { time: "00:00", reliability: 78, delays: 21 },
  { time: "01:00", reliability: 71, delays: 28 },
  { time: "02:00", reliability: 74, delays: 24 },
  { time: "03:00", reliability: 82, delays: 16 },
  { time: "04:00", reliability: 91, delays: 8 },
  { time: "05:00", reliability: 97, delays: 4 },
];

// Current Active Journey State
export const initialActiveJourney = {
  id: "jrn_9921",
  routeCode: "Line 1",
  routeName: "Metro Express Line 1",
  originStop: "North Tech Hub",
  destStop: "Southgate Junction",
  nextStop: "Central Interchange (Platform 2)",
  progressPct: 68,
  etaMinutes: 14,
  expectedArrivalTime: "12:02 AM",
  status: "On schedule",
  scheduledArrivalTimestamp: Date.now() + 14 * 60 * 1000,
  stopsList: [
    { name: "North Tech Hub", completed: true },
    { name: "Cyberia Crossing", completed: true },
    { name: "Central Interchange", completed: false, current: true },
    { name: "Grand Terminal", completed: false },
    { name: "Southgate Junction", completed: false },
  ]
};

// AI Risk Assessment
export const aiRiskAssessment = {
  score: 22,
  level: "Low", // Low, Medium, High
  levelColor: "#16A34A",
  factors: [
    "High service frequency (trains every 10 min)",
    "Monitored CCTV carriages with active transit marshals",
    "Well-lit transit platforms with emergency call-boxes"
  ]
};

// Live Waiting Time
export const waitingTimeData = {
  waitMinutes: 4,
  vehicleNumber: "Metro #104",
  trend: "3 min faster than average",
  nextArrivals: ["4 min", "14 min", "24 min"]
};

// Trusted Contacts Checklist (with tinted number badges)
export const initialContacts = [
  {
    id: "tc_1",
    badgeNumber: 1,
    badgeColor: "bg-[#E0F2FE] text-[#0284C7]", // Light blue
    name: "Maya Lin",
    relation: "Sister",
    phone: "+1 (555) 234-5678",
    notified: true,
    liveShare: true,
    status: "Viewing live trip"
  },
  {
    id: "tc_2",
    badgeNumber: 2,
    badgeColor: "bg-[#FFE9D6] text-[#EA580C]", // Peach
    name: "David Miller",
    relation: "Father",
    phone: "+1 (555) 876-5432",
    notified: true,
    liveShare: true,
    status: "SMS confirmation delivered"
  },
  {
    id: "tc_3",
    badgeNumber: 3,
    badgeColor: "bg-[#FCE7F3] text-[#DB2777]", // Pink
    name: "Priya Sen",
    relation: "Roommate",
    phone: "+1 (555) 345-6789",
    notified: false,
    liveShare: false,
    status: "Emergency-only standby"
  },
  {
    id: "tc_4",
    badgeNumber: 4,
    badgeColor: "bg-[#E2E8F0] text-[#475569]", // Slate
    name: "Campus Security Escort",
    relation: "Security Service",
    phone: "+1 (555) 019-9111",
    notified: false,
    liveShare: false,
    status: "Auto-escalation priority"
  }
];

// Suggested Routes for "Plan Journey"
export const planJourneyRoutes = [
  {
    id: "route_opt_1",
    name: "Line 1 Metro Express",
    code: "L1",
    type: "Metro Express",
    etaMins: 18,
    waitMins: 4,
    safetyScore: 94,
    stopsCount: 5,
    chip: "Fastest",
    chipType: "mint", // mint, peach
    crowd: "Moderate",
    lighting: "High",
    isRecommended: true
  },
  {
    id: "route_opt_2",
    name: "Line 4 Midnight Cruiser",
    code: "L4",
    type: "Night Bus",
    etaMins: 24,
    waitMins: 6,
    safetyScore: 98,
    stopsCount: 4,
    chip: "Safest",
    chipType: "mint",
    crowd: "Well Monitored",
    lighting: "High",
    isRecommended: false
  },
  {
    id: "route_opt_3",
    name: "Line 7 Radial Feeder",
    code: "L7",
    type: "Electric Feeder",
    etaMins: 28,
    waitMins: 9,
    safetyScore: 88,
    stopsCount: 6,
    chip: "Less crowded",
    chipType: "neutral",
    crowd: "Low",
    lighting: "Medium",
    isRecommended: false
  }
];

// Alternative Route for Delays / Disruptions
export const alternativeRouteSuggestion = {
  originalRouteName: "Line 9 Night Owl Shuttle (Delayed 16 min)",
  alternativeRouteName: "Line 1 Metro Express + Skybridge",
  timeSaved: "12 mins faster",
  safetyScore: 95,
  reason: "Avoids 16-minute platform backlog at Riverside Boulevard",
  waitMins: 3,
  etaMins: 19
};

// All 5 Live Routes
export const liveRoutesList = [
  {
    id: "route_l1",
    code: "L1",
    name: "Line 1 - Metro Express",
    color: "#3B82F6",
    status: "On time",
    statusType: "mint",
    delayMins: 0,
    frequency: "Every 10 min",
    stops: ["North Tech Hub", "Cyberia Crossing", "Central Interchange", "Grand Terminal", "Southgate Junction"],
    activeVehicles: 4,
    safetyRating: "96%"
  },
  {
    id: "route_l4",
    code: "L4",
    name: "Line 4 - Midnight Cruiser",
    color: "#8B5CF6",
    status: "On time",
    statusType: "mint",
    delayMins: 2,
    frequency: "Every 15 min",
    stops: ["Cyberia Crossing", "Central Interchange", "University Quarter", "East Docks"],
    activeVehicles: 3,
    safetyRating: "94%"
  },
  {
    id: "route_l7",
    code: "L7",
    name: "Line 7 - Radial Feeder",
    color: "#10B981",
    status: "On time",
    statusType: "mint",
    delayMins: 1,
    frequency: "Every 20 min",
    stops: ["University Quarter", "Central Interchange", "St. Jude Square", "Westside Market"],
    activeVehicles: 2,
    safetyRating: "90%"
  },
  {
    id: "route_l9",
    code: "L9",
    name: "Line 9 - Night Owl Shuttle",
    color: "#FF5FA2",
    status: "Delayed",
    statusType: "peach",
    delayMins: 14,
    frequency: "Every 25 min",
    stops: ["Riverside Boulevard", "Grand Terminal", "Southgate Junction", "Silicon Gateway"],
    activeVehicles: 2,
    safetyRating: "82%"
  },
  {
    id: "route_l12",
    code: "L12",
    name: "Line 12 - Port Link",
    color: "#06B6D4",
    status: "On time",
    statusType: "mint",
    delayMins: 0,
    frequency: "Every 30 min",
    stops: ["Central Interchange", "University Quarter", "Harbor View"],
    activeVehicles: 2,
    safetyRating: "92%"
  }
];

// Nearby Help Points for SOS Assistance
export const nearbyHelpPoints = [
  {
    id: "hp_1",
    name: "Central Metro Police Post",
    type: "Police Station",
    distance: "240 m",
    walkingTime: "3 min walk",
    phone: "112 / +1 800-112-911",
    address: "Central Interchange Gate 2, Concourse Level",
    openHours: "Open 24 hours"
  },
  {
    id: "hp_2",
    name: "City Trauma & Emergency Hospital",
    type: "Hospital",
    distance: "680 m",
    walkingTime: "8 min walk",
    phone: "+1 800-555-CARE",
    address: "42 Hospital Avenue near Grand Terminal",
    openHours: "Open 24 hours"
  },
  {
    id: "hp_3",
    name: "Apollo 24x7 Night Chemist",
    type: "24h Pharmacy",
    distance: "410 m",
    walkingTime: "5 min walk",
    phone: "+1 800-555-DRUG",
    address: "Westside Market Promenade #14",
    openHours: "Open 24 hours"
  },
  {
    id: "hp_4",
    name: "Shell 24x7 Well-Lit Fuel & SOS Kiosk",
    type: "Emergency Safe Haven",
    distance: "820 m",
    walkingTime: "10 min walk",
    phone: "+1 800-555-PUMP",
    address: "Southgate Junction Highway Plaza",
    openHours: "Open 24 hours"
  }
];

// Authority Analytics Data
export const authorityAnalytics = {
  recurringGaps: [
    { corridor: "Riverside Blvd ↔ Grand Terminal", timeWindow: "01:00 - 02:30 AM", unmetDemand: "48 riders/night", severity: "High" },
    { corridor: "East Docks ↔ Harbor Promenade", timeWindow: "02:15 - 03:30 AM", unmetDemand: "32 riders/night", severity: "Medium" },
    { corridor: "Westside Market Feeder Link", timeWindow: "00:30 - 01:45 AM", unmetDemand: "26 riders/night", severity: "Medium" },
  ],
  delayHotspots: [
    { location: "Cyberia Crossing Platform 2", avgDelay: "+18 mins", primaryCause: "Platform congestion during feeder transfer" },
    { location: "Riverside Boulevard Stop", avgDelay: "+14 mins", primaryCause: "Single-lane traffic bottleneck and low frequency" },
    { location: "Westside Interchange Gate", avgDelay: "+11 mins", primaryCause: "Late-night turnback switching delays" },
  ],
  demandByHour: [
    { hour: "9 PM", riders: 1240, capacity: 1500 },
    { hour: "10 PM", riders: 980, capacity: 1300 },
    { hour: "11 PM", riders: 820, capacity: 1100 },
    { hour: "12 AM", riders: 610, capacity: 850 },
    { hour: "1 AM", riders: 490, capacity: 550 },
    { hour: "2 AM", riders: 380, capacity: 450 },
    { hour: "3 AM", riders: 260, capacity: 400 },
    { hour: "4 AM", riders: 340, capacity: 600 },
    { hour: "5 AM", riders: 780, capacity: 1200 },
  ],
  reportedConcerns: [
    { category: "Poor lighting along platform walkway", count: 18, location: "Riverside Boulevard", status: "Work order issued" },
    { category: "Broken emergency call box", count: 12, location: "Cyberia Crossing", status: "Technician dispatched" },
    { category: "Excessive waiting time (>25 min)", count: 24, location: "Westside Market", status: "Additional shuttle scheduled" },
    { category: "Isolated, unstaffed platform", count: 9, location: "East Docks Station", status: "Mobile patrol reassigned" },
  ]
};
