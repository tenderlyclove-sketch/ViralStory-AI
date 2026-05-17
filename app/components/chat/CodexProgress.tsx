import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { codexStatus, codexCurrentTask, codexElapsedSeconds } from '~/lib/stores/codex';
import { classNames } from '~/utils/classNames';

const STATUS_MESSAGES = [
  'Reasoning through your codebase...',
  'Planning file changes...',
  'Writing implementation...',
  'Reviewing output...',
];

export function CodexProgress() {
  const status = useStore(codexStatus);
  const task = useStore(codexCurrentTask);
  const elapsed = useStore(codexElapsedSeconds);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [status]);

  if (status === 'idle') return <div className="invisible h-12" />;

  const isError = status === 'error';
  const isComplete = status === 'complete';

  return (
    <div className="absolute bottom-full left-0 w-full px-6 pb-2 z-10">
      <div
        className={classNames(
          'flex items-center gap-3 px-4 py-3 mx-auto max-w-chat rounded-lg border shadow-sm bg-bolt-elements-background-depth-2 backdrop-blur-md',
          isError ? 'border-red-500/50' : isComplete ? 'border-green-500/50' : 'border-bolt-elements-borderColor'
        )}
      >
        <div className="flex-shrink-0">
          {isError ? (
            <div className="i-ph:warning-circle-fill text-red-500 text-xl" />
          ) : isComplete ? (
            <div className="i-ph:check-circle-fill text-green-500 text-xl" />
          ) : (
            <div className="i-ph:spinner-gap animate-spin text-bolt-elements-textPrimary text-xl" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-baseline gap-2">
            <span
              className={classNames(
                'text-sm truncate',
                isError ? 'text-red-500' : isComplete ? 'text-green-500' : 'text-bolt-elements-textPrimary'
              )}
            >
              {task?.task || 'Processing task'}
            </span>
            <span className="text-xs text-bolt-elements-textTertiary flex-shrink-0">
              {isError ? 'Failed' : isComplete ? `Done · ${elapsed}s` : `Running · ${elapsed}s`}
            </span>
          </div>
          
          {status === 'running' && (
            <div className="text-xs text-bolt-elements-textSecondary mt-0.5">
              {STATUS_MESSAGES[messageIndex]}
            </div>
          )}
          
          {isError && task?.error && (
            <div className="text-xs text-red-400 mt-0.5 break-words">
              {task.error}
            </div>
          )}
        </div>

        {isError && (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('codex:retry'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <div className="i-ph:arrow-clockwise" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
