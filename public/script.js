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
  