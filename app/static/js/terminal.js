class Terminal {
    constructor(container) {
        this.container = container;
        this.history = [];
        this.historyIndex = -1;
        this.currentLine = '';
        this.prompt = 'ghost@ghostos:~$ ';
        this.currentDir = '~';
        this.fileSystem = {
            '~': {
                type: 'dir',
                content: {
                    'documents': { type: 'dir', content: {} },
                    'downloads': { type: 'dir', content: {} },
                    'welcome.txt': { type: 'file', content: 'Welcome to GhostOS Terminal!' },
                    'help.txt': { type: 'file', content: 'Type "help" for a list of commands.' }
                }
            }
        };
        
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="terminal-output"></div>
            <div class="terminal-input">
                <span class="prompt">${this.prompt}</span>
                <span class="input-line"></span>
                <span class="cursor">█</span>
            </div>
        `;
        
        this.printLine('Welcome to GhostOS Terminal');
        this.printLine('Type "help" for a list of commands\n');
        
        document.addEventListener('keydown', this.handleInput.bind(this));
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            this.executeCommand();
        } else if (e.key === 'Backspace') {
            this.currentLine = this.currentLine.slice(0, -1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.currentLine = this.history[this.history.length - 1 - this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.currentLine = this.history[this.history.length - 1 - this.historyIndex];
            } else {
                this.historyIndex = -1;
                this.currentLine = '';
            }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            this.currentLine += e.key;
        }
        
        this.updateDisplay();
    }

    executeCommand() {
        const output = this.container.querySelector('.terminal-output');
        output.innerHTML += `<div><span class="prompt">${this.prompt}</span>${this.currentLine}</div>`;
        
        const args = this.currentLine.trim().split(' ');
        const command = args[0].toLowerCase();
        
        if (this.currentLine.trim()) {
            this.history.unshift(this.currentLine);
        }
        
        switch (command) {
            case 'help':
                this.printHelp();
                break;
            case 'clear':
                this.clearScreen();
                break;
            case 'echo':
                this.printLine(args.slice(1).join(' '));
                break;
            case 'ls':
                this.listDirectory();
                break;
            case 'cd':
                this.changeDirectory(args[1]);
                break;
            case 'pwd':
                this.printWorkingDirectory();
                break;
            case 'mkdir':
                this.makeDirectory(args[1]);
                break;
            case 'touch':
                this.createFile(args[1]);
                break;
            case 'cat':
                this.readFile(args[1]);
                break;
            case 'rm':
                this.removeFile(args[1]);
                break;
            case 'date':
                this.showDate();
                break;
            case 'whoami':
                this.printLine('ghost');
                break;
            case 'uname':
                this.printLine('GhostOS 1.0');
                break;
            case 'hostname':
                this.printLine('ghostos');
                break;
            case 'uptime':
                this.showUptime();
                break;
            case 'ps':
                this.listProcesses();
                break;
            case 'neofetch':
                this.showNeofetch();
                break;
            case 'tree':
                this.showTree();
                break;
            case 'weather':
                this.showWeather();
                break;
            case 'calc':
                this.calculate(args.slice(1).join(' '));
                break;
            case '':
                break;
            default:
                this.printLine(`Command not found: ${command}`);
        }
        
        this.currentLine = '';
        this.historyIndex = -1;
        this.updateDisplay();
        this.scrollToBottom();
    }

    printHelp() {
        const commands = [
            'help     - Show this help message',
            'clear    - Clear the terminal screen',
            'echo     - Print text to the terminal',
            'ls       - List directory contents',
            'cd       - Change directory',
            'pwd      - Print working directory',
            'mkdir    - Create a new directory',
            'touch    - Create a new file',
            'cat      - Read file contents',
            'rm       - Remove file or directory',
            'date     - Show current date and time',
            'whoami   - Show current user',
            'uname    - Show system information',
            'hostname - Show system hostname',
            'uptime   - Show system uptime',
            'ps       - List running processes',
            'neofetch - Show system information in a fancy way',
            'tree     - Show directory structure',
            'weather  - Show weather information',
            'calc     - Simple calculator (e.g., calc 2 + 2)'
        ];
        commands.forEach(cmd => this.printLine(cmd));
    }

    clearScreen() {
        const output = this.container.querySelector('.terminal-output');
        output.innerHTML = '';
    }

    listDirectory() {
        const currentDir = this.getCurrentDir();
        const items = Object.entries(currentDir.content).map(([name, item]) => {
            return item.type === 'dir' ? `\x1b[1;34m${name}/\x1b[0m` : name;
        });
        this.printLine(items.join('  '));
    }

    changeDirectory(dir) {
        if (!dir || dir === '~') {
            this.currentDir = '~';
            return;
        }
        // Add more cd logic here
        this.printLine(`cd: ${dir}: No such directory`);
    }

    printWorkingDirectory() {
        this.printLine(this.currentDir);
    }

    makeDirectory(name) {
        if (!name) {
            this.printLine('mkdir: missing operand');
            return;
        }
        const currentDir = this.getCurrentDir();
        currentDir.content[name] = { type: 'dir', content: {} };
    }

    createFile(name) {
        if (!name) {
            this.printLine('touch: missing operand');
            return;
        }
        const currentDir = this.getCurrentDir();
        currentDir.content[name] = { type: 'file', content: '' };
    }

    readFile(name) {
        if (!name) {
            this.printLine('cat: missing operand');
            return;
        }
        const currentDir = this.getCurrentDir();
        const file = currentDir.content[name];
        if (file && file.type === 'file') {
            this.printLine(file.content);
        } else {
            this.printLine(`cat: ${name}: No such file`);
        }
    }

    removeFile(name) {
        if (!name) {
            this.printLine('rm: missing operand');
            return;
        }
        const currentDir = this.getCurrentDir();
        if (currentDir.content[name]) {
            delete currentDir.content[name];
        } else {
            this.printLine(`rm: ${name}: No such file or directory`);
        }
    }

    showDate() {
        this.printLine(new Date().toString());
    }

    showUptime() {
        const uptime = Math.floor(performance.now() / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        this.printLine(`up ${hours}:${minutes}:${seconds}`);
    }

    listProcesses() {
        const processes = [
            'PID  COMMAND',
            '1    systemd',
            '2    kernel',
            '3    ghostos-terminal',
            '4    ghostos-ui'
        ];
        processes.forEach(proc => this.printLine(proc));
    }

    showNeofetch() {
        const art = [
            '       ▄▄▄▄▄▄▄       ',
            '    ▄█████████████▄    ',
            '  ▄███████████████████▄  ',
            ' ▄█████████████████████▄ ',
            '██████████████████████████',
            '██████████████████████████',
            ' ▀█████████████████████▀ ',
            '   ▀███████████████▀   ',
            '      ▀▀▀▀▀▀▀▀▀      '
        ];
        const info = [
            'OS: GhostOS',
            'Kernel: Ghost 1.0',
            'Shell: ghost-terminal',
            'CPU: GhostCore Pro i9',
            'Memory: 16GB / 32GB',
            'Theme: Ghost Dark'
        ];
        
        art.forEach((line, i) => {
            this.printLine(`\x1b[1;32m${line}\x1b[0m ${info[i] || ''}`);
        });
    }

    showTree() {
        const printTree = (dir, prefix = '') => {
            Object.entries(dir.content).forEach(([name, item], i, arr) => {
                const isLast = i === arr.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                this.printLine(prefix + connector + name);
                if (item.type === 'dir') {
                    printTree(item, prefix + (isLast ? '    ' : '│   '));
                }
            });
        };
        this.printLine('.');
        printTree(this.getCurrentDir());
    }

    showWeather() {
        const weather = [
            '☀️  Currently: Sunny',
            '🌡️  Temperature: 22°C',
            '💨  Wind: 5 km/h',
            '💧  Humidity: 45%'
        ];
        weather.forEach(line => this.printLine(line));
    }

    calculate(expression) {
        try {
            const result = eval(expression);
            this.printLine(`${expression} = ${result}`);
        } catch (e) {
            this.printLine('Invalid expression');
        }
    }

    getCurrentDir() {
        return this.fileSystem[this.currentDir];
    }

    printLine(text) {
        const output = this.container.querySelector('.terminal-output');
        output.innerHTML += `<div>${text}</div>`;
        this.scrollToBottom();
    }

    updateDisplay() {
        const inputLine = this.container.querySelector('.input-line');
        inputLine.textContent = this.currentLine;
    }

    scrollToBottom() {
        // Ensure we're always scrolled to the bottom
        this.container.scrollTop = this.container.scrollHeight;
    }
} 