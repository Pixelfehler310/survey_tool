/**
 * useBranding - Hook to apply survey branding (white-labeling)
 */

import { useEffect } from 'react';

export default function useBranding(survey) {
    useEffect(() => {
        if (!survey?.branding) {
            // Reset to defaults if no branding
            document.documentElement.style.removeProperty('--color-primary');
            document.documentElement.style.removeProperty('--color-primary-dark');
            return;
        }

        const branding = survey.branding;

        // Apply primary color
        if (branding.primary_color) {
            document.documentElement.style.setProperty('--color-primary', branding.primary_color);

            // Generate darker shade for hover states
            const darkColor = adjustColor(branding.primary_color, -20);
            document.documentElement.style.setProperty('--color-primary-dark', darkColor);
        }

        // Apply font family
        if (branding.font_family) {
            // Load Google Font if it's a known font
            if (!document.querySelector(`link[href*="${branding.font_family}"]`)) {
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${branding.font_family.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }

            document.documentElement.style.setProperty('--font-family', `"${branding.font_family}", system-ui, sans-serif`);
        }

        return () => {
            // Cleanup on unmount
            document.documentElement.style.removeProperty('--color-primary');
            document.documentElement.style.removeProperty('--color-primary-dark');
            document.documentElement.style.removeProperty('--font-family');
        };
    }, [survey]);
}

/**
 * Adjust color brightness
 */
function adjustColor(color, amount) {
    const clamp = (val) => Math.min(Math.max(val, 0), 255);

    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust
    const newR = clamp(r + amount);
    const newG = clamp(g + amount);
    const newB = clamp(b + amount);

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
