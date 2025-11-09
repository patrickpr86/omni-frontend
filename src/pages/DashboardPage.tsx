import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

function resolveDefaultPath(roles: string[] | undefined) {
  if (!roles || roles.length === 0) {
    return "/conteudos";
  }

  if (roles.includes("ADMIN")) {
    return "/painel/admin";
  }

  if (roles.includes("TEACHER")) {
    return "/painel/instrutor";
  }

  if (roles.includes("STUDENT")) {
    return "/painel/aluno";
  }

  return "/conteudos";
}

export function DashboardPage() {
  const { user } = useAuth();
  const target = resolveDefaultPath(user?.roles);
  return <Navigate to={target} replace />;
}
