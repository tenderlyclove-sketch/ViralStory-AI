import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { codexModeEnabled } from '~/lib/stores/codex';

export function CodexModeToggle() {
  const isEnabled = useStore(codexModeEnabled);

  return (
    <button
      onClick={() => codexModeEnabled.set(!isEnabled)}
      className={classNames(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all mr-2',
        isEnabled
          ? 'ring-1 ring-green-500/50 bg-green-500/10 text-green-400'
          : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
      )}
      title="Codex mode uses OpenAI's reasoning model for complex tasks. Takes 30–120 seconds."
    >
      {isEnabled ? (
        <>
          <div className="i-ph:robot-fill" />
          Codex
        </>
      ) : (
        <>
          <div className="i-ph:lightning-fill" />
          Instant
        </>
      )}
    </button>
  );
}
