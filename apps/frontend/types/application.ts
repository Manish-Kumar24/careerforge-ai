// filepath: types/application.ts

export type ApplicationStatus =
  | "applied"
  | "interview"
  | "oa"
  | "offer"
  | "rejected";

export type TimelineEntry = {
  _id?: string;
  note: string;
  type: "manual" | "status_change" | "priority_toggle" | "created";
  createdAt: string;
};

export interface Application {
  _id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  isPriority?: boolean;
  timeline: TimelineEntry[];
}