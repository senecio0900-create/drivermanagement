<?php
// filepath: c:\Users\mnava\OneDrive\Documents\GitHub\drivermanagement\DriverManagementt\php\generate_hash.php
$password = 'password123';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "<h3>Fresh Password Hash</h3>";
echo "<p><strong>Password:</strong> $password</p>";
echo "<p><strong>Hash:</strong></p>";
echo "<textarea style='width:100%;height:80px;font-family:monospace;'>$hash</textarea>";
echo "<hr>";
echo "<h4>Copy this SQL and run it:</h4>";
echo "<pre style='background:#f0f0f0;padding:10px;'>";
echo "UPDATE users SET password = '$hash' WHERE email = 'test@example.com';";
echo "</pre>";
?>