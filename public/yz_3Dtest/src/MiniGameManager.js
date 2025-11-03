// 小游戏管理器
export class MiniGameManager {
    constructor() {
        this.currentGame = null;
        this.gameContainer = null;
        this.onGameCompleteCallback = null;
        this.isGameActive = false;
        
        // 创建游戏容器
        this.createGameContainer();
    }

    createGameContainer() {
        // 创建主容器
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'miniGameContainer';
        this.gameContainer.className = 'mini-game-container hidden';
        this.gameContainer.innerHTML = `
            <div class="mini-game-overlay"></div>
            <div class="mini-game-content">
                <div class="mini-game-header">
                    <h2 class="mini-game-title">数据碎片挑战</h2>
                    <button class="mini-game-close" id="miniGameClose">?</button>
                </div>
                <div class="mini-game-body" id="miniGameBody">
                    <!-- 游戏内容将在这里动态加载 -->
                </div>
            </div>
        `;
        
        document.body.appendChild(this.gameContainer);
        
        // 关闭按钮事件
        document.getElementById('miniGameClose').addEventListener('click', () => {
            this.closeGame();
        });
    }

    // 根据实体类型启动相应的小游戏
    startGame(entityType, onComplete) {
        this.onGameCompleteCallback = onComplete;
        this.isGameActive = true;
        
        // 显示容器
        this.gameContainer.classList.remove('hidden');
        
        // 根据实体类型加载不同的游戏
        const gameBody = document.getElementById('miniGameBody');
        const title = this.gameContainer.querySelector('.mini-game-title');
        
        switch (entityType) {
            case '数据聚合体':
                title.textContent = '数据整合挑战 - 2048';
                this.load2048Game(gameBody);
                break;
            case '信息处理节点':
                title.textContent = '路径重构挑战 - 一笔画';
                this.loadOneLineGame(gameBody);
                break;
            case '记忆存储单元':
                title.textContent = '记忆匹配挑战 - 翻牌配对';
                this.loadMemoryGame(gameBody);
                break;
            case '协议执行器':
                title.textContent = '逻辑解析挑战 - 数独';
                this.loadSudokuGame(gameBody);
                break;
            case '熵平衡守护':
                title.textContent = '熵增对抗挑战 - 消消乐';
                this.loadMatchGame(gameBody);
                break;
            default:
                title.textContent = '未知挑战';
                gameBody.innerHTML = '<p class="text-gray-400">未知的挑战类型</p>';
        }
    }

    // 加载 2048 游戏
    load2048Game(container) {
        container.innerHTML = `
            <div class="game-2048">
                <div class="game-info">
                    <div class="score-box">
                        <div class="score-label">分数</div>
                        <div class="score-value" id="score2048">0</div>
                    </div>
                    <button class="btn-new-game" id="newGame2048">新游戏</button>
                </div>
                <div class="game-board-2048" id="board2048"></div>
                <div class="game-instructions">
                    使用方向键移动方块，合并相同数字达到 2048！
                </div>
            </div>
        `;
        
        // 初始化 2048 游戏逻辑
        this.init2048Game();
    }

    // 2048 游戏逻辑
    init2048Game() {
        const board = Array(4).fill(null).map(() => Array(4).fill(0));
        let score = 0;
        let gameWon = false;
        
        const renderBoard = () => {
            const boardEl = document.getElementById('board2048');
            if (!boardEl) return;
            
            boardEl.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const cell = document.createElement('div');
                    cell.className = `tile tile-${board[i][j]}`;
                    cell.textContent = board[i][j] || '';
                    boardEl.appendChild(cell);
                }
            }
            
