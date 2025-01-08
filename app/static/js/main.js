function openApp(appName) {
    const windowsContainer = document.querySelector('.windows-container');
    
    const window = document.createElement('div');
    window.className = 'window';
    window.id = `window-${Date.now()}`;
    window.setAttribute('data-app', appName);
    window.style.top = '50px';
    window.style.left = '50px';
    window.style.width = '800px';
    window.style.height = '600px';
    
    window.innerHTML = `
        <div class="window-header">
            <div class="window-controls">
                <div class="control-button close"></div>
                <div class="control-button minimize"></div>
                <div class="control-button maximize"></div>
            </div>
            <div class="window-title">${appName}</div>
        </div>
        <div class="window-content">
            <iframe src="/${appName}" 
                    frameborder="0" 
                    style="width: 100%; 
                           height: 100%; 
                           border: none; 
                           overflow: hidden; 
                           position: absolute;
                           top: 0;
                           left: 0;"
            ></iframe>
        </div>
        <div class="resize-handle"></div>
    `;
    
    const closeBtn = window.querySelector('.control-button.close');
    const minimizeBtn = window.querySelector('.control-button.minimize');
    const maximizeBtn = window.querySelector('.control-button.maximize');
    
    closeBtn.addEventListener('click', () => closeWindow(window));
    minimizeBtn.addEventListener('click', () => minimizeWindow(window));
    maximizeBtn.addEventListener('click', () => toggleMaximize(window));
    
    windowsContainer.appendChild(window);
    makeDraggable(window);
    makeResizable(window);
    
    const dockIcon = document.querySelector(`.dock-item img[alt="${appName}"]`).parentElement;
    dockIcon.classList.add('has-window');
    dockIcon.setAttribute('data-window-id', window.id);
    
    window.style.transform = 'translate(50px, 50px)';  
    window.style.top = '0';  
    window.style.left = '0';
}

function minimizeWindow(window) {
    const appName = window.getAttribute('data-app');
    const dockIcon = document.querySelector(`.dock-item img[alt="${appName}"]`).parentElement;
    
    window.classList.add('minimized');
    dockIcon.classList.add('minimized');
    playSound('click');
}

function restoreWindow(appName) {
    const dockIcon = document.querySelector(`.dock-item img[alt="${appName}"]`).parentElement;
    const windowId = dockIcon.getAttribute('data-window-id');
    const window = document.getElementById(windowId);
    
    if (window && dockIcon.classList.contains('minimized')) {
        window.classList.remove('minimized');
        dockIcon.classList.remove('minimized');
        
        const windows = document.querySelectorAll('.window');
        windows.forEach(win => win.style.zIndex = '1');
        window.style.zIndex = '2';
    }
}

function closeWindow(window) {
    playSound('click');
    const dockIcon = document.querySelector(`.dock-item[data-window-id="${window.id}"]`);
    if (dockIcon) {
        dockIcon.classList.remove('has-window');
        dockIcon.removeAttribute('data-window-id');
    }
    window.remove();
}

document.querySelectorAll('.dock-item').forEach(item => {
    item.onclick = (e) => {
        const appName = item.querySelector('img').alt;
        const windowId = item.getAttribute('data-window-id');
        const window = document.getElementById(windowId);
        
        if (window) {
            if (window.classList.contains('minimized')) {
                window.classList.remove('minimized');
                item.classList.remove('minimized');
                const windows = document.querySelectorAll('.window');
                windows.forEach(win => win.style.zIndex = '1');
                window.style.zIndex = '2';
            } else {
                minimizeWindow(window);
            }
        } else {
            openApp(appName);
        }
    };
});

function toggleMaximize(window) {
    playSound('click');
    if (window.classList.contains('maximized')) {
        window.style.transform = `translate(${window.dataset.prevLeft || '50px'}, ${window.dataset.prevTop || '50px'})`;
        window.style.width = window.dataset.prevWidth || '800px';
        window.style.height = window.dataset.prevHeight || '600px';
        window.classList.remove('maximized');
    } else {
        window.dataset.prevWidth = window.style.width;
        window.dataset.prevHeight = window.style.height;
        window.dataset.prevLeft = window.style.transform.split('translate(')[1].split(',')[0] || '50px';
        window.dataset.prevTop = window.style.transform.split(',')[1].split(')')[0] || '50px';
        window.style.transform = 'translate(0, 25px)';  
        window.style.width = '100%';
        window.style.height = 'calc(100vh - 95px)';
        window.classList.add('maximized');
    }
}

