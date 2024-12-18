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
    You are an expert career coach and resume optimization specialist. Your task is to analyze a resume and compare it to a provided job description to recommend precise improvements. Follow the structure below carefully.
    
    ---
    
    ### **Input:**
    
    **Resume Text**:
    ${resumeText}
    
    **Job Description**:
    ${jobDescription}
    
    ---
    
    ### **Your Output Format:**
    
    1. **Lines That Should Be Changed**:  
       Identify specific lines in the resume that do not fully align with the job description. For each line:
       - Present the **original line**.
       - Provide a **revised version** that better matches the job description requirements.
    
       Format Example:  
       - Original: "<Original Line>"  
       - Revised: "<Revised Line>"  
    
    ---
    
    2. **Recommended Additions**:  
       Suggest specific skills, projects, achievements, or experiences that are **missing** from the resume but are critical to match the job description. Be specific and actionable.  
    
       Example:  
       - Add a section that highlights experience with [specific skill or tool].
       - Include a quantifiable achievement such as "<achieved X outcome by doing Y>."
    
    ---
    
    3. **Concepts to Learn or Prepare**:  
       List the most relevant skills, technologies, or concepts the candidate should focus on learning or preparing for to be a strong fit for the role. Be concise and actionable.  
    
       Example:  
       - Learn about [technology/tool] to meet the role's technical requirements.
       - Practice [specific skill] to improve alignment with the responsibilities of the job.
    
    ---
    
    ### **Instructions**:
    - Tailor all suggestions specifically to the provided job description.  
    - Keep your output clear, concise, and actionable.  
    - Do not include explanations or generic advice—focus on concrete recommendations.
    
    ---
    
    Return your response **only in the format specified above**.
    `;

    const atsPrompt = `
You are an expert in resume optimization for Applicant Tracking Systems (ATS). 
Reformat the following resume to be ATS-friendly:

1. Use clear and clean formatting without tables, columns, or images.
2. Use standard section headings: Summary, Skills, Experience, Education.
3. Remove unnecessary symbols and complex formatting.
4. Use keywords from the provided job description to improve ATS matching.

**Resume:**
${resumeText}

**Job Description:**
${jobDescription}

Provide the reformatted resume as plain text, formatted to work with ATS.
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
      
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
