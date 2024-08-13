let themes = [
  {
    name: "Pastel",
    colors: ["#FF6347", "#40E0D0", "#EE82EE", "#F5DEB3", "#FFFFFF", "#000000"],
  },
  {
    name: "Golid",
    colors: ["#66aeaa", "#ffce3a", "#ff7044", "#5d5f46", "#000000"],
  },
  {
    name: "Hobbs",
    colors: ["#d12a2f", "#fcbc18", "#ebe4d8", "#29a691", "#b7d9cd"],
  },
  {
    name: "Cathode",
    colors: ["#a8216b", "#f1184c", "#f36943", "#f7dc66", "#b7d9cd"],
  },
  {
    name: "Pop",
    colors: ["#00ff3f", "#35b5ff", "#ff479c", "#fffb38"],
  },
  {
    name: "Meadow",
    colors: ["#556B2F", "#8FBC8F", "#FFD700", "#FF8C00", "#2E8B57"],
  },
  {
    name: "Sunset",
    colors: ["#FF4500", "#FF8C00", "#FFD700", "#2E8B57", "#6A5ACD"],
  },
  {
    name: "Marguerita",
    colors: ["#0A7029", "#FEDE00", "#C8DF52", "#DBE8D8"],
  },
  {
    name: "Apple",
    colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"],
  },
];

let currentThemeIndex = 0;
let bgColor;
let rectColors;
let seed = "0xdc7d70d4e8"; // Initial seed

let titleHorizontalOffset = -180; // Adjust horizontal position of title
let seedHorizontalOffset = 125; // Adjust horizontal position of seed
let cubeVerticalOffset = 15; // Adjust vertical offset position of the cubes
let signatureVerticalOffset = 10; // Global variable to adjust the vertical position of the entire signature

let ranges = {
  N: [4, 4],
  M: [3, 3],
  u: [100, 100], //scale
  margin: [0.5, 0.5], //padding
  factor: [2, 70], //5,100
  gap: [1, 1],
  subgap: [1, 1], //1 //15 er fet.
  submargin: [1, 1],
  depthFactor: [1, 1],
  subdepthFactor: [2, 100],
  nRects: [1000, 1000],
  subRects: [500, 500],
};

// Define thresholds for small, medium, and large rectangles
const smallThreshold = 0;
const mediumThreshold = 0.5;

let randInt = (a, b) => {
  if (a === b) return a;
  return floor(random(a, b));
};