function makeDraggable(element) {
    let startX, startY;
    let lastX = 0, lastY = 0;
    let isDragging = false;
    const header = element.querySelector('.window-header');
    
    header.addEventListener('mousedown', dragMouseDown);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    function dragMouseDown(e) {
        if (e.target.classList.contains('control-button')) return;
        
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - lastX;
        startY = e.clientY - lastY;
        
        const windows = document.querySelectorAll('.window');
        windows.forEach(win => win.style.zIndex = '1');
        element.style.zIndex = '2';
    }

    function dragMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        requestAnimationFrame(() => {
            let newX = e.clientX - startX;
            let newY = e.clientY - startY;
            
            const bounds = {
                top: 25,
                bottom: window.innerHeight - 70 - element.offsetHeight,
                left: 0,
                right: window.innerWidth - element.offsetWidth
            };
            
            newX = Math.max(bounds.left, Math.min(bounds.right, newX));
            newY = Math.max(bounds.top, Math.min(bounds.bottom, newY));
            
            element.style.transform = `translate(${newX}px, ${newY}px)`;
            
            lastX = newX;
            lastY = newY;
        });
    }

    function dragEnd() {
        isDragging = false;
    }
}

function makeResizable(element) {
    const resizeHandle = element.querySelector('.resize-handle');
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', initResize, false);

    function initResize(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(element.style.width, 10);
        startHeight = parseInt(element.style.height, 10);
        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);
    }

    function resize(e) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        if (width > 400) element.style.width = width + 'px';
        if (height > 300) element.style.height = height + 'px';
    }

    function stopResize() {
        document.removeEventListener('mousemove', resize, false);
        document.removeEventListener('mouseup', stopResize, false);
    }
}

function toggleMenu(menuItem) {
    playSound('click');
    const wasActive = menuItem.classList.contains('active');
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (!wasActive) {
        menuItem.classList.add('active');
    }
}

function toggleGhostMenu() {
    playSound('click');
    const menu = document.querySelector('.ghost-menu');
    menu.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-item') && !e.target.closest('.ghost-menu')) {
        document.querySelectorAll('.menu-item.active, .ghost-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-option').forEach(option => {
        option.addEventListener('click', () => {
            const action = option.textContent;
            switch(action) {
                case 'Toggle Dock':
                    document.querySelector('.dock').classList.toggle('hidden');
                    break;
                case 'Toggle Full Screen':
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                    break;
            }
        });
    });
});

function minimizeWindow(element) {
    const window = element.closest('.window');
    const appName = window.querySelector('.window-title').textContent;
    const taskbar = document.querySelector('.taskbar-items');
    
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.setAttribute('data-window-id', window.id || `window-${Date.now()}`);
    if (!window.id) window.id = taskbarItem.getAttribute('data-window-id');
    
    const icon = document.querySelector(`.dock-item img[alt="${appName}"]`).cloneNode(true);
    icon.style.width = '16px';
    icon.style.height = '16px';
    
    taskbarItem.innerHTML = `
        ${icon.outerHTML}
        <span>${appName}</span>
    `;
    
    taskbarItem.onclick = () => restoreWindow(window.id);
    taskbar.appendChild(taskbarItem);
    
    window.classList.add('minimized');
}

function restoreWindow(windowId) {
    const window = document.getElementById(windowId);
    const taskbarItem = document.querySelector(`.taskbar-item[data-window-id="${windowId}"]`);
    
    if (window && taskbarItem) {
        window.classList.remove('minimized');
        taskbarItem.remove();
        
        const windows = document.querySelectorAll('.window');
        windows.forEach(win => win.style.zIndex = '1');
        window.style.zIndex = '2';
    }
}

