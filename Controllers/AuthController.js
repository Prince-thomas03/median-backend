import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'



// Registering new user
export const registerUser = async (req, res) => {


    // hashing using bcrypt

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt)
    req.body.password = hashedPass

    const newUser = new UserModel(req.body)

    const { username } = req.body
    try {

        const oldUser = await UserModel.findOne({ username })
        if (oldUser) {
            return res.status(400).json({ message: "username is already registerd" })
        }
        const user = await newUser.save();
        //jwt create
        const token = jwt.sign({
            username: user.username, id: user._id
        }, process.env.JWT, { expiresIn: "1h" })

        res.status(200).json({ user, token })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


//login user
export const loginUser = async (req, res) => {

    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username: username ,block:false})

        if (user) {
            const validity = await bcrypt.compare(password, user.password)

            if (!validity) {
                res.status(400).json({message:"Wrong password"})
            } else {
                //jwt create
                const token = jwt.sign({
                    username: user.username, id: user._id
                }, process.env.JWT, { expiresIn: "5h" })
                res.status(200).json({ user, token ,message:"success"})

            }



        } else {
            res.status(400).json({message:"User Does not exists"})
            console.log("user blocked");
           
        }
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
   
}