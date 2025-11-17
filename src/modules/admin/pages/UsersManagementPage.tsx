import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/AppLayout";
import { BackButton } from "@/shared/components/BackButton";
import { useAuth } from "@/core/context/AuthContext.tsx";
import { useLanguage } from "@/core/context/LanguageContext.tsx";
import {
  getAllUsers,
  createUser,
  deleteUser,
  updateUserRoles,
  importUsersFromCsv,
  AVAILABLE_ROLES,
  type UserResponse,
  type CreateUserRequest,
  type CsvImportResponse,
} from "@/modules/admin/api/admin.ts";

export function UsersManagementPage() {
  const { token, user } = useAuth();
  const { language } = useLanguage();
  
  // Verificar se o usuário é admin
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    roles: ["USER"],
    isActive: true,
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["USER"]);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<CsvImportResponse | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Erro ao carregar usuários: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createUser(token, { ...formData, roles: selectedRoles });
      await loadUsers();
      resetForm();
      alert("Usuário criado com sucesso!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Erro ao criar usuário: " + (error as Error).message);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!token) return;
    if (!confirm(`Tem certeza que deseja desativar o usuário ${username}?`)) return;

    try {
      await deleteUser(token, id);
      await loadUsers();
      alert("Usuário desativado com sucesso!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erro ao desativar usuário: " + (error as Error).message);
    }
  };

  const handleUpdateRoles = async (userId: number) => {
    if (!token) return;

    try {
      await updateUserRoles(token, userId, selectedRoles);
      await loadUsers();
      setEditingUser(null);
      alert("Roles atualizadas com sucesso!");
    } catch (error) {
      console.error("Error updating roles:", error);
      alert("Erro ao atualizar roles: " + (error as Error).message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      roles: ["USER"],
      isActive: true,
    });
    setSelectedRoles(["USER"]);
  };

  const openEditRoles = (user: UserResponse) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleCsvImport = async () => {
    if (!token || !csvFile) return;

    try {
      setImporting(true);
      setImportResult(null);
      const result = await importUsersFromCsv(token, csvFile);
      setImportResult(result);
      await loadUsers();
      
      if (result.failedImports === 0) {
        alert(
          language === "pt"
            ? `✅ Importação concluída com sucesso!\n\n${result.successfulImports} usuários foram convertidos e persistidos no banco de dados.`
            : `✅ Import completed successfully!\n\n${result.successfulImports} users were converted and persisted in the database.`
        );
      } else {
        alert(
          language === "pt"
            ? `⚠️ Importação concluída com avisos:\n\n${result.successfulImports} usuários foram importados com sucesso.\n${result.failedImports} falhas encontradas. Verifique os erros abaixo.`
            : `⚠️ Import completed with warnings:\n\n${result.successfulImports} users imported successfully.\n${result.failedImports} failures found. Check errors below.`
        );
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      alert("Erro ao importar CSV: " + (error as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppLayout>
      <BackButton to="/painel/admin" />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {language === "pt" ? "Gerenciar Usuários" : "Manage Users"}
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
            {language === "pt"
              ? "Cadastre usuários e atribua roles (ADMIN, INSTRUCTOR, STUDENT, USER)"
              : "Register users and assign roles (ADMIN, INSTRUCTOR, STUDENT, USER)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {isAdmin && (
            <button
              className="button button-secondary"
              onClick={() => {
                setShowCsvImport(!showCsvImport);
                setImportResult(null);
                setCsvFile(null);
              }}
            >
              {language === "pt" ? "📥 Importar Arquivo" : "📥 Import File"}
            </button>
          )}
          <button
            className="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
                setEditingUser(null);
              }
            }}
          >
            {showForm
              ? language === "pt"
                ? "Cancelar"
                : "Cancel"
              : language === "pt"
              ? "Novo Usuário"
              : "New User"}
          </button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Total de Usuários" : "Total Users"}
          </span>
          <strong>{users.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Usuários Ativos" : "Active Users"}
          </span>
          <strong>{users.filter((u) => u.isActive).length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Administradores" : "Administrators"}
          </span>
          <strong>{users.filter((u) => u.roles.includes("ADMIN")).length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">
            {language === "pt" ? "Instrutores" : "Instructors"}
          </span>
          <strong>{users.filter((u) => u.roles.includes("INSTRUCTOR")).length}</strong>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="panel" style={{ marginBottom: "24px" }}>
          <h2>{language === "pt" ? "Novo Usuário" : "New User"}</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Username" : "Username"}</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                className="form-input"
                placeholder="usuario.nome"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Email" : "Email"}</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="form-input"
                placeholder="usuario@exemplo.com"
              />
            </label>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>{language === "pt" ? "Nome Completo" : "Full Name"}</span>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="form-input"
                placeholder="João Silva"
              />
            </label>
            <label className="form-field">
              <span>{language === "pt" ? "Telefone" : "Phone"}</span>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="form-input"
                placeholder="+55 11 98765-4321"
              />
            </label>
          </div>
          <label className="form-field">
            <span>{language === "pt" ? "Senha" : "Password"}</span>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="form-input"
              placeholder="••••••••"
              minLength={6}
            />
          </label>
          <div className="form-field">
            <span>{language === "pt" ? "Roles" : "Roles"}</span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {AVAILABLE_ROLES.map((role) => (
                <label
                  key={role.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="button">
            {language === "pt" ? "Criar Usuário" : "Create User"}
          </button>
        </form>
      )}

      {showCsvImport && isAdmin && (
        <div className="panel" style={{ marginBottom: "24px" }}>
          <h2>{language === "pt" ? "Importar Usuários via CSV" : "Import Users via CSV"}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
            {language === "pt"
              ? "Faça upload de um arquivo CSV. O sistema converterá e persistirá os dados no banco de dados automaticamente."
              : "Upload a CSV file. The system will convert and persist the data in the database automatically."}
          </p>
          <div style={{ 
            padding: "12px", 
            background: "var(--bg-tertiary)", 
            borderRadius: "6px", 
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            <strong>{language === "pt" ? "Colunas obrigatórias:" : "Required columns:"}</strong> username, email, password, full_name<br/>
            <strong>{language === "pt" ? "Colunas opcionais:" : "Optional columns:"}</strong> phone_number, roles (separados por ; ou ,), is_active (true/false)
          </div>
          
          <div className="form-field" style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              {language === "pt" ? "Arquivo CSV" : "CSV File"}
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setCsvFile(file);
                  setImportResult(null);
                }
              }}
              style={{
                padding: "8px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                width: "100%",
              }}
            />
          </div>

          {csvFile && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>
              <strong>{language === "pt" ? "Arquivo selecionado:" : "Selected file:"}</strong> {csvFile.name}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="button"
              onClick={handleCsvImport}
              disabled={!csvFile || importing}
            >
              {importing
                ? language === "pt"
                  ? "Importando..."
                  : "Importing..."
                : language === "pt"
                ? "Importar"
                : "Import"}
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                setShowCsvImport(false);
                setCsvFile(null);
                setImportResult(null);
              }}
            >
              {language === "pt" ? "Cancelar" : "Cancel"}
            </button>
          </div>

          {importResult && (
            <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>
              <h3 style={{ marginBottom: "12px" }}>
                {language === "pt" ? "Resultado da Importação" : "Import Result"}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <strong>{language === "pt" ? "Total de linhas:" : "Total rows:"}</strong> {importResult.totalRows}
                </div>
                <div style={{ color: "var(--success)" }}>
                  <strong>{language === "pt" ? "Sucessos:" : "Success:"}</strong> {importResult.successfulImports}
                </div>
                <div style={{ color: "var(--error)" }}>
                  <strong>{language === "pt" ? "Falhas:" : "Failed:"}</strong> {importResult.failedImports}
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <strong style={{ color: "var(--error)" }}>
                    {language === "pt" ? "Erros encontrados:" : "Errors found:"}
                  </strong>
                  <div style={{ marginTop: "8px", maxHeight: "200px", overflowY: "auto" }}>
                    {importResult.errors.map((error, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px",
                          marginBottom: "4px",
                          background: "var(--bg-secondary)",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      >
                        <strong>Linha {error.rowNumber}</strong> - {error.field}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {editingUser && (
        <div className="panel" style={{ marginBottom: "24px" }}>
          <h2>
            {language === "pt" ? "Editar Roles de" : "Edit Roles of"}{" "}
            {editingUser.username}
          </h2>
          <div className="form-field">
            <span>{language === "pt" ? "Roles" : "Roles"}</span>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {AVAILABLE_ROLES.map((role) => (
                <label
                  key={role.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                  />
                  <span>{role.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button
              className="button"
              onClick={() => handleUpdateRoles(editingUser.id)}
            >
              {language === "pt" ? "Salvar" : "Save"}
            </button>
            <button className="button button-secondary" onClick={resetForm}>
              {language === "pt" ? "Cancelar" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>{language === "pt" ? "Carregando..." : "Loading..."}</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>{language === "pt" ? "ID" : "ID"}</th>
                <th>{language === "pt" ? "Username" : "Username"}</th>
                <th>{language === "pt" ? "Email" : "Email"}</th>
                <th>{language === "pt" ? "Nome Completo" : "Full Name"}</th>
                <th>{language === "pt" ? "Roles" : "Roles"}</th>
                <th>{language === "pt" ? "Status" : "Status"}</th>
                <th>{language === "pt" ? "Ações" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <strong>{user.username}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.fullName || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`status ${
                            role === "ADMIN"
                              ? "status-confirmed"
                              : role === "INSTRUCTOR"
                              ? "status-pending"
                              : "status-cancelled"
                          }`}
                          style={{ fontSize: "11px", padding: "2px 8px" }}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        user.isActive ? "status-confirmed" : "status-cancelled"
                      }`}
                    >
                      {user.isActive
                        ? language === "pt"
                          ? "Ativo"
                          : "Active"
                        : language === "pt"
                        ? "Inativo"
                        : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className="button button-small"
                        onClick={() => navigate(`/admin/usuarios/${user.id}`)}
                      >
                        {language === "pt" ? "Ver Detalhes" : "View Details"}
                      </button>
                      <button
                        className="button button-small"
                        onClick={() => openEditRoles(user)}
                      >
                        {language === "pt" ? "Editar Roles" : "Edit Roles"}
                      </button>
                      {!user.roles.includes("ADMIN") && (
                        <button
                          className="button button-small button-secondary"
                          onClick={() => handleDelete(user.id, user.username)}
                        >
                          {language === "pt" ? "Desativar" : "Deactivate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .table-container {
          overflow-x: auto;
          background: var(--bg-secondary);
          border-radius: 8px;
          padding: 16px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          color: var(--text-primary);
        }

        .data-table th {
          text-align: left;
          padding: 12px;
          font-weight: 600;
          border-bottom: 2px solid var(--border);
          color: var(--text-muted);
          font-size: 14px;
        }

        .data-table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .data-table tbody tr:hover {
          background: var(--bg-hover);
        }

        .button-small {
          padding: 6px 12px;
          font-size: 13px;
        }
      `}</style>
    </AppLayout>
  );
}

