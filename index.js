new p5((sketch) => {
  let currentThemeIndex = 0;
  let bgColor;
  let rectColors;
  let seed = $fx.rand().toString(16).substring(2); // Initial seed
  let titleHorizontalOffset = -180; // Adjust horizontal position of title
  let seedHorizontalOffset = 125; // Adjust horizontal position of seed
  let cubeVerticalOffset = 15; // Adjust vertical offset position of the cubes
  let signatureVerticalOffset = 10; // Global variable to adjust the vertical position of the entire signature
  let N,
    M,
    u,
    margin,
    factor,
    factorRangeName,
    gap,
    subgap,
    subgapRangeName,
    submargin,
    depthFactor,
    subdepthFactor,
    nRects,
    subRects;
  let ranges = {
    N: [4, 4],
    M: [3, 3],
    u: [100, 100], // scale
    margin: [0.5, 0.5], // padding
    factor: {
      tiny: [2, 10],
      small: [11, 30],
      medium: [31, 50],
      large: [51, 80],
    },
    gap: [1, 1],
    subgap: {
      tiny: [1, 3],
      small: [4, 7],
      medium: [8, 12],
      large: [13, 17],
    },
    submargin: [1, 1],
    depthFactor: [1, 1],
    subdepthFactor: [1, 100],
    nRects: [1000, 1000],
    subRects: [500, 500],
  };

  // Define thresholds for small, medium, and large rectangles
  const smallThreshold = 0;
  const mediumThreshold = 0.5;

  let themes = [
    {
      name: "Trametes versicolor", // Turkey Tail
      colors: ["#66aeaa", "#ffce3a", "#ff7044", "#5d5f46", "#000000"],
    },
    {
      name: "Hydnellum peckii", // Bleeding Tooth Fungus
      colors: ["#d12a2f", "#fcbc18", "#ebe4d8", "#29a691", "#b7d9cd"],
    },
    {
      name: "Laetiporus sulphureus", // Chicken of the Woods
      colors: ["#a8216b", "#f1184c", "#f36943", "#f7dc66", "#b7d9cd"],
    },
    {
      name: "Tremella mesenterica", // Witch's Butter
      colors: ["#556B2F", "#8FBC8F", "#FFD700", "#FF8C00", "#2E8B57"],
    },
    {
      name: "Clavulina cristata", // Coral Fungus
      colors: ["#FF4500", "#FF8C00", "#FFD700", "#2E8B57", "#6A5ACD"],
    },
    {
      name: "Amanita muscaria", // Fly Agaric
      colors: ["#0A7029", "#FEDE00", "#C8DF52", "#DBE8D8"],
    },
    {
      name: "Coprinus comatus", // Shaggy Inkcap
      colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"],
    },
    {
      name: "Hericium erinaceus", // Lion's Mane
      colors: ["#FF8370", "#00B1B0", "#FEC84D", "#E42256"],
    },
    {
      name: "Amanita phalloides", // Death Cap
      colors: ["#f3f2f0", "#090d01", "#d50001"],
    },
    {
      name: "Laccaria amethystina", // Amethyst Deceiver
      colors: ["#eb4823", "#4126b0", "#1b1b3f", "#f4cf43"],
    },
    {
      name: "Chlorociboria aeruginascens", // Green Elf Cup
      colors: ["#f59f1c", "#f55102", "#7901f3", "#05a345"],
    },
    {
      name: "Geastrum saccatum", // Earthstar
      colors: ["#E2D4B7", "#B09574", "#D4A373", "#6D6875", "#5B5B66"],
    },
    {
      name: "Xylaria polymorpha", // Dead Man's Fingers
      colors: ["#222222", "#444444", "#666666", "#888888", "#BBBBBB"],
    },
    {
      name: "Chorioactis geaster", // Devil's Cigar
      colors: ["#8B4513", "#A0522D", "#D2691E", "#CD853F", "#F4A460"],
    },
    {
      name: "Lactarius indigo", // Indigo Milk Cap
      colors: ["#3B5998", "#8B9DC3", "#DFE3EE", "#F7F7F7", "#2E3641"],
    },
    {
      name: "Mycena interrupta", // Pixie's Parasol
      colors: ["#99D5CF", "#57B8AC", "#B3E8E5", "#DFF3F2", "#F7FCFC"],
    },
  ];

  let randInt = (a, b) => {
    if (a === b) return a;
    return Math.floor($fx.rand() * (b - a + 1)) + a;
  };

  function generateSeed() {
    let seed = "0x";
    let chars = "0123456789abcdef";
    for (let i = 0; i < 10; i++) {
      seed += chars.charAt(Math.floor($fx.rand() * chars.length));
    }
    return seed;
  }

  sketch.setup = function () {
    randomizeVariables();
    randomizeColors();
    resizeCanvasToAspectRatio();
    let canvas = sketch.createCanvas(sketch.width, sketch.height);
    canvas.id("myCanvas");
    sketch.pixelDensity(2);
    sketch.strokeJoin(sketch.ROUND);
    sketch.strokeWeight(1.8);
    sketch.stroke(0);
    sketch.noLoop();

    sketch.randomSeed(parseInt(seed, 16)); // Use the presaved seed

    const featureValues = {
      Theme: themes[currentThemeIndex].name,
      Factor: `${factor} (${factorRangeName})`,
      Gap: gap,
      Subgap: `${subgap} (${subgapRangeName})`,
      Submargin: submargin,
      DepthFactor: depthFactor,
      SubdepthFactor: subdepthFactor,
    };

    $fx.features(featureValues);

    console.log(`Current color theme: ${themes[currentThemeIndex].name}`);
    console.log(
      `Chosen colors: Background color - ${bgColor}, Rectangle colors - ${rectColors}`
    );
    console.log("fx.features values:", featureValues);
  };

  sketch.draw = function () {
    drawComposition(sketch, sketch.width, sketch.height, u);
    drawSignature(sketch, sketch.width, sketch.height);
    drawFrame(10); // Adjust thickness
  };

  function drawComposition(p, width, height, unit) {
    p.background(bgColor);
    let depth = (submargin * unit) / factor / depthFactor;
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

    p.push();
    p.translate((width - M * unit) / 2, (height - N * unit) / 2); // Center the grid
    for (let recta of rectangles) {
      drawRectangle(p, recta, unit, gap, depth);

      let iMin = factor * recta.i;
      let iMax = factor * (recta.i + recta.si) - submargin;
      let jMin = factor * recta.j;
      let jMax = factor * (recta.j + recta.sj) - submargin;
      let siMax = Math.max(2, ~~((factor * recta.si) / 2) - submargin);
      let sjMax = Math.max(2, ~~((factor * recta.sj) / 2) - submargin);
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
        drawRectangle(p, subrecta, unit / factor, subgap, subdepth);
      }
    }
    p.pop();
  }

  function drawSignature(p, width, height) {
    let lineWidth = width * 0.75;
    let centerX = width / 2;
    let lineY = height - 80 * 0.8 + signatureVerticalOffset;
    let colorCubeSize = 10;
    let colorCubeSpacing = 2;
    let colorsY = lineY + cubeVerticalOffset;

    let seedTextSize = 12;
    let titleTextSize = 12;

    let textY = lineY + 10 + colorCubeSize / 2; // Y-coordinate for title and seed text

    p.stroke(rectColors[0]);
    p.strokeWeight(0.8);
    p.line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);

    p.noStroke();
    p.textFont("Helvetica");

    // Draw title text
    p.textSize(titleTextSize);
    p.textAlign(p.RIGHT, p.CENTER);
    p.fill(rectColors[0]);
    p.text(
      "Chip Cores",
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
      if (rectColors[i] !== bgColor) {
        p.fill(rectColors[i]);
        p.rect(
          colorsXStart + i * (colorCubeSize + colorCubeSpacing),
          colorsY - colorCubeSize / 2,
          colorCubeSize,
          colorCubeSize
        );
      }
    }

    // Draw seed text
    p.textSize(seedTextSize);
    p.textAlign(p.LEFT, p.CENTER);
    p.fill(rectColors[0]);
    p.text(
      `seed: ${seed}`,
      centerX +
        (rectColors.length * (colorCubeSize + colorCubeSpacing)) / 2 +
        seedHorizontalOffset,
      textY
    );
  }

  function drawFrame(thickness) {
    sketch.push();
    sketch.noFill();
    sketch.stroke(0); // Black color for the frame
    sketch.strokeWeight(thickness);

    // Draw the frame as a rectangle slightly inset from the canvas edges
    sketch.rect(
      thickness / 2,
      thickness / 2,
      sketch.width - thickness,
      sketch.height - thickness
    );

    sketch.pop();
  }

  sketch.keyPressed = function () {
    if (sketch.key === "c") {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      randomizeColors();
      sketch.redraw();
    } else if (sketch.key === "a") {
      seed = generateSeed();
      sketch.randomSeed(parseInt(seed, 16)); // Use the new seed
      randomizeVariables();
      resizeCanvasToAspectRatio(); // Reset canvas size
      randomizeColors();
      logValues();
      sketch.redraw();
    } else if (sketch.key === "v") {
      // Increase signature vertical offset
      signatureVerticalOffset += 10;
      sketch.redraw();
    } else if (sketch.key === "b") {
      // Decrease signature vertical offset
      signatureVerticalOffset -= 10;
      sketch.redraw();
    }
  };

  function resizeCanvasToAspectRatio() {
    let canvasWidth = window.innerWidth;
    let canvasHeight = (canvasWidth * N) / M;

    if (canvasHeight > window.innerHeight) {
      canvasHeight = window.innerHeight - 100; // Adjust for signature space
      canvasWidth = (canvasHeight * M) / N;
    }

    u = canvasHeight / N;
    sketch.resizeCanvas(canvasWidth, canvasHeight);
  }

  function randomizeVariables() {
    N = randInt(ranges.N[0], ranges.N[1]);
    M = randInt(ranges.M[0], ranges.M[1]);
    u = randInt(ranges.u[0], ranges.u[1]);
    margin = randInt(ranges.margin[0], ranges.margin[1]);

    const factorRangeNames = Object.keys(ranges.factor);
    factorRangeName =
      factorRangeNames[Math.floor($fx.rand() * factorRangeNames.length)];
    const factorRange = ranges.factor[factorRangeName];
    factor = randInt(factorRange[0], factorRange[1]);

    const subgapRangeNames = Object.keys(ranges.subgap);
    subgapRangeName =
      subgapRangeNames[Math.floor($fx.rand() * subgapRangeNames.length)];
    const subgapRange = ranges.subgap[subgapRangeName];
    subgap = randInt(subgapRange[0], subgapRange[1]);

    gap = randInt(ranges.gap[0], ranges.gap[1]);
    submargin = randInt(ranges.submargin[0], ranges.submargin[1]);
    depthFactor = randInt(ranges.depthFactor[0], ranges.depthFactor[1]);
    subdepthFactor = randInt(
      ranges.subdepthFactor[0],
      ranges.subdepthFactor[1]
    );
    nRects = randInt(ranges.nRects[0], ranges.nRects[1]);
    subRects = randInt(ranges.subRects[0], ranges.subRects[1]);
  }

  function randomizeColors() {
    currentThemeIndex = Math.floor($fx.rand() * themes.length);
    let theme = themes[currentThemeIndex];
    bgColor = theme.colors[Math.floor($fx.rand() * theme.colors.length)];
    rectColors = theme.colors.filter((color) => color !== bgColor);
  }

  function logValues() {
    const featureValues = {
      Theme: themes[currentThemeIndex].name,
      Margin: margin,
      Factor: `${factor} (${factorRangeName})`,
      Gap: gap,
      Subgap: `${subgap} (${subgapRangeName})`,
      Submargin: submargin,
      DepthFactor: depthFactor,
      SubdepthFactor: subdepthFactor,
      nRects: nRects,
      SubRects: subRects,
    };

    console.log(`Current color theme: ${themes[currentThemeIndex].name}`);
    console.log(
      `Chosen colors: Background color - ${bgColor}, Rectangle colors - ${rectColors}`
    );
    console.log("fx.features values:", featureValues);

    $fx.features(featureValues);
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
        ((newRecta.si > 1 || newRecta.sj > 1) && $fx.rand() < 1 / 2) ||
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
      si = Math.min(siMax, iMax - i);
      sj = Math.min(sjMax, jMax - j);
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

    if ($fx.rand() < 1 / 2) {
      if (si == sj && si > 1) {
        if ($fx.rand() < 1 / 2) {
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

  function drawRectangle(p, recta, unit, gap, depth) {
    let x = recta.i * unit + gap / 2,
      y = recta.j * unit + gap / 2;
    let w = recta.si * unit - gap,
      h = recta.sj * unit - gap;

    let rectColor;
    let area = (w * h) / (unit * unit);
    if (area > mediumThreshold) {
      rectColor =
        rectColors[Math.floor($fx.rand() * rectColors.slice(0, 2).length)]; // Larger rectangles
    } else if (area > smallThreshold) {
      rectColor =
        rectColors[Math.floor($fx.rand() * rectColors.slice(2, 4).length)]; // Medium rectangles
    } else {
      rectColor =
        rectColors[Math.floor($fx.rand() * rectColors.slice(4, 6).length)]; // Small rectangles
    }

    p.fill(rectColor);
    p.rect(x, y, w - depth, h - depth);
    p.noFill();
    p.stroke(0);
    p.rect(x, y, w - depth, h - depth);
  }

  sketch.windowResized = function () {
    resizeCanvasToAspectRatio();
    sketch.redraw();
  };
});
