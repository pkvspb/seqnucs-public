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
    numText:   '#111',
    selection: '#fff',
};

const DARK_COLORS = {
    low:       '#FF4500',   //'OrangeRed',
    med:       '#FFD700',   //'Gold',
    high:      '#6495ED',   //'CornflowerBlue',
    mutation:  '#A0522D',   //'Sienna',
    text:      '#000',
    numText:   '#aaa',
    selection: '#fff',
};

// ── 3. Wire up the component ──────────────────────────────────────────────────
const statusEl = document.getElementById('seqnucs-status-id');

const seqNucs = initSeqNucs('seqnucs-container-id', peaks, LIGHT_COLORS, DARK_COLORS, (lo, hi) => {
    statusEl.textContent = `Selected: ${lo + 1}–${hi + 1}  (${hi - lo + 1} positions)`;
});

// ── 4. Color legend — left panel ───────────────────────────────────────────────
const LEGEND_ITEMS = [
    { key: 'low',      label: 'Low quality (Q < 10)' },
    { key: 'med',      label: 'Medium quality (10 ≤ Q < 30)' },
    { key: 'high',     label: 'High quality (Q ≥ 30)' },
    { key: 'mutation', label: 'Mutation (ambiguity code)' },
];

function renderLegend(colors) {
    const left = document.getElementById('left-id');
    left.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'legend-title';
    title.textContent = 'Color legend';
    left.appendChild(title);

    for (const { key, label } of LEGEND_ITEMS) {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const swatch = document.createElement('span');
        swatch.className = 'legend-swatch';
        swatch.style.background = colors[key];

        const text = document.createElement('span');
        text.textContent = label;

        item.append(swatch, text);
        left.appendChild(item);
    }
}

renderLegend(dark ? DARK_COLORS : LIGHT_COLORS);

// ── 5. Theme toggle button ────────────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle-id');
themeToggle.textContent = dark ? '☀️' : '🌙';
themeToggle.addEventListener('click', () => {
    dark = !dark;
    themeToggle.textContent = dark ? '☀️' : '🌙';
    document.documentElement.dataset.appliedMode = dark ? 'dark' : 'light';
    renderLegend(dark ? DARK_COLORS : LIGHT_COLORS);
    seqNucs.redraw();
});

// ── 6. Resizable left panel ───────────────────────────────────────────────────
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