            const scoreEl = document.getElementById('score2048');
            if (scoreEl) scoreEl.textContent = score;
        };
        
        const addRandomTile = () => {
            const empty = [];
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (board[i][j] === 0) empty.push([i, j]);
                }
            }
            if (empty.length > 0) {
                const [i, j] = empty[Math.floor(Math.random() * empty.length)];
                board[i][j] = Math.random() < 0.9 ? 2 : 4;
            }
        };
        
        const move = (direction) => {
            let moved = false;
            const oldBoard = JSON.stringify(board);
            
            // 简化的移动逻辑
            if (direction === 'left') {
                for (let i = 0; i < 4; i++) {
                    const row = board[i].filter(x => x !== 0);
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            score += row[j];
                            row.splice(j + 1, 1);
                            if (row[j] === 2048 && !gameWon) {
                                gameWon = true;
                                setTimeout(() => this.completeGame(score), 500);
                            }
                        }
                    }
                    while (row.length < 4) row.push(0);
                    board[i] = row;
                }
            }
            // 其他方向类似实现...
            
            if (JSON.stringify(board) !== oldBoard) {
                moved = true;
                addRandomTile();
                renderBoard();
            }
        };
        
        // 键盘控制
        const handleKey = (e) => {
            if (!this.isGameActive) return;
            if (e.key === 'ArrowLeft') move('left');
            if (e.key === 'ArrowRight') move('right');
            if (e.key === 'ArrowUp') move('up');
            if (e.key === 'ArrowDown') move('down');
        };
        
        document.addEventListener('keydown', handleKey);
        this.currentGameCleanup = () => document.removeEventListener('keydown', handleKey);
        
        // 新游戏按钮
        document.getElementById('newGame2048')?.addEventListener('click', () => {
            board.forEach((row, i) => board[i] = [0, 0, 0, 0]);
            score = 0;
            gameWon = false;
            addRandomTile();
            addRandomTile();
            renderBoard();
        });
        
        // 初始化
        addRandomTile();
        addRandomTile();
        renderBoard();
    }

    // 加载一笔画游戏
    loadOneLineGame(container) {
        container.innerHTML = `
            <div class="game-oneline">
                <div class="game-info">
                    <div class="score-box">
                        <div class="score-label">关卡</div>
                        <div class="score-value" id="levelOneLine">1</div>
                    </div>
                    <button class="btn-new-game" id="resetOneLine">重置</button>
                </div>
                <canvas id="oneLineCanvas" width="400" height="400"></canvas>
                <div class="game-instructions">
                    从任意点开始，一笔画出所有连线！
                </div>
            </div>
        `;
        
        this.initOneLineGame();
    }

    // 一笔画游戏逻辑
    initOneLineGame() {
        const canvas = document.getElementById('oneLineCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let currentLevel = 0;
        
        const levels = [
            {
                points: [[100, 100], [300, 100], [300, 300], [100, 300]],
                edges: [[0, 1], [1, 2], [2, 3], [3, 0]]
            },
            {
                points: [[200, 80], [120, 200], [120, 320], [280, 320], [280, 200]],
                edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 4]]
            }
        ];
        
        let path = [];
        let isDrawing = false;
        
        const drawBoard = () => {
            ctx.clearRect(0, 0, 400, 400);
            const level = levels[currentLevel];
            
            // 画边
            ctx.strokeStyle = '#4B5563';
            ctx.lineWidth = 3;
            level.edges.forEach(([a, b]) => {
                ctx.beginPath();
                ctx.moveTo(level.points[a][0], level.points[a][1]);
                ctx.lineTo(level.points[b][0], level.points[b][1]);
                ctx.stroke();
            });
            
            // 画用户路径
            if (path.length > 1) {
                ctx.strokeStyle = '#06B6D4';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(level.points[path[0]][0], level.points[path[0]][1]);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(level.points[path[i]][0], level.points[path[i]][1]);
                }
                ctx.stroke();
            }
            
            // 画点
            level.points.forEach((point, i) => {
                ctx.fillStyle = path.includes(i) ? '#06B6D4' : '#9CA3AF';
                ctx.beginPath();
                ctx.arc(point[0], point[1], 12, 0, Math.PI * 2);
                ctx.fill();
            });
        };
        
        const checkComplete = () => {
            if (path.length < 2) return false;
            const level = levels[currentLevel];
            const usedEdges = new Set();
            
            for (let i = 0; i < path.length - 1; i++) {
                const edge = [path[i], path[i + 1]].sort().join('-');
                usedEdges.add(edge);
            }
            
            const allEdges = new Set(level.edges.map(([a, b]) => [a, b].sort().join('-')));
            return usedEdges.size === allEdges.size;
        };
        
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const level = levels[currentLevel];
            level.points.forEach((point, i) => {
                const dist = Math.sqrt((x - point[0]) ** 2 + (y - point[1]) ** 2);
                if (dist < 20) {
                    path = [i];
                    isDrawing = true;
                    drawBoard();
                }
            });
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const level = levels[currentLevel];
            level.points.forEach((point, i) => {
                if (path.includes(i)) return;
                
                const dist = Math.sqrt((x - point[0]) ** 2 + (y - point[1]) ** 2);
                if (dist < 20) {
                    const lastPoint = path[path.length - 1];
                    const isConnected = level.edges.some(([a, b]) => 
                        (a === lastPoint && b === i) || (b === lastPoint && a === i)
                    );
                    
                    if (isConnected) {
                        path.push(i);
                        drawBoard();
                        
                        if (checkComplete()) {
                            isDrawing = false;
                            setTimeout(() => {
                                if (currentLevel < levels.length - 1) {
                                    currentLevel++;
                                    path = [];
                                    document.getElementById('levelOneLine').textContent = currentLevel + 1;
                                    drawBoard();
                                } else {
                                    this.completeGame(1000);
                                }
                            }, 500);
                        }
                    }
                }
            });
        });
        
        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });
        
        document.getElementById('resetOneLine')?.addEventListener('click', () => {
            path = [];
            drawBoard();
        });
        
        drawBoard();
    }

    // 加载记忆匹配游戏（简化版）
    loadMemoryGame(container) {
        container.innerHTML = `
            <div class="game-memory">
                <div class="game-info">
                    <div class="score-box">
                        <div class="score-label">配对数</div>
                        <div class="score-value" id="scoreMemory">0</div>
                    </div>
                </div>
                <div class="memory-grid" id="memoryGrid"></div>
                <div class="game-instructions">
                    翻开卡片找到相同的配对！
                </div>
            </div>
        `;
        
        this.initMemoryGame();
    }

    // 记忆游戏逻辑
    initMemoryGame() {
        const symbols = ['?', '?', '?', '?', '?', '?', '?', '?'];
        const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        let flipped = [];
        let matched = 0;
        
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        
        cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front">?</div>
                    <div class="memory-card-back">${symbol}</div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                if (flipped.length < 2 && !card.classList.contains('flipped')) {
                    card.classList.add('flipped');
                    flipped.push(index);
                    
                    if (flipped.length === 2) {
                        const [first, second] = flipped;
                        if (cards[first] === cards[second]) {
                            matched++;
                            document.getElementById('scoreMemory').textContent = matched;
                            flipped = [];
                            
                            if (matched === symbols.length) {
                                setTimeout(() => this.completeGame(matched * 100), 500);
                            }
                        } else {
                            setTimeout(() => {
                                document.querySelectorAll('.memory-card').forEach((c, i) => {
                                    if (i === first || i === second) {
                                        c.classList.remove('flipped');
                                    }
                                });
                                flipped = [];
                            }, 1000);
                        }
                    }
                }
            });
            
            grid.appendChild(card);
        });
    }

    // 加载数独游戏（占位）
    loadSudokuGame(container) {
        container.innerHTML = `
            <div class="game-placeholder">
                <div class="placeholder-icon">?</div>
                <h3>数独挑战</h3>
                <p>此游戏正在开发中...</p>
                <button class="btn-primary" onclick="window.miniGameManager.completeGame(500)">
                    跳过（获得基础奖励）
                </button>
            </div>
        `;
    }

    // 加载消消乐游戏（占位）
    loadMatchGame(container) {
        container.innerHTML = `
            <div class="game-placeholder">
                <div class="placeholder-icon">?</div>
                <h3>消消乐挑战</h3>
                <p>此游戏正在开发中...</p>
                <button class="btn-primary" onclick="window.miniGameManager.completeGame(500)">
                    跳过（获得基础奖励）
                </button>
            </div>
        `;
    }

    // 完成游戏
    completeGame(score) {
        this.isGameActive = false;
        
        // 显示完成提示
        const gameBody = document.getElementById('miniGameBody');
        gameBody.innerHTML = `
            <div class="game-complete">
                <div class="complete-icon">?</div>
                <h3>挑战完成！</h3>
                <p>得分: ${score}</p>
                <p class="complete-reward">获得数据碎片 +1</p>
                <button class="btn-primary" id="completeBtn">继续探索</button>
            </div>
        `;
        
        document.getElementById('completeBtn').addEventListener('click', () => {
            if (this.onGameCompleteCallback) {
                this.onGameCompleteCallback(score);
            }
            this.closeGame();
        });
    }

    // 关闭游戏
    closeGame() {
        this.isGameActive = false;
        this.gameContainer.classList.add('hidden');
        
        // 清理当前游戏
        if (this.currentGameCleanup) {
            this.currentGameCleanup();
            this.currentGameCleanup = null;
        }
        
        const gameBody = document.getElementById('miniGameBody');
        if (gameBody) {
            gameBody.innerHTML = '';
        }
    }
}


