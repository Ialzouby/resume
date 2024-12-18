document.getElementById("reformatBtn").addEventListener("click", async () => {
  const formData = new FormData();
  const resumeFile = document.getElementById("resume").files[0];
  const jobDescription = document.getElementById("jobDescription").value;

  if (!resumeFile || !jobDescription) {
    alert("Please upload a resume and provide a job description.");
    return;
  }

  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  formData.append("ats", "true"); // Add a flag for ATS optimization

  const recommendationsOutput = document.getElementById("recommendations");
  recommendationsOutput.textContent = "Reformatting resume for ATS...";

  try {
    const response = await fetch("/optimize-resume", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      recommendationsOutput.textContent = data.recommendations;
    } else {
      recommendationsOutput.textContent = "Error: " + data.message;
    }
  } catch (error) {
    console.error("Error:", error);
    recommendationsOutput.textContent = "An unexpected error occurred.";
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("resume");
  const dropArea = document.getElementById("fileDropArea");
  const dropText = document.getElementById("dropText");

  // Handle drag-and-drop events
  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add("drag-over");
      dropText.textContent = "Drop the file here!";
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove("drag-over");
      dropText.textContent = "Drag & Drop your Resume (PDF) here or click to upload";
    });
  });

  // Handle file drop
  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    dropText.textContent = fileInput.files[0].name;
  });

  // Handle file selection via input
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      dropText.textContent = fileInput.files[0].name;
    }
  });

  // Open file dialog when the user clicks the drag area
  dropArea.addEventListener("click", () => {
    fileInput.click();
  });
});

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    const resumeFile = document.getElementById("resume").files[0];
    const jobDescription = document.getElementById("jobDescription").value;
  
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);
  
    const output = document.getElementById("recommendations");
    output.textContent = "Processing...";
  
    try {
      const response = await fetch("/optimize-resume", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        output.textContent = data.recommendations;
      } else {
        output.textContent = `Error: ${data.message}`;
      }
    } catch (error) {
      console.error("Error:", error);
      output.textContent = "An unexpected error occurred.";
    }
  });
  

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const recommendations = document.getElementById("recommendations").textContent;
    const blob = new Blob([recommendations], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ATS_Optimized_Resume.txt";
    link.click();
  });
  
  function showDownloadButton() {
    document.getElementById("downloadBtn").style.display = "block";
  }
  