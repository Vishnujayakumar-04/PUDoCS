// Timetables Registry
// Import all timetable JSONs
import mtech_ds_1 from './timetables/M_Tech_DS_1st_Year_Timetable.json';
import mtech_cse_1 from './timetables/M_Tech_CSE_1st_Year_Timetable.json';
import mtech_cse_2 from './timetables/M_Tech_CSE_2nd_Year_Timetable.json';
import mtech_nis_2 from './timetables/M_Tech_NIS_2nd_Year_Timetable.json';
import mca_1 from './timetables/MCA_1st_Year_Timetable.json';
// Note: Some files might be missing or named differently, checking widely available ones
import msc_da_1 from './timetables/M_Sc_DA_1st_Year_Timetable.json';
import msc_cs_int_1 from './timetables/M_Sc_CS_Integrated_1st_Year_Timetable.json';

// Mapping
export const timetableData = {
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
    },
    "M.Sc Data Analytics": {
        "I": msc_da_1,
        "1": msc_da_1,
    },
    "M.Sc CS Integrated": {
        "I": msc_cs_int_1,
        "1": msc_cs_int_1,
    }
};
