const meta = {
  name: "sample",
  version: "1.0.0",
  description: "A simple test api",
  author: "AjiroDesu",
  method: "post",
  category: "examples",
  path: "/sampleapi"
};

async function onStart({ res, req }) {
  try {
    // Assume the incoming request has JSON data (e.g., using body-parser middleware)
    const requestData = req.body;

    // Perform any necessary operations here, such as validation or database insertion
    console.log("Received data:", requestData);

    // Send a JSON response back to the client
    res.json({
      message: "POST request received successfully",
      receivedData: requestData
    });
  } catch (error) {
    // Handle errors and send an error response
    res.status(500).json({ error: error.message });
  }
}

module.exports = { meta, onStart };
