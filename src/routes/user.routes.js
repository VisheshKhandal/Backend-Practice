import {Router} from "express"
import { loginUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middelwares/multer.middelwares.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(VerifyJWT, logoutUser);

next();

export default router;

