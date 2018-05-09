// access custom CSS to make chart elements responsive
const style = getComputedStyle(document.body);
//console.log('css variable:',style);


// Dataset presets
// preselected DB
const preselectedDB = 1; // of 0/1/2/ <-- when concat array (when object: 1/2/3)

// References of DBs
const dbRefs  = ['Bingen et al. (2017)',
                 'Mills et al. (2016)',
                 'Carn et al. (2016)'];


// Markup presets
// 1) map background and land mask
//const black000 = "rgb(0, 0, 0)"; // #000
//const gray333  = "rgb(51, 51, 51)";
//const grayccc  = "rgb(204, 204, 204)";
//const gray111  = "rgb(17, 17, 17)";
//const gray69   = "rgb(105, 105, 105)";   // #696969 aka dimgray
//const brown01  = "rgb(104, 90, 92)";     // #685a5c
//const orange01 = "rgb(217, 137, 97)";    // #d98961
//const orange02 = "rgb(231, 189, 114)";   // #e7bd72

const black000 = style.getPropertyValue('--black000');
const gray333  = style.getPropertyValue('--gray333');
const grayccc  = style.getPropertyValue('--grayccc');
const gray111  = style.getPropertyValue('--gray111');
const gray69   = style.getPropertyValue('--gray69');
const brown01  = style.getPropertyValue('--brown01');
const orange01 = style.getPropertyValue('--orange01');
const orange02 = style.getPropertyValue('--orange02');
const orange03 = style.getPropertyValue('--orange03');

// 2) mapping color scales   ... largely obsolete map19_2+
const yellowCS = '#ECD078',
      redCS    = '#C02942',
      greenish = ['#ACD855', '#1E8B54'],
      reddish  = [yellowCS, redCS];

//const actual_colorbar = reddish;


// 3) slider positioning:
const slider_scale_margin_left = 737; // slider axis text position left
const slider_scale_stretch     = 720; // slider axis text stretch (center aligned!!)

const slider_label_x_pos = 450,
      slider_label_y_pos = 20,
      slider_dyn_label_x_pos = 600;


// 4) button state colors (orange shades, compare to css)   <----------------------- TODO unification colors in CSS + JS
const btn_defaultColor= gray333;     //                    default: #7777BB
const btn_hoverColor  = "#FFDFA5";   //                    default: #0000ff
const btn_pressedColor= orange02;    //                    default: #000077




// Set the dimensions of canvas for both graphs
const margin = {top: 30, right: 20, bottom: 30, left: 50,
                slider: slider_scale_margin_left,
                ts_top: 50, ts_left:155},
      width = 960 ,
      height = 700;

const map_y_top_pos = -70,
      ts_y_top_pos  = 530;

const map_title_x_pos = 400,
      map_title_y_pos = 180;

const map_legend_x_pos = 76,
      map_legend_y_pos = 60;

// set time-series graph dimensions
const ts_width  = 750;
const ts_height = 100;

const ts_title_x_pos = 150,
      ts_title_y_pos = -10;

const ts_legend_x_pos = 23,
      ts_legend_y_pos = 560;



//- - Map: initialisation ... moreover, this is general initialisation of svg area
d3.select("div.row.tar-viz-row").append("div").attr('id',"svgTAR");

// d3 global def:
const svg = d3.select("#svgTAR").append("svg").attr("class", "svg-pad"); // set map's BG color here via class (overwrite html body BG color - otherwise not possible to trustworthly change color afterwards)
// Set the size of the SVG element
svg.attr('width', width).attr('height', height);

// ini map & map data d3 groups & layouting
svg.append('g').classed('map' , true).attr("transform", "translate(0,"+map_y_top_pos+")");
svg.append('g').classed('dots', true).attr("transform", "translate(0,"+map_y_top_pos+")");

// ini time-series & layouting
svg.append('g').classed('ts' , true).attr("transform", "translate("+margin.ts_left+","+ts_y_top_pos+")");

/* v3:
svg.append('foreignObject').attr("width", 700).attr("height", 30)
            .attr("transform", "translate(5,682)")
            .classed('copyright' , true)
            .append("xhtml:body")
            .style("font", "7px 'Helvetica Neue'").style("font-weight","300").style("letter-spacing","2px")
            .style("color", "#e7bd72").style("background-color","transparent")
            .style()
//v3:            .html("<p>&copy;CC 2018 - HOMMEL & GRAF ENVIRONMENTAL - contact@env.earth</p>");
*/

//- - Settings map specific:

// specific svg elements:
// Create and configure a geographic projection
//v3: var projection = d3.geo.equirectangular()
var projection = d3.geoEquirectangular()
    // optionally scale, set padding:
    .scale(width/8)
    .translate([width / 2+50, height / 2+20]);

// Create and configure a path generator
//v3: var pathGenerator = d3.geo.path()
var pathGenerator = d3.geoPath()
    .projection(projection);


//- -  Parse date information from DB's
//v3: var parseDate = d3.time.format("%e %b %Y").parse;
//v3: var parseYear = d3.time.format("%Y");
var parseDate = d3.timeParse("%e %b %Y");
var parseYear = d3.timeFormat("%Y");


//- -  defining UI object with initial declaritions, self explaining
var uiObj = new Object(),
    str  = 'ui_settings',
    buttonsDBselection = 'state_DB_selection',
    buttonAllYears = 'state_all_years_selection',
    slider = 'state_slider';

    uiObj.buttonsDBselection = 0;  // pre-selected database 0/1/2
    uiObj.buttonAllYears = 'on';   // show all years on initialisation
    uiObj.slider = 13;             // default slider state (indices corresponidng to years on slider axis)


//-- establish UI Buttons

