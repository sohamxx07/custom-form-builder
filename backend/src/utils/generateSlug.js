const crypto = require('crypto');

/**
 * Normalizes text to a clean URL slug format
 * e.g. "Farmer Registration!" -> "farmer-registration"
 */
const slugify = (text) => {
  const base = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-alphanumeric, spaces, and hyphens
    .replace(/[\s_-]+/g, '-')     // collapse whitespace and underscores into hyphens
    .replace(/^-+|-+$/g, '');    // trim leading and trailing hyphens

  return base || 'form';
};

/**
 * Generates a random alphanumeric string
 * e.g. "a82k9"
 */
const generateRandomSuffix = (length = 5) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Generates a unique collision-free slug for a model
 * e.g. "Farmer Registration" -> "farmer-registration-a82k9"
 */
const generateUniqueSlug = async (title, Model, currentRecordId = null) => {
  const baseSlug = slugify(title);
  let isUnique = false;
  let finalSlug = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    const suffix = generateRandomSuffix(5);
    finalSlug = `${baseSlug}-${suffix}`;

    const existing = await Model.findOne({
      where: { slug: finalSlug },
      attributes: ['id', 'slug'],
    });

    if (!existing || (currentRecordId && existing.id === currentRecordId)) {
      isUnique = true;
    }
  }

  return finalSlug;
};

module.exports = {
  slugify,
  generateRandomSuffix,
  generateUniqueSlug,
};
