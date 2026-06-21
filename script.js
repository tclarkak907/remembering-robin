const gallery = document.querySelector("#gallery");
const loadMoreButton = document.querySelector("#load-more");
const chapterStrip = document.querySelector("#chapter-strip");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");

let galleryItems = [];
let visibleCount = 0;
let activePhoto = 0;
const batchSize = 28;

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function addGalleryBatch() {
  const nextItems = galleryItems.slice(visibleCount, visibleCount + batchSize);
  const fragment = document.createDocumentFragment();

  nextItems.forEach((item, offset) => {
    const index = visibleCount + offset;
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.className = "gallery-button";
    button.type = "button";
    button.setAttribute("aria-label", `Open memory ${index + 1}`);
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = item.width;
    image.height = item.height;

    button.append(image);
    button.addEventListener("click", () => openLightbox(index));
    fragment.append(button);
  });

  gallery.append(fragment);
  visibleCount += nextItems.length;
  loadMoreButton.hidden = visibleCount >= galleryItems.length;
}

function openLightbox(index) {
  activePhoto = index;
  lightboxImage.src = galleryItems[index].src;
  lightboxImage.alt = galleryItems[index].alt;
  lightbox.showModal();
}

function moveLightbox(direction) {
  activePhoto = (activePhoto + direction + galleryItems.length) % galleryItems.length;
  lightboxImage.src = galleryItems[activePhoto].src;
  lightboxImage.alt = galleryItems[activePhoto].alt;
}

async function initialize() {
  const [photos, themes] = await Promise.all([
    loadJson("assets/gallery.json"),
    loadJson("assets/themes.json"),
  ]);

  galleryItems = photos;
  addGalleryBatch();

  themes.slice(0, 8).forEach((theme) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = theme.src;
    image.alt = theme.alt;
    image.loading = "lazy";
    image.width = theme.width;
    image.height = theme.height;
    figure.append(image);
    chapterStrip.append(figure);
  });
}

loadMoreButton.addEventListener("click", addGalleryBatch);
lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.querySelector(".previous").addEventListener("click", () => moveLightbox(-1));
lightbox.querySelector(".next").addEventListener("click", () => moveLightbox(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

initialize().catch(() => {
  loadMoreButton.hidden = true;
});
