const map = L.map("map").setView([-6.2, 106.816666], 9);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const showOnMap = async (alamatAsal, tujuanArray) => {
  const titikAsal = {
    latitude: alamatAsal.latitude,
    longitude: alamatAsal.longitude,
  };

  const waypoints = [
    L.latLng(titikAsal.latitude, titikAsal.longitude),
    ...tujuanArray.map((ruteResult) =>
      L.latLng(ruteResult.latitude, ruteResult.longitude)
    ),
  ];

  const control = L.Routing.control({
    waypoints: waypoints,
  }).addTo(map);

  control.on("routeselected", function (e) {
    const route = e.route;

    // Mendapatkan data rute
    const jarak = route.summary.totalDistance; // dalam meter
    const duration = route.summary.totalTime; // dalam detik
    const steps = route.instructions; // detail langkah-langkah rute

    // console.log("Jarak total: " + jarak + " meter");
    // console.log("Waktu total: " + duration + " detik");

    // console.log("Langkah-langkah rute:");
    // steps.forEach((step, index) => {
    //   console.log(`${index + 1}. ${step.text}`);
    // });
  });
};

const calculateEmission = (ronValue, totalDistance) => {
  let gasPerLt = totalDistance / 59.6;
  let totalEmission = gasPerLt * ronValue;
  return `Energi: ${ronValue}, Total Jarak: ${totalDistance}, Emisi: ${totalEmission.toFixed(
    2
  )}`;
};

const carbonResult = document.querySelector(".carbon-result");

document.addEventListener("DOMContentLoaded", async function () {
  const storedRoutes = sessionStorage.getItem("shortestRoutes");
  const routeData = JSON.parse(storedRoutes);

  const createElementAndAppend = (wrapper, element, className, textContent) => {
    let newElement = document.createElement(element);
    newElement.className = className;
    newElement.textContent = textContent;
    wrapper.appendChild(newElement);
  };

  // Fungsi untuk merender data alamatAsal
  const renderAlamatAsal = () => {
    let alamatAsalWrapper = document.getElementById("main-destination");
    if (!alamatAsalWrapper) {
      alamatAsalWrapper = document.createElement("div");
      alamatAsalWrapper.id = "main-destination";
      document.body.appendChild(alamatAsalWrapper);
    }

    let alamatAsalData = routeData.shortestRoutes.alamatAsal;

    createElementAndAppend(
      alamatAsalWrapper,
      "div",
      "main-destination",
      alamatAsalData.alamat
    );
  };

  // Fungsi untuk merender data tujuanArray
  const renderTujuanArray = () => {
    let tujuanArrayWrapper = document.getElementById("sub-destination");
    if (!tujuanArrayWrapper) {
      tujuanArrayWrapper = document.createElement("div");
      tujuanArrayWrapper.id = "sub-destination";
      document.body.appendChild(tujuanArrayWrapper);
    }

    let tujuanArrayData = routeData.shortestRoutes.tujuanArray;

    for (let i = 0; i < tujuanArrayData.length; i++) {
      let tujuanData = tujuanArrayData[i];
      let div = document.createElement("div");
      div.className = "main-destination";

      createElementAndAppend(div, "p", "destination", tujuanData.alamat);
      createElementAndAppend(div, "div", "route-distance", tujuanData.jarak);

      tujuanArrayWrapper.appendChild(div);
    }
  };

  if (storedRoutes) {
    const emission = calculateEmission(
      routeData.ronValue,
      routeData.shortestRoutes.totalDistance
    );

    await showOnMap(
      routeData.shortestRoutes.alamatAsal,
      routeData.shortestRoutes.tujuanArray
    );

    renderAlamatAsal();
    renderTujuanArray();

    carbonResult.innerHTML = emission + " kg/tj";
  } else {
    console.log("Data rute tidak ditemukan.");
  }
});
