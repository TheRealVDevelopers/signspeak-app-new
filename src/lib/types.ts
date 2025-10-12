
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

export interface Sentence {
  label: string; // The full sentence text
  samples: LandmarkData[][]; // An array of samples. Each sample is an array of gestures (LandmarkData).
}
