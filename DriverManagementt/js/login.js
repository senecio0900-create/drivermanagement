
(function() {
    'use strict';

    // ========================================
    // LOGIN FUNCTIONALITY
    // ========================================
    
    // Static demo account
    const DEMO_CREDENTIALS = {
        email: 'driver@gmail.com',
        password: 'pass1010'
    };

    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validate credentials
        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
            console.log('✅ Login successful!');
            
            // Store login session (optional)
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid email or password!\n\nDemo Account:\nEmail: driver@gmail.com\nPassword: pass1010');
            console.log('❌ Login failed - Invalid credentials');
        }
    });

    // Check if already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        console.log('User already logged in, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    }

    // ========================================
    // FORGOT PASSWORD MODAL FUNCTIONS
    // ========================================
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const backToLogin = document.getElementById('backToLogin');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotFormSection = document.getElementById('forgotFormSection');
    const resetSuccessSection = document.getElementById('resetSuccessSection');
    const backToLoginFromSuccess = document.getElementById('backToLoginFromSuccess');
    const resetBtn = document.getElementById('resetBtn');
    const btnText = resetBtn.querySelector('.btn-text');
    const btnLoader = resetBtn.querySelector('.btn-loader');

    // Open Forgot Password Modal
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    // Close Modal Function
    function closeForgotPasswordModal() {
        forgotPasswordModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset form and sections after animation
        setTimeout(() => {
            forgotFormSection.style.display = 'block';
            resetSuccessSection.style.display = 'none';
            forgotPasswordForm.reset();
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            resetBtn.disabled = false;
        }, 300);
    }

    // Close Modal Events
    closeForgotModal.addEventListener('click', closeForgotPasswordModal);
    backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        closeForgotPasswordModal();
    });
    backToLoginFromSuccess.addEventListener('click', closeForgotPasswordModal);

    // Close modal when clicking overlay
    document.querySelector('.forgot-modal-overlay').addEventListener('click', closeForgotPasswordModal);

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && forgotPasswordModal.classList.contains('show')) {
            closeForgotPasswordModal();
        }
    });

    // Handle Forgot Password Form Submission
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const resetEmail = document.getElementById('resetEmail').value.trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetEmail)) {
            alert('Please enter a valid email address');
            return;
        }

        // Show loading state
        resetBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        try {
            // Simulate API call (replace with actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('📧 Password reset link sent to:', resetEmail);
            
            // Display success message
            document.getElementById('resetEmailDisplay').textContent = resetEmail;
            forgotFormSection.style.display = 'none';
            resetSuccessSection.style.display = 'block';
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Failed to send reset email. Please try again.');
            
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            resetBtn.disabled = false;
        }
    });

})();
