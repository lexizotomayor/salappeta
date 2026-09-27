// Planned explainers show in the list but get no page until they are written.
export default {
  layout: "layouts/explainer.njk",
  navSet: "reading",
  eleventyComputed: {
    permalink: (data) => (data.planned ? false : `/explainers/${data.page.fileSlug}/`),
  },
};
