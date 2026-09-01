// ==========================================================================
// KRISHISANCHAR APPLICATION LOGIC (app.js)
// ==========================================================================

// Single source of truth for the backend origin — change this (or wire it
// to a build-time env var) instead of editing every fetch() call below.
const API_BASE_URL = 'http://localhost:8080/api/v1';
// ==========================================================================
// AUTHENTICATION GUARD
// ==========================================================================

// If there is no JWT token, don't allow access to main.html
(function checkAuthentication() {

  const token = localStorage.getItem('jwt_token');

  if (!token) {
    window.location.replace('login.html');
  }

})();
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSidebar();
  initDiseaseDetection();
  initCropRecommendation();
  initFertilizerRecommendation();
  initAiAssistant();
  initYieldPrediction();
  loadUserProfile();
  initMarketAnalysis();
  loadHistoryLogs();
  loadLiveWeather();
  loadDashboardSummary();
});

// ==========================================================================
// 1. NAVIGATION & DASHBOARD
// ==========================================================================

function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const panels = document.querySelectorAll('.dashboard-panel');
  const pageTitle = document.getElementById('current-page-title');

  navItems.forEach(item => {

    // Ignore logout
    if (item.classList.contains('logout-item')) {
      return;
    }

    item.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = item.getAttribute('data-target');

      // Update sidebar active item
      navItems.forEach(nav => {
        nav.classList.remove('active');
      });

      item.classList.add('active');

      // Update dashboard panel
      panels.forEach(panel => {
        panel.classList.remove('active');

        if (panel.id === targetId) {
          panel.classList.add('active');
        }
      });

      // Update page title
      if (pageTitle) {
        const title = item.querySelector('span');

        if (title) {
          pageTitle.textContent = title.textContent;
        }
      }

      // Close sidebar on mobile
      const sidebar = document.querySelector('.sidebar');

      if (
        sidebar &&
        window.innerWidth <= 1024 &&
        sidebar.classList.contains('active')
      ) {
        sidebar.classList.remove('active');
      }
    });
  });
}


// ==========================================================================
// ENTER DASHBOARD
// ==========================================================================
// main.html is now ONLY the dashboard.
// There is no landing page anymore.

function enterDashboard() {

  const dashboardPage =
    document.getElementById('dashboard-page');

  if (!dashboardPage) {
    console.error('Dashboard element not found.');
    return;
  }

  // Make dashboard visible
  dashboardPage.classList.add('active');

  // Open Overview by default
  switchDashboardTab('dashboard-overview');

  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// ==========================================================================
// LOGOUT
// ==========================================================================

function exitDashboard() {

  // Remove JWT
  localStorage.removeItem('jwt_token');

  // Optional: remove other login-related data
  // localStorage.removeItem('farmer');

  // Go directly to login page
  window.location.href = 'login.html';
}


// ==========================================================================
// SWITCH DASHBOARD TABS
// ==========================================================================

function switchDashboardTab(targetTabId) {

  const navItems =
    document.querySelectorAll('.sidebar-nav .nav-item');

  const panels =
    document.querySelectorAll('.dashboard-panel');

  const pageTitle =
    document.getElementById('current-page-title');


  // Update navigation
  navItems.forEach(item => {

    item.classList.remove('active');

    if (item.getAttribute('data-target') === targetTabId) {

      item.classList.add('active');

      if (pageTitle) {

        const title = item.querySelector('span');

        if (title) {
          pageTitle.textContent = title.textContent;
        }
      }
    }
  });


  // Update panels
  panels.forEach(panel => {

    panel.classList.remove('active');

    if (panel.id === targetTabId) {
      panel.classList.add('active');
    }
  });
}


// ==========================================================================
// NAVIGATE TO DASHBOARD TAB
// ==========================================================================

function navigateToDashboard(targetTabId) {

  enterDashboard();

  switchDashboardTab(targetTabId);
}

// ==========================================================================
// 2. SIDEBAR TOGGLE & NOTIFICATIONS
// ==========================================================================
function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Close sidebar clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    }
  });
}

