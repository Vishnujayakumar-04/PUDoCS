/**
 * Timetable Subject Color Mapping
 * Assigns consistent colors to subjects based on their codes
 */

import colors from '../styles/colors';

/**
 * Generate a color for a subject code
 * Uses consistent hashing to ensure same code always gets same color
 */
export const getSubjectColor = (subjectCode) => {
    if (!subjectCode) return colors.gray400;

    // Color mapping for I MSc CS subjects
    const colorMap = {
        'CSSC 421': '#3B82F6', // Blue - Modern Operating Systems
        'CSSC 422': '#10B981', // Green - Advanced Database Systems
        'CSSC 423': '#F59E0B', // Amber - OS Lab
        'CSSC 424': '#8B5CF6', // Purple - Database Lab
        'CSSC 433': '#EF4444', // Red - Optimization Techniques
        'CSEL 565': '#06B6D4', // Cyan - Social Network Analytics
        'CSEL 581': '#EC4899', // Pink - AI & Expert Systems
        // I MTECH DS subjects
        'CSDS751': '#6366F1', // Indigo - Machine Learning and Deep Learning
        'CSDS752': '#14B8A6', // Teal - Big Data Analytics
        'CSDS753L': '#F97316', // Orange - Security for DS Lab
        'CSDS753T': '#EAB308', // Yellow - Security for Data Science
        'CSDS754': '#A855F7', // Purple - Machine Learning Lab
        'CSDS755': '#22C55E', // Green - Big Data Analytics Lab
        'CSDS772': '#0EA5E9', // Sky Blue - Cloud Computing
        'CSDS777': '#F43F5E', // Rose - Computational Intelligence
    };

    return colorMap[subjectCode] || generateColorFromCode(subjectCode);
};

/**
 * Generate a color from subject code if not in predefined map
 */
const generateColorFromCode = (code) => {
    // Simple hash function to generate consistent color
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate color from hash
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Get color based on subject type
 */
export const getTypeColor = (type) => {
    const typeColors = {
        'Hardcore': colors.primary,
        'Softcore': colors.secondary,
        'Lab': colors.warning,
        'Lecture': colors.info,
    };

    return typeColors[type] || colors.gray400;
};

/**
 * Get light background color for subject (for cards)
 */
export const getSubjectBgColor = (subjectCode) => {
    const color = getSubjectColor(subjectCode);
    
    // Convert hex to rgba with low opacity
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    
    // For HSL colors, return a light version
    return color.replace('50%', '95%');
};

/**
 * Get text color (dark or light) based on background
 */
export const getContrastColor = (bgColor) => {
    // For light backgrounds, use dark text
    if (bgColor.includes('rgba') || bgColor.includes('95%')) {
        return colors.textPrimary;
    }
    return colors.white;
};

export default {
    getSubjectColor,
    getTypeColor,
    getSubjectBgColor,
    getContrastColor,
};

