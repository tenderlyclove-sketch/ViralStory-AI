import { useState, useEffect } from 'react';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { classNames } from '~/utils/classNames';

export function SettingsWindow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load from cookie
    const cookies = document.cookie.split('; ').reduce((acc, curr) => {
      const [key, val] = curr.split('=');
      acc[key] = decodeURIComponent(val || '');
      return acc;
    }, {} as Record<string, string>);
    
    if (cookies.openai_api_key) {
      setOpenaiKey(cookies.openai_api_key);
    }
  }, [open]);

  const saveKey = (val: string) => {
    setOpenaiKey(val);
    document.cookie = `openai_api_key=${encodeURIComponent(val)}; path=/; max-age=31536000`;
  };

  const isConnected = openaiKey.length > 0;

  return (
    <DialogRoot open={open}>
      <Dialog onBackdrop={onClose} onClose={onClose}>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription asChild>
          <div className="p-5 flex flex-col gap-6">
            
            <div className="flex flex-col gap-3">
              <h3 className="text-bolt-elements-textPrimary font-medium">Providers</h3>
              
              <div className="flex flex-col gap-2 p-4 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-bolt-elements-textPrimary">OpenAI</div>
                  {isConnected ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary text-xs font-medium border border-bolt-elements-borderColor">
                      Not configured
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-xs text-bolt-elements-textSecondary">
                    OpenAI API Key (for Codex mode)
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => saveKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary text-sm focus:outline-none focus:ring-1 focus:ring-bolt-elements-borderColor"
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary"
                    >
                      {showKey ? <div className="i-ph:eye-slash-fill" /> : <div className="i-ph:eye-fill" />}
                    </button>
                  </div>
                  <div className="text-xs text-bolt-elements-textTertiary mt-1">
                    Required for Codex mode. Get your key at <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="text-bolt-elements-textSecondary hover:underline">platform.openai.com</a>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </DialogDescription>
        <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
          <DialogButton type="primary" onClick={onClose}>
            Done
          </DialogButton>
        </div>
      </Dialog>
    </DialogRoot>
  );
}
