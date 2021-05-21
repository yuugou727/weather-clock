import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';

const ColorPicker = memo(function(props) {
  useEffect(() => {
    const overlay = document.querySelector('#colorPickerOverlay');
    const clickListener = () => {
      props.closeColorPicker();
    };
    overlay.addEventListener('click', clickListener);
    return () => {
      overlay.removeEventListener('click', clickListener);
    }
  }, [props.show]);

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
      <div id="colorPickerOverlay" className="overlay" hidden={!props.show}></div>
      <div id="colorPicker" className={props.show ? 'show' : null}>
        {themeBtns}
      </div>
    </div>
  );
})

ColorPicker.propTypes = {
  show: PropTypes.bool,
  closeColorPicker: PropTypes.func,
}

export default ColorPicker;