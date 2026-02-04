export interface FacultyDraft {
  name?: string;
  email?: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  isActive?: boolean;

  qualifications?: string[];
  specialization?: string;
  eligibleSubjects?: string[];

  maxHoursPerDay?: number;
  maxHoursPerWeek?: number;
}
