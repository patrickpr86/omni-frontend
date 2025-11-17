import { useState, useEffect } from "react";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getMyDashboard,
  getMyTransactions,
  payTransaction,
  type FinancialDashboard,
  type Transaction,
  type PaymentMethod,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/finance/api/financial.ts";

export function MyFinancesPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingTransactionId, setPayingTransactionId] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("PIX");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [dashboardData, transactionsData] = await Promise.all([
        getMyDashboard(token),
        getMyTransactions(token),
      ]);
      setDashboard(dashboardData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (transactionId: number) => {
    if (!token) return;
    if (!confirm(`Confirmar pagamento via ${PAYMENT_METHOD_LABELS[selectedPaymentMethod]}?`)) return;

    try {
      await payTransaction(token, transactionId, selectedPaymentMethod);
      alert("Pagamento processado com sucesso!");
      setPayingTransactionId(null);
      loadData();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Erro ao processar pagamento");
    }
  };

  if (loading) {
    return <AppLayout><p>{language === "pt" ? "Carregando..." : "Loading..."}</p></AppLayout>;
  }

  const pendingTransactions = transactions.filter((t) => t.status === "PENDING");

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            💳 {language === "pt" ? "Minhas Finanças" : "My Finances"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt" ? "Gerencie seus pagamentos e histórico financeiro" : "Manage your payments and financial history"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Total Pago" : "Total Paid"}
          </span>
          <strong style={{ color: "#fff" }}>
            R$ {dashboard?.userTotalPaid?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
          </strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Pendente" : "Pending"}
          </span>
          <strong style={{ color: "#fff" }}>
            R$ {dashboard?.userTotalPending?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
          </strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Transações" : "Transactions"}
          </span>
          <strong style={{ color: "#fff" }}>{dashboard?.userTransactionCount || 0}</strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Faturas" : "Invoices"}
          </span>
          <strong style={{ color: "#fff" }}>{dashboard?.totalInvoices || 0}</strong>
        </div>
      </div>

      {/* Pending Payments */}
      {pendingTransactions.length > 0 && (
        <div className="panel" style={{ marginBottom: "24px", border: "2px solid #f59e0b" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ {language === "pt" ? "Pagamentos Pendentes" : "Pending Payments"}
            <span style={{
              padding: "4px 12px",
              background: "#f59e0b",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "bold",
            }}>
              {pendingTransactions.length}
            </span>
          </h2>
          <div style={{ overflowX: "auto", marginTop: "16px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>{language === "pt" ? "Descrição" : "Description"}</th>
                  <th>{language === "pt" ? "Valor" : "Amount"}</th>
                  <th>{language === "pt" ? "Vencimento" : "Due Date"}</th>
                  <th>{language === "pt" ? "Ações" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <strong>{TRANSACTION_TYPE_LABELS[transaction.type]}</strong>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {transaction.description}
                      </p>
                    </td>
                    <td>
                      <strong style={{ color: "#f59e0b", fontSize: "18px" }}>
                        R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>
                      {transaction.dueDate ? (
                        <span style={{
                          color: new Date(transaction.dueDate) < new Date() ? "#ef4444" : "inherit"
                        }}>
                          {new Date(transaction.dueDate).toLocaleDateString("pt-BR")}
                          {new Date(transaction.dueDate) < new Date() && " (Vencido)"}
                        </span>
                      ) : "-"}
                    </td>
                    <td>
                      {payingTransactionId === transaction.id ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                            style={{
                              padding: "6px 10px",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              background: "var(--bg-secondary)",
                              color: "var(--text-primary)",
                              fontSize: "14px",
                            }}
                          >
                            <option value="PIX">PIX</option>
                            <option value="CREDIT_CARD">Cartão de Crédito</option>
                            <option value="DEBIT_CARD">Cartão de Débito</option>
                            <option value="BANK_SLIP">Boleto</option>
                          </select>
                          <button
                            className="button button-small"
                            onClick={() => handlePay(transaction.id)}
                            style={{ background: "#10b981", color: "#fff" }}
                          >
                            ✓ Confirmar
                          </button>
                          <button
                            className="button button-small button-secondary"
                            onClick={() => setPayingTransactionId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="button button-small"
                          onClick={() => setPayingTransactionId(transaction.id)}
                          style={{ background: "#f59e0b", color: "#fff" }}
                        >
                          💳 Pagar Agora
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="panel">
        <h2>{language === "pt" ? "Histórico de Transações" : "Transaction History"}</h2>
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>{language === "pt" ? "Data" : "Date"}</th>
                <th>{language === "pt" ? "Descrição" : "Description"}</th>
                <th>{language === "pt" ? "Tipo" : "Type"}</th>
                <th>{language === "pt" ? "Valor" : "Amount"}</th>
                <th>{language === "pt" ? "Método" : "Method"}</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                    {language === "pt" ? "Nenhuma transação encontrada" : "No transactions found"}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <strong>{TRANSACTION_TYPE_LABELS[transaction.type]}</strong>
                      {transaction.description && (
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          {transaction.description}
                        </p>
                      )}
                    </td>
                    <td>{TRANSACTION_TYPE_LABELS[transaction.type]}</td>
                    <td>
                      <strong style={{
                        color: transaction.status === "COMPLETED" ? "#10b981" : 
                               transaction.status === "PENDING" ? "#f59e0b" : "#6b7280"
                      }}>
                        R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>{transaction.paymentMethod ? (PAYMENT_METHOD_LABELS as any)[transaction.paymentMethod] || transaction.paymentMethod : "-"}</td>
                    <td>
                      <span className={`status status-${transaction.status.toLowerCase()}`}>
                        {TRANSACTION_STATUS_LABELS[transaction.status]}
                      </span>
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

