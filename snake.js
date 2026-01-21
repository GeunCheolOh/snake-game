const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
let snake, direction, food, score, game, isGameOver, speed;
const restartBtn = document.getElementById('restartBtn');
const speedSelect = document.getElementById('speedSelect');
const rankingDiv = document.getElementById('ranking');

function getRanking() {
    let ranking = localStorage.getItem('snakeRanking');
    return ranking ? JSON.parse(ranking) : [];
}

function setRanking(ranking) {
    localStorage.setItem('snakeRanking', JSON.stringify(ranking));
}

function updateRanking(newScore) {
    let ranking = getRanking();
    ranking.push(newScore);
    ranking.sort((a, b) => b - a);
    ranking = ranking.slice(0, 5);
    setRanking(ranking);
    showRanking();
}

function showRanking() {
    let ranking = getRanking();
    let html = '<h3>점수 랭킹 TOP 5</h3><ol>';
    if (ranking.length === 0) html += '<li>기록 없음</li>';
    else ranking.forEach(score => { html += `<li>${score}점</li>`; });
    html += '</ol>';
    rankingDiv.innerHTML = html;
}

function initGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = null;
    food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
    score = 0;
    isGameOver = false;
    restartBtn.style.display = 'none';
    draw();
    if (game) clearInterval(game);
    game = null;
    showRanking();
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 400, 400);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#0f0' : '#fff';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x, food.y, box, box);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 390);
}

document.addEventListener('keydown', e => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    // 게임이 멈춰있을 때 방향키 입력 시 시작
    if (!game && direction) {
        game = setInterval(gameLoop, speed);
    }
});

function collision(head, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (head.x === arr[i].x && head.y === arr[i].y) return true;
    }
    return false;
}

function gameLoop() {
    if (!direction) return; // 방향키 입력 전에는 움직이지 않음
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // 벽 충돌 또는 자기 몸 충돌
    if (head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || collision(head, snake)) {
        clearInterval(game);
        isGameOver = true;
        restartBtn.style.display = 'block';
        draw();
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText('게임 오버!', 120, 200);
        ctx.font = '20px Arial';
        ctx.fillText('점수: ' + score, 160, 240);
        updateRanking(score);
        return;
    }

    if (head.x === food.x && head.y === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
    } else {
        snake.pop();
    }
    snake.unshift(head);
    draw();
}

restartBtn.onclick = initGame;
speedSelect.onchange = function() {
    speed = parseInt(speedSelect.value);
    if (game) {
        clearInterval(game);
        game = setInterval(gameLoop, speed);
    }
};

// 초기 속도 설정
speed = parseInt(speedSelect.value);

initGame();
