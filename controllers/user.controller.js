const User = require('../models/user.model'); // Assuming your model is here

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, profileImage, studentProfile } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;

    
    if (studentProfile) {
      user.studentProfile = {
        ...user.studentProfile, 
        rollNumber: studentProfile.rollNumber,
        department: studentProfile.department,
        course: studentProfile.course,
        yearOfStudy: studentProfile.yearOfStudy
      };
    }

    const updatedUser = await user.save();

    const responseData = updatedUser.toObject();
    delete responseData.password;

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = { getUserProfile, updateUserProfile };