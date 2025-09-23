# **App Name**: SignSpeak

## Core Features:

- Gesture Training: Allows users to input a word/sentence and capture multiple hand landmark samples via webcam to train the app for gesture recognition.
- Offline Storage: Stores trained gesture data (hand landmarks) locally within the browser using IndexedDB for 100% offline functionality.
- KNN Gesture Recognition: Uses a K-Nearest Neighbors algorithm to compare real-time hand landmark data from the webcam to stored, trained samples, and identify the gesture.
- Real-time Detection Display: Displays the recognized word/sentence and confidence percentage in a clear, large format based on the KNN output, providing immediate feedback.
- Hand Landmark Overlay: Overlays hand landmarks on the webcam feed during training to guide hand positioning and ensure accurate data capture, as well as to provide a check during live detection.
- Gesture Validation Tool: A tool that confirms gestures are recognized correctly right after training, and allows a quick retry to improve the training set.
- Multi-frame Verification: A tool which requires consistent gesture detection across multiple frames (e.g., 3 frames) to minimize false positives and ensure a smooth user experience.

## Style Guidelines:

- Primary color: HSL-based blue (#4285F4 converted to RGB) to evoke trust and clarity.
- Background color: Very light blue (#E3F2FD converted to RGB) for a clean and accessible interface.
- Accent color: Analogous purple (#673AB7 converted to RGB) to highlight important elements.
- Body and headline font: 'PT Sans' (sans-serif) for a modern and readable interface.
- Simple two-page layout: Training page and detection page, easily navigable.
- Use simple, clear icons for actions like 'Capture Gesture,' 'Delete,' and navigation.
- Subtle animations for feedback, like a loading indicator during landmark processing or a success animation after gesture validation.