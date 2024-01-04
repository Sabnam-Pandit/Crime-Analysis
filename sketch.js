const accessToken = 'pk.eyJ1Ijoic2FibmFtLTEyMyIsImEiOiJjbHBvdWtncWswc3l2Mm1xZmMyNXN3YTV4In0.7LB2sYih2vPViL5auiXKpQ';
// let canvas_w = window;
// let canvas_h = 800;
let crimeData; // This will hold the loaded data
let stateCrimeData = {}; // Object to store crime data by state
let geojsonData; // This should be your GeoJSON data
let hoveredStateId = null; // ID of the currently hovered state
let selectedCrimeType = 'Murder';
let isNormalized = 1;
let crimeProperty = 'murderValue';
let slider;
let light_color='#ffcccc';
let dark_color='#ff0000';
let minYear;
let maxYear;
let currentData = []; // Array to hold the filtered data for the selected year
let lastHoveredStateData = null;
let myMap;
let attributeDropdown;
let crimeTypeDropdown;
let attributeType = 'RawCount';
let selectedYear =1960;
let selectedStateData = {};
let crimeColors = {
        'MurderTotal': '#ffb3b3 ',
        'ViolentCrimeTotal': '#A52A2A',
        'RobberyTotal': '#cccc00',
        'BurglaryTotal': '#cc0099',
        'LarcenyTotal': '#6600cc',
        'RapeTotal': '#cc7000',
        'MotorvehicleTotal': '#A9A9A9',
        'AssaultTotal': '#006633',
        'PropertyCrimeTotal': '#000080'
    };
let crimeColorsbar={
        'Murder': '#ffb3b3 ',
        'Violent Crime': '#A52A2A',
        'Robbery': '#cccc00',
        'Burglary': '#cc0099',
        'Larceny Theft': '#6600cc',
        'Rape': '#cc7000',
        'Motor Vehicle Theft': '#A9A9A9',
        'Assault': '#006633',
        'Property Crime': '#000080'
    };



let minCrimeValue = Infinity;
let maxCrimeValue = -Infinity;

let minmurderValue=Infinity;
let maxmurderValue=-Infinity;

let minrapeValue=Infinity;
let maxrapeValue=-Infinity;

let minburglaryValue=Infinity;
let maxburglaryValue=-Infinity;

let minlarcenyValue=Infinity;
let maxlarcenyValue=-Infinity;

let minassaultValue=Infinity;
let maxassaultValue=-Infinity;

let minpropertycrimeValue=Infinity;
let maxpropertycrimeValue=-Infinity;

let minmotorvehicletheftValue=Infinity;
let maxmotorvehicletheftValue=-Infinity;

let minrobberyValue=Infinity;
let maxrobberyValue=-Infinity;

let minviolentcrimeValue=Infinity;
let maxviolentcrimeValue=-Infinity;


function preload() {
  // Load the CSV file
  loadTable("CrimeByState.csv", "csv", "header", function(table) {
    crimeData = table; // Set the loaded data to crimeData
    processData(crimeData);
    calculateMinMaxCrimeValues()// Call processData when the table is loaded
  }, function(error) {
    console.error("Failed to load CSV:", error);
  });
  
}

function setup() {
 let canvas=createCanvas(windowWidth, windowHeight);
 canvas.parent('p5Container');
  // Initialize your Mapbox map here
  // canvas.class('p5Canvas'); // Add a class to style it with CSS
  
  minYear = min(crimeData.getColumn("Year"));
  maxYear = max(crimeData.getColumn("Year"));
  // Set up your slider here
  slider = createSlider(minYear, maxYear, minYear);
  slider.position(30, windowHeight-90);
  slider.style('width', windowWidth * 0.5 + 'px');
 // filterDataForYear(slider.value());
  
    // Dropdown for attributes
  attributeDropdown = createSelect();
  attributeDropdown.position(windowWidth/2+200, windowHeight/20);
  attributeDropdown.option('Choose Attributes');
  attributeDropdown.option('Raw Counts');
  attributeDropdown.option('Per Capita Rates');
  attributeDropdown.selected('Choose Attributes');
  attributeDropdown.changed(onSelectChange_attribute);

  // Dropdown for crime types
  crimeTypeDropdown = createSelect();
  crimeTypeDropdown.position(windowWidth/2+350, windowHeight/20);
  crimeTypeDropdown.option('Choose Crime Type');
  crimeTypeDropdown.option('Murder');
  crimeTypeDropdown.option('Robbery');
  crimeTypeDropdown.option('Rape');
  crimeTypeDropdown.option('Burglary');
  crimeTypeDropdown.option('Larceny Theft');
  crimeTypeDropdown.option('Violent Crime');
  crimeTypeDropdown.option('Assault');
  crimeTypeDropdown.option('Property crime');
  crimeTypeDropdown.option('Motor vehicle theft');
  crimeTypeDropdown.changed(onSelectChange_crimetype);
  selectedCrimeType = crimeTypeDropdown.value();
  
  //Normalize the count
 normalizeDropdown = createSelect();
 normalizeDropdown.position(windowWidth/2+510,windowHeight/20);
 normalizeDropdown.option('Normalized');
 normalizeDropdown.option('Not Normalized');

 normalizeDropdown.selected('Normalized');
 normalizeDropdown.changed(onSelectChange_normalize);
   
  
  
  mapboxgl.accessToken = accessToken; // Replace with your actual access token
  myMap = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-98.5795, 39.8283], // starting position [lng, lat]
    zoom: 3 // starting zoom
  });
  
 initializeMapLayers()

}



