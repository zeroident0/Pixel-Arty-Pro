/**
 * Pixel Arty Pro - A pixel art drawing application
 * This file contains all the JavaScript functionality for the pixel art editor
 */

// ===== DOM Element References =====
// Main grid container and drawing tools
const grid = document.getElementById("pixelGrid");
const colorPicker = document.getElementById("colorPicker");
const colorPalette = document.getElementById("colorPalette");

// Control buttons
const clearButton = document.getElementById("clear");
const toggleGridButton = document.getElementById("toggleGrid");
const downloadButton = document.getElementById("download");

// Grid and pixel size controls
const gridSizeSelect = document.getElementById("gridSize");
const pixelSizeInput = document.getElementById("pixelSize");

// Drawing tool buttons
const pencilButton = document.getElementById("pencilTool");
const fillButton = document.getElementById("fillTool");
const eraserButton = document.getElementById("eraserTool");

// ===== Application State =====
// Current drawing settings
let currentColor = colorPicker.value;
let currentTool = "pencil";
let isDrawing = false;
let gridSize = parseInt(gridSizeSelect.value);
let pixelSize = parseInt(pixelSizeInput.value);
let showGridLines = true;

// Default color palette - Basic colors plus some additional ones
const colors = [
	"#000000", // Black
	"#ffffff", // White
	"#ff0000", // Red
	"#00ff00", // Green
	"#0000ff", // Blue
	"#ffff00", // Yellow
	"#00ffff", // Cyan
	"#ff00ff", // Magenta
	"#ff9900", // Orange
	"#9900ff"  // Purple
];

/**
 * Initialize the application
 * Sets up the color palette, creates the pixel grid, and attaches event listeners
 */
function initApp() {
	createColorPalette();
	createPixelGrid();
	setupEventListeners();
}

/**
 * Creates the color palette buttons
 * Generates clickable color swatches for quick color selection
 */
function createColorPalette() {
	colorPalette.innerHTML = "";
	colors.forEach(color => {
		const colorButton = document.createElement("div");
		colorButton.classList.add("palette-color");
		colorButton.style.backgroundColor = color;
		colorButton.dataset.color = color;

		// Mark the current color as active
		if (color === currentColor) {
			colorButton.classList.add("active");
		}

		// Handle color selection
		colorButton.addEventListener("click", () => {
			currentColor = color;
			colorPicker.value = color;
			// Update active state of all color buttons
			document.querySelectorAll(".palette-color").forEach(btn => {
				btn.classList.remove("active");
			});
			colorButton.classList.add("active");
		});

		colorPalette.appendChild(colorButton);
	});
}

/**
 * Creates the pixel grid
 * Generates a grid of clickable pixels based on the current grid and pixel size settings
 */
function createPixelGrid() {
	grid.innerHTML = "";

	// Configure grid layout
	grid.style.gridTemplateColumns = `repeat(${gridSize}, ${pixelSize}px)`;
	grid.style.gridTemplateRows = `repeat(${gridSize}, ${pixelSize}px)`;
	grid.style.gap = "0";

	// Create individual pixels
	for (let i = 0; i < gridSize * gridSize; i++) {
		const pixel = document.createElement("div");
		pixel.classList.add("pixel");
		pixel.style.width = `${pixelSize}px`;
		pixel.style.height = `${pixelSize}px`;
		pixel.style.backgroundColor = "#ffffff";

		// Store pixel position data
		pixel.dataset.index = i;
		pixel.dataset.row = Math.floor(i / gridSize);
		pixel.dataset.col = i % gridSize;

		// Add drawing event listeners
		pixel.addEventListener("mousedown", startDrawing);
		pixel.addEventListener("mouseover", draw);
		pixel.addEventListener("touchstart", handleTouch);
		pixel.addEventListener("touchmove", handleTouchMove);

		grid.appendChild(pixel);
	}

	updateGridLines();
}

/**
 * Updates the visibility of grid lines
 * Toggles the border of each pixel to show/hide the grid
 */
function updateGridLines() {
	const pixels = document.querySelectorAll(".pixel");
	pixels.forEach(pixel => {
		if (showGridLines) {
			pixel.style.border = "1px solid rgba(0,0,0,0.1)";
		} else {
			pixel.style.border = "none";
		}
	});
}

/**
 * Sets up all event listeners for the application
 * Handles user interactions with tools, color picker, and grid controls
 */
function setupEventListeners() {
	// Global mouse and touch events
	document.addEventListener("mouseup", stopDrawing);
	document.addEventListener("touchend", stopDrawing);

	// Color picker events
	colorPicker.addEventListener("input", () => {
		currentColor = colorPicker.value;
		document.querySelectorAll(".palette-color").forEach(btn => {
			btn.classList.remove("active");
			if (btn.dataset.color === currentColor) {
				btn.classList.add("active");
			}
		});
	});

	// Control button events
	clearButton.addEventListener("click", () => {
		document.querySelectorAll(".pixel").forEach(pixel => {
			pixel.style.backgroundColor = "#ffffff";
		});
	});

	toggleGridButton.addEventListener("click", () => {
		showGridLines = !showGridLines;
		updateGridLines();
	});

	downloadButton.addEventListener("click", saveImage);

	// Grid size control events
	gridSizeSelect.addEventListener("change", () => {
		gridSize = parseInt(gridSizeSelect.value);
		createPixelGrid();
	});

	pixelSizeInput.addEventListener("change", () => {
		pixelSize = parseInt(pixelSizeInput.value);
		// Enforce size limits
		if (pixelSize < 10) pixelSize = 10;
		if (pixelSize > 30) pixelSize = 30;
		pixelSizeInput.value = pixelSize;
		createPixelGrid();
	});

	// Tool selection events
	pencilButton.addEventListener("click", () => setActiveTool("pencil"));
	fillButton.addEventListener("click", () => setActiveTool("fill"));
	eraserButton.addEventListener("click", () => setActiveTool("eraser"));
}

