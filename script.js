const table = document.querySelector(".table");

class Event {
   name;
   _durationHours;
   _durationMinutes;
   _startHours;
   _startMinutes;
   constructor(n, dH, dM, sH, sM) {
      this.name = n;
      this._durationHours = dH;
      this._durationMinutes = dM;
      this._startHours = sH;
      this._startMinutes = sM;
   }
   getStartTime() {
      let h = this.startHours;
      let m = this.startMinutes;
      if (this.startMinutes < 10) m = "0" + m;
      return `${h}:${m}`;
   }
   getDurationTime() {
      let h = this._durationHours;
      let m = this._durationMinutes;
      if (this._durationMinutes < 10) m = "0" + m;
      return `${h}:${m}`;
   }
   get durationHours() {
      return this._durationHours;
   }
   set durationHours(h) {
      if (h >= 24) this._durationHours = h - 24;
      else this._durationHours = h;
   }
   get durationMinutes() {
      return this._durationMinutes;
   }
   set durationMinutes(m) {
      if (m >= 60) {
         this._durationMinutes = m - 60;
         this._durationHours++;
      } else this._durationMinutes = m;
   }
   get startHours() {
      return this._startHours;
   }
   set startHours(h) {
      if (h >= 24) this._startHours = h - 24;
      else this._startHours = h;
   }
   get startMinutes() {
      return this._startMinutes;
   }
   set startMinutes(m) {
      if (m >= 60) {
         this._startMinutes = m - 60;
         this._startHours++;
      } else this._startMinutes = m;
   }
}

const work = "<strong>&weierp;</strong>"
const rest = "&#9775;"

let eventsTemplates = [
   // Work at home
   [
      new Event("[сон]", 1, 00, 5, 40),
      new Event("Утренний туалет", 0, 20),
      new Event("Слова", 0, 20),
      new Event("Работа", 2, 00),
      new Event("Еда", 0, 20),
      new Event(rest, 1, 30),
      new Event("Тренировка, растяжка", 0, 40),
      new Event("Еда", 0, 20),
      new Event("Работа", 2, 00),
      new Event("Тренировка, растяжка", 0, 40),
      new Event("Еда", 0, 20),
      new Event("Работа", 2, 00),
      new Event("Тренировка, растяжка", 0, 40),
      new Event("Еда", 0, 20),
      new Event("Работа", 2, 00),
      new Event("Душ", 0, 20),
      new Event("Новости", 0, 30),
      new Event("Слова", 0, 20),
      new Event("Подготовка ко сну", 0, 20),
      new Event("Сон", 8, 00),
   ],
   // Work in office
   [
      new Event("[сон]", 1, 00, 5, 40),
      new Event("Утренний туалет", 0, 20),
      new Event("Слова", 0, 20),
      new Event("-->", 0, 40),
      new Event("Работа", 9, 45),
      new Event("<--", 0, 45),
      new Event("Пробежка", 0, 30),
      new Event("Душ", 0, 20),
      new Event("Еда", 0, 20),
      new Event("Новости", 0, 30),
      new Event("Слова", 0, 20),
      new Event("Тренировка выносливости", 0, 50),
      new Event("Подготовка ко сну", 0, 20),
      new Event("Сон", 8, 00),
   ],
];

let indexDescr = ["Дома", "В офисе"];
let currentIndex = localStorage.getItem('currentIndex') || 0;
if (currentIndex >= eventsTemplates.length) currentIndex = 0;
let events = eventsTemplates[currentIndex];

start();
initialize();
let repeat = setInterval(monitoring, 1000);
monitoring();

table.addEventListener("click", () => {
   currentIndex++
   if (currentIndex >= eventsTemplates.length) currentIndex = 0;
   events = eventsTemplates[currentIndex];
   localStorage.setItem('currentIndex', currentIndex)
   start();
   initialize();
   monitoring();
});

function start() {
   // Calculate and set start times
   for (let k in events) {
      if (k < 1) k = 1;
      events[k].startHours =
         events[k - 1].startHours + events[k - 1].durationHours;
      events[k].startMinutes =
         events[k - 1].startMinutes + events[k - 1].durationMinutes;
   }
}

