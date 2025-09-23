export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type LandmarkData = Landmark[];

export interface Gesture {
  label: string;
  samples: LandmarkData[];
}
