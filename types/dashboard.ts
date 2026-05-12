export type DashboardCheckin = {
  checkedInAt: string;
  memberName: string;
  membershipStatus: "active" | "frozen" | "expired" | "pending";
};

export type DashboardExpiringMember = {
  name: string;
  planLabel: string;
  daysUntilExpiry: number;
};

export type DashboardData = {
  activeMembers: number;
  activeMembersDelta: number;
  activeToday: number;
  activeTodayDelta: number;
  expiringCount: number;
  expiringDelta: number;
  revenue: number;
  revenueDelta: number;
  recentCheckins: DashboardCheckin[];
  expiringMembers: DashboardExpiringMember[];
  hourlyCheckins: number[];
  peakHour: number;
  heatmapData: number[];
  currentHour: number;
};
