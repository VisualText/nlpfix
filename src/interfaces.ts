export interface AnaFile {
    name: string;
    description: string;
    folder: string;
    index: number;
  }
  
  export interface SeqFile {
    name: string;
    index: number;
    highlight: boolean;
    tree: boolean;
  }
  
  export interface ReadMeFile {
    firstLine: string;
    description: string;
  }
  