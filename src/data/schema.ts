export type ChunkType =
  | 'summary' | 'experience' | 'project' | 'skill' | 'capability' | 'ai-practice';

export interface Identity { name: string; role: string; direction: string; }
export interface SubProject {
  id: string; name: string;
  responsibilities: string[]; technology: string[]; themes: string[];
}
export interface Experience {
  id: string; company: string; role: string; period: string;
  subProjects: SubProject[];
}
export interface AcademicProject {
  id: string; name: string; institution: string; year: number;
  overview: string; technology: string[]; development: string[]; concepts: string[];
}
export interface SkillGroup { id: string; category: string; items: string[]; }
export interface Flow { id: string; name: string; steps: string[]; context?: string; }
export interface AiPractice {
  id: string; name: string; description: string; bullets: string[];
  tools: string[]; usage: string[]; workflowSteps: string[];
}
export interface Profile {
  identity: Identity; positioning: string; narrative: Flow;
  experience: Experience[]; academicProjects: AcademicProject[];
  skills: SkillGroup[]; capabilities: Flow[]; aiPractices: AiPractice[];
}
