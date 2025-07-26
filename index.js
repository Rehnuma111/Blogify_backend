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
  origin: [
    'https://blogigy-frontend.onrender.com', 
    'http://localhost:5173'
  ],
  credentials: true
}));
;app.use('/api/user', userRouter);
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
    blogTitle: "The Power of TypeScript in Modern Web Development",
    blogCategory: "Frontend",
    blogImgFile: "https://via.placeholder.com/600x300.png?text=TypeScript+Blog",
    blogBody: `TypeScript brings static typing to JavaScript, enhancing developer productivity. 
It helps catch bugs early during development. 
Modern frameworks like Angular and React benefit greatly from TypeScript. 
It improves code readability and maintainability. 
Start adopting TypeScript for more robust web applications.`,
    userId: "687f7d64dcf666834043008c",
    slug: "the-power-of-typescript-in-modern-web-development"
  },
  {
    blogTitle: "Securing Your Node.js API Like a Pro",
    blogCategory: "Backend",
    blogImgFile: "https://via.placeholder.com/600x300.png?text=Node+Security",
    blogBody: `Security is critical for any backend API. 
Always validate and sanitize user input. 
Use helmet and rate-limiting middleware for basic protection. 
Implement JWT for secure authentication. 
Keep dependencies updated to avoid known vulnerabilities.`,
    userId: "687f7d64dcf666834043008c",
    slug: "securing-your-node-js-api-like-a-pro"
  },
  {
    blogTitle: "How to Build a Blog with MongoDB and Express",
    blogCategory: "Full Stack",
    blogImgFile: "https://via.placeholder.com/600x300.png?text=Mongo+Blog",
    blogBody: `MongoDB and Express are a powerful duo for backend development. 
Start by setting up routes and controllers. 
Use Mongoose for schema definitions and database operations. 
Implement RESTful endpoints for CRUD functionality. 
Deploy using services like Render or Vercel for testing.`,
    userId: "687f7d64dcf666834043008c",
    slug: "how-to-build-a-blog-with-mongodb-and-express"
  },
  {
    blogTitle: "Responsive Design with Flexbox and Grid",
    blogCategory: "Frontend",
    blogImgFile: "https://via.placeholder.com/600x300.png?text=Responsive+Design",
    blogBody: `Flexbox and Grid make responsive layouts easier. 
Use Flexbox for one-dimensional alignment. 
Grid is ideal for two-dimensional designs. 
Combine both for complex responsive pages. 
Always test on different screen sizes for optimal UX.`,
    userId: "687f7d64dcf666834043008c",
    slug: "responsive-design-with-flexbox-and-grid"
  },
  {
    blogTitle: "Boost Performance in React Apps",
    blogCategory: "Frontend",
    blogImgFile: "https://via.placeholder.com/600x300.png?text=React+Performance",
    blogBody: `React apps can slow down with poor optimization. 
Use memoization and lazy loading to reduce re-renders. 
Avoid anonymous functions in props. 
Split code using React.lazy and Suspense. 
Monitor performance using React DevTools.`,
    userId: "687f7d64dcf666834043008c",
    slug: "boost-performance-in-react-apps"
  }
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
  
  // seedBlogs();
  