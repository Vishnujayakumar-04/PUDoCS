import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../styles/colors';

const CustomPicker = ({ 
    selectedValue, 
    onValueChange, 
    items = [], 
    placeholder = 'Select...',
    style 
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedItem = items.find(item => item.value === selectedValue);

    return (
        <View>
            <TouchableOpacity
                style={[styles.pickerButton, style]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.pickerText}>
                    {selectedItem ? selectedItem.label : placeholder}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Option</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={(item, index) => `${item.value}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        selectedValue === item.value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onValueChange(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedValue === item.value && styles.selectedOptionText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedValue === item.value && (
                                        <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.gray100,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 44,
    },
    pickerText: {
        fontSize: 14,
        color: colors.textPrimary,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    selectedOption: {
        backgroundColor: colors.primary + '10',
    },
    optionText: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    selectedOptionText: {
        color: colors.primary,
        fontWeight: '600',
    },
});

export default CustomPicker;