// buttons are svg elements:
//      xTranslate,yTranslate,bSpace,x0,y0
let dims    = [0,240,20,20,20];
let offsets = [20,60,100];
let labels  = ['DB1','DB2','DB3'];
let btnText = ['Dataset 1','Dataset 2','Dataset 3'];
let btnTextOffset = [170,30]; //x,ypos
// set switch for defining preselected button:
let dbSelection= [0,0,0];
dbSelection.forEach(function(d,i) {
    //console.log('buttonDB dbSelection: ',i,d);
    if(i == uiObj.buttonsDBselection) {
        //console.log('buttonDB dbSelection: found match:',i,uiObj.buttonsDBselection);
        return dbSelection[i]=1;
    };
});
const buttonsDB = setup_buttons(svg,"btnSet1",dims,offsets,dbSelection,labels,btnText,"DB");
dims = [830,0,20,20,20];
offsets= [20,40];
labels= ['OffOn'];
btnText = ['All Years'];
dbSelection__tmp= [1];
var buttonAllYears = setup_buttons(svg,"btnSet2",dims,offsets,dbSelection__tmp,labels,btnText,['All Years]']);




//- - Run viz, incl. importing data: - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - *
queue()
    .defer(d3.csv, "db1_2002-2012.csv")    // anual accumulations per volcanoe for mapping
    .defer(d3.csv, "db2_1998-2012.csv")
    .defer(d3.csv, "db3_1998-2012.csv")
    .defer(d3.csv, "db1_1998-2012_ts.csv") // time-series as given in data sets - no accumulation over time - not intended for mapping!!
    .defer(d3.csv, "db2_1998-2012_ts.csv")
    .defer(d3.csv, "db3_1998-2012_ts.csv")
    .defer(d3.json, "land.geojson")
    .await(ready);


