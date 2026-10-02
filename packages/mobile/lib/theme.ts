export const C = {
  navy: "#0B2A6B",
  navyDeep: "#071E4E",
  amber: "#FFB400",
  amberDark: "#E09E00",
  bg: "#F4F6FB",
  card: "#FFFFFF",
  border: "#E2E7F0",
  ink: "#0E1524",
  muted: "#5B6577",
  success: "#1FA971",
  danger: "#E0322B",
  warning: "#B27C00",
  navyTint: "#EEF2FA",
};

export const toneColor: Record<string, string> = {
  driving: C.success, on_duty: C.amberDark, sleeper: C.navy, off_duty: C.muted,
  danger: C.danger, warning: C.amberDark, success: C.success, info: C.navy,
  active: C.success, maintenance: C.amberDark, out_of_service: C.danger,
  available: C.success, booked: C.muted, needs_repair: C.danger, submitted: C.success,
};
