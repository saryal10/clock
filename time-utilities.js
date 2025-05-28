document.addEventListener('DOMContentLoaded', function() {
    // --- Tab Navigation Logic ---
    const navButtons = document.querySelectorAll('.nav-tab-button');
    const tabSections = document.querySelectorAll('.tab-content-section');

    function showTab(tabId) {
        // Deactivate all buttons and hide all sections
        navButtons.forEach(button => button.classList.remove('active'));
        tabSections.forEach(section => section.classList.remove('active'));

        // Activate the clicked button and show the corresponding section
        document.querySelector(`.nav-tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // Special handling for each tab when activated
        if (tabId === 'clock') {
            startClock(); // Start updating the clock when its tab is active
        } else {
            stopClock(); // Stop clock updates if another tab is active
        }
        // Reset other timers/stopwatches when switching tabs to avoid background running
        if (tabId !== 'stopwatch') {
            stopwatchReset();
        }
        if (tabId !== 'timer') {
            timerReset();
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            showTab(tabId);
        });
    });

    // --- Stopwatch Logic ---
    let stopwatchStartTime;
    let stopwatchElapsedTime = 0;
    let stopwatchInterval;
    let isStopwatchRunning = false;
    let lapCounter = 0;

    const stopwatchDisplay = document.getElementById('stopwatchDisplay');
    const stopwatchStartBtn = document.getElementById('stopwatchStart');
    const stopwatchPauseBtn = document.getElementById('stopwatchPause');
    const stopwatchResetBtn = document.getElementById('stopwatchReset');
    const stopwatchLapBtn = document.getElementById('stopwatchLap');
    const lapList = document.getElementById('lapList');

    function formatStopwatchTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const milliseconds = ms % 1000;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const format = (num, length) => String(num).padStart(length, '0');

        return `${format(hours, 2)}:${format(minutes, 2)}:${format(seconds, 2)}.${format(milliseconds, 3)}`;
    }

    function updateStopwatchDisplay() {
        const now = Date.now();
        stopwatchElapsedTime = now - stopwatchStartTime;
        stopwatchDisplay.textContent = formatStopwatchTime(stopwatchElapsedTime);
    }

    function stopwatchStart() {
        if (!isStopwatchRunning) {
            stopwatchStartTime = Date.now() - stopwatchElapsedTime;
            stopwatchInterval = setInterval(updateStopwatchDisplay, 10); // Update every 10ms for smooth milliseconds
            isStopwatchRunning = true;
            stopwatchStartBtn.style.display = 'none';
            stopwatchPauseBtn.style.display = 'inline-block';
        }
    }

    function stopwatchPause() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchStartBtn.style.display = 'inline-block';
        stopwatchPauseBtn.style.display = 'none';
    }

    function stopwatchReset() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchElapsedTime = 0;
        lapCounter = 0;
        stopwatchDisplay.textContent = formatStopwatchTime(0);
        lapList.innerHTML = ''; // Clear lap list
        stopwatchStartBtn.style.display = 'inline-block';
        stopwatchPauseBtn.style.display = 'none';
    }

    function stopwatchLap() {
        if (isStopwatchRunning) {
            lapCounter++;
            const lapTime = formatStopwatchTime(stopwatchElapsedTime);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>Lap ${lapCounter}:</span> <span>${lapTime}</span>`;
            lapList.prepend(listItem); // Add to top of the list
        }
    }

    stopwatchStartBtn.addEventListener('click', stopwatchStart);
    stopwatchPauseBtn.addEventListener('click', stopwatchPause);
    stopwatchResetBtn.addEventListener('click', stopwatchReset);
    stopwatchLapBtn.addEventListener('click', stopwatchLap);

    // --- Timer Logic ---
    let timerDuration = 0; // in milliseconds
    let timerRemainingTime = 0;
    let timerInterval;
    let isTimerRunning = false;
    const timerBeep = document.getElementById('timerBeep');

    const timerMinutesInput = document.getElementById('timerMinutes');
    const timerSecondsInput = document.getElementById('timerSeconds');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerStartBtn = document.getElementById('timerStart');
    const timerPauseBtn = document.getElementById('timerPause');
    const timerResetBtn = document.getElementById('timerReset');

    function formatTimerTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const hours = Math.floor(minutes / 60); // In case duration is very long

        const format = (num, length) => String(num).padStart(length, '0');

        return `${format(hours, 2)}:${format(minutes % 60, 2)}:${format(seconds, 2)}`;
    }

    function updateTimerDisplay() {
        if (timerRemainingTime <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerDisplay.textContent = formatTimerTime(0);
            timerStartBtn.style.display = 'inline-block';
            timerPauseBtn.style.display = 'none';
            timerBeep.play(); // Play sound when timer finishes
            // alert("Timer finished!"); // Use custom modal for real apps
            return;
        }
        timerRemainingTime -= 1000; // Decrement by 1 second
        timerDisplay.textContent = formatTimerTime(timerRemainingTime);
    }

    function setTimerDuration() {
        const minutes = parseInt(timerMinutesInput.value) || 0;
        const seconds = parseInt(timerSecondsInput.value) || 0;
        timerDuration = (minutes * 60 + seconds) * 1000;
        if (timerDuration < 0) timerDuration = 0; // Prevent negative duration
        timerRemainingTime = timerDuration;
        timerDisplay.textContent = formatTimerTime(timerRemainingTime);
    }

    function timerStart() {
        if (!isTimerRunning && timerRemainingTime > 0) {
            isTimerRunning = true;
            timerInterval = setInterval(updateTimerDisplay, 1000); // Update every second
            timerStartBtn.style.display = 'none';
            timerPauseBtn.style.display = 'inline-block';
        } else if (timerRemainingTime === 0) {
            // If timer is at 0, re-set it before starting
            setTimerDuration();
            if (timerRemainingTime > 0) {
                isTimerRunning = true;
                timerInterval = setInterval(updateTimerDisplay, 1000);
                timerStartBtn.style.display = 'none';
                timerPauseBtn.style.display = 'inline-block';
            }
        }
    }

    function timerPause() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerStartBtn.style.display = 'inline-block';
        timerPauseBtn.style.display = 'none';
    }

    function timerReset() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        setTimerDuration(); // Reset to the last set duration
        timerStartBtn.style.display = 'inline-block';
        timerPauseBtn.style.display = 'none';
        timerBeep.pause(); // Stop sound if playing
        timerBeep.currentTime = 0; // Rewind sound
    }

    timerMinutesInput.addEventListener('input', setTimerDuration);
    timerSecondsInput.addEventListener('input', setTimerDuration);
    timerStartBtn.addEventListener('click', timerStart);
    timerPauseBtn.addEventListener('click', timerPause);
    timerResetBtn.addEventListener('click', timerReset);

    // Initialize timer display with default values
    setTimerDuration();

    // --- World Clock Logic ---
    const clockDisplay = document.getElementById('clockDisplay');
    const clockLocation = document.getElementById('clockLocation');
    let clockInterval;

    function updateClock() {
        const now = new Date();
        // Options for formatting time and date
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // 24-hour format
        };
        const dateOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        const timeString = now.toLocaleTimeString(undefined, timeOptions);
        const dateString = now.toLocaleDateString(undefined, dateOptions);
        const timezoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Log the detected timezone to the console for debugging
        console.log(`Detected browser timezone: ${timezoneString}`);

        clockDisplay.textContent = timeString;
        clockLocation.textContent = `${dateString} | Current Time is: ${timezoneString}`;
    }

    function startClock() {
        if (!clockInterval) {
            updateClock(); // Initial update
            clockInterval = setInterval(updateClock, 1000); // Update every second
        }
    }

    function stopClock() {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    // Initial tab selection (Stopwatch by default)
    showTab('stopwatch');
});
