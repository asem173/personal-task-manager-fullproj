$(document).ready(function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // Set user information
    $('#username').text(user.username || 'User');
    if (user.username) {
        $('#user-avatar').text(user.username.charAt(0).toUpperCase());
    }

    // Show admin features if user is admin
    if (user.role === 'admin') {
        $('#nav-manage-users-item').show();
    }

    // Navigation functionality
    function showSection(sectionId) {
        // Hide all sections
        $('.content-section').hide();

        // Show the selected section
        $(sectionId).show();

        // Update navigation active state
        $('.nav-link').removeClass('active');
        $(`#nav-${sectionId.replace('#', '').replace('-section', '')}`).addClass('active');
    }

    // Navigation event listeners
    $('#nav-my-tasks').on('click', function (e) {
        e.preventDefault();
        showSection('#my-tasks-section');
        loadTasks();
    });

    $('#nav-shared-tasks').on('click', function (e) {
        e.preventDefault();
        showSection('#shared-tasks-section');
        loadSharedTasks();
    });

    $('#nav-notifications').on('click', function (e) {
        e.preventDefault();
        showSection('#notifications-section');
        loadNotifications();
    });

    $('#nav-profile').on('click', function (e) {
        e.preventDefault();
        showSection('#profile-section');
        loadProfile();
    });

    $('#nav-manage-users').on('click', function (e) {
        e.preventDefault();
        showSection('#manage-users-section');
        loadUsers();
    });

    // Logout functionality
    $('#logout-btn').on('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Load tasks from API
    function loadTasks() {
        const $container = $('#tasks-container');

        // Show loading spinner
        $container.html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading tasks...</p>
            </div>
        `);

        // Make API call
        fetch('http://localhost:5000/api/tasks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Tasks loaded:', data);

                if (data && Array.isArray(data) && data.length > 0) {
                    displayTasks(data, $container);
                } else {
                    $container.html(`
                    <div class="no-tasks">
                        <i class="bi bi-inbox display-1 text-muted mb-3"></i>
                        <h4 class="text-muted">No tasks found</h4>
                        <p class="text-muted">You don't have any tasks yet. Create your first task!</p>
                        <button class="btn btn-primary" id="create-first-task">
                            <i class="bi bi-plus-circle me-2"></i>
                            Create Your First Task
                        </button>
                    </div>
                `);
                }
            })
            .catch(error => {
                console.error('Error loading tasks:', error);
                $container.html(`
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load tasks. Please try again later.
                    <button class="btn btn-outline-danger ms-3" onclick="loadTasks()">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        Retry
                    </button>
                </div>
            `);
            });
    }

    // Display tasks in cards
    function displayTasks(tasks, container) {
        const tasksHtml = tasks.map(task => {
            const statusClass = getStatusClass(task.status);
            const priorityClass = getPriorityClass(task.priority);
            const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';

            return `
                <div class="task-card">
                    <div class="task-header">
                        <h5 class="task-title">${escapeHtml(task.title)}</h5>
                        <p class="task-description">${escapeHtml(task.description || 'No description')}</p>
                        <div class="task-meta">
                            <div class="d-flex gap-2">
                                <span class="task-status ${statusClass}">${task.status}</span>
                                <span class="task-priority ${priorityClass}">${task.priority}</span>
                            </div>
                            <small class="text-muted">
                                <i class="bi bi-calendar me-1"></i>
                                Due: ${dueDate}
                            </small>
                        </div>
                    </div>
                    <div class="task-actions">
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-primary btn-task edit-task" data-task-id="${task.id}">
                                <i class="bi bi-pencil me-1"></i>
                                Edit
                            </button>
                            <button class="btn btn-outline-success btn-task complete-task" data-task-id="${task.id}">
                                <i class="bi bi-check-circle me-1"></i>
                                Complete
                            </button>
                            <button class="btn btn-outline-info btn-task comment-task" data-task-id="${task.id}">
                                <i class="bi bi-chat-dots me-1"></i>
                                Comments
                            </button>
                            <button class="btn btn-outline-warning btn-task share-task" data-task-id="${task.id}">
                                <i class="bi bi-share me-1"></i>
                                Share
                            </button>
                            <button class="btn btn-outline-danger btn-task delete-task" data-task-id="${task.id}">
                                <i class="bi bi-trash me-1"></i>
                                Delete
                            </button>
                        </div>
                        <small class="text-muted">
                            Created: ${new Date(task.created_at).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            `;
        }).join('');

        container.html(tasksHtml);

        // Add event listeners to task buttons
        $('.edit-task').on('click', function () {
            const taskId = $(this).data('task-id');
            editTask(taskId);
        });

        $('.complete-task').on('click', function () {
            const taskId = $(this).data('task-id');
            completeTask(taskId);
        });

        $('.delete-task').on('click', function () {
            const taskId = $(this).data('task-id');
            deleteTask(taskId);
        });

        $('.comment-task').on('click', function () {
            const taskId = $(this).data('task-id');
            openComments(taskId);
        });

        $('.share-task').on('click', function () {
            const taskId = $(this).data('task-id');
            openShareTask(taskId);
        });
    }

    // Display profile information
    function displayProfile(profile, container) {
        const profileHtml = `
            <div class="row">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-4">
                                <div class="user-avatar me-3" style="width: 60px; height: 60px; font-size: 1.5rem;">
                                    ${profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h4 class="mb-1">${escapeHtml(profile.username || 'Unknown User')}</h4>
                                    <p class="text-muted mb-0">${escapeHtml(profile.email || 'No email')}</p>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Username</label>
                                        <p class="form-control-plaintext">${escapeHtml(profile.username || 'Not set')}</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Email</label>
                                        <p class="form-control-plaintext">${escapeHtml(profile.email || 'Not set')}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">User ID</label>
                                        <p class="form-control-plaintext">${profile.id || 'Not available'}</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Role</label>
                                        <p class="form-control-plaintext">
                                            <span class="badge bg-primary">${escapeHtml(profile.role || 'user')}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">
                                <i class="bi bi-gear me-2"></i>
                                Account Actions
                            </h5>
                            <div class="d-grid gap-2">
                                <button class="btn btn-outline-primary" id="update-profile-btn">
                                    <i class="bi bi-pencil me-2"></i>
                                    Update Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.html(profileHtml);

        // Add event listener for profile action
        $('#update-profile-btn').on('click', function () {
            openUpdateProfileModal();
        });
    }

    // Display users (admin only)
    function displayUsers(users, container) {
        if (!users || users.length === 0) {
            container.html(`
                <div class="no-tasks">
                    <i class="bi bi-people display-1 text-muted mb-3"></i>
                    <h4 class="text-muted">No users found</h4>
                    <p class="text-muted">No users are registered in the system.</p>
                </div>
            `);
            return;
        }

        const usersHtml = users.map(userData => {
            const roleClass = userData.role === 'admin' ? 'bg-danger' : 'bg-primary';
            const isCurrentUser = userData.id === user.id;

            return `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="d-flex align-items-center">
                                    <div class="user-avatar me-3" style="width: 50px; height: 50px; font-size: 1.2rem;">
                                        ${userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h5 class="mb-1">
                                            ${escapeHtml(userData.username || 'Unknown User')}
                                            ${isCurrentUser ? '<span class="badge bg-success ms-2">You</span>' : ''}
                                        </h5>
                                        <p class="text-muted mb-0">${escapeHtml(userData.email || 'No email')}</p>
                                        <small class="text-muted">ID: ${userData.id}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="d-flex justify-content-end align-items-center gap-2">
                                    <span class="badge ${roleClass}">${escapeHtml(userData.role || 'user')}</span>
                                    <button class="btn btn-outline-primary btn-sm edit-user-btn" data-user-id="${userData.id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.html(usersHtml);

        // Add event listener for user action
        $('.edit-user-btn').on('click', function () {
            const userId = $(this).data('user-id');
            editUser(userId);
        });
    }

    // Load shared tasks
    function loadSharedTasks() {
        const $container = $('#shared-tasks-container');

        $container.html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading shared tasks...</p>
            </div>
        `);

        // TODO: Implement shared tasks API call
        setTimeout(() => {
            $container.html(`
                <div class="no-tasks">
                    <i class="bi bi-share display-1 text-muted mb-3"></i>
                    <h4 class="text-muted">No shared tasks</h4>
                    <p class="text-muted">No tasks have been shared with you yet.</p>
                </div>
            `);
        }, 1000);
    }

    // Load notifications
    function loadNotifications() {
        const $container = $('#notifications-container');

        $container.html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading notifications...</p>
            </div>
        `);

        // TODO: Implement notifications API call
        setTimeout(() => {
            $container.html(`
                <div class="no-tasks">
                    <i class="bi bi-bell display-1 text-muted mb-3"></i>
                    <h4 class="text-muted">No notifications</h4>
                    <p class="text-muted">You don't have any notifications yet.</p>
                </div>
            `);
        }, 1000);
    }

    // Load profile
    function loadProfile() {
        const $container = $('#profile-container');
        const userId = user.id; // Get user ID from stored user data

        if (!userId) {
            $container.html(`
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    User ID not found. Please log in again.
                </div>
            `);
            return;
        }

        $container.html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading profile...</p>
            </div>
        `);

        // Make API call to get user profile
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Profile loaded:', data);
                displayProfile(data, $container);
            })
            .catch(error => {
                console.error('Error loading profile:', error);
                $container.html(`
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to load profile. Please try again later.
                        <button class="btn btn-outline-danger ms-3" onclick="loadProfile()">
                            <i class="bi bi-arrow-clockwise me-2"></i>
                            Retry
                        </button>
                    </div>
                `);
            });
    }

    // Load users (admin only)
    function loadUsers() {
        const $container = $('#manage-users-container');

        // Check if user is admin
        if (user.role !== 'admin') {
            $container.html(`
                <div class="alert alert-danger" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Access denied. Admin privileges required.
                </div>
            `);
            return;
        }

        $container.html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading users...</p>
            </div>
        `);

        // Make API call to get all users
        fetch('http://localhost:5000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Users loaded:', data);
                displayUsers(data, $container);
            })
            .catch(error => {
                console.error('Error loading users:', error);
                $container.html(`
                    <div class="alert alert-danger" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Failed to load users. Please try again later.
                        <button class="btn btn-outline-danger ms-3" onclick="loadUsers()">
                            <i class="bi bi-arrow-clockwise me-2"></i>
                            Retry
                        </button>
                    </div>
                `);
            });
    }

    // Helper functions
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'status-completed';
            case 'in_progress':
            case 'in progress':
                return 'status-in-progress';
            case 'not_started':
            case 'pending':
            default:
                return 'status-pending';
        }
    }

    function getPriorityClass(priority) {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            default:
                return 'priority-low';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Task action functions
    function editTask(taskId) {
        openEditTaskModal(taskId);
    }

    function completeTask(taskId) {
        updateTaskStatus(taskId, 'completed');
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteTaskFromAPI(taskId);
        }
    }

    // Comments functionality (placeholder)
    function openComments(taskId) {
        // TODO: Implement comments functionality
        alert(`Comments for task ${taskId} - This feature will be implemented soon!`);
    }

    // Share task functionality (placeholder)
    function openShareTask(taskId) {
        // TODO: Implement share task functionality
        alert(`Share task ${taskId} - This feature will be implemented soon!`);
    }

    // Add new task button
    $('#add-task-btn').on('click', function () {
        openCreateTaskModal();
    });

    // Create first task button
    $(document).on('click', '#create-first-task', function () {
        openCreateTaskModal();
    });



    // User management function (admin only)
    function editUser(userId) {
        openEditUserModal(userId);
    }

    // Load tasks on page load
    loadTasks();

    // Open update profile modal
    function openUpdateProfileModal() {
        // Get current profile data
        const userId = user.id;

        if (!userId) {
            alert('User ID not found. Please log in again.');
            return;
        }

        // Fetch current profile data to populate the form
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Populate the form with current data
                $('#updateUsername').val(data.username || '');
                $('#updateEmail').val(data.email || '');

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('updateProfileModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error loading profile data:', error);
                alert('Failed to load profile data. Please try again.');
            });
    }

    // Handle save profile button click
    $('#saveProfileBtn').on('click', function () {
        updateProfile();
    });

    // Update profile function
    function updateProfile() {
        const userId = user.id;
        const username = $('#updateUsername').val().trim();
        const email = $('#updateEmail').val().trim();

        // Validation
        if (!username) {
            alert('Username is required.');
            return;
        }

        if (!email) {
            alert('Email is required.');
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        // Show loading state
        const $saveBtn = $('#saveProfileBtn');
        const originalText = $saveBtn.html();
        $saveBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Saving...');
        $saveBtn.prop('disabled', true);

        // Prepare the request body
        const requestBody = {
            username: username,
            email: email,
            role: user.role || 'user' // Keep the current role
        };

        // Make API call to update profile
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Profile updated:', data);

                // Update stored user data
                user.username = data.username;
                user.email = data.email;
                localStorage.setItem('user', JSON.stringify(user));

                // Update UI
                $('#username').text(data.username || 'User');
                if (data.username) {
                    $('#user-avatar').text(data.username.charAt(0).toUpperCase());
                }

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateProfileModal'));
                modal.hide();

                // Reload profile section to show updated data
                loadProfile();

                // Show success message
                alert('Profile updated successfully!');
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $saveBtn.html(originalText);
                $saveBtn.prop('disabled', false);
            });
    }

    // Open edit user modal
    function openEditUserModal(userId) {
        // Check if user is admin
        if (user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            return;
        }

        // Fetch user data to populate the form
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('User data loaded:', data);

                // Populate the form with current data
                $('#editUsername').val(data.username || '');
                $('#editEmail').val(data.email || '');
                $('#editRole').val(data.role || 'user');

                // Store the user ID for the save function
                $('#editUserModal').data('editing-user-id', userId);

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error loading user data:', error);
                alert('Failed to load user data. Please try again.');
            });
    }

    // Handle save user button click
    $('#saveUserBtn').on('click', function () {
        updateUser();
    });

    // Update user function
    function updateUser() {
        const userId = $('#editUserModal').data('editing-user-id');
        const username = $('#editUsername').val().trim();
        const email = $('#editEmail').val().trim();
        const role = $('#editRole').val();

        // Validation
        if (!username) {
            alert('Username is required.');
            return;
        }

        if (!email) {
            alert('Email is required.');
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!role || (role !== 'user' && role !== 'admin')) {
            alert('Please select a valid role.');
            return;
        }

        // Show loading state
        const $saveBtn = $('#saveUserBtn');
        const originalText = $saveBtn.html();
        $saveBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Saving...');
        $saveBtn.prop('disabled', true);

        // Prepare the request body
        const requestBody = {
            username: username,
            email: email,
            role: role
        };

        // Make API call to update user
        fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('User updated:', data);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                modal.hide();

                // Reload users list to show updated data
                loadUsers();

                // Show success message
                alert('User updated successfully!');
            })
            .catch(error => {
                console.error('Error updating user:', error);
                alert('Failed to update user. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $saveBtn.html(originalText);
                $saveBtn.prop('disabled', false);
            });
    }

    // Open create task modal
    function openCreateTaskModal() {
        // Reset form
        $('#createTaskForm')[0].reset();

        // Set default values
        $('#createTaskStatus').val('pending');
        $('#createTaskPriority').val('medium');

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('createTaskModal'));
        modal.show();
    }

    // Handle save create task button click
    $('#saveCreateTaskBtn').on('click', function () {
        createTask();
    });

    // Create task function
    function createTask() {
        const title = $('#createTaskTitle').val().trim();
        const description = $('#createTaskDescription').val().trim();
        const dueDate = $('#createTaskDueDate').val();
        const status = $('#createTaskStatus').val();
        const priority = $('#createTaskPriority').val();

        // Validation
        if (!title) {
            alert('Task title is required.');
            return;
        }

        // Show loading state
        const $saveBtn = $('#saveCreateTaskBtn');
        const originalText = $saveBtn.html();
        $saveBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Creating...');
        $saveBtn.prop('disabled', true);

        // Prepare the request body
        const requestBody = {
            title: title,
            description: description,
            due_date: dueDate || null,
            status: status,
            priority: priority
        };

        // Make API call to create task
        fetch('http://localhost:5000/api/tasks', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Task created:', data);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('createTaskModal'));
                modal.hide();

                // Reload tasks to show new task
                loadTasks();

                // Show success message
                alert('Task created successfully!');
            })
            .catch(error => {
                console.error('Error creating task:', error);
                alert('Failed to create task. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $saveBtn.html(originalText);
                $saveBtn.prop('disabled', false);
            });
    }

    // Open edit task modal
    function openEditTaskModal(taskId) {
        // Fetch task data to populate the form
        fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Task data loaded:', data);
                console.log('Task status:', data.status);

                // Populate the form with current data
                $('#editTaskTitle').val(data.title || '');
                $('#editTaskDescription').val(data.description || '');
                $('#editTaskDueDate').val(data.due_date ? data.due_date.split('T')[0] : '');

                // Map backend status to dropdown values
                let mappedStatus = 'pending';
                if (data.status === 'not_started' || data.status === 'pending') {
                    mappedStatus = 'pending';
                } else if (data.status === 'in_progress') {
                    mappedStatus = 'in_progress';
                } else if (data.status === 'completed') {
                    mappedStatus = 'completed';
                }

                console.log('Raw status from API:', data.status);
                console.log('Mapped status:', mappedStatus);
                $('#editTaskStatus').val(mappedStatus);
                console.log('Final selected value:', $('#editTaskStatus').val());

                $('#editTaskPriority').val(data.priority || 'medium');

                // Store the task ID for the save function
                $('#editTaskModal').data('editing-task-id', taskId);

                // Show the modal
                const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error loading task data:', error);
                alert('Failed to load task data. Please try again.');
            });
    }

    // Handle save edit task button click
    $('#saveEditTaskBtn').on('click', function () {
        updateTask();
    });

    // Update task function
    function updateTask() {
        const taskId = $('#editTaskModal').data('editing-task-id');
        const title = $('#editTaskTitle').val().trim();
        const description = $('#editTaskDescription').val().trim();
        const dueDate = $('#editTaskDueDate').val();
        const status = $('#editTaskStatus').val();
        const priority = $('#editTaskPriority').val();

        console.log('Updating task with status:', status);
        console.log('All form values:', { title, description, dueDate, status, priority });

        // Validation
        if (!title) {
            alert('Task title is required.');
            return;
        }

        // Show loading state
        const $saveBtn = $('#saveEditTaskBtn');
        const originalText = $saveBtn.html();
        $saveBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Saving...');
        $saveBtn.prop('disabled', true);

        // Prepare the request body
        const requestBody = {
            title: title,
            description: description,
            due_date: dueDate || null,
            status: status,
            priority: priority
        };

        console.log('Sending request body:', requestBody);

        // Make API call to update task
        fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Task updated:', data);
                console.log('Response status field:', data.status);

                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
                modal.hide();

                // Reload tasks to show updated task
                loadTasks();

                // Show success message
                alert('Task updated successfully!');
            })
            .catch(error => {
                console.error('Error updating task:', error);
                alert('Failed to update task. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $saveBtn.html(originalText);
                $saveBtn.prop('disabled', false);
            });
    }

    // Update task status function
    function updateTaskStatus(taskId, status) {
        // Show loading state
        const $completeBtn = $(`.complete-task[data-task-id="${taskId}"]`);
        const originalText = $completeBtn.html();
        $completeBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Completing...');
        $completeBtn.prop('disabled', true);

        // Prepare the request body
        const requestBody = {
            status: status
        };

        // Make API call to update task status
        fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Task status updated:', data);

                // Reload tasks to show updated status
                loadTasks();

                // Show success message
                alert('Task completed successfully!');
            })
            .catch(error => {
                console.error('Error updating task status:', error);
                alert('Failed to complete task. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $completeBtn.html(originalText);
                $completeBtn.prop('disabled', false);
            });
    }

    // Delete task function
    function deleteTaskFromAPI(taskId) {
        // Show loading state
        const $deleteBtn = $(`.delete-task[data-task-id="${taskId}"]`);
        const originalText = $deleteBtn.html();
        $deleteBtn.html('<i class="bi bi-arrow-clockwise me-2"></i>Deleting...');
        $deleteBtn.prop('disabled', true);

        // Make API call to delete task
        fetch(`http://localhost:5000/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Task deleted:', data);

                // Reload tasks to show updated list
                loadTasks();

                // Show success message
                alert('Task deleted successfully!');
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                alert('Failed to delete task. Please try again.');
            })
            .finally(() => {
                // Reset button state
                $deleteBtn.html(originalText);
                $deleteBtn.prop('disabled', false);
            });
    }
}); 