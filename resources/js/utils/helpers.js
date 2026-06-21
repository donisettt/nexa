export function setFormValue(setForm) {
    return (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };
}

export function readErrors(error) {
    const responseErrors = error.response?.data?.errors;

    if (!responseErrors) {
        return {
            email: error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.',
        };
    }

    return Object.fromEntries(
        Object.entries(responseErrors).map(([key, messages]) => [key, messages[0]])
    );
}

export function readErrorMessage(error) {
    return error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

export function formatDateTime(value) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function syncCsrfToken(token) {
    if (!token) {
        return;
    }

    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    document.head.querySelector('meta[name="csrf-token"]')?.setAttribute('content', token);
}
