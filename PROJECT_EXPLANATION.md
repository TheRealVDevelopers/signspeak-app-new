# SignSpeak Project Explanation

This document provides a comprehensive explanation of the SignSpeak application's codebase, architecture, and functionality. The purpose is to make the project structure and code more understandable for clients and team members who may not be familiar with the technical implementation.

## Project Overview

SignSpeak is a Next.js web application that translates Indian Sign Language (ISL) gestures into text using AI-powered gesture recognition. Users can train the system with custom gestures for words or sentences and then use their webcam to detect those gestures in real-time.

## Technology Stack

- **Frontend Framework**: Next.js 15 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: MediaPipe Tasks Vision for hand landmark detection
- **State Management**: React Hooks
- **Database**: IndexedDB (via idb library) for client-side storage
- **UI Components**: Custom UI library based on Radix UI and shadcn/ui
- **Additional Libraries**: 
  - Zod for schema validation
  - Lucide React for icons
  - Recharts for data visualization

## Project Structure (Reorganized)

After reorganization, the project follows a more intuitive structure:

```
signspeak-app/
├── frontend/                 # All frontend/UI related code
│   ├── components/           # Reusable UI components
│   │   ├── gesture/          # Gesture-specific components
│   │   ├── layout/           # Layout and structural components
│   │   ├── ui/               # Generic UI components (buttons, cards, etc.)
│   │   └── webcam/           # Webcam-related components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and types
│   └── pages/                # Application pages/routes
├── ai/                       # AI/ML related functionality
│   ├── flows/                # AI workflows and processes
│   └── models/               # ML models and configurations
├── data/                     # Data management and storage
├── public/                   # Static assets
│   └── models/               # Pre-trained models (if any)
└── docs/                     # Documentation files
```

## Detailed Component Breakdown

### Frontend Layer

#### Pages (`src/app`)

1. **Home Page** (`page.tsx`)
   - Main landing page with introduction to the application
   - Features showcase and navigation to detection/training pages
   - Contains hero section, features, how-it-works, and call-to-action sections

