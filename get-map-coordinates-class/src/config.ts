import { ImmutableObject } from "seamless-immutable"

export interface Config {
  showScale: boolean;
  showZoom: boolean;
  showTilt: boolean;
  showRotation: boolean;
}

export type IMConfig = ImmutableObject<Config>