function generateSeed() {
  let seed = "0x";
  let chars = "0123456789abcdef";
  for (let i = 0; i < 10; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return seed;
}

function setup() {
  randomizeVariables();
  randomizeColors();
  resizeCanvasToAspectRatio();
  pixelDensity(2);
  strokeJoin(ROUND);
  strokeWeight(1.8);
  stroke(0);
  noLoop();
  console.log("Seed:", seed);
  randomSeed(parseInt(seed, 16)); // Use the presaved seed
}

function draw() {
  background(bgColor);
  let depth = (submargin * u) / factor / depthFactor;
  let subdepth = depth / subdepthFactor;

  let iMin = margin,
    iMax = M - margin;
  let jMin = margin,
    jMax = N - margin;
  let siMax = ~~(M / 2 - margin);
  let sjMax = ~~(N / 2 - margin);
  let rectangles = createComposition(
    iMin,
    iMax,
    jMin,
    jMax,
    siMax,
    sjMax,
    nRects
  );

  push();
  translate((width - M * u) / 2, (height - N * u) / 2); // Center the grid
  for (let recta of rectangles) {
    drawRectangle(recta, u, gap, depth);

    let iMin = factor * recta.i;
    let iMax = factor * (recta.i + recta.si) - submargin;
    let jMin = factor * recta.j;
    let jMax = factor * (recta.j + recta.sj) - submargin;
    let siMax = max(2, ~~((factor * recta.si) / 2) - submargin);
    let sjMax = max(2, ~~((factor * recta.sj) / 2) - submargin);
    let subrectangles = createComposition(
      iMin,
      iMax,
      jMin,
      jMax,
      siMax,
      sjMax,
      subRects
    );
    for (let subrecta of subrectangles) {
      drawRectangle(subrecta, u / factor, subgap, subdepth);
    }
  }
  pop();

  // Draw the signature at the bottom
  drawSignature();
}

function drawSignature() {
  let lineWidth = width * 0.75;
  let centerX = width / 2;
  let lineY = height - 80 * 0.8 + signatureVerticalOffset;
  let colorCubeSize = 10;
  let colorCubeSpacing = 2;
  let colorsY = lineY + cubeVerticalOffset;

  let seedTextSize = 12;
  let titleTextSize = 12;

  let textY = lineY + 10 + colorCubeSize / 2; // Y-coordinate for title and seed text

  stroke(rectColors[0]);
  strokeWeight(2);
  line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

  noStroke();
  textFont("Helvetica");

  // Draw title text
  textSize(titleTextSize);
  textAlign(RIGHT, CENTER);
  fill(rectColors[0]);
  text(
    "Chip Blocks // 2001",
    centerX -
      (rectColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      titleHorizontalOffset,
    textY
  );

  // Draw color cubes
  let colorsXStart =
    centerX -
    (rectColors.length * colorCubeSize +
      (rectColors.length - 1) * colorCubeSpacing) /
      2;
  for (let i = 0; i < rectColors.length; i++) {
    fill(rectColors[i]);
    rect(
      colorsXStart + i * (colorCubeSize + colorCubeSpacing),
      colorsY - colorCubeSize / 2,
      colorCubeSize,
      colorCubeSize
    );
  }

  // Draw seed text
  textSize(seedTextSize);
  textAlign(LEFT, CENTER);
  fill(rectColors[0]);
  text(
    centerX +
      (rectColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
      seedHorizontalOffset,
    textY
  );
}

function keyPressed() {
  if (key === "c") {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    randomizeColors();
    redraw();
  } else if (key === "s") {
    saveHighQualityImage();
  } else if (key === "a") {
    seed = generateSeed();
    console.log("New Seed:", seed);
    randomSeed(parseInt(seed, 16)); // Use the new seed
    randomizeVariables();
    resizeCanvasToAspectRatio(); // Reset canvas size
    randomizeColors();
    logValues();
    redraw();
  } else if (key === "v") {
    // Increase signature vertical offset
    signatureVerticalOffset += 10;
    redraw();
  } else if (key === "b") {
    // Decrease signature vertical offset
    signatureVerticalOffset -= 10;
    redraw();
  }
}

function resizeCanvasToAspectRatio() {
  let canvasWidth = windowWidth;
  let canvasHeight = (canvasWidth * N) / M;

  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight - 100; // Adjust for signature space
    canvasWidth = (canvasHeight * M) / N;
  }

  u = canvasHeight / N;
  resizeCanvas(canvasWidth, canvasHeight);
}

function randomizeVariables() {
  N = randInt(ranges.N[0], ranges.N[1]);
  M = randInt(ranges.M[0], ranges.M[1]);
  u = randInt(ranges.u[0], ranges.u[1]);
  margin = randInt(ranges.margin[0], ranges.margin[1]);
  factor = randInt(ranges.factor[0], ranges.factor[1]);
  gap = randInt(ranges.gap[0], ranges.gap[1]);
  subgap = randInt(ranges.subgap[0], ranges.subgap[1]);
  submargin = randInt(ranges.submargin[0], ranges.submargin[1]);
  depthFactor = randInt(ranges.depthFactor[0], ranges.depthFactor[1]);
  subdepthFactor = randInt(ranges.subdepthFactor[0], ranges.subdepthFactor[1]);
  nRects = randInt(ranges.nRects[0], ranges.nRects[1]);
  subRects = randInt(ranges.subRects[0], ranges.subRects[1]);
}

function randomizeColors() {
  let theme = themes[currentThemeIndex];
  bgColor = random(theme.colors);
  rectColors = theme.colors;
}

function logValues() {
  console.log({
    N,
    M,
    u,
    margin,
    factor,
    gap,
    subgap,
    submargin,
    depthFactor,
    subdepthFactor,
    nRects,
    subRects,
    bgColor,
    rectColors,
  });
}

function createComposition(iMin, iMax, jMin, jMax, siMax, sjMax, nRects) {
  let rectangles = [];

  for (let i = 0; i < nRects; i++) {
    let newRecta = generateRectangle(
      rectangles,
      iMin,
      iMax,
      jMin,
      jMax,
      siMax,
      sjMax
    );
    if (
      ((newRecta.si > 1 || newRecta.sj > 1) && random() < 1 / 2) ||
      (newRecta.si > 1 && newRecta.sj > 1)
    ) {
      rectangles.push(newRecta);
    }
  }

  for (let i = iMin; i < iMax; i++) {
    for (let j = jMin; j < jMax; j++) {
      let newRecta = { i: i, j: j, si: 1, sj: 1 };
      let canAdd = true;
      for (let recta of rectangles) {
        if (rectanglesIntersect(newRecta, recta)) {
          canAdd = false;
          break;
        }
      }
      if (canAdd) {
        rectangles.push(newRecta);
      }
    }
  }

  return rectangles;
}

function rectanglesIntersect(recta1, recta2) {
  return (
    ((recta1.i <= recta2.i && recta1.i + recta1.si > recta2.i) ||
      (recta2.i <= recta1.i && recta2.i + recta2.si > recta1.i)) &&
    ((recta1.j <= recta2.j && recta1.j + recta1.sj > recta2.j) ||
      (recta2.j <= recta1.j && recta2.j + recta2.sj > recta1.j))
  );
}

function generateRectangle(rectangles, iMin, iMax, jMin, jMax, siMax, sjMax) {
  let i = randInt(iMin, iMax);
  let j = randInt(jMin, jMax);

  let si, sj;
  if (rectangles.length == 0) {
    si = min(siMax, iMax - i);
    sj = min(sjMax, jMax - j);
  } else {
    let si1 = biggestPossibleWidth(rectangles, iMax, siMax, i, j, 1, 1);
    let sj1 = biggestPossibleHeight(rectangles, jMax, sjMax, i, j, si1, 1);

    let sj2 = biggestPossibleHeight(rectangles, jMax, sjMax, i, j, 1, 1);
    let si2 = biggestPossibleWidth(rectangles, iMax, siMax, i, j, 1, sj2);

    if (si1 * sj1 > si2 * sj2) {
      si = si1;
      sj = sj1;
    } else {
      si = si2;
      sj = sj2;
    }
  }

  if (random() < 1 / 2) {
    if (si == sj && si > 1) {
      if (random() < 1 / 2) {
        si--;
      } else {
        sj--;
      }
    }
  }

  let recta = { i: i, j: j, si: si, sj: sj };
  return recta;
}

function biggestPossibleWidth(rectangles, iMax, siMax, i, j, si, sj) {
  let s = si;
  let intersects = false;
  while (!intersects) {
    s++;
    for (let recta of rectangles) {
      if (
        i + s > iMax ||
        s > siMax ||
        rectanglesIntersect({ i: i, j: j, si: s, sj: sj }, recta)
      ) {
        intersects = true;
        break;
      }
    }
  }
  return s - 1;
}

function biggestPossibleHeight(rectangles, jMax, sjMax, i, j, si, sj) {
  let s = sj;
  let intersects = false;
  while (!intersects) {
    s++;
    for (let recta of rectangles) {
      if (
        j + s > jMax ||
        s > sjMax ||
        rectanglesIntersect({ i: i, j: j, si: si, sj: s }, recta)
      ) {
        intersects = true;
        break;
      }
    }
  }
  return s - 1;
}

function drawRectangle(recta, u, gap, depth) {
  let x = recta.i * u + gap / 2,
    y = recta.j * u + gap / 2;
  let w = recta.si * u - gap,
    h = recta.sj * u - gap;

  let rectColor;
  let area = (w * h) / (u * u);
  if (area > mediumThreshold) {
    rectColor = random(rectColors.slice(0, 2)); // Larger rectangles
  } else if (area > smallThreshold) {
    rectColor = random(rectColors.slice(2, 4)); // Medium rectangles
  } else {
    rectColor = random(rectColors.slice(4, 6)); // Small rectangles
  }

  fill(rectColor);
  rect(x, y, w - depth, h - depth);
  noFill();
  stroke(0);
  rect(x, y, w - depth, h - depth);
}

function saveHighQualityImage() {
  let highQualityU = 8000 / N; // Higher resolution
  let highQualityCanvasWidth = M * highQualityU;
  let highQualityCanvasHeight = N * highQualityU;

  createCanvas(highQualityCanvasWidth, highQualityCanvasHeight);
  u = highQualityU;
  draw();
  saveCanvas("high_quality_image", "png");
  resizeCanvasToAspectRatio();
  draw();
}

function windowResized() {
  resizeCanvasToAspectRatio();
  redraw();
}
