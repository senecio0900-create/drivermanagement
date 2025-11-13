# JourneoLink Driver - Schedule Booking Workflow

## Overview
The schedule page now includes a complete booking acceptance workflow with three modal dialogs and an interactive Leaflet map showing the route between pickup and dropoff locations.

## Workflow Steps

### 1. Accept Booking
- Driver clicks "Accept" button on any booking card
- **Ride Confirmed Modal** appears with message: "Proceed to the passenger's pickup point"
- Driver clicks "Okay" to proceed

### 2. View Booking Details
- **Booking Details Modal** opens showing:
  - Booking ID
  - Passenger name and phone number
  - Pickup and dropoff locations
  - Route distance and estimated time
  - Trip date/time
  - Payment method
  - Total fare
  - **Interactive Leaflet Map** with:
    - Pickup marker (orange pin)
    - Dropoff marker (red pin)
    - Route line connecting both locations
    - Auto-fit bounds to show entire route

### 3. Arrive at Pickup
- Driver clicks "Arrived at Pickup Location" button
- **Confirm Arrival Modal** appears asking for confirmation
- Driver clicks "Yes, Arrived" to confirm

## Features Implemented

### Interactive Map (Leaflet.js)
- Real-time route visualization
- Custom colored markers for pickup/dropoff
- Dashed line showing route path
- Auto-centered and auto-zoomed to fit route
- Popups on markers showing location names

### Data Structure
Each booking card now includes data attributes:
- `data-id`: Booking ID
- `data-passenger`: Passenger name
- `data-phone`: Contact number
- `data-pickup`: Pickup location name
- `data-pickup-lat`: Pickup latitude
- `data-pickup-lng`: Pickup longitude
- `data-dropoff`: Dropoff location name
- `data-dropoff-lat`: Dropoff latitude
- `data-dropoff-lng`: Dropoff longitude
- `data-distance`: Route distance
- `data-time`: Estimated time
- `data-datetime`: Trip date and time
- `data-payment`: Payment method
- `data-fare`: Total fare

### Modal Types

#### 1. Ride Confirmed Modal (Small)
- Simple confirmation message
- Single "Okay" button
- Auto-proceeds to details

#### 2. Booking Details Modal (Large)
- Two-column layout (details + map)
- Complete trip information
- Interactive map on the right
- Action buttons:
  - "Arrived at Pickup Location" (primary)
  - "Cancel" (secondary)

#### 3. Confirm Arrival Modal (Small)
- Confirmation dialog
- Two buttons:
  - "Cancel"
  - "Yes, Arrived" (primary)

## Technologies Used

### Leaflet.js
- Version: 1.9.4
- CDN: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- Map tiles: OpenStreetMap

### Custom Features
- Custom map markers using Font Awesome icons
- Green theme matching brand color (#3F562C)
- Responsive design for mobile devices
- Smooth modal transitions

## Files Modified/Created

### Created:
- `js/schedule.js` - Complete booking workflow logic and map initialization

### Modified:
- `html/schedule.html` - Added Leaflet CDN, modal structures, data attributes
- `css/schedule.css` - Added modal styles, map styles, responsive rules

## Sample Bookings

### Booking 1 (ID: 3131)
- Passenger: Juan Dela Cruz (09434323233)
- Route: SM North EDSA → QC Circle
- Coordinates: (14.6564, 121.0321) → (14.6505, 121.0490)
- Distance: 4.2 km, Time: 45 mins
- Fare: ₱126, Payment: Cash

### Booking 2 (ID: 3132)
- Passenger: Maria Santos (09123456789)
- Route: Trinoma Mall → Manila City Hall
- Coordinates: (14.6568, 121.0332) → (14.5995, 120.9842)
- Distance: 6.8 km, Time: 55 mins
- Fare: ₱180, Payment: GCash

### Booking 3 (ID: 3133)
- Passenger: Pedro Reyes (09987654321)
- Route: UP Diliman → Eastwood City
- Coordinates: (14.6537, 121.0685) → (14.6091, 121.0794)
- Distance: 5.5 km, Time: 38 mins
- Fare: ₱150, Payment: Cash

## Future Enhancements

### API Integration (Recommended)
1. **Real-time Route API**: Integrate Google Maps Directions API or similar for actual road routes instead of straight lines
2. **Live GPS Tracking**: Show driver's current location on the map
3. **Traffic Data**: Display real-time traffic conditions
4. **ETA Updates**: Calculate dynamic arrival times based on traffic

### Backend Integration
- Save accepted bookings to database
- Update booking status (pending → accepted → in-progress → completed)
- Send notifications to passengers
- Track driver location in real-time
- Store trip history

### Additional Features
- Voice navigation integration
- Multi-stop route support
- Weather overlay on map
- Nearby landmarks display
- Alternative route suggestions

## Usage

1. Open `schedule.html` in a browser (requires XAMPP or web server)
2. Click any "Accept" button on a booking card
3. Follow the modal workflow:
   - Ride Confirmed → Okay
   - View booking details with map
   - Arrived at Pickup Location → Yes, Arrived

## Notes

- Map requires internet connection (uses OpenStreetMap tiles)
- Coordinates are for Metro Manila, Philippines
- All data is currently hardcoded for demonstration
- Ready for backend API integration
- Fully responsive on mobile devices
