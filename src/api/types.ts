export type JwtResponse = {
  token: string;
  username: string;
  email: string;
  roles: string[];
  provider: string;
};

export type ProfileResponse = {
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  profilePhotoBase64?: string;
  profilePhotoMimeType?: string;
  profilePhotoFileName?: string;
  roles: string[];
  bio?: string;
  timezone?: string;
};

export type MartialArtClass = {
  id: number;
  title: string;
  description?: string;
  modality: string;
  instructorName?: string;
  location?: string;
  days?: string[];
  startTime?: string;
  endTime?: string;
  capacity?: number;
  active?: boolean;
};

export type AvailableTeacher = {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  modalities: string[];
  availableDays: string[];
  experienceYears?: number;
  certificationLevel?: string;
  isAvailable?: boolean;
};

export type Booking = {
  id: number;
  studentId: number;
  studentName?: string;
  studentEmail?: string;
  teacherId?: number;
  teacherName?: string;
  teacherEmail?: string;
  modality?: string;
  requestedDate?: string;
  requestedTime?: string;
  durationMinutes?: number;
  status: string;
  studentNotes?: string;
  teacherNotes?: string;
  location?: string;
  createdAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
};

export type BookingRequestPayload = {
  teacherId: number;
  requestedDate: string;
  requestedTime: string;
  durationMinutes: number;
  modality: string;
  studentNotes?: string;
  location?: string;
};

export type BookingActionPayload = {
  teacherNotes?: string;
  reason?: string;
};

export type DashboardMetrics = {
  generalMetrics: {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalBookings: number;
    totalConfirmedBookings: number;
    confirmationRate: number;
    activeModalities: number;
    totalClasses: number;
  };
  ageDistribution: {
    ageRange: string;
    minAge: number;
    maxAge: number;
    count: number;
    percentage: number;
  }[];
  modalityMetrics: {
    modality: string;
    modalityName: string;
    studentCount: number;
    instructorCount: number;
    bookingCount: number;
    averageBookingsPerStudent: number;
  }[];
  bookingMetrics: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    rejectedBookings: number;
    cancelledBookings: number;
    confirmationRate: number;
    rejectionRate: number;
    bookingsByStatus: Record<string, number>;
  };
  topInstructors: {
    instructorId: number;
    instructorName: string;
    totalBookings: number;
    confirmedBookings: number;
    rejectedBookings: number;
    confirmationRate: number;
    modalities: string[];
  }[];
  growthTimeline: {
    period: string;
    periodType: string;
    userCount: number;
    bookingCount: number;
    confirmedBookingCount: number;
  }[];
  popularTimeSlots: {
    timeSlot: string;
    startTime: string;
    endTime: string;
    bookingCount: number;
    popularDays: string[];
  }[];
  bookingsByDayOfWeek: Record<string, number>;
};

export type ProfileUpdatePayload = {
  fullName?: string;
  phoneNumber?: string;
  bio?: string;
  timezone?: string;
  profilePhotoBase64?: string | null;
  profilePhotoMimeType?: string | null;
  profilePhotoFileName?: string | null;
};

export type PasswordUpdatePayload = {
  currentPassword: string;
  newPassword: string;
};

export type PasswordResetRequestPayload = {
  usernameOrEmail: string;
};

export type PasswordResetPayload = {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
};