function ready(error, map_db1, map_db2, map_db3, ts_db1, ts_db2, ts_db3, land) {
    if (error) throw error;
    console.log('map_db1: ',map_db1);
    console.log('map_db2: ',map_db2);
    console.log('map_db3: ',map_db3);
    console.log('ts_db1: ',ts_db1);
    console.log('ts_db2: ',ts_db2);
    console.log('ts_db3: ',ts_db3);
    console.log('land_1 : ',land);

    // for unified scaling of volcano magnitude across the DBs first find max magnitude of all data:
    // this mustr be done for mapping and time-series seperately since both apply different data sets
    // (map: annually accumulated, time-series: considers each eruption as listed)
    // for sake of simplicity, all DBs are merged into a single array
    const mergedDBarray_map = map_db1.concat(map_db2,map_db3);
    const mergedDBarray_ts  = ts_db1.concat(ts_db2,ts_db3);
    //console.log('ready:  initially merged DB array for setting unified scaling:',mergedDBarray_map);
    const allMax_map = find_overall_max(mergedDBarray_map);
    const allMax_ts  = find_overall_max(mergedDBarray_ts);
    console.log('ready:  overall max magnitude for unified scaling (map):',allMax_map);
    console.log('ready:  overall max magnitude for unified scaling (ts) :',allMax_ts);

    const db1_map = {'volc':map_db1}; //  unified key name necessary
    const db2_map = {'volc':map_db2};
    const db3_map = {'volc':map_db3};
    const db1_ts  = {'volc':ts_db1};
    const db2_ts  = {'volc':ts_db2};
    const db3_ts  = {'volc':ts_db3};

    // storing datasets in single array:
    const datasets = [db1_map,db2_map,db3_map];

    // defining data object with initial declaritions, self explaining:
    var dataObj = new Object(),
        str  = 'dbName',
        db_1_map = 'dataarray1_map',
        db_2_map = 'dataarray2_map',
        db_3_map = 'dataarray3_map',
        db_1_ts  = 'dataarray1_ts',
        db_2_ts  = 'dataarray2_ts',
        db_3_ts  = 'dataarray3_ts',
        selected_db_map = 'selected_dataset_map',
        selected_db_ts  = 'selected_dataset_ts',
        selected_years_map = 'selected_years_map', // selected db but only requested years (default: all years !!)
        selected_years_ts  = 'selected_years_ts',  // same for time-series
        name_of_selected_db = 'name_of_selected_db', // just the name of data base for easy debugging or side information
        all_years_of_selected_db = 'all_years_of_selected_db', // just the year info of selected (and possibly time-sliced) db
        unique_years_of_selected_db = 'unique_years_of_selected_db', // NOT>extracting<NOT unique years (predefine, also consiudering empty years)
        selectDB = 'selection_DB_method',
        sliceDB = 'timeslice_method'; // try to slice both map and time-series within this method


        // datasets embedded:
        dataObj.str = 'TAR_DB';
        dataObj.db_1_map  = db1_map;
        dataObj.db_2_map  = db2_map;
        dataObj.db_3_map  = db3_map;
        dataObj.db_1_ts   = db1_ts;
        dataObj.db_2_ts   = db2_ts;
        dataObj.db_3_ts   = db3_ts;
        // preselection on initialisation (directly preferred):
        dataObj.selected_db_map = dataObj.db_2_map;
        dataObj.selected_db_ts  = dataObj.db_2_ts;
        // in order to initialise slider preselect information about years in the default dataset:
        dataObj.all_years_of_selected_db = get_info_all_years_obj(dataObj.selected_db_map);
        // ... and build array holding unique values of years in the chosen dataset:
        dataObj.unique_years_of_selected_db = [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012];
        // build-in methods to operate on embedded datasets:
        dataObj.selectDB = function (item) {
            // selecting a DB
            if (item > 0 && item < 4) {
                map_item = item;
                ts_item  = item+3;
                dataObj.selected_db_map = Object.values(dataObj)[map_item];
                dataObj.selected_db_ts  = Object.values(dataObj)[ts_item];
                dataObj.name_of_selected_db = dbRefs[item-1];
            } else {
            throw '- Error: Unregistered Data Base - Please select from database index 1,2 or 3 -';
            };
        };
        dataObj.sliceDB = function (item) { // hier bei Deklaration kann man preset angeben

        let jsonData_map = {};
        let jsonData_ts  = {};
        this.selected_db_map.volc.forEach(function(d,i) {
                if(parseYear(parseDate(d["Time Eruption"])) == item) {
                    return jsonData_map[i] = d;
                };
        });
        this.selected_db_ts.volc.forEach(function(d,i) {
                if(parseYear(parseDate(d["Time Eruption"])) == item) {
                    return jsonData_ts[i] = d;
                };
        });
        // "destructuring assignments":
        return {a:dataObj.selected_years_map = jsonData_map,b:dataObj.selected_years_ts = jsonData_ts} // <--- critical ???
    };
    console.log('new dataObj.str: ',dataObj.str);
    console.log('new dataObj.db_2_map : ',dataObj.db_2_map);
    console.log('   alternative db selection via index : ',Object.values(dataObj)[2]);
    console.log('new dataObj.selectDB (method): ',dataObj.selectDB(2));
    console.log('new dataObj.selected_db : ',dataObj.selected_db);
    year = get_year_for_dataOb_slicing(dataObj,uiObj);
    console.log('new dataObj.sliceDB (method): ',dataObj.sliceDB(year)); // same in update_viz()
    console.log('new dataObj.selected_years_map : ',dataObj.selected_years_map); // <--- !!!!
    console.log('new dataObj.selected_years_ts : ',dataObj.selected_years_ts);   // <--- !!!!
    console.log('new dataObj.all_years_of_selected_db: ',dataObj.all_years_of_selected_db);
    console.log('new dataObj.unique_years_of_selected_db: ',dataObj.unique_years_of_selected_db);



    //---------------- DATA BINDING TO BUTTON EVENTS ----------------------------------------------------------

    buttonsDB.on("click",function(d,i) {
        updateButtonColors(d3.select(this), d3.select(this.parentNode));
        // set correct db name as additional button text (see buttonsDB defintion);
        let dbSelection= [0,0,0]; // nullify
        dbSelection.forEach(function(a, j) {
            if(j == i) {
                return dbSelection[j]=1;
            };
        });
        update_button_text_reference(dbSelection,"DB");

        uiObj.buttonsDBselection = i; // selects from db 0/1/2
        update_viz();
    });
    buttonAllYears.on("click",function(d,i) {
        [selection,showAllYears] = updateOnOffButtonColors(d3.select(this));
        //console.log('buttonAllYears.on click: übergebe i an update_data_buttonAllYears:',i);
        //console.log('buttonAllYears.on click: d3.select(this), d3.select(this.parentNode):', // check what click event returns
        //                                      d3.select(this), d3.select(this.parentNode));
        //console.log('buttonAllYears.on click: returns: selection,showAllYears:',selection,showAllYears);

        uiObj.buttonAllYears = showAllYears;
        update_viz();
    });

    //---------------- DEFINE SLIDER AND DATA BINDING TO SLIDER EVENTS ----------------
    // before setting up plot, setup slider (requires dataObj to be known)
//outdated    const slider = setup_slider(svg,"#svgTAR",dataObj.unique_years_of_selected_db,uiObj.slider);
//outdated    const setup_slider_axis = slider_axis_scale(svg,dataObj.unique_years_of_selected_db);
    //receive slider's initial value (which must be 0):
//outdated    const ini_current = document.getElementById('slider_input').value;
//outdated    const slider_ini_value = [ini_current];

    // since 27_4 only set slider title
    setup_slider_title(svg,"#svgTAR",dataObj.unique_years_of_selected_db,uiObj.slider);

    // tarviz_27+: d3v4 'native' slider:
    var new_sliders_year_sel = -99; // initial
//  var sliderWidth = 500;
    // access CSS variables
    const sliderWidth = style.getPropertyValue('--sliderWidth');
    const sliderXPos  = style.getPropertyValue('--sliderXPos');
    const sliderYPos  = style.getPropertyValue('--sliderYPos');

    // my port applies years only for slider axis/labeling:
    var xYearFirst = d3.scaleLinear()
        .domain([1998, 2012])
        .range([0, sliderWidth])
        .clamp(true);
    // added index range for simple migrations (alternatively on could set the year tracked
    // from slider directly in the dataObj, or so)
    var idxYearFirst = d3.scaleLinear()
            .domain([0, 14])
            .range([0, sliderWidth])
            .clamp(true);

    var sliderYearFirst = svg.append("g")
            .attr("class", "v4_slider")
//          .attr("transform", "translate(100,400)");
            .attr("transform", "translate("+sliderXPos+","+sliderYPos+")")

    sliderYearFirst.append("line")
            .attr("class", ".v4_slider_track")
//          .attr("x1", xYearFirst.range()[0])
//          .attr("x2", xYearFirst.range()[1])
            .attr("x1", idxYearFirst.range()[0])
            .attr("x2", idxYearFirst.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "v4_slider_track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "v4_slider_track-overlay")
        .call(d3.drag()
        .on("start.interrupt", function() { sliderYearFirst.interrupt(); })
        .on("start drag", function() {
//            setHandle1(xYearFirst.invert(d3.event.x));
              setHandle1(idxYearFirst.invert(d3.event.x));
        }));

    sliderYearFirst.insert("g", ".track-overlay")
            .attr("class", ".v4_slider_ticks")
            .attr("transform", "translate(0," + 20 + ")")
        .selectAll("text")
        .data(xYearFirst.ticks(10))
        .enter().append("text")
            .attr("x", xYearFirst)
            .attr("text-anchor", "middle")
            .text(function(d) { return d; });

    var handle1 = sliderYearFirst.insert("circle", ".v4_slider_track-overlay")
            .attr("class", "v4_slider_handle")
            .attr("cx",0)
            .attr("r", 7);


    // define slider functionality
    function setHandle1(h) {
    // translates x position of slider (relative to overall slider width) handle into the scale of
    // xYearFirst within 1998-2012
    //orig:    var var_pos = handle1.attr("cx", xYearFirst(Math.round(h)));
        var var_pos = handle1.attr("cx", idxYearFirst(Math.round(h)));
        //svgFilter.style("background-color", d3.hsl(xYearFirst.invert(handle1.attr("cx")), 0.8, 0.8));
        updateFilterText();// kann man auch gleich getRangeText() aufrufen!!
        //console.log('++++++++++++++++++setHandle1: xYearFirst(Math.round(h)): ',xYearFirst(Math.round(h)));
    }
    function updateFilterText() {
//    var new_sliders_year_sel = getRangeText();
        var new_sliders_year_sel = idxYearFirst.invert(handle1.attr("cx")); //  gibt das jahr selektiert im slider zurück
        console.log('_ _ _ _ _ _ _ _ _ _updateFilterText: uiObj: ',uiObj);
        console.log('_ _ _ _ _ _ _ _ _ _updateFilterText: new_sliders_year_sel: ',new_sliders_year_sel);
        uiObj.slider = new_sliders_year_sel;
        update_viz();
    }
//obsolete: function getHandleCx() {
//obsolete:     console.log('...................getHandleCx: handle1.attr("cx"): ',handle1.attr("cx"));    // ..... nicht benötigt ?????????
//obsolete:     return [handle1.attr("cx")];
//obsolete: }
//obsolete: function getRangeText() {
//obsolete: // translates position (function setHandle1) into year of time period
//obsolete: //orig:    var valA = xYearFirst.invert(handle1.attr("cx"));                                      //  gibt das jahr selektiert im slider zurück
//obsolete:     var valA = idxYearFirst.invert(handle1.attr("cx"));                                      //  gibt das jahr selektiert im slider zurück
//obsolete:     console.log('___________________getRangeText: valA: ',valA);
//obsolete:     return valA;
//obsolete: }


//-------------------------------------------------------------------------------------------------------------------------------


    // initiate initial data binding
    update_viz();

    console.log('ready: initial drawing finshed ----------------------------------------------------');


//--- old position of data binding to button & slider events: .............. REMOVE
//
    //var h = xYearFirst.invert(d3.event.x);
//    sliderYearFirst.call(d3.drag()
//        .on("start drag", function() { setHandle1(xYearFirst.invert(d3.event.x)); }));

    //handle1.attr("cx", xYearFirst(Math.round(h)));
    //var value_slider = xYearFirst.invert(handle1.attr("cx"));
    //console.log('                                data binding: value_slider: ',value_slider);
    //uiObj.slider = value_slider;
    //update_viz();



//outdated    slider.on("change", function(){
//outdated        // receive current slider value (index) when moved:
//outdated        var current_idx = this.value;
//outdated
//outdated
//outdated        // + + new method controlling UI object:
//outdated        uiObj.slider = current_idx;
//outdated        update_viz();
//outdated    });


    //-----------------------------------------------------------------------------------------------------


    function update_viz() {

        // 1) select correct db
        console.log('%% update_viz: step 1: apply method dataObj.selectDB on uiObj.buttonsDBselection : ',
                        uiObj.buttonsDBselection,'+1 : ',
                        dataObj.selectDB(  uiObj.buttonsDBselection+1  )); // <-- this line selects (bound to logging)
                        //dataObj.selectDB( 3  ));

        // 2) decide whether show all years or time slice
        if (uiObj.buttonAllYears == 'on') {

            // 2.1) show all years: repeat method of sliceDB but without chosing a specific year (i.e. just
            //      conversion into correct data format):
            let jsonData_map_allY = {};
            let jsonData_ts_allY = {};
            dataObj.selected_db_map.volc.forEach(function(d,i) {
                    return jsonData_map_allY[i] = d;
            });
            dataObj.selected_db_ts.volc.forEach(function(d,i) {
                    return jsonData_ts_allY[i] = d;
            });

            data_map = jsonData_map_allY;
            data_ts  = jsonData_ts_allY;

            // update slider title
            let nVolcs = numberVolcanos(data_map);
            setup_slider_dyn_text("#svgTAR",nVolcs);

            // set dummy year for time-slice drawing in this case
            var year_requested = 2011;

        } else { // 2.2) if slicing: show year's selected by slider

// DOES THIS TAKE SLECTED DB ???? DOES THIS TAKE SLECTED DB ???? DOES THIS TAKE SLECTED DB ????
            // slice dataset:
            //year = dataObj.unique_years_of_selected_db[uiObj.slider];
            var year_requested = get_year_for_dataOb_slicing(dataObj,uiObj);
            // update data object (.selected_years):
            console.log('%% update_viz: step 2-2: apply slice method for selected year (slider pos.): ',uiObj.slider,dataObj.sliceDB(year_requested));

            data_map = dataObj.selected_years_map;
            data_ts  = dataObj.selected_years_ts;

            // update slider title
            let nVolcs = Object.keys(dataObj.selected_years_map).length;
            //console.log('%% update_viz: step 2-2: nVolcs (map):',numberVolcanos(dataObj.selected_years_map));
            setup_slider_dyn_text("#svgTAR",nVolcs);

            // test whether slicing works for time-series too:
            //console.log('%% update_viz: step 2-2: nVolcs (ts):',numberVolcanos(dataObj.selected_years_ts));

        };

        // before plotting graphs, remove circles in map (untouch land) and delete time-series completely
        d3.selectAll('g.dots').selectAll('circle').remove();
        // delete all time-series elements, but not hte overall container (avoid overdrawing for each UI ineraction)!
        d3.selectAll('g#container-ts.ts').select('g.xaxis').remove();
        d3.selectAll('g#container-ts.ts').select('g.yaxis').remove();
        d3.selectAll('g#container-ts.ts').select('text#ts-title').remove();
        d3.selectAll('g#container-ts.ts').selectAll('circle').remove();

        // skip empty data (which exist!) on updating plot:
        let noData_map = isEmpty(data_map);
        let noData_ts  = isEmpty(data_ts);
        //console.log('update_viz: empty year in time-sliced dataset (map)?:',noData_map);
        //console.log('update_viz: empty year in time-sliced dataset (ts) ?:',noData_ts);
        if (!noData_map && !noData_ts) {
            var spec_colors = draw_map01(data_map, land, svg, allMax_map);   // updating map plot
//      else if () {
        } else {
            //
            console.log('update_viz: year without data in selected db ',dataObj.name_of_selected_db);
            //throw '- Error: update_viz: exception found with empty years in the 2 data sets - compare arrays! -';
        };
        draw_ts(data_ts, year_requested, spec_colors, allMax_ts);        // always updating time-series plot

    }; // update_viz
}; // ready function




//-- coding graphs, map 1st
const draw_map01 = (volcano, land, svg, allMax) => {

    const thisVolc = Object.values(volcano);

    //parse data
    thisVolc.forEach(function(d) {
        d.coords = [+d.Lon, +d.Lat];
        d.magnitude = +d["SO2 kt"];
        d.date = parseDate(d["Time Eruption"]);
    });


    // also for time-slice version include sorting to avoid hidden circles
    // that are masked by nearby stronger volcanos drawn w/ bigger circles
    thisVolc.sort(function(a, b) {
        return a.magnitude > b.magnitude ? -1 : 1;
    });

    // scale incoming data:
    //
    // Radius scale
//v3:    var rScale = d3.scale.sqrt()
    var rScale = d3.scaleSqrt()
        //non-unified (i.e. individual db's) scaling of magnitude
        .domain(d3.extent(thisVolc, function(d) {
                return d.magnitude; }))
        // unified scaling:
        .domain([0, allMax])
        .range([1, 60]);

    // Color scale/marker
//v3:    var colorScale = d3.scale.ordinal()
    var colorScale = d3.scaleOrdinal()
        .domain(d3.extent(thisVolc, function(d) {
                return d.Volcano; }))
        .range(d3.schemeSet3);


    // draw land path 1st
//v3:    var land = svg.select('g.map').selectAll('path.land').data([land]);
    var land = svg.select('g.map').append('path').classed('land', true).data([land]);

//v3:    land.enter().append('path').classed('land', true);
//v3:    land.enter().classed('land', true);
    land.enter();
    land.attr('d', pathGenerator);
    land.exit().remove();


    // bind first data
    var theData = thisVolc;


    var circles = svg.select('g.dots').selectAll('circle.volcano_map').data(theData);

    circles.enter().append('circle')
            .classed('volcano_map', true)
            .attr('cx', function(d) {
                return projection(d.coords)[0];
            })
            .attr('cy', function(d) {
                return projection(d.coords)[1];
            })
            .attr('r', function(d) { return rScale(d.magnitude); })
            .attr('fill', function(d) { return colorScale(d.Volcano); })
            .attr('id', function(d) { return d.Volcano;} );


    circles.exit().remove();

    // add legend if not yet drawn:
    var legExists = document.getElementById('unifiedMapLegend')
    if(!legExists) map_legend_magnitude_size_circles(svg,"#svgTAR",rScale);
    var legExists = document.getElementById('unifiedMapLegend')


    // map title
/*
    const map_title= d3.select('g.map').append("text")
            .attr("id","map-title")
            .attr("x",0)
            .attr("y",0)
            .attr("transform", "translate("+map_title_x_pos+","+map_title_y_pos+")")
            .text("Global Distribution of Volcanic Eruptions");
*/

    console.log('draw_map01: drawing finshed -----------------------------------');
    return colorScale;
}; // const draw_map01



const draw_ts = (volcano, thisYear, colors, allMax) => {

    // note, nVolcs is different for same slice in the two types of graphs!
    let nVolcs_ts = numberVolcanos(volcano);

    // access object records key/vals
    let tsVolc = Object.values(volcano);


//v3:    const x = d3.time.scale(),
//v3:          y = d3.scale.linear(),
    const x = d3.scaleTime(),
          y = d3.scaleLinear(),
          x_label = "X", y_label = "Y";

    const series = d3.select('g.ts')
        .attr("id","container-ts")
        .attr("x",0)
        .attr("y",0);

    const x_axis = series.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + ts_height + ")")
            .attr('stroke', 'none');

    const y_axis = series.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(0,0)");


    // draw axis, scale first
    x.range([0, ts_width]);

    // ensure x axis scaling to be fixed for all days of year in case of individual years
    // otherwise ticks fidget according actual length of time record (of no data for first
    // month do not exist, for instance, these month are not considered on axis)

    if (uiObj.buttonAllYears == 'on') {
        const mindate = new Date(1998,0,1),
              maxdate = new Date(2012,11,31);
        x.domain([mindate, maxdate]);
//v3:        x_axis.call(d3.svg.axis().scale(x).orient("bottom").ticks(15));
        x_axis.call(d3.axisBottom(x).ticks(15));
    } else {
        const mindate = new Date(thisYear,0,1),
              maxdate = new Date(thisYear,11,31);
        x.domain([mindate, maxdate]);
//v3:        x_axis.call(d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%B")));
        x_axis.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B")));
    }

    y.range([ts_height, 0]);
    y.domain([0, 25]);
//v3:    y_axis.call(d3.svg.axis().scale(y).orient("left").ticks(6));
    y_axis.call(d3.axisLeft(y).ticks(6));

    // now rotate text on x axis
    // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
    // first move the text left so no longer centered on the tick
    // then rotate up to get 45 degrees.
    x_axis.selectAll("g.xaxis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
        // fit labels to 1st Jan tick marks:
        //return "translate(" + this.getBBox().height*-1 + "," + this.getBBox().height*1.4 + ")rotate(-45)";
        // fit labels to interval:
        return "translate(" + this.getBBox().height*1.3 + "," + this.getBBox().height*1.5 + ")rotate(-40)";
    });



    //parse data

    tsVolc.forEach(function(d) {
        d.magnitude = +d["SO2 kt"];
    });

    // re-order by magnitude
    tsVolc.sort(function(a, b) {
        return a.magnitude > b.magnitude ? -1 : 1;
    });

    // Radius scale
