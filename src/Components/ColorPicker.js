import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

export default function ColorPicker(props) {
  useEffect(() => {
    const overlay = document.querySelector('.overlay');
    overlay.addEventListener('click', () => {
      props.closeColorPicker();
    });
  }, [props]);

  const changeTheme = (hue) => {
    const root = document.documentElement;
    root.style.setProperty('--themeHue', hue);
  }

  const themes = [];
  for (let hue = 0; hue < 330; hue += 30) {
    themes.push(hue);
  }
  const themeBtns = themes.map((hue, idx) => (
    <button onClick={() => changeTheme(hue)} key={idx} style={{ backgroundColor: `hsl(${hue}, 50%, 30%)` }} className="themeBtn"></button>
  ));

  return (
    <div>
      <div className="overlay" hidden={!props.show}></div>
      <div id="colorPicker" className={props.show ? 'show' : null}>
        {themeBtns}
      </div>
    </div>
  );
}

ColorPicker.propTypes = {
  show: PropTypes.bool,
  closeColorPicker: PropTypes.func,
}