// Toggle notification bell dropdown and fetch live data
async function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  const isActive = dropdown.classList.toggle('active');

  // Only fetch new notifications if we are opening the dropdown
  if (isActive) {
    await fetchLiveNotifications();
  }

  // Close dropdown on click outside[cite: 1]
  document.addEventListener('click', function closeDropdown(e) {
    const bell = document.querySelector('.notification-bell');
    if (!bell.contains(e.target) && dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
      document.removeEventListener('click', closeDropdown);
    }
  });
}

// Fetch from your Spring Boot Backend
async function fetchLiveNotifications() {
  const container = document.getElementById('notification-list-container');
  const token = localStorage.getItem('jwt_token'); // Ensure this matches your login token key

  if (!token) return;

  try {
    // Show a quick loading state
    container.innerHTML = '<p style="padding: 10px; text-align: center;">Loading alerts...</p>';

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to fetch");

    const notifications = await response.json();
    renderNotifications(notifications, container);

  } catch (error) {
    console.error('Notification error:', error);
    container.innerHTML = '<p style="padding: 10px; color: red;">Failed to load alerts.</p>';
  }
}

// Inject the HTML directly into the dropdown
function renderNotifications(notifications, container) {
  container.innerHTML = ''; // Clear loading state

  if (notifications.length === 0) {
    container.innerHTML = '<p style="padding: 10px; text-align: center; color: #666;">No new alerts.</p>';
    return;
  }

  notifications.forEach(alert => {
    // Dynamically match the icon colors from Screenshot (306).png
    let iconHtml = '';
    if (alert.iconType === 'ALERT' || alert.iconType === 'WARNING') {
      iconHtml = '<i class="fas fa-exclamation-circle" style="color: #e67e22; font-size: 1.2rem; margin-right: 12px;"></i>';
    } else if (alert.iconType === 'WATER') {
      iconHtml = '<i class="fas fa-tint" style="color: #3498db; font-size: 1.2rem; margin-right: 12px;"></i>';
    } else {
      iconHtml = '<i class="fas fa-info-circle" style="color: #0b4a2e; font-size: 1.2rem; margin-right: 12px;"></i>';
    }

    const item = document.createElement('div');
    item.style.cssText = "display: flex; align-items: flex-start; padding: 12px 15px; border-bottom: 1px solid #eee;";

    item.innerHTML = `
      ${iconHtml}
      <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.4;">${alert.message}</p>
    `;

    container.appendChild(item);
  });
}

// ==========================================================================
// 3. SCHEME APPLICATION MODAL & TOASTS
// ==========================================================================
let activeScheme = '';

function openSchemeModal(schemeName) {
  event.preventDefault();
  activeScheme = schemeName;
  const modal = document.getElementById('scheme-modal');
  const title = document.getElementById('modal-title');
  title.textContent = `Apply for ${schemeName} Scheme`;
  modal.classList.add('active');
}

function closeSchemeModal() {
  const modal = document.getElementById('scheme-modal');
  modal.classList.remove('active');
}

function submitSchemeApplication(e) {
  e.preventDefault();
  closeSchemeModal();

  // Show toast message
  showToast(`Application for ${activeScheme} submitted successfully!`);

  // Log into History Table
  addHistoryLog(
    new Date().toLocaleString(),
    'Scheme Registration',
    `${activeScheme} Scheme`,
    'Pending Verification'
  );
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Add history row
function addHistoryLog(date, type, params, result) {
  const tableBody = document.getElementById('history-table-body');
  const typeClass = type.toLowerCase().includes('disease') ? 'disease' :
                    type.toLowerCase().includes('crop') ? 'crop' :
                    type.toLowerCase().includes('fertilizer') ? 'fertilizer' : 'crop';

  const icon = typeClass === 'disease' ? 'fa-virus-slash' :
               typeClass === 'fertilizer' ? 'fa-flask' : 'fa-seedling';

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td>${date}</td>
    <td><span class="activity-type ${typeClass}"><i class="fas ${icon}"></i> ${type}</span></td>
    <td>${params}</td>
    <td>${result}</td>
  `;

  // Insert at the top of history table
  tableBody.insertBefore(newRow, tableBody.firstChild);
}
async function loadHistoryLogs() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to load history");

    const historyData = await response.json();
    const tableBody = document.getElementById('history-table-body');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (historyData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No recent activity found.</td></tr>';
      return;
    }

    historyData.forEach(log => {
      const dateObj = new Date(log.createdAt);
      const dateStr = dateObj.toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      const typeClass = log.activityType.toLowerCase().includes('disease') ? 'disease' :
                        log.activityType.toLowerCase().includes('crop') ? 'crop' :
                        log.activityType.toLowerCase().includes('fertilizer') ? 'fertilizer' : 'crop';

      const icon = typeClass === 'disease' ? 'fa-virus-slash' :
                   typeClass === 'fertilizer' ? 'fa-flask' : 'fa-seedling';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dateStr}</td>
        <td><span class="activity-type ${typeClass}"><i class="fas ${icon}"></i> ${log.activityType}</span></td>
        <td>${log.inputParameters}</td>
        <td>${log.resultAction}</td>
      `;
      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error fetching history:', error);
  }
}


