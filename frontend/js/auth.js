$(document).ready(function () {
    // Function to show a specific form and hide others
    function showForm(formToShow) {
        // Hide all forms
        $('#loginForm, #registerForm, #forgotPasswordForm, #resetPasswordForm').hide();

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

    $('#showLoginFromReset').on('click', function (e) {
        e.preventDefault();
        showForm('#loginForm');
    });

    $('#showResetPassword').on('click', function (e) {
        e.preventDefault();
        showForm('#resetPasswordForm');
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
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmNewPassword', 'confirmNewPassword');

    // Form submission handlers (for future API integration)
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#email').val();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');

        // Show loading state
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.text();
        $submitBtn.text('Logging in...').prop('disabled', true);

        // Make API call to backend
        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Login successful:', data);

                // Store token if provided
                if (data.token) {
                    console.log(data);
                    localStorage.setItem('token', data.token);
                    console.log(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Show success message
                alert('Login successful!');

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch(error => {
                console.error('Login error:', error);
                alert('Login failed. Please check your credentials and try again.');
            })
            .finally(() => {
                // Reset button state
                $submitBtn.text(originalText).prop('disabled', false);
            });
    });

    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#regName').val();
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

        // Show loading state
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.text();
        $submitBtn.text('Registering...').prop('disabled', true);

        // Make API call to backend
        fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                role: "user"
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Registration successful:', data);

                // Store token if provided
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Show success message
                alert('Registration successful! You can now log in.');

                // Switch to login form
                showForm('#loginForm');

                // Clear registration form
                $('#registerForm')[0].reset();
            })
            .catch(error => {
                console.error('Registration error:', error);
                alert('Registration failed: ' + error.message);
            })
            .finally(() => {
                // Reset button state
                $submitBtn.text(originalText).prop('disabled', false);
            });
    });

    $('#forgotPasswordForm').on('submit', function (e) {
        e.preventDefault();

        const email = $('#resetEmail').val();

        // Show loading state
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.text();
        $submitBtn.text('Sending...').prop('disabled', true);

        // Make API call to backend
        fetch('http://localhost:5000/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Password reset request successful:', data);

                // Show success message
                alert(data.message);

                // If we have a reset token (for testing), show it
                if (data.resetToken) {
                    alert(`Reset token (for testing): ${data.resetToken}`);
                }

                // Switch to login form
                showForm('#loginForm');

                // Clear the form
                $('#forgotPasswordForm')[0].reset();
            })
            .catch(error => {
                console.error('Password reset request error:', error);
                alert('Password reset request failed: ' + error.message);
            })
            .finally(() => {
                // Reset button state
                $submitBtn.text(originalText).prop('disabled', false);
            });
    });

    $('#resetPasswordForm').on('submit', function (e) {
        e.preventDefault();

        const resetToken = $('#resetToken').val();
        const newPassword = $('#newPassword').val();
        const confirmNewPassword = $('#confirmNewPassword').val();

        // Basic validation
        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        // Show loading state
        const $submitBtn = $(this).find('button[type="submit"]');
        const originalText = $submitBtn.text();
        $submitBtn.text('Resetting...').prop('disabled', true);

        // Make API call to backend
        fetch('http://localhost:5000/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resetToken: resetToken,
                newPassword: newPassword
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Password reset successful:', data);

                // Show success message
                alert(data.message);

                // Switch to login form
                showForm('#loginForm');

                // Clear the form
                $('#resetPasswordForm')[0].reset();
            })
            .catch(error => {
                console.error('Password reset error:', error);
                alert('Password reset failed: ' + error.message);
            })
            .finally(() => {
                // Reset button state
                $submitBtn.text(originalText).prop('disabled', false);
            });
    });
}); 