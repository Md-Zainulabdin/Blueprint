export interface BlueprintResponse {
  executiveSummary: ExecutiveSummary;
  architecture: SystemArchitecture;
  agents: AgentConfiguration[];
  generatedAt: string;
}

export interface ExecutiveSummary {
  title: string;
  problemStatement: string;
  solutionOverview: string;
  expectedImpact: string[];
  keyStakeholders: string[];
}

export interface SystemArchitecture {
  description: string;
  components: ArchitectureComponent[];
  dataFlow: DataFlowStep[];
}

export interface ArchitectureComponent {
  name: string;
  role: string;
  technology: string;
  description: string;
}

export interface DataFlowStep {
  from: string;
  to: string;
  action: string;
  dataType: string;
}

export interface AgentConfiguration {
  id: string;
  name: string;
  role: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  inputs: string[];
  outputs: string[];
  triggers: string[];
}

export interface ResearchQuery {
  query: string;
  rationale: string;
}

export interface PipelineStage {
  name: string;
  status: "pending" | "running" | "done" | "failed";
  error?: string;
}

export type StageCallback = (stage: PipelineStage) => void;

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}
