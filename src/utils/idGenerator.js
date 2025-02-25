const Member = require("../models/Member.model.js");

const generateUniqueId = async (prefix = "test") => {
  try {
    // Get the most recent member (based on their memberId) to determine today's date
    const lastMember = await Member.findOne({}, { memberId: 1, createdAt: 1 }, { sort: { memberId: -1 } });

    let newId;

    if (!lastMember) {
      // If no member exists, use current date
      const currentDate = new Date();
      console.log('No members found. Using current date:', currentDate);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      newId = generateId({ year, month, day }, 1, prefix); // Pass the correct date object
      console.log('Generated unique ID for first member:', newId);
    } else {
      // If there's a last member, extract the date from `createdAt`
      const createdAt = lastMember.createdAt || new Date();
      console.log('Last member createdAt:', createdAt);

      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0");
      const day = String(createdAt.getDate()).padStart(2, "0");

      // Find the next member number
      let memberNumber = 1;
      const lastNumber = parseInt(lastMember.memberId.slice(-3), 10);
      if (!isNaN(lastNumber)) {
        memberNumber = lastNumber + 1;
      }

      console.log('Next member number:', memberNumber);

      newId = generateId({ year, month, day }, memberNumber, prefix); // Generate and return the unique ID
      console.log('Generated unique ID:', newId);
    }

    if (!newId) {
      throw new Error("Failed to generate a unique ID");
    }

    return newId;
  } catch (error) {
    console.error('Error generating unique ID:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// Helper function to generate ID based on date and member number
const generateId = ({ year, month, day }, memberNumber, prefix) => {
  const paddedMemberNumber = String(memberNumber).padStart(3, "0");
  return `${prefix}${year}${month}${day}${paddedMemberNumber}`;
};

module.exports = generateUniqueId;