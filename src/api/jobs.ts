const BASE_URL = "http://dhruvshah2706.pythonanywhere.com/jobs/jobs/";

// ✅ GET ALL JOBS
export const getJobs = async (orgId?: string) => {
  const url = orgId
    ? `${BASE_URL}?organization=${orgId}`
    : BASE_URL;

  const res = await fetch(url);
  return res.json();
};

// ✅ GET SINGLE JOB
export const getJobById = async (id: string) => {
  const res = await fetch(`${BASE_URL}${id}/`);
  return res.json();
};

// ✅ CREATE JOB
export const createJob = async (payload: any) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ✅ UPDATE JOB
export const updateJob = async (id: string, payload: any) => {
  const res = await fetch(`${BASE_URL}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ✅ DELETE JOB
export const deleteJob = async (id: string) => {
  await fetch(`${BASE_URL}${id}/`, {
    method: "DELETE",
  });
};

// ✅ JOB OVERVIEW
export const getJobOverview = async (id: string) => {
  const res = await fetch(`${BASE_URL}${id}/overview/`);
  return res.json();
};

// ✅ JOB PIPELINE
export const getJobPipeline = async (id: string) => {
  const res = await fetch(`${BASE_URL}${id}/pipeline/`);
  return res.json();
};