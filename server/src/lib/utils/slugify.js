export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
        .replace(/\s+/g, "-")           // spaces → hyphens
        .replace(/-+/g, "-");           // remove duplicate hyphens
};