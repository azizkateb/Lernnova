export const extractArray = (result, fallbackKeys = []) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  for (const key of fallbackKeys) {
    if (Array.isArray(result?.[key])) return result[key];
  }
  return [];
};

export const extractPagination = (result, items = []) => ({
  page: result?.page || 1,
  limit: result?.limit || 10,
  total: result?.total ?? items.length,
  totalPages: result?.totalPages || 1,
});
