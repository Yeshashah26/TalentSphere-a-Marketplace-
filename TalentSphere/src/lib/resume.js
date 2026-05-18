const MAX_MB = 5;

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

export function readResumeAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    const validType = ALLOWED_TYPES.has(file.type) || ALLOWED_EXT.test(file.name);
    if (!validType) {
      reject(new Error('Please upload a PDF or Word document (.pdf, .doc, .docx).'));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      reject(new Error(`Resume must be smaller than ${MAX_MB}MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        dataUrl: reader.result,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
      });
    reader.onerror = () => reject(new Error('Failed to read resume file.'));
    reader.readAsDataURL(file);
  });
}

export function downloadResume({ resume, resumeFileName, resumeMimeType }) {
  if (!resume) return;
  const a = document.createElement('a');
  a.href = resume;
  a.download = resumeFileName || 'resume.pdf';
  if (resumeMimeType) a.type = resumeMimeType;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function hasResume(candidate) {
  return Boolean(candidate?.resume);
}
