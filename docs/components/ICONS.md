# Sistema de Ícones

## Visão Geral

O sistema de ícones utiliza SVG minimalistas para manter consistência visual em toda a aplicação.

## Biblioteca de Ícones

Todos os ícones estão em `src/components/Icons.tsx` e seguem o mesmo padrão:

- Stroke width: 2
- Line cap: round
- Line join: round
- Tamanho padrão: 24x24

## Ícones Disponíveis

### SyncIcon
Ícone de sincronização (setas circulares)

### CalendarIcon
Ícone de calendário

### TrophyIcon
Ícone de troféu/campeonato

### EventIcon
Ícone de evento (círculo com ponteiro)

### LocationIcon
Ícone de localização (pin)

### ClockIcon
Ícone de relógio/horário

### MoneyIcon
Ícone de dinheiro/valor

### CheckIcon
Ícone de check/confirmação

### XIcon
Ícone de fechar/cancelar

### PlusIcon
Ícone de adicionar

### EditIcon
Ícone de editar

### TrashIcon
Ícone de deletar

### LoadingIcon
Ícone de carregamento

## Uso

```tsx
import { TrophyIcon, CalendarIcon } from "../components/Icons";

<TrophyIcon size={24} className="icon-trophy" />
<CalendarIcon size={32} style={{ color: "var(--accent-primary)" }} />
```

## Substituição de Emojis

Todos os emojis foram substituídos por ícones SVG para:
- Consistência visual
- Melhor controle de estilo
- Melhor acessibilidade
- Performance (sem dependência de fontes de emoji)

