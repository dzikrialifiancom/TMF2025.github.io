document.addEventListener('DOMContentLoaded', function() {
    
    // =======================================================
    // A. LOGIKA SCROLL LOCK (Optional, Uncomment untuk mengaktifkan)
    // =======================================================
    const body = document.body;
    
    /* function lockScroll() {
        body.style.overflow = 'hidden';
        setTimeout(() => {
            body.style.overflow = '';
            // Anda mungkin ingin menambahkan kelas fade-in di sini
        }, 3000); // Kunci selama 3 detik
    }
    lockScroll();
    */ 

    // =======================================================
    // B. COUNTDOWN TIMER (6 November 2025)
    // =======================================================
    const targetDate = new Date('November 6, 2025 19:30:00').getTime();

    const countdownFunction = setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const updateText = (id, value) => {
            const el = document.getElementById(id);
            if(el) el.textContent = String(value).padStart(2, '0');
        };

        updateText("days", days);
        updateText("hours", hours);
        updateText("minutes", minutes);
        updateText("seconds", seconds);

        if (distance < 0) {
            clearInterval(countdownFunction);
            const countdownEl = document.getElementById("countdown");
            if(countdownEl) countdownEl.innerHTML = "<h2>ACARA SEDANG BERLANGSUNG!</h2>";
        }
    }, 1000);


    // =======================================================
    // C. COUNTER ANGKA INTERAKTIF PADA SCROLL
    // =======================================================
    function animateCounter(element, targetValue) {
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * targetValue);
            
            const targetText = element.dataset.target;
            const suffix = targetText.endsWith('+') ? '+' : '';
            element.textContent = currentValue.toLocaleString('id-ID') + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        requestAnimationFrame(updateCount);
    }
    
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counterElement = entry.target.querySelector('.counter-val');
                if (counterElement) {
                    const targetText = counterElement.dataset.target.replace('+', '');
                    const target = parseInt(targetText, 10);
                    animateCounter(counterElement, target);
                    observer.unobserve(entry.target); 
                }
            }
        });
    }, { threshold: 0.5 }); 

    document.querySelectorAll('.section-counting .col-md-4').forEach(col => {
        counterObserver.observe(col);
    });


// =======================================================
// D. FUNGSI MODAL (Detail Penampil)
// =======================================================
const performerModal = document.getElementById('performerModal');
if (performerModal) {
    performerModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget;
        
        // Ambil data dari tombol
        const name = button.getAttribute('data-name');
        const info = button.getAttribute('data-info');
        const imageSrc = button.getAttribute('data-image'); // Diambil dari atribut baru

        // Masukkan data ke dalam modal
        document.getElementById('modal-name').textContent = name;
        document.getElementById('modal-info').textContent = info;
        document.getElementById('modal-image').src = imageSrc;
    });
}
// =======================================================
// E. FUNGSI KOMENTAR (Spreadsheet Integration)
// =======================================================
const SPREADSHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzuD1q-qVz1GB4VgQsYRVnOx1IjnB_5SCj6wEfP35jzaNebvKTrvBSWQSOz3uem798K/exec'; 

const commentForm = document.getElementById('comment-form');
const commentList = document.getElementById('comment-list');


// --- FUNGSI 1: MEMUAT KOMENTAR DARI SHEET (GET request) ---
function loadCommentsFromSheet() {
    commentList.innerHTML = '<p class="text-muted-light">Loading comments from Sheet...</p>'; 

    fetch('https://script.google.com/macros/s/AKfycbzuD1q-qVz1GB4VgQsYRVnOx1IjnB_5SCj6wEfP35jzaNebvKTrvBSWQSOz3uem798K/exec')
        .then(response => {
            // Karena respons Apps Script mungkin bukan JSON murni, kita coba tangani
            return response.text().then(text => {
                 try {
                     return JSON.parse(text);
                 } catch (e) {
                     // Jika gagal parse, lempar error
                     throw new Error('Gagal membaca data dari Sheets API. Cek Apps Script deploy.');
                 }
            });
        })
        .then(data => {
            commentList.innerHTML = '';
            
            if (!data.comments || data.comments.length === 0) {
                 commentList.innerHTML = '<p class="text-muted-light">Belum ada komentar. Jadilah yang pertama!</p>';
                 return;
            }
            
            // Urutkan data berdasarkan timestamp (terbaru di atas)
            const sortedComments = data.comments.reverse(); 

            sortedComments.forEach(comment => {
                 const timestamp = new Date(comment.timestamp);
                 const timeString = timestamp.toLocaleTimeString('id-ID', { 
                     year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                 });

                 const newComment = document.createElement('div');
                 newComment.classList.add('comment-item');
                 newComment.innerHTML = `
                     <p class="comment-author mb-0">${comment.name}</p>
                     <p class="comment-text">${comment.message}</p>
                     <small class="text-muted-light">${timeString}</small>
                 `;
                 commentList.appendChild(newComment);
            });
        })
        .catch(error => {
            console.error("Gagal memuat komentar dari Sheet: ", error);
            commentList.innerHTML = `<p class="text-danger">Gagal memuat komentar: ${error.message}</p>`;
        });
}


// --- FUNGSI 2: MENGIRIM KOMENTAR KE SHEET (POST request) ---
if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('comment-name').value;
        const message = document.getElementById('comment-message').value;

        if (name && message) {
            
            fetch('https://script.google.com/macros/s/AKfycbzuD1q-qVz1GB4VgQsYRVnOx1IjnB_5SCj6wEfP35jzaNebvKTrvBSWQSOz3uem798K/exec', {
                method: 'POST',
                // Mode 'no-cors' seringkali diperlukan untuk Apps Script POST requests. 
                // Ini berarti kita tidak bisa memproses respons sukses secara langsung.
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name, message: message })
            })
            .then(() => {
                 // Karena mode 'no-cors', kita berasumsi berhasil jika tidak ada error jaringan
                 commentForm.reset();
                 alert('Komentar berhasil dikirim dan tersimpan di Spreadsheet!');
                 
                 // Beri jeda sebentar (1 detik) sebelum memuat ulang untuk memberi waktu Apps Script menyimpan data
                 setTimeout(loadCommentsFromSheet, 1000); 
            })
            .catch(error => {
                console.error('Gagal mengirim komentar:', error);
                alert('Gagal mengirim komentar: Cek koneksi atau URL Apps Script.');
            });
        }
    });
    loadCommentsFromSheet();
}

// Panggil fungsi muat komentar saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', loadCommentsFromSheet);
    // =======================================================
    // F. FUNGSI ADD TO CALENDAR (Interaktif)
    // =======================================================
    const calendarButton = document.getElementById('add-to-calendar');

    if (calendarButton) {
        calendarButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const title = "Teacher Music Festival 2025";
            const location = "Meeting Hall, Pondok Modern Darussalam Gontor, Ponorogo, Indonesia";
            const details = "Pagelaran Musik Guru KMI PMDG. Carving Melodies, Weaving Stories.";
            
            // Waktu Acara: 6 November 2025, 19:30 WIB (UTC+7)
            // Konversi ke UTC: 19:30 - 7 jam = 12:30 Z (UTC)
            const startTime = '20251106T123000Z'; 
            const endTime = '20251106T150000Z'; // Asumsi 22:00 WIB

            // Membuat URL Google Calendar
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;

            window.open(googleCalendarUrl, '_blank');
        });
    }

    // =======================================================
    // G. NAV BAR INTERAKTIF
    // =======================================================
    const navbar = document.getElementById('main-navbar');
    function checkNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', checkNavbarScroll);
    checkNavbarScroll();
});