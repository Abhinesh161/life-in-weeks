// Function to download the time line in PDF
function downloadTimelinePDF() {
  const timeline = document.querySelector(".timeline");
  if (!timeline) {
    alert("Oops! It looks like there's no timeline to export.");
    return;
  }

  const clonedTimeline = timeline.cloneNode(true);
  clonedTimeline.style.width = timeline.scrollWidth + "px";
  clonedTimeline.style.height = timeline.scrollHeight + "px";

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.appendChild(clonedTimeline);
  document.body.appendChild(container);

  html2pdf().set({
    margin: 0.2,
    filename: 'my_life_timeline.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: 0,
    },
    jsPDF: { unit: 'px', format: 'a2', orientation: 'portrait' }
  }).from(clonedTimeline).save().then(() => {
    document.body.removeChild(container);
  });
}

// Function to export the events and DOB
function exportEvents() {
  const events = JSON.parse(localStorage.getItem("personalEvents") || "[]");
  const birthdate = localStorage.getItem("birthdate");

  const data = {
    birthdate: birthdate,
    events: events
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "my_life_timeline_data.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Function to import the events and DOB
function importEvents(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);

      if (
        typeof importedData !== "object" ||
        !Array.isArray(importedData.events) ||
        typeof importedData.birthdate !== "string"
      ) {
        throw new Error("Invalid file format");
      }

      localStorage.setItem("birthdate", importedData.birthdate);
      localStorage.setItem("personalEvents", JSON.stringify(importedData.events));
      document.getElementById("birthdate").value = importedData.birthdate;

      alert("✅ Data imported successfully! Generating your timeline...");
      generateTimeline();
    } catch (err) {
      alert("❌ Failed to import: Invalid JSON format.");
    }
  };
  reader.readAsText(file);
}

