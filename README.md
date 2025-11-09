# omni-frontend

Aplicação front-end da plataforma Omni, construída com React 18, TypeScript e Vite. O projeto entrega dashboards administrativos, catálogo de cursos, gerenciamento de usuários e uma experiência responsiva com suporte a temas claro/escuro.

## Scripts principais

```bash
npm install        # instala dependências
npm run dev        # executa a aplicação em modo desenvolvimento
npm run build      # gera o build de produção
npm run preview    # serve o build gerado localmente
```

## Tecnologias e recursos

- React 18 + TypeScript + Vite
- React Router DOM para navegação
- Context API para autenticação, idioma e tema
- Fetch API para comunicação com os serviços (`src/api`)
- CSS Modules/variables para tematização e responsividade

# React + TypeScript + Vite

Este template fornece uma configuração mínima para trabalhar com React no Vite com HMR e algumas regras do ESLint.

Atualmente, dois plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Babel](https://babeljs.io/) (ou [oxc](https://oxc.rs) quando usado em [rolldown-vite](https://vite.dev/guide/rolldown)) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/) para Fast Refresh

## React Compiler

O React Compiler não está habilitado neste template por causa do impacto nas performances de desenvolvimento e build. Para adicioná-lo, veja [esta documentação](https://react.dev/learn/react-compiler/installation).

## Expandindo a configuração do ESLint

Se você está desenvolvendo uma aplicação de produção, recomendamos atualizar a configuração para habilitar regras de lint com conhecimento de tipos:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Outras configs...

      // Remova tseslint.configs.recommended e substitua por este
      tseslint.configs.recommendedTypeChecked,
      // Alternativamente, use este para regras mais rígidas
      tseslint.configs.strictTypeChecked,
      // Opcionalmente, adicione este para regras de estilo
      tseslint.configs.stylisticTypeChecked,

      // Outras configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // outras opções...
    },
  },
])
```

Você também pode instalar [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) e [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) para regras específicas do React:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Outras configs...
      // Habilite regras de lint para React
      reactX.configs['recommended-typescript'],
      // Habilite regras para React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // outras opções...
    },
  },
])
```
