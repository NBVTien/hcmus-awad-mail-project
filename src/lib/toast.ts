export function showToast(message: string, opts?: { type?: 'success' | 'error' | 'info'; timeout?: number }) {
    const { type = 'info', timeout = 3000 } = opts || {};
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const root = document.createElement('div');
    root.id = id;
    root.style.position = 'fixed';
    root.style.right = '16px';
    root.style.bottom = '16px';
    root.style.zIndex = '9999';

    const bg = type === 'success' ? '#0f172a' : type === 'error' ? '#7f1d1d' : '#111827';
    const color = '#fff';

    root.innerHTML = `
    <div style="background:${bg};color:${color};padding:12px 16px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.2);max-width:320px;font-family:Inter,ui-sans-serif,system-ui;">
      ${message}
    </div>
  `;

    document.body.appendChild(root);

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, timeout);
}

export const showSuccess = (msg: string) => showToast(msg, { type: 'success' });
export const showError = (msg: string) => showToast(msg, { type: 'error' });
