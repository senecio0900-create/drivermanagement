<?php
session_start();
require_once __DIR__ . '/../php/db.php';

$error = '';
$alreadyLoggedIn = false;

if (isset($_SESSION['user_id'])) {
    $alreadyLoggedIn = true;
    // Don't redirect, show option to go to dashboard or logout
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Clear any existing session when logging in
    session_destroy();
    session_start();
    
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    if ($email === '' || $password === '') {
        $error = 'Email and password are required.';
    } else {
        try {
            $stmt = $pdo->prepare('SELECT id,name,email,password FROM users WHERE email=? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if (!$user) {
                $error = 'Invalid email or password.';
            } elseif (strlen($user['password']) < 60) {
                $error = 'Password hash invalid/truncated.';
            } elseif (!password_verify($password, $user['password'])) {
                $error = 'Invalid email or password.';
            } else {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['is_logged_in'] = true;
                header('Location: dashboard.php'); exit;
            }
        } catch (Throwable $e) {
            $error = 'Server error.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Journeolink Driver</title>
    <link rel="icon" type="image/png" href="../assets/brand-logo.png">
    <link rel="stylesheet" href="../css/login.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <style>
        .password-wrapper { position:relative; }
        .password-wrapper input { width:100%; padding-right:44px; }
        .toggle-password-btn {
            position:absolute; top:50%; right:10px; transform:translateY(-50%);
            background:none; border:none; cursor:pointer; color:#666; font-size:16px;
            display:flex; align-items:center; justify-content:center; padding:6px;
        }
        .toggle-password-btn:hover { color:#222; }
        .error-box { background:#fee; color:#b22; padding:10px; border:1px solid #fbb; border-radius:6px; margin-bottom:15px; font-size:14px; }
    </style>
</head>
<body>
    <div class="login-left"></div>
    <div class="login-right">
        <div class="login-container">
            <div class="logo-section">
                <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                <div class="brand-text">Journeolink</div>
            </div>

            <h1>JOURNEOLINK DRIVER</h1>
            <p class="subtitle">Sign in with your credentials to access your driver dashboard</p>

            <?php if ($alreadyLoggedIn): ?>
                <div class="info-box" style="background:#e7f3ff;color:#0066cc;padding:12px;border:1px solid #99ccff;border-radius:6px;margin-bottom:15px;">
                    You are already logged in as <strong><?php echo htmlspecialchars($_SESSION['user_name']); ?></strong>.
                    <a href="dashboard.php" style="color:#0066cc;text-decoration:underline;">Go to Dashboard</a> or 
                    <a href="logout.php" style="color:#0066cc;text-decoration:underline;">Logout</a>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="error-box"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form id="loginForm" action="login.php" method="POST" autocomplete="off">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Email" 
                        required
                        value="<?php echo isset($email)? htmlspecialchars($email):''; ?>">
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Password" 
                            required>
                        <button type="button" class="toggle-password-btn" id="togglePassword" aria-label="Show/Hide Password">
                            <i class="fa-solid fa-eye-slash"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-login">LOG IN</button>
            </form>

            <div class="forgot-password">
                <a href="#">Forgot Password?</a>
            </div>
        </div>
    </div>

    <script>
        const toggleBtn = document.getElementById('togglePassword');
        const pwdInput = document.getElementById('password');
        toggleBtn.addEventListener('click', () => {
            const icon = toggleBtn.querySelector('i');
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                icon.classList.replace('fa-eye-slash','fa-eye');
            } else {
                pwdInput.type = 'password';
                icon.classList.replace('fa-eye','fa-eye-slash');
            }
        });
    </script>
</body>
</html>
