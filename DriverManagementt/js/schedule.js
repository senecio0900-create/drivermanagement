// Schedule Page - Booking Modal Management
(function() {
    'use strict';

    // Modal elements
    let bookingDetailsModal = null;
    let confirmArrivalModal = null;
    let confirmDropOffModal = null;

    // Current booking data
    let currentBookingData = null;
    let currentOngoingBookingData = null;
    let tripState = 'accepted'; // 'accepted', 'arrived', 'completed'
    
    // Booking map variables
    let map = null;
    let pickupMarker = null;
    let dropoffMarker = null;
    let routeLine = null;
    
    // Ongoing map variables
    let ongoingBookingModal = null;
    let ongoingMap = null;
    let ongoingPickupMarker = null;
    let ongoingDropoffMarker = null;
    let ongoingRouteLine = null;
    let ongoingCarMarker = null;

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        bookingDetailsModal = document.getElementById('bookingDetailsModal');
        confirmArrivalModal = document.getElementById('confirmArrivalModal');
        confirmDropOffModal = document.getElementById('confirmDropOffModal');
        ongoingBookingModal = document.getElementById('ongoingBookingModal');
        
        initViewDetailsButtons();
        initModalControls();
        initOngoingViewButtons();
    }

    // Helper function to extract booking data from card
    function extractBookingDataFromCard(card) {
        const data = {
            id: card.dataset.id || card.dataset.bookingId,
            passenger: card.dataset.passenger,
            phone: card.dataset.phone,
            pickup: card.dataset.pickup,
            pickupLat: parseFloat(card.dataset.pickupLat),
            pickupLng: parseFloat(card.dataset.pickupLng),
            dropoff: card.dataset.dropoff,
            dropoffLat: parseFloat(card.dataset.dropoffLat),
            dropoffLng: parseFloat(card.dataset.dropoffLng),
            distance: card.dataset.distance,
            time: card.dataset.time,
            datetime: card.dataset.datetime,
            payment: card.dataset.payment,
            fare: card.dataset.fare
        };
        
        // Validate coordinates
        if (isNaN(data.pickupLat) || isNaN(data.pickupLng) || isNaN(data.dropoffLat) || isNaN(data.dropoffLng)) {
            console.error('Invalid coordinates in booking data:', data);
            return null;
        }
        
        const noteElement = card.querySelector('.booking-note');
        if (noteElement) {
            data.note = noteElement.textContent.trim().replace(/^\s*\S+\s*/, '');
        }
        
        return data;
    }

    // Initialize View Details buttons for booking cards
    function initViewDetailsButtons() {
        const viewButtons = document.querySelectorAll('#bookings-tab .btn-view-details');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const card = this.closest('.booking-card');
                
                if (!card) return;
                
                currentBookingData = extractBookingDataFromCard(card);
                if (!currentBookingData) {
                    alert('Invalid booking data. Please try again.');
                    return;
                }
                showBookingDetailsModal();
            });
        });
    }

    // Initialize modal control buttons
    function initModalControls() {
        // Booking Details Modal (for new bookings)
        document.getElementById('closeBookingDetails')?.addEventListener('click', closeBookingDetailsModal);
        document.getElementById('acceptBookingBtn')?.addEventListener('click', acceptBooking);
        document.getElementById('cancelBookingBtn')?.addEventListener('click', cancelBooking);
        document.getElementById('contactPassengerBtn')?.addEventListener('click', contactPassenger);

        // Ongoing Booking Details Modal
        document.getElementById('closeOngoingBooking')?.addEventListener('click', closeOngoingBookingModal);
        document.getElementById('arrivedAtPickupBtn')?.addEventListener('click', showConfirmArrivalModal);
        document.getElementById('contactOngoingPassengerBtn')?.addEventListener('click', contactPassenger);

        // Confirm Arrival Modal
        document.getElementById('closeConfirmArrival')?.addEventListener('click', closeConfirmArrivalModal);
        document.getElementById('cancelArrivalBtn')?.addEventListener('click', closeConfirmArrivalModal);
        document.getElementById('confirmArrivalBtn')?.addEventListener('click', confirmArrival);

        // Confirm Drop Off Modal
        document.getElementById('closeConfirmDropOff')?.addEventListener('click', closeConfirmDropOffModal);
        document.getElementById('cancelDropOffBtn')?.addEventListener('click', closeConfirmDropOffModal);
        document.getElementById('confirmDropOffBtn')?.addEventListener('click', completeDropOff);

        // Close on overlay click
        bookingDetailsModal?.querySelector('.modal-overlay')?.addEventListener('click', closeBookingDetailsModal);
        confirmArrivalModal?.querySelector('.modal-overlay')?.addEventListener('click', closeConfirmArrivalModal);
        confirmDropOffModal?.querySelector('.modal-overlay')?.addEventListener('click', closeConfirmDropOffModal);
    }

    // Accept Booking - Move to Ongoing
    function acceptBooking() {
        if (!currentBookingData) return;
        
        // Close booking details modal
        closeBookingDetailsModal();
        
        // Move booking to Ongoing tab
        moveBookingToOngoing(currentBookingData);
        
        // Show success message
        setTimeout(() => {
            alert('Booking accepted! You can view it in the Ongoing tab.');
        }, 300);
    }
    
    // Move booking from Bookings to Ongoing tab
    function moveBookingToOngoing(bookingData) {
        if (!bookingData) return;
        
        // Find and remove the booking card from Bookings tab
        const bookingCards = document.querySelectorAll('#bookings-tab .booking-card');
        bookingCards.forEach(card => {
            if (card.dataset.id === bookingData.id) {
                // Note is already stored in bookingData from card click
                // Remove from Bookings tab
                card.remove();
            }
        });
        
        // Create new ongoing booking card
        const ongoingCard = createOngoingBookingCard(bookingData);
        
        // Add to Ongoing tab
        const ongoingGrid = document.querySelector('#ongoing-tab .bookings-grid');
        if (ongoingGrid) {
            ongoingGrid.insertBefore(ongoingCard, ongoingGrid.firstChild);
        }
        
        // Switch to Ongoing tab
        switchToTab('ongoing');
    }
    
    // Create ongoing booking card
    function createOngoingBookingCard(data) {
        const card = document.createElement('div');
        card.className = 'booking-card ongoing-card';
        card.dataset.bookingId = data.id;
        card.dataset.passenger = data.passenger;
        card.dataset.phone = data.phone;
        card.dataset.pickup = data.pickup;
        card.dataset.pickupLat = data.pickupLat;
        card.dataset.pickupLng = data.pickupLng;
        card.dataset.dropoff = data.dropoff;
        card.dataset.dropoffLat = data.dropoffLat;
        card.dataset.dropoffLng = data.dropoffLng;
        card.dataset.distance = data.distance;
        card.dataset.time = data.time;
        card.dataset.datetime = data.datetime;
        card.dataset.payment = data.payment;
        card.dataset.fare = data.fare;
        
        card.innerHTML = `
            <div class="ongoing-header">
                <div class="ongoing-passenger">
                    <div class="passenger-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="passenger-info">
                        <span class="passenger-name">${data.passenger}</span>
                        <span class="booking-id">Booking ID: ${data.id}</span>
                    </div>
                </div>
                <span class="status-badge status-accepted">Accepted</span>
            </div>
            <div class="booking-route">
                <div class="route-item">
                    <i class="fa-solid fa-location-dot pickup-icon"></i>
                    <span>${data.pickup}</span>
                </div>
                <div class="route-line"></div>
                <div class="route-item">
                    <i class="fa-solid fa-location-dot dropoff-icon"></i>
                    <span>${data.dropoff}</span>
                </div>
            </div>
            ${data.note ? `<div class="booking-note">${data.note}</div>` : ''}
            <div class="booking-footer">
                <span class="booking-price">${data.fare}</span>
                <button class="btn-view-details">View Details</button>
            </div>
        `;
        
        // Add click event to the new View Details button
        const viewBtn = card.querySelector('.btn-view-details');
        viewBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showOngoingBookingModal(extractBookingDataFromCard(card));
        });
        
        return card;
    }
    
    // Switch tabs
    function switchToTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.schedule-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-tab`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
    }

    // Show Booking Details Modal with Map
    function showBookingDetailsModal() {
        if (!currentBookingData || !bookingDetailsModal) return;

        // Populate modal with booking data
        const bookingIdElement = bookingDetailsModal.querySelector('.booking-id');
        if (bookingIdElement) {
            bookingIdElement.textContent = `ID: ${currentBookingData.id}`;
        }
        
        document.getElementById('passengerName').textContent = currentBookingData.passenger;
        document.getElementById('passengerPhone').textContent = currentBookingData.phone;
        document.getElementById('pickupLocation').textContent = currentBookingData.pickup;
        document.getElementById('dropoffLocation').textContent = currentBookingData.dropoff;
        document.getElementById('routeDistance').textContent = currentBookingData.distance;
        document.getElementById('routeTime').textContent = currentBookingData.time;
        document.getElementById('tripDateTime').textContent = currentBookingData.datetime;
        document.getElementById('paymentMethod').textContent = currentBookingData.payment;
        document.getElementById('totalFare').textContent = currentBookingData.fare;
        
        // Show modal
        bookingDetailsModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Initialize map after modal is visible
        setTimeout(() => {
            initializeMap();
        }, 100);
    }

    function closeBookingDetailsModal() {
        bookingDetailsModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Destroy map when closing
        if (map) {
            map.remove();
            map = null;
            pickupMarker = null;
            dropoffMarker = null;
            routeLine = null;
        }
    }

    // Initialize Leaflet Map
    function initializeMap() {
        if (!currentBookingData) return;

        const mapContainer = document.getElementById('bookingMap');
        if (!mapContainer) return;
        
        // Clear existing map if any
        if (map) {
            map.off();
            map.remove();
            map = null;
        }
        
        // Clear the container HTML to ensure clean state
        mapContainer.innerHTML = '';
        mapContainer._leaflet_id = null;

        // Calculate center point between pickup and dropoff
        const centerLat = (currentBookingData.pickupLat + currentBookingData.dropoffLat) / 2;
        const centerLng = (currentBookingData.pickupLng + currentBookingData.dropoffLng) / 2;

        // Initialize map
        map = L.map('bookingMap', {
            zoomControl: true,
            attributionControl: false
        }).setView([centerLat, centerLng], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Custom icons
        const pickupIcon = L.divIcon({
            className: 'custom-marker pickup-marker',
            html: '<div class="marker-pin pickup-pin"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });

        const dropoffIcon = L.divIcon({
            className: 'custom-marker dropoff-marker',
            html: '<div class="marker-pin dropoff-pin"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
        });

        // Car icon for current location (driver)
        const carIcon = L.divIcon({
            className: 'custom-marker car-marker',
            html: '<div class="marker-car"><i class="fa-solid fa-car"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        // Add car marker (simulated current location - slightly offset from pickup)
        const carMarker = L.marker([
            currentBookingData.pickupLat - 0.002,
            currentBookingData.pickupLng - 0.002
        ], {
            icon: carIcon
        }).addTo(map);
        carMarker.bindPopup(`<strong>Your Location</strong><br>Current Position`);

        // Add pickup marker
        pickupMarker = L.marker([currentBookingData.pickupLat, currentBookingData.pickupLng], {
            icon: pickupIcon
        }).addTo(map);
        pickupMarker.bindPopup(`<strong>Pickup</strong><br>${currentBookingData.pickup}`);

        // Add dropoff marker
        dropoffMarker = L.marker([currentBookingData.dropoffLat, currentBookingData.dropoffLng], {
            icon: dropoffIcon
        }).addTo(map);
        dropoffMarker.bindPopup(`<strong>Drop-off</strong><br>${currentBookingData.dropoff}`);

        // Simulate route with intermediate waypoints for more realistic path
        const routeCoordinates = generateRouteWaypoints(
            currentBookingData.pickupLat,
            currentBookingData.pickupLng,
            currentBookingData.dropoffLat,
            currentBookingData.dropoffLng
        );

        // Draw route line with smooth curve
        routeLine = L.polyline(routeCoordinates, {
            color: '#4285F4',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(map);

        // Add decorative arrow to show direction
        const arrowHead = L.polylineDecorator(routeLine, {
            patterns: [
                {
                    offset: '50%',
                    repeat: 0,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        pathOptions: {
                            fillOpacity: 1,
                            weight: 0,
                            color: '#4285F4'
                        }
                    })
                }
            ]
        }).addTo(map);

        // Fit map to show all markers including car
        const bounds = L.latLngBounds([
            [currentBookingData.pickupLat - 0.002, currentBookingData.pickupLng - 0.002],
            [currentBookingData.pickupLat, currentBookingData.pickupLng],
            [currentBookingData.dropoffLat, currentBookingData.dropoffLng]
        ]);
        map.fitBounds(bounds, { padding: [60, 60] });

        // Force map to resize and add Google Maps button after
        setTimeout(() => {
            map.invalidateSize();
            // Add Google Maps button after map is fully rendered
            addGoogleMapsButton();
        }, 300);
    }

    // Generate waypoints for a more realistic route
    function generateRouteWaypoints(lat1, lng1, lat2, lng2) {
        const waypoints = [];
        const steps = 20; // Number of intermediate points
        
        // Create a curved path that simulates road routing
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Linear interpolation with slight curve
            const lat = lat1 + (lat2 - lat1) * t;
            const lng = lng1 + (lng2 - lng1) * t;
            
            // Add slight randomness to simulate road curves
            const curveFactor = Math.sin(t * Math.PI) * 0.001;
            
            waypoints.push([
                lat + curveFactor,
                lng + curveFactor * 0.5
            ]);
        }
        
        return waypoints;
    }

    // Add Google Maps button to map
    function addGoogleMapsButton() {
        if (!map) return;
        
        const button = L.control({ position: 'bottomright' });
        
        button.onAdd = function(leafletMap) {
            const div = L.DomUtil.create('div', 'google-maps-button');
            div.innerHTML = `
                <button id="openGoogleMaps" title="Open in Google Maps">
                    <i class="fa-solid fa-map-location-dot"></i>
                </button>
            `;
            
            // Prevent map interactions when clicking button
            L.DomEvent.disableClickPropagation(div);
            
            return div;
        };
        
        button.addTo(map);
        
        // Add click handler
        setTimeout(() => {
            const btn = document.getElementById('openGoogleMaps');
            if (btn) {
                btn.addEventListener('click', openInGoogleMaps);
            }
        }, 100);
    }

    // Open route in Google Maps
    function openInGoogleMaps() {
        if (!currentBookingData) return;
        
        const origin = `${currentBookingData.pickupLat},${currentBookingData.pickupLng}`;
        const destination = `${currentBookingData.dropoffLat},${currentBookingData.dropoffLng}`;
        
        // Google Maps URL with directions
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        
        // Open in new tab
        window.open(googleMapsUrl, '_blank');
    }

    // Show Confirm Arrival Modal
    function showConfirmArrivalModal() {
        confirmArrivalModal.classList.add('show');
    }

    function closeConfirmArrivalModal() {
        confirmArrivalModal.classList.remove('show');
    }

    // Confirm Arrival
    function confirmArrival() {
        closeConfirmArrivalModal();
        
        // Update trip state
        tripState = 'arrived';
        
        // Update the buttons in ongoing modal
        const arrivedBtn = document.getElementById('arrivedAtPickupBtn');
        const cancelBtn = document.getElementById('cancelOngoingBookingBtn');
        
        if (arrivedBtn && cancelBtn) {
            arrivedBtn.textContent = 'En Route to Drop-off';
            arrivedBtn.disabled = true;
            arrivedBtn.style.opacity = '0.6';
            arrivedBtn.style.cursor = 'not-allowed';
            
            cancelBtn.textContent = 'Confirm Drop Off';
            cancelBtn.className = 'btn-arrived';
            cancelBtn.style.display = 'block';
            cancelBtn.onclick = confirmDropOff;
        }
        
        // Show success message
        setTimeout(() => {
            alert('Arrival confirmed! Passenger has been notified. Now proceeding to drop-off location.');
        }, 300);
    }

    // Cancel Booking
    function cancelBooking() {
        if (confirm('Are you sure you want to cancel this booking?')) {
            closeBookingDetailsModal();
            currentBookingData = null;
            
            // Here you would typically:
            // 1. Send cancellation to the backend
            // 2. Remove the booking card from the UI
            // 3. Notify the passenger
        }
    }

    // Contact Passenger - Redirect to Messages
    function contactPassenger() {
        // Determine which modal is open and get the appropriate data
        let passengerData = null;
        
        if (bookingDetailsModal.classList.contains('show')) {
            closeBookingDetailsModal();
            passengerData = currentBookingData;
        } else if (ongoingBookingModal && ongoingBookingModal.classList.contains('show')) {
            closeOngoingBookingModal();
            passengerData = currentOngoingBookingData || currentBookingData;
        }
        
        // Store passenger data in sessionStorage for messages page
        if (passengerData) {
            sessionStorage.setItem('contactPassenger', JSON.stringify({
                name: passengerData.passenger,
                phone: passengerData.phone,
                bookingId: passengerData.id
            }));
        }
        
        // Redirect to messages page
        window.location.href = 'messages.html';
    }

    // Show Confirm Drop Off Modal
    function confirmDropOff() {
        confirmDropOffModal.classList.add('show');
    }

    function closeConfirmDropOffModal() {
        confirmDropOffModal.classList.remove('show');
    }

    // Complete Drop Off - Complete the trip
    function completeDropOff() {
        closeConfirmDropOffModal();
        closeOngoingBookingModal();
        
        // Find and remove the ongoing card
        if (currentOngoingBookingData) {
            const ongoingCards = document.querySelectorAll('#ongoing-tab .booking-card');
            ongoingCards.forEach(card => {
                if (card.dataset.bookingId === currentOngoingBookingData.id) {
                    card.remove();
                }
            });
        }
        
        // Reset trip state
        tripState = 'accepted';
        currentOngoingBookingData = null;
        
        // Show success message
        setTimeout(() => {
            alert('Trip completed successfully! Payment has been recorded.');
        }, 300);
        
        // Here you would typically:
        // 1. Send completion to the backend
        // 2. Process payment
        // 3. Update earnings
        // 4. Move to trip history
    }

    // ========================================
    // ONGOING BOOKING MODAL
    // ========================================

    // Initialize View Details buttons for ongoing bookings (using event delegation for dynamically created cards)
    function initOngoingViewButtons() {
        // Use event delegation on the ongoing bookings grid container
        const ongoingGrid = document.querySelector('#ongoing-tab .bookings-grid');
        
        if (ongoingGrid) {
            ongoingGrid.addEventListener('click', function(e) {
                // Check if clicked element is or is within a View Details button
                const button = e.target.closest('.btn-view-details');
                if (!button) return;
                
                const card = button.closest('.booking-card');
                if (!card) return;
                
                const bookingData = extractBookingDataFromCard(card);
                if (!bookingData) {
                    alert('Invalid booking data. Please try again.');
                    return;
                }
                showOngoingBookingModal(bookingData);
            });
        }
    }

    function showOngoingBookingModal(bookingData) {
        if (!bookingData) return;

        // Store current ongoing booking data
        currentOngoingBookingData = bookingData;

        // Populate modal with booking data (updated for new HTML structure matching booking details)
        document.getElementById('ongoingBookingId').textContent = `ID: ${bookingData.id}`;
        document.getElementById('ongoingPassengerName').textContent = bookingData.passenger;
        document.getElementById('ongoingPassengerPhone').textContent = bookingData.phone;
        document.getElementById('ongoingPickupLocation').textContent = bookingData.pickup;
        document.getElementById('ongoingDropoffLocation').textContent = bookingData.dropoff;
        document.getElementById('ongoingRouteDistance').textContent = bookingData.distance;
        document.getElementById('ongoingRouteTime').textContent = bookingData.time;
        document.getElementById('ongoingTripDateTime').textContent = bookingData.datetime;
        document.getElementById('ongoingPaymentMethod').textContent = bookingData.payment;
        document.getElementById('ongoingTotalFare').textContent = bookingData.fare;

        // Store current ongoing booking data for Google Maps
        currentOngoingBookingData = bookingData;
        
        // Reset button states (in case modal was opened before)
        const arrivedBtn = document.getElementById('arrivedAtPickupBtn');
        const cancelBtn = document.getElementById('cancelOngoingBookingBtn');
        
        if (arrivedBtn) {
            arrivedBtn.textContent = 'Arrived at Pickup Location';
            arrivedBtn.disabled = false;
            arrivedBtn.style.opacity = '1';
            arrivedBtn.style.cursor = 'pointer';
        }
        
        if (cancelBtn) {
            cancelBtn.textContent = 'Cancel Booking';
            cancelBtn.className = 'btn-cancel-booking';
            cancelBtn.style.display = 'none'; // Hide until arrival confirmed
        }

        // Show modal
        ongoingBookingModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Initialize map after modal is visible
        setTimeout(() => {
            initializeOngoingMap(bookingData);
        }, 100);
    }

    function closeOngoingBookingModal() {
        ongoingBookingModal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Destroy map when closing
        if (ongoingMap) {
            ongoingMap.remove();
            ongoingMap = null;
            ongoingPickupMarker = null;
            ongoingDropoffMarker = null;
            ongoingRouteLine = null;
            ongoingCarMarker = null;
        }
    }

    function initializeOngoingMap(bookingData) {
        const mapContainer = document.getElementById('ongoingBookingMap');
        
        if (!mapContainer) return;

        // Clear any existing map
        if (ongoingMap) {
            ongoingMap.off();
            ongoingMap.remove();
            ongoingMap = null;
        }
        
        // Clear the container HTML to ensure clean state
        mapContainer.innerHTML = '';
        mapContainer._leaflet_id = null;

        // Center point between pickup and dropoff
        const centerLat = (bookingData.pickupLat + bookingData.dropoffLat) / 2;
        const centerLng = (bookingData.pickupLng + bookingData.dropoffLng) / 2;

        // Initialize Leaflet map
        ongoingMap = L.map('ongoingBookingMap').setView([centerLat, centerLng], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(ongoingMap);

        // Custom pickup icon
        const pickupIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin pickup-pin"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [30, 40],
            iconAnchor: [15, 40]
        });

        // Custom dropoff icon
        const dropoffIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin dropoff-pin"><i class="fa-solid fa-location-dot"></i></div>',
            iconSize: [30, 40],
            iconAnchor: [15, 40]
        });

        // Custom car icon (for ongoing trip)
        const carIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-car"><i class="fa-solid fa-car"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Add markers
        ongoingPickupMarker = L.marker([bookingData.pickupLat, bookingData.pickupLng], { icon: pickupIcon })
            .addTo(ongoingMap)
            .bindPopup('<b>Pickup</b><br>' + bookingData.pickup);

        ongoingDropoffMarker = L.marker([bookingData.dropoffLat, bookingData.dropoffLng], { icon: dropoffIcon })
            .addTo(ongoingMap)
            .bindPopup('<b>Drop-off</b><br>' + bookingData.dropoff);

        // Add car marker at current position (between pickup and dropoff for demo)
        const carLat = centerLat + 0.002;
        const carLng = centerLng - 0.001;
        ongoingCarMarker = L.marker([carLat, carLng], { icon: carIcon })
            .addTo(ongoingMap)
            .bindPopup('<b>Your Location</b>');

        // Draw route line
        const routeCoords = [
            [bookingData.pickupLat, bookingData.pickupLng],
            [carLat, carLng],
            [bookingData.dropoffLat, bookingData.dropoffLng]
        ];

        ongoingRouteLine = L.polyline(routeCoords, {
            color: '#3F562C',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(ongoingMap);

        // Fit bounds to show all markers
        const bounds = L.latLngBounds([
            [bookingData.pickupLat, bookingData.pickupLng],
            [bookingData.dropoffLat, bookingData.dropoffLng],
            [carLat, carLng]
        ]);

        ongoingMap.fitBounds(bounds, { padding: [50, 50] });

        // Fix map rendering issue and add Google Maps button after
        setTimeout(() => {
            ongoingMap.invalidateSize();
            // Add Google Maps button after map is fully rendered
            addOngoingGoogleMapsButton();
        }, 300);
    }

    // Add Google Maps button to ongoing booking map
    function addOngoingGoogleMapsButton() {
        if (!ongoingMap) return;
        
        const button = L.control({ position: 'bottomright' });
        
        button.onAdd = function(leafletMap) {
            const div = L.DomUtil.create('div', 'google-maps-button');
            div.innerHTML = `
                <button id="openOngoingGoogleMaps" title="Open in Google Maps">
                    <i class="fa-solid fa-map-location-dot"></i>
                </button>
            `;
            
            // Prevent map interactions when clicking button
            L.DomEvent.disableClickPropagation(div);
            
            return div;
        };
        
        button.addTo(ongoingMap);
        
        // Add click handler
        setTimeout(() => {
            const btn = document.getElementById('openOngoingGoogleMaps');
            if (btn) {
                btn.addEventListener('click', openOngoingInGoogleMaps);
            }
        }, 100);
    }

    // Open ongoing route in Google Maps
    function openOngoingInGoogleMaps() {
        if (!currentOngoingBookingData) return;
        
        const origin = `${currentOngoingBookingData.pickupLat},${currentOngoingBookingData.pickupLng}`;
        const destination = `${currentOngoingBookingData.dropoffLat},${currentOngoingBookingData.dropoffLng}`;
        
        // Google Maps URL with directions
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        
        // Open in new tab
        window.open(googleMapsUrl, '_blank');
    }

})();
