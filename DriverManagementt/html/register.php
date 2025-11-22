<?php
session_start();
require_once __DIR__ . '/../php/db.php';

// If already logged in, redirect to dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$success = false;
$step = 1; // Track which modal to show

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Determine which form step was submitted
    if (isset($_POST['step'])) {
        $step = (int)$_POST['step'];
    }

    if ($step === 3) { // Final submission from review page
        // Validate required fields
        $required = ['firstName', 'lastName', 'email', 'password', 'contactNumber', 'address', 'birthdate', 'gender', 'licenseNumber', 'licenseExpiry'];
        $allFieldsPresent = true;
        
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                $allFieldsPresent = false;
                $error = "Field '$field' is required";
                break;
            }
        }

        if ($allFieldsPresent) {
            $email = trim($_POST['email']);
            $password = $_POST['password'];
            $confirmPassword = $_POST['confirmPassword'] ?? '';

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $error = 'Invalid email format';
            }
            // Validate password
            elseif (strlen($password) < 8) {
                $error = 'Password must be at least 8 characters';
            }
            elseif ($password !== $confirmPassword) {
                $error = 'Passwords do not match';
            }
            else {
                // Check if email already exists
                try {
                    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
                    $stmt->execute([$email]);
                    if ($stmt->fetch()) {
                        $error = 'Email already registered';
                    }
                    else {
                        // Handle file uploads
                        $uploadDir = __DIR__ . '/../uploads/registration/';
                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0755, true);
                        }

                        $uploadedFiles = [];
                        $fileFields = ['licensePhoto', 'nbiClearance', 'proofOfAddress', 'idPicture'];

                        foreach ($fileFields as $field) {
                            if (isset($_FILES[$field]) && $_FILES[$field]['error'] === UPLOAD_ERR_OK) {
                                $ext = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION);
                                $filename = $field . '_' . time() . '_' . uniqid() . '.' . $ext;
                                $filepath = $uploadDir . $filename;
                                
                                if (move_uploaded_file($_FILES[$field]['tmp_name'], $filepath)) {
                                    $uploadedFiles[$field] = '../uploads/registration/' . $filename;
                                }
                            }
                        }

                        // Hash password
                        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

                        // Build full name
                        $fullName = trim(($_POST['firstName'] ?? '') . ' ' . ($_POST['middleName'] ?? '') . ' ' . ($_POST['lastName'] ?? '') . ' ' . ($_POST['ext'] ?? ''));

                        // Insert into database
                        try {
                            $stmt = $pdo->prepare('
                                INSERT INTO users (
                                    name, first_name, last_name, middle_name, ext,
                                    email, alternative_email, password, 
                                    phone, address, dob, gender,
                                    license_number, expiry_date, license_image,
                                    nbi_clearance, proof_of_address,
                                    avatar, role, status, created_at, member_since
                                ) VALUES (
                                    ?, ?, ?, ?, ?,
                                    ?, ?, ?,
                                    ?, ?, ?, ?,
                                    ?, ?, ?,
                                    ?, ?,
                                    ?, ?, ?, NOW(), CURDATE()
                                )
                            ');
                            
                            $stmt->execute([
                                $fullName,
                                $_POST['firstName'],
                                $_POST['lastName'],
                                $_POST['middleName'] ?? null,
                                $_POST['ext'] ?? null,
                                $email,
                                $_POST['alternativeEmail'] ?? null,
                                $hashedPassword,
                                $_POST['contactNumber'],
                                $_POST['address'],
                                $_POST['birthdate'],
                                $_POST['gender'],
                                $_POST['licenseNumber'],
                                $_POST['licenseExpiry'],
                                $uploadedFiles['licensePhoto'] ?? null,
                                $uploadedFiles['nbiClearance'] ?? null,
                                $uploadedFiles['proofOfAddress'] ?? null,
                                $uploadedFiles['idPicture'] ?? '../assets/user-avatar.png',
                                'driver',
                                'pending'
                            ]);

                            $userId = $pdo->lastInsertId();

                            // Auto-login after registration
                            $_SESSION['user_id'] = $userId;
                            $_SESSION['user_name'] = $fullName;
                            $_SESSION['user_email'] = $email;
                            $_SESSION['is_logged_in'] = true;

                            $success = true;

                        } catch (PDOException $e) {
                            // Cleanup uploaded files if database insert fails
                            foreach ($uploadedFiles as $file) {
                                if (file_exists($file)) {
                                    unlink($file);
                                }
                            }
                            $error = 'Registration failed: ' . $e->getMessage();
                        }
                    }
                } catch (PDOException $e) {
                    $error = 'Database error';
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create an Account - Journeolink</title>
    <link rel="icon" type="image/png" href="../assets/brand-logo.png">
    <link rel="stylesheet" href="../css/register.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <style>
        .password-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .password-wrapper input {
            width: 100%;
            padding-right: 45px;
        }
        .toggle-password-btn {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-size: 16px;
            padding: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .toggle-password-btn:hover {
            color: #222;
        }
    </style>
</head>
<body>
    <!-- Left Side - Form -->
    <div class="register-left">
        <div class="logo-section">
            <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
            <div class="brand-text">Journeolink</div>
        </div>

        <div class="form-container">
            <h1>Create an Account</h1>
            <p class="subtitle">Set up your user account to get started with Journeolink.</p>

            <?php if ($error && $step === 1): ?>
                <div style="background:#fee;color:#b22;padding:10px;border:1px solid #fbb;border-radius:6px;margin-bottom:15px;">
                    <?php echo htmlspecialchars($error); ?>
                </div>
            <?php endif; ?>

            <form id="registerForm" onsubmit="return false;">
                <!-- Remove method="POST" and add onsubmit="return false;" to prevent actual form submission -->
                <input type="hidden" name="step" value="1">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input 
                            type="text" 
                            id="firstName" 
                            name="firstName" 
                            placeholder="First Name" 
                            required
                            minlength="2"
                            maxlength="50"
                            value="<?php echo htmlspecialchars($_POST['firstName'] ?? ''); ?>">
                    </div>

                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input 
                            type="text" 
                            id="lastName" 
                            name="lastName" 
                            placeholder="Last Name" 
                            required
                            minlength="2"
                            maxlength="50"
                            value="<?php echo htmlspecialchars($_POST['lastName'] ?? ''); ?>">
                    </div>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Email" 
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>">
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Password" 
                            required
                            minlength="8">
                        <button type="button" class="toggle-password-btn" data-target="password">
                            <i class="fa-solid fa-eye-slash"></i>
                        </button>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <div class="password-wrapper">
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            placeholder="Confirm Password" 
                            required
                            minlength="8">
                        <button type="button" class="toggle-password-btn" data-target="confirmPassword">
                            <i class="fa-solid fa-eye-slash"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-register">
                    Sign Up
                </button>
            </form>

            <div class="login-link">
                Already have an account? <a href="login.php">Log in</a>
            </div>
        </div>
    </div>

    <!-- Right Side - Image -->
    <div class="register-right"></div>

    <!-- Personal Information Modal -->
    <div id="personalInfoModal" class="modal">
        <div class="modal-content">
            <div class="modal-left">
                <div class="logo-section">
                    <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                    <div class="brand-text">Journeolink</div>
                </div>

                <div class="form-container">
                    <h1>Personal Information</h1>
                    <p class="subtitle">Fill in your accurate and valid details to ensure a smooth onboarding experience.</p>

                    <form id="personalInfoForm" method="POST">
                        <input type="hidden" name="step" value="2">
                        <!-- Preserve previous form data -->
                        <input type="hidden" name="firstName" id="hidden-firstName">
                        <input type="hidden" name="email" id="hidden-email">
                        <input type="hidden" name="password" id="hidden-password">
                        <input type="hidden" name="confirmPassword" id="hidden-confirmPassword">

                        <!-- Name Section -->
                        <div class="form-section">
                            <label class="section-label">Name</label>
                            <div class="name-row">
                                <div class="form-group">
                                    <label for="lastNameFull">Last Name</label>
                                    <input 
                                        type="text" 
                                        id="lastNameFull" 
                                        name="lastName" 
                                        placeholder="Last name" 
                                        required>
                                </div>
                                <div class="form-group">
                                    <label for="firstNameFull">First Name</label>
                                    <input 
                                        type="text" 
                                        id="firstNameFull" 
                                        name="firstNameFull" 
                                        placeholder="First Name" 
                                        required>
                                </div>
                                <div class="form-group">
                                    <label for="middleName">Middle Name</label>
                                    <input 
                                        type="text" 
                                        id="middleName" 
                                        name="middleName" 
                                        placeholder="Middle Name">
                                </div>
                                <div class="form-group ext-group">
                                    <label for="ext">Ext.</label>
                                    <input 
                                        type="text" 
                                        id="ext" 
                                        name="ext" 
                                        placeholder="Ext">
                                </div>
                            </div>
                        </div>

                        <!-- Birthdate and Gender -->
                        <div class="form-row-half">
                            <div class="form-group">
                                <label for="birthdate">Birthdate</label>
                                <input 
                                    type="date" 
                                    id="birthdate" 
                                    name="birthdate" 
                                    placeholder="Birthdate" 
                                    required>
                            </div>
                            <div class="form-group">
                                <label for="gender">Gender</label>
                                <select id="gender" name="gender" required>
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <!-- Address -->
                        <div class="form-group">
                            <label for="address">Address</label>
                            <p class="field-description">Please provide your current address (must match with your Proof of Address document).</p>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                placeholder="Current Address" 
                                required>
                        </div>

                        <!-- Contact Number and Alternative Email -->
                        <div class="form-row-half">
                            <div class="form-group">
                                <label for="contactNumber">Contact Number</label>
                                <p class="field-description">Your contact number must be active.</p>
                                <input 
                                    type="tel" 
                                    id="contactNumber" 
                                    name="contactNumber" 
                                    placeholder="Contact Number" 
                                    required>
                            </div>
                            <div class="form-group">
                                <label for="alternativeEmail">Alternative Email</label>
                                <p class="field-description">Your alternative email must be active.</p>
                                <input 
                                    type="email" 
                                    id="alternativeEmail" 
                                    name="alternativeEmail" 
                                    placeholder="Alternative email">
                            </div>
                        </div>

                        <button type="submit" class="btn-next">
                            Next
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            <div class="modal-right"></div>
        </div>
    </div>

    <!-- Upload Documents Modal -->
    <div id="uploadDocumentsModal" class="modal">
        <div class="modal-content">
            <div class="modal-left">
                <div class="logo-section">
                    <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                    <div class="brand-text">Journeolink</div>
                </div>

                <div class="form-container">
                    <h1>Almost Done - Upload Your Files</h1>
                    <p class="subtitle">Submit your driver's license and supporting documents for verification.</p>

                    <form id="uploadDocumentsForm" method="POST">
                        <input type="hidden" name="step" value="3">
                        <!-- Hidden fields to preserve all previous data -->
                        <input type="hidden" name="firstName" id="hidden-firstName2">
                        <input type="hidden" name="lastName" id="hidden-lastName2">
                        <input type="hidden" name="email" id="hidden-email2">
                        <input type="hidden" name="password" id="hidden-password2">
                        <input type="hidden" name="confirmPassword" id="hidden-confirmPassword2">
                        <input type="hidden" name="middleName" id="hidden-middleName">
                        <input type="hidden" name="ext" id="hidden-ext">
                        <input type="hidden" name="birthdate" id="hidden-birthdate">
                        <input type="hidden" name="gender" id="hidden-gender">
                        <input type="hidden" name="address" id="hidden-address">
                        <input type="hidden" name="contactNumber" id="hidden-contactNumber">
                        <input type="hidden" name="alternativeEmail" id="hidden-alternativeEmail">

                        <!-- License Section -->
                        <div class="form-section">
                            <label class="section-label">License</label>
                            <div class="form-row-half">
                                <div class="form-group">
                                    <label for="licenseNumber">License Number</label>
                                    <input 
                                        type="text" 
                                        id="licenseNumber" 
                                        name="licenseNumber" 
                                        placeholder="License Number" 
                                        required>
                                </div>
                                <div class="form-group">
                                    <label for="licenseExpiry">License Expiry Date</label>
                                    <input 
                                        type="date" 
                                        id="licenseExpiry" 
                                        name="licenseExpiry" 
                                        placeholder="License Expiry Date" 
                                        required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="licensePhoto">License Photo (Provide a valid driver's license photo for verification.)</label>
                                <div class="file-upload-wrapper">
                                    <input 
                                        type="file" 
                                        id="licensePhoto" 
                                        name="licensePhoto" 
                                        accept="image/*,.pdf"
                                        required>
                                    <label for="licensePhoto" class="file-upload-label">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        <span class="file-name">License Photo</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- NBI Clearance Photo -->
                        <div class="form-group">
                            <label for="nbiClearance" class="section-label">NBI Clearance Photo</label>
                            <div class="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    id="nbiClearance" 
                                    name="nbiClearance" 
                                    accept="image/*,.pdf"
                                    required>
                                <label for="nbiClearance" class="file-upload-label">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span class="file-name">NBI Clearance</span>
                                </label>
                            </div>
                        </div>

                        <!-- Proof of Address -->
                        <div class="form-group">
                            <label for="proofOfAddress" class="section-label">Proof of Address <span class="label-note">(Must match with the current address you provided).</span></label>
                            <div class="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    id="proofOfAddress" 
                                    name="proofOfAddress" 
                                    accept="image/*,.pdf"
                                    required>
                                <label for="proofOfAddress" class="file-upload-label">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span class="file-name">Proof of Address</span>
                                </label>
                            </div>
                        </div>

                        <!-- 2x2 ID Picture -->
                        <div class="form-group">
                            <label for="idPicture" class="section-label">2x2 ID Picture <span class="label-note">(Make sure your face is clearly visible, with no filters or accessories, on a plain white background).</span></label>
                            <div class="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    id="idPicture" 
                                    name="idPicture" 
                                    accept="image/*"
                                    required>
                                <label for="idPicture" class="file-upload-label">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    <span class="file-name">2×2 ID Picture</span>
                                </label>
                            </div>
                        </div>

                        <!-- Terms and Conditions -->
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    id="termsAccept" 
                                    name="termsAccept" 
                                    required>
                                <span class="checkbox-text">I accept the <a href="#" class="terms-link">Terms and Conditions</a> and consent to the use of my data for verification purposes.</span>
                            </label>
                        </div>

                        <!-- Buttons -->
                        <div class="form-buttons">
                            <button type="button" class="btn-back" id="backToPersonalInfo">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Back
                            </button>
                            <button type="submit" class="btn-next">
                                Next
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="modal-right"></div>
        </div>
    </div>

    <!-- Review Application Modal -->
    <div id="reviewApplicationModal" class="modal">
        <div class="modal-content">
            <div class="modal-left">
                <div class="logo-section">
                    <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                    <div class="brand-text">Journeolink</div>
                </div>

                <div class="form-container">
                    <h1>One Last Step - Review Your Application</h1>
                    <p class="subtitle">Make sure your information is correct. You won't be able to edit after submission.</p>

                    <?php if ($error && $step === 3): ?>
                        <div style="background:#fee;color:#b22;padding:10px;border:1px solid #fbb;border-radius:6px;margin-bottom:15px;">
                            <?php echo htmlspecialchars($error); ?>
                        </div>
                    <?php endif; ?>

                    <form id="reviewApplicationForm" method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="step" value="3">
                        
                        <!-- All form data as hidden fields will be added by JavaScript -->
                        
                        <!-- Name Section -->
                        <div class="review-section">
                            <label class="section-label">Name</label>
                            <div class="name-row">
                                <div class="form-group">
                                    <label>Last Name</label>
                                    <input type="text" id="review-lastName" name="lastName" readonly>
                                </div>
                                <div class="form-group">
                                    <label>First Name</label>
                                    <input type="text" id="review-firstName" name="firstName" readonly>
                                </div>
                                <div class="form-group">
                                    <label>Middle Name</label>
                                    <input type="text" id="review-middleName" name="middleName" readonly>
                                </div>
                                <div class="form-group ext-group">
                                    <label>Ext.</label>
                                    <input type="text" id="review-ext" name="ext" readonly>
                                </div>
                            </div>
                        </div>

                        <!-- Birthdate and Gender -->
                        <div class="form-row-half">
                            <div class="form-group">
                                <label>Birthdate</label>
                                <input type="text" id="review-birthdate" name="birthdate" readonly>
                            </div>
                            <div class="form-group">
                                <label>Gender</label>
                                <input type="text" id="review-gender" name="gender" readonly>
                            </div>
                        </div>

                        <!-- Address -->
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" id="review-address" name="address" readonly>
                        </div>

                        <!-- Contact Number and Alternative Email -->
                        <div class="form-row-half">
                            <div class="form-group">
                                <label>Contact Number</label>
                                <input type="text" id="review-contactNumber" name="contactNumber" readonly>
                            </div>
                            <div class="form-group">
                                <label>Alternative Email</label>
                                <input type="text" id="review-alternativeEmail" name="alternativeEmail" readonly>
                            </div>
                        </div>

                        <!-- License Section -->
                        <div class="review-section">
                            <label class="section-label">License</label>
                            <div class="license-row">
                                <div class="form-group">
                                    <label>License Number</label>
                                    <input type="text" id="review-licenseNumber" name="licenseNumber" readonly>
                                </div>
                                <div class="form-group">
                                    <label>License Expiry Date</label>
                                    <input type="text" id="review-licenseExpiry" name="licenseExpiry" readonly>
                                </div>
                                <div class="form-group">
                                    <label>License Photo</label>
                                    <input type="text" id="review-licensePhoto" readonly>
                                </div>
                            </div>
                        </div>

                        <!-- Documents -->
                        <div class="documents-row">
                            <div class="form-group">
                                <label>NBI Clearance Photo</label>
                                <input type="text" id="review-nbiClearance" readonly>
                            </div>
                            <div class="form-group">
                                <label>Proof of Address</label>
                                <input type="text" id="review-proofOfAddress" readonly>
                            </div>
                            <div class="form-group">
                                <label>2x2 ID Picture</label>
                                <input type="text" id="review-idPicture" readonly>
                            </div>
                        </div>

                        <!-- Hidden password fields -->
                        <input type="hidden" name="password" id="review-password">
                        <input type="hidden" name="confirmPassword" id="review-confirmPassword">
                        <input type="hidden" name="email" id="review-email">

                        <!-- Terms Confirmation -->
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="review-termsAccept" checked disabled>
                                <span class="checkbox-text">I accept the <a href="#" class="terms-link">Terms and Conditions</a> and consent to the use of my data for verification purposes.</span>
                            </label>
                        </div>

                        <!-- Buttons -->
                        <div class="form-buttons">
                            <button type="button" class="btn-back" id="backToUpload">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                Back
                            </button>
                            <button type="submit" class="btn-submit">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="modal-right"></div>
        </div>
    </div>

    <!-- Registration Success Modal -->
    <div id="registrationSuccessModal" class="modal <?php echo $success ? 'active' : ''; ?>">
        <div class="modal-content">
            <div class="modal-left success-modal-left">
                <div class="logo-section-center">
                    <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                    <div class="brand-text">Journeolink</div>
                </div>

                <div class="success-content">
                    <h1 class="success-title">Great Job! Your Application Is In <span class="emoji-icon">🥳</span></h1>
                    <p class="success-message">
                        You are one step away from becoming a Journeolink Driver-Partner! Our team 
                        will review your details and notify you once verification is complete 
                        via email or your dashboard.
                    </p>
                    <div class="success-buttons">
                        <a href="index.html" class="btn-home">Go Home</a>
                        <a href="dashboard.php" class="btn-dashboard">Proceed to Dashboard</a>
                    </div>
                </div>
            </div>

            <div class="modal-right"></div>
        </div>
    </div>

    <!-- Registration Error Modal -->
    <div id="registrationErrorModal" class="modal <?php echo ($error && $step === 3) ? 'active' : ''; ?>">
        <div class="modal-content">
            <div class="modal-left error-modal-left">
                <div class="logo-section">
                    <img src="../assets/brand-logo.png" alt="Journeolink Logo" class="logo">
                    <div class="brand-text">Journeolink</div>
                </div>

                <div class="error-content">
                    <h1 class="error-title">Oops! Something went wrong...</h1>
                    <p class="error-code">ERROR - REGISTRATION FAILED</p>
                    <p class="error-message">
                        <?php echo $error ? htmlspecialchars($error) : 'We encountered an unexpected problem. Please try again.'; ?>
                    </p>
                    <button onclick="location.reload()" class="btn-home-error">Try Again</button>
                </div>
            </div>

            <div class="modal-right"></div>
        </div>
    </div>

       <script src="../js/register.js"></script>
    <script>
        let formData = {};

        // Step 1: Initial Registration Form
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirmPassword').value
            };

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (formData.password.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }

            // Show Personal Info Modal
            document.getElementById('personalInfoModal').style.display = 'flex';
        });

        // Step 2: Personal Information Form
        document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
            e.preventDefault();

            formData.lastName = document.getElementById('lastNameFull').value;
            formData.firstName = document.getElementById('firstNameFull').value;
            formData.middleName = document.getElementById('middleName').value;
            formData.ext = document.getElementById('ext').value;
            formData.birthdate = document.getElementById('birthdate').value;
            formData.gender = document.getElementById('gender').value;
            formData.address = document.getElementById('address').value;
            formData.contactNumber = document.getElementById('contactNumber').value;
            formData.alternativeEmail = document.getElementById('alternativeEmail').value;

            // Close personal info modal
            document.getElementById('personalInfoModal').style.display = 'none';

            // Show upload documents modal
            document.getElementById('uploadDocumentsModal').style.display = 'flex';
        });

        // Step 3: Upload Documents Form
        document.getElementById('uploadDocumentsForm').addEventListener('submit', function(e) {
            e.preventDefault();

            formData.licenseNumber = document.getElementById('licenseNumber').value;
            formData.licenseExpiry = document.getElementById('licenseExpiry').value;
            formData.licensePhoto = document.getElementById('licensePhoto').files[0];
            formData.nbiClearance = document.getElementById('nbiClearance').files[0];
            formData.proofOfAddress = document.getElementById('proofOfAddress').files[0];
            formData.idPicture = document.getElementById('idPicture').files[0];
            formData.termsAccept = document.getElementById('termsAccept').checked;

            // Validate files
            if (!formData.licensePhoto || !formData.nbiClearance || !formData.proofOfAddress || !formData.idPicture) {
                alert('All documents are required');
                return;
            }

            if (!formData.termsAccept) {
                alert('You must accept the terms and conditions');
                return;
            }

            // Show review modal
            populateReviewModal();
            document.getElementById('uploadDocumentsModal').style.display = 'none';
            document.getElementById('reviewApplicationModal').style.display = 'flex';
        });

        // Populate review modal
        function populateReviewModal() {
            document.getElementById('review-lastName').value = formData.lastName;
            document.getElementById('review-firstName').value = formData.firstName;
            document.getElementById('review-middleName').value = formData.middleName;
            document.getElementById('review-ext').value = formData.ext;
            document.getElementById('review-birthdate').value = formData.birthdate;
            document.getElementById('review-gender').value = formData.gender;
            document.getElementById('review-address').value = formData.address;
            document.getElementById('review-contactNumber').value = formData.contactNumber;
            document.getElementById('review-alternativeEmail').value = formData.alternativeEmail;
            document.getElementById('review-licenseNumber').value = formData.licenseNumber;
            document.getElementById('review-licenseExpiry').value = formData.licenseExpiry;
            document.getElementById('review-licensePhoto').value = formData.licensePhoto?.name || '';
            document.getElementById('review-nbiClearance').value = formData.nbiClearance?.name || '';
            document.getElementById('review-proofOfAddress').value = formData.proofOfAddress?.name || '';
            document.getElementById('review-idPicture').value = formData.idPicture?.name || '';
            document.getElementById('review-password').value = formData.password;
            document.getElementById('review-confirmPassword').value = formData.confirmPassword;
            document.getElementById('review-email').value = formData.email;
        }

        // Step 4: Final Submission
        document.getElementById('reviewApplicationForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // Create FormData for file upload
            const finalForm = new FormData();
            finalForm.append('step', '3');
            finalForm.append('firstName', formData.firstName);
            finalForm.append('lastName', formData.lastName);
            finalForm.append('middleName', formData.middleName);
            finalForm.append('ext', formData.ext);
            finalForm.append('email', formData.email);
            finalForm.append('password', formData.password);
            finalForm.append('confirmPassword', formData.confirmPassword);
            finalForm.append('birthdate', formData.birthdate);
            finalForm.append('gender', formData.gender);
            finalForm.append('address', formData.address);
            finalForm.append('contactNumber', formData.contactNumber);
            finalForm.append('alternativeEmail', formData.alternativeEmail);
            finalForm.append('licenseNumber', formData.licenseNumber);
            finalForm.append('licenseExpiry', formData.licenseExpiry);
            
            // Append files
            if (formData.licensePhoto) finalForm.append('licensePhoto', formData.licensePhoto);
            if (formData.nbiClearance) finalForm.append('nbiClearance', formData.nbiClearance);
            if (formData.proofOfAddress) finalForm.append('proofOfAddress', formData.proofOfAddress);
            if (formData.idPicture) finalForm.append('idPicture', formData.idPicture);

            // Submit using fetch
            fetch(window.location.href, {
                method: 'POST',
                body: finalForm
            })
            .then(response => response.text())
            .then(html => {
                // Check if registration was successful
                if (html.includes('registrationSuccessModal') && html.includes('active')) {
                    document.getElementById('reviewApplicationModal').style.display = 'none';
                    document.getElementById('registrationSuccessModal').style.display = 'flex';
                    setTimeout(() => {
                        window.location.href = 'dashboard.php';
                    }, 3000);
                } else if (html.includes('registrationErrorModal') && html.includes('active')) {
                    document.getElementById('reviewApplicationModal').style.display = 'none';
                    document.getElementById('registrationErrorModal').style.display = 'flex';
                } else {
                    alert('Registration failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });

        // Back buttons
        document.getElementById('backToPersonalInfo')?.addEventListener('click', () => {
            document.getElementById('uploadDocumentsModal').style.display = 'none';
            document.getElementById('personalInfoModal').style.display = 'flex';
        });

        document.getElementById('backToUpload')?.addEventListener('click', () => {
            document.getElementById('reviewApplicationModal').style.display = 'none';
            document.getElementById('uploadDocumentsModal').style.display = 'flex';
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                }
            });
        });
    </script>
</body>

</body>
</html>
