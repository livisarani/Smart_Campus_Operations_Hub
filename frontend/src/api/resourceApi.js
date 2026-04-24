const API_BASE_URL = "http://localhost:8080/api/resources";

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const getAllResources = async () => {
  const response = await fetch(API_BASE_URL);

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to fetch resources");
    throw new Error(message);
  }

  return response.json();
};

export const createResource = async (resource) => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to create resource");
    throw new Error(message);
  }

  return response.json();
};

export const updateResource = async (id, resource) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to update resource");
    throw new Error(message);
  }

  return response.json();
};

export const deleteResource = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to delete resource");
    throw new Error(message);
  }
};

export const searchResourcesByName = async (name) => {
  const response = await fetch(
    `${API_BASE_URL}/search?name=${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    const message = await getErrorMessage(response, "Failed to search resources");
    throw new Error(message);
  }

  return response.json();
};