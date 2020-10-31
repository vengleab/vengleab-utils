import React, { Component } from 'react';
import MySideBar from '../MySideBar';

export default class Layout extends Component {
  render() {
    return (
        <div>
          <div className="side-bar">
            <MySideBar />
          </div>
          <div className="content">{this.props.children}</div>
        </div>
    );
  }
}
