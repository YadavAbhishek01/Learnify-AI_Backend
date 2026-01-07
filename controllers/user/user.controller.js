
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../../models/User/User.model.js'
import cloudinary from '../../config/cloudinary.js'

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) =>
 /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/.test(password)

/*Has minimum 8 characters in length. Adjust it by modifying {8,}
At least one uppercase English letter. You can remove this condition by removing (?=.*?[A-Z])
At least one lowercase English letter.  You can remove this condition by removing (?=.*?[a-z])
At least one digit. You can remove this condition by removing (?=.*?[0-9])
At least one special character,  You can remove this condition by removing (?=.*?[#?!@$%^&*-])*/ 
export const registerUser=async(req,res)=>{
  try {
      const {name,email,password}=req.body

      if(!name || !email || !password)
      {
        return res.status(401).json({
            message:"All Fields Are Required",
            success:false
        })
      }
      if(!isValidEmail(email))
      {
         return res.status(400).json({ message: "Invalid email format" });
      }
       if(!isValidPassword(password))
      {
         return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user=await User.findOne({email});
      if(user)
      {
        return res.status(401).json({
            message:"User Already Register with this Email user different email",
            success:false
        })
      }
      const hashpassword=await bcrypt.hash(password,10);

      const newUser= await User.create({
        name:name,
        email:email,
        password:hashpassword,
      })

      return res.status(201).json({
            message:"Register Successfully",
            success:true,
            data:newUser
        })
  } catch (error) {
    console.log("server error",error)
  }
    
}
export const loginUser=async(req,res)=>{
    const {email,password}=req.body

      if(!email || !password)
      {
        return res.status(401).json({
            message:"email or password Are Required",
            success:false
        })
      }
     
      const user=await User.findOne({email}).select("+password");

      if(!user)
      {
          return res.status(401).json({
            message:"Invalid credencials",
            success:false
        })
      }
      const matchPassword=await bcrypt.compare(password,user.password);
      if(!matchPassword)
      {
          return res.status(401).json({
            message:"Invalid credencials",
            success:false
        })
      }

      const token= jwt.sign({id:user._id,email:user.email},process.env.SECRET_KEY,{expiresIn:process.env.EXPIRES});

      return res.status(200).json({
            message:"login successfully",
            success:true,
            data:user,
            token:token
        })


}
export const checkAuth=async(req,res)=>{
  return res.status(200).json({
    success:true,
    data:req.user
  })
}
export const UpdateProfile=async(req,res)=>{

 try {
   const {name,email}=req.body
  const userID=req.user._id
  let profileUrl;

  if(req.file)
  {
    const UploadResult=await new Promise((resolve,reject)=>{
      cloudinary.uploader.upload_stream({folder:"Ai_learning_profile_image"},(error,result)=>{
        if (error) return reject(error);
            resolve(result);
      }).end(req.file.buffer);
    })
     profileUrl = UploadResult.secure_url;
  }

    const updateUser=await User.findByIdAndUpdate(userID,{name,email,profile_pic:profileUrl},{new:true})
     return res.json({
            success: true,
            message: "Profile updated successfully",
            updateUser,
          });
 } catch (error) {
   console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
 }
  
}