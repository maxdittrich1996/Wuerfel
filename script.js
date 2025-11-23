
    const rows = 3; const cols = 3; const spacing = 62;
    let gridData = [];

    // Elemente
    const pivot = document.getElementById('pivot');
    const grid2d = document.getElementById('grid2d');
    const calcText = document.getElementById('calc-text');
    const sceneWrapper = document.getElementById('sceneWrapper');
    const btnGen = document.getElementById('btn-gen');
    const btnSolve = document.getElementById('btn-solve');

    // View State
    let rotX = 60; let rotZ = -45; let scale = 1;

    // Init
    generate();
    updateView();

    // --- INTERAKTION (Drehen) ---
    let isDragging = false; let lastX, lastY;

    sceneWrapper.addEventListener('mousedown', e => {
        isDragging = true; lastX = e.clientX; lastY = e.clientY;
        sceneWrapper.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
        isDragging = false; sceneWrapper.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', e => {
        if(!isDragging) return;
        const deltaX = e.clientX - lastX; const deltaY = e.clientY - lastY;
        rotZ += deltaX * 0.5; rotX -= deltaY * 0.5;
        if(rotX > 90) rotX = 90; if(rotX < 0) rotX = 0;
        updateView();
        lastX = e.clientX; lastY = e.clientY;
    });
    sceneWrapper.addEventListener('wheel', e => {
        e.preventDefault(); scale += e.deltaY * -0.001;
        scale = Math.min(Math.max(0.5, scale), 2.5);
        updateView();
    });

    function resetView() { rotX = 60; rotZ = -45; scale = 1; updateView(); }
    function updateView() {
        pivot.style.transform = `scale(${scale}) rotateX(${rotX}deg) rotateZ(${rotZ}deg) translateZ(-40px)`;
    }

    // --- LOGIK ---

    function generate() {
        pivot.innerHTML = ''; grid2d.innerHTML = '';
        calcText.innerHTML = 'Bereit zum Zählen?';
        calcText.className = 'calc-text'; // Reset Style
        gridData = [];
        btnSolve.disabled = false; btnGen.disabled = false;

        const offset = 1; 

        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const count = Math.floor(Math.random() * 4);
                gridData.push({r, c, count});

                const posX = (c - offset) * spacing;
                const posY = (r - offset) * spacing;

                // 3D Tile
                const tile = document.createElement('div');
                tile.className = 'tile-spot';
                tile.id = `tile-${r}-${c}`;
                tile.style.transform = `translateX(${posX}px) translateY(${posY}px)`;
                
                // Würfel
                for(let i=0; i<count; i++) {
                    const cube = document.createElement('div');
                    cube.className = `cube cube-g-${r}-${c} all-cubes`; // 'all-cubes' Klasse für Selektion am Ende
                    const z = (i * 50) + 25;
                    cube.style.transform = `translateZ(${z}px)`;
                    cube.innerHTML = `<div class="face f-front"></div><div class="face f-back"></div><div class="face f-right"></div><div class="face f-left"></div><div class="face f-top"></div><div class="face f-bottom"></div>`;
                    tile.appendChild(cube);
                }
                pivot.appendChild(tile);

                // 2D Grid
                const cell = document.createElement('div');
                cell.className = 'cell-2d';
                cell.id = `cell-${r}-${c}`;
                grid2d.appendChild(cell);
            }
        }
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function solve() {
        btnGen.disabled = true; btnSolve.disabled = true;
        
        // Reset
        document.querySelectorAll('.cell-2d').forEach(e => { e.innerText = ''; e.classList.remove('filled'); });
        document.querySelectorAll('.cube').forEach(c => {
            c.classList.remove('highlight-counting');
            c.classList.remove('highlight-total');
        });
        calcText.className = 'calc-text'; // Reset styles

        let sum = 0;
        let eq = "";

        // 1. Schrittweises Zählen
        for(let i=0; i<gridData.length; i++) {
            const d = gridData[i];
            const tile = document.getElementById(`tile-${d.r}-${d.c}`);
            const cubes = document.querySelectorAll(`.cube-g-${d.r}-${d.c}`);
            const cell = document.getElementById(`cell-${d.r}-${d.c}`);

            // Markieren (Rot)
            tile.classList.add('active-tile');
            cubes.forEach(c => c.classList.add('highlight-counting'));

            await sleep(300);

            // 2D Plan Update
            cell.innerText = d.count;
            cell.classList.add('filled');

            // Rechnen
            sum += d.count;
            if(i>0) eq += " + ";
            eq += d.count;
            calcText.innerHTML = eq + " = ?";

            await sleep(400);

            // Demarkieren
            tile.classList.remove('active-tile');
            cubes.forEach(c => c.classList.remove('highlight-counting'));
            
            await sleep(100);
        }

        // 2. Das Finale (Gesamtzahl)
        calcText.innerHTML = `${eq} = ...`;
        await sleep(500);

        // Alle Würfel gleichzeitig Grün machen
        const allCubes = document.querySelectorAll('.all-cubes');
        allCubes.forEach(c => c.classList.add('highlight-total'));

        // Großes Ergebnis anzeigen
        calcText.innerHTML = `GESAMT: ${sum} WÜRFEL!`;
        calcText.className = 'final-result'; // CSS Animation Klasse

        btnGen.disabled = false; btnSolve.disabled = false;
    }
