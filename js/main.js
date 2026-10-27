"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isOpen);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      primaryNav.classList.remove("is-open");
    }
  });
}

const billingOptions = document.querySelectorAll(".billing-option");
const priceValues = document.querySelectorAll(".price-value");

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
  });
});

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const isExpanded = question.getAttribute("aria-expanded") === "true";
    const answerId = question.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;

    question.setAttribute("aria-expanded", String(!isExpanded));
    if (answer) answer.hidden = isExpanded;
  });
});

document.querySelectorAll("[data-plan]").forEach((planLink) => {
  planLink.addEventListener("click", () => {
    const planSelect = document.querySelector("#plan");
    const plan = planLink.dataset.plan;
    if (planSelect && plan) planSelect.value = plan;
  });
});

const signupForm = document.querySelector("#signup-form");
const formMessage = document.querySelector("#form-message");

if (signupForm && formMessage) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;

    const formData = new FormData(signupForm);
    const name = formData.get("name");
    formMessage.textContent = `Thanks, ${name}! Your enquiry is ready. Our team will be in touch soon.`;
    signupForm.reset();
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
