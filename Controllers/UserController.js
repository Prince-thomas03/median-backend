import  UserModel from '../Models/userModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


// get all users 
export const getAllUsers = async(req,res) =>{
    try {
        let users = await UserModel.find()
        users = users.map((user)=>{
        const {password,...otherDetails} = user._doc
        return otherDetails
        })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json(error)
    }

}


// get a user

export const getUser = async(req,res)=>{
    const id = req.params.id

    try {
        const user = await UserModel.findById(id);

        if(user){

            const {password,...otherDetails} = user._doc

             res.status(200).json(otherDetails)
        }else{
            res.status(404).json( "No user")
        }

        
    } catch (error) {
        res.status(500).json({error,message : "id not match"})
        
    }
} 


// update user

export const updateUser = async(req,res)=>{
   const id = req.params.id;

   const {_id,currentUserAdminStatus,password} = req.body;


   if(id===_id || currentUserAdminStatus){

        try {

            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password,salt)
            }
            
            const user = await UserModel.findByIdAndUpdate(id,req.body,{new:true})

            const token = jwt.sign(
                {username:user.username,id:user._id},
                process.env.JWT,{expiresIn:"1h"}
            )
            res.status(200).json({user,token})

        } catch (error) {
            res.status(500).json(error)
            
        }

   }else{
    res.status(403).json("Access Denied!jhh")
   }

}

// edit admin
export const updateUserAdmin = async(req,res)=>{
    const id = req.params.id;
    console.log(id);
    console.log(req.body);
 
    // const {_id,block} = req.body;
 
 //|| currentUserAdminStatus
    if(id){
 
         try {
 
             
             const user = await UserModel.findByIdAndUpdate(id,req.body,{new:true})
 
             res.status(200).json({user})
 
         } catch (error) {
             res.status(500).json(error)
             
         }
 
    }else{
     res.status(403).json("Access Denied!")
    }
 
 }
// user delete

export const deleteUser = async(req,res)=>{
   const id = req.params.id

   const {currentUserId,currentUserAdminStatus} = req.body;

   if(currentUserId === id || currentUserAdminStatus){
    try {
        
   await UserModel.findByIdAndDelete(id);
   res.status(200).json("user deleted successfully")

    } catch (error) {
        res.status(500).json(error)
    }
   }else{
    res.status(403).json("Access Denied !")
   }

}

// follow a user

// Follow a User
// changed
export const followUser = async(req, res) => {
    const id = req.params.id;
    const { _id } = req.body;
    if (_id == id) {
      res.status(403).json("Action Forbidden");
    } else {
      try {
        const followUser = await UserModel.findById(id);
        const followingUser = await UserModel.findById(_id);
  
        if (!followUser.followers.includes(_id)) {
          await followUser.updateOne({ $push: { followers: _id } });
          await followingUser.updateOne({ $push: { following: id } });
          res.status(200).json("User followed!");
        } else {
          res.status(403).json("you are already following this id");
        }
      } catch (error) {
        console.log(error)
        res.status(500).json(error);
      }
    }
  };

// unfollow a user

export const unFollowUser = async(req,res)=>{
    const id = req.params.id 
    const {_id} = req.body;

    if(_id === id ){
        res.status(403).json("Action forbidden")
    }else{
        try {
            const unFollowUser = await UserModel.findById(id)
            const unFollowingUser = await UserModel.findById(_id)

            if (unFollowUser.followers.includes(_id)){
            await unFollowUser.updateOne({$pull : {followers: _id}})
            await unFollowingUser.updateOne({$pull : {following: id}})
            res.status(200).json("Unfollowed Successfully!")
            
        }else{
            res.status(403).json("user is not followed by you")
        }

        } catch (error) {
            res.status(500).json(error)
        }
    }
}

export const postSave = async(req,res)=>{
    const id = req.params.id
    const userId = req.params.userId

    
    try {
     const user = await UserModel.findById(userId)
     console.log(user);
    if(user.savePost.includes(id)){
        await user.updateOne({$pull:{savePost : id}})
        res.status(200).json("saved post removed");
    }else{
        await user.updateOne({$push:{savePost : id}})
        res.status(200).json("saved post added");
    }
 } catch (error) {
    res.status(500).json(error);
 }

}