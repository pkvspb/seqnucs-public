import { useEffect, useRef } from 'react';
import { initSeqNucs } from '../../../lib/seqnucs.js';

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

export default function SeqNucsComponent({ peaks, theme, onSelectionChanged }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { unInit } = initSeqNucs(container.id, peaks, LIGHT_COLORS, DARK_COLORS, onSelectionChanged);

        return () => unInit();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- peaks identity is stable; theme triggers re-init for color update
    }, [peaks, theme]);

    return (
        <div
            ref={containerRef}
            id="seqnucs-container-id"
            className="nucs-container"
        />
    );
}
