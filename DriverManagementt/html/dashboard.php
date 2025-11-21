<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
$name  = $_SESSION['user_name'] ?? 'Driver';
$email = $_SESSION['user_email'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JourneoLink Driver Dashboard</title>
    <link rel="icon" type="image/png" href="../assets/logo.png">
    <link rel="stylesheet" href="../css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
</head>
<body data-page="dashboard">
    <!-- Header -->
         <!-- hakdog -->

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
                <span class="user-name"><?php echo htmlspecialchars($name); ?></span>
                <span class="user-email"><?php echo htmlspecialchars($email); ?></span>
            </div>
            <img src="../assets/user-avatar.png" alt="User Avatar" class="user-avatar">
        </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
    
    <div class="sidebar-header" id="menuToggle" role="button" tabindex="0" aria-label="Toggle sidebar">
        <i class="fa-solid fa-grip"></i> MENU
    </div>
    
    <nav class="sidebar-nav">
        <div class="nav-section">
            <a href="dashboard.html" class="nav-item" data-page="dashboard">
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
            <a href="profile.html" class="nav-item" data-page="profile">
                <span class="icon"><i class="fa-solid fa-user"></i></span>
                <span class="nav-text">Profile</span>
            </a>
            <a href="" class="nav-item" id="logoutBtn">
                <span class="icon"><i class="fa-solid fa-arrow-right-from-bracket"></i></span>
                <span class="nav-text">Logout</span>
            </a>
        </div>
    </nav>
</aside>

    <!-- Main Content -->
    <main class="main-content" id="mainContent">
        <div class="dashboard-header">
            <div class="dashboard-title">
                <h1>Dashboard</h1>
                <p class="welcome-text">Welcome back, <strong><?php echo htmlspecialchars(explode(' ', $name)[0]); ?>!</strong> Ready for your next journey?</p>
            </div>
            <div class="status-toggle">
                <span class="status-label">Offline</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="statusToggle">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

    <!-- Statistics Cards -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-icon green">
            <i class="fa-solid fa-calendar-check"></i>
        </div>
        <div class="stat-number">1</div>
        <div class="stat-label">Ongoing Bookings</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon blue">
            <i class="fa-solid fa-car"></i>
        </div>
        <div class="stat-number">36</div>
        <div class="stat-label">Completed Bookings</div>
    </div>
    <div class="stat-card">
        <div class="stat-icon red">
            <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <div class="stat-number">2</div>
        <div class="stat-label">Cancelled Bookings</div>
    </div>
</div>

        <!-- Income Statistics -->
        <div class="income-section">
            <h2>Income Statistics</h2>
            <div class="income-grid">
                <div class="income-card">
                    <div class="income-label">Today</div>
                    <div class="income-amount">₱1,500</div>
                </div>
                <div class="income-card">
                    <div class="income-label">This Week</div>
                    <div class="income-amount">₱7,500</div>
                </div>
                <div class="income-card">
                    <div class="income-label">This Month</div>
                    <div class="income-amount">₱29,215</div>
                </div>
                <div class="income-card">
                    <div class="income-label">Daily Average</div>
                    <div class="income-amount">₱1,100</div>
                </div>
            </div>
        </div>

        <!-- Booking History -->
        <div class="booking-section">
            <h2>Booking History</h2>
            <div class="table-wrapper">
                <div class="table-container">
                    <table class="booking-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>PASSENGER</th>
                                <th>ROUTE</th>
                                <th>DATE</th>
                                <th>FARE</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>01</td>
                                <td>Juan Dela Cruz</td>
                                <td>SM North to QC Circle</td>
                                <td>2025-01-15</td>
                                <td>₱230</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                            <tr>
                                <td>02</td>
                                <td>Juan Dela Cruz</td>
                                <td>SM Fairview to Ninoy Aquino Parks</td>
                                <td>2025-01-15</td>
                                <td>₱230</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                            <tr>
                                <td>03</td>
                                <td>Juan Dela Cruz</td>
                                <td>QC Circle to SM Novaliches</td>
                                <td>2025-01-15</td>
                                <td>₱230</td>
                                <td><span class="status-badge cancelled">CANCELLED</span></td>
                            </tr>
                            <tr>
                                <td>03</td>
                                <td>Juan Dela Cruz</td>
                                <td>QC Circle to SM Novaliches</td>
                                <td>2025-01-15</td>
                                <td>₱230</td>
                                <td><span class="status-badge cancelled">CANCELLED</span></td>
                            </tr>
                            <tr>
                                <td>04</td>
                                <td>Maria Santos</td>
                                <td>Cubao to Eastwood</td>
                                <td>2025-01-14</td>
                                <td>₱180</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                            <tr>
                                <td>05</td>
                                <td>Pedro Reyes</td>
                                <td>Fairview to Commonwealth</td>
                                <td>2025-01-14</td>
                                <td>₱150</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                            <tr>
                                <td>06</td>
                                <td>Ana Garcia</td>
                                <td>Novaliches to Munoz</td>
                                <td>2025-01-13</td>
                                <td>₱200</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                            <tr>
                                <td>07</td>
                                <td>Carlos Ramos</td>
                                <td>Baguio to Manila</td>
                                <td>2025-01-12</td>
                                <td>₱450</td>
                                <td><span class="status-badge completed">COMPLETED</span></td>
                            </tr>
                        </tbody>
                    </table>
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

    <script src="../js/layout.js"></script>
    <script>
      // Optional: dashboard-specific status toggle
      (function(){
        const statusToggle = document.getElementById('statusToggle');
        const statusLabel = document.querySelector('.status-label');
        if (statusToggle && statusLabel) {
          statusToggle.addEventListener('change', () => {
              statusLabel.textContent = statusToggle.checked ? 'Online' : 'Offline';
          });
        }
      })();
    </script>
</body>
</html>