function onSelectChange_normalize() {
  let item =   normalizeDropdown.value();
  // Now you can use item to decide what to display
  // For example:
  if(item === 'Normalized') {
  isNormalized =1;
  } else {
    isNormalized =0;
  }
  processData(crimeData);
  calculateMinMaxCrimeValues();
  integrateCrimeDataIntoGeoJSON(stateCrimeData, selectedYear);
  updateMapForCrimeType(selectedCrimeType);
   if (lastHoveredStateData) {
    drawBarChart(lastHoveredStateData.feature, lastHoveredStateData.stateName);
    drawLineChart(lastHoveredStateData.stateName);
  }
  
  
}



function onSelectChange_attribute() {
  let item =   attributeDropdown.value();
  // Now you can use item to decide what to display
  // For example:
  if(item === 'Raw Counts') {
    // Code to display raw counts
    attributeType = 'RawCount'
  } else if(item === 'Per Capita Rates') {
    attributeType = 'Rates'
    // Code to display per capita rates
  }
  processData(crimeData);
  calculateMinMaxCrimeValues();
  integrateCrimeDataIntoGeoJSON(stateCrimeData, selectedYear);
  updateMapForCrimeType(selectedCrimeType);
   if (lastHoveredStateData) {
    drawBarChart(lastHoveredStateData.feature, lastHoveredStateData.stateName);
    drawLineChart(lastHoveredStateData.stateName);
  }
  
  
}

function onSelectChange_crimetype() {
  selectedCrimeType = crimeTypeDropdown.value(); // Update the variable when the selection changes
  processData(crimeData);
  calculateMinMaxCrimeValues();
  integrateCrimeDataIntoGeoJSON(stateCrimeData, selectedYear);
  updateMapForCrimeType(selectedCrimeType); // Call the function to update map for selected crime type
  
   if (lastHoveredStateData) {
    drawBarChart(lastHoveredStateData.feature, lastHoveredStateData.stateName);
    drawLineChart(lastHoveredStateData.stateName);
  }
}

