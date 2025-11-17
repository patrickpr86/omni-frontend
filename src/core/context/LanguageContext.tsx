import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";

type Language = "pt" | "en";

type Translations = {
  // Days of week
  MONDAY: string;
  TUESDAY: string;
  WEDNESDAY: string;
  THURSDAY: string;
  FRIDAY: string;
  SATURDAY: string;
  SUNDAY: string;
  
  // Period types
  day: string;
  week: string;
  month: string;
  
  // Common terms
  welcome: string;
  dashboard: string;
  profile: string;
  login: string;
  logout: string;
  darkMode: string;
  lightMode: string;
  toggleTheme: string;
  language: string;
  portuguese: string;
  english: string;
  homeNav: string;
  studentNav: string;
  schedulingNav: string;
  teacherNav: string;
  adminNav: string;
  
  // Dashboard
  welcomeMessage: string;
  manageClasses: string;
  backendLabel: string;
  impactPanel: string;
  impactPanelDesc: string;
  confirmationRate: string;
  reservationsWaiting: string;
  activeUsers: string;
  studentsConnected: string;
  instructors: string;
  modalitiesActive: string;
  reservations: string;
  confirmed: string;
  publishedClasses: string;
  catalogUpdated: string;
  realtimeInsights: string;
  realtimeInsightsDesc: string;
  totalReservations: string;
  growthTrend: string;
  usersVsReservations: string;
  reservationsByStatus: string;
  currentDistribution: string;
  weekPeaks: string;
  reservationsByDay: string;
  studentAgeRange: string;
  participationByGroup: string;
  highlight: string;
  availableClasses: string;
  modalitiesAndSchedules: string;
  loading: string;
  loadingClasses: string;
  upcomingBookings: string;
  bookingsAssociated: string;
  loadingBookings: string;
  noBookingsYet: string;
  quickInsights: string;
  periodTrends: string;
  popularModalities: string;
  students: string;
  confirmationRates: string;
  ofReservationsConfirmed: string;
  pendingInPeriod: string;
  hotTimes: string;
  instructorPerformance: string;
  rankingByConfirmed: string;
  ofConfirmation: string;
  demandAndGrowth: string;
  dataFromBackend: string;
  timeline: string;
  newUsers: string;
  reservationsByDayOfWeek: string;
  ageRanges: string;
  noAgeRanges: string;
  noRecords: string;
  noBookingsInPeriod: string;
  newBooking: string;
  requestPrivateClass: string;
  teacher: string;
  selectTeacher: string;
  modality: string;
  selectModality: string;
  date: string;
  time: string;
  duration: string;
  minutes: string;
  location: string;
  locationPlaceholder: string;
  notes: string;
  notesPlaceholder: string;
  requestBooking: string;
  bookingCreatedSuccess: string;
  statusFilterLabel: string;
  allStatuses: string;
  timeRangeFilterLabel: string;
  upcomingScope: string;
  pastScope: string;
  allScope: string;
  exportCsv: string;
  noFilteredResults: string;
  clearFilters: string;
  refresh: string;
  daysLabel: string;
  noSchedule: string;
  noClassesAvailable: string;
  pendingRequests: string;
  manageApprovals: string;
  student: string;
  studentNotes: string;
  confirm: string;
  reject: string;
  noRequests: string;
  yourScheduleAsTeacher: string;
  confirmedClasses: string;
  noConfirmedClasses: string;
  cancelRequest: string;
  studentDashboardTitle: string;
  studentDashboardSubtitle: string;
  monthlyGoalLabel: string;
  classesLabel: string;
  ofGoalReached: string;
  progressMetricLabel: string;
  waitingApprovalLabel: string;
  totalStudyTimeLabel: string;
  hoursAbbr: string;
  goalManagementTitle: string;
  goalManagementSubtitle: string;
  yourUpcomingClasses: string;
  filterAndTrack: string;
  monthFilterLabel: string;
  allMonthsOption: string;
  teacherDashboardTitle: string;
  teacherDashboardSubtitle: string;
  teacherScheduleTitle: string;
  teacherScheduleSubtitle: string;
  dayFilterLabel: string;
  allDaysOption: string;
  bookingConfirmedMessage: string;
  bookingRejectedMessage: string;
  exportSuccessMessage: string;
  adminDashboardTitle: string;
  adminDashboardSubtitle: string;
  timelineRangeLabel: string;
  searchModalityLabel: string;
  searchPlaceholder: string;
  modalityOverviewTitle: string;
  
  // Profile
  yourProfile: string;
  updateInfo: string;
  updateFile: string;
  fullName: string;
  fullNamePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  username: string;
  email: string;
  bio: string;
  bioPlaceholder: string;
  timezone: string;
  selectTimezone: string;
  saveChanges: string;
  updatePassword: string;
  setNewPassword: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  repeatPassword: string;
  updatePasswordButton: string;
  
  // Login
  loginToOmni: string;
  accessPanel: string;
  usernameOrEmail: string;
  usernameOrEmailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  entering: string;
  enter: string;
  forgotPassword: string;
  recoverAccess: string;
  
  // Status
  PENDING: string;
  CONFIRMED: string;
  REJECTED: string;
  CANCELLED: string;
  
  // Actions
  tryAgain: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  
  // Messages
  errorLoading: string;
  successSaving: string;
  fillRequired: string;

  // Analytics charts
  users: string;
  people: string;
  bookings: string;
  highlighted: string;
  noDataYet: string;
  noBookingsForChart: string;
  notEnoughData: string;
  demographicDataNotAvailable: string;
  noBookingsInCurrentPeriod: string;
  bookingsPlural: string;

  // Profile errors and messages
  profileLoadError: string;
  profileUpdateError: string;
  passwordUpdateError: string;
  loadingProfile: string;
  saving: string;
  updating: string;
  fileSizeError: string;
  profileUpdatedSuccess: string;
  passwordUpdatedSuccess: string;
  passwordMinLength: string;
  passwordMismatch: string;
  removeFile: string;
  documentAttached: string;
  openFile: string;

  // Login errors and messages
  loginError: string;
  requiredCredentials: string;

  // Password reset
  resetPassword: string;
  resetPasswordDesc: string;
  requestLink: string;
  resetToken: string;
  resetTokenPlaceholder: string;
  sendingInstructions: string;
  sendInstructions: string;
  resetInstructionsSent: string;
  resetRequestError: string;
  resetTokenRequired: string;
  resetPasswordButton: string;
  resetting: string;
  resetPasswordSuccess: string;
  resetPasswordError: string;
  backToLogin: string;
  defineNewPassword: string;
};

