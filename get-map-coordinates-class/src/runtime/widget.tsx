/* eslint-disable @typescript-eslint/semi */
/* eslint-disable @typescript-eslint/quotes */
/** @jsx jsx */
/**
  Licensing

  Copyright 2022 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
import { React, AllWidgetProps, jsx } from "jimu-core";
import { IMConfig } from "../config";
import { JimuMapView, JimuMapViewComponent } from "jimu-arcgis";
import { WidgetPlaceholder } from 'jimu-ui';  // required for detecting if we are in play mode or in edit mode

import '../index.css';  // my own shite font 
 
import Point from "esri/geometry/Point";

import defaultMessages from "./translations/default";

const squareCrossIcon = require('./assets/target-square-cross.svg'); // icon that will appear in the editor as you drag the widget in.


interface IState {
  latitude: string;
  longitude: string;
  scale: number;
  zoom: number;
  tilt: string;
  rotation: string;
  height: string;
  Google3dUrl : string;
  centroidlatitude: string;
  centroidlongitude: string;
  showPopup: boolean;
  mapViewReady: boolean;
}

export default class Widget extends React.PureComponent<
  AllWidgetProps<IMConfig>,
  IState
> {
  state = {
    latitude: "",
    longitude: "",
    scale: 0,
    zoom: 0,
    tilt: "",
    rotation : "",
    height: "",
    Google3dUrl: "",
    centroidlatitude: "",
    centroidlongitude: "",
	showPopup: false,
    mapViewReady: false
  };

  
  getAltidude = ( zoomLevel : number ) => {
    let mAltitude = 220
    // this needs to be tweaked. 
    switch(zoomLevel) {
      case 10:
        mAltitude = 121215;
        break;
      case 11:
        mAltitude = 60523;
        break;
      case 12:
        mAltitude = 32138;
        break;
      case 13:
        mAltitude = 16032; 
        break;
      case 14:
        mAltitude = 8027; 
        break;
      case 15:
        mAltitude = 3185; 
        break;
      case 16:
        mAltitude = 2007; 
        break;
      case 17:
        mAltitude = 993; 
        break;
      case 18:
          mAltitude = 489;
        break;
      case 19:
          mAltitude = 274;
        break;
      case 20:
        mAltitude = 129;
        break;
      case 21:
        mAltitude = 90;
        break;
      default:
        mAltitude = 220;
        // code block
    }
    return (mAltitude);
  }

  activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      // When the extent moves, update the state with all the updated values.
      jmv.view.watch("extent", evt => {
        // console.log (jmv.view.center);
        

        if (jmv.view.center)
        {
          this.setState({
            latitude: jmv.view.center.latitude.toFixed(5),
            longitude: jmv.view.center.longitude.toFixed(5),
            scale: Math.round(jmv.view.scale * 1) / 1,
            zoom: jmv.view.zoom,   
            rotation : jmv.view.viewpoint.rotation.toFixed(1),   // 359.1º
            // this is set to false initially, then once we have the first set of data (and all subsequent) it's set
            // to true, so that we can hide the text until everything is ready:
            mapViewReady: true
          });
          // only set height and tilt if we have a camera 3D
          if (jmv.view.viewpoint.camera)  {
              this.setState({
                height: jmv.view.height.toFixed(5),
                tilt: jmv.view.viewpoint.camera.tilt.toFixed(0)
                // Altitude will be incorrect/inaccurate
                Google3dUrl : "https://www.google.com/maps/place/@"+  this.state.latitude +","+ this.state.longitude +",251a,35y,"+this.state.rotation+"h,"+this.state.tilt+"t/data=!3m1!1e3";
              })
          }
          else {
            // we are in 2D but we still want googlemap link, assuming tilt=0
            this.setState({
              // Altitude will be incorrect/inaccurate
              Google3dUrl : "https://www.google.com/maps/place/@"+  this.state.latitude +","+ this.state.longitude +",251a,35y,"+this.state.rotation+"h,0t/data=!3m1!1e3";
            })
          }
        }
        else{
          console.log ("-error jmv.view.center.latitude");  
        }
      });

      // When the pointer moves, take the pointer location and create a Point
      // Geometry out of it (`view.toMap(...)`), then update the state.
      jmv.view.on("pointer-move", evt => {
        
        const point: Point = jmv.view.toMap({
          x: evt.x,
          y: evt.y
        });

        const centroidPoint: Point = jmv.view.toMap({
          x: jmv.view.size[0]/2,
          y: jmv.view.size[1]/2
        });

       if (point) {
          // console.log ("point = X="+point.x+ " y="+point.y);
          this.setState({
            latitude: point.latitude.toFixed(5),
            longitude: point.longitude.toFixed(5),
            scale: Math.round(jmv.view.scale * 1) / 1,
            zoom: jmv.view.zoom,
            rotation : jmv.view.viewpoint.rotation.toFixed(1),   
            mapViewReady: true
          });
          // for google maps, we use the centroid of the map view (not the mouse pointer, ideally)
          if (centroidPoint) {
            this.state.centroidlatitude = centroidPoint.latitude.toFixed(5);
            this.state.centroidlongitude = centroidPoint.longitude.toFixed(5);
          }
          else 
          {
            this.state.centroidlatitude = point.latitude.toFixed(5);
            this.state.centroidlongitude = point.longitude.toFixed(5);
          }
          // only set height and tilt if we have a camera 3D
          if (jmv.view.viewpoint.camera) 
          {
            // only if we are in 3D (no camera in 2D)
            this.setState({
              height: jmv.view.height.toFixed(5),
              tilt: jmv.view.viewpoint.camera.tilt.toFixed(0)
              Google3dUrl : "https://www.google.com/maps/place/@"+  this.state.centroidlatitude +","+ this.state.centroidlongitude +",251a,35y,"+this.state.rotation+"h,"+this.state.tilt+"t/data=!3m1!1e3";
            });
          }  
          else {
            this.state.height = this.getAltidude(this.state.zoom).toString();
            // we are in 2D but we still want googlemap link, assuming tilt 0
            this.setState({
              height: this.getAltidude(this.setState.zoom).toString();
              Google3dUrl : "https://www.google.com/maps/place/@"+  this.state.centroidlatitude +","+ this.state.centroidlongitude +","+this.state.height+"a,35y,"+this.state.rotation+"h,0t"+","+this.state.height +"m"+"/data=!3m1!1e3";
            })
          }
        }
        else
        {
          console.log ("WARNING NO point ?!");
        }
      });
    }
  };
		togglePopup = () => {
	this.setState({ showPopup: !this.state.showPopup });
	};
 
  render() {
    let sections = [];
    let content = null;  // stores the html div
    const useMapWidget = this.props.useMapWidgetIds && this.props.useMapWidgetIds[0]
   
    // prepare the lat-long text line (start):
    sections.push(
      <span>
        {defaultMessages.latLon} {this.state.latitude} {this.state.longitude}
      </span>
    );
    // if some settings are toggled ON, then add them:    
    if (this.props.config.showZoom === true) {
      sections.push(<span>Zoom {this.state.zoom.toFixed(0)}</span>);
    }
    if (this.props.config.showScale === true) {
      sections.push(<span>Scale 1:{this.state.scale}</span>);
    }
    if (this.props.config.showTilt === true) {
      sections.push(<span>Tilt {this.state.tilt}º</span>);
    }
    if (this.props.config.showRotation === true) {
      sections.push(<span>Rotation {this.state.rotation}º</span>);
    }

  

    // We have 1, 2, or 3 JSX Elements in our array, we want to join them
    // with " | " between them. You cannot use `sections.join(" | ")`, sadly.
    // So we use array.reduce(...) to return an array of JSX elements.
    const allSections = sections.reduce((previousValue, currentValue) => {
      return previousValue === null
        ? [currentValue]
        : [...previousValue, " | ", currentValue];
    }, null);

    if (!useMapWidget) {
        content = (
          <div className='widget-get-map-coordinates'>
            {/* <WidgetPlaceholder icon={squareCrossIcon} autoFlip message={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} /> */}
            <WidgetPlaceholder icon={squareCrossIcon} autoFlip message={"please select a map"} widgetId={this.props.id} />
            
          </div>
      )}
      else {
        content = (
          // <div className="widget-get-map-coordinates jimu-widget m-2">
          <div className="widget-get-map-coordinates">
          {this.props.hasOwnProperty("useMapWidgetIds") &&
            this.props.useMapWidgetIds &&
            this.props.useMapWidgetIds.length === 1 && (
              <JimuMapViewComponent
                useMapWidgetId={this.props.useMapWidgetIds?.[0]}
                onActiveViewChange={this.activeViewChangeHandler}
              />
            )}
          
          {/* Only show the data once the MapView is ready */}
          <p align="right">
	{this.state.mapViewReady === true ? allSections : defaultMessages.latLonWillBeHere}
	{" | "}
	<a href="#" onClick={(e) => { e.preventDefault(); this.togglePopup(); }}>[Peta Google]</a>
	</p> {this.state.showPopup && (
  <div style={{
    position: "fixed", top: "10%", left: "10%", width: "80%", height: "80%",
    backgroundColor: "white", border: "2px solid #888", zIndex: 9999, padding: "10px"
  }}>
    <div style={{ textAlign: "right" }}>
      <button onClick={this.togglePopup}>Tutup</button>
    </div>
    <iframe
      width="100%" height="95%" style={{ border: "none" }}
      src={`https://www.google.com/maps?q=${this.state.centroidlatitude},${this.state.centroidlongitude}&hl=es;z=${this.state.zoom}&output=embed`}
      allowFullScreen
    ></iframe>
  </div>
)}


          </div>
        )
      }
    return (
      content
    );
  }
}
