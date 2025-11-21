// Modal elements
const personalInfoModal = document.getElementById('personalInfoModal');
const uploadDocumentsModal = document.getElementById('uploadDocumentsModal');
const reviewApplicationModal = document.getElementById('reviewApplicationModal');
const registrationSuccessModal = document.getElementById('registrationSuccessModal');
const registrationErrorModal = document.getElementById('registrationErrorModal');

// Form data storage
let registrationData = {
    account: {},
    personal: {},
    documents: {}
};

// Step 1: Initial Registration Form
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Validate password length
    if (password.length < 8) {
        alert('Password must be at least 8 characters!');
        return;
    }

    // Store account data
    registrationData.account = {
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    };

    // Populate hidden fields in personal info modal
    document.getElementById('hidden-firstName').value = firstName;
    document.getElementById('hidden-email').value = email;
    document.getElementById('hidden-password').value = password;
    document.getElementById('hidden-confirmPassword').value = confirmPassword;

    // Show personal info modal
    document.getElementById('personalInfoModal').classList.add('active');
});

// Step 2: Personal Information Form
document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect personal info
    registrationData.personal = {
        lastName: document.getElementById('lastNameFull').value.trim(),
        firstName: document.getElementById('firstNameFull').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        ext: document.getElementById('ext').value.trim(),
        birthdate: document.getElementById('birthdate').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        alternativeEmail: document.getElementById('alternativeEmail').value.trim()
    };

    // Populate hidden fields in upload modal
    document.getElementById('hidden-firstName2').value = registrationData.account.firstName;
    document.getElementById('hidden-lastName2').value = registrationData.personal.lastName;
    document.getElementById('hidden-email2').value = registrationData.account.email;
    document.getElementById('hidden-password2').value = registrationData.account.password;
    document.getElementById('hidden-confirmPassword2').value = registrationData.account.confirmPassword;
    document.getElementById('hidden-middleName').value = registrationData.personal.middleName;
    document.getElementById('hidden-ext').value = registrationData.personal.ext;
    document.getElementById('hidden-birthdate').value = registrationData.personal.birthdate;
    document.getElementById('hidden-gender').value = registrationData.personal.gender;
    document.getElementById('hidden-address').value = registrationData.personal.address;
    document.getElementById('hidden-contactNumber').value = registrationData.personal.contactNumber;
    document.getElementById('hidden-alternativeEmail').value = registrationData.personal.alternativeEmail;

    // Hide personal info, show documents
    document.getElementById('personalInfoModal').classList.remove('active');
    document.getElementById('uploadDocumentsModal').classList.add('active');
});

// Step 3: Upload Documents Form
document.getElementById('uploadDocumentsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect document info
    registrationData.documents = {
        licenseNumber: document.getElementById('licenseNumber').value.trim(),
        licenseExpiry: document.getElementById('licenseExpiry').value,
        licensePhoto: document.getElementById('licensePhoto').files[0],
        nbiClearance: document.getElementById('nbiClearance').files[0],
        proofOfAddress: document.getElementById('proofOfAddress').files[0],
        idPicture: document.getElementById('idPicture').files[0],
        termsAccept: document.getElementById('termsAccept').checked
    };

    // Populate review form
    populateReviewForm();

    // Hide documents, show review
    document.getElementById('uploadDocumentsModal').classList.remove('active');
    document.getElementById('reviewApplicationModal').classList.add('active');
});

// Populate review form with collected data
function populateReviewForm() {
    // Name
    document.getElementById('review-lastName').value = registrationData.personal.lastName;
    document.getElementById('review-firstName').value = registrationData.personal.firstName || registrationData.account.firstName;
    document.getElementById('review-middleName').value = registrationData.personal.middleName;
    document.getElementById('review-ext').value = registrationData.personal.ext;

    // Personal info
    document.getElementById('review-birthdate').value = registrationData.personal.birthdate;
    document.getElementById('review-gender').value = registrationData.personal.gender;
    document.getElementById('review-address').value = registrationData.personal.address;
    document.getElementById('review-contactNumber').value = registrationData.personal.contactNumber;
    document.getElementById('review-alternativeEmail').value = registrationData.personal.alternativeEmail;

    // License
    document.getElementById('review-licenseNumber').value = registrationData.documents.licenseNumber;
    document.getElementById('review-licenseExpiry').value = registrationData.documents.licenseExpiry;
    document.getElementById('review-licensePhoto').value = registrationData.documents.licensePhoto?.name || '';

    // Documents
    document.getElementById('review-nbiClearance').value = registrationData.documents.nbiClearance?.name || '';
    document.getElementById('review-proofOfAddress').value = registrationData.documents.proofOfAddress?.name || '';
    document.getElementById('review-idPicture').value = registrationData.documents.idPicture?.name || '';

    // Hidden fields for submission
    document.getElementById('review-password').value = registrationData.account.password;
    document.getElementById('review-confirmPassword').value = registrationData.account.confirmPassword;
    document.getElementById('review-email').value = registrationData.account.email;
}

// Step 4: Final submission from review
document.getElementById('reviewApplicationForm').addEventListener('submit', function(e) {
    // Let the form submit normally to PHP with all the data
    // The form already has method="POST" and enctype="multipart/form-data"
    console.log('Submitting registration...');
});

// Back buttons
document.getElementById('backToPersonalInfo')?.addEventListener('click', () => {
    document.getElementById('uploadDocumentsModal').classList.remove('active');
    document.getElementById('personalInfoModal').classList.add('active');
});

document.getElementById('backToUpload')?.addEventListener('click', () => {
    document.getElementById('reviewApplicationModal').classList.remove('active');
    document.getElementById('uploadDocumentsModal').classList.add('active');
});

// File input preview
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        const label = this.nextElementSibling;
        const fileNameSpan = label?.querySelector('.file-name');
        if (fileNameSpan && this.files.length > 0) {
            fileNameSpan.textContent = this.files[0].name;
            label.classList.add('file-selected');
        }
    });
});
