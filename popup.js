document.addEventListener('DOMContentLoaded', async () => {
  const selectFilesBtn = document.getElementById('selectFiles');
  const generateFileBtn = document.getElementById('generateFile');
  const clearSelectionBtn = document.getElementById('clearSelection');
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const loading = document.getElementById('loading');

  // Load saved files on popup open
  const { selectedFiles: files = [] } = await chrome.storage.local.get('selectedFiles');
  updateFileList(files);

  // Helper to toggle loading state
  function toggleLoading(isLoading) {
    loading.style.display = isLoading ? 'block' : 'none';
    selectFilesBtn.disabled = generateFileBtn.disabled = clearSelectionBtn.disabled = isLoading;
  }

  // Select Files button
  selectFilesBtn.addEventListener('click', async () => {
    toggleLoading(true);
    try {
      let newFiles;
      if (window.showOpenFilePicker) {
        const fileHandles = await window.showOpenFilePicker({ multiple: true });
        newFiles = await Promise.all(fileHandles.map(async (handle) => {
          const file = await handle.getFile();
          const content = await file.text();
          return { name: file.name, content };
        }));
      } else {
        fileInput.click();
        return;
      }
      await addFiles(newFiles);
    } catch (err) {
      console.error('Error selecting files:', err);
      alert('Failed to select files. Please try again.');
    } finally {
      toggleLoading(false);
    }
  });

  // File input fallback
  fileInput.addEventListener('change', async () => {
    toggleLoading(true);
    try {
      const newFiles = await Promise.all(Array.from(fileInput.files).map(async (file) => {
        const content = await file.text();
        return { name: file.name, content };
      }));
      await addFiles(newFiles);
    } catch (err) {
      console.error('Error reading files:', err);
      alert('Failed to read files. Please try again.');
    } finally {
      fileInput.value = '';
      toggleLoading(false);
    }
  });

  // Generate code.txt button
  generateFileBtn.addEventListener('click', async () => {
    toggleLoading(true);
    try {
      const { selectedFiles: files = [] } = await chrome.storage.local.get('selectedFiles');
      if (files.length === 0) {
        alert('No files selected.');
        return;
      }
      let content = files.map(file => `// ${file.name}\n${file.content}\n\n`).join('');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      await chrome.downloads.download({ url, filename: 'code.txt' });
    } catch (err) {
      console.error('Error generating file:', err);
      alert('Failed to generate code.txt. Please try again.');
    } finally {
      toggleLoading(false);
    }
  });

  // Clear Selection button
  clearSelectionBtn.addEventListener('click', async () => {
    toggleLoading(true);
    await chrome.storage.local.remove('selectedFiles');
    updateFileList([]);
    toggleLoading(false);
  });

  // Save files to storage and update display (with storage size check)
  async function saveFiles(files) {
    const data = { selectedFiles: files };
    const size = new Blob([JSON.stringify(data)]).size;
    if (size > 4 * 1024 * 1024) { // Warn if >4MB (close to 5MB limit)
      alert('Warning: Selected files are large and may exceed storage limits. Consider removing some.');
    }
    await chrome.storage.local.set(data);
    updateFileList(files);
  }

  // Add new files to the existing list (avoid duplicates by name)
  async function addFiles(newFiles) {
    const { selectedFiles: existingFiles = [] } = await chrome.storage.local.get('selectedFiles');
    const existingNames = new Set(existingFiles.map(f => f.name));
    const filteredNewFiles = newFiles.filter(f => !existingNames.has(f.name));
    if (filteredNewFiles.length < newFiles.length) {
      alert('Some files were skipped as duplicates (by name).');
    }
    const updatedFiles = [...existingFiles, ...filteredNewFiles].sort((a, b) => a.name.localeCompare(b.name));
    await saveFiles(updatedFiles);
  }

  // Remove a file by index
  async function removeFile(index) {
    const { selectedFiles: files = [] } = await chrome.storage.local.get('selectedFiles');
    if (index >= 0 && index < files.length) {
      files.splice(index, 1);
      await saveFiles(files);
    }
  }

  // Update the file list display
  function updateFileList(files) {
    fileList.innerHTML = '';
    files.forEach((file, index) => {
      const li = document.createElement('li');
      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;
      li.appendChild(nameSpan);
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'X';
      removeBtn.style.color = 'red';
      removeBtn.style.marginLeft = '10px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.addEventListener('click', () => removeFile(index));
      li.appendChild(removeBtn);
      fileList.appendChild(li);
    });
  }
});
