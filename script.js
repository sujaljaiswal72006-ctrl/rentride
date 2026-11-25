// ---------- Data ----------
var vehicles = [
  { id: 1, name: "Maruti Swift",      type: "Car",     price: 1800, icon: "🚗", available: true,  lastService: "2026-09-10", nextService: "2027-01-10" },
  { id: 2, name: "Hyundai Creta",     type: "Car",     price: 2800, icon: "🚙", available: true,  lastService: "2026-10-02", nextService: "2027-02-02" },
  { id: 3, name: "Royal Enfield 350", type: "Bike",    price: 900,  icon: "🏍️", available: true,  lastService: "2026-08-20", nextService: "2026-12-20" },
  { id: 4, name: "Yamaha FZ",         type: "Bike",    price: 600,  icon: "🏍️", available: false, lastService: "2026-11-01", nextService: "2027-03-01" },
  { id: 5, name: "Honda Activa",      type: "Scooter", price: 400,  icon: "🛵", available: true,  lastService: "2026-10-15", nextService: "2027-02-15" },
  { id: 6, name: "TVS Jupiter",       type: "Scooter", price: 350,  icon: "🛵", available: true,  lastService: "2026-09-25", nextService: "2027-01-25" }
];
var bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

// ---------- Helpers ----------
function save() { localStorage.setItem("bookings", JSON.stringify(bookings)); }
function el(id) { return document.getElementById(id); }

// ---------- Vehicle listing ----------
function showVehicles() {
  var text = el("search").value.toLowerCase();
  var type = el("typeFilter").value;
  var sort = el("sortFilter").value;

  var list = vehicles.filter(function (v) {
    return v.name.toLowerCase().indexOf(text) !== -1 && (type === "all" || v.type === type);
  });
  if (sort === "low")  list.sort(function (a, b) { return a.price - b.price; });
  if (sort === "high") list.sort(function (a, b) { return b.price - a.price; });

  var html = "";
  list.forEach(function (v) {
    html += '<div class="card">' +
      '<div class="icon">' + v.icon + '</div>' +
      '<h3>' + v.name + '</h3>' +
      '<p>' + v.type + '</p>' +
      '<p class="price">₹' + v.price + ' / day</p>' +
      '<span class="tag ' + (v.available ? "yes" : "no") + '">' + (v.available ? "Available" : "Booked") + '</span><br>' +
      (v.available ? '<button class="btn" onclick="chooseVehicle(' + v.id + ')">Book Now</button>' : '') +
      '</div>';
  });
  el("vehicleList").innerHTML = html || "<p>No vehicles found.</p>";
}

function fillVehicleSelect() {
  var html = "";
  vehicles.forEach(function (v) {
    if (v.available) html += '<option value="' + v.id + '">' + v.name + ' (₹' + v.price + '/day)</option>';
  });
  el("vehicleSelect").innerHTML = html;
  calcTotal();
}

function chooseVehicle(id) {
  el("vehicleSelect").value = id;
  calcTotal();
  location.href = "#booking";
}

// ---------- Booking ----------
function getDays() {
  var s = new Date(el("startDate").value);
  var e = new Date(el("endDate").value);
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.round((e - s) / 86400000) + 1;
}

function calcTotal() {
  var v = vehicles.filter(function (x) { return x.id == el("vehicleSelect").value; })[0];
  var total = v ? v.price * getDays() : 0;
  el("totalPrice").innerText = "₹" + total;
  return total;
}

el("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var days = getDays();
  if (days === 0) { el("formMsg").style.color = "red"; el("formMsg").innerText = "Return date must be on or after pickup date."; return; }

  var v = vehicles.filter(function (x) { return x.id == el("vehicleSelect").value; })[0];
  bookings.push({
    id: "BK" + (1000 + bookings.length + 1),
    name: el("custName").value,
    vehicle: v.name,
    from: el("startDate").value,
    to: el("endDate").value,
    total: calcTotal(),
    status: "Confirmed"
  });
  save();
  showBookings();
  showStats();
  el("formMsg").style.color = "#2e7d32";
  el("formMsg").innerText = "✅ Booking confirmed! Notification sent to " + el("custEmail").value;
  e.target.reset();
  calcTotal();
});

["vehicleSelect", "startDate", "endDate"].forEach(function (id) {
  el(id).addEventListener("change", calcTotal);
});

// ---------- My bookings ----------
function showBookings() {
  var html = "";
  bookings.forEach(function (b, i) {
    html += "<tr><td>" + b.id + "</td><td>" + b.name + "</td><td>" + b.vehicle + "</td><td>" + b.from +
      "</td><td>" + b.to + "</td><td>₹" + b.total + "</td><td>" + b.status + "</td><td>" +
      (b.status === "Confirmed" ? '<button class="btn" onclick="cancelBooking(' + i + ')">Cancel</button>' : "-") +
      "</td></tr>";
  });
  el("bookingTable").innerHTML = html;
  el("noBooking").style.display = bookings.length ? "none" : "block";
}

function cancelBooking(i) {
  bookings[i].status = "Cancelled";
  save();
  showBookings();
  showStats();
}

// ---------- Admin ----------
function showFleet() {
  var html = "";
  vehicles.forEach(function (v, i) {
    html += "<tr><td>" + v.name + "</td><td>" + v.type + "</td><td>₹" + v.price + "</td><td>" +
      '<button class="btn" onclick="toggleAvail(' + i + ')">' + (v.available ? "Available" : "Unavailable") + "</button></td><td>" +
      v.lastService + "</td><td>" + v.nextService + "</td></tr>";
  });
  el("fleetTable").innerHTML = html;
}

function toggleAvail(i) {
  vehicles[i].available = !vehicles[i].available;
  refreshAll();
}

function showStats() {
  var active = bookings.filter(function (b) { return b.status === "Confirmed"; });
  var revenue = 0;
  active.forEach(function (b) { revenue += b.total; });
  el("statVehicles").innerText = vehicles.length;
  el("statAvailable").innerText = vehicles.filter(function (v) { return v.available; }).length;
  el("statBookings").innerText = active.length;
  el("statRevenue").innerText = "₹" + revenue;
}

el("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var icons = { Car: "🚗", Bike: "🏍️", Scooter: "🛵" };
  var type = el("newType").value;
  vehicles.push({
    id: vehicles.length + 1, name: el("newName").value, type: type,
    price: Number(el("newPrice").value), icon: icons[type], available: true,
    lastService: "2026-11-25", nextService: "2027-03-25"
  });
  e.target.reset();
  refreshAll();
});

// ---------- Registration ----------
el("regForm").addEventListener("submit", function (e) {
  e.preventDefault();
  el("regMsg").innerText = "✅ Registration successful! Welcome to RentRide.";
  e.target.reset();
});

// ---------- Init ----------
function refreshAll() {
  showVehicles(); fillVehicleSelect(); showFleet(); showStats();
}
["search", "typeFilter", "sortFilter"].forEach(function (id) {
  el(id).addEventListener("input", showVehicles);
});
el("startDate").min = new Date().toISOString().split("T")[0];
refreshAll();
showBookings();
