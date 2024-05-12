// searchTeacher.ts
import type { PlasmoMessaging } from "@plasmohq/messaging";
import ratings from "../../services/index";

export type RequestBody = {
    teacherName: string,
    schoolId: string
}

export type ResponseBody = {
    id: string;
    firstName: string;
    lastName: string;
    school: {
        id: string;
        name: string;
    };
}[]

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
    const { schoolId, teacherName } = req.body;

    try {
        // Search for the teacher using the provided name and schoolId
        let teachers = await ratings.searchTeacher(teacherName, schoolId);
        res.send(teachers);
    } catch (error) {
        console.error("Error searching for teacher:", error);
        res.send([]); // Consider providing a more detailed error or fallback
    }
}

export default handler