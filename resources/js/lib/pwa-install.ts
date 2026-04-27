export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Listener = (prompt: BeforeInstallPromptEvent | null) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();

const notifyListeners = () => {
    listeners.forEach((listener) => listener(deferredPrompt));
};

export const getPwaInstallPrompt = () => deferredPrompt;

export const subscribeToPwaInstallPrompt = (listener: Listener) => {
    listeners.add(listener);
    listener(deferredPrompt);

    return () => listeners.delete(listener);
};

export const clearPwaInstallPrompt = () => {
    deferredPrompt = null;
    notifyListeners();
};

export const registerPwaInstallPromptHandlers = () => {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        notifyListeners();
    });

    window.addEventListener('appinstalled', () => {
        clearPwaInstallPrompt();
    });
};
