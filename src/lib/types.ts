
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
  label: string;
  samples: LandmarkData[][]; // An array of samples, where each sample is a sequence of landmark data captures
}