2. **Detection Page** (`detect/page.tsx`)
   - Real-time gesture detection interface
   - Uses the [GestureDetector](file:///c:/Users/pc/OneDrive/Documents/GitHub/Padma%20pro%20new/signspeak-app-new/src/components/gesture-detector.tsx#L103-310) component for core functionality

3. **Training Page** (`train/page.tsx`)
   - Interface for training new gestures (words or sentences)
   - Uses the [GestureTrainer](file:///c:/Users/pc/OneDrive/Documents/GitHub/Padma%20pro%20new/signspeak-app-new/src/components/gesture-trainer.tsx#L411-542) component for core functionality

#### Core Components

1. **GestureDetector** (`components/gesture-detector.tsx`)
   - Main component for real-time gesture detection
   - Integrates with webcam and MediaPipe for hand landmark detection
   - Implements K-Nearest Neighbors algorithm for gesture classification
   - Manages detection state, results display, and history tracking
   - Handles both single-word detection and sentence formation

2. **GestureTrainer** (`components/gesture-trainer.tsx`)
   - Component for training new gestures
   - Supports both word-level and sentence-level training
   - Provides sample capture interface with progress tracking
   - Manages trained gesture library with CRUD operations

3. **WebcamView** (`components/webcam-view.tsx`)
   - Handles webcam initialization and video streaming
   - Integrates with MediaPipe HandLandmarker for hand detection
   - Draws hand landmarks on canvas overlay
   - Provides landmark data to parent components

#### Hooks

1. **useGestures** (`hooks/use-gestures.ts`)
   - Manages word-level gesture data from IndexedDB
   - Provides functions for adding and deleting gestures

2. **useSentences** (`hooks/use-sentences.ts`)
   - Manages sentence-level gesture data from IndexedDB
   - Provides functions for adding and deleting sentence combinations

#### Utilities & Types

1. **Database** (`lib/db.ts`)
   - IndexedDB wrapper for client-side gesture storage
   - Separate stores for words and sentences
   - Provides CRUD operations for gesture data

2. **Types** (`lib/types.ts`)
   - TypeScript interfaces for landmarks, gestures, and sentences
   - Defines data structures used throughout the application

### AI/ML Layer

#### Flows

1. **Gesture Validation Tool** (`ai/flows/gesture-validation-tool.ts`)
   - Validates newly trained gestures
   - Uses KNN algorithm to compare new gestures with training data
   - Ensures quality control for trained gestures

2. **KNN Gesture Recognition** (`ai/flows/knn-gesture-recognition.ts`)
   - Implements K-Nearest Neighbors algorithm for gesture classification
   - Compares detected landmarks with trained gesture samples

3. **Multi-frame Verification** (`ai/flows/multi-frame-verification.ts`)
   - Verifies gesture consistency across multiple frames
   - Improves detection accuracy by analyzing temporal data

## Application Workflow

### Training Process

1. User navigates to the Training page
2. Chooses to train either a word or sentence
3. For words:
   - Enters word name and description
   - Captures 30 samples of the gesture
   - System normalizes landmark data
   - Saves gesture to IndexedDB
4. For sentences:
   - Enters sentence text
   - System breaks sentence into words
   - Captures gesture for each word in sequence
   - Associates words to form sentence pattern
   - Saves sentence to IndexedDB

### Detection Process

1. User navigates to Detection page
2. Grants camera permissions
3. System initializes MediaPipe HandLandmarker
4. Real-time hand landmark detection begins
5. Detected landmarks are processed through:
   - Normalization
   - KNN classification against trained gestures
   - Confidence scoring
6. Results displayed in real-time:
   - Single word detection
   - Sentence formation from sequential words
   - Detection history

## Data Flow

1. **Data Capture**:
   - Webcam captures video frames
   - MediaPipe detects hand landmarks (21 points per hand)
   - Landmark coordinates (x, y, z) sent to application

2. **Data Processing**:
   - Landmarks normalized to account for position/scale variations
   - KNN algorithm compares with trained samples
   - Confidence scores calculated

3. **Data Storage**:
   - Gestures stored in IndexedDB
   - Separated into words and sentences collections
   - Data persists between sessions

4. **Data Retrieval**:
   - Trained gestures loaded from IndexedDB on application start
   - Used for real-time classification
   - Displayed in training library

## Key Algorithms

### Landmark Normalization

To ensure consistent gesture recognition regardless of hand position, size, or orientation:

1. Calculate centroid of all landmarks
2. Center all landmarks around origin (0,0,0)
3. Scale landmarks to unit sphere for size invariance

### K-Nearest Neighbors (KNN)

For gesture classification:

1. Calculate Euclidean distance between detected landmarks and all trained samples
2. Select K nearest neighbors (typically K=3)
3. Vote among neighbors to determine predicted gesture
4. Calculate confidence as percentage of votes for winning gesture

### Sentence Detection

1. Maintain sequence of recently detected words
2. Compare sequence against trained sentence patterns
3. Match triggers sentence recognition
4. Timeout mechanism resets sequence after inactivity

## Performance Considerations

1. **Frame Rate Throttling**: Limits detection to 10 FPS to reduce CPU usage
2. **Confidence Threshold**: Filters out low-confidence detections (threshold: 0.8)
3. **Cooldown Periods**: Prevents rapid repeated detections of same gesture
4. **Client-side Storage**: Eliminates server roundtrips for gesture data
5. **GPU Acceleration**: MediaPipe utilizes GPU when available for landmark detection

## Future Enhancements

1. **Model Persistence**: Save trained models for faster loading
2. **Advanced ML Models**: Integration with TensorFlow.js for neural network classification
3. **Multi-user Support**: Cloud storage for sharing gesture libraries
4. **Gesture Analytics**: Track detection accuracy and user performance
5. **Mobile Optimization**: Touch-friendly interface and mobile camera API integration

## Getting Started for Developers

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Access application at `http://localhost:9002`
4. For AI development: `npm run genkit:dev`

## Troubleshooting

1. **Camera Not Working**: 
   - Check browser permissions
   - Ensure HTTPS in production (camera requires secure context)
   - Verify no other applications are using camera

2. **Poor Detection Accuracy**:
   - Ensure good lighting conditions
   - Position hand clearly in frame
   - Train with diverse gesture samples

3. **Application Not Loading**:
   - Check browser console for errors
   - Verify all dependencies installed
   - Clear browser cache and IndexedDB storage