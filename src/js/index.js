function toggleMenu() {
  let hamburger = document.querySelector(".hamburger");
  let menu = document.querySelector(".navigation");
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const sectionAbout = document.getElementById("dampak");
  const linkBtn = document.getElementById("link-data");
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  const submitButton = document.getElementById("nextBtn");
  let ron_data;

  radioButtons.forEach((radio) => {
    radio.addEventListener("click", function () {
      radioButtons.forEach((otherRadio) => {
        otherRadio.parentElement.classList.remove("checked");
      });

      ron_data = this.value;

      if (this.checked) {
        this.parentElement.classList.add("checked");
      }
    });
  });

  submitButton.addEventListener("click", () => {
    let transport_data = {
      data: ron_data,
    };

    sessionStorage.setItem("transportData", JSON.stringify(transport_data));
    window.location.href = "../pages/adress.html";
  });

  // linkBtn.addEventListener("click", () => {
  //   window.location.hash = sectionAbout;
  // });
});
