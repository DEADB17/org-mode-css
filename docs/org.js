/**
 * Arrange the org exported html into a convenient structure for styling
 */
function structureDocument() {
  const body = document.body;

  // Move #content > TOC into body
  const toc = document.getElementById("table-of-contents");
  if (toc) body.prepend(toc);

  // Move #content > header into body
  const header = document.querySelector("#content > header");
  if (header) body.prepend(header);

  // Move #content > #footnotes into body
  const foot = document.getElementById("footnotes");
  if (foot) {
    // before #postamble, if exists
    const post = document.getElementById("postamble");
    if (post) body.insertBefore(foot, post);
    else body.append(foot);
  }
}

document.addEventListener("DOMContentLoaded", () => structureDocument());
