import { apiFetch } from "./client";

// ==================== TYPES ====================

export interface Transaction {
  id: number;
  transactionCode: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  paymentMethod?: string;
  userId: number;
  username: string;
  userFullName?: string;
  recipientId?: number;
  recipientName?: string;
  courseEnrollmentId?: number;
  bookingId?: number;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  referenceId?: string;
  installments?: number;
  installmentNumber?: number;
  isRecurring?: boolean;
  recurringDay?: number;
}

export type TransactionType =
  | "COURSE_ENROLLMENT"
  | "BOOKING_PAYMENT"
  | "MONTHLY_SUBSCRIPTION"
  | "PRIVATE_CLASS"
  | "PRODUCT_SALE"
  | "INSTRUCTOR_PAYMENT"
  | "RENT"
  | "UTILITIES"
  | "EQUIPMENT"
  | "MARKETING"
  | "OTHER_EXPENSE"
  | "REFUND"
  | "CHARGEBACK";

export type TransactionStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PIX"
  | "BANK_SLIP"
  | "CASH"
  | "BANK_TRANSFER"
  | "PAYPAL"
  | "OTHER";

export interface FinancialDashboard {
  // Summary
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingAmount: number;

  // Counts
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;

  // Invoices
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalInvoiced: number;
  totalUnpaid: number;

  // Recent
  recentTransactions: Transaction[];

  // Breakdown
  revenueByType: Record<string, number>;
  revenueByPaymentMethod: Record<string, number>;

  // Time series
  dailyRevenue: DailyRevenue[];

  // User specific
  userTotalPaid?: number;
  userTotalPending?: number;
  userTransactionCount?: number;
}

export interface DailyRevenue {
  date: string;
  amount: number;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  userId: number;
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod;
  courseEnrollmentId?: number;
  bookingId?: number;
  recipientId?: number;
  dueDate?: string;
  notes?: string;
  installments?: number;
  installmentNumber?: number;
  isRecurring?: boolean;
  recurringDay?: number;
}

// ==================== ADMIN API ====================

/**
 * Get admin financial dashboard
 */
export async function getAdminDashboard(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<FinancialDashboard> {
  let url = "/api/admin/financial/dashboard";
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await apiFetch<{ success: boolean; data: FinancialDashboard }>(
    url,
    { token }
  );
  return response.data;
}

/**
 * Get all transactions (admin)
 */
export async function getAllTransactions(
  token: string,
  status?: TransactionStatus
): Promise<Transaction[]> {
  let url = "/api/admin/financial/transactions";
  if (status) url += `?status=${status}`;

  const response = await apiFetch<{ success: boolean; data: Transaction[] }>(
    url,
    { token }
  );
  return response.data;
}

/**
 * Create transaction (admin)
 */
export async function createTransaction(
  token: string,
  data: CreateTransactionRequest
): Promise<Transaction> {
  const response = await apiFetch<{ success: boolean; data: Transaction }>(
    "/api/admin/financial/transactions",
    {
      token,
      method: "POST",
      json: data,
    }
  );
  return response.data;
}

/**
 * Update transaction status (admin)
 */
export async function updateTransactionStatus(
  token: string,
  transactionId: number,
  status: TransactionStatus,
  referenceId?: string
): Promise<Transaction> {
  let url = `/api/admin/financial/transactions/${transactionId}/status?status=${status}`;
  if (referenceId) url += `&referenceId=${referenceId}`;

  const response = await apiFetch<{ success: boolean; data: Transaction }>(
    url,
    {
      token,
      method: "PUT",
    }
  );
  return response.data;
}

/**
 * Trigger recurring payments (admin)
 */
export async function triggerRecurringPayments(token: string): Promise<void> {
  await apiFetch("/api/admin/financial/automation/trigger-recurring", {
    token,
    method: "POST",
  });
}

/**
 * Trigger payment reminders (admin)
 */
export async function triggerPaymentReminders(token: string): Promise<void> {
  await apiFetch("/api/admin/financial/automation/trigger-reminders", {
    token,
    method: "POST",
  });
}

// ==================== USER API ====================

/**
 * Get user's financial dashboard
 */
export async function getMyDashboard(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<FinancialDashboard> {
  let url = "/api/financial/my-dashboard";
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await apiFetch<{ success: boolean; data: FinancialDashboard }>(
    url,
    { token }
  );
  return response.data;
}

/**
 * Get user's transactions
 */
export async function getMyTransactions(token: string): Promise<Transaction[]> {
  const response = await apiFetch<{ success: boolean; data: Transaction[] }>(
    "/api/financial/my-transactions",
    { token }
  );
  return response.data;
}

/**
 * Get instructor's earnings
 */
export async function getMyEarnings(token: string): Promise<Transaction[]> {
  const response = await apiFetch<{ success: boolean; data: Transaction[] }>(
    "/api/financial/my-earnings",
    { token }
  );
  return response.data;
}

/**
 * Pay a transaction
 */
export async function payTransaction(
  token: string,
  transactionId: number,
  paymentMethod: PaymentMethod,
  paymentDetails?: string
): Promise<Transaction> {
  let url = `/api/financial/pay/${transactionId}?paymentMethod=${paymentMethod}`;
  if (paymentDetails) url += `&paymentDetails=${paymentDetails}`;

  const response = await apiFetch<{ success: boolean; data: Transaction }>(
    url,
    {
      token,
      method: "POST",
    }
  );
  return response.data;
}

// ==================== HELPERS ====================

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  COURSE_ENROLLMENT: "Matrícula em Curso",
  BOOKING_PAYMENT: "Pagamento de Reserva",
  MONTHLY_SUBSCRIPTION: "Mensalidade",
  PRIVATE_CLASS: "Aula Particular",
  PRODUCT_SALE: "Venda de Produto",
  INSTRUCTOR_PAYMENT: "Pagamento a Instrutor",
  RENT: "Aluguel",
  UTILITIES: "Utilidades",
  EQUIPMENT: "Equipamento",
  MARKETING: "Marketing",
  OTHER_EXPENSE: "Outra Despesa",
  REFUND: "Reembolso",
  CHARGEBACK: "Estorno",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  COMPLETED: "Concluída",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "PIX",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  BANK_TRANSFER: "Transferência Bancária",
  PAYPAL: "PayPal",
  OTHER: "Outro",
};

export function isRevenueType(type: TransactionType): boolean {
  return [
    "COURSE_ENROLLMENT",
    "BOOKING_PAYMENT",
    "MONTHLY_SUBSCRIPTION",
    "PRIVATE_CLASS",
    "PRODUCT_SALE",
  ].includes(type);
}

export function isExpenseType(type: TransactionType): boolean {
  return [
    "INSTRUCTOR_PAYMENT",
    "RENT",
    "UTILITIES",
    "EQUIPMENT",
    "MARKETING",
    "OTHER_EXPENSE",
  ].includes(type);
}

