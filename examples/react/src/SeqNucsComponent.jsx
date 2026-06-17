import { useEffect, useRef } from 'react';
import { initSeqNucs } from '../../../lib/seqnucs.js';

export const LIGHT_COLORS = {
    low:       'OrangeRed',
    med:       'Gold',
    high:      'CornflowerBlue',
    mutation:  'SaddleBrown',
    text:      '#000',
    numText:   '#555',
    selection: '#fff',
};

export const DARK_COLORS = {
    low:       'OrangeRed',
    med:       'Gold',
    high:      'CornflowerBlue',
    mutation:  'SaddleBrown',
    text:      '#000',
    numText:   '#777',
    selection: '#fff',
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
