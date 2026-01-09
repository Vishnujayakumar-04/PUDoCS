// Default subjects for different programs
// This ensures students always see their subjects even if marks/attendance data is not yet available

export const DEFAULT_SUBJECTS = {
    'M.Tech DS': {
        'I': [
            {
                code: 'CSDS751',
                name: 'Machine Learning and Deep Learning',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr M SATHYA'
            },
            {
                code: 'CSDS752',
                name: 'Big Data Analytics',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. AMRITHA SARAVANAN'
            },
            {
                code: 'CSDS753L',
                name: 'Security for DS Lab',
                type: 'Hardcore',
                hours: 2,
                faculty: 'Dr T CHITHRALEKHA'
            },
            {
                code: 'CSDS753T',
                name: 'Security for Data Science',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr T CHITHRALEKHA'
            },
            {
                code: 'CSDS754',
                name: 'Laboratory - III (Machine Learning Lab)',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr M SATHYA'
            },
            {
                code: 'CSDS755',
                name: 'Laboratory - IV (Big Data Analytics Lab)',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. JEYAKODI'
            },
            {
                code: 'CSDS772',
                name: 'Cloud Computing',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr SKV JAYAKUMAR'
            },
            {
                code: 'CSDS777',
                name: 'Computational Intelligence',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr K SURESH JOSEPH'
            }
        ]
    },
    'M.Tech CSE': {
        'I': [
            {
                code: 'CSCE 621',
                name: 'Graph Theory with Applications to Engineering',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr S SIVA SATHYA'
            },
            {
                code: 'CSCE 623',
                name: 'Data Mining and Big Data',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr POTHULA SUJATHA'
            },
            {
                code: 'CSCE 624',
                name: 'Mobile & Pervasive Computing',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr M SATHYA'
            },
            {
                code: 'CSCE 625',
                name: 'Advanced Operating System',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr R LAKSHMI'
            },
            {
                code: 'CSCE 627',
                name: 'Data Mining Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr POTHULA SUJATHA'
            },
            {
                code: 'CSCE 628',
                name: 'Pervasive Computing Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr M SATHYA'
            },
            {
                code: 'CSCE 863',
                name: 'Linear Optimization',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr M NANDHINI'
            },
            {
                code: 'CSCE 875',
                name: 'Biometric Security',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr S RAVI'
            }
        ]
    },
    'M.Sc Data Analytics': {
        'I': [
            {
                code: 'CSDA651L',
                name: 'ADBMS Lab',
                type: 'Hardcore',
                hours: 2,
                faculty: 'Dr. Sukhvinder Singh'
            },
            {
                code: 'CSDA651T',
                name: 'Advanced Database Systems',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. Sukhvinder Singh'
            },
            {
                code: 'CSDA652',
                name: 'Web Analytics',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. KS Kuppusamy'
            },
            {
                code: 'CSDA653',
                name: 'Data Visualisation',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. Jeyakodi'
            },
            {
                code: 'CSDA654',
                name: 'Lab 3 – Web Analytics Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. KS Kuppusamy'
            },
            {
                code: 'CSDA655',
                name: 'Lab – 4 Data Visualisation Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. Jeyakodi'
            },
            {
                code: 'CSDA671',
                name: 'Social Network Analytics',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr. S Siva Sathya'
            },
            {
                code: 'CSDA674',
                name: 'Accessibility Analytics',
                type: 'Softcore',
                hours: 3,
                faculty: 'Mr. Seenivasan R P'
            }
        ]
    },
    'M.Tech CSE': {
        'II': [
            {
                code: 'CSCE 721',
                name: 'Project Work Phase – 2',
                type: 'Project',
                hours: 6,
                faculty: 'Project Guide'
            }
        ]
    },
    'M.Tech NIS': {
        'II': [
            {
                code: 'CSNS 721',
                name: 'Project Work Phase – 2',
                type: 'Project',
                hours: 6,
                faculty: 'Project Supervisor'
            }
        ]
    },
    'MCA': {
        'I': [
            {
                code: 'CSCA 421',
                name: 'Computer Networks',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr T Chithralekha'
            },
            {
                code: 'CSCA 422',
                name: 'Operating Systems',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr. Rajpriya Darshini'
            },
            {
                code: 'CSCA 423',
                name: 'Communication Skills',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr G Krishnapriya'
            },
            {
                code: 'CSCA 424',
                name: 'Computer Networks Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Dr T Chithralekha'
            },
            {
                code: 'CSCA 425',
                name: 'Operating Systems Lab',
                type: 'Hardcore',
                hours: 3,
                faculty: 'Mr Seenivasan R P'
            },
            {
                code: 'CSEL 448',
                name: 'Ethical Hacking (Level 3)',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr Sukhvinder Singh'
            },
            {
                code: 'CSEL 581',
                name: 'Introduction to A.I. and Expert Systems (Level 1)',
                type: 'Softcore',
                hours: 3,
                faculty: 'Dr SL Jayalakshmi'
            }
        ]
    }
};

// Get default subjects for a program and year
export const getDefaultSubjects = (program, year) => {
    if (!program) return [];

    // Normalize program name
    let normalizedProgram = program;
    if (program.includes('M.Tech') || program.includes('MTech')) {
        if (program.includes('Data Science') || program.includes('Data Analytics') || program.includes('DS')) {
            normalizedProgram = 'M.Tech DS';
        } else if (program.includes('CSE') || program.includes('Computer Science')) {
            normalizedProgram = 'M.Tech CSE';
        }
    } else if (program.includes('M.Sc') || program.includes('MSC')) {
        if (program.includes('CS Integrated') || program.includes('Integrated')) {
            normalizedProgram = 'M.Sc CS Integrated';
        } else if (program.includes('Data Analytics') || program.includes('Data Science') || program.includes('DA')) {
            normalizedProgram = 'M.Sc Data Analytics';
        } else if (program.includes('CS') || program.includes('Computer Science')) {
            normalizedProgram = 'M.Sc CS';
        }
    } else if (program.includes('MCA')) {
        normalizedProgram = 'MCA';
    }

    // Normalize year
    const normalizedYear = typeof year === 'string' ?
        (year === 'I' ? 'I' : year === 'II' ? 'II' : year === '1' ? 'I' : year === '2' ? 'II' : year) :
        (year === 1 ? 'I' : year === 2 ? 'II' : String(year));

    return DEFAULT_SUBJECTS[normalizedProgram]?.[normalizedYear] || [];
};

export const getSubjectCode = (subject) => {
    if (typeof subject === 'string') return subject;
    return subject?.code || subject?.subjectCode || '';
};

export const getSubjectName = (subject) => {
    if (typeof subject === 'string') return subject;
    return subject?.name || subject?.subjectName || subject?.subject || '';
};
