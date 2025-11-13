// Schedule Page - Booking Modal Management
(function() {
    'use strict';

    // Modal elements
    const rideConfirmedModal = document.getElementById('rideConfirmedModal');
    const bookingDetailsModal = document.getElementById('bookingDetailsModal');
    const confirmArrivalModal = document.getElementById('confirmArrivalModal');

    // Current booking data
    let currentBookingData = null;
    let map = null;
    let pickupMarker = null;
    let dropoffMarker = null;
    let routeLine = null;

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initBookingAcceptance();
        initModalControls();
        initOngoingViewButtons();
    });

    // Initialize booking acceptance buttons
    function initBookingAcceptance() {
        const acceptButtons = document.querySelectorAll('.btn-accept');
        
        acceptButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Store booking data from button attributes
                currentBookingData = {
                    id: this.dataset.id,
                    passenger: this.dataset.passenger,
                    phone: this.dataset.phone,
                    pickup: this.dataset.pickup,
                    pickupLat: parseFloat(this.dataset.pickupLat),
                    pickupLng: parseFloat(this.dataset.pickupLng),
                    dropoff: this.dataset.dropoff,
                    dropoffLat: parseFloat(this.dataset.dropoffLat),
                    dropoffLng: parseFloat(this.dataset.dropoffLng),
                    distance: this.dataset.distance,
                    time: this.dataset.time,
                    datetime: this.dataset.datetime,
                    payment: this.dataset.payment,
                    fare: this.dataset.fare
                };

                // Show Ride Confirmed modal
                showRideConfirmedModal();
            });
        });
    }

    // Initialize modal control buttons
    function initModalControls() {
        // Ride Confirmed Modal
        document.getElementById('closeRideConfirmed')?.addEventListener('click', closeRideConfirmedModal);
        document.getElementById('proceedToDetails')?.addEventListener('click', proceedToBookingDetails);
        document.getElementById('cancelRideConfirmed')?.addEventListener('click', closeRideConfirmedModal);

        // Booking Details Modal
        document.getElementById('closeBookingDetails')?.addEventListener('click', closeBookingDetailsModal);
        document.getElementById('arrivedAtPickupBtn')?.addEventListener('click', showConfirmArrivalModal);
        document.getElementById('cancelBookingBtn')?.addEventListener('click', cancelBooking);
        document.getElementById('contactPassengerBtn')?.addEventListener('click', contactPassenger);

        // Confirm Arrival Modal
        document.getElementById('closeConfirmArrival')?.addEventListener('click', closeConfirmArrivalModal);
        document.getElementById('cancelArrivalBtn')?.addEventListener('click', closeConfirmArrivalModal);
        document.getElementById('confirmArrivalBtn')?.addEventListener('click', confirmArrival);

        // Ongoing Modal
        document.getElementById('closeOngoingBooking')?.addEventListener('click', closeOngoingBookingModal);
        document.getElementById('ongoingAcceptBtn')?.addEventListener('click', acceptOngoingBooking);
        document.getElementById('ongoingCancelBtn')?.addEventListener('click', cancelOngoingBooking);
        document.getElementById('contactOngoingPassengerBtn')?.addEventListener('click', contactPassenger);

        // Close on overlay click
        rideConfirmedModal?.querySelector('.modal-overlay')?.addEventListener('click', closeRideConfirmedModal);
        bookingDetailsModal?.querySelector('.modal-overlay')?.addEventListener('click', closeBookingDetailsModal);
        confirmArrivalModal?.querySelector('.modal-overlay')?.addEventListener('click', closeConfirmArrivalModal);
    }

    // Show Ride Confirmed Modal
    function showRideConfirmedModal() {
        rideConfirmedModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeRideConfirmedModal() {
        rideConfirmedModal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Proceed to Booking Details
    function proceedToBookingDetails() {
        closeRideConfirmedModal();
        setTimeout(() => {
            showBookingDetailsModal();
        }, 300);
    }

    // Show Booking Details Modal with Map
    function showBookingDetailsModal() {
        if (!currentBookingData) return;

        // Populate modal with booking data
        document.querySelector('.booking-id').textContent = `ID: ${currentBookingData.id}`;
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
        
        // Clear existing map if any
        if (map) {
            map.remove();
        }

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

        // Add Google Maps button
        addGoogleMapsButton();

        // Force map to resize
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
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
        const button = L.control({ position: 'bottomright' });
        
        button.onAdd = function(map) {
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
            document.getElementById('openGoogleMaps')?.addEventListener('click', openInGoogleMaps);
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
        closeBookingDetailsModal();
        
        // Show success message (you can customize this)
        setTimeout(() => {
            alert('Arrival confirmed! Passenger has been notified.');
            // Here you would typically:
            // 1. Update the booking status in the database
            // 2. Move the booking to the "Ongoing" tab
            // 3. Start the trip
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
        // Close current modal
        if (bookingDetailsModal.classList.contains('show')) {
            closeBookingDetailsModal();
        } else if (ongoingBookingModal && ongoingBookingModal.classList.contains('show')) {
            closeOngoingBookingModal();
        }
        
        // Store passenger data in sessionStorage for messages page
        if (currentBookingData) {
            sessionStorage.setItem('contactPassenger', JSON.stringify({
                name: currentBookingData.passenger,
                phone: currentBookingData.phone,
                bookingId: currentBookingData.id
            }));
        }
        
        // Redirect to messages page
        window.location.href = 'messages.html';
    }

    // Accept Ongoing Booking
    function acceptOngoingBooking() {
        closeOngoingBookingModal();
        
        // Show success message
        setTimeout(() => {
            alert('Booking accepted! You can now proceed with the ride.');
            // Here you would typically:
            // 1. Update booking status to "accepted" in the database
            // 2. Notify the passenger
            // 3. Enable navigation/tracking features
        }, 300);
    }

    // Cancel Ongoing Booking
    function cancelOngoingBooking() {
        if (confirm('Are you sure you want to cancel this ongoing booking?')) {
            closeOngoingBookingModal();
            currentBookingData = null;
            
            // Here you would typically:
            // 1. Send cancellation to the backend
            // 2. Update booking status
            // 3. Notify the passenger
        }
    }

    // ========================================
    // ONGOING BOOKING MODAL
    // ========================================

    const ongoingBookingModal = document.getElementById('ongoingBookingModal');
    let ongoingMap = null;
    let ongoingPickupMarker = null;
    let ongoingDropoffMarker = null;
    let ongoingRouteLine = null;
    let ongoingCarMarker = null;

    // Initialize View Details buttons for ongoing bookings
    function initOngoingViewButtons() {
        const viewDetailsButtons = document.querySelectorAll('.btn-view-details');
        
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.booking-card');
                
                // Extract data from the card
                const bookingData = {
                    id: '3131',
                    passenger: card.querySelector('.booking-passenger')?.textContent.trim().split('\n')[0] || 'Juan Dela Cruz',
                    phone: '09434325223',
                    pickup: card.querySelectorAll('.route-item')[0]?.querySelector('span')?.textContent || 'SM North EDSA',
                    pickupLat: 14.6560,
                    pickupLng: 121.0320,
                    dropoff: card.querySelectorAll('.route-item')[1]?.querySelector('span')?.textContent || 'QC Circle',
                    dropoffLat: 14.6488,
                    dropoffLng: 121.0499,
                    distance: '4.2 km',
                    time: '45 mins',
                    datetime: 'Sept 15, 2025 • 08:30 AM',
                    payment: 'Cash',
                    fare: card.querySelector('.booking-price')?.textContent || '₱126'
                };

                showOngoingBookingModal(bookingData);
            });
        });

        // Close button
        document.getElementById('closeOngoingBooking')?.addEventListener('click', closeOngoingBookingModal);
        
        // Close on overlay click
        ongoingBookingModal?.querySelector('.modal-overlay')?.addEventListener('click', closeOngoingBookingModal);
    }

    function showOngoingBookingModal(bookingData) {
        if (!bookingData) return;

        // Store current booking data
        currentBookingData = bookingData;

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
            ongoingMap.remove();
        }

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

        // Fix map rendering issue
        setTimeout(() => {
            ongoingMap.invalidateSize();
        }, 200);
    }

})();
