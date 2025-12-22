import { Platform } from 'react-native';
import colors from './colors';

export const typography = {
    // Families
    default: Platform.select({ ios: 'System', android: 'Roboto' }),

    // Hierarchy
    h1: { fontSize: 28, fontWeight: '700', color: colors.gray900, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700', color: colors.gray900, letterSpacing: -0.5 },
    h3: { fontSize: 20, fontWeight: '600', color: colors.gray900 },
    h4: { fontSize: 18, fontWeight: '600', color: colors.gray900 },

    // Body
    body1: { fontSize: 16, lineHeight: 24, color: colors.gray700, fontWeight: '400' },
    body2: { fontSize: 14, lineHeight: 20, color: colors.gray600, fontWeight: '400' },

    // UI
    button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
    caption: { fontSize: 12, color: colors.gray500 },
    label: { fontSize: 14, fontWeight: '500', color: colors.gray700, marginBottom: 6 },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,

    // Specific
    gutter: 16,
    cardPadding: 16,
    screenPadding: 24,
    borderRadius: 12,
};

export const shadows = {
    soft: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    card: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
    },
};

export const layout = {
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: spacing.borderRadius,
        padding: spacing.cardPadding,
        ...shadows.card,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default {
    typography,
    spacing,
    shadows,
    layout,
};
