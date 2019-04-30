import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ColorPicker extends Component{
  constructor(props) {
    super(props);
    this.themes = [];
    for ( let hue = 0; hue < 330; hue+= 30 ) {
      this.themes.push(hue);
    }
    this.changeTheme = this.changeTheme.bind(this);
  }

  componentDidMount() {
    const overlay = document.querySelector('.overlay');
    overlay.addEventListener('click', () => {
      this.props.closeColorPicker();
    })
  }

  changeTheme(hue) {
    const root = document.documentElement;
    root.style.setProperty('--themeHue', hue);
  }

  render() {
    const themeBtns = this.themes.map((hue, idx) => (
      <button onClick={() => this.changeTheme(hue)} key={idx} style={{ backgroundColor: `hsl(${hue}, 50%, 30%)`}} className="themeBtn"></button>
    ))
    return (
      <div>
        <div className="overlay" hidden={ !this.props.show }></div>
        <div id="colorPicker" className={ this.props.show ? 'show': null }>
          {themeBtns}
        </div>
      </div>
    )
  }
}

ColorPicker.propTypes = {
  show: PropTypes.bool,
  closeColorPicker: PropTypes.func,
}