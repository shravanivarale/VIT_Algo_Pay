import { Buffer } from 'buffer';

declare global {
    interface Window {
        global: any;
        Buffer: any;
    }
}

if (typeof window !== 'undefined') {
    window.global = window;
    window.Buffer = Buffer;
}
