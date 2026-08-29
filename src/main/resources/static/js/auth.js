const API_BASE_URL = 'http://localhost:8080/api/v1';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Logging in... <i class="fas fa-spinner fa-spin"></i>';

            const payload = {
                userId: document.getElementById('userId').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || "Invalid credentials");
                }

                const data = await response.json();
                localStorage.setItem('jwt_token', data.token); // Save Token
                window.location.href = 'index.html'; // Redirect to dashboard

            } catch (error) {
                alert(error.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Creating Account... <i class="fas fa-spinner fa-spin"></i>';

            // Match payload keys to your FarmerProfile JPA Entity[cite: 4]
            const payload = {
                farmerName: document.getElementById('fullName').value,
                userId: document.getElementById('userId').value,
                password: password,
                location: document.getElementById('location').value,
                totalLandArea: parseFloat(document.getElementById('landArea').value),
                primaryCrop: document.getElementById('primaryCrop').value,
                soilType: document.getElementById('soilType').value,
                irrigationSource: document.getElementById('irrigationSource').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || "Signup failed");
                }

                const data = await response.json();
                localStorage.setItem('jwt_token', data.token);
                window.location.href = 'index.html';

            } catch (error) {
                alert(error.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});