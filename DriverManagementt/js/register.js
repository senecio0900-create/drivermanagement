// Store user data across steps
let registrationData = {};

// Step 1: Initial Registration Form
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        alert('Password must be at least 8 characters long!');
        return;
    }
    
    // Store step 1 data
    registrationData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    // Pre-fill first name and last name in personal info form
    document.getElementById('firstNameFull').value = firstName;
    document.getElementById('lastName').value = lastName;
    
    // Show personal information modal
    showModal();
});

// Step 2: Personal Information Form
document.getElementById('personalInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const personalInfo = {
        lastName: document.getElementById('lastName').value.trim(),
        firstName: document.getElementById('firstNameFull').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        ext: document.getElementById('ext').value.trim(),
        birthdate: document.getElementById('birthdate').value,
        gender: document.getElementById('gender').value,
        address: document.getElementById('address').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        alternativeEmail: document.getElementById('alternativeEmail').value.trim()
    };
    
    // Validate required fields
    if (!personalInfo.lastName || !personalInfo.firstName || !personalInfo.birthdate || 
        !personalInfo.gender || !personalInfo.address || !personalInfo.contactNumber) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Store personal info in registration data
    registrationData.personalInfo = personalInfo;
    
    // Move to upload documents step
    hideModal('personalInfoModal');
    showModal('uploadDocumentsModal');
});

// Step 3: Upload Documents Form
document.getElementById('uploadDocumentsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if all files are uploaded
    const licensePhoto = document.getElementById('licensePhoto').files[0];
    const nbiClearance = document.getElementById('nbiClearance').files[0];
    const proofOfAddress = document.getElementById('proofOfAddress').files[0];
    const idPicture = document.getElementById('idPicture').files[0];
    const termsAccepted = document.getElementById('termsAccept').checked;
    
    if (!licensePhoto || !nbiClearance || !proofOfAddress || !idPicture) {
        alert('Please upload all required documents!');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms and Conditions to continue!');
        return;
    }
    
    const documents = {
        licenseNumber: document.getElementById('licenseNumber').value.trim(),
        licenseExpiry: document.getElementById('licenseExpiry').value,
        licensePhoto: licensePhoto.name,
        nbiClearance: nbiClearance.name,
        proofOfAddress: proofOfAddress.name,
        idPicture: idPicture.name,
        termsAccepted: termsAccepted
    };
    
    // Merge all registration data
    const completeUserData = {
        ...registrationData,
        documents: documents,
        registrationCompleted: new Date().toISOString()
    };
    
    console.log('Complete user data ready for database:', completeUserData);
    
    // Here you would send the complete data to your backend with FormData
    // Example:
    // const formData = new FormData();
    // formData.append('userData', JSON.stringify(registrationData));
    // formData.append('licensePhoto', licensePhoto);
    // formData.append('nbiClearance', nbiClearance);
    // formData.append('proofOfAddress', proofOfAddress);
    // formData.append('idPicture', idPicture);
    // 
    // fetch('/api/register/complete', {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         alert('Registration successful!');
    //         window.location.href = 'login.html';
    //     }
    // })
    // .catch(error => {
    //     alert('Registration failed. Please try again.');
    //     console.error('Error:', error);
    // });
    
    // Store documents data
    registrationData.documents = documents;
    
    // Move to review step
    populateReviewForm();
    hideModal('uploadDocumentsModal');
    showModal('reviewApplicationModal');
});

// Step 4: Review and Submit
document.getElementById('reviewApplicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all required data is present
    const validationResult = validateCompleteRegistration();
    
    if (!validationResult.isValid) {
        console.error('❌ VALIDATION FAILED:', validationResult.errors);
        alert('Validation Error: ' + validationResult.message);
        // Show error modal
        hideModal('reviewApplicationModal');
        showModal('registrationErrorModal');
        return;
    }
    
    console.log('✅ Validation passed, submitting registration...');
    
    // Final submission
    const completeUserData = {
        ...registrationData,
        submittedAt: new Date().toISOString(),
        status: 'pending_review'
    };
    
    console.log('Final submission - Complete user data:', completeUserData);
    
    // Simulate backend submission
    // In production, this would be an actual API call
    submitRegistration(completeUserData)
        .then(response => {
            if (response.success) {
                console.log('✅ SUCCESS: Registration submitted successfully!');
                // Show success modal
                hideModal('reviewApplicationModal');
                showModal('registrationSuccessModal');
            } else {
                console.log('❌ FAILURE: Registration failed');
                // Show error modal
                hideModal('reviewApplicationModal');
                showModal('registrationErrorModal');
            }
        })
        .catch(error => {
            console.error('❌ ERROR: Registration submission failed:', error);
            // Show error modal
            hideModal('reviewApplicationModal');
            showModal('registrationErrorModal');
        });
    
    // Here you would send the complete data to your backend
    // Example:
    // const formData = new FormData();
    // formData.append('userData', JSON.stringify(registrationData));
    // formData.append('licensePhoto', storedFiles.licensePhoto);
    // formData.append('nbiClearance', storedFiles.nbiClearance);
    // formData.append('proofOfAddress', storedFiles.proofOfAddress);
    // formData.append('idPicture', storedFiles.idPicture);
    // 
    // fetch('/api/register/submit', {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         window.location.href = 'registration-success.html';
    //     } else {
    //         window.location.href = 'registration-error.html';
    //     }
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     window.location.href = 'registration-error.html';
    // });
});

