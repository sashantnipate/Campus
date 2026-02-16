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
    const { name, profileImage, adminProfile, studentProfile } = req.body;
    
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.profileImage = profileImage || user.profileImage;

    if (user.role === 'Admin' && adminProfile) {
        user.adminProfile = {
            position: adminProfile.position || user.adminProfile.position,
            department: adminProfile.department || user.adminProfile.department
        };
    } else if (user.role === 'Student' && studentProfile) {
        user.studentProfile = { ...user.studentProfile, ...studentProfile };
    }

    const updatedUser = await user.save();

    const responseUser = updatedUser.toObject();
    delete responseUser.password;

    res.status(200).json(responseUser);
  } catch (error) {
    console.error(error);
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Image too large' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getUserProfile, updateUserProfile };