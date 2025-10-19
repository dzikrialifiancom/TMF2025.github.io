const Days = document.getElementById('days');
const Hours = document.getElementById('hours');
const Minutes = document.getElementById('minutes');
const Secconds = document.getElementById('secconds');

const targetDate = new Date("October 30 2025 00:00:00").getTime();

function timer (){
    const currentDate = new Date().getTime();
    const distance = targetDate - currentDate;

    const days = Math.floor(distance / 1000 / 60 / 60 / 24);
    const hours = Math.floor(distance / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(distance / 1000 / 60) % 60;
    const secconds = Math.floor(distance / 1000) % 60;

    Days.innerHTML = days;
    Hours.innerHTML = hours;
    Minutes.innerHTML = minutes;
    Secconds.innerHTML = secconds;
}

setInterval(timer,1000)
