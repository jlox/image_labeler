const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-image/`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const saveSelections = async (imageId: string, selections: any[]) => {
  const response = await fetch(`${API_BASE_URL}/save-selections/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_id: imageId,
      selections,
    }),
  });
  return response.json();
};