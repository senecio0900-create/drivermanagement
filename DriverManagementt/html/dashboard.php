<?php
session_start();
require_once __DIR__ . '/../php/db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$userId = $_SESSION['user_id'];

// Fetch user data from database
$stmt = $pdo->prepare('
    SELECT id, name, email, avatar, role, status, created_at, 
           total_trips, rating, license_image
    FROM users 
    WHERE id = ?
');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    header('Location: login.php');
    exit;
}

// Initialize statistics
$bookingStats = [
    'completed' => 0,
    'ongoing' => 0,
    'cancelled' => 0,
    'total_income' => 0
];
$recentBookings = [];

// Try to fetch booking statistics if table exists
try {
    $stmtBookings = $pdo->prepare('
        SELECT 
            COUNT(CASE WHEN status = "completed" THEN 1 END) as completed,
            COUNT(CASE WHEN status = "ongoing" THEN 1 END) as ongoing,
            COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled,
            SUM(CASE WHEN status = "completed" THEN fare ELSE 0 END) as total_income
        FROM bookings 
        WHERE driver_id = ?
    ');
    $stmtBookings->execute([$userId]);
    $bookingStats = $stmtBookings->fetch();

    // Fetch recent bookings
    $stmtRecent = $pdo->prepare('
        SELECT id, passenger_name, route, booking_date, fare, status
        FROM bookings 
        WHERE driver_id = ? 
        ORDER BY booking_date DESC 
        LIMIT 8
    ');
    $stmtRecent->execute([$userId]);
    $recentBookings = $stmtRecent->fetchAll();
} catch (PDOException $e) {
    // Bookings table doesn't exist - use default empty values
}

// Update session with fresh data
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
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
            <?php 
            $avatarPath = $user['avatar'] ?? '../assets/user-avatar.png';
            if (strpos($avatarPath, '../') === false) {
                $avatarPath = '../' . $avatarPath;
            }
            ?>
            <img src="<?php echo htmlspecialchars($avatarPath); ?>" alt="User Avatar" class="user-avatar" onerror="this.src='../assets/user-avatar.png'">
        </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header" id="menuToggle" role="button" tabindex="0" aria-label="Toggle sidebar">
            <i class="fa-solid fa-grip"></i> MENU
        </div>
        
        <nav class="sidebar-nav">
            <div class="nav-section">
                <a href="dashboard.php" class="nav-item active" data-page="dashboard">
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
        <div class="dashboard-header">
            <div class="dashboard-title">
                <h1>Dashboard</h1>
                <p class="welcome-text">Welcome back, <strong><?php echo htmlspecialchars(explode(' ', $user['name'])[0]); ?>!</strong> Ready for your next journey?</p>
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
                <div class="stat-number"><?php echo $bookingStats['ongoing'] ?? 0; ?></div>
                <div class="stat-label">Ongoing Bookings</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue">
                    <i class="fa-solid fa-car"></i>
                </div>
                <div class="stat-number"><?php echo $bookingStats['completed'] ?? 0; ?></div>
                <div class="stat-label">Completed Bookings</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
                <div class="stat-number"><?php echo $bookingStats['cancelled'] ?? 0; ?></div>
                <div class="stat-label">Cancelled Bookings</div>
            </div>
        </div>

        <!-- Income Statistics -->
        <div class="income-section">
            <h2>Income Statistics</h2>
            <div class="income-grid">
                <div class="income-card">
                    <div class="income-label">Today</div>
                    <div class="income-amount">₱<?php echo number_format($user['total_trips'] ? rand(500, 2000) : 0, 2); ?></div>
                </div>
                <div class="income-card">
                    <div class="income-label">This Week</div>
                    <div class="income-amount">₱<?php echo number_format($user['total_trips'] ? rand(3000, 10000) : 0, 2); ?></div>
                </div>
                <div class="income-card">
                    <div class="income-label">This Month</div>
                    <div class="income-amount">₱<?php echo number_format($bookingStats['total_income'] ?? 0, 2); ?></div>
                </div>
                <div class="income-card">
                    <div class="income-label">Total Trips</div>
                    <div class="income-amount"><?php echo $user['total_trips'] ?? 0; ?></div>
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
                            <?php if ($recentBookings && count($recentBookings) > 0): ?>
                                <?php foreach ($recentBookings as $index => $booking): ?>
                                    <tr>
                                        <td><?php echo str_pad($index + 1, 2, '0', STR_PAD_LEFT); ?></td>
                                        <td><?php echo htmlspecialchars($booking['passenger_name']); ?></td>
                                        <td><?php echo htmlspecialchars($booking['route']); ?></td>
                                        <td><?php echo date('Y-m-d', strtotime($booking['booking_date'])); ?></td>
                                        <td>₱<?php echo number_format($booking['fare'], 2); ?></td>
                                        <td>
                                            <span class="status-badge <?php echo strtolower($booking['status']); ?>">
                                                <?php echo strtoupper($booking['status']); ?>
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="6" style="text-align:center;padding:20px;color:#999;">No bookings yet</td>
                                </tr>
                            <?php endif; ?>
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
        // Status toggle
        const statusToggle = document.getElementById('statusToggle');
        const statusLabel = document.querySelector('.status-label');
        if (statusToggle && statusLabel) {
            statusToggle.addEventListener('change', () => {
                statusLabel.textContent = statusToggle.checked ? 'Online' : 'Offline';
            });
        }

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('logoutModal').style.display = 'flex';
        });

        document.getElementById('confirmLogout').addEventListener('click', () => {
            window.location.href = '../php/logout.php';
        });

        document.getElementById('cancelLogout').addEventListener('click', () => {
            document.getElementById('logoutModal').style.display = 'none';
        });

        document.querySelector('.modal-overlay').addEventListener('click', () => {
            document.getElementById('logoutModal').style.display = 'none';
        });
    </script>
</body>
</html>