import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

// Simple pie chart component (no SVG dependency)
const PieChart = ({ data, size = 120 }) => {
    return <SimplePieChart data={data} size={size} />;
};

// Simple pie chart using View components (circular visual representation)
export const SimplePieChart = ({ data, size = 120 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <View style={[styles.simpleContainer, { width: size, height: size }]}>
                <Text style={styles.emptyText}>No Data</Text>
            </View>
        );
    }

    // Calculate percentages
    const segments = data.map((item) => {
        const percentage = (item.value / total) * 100;
        return {
            ...item,
            percentage: percentage.toFixed(1),
        };
    });

    return (
        <View style={[styles.simpleContainer, { width: size, height: size }]}>
            {/* Circular container with segments */}
            <View style={[styles.chartContainer, { width: size, height: size, borderRadius: size / 2 }]}>
                {/* Create segments using colored bars arranged in a circle */}
                {segments.map((segment, index) => {
                    const percentage = parseFloat(segment.percentage);
                    const prevPercentage = segments.slice(0, index).reduce((sum, s) => sum + parseFloat(s.percentage), 0);
                    
                    // Calculate rotation for this segment
                    const rotation = prevPercentage * 3.6; // Convert percentage to degrees
                    
                    return (
                        <View
                            key={index}
                            style={[
                                styles.segment,
                                {
                                    width: `${percentage}%`,
                                    height: '100%',
                                    backgroundColor: segment.color,
                                    position: 'absolute',
                                    left: `${prevPercentage}%`,
                                }
                            ]}
                        />
                    );
                })}
            </View>
            {/* Center circle with total */}
            <View style={styles.centerCircle}>
                <Text style={styles.centerText}>{total}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    simpleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    chartContainer: {
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
    },
    segment: {
        height: '100%',
    },
    centerCircle: {
        position: 'absolute',
        width: '60%',
        height: '60%',
        borderRadius: 1000,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    centerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    emptyText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default PieChart;
