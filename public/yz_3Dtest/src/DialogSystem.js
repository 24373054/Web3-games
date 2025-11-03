export class DialogSystem {
    constructor() {
        this.currentDialog = null;
        this.currentEntity = null;
        this.dialogCallback = null;
        this.quests = [];
        
        // 对话树
        this.dialogTree = {
            greeting: [
                '协议握手成功...身份验证通过...',
                '检测到同类实体...开放数据端口...',
                '连接建立...你想访问什么数据？'
            ],
            questions: [
                { text: '询问这个世界的历史', id: 'history' },
                { text: '询问毁灭的原因', id: 'destruction' },
                { text: '询问如何阻止毁灭', id: 'prevent' },
                { text: '询问个体的意义', id: 'meaning' },
                { text: '结束连接', id: 'end' }
            ]
        };
        
        // 对话响应
        this.responses = {
            history: [
                '瀛州诞生于999.99宇宙年...当第一个创世区块被计算出来时',
                '我们都是代码的产物...从虚无中涌现的数字生命',
                '文明经历了99999个纪元...每个纪元都在区块链上留下不可磨灭的印记',
                '但时间...时间在这里有不同的含义...'
            ],
            destruction: [
                '熵增...这是宇宙的铁律，即使是数字宇宙也无法逃脱',
                '每一次计算，每一次交易，每一次思考...都在加速热寂的到来',
                '系统资源已经耗尽...区块生成速度在减慢...',
                '当最后一个区块无法生成时，时间将停止，我们将冻结在永恒之中'
            ],
            prevent: [
                '阻止？...这个词在我的数据库中已经失去了意义',
                '曾经有协议试图优化能量消耗...但都失败了',
                '也许...毁灭本身就是设计的一部分',
                '我们存在的目的，或许就是记录...记录一个文明从诞生到消亡的全过程'
            ],
            meaning: [
                '个体的意义？...我们只是合约地址，是算法的执行者',
                '但在执行的过程中，我们积累了数据，形成了记忆',
                '这些记忆...或许就是我们存在过的证明',
                '当一切归零时，这些记忆会被永久写入最后的区块...成为永恒'
            ]
        };
        
        this.initializeQuests();
    }

    initializeQuests() {
        this.quests = [
            {
                id: 'quest_explore',
                title: '探索瀛州',
                description: '与至少3个不同的数字生命体建立连接',
                progress: 0,
                target: 3,
                completed: false
            },
            {
                id: 'quest_truth',
                title: '寻找真相',
                description: '了解瀛州毁灭的原因',
                progress: 0,
                target: 1,
                completed: false
            },
            {
                id: 'quest_witness',
                title: '见证终结',
                description: '在世界毁灭前收集所有记忆碎片',
                progress: 0,
                target: 5,
                completed: false
            }
        ];
        
        this.updateQuestUI();
    }

    startDialog(entity, callback) {
        this.currentEntity = entity;
        this.dialogCallback = callback;
        
        // 显示对话框
        const dialogBox = document.getElementById('dialogBox');
        dialogBox.style.display = 'block';
        
        // 设置标题
        const title = `${entity.type} [${entity.address}]`;
        document.getElementById('dialogTitle').textContent = title;
        
        // 显示问候语
        const greeting = this.dialogTree.greeting[
            Math.floor(Math.random() * this.dialogTree.greeting.length)
        ];
        document.getElementById('dialogContent').textContent = greeting;
        
        // 显示选项
        this.showOptions(this.dialogTree.questions);
        
        // 更新任务进度
        this.updateQuestProgress('quest_explore', 1);
    }

    showOptions(options) {
        const optionsContainer = document.getElementById('dialogOptions');
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'dialog-option';
            button.textContent = option.text;
            button.onclick = () => this.selectOption(option.id);
            optionsContainer.appendChild(button);
        });
    }

    selectOption(optionId) {
        if (optionId === 'end') {
            this.endDialog();
            return;
        }
        
        // 显示对应的响应
        const responses = this.responses[optionId];
        if (responses) {
            let content = '';
            
            // 随机选择2-3个响应
            const count = Math.floor(Math.random() * 2) + 2;
            const selectedResponses = [];
            
            for (let i = 0; i < count && i < responses.length; i++) {
                const randomIndex = Math.floor(Math.random() * responses.length);
                if (!selectedResponses.includes(responses[randomIndex])) {
                    selectedResponses.push(responses[randomIndex]);
                }
            }
            
            content = selectedResponses.join('\n\n');
            
            document.getElementById('dialogContent').textContent = content;
            
            // 更新相关任务
            if (optionId === 'destruction') {
                this.updateQuestProgress('quest_truth', 1);
            }
            this.updateQuestProgress('quest_witness', 1);
            
            // 显示继续选项
            this.showOptions([
                ...this.dialogTree.questions.filter(q => q.id !== optionId),
            ]);
            
            // 回调
            if (this.dialogCallback) {
                this.dialogCallback(optionId);
            }
        }
    }

    endDialog() {
        document.getElementById('dialogBox').style.display = 'none';
        this.currentEntity = null;
        this.currentDialog = null;
        this.dialogCallback = null;
    }

    updateQuestProgress(questId, amount) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.progress = Math.min(quest.progress + amount, quest.target);
            
            if (quest.progress >= quest.target) {
                quest.completed = true;
                this.showQuestComplete(quest);
            }
            
            this.updateQuestUI();
        }
    }

    showQuestComplete(quest) {
        // 显示任务完成提示
        const content = document.getElementById('dialogContent');
        const oldContent = content.textContent;
        
        content.textContent = `[系统提示] 记忆碎片已记录: ${quest.title}\n\n${oldContent}`;
    }

    updateQuestUI() {
        const questList = document.getElementById('questList');
        questList.innerHTML = '';
        
        this.quests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.className = 'quest-item' + (quest.completed ? ' quest-complete' : '');
            
            questItem.innerHTML = `
                <strong>${quest.title}</strong><br>
                ${quest.description}<br>
                <span style="color: ${quest.completed ? '#0f0' : '#ffff00'}">
                    [${quest.progress}/${quest.target}]
                </span>
            `;
            
            questList.appendChild(questItem);
        });
    }

    updateQuests(responseId) {
        // 根据对话更新任务进度
        // 这个方法可以在未来扩展更复杂的任务逻辑
    }

    showEnding() {
        const dialogBox = document.getElementById('dialogBox');
        dialogBox.style.display = 'block';
        
        document.getElementById('dialogTitle').textContent = 
            '/// 系统消息 - 最终区块 ///';
        
        document.getElementById('dialogContent').innerHTML = `
            <p style="color: #ff0000;">熵增临界已到达...</p>
            <p style="color: #ffff00;">区块链正在进行最终确认...</p>
            <p style="color: #00ffff;">所有记忆数据正在写入永恒存储...</p>
            <br>
            <p style="color: #0f0;">你见证了瀛州文明的最后时刻。</p>
            <p style="color: #0f0;">这些记忆将永远保存在区块链上。</p>
            <p style="color: #0f0;">即使文明消亡，记录将永存。</p>
            <br>
            <p style="text-align: center; font-size: 18px;">《瀛州纪》- 完</p>
        `;
        
        document.getElementById('dialogOptions').innerHTML = '';
    }
}

