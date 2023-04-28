import React, { Component } from "react";
import C3Chart from 'react-c3js';
import 'c3/c3.css';

class DoughnutGraph extends Component {
  state = {
    graphTitle: "Website traffic"
  };
  
  render() {
    const data = {
      type: 'donut',
      columns: [
        ['Mobile', 28],
        ['Desktops', 17.5],
        ['Tablets', 54.5],
    ], 
    
    //  onclick: function (d, i) { console.log("onclick", d, i); },
    //  onmouseover: function (d, i) { console.log("onmouseover", d, i); },
    //  onmouseout: function (d, i) { console.log("onmouseout", d, i); }
  };

  const colors = {
    pattern : ['#4ac18e','#6d60b0','#5468da'] 
  };

    return (
      <div className="col-xl-4">
        <div className="card m-b-20">
          <div className="card-body">
    <h4 className="mt-0 header-title">{this.state.graphTitle}</h4>

            <ul className="list-inline widget-chart m-t-20 m-b-15 text-center">
              <li className="list-inline-item">
                <h5 className="mb-0">25610</h5>
                <p className="text-muted font-14">Total</p>
                <h5 className="mb-0">25610</h5>
                <p className="text-muted font-14">Used</p>
              </li>
            </ul>

            <div align="center">
              <C3Chart data={data} color={colors} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DoughnutGraph;
