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
  return await fetch("/api/documents");
};

export const getDocument = async (slug: string) => {
  return await fetch(`/api/documents/${slug}`);
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
  return await fetch(`/api/documents/shared/${id}`);
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

export const getOneTimeDocument = async (id: string) => {
  return await fetch(`/api/one-time/${id}`);
};
