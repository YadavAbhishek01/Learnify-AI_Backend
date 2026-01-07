import {User} from '../../models/User/User.model.js'
import jwt from 'jsonwebtoken'


export const Authmiddelware=async(req,res,next)=>{
   try {
     const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(400).json({
             message:"You are not authorized. Please login",
             success:false
        })
    }
    const token=authHeader.split(" ")[1];
    const decodetoken= jwt.verify(token,process.env.SECRET_KEY);

    const user=await User.findById(decodetoken.id).select('-password');

    if(!user)
        {
              return res.status(401).json({
                success: false,
              message: "Invalid token",
            });
        }
    req.user=user
    next();
   } catch (error) {
   console.log(error.message || error);
      return res.status(401).json({
    success: false,
    message: "Invalid or expired token",
})
   }
}