//v3:    var rScale = d3.scale.sqrt()
    var rScale = d3.scaleSqrt()
        .domain([0, allMax])
        .range([1, 10]);


    // draw time-series data ("object binding")
    let ts_circles = svg.select('g#container-ts.ts').selectAll('circle').data(tsVolc);

    ts_circles.enter().append('circle')
            .classed('volcano_ts', true)
            .attr('cx', function(d) {
                return x(get_time(d));
            })
            .attr('cy', function(d) {
                return y(d["Max Plume Height km"]);
            })
            .attr('r', function(d) {
                return rScale(d.magnitude);
            })
            .attr('fill', function(d) { return colors(d.Volcano); })
            .attr('stroke-width', 0.4)
            .attr('stroke', gray333)
            .attr('id', function(d) { return d.Volcano;} );

    ts_circles.exit().remove();

    // time series title
/*
    const ts_title= d3.select('g.ts').append("text")
            .attr("id","ts-title")
            .attr("x",0)
            .attr("y",0)
            .attr("transform", "translate("+ts_title_x_pos+","+ts_title_y_pos+")")
            .text("Corresponding Time-Series and Maximum Injection Altitudes");
*/
    // axis labels
    d3.select('g.ts').append("text")
            .attr("id","ts-y-label")
            .attr("x",0)
            .attr("y",0)
            .attr("transform", "translate(-31,72)rotate(-90)")
            .text("Altitude [km]");


    var legExists = document.getElementById('unifiedTSLegend')
    if(!legExists) ts_legend_magnitude_size_circles(svg,"#svgTAR",rScale);
    var legExists = document.getElementById('unifiedTSLegend')

}; // const draw_ts
//-- end viz main section - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - *

