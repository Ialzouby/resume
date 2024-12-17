const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  

// Serve Static Files (Frontend)
app.use(express.static("public"));

// File Upload Setup
const upload = multer({ dest: "upload/" });

// API Route for Resume Optimization
app.post("/optimize-resume", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;

    if (!req.file || !jobDescription) {
      return res.status(400).json({ message: "Missing file or job description" });
    }

    const pdfBuffer = require("fs").readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    const prompt = `
      Optimize the resume to fit the given job description.

      **Resume**:
      ${resumeText}

      **Job Description**:
      ${jobDescription}

      Suggestions:
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      

      console.log("OpenAI Response:", response);
      if (response && response.choices && response.choices.length > 0) {
        const recommendations = response.choices[0].message.content;
        res.status(200).json({ recommendations });
      } else {
        res.status(500).json({ message: "Invalid response from OpenAI API" });
      }
      
    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