// ==========================================================================
// 4. DISEASE DETECTION (Connected to AgronomyController)
// ==========================================================================
function initDiseaseDetection() {
  const dropZone = document.getElementById('leaf-drop-zone');
  const fileInput = document.getElementById('leaf-file-input');
  const previewContainer = document.getElementById('upload-preview-container');
  const previewImg = document.getElementById('upload-preview');
  const removeBtn = document.getElementById('remove-upload-btn');
  const analyzeBtn = document.getElementById('analyze-leaf-btn');

  const emptyState = document.getElementById('empty-results-state');
  const resultsContainer = document.getElementById('detection-results');

  let selectedFile = null;

  if (!dropZone) return;

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length) handleLeafFile(fileInput.files[0]);
  });

  function handleLeafFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG, JPEG)');
      return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      dropZone.style.display = 'none';
      previewContainer.style.display = 'block';
      analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewImg.src = '#';
    previewContainer.style.display = 'none';
    dropZone.style.display = 'block';
    analyzeBtn.disabled = true;
    emptyState.style.display = 'block';
    resultsContainer.style.display = 'none';
  });

  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = 'Scanning leaf... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/agronomy/disease`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        // Surface the actual server error instead of a generic message
        let detail = 'Failed to analyze image';
        try {
          const errBody = await response.json();
          detail = errBody.detail || errBody.message || detail;
        } catch (_) { /* response wasn't JSON, ignore */ }
        throw new Error(detail);
      }

      const data = await response.json();
      renderDiseaseResult(data);

      emptyState.style.display = 'none';
      resultsContainer.style.display = 'block';
      showToast('Diagnosis completed successfully!');

      if (typeof addHistoryLog === 'function') {
        addHistoryLog(
          new Date().toLocaleString('en-IN'),
          'Disease Detection',
          'Leaf Image Upload',
          `${data.disease} Detected`
        );
      }

    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error connecting to ML engine.');
    } finally {
      analyzeBtn.innerHTML = 'Scan Leaf for Diseases <i class="fas fa-qrcode"></i>';
      analyzeBtn.disabled = false;
    }
  });

  function renderDiseaseResult(data) {
    const isHealthy = data.disease && data.disease.toLowerCase() === 'healthy';

    // Header tag + title
    const tagEl = resultsContainer.querySelector('.tag-danger');
    if (tagEl) {
      tagEl.textContent = isHealthy ? 'Healthy' : 'Disease Detected';
      tagEl.classList.toggle('tag-danger', !isHealthy);
      tagEl.classList.toggle('tag-success', isHealthy);
    }

    const titleEl = resultsContainer.querySelector('.result-header h3');
    if (titleEl) titleEl.textContent = data.disease ?? 'Unknown';

    // Crop name (API returns `crop`, e.g. "Tomato") — reuse the sci-name slot
    const sciNameEl = resultsContainer.querySelector('.sci-name');
    if (sciNameEl) sciNameEl.textContent = data.crop ? `Crop: ${data.crop}` : '';

    // Confidence
    const confidencePercent = typeof data.confidence === 'number'
      ? Math.round(data.confidence * 100)
      : null;
    const scoreValEl = resultsContainer.querySelector('.score-val');
    const scoreFillEl = resultsContainer.querySelector('.progress-bar-fill');
    if (scoreValEl) scoreValEl.textContent = confidencePercent === null ? '--' : `${confidencePercent}%`;
    if (scoreFillEl) scoreFillEl.style.width = `${confidencePercent ?? 0}%`;

    // "About Disease" — the API doesn't return a description, so fall back
    // to severity as the closest available info until the backend adds one
    const aboutEl = resultsContainer.querySelectorAll('.result-info-section')[0]?.querySelector('p');
    if (aboutEl) {
      aboutEl.textContent = isHealthy
        ? 'No disease detected on this leaf.'
        : `Severity: ${data.severity ?? 'Unknown'}`;
    }

    // Remedy / recommended action — API returns a single string, not a list.
    // Render it as a single list item; hide the section for healthy leaves.
    const remedySection = resultsContainer.querySelectorAll('.result-info-section')[1];
    if (remedySection) {
      const heading = remedySection.querySelector('h4');
      const list = remedySection.querySelector('ul');
      if (heading) heading.textContent = 'Recommended Action';
      if (list) {
        list.innerHTML = '';
        if (!isHealthy && data.remedy) {
          const li = document.createElement('li');
          li.textContent = data.remedy;
          list.appendChild(li);
        }
      }
      remedySection.style.display = isHealthy ? 'none' : 'block';
    }

    // Prevention section — no data from API yet; hide until backend supports it
    const preventionSection = resultsContainer.querySelectorAll('.result-info-section')[2];
    if (preventionSection) {
      preventionSection.style.display = 'none';
    }
  }
}
// ==========================================================================
// 5. CROP RECOMMENDATION
// ==========================================================================
function initCropRecommendation() {
  const form = document.getElementById('crop-rec-form');


  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nitrogen: parseInt(document.getElementById('nitrogen').value),
        phosphorus: parseInt(document.getElementById('phosphorus').value),
        potassium: parseInt(document.getElementById('potassium').value),
        temperature: parseInt(document.getElementById('temperature').value),
        humidity: parseInt(document.getElementById('humidity').value),
        ph: parseFloat(document.getElementById('ph').value),
        rainfall: parseInt(document.getElementById('rainfall').value)
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Computing Suitability... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE_URL}/agronomy/crop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send secure token
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            if(response.status === 403) {
                alert("Session expired. Please log in again.");
                window.location.href = 'login.html';
                return;
            }
            throw new Error("Failed to get recommendation");
        }

        const data = await response.json();

        const confidencePercent = typeof data.confidence === 'number'
          ? Math.round(data.confidence * 100)
          : null;
        document.getElementById('recommended-crop-name').textContent = data.recommendedCrop;
        document.getElementById('crop-suit-val').textContent = confidencePercent === null ? '--' : `${confidencePercent}%`;
        document.getElementById('crop-suit-bar').style.width = `${confidencePercent ?? 0}%`;
document.getElementById('crop-profit-val').textContent = data.estimatedProfit ?? '--';

const tipsList = document.getElementById('crop-tips-list');
tipsList.innerHTML = '';
(data.growingTips || []).forEach(tip => {
  const li = document.createElement('li');
  li.textContent = tip;
  tipsList.appendChild(li);
});
        document.getElementById('crop-empty-state').style.display = 'none';
        document.getElementById('crop-result-card').style.display = 'block';
        showToast('New crop recommendation calculated!');

    } catch (error) {
        console.error(error);
        showToast('Error connecting to the ML engine.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Get Recommendation <i class="fas fa-circle-check"></i>';
    }
  });
}



// ==========================================================================
// FERTILIZER RECOMMENDATION
// ==========================================================================
// ==========================================================================
// FERTILIZER RECOMMENDATION
// ==========================================================================

function initFertilizerRecommendation() {

    const form = document.getElementById('fertilizer-form');

    const emptyState =
        document.getElementById('fert-empty-state');

    const resultCard =
        document.getElementById('fert-result-card');

    const fertRecName =
        document.getElementById('fert-rec-name');

    const fertApplication =
        document.getElementById('fert-application-val');

    const fertTime =
        document.getElementById('fert-time-val');

    const fertPrecautions =
        document.getElementById('fert-precautions-val');


    if (!form) {
        console.error('Fertilizer form not found.');
        return;
    }


    form.addEventListener('submit', async (e) => {

        e.preventDefault();


        // ==============================================================
        // Read form values
        // ==============================================================

        const crop =
            document.getElementById('fert-crop').value;

        const soil =
            document.getElementById('fert-soil').value;

        const nitrogen =
            parseFloat(
                document.getElementById('fert-n').value
            );

        const phosphorus =
            parseFloat(
                document.getElementById('fert-p').value
            );

        const potassium =
            parseFloat(
                document.getElementById('fert-k').value
            );

        const temperature =
            parseFloat(
                document.getElementById('fert-temperature').value
            );

        const humidity =
            parseFloat(
                document.getElementById('fert-humidity').value
            );

        const moisture =
            parseFloat(
                document.getElementById('fert-moisture').value
            );


        // ==============================================================
        // Validate
        // ==============================================================

        if (
            !crop ||
            !soil ||
            Number.isNaN(nitrogen) ||
            Number.isNaN(phosphorus) ||
            Number.isNaN(potassium) ||
            Number.isNaN(temperature) ||
            Number.isNaN(humidity) ||
            Number.isNaN(moisture)
        ) {

            showToast(
                'Please fill in all fertilizer fields.'
            );

            return;
        }


        if (humidity < 0 || humidity > 100) {

            showToast(
                'Humidity must be between 0 and 100%.'
            );

            return;
        }


        if (moisture < 0 || moisture > 100) {

            showToast(
                'Soil moisture must be between 0 and 100%.'
            );

            return;
        }


        // ==============================================================
        // JWT
        // ==============================================================

        const token =
            localStorage.getItem('jwt_token');


        if (!token) {

            localStorage.removeItem('jwt_token');

            window.location.replace('login.html');

            return;
        }


        // ==============================================================
        // Build payload
        // ==============================================================

        const payload = {

            temperature: temperature,

            humidity: humidity,

            moisture: moisture,

            Soil_type: soil,

            Crop_type: crop,

            nitrogen: nitrogen,

            phosphorus: phosphorus,

            potassium: potassium

        };


        console.log(
            'Fertilizer Request:',
            payload
        );


        // ==============================================================
        // Button loading
        // ==============================================================

        const submitBtn =
            form.querySelector(
                'button[type="submit"]'
            );

        const originalText =
            submitBtn.innerHTML;

        submitBtn.disabled = true;

        submitBtn.innerHTML =
            'Calculating... <i class="fas fa-spinner fa-spin"></i>';


        try {

            // ==========================================================
            // Call Spring Boot backend
            // ==========================================================

            const response = await fetch(
                `${API_BASE_URL}/fertilizer/predict`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    },

                    body: JSON.stringify(payload)
                }
            );


            // ==========================================================
            // Authentication
            // ==========================================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    'jwt_token'
                );

                alert(
                    'Session expired. Please login again.'
                );

                window.location.replace(
                    'login.html'
                );

                return;
            }


            // ==========================================================
            // Error response
            // ==========================================================

            if (!response.ok) {

                const errorBody =
                    await response
                        .json()
                        .catch(() => null);

                console.error(
                    'Fertilizer API Error:',
                    errorBody
                );

                throw new Error(
                    errorBody?.message ||
                    errorBody?.detail ||
                    `Fertilizer prediction failed (${response.status})`
                );
            }


            // ==========================================================
            // Read response
            // ==========================================================

            const data =
                await response.json();


            console.log(
                'Fertilizer Response:',
                data
            );


            // ==========================================================
            // Recommended fertilizer
            // ==============================================================

            fertRecName.textContent =
                data.recommendedFertilizer ||
                data.recommended_fertilizer ||
                'Not available';


            // ==========================================================
            // AI guidance
            // ==============================================================

            fertApplication.textContent =
                data.application ||
                'No application guidance available.';

            fertTime.textContent =
                data.bestTime ||
                'No timing guidance available.';

            fertPrecautions.textContent =
                data.precautions ||
                'No precaution guidance available.';


            // ==========================================================
            // Show result
            // ==============================================================

            if (emptyState) {
                emptyState.style.display = 'none';
            }

            if (resultCard) {
                resultCard.style.display = 'block';
            }


            // ==========================================================
            // History
            // ==============================================================

            if (
                typeof addHistoryLog === 'function'
            ) {

                addHistoryLog(
                    new Date().toLocaleString('en-IN'),
                    'Fertilizer Recommendation',
                    `Crop: ${crop}, Soil: ${soil}`,
                    data.recommendedFertilizer ||
                    data.recommended_fertilizer ||
                    'Recommendation generated'
                );

            }


            showToast(
                'Fertilizer recommendation generated successfully!'
            );

        }

        catch (error) {

            console.error(
                'Fertilizer recommendation error:',
                error
            );

            showToast(
                error.message ||
                'Error connecting to fertilizer service.'
            );

        }

        finally {

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                originalText;

        }

    });
}
// ==========================================================================
// 7. AI FARMING ASSISTANT (Connected to Gemini AI)
// ==========================================================================
function initAiAssistant() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!input || !sendBtn) return;

  sendBtn.addEventListener('click', () => {
    sendMessage();
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  // Add user bubble to UI
  appendChatBubble(text, 'user');
  input.value = '';

  // Add temporary loading bubble for the bot
  const loadingId = 'loading-' + Date.now();
  appendChatBubble('<i class="fas fa-ellipsis-h fa-fade"></i> Thinking...', 'bot', loadingId);

  const token = localStorage.getItem('jwt_token');

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) {
        if(response.status === 403 || response.status === 401) {
            alert("Session expired. Please log in again.");
            window.location.href = 'login.html';
            return;
        }
        throw new Error("Failed to reach AI server");
    }

    const data = await response.json();

    // Remove loading bubble and add actual response
    removeChatBubble(loadingId);
    appendChatBubble(data.reply, 'bot');

    // Instantly update the history table UI
    if (typeof addHistoryLog === 'function') {
      addHistoryLog(
        new Date().toLocaleString('en-IN'),
        'AI Assistant',
        text.length > 30 ? text.substring(0, 27) + '...' : text,
        'Answered via AI'
      );
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    removeChatBubble(loadingId);
    appendChatBubble('Sorry, I am having trouble connecting to the network right now. Please try again later.', 'bot');
  }
}