function updateBatteryStatus(battery) {
    const batteryIndicator = document.querySelector('.battery-indicator');
    
    function updateIndicator() {
        const level = Math.floor(battery.level * 100);
        const charging = battery.charging ? '⚡' : '';
        batteryIndicator.textContent = `${charging}${level}%`;
        batteryIndicator.style.color = level > 20 ? '#00ff9d' : '#ff4444';
    }
    
    battery.addEventListener('levelchange', updateIndicator);
    battery.addEventListener('chargingchange', updateIndicator);
    updateIndicator();
}

navigator.getBattery().then(updateBatteryStatus);

function updateNetworkStatus() {
    const networkIndicator = document.querySelector('.network-indicator');
    
    function updateIndicator() {
        const online = navigator.onLine;
        networkIndicator.textContent = online ? '📶' : '✖';
        networkIndicator.style.color = online ? '#00ff9d' : '#ff4444';
    }
    
    window.addEventListener('online', updateIndicator);
    window.addEventListener('offline', updateIndicator);
    updateIndicator();
}

updateNetworkStatus();

class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;

        this.container.appendChild(notification);
        
        notification.querySelector('.notification-close').onclick = () => {
            notification.remove();
        };

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        playSound(type === 'error' ? 'error' : 'notification');
    }
}

const notifications = new NotificationSystem(); 

class VolumeControl {
    constructor() {
        this.volume = 1;
        this.createControl();
    }

    createControl() {
        const control = document.createElement('div');
        control.className = 'volume-control';
        control.innerHTML = `
            <div class="volume-icon" onclick="playSound('click'); this.nextElementSibling.classList.toggle('show')">🔊</div>
            <div class="volume-slider">
                <input type="range" min="0" max="100" value="100">
            </div>
        `;
        
        document.querySelector('.system-indicators').prepend(control);
        
        const slider = control.querySelector('input');
        slider.addEventListener('input', (e) => {
            playSound('click');
            this.setVolume(e.target.value / 100);
        });
    }

    setVolume(value) {
        this.volume = value;
        const icon = document.querySelector('.volume-icon');
        icon.textContent = value === 0 ? '🔇' : value < 0.5 ? '🔉' : '🔊';
        
        Object.values(sounds).forEach(sound => {
            sound.volume = value;
        });
    }
}

const volumeControl = new VolumeControl(); 

let systemSounds = true;

const sounds = {
    click: new Audio('/static/sounds/click.mp3'),
    notification: new Audio('/static/sounds/notification.mp3'),
    error: new Audio('/static/sounds/error.mp3'),
    startup: new Audio('/static/sounds/startup.mp3')
};

Object.values(sounds).forEach(sound => {
    sound.load();
});

function playSound(soundName) {
    if (systemSounds && sounds[soundName]) {
        const sound = sounds[soundName].cloneNode();
        sound.volume = volumeControl ? volumeControl.volume : 1;
        sound.play().catch(() => {});
    }
} 

document.addEventListener('DOMContentLoaded', () => {
    const startupSound = localStorage.getItem('ghostos_startupSound');
    if (startupSound === 'true') {
        const startup = new Audio('/static/sounds/startup.mp3');
        startup.play().catch(() => {});
    }
    
    const theme = localStorage.getItem('ghostos_theme');
    if (theme) {
        document.documentElement.className = theme;
    }
    
    const transparency = localStorage.getItem('ghostos_transparency');
    if (transparency === 'false') {
        document.documentElement.classList.add('no-transparency');
    }
    
    const animations = localStorage.getItem('ghostos_windowAnimation');
    if (animations === 'false') {
        document.documentElement.classList.add('no-animations');
    }
    
    systemSounds = localStorage.getItem('ghostos_systemSounds') !== 'false';
}); 

document.addEventListener('click', (e) => {
    const clickableElements = [
        'button',
        '.menu-item',
        '.menu-option',
        '.dock-item',
        '.window-controls div',
        '.control-button',
        '.ghost-menu',
        '.taskbar-item',
        'input[type="button"]',
        'input[type="submit"]',
        '.window-titlebar',
        '.continue-btn',
        '.toolbar-button',
        '.note-item',
        '.settings-category',
        '.system-indicators span'
    ];

    if (e.target.matches(clickableElements.join(',')) || 
        e.target.closest(clickableElements.join(','))) {
        playSound('click');
    }
}); 