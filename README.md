# TalentSol - The Modern Applicant Tracking System

TalentSol is an AI-powered applicant tracking system with machine learning features designed to streamline the recruitment process.

## About This Project

This is a hobbyist AI/machine learning related project using Augment Code as development partner, and is available on GitHub. TalentSol aims to revolutionize how companies manage their recruitment pipeline through intelligent candidate matching and workflow optimization.

The entire frontend development of this application was completed in just 1.5 days, showcasing the extreme efficiency of Augment Code Agent and Augment Code's Context Engine as development partner.

## Developer

**Aaron (Youshen) Lim**
- LinkedIn: [https://www.linkedin.com/in/youshen/](https://www.linkedin.com/in/youshen/)
- GitHub: [https://github.com/youshen-lim](https://github.com/youshen-lim)

## Technologies Used

This project is built with:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router
- Zustand (state management)

## Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/talentsol-ats.git
   cd talentsol-ats
   ```

2. Install dependencies
   ```bash
   npm install
   # or with legacy peer deps if needed
   npm install --legacy-peer-deps
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Recommended Project Structure

```
talentsol-ats/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── forms/           # Form components
│   │   ├── ml/              # ML-related components
│   │   └── dashboard/       # Dashboard-specific components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # General utilities
│   │   └── validation.ts    # Form validation
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── store/               # Zustand store
│   │   ├── index.ts         # Store exports
│   │   ├── auth-store.ts    # Authentication state
│   │   └── jobs-store.ts    # Jobs state
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── .eslintrc.js             # ESLint configuration
├── .gitignore               # Git ignore file
├── components.json          # Shadcn UI components config
├── package.json             # Project dependencies
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Development Guidelines

1. **TypeScript**: Use proper types for all components and functions
2. **Component Structure**: Keep components small and focused
3. **State Management**: Use Zustand for global state, React hooks for local state
4. **API Calls**: Centralize in the api.ts file or service modules
5. **Error Handling**: Use consistent error handling patterns
6. **Testing**: Write tests for critical functionality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Developed as a hobbyist project with Augment Code
- Frontend development completed in just 1.5 days
- Built with modern web technologies and best practices

