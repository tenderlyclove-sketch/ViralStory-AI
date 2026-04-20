import JSZip from 'jszip';

interface ZipEntry {
  path: string;
  content: Uint8Array;
}

export async function downloadZipFile(fileName: string, entries: ZipEntry[]) {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.path, entry.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
