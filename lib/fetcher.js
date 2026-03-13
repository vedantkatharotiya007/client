export const fetcher = async (endpoint, options = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  const method = options.method || "GET";

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const fetchOptions = {
    ...options,
    method,
    headers,
  };

  // ✅ only attach body for non-GET
  if (options.body && method !== "GET") {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${baseURL}${endpoint}`, fetchOptions);

  // ✅ safer response parsing
  const contentType = res.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text(); // fallback
  }

  if (!res.ok) {
    throw new Error(data?.message || data || "Something went wrong");
  }

  return data;
};