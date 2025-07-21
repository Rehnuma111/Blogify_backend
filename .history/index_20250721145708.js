import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
import connectDB from './config/connectDB.js';
connectDB(DB_URL);
import express from 'express';
const app = express();
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import cookieParser from 'cookie-parser';
import blogRouter from './routes/blogRoute.js';
import path from 'path';
import commentRouter from './routes/commentRoute.js';
import userModel from './model/userModel.js';
import blogModel from './model/blogModel.js';





const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://blogigy-frontend.onrender.com',
  credentials: true // if you use cookies or authentication headers
}));app.use('/api/user', userRouter);
app.use('/api/blog', blogRouter);
app.use('/api/comment', commentRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
});

app.use(errorMiddleware);




app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

const dummyBlogs = [
    {
      blogTitle: "Mastering React in 30 Days",
      blogCategory: "Frontend",
      blogImgFile: "https://via.placeholder.com/600x300.png?text=React+Blog",
      blogBody: "This blog covers the fundamentals of React, from JSX to hooks, helping you master frontend development.",
    },
    {
      blogTitle: "Node.js for Scalable Backend",
      blogCategory: "Backend",
      blogImgFile: "https://via.placeholder.com/600x300.png?text=Node+Blog",
      blogBody: "Learn how to build RESTful APIs using Node.js, Express, and MongoDB in a scalable way.",
    },
    {
      blogTitle: "10 Tips for Writing Clean Code",
      blogCategory: "Best Practices",
      blogImgFile: "https://via.placeholder.com/600x300.png?text=Clean+Code",
      blogBody: "Follow these essential tips to improve the quality and readability of your code.",
    },
    {
      blogTitle: "Understanding JavaScript Closures",
      blogCategory: "JavaScript",
      blogImgFile: "https://via.placeholder.com/600x300.png?text=JS+Closures",
      blogBody: "Closures are a powerful feature in JavaScript. Learn what they are and how to use them effectively.",
    },
    {
      blogTitle: "Tailwind CSS: Utility-First Magic",
      blogCategory: "Frontend",
      blogImgFile: "https://via.placeholder.com/600x300.png?text=Tailwind+CSS",
      blogBody: "Tailwind CSS simplifies styling by providing utility classes. This blog helps you get started with it.",
    },
  ];
  
  // Seed Function
  const seedBlogs = async () => {
    try {
      const adminUser = await userModel.findOne({ isAdmin: true });
      if (!adminUser) {
        console.log("No admin user found. Please create an admin first.");
        process.exit(1);
      }
  
      await blogModel.deleteMany(); // Remove existing blogs
      console.log("Old blog data removed.");
  
      const blogsWithUser = dummyBlogs.map((blog) => ({
        ...blog,
        userId: adminUser._id,
        slug: blog.blogTitle.trim().toLowerCase().replace(/\s+/g, "-"),
      }));
  
      const createdBlogs = await blogModel.insertMany(blogsWithUser);
      console.log("Dummy blogs inserted:", createdBlogs.length);
  
      process.exit(); // Exit after seeding
    } catch (error) {
      console.error("Error while seeding blogs:", error);
      process.exit(1);
    }
  };
  
//   seedBlogs();
  