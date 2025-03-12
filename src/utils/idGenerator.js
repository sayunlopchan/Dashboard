const Member = require("../models/Member.model.js");

const generateUniqueId = async (prefix = "test") => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const currentDay = String(currentDate.getDate()).padStart(2, "0");

    const datePrefix = `${prefix}${currentYear}${currentMonth}${currentDay}`;

    // Find last member for today only
    const lastMember = await Member.findOne(
      { memberId: { $regex: `^${datePrefix}` } },
      { memberId: 1 },
      { sort: { memberId: -1 } }
    );

    let memberNumber = 1;

    if (lastMember) {
      const lastNumber = parseInt(lastMember.memberId.slice(-3), 10);
      if (!isNaN(lastNumber)) {
        memberNumber = lastNumber + 1;
      }
    }

    const newId = generateId(
      { year: currentYear, month: currentMonth, day: currentDay },
      memberNumber,
      prefix
    );

    return newId;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    throw error;
  }
};


// Helper function to generate ID based on date and member number
const generateId = ({ year, month, day }, memberNumber, prefix) => {
  const paddedMemberNumber = String(memberNumber).padStart(3, "0");
  return `${prefix}${year}${month}${day}${paddedMemberNumber}`;
};



module.exports = generateUniqueId;