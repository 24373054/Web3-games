import { Game } from './Game.js';

console.log('main.js 已加载');

// 等待用户点击开始按钮
document.getElementById('startButton').addEventListener('click', () => {
    console.log('开始按钮被点击');
    
    try {
        document.getElementById('loadingScreen').style.display = 'none';
        
        // 初始化游戏
        const canvas = document.getElementById('renderCanvas');
        console.log('Canvas 元素:', canvas);
        
        // 确保画布可以获得焦点
        canvas.setAttribute('tabindex', '1');
        canvas.focus();
        
        // 点击画布时重新获得焦点
        canvas.addEventListener('click', () => {
            canvas.focus();
            console.log('画布已获得焦点');
        });
        
        const game = new Game(canvas);
        console.log('Game 实例已创建');
        
        // 暴露到全局作用域以便调试
        window.game = game;
        console.log('Game 实例已暴露到 window.game');
        
        // 启动游戏循环
        game.start();
        console.log('游戏循环已启动');
        console.log('');
        console.log('='.repeat(50));
        console.log('🎮 游戏已启动！');
        console.log('💡 如果控制不起作用，请先点击游戏画面');
        console.log('🔍 按 F1 打开调试面板查看实时状态');
        console.log('='.repeat(50));
    } catch (error) {
        console.error('游戏启动失败:', error);
        alert('游戏启动失败，请查看控制台获取详细信息:\n\n' + error.message);
        document.getElementById('loadingScreen').style.display = 'block';
    }
});

