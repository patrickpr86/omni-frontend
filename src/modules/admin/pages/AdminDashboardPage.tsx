import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import { getAllUsers } from "@/modules/admin/api/admin.ts";
import { getAdminDashboard } from "@/modules/finance/api/financial.ts";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"];
const GRADIENT_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
];

export function AdminDashboardPage() {
  const { token } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [financial, setFinancial] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [usersData, financialData] = await Promise.all([
        getAllUsers(token),
        getAdminDashboard(token),
      ]);
      setUsers(usersData);
      setFinancial(financialData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
        </div>
      </AppLayout>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const studentsCount = users.filter((u) => u.roles.includes("STUDENT")).length;
  const instructorsCount = users.filter((u) => u.roles.includes("INSTRUCTOR")).length;

  const revenueData = financial?.dailyRevenue?.slice(-7) || [];
  const transactionsByStatus = [
    { name: "Concluídas", value: financial?.completedTransactions || 0 },
    { name: "Pendentes", value: financial?.pendingTransactions || 0 },
    { name: "Falhadas", value: financial?.failedTransactions || 0 },
  ];

  return (
    <AppLayout>
      <div className="admin-dashboard">
        {/* Hero Header */}
        <div className="dashboard-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-icon">🎯</span>
              {language === "pt" ? "Painel Administrativo" : "Admin Dashboard"}
            </h1>
            <p className="hero-subtitle">
              {language === "pt"
                ? "Visão completa e controle total da plataforma"
                : "Complete overview and full platform control"}
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/admin/usuarios")}>
              <span>👥</span>
              {language === "pt" ? "Gerenciar Usuários" : "Manage Users"}
            </button>
            <button className="btn-secondary" onClick={() => navigate("/admin/financeiro")}>
              <span>💰</span>
              {language === "pt" ? "Finanças" : "Financial"}
            </button>
          </div>
        </div>

        {/* Animated Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-1" style={{ background: GRADIENT_COLORS[0] }}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3 className="stat-value">{totalUsers}</h3>
              <p className="stat-label">
                {language === "pt" ? "Total de Usuários" : "Total Users"}
              </p>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗ +12%</span>
            </div>
          </div>

          <div className="stat-card stat-card-2" style={{ background: GRADIENT_COLORS[1] }}>
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-value">{activeUsers}</h3>
              <p className="stat-label">
                {language === "pt" ? "Usuários Ativos" : "Active Users"}
              </p>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗ +8%</span>
            </div>
          </div>

          <div className="stat-card stat-card-3" style={{ background: GRADIENT_COLORS[2] }}>
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <h3 className="stat-value">{studentsCount}</h3>
              <p className="stat-label">
                {language === "pt" ? "Alunos" : "Students"}
              </p>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗ +15%</span>
            </div>
          </div>

          <div className="stat-card stat-card-4" style={{ background: GRADIENT_COLORS[3] }}>
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3 className="stat-value">{instructorsCount}</h3>
              <p className="stat-label">
                {language === "pt" ? "Instrutores" : "Instructors"}
              </p>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗ +5%</span>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        {financial && (
          <div className="financial-overview">
            <div className="overview-card revenue-card">
              <div className="card-header">
                <h2>💵 {language === "pt" ? "Receita" : "Revenue"}</h2>
                <span className="card-badge">Este mês</span>
              </div>
              <div className="card-value">
                <h3>R$ {(financial.totalRevenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
                <span className="value-trend positive">+24% vs mês passado</span>
              </div>
            </div>

            <div className="overview-card profit-card">
              <div className="card-header">
                <h2>📈 {language === "pt" ? "Lucro Líquido" : "Net Profit"}</h2>
                <span className="card-badge">Este mês</span>
              </div>
              <div className="card-value">
                <h3>R$ {(financial.netProfit || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
                <span className="value-trend positive">+18% vs mês passado</span>
              </div>
            </div>

            <div className="overview-card transactions-card">
              <div className="card-header">
                <h2>💳 {language === "pt" ? "Transações" : "Transactions"}</h2>
                <span className="card-badge">Total</span>
              </div>
              <div className="card-value">
                <h3>{financial.totalTransactions || 0}</h3>
                <span className="value-trend positive">+32% vs mês passado</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Revenue Trend Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📊 {language === "pt" ? "Receita dos Últimos 7 Dias" : "Last 7 Days Revenue"}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: "#1e2633", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Area type="monotone" dataKey="amount" stroke="#667eea" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transactions Status */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>🎯 {language === "pt" ? "Status das Transações" : "Transactions Status"}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionsByStatus.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e2633", border: "1px solid #334155", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>{language === "pt" ? "⚡ Ações Rápidas" : "⚡ Quick Actions"}</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate("/admin/usuarios")}>
              <span className="action-icon">➕</span>
              <div className="action-content">
                <strong>{language === "pt" ? "Novo Usuário" : "New User"}</strong>
                <small>{language === "pt" ? "Cadastrar usuário" : "Register user"}</small>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate("/admin/cursos")}>
              <span className="action-icon">📚</span>
              <div className="action-content">
                <strong>{language === "pt" ? "Novo Curso" : "New Course"}</strong>
                <small>{language === "pt" ? "Adicionar curso" : "Add course"}</small>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate("/admin/financeiro/transacoes")}>
              <span className="action-icon">💰</span>
              <div className="action-content">
                <strong>{language === "pt" ? "Nova Transação" : "New Transaction"}</strong>
                <small>{language === "pt" ? "Registrar pagamento" : "Register payment"}</small>
              </div>
            </button>

            <button className="action-btn" onClick={() => navigate("/gerenciar-solicitacoes")}>
              <span className="action-icon">📅</span>
              <div className="action-content">
                <strong>{language === "pt" ? "Solicitações" : "Requests"}</strong>
                <small>{language === "pt" ? "Gerenciar aulas" : "Manage lessons"}</small>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>{language === "pt" ? "📋 Atividade Recente" : "📋 Recent Activity"}</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-icon-success">✓</div>
              <div className="activity-content">
                <p><strong>João Silva</strong> {language === "pt" ? "matriculou-se em" : "enrolled in"} <strong>Jiu-Jitsu Avançado</strong></p>
                <span className="activity-time">Há 5 minutos</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon activity-icon-info">💰</div>
              <div className="activity-content">
                <p><strong>Maria Santos</strong> {language === "pt" ? "efetuou pagamento de" : "made payment of"} <strong>R$ 150,00</strong></p>
                <span className="activity-time">Há 12 minutos</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon activity-icon-warning">📅</div>
              <div className="activity-content">
                <p><strong>Carlos Oliveira</strong> {language === "pt" ? "agendou aula particular" : "scheduled private lesson"}</p>
                <span className="activity-time">Há 28 minutos</span>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon activity-icon-success">👥</div>
              <div className="activity-content">
                <p><strong>Ana Costa</strong> {language === "pt" ? "criou uma conta nova" : "created a new account"}</p>
                <span className="activity-time">Há 1 hora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

