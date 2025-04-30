document.getElementById("fileUploadForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  // Display upload status
  document.getElementById("uploadStatus").innerText = "Uploading file...";

  // Simulate file upload and storing in S3
  setTimeout(() => {
    // After 3 seconds (simulating file upload)
    document.getElementById("uploadStatus").innerText = "File uploaded successfully!";

    // Provide download link
    const downloadLink = "https://your-bucket.s3.amazonaws.com/" + file.name;
    document.getElementById("downloadLink").href = downloadLink;
    document.getElementById("downloadLinkContainer").classList.remove("hidden");

    // Save the uploaded file in local storage
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    uploadedFiles.push(file.name);
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));

    // Clear the file input to allow selecting another file
    fileInput.value = '';

    // Update the list of uploaded files
    displayUploadedFiles();
  }, 3000);
});

// Function to display the list of uploaded files from local storage
function displayUploadedFiles() {
  const uploadedFilesList = document.getElementById("uploadedFilesList");
  const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

  uploadedFilesList.innerHTML = '';

  uploadedFiles.forEach(fileName => {
    const listItem = document.createElement("li");
    const downloadLink = document.createElement("a");
    downloadLink.href = "https://your-bucket.s3.amazonaws.com/" + fileName;
    downloadLink.target = "_blank";
    downloadLink.textContent = fileName;
    listItem.appendChild(downloadLink);
    uploadedFilesList.appendChild(listItem);
  });
}

// Call displayUploadedFiles on page load to load saved files
window.onload = function() {
  displayUploadedFiles();
};
