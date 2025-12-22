export const allocateSeatsLogic = (eligibleStudents, classrooms, examId) => {
    const totalStudents = eligibleStudents.length;

    if (totalStudents === 0) {
        throw new Error('No eligible students for this exam');
    }

    if (classrooms.length === 0) {
        throw new Error('No classrooms available');
    }

    // Sort classrooms by capacity (descending)
    // Assuming classroom objects have { _id, seatLayout: { rows, columns } }
    const sortedClassrooms = [...classrooms].sort((a, b) => {
        const capA = a.seatLayout.rows * a.seatLayout.columns;
        const capB = b.seatLayout.rows * b.seatLayout.columns;
        return capB - capA;
    });

    const hallAllocations = [];
    let studentIndex = 0;

    for (const classroom of sortedClassrooms) {
        if (studentIndex >= totalStudents) break;

        const { rows, columns } = classroom.seatLayout;
        const classroomCapacity = rows * columns;
        const allocatedSeats = [];

        // Allocate seats in this classroom
        for (let row = 1; row <= rows && studentIndex < totalStudents; row++) {
            for (let col = 1; col <= columns && studentIndex < totalStudents; col++) {
                const student = eligibleStudents[studentIndex];
                // Seat Number: A1, A2, ... B1, B2 ...
                const seatNumber = `${String.fromCharCode(64 + row)}${col}`;

                allocatedSeats.push({
                    studentId: student.id, // Firestore Doc ID
                    studentName: student.name,
                    registerNumber: student.registerNumber,
                    seatNumber,
                    row,
                    column: col
                });

                studentIndex++;
            }
        }

        if (allocatedSeats.length > 0) {
            hallAllocations.push({
                classroomId: classroom.id,
                classroomName: classroom.name,
                allocatedSeats,
                capacity: classroomCapacity,
                occupied: allocatedSeats.length
            });
        }
    }

    // Check if all students were allocated
    if (studentIndex < totalStudents) {
        // In a real app we might want to return partial allocation or throw error.
        // Throwing error for safety as per original logic.
        throw new Error(`Insufficient classroom capacity. ${totalStudents - studentIndex} students could not be allocated.`);
    }

    return {
        hallAllocations,
        isSeatsAllocated: true,
        updatedAt: new Date().toISOString()
    };
};