function initialize() {
   table.innerHTML = "<div class='title'></div>";
   for (let k in events) {
      table.innerHTML += `
        \<div class="event" id="ev${k}"\>
            \<div class="start-time"\>${events[k].getStartTime()}\</div\>
            \<div class="name"\>${events[k].name}\</div\>
            \<div class="duration"\>${events[k].getDurationTime()}\</div\>
            \<div class="remaining-time"\>\</div\>
        \</div\>`;
   }
   let temp = { ...events[events.length - 1] };
   // temp.getStartTime = events[events.length - 1].getStartTime;
   temp.__proto__ = events[events.length - 1].__proto__;
   temp.startHours += events[events.length - 1].durationHours;
   temp.startMinutes += events[events.length - 1].durationMinutes;
   if (temp.getStartTime() !== events[0].getStartTime()) {
      console.error('Total time mismatch');
      console.log(
         temp.startHours - events[0].startHours,
         temp.startMinutes - events[0].startMinutes
      );
      // alert("Total time mismatch");
   }
}

function monitoring() {
   let currentTime = new Date();
   // currentTime.setHours(20);
   // currentTime.setMinutes(50);
   document.querySelector(".title").textContent = indexDescr[currentIndex];
   let currentEventIndex = getCurrentEvent(currentTime);
   setActiveEvent(currentEventIndex);
   calcAndSetCompleteness(currentEventIndex, currentTime);
   calcAndSetInfo(currentTime);
}

function getCurrentEvent(currentTime) {
   for (let k in events) {
      if (k == events.length - 1) return k;
      if (
         ((currentTime.getHours() == events[k].startHours &&
            currentTime.getMinutes() >= events[k].startMinutes) ||
            currentTime.getHours() > events[k].startHours) &&
         ((currentTime.getHours() == events[+k + 1].startHours &&
            currentTime.getMinutes() < events[+k + 1].startMinutes) ||
            currentTime.getHours() < events[+k + 1].startHours)
      ) {
         return k;
      }
   }
}

function setActiveEvent(k) {
   for (let i = 0; i < k; i++) {
      document.querySelector(`#ev${i}`).classList = "event past";
   }
   document.querySelector(`#ev${k}`).classList = "event active";
   let i;
   while (i < events.length) {
      if (i < k) {
         const element = document.querySelector(`#ev${i}`);
         element.classList = "event past";
         element.textContent = element.textContent.split(' ')[0]
      } else if (i > k) {
         document.querySelector(`#ev${i}`).classList = "event future";
      } else {
         document.querySelector(`#ev${k}`).classList = "event active";
      }
   }
}

function calcAndSetCompleteness(k, currentTime) {
   let timePast =
      currentTime.getHours() * 60 +
      currentTime.getMinutes() -
      events[k].startHours * 60 -
      events[k].startMinutes;
   if (timePast < 0) timePast += 1440;
   let totalDuration = events[k].durationHours * 60 + events[k].durationMinutes;
   let completeness = (timePast / totalDuration) * 100;
   let timeRemaining = totalDuration - timePast;
   let hRem = Math.floor(timeRemaining / 60);
   let mRem = timeRemaining % 60;
   if (mRem < 10) mRem = "0" + mRem;

   if (hRem || mRem != 0) {
      // Set percentage background fill
      document.querySelector(
         `#ev${k} .name`
      ).style.background = `linear-gradient(to right,
            #0070bb88 ${completeness - 1}%,
            #afddfc ${completeness + 1}%)`;

      // Set remaining time
      document.querySelector(
         `#ev${k} .remaining-time`
      ).textContent = ` ( ${hRem}:${mRem} ) `;
   } else {
      // Clear inline styling
      document.querySelector(`#ev${k} .name`).style.background = "";
      document.querySelector(`#ev${k} .remaining-time`).textContent = "";
   }
}

function calcAndSetInfo(currentTime) {
   const sleepTime = {
      h: events[events.length - 2].startHours,
      m: events[events.length - 2].startMinutes,
   };
   let remTime = {
      h: sleepTime.h - currentTime.getHours(),
      m: sleepTime.m - currentTime.getMinutes(),
   };
   if (remTime.m < 0) {
      remTime.m += 60;
      remTime.h--;
   }
}
