import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

window.getEcho = () => {
    if (echoInstance) {
        return echoInstance;
    }

    const key = import.meta.env.VITE_PUSHER_APP_KEY;
    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1';

    if (!key) {
        console.warn('Realtime chat is disabled because Pusher is not configured.');
        return null;
    }

    echoInstance = new Echo({
        broadcaster: 'pusher',
        key,
        cluster,
        forceTLS: true,
    });

    window.Echo = echoInstance;

    return echoInstance;
};

window.disconnectEcho = () => {
    echoInstance?.disconnect();
    echoInstance = null;
    window.Echo = null;
};