/**
 * Sets the active drawing tool
 * Updates the UI to reflect the selected tool
 * @param {string} tool - The tool to activate ('pencil', 'fill', or 'eraser')
 */
function setActiveTool(tool) {
	currentTool = tool;
	// Remove active state from all tools
	document.querySelectorAll(".tool-button").forEach(btn => {
		btn.classList.remove("active");
	});

	// Set active state for selected tool
	switch (tool) {
		case "pencil":
			pencilButton.classList.add("active");
			break;
		case "fill":
			fillButton.classList.add("active");
			break;
		case "eraser":
			eraserButton.classList.add("active");
			break;
	}
}

// ===== Drawing Functions =====

/**
 * Handles the start of drawing
 * @param {Event} e - The mouse or touch event
 */
function startDrawing(e) {
	isDrawing = true;

	if (currentTool === "fill") {
		fillArea(e.target);
	} else {
		colorPixel(e.target);
	}
}

/**
 * Handles drawing while mouse is moving
 * @param {Event} e - The mouse event
 */
function draw(e) {
	if (!isDrawing) return;
	colorPixel(e.target);
}

/**
 * Stops the drawing operation
 */
function stopDrawing() {
	isDrawing = false;
}

/**
 * Colors a single pixel based on the current tool
 * @param {HTMLElement} pixel - The pixel element to color
 */
function colorPixel(pixel) {
	if (currentTool === "eraser") {
		pixel.style.backgroundColor = "#ffffff";
	} else if (currentTool === "pencil") {
		pixel.style.backgroundColor = currentColor;
	}
}

/**
 * Implements flood fill algorithm
 * Fills connected pixels of the same color
 * @param {HTMLElement} startPixel - The pixel where the fill started
 */
function fillArea(startPixel) {
	const targetColor = startPixel.style.backgroundColor;
	const fillColor = currentTool === "eraser" ? "#ffffff" : currentColor;

	// Don't fill if target and fill colors are the same
	if (targetColor === fillColor) return;

	const pixels = Array.from(document.querySelectorAll(".pixel"));
	const visited = new Set();
	const queue = [startPixel];

	// Breadth-first search for connected pixels
	while (queue.length > 0) {
		const pixel = queue.shift();
		if (visited.has(pixel.dataset.index)) continue;

		if (pixel.style.backgroundColor === targetColor) {
			pixel.style.backgroundColor = fillColor;
			visited.add(pixel.dataset.index);

			const row = parseInt(pixel.dataset.row);
			const col = parseInt(pixel.dataset.col);

			// Check and add neighboring pixels
			// Up
			if (row > 0) {
				const upIndex = (row - 1) * gridSize + col;
				const up = pixels.find(p => p.dataset.index == upIndex);
				if (up && !visited.has(up.dataset.index) && up.style.backgroundColor === targetColor) {
					queue.push(up);
				}
			}

			// Down
			if (row < gridSize - 1) {
				const downIndex = (row + 1) * gridSize + col;
				const down = pixels.find(p => p.dataset.index == downIndex);
				if (down && !visited.has(down.dataset.index) && down.style.backgroundColor === targetColor) {
					queue.push(down);
				}
			}

			// Left
			if (col > 0) {
				const leftIndex = row * gridSize + (col - 1);
				const left = pixels.find(p => p.dataset.index == leftIndex);
				if (left && !visited.has(left.dataset.index) && left.style.backgroundColor === targetColor) {
					queue.push(left);
				}
			}

			// Right
			if (col < gridSize - 1) {
				const rightIndex = row * gridSize + (col + 1);
				const right = pixels.find(p => p.dataset.index == rightIndex);
				if (right && !visited.has(right.dataset.index) && right.style.backgroundColor === targetColor) {
					queue.push(right);
				}
			}
		}
	}
}

// ===== Touch Event Handlers =====

/**
 * Handles touch start events
 * @param {TouchEvent} e - The touch event
 */
function handleTouch(e) {
	e.preventDefault();
	const touch = e.touches[0];
	const pixel = document.elementFromPoint(touch.clientX, touch.clientY);

	if (pixel && pixel.classList.contains("pixel")) {
		isDrawing = true;

		if (currentTool === "fill") {
			fillArea(pixel);
		} else {
			colorPixel(pixel);
		}
	}
}

/**
 * Handles touch move events
 * @param {TouchEvent} e - The touch event
 */
function handleTouchMove(e) {
	if (!isDrawing) return;

	e.preventDefault();
	const touch = e.touches[0];
	const pixel = document.elementFromPoint(touch.clientX, touch.clientY);

	if (pixel && pixel.classList.contains("pixel")) {
		colorPixel(pixel);
	}
}

/**
 * Saves the current drawing as a PNG image
 * Creates a canvas, draws the pixels, and triggers download
 */
function saveImage() {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	// Set canvas size to match grid
	canvas.width = gridSize * pixelSize;
	canvas.height = gridSize * pixelSize;

	// Draw each pixel to the canvas
	const pixels = document.querySelectorAll(".pixel");
	pixels.forEach(pixel => {
		const row = parseInt(pixel.dataset.row);
		const col = parseInt(pixel.dataset.col);
		ctx.fillStyle = pixel.style.backgroundColor || "#ffffff";
		ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
	});

	// Create and trigger download
	const link = document.createElement("a");
	link.download = "pixel-art.png";
	link.href = canvas.toDataURL("image/png");
	link.click();
}

// Initialize the application when the script loads
initApp();