import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { staffService } from '../../services/staffService';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import colors from '../../styles/colors';

const StaffSeatAllocation = ({ route }) => {
    const { exam } = route?.params || {};
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isLocked, setIsLocked] = useState(exam?.isSeatsLocked || false);

    if (!exam) {
        return (
            <SafeAreaView style={styles.container}>
                <Header title="Seat Allocation" subtitle="Movie-Ticket Style" />
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🪑</Text>
                    <Text style={styles.emptyText}>
                        Create an exam and allocate seats to view the seat map
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const handleLockSeats = async () => {
        Alert.alert(
            'Lock Seat Allocation',
            'Once locked, seat allocations cannot be changed. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Lock',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await staffService.lockSeats(exam._id);
                            setIsLocked(true);
                            Alert.alert('Success', 'Seat allocation locked successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to lock seats');
                        }
                    },
                },
            ]
        );
    };

    const renderSeatMap = (hallAllocation) => {
        const { classroom, allocatedSeats, capacity, occupied } = hallAllocation;
        const { rows, columns } = classroom.seatLayout;

        return (
            <View key={classroom._id} style={styles.hallContainer}>
                <Card>
                    <View style={styles.hallHeader}>
                        <Text style={styles.hallName}>{classroom.name}</Text>
                        <Text style={styles.hallBuilding}>{classroom.building}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Capacity</Text>
                            <Text style={styles.statValue}>{capacity}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Occupied</Text>
                            <Text style={styles.statValue}>{occupied}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Available</Text>
                            <Text style={styles.statValue}>{capacity - occupied}</Text>
                        </View>
                    </View>

                    <View style={styles.screenContainer}>
                        <View style={styles.screen}>
                            <Text style={styles.screenText}>SCREEN / BOARD</Text>
                        </View>
                    </View>

                    <View style={styles.seatMapContainer}>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <View key={rowIndex} style={styles.seatRow}>
                                <Text style={styles.rowLabel}>
                                    {String.fromCharCode(65 + rowIndex)}
                                </Text>
                                {Array.from({ length: columns }).map((_, colIndex) => {
                                    const seatNumber = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
                                    const allocatedSeat = allocatedSeats.find(
                                        s => s.seatNumber === seatNumber
                                    );

                                    return (
                                        <TouchableOpacity
                                            key={colIndex}
                                            style={[
                                                styles.seat,
                                                allocatedSeat && styles.seatOccupied,
                                                isLocked && styles.seatLocked,
                                            ]}
                                            disabled={isLocked}
                                        >
                                            <Text
                                                style={[
                                                    styles.seatText,
                                                    allocatedSeat && styles.seatTextOccupied,
                                                ]}
                                            >
                                                {seatNumber}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, styles.seatAvailable]} />
                            <Text style={styles.legendText}>Available</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, styles.seatOccupied]} />
                            <Text style={styles.legendText}>Allocated</Text>
                        </View>
                        {isLocked && (
                            <View style={styles.legendItem}>
                                <Text style={styles.lockedBadge}>🔒 Locked</Text>
                            </View>
                        )}
                    </View>
                </Card>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Seat Allocation"
                subtitle={`${exam.name} - ${exam.subject}`}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <Text style={styles.examTitle}>{exam.name}</Text>
                    <Text style={styles.examSubject}>{exam.subject}</Text>
                    <Text style={styles.examDate}>
                        📅 {new Date(exam.date).toLocaleDateString()} at {exam.startTime}
                    </Text>
                    <Text style={styles.examInfo}>
                        {exam.course} - {exam.program} - Year {exam.year}
                    </Text>
                </Card>

                {exam.hallAllocations && exam.hallAllocations.length > 0 ? (
                    <>
                        {exam.hallAllocations.map(renderSeatMap)}

                        {!isLocked && (
                            <Button
                                title="🔒 Lock Seat Allocation"
                                onPress={handleLockSeats}
                                style={styles.lockButton}
                            />
                        )}
                    </>
                ) : (
                    <Card>
                        <Text style={styles.noSeatsText}>
                            No seats allocated yet. Go back and allocate seats first.
                        </Text>
                    </Card>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    examTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    examSubject: {
        fontSize: 16,
        color: colors.secondary,
        marginBottom: 8,
    },
    examDate: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    examInfo: {
        fontSize: 12,
        color: colors.textLight,
    },
    hallContainer: {
        marginBottom: 16,
    },
    hallHeader: {
        marginBottom: 12,
    },
    hallName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    hallBuilding: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: colors.gray50,
        borderRadius: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    screenContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    screen: {
        width: '80%',
        paddingVertical: 8,
        backgroundColor: colors.gray200,
        borderRadius: 4,
        alignItems: 'center',
    },
    screenText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    seatMapContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    seatRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'center',
    },
    rowLabel: {
        width: 24,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textAlign: 'center',
    },
    seat: {
        width: 40,
        height: 40,
        margin: 4,
        backgroundColor: colors.success,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    seatAvailable: {
        backgroundColor: colors.success,
    },
    seatOccupied: {
        backgroundColor: colors.error,
    },
    seatLocked: {
        opacity: 0.7,
    },
    seatText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.white,
    },
    seatTextOccupied: {
        color: colors.white,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray300,
    },
    legendText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    lockedBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.warning,
    },
    lockButton: {
        marginTop: 16,
        marginBottom: 32,
    },
    noSeatsText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default StaffSeatAllocation;
