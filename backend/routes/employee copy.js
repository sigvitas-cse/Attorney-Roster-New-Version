const router = require('express').Router();
const UserModel = require("../models/NewProfile"); 
const UserLoginsModel = require("../models/Login");
const NewUsersLoginModel = require("../models/NewUsers");
const Analysis = require("../models/Analysis");
const UpdatedProfilesComparison = require("../models/UpdatedProfilesComparison");

const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

router.post("/add-user", async (req, res) => {
  console.log('Inside add-user Section');
  const {
    name,
    organization,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    zipcode,
    phoneNumber,
    regCode,
    agentAttorney,
    dateOfPatent,
    agentLicensed,
    firmOrOrganization,
    updatedPhoneNumber,
    emailAddress,
    updatedOrganization,
    firmUrl,
    updatedAddress,
    updatedCity,
    updatedState,
    updatedCountry,
    updatedZipcode,
    linkedInProfile,
    notes,
    initials,  // Ensure this is included in the request body
    dataUpdatedAsOn,
    userId,
  } = req.body;

  console.log('Inside add-user Section and userId:', userId);

  try {
    // Get the next slNo (Serial Number)
    const lastUser = await UserModel.findOne().sort({ slNo: -1 }).exec();
    const nextSlNo = lastUser ? lastUser.slNo + 1 : 1;

    // Create a new user object
    const newUser = new UserModel({
      slNo: nextSlNo,
      name,
      organization,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      zipcode,
      phoneNumber,
      regCode,
      agentAttorney,
      dateOfPatent,
      agentLicensed,
      firmOrOrganization,
      updatedPhoneNumber,
      emailAddress,
      updatedOrganization,
      firmUrl,
      updatedAddress,
      updatedCity,
      updatedState,
      updatedCountry,
      updatedZipcode,
      linkedInProfile,
      notes,
      initials,
      dataUpdatedAsOn,
      userId,
    });

    // Save the new user to MongoDB
    const savedUser = await newUser.save();

    // Respond with the saved user data
    res.status(201).json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/update-user/:slNo", async (req, res) => {
  console.log('now inside the update-user/:slNo section');
  
  // Extract the `slNo` from the URL params
  const { slNo } = req.params;
  
  // Extract the user data from the request body
  const { 
    name,
    organization,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    zipcode,
    phoneNumber,
    regCode,
    agentAttorney,
    dateOfPatent,
    agentLicensed,
    firmOrOrganization,
    updatedPhoneNumber,
    emailAddress,
    updatedOrganization,
    firmUrl,
    updatedAddress,
    updatedCity,
    updatedState,
    updatedCountry,
    updatedZipcode,
    linkedInProfile,
    notes,
    initials,
    dataUpdatedAsOn 
  } = req.body;

  try {
    // Find the user by `slNo` and update their data
    const updatedUser = await UserModel.findOneAndUpdate(
      { slNo }, // Match by slNo
      {
        name,
        organization,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        zipcode,
        phoneNumber,
        regCode,
        agentAttorney,
        dateOfPatent,
        agentLicensed,
        firmOrOrganization,
        updatedPhoneNumber,
        emailAddress,
        updatedOrganization,
        firmUrl,
        updatedAddress,
        updatedCity,
        updatedState,
        updatedCountry,
        updatedZipcode,
        linkedInProfile,
        notes,
        initials,
        dataUpdatedAsOn
      }, // The new data to update
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while updating user." });
  }
});


router.put("/update-users", async (req, res) => {
  console.log("now inside the update-users section");
  const users = req.body;

  try {
    const updatePromises = users.map(async (user) => {
      const { slNo } = user;

      const updatedUser = await UserModel.findOneAndUpdate(
        { slNo }, // Match user by slNo
        { ...user }, // Update with user data
        { new: true } // Return updated document
      );

      return updatedUser;
    });

    const updatedUsers = await Promise.all(updatePromises);

    res.status(200).json({
      message: "All users updated successfully.",
      data: updatedUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "An error occurred." });
  }
});

router.get("/fetch-users", async (req, res) => {
  console.log('now inside the fetch users section');

  try {
    const userId = req.query.userId;
    console.log("Received userId:", userId);

    // Check if userId exists in the query
    if (!userId) {
      console.error("No userId provided");
      console.log(process.env.NODE_ENV);

      return res.status(400).json({ error: "UserId is required" });
    }

    // Query the database
    const users = await UserModel.find({userId: userId});
    // console.log("Fetched users:", users);

    // Check if users are found
    if (!users.length) {
      console.error(`No data found for userId: ${userId}`);
      return res.status(404).json({ message: "No data found for this userId" });
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/AllData", async (req, res) => {
  console.log('now inside the AllData section');

  try {

    // Query the database
    const users = await UserModel.find();
    // console.log("Fetched users:", users);

    // Check if users are found
    if (!users.length) {
      return res.status(404).json({ message: "No data found for this userId" });
    }

    res.status(200).json({
      message: "Data fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// router.get("/all-users-data", async (req, res) => {
//   console.log('now inside the all users section');

//   try {
//     const users = await UserModel.find();
//     console.log("Number of Data:",users.length);
    
    
//     if (!users.length) {
//       console.error(`No data found for userId: ${userId}`);
//       return res.status(404).json({ message: "No data found for this userId" });
//     }
//     res.status(200).json({
//       message: "Data fetched successfully",
//       data: users,
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });

// router.get("/all-users-data", async (req, res) => {
  
//   console.log("Fetching users with pagination...");

//   let { page = 1, limit = 1000 } = req.query;

//   page = Math.max(1, parseInt(page, 10) || 1);
//   limit = Math.max(1, parseInt(limit, 10) || 1000);

//   try {
//     const totalUsers = await UserModel.estimatedDocumentCount(); // Get total count
//     const totalPages = totalUsers > 0 ? Math.ceil(totalUsers / limit) : 1;

//     const users = await UserModel.find()
//       .sort({ createdAt: -1 }) // Optional: Sort by latest entries
//       .skip((page - 1) * limit)
//       .limit(limit);

//     res.status(200).json({
//       message: "Data fetched successfully",
//       data: users,
//       totalUsers, // Ensure this is always correct
//       totalPages,
//       currentPage: page,
//       hasMore: page < totalPages,
//     });

//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });


// fetch all at a tim
// router.get("/all-users-data", async (req, res) => {
//   console.log("Fetching all users at once");

//   try {
//     const users = await UserModel.find(); // Fetch all users without pagination
//     const totalUsers = users.length; // Get total count

//     if (!users.length) {
//       return res.status(404).json({ message: "No data found" });
//     }

//     res.status(200).json({
//       message: "All data fetched successfully",
//       data: users,
//       totalUsers,
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });

// router.get("/all-users-data", async (req, res) => {
//   console.log("Fetching users with pagination");

//   const { page = 1, limit = 5000 } = req.query; // Default: First fetch 5000
  

//   try {
//     const users = await UserModel.find()
//       .skip((page - 1) * limit) // Skip previous pages
//       .limit(Number(limit)); // Limit results per page
// console.log("Total Data:", users.length);
//     const totalUsers = await UserModel.countDocuments(); // Get total count

//     if (!users.length) {
//       return res.status(404).json({ message: "No data found" });
//     }

//     res.status(200).json({
//       message: "Data fetched successfully",
//       data: users,
//       totalUsers,
//       totalPages: Math.ceil(totalUsers / limit),
//       currentPage: Number(page),
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });

// Route to fetch users with pagination


// router.get("/all-users-data", async (req, res) => {
//   try {
//     // Get `page` and `limit` from request query
//     let page = parseInt(req.query.page) || 1; // Default: page 1
//     let limit = parseInt(req.query.limit) || 1000; // Default: 1000 records per page

//     // Calculate how many records to skip
//     let skip = (page - 1) * limit;

//     // Fetch data from MongoDB with pagination
//     const data = await UserModel.find().skip(skip).limit(limit);
//     const totalUsers = await UserModel.countDocuments(); // Total records in DB

//     res.status(200).json({
//       data,
//       totalUsers, // 52,000 (example)
//       currentPage: page,
//       totalPages: Math.ceil(totalUsers / limit), // Total pages based on limit
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// router.get("/all-users-data", async (req, res) => {
//   try {
//     // Get `page`, `limit`, and `letter` from request query
//     let page = parseInt(req.query.page) || 1; // Default: page 1
//     let limit = parseInt(req.query.limit) || 1000; // Default: 1000 records per page
//     let letter = req.query.letter; // A-Z filter

//     let filter = {};

//     // Apply A-Z filtering if `letter` is provided
//     if (letter && /^[A-Z]$/i.test(letter)) { 
//       filter.name = new RegExp(`^${letter}`, "i"); // Case-insensitive search
//     }

//     // Calculate how many records to skip
//     let skip = (page - 1) * limit;

//     // Fetch filtered data from MongoDB with pagination
//     const data = await UserModel.find(filter).skip(skip).limit(limit);
//     const totalUsers = await UserModel.countDocuments(filter); // Total filtered records

//     res.status(200).json({
//       data,
//       totalUsers, 
//       currentPage: page,
//       totalPages: Math.ceil(totalUsers / limit), 
//     });
//   } catch (err) {
//     console.error("Error fetching users:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



router.get("/all-users-data", async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 1000;
    let letter = req.query.letter?.trim() || "";

    let filter = {};

    // ✅ Filter by name if A-Z is selected
    if (letter && /^[A-Z]$/i.test(letter)) {
      filter.name = new RegExp(`^${letter}`, "i");
    }

    // ✅ If `#` is clicked (letter === ""), DO NOT remove pagination
    if (!letter) {
      page = page; // Keep pagination active
      limit = limit; // Fetch in batches instead of all at once
    }

    // Fetch total user count & paginated data
    const totalUsers = await UserModel.countDocuments(filter);
    const data = await UserModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();


      // ✅ Fetch updated profile regCodes
    const updatedProfiles = await UpdatedProfilesComparison.find({}, { regCode: 1, _id: 0 });
    const updatedRegCodes = new Set(updatedProfiles.map((item) => item.regCode?.trim()?.toLowerCase()));

    // ✅ Mark users as updated if their regCode matches
    const usersWithHighlight = data.map((user) => ({
      ...user,
      isUpdated: updatedRegCodes.has(user.regCode?.trim()?.toLowerCase()),
    }));


    res.status(200).json({
      success: true,
      data: usersWithHighlight,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit), // ✅ Keep pagination working
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});


router.get("/all-users-data-filtering", async (req, res) => {
  console.log('now inside the all-users-data-filtering section');

  const filters = req.query; // Get query parameters
  const query = {};

  // Build query dynamically
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      query[key] = { $regex: filters[key], $options: "i" }; // Case-insensitive partial match
    }
  });

  try {
    const data = await UserModel.find(query); // Fetch data based on filters
    res.status(200).json({ data });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});


router.get("/all-users", async (req, res) => {
  try {
    const users = await UserLoginsModel.find();
    // console.log("Fetched users:", users);

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json({ data: users });
  } catch (err) {
    console.error("Error fetching users:", err);  // Log any errors
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

// In your server-side code (Express.js)
router.delete("/delete-user/:userId", async (req, res) => {
  const { userId } = req.params;
  // console.log("UserId:",userId);
  
  const decodedUserId = decodeURIComponent(userId); // Decode URL-encoded userId

  try {
    const result1 = await UserLoginsModel.findOneAndDelete({ email: decodedUserId }); // Assuming email is unique
    const result2 = await NewUsersLoginModel.findOneAndDelete({ email: decodedUserId });
    if (result1 && result2) {
      res.status(200).send({ message: 'User deleted successfully' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error deleting user:", error); // Log the detailed error
    res.status(500).send({ message: 'Error deleting user', error: error.message });
  }
});

// Fetch analysis data
router.get("/analysis", async (req, res) => {
  try {
    console.log('inside the analysis section');
    
    const analysisData = await Analysis.find().sort({ timestamp: 1 });
    res.json(analysisData);
    console.log("analysis data:", analysisData)
  } catch (error) {
    res.status(500).json({ message: "Error fetching analysis data", error });
  }
});


// API to Add New or Update Profiles in Project 2's Collection
router.get("/updatedprofilescomparisons", async (req, res) => {
  console.log("✅ Inside updatedprofilescomparisons route");

  try {
    const updatedProfiles = await UpdatedProfilesComparison.find({}); 
    res.status(200).json(updatedProfiles);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
router.get("/updatedprofilescomparisons2", async (req, res) => {
  console.log("✅ Inside fortestinnews route");

  try {
    const testData = await UpdatedProfilesComparison.find({}); // Fetch all documents
    console.log("✅ Retrieved Data:", testData); // Debugging

    res.status(200).json(testData);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;