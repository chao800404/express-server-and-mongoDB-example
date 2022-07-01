require("core-js/modules/es.typed-array.set.js");
var $6L2Da$axios = require("axios");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

const $85ad3447b53a5caf$export$4c5dd147b21b9176 = (locations)=>{
    mapboxgl.accessToken = "pk.eyJ1IjoiY2hhb2EiLCJhIjoiY2w0emYzOXkzMGRxODNxcXVuNmV0bHYyYiJ9.TAVtYq9TNuOrJ6tWe3a31g";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/chaoa/cl4zhkl32000214rw3li2aqkm",
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        const el = document.createElement("div");
        el.className = "marker";
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}:${loc.description} </p>`).addTo(map);
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            right: 100,
            left: 100,
            bottom: 150
        }
    });
};



const $4b93c99f4dda0562$export$596d806903d1f59e = async ({ email: email , password: password  })=>{
    try {
        const { data: data  } = await (0, ($parcel$interopDefault($6L2Da$axios)))({
            method: "post",
            url: "http://127.0.0.1:5000/api/v1/users/login",
            data: {
                email: email,
                password: password
            }
        });
        if (data.status === "success") {
            alert("Logged in successfully");
            window.location.assign("/");
        }
    } catch (err) {
        alert(err.response.data.message);
        console.log(err.response.data.message);
    }
};


console.log("hello parcel");
const $2b31d098ab25292c$var$mapBox = document.querySelector("#map");
const $2b31d098ab25292c$var$loginForm = document.querySelector(".form");
if ($2b31d098ab25292c$var$mapBox) {
    const locations = JSON.parse($2b31d098ab25292c$var$mapBox.dataset.locations);
    (0, $85ad3447b53a5caf$export$4c5dd147b21b9176)(locations);
}
if ($2b31d098ab25292c$var$loginForm) $2b31d098ab25292c$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    (0, $4b93c99f4dda0562$export$596d806903d1f59e)({
        email: email,
        password: password
    });
});


//# sourceMappingURL=app.js.map