// Function to generate time line
function generateTimeline() {
  const birthdateInput = document.getElementById('birthdate').value; //Store the DOB in variable name "birthdateInput".

  //If the user didn't eneter the DOB and Press the "Show my timeline" then it will show this alret.
  if (!birthdateInput) {
    alert("Please enter your birthdate to see your timeline!");
    return;
  }

  // It will store the DOB in variable name "storedBirthdate" from the local storage.
  const storedBirthdate = localStorage.getItem("birthdate");

  // If the birthdate stored in the variable is not same as newely enterd birthdate then it will pop up message.
  if (storedBirthdate && storedBirthdate !== birthdateInput) {
    const confirmReset = confirm("Your birthdate has changed. This will erase your saved events. Continue?"); //If the user confirm the the pop up then it will store the pop up input in the variable name "confirmReset".

    // If confirmReset is true then it will remove the saved events from the local storage else it will return back.
    if (confirmReset) {
      localStorage.removeItem("personalEvents"); //remove item which was stored in name "personalEvents".
    } else {
      return;
    }
  }

  localStorage.setItem("birthdate", birthdateInput); // It will save the DOB in the local storage by the key name as "birthdate".
  const birthDate = new Date(birthdateInput); //It will create DOB as a object name "Date" and store it into birthDate.
  const today = new Date(); //It will store current date into variable name "today".
  const maxWeeks = 90 * 52; //It will store the no. of weeks in the 90 years i.e. 4680 weeks
  const weeksLived = Math.floor((today - birthDate) / (7 * 24 * 60 * 60 * 1000)); //It will calculate the no. of weeks you lived until now and store it into the variable name "weeksLived".

  document.getElementById("weeksLived").innerText = `🎉 You've lived ${weeksLived} weeks so far! 🎉`; //It will display the the message for how many weeks you lived.   .innerText :- Will change the text inside that paragraph id name as "weeksLived".

  const timeline = document.getElementById("timeline"); //It will store the created space with the id name "timeline" in the variable name "timeline".
  timeline.innerHTML = ""; //It will erase all the data which was stored in variable "timeline".

  const savedEvents = JSON.parse(localStorage.getItem("personalEvents") || "[]"); //it will sore the data present in the local storage in the form of json and store it in variable name "savedEvents".
  let prevYear = null;
  let yearRow = null;

  for (let i = 0; i < maxWeeks; i++) {
    const weekDate = new Date(birthDate.getTime() + i * 7 * 24 * 60 * 60 * 1000); //This is the date of the current week in our loop..
    const currentYear = weekDate.getFullYear(); //store the year acc. to "weekDate".

    if (currentYear !== prevYear) {
      const yearLabel = document.createElement("div"); //add the div in html and named as "yearLabel".
      yearLabel.classList.add("year-label"); //create class named "year-label" for styling.
      yearLabel.innerText = `Year ${currentYear}`; //Print the current year.
      timeline.appendChild(yearLabel); //help to print the current year under "timeline".

      yearRow = document.createElement("div");//add the div in html and named as "yearRow".
      yearRow.classList.add("year-row");//create class named "yearRow" for styling.
      timeline.appendChild(yearRow);//help to print the current year under "timeline".


      prevYear = currentYear;
    }

    const weekBox = document.createElement("div"); //Create div in html by name "weekkBox".
    weekBox.classList.add("week"); //create class named "week" for styling.
    weekBox.innerText = i + 1; //Print the no. of week in the box.
    weekBox.setAttribute("data-week", i); //Give tag to each box as a 'i' by name "data-week".
    weekBox.title = `Week ${i + 1} — Age: ${(i / 52).toFixed(1)} years`; //It will create tooltip for each box— when you hover your mouse over the box, this info pops up.

    const birthDay = birthDate.getDate(); //It will store the birth-day in variable name "birthDay".
    const birthMonth = birthDate.getMonth(); //It will store the birth-Month in variable name "birthMonth".
    const sameYearBirthday = new Date(weekDate.getFullYear(), birthMonth, birthDay); //It will create the new year's birthday DOB.

    const weekStart = new Date(weekDate); //It will store the date of started week of month.
    const weekEnd = new Date(weekDate);  //It will store the date of ended week of month.
    weekEnd.setDate(weekEnd.getDate() + 6); //It is giving me the end date of that week.

    // If new year's birthday DOB in coming in between in that week thent he if statement work--->
    if (sameYearBirthday >= weekStart && sameYearBirthday <= weekEnd) {
      weekBox.classList.add("birthday");  //create class named "birthday" for styling.
      weekBox.title += "\n🎂 Your Birthday Week!"; //It will create tooltip.
    }

    const weekNumberInYear = Math.floor((weekDate - new Date(weekDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)) + 1; //It will store the week no. acc. to the date.


    //It will give the new-year week
    if (weekNumberInYear === 1) {
      weekBox.classList.add("newyear");
      weekBox.title += "\n🎉 Happy New Year!";
    }

    //It will colour the border-red of current week.
    if (i === weeksLived) {
      weekBox.style.border = "3px solid red";
    }

    const matchedEvent = savedEvents.find(e => e.week === i); //This line is searching in the list of events you saved before (from localStorage), and it's trying to find if any event happened in the current week (i).
    if (matchedEvent) {
      weekBox.classList.add("milestone");//create class named "milestone" for styling.
      const eventLabel = document.createElement("div"); //create div in html named as "eventLabel".
      eventLabel.style.fontSize = "10px";
      eventLabel.style.fontWeight = "600";
      eventLabel.style.textAlign = "center";
      eventLabel.style.padding = "2px";
      eventLabel.style.lineHeight = "1.2";
      eventLabel.style.color = "#fff";

      //If event name is more tha 15 words then it will add "...".

      eventLabel.innerText = matchedEvent.event.length > 15  //Print the event name inside the box.
        ? matchedEvent.event.slice(0, 15) + "…"
        : matchedEvent.event;

      eventLabel.title = matchedEvent.event;  // Full event text on hover.

      weekBox.innerHTML = ""; // Clear previous week number.
      weekBox.appendChild(eventLabel); //Then add the event name inside the box.
    }


    weekBox.addEventListener("click", () => { //If user click the box --->
      const event = prompt("What special event happened this week?");// Then this will pop up and ask to enter event
      if (event) {                //If user entered something then--->
        const index = savedEvents.findIndex(e => e.week === i);  //check weather the current box have already some event then--->
        if (index !== -1) {   //If yes then it clear that event and allow user to enter new event
          savedEvents[index].event = event;
        } else {
          savedEvents.push({ week: i, event });
        }
        localStorage.setItem("personalEvents", JSON.stringify(savedEvents));   //his rebuilds the timeline to show the new event on screen immediately.
        generateTimeline();
      }
    });

    yearRow.appendChild(weekBox);//It add week box in yearRow
  }
}
