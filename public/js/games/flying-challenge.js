// --- Flying Challenge Game ---
let flyScore = 0;
let flyIsGameOver = false;
let flyAnimationFrame;
let broomY = 200;
let flyVelocity = 0;
let flyGravity = 0.5;
let flyJump = -8;
let obstacles = [];
let obstacleTimer = 0;
let flyArena;
let playerBroom;

function startFlyingGame() {
    document.getElementById('fly-start-screen').classList.add('hidden');
    document.getElementById('fly-end-screen').classList.add('hidden');
    document.getElementById('fly-play-screen').classList.remove('hidden');
    
    flyArena = document.getElementById('flying-arena');
    playerBroom = document.getElementById('player-broom');
    
    flyScore = 0;
    flyIsGameOver = false;
    broomY = 200;
    flyVelocity = 0;
    obstacles = [];
    obstacleTimer = 0;
    
    document.getElementById('obstacles-container').innerHTML = '';
    document.getElementById('fly-score').textContent = flyScore;
    
    playerBroom.style.transform = `translateY(${broomY}px) rotate(0deg)`;
    
    flyArena.onclick = flyUp;
    document.addEventListener('keydown', handleFlyKey);
    
    cancelAnimationFrame(flyAnimationFrame);
    gameLoop();
}

function handleFlyKey(e) {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !flyIsGameOver) {
        e.preventDefault();
        flyUp();
    }
}

function flyUp() {
    if (flyIsGameOver) return;
    flyVelocity = flyJump;
    if(typeof clickAudio !== 'undefined' && clickAudio) {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(e => {});
    }
}

function gameLoop() {
    if (flyIsGameOver) return;
    
    flyVelocity += flyGravity;
    broomY += flyVelocity;
    
    let rotation = Math.min(Math.max(flyVelocity * 3, -30), 45);
    playerBroom.style.transform = `translateY(${broomY}px) rotate(${rotation}deg)`;
    
    if (broomY < 0 || broomY > 350) {
        endFlyingGame();
        return;
    }
    
    obstacleTimer++;
    if (obstacleTimer > 80) {
        spawnObstacle();
        obstacleTimer = 0;
    }
    
    moveObstacles();
    checkFlyCollisions();
    
    if(!flyIsGameOver) {
        flyScore++;
        if (flyScore % 10 === 0) {
            document.getElementById('fly-score').textContent = Math.floor(flyScore / 10);
        }
        flyAnimationFrame = requestAnimationFrame(gameLoop);
    }
}

function spawnObstacle() {
    const arenaWidth = flyArena.clientWidth || 800;
    const gap = 130; 
    const minHeight = 50;
    const maxHeight = 400 - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    
    const container = document.getElementById('obstacles-container');
    
    const topObs = document.createElement('div');
    topObs.className = 'obstacle top';
    topObs.style.height = topHeight + 'px';
    topObs.style.left = arenaWidth + 'px';
    container.appendChild(topObs);
    
    const botObs = document.createElement('div');
    botObs.className = 'obstacle bottom';
    botObs.style.height = (400 - topHeight - gap) + 'px';
    botObs.style.left = arenaWidth + 'px';
    container.appendChild(botObs);
    
    obstacles.push(topObs, botObs);
}

function moveObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        let currentLeft = parseFloat(obs.style.left);
        currentLeft -= 5;
        obs.style.left = currentLeft + 'px';
        
        if (currentLeft < -80) {
            obs.remove();
            obstacles.splice(i, 1);
        }
    }
}

function checkFlyCollisions() {
    const broomRect = {
        left: 50,
        right: 90,
        top: broomY + 10,
        bottom: broomY + 40
    };
    
    for (const obs of obstacles) {
        const obsLeft = parseFloat(obs.style.left);
        const isTop = obs.classList.contains('top');
        const obsHeight = parseFloat(obs.style.height);
        
        const obsRect = {
            left: obsLeft,
            right: obsLeft + 60,
            top: isTop ? 0 : 400 - obsHeight,
            bottom: isTop ? obsHeight : 400
        };
        
        if (broomRect.left < obsRect.right &&
            broomRect.right > obsRect.left &&
            broomRect.top < obsRect.bottom &&
            broomRect.bottom > obsRect.top) {
            endFlyingGame();
            return;
        }
    }
}

function endFlyingGame() {
    flyIsGameOver = true;
    document.removeEventListener('keydown', handleFlyKey);
    flyArena.onclick = null;
    
    cancelAnimationFrame(flyAnimationFrame);
    
    document.getElementById('fly-play-screen').classList.add('hidden');
    document.getElementById('fly-end-screen').classList.remove('hidden');
    document.getElementById('fly-final-score').textContent = Math.floor(flyScore / 10);
}
