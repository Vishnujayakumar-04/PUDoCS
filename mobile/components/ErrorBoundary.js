import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import colors from '../styles/colors';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console or error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={64}
                            color={colors.error}
                            style={styles.icon}
                        />
                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.message}>
                            We're sorry, but something unexpected happened. Please try again.
                        </Text>

                        {__DEV__ && this.state.error && (
                            <ScrollView style={styles.errorDetails}>
                                <Text style={styles.errorTitle}>Error Details:</Text>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>
                                {this.state.errorInfo && (
                                    <>
                                        <Text style={styles.errorTitle}>Component Stack:</Text>
                                        <Text style={styles.errorText}>
                                            {this.state.errorInfo.componentStack}
                                        </Text>
                                    </>
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons
                                name="refresh"
                                size={20}
                                color={colors.white}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    icon: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: colors.gray100,
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        maxHeight: 200,
        width: '100%',
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.error,
        marginTop: 8,
        marginBottom: 4,
    },
    errorText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontFamily: 'monospace',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;

