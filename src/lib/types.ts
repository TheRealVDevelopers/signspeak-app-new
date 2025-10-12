
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type LandmarkData = Landmark[];

export interface Gesture {
  label: string;
  description: string;
  samples: LandmarkData[];
  type: 'word';
}

export interface SentenceGesture {
  label: string; // The word this gesture represents, e.g., "Good"
  samples: LandmarkData[];
}

export interface Sentence {
  label: string; // The full sentence, e.g., "Good Morning"
  gestures: SentenceGesture[]; // The sequence of gestures that make up the sentence
}