function get_time(obj) {
//v3:    return d3.time.format.iso.parse(obj["Time Eruption"]);
    return d3.isoParse(obj["Time Eruption"]);
}



//-- complementary functions - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - * - *
//outdated function setup_slider(thisSVG,mapID,yearArr,iniVal) {
function setup_slider_title(thisSVG,mapID,yearArr,iniVal) {

//outdated            const addSlider = d3.select(mapID).append("input")
//outdated                    .attr("id", "slider_input")
//outdated                    .attr("class", "slider_input_volc")
//outdated                    .attr("type", "range")
//outdated                    .attr("min", 0)
//outdated                    .attr("max", yearArr.length-1)
//outdated                    .attr("step", 1)
//outdated                    .attr("value", iniVal)
//outdated                    .attr("transform", "translate(0,0)");


            const slider_static_title = svg.append("g")
                    .attr("class", "slider_title")
                    .attr("transform", "translate("+slider_label_x_pos+","+slider_label_y_pos+")")
                    .append("text")
                    .attr("font-size",14)
                    .attr("fill",orange03)
                    .text("Number of Volcanos:");

            const slider_dyn_title = d3.select('g.slider_title').append("text")
                    .attr("id","textSliderDynToggle")
                    .attr("x",140)
                    .attr("y",0)
                    .attr("font-size",14)
                    .attr("fill",orange03)
                    .text("[numberEruptions]")

//outdated            return addSlider;
};
function slider_axis_scale(svg,yearArr) {

//v3:            const slider_scale = d3.scale.ordinal()
//            const slider_scale = d3.scaleOrdinal()
//                    .domain(yearArr)
//v3:                    .rangeRoundBands([0, 600], .1);
            const slider_scale = d3.scaleBand()
                    .domain(yearArr)
                    .range([0, 600], .1);

//v3:            const slider_axis = d3.svg.axis()
//v3:                    .scale(slider_scale)
//v3:                    .orient("bottom");

            const slider_axis = d3.axisBottom(slider_scale);

            svg.append("g")
                    .attr("class", "slider_axis")
                    .attr("transform", "translate(" + (width - margin.slider) + ",45)")
                    .call(slider_axis);
};
function setup_slider_dyn_text(mapID,nEruptions) {
            // applying method of 'update_button_text_reference'
            d3.select("#textSliderDynToggle").text(nEruptions);
};
// taken from map10 and tidied up:
function setup_buttons(svg,btnID,dims,offsets,dbSelection,labels,btnText,choseText) {

            // dimensional settings
            const bWidth = 20; //button width
            const bHeight= 20; //button height
            const x0= 20; //x offset
            const y0= 20; //y offset
            //fontawesome button labels possible


            //container for all buttons
            const allButtons= svg.append("g")
                    .attr("id",btnID)
                    .attr("transform", "translate("+dims[0]+","+dims[1]+")");


            //groups for each button (holding a rect and text)
            const buttonGroups= allButtons.selectAll("g.button")
                    .data(labels)
                    .enter()
                    .append("g")
                    .attr("class",function(d,i) {
                        console.log('setup_buttons: adding classes: ',d,i);
                        if(dbSelection[i]==1) {
                                return "button default";
                        } else {
                                return "button";
                        };
                    })
                    .style("cursor","pointer")
                    .on("mouseover", function() {
                        if (d3.select(this).select("rect").attr("fill") != btn_pressedColor) {
                                d3.select(this)
                                    .select("rect")
                                    .attr("fill",btn_hoverColor);
                        }
                    })
                    .on("mouseout", function(d,i) {
                        console.log('setup_buttons: mouseout: ',d,i);
                        if (d3.select(this).select("rect").attr("fill") != btn_pressedColor) {
                                d3.select(this)
                                    .select("rect")
                                    .attr("fill",btn_defaultColor);
                        }
                    })


            //adding a rect to each toggle button group
            //rx and ry give the rect rounded corner
            buttonGroups.append("rect")
                    .attr("class","buttonRect")
                    .attr("width",bWidth)
                    .attr("height",bHeight)
                    .attr("x",x0)
                    .attr("y",function(d,i) {
                        return offsets[i];
                    })
                    .attr("rx",5)
                    .attr("ry",5)
                    .attr("fill",btn_defaultColor)
                    .attr("stroke",gray69)
                    .attr("stroke-width","1");


            // highlight preselection with correct button shade (btnSet1 only):
            const defaultButton = allButtons.selectAll("g.button.default").select("rect");
            defaultButton.attr("fill",btn_pressedColor);


            // add button description
            additional_button_text(buttonGroups,bWidth,dims,offsets,btnText,choseText);


            if(choseText == "DB") {
                    const ypos = 170;
                    const y0= 30;
                    const refText1= d3.select('g#btnSet1').append("text")
                            .attr("id","textRef")
                            .attr("x",20)
                            .attr("y",ypos)
                            .attr("fill",orange03)
                            .attr("font-size",12)
                            .text("Reference:");

                update_button_text_reference(dbSelection,choseText);
            };

            return buttonGroups;
};
function updateButtonColors(button, parent) {
            parent.selectAll("rect")
                    .attr("fill",btn_defaultColor)

            button.select("rect")
                    .attr("fill",btn_pressedColor)
};
function updateOnOffButtonColors(button){
            var currentColor =button.select('rect').style("fill");

            // if colors imported from css, the conditional statement does not work anymore
            // workaround: set orange02 explicitely as rgb value (string/variable problem? cannot trace back)
            //currentColor = currentColor == orange02 ? btn_defaultColor : orange02;
            currentColor = currentColor == "rgb(231, 189, 114)" ? btn_defaultColor : orange02;

            const showAllYears = currentColor == orange02 ? 'on' : 'off';

            return [button.select('rect').style("fill", currentColor),showAllYears];
};
function additional_button_text(buttons,bWidth,dims,offsets,btnText,choseText) {

            const description1= d3.select('g#btnSet1').append("text")
                    .attr("id","textButtonTitle")
                    .attr("x",14)
                    .attr("y",0)
                    .attr("fill",orange03)
                    .attr("font-size",14)
                    .text("Choose Dataset");

            const description2= buttons.select('g#btnSet1')
                    .data(btnText, function(d) { return d; }).enter()
                    .append('text')
                    .attr("id","dbDescription")
                    .attr("x",60)
//                     .attr("y",20)
                    .attr("y", function(d,i) {
                                return 15+offsets[i];
                    })
                    .attr("fill",orange03)
                    .attr("font-size",12)
                    .text(function(d,i) {
                                return d;
                    });

            //pre-define text that the DB radio buttons will toggle
            if(choseText == "DB") {
                const ypos = 170;
                const number = d3.select('g#btnSet1').append("text")
                    .attr("id","textRefToggle")
                    .attr("x",20)
                    .attr("y",ypos+dims[3])
                    .attr("fill",orange03)
                    .attr("font-size",12)
                    .text("[click a button]") // <--- just inital something
            }
};
function update_button_text_reference(dbSelection,choseText) {

            // does this still has any purpose?
            if(choseText == "DB") {
                    dbRefs.forEach(function(d,i) {
                        //console.log('update_button_text_reference: dbRefs: d,i: ',d,i);
                        //console.log('update_button_text_reference: dbRefs: dbSelection[i]: ',dbSelection[i]);
                        if (dbSelection[i] == 1)  addText = d;
                    });
            } else {
                throw '- Error update_button_text_reference -';
            };

            console.log('update_button_text_reference: dbSelection,thisText:',dbSelection,choseText);
            console.log('update_button_text_reference: addText:',addText);

            // update reference on button toggle (also set default):
            const refText2= d3.select("#textRefToggle").text(addText)
};

