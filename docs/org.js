document.addEventListener("DOMContentLoaded", () => structureDocument());

/**
 * Arrange the org exported html into a convenient structure for styling
 */
function structureDocument() {
  const body = document.body;

  // Move #content > TOC into body
  let toc = document.getElementById("table-of-contents");
  if (toc) body.prepend(toc);

  // Move #content > header into body
  const header = document.querySelector("#content > header");
  if (header) body.prepend(header);

  // Move #content > #footnotes into body
  let footnotes = document.getElementById("footnotes");
  if (footnotes) {
    // before #postamble, if exists
    const post = document.getElementById("postamble");
    if (post) body.insertBefore(footnotes, post);
    else body.append(footnotes);
  }

  // Add .toc class to the body if the element is not empty
  if (toc) {
    if (toc.firstChild == null) {
      toc.remove();
      toc = undefined;
    }
    else body.classList.add("toc");
  }
  // Add .footnotes class to the body if the element is not empty
  if (footnotes) {
    if (footnotes.firstChild == null) {
      footnotes.remove();
      footnotes = undefined;
    }
    else body.classList.add("fn");
  }

  // Content :: Un-nest outline sections
  const content = document.getElementById("content");
  const classes1 = Array.from({length: 5}, (_, i) => `.outline-${i+1}`).join(",");
  const elms1 = content.querySelectorAll(classes1);
  for (const elm of elms1) {
    content.append(...elm.childNodes);
    elm.remove();
  }

  // Wrap all text + add missing els in headings
  const hds = content.querySelectorAll(":is(h2, h3, h4, h5, h6)");
  for (const hd of hds) {
    hd.appendChild(makeBodyElm(hd));
    normalizeHd(hd);
  }

  // Remove all &nbsp; between tags
  const tags = content.querySelectorAll(":is(h2, h3, h4, h5, h6) > .tag");
  for (const tag of tags) {
    const frag = document.createDocumentFragment();
    for (const elm of [...tag.children]) frag.append(elm);
    tag.replaceChildren(frag);
  }

  // Remove empty `outline-text-{2,6}`
  const classes2 = Array.from({length: 4}, (_, i) => `.outline-text-${i+2}`).join(",");
  const elms2 = content.querySelectorAll(classes2);
  for (const elm of elms2) if (elm.children.length < 1) elm.remove();

  // wrap tables and pre to prevent overflow
  const tables = content.querySelectorAll("table, pre");
  for (const elm of tables) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("overflow-auto");
    elm.before(wrapper);
    wrapper.appendChild(elm);
  }
}

////////////////////////////////////////////////////////////////////////////////

const hdClasses = ["todo", "done", "priority", "tag"];

function makeBodyElm(hd) {
  const nodes = Array.from(hd.childNodes);
  const bodyElm = makeHdElm("body");

  for (const node of nodes) {
    if (node instanceof Text && node.textContent.trim().length < 1) continue;
    if (node instanceof HTMLElement) {
      if (
        node.className.startsWith("section-number-") ||
        hdClasses.some(it => node.classList.contains(it))
      ) continue;
      // else fall-off
    } // else fall-off
    bodyElm.appendChild(node);
  }

  return bodyElm;
}

function normalizeHd(hd) {
  const frag = document.createDocumentFragment();

  let elm = hd.firstElementChild;
  if (!(elm instanceof HTMLElement && elm.className.startsWith("section-number-"))) {
    elm = makeHdElm("");
  }
  elm.classList.add("section-number");
  frag.appendChild(elm);

  elm = hd.querySelector("& > .todo, & > .done");
  if (!(elm instanceof HTMLElement)) {
    elm = makeHdElm("todo");
  }
  frag.appendChild(elm);

  elm = hd.querySelector("& > .priority");
  if (!(elm instanceof HTMLElement)) {
    elm = makeHdElm("priority");
  }
  frag.appendChild(elm);

  elm = hd.querySelector("& > .body");
  if (!(elm instanceof HTMLElement)) {
    elm = makeHdElm("body");
  }
  frag.appendChild(elm);

  elm = hd.querySelector("& > .tag");
  if (!(elm instanceof HTMLElement)) {
    elm = makeHdElm("tag");
  }
  frag.appendChild(elm);

  hd.replaceChildren(frag);

  return hd;
}

function makeHdElm(klass) {
  const bodyElm = document.createElement("span");
  bodyElm.setAttribute("class", klass);
  return bodyElm;
}
