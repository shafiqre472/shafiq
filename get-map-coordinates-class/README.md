# Show map coordinates info + Google integration URL (class)

This widget displays the latitude/longitude, scale, zoom, tilt, rotation and a link to Google Map 3D.
Based on the [ArcGIS for Developers Tutorials](https://developers.arcgis.com/labs/experiencebuilder/get-map-coordinates/).

This widget is written as a Class-based component.

## How to use the sample

Unzip to the `client/your-extensions/widgets` folder of your Experience Builder installation.

## How it works

Within `widget.tsx`, a reference to the Map object is acquired using the `JimuMapViewComponent` module. That reference is used in the `activeViewChangeHandler` function to create two watchers: one on when the extent changes, and one on when the pointer moves within the view.  It calculates the Tilt if the map is a 3D scene. 