//-- generalized mapping utilities:
function map_legend_magnitude_size_circles(thisSVG,thisID,thisScale,){

    var circleRadii = [5000, 1000, 100];   // representing well VolcDB1 magnitudes

    // convert radii array into scaled values:
    var dy = [];
    circleRadii.forEach(function(d) {
        dy.push(thisScale(d));
    });

    // draw legend circles:
    thisSVG.append('g').classed('legend' , true)
                    .attr("id","unifiedMapLegend")
                    .attr("transform", "translate("+map_legend_x_pos+","+map_legend_y_pos+")")


    var legCircles = thisSVG.selectAll('g.legend').selectAll('g.legendCell')
                    .data(circleRadii, function(d) { return d; })
                    .enter().append('circle').classed('legendCell', true);

    legCircles.attr('cx',0)
                    .attr('cy', function(d,i) {
                            return dy[i];
                    })
                    .attr('r', function(d,i) {
                            return thisScale(d);
                    })
                    .style("fill", "none")
                    .attr('stroke-width', 1)
                    .attr('stroke', orange03)
                    .style("stroke-dasharray", ("3, 3")) ;

    // magnitude scale marker
    thisSVG.append('g').classed('legenditems', true).attr("transform", "translate(80,20)");

    const tsLegTextXPos = [-16,-16,-13];

    var legText = thisSVG.select('g.legenditems').selectAll('text.legendText')
        .data(circleRadii, function(d) { return d; }).enter()
        .append("text").classed('legendText', true)
        .attr("x",function(d,i) {return tsLegTextXPos[i];})
        .attr('y',function(d,i) {
            if(i==0){
                return map_legend_y_pos+(dy[i]*1.52);  // 5000
            } else if (i==1) {
                return map_legend_y_pos+(dy[i]*1.7);
            } else {
                return map_legend_y_pos+(dy[i]);
            }
        })
        .attr('fill',orange03).attr("font-size","10px")
        .text(function (d) {return d;});

    // title
    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",44).attr("y",19)
        .attr('fill',orange03).attr("font-size","10px")
        //.text(thisText);
        .text("Map Legend:");

    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",12).attr("y",34)
        .attr('fill',orange03).attr("font-size","10px")
        //.text(thisText);
        .text("Cumulative Annual Emissions");

    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",50).attr("y",48)
        .attr('fill',orange03).attr("font-size","10px")
        .call(subscript_text,"SO", "2"," in [kt]");

}
function ts_legend_magnitude_size_circles(thisSVG,thisID,thisScale){

    const circleRadii_ts = [2000,1000, 100];   // representing magnitudes of t-s, max of db2

    const tsLegYPos = [60,30,6];

    // convert radii array into scaled values:
    var dy = [];
    circleRadii_ts.forEach(function(d) {
        dy.push(thisScale(d));
    });

    // draw legend circles:
    thisSVG.append('g').classed('legend' , true)
                    .attr("id","unifiedTSLegend")
                    .attr("transform", "translate("+ts_legend_x_pos+","+ts_legend_y_pos+")")


    var legCircles = thisSVG.selectAll('g#unifiedTSLegend.legend').selectAll('g.legendCell')
                    .data(circleRadii_ts, function(d) { return d; })
                    .enter().append('circle').classed('legendCell', true);

    legCircles.attr('cx',0)
                    .attr('cy', function(d,i) {
                            return tsLegYPos[i];
                    })
                    .attr('r', function(d,i) {
                            return thisScale(d);
                    })
                    .style("fill", "none")
                    .attr('stroke-width', 1)
                    .attr('stroke', orange03)
                    .style("stroke-dasharray", ("3, 3")) ;

    // magnitude scale marker
    thisSVG.append('g').classed('legenditemsTS', true).attr("transform", "translate("+ts_legend_x_pos+","+ts_legend_y_pos+")");

    const tsLegTextXPos = [17,17,17];
    const tsLegTextYPos = [64,34,8];

    var legText = thisSVG.select('g.legenditemsTS').selectAll('text.legendTextTS')
        .data(circleRadii_ts, function(d) { return d; }).enter()
        .append("text").classed('legendTextTS', true)
        .attr("x",function(d,i) {return tsLegTextXPos[i];})
        .attr('y',function(d,i) {return tsLegTextYPos[i];})
        .attr('fill',orange03).attr("font-size","10px")
        .text(function (d) {return d;});


    // title
    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",13).attr("y",519)
        .attr('fill',orange03).attr("font-size","10px")
        //.text(thisText);
        .text("Time-Series Legend:");

    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",13).attr("y",534)
        .attr('fill',orange03).attr("font-size","10px")
        //.text(thisText);
        .text("Per Eruption Emitted");

    thisSVG.append("text").attr("class", "legendTitle")
        .attr("x",13).attr("y",548)
        .attr('fill',orange03).attr("font-size","10px")
        .call(subscript_text,"Mass SO", "2"," in [kt]");

}


