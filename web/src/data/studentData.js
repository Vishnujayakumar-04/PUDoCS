// M.Tech
import mtech_ds_1 from './students/MTech_DS_1st_Year_Students.json';
// import mtech_ds_2 from './students/MTech_DS_2nd_Year_Students.json'; // Not available yet
import mtech_cse_1 from './students/MTech_CSE_1st_Year_Students.json';
import mtech_cse_2 from './students/MTech_CSE_2nd_Year_Students.json';
import mtech_nis_2 from './students/MTech_NIS_2nd_Year_Students.json';

// MCA
import mca_1 from './students/MCA_1st_Year_Students.json';
import mca_2 from './students/MCA_2nd_Year_Students.json';

// M.Sc
import msc_da_1 from './students/MSc_DA_1st_Year_Students.json';
import msc_cs_2 from './students/MSc_CS_2nd_Year_Students.json';
import msc_cs_2_add from './students/MSc_CS_2nd_Year_Additional_Students.json';
import msc_cs_int_1 from './students/MSc_CS_Integrated_1st_Year_Students.json';

// Helper to ensure data is an array before spreading
const ensureArray = (data) => Array.isArray(data) ? data : [];

export const studentData = {
    "M.Tech DS": {
        "I": mtech_ds_1,
        "1": mtech_ds_1,
    },
    "M.Tech CSE": {
        "I": mtech_cse_1,
        "1": mtech_cse_1,
        "II": mtech_cse_2,
        "2": mtech_cse_2,
    },
    "M.Tech NIS": {
        "II": mtech_nis_2,
        "2": mtech_nis_2,
    },
    "MCA": {
        "I": mca_1,
        "1": mca_1,
        "II": mca_2,
        "2": mca_2,
    },
    "M.Sc Data Analytics": {
        "I": msc_da_1,
        "1": msc_da_1,
    },
    "M.Sc CS": {
        "II": [...ensureArray(msc_cs_2), ...ensureArray(msc_cs_2_add)],
        "2": [...ensureArray(msc_cs_2), ...ensureArray(msc_cs_2_add)],
    },
    "M.Sc CS Integrated": {
        "I": msc_cs_int_1,
        "1": msc_cs_int_1,
    }
};

