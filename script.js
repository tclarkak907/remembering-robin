const gallery = document.querySelector("#gallery");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");

let galleryItems = [];
let activePhoto = 0;

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}

function renderGallery() {
  const fragment = document.createDocumentFragment();

  galleryItems.forEach((item, index) => {
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
  galleryItems = await loadJson("assets/gallery.json");
  renderGallery();
}

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
  gallery.setAttribute("aria-label", "The photo gallery could not be loaded.");
});