//-- html markup utilities:
function subscript_text(selection, text1, sub, text2) {
    console.log('subscript_text: selection: ',selection);
     selection.selectAll("tspan").remove();
     selection.append("tspan")
        .text(text1);
     selection.append("tspan")
        .attr("baseline-shift", "sub")
        .style("font-size", "60%")
        .text(sub)
     selection.append("tspan")
        .text(text2);
};

//-- data utility functions:

// find overall max
function find_overall_max(arr) {
    var mag = [];
    arr.forEach(function(d,i) {
            return mag.push(+d["SO2 kt"]);
            });

    var mx = Math.max.apply(null, mag);
    return mx;
};
function get_info_all_years_obj(items) {
// this function extracts the information of years from the dataset
// in order to build robust & light weight slider (object version)
        console.log('get_info_all_years_obj: ',items);
        console.log('get_info_all_years_obj: ',items.volc);
        var ay = [];
        Object.keys(items).forEach(function(d,i) {
            let tmp = items[d];
            console.log('get_info_all_years_obj: date extracted: ', i,d,tmp);
            tmp.forEach(function(a) {
                console.log('get_info_all_years_obj: inner loop : ',parseYear(parseDate(a["Time Eruption"])));
                ay.push(parseYear(parseDate(a["Time Eruption"])) );
            });
        });
        console.log('get_info_all_years_obj: ay: ',ay);
        console.log('get_info_all_years_obj: unique_years?: ',d3.set(ay).values());
        return ay
};
function sel_unique_years(items) {
// extracting unique unique_years_of_selected_db
// https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md, section "sets"
// Returns an array of the string values in this set. The order of the returned values
// is arbitrary. Can be used as a convenient way of computing the unique values for a
// set of strings. For example:
//d3.set(["foo", "bar", "foo", "baz"]).values(); // "foo", "bar", "baz"
        console.log('sel_unique_years: ',d3.set(items).values());
        return d3.set(items).values();
};
function get_year_for_dataOb_slicing(dataObj,uiObj) {
// this just returns the corresponding year (string) od slider position
// called twice: on setting intial dataObj and un update_viz()
//
        return dataObj.unique_years_of_selected_db[uiObj.slider];
};
function numberVolcanos(obj) {
// extracts number of individual json key-value pairs
    return Object.keys(obj).length;
}
function isEmpty(obj) {
//https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
   for (var x in obj) { return false; }
   return true;
}
