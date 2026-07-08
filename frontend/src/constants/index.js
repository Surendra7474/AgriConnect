export const ROLES = {
  ADMIN: 'ADMIN',
  FARMER: 'FARMER',
  WORKER: 'WORKER',
  EQUIPMENT_OWNER: 'EQUIPMENT_OWNER',
  BUYER: 'BUYER',
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const HIRING_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const FEEDBACK_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
};

export const FEEDBACK_TYPE = {
  BUG: 'BUG',
  SUGGESTION: 'SUGGESTION',
  GENERAL: 'GENERAL',
};

export const EQUIPMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const WORKER_APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  BUG: 'Bug Report',
  SUGGESTION: 'Suggestion',
  GENERAL: 'General Feedback',
};

export const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  ACTIVE: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
  COMPLETED: 'success',
  OPEN: 'error',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};

export const SOIL_TYPES = [
  'Clay',
  'Sandy',
  'Loamy',
  'Silty',
  'Peaty',
  'Chalky',
  'Black Cotton',
  'Red Soil',
  'Alluvial',
  'Laterite',
];

export const WATER_SOURCES = [
  'Rain-fed',
  'Canal',
  'Borewell',
  'Well',
  'River',
  'Drip Irrigation',
  'Sprinkler',
];

export const REGIONS = [
  'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Kerala',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana',
  'Uttar Pradesh', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Odisha',
  'Assam', 'Chhattisgarh', 'Jharkhand', 'Uttarakhand', 'Himachal Pradesh',
];

export const EQUIPMENT_CATEGORIES = [
  'Tractor',
  'Harvester',
  'Tiller',
  'Plough',
  'Seed Drill',
  'Sprayer',
  'Irrigation System',
  'Thresher',
  'Trailer',
  'Other',
];
