
import type { PlasmoMessaging } from "@plasmohq/messaging";
import ratings from "../../services/index";

export interface School {
    city: string;
    id: string;
    name: string;
    state: string;
}

export type RequestBody = {
    teacherName: string,
    schoolId: string
}

export type ResponseBody = {
    avgDifficulty: number;
    avgRating: number;
    department: string;
    firstName: string;
    id: string;
    lastName: string;
    legacyId: number;
    numRatings: number;
    school: School;
    wouldTakeAgainPercent?: number;
}

let teacherCache: { name: string, id: string }[] = [
    { name: "Tiago Soares Cogumbreiro Garcia", id: "VGVhY2hlci0yNjAzMDM0" },
];

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    const { schoolId, teacherName } = req.body;

    try {
        // Check if teacher is in cache
        let cachedTeacher = teacherCache.find(teacher => teacher.name === teacherName);

        if (cachedTeacher) {
            // Found teacher in cache
            let teacher = await ratings.getTeacher(cachedTeacher.id);
            res.send(teacher);
        } else {
            // Teacher not found in cache, search RateMyProfessor
            let teachers = await ratings.searchTeacher(teacherName, schoolId);
            if (teachers.length > 0) {
                // Add teacher to cache
                teacherCache.push({ name: teacherName, id: teachers[0].id });

                let teacher = await ratings.getTeacher(teachers[0].id);
                res.send(teacher);
            } else {
                // Teacher not found, not on RateMyProfessor
                res.send({
                    avgRating: null,
                    legacyId: null,
                    avgDifficulty: null,
                    department: "",
                    id: "",
                    numRatings: 0,
                    school: undefined,
                    firstName: teacherName.split(" ")[0],
                    lastName: teacherName.split(" ")[1]
                });
            }
        }
    } catch (error) {
        console.error("Error fetching teacher information:", error);
        res.send(null); // Consider providing a more detailed error or fallback
    }
}

export default handler