document.addEventListener("DOMContentLoaded", function() {
  const wrappers = document.querySelectorAll(".countdown-pro-wrapper");
  if (!wrappers.length) return;

  wrappers.forEach(wrapper => {
    const blockId = wrapper.getAttribute("data-block-id");
    const container = document.getElementById(`countdown-pro-container-${blockId}`);
    if (!container) return;

    // Check for inline config first
    const configScript = document.getElementById(`countdown-config-${blockId}`);
    if (configScript) {
      try {
        const config = JSON.parse(configScript.textContent);
        renderCountdown(config, container);
      } catch (e) {
        console.error("Countdown Pro: Error parsing config", e);
      }
    } else {
      // Fallback to fetch if needed
      const shop = wrapper.getAttribute("data-shop");
      fetch(`/apps/countdowns/countdowns?shop=${shop}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            renderCountdown(data[0], container);
          }
        })
        .catch(err => console.error("Countdown Pro Error:", err));
    }
  });

  function renderCountdown(config, container) {
    if (config.id && !config.id.startsWith("template_")) {
      // Only send VIEW event if it's a real database ID, not a block ID
      fetch(`/apps/countdowns/countdowns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countdownId: config.id, eventType: "VIEW" })
      }).catch(e => {}); // ignore errors
    }

    const expiry = new Date(config.expiryDate || new Date().toISOString()).getTime();

    // Determine button text color based on background
    let buttonColor = config.buttonColor || '#000000';
    const btnTextColor = ['#ffffff', '#f8fafc', '#f3f4f6'].includes(buttonColor.toLowerCase()) ? '#000' : '#fff';

    // Render HTML structure
    container.innerHTML = `
      <div class="cd-${config.templateId || 'template-1'}" style="background: ${config.backgroundColor || '#ffffff'}">
        <h2 style="color: ${config.fontColor || '#000000'}; margin-top: 0; margin-bottom: 10px; font-size: 28px;">${config.title || ''}</h2>
        <p style="color: ${config.textColor || '#333333'}; margin-bottom: 20px; font-size: 16px;">${config.description || ''}</p>
        
        <div class="cd-timer-row">
          <div class="cd-timer-block">
            <span class="cd-timer-val days" style="color: ${config.fontColor || '#000000'}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor || '#333333'}">Days</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val hours" style="color: ${config.fontColor || '#000000'}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor || '#333333'}">Hours</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val minutes" style="color: ${config.fontColor || '#000000'}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor || '#333333'}">Minutes</span>
          </div>
          <div class="cd-timer-block">
            <span class="cd-timer-val seconds" style="color: ${config.fontColor || '#000000'}">00</span>
            <span class="cd-timer-label" style="color: ${config.textColor || '#333333'}">Seconds</span>
          </div>
        </div>

        ${config.ctaUrl ? `
          <a href="${config.ctaUrl}" class="cd-btn" style="background: ${buttonColor}; color: ${btnTextColor};" id="cd-cta-${config.id}">
            ${config.ctaText || 'Shop Now'}
          </a>
        ` : ''}
      </div>
    `;

    // Track Clicks
    const cta = document.getElementById(`cd-cta-${config.id}`);
    if (cta && config.id && !config.id.startsWith("template_")) {
      cta.addEventListener("click", () => {
        fetch(`/apps/countdowns/countdowns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countdownId: config.id, eventType: "CLICK" })
        }).catch(e => {});
      });
    }

    // Start Timer
    const daysEl = container.querySelector(".days");
    const hoursEl = container.querySelector(".hours");
    const minsEl = container.querySelector(".minutes");
    const secsEl = container.querySelector(".seconds");

    // Clear existing interval if any (useful for Theme Editor reloads)
    if (container.timerInterval) {
      clearInterval(container.timerInterval);
    }

    container.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiry - now;

      if (distance < 0 || isNaN(distance)) {
        clearInterval(container.timerInterval);
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

  // Support Shopify Theme Editor design mode updates
  function initBlock(blockId) {
    const wrapper = document.querySelector(`.countdown-pro-wrapper[data-block-id="${blockId}"]`);
    if (!wrapper) return;
    const configScript = document.getElementById(`countdown-config-${blockId}`);
    if (configScript) {
      const container = document.getElementById(`countdown-pro-container-${blockId}`);
      if (container) {
        try {
          const config = JSON.parse(configScript.textContent);
          renderCountdown(config, container);
        } catch(e) {}
      }
    }
  }

  document.addEventListener("shopify:block:select", function(event) {
    initBlock(event.detail.blockId);
  });

  document.addEventListener("shopify:section:load", function(event) {
    const wrappers = event.target.querySelectorAll(".countdown-pro-wrapper");
    wrappers.forEach(wrapper => {
      const blockId = wrapper.getAttribute("data-block-id");
      initBlock(blockId);
    });
  });
});
