const User = require("../models/User");

// Get all delivery addresses for the current user
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      addresses: user.deliveryAddresses || [],
      preferredAddressId: user.preferredAddressId,
    });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({ msg: "Error fetching addresses" });
  }
};

// Add a new delivery address
exports.addAddress = async (req, res) => {
  try {
    const { label, address, phone, altPhone, city, state, zipCode, isDefault } = req.body;

    // Validation
    if (!label || !address || !phone) {
      return res.status(400).json({ msg: "Label, address, and phone are required" });
    }

    if (!["Home", "Work", "Other"].includes(label)) {
      return res.status(400).json({ msg: "Invalid label. Must be Home, Work, or Other" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newAddress = {
      label,
      address,
      phone,
      altPhone: altPhone || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      isDefault: isDefault === true,
    };

    // If this is the first address or marked as default, set it as preferred
    if (user.deliveryAddresses.length === 0 || isDefault) {
      if (user.deliveryAddresses.length > 0) {
        user.deliveryAddresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }
      newAddress.isDefault = true;
      // Set preferred address after saving
    }

    user.deliveryAddresses.push(newAddress);

    // Set preferred address ID if this is first or marked as default
    if (isDefault || user.deliveryAddresses.length === 1) {
      user.preferredAddressId = user.deliveryAddresses[user.deliveryAddresses.length - 1]._id;
    }

    await user.save();

    res.status(201).json({
      msg: "Address added successfully",
      address: user.deliveryAddresses[user.deliveryAddresses.length - 1],
    });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(500).json({ msg: "Error adding address" });
  }
};

// Update a delivery address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, address, phone, altPhone, city, state, zipCode, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const addressIndex = user.deliveryAddresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ msg: "Address not found" });
    }

    // Update fields
    if (label) user.deliveryAddresses[addressIndex].label = label;
    if (address) user.deliveryAddresses[addressIndex].address = address;
    if (phone) user.deliveryAddresses[addressIndex].phone = phone;
    if (altPhone !== undefined) user.deliveryAddresses[addressIndex].altPhone = altPhone;
    if (city !== undefined) user.deliveryAddresses[addressIndex].city = city;
    if (state !== undefined) user.deliveryAddresses[addressIndex].state = state;
    if (zipCode !== undefined) user.deliveryAddresses[addressIndex].zipCode = zipCode;

    // Handle default/preferred address
    if (isDefault === true) {
      user.deliveryAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
      user.deliveryAddresses[addressIndex].isDefault = true;
      user.preferredAddressId = user.deliveryAddresses[addressIndex]._id;
    }

    await user.save();

    res.json({
      msg: "Address updated successfully",
      address: user.deliveryAddresses[addressIndex],
    });
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({ msg: "Error updating address" });
  }
};

// Delete a delivery address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const addressIndex = user.deliveryAddresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ msg: "Address not found" });
    }

    const deletedAddress = user.deliveryAddresses[addressIndex];
    user.deliveryAddresses.splice(addressIndex, 1);

    // If we deleted the preferred address, set a new one
    if (
      user.preferredAddressId &&
      user.preferredAddressId.toString() === addressId
    ) {
      if (user.deliveryAddresses.length > 0) {
        user.deliveryAddresses[0].isDefault = true;
        user.preferredAddressId = user.deliveryAddresses[0]._id;
      } else {
        user.preferredAddressId = null;
      }
    }

    await user.save();

    res.json({
      msg: "Address deleted successfully",
      address: deletedAddress,
    });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({ msg: "Error deleting address" });
  }
};

// Set preferred address
exports.setPreferredAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const address = user.deliveryAddresses.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({ msg: "Address not found" });
    }

    // Update all addresses
    user.deliveryAddresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    user.preferredAddressId = address._id;
    await user.save();

    res.json({
      msg: "Preferred address updated successfully",
      preferredAddressId: user.preferredAddressId,
    });
  } catch (err) {
    console.error("Error setting preferred address:", err);
    res.status(500).json({ msg: "Error setting preferred address" });
  }
};

// Get profile completion
exports.getProfileCompletion = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const profileData = user.getProfileCompletion();

    res.json({
      completion: profileData,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasAddress: user.deliveryAddresses && user.deliveryAddresses.length > 0,
      },
    });
  } catch (err) {
    console.error("Error getting profile completion:", err);
    res.status(500).json({ msg: "Error getting profile completion" });
  }
};

// Update user profile info
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    const profileData = user.getProfileCompletion();

    res.json({
      msg: "Profile updated successfully",
      completion: profileData,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasAddress: user.deliveryAddresses && user.deliveryAddresses.length > 0,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ msg: "Error updating profile" });
  }
};
