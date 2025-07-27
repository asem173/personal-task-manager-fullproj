$(document).ready(function () {
    // Function to show a specific form and hide others
    function showForm(formToShow) {
        // Hide all forms
        $('#loginForm, #registerForm, #forgotPasswordForm').hide();

        // Show the specified form
        $(formToShow).show();
    }

    // Event listeners for form switching
    $('#showRegister').on('click', function (e) {
        e.preventDefault();
        showForm('#registerForm');
    });

    $('#showLogin').on('click', function (e) {
        e.preventDefault();
        showForm('#loginForm');
    });

    $('#showForgotPassword').on('click', function (e) {
        e.preventDefault();
        showForm('#forgotPasswordForm');
    });

    $('#showLoginFromForgot').on('click', function (e) {
        e.preventDefault();
        showForm('#loginForm');
    });

    // Password visibility toggles
    function setupPasswordToggle(toggleButtonId, passwordInputId) {
        $('#' + toggleButtonId).on('click', function () {
            const $passwordInput = $('#' + passwordInputId);
            const $icon = $(this).find('i');

            if ($passwordInput.attr('type') === 'password') {
                $passwordInput.attr('type', 'text');
                $icon.removeClass('bi-eye').addClass('bi-eye-slash');
            } else {
                $passwordInput.attr('type', 'password');
                $icon.removeClass('bi-eye-slash').addClass('bi-eye');
            }
        });
    }

    // Setup all password toggles
    setupPasswordToggle('togglePassword', 'password');
    setupPasswordToggle('toggleRegPassword', 'regPassword');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

    // Form submission handlers (for future API integration)
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');

        console.log('Login attempt:', { email, password, rememberMe });
        // TODO: Add API call to backend for login
        // For now, just log the data
    });

    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        const name = $('#regName').val();
        const email = $('#regEmail').val();
        const password = $('#regPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        // Basic validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        console.log('Registration attempt:', { name, email, password });
        // TODO: Add API call to backend for registration
        // For now, just log the data
    });

    $('#forgotPasswordForm').on('submit', function (e) {
        e.preventDefault();

        const email = $('#resetEmail').val();

        console.log('Password reset request:', { email });
        // TODO: Add API call to backend for password reset
        // For now, just log the data and show success message
        alert('If an account with this email exists, you will receive password reset instructions.');
        showForm('#loginForm');
    });
}); 