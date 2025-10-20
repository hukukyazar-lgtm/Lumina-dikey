declare module '@google/genai' {
  export type Modality = any;
  export type Type = any;
  export class GoogleGenAI {
    constructor(opts: { apiKey?: string });
    models: any;
  }
  export default GoogleGenAI;
}
