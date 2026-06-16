import { initSeqNucs } from '../../lib/seqnucs.js';
import { getPeaksNamesAsync, getPeaksQualitiesAsync } from '../../api/mockSeqProcessedValues.js';

// ── 1. Data ──────────────────────────────────────────────────────────────────
// Build the peaks array from the mock API responses.
// Each peak is { nuc: string, number: number, quality: number }.

const [names, qualities] = await Promise.all([
    getPeaksNamesAsync(),
    getPeaksQualitiesAsync(),
]);

const peaks = names.map((nuc, i) => ({ nuc, number: i + 1, quality: qualities[i] }));

// ── 2. Theme ──────────────────────────────────────────────────────────────────
let dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
document.documentElement.dataset.appliedMode = dark ? 'dark' : 'light';

const LIGHT_COLORS = {
    low:       '#F8C9B9',
    med:       '#F9E7A8',
    high:      '#BFD7FF',
    mutation:  '#D9BEA3',
    text:      '#000',
    numText:   '#555',
    selection: '#fff',
};

const DARK_COLORS = {
    low:       '#543100',
    med:       '#484401',
    high:      '#012b49',
    mutation:  '#380101',
    text:      '#E0E0E0',
    numText:   '#999',
    selection: '#6b7988',
};

// ── 3. Wire up the component ──────────────────────────────────────────────────
const statusEl = document.getElementById('seqnucs-status-id');

const seqNucs = initSeqNucs('seqnucs-container-id', peaks, LIGHT_COLORS, DARK_COLORS, (lo, hi) => {
    statusEl.textContent = `Selected: ${lo + 1}–${hi + 1}  (${hi - lo + 1} positions)`;
});

// ── 4. Theme toggle button ────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle-id');
themeToggle.textContent = dark ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
    dark = !dark;
    themeToggle.textContent = dark ? '☀️' : '🌙';
    document.documentElement.dataset.appliedMode = dark ? 'dark' : 'light';
    seqNucs.redraw();
});

// ── 5. Resizable left panel ───────────────────────────────────────────────────
// Demonstrates that the viewer adapts to its container's size: the library's
// internal ResizeObserver picks up the new --left-width automatically.
initLeftPanelResize('left-resizer-id');

function initLeftPanelResize(resizerId, minPercent = 10, maxPercent = 70) {
    const resizer = document.getElementById(resizerId);
    let dragging = false;
    let rafId = null;

    resizer.addEventListener('mousedown', handleMouseDown);

    function handleMouseDown(e) {
        e.preventDefault();
        dragging = true;
        resizer.classList.add('active');
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!dragging) return;
        const percent = (e.clientX / window.innerWidth) * 100;
        const clamped = Math.min(Math.max(percent, minPercent), maxPercent);
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            document.documentElement.style.setProperty('--left-width', clamped + '%');
        });
    }

    function handleMouseUp() {
        dragging = false;
        resizer.classList.remove('active');
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
}
