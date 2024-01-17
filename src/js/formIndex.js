const getGeocode = async (alamat) => {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${alamat}&apiKey=dbd4860b7fb8446dac43f068bb57f493`
    );
    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const location = data.features[0].properties;
      const latitude = location.lat;
      const longitude = location.lon;
      return { latitude, longitude };
    } else {
      console.log("Tidak ada data geolokasi ditemukan.");
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getGeolocationData = async (...alamatTujuanArray) => {
  const geolocationData = {};

  for (const alamat of alamatTujuanArray) {
    const geocode = await getGeocode(alamat);
    if (geocode) {
      geolocationData[alamat] = geocode;
    }
  }

  return geolocationData;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Jarak dalam kilometer
  return distance;
};

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

class Graph {
  constructor() {
    this.vertices = [];
    this.edges = {};
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
    this.edges[vertex] = {};
  }

  addEdge(vertex1, vertex2, distance) {
    this.edges[vertex1][vertex2] = distance;
    this.edges[vertex2][vertex1] = distance;
  }

  dijkstra(startVertex) {
    const distances = {};
    const visited = {};
    const previous = {};
    const queue = new PriorityQueue();

    this.vertices.forEach((vertex) => {
      distances[vertex] = Infinity;
      previous[vertex] = null;
    });
    distances[startVertex] = 0;

    queue.enqueue(startVertex, 0);

    while (!queue.isEmpty()) {
      const currentVertex = queue.dequeue().data;
      visited[currentVertex] = true;

      if (!visited[currentVertex]) {
        continue;
      }

      for (let neighbor in this.edges[currentVertex]) {
        const distance = this.edges[currentVertex][neighbor];
        const totalDistance = distances[currentVertex] + distance;

        if (totalDistance < distances[neighbor]) {
          distances[neighbor] = totalDistance;
          previous[neighbor] = currentVertex;
        }

        if (!visited[neighbor]) {
          queue.enqueue(neighbor, distances[neighbor]);
        }
      }
    }

    return { distances, previous };
  }

  getShortestPath(previous, endVertex) {
    const path = [];
    let currentVertex = endVertex;

    while (currentVertex !== null) {
      path.unshift(currentVertex);
      currentVertex = previous[currentVertex];
    }

    return path;
  }
}

class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(data, priority) {
    const element = { data, priority };

    if (this.isEmpty()) {
      this.items.push(element);
    } else {
      let added = false;

      for (let i = 0; i < this.items.length; i++) {
        if (element.priority < this.items[i].priority) {
          this.items.splice(i, 0, element);
          added = true;
          break;
        }
      }

      if (!added) {
        this.items.push(element);
      }
    }
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

const calculateShortestRoute = async (
  geolocationData,
  alamatAsal,
  ...alamatTujuan
) => {
  if (!geolocationData.hasOwnProperty(alamatAsal)) {
    console.log(`Data geolokasi untuk alamat ${alamatAsal} tidak ditemukan.`);
    return;
  }

  const graph = new Graph();

  graph.addVertex(alamatAsal);

  const tujuanArray = alamatTujuan.filter((tujuan) =>
    geolocationData.hasOwnProperty(tujuan)
  );

  tujuanArray.forEach((tujuan) => {
    graph.addVertex(tujuan);
    graph.addEdge(
      alamatAsal,
      tujuan,
      calculateDistance(
        geolocationData[alamatAsal].latitude,
        geolocationData[alamatAsal].longitude,
        geolocationData[tujuan].latitude,
        geolocationData[tujuan].longitude
      )
    );
  });

  const startVertex = alamatAsal;
  const { distances, previous } = graph.dijkstra(startVertex);
  let totalDistance = 0;

  tujuanArray.sort((a, b) => {
    const distanceA = distances[a] || Infinity;
    const distanceB = distances[b] || Infinity;
    return distanceA - distanceB;
  });

  const formattedData = {
    alamatAsal: {
      alamat: alamatAsal,
      latitude: geolocationData[alamatAsal].latitude,
      longitude: geolocationData[alamatAsal].longitude,
    },
    tujuanArray: tujuanArray.map((tujuan) => {
      const jarak = distances[tujuan] || Infinity;
      totalDistance += jarak;
      return {
        alamat: tujuan,
        latitude: geolocationData[tujuan].latitude,
        longitude: geolocationData[tujuan].longitude,
        jarak: distances[tujuan].toFixed(2) + " km",
      };
    }),
    totalDistance: totalDistance.toFixed(2),
  };
  tujuanArray.forEach((tujuan, index) => {
    const shortestPath = graph.getShortestPath(previous, tujuan);
    const distance = distances[tujuan] || Infinity;
    console.log(`Rute terdekat ke ${tujuan}: ${shortestPath}`);
    console.log(`Jarak terdekat ke ${tujuan}: ${distance.toFixed(2)} km`);
  });

  // await showOnMap(alamatAsal, tujuanArray);
  return formattedData;
};

const addInput = () => {
  // Maksimal 3 kolom input
  const maxInputs = 2;

  // Hitung jumlah kolom input yang sudah ada
  const inputContainer = document.getElementById("inputContainer");
  const existingInputs =
    inputContainer.getElementsByClassName("input-container").length;

  // Jika jumlah kolom input belum mencapai batas maksimal, tambahkan kolom input baru
  if (existingInputs < maxInputs) {
    const newInput = document.createElement("div");
    newInput.className = "input-container";
    newInput.innerHTML =
      '<input type="text" name="field' + (existingInputs + 1) + '" required>';
    inputContainer.appendChild(newInput);
  } else {
    alert("Maksimal 3 kolom input telah tercapai");
  }
};

const getEmissionData = (gas_consume) => {
  const ron_data = {
    "RON 90": 71.062,
    "RON 92": 70.812,
    "RON 95": 70.682,
  };

  return ron_data[gas_consume];
};

const getFormData = async (event) => {
  event.preventDefault();

  const tujuanValues = [];
  const tujuanInputs = document.querySelectorAll('input[name^="field"]');
  const asalValue = document.getElementsByName("alamat_asal")[0].value;

  tujuanInputs.forEach((input) => {
    tujuanValues.push(input.value);
  });

  const location_data = {
    tujuan: tujuanValues,
    asal: asalValue,
  };

  const { asal, tujuan } = location_data;
  const getLocationData = await getGeolocationData(asal, ...tujuan);
  const sessionData = sessionStorage.getItem("transportData");
  const transportData = JSON.parse(sessionData);
  const ronValue = getEmissionData(transportData.data);

  console.log(getLocationData);

  if (getLocationData) {
    const shortestRoutes = await calculateShortestRoute(
      getLocationData,
      asal,
      ...tujuan
    );
    const routeData = {
      shortestRoutes,
      ronValue,
    };

    sessionStorage.setItem("shortestRoutes", JSON.stringify(routeData));
    console.log(routeData);
    // console.log(formattedData);
    // Arahkan pengguna ke halaman "result.html"
    window.location.href = "../pages/result.html";
  }
};
