export const signup = async (formData: any) => {
  return await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};


export const updateProfile = async (formData: any) => {
  return await fetch("/api/auth/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};

export const createDocument = async (formData: any) => {
  return await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};

export const getDocuments = async (): Promise<Response> => {
  const response = await fetch("/api/documents");
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return response.json();

};

export const getDocument = async (id: string) => {
  const response = await fetch(`/api/documents/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for sending auth cookies
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("You don't have permission to access this document");
    }
    if (response.status === 401) {
      throw new Error("Please sign in to access this document");
    }
    throw new Error("Failed to fetch document");
  }

  return response.json();
};

export const updateDocument = async (id: string, formData: any) => {
  return await fetch(`/api/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};

export const deleteDocument = async (id: string) => {
  return await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
};

export const getShareDocument = async (id: string) => {
  const response =  await fetch(`/api/documents/shared/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shared document");
  }
  return response.json();
};

export const shareDocument = async (id: string, formData: any) => {
  return await fetch(`/api/documents/share/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });
};

export const getOneTimeDocument = async (id: string, key: string) => {
  const response =  await fetch(`/api/one-time/${id}?key=${key}`);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to access document");
  }
  return response.json();
};
