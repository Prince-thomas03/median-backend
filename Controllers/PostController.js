import PostModel from "../Models/postModal.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js"


// create new post

export const createPost = async(req,res)=>{
    const newPost = new PostModel(req.body);
    try {
        await newPost.save();
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error);
    }
}


// get a post

export const getPost = async(req,res)=>{
    const id = req.params.id;

    try {

        const post = await PostModel.findById(id)
        res.status(200).json(post)
        
    } catch (error) {
        res.status(500).json(error)
    }
}

// update a post

export const updatePost = async(req,res)=>{
    const postId = req.params.id;

    const {userId} = req.body;

    try {
        
   const post = await PostModel.findByIdAndUpdate(postId);

   if(post.userId === userId){
    await post.updateOne({$set: req.body})
    res.status(200).json("post updated")
   }else{
    res.status(403).json("action forbidden");
   }



    } catch (error) {
        res.status(500).json(error)
    }
}


// delete post

export const deletePost = async(req,res)=>{
    const id = req.params.id;
    const userId = req.params.userId;

    // const {userId} = req.body;
    // console.log(userId);

    try {
        
        const post = await PostModel.findById(id);

        if(post.userId === userId){
             await post.deleteOne();
             res.status(200).json("post deleted successfully")
        }else{
            res.status(403).json("Action forbiden")
        }

    } catch (error) {
        res.status(500).json(error)
    }

}


// like and dislike post

export const likePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;
    try {
      const post = await PostModel.findById(id);
      if (post.likes.includes(userId)) {
        await post.updateOne({ $pull: { likes: userId } });
        res.status(200).json("Post disliked");
      } else {
        await post.updateOne({ $push: { likes: userId } });
        res.status(200).json("Post liked");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };
  

// get timelinepost

export const getTimelinePosts = async(req,res)=>{

   const userId = req.params.id;

   try {
    
    const currentUserPost = await PostModel.find({userId : userId})

    const followingPosts = await UserModel.aggregate(
        [
            {
                $match : {
                    _id : new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup:{
                    from : "posts",
                    localField: "following",
                    foreignField :"userId",
                    as : "followingPosts"

                }
            },
            {
                $project:{
                    followingPosts :1,
                    _id : 0
                }
            }
        ]
    )
    res.status(200).json(currentUserPost.concat(...followingPosts[0].followingPosts)
    .sort((a,b)=>{
        return b.createdAt - a.createdAt; 
    }))
   } catch (error) {
     res.status(500).json(error)
   }


}


//get all  post
export const getAllPost = async(req,res) =>{
    try {
        let posts = await PostModel.find()
        posts = posts.map((post)=>{
        return post
        })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }

}

// get only user posts
export const getTimelinePostsUser = async(req,res) =>{
    const userId = req.params.id
    console.log(userId,"controller");
    try {
        let posts = await PostModel.find({userId:userId})
        posts = posts.map((post)=>{
            return post
        })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
}