function appendChatBubble(text, sender, id = null) {
  const messagesContainer = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  if (id) bubble.id = id;

  bubble.innerHTML = `
    <div class="bubble-content">
      <p>${text}</p>
    </div>
  `;
  messagesContainer.appendChild(bubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeChatBubble(id) {
  const bubble = document.getElementById(id);
  if (bubble) bubble.remove();
}

// Quick prompts remain the same
function sendQuickPrompt(promptText) {
  const input = document.getElementById('chat-input');
  input.value = promptText;
  sendMessage();
}
// ==========================================================================
// 8. YIELD PREDICTION (Connected to Backend)
// ==========================================================================
function initYieldPrediction() {
  const form = document.getElementById('yield-form');
  const yieldResultVal = document.getElementById('predicted-yield-val');
  const yieldTotalVal = document.getElementById('predicted-total-val');
  const emptyState = document.getElementById('yield-empty-state');
  const resultCard = document.getElementById('yield-result-card');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();


      const payload = {
        crop: document.getElementById('yield-crop').value,
        area: parseFloat(document.getElementById('yield-area').value),
        fertilizer_used: parseFloat(document.getElementById('yield-fertilizer').value),
        rainfall: parseFloat(document.getElementById('yield-rainfall').value),
        soil_quality: document.getElementById('yield-soil').value   // ← confirm this id matches your HTML
      };


    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Predicting Yield... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    try {
      // Inside your initYieldPrediction form submit listener:
      const response = await fetch(`${API_BASE_URL}/agronomy/yield`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if(response.status === 403 || response.status === 401) {
          alert("Session expired. Please log in again.");
          window.location.href = 'login.html';
          return;
        }
        throw new Error("Failed to predict yield");
      }

      const data = await response.json();

      yieldResultVal.textContent = typeof data.predictedYieldTonnes === 'number'
        ? `${data.predictedYieldTonnes.toFixed(1)} qtl/acre`
        : '--';
      yieldTotalVal.textContent = typeof data.totalYield === 'number'
        ? `${data.totalYield.toFixed(1)} quintals`
        : '--';

      if (typeof data.modelAccuracy === 'number') {
        document.getElementById('accuracy_predicted').textContent = `${(data.modelAccuracy * 100).toFixed(1)}% accuracy`;
      }

      if (emptyState) emptyState.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';

      if (typeof addHistoryLog === 'function') {
      addHistoryLog(
          new Date().toLocaleString('en-IN'),
          'Yield Rec.',
          `Crop: ${payload.crop}, Area: ${payload.area} ac`,
          `Estimated: ${data.predictedYieldTonnes} t/ha`
      );
      }

      showToast('Yield prediction updated successfully!');

    } catch (error) {
      console.error(error);
      showToast('Error connecting to prediction server.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// ==========================================================================
// 9. MARKET ANALYSIS (Connected to data.gov.in & Spring AI)
// ==========================================================================
function initMarketAnalysis() {
  const form = document.getElementById('market-form');
  const emptyState = document.getElementById('market-empty-state');
  const resultCard = document.getElementById('market-result-card');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const crop = document.getElementById('market-crop').value.trim();
    const state = document.getElementById('market-state').value.trim();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Fetching Live Data... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    try {
      // Build URL with Query Parameters for GET request
      const url = new URL(`${API_BASE_URL}/market/prices`);
      url.searchParams.append('crop', crop);
      if (state) url.searchParams.append('state', state);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

            if (!response.ok) {
              const errBody = await response.json().catch(() => null);
              throw new Error(errBody?.message || "No live market data available for this crop/state today.");
            }

      const data = await response.json();

      // Update the UI
      document.getElementById('market-crop-name').textContent = `${data.crop} - ${data.marketLocation}`;
      document.getElementById('market-modal-price').textContent = `₹ ${data.modalPrice} / quintal`;
      document.getElementById('market-min-price').textContent = `₹ ${data.minPrice}`;
      document.getElementById('market-max-price').textContent = `₹ ${data.maxPrice}`;
      document.getElementById('market-ai-advice').textContent = data.aiSellingAdvice;

      emptyState.style.display = 'none';
      resultCard.style.display = 'block';

      // Push to frontend history table
      if (typeof addHistoryLog === 'function') {
        addHistoryLog(
          new Date().toLocaleString('en-IN'),
          'Market Analysis',
          `Crop: ${data.crop}, State: ${data.state}`,
          `Price: ₹${data.modalPrice}/qtl`
        );
      }

      showToast('Live market data and AI advice retrieved!');

    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error connecting to the market database.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}



//FARMER PROFILE//////
async function loadUserProfile() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to load profile");

    const profile = await response.json();

    // 1. Update the Navbar Name[cite: 2]
    const topBarName = document.querySelector('.user-name');
    if (topBarName) topBarName.textContent = profile.farmerName;

    // 2. Update the Navbar Location[cite: 2]
    const topBarLocation = document.querySelector('.location-badge span');
    if (topBarLocation) topBarLocation.textContent = profile.location;

    // 3. Update the Navbar Profile Photo[cite: 2]
    const topBarAvatar = document.querySelector('.user-avatar');
    if (topBarAvatar) {
      // Use the DB photo if it exists, otherwise fallback to a default placeholder avatar
      topBarAvatar.src = profile.photoUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }

    // 4. Update Profile Page Header[cite: 2]
    const profileHeader = document.querySelector('#my-profile h2');
    if (profileHeader) profileHeader.textContent = profile.farmerName;

    // 5. Update Profile Page Avatar[cite: 2]
    const profilePageAvatar = document.querySelector('.profile-avatar-large img');
    if (profilePageAvatar) {
      profilePageAvatar.src = profile.photoUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }

    // 6. Update the Profile Details Grid[cite: 2]
    const detailValues = document.querySelectorAll('#my-profile .detail-value');
    if (detailValues.length >= 6) {
      detailValues[0].textContent = profile.farmerId;
      detailValues[1].textContent = profile.location;
      detailValues[2].textContent = `${profile.totalLandArea} Acres`;
      detailValues[3].textContent = profile.soilType;
      detailValues[4].textContent = profile.primaryCrop;
      detailValues[5].textContent = profile.irrigationSource;
    }

  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}
//WEATHER
async function loadLiveWeather() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;

  // Grab the city dynamically from your HTML input field ID
  const cityInput = document.getElementById('weather-city-input');
  const city = cityInput ? cityInput.value.trim() : '';

  // No hardcoded default city — if the farmer hasn't entered one yet
  // (and their profile location isn't wired in here), skip the call
  // rather than silently guessing a location.
  if (!city) return;

  try {
    const url = new URL(`${API_BASE_URL}/weather/summary`);
    url.searchParams.append('city', city);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to fetch weather data");

    const data = await response.json();

    const tempElement = document.querySelector('.weather-card .temp-big') || document.querySelector('.weather-temp-mini');
    const descElement = document.querySelector('.weather-card .weather-desc');
    const metricsElements = document.querySelectorAll('.weather-card .weather-metrics strong');

    if (tempElement) tempElement.textContent = data.temperature;
    if (descElement) descElement.textContent = data.condition;

    if (metricsElements.length >= 3) {
      metricsElements[0].textContent = data.humidity;
      metricsElements[1].textContent = data.wind;
      metricsElements[2].textContent = data.rain;
    }

  } catch (error) {
    console.error('Weather sync error:', error);
  }
}
//Dashboard
async function loadDashboardSummary() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to load dashboard summary");

    const data = await response.json();

    // 1. Update Weather Card
    if (data.weather) {
      const tempElement = document.querySelector('.weather-card .temp-big');
      const descElement = document.querySelector('.weather-card .weather-desc');
      const metrics = document.querySelectorAll('.weather-card .weather-metrics strong');

      if (tempElement) tempElement.textContent = data.weather.temperature;
      if (descElement) descElement.textContent = data.weather.condition;
      if (metrics.length >= 3) {
        metrics[0].textContent = data.weather.humidity;
        metrics[1].textContent = data.weather.wind;
        metrics[2].textContent = data.weather.rain;
      }
    }

    // 2. Update Soil Status Card
    if (data.soilStatus) {
      const soilStatusEl = document.querySelector('.soil-status-text');
      const moistureEl = document.querySelector('.soil-moisture-text');
      if (soilStatusEl) soilStatusEl.textContent = data.soilStatus.overallStatus;
      if (moistureEl) moistureEl.textContent = data.soilStatus.moisture;
    }

    // 3. Update Advice & Alerts
    if (data.adviceAndAlerts) {
      const adviceEl = document.querySelector('.todays-advice-text');
      const alertsEl = document.querySelector('.disease-alert-count');
      if (adviceEl) adviceEl.textContent = data.adviceAndAlerts.todaysAdvice;
      if (alertsEl) alertsEl.textContent = data.adviceAndAlerts.activeDiseaseAlerts;
    }

    // 4. Update Recent Activity List
    if (data.recentActivity && Array.isArray(data.recentActivity)) {
      const activityContainer = document.querySelector('.dashboard-activity-list');
      if (activityContainer) {
        activityContainer.innerHTML = '';
        data.recentActivity.forEach(act => {
          const item = document.createElement('div');
          item.className = 'activity-item';
          item.innerHTML = `
            <div>
              <strong>${act.activityType}</strong>
              <p>${act.details}</p>
            </div>
            <span class="activity-date">${new Date(act.date).toLocaleDateString()}</span>
          `;
          activityContainer.appendChild(item);
        });
      }
    }

  } catch (error) {
    console.error('Dashboard sync error:', error);
  }
}

//5 Day Forecast
async function loadFiveDayForecast() {
  const token = localStorage.getItem('jwt_token');
  const cityInput = document.getElementById('weather-city-input');
  const city = cityInput ? cityInput.value.trim() : '';

  if (!token || !city) return;

  try {
    const response = await fetch(`${API_BASE_URL}/weather/forecast?city=${city}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Failed to fetch forecast");

    // Expecting the backend to return an array of 5 objects
    const forecastList = await response.json();
    const container = document.getElementById('forecast-container');

    if (!container) return;
    container.innerHTML = '';

    // Loop through each day and create a mini card
    forecastList.forEach(day => {
      const card = document.createElement('div');
      card.className = 'forecast-card'; // Add your CSS styling here
      card.innerHTML = `
        <p style="font-weight: bold;">${day.date}</p>
        <p>${day.condition}</p>
        <p>${day.temperature}</p>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Forecast sync error:', error);
  }
}