// ==========================================================================
// KRISHISANCHAR APPLICATION LOGIC (app.js)
// ==========================================================================

// Single source of truth for the backend origin — change this (or wire it
// to a build-time env var) instead of editing every fetch() call below.
const API_BASE_URL = 'http://localhost:8080/api/v1';

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
// 1. NAVIGATION & PAGE VIEW SWITCHING
// ==========================================================================
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const panels = document.querySelectorAll('.dashboard-panel');
  const pageTitle = document.getElementById('current-page-title');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Ignore logout click since it has inline handler
      if (item.classList.contains('logout-item')) return;
      
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      
      // Update sidebar active class
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Update active panel with transition
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetId) {
          panel.classList.add('active');
          // Update header title
          pageTitle.textContent = item.querySelector('span').textContent;
        }
      });

      // Close sidebar on mobile after clicking
      const sidebar = document.querySelector('.sidebar');
      if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
  });
}

// Enter Dashboard View
function enterDashboard() {
  const landingPage = document.getElementById('landing-page');
  const dashboardPage = document.getElementById('dashboard-page');
  
  landingPage.classList.remove('active');
  dashboardPage.classList.add('active');
  
  // Set default tab (Overview)
  switchDashboardTab('dashboard-overview');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Exit Dashboard View (Logout)
function exitDashboard() {
  const landingPage = document.getElementById('landing-page');
  const dashboardPage = document.getElementById('dashboard-page');
  
  dashboardPage.classList.remove('active');
  landingPage.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Switch tabs dynamically from links inside cards
function switchDashboardTab(targetTabId) {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const panels = document.querySelectorAll('.dashboard-panel');
  const pageTitle = document.getElementById('current-page-title');

  // Find corresponding nav item
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-target') === targetTabId) {
      item.classList.add('active');
      pageTitle.textContent = item.querySelector('span').textContent;
    }
  });

  // Switch panels
  panels.forEach(panel => {
    panel.classList.remove('active');
    if (panel.id === targetTabId) {
      panel.classList.add('active');
    }
  });
}

// Shortcut to open dashboard to specific tab
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

  // Handle file selection (Click or Drag & Drop)
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

  // Remove Image
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

  // Call Backend API
  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = 'Scanning leaf... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // NOTE: Do NOT set 'Content-Type' header when sending FormData
      const response = await fetch(`${API_BASE_URL}/agronomy/disease`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Failed to analyze image");

      const data = await response.json();

      // Update UI with actual ML response (Update DOM IDs based on your HTML)
      document.querySelector('#detection-results h3').textContent = data.disease;
      document.querySelector('.score-val').textContent = `${data.confidence ?? '--'}%`;
      document.querySelector('.progress-bar-fill').style.width = `${data.confidence ?? 0}%`;

      emptyState.style.display = 'none';
      resultsContainer.style.display = 'block';
      showToast('Diagnosis completed successfully!');

      // Instantly update History Table
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
      showToast('Error connecting to ML engine.');
    } finally {
      analyzeBtn.innerHTML = 'Scan Leaf for Diseases <i class="fas fa-qrcode"></i>';
      analyzeBtn.disabled = false;
    }
  });
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

        // backend returns { recommendedCrop: "Wheat", score: "92%" }
        document.getElementById('recommended-crop-name').textContent = data.recommendedCrop;
        document.getElementById('crop-suit-val').textContent = data.score ?? '--';

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
// 6. FERTILIZER RECOMMENDATION (Connected to Backend)
// ==========================================================================
function initFertilizerRecommendation() {
  const form = document.getElementById('fertilizer-form');
  const emptyState = document.getElementById('fert-empty-state');
  const resultCard = document.getElementById('fert-result-card');

  const fertRecName = document.getElementById('fert-rec-name');
  const fertUreaVal = document.getElementById('fert-urea-val');
  const fertDapVal = document.getElementById('fert-dap-val');
  const fertMopVal = document.getElementById('fert-mop-val');
  const fertScheduleList = document.getElementById('fert-schedule-list');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Gather form data matching your Java DTO
    const payload = {
      cropType: document.getElementById('fert-crop').value,
      soilType: document.getElementById('fert-soil').value,
      nitrogen: parseInt(document.getElementById('fert-n').value),
      phosphorus: parseInt(document.getElementById('fert-p').value),
      potassium: parseInt(document.getElementById('fert-k').value)
    };

    // 2. Set Loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Calculating Nutrients... <i class="fas fa-spinner fa-spin"></i>';

    const token = localStorage.getItem('jwt_token');

    try {
      // 3. Call the secure Spring Boot API
      const response = await fetch(`${API_BASE_URL}/fertilizer/predict`, {
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
        throw new Error("Failed to calculate fertilizer");
      }

      const data = await response.json();

      // 4. Update the UI with real ML data
      fertRecName.textContent = data.recommendedFertilizer || 'N/A';
      fertUreaVal.textContent = `${data.urea ?? 0} kg`;
      fertDapVal.textContent = `${data.dap ?? 0} kg`;
      fertMopVal.textContent = `${data.mop ?? 0} kg`;

      // Update schedule list from the backend response only — no canned fallback text
      fertScheduleList.innerHTML = '';
      const schedule = Array.isArray(data.schedule) ? data.schedule : [];

      if (schedule.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No application schedule provided.';
        fertScheduleList.appendChild(li);
      } else {
        schedule.forEach(step => {
          const li = document.createElement('li');
          li.textContent = step;
          fertScheduleList.appendChild(li);
        });
      }

      emptyState.style.display = 'none';
      resultCard.style.display = 'block';

      showToast('Fertilizer recommendations calculated successfully!');

    } catch (error) {
      console.error(error);
      showToast('Error connecting to the ML engine.');
    } finally {
      // 5. Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
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
      fertilizer: parseFloat(document.getElementById('yield-fertilizer').value),
      soil: document.getElementById('yield-soil').value,
      rainfall: parseFloat(document.getElementById('yield-rainfall').value)
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

      yieldResultVal.textContent = typeof data.yieldPerAcre === 'number'
        ? `${data.yieldPerAcre.toFixed(1)} Quintals / acre`
        : '--';
      yieldTotalVal.textContent = typeof data.totalYield === 'number'
        ? `${data.totalYield.toFixed(0)} Quintals`
        : '--';

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
        throw new Error("No live market data available for this crop/state today.");
      }

      const data = await response.json();

      // Update the UI
      document.getElementById('market-crop-name').textContent = `${data.crop} - ${data.state}`;
      document.getElementById('market-modal-price').textContent = `₹ ${data.modalPrice} / quintal`;
      document.getElementById('market-min-price').textContent = `₹ ${data.minPrice}`;
      document.getElementById('market-max-price').textContent = `₹ ${data.maxPrice}`;
      document.getElementById('market-ai-advice').textContent = data.aiAdvice;

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