// Process data function
function processData(table) {
  let crimeDataArray = tableToArray(table);

  crimeDataArray.forEach(row => {
    const state = row['State'];
    const year = row['Year'];
    const population = parseInt(row['Population']); // Assuming population is always a number

    if (!stateCrimeData[state]) {
      stateCrimeData[state] = {};
    }
    if (!stateCrimeData[state][year]) {
      stateCrimeData[state][year] = {};
    }

    // Process data based on attribute type
    if (attributeType === 'Rates') {
      stateCrimeData[state][year]['ViolentCrimeTotal'] = parseFloat(row['Violent Crime rate']);
      stateCrimeData[state][year]['MurderTotal'] = parseFloat(row['Murder and nonnegligent manslaughter rate']);
      stateCrimeData[state][year]['RapeTotal'] = parseFloat(row['Forcible rape rate']);
      stateCrimeData[state][year]['RobberyTotal'] = parseFloat(row['Robbery rate']);
      stateCrimeData[state][year]['AssaultTotal'] = parseFloat(row['Aggravated assault rate']);
      stateCrimeData[state][year]['PropertyCrimeTotal'] = parseFloat(row['Property crime rate']);
      stateCrimeData[state][year]['BurglaryTotal'] = parseFloat(row['Burglary rate']);
      stateCrimeData[state][year]['LarcenyTotal'] = parseFloat(row['Larceny-theft rate']);
      stateCrimeData[state][year]['MotorvehicleTotal'] = parseFloat(row['Motor vehicle theft rate']);
    } else { // Raw Counts
      stateCrimeData[state][year]['ViolentCrimeTotal'] = isNormalized ? 
        parseInt(row['Violent crime total']) * 100000 / population : 
        parseInt(row['Violent crime total']);
      stateCrimeData[state][year]['MurderTotal'] = isNormalized ? 
        parseInt(row['Murder and nonnegligent Manslaughter']) * 100000 / population : 
        parseInt(row['Murder and nonnegligent Manslaughter']);
      stateCrimeData[state][year]['RapeTotal'] = isNormalized ? 
        parseInt(row['Forcible rape']) * 100000 / population : 
        parseInt(row['Forcible rape']);
      stateCrimeData[state][year]['RobberyTotal'] = isNormalized ? 
        parseInt(row['Robbery']) * 100000 / population : 
        parseInt(row['Robbery']);
      stateCrimeData[state][year]['AssaultTotal'] = isNormalized ? 
        parseInt(row['Aggravated assault']) * 100000 / population : 
        parseInt(row['Aggravated assault']);
      stateCrimeData[state][year]['PropertyCrimeTotal'] = isNormalized ? 
        parseInt(row['Property crime total']) * 100000 / population : 
        parseInt(row['Property crime total']);
      stateCrimeData[state][year]['BurglaryTotal'] = isNormalized ? 
        parseInt(row['Burglary']) * 100000 / population : 
        parseInt(row['Burglary']);
      stateCrimeData[state][year]['LarcenyTotal'] = isNormalized ? 
        parseInt(row['Larceny-theft']) * 100000 / population : 
        parseInt(row['Larceny-theft']);
      stateCrimeData[state][year]['MotorvehicleTotal'] = isNormalized ? 
        parseInt(row['Motor vehicle theft']) * 100000 / population : 
        parseInt(row['Motor vehicle theft']);
    }
  });
}




function integrateCrimeDataIntoGeoJSON(crimeData, selectedYear) {
  // Assuming 'statesdata' is the GeoJSON object
  

  statesdata.features.forEach(feature => {
      const stateName = feature.properties.name; // Make sure this matches your GeoJSON structure
    // Check if the state has crime data for the selected year
    if (crimeData[stateName] && crimeData[stateName][selectedYear] !== undefined) {
      
      // Assign the crime data for the selected year to the 'crimeValue' property
      // Ensure we're accessing the 'ViolentCrimeTotal' property since it's an object
      feature.properties.violentcrimeValue = crimeData[stateName][selectedYear]['ViolentCrimeTotal'];
      feature.properties.murderValue = crimeData[stateName][selectedYear]['MurderTotal'];
      feature.properties.rapeValue = crimeData[stateName][selectedYear]['RapeTotal'] ;
      feature.properties.robberyValue = crimeData[stateName][selectedYear]['RobberyTotal'];
      feature.properties.assaultValue = crimeData[stateName][selectedYear]['AssaultTotal'];
      feature.properties.propertycrimeValue = crimeData[stateName][selectedYear]['PropertyCrimeTotal'];
      feature.properties.burglaryValue = crimeData[stateName][selectedYear]['BurglaryTotal'];
      feature.properties.larcenyValue = crimeData[stateName][selectedYear]['LarcenyTotal'];
      feature.properties.motorvehicleValue = crimeData[stateName][selectedYear]['MotorvehicleTotal'];
    } else {
      // If no data is available for that year, set a default value (e.g., 0)
      feature.properties.crimeValue = 0;
    }
  });

  // Update the map with the new GeoJSON data
  if (myMap && myMap.getSource('statesdata')) {
    myMap.getSource('statesdata').setData(statesdata);
  }  
}



// Convert a p5.Table to an array of objects
function tableToArray(table) {
  let rows = crimeData.getRows();
  return rows.map(row => {
    let obj = {};
    table.columns.forEach(col => {
      obj[col] = row.getString(col);
    });
    return obj;
  });
}

function draw() {
  background(255);

  selectedYear = slider.value();
  //console.log(selectedYear);

  // Filter or adjust data based on the selected year
    // Check if the slider value has changed
  if (currentData.length === 0 || currentData[0].year != selectedYear) {

   // filterDataForYear(selectedYear);
  }
  

  

  
  // Display the selected year, min year, and max year
  fill(0); // Black text color
  textSize(16);
  textAlign(LEFT); 
  fill(255,0,0);
  text("Choose different factors for crime data visualization", windowWidth/2+200, windowHeight/30);
  fill(0);
  // Position for the min year text
  textAlign(LEFT); 
  text("Min Year: " + minYear, slider.x, slider.y + 30);

  // Position for the max year text
  textAlign(RIGHT); 
  text("Max Year: " + maxYear, slider.x + slider.width, slider.y + 30);

  // Calculate position for the selected year text
  let sliderPos = map(selectedYear, minYear, maxYear, slider.x, slider.x + slider.width);
  textAlign(CENTER); 

  // Ensure the selected year text is positioned correctly
  if (sliderPos < slider.x + 50) {
    textAlign(LEFT);
    sliderPos = slider.x;
  } else if (sliderPos > slider.x + slider.width - 50) {
    textAlign(RIGHT);
    sliderPos = slider.x + slider.width;
  }

  // Display the selected year text
  text("Selected Year: " + selectedYear, sliderPos, slider.y - 20);

   // Draw the bar chart if there is data for the last hovered state
  if (lastHoveredStateData) {
    drawBarChart(lastHoveredStateData.feature, lastHoveredStateData.stateName);
    drawLineChart(lastHoveredStateData.stateName);
  }

  integrateCrimeDataIntoGeoJSON(stateCrimeData, selectedYear); // Filter and update the GeoJSON
  //  drawLineChart(selectedStateName); // Assuming you have a variable `selectedStateName`
  // drawBarChart(selectedFeature, selectedStateName); // Assuming you have the required data
}


function updateMapForCrimeType(crimeType) {
  if (myMap.getSource('statesdata')) {
    myMap.getSource('statesdata').setData(statesdata);
  }

  // You need to recalculate min and max crime counts here
  
  if (selectedCrimeType ===  'Murder'){
    
   minCrimeValue = minmurderValue; // Calculate the minimum crime count
   maxCrimeValue = maxmurderValue;// Calculate the maximum crime count
   crimeProperty = 'murderValue';
   light_color = '#ffb3b3 ';
   dark_color = '#800000';
    console.log('reached_inside_murder');
    //console.log(crimeProperty)
  }
    if (selectedCrimeType ===  'Violent Crime'){
    
   minCrimeValue = minviolentcrimeValue; // Calculate the minimum crime count
   maxCrimeValue = maxviolentcrimeValue;// Calculate the maximum crime count
   crimeProperty = 'violentcrimeValue';
   light_color = '#DAB894 ';
   dark_color = '#A52A2A';
    console.log('reached_inside_murder');
    //console.log(crimeProperty)
  }
      console.log(crimeProperty)
  
  if (selectedCrimeType === 'Robbery'){
   minCrimeValue = minrobberyValue; // Calculate the minimum crime count
   maxCrimeValue = maxrobberyValue ;// Calculate the maximum crime count
   crimeProperty = 'robberyValue';

   light_color = '#ffff99';
   dark_color = '#cccc00' ;
  }
  
  
  if (selectedCrimeType === 'Burglary'){
    minCrimeValue = minburglaryValue; // Calculate the minimum crime count
    maxCrimeValue = maxburglaryValue; // Calculate the maximum crime count
    crimeProperty = 'burglaryValue';
    light_color = '#ffb3ff';
    dark_color = '#cc0099 ';
  }
  
  if (selectedCrimeType === 'Larceny Theft'){
   minCrimeValue = minlarcenyValue;// Calculate the minimum crime count
   maxCrimeValue = maxlarcenyValue; // Calculate the maximum crime count
   crimeProperty = 'larcenyValue';
   light_color = '#d9b3ff';
   dark_color = '#6600cc'; 
  }
  if (selectedCrimeType === 'Rape'){
  minCrimeValue = minrapeValue; // Calculate the minimum crime count
  maxCrimeValue = maxrapeValue; // Calculate the maximum crime count
  crimeProperty = 'rapeValue';
  light_color = '#ffcc99';
  dark_color = '#cc7000 '; 
  }
  
  if (selectedCrimeType === 'Motor vehicle theft'){
  minCrimeValue = minmotorvehicletheftValue; // Calculate the minimum crime count
  maxCrimeValue = maxmotorvehicletheftValue; // Calculate the maximum crime count
  crimeProperty = 'motorvehicleValue';
  light_color = '#E0E0E0';
  dark_color = '#A9A9A9'; 
  }
  
  if (selectedCrimeType === 'Assault'){
  minCrimeValue = minassaultValue; // Calculate the minimum crime count
  maxCrimeValue = maxassaultValue; // Calculate the maximum crime count
  crimeProperty = 'assaultValue';
  light_color = '#b3ffcc';
  dark_color = '#006633'; 
  }
  
  if (selectedCrimeType === 'Property crime'){
  minCrimeValue = minpropertycrimeValue; // Calculate the minimum crime count
  maxCrimeValue = maxpropertycrimeValue; // Calculate the maximum crime count
  crimeProperty = 'propertycrimeValue';
  light_color = '#b3b3ff';
  dark_color = '#000080'; 
  }
  console.log(crimeProperty)

updateMapLayerColors(minCrimeValue, maxCrimeValue, light_color, dark_color, crimeProperty);


}


