// Staff Data
// Complete faculty information for the Department of Computer Science

const staffData = [
    {
        "name": "Dr. R. Subramanian",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "r_subramanian",
        "subjectsHandled": ["Artificial Intelligence", "Machine Learning"],
        "facultyInCharge": null,
        "courseCoordinator": "Research Programmes",
        "contact": "0413-2654XXX",
        "email": "rsubramanian.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. T. Chithralekha",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "t_chithralekha",
        "subjectsHandled": ["Data Mining", "Big Data Analytics"],
        "facultyInCharge": null,
        "courseCoordinator": "M.Sc Programmes",
        "contact": "0413-2654XXX",
        "email": "tchithralekha.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. S. Sivasathya",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "s_sivasathya",
        "subjectsHandled": ["Software Engineering", "Object Oriented Systems"],
        "facultyInCharge": null,
        "courseCoordinator": "B.Tech Programmes",
        "contact": "0413-2654XXX",
        "email": "ssivasathya.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. S. K. V. Jayakumar",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "skv_jayakumar",
        "subjectsHandled": ["Software Engineering", "DBMS", "Cloud Computing"],
        "facultyInCharge": null,
        "courseCoordinator": "Department Head",
        "contact": "0413-2654XXX",
        "email": "head.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. K. Suresh Joseph",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "k_suresh_joseph",
        "subjectsHandled": ["Network Security", "Cryptography"],
        "facultyInCharge": null,
        "courseCoordinator": "M.Tech NIS",
        "contact": "0413-2654XXX",
        "email": "ksureshjoseph.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. S. Ravi",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "s_ravi",
        "subjectsHandled": ["Distributed Systems", "Operating Systems"],
        "facultyInCharge": null,
        "courseCoordinator": "MCA Programme",
        "contact": "0413-2654XXX",
        "email": "sravi.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. M. Nandhini",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "m_nandhini",
        "subjectsHandled": ["Data Structures", "Algorithms"],
        "facultyInCharge": null,
        "courseCoordinator": "B.Sc Computer Science",
        "contact": "0413-2654XXX",
        "email": "mnandhini.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. Pothula Sujatha",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "pothula_sujatha",
        "subjectsHandled": ["Computer Networks", "Wireless Networks"],
        "facultyInCharge": null,
        "courseCoordinator": "M.Tech CSE",
        "contact": "0413-2654XXX",
        "email": "psujatha.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. P. Shanthi Bala",
        "designation": "Professor",
        "department": "Computer Science",
        "imageKey": "p_shanthi_bala",
        "subjectsHandled": ["Compiler Design", "Programming Languages"],
        "facultyInCharge": null,
        "courseCoordinator": "Academic Coordinator",
        "contact": "0413-2654XXX",
        "email": "pshanthi.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. R. Sunitha",
        "designation": "Associate Professor",
        "department": "Computer Science",
        "imageKey": "r_sunitha",
        "subjectsHandled": ["Database Systems", "Data Warehousing"],
        "facultyInCharge": null,
        "courseCoordinator": "M.Sc Data Science",
        "contact": "0413-2654XXX",
        "email": "rsunitha.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. K. S. Kuppusamy",
        "designation": "Associate Professor",
        "department": "Computer Science",
        "imageKey": "ks_kuppusamy",
        "subjectsHandled": ["Image Processing", "Pattern Recognition"],
        "facultyInCharge": null,
        "courseCoordinator": "Research Coordination",
        "contact": "0413-2654XXX",
        "email": "kskuppusamy.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. V. Uma",
        "designation": "Associate Professor",
        "department": "Computer Science",
        "imageKey": "v_uma",
        "subjectsHandled": ["Operating Systems", "Linux Programming"],
        "facultyInCharge": null,
        "courseCoordinator": "UG Labs",
        "contact": "0413-2654XXX",
        "email": "vuma.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. T. Vengattaraman",
        "designation": "Associate Professor",
        "department": "Computer Science",
        "imageKey": "t_vengattaraman",
        "subjectsHandled": ["Web Technologies", "Software Testing"],
        "facultyInCharge": null,
        "courseCoordinator": "Placement & Industry Connect",
        "contact": "0413-2654XXX",
        "email": "tvengattaraman.csc@pondiuni.ac.in"
    },
    {
        "name": "R. P. Seenivasan",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "rp_seenivasan",
        "subjectsHandled": ["C Programming", "Data Structures"],
        "facultyInCharge": null,
        "courseCoordinator": "UG Tutorials",
        "contact": "0413-2654XXX",
        "email": "rpseenivasan.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. T. Sivakumar",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "t_sivakumar",
        "subjectsHandled": ["Java Programming", "Web Applications"],
        "facultyInCharge": null,
        "courseCoordinator": "Web Technologies",
        "contact": "0413-2654XXX",
        "email": "tsivakumar.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. M. Sathya",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "m_sathya",
        "subjectsHandled": ["Python Programming", "Data Science"],
        "facultyInCharge": null,
        "courseCoordinator": "Data Science Labs",
        "contact": "0413-2654XXX",
        "email": "msathya.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. S. L. Jayalakshmi",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "sl_jayalakshmi",
        "subjectsHandled": ["Computer Architecture", "Digital Logic"],
        "facultyInCharge": null,
        "courseCoordinator": "Hardware Labs",
        "contact": "0413-2654XXX",
        "email": "sljayalakshmi.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. Krishnapriya",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "krishnapriya",
        "subjectsHandled": ["Operating Systems", "Database Systems"],
        "facultyInCharge": null,
        "courseCoordinator": "Internal Assessment",
        "contact": "0413-2654XXX",
        "email": "krishnapriya.csc@pondiuni.ac.in"
    },
    {
        "name": "Dr. Sukhvinder Singh",
        "designation": "Assistant Professor",
        "department": "Computer Science",
        "imageKey": "sukhvinder_singh",
        "subjectsHandled": ["Artificial Intelligence", "Machine Learning"],
        "facultyInCharge": null,
        "courseCoordinator": "AI & ML Programmes",
        "contact": "0413-2654XXX",
        "email": "ssingh.csc@pondiuni.ac.in"
    }
];

export default staffData;
