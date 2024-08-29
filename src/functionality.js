let liftInput = document.getElementById("#lift");
let floorInput = document.getElementById("#floor");
let formContainer = document.querySelector(".form_container");
let buildingView = document.querySelector(".building_view");
let building = document.querySelector(".building");
let liftsData = [];
let liftRequestQueue = [];
let maxFloor;

const submitHandler = (e) => {
  // if (Number(floorInput.value) < Number(liftInput.value))
  //   alert("Lifts should be less than no. of floors");
  // else {
  e.preventDefault();
  formContainer.classList.add("hidden");
  buildingView.classList.remove("hidden");
  maxFloor = Number(floorInput.value);
  generateFloorsAndLifts(Number(floorInput.value), Number(liftInput.value));
  storeLiftsData();
  // }
};

const goBack = () => {
  buildingView.classList.add("hidden");
  formContainer.classList.remove("hidden");
  building.innerHTML = "";
  liftsData = [];
  liftRequestQueue = [];
};

const generateFloorsAndLifts = (floorInput, liftInput) => {
  for (let floorIndex = floorInput; floorIndex >= 1; floorIndex--) {
    let floorElement = document.createElement("div");
    floorElement.classList.add("floor");
    floorElement.setAttribute("floor", floorIndex);

    let btn_wrapper = document.createElement("div");
    btn_wrapper.classList.add("wrapper");

    let up_btn = document.createElement("button");
    let down_btn = document.createElement("button");

    up_btn.classList.add("action_btn");
    down_btn.classList.add("action_btn");
    up_btn.setAttribute("floor", floorIndex);
    down_btn.setAttribute("floor", floorIndex);
    up_btn.innerText = "Up";
    down_btn.innerText = "Down";

    up_btn.onclick = (event) => processQueue(event);
    down_btn.onclick = (event) => processQueue(event);

    if (floorIndex != floorInput || floorInput === 1)
      btn_wrapper.appendChild(up_btn);
    if (floorIndex != 1) btn_wrapper.appendChild(down_btn);

    let floorLabelWrapper = document.createElement("div");
    let floorLabel = document.createElement("h5");

    floorLabelWrapper.classList.add("wrapper");
    floorLabel.innerText = `Floor ${floorIndex}`;
    floorLabelWrapper.appendChild(floorLabel);

    let liftsContainer = document.createElement("div");
    liftsContainer.classList.add("lifts_container");

    if (floorIndex == 1) {
      for (let liftIndex = 0; liftIndex < liftInput; liftIndex++) {
        let liftElement = document.createElement("div");
        liftElement.classList.add("lift");
        liftElement.innerHTML = `
        <div class="door left open"></div>
        <div class="door right open"></div>
        `;

        liftsContainer.appendChild(liftElement);
      }
    }

    floorElement.appendChild(floorLabelWrapper);
    floorElement.appendChild(btn_wrapper);
    floorElement.appendChild(liftsContainer);

    building.appendChild(floorElement);
  }
};

const storeLiftsData = () => {
  let allLifts = document.querySelectorAll(".lift");

  for (let i = 0; i < allLifts.length; i++) {
    liftsData.push({
      lift: allLifts[i],
      floor: 1,
      isMoving: false,
    });
  }
};

const processQueue = (info) => {
  let floorIndex = info.target.getAttribute("floor");
  if (liftRequestQueue.find((ele) => ele.floor === floorIndex)) return;

  liftRequestQueue.push({ floor: floorIndex });
  processRequest();
};

const nearestLift = (floorIndex) => {
  let nonMovingLifts = liftsData.filter((ele) => !ele.isMoving);

  if (nonMovingLifts.length === 0) return null;

  nonMovingLifts.sort((a, b) => {
    return Math.abs(floorIndex - a.floor) - Math.abs(floorIndex - b.floor);
  });

  return nonMovingLifts[0];
};

const updateLiftData = (nearestLiftElement, isMoving, floor) => {
  for (let i = 0; i < liftsData.length; i++) {
    if (liftsData[i].lift === nearestLiftElement) {
      liftsData[i].isMoving = isMoving;
      liftsData[i].floor = floor;
    }
  }
};

const processRequest = () => {
  if (liftRequestQueue.length === 0) return;
  if (
    liftsData.find(
      (ele) => ele.isMoving && ele.floor === liftRequestQueue[0].floor
    )
  )
    return;

  let nearestLiftElement = nearestLift(liftRequestQueue[0].floor);

  if (nearestLiftElement === null) {
    console.log("No lifts free");
    return setTimeout(() => {
      processRequest();
    }, 5000);
  }

  const { lift, floor } = nearestLiftElement;
  updateLiftData(lift, true, liftRequestQueue[0].floor);

  const evictedLift = liftRequestQueue.shift();
  const destinationFloor = evictedLift.floor;
  const differenceBetweenFloors = Math.abs(destinationFloor - floor);

  moveLift(differenceBetweenFloors, destinationFloor, lift);

  setTimeout(() => {
    toggleLiftDoor(lift);
    setTimeout(() => {
      toggleLiftDoor(lift);
      setTimeout(() => {
        updateLiftData(lift, false, destinationFloor);
        processRequest();
      }, 2500);
    }, 2500);
  }, 2000 * differenceBetweenFloors);
};

const toggleLiftDoor = (lift) => {
  const allActiveLifts = lift.children;
  for (let i = 0; i < allActiveLifts.length; i++) {
    allActiveLifts[i].classList.toggle("open");
  }
};

const moveLift = (differenceBetweenFloors, destinationFloor, lift) => {
  const liftHeight = lift.firstElementChild.offsetHeight;
  lift.style.transform = `translateY(-${
    (destinationFloor - 1) * (liftHeight + 1)
  }px)`;
  lift.style.transition = `transform ${2 * differenceBetweenFloors}s linear`;
};
