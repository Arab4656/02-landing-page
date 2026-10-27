"use strict";

/**
 * Connects the mobile navigation toggle, link-close behavior, and Escape key.
 */
const initMobileMenu = () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");

  if (!menuToggle || !primaryNav) return;

  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
};

/**
 * Opens one FAQ answer at a time and animates its height.
 */
const initAccordion = () => {
  const questions = document.querySelectorAll(".faq-question");

  const animatePanel = (panel, question, shouldOpen) => {
    const animationId = String(Number(panel.dataset.animationId || 0) + 1);
    panel.dataset.animationId = animationId;
    question.setAttribute("aria-expanded", String(shouldOpen));

    if (shouldOpen) {
      panel.hidden = false;
      panel.style.height = "0px";
    } else {
      panel.style.height = `${panel.getBoundingClientRect().height}px`;
    }

    // Commit the starting height before applying the animated target.
    panel.offsetHeight;

    requestAnimationFrame(() => {
      if (panel.dataset.animationId !== animationId) return;

      panel.style.height = shouldOpen ? `${panel.scrollHeight}px` : "0px";
    });

    panel.ontransitionend = (event) => {
      if (event.target !== panel || event.propertyName !== "height") return;
      if (panel.dataset.animationId !== animationId) return;

      if (shouldOpen) {
        panel.style.height = "auto";
      } else {
        panel.hidden = true;
        panel.style.height = "";
      }
    };
  };

  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const answerId = question.getAttribute("aria-controls");
      const panel = answerId ? document.getElementById(answerId) : null;
      if (!panel) return;

      const shouldOpen = question.getAttribute("aria-expanded") !== "true";
      if (shouldOpen) {
        questions.forEach((otherQuestion) => {
          if (otherQuestion === question || otherQuestion.getAttribute("aria-expanded") !== "true") return;

          const otherAnswerId = otherQuestion.getAttribute("aria-controls");
          const otherPanel = otherAnswerId ? document.getElementById(otherAnswerId) : null;
          if (otherPanel) animatePanel(otherPanel, otherQuestion, false);
        });
      }

      animatePanel(panel, question, shouldOpen);
    });
  });
};

/**
 * Switches displayed prices and reveals the yearly savings message.
 */
const initPricingToggle = () => {
  const billingOptions = document.querySelectorAll(".billing-option");
  const priceValues = document.querySelectorAll(".price-value");
  const pricePeriods = document.querySelectorAll(".price-period");
  const savingsLabel = document.querySelector(".billing-savings");

  billingOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const period = option.dataset.period;
      if (period !== "monthly" && period !== "yearly") return;

      billingOptions.forEach((billingOption) => {
        const isActive = billingOption === option;
        billingOption.classList.toggle("is-active", isActive);
        billingOption.setAttribute("aria-pressed", String(isActive));
      });

      priceValues.forEach((price) => {
        price.textContent = price.dataset[period] || "";
      });

      pricePeriods.forEach((pricePeriod) => {
        pricePeriod.textContent = period === "yearly" ? "/ year" : "/ month";
      });

      if (savingsLabel) savingsLabel.hidden = period !== "yearly";
    });
  });
};

/**
 * Adds a shadow to the sticky header after the page scrolls past 10 pixels.
 */
const initHeaderShadow = () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeaderShadow = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  updateHeaderShadow();
};

/**
 * Prefills the enquiry form plan when a pricing card is selected.
 */
const initPlanSelection = () => {
  const planSelect = document.querySelector("#plan");

  document.querySelectorAll("[data-plan]").forEach((planLink) => {
    planLink.addEventListener("click", () => {
      if (planSelect && planLink.dataset.plan) {
        planSelect.value = planLink.dataset.plan;
      }
    });
  });
};

/**
 * Validates sign-up enquiries, prevents duplicate emails, and stores valid signups.
 */
const initSignupForm = () => {
  const signupForm = document.querySelector("#signup-form");
  const formMessage = document.querySelector("#form-message");

  if (!signupForm || !formMessage) return;

  const nameInput = signupForm.querySelector("#full-name");
  const emailInput = signupForm.querySelector("#email");
  const planSelect = signupForm.querySelector("#plan");
  const termsInput = signupForm.querySelector('[name="terms"]');
  if (!nameInput || !emailInput || !planSelect || !termsInput) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fields = [
    { input: nameInput, errorId: "name-error", validate: () => nameInput.value.trim().length >= 2, message: "Please enter at least 2 characters for your name." },
    { input: emailInput, errorId: "email-error", validate: () => emailPattern.test(emailInput.value.trim()), message: "Please enter a valid email address." },
    { input: planSelect, errorId: "plan-error", validate: () => planSelect.value !== "", message: "Please choose a plan." },
    { input: termsInput, errorId: "terms-error", validate: () => termsInput.checked, message: "Please agree to the terms to continue." },
  ];

  const setFieldError = (field, message) => {
    const error = document.getElementById(field.errorId);
    if (!error) return;

    error.textContent = message;
    if (message) {
      field.input.setAttribute("aria-invalid", "true");
    } else {
      field.input.removeAttribute("aria-invalid");
    }
  };

  const clearFormMessage = () => {
    formMessage.textContent = "";
    formMessage.classList.remove("is-error");
  };

  fields.forEach((field) => {
    const eventName = field.input === planSelect || field.input === termsInput ? "change" : "input";
    field.input.addEventListener(eventName, () => {
      clearFormMessage();
      if (field.input.getAttribute("aria-invalid") !== "true") return;
      setFieldError(field, field.validate() ? "" : field.message);
    });
  });

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFormMessage();
    const hasErrors = fields.reduce((invalid, field) => {
      const isValid = field.validate();
      setFieldError(field, isValid ? "" : field.message);
      return invalid || !isValid;
    }, false);
    if (hasErrors) {
      const firstInvalidField = fields.find((field) => !field.validate());
      if (firstInvalidField) firstInvalidField.input.focus();
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const plan = planSelect.value;
    let signups;

    try {
      const storedSignups = localStorage.getItem("signups");
      signups = storedSignups ? JSON.parse(storedSignups) : [];
      if (!Array.isArray(signups)) {
        throw new TypeError('The "signups" localStorage entry must contain an array.');
      }
    } catch (error) {
      console.error("Unable to read saved signups from localStorage.", error);
      formMessage.textContent = "We couldn’t check saved signups. Please try again.";
      formMessage.classList.add("is-error");
      return;
    }

    const emailExists = signups.some((signup) =>
      signup && typeof signup.email === "string" && signup.email.trim().toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      formMessage.textContent = "You've already signed up";
      formMessage.classList.add("is-error");
      emailInput.focus();
      return;
    }

    signups.push({ name, email, plan, createdAt: new Date().toISOString() });

    try {
      localStorage.setItem("signups", JSON.stringify(signups));
    } catch (error) {
      console.error("Unable to save signup to localStorage.", error);
      formMessage.textContent = "We couldn’t save your enquiry. Please try again.";
      formMessage.classList.add("is-error");
      return;
    }

    fields.forEach((field) => setFieldError(field, ""));
    signupForm.reset();
    formMessage.textContent = `Thanks, ${name}! Your enquiry has been saved.`;
  });
};

/**
 * Updates the copyright year to the current calendar year.
 */
const initFooterYear = () => {
  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
};

/**
 * Initializes the page interactions after the document has been parsed.
 */
const init = () => {
  initMobileMenu();
  initAccordion();
  initPricingToggle();
  initHeaderShadow();
  initPlanSelection();
  initSignupForm();
  initFooterYear();
};

document.addEventListener("DOMContentLoaded", init);
