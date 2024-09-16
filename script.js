// State object to manage the properties of windows and grid view
const state = {
  windows: [],
  isGridView: false,
  windowsWithOpacityZero: [],
  clickedWindowInGrid: null
};

// Toggle side navigation
document.getElementById('toggleButton').addEventListener('click', function () {
  const sideNav = document.getElementById('sideNav');
  if (sideNav.classList.contains('closed')) {
    sideNav.classList.remove('closed');
    this.innerHTML = '<';
  } else {
    sideNav.classList.add('closed');
    this.innerHTML = '>';
  }
});

// Adjust notification position on load and resize
document.addEventListener('DOMContentLoaded', function() {
  const controle = document.getElementById('controle');
  const notification = document.getElementById('notification');

  function adjustNotificationPosition() {
    const controleHeight = controle.clientHeight;
    notification.style.bottom = `${controleHeight + 10}px`;
  }

  adjustNotificationPosition();

  controle.addEventListener('transitionend', adjustNotificationPosition);
  window.addEventListener('resize', adjustNotificationPosition);
});

// Drag functionality for windows
function dragElement(elmnt) {
  const header = elmnt.querySelector('.window-header');
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  if (header) {
    header.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    const newTop = elmnt.offsetTop - pos2;
    const newLeft = elmnt.offsetLeft - pos1;

    if (newTop >= 0 && newTop + elmnt.offsetHeight <= window.innerHeight) {
      elmnt.style.top = newTop + "px";
    }
    if (newLeft >= 0 && newLeft + elmnt.offsetWidth <= window.innerWidth) {
      elmnt.style.left = newLeft + "px";
    }

    const windowState = state.windows.find(win => win.id === elmnt.id);
    windowState.top = elmnt.style.top;
    windowState.left = elmnt.style.left;
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Resize functionality for windows
function resizeElement(elmnt) {
  const leftResize = document.createElement('div');
  const rightResize = document.createElement('div');
  const topResize = document.createElement('div');
  const bottomResize = document.createElement('div');

  leftResize.className = 'window-resize-left';
  rightResize.className = 'window-resize-right';
  topResize.className = 'window-resize-top';
  bottomResize.className = 'window-resize-bottom';

  elmnt.appendChild(leftResize);
  elmnt.appendChild(rightResize);
  elmnt.appendChild(topResize);
  elmnt.appendChild(bottomResize);

  leftResize.addEventListener('mousedown', resizeMouseDown);
  rightResize.addEventListener('mousedown', resizeMouseDown);
  topResize.addEventListener('mousedown', resizeMouseDown);
  bottomResize.addEventListener('mousedown', resizeMouseDown);

  function resizeMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    document.onmouseup = closeResizeElement;
    document.onmousemove = elementResize;

    const initialWidth = elmnt.offsetWidth;
    const initialHeight = elmnt.offsetHeight;
    const initialLeft = elmnt.offsetLeft;
    const initialTop = elmnt.offsetTop;
    const dir = e.target.className;

    function elementResize(e) {
      e = e || window.event;
      e.preventDefault();

      if (dir.includes('window-resize-left')) {
        const newWidth = initialWidth + initialLeft - e.clientX;
        if (newWidth > 150) {
          elmnt.style.width = newWidth + 'px';
          elmnt.style.left = e.clientX + 'px';
        }
      }

      if (dir.includes('window-resize-right')) {
        const newWidth = e.clientX - initialLeft;
        if (newWidth > 150) {
          elmnt.style.width = newWidth + 'px';
        }
      }

      if (dir.includes('window-resize-top')) {
        const newHeight = initialHeight + initialTop - e.clientY;
        if (newHeight > 100) {
          elmnt.style.height = newHeight + 'px';
          elmnt.style.top = e.clientY + 'px';
        }
      }

      if (dir.includes('window-resize-bottom')) {
        const newHeight = e.clientY - initialTop;
        if (newHeight > 100) {
          elmnt.style.height = newHeight + 'px';
        }
      }

      const windowState = state.windows.find(win => win.id === elmnt.id);
      windowState.width = elmnt.style.width;
      windowState.height = elmnt.style.height;
      windowState.top = elmnt.style.top;
      windowState.left = elmnt.style.left;
    }

    function closeResizeElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

// Create a new window with a unique ID and add it to the state
function createWindow() {
  const windowsContainer = document.getElementById('windowsContainer');
  const windowId = `window-${state.windows.length + 1}`;
  const windowDiv = document.createElement('div');
  windowDiv.className = 'window';
  windowDiv.id = windowId;
  windowDiv.innerHTML = `
    <div class="window-header">
      <span class="triangle-button">&#9650;</span>
      <span class="fullscreen-button">&#9724;</span>
      <span class="delete-button">&#x2F;</span>
      <span class="minimize-button">&#8211;</span>
      <p>Window Title</p>
    </div>
    <div class="window-content">
      <p>Window content goes here...</p>
    </div>
  `;
  windowsContainer.appendChild(windowDiv);

  // Add window properties to the state
  state.windows.push({
    id: windowId,
    top: '100px',
    left: '100px',
    width: '300px',
    height: '200px',
    zIndex: 100,
    isFullscreen: false,
    isMinimized: false,
    originalOpacity: '1',
    originalState: {}
  });

  // Initialize drag and resize functionality
  dragElement(windowDiv);
  resizeElement(windowDiv);

  // Event listeners for window actions
  windowDiv.querySelector('.fullscreen-button').addEventListener('click', toggleFullscreen.bind(null, windowId));
  windowDiv.querySelector('.minimize-button').addEventListener('click', toggleMinimize.bind(null, windowId));
  windowDiv.querySelector('.delete-button').addEventListener('click', deleteWindow.bind(null, windowId));
}

// Toggle fullscreen mode for a window
function toggleFullscreen(windowId) {
  const windowState = state.windows.find(win => win.id === windowId);
  const windowDiv = document.getElementById(windowId);

  if (windowState.isFullscreen) {
    windowDiv.classList.remove('fullscreen');
    windowDiv.style.width = windowState.width;
    windowDiv.style.height = windowState.height;
    windowDiv.style.top = windowState.top;
    windowDiv.style.left = windowState.left;
  } else {
    windowDiv.classList.add('fullscreen');
    windowDiv.style.width = '100%';
    windowDiv.style.height = '100%';
    windowDiv.style.top = '0';
    windowDiv.style.left = '0';
  }

  windowState.isFullscreen = !windowState.isFullscreen;
}

// Toggle minimize/maximize state of a window
function toggleMinimize(windowId) {
  const windowState = state.windows.find(win => win.id === windowId);
  const windowDiv = document.getElementById(windowId);

  if (windowState.isMinimized) {
    windowDiv.classList.remove('minimized');
    windowDiv.style.opacity = windowState.originalState.opacity || windowState.originalOpacity;
    windowDiv.style.width = windowState.originalState.width || windowState.width;
    windowDiv.style.height = windowState.originalState.height || windowState.height;
    windowDiv.style.top = windowState.originalState.top || windowState.top;
    windowDiv.style.left = windowState.originalState.left || windowState.left;
  } else {
    windowState.originalState = {
      opacity: windowDiv.style.opacity,
      width: windowDiv.style.width,
      height: windowDiv.style.height,
      top: windowDiv.style.top,
      left: windowDiv.style.left
    };
    windowDiv.classList.add('minimized');
    windowDiv.style.opacity = '0';
  }

  windowState.isMinimized = !windowState.isMinimized;
}

// Delete a window
function deleteWindow(windowId) {
  state.windows = state.windows.filter(win => win.id !== windowId);
  const windowDiv = document.getElementById(windowId);
  if (windowDiv) {
    windowDiv.parentNode.removeChild(windowDiv);
  }
}

// Bring a window to the front
function bringToFront(windowId) {
  state.windows.forEach(win => {
    const windowDiv = document.getElementById(win.id);
    if (win.id === windowId) {
      win.zIndex = 200; // Bring to front
    } else {
      win.zIndex = 100; // Send to back
    }
    windowDiv.style.zIndex = win.zIndex;
  });

  const windowDiv = document.getElementById(windowId);
  windowDiv.style.opacity = '1'; // Set clicked window opacity to 1

  if (state.isGridView) {
    toggleGridView();
  }
}

// Toggle grid view functionality
function toggleGridView() {
  const windows = document.querySelectorAll('.window');
  if (!state.isGridView) {
    saveOriginalStates(windows);
    arrangeInGrid(windows);
  } else {
    restoreOriginalStates(windows);
  }
  state.isGridView = !state.isGridView;
}

// Save original states of windows
function saveOriginalStates(windows) {
  state.windowsWithOpacityZero = [];
  state.windows.forEach(win => {
    const windowDiv = document.getElementById(win.id);
    win.originalState = {
      width: windowDiv.style.width,
      height: windowDiv.style.height,
      top: windowDiv.style.top,
      left: windowDiv.style.left,
      zIndex: windowDiv.style.zIndex,
      opacity: windowDiv.style.opacity // Save original opacity
    };
    if (windowDiv.style.opacity === '0') {
      state.windowsWithOpacityZero.push(win.id);
    }
    windowDiv.style.opacity = '1'; // Set opacity to 1 for grid view
  });

  console.log("Windows with original opacity 0: ", state.windowsWithOpacityZero);
}

// Restore original states of windows
function restoreOriginalStates(windows) {
  state.windows.forEach(win => {
    const windowDiv = document.getElementById(win.id);
    if (win.id !== state.clickedWindowInGrid) {
      if (state.windowsWithOpacityZero.includes(win.id)) {
        windowDiv.style.opacity = '0'; // Restore minimized state
        windowDiv.style.pointerEvents = 'none'; // Make it non-interactive
      } else {
        windowDiv.style.opacity = '1';
        windowDiv.style.pointerEvents = 'auto'; // Make it interactive
      }
    } else {
      windowDiv.style.opacity = '1';
      windowDiv.style.pointerEvents = 'auto'; // Make it interactive
    }
    windowDiv.style.width = win.originalState.width;
    windowDiv.style.height = win.originalState.height;
    windowDiv.style.top = win.originalState.top;
    windowDiv.style.left = win.originalState.left;
    windowDiv.style.zIndex = win.originalState.zIndex;
  });

  console.log("Window clicked in grid view: ", state.clickedWindowInGrid);
}

// Arrange windows in a grid layout
function arrangeInGrid(windows) {
  const containerWidth = document.getElementById('windowsContainer').clientWidth;
  const numCols = Math.floor(containerWidth / (300 + 10));
  let currentTop = 0;
  let currentLeft = 0;

  windows.forEach((win, index) => {
    const windowDiv = document.getElementById(win.id);
    if (index % numCols === 0 && index > 0) {
      currentTop += 200 + 10;
      currentLeft = 0;
    }
    windowDiv.style.width = '300px';
    windowDiv.style.height = '200px';
    windowDiv.style.top = `${currentTop}px`;
    windowDiv.style.left = `${currentLeft}px`;
    windowDiv.style.opacity = '1'; // Ensure opacity is 1 in grid view
    windowDiv.style.pointerEvents = 'auto'; // Make it interactive in grid view
    currentLeft += 300 + 10;
  });
}

// Add event listener to the grid view icon
document.getElementById('bottomicon').addEventListener('click', toggleGridView);

// Create initial window
createWindow();

// Add event listener to the 'Add Window' button
document.getElementById('addWindow').addEventListener('click', function() {
  createWindow();
});

// Ensure existing windows are draggable and resizable
document.querySelectorAll('.window').forEach(window => {
  dragElement(window);
  resizeElement(window);
});

// Detect window click based on mouse coordinates
document.addEventListener('click', function(event) {
  if (state.isGridView) {
    state.windows.forEach(win => {
      const windowDiv = document.getElementById(win.id);
      const rect = windowDiv.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        state.clickedWindowInGrid = win.id;
        if (win.isMinimized) {
          toggleMinimize(win.id); // Un-minimize if the window was minimized
        }
        windowDiv.style.opacity = '1'; // Set clicked window opacity to 1
        bringToFront(win.id);
        console.log(`Window ${win.id} clicked in grid view`);
      }
    });
  }
});

// Add event listener to the logout button
document.getElementById('logout-controle').addEventListener('click', function() {
  // Perform logout logic here, e.g., clear session, redirect, etc.
  // For this example, we'll just redirect to a logout page or similar
  window.location.href = 'logout.html'; // Update this to your actual logout URL or logic
});
