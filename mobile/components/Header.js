import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { getPadding, getFontSize, moderateScale } from '../utils/responsive';

const Header = ({ title, subtitle, showBack = true }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.header}>
            <View style={styles.row}>
                {showBack && (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={moderateScale(24)} color={colors.white} />
                    </TouchableOpacity>
                )}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {showBack && <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.primary,
        paddingTop: getPadding(40),
        paddingBottom: getPadding(16),
        paddingHorizontal: getPadding(16),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: getPadding(8),
        marginLeft: -getPadding(8),
        width: moderateScale(40),
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: getFontSize(20),
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: getFontSize(13),
        color: colors.white,
        opacity: 0.9,
        marginTop: getPadding(2),
        textAlign: 'center',
    },
    placeholder: {
        width: moderateScale(40),
    },
});

export default Header;
