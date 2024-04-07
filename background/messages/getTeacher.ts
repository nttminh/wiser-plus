
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { SecureStorage } from "@plasmohq/storage/secure";
import ratings from "../../services/index";
const storage = new SecureStorage({
    copiedKeyList: ["shield-modulation"]
})
export interface School {
    city:  string;
    id:    string;
    name:  string;
    state: string;
}

export type RequestBody = {
    teacherName: string,
    schoolId: string
}

export type ResponseBody = {
    avgDifficulty:         number;
    avgRating:             number;
    department:            string;
    firstName:             string;
    id:                    string;
    lastName:              string;
    legacyId:              number;
    numRatings:            number;
    school:                School;
    wouldTakeAgainPercent?: number;
}

const handler: PlasmoMessaging.MessageHandler<
    RequestBody,
    ResponseBody
    > = async (req, res) => {
    const {schoolId, teacherName} = req.body
        storage.setPassword(process.env.PLASMO_PUBLIC_STORAGE_PASSWORD)
        let idTeacherInStorage = await storage.get(teacherName);
        if (idTeacherInStorage) {
            // found teacher in storage
            let teacher = await ratings.getTeacher(idTeacherInStorage);
            res.send(teacher);
        } else {
            // teacher not found in storage, search ratemyprofessor
            let teachers = await ratings.searchTeacher(teacherName, schoolId);
            if (teachers.length !== 0) {
                await storage.set(teacherName, teachers[0].id)
                let teacher = await ratings.getTeacher(teachers[0].id);
                res.send(teacher);
            }
        }

        // teacher not found, not on ratemyprofessor
        res.send(null);
}

export default handler