// Back button for upload documents
document.getElementById('backToPersonalInfo').addEventListener('click', function() {
    hideModal('uploadDocumentsModal');
    showModal('personalInfoModal');
});

// Back button for review
document.getElementById('backToUpload').addEventListener('click', function() {
    hideModal('reviewApplicationModal');
    showModal('uploadDocumentsModal');
});

// Modal Functions
function showModal(modalId = 'personalInfoModal') {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function hideModal(modalId) {
    if (modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    } else {
        // Hide all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// File upload visual feedback
const fileInputs = ['licensePhoto', 'nbiClearance', 'proofOfAddress', 'idPicture'];
fileInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('change', function(e) {
            const wrapper = this.closest('.file-upload-wrapper');
            const fileNameSpan = wrapper.querySelector('.file-name');
            
            if (this.files.length > 0) {
                wrapper.classList.add('has-file');
                fileNameSpan.textContent = this.files[0].name;
            } else {
                wrapper.classList.remove('has-file');
                fileNameSpan.textContent = this.previousElementSibling ? 
                    this.previousElementSibling.textContent : 'Choose file';
            }
        });
    }
});

// Populate review form with collected data
function populateReviewForm() {
    const personalInfo = registrationData.personalInfo;
    const documents = registrationData.documents;
    
    // Personal Information
    document.getElementById('review-lastName').value = personalInfo.lastName || '';
    document.getElementById('review-firstName').value = personalInfo.firstName || '';
    document.getElementById('review-middleName').value = personalInfo.middleName || '';
    document.getElementById('review-ext').value = personalInfo.ext || '';
    document.getElementById('review-birthdate').value = personalInfo.birthdate || '';
    
    // Capitalize gender for display
    const gender = personalInfo.gender;
    document.getElementById('review-gender').value = gender ? 
        gender.charAt(0).toUpperCase() + gender.slice(1) : '';
    
    document.getElementById('review-address').value = personalInfo.address || '';
    document.getElementById('review-contactNumber').value = personalInfo.contactNumber || '';
    document.getElementById('review-alternativeEmail').value = personalInfo.alternativeEmail || '';
    
    // Documents
    document.getElementById('review-licenseNumber').value = documents.licenseNumber || '';
    document.getElementById('review-licenseExpiry').value = documents.licenseExpiry || '';
    document.getElementById('review-licensePhoto').value = documents.licensePhoto || '';
    document.getElementById('review-nbiClearance').value = documents.nbiClearance || '';
    document.getElementById('review-proofOfAddress').value = documents.proofOfAddress || '';
    document.getElementById('review-idPicture').value = documents.idPicture || '';
}

// Validate complete registration data
function validateCompleteRegistration() {
    const errors = [];
    
    // Validate basic account info
    if (!registrationData.email || !registrationData.password) {
        errors.push('Account credentials missing');
    }
    
    // Validate personal info
    if (!registrationData.personalInfo) {
        errors.push('Personal information missing');
    } else {
        const pi = registrationData.personalInfo;
        if (!pi.firstName || !pi.lastName) errors.push('Full name required');
        if (!pi.birthdate) errors.push('Birthdate required');
        if (!pi.gender) errors.push('Gender required');
        if (!pi.address) errors.push('Address required');
        if (!pi.contactNumber) errors.push('Contact number required');
    }
    
    // Validate documents
    if (!registrationData.documents) {
        errors.push('Documents missing');
    } else {
        const docs = registrationData.documents;
        if (!docs.licenseNumber) errors.push('License number required');
        if (!docs.licenseExpiry) errors.push('License expiry date required');
        if (!docs.licensePhoto) errors.push('License photo required');
        if (!docs.nbiClearance) errors.push('NBI clearance required');
        if (!docs.proofOfAddress) errors.push('Proof of address required');
        if (!docs.idPicture) errors.push('ID picture required');
        if (!docs.termsAccepted) errors.push('Terms and conditions must be accepted');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        message: errors.length > 0 ? errors.join(', ') : 'All validations passed'
    };
}

// Simulate backend submission (replace with actual API call)
function submitRegistration(userData) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // TESTING MODE: Change this value to test different scenarios
            // 0.9 = 90% success rate (10% failure)
            // 0.5 = 50% success rate (50% failure) - Good for testing error modal
            // 1.0 = 100% success rate (never fails)
            // 0.0 = 0% success rate (always fails) - To test error modal
            const successRate = 0.9;
            const isSuccessful = Math.random() < successRate;
            
            console.log('Simulating submission... Success:', isSuccessful);
            
            if (isSuccessful) {
                resolve({
                    success: true,
                    message: 'Registration submitted successfully',
                    userId: 'USER-' + Date.now(),
                    status: 'pending_review'
                });
            } else {
                reject({
                    success: false,
                    message: 'Server error occurred',
                    errorCode: 'HTTP_500'
                });
            }
        }, 1500);
    });
}
