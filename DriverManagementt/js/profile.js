// Profile Page - Tab Switching and Form Editing
(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initProfileTabs();
        initAccountFormEdit();
        initEditAccountModal();
        initDriverFormEdit();
        initEditDriverModal();
        initSecurityButtons();
        initChangePasswordModal();
        initNotificationToggles();
        initAllPasswordToggles(); // Initialize all password toggles
    });

    // Profile Tab Switching
    function initProfileTabs() {
        const tabs = document.querySelectorAll('.profile-tab');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');

                // Get the tab type and show corresponding panel
                const tabType = this.getAttribute('data-tab');
                const targetPanel = document.getElementById(tabType);
                
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }

    // Account Form Edit Functionality (kept for reference, but Edit button now opens modal)
    function initAccountFormEdit() {
        const editBtn = document.getElementById('editAccountBtn');
        
        if (!editBtn) return;

        // Edit button now opens the modal instead
        editBtn.addEventListener('click', function() {
            const modal = document.getElementById('editAccountModal');
            if (modal) {
                // Populate modal with current values
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const address = document.getElementById('address').value;
                const dob = document.getElementById('dob').value;

                document.getElementById('editUsername').value = username;
                document.getElementById('editEmail').value = email;
                document.getElementById('editPhone').value = phone;
                document.getElementById('editAddress').value = address;
                document.getElementById('editDob').value = dob;

                modal.classList.add('active');
            }
        });
    }

    // Edit Account Modal Functionality
    function initEditAccountModal() {
        const modal = document.getElementById('editAccountModal');
        const closeBtn = document.getElementById('closeEditModalBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const editForm = document.getElementById('editAccountForm');

        if (!modal || !closeBtn || !cancelBtn || !editForm) return;

        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
        }

        // Close button click
        closeBtn.addEventListener('click', closeModal);

        // Cancel button click
        cancelBtn.addEventListener('click', closeModal);

        // Click outside modal to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submit - Save changes
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get values from modal form
            const newUsername = document.getElementById('editUsername').value;
            const newEmail = document.getElementById('editEmail').value;
            const newPhone = document.getElementById('editPhone').value;
            const newAddress = document.getElementById('editAddress').value;
            const newDob = document.getElementById('editDob').value;

            // Update the main form values
            document.getElementById('username').value = newUsername;
            document.getElementById('email').value = newEmail;
            document.getElementById('phone').value = newPhone;
            document.getElementById('address').value = newAddress;
            document.getElementById('dob').value = newDob;

            // Update header user info
            const headerUserName = document.querySelector('.header .user-name');
            const headerUserEmail = document.querySelector('.header .user-email');
            if (headerUserName) headerUserName.textContent = newUsername;
            if (headerUserEmail) headerUserEmail.textContent = newEmail;

            // Update sidebar profile info
            const profileName = document.querySelector('.profile-name');
            if (profileName) profileName.textContent = newUsername;

            // Close modal
            closeModal();

            // Show success toast
            showToast('Account information updated successfully!');
        });
    }

    // Driver Form Edit Functionality (Edit button now opens modal)
    function initDriverFormEdit() {
        const editBtn = document.getElementById('editDriverBtn');
        
        if (!editBtn) return;

        // Edit button now opens the driver modal
        editBtn.addEventListener('click', function() {
            const modal = document.getElementById('editDriverModal');
            if (modal) {
                // Populate modal with current values
                const licenseNumber = document.getElementById('licenseNumber').value;
                const issueDate = document.getElementById('issueDate').value;
                const expiryDate = document.getElementById('expiryDate').value;
                const yearsExperience = document.getElementById('yearsExperience').value;
                const previousJobs = document.getElementById('previousJobs').value;

                document.getElementById('editLicenseNumber').value = licenseNumber;
                document.getElementById('editIssueDate').value = issueDate;
                document.getElementById('editExpiryDate').value = expiryDate;
                document.getElementById('editYearsExperience').value = yearsExperience;
                document.getElementById('editPreviousJobs').value = previousJobs;

                // Set checkboxes based on current selections
                const currentCheckboxes = document.querySelectorAll('#driverForm input[name="vehicleCategory"]:checked');
                currentCheckboxes.forEach(cb => {
                    const modalCheckbox = document.getElementById('check' + cb.value.charAt(0).toUpperCase() + cb.value.slice(1));
                    if (modalCheckbox) {
                        modalCheckbox.checked = true;
                    }
                });

                modal.classList.add('active');
                initDriverModalFeatures();
            }
        });
    }

    // Driver Modal Features (Dropdown only - password toggle handled by global function)
    function initDriverModalFeatures() {
        // Custom Dropdown
        const dropdownToggle = document.getElementById('vehicleDropdownToggle');
        const dropdownMenu = document.getElementById('vehicleDropdownMenu');
        const checkboxes = document.querySelectorAll('#vehicleDropdownMenu input[type="checkbox"]');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownToggle.classList.toggle('active');
                dropdownMenu.classList.toggle('active');
            });

            // Update label when checkboxes change
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateDropdownLabel);
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!document.getElementById('vehicleDropdown').contains(e.target)) {
                    dropdownToggle.classList.remove('active');
                    dropdownMenu.classList.remove('active');
                }
            });
        }

        function updateDropdownLabel() {
            const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
            const label = dropdownToggle.querySelector('.dropdown-label');
            
            if (checkedBoxes.length === 0) {
                label.textContent = 'Select Vehicle Capability';
                label.style.color = '#6c757d';
            } else if (checkedBoxes.length === 1) {
                label.textContent = checkedBoxes[0].nextElementSibling.textContent;
                label.style.color = '#212529';
            } else {
                label.textContent = `${checkedBoxes.length} vehicles selected`;
                label.style.color = '#212529';
            }
        }

        // Initialize label
        updateDropdownLabel();
    }

    // Edit Driver Modal Handler
    function initEditDriverModal() {
        const modal = document.getElementById('editDriverModal');
        const closeBtn = document.getElementById('closeDriverModalBtn');
        const cancelBtn = document.getElementById('cancelDriverEditBtn');
        const editForm = document.getElementById('editDriverForm');

        if (!modal || !closeBtn || !cancelBtn || !editForm) return;

        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
        }

        // Close button click
        closeBtn.addEventListener('click', closeModal);

        // Cancel button click
        cancelBtn.addEventListener('click', closeModal);

        // Click outside modal to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submit - Save changes
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get values from modal form
            const newLicenseNumber = document.getElementById('editLicenseNumber').value;
            const newIssueDate = document.getElementById('editIssueDate').value;
            const newExpiryDate = document.getElementById('editExpiryDate').value;
            const newYearsExperience = document.getElementById('editYearsExperience').value;
            const newPreviousJobs = document.getElementById('editPreviousJobs').value;

            // Update the main form values
            document.getElementById('licenseNumber').value = newLicenseNumber;
            document.getElementById('issueDate').value = newIssueDate;
            document.getElementById('expiryDate').value = newExpiryDate;
            document.getElementById('yearsExperience').value = newYearsExperience;
            document.getElementById('previousJobs').value = newPreviousJobs;

            // Update vehicle category checkboxes
            const modalCheckboxes = document.querySelectorAll('#vehicleDropdownMenu input[type="checkbox"]');
            const mainCheckboxes = document.querySelectorAll('#driverForm input[name="vehicleCategory"]');
            
            modalCheckboxes.forEach(modalCb => {
                const value = modalCb.value;
                const mainCb = Array.from(mainCheckboxes).find(cb => cb.value === value);
                if (mainCb) {
                    mainCb.checked = modalCb.checked;
                }
            });

            // Close modal
            closeModal();

            // Show success toast
            showToast('Driver information updated successfully!');
        });
    }

    // Keep old driver form edit for reference
    function initDriverFormEditOld() {
        const editBtn = document.getElementById('editDriverBtn');
        const saveBtn = document.getElementById('saveDriverBtn');
        const cancelBtn = document.getElementById('cancelDriverBtn');
        const formActions = document.getElementById('driverFormActions');
        const formInputs = document.querySelectorAll('#driverForm .form-input');
        const textareas = document.querySelectorAll('#driverForm .form-textarea');
        const checkboxes = document.querySelectorAll('#driverForm input[type="checkbox"]');
        const uploadBtn = document.getElementById('uploadLicenseBtn');
        const fileInput = document.getElementById('licenseFileInput');
        const originalValues = {};
        const originalCheckboxes = {};

        if (!editBtn || !saveBtn || !cancelBtn) return;

        // Store original values
        formInputs.forEach(input => {
            originalValues[input.id] = input.value;
        });
        
        textareas.forEach(textarea => {
            originalValues[textarea.id] = textarea.value;
        });

        checkboxes.forEach(checkbox => {
            originalCheckboxes[checkbox.value] = checkbox.checked;
        });

        // // License Upload Functionality
        // if (uploadBtn && fileInput) {
        //     uploadBtn.addEventListener('click', function() {
        //         fileInput.click();
        //     });

        //     fileInput.addEventListener('change', function(e) {
        //         const file = e.target.files[0];
        //         if (file) {
        //             const reader = new FileReader();
        //             reader.onload = function(event) {
        //                 const licenseImage = document.getElementById('licenseImage');
        //                 if (licenseImage) {
        //                     licenseImage.src = event.target.result;
        //                 }
        //                 showToast('License image uploaded successfully');
        //             };
        //             reader.readAsDataURL(file);
        //         }
        //     });
        // }

        // Edit button click
        editBtn.addEventListener('click', function() {
            formInputs.forEach(input => {
                input.removeAttribute('readonly');
            });
            textareas.forEach(textarea => {
                textarea.removeAttribute('readonly');
            });
            checkboxes.forEach(checkbox => {
                checkbox.disabled = false;
            });
            formActions.style.display = 'flex';
            editBtn.style.display = 'none';
        });

        // Save button click
        saveBtn.addEventListener('click', function() {
            // Here you would typically send data to server
            formInputs.forEach(input => {
                input.setAttribute('readonly', 'readonly');
                originalValues[input.id] = input.value;
            });
            textareas.forEach(textarea => {
                textarea.setAttribute('readonly', 'readonly');
                originalValues[textarea.id] = textarea.value;
            });
            checkboxes.forEach(checkbox => {
                checkbox.disabled = true;
                originalCheckboxes[checkbox.value] = checkbox.checked;
            });
            formActions.style.display = 'none';
            editBtn.style.display = 'flex';
            
            // Show success message
            showToast('Driver information updated successfully!');
        });

        // Cancel button click
        cancelBtn.addEventListener('click', function() {
            // Restore original values
            formInputs.forEach(input => {
                input.value = originalValues[input.id];
                input.setAttribute('readonly', 'readonly');
            });
            textareas.forEach(textarea => {
                textarea.value = originalValues[textarea.id];
                textarea.setAttribute('readonly', 'readonly');
            });
            checkboxes.forEach(checkbox => {
                checkbox.checked = originalCheckboxes[checkbox.value];
                checkbox.disabled = true;
            });
            formActions.style.display = 'none';
            editBtn.style.display = 'flex';
        });

        // Initially disable checkboxes
        checkboxes.forEach(checkbox => {
            checkbox.disabled = true;
        });
    }

    // Security Settings
    function initSecurityButtons() {
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const twoFactorToggle = document.getElementById('twoFactorToggle');

        // Change Password Button - Opens modal
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function() {
                const modal = document.getElementById('changePasswordModal');
                if (modal) {
                    modal.classList.add('active');
                    // Clear form fields
                    document.getElementById('changePasswordForm').reset();
                }
            });
        }

        // Two-Factor Authentication Toggle
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', function() {
                if (this.checked) {
                    // Enable 2FA
                    const confirm2FA = confirm('Enable Two-Factor Authentication?\n\nThis will add an extra layer of security to your account.\n\nYou will need:\n1. An authenticator app (Google Authenticator, Authy, etc.)\n2. Your phone to scan a QR code\n\nDo you want to continue?');
                    
                    if (confirm2FA) {
                        showToast('Two-Factor Authentication enabled successfully!');
                        // In a real app, you would:
                        // 1. Show QR code modal
                        // 2. User scans with authenticator app
                        // 3. User enters verification code
                        // 4. Save backup codes
                    } else {
                        this.checked = false;
                    }
                } else {
                    // Disable 2FA
                    const confirmDisable = confirm('Disable Two-Factor Authentication?\n\nThis will reduce the security of your account.\n\nAre you sure you want to disable 2FA?');
                    
                    if (confirmDisable) {
                        const verificationCode = prompt('Enter your 2FA verification code to confirm:');
                        if (verificationCode && verificationCode.length === 6) {
                            showToast('Two-Factor Authentication disabled');
                        } else {
                            alert('Invalid verification code. 2FA remains enabled.');
                            this.checked = true;
                        }
                    } else {
                        this.checked = true;
                    }
                }
            });
        }
    }

    // Notification Toggles
    function initNotificationToggles() {
        const emailAlertsToggle = document.getElementById('emailAlertsToggle');
        const smsAlertsToggle = document.getElementById('smsAlertsToggle');
        const tripUpdatesToggle = document.getElementById('tripUpdatesToggle');
        const promotionsToggle = document.getElementById('promotionsToggle');

        // Email Alerts Toggle
        if (emailAlertsToggle) {
            emailAlertsToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                showToast(`Email Alerts ${isEnabled ? 'enabled' : 'disabled'}`);
                // Here you would typically send this preference to the server
                console.log(`Email Alerts: ${isEnabled}`);
            });
        }

        // SMS Alerts Toggle
        if (smsAlertsToggle) {
            smsAlertsToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                showToast(`SMS Alerts ${isEnabled ? 'enabled' : 'disabled'}`);
                console.log(`SMS Alerts: ${isEnabled}`);
            });
        }

        // Trip Updates Toggle
        if (tripUpdatesToggle) {
            tripUpdatesToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                showToast(`Trip Updates ${isEnabled ? 'enabled' : 'disabled'}`);
                console.log(`Trip Updates: ${isEnabled}`);
            });
        }

        // Promotions Toggle
        if (promotionsToggle) {
            promotionsToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                showToast(`Promotions ${isEnabled ? 'enabled' : 'disabled'}`);
                console.log(`Promotions: ${isEnabled}`);
            });
        }
    }

    // Change Password Modal Handler
    function initChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        const closeBtn = document.getElementById('closePasswordModalBtn');
        const cancelBtn = document.getElementById('cancelPasswordBtn');
        const changePasswordForm = document.getElementById('changePasswordForm');

        if (!modal || !closeBtn || !cancelBtn || !changePasswordForm) return;

        // Close modal function
        function closeModal() {
            modal.classList.remove('active');
            // Reset form and clear errors
            changePasswordForm.reset();
            // Reset all password inputs to password type
            const passwordInputs = modal.querySelectorAll('.password-input');
            passwordInputs.forEach(input => {
                input.type = 'password';
            });
            // Reset all eye icons
            const icons = modal.querySelectorAll('.toggle-password-btn i');
            icons.forEach(icon => {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            });
        }

        // Close button click
        closeBtn.addEventListener('click', closeModal);

        // Cancel button click
        cancelBtn.addEventListener('click', closeModal);

        // Click outside modal to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Form submit - Save changes
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validate passwords match
            if (newPassword !== confirmPassword) {
                showToast('Passwords do not match!');
                return;
            }

            // Validate password length (example validation)
            if (newPassword.length < 6) {
                showToast('Password must be at least 6 characters!');
                return;
            }

            // Here you would typically send to server
            // For now, just simulate success
            
            // Update the "Last changed" text in Security tab
            const changePasswordBtn = document.getElementById('changePasswordBtn');
            if (changePasswordBtn) {
                const subtitle = changePasswordBtn.closest('.security-setting-item').querySelector('.setting-subtitle');
                if (subtitle) {
                    const now = new Date();
                    subtitle.textContent = 'Last changed just now';
                }
            }

            // Close modal
            closeModal();

            // Show success toast
            showToast('Password changed successfully!');
        });
    }

    // Simple toast notification (optional)
    function showToast(message) {
        // Check if toast already exists
        let toast = document.getElementById('notification-toast');
        
        if (!toast) {
            // Create toast element
            toast = document.createElement('div');
            toast.id = 'notification-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: #3F562C;
                color: white;
                padding: 14px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                font-size: 14px;
                font-weight: 500;
                opacity: 0;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';

        // Hide after 2 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    // Initialize All Password Toggles (works for all modals)
    function initAllPasswordToggles() {
        // Use event delegation for dynamically added elements
        document.body.addEventListener('click', function(e) {
            // Check if clicked element is a toggle password button or its child
            const toggleBtn = e.target.closest('.toggle-password-btn');
            
            if (toggleBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = toggleBtn.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = toggleBtn.querySelector('i');
                
                if (passwordInput && icon) {
                    if (passwordInput.type === 'password') {
                        // Show password
                        passwordInput.type = 'text';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    } else {
                        // Hide password
                        passwordInput.type = 'password';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    }
                }
            }
        });
    }

    // ===== LICENSE UPLOAD =====
    document.getElementById('uploadLicenseBtn').addEventListener('click', () => {
        document.getElementById('licenseFileInput').click();
    });

    document.getElementById('licenseFileInput').addEventListener('change', function () {
        if (this.files && this.files[0]) {
            // Show loading state
            const btn = document.getElementById('uploadLicenseBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
            btn.disabled = true;
            
            // Submit the form
            const form = document.getElementById('licenseUploadForm');
            form.submit();
            
            // Reset after 3 seconds
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        }
    });

})();
