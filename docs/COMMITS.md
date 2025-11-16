# Guia de Commits - Frontend

## Commits Realizados

### 1. Sistema de Ícones SVG Minimalistas
**Arquivos:**
- `src/components/Icons.tsx`

**Descrição:** Cria biblioteca de ícones SVG minimalistas para substituir emojis.

**Commit:**
```bash
git add src/components/Icons.tsx
git commit -m "feat: adiciona biblioteca de ícones SVG minimalistas

- Substitui emojis por ícones SVG consistentes
- Todos os ícones seguem mesmo padrão visual
- Melhora acessibilidade e controle de estilo"
```

### 2. Substituição de Emojis na Página Admin
**Arquivos:**
- `src/pages/AdminTimelinePage.tsx`
- `src/api/timeline.ts`

**Descrição:** Substitui emojis por ícones SVG na página de administração de timeline.

**Commit:**
```bash
git add src/pages/AdminTimelinePage.tsx src/api/timeline.ts
git commit -m "refactor: substitui emojis por ícones SVG na página AdminTimeline

- Usa ícones SVG ao invés de emojis
- Atualiza resposta da API de sync para incluir status
- Melhora feedback visual do botão de sincronização"
```

### 3. Documentação de Componentes
**Arquivos:**
- `docs/README.md`
- `docs/components/ICONS.md`

**Descrição:** Documentação do sistema de ícones.

**Commit:**
```bash
git add docs/
git commit -m "docs: adiciona documentação do sistema de ícones"
```

