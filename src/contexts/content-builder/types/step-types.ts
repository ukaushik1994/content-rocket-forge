
export interface Step {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
  analyzed?: boolean;
  disabled?: boolean;
  locked?: boolean;
  requiresPreviousCompletion?: boolean;
}
