import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    safeArea: {
        flex: 1,
        backgroundColor: colors.primary,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },

    cardSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },

    button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },

    buttonSecondary: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
    },

    buttonSecondaryText: {
        color: colors.primary,
    },

    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.textPrimary,
    },

    inputFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
    },

    header: {
        backgroundColor: colors.primary,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },

    headerSubtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
        marginTop: 4,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    spaceBetween: {
        justifyContent: 'space-between',
    },

    centered: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    shadow: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },

    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.white,
    },

    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },

    scrollContent: {
        padding: 16,
    },
});
