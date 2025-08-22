// Initialize Supabase client
// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://xisjmezkrlgypowqjsrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc2ptZXprcmxneXBvd3Fqc3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODg4NDMsImV4cCI6MjA3MTQ2NDg0M30.bFOcBDutezHI09MoDIDjYjZsaVc5U31FGKWks2JarEU';

let supabase;

// Initialize Supabase when the page loads
window.addEventListener('load', () => {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized');
        checkCurrentUser();
    } else {
        console.error('Supabase library not loaded. Make sure to include the CDN script.');
    }
});

// Get DOM elements
const wrapper = document.querySelector('.wrapper');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const signInBtnLink = document.querySelector('.signInBtn-link');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');

// Toggle between sign in and sign up
signUpBtnLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.add('active');
});

signInBtnLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.remove('active');
});

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value.trim();
    const password = loginForm.querySelector('input[name="password"]').value;
    const remember = loginForm.querySelector('input[name="remember"]').checked;
    const submitBtn = loginForm.querySelector('.btn');

    // Basic validation
    if (!email || !password) {
        showMessage('Email and password are required', 'error');
        return;
    }

    if (!supabase) {
        showMessage('Database not initialized. Please check your Supabase configuration.', 'error');
        return;
    }

    // Show loading state
    submitBtn.textContent = 'Logging in...';
    submitBtn.classList.add('loading');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            showMessage('Invalid email or password', 'error');
            return;
        }

        if (data.user) {
            showMessage('Login successful!', 'success');
            loginForm.reset();

            setTimeout(() => {
                const username = data.user.user_metadata?.username || data.user.email.split('@')[0];
                showMessage(`Welcome back, ${username}!`, 'success');
                updateUIForLoggedInUser(data.user);
            }, 1000);
        }

    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = 'Login';
        submitBtn.classList.remove('loading');
    }
});

// Handle signup form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = signupForm.querySelector('input[name="username"]').value.trim();
    const email = signupForm.querySelector('input[name="email"]').value.trim();
    const password = signupForm.querySelector('input[name="password"]').value;
    const termsAccepted = signupForm.querySelector('input[name="terms"]').checked;
    const submitBtn = signupForm.querySelector('.btn');

    // Basic validation
    if (!username || !email || !password) {
        showMessage('All fields are required', 'error');
        return;
    }

    if (!termsAccepted) {
        showMessage('Please accept the terms and conditions', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    if (!supabase) {
        showMessage('Database not initialized. Please check your Supabase configuration.', 'error');
        return;
    }

    // Show loading state
    submitBtn.textContent = 'Creating Account...';
    submitBtn.classList.add('loading');

    try {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                showMessage('Email already registered', 'error');
            } else {
                showMessage(error.message, 'error');
            }
            return;
        }

        if (data.user) {
            // Check if email confirmation is required
            if (data.user.email_confirmed_at) {
                showMessage('Registration successful! You are now logged in.', 'success');
                signupForm.reset();
                setTimeout(() => {
                    wrapper.classList.remove('active');
                    updateUIForLoggedInUser(data.user);
                }, 1500);
            } else {
                showMessage('Registration successful! Please check your email to confirm your account.', 'success');
                signupForm.reset();
                setTimeout(() => {
                    wrapper.classList.remove('active');
                }, 1500);
            }
        }

    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = 'Sign Up';
        submitBtn.classList.remove('loading');
    }
});

// Check if user is already logged in
async function checkCurrentUser() {
    if (!supabase) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            console.log('User is logged in:', user.user_metadata?.username || user.email);
            updateUIForLoggedInUser(user);
        }
    } catch (error) {
        console.error('Error checking current user:', error);
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
    // Hide the login/register forms
    wrapper.style.display = 'none';

    // Create a welcome screen with the same glassmorphism style
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-screen';
    welcomeDiv.innerHTML = `
        <div class="wrapper" style="height: auto; position: static;">
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="margin-bottom: 20px;">Welcome!</h1>
                <div class="input-box" style="border: none; background: rgba(255, 255, 255, 0.1); border-radius: 10px; height: auto; padding: 20px; margin: 20px 0;">
                    <p style="margin-bottom: 10px; font-size: 18px;">Hello, <strong>${user.user_metadata?.username || user.email.split('@')[0]}</strong></p>
                    <p style="opacity: 0.8; font-size: 14px;">${user.email}</p>
                </div>
                <button onclick="logout()" class="btn" style="margin-top: 20px;">
                    <i class='bx bx-log-out' style="margin-right: 8px;"></i>
                    Logout
                </button>
                <div style="margin-top: 15px; font-size: 14px; opacity: 0.7;">
                    <i class='bx bx-check-circle' style="margin-right: 5px; color: #4ade80;"></i>
                    Successfully authenticated
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(welcomeDiv);
}

// Logout function
async function logout() {
    if (!supabase) return;

    const logoutBtn = document.querySelector('.welcome-screen .btn');
    if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Logging out...';
        logoutBtn.classList.add('loading');
    }

    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            showMessage('Logout failed', 'error');
            return;
        }

        showMessage('Logged out successfully', 'success');

        // Remove welcome screen and show forms again
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        wrapper.style.display = 'block';
        wrapper.classList.remove('active');

    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed', 'error');
    }
}

// Make logout function globally available
window.logout = logout;

// Function to show messages
function showMessage(message, type) {
    // Remove existing message if any
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check-circle' : 'bx-error-circle'}'></i>
        <span>${message}</span>
    `;

    // Add styles
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideDown 0.3s ease-out;
        ${type === 'success' ?
            'background: linear-gradient(135deg, rgba(74, 222, 128, 0.9), rgba(34, 197, 94, 0.9));' :
            'background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));'
        }
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#message-animations')) {
        const style = document.createElement('style');
        style.id = 'message-animations';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 4 seconds with fade out
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 4000);
}