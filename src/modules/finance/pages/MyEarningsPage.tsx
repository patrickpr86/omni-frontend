import { useState, useEffect } from "react";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getMyEarnings,
  type Transaction,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/modules/finance/api/financial.ts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function MyEarningsPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const [earnings, setEarnings] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMyEarnings(token);
      setEarnings(data);
    } catch (error) {
      console.error("Error loading earnings:", error);
      alert("Erro ao carregar ganhos");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><p>{language === "pt" ? "Carregando..." : "Loading..."}</p></AppLayout>;
  }

  // Calculate metrics
  const totalEarnings = earnings
    .filter((e) => e.status === "COMPLETED")
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingEarnings = earnings
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthEarnings = earnings
    .filter((e) => {
      const date = new Date(e.createdAt);
      const now = new Date();
      return (
        e.status === "COMPLETED" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const completedCount = earnings.filter((e) => e.status === "COMPLETED").length;

  // Group by month for chart
  const earningsByMonth: Record<string, number> = {};
  earnings
    .filter((e) => e.status === "COMPLETED")
    .forEach((e) => {
      const date = new Date(e.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + e.amount;
    });

  const chartData = Object.entries(earningsByMonth)
    .sort()
    .slice(-6) // Last 6 months
    .map(([month, amount]) => ({
      month,
      amount,
    }));

  return (
    <AppLayout>
      <BackButton />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            💰 {language === "pt" ? "Meus Ganhos" : "My Earnings"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt" ? "Acompanhe seus ganhos como instrutor" : "Track your earnings as an instructor"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Total Recebido" : "Total Earned"}
          </span>
          <strong style={{ color: "#fff" }}>
            R$ {totalEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Este Mês" : "This Month"}
          </span>
          <strong style={{ color: "#fff" }}>
            R$ {thisMonthEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "A Receber" : "Pending"}
          </span>
          <strong style={{ color: "#fff" }}>
            R$ {pendingEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Aulas Pagas" : "Paid Classes"}
          </span>
          <strong style={{ color: "#fff" }}>{completedCount}</strong>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h2>{language === "pt" ? "Ganhos Mensais (últimos 6 meses)" : "Monthly Earnings (last 6 months)"}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" name="Ganhos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Earnings Table */}
      <div className="panel">
        <h2>{language === "pt" ? "Histórico de Ganhos" : "Earnings History"}</h2>
        <div style={{ overflowX: "auto", marginTop: "16px" }}>
          <table className="table">
            <thead>
              <tr>
                <th>{language === "pt" ? "Data" : "Date"}</th>
                <th>{language === "pt" ? "Tipo" : "Type"}</th>
                <th>{language === "pt" ? "Descrição" : "Description"}</th>
                <th>{language === "pt" ? "Valor" : "Amount"}</th>
                <th>{language === "pt" ? "Método" : "Method"}</th>
                <th>Status</th>
                <th>{language === "pt" ? "Pago em" : "Paid on"}</th>
              </tr>
            </thead>
            <tbody>
              {earnings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    {language === "pt" ? "Nenhum ganho encontrado" : "No earnings found"}
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td>{new Date(earning.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        background: "#d1fae5",
                        color: "#065f46",
                      }}>
                        {TRANSACTION_TYPE_LABELS[earning.type]}
                      </span>
                    </td>
                    <td>
                      {earning.description}
                      {earning.userFullName && (
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Aluno: {earning.userFullName}
                        </p>
                      )}
                    </td>
                    <td>
                      <strong style={{
                        color: earning.status === "COMPLETED" ? "#10b981" : "#f59e0b",
                        fontSize: "16px",
                      }}>
                        R$ {earning.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>{earning.paymentMethod ? (PAYMENT_METHOD_LABELS as any)[earning.paymentMethod] || earning.paymentMethod : "-"}</td>
                    <td>
                      <span className={`status status-${earning.status.toLowerCase()}`}>
                        {TRANSACTION_STATUS_LABELS[earning.status]}
                      </span>
                    </td>
                    <td>
                      {earning.paidAt ? (
                        <span style={{ color: "#10b981" }}>
                          {new Date(earning.paidAt).toLocaleDateString("pt-BR")}
                        </span>
                      ) : (
                        <span style={{ color: "#6b7280" }}>-</span>
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

