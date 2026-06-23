(function () {
  const config = window.CALCULATOR_CONFIG || {};
  const messages = window.CALCULATOR_MESSAGES || {};
  const defaultRates = { CNY: 0.0475, USD: 0.0066, HKD: 0.051, KRW: 9.15, THB: 0.2280 };
  const state = {
    lang: config.lang || "en",
    mode: "incl",
    rate: 0.10,
    fee: 0,
  };

  let globalRates = { ...defaultRates };

  function getMessages() {
    return messages;
  }

  function getCalculationSnapshot(val) {
    const preTax = state.mode === "incl" ? val / (1 + state.rate) : val;
    const isLow = val > 0 && preTax < 5000;
    const calcPreTax = isLow ? preTax : Math.min(preTax, 500000);
    const isCapped = !isLow && preTax > 500000;
    const refund = isLow
      ? 0
      : Math.max(0, Math.floor(calcPreTax * state.rate) - Math.ceil(calcPreTax * state.fee));

    return { preTax, isLow, isCapped, refund };
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.innerText = value;
  }

  function setHtml(id, value) {
    const node = document.getElementById(id);
    if (node) node.innerHTML = value;
  }

  function updateBannerRate() {
    const rateVal = globalRates[messages.curTarget];
    const rateNode = document.getElementById("live-rate");
    if (rateNode && typeof rateVal === "number") {
      rateNode.innerText = rateVal.toFixed(4);
    }
  }

  function updateLanguageSelector() {
    if (!config.hasLanguageSelector) return;

    const selector = document.getElementById("langSelect");
    if (!selector) return;

    const selectedValue = config.languagePath || `/${state.lang}/`;
    selector.value = selectedValue;
    selector.addEventListener("change", function (event) {
      window.location.href = event.target.value;
    });
  }

  function renderMessages() {
    document.title = messages.pageTitle;
    setText("t-hero-title", messages.heroTitle);
    setText("t-hero-desc", messages.heroDesc);
    setText("t-auth", messages.auth);
    setText("t-upd", messages.upd);
    setText("t-ad-rate", messages.adRate);
    setText("t-ad-jpy", messages.adJpy);
    setText("t-label-amt", messages.amt.toUpperCase());
    setText("t-incl", messages.incl);
    setText("t-excl", messages.excl);
    setText("t-label-cat", messages.cat.toUpperCase());
    setText("t-cat-1", messages.cat1);
    setText("t-cat-1-d", messages.cat1d);
    setText("t-cat-2", messages.cat2);
    setText("t-cat-2-d", messages.cat2d);
    setText("t-label-store", messages.store.toUpperCase());
    setText("t-store-1", messages.store1);
    setText("t-store-1-d", messages.store1d);
    setText("t-store-2", messages.store2);
    setText("t-store-2-d", messages.store2d);
    setText("t-res-label", messages.res);
    setText("cur-1", messages.curName);
    setText("t-share-line", messages.shareL);
    setText("t-copy-btn", messages.copyBtn);
    setHtml("seoArea", messages.seo);
    setText("t-disclaimer-footer", messages.footer);
    setText("t-link-about", messages.linkAbout);
    setText("t-link-privacy", messages.linkPrivacy);
    updateBannerRate();
  }

  function calculate() {
    const amountInput = document.getElementById("amtInput");
    const thresholdMsg = document.getElementById("threshold-msg");
    const inputCard = document.getElementById("inputCard");
    const resPanel = document.getElementById("resPanel");
    const adviceBox = document.getElementById("advice-box");
    const val = parseFloat(amountInput.value) || 0;
    const { preTax, isLow, isCapped, refund } = getCalculationSnapshot(val);

    thresholdMsg.style.display = "none";
    inputCard.className = "card";
    resPanel.classList.remove("dim");

    if (isLow) {
      thresholdMsg.style.display = "block";
      thresholdMsg.innerText = messages.lowAmt.replace("${diff}", Math.ceil(5000 - preTax));
      thresholdMsg.className = "threshold-msg msg-warning";
      inputCard.classList.add("alert-active");
      resPanel.classList.add("dim");
    } else if (isCapped) {
      thresholdMsg.style.display = "block";
      thresholdMsg.innerText = messages.highCap;
      thresholdMsg.className = "threshold-msg msg-info";
      inputCard.classList.add("info-active");
    }

    if (val === 0) adviceBox.innerText = messages.adv0;
    else if (isLow) adviceBox.innerText = "---";
    else if (refund < 1000) adviceBox.innerText = messages.adv1;
    else if (refund < 5000) adviceBox.innerText = messages.adv2;
    else adviceBox.innerText = messages.adv3;

    setText("res-jpy", refund.toLocaleString());
    const targetRate = globalRates[messages.curTarget];
    setText("res-c1", (refund * targetRate).toFixed(messages.curTarget === "USD" ? 2 : 1).toLocaleString());
  }

  function bindToggleGroup(selector, key) {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener("click", (event) => {
        if (selector.includes("tax-toggle")) {
          document.querySelectorAll(selector).forEach((node) => node.classList.remove("active"));
          event.target.classList.add("active");
          state.mode = event.target.dataset.mode;
        } else {
          const item = event.target.closest(".seg-item");
          if (!item) return;
          document.querySelectorAll(selector).forEach((node) => node.classList.remove("active"));
          item.classList.add("active");
          state[key] = parseFloat(item.dataset[key]);
        }
        calculate();
      });
    });
  }

  async function fetchLiveRate() {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/JPY");
      const data = await response.json();
      globalRates = data.rates;
      calculate();
      updateBannerRate();
    } catch (error) {
      console.log("Rate fetch failed");
    }
  }

  window.resetAll = function resetAll() {
    const amountInput = document.getElementById("amtInput");
    amountInput.value = "";
    calculate();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.socialShare = function socialShare(platform) {
    const url = window.location.href;
    if (platform === "line") {
      window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`);
    }
    if (platform === "native") {
      navigator.clipboard.writeText(url);
      alert(messages.copyOk);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderMessages();
    updateLanguageSelector();
    document.getElementById("amtInput").addEventListener("input", calculate);
    bindToggleGroup(".tax-toggle span", "mode");
    bindToggleGroup("#catGroup .seg-item", "rate");
    bindToggleGroup("#storeGroup .seg-item", "fee");
    calculate();
  });

  fetchLiveRate();
})();
