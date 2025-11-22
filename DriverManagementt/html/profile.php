<?php
session_start();
require_once __DIR__ . '/../php/db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$userId = $_SESSION['user_id'];
$success = '';
$error = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    try {
        if ($action === 'update_account') {
            // Update account information
            $stmt = $pdo->prepare('
                UPDATE users 
                SET name = ?, email = ?, phone = ?, address = ?, dob = ?
                WHERE id = ?
            ');
            $stmt->execute([
                $_POST['username'],
                $_POST['email'],
                $_POST['phone'],
                $_POST['address'],
                $_POST['dob'],
                $userId
            ]);
            
            $_SESSION['user_name'] = $_POST['username'];
            $_SESSION['user_email'] = $_POST['email'];
            $success = 'Account information updated successfully';

        } elseif ($action === 'update_driver') {
            // Update driver information
            $vehicleCategories = isset($_POST['vehicleCapability']) ? json_encode($_POST['vehicleCapability']) : json_encode([]);
            
            // Convert date strings to proper format
            $issueDate = !empty($_POST['issueDate']) ? date('Y-m-d', strtotime($_POST['issueDate'])) : null;
            $expiryDate = !empty($_POST['expiryDate']) ? date('Y-m-d', strtotime($_POST['expiryDate'])) : null;
            
            $stmt = $pdo->prepare('
                UPDATE users 
                SET license_number = ?, issue_date = ?, expiry_date = ?, 
                    years_experience = ?, previous_jobs = ?, vehicle_categories = ?
                WHERE id = ?
            ');
            $stmt->execute([
                $_POST['licenseNumber'],
                $issueDate,
                $expiryDate,
                $_POST['yearsExperience'],
                $_POST['previousJobs'],
                $vehicleCategories,
                $userId
            ]);
            $success = 'Driver information updated successfully';

        } elseif ($action === 'change_password') {
            // Change password
            $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!password_verify($_POST['currentPassword'], $user['password'])) {
                $error = 'Current password is incorrect';
            } elseif ($_POST['newPassword'] !== $_POST['confirmPassword']) {
                $error = 'New passwords do not match';
            } elseif (strlen($_POST['newPassword']) < 8) {
                $error = 'Password must be at least 8 characters';
            } else {
                $hashedPassword = password_hash($_POST['newPassword'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
                $stmt->execute([$hashedPassword, $userId]);
                $success = 'Password changed successfully';
            }

        } elseif ($action === 'upload_license') {
            // Handle license image upload (same logic as avatar)
            if (isset($_FILES['licenseImage']) && $_FILES['licenseImage']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/licenses/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Validate file type
                $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                $fileType = $_FILES['licenseImage']['type'];

                if (!in_array($fileType, $allowedTypes)) {
                    $error = 'Invalid file type. Only JPG, PNG, and GIF allowed.';
                } else {
                    $ext = pathinfo($_FILES['licenseImage']['name'], PATHINFO_EXTENSION);
                    $filename = 'license_' . $userId . '_' . time() . '.' . $ext;
                    $filepath = $uploadDir . $filename;

                    if (move_uploaded_file($_FILES['licenseImage']['tmp_name'], $filepath)) {
                        // Delete old license image if it exists and is not default
                        $stmt = $pdo->prepare('SELECT license_image FROM users WHERE id = ?');
                        $stmt->execute([$userId]);
                        $oldLicense = $stmt->fetchColumn();

                        if ($oldLicense && strpos($oldLicense, 'licence-sample') === false) {
                            $oldPath = __DIR__ . '/../' . ltrim(str_replace('../', '', $oldLicense), '/');
                            if (file_exists($oldPath)) {
                                unlink($oldPath);
                            }
                        }

                        // Update database with licenses path
                        $stmt = $pdo->prepare('UPDATE users SET license_image = ? WHERE id = ?');
                        $stmt->execute(['uploads/licenses/' . $filename, $userId]);
                        
                        header('Location: profile.php');
                        exit;
                    } else {
                        $error = 'Failed to upload license image';
                    }
                }
            }
        } elseif ($action === 'upload_avatar') {
            // Handle avatar/2x2 ID picture upload
            if (isset($_FILES['avatarImage']) && $_FILES['avatarImage']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads/avatars/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Validate file type
                $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                $fileType = $_FILES['avatarImage']['type'];
                
                if (!in_array($fileType, $allowedTypes)) {
                    $error = 'Invalid file type. Only JPG, PNG, and GIF allowed.';
                } else {
                    $ext = pathinfo($_FILES['avatarImage']['name'], PATHINFO_EXTENSION);
                    $filename = 'avatar_' . $userId . '_' . time() . '.' . $ext;
                    $filepath = $uploadDir . $filename;

                    if (move_uploaded_file($_FILES['avatarImage']['tmp_name'], $filepath)) {
                        // Delete old avatar if it exists and is not default
                        $stmt = $pdo->prepare('SELECT avatar FROM users WHERE id = ?');
                        $stmt->execute([$userId]);
                        $oldAvatar = $stmt->fetchColumn();
                        
                        if ($oldAvatar && $oldAvatar !== '../assets/user-avatar.png' && file_exists(__DIR__ . '/' . $oldAvatar)) {
                            unlink(__DIR__ . '/' . $oldAvatar);
                        }

                        // Update database
                        $stmt = $pdo->prepare('UPDATE users SET avatar = ? WHERE id = ?');
                        $stmt->execute(['../uploads/avatars/' . $filename, $userId]);
                        $success = 'Profile picture updated successfully';
                    } else {
                        $error = 'Failed to upload image';
                    }
                }
            }
        }
    } catch (PDOException $e) {
        $error = 'Error updating profile: ' . $e->getMessage();
    }
}

// Fetch user data
try {
    $stmt = $pdo->prepare('
        SELECT name, email, phone, address, dob, avatar, role, created_at,
               license_number, issue_date, expiry_date, license_image,
               years_experience, previous_jobs, vehicle_categories,
               total_trips, rating, status, member_since
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        header('Location: login.php');
        exit;
    }

    // Parse vehicle categories
    $vehicleCategories = json_decode($user['vehicle_categories'] ?? '[]', true);
    if (!is_array($vehicleCategories)) {
        $vehicleCategories = [];
    }

    // Format dates
    $memberSince = $user['member_since'] ? date('M Y', strtotime($user['member_since'])) : date('M Y', strtotime($user['created_at']));
    $issueDate = $user['issue_date'] ? date('m/d/y', strtotime($user['issue_date'])) : '';
    $expiryDate = $user['expiry_date'] ? date('m/d/y', strtotime($user['expiry_date'])) : '';
    $dob = $user['dob'] ? date('m/d/Y', strtotime($user['dob'])) : '';

} catch (PDOException $e) {
    die('Error fetching user data: ' . $e->getMessage());
}

// After fetching $user (right before <!DOCTYPE>):
$licenseRaw = $user['license_image'] ?? '';
$licenseDisplay = '../assets/licence-sample.jpg';
if ($licenseRaw) {
    $clean = ltrim(str_replace(['../','..\\'], '', $licenseRaw), '/');
    $abs   = __DIR__ . '/../' . $clean;
    if (file_exists($abs)) {
        $licenseDisplay = '../' . $clean . '?v=' . time();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, max-age=0">
    <meta http-equiv="Pragma" content="no-cache">
    <title>Profile - JourneoLink Driver</title>
    <link rel="icon" type="image/png" href="../assets/logo.png">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="../css/profile.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
</head>
<body data-page="profile">
    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <i class="fa-solid fa-bars"></i>
            </button>
            <img src="../assets/logo.png" alt="JourneoLink Logo" class="logo">
            <span class="brand-name">JOURNEO<span class="brand-link">LINK</span> <span class="brand-driver">DRIVER</span></span>
        </div>
        <div class="header-right">
            <div class="user-info">
                <span class="user-name"><?php echo htmlspecialchars($user['name']); ?></span>
                <span class="user-email"><?php echo htmlspecialchars($user['email']); ?></span>
            </div>
            <img src="<?php echo htmlspecialchars($user['avatar']); ?>" alt="User Avatar" class="user-avatar">
        </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header" id="menuToggle" role="button" tabindex="0" aria-label="Toggle sidebar">
            <i class="fa-solid fa-grip"></i> MENU
        </div>
        
        <nav class="sidebar-nav">
            <div class="nav-section">
                <a href="dashboard.php" class="nav-item" data-page="dashboard">
                    <span class="icon"><i class="fa-solid fa-grip"></i></span>
                    <span class="nav-text">Dashboard</span> 
                </a>
                <a href="schedule.html" class="nav-item" data-page="schedule">
                    <span class="icon"><i class="fa-solid fa-calendar-days"></i></span>
                    <span class="nav-text">Schedule</span>
                </a>
                <a href="messages.html" class="nav-item" data-page="messages">
                    <span class="icon"><i class="fa-solid fa-message"></i></span>
                    <span class="nav-text">Messages</span>
                </a>
                <a href="wallet.html" class="nav-item" data-page="wallet">
                    <span class="icon"><i class="fa-solid fa-wallet"></i></span>
                    <span class="nav-text">My Wallet</span>
                </a>
                <a href="history.html" class="nav-item" data-page="history">
                    <span class="icon"><i class="fa-solid fa-clock-rotate-left"></i></span>
                    <span class="nav-text">Compliance History</span>
                </a>
            </div>
            
            <div class="nav-section">
                <div class="nav-section-title">
                    <i class="fa-solid fa-gear"></i> GENERAL
                </div>
                <a href="profile.php" class="nav-item" data-page="profile">
                    <span class="icon"><i class="fa-solid fa-user"></i></span>
                    <span class="nav-text">Profile</span>
                </a>
                <a href="#" class="nav-item" id="logoutBtn">
                    <span class="icon"><i class="fa-solid fa-arrow-right-from-bracket"></i></span>
                    <span class="nav-text">Logout</span>
                </a>
            </div>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content" id="mainContent">
        <?php if ($success): ?>
            <div class="alert alert-success" style="background:#d4edda;color:#155724;padding:12px;border:1px solid #c3e6cb;border-radius:6px;margin-bottom:20px;">
                <?php echo htmlspecialchars($success); ?>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-error" style="background:#f8d7da;color:#721c24;padding:12px;border:1px solid #f5c6cb;border-radius:6px;margin-bottom:20px;">
                <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <div class="profile-container">
            <!-- Left Sidebar - Profile Card -->
            <aside class="profile-sidebar">
                <div class="profile-card">
                    <div class="profile-avatar-container">
                        <img src="<?php echo htmlspecialchars($user['avatar']); ?>" alt="<?php echo htmlspecialchars($user['name']); ?>" class="profile-avatar" id="profileAvatar">
                        <form id="avatarUploadForm" method="POST" enctype="multipart/form-data" style="display:none;">
                            <input type="hidden" name="action" value="upload_avatar">
                            <input type="file" name="avatarImage" id="avatarFileInput" accept="image/*">
                        </form>
                        <button class="avatar-upload-btn" id="uploadAvatarBtn" title="Change profile picture">
                            <i class="fa-solid fa-camera"></i>
                        </button>
                    </div>
                    <h2 class="profile-name"><?php echo htmlspecialchars($user['name']); ?></h2>
                    <p class="profile-role"><?php echo ucfirst(htmlspecialchars($user['role'])); ?></p>
                    <span class="profile-status <?php echo strtolower($user['status']); ?>">
                        <?php echo strtoupper(htmlspecialchars($user['status'])); ?>
                    </span>
                    
                    <div class="profile-member-info">
                        <i class="fa-solid fa-user"></i>
                        <span>Member since <?php echo htmlspecialchars($memberSince); ?></span>
                    </div>
                </div>

                <div class="quick-stats">
                    <h3>Quick Stats</h3>
                    <div class="stat-item">
                        <span class="stat-label">Total Trips</span>
                        <span class="stat-value"><?php echo htmlspecialchars($user['total_trips']); ?></span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Rating</span>
                        <span class="stat-value"><?php echo number_format($user['rating'], 1); ?> <i class="fa-solid fa-star"></i></span>
                    </div>
                </div>
            </aside>

            <!-- Right Content - Tabbed Interface -->
            <div class="profile-content">
                <!-- Tab Navigation -->
                <div class="profile-tabs">
                    <button class="profile-tab active" data-tab="account-info">
                        <i class="fa-solid fa-user"></i>
                        <span>Account Information</span>
                    </button>
                    <button class="profile-tab" data-tab="driver-info">
                        <i class="fa-solid fa-car"></i>
                        <span>Driver Info</span>
                    </button>
                    <button class="profile-tab" data-tab="security">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Security</span>
                    </button>
                    <button class="profile-tab" data-tab="notifications">
                        <i class="fa-solid fa-bell"></i>
                        <span>Notifications</span>
                    </button>
                </div>

                <!-- Tab Content Container -->
                <div class="tab-panels">
                    
                    <!-- ACCOUNT INFORMATION TAB -->
                    <div class="tab-panel active" id="account-info">
                        <div class="panel-header">
                            <h2>Account Information</h2>
                            <button class="edit-btn" id="editAccountBtn">
                                <i class="fa-solid fa-pen"></i>
                                Edit
                            </button>
                        </div>

                        <form class="profile-form" id="accountForm">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($user['name']); ?>" class="form-input" readonly>
                            </div>

                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($user['email']); ?>" class="form-input" readonly>
                            </div>

                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>" class="form-input" readonly>
                            </div>

                            <div class="form-group">
                                <label for="address">Address</label>
                                <input type="text" id="address" name="address" value="<?php echo htmlspecialchars($user['address'] ?? ''); ?>" class="form-input" readonly>
                            </div>

                            <div class="form-group">
                                <label for="dob">Date of Birth</label>
                                <input type="text" id="dob" name="dob" value="<?php echo htmlspecialchars($dob); ?>" class="form-input" readonly>
                            </div>

                            <div class="form-actions" style="display: none;" id="accountFormActions">
                                <button type="button" class="btn-save" id="saveAccountBtn">Save Changes</button>
                                <button type="button" class="btn-cancel" id="cancelAccountBtn">Cancel</button>
                            </div>
                        </form>
                    </div>

                    <!-- DRIVER INFO TAB -->
                    <div class="tab-panel" id="driver-info">
                        <div class="panel-header">
                            <h2>Driver's Information</h2>
                            <button class="edit-btn" id="editDriverBtn">
                                <i class="fa-solid fa-pen"></i>
                                Edit
                            </button>
                        </div>

                                                <form class="profile-form" id="driverForm">
                            <!-- Driver's License Section -->
                            <div class="form-section">
                                <h3 class="section-title">Driver's License</h3>
                                
                                <div class="form-group">
                                    <label for="licenseNumber">License Number</label>
                                    <input type="text" id="licenseNumber" name="licenseNumber" value="<?php echo htmlspecialchars($user['license_number']); ?>" class="form-input" readonly>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="issueDate">Issue Date</label>
                                        <input type="text" id="issueDate" name="issueDate" value="<?php echo $user['issue_date'] ? date('m/d/Y', strtotime($user['issue_date'])) : ''; ?>" class="form-input" readonly>
                                    </div>
                                    <div class="form-group">
                                        <label for="expiryDate">Expiry Date</label>
                                        <input type="text" id="expiryDate" name="expiryDate" value="<?php echo $user['expiry_date'] ? date('m/d/Y', strtotime($user['expiry_date'])) : ''; ?>" class="form-input" readonly>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="licenseImage">License Image</label>
                                    <div class="license-upload-container">
                                        <div class="license-preview" id="licensePreview">
                                            <img src="<?php echo htmlspecialchars($user['license_image'] ?: '../assets/license-sample.svg'); ?>" alt="Driver's License" class="license-image" id="licenseImage">
                                        </div>
                                        <button type="button" class="upload-btn" id="uploadLicenseBtn">
                                            <i class="fa-solid fa-upload"></i>
                                            Upload New
                                        </button>
                                        <input type="file" id="licenseFileInput" accept="image/jpeg,image/png,image/jpg,image/gif" style="display: none;">
                                        <p class="upload-hint">Max 5MB • JPG, PNG, GIF</p>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="yearsExperience">Years of Experience</label>
                                    <input type="number" id="yearsExperience" name="yearsExperience" value="<?php echo htmlspecialchars($user['years_experience'] ?? 0); ?>" class="form-input" readonly>
                                </div>

                                <div class="form-group">
                                    <label for="previousJobs">Previous Driving Jobs</label>
                                    <textarea id="previousJobs" name="previousJobs" rows="4" class="form-input form-textarea" readonly><?php echo htmlspecialchars($user['previous_jobs'] ?? ''); ?></textarea>
                                </div>
                            </div>

                            <!-- Vehicle Driving Capability Section -->
                            <div class="form-section">
                                <h3 class="section-title">Vehicle Driving Capability</h3>
                                
                                <div class="form-group">
                                    <label>Vehicle Categories</label>
                                    <div class="vehicle-categories">
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="sedan" <?php echo in_array('sedan', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">Sedan</span>
                                        </label>
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="suv" <?php echo in_array('suv', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">SUV</span>
                                        </label>
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="minibus" <?php echo in_array('minibus', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">Minibus</span>
                                        </label>
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="van" <?php echo in_array('van', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">Van</span>
                                        </label>
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="truck" <?php echo in_array('truck', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">Truck</span>
                                        </label>
                                        <label class="vehicle-category-item">
                                            <input type="checkbox" name="vehicleCategory" value="bus" <?php echo in_array('bus', $vehicleCategories) ? 'checked' : ''; ?> disabled>
                                            <span class="category-badge">Bus</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions" style="display: none;" id="driverFormActions">
                                <button type="button" class="btn-save" id="saveDriverBtn">Save Changes</button>
                                <button type="button" class="btn-cancel" id="cancelDriverBtn">Cancel</button>
                            </div>
                        </form>
                    </div>

                    <!-- SECURITY TAB -->
                    <div class="tab-panel" id="security">
                        <div class="panel-header">
                            <h2>Security Settings</h2>
                        </div>

                        <div class="security-settings-content">
                            <!-- Password Section -->
                            <div class="security-setting-item">
                                <div class="setting-header">
                                    <div class="setting-info">
                                        <h3>Password</h3>
                                        <p class="setting-subtitle">Keep your account secure</p>
                                    </div>
                                    <button class="change-link" id="changePasswordBtn">Change</button>
                                </div>
                            </div>

                            <!-- Two-Factor Authentication Section -->
                            <div class="security-setting-item">
                                <div class="setting-header">
                                    <div class="setting-info">
                                        <h3>Two-Factor Authentication</h3>
                                        <p class="setting-subtitle">Add extra security to your account</p>
                                    </div>
                                    <label class="toggle-switch">
                                        <input type="checkbox" id="twoFactorToggle">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- NOTIFICATIONS TAB -->
                    <div class="tab-panel" id="notifications">
                        <div class="panel-header">
                            <h2>Notification Preferences</h2>
                            <p class="panel-subtitle">Manage your email and SMS alerts</p>
                        </div>

                        <div class="notification-preferences-content">
                            <!-- Email Alerts -->
                            <div class="notification-pref-item">
                                <div class="pref-info">
                                    <h3>Email Alerts</h3>
                                    <p>Receive notifications via email</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="emailAlertsToggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <!-- SMS Alerts -->
                            <div class="notification-pref-item">
                                <div class="pref-info">
                                    <h3>SMS Alerts</h3>
                                    <p>Receive notifications via SMS</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="smsAlertsToggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <!-- Trip Updates -->
                            <div class="notification-pref-item">
                                <div class="pref-info">
                                    <h3>Trip Updates</h3>
                                    <p>Get notified about trip requests and updates</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="tripUpdatesToggle" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <!-- Promotions -->
                            <div class="notification-pref-item">
                                <div class="pref-info">
                                    <h3>Promotions</h3>
                                    <p>Receive special offers and discounts</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="promotionsToggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>

    <!-- Logout Modal -->
    <div class="modal" id="logoutModal">
        <div class="modal-overlay"></div>
        <div class="modal-content logout-modal-content">
            <div class="logout-modal-body">
                <div class="logout-modal-header">
                    <h3 class="logout-modal-title">Confirm Logout</h3>
                    <p class="logout-modal-text">Are you sure you want to leave?</p>
                </div>
                <div class="logout-modal-actions">
                    <button class="btn-logout-confirm" id="confirmLogout">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        Yes, Log Out
                    </button>
                    <button class="btn-logout-cancel" id="cancelLogout">Cancel</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Account Information Modal -->
    <div class="edit-modal-overlay" id="editAccountModal">
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h2>Edit Account Information</h2>
                <button class="close-modal-btn" id="closeEditModalBtn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="edit-modal-body">
                <form id="editAccountForm" method="POST">
                    <input type="hidden" name="action" value="update_account">
                    
                    <div class="edit-form-group">
                        <label for="editUsername">Username</label>
                        <input type="text" id="editUsername" name="username" class="edit-form-input" value="<?php echo htmlspecialchars($user['name']); ?>" required>
                    </div>

                    <div class="edit-form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" name="email" class="edit-form-input" value="<?php echo htmlspecialchars($user['email']); ?>" required>
                    </div>

                    <div class="edit-form-group">
                        <label for="editPhone">Phone Number</label>
                        <input type="tel" id="editPhone" name="phone" class="edit-form-input" value="<?php echo htmlspecialchars($user['phone'] ?? ''); ?>" required>
                    </div>

                    <div class="edit-form-group">
                        <label for="editAddress">Address</label>
                        <input type="text" id="editAddress" name="address" class="edit-form-input" value="<?php echo htmlspecialchars($user['address'] ?? ''); ?>" required>
                    </div>

                    <div class="edit-form-group">
                        <label for="editDob">Date of Birth</label>
                        <input type="text" id="editDob" name="dob" class="edit-form-input" value="<?php echo htmlspecialchars($dob); ?>" required>
                    </div>

                    <div class="edit-modal-actions">
                        <button type="button" class="cancel-btn" id="cancelEditBtn">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Edit Driver Information Modal -->
    <div class="edit-modal-overlay" id="editDriverModal">
        <div class="edit-modal edit-driver-modal">
            <div class="edit-modal-header">
                <h2>Edit Driver Information</h2>
                <button class="close-modal-btn" id="closeDriverModalBtn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="edit-modal-body">
                <form id="editDriverForm" method="POST">
                    <input type="hidden" name="action" value="update_driver">
                    
                    <div class="edit-form-group">
                        <label for="editLicenseNumber">Active License Number</label>
                        <input type="text" id="editLicenseNumber" name="licenseNumber" class="edit-form-input" value="<?php echo htmlspecialchars($user['license_number'] ?? ''); ?>" required>
                    </div>

                    <div class="form-row-modal">
                        <div class="edit-form-group">
                            <label for="editIssueDate">Issue Date</label>
                            <input type="date" id="editIssueDate" name="issueDate" class="edit-form-input" value="<?php echo $user['issue_date'] ? htmlspecialchars($user['issue_date']) : ''; ?>" required>
                        </div>
                        <div class="edit-form-group">
                            <label for="editExpiryDate">Expiry Date</label>
                            <input type="date" id="editExpiryDate" name="expiryDate" class="edit-form-input" value="<?php echo $user['expiry_date'] ? htmlspecialchars($user['expiry_date']) : ''; ?>" required>
                        </div>
                    </div>

                    <div class="edit-form-group">
                        <label for="editYearsExperience">Years of Experience</label>
                        <input type="number" id="editYearsExperience" name="yearsExperience" class="edit-form-input" value="<?php echo htmlspecialchars($user['years_experience'] ?? ''); ?>" required>
                    </div>

                    <div class="edit-form-group">
                        <label for="editPreviousJobs">Previous Driving Jobs</label>
                        <textarea id="editPreviousJobs" name="previousJobs" class="edit-form-input form-textarea" rows="4" required><?php echo htmlspecialchars($user['previous_jobs'] ?? ''); ?></textarea>
                    </div>

                    <div class="edit-form-group">
                        <label>Vehicle Driving Capability</label>
                        <div class="vehicle-categories">
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="sedan" <?php echo in_array('sedan', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">Sedan</span>
                            </label>
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="suv" <?php echo in_array('suv', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">SUV</span>
                            </label>
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="minibus" <?php echo in_array('minibus', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">Minibus</span>
                            </label>
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="van" <?php echo in_array('van', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">Van</span>
                            </label>
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="truck" <?php echo in_array('truck', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">Truck</span>
                            </label>
                            <label class="vehicle-category-item">
                                <input type="checkbox" name="vehicleCapability[]" value="bus" <?php echo in_array('bus', $vehicleCategories) ? 'checked' : ''; ?>>
                                <span class="category-badge">Bus</span>
                            </label>
                        </div>
                    </div>

                    <div class="edit-modal-actions">
                        <button type="button" class="cancel-btn" id="cancelDriverEditBtn">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Change Password Modal -->
    <div class="edit-modal-overlay" id="changePasswordModal">
        <div class="edit-modal change-password-modal">
            <div class="edit-modal-header">
                <h2>Change Password</h2>
                <button class="close-modal-btn" id="closePasswordModalBtn">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="edit-modal-body">
                <form id="changePasswordForm" method="POST">
                    <input type="hidden" name="action" value="change_password">
                    
                    <div class="edit-form-group">
                        <label for="currentPassword">Enter your current password</label>
                        <div class="input-with-icon">
                            <input type="password" id="currentPassword" name="currentPassword" class="edit-form-input password-input" placeholder="Enter your current password" required>
                            <button type="button" class="toggle-password-btn" data-target="currentPassword">
                                <i class="fa-solid fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="edit-form-group">
                        <label for="newPassword">Enter new password</label>
                        <div class="input-with-icon">
                            <input type="password" id="newPassword" name="newPassword" class="edit-form-input password-input" placeholder="Enter new password" required>
                            <button type="button" class="toggle-password-btn" data-target="newPassword">
                                <i class="fa-solid fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="edit-form-group">
                        <label for="confirmPassword">Confirm password</label>
                        <div class="input-with-icon">
                            <input type="password" id="confirmPassword" name="confirmPassword" class="edit-form-input password-input" placeholder="Confirm password" required>
                            <button type="button" class="toggle-password-btn" data-target="confirmPassword">
                                <i class="fa-solid fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="edit-modal-actions">
                        <button type="button" class="cancel-btn" id="cancelPasswordBtn">Cancel</button>
                        <button type="submit" class="save-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="../js/layout.js"></script>
    <script src="../js/profile.js"></script>
    <script>
        // ===== ACCOUNT EDIT =====
        document.getElementById('editAccountBtn')?.addEventListener('click', () => {
            document.getElementById('editAccountModal').style.display = 'flex';
        });

        document.getElementById('closeEditModalBtn')?.addEventListener('click', () => {
            document.getElementById('editAccountModal').style.display = 'none';
        });

        document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
            document.getElementById('editAccountModal').style.display = 'none';
        });

        document.getElementById('editAccountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('editAccountForm').submit();
        });

        document.getElementById('editAccountModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'editAccountModal') {
                document.getElementById('editAccountModal').style.display = 'none';
            }
        });

        // ===== DRIVER EDIT =====
        document.getElementById('editDriverBtn')?.addEventListener('click', () => {
            document.getElementById('editDriverModal').style.display = 'flex';
        });

        document.getElementById('closeDriverModalBtn')?.addEventListener('click', () => {
            document.getElementById('editDriverModal').style.display = 'none';
        });

        document.getElementById('cancelDriverEditBtn')?.addEventListener('click', () => {
            document.getElementById('editDriverModal').style.display = 'none';
        });

        document.getElementById('editDriverForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('editDriverForm').submit();
        });

        document.getElementById('editDriverModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'editDriverModal') {
                document.getElementById('editDriverModal').style.display = 'none';
            }
        });

        // ===== PASSWORD CHANGE =====
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
            document.getElementById('changePasswordModal').style.display = 'flex';
        });

        document.getElementById('closePasswordModalBtn')?.addEventListener('click', () => {
            document.getElementById('changePasswordModal').style.display = 'none';
        });

        document.getElementById('cancelPasswordBtn')?.addEventListener('click', () => {
            document.getElementById('changePasswordModal').style.display = 'none';
        });

        document.getElementById('changePasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('changePasswordForm').submit();
        });

        document.getElementById('changePasswordModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'changePasswordModal') {
                document.getElementById('changePasswordModal').style.display = 'none';
            }
        });

        // ===== LICENSE UPLOAD =====
        // document.getElementById('uploadLicenseBtn').addEventListener('click', () => {
        //     document.getElementById('licenseFileInput').click();
        // });

        // document.getElementById('licenseFileInput').addEventListener('change', function () {
        //     if (this.files && this.files[0]) {
        //         const btn = document.getElementById('uploadLicenseBtn');
        //         const originalHTML = btn.innerHTML;
        //         btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
        //         btn.disabled = true;
                
        //         // Submit form and reload page after delay
        //         document.getElementById('licenseUploadForm').submit();
                
        //         setTimeout(() => {
        //             window.location.reload();
        //         }, 1500);
        //     }
        // });
        

        // ===== AVATAR UPLOAD =====
        document.getElementById('uploadAvatarBtn')?.addEventListener('click', function () {
            document.getElementById('avatarFileInput').click();
        });

        document.getElementById('avatarFileInput')?.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                document.getElementById('avatarUploadForm').submit();
            }
        });

        // ===== PASSWORD VISIBILITY TOGGLE =====
        document.querySelectorAll('.toggle-password-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(btn.dataset.target);
                const icon = btn.querySelector('i');
                if (target.type === 'password') {
                    target.type = 'text';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    target.type = 'password';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            });
        });

        // ===== TAB SWITCHING =====
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // ===== LOGOUT =====
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('logoutModal').style.display = 'flex';
        });

        document.getElementById('confirmLogout')?.addEventListener('click', () => {
            window.location.href = '../php/logout.php';
        });

        document.getElementById('cancelLogout')?.addEventListener('click', () => {
            document.getElementById('logoutModal').style.display = 'none';
        });

        document.querySelector('.modal-overlay')?.addEventListener('click', () => {
            document.getElementById('logoutModal').style.display = 'none';
        });

        // ===== MOBILE MENU =====
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        document.getElementById('menuToggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
    </script>
</body>
</html>
