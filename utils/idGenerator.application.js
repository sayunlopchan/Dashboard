const Application = require("../models/Application.model.js");

// Generate a unique application ID using a default prefix "app"
const generateApplicationId = async (prefix = "app") => {
  try {
    // Retrieve the most recent application (ordered by applicationId descending)
    const lastApplication = await Application.findOne(
      {},
      { applicationId: 1, createdAt: 1 },
      { sort: { applicationId: -1 } }
    );

    let newId;

    if (!lastApplication) {
      // No applications exist: use current date and start numbering at 1
      const currentDate = new Date();
      console.log('No applications found. Using current date:', currentDate);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      newId = generateId({ year, month, day }, 1, prefix);
      console.log('Generated unique ID for first application:', newId);
    } else {
      // Get date from the last application’s createdAt field
      const createdAt = lastApplication.createdAt || new Date();
      console.log('Last application createdAt:', createdAt);

      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0");
      const day = String(createdAt.getDate()).padStart(2, "0");

      // Determine the next sequential application number
      let applicationNumber = 1;
      const lastNumber = parseInt(lastApplication.applicationId.slice(-3), 10);
      if (!isNaN(lastNumber)) {
        applicationNumber = lastNumber + 1;
      }

      console.log('Next application number:', applicationNumber);

      newId = generateId({ year, month, day }, applicationNumber, prefix);
      console.log('Generated unique application ID:', newId);
    }

    if (!newId) {
      throw new Error("Failed to generate a unique application ID");
    }

    return newId;
  } catch (error) {
    console.error('Error generating unique application ID:', error);
    throw error;
  }
};

// Helper function to generate an ID based on a date object and a sequential number
const generateId = ({ year, month, day }, applicationNumber, prefix) => {
  const paddedApplicationNumber = String(applicationNumber).padStart(3, "0");
  return `${prefix}${year}${month}${day}${paddedApplicationNumber}`;
};

module.exports = generateApplicationId;
