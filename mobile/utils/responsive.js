/**
 * Responsive Utilities
 * Provides responsive sizing based on screen dimensions
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12/13/14 - 390x844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale size based on screen width
 */
export const scale = (size) => {
    const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(size * scaleFactor);
};

/**
 * Scale size based on screen height
 */
export const verticalScale = (size) => {
    const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
    return Math.round(size * scaleFactor);
};

/**
 * Moderate scale - less aggressive scaling
 */
export const moderateScale = (size, factor = 0.5) => {
    const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
    return size + (scaleFactor - 1) * size * factor;
};

/**
 * Get responsive font size
 */
export const getFontSize = (size) => {
    const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
    const scaledSize = size * scaleFactor;
    return Math.max(12, Math.min(scaledSize, size * 1.2)); // Clamp between 12 and 120% of original
};

/**
 * Get responsive padding
 */
export const getPadding = (size) => {
    return moderateScale(size, 0.5);
};

/**
 * Get responsive margin
 */
export const getMargin = (size) => {
    return moderateScale(size, 0.5);
};

/**
 * Check if device is small screen
 */
export const isSmallScreen = () => {
    return SCREEN_WIDTH < 375;
};

/**
 * Check if device is large screen
 */
export const isLargeScreen = () => {
    return SCREEN_WIDTH > 414;
};

/**
 * Get screen dimensions
 */
export const getScreenDimensions = () => {
    return {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        isSmall: isSmallScreen(),
        isLarge: isLargeScreen(),
    };
};

export default {
    scale,
    verticalScale,
    moderateScale,
    getFontSize,
    getPadding,
    getMargin,
    isSmallScreen,
    isLargeScreen,
    getScreenDimensions,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
};