const translations: Record<Language, Translations> = {
  pt: {
    // Dias da semana
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
    
    // Tipos de período
    day: "dia",
    week: "semana",
    month: "mês",
    
    // Termos comuns
    welcome: "Bem-vindo",
    dashboard: "Dashboard",
    profile: "Perfil",
    login: "Entrar",
    logout: "Sair",
    darkMode: "Modo escuro",
    lightMode: "Modo claro",
    toggleTheme: "Alternar tema",
    language: "Idioma",
    portuguese: "Português",
    english: "Inglês",
    homeNav: "Início",
    studentNav: "Painel do aluno",
    schedulingNav: "Agendamentos",
    teacherNav: "Painel do instrutor",
    adminNav: "Painel admin",
    
    // Dashboard
    welcomeMessage: "Bem-vindo",
    manageClasses: "Gerencie aulas, acompanhe reservas e visualize métricas do Omni App em uma interface minimalista.",
    backendLabel: "Backend",
    impactPanel: "Painel de impacto",
    impactPanelDesc: "Indicadores que resumem o pulso atual da plataforma.",
    confirmationRate: "Taxa de confirmação",
    reservationsWaiting: "reservas aguardando aprovação",
    activeUsers: "Usuários ativos",
    studentsConnected: "alunos conectados",
    instructors: "Instrutores",
    modalitiesActive: "modalidades ativas",
    reservations: "Reservas",
    confirmed: "confirmadas",
    publishedClasses: "Aulas publicadas",
    catalogUpdated: "Catálogo atualizado",
    realtimeInsights: "Insights em tempo real",
    realtimeInsightsDesc: "Monitore reservas, confirmações e engajamento em um painel leve e responsivo.",
    totalReservations: "Reservas totais",
    growthTrend: "Tendência de crescimento",
    usersVsReservations: "Usuários x Reservas",
    reservationsByStatus: "Reservas por status",
    currentDistribution: "Distribuição atual",
    weekPeaks: "Picos da semana",
    reservationsByDay: "Reservas por dia",
    studentAgeRange: "Faixa etária dos alunos",
    participationByGroup: "Participação por grupo",
    highlight: "em destaque",
    availableClasses: "Aulas disponíveis",
    modalitiesAndSchedules: "Modalidades e horários publicados no Omni App.",
    loading: "Carregando",
    loadingClasses: "Carregando aulas...",
    upcomingBookings: "Próximos agendamentos",
    bookingsAssociated: "Reservas associadas ao seu perfil.",
    loadingBookings: "Carregando agendamentos...",
    noBookingsYet: "Nenhum agendamento por aqui ainda.",
    quickInsights: "Insights rápidos",
    periodTrends: "Tendências do período selecionado no backend.",
    popularModalities: "Modalidades populares",
    students: "alunos",
    confirmationRates: "Taxas de confirmação",
    ofReservationsConfirmed: "de reservas confirmadas",
    pendingInPeriod: "pendentes no período.",
    hotTimes: "Horários em alta",
    instructorPerformance: "Performance dos instrutores",
    rankingByConfirmed: "Ranking baseado nas reservas confirmadas pelos professores.",
    ofConfirmation: "de confirmação",
    demandAndGrowth: "Demanda e crescimento",
    dataFromBackend: "Dados consolidados diretamente do backend do Omni.",
    timeline: "Linha do tempo",
    newUsers: "novos usuários",
    reservationsByDayOfWeek: "Reservas por dia",
    ageRanges: "Faixas etárias",
    noAgeRanges: "Sem faixas etárias registradas.",
    noRecords: "Sem registros para o período consultado.",
    noBookingsInPeriod: "Sem reservas registradas no recorte atual.",
    newBooking: "Novo agendamento",
    requestPrivateClass: "Solicite uma aula particular rapidamente.",
    teacher: "Professor",
    selectTeacher: "Selecione",
    modality: "Modalidade",
    selectModality: "Selecione",
    date: "Data",
    time: "Horário",
    duration: "Duração",
    minutes: "min",
    location: "Local",
    locationPlaceholder: "Academia, on-line...",
    notes: "Observações",
    notesPlaceholder: "Compartilhe objetivos ou preferências.",
    requestBooking: "Solicitar agendamento",
    bookingCreatedSuccess: "Agendamento criado com sucesso! Aguardando confirmação.",
    statusFilterLabel: "Status",
    allStatuses: "Todos",
    timeRangeFilterLabel: "Recorte",
    upcomingScope: "Próximos",
    pastScope: "Passados",
    allScope: "Todos",
    exportCsv: "Exportar CSV",
    noFilteredResults: "Nenhum resultado com os filtros atuais.",
    clearFilters: "Limpar",
    refresh: "Atualizar",
    daysLabel: "Dias",
    noSchedule: "Sob consulta",
    noClassesAvailable: "Nenhuma aula publicada até o momento.",
    pendingRequests: "Solicitações pendentes",
    manageApprovals: "Gerencie aprovações das aulas particulares.",
    student: "Aluno",
    studentNotes: "Notas do aluno:",
    confirm: "Confirmar",
    reject: "Rejeitar",
    noRequests: "Nenhuma solicitação aguardando análise.",
    yourScheduleAsTeacher: "Sua agenda como professor",
    confirmedClasses: "Próximas aulas confirmadas com seus alunos.",
    noConfirmedClasses: "Você não possui aulas confirmadas.",
    cancelRequest: "Cancelar pedido",
    studentDashboardTitle: "Metas e progresso",
    studentDashboardSubtitle: "Acompanhe sua evolução, defina metas e gere relatórios personalizados.",
    monthlyGoalLabel: "Meta mensal",
    classesLabel: "aulas",
    ofGoalReached: "da meta atingida",
    progressMetricLabel: "Progresso",
    waitingApprovalLabel: "Aguardam aprovação",
    totalStudyTimeLabel: "Tempo de treino",
    hoursAbbr: "h",
    goalManagementTitle: "Controle de metas",
    goalManagementSubtitle: "Ajuste sua meta mensal de aulas para manter o ritmo.",
    yourUpcomingClasses: "Próximas aulas",
    filterAndTrack: "Use os filtros para acompanhar seu plano.",
    monthFilterLabel: "Mês",
    allMonthsOption: "Todos os meses",
    teacherDashboardTitle: "Painel do instrutor",
    teacherDashboardSubtitle: "Acompanhe solicitações e organize a agenda confirmada.",
    teacherScheduleTitle: "Agenda confirmada",
    teacherScheduleSubtitle: "Visualize aulas e filtre por status ou dia.",
    dayFilterLabel: "Dia da semana",
    allDaysOption: "Todos os dias",
    bookingConfirmedMessage: "Agendamento confirmado com sucesso!",
    bookingRejectedMessage: "Solicitação rejeitada.",
    exportSuccessMessage: "Exportação pronta! Verifique seus downloads.",
    adminDashboardTitle: "Visão administradora",
    adminDashboardSubtitle: "Indicadores e relatórios consolidados do Omni.",
    timelineRangeLabel: "Período",
    searchModalityLabel: "Buscar modalidade",
    searchPlaceholder: "Digite para filtrar...",
    modalityOverviewTitle: "Resumo das modalidades",
    
    // Profile
    yourProfile: "Seu perfil",
    updateInfo: "Atualize informações compartilhadas com a equipe da academia.",
    updateFile: "Atualizar arquivo",
    fullName: "Nome completo",
    fullNamePlaceholder: "Novo nome exibido",
    phone: "Telefone",
    phonePlaceholder: "+55 11 99999-0000",
    username: "Usuário",
    email: "E-mail",
    bio: "Bio",
    bioPlaceholder: "Conte um pouco sobre sua experiência.",
    timezone: "Fuso horário",
    selectTimezone: "Selecione",
    saveChanges: "Salvar alterações",
    updatePassword: "Atualizar senha",
    setNewPassword: "Defina uma nova senha para proteger seu acesso.",
    currentPassword: "Senha atual",
    newPassword: "Nova senha",
    confirmNewPassword: "Confirmar nova senha",
    repeatPassword: "Repita a nova senha",
    updatePasswordButton: "Atualizar senha",
    
    // Login
    loginToOmni: "Entrar na Omni",
    accessPanel: "Acesse o painel para gerenciar aulas, alunos e agendamentos.",
    usernameOrEmail: "Usuário ou e-mail",
    usernameOrEmailPlaceholder: "jane.doe ou jane@exemplo.com",
    password: "Senha",
    passwordPlaceholder: "********",
    entering: "Entrando...",
    enter: "Entrar",
    forgotPassword: "Esqueceu a senha?",
    recoverAccess: "Recuperar acesso",
    
    // Status
    PENDING: "Pendente",
    CONFIRMED: "Confirmada",
    REJECTED: "Recusada",
    CANCELLED: "Cancelada",
    
    // Actions
    tryAgain: "Tentar novamente",
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Excluir",
    
    // Messages
    errorLoading: "Não foi possível carregar.",
    successSaving: "Salvo com sucesso!",
    fillRequired: "Preencha todos os campos obrigatórios.",

    // Analytics charts
    users: "Usuários",
    people: "Pessoas",
    bookings: "Reservas",
    highlighted: "em destaque",
    noDataYet: "Sem dados suficientes ainda.",
    noBookingsForChart: "Nenhuma reserva registrada para gerar este gráfico.",
    notEnoughData: "Ainda não há dados suficientes para esta visualização.",
    demographicDataNotAvailable: "Dados demográficos ainda não disponíveis.",
    noBookingsInCurrentPeriod: "Sem reservas no período",
    bookingsPlural: "reservas",

    // Profile errors and messages
    profileLoadError: "Não foi possível carregar o perfil.",
    profileUpdateError: "Não foi possível atualizar o perfil.",
    passwordUpdateError: "Não foi possível atualizar a senha.",
    loadingProfile: "Carregando perfil...",
    saving: "Salvando...",
    updating: "Atualizando...",
    fileSizeError: "O arquivo deve ter até 2MB.",
    profileUpdatedSuccess: "Perfil atualizado com sucesso!",
    passwordUpdatedSuccess: "Senha atualizada com sucesso.",
    passwordMinLength: "A nova senha deve conter ao menos 6 caracteres.",
    passwordMismatch: "A confirmação deve ser igual à nova senha.",
    removeFile: "Remover arquivo",
    documentAttached: "Documento anexado",
    openFile: "Abrir arquivo",

    // Login errors and messages
    loginError: "Não foi possível autenticar. Tente novamente.",
    requiredCredentials: "Informe usuário/e-mail e senha.",

    // Password reset
    resetPassword: "Redefinir senha",
    resetPasswordDesc: "Solicite um link de recuperação e defina uma nova senha para sua conta.",
    requestLink: "Solicitar link",
    resetToken: "Token de recuperação",
    resetTokenPlaceholder: "Token recebido por e-mail",
    sendingInstructions: "Enviando...",
    sendInstructions: "Enviar instruções",
    resetInstructionsSent: "Enviamos as instruções para o seu e-mail, verifique a caixa de entrada.",
    resetRequestError: "Não foi possível solicitar a recuperação.",
    resetTokenRequired: "Informe o token recebido por e-mail.",
    resetPasswordButton: "Redefinir senha",
    resetting: "Redefinindo...",
    resetPasswordSuccess: "Senha redefinida com sucesso. Você já pode fazer login.",
    resetPasswordError: "Não foi possível redefinir a senha.",
    backToLogin: "Voltar para o login",
    defineNewPassword: "Definir nova senha",
  },
  en: {
    // Days of week
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
    
    // Period types
    day: "day",
    week: "week",
    month: "month",
    
    // Common terms
    welcome: "Welcome",
    dashboard: "Dashboard",
    profile: "Profile",
    login: "Sign In",
    logout: "Sign Out",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    toggleTheme: "Toggle theme",
    language: "Language",
    portuguese: "Portuguese",
    english: "English",
    homeNav: "Home",
    studentNav: "Student panel",
    schedulingNav: "Scheduling",
    teacherNav: "Instructor panel",
    adminNav: "Admin panel",
    
    // Dashboard
    welcomeMessage: "Welcome",
    manageClasses: "Manage classes, track bookings, and view Omni App metrics in a minimalist interface.",
    backendLabel: "Backend",
    impactPanel: "Impact Panel",
    impactPanelDesc: "Indicators that summarize the current pulse of the platform.",
    confirmationRate: "Confirmation Rate",
    reservationsWaiting: "reservations awaiting approval",
    activeUsers: "Active Users",
    studentsConnected: "students connected",
    instructors: "Instructors",
    modalitiesActive: "active modalities",
    reservations: "Reservations",
    confirmed: "confirmed",
    publishedClasses: "Published Classes",
    catalogUpdated: "Catalog updated",
    realtimeInsights: "Real-time Insights",
    realtimeInsightsDesc: "Monitor bookings, confirmations, and engagement in a light and responsive dashboard.",
    totalReservations: "Total Reservations",
    growthTrend: "Growth Trend",
    usersVsReservations: "Users vs Reservations",
    reservationsByStatus: "Reservations by Status",
    currentDistribution: "Current Distribution",
    weekPeaks: "Week Peaks",
    reservationsByDay: "Reservations per Day",
    studentAgeRange: "Student Age Range",
    participationByGroup: "Participation by Group",
    highlight: "highlighted",
    availableClasses: "Available Classes",
    modalitiesAndSchedules: "Modalities and schedules published on Omni App.",
    loading: "Loading",
    loadingClasses: "Loading classes...",
    upcomingBookings: "Upcoming Bookings",
    bookingsAssociated: "Bookings associated with your profile.",
    loadingBookings: "Loading bookings...",
    noBookingsYet: "No bookings here yet.",
    quickInsights: "Quick Insights",
    periodTrends: "Trends from the selected period on the backend.",
    popularModalities: "Popular Modalities",
    students: "students",
    confirmationRates: "Confirmation Rates",
    ofReservationsConfirmed: "of reservations confirmed",
    pendingInPeriod: "pending in the period.",
    hotTimes: "Hot Times",
    instructorPerformance: "Instructor Performance",
    rankingByConfirmed: "Ranking based on confirmed reservations by instructors.",
    ofConfirmation: "confirmation rate",
    demandAndGrowth: "Demand and Growth",
    dataFromBackend: "Data consolidated directly from the Omni backend.",
    timeline: "Timeline",
    newUsers: "new users",
    reservationsByDayOfWeek: "Reservations per Day",
    ageRanges: "Age Ranges",
    noAgeRanges: "No age ranges recorded.",
    noRecords: "No records for the consulted period.",
    noBookingsInPeriod: "No bookings recorded in the current period.",
    newBooking: "New Booking",
    requestPrivateClass: "Request a private class quickly.",
    teacher: "Teacher",
    selectTeacher: "Select",
    modality: "Modality",
    selectModality: "Select",
    date: "Date",
    time: "Time",
    duration: "Duration",
    minutes: "min",
    location: "Location",
    locationPlaceholder: "Gym, online...",
    notes: "Notes",
    notesPlaceholder: "Share goals or preferences.",
    requestBooking: "Request Booking",
    bookingCreatedSuccess: "Booking created successfully! Awaiting confirmation.",
    statusFilterLabel: "Status",
    allStatuses: "All",
    timeRangeFilterLabel: "Range",
    upcomingScope: "Upcoming",
    pastScope: "Past",
    allScope: "All",
    exportCsv: "Export CSV",
    noFilteredResults: "No records match the current filters.",
    clearFilters: "Clear",
    refresh: "Refresh",
    daysLabel: "Days",
    noSchedule: "On request",
    noClassesAvailable: "No classes published yet.",
    pendingRequests: "Pending Requests",
    manageApprovals: "Manage private class approvals.",
    student: "Student",
    studentNotes: "Student notes:",
    confirm: "Confirm",
    reject: "Reject",
    noRequests: "No requests awaiting analysis.",
    yourScheduleAsTeacher: "Your Schedule as a Teacher",
    confirmedClasses: "Upcoming classes confirmed with your students.",
    noConfirmedClasses: "You have no confirmed classes.",
    cancelRequest: "Cancel Request",
    studentDashboardTitle: "Goals & progress",
    studentDashboardSubtitle: "Track evolution, set goals, and generate personalized reports.",
    monthlyGoalLabel: "Monthly goal",
    classesLabel: "classes",
    ofGoalReached: "of goal reached",
    progressMetricLabel: "Progress",
    waitingApprovalLabel: "Awaiting approval",
    totalStudyTimeLabel: "Training time",
    hoursAbbr: "h",
    goalManagementTitle: "Goal management",
    goalManagementSubtitle: "Adjust your monthly class goal to stay on pace.",
    yourUpcomingClasses: "Upcoming classes",
    filterAndTrack: "Use filters to keep your plan on track.",
    monthFilterLabel: "Month",
    allMonthsOption: "All months",
    teacherDashboardTitle: "Instructor panel",
    teacherDashboardSubtitle: "Track requests and organize the confirmed schedule.",
    teacherScheduleTitle: "Confirmed agenda",
    teacherScheduleSubtitle: "View classes and filter by status or day.",
    dayFilterLabel: "Weekday",
    allDaysOption: "All days",
    bookingConfirmedMessage: "Booking confirmed successfully!",
    bookingRejectedMessage: "Request rejected.",
    exportSuccessMessage: "Export ready! Check your downloads.",
    adminDashboardTitle: "Admin overview",
    adminDashboardSubtitle: "Consolidated Omni indicators and reports.",
    timelineRangeLabel: "Range",
    searchModalityLabel: "Search modality",
    searchPlaceholder: "Type to filter...",
    modalityOverviewTitle: "Modality overview",
    
    // Profile
    yourProfile: "Your Profile",
    updateInfo: "Update information shared with the gym team.",
    updateFile: "Update File",
    fullName: "Full Name",
    fullNamePlaceholder: "New display name",
    phone: "Phone",
    phonePlaceholder: "+1 555 999-0000",
    username: "Username",
    email: "Email",
    bio: "Bio",
    bioPlaceholder: "Tell us about your experience.",
    timezone: "Timezone",
    selectTimezone: "Select",
    saveChanges: "Save Changes",
    updatePassword: "Update Password",
    setNewPassword: "Set a new password to protect your access.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    repeatPassword: "Repeat the new password",
    updatePasswordButton: "Update Password",
    
    // Login
    loginToOmni: "Sign in to Omni",
    accessPanel: "Access the panel to manage classes, students, and bookings.",
    usernameOrEmail: "Username or email",
    usernameOrEmailPlaceholder: "jane.doe or jane@example.com",
    password: "Password",
    passwordPlaceholder: "********",
    entering: "Signing in...",
    enter: "Sign In",
    forgotPassword: "Forgot password?",
    recoverAccess: "Recover access",
    
    // Status
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    
    // Actions
    tryAgain: "Try again",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    
    // Messages
    errorLoading: "Could not load.",
    successSaving: "Saved successfully!",
    fillRequired: "Fill in all required fields.",

    // Analytics charts
    users: "Users",
    people: "People",
    bookings: "Bookings",
    highlighted: "highlighted",
    noDataYet: "Not enough data yet.",
    noBookingsForChart: "No bookings recorded to generate this chart.",
    notEnoughData: "Not enough data for this visualization yet.",
    demographicDataNotAvailable: "Demographic data not available yet.",
    noBookingsInCurrentPeriod: "No bookings in the period",
    bookingsPlural: "bookings",

    // Profile errors and messages
    profileLoadError: "Could not load profile.",
    profileUpdateError: "Could not update profile.",
    passwordUpdateError: "Could not update password.",
    loadingProfile: "Loading profile...",
    saving: "Saving...",
    updating: "Updating...",
    fileSizeError: "File must be up to 2MB.",
    profileUpdatedSuccess: "Profile updated successfully!",
    passwordUpdatedSuccess: "Password updated successfully.",
    passwordMinLength: "New password must contain at least 6 characters.",
    passwordMismatch: "Confirmation must match the new password.",
    removeFile: "Remove file",
    documentAttached: "Document attached",
    openFile: "Open file",

    // Login errors and messages
    loginError: "Could not authenticate. Try again.",
    requiredCredentials: "Please enter username/email and password.",

    // Password reset
    resetPassword: "Reset Password",
    resetPasswordDesc: "Request a recovery link and set a new password for your account.",
    requestLink: "Request Link",
    resetToken: "Recovery Token",
    resetTokenPlaceholder: "Token received by email",
    sendingInstructions: "Sending...",
    sendInstructions: "Send Instructions",
    resetInstructionsSent: "We sent instructions to your email, please check your inbox.",
    resetRequestError: "Could not request recovery.",
    resetTokenRequired: "Please enter the token received by email.",
    resetPasswordButton: "Reset Password",
    resetting: "Resetting...",
    resetPasswordSuccess: "Password reset successfully. You can now sign in.",
    resetPasswordError: "Could not reset password.",
    backToLogin: "Back to login",
    defineNewPassword: "Set New Password",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  translate: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("omni-language");
    return (stored === "en" || stored === "pt") ? stored : "pt";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("omni-language", lang);
  }, []);

  const t = useCallback(
    (key: keyof Translations): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  const translate = useCallback(
    (text: string): string => {
      // Try to find a matching translation key
      const key = text as keyof Translations;
      if (translations[language][key]) {
        return translations[language][key];
      }
      // If no translation found, return original text
      return text;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translate,
    }),
    [language, setLanguage, t, translate]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
