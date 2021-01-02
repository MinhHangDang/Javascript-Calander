// create an array to store weekdays.
const week_days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// create an array to store months.
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// we are going to use the sessionStorage object in JavaScript. We could use localStorage but for the purpose of this application session is okay.
// this variable will hold the 'events' the user can add to their calender.
const sessionStorageName = "calendar-events";

// create the Calender class.
class Calendar
{
    // create a constructor for the class.
    constructor(calendar)
    {
        // initializing calendar.
        this.calendar = calendar;

        // create elements object. - gets data from our html id's/classes using a built function. -- * Explain the use of making an object containing our HTML elements. - Explain getFirstElement method * .
        this.elements = {

            // days/weeks/months/years.
            days: this.getFirstElement("days"),
            week: this.getFirstElement("weeks"),
            month: this.getFirstElement("months"),
            year: this.getFirstElement("currentYear"),

            // current week/day and years.
            currentDay: this.getFirstElement("currentDay"),
            currentWeekDay: this.getFirstElement("currentWeekDay"),
            prevYearSlider: this.getFirstElement("prevYearSlider"),
            nextYearSlider: this.getFirstElement("nextYearSlider"),

            // events.
            eventList: this.getFirstElement("eventList"),
            eventField: this.getFirstElement("eventField"),
            eventAddBtn: this.getFirstElement("eventAddBtn"),
        };

        // creates an 'event list' which will parse through the built-in JavaScript 'sessionStorage' object. https://www.w3schools.com/html/html5_webstorage.asp - https://stackoverflow.com/questions/6193574/save-javascript-objects-in-sessionstorage
        /* Explain the use of sessionStorage object. How its applicable in this project. Maybe compare to localStorage */
        this.eventList = JSON.parse(sessionStorage.getItem(sessionStorageName)) || {}; // empty array if sessionStorage is empty.

        this.date = +new Date();

        // set the max number of days to show on the calendar.
        // we use 37 because it allows use to show the next month's dates, while still viewing selected month.
        this.calendar.maxDays = 37;

        // call our functions.
        this.eventListeners();
        this.getAllElements();
    }// end of constructor.


