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
  // type is optional for backward compatibility
  type?: 'word';
}

export interface Sentence {
  label: string; // The full sentence text
  words: Gesture[]; // Array of gesture objects, one for each word
}
