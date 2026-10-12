import {
  uploadData,
  list,
  downloadData,
  remove,
} from "aws-amplify/storage";

export async function uploadDocument(
  file: File,
  category: string
) {
  try {
    const result = await uploadData({
      path: ({ identityId }) =>
        `private/${identityId}/documents/${category}/${file.name}`,
      data: file,
    }).result;

    console.log("Upload successful:", result);

    return result;
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Error details:", error?.details);

    throw error;
  }
}

export async function listDocuments() {
  try {
    const result = await list({
      path: ({ identityId }) =>
        `private/${identityId}/documents/`,
    });

    console.log("Documents:", result.items);

    return result.items;
  } catch (error) {
    console.error("Failed to list documents:", error);

    throw error;
  }
}

export async function downloadDocument(path: string) {
  try {
    const result = await downloadData({
      path,
    }).result;

    const blob = await result.body.blob();

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const fileName = path.split("/").pop() || "document";
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log("Download successful:", fileName);
  } catch (error) {
    console.error("Download failed:", error);

    throw error;
  }
}

export async function deleteDocument(path: string) {
  try {
    await remove({
      path,
    });

    console.log("Document deleted successfully:", path);
  } catch (error) {
    console.error("Delete failed:", error);

    throw error;
  }
}