import React, { Component } from 'react';
import Head from 'next/head';
import MySideBar from '../MySideBar';

export default class Layout extends Component {
  render() {
    return (
      <>
        <Head>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
          />
          <title>{this.props.title}</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <div >
          <div className="side-bar">
            <MySideBar />
          </div>
          <div className="content">{this.props.children}</div>
        </div>
      </>
    );
  }
}