function initializeMapLayers() {
  myMap.on('load', function () {
    myMap.addSource('statesdata', {
      'type': 'geojson',
      'data': statesdata
    });

    myMap.addLayer({
      'id': 'states-layer',
      'type': 'fill',
      'source': 'statesdata',
      'paint': {
        'fill-color': '#FFF', // Initial color, will be updated later
         'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1, // Opacity when hovered
      0.75 // Default opacity
    ]
      }
    });
myMap.on('mousemove', 'states-layer', function(e) {
      if (e.features.length > 0) {
        if (hoveredStateId) {
          myMap.setFeatureState({ source: 'statesdata', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = e.features[0].id;
        myMap.setFeatureState({ source: 'statesdata', id: hoveredStateId }, { hover: true });

        const feature = e.features[0];
        const stateName = feature.properties.name;
        const crime_Data = feature.properties[crimeProperty];
        updateInfoPanel(stateName, crime_Data, e.point.x, e.point.y);
         // Update last hovered state data
    lastHoveredStateData = {
      feature: feature,
      stateName: stateName
    };
        drawBarChart(feature,stateName); // Call the drawBarChart here
        drawLineChart(stateName);
      }
    });

    myMap.on('mouseleave', 'states-layer', function() {
      if (hoveredStateId) {
        myMap.setFeatureState({ source: 'statesdata', id: hoveredStateId }, { hover: false });
      }
      hoveredStateId = null;
      hideInfoPanel(); // Hide the info panel on mouse leave
        // Clear last hovered state data
  //lastHoveredStateData = null;
    });
  });
}



function updateInfoPanel(stateName, crime_Data, x, y) {
  const infoPanel = document.getElementById('infoPanel');
  if (!infoPanel) {
    console.error('InfoPanel element not found');
    return;
  }

  // Assuming crime_Data is the count or rate for the selected year and crime type
  let displayText;
  if (attributeType === 'Rates') {
    displayText = `<strong>${stateName}, ${selectedYear}</strong><br>Crime per capita Rate: ${crime_Data}`;
  } else {
    displayText = `<strong>${stateName}, ${selectedYear}</strong><br>Crime Count: ${crime_Data}`;
  }

  infoPanel.innerHTML = displayText;
  infoPanel.style.left = `${x}px`;
  infoPanel.style.top = `${y}px`;
  infoPanel.style.display = 'block';
  
//   // Capture data for bar chart
// selectedStateCrimeData = stateCrimeData[stateName] && stateCrimeData[stateName][selectedYear] ? stateCrimeData[stateName][selectedYear] : {};
//   drawBarChart(selectedStateData); // Draw the bar chart
}


function hideInfoPanel() {
  const infoPanel = document.getElementById('infoPanel');
  if (infoPanel) {
    infoPanel.style.display = 'none';
  }
}

function updateMapLayerColors(minCrimeValue, maxCrimeValue, light_color, dark_color, crimeProperty) {
  console.log('Updating map colors with:', minCrimeValue, maxCrimeValue, light_color, dark_color, crimeProperty);

  if (myMap && myMap.getSource('statesdata')) {
    if (minCrimeValue !== undefined && maxCrimeValue !== undefined && 
        light_color && dark_color && crimeProperty) {
      myMap.setPaintProperty('states-layer', 'fill-color', [
        'case',
        ['==', ['get', crimeProperty], null], '#000000',
        ['==', ['get', crimeProperty], 0], '#000000',
        ['interpolate', ['linear'], ['get', crimeProperty], 
          minCrimeValue, light_color, maxCrimeValue, dark_color]
      ]);}
    // } else {
    //   console.error('Invalid parameters passed to updateMapLayerColors');
    // }
  } else {
    console.error('Map source not found or map not initialized');
  }
}






function calculateMinMaxCrimeValues() {
  minCrimeValue = Infinity;
  maxCrimeValue = -Infinity;

  minmurderValue=Infinity;
  maxmurderValue=-Infinity;

  minrapeValue=Infinity;
  maxrapeValue=-Infinity;

  minburglaryValue=Infinity;
  maxburglaryValue=-Infinity;

  minlarcenyValue=Infinity;
   maxlarcenyValue=-Infinity;

   minassaultValue=Infinity;
   maxassaultValue=-Infinity;

   minpropertycrimeValue=Infinity;
   maxpropertycrimeValue=-Infinity;

   minmotorvehicletheftValue=Infinity;
  maxmotorvehicletheftValue=-Infinity;

   minrobberyValue=Infinity;
   maxrobberyValue=-Infinity;

  minviolentcrimeValue=Infinity;
   maxviolentcrimeValue=-Infinity;
  
  for (let state in stateCrimeData) {
    for (let year in stateCrimeData[state]) {
      
      // let crimeValue = stateCrimeData[state][year]['ViolentCrimeTotal'];
      // if (crimeValue < minCrimeValue) minCrimeValue = crimeValue;
      // if (crimeValue > maxCrimeValue) maxCrimeValue = crimeValue;
      
      
      let murderValue = stateCrimeData[state][year]['MurderTotal'];
      if (murderValue < minmurderValue) minmurderValue = murderValue;
      if (murderValue > maxmurderValue) maxmurderValue = murderValue;
      
      
      let rapeValue = stateCrimeData[state][year]['RapeTotal'];
      if (rapeValue < minrapeValue) minrapeValue = rapeValue;
      if (rapeValue > maxrapeValue) maxrapeValue = rapeValue;
      
            let robberyValue = stateCrimeData[state][year]['RobberyTotal'];
            if (robberyValue < minrobberyValue) minrobberyValue = robberyValue;
      if (robberyValue > maxrobberyValue) maxrobberyValue = robberyValue;
      
            let assaultValue = stateCrimeData[state][year]['AssaultTotal'];
            if (assaultValue < minassaultValue) minassaultValue = assaultValue;
      if (assaultValue > maxassaultValue) maxassaultValue = assaultValue;
       
        let propertycrimeValue = stateCrimeData[state][year]['PropertyCrimeTotal'];
            if (propertycrimeValue < minpropertycrimeValue) minpropertycrimeValue = propertycrimeValue;
      if (propertycrimeValue > maxpropertycrimeValue)maxpropertycrimeValue = propertycrimeValue;
       
      
        let burglaryValue = stateCrimeData[state][year]['BurglaryTotal'];
            if (burglaryValue < minburglaryValue)minburglaryValue = burglaryValue;
      if (burglaryValue > maxburglaryValue) maxburglaryValue = burglaryValue;
      
      
      
            
        let larcenyValue = stateCrimeData[state][year]['LarcenyTotal'];
            if (larcenyValue < minlarcenyValue) minlarcenyValue = larcenyValue;
      if (larcenyValue > maxlarcenyValue) maxlarcenyValue = larcenyValue;
      
             
      
        let violentcrimeValue = stateCrimeData[state][year]['ViolentCrimeTotal'];
            if (violentcrimeValue < minviolentcrimeValue)minviolentcrimeValue= violentcrimeValue;
      if (violentcrimeValue > maxviolentcrimeValue)maxviolentcrimeValue = violentcrimeValue;
      
      
        let motorvehicletheftValue = stateCrimeData[state][year]['MotorvehicleTotal'];
            if (motorvehicletheftValue < minmotorvehicletheftValue) minmotorvehicletheftValue =motorvehicletheftValue;
      if (motorvehicletheftValue > maxmotorvehicletheftValue) maxmotorvehicletheftValue = motorvehicletheftValue;
    }
  }
}


// This function filters the table for the given year
function filterDataForYear(year) {
  currentData = []; // Clear the current data
  for (let r = 0; r < crimeData.getRowCount(); r++) {
    let row = crimeData.getRow(r);
    if (row.getNum("year") === year) {
      currentData.push({
        // Add all the necessary data you want to display
        year: row.getNum("year"),
        // For example:
        // attribute1: row.getNum("attribute1"),
        // attribute2: row.getNum("attribute2"),
        // ... and so on for other attributes
      });
    }
  }
}

function filterGeoJSONByYear(year) {
  // Assuming 'statesdata' is your GeoJSON object and it's already loaded
  statesdata.features.forEach(feature => {
    // Access the crime data for the specific year
    let yearlyCrimeData = feature.properties.crimeValue[year.toString()];
    
    // Update the crimeValue property used by the Mapbox layer
    feature.properties.crimeValue = yearlyCrimeData || 0; // Default to 0 if data is missing
  });

  // After modifying the GeoJSON, update the Mapbox data source
  if (myMap.getSource('statesdata')) {
    myMap.getSource('statesdata').setData(statesdata);
  }
}
function drawBarChart(feature, stateName) {
  // Check if feature has the necessary data
  if (!feature || !feature.properties || !stateName) {
    console.error('Invalid feature or stateName');
    return;
  }

  // Extracting crime data from the feature properties
  const data = {
    'Murder': feature.properties['murderValue'],
    'Rape': feature.properties['rapeValue'],
    'Robbery': feature.properties['robberyValue'],
    'Assault': feature.properties['assaultValue'],
    'Property Crime': feature.properties['propertycrimeValue'],
    'Burglary': feature.properties['burglaryValue'],
    'Larceny Theft': feature.properties['larcenyValue'],
    'Motor Vehicle Theft': feature.properties['motorvehicleValue'],
    'Violent Crime': feature.properties['violentcrimeValue']
  };

    let chartX =  windowWidth/2+100;
    let chartY = windowHeight/2-100;
    let chartWidth = windowWidth/4;
    let chartHeight = windowHeight /2.5;
  let barWidth = chartWidth/10;
  let spacing = chartWidth/20;
  let maxBarHeight = chartHeight - 250; // Leave some space for labels
  let stateNameX = chartX + chartWidth+100; // Center of the chart
  let stateNameY = chartY + chartHeight + 40; // Below the chart, adjust this value as needed
  fill(0); // Set text color
    noStroke();
    textSize(16); // Set text size
    textAlign(CENTER, TOP); // Align text to center and top for proper positioning
    //text(stateName, stateNameX, stateNameY); // Draw the state name
  
     // Title for the Bar Chart
    let barChartTitle = "Crime Chart , " + stateName +" , " +selectedYear; // Customize the title as needed
    let titleX =chartX +chartWidth/1.2;// Adjust position as needed
    let titleY = chartY+chartHeight + 90; // Position above the chart

    fill(0); // Title text color
    textSize(20); // Title text size
    textAlign(CENTER, CENTER);
    text(barChartTitle, titleX, titleY);

  // Find the maximum value to scale the bars
  let maxValue = 0;
  for (let crimeType in data) {
    if (data[crimeType] > maxValue) {
      maxValue = data[crimeType];
    }
  }

  // Draw the chart background
  fill(255); // White background
  noStroke();
  rect(chartX, chartY, chartWidth, chartHeight);

  
    // Reduce the number of labels if they overlap, or rotate them
  let labelAngle = -60; // Angle to rotate labels
  
  // Draw the bars
  let x = chartX + 40; // Initial X position for the first bar
  for (let crimeType in data) {
    let value = data[crimeType];
    let barHeight = map(value, 0, maxValue, 0, maxBarHeight);
    let barY = chartY + chartHeight - barHeight - 20;

    
    // Check if the mouse is over the bar
    if (isMouseOverBar(x, barY, barWidth, barHeight)) {
      fill(150, 150, 255); // Highlight color
      // Show the count
      fill(0); // Text color
      textSize(12);
      textAlign(CENTER);
      text(value, x + barWidth / 2, barY - 5);
    } else {
      fill(100, 100, 200); // Normal bar color
    }
    
     rect(x, barY, barWidth, barHeight);

// Draw the crime type labels
 // Black text for labels
    textSize(12);
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    push(); // Save drawing state
    translate(x + barWidth / 2, chartY + chartHeight); // Move to label position
    rotate(-QUARTER_PI); // Rotate labels
    fill(crimeColorsbar[crimeType] || 'black');
    text(crimeType, -30, 3); // Position label next to bar

    pop(); // Restore drawing state

    x += barWidth + spacing; // Move to the next bar position
  }
}


function isMouseOverBar(x, y, barWidth, barHeight) {
  return mouseX > x && mouseX < x + barWidth && mouseY > y && mouseY < y + barHeight;
}


function drawLineChart(stateName) {
    // Define the dimensions and positions for the chart
    let chartX = windowWidth /2+200;
    let chartY = windowHeight*0.12;
    let chartWidth = windowWidth /4;
    let chartHeight = windowHeight /3;

    // Check if there is data for the hovered state
    if (!stateCrimeData[stateName]) {
        console.error('No data for state:', stateName);
        return;
    }

    let crimeTypes = Object.keys(stateCrimeData[stateName][Object.keys(stateCrimeData[stateName])[0]]); // Assume the first year has all crime types
  //console.log(crimeTypes);
    let years = Object.keys(stateCrimeData[stateName]).sort();
//console.log(years);
    // Find min and max values for crimes and years
    let minCrimeValue = Infinity;
    let maxCrimeValue = -Infinity;
    years.forEach(year => {
        crimeTypes.forEach(crimeType => {
            let crimeValue = stateCrimeData[stateName][year][crimeType];
            minCrimeValue = min(minCrimeValue, crimeValue);
            maxCrimeValue = max(maxCrimeValue, crimeValue);
        });
    });
  
 // Set text properties for axis labels
    textSize(10);
    textAlign(CENTER, TOP);

     // Determine the interval for displaying year labels
    const yearInterval = 5; 
    let firstYear = parseInt(min(years)); // Automatically determine the first year
    let lastYear = parseInt(max(years));  // Automatically determine the last year

    // Ensure the first and last years are included in the interval
    if ((lastYear - firstYear) % yearInterval !== 0) {
        lastYear = firstYear + Math.ceil((lastYear - firstYear) / yearInterval) * yearInterval;
    }

    // Draw sparse year labels on the x-axis, including first and last year
    years.forEach(year => {
        year = parseInt(year); // Ensure year is an integer
        if (year === firstYear || year === lastYear || year % yearInterval === 0) {
            let x = map(year, firstYear, lastYear, chartX, chartX + chartWidth);
            text(year, x, chartY + chartHeight + 5); // Position labels just below the x-axis
        }
    });

  
    // Draw chart background
    fill(255);
    stroke(0);
    rect(chartX, chartY, chartWidth, chartHeight);

    // Set colors for each crime type
 

 crimeTypes = crimeTypes.filter(crimeType => crimeColors[crimeType]);
    if (attributeType === 'Rates') {
        crimeTypes = crimeTypes.filter(crimeType => crimeColors[crimeType]);
    } else {
        crimeTypes = crimeTypes.filter(crimeType => crimeColors[crimeType]);
    }

    // Draw lines for each crime type
    crimeTypes.forEach((crimeType, index) => {
        stroke(crimeColors[crimeType]);
        noFill();
        beginShape();
        years.forEach(year => {
            let x = map(year, min(years), max(years), chartX, chartX + chartWidth);
            let y = map(stateCrimeData[stateName][year][crimeType], minCrimeValue, maxCrimeValue, chartY + chartHeight, chartY);
            vertex(x, y);
        });
        endShape();
    });

    // Add legend and axis labels
    let legendX = chartX + chartWidth + 25;
    let legendY = chartY+10;
  let y_text;
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    crimeTypes.forEach((crimeType, index) => {
        fill(crimeColors[crimeType]);
         rect(legendX, legendY + index * 20, 15, 15);
       fill(0); // Black text for legend
        text(crimeType, chartX + chartWidth + 45, chartY + index * 20+18);
    });

  
  
    fill(0);
    text('Year', chartX + chartWidth / 2, chartY + chartHeight + 30);
    textAlign(RIGHT, CENTER);
    if (attributeType ==='Rates'){
     y_text = 'Per capita Rates'}
    else{y_text = 'Crime Count'}
    
    text(y_text, chartX - 20, chartY + chartHeight / 2);
  
  
   // Title for the Line Chart
    let lineChartTitle = "Line Chart over time, " + stateName ; // Customize the title as needed
    let titleX =chartX +chartWidth/2;//Adjust position as needed
    let titleY = chartY + chartHeight+60; // Position above the chart

    fill(0); // Title text color
    textSize(20); // Title text size
    textAlign(CENTER, CENTER);
    text(lineChartTitle, titleX, titleY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
 slider.position(30, windowHeight - 100);
 slider.style('width', windowWidth * 0.5 + 'px'); // Adjust the width of the slider as a percentage of the window width
   // slider.style('width', '700px');
    attributeDropdown.position(windowWidth/2+200, windowHeight/20);
    crimeTypeDropdown.position(windowWidth/2+350, windowHeight/20);
   normalizeDropdown.position(windowWidth/2+510,windowHeight/20);
    // Optionally, you can also recalculate positions and sizes if needed
  
   text("Max Year: " + maxYear, slider.x + slider.width, slider.y + 30);

  
    text("Choose different factors for crime data visualization", windowWidth/2+200, windowHeight/30);
    let sliderPos = map(selectedYear, minYear, maxYear, slider.x, slider.x + slider.width);
    text("Selected Year: " + selectedYear, sliderPos, slider.y - 20);
  
    // Redraw the bar chart and line chart with updated positions
    if (lastHoveredStateData) {
        drawBarChart(lastHoveredStateData.feature, lastHoveredStateData.stateName);
        drawLineChart(lastHoveredStateData.stateName);
    }

    redraw(); // Redraw the entire sketch
  redraw();
}