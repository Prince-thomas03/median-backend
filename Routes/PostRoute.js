import express from 'express';
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost ,getAllPost,getTimelinePostsUser} from '../Controllers/PostController.js';

const router = express.Router();

router.post('/',createPost)
router.get('/:id',getPost)
router.put('/:id',updatePost)
router.put('/:id/:userId/delete',deletePost)
router.put('/:id/like',likePost)
router.get('/:id/timeline',getTimelinePosts)
router.get('/',getAllPost)
router.get('/:id/usertimeline',getTimelinePostsUser)
router.get('/:id/save',getPost)

export default router;