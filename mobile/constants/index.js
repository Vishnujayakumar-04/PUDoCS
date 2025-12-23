/**
 * Application Constants
 * Centralized constants for magic numbers, strings, and configuration values
 */

// Firebase Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    STUDENTS: 'students',
    TIMETABLES: 'timetables',
    EXAMS: 'exams',
    CLASSROOMS: 'classrooms',
    NOTICES: 'notices',
    EVENTS: 'events',
};

// User Roles
export const ROLES = {
    STUDENT: 'Student',
    STAFF: 'Staff',
    OFFICE: 'Office',
};

// Notice Categories
export const NOTICE_CATEGORIES = {
    ACADEMIC: 'Academic',
    EXAM: 'Exam',
    EVENT: 'Event',
    FEES: 'Fees',
};

// Days of Week
export const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

// Calendar Configuration
export const CALENDAR = {
    TOTAL_PAGES: 30,
    DEFAULT_ASPECT_RATIO: 1.4,
    PDF_FILENAME: 'Academic-Calendar-2025-26-for-all-UG-PG-Programs-affiliated-colleges-22082025.pdf',
};

// Animation Configuration
export const ANIMATION = {
    SPRING: {
        DAMPING: 15,
        STIFFNESS: 150,
        MASS: 0.5,
    },
    TIMING: {
        DEFAULT_DURATION: 600,
        SHORT_DURATION: 200,
        MEDIUM_DURATION: 500,
    },
    SCALE: {
        MIN: 1,
        MAX: 4,
    },
};

// FlatList Configuration
export const LIST_CONFIG = {
    INITIAL_NUM_TO_RENDER: 3,
    MAX_TO_RENDER_PER_BATCH: 5,
    WINDOW_SIZE: 5,
};

// Default Limits
export const LIMITS = {
    NOTICES_DEFAULT: 20,
    NOTICES_DASHBOARD: 3,
    EVENTS_DASHBOARD: 5,
};

// Grade Points Mapping
export const GRADE_POINTS = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0,
    'Ab': 0,
};

// Grade Display Strings
export const GRADE_DISPLAY = {
    POINTS: 'O = 10 | A+ = 9 | A = 8',
    POINTS_2: 'B+ = 7 | B = 6 | C = 5',
    POINTS_3: 'P = 4 | F = 0 | Ab = 0',
};

// Spacing Constants (8pt spacing system)
export const SPACING = {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 20,
    XL: 24,
    XXL: 32,
};

// Border Radius
export const BORDER_RADIUS = {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 24,
    PILL: 32,
    CIRCLE: 9999,
};

// Icon Sizes
export const ICON_SIZES = {
    XS: 16,
    SM: 20,
    MD: 24,
    LG: 32,
    XL: 48,
    XXL: 64,
};

// Font Sizes
export const FONT_SIZES = {
    XS: 11,
    SM: 12,
    MD: 14,
    LG: 16,
    XL: 18,
    XXL: 24,
    TITLE: 24,
};

// Tab Bar Configuration
export const TAB_BAR = {
    HEIGHT: 72,
    INDICATOR_SIZE: 56,
    INDICATOR_DOT_SIZE: 4,
    ICON_CONTAINER_SIZE: 40,
    HORIZONTAL_PADDING: 16,
    VERTICAL_PADDING: 8,
    TAB_BUTTON_HEIGHT: 56,
};

// Image Configuration
export const IMAGE = {
    DEFAULT_ASPECT_RATIO: 1.4,
    CALENDAR_ASPECT_RATIO: 1.4,
};

// Status Values
export const STATUS = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

// Fee Types
export const FEE_TYPES = {
    SEMESTER: 'semester',
    EXAM: 'exam',
    HOSTEL: 'hostel',
};

// Exam Types
export const EXAM_TYPES = {
    MIDTERM: 'Midterm',
    ENDTERM: 'Endterm',
    INTERNAL: 'Internal',
    ASSIGNMENT: 'Assignment',
};

// Subject Types
export const SUBJECT_TYPES = {
    LECTURE: 'Lecture',
    LAB: 'Lab',
    SOFTCORE: 'Softcore',
    ELECTIVE: 'Elective',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
    PRESENT: 'Present',
    ABSENT: 'Absent',
    LATE: 'Late',
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'DD MMM YYYY',
    TIME: 'hh:mm A',
    DATETIME: 'DD MMM YYYY, hh:mm A',
    ISO: 'YYYY-MM-DD',
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    GENERIC: 'Something went wrong. Please try again.',
    AUTH: 'Authentication failed. Please check your credentials.',
    NOT_FOUND: 'Resource not found.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    SAVED: 'Saved successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    UPLOADED: 'Uploaded successfully',
};

// Storage Keys
export const STORAGE_KEYS = {
    USER_SESSION: 'userSession',
    USER_PREFERENCES: 'userPreferences',
};

// Screen Names (for navigation)
export const SCREENS = {
    // Auth
    WELCOME: 'Welcome',
    ROLE_SELECTION: 'RoleSelection',
    LOGIN: 'Login',
    
    // Student
    STUDENT_DASHBOARD: 'Dashboard',
    STUDENT_PROFILE: 'Profile',
    STUDENT_TIMETABLE: 'Timetable',
    STUDENT_NOTICES: 'Notices',
    STUDENT_EXAMS: 'Exams',
    STUDENT_RESULTS: 'Results',
    STUDENT_EVENTS: 'Events',
    STUDENT_STAFF: 'Staff',
    STUDENT_STUDENTS: 'Students',
    STUDENT_LETTERS: 'Letters',
    STUDENT_CALENDAR: 'Calendar',
    
    // Staff
    STAFF_DASHBOARD: 'Dashboard',
    STAFF_STUDENTS: 'StudentManagement',
    STAFF_ATTENDANCE: 'Attendance',
    STAFF_TIMETABLE: 'Timetable',
    STAFF_EXAMS: 'ExamManagement',
    STAFF_SEATS: 'SeatAllocation',
    STAFF_INTERNALS: 'Internals',
    STAFF_NOTICES: 'Notices',
    
    // Office
    OFFICE_DASHBOARD: 'Dashboard',
    OFFICE_FEES: 'FeeManagement',
    OFFICE_ELIGIBILITY: 'ExamEligibility',
    OFFICE_RESULTS: 'Results',
    OFFICE_NOTICES: 'Notices',
};

// Default Values
export const DEFAULTS = {
    ACTIVE_OPACITY: 0.7,
    CARD_PADDING: 20,
    CARD_MARGIN_BOTTOM: 16,
    HEADER_PADDING_BOTTOM: 20,
    SAFE_AREA_BOTTOM: 8,
};

export default {
    COLLECTIONS,
    ROLES,
    NOTICE_CATEGORIES,
    DAYS_OF_WEEK,
    CALENDAR,
    ANIMATION,
    LIST_CONFIG,
    LIMITS,
    GRADE_POINTS,
    GRADE_DISPLAY,
    SPACING,
    BORDER_RADIUS,
    ICON_SIZES,
    FONT_SIZES,
    TAB_BAR,
    IMAGE,
    STATUS,
    FEE_TYPES,
    EXAM_TYPES,
    SUBJECT_TYPES,
    ATTENDANCE_STATUS,
    DATE_FORMATS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    STORAGE_KEYS,
    SCREENS,
    DEFAULTS,
};

