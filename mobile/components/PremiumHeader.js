import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import colors from '../styles/colors';
import staffImages from '../assets/staffImages';
import { moderateScale, getFontSize, getPadding, getMargin } from '../utils/responsive';

const PremiumHeader = ({ title, subtitle, showAvatar = false, onAvatarPress, user, profile, showNotification = false, onNotificationPress, notificationCount = 0 }) => {
    // Get photo source from user or profile
    const getPhotoSource = () => {
        // Check if profile has imageKey (for staff photos)
        if (profile?.imageKey && staffImages[profile.imageKey]) {
            return staffImages[profile.imageKey];
        }
        // Check user.profile for imageKey
        if (user?.profile?.imageKey && staffImages[user.profile.imageKey]) {
            return staffImages[user.profile.imageKey];
        }
        // Check if profile has photoUrl or photo
        if (profile?.photoUrl) {
            return { uri: profile.photoUrl };
        }
        if (profile?.photo) {
            return typeof profile.photo === 'string' ? { uri: profile.photo } : profile.photo;
        }
        // Check user.profile for photo
        if (user?.profile?.photoUrl) {
            return { uri: user.profile.photoUrl };
        }
        if (user?.profile?.photo) {
            return typeof user.profile.photo === 'string' ? { uri: user.profile.photo } : user.profile.photo;
        }
        // Check Firebase Auth photoURL
        if (user?.photoURL) {
            return { uri: user.photoURL };
        }
        // Default photo if no photo is found
        return require('../assets/Vishnu/VISHNU PHOTO.jpeg');
    };

    const photoSource = getPhotoSource();

    return (
        <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    <View style={styles.rightContainer}>
                        {showNotification && (
                            <TouchableOpacity
                                onPress={onNotificationPress}
                                style={styles.notificationButton}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons 
                                    name="bell-outline" 
                                    size={moderateScale(24)} 
                                    color={colors.white} 
                                />
                                {notificationCount > 0 && (
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationBadgeText}>
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        {showAvatar && (
                            <TouchableOpacity
                                onPress={onAvatarPress}
                                style={styles.avatarButton}
                                activeOpacity={0.8}
                            >
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={photoSource}
                                        style={styles.avatarImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        paddingBottom: getPadding(20),
        borderBottomLeftRadius: moderateScale(24),
        borderBottomRightRadius: moderateScale(24),
    },
    safeArea: {
        width: '100%',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getPadding(20),
        paddingTop: getPadding(8),
        minHeight: moderateScale(60),
    },
    textContainer: {
        flex: 1,
        marginRight: getPadding(12),
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getMargin(12),
    },
    notificationButton: {
        position: 'relative',
        padding: getPadding(8),
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.error,
        borderRadius: moderateScale(10),
        minWidth: moderateScale(20),
        height: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    notificationBadgeText: {
        color: colors.white,
        fontSize: getFontSize(10),
        fontWeight: 'bold',
    },
    title: {
        fontSize: getFontSize(24),
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: 0.5,
        lineHeight: getFontSize(30),
    },
    subtitle: {
        fontSize: getFontSize(14),
        color: colors.white,
        opacity: 0.9,
        marginTop: getPadding(4),
        fontWeight: '400',
        lineHeight: getFontSize(18),
    },
    avatarButton: {
        marginLeft: getMargin(16),
    },
    avatarContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(18),
    },
});

PremiumHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    showAvatar: PropTypes.bool,
    onAvatarPress: PropTypes.func,
    user: PropTypes.object,
    profile: PropTypes.object,
    showNotification: PropTypes.bool,
    onNotificationPress: PropTypes.func,
    notificationCount: PropTypes.number,
};

PremiumHeader.defaultProps = {
    subtitle: null,
    showAvatar: false,
    onAvatarPress: null,
    user: null,
    profile: null,
    showNotification: false,
    onNotificationPress: null,
    notificationCount: 0,
};

export default PremiumHeader;

