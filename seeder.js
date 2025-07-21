// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import blogModel from '../models/blogModel.js'; // adjust path as needed
// import userModel from '../models/userModel.js';  // for linking admin user

// dotenv.config();

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected for seeding"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Dummy blog data
// const dummyBlogs = [
//   {
//     blogTitle: "Mastering React in 30 Days",
//     blogCategory: "Frontend",
//     blogImgFile: "https://via.placeholder.com/600x300.png?text=React+Blog",
//     blogBody: "This blog covers the fundamentals of React, from JSX to hooks, helping you master frontend development.",
//   },
//   {
//     blogTitle: "Node.js for Scalable Backend",
//     blogCategory: "Backend",
//     blogImgFile: "https://via.placeholder.com/600x300.png?text=Node+Blog",
//     blogBody: "Learn how to build RESTful APIs using Node.js, Express, and MongoDB in a scalable way.",
//   },
//   {
//     blogTitle: "10 Tips for Writing Clean Code",
//     blogCategory: "Best Practices",
//     blogImgFile: "https://via.placeholder.com/600x300.png?text=Clean+Code",
//     blogBody: "Follow these essential tips to improve the quality and readability of your code.",
//   },
// ];

// // Seed Function
// const seedBlogs = async () => {
//   try {
//     const adminUser = await userModel.findOne({ isAdmin: true });
//     if (!adminUser) {
//       console.log("No admin user found. Please create an admin first.");
//       process.exit(1);
//     }

//     await blogModel.deleteMany(); // Remove existing blogs
//     console.log("Old blog data removed.");

//     const blogsWithUser = dummyBlogs.map((blog) => ({
//       ...blog,
//       userId: adminUser._id,
//       slug: blog.blogTitle.trim().toLowerCase().replace(/\s+/g, "-"),
//     }));

//     const createdBlogs = await blogModel.insertMany(blogsWithUser);
//     console.log("Dummy blogs inserted:", createdBlogs.length);

//     process.exit(); // Exit after seeding
//   } catch (error) {
//     console.error("Error while seeding blogs:", error);
//     process.exit(1);
//   }
// };

// seedBlogs();
