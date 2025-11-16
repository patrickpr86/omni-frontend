import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import { BackButton } from "../components/BackButton";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  getAdminDashboard,
  type FinancialDashboard,
  TRANSACTION_TYPE_LABELS,
} from "../api/financial";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export function AdminFinancialDashboardPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30"); // days

  useEffect(() => {
    loadDashboard();
  }, [period]);

  const loadDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString();
      
      const data = await getAdminDashboard(token, startDate, endDate);
      setDashboard(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      alert("Erro ao carregar dashboard financeiro");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <AppLayout><p>{language === "pt" ? "Carregando..." : "Loading..."}</p></AppLayout>;
  }

  if (!dashboard) {
    return <AppLayout><p>{language === "pt" ? "Erro ao carregar dados" : "Error loading data"}</p></AppLayout>;
  }

  // Prepare chart data
  const revenueByTypeData = Object.entries(dashboard.revenueByType || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const revenueByMethodData = Object.entries(dashboard.revenueByPaymentMethod || {}).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  return (
    <AppLayout>
      <BackButton to="/painel/admin" />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            💰 {language === "pt" ? "Dashboard Financeiro" : "Financial Dashboard"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt" ? "Visão completa das finanças do negócio" : "Complete business finances overview"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button
            className="button"
            onClick={() => navigate("/admin/financeiro/transacoes")}
          >
            {language === "pt" ? "Ver Transações" : "View Transactions"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Receita Total" : "Total Revenue"}
          </span>
          <strong style={{ color: "#fff" }}>R$ {dashboard.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Despesas" : "Expenses"}
          </span>
          <strong style={{ color: "#fff" }}>R$ {dashboard.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Lucro Líquido" : "Net Profit"}
          </span>
          <strong style={{ color: "#fff" }}>R$ {dashboard.netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
          <span className="metric-label" style={{ color: "rgba(255,255,255,0.9)" }}>
            {language === "pt" ? "Pendente" : "Pending"}
          </span>
          <strong style={{ color: "#fff" }}>R$ {dashboard.pendingAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Total Transações" : "Total Transactions"}</span>
          <strong>{dashboard.totalTransactions}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Concluídas" : "Completed"}</span>
          <strong style={{ color: "#10b981" }}>{dashboard.completedTransactions}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Pendentes" : "Pending"}</span>
          <strong style={{ color: "#f59e0b" }}>{dashboard.pendingTransactions}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">{language === "pt" ? "Falhadas" : "Failed"}</span>
          <strong style={{ color: "#ef4444" }}>{dashboard.failedTransactions}</strong>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* Daily Revenue Chart */}
        <div className="panel">
          <h2>{language === "pt" ? "Receita Diária" : "Daily Revenue"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Type */}
        <div className="panel">
          <h2>{language === "pt" ? "Receita por Tipo" : "Revenue by Type"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByTypeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* Revenue by Payment Method */}
        <div className="panel">
          <h2>{language === "pt" ? "Receita por Método" : "Revenue by Method"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMethodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Stats */}
        <div className="panel">
          <h2>{language === "pt" ? "Estatísticas de Faturas" : "Invoice Statistics"}</h2>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>{language === "pt" ? "Total de Faturas" : "Total Invoices"}</span>
                <strong>{dashboard.totalInvoices}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#10b981" }}>{language === "pt" ? "Pagas" : "Paid"}</span>
                <strong style={{ color: "#10b981" }}>{dashboard.paidInvoices}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#ef4444" }}>{language === "pt" ? "Vencidas" : "Overdue"}</span>
                <strong style={{ color: "#ef4444" }}>{dashboard.overdueInvoices}</strong>
              </div>
            </div>
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-secondary)", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>{language === "pt" ? "Total Faturado" : "Total Invoiced"}</span>
                <strong>R$ {dashboard.totalInvoiced.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{language === "pt" ? "A Receber" : "Unpaid"}</span>
                <strong style={{ color: "#f59e0b" }}>R$ {dashboard.totalUnpaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2>{language === "pt" ? "Transações Recentes" : "Recent Transactions"}</h2>
          <button
            className="button button-small"
            onClick={() => navigate("/admin/financeiro/transacoes")}
          >
            {language === "pt" ? "Ver Todas" : "View All"}
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{language === "pt" ? "Tipo" : "Type"}</th>
                <th>{language === "pt" ? "Usuário" : "User"}</th>
                <th>{language === "pt" ? "Valor" : "Amount"}</th>
                <th>Status</th>
                <th>{language === "pt" ? "Data" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentTransactions?.slice(0, 10).map((transaction) => (
                <tr key={transaction.id}>
                  <td><strong>#{transaction.id}</strong></td>
                  <td>{TRANSACTION_TYPE_LABELS[transaction.type]}</td>
                  <td>{transaction.userFullName || transaction.username}</td>
                  <td>
                    <strong style={{ color: transaction.type.includes("PAYMENT") || transaction.type.includes("EXPENSE") ? "#ef4444" : "#10b981" }}>
                      R$ {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td>
                    <span className={`status status-${transaction.status.toLowerCase()}`}>
                      {transaction.status === "COMPLETED" && "Concluída"}
                      {transaction.status === "PENDING" && "Pendente"}
                      {transaction.status === "PROCESSING" && "Processando"}
                      {transaction.status === "FAILED" && "Falhou"}
                      {transaction.status === "CANCELLED" && "Cancelada"}
                      {transaction.status === "REFUNDED" && "Reembolsada"}
                    </span>
                  </td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

