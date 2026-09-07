const config = await fetch("./map.config.json", { cache: "no-store" }).then((response) => {
  if (!response.ok) throw new Error(`Cannot load map.config.json (${response.status})`);
  return response.json();
});

const regions = config.regions ?? [];
if (!regions.length) throw new Error("map.config.json requires at least one region");

const active = new Set();
const masks = new Map();
let currentId = null;
let mapScale = 1;

const root = document.documentElement;
const board = document.querySelector("#map-board");
const stage = document.querySelector("#map-stage");
const layers = document.querySelector("#map-layers");
const journey = document.querySelector("#journey-list");
const progressNumber = document.querySelector("#progress-number");
const progressLabel = document.querySelector("#progress-label");
const zoomStatus = document.querySelector("#zoom-status");

document.title = config.title;
document.querySelector("#page-title").textContent = config.title;
document.querySelector("#page-subtitle").textContent = config.subtitle ?? "";
document.querySelector("#panel-eyebrow").textContent = config.panelEyebrow ?? "PATH";
document.querySelector("#panel-title").textContent = config.panelTitle ?? `${regions.length} 个阶段`;
document.querySelector("#instruction").textContent = config.instruction ?? "点击地图或文字路径进行选择。";
root.style.setProperty("--text-share", `${config.layout?.textPercent ?? 40}fr`);
root.style.setProperty("--map-share", `${config.layout?.mapPercent ?? 60}fr`);
root.style.setProperty("--map-aspect", config.aspectRatio ?? "16 / 9");
root.style.setProperty("--region-count", regions.length);

function createImage(className, src, alt = "") {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = alt;
  image.draggable = false;
  return image;
}

const completeMap = createImage("complete-map", config.completeImage, `${config.title}完整地图`);
layers.append(completeMap);

if (config.centerImage) {
  layers.append(createImage("center-layer", config.centerImage, ""));
}

function prepareMask(region, image, thumbnail) {
  image.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    masks.set(String(region.id), { width: canvas.width, height: canvas.height, data: pixels.data });

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < canvas.height; y += 2) {
      for (let x = 0; x < canvas.width; x += 2) {
        if (pixels.data[(y * canvas.width + x) * 4 + 3] > 24) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX >= minX && maxY >= minY) {
      const padding = Math.max(4, Math.round(Math.max(maxX - minX, maxY - minY) * .04));
      const sx = Math.max(0, minX - padding);
      const sy = Math.max(0, minY - padding);
      const sw = Math.min(canvas.width - sx, maxX - minX + padding * 2);
      const sh = Math.min(canvas.height - sy, maxY - minY + padding * 2);
      const crop = document.createElement("canvas");
      crop.width = 220;
      crop.height = 220;
      const cropContext = crop.getContext("2d");
      const scale = Math.min(crop.width / sw, crop.height / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      cropContext.drawImage(image, sx, sy, sw, sh, (220 - dw) / 2, (220 - dh) / 2, dw, dh);
      thumbnail.src = crop.toDataURL("image/png");
    }
  }, { once: true });
}

regions.forEach((region, index) => {
  const regionImage = createImage("region-layer", region.image, "");
  regionImage.dataset.region = region.id;
  regionImage.style.cssText = `--region-color:${region.color ?? "#66766c"};z-index:${10 + index}`;
  layers.append(regionImage);

  const listItem = document.createElement("li");
  listItem.innerHTML = `
    <button type="button" data-region="${region.id}" aria-pressed="false" style="--item-color:${region.color ?? "#66766c"}">
      <span class="marker">${region.id}</span>
      <span class="copy"><small>${region.state ?? ""}</small><strong>${region.title}</strong><em>${region.description ?? ""}</em></span>
      <span class="thumbnail" aria-hidden="true"><img alt=""></span>
    </button>`;
  const button = listItem.querySelector("button");
  const thumbnail = listItem.querySelector(".thumbnail img");
  thumbnail.src = region.thumbnail ?? region.image;
  button.addEventListener("click", () => toggleRegion(String(region.id)));
  journey.append(listItem);
  prepareMask(region, regionImage, thumbnail);
});

function toggleRegion(id) {
  if (active.has(id)) {
    active.delete(id);
    currentId = null;
  } else {
    active.add(id);
    currentId = id;
  }
  render();
}

function render() {
  const complete = active.size === regions.length;
  board.classList.toggle("complete", complete);
  stage.classList.toggle("complete", complete);
  document.querySelectorAll("[data-region]").forEach((element) => {
    const id = String(element.dataset.region);
    element.classList.toggle("active", active.has(id));
    element.classList.toggle("current", currentId === id);
    if (element.matches("button")) element.setAttribute("aria-pressed", String(active.has(id)));
  });
  progressNumber.textContent = `${active.size} / ${regions.length}`;
  progressLabel.textContent = complete
    ? "全部板块已合拢"
    : active.size
      ? `已点亮 ${active.size} 块，再次点击可取消`
      : "点击地图或文字路径开始";
}

function setMapZoom(nextScale, originX = 50, originY = 50) {
  const minimum = config.zoom?.min ?? 1;
  const maximum = config.zoom?.max ?? 2.4;
  mapScale = Math.min(maximum, Math.max(minimum, nextScale));
  board.style.setProperty("--map-scale", mapScale.toFixed(3));
  board.style.transformOrigin = `${originX}% ${originY}%`;
  stage.classList.toggle("zoomed", mapScale > minimum + .01);
  zoomStatus.textContent = `${Math.round(mapScale * 100)}%`;
}

function regionAtPointer(event) {
  const bounds = board.getBoundingClientRect();
  const normalizedX = (event.clientX - bounds.left) / bounds.width;
  const normalizedY = (event.clientY - bounds.top) / bounds.height;
  if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) return null;

  for (const region of [...regions].reverse()) {
    const mask = masks.get(String(region.id));
    if (!mask) continue;
    const x = Math.min(mask.width - 1, Math.max(0, Math.floor(normalizedX * mask.width)));
    const y = Math.min(mask.height - 1, Math.max(0, Math.floor(normalizedY * mask.height)));
    if (mask.data[(y * mask.width + x) * 4 + 3] > 24) return String(region.id);
  }
  return null;
}

stage.addEventListener("click", (event) => {
  const id = regionAtPointer(event);
  if (id) toggleRegion(id);
});

stage.addEventListener("wheel", (event) => {
  event.preventDefault();
  const bounds = stage.getBoundingClientRect();
  const originX = ((event.clientX - bounds.left) / bounds.width) * 100;
  const originY = ((event.clientY - bounds.top) / bounds.height) * 100;
  const factor = config.zoom?.factor ?? 1.12;
  setMapZoom(mapScale * (event.deltaY < 0 ? factor : 1 / factor), originX, originY);
}, { passive: false });

stage.addEventListener("dblclick", (event) => {
  event.preventDefault();
  setMapZoom(config.zoom?.min ?? 1);
});

document.querySelector("#reset-button").addEventListener("click", () => {
  active.clear();
  currentId = null;
  setMapZoom(config.zoom?.min ?? 1);
  render();
});

window.addEventListener("pageshow", () => {
  active.clear();
  currentId = null;
  setMapZoom(config.zoom?.min ?? 1);
  render();
});

render();
