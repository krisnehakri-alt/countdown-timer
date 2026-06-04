document.addEventListener("DOMContentLoaded", function() {
  const wrapper = document.querySelector(".countdown-pro-wrapper");
  if (!wrapper) return;

  const shop = wrapper.getAttribute("data-shop");
  const container = document.getElementById("countdown-pro-container");

  // Fetch active countdowns from app proxy
  fetch(`/apps/countdowns/countdowns?shop=${shop}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        // Render the first active campaign
        renderCountdown(data[0]);
      }
    })
    .catch(err => console.error("Countdown Pro Error:", err));

  function renderCountdown(config) {
    // Send VIEW event
    fetch(`/apps/countdowns/countdowns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countdownId: config.id, eventType: "VIEW" })
    });

    const expiry = new Date(config.expiryDate).getTime();

    // Determine button text color based on background (simple heuristic)
    const btnTextColor = ['#ffffff', '#f8fafc', '#f3f4f6'].includes(config.buttonColor.toLowerCase()) ? '#000' : '#fff';

    // Render HTML structure
    container.innerHTML = `
      <div class="cd-${config.templateId}" style="background: ${config.backgroundColor}">
        <h2 style="color: ${config.fontColor}; margin-top: 0; margin-bottom: 10px; font-size: 28px;">${config.title}</h2>
        <p style="color: ${config.textColor}; margin-bottom: 20px; font-size: 16px;">${config.description}</p>
        
        <div class="cd-timer-row">
          <div class="cd-timer-block">
            <span class="cd-timer-val days" style="color: ${config.fontColor}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor}">Days</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val hours" style="color: ${config.fontColor}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor}">Hours</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val minutes" style="color: ${config.fontColor}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor}">Minutes</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val seconds" style="color: ${config.fontColor}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor}">Seconds</span>
          </div>
        </div>

        ${config.ctaUrl ? `
          <a href="${config.ctaUrl}" class="cd-btn" style="background: ${config.buttonColor}; color: ${btnTextColor};" id="cd-cta-${config.id}">
            ${config.ctaText}
          </a>
        ` : ''}
      </div>
    `;

    // Track Clicks
    const cta = document.getElementById(`cd-cta-${config.id}`);
    if (cta) {
      cta.addEventListener("click", () => {
        fetch(`/apps/countdowns/countdowns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countdownId: config.id, eventType: "CLICK" })
        });
      });
    }

    // Start Timer
    const daysEl = container.querySelector(".days");
    const hoursEl = container.querySelector(".hours");
    const minsEl = container.querySelector(".minutes");
    const secsEl = container.querySelector(".seconds");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0) {
        clearInterval(timer);
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minsEl.innerText = "00";
        secsEl.innerText = "00";
        return;
      }

      daysEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
      hoursEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      minsEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      secsEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
    }, 1000);
  }
});
