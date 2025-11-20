# SignSpeak - Reorganized Structure

This is a reorganized version of the SignSpeak application with a clearer, more intuitive folder structure for better understanding by clients and team members.

## New Project Structure

```
signspeak-app/
├── app/                      # Next.js app router pages (required by Next.js)
├── frontend/                 # All frontend/UI related code
│   ├── components/           # Reusable UI components
│   │   ├── gesture/          # Gesture-specific components
│   │   ├── layout/           # Layout and structural components
│   │   ├── ui/               # Generic UI components (buttons, cards, etc.)
│   │   └── webcam/           # Webcam-related components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utility functions and types
├── ai/                       # AI/ML related functionality
│   ├── flows/                # AI workflows and processes
│   └── models/               # ML models and configurations
├── data/                     # Data management and storage
├── public/                   # Static assets
│   └── models/               # Pre-trained models (if any)
└── docs/                     # Documentation files
```

## Detailed Structure Explanation

### App Directory

The app directory contains all Next.js pages and routes as required by the Next.js App Router:

- **detect/**: Gesture detection page
- **train/**: Gesture training page
- **page.tsx**: Main homepage
- **layout.tsx**: Root layout component
- **globals.css**: Global CSS styles

### Frontend Directory

The frontend directory contains all user interface related code:

- **components/**: Reusable UI components organized by functionality
  - **gesture/**: Components specifically for gesture detection and training
  - **layout/**: Components for page layout and structure
  - **ui/**: Generic UI components like buttons, cards, etc.
  - **webcam/**: Components related to webcam functionality

- **hooks/**: Custom React hooks for state management and reusable logic

- **lib/**: Utility functions, types, and database interactions

### AI Directory

The ai directory contains all artificial intelligence and machine learning related code:

- **flows/**: AI workflows and processes for gesture recognition and validation

- **models/**: Machine learning models and configurations

### Data Directory

The data directory is intended for data management and storage utilities.

### Public Directory

The public directory contains static assets that are served directly by the web server.

### Docs Directory

The docs directory contains documentation files for the project.

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Access application at `http://localhost:9002`

## Additional Documentation

For a detailed explanation of the codebase, please refer to the [PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md) file.