    /* Explain how we use this function to get access to actual dates and real times - example: calendar = this.getCalendar() , calendar.prevYear, nextYear etc. */
    // create a function to get all current elements of calendar.
    getCalendar()
    {
        // this get the current date, this is how the calendar updates to real time.
        let currentTime = new Date(this.date);

        // return all elements in calendar.
        return {
            active: {
                /* custom functions with args. */
                days: this.countOfDaysInMonth(currentTime),
                startWeek: this.getStartDay(currentTime),
                /* built-in functions for day/week etc.. */
                day: currentTime.getDate(),
                week: currentTime.getDay(),
                month: currentTime.getMonth(),
                year: currentTime.getFullYear(),
                formatted: this.getFormattedDate(currentTime),
                newMonth: +currentTime,
            },
            prevMonth: new Date(currentTime.getFullYear(), currentTime.getMonth() - 1, 1),
            nextMonth: new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 1),
            prevYear: new Date(new Date(currentTime).getFullYear() - 1, 0, 1),
            nextYear: new Date(new Date(currentTime).getFullYear() + 1, 0, 1),
        };
    }// end of getCalendar().


    /* Explain how we used Event Listeners on our HTML elements so we can 'interact' with them. */
    // function will handle all of the user interactions with the calender. - When the user clicks on a month/day/year, it should change.
    eventListeners()
    {
        // when the previous year button/slider is clicked - update the time
        this.elements.prevYearSlider.addEventListener("click", (e) =>
        {
            // get calender object.
            let calendar = this.getCalendar();

            // update previous year.
            this.updateTime(calendar.prevYear);

            // call our getAll() function to update changes.
            this.getAllElements();
        });

        // next year.
        this.elements.nextYearSlider.addEventListener("click", (e) =>
        {
            // get calender object.
            let calendar = this.getCalendar();

            // update next year.
            this.updateTime(calendar.nextYear);

            // call our getAll() function to update changes.
            this.getAllElements();
        });

        // months.
        this.elements.month.addEventListener("click", (e) =>
        {
            // get calender object.
            let calendar = this.getCalendar();

            // get the month value from our HTML.
            let month = e.target.getAttribute("data-month");

            // validation - checks if user clicks same month - if they do, leave as is.
            if (!month || calendar.active.month === month) {
                return false;
            }// end of if.

            // get the new month.
            let newMonth = new Date(calendar.active.newMonth).setMonth(month);

            // update the time.
            this.updateTime(newMonth);

            // call our getAll() function to update changes.
            this.getAllElements();
        });

        // days.
        this.elements.days.addEventListener("click", (e) =>
        {
            // get the selected element.
            let element = e.target;

            // get the selected day/month/year.
            let day = element.getAttribute("data-day");
            let month = element.getAttribute("data-month");
            let year = element.getAttribute("data-year");

            // validation - if day doesn't exist, leave as is.
            if (!day) {
                return false;
            }// end of if.

            // save the date as a literal for updateTime function.
            let strDate = `${Number(month) + 1}/${day}/${year}`;

            // update the time.
            this.updateTime(strDate);

            // call our getAll() function to update changes.
            this.getAllElements();
        });

        // add event button.
        this.elements.eventAddBtn.addEventListener("click", (e) =>
        {
            // get the value from event field.
            let fieldValue = this.elements.eventField.value;

            // validation - if field value doesn't exist, leave as is.
            if (!fieldValue) {
                return false;
            }// end of if.

            let dateFormatted = this.getFormattedDate(new Date(this.date));

            // the eventList isn't formatted by date, format it.
            if (!this.eventList[dateFormatted]) {
                this.eventList[dateFormatted] = [];
            }// end of if.

            // add the the input field value to the end of the array.
            this.eventList[dateFormatted].push(fieldValue);

            // add the eventList to the sessionStorage.
            sessionStorage.setItem(sessionStorageName, JSON.stringify(this.eventList));

            // set default value.
            this.elements.eventField.value = "";

            // call our getAll function.
            this.getAllElements();
        });
    }// end of eventListeners().


    /* Explain the getXyz methods - the method of using 'templates' to hold our data. (everything has its own template. weekTemplate, monthTemplate, daysTemplate etc.) the template is actual HTML code */
    // function to 'get' the weekdays to the calendar.
    getWeekDays()
    {
        // initialize weekTemplate.
        let weekTemplate = "";

        // loop through week_days array and add to weekTemplate. -- adding the contents of week_days array to template. 0,3 is the number of letters displayed. (SUN, MON, TUE etc..)
        week_days.forEach((week) =>
        {
            weekTemplate += `<li>${week.slice(0, 3)}</li>`;
        });

        // send weekTemplate to HTML using our created objects.
        this.elements.week.innerHTML = weekTemplate;
    }// end of getWeekDays().

    // function to 'get' the months to the calendar.
    getMonths()
    {
        // initialize monthTemplate.
        let monthTemplate = "";

        // get calendar object.
        let calendar = this.getCalendar();

        // loop through our months array and add it monthTemplate.
        months.forEach((month, number) =>
        {
            monthTemplate += `<li class="${number === calendar.active.month ? "active" : ""}" data-month="${number}">${month}</li>`;
        });

        // send monthTemplate to HTML.
        this.elements.month.innerHTML = monthTemplate;
    }// end of getMonths().

    // function to 'get' the days.
    getDays()
    {
        // get calendar object.
        let calendar = this.getCalendar();

        // we will show the days in the previous month, in current months view. This looks cleaner and adds a nice feature.
        let latestDaysInPrevMonth = this.range(calendar.active.startWeek).map((day, number) =>
        {
            // return the properties we need.
            return {
                dayNumber: this.countOfDaysInMonth(calendar.prevMonth) - number,
                month: new Date(calendar.prevMonth).getMonth(),
                year: new Date(calendar.prevMonth).getFullYear(),
                currentMonth: false,
            };
        }).reverse(); // we need to reverse this because it should like the days are counting down.

        // this will get the number of days in the current month because not all months are equal.
        let daysInActiveMonth = this.range(calendar.active.days).map((day, number) =>
        {
            // adding +1 because the days of next month will start at 0 if not.
            let dayNumber = number + 1;
            // get today's date using Date() object.
            let today = new Date();

            // return the properties we need.
            return {
                dayNumber,
                today:
                    today.getDate() === dayNumber &&
                    today.getFullYear() === calendar.active.year &&
                    today.getMonth() === calendar.active.month,
                month: calendar.active.month,
                year: calendar.active.year,
                selected: calendar.active.day === dayNumber,
                currentMonth: true,
            };
        });

        // store the number of days for current month.
        let countOfDays = this.calendar.maxDays - (latestDaysInPrevMonth.length + daysInActiveMonth.length);

        // this will show the next months' day's, in the current month.
        let daysInNextMonth = this.range(countOfDays).map((day, number) =>
        {
            // return the properties we need.
            return {
                dayNumber: number + 1, // adding +1 because the days of next month will start at 0 if not.
                month: new Date(calendar.nextMonth).getMonth(),
                year: new Date(calendar.nextMonth).getFullYear(),
                currentMonth: false,
            };
        });

        // days is our 'full' calendar view, with previous, current, and future dates shown.
        let days = [...latestDaysInPrevMonth, ...daysInActiveMonth, ...daysInNextMonth];

        days = days.map((day) =>
        {
            let newDayParams = day;
            let formatted = this.getFormattedDate(new Date(`${Number(day.month) + 1} / ${day.dayNumber} / ${day.year}`));
            newDayParams.hasEvent = this.eventList[formatted];
            return newDayParams;
        });

        // create daysTemplate.
        let daysTemplate = "";

        // loop through days and add them to template.
        days.forEach((day) =>
        {
            // using the values we created, add to template.
            daysTemplate += `<li class="${day.currentMonth ? "" : "another-month"}${day.today ? " active-day " : ""}${day.selected ? "selected-day" : ""}${day.hasEvent ? " event-day" : ""}" data-day="${day.dayNumber}" data-month="${day.month}" data-year="${day.year}"></li>`;
        });

        // send daysTemplate to HTML.
        this.elements.days.innerHTML = daysTemplate;
    }// end of getDays().

    // function to 'get' the current year/day.
    getYearAndCurrentDay()
    {
        // get calendar object.
        let calendar = this.getCalendar();

        // send calendar object data to HTML.
        this.elements.year.innerHTML = calendar.active.year;
        this.elements.currentDay.innerHTML = calendar.active.day;
        this.elements.currentWeekDay.innerHTML = week_days[calendar.active.week];
    }// end of getYearAndCurrentDay().


    /* Maybe choose a couple of helper functions to showcase and explain. - such as getFormattedDate() and getStartDay() and how the were used. */
    // create a function which grabs the first element by id. - it takes the class name as parameter, making it reusable in constructor.
    getFirstElement(className)
    {
        return document.getElementById(this.calendar.id).getElementsByClassName(className)[0];
    }// end of getFirstElementInsideIdByClassName().

    // create a function to get the number of days in the current month.
    countOfDaysInMonth(time)
    {
        // call our getMonthAndYear function.
        let date = this.getMonthAndYear(time);
        return new Date(date.year, date.month + 1, 0).getDate();
    }// end of countOfDaysInMonth().

    // create a function to get the date of which the selected week starts on. For example does the 1st of March start on Monday, Tuesday, Wednesday etc...
    getStartDay(time)
    {
        let date = this.getMonthAndYear(time);
        return new Date(date.year, date.month, 1).getDay();
    }// end of getStartedDayOfWeekByTime().

    // function to 'get' eventList to calendar.
    /* Explain how this function loops over eventList array and adds to eventTemplate. */
    getEvents()
    {
        // get calendar object.
        let calendar = this.getCalendar();

        // get eventList if populated, else show there is 'no events!'.
        let eventList = this.eventList[calendar.active.formatted] || ["No events!"];

        // initialize eventTemplate.
        let eventTemplate = "";

        // loop through eventList array (which is in sessionStorage) and add each to eventTemplate.
        eventList.forEach((item) =>
        {
            eventTemplate += `<li>${item}</li>`;
        });

        // send eventTemplate to HTML.
        this.elements.eventList.innerHTML = eventTemplate;
    }// end of getEvents().

    // create a function to instantiate new Date obj - this will be used to update the new/current time.
    updateTime(time)
    {
        this.date = new Date(time);
    }// end of updateTime.

    // create a function that returns a formatted date. - we put this in a literal so we can perform some in-line expressions with it.
    getFormattedDate(date)
    {
        return `${date.getDate()} / ${date.getMonth()} / ${date.getFullYear()}`;
    }// end of getFormattedDate().

    // create a function to get the current month and year.
    getMonthAndYear(time)
    {
        // set new date object.
        let date = new Date(time);

        // return current year and month.
        return {
            year: date.getFullYear(),
            month: date.getMonth(),
        };
    }// end of getMonthAndYear().

    // this function will fill the array using the map function.
    range(number)
    {
        return new Array(number).fill().map((e, i) => i);
    }// end of range().

    // encapsulate all our functions into one for easier calling.
    getAllElements()
    {
        this.getWeekDays();
        this.getMonths();
        this.getDays();
        this.getYearAndCurrentDay();
        this.getEvents();
    }// end of getAllElements().
}// end of class.

// call our calender object from our calender class.
(function ()
{
    new Calendar({id: "calendar"});
})();