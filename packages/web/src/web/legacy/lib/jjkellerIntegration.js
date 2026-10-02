// JJ Keller Compliance Data Integration
// Simulates real-time access to DOT violations, DVIR requirements, vehicle safety data

export const jjKellerVehicleData = {
  getVehicleCompliance: (vin) => {
    // Simulate JJ Keller vehicle safety record lookup
    return {
      vin,
      make: "Volvo",
      model: "VNL",
      year: 2022,
      registrationStatus: "ACTIVE",
      inspectionStatus: "PASS",
      lastInspection: "2026-08-15",
      nextDue: "2027-02-15",
      violations: [
        { code: "BRAKE_001", severity: "CRITICAL", date: "2026-07-10", resolved: true },
        { code: "LIGHT_002", severity: "WARNING", date: "2026-08-01", resolved: false }
      ],
      safetyRating: 88,
      maintenanceHistory: 12,
      roadworthiness: "COMPLIANT"
    };
  },

  getDriverSafetyRecord: (driverId) => {
    // Pull driver violations, training records, safety score
    return {
      driverId,
      safetyScore: 92,
      violations: 1,
      violations_12mo: [
        { type: "SPEEDING", date: "2026-01-15", points: 3 },
        { type: "IMPROPER_LANE_CHANGE", date: "2026-03-22", points: 2 }
      ],
      trainingCompleted: ["HAZMAT", "DEFENSIVE_DRIVING", "HOS_COMPLIANCE"],
      trainingDue: ["ANNUAL_RECERTIFICATION"],
      trainingDeadline: "2026-12-31",
      insuranceRating: "PREFERRED"
    };
  },

  getDVIRRequirements: (vehicleClass) => {
    // Return required DVIR checklist based on vehicle type
    const requirements = {
      "CLASS_8_TRUCK": [
        "Brakes (air and foundation)",
        "Lighting devices",
        "Steering",
        "Tires and wheels",
        "Horn and warning devices",
        "Mirrors and reflectors",
        "Coupling devices",
        "Cargo securement",
        "Emergency equipment",
        "Hazmat placards"
      ],
      "VAN": [
        "Brakes",
        "Lighting",
        "Steering",
        "Tires and wheels",
        "Horn",
        "Mirrors",
        "Cargo doors",
        "Safety equipment"
      ]
    };
    return requirements[vehicleClass] || requirements["CLASS_8_TRUCK"];
  },

  getComplianceTimeline: (driverId) => {
    // Generate 12-month compliance calendar
    return {
      driverId,
      timeline: [
        { month: "SEP", type: "MEDICAL_EXAM_DUE", urgency: "HIGH" },
        { month: "OCT", type: "HAZMAT_RECERT", urgency: "MEDIUM" },
        { month: "DEC", type: "ANNUAL_TRAINING", urgency: "MEDIUM" },
        { month: "JAN", type: "SAFETY_AUDIT", urgency: "LOW" },
        { month: "APR", type: "VEHICLE_INSPECTION", urgency: "HIGH" }
      ]
    };
  },

  simulateTrainingScenario: (scenarioType) => {
    // Generate realistic training scenarios
    const scenarios = {
      "HAZMAT_SPILL": {
        title: "Hazmat Spill Response",
        description: "A package shifted during transport. You notice fuel leaking from a sealed container.",
        steps: [
          "Stop vehicle immediately at safe location",
          "Activate hazard lights and set warning triangles",
          "Call dispatch and HAZMAT hotline",
          "Do NOT open container",
          "Evacuate 100 feet minimum",
          "Wait for emergency response"
        ],
        timeLimit: 300,
        correctAnswers: ["STOP", "HAZARD_LIGHTS", "CALL_HAZMAT", "EVACUATE"],
        passingScore: 80
      },
      "BRAKE_FAILURE": {
        title: "Brake Failure on Grade",
        description: "You're descending a 6% grade. Brakes feel spongy. Warning light on.",
        steps: [
          "Downshift to lower gear",
          "Pump brakes gently (do NOT ride)",
          "Signal and gradually move to shoulder",
          "Avoid emergency brake (jackknife risk)",
          "Stop safely and call roadside assistance",
          "Do NOT attempt to restart"
        ],
        timeLimit: 240,
        correctAnswers: ["DOWNSHIFT", "PUMP_BRAKES", "SIGNAL", "SHOULDER", "CALL_ASSIST"],
        passingScore: 85
      },
      "HOS_VIOLATION": {
        title: "HOS Violation Prevention",
        description: "You have 1.5 hours left in your 11-hour driving window. Next delivery is 3 hours away.",
        steps: [
          "Do NOT exceed 11-hour limit",
          "Plan 10-hour rest immediately after delivery",
          "Contact dispatcher about timeline mismatch",
          "Find safe location for required break",
          "Document in ELD with notes",
          "Confirm revised delivery window"
        ],
        timeLimit: 180,
        correctAnswers: ["DO_NOT_EXCEED", "REST_10HR", "CONTACT_DISPATCH", "DOCUMENT"],
        passingScore: 90
      }
    };
    return scenarios[scenarioType] || scenarios["HAZMAT_SPILL"];
  },

  getVehicleRegistrationLayers: (vin) => {
    // Multi-layer vehicle registration data
    return {
      vin,
      layer1_registration: {
        status: "ACTIVE",
        expirationDate: "2027-12-31",
        plate: "MORR-EZ1",
        jurisdiction: "TX"
      },
      layer2_inspection: {
        lastInspection: "2026-08-01",
        nextInspection: "2027-08-01",
        inspectionType: "COMMERCIAL_VEHICLE",
        certificateNumber: "TX-CV-2026-447821"
      },
      layer3_title: {
        titleStatus: "CLEAR",
        owner: "Morrishive Logistics",
        lienHolder: "NONE",
        titleNumber: "TX2847392847"
      },
      layer4_maintenance: {
        lastServiceDate: "2026-08-10",
        nextServiceDue: "2026-11-10",
        serviceProvider: "Volvo Service Center - Dallas",
        maintenanceRecords: 47
      },
      layer5_insurance: {
        policyStatus: "ACTIVE",
        coverage: "LIABILITY + CARGO + UNINSURED_MOTORIST",
        expirationDate: "2027-03-15",
        policyNumber: "MORR-EZ-VEH-001"
      },
      layer6_compliance: {
        safetyRating: 88,
        violations_30day: 0,
        violations_12mo: 2,
        auditStatus: "COMPLIANT",
        lastAudit: "2026-06-15"
      }
    };
  },

  generateComplianceReport: (driverId, vehicleId, period = "12_MONTHS") => {
    // Comprehensive compliance report for audits
    return {
      reportDate: new Date().toISOString(),
      reportPeriod: period,
      driverId,
      vehicleId,
      summary: {
        violations: 3,
        trainingCompleted: 4,
        inspectionsPassed: 12,
        safetyScore: 87,
        complianceStatus: "FULLY_COMPLIANT"
      },
      details: {
        violations: [
          { date: "2026-01-15", type: "SPEEDING", resolved: true },
          { date: "2026-03-22", type: "IMPROPER_LANE_CHANGE", resolved: true },
          { date: "2026-07-10", type: "VEHICLE_BRAKE_ISSUE", resolved: true }
        ],
        training: [
          { type: "HAZMAT", completed: "2026-03-15", expiresDate: "2027-03-15" },
          { type: "DEFENSIVE_DRIVING", completed: "2026-02-10", expiresDate: "2027-02-10" },
          { type: "HOS_COMPLIANCE", completed: "2026-04-20", expiresDate: "2027-04-20" },
          { type: "VEHICLE_INSPECTION", completed: "2026-08-15", expiresDate: "2027-08-15" }
        ],
        inspections: [
          { date: "2026-08-15", type: "FULL_VEHICLE", result: "PASS", notes: "All systems compliant" },
          { date: "2026-07-10", type: "BRAKE_INSPECTION", result: "PASS", notes: "Foundation brakes good" },
          { date: "2026-06-05", type: "LIGHTING_CHECK", result: "PASS", notes: "All lights functional" }
        ]
      },
      nextActions: [
        { action: "ANNUAL_MEDICAL_EXAM", dueDate: "2026-09-30", priority: "HIGH" },
        { action: "HAZMAT_RECERTIFICATION", dueDate: "2027-03-15", priority: "MEDIUM" },
        { action: "VEHICLE_OIL_CHANGE", dueDate: "2026-11-10", priority: "MEDIUM" }
      ],
      auditApproval: "READY_FOR_DOT_AUDIT"
    };
  }
};

export const trainingSimulationEngine = {
  startTraining: (driverId, scenarioType) => {
    const scenario = jjKellerVehicleData.simulateTrainingScenario(scenarioType);
    return {
      trainingSessionId: `TRAIN-${Date.now()}`,
      driverId,
      scenario,
      startTime: new Date(),
      status: "IN_PROGRESS",
      responses: [],
      score: 0
    };
  },

  submitResponse: (sessionId, response) => {
    // Score training response
    return {
      sessionId,
      response,
      isCorrect: Math.random() > 0.2, // Simulate 80% correct rate
      feedback: "Good choice. This is the correct procedure.",
      score: Math.floor(Math.random() * 100)
    };
  },

  completeTraining: (sessionId, finalScore) => {
    return {
      sessionId,
      completed: true,
      finalScore,
      passed: finalScore >= 80,
      certificateId: `CERT-${Date.now()}`,
      certificateExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      feedback: finalScore >= 80 
        ? "Excellent! You've demonstrated full competency." 
        : "Please review and retry to achieve passing score."
    };
  }
};
