import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getAllTransactions,
  createTransaction,
  updateTransactionStatus,
  type Transaction,
  type TransactionStatus,
  type TransactionType,
  type PaymentMethod,
  type CreateTransactionRequest,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  isRevenueType,
  isExpenseType,
} from "../api/financial";

export function AdminTransactionsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "ALL">("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    type: "MONTHLY_SUBSCRIPTION",
    userId: 1,
    amount: 0,
    description: "",
  });

  useEffect(() => {
    loadTransactions();
  }, [filterStatus]);

  const loadTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAllTransactions(
        token,
        filterStatus === "ALL" ? undefined : filterStatus
      );
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createTransaction(token, formData);
      alert("Transação criada com sucesso!");
      setShowCreateForm(false);
      setFormData({
        type: "MONTHLY_SUBSCRIPTION",
        userId: 1,
        amount: 0,
        description: "",
      });
      loadTransactions();
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Erro ao criar transação");
    }
  };

  const handleUpdateStatus = async (transactionId: number, newStatus: TransactionStatus) => {
    if (!token) return;
    if (!confirm(`Confirmar mudança de status para ${TRANSACTION_STATUS_LABELS[newStatus]}?`)) return;

    try {
      await updateTransactionStatus(token, transactionId, newStatus);
      alert("Status atualizado com sucesso!");
      loadTransactions();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Erro ao atualizar status");
    }
  };

  const filteredTransactions = transactions;

  const revenueAmount = filteredTransactions
    .filter((t) => isRevenueType(t.type))
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseAmount = filteredTransactions
    .filter((t) => isExpenseType(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      <BackButton to="/admin/financeiro" />
      <div className="page-header">
        <div>
          <button
            className="button button-secondary"
            onClick={() => navigate("/admin/financeiro")}
            style={{ marginBottom: "16px" }}
          >
            ← {language === "pt" ? "Voltar ao Dashboard" : "Back to Dashboard"}
          </button>
          <h1 className="page-title">
            {language === "pt" ? "Gerenciar Transações" : "Manage Transactions"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt" ? "Criar despesas, receitas e gerenciar pagamentos" : "Create expenses, revenues and manage payments"}
          </p>
        </div>
        <button
          className="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm
            ? (language === "pt" ? "Cancelar" : "Cancel")
            : (language === "pt" ? "Nova Transação" : "New Transaction")}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Total Transações" : "Total Transactions"}</span>
          <strong>{filteredTransactions.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Receitas" : "Revenue"}</span>
          <strong style={{ color: "#10b981" }}>R$ {revenueAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Despesas" : "Expenses"}</span>
          <strong style={{ color: "#ef4444" }}>R$ {expenseAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Saldo" : "Balance"}</span>
          <strong style={{ color: revenueAmount - expenseAmount >= 0 ? "#10b981" : "#ef4444" }}>
            R$ {(revenueAmount - expenseAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="panel" style={{ marginBottom: "24px" }}>
          <h2>{language === "pt" ? "Nova Transação" : "New Transaction"}</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Tipo" : "Type"}</span>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                required
                className="form-input"
              >
                <optgroup label="Receitas">
                  <option value="COURSE_ENROLLMENT">Matrícula em Curso</option>
                  <option value="BOOKING_PAYMENT">Pagamento de Reserva</option>
                  <option value="MONTHLY_SUBSCRIPTION">Mensalidade</option>
                  <option value="PRIVATE_CLASS">Aula Particular</option>
                  <option value="PRODUCT_SALE">Venda de Produto</option>
                </optgroup>
                <optgroup label="Despesas">
                  <option value="INSTRUCTOR_PAYMENT">Pagamento a Instrutor</option>
                  <option value="RENT">Aluguel</option>
                  <option value="UTILITIES">Utilidades (Água, Luz, etc.)</option>
                  <option value="EQUIPMENT">Equipamento</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OTHER_EXPENSE">Outra Despesa</option>
                </optgroup>
              </select>
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "ID do Usuário" : "User ID"}</span>
              <input
                type="number"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                required
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Valor (R$)" : "Amount (R$)"}</span>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
                className="form-input"
                placeholder="0.00"
              />
            </label>

            <label className="form-field">
              <span>{language === "pt" ? "Método de Pagamento" : "Payment Method"}</span>
              <select
                value={formData.paymentMethod || ""}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod || undefined })}
                className="form-input"
              >
                <option value="">Selecione...</option>
                <option value="PIX">PIX</option>
                <option value="CREDIT_CARD">Cartão de Crédito</option>
                <option value="DEBIT_CARD">Cartão de Débito</option>
                <option value="BANK_SLIP">Boleto Bancário</option>
                <option value="CASH">Dinheiro</option>
                <option value="BANK_TRANSFER">Transferência Bancária</option>
              </select>
            </label>

            <label className="form-field" style={{ gridColumn: "1 / -1" }}>
              <span>{language === "pt" ? "Descrição" : "Description"}</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="form-input"
                placeholder="Descrição da transação..."
                rows={3}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="submit" className="button">
              {language === "pt" ? "Criar Transação" : "Create Transaction"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              {language === "pt" ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
        <span style={{ fontWeight: "500" }}>{language === "pt" ? "Filtrar por status:" : "Filter by status:"}</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | "ALL")}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
          }}
        >
          <option value="ALL">Todas</option>
          <option value="PENDING">Pendentes</option>
          <option value="PROCESSING">Processando</option>
          <option value="COMPLETED">Concluídas</option>
          <option value="FAILED">Falhadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{language === "pt" ? "Código" : "Code"}</th>
                <th>{language === "pt" ? "Tipo" : "Type"}</th>
                <th>{language === "pt" ? "Usuário" : "User"}</th>
                <th>{language === "pt" ? "Valor" : "Amount"}</th>
                <th>{language === "pt" ? "Método" : "Method"}</th>
                <th>Status</th>
                <th>{language === "pt" ? "Data" : "Date"}</th>
                <th>{language === "pt" ? "Ações" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    {language === "pt" ? "Carregando..." : "Loading..."}
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    {language === "pt" ? "Nenhuma transação encontrada" : "No transactions found"}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td><strong>#{transaction.id}</strong></td>
                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{transaction.transactionCode}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        background: isRevenueType(transaction.type) ? "#d1fae5" : "#fee2e2",
                        color: isRevenueType(transaction.type) ? "#065f46" : "#991b1b",
                      }}>
                        {TRANSACTION_TYPE_LABELS[transaction.type]}
                      </span>
                    </td>
                    <td>{transaction.userFullName || transaction.username}</td>
                    <td>
                      <strong style={{ color: isRevenueType(transaction.type) ? "#10b981" : "#ef4444" }}>
                        {isExpenseType(transaction.type) && "-"}
                        R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>{transaction.paymentMethod ? (PAYMENT_METHOD_LABELS as any)[transaction.paymentMethod] || transaction.paymentMethod : "-"}</td>
                    <td>
                      <span className={`status status-${transaction.status.toLowerCase()}`}>
                        {TRANSACTION_STATUS_LABELS[transaction.status]}
                      </span>
                    </td>
                    <td>{new Date(transaction.createdAt).toLocaleString("pt-BR")}</td>
                    <td>
                      {transaction.status === "PENDING" && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="button button-small"
                            onClick={() => handleUpdateStatus(transaction.id, "COMPLETED")}
                            style={{ background: "#10b981", color: "#fff" }}
                          >
                            ✓ Aprovar
                          </button>
                          <button
                            className="button button-small button-secondary"
                            onClick={() => handleUpdateStatus(transaction.id, "CANCELLED")}
                          >
                            ✗ Cancelar
                          </button>
                        </div>
                      )}
                      {transaction.status === "COMPLETED" && (
                        <button
                          className="button button-small button-secondary"
                          onClick={() => handleUpdateStatus(transaction.id, "REFUNDED")}
                        >
                          ↩ Reembolsar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

