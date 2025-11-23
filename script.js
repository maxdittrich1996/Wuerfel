document.addEventListener('DOMContentLoaded', () => {

    // --- VIEW MANAGEMENT ---
    const views = {
        selection: document.getElementById('selection-view'),
        explanation: document.getElementById('explanation-view'),
        solver: document.getElementById('solver-view'),
    };

    const showView = (viewName) => {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        views[viewName].classList.remove('hidden');
    };

    // --- NAVIGATION ---
    document.getElementById('btn-start-explanation').addEventListener('click', () => {
        showView('explanation');
        if (!isExplanationInitialized) {
            initializeExplanationMode();
        }
    });

    document.getElementById('btn-start-solver').addEventListener('click', () => {
        showView('solver');
        if (!isSolverInitialized) {
            initializeSolverMode();
        }
        generateNewSolverChallenge();
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => showView('selection'));
    });


    // --- STATE ---
    let isExplanationInitialized = false;
    let isSolverInitialized = false;
    let solverCubeCount = 0;


    // --- EXPLANATION MODE ---
    function initializeExplanationMode() {
        const pivot = document.getElementById('pivot');
        const grid2d = document.getElementById('grid2d');
        const calcText = document.getElementById('calc-text');
        const sceneWrapper = document.getElementById('sceneWrapper');
        const btnGen = document.getElementById('btn-gen');
        const btnSolve = document.getElementById('btn-solve');
        const btnReset = document.getElementById('btn-reset');

        let rotX = 60;
        let rotZ = -45;
        let scale = 1;
        let gridData = [];
        const rows = 3;
        const cols = 3;
        const spacing = 62;

        const updateView = () => {
            pivot.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateZ(${rotZ}deg) translateZ(-40px)`;
        };

        const resetView = () => {
            rotX = 60;
            rotZ = -45;
            scale = 1;
            updateView();
        };

        const generate = () => {
            pivot.innerHTML = '';
            grid2d.innerHTML = '';
            calcText.innerHTML = 'Bereit zum Zählen?';
            calcText.className = 'calc-text';
            gridData = [];
            btnSolve.disabled = false;
            btnGen.disabled = false;

            const offset = 1;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const count = Math.floor(Math.random() * 4);
                    gridData.push({ r, c, count });

                    const posX = (c - offset) * spacing;
                    const posY = (r - offset) * spacing;

                    const tile = document.createElement('div');
                    tile.className = 'tile-spot';
                    tile.id = `tile-${r}-${c}`;
                    tile.style.transform = `translateX(${posX}px) translateY(${posY}px)`;

                    for (let i = 0; i < count; i++) {
                        const cube = document.createElement('div');
                        cube.className = `cube cube-g-${r}-${c} all-cubes`;
                        const z = (i * 50) + 25;
                        cube.style.transform = `translateZ(${z}px)`;
                        cube.innerHTML = `<div class="face f-front"></div><div class="face f-back"></div><div class="face f-right"></div><div class="face f-left"></div><div class="face f-top"></div><div class="face f-bottom"></div>`;
                        tile.appendChild(cube);
                    }
                    pivot.appendChild(tile);

                    const cell = document.createElement('div');
                    cell.className = 'cell-2d';
                    cell.id = `cell-${r}-${c}`;
                    grid2d.appendChild(cell);
                }
            }
        };

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));

        async function solve() {
            btnGen.disabled = true;
            btnSolve.disabled = true;

            document.querySelectorAll('.cell-2d').forEach(e => {
                e.innerText = '';
                e.classList.remove('filled');
            });
            document.querySelectorAll('.cube').forEach(c => {
                c.classList.remove('highlight-counting', 'highlight-total');
            });
            calcText.className = 'calc-text';

            let sum = 0;
            let eq = "";

            for (let i = 0; i < gridData.length; i++) {
                const d = gridData[i];
                const tile = document.getElementById(`tile-${d.r}-${d.c}`);
                const cubes = document.querySelectorAll(`.cube-g-${d.r}-${d.c}`);
                const cell = document.getElementById(`cell-${d.r}-${d.c}`);

                tile.classList.add('active-tile');
                cubes.forEach(c => c.classList.add('highlight-counting'));
                await sleep(300);

                cell.innerText = d.count;
                cell.classList.add('filled');

                sum += d.count;
                if (i > 0) eq += " + ";
                eq += d.count;
                calcText.innerHTML = eq + " = ?";
                await sleep(400);

                tile.classList.remove('active-tile');
                cubes.forEach(c => c.classList.remove('highlight-counting'));
                await sleep(100);
            }

            calcText.innerHTML = `${eq} = ...`;
            await sleep(500);

            const allCubes = document.querySelectorAll('.all-cubes');
            allCubes.forEach(c => c.classList.add('highlight-total'));

            calcText.innerHTML = `GESAMT: ${sum} WÜRFEL!`;
            calcText.className = 'final-result';

            btnGen.disabled = false;
        }

        // --- Event Listeners for Explanation Mode ---
        btnGen.addEventListener('click', generate);
        btnSolve.addEventListener('click', solve);
        btnReset.addEventListener('click', resetView);

        let isDragging = false,
            lastX, lastY;
        sceneWrapper.addEventListener('mousedown', e => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            sceneWrapper.style.cursor = 'grabbing';
        });
        window.addEventListener('mouseup', () => {
            isDragging = false;
            sceneWrapper.style.cursor = 'grab';
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            rotZ += deltaX * 0.5;
            rotX -= deltaY * 0.5;
            rotX = Math.max(0, Math.min(90, rotX)); // Clamp rotX
            updateView();
            lastX = e.clientX;
            lastY = e.clientY;
        });
        sceneWrapper.addEventListener('wheel', e => {
            e.preventDefault();
            scale += e.deltaY * -0.001;
            scale = Math.min(Math.max(0.5, scale), 2.5);
            updateView();
        });

        generate();
        updateView();
        isExplanationInitialized = true;
    }


    // --- SOLVER MODE ---
    function initializeSolverMode() {
        const sceneWrapper = document.getElementById('solverSceneWrapper');
        let rotX = 60;
        let rotZ = -45;
        let scale = 1;

        const updateView = () => {
            const pivot = document.getElementById('solverPivot');
            if (pivot) {
                pivot.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateZ(${rotZ}deg) translateZ(-40px)`;
            }
        };

        let isDragging = false,
            lastX, lastY;
        sceneWrapper.addEventListener('mousedown', e => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            sceneWrapper.style.cursor = 'grabbing';
        });
        window.addEventListener('mouseup', () => {
            isDragging = false;
            sceneWrapper.style.cursor = 'grab';
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            rotZ += deltaX * 0.5;
            rotX -= deltaY * 0.5;
            rotX = Math.max(0, Math.min(90, rotX));
            updateView();
            lastX = e.clientX;
            lastY = e.clientY;
        });
        sceneWrapper.addEventListener('wheel', e => {
            e.preventDefault();
            scale += e.deltaY * -0.001;
            scale = Math.min(Math.max(0.5, scale), 2.5);
            updateView();
        });

        document.getElementById('btn-check-guess').addEventListener('click', checkGuess);

        isSolverInitialized = true;
        updateView();
    }

    function generateNewSolverChallenge() {
        const pivot = document.getElementById('solverPivot');
        pivot.innerHTML = '';
        solverCubeCount = 0;
        const rows = 3;
        const cols = 3;
        const spacing = 62;
        const offset = 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const count = Math.floor(Math.random() * 5); // A bit more variance
                solverCubeCount += count;

                const posX = (c - offset) * spacing;
                const posY = (r - offset) * spacing;

                const tile = document.createElement('div');
                tile.className = 'tile-spot';
                tile.style.transform = `translateX(${posX}px) translateY(${posY}px)`;

                for (let i = 0; i < count; i++) {
                    const cube = document.createElement('div');
                    cube.className = 'cube';
                    const z = (i * 50) + 25;
                    cube.style.transform = `translateZ(${z}px)`;
                    cube.innerHTML = `<div class="face f-front"></div><div class="face f-back"></div><div class="face f-right"></div><div class="face f-left"></div><div class="face f-top"></div><div class="face f-bottom"></div>`;
                    tile.appendChild(cube);
                }
                pivot.appendChild(tile);
            }
        }
        // Reset input and result
        document.getElementById('guess-input').value = '';
        document.getElementById('solver-result-container').innerHTML = '';
    }

    function checkGuess() {
        const guess = parseInt(document.getElementById('guess-input').value, 10);
        const resultContainer = document.getElementById('solver-result-container');

        if (isNaN(guess)) {
            resultContainer.innerHTML = `<p style="color: #e67e22;">Bitte gib eine Zahl ein.</p>`;
            return;
        }

        if (guess === solverCubeCount) {
            resultContainer.innerHTML = `<p style="color: #2ecc71; font-weight: bold;">Richtig! Es sind ${solverCubeCount} Würfel.</p>`;
            // Maybe show a "New Puzzle" button
        } else {
            const diff = guess > solverCubeCount ? 'zu hoch' : 'zu niedrig';
            resultContainer.innerHTML = `<p style="color: #e74c3c;">Leider falsch. Dein Tipp ist ${diff}.</p>`;
        }
    }

});