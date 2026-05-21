# Perfectly Fast Moving - Landing Page

A modern, conversion-optimized landing page for Perfectly Fast Moving, designed based on industry-leading moving company websites.

## Features

### 🎯 Conversion-Focused Design
- **Trust Badges**: Prominent display of ratings (4.9/5.0), families moved, and recent bookings
- **Multi-Step Quote Form**: User-friendly 3-step form with progress indicators
- **Prominent Phone Number**: Call-to-action displayed throughout the page
- **Social Proof**: Customer testimonials and review sections

### 📱 Responsive Design
- Fully responsive layout that works on all devices
- Mobile-optimized navigation menu
- Touch-friendly form inputs and buttons

### ⚡ Key Sections

1. **Top Bar**: License information and phone number
2. **Hero Section**: Eye-catching hero with trust badges and primary CTA
3. **Quote Form**: Multi-step form with progress tracking
4. **Services**: Showcase of moving services (Long Distance, Packing & Storage, Office, Military)
5. **About Section**: Company information and mission
6. **Reviews**: Customer testimonials
7. **FAQ**: Frequently asked questions with accordion functionality
8. **CTA Sections**: Multiple call-to-action sections throughout
9. **Support Section**: Customer support information
10. **Footer**: Contact information and quick links

## Files Structure

```
PFM-GM/
├── index.html      # Main HTML file
├── styles.css      # All styling and responsive design
├── script.js       # Interactive functionality
└── README.md       # This file
```

## Setup

1. Open `index.html` in a web browser
2. No build process or dependencies required - it's pure HTML, CSS, and JavaScript

## Customization

### Update Phone Number
The phone number 845-834-8101 is used throughout the site.

### Update Counter Numbers
In `script.js`, update the counter values:
```javascript
const familiesMoved = 30000;  // Update with actual number
const recentBookings = 12;   // Update with actual number
```

### Update Logo
The logo is currently loaded from your WordPress site. To use a local logo:
1. Add your logo file to the project folder
2. Update the logo `src` in `index.html`:
```html
<img src="your-logo.png" alt="Perfectly Fast Moving Logo">
```

### Form Submission
Currently, the form shows an alert on submission. To connect to a backend:

1. Update the form submission handler in `script.js`
2. Replace the alert with an API call to your backend
3. Add proper error handling and success messages

Example:
```javascript
quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(quoteForm);
    
    try {
        const response = await fetch('/api/quote', {
            method: 'POST',
            body: formData
        });
        // Handle response
    } catch (error) {
        // Handle error
    }
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Design Inspiration

This landing page is designed based on industry-leading moving company websites:
- Safe Ship Moving Services
- Vantage Movers
- AmeriSafe Van Lines

## License

© 2024 Perfectly Fast Moving. All rights reserved.
