import { atom, map } from 'nanostores';

export type CodexStatus = 'idle' | 'running' | 'complete' | 'error';

export interface CodexTask {
  id: string;
  task: string;
  status: CodexStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export const codexModeEnabled = atom<boolean>(false);
export const codexStatus = atom<CodexStatus>('idle');
export const codexCurrentTask = atom<CodexTask | null>(null);
export const codexElapsedSeconds = atom<number>(0);
