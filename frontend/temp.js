function generateColorCalendar() {
    const calendar = {};
    const today = new Date();
    const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    for (let d = new Date(today); d <= oneMonthLater; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD format
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        calendar[dateString] = randomColor;
    }

    return calendar;
}

// Example usage:
const colorCalendar = generateColorCalendar();
console.log(colorCalendar);

// To get color for a specific date:
const today = new Date().toISOString().split('T')[0];
console.log(`Today's color: ${colorCalendar[